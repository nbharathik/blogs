---
layout: post
title: "Logistic Regression: An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Build logistic regression from the ground up with interactive visualizations. Adjust parameters, watch gradient descent optimize the sigmoid curve, and explore the decision boundary - all in your browser."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /logistic-regression/
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
window.LogR = (function() {
  // Default dataset: hours studied vs pass/fail (0 or 1)
  var defaultData = [
    {x: 1.0, y: 0}, {x: 1.5, y: 0}, {x: 2.0, y: 0}, {x: 2.5, y: 0},
    {x: 3.0, y: 0}, {x: 3.5, y: 0}, {x: 4.0, y: 0},
    {x: 4.5, y: 1}, {x: 5.0, y: 0}, {x: 5.5, y: 1},
    {x: 6.0, y: 1}, {x: 6.5, y: 1}, {x: 7.0, y: 1},
    {x: 7.5, y: 1}, {x: 8.0, y: 1}, {x: 9.0, y: 1}
  ];
  var data = defaultData.map(function(p) { return {x: p.x, y: p.y}; });

  // Shared trained state
  var trained = { w: 0, b: 0, done: false, cost: 0 };

  function resetData() {
    data.length = 0;
    defaultData.forEach(function(p) { data.push({x: p.x, y: p.y}); });
    trained.done = false;
  }

  function sigmoid(z) {
    if (z > 500) return 1;
    if (z < -500) return 0;
    return 1.0 / (1.0 + Math.exp(-z));
  }

  function hypothesis(x, w, b) {
    return sigmoid(w * x + b);
  }

  function computeCost(pts, w, b) {
    var m = pts.length;
    if (m === 0) return 0;
    var sum = 0;
    var eps = 1e-15;
    pts.forEach(function(p) {
      var h = hypothesis(p.x, w, b);
      h = Math.max(eps, Math.min(1 - eps, h));
      sum += -p.y * Math.log(h) - (1 - p.y) * Math.log(1 - h);
    });
    return sum / m;
  }

  function computeGradients(pts, w, b) {
    var m = pts.length;
    if (m === 0) return {dw: 0, db: 0};
    var dw = 0, db = 0;
    pts.forEach(function(p) {
      var h = hypothesis(p.x, w, b);
      var err = h - p.y;
      dw += err * p.x;
      db += err;
    });
    return {dw: dw / m, db: db / m};
  }

  function getNormStats(pts) {
    var m = pts.length;
    if (m === 0) return {xMean: 0, xStd: 1};
    var xMean = 0, xStd = 0;
    pts.forEach(function(p) { xMean += p.x; });
    xMean /= m;
    pts.forEach(function(p) { xStd += (p.x - xMean) * (p.x - xMean); });
    xStd = Math.sqrt(xStd / m) || 1;
    return {xMean: xMean, xStd: xStd};
  }

  function normalizeData(pts, stats) {
    return pts.map(function(p) {
      return {x: (p.x - stats.xMean) / stats.xStd, y: p.y};
    });
  }

  function toOriginalParams(wNorm, bNorm, stats) {
    return {
      w: wNorm / stats.xStd,
      b: bNorm - (wNorm * stats.xMean / stats.xStd)
    };
  }

  function toNormalizedParams(w, b, stats) {
    return {
      w: w * stats.xStd,
      b: b + w * stats.xMean
    };
  }

  // Train with feature normalization for stable gradient descent
  function train(lr, iters) {
    lr = lr || 0.5;
    iters = iters || 3000;
    if (data.length < 2) return trained;
    var stats = getNormStats(data);
    var norm = normalizeData(data, stats);
    var wNorm = 0, bNorm = 0;
    for (var i = 0; i < iters; i++) {
      var g = computeGradients(norm, wNorm, bNorm);
      wNorm -= lr * g.dw;
      bNorm -= lr * g.db;
    }
    // Convert back to original scale
    var orig = toOriginalParams(wNorm, bNorm, stats);
    trained.w = orig.w;
    trained.b = orig.b;
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
      pointFail: dark ? '#f7768e' : '#e63946',
      pointFailStroke: dark ? '#bb2d3b' : '#b71c1c',
      pointPass: dark ? '#9ece6a' : '#16a34a',
      pointPassStroke: dark ? '#5a8a2a' : '#0d7a2e',
      line: dark ? '#ff9e64' : '#e63946',
      sigmoid: dark ? '#ff9e64' : '#e63946',
      error: dark ? 'rgba(247,118,142,0.35)' : 'rgba(230,57,70,0.2)',
      errorStroke: dark ? '#f7768e' : '#e63946',
      accent: dark ? '#9ece6a' : '#16a34a',
      path: dark ? '#9ece6a' : '#16a34a',
      boundary: dark ? '#bb9af7' : '#7c3aed',
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
      ctx.fillText(val % 1 === 0 ? val.toString() : val.toFixed(1), x, padT + plotH + 16);
    }
    ctx.textAlign = 'right';
    for (var j = 0; j <= yTicks; j++) {
      var val = yMax - (yMax - yMin) / yTicks * j;
      var y = padT + (plotH / yTicks) * j;
      ctx.fillText(val % 1 === 0 ? val.toString() : val.toFixed(1), padL - 6, y + 4);
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

  function drawClassPoints(ctx, pts, xMin, xMax, yMin, yMax, padL, padR, padT, padB, w, h, radius) {
    var c = getColors();
    var plotW = w - padL - padR;
    var plotH = h - padT - padB;
    var r = radius || 5;
    pts.forEach(function(p) {
      var cx = mapX(p.x, xMin, xMax, padL, plotW);
      var cy = mapY(p.y, yMin, yMax, padT, plotH);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      if (p.y === 1) {
        ctx.fillStyle = c.pointPass;
        ctx.strokeStyle = c.pointPassStroke;
      } else {
        ctx.fillStyle = c.pointFail;
        ctx.strokeStyle = c.pointFailStroke;
      }
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
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
    sigmoid: sigmoid, hypothesis: hypothesis,
    getColors: getColors, setupCanvas: setupCanvas,
    mapX: mapX, mapY: mapY, unmapX: unmapX, unmapY: unmapY,
    drawGrid: drawGrid, drawClassPoints: drawClassPoints,
    computeCost: computeCost, computeGradients: computeGradients,
    getNormStats: getNormStats, normalizeData: normalizeData,
    toOriginalParams: toOriginalParams, toNormalizedParams: toNormalizedParams,
    onThemeChange: onThemeChange,
    onDataChange: onDataChange, notifyDataChange: notifyDataChange
  };
})();
</script>

Logistic regression is one of the most fundamental **classification** algorithms in machine learning. Despite the word "regression" in its name, logistic regression is used for **classification**, not regression. It is the natural next step after linear regression and shares many of the same ideas: a hypothesis function, a cost function, and gradient descent for optimization.

In this interactive guide, we will build logistic regression **completely from scratch**, and you will get to play with every concept right in the browser. We will use a concrete, intuitive example: **predicting whether a student passes an exam based on the number of hours they studied**. Given a set of students where we know both how many hours they studied and whether they passed, can we learn a model that predicts whether a *new* student will pass?

By the end of this post you will understand:
- **Sigmoid function** - the function that maps any real number to a probability between 0 and 1
- **Hypothesis function** - the model's prediction formula for classification
- **Cost function (log loss)** - how to measure classification errors
- **Gradient descent** - the same optimization algorithm, adapted for logistic regression
- **Decision boundary** - the threshold that separates the two classes
- **Making predictions** - using the trained model on new data

<div class="demo-hint">
<strong>How to use the interactive demos:</strong> Each section has a hands-on visualization. You can click, drag, and adjust sliders to experiment. The dataset you create in the first demo is shared across all sections. Trained model parameters also carry forward, so you do not need to retrain for predictions.
</div>

---

## What is Classification?

In **regression**, we predict a continuous value (like house prices). In **classification**, we predict a **discrete category**. The simplest form is **binary classification**, where there are exactly two possible outcomes:

- Spam or not spam
- Pass or fail
- Tumor is malignant or benign
- Customer will buy or not buy

We encode these two outcomes as **0** and **1**:
- $$y = 0$$ means the **negative class** (fail, not spam, benign)
- $$y = 1$$ means the **positive class** (pass, spam, malignant)

### Why Not Use Linear Regression for Classification?

You might wonder: can we just fit a straight line and use a threshold? If the line predicts a value above 0.5, we classify as 1. If below 0.5, we classify as 0. The problem is that linear regression can produce predictions **far below 0 or far above 1**. For a student who studied 20 hours, the line might predict 2.5. For a student who studied 0 hours, it might predict -0.3. These are not meaningful probabilities. What we really want is a model that always outputs a value **between 0 and 1**, which we can interpret as a probability. For example, "there is a 0.87 probability that this student will pass." This is exactly what logistic regression gives us.

---

## The Training Dataset

Every machine learning model starts with data. Below we have 16 students with their hours studied and whether they passed (1) or failed (0). This is our **training dataset**, the set of labeled examples from which the model will learn patterns.

Notice the pattern: students who studied fewer hours tend to fail, while those who studied more tend to pass. There is a region in the middle where the outcome is less certain. Our model needs to learn this boundary.

<div class="demo-hint">
<strong>Interactive:</strong> Click on the plot to <strong>add</strong> a new data point. Click near <code>y=1</code> to add a pass, near <code>y=0</code> to add a fail. Double-click a point to <strong>remove</strong> it. All demos below automatically use this dataset.
</div>

<div class="interactive-demo">
<canvas id="logr-data-canvas"></canvas>
<div class="demo-controls">
  <button onclick="LogR.resetData(); logrDataDraw(); LogR.notifyDataChange();">Reset Data</button>
  <span class="demo-info" id="logr-data-info">16 points</span>
</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('logr-data-canvas');
  var info = document.getElementById('logr-data-info');
  var W = 680, H = 400;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = 0, xMax = 10, yMin = -0.15, yMax = 1.15;

  function draw() {
    var ctx = LogR.setupCanvas(canvas, W, H);
    var c = LogR.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    LogR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Hours Studied', 'Pass (1) / Fail (0)');
    // Draw reference lines at y=0 and y=1
    var plotW = W - padL - padR, plotH = H - padT - padB;
    ctx.strokeStyle = c.grid; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
    var y0 = LogR.mapY(0, yMin, yMax, padT, plotH);
    var y1 = LogR.mapY(1, yMin, yMax, padT, plotH);
    ctx.beginPath(); ctx.moveTo(padL, y0); ctx.lineTo(padL + plotW, y0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, y1); ctx.lineTo(padL + plotW, y1); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.textMuted; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Fail (y=0)', padL + plotW + 3, y0 + 3);
    ctx.fillText('Pass (y=1)', padL + plotW + 3, y1 + 3);
    LogR.drawClassPoints(ctx, LogR.data, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H, 6);
    var pass = LogR.data.filter(function(p) { return p.y === 1; }).length;
    var fail = LogR.data.length - pass;
    info.textContent = LogR.data.length + ' points (' + pass + ' pass, ' + fail + ' fail)';
  }

  function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (W / rect.width), y: (e.clientY - rect.top) * (H / rect.height) };
  }

  function findPoint(mx, my) {
    var plotW = W - padL - padR, plotH = H - padT - padB;
    for (var i = 0; i < LogR.data.length; i++) {
      var px = LogR.mapX(LogR.data[i].x, xMin, xMax, padL, plotW);
      var py = LogR.mapY(LogR.data[i].y, yMin, yMax, padT, plotH);
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
    if (idx >= 0 && now - lastClick < 400) { LogR.data.splice(idx, 1); draw(); LogR.notifyDataChange(); lastClick = 0; return; }
    lastClick = now;
    if (idx < 0) {
      var plotW = W - padL - padR, plotH = H - padT - padB;
      var dx = LogR.unmapX(pos.x, xMin, xMax, padL, plotW);
      var dy = LogR.unmapY(pos.y, yMin, yMax, padT, plotH);
      if (dx >= xMin && dx <= xMax) {
        var label = dy >= 0.5 ? 1 : 0;
        LogR.data.push({x: Math.round(dx * 10) / 10, y: label});
        draw();
        LogR.notifyDataChange();
      }
    }
  });
  // Touch
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var pos = getMousePos(e.touches[0]);
    var idx = findPoint(pos.x, pos.y);
    if (idx < 0) {
      var plotW = W - padL - padR, plotH = H - padT - padB;
      var dx = LogR.unmapX(pos.x, xMin, xMax, padL, plotW);
      var dy = LogR.unmapY(pos.y, yMin, yMax, padT, plotH);
      if (dx >= xMin && dx <= xMax) {
        var label = dy >= 0.5 ? 1 : 0;
        LogR.data.push({x: Math.round(dx * 10) / 10, y: label});
        draw();
        LogR.notifyDataChange();
      }
    }
  }, {passive: false});

  window.logrDataDraw = draw;
  LogR.onThemeChange(draw);
  draw();
})();
</script>

Looking at the plot, you can see a clear pattern: low study hours cluster near y=0 (fail) and high study hours cluster near y=1 (pass). Our goal is to find a smooth curve that separates these two classes, one that gives us a **probability** of passing for any number of hours studied.

---

## The Sigmoid Function

We need a function that takes any real number and squashes it into the range $$(0, 1)$$. This function is the **sigmoid** (also called the **logistic function**):

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

Key properties of the sigmoid:
- When $$z$$ is very large and positive, $$e^{-z} \to 0$$, so $$\sigma(z) \to 1$$
- When $$z$$ is very large and negative, $$e^{-z} \to \infty$$, so $$\sigma(z) \to 0$$
- When $$z = 0$$, $$\sigma(0) = \frac{1}{1+1} = 0.5$$
- The output is always strictly between 0 and 1

These properties make it perfect for representing probabilities. The output of the sigmoid can be interpreted as: "the probability that the input belongs to class 1."

<div class="demo-hint">
<strong>Interactive:</strong> Hover over the sigmoid curve to see exact values. Adjust the <strong>scale</strong> and <strong>shift</strong> parameters to see how the S-curve changes shape and position. Scale controls the steepness; shift moves the curve left or right.
</div>

<div class="interactive-demo">
<canvas id="logr-sigmoid-canvas"></canvas>
<div class="demo-controls">
  <label>Scale: <input type="range" id="logr-sigmoid-scale" min="0.2" max="5" step="0.1" value="1"> <span class="demo-value" id="logr-sigmoid-scale-val">1.0</span></label>
  <label>Shift: <input type="range" id="logr-sigmoid-shift" min="-5" max="5" step="0.1" value="0"> <span class="demo-value" id="logr-sigmoid-shift-val">0.0</span></label>
</div>
<div class="demo-info" id="logr-sigmoid-info">sigma(z) = 1 / (1 + e^(-z))</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('logr-sigmoid-canvas');
  var scaleSlider = document.getElementById('logr-sigmoid-scale');
  var shiftSlider = document.getElementById('logr-sigmoid-shift');
  var scaleVal = document.getElementById('logr-sigmoid-scale-val');
  var shiftVal = document.getElementById('logr-sigmoid-shift-val');
  var infoEl = document.getElementById('logr-sigmoid-info');
  var W = 680, H = 380;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = -8, xMax = 8, yMin = -0.1, yMax = 1.1;
  var hoverX = null;

  function draw() {
    var sc = parseFloat(scaleSlider.value);
    var sh = parseFloat(shiftSlider.value);
    scaleVal.textContent = sc.toFixed(1);
    shiftVal.textContent = sh.toFixed(1);
    var ctx = LogR.setupCanvas(canvas, W, H);
    var c = LogR.getColors();
    var plotW = W - padL - padR, plotH = H - padT - padB;
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    LogR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'z', '\u03c3(z)');
    // Draw y=0.5 reference line
    ctx.strokeStyle = c.grid; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    var y05 = LogR.mapY(0.5, yMin, yMax, padT, plotH);
    ctx.beginPath(); ctx.moveTo(padL, y05); ctx.lineTo(padL + plotW, y05); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.textMuted; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('0.5', padL + plotW + 3, y05 + 3);
    // Draw sigmoid curve
    ctx.strokeStyle = c.sigmoid; ctx.lineWidth = 2.5; ctx.beginPath();
    for (var px = 0; px <= plotW; px++) {
      var z = xMin + (px / plotW) * (xMax - xMin);
      var sig = LogR.sigmoid(sc * (z - sh));
      var sx = padL + px;
      var sy = LogR.mapY(sig, yMin, yMax, padT, plotH);
      if (px === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    // Hover indicator
    if (hoverX !== null) {
      var z = hoverX;
      var sig = LogR.sigmoid(sc * (z - sh));
      var sx = LogR.mapX(z, xMin, xMax, padL, plotW);
      var sy = LogR.mapY(sig, yMin, yMax, padT, plotH);
      ctx.strokeStyle = c.accent; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(sx, padT + plotH); ctx.lineTo(sx, sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padL, sy); ctx.lineTo(sx, sy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = c.accent; ctx.fill();
      ctx.fillStyle = c.text; ctx.font = 'bold 12px JetBrains Mono, monospace'; ctx.textAlign = 'left';
      ctx.fillText('z=' + z.toFixed(2) + ', \u03c3=' + sig.toFixed(4), sx + 10, sy - 10);
      infoEl.textContent = '\u03c3(' + (sc !== 1 ? sc.toFixed(1) + ' \u00b7 ' : '') + '(' + z.toFixed(2) + (sh !== 0 ? ' - ' + sh.toFixed(1) : '') + ')) = ' + sig.toFixed(4);
    }
  }

  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    var plotW = W - padL - padR;
    hoverX = LogR.unmapX(mx, xMin, xMax, padL, plotW);
    if (hoverX < xMin || hoverX > xMax) hoverX = null;
    draw();
  });
  canvas.addEventListener('mouseleave', function() { hoverX = null; draw(); });

  scaleSlider.addEventListener('input', draw);
  shiftSlider.addEventListener('input', draw);
  LogR.onThemeChange(draw);
  draw();
})();
</script>

<div class="demo-try">
<strong>Try this:</strong> Set scale to <code>1</code> and shift to <code>0</code> to see the standard sigmoid. Then increase the scale to <code>3</code> or <code>5</code> - notice how the curve becomes steeper (more decisive). Try a negative shift to move the curve to the left.
</div>

The sigmoid function is the key ingredient that transforms linear regression into logistic regression. Instead of predicting raw values, we pass the linear output through the sigmoid to get a probability.

---

## The Hypothesis Function

In logistic regression, prediction happens in two simple steps:

1. Compute a linear score
$$z = w \cdot x + b$$
2. Convert that score into a probability using sigmoid
$$h(x) = \sigma(z) = \frac{1}{1 + e^{-z}}$$

So, written in one line:

$$h(x) = \sigma(w \cdot x + b) = \frac{1}{1 + e^{-(w \cdot x + b)}}$$

This means:
- first part ($$w \cdot x + b$$) gives a raw score
- sigmoid turns that score into a value between 0 and 1
- that value is the predicted probability of class 1 (for example, probability of passing)

The two parameters $$w$$ and $$b$$ control the shape and position of the sigmoid curve when plotted against the input $$x$$:

- **Weight ($$w$$)** controls **how steep** the curve is.
  Larger $$|w|$$ means a sharper transition from 0 to 1. If $$w > 0$$, probability increases as $$x$$ increases.

- **Bias ($$b$$)** moves the curve **left or right**.
  It sets where the model reaches 0.5 probability. The decision boundary (where $$h(x) = 0.5$$) occurs at $$x = -b/w$$. 

Together, $$w$$ and $$b$$ define the full probability curve. Training logistic regression means finding the values of $$w$$ and $$b$$ that make this curve fit the data best.

<div class="demo-hint">
<strong>Interactive:</strong> Drag the <strong>weight</strong> and <strong>bias</strong> sliders to see how each parameter affects the sigmoid curve fitting the data. The curve represents the predicted probability of passing for each number of hours studied.
</div>

<div class="interactive-demo">
<canvas id="logr-hyp-canvas"></canvas>
<div class="demo-controls">
  <label>Weight (w): <input type="range" id="logr-hyp-w" min="-5" max="5" step="0.05" value="1.5"> <span class="demo-value" id="logr-hyp-w-val">1.50</span></label>
  <label>Bias (b): <input type="range" id="logr-hyp-b" min="-25" max="10" step="0.2" value="-7"> <span class="demo-value" id="logr-hyp-b-val">-7.0</span></label>
</div>
<div class="demo-info" id="logr-hyp-eq">h(x) = sigmoid(1.50 * x + (-7.0))</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('logr-hyp-canvas');
  var wSlider = document.getElementById('logr-hyp-w');
  var bSlider = document.getElementById('logr-hyp-b');
  var wVal = document.getElementById('logr-hyp-w-val');
  var bVal = document.getElementById('logr-hyp-b-val');
  var eqEl = document.getElementById('logr-hyp-eq');
  var W = 680, H = 400;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = 0, xMax = 10, yMin = -0.1, yMax = 1.1;

  function draw() {
    var w = parseFloat(wSlider.value);
    var b = parseFloat(bSlider.value);
    wVal.textContent = w.toFixed(2);
    bVal.textContent = b.toFixed(1);
    eqEl.textContent = 'h(x) = sigmoid(' + w.toFixed(2) + ' \u00b7 x + (' + b.toFixed(1) + '))';
    var ctx = LogR.setupCanvas(canvas, W, H);
    var c = LogR.getColors();
    var plotW = W - padL - padR, plotH = H - padT - padB;
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    LogR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Hours Studied', 'P(Pass)');
    // y=0.5 reference
    ctx.strokeStyle = c.grid; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    var y05 = LogR.mapY(0.5, yMin, yMax, padT, plotH);
    ctx.beginPath(); ctx.moveTo(padL, y05); ctx.lineTo(padL + plotW, y05); ctx.stroke();
    ctx.setLineDash([]);
    // Decision boundary line at x = -b/w
    if (w !== 0) {
      var db = -b / w;
      if (db >= xMin && db <= xMax) {
        ctx.strokeStyle = c.boundary; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        var dbx = LogR.mapX(db, xMin, xMax, padL, plotW);
        ctx.beginPath(); ctx.moveTo(dbx, padT); ctx.lineTo(dbx, padT + plotH); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = c.boundary; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
        ctx.fillText('x=' + db.toFixed(1), dbx, padT - 5);
      }
    }
    // Draw sigmoid curve
    ctx.strokeStyle = c.sigmoid; ctx.lineWidth = 2.5; ctx.beginPath();
    for (var px = 0; px <= plotW; px++) {
      var xv = xMin + (px / plotW) * (xMax - xMin);
      var sig = LogR.sigmoid(w * xv + b);
      var sx = padL + px;
      var sy = LogR.mapY(sig, yMin, yMax, padT, plotH);
      if (px === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    // Data points
    LogR.drawClassPoints(ctx, LogR.data, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H, 6);
  }

  wSlider.addEventListener('input', draw);
  bSlider.addEventListener('input', draw);
  LogR.onThemeChange(draw);
  LogR.onDataChange(draw);
  draw();
})();
</script>

<!-- <div class="demo-try">
<strong>Try this:</strong> Set <code>w = 2</code> and adjust <code>b</code> until the sigmoid curve separates the pass and fail points well. Then try <code>w = 0.5</code> - notice how the transition becomes much more gradual. Try a negative <code>w</code> to flip the curve.
</div> -->

Notice how the **weight** controls the sharpness of the transition, while the **bias** slides the transition point left or right. The purple dashed line shows the **decision boundary**, the value of $$x$$ where the model switches from predicting fail to predicting pass. To find the best sigmoid curve, we need a way to measure how well it fits the data. That is the **cost function**.

---

## The Cost Function (Binary Cross-Entropy)

For linear regression, we used Mean Squared Error. Can we use it here? Technically yes, but it creates problems. When MSE is combined with the sigmoid function, the resulting cost surface is **non-convex**, full of local minima where gradient descent can get stuck.

Instead, we use **binary cross-entropy** (also called **log loss**):

$$J(w,b) = -\frac{1}{m}\sum_{i=1}^{m}\left[y^{(i)} \cdot \log(h(x^{(i)})) + (1-y^{(i)}) \cdot \log(1-h(x^{(i)}))\right]$$

<div class="demo-hint">
The chart below shows both single-point log-loss curves on one plot.
</div>

<div class="interactive-demo">
<canvas id="logr-logloss-single-canvas"></canvas>
<div class="demo-controls">
  <label>Predicted probability (p): <input type="range" id="logr-logloss-p" min="0.01" max="0.99" step="0.01" value="0.50"> <span class="demo-value" id="logr-logloss-p-val">0.50</span></label>
  <label>Actual class:
    <select id="logr-logloss-y" class="predict-input" style="width:auto; min-width:120px;">
      <option value="1">y = 1 (pass)</option>
      <option value="0">y = 0 (fail)</option>
    </select>
  </label>
</div>
<div class="demo-info" id="logr-logloss-info">L = 0.6931</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('logr-logloss-single-canvas');
  var pSlider = document.getElementById('logr-logloss-p');
  var pVal = document.getElementById('logr-logloss-p-val');
  var ySelect = document.getElementById('logr-logloss-y');
  var infoEl = document.getElementById('logr-logloss-info');

  var W = 680, H = 360;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = 0, xMax = 1, yMin = 0, yMax = 5;

  function lossForY1(p) { return -Math.log(Math.max(1e-12, p)); }
  function lossForY0(p) { return -Math.log(Math.max(1e-12, 1 - p)); }

  function draw() {
    var p = parseFloat(pSlider.value);
    var y = parseInt(ySelect.value, 10);
    pVal.textContent = p.toFixed(2);

    var ctx = LogR.setupCanvas(canvas, W, H);
    var c = LogR.getColors();
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    LogR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Predicted probability p = h(x)', 'Single-point log loss');

    // y = 1 curve: L = -log(p)
    ctx.strokeStyle = c.pointPass;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i <= plotW; i++) {
      var px = i / plotW;
      var x = xMin + px * (xMax - xMin);
      var yy = Math.min(yMax, lossForY1(Math.max(0.001, Math.min(0.999, x))));
      var sx = padL + i;
      var sy = LogR.mapY(yy, yMin, yMax, padT, plotH);
      if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // y = 0 curve: L = -log(1-p)
    ctx.strokeStyle = c.pointFail;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var j = 0; j <= plotW; j++) {
      var px2 = j / plotW;
      var x2 = xMin + px2 * (xMax - xMin);
      var yy2 = Math.min(yMax, lossForY0(Math.max(0.001, Math.min(0.999, x2))));
      var sx2 = padL + j;
      var sy2 = LogR.mapY(yy2, yMin, yMax, padT, plotH);
      if (j === 0) ctx.moveTo(sx2, sy2); else ctx.lineTo(sx2, sy2);
    }
    ctx.stroke();

    // Marker for selected class/loss at current p
    var loss = y === 1 ? lossForY1(p) : lossForY0(p);
    var lossClamped = Math.min(yMax, loss);
    var mx = LogR.mapX(p, xMin, xMax, padL, plotW);
    var my = LogR.mapY(lossClamped, yMin, yMax, padT, plotH);

    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.25;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(mx, padT + plotH); ctx.lineTo(mx, my); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padL, my); ctx.lineTo(mx, my); ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(mx, my, 6, 0, Math.PI * 2);
    ctx.fillStyle = c.accent;
    ctx.fill();
    ctx.strokeStyle = c.bg;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Legend
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.pointPass;
    ctx.fillText('y = 1: L = -log(p)', padL + 8, padT + 16);
    ctx.fillStyle = c.pointFail;
    ctx.fillText('y = 0: L = -log(1 - p)', padL + 8, padT + 34);

    infoEl.textContent = 'At p = ' + p.toFixed(2) + ' and y = ' + y + ', single-point loss L = ' + loss.toFixed(4);
  }

  pSlider.addEventListener('input', draw);
  ySelect.addEventListener('change', draw);
  LogR.onThemeChange(draw);
  draw();
})();
</script>



Let us understand why this works. For a single data point, the cost is:

- **When $$y = 1$$ (actual = pass):** cost $$= -\log(h(x))$$. If the model predicts $$h(x)$$ close to 1 (correct!), $$-\log(1) = 0$$ (no penalty). If it predicts close to 0 (wrong!), $$-\log(0) \to \infty$$ (huge penalty).

- **When $$y = 0$$ (actual = fail):** cost $$= -\log(1 - h(x))$$. If the model predicts $$h(x)$$ close to 0 (correct!), $$-\log(1) = 0$$ (no penalty). If it predicts close to 1 (wrong!), $$-\log(0) \to \infty$$ (huge penalty).

The log loss penalizes **confident wrong predictions** severely. If the model says "99% chance of pass" but the student failed, the cost is enormous. This is exactly what we want.

<div class="demo-hint">
<strong>Interactive:</strong> Adjust the weight and bias sliders. The <strong>dashed lines</strong> are a geometric visual cue between labels and predicted probabilities. The optimization target is still <strong>log loss</strong>, shown in the metric below.
</div>

<div class="interactive-demo">
<canvas id="logr-cost-canvas"></canvas>
<div class="demo-controls">
  <label>w: <input type="range" id="logr-cost-w" min="-2" max="6" step="0.05" value="1.0"> <span class="demo-value" id="logr-cost-w-val">1.00</span></label>
  <label>b: <input type="range" id="logr-cost-b" min="-30" max="10" step="0.2" value="-4"> <span class="demo-value" id="logr-cost-b-val">-4.0</span></label>
</div>
<div class="demo-info" id="logr-cost-info">Log Loss J(w,b) = 0.00</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('logr-cost-canvas');
  var wSlider = document.getElementById('logr-cost-w');
  var bSlider = document.getElementById('logr-cost-b');
  var wValEl = document.getElementById('logr-cost-w-val');
  var bValEl = document.getElementById('logr-cost-b-val');
  var costEl = document.getElementById('logr-cost-info');
  var W = 680, H = 420;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = 0, xMax = 10, yMin = -0.1, yMax = 1.1;

  function draw() {
    var w = parseFloat(wSlider.value);
    var b = parseFloat(bSlider.value);
    wValEl.textContent = w.toFixed(2);
    bValEl.textContent = b.toFixed(1);
    var ctx = LogR.setupCanvas(canvas, W, H);
    var c = LogR.getColors();
    var plotW = W - padL - padR, plotH = H - padT - padB;
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    LogR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Hours Studied', 'P(Pass)');

    // Error lines from each point to sigmoid
    LogR.data.forEach(function(p) {
      var pred = LogR.hypothesis(p.x, w, b);
      var px = LogR.mapX(p.x, xMin, xMax, padL, plotW);
      var pyActual = LogR.mapY(p.y, yMin, yMax, padT, plotH);
      var pyPred = LogR.mapY(pred, yMin, yMax, padT, plotH);
      // Dashed residual line
      ctx.strokeStyle = c.errorStroke;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(px, pyActual); ctx.lineTo(px, pyPred); ctx.stroke();
      ctx.setLineDash([]);
    });

    // Sigmoid curve
    ctx.strokeStyle = c.sigmoid; ctx.lineWidth = 2.5; ctx.beginPath();
    for (var px = 0; px <= plotW; px++) {
      var xv = xMin + (px / plotW) * (xMax - xMin);
      var sig = LogR.sigmoid(w * xv + b);
      var sx = padL + px;
      var sy = LogR.mapY(sig, yMin, yMax, padT, plotH);
      if (px === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Data points
    LogR.drawClassPoints(ctx, LogR.data, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H, 6);

    var cost = LogR.computeCost(LogR.data, w, b);
    costEl.textContent = 'Log Loss J(w,b) = ' + cost.toFixed(4);
  }

  wSlider.addEventListener('input', draw);
  bSlider.addEventListener('input', draw);
  LogR.onThemeChange(draw);
  LogR.onDataChange(draw);
  draw();
})();
</script>

Manually tuning is difficult. Just like with linear regression, we need an automated algorithm to find the optimal parameters. But first, let us visualize what the cost landscape looks like.

---

## The Cost Landscape

Every possible combination of $$w$$ and $$b$$ produces a different log loss value $$J(w,b)$$. If we plot the cost for all combinations, we get a **cost surface**. For binary logistic regression with log loss, the objective is convex in parameters, so for typical non-perfectly-separable data we get a single basin and a unique finite minimum.

<div class="demo-hint">
<strong>Interactive:</strong> Drag the green dot around the contour plot. The right panel shows the sigmoid curve corresponding to the current (w, b) position. Try dragging the dot toward the lightest region, that is the minimum cost!
</div>

<div class="interactive-demo">
<div class="demo-split">
  <div>
    <canvas id="logr-contour-canvas"></canvas>
    <div class="demo-caption">Cost contour - drag the green dot</div>
  </div>
  <div>
    <canvas id="logr-contour-line"></canvas>
    <div class="demo-caption">Sigmoid for current (w, b)</div>
  </div>
</div>
<div class="demo-info" id="logr-contour-info">w = 1.50, b = -7.0, Cost = 0.00</div>
</div>

<script>
(function() {
  var contourCanvas = document.getElementById('logr-contour-canvas');
  var lineCanvas = document.getElementById('logr-contour-line');
  var infoEl = document.getElementById('logr-contour-info');
  var CW = 330, CH = 300, LW = 330, LH = 300;
  var padL = 50, padR = 15, padT = 15, padB = 40;
  var wMin = -1, wMax = 5, bMin = -25, bMax = 5;
  var xMin = 0, xMax = 10, yMin2 = -0.1, yMax2 = 1.1;
  var curW = 1.5, curB = -7;
  var dragging = false;
  var gridRes = 80, costGrid = [], maxCost = 0;

  function buildGrid() {
    costGrid = []; maxCost = 0;
    for (var i = 0; i < gridRes; i++) {
      costGrid[i] = [];
      for (var j = 0; j < gridRes; j++) {
        var w = wMin + (wMax - wMin) * i / (gridRes - 1);
        var b = bMin + (bMax - bMin) * j / (gridRes - 1);
        var cost = LogR.computeCost(LogR.data, w, b);
        costGrid[i][j] = cost;
        if (cost > maxCost) maxCost = cost;
      }
    }
  }

  function drawContour() {
    var ctx = LogR.setupCanvas(contourCanvas, CW, CH);
    var c = LogR.getColors();
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
    ctx.fillStyle = c.text; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    for (var i = 0; i <= 4; i++) ctx.fillText((wMin + (wMax - wMin) * i / 4).toFixed(1), padL + plotW * i / 4, padT + plotH + 16);
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
    var ctx = LogR.setupCanvas(lineCanvas, LW, LH);
    var c = LogR.getColors();
    var plotW = LW - padL - padR, plotH = LH - padT - padB;
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, LW, LH);
    LogR.drawGrid(ctx, LW, LH, padL, padR, padT, padB, xMin, xMax, yMin2, yMax2, 'Hours Studied', 'P(Pass)');
    // Sigmoid curve
    ctx.strokeStyle = c.sigmoid; ctx.lineWidth = 2.5; ctx.beginPath();
    for (var px = 0; px <= plotW; px++) {
      var xv = xMin + (px / plotW) * (xMax - xMin);
      var sig = LogR.sigmoid(curW * xv + curB);
      var sx = padL + px;
      var sy = LogR.mapY(sig, yMin2, yMax2, padT, plotH);
      if (px === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    LogR.drawClassPoints(ctx, LogR.data, xMin, xMax, yMin2, yMax2, padL, padR, padT, padB, LW, LH, 5);
  }

  function draw() { buildGrid(); drawContour(); drawLinePlot();
    infoEl.textContent = 'w = ' + curW.toFixed(3) + ', b = ' + curB.toFixed(1) + ', Cost = ' + LogR.computeCost(LogR.data, curW, curB).toFixed(4);
  }

  function getMP(e, cv, w, h) { var r = cv.getBoundingClientRect(); return {x: (e.clientX - r.left) * (w / r.width), y: (e.clientY - r.top) * (h / r.height)}; }
  function update(mx, my) {
    var plotW = CW - padL - padR, plotH = CH - padT - padB;
    curW = wMin + Math.max(0, Math.min(1, (mx - padL) / plotW)) * (wMax - wMin);
    curB = bMin + Math.max(0, Math.min(1, (padT + plotH - my) / plotH)) * (bMax - bMin);
    drawContour(); drawLinePlot();
    infoEl.textContent = 'w = ' + curW.toFixed(3) + ', b = ' + curB.toFixed(1) + ', Cost = ' + LogR.computeCost(LogR.data, curW, curB).toFixed(4);
  }

  contourCanvas.addEventListener('mousedown', function(e) { dragging = true; var p = getMP(e, contourCanvas, CW, CH); update(p.x, p.y); });
  window.addEventListener('mousemove', function(e) { if (!dragging) return; var p = getMP(e, contourCanvas, CW, CH); update(p.x, p.y); });
  window.addEventListener('mouseup', function() { dragging = false; });
  contourCanvas.addEventListener('touchstart', function(e) { e.preventDefault(); dragging = true; var p = getMP(e.touches[0], contourCanvas, CW, CH); update(p.x, p.y); }, {passive: false});
  contourCanvas.addEventListener('touchmove', function(e) { e.preventDefault(); if (!dragging) return; var p = getMP(e.touches[0], contourCanvas, CW, CH); update(p.x, p.y); }, {passive: false});
  contourCanvas.addEventListener('touchend', function() { dragging = false; });

  LogR.onThemeChange(draw);
  LogR.onDataChange(draw);
  draw();
})();
</script>

The lightest region on the contour plot represents the lowest cost, the optimal parameters. Notice how this dataset forms a clear single basin, so gradient descent can reliably move toward the minimum.

---

## Gradient Descent

The gradient descent algorithm for logistic regression follows the same structure as linear regression. The key difference is that the hypothesis function now uses the sigmoid. The gradients turn out to have the same elegant form:

$$\frac{\partial J}{\partial w} = \frac{1}{m}\sum_{i=1}^{m}\left(h(x^{(i)}) - y^{(i)}\right) \cdot x^{(i)}$$

$$\frac{\partial J}{\partial b} = \frac{1}{m}\sum_{i=1}^{m}\left(h(x^{(i)}) - y^{(i)}\right)$$

These look identical to the linear regression gradients! The difference is hidden inside $$h(x^{(i)})$$, which now equals $$\sigma(w \cdot x^{(i)} + b)$$ instead of $$w \cdot x^{(i)} + b$$.

The update rules are:

$$w := w - \alpha \cdot \frac{\partial J}{\partial w}$$

$$b := b - \alpha \cdot \frac{\partial J}{\partial b}$$

Just like in linear regression, the learning rate $$\alpha$$ controls the step size. Too small and convergence is slow. Too large and the algorithm overshoots and diverges.

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>Step</strong> for one gradient descent iteration, or <strong>Run</strong> to animate. The green path on the contour plot shows the optimization trajectory. The sigmoid curve on the right converges to the best fit. The chart below shows cost decreasing over iterations. (Features are normalized internally for stability.)
</div>

<div class="interactive-demo">
<div class="demo-split">
  <div>
    <canvas id="logr-gd-contour"></canvas>
    <div class="demo-caption">Gradient descent path on contour</div>
  </div>
  <div>
    <canvas id="logr-gd-line"></canvas>
    <div class="demo-caption">Sigmoid evolving toward best fit</div>
  </div>
</div>
<canvas id="logr-gd-loss" style="width:100%; max-width:680px;"></canvas>
<div class="demo-caption">Log Loss J(w,b) vs. iteration number</div>
<div class="demo-controls">
  <label>Learning rate: <input type="range" id="logr-gd-lr" min="-2" max="1.5" step="0.05" value="0"> <span class="demo-value" id="logr-gd-lr-val">1.00</span></label>
  <button id="logr-gd-step">Step</button>
  <button id="logr-gd-run">Run</button>
  <button id="logr-gd-reset">Reset</button>
</div>
<div class="demo-info" id="logr-gd-info">Iteration: 0 | w = 0.0000, b = 0.0, Cost = -</div>
</div>

<script>
(function() {
  var contourCanvas = document.getElementById('logr-gd-contour');
  var lineCanvas = document.getElementById('logr-gd-line');
  var lossCanvas = document.getElementById('logr-gd-loss');
  var lrSlider = document.getElementById('logr-gd-lr');
  var lrVal = document.getElementById('logr-gd-lr-val');
  var infoEl = document.getElementById('logr-gd-info');
  var stepBtn = document.getElementById('logr-gd-step');
  var runBtn = document.getElementById('logr-gd-run');
  var resetBtn = document.getElementById('logr-gd-reset');

  var CW = 330, CH = 300, LW = 330, LH = 300, LCW = 680, LCH = 150;
  var padL = 50, padR = 15, padT = 15, padB = 40;
  var wMin = -1, wMax = 5, bMin = -25, bMax = 5;
  var xMin = 0, xMax = 10, yMin2 = -0.1, yMax2 = 1.1;

  var curW, curB, curWNorm, curBNorm, normData, normStats, iteration, path, lossHistory, running, animId;
  var gridRes = 80, costGrid = [], maxCost = 0;

  function init() {
    normStats = LogR.getNormStats(LogR.data);
    normData = LogR.normalizeData(LogR.data, normStats);
    curWNorm = 0;
    curBNorm = 0;
    var start = LogR.toOriginalParams(curWNorm, curBNorm, normStats);
    curW = start.w;
    curB = start.b;
    iteration = 0;
    path = [{w: curW, b: curB}];
    lossHistory = [LogR.computeCost(LogR.data, curW, curB)];
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
        var cost = LogR.computeCost(LogR.data, w, b);
        costGrid[i][j] = cost; if (cost > maxCost) maxCost = cost;
      }
    }
  }

  function getLR() { return Math.pow(10, parseFloat(lrSlider.value)); }

  function step() {
    if (!normData || normData.length === 0) return;
    var lr = getLR();
    var g = LogR.computeGradients(normData, curWNorm, curBNorm);
    curWNorm -= lr * g.dw;
    curBNorm -= lr * g.db;
    var orig = LogR.toOriginalParams(curWNorm, curBNorm, normStats);
    curW = orig.w;
    curB = orig.b;
    iteration++;
    path.push({w: curW, b: curB});
    var cost = LogR.computeCost(LogR.data, curW, curB);
    lossHistory.push(cost);
    LogR.trained.w = curW; LogR.trained.b = curB; LogR.trained.cost = cost; LogR.trained.done = true;
  }

  function drawContour() {
    var ctx = LogR.setupCanvas(contourCanvas, CW, CH);
    var c = LogR.getColors();
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
    for (var i = 0; i <= 4; i++) ctx.fillText((wMin + (wMax - wMin) * i / 4).toFixed(1), padL + plotW * i / 4, padT + plotH + 16);
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
    var ctx = LogR.setupCanvas(lineCanvas, LW, LH);
    var c = LogR.getColors();
    var plotW = LW - padL - padR, plotH = LH - padT - padB;
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, LW, LH);
    LogR.drawGrid(ctx, LW, LH, padL, padR, padT, padB, xMin, xMax, yMin2, yMax2, 'Hours Studied', 'P(Pass)');
    // Sigmoid curve
    ctx.strokeStyle = c.sigmoid; ctx.lineWidth = 2.5; ctx.beginPath();
    for (var px = 0; px <= plotW; px++) {
      var xv = xMin + (px / plotW) * (xMax - xMin);
      var sig = LogR.sigmoid(curW * xv + curB);
      var sx = padL + px;
      var sy = LogR.mapY(sig, yMin2, yMax2, padT, plotH);
      if (px === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    LogR.drawClassPoints(ctx, LogR.data, xMin, xMax, yMin2, yMax2, padL, padR, padT, padB, LW, LH, 5);
  }

  function drawLossPlot() {
    var ctx = LogR.setupCanvas(lossCanvas, LCW, LCH);
    var c = LogR.getColors();
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
    ctx.textAlign = 'right'; ctx.fillText(maxL.toFixed(2), lPadL - 4, lPadT + 10); ctx.fillText(minL.toFixed(2), lPadL - 4, lPadT + ph);
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
    var cost = LogR.computeCost(LogR.data, curW, curB);
    infoEl.textContent = 'Iteration: ' + iteration + ' | w = ' + curW.toFixed(4) + ', b = ' + curB.toFixed(1) + ', Cost = ' + cost.toFixed(4);
  }

  lrSlider.addEventListener('input', function() { lrVal.textContent = getLR().toFixed(2); });

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

  resetBtn.addEventListener('click', function() { init(); buildGrid(); lrVal.textContent = getLR().toFixed(2); drawAll(); });

  LogR.onThemeChange(function() { buildGrid(); drawAll(); });
  LogR.onDataChange(function() { running = false; if (animId) cancelAnimationFrame(animId); runBtn.textContent = 'Run'; init(); buildGrid(); drawAll(); });
  init(); buildGrid(); lrVal.textContent = getLR().toFixed(2); drawAll();
})();
</script>

<div class="demo-try">
<strong>Try this:</strong> Start with the default learning rate of <code>1.0</code>, click <strong>Step</strong> 10 times, then switch to <strong>Run</strong>. Observe how the path moves quickly at first and then takes smaller steps near the minimum. Try resetting and using a learning rate of <code>10</code> to see what happens when the rate is too high.
</div>

After running gradient descent for enough iterations, the green dot settles at the bottom of the cost surface (minimum cost), and the sigmoid curve fits the data well. The convergence curve shows the cost rapidly decreasing at first and then flattening as it approaches the minimum.

---

## The Decision Boundary

Once we have trained the model and found the optimal $$w$$ and $$b$$, we need a rule for converting the predicted probability into a class prediction. The standard approach is to use a **threshold of 0.5**:

- If $$h(x) \geq 0.5$$, predict **class 1** (pass)
- If $$h(x) < 0.5$$, predict **class 0** (fail)

The **decision boundary** is the value of $$x$$ where $$h(x) = 0.5$$. Since $$\sigma(z) = 0.5$$ when $$z = 0$$, the decision boundary occurs when:

$$w \cdot x + b = 0 \quad \Rightarrow \quad x = -\frac{b}{w}$$

Everything to the left of this boundary is classified as fail, and everything to the right is classified as pass (assuming $$w > 0$$).

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>Auto-Train</strong> to train the model, then see the decision boundary. The shaded regions show the predicted class for each area of the plot. Adjust the threshold slider to see how it changes the decision boundary.
</div>

<div class="interactive-demo">
<canvas id="logr-boundary-canvas"></canvas>
<div class="demo-controls">
  <button id="logr-boundary-train">Auto-Train</button>
  <label>Threshold: <input type="range" id="logr-boundary-thresh" min="0.05" max="0.95" step="0.01" value="0.50"> <span class="demo-value" id="logr-boundary-thresh-val">0.50</span></label>
</div>
<div class="demo-info" id="logr-boundary-info">Click Auto-Train to fit the model</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('logr-boundary-canvas');
  var trainBtn = document.getElementById('logr-boundary-train');
  var threshSlider = document.getElementById('logr-boundary-thresh');
  var threshVal = document.getElementById('logr-boundary-thresh-val');
  var infoEl = document.getElementById('logr-boundary-info');
  var W = 680, H = 400;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = 0, xMax = 10, yMin = -0.1, yMax = 1.1;

  function draw() {
    var thresh = parseFloat(threshSlider.value);
    threshVal.textContent = thresh.toFixed(2);
    var ctx = LogR.setupCanvas(canvas, W, H);
    var c = LogR.getColors();
    var plotW = W - padL - padR, plotH = H - padT - padB;
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    if (LogR.trained.done) {
      var tw = LogR.trained.w;
      var tb = LogR.trained.b;
      // Find decision boundary at the given threshold
      // sigmoid(w*x+b) = thresh => w*x+b = log(thresh/(1-thresh)) => x = (log(thresh/(1-thresh)) - b) / w
      var dbX = null;
      if (tw !== 0 && thresh > 0 && thresh < 1) {
        dbX = (Math.log(thresh / (1 - thresh)) - tb) / tw;
      }
      // Shaded regions
      if (dbX !== null && dbX >= xMin && dbX <= xMax) {
        var bpx = LogR.mapX(dbX, xMin, xMax, padL, plotW);
        var dark = document.documentElement.getAttribute('data-theme') === 'dark';
        // Left region (fail)
        ctx.fillStyle = dark ? 'rgba(247,118,142,0.08)' : 'rgba(230,57,70,0.06)';
        ctx.fillRect(padL, padT, bpx - padL, plotH);
        // Right region (pass)
        ctx.fillStyle = dark ? 'rgba(158,206,106,0.08)' : 'rgba(22,163,74,0.06)';
        ctx.fillRect(bpx, padT, padL + plotW - bpx, plotH);
      }
    }

    LogR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Hours Studied', 'P(Pass)');

    if (LogR.trained.done) {
      var tw = LogR.trained.w;
      var tb = LogR.trained.b;
      // Sigmoid curve
      ctx.strokeStyle = c.sigmoid; ctx.lineWidth = 2.5; ctx.beginPath();
      for (var px = 0; px <= plotW; px++) {
        var xv = xMin + (px / plotW) * (xMax - xMin);
        var sig = LogR.sigmoid(tw * xv + tb);
        var sx = padL + px;
        var sy = LogR.mapY(sig, yMin, yMax, padT, plotH);
        if (px === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      // Threshold line
      var threshY = LogR.mapY(thresh, yMin, yMax, padT, plotH);
      ctx.strokeStyle = c.textMuted; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(padL, threshY); ctx.lineTo(padL + plotW, threshY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = c.textMuted; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText('threshold=' + thresh.toFixed(2), padL + plotW - 85, threshY - 5);
      // Decision boundary
      var dbX = null;
      if (tw !== 0 && thresh > 0 && thresh < 1) {
        dbX = (Math.log(thresh / (1 - thresh)) - tb) / tw;
      }
      if (dbX !== null && dbX >= xMin && dbX <= xMax) {
        var bpx = LogR.mapX(dbX, xMin, xMax, padL, plotW);
        ctx.strokeStyle = c.boundary; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        ctx.beginPath(); ctx.moveTo(bpx, padT); ctx.lineTo(bpx, padT + plotH); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = c.boundary; ctx.font = 'bold 11px JetBrains Mono, monospace'; ctx.textAlign = 'center';
        ctx.fillText('x = ' + dbX.toFixed(1), bpx, padT - 5);
        // Labels
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = c.pointFail;
        ctx.textAlign = 'right';
        ctx.fillText('Predict: FAIL', bpx - 10, padT + 20);
        ctx.fillStyle = c.pointPass;
        ctx.textAlign = 'left';
        ctx.fillText('Predict: PASS', bpx + 10, padT + 20);
      }

      // Compute accuracy
      var correct = 0;
      LogR.data.forEach(function(p) {
        var pred = LogR.hypothesis(p.x, tw, tb) >= thresh ? 1 : 0;
        if (pred === p.y) correct++;
      });
      var acc = LogR.data.length > 0 ? (correct / LogR.data.length * 100).toFixed(1) : '0.0';
      infoEl.textContent = 'w = ' + tw.toFixed(4) + ', b = ' + tb.toFixed(2) + ' | Boundary at x = ' + (dbX !== null ? dbX.toFixed(2) : 'N/A') + ' | Training Accuracy: ' + acc + '%';
    }

    LogR.drawClassPoints(ctx, LogR.data, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H, 6);
  }

  trainBtn.addEventListener('click', function() {
    LogR.train();
    draw();
  });

  threshSlider.addEventListener('input', draw);
  LogR.onThemeChange(draw);
  LogR.onDataChange(draw);
  draw();
})();
</script>

The decision boundary is a powerful concept. In our one-dimensional example, it is a single point on the x-axis. In higher dimensions (multiple features), the decision boundary becomes a line, a plane, or a hyperplane that separates the classes.

---

## Implementing from Scratch

Let us put together the complete algorithm step-by-step:

**Algorithm: Single-Feature (Univariate) Logistic Regression**

1. **Initialize** $$w = 0$$ and $$b = 0$$ (starting point)
2. **Choose** a learning rate $$\alpha$$ and number of iterations
3. **For each iteration**, repeat:
   - Compute predictions: $$h(x^{(i)}) = \sigma(w \cdot x^{(i)} + b)$$ for all data points
   - Compute gradients:
     - $$\frac{\partial J}{\partial w} = \frac{1}{m}\sum_{i=1}^{m}(h(x^{(i)}) - y^{(i)}) \cdot x^{(i)}$$
     - $$\frac{\partial J}{\partial b} = \frac{1}{m}\sum_{i=1}^{m}(h(x^{(i)}) - y^{(i)})$$
   - Update parameters:
     - $$w := w - \alpha \cdot \frac{\partial J}{\partial w}$$
     - $$b := b - \alpha \cdot \frac{\partial J}{\partial b}$$

```python
import math

def sigmoid(z):
    return 1.0 / (1.0 + math.exp(-z))

def logistic_regression(X, y, lr=0.1, iterations=3000):
    w, b = 0.0, 0.0
    m = len(X)

    for _ in range(iterations):
        # Predictions
        h = [sigmoid(w * x + b) for x in X]
        # Gradients
        dw = sum((h[i] - y[i]) * X[i] for i in range(m)) / m
        db = sum((h[i] - y[i]) for i in range(m)) / m
        # Update parameters
        w -= lr * dw
        b -= lr * db

    # Final cost (log loss) using final parameters
    eps = 1e-15
    h = [min(max(sigmoid(w * x + b), eps), 1 - eps) for x in X]
    cost = -sum(
        y[i] * math.log(h[i]) +
        (1 - y[i]) * math.log(1 - h[i])
        for i in range(m)
    ) / m
    return w, b, cost

# Example usage
X = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 9]
y = [0,  0,  0,  0,  0,  0,  0,  1,  0,  1,  1,  1,  1,  1,  1, 1]

w, b, cost = logistic_regression(X, y)
print(f"w = {w:.4f}, b = {b:.4f}, cost = {cost:.4f}")

# Predict
hours = 5.0
prob = sigmoid(w * hours + b)
print(f"P(pass | {hours} hours) = {prob:.4f}")
print(f"Prediction: {'PASS' if prob >= 0.5 else 'FAIL'}")
```

<div class="demo-hint">
<strong>Interactive:</strong> Edit the parameters below and click <strong>Run</strong>. The output shows training progress and the final trained sigmoid. Features are normalized internally for stable optimization, then mapped back to the original scale. The trained parameters are saved, and the Prediction section below will automatically use them.
</div>

<div class="interactive-demo">
<textarea class="code-runner-area" id="logr-runner-code">// Edit these values and click Run
var learning_rate = 1.0;
var iterations = 3000;
var w = 0, b = 0;

// Runs gradient descent on your dataset</textarea>
<div class="demo-controls">
  <button id="logr-runner-run">Run</button>
</div>
<div class="code-runner-output" id="logr-runner-output">Click "Run" to train the model...</div>
<canvas id="logr-runner-canvas"></canvas>
</div>

<script>
(function() {
  var codeArea = document.getElementById('logr-runner-code');
  var output = document.getElementById('logr-runner-output');
  var canvas = document.getElementById('logr-runner-canvas');
  var runBtn = document.getElementById('logr-runner-run');
  var W = 680, H = 320;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = 0, xMax = 10, yMin = -0.1, yMax = 1.1;

  function run() {
    var code = codeArea.value;
    var lr, iters, w0, b0;
    try {
      var lrM = code.match(/learning_rate\s*=\s*([\d.eE\-+]+)/);
      var itM = code.match(/iterations\s*=\s*(\d+)/);
      var wM = code.match(/var\s+w\s*=\s*([\d.eE\-+]+)/);
      var bM = code.match(/var\s+b\s*=\s*([\d.eE\-+]+)/);
      lr = lrM ? parseFloat(lrM[1]) : 1.0;
      iters = itM ? parseInt(itM[1]) : 3000;
      w0 = wM ? parseFloat(wM[1]) : 0;
      b0 = bM ? parseFloat(bM[1]) : 0;
    } catch(e) { lr = 1.0; iters = 3000; w0 = 0; b0 = 0; }

    var m = LogR.data.length;
    var normStats = LogR.getNormStats(LogR.data);
    var normData = LogR.normalizeData(LogR.data, normStats);
    var normStart = LogR.toNormalizedParams(w0, b0, normStats);
    var wNorm = normStart.w, bNorm = normStart.b;
    var w = w0, b = b0;
    var log = 'Training on ' + m + ' data points...\n';
    log += 'Learning rate: ' + lr + ' | Iterations: ' + iters + '\n\n';
    log += 'Feature normalization: x\' = (x - ' + normStats.xMean.toFixed(3) + ') / ' + normStats.xStd.toFixed(3) + '\n\n';

    for (var i = 0; i < iters; i++) {
      var g = LogR.computeGradients(normData, wNorm, bNorm);
      wNorm -= lr * g.dw;
      bNorm -= lr * g.db;
      var orig = LogR.toOriginalParams(wNorm, bNorm, normStats);
      w = orig.w;
      b = orig.b;
      if (i < 3 || i === iters - 1 || (i + 1) % Math.round(iters / 6) === 0) {
        log += 'Iter ' + String(i + 1).padStart(5) + ':  w=' + w.toFixed(6) + '  b=' + b.toFixed(2).padStart(8) + '  cost=' + LogR.computeCost(LogR.data, w, b).toFixed(4) + '\n';
      }
    }

    var finalCost = LogR.computeCost(LogR.data, w, b);
    log += '\n--- Training Complete ---\n';
    log += 'Final w = ' + w.toFixed(6) + '\n';
    log += 'Final b = ' + b.toFixed(4) + '\n';
    log += 'Final Log Loss = ' + finalCost.toFixed(4) + '\n';
    var db = w !== 0 ? (-b / w).toFixed(2) : 'N/A';
    log += 'Decision boundary at x = ' + db + '\n';
    log += 'Equation: P(pass) = sigmoid(' + w.toFixed(4) + ' \u00d7 hours + ' + b.toFixed(2) + ')';
    output.textContent = log;

    LogR.trained.w = w; LogR.trained.b = b; LogR.trained.cost = finalCost; LogR.trained.done = true;
    drawResult(w, b);
  }

  function drawResult(tw, tb) {
    var ctx = LogR.setupCanvas(canvas, W, H);
    var c = LogR.getColors();
    var plotW = W - padL - padR, plotH = H - padT - padB;
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
    LogR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Hours Studied', 'P(Pass)');
    // Sigmoid curve
    ctx.strokeStyle = c.sigmoid; ctx.lineWidth = 2.5; ctx.beginPath();
    for (var px = 0; px <= plotW; px++) {
      var xv = xMin + (px / plotW) * (xMax - xMin);
      var sig = LogR.sigmoid(tw * xv + tb);
      var sx = padL + px;
      var sy = LogR.mapY(sig, yMin, yMax, padT, plotH);
      if (px === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    // Decision boundary
    if (tw !== 0) {
      var dbX = -tb / tw;
      if (dbX >= xMin && dbX <= xMax) {
        var bpx = LogR.mapX(dbX, xMin, xMax, padL, plotW);
        ctx.strokeStyle = c.boundary; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(bpx, padT); ctx.lineTo(bpx, padT + plotH); ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    LogR.drawClassPoints(ctx, LogR.data, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H, 6);
    ctx.fillStyle = c.accent; ctx.font = 'bold 13px JetBrains Mono, monospace'; ctx.textAlign = 'left';
    ctx.fillText('P(pass) = \u03c3(' + tw.toFixed(3) + 'x + ' + tb.toFixed(1) + ')', padL + 10, padT + 20);
  }

  runBtn.addEventListener('click', run);
  LogR.onThemeChange(function() { if (LogR.trained.done) drawResult(LogR.trained.w, LogR.trained.b); });
  LogR.onDataChange(function() { output.textContent = 'Dataset changed - click "Run" to retrain.'; var ctx = LogR.setupCanvas(canvas, W, H); ctx.fillStyle = LogR.getColors().bg; ctx.fillRect(0, 0, W, H); });
})();
</script>

---

## Making Predictions

Once we have trained our model and found the optimal values of $$w$$ and $$b$$, making predictions is straightforward:

1. Compute the probability: $$P(\text{pass}) = \sigma(w_{trained} \cdot x_{new} + b_{trained})$$
2. Apply the threshold: if $$P(\text{pass}) \geq 0.5$$, predict **PASS**, otherwise predict **FAIL**

For example, if we trained and found $$w = 2.0$$ and $$b = -10.0$$, then for a student who studied 6 hours:

$$P(\text{pass}) = \sigma(2.0 \times 6 + (-10.0)) = \sigma(2.0) = 0.88$$

Since $$0.88 \geq 0.5$$, we predict **PASS**; the model's estimated probability is 88%.

<div class="demo-hint">
<strong>Interactive:</strong> This demo uses the trained parameters from the gradient descent above. If you have not trained yet, click <strong>Auto-Train</strong>. Then enter any number of hours and click <strong>Predict</strong> to see the result.
</div>

<div class="interactive-demo">
<canvas id="logr-predict-canvas"></canvas>
<div class="demo-controls">
  <button id="logr-predict-train">Auto-Train</button>
  <label>Hours Studied: <input type="number" class="predict-input" id="logr-predict-input" placeholder="e.g. 5.5" value="5.5" step="0.1"></label>
  <button id="logr-predict-btn">Predict</button>
</div>
<div class="demo-info" id="logr-predict-info">Enter hours studied and click Predict (or Auto-Train first if needed)</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('logr-predict-canvas');
  var trainBtn = document.getElementById('logr-predict-train');
  var predictBtn = document.getElementById('logr-predict-btn');
  var hoursInput = document.getElementById('logr-predict-input');
  var infoEl = document.getElementById('logr-predict-info');
  var W = 680, H = 400;
  var padL = 55, padR = 20, padT = 20, padB = 45;
  var xMin = 0, xMax = 10, yMin = -0.1, yMax = 1.1;
  var predX = null, predY = null;

  function ensureTrained() {
    if (!LogR.trained.done) {
      LogR.train();
    }
  }

  function draw() {
    var ctx = LogR.setupCanvas(canvas, W, H);
    var c = LogR.getColors();
    var plotW = W - padL - padR, plotH = H - padT - padB;
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
    LogR.drawGrid(ctx, W, H, padL, padR, padT, padB, xMin, xMax, yMin, yMax, 'Hours Studied', 'P(Pass)');

    if (LogR.trained.done) {
      var tw = LogR.trained.w, tb = LogR.trained.b;
      // Sigmoid curve
      ctx.strokeStyle = c.sigmoid; ctx.lineWidth = 2.5; ctx.beginPath();
      for (var px = 0; px <= plotW; px++) {
        var xv = xMin + (px / plotW) * (xMax - xMin);
        var sig = LogR.sigmoid(tw * xv + tb);
        var sx = padL + px;
        var sy = LogR.mapY(sig, yMin, yMax, padT, plotH);
        if (px === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      // Decision boundary
      if (tw !== 0) {
        var dbX = -tb / tw;
        if (dbX >= xMin && dbX <= xMax) {
          var bpx = LogR.mapX(dbX, xMin, xMax, padL, plotW);
          ctx.strokeStyle = c.boundary; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
          ctx.beginPath(); ctx.moveTo(bpx, padT); ctx.lineTo(bpx, padT + plotH); ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      ctx.fillStyle = c.accent; ctx.font = 'bold 12px JetBrains Mono, monospace'; ctx.textAlign = 'left';
      ctx.fillText('P(pass) = \u03c3(' + tw.toFixed(3) + 'x + ' + tb.toFixed(1) + ')', padL + 10, padT + 18);
    }

    LogR.drawClassPoints(ctx, LogR.data, xMin, xMax, yMin, yMax, padL, padR, padT, padB, W, H, 6);

    if (predX !== null && predY !== null && LogR.trained.done) {
      var px = LogR.mapX(predX, xMin, xMax, padL, plotW);
      var py = LogR.mapY(predY, yMin, yMax, padT, plotH);
      // Dashed lines
      ctx.strokeStyle = c.accent; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(px, padT + plotH); ctx.lineTo(px, py); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(padL, py); ctx.stroke();
      ctx.setLineDash([]);
      // Point
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = c.accent; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      // Label
      var prediction = predY >= 0.5 ? 'PASS' : 'FAIL';
      ctx.fillStyle = c.text; ctx.font = 'bold 13px Inter, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(prediction + ' (' + (predY * 100).toFixed(1) + '%)', px + 12, py - 10);
      ctx.fillStyle = c.textMuted; ctx.font = '11px Inter, sans-serif';
      ctx.fillText(predX.toFixed(1) + ' hours', px + 12, py + 5);
    }
  }

  trainBtn.addEventListener('click', function() {
    LogR.train();
    predX = null; predY = null;
    infoEl.textContent = 'Trained! w = ' + LogR.trained.w.toFixed(4) + ', b = ' + LogR.trained.b.toFixed(2) + ', Cost = ' + LogR.trained.cost.toFixed(4) + ' - Now enter hours and click Predict';
    draw();
  });

  predictBtn.addEventListener('click', function() {
    ensureTrained();
    var hours = parseFloat(hoursInput.value);
    if (isNaN(hours) || hours < 0) { infoEl.textContent = 'Please enter a valid number of hours (e.g. 5.5)'; return; }
    predX = hours;
    predY = LogR.hypothesis(hours, LogR.trained.w, LogR.trained.b);
    var prediction = predY >= 0.5 ? 'PASS' : 'FAIL';
    infoEl.textContent = 'A student who studied ' + hours.toFixed(1) + ' hours: P(pass) = ' + (predY * 100).toFixed(1) + '% => ' + prediction + '  (using \u03c3(' + LogR.trained.w.toFixed(3) + ' \u00d7 ' + hours.toFixed(1) + ' + ' + LogR.trained.b.toFixed(1) + '))';
    draw();
  });

  LogR.onThemeChange(draw);
  LogR.onDataChange(function() { predX = null; predY = null; infoEl.textContent = 'Dataset changed - click Auto-Train then Predict.'; draw(); });
  draw();
})();
</script>

---

## Summary

Here is everything we covered, building logistic regression completely from the ground up:

| Concept | What it does | Formula |
|---|---|---|
| **Sigmoid function** | Squashes any value to (0,1) | $$\sigma(z) = \frac{1}{1+e^{-z}}$$ |
| **Hypothesis function** | Predicts probability of class 1 | $$h(x) = \sigma(wx + b)$$ |
| **Cost function (log loss)** | Measures classification error | $$J = -\frac{1}{m}\sum[y\log(h) + (1-y)\log(1-h)]$$ |
| **Gradient** | Direction of steepest ascent | $$\frac{\partial J}{\partial w}, \frac{\partial J}{\partial b}$$ |
| **Gradient descent** | Updates parameters to reduce cost | $$w := w - \alpha \frac{\partial J}{\partial w},\; b := b - \alpha \frac{\partial J}{\partial b}$$ |
| **Decision boundary** | Threshold for classification | $$x = -b/w$$ (where $$h(x) = 0.5$$) |
| **Prediction** | Uses trained model on new data | $$\hat{y} = \begin{cases}1 & h(x) \geq 0.5 \\ 0 & h(x) < 0.5\end{cases}$$ |

The logistic regression model shares the same fundamental framework as linear regression: hypothesis, cost function, and gradient descent. The key differences are the sigmoid activation, the log loss cost function, and the classification threshold.

#### Next Steps

- [Multivariate Logistic Regression]({{ site.baseurl }}/logistic-regression-multivariate/): Extend to multiple features and see how the decision boundary becomes a line or plane.
- [Linear Regression refresher]({{ site.baseurl }}/linear-regression/): Review the linear regression algorithm and see how it compares to logistic regression.

#### References

- [Machine Learning](https://www.coursera.org/learn/machine-learning) course by Andrew Ng on Coursera
