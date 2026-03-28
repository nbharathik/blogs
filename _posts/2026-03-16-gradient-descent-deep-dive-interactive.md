---
layout: post
title: "Gradient Descent Deep Dive: From SGD to Adam - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
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
.demo-mode-toggle {
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  font-size: 0.8rem;
}
.demo-mode-toggle button {
  padding: 0.3rem 0.7rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}
.demo-mode-toggle button.active {
  background: var(--accent);
  color: var(--bg-primary);
}
.demo-arrow-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}
.demo-arrow-legend span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.legend-line {
  width: 18px;
  height: 3px;
  display: inline-block;
  border-radius: 2px;
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

In our previous chapters on [linear regression]({% post_url 2026-03-16-linear-regression-from-scratch-interactive %}) and [logistic regression]({% post_url 2026-03-16-logistic-regression-from-scratch-interactive %}), we used gradient descent to find the optimal parameters for our model. We treated it as a black box: compute gradients, multiply by learning rate, update weights. But in practice, the choice of optimizer can make or break your model's training. A poorly tuned optimizer might never converge, oscillate wildly, or get stuck in saddle points.

In this chapter, we will dive deep into the layers of gradient descent and explore the family of optimizers that power modern deep learning, from vanilla SGD all the way to Adam. Every concept comes with an interactive demo so you can build real intuition.

## 1. The Core Idea: Follow the Slope Downhill

All gradient-based optimizers share the same fundamental principle: compute the gradient of the loss with respect to the parameters, then update the parameters in the direction that decreases the loss.

Think of it as standing on a hilly landscape in dense fog. You cannot see the valley, but you can feel the slope under your feet. You take a step in the steepest downhill direction, feel the slope again, and repeat. The question is: how big should each step be, and should we remember anything about previous steps?

The general update rule is:

$$\theta_{t+1} = \theta_t - \alpha \nabla_\theta J(\theta_t)$$

where $$\alpha$$ is the learning rate, $$\nabla_\theta J(\theta_t)$$ is the gradient of the loss, and $$\theta$$ represents our parameters.

Before we jump into 2D contour plots, let's build intuition with a simple 1D example. Consider the loss function $$J(\theta) = \theta^2$$. The gradient is just the slope: $$\nabla J = 2\theta$$. Each step moves $$\theta$$ by $$\alpha \times \text{slope}$$.

Click on the curve to set a starting point, then step through gradient descent one update at a time. Watch how the tangent line (the gradient) determines the step direction and size.

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
</div>

<div class="demo-hint">
  <strong>Try this:</strong> Set α above 1.0 and watch the dot overshoot past the minimum and diverge. Then set α to 0.1 and see how it converges slowly but steadily.
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

This is called Batch Gradient Descent because it uses the full training dataset for every update. Since each step is based on the exact gradient over all training examples, the path is smooth and deterministic. If the dataset, model, starting point, and learning rate are fixed, it will trace the same path each time. However, it can be very slow for large datasets since you have to compute the gradient over the entire dataset for every step.

Click anywhere on the contour plot below to set a starting point, then watch batch gradient descent move toward the minimum. Adjust the learning rate to see how it affects convergence.

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

- Too small ($$\alpha = 0.0001$$): Steps are tiny. Training takes forever. You might run out of patience (or compute budget) before reaching the minimum.
- Just right ($$\alpha = 0.003$$): Smooth, steady convergence to the minimum in a reasonable number of steps.
- Too large ($$\alpha = 0.02$$): Steps overshoot the minimum. The optimizer bounces back and forth, and may even diverge, moving farther and farther from the solution.

The canvases below show the same surface, same starting point, but with different learning rates. Watch how dramatically the behavior changes.

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

Batch GD computes the gradient over the entire dataset before making a single step. When datasets are large (millions of samples), this is extremely slow. Stochastic Gradient Descent fixes this by using a single random sample per update:

$$\theta := \theta - \alpha \nabla_\theta J(\theta;\; x^{(i)}, y^{(i)})$$

The gradient from a single sample is a noisy estimate of the true gradient. This noise makes the path zigzag, but it has a surprising benefit: the noise can help the optimizer escape shallow local minima and explore more of the loss surface.

In the demo below, we compare optimizers under a simple compute-budget view. One animation tick represents one unit of time: Batch GD performs one full-gradient update, while SGD can perform multiple cheaper noisy updates (controlled by the slider). This setup helps explain why SGD often shows faster early progress in wall-clock time, even though its path is less smooth.

<div class="demo-hint">
  <strong>How to read this demo:</strong> This is a synthetic optimization task on the Rosenbrock surface, not a real dataset. Batch GD uses the exact gradient of that surface. SGD is simulated by adding Gaussian noise to each gradient step to mimic single-sample variability. The "SGD updates/tick" control approximates how SGD can take more parameter updates in the same time budget.
</div>

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
    <label>Noise (SGD): <input type="range" id="noise-sgd" min="0" max="3" step="0.1" value="1.0"></label>
    <span class="demo-value" id="noise-sgd-val">1.0</span>
    <label>SGD updates/tick: <input type="range" id="sgd-updates" min="1" max="30" step="1" value="10"></label>
    <span class="demo-value" id="sgd-updates-val">10</span>
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
  function getSgdUpdates() { return parseInt(document.getElementById('sgd-updates').value, 10); }

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
    var sgdUpdates = getSgdUpdates();

    // Batch GD step
    var curB = pathB[pathB.length - 1];
    var gB = GD.rosenbrockGrad(curB.x, curB.y);
    var gnB = Math.sqrt(gB.dx * gB.dx + gB.dy * gB.dy);
    if (gnB > 50) { gB.dx = gB.dx / gnB * 50; gB.dy = gB.dy / gnB * 50; }
    var nxB = curB.x - lr * gB.dx;
    var nyB = curB.y - lr * gB.dy;
    if (Math.abs(nxB) > 10 || Math.abs(nyB) > 10) {
      running = false;
      document.getElementById('info-sgd').textContent = 'Batch diverged. Lower the learning rate.';
      drawAll();
      return;
    }
    pathB.push({ x: nxB, y: nyB });

    // SGD takes multiple cheap, noisy updates per tick
    for (var k = 0; k < sgdUpdates; k++) {
      var curS = pathS[pathS.length - 1];
      var gS = GD.rosenbrockGrad(curS.x, curS.y);
      var gnS = Math.sqrt(gS.dx * gS.dx + gS.dy * gS.dy);
      if (gnS > 50) { gS.dx = gS.dx / gnS * 50; gS.dy = gS.dy / gnS * 50; }

      // Scale noise using clipped norm so the stochastic path stays informative
      var clippedNorm = Math.sqrt(gS.dx * gS.dx + gS.dy * gS.dy);
      var ndx = gS.dx + noise * clippedNorm * gaussRand() * 0.15;
      var ndy = gS.dy + noise * clippedNorm * gaussRand() * 0.15;

      var nxS = curS.x - lr * ndx;
      var nyS = curS.y - lr * ndy;
      if (Math.abs(nxS) > 10 || Math.abs(nyS) > 10) {
        running = false;
        document.getElementById('info-sgd').textContent = 'SGD diverged. Lower learning rate or noise.';
        drawAll();
        return;
      }
      pathS.push({ x: nxS, y: nyS });
    }

    step++;
    var lB = GD.rosenbrock(pathB[pathB.length - 1].x, pathB[pathB.length - 1].y);
    var lS = GD.rosenbrock(pathS[pathS.length - 1].x, pathS[pathS.length - 1].y);
    document.getElementById('info-sgd').textContent =
      'Tick ' + step +
      ' | Batch updates: ' + step +
      ' | SGD updates: ' + (step * sgdUpdates) +
      ' | Batch Loss: ' + lB.toFixed(4) +
      ' | SGD Loss: ' + lS.toFixed(4);
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
  document.getElementById('sgd-updates').addEventListener('input', function() {
    document.getElementById('sgd-updates-val').textContent = parseInt(this.value, 10).toString();
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
</div>
<div class="demo-caption">Noisy gradient signal (faded) vs EMA-smoothed signal (blue). Adjust β to see how smoothing affects responsiveness.</div>

<div class="demo-hint">
  <strong>Try this:</strong> Set β = 0 (no smoothing, EMA equals the raw signal). Then slowly increase to 0.99 and watch the smoothed line flatten. This is exactly what happens inside Momentum and Adam.
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

Vanilla GD can oscillate when the loss surface is shaped like a narrow valley, steep in one direction and shallow in another. Instead of moving directly toward the minimum, it keeps bouncing back and forth across the steep sides while making only slow progress along the valley floor.

Momentum helps fix this by maintaining a velocity that accumulates past gradients. Think of a ball rolling downhill: it builds up speed in directions that stay consistent and reduces oscillations in directions that keep changing. This helps the optimizer move more smoothly and usually faster toward the minimum.

$$v_t = \beta \, v_{t-1} + \alpha \, \nabla_\theta J(\theta)$$

$$\theta := \theta - v_t$$

The hyperparameter $$\beta$$ (typically 0.9) controls how much of the previous velocity is retained. A higher $$\beta$$ means more momentum, so the optimizer remembers more of its earlier direction.

<div class="demo-hint">
  <strong>Setup + how to read:</strong> Both panels use the same synthetic elongated bowl $f(x,y) = x^2 + 50y^2$, start point, and learning rate $\alpha$; only the update rule changes. Vanilla GD uses the current gradient, while Momentum uses velocity memory $v_t = \beta v_{t-1} + \alpha \nabla J$ and updates with $\theta := \theta - v_t$. Each frame is one update in both panels: compare oscillation first, then loss. Set $\beta = 0$ to match vanilla GD, then increase $\beta$ to see smoother, faster convergence.
</div>

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

### How Momentum Builds Up: Step Anatomy

The contour demo above shows the *result* of momentum, a smoother path. But what happens at each individual step? The visualization below decomposes every update into its components:

- The gradient (red arrow) points in the steepest descent direction - this is what vanilla GD would follow
- The velocity (blue arrow) is the accumulated history from past steps - momentum's memory
- The combined step (green arrow) is the actual update: $$v_t = \beta \, v_{t-1} + \alpha \, \nabla J$$

Watch how the velocity arrow grows along the valley direction as momentum builds, while the gradient oscillates across the steep walls.

<div class="interactive-demo" id="demo-mom-anatomy">
  <canvas id="canvas-mom-anatomy" width="560" height="400"></canvas>
  <div class="demo-arrow-legend">
    <span><span class="legend-line" style="background:#f7768e"></span> α·∇J (gradient step)</span>
    <span><span class="legend-line" style="background:#7aa2f7"></span> β·v (velocity history)</span>
    <span><span class="legend-line" style="background:#9ece6a"></span> v_t (combined update)</span>
  </div>
  <div class="demo-controls">
    <label>α: <input type="range" id="lr-mom-anatomy" min="0.001" max="0.02" step="0.001" value="0.007"></label>
    <span class="demo-value" id="lr-mom-anatomy-val">0.007</span>
    <label>β: <input type="range" id="beta-mom-anatomy" min="0" max="0.99" step="0.01" value="0.9"></label>
    <span class="demo-value" id="beta-mom-anatomy-val">0.90</span>
    <div class="demo-mode-toggle" id="mode-mom-anatomy">
      <button class="active" data-mode="step">Step</button>
      <button data-mode="drag">Drag</button>
    </div>
    <button id="btn-mom-anatomy-step">Step</button>
    <button id="btn-mom-anatomy-animate">Animate</button>
    <button id="btn-mom-anatomy-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-mom-anatomy">Step mode: press Step or Animate. Switch to Drag mode to explore freely.</div>
</div>
<div class="demo-caption">Decomposition of a momentum update on the elongated bowl f(x,y) = x² + 50y². Drag mode lets you explore the vector field.</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-mom-anatomy');
  var W = 560, H = 400;
  var ctx = GD.setupCanvas(canvas, W, H);
  var colors = GD.getColors();

  var pad = 40;
  var pw = W - 2 * pad;
  var ph = H - 2 * pad;
  var xMin = -3, xMax = 3, yMin = -1, yMax = 1;

  var posX = 2.5, posY = 0.7;
  var vx = 0, vy = 0;
  var path = [{x: posX, y: posY}];
  var stepCount = 0;
  var mode = 'step';
  var running = false, animId = null;
  var dragging = false;

  function getLr() { return parseFloat(document.getElementById('lr-mom-anatomy').value); }
  function getBeta() { return parseFloat(document.getElementById('beta-mom-anatomy').value); }

  function w2p(x, y) {
    return {
      px: pad + (x - xMin) / (xMax - xMin) * pw,
      py: pad + ph - (y - yMin) / (yMax - yMin) * ph
    };
  }
  function p2w(px, py) {
    return {
      x: xMin + (px - pad) / pw * (xMax - xMin),
      y: yMax - (py - pad) / ph * (yMax - yMin)
    };
  }

  function drawArrow(fromPx, fromPy, toPx, toPy, color, lineW) {
    var dx = toPx - fromPx;
    var dy = toPy - fromPy;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineW || 2.5;
    ctx.beginPath();
    ctx.moveTo(fromPx, fromPy);
    ctx.lineTo(toPx, toPy);
    ctx.stroke();
    // Arrowhead
    var headLen = Math.min(10, len * 0.4);
    var angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(toPx, toPy);
    ctx.lineTo(toPx - headLen * Math.cos(angle - 0.4), toPy - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(toPx - headLen * Math.cos(angle + 0.4), toPy - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  function draw() {
    colors = GD.getColors();
    ctx.clearRect(0, 0, W, H);

    // Draw contours of elongated bowl
    GD.drawContours(ctx, W, H, GD.elongated, xMin, xMax, yMin, yMax, colors, 20);

    // Draw minimum
    GD.drawMinimum(ctx, 0, 0, xMin, xMax, yMin, yMax, pad, pw, ph, colors);

    // Draw path history
    if (path.length > 1) {
      GD.drawPath(ctx, path, 'rgba(156,206,106,0.5)', xMin, xMax, yMin, yMax, pad, pw, ph, 1.5);
    }

    // Current position
    var p = w2p(posX, posY);
    var g = GD.elongatedGrad(posX, posY);
    var lr = getLr();
    var beta = getBeta();

    // Compute arrows in pixel space with adaptive scaling
    // Convert a world-space vector to pixel displacement, then cap to maxLen pixels
    var maxArrowPx = 120;
    function vecToArrow(worldDx, worldDy) {
      // Convert world displacement to pixel displacement
      var pxDx = worldDx / (xMax - xMin) * pw;
      var pxDy = -worldDy / (yMax - yMin) * ph; // flip y
      var len = Math.sqrt(pxDx * pxDx + pxDy * pxDy);
      if (len > maxArrowPx) {
        pxDx = pxDx / len * maxArrowPx;
        pxDy = pxDy / len * maxArrowPx;
      }
      // Ensure minimum visible length if vector is non-trivial
      if (len > 0.5 && len < 15) {
        pxDx = pxDx / len * 15;
        pxDy = pxDy / len * 15;
      }
      return { px: p.px + pxDx, py: p.py + pxDy };
    }

    // Gradient arrow: -alpha * grad (what vanilla GD would do)
    var gEnd = vecToArrow(-lr * g.dx, -lr * g.dy);

    // Velocity arrow: -beta * v (accumulated history direction)
    var vEnd = vecToArrow(-beta * vx, -beta * vy);

    // Combined: v_t = beta*v + alpha*grad; actual update = -v_t
    var combinedX = beta * vx + lr * g.dx;
    var combinedY = beta * vy + lr * g.dy;
    var cEnd = vecToArrow(-combinedX, -combinedY);

    // Draw arrows
    drawArrow(p.px, p.py, gEnd.px, gEnd.py, colors.sgd, 2.5);
    drawArrow(p.px, p.py, vEnd.px, vEnd.py, colors.momentum, 2.5);
    drawArrow(p.px, p.py, cEnd.px, cEnd.py, colors.adam, 3);

    // Current position dot
    ctx.beginPath();
    ctx.arc(p.px, p.py, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Info
    var loss = GD.elongated(posX, posY);
    document.getElementById('info-mom-anatomy').textContent =
      'Step ' + stepCount + ' | pos = (' + posX.toFixed(3) + ', ' + posY.toFixed(3) +
      ') | loss = ' + loss.toFixed(4) +
      ' | |velocity| = ' + Math.sqrt(vx*vx + vy*vy).toFixed(4);
  }

  function doStep() {
    var lr = getLr();
    var beta = getBeta();
    var g = GD.elongatedGrad(posX, posY);
    // Clip gradient
    var gClip = 50;
    if (Math.abs(g.dx) > gClip) g.dx = gClip * Math.sign(g.dx);
    if (Math.abs(g.dy) > gClip) g.dy = gClip * Math.sign(g.dy);

    vx = beta * vx + lr * g.dx;
    vy = beta * vy + lr * g.dy;
    posX = posX - vx;
    posY = posY - vy;
    stepCount++;
    path.push({x: posX, y: posY});

    // Clamp to bounds
    if (Math.abs(posX) > 10 || Math.abs(posY) > 10) {
      running = false;
      if (animId) cancelAnimationFrame(animId);
    }
    draw();
  }

  var lastAnimTime = 0;
  function animLoop(ts) {
    if (!running) return;
    if (ts - lastAnimTime > 150) {
      lastAnimTime = ts;
      doStep();
      if (GD.elongated(posX, posY) < 0.0001) {
        running = false;
        return;
      }
    }
    animId = requestAnimationFrame(animLoop);
  }

  // Mode toggle
  document.getElementById('mode-mom-anatomy').addEventListener('click', function(e) {
    if (e.target.tagName !== 'BUTTON') return;
    mode = e.target.getAttribute('data-mode');
    var btns = this.querySelectorAll('button');
    btns.forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-mode') === mode); });
    var stepBtns = mode === 'step';
    document.getElementById('btn-mom-anatomy-step').style.display = stepBtns ? '' : 'none';
    document.getElementById('btn-mom-anatomy-animate').style.display = stepBtns ? '' : 'none';
    canvas.style.cursor = mode === 'drag' ? 'grab' : 'crosshair';
    if (mode === 'drag') {
      running = false;
      if (animId) cancelAnimationFrame(animId);
      document.getElementById('info-mom-anatomy').textContent = 'Drag mode: click and drag to move the position. Velocity resets on drag start.';
    }
  });

  document.getElementById('btn-mom-anatomy-step').addEventListener('click', function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    doStep();
  });

  document.getElementById('btn-mom-anatomy-animate').addEventListener('click', function() {
    running = true;
    lastAnimTime = 0;
    animId = requestAnimationFrame(animLoop);
  });

  document.getElementById('btn-mom-anatomy-reset').addEventListener('click', function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    posX = 2.5; posY = 0.7; vx = 0; vy = 0; stepCount = 0;
    path = [{x: posX, y: posY}];
    draw();
  });

  // Drag interaction
  canvas.addEventListener('mousedown', function(e) {
    if (mode !== 'drag') return;
    dragging = true;
    canvas.style.cursor = 'grabbing';
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    var my = (e.clientY - rect.top) * (H / rect.height);
    var w = p2w(mx, my);
    posX = Math.max(xMin + 0.1, Math.min(xMax - 0.1, w.x));
    posY = Math.max(yMin + 0.05, Math.min(yMax - 0.05, w.y));
    vx = 0; vy = 0;
    path = [{x: posX, y: posY}];
    stepCount = 0;
    draw();
  });

  canvas.addEventListener('mousemove', function(e) {
    if (!dragging || mode !== 'drag') return;
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    var my = (e.clientY - rect.top) * (H / rect.height);
    var w = p2w(mx, my);
    posX = Math.max(xMin + 0.1, Math.min(xMax - 0.1, w.x));
    posY = Math.max(yMin + 0.05, Math.min(yMax - 0.05, w.y));
    vx = 0; vy = 0;
    path = [{x: posX, y: posY}];
    draw();
  });

  canvas.addEventListener('mouseup', function() { dragging = false; canvas.style.cursor = mode === 'drag' ? 'grab' : 'crosshair'; });
  canvas.addEventListener('mouseleave', function() { dragging = false; });

  // Slider listeners
  document.getElementById('lr-mom-anatomy').addEventListener('input', function() {
    document.getElementById('lr-mom-anatomy-val').textContent = parseFloat(this.value).toFixed(3);
    draw();
  });
  document.getElementById('beta-mom-anatomy').addEventListener('input', function() {
    document.getElementById('beta-mom-anatomy-val').textContent = parseFloat(this.value).toFixed(2);
    draw();
  });

  draw();
  GD.onThemeChange(draw);
})();
</script>

---

## 6. RMSProp

Momentum helps with acceleration, but it treats all parameters equally. What if some parameters need larger updates and others need smaller ones?

RMSProp (Root Mean Square Propagation) adapts the learning rate per parameter by tracking the running average of squared gradients. Parameters with large gradients get smaller effective learning rates, and vice versa.

$$s_t = \beta \, s_{t-1} + (1 - \beta)(\nabla_\theta J)^2$$

$$\theta := \theta - \frac{\alpha}{\sqrt{s_t + \epsilon}} \nabla_\theta J$$

The key insight: on an elongated surface, the y-direction has huge gradients (steep walls) while the x-direction has small gradients (shallow valley floor). RMSProp automatically shrinks the y-updates and boosts the x-updates, producing a path that goes straight to the minimum instead of oscillating.

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

### Inside RMSProp: Per-Dimension Scaling

The contour demo shows that RMSProp takes a straighter path than vanilla GD. But *how* does dividing by $$\sqrt{s_t}$$ achieve this? The visualization below reveals the mechanism:

On the elongated bowl, the y-gradient is huge (steep walls) while the x-gradient is small (shallow valley floor). RMSProp tracks the running average of squared gradients $$s_t$$ per dimension. The y-dimension accumulates a large $$s_t$$, so its effective learning rate $$\frac{\alpha}{\sqrt{s_t + \epsilon}}$$ shrinks. The x-dimension accumulates a small $$s_t$$, so its effective learning rate stays large. The result: equalized step sizes across dimensions.

<div class="interactive-demo" id="demo-rms-anatomy">
  <div class="demo-split">
    <div>
      <div class="demo-caption" style="margin-bottom:0.3rem; font-weight:600;">Gradient Scaling</div>
      <canvas id="canvas-rms-anatomy" width="400" height="340"></canvas>
    </div>
    <div>
      <div class="demo-caption" style="margin-bottom:0.3rem; font-weight:600;">Effective Learning Rate</div>
      <canvas id="canvas-rms-bars" width="250" height="340"></canvas>
    </div>
  </div>
  <div class="demo-arrow-legend">
    <span><span class="legend-line" style="background:#565f89"></span> Raw gradient</span>
    <span><span class="legend-line" style="background:#f7768e"></span> x-scaled (boosted)</span>
    <span><span class="legend-line" style="background:#7aa2f7"></span> y-scaled (shrunk)</span>
    <span><span class="legend-line" style="background:#9ece6a"></span> Combined RMSProp step</span>
  </div>
  <div class="demo-controls">
    <label>α: <input type="range" id="lr-rms-anatomy" min="0.001" max="0.05" step="0.001" value="0.01"></label>
    <span class="demo-value" id="lr-rms-anatomy-val">0.010</span>
    <label>β: <input type="range" id="beta-rms-anatomy" min="0.5" max="0.999" step="0.001" value="0.9"></label>
    <span class="demo-value" id="beta-rms-anatomy-val">0.900</span>
    <div class="demo-mode-toggle" id="mode-rms-anatomy">
      <button class="active" data-mode="step">Step</button>
      <button data-mode="drag">Drag</button>
    </div>
    <button id="btn-rms-anatomy-step">Step</button>
    <button id="btn-rms-anatomy-animate">Animate</button>
    <button id="btn-rms-anatomy-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-rms-anatomy">Step mode: press Step or Animate. Switch to Drag mode to explore the surface.</div>
</div>

<script>
(function() {
  var canvasA = document.getElementById('canvas-rms-anatomy');
  var canvasB = document.getElementById('canvas-rms-bars');
  var WA = 400, HA = 340, WB = 250, HB = 340;
  var ctxA = GD.setupCanvas(canvasA, WA, HA);
  var ctxB = GD.setupCanvas(canvasB, WB, HB);
  var colors = GD.getColors();

  var pad = 40;
  var pwA = WA - 2 * pad, phA = HA - 2 * pad;
  var xMin = -3, xMax = 3, yMin = -1, yMax = 1;

  var posX = 2.5, posY = 0.7;
  var sx = 0, sy = 0; // Running avg of squared gradients
  var path = [{x: posX, y: posY}];
  var stepCount = 0;
  var mode = 'step';
  var running = false, animId = null;
  var dragging = false;
  var eps = 1e-8;

  function getLr() { return parseFloat(document.getElementById('lr-rms-anatomy').value); }
  function getBeta() { return parseFloat(document.getElementById('beta-rms-anatomy').value); }

  function w2p(x, y) {
    return {
      px: pad + (x - xMin) / (xMax - xMin) * pwA,
      py: pad + phA - (y - yMin) / (yMax - yMin) * phA
    };
  }
  function p2w(px, py) {
    return {
      x: xMin + (px - pad) / pwA * (xMax - xMin),
      y: yMax - (py - pad) / phA * (yMax - yMin)
    };
  }

  function drawArrow(ctx2d, fromPx, fromPy, toPx, toPy, color, lineW) {
    var dx = toPx - fromPx;
    var dy = toPy - fromPy;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;
    ctx2d.strokeStyle = color;
    ctx2d.fillStyle = color;
    ctx2d.lineWidth = lineW || 2.5;
    ctx2d.beginPath();
    ctx2d.moveTo(fromPx, fromPy);
    ctx2d.lineTo(toPx, toPy);
    ctx2d.stroke();
    var headLen = Math.min(10, len * 0.4);
    var angle = Math.atan2(dy, dx);
    ctx2d.beginPath();
    ctx2d.moveTo(toPx, toPy);
    ctx2d.lineTo(toPx - headLen * Math.cos(angle - 0.4), toPy - headLen * Math.sin(angle - 0.4));
    ctx2d.lineTo(toPx - headLen * Math.cos(angle + 0.4), toPy - headLen * Math.sin(angle + 0.4));
    ctx2d.closePath();
    ctx2d.fill();
  }

  function drawAll() {
    colors = GD.getColors();
    var lr = getLr();
    var beta = getBeta();
    var g = GD.elongatedGrad(posX, posY);
    var gClip = 50;
    if (Math.abs(g.dx) > gClip) g.dx = gClip * Math.sign(g.dx);
    if (Math.abs(g.dy) > gClip) g.dy = gClip * Math.sign(g.dy);

    // Effective learning rates
    var effLrX = sx > 0 ? lr / Math.sqrt(sx + eps) : lr;
    var effLrY = sy > 0 ? lr / Math.sqrt(sy + eps) : lr;

    // --- LEFT PANEL: Arrow decomposition ---
    ctxA.clearRect(0, 0, WA, HA);
    GD.drawContours(ctxA, WA, HA, GD.elongated, xMin, xMax, yMin, yMax, colors, 20);
    GD.drawMinimum(ctxA, 0, 0, xMin, xMax, yMin, yMax, pad, pwA, phA, colors);

    // Path
    if (path.length > 1) {
      GD.drawPath(ctxA, path, 'rgba(156,206,106,0.5)', xMin, xMax, yMin, yMax, pad, pwA, phA, 1.5);
    }

    var p = w2p(posX, posY);

    // Convert world-space vector to pixel arrow, capped to maxLen pixels
    var maxArrowPx = 110;
    function vecToArrow(worldDx, worldDy) {
      var pxDx = worldDx / (xMax - xMin) * pwA;
      var pxDy = -worldDy / (yMax - yMin) * phA;
      var len = Math.sqrt(pxDx * pxDx + pxDy * pxDy);
      if (len > maxArrowPx) {
        pxDx = pxDx / len * maxArrowPx;
        pxDy = pxDy / len * maxArrowPx;
      }
      if (len > 0.5 && len < 15) {
        pxDx = pxDx / len * 15;
        pxDy = pxDy / len * 15;
      }
      return { px: p.px + pxDx, py: p.py + pxDy };
    }

    // Raw gradient arrow (gray, showing vanilla GD direction)
    var rawEnd = vecToArrow(-lr * g.dx, -lr * g.dy);
    ctxA.globalAlpha = 0.4;
    drawArrow(ctxA, p.px, p.py, rawEnd.px, rawEnd.py, colors.textMuted, 2);
    ctxA.globalAlpha = 1;

    // X-component scaled arrow (boosted)
    var xStepScaled = effLrX * g.dx;
    var xEnd = vecToArrow(-xStepScaled, 0);
    drawArrow(ctxA, p.px, p.py, xEnd.px, xEnd.py, colors.sgd, 2.5);

    // Y-component scaled arrow (shrunk)
    var yStepScaled = effLrY * g.dy;
    var yEnd = vecToArrow(0, -yStepScaled);
    drawArrow(ctxA, p.px, p.py, yEnd.px, yEnd.py, colors.momentum, 2.5);

    // Combined RMSProp step
    var cEnd = vecToArrow(-xStepScaled, -yStepScaled);
    drawArrow(ctxA, p.px, p.py, cEnd.px, cEnd.py, colors.adam, 3);

    // Position dot
    ctxA.beginPath();
    ctxA.arc(p.px, p.py, 6, 0, Math.PI * 2);
    ctxA.fillStyle = '#fff';
    ctxA.fill();
    ctxA.strokeStyle = 'rgba(0,0,0,0.5)';
    ctxA.lineWidth = 2;
    ctxA.stroke();

    // --- RIGHT PANEL: Effective LR bar chart ---
    ctxB.clearRect(0, 0, WB, HB);
    ctxB.fillStyle = colors.bg;
    ctxB.fillRect(0, 0, WB, HB);

    var bPadL = 50, bPadR = 20, bPadT = 40, bPadB = 50;
    var bw = WB - bPadL - bPadR;
    var bh = HB - bPadT - bPadB;

    // Determine scale: max effective LR for bar height
    var maxEffLr = Math.max(effLrX, effLrY, lr * 1.2);
    var barWidth = bw / 4;
    var gap = bw / 6;

    // Axes
    ctxB.strokeStyle = colors.textMuted;
    ctxB.lineWidth = 1;
    ctxB.beginPath(); ctxB.moveTo(bPadL, bPadT); ctxB.lineTo(bPadL, bPadT + bh); ctxB.stroke();
    ctxB.beginPath(); ctxB.moveTo(bPadL, bPadT + bh); ctxB.lineTo(bPadL + bw, bPadT + bh); ctxB.stroke();

    // Y-axis label
    ctxB.fillStyle = colors.text;
    ctxB.font = '10px sans-serif';
    ctxB.save();
    ctxB.translate(12, bPadT + bh / 2);
    ctxB.rotate(-Math.PI / 2);
    ctxB.textAlign = 'center';
    ctxB.fillText('α / √(s + ε)', 0, 0);
    ctxB.restore();

    // Base LR reference line
    var baseLrY = bPadT + bh - (lr / maxEffLr) * bh;
    ctxB.strokeStyle = colors.textMuted;
    ctxB.lineWidth = 1;
    ctxB.setLineDash([4, 4]);
    ctxB.beginPath(); ctxB.moveTo(bPadL, baseLrY); ctxB.lineTo(bPadL + bw, baseLrY); ctxB.stroke();
    ctxB.setLineDash([]);
    ctxB.fillStyle = colors.textMuted;
    ctxB.font = '9px JetBrains Mono, monospace';
    ctxB.textAlign = 'right';
    ctxB.fillText('α=' + lr.toFixed(3), bPadL - 4, baseLrY + 3);

    // Title
    ctxB.fillStyle = colors.text;
    ctxB.font = '11px sans-serif';
    ctxB.textAlign = 'center';

    // X-dim bar
    var xBarX = bPadL + gap;
    var xBarH = (effLrX / maxEffLr) * bh;
    var xBarY = bPadT + bh - xBarH;
    ctxB.fillStyle = colors.sgd;
    ctxB.globalAlpha = 0.7;
    ctxB.fillRect(xBarX, xBarY, barWidth, xBarH);
    ctxB.globalAlpha = 1;
    ctxB.strokeStyle = colors.sgd;
    ctxB.lineWidth = 2;
    ctxB.strokeRect(xBarX, xBarY, barWidth, xBarH);
    // Label
    ctxB.fillStyle = colors.text;
    ctxB.font = '10px sans-serif';
    ctxB.textAlign = 'center';
    ctxB.fillText('x-dim', xBarX + barWidth / 2, bPadT + bh + 15);
    ctxB.font = '9px JetBrains Mono, monospace';
    ctxB.fillText(effLrX.toFixed(4), xBarX + barWidth / 2, xBarY - 5);

    // Y-dim bar
    var yBarX = bPadL + gap + barWidth + gap;
    var yBarH = (effLrY / maxEffLr) * bh;
    var yBarY = bPadT + bh - yBarH;
    ctxB.fillStyle = colors.momentum;
    ctxB.globalAlpha = 0.7;
    ctxB.fillRect(yBarX, yBarY, barWidth, yBarH);
    ctxB.globalAlpha = 1;
    ctxB.strokeStyle = colors.momentum;
    ctxB.lineWidth = 2;
    ctxB.strokeRect(yBarX, yBarY, barWidth, yBarH);
    // Label
    ctxB.fillStyle = colors.text;
    ctxB.font = '10px sans-serif';
    ctxB.textAlign = 'center';
    ctxB.fillText('y-dim', yBarX + barWidth / 2, bPadT + bh + 15);
    ctxB.font = '9px JetBrains Mono, monospace';
    ctxB.fillText(effLrY.toFixed(4), yBarX + barWidth / 2, yBarY - 5);

    // Ratio annotation
    if (effLrY > 0 && stepCount > 0) {
      ctxB.fillStyle = colors.textMuted;
      ctxB.font = '9px sans-serif';
      ctxB.textAlign = 'center';
      ctxB.fillText('x/y ratio: ' + (effLrX / effLrY).toFixed(1) + '×', bPadL + bw / 2, bPadT + bh + 32);
    }

    // Info
    document.getElementById('info-rms-anatomy').textContent =
      'Step ' + stepCount +
      ' | √s_x = ' + Math.sqrt(sx).toFixed(4) +
      ' | √s_y = ' + Math.sqrt(sy).toFixed(4) +
      ' | eff α_x = ' + effLrX.toFixed(5) +
      ' | eff α_y = ' + effLrY.toFixed(5);
  }

  function doStep() {
    var lr = getLr();
    var beta = getBeta();
    var g = GD.elongatedGrad(posX, posY);
    var gClip = 50;
    if (Math.abs(g.dx) > gClip) g.dx = gClip * Math.sign(g.dx);
    if (Math.abs(g.dy) > gClip) g.dy = gClip * Math.sign(g.dy);

    sx = beta * sx + (1 - beta) * g.dx * g.dx;
    sy = beta * sy + (1 - beta) * g.dy * g.dy;

    posX = posX - (lr / Math.sqrt(sx + eps)) * g.dx;
    posY = posY - (lr / Math.sqrt(sy + eps)) * g.dy;
    stepCount++;
    path.push({x: posX, y: posY});

    if (Math.abs(posX) > 10 || Math.abs(posY) > 10) {
      running = false;
      if (animId) cancelAnimationFrame(animId);
    }
    drawAll();
  }

  var lastAnimTime = 0;
  function animLoop(ts) {
    if (!running) return;
    if (ts - lastAnimTime > 150) {
      lastAnimTime = ts;
      doStep();
      if (GD.elongated(posX, posY) < 0.0001) {
        running = false;
        return;
      }
    }
    animId = requestAnimationFrame(animLoop);
  }

  // Mode toggle
  document.getElementById('mode-rms-anatomy').addEventListener('click', function(e) {
    if (e.target.tagName !== 'BUTTON') return;
    mode = e.target.getAttribute('data-mode');
    var btns = this.querySelectorAll('button');
    btns.forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-mode') === mode); });
    var stepBtns = mode === 'step';
    document.getElementById('btn-rms-anatomy-step').style.display = stepBtns ? '' : 'none';
    document.getElementById('btn-rms-anatomy-animate').style.display = stepBtns ? '' : 'none';
    canvasA.style.cursor = mode === 'drag' ? 'grab' : 'crosshair';
    if (mode === 'drag') {
      running = false;
      if (animId) cancelAnimationFrame(animId);
    }
  });

  document.getElementById('btn-rms-anatomy-step').addEventListener('click', function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    doStep();
  });

  document.getElementById('btn-rms-anatomy-animate').addEventListener('click', function() {
    running = true;
    lastAnimTime = 0;
    animId = requestAnimationFrame(animLoop);
  });

  document.getElementById('btn-rms-anatomy-reset').addEventListener('click', function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    posX = 2.5; posY = 0.7; sx = 0; sy = 0; stepCount = 0;
    path = [{x: posX, y: posY}];
    drawAll();
  });

  canvasA.addEventListener('mousedown', function(e) {
    if (mode !== 'drag') return;
    dragging = true;
    canvasA.style.cursor = 'grabbing';
    var rect = canvasA.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (WA / rect.width);
    var my = (e.clientY - rect.top) * (HA / rect.height);
    var w = p2w(mx, my);
    posX = Math.max(xMin + 0.1, Math.min(xMax - 0.1, w.x));
    posY = Math.max(yMin + 0.05, Math.min(yMax - 0.05, w.y));
    sx = 0; sy = 0;
    path = [{x: posX, y: posY}];
    stepCount = 0;
    drawAll();
  });

  canvasA.addEventListener('mousemove', function(e) {
    if (!dragging || mode !== 'drag') return;
    var rect = canvasA.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (WA / rect.width);
    var my = (e.clientY - rect.top) * (HA / rect.height);
    var w = p2w(mx, my);
    posX = Math.max(xMin + 0.1, Math.min(xMax - 0.1, w.x));
    posY = Math.max(yMin + 0.05, Math.min(yMax - 0.05, w.y));
    sx = 0; sy = 0;
    path = [{x: posX, y: posY}];
    drawAll();
  });

  canvasA.addEventListener('mouseup', function() { dragging = false; canvasA.style.cursor = mode === 'drag' ? 'grab' : 'crosshair'; });
  canvasA.addEventListener('mouseleave', function() { dragging = false; });

  document.getElementById('lr-rms-anatomy').addEventListener('input', function() {
    document.getElementById('lr-rms-anatomy-val').textContent = parseFloat(this.value).toFixed(3);
    drawAll();
  });
  document.getElementById('beta-rms-anatomy').addEventListener('input', function() {
    document.getElementById('beta-rms-anatomy-val').textContent = parseFloat(this.value).toFixed(3);
    drawAll();
  });

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

### Why Bias Correction Matters

The bias correction step ($$\hat{m}_t = \frac{m_t}{1 - \beta_1^t}$$) can seem like a minor detail, but it is critical for Adam's early training steps. Since both $$m_0$$ and $$v_0$$ are initialized to zero, the early estimates are heavily biased toward zero. Without correction, Adam's first updates would be far too small.

The chart below shows this effect. The top panel plots the correction factor $$\frac{1}{1 - \beta^t}$$ over time, and notice how it is enormous at $$t = 1$$ and quickly converges to 1. The bottom panel shows what happens to a constant gradient signal: the raw moment $$m_t$$ slowly ramps up from zero, but the corrected $$\hat{m}_t$$ is properly scaled from the very first step.

<div class="interactive-demo" id="demo-bias-correction">
  <canvas id="canvas-bias-correction" width="680" height="360"></canvas>
  <div class="demo-controls">
    <label>β₁: <input type="range" id="beta1-bias" min="0.8" max="0.99" step="0.01" value="0.9"></label>
    <span class="demo-value" id="beta1-bias-val">0.90</span>
    <label>β₂: <input type="range" id="beta2-bias" min="0.9" max="0.999" step="0.001" value="0.999"></label>
    <span class="demo-value" id="beta2-bias-val">0.999</span>
  </div>
  <div class="demo-info" id="info-bias">At t=1: β₁ correction = 10.0× | β₂ correction = 1000.0×</div>
</div>
<div class="demo-caption">Top: correction factor over time for β₁ and β₂. Bottom: raw moment m_t vs bias-corrected m̂_t for a constant gradient.</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-bias-correction');
  var W = 680, H = 360;
  var ctx = GD.setupCanvas(canvas, W, H);
  var colors = GD.getColors();

  var padL = 55, padR = 20, padT = 20, padB = 35;
  var midGap = 30;
  var totalH = H - padT - padB;
  var chartH = (totalH - midGap) / 2;
  var pw = W - padL - padR;

  var maxT = 50;

  function draw() {
    colors = GD.getColors();
    var beta1 = parseFloat(document.getElementById('beta1-bias').value);
    var beta2 = parseFloat(document.getElementById('beta2-bias').value);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    // --- TOP CHART: Correction factor ---
    var top0 = padT;
    var topH = chartH;

    // Compute correction factors
    var cf1 = [], cf2 = [];
    var maxCF = 0;
    for (var t = 1; t <= maxT; t++) {
      var c1 = 1 / (1 - Math.pow(beta1, t));
      var c2 = 1 / (1 - Math.pow(beta2, t));
      cf1.push(c1); cf2.push(c2);
      if (c1 > maxCF) maxCF = c1;
      if (c2 > maxCF) maxCF = c2;
    }
    // Use log scale for y since correction can be huge
    var useLog = maxCF > 20;
    var yMaxTop = useLog ? Math.log10(maxCF * 1.2) : maxCF * 1.2;
    var yMinTop = useLog ? 0 : 0;

    function tToX(t) { return padL + (t - 1) / (maxT - 1) * pw; }
    function cfToY(v) {
      var mapped = useLog ? Math.log10(Math.max(v, 1)) : v;
      return top0 + topH - (mapped - yMinTop) / (yMaxTop - yMinTop) * topH;
    }

    // Grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    for (var t = 1; t <= maxT; t += 5) {
      var x = tToX(t);
      ctx.beginPath(); ctx.moveTo(x, top0); ctx.lineTo(x, top0 + topH); ctx.stroke();
    }
    // 1.0 reference line
    var oneY = cfToY(1);
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(padL, oneY); ctx.lineTo(padL + pw, oneY); ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, top0 + topH); ctx.lineTo(padL + pw, top0 + topH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, top0); ctx.lineTo(padL, top0 + topH); ctx.stroke();

    // Title
    ctx.fillStyle = colors.text;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Correction factor: 1 / (1 - β^t)', padL + 5, top0 + 14);

    // Y-axis label
    ctx.fillStyle = colors.textMuted;
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    if (useLog) {
      for (var exp = 0; exp <= Math.ceil(yMaxTop); exp++) {
        var val = Math.pow(10, exp);
        var y = cfToY(val);
        if (y >= top0 && y <= top0 + topH) {
          ctx.fillText(val >= 100 ? val.toFixed(0) : val.toFixed(1), padL - 5, y + 3);
        }
      }
    } else {
      for (var v = 0; v <= yMaxTop; v += Math.ceil(yMaxTop / 5)) {
        ctx.fillText(v.toFixed(0), padL - 5, cfToY(v) + 3);
      }
    }

    // β₁ line
    ctx.strokeStyle = colors.momentum;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < cf1.length; i++) {
      var x = tToX(i + 1), y = cfToY(cf1[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // β₂ line
    ctx.strokeStyle = colors.rmsprop;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < cf2.length; i++) {
      var x = tToX(i + 1), y = cfToY(cf2[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Legend
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = colors.momentum;
    ctx.fillRect(padL + pw - 145, top0 + 6, 14, 3);
    ctx.fillText('β₁ = ' + beta1.toFixed(2), padL + pw - 128, top0 + 12);
    ctx.fillStyle = colors.rmsprop;
    ctx.fillRect(padL + pw - 145, top0 + 20, 14, 3);
    ctx.fillText('β₂ = ' + beta2.toFixed(3), padL + pw - 128, top0 + 26);

    // --- BOTTOM CHART: Raw m_t vs corrected m̂_t ---
    var bot0 = top0 + topH + midGap;
    var botH = chartH;

    // Compute moments for a constant gradient = 1.0
    var trueGrad = 1.0;
    var rawM = [], corrM = [];
    var m = 0;
    for (var t = 1; t <= maxT; t++) {
      m = beta1 * m + (1 - beta1) * trueGrad;
      rawM.push(m);
      corrM.push(m / (1 - Math.pow(beta1, t)));
    }
    var yMaxBot = 1.4;
    var yMinBot = 0;

    function mToY(v) {
      return bot0 + botH - (v - yMinBot) / (yMaxBot - yMinBot) * botH;
    }

    // Grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    for (var t = 1; t <= maxT; t += 5) {
      var x = tToX(t);
      ctx.beginPath(); ctx.moveTo(x, bot0); ctx.lineTo(x, bot0 + botH); ctx.stroke();
    }

    // True gradient reference
    var trueY = mToY(trueGrad);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(padL, trueY); ctx.lineTo(padL + pw, trueY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = colors.accent;
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('true gradient = 1.0', padL + pw - 120, trueY - 5);

    // Axes
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, bot0 + botH); ctx.lineTo(padL + pw, bot0 + botH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, bot0); ctx.lineTo(padL, bot0 + botH); ctx.stroke();

    // Title
    ctx.fillStyle = colors.text;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('First moment: raw m_t vs corrected m̂_t', padL + 5, bot0 + 14);

    // Y-axis labels
    ctx.fillStyle = colors.textMuted;
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    for (var v = 0; v <= yMaxBot; v += 0.2) {
      ctx.fillText(v.toFixed(1), padL - 5, mToY(v) + 3);
    }

    // X-axis label (shared)
    ctx.fillStyle = colors.text;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time step (t)', padL + pw / 2, bot0 + botH + 15);

    // Tick labels
    ctx.fillStyle = colors.textMuted;
    ctx.font = '9px JetBrains Mono, monospace';
    for (var t = 1; t <= maxT; t += 5) {
      ctx.fillText(t.toString(), tToX(t), bot0 + botH + 12);
    }

    // Shaded region between raw and corrected (the bias)
    ctx.fillStyle = colors.momentum;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.moveTo(tToX(1), mToY(rawM[0]));
    for (var i = 0; i < rawM.length; i++) {
      ctx.lineTo(tToX(i + 1), mToY(rawM[i]));
    }
    for (var i = rawM.length - 1; i >= 0; i--) {
      ctx.lineTo(tToX(i + 1), mToY(Math.min(corrM[i], yMaxBot)));
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Raw m_t line
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    for (var i = 0; i < rawM.length; i++) {
      var x = tToX(i + 1), y = mToY(rawM[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Corrected m̂_t line
    ctx.strokeStyle = colors.momentum;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i < corrM.length; i++) {
      var x = tToX(i + 1), y = mToY(Math.min(corrM[i], yMaxBot));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Legend
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath(); ctx.moveTo(padL + pw - 145, bot0 + 8); ctx.lineTo(padL + pw - 131, bot0 + 8); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('raw m_t', padL + pw - 128, bot0 + 12);

    ctx.fillStyle = colors.momentum;
    ctx.fillRect(padL + pw - 145, bot0 + 20, 14, 3);
    ctx.fillText('corrected m̂_t', padL + pw - 128, bot0 + 26);

    // Info
    var cf1_1 = 1 / (1 - beta1);
    var cf2_1 = 1 / (1 - beta2);
    document.getElementById('info-bias').textContent =
      'At t=1: β₁ correction = ' + cf1_1.toFixed(1) + '× | β₂ correction = ' + cf2_1.toFixed(1) + '×';
  }

  document.getElementById('beta1-bias').addEventListener('input', function() {
    document.getElementById('beta1-bias-val').textContent = parseFloat(this.value).toFixed(2);
    draw();
  });
  document.getElementById('beta2-bias').addEventListener('input', function() {
    document.getElementById('beta2-bias-val').textContent = parseFloat(this.value).toFixed(3);
    draw();
  });

  draw();
  GD.onThemeChange(draw);
})();
</script>

Now for the main event: the Optimizer Race. All four algorithms start from the same point on the Rosenbrock surface and race to the minimum. Watch how each one navigates differently.

Important interpretation note: this race uses one shared learning-rate slider for all optimizers. That makes visual comparison easy, but it is not per-optimizer hyperparameter tuning. If Adam looks weak at low $$\alpha$$, try a higher value (for this setup, often around $$0.004$$ to $$0.008$$) and compare again.

<div class="interactive-demo" id="demo-race">
  <canvas id="canvas-race" width="680" height="420"></canvas>
  <div class="optimizer-legend">
    <span><span class="legend-dot" style="background:#f7768e"></span> SGD</span>
    <span><span class="legend-dot" style="background:#7aa2f7"></span> Momentum</span>
    <span><span class="legend-dot" style="background:#ff9e64"></span> RMSProp</span>
    <span><span class="legend-dot" style="background:#9ece6a"></span> Adam</span>
  </div>
  <div class="demo-controls">
    <label>α: <input type="range" id="lr-race" min="0.0005" max="0.01" step="0.0005" value="0.006"></label>
    <span class="demo-value" id="lr-race-val">0.006</span>
    <button id="btn-race-start">Start Race</button>
    <button id="btn-race-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-race">Click on the surface to set a starting point, then press "Start Race". (Shared α for all optimizers.)</div>
</div>
<div class="demo-caption">Plot setup: all optimizers run on the same Rosenbrock surface from the same start point, with one shared learning-rate slider (comparison view, not per-optimizer retuning). Adam normalizes gradient magnitude, so its early moves are often smaller at the same $$\alpha$$.</div>

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
  var beta1Pow = 1, beta2Pow = 1;

  function getLr() { return parseFloat(document.getElementById('lr-race').value); }

  function resetState() {
    paths = { sgd: [], mom: [], rms: [], adam: [] };
    mom_vx = 0; mom_vy = 0;
    rms_sx = 0; rms_sy = 0;
    adam_mx = 0; adam_my = 0; adam_vx = 0; adam_vy = 0;
    beta1Pow = 1; beta2Pow = 1;
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
    beta1Pow *= beta1;
    beta2Pow *= beta2;
    var mxh = adam_mx / (1 - beta1Pow);
    var myh = adam_my / (1 - beta1Pow);
    var vxh = adam_vx / (1 - beta2Pow);
    var vyh = adam_vy / (1 - beta2Pow);
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
    document.getElementById('info-race').textContent = 'Start: (' + startX.toFixed(2) + ', ' + startY.toFixed(2) + '), Press "Start Race". (Shared α.)';
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
    document.getElementById('info-race').textContent = 'Click on the surface to set a starting point, then press "Start Race". (Shared α for all optimizers.)';
    draw();
  });

  draw();
  GD.onThemeChange(draw);
})();
</script>

---

## 8. Escaping Saddle Points

In high-dimensional optimization (like deep learning), saddle points are far more common than local minima. A saddle point is where the gradient is zero, but it is a minimum in some directions and a maximum in others, like the middle of a horse saddle.

Vanilla GD with a small learning rate can get stuck at saddle points because the gradient vanishes. But optimizers with momentum or adaptive learning rates can escape because:

- Momentum builds up velocity from slight perturbations and carries the optimizer through the flat region.
- Adam combines momentum with per-parameter adaptation, making it especially effective at escaping.

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

In practice, we almost never use pure SGD (batch size = 1) or full Batch GD. Instead, we use mini-batch gradient descent, where each update averages the gradient over a small batch of $$B$$ samples:

$$\theta := \theta - \frac{\alpha}{B} \sum_{i=1}^{B} \nabla_\theta J(\theta;\; x^{(i)}, y^{(i)})$$

The batch size acts as a noise knob:

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

- Adam is the default choice for most deep learning tasks. Its defaults ($$\alpha = 0.001$$, $$\beta_1 = 0.9$$, $$\beta_2 = 0.999$$) work well out of the box.
- SGD + Momentum often generalizes better than Adam on well-tuned models (especially in computer vision), but requires more careful learning rate tuning and scheduling.
- RMSProp is popular for recurrent neural networks and reinforcement learning.
- Batch GD is mainly used for small datasets or convex problems where you want deterministic convergence.

### What is Next?

In the next chapter, we will put these optimizers to work training neural networks from scratch. We will build a multi-layer perceptron, implement backpropagation, and use Adam to train it on real data, all interactively in the browser.

<div class="demo-hint">
  <strong>Key takeaway:</strong> The optimizer is not just a knob to turn, it fundamentally shapes how your model navigates the loss landscape. Understanding the tradeoffs between speed, stability, and generalization will make you a better practitioner. When in doubt, start with Adam and tune from there.
</div>
