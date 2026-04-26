---
layout: post
title: "Gradient Descent Deep Dive: From SGD to Adam"
author: bharathikannan
categories: [Machine learning]
series: true
hidden: true
description: "Explore gradient descent optimizers interactively. Race SGD, Momentum, RMSProp, and Adam side-by-side, tune learning rates, escape saddle points, and compare mini-batch vs batch - all in your browser."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /gradient-descent/
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
.rms-bars {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.6rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
}
.rms-bar-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.rms-bar-label {
  min-width: 3.4rem;
  color: var(--text-secondary);
}
.rms-bar-track {
  flex: 1;
  height: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}
.rms-bar-fill {
  height: 100%;
  background: var(--accent);
  width: 100%;
  transition: width 0.12s linear;
}
.rms-bar-val {
  min-width: 6rem;
  color: var(--text-secondary);
  text-align: right;
}
</style>

<script>
// Shared utilities for all gradient descent demos
window.GD = (function() {
  function getColors() { return window.Viz.colors(); }

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

In our previous chapters on [linear regression]({% post_url 2026-03-16-linear-regression-from-scratch-interactive %}) and [logistic regression]({% post_url 2026-03-16-logistic-regression-from-scratch-interactive %}), we used gradient descent to find the optimal parameters for our model. We treated it as a black box: compute gradients, multiply by learning rate, update weights. But in practice, the choice of optimizer can make or break your model's training, and a poorly tuned optimizer might never converge, oscillate wildly, or get stuck in saddle points. In this chapter, we will dive deep into gradient descent and explore the family of optimizers that power modern deep learning, from vanilla SGD all the way to Adam, with an interactive demo for every concept so you can build real intuition.

In this guide, you will:

- See how learning rate, momentum, and per-parameter scaling each shape the path an optimizer takes
- Compare SGD, Momentum, RMSProp, and Adam side by side on the same loss surface
- Build intuition for why Adam works so well in practice and where SGD with momentum still wins

---

## 1. The Core Idea: Follow the Slope Downhill

All gradient-based optimizers share the same fundamental principle: compute the gradient of the loss with respect to the parameters, then update the parameters in the direction that decreases the loss. Think of it as standing on a hilly landscape in dense fog: you cannot see the valley, but you can feel the slope under your feet, so you take a step in the steepest downhill direction, feel the slope again, and repeat. The question is: how big should each step be, and should we remember anything about previous steps?

The general update rule is:

$$\theta_{t+1} = \theta_t - \alpha \nabla_\theta J(\theta_t)$$

where $$\alpha$$ is the learning rate, $$\nabla_\theta J(\theta_t)$$ is the gradient of the loss, and $$\theta$$ represents our parameters. Before we jump into 2D contour plots, let's build intuition with a simple 1D example. Consider the loss function $$J(\theta) = \theta^2$$, whose gradient is just the slope $$\nabla J = 2\theta$$, so each step moves $$\theta$$ by $$\alpha \times \text{slope}$$. Click on the curve to set a starting point, then step through gradient descent one update at a time and watch how the tangent line determines both the step direction and size.

<div class="interactive-demo" id="demo-1d-gd">
  <canvas id="canvas-1d-gd" width="680" height="300"></canvas>
  <div class="demo-controls">
    <label>α: <input type="range" id="lr-1d" min="0.01" max="1.5" step="0.01" value="0.3"></label>
    <span class="demo-value" id="lr-1d-val">0.30</span>
    <button id="btn-1d-step">Step</button>
    <button id="btn-1d-animate">Animate</button>
    <button id="btn-1d-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-1d">Click on the curve to set a starting point.</div>
  <div class="demo-caption">Settings: J(θ) = θ². Click on the curve to start, then Step or Animate.</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-1d-gd');
  var W = 680, H = 300;
  var ctx = GD.setupCanvas(canvas, W, H);
  var colors = GD.getColors();

  var padL = 50, padR = 20, padT = 20, padB = 45;
  var pw = W - padL - padR;
  var ph = H - padT - padB;

  var thetaMin = -3, thetaMax = 3;
  var lossMin = -0.5, lossMax = 9.5;

  var theta = null;
  var history = [];
  var running = false;
  var animId = null;
  var stepCount = 0;

  function loss(t) { return t * t; }
  function grad(t) { return 2 * t; }

  function thetaToX(t) { return padL + (t - thetaMin) / (thetaMax - thetaMin) * pw; }
  function lossToY(l) { return padT + ph - (l - lossMin) / (lossMax - lossMin) * ph; }
  function xToTheta(px) { return thetaMin + (px - padL) / pw * (thetaMax - thetaMin); }

  function getLr() { return parseFloat(document.getElementById('lr-1d').value); }

  function draw() {
    colors = GD.getColors();
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    for (var t = Math.ceil(thetaMin); t <= Math.floor(thetaMax); t++) {
      var x = thetaToX(t);
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + ph); ctx.stroke();
    }
    for (var l = 0; l <= 9; l += 1) {
      var y = lossToY(l);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, padT + ph); ctx.lineTo(padL + pw, padT + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + ph); ctx.stroke();

    // Axis labels
    ctx.fillStyle = colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('θ', padL + pw / 2, H - 5);
    ctx.save();
    ctx.translate(14, padT + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('J(θ)', 0, 0);
    ctx.restore();

    // Tick labels
    ctx.fillStyle = colors.textMuted;
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var t = Math.ceil(thetaMin); t <= Math.floor(thetaMax); t++) {
      ctx.fillText(t.toString(), thetaToX(t), padT + ph + 14);
    }
    ctx.textAlign = 'right';
    for (var l = 0; l <= 9; l += 2) {
      ctx.fillText(l.toString(), padL - 6, lossToY(l) + 3);
    }

    // Draw the parabola
    ctx.strokeStyle = colors.momentum;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i <= 200; i++) {
      var t = thetaMin + (thetaMax - thetaMin) * i / 200;
      var x = thetaToX(t);
      var y = lossToY(loss(t));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Minimum marker
    ctx.beginPath();
    ctx.arc(thetaToX(0), lossToY(0), 5, 0, Math.PI * 2);
    ctx.fillStyle = colors.accent;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (theta === null) return;

    var g = grad(theta);
    var lr = getLr();
    var l = loss(theta);

    // Draw tangent line
    var tangentLen = 1.5;
    var t1 = theta - tangentLen;
    var l1 = l + g * (t1 - theta);
    var t2 = theta + tangentLen;
    var l2 = l + g * (t2 - theta);
    ctx.strokeStyle = colors.rmsprop;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(thetaToX(t1), lossToY(l1));
    ctx.lineTo(thetaToX(t2), lossToY(l2));
    ctx.stroke();
    ctx.setLineDash([]);

    // Label the slope
    ctx.fillStyle = colors.rmsprop;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    var slopeLabelX = thetaToX(t2) + 5;
    var slopeLabelY = lossToY(l2) - 5;
    if (slopeLabelX > W - 80) { slopeLabelX = thetaToX(t1) - 5; ctx.textAlign = 'right'; }
    ctx.fillText('slope = ' + g.toFixed(2), slopeLabelX, slopeLabelY);

    // Draw step arrow on the x-axis area
    var newTheta = theta - lr * g;
    var arrowY = lossToY(-0.15);
    var fromX = thetaToX(theta);
    var toX = thetaToX(Math.max(thetaMin, Math.min(thetaMax, newTheta)));
    ctx.strokeStyle = colors.sgd;
    ctx.fillStyle = colors.sgd;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(fromX, arrowY);
    ctx.lineTo(toX, arrowY);
    ctx.stroke();
    // Arrowhead
    var dir = toX > fromX ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(toX, arrowY);
    ctx.lineTo(toX - dir * 8, arrowY - 5);
    ctx.lineTo(toX - dir * 8, arrowY + 5);
    ctx.closePath();
    ctx.fill();

    // Step label
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = colors.sgd;
    var stepSize = (lr * g);
    ctx.fillText('step = ' + lr.toFixed(2) + ' × ' + Math.abs(g).toFixed(2) + ' = ' + Math.abs(stepSize).toFixed(2), (fromX + toX) / 2, arrowY + 16);

    // Draw history path (dots along the curve)
    ctx.fillStyle = colors.sgd;
    for (var i = 0; i < history.length; i++) {
      var hx = thetaToX(history[i]);
      var hy = lossToY(loss(history[i]));
      ctx.beginPath();
      ctx.arc(hx, hy, 2.5, 0, Math.PI * 2);
      ctx.globalAlpha = 0.4;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw current position dot
    ctx.beginPath();
    ctx.arc(thetaToX(theta), lossToY(l), 7, 0, Math.PI * 2);
    ctx.fillStyle = colors.sgd;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Info
    document.getElementById('info-1d').textContent =
      'Step ' + stepCount + ' | θ = ' + theta.toFixed(4) + ' | J(θ) = ' + l.toFixed(4) + ' | gradient = ' + g.toFixed(4);
  }

  function doStep() {
    if (theta === null) return;
    var lr = getLr();
    var g = grad(theta);
    history.push(theta);
    theta = theta - lr * g;
    stepCount++;
    // Check divergence
    if (Math.abs(theta) > 100) {
      running = false;
      if (animId) cancelAnimationFrame(animId);
      document.getElementById('info-1d').textContent = 'Diverged! θ went to ' + theta.toFixed(1) + '. Try a smaller α or reset.';
      theta = Math.max(-3, Math.min(3, theta));
    }
    draw();
  }

  var lastAnimTime = 0;
  function animLoop(ts) {
    if (!running) return;
    if (ts - lastAnimTime > 250) {
      lastAnimTime = ts;
      doStep();
      if (loss(theta) < 0.0001) {
        running = false;
        document.getElementById('info-1d').textContent += ' - Converged!';
        return;
      }
    }
    animId = requestAnimationFrame(animLoop);
  }

  document.getElementById('btn-1d-step').addEventListener('click', function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    doStep();
  });

  document.getElementById('btn-1d-animate').addEventListener('click', function() {
    if (theta === null) return;
    running = true;
    lastAnimTime = 0;
    animId = requestAnimationFrame(animLoop);
  });

  document.getElementById('btn-1d-reset').addEventListener('click', function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    theta = null; history = []; stepCount = 0;
    document.getElementById('info-1d').textContent = 'Click on the curve to set a starting point.';
    draw();
  });

  document.getElementById('lr-1d').addEventListener('input', function() {
    document.getElementById('lr-1d-val').textContent = parseFloat(this.value).toFixed(2);
    draw();
  });

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var mx = (e.clientX - rect.left) * (W / rect.width);
    var t = xToTheta(mx);
    t = Math.max(thetaMin + 0.1, Math.min(thetaMax - 0.1, t));
    theta = t;
    history = [];
    stepCount = 0;
    running = false;
    if (animId) cancelAnimationFrame(animId);
    draw();
  });

  draw();
  GD.onThemeChange(draw);
})();
</script>

---

## 2. Vanilla Gradient Descent (Batch GD)

The simplest optimizer computes the gradient over the entire dataset and takes one step:

$$\theta := \theta - \alpha \nabla_\theta J(\theta)$$

This is called Batch Gradient Descent because it uses the full training dataset for every update. Since each step is based on the exact gradient over all training examples, the path is smooth and deterministic, and a fixed dataset, model, starting point, and learning rate will trace the same path each time. The downside is speed: large datasets force you to compute the gradient over every example before taking even a single step. Click anywhere on the contour plot below to set a starting point, then watch batch gradient descent move toward the minimum, and adjust the learning rate to see how it affects convergence.

<div class="interactive-demo" id="demo-vanilla">
  <canvas id="canvas-vanilla" width="680" height="400"></canvas>
  <div class="demo-controls">
    <label>Learning Rate (α): <input type="range" id="lr-vanilla" min="0.0001" max="0.01" step="0.0001" value="0.003"></label>
    <span class="demo-value" id="lr-vanilla-val">0.0030</span>
    <button id="btn-vanilla-start">Start</button>
    <button id="btn-vanilla-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-vanilla">Click on the contour plot to set a starting point.</div>
  <div class="demo-caption">Settings: Rosenbrock surface, minimum at (1, 1). Click to start, then press Start.</div>
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

- Too small ($$\alpha = 0.0001$$): steps are tiny, training takes forever, and you might run out of patience or compute budget before reaching the minimum.
- Just right ($$\alpha = 0.003$$): smooth, steady convergence to the minimum in a reasonable number of steps.
- Too large ($$\alpha = 0.02$$): steps overshoot the minimum, the optimizer bounces back and forth, and may even diverge, moving farther and farther from the solution.

The canvases below show the same surface and the same starting point at three different learning rates, so you can see how dramatically the behavior changes from one setting to the next. Use the scale slider to adjust all three learning rates simultaneously and find the sweet spot for this problem. Note that the optimal learning rate can vary widely across different problems, so experimentation is key!

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
  <div class="demo-caption">Settings: Rosenbrock surface, fixed start at (-1.5, 2.5), three side-by-side α values.</div>
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

Batch GD computes the gradient over the entire dataset before making a single step. When datasets are large (millions of samples), this is extremely slow. Stochastic Gradient Descent fixes this by using a single random sample per update:

$$\theta := \theta - \alpha \nabla_\theta J(\theta;\; x^{(i)}, y^{(i)})$$

The gradient from a single sample is a noisy estimate of the true gradient, which makes the path zigzag, but the noise has a surprising benefit: it can help the optimizer escape shallow local minima and explore more of the loss surface. The demo below trains a real linear model $$\hat{y} = wx + b$$ on a small noisy dataset and visualizes the path of both optimizers on the actual MSE loss surface in $$(w, b)$$ parameter space. Each tick is one epoch of compute: Batch GD performs one update using the gradient averaged over all $$N$$ samples, while SGD performs $$N$$ updates each based on a single random sample, so both consume the same total gradient computations per tick. SGD's path zigzags because each step is based on a single example, but it covers far more ground per unit compute, which is why SGD often wins in wall-clock time on large datasets.

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
    <label>Learning Rate (α): <input type="range" id="lr-sgd" min="0.005" max="0.2" step="0.005" value="0.04"></label>
    <span class="demo-value" id="lr-sgd-val">0.040</span>
    <button id="btn-sgd-run">Run</button>
    <button id="btn-sgd-reset">Reset</button>
    <button id="btn-sgd-newdata">New Data</button>
  </div>
  <div class="demo-info" id="info-sgd">Press "Run" to train a linear model with Batch GD vs SGD.</div>
  <div class="demo-caption">Settings: linear model ŷ = wx + b on N=50 noisy samples, MSE loss surface over (w, b). One epoch = 1 batch update or N SGD updates (equal compute).</div>
</div>

<script>
(function() {
  var canvasB = document.getElementById('canvas-sgd-batch');
  var canvasS = document.getElementById('canvas-sgd-stoch');
  var CW = 330, CH = 330;
  var ctxB = GD.setupCanvas(canvasB, CW, CH);
  var ctxS = GD.setupCanvas(canvasS, CW, CH);

  // Parameter space: w (slope) on x-axis, b (intercept) on y-axis
  var wMin = -1, wMax = 5, bMin = -3, bMax = 2;
  var startW = -0.5, startB = 1.7;
  var w_true = 2.0, b_true = -1.0;

  // Real dataset: y = w_true*x + b_true + Gaussian noise
  var N = 50;
  var data = [];
  function gauss() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  function generateData() {
    data = [];
    for (var i = 0; i < N; i++) {
      var x = (Math.random() - 0.5) * 4; // x in [-2, 2]
      var y = w_true * x + b_true + gauss() * 0.6;
      data.push({ x: x, y: y });
    }
  }
  generateData();

  // MSE loss = (1/N) * sum (w*x_i + b - y_i)^2
  function lossFn(w, b) {
    var s = 0;
    for (var i = 0; i < N; i++) {
      var d = w * data[i].x + b - data[i].y;
      s += d * d;
    }
    return s / N;
  }
  function batchGrad(w, b) {
    var dw = 0, db = 0;
    for (var i = 0; i < N; i++) {
      var d = w * data[i].x + b - data[i].y;
      dw += 2 * d * data[i].x;
      db += 2 * d;
    }
    return { dw: dw / N, db: db / N };
  }
  function sampleGrad(w, b, idx) {
    var d = w * data[idx].x + b - data[idx].y;
    return { dw: 2 * d * data[idx].x, db: 2 * d };
  }

  // Cache rendered contour image: only recompute on data or theme change
  var contourCanvas = null;
  var contourLayout = null;
  function rebuildContourCache() {
    var dpr = window.devicePixelRatio || 1;
    var oc = document.createElement('canvas');
    oc.width = CW * dpr;
    oc.height = CH * dpr;
    var octx = oc.getContext('2d');
    octx.scale(dpr, dpr);
    var colors = GD.getColors();
    octx.fillStyle = colors.bg;
    octx.fillRect(0, 0, CW, CH);
    contourLayout = GD.drawContours(octx, CW, CH, lossFn, wMin, wMax, bMin, bMax, colors, 18);
    GD.drawMinimum(octx, w_true, b_true, wMin, wMax, bMin, bMax,
      contourLayout.pad, contourLayout.pw, contourLayout.ph, colors);
    contourCanvas = oc;
  }
  rebuildContourCache();

  // Shuffled index sequence so SGD walks each example once per epoch
  var sgdIndices = [];
  var sgdIdx = 0;
  function shuffleIndices() {
    sgdIndices = [];
    for (var i = 0; i < N; i++) sgdIndices.push(i);
    for (var i = N - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = sgdIndices[i]; sgdIndices[i] = sgdIndices[j]; sgdIndices[j] = t;
    }
    sgdIdx = 0;
  }

  var pathB = [], pathS = [];
  var running = false, animId = null, epoch = 0, maxEpochs = 300;

  function getLr() { return parseFloat(document.getElementById('lr-sgd').value); }

  function drawAll() {
    var colors = GD.getColors();
    if (!contourCanvas) rebuildContourCache();
    var lay = contourLayout;
    var dpr = window.devicePixelRatio || 1;

    ctxB.clearRect(0, 0, CW, CH);
    ctxB.drawImage(contourCanvas, 0, 0, contourCanvas.width, contourCanvas.height, 0, 0, CW, CH);
    if (pathB.length > 1) {
      GD.drawPath(ctxB, pathB, colors.momentum, wMin, wMax, bMin, bMax,
        lay.pad, lay.pw, lay.ph, 2);
    }
    GD.drawStart(ctxB, startW, startB, wMin, wMax, bMin, bMax,
      lay.pad, lay.pw, lay.ph);

    ctxS.clearRect(0, 0, CW, CH);
    ctxS.drawImage(contourCanvas, 0, 0, contourCanvas.width, contourCanvas.height, 0, 0, CW, CH);
    if (pathS.length > 1) {
      GD.drawPath(ctxS, pathS, colors.sgd, wMin, wMax, bMin, bMax,
        lay.pad, lay.pw, lay.ph, 1.2);
    }
    GD.drawStart(ctxS, startW, startB, wMin, wMax, bMin, bMax,
      lay.pad, lay.pw, lay.ph);
  }

  function animate() {
    if (!running || epoch >= maxEpochs) { running = false; return; }
    var lr = getLr();

    // Batch GD: one update using the full-dataset gradient
    var curB = pathB[pathB.length - 1];
    var gB = batchGrad(curB.x, curB.y);
    var nwB = curB.x - lr * gB.dw;
    var nbB = curB.y - lr * gB.db;
    if (!isFinite(nwB) || !isFinite(nbB) || Math.abs(nwB) > 100 || Math.abs(nbB) > 100) {
      running = false;
      document.getElementById('info-sgd').textContent = 'Batch GD diverged. Lower the learning rate.';
      return;
    }
    pathB.push({ x: nwB, y: nbB });

    // SGD: N single-sample updates (= one epoch, same compute as one batch step)
    for (var k = 0; k < N; k++) {
      if (sgdIdx >= sgdIndices.length) shuffleIndices();
      var idx = sgdIndices[sgdIdx++];
      var curS = pathS[pathS.length - 1];
      var gS = sampleGrad(curS.x, curS.y, idx);
      var nwS = curS.x - lr * gS.dw;
      var nbS = curS.y - lr * gS.db;
      if (!isFinite(nwS) || !isFinite(nbS) || Math.abs(nwS) > 100 || Math.abs(nbS) > 100) {
        running = false;
        document.getElementById('info-sgd').textContent = 'SGD diverged. Lower the learning rate.';
        drawAll();
        return;
      }
      pathS.push({ x: nwS, y: nbS });
    }

    epoch++;
    var lB = lossFn(pathB[pathB.length - 1].x, pathB[pathB.length - 1].y);
    var lS = lossFn(pathS[pathS.length - 1].x, pathS[pathS.length - 1].y);
    document.getElementById('info-sgd').textContent =
      'Epoch ' + epoch +
      ' | Batch: ' + epoch + ' updates, loss=' + lB.toFixed(4) +
      ' | SGD: ' + (epoch * N) + ' updates, loss=' + lS.toFixed(4);
    drawAll();
    animId = requestAnimationFrame(animate);
  }

  document.getElementById('lr-sgd').addEventListener('input', function() {
    document.getElementById('lr-sgd-val').textContent = parseFloat(this.value).toFixed(3);
  });

  document.getElementById('btn-sgd-run').addEventListener('click', function() {
    if (running) return;
    pathB = [{ x: startW, y: startB }];
    pathS = [{ x: startW, y: startB }];
    shuffleIndices();
    epoch = 0;
    running = true;
    animate();
  });

  document.getElementById('btn-sgd-reset').addEventListener('click', function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    pathB = []; pathS = []; epoch = 0;
    document.getElementById('info-sgd').textContent = 'Press "Run" to train a linear model with Batch GD vs SGD.';
    drawAll();
  });

  document.getElementById('btn-sgd-newdata').addEventListener('click', function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    generateData();
    rebuildContourCache();
    pathB = []; pathS = []; epoch = 0;
    document.getElementById('info-sgd').textContent = 'New dataset generated. Press "Run".';
    drawAll();
  });

  drawAll();
  GD.onThemeChange(function() {
    rebuildContourCache();
    drawAll();
  });
})();
</script>

---

## Building Block: Exponential Moving Averages

Before diving into Momentum, RMSProp, and Adam, let's understand the mathematical primitive they all share: the exponential moving average (EMA). Given a noisy sequence of values $$g_1, g_2, \ldots$$ (think: gradients at each training step), the EMA produces a smoothed version:

$$\bar{g}_t = \beta \, \bar{g}_{t-1} + (1 - \beta) \, g_t$$

The hyperparameter $$\beta$$ controls how much history to retain. A higher $$\beta$$ means heavier smoothing (the average "remembers" roughly the last $$\frac{1}{1 - \beta}$$ values). This is exactly the operation inside Momentum (smoothing gradients), RMSProp (smoothing squared gradients), and Adam (both). Drag the $$\beta$$ slider below to see how EMA transforms a noisy gradient signal into a smooth trend. This is the core idea behind all the optimizers we'll cover next. By adjusting $$\beta$$, you can see how the smoothed signal becomes more or less responsive to recent changes in the raw gradient.

<div class="interactive-demo" id="demo-ema">
  <canvas id="canvas-ema" width="680" height="280"></canvas>
  <div class="demo-controls">
    <label>β: <input type="range" id="beta-ema" min="0" max="0.99" step="0.01" value="0.9"></label>
    <span class="demo-value" id="beta-ema-val">0.90</span>
    <button id="btn-ema-regen">Regenerate Signal</button>
  </div>
  <div class="demo-info" id="info-ema">β = 0.90 | Effective window ≈ 10 steps</div>
  <div class="demo-caption">Settings: noisy gradient signal (faded) vs EMA-smoothed signal (blue), β slider from 0 to 0.99.</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-ema');
  var W = 680, H = 280;
  var ctx = GD.setupCanvas(canvas, W, H);
  var colors = GD.getColors();

  var padL = 50, padR = 20, padT = 25, padB = 40;
  var pw = W - padL - padR;
  var ph = H - padT - padB;

  var N = 100;
  var signal = [];

  // Box-Muller for Gaussian noise
  function randn() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function generateSignal() {
    signal = [];
    // Simulate gradient magnitudes during training: starts high, trends down, with spikes
    for (var i = 0; i < N; i++) {
      var base = 2.0 * Math.exp(-i / 40) + 0.3 * Math.sin(i / 8);
      var spike = (Math.random() < 0.08) ? randn() * 1.5 : 0;
      signal.push(base + randn() * 0.6 + spike);
    }
  }

  function computeEMA(beta) {
    var ema = [];
    var s = 0;
    for (var i = 0; i < signal.length; i++) {
      s = beta * s + (1 - beta) * signal[i];
      ema.push(s);
    }
    return ema;
  }

  function draw() {
    colors = GD.getColors();
    var beta = parseFloat(document.getElementById('beta-ema').value);
    var ema = computeEMA(beta);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    // Compute y range
    var allVals = signal.concat(ema);
    var yMin = Infinity, yMax = -Infinity;
    for (var i = 0; i < allVals.length; i++) {
      if (allVals[i] < yMin) yMin = allVals[i];
      if (allVals[i] > yMax) yMax = allVals[i];
    }
    var yPad = (yMax - yMin) * 0.1;
    yMin -= yPad; yMax += yPad;

    function tToX(t) { return padL + t / (N - 1) * pw; }
    function vToY(v) { return padT + ph - (v - yMin) / (yMax - yMin) * ph; }

    // Grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    for (var t = 0; t < N; t += 10) {
      var x = tToX(t);
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + ph); ctx.stroke();
    }

    // Zero line
    if (yMin < 0 && yMax > 0) {
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      var zy = vToY(0);
      ctx.beginPath(); ctx.moveTo(padL, zy); ctx.lineTo(padL + pw, zy); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Axes
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, padT + ph); ctx.lineTo(padL + pw, padT + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + ph); ctx.stroke();

    // Axis labels
    ctx.fillStyle = colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time step (t)', padL + pw / 2, H - 5);
    ctx.save();
    ctx.translate(14, padT + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Gradient value', 0, 0);
    ctx.restore();

    // Tick labels
    ctx.fillStyle = colors.textMuted;
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var t = 0; t < N; t += 20) {
      ctx.fillText(t.toString(), tToX(t), padT + ph + 14);
    }

    // Draw raw signal (faded dots + thin line)
    ctx.strokeStyle = colors.textMuted;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < signal.length; i++) {
      var x = tToX(i), y = vToY(signal[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Dots
    for (var i = 0; i < signal.length; i++) {
      ctx.beginPath();
      ctx.arc(tToX(i), vToY(signal[i]), 2, 0, Math.PI * 2);
      ctx.fillStyle = colors.textMuted;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw EMA line (thick, blue)
    ctx.strokeStyle = colors.momentum;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i < ema.length; i++) {
      var x = tToX(i), y = vToY(ema[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Effective window annotation
    var effWindow = beta < 1 ? (1 / (1 - beta)) : Infinity;
    var windowStr = beta < 1 ? Math.round(effWindow).toString() : '∞';
    document.getElementById('info-ema').textContent =
      'β = ' + beta.toFixed(2) + ' | Effective window ≈ ' + windowStr + ' steps';

    // Draw legend
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    // Raw signal legend
    ctx.fillStyle = colors.textMuted;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(padL + 10, padT + 8, 18, 3);
    ctx.globalAlpha = 1;
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('Raw gradients', padL + 32, padT + 13);
    // EMA legend
    ctx.fillStyle = colors.momentum;
    ctx.fillRect(padL + 10, padT + 23, 18, 3);
    ctx.fillText('EMA smoothed', padL + 32, padT + 28);
  }

  document.getElementById('beta-ema').addEventListener('input', function() {
    document.getElementById('beta-ema-val').textContent = parseFloat(this.value).toFixed(2);
    draw();
  });

  document.getElementById('btn-ema-regen').addEventListener('click', function() {
    generateSignal();
    draw();
  });

  generateSignal();
  draw();
  GD.onThemeChange(draw);
})();
</script>

---

## 5. Momentum

Vanilla GD can oscillate when the loss surface is shaped like a narrow valley, steep in one direction and shallow in another, so instead of moving directly toward the minimum it keeps bouncing back and forth across the steep sides while making only slow progress along the valley floor. Momentum helps fix this by maintaining a velocity that accumulates past gradients, like a ball rolling downhill that builds up speed in directions that stay consistent and reduces oscillations in directions that keep changing, which lets the optimizer move more smoothly and usually faster toward the minimum.

$$v_t = \beta \, v_{t-1} + \alpha \, \nabla_\theta J(\theta)$$

$$\theta := \theta - v_t$$

The hyperparameter $$\beta$$ (typically 0.9) controls how much of the previous velocity is retained, so a higher $$\beta$$ means more momentum and the optimizer remembers more of its earlier direction. Both panels in the demo share the same elongated bowl, start point, and learning rate. Setting $$\beta = 0$$ recovers vanilla GD; increasing it produces a smoother, faster path along the valley.

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
  <div class="demo-caption">Settings: elongated bowl f(x,y) = x² + 50y², shared α and start, β controls velocity retention.</div>
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

  var vDiverged = false, mDiverged = false;
  function outOfBounds(p) {
    return Math.abs(p.x) > xMax + 0.5 || Math.abs(p.y) > yMax + 0.5 || !isFinite(p.x) || !isFinite(p.y);
  }

  function animate() {
    if (!running || step >= maxSteps) { running = false; return; }
    var lr = getLr();
    var beta = getBeta();

    // Vanilla GD
    if (!vDiverged) {
      var curV = pathV[pathV.length - 1];
      var gV = GD.elongatedGrad(curV.x, curV.y);
      var nextV = { x: curV.x - lr * gV.dx, y: curV.y - lr * gV.dy };
      if (outOfBounds(nextV)) vDiverged = true;
      else pathV.push(nextV);
    }

    // Momentum GD
    if (!mDiverged) {
      var curM = pathM[pathM.length - 1];
      var gM = GD.elongatedGrad(curM.x, curM.y);
      vx = beta * vx + lr * gM.dx;
      vy = beta * vy + lr * gM.dy;
      var nextM = { x: curM.x - vx, y: curM.y - vy };
      if (outOfBounds(nextM)) mDiverged = true;
      else pathM.push(nextM);
    }

    step++;
    var lV = vDiverged ? Infinity : GD.elongated(pathV[pathV.length - 1].x, pathV[pathV.length - 1].y);
    var lM = mDiverged ? Infinity : GD.elongated(pathM[pathM.length - 1].x, pathM[pathM.length - 1].y);
    var vTxt = vDiverged ? 'diverged' : lV.toFixed(4);
    var mTxt = mDiverged ? 'diverged' : lM.toFixed(4);
    document.getElementById('info-mom').textContent = 'Step ' + step + ' | Vanilla Loss: ' + vTxt + ' | Momentum Loss: ' + mTxt;
    drawAll();

    if ((vDiverged || lV < 0.0001) && (mDiverged || lM < 0.0001)) { running = false; return; }
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
    vDiverged = false; mDiverged = false;
    step = 0; running = true;
    animate();
  });

  document.getElementById('btn-mom-reset').addEventListener('click', function() {
    running = false; if (animId) cancelAnimationFrame(animId);
    pathV = []; pathM = []; vx = 0; vy = 0; step = 0;
    vDiverged = false; mDiverged = false;
    document.getElementById('info-mom').textContent = 'Press "Run" to compare vanilla GD vs Momentum.';
    drawAll();
  });

  drawAll();
  GD.onThemeChange(drawAll);
})();
</script>

Notice that the velocity update has the same shape as the EMA recurrence from the previous section, just with $$\alpha$$ folded into the new term in place of $$(1 - \beta)$$, so $$v_t$$ is a running average of recent gradients with effective window $$\frac{1}{1 - \beta}$$. Consistent gradients along the valley accumulate inside this average and the velocity grows; oscillating gradients across the walls cancel out and the net step shrinks. At $$\beta = 0$$ the average has no memory and the update reduces to vanilla GD.

---

## 6. RMSProp

Momentum helps with acceleration, but it treats all parameters equally, which is a problem when some parameters need larger updates and others need smaller ones. RMSProp (Root Mean Square Propagation) adapts the learning rate per parameter by tracking the running average of squared gradients, so parameters with large gradients get smaller effective learning rates and vice versa.

$$s_t = \beta \, s_{t-1} + (1 - \beta)(\nabla_\theta J)^2$$

$$\theta := \theta - \frac{\alpha}{\sqrt{s_t + \epsilon}} \nabla_\theta J$$

The trick to reading this update is to look at one parameter at a time. The running average $$s_t$$ is the same EMA we used in the momentum section, except squared, so it acts like a per-dimension volume meter that tracks how loud each parameter's gradients have been recently. The update then divides the step by $$\sqrt{s_t}$$, so a "loud" dimension whose gradients keep being large gets its effective learning rate automatically shrunk, while a "quiet" dimension whose gradients stay small keeps a normal-sized step. On the elongated bowl below this is exactly what we want: the y-direction is loud because the steep walls produce huge gradients, so its step gets damped; the x-direction is quiet because the valley floor is shallow, so its step stays full size. The y-zigzag flattens out, both dimensions move at comparable rates, and the path heads straight for the minimum. Watch the two bars under the RMSProp panel below: they show the live effective learning rate per dimension, and you will see the y-bar collapse within a few steps while the x-bar stays close to the base $$\alpha$$.

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
  <div class="rms-bars">
    <div class="rms-bar-row">
      <span class="rms-bar-label">eff α<sub>x</sub></span>
      <div class="rms-bar-track"><div class="rms-bar-fill" id="rms-fill-x"></div></div>
      <span class="rms-bar-val" id="rms-val-x">α (base)</span>
    </div>
    <div class="rms-bar-row">
      <span class="rms-bar-label">eff α<sub>y</sub></span>
      <div class="rms-bar-track"><div class="rms-bar-fill" id="rms-fill-y"></div></div>
      <span class="rms-bar-val" id="rms-val-y">α (base)</span>
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
  <div class="demo-caption">Settings: elongated bowl f(x,y) = x² + 50y², shared α and start. Bars show RMSProp's effective learning rate per dimension, with full bar = base α.</div>
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

  var vanillaDiverged = false;
  var rmsDiverged = false;
  // Treat anything outside the visible window as divergence so the displayed loss stays meaningful
  function outOfBounds(p) {
    return Math.abs(p.x) > xMax + 0.5 || Math.abs(p.y) > yMax + 0.5 || !isFinite(p.x) || !isFinite(p.y);
  }

  // Update the per-dimension effective-learning-rate bars.
  // Bar width is min(eff α / base α, 1), so a full bar = "no scaling yet"
  // and the bar shrinks as that dimension accumulates squared gradients.
  function updateBars() {
    var lr = getLr();
    var effX = lr / Math.sqrt(sx_rms + eps);
    var effY = lr / Math.sqrt(sy_rms + eps);
    var fillX = Math.min(effX / lr, 1) * 100;
    var fillY = Math.min(effY / lr, 1) * 100;
    document.getElementById('rms-fill-x').style.width = fillX.toFixed(1) + '%';
    document.getElementById('rms-fill-y').style.width = fillY.toFixed(1) + '%';
    document.getElementById('rms-val-x').textContent = effX.toFixed(4) + ' (' + (effX / lr).toFixed(2) + '× α)';
    document.getElementById('rms-val-y').textContent = effY.toFixed(4) + ' (' + (effY / lr).toFixed(2) + '× α)';
  }

  function animate() {
    if (!running || step >= maxSteps) { running = false; return; }
    var lr = getLr();
    var beta = getBeta();

    // Vanilla GD: only step if it has not already diverged
    if (!vanillaDiverged) {
      var curV = pathV[pathV.length - 1];
      var gV = GD.elongatedGrad(curV.x, curV.y);
      var nextV = { x: curV.x - lr * gV.dx, y: curV.y - lr * gV.dy };
      if (outOfBounds(nextV)) {
        vanillaDiverged = true;
      } else {
        pathV.push(nextV);
      }
    }

    // RMSProp
    if (!rmsDiverged) {
      var curR = pathR[pathR.length - 1];
      var gR = GD.elongatedGrad(curR.x, curR.y);
      sx_rms = beta * sx_rms + (1 - beta) * gR.dx * gR.dx;
      sy_rms = beta * sy_rms + (1 - beta) * gR.dy * gR.dy;
      var nextR = {
        x: curR.x - lr / Math.sqrt(sx_rms + eps) * gR.dx,
        y: curR.y - lr / Math.sqrt(sy_rms + eps) * gR.dy
      };
      if (outOfBounds(nextR)) {
        rmsDiverged = true;
      } else {
        pathR.push(nextR);
      }
    }

    step++;
    var lV = vanillaDiverged ? Infinity : GD.elongated(pathV[pathV.length - 1].x, pathV[pathV.length - 1].y);
    var lR = rmsDiverged ? Infinity : GD.elongated(pathR[pathR.length - 1].x, pathR[pathR.length - 1].y);
    var vTxt = vanillaDiverged ? 'diverged' : lV.toFixed(4);
    var rTxt = rmsDiverged ? 'diverged' : lR.toFixed(4);
    document.getElementById('info-rms').textContent = 'Step ' + step + ' | Vanilla: ' + vTxt + ' | RMSProp: ' + rTxt;
    updateBars();
    drawAll();
    if ((vanillaDiverged || lV < 0.0001) && (rmsDiverged || lR < 0.0001)) { running = false; return; }
    animId = requestAnimationFrame(animate);
  }

  function resetBars() {
    document.getElementById('rms-fill-x').style.width = '100%';
    document.getElementById('rms-fill-y').style.width = '100%';
    document.getElementById('rms-val-x').textContent = 'α (base)';
    document.getElementById('rms-val-y').textContent = 'α (base)';
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
    vanillaDiverged = false; rmsDiverged = false;
    step = 0; running = true;
    animate();
  });

  document.getElementById('btn-rms-reset').addEventListener('click', function() {
    running = false; if (animId) cancelAnimationFrame(animId);
    pathV = []; pathR = []; sx_rms = 0; sy_rms = 0; step = 0;
    vanillaDiverged = false; rmsDiverged = false;
    document.getElementById('info-rms').textContent = 'Press "Run" to compare Vanilla GD vs RMSProp.';
    resetBars();
    drawAll();
  });

  resetBars();
  drawAll();
  GD.onThemeChange(drawAll);
})();
</script>

---

## 7. Adam: The Best of Both Worlds

Adam (Adaptive Moment Estimation) combines the ideas of Momentum and RMSProp. It maintains both a first moment (mean of gradients, like Momentum) and a second moment (mean of squared gradients, like RMSProp), plus bias correction to account for the fact that both estimates start at zero.

First moment (momentum):

$$m_t = \beta_1 \, m_{t-1} + (1 - \beta_1) \nabla_\theta J$$

Second moment (adaptive learning rate):

$$v_t = \beta_2 \, v_{t-1} + (1 - \beta_2) (\nabla_\theta J)^2$$

Bias correction:

$$\hat{m}_t = \frac{m_t}{1 - \beta_1^t}, \quad \hat{v}_t = \frac{v_t}{1 - \beta_2^t}$$

Update rule:

$$\theta := \theta - \frac{\alpha}{\sqrt{\hat{v}_t} + \epsilon} \hat{m}_t$$

The default hyperparameters ($$\beta_1 = 0.9$$, $$\beta_2 = 0.999$$, $$\epsilon = 10^{-8}$$) work well across a wide range of problems, which is why Adam is the most popular optimizer in deep learning.

The bias correction is important because both $$m_t$$ and $$v_t$$ are initialized at zero, which makes them biased toward zero during the early training steps. The correction factors $$(1 - \beta_1^t)$$ and $$(1 - \beta_2^t)$$ compensate for this initialization bias and allow the estimates to better reflect the true first and second moments of the gradients from the beginning of training. Without this correction, Adam would take very small steps at first and only gradually increase their size over time, slowing early progress.

---

## 8. Escaping Saddle Points

In high-dimensional optimization problems such as deep learning, saddle points are much more common than local minima. A saddle point is a location where the gradient is zero, but the surface curves upward in one direction and downward in another, like the middle of a horse saddle. Basic gradient descent with a small learning rate can slow down or stall near saddle points because the gradient magnitude becomes very small. Optimizers with momentum keep moving using information from previous gradients, which helps them pass through these flat regions, and Adam goes further by combining momentum with per-parameter adaptive step sizes. On a surface like $$f(x, y) = x^2 - y^2$$ with a saddle at the origin, vanilla GD crawls because the gradient near the saddle is tiny, while Adam's second-moment estimate $$\hat{v}_t$$ also stays small along the flat direction, so the ratio $$\hat{m}_t / \sqrt{\hat{v}_t}$$ keeps the effective step a useful size and pushes the optimizer through.

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
  <div class="demo-caption">Settings: f(x,y) = x² - y² with a saddle at the origin, start near (0.6, 0.05).</div>
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

  function saddleFn(x, y) {
    return x * x - y * y + 0.5;
  }

  function getLr() { return parseFloat(document.getElementById('lr-saddle').value); }

  function draw() {
    var colors = GD.getColors();
    ctx.clearRect(0, 0, W, H);

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
        var t = (v + 4) / 8;
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

    ctx.fillStyle = colors.text;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('x', W / 2, H - 5);
    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('y', 0, 0);
    ctx.restore();

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

    if (pathGD.length > 1) GD.drawPath(ctx, pathGD, colors.sgd, xMin, xMax, yMin, yMax, pad, pw, ph, 2.5);
    if (pathAdam.length > 1) GD.drawPath(ctx, pathAdam, colors.adam, xMin, xMax, yMin, yMax, pad, pw, ph, 2.5);
    GD.drawStart(ctx, sx, sy, xMin, xMax, yMin, yMax, pad, pw, ph);
  }

  function animate() {
    if (!running || step >= maxSteps) { running = false; return; }
    var lr = getLr();
    step++;

    var cGD = pathGD[pathGD.length - 1];
    var gGD = GD.saddleGrad(cGD.x, cGD.y);
    pathGD.push({ x: cGD.x - lr * gGD.dx, y: cGD.y - lr * gGD.dy });

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

In practice, we almost never use pure SGD (batch size = 1) or full Batch GD. Instead, we use mini-batch gradient descent, where each update averages the gradient over a small batch of $$B$$ samples:

$$\theta := \theta - \frac{\alpha}{B} \sum_{i=1}^{B} \nabla_\theta J(\theta;\; x^{(i)}, y^{(i)})$$

The batch size acts as a noise knob:

| Batch Size | Gradient Quality | Update Frequency | GPU Utilization |
|---|---|---|---|
| 1 (pure SGD) | Very noisy | Very fast | Low |
| 32 (typical) | Moderate noise | Fast | Good |
| 256 | Low noise | Moderate | High |
| Full dataset | No noise | Slow | Varies |

Larger batches give smoother gradients but fewer updates per epoch, while smaller batches add noise that can help generalization at the cost of noisier convergence. Each step on a mini-batch costs proportional to $$B$$ in compute, but the gradient noise scales like $$1 / \sqrt{B}$$, so doubling the batch size only halves the noise at quadruple the cost. That diminishing return is why 32 to 256 is the sweet spot in practice: small enough that updates are frequent and gradient noise gives a regularizing effect, large enough that each gradient is a reasonable estimate and the GPU stays busy.

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

- Adam is the default choice for most deep learning tasks. Its defaults ($$\alpha = 0.001$$, $$\beta_1 = 0.9$$, $$\beta_2 = 0.999$$) work well out of the box.
- SGD + Momentum often generalizes better than Adam on well-tuned models (especially in computer vision), but requires more careful learning rate tuning and scheduling.
- RMSProp is popular for recurrent neural networks and reinforcement learning.
- Batch GD is mainly used for small datasets or convex problems where you want deterministic convergence.

The optimizer is not just a knob to turn; it fundamentally shapes how your model navigates the loss landscape, and understanding the tradeoffs between speed, stability, and generalization is what makes the difference between a model that trains and one that does not. When in doubt, start with Adam and tune from there.

#### Continue the ML Series

This post is part of a bigger [Machine Learning from Scratch]({{ site.baseurl }}/ml/) series. If you would like to learn more, check out the other posts in this series. Next up is [Perceptron & MLP]({{ site.baseurl }}/perceptron-mlp/), where we put these optimizers to work training a multi-layer perceptron from scratch.
