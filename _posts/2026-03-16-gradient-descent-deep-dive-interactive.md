---
layout: post
title: "Gradient Descent Deep Dive: From SGD to Adam - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Explore gradient descent optimizers interactively. Race SGD, Momentum, RMSProp, and Adam side-by-side, tune learning rates, escape saddle points, and compare mini-batch vs batch - all in your browser."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
date: 2026-03-17
---

<style>
.interactive-demo {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.2rem;
  margin: 1.5rem 0;
  background: var(--bg-secondary);
  overflow: hidden;
}
.interactive-demo canvas {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  border-radius: 8px;
  cursor: crosshair;
}
.demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}
.demo-controls label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
}
.demo-controls input[type="range"] {
  width: 160px;
  accent-color: var(--accent);
}
.demo-controls button {
  padding: 0.4rem 1rem;
  border: 1px solid var(--accent);
  border-radius: 6px;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: background 0.15s, color 0.15s;
}
.demo-controls button:hover {
  background: var(--accent);
  color: var(--bg-primary);
}
.demo-controls .demo-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  min-width: 4rem;
}
.demo-info {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
}
.demo-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 640px) {
  .demo-split { grid-template-columns: 1fr; }
  .demo-controls input[type="range"] { width: 120px; }
}
.demo-caption {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.4rem;
}
.demo-hint {
  background: var(--bg-secondary);
  border-left: 3px solid var(--accent);
  padding: 0.6rem 0.9rem;
  margin: 1rem 0;
  border-radius: 0 6px 6px 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.lr-trio {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}
@media (max-width: 640px) {
  .lr-trio { grid-template-columns: 1fr; }
}
.lr-trio-item {
  text-align: center;
}
.lr-trio-item canvas {
  width: 100%;
}
.lr-trio-item .lr-label {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.optimizer-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.82rem;
}
.optimizer-legend span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.summary-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.85rem;
}
.summary-table th, .summary-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}
.summary-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
</style>

<script>
// Shared utilities for all gradient descent demos
window.GD = (function() {
  function getColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg: dark ? '#1a1b26' : '#ffffff',
      text: dark ? '#c0caf5' : '#1a1b26',
      textMuted: dark ? '#565f89' : '#6b7280',
      grid: dark ? '#292e42' : '#e5e7eb',
      point: dark ? '#7aa2f7' : '#2563eb',
      pointStroke: dark ? '#3d59a1' : '#1d4ed8',
      line: dark ? '#ff9e64' : '#e63946',
      error: dark ? 'rgba(247,118,142,0.35)' : 'rgba(230,57,70,0.2)',
      errorStroke: dark ? '#f7768e' : '#e63946',
      accent: dark ? '#9ece6a' : '#16a34a',
      path: dark ? '#9ece6a' : '#16a34a',
      btnBg: dark ? '#292e42' : '#f3f4f6',
      sgd: '#f7768e',
      momentum: '#7aa2f7',
      rmsprop: '#ff9e64',
      adam: '#9ece6a',
      contourLow: dark ? '#1a1b26' : '#eef2ff',
      contourHigh: dark ? '#7aa2f7' : '#2563eb'
    };
  }

  function setupCanvas(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
  }

  // Loss surface: modified Rosenbrock scaled to [-2,2] x [-1,3]
  // f(x,y) = (1-x)^2 + 10*(y - x^2)^2
  function rosenbrock(x, y) {
    return (1 - x) * (1 - x) + 10 * (y - x * x) * (y - x * x);
  }
  function rosenbrockGrad(x, y) {
    var dx = -2 * (1 - x) + 10 * 2 * (y - x * x) * (-2 * x);
    var dy = 10 * 2 * (y - x * x);
    return { dx: dx, dy: dy };
  }

  // Beale's function for interesting surface: f(x,y) = (1.5-x+xy)^2 + (2.25-x+xy^2)^2 + (2.625-x+xy^3)^2
  function beale(x, y) {
    var a = 1.5 - x + x * y;
    var b = 2.25 - x + x * y * y;
    var c = 2.625 - x + x * y * y * y;
    return a * a + b * b + c * c;
  }
  function bealeGrad(x, y) {
    var a = 1.5 - x + x * y;
    var b = 2.25 - x + x * y * y;
    var c = 2.625 - x + x * y * y * y;
    var dx = 2 * a * (-1 + y) + 2 * b * (-1 + y * y) + 2 * c * (-1 + y * y * y);
    var dy = 2 * a * x + 2 * b * 2 * x * y + 2 * c * 3 * x * y * y;
    return { dx: dx, dy: dy };
  }

  // Saddle surface: f(x,y) = x^2 - y^2
  function saddle(x, y) {
    return x * x - y * y;
  }
  function saddleGrad(x, y) {
    return { dx: 2 * x, dy: -2 * y };
  }

  // Elongated bowl: f(x,y) = x^2 + 50*y^2
  function elongated(x, y) {
    return x * x + 50 * y * y;
  }
  function elongatedGrad(x, y) {
    return { dx: 2 * x, dy: 100 * y };
  }

  // Draw contour plot on a canvas context
  function drawContours(ctx, w, h, lossFn, xMin, xMax, yMin, yMax, colors, numLevels) {
    numLevels = numLevels || 30;
    var pad = 40;
    var pw = w - 2 * pad;
    var ph = h - 2 * pad;

    // Compute loss grid
    var res = 120;
    var grid = [];
    var minVal = Infinity, maxVal = -Infinity;
    for (var i = 0; i <= res; i++) {
      grid[i] = [];
      for (var j = 0; j <= res; j++) {
        var x = xMin + (xMax - xMin) * j / res;
        var y = yMin + (yMax - yMin) * i / res;
        var v = lossFn(x, y);
        // Clamp for visualization
        v = Math.min(v, 500);
        grid[i][j] = v;
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }
    }

    // Use log scale for better visualization
    var logMin = Math.log(minVal + 1);
    var logMax = Math.log(maxVal + 1);

    // Draw filled contour as a raster image
    var imgData = ctx.createImageData(1, 1);
    var cellW = pw / res;
    var cellH = ph / res;

    // Parse colors for interpolation
    function hexToRgb(hex) {
      var r = parseInt(hex.slice(1, 3), 16);
      var g = parseInt(hex.slice(3, 5), 16);
      var b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    }

    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    // Color palette for contours
    var palette = dark
      ? [[26, 27, 38], [40, 50, 90], [60, 80, 140], [80, 120, 200], [122, 162, 247]]
      : [[238, 242, 255], [199, 210, 254], [165, 180, 252], [99, 132, 247], [37, 99, 235]];

    for (var i = 0; i <= res; i++) {
      for (var j = 0; j <= res; j++) {
        var v = grid[i][j];
        var t = (logMax > logMin) ? (Math.log(v + 1) - logMin) / (logMax - logMin) : 0;
        t = Math.max(0, Math.min(1, t));

        // Interpolate through palette
        var seg = t * (palette.length - 1);
        var idx = Math.floor(seg);
        var frac = seg - idx;
        if (idx >= palette.length - 1) { idx = palette.length - 2; frac = 1; }
        var c0 = palette[idx];
        var c1 = palette[idx + 1];
        var r = Math.round(c0[0] + frac * (c1[0] - c0[0]));
        var g = Math.round(c0[1] + frac * (c1[1] - c0[1]));
        var b = Math.round(c0[2] + frac * (c1[2] - c0[2]));

        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        // Flip y: grid row 0 = yMin (bottom), drawn at bottom
        var px = pad + j * cellW;
        var py = pad + (res - i) * cellH;
        ctx.fillRect(px, py, Math.ceil(cellW), Math.ceil(cellH));
      }
    }

    // Draw contour lines
    var levels = [];
    for (var l = 0; l < numLevels; l++) {
      var t = l / (numLevels - 1);
      levels.push(Math.exp(logMin + t * (logMax - logMin)) - 1);
    }

    ctx.strokeStyle = dark ? 'rgba(192,202,245,0.12)' : 'rgba(26,27,38,0.1)';
    ctx.lineWidth = 0.5;

    // Simple contour line drawing using marching squares (simplified)
    for (var li = 0; li < levels.length; li++) {
      var lev = levels[li];
      for (var i = 0; i < res; i++) {
        for (var j = 0; j < res; j++) {
          var v00 = grid[i][j], v10 = grid[i][j + 1];
          var v01 = grid[i + 1][j], v11 = grid[i + 1][j + 1];
          var edges = [];
          // Check each edge for crossing
          if ((v00 - lev) * (v10 - lev) < 0) {
            var frac = (lev - v00) / (v10 - v00);
            edges.push([pad + (j + frac) * cellW, pad + (res - i) * cellH]);
          }
          if ((v10 - lev) * (v11 - lev) < 0) {
            var frac = (lev - v10) / (v11 - v10);
            edges.push([pad + (j + 1) * cellW, pad + (res - i - frac) * cellH]);
          }
          if ((v01 - lev) * (v11 - lev) < 0) {
            var frac = (lev - v01) / (v11 - v01);
            edges.push([pad + (j + frac) * cellW, pad + (res - i - 1) * cellH]);
          }
          if ((v00 - lev) * (v01 - lev) < 0) {
            var frac = (lev - v00) / (v01 - v00);
            edges.push([pad + j * cellW, pad + (res - i - frac) * cellH]);
          }
          if (edges.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(edges[0][0], edges[0][1]);
            ctx.lineTo(edges[1][0], edges[1][1]);
            ctx.stroke();
          }
        }
      }
    }

    // Axes labels
    ctx.fillStyle = colors.text;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('x', w / 2, h - 5);
    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('y', 0, 0);
    ctx.restore();

    // Tick marks
    ctx.fillStyle = colors.textMuted;
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var t = 0; t <= 4; t++) {
      var v = xMin + (xMax - xMin) * t / 4;
      var px = pad + pw * t / 4;
      ctx.fillText(v.toFixed(1), px, h - pad + 14);
    }
    ctx.textAlign = 'right';
    for (var t = 0; t <= 4; t++) {
      var v = yMin + (yMax - yMin) * t / 4;
      var py = pad + ph - ph * t / 4;
      ctx.fillText(v.toFixed(1), pad - 5, py + 3);
    }

    return { pad: pad, pw: pw, ph: ph };
  }

  // Map world coords to pixel coords
  function worldToPixel(x, y, xMin, xMax, yMin, yMax, pad, pw, ph) {
    var px = pad + (x - xMin) / (xMax - xMin) * pw;
    var py = pad + ph - (y - yMin) / (yMax - yMin) * ph;
    return { px: px, py: py };
  }

  // Map pixel to world coords
  function pixelToWorld(px, py, xMin, xMax, yMin, yMax, pad, pw, ph) {
    var x = xMin + (px - pad) / pw * (xMax - xMin);
    var y = yMax - (py - pad) / ph * (yMax - yMin);
    return { x: x, y: y };
  }

  // Draw a path on the contour plot
  function drawPath(ctx, path, color, xMin, xMax, yMin, yMax, pad, pw, ph, lineWidth) {
    if (path.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    var p0 = worldToPixel(path[0].x, path[0].y, xMin, xMax, yMin, yMax, pad, pw, ph);
    ctx.moveTo(p0.px, p0.py);
    for (var i = 1; i < path.length; i++) {
      var p = worldToPixel(path[i].x, path[i].y, xMin, xMax, yMin, yMax, pad, pw, ph);
      ctx.lineTo(p.px, p.py);
    }
    ctx.stroke();

    // Draw current position dot
    var last = path[path.length - 1];
    var lp = worldToPixel(last.x, last.y, xMin, xMax, yMin, yMax, pad, pw, ph);
    ctx.beginPath();
    ctx.arc(lp.px, lp.py, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Draw start marker
  function drawStart(ctx, x, y, xMin, xMax, yMin, yMax, pad, pw, ph, color) {
    var p = worldToPixel(x, y, xMin, xMax, yMin, yMax, pad, pw, ph);
    ctx.beginPath();
    ctx.arc(p.px, p.py, 7, 0, Math.PI * 2);
    ctx.fillStyle = color || '#fff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('S', p.px, p.py + 3);
  }

  // Draw minimum marker
  function drawMinimum(ctx, x, y, xMin, xMax, yMin, yMax, pad, pw, ph, colors) {
    var p = worldToPixel(x, y, xMin, xMax, yMin, yMax, pad, pw, ph);
    ctx.beginPath();
    ctx.arc(p.px, p.py, 6, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605', p.px, p.py + 3);
  }

  // Observe theme changes
  var observers = [];
  function onThemeChange(fn) {
    observers.push(fn);
  }
  var mo = new MutationObserver(function() {
    observers.forEach(function(fn) { fn(); });
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    getColors: getColors,
    setupCanvas: setupCanvas,
    rosenbrock: rosenbrock,
    rosenbrockGrad: rosenbrockGrad,
    beale: beale,
    bealeGrad: bealeGrad,
    saddle: saddle,
    saddleGrad: saddleGrad,
    elongated: elongated,
    elongatedGrad: elongatedGrad,
    drawContours: drawContours,
    worldToPixel: worldToPixel,
    pixelToWorld: pixelToWorld,
    drawPath: drawPath,
    drawStart: drawStart,
    drawMinimum: drawMinimum,
    onThemeChange: onThemeChange
  };
})();
</script>

In our [previous chapter on linear regression]({% post_url 2026-03-16-linear-regression-from-scratch-interactive %}), we used gradient descent to find the optimal parameters for our model. We treated it as a black box: compute gradients, multiply by learning rate, update weights. But in practice, the choice of **optimizer** can make or break your model's training. A poorly tuned optimizer might never converge, oscillate wildly, or get stuck in saddle points.

In this chapter, we will peel back the layers of gradient descent and explore the family of optimizers that power modern deep learning, from vanilla SGD all the way to Adam. Every concept comes with an interactive demo so you can build real intuition.

## 1. The Core Idea: Follow the Slope Downhill

All gradient-based optimizers share the same fundamental principle: **compute the gradient of the loss with respect to the parameters, then update the parameters in the direction that decreases the loss**.

Think of it as standing on a hilly landscape in dense fog. You cannot see the valley, but you can feel the slope under your feet. You take a step in the steepest downhill direction, feel the slope again, and repeat. The question is: **how big should each step be, and should we remember anything about previous steps?**

The general update rule is:

$$\theta_{t+1} = \theta_t - \alpha \nabla_\theta J(\theta_t)$$

where $$\alpha$$ is the learning rate, $$\nabla_\theta J(\theta_t)$$ is the gradient of the loss, and $$\theta$$ represents our parameters.

---

## 2. Vanilla Gradient Descent (Batch GD)

The simplest optimizer computes the gradient over the **entire dataset** and takes one step:

$$\theta := \theta - \alpha \nabla_\theta J(\theta)$$

This is called **Batch Gradient Descent** because it uses the full batch of training data for every update. The path it traces is smooth and deterministic, the same starting point with the same learning rate will always produce the same path.

**Click anywhere on the contour plot below to set a starting point**, then watch batch gradient descent trace its way toward the minimum. Adjust the learning rate to see how it affects convergence.

<div class="interactive-demo" id="demo-vanilla">
  <canvas id="canvas-vanilla" width="680" height="400"></canvas>
  <div class="demo-controls">
    <label>Learning Rate (α): <input type="range" id="lr-vanilla" min="0.0001" max="0.01" step="0.0001" value="0.003"></label>
    <span class="demo-value" id="lr-vanilla-val">0.0030</span>
    <button id="btn-vanilla-start">Start</button>
    <button id="btn-vanilla-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-vanilla">Click on the contour plot to set a starting point.</div>
</div>
<div class="demo-caption">Batch Gradient Descent on a modified Rosenbrock surface. Minimum at (1, 1).</div>

<div class="demo-hint">
  <strong>Try this:</strong> Set a starting point near (-1.5, 2.5) and see the long, curving path GD takes through the narrow valley. Then try starting at (0.5, 0.5) for a much shorter path.
</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-vanilla');
  var W = 680, H = 400;
  var ctx = GD.setupCanvas(canvas, W, H);
  var colors = GD.getColors();

  var xMin = -2, xMax = 2, yMin = -1, yMax = 3;
  var startX = null, startY = null;
  var path = [];
  var running = false;
  var animId = null;
  var step = 0;
  var maxSteps = 2000;
  var layout = null;

  function getLr() {
    return parseFloat(document.getElementById('lr-vanilla').value);
  }

  function draw() {
    colors = GD.getColors();
    ctx.clearRect(0, 0, W, H);
    layout = GD.drawContours(ctx, W, H, GD.rosenbrock, xMin, xMax, yMin, yMax, colors, 25);
    GD.drawMinimum(ctx, 1, 1, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph, colors);

    if (path.length > 0) {
      GD.drawPath(ctx, path, colors.sgd, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph, 2.5);
    }
    if (startX !== null) {
      GD.drawStart(ctx, startX, startY, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph);
    }
  }

  function animate() {
    if (!running || step >= maxSteps) { running = false; return; }
    var lr = getLr();
    var cur = path[path.length - 1];
    var g = GD.rosenbrockGrad(cur.x, cur.y);
    // Clip gradient
    var gn = Math.sqrt(g.dx * g.dx + g.dy * g.dy);
    if (gn > 50) { g.dx = g.dx / gn * 50; g.dy = g.dy / gn * 50; }
    var nx = cur.x - lr * g.dx;
    var ny = cur.y - lr * g.dy;
    // Check divergence
    if (Math.abs(nx) > 10 || Math.abs(ny) > 10) {
      running = false;
      document.getElementById('info-vanilla').textContent = 'Diverged! Learning rate too high.';
      return;
    }
    path.push({ x: nx, y: ny });
    step++;
    var loss = GD.rosenbrock(nx, ny);
    document.getElementById('info-vanilla').textContent = 'Step: ' + step + ' | Loss: ' + loss.toFixed(6) + ' | Position: (' + nx.toFixed(3) + ', ' + ny.toFixed(3) + ')';
    draw();
    if (loss < 0.0001) {
      running = false;
      document.getElementById('info-vanilla').textContent += ' | Converged!';
      return;
    }
    animId = requestAnimationFrame(animate);
  }

  canvas.addEventListener('click', function(e) {
    if (running) return;
    var rect = canvas.getBoundingClientRect();
    var scaleX = W / rect.width;
    var scaleY = H / rect.height;
    var px = (e.clientX - rect.left) * scaleX;
    var py = (e.clientY - rect.top) * scaleY;
    if (!layout) return;
    var w = GD.pixelToWorld(px, py, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph);
    if (w.x < xMin || w.x > xMax || w.y < yMin || w.y > yMax) return;
    startX = w.x; startY = w.y;
    path = [{ x: startX, y: startY }];
    step = 0;
    document.getElementById('info-vanilla').textContent = 'Start: (' + startX.toFixed(2) + ', ' + startY.toFixed(2) + ') | Loss: ' + GD.rosenbrock(startX, startY).toFixed(4) + ', Press Start.';
    draw();
  });

  document.getElementById('lr-vanilla').addEventListener('input', function() {
    document.getElementById('lr-vanilla-val').textContent = parseFloat(this.value).toFixed(4);
  });

  document.getElementById('btn-vanilla-start').addEventListener('click', function() {
    if (startX === null) { document.getElementById('info-vanilla').textContent = 'Click on the surface first!'; return; }
    if (running) return;
    running = true;
    animate();
  });

  document.getElementById('btn-vanilla-reset').addEventListener('click', function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    startX = null; startY = null;
    path = []; step = 0;
    document.getElementById('info-vanilla').textContent = 'Click on the contour plot to set a starting point.';
    draw();
  });

  draw();
  GD.onThemeChange(draw);
})();
</script>

---

## 3. The Learning Rate Playground

The learning rate $$\alpha$$ is arguably the single most important hyperparameter. Here is why:

- **Too small** ($$\alpha = 0.0001$$): Steps are tiny. Training takes forever. You might run out of patience (or compute budget) before reaching the minimum.
- **Just right** ($$\alpha = 0.003$$): Smooth, steady convergence to the minimum in a reasonable number of steps.
- **Too large** ($$\alpha = 0.02$$): Steps overshoot the minimum. The optimizer bounces back and forth, and may even **diverge**, moving farther and farther from the solution.

The three canvases below show the **same surface, same starting point**, but with different learning rates. Watch how dramatically the behavior changes.

<div class="interactive-demo" id="demo-lr">
  <div class="lr-trio">
    <div class="lr-trio-item">
      <div class="lr-label" id="lr-label-small">α = 0.0003 (Too Small)</div>
      <canvas id="canvas-lr-small" width="210" height="210"></canvas>
    </div>
    <div class="lr-trio-item">
      <div class="lr-label" id="lr-label-good">α = 0.003 (Good)</div>
      <canvas id="canvas-lr-good" width="210" height="210"></canvas>
    </div>
    <div class="lr-trio-item">
      <div class="lr-label" id="lr-label-big">α = 0.02 (Too Large)</div>
      <canvas id="canvas-lr-big" width="210" height="210"></canvas>
    </div>
  </div>
  <div class="demo-controls">
    <label>Scale factor: <input type="range" id="lr-scale" min="0.2" max="3" step="0.1" value="1.0"></label>
    <span class="demo-value" id="lr-scale-val">1.0x</span>
    <button id="btn-lr-run">Run All</button>
    <button id="btn-lr-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-lr">Press "Run All" to compare three learning rates simultaneously.</div>
</div>

<script>
(function() {
  var canvases = ['canvas-lr-small', 'canvas-lr-good', 'canvas-lr-big'];
  var ctxs = [];
  var CW = 210, CH = 210;
  canvases.forEach(function(id) {
    ctxs.push(GD.setupCanvas(document.getElementById(id), CW, CH));
  });

  var xMin = -2, xMax = 2, yMin = -1, yMax = 3;
  var sx = -1.5, sy = 2.5;
  var baseLrs = [0.0003, 0.003, 0.02];
  var paths = [[], [], []];
  var running = false;
  var animId = null;
  var step = 0;
  var maxSteps = 1500;

  function getScale() { return parseFloat(document.getElementById('lr-scale').value); }

  function drawAll() {
    var colors = GD.getColors();
    for (var c = 0; c < 3; c++) {
      ctxs[c].clearRect(0, 0, CW, CH);
      var layout = GD.drawContours(ctxs[c], CW, CH, GD.rosenbrock, xMin, xMax, yMin, yMax, colors, 15);
      GD.drawMinimum(ctxs[c], 1, 1, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph, colors);
      if (paths[c].length > 0) {
        GD.drawPath(ctxs[c], paths[c], colors.sgd, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph, 2);
      }
      GD.drawStart(ctxs[c], sx, sy, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph);
    }
    var scale = getScale();
    document.getElementById('lr-label-small').textContent = '\u03B1 = ' + (baseLrs[0] * scale).toFixed(4) + ' (Small)';
    document.getElementById('lr-label-good').textContent = '\u03B1 = ' + (baseLrs[1] * scale).toFixed(4) + ' (Medium)';
    document.getElementById('lr-label-big').textContent = '\u03B1 = ' + (baseLrs[2] * scale).toFixed(3) + ' (Large)';
  }

  function animate() {
    if (!running || step >= maxSteps) { running = false; return; }
    var scale = getScale();
    var allDone = true;
    for (var c = 0; c < 3; c++) {
      var lr = baseLrs[c] * scale;
      var cur = paths[c][paths[c].length - 1];
      if (!cur) continue;
      var loss = GD.rosenbrock(cur.x, cur.y);
      if (loss < 0.0001 || Math.abs(cur.x) > 10 || Math.abs(cur.y) > 10) continue;
      allDone = false;
      var g = GD.rosenbrockGrad(cur.x, cur.y);
      var gn = Math.sqrt(g.dx * g.dx + g.dy * g.dy);
      if (gn > 50) { g.dx = g.dx / gn * 50; g.dy = g.dy / gn * 50; }
      paths[c].push({ x: cur.x - lr * g.dx, y: cur.y - lr * g.dy });
    }
    step++;
    var info = 'Step ' + step + ' |';
    for (var c = 0; c < 3; c++) {
      var cur = paths[c][paths[c].length - 1];
      var l = GD.rosenbrock(cur.x, cur.y);
      info += (l > 1000 ? ' DIVERGED' : ' Loss=' + l.toFixed(2));
      if (c < 2) info += ' |';
    }
    document.getElementById('info-lr').textContent = info;
    drawAll();
    if (!allDone) animId = requestAnimationFrame(animate);
  }

  document.getElementById('lr-scale').addEventListener('input', function() {
    document.getElementById('lr-scale-val').textContent = parseFloat(this.value).toFixed(1) + 'x';
  });

  document.getElementById('btn-lr-run').addEventListener('click', function() {
    if (running) return;
    paths = [[{x: sx, y: sy}], [{x: sx, y: sy}], [{x: sx, y: sy}]];
    step = 0; running = true;
    animate();
  });

  document.getElementById('btn-lr-reset').addEventListener('click', function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    paths = [[], [], []]; step = 0;
    document.getElementById('info-lr').textContent = 'Press "Run All" to compare three learning rates simultaneously.';
    drawAll();
  });

  drawAll();
  GD.onThemeChange(drawAll);
})();
</script>

---

## 4. Stochastic Gradient Descent (SGD)

Batch GD computes the gradient over the **entire** dataset before making a single step. When datasets are large (millions of samples), this is extremely slow. **Stochastic Gradient Descent** fixes this by using a **single random sample** per update:

$$\theta := \theta - \alpha \nabla_\theta J(\theta;\; x^{(i)}, y^{(i)})$$

The gradient from a single sample is a **noisy estimate** of the true gradient. This noise makes the path zigzag, but it has a surprising benefit: the noise can help the optimizer **escape shallow local minima** and explore more of the loss surface.

In the demo below, watch how Batch GD traces a smooth path while SGD takes a noisy, drunken walk toward the same destination. Despite the noise, SGD often reaches a good solution faster because it makes many more updates per epoch.

<div class="interactive-demo" id="demo-sgd">
  <div class="demo-split">
    <div>
      <div class="demo-caption" style="margin-bottom:0.3rem; font-weight:600;">Batch GD</div>
      <canvas id="canvas-sgd-batch" width="330" height="330"></canvas>
    </div>
    <div>
      <div class="demo-caption" style="margin-bottom:0.3rem; font-weight:600;">Stochastic GD</div>
      <canvas id="canvas-sgd-stoch" width="330" height="330"></canvas>
    </div>
  </div>
  <div class="demo-controls">
    <label>Learning Rate: <input type="range" id="lr-sgd" min="0.0005" max="0.008" step="0.0005" value="0.003"></label>
    <span class="demo-value" id="lr-sgd-val">0.0030</span>
    <label>Noise (SGD): <input type="range" id="noise-sgd" min="0.1" max="3" step="0.1" value="1.0"></label>
    <span class="demo-value" id="noise-sgd-val">1.0</span>
    <button id="btn-sgd-run">Run</button>
    <button id="btn-sgd-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-sgd">Press "Run" to see Batch GD vs SGD side by side.</div>
</div>

<script>
(function() {
  var canvasB = document.getElementById('canvas-sgd-batch');
  var canvasS = document.getElementById('canvas-sgd-stoch');
  var CW = 330, CH = 330;
  var ctxB = GD.setupCanvas(canvasB, CW, CH);
  var ctxS = GD.setupCanvas(canvasS, CW, CH);

  var xMin = -2, xMax = 2, yMin = -1, yMax = 3;
  var sx = -1.2, sy = 2.0;
  var pathB = [], pathS = [];
  var running = false, animId = null, step = 0, maxSteps = 1500;

  function getLr() { return parseFloat(document.getElementById('lr-sgd').value); }
  function getNoise() { return parseFloat(document.getElementById('noise-sgd').value); }

  function drawAll() {
    var colors = GD.getColors();
    // Batch
    ctxB.clearRect(0, 0, CW, CH);
    var layB = GD.drawContours(ctxB, CW, CH, GD.rosenbrock, xMin, xMax, yMin, yMax, colors, 18);
    GD.drawMinimum(ctxB, 1, 1, xMin, xMax, yMin, yMax, layB.pad, layB.pw, layB.ph, colors);
    if (pathB.length > 0) GD.drawPath(ctxB, pathB, colors.momentum, xMin, xMax, yMin, yMax, layB.pad, layB.pw, layB.ph, 2);
    GD.drawStart(ctxB, sx, sy, xMin, xMax, yMin, yMax, layB.pad, layB.pw, layB.ph);

    // Stochastic
    ctxS.clearRect(0, 0, CW, CH);
    var layS = GD.drawContours(ctxS, CW, CH, GD.rosenbrock, xMin, xMax, yMin, yMax, colors, 18);
    GD.drawMinimum(ctxS, 1, 1, xMin, xMax, yMin, yMax, layS.pad, layS.pw, layS.ph, colors);
    if (pathS.length > 0) GD.drawPath(ctxS, pathS, colors.sgd, xMin, xMax, yMin, yMax, layS.pad, layS.pw, layS.ph, 1.5);
    GD.drawStart(ctxS, sx, sy, xMin, xMax, yMin, yMax, layS.pad, layS.pw, layS.ph);
  }

  function gaussRand() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function animate() {
    if (!running || step >= maxSteps) { running = false; return; }
    var lr = getLr();
    var noise = getNoise();

    // Batch GD step
    var curB = pathB[pathB.length - 1];
    var gB = GD.rosenbrockGrad(curB.x, curB.y);
    var gnB = Math.sqrt(gB.dx * gB.dx + gB.dy * gB.dy);
    if (gnB > 50) { gB.dx = gB.dx / gnB * 50; gB.dy = gB.dy / gnB * 50; }
    pathB.push({ x: curB.x - lr * gB.dx, y: curB.y - lr * gB.dy });

    // SGD step (gradient + noise)
    var curS = pathS[pathS.length - 1];
    var gS = GD.rosenbrockGrad(curS.x, curS.y);
    var gnS = Math.sqrt(gS.dx * gS.dx + gS.dy * gS.dy);
    if (gnS > 50) { gS.dx = gS.dx / gnS * 50; gS.dy = gS.dy / gnS * 50; }
    // Add Gaussian noise to simulate stochastic gradient
    var ndx = gS.dx + noise * gnS * gaussRand() * 0.3;
    var ndy = gS.dy + noise * gnS * gaussRand() * 0.3;
    pathS.push({ x: curS.x - lr * ndx, y: curS.y - lr * ndy });

    step++;
    var lB = GD.rosenbrock(pathB[pathB.length - 1].x, pathB[pathB.length - 1].y);
    var lS = GD.rosenbrock(pathS[pathS.length - 1].x, pathS[pathS.length - 1].y);
    document.getElementById('info-sgd').textContent = 'Step ' + step + ' | Batch Loss: ' + lB.toFixed(4) + ' | SGD Loss: ' + lS.toFixed(4);
    drawAll();

    if (lB < 0.0001 && lS < 0.01) { running = false; return; }
    animId = requestAnimationFrame(animate);
  }

  document.getElementById('lr-sgd').addEventListener('input', function() {
    document.getElementById('lr-sgd-val').textContent = parseFloat(this.value).toFixed(4);
  });
  document.getElementById('noise-sgd').addEventListener('input', function() {
    document.getElementById('noise-sgd-val').textContent = parseFloat(this.value).toFixed(1);
  });

  document.getElementById('btn-sgd-run').addEventListener('click', function() {
    if (running) return;
    pathB = [{x: sx, y: sy}]; pathS = [{x: sx, y: sy}];
    step = 0; running = true;
    animate();
  });

  document.getElementById('btn-sgd-reset').addEventListener('click', function() {
    running = false; if (animId) cancelAnimationFrame(animId);
    pathB = []; pathS = []; step = 0;
    document.getElementById('info-sgd').textContent = 'Press "Run" to see Batch GD vs SGD side by side.';
    drawAll();
  });

  drawAll();
  GD.onThemeChange(drawAll);
})();
</script>

---

## 5. Momentum

Vanilla GD can oscillate when the loss surface is shaped like a narrow valley, steep in one direction, shallow in another. It bounces back and forth across the steep walls while making slow progress along the valley floor.

**Momentum** fixes this by maintaining a **velocity** that accumulates past gradients. Think of a ball rolling downhill: it picks up speed along consistent directions and dampens oscillations across inconsistent ones.

$$v_t = \beta \, v_{t-1} + \alpha \, \nabla_\theta J(\theta)$$

$$\theta := \theta - v_t$$

The hyperparameter $$\beta$$ (typically 0.9) controls how much history to retain. Higher $$\beta$$ means more momentum, the optimizer "remembers" more of its previous direction.

In this demo, compare vanilla GD (which oscillates) vs Momentum (which accelerates smoothly) on an **elongated elliptical surface**, the worst case for vanilla GD.

<div class="interactive-demo" id="demo-momentum">
  <div class="demo-split">
    <div>
      <div class="demo-caption" style="margin-bottom:0.3rem; font-weight:600;">Vanilla GD</div>
      <canvas id="canvas-mom-vanilla" width="330" height="330"></canvas>
    </div>
    <div>
      <div class="demo-caption" style="margin-bottom:0.3rem; font-weight:600;">GD + Momentum</div>
      <canvas id="canvas-mom-momentum" width="330" height="330"></canvas>
    </div>
  </div>
  <div class="demo-controls">
    <label>α: <input type="range" id="lr-mom" min="0.001" max="0.02" step="0.001" value="0.007"></label>
    <span class="demo-value" id="lr-mom-val">0.007</span>
    <label>β: <input type="range" id="beta-mom" min="0" max="0.99" step="0.01" value="0.9"></label>
    <span class="demo-value" id="beta-mom-val">0.90</span>
    <button id="btn-mom-run">Run</button>
    <button id="btn-mom-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-mom">Press "Run" to compare vanilla GD vs Momentum.</div>
</div>
<div class="demo-hint">
  <strong>Try this:</strong> Set β to 0 (no momentum, behaves like vanilla GD) and then gradually increase to 0.95. Watch the oscillations disappear and the path smooth out.
</div>

<script>
(function() {
  var canvasV = document.getElementById('canvas-mom-vanilla');
  var canvasM = document.getElementById('canvas-mom-momentum');
  var CW = 330, CH = 330;
  var ctxV = GD.setupCanvas(canvasV, CW, CH);
  var ctxM = GD.setupCanvas(canvasM, CW, CH);

  var xMin = -3, xMax = 3, yMin = -1, yMax = 1;
  var sx = -2.5, sy = 0.8;
  var pathV = [], pathM = [];
  var running = false, animId = null, step = 0, maxSteps = 1500;
  var vx = 0, vy = 0; // momentum velocity

  function getLr() { return parseFloat(document.getElementById('lr-mom').value); }
  function getBeta() { return parseFloat(document.getElementById('beta-mom').value); }

  function drawAll() {
    var colors = GD.getColors();
    // Vanilla
    ctxV.clearRect(0, 0, CW, CH);
    var layV = GD.drawContours(ctxV, CW, CH, GD.elongated, xMin, xMax, yMin, yMax, colors, 20);
    GD.drawMinimum(ctxV, 0, 0, xMin, xMax, yMin, yMax, layV.pad, layV.pw, layV.ph, colors);
    if (pathV.length > 0) GD.drawPath(ctxV, pathV, colors.sgd, xMin, xMax, yMin, yMax, layV.pad, layV.pw, layV.ph, 2);
    GD.drawStart(ctxV, sx, sy, xMin, xMax, yMin, yMax, layV.pad, layV.pw, layV.ph);

    // Momentum
    ctxM.clearRect(0, 0, CW, CH);
    var layM = GD.drawContours(ctxM, CW, CH, GD.elongated, xMin, xMax, yMin, yMax, colors, 20);
    GD.drawMinimum(ctxM, 0, 0, xMin, xMax, yMin, yMax, layM.pad, layM.pw, layM.ph, colors);
    if (pathM.length > 0) GD.drawPath(ctxM, pathM, colors.momentum, xMin, xMax, yMin, yMax, layM.pad, layM.pw, layM.ph, 2);
    GD.drawStart(ctxM, sx, sy, xMin, xMax, yMin, yMax, layM.pad, layM.pw, layM.ph);
  }

  function animate() {
    if (!running || step >= maxSteps) { running = false; return; }
    var lr = getLr();
    var beta = getBeta();

    // Vanilla GD
    var curV = pathV[pathV.length - 1];
    var gV = GD.elongatedGrad(curV.x, curV.y);
    pathV.push({ x: curV.x - lr * gV.dx, y: curV.y - lr * gV.dy });

    // Momentum GD
    var curM = pathM[pathM.length - 1];
    var gM = GD.elongatedGrad(curM.x, curM.y);
    vx = beta * vx + lr * gM.dx;
    vy = beta * vy + lr * gM.dy;
    pathM.push({ x: curM.x - vx, y: curM.y - vy });

    step++;
    var lV = GD.elongated(pathV[pathV.length - 1].x, pathV[pathV.length - 1].y);
    var lM = GD.elongated(pathM[pathM.length - 1].x, pathM[pathM.length - 1].y);
    document.getElementById('info-mom').textContent = 'Step ' + step + ' | Vanilla Loss: ' + lV.toFixed(4) + ' | Momentum Loss: ' + lM.toFixed(4);
    drawAll();

    if (lV < 0.0001 && lM < 0.0001) { running = false; document.getElementById('info-mom').textContent += ' | Both converged!'; return; }
    animId = requestAnimationFrame(animate);
  }

  document.getElementById('lr-mom').addEventListener('input', function() {
    document.getElementById('lr-mom-val').textContent = parseFloat(this.value).toFixed(3);
  });
  document.getElementById('beta-mom').addEventListener('input', function() {
    document.getElementById('beta-mom-val').textContent = parseFloat(this.value).toFixed(2);
  });

  document.getElementById('btn-mom-run').addEventListener('click', function() {
    if (running) return;
    pathV = [{x: sx, y: sy}]; pathM = [{x: sx, y: sy}];
    vx = 0; vy = 0;
    step = 0; running = true;
    animate();
  });

  document.getElementById('btn-mom-reset').addEventListener('click', function() {
    running = false; if (animId) cancelAnimationFrame(animId);
    pathV = []; pathM = []; vx = 0; vy = 0; step = 0;
    document.getElementById('info-mom').textContent = 'Press "Run" to compare vanilla GD vs Momentum.';
    drawAll();
  });

  drawAll();
  GD.onThemeChange(drawAll);
})();
</script>

---

## 6. RMSProp

Momentum helps with acceleration, but it treats all parameters equally. What if some parameters need larger updates and others need smaller ones?

**RMSProp** (Root Mean Square Propagation) adapts the learning rate **per parameter** by tracking the running average of squared gradients. Parameters with large gradients get smaller effective learning rates, and vice versa.

$$s_t = \beta \, s_{t-1} + (1 - \beta)(\nabla_\theta J)^2$$

$$\theta := \theta - \frac{\alpha}{\sqrt{s_t + \epsilon}} \nabla_\theta J$$

The key insight: on an elongated surface, the y-direction has huge gradients (steep walls) while the x-direction has small gradients (shallow valley floor). RMSProp automatically shrinks the y-updates and boosts the x-updates, producing a path that goes **straight to the minimum** instead of oscillating.

<div class="interactive-demo" id="demo-rmsprop">
  <div class="demo-split">
    <div>
      <div class="demo-caption" style="margin-bottom:0.3rem; font-weight:600;">Vanilla GD</div>
      <canvas id="canvas-rms-vanilla" width="330" height="330"></canvas>
    </div>
    <div>
      <div class="demo-caption" style="margin-bottom:0.3rem; font-weight:600;">RMSProp</div>
      <canvas id="canvas-rms-rms" width="330" height="330"></canvas>
    </div>
  </div>
  <div class="demo-controls">
    <label>α: <input type="range" id="lr-rms" min="0.001" max="0.05" step="0.001" value="0.01"></label>
    <span class="demo-value" id="lr-rms-val">0.010</span>
    <label>β: <input type="range" id="beta-rms" min="0.5" max="0.999" step="0.001" value="0.9"></label>
    <span class="demo-value" id="beta-rms-val">0.900</span>
    <button id="btn-rms-run">Run</button>
    <button id="btn-rms-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-rms">Press "Run" to compare Vanilla GD vs RMSProp.</div>
</div>

<script>
(function() {
  var canvasV = document.getElementById('canvas-rms-vanilla');
  var canvasR = document.getElementById('canvas-rms-rms');
  var CW = 330, CH = 330;
  var ctxV = GD.setupCanvas(canvasV, CW, CH);
  var ctxR = GD.setupCanvas(canvasR, CW, CH);

  var xMin = -3, xMax = 3, yMin = -1, yMax = 1;
  var sx = -2.5, sy = 0.7;
  var pathV = [], pathR = [];
  var running = false, animId = null, step = 0, maxSteps = 1500;
  var sx_rms = 0, sy_rms = 0; // running avg of squared gradients
  var eps = 1e-8;

  function getLr() { return parseFloat(document.getElementById('lr-rms').value); }
  function getBeta() { return parseFloat(document.getElementById('beta-rms').value); }

  function drawAll() {
    var colors = GD.getColors();
    ctxV.clearRect(0, 0, CW, CH);
    var layV = GD.drawContours(ctxV, CW, CH, GD.elongated, xMin, xMax, yMin, yMax, colors, 20);
    GD.drawMinimum(ctxV, 0, 0, xMin, xMax, yMin, yMax, layV.pad, layV.pw, layV.ph, colors);
    if (pathV.length > 0) GD.drawPath(ctxV, pathV, colors.sgd, xMin, xMax, yMin, yMax, layV.pad, layV.pw, layV.ph, 2);
    GD.drawStart(ctxV, sx, sy, xMin, xMax, yMin, yMax, layV.pad, layV.pw, layV.ph);

    ctxR.clearRect(0, 0, CW, CH);
    var layR = GD.drawContours(ctxR, CW, CH, GD.elongated, xMin, xMax, yMin, yMax, colors, 20);
    GD.drawMinimum(ctxR, 0, 0, xMin, xMax, yMin, yMax, layR.pad, layR.pw, layR.ph, colors);
    if (pathR.length > 0) GD.drawPath(ctxR, pathR, colors.rmsprop, xMin, xMax, yMin, yMax, layR.pad, layR.pw, layR.ph, 2);
    GD.drawStart(ctxR, sx, sy, xMin, xMax, yMin, yMax, layR.pad, layR.pw, layR.ph);
  }

  function animate() {
    if (!running || step >= maxSteps) { running = false; return; }
    var lr = getLr();
    var beta = getBeta();

    // Vanilla GD
    var curV = pathV[pathV.length - 1];
    var gV = GD.elongatedGrad(curV.x, curV.y);
    pathV.push({ x: curV.x - lr * gV.dx, y: curV.y - lr * gV.dy });

    // RMSProp
    var curR = pathR[pathR.length - 1];
    var gR = GD.elongatedGrad(curR.x, curR.y);
    sx_rms = beta * sx_rms + (1 - beta) * gR.dx * gR.dx;
    sy_rms = beta * sy_rms + (1 - beta) * gR.dy * gR.dy;
    var nx = curR.x - lr / Math.sqrt(sx_rms + eps) * gR.dx;
    var ny = curR.y - lr / Math.sqrt(sy_rms + eps) * gR.dy;
    pathR.push({ x: nx, y: ny });

    step++;
    var lV = GD.elongated(pathV[pathV.length - 1].x, pathV[pathV.length - 1].y);
    var lR = GD.elongated(pathR[pathR.length - 1].x, pathR[pathR.length - 1].y);
    document.getElementById('info-rms').textContent = 'Step ' + step + ' | Vanilla: ' + lV.toFixed(4) + ' | RMSProp: ' + lR.toFixed(4);
    drawAll();
    if (lV < 0.0001 && lR < 0.0001) { running = false; return; }
    animId = requestAnimationFrame(animate);
  }

  document.getElementById('lr-rms').addEventListener('input', function() {
    document.getElementById('lr-rms-val').textContent = parseFloat(this.value).toFixed(3);
  });
  document.getElementById('beta-rms').addEventListener('input', function() {
    document.getElementById('beta-rms-val').textContent = parseFloat(this.value).toFixed(3);
  });

  document.getElementById('btn-rms-run').addEventListener('click', function() {
    if (running) return;
    pathV = [{x: sx, y: sy}]; pathR = [{x: sx, y: sy}];
    sx_rms = 0; sy_rms = 0;
    step = 0; running = true;
    animate();
  });

  document.getElementById('btn-rms-reset').addEventListener('click', function() {
    running = false; if (animId) cancelAnimationFrame(animId);
    pathV = []; pathR = []; sx_rms = 0; sy_rms = 0; step = 0;
    document.getElementById('info-rms').textContent = 'Press "Run" to compare Vanilla GD vs RMSProp.';
    drawAll();
  });

  drawAll();
  GD.onThemeChange(drawAll);
})();
</script>

---

## 7. Adam: The Best of Both Worlds

**Adam** (Adaptive Moment Estimation) combines the ideas of Momentum and RMSProp. It maintains both a **first moment** (mean of gradients, like Momentum) and a **second moment** (mean of squared gradients, like RMSProp), plus bias correction to account for the fact that both estimates start at zero.

**First moment (momentum):**

$$m_t = \beta_1 \, m_{t-1} + (1 - \beta_1) \nabla_\theta J$$

**Second moment (adaptive learning rate):**

$$v_t = \beta_2 \, v_{t-1} + (1 - \beta_2) (\nabla_\theta J)^2$$

**Bias correction:**

$$\hat{m}_t = \frac{m_t}{1 - \beta_1^t}, \quad \hat{v}_t = \frac{v_t}{1 - \beta_2^t}$$

**Update rule:**

$$\theta := \theta - \frac{\alpha}{\sqrt{\hat{v}_t} + \epsilon} \hat{m}_t$$

The default hyperparameters ($$\beta_1 = 0.9$$, $$\beta_2 = 0.999$$, $$\epsilon = 10^{-8}$$) work well across a wide range of problems, which is why Adam is the **most popular optimizer** in deep learning.

Now for the main event: the **Optimizer Race**. All four algorithms start from the same point on the Rosenbrock surface and race to the minimum. Watch how each one navigates differently.

<div class="interactive-demo" id="demo-race">
  <canvas id="canvas-race" width="680" height="420"></canvas>
  <div class="optimizer-legend">
    <span><span class="legend-dot" style="background:#f7768e"></span> SGD</span>
    <span><span class="legend-dot" style="background:#7aa2f7"></span> Momentum</span>
    <span><span class="legend-dot" style="background:#ff9e64"></span> RMSProp</span>
    <span><span class="legend-dot" style="background:#9ece6a"></span> Adam</span>
  </div>
  <div class="demo-controls">
    <label>α: <input type="range" id="lr-race" min="0.0005" max="0.01" step="0.0005" value="0.003"></label>
    <span class="demo-value" id="lr-race-val">0.003</span>
    <button id="btn-race-start">Start Race</button>
    <button id="btn-race-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-race">Click on the surface to set a starting point, then press "Start Race".</div>
</div>
<div class="demo-caption">The Optimizer Race: SGD vs Momentum vs RMSProp vs Adam on the Rosenbrock surface.</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-race');
  var W = 680, H = 420;
  var ctx = GD.setupCanvas(canvas, W, H);

  var xMin = -2, xMax = 2, yMin = -1, yMax = 3;
  var startX = -1.2, startY = 2.2;
  var running = false, animId = null, step = 0, maxSteps = 3000;
  var layout = null;

  // State for each optimizer
  var paths = { sgd: [], mom: [], rms: [], adam: [] };
  // Momentum state
  var mom_vx = 0, mom_vy = 0;
  // RMSProp state
  var rms_sx = 0, rms_sy = 0;
  // Adam state
  var adam_mx = 0, adam_my = 0, adam_vx = 0, adam_vy = 0;
  var eps = 1e-8;
  var beta1 = 0.9, beta2 = 0.999;

  function getLr() { return parseFloat(document.getElementById('lr-race').value); }

  function resetState() {
    paths = { sgd: [], mom: [], rms: [], adam: [] };
    mom_vx = 0; mom_vy = 0;
    rms_sx = 0; rms_sy = 0;
    adam_mx = 0; adam_my = 0; adam_vx = 0; adam_vy = 0;
    step = 0;
  }

  function draw() {
    var colors = GD.getColors();
    ctx.clearRect(0, 0, W, H);
    layout = GD.drawContours(ctx, W, H, GD.rosenbrock, xMin, xMax, yMin, yMax, colors, 25);
    GD.drawMinimum(ctx, 1, 1, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph, colors);

    // Draw paths in order: SGD first (bottom), Adam last (top)
    if (paths.sgd.length > 1) GD.drawPath(ctx, paths.sgd, colors.sgd, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph, 2);
    if (paths.mom.length > 1) GD.drawPath(ctx, paths.mom, colors.momentum, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph, 2);
    if (paths.rms.length > 1) GD.drawPath(ctx, paths.rms, colors.rmsprop, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph, 2);
    if (paths.adam.length > 1) GD.drawPath(ctx, paths.adam, colors.adam, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph, 2.5);

    GD.drawStart(ctx, startX, startY, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph);
  }

  function animate() {
    if (!running || step >= maxSteps) { running = false; return; }
    var lr = getLr();
    step++;

    // SGD
    var curS = paths.sgd[paths.sgd.length - 1];
    var gS = GD.rosenbrockGrad(curS.x, curS.y);
    var gnS = Math.sqrt(gS.dx * gS.dx + gS.dy * gS.dy);
    if (gnS > 50) { gS.dx = gS.dx / gnS * 50; gS.dy = gS.dy / gnS * 50; }
    paths.sgd.push({ x: curS.x - lr * gS.dx, y: curS.y - lr * gS.dy });

    // Momentum
    var curM = paths.mom[paths.mom.length - 1];
    var gM = GD.rosenbrockGrad(curM.x, curM.y);
    var gnM = Math.sqrt(gM.dx * gM.dx + gM.dy * gM.dy);
    if (gnM > 50) { gM.dx = gM.dx / gnM * 50; gM.dy = gM.dy / gnM * 50; }
    mom_vx = 0.9 * mom_vx + lr * gM.dx;
    mom_vy = 0.9 * mom_vy + lr * gM.dy;
    paths.mom.push({ x: curM.x - mom_vx, y: curM.y - mom_vy });

    // RMSProp
    var curR = paths.rms[paths.rms.length - 1];
    var gR = GD.rosenbrockGrad(curR.x, curR.y);
    var gnR = Math.sqrt(gR.dx * gR.dx + gR.dy * gR.dy);
    if (gnR > 50) { gR.dx = gR.dx / gnR * 50; gR.dy = gR.dy / gnR * 50; }
    rms_sx = 0.9 * rms_sx + 0.1 * gR.dx * gR.dx;
    rms_sy = 0.9 * rms_sy + 0.1 * gR.dy * gR.dy;
    paths.rms.push({
      x: curR.x - lr / Math.sqrt(rms_sx + eps) * gR.dx,
      y: curR.y - lr / Math.sqrt(rms_sy + eps) * gR.dy
    });

    // Adam
    var curA = paths.adam[paths.adam.length - 1];
    var gA = GD.rosenbrockGrad(curA.x, curA.y);
    var gnA = Math.sqrt(gA.dx * gA.dx + gA.dy * gA.dy);
    if (gnA > 50) { gA.dx = gA.dx / gnA * 50; gA.dy = gA.dy / gnA * 50; }
    adam_mx = beta1 * adam_mx + (1 - beta1) * gA.dx;
    adam_my = beta1 * adam_my + (1 - beta1) * gA.dy;
    adam_vx = beta2 * adam_vx + (1 - beta2) * gA.dx * gA.dx;
    adam_vy = beta2 * adam_vy + (1 - beta2) * gA.dy * gA.dy;
    var mxh = adam_mx / (1 - Math.pow(beta1, step));
    var myh = adam_my / (1 - Math.pow(beta1, step));
    var vxh = adam_vx / (1 - Math.pow(beta2, step));
    var vyh = adam_vy / (1 - Math.pow(beta2, step));
    paths.adam.push({
      x: curA.x - lr / Math.sqrt(vxh + eps) * mxh,
      y: curA.y - lr / Math.sqrt(vyh + eps) * myh
    });

    // Info
    var losses = {
      sgd: GD.rosenbrock(paths.sgd[paths.sgd.length - 1].x, paths.sgd[paths.sgd.length - 1].y),
      mom: GD.rosenbrock(paths.mom[paths.mom.length - 1].x, paths.mom[paths.mom.length - 1].y),
      rms: GD.rosenbrock(paths.rms[paths.rms.length - 1].x, paths.rms[paths.rms.length - 1].y),
      adam: GD.rosenbrock(paths.adam[paths.adam.length - 1].x, paths.adam[paths.adam.length - 1].y)
    };
    document.getElementById('info-race').textContent = 'Step ' + step +
      ' | SGD: ' + losses.sgd.toFixed(3) +
      ' | Mom: ' + losses.mom.toFixed(3) +
      ' | RMS: ' + losses.rms.toFixed(3) +
      ' | Adam: ' + losses.adam.toFixed(3);
    draw();

    // Stop if all converged or diverged
    var allSmall = losses.sgd < 0.001 && losses.mom < 0.001 && losses.rms < 0.001 && losses.adam < 0.001;
    if (allSmall) { running = false; document.getElementById('info-race').textContent += ' | All converged!'; return; }
    animId = requestAnimationFrame(animate);
  }

  canvas.addEventListener('click', function(e) {
    if (running) return;
    var rect = canvas.getBoundingClientRect();
    var scaleX = W / rect.width;
    var scaleY = H / rect.height;
    var px = (e.clientX - rect.left) * scaleX;
    var py = (e.clientY - rect.top) * scaleY;
    if (!layout) return;
    var w = GD.pixelToWorld(px, py, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph);
    if (w.x < xMin || w.x > xMax || w.y < yMin || w.y > yMax) return;
    startX = w.x; startY = w.y;
    resetState();
    document.getElementById('info-race').textContent = 'Start: (' + startX.toFixed(2) + ', ' + startY.toFixed(2) + '), Press "Start Race".';
    draw();
  });

  document.getElementById('lr-race').addEventListener('input', function() {
    document.getElementById('lr-race-val').textContent = parseFloat(this.value).toFixed(4);
  });

  document.getElementById('btn-race-start').addEventListener('click', function() {
    if (running) return;
    resetState();
    paths.sgd = [{x: startX, y: startY}];
    paths.mom = [{x: startX, y: startY}];
    paths.rms = [{x: startX, y: startY}];
    paths.adam = [{x: startX, y: startY}];
    running = true;
    animate();
  });

  document.getElementById('btn-race-reset').addEventListener('click', function() {
    running = false; if (animId) cancelAnimationFrame(animId);
    resetState();
    document.getElementById('info-race').textContent = 'Click on the surface to set a starting point, then press "Start Race".';
    draw();
  });

  draw();
  GD.onThemeChange(draw);
})();
</script>

---

## 8. Escaping Saddle Points

In high-dimensional optimization (like deep learning), **saddle points** are far more common than local minima. A saddle point is where the gradient is zero, but it is a minimum in some directions and a maximum in others, like the middle of a horse saddle.

Vanilla GD with a small learning rate can **get stuck** at saddle points because the gradient vanishes. But optimizers with momentum or adaptive learning rates can **escape** because:

- **Momentum** builds up velocity from slight perturbations and carries the optimizer through the flat region.
- **Adam** combines momentum with per-parameter adaptation, making it especially effective at escaping.

The surface below is $$f(x, y) = x^2 - y^2$$, which has a saddle point at the origin. Watch GD slow down and stall, while Adam pushes through.

<div class="interactive-demo" id="demo-saddle">
  <canvas id="canvas-saddle" width="680" height="400"></canvas>
  <div class="optimizer-legend">
    <span><span class="legend-dot" style="background:#f7768e"></span> Vanilla GD</span>
    <span><span class="legend-dot" style="background:#9ece6a"></span> Adam</span>
  </div>
  <div class="demo-controls">
    <label>α: <input type="range" id="lr-saddle" min="0.005" max="0.1" step="0.005" value="0.03"></label>
    <span class="demo-value" id="lr-saddle-val">0.030</span>
    <button id="btn-saddle-run">Play</button>
    <button id="btn-saddle-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-saddle">Press "Play" to see GD get stuck at the saddle point while Adam escapes.</div>
</div>
<div class="demo-hint">
  <strong>Why does Adam escape?</strong> The second-moment estimate for y is small (tiny gradients near the saddle), so Adam's effective learning rate for y becomes very large, pushing it away from the saddle.
</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-saddle');
  var W = 680, H = 400;
  var ctx = GD.setupCanvas(canvas, W, H);

  var xMin = -2, xMax = 2, yMin = -2, yMax = 2;
  // Start near (but not exactly at) the saddle point
  var sx = 0.6, sy = 0.05;
  var pathGD = [], pathAdam = [];
  var running = false, animId = null, step = 0, maxSteps = 600;
  var layout = null;

  // Adam state
  var a_mx = 0, a_my = 0, a_vx = 0, a_vy = 0;
  var eps = 1e-8, beta1 = 0.9, beta2 = 0.999;

  // Custom saddle surface for visualization: x^2 - y^2 + some gentle bowl
  // We want the saddle at origin but interesting elsewhere
  function saddleFn(x, y) {
    return x * x - y * y + 0.5;
  }

  function getLr() { return parseFloat(document.getElementById('lr-saddle').value); }

  function draw() {
    var colors = GD.getColors();
    ctx.clearRect(0, 0, W, H);

    // Custom contour drawing for saddle (negative values exist)
    var pad = 40;
    var pw = W - 2 * pad;
    var ph = H - 2 * pad;
    var res = 120;
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';

    for (var i = 0; i <= res; i++) {
      for (var j = 0; j <= res; j++) {
        var x = xMin + (xMax - xMin) * j / res;
        var y = yMin + (yMax - yMin) * i / res;
        var v = saddleFn(x, y);
        // Map value to color: negative=warm, zero=neutral, positive=cool
        var t = (v + 4) / 8; // range roughly -4 to 4 -> 0 to 1
        t = Math.max(0, Math.min(1, t));
        var r, g, b;
        if (dark) {
          if (t < 0.5) {
            var s = t * 2;
            r = Math.round(247 - s * 120);
            g = Math.round(118 + s * 60);
            b = Math.round(142 - s * 100);
          } else {
            var s = (t - 0.5) * 2;
            r = Math.round(127 - s * 100);
            g = Math.round(178 - s * 50);
            b = Math.round(42 + s * 200);
          }
        } else {
          if (t < 0.5) {
            var s = t * 2;
            r = Math.round(255 - s * 60);
            g = Math.round(200 + s * 30);
            b = Math.round(200 + s * 55);
          } else {
            var s = (t - 0.5) * 2;
            r = Math.round(195 - s * 160);
            g = Math.round(230 - s * 100);
            b = Math.round(255);
          }
        }
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        var px2 = pad + j * (pw / res);
        var py2 = pad + (res - i) * (ph / res);
        ctx.fillRect(px2, py2, Math.ceil(pw / res), Math.ceil(ph / res));
      }
    }

    // Contour lines
    ctx.strokeStyle = dark ? 'rgba(192,202,245,0.15)' : 'rgba(26,27,38,0.12)';
    ctx.lineWidth = 0.5;
    var levels = [];
    for (var l = -3; l <= 3; l += 0.5) levels.push(l);
    var cellW = pw / res;
    var cellH = ph / res;
    var grid = [];
    for (var i = 0; i <= res; i++) {
      grid[i] = [];
      for (var j = 0; j <= res; j++) {
        var x = xMin + (xMax - xMin) * j / res;
        var y = yMin + (yMax - yMin) * i / res;
        grid[i][j] = saddleFn(x, y);
      }
    }
    for (var li = 0; li < levels.length; li++) {
      var lev = levels[li];
      for (var i = 0; i < res; i++) {
        for (var j = 0; j < res; j++) {
          var v00 = grid[i][j], v10 = grid[i][j + 1];
          var v01 = grid[i + 1][j], v11 = grid[i + 1][j + 1];
          var edges = [];
          if ((v00 - lev) * (v10 - lev) < 0) {
            var frac = (lev - v00) / (v10 - v00);
            edges.push([pad + (j + frac) * cellW, pad + (res - i) * cellH]);
          }
          if ((v10 - lev) * (v11 - lev) < 0) {
            var frac = (lev - v10) / (v11 - v10);
            edges.push([pad + (j + 1) * cellW, pad + (res - i - frac) * cellH]);
          }
          if ((v01 - lev) * (v11 - lev) < 0) {
            var frac = (lev - v01) / (v11 - v01);
            edges.push([pad + (j + frac) * cellW, pad + (res - i - 1) * cellH]);
          }
          if ((v00 - lev) * (v01 - lev) < 0) {
            var frac = (lev - v00) / (v01 - v00);
            edges.push([pad + j * cellW, pad + (res - i - frac) * cellH]);
          }
          if (edges.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(edges[0][0], edges[0][1]);
            ctx.lineTo(edges[1][0], edges[1][1]);
            ctx.stroke();
          }
        }
      }
    }

    // Saddle point marker
    var sp = GD.worldToPixel(0, 0, xMin, xMax, yMin, yMax, pad, pw, ph);
    ctx.beginPath();
    ctx.arc(sp.px, sp.py, 8, 0, Math.PI * 2);
    ctx.strokeStyle = dark ? '#c0caf5' : '#1a1b26';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = dark ? '#c0caf5' : '#1a1b26';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('saddle', sp.px + 12, sp.py - 4);

    // Axes labels
    ctx.fillStyle = colors.text;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('x', W / 2, H - 5);
    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('y', 0, 0);
    ctx.restore();

    // Ticks
    ctx.fillStyle = colors.textMuted;
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var t = 0; t <= 4; t++) {
      var v = xMin + (xMax - xMin) * t / 4;
      ctx.fillText(v.toFixed(1), pad + pw * t / 4, H - pad + 14);
    }
    ctx.textAlign = 'right';
    for (var t = 0; t <= 4; t++) {
      var v = yMin + (yMax - yMin) * t / 4;
      ctx.fillText(v.toFixed(1), pad - 5, pad + ph - ph * t / 4 + 3);
    }

    layout = { pad: pad, pw: pw, ph: ph };

    // Paths
    if (pathGD.length > 1) GD.drawPath(ctx, pathGD, colors.sgd, xMin, xMax, yMin, yMax, pad, pw, ph, 2.5);
    if (pathAdam.length > 1) GD.drawPath(ctx, pathAdam, colors.adam, xMin, xMax, yMin, yMax, pad, pw, ph, 2.5);
    GD.drawStart(ctx, sx, sy, xMin, xMax, yMin, yMax, pad, pw, ph);
  }

  function animate() {
    if (!running || step >= maxSteps) { running = false; return; }
    var lr = getLr();
    step++;

    // Vanilla GD
    var cGD = pathGD[pathGD.length - 1];
    var gGD = GD.saddleGrad(cGD.x, cGD.y);
    pathGD.push({ x: cGD.x - lr * gGD.dx, y: cGD.y - lr * gGD.dy });

    // Adam
    var cA = pathAdam[pathAdam.length - 1];
    var gA = GD.saddleGrad(cA.x, cA.y);
    a_mx = beta1 * a_mx + (1 - beta1) * gA.dx;
    a_my = beta1 * a_my + (1 - beta1) * gA.dy;
    a_vx = beta2 * a_vx + (1 - beta2) * gA.dx * gA.dx;
    a_vy = beta2 * a_vy + (1 - beta2) * gA.dy * gA.dy;
    var mxh = a_mx / (1 - Math.pow(beta1, step));
    var myh = a_my / (1 - Math.pow(beta1, step));
    var vxh = a_vx / (1 - Math.pow(beta2, step));
    var vyh = a_vy / (1 - Math.pow(beta2, step));
    pathAdam.push({
      x: cA.x - lr / Math.sqrt(vxh + eps) * mxh,
      y: cA.y - lr / Math.sqrt(vyh + eps) * myh
    });

    var gd_last = pathGD[pathGD.length - 1];
    var adam_last = pathAdam[pathAdam.length - 1];
    document.getElementById('info-saddle').textContent = 'Step ' + step +
      ' | GD: (' + gd_last.x.toFixed(3) + ', ' + gd_last.y.toFixed(3) + ')' +
      ' | Adam: (' + adam_last.x.toFixed(3) + ', ' + adam_last.y.toFixed(3) + ')';
    draw();
    animId = requestAnimationFrame(animate);
  }

  document.getElementById('lr-saddle').addEventListener('input', function() {
    document.getElementById('lr-saddle-val').textContent = parseFloat(this.value).toFixed(3);
  });

  document.getElementById('btn-saddle-run').addEventListener('click', function() {
    if (running) return;
    pathGD = [{x: sx, y: sy}]; pathAdam = [{x: sx, y: sy}];
    a_mx = 0; a_my = 0; a_vx = 0; a_vy = 0;
    step = 0; running = true;
    animate();
  });

  document.getElementById('btn-saddle-reset').addEventListener('click', function() {
    running = false; if (animId) cancelAnimationFrame(animId);
    pathGD = []; pathAdam = [];
    a_mx = 0; a_my = 0; a_vx = 0; a_vy = 0; step = 0;
    document.getElementById('info-saddle').textContent = 'Press "Play" to see GD get stuck at the saddle point while Adam escapes.';
    draw();
  });

  draw();
  GD.onThemeChange(draw);
})();
</script>

---

## 9. Mini-Batch Size: The Noise Knob

In practice, we almost never use pure SGD (batch size = 1) or full Batch GD. Instead, we use **mini-batch gradient descent**, where each update averages the gradient over a small batch of $$B$$ samples:

$$\theta := \theta - \frac{\alpha}{B} \sum_{i=1}^{B} \nabla_\theta J(\theta;\; x^{(i)}, y^{(i)})$$

The batch size acts as a **noise knob**:

| Batch Size | Gradient Quality | Update Frequency | GPU Utilization |
|---|---|---|---|
| 1 (pure SGD) | Very noisy | Very fast | Low |
| 32 (typical) | Moderate noise | Fast | Good |
| 256 | Low noise | Moderate | High |
| Full dataset | No noise | Slow | Varies |

Larger batches give smoother gradients but fewer updates per epoch. Smaller batches add noise that can help generalization but make convergence noisier. Use the slider below to see this tradeoff in action.

<div class="interactive-demo" id="demo-batch">
  <canvas id="canvas-batch" width="680" height="400"></canvas>
  <div class="demo-controls">
    <label>Batch Size: <input type="range" id="batch-size" min="0" max="4" step="1" value="0"></label>
    <span class="demo-value" id="batch-size-val">B=1</span>
    <label>α: <input type="range" id="lr-batch" min="0.001" max="0.008" step="0.0005" value="0.003"></label>
    <span class="demo-value" id="lr-batch-val">0.003</span>
    <button id="btn-batch-run">Run</button>
    <button id="btn-batch-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-batch">Adjust batch size and press "Run". Larger batches = smoother paths.</div>
</div>
<div class="demo-hint">
  <strong>Key takeaway:</strong> Batch size 1 gives the noisiest path. As you increase toward "Full", the path smooths out but each step costs more computation. In practice, 32-256 is the sweet spot.
</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-batch');
  var W = 680, H = 400;
  var ctx = GD.setupCanvas(canvas, W, H);

  var xMin = -2, xMax = 2, yMin = -1, yMax = 3;
  var sx = -1.2, sy = 2.2;
  var path = [];
  var running = false, animId = null, step = 0, maxSteps = 2000;
  var layout = null;

  var batchSizes = [1, 8, 32, 64, -1]; // -1 = full
  var batchLabels = ['B=1', 'B=8', 'B=32', 'B=64', 'Full'];

  function getBatchIdx() { return parseInt(document.getElementById('batch-size').value); }
  function getLr() { return parseFloat(document.getElementById('lr-batch').value); }

  function gaussRand() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function draw() {
    var colors = GD.getColors();
    ctx.clearRect(0, 0, W, H);
    layout = GD.drawContours(ctx, W, H, GD.rosenbrock, xMin, xMax, yMin, yMax, colors, 25);
    GD.drawMinimum(ctx, 1, 1, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph, colors);
    if (path.length > 1) GD.drawPath(ctx, path, colors.momentum, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph, 2);
    GD.drawStart(ctx, sx, sy, xMin, xMax, yMin, yMax, layout.pad, layout.pw, layout.ph);

    // Label
    var bi = getBatchIdx();
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(batchLabels[bi], W - layout.pad - 5, layout.pad + 18);
  }

  function animate() {
    if (!running || step >= maxSteps) { running = false; return; }
    var lr = getLr();
    var bi = getBatchIdx();
    var bSize = batchSizes[bi];

    var cur = path[path.length - 1];
    var g = GD.rosenbrockGrad(cur.x, cur.y);
    var gn = Math.sqrt(g.dx * g.dx + g.dy * g.dy);
    if (gn > 50) { g.dx = g.dx / gn * 50; g.dy = g.dy / gn * 50; }

    // Add noise inversely proportional to batch size
    var noiseScale;
    if (bSize === -1) {
      noiseScale = 0; // full batch = no noise
    } else {
      noiseScale = 1.0 / Math.sqrt(bSize);
    }
    var ndx = g.dx + noiseScale * gn * gaussRand() * 0.4;
    var ndy = g.dy + noiseScale * gn * gaussRand() * 0.4;

    var nx = cur.x - lr * ndx;
    var ny = cur.y - lr * ndy;
    if (Math.abs(nx) > 10 || Math.abs(ny) > 10) { running = false; return; }
    path.push({ x: nx, y: ny });
    step++;

    var loss = GD.rosenbrock(nx, ny);
    document.getElementById('info-batch').textContent = batchLabels[bi] + ' | Step ' + step + ' | Loss: ' + loss.toFixed(4);
    draw();
    if (loss < 0.001) { running = false; document.getElementById('info-batch').textContent += ' | Converged!'; return; }
    animId = requestAnimationFrame(animate);
  }

  document.getElementById('batch-size').addEventListener('input', function() {
    var idx = parseInt(this.value);
    document.getElementById('batch-size-val').textContent = batchLabels[idx];
  });
  document.getElementById('lr-batch').addEventListener('input', function() {
    document.getElementById('lr-batch-val').textContent = parseFloat(this.value).toFixed(4);
  });

  document.getElementById('btn-batch-run').addEventListener('click', function() {
    if (running) return;
    path = [{x: sx, y: sy}];
    step = 0; running = true;
    animate();
  });

  document.getElementById('btn-batch-reset').addEventListener('click', function() {
    running = false; if (animId) cancelAnimationFrame(animId);
    path = []; step = 0;
    document.getElementById('info-batch').textContent = 'Adjust batch size and press "Run". Larger batches = smoother paths.';
    draw();
  });

  draw();
  GD.onThemeChange(draw);
})();
</script>

---

## 10. Summary and Comparison

Here is a reference table of all the optimizers we covered:

<table class="summary-table">
  <thead>
    <tr>
      <th>Optimizer</th>
      <th>Update Rule</th>
      <th>Key Idea</th>
      <th>Hyperparameters</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Batch GD</strong></td>
      <td>$$\theta - \alpha \nabla J$$</td>
      <td>Full-batch, deterministic</td>
      <td>$$\alpha$$</td>
    </tr>
    <tr>
      <td><strong>SGD</strong></td>
      <td>$$\theta - \alpha \nabla J_i$$</td>
      <td>Single-sample noisy gradient</td>
      <td>$$\alpha$$</td>
    </tr>
    <tr>
      <td><strong>Momentum</strong></td>
      <td>$$\theta - v_t$$ where $$v_t = \beta v_{t-1} + \alpha \nabla J$$</td>
      <td>Accumulate past gradients</td>
      <td>$$\alpha, \beta$$</td>
    </tr>
    <tr>
      <td><strong>RMSProp</strong></td>
      <td>$$\theta - \frac{\alpha}{\sqrt{s_t + \epsilon}} \nabla J$$</td>
      <td>Per-parameter adaptive rates</td>
      <td>$$\alpha, \beta$$</td>
    </tr>
    <tr>
      <td><strong>Adam</strong></td>
      <td>$$\theta - \frac{\alpha}{\sqrt{\hat{v}_t} + \epsilon} \hat{m}_t$$</td>
      <td>Momentum + adaptive rates + bias correction</td>
      <td>$$\alpha, \beta_1, \beta_2$$</td>
    </tr>
  </tbody>
</table>

### When to use what?

- **Adam** is the default choice for most deep learning tasks. Its defaults ($$\alpha = 0.001$$, $$\beta_1 = 0.9$$, $$\beta_2 = 0.999$$) work well out of the box.
- **SGD + Momentum** often generalizes better than Adam on well-tuned models (especially in computer vision), but requires more careful learning rate tuning and scheduling.
- **RMSProp** is popular for recurrent neural networks and reinforcement learning.
- **Batch GD** is mainly used for small datasets or convex problems where you want deterministic convergence.

### What is Next?

In the next chapter, we will put these optimizers to work training **neural networks from scratch**. We will build a multi-layer perceptron, implement backpropagation, and use Adam to train it on real data, all interactively in the browser.

<div class="demo-hint">
  <strong>Key takeaway:</strong> The optimizer is not just a knob to turn, it fundamentally shapes how your model navigates the loss landscape. Understanding the tradeoffs between speed, stability, and generalization will make you a better practitioner. When in doubt, start with Adam and tune from there.
</div>
