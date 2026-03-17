---
layout: post
title: "Logistic Regression from Scratch II"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Extend logistic regression to two features with interactive 3D visualizations. Watch a sigmoid probability surface shape itself to fit data, explore the cost surface, and see gradient descent converge."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /logistic-regression-multivariate-extension/
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
.demo-hint {
  background: var(--bg-secondary);
  border-left: 3px solid var(--accent);
  padding: 0.6rem 0.9rem;
  margin: 1rem 0;
  border-radius: 0 6px 6px 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  align-items: center;
  margin-top: 0.7rem;
  font-size: 0.85rem;
}
.demo-controls label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 500;
}
.demo-controls input[type="range"] {
  width: 140px;
  accent-color: var(--accent);
}
.demo-controls input[type="number"] {
  width: 80px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.8rem;
  padding: 0.24rem 0.4rem;
  font-family: 'JetBrains Mono', monospace;
}
.demo-controls button {
  padding: 0.38rem 0.95rem;
  border: 1px solid var(--accent);
  border-radius: 6px;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  transition: background 0.15s, color 0.15s;
}
.demo-controls button:hover {
  background: var(--accent);
  color: var(--bg-primary);
}
.demo-controls button:disabled {
  opacity: 0.5;
  cursor: default;
}
.demo-value {
  min-width: 3rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
}
.demo-info {
  margin-top: 0.5rem;
  font-size: 0.82rem;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
}
.demo-caption {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.4rem;
}
.demo-try {
  margin-top: 0.7rem;
  padding: 0.55rem 0.75rem;
  border: 1px dashed var(--border);
  border-radius: 8px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  background: var(--bg-primary);
}
.lr2-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-top: 0.65rem;
}
.lr2-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-primary);
  padding: 0.65rem;
}
.lr2-title {
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}
.lr2-card canvas {
  display: block;
  max-width: 100%;
  margin: 0 auto;
  border-radius: 8px;
}
.interactive-demo canvas {
  display: block;
  max-width: 100%;
  margin: 0 auto;
  border-radius: 8px;
}
#logr2-3d {
  cursor: grab;
}
#logr2-3d:active {
  cursor: grabbing;
}
#logr2-surface {
  cursor: grab;
}
#logr2-surface:active {
  cursor: grabbing;
}
@media (max-width: 900px) {
  .lr2-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .demo-controls input[type="range"] { width: 110px; }
}
</style>

<script>
window.LogR2 = (function() {
  var state = {
    data: [],
    trueW1: 0.8,
    trueW2: 0.6,
    trueB: -7.0,
    noise: 0.8,
    w1: 0,
    w2: 0,
    b: 0
  };

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function createRng(seed) {
    var s = (seed >>> 0) || 1;
    return function() { s = (1664525 * s + 1013904223) >>> 0; return s / 4294967296; };
  }

  function randn(rng) {
    var u = Math.max(rng(), 1e-12), v = Math.max(rng(), 1e-12);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function sigmoid(z) {
    if (z > 500) return 1;
    if (z < -500) return 0;
    return 1 / (1 + Math.exp(-z));
  }

  function generateData(n) {
    n = n || 80;
    var rng = createRng(42);
    var pts = [];
    for (var i = 0; i < n; i++) {
      var x1 = 1 + rng() * 9;
      var x2 = 2 + rng() * 8;
      var z = state.trueW1 * x1 + state.trueW2 * x2 + state.trueB;
      z += randn(rng) * state.noise;
      var prob = sigmoid(z);
      var y = rng() < prob ? 1 : 0;
      pts.push({ x1: x1, x2: x2, y: y });
    }
    state.data = pts;
  }

  function cost(w1, w2) {
    var m = state.data.length || 1, sum = 0;
    var eps = 1e-12;
    for (var i = 0; i < state.data.length; i++) {
      var z = w1 * state.data[i].x1 + w2 * state.data[i].x2;
      var h = sigmoid(z);
      var yi = state.data[i].y;
      sum += -(yi * Math.log(h + eps) + (1 - yi) * Math.log(1 - h + eps));
    }
    return sum / m;
  }

  function costFull(w1, w2, b) {
    var m = state.data.length || 1, sum = 0;
    var eps = 1e-12;
    for (var i = 0; i < state.data.length; i++) {
      var z = w1 * state.data[i].x1 + w2 * state.data[i].x2 + b;
      var h = sigmoid(z);
      var yi = state.data[i].y;
      sum += -(yi * Math.log(h + eps) + (1 - yi) * Math.log(1 - h + eps));
    }
    return sum / m;
  }

  function gradients(w1, w2) {
    var m = state.data.length || 1, dw1 = 0, dw2 = 0;
    for (var i = 0; i < state.data.length; i++) {
      var p = state.data[i];
      var h = sigmoid(w1 * p.x1 + w2 * p.x2);
      var e = h - p.y;
      dw1 += e * p.x1;
      dw2 += e * p.x2;
    }
    return { dw1: dw1 / m, dw2: dw2 / m };
  }

  function gradientsFull(w1, w2, b) {
    var m = state.data.length || 1, dw1 = 0, dw2 = 0, db = 0;
    for (var i = 0; i < state.data.length; i++) {
      var p = state.data[i];
      var h = sigmoid(w1 * p.x1 + w2 * p.x2 + b);
      var e = h - p.y;
      dw1 += e * p.x1;
      dw2 += e * p.x2;
      db += e;
    }
    return { dw1: dw1 / m, dw2: dw2 / m, db: db / m };
  }

  function accuracy(w1, w2, b) {
    if (!state.data.length) return 0;
    var correct = 0;
    for (var i = 0; i < state.data.length; i++) {
      var p = state.data[i];
      var h = sigmoid(w1 * p.x1 + w2 * p.x2 + b);
      var pred = h >= 0.5 ? 1 : 0;
      if (pred === p.y) correct++;
    }
    return correct / state.data.length;
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
      class0: dark ? '#f7768e' : '#e63946',
      class1: dark ? '#7aa2f7' : '#2563eb',
      class0Stroke: dark ? '#bb3352' : '#b82e3a',
      class1Stroke: dark ? '#3d59a1' : '#1d4ed8',
      line: dark ? '#ff9e64' : '#e63946',
      boundary: dark ? '#ff9e64' : '#d97706',
      error: dark ? 'rgba(247,118,142,0.5)' : 'rgba(230,57,70,0.4)',
      accent: dark ? '#9ece6a' : '#16a34a',
      path: dark ? '#9ece6a' : '#16a34a',
      region0: dark ? 'rgba(247,118,142,0.08)' : 'rgba(230,57,70,0.06)',
      region1: dark ? 'rgba(122,162,247,0.08)' : 'rgba(37,99,235,0.06)',
      dark: dark
    };
  }

  function setupCanvas(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  var themeCallbacks = [];
  function onThemeChange(cb) { themeCallbacks.push(cb); }
  var dataCallbacks = [];
  function onDataChange(cb) { dataCallbacks.push(cb); }
  function notifyDataChange() { dataCallbacks.forEach(function(cb) { try { cb(); } catch(e) {} }); }
  var modelCallbacks = [];
  function onModelChange(cb) { modelCallbacks.push(cb); }
  function notifyModelChange() { modelCallbacks.forEach(function(cb) { try { cb(); } catch(e) {} }); }

  var observer = new MutationObserver(function() {
    themeCallbacks.forEach(function(cb) { try { cb(); } catch(e) {} });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    state: state, clamp: clamp, createRng: createRng, randn: randn,
    sigmoid: sigmoid, generateData: generateData,
    cost: cost, costFull: costFull,
    gradients: gradients, gradientsFull: gradientsFull,
    accuracy: accuracy,
    getColors: getColors, setupCanvas: setupCanvas,
    onThemeChange: onThemeChange,
    onDataChange: onDataChange, notifyDataChange: notifyDataChange,
    onModelChange: onModelChange, notifyModelChange: notifyModelChange
  };
})();
</script>

This is the follow-up to the first post:
[Logistic Regression from Scratch: An Interactive Guide]({{ site.baseurl }}/logistic-regression-from-scratch-interactive/)

In that post, we built logistic regression for a **single feature**: one input $$x$$ (hours studied), one weight $$w$$, and a bias $$b$$. The decision boundary was a **single point** on the number line separating pass from fail.

Now we take the natural next step: **two input features**. We predict whether a student passes or fails an exam based on both **hours studied** and **hours slept**. The decision boundary goes from a point on a line to an actual **line** in 2D space.

The full model with two features is:

$$h(x) = \sigma(w_1 x_1 + w_2 x_2 + b)$$

where $$\sigma(z) = \frac{1}{1 + e^{-z}}$$ is the sigmoid function. The weights $$w_1$$ and $$w_2$$ control the **orientation** of the decision boundary line, and $$b$$ (the **bias**) shifts it. The decision boundary itself is the set of points where $$w_1 x_1 + w_2 x_2 + b = 0$$.

For the **cost surface** and **gradient descent** sections further down, we fix $$b = 0$$ so we have only two free parameters. This lets us directly visualize:
1. The **cost surface** $$J(w_1, w_2)$$ as a 3D landscape
2. **Gradient descent** walking across that surface to find the best weights

---

## From a Point to a Line

With one feature, the decision boundary was a **single threshold** on the $$x$$-axis. Everything to the right was classified as 1, everything to the left as 0:

$$h(x) = \sigma(w \cdot x + b)$$

With two features, the decision boundary becomes a **line** in 2D space ($$x_1$$ vs $$x_2$$):

$$h(x) = \sigma(w_1 x_1 + w_2 x_2 + b)$$

What does each parameter do?

- **$$w_1$$** controls how much **hours studied** ($$x_1$$) influences the prediction. A larger $$w_1$$ means more study hours push the prediction toward passing.

- **$$w_2$$** controls how much **hours slept** ($$x_2$$) influences the prediction. It works independently from $$w_1$$.

- **$$b$$** (the **bias**) shifts the decision boundary without changing its orientation. A more negative $$b$$ makes the model harder to satisfy, requiring more study and sleep to predict a pass.

The decision boundary line is where the model predicts exactly 50% probability, that is, where $$w_1 x_1 + w_2 x_2 + b = 0$$. On one side, the model predicts pass; on the other, fail.

---

## Seeing the Data in 3D

Below is a 3D scatter plot of the training data. Each point lives at $$(x_1, x_2, y)$$ in space, where $$y$$ is either 0 (fail) or 1 (pass). The curved surface is the **sigmoid probability surface** $$h(x) = \sigma(w_1 x_1 + w_2 x_2 + b)$$, which smoothly transitions from 0 to 1. The **decision boundary** is where the surface crosses the 0.5 probability level — on one side the model predicts pass, on the other fail.

<div class="demo-hint">
<strong>Interactive:</strong> Drag <strong>w₁</strong> and <strong>w₂</strong> sliders to tilt the sigmoid surface. Drag <strong>b</strong> to shift it. <strong>Drag on the 3D plot</strong> to rotate the view. Click <strong>Fit</strong> to animate gradient descent finding the best parameters. The surface color transitions from <span style="color:#e63946;font-weight:600;">red</span> (class 0) to <span style="color:#2563eb;font-weight:600;">blue</span> (class 1).
</div>

<div class="interactive-demo">
  <div class="demo-controls">
    <label>True w₁: <input type="number" id="logr2-true-w1" value="0.8" step="0.1"></label>
    <label>True w₂: <input type="number" id="logr2-true-w2" value="0.6" step="0.1"></label>
    <label>True b: <input type="number" id="logr2-true-b" value="-7.0" step="0.5"></label>
    <label>Noise: <input type="number" id="logr2-noise" value="0.8" step="0.1" min="0"></label>
    <label>Samples: <input type="number" id="logr2-samples" value="80" step="10" min="20" max="200"></label>
    <button id="logr2-generate">Generate</button>
    <button id="logr2-fit">Fit</button>
    <button id="logr2-reset">Reset</button>
  </div>
  <div class="demo-controls">
    <label>w₁:
      <input type="range" id="logr2-w1" min="-3" max="3" step="0.02" value="0">
      <span class="demo-value" id="logr2-w1-val">0.00</span>
    </label>
    <label>w₂:
      <input type="range" id="logr2-w2" min="-3" max="3" step="0.02" value="0">
      <span class="demo-value" id="logr2-w2-val">0.00</span>
    </label>
    <label>b:
      <input type="range" id="logr2-b" min="-15" max="5" step="0.1" value="0">
      <span class="demo-value" id="logr2-b-val">0.00</span>
    </label>
  </div>
  <div class="demo-info" id="logr2-info">Adjust w₁, w₂, and b to shape the sigmoid surface.</div>
  <canvas id="logr2-3d"></canvas>
  <div class="demo-caption">Drag to rotate. Curved surface = sigmoid h(x). Red dots = fail (0), Blue dots = pass (1).</div>
  <div class="demo-controls">
    <label>Rotate:
      <input type="range" id="logr2-az" min="0" max="360" step="1" value="35">
      <span class="demo-value" id="logr2-az-val">35°</span>
    </label>
    <label>Tilt:
      <input type="range" id="logr2-el" min="10" max="75" step="1" value="30">
      <span class="demo-value" id="logr2-el-val">30°</span>
    </label>
  </div>
</div>

<script>
(function() {
  var trueW1El = document.getElementById('logr2-true-w1');
  var trueW2El = document.getElementById('logr2-true-w2');
  var trueBEl = document.getElementById('logr2-true-b');
  var noiseEl = document.getElementById('logr2-noise');
  var samplesEl = document.getElementById('logr2-samples');
  var w1El = document.getElementById('logr2-w1');
  var w2El = document.getElementById('logr2-w2');
  var bEl = document.getElementById('logr2-b');
  var w1ValEl = document.getElementById('logr2-w1-val');
  var w2ValEl = document.getElementById('logr2-w2-val');
  var bValEl = document.getElementById('logr2-b-val');
  var azEl = document.getElementById('logr2-az');
  var elEl = document.getElementById('logr2-el');
  var azValEl = document.getElementById('logr2-az-val');
  var elValEl = document.getElementById('logr2-el-val');
  var infoEl = document.getElementById('logr2-info');
  var generateBtn = document.getElementById('logr2-generate');
  var fitBtn = document.getElementById('logr2-fit');
  var resetBtn = document.getElementById('logr2-reset');
  var canvas = document.getElementById('logr2-3d');

  var W = 680, H = 460;
  var azimuth = 35, elevation = 30;
  var isDragging = false, lastMX = 0, lastMY = 0;
  var fitAnimId = null;

  var x1Min = 0, x1Max = 11, x2Min = 1, x2Max = 11;
  function normX1(v) { return (v - (x1Min + x1Max) / 2) / ((x1Max - x1Min) / 2); }
  function normX2(v) { return (v - (x2Min + x2Max) / 2) / ((x2Max - x2Min) / 2); }
  function normZ(v) { return v * 2 - 1; }

  function draw() {
    var ctx = LogR2.setupCanvas(canvas, W, H);
    var c = LogR2.getColors();
    var data = LogR2.state.data;
    var w1 = LogR2.state.w1, w2 = LogR2.state.w2, b = LogR2.state.b;
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    if (!data.length) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click "Generate" to create data', W / 2, H / 2);
      return;
    }

    // Projection
    var az = azimuth * Math.PI / 180, el = elevation * Math.PI / 180;
    var cosAz = Math.cos(az), sinAz = Math.sin(az);
    var cosEl = Math.cos(el), sinEl = Math.sin(el);
    var cx2 = W / 2, cy2 = H / 2 + 25, scale = 155;

    function project(nx, ny, nz) {
      var x3 = nx * cosAz - ny * sinAz;
      var y3 = nx * sinAz + ny * cosAz;
      var zp = y3 * sinEl + nz * cosEl;
      return { x: cx2 + x3 * scale, y: cy2 - zp * scale, depth: zp };
    }

    // Floor grid at nz = -1
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    var gN = 6;
    for (var i = 0; i <= gN; i++) {
      var t = -1 + 2 * i / gN;
      var p1 = project(t, -1, -1), p2 = project(t, 1, -1);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      p1 = project(-1, t, -1); p2 = project(1, t, -1);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }

    // Axes from back-left-bottom corner
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1.5;
    var origin = project(-1, -1, -1);
    var axEnd;
    axEnd = project(1.15, -1, -1);
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(axEnd.x, axEnd.y); ctx.stroke();
    axEnd = project(-1, 1.15, -1);
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(axEnd.x, axEnd.y); ctx.stroke();
    axEnd = project(-1, -1, 1.15);
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(axEnd.x, axEnd.y); ctx.stroke();

    // Axis labels
    ctx.fillStyle = c.text;
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    var lbl;
    lbl = project(1.28, -1, -1); ctx.fillText('x\u2081', lbl.x, lbl.y + 5);
    lbl = project(-1, 1.28, -1); ctx.fillText('x\u2082', lbl.x, lbl.y + 5);
    lbl = project(-1.08, -1, 1.22); ctx.fillText('P', lbl.x, lbl.y);

    // 0.5 reference line on the z-axis
    var halfZ = normZ(0.5);
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 0.7;
    ctx.setLineDash([4, 3]);
    var h1 = project(-1, -1, halfZ), h2 = project(1, -1, halfZ);
    ctx.beginPath(); ctx.moveTo(h1.x, h1.y); ctx.lineTo(h2.x, h2.y); ctx.stroke();
    h2 = project(-1, 1, halfZ);
    ctx.beginPath(); ctx.moveTo(h1.x, h1.y); ctx.lineTo(h2.x, h2.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = c.textMuted;
    var halfLbl = project(-1.12, -1, halfZ);
    ctx.textAlign = 'right';
    ctx.fillText('0.5', halfLbl.x, halfLbl.y + 3);

    // Collect drawables: sigmoid surface quads + data points
    var drawables = [];
    var planeN = 12;
    for (var i = 0; i < planeN; i++) {
      for (var j = 0; j < planeN; j++) {
        var corners = [], depthSum = 0, probSum = 0;
        for (var di = 0; di <= 1; di++) {
          for (var dj = 0; dj <= 1; dj++) {
            var gx1 = x1Min + (x1Max - x1Min) * (i + di) / planeN;
            var gx2 = x2Min + (x2Max - x2Min) * (j + dj) / planeN;
            var prob = LogR2.sigmoid(w1 * gx1 + w2 * gx2 + b);
            var nz = LogR2.clamp(normZ(prob), -1, 1);
            var p = project(normX1(gx1), normX2(gx2), nz);
            corners.push(p);
            depthSum += p.depth;
            probSum += prob;
          }
        }
        drawables.push({
          type: 'quad',
          corners: [corners[0], corners[1], corners[3], corners[2]],
          depth: depthSum / 4,
          prob: probSum / 4
        });
      }
    }

    for (var i = 0; i < data.length; i++) {
      var pt = data[i];
      var pD = project(normX1(pt.x1), normX2(pt.x2), normZ(pt.y));
      drawables.push({
        type: 'point', px: pD.x, py: pD.y,
        depth: pD.depth, cls: pt.y
      });
    }

    // Depth sort (back to front)
    drawables.sort(function(a, b) { return a.depth - b.depth; });

    // Render
    drawables.forEach(function(el) {
      if (el.type === 'quad') {
        var p = el.prob;
        var r, g, bl;
        if (c.dark) {
          r = Math.round(247 + (122 - 247) * p);
          g = Math.round(118 + (162 - 118) * p);
          bl = Math.round(142 + (247 - 142) * p);
        } else {
          r = Math.round(230 + (37 - 230) * p);
          g = Math.round(57 + (99 - 57) * p);
          bl = Math.round(70 + (235 - 70) * p);
        }
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + bl + ',0.25)';
        ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + bl + ',0.4)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(el.corners[0].x, el.corners[0].y);
        for (var k = 1; k < 4; k++) ctx.lineTo(el.corners[k].x, el.corners[k].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(el.px, el.py, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = el.cls === 1 ? c.class1 : c.class0;
        ctx.fill();
        ctx.strokeStyle = el.cls === 1 ? c.class1Stroke : c.class0Stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Info
    var acc = LogR2.accuracy(w1, w2, b);
    var J = LogR2.costFull(w1, w2, b);
    var bSign = b >= 0 ? ' + ' : ' - ';
    infoEl.textContent =
      'h(x) = \u03C3(' + w1.toFixed(2) + '\u00b7x\u2081 + ' + w2.toFixed(2) + '\u00b7x\u2082' + bSign + Math.abs(b).toFixed(2) + ')' +
      '  |  Cost J = ' + J.toFixed(4) +
      '  |  Accuracy = ' + (acc * 100).toFixed(1) + '%';
  }

  // Mouse drag rotation
  canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    lastMX = e.clientX; lastMY = e.clientY;
  });
  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    azimuth = ((azimuth + (e.clientX - lastMX) * 0.5) % 360 + 360) % 360;
    elevation = LogR2.clamp(elevation - (e.clientY - lastMY) * 0.3, 10, 75);
    lastMX = e.clientX; lastMY = e.clientY;
    azEl.value = Math.round(azimuth);
    elEl.value = Math.round(elevation);
    azValEl.textContent = Math.round(azimuth) + '\u00b0';
    elValEl.textContent = Math.round(elevation) + '\u00b0';
    draw();
  });
  window.addEventListener('mouseup', function() { isDragging = false; });

  // Touch drag
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    isDragging = true;
    lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY;
  }, {passive: false});
  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (!isDragging) return;
    azimuth = ((azimuth + (e.touches[0].clientX - lastMX) * 0.5) % 360 + 360) % 360;
    elevation = LogR2.clamp(elevation - (e.touches[0].clientY - lastMY) * 0.3, 10, 75);
    lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY;
    azEl.value = Math.round(azimuth);
    elEl.value = Math.round(elevation);
    azValEl.textContent = Math.round(azimuth) + '\u00b0';
    elValEl.textContent = Math.round(elevation) + '\u00b0';
    draw();
  }, {passive: false});
  canvas.addEventListener('touchend', function() { isDragging = false; });

  // Slider events
  function syncSliders() {
    LogR2.state.w1 = parseFloat(w1El.value) || 0;
    LogR2.state.w2 = parseFloat(w2El.value) || 0;
    LogR2.state.b = parseFloat(bEl.value) || 0;
    w1ValEl.textContent = LogR2.state.w1.toFixed(2);
    w2ValEl.textContent = LogR2.state.w2.toFixed(2);
    bValEl.textContent = LogR2.state.b.toFixed(2);
    draw();
    LogR2.notifyModelChange();
  }
  w1El.addEventListener('input', syncSliders);
  w2El.addEventListener('input', syncSliders);
  bEl.addEventListener('input', syncSliders);
  azEl.addEventListener('input', function() {
    azimuth = parseInt(azEl.value) || 35;
    azValEl.textContent = azimuth + '\u00b0';
    draw();
  });
  elEl.addEventListener('input', function() {
    elevation = parseInt(elEl.value) || 30;
    elValEl.textContent = elevation + '\u00b0';
    draw();
  });

  // Data generation
  function doGenerate() {
    LogR2.state.trueW1 = parseFloat(trueW1El.value) || 0;
    LogR2.state.trueW2 = parseFloat(trueW2El.value) || 0;
    LogR2.state.trueB = parseFloat(trueBEl.value) || 0;
    LogR2.state.noise = Math.max(0, parseFloat(noiseEl.value) || 0);
    var n = LogR2.clamp(parseInt(samplesEl.value) || 80, 20, 200);
    LogR2.generateData(n);
    draw();
    LogR2.notifyDataChange();
  }
  generateBtn.addEventListener('click', doGenerate);

  // Animated fit
  fitBtn.addEventListener('click', function() {
    if (fitAnimId) { cancelAnimationFrame(fitAnimId); fitAnimId = null; fitBtn.textContent = 'Fit'; return; }
    fitBtn.textContent = 'Stop';
    var remaining = 500;
    var data = LogR2.state.data;
    function tick() {
      for (var i = 0; i < 5 && remaining > 0; i++, remaining--) {
        var g = LogR2.gradientsFull(LogR2.state.w1, LogR2.state.w2, LogR2.state.b);
        LogR2.state.w1 -= 0.1 * g.dw1;
        LogR2.state.w2 -= 0.1 * g.dw2;
        LogR2.state.b -= 0.1 * g.db;
      }
      LogR2.state.w1 = LogR2.clamp(LogR2.state.w1, -3, 3);
      LogR2.state.w2 = LogR2.clamp(LogR2.state.w2, -3, 3);
      LogR2.state.b = LogR2.clamp(LogR2.state.b, -15, 5);
      w1El.value = LogR2.state.w1.toFixed(2);
      w2El.value = LogR2.state.w2.toFixed(2);
      bEl.value = LogR2.state.b.toFixed(2);
      w1ValEl.textContent = LogR2.state.w1.toFixed(2);
      w2ValEl.textContent = LogR2.state.w2.toFixed(2);
      bValEl.textContent = LogR2.state.b.toFixed(2);
      draw();
      LogR2.notifyModelChange();
      if (remaining > 0) { fitAnimId = requestAnimationFrame(tick); }
      else { fitAnimId = null; fitBtn.textContent = 'Fit'; }
    }
    tick();
  });

  resetBtn.addEventListener('click', function() {
    if (fitAnimId) { cancelAnimationFrame(fitAnimId); fitAnimId = null; fitBtn.textContent = 'Fit'; }
    trueW1El.value = '0.8'; trueW2El.value = '0.6'; trueBEl.value = '-7.0';
    noiseEl.value = '0.8'; samplesEl.value = '80';
    w1El.value = '0'; w2El.value = '0'; bEl.value = '0';
    azEl.value = '35'; elEl.value = '30';
    azimuth = 35; elevation = 30;
    azValEl.textContent = '35\u00b0'; elValEl.textContent = '30\u00b0';
    w1ValEl.textContent = '0.00'; w2ValEl.textContent = '0.00'; bValEl.textContent = '0.00';
    LogR2.state.w1 = 0; LogR2.state.w2 = 0; LogR2.state.b = 0;
    LogR2.state.trueW1 = 0.8; LogR2.state.trueW2 = 0.6; LogR2.state.trueB = -7.0;
    LogR2.state.noise = 0.8;
    LogR2.generateData(80);
    draw();
    LogR2.notifyDataChange();
    LogR2.notifyModelChange();
  });

  [trueW1El, trueW2El, trueBEl, noiseEl, samplesEl].forEach(function(el) {
    el.addEventListener('change', doGenerate);
  });

  LogR2.onThemeChange(draw);

  // Init
  LogR2.generateData(80);
  draw();
})();
</script>

<div class="demo-try">
<strong>Try this:</strong> Set <code>w₁ = 0</code> and <code>w₂ = 0</code>, then drag only <code>b</code>. The surface slides up and down as a flat sheet. Now set <code>b = -5</code> and slowly increase <code>w₁</code>. The sigmoid surface begins to curve and tilt, separating classes along the hours-studied axis. Then increase <code>w₂</code> to tilt it along the sleep axis too. Click <strong>Fit</strong> and watch the surface shape itself to hug the data. Drag on the 3D plot to rotate and see the sigmoid curve from different angles.
</div>

Notice how the **sigmoid surface** curves between 0 and 1 — red points (fail) sit near the bottom where the surface is low, and blue points (pass) cluster near the top. The dashed line at P = 0.5 shows the decision boundary. Points near this boundary are the hardest to classify since the sigmoid outputs values close to 0.5 there.

---

## The Decision Boundary

The boundary equation $$w_1 x_1 + w_2 x_2 + b = 0$$ is just the equation of a line. You can rearrange it to the familiar slope-intercept form:

$$x_2 = -\frac{w_1}{w_2}\,x_1 - \frac{b}{w_2}$$

This makes it clear what each parameter controls:

- The **slope** of the boundary is $$-w_1 / w_2$$. Changing the ratio of $$w_1$$ to $$w_2$$ rotates the line.

- The **intercept** is $$-b / w_2$$. Changing $$b$$ slides the line up or down without rotating it.

- The **normal vector** $$(w_1, w_2)$$ points perpendicular to the boundary, toward the "class 1" side. The weights tell us which direction is "positive."

On one side of the boundary (where $$w_1 x_1 + w_2 x_2 + b > 0$$), the sigmoid outputs values above 0.5, so the model predicts class 1. On the other side, it predicts class 0. The further a point is from the boundary, the more confident the prediction.

---

## The Cost Surface

For the visualizations below, we set $$b = 0$$ so the cost depends on only two variables, $$w_1$$ and $$w_2$$. This lets us plot the cost as a 3D surface and a 2D contour, something impossible with three free parameters. The bias slider above still works for exploring the full model; down here we focus on the weight landscape.

The cost function for logistic regression is the **binary cross-entropy**:

$$J(w_1,w_2) = -\frac{1}{m}\sum_{i=1}^{m}\left[y^{(i)}\log h(x^{(i)}) + (1-y^{(i)})\log(1-h(x^{(i)}))\right]$$

where $$h(x^{(i)}) = \sigma(w_1 x_1^{(i)} + w_2 x_2^{(i)})$$. Every possible combination of $$w_1$$ and $$w_2$$ produces a different cost. Plotting all combinations gives us a **cost surface**.

Unlike linear regression, the surface is **not** a simple bowl shape. Because the sigmoid function introduces nonlinearity, the landscape can be more complex. However, binary cross-entropy with a sigmoid is still **convex**, meaning there is a single global minimum and gradient descent will find it.

<div class="demo-hint">
<strong>Interactive:</strong> The red dot shows your current <code>w₁, w₂</code> position. Drag the green dot on the contour plot to explore. Adjust the w₁/w₂ sliders above and watch both views update. Drag on the 3D surface to rotate it.
</div>

<div class="interactive-demo">
  <div class="lr2-grid">
    <div class="lr2-card">
      <div class="lr2-title">3D Cost Surface J(w₁, w₂)</div>
      <canvas id="logr2-surface"></canvas>
      <div class="demo-caption">Red dot = current weights. Drag to rotate.</div>
    </div>
    <div class="lr2-card">
      <div class="lr2-title">Contour Plot (top-down view)</div>
      <canvas id="logr2-contour"></canvas>
      <div class="demo-caption">Drag the green dot to explore</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Surface Rotate:
      <input type="range" id="logr2-surf-az" min="0" max="360" step="1" value="35">
    </label>
    <label>Surface Tilt:
      <input type="range" id="logr2-surf-el" min="20" max="75" step="1" value="32">
    </label>
  </div>
  <div class="demo-info" id="logr2-cost-info">Cost and position update as you adjust w₁, w₂ above.</div>
</div>

<script>
(function() {
  var surfCanvas = document.getElementById('logr2-surface');
  var contCanvas = document.getElementById('logr2-contour');
  var surfAzEl = document.getElementById('logr2-surf-az');
  var surfElEl = document.getElementById('logr2-surf-el');
  var costInfoEl = document.getElementById('logr2-cost-info');

  var SW = 330, SH = 280, CW = 330, CH = 280;
  var wMin = -3, wMax = 3;
  var cPadL = 45, cPadR = 12, cPadT = 12, cPadB = 35;
  var contourDragging = false;
  var surfDragging = false, lastMX = 0, lastMY = 0;

  function drawSurface() {
    var ctx = LogR2.setupCanvas(surfCanvas, SW, SH);
    var c = LogR2.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, SW, SH);

    var n = 28;
    var costs = [], minC = Infinity, maxC = -Infinity;
    for (var i = 0; i <= n; i++) {
      costs[i] = [];
      for (var j = 0; j <= n; j++) {
        var ww1 = wMin + (wMax - wMin) * i / n;
        var ww2 = wMin + (wMax - wMin) * j / n;
        var cv = LogR2.cost(ww1, ww2);
        costs[i][j] = cv;
        if (cv < minC) minC = cv;
        if (cv > maxC) maxC = cv;
      }
    }
    if (maxC <= minC) maxC = minC + 1;

    var ang = parseFloat(surfAzEl.value) * Math.PI / 180;
    var tilt = parseFloat(surfElEl.value) * Math.PI / 180;
    var cosA = Math.cos(ang), sinA = Math.sin(ang);
    var cosT = Math.cos(tilt), sinT = Math.sin(tilt);
    var cx2 = SW / 2, cy2 = SH / 2 + 22, sc = 110;

    function proj(nx, ny, nz) {
      var x3 = nx * cosA - ny * sinA;
      var y3 = nx * sinA + ny * cosA;
      var zp = y3 * sinT + nz * cosT;
      return { x: cx2 + x3 * sc, y: cy2 - zp * sc * 0.9 };
    }

    var quads = [];
    for (var x = 0; x < n; x++) {
      for (var y = 0; y < n; y++) {
        var corners = [], depth = 0;
        for (var dx = 0; dx <= 1; dx++) {
          for (var dy = 0; dy <= 1; dy++) {
            var ix = x + dx, iy = y + dy;
            var nx2 = (ix / n) * 2 - 1, ny2 = (iy / n) * 2 - 1;
            var t = (costs[ix][iy] - minC) / (maxC - minC);
            var nz = 1 - Math.sqrt(LogR2.clamp(t, 0, 1));
            var p = proj(nx2, ny2, nz);
            corners.push(p);
            depth += ny2 * sinA * sinT + nz * cosT;
          }
        }
        var tMid = LogR2.clamp((costs[x][y] - minC) / (maxC - minC), 0, 1);
        quads.push({ corners: [corners[0], corners[1], corners[3], corners[2]], depth: depth / 4, t: tMid });
      }
    }
    quads.sort(function(a, b) { return a.depth - b.depth; });
    quads.forEach(function(q) {
      var t = q.t;
      var r = Math.round(40 + t * 210);
      var g = Math.round(170 - t * 120);
      var bl = Math.round(230 - t * 190);
      ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + bl + ')';
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(q.corners[0].x, q.corners[0].y);
      for (var k = 1; k < 4; k++) ctx.lineTo(q.corners[k].x, q.corners[k].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Red dot for current position
    var curT = LogR2.clamp((LogR2.cost(LogR2.state.w1, LogR2.state.w2) - minC) / (maxC - minC), 0, 1);
    var curNz = 1 - Math.sqrt(curT);
    var px = (LogR2.state.w1 - wMin) / (wMax - wMin) * 2 - 1;
    var py = (LogR2.state.w2 - wMin) / (wMax - wMin) * 2 - 1;
    var dot = proj(px, py, curNz);
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = c.line;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = c.text;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    var lw1 = proj(1.15, 0, 0); ctx.fillText('w\u2081', lw1.x, lw1.y + 2);
    var lw2 = proj(0, 1.15, 0); ctx.fillText('w\u2082', lw2.x, lw2.y + 2);
    ctx.fillStyle = c.textMuted;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Lower = better fit', SW / 2, SH - 5);
  }

  // Surface drag rotation
  surfCanvas.addEventListener('mousedown', function(e) {
    surfDragging = true;
    lastMX = e.clientX; lastMY = e.clientY;
  });
  window.addEventListener('mousemove', function(e) {
    if (!surfDragging) return;
    var newAz = ((parseFloat(surfAzEl.value) + (e.clientX - lastMX) * 0.5) % 360 + 360) % 360;
    var newEl = LogR2.clamp(parseFloat(surfElEl.value) - (e.clientY - lastMY) * 0.3, 20, 75);
    lastMX = e.clientX; lastMY = e.clientY;
    surfAzEl.value = Math.round(newAz);
    surfElEl.value = Math.round(newEl);
    drawSurface();
  });
  window.addEventListener('mouseup', function() { surfDragging = false; });

  surfCanvas.addEventListener('touchstart', function(e) {
    e.preventDefault(); surfDragging = true;
    lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY;
  }, {passive: false});
  surfCanvas.addEventListener('touchmove', function(e) {
    e.preventDefault(); if (!surfDragging) return;
    var newAz = ((parseFloat(surfAzEl.value) + (e.touches[0].clientX - lastMX) * 0.5) % 360 + 360) % 360;
    var newEl = LogR2.clamp(parseFloat(surfElEl.value) - (e.touches[0].clientY - lastMY) * 0.3, 20, 75);
    lastMX = e.touches[0].clientX; lastMY = e.touches[0].clientY;
    surfAzEl.value = Math.round(newAz);
    surfElEl.value = Math.round(newEl);
    drawSurface();
  }, {passive: false});
  surfCanvas.addEventListener('touchend', function() { surfDragging = false; });

  function drawContour() {
    var ctx = LogR2.setupCanvas(contCanvas, CW, CH);
    var c = LogR2.getColors();
    var plotW = CW - cPadL - cPadR, plotH = CH - cPadT - cPadB;
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, CW, CH);

    var gridRes = 60, maxCost = 0;
    var costGrid = [];
    for (var i = 0; i < gridRes; i++) {
      costGrid[i] = [];
      for (var j = 0; j < gridRes; j++) {
        var ww1 = wMin + (wMax - wMin) * i / (gridRes - 1);
        var ww2 = wMin + (wMax - wMin) * j / (gridRes - 1);
        var cv = LogR2.cost(ww1, ww2);
        costGrid[i][j] = cv;
        if (cv > maxCost) maxCost = cv;
      }
    }

    var cellW = plotW / gridRes + 1, cellH = plotH / gridRes + 1;
    for (var i = 0; i < gridRes; i++) {
      for (var j = 0; j < gridRes; j++) {
        var t = Math.sqrt(costGrid[i][j] / (maxCost || 1));
        var r, g, bl;
        if (c.dark) {
          r = Math.round(26 + t * 221); g = Math.round(27 + t * 91); bl = Math.round(38 + t * 104);
        } else {
          r = Math.round(239 - t * 19); g = Math.round(246 - t * 208); bl = Math.round(255 - t * 217);
        }
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + bl + ')';
        ctx.fillRect(
          cPadL + (i / gridRes) * plotW,
          cPadT + plotH - ((j + 1) / gridRes) * plotH,
          cellW, cellH
        );
      }
    }

    // Axis labels
    ctx.fillStyle = c.text;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (var i = 0; i <= 4; i++) {
      var v = wMin + (wMax - wMin) * i / 4;
      ctx.fillText(v.toFixed(1), cPadL + plotW * i / 4, cPadT + plotH + 16);
    }
    ctx.textAlign = 'right';
    for (var j = 0; j <= 4; j++) {
      var v = wMax - (wMax - wMin) * j / 4;
      ctx.fillText(v.toFixed(1), cPadL - 4, cPadT + plotH * j / 4 + 4);
    }
    ctx.textAlign = 'center';
    ctx.fillText('w\u2081', cPadL + plotW / 2, CH - 2);
    ctx.save();
    ctx.translate(10, cPadT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('w\u2082', 0, 0);
    ctx.restore();

    // Green dot (draggable)
    var dotX = cPadL + (LogR2.state.w1 - wMin) / (wMax - wMin) * plotW;
    var dotY = cPadT + plotH - (LogR2.state.w2 - wMin) / (wMax - wMin) * plotH;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 7, 0, Math.PI * 2);
    ctx.fillStyle = c.accent;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawAll() {
    drawSurface();
    drawContour();
    costInfoEl.textContent =
      'w\u2081 = ' + LogR2.state.w1.toFixed(2) +
      ', w\u2082 = ' + LogR2.state.w2.toFixed(2) +
      ', Cost J = ' + LogR2.cost(LogR2.state.w1, LogR2.state.w2).toFixed(4);
  }

  // Contour drag
  function getMP(e) {
    var r = contCanvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (CW / r.width), y: (e.clientY - r.top) * (CH / r.height) };
  }
  function updateFromContour(mx, my) {
    var plotW = CW - cPadL - cPadR, plotH = CH - cPadT - cPadB;
    var nw1 = wMin + LogR2.clamp((mx - cPadL) / plotW, 0, 1) * (wMax - wMin);
    var nw2 = wMin + LogR2.clamp((cPadT + plotH - my) / plotH, 0, 1) * (wMax - wMin);
    LogR2.state.w1 = nw1;
    LogR2.state.w2 = nw2;
    var w1El = document.getElementById('logr2-w1');
    var w2El = document.getElementById('logr2-w2');
    if (w1El) { w1El.value = nw1.toFixed(2); document.getElementById('logr2-w1-val').textContent = nw1.toFixed(2); }
    if (w2El) { w2El.value = nw2.toFixed(2); document.getElementById('logr2-w2-val').textContent = nw2.toFixed(2); }
    LogR2.notifyModelChange();
    drawAll();
  }
  contCanvas.addEventListener('mousedown', function(e) {
    contourDragging = true;
    var p = getMP(e);
    updateFromContour(p.x, p.y);
  });
  window.addEventListener('mousemove', function(e) {
    if (!contourDragging) return;
    var p = getMP(e);
    updateFromContour(p.x, p.y);
  });
  window.addEventListener('mouseup', function() { contourDragging = false; });
  contCanvas.addEventListener('touchstart', function(e) {
    e.preventDefault(); contourDragging = true;
    var p = getMP(e.touches[0]); updateFromContour(p.x, p.y);
  }, {passive: false});
  contCanvas.addEventListener('touchmove', function(e) {
    e.preventDefault(); if (!contourDragging) return;
    var p = getMP(e.touches[0]); updateFromContour(p.x, p.y);
  }, {passive: false});
  contCanvas.addEventListener('touchend', function() { contourDragging = false; });

  surfAzEl.addEventListener('input', drawAll);
  surfElEl.addEventListener('input', drawAll);
  LogR2.onThemeChange(drawAll);
  LogR2.onDataChange(drawAll);
  LogR2.onModelChange(drawAll);

  drawAll();
})();
</script>

The cross-entropy cost penalizes confident wrong predictions heavily. If the model says "99% pass" but the true label is fail, the cost spikes. This is why the surface rises steeply in regions where the weights are badly wrong. The minimum sits where the weights produce a boundary that best separates the two classes.

---

## Training with Gradient Descent

The update rules for two weights are the same form as linear regression, but with the sigmoid applied:

$$w_1 := w_1 - \alpha \cdot \frac{\partial J}{\partial w_1} \qquad w_2 := w_2 - \alpha \cdot \frac{\partial J}{\partial w_2}$$

where the partial derivatives are:

$$\frac{\partial J}{\partial w_1} = \frac{1}{m}\sum_{i=1}^{m}\left(h(x^{(i)}) - y^{(i)}\right) \cdot x_1^{(i)} \qquad \frac{\partial J}{\partial w_2} = \frac{1}{m}\sum_{i=1}^{m}\left(h(x^{(i)}) - y^{(i)}\right) \cdot x_2^{(i)}$$

Notice how similar this looks to the linear regression gradient. The only difference is that $$\hat{y}^{(i)}$$ is replaced by $$h(x^{(i)}) = \sigma(w_1 x_1^{(i)} + w_2 x_2^{(i)})$$. The sigmoid introduces nonlinearity, but the gradient formula stays elegant.

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>Step</strong> for one gradient descent iteration, or <strong>Run</strong> to animate. The left panel shows the optimization path on the contour. The right panel shows the sigmoid surface converging in 3D. The chart below shows cost decreasing over iterations.
</div>

<div class="interactive-demo">
  <div class="lr2-grid">
    <div class="lr2-card">
      <div class="lr2-title">Gradient Descent Path</div>
      <canvas id="logr2-gd-contour"></canvas>
      <div class="demo-caption">Green path on the cost contour</div>
    </div>
    <div class="lr2-card">
      <div class="lr2-title">Sigmoid Surface Converging</div>
      <canvas id="logr2-gd-3d"></canvas>
      <div class="demo-caption">Surface shapes to fit the data</div>
    </div>
  </div>
  <canvas id="logr2-gd-loss" style="width:100%; max-width:680px;"></canvas>
  <div class="demo-caption">Cost J(w₁, w₂) vs. iteration number</div>
  <div class="demo-controls">
    <label>Learning rate α:
      <input type="range" id="logr2-gd-lr" min="0.005" max="0.5" step="0.005" value="0.1">
      <span class="demo-value" id="logr2-gd-lr-val">0.100</span>
    </label>
    <button id="logr2-gd-step">Step</button>
    <button id="logr2-gd-run">Run</button>
    <button id="logr2-gd-reset">Reset</button>
  </div>
  <div class="demo-info" id="logr2-gd-info">Iteration: 0 | w₁ = 0.00, w₂ = 0.00, Cost = ―</div>
</div>

<script>
(function() {
  var contCanvas = document.getElementById('logr2-gd-contour');
  var scatter3dCanvas = document.getElementById('logr2-gd-3d');
  var lossCanvas = document.getElementById('logr2-gd-loss');
  var lrSlider = document.getElementById('logr2-gd-lr');
  var lrValEl = document.getElementById('logr2-gd-lr-val');
  var stepBtn = document.getElementById('logr2-gd-step');
  var runBtn = document.getElementById('logr2-gd-run');
  var resetBtn = document.getElementById('logr2-gd-reset');
  var infoEl = document.getElementById('logr2-gd-info');

  var CW = 330, CH = 280, SCW = 330, SCH = 280, LW = 680, LH = 150;
  var cPadL = 45, cPadR = 12, cPadT = 12, cPadB = 35;
  var wMin = -3, wMax = 3;

  var gdW1, gdW2, iteration, path, lossHistory, running, animId;
  var costGrid = [], maxCost = 0, gridRes = 60;

  function init() {
    gdW1 = 0; gdW2 = 0; iteration = 0;
    path = [{ w1: 0, w2: 0 }];
    lossHistory = [LogR2.cost(0, 0)];
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  function buildGrid() {
    costGrid = []; maxCost = 0;
    for (var i = 0; i < gridRes; i++) {
      costGrid[i] = [];
      for (var j = 0; j < gridRes; j++) {
        var ww1 = wMin + (wMax - wMin) * i / (gridRes - 1);
        var ww2 = wMin + (wMax - wMin) * j / (gridRes - 1);
        var cv = LogR2.cost(ww1, ww2);
        costGrid[i][j] = cv;
        if (cv > maxCost) maxCost = cv;
      }
    }
  }

  function getLR() { return parseFloat(lrSlider.value) || 0.1; }

  function step() {
    var lr = getLR();
    var g = LogR2.gradients(gdW1, gdW2);
    gdW1 -= lr * g.dw1;
    gdW2 -= lr * g.dw2;
    iteration++;
    path.push({ w1: gdW1, w2: gdW2 });
    lossHistory.push(LogR2.cost(gdW1, gdW2));
  }

  function drawContour() {
    var ctx = LogR2.setupCanvas(contCanvas, CW, CH);
    var c = LogR2.getColors();
    var plotW = CW - cPadL - cPadR, plotH = CH - cPadT - cPadB;
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, CW, CH);

    var cellW = plotW / gridRes + 1, cellH = plotH / gridRes + 1;
    for (var i = 0; i < gridRes; i++) {
      for (var j = 0; j < gridRes; j++) {
        var t = Math.sqrt(costGrid[i][j] / (maxCost || 1));
        var r, g, bl;
        if (c.dark) {
          r = Math.round(26 + t * 221); g = Math.round(27 + t * 91); bl = Math.round(38 + t * 104);
        } else {
          r = Math.round(239 - t * 19); g = Math.round(246 - t * 208); bl = Math.round(255 - t * 217);
        }
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + bl + ')';
        ctx.fillRect(
          cPadL + (i / gridRes) * plotW,
          cPadT + plotH - ((j + 1) / gridRes) * plotH,
          cellW, cellH
        );
      }
    }

    // Axis labels
    ctx.fillStyle = c.text;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (var i = 0; i <= 4; i++) {
      var v = wMin + (wMax - wMin) * i / 4;
      ctx.fillText(v.toFixed(1), cPadL + plotW * i / 4, cPadT + plotH + 16);
    }
    ctx.textAlign = 'right';
    for (var j = 0; j <= 4; j++) {
      var v = wMax - (wMax - wMin) * j / 4;
      ctx.fillText(v.toFixed(1), cPadL - 4, cPadT + plotH * j / 4 + 4);
    }
    ctx.textAlign = 'center';
    ctx.fillText('w\u2081', cPadL + plotW / 2, CH - 2);
    ctx.save();
    ctx.translate(10, cPadT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('w\u2082', 0, 0);
    ctx.restore();

    // Path
    if (path.length > 1) {
      ctx.strokeStyle = c.path;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (var i = 0; i < path.length; i++) {
        var px = cPadL + (path[i].w1 - wMin) / (wMax - wMin) * plotW;
        var py = cPadT + plotH - (path[i].w2 - wMin) / (wMax - wMin) * plotH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Current position dot
    var dotX = cPadL + (gdW1 - wMin) / (wMax - wMin) * plotW;
    var dotY = cPadT + plotH - (gdW2 - wMin) / (wMax - wMin) * plotH;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
    ctx.fillStyle = c.accent;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function draw3D() {
    var ctx = LogR2.setupCanvas(scatter3dCanvas, SCW, SCH);
    var c = LogR2.getColors();
    var data = LogR2.state.data;
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, SCW, SCH);

    if (!data.length) return;

    var x1Min = 0, x1Max = 11, x2Min = 1, x2Max = 11;
    function normX1(v) { return (v - 5.5) / 5.5; }
    function normX2(v) { return (v - 6) / 5; }
    function normZ(v) { return v * 2 - 1; }

    var az = 35 * Math.PI / 180, el = 30 * Math.PI / 180;
    var cosAz = Math.cos(az), sinAz = Math.sin(az);
    var cosEl = Math.cos(el), sinEl = Math.sin(el);
    var cx2 = SCW / 2, cy2 = SCH / 2 + 18, sc = 95;

    function project(nx, ny, nz) {
      var x3 = nx * cosAz - ny * sinAz;
      var y3 = nx * sinAz + ny * cosAz;
      var zp = y3 * sinEl + nz * cosEl;
      return { x: cx2 + x3 * sc, y: cy2 - zp * sc, depth: zp };
    }

    // Floor grid
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.4;
    for (var i = 0; i <= 4; i++) {
      var t = -1 + 2 * i / 4;
      var p1 = project(t, -1, -1), p2 = project(t, 1, -1);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      p1 = project(-1, t, -1); p2 = project(1, t, -1);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = c.textMuted; ctx.lineWidth = 1;
    var origin = project(-1, -1, -1), axEnd;
    axEnd = project(1.1, -1, -1);
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(axEnd.x, axEnd.y); ctx.stroke();
    axEnd = project(-1, 1.1, -1);
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(axEnd.x, axEnd.y); ctx.stroke();
    axEnd = project(-1, -1, 1.1);
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(axEnd.x, axEnd.y); ctx.stroke();

    ctx.fillStyle = c.text; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    var lbl = project(1.2, -1, -1); ctx.fillText('x\u2081', lbl.x, lbl.y + 4);
    lbl = project(-1, 1.2, -1); ctx.fillText('x\u2082', lbl.x, lbl.y + 4);
    lbl = project(-1.05, -1, 1.15); ctx.fillText('P', lbl.x, lbl.y);

    // Drawables
    var drawables = [];
    var planeN = 10;
    for (var i = 0; i < planeN; i++) {
      for (var j = 0; j < planeN; j++) {
        var corners = [], depthSum = 0, probSum = 0;
        for (var di = 0; di <= 1; di++) {
          for (var dj = 0; dj <= 1; dj++) {
            var gx1 = x1Min + (x1Max - x1Min) * (i + di) / planeN;
            var gx2 = x2Min + (x2Max - x2Min) * (j + dj) / planeN;
            var prob = LogR2.sigmoid(gdW1 * gx1 + gdW2 * gx2);
            var nz = LogR2.clamp(normZ(prob), -1, 1);
            var p = project(normX1(gx1), normX2(gx2), nz);
            corners.push(p); depthSum += p.depth; probSum += prob;
          }
        }
        drawables.push({ type: 'quad', corners: [corners[0], corners[1], corners[3], corners[2]], depth: depthSum / 4, prob: probSum / 4 });
      }
    }
    for (var i = 0; i < data.length; i++) {
      var pt = data[i];
      var pD = project(normX1(pt.x1), normX2(pt.x2), normZ(pt.y));
      drawables.push({ type: 'point', px: pD.x, py: pD.y, depth: pD.depth, cls: pt.y });
    }
    drawables.sort(function(a, b) { return a.depth - b.depth; });
    drawables.forEach(function(el) {
      if (el.type === 'quad') {
        var p = el.prob;
        var r, g, bl;
        if (c.dark) {
          r = Math.round(247 + (122 - 247) * p);
          g = Math.round(118 + (162 - 118) * p);
          bl = Math.round(142 + (247 - 142) * p);
        } else {
          r = Math.round(230 + (37 - 230) * p);
          g = Math.round(57 + (99 - 57) * p);
          bl = Math.round(70 + (235 - 70) * p);
        }
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + bl + ',0.22)';
        ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + bl + ',0.35)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(el.corners[0].x, el.corners[0].y);
        for (var k = 1; k < 4; k++) ctx.lineTo(el.corners[k].x, el.corners[k].y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(el.px, el.py, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = el.cls === 1 ? c.class1 : c.class0;
        ctx.fill();
        ctx.strokeStyle = el.cls === 1 ? c.class1Stroke : c.class0Stroke;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });
  }

  function drawLoss() {
    var ctx = LogR2.setupCanvas(lossCanvas, LW, LH);
    var c = LogR2.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, LW, LH);
    var lPadL = 60, lPadR = 15, lPadT = 10, lPadB = 28;
    var pw = LW - lPadL - lPadR, ph = LH - lPadT - lPadB;

    if (lossHistory.length < 2) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click Step or Run to see the convergence curve', LW / 2, LH / 2);
      return;
    }

    var maxL = lossHistory[0] || 1;
    var minL = Math.max(0, Math.min.apply(null, lossHistory));
    if (maxL <= minL) maxL = minL + 1;

    ctx.strokeStyle = c.textMuted; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lPadL, lPadT + ph); ctx.lineTo(lPadL + pw, lPadT + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lPadL, lPadT); ctx.lineTo(lPadL, lPadT + ph); ctx.stroke();

    ctx.fillStyle = c.textMuted;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Iteration', lPadL + pw / 2, LH - 3);
    ctx.textAlign = 'right';
    ctx.fillText(maxL.toFixed(2), lPadL - 4, lPadT + 10);
    ctx.fillText(minL.toFixed(2), lPadL - 4, lPadT + ph);

    ctx.strokeStyle = c.line;
    ctx.lineWidth = 2;
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
    drawContour();
    draw3D();
    drawLoss();
    var cost = LogR2.cost(gdW1, gdW2);
    infoEl.textContent = 'Iteration: ' + iteration +
      ' | w\u2081 = ' + gdW1.toFixed(3) +
      ', w\u2082 = ' + gdW2.toFixed(3) +
      ', Cost = ' + cost.toFixed(4);
  }

  lrSlider.addEventListener('input', function() {
    lrValEl.textContent = getLR().toFixed(3);
  });

  stepBtn.addEventListener('click', function() {
    step();
    drawAll();
  });

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

  resetBtn.addEventListener('click', function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    runBtn.textContent = 'Run';
    init();
    buildGrid();
    drawAll();
  });

  LogR2.onThemeChange(function() { buildGrid(); drawAll(); });
  LogR2.onDataChange(function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    runBtn.textContent = 'Run';
    init();
    buildGrid();
    drawAll();
  });

  init();
  buildGrid();
  drawAll();
})();
</script>

<div class="demo-try">
<strong>Try this:</strong> Click <strong>Step</strong> 10 times slowly to see individual gradient descent steps. Watch how the green dot moves on the contour plot while the sigmoid surface shapes itself in 3D. Then click <strong>Run</strong> to see rapid convergence. Try different learning rates: too high and the path overshoots; too low and convergence takes a long time.
</div>

After running gradient descent for enough iterations, the green dot settles near the cost minimum, and the sigmoid surface on the right panel shapes itself to separate the classes as well as possible. The convergence curve shows the cost rapidly decreasing at first and then flattening as it approaches the minimum. Note that the gradient descent demo fixes $$b = 0$$, so it will not find a perfect boundary in general. The Fit button in the first demo optimizes all three parameters ($$w_1$$, $$w_2$$, and $$b$$) for the best result.

---

## What to Learn From This

- With **one feature**, the decision boundary is a **point** on the number line. With **two features**, it becomes a **line** in 2D. With $$n$$ features, it becomes a **hyperplane** in $$n$$-dimensional space.

- Each weight $$w_k$$ controls how much feature $$x_k$$ contributes to the classification. Setting $$w_k = 0$$ means "ignore feature $$k$$."

- The **cost surface** for logistic regression (binary cross-entropy) is **convex**, guaranteeing a single global minimum. Gradient descent will always find it.

- The gradient formulas look almost identical to linear regression. The only difference is that the prediction $$\hat{y}$$ is replaced by $$h(x) = \sigma(w \cdot x + b)$$. This elegance comes from the choice of cross-entropy as the cost function.

- We kept $$b = 0$$ for the cost surface and gradient descent visualizations. Adding a bias $$b$$ adds one more dimension but changes nothing about how the algorithm works. The first demo above lets you explore the full model with all three parameters.
