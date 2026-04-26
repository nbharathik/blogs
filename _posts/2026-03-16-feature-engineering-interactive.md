---
layout: post
title: "Feature Engineering & Data Preprocessing"
author: bharathikannan
categories: [Machine learning]
tags: [ml-part-2]
series: false
hidden: true
description: "Visualize feature scaling, one-hot encoding, missing value imputation, correlation heatmaps, and polynomial features - see how preprocessing transforms your data interactively."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /feature-engineering/
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
.demo-controls button.active {
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
  .demo-quad { grid-template-columns: 1fr !important; }
  .demo-controls input[type="range"] { width: 120px; }
}
.demo-quad {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
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
.fe-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.9rem;
}
.fe-table th, .fe-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}
.fe-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
.fe-table td {
  background: var(--bg-primary);
}
.fe-table .missing {
  color: var(--viz-red);
  font-style: italic;
}
.encoding-table-wrap {
  overflow-x: auto;
  margin-top: 0.5rem;
}
.encoding-table-wrap table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
}
.encoding-table-wrap th, .encoding-table-wrap td {
  border: 1px solid var(--border);
  padding: 0.35rem 0.6rem;
  text-align: center;
}
.encoding-table-wrap th {
  background: var(--bg-primary);
  font-weight: 600;
}
.encoding-table-wrap td.hot {
  background: rgba(122, 162, 247, 0.2);
  font-weight: 700;
}
</style>

<script>
window.FE = (function() {
  'use strict';
  var F = {};

  F.getColors = function() { return window.Viz.colors(); };

  F.setupCanvas = function(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  F.observeTheme = function(cb) {
    var obs = new MutationObserver(function() { cb(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb);
  };

  // Coordinate mapping
  F.mapX = function(v, xMin, xMax, pL, pW) { return pL + (v - xMin) / (xMax - xMin) * pW; };
  F.mapY = function(v, yMin, yMax, pT, pH) { return pT + pH - (v - yMin) / (yMax - yMin) * pH; };
  F.unmapX = function(px, xMin, xMax, pL, pW) { return xMin + (px - pL) / pW * (xMax - xMin); };
  F.unmapY = function(py, yMin, yMax, pT, pH) { return yMin + (pT + pH - py) / pH * (yMax - yMin); };

  // Draw grid
  F.drawGrid = function(ctx, w, h, pad, xMin, xMax, yMin, yMax, xLab, yLab) {
    var c = F.getColors();
    var pW = w - 2 * pad, pH = h - 2 * pad;
    ctx.strokeStyle = c.grid; ctx.lineWidth = 0.5;
    var nx = 5, ny = 5;
    for (var i = 0; i <= nx; i++) {
      var x = pad + pW * i / nx;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, pad + pH); ctx.stroke();
    }
    for (var i = 0; i <= ny; i++) {
      var y = pad + pH * i / ny;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + pW, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border; ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, pW, pH);
    // Tick labels
    ctx.fillStyle = c.textMuted; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    for (var i = 0; i <= nx; i++) {
      var v = xMin + (xMax - xMin) * i / nx;
      ctx.fillText(v.toFixed(1), pad + pW * i / nx, h - pad + 14);
    }
    ctx.textAlign = 'right';
    for (var i = 0; i <= ny; i++) {
      var v = yMax - (yMax - yMin) * i / ny;
      ctx.fillText(v.toFixed(1), pad - 4, pad + pH * i / ny + 4);
    }
    if (xLab) { ctx.fillStyle = c.text; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(xLab, pad + pW / 2, h - 2); }
    if (yLab) { ctx.save(); ctx.fillStyle = c.text; ctx.font = '11px Inter, sans-serif'; ctx.translate(10, pad + pH / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText(yLab, 0, 0); ctx.restore(); }
  };

  // Statistics
  F.mean = function(arr) { var s = 0; for (var i = 0; i < arr.length; i++) s += arr[i]; return s / arr.length; };
  F.std = function(arr) { var m = F.mean(arr); var s = 0; for (var i = 0; i < arr.length; i++) s += (arr[i] - m) * (arr[i] - m); return Math.sqrt(s / arr.length); };
  F.median = function(arr) { var s = arr.slice().sort(function(a, b) { return a - b; }); var n = s.length; return n % 2 === 0 ? (s[n / 2 - 1] + s[n / 2]) / 2 : s[Math.floor(n / 2)]; };
  F.mode = function(arr) { var freq = {}; for (var i = 0; i < arr.length; i++) { freq[arr[i]] = (freq[arr[i]] || 0) + 1; } var best = arr[0], bestC = 0; for (var k in freq) { if (freq[k] > bestC) { bestC = freq[k]; best = parseFloat(k); } } return best; };
  F.q1 = function(arr) { var s = arr.slice().sort(function(a, b) { return a - b; }); return s[Math.floor(s.length * 0.25)]; };
  F.q3 = function(arr) { var s = arr.slice().sort(function(a, b) { return a - b; }); return s[Math.floor(s.length * 0.75)]; };
  F.iqr = function(arr) { return F.q3(arr) - F.q1(arr); };
  F.min = function(arr) { var m = arr[0]; for (var i = 1; i < arr.length; i++) if (arr[i] < m) m = arr[i]; return m; };
  F.max = function(arr) { var m = arr[0]; for (var i = 1; i < arr.length; i++) if (arr[i] > m) m = arr[i]; return m; };

  // Scaling functions
  F.standardize = function(arr) { var m = F.mean(arr), s = F.std(arr) || 1; return arr.map(function(v) { return (v - m) / s; }); };
  F.minMaxScale = function(arr) { var mn = F.min(arr), mx = F.max(arr), r = mx - mn || 1; return arr.map(function(v) { return (v - mn) / r; }); };
  F.robustScale = function(arr) { var med = F.median(arr), iq = F.iqr(arr) || 1; return arr.map(function(v) { return (v - med) / iq; }); };

  // Correlation
  F.corr = function(a, b) {
    var n = a.length, ma = F.mean(a), mb = F.mean(b);
    var num = 0, da = 0, db = 0;
    for (var i = 0; i < n; i++) { var dx = a[i] - ma, dy = b[i] - mb; num += dx * dy; da += dx * dx; db += dy * dy; }
    return num / (Math.sqrt(da) * Math.sqrt(db) || 1);
  };

  // Gaussian random
  F.randn = function() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  // Get canvas mouse position
  F.getMousePos = function(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = parseFloat(canvas.style.width) / rect.width;
    var scaleY = parseFloat(canvas.style.height) / rect.height;
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY
    };
  };

  // Touch support
  F.getTouchPos = function(canvas, touch) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = parseFloat(canvas.style.width) / rect.width;
    var scaleY = parseFloat(canvas.style.height) / rect.height;
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  };

  return F;
})();
</script>

Real-world data is messy. Features come in different units, categories need numerical representation, and missing values lurk everywhere. Feature engineering and preprocessing are the critical steps that transform raw data into a form that machine learning algorithms can learn from effectively. In this chapter, we will interactively explore the most important preprocessing techniques and see exactly how they change your data and model performance.

---

## 1. Why Preprocessing Matters

Before we dive into individual techniques, let us see the dramatic effect that simple feature scaling can have on gradient descent. Imagine fitting a model with two features: one ranging from 0 to 1, and another from 0 to 1000. The loss surface becomes a narrow, elongated valley, and gradient descent takes many tiny zigzag steps to reach the minimum. After scaling, the contours become circular, and gradient descent converges in a straight path.

<div class="interactive-demo">
  <h4>Unscaled vs Scaled: Gradient Descent Convergence</h4>
  <div class="demo-split">
    <div>
      <canvas id="cvGdUnscaled" width="300" height="300"></canvas>
      <div class="demo-caption">Unscaled features (elongated contours)</div>
    </div>
    <div>
      <canvas id="cvGdScaled" width="300" height="300"></canvas>
      <div class="demo-caption">Scaled features (circular contours)</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btnGdRun">Run Gradient Descent</button>
    <button id="btnGdReset">Reset</button>
    <span class="demo-value" id="gdInfo">Click Run to start</span>
  </div>
  <div class="demo-caption">Settings: f = 50x^2 + 0.5y^2 (unscaled) vs f = x^2 + y^2 (scaled), starting point (-2.5, 2.5).</div>
</div>

<script>
(function() {
  var cvU = document.getElementById('cvGdUnscaled');
  var cvS = document.getElementById('cvGdScaled');
  var btnRun = document.getElementById('btnGdRun');
  var btnReset = document.getElementById('btnGdReset');
  var infoEl = document.getElementById('gdInfo');
  var W = 300, H = 300;
  var ctxU = FE.setupCanvas(cvU, W, H);
  var ctxS = FE.setupCanvas(cvS, W, H);

  // Unscaled: f(x,y) = 50*x^2 + 0.5*y^2 (elongated)
  // Scaled: f(x,y) = x^2 + y^2 (circular)
  var pathU = [], pathS = [];
  var animId = null;
  var step = 0;

  function drawContour(ctx, a, b, title) {
    var c = FE.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    var pad = 30;
    var pw = W - 2 * pad, ph = H - 2 * pad;
    // Draw contour lines
    var levels = [0.5, 2, 5, 10, 20, 40, 70, 100];
    for (var li = 0; li < levels.length; li++) {
      var lev = levels[li];
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      var first = true;
      for (var t = 0; t <= 200; t++) {
        var angle = t / 200 * Math.PI * 2;
        var rx = Math.sqrt(lev / a);
        var ry = Math.sqrt(lev / b);
        var ex = rx * Math.cos(angle);
        var ey = ry * Math.sin(angle);
        var px = pad + (ex + 3) / 6 * pw;
        var py = pad + (3 - ey) / 6 * ph;
        if (px < pad || px > pad + pw || py < pad || py > pad + ph) { first = true; continue; }
        if (first) { ctx.moveTo(px, py); first = false; } else { ctx.lineTo(px, py); }
      }
      ctx.stroke();
    }
    // Axis border
    ctx.strokeStyle = c.border; ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, pw, ph);
    // Minimum marker
    var cx = pad + 3 / 6 * pw, cy = pad + 3 / 6 * ph;
    ctx.fillStyle = c.green;
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    // Title
    ctx.fillStyle = c.text; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(title, W / 2, 16);
  }

  function drawPath(ctx, path, a, b) {
    var c = FE.getColors();
    var pad = 30;
    var pw = W - 2 * pad, ph = H - 2 * pad;
    if (path.length < 2) return;
    ctx.strokeStyle = c.pink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < path.length; i++) {
      var px = pad + (path[i][0] + 3) / 6 * pw;
      var py = pad + (3 - path[i][1]) / 6 * ph;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // Current point
    var last = path[path.length - 1];
    var lx = pad + (last[0] + 3) / 6 * pw;
    var ly = pad + (3 - last[1]) / 6 * ph;
    ctx.fillStyle = c.pointAlt;
    ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = c.bg; ctx.lineWidth = 1.5; ctx.stroke();
    // Start point
    var s = path[0];
    var sx = pad + (s[0] + 3) / 6 * pw;
    var sy = pad + (3 - s[1]) / 6 * ph;
    ctx.fillStyle = c.orange;
    ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill();
  }

  function draw() {
    drawContour(ctxU, 50, 0.5, 'Unscaled: f = 50x\u00B2 + 0.5y\u00B2');
    drawContour(ctxS, 1, 1, 'Scaled: f = x\u00B2 + y\u00B2');
    drawPath(ctxU, pathU, 50, 0.5);
    drawPath(ctxS, pathS, 1, 1);
  }

  function reset() {
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    pathU = [[-2.5, 2.5]];
    pathS = [[-2.5, 2.5]];
    step = 0;
    draw();
    infoEl.textContent = 'Click Run to start';
  }

  function runGD() {
    if (animId) return;
    var lrU = 0.008;
    var lrS = 0.3;
    var maxSteps = 120;

    function tick() {
      if (step >= maxSteps) {
        infoEl.textContent = 'Done! Unscaled: ' + pathU.length + ' steps | Scaled: ' + pathS.length + ' steps';
        animId = null;
        return;
      }
      // Unscaled gradient: df/dx = 100x, df/dy = y
      var uLast = pathU[pathU.length - 1];
      var gx = 100 * uLast[0], gy = 1 * uLast[1];
      var nx = uLast[0] - lrU * gx;
      var ny = uLast[1] - lrU * gy;
      pathU.push([nx, ny]);

      // Scaled gradient: df/dx = 2x, df/dy = 2y
      var sLast = pathS[pathS.length - 1];
      if (Math.abs(sLast[0]) > 0.01 || Math.abs(sLast[1]) > 0.01) {
        var sgx = 2 * sLast[0], sgy = 2 * sLast[1];
        var snx = sLast[0] - lrS * sgx;
        var sny = sLast[1] - lrS * sgy;
        pathS.push([snx, sny]);
      }

      step++;
      draw();
      infoEl.textContent = 'Step ' + step + ' | Unscaled loss: ' + (50 * nx * nx + 0.5 * ny * ny).toFixed(3) + ' | Scaled loss: ' + (sLast[0] * sLast[0] + sLast[1] * sLast[1]).toFixed(3);
      animId = requestAnimationFrame(tick);
    }
    tick();
  }

  btnRun.addEventListener('click', runGD);
  btnReset.addEventListener('click', reset);
  FE.observeTheme(draw);
  reset();
})();
</script>

Notice the zigzag path on the unscaled surface versus the direct path on the scaled surface. This single insight motivates all of the scaling techniques we will learn next.

---

## 2. Feature Scaling Comparison

The three most common scaling methods are Standardization (Z-score), Min-Max Normalization, and Robust Scaling. Each transforms data differently.

**Standardization (Z-score):**

$$x_{\text{scaled}} = \frac{x - \mu}{\sigma}$$

Standardization centers data to mean 0 and standard deviation 1.

**Min-Max Normalization:**

$$x_{\text{scaled}} = \frac{x - x_{\min}}{x_{\max} - x_{\min}}$$

Min-Max normalization squeezes data into the [0, 1] range.

**Robust Scaling:**

$$x_{\text{scaled}} = \frac{x - \text{median}}{\text{IQR}}$$

Robust scaling uses median and interquartile range, making it robust to outliers. In the demo below, click Add Outlier and observe how Min-Max scaling gets compressed because the outlier stretches the range, while Robust scaling stays relatively stable. This is why robust scaling is preferred when outliers are present.

<div class="interactive-demo">
  <h4>Interactive Feature Scaling: Click to Add Points</h4>
  <div class="demo-quad">
    <div>
      <canvas id="cvScaleRaw" width="280" height="240"></canvas>
      <div class="demo-caption">Raw Data</div>
    </div>
    <div>
      <canvas id="cvScaleStd" width="280" height="240"></canvas>
      <div class="demo-caption">Standardized (Z-score)</div>
    </div>
    <div>
      <canvas id="cvScaleMM" width="280" height="240"></canvas>
      <div class="demo-caption">Min-Max [0, 1]</div>
    </div>
    <div>
      <canvas id="cvScaleRob" width="280" height="240"></canvas>
      <div class="demo-caption">Robust Scaled</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btnScaleReset">Reset</button>
    <button id="btnScaleOutlier">Add Outlier</button>
    <span class="demo-value" id="scaleInfo">Click the Raw canvas to add points</span>
  </div>
  <div class="demo-caption">Settings: 20 points generated with mean (20, 150) and small spread. Click on the Raw canvas to add more.</div>
</div>

<script>
(function() {
  var cvRaw = document.getElementById('cvScaleRaw');
  var cvStd = document.getElementById('cvScaleStd');
  var cvMM = document.getElementById('cvScaleMM');
  var cvRob = document.getElementById('cvScaleRob');
  var btnReset = document.getElementById('btnScaleReset');
  var btnOutlier = document.getElementById('btnScaleOutlier');
  var infoEl = document.getElementById('scaleInfo');

  var W = 280, H = 240, pad = 35;
  var ctxRaw = FE.setupCanvas(cvRaw, W, H);
  var ctxStd = FE.setupCanvas(cvStd, W, H);
  var ctxMM = FE.setupCanvas(cvMM, W, H);
  var ctxRob = FE.setupCanvas(cvRob, W, H);

  var pts = [];

  function genInitial() {
    pts = [];
    for (var i = 0; i < 20; i++) {
      pts.push({
        x: 20 + FE.randn() * 15,
        y: 150 + FE.randn() * 40
      });
    }
  }

  function drawPlot(ctx, xs, ys, xMin, xMax, yMin, yMax, title, col) {
    var c = FE.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    var pW = W - 2 * pad, pH = H - 2 * pad;
    // Grid
    FE.drawGrid(ctx, W, H, pad, xMin, xMax, yMin, yMax, 'x', 'y');
    // Title
    ctx.fillStyle = col || c.accent;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, W / 2, 14);
    // Points
    ctx.fillStyle = col || c.point;
    for (var i = 0; i < xs.length; i++) {
      var px = pad + (xs[i] - xMin) / (xMax - xMin) * pW;
      var py = pad + pH - (ys[i] - yMin) / (yMax - yMin) * pH;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw() {
    if (pts.length < 2) {
      var c = FE.getColors();
      [ctxRaw, ctxStd, ctxMM, ctxRob].forEach(function(ctx) {
        ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = c.textMuted; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Add at least 2 points', W / 2, H / 2);
      });
      return;
    }
    var xs = pts.map(function(p) { return p.x; });
    var ys = pts.map(function(p) { return p.y; });
    var c = FE.getColors();

    // Raw
    var xMn = FE.min(xs) - 5, xMx = FE.max(xs) + 5;
    var yMn = FE.min(ys) - 10, yMx = FE.max(ys) + 10;
    drawPlot(ctxRaw, xs, ys, xMn, xMx, yMn, yMx, 'Raw', c.point);

    // Standardized
    var sxs = FE.standardize(xs), sys = FE.standardize(ys);
    var sxMn = FE.min(sxs) - 0.5, sxMx = FE.max(sxs) + 0.5;
    var syMn = FE.min(sys) - 0.5, syMx = FE.max(sys) + 0.5;
    drawPlot(ctxStd, sxs, sys, sxMn, sxMx, syMn, syMx, 'Standardized', c.green);

    // Min-Max
    var mxs = FE.minMaxScale(xs), mys = FE.minMaxScale(ys);
    drawPlot(ctxMM, mxs, mys, -0.1, 1.1, -0.1, 1.1, 'Min-Max', c.orange);

    // Robust
    var rxs = FE.robustScale(xs), rys = FE.robustScale(ys);
    var rxMn = FE.min(rxs) - 0.5, rxMx = FE.max(rxs) + 0.5;
    var ryMn = FE.min(rys) - 0.5, ryMx = FE.max(rys) + 0.5;
    drawPlot(ctxRob, rxs, rys, rxMn, rxMx, ryMn, ryMx, 'Robust', c.purple);

    infoEl.textContent = pts.length + ' points | \u03BC_x=' + FE.mean(xs).toFixed(1) + ' \u03C3_x=' + FE.std(xs).toFixed(1) + ' | \u03BC_y=' + FE.mean(ys).toFixed(1) + ' \u03C3_y=' + FE.std(ys).toFixed(1);
  }

  cvRaw.addEventListener('click', function(e) {
    var pos = FE.getMousePos(cvRaw, e);
    if (pts.length < 2) {
      pts.push({ x: pos.x - pad, y: H - pos.y - pad });
    } else {
      var xs = pts.map(function(p) { return p.x; });
      var ys = pts.map(function(p) { return p.y; });
      var xMn = FE.min(xs) - 5, xMx = FE.max(xs) + 5;
      var yMn = FE.min(ys) - 10, yMx = FE.max(ys) + 10;
      var pW = W - 2 * pad, pH = H - 2 * pad;
      var dataX = xMn + (pos.x - pad) / pW * (xMx - xMn);
      var dataY = yMn + (pad + pH - pos.y) / pH * (yMx - yMn);
      pts.push({ x: dataX, y: dataY });
    }
    draw();
  });

  cvRaw.addEventListener('touchend', function(e) {
    e.preventDefault();
    var touch = e.changedTouches[0];
    var pos = FE.getTouchPos(cvRaw, touch);
    if (pts.length < 2) {
      pts.push({ x: pos.x - pad, y: H - pos.y - pad });
    } else {
      var xs = pts.map(function(p) { return p.x; });
      var ys = pts.map(function(p) { return p.y; });
      var xMn = FE.min(xs) - 5, xMx = FE.max(xs) + 5;
      var yMn = FE.min(ys) - 10, yMx = FE.max(ys) + 10;
      var pW = W - 2 * pad, pH = H - 2 * pad;
      var dataX = xMn + (pos.x - pad) / pW * (xMx - xMn);
      var dataY = yMn + (pad + pH - pos.y) / pH * (yMx - yMn);
      pts.push({ x: dataX, y: dataY });
    }
    draw();
  });

  btnOutlier.addEventListener('click', function() {
    var xs = pts.map(function(p) { return p.x; });
    var ys = pts.map(function(p) { return p.y; });
    pts.push({
      x: FE.max(xs) + FE.std(xs) * 3,
      y: FE.max(ys) + FE.std(ys) * 3
    });
    draw();
  });

  btnReset.addEventListener('click', function() { genInitial(); draw(); });
  FE.observeTheme(draw);
  genInitial();
  draw();
})();
</script>

---

## 3. Effect on Gradient Descent

Let us see the convergence speed difference more precisely. The animation below runs gradient descent on both an unscaled and scaled quadratic loss, counting the steps to reach the minimum.

<div class="interactive-demo">
  <h4>Gradient Descent: Step-by-Step Comparison</h4>
  <canvas id="cvGdCompare" width="600" height="300"></canvas>
  <div class="demo-controls">
    <label>Learning Rate: <input type="range" id="gdLr" min="1" max="50" value="10"> <span class="demo-value" id="gdLrVal">0.010</span></label>
    <button id="btnGdStep">Step</button>
    <button id="btnGdAuto">Auto Run</button>
    <button id="btnGdRestart">Restart</button>
  </div>
  <div class="demo-info" id="gdCompInfo">Step 0 | Unscaled loss:, | Scaled loss: --</div>
  <div class="demo-caption">Settings: same starting point on both surfaces, learning rate slider controls step size.</div>
</div>

<script>
(function() {
  var cv = document.getElementById('cvGdCompare');
  var lrSlider = document.getElementById('gdLr');
  var lrVal = document.getElementById('gdLrVal');
  var btnStep = document.getElementById('btnGdStep');
  var btnAuto = document.getElementById('btnGdAuto');
  var btnRestart = document.getElementById('btnGdRestart');
  var infoEl = document.getElementById('gdCompInfo');
  var W = 600, H = 300;
  var ctx = FE.setupCanvas(cv, W, H);

  var uPos, sPos, stepN, animId, autoRunning;

  function reset() {
    if (animId) cancelAnimationFrame(animId);
    animId = null; autoRunning = false;
    uPos = [-2.5, 2.5]; sPos = [-2.5, 2.5];
    stepN = 0;
    btnAuto.textContent = 'Auto Run';
    draw();
    infoEl.textContent = 'Step 0 | Use Step or Auto Run';
  }

  function getLr() { return lrSlider.value / 1000; }

  function drawHalf(ox, w, pos, a, b, title, path) {
    var c = FE.getColors();
    var p = 30, pw = w - 2 * p, ph = H - 2 * p;
    // Contours
    var levels = [0.5, 2, 5, 10, 20, 40, 70];
    for (var li = 0; li < levels.length; li++) {
      var lev = levels[li];
      ctx.strokeStyle = c.grid; ctx.lineWidth = 0.8;
      ctx.beginPath();
      var first = true;
      for (var t = 0; t <= 200; t++) {
        var angle = t / 200 * Math.PI * 2;
        var rx = Math.sqrt(lev / a), ry = Math.sqrt(lev / b);
        var ex = rx * Math.cos(angle), ey = ry * Math.sin(angle);
        var px = ox + p + (ex + 3) / 6 * pw;
        var py = p + (3 - ey) / 6 * ph;
        if (px < ox + p || px > ox + p + pw || py < p || py > p + ph) { first = true; continue; }
        if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = c.border; ctx.lineWidth = 1;
    ctx.strokeRect(ox + p, p, pw, ph);
    // Path
    if (path && path.length > 1) {
      ctx.strokeStyle = c.pink; ctx.lineWidth = 2;
      ctx.beginPath();
      for (var i = 0; i < path.length; i++) {
        var px = ox + p + (path[i][0] + 3) / 6 * pw;
        var py = p + (3 - path[i][1]) / 6 * ph;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    // Current
    var cpx = ox + p + (pos[0] + 3) / 6 * pw;
    var cpy = p + (3 - pos[1]) / 6 * ph;
    ctx.fillStyle = c.pointAlt;
    ctx.beginPath(); ctx.arc(cpx, cpy, 5, 0, Math.PI * 2); ctx.fill();
    // Minimum
    var mx = ox + p + 3 / 6 * pw, my = p + 3 / 6 * ph;
    ctx.fillStyle = c.green;
    ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
    // Title
    ctx.fillStyle = c.text; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(title, ox + w / 2, 14);
  }

  var uPath = [], sPath = [];
  function draw() {
    var c = FE.getColors();
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
    uPath.push(uPos.slice());
    sPath.push(sPos.slice());
    drawHalf(0, W / 2, uPos, 50, 0.5, 'Unscaled', uPath);
    drawHalf(W / 2, W / 2, sPos, 1, 1, 'Scaled', sPath);
    // Divider
    ctx.strokeStyle = c.border; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
  }

  function doStep() {
    var lr = getLr();
    // Unscaled: grad = [100x, y]
    var gx = 100 * uPos[0], gy = 1 * uPos[1];
    uPos[0] -= lr * gx; uPos[1] -= lr * gy;
    // Scaled: grad = [2x, 2y]
    var sgx = 2 * sPos[0], sgy = 2 * sPos[1];
    sPos[0] -= lr * 10 * sgx; sPos[1] -= lr * 10 * sgy;
    stepN++;
    draw();
    var uLoss = 50 * uPos[0] * uPos[0] + 0.5 * uPos[1] * uPos[1];
    var sLoss = sPos[0] * sPos[0] + sPos[1] * sPos[1];
    infoEl.textContent = 'Step ' + stepN + ' | Unscaled loss: ' + uLoss.toFixed(4) + ' | Scaled loss: ' + sLoss.toFixed(4);
  }

  function autoRun() {
    if (autoRunning) { autoRunning = false; btnAuto.textContent = 'Auto Run'; return; }
    autoRunning = true; btnAuto.textContent = 'Pause';
    function tick() {
      if (!autoRunning || stepN > 200) { autoRunning = false; btnAuto.textContent = 'Auto Run'; return; }
      doStep();
      animId = requestAnimationFrame(tick);
    }
    tick();
  }

  lrSlider.addEventListener('input', function() { lrVal.textContent = getLr().toFixed(3); });
  btnStep.addEventListener('click', doStep);
  btnAuto.addEventListener('click', autoRun);
  btnRestart.addEventListener('click', function() { uPath = []; sPath = []; reset(); });
  FE.observeTheme(function() { uPath = []; sPath = []; draw(); });
  reset();
})();
</script>

The scaled version converges in just a handful of steps, while the unscaled version zigzags across the elongated valley. This is precisely why scaling features before training is critical for gradient-based algorithms like linear regression, logistic regression, and neural networks.

---

## 4. One-Hot Encoding

Machine learning models need numbers, not categories. One-hot encoding converts each unique category into a binary column: 1 if present, 0 otherwise. There is one important catch known as the dummy variable trap: if you have k categories, you only need k-1 binary columns, because using all k creates perfect multicollinearity where the last column is always determined by the others (if all are 0, the item must be that category). Toggle the checkbox in the demo below to see the difference.

<div class="interactive-demo">
  <h4>One-Hot Encoding: Categorical to Binary</h4>
  <div id="oneHotDemo">
    <div class="demo-controls" style="margin-top:0;margin-bottom:0.5rem;">
      <button id="btnOheAdd">Add Category</button>
      <button id="btnOheRemove">Remove Last</button>
      <button id="btnOheReset">Reset</button>
      <label><input type="checkbox" id="chkDummy"> Drop first (avoid dummy trap)</label>
    </div>
    <div class="encoding-table-wrap" id="oneHotTableWrap"></div>
  </div>
  <div class="demo-info" id="oneHotInfo">3 categories = 3 binary columns (or 2 with dummy trap avoidance)</div>
  <div class="demo-caption">Settings: 3 categories (Red, Blue, Green) and 6 random rows by default.</div>
</div>

<script>
(function() {
  var wrap = document.getElementById('oneHotTableWrap');
  var infoEl = document.getElementById('oneHotInfo');
  var btnAdd = document.getElementById('btnOheAdd');
  var btnRemove = document.getElementById('btnOheRemove');
  var btnReset = document.getElementById('btnOheReset');
  var chkDummy = document.getElementById('chkDummy');

  var allNames = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Cyan', 'Pink'];
  var categories = ['Red', 'Blue', 'Green'];
  var sampleRows = [];

  function genRows() {
    sampleRows = [];
    for (var i = 0; i < 6; i++) {
      sampleRows.push(categories[Math.floor(Math.random() * categories.length)]);
    }
  }

  function render() {
    var drop = chkDummy.checked;
    var cols = drop ? categories.slice(1) : categories.slice();
    var html = '<table><tr><th>Row</th><th>Color</th>';
    for (var j = 0; j < cols.length; j++) html += '<th>' + cols[j] + '</th>';
    html += '</tr>';
    for (var i = 0; i < sampleRows.length; i++) {
      html += '<tr><td>' + (i + 1) + '</td><td>' + sampleRows[i] + '</td>';
      for (var j = 0; j < cols.length; j++) {
        var hot = sampleRows[i] === cols[j] ? 1 : 0;
        html += '<td class="' + (hot ? 'hot' : '') + '">' + hot + '</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    wrap.innerHTML = html;
    var info = categories.length + ' categories = ' + cols.length + ' binary columns';
    if (drop) info += ' (dropped "' + categories[0] + '" to avoid dummy trap)';
    infoEl.textContent = info;
  }

  btnAdd.addEventListener('click', function() {
    if (categories.length < allNames.length) {
      categories.push(allNames[categories.length]);
      genRows();
      render();
    }
  });
  btnRemove.addEventListener('click', function() {
    if (categories.length > 2) {
      categories.pop();
      genRows();
      render();
    }
  });
  btnReset.addEventListener('click', function() {
    categories = ['Red', 'Blue', 'Green'];
    genRows(); render();
  });
  chkDummy.addEventListener('change', render);
  genRows(); render();
})();
</script>

---

## 5. Ordinal Encoding

When categories have a natural order (like Low < Medium < High), one-hot encoding throws away that information. Ordinal encoding preserves the ordering by mapping categories to integers.

<div class="interactive-demo">
  <h4>Ordinal vs One-Hot: When Order Matters</h4>
  <div class="demo-split">
    <div>
      <h5 style="text-align:center;margin:0 0 0.5rem">Ordinal Encoding</h5>
      <div class="encoding-table-wrap" id="ordTableWrap"></div>
    </div>
    <div>
      <h5 style="text-align:center;margin:0 0 0.5rem">One-Hot Encoding</h5>
      <div class="encoding-table-wrap" id="ordOheWrap"></div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btnOrdToggle">Toggle: Education Level</button>
    <button id="btnOrdToggle2">Toggle: T-shirt Size</button>
  </div>
  <div class="demo-info" id="ordInfo">Ordinal encoding preserves: High School < Bachelor's < Master's < PhD</div>
  <div class="demo-caption">Settings: Education preset by default (4 ordered levels). Switch to T-shirt Size for a 5-level example.</div>
</div>

<script>
(function() {
  var ordWrap = document.getElementById('ordTableWrap');
  var oheWrap = document.getElementById('ordOheWrap');
  var infoEl = document.getElementById('ordInfo');
  var btn1 = document.getElementById('btnOrdToggle');
  var btn2 = document.getElementById('btnOrdToggle2');

  var datasets = {
    education: {
      name: 'Education',
      cats: ['High School', "Bachelor's", "Master's", 'PhD'],
      samples: ["Bachelor's", 'PhD', 'High School', "Master's", "Bachelor's", 'PhD']
    },
    size: {
      name: 'Size',
      cats: ['XS', 'S', 'M', 'L', 'XL'],
      samples: ['M', 'L', 'XS', 'XL', 'S', 'M']
    }
  };
  var current = 'education';

  function render() {
    var ds = datasets[current];
    // Ordinal table
    var html = '<table><tr><th>Row</th><th>' + ds.name + '</th><th>Encoded</th></tr>';
    for (var i = 0; i < ds.samples.length; i++) {
      var val = ds.cats.indexOf(ds.samples[i]);
      html += '<tr><td>' + (i + 1) + '</td><td>' + ds.samples[i] + '</td><td class="hot">' + val + '</td></tr>';
    }
    html += '</table>';
    ordWrap.innerHTML = html;

    // One-hot table
    html = '<table><tr><th>Row</th>';
    for (var j = 0; j < ds.cats.length; j++) html += '<th>' + ds.cats[j] + '</th>';
    html += '</tr>';
    for (var i = 0; i < ds.samples.length; i++) {
      html += '<tr><td>' + (i + 1) + '</td>';
      for (var j = 0; j < ds.cats.length; j++) {
        var hot = ds.samples[i] === ds.cats[j] ? 1 : 0;
        html += '<td class="' + (hot ? 'hot' : '') + '">' + hot + '</td>';
      }
      html += '</tr>';
    }
    html += '</table>';
    oheWrap.innerHTML = html;

    infoEl.textContent = 'Ordinal preserves order: ' + ds.cats.join(' < ');
  }

  btn1.addEventListener('click', function() { current = 'education'; render(); });
  btn2.addEventListener('click', function() { current = 'size'; render(); });
  render();
})();
</script>

**When to use which:**
- **Ordinal encoding**: when categories have a meaningful order (education level, size, rating)
- **One-hot encoding**: when categories have no inherent order (color, city, product type)

---

## 6. Missing Value Strategies

Real datasets almost always have missing values, and the strategy you choose for handling them can significantly change your data distribution and model performance.

<div class="interactive-demo">
  <h4>Missing Value Imputation: Effect on Distribution</h4>
  <canvas id="cvMissing" width="600" height="320"></canvas>
  <div class="demo-controls">
    <button id="btnImpMean" class="active">Mean</button>
    <button id="btnImpMedian">Median</button>
    <button id="btnImpMode">Mode</button>
    <button id="btnImpDrop">Drop Rows</button>
    <button id="btnImpRegen">New Data</button>
  </div>
  <div class="demo-info" id="missingInfo">Strategy: Mean | 5 missing values imputed</div>
  <div class="demo-caption">Settings: 50 right-skewed samples with 5 to 9 random missing values, Mean strategy by default.</div>
</div>

<script>
(function() {
  var cv = document.getElementById('cvMissing');
  var infoEl = document.getElementById('missingInfo');
  var btnMean = document.getElementById('btnImpMean');
  var btnMedian = document.getElementById('btnImpMedian');
  var btnMode = document.getElementById('btnImpMode');
  var btnDrop = document.getElementById('btnImpDrop');
  var btnRegen = document.getElementById('btnImpRegen');
  var W = 600, H = 320;
  var ctx = FE.setupCanvas(cv, W, H);

  var data = [], missingIdx = [];
  var strategy = 'mean';

  function genData() {
    data = [];
    for (var i = 0; i < 50; i++) {
      // Right-skewed distribution
      var v = 20 + Math.abs(FE.randn()) * 15 + FE.randn() * 5;
      data.push(Math.round(v * 10) / 10);
    }
    // Make some missing
    missingIdx = [];
    var nMissing = 5 + Math.floor(Math.random() * 5);
    while (missingIdx.length < nMissing) {
      var idx = Math.floor(Math.random() * data.length);
      if (missingIdx.indexOf(idx) === -1) missingIdx.push(idx);
    }
  }

  function getImputed() {
    var present = [];
    for (var i = 0; i < data.length; i++) {
      if (missingIdx.indexOf(i) === -1) present.push(data[i]);
    }
    if (strategy === 'drop') return present;

    var fillVal;
    if (strategy === 'mean') fillVal = FE.mean(present);
    else if (strategy === 'median') fillVal = FE.median(present);
    else fillVal = FE.mode(present);

    var result = [];
    for (var i = 0; i < data.length; i++) {
      if (missingIdx.indexOf(i) !== -1) result.push(fillVal);
      else result.push(data[i]);
    }
    return result;
  }

  function drawHistogram(ctx, ox, w, vals, title, fillColor, highlightVals) {
    var c = FE.getColors();
    var pad = 40, pW = w - 2 * pad, pH = H - 2 * pad;
    // Compute bins
    var allVals = data.slice();
    var mn = FE.min(allVals) - 2, mx = FE.max(allVals) + 2;
    var nBins = 12;
    var binW = (mx - mn) / nBins;
    var bins = new Array(nBins).fill(0);
    var highlightBins = new Array(nBins).fill(0);
    for (var i = 0; i < vals.length; i++) {
      var bi = Math.min(Math.floor((vals[i] - mn) / binW), nBins - 1);
      if (bi < 0) bi = 0;
      bins[bi]++;
      if (highlightVals && highlightVals.indexOf(vals[i]) !== -1) {
        highlightBins[bi]++;
      }
    }
    var maxBin = 1;
    for (var i = 0; i < nBins; i++) if (bins[i] > maxBin) maxBin = bins[i];

    // Draw bars
    var barW = pW / nBins - 2;
    for (var i = 0; i < nBins; i++) {
      var bh = bins[i] / maxBin * (pH - 20);
      var bx = ox + pad + i * (pW / nBins) + 1;
      var by = pad + pH - bh;
      ctx.fillStyle = fillColor;
      ctx.fillRect(bx, by, barW, bh);
      // Highlight imputed portion
      if (highlightBins[i] > 0) {
        var hh = highlightBins[i] / maxBin * (pH - 20);
        ctx.fillStyle = c.pointAlt;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(bx, by, barW, hh);
        ctx.globalAlpha = 1;
      }
      // Bin label
      if (i % 2 === 0) {
        ctx.fillStyle = c.textMuted; ctx.font = '9px Inter, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText((mn + i * binW).toFixed(0), bx + barW / 2, pad + pH + 12);
      }
    }
    // Title
    ctx.fillStyle = c.text; ctx.font = 'bold 11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(title, ox + w / 2, 16);
    // Axes
    ctx.strokeStyle = c.border; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ox + pad, pad); ctx.lineTo(ox + pad, pad + pH); ctx.lineTo(ox + pad + pW, pad + pH); ctx.stroke();
  }

  function draw() {
    var c = FE.getColors();
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
    // Original (with gaps shown)
    var present = [];
    for (var i = 0; i < data.length; i++) {
      if (missingIdx.indexOf(i) === -1) present.push(data[i]);
    }
    drawHistogram(ctx, 0, W / 2, present, 'Original (' + missingIdx.length + ' missing)', c.point, null);

    // Imputed
    var imputed = getImputed();
    var impVals = [];
    if (strategy !== 'drop') {
      var fillVal;
      if (strategy === 'mean') fillVal = FE.mean(present);
      else if (strategy === 'median') fillVal = FE.median(present);
      else fillVal = FE.mode(present);
      for (var i = 0; i < missingIdx.length; i++) impVals.push(fillVal);
    }
    var label = strategy === 'drop' ? 'After Dropping (' + imputed.length + ' left)' : 'After ' + strategy.charAt(0).toUpperCase() + strategy.slice(1) + ' Imputation';
    drawHistogram(ctx, W / 2, W / 2, imputed, label, c.green, impVals);

    // Legend
    if (strategy !== 'drop') {
      ctx.fillStyle = c.pointAlt; ctx.fillRect(W / 2 + 50, 28, 10, 10);
      ctx.fillStyle = c.textMuted; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('Imputed values', W / 2 + 64, 37);
    }

    // Divider
    ctx.strokeStyle = c.border; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    ctx.setLineDash([]);

    // Info
    var infoText = 'Strategy: ' + strategy.charAt(0).toUpperCase() + strategy.slice(1);
    if (strategy === 'drop') infoText += ' | Dropped ' + missingIdx.length + ' rows (' + imputed.length + ' remaining)';
    else {
      var fv;
      if (strategy === 'mean') fv = FE.mean(present);
      else if (strategy === 'median') fv = FE.median(present);
      else fv = FE.mode(present);
      infoText += ' | Fill value: ' + fv.toFixed(2) + ' | ' + missingIdx.length + ' values imputed';
    }
    infoEl.textContent = infoText;
  }

  function setStrategy(s) {
    strategy = s;
    [btnMean, btnMedian, btnMode, btnDrop].forEach(function(b) { b.classList.remove('active'); });
    if (s === 'mean') btnMean.classList.add('active');
    else if (s === 'median') btnMedian.classList.add('active');
    else if (s === 'mode') btnMode.classList.add('active');
    else btnDrop.classList.add('active');
    draw();
  }

  btnMean.addEventListener('click', function() { setStrategy('mean'); });
  btnMedian.addEventListener('click', function() { setStrategy('median'); });
  btnMode.addEventListener('click', function() { setStrategy('mode'); });
  btnDrop.addEventListener('click', function() { setStrategy('drop'); });
  btnRegen.addEventListener('click', function() { genData(); draw(); });
  FE.observeTheme(draw);
  genData(); draw();
})();
</script>

**Choosing an imputation strategy:**
- **Mean**: Good for normally distributed data, sensitive to outliers
- **Median**: Better for skewed distributions, robust to outliers
- **Mode**: Best for categorical features or heavily peaked distributions
- **Drop rows**: Only when very few rows are missing and you have plenty of data

---

## 7. Feature Correlation Heatmap

Highly correlated features provide redundant information, and a correlation heatmap helps you spot these relationships at a glance. Click any cell below to see the scatter plot for that feature pair.

<div class="interactive-demo">
  <h4>Interactive Correlation Matrix</h4>
  <div class="demo-split">
    <div>
      <canvas id="cvHeatmap" width="300" height="300"></canvas>
      <div class="demo-caption">Click a cell to see scatter plot</div>
    </div>
    <div>
      <canvas id="cvScatter" width="300" height="300"></canvas>
      <div class="demo-caption" id="scatterCaption">Select a feature pair</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btnHeatRegen">New Dataset</button>
  </div>
  <div class="demo-info" id="heatInfo">5 features, 60 samples | Click any cell in the heatmap</div>
  <div class="demo-caption">Settings: 5 features (Age, Income, Spend, Score, Visits) and 60 synthetic samples with built-in correlations.</div>
</div>

<script>
(function() {
  var cvH = document.getElementById('cvHeatmap');
  var cvS = document.getElementById('cvScatter');
  var btnRegen = document.getElementById('btnHeatRegen');
  var infoEl = document.getElementById('heatInfo');
  var captionEl = document.getElementById('scatterCaption');
  var WH = 300, WS = 300, HH = 300, HS = 300;
  var ctxH = FE.setupCanvas(cvH, WH, HH);
  var ctxS = FE.setupCanvas(cvS, WS, HS);

  var features = ['Age', 'Income', 'Spend', 'Score', 'Visits'];
  var nF = features.length;
  var N = 60;
  var dataMatrix = [];
  var corrMatrix = [];
  var selI = -1, selJ = -1;

  function genData() {
    dataMatrix = [];
    // Age: 18-70
    var age = [];
    for (var i = 0; i < N; i++) age.push(18 + Math.random() * 52);
    dataMatrix.push(age);
    // Income: correlated with age
    var income = [];
    for (var i = 0; i < N; i++) income.push(age[i] * 800 + FE.randn() * 8000 + 20000);
    dataMatrix.push(income);
    // Spend: correlated with income
    var spend = [];
    for (var i = 0; i < N; i++) spend.push(income[i] * 0.3 + FE.randn() * 5000);
    dataMatrix.push(spend);
    // Score: negatively correlated with age
    var score = [];
    for (var i = 0; i < N; i++) score.push(100 - age[i] * 0.8 + FE.randn() * 10);
    dataMatrix.push(score);
    // Visits: mostly random
    var visits = [];
    for (var i = 0; i < N; i++) visits.push(Math.floor(Math.random() * 30) + 1);
    dataMatrix.push(visits);

    // Compute correlation matrix
    corrMatrix = [];
    for (var i = 0; i < nF; i++) {
      corrMatrix[i] = [];
      for (var j = 0; j < nF; j++) {
        corrMatrix[i][j] = FE.corr(dataMatrix[i], dataMatrix[j]);
      }
    }
  }

  function corrColor(r) {
    var c = FE.getColors();
    if (r >= 0) {
      // 0=neutral, 1=blue/accent
      var t = Math.abs(r);
      if (c.isDark) {
        var rv = Math.round(26 + t * (122 - 26));
        var gv = Math.round(27 + t * (162 - 27));
        var bv = Math.round(38 + t * (247 - 38));
        return 'rgb(' + rv + ',' + gv + ',' + bv + ')';
      } else {
        var rv = Math.round(255 - t * (255 - 37));
        var gv = Math.round(255 - t * (255 - 99));
        var bv = Math.round(255 - t * (255 - 235));
        return 'rgb(' + rv + ',' + gv + ',' + bv + ')';
      }
    } else {
      var t = Math.abs(r);
      if (c.isDark) {
        var rv = Math.round(26 + t * (247 - 26));
        var gv = Math.round(27 + t * (118 - 27));
        var bv = Math.round(38 + t * (142 - 38));
        return 'rgb(' + rv + ',' + gv + ',' + bv + ')';
      } else {
        var rv = Math.round(255 - t * (255 - 230));
        var gv = Math.round(255 - t * (255 - 57));
        var bv = Math.round(255 - t * (255 - 70));
        return 'rgb(' + rv + ',' + gv + ',' + bv + ')';
      }
    }
  }

  function drawHeatmap() {
    var c = FE.getColors();
    ctxH.fillStyle = c.bg; ctxH.fillRect(0, 0, WH, HH);
    var pad = 60, cellW = (WH - pad - 10) / nF, cellH = (HH - pad - 10) / nF;
    // Labels
    ctxH.fillStyle = c.text; ctxH.font = '10px Inter, sans-serif';
    for (var i = 0; i < nF; i++) {
      ctxH.textAlign = 'right';
      ctxH.fillText(features[i], pad - 4, pad + i * cellH + cellH / 2 + 4);
      ctxH.save();
      ctxH.translate(pad + i * cellW + cellW / 2, pad - 4);
      ctxH.rotate(-Math.PI / 4);
      ctxH.textAlign = 'left';
      ctxH.fillText(features[i], 0, 0);
      ctxH.restore();
    }
    // Cells
    for (var i = 0; i < nF; i++) {
      for (var j = 0; j < nF; j++) {
        var x = pad + j * cellW, y = pad + i * cellH;
        ctxH.fillStyle = corrColor(corrMatrix[i][j]);
        ctxH.fillRect(x, y, cellW - 1, cellH - 1);
        // Value text
        ctxH.fillStyle = Math.abs(corrMatrix[i][j]) > 0.5 ? '#fff' : c.text;
        ctxH.font = 'bold 10px JetBrains Mono, monospace';
        ctxH.textAlign = 'center';
        ctxH.fillText(corrMatrix[i][j].toFixed(2), x + cellW / 2, y + cellH / 2 + 4);
        // Selection highlight
        if (i === selI && j === selJ) {
          ctxH.strokeStyle = c.isDark ? '#fff' : '#000';
          ctxH.lineWidth = 2;
          ctxH.strokeRect(x + 1, y + 1, cellW - 3, cellH - 3);
        }
      }
    }
    // Title
    ctxH.fillStyle = c.text; ctxH.font = 'bold 11px Inter, sans-serif'; ctxH.textAlign = 'center';
    ctxH.fillText('Correlation Matrix', WH / 2, 12);
  }

  function drawScatter() {
    var c = FE.getColors();
    ctxS.fillStyle = c.bg; ctxS.fillRect(0, 0, WS, HS);
    if (selI < 0 || selJ < 0) {
      ctxS.fillStyle = c.textMuted; ctxS.font = '13px Inter, sans-serif'; ctxS.textAlign = 'center';
      ctxS.fillText('Click a cell in the heatmap', WS / 2, HS / 2);
      return;
    }
    var xs = dataMatrix[selJ], ys = dataMatrix[selI];
    var pad = 45;
    var xMn = FE.min(xs), xMx = FE.max(xs), yMn = FE.min(ys), yMx = FE.max(ys);
    var xPad = (xMx - xMn) * 0.1 || 1; var yPad = (yMx - yMn) * 0.1 || 1;
    xMn -= xPad; xMx += xPad; yMn -= yPad; yMx += yPad;
    FE.drawGrid(ctxS, WS, HS, pad, xMn, xMx, yMn, yMx, features[selJ], features[selI]);
    var pW = WS - 2 * pad, pH = HS - 2 * pad;
    var r = corrMatrix[selI][selJ];
    var col = r >= 0 ? c.point : c.pointAlt;
    ctxS.fillStyle = col;
    for (var k = 0; k < N; k++) {
      var px = pad + (xs[k] - xMn) / (xMx - xMn) * pW;
      var py = pad + pH - (ys[k] - yMn) / (yMx - yMn) * pH;
      ctxS.beginPath(); ctxS.arc(px, py, 3.5, 0, Math.PI * 2); ctxS.fill();
    }
    // Title
    ctxS.fillStyle = c.text; ctxS.font = 'bold 11px Inter, sans-serif'; ctxS.textAlign = 'center';
    ctxS.fillText(features[selJ] + ' vs ' + features[selI] + ' (r = ' + r.toFixed(3) + ')', WS / 2, 14);
    captionEl.textContent = features[selJ] + ' vs ' + features[selI] + ' | r = ' + r.toFixed(3);
  }

  function draw() { drawHeatmap(); drawScatter(); }

  cvH.addEventListener('click', function(e) {
    var pos = FE.getMousePos(cvH, e);
    var pad = 60, cellW = (WH - pad - 10) / nF, cellH = (HH - pad - 10) / nF;
    var j = Math.floor((pos.x - pad) / cellW);
    var i = Math.floor((pos.y - pad) / cellH);
    if (i >= 0 && i < nF && j >= 0 && j < nF) {
      selI = i; selJ = j;
      draw();
    }
  });

  cvH.addEventListener('touchend', function(e) {
    e.preventDefault();
    var touch = e.changedTouches[0];
    var pos = FE.getTouchPos(cvH, touch);
    var pad = 60, cellW = (WH - pad - 10) / nF, cellH = (HH - pad - 10) / nF;
    var j = Math.floor((pos.x - pad) / cellW);
    var i = Math.floor((pos.y - pad) / cellH);
    if (i >= 0 && i < nF && j >= 0 && j < nF) {
      selI = i; selJ = j;
      draw();
    }
  });

  btnRegen.addEventListener('click', function() { genData(); selI = -1; selJ = -1; draw(); });
  FE.observeTheme(draw);
  genData(); draw();
})();
</script>

**Interpreting correlations:**
- **r close to +1**: Strong positive correlation (Income and Spending move together)
- **r close to -1**: Strong negative correlation (Age and Score move inversely)
- **r close to 0**: No linear relationship (Visits is nearly independent)

Highly correlated features (|r| > 0.8) are candidates for removal, as they carry redundant information and can cause multicollinearity in linear models.

---

## 8. Polynomial Feature Generation

Polynomial features let linear models capture non-linear relationships by creating new features from combinations and powers of existing ones. Starting with features $$x_1$$ and $$x_2$$, degree-2 polynomial expansion produces:

$$[x_1, x_2] \rightarrow [x_1, x_2, x_1^2, x_1 x_2, x_2^2]$$

<div class="interactive-demo">
  <h4>Polynomial Feature Expansion</h4>
  <canvas id="cvPolyFeat" width="600" height="300"></canvas>
  <div class="demo-controls">
    <label>Degree: <input type="range" id="polyDeg" min="1" max="4" value="2"> <span class="demo-value" id="polyDegVal">2</span></label>
    <button id="btnPolyRegen">New Data</button>
  </div>
  <div class="demo-info" id="polyFeatInfo">Degree 2: 2 features expanded to 5</div>
  <div class="demo-caption">Settings: 8 random samples of two features, degree 2 by default.</div>
</div>

<script>
(function() {
  var cv = document.getElementById('cvPolyFeat');
  var degSlider = document.getElementById('polyDeg');
  var degVal = document.getElementById('polyDegVal');
  var btnRegen = document.getElementById('btnPolyRegen');
  var infoEl = document.getElementById('polyFeatInfo');
  var W = 600, H = 300;
  var ctx = FE.setupCanvas(cv, W, H);

  var x1 = [], x2 = [];
  var N = 8;

  function genData() {
    x1 = []; x2 = [];
    for (var i = 0; i < N; i++) {
      x1.push(Math.round((Math.random() * 4 + 1) * 10) / 10);
      x2.push(Math.round((Math.random() * 4 + 1) * 10) / 10);
    }
  }

  function getPolyFeatures(deg) {
    var names = ['x\u2081', 'x\u2082'];
    var cols = [x1.slice(), x2.slice()];
    if (deg >= 2) {
      names.push('x\u2081\u00B2');
      cols.push(x1.map(function(v) { return Math.round(v * v * 100) / 100; }));
      names.push('x\u2081x\u2082');
      cols.push(x1.map(function(v, i) { return Math.round(v * x2[i] * 100) / 100; }));
      names.push('x\u2082\u00B2');
      cols.push(x2.map(function(v) { return Math.round(v * v * 100) / 100; }));
    }
    if (deg >= 3) {
      names.push('x\u2081\u00B3');
      cols.push(x1.map(function(v) { return Math.round(v * v * v * 100) / 100; }));
      names.push('x\u2081\u00B2x\u2082');
      cols.push(x1.map(function(v, i) { return Math.round(v * v * x2[i] * 100) / 100; }));
      names.push('x\u2081x\u2082\u00B2');
      cols.push(x1.map(function(v, i) { return Math.round(v * x2[i] * x2[i] * 100) / 100; }));
      names.push('x\u2082\u00B3');
      cols.push(x2.map(function(v) { return Math.round(v * v * v * 100) / 100; }));
    }
    if (deg >= 4) {
      names.push('x\u2081\u2074');
      cols.push(x1.map(function(v) { return Math.round(v * v * v * v * 10) / 10; }));
      names.push('x\u2081\u00B3x\u2082');
      cols.push(x1.map(function(v, i) { return Math.round(v * v * v * x2[i] * 10) / 10; }));
      names.push('x\u2081\u00B2x\u2082\u00B2');
      cols.push(x1.map(function(v, i) { return Math.round(v * v * x2[i] * x2[i] * 10) / 10; }));
      names.push('x\u2081x\u2082\u00B3');
      cols.push(x1.map(function(v, i) { return Math.round(v * x2[i] * x2[i] * x2[i] * 10) / 10; }));
      names.push('x\u2082\u2074');
      cols.push(x2.map(function(v) { return Math.round(v * v * v * v * 10) / 10; }));
    }
    return { names: names, cols: cols };
  }

  function draw() {
    var c = FE.getColors();
    var deg = parseInt(degSlider.value);
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);

    var pf = getPolyFeatures(deg);
    var nCols = pf.names.length;
    var nRows = Math.min(N, 6);

    // Table layout
    var tLeft = 10, tTop = 30;
    var colW = Math.min(70, (W - 20) / (nCols + 1));
    var rowH = 24;
    var tW = colW * (nCols + 1);

    // Header
    ctx.fillStyle = c.bgSecondary || c.grid;
    ctx.fillRect(tLeft, tTop, tW, rowH);
    ctx.fillStyle = c.text; ctx.font = 'bold 10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText('Row', tLeft + colW / 2, tTop + 16);
    for (var j = 0; j < nCols; j++) {
      var x = tLeft + (j + 1) * colW;
      if (j < 2) ctx.fillStyle = c.point;
      else ctx.fillStyle = c.green;
      ctx.fillRect(x, tTop, colW - 1, rowH);
      ctx.fillStyle = j < 2 ? '#fff' : (c.isDark ? '#1a1b26' : '#fff');
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillText(pf.names[j], x + colW / 2, tTop + 16);
    }

    // Rows
    for (var i = 0; i < nRows; i++) {
      var y = tTop + (i + 1) * rowH;
      ctx.fillStyle = i % 2 === 0 ? c.bg : (c.bgSecondary || c.grid);
      ctx.fillRect(tLeft, y, tW, rowH);
      ctx.fillStyle = c.textMuted; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
      ctx.fillText('' + (i + 1), tLeft + colW / 2, y + 16);
      for (var j = 0; j < nCols; j++) {
        ctx.fillStyle = j < 2 ? c.text : c.green;
        ctx.font = '10px JetBrains Mono, monospace';
        var val = pf.cols[j][i];
        var txt = val >= 100 ? val.toFixed(0) : val.toFixed(1);
        ctx.fillText(txt, tLeft + (j + 1) * colW + colW / 2, y + 16);
      }
    }

    // Grid lines
    ctx.strokeStyle = c.border; ctx.lineWidth = 0.5;
    for (var i = 0; i <= nRows + 1; i++) {
      var y = tTop + i * rowH;
      ctx.beginPath(); ctx.moveTo(tLeft, y); ctx.lineTo(tLeft + tW, y); ctx.stroke();
    }
    for (var j = 0; j <= nCols + 1; j++) {
      var x = tLeft + j * colW;
      ctx.beginPath(); ctx.moveTo(x, tTop); ctx.lineTo(x, tTop + (nRows + 1) * rowH); ctx.stroke();
    }

    // Arrow showing expansion
    var arrowY = tTop + (nRows + 1) * rowH + 25;
    ctx.fillStyle = c.text; ctx.font = 'bold 12px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('2 original features', tLeft + colW * 1.5, arrowY);
    ctx.fillText('\u2192', tLeft + colW * 2.8, arrowY);
    ctx.fillStyle = c.green;
    ctx.fillText(nCols + ' features (degree ' + deg + ')', tLeft + colW * (2 + nCols / 2), arrowY);

    // Title
    ctx.fillStyle = c.text; ctx.font = 'bold 12px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Polynomial Feature Expansion', W / 2, 18);

    // Formula at bottom
    var fmY = arrowY + 25;
    ctx.fillStyle = c.textMuted; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    var formula = 'Degree ' + deg + ': # features = C(' + 2 + ' + ' + deg + ', ' + deg + ') = ' + nCols;
    ctx.fillText(formula, W / 2, fmY);

    infoEl.textContent = 'Degree ' + deg + ': 2 features expanded to ' + nCols + ' polynomial features';
    degVal.textContent = deg;
  }

  degSlider.addEventListener('input', draw);
  btnRegen.addEventListener('click', function() { genData(); draw(); });
  FE.observeTheme(draw);
  genData(); draw();
})();
</script>

The feature count grows fast. With $$n$$ features and degree $$d$$:

$$\text{Number of features} = \binom{n + d}{d}$$

For 10 original features at degree 3, that is 286 polynomial features. This is why polynomial expansion is powerful but requires regularization to prevent overfitting.

---

## 9. End-to-End Preprocessing Pipeline

In practice, you chain these steps together. The demo below shows how each preprocessing step transforms raw, messy data and affects a simple linear regression model's accuracy.

<div class="interactive-demo">
  <h4>Preprocessing Pipeline: Watch Accuracy Improve</h4>
  <canvas id="cvPipeline" width="600" height="350"></canvas>
  <div class="demo-controls">
    <label><input type="checkbox" id="pipeImpute" checked> Impute Missing</label>
    <label><input type="checkbox" id="pipeEncode" checked> Encode Categoricals</label>
    <label><input type="checkbox" id="pipeScale" checked> Scale Features</label>
    <label><input type="checkbox" id="pipePoly"> Add Poly Features</label>
    <button id="btnPipeRegen">New Data</button>
  </div>
  <div class="demo-info" id="pipeInfo">Toggle preprocessing steps to see their effect on model performance</div>
  <div class="demo-caption">Settings: imputation, encoding, and scaling enabled by default; polynomial features off. Toggle each to compare.</div>
</div>

<script>
(function() {
  var cv = document.getElementById('cvPipeline');
  var chkImpute = document.getElementById('pipeImpute');
  var chkEncode = document.getElementById('pipeEncode');
  var chkScale = document.getElementById('pipeScale');
  var chkPoly = document.getElementById('pipePoly');
  var btnRegen = document.getElementById('btnPipeRegen');
  var infoEl = document.getElementById('pipeInfo');
  var W = 600, H = 350;
  var ctx = FE.setupCanvas(cv, W, H);

  // Generate synthetic dataset with numeric + categorical features + missing values
  var N = 80;
  var rawX1 = [], rawX2 = [], rawCat = [], rawY = [], missingMask = [];

  function genData() {
    rawX1 = []; rawX2 = []; rawCat = []; rawY = []; missingMask = [];
    var cats = ['A', 'B', 'C'];
    for (var i = 0; i < N; i++) {
      var x1 = Math.random() * 100;
      var x2 = Math.random() * 5;
      var cat = cats[Math.floor(Math.random() * 3)];
      var catVal = cat === 'A' ? 0 : cat === 'B' ? 5 : 10;
      var y = 0.5 * x1 + 3 * x2 + catVal + FE.randn() * 5;
      rawX1.push(x1);
      rawX2.push(x2);
      rawCat.push(cat);
      rawY.push(y);
      // 10% chance of missing x1 or x2
      missingMask.push(Math.random() < 0.1 ? 1 : Math.random() < 0.1 ? 2 : 0);
    }
  }

  function processData() {
    var doImpute = chkImpute.checked;
    var doEncode = chkEncode.checked;
    var doScale = chkScale.checked;
    var doPoly = chkPoly.checked;

    // Step 1: Handle missing
    var x1 = rawX1.slice(), x2 = rawX2.slice(), y = rawY.slice(), cat = rawCat.slice();
    var kept = [];
    if (doImpute) {
      var validX1 = [], validX2 = [];
      for (var i = 0; i < N; i++) {
        if (missingMask[i] !== 1) validX1.push(x1[i]);
        if (missingMask[i] !== 2) validX2.push(x2[i]);
      }
      var m1 = FE.mean(validX1), m2 = FE.mean(validX2);
      for (var i = 0; i < N; i++) {
        if (missingMask[i] === 1) x1[i] = m1;
        if (missingMask[i] === 2) x2[i] = m2;
        kept.push(i);
      }
    } else {
      for (var i = 0; i < N; i++) {
        if (missingMask[i] === 0) kept.push(i);
      }
      x1 = kept.map(function(i) { return x1[i]; });
      x2 = kept.map(function(i) { return x2[i]; });
      y = kept.map(function(i) { return y[i]; });
      cat = kept.map(function(i) { return cat[i]; });
    }

    // Step 2: Encode categoricals
    var features = [];
    if (doImpute) {
      for (var i = 0; i < N; i++) features.push([x1[i], x2[i]]);
    } else {
      for (var i = 0; i < kept.length; i++) features.push([x1[i], x2[i]]);
    }
    if (doEncode) {
      for (var i = 0; i < features.length; i++) {
        var c = doImpute ? cat[i] : cat[i];
        features[i].push(c === 'B' ? 1 : 0);
        features[i].push(c === 'C' ? 1 : 0);
      }
    }

    // Step 3: Scale
    if (doScale) {
      var nFeat = features[0].length;
      for (var j = 0; j < nFeat; j++) {
        var col = features.map(function(r) { return r[j]; });
        var m = FE.mean(col), s = FE.std(col) || 1;
        for (var i = 0; i < features.length; i++) {
          features[i][j] = (features[i][j] - m) / s;
        }
      }
    }

    // Step 4: Polynomial features (degree 2 interactions)
    if (doPoly) {
      var origLen = features[0].length;
      for (var i = 0; i < features.length; i++) {
        var row = features[i];
        for (var a = 0; a < origLen; a++) {
          for (var b = a; b < origLen; b++) {
            row.push(row[a] * row[b]);
          }
        }
      }
    }

    var yArr = doImpute ? y : y;

    // Simple linear regression via normal equation
    // Add bias column
    var Xb = [];
    for (var i = 0; i < features.length; i++) {
      Xb.push([1].concat(features[i]));
    }
    // X^T X
    var nC = Xb[0].length, nR = Xb.length;
    var XtX = [];
    for (var i = 0; i < nC; i++) {
      XtX[i] = [];
      for (var j = 0; j < nC; j++) {
        var s = 0;
        for (var k = 0; k < nR; k++) s += Xb[k][i] * Xb[k][j];
        XtX[i][j] = s + (i === j ? 0.01 : 0); // ridge
      }
    }
    var XtY = [];
    for (var i = 0; i < nC; i++) {
      var s = 0;
      for (var k = 0; k < nR; k++) s += Xb[k][i] * yArr[k];
      XtY.push(s);
    }
    // Solve via Gauss elimination
    var aug = [];
    for (var i = 0; i < nC; i++) {
      aug[i] = XtX[i].slice();
      aug[i].push(XtY[i]);
    }
    for (var col = 0; col < nC; col++) {
      var maxR = col, maxV = Math.abs(aug[col][col]);
      for (var r = col + 1; r < nC; r++) {
        if (Math.abs(aug[r][col]) > maxV) { maxV = Math.abs(aug[r][col]); maxR = r; }
      }
      var tmp = aug[col]; aug[col] = aug[maxR]; aug[maxR] = tmp;
      var piv = aug[col][col];
      if (Math.abs(piv) < 1e-12) continue;
      for (var j = col; j <= nC; j++) aug[col][j] /= piv;
      for (var r = 0; r < nC; r++) {
        if (r === col) continue;
        var f = aug[r][col];
        for (var j = col; j <= nC; j++) aug[r][j] -= f * aug[col][j];
      }
    }
    var w = [];
    for (var i = 0; i < nC; i++) w.push(aug[i][nC]);

    // Compute R^2
    var pred = [];
    for (var i = 0; i < nR; i++) {
      var s = 0;
      for (var j = 0; j < nC; j++) s += Xb[i][j] * w[j];
      pred.push(s);
    }
    var yMean = FE.mean(yArr);
    var ssTot = 0, ssRes = 0;
    for (var i = 0; i < nR; i++) {
      ssTot += (yArr[i] - yMean) * (yArr[i] - yMean);
      ssRes += (yArr[i] - pred[i]) * (yArr[i] - pred[i]);
    }
    var r2 = 1 - ssRes / (ssTot || 1);

    return { n: nR, nFeat: nC - 1, r2: r2, pred: pred, yActual: yArr };
  }

  function draw() {
    var c = FE.getColors();
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);

    var result = processData();

    // Pipeline diagram
    var steps = [
      { name: 'Raw Data', desc: N + ' rows', active: true },
      { name: 'Impute', desc: chkImpute.checked ? 'Mean fill' : 'Drop rows', active: chkImpute.checked },
      { name: 'Encode', desc: chkEncode.checked ? 'One-hot' : 'Skip', active: chkEncode.checked },
      { name: 'Scale', desc: chkScale.checked ? 'Z-score' : 'Skip', active: chkScale.checked },
      { name: 'Poly', desc: chkPoly.checked ? 'Degree 2' : 'Skip', active: chkPoly.checked },
      { name: 'Model', desc: 'Linear Reg', active: true }
    ];

    var boxW = 80, boxH = 36, gap = 12;
    var totalW = steps.length * boxW + (steps.length - 1) * gap;
    var startX = (W - totalW) / 2;
    var topY = 20;

    for (var i = 0; i < steps.length; i++) {
      var x = startX + i * (boxW + gap);
      var active = steps[i].active;
      ctx.fillStyle = active ? c.accent : c.grid;
      ctx.globalAlpha = active ? 1 : 0.5;
      ctx.beginPath();
      ctx.roundRect(x, topY, boxW, boxH, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = active ? (c.isDark ? '#1a1b26' : '#fff') : c.textMuted;
      ctx.font = 'bold 10px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(steps[i].name, x + boxW / 2, topY + 15);
      ctx.font = '9px Inter, sans-serif';
      ctx.fillText(steps[i].desc, x + boxW / 2, topY + 28);
      // Arrow
      if (i < steps.length - 1) {
        ctx.fillStyle = c.textMuted;
        ctx.beginPath();
        ctx.moveTo(x + boxW + 2, topY + boxH / 2);
        ctx.lineTo(x + boxW + gap - 2, topY + boxH / 2 - 4);
        ctx.lineTo(x + boxW + gap - 2, topY + boxH / 2 + 4);
        ctx.fill();
      }
    }

    // Predicted vs Actual scatter plot
    var plotTop = topY + boxH + 30;
    var plotLeft = 60, plotRight = W / 2 - 20;
    var plotW = plotRight - plotLeft, plotH = H - plotTop - 40;

    // Grid
    var yActual = result.yActual, pred = result.pred;
    var allVals = yActual.concat(pred);
    var vMin = FE.min(allVals) - 2, vMax = FE.max(allVals) + 2;

    ctx.strokeStyle = c.grid; ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) {
      var x = plotLeft + plotW * i / 4;
      ctx.beginPath(); ctx.moveTo(x, plotTop); ctx.lineTo(x, plotTop + plotH); ctx.stroke();
      var y = plotTop + plotH * i / 4;
      ctx.beginPath(); ctx.moveTo(plotLeft, y); ctx.lineTo(plotRight, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border; ctx.lineWidth = 1;
    ctx.strokeRect(plotLeft, plotTop, plotW, plotH);

    // Perfect line
    ctx.strokeStyle = c.textMuted; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(plotLeft, plotTop + plotH);
    ctx.lineTo(plotRight, plotTop);
    ctx.stroke();
    ctx.setLineDash([]);

    // Points
    ctx.fillStyle = c.point;
    for (var i = 0; i < yActual.length; i++) {
      var px = plotLeft + (yActual[i] - vMin) / (vMax - vMin) * plotW;
      var py = plotTop + plotH - (pred[i] - vMin) / (vMax - vMin) * plotH;
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
    }

    // Labels
    ctx.fillStyle = c.text; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Actual', plotLeft + plotW / 2, H - 5);
    ctx.save(); ctx.translate(15, plotTop + plotH / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText('Predicted', 0, 0); ctx.restore();
    ctx.fillText('Predicted vs Actual', plotLeft + plotW / 2, plotTop - 8);

    // R-squared bar chart on right side
    var barLeft = W / 2 + 40, barRight = W - 30;
    var barW = barRight - barLeft;
    var barTop = plotTop + 10;

    // Run with different configs to show comparison
    var configs = [
      { name: 'Current', r2: result.r2, col: c.accent },
    ];

    // Quick benchmark: no preprocessing
    var savedI = chkImpute.checked, savedE = chkEncode.checked, savedS = chkScale.checked, savedP = chkPoly.checked;

    chkImpute.checked = false; chkEncode.checked = false; chkScale.checked = false; chkPoly.checked = false;
    var baseResult = processData();
    configs.push({ name: 'No preprocessing', r2: baseResult.r2, col: c.textMuted });

    chkImpute.checked = savedI; chkEncode.checked = savedE; chkScale.checked = savedS; chkPoly.checked = savedP;

    // Draw R2 comparison
    ctx.fillStyle = c.text; ctx.font = 'bold 12px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('R\u00B2 Score', barLeft + barW / 2, barTop);

    for (var i = 0; i < configs.length; i++) {
      var by = barTop + 25 + i * 55;
      var r2 = Math.max(0, configs[i].r2);
      // Label
      ctx.fillStyle = c.text; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(configs[i].name, barLeft, by);
      // Bar background
      ctx.fillStyle = c.grid;
      ctx.fillRect(barLeft, by + 6, barW, 20);
      // Bar fill
      ctx.fillStyle = configs[i].col;
      ctx.fillRect(barLeft, by + 6, barW * r2, 20);
      // Value
      ctx.fillStyle = c.text; ctx.font = 'bold 11px JetBrains Mono, monospace'; ctx.textAlign = 'right';
      ctx.fillText(configs[i].r2.toFixed(3), barRight, by + 42);
    }

    // Improvement arrow
    if (configs[0].r2 > configs[1].r2) {
      var improvement = ((configs[0].r2 - configs[1].r2) / (Math.abs(configs[1].r2) || 0.01) * 100);
      ctx.fillStyle = c.green; ctx.font = 'bold 13px Inter, sans-serif'; ctx.textAlign = 'center';
      var arrowY2 = barTop + 150;
      ctx.fillText('\u2191 ' + (improvement > 999 ? '>999' : improvement.toFixed(0)) + '% improvement', barLeft + barW / 2, arrowY2);
    }

    infoEl.textContent = 'Samples: ' + result.n + ' | Features: ' + result.nFeat + ' | R\u00B2: ' + result.r2.toFixed(4);
  }

  chkImpute.addEventListener('change', draw);
  chkEncode.addEventListener('change', draw);
  chkScale.addEventListener('change', draw);
  chkPoly.addEventListener('change', draw);
  btnRegen.addEventListener('click', function() { genData(); draw(); });
  FE.observeTheme(draw);
  genData(); draw();
})();
</script>

Toggle each preprocessing step on and off to see how the R-squared score changes. Notice that encoding the categorical variable often produces the biggest improvement, since the model cannot interpret raw category labels without it.

---

## 10. Summary

<table class="fe-table">
<tr><th>Technique</th><th>When to Use</th><th>Formula / Method</th></tr>
<tr><td>Standardization</td><td>Gradient-based models, features on different scales</td><td>$$\frac{x - \mu}{\sigma}$$</td></tr>
<tr><td>Min-Max Scaling</td><td>When you need bounded [0,1] range, neural networks</td><td>$$\frac{x - x_{\min}}{x_{\max} - x_{\min}}$$</td></tr>
<tr><td>Robust Scaling</td><td>Data with outliers</td><td>$$\frac{x - \text{median}}{\text{IQR}}$$</td></tr>
<tr><td>One-Hot Encoding</td><td>Nominal categories (no order)</td><td>k categories to k-1 binary columns</td></tr>
<tr><td>Ordinal Encoding</td><td>Ordered categories</td><td>Map to integers preserving order</td></tr>
<tr><td>Mean/Median Imputation</td><td>Missing numerical values</td><td>Replace with column mean or median</td></tr>
<tr><td>Polynomial Features</td><td>Capturing non-linear relationships with linear models</td><td>Generate powers and interactions</td></tr>
</table>

### Common Pitfalls

- **Data leakage**: Fitting the scaler on the entire dataset (including test data). Always fit on training data only, then transform both train and test.
- **Scaling after splitting**: Scale features after the train/test split to avoid leakage.
- **Dummy variable trap**: Using all k one-hot columns instead of k-1. Drop one column to avoid perfect multicollinearity.
- **Ignoring feature distributions**: Applying standardization to heavily skewed data. Consider log transforms or robust scaling instead.
- **Over-engineering features**: Adding too many polynomial features without regularization leads to overfitting.

### Best Practices

1. **Explore first**: Visualize distributions, check for missing values, examine correlations
2. **Handle missing values** before other transformations
3. **Encode categoricals** appropriately (one-hot vs ordinal)
4. **Scale features** for gradient-based algorithms (not needed for tree-based models)
5. **Create meaningful interactions** based on domain knowledge, not blindly
6. **Use pipelines** to prevent data leakage and ensure reproducibility

### What is Next

In the next chapter, we will explore Principal Component Analysis (PCA), a powerful dimensionality reduction technique that transforms correlated features into a smaller set of uncorrelated components, building directly on the scaling and correlation concepts we learned here.

---

This is part of the [Machine Learning from Scratch]({{ site.baseurl }}/ml/) series. You can explore topics in any order, though they build naturally on each other.
