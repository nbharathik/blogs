---
layout: post
title: "Linear Regression from Scratch: An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Build linear regression from the ground up with interactive visualizations. Drag points, adjust parameters, watch gradient descent converge - all in your browser."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
date: 2026-03-16
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
.code-runner-area {
  width: 100%;
  min-height: 220px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  line-height: 1.5;
  tab-size: 2;
}
.code-runner-output {
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}
.predict-input {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  width: 160px;
  font-family: 'JetBrains Mono', monospace;
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
.demo-3d-container {
  position: relative;
}
.demo-try {
  margin-top: 0.6rem;
  padding: 0.55rem 0.75rem;
  border: 1px dashed var(--border);
  border-radius: 8px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  background: var(--bg-primary);
}
</style>

<script>
// Shared utilities and state for all interactive demos
window.LR = (function() {
  // Default dataset: area (sq ft) vs price ($1000s) - 10 points
  var defaultData = [
    {x: 800, y: 160}, {x: 1100, y: 210}, {x: 1400, y: 240},
    {x: 1700, y: 310}, {x: 2000, y: 350}, {x: 2300, y: 390},
    {x: 2600, y: 430}, {x: 3000, y: 500}, {x: 3300, y: 540},
    {x: 3800, y: 610}
  ];
  var data = defaultData.map(function(p) { return {x: p.x, y: p.y}; });

  // Shared trained state - persists across all demos
  var trained = { w: 0, b: 0, done: false, cost: 0 };

  function resetData() {
    data.length = 0;
    defaultData.forEach(function(p) { data.push({x: p.x, y: p.y}); });
    trained.done = false;
  }

  // Train the model with feature normalization (call from any demo, result shared)
  function train(lr, iters) {
    lr = lr || 0.01;
    iters = iters || 3000;
    if (data.length < 2) return trained;
    // Normalize features for stable gradient descent
    var xMean = 0, yMean = 0, xStd = 0, yStd = 0;
    data.forEach(function(p) { xMean += p.x; yMean += p.y; });
    xMean /= data.length; yMean /= data.length;
    data.forEach(function(p) { xStd += (p.x - xMean) * (p.x - xMean); yStd += (p.y - yMean) * (p.y - yMean); });
    xStd = Math.sqrt(xStd / data.length) || 1;
    yStd = Math.sqrt(yStd / data.length) || 1;
    var norm = data.map(function(p) { return {x: (p.x - xMean) / xStd, y: (p.y - yMean) / yStd}; });
    // Train on normalized data
    var w = 0, b = 0;
    for (var i = 0; i < iters; i++) {
      var g = computeGradients(norm, w, b);
      w -= lr * g.dw;
      b -= lr * g.db;
    }
    // Convert back to original scale
    trained.w = w * yStd / xStd;
    trained.b = yMean - trained.w * xMean;
    trained.cost = computeCost(data, trained.w, trained.b);
    trained.done = true;
    return trained;
  }

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
      btnBg: dark ? '#292e42' : '#f3f4f6'
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

  function mapX(val, xMin, xMax, padL, plotW) {
    return padL + (val - xMin) / (xMax - xMin) * plotW;
  }
  function mapY(val, yMin, yMax, padT, plotH) {
    return padT + plotH - (val - yMin) / (yMax - yMin) * plotH;
  }
  function unmapX(px, xMin, xMax, padL, plotW) {
    return xMin + (px - padL) / plotW * (xMax - xMin);
  }
  function unmapY(py, yMin, yMax, padT, plotH) {
    return yMin + (padT + plotH - py) / plotH * (yMax - yMin);
  }

  function drawGrid(ctx, w, h, padL, padR, padT, padB, xMin, xMax, yMin, yMax, xLabel, yLabel) {
    var c = getColors();
    var plotW = w - padL - padR;
    var plotH = h - padT - padB;
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    var xTicks = 5, yTicks = 5;
    for (var i = 0; i <= xTicks; i++) {
      var x = padL + (plotW / xTicks) * i;
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
    }
    for (var j = 0; j <= yTicks; j++) {
      var y = padT + (plotH / yTicks) * j;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    }
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.stroke();
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (var i = 0; i <= xTicks; i++) {
      var val = xMin + (xMax - xMin) / xTicks * i;
      var x = padL + (plotW / xTicks) * i;
      ctx.fillText(Math.round(val).toString(), x, padT + plotH + 16);
    }
    ctx.textAlign = 'right';
    for (var j = 0; j <= yTicks; j++) {
      var val = yMax - (yMax - yMin) / yTicks * j;
      var y = padT + (plotH / yTicks) * j;
      ctx.fillText(Math.round(val).toString(), padL - 6, y + 4);
    }
    ctx.fillStyle = c.text;
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (xLabel) ctx.fillText(xLabel, padL + plotW / 2, h - 2);
    if (yLabel) {
      ctx.save();
      ctx.translate(12, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();
    }
  }

  function drawPoints(ctx, pts, xMin, xMax, yMin, yMax, padL, padR, padT, padB, w, h, radius) {
    var c = getColors();
    var plotW = w - padL - padR;
    var plotH = h - padT - padB;
    var r = radius || 5;
    pts.forEach(function(p) {
      var cx = mapX(p.x, xMin, xMax, padL, plotW);
      var cy = mapY(p.y, yMin, yMax, padT, plotH);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = c.point;
      ctx.fill();
      ctx.strokeStyle = c.pointStroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  function drawLine(ctx, w_val, b_val, xMin, xMax, yMin, yMax, padL, padR, padT, padB, canW, canH, color) {
    var c = getColors();
    var plotW = canW - padL - padR;
    var plotH = canH - padT - padB;
    var x1 = xMin, y1 = w_val * x1 + b_val;
    var x2 = xMax, y2 = w_val * x2 + b_val;
    ctx.strokeStyle = color || c.line;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(mapX(x1, xMin, xMax, padL, plotW), mapY(y1, yMin, yMax, padT, plotH));
    ctx.lineTo(mapX(x2, xMin, xMax, padL, plotW), mapY(y2, yMin, yMax, padT, plotH));
    ctx.stroke();
  }

  function computeCost(pts, w, b) {
    var m = pts.length;
    if (m === 0) return 0;
    var sum = 0;
    pts.forEach(function(p) { var err = w * p.x + b - p.y; sum += err * err; });
    return sum / (2 * m);
  }

  function computeGradients(pts, w, b) {
    var m = pts.length;
    if (m === 0) return {dw: 0, db: 0};
    var dw = 0, db = 0;
    pts.forEach(function(p) { var err = w * p.x + b - p.y; dw += err * p.x; db += err; });
    return {dw: dw / m, db: db / m};
  }

  var themeCallbacks = [];
  function onThemeChange(cb) { themeCallbacks.push(cb); }
  var observer = new MutationObserver(function() {
    themeCallbacks.forEach(function(cb) { cb(); });
  });
  observer.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});

  var dataCallbacks = [];
  function onDataChange(cb) { dataCallbacks.push(cb); }
  function notifyDataChange() {
    trained.done = false;
    dataCallbacks.forEach(function(cb) { try { cb(); } catch(e) {} });
  }

  return {
    data: data, defaultData: defaultData, resetData: resetData,
    trained: trained, train: train,
    getColors: getColors, setupCanvas: setupCanvas,
    mapX: mapX, mapY: mapY, unmapX: unmapX, unmapY: unmapY,
    drawGrid: drawGrid, drawPoints: drawPoints, drawLine: drawLine,
    computeCost: computeCost, computeGradients: computeGradients,
    onThemeChange: onThemeChange,
    onDataChange: onDataChange, notifyDataChange: notifyDataChange
  };
})();
</script>

Linear regression is one of the most important starting points in machine learning. It is simple enough to understand deeply, but powerful enough to teach ideas used in larger models: defining a model, measuring error, and improving parameters with optimization.

In this interactive guide, we will build linear regression **from scratch** using one concrete problem: **predicting house prices from area (square feet)**. If we know area and price for past houses, can we learn a formula that predicts price for a new house?

By the end of this post, you will understand:
- **Hypothesis function** - the prediction formula
- **Cost function** - how prediction error is measured
- **Gradient descent** - how parameters are optimized
- **Learning rate** - why step size matters during training
- **Prediction** - how to use trained parameters on new inputs

<div class="demo-hint">
<strong>How to use the interactive demos:</strong> Work from top to bottom. The dataset you create in the first demo is shared across all sections, and trained parameters carry forward to later demos.
</div>

---

## What is Linear Regression?

Linear regression is a **supervised learning** algorithm. "Supervised" means we train on examples where both input and correct output are known. The model learns a mapping from input to output, then uses that mapping on unseen inputs.

In our example:
- **Input (feature):** House area in square feet (we call this $$x$$)
- **Output (label):** House price in thousands of dollars (we call this $$y$$)

The "linear" part means the model assumes a **straight-line relationship** between input and output. It is the simplest possible form, and often a strong baseline.

A simple linear equation looks like:

$$y = m \cdot x + c$$

$$m$$ is the **slope** of the line and $$c$$ is the **y-intercept** (where the line crosses the y-axis). In machine learning, we use different notation:

$$\hat{y} = w \cdot x + b$$

where:
- $$w$$ stands for **weight** (same as slope $$m$$)
- $$b$$ stands for **bias** (same as y-intercept $$c$$)
- $$\hat{y}$$ ("y-hat") is the **predicted** value (to distinguish it from the actual value $$y$$)

The goal is simple: **given data points $$(x, y)$$, find $$w$$ and $$b$$ so that $$\hat{y} = wx + b$$ fits the data as closely as possible.**

---

## The Training Dataset

Every machine learning model starts with data. Below, we have 10 houses with area (sq ft) and price (in $1000s). This is our **training dataset**: labeled examples the model uses to learn a pattern.

The quality of this dataset matters. If it reflects real-world patterns, predictions on new houses are usually better.

<div class="demo-hint">
<strong>Interactive:</strong> Click anywhere on the plot to <strong>add</strong> a new data point. Drag existing points to <strong>move</strong> them. Double-click a point to <strong>remove</strong> it. All demos below automatically use this dataset.
</div>

<div class="interactive-demo">
<canvas id="demo1-canvas"></canvas>
<div class="demo-controls">
  <button onclick="LR.resetData(); demo1Draw(); LR.notifyDataChange();">Reset Data</button>
  <span class="demo-info" id="demo1-info">10 points</span>
</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('demo1-canvas');
  var info = document.getElementById('demo1-info');
  var W = 680, H = 400;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = 0, xMax = 5000, yMin = 0, yMax = 750;
  var dragging = null;

  function draw() {
    var ctx = LR.setupCanvas(canvas, W, H);
    var c = LR.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    LR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Area (sq ft)', 'Price ($1000s)');
    LR.drawPoints(ctx, LR.data, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H, 6);
    info.textContent = LR.data.length + ' points';
  }

  function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (W / rect.width), y: (e.clientY - rect.top) * (H / rect.height) };
  }

  function findPoint(mx, my) {
    var plotW = W - padL - padR, plotH = H - padT - padB;
    for (var i = 0; i < LR.data.length; i++) {
      var px = LR.mapX(LR.data[i].x, xMin, xMax, padL, plotW);
      var py = LR.mapY(LR.data[i].y, yMin, yMax, padT, plotH);
      if (Math.hypot(mx - px, my - py) < 14) return i;
    }
    return -1;
  }

  var lastClick = 0;
  canvas.addEventListener('mousedown', function(e) {
    e.preventDefault();
    var pos = getMousePos(e);
    var idx = findPoint(pos.x, pos.y);
    var now = Date.now();
    if (idx >= 0 && now - lastClick < 400) { LR.data.splice(idx, 1); draw(); LR.notifyDataChange(); lastClick = 0; return; }
    lastClick = now;
    if (idx >= 0) { dragging = idx; }
    else {
      var plotW = W - padL - padR, plotH = H - padT - padB;
      var dx = LR.unmapX(pos.x, xMin, xMax, padL, plotW);
      var dy = LR.unmapY(pos.y, yMin, yMax, padT, plotH);
      if (dx >= xMin && dx <= xMax && dy >= yMin && dy <= yMax) {
        LR.data.push({x: Math.round(dx), y: Math.round(dy)});
        draw();
        LR.notifyDataChange();
      }
    }
  });
  canvas.addEventListener('mousemove', function(e) {
    if (dragging === null) return;
    var pos = getMousePos(e);
    var plotW = W - padL - padR, plotH = H - padT - padB;
    LR.data[dragging].x = Math.max(xMin, Math.min(xMax, Math.round(LR.unmapX(pos.x, xMin, xMax, padL, plotW))));
    LR.data[dragging].y = Math.max(yMin, Math.min(yMax, Math.round(LR.unmapY(pos.y, yMin, yMax, padT, plotH))));
    LR.trained.done = false;
    draw();
  });
  canvas.addEventListener('mouseup', function() { if (dragging !== null) { dragging = null; LR.notifyDataChange(); } });
  canvas.addEventListener('mouseleave', function() { if (dragging !== null) { dragging = null; LR.notifyDataChange(); } });
  // Touch
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var pos = getMousePos(e.touches[0]);
    var idx = findPoint(pos.x, pos.y);
    if (idx >= 0) { dragging = idx; } else {
      var plotW = W - padL - padR, plotH = H - padT - padB;
      var dx = LR.unmapX(pos.x, xMin, xMax, padL, plotW);
      var dy = LR.unmapY(pos.y, yMin, yMax, padT, plotH);
      if (dx >= xMin && dx <= xMax && dy >= yMin && dy <= yMax) { LR.data.push({x: Math.round(dx), y: Math.round(dy)}); draw(); LR.notifyDataChange(); }
    }
  }, {passive: false});
  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (dragging === null) return;
    var pos = getMousePos(e.touches[0]);
    var plotW = W - padL - padR, plotH = H - padT - padB;
    LR.data[dragging].x = Math.max(xMin, Math.min(xMax, Math.round(LR.unmapX(pos.x, xMin, xMax, padL, plotW))));
    LR.data[dragging].y = Math.max(yMin, Math.min(yMax, Math.round(LR.unmapY(pos.y, yMin, yMax, padT, plotH))));
    LR.trained.done = false; draw();
  }, {passive: false});
  canvas.addEventListener('touchend', function() { if (dragging !== null) { dragging = null; LR.notifyDataChange(); } });

  window.demo1Draw = draw;
  LR.onThemeChange(draw);
  draw();
})();
</script>

Looking at the plot, there is a clear trend: larger area usually means higher price. The points are not perfectly on one line, and that is normal.

Our goal is to find a **best-fit line** that keeps overall error as small as possible across all points.

---

## The Hypothesis Function

In machine learning, the **hypothesis function** is the model's prediction formula. It maps input to predicted output. For linear regression, the hypothesis is:

$$h(x) = w \cdot x + b$$

This is a straight line. The two parameters $$w$$ and $$b$$ completely determine the line:

- **Weight ($$w$$)** controls the **slope**. Larger $$w$$ means price rises faster with area. If $$w = 0$$, the line is flat. If $$w < 0$$, price decreases as area increases.

- **Bias ($$b$$)** controls the **y-intercept**. It shifts the line up or down without changing slope. You can think of it as a base level before area contributes through $$w$$.

Together, $$w$$ and $$b$$ are the model's **parameters**. Training means finding the values that produce the best fit.

<div class="demo-hint">
<strong>Interactive:</strong> Drag the <strong>weight</strong> and <strong>bias</strong> sliders to see how each parameter affects the line. Try setting the weight to 0, or making it negative. Try large and small bias values.
</div>

<div class="interactive-demo">
<canvas id="demo2-canvas"></canvas>
<div class="demo-controls">
  <label>Weight (w): <input type="range" id="demo2-w" min="-0.1" max="0.4" step="0.002" value="0.15"> <span class="demo-value" id="demo2-w-val">0.150</span></label>
  <label>Bias (b): <input type="range" id="demo2-b" min="-100" max="300" step="2" value="30"> <span class="demo-value" id="demo2-b-val">30</span></label>
</div>
<div class="demo-info" id="demo2-eq">h(x) = 0.150 * x + 30</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('demo2-canvas');
  var wSlider = document.getElementById('demo2-w');
  var bSlider = document.getElementById('demo2-b');
  var wVal = document.getElementById('demo2-w-val');
  var bVal = document.getElementById('demo2-b-val');
  var eqEl = document.getElementById('demo2-eq');
  var W = 680, H = 400;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = 0, xMax = 5000, yMin = 0, yMax = 750;

  function draw() {
    var w = parseFloat(wSlider.value);
    var b = parseFloat(bSlider.value);
    wVal.textContent = w.toFixed(3);
    bVal.textContent = Math.round(b);
    eqEl.textContent = 'h(x) = ' + w.toFixed(3) + ' \u00b7 x + ' + Math.round(b);
    var ctx = LR.setupCanvas(canvas, W, H);
    var c = LR.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    LR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Area (sq ft)', 'Price ($1000s)');
    LR.drawLine(ctx, w, b, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H);
    LR.drawPoints(ctx, LR.data, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H, 6);
  }

  wSlider.addEventListener('input', draw);
  bSlider.addEventListener('input', draw);
  LR.onThemeChange(draw);
  LR.onDataChange(draw);
  draw();
})();
</script>

Notice how **weight** changes steepness while **bias** shifts vertically. To find the best fit, we need a precise way to measure "how wrong" a line is. That is the **cost function**.

---

## The Cost Function (Mean Squared Error)

The cost function (also called **loss** or **objective**) is a single number that tells us **how wrong the current model is**. High cost means predictions are far from actual values. Low cost means the line fits well. Training is the process of finding $$w$$ and $$b$$ that minimize this value.

The most common cost function for linear regression is the **Mean Squared Error (MSE)**:

$$J(w,b) = \frac{1}{2m}\sum_{i=1}^{m}\left(h(x^{(i)}) - y^{(i)}\right)^2$$

Let us break this down:

1. **$$h(x^{(i)}) - y^{(i)}$$** is the **error** (residual) for one point: prediction minus actual value.

2. **$$(\ldots)^2$$** squares each error, so positives and negatives do not cancel, and large misses are penalized more strongly.

3. **$$\sum_{i=1}^{m}$$** adds squared errors across all $$m$$ points.

4. **$$\frac{1}{2m}$$** averages over the dataset. The extra $$\frac{1}{2}$$ is a convenience that simplifies derivatives.

<div class="demo-hint">
<strong>Interactive:</strong> Adjust the weight and bias sliders. The <strong>red dashed lines</strong> show the error (residual) for each point. The <strong>semi-transparent red squares</strong> visualize the squared error - bigger squares mean bigger errors. Watch the MSE value and try to minimize it!
</div>

<div class="interactive-demo">
<canvas id="demo3-canvas"></canvas>
<div class="demo-controls">
  <label>w: <input type="range" id="demo3-w" min="-0.1" max="0.4" step="0.002" value="0.10"> <span class="demo-value" id="demo3-w-val">0.100</span></label>
  <label>b: <input type="range" id="demo3-b" min="-100" max="300" step="2" value="80"> <span class="demo-value" id="demo3-b-val">80</span></label>
</div>
<div class="demo-info" id="demo3-cost">Cost J(w,b) = 0.00</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('demo3-canvas');
  var wSlider = document.getElementById('demo3-w');
  var bSlider = document.getElementById('demo3-b');
  var wVal = document.getElementById('demo3-w-val');
  var bVal = document.getElementById('demo3-b-val');
  var costEl = document.getElementById('demo3-cost');
  var W = 680, H = 420;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = 0, xMax = 5000, yMin = 0, yMax = 750;

  function draw() {
    var w = parseFloat(wSlider.value);
    var b = parseFloat(bSlider.value);
    wVal.textContent = w.toFixed(3);
    bVal.textContent = Math.round(b);
    var ctx = LR.setupCanvas(canvas, W, H);
    var c = LR.getColors();
    var plotW = W - padL - padR, plotH = H - padT - padB;
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    LR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Area (sq ft)', 'Price ($1000s)');

    // Error squares and residual lines
    LR.data.forEach(function(p) {
      var pred = w * p.x + b;
      var px = LR.mapX(p.x, xMin, xMax, padL, plotW);
      var pyActual = LR.mapY(p.y, yMin, yMax, padT, plotH);
      var pyPred = LR.mapY(pred, yMin, yMax, padT, plotH);
      var errPx = Math.abs(pyActual - pyPred);
      // Square
      ctx.fillStyle = c.error;
      var top = Math.min(pyActual, pyPred);
      ctx.fillRect(px, top, errPx, errPx);
      // Dashed residual line
      ctx.strokeStyle = c.errorStroke;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(px, pyActual); ctx.lineTo(px, pyPred); ctx.stroke();
      ctx.setLineDash([]);
    });

    LR.drawLine(ctx, w, b, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H);
    LR.drawPoints(ctx, LR.data, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H, 6);

    var cost = LR.computeCost(LR.data, w, b);
    costEl.textContent = 'Cost J(w,b) = ' + cost.toFixed(2);
  }

  wSlider.addEventListener('input', draw);
  bSlider.addEventListener('input', draw);
  LR.onThemeChange(draw);
  LR.onDataChange(draw);
  draw();
})();
</script>

<div class="demo-try">
<strong>Try this:</strong> Set <code>w = 0</code>, then tune only <code>b</code> to reduce cost. Next freeze <code>b</code> and tune <code>w</code>. Compare the best cost from each step vs tuning both together.
</div>

Try finding the minimum manually with sliders. It is harder than it looks, because changing $$w$$ affects the best value of $$b$$, and vice versa. This is why we need an **automated optimizer**. First, let us visualize the full cost landscape.

---

## The Cost Landscape

Every pair $$(w, b)$$ gives a different cost $$J(w,b)$$. If we evaluate many pairs, we get a **cost surface**: a 3D landscape where horizontal axes are $$w$$ and $$b$$, and height is cost.

For linear regression with MSE, this surface is **bowl-shaped** (convex). That is useful because it has one global minimum: a single best parameter set.

### Contour Plot View

A **contour plot** is a top-down view of this surface, like a topographic map. Each band represents a cost level. Moving toward lighter center regions means lower cost.

<div class="demo-hint">
<strong>Interactive:</strong> Drag the green dot around the contour plot. The right panel shows the line corresponding to the current (w, b) position. Try dragging the dot toward the lightest region - that is the minimum cost!
</div>

<div class="interactive-demo">
<div class="demo-split">
  <div>
    <canvas id="demo4-contour"></canvas>
    <div class="demo-caption">Cost contour - drag the green dot</div>
  </div>
  <div>
    <canvas id="demo4-line"></canvas>
    <div class="demo-caption">Line for current (w, b)</div>
  </div>
</div>
<div class="demo-info" id="demo4-info">w = 0.15, b = 50, Cost = 0.00</div>
</div>

<script>
(function() {
  var contourCanvas = document.getElementById('demo4-contour');
  var lineCanvas = document.getElementById('demo4-line');
  var infoEl = document.getElementById('demo4-info');
  var CW = 330, CH = 300, LW = 330, LH = 300;
  var padL = 50, padR = 15, padT = 15, padB = 40;
  var wMin = -0.05, wMax = 0.35, bMin = -100, bMax = 300;
  var xMin = 0, xMax = 5000, yMin = 0, yMax = 750;
  var curW = 0.15, curB = 50;
  var dragging = false;
  var gridRes = 80, costGrid = [], maxCost = 0;

  function buildGrid() {
    costGrid = []; maxCost = 0;
    for (var i = 0; i < gridRes; i++) {
      costGrid[i] = [];
      for (var j = 0; j < gridRes; j++) {
        var w = wMin + (wMax - wMin) * i / (gridRes - 1);
        var b = bMin + (bMax - bMin) * j / (gridRes - 1);
        var cost = LR.computeCost(LR.data, w, b);
        costGrid[i][j] = cost;
        if (cost > maxCost) maxCost = cost;
      }
    }
  }

  function drawContour() {
    var ctx = LR.setupCanvas(contourCanvas, CW, CH);
    var c = LR.getColors();
    var plotW = CW - padL - padR, plotH = CH - padT - padB;
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, CW, CH);
    var cellW = plotW / gridRes, cellH = plotH / gridRes;
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    for (var i = 0; i < gridRes; i++) {
      for (var j = 0; j < gridRes; j++) {
        var t = Math.sqrt(costGrid[i][j] / (maxCost || 1));
        var r, g, bl;
        if (dark) { r = Math.round(26 + t * 221); g = Math.round(27 + t * 91); bl = Math.round(38 + t * 104); }
        else { r = Math.round(239 + t * (-19)); g = Math.round(246 + t * (-208)); bl = Math.round(255 + t * (-217)); }
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + bl + ')';
        ctx.fillRect(padL + (i / gridRes) * plotW, padT + plotH - ((j + 1) / gridRes) * plotH, cellW + 1, cellH + 1);
      }
    }
    // Axes
    ctx.fillStyle = c.text; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    for (var i = 0; i <= 4; i++) ctx.fillText((wMin + (wMax - wMin) * i / 4).toFixed(2), padL + plotW * i / 4, padT + plotH + 16);
    ctx.textAlign = 'right';
    for (var j = 0; j <= 4; j++) ctx.fillText(Math.round(bMax - (bMax - bMin) * j / 4).toString(), padL - 5, padT + plotH * j / 4 + 4);
    ctx.textAlign = 'center'; ctx.fillText('weight (w)', padL + plotW / 2, CH - 2);
    ctx.save(); ctx.translate(11, padT + plotH / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('bias (b)', 0, 0); ctx.restore();
    // Dot
    var dotX = padL + (curW - wMin) / (wMax - wMin) * plotW;
    var dotY = padT + plotH - (curB - bMin) / (bMax - bMin) * plotH;
    ctx.beginPath(); ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
    ctx.fillStyle = c.accent; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  }

  function drawLinePlot() {
    var ctx = LR.setupCanvas(lineCanvas, LW, LH);
    var c = LR.getColors();
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, LW, LH);
    LR.drawGrid(ctx, LW, LH, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Area (sq ft)', 'Price ($1000s)');
    LR.drawLine(ctx, curW, curB, xMin, xMax, yMin, yMax, padL, padR, padT, padB, LW, LH);
    LR.drawPoints(ctx, LR.data, xMin, xMax, yMin, yMax, padL, padR, padT, padB, LW, LH, 5);
  }

  function draw() { buildGrid(); drawContour(); drawLinePlot();
    infoEl.textContent = 'w = ' + curW.toFixed(3) + ', b = ' + Math.round(curB) + ', Cost = ' + LR.computeCost(LR.data, curW, curB).toFixed(2);
  }

  function getMP(e, c, w, h) { var r = c.getBoundingClientRect(); return {x: (e.clientX - r.left) * (w / r.width), y: (e.clientY - r.top) * (h / r.height)}; }
  function update(mx, my) {
    var plotW = CW - padL - padR, plotH = CH - padT - padB;
    curW = wMin + Math.max(0, Math.min(1, (mx - padL) / plotW)) * (wMax - wMin);
    curB = bMin + Math.max(0, Math.min(1, (padT + plotH - my) / plotH)) * (bMax - bMin);
    drawContour(); drawLinePlot();
    infoEl.textContent = 'w = ' + curW.toFixed(3) + ', b = ' + Math.round(curB) + ', Cost = ' + LR.computeCost(LR.data, curW, curB).toFixed(2);
  }

  contourCanvas.addEventListener('mousedown', function(e) { dragging = true; update(getMP(e, contourCanvas, CW, CH).x, getMP(e, contourCanvas, CW, CH).y); });
  window.addEventListener('mousemove', function(e) { if (!dragging) return; var p = getMP(e, contourCanvas, CW, CH); update(p.x, p.y); });
  window.addEventListener('mouseup', function() { dragging = false; });
  contourCanvas.addEventListener('touchstart', function(e) { e.preventDefault(); dragging = true; var p = getMP(e.touches[0], contourCanvas, CW, CH); update(p.x, p.y); }, {passive: false});
  contourCanvas.addEventListener('touchmove', function(e) { e.preventDefault(); if (!dragging) return; var p = getMP(e.touches[0], contourCanvas, CW, CH); update(p.x, p.y); }, {passive: false});
  contourCanvas.addEventListener('touchend', function() { dragging = false; });

  LR.onThemeChange(draw);
  LR.onDataChange(draw);
  draw();
})();
</script>

### 3D Surface View

Here is the same cost function visualized as a 3D surface. You can see the bowl shape clearly - there is one lowest point (the global minimum) that represents the optimal parameters.

<div class="interactive-demo">
<canvas id="demo4b-3d"></canvas>
<div class="demo-controls">
  <label>Rotate: <input type="range" id="demo4b-angle" min="0" max="360" step="1" value="35"> <span class="demo-value" id="demo4b-angle-val">35 deg</span></label>
  <label>Tilt: <input type="range" id="demo4b-tilt" min="15" max="75" step="1" value="30"> <span class="demo-value" id="demo4b-tilt-val">30 deg</span></label>
</div>
<div class="demo-caption">3D cost surface J(w, b) - rotate and tilt to explore</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('demo4b-3d');
  var angleSlider = document.getElementById('demo4b-angle');
  var tiltSlider = document.getElementById('demo4b-tilt');
  var angleVal = document.getElementById('demo4b-angle-val');
  var tiltVal = document.getElementById('demo4b-tilt-val');
  var W = 680, H = 420;
  var wMin = -0.05, wMax = 0.35, bMin = -100, bMax = 300;
  var gridN = 40;

  function draw() {
    var angle = parseFloat(angleSlider.value) * Math.PI / 180;
    var tilt = parseFloat(tiltSlider.value) * Math.PI / 180;
    angleVal.textContent = Math.round(parseFloat(angleSlider.value)) + '\u00b0';
    tiltVal.textContent = Math.round(parseFloat(tiltSlider.value)) + '\u00b0';

    var ctx = LR.setupCanvas(canvas, W, H);
    var c = LR.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Build cost grid
    var costs = [], maxC = 0;
    for (var i = 0; i <= gridN; i++) {
      costs[i] = [];
      for (var j = 0; j <= gridN; j++) {
        var w = wMin + (wMax - wMin) * i / gridN;
        var b = bMin + (bMax - bMin) * j / gridN;
        var cost = LR.computeCost(LR.data, w, b);
        costs[i][j] = cost;
        if (cost > maxC) maxC = cost;
      }
    }

    // 3D projection
    var cosA = Math.cos(angle), sinA = Math.sin(angle);
    var cosT = Math.cos(tilt), sinT = Math.sin(tilt);
    var cx = W / 2, cy = H / 2 + 30;
    var scale = 280;

    function project(nx, ny, nz) {
      // nx, ny in [-1,1], nz in [0,1]
      var x3 = nx * cosA - ny * sinA;
      var y3 = nx * sinA + ny * cosA;
      var z3 = nz;
      var yp = y3 * cosT - z3 * sinT;
      var zp = y3 * sinT + z3 * cosT;
      return { x: cx + x3 * scale, y: cy - zp * scale * 0.8 };
    }

    // Collect quads with depth sorting
    var quads = [];
    for (var i = 0; i < gridN; i++) {
      for (var j = 0; j < gridN; j++) {
        var corners = [];
        var depthSum = 0;
        for (var di = 0; di <= 1; di++) {
          for (var dj = 0; dj <= 1; dj++) {
            var ii = i + di, jj = j + dj;
            var nx = (ii / gridN) * 2 - 1;
            var ny = (jj / gridN) * 2 - 1;
            var nz = 1 - Math.sqrt(costs[ii][jj] / (maxC || 1));
            var p = project(nx, ny, nz);
            corners.push(p);
            depthSum += ny * sinA * sinT + nz * cosT;
          }
        }
        var t = Math.sqrt(costs[i][j] / (maxC || 1));
        quads.push({ corners: [corners[0], corners[1], corners[3], corners[2]], depth: depthSum / 4, t: t });
      }
    }

    // Sort back-to-front
    quads.sort(function(a, b) { return a.depth - b.depth; });

    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    quads.forEach(function(q) {
      var t = q.t;
      var r, g, bl;
      if (dark) {
        r = Math.round(30 + (1 - t) * 120 + t * 247);
        g = Math.round(40 + (1 - t) * 160 - t * 40);
        bl = Math.round(60 + (1 - t) * 100 - t * 60);
      } else {
        r = Math.round(50 + (1 - t) * 0 + t * 220);
        g = Math.round(120 + (1 - t) * 140 - t * 80);
        bl = Math.round(220 + (1 - t) * 35 - t * 180);
      }
      ctx.fillStyle = 'rgb(' + Math.min(255, r) + ',' + Math.max(0, Math.min(255, g)) + ',' + Math.max(0, Math.min(255, bl)) + ')';
      ctx.strokeStyle = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(q.corners[0].x, q.corners[0].y);
      for (var k = 1; k < 4; k++) ctx.lineTo(q.corners[k].x, q.corners[k].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Labels
    ctx.fillStyle = c.text; ctx.font = '13px Inter, sans-serif'; ctx.textAlign = 'center';
    var pW = project(1.15, 0, 0); ctx.fillText('w', pW.x, pW.y + 5);
    var pB = project(0, 1.15, 0); ctx.fillText('b', pB.x, pB.y + 5);
    var pC = project(0, 0, 1.1); ctx.fillText('Cost J', pC.x, pC.y - 5);
    ctx.fillStyle = c.textMuted; ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Low cost (minimum)', cx, H - 10);
  }

  angleSlider.addEventListener('input', draw);
  tiltSlider.addEventListener('input', draw);
  LR.onThemeChange(draw);
  LR.onDataChange(draw);
  draw();
})();
</script>

The bowl shape is important. If we keep moving downhill from any start point, we will reach the same minimum. That is exactly what **gradient descent** does.

---

## Gradient Descent

Gradient descent is the **optimization algorithm** that moves parameters toward minimum cost. The same core idea is used in much larger models, including neural networks.

### The Intuition: Lost on a Foggy Mountain

Imagine standing on a mountain in thick fog. You cannot see the whole landscape, but you need to reach the valley floor.

1. **Feel the slope around you** to find the steepest downhill direction
2. **Take a step** in that downhill direction
3. **Repeat** until the ground is flat (you have reached the bottom)

This is exactly how gradient descent works:

1. **Compute gradient** at current $$w, b$$ (direction of steepest increase)
2. **Move opposite to the gradient** (downhill)
3. **Repeat** until improvements become very small

### The Math

The **gradient** is the vector of partial derivatives of the cost function with respect to each parameter. For our two parameters $$w$$ and $$b$$:

$$\frac{\partial J}{\partial w} = \frac{1}{m}\sum_{i=1}^{m}\left(h(x^{(i)}) - y^{(i)}\right) \cdot x^{(i)}$$

$$\frac{\partial J}{\partial b} = \frac{1}{m}\sum_{i=1}^{m}\left(h(x^{(i)}) - y^{(i)}\right)$$

These derivatives tell us local sensitivity:
- **$$\frac{\partial J}{\partial w}$$**: how cost changes if we increase $$w$$ slightly
- **$$\frac{\partial J}{\partial b}$$**: same idea for $$b$$

The **update rules** are:

$$w := w - \alpha \cdot \frac{\partial J}{\partial w}$$

$$b := b - \alpha \cdot \frac{\partial J}{\partial b}$$

The minus sign makes the update move **against** the gradient, which reduces cost. The learning rate $$\alpha$$ sets step size.

### Why the Minus Sign?

If a gradient component is **positive**, subtracting it decreases that parameter. If it is **negative**, subtracting it increases that parameter. One rule handles both directions automatically.

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>Step</strong> for one gradient descent iteration, or <strong>Run</strong> to animate. The green path on the contour plot shows the optimization trajectory. The line on the right converges to the best fit. The chart below shows cost decreasing over iterations.
</div>

<div class="interactive-demo">
<div class="demo-split">
  <div>
    <canvas id="demo5-contour"></canvas>
    <div class="demo-caption">Gradient descent path on contour</div>
  </div>
  <div>
    <canvas id="demo5-line"></canvas>
    <div class="demo-caption">Line evolving toward best fit</div>
  </div>
</div>
<canvas id="demo5-loss" style="width:100%; max-width:680px;"></canvas>
<div class="demo-caption">Cost J(w,b) vs. iteration number</div>
<div class="demo-controls">
  <label>alpha (10^x): <input type="range" id="demo5-lr" min="-10" max="-5" step="0.1" value="-7"> <span class="demo-value" id="demo5-lr-val">1.0e-7</span></label>
  <button id="demo5-step">Step</button>
  <button id="demo5-run">Run</button>
  <button id="demo5-reset">Reset</button>
</div>
<div class="demo-info" id="demo5-info">Iteration: 0 | w = 0.0000, b = 0.0, Cost = -</div>
</div>

<script>
(function() {
  var contourCanvas = document.getElementById('demo5-contour');
  var lineCanvas = document.getElementById('demo5-line');
  var lossCanvas = document.getElementById('demo5-loss');
  var lrSlider = document.getElementById('demo5-lr');
  var lrVal = document.getElementById('demo5-lr-val');
  var infoEl = document.getElementById('demo5-info');
  var stepBtn = document.getElementById('demo5-step');
  var runBtn = document.getElementById('demo5-run');
  var resetBtn = document.getElementById('demo5-reset');

  var CW = 330, CH = 300, LW = 330, LH = 300, LCW = 680, LCH = 150;
  var padL = 50, padR = 15, padT = 15, padB = 40;
  var wMin = -0.05, wMax = 0.35, bMin = -100, bMax = 300;
  var xMin = 0, xMax = 5000, yMin2 = 0, yMax2 = 750;

  var curW, curB, iteration, path, lossHistory, running, animId;
  var gridRes = 80, costGrid = [], maxCost = 0;

  function init() {
    curW = 0; curB = 0; iteration = 0;
    path = [{w: 0, b: 0}];
    lossHistory = [LR.computeCost(LR.data, 0, 0)];
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  function buildGrid() {
    costGrid = []; maxCost = 0;
    for (var i = 0; i < gridRes; i++) {
      costGrid[i] = [];
      for (var j = 0; j < gridRes; j++) {
        var w = wMin + (wMax - wMin) * i / (gridRes - 1);
        var b = bMin + (bMax - bMin) * j / (gridRes - 1);
        var cost = LR.computeCost(LR.data, w, b);
        costGrid[i][j] = cost; if (cost > maxCost) maxCost = cost;
      }
    }
  }

  function getLR() { return Math.pow(10, parseFloat(lrSlider.value)); }

  function step() {
    var lr = getLR();
    var g = LR.computeGradients(LR.data, curW, curB);
    curW -= lr * g.dw; curB -= lr * g.db;
    iteration++;
    path.push({w: curW, b: curB});
    var cost = LR.computeCost(LR.data, curW, curB);
    lossHistory.push(cost);
    // Update shared trained state
    LR.trained.w = curW; LR.trained.b = curB; LR.trained.cost = cost; LR.trained.done = true;
  }

  function drawContour() {
    var ctx = LR.setupCanvas(contourCanvas, CW, CH);
    var c = LR.getColors();
    var plotW = CW - padL - padR, plotH = CH - padT - padB;
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, CW, CH);
    var cellW = plotW / gridRes, cellH = plotH / gridRes;
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    for (var i = 0; i < gridRes; i++) {
      for (var j = 0; j < gridRes; j++) {
        var t = Math.sqrt(costGrid[i][j] / (maxCost || 1));
        var r, g, bl;
        if (dark) { r = Math.round(26 + t * 221); g = Math.round(27 + t * 91); bl = Math.round(38 + t * 104); }
        else { r = Math.round(239 + t * (-19)); g = Math.round(246 + t * (-208)); bl = Math.round(255 + t * (-217)); }
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + bl + ')';
        ctx.fillRect(padL + (i / gridRes) * plotW, padT + plotH - ((j + 1) / gridRes) * plotH, cellW + 1, cellH + 1);
      }
    }
    ctx.fillStyle = c.text; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    for (var i = 0; i <= 4; i++) ctx.fillText((wMin + (wMax - wMin) * i / 4).toFixed(2), padL + plotW * i / 4, padT + plotH + 16);
    ctx.textAlign = 'right';
    for (var j = 0; j <= 4; j++) ctx.fillText(Math.round(bMax - (bMax - bMin) * j / 4).toString(), padL - 5, padT + plotH * j / 4 + 4);
    ctx.textAlign = 'center'; ctx.fillText('w', padL + plotW / 2, CH - 2);
    ctx.save(); ctx.translate(11, padT + plotH / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('b', 0, 0); ctx.restore();

    if (path.length > 1) {
      ctx.strokeStyle = c.path; ctx.lineWidth = 2; ctx.beginPath();
      for (var i = 0; i < path.length; i++) {
        var px = padL + (path[i].w - wMin) / (wMax - wMin) * plotW;
        var py = padT + plotH - (path[i].b - bMin) / (bMax - bMin) * plotH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    var dotX = padL + (curW - wMin) / (wMax - wMin) * plotW;
    var dotY = padT + plotH - (curB - bMin) / (bMax - bMin) * plotH;
    ctx.beginPath(); ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
    ctx.fillStyle = c.accent; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  }

  function drawLinePlot() {
    var ctx = LR.setupCanvas(lineCanvas, LW, LH);
    var c = LR.getColors();
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, LW, LH);
    LR.drawGrid(ctx, LW, LH, padL, padR, padT, padB, xMin, xMax, yMin2, yMax2, 'Area (sq ft)', 'Price ($1000s)');
    LR.drawLine(ctx, curW, curB, xMin, xMax, yMin2, yMax2, padL, padR, padT, padB, LW, LH);
    LR.drawPoints(ctx, LR.data, xMin, xMax, yMin2, yMax2, padL, padR, padT, padB, LW, LH, 5);
  }

  function drawLossPlot() {
    var ctx = LR.setupCanvas(lossCanvas, LCW, LCH);
    var c = LR.getColors();
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, LCW, LCH);
    var lPadL = 65, lPadR = 15, lPadT = 10, lPadB = 30;
    var pw = LCW - lPadL - lPadR, ph = LCH - lPadT - lPadB;
    if (lossHistory.length < 2) {
      ctx.fillStyle = c.textMuted; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Click Step or Run to see convergence curve', LCW / 2, LCH / 2);
      return;
    }
    var maxL = lossHistory[0] || 1;
    var minL = Math.max(0, Math.min.apply(null, lossHistory));
    if (maxL <= minL) maxL = minL + 1;
    ctx.strokeStyle = c.textMuted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lPadL, lPadT + ph); ctx.lineTo(lPadL + pw, lPadT + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lPadL, lPadT); ctx.lineTo(lPadL, lPadT + ph); ctx.stroke();
    ctx.fillStyle = c.textMuted; ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('Iteration', lPadL + pw / 2, LCH - 3);
    ctx.textAlign = 'right'; ctx.fillText(maxL.toFixed(0), lPadL - 4, lPadT + 10); ctx.fillText(minL.toFixed(0), lPadL - 4, lPadT + ph);
    ctx.strokeStyle = c.line; ctx.lineWidth = 2;
    var n = lossHistory.length;
    ctx.beginPath();
    for (var i = 0; i < n; i++) {
      var x = lPadL + (i / (n - 1)) * pw;
      var y = lPadT + ph - ((lossHistory[i] - minL) / (maxL - minL)) * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function drawAll() {
    drawContour(); drawLinePlot(); drawLossPlot();
    var cost = LR.computeCost(LR.data, curW, curB);
    infoEl.textContent = 'Iteration: ' + iteration + ' | w = ' + curW.toFixed(4) + ', b = ' + curB.toFixed(1) + ', Cost = ' + cost.toFixed(2);
  }

  lrSlider.addEventListener('input', function() { lrVal.textContent = getLR().toExponential(1); });

  stepBtn.addEventListener('click', function() { step(); drawAll(); });

  runBtn.addEventListener('click', function() {
    if (running) { running = false; runBtn.textContent = 'Run'; return; }
    running = true; runBtn.textContent = 'Pause';
    function tick() {
      if (!running) return;
      for (var i = 0; i < 5; i++) step();
      drawAll();
      if (iteration < 5000 && running) animId = requestAnimationFrame(tick);
      else { running = false; runBtn.textContent = 'Run'; }
    }
    tick();
  });

  resetBtn.addEventListener('click', function() { init(); buildGrid(); lrVal.textContent = getLR().toExponential(1); drawAll(); });

  LR.onThemeChange(function() { buildGrid(); drawAll(); });
  LR.onDataChange(function() { running = false; if (animId) cancelAnimationFrame(animId); runBtn.textContent = 'Run'; init(); buildGrid(); drawAll(); });
  init(); buildGrid(); lrVal.textContent = getLR().toExponential(1); drawAll();
})();
</script>

<div class="demo-try">
<strong>Try this:</strong> Start with <code>w=0, b=0</code>, click <strong>Step</strong> 10 times, then switch to <strong>Run</strong>. Observe how the path moves quickly first and then takes smaller effective improvements near the minimum.
</div>

After enough iterations, the green dot settles near the bottom of the bowl and the fitted line stabilizes. Cost usually drops quickly early on, then flattens near convergence.

---

## The Learning Rate

The **learning rate** $$\alpha$$ is a crucial **hyperparameter**. You choose it before training. It controls step size in each gradient descent update.

Choosing it well is important:

- **Too small** (for example $$\alpha = 0.000000001$$): steps are tiny, convergence is very slow.

- **Reasonable** (for example $$\alpha = 0.00000005$$): smooth, stable convergence.

- **Too large** (for example $$\alpha = 0.000001$$): updates overshoot, cost oscillates or increases, and training can diverge.

There is no universal best value. In practice, try a few values and watch the cost curve.

A quick rule of thumb:
- If cost explodes or oscillates, decrease $$\alpha$$.
- If cost decreases but very slowly, increase $$\alpha$$.
- Keep the largest value that still gives stable, smooth convergence.

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>Run All</strong> to see three learning rates competing simultaneously. Each chart shows cost vs. iteration. You can edit the learning rate values to experiment.
</div>

<div class="interactive-demo">
<div class="lr-trio">
  <div class="lr-trio-item">
    <div class="lr-label">alpha = <input type="number" id="demo6-lr1" value="0.00000000001" step="any" style="width:120px; font-size:0.75rem; font-family:'JetBrains Mono',monospace; border:1px solid var(--border); border-radius:4px; padding:2px 4px; background:var(--bg-primary); color:var(--text-primary);"></div>
    <canvas id="demo6-c1"></canvas>
    <div class="demo-info" id="demo6-i1">Too slow - Cost:  - </div>
  </div>
  <div class="lr-trio-item">
    <div class="lr-label">alpha = <input type="number" id="demo6-lr2" value="0.0000001" step="any" style="width:120px; font-size:0.75rem; font-family:'JetBrains Mono',monospace; border:1px solid var(--border); border-radius:4px; padding:2px 4px; background:var(--bg-primary); color:var(--text-primary);"></div>
    <canvas id="demo6-c2"></canvas>
    <div class="demo-info" id="demo6-i2">Just right - Cost:  - </div>
  </div>
  <div class="lr-trio-item">
    <div class="lr-label">alpha = <input type="number" id="demo6-lr3" value="0.0000005" step="any" style="width:120px; font-size:0.75rem; font-family:'JetBrains Mono',monospace; border:1px solid var(--border); border-radius:4px; padding:2px 4px; background:var(--bg-primary); color:var(--text-primary);"></div>
    <canvas id="demo6-c3"></canvas>
    <div class="demo-info" id="demo6-i3">Too fast - Cost:  - </div>
  </div>
</div>
<div class="demo-controls" style="justify-content:center;">
  <button id="demo6-run">Run All</button>
  <button id="demo6-reset">Reset</button>
</div>
</div>

<script>
(function() {
  var canvases = [document.getElementById('demo6-c1'), document.getElementById('demo6-c2'), document.getElementById('demo6-c3')];
  var infos = [document.getElementById('demo6-i1'), document.getElementById('demo6-i2'), document.getElementById('demo6-i3')];
  var lrInputs = [document.getElementById('demo6-lr1'), document.getElementById('demo6-lr2'), document.getElementById('demo6-lr3')];
  var labels = ['Too slow', 'Just right', 'Too fast'];
  var runBtn = document.getElementById('demo6-run');
  var resetBtn = document.getElementById('demo6-reset');
  var W = 210, H = 160;
  var padL = 40, padR = 10, padT = 10, padB = 25;
  var states = [], running = false, animId;

  function initStates() {
    states = [];
    for (var k = 0; k < 3; k++) states.push({w: 0, b: 0, iter: 0, losses: [LR.computeCost(LR.data, 0, 0)]});
  }

  function drawOne(idx) {
    var st = states[idx]; var ctx = LR.setupCanvas(canvases[idx], W, H);
    var c = LR.getColors(); var pw = W - padL - padR, ph = H - padT - padB;
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = c.textMuted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padL, padT + ph); ctx.lineTo(padL + pw, padT + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + ph); ctx.stroke();
    if (st.losses.length < 2) {
      ctx.fillStyle = c.textMuted; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Waiting...', W / 2, H / 2);
      infos[idx].textContent = labels[idx] + ' - Cost: -';
      return;
    }
    var maxL = st.losses[0] || 1;
    var displayMax = Math.min(maxL * 2, Math.max.apply(null, st.losses));
    if (displayMax <= 0) displayMax = 1;
    var n = st.losses.length;
    ctx.strokeStyle = c.line; ctx.lineWidth = 1.5; ctx.beginPath();
    for (var i = 0; i < n; i++) {
      var x = padL + (i / Math.max(n - 1, 1)) * pw;
      var val = Math.min(st.losses[i], displayMax);
      var y = padT + ph - (val / displayMax) * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = c.textMuted; ctx.font = '9px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('iter: ' + st.iter, padL + 2, padT + 10);
    var lastCost = st.losses[st.losses.length - 1];
    infos[idx].textContent = labels[idx] + ' - Cost: ' + (lastCost > 1e8 || isNaN(lastCost) ? 'DIVERGED!' : lastCost.toFixed(1));
  }

  function drawAll() { for (var k = 0; k < 3; k++) drawOne(k); }

  function stepAll() {
    for (var k = 0; k < 3; k++) {
      var lr = parseFloat(lrInputs[k].value) || 0;
      var st = states[k];
      if (st.losses[st.losses.length - 1] > 1e10 || isNaN(st.losses[st.losses.length - 1])) continue;
      var g = LR.computeGradients(LR.data, st.w, st.b);
      st.w -= lr * g.dw; st.b -= lr * g.db; st.iter++;
      var cost = LR.computeCost(LR.data, st.w, st.b);
      st.losses.push(isNaN(cost) ? Infinity : cost);
    }
  }

  runBtn.addEventListener('click', function() {
    if (running) { running = false; runBtn.textContent = 'Run All'; return; }
    running = true; runBtn.textContent = 'Pause';
    function tick() {
      if (!running) return;
      for (var i = 0; i < 5; i++) stepAll();
      drawAll();
      if (states[0].iter < 3000 && running) animId = requestAnimationFrame(tick);
      else { running = false; runBtn.textContent = 'Run All'; }
    }
    tick();
  });

  resetBtn.addEventListener('click', function() { running = false; if (animId) cancelAnimationFrame(animId); runBtn.textContent = 'Run All'; initStates(); drawAll(); });

  LR.onThemeChange(drawAll);
  LR.onDataChange(function() { running = false; if (animId) cancelAnimationFrame(animId); runBtn.textContent = 'Run All'; initStates(); drawAll(); });
  initStates(); drawAll();
})();
</script>

<div class="demo-try">
<strong>Try this:</strong> Keep the same dataset and compare final cost after 1000+ iterations for the three alpha values. Then increase noise in the dataset (top demo) and repeat to see sensitivity.
</div>

---

## Implementing from Scratch

Let us put the complete algorithm together step by step:

**Algorithm A: Single-Feature (Univariate) Linear Regression**

1. **Initialize** $$w = 0$$ and $$b = 0$$ (starting point)
2. **Choose** a learning rate $$\alpha$$ and number of iterations
3. **For each iteration**, repeat:
   - Compute predictions: $$\hat{y}^{(i)} = w \cdot x^{(i)} + b$$ for all data points
   - Compute gradients:
     - $$\frac{\partial J}{\partial w} = \frac{1}{m}\sum_{i=1}^{m}(\hat{y}^{(i)} - y^{(i)}) \cdot x^{(i)}$$
     - $$\frac{\partial J}{\partial b} = \frac{1}{m}\sum_{i=1}^{m}(\hat{y}^{(i)} - y^{(i)})$$
   - Update parameters:
     - $$w := w - \alpha \cdot \frac{\partial J}{\partial w}$$
     - $$b := b - \alpha \cdot \frac{\partial J}{\partial b}$$

```python
def linear_regression_univariate(X, y, lr=1e-7, iterations=5000):
    w, b = 0.0, 0.0
    m = len(X)

    for _ in range(iterations):
        y_pred = [w * x + b for x in X]
        dw = sum((y_pred[i] - y[i]) * X[i] for i in range(m)) / m
        db = sum((y_pred[i] - y[i]) for i in range(m)) / m
        w -= lr * dw
        b -= lr * db

    cost = sum((w * X[i] + b - y[i])**2 for i in range(m)) / (2 * m)
    return w, b, cost
```

In this simplified code, we train directly on raw area values, so a very small learning rate is used. In practice, feature scaling usually lets you train with larger and more stable learning rates.

**Walk through this code step by step** and watch each line update live values and the fitted line:

<style>
.cw-wrap{display:grid;grid-template-columns:1fr;gap:0.75rem}
.cw-top{display:grid;grid-template-columns:210px 1fr;gap:0.75rem;align-items:start}
@media(max-width:640px){.cw-top{grid-template-columns:1fr}}
.cw-code{font-family:'JetBrains Mono',monospace;font-size:0.7rem;line-height:1.6;padding:0.5rem 0;border-radius:8px;background:var(--bg-primary);border:1px solid var(--border);overflow-x:auto;min-height:280px}
.cw-line{white-space:pre;padding:1px 0.5rem}
.cw-line.cw-hl{background:rgba(37,99,235,0.15);border-left:3px solid #2563eb;padding-left:calc(0.5rem - 3px)}
.cw-ln{display:inline-block;width:1.6em;color:var(--text-secondary);text-align:right;margin-right:0.5em;user-select:none;opacity:0.5}
.cw-bottom{display:grid;grid-template-columns:1fr 210px;gap:0.75rem;height:160px}
@media(max-width:640px){.cw-bottom{grid-template-columns:1fr}}
.cw-exp{padding:0.6rem 0.75rem;border-radius:8px;background:var(--bg-primary);border-left:3px solid var(--accent);font-size:0.82rem;line-height:1.55;overflow-y:auto}
.cw-exp b{color:var(--accent)}
.cw-exp code{font-size:0.78rem;background:var(--bg-secondary);padding:1px 4px;border-radius:3px}
.cw-vars{font-family:'JetBrains Mono',monospace;font-size:0.72rem;padding:0.5rem 0.6rem;border-radius:8px;background:var(--bg-primary);border:1px solid var(--border);white-space:pre-wrap;line-height:1.5;overflow-y:auto}
.cw-title{font-weight:600;font-size:0.95rem;margin-bottom:0.5rem}
.cw-step-bar{display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem}
.cw-step-bar .cw-title{margin-bottom:0;flex:1}
.cw-step-dots{display:flex;gap:4px}
.cw-step-dot{width:8px;height:8px;border-radius:50%;background:var(--border);cursor:pointer;transition:background 0.2s}
.cw-step-dot.active{background:var(--accent)}
.cw-step-dot:hover{background:var(--accent-hover,var(--accent))}
</style>

<div class="interactive-demo">
<div class="cw-step-bar">
  <div class="cw-title" id="cw-title"></div>
  <div class="cw-step-dots" id="cw-dots"></div>
</div>
<div class="cw-wrap">
  <div class="cw-top">
    <canvas id="cw-canvas"></canvas>
    <div class="cw-code" id="cw-code"></div>
  </div>
  <div class="cw-bottom">
    <div class="cw-exp" id="cw-exp"></div>
    <div class="cw-vars" id="cw-vars"></div>
  </div>
</div>
<div class="demo-controls">
  <button id="cw-first">&#8634; Reset</button>
  <button id="cw-prev">&#8592; Prev</button>
  <button id="cw-next">Next &#8594;</button>
  <button id="cw-play">&#9654; Auto-Play</button>
</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('cw-canvas');
  var codeEl = document.getElementById('cw-code');
  var expEl = document.getElementById('cw-exp');
  var varsEl = document.getElementById('cw-vars');
  var titleEl = document.getElementById('cw-title');
  var dotsEl = document.getElementById('cw-dots');
  var prevBtn = document.getElementById('cw-prev');
  var nextBtn = document.getElementById('cw-next');
  var playBtn = document.getElementById('cw-play');
  var firstBtn = document.getElementById('cw-first');

  var CW = 240, CH = 170;
  var padL = 40, padR = 10, padT = 14, padB = 28;
  var xMin = 0, xMax = 4000, yMin = 0, yMax = 700;

  // Sample data (5 points from the default dataset)
  var X = [800, 1400, 2000, 2600, 3300];
  var Y = [160, 240, 350, 430, 540];
  var m = 5, lr = 1e-7, iters = 5000;

  var LINES = [
    'def linear_regression_univariate(X, y, lr=1e-7, iterations=5000):',
    '    w, b = 0.0, 0.0',
    '    m = len(X)',
    '',
    '    for _ in range(iterations):',
    '        y_pred = [w * x + b for x in X]',
    '        dw = sum((y_pred[i] - y[i]) * X[i] for i in range(m)) / m',
    '        db = sum((y_pred[i] - y[i]) for i in range(m)) / m',
    '        w -= lr * dw',
    '        b -= lr * db',
    '',
    '    cost = sum((w * X[i] + b - y[i])**2 for i in range(m)) / (2 * m)',
    '    return w, b, cost'
  ];

  // Run gradient descent, capture snapshots at key iterations
  function runGD() {
    var w = 0, b = 0, snaps = [{w:0, b:0, i:0}];
    for (var t = 0; t < iters; t++) {
      var dw = 0, db = 0, yp = [];
      for (var j = 0; j < m; j++) yp.push(w * X[j] + b);
      for (var j = 0; j < m; j++) { dw += (yp[j] - Y[j]) * X[j]; db += (yp[j] - Y[j]); }
      dw /= m; db /= m;
      w -= lr * dw; b -= lr * db;
      if (t === 0) snaps.push({w:w, b:b, dw:dw, db:db, yp:yp.slice(), i:1});
      if (t === 1) snaps.push({w:w, b:b, yp:yp.slice(), i:2});
      if (t === 9) snaps.push({w:w, b:b, i:10});
      if (t === iters - 1) snaps.push({w:w, b:b, i:iters});
    }
    return snaps;
  }
  var S = runGD();

  function J(w, b) {
    var s = 0;
    for (var i = 0; i < m; i++) { var e = w * X[i] + b - Y[i]; s += e * e; }
    return s / (2 * m);
  }
  function f(v, d) { return v.toFixed(d !== undefined ? d : 6); }

  // Define walkthrough steps
  var steps = [
    { hl:[0], title:'Function Inputs',
      exp:'<b>Input:</b> X = [800, 1400, 2000, 2600, 3300] - house areas (sq ft)<br><b>Input:</b> y = [160, 240, 350, 430, 540] - prices ($1000s)<br>lr = 0.0000001, iterations = 5000<br><br>The function receives training data and hyperparameters. It will learn the best-fit line.',
      vars:'X = [800, 1400, 2000, 2600, 3300]\ny = [160, 240, 350, 430, 540]\nlr = 1e-7\niterations = 5000',
      st:S[0] },

    { hl:[1], title:'Initialize Parameters',
      exp:'<b>w = 0.0, b = 0.0</b> - Start with a flat line at y = 0.<br><br>All predictions will be zero. This is intentionally wrong - gradient descent will iteratively adjust w and b to fit the data.',
      vars:'w = 0.0  (weight / slope)\nb = 0.0  (bias / intercept)\n\nLine: y = 0\u00b7x + 0',
      st:S[0] },

    { hl:[2], title:'Count Training Examples',
      exp:'<b>m = len(X) = 5</b><br><br>We have 5 data points. Dividing gradients by m gives us the <i>average</i> gradient, so step size does not depend on dataset size.',
      vars:'m = len(X) = 5',
      st:S[0] },

    { hl:[4], title:'Start Loop - Iteration 1 of 5000',
      exp:'The gradient descent loop begins. Each iteration:<br>\u2460 Predict \u2192 \u2461 Compute gradients \u2192 \u2462 Update parameters<br><br>We repeat this 5000 times. Let\u2019s trace iteration 1 in detail.',
      vars:'iteration = 1 of 5000\nw = 0.000000\nb = 0.000000',
      st:S[0] },

    { hl:[5], title:'Compute Predictions (Iter 1)',
      exp:'<b>y_pred = [w\u00b7x + b for x in X]</b><br><br>With w=0, b=0: every prediction is <b>0</b>.<br><code>y_pred = [0, 0, 0, 0, 0]</code><br>actual y = [160, 240, 350, 430, 540]<br><br>Every prediction is completely wrong - the errors are huge.',
      vars:'y_pred = [0, 0, 0, 0, 0]\ny      = [160, 240, 350, 430, 540]\nerrors = [-160, -240, -350, -430, -540]',
      st:S[0] },

    { hl:[6], title:'Compute Weight Gradient dw (Iter 1)',
      exp:'<b>dw = \u03a3(pred - actual) \u00d7 x / m</b><br><br>Each term: (pred - actual) \u00d7 area<br><code>(-160)\u00d7800 + (-240)\u00d71400 + (-350)\u00d72000 + (-430)\u00d72600 + (-540)\u00d73300</code><br><code>= -4,064,000</code><br><code>dw = -4,064,000 / 5 = <b>-812,800</b></code><br><br>Negative dw means: "increase w to reduce cost."',
      vars:'dw = ' + f(S[1].dw, 1) + '\n\nNegative \u2192 w should increase',
      st:S[0] },

    { hl:[7], title:'Compute Bias Gradient db (Iter 1)',
      exp:'<b>db = \u03a3(pred - actual) / m</b><br><br><code>(-160 + -240 + -350 + -430 + -540) / 5</code><br><code>= -1720 / 5 = <b>-344.0</b></code><br><br>Negative db means: "increase b (shift line up)."',
      vars:'dw = ' + f(S[1].dw, 1) + '\ndb = ' + f(S[1].db, 1) + '\n\nBoth negative \u2192 increase w and b',
      st:S[0] },

    { hl:[8], title:'Update Weight w (Iter 1)',
      exp:'<b>w -= lr \u00d7 dw</b><br><br><code>w = 0 \u2212 (1e-7) \u00d7 (\u2212812,800)</code><br><code>w = 0 + 0.08128 = <b>' + f(S[1].w) + '</b></code><br><br>The tiny learning rate (1e-7) scales the large gradient to a small step. The line now has a positive slope!',
      vars:'w = 0 - 1e-7 \u00d7 ' + f(S[1].dw, 1) + '\nw = ' + f(S[1].w) + '\nb = 0.000000 (not yet updated)',
      st:{w:S[1].w, b:0} },

    { hl:[9], title:'Update Bias b (Iter 1)',
      exp:'<b>b -= lr \u00d7 db</b><br><br><code>b = 0 \u2212 (1e-7) \u00d7 (\u2212344.0)</code><br><code>b = <b>' + f(S[1].b) + '</b></code><br><br>Iteration 1 done! Line moved from y=0 to y=' + f(S[1].w) + 'x + ' + f(S[1].b, 4) + '. Still far from ideal, but learning!',
      vars:'w = ' + f(S[1].w) + '\nb = ' + f(S[1].b) + '\ncost = ' + f(J(S[1].w, S[1].b), 2),
      st:S[1] },

    { hl:[5,6,7,8,9], title:'Iteration 2 Complete',
      exp:'The loop repeats with updated w, b. Predictions are now closer:<br><code>y_pred \u2248 [' + S[2].yp.map(function(v){ return v.toFixed(0); }).join(', ') + ']</code><br>actual = [160, 240, 350, 430, 540]<br><br>Errors are smaller \u2192 gradients smaller \u2192 smaller updates. The model is converging.',
      vars:'Iter 2:\nw = ' + f(S[2].w) + '\nb = ' + f(S[2].b) + '\ncost = ' + f(J(S[2].w, S[2].b), 2),
      st:S[2] },

    { hl:[5,6,7,8,9], title:'Iteration 10 - Progress',
      exp:'After 10 iterations, the line is visibly bending toward the data. Cost has dropped significantly from its initial value.<br><br>Each iteration makes the gradients smaller - the model is finding the sweet spot.',
      vars:'Iter 10:\nw = ' + f(S[3].w) + '\nb = ' + f(S[3].b) + '\ncost = ' + f(J(S[3].w, S[3].b), 2),
      st:S[3] },

    { hl:[4], title:'Loop Complete - After 5000 Iterations',
      exp:'Gradient descent has converged. The weight and bias have stabilized - further iterations would barely change them.<br><br>The line now fits the data well!',
      vars:'Iter 5000 \u2713\nw = ' + f(S[4].w) + '\nb = ' + f(S[4].b, 2) + '\ncost = ' + f(J(S[4].w, S[4].b), 2),
      st:S[4] },

    { hl:[11], title:'Compute Final Cost',
      exp:'<b>cost = \u03a3(w\u00b7X[i] + b \u2212 y[i])\u00b2 / (2m)</b><br><br>The Mean Squared Error tells us how well the line fits. Lower cost = better fit.<br><b>cost = ' + f(J(S[4].w, S[4].b), 2) + '</b>',
      vars:'cost = ' + f(J(S[4].w, S[4].b), 2) + '\n\n(sum of squared errors / 2m)',
      st:S[4] },

    { hl:[12], title:'Return Results',
      exp:'<b>return w, b, cost</b><br><br>The trained model:<br>\u2022 <b>w = ' + f(S[4].w) + '</b> (\u2248$' + f(S[4].w * 1000, 0) + ' per sq ft)<br>\u2022 <b>b = ' + f(S[4].b, 2) + '</b> (base price)<br>\u2022 <b>cost = ' + f(J(S[4].w, S[4].b), 2) + '</b><br><br><b>Prediction formula:</b> price = ' + f(S[4].w, 4) + ' \u00d7 area + ' + f(S[4].b, 1),
      vars:'OUTPUT:\nw = ' + f(S[4].w) + '\nb = ' + f(S[4].b, 2) + '\ncost = ' + f(J(S[4].w, S[4].b), 2) + '\n\ny = ' + f(S[4].w, 4) + '\u00b7x + ' + f(S[4].b, 1),
      st:S[4] }
  ];

  var cur = 0, autoTimer = null;

  // Build step dots
  function buildDots(total) {
    dotsEl.innerHTML = '';
    for (var i = 0; i < total; i++) {
      var dot = document.createElement('span');
      dot.className = 'cw-step-dot';
      dot.dataset.idx = i;
      dot.title = 'Step ' + (i + 1);
      dot.addEventListener('click', function() {
        cur = parseInt(this.dataset.idx);
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null; playBtn.innerHTML = '&#9654; Auto-Play'; }
        render();
      });
      dotsEl.appendChild(dot);
    }
  }

  function updateDots() {
    var dots = dotsEl.querySelectorAll('.cw-step-dot');
    for (var i = 0; i < dots.length; i++) {
      dots[i].className = 'cw-step-dot' + (i === cur ? ' active' : '');
    }
  }

  function drawPlot(st) {
    var ctx = LR.setupCanvas(canvas, CW, CH);
    var c = LR.getColors();
    var plotW = CW - padL - padR, plotH = CH - padT - padB;
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, CW, CH);
    // Grid
    ctx.strokeStyle = c.grid; ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var gx = padL + plotW / 4 * i;
      ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, padT + plotH); ctx.stroke();
      var gy = padT + plotH / 4 * i;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + plotW, gy); ctx.stroke();
    }
    ctx.strokeStyle = c.textMuted; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.stroke();
    // Axis labels
    ctx.fillStyle = c.textMuted; ctx.font = '9px Inter, sans-serif'; ctx.textAlign = 'center';
    for (var i = 0; i <= 4; i++) ctx.fillText(Math.round(xMin + (xMax - xMin) / 4 * i), padL + plotW / 4 * i, padT + plotH + 12);
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) ctx.fillText(Math.round(yMax - (yMax - yMin) / 4 * i), padL - 4, padT + plotH / 4 * i + 3);
    // Regression line
    if (st.w !== 0 || st.b !== 0) {
      var lx1 = xMin, ly1 = st.w * lx1 + st.b;
      var lx2 = xMax, ly2 = st.w * lx2 + st.b;
      ctx.strokeStyle = c.line; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(LR.mapX(lx1, xMin, xMax, padL, plotW), LR.mapY(ly1, yMin, yMax, padT, plotH));
      ctx.lineTo(LR.mapX(lx2, xMin, xMax, padL, plotW), LR.mapY(ly2, yMin, yMax, padT, plotH));
      ctx.stroke();
      ctx.fillStyle = c.line; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'left';
      ctx.fillText('y=' + st.w.toFixed(3) + 'x+' + st.b.toFixed(1), padL + 3, padT + 11);
    } else {
      ctx.fillStyle = c.textMuted; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'left';
      ctx.fillText('y = 0 (flat)', padL + 3, padT + 11);
    }
    // Data points
    for (var i = 0; i < m; i++) {
      var cx = LR.mapX(X[i], xMin, xMax, padL, plotW);
      var cy = LR.mapY(Y[i], yMin, yMax, padT, plotH);
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = c.point; ctx.fill();
      ctx.strokeStyle = c.pointStroke; ctx.lineWidth = 1; ctx.stroke();
    }
  }

  function renderCode(hlLines) {
    var html = '';
    for (var i = 0; i < LINES.length; i++) {
      var isHl = hlLines.indexOf(i) >= 0;
      var cls = isHl ? ' cw-hl' : '';
      var ln = '<span class="cw-ln">' + (i + 1) + '</span>';
      var txt = LINES[i].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      html += '<div class="cw-line' + cls + '">' + ln + txt + '</div>';
    }
    codeEl.innerHTML = html;
  }

  function render() {
    var s = steps[cur];
    titleEl.textContent = 'Step ' + (cur + 1) + ' / ' + steps.length + ': ' + s.title;
    renderCode(s.hl);
    expEl.innerHTML = s.exp;
    varsEl.textContent = s.vars;
    drawPlot(s.st);
    prevBtn.disabled = cur === 0;
    firstBtn.disabled = cur === 0;
    nextBtn.disabled = cur === steps.length - 1;
    updateDots();
  }

  firstBtn.addEventListener('click', function() { cur = 0; if (autoTimer) { clearInterval(autoTimer); autoTimer = null; playBtn.innerHTML = '&#9654; Auto-Play'; } render(); });
  prevBtn.addEventListener('click', function() { if (cur > 0) { cur--; render(); } });
  nextBtn.addEventListener('click', function() { if (cur < steps.length - 1) { cur++; render(); } });
  playBtn.addEventListener('click', function() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; playBtn.innerHTML = '&#9654; Auto-Play'; return; }
    if (cur >= steps.length - 1) cur = 0;
    playBtn.innerHTML = '&#9646;&#9646; Pause';
    autoTimer = setInterval(function() {
      if (cur < steps.length - 1) { cur++; render(); }
      else { clearInterval(autoTimer); autoTimer = null; playBtn.innerHTML = '&#9654; Auto-Play'; }
    }, 3000);
  });

  buildDots(steps.length);
  LR.onThemeChange(render);
  render();
})();
</script>

<div class="demo-hint">
<strong>Interactive:</strong> Edit the parameters below and click <strong>Run</strong>. The output shows training progress and the final best-fit line. The trained parameters are saved - the Prediction section below will automatically use them.
</div>

<div class="interactive-demo">
<textarea class="code-runner-area" id="demo7-code">// Edit these values and click Run
var learning_rate = 0.0000001;
var iterations = 5000;
var w = 0, b = 0;

// Runs gradient descent on your dataset</textarea>
<div class="demo-controls">
  <button id="demo7-run">Run</button>
</div>
<div class="code-runner-output" id="demo7-output">Click "Run" to train the model...</div>
<canvas id="demo7-canvas"></canvas>
</div>

<script>
(function() {
  var codeArea = document.getElementById('demo7-code');
  var output = document.getElementById('demo7-output');
  var canvas = document.getElementById('demo7-canvas');
  var runBtn = document.getElementById('demo7-run');
  var W = 680, H = 320;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = 0, xMax = 5000, yMin = 0, yMax = 750;

  function run() {
    var code = codeArea.value;
    var lr, iters, w0, b0;
    try {
      var lrM = code.match(/learning_rate\s*=\s*([\d.eE\-+]+)/);
      var itM = code.match(/iterations\s*=\s*(\d+)/);
      var wM = code.match(/var\s+w\s*=\s*([\d.eE\-+]+)/);
      var bM = code.match(/var\s+b\s*=\s*([\d.eE\-+]+)/);
      lr = lrM ? parseFloat(lrM[1]) : 0.0000001;
      iters = itM ? parseInt(itM[1]) : 5000;
      w0 = wM ? parseFloat(wM[1]) : 0;
      b0 = bM ? parseFloat(bM[1]) : 0;
    } catch(e) { lr = 0.0000001; iters = 5000; w0 = 0; b0 = 0; }

    var w = w0, b = b0, m = LR.data.length;
    var log = 'Training on ' + m + ' data points...\n';
    log += 'Learning rate: ' + lr + ' | Iterations: ' + iters + '\n\n';

    for (var i = 0; i < iters; i++) {
      var g = LR.computeGradients(LR.data, w, b);
      w -= lr * g.dw; b -= lr * g.db;
      if (i < 3 || i === iters - 1 || (i + 1) % Math.round(iters / 6) === 0) {
        log += 'Iter ' + String(i + 1).padStart(5) + ':  w=' + w.toFixed(6) + '  b=' + b.toFixed(2).padStart(7) + '  cost=' + LR.computeCost(LR.data, w, b).toFixed(2) + '\n';
      }
    }

    var finalCost = LR.computeCost(LR.data, w, b);
    log += '\n--- Training Complete ---\n';
    log += 'Final w = ' + w.toFixed(6) + '\n';
    log += 'Final b = ' + b.toFixed(2) + '\n';
    log += 'Final Cost = ' + finalCost.toFixed(4) + '\n';
    log += 'Equation: price = ' + w.toFixed(5) + ' \u00d7 area + ' + b.toFixed(2);
    output.textContent = log;

    // Save to shared state
    LR.trained.w = w; LR.trained.b = b; LR.trained.cost = finalCost; LR.trained.done = true;
    drawResult(w, b);
  }

  function drawResult(tw, tb) {
    var ctx = LR.setupCanvas(canvas, W, H);
    var c = LR.getColors();
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
    LR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Area (sq ft)', 'Price ($1000s)');
    LR.drawLine(ctx, tw, tb, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H);
    LR.drawPoints(ctx, LR.data, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H, 6);
    ctx.fillStyle = c.accent; ctx.font = 'bold 13px JetBrains Mono, monospace'; ctx.textAlign = 'left';
    ctx.fillText('y = ' + tw.toFixed(4) + 'x + ' + tb.toFixed(1), padL + 10, padT + 20);
  }

  runBtn.addEventListener('click', run);
  LR.onThemeChange(function() { if (LR.trained.done) drawResult(LR.trained.w, LR.trained.b); });
  LR.onDataChange(function() { output.textContent = 'Dataset changed - click "Run" to retrain.'; var ctx = LR.setupCanvas(canvas, W, H); ctx.fillStyle = LR.getColors().bg; ctx.fillRect(0, 0, W, H); });
})();
</script>

## Making Predictions

Once we have trained the model and found $$w$$ and $$b$$, prediction is direct substitution into the hypothesis:

$$\hat{y}_{new} = w_{trained} \cdot x_{new} + b_{trained}$$

For example, if training gives $$w = 0.151$$ and $$b = 42.2$$, then for a 2800 sq ft house:

$$\hat{y} = 0.151 \times 2800 + 42.2 = 465.0$$

So the predicted price is approximately **$465,000**.

This value is in thousands of dollars, so `465.0` means about **$465,000**. The model did not use hand-written pricing rules. It learned a pattern from data.

One important caveat: predictions are usually more reliable **within** the training range than far outside it. Predicting a 12,000 sq ft house from data mostly between 800 and 3,800 sq ft is extrapolation, and can be inaccurate.

<div class="demo-hint">
<strong>Interactive:</strong> This demo uses the trained parameters from the gradient descent above. If you have not trained yet, click <strong>Auto-Train</strong>. Then enter any house area and click <strong>Predict</strong> to see the result on the plot.
</div>

<div class="interactive-demo">
<canvas id="demo8-canvas"></canvas>
<div class="demo-controls">
  <button id="demo8-train">Auto-Train</button>
  <label>Area (sq ft): <input type="number" class="predict-input" id="demo8-input" placeholder="e.g. 2800" value="2800"></label>
  <button id="demo8-predict">Predict</button>
</div>
<div class="demo-info" id="demo8-info">Enter an area and click Predict (or Auto-Train first if needed)</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('demo8-canvas');
  var trainBtn = document.getElementById('demo8-train');
  var predictBtn = document.getElementById('demo8-predict');
  var areaInput = document.getElementById('demo8-input');
  var infoEl = document.getElementById('demo8-info');
  var W = 680, H = 400;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = 0, xMax = 5000, yMin = 0, yMax = 750;
  var predX = null, predY = null;

  function ensureTrained() {
    if (!LR.trained.done) {
      LR.train();
    }
  }

  function draw() {
    var ctx = LR.setupCanvas(canvas, W, H);
    var c = LR.getColors();
    var plotW = W - padL - padR, plotH = H - padT - padB;
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
    LR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Area (sq ft)', 'Price ($1000s)');

    if (LR.trained.done) {
      LR.drawLine(ctx, LR.trained.w, LR.trained.b, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H);
      ctx.fillStyle = c.accent; ctx.font = 'bold 12px JetBrains Mono, monospace'; ctx.textAlign = 'left';
      ctx.fillText('y = ' + LR.trained.w.toFixed(4) + 'x + ' + LR.trained.b.toFixed(1), padL + 10, padT + 18);
    }

    LR.drawPoints(ctx, LR.data, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H, 6);

    if (predX !== null && predY !== null && LR.trained.done) {
      var px = LR.mapX(predX, xMin, xMax, padL, plotW);
      var py = LR.mapY(predY, yMin, yMax, padT, plotH);
      // Dashed lines
      ctx.strokeStyle = c.accent; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(px, padT + plotH); ctx.lineTo(px, py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(padL, py); ctx.stroke();
      ctx.setLineDash([]);
      // Point
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = c.accent; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      // Label
      ctx.fillStyle = c.text; ctx.font = 'bold 13px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('$' + Math.round(predY) + 'k', px + 12, py - 10);
      ctx.fillStyle = c.textMuted; ctx.font = '11px Inter, sans-serif';
      ctx.fillText(Math.round(predX) + ' sq ft', px + 12, py + 5);
    }
  }

  trainBtn.addEventListener('click', function() {
    LR.train();
    predX = null; predY = null;
    infoEl.textContent = 'Trained! w = ' + LR.trained.w.toFixed(5) + ', b = ' + LR.trained.b.toFixed(2) + ', Cost = ' + LR.trained.cost.toFixed(2) + ' - Now enter an area and click Predict';
    draw();
  });

  predictBtn.addEventListener('click', function() {
    ensureTrained();
    var area = parseFloat(areaInput.value);
    if (isNaN(area) || area <= 0) { infoEl.textContent = 'Please enter a valid area value (e.g. 2800)'; return; }
    predX = area;
    predY = LR.trained.w * area + LR.trained.b;
    infoEl.textContent = 'A ' + Math.round(area) + ' sq ft house \u2248 $' + Math.round(predY) + 'k  (using y = ' + LR.trained.w.toFixed(4) + ' \u00d7 ' + Math.round(area) + ' + ' + LR.trained.b.toFixed(1) + ')';
    draw();
  });

  LR.onThemeChange(draw);
  LR.onDataChange(function() { predX = null; predY = null; infoEl.textContent = 'Dataset changed - click Auto-Train then Predict.'; draw(); });
  draw();
})();
</script>

---

## Summary

Here is everything we covered, building linear regression completely from the ground up:

| Concept | What it does | Formula |
|---|---|---|
| **Hypothesis function** | Predicts output from input | $$h(x) = wx + b$$ |
| **Cost function (MSE)** | Measures prediction error | $$J = \frac{1}{2m}\sum(h(x^{(i)}) - y^{(i)})^2$$ |
| **Gradient** | Direction of steepest ascent | $$\frac{\partial J}{\partial w}, \frac{\partial J}{\partial b}$$ |
| **Gradient descent** | Updates parameters to reduce cost | $$w := w - \alpha \frac{\partial J}{\partial w}$$ |
| **Learning rate** ($$\alpha$$) | Controls step size | Hyperparameter (you choose) |
| **Prediction** | Uses trained model on new data | $$\hat{y} = w_{trained} \cdot x + b_{trained}$$ |

These same ideas appear again in larger models: define a differentiable objective, compute gradients, and iteratively optimize parameters.

#### Continue the ML Series

This post is part of my **Machine Learning from Scratch** series. If you want to continue in order:

- **Series overview**: [Machine Learning from Scratch: Interactive Guide]({{ site.baseurl }}/machine-learning-from-scratch-interactive-guide/)
- **Linear Regression Part 2 (multiple features)**: [Linear Regression from Scratch II: Multivariate Extension]({{ site.baseurl }}/linear-regression-multivariate-extension/)
- **Then next**: [Polynomial Regression: Bias Variance Interactive]({{ site.baseurl }}/polynomial-regression-bias-variance-interactive/)
- **After that**: [Logistic Regression from Scratch: Interactive]({{ site.baseurl }}/logistic-regression-from-scratch-interactive/)

#### References

- [Machine Learning](https://www.coursera.org/learn/machine-learning) course by Andrew Ng on Coursera
