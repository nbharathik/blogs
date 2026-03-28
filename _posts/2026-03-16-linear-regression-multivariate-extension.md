---
layout: post
title: "Linear Regression II: An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Extend linear regression to two features with interactive 3D visualizations. Watch a prediction plane tilt through data, explore the cost surface, and see gradient descent converge."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /linear-regression-multivariate/
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
#lr2-3d {
  cursor: grab;
}
#lr2-3d:active {
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
window.LR2 = (function() {
  var state = {
    data: [],
    trueW1: 2.8,
    trueW2: -1.6,
    trueB: 3,
    noise: 0.6,
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

  function generateData(n) {
    n = n || 80;
    var rng = createRng(42);
    var pts = [];
    for (var i = 0; i < n; i++) {
      var x1 = (rng() * 2 - 1) * 3.0;
      var x2 = (rng() * 2 - 1) * 3.0;
      var y = state.trueW1 * x1 + state.trueW2 * x2 + state.trueB + randn(rng) * state.noise;
      pts.push({ x1: x1, x2: x2, y: y });
    }
    state.data = pts;
  }

  function cost(w1, w2) {
    var m = state.data.length || 1, sum = 0;
    for (var i = 0; i < state.data.length; i++) {
      var e = w1 * state.data[i].x1 + w2 * state.data[i].x2 - state.data[i].y;
      sum += e * e;
    }
    return sum / (2 * m);
  }

  function gradients(w1, w2) {
    var m = state.data.length || 1, dw1 = 0, dw2 = 0;
    for (var i = 0; i < state.data.length; i++) {
      var p = state.data[i];
      var e = w1 * p.x1 + w2 * p.x2 - p.y;
      dw1 += e * p.x1;
      dw2 += e * p.x2;
    }
    return { dw1: dw1 / m, dw2: dw2 / m };
  }

  function r2(w1, w2) {
    if (!state.data.length) return 0;
    var mean = 0;
    for (var i = 0; i < state.data.length; i++) mean += state.data[i].y;
    mean /= state.data.length;
    var ssTot = 0, ssRes = 0;
    for (var j = 0; j < state.data.length; j++) {
      var d = state.data[j].y - mean;
      var e = state.data[j].y - (w1 * state.data[j].x1 + w2 * state.data[j].x2);
      ssTot += d * d;
      ssRes += e * e;
    }
    return ssTot < 1e-12 ? (ssRes < 1e-12 ? 1 : 0) : 1 - ssRes / ssTot;
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
      error: dark ? 'rgba(247,118,142,0.5)' : 'rgba(230,57,70,0.4)',
      accent: dark ? '#9ece6a' : '#16a34a',
      path: dark ? '#9ece6a' : '#16a34a',
      plane: dark ? 'rgba(122,162,247,0.18)' : 'rgba(37,99,235,0.12)',
      planeLine: dark ? 'rgba(122,162,247,0.32)' : 'rgba(37,99,235,0.22)',
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
    generateData: generateData, cost: cost, gradients: gradients, r2: r2,
    getColors: getColors, setupCanvas: setupCanvas,
    onThemeChange: onThemeChange,
    onDataChange: onDataChange, notifyDataChange: notifyDataChange,
    onModelChange: onModelChange, notifyModelChange: notifyModelChange
  };
})();
</script>

This is the follow-up to the first post:
[Linear Regression from Scratch: An Interactive Guide]({{ site.baseurl }}/linear-regression/)

Now we move to the next step: multiple input features. We start with the simplest multivariate case, two features because it can still be visualized. With two inputs, linear regression is no longer just a line, it becomes a plane in 3D space. More generally, with additional features the same idea extends to a hyperplane in higher dimensions.

The full model with two features is:

$$\hat{y} = w_1 x_1 + w_2 x_2 + b$$

where $$w_1$$ and $$w_2$$ control the **tilt** of the prediction plane, and $$b$$ (the **bias**) shifts the entire plane **up or down**. In the first interactive demo below, you can adjust all three to build intuition for how the plane moves. For the **cost surface** and **gradient descent** sections further down, we fix $$b = 0$$ so we have only two free parameters. This lets us directly visualize:
1. The **cost surface** $$J(w_1, w_2)$$ as a 3D bowl
2. **Gradient descent** walking down that bowl to find the best weights

---

## From a Line to a Plane

With one feature, the hypothesis was a **line** on a 2D plot ($$x$$ vs $$y$$):

$$\hat{y} = w \cdot x + b$$

With two features, the hypothesis becomes a **plane** in 3D space ($$x_1$$, $$x_2$$, $$y$$):

$$\hat{y} = w_1 x_1 + w_2 x_2 + b$$

What does each parameter do?

- **$$w_1$$** controls how steeply the plane tilts along the **$$x_1$$ direction**. Increase $$w_1$$ and higher $$x_1$$ values predict higher $$y$$. Set $$w_1 = 0$$ and the plane becomes flat along $$x_1$$ - the prediction does not depend on $$x_1$$ at all.

- **$$w_2$$** does the same for the **$$x_2$$ direction**. It independently controls the other tilt axis.

- **$$b$$** (the **bias**) shifts the entire plane **up or down** without changing its tilt. With $$b = 0$$ the plane is forced through the origin. A nonzero $$b$$ lets the plane float to the right vertical position.

Together, $$w_1$$, $$w_2$$, and $$b$$ fully determine the prediction plane. Training means finding the values that make the plane pass as close as possible to all the data points.

---

## Seeing the Data in 3D

Below is a 3D scatter plot of the training data. Each point lives at $$(x_1, x_2, y)$$ in space. The semi-transparent blue surface is the **prediction plane** $$\hat{y} = w_1 x_1 + w_2 x_2 + b$$. The red dashed lines are the **errors** (residuals), the vertical distance from each point to the plane.

<div class="demo-hint">
<strong>Interactive:</strong> Drag <strong>w₁</strong> and <strong>w₂</strong> sliders to tilt the prediction plane. Drag <strong>b</strong> to shift it up or down. <strong>Drag on the 3D plot</strong> to rotate the view. Click <strong>Fit</strong> to animate gradient descent finding the best parameters. The red lines show prediction errors and try to make them as short as possible!
</div>

<div class="interactive-demo">
  <div class="demo-controls">
    <label>True w₁: <input type="number" id="lr2-true-w1" value="2.8" step="0.1"></label>
    <label>True w₂: <input type="number" id="lr2-true-w2" value="-1.6" step="0.1"></label>
    <label>True b: <input type="number" id="lr2-true-b" value="3" step="0.5"></label>
    <label>Noise: <input type="number" id="lr2-noise" value="0.6" step="0.1" min="0"></label>
    <label>Samples: <input type="number" id="lr2-samples" value="80" step="10" min="20" max="200"></label>
    <button id="lr2-generate">Generate</button>
    <button id="lr2-fit">Fit</button>
    <button id="lr2-reset">Reset</button>
  </div>
  <div class="demo-controls">
    <label>w₁:
      <input type="range" id="lr2-w1" min="-6" max="6" step="0.05" value="0">
      <span class="demo-value" id="lr2-w1-val">0.00</span>
    </label>
    <label>w₂:
      <input type="range" id="lr2-w2" min="-6" max="6" step="0.05" value="0">
      <span class="demo-value" id="lr2-w2-val">0.00</span>
    </label>
    <label>b:
      <input type="range" id="lr2-b" min="-15" max="15" step="0.1" value="0">
      <span class="demo-value" id="lr2-b-val">0.00</span>
    </label>
  </div>
  <div class="demo-info" id="lr2-info">Adjust w₁ and w₂ to tilt the plane through the data.</div>
  <canvas id="lr2-3d"></canvas>
  <div class="demo-caption">Drag to rotate the 3D view. Blue surface = prediction plane. Red dashed = errors.</div>
  <div class="demo-controls">
    <label>Rotate:
      <input type="range" id="lr2-az" min="0" max="360" step="1" value="35">
      <span class="demo-value" id="lr2-az-val">35°</span>
    </label>
    <label>Tilt:
      <input type="range" id="lr2-el" min="10" max="75" step="1" value="30">
      <span class="demo-value" id="lr2-el-val">30°</span>
    </label>
    <label><input type="checkbox" id="lr2-residuals" checked> Show errors</label>
  </div>
</div>

<script>
(function() {
  var trueW1El = document.getElementById('lr2-true-w1');
  var trueW2El = document.getElementById('lr2-true-w2');
  var trueBEl = document.getElementById('lr2-true-b');
  var noiseEl = document.getElementById('lr2-noise');
  var samplesEl = document.getElementById('lr2-samples');
  var w1El = document.getElementById('lr2-w1');
  var w2El = document.getElementById('lr2-w2');
  var bEl = document.getElementById('lr2-b');
  var w1ValEl = document.getElementById('lr2-w1-val');
  var w2ValEl = document.getElementById('lr2-w2-val');
  var bValEl = document.getElementById('lr2-b-val');
  var azEl = document.getElementById('lr2-az');
  var elEl = document.getElementById('lr2-el');
  var azValEl = document.getElementById('lr2-az-val');
  var elValEl = document.getElementById('lr2-el-val');
  var residualsEl = document.getElementById('lr2-residuals');
  var infoEl = document.getElementById('lr2-info');
  var generateBtn = document.getElementById('lr2-generate');
  var fitBtn = document.getElementById('lr2-fit');
  var resetBtn = document.getElementById('lr2-reset');
  var canvas = document.getElementById('lr2-3d');

  var W = 680, H = 460;
  var azimuth = 35, elevation = 30;
  var isDragging = false, lastMX = 0, lastMY = 0;
  var fitAnimId = null;

  function draw() {
    var ctx = LR2.setupCanvas(canvas, W, H);
    var c = LR2.getColors();
    var data = LR2.state.data;
    var w1 = LR2.state.w1, w2 = LR2.state.w2, b = LR2.state.b;
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    if (!data.length) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click "Generate" to create data', W / 2, H / 2);
      return;
    }

    // Y-axis range from data only (fixed, so points don't shift when adjusting weights)
    var dataYMin = Infinity, dataYMax = -Infinity;
    for (var i = 0; i < data.length; i++) {
      if (data[i].y < dataYMin) dataYMin = data[i].y;
      if (data[i].y > dataYMax) dataYMax = data[i].y;
    }
    var yPad = (dataYMax - dataYMin) * 0.2 || 2;
    var yMin = dataYMin - yPad;
    var yMax = dataYMax + yPad;

    // Normalization
    function normX(v) { return v / 3; }
    function normY(v) { return ((v - yMin) / (yMax - yMin)) * 2 - 1; }

    // Projection
    var az = azimuth * Math.PI / 180, el = elevation * Math.PI / 180;
    var cosAz = Math.cos(az), sinAz = Math.sin(az);
    var cosEl = Math.cos(el), sinEl = Math.sin(el);
    var cx = W / 2, cy = H / 2 + 25, scale = 155;

    function project(nx, ny, nz) {
      var x3 = nx * cosAz - ny * sinAz;
      var y3 = nx * sinAz + ny * cosAz;
      var zp = y3 * sinEl + nz * cosEl;
      return { x: cx + x3 * scale, y: cy - zp * scale, depth: zp };
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
    lbl = project(-1.08, -1, 1.22); ctx.fillText('y', lbl.x, lbl.y);

    // Collect drawables: plane quads + data points
    var drawables = [];
    var planeN = 10;
    for (var i = 0; i < planeN; i++) {
      for (var j = 0; j < planeN; j++) {
        var corners = [], depthSum = 0;
        for (var di = 0; di <= 1; di++) {
          for (var dj = 0; dj <= 1; dj++) {
            var gx1 = -3 + 6 * (i + di) / planeN;
            var gx2 = -3 + 6 * (j + dj) / planeN;
            var gz = w1 * gx1 + w2 * gx2 + b;
            var nz = LR2.clamp(normY(gz), -1.8, 1.8);
            var p = project(normX(gx1), normX(gx2), nz);
            corners.push(p);
            depthSum += p.depth;
          }
        }
        drawables.push({
          type: 'quad',
          corners: [corners[0], corners[1], corners[3], corners[2]],
          depth: depthSum / 4
        });
      }
    }

    var showRes = residualsEl.checked;
    for (var i = 0; i < data.length; i++) {
      var pt = data[i];
      var pred = w1 * pt.x1 + w2 * pt.x2 + b;
      var nzD = LR2.clamp(normY(pt.y), -1.5, 1.5);
      var nzP = LR2.clamp(normY(pred), -1.5, 1.5);
      var pD = project(normX(pt.x1), normX(pt.x2), nzD);
      var pP = project(normX(pt.x1), normX(pt.x2), nzP);
      drawables.push({
        type: 'point', px: pD.x, py: pD.y,
        predX: pP.x, predY: pP.y, depth: pD.depth,
        showRes: showRes
      });
    }

    // Depth sort (back to front)
    drawables.sort(function(a, b) { return a.depth - b.depth; });

    // Render
    drawables.forEach(function(el) {
      if (el.type === 'quad') {
        ctx.fillStyle = c.plane;
        ctx.strokeStyle = c.planeLine;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(el.corners[0].x, el.corners[0].y);
        for (var k = 1; k < 4; k++) ctx.lineTo(el.corners[k].x, el.corners[k].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        if (el.showRes) {
          ctx.strokeStyle = c.error;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(el.px, el.py);
          ctx.lineTo(el.predX, el.predY);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.beginPath();
        ctx.arc(el.px, el.py, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = c.point;
        ctx.fill();
        ctx.strokeStyle = c.pointStroke;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Info (local cost/R² including bias)
    var m = data.length || 1, sumSq = 0, meanY = 0;
    for (var i = 0; i < data.length; i++) meanY += data[i].y;
    meanY /= m;
    var ssTot = 0, ssRes = 0;
    for (var i = 0; i < data.length; i++) {
      var e = w1 * data[i].x1 + w2 * data[i].x2 + b - data[i].y;
      sumSq += e * e;
      ssTot += (data[i].y - meanY) * (data[i].y - meanY);
      ssRes += e * e;
    }
    var J = sumSq / (2 * m);
    var R = ssTot < 1e-12 ? 1 : 1 - ssRes / ssTot;
    var bSign = b >= 0 ? ' + ' : ' - ';
    infoEl.textContent =
      '\u0177 = ' + w1.toFixed(2) + '\u00b7x\u2081 + ' + w2.toFixed(2) + '\u00b7x\u2082' + bSign + Math.abs(b).toFixed(2) +
      '  |  Cost J = ' + J.toFixed(4) +
      '  |  R\u00b2 = ' + R.toFixed(4);
  }

  // Mouse drag rotation
  canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    lastMX = e.clientX; lastMY = e.clientY;
  });
  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    azimuth = ((azimuth + (e.clientX - lastMX) * 0.5) % 360 + 360) % 360;
    elevation = LR2.clamp(elevation - (e.clientY - lastMY) * 0.3, 10, 75);
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
    elevation = LR2.clamp(elevation - (e.touches[0].clientY - lastMY) * 0.3, 10, 75);
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
    LR2.state.w1 = parseFloat(w1El.value) || 0;
    LR2.state.w2 = parseFloat(w2El.value) || 0;
    LR2.state.b = parseFloat(bEl.value) || 0;
    w1ValEl.textContent = LR2.state.w1.toFixed(2);
    w2ValEl.textContent = LR2.state.w2.toFixed(2);
    bValEl.textContent = LR2.state.b.toFixed(2);
    draw();
    LR2.notifyModelChange();
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
  residualsEl.addEventListener('change', function() { draw(); });

  // Data generation
  function doGenerate() {
    LR2.state.trueW1 = parseFloat(trueW1El.value) || 0;
    LR2.state.trueW2 = parseFloat(trueW2El.value) || 0;
    LR2.state.trueB = parseFloat(trueBEl.value) || 0;
    LR2.state.noise = Math.max(0, parseFloat(noiseEl.value) || 0);
    var n = LR2.clamp(parseInt(samplesEl.value) || 80, 20, 200);
    LR2.generateData(n);
    draw();
    LR2.notifyDataChange();
  }
  generateBtn.addEventListener('click', doGenerate);

  // Animated fit
  fitBtn.addEventListener('click', function() {
    if (fitAnimId) { cancelAnimationFrame(fitAnimId); fitAnimId = null; fitBtn.textContent = 'Fit'; return; }
    fitBtn.textContent = 'Stop';
    var remaining = 300;
    var data = LR2.state.data;
    function tick() {
      var m = data.length || 1;
      for (var i = 0; i < 5 && remaining > 0; i++, remaining--) {
        var dw1 = 0, dw2 = 0, db = 0;
        for (var j = 0; j < data.length; j++) {
          var p = data[j];
          var err = LR2.state.w1 * p.x1 + LR2.state.w2 * p.x2 + LR2.state.b - p.y;
          dw1 += err * p.x1;
          dw2 += err * p.x2;
          db += err;
        }
        LR2.state.w1 -= 0.04 * dw1 / m;
        LR2.state.w2 -= 0.04 * dw2 / m;
        LR2.state.b -= 0.04 * db / m;
      }
      LR2.state.w1 = LR2.clamp(LR2.state.w1, -6, 6);
      LR2.state.w2 = LR2.clamp(LR2.state.w2, -6, 6);
      LR2.state.b = LR2.clamp(LR2.state.b, -15, 15);
      w1El.value = LR2.state.w1.toFixed(2);
      w2El.value = LR2.state.w2.toFixed(2);
      bEl.value = LR2.state.b.toFixed(2);
      w1ValEl.textContent = LR2.state.w1.toFixed(2);
      w2ValEl.textContent = LR2.state.w2.toFixed(2);
      bValEl.textContent = LR2.state.b.toFixed(2);
      draw();
      LR2.notifyModelChange();
      if (remaining > 0) { fitAnimId = requestAnimationFrame(tick); }
      else { fitAnimId = null; fitBtn.textContent = 'Fit'; }
    }
    tick();
  });

  resetBtn.addEventListener('click', function() {
    if (fitAnimId) { cancelAnimationFrame(fitAnimId); fitAnimId = null; fitBtn.textContent = 'Fit'; }
    trueW1El.value = '2.8'; trueW2El.value = '-1.6'; trueBEl.value = '3';
    noiseEl.value = '0.6'; samplesEl.value = '80';
    w1El.value = '0'; w2El.value = '0'; bEl.value = '0';
    azEl.value = '35'; elEl.value = '30';
    azimuth = 35; elevation = 30;
    azValEl.textContent = '35\u00b0'; elValEl.textContent = '30\u00b0';
    w1ValEl.textContent = '0.00'; w2ValEl.textContent = '0.00'; bValEl.textContent = '0.00';
    LR2.state.w1 = 0; LR2.state.w2 = 0; LR2.state.b = 0;
    LR2.state.trueW1 = 2.8; LR2.state.trueW2 = -1.6; LR2.state.trueB = 3;
    LR2.state.noise = 0.6;
    LR2.generateData(80);
    draw();
    LR2.notifyDataChange();
    LR2.notifyModelChange();
  });

  [trueW1El, trueW2El, trueBEl, noiseEl, samplesEl].forEach(function(el) {
    el.addEventListener('change', doGenerate);
  });

  LR2.onThemeChange(draw);

  // Init
  LR2.generateData(80);
  draw();
})();
</script>

<!-- <div class="demo-try">
<strong>Try this:</strong> Set <code>w₁ = 0</code> and <code>w₂ = 0</code>, then drag only <code>b</code>. The plane slides straight up and down. Now set <code>b = 0</code> and drag <code>w₁</code> - the plane tilts along the x₁ axis. Each parameter controls one degree of freedom independently. Then click <strong>Fit</strong> and watch all three converge together.
</div> -->

Notice how the **red error lines** shrink when you find good weights and grow when the plane is tilted wrong. The cost $$J$$ is the average of those squared red line lengths exactly the same MSE from the first post, just extended to two features.

---

## The Cost Surface

For the visualizations below, we set $$b = 0$$ so the cost depends on only two variables, $$w_1$$ and $$w_2$$. This lets us plot the cost as a 3D surface and a 2D contour - something impossible with three free parameters (that would need a 4D plot). The bias slider above still works for exploring the full model; down here we focus on the weight landscape.

The cost function measures how bad our current weights are:

$$J(w_1,w_2) = \frac{1}{2m}\sum_{i=1}^{m}\left(w_1 x_1^{(i)} + w_2 x_2^{(i)} - y^{(i)}\right)^2$$

Every possible combination of $$w_1$$ and $$w_2$$ produces a different cost. Plotting all combinations gives us a **cost surface** - a 3D landscape where the horizontal axes are $$w_1$$ and $$w_2$$, and the vertical axis is the cost $$J$$.

For linear regression with MSE, this surface is always **bowl-shaped** (convex). There is a single lowest point - the **global minimum** - representing the optimal weights. No matter where you start on this surface, moving downhill always leads to that minimum.

The **contour plot** on the right is a top-down view of the same bowl, like a topographic map. The darkest regions have the highest cost, and the lightest center is the minimum.

<div class="demo-hint">
<strong>Interactive:</strong> The red dot shows your current <code>w₁, w₂</code> position from the sliders above. Drag the green dot on the contour plot to explore. Adjust the w₁/w₂ sliders above and watch both views update.
</div>

<div class="interactive-demo">
  <div class="lr2-grid">
    <div class="lr2-card">
      <div class="lr2-title">3D Cost Surface J(w₁, w₂)</div>
      <canvas id="lr2-surface"></canvas>
      <div class="demo-caption">Red dot = current weights</div>
    </div>
    <div class="lr2-card">
      <div class="lr2-title">Contour Plot (top-down view)</div>
      <canvas id="lr2-contour"></canvas>
      <div class="demo-caption">Drag the green dot to explore</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Surface Rotate:
      <input type="range" id="lr2-surf-az" min="0" max="360" step="1" value="35">
    </label>
    <label>Surface Tilt:
      <input type="range" id="lr2-surf-el" min="20" max="75" step="1" value="32">
    </label>
  </div>
  <div class="demo-info" id="lr2-cost-info">Cost and position update as you adjust w₁, w₂ above.</div>
</div>

<script>
(function() {
  var surfCanvas = document.getElementById('lr2-surface');
  var contCanvas = document.getElementById('lr2-contour');
  var surfAzEl = document.getElementById('lr2-surf-az');
  var surfElEl = document.getElementById('lr2-surf-el');
  var costInfoEl = document.getElementById('lr2-cost-info');

  var SW = 330, SH = 280, CW = 330, CH = 280;
  var wMin = -6, wMax = 6;
  var cPadL = 45, cPadR = 12, cPadT = 12, cPadB = 35;
  var contourDragging = false;

  function drawSurface() {
    var ctx = LR2.setupCanvas(surfCanvas, SW, SH);
    var c = LR2.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, SW, SH);

    var n = 28;
    var costs = [], minC = Infinity, maxC = -Infinity;
    for (var i = 0; i <= n; i++) {
      costs[i] = [];
      for (var j = 0; j <= n; j++) {
        var ww1 = wMin + (wMax - wMin) * i / n;
        var ww2 = wMin + (wMax - wMin) * j / n;
        var cv = LR2.cost(ww1, ww2);
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
            var nz = 1 - Math.sqrt(LR2.clamp(t, 0, 1));
            var p = proj(nx2, ny2, nz);
            corners.push(p);
            depth += ny2 * sinA * sinT + nz * cosT;
          }
        }
        var tMid = LR2.clamp((costs[x][y] - minC) / (maxC - minC), 0, 1);
        quads.push({ corners: [corners[0], corners[1], corners[3], corners[2]], depth: depth / 4, t: tMid });
      }
    }
    quads.sort(function(a, b) { return a.depth - b.depth; });
    quads.forEach(function(q) {
      var t = q.t;
      var r = Math.round(40 + t * 210);
      var g = Math.round(170 - t * 120);
      var b = Math.round(230 - t * 190);
      ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
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
    var curT = LR2.clamp((LR2.cost(LR2.state.w1, LR2.state.w2) - minC) / (maxC - minC), 0, 1);
    var curNz = 1 - Math.sqrt(curT);
    var px = (LR2.state.w1 - wMin) / (wMax - wMin) * 2 - 1;
    var py = (LR2.state.w2 - wMin) / (wMax - wMin) * 2 - 1;
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

  function drawContour() {
    var ctx = LR2.setupCanvas(contCanvas, CW, CH);
    var c = LR2.getColors();
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
        var cv = LR2.cost(ww1, ww2);
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
      ctx.fillText(v.toFixed(0), cPadL + plotW * i / 4, cPadT + plotH + 16);
    }
    ctx.textAlign = 'right';
    for (var j = 0; j <= 4; j++) {
      var v = wMax - (wMax - wMin) * j / 4;
      ctx.fillText(v.toFixed(0), cPadL - 4, cPadT + plotH * j / 4 + 4);
    }
    ctx.textAlign = 'center';
    ctx.fillText('w\u2081', cPadL + plotW / 2, CH - 2);
    ctx.save();
    ctx.translate(10, cPadT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('w\u2082', 0, 0);
    ctx.restore();

    // Green dot (draggable)
    var dotX = cPadL + (LR2.state.w1 - wMin) / (wMax - wMin) * plotW;
    var dotY = cPadT + plotH - (LR2.state.w2 - wMin) / (wMax - wMin) * plotH;
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
      'w\u2081 = ' + LR2.state.w1.toFixed(2) +
      ', w\u2082 = ' + LR2.state.w2.toFixed(2) +
      ', Cost J = ' + LR2.cost(LR2.state.w1, LR2.state.w2).toFixed(4);
  }

  // Contour drag
  function getMP(e) {
    var r = contCanvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (CW / r.width), y: (e.clientY - r.top) * (CH / r.height) };
  }
  function updateFromContour(mx, my) {
    var plotW = CW - cPadL - cPadR, plotH = CH - cPadT - cPadB;
    var nw1 = wMin + LR2.clamp((mx - cPadL) / plotW, 0, 1) * (wMax - wMin);
    var nw2 = wMin + LR2.clamp((cPadT + plotH - my) / plotH, 0, 1) * (wMax - wMin);
    LR2.state.w1 = nw1;
    LR2.state.w2 = nw2;
    // Sync sliders in demo 1
    var w1El = document.getElementById('lr2-w1');
    var w2El = document.getElementById('lr2-w2');
    if (w1El) { w1El.value = nw1.toFixed(2); document.getElementById('lr2-w1-val').textContent = nw1.toFixed(2); }
    if (w2El) { w2El.value = nw2.toFixed(2); document.getElementById('lr2-w2-val').textContent = nw2.toFixed(2); }
    LR2.notifyModelChange();
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
  LR2.onThemeChange(drawAll);
  LR2.onDataChange(drawAll);
  LR2.onModelChange(drawAll);

  drawAll();
})();
</script>

The bowl shape is key. No matter where you start on this surface, if you always step downhill, you reach the single lowest point. This is exactly what gradient descent does.

---

## Training with Gradient Descent

The update rules for two weights are a natural extension of the single-weight case:

$$w_1 := w_1 - \alpha \cdot \frac{\partial J}{\partial w_1} \qquad w_2 := w_2 - \alpha \cdot \frac{\partial J}{\partial w_2}$$

where the partial derivatives are:

$$\frac{\partial J}{\partial w_1} = \frac{1}{m}\sum_{i=1}^{m}\left(\hat{y}^{(i)} - y^{(i)}\right) \cdot x_1^{(i)} \qquad \frac{\partial J}{\partial w_2} = \frac{1}{m}\sum_{i=1}^{m}\left(\hat{y}^{(i)} - y^{(i)}\right) \cdot x_2^{(i)}$$

Each derivative tells us: "if I slightly increase this weight, how does the cost change?" We step in the **opposite** direction (minus sign) to reduce the cost. The **learning rate** $$\alpha$$ controls how big each step is.

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>Step</strong> for one gradient descent iteration, or <strong>Run</strong> to animate. The left panel shows the optimization path on the contour. The right panel shows the prediction plane converging in 3D. The chart below shows cost decreasing over iterations.
</div>

<div class="interactive-demo">
  <div class="lr2-grid">
    <div class="lr2-card">
      <div class="lr2-title">Gradient Descent Path</div>
      <canvas id="lr2-gd-contour"></canvas>
      <div class="demo-caption">Green path on the cost contour</div>
    </div>
    <div class="lr2-card">
      <div class="lr2-title">Prediction Plane Converging</div>
      <canvas id="lr2-gd-3d"></canvas>
      <div class="demo-caption">Plane tilts to fit the data</div>
    </div>
  </div>
  <canvas id="lr2-gd-loss" style="width:100%; max-width:680px;"></canvas>
  <div class="demo-caption">Cost J(w₁, w₂) vs. iteration number</div>
  <div class="demo-controls">
    <label>Learning rate α:
      <input type="range" id="lr2-gd-lr" min="0.005" max="0.15" step="0.005" value="0.04">
      <span class="demo-value" id="lr2-gd-lr-val">0.040</span>
    </label>
    <button id="lr2-gd-step">Step</button>
    <button id="lr2-gd-run">Run</button>
    <button id="lr2-gd-reset">Reset</button>
  </div>
  <div class="demo-info" id="lr2-gd-info">Iteration: 0 | w₁ = 0.00, w₂ = 0.00, Cost = -</div>
</div>

<script>
(function() {
  var contCanvas = document.getElementById('lr2-gd-contour');
  var scatter3d = document.getElementById('lr2-gd-3d');
  var lossCanvas = document.getElementById('lr2-gd-loss');
  var lrSlider = document.getElementById('lr2-gd-lr');
  var lrValEl = document.getElementById('lr2-gd-lr-val');
  var stepBtn = document.getElementById('lr2-gd-step');
  var runBtn = document.getElementById('lr2-gd-run');
  var resetBtn = document.getElementById('lr2-gd-reset');
  var infoEl = document.getElementById('lr2-gd-info');

  var CW = 330, CH = 280, SW = 330, SH = 280, LW = 680, LH = 150;
  var cPadL = 45, cPadR = 12, cPadT = 12, cPadB = 35;
  var wMin = -6, wMax = 6;

  var gdW1, gdW2, iteration, path, lossHistory, running, animId;
  var costGrid = [], maxCost = 0, gridRes = 60;

  function init() {
    gdW1 = 0; gdW2 = 0; iteration = 0;
    path = [{ w1: 0, w2: 0 }];
    lossHistory = [LR2.cost(0, 0)];
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
        var cv = LR2.cost(ww1, ww2);
        costGrid[i][j] = cv;
        if (cv > maxCost) maxCost = cv;
      }
    }
  }

  function getLR() { return parseFloat(lrSlider.value) || 0.04; }

  function step() {
    var lr = getLR();
    var g = LR2.gradients(gdW1, gdW2);
    gdW1 -= lr * g.dw1;
    gdW2 -= lr * g.dw2;
    iteration++;
    path.push({ w1: gdW1, w2: gdW2 });
    lossHistory.push(LR2.cost(gdW1, gdW2));
  }

  function drawContour() {
    var ctx = LR2.setupCanvas(contCanvas, CW, CH);
    var c = LR2.getColors();
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
      ctx.fillText(v.toFixed(0), cPadL + plotW * i / 4, cPadT + plotH + 16);
    }
    ctx.textAlign = 'right';
    for (var j = 0; j <= 4; j++) {
      var v = wMax - (wMax - wMin) * j / 4;
      ctx.fillText(v.toFixed(0), cPadL - 4, cPadT + plotH * j / 4 + 4);
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
    var ctx = LR2.setupCanvas(scatter3d, SW, SH);
    var c = LR2.getColors();
    var data = LR2.state.data;
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, SW, SH);

    if (!data.length) return;

    // Y range from data only (fixed, so points don't shift during training)
    var dataYMin = Infinity, dataYMax = -Infinity;
    for (var i = 0; i < data.length; i++) {
      if (data[i].y < dataYMin) dataYMin = data[i].y;
      if (data[i].y > dataYMax) dataYMax = data[i].y;
    }
    var yPad = (dataYMax - dataYMin) * 0.2 || 2;
    var yMin = dataYMin - yPad;
    var yMax = dataYMax + yPad;

    function normX(v) { return v / 3; }
    function normY(v) { return ((v - yMin) / (yMax - yMin)) * 2 - 1; }

    var az = 35 * Math.PI / 180, el = 30 * Math.PI / 180;
    var cosAz = Math.cos(az), sinAz = Math.sin(az);
    var cosEl = Math.cos(el), sinEl = Math.sin(el);
    var cx2 = SW / 2, cy2 = SH / 2 + 18, sc = 95;

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
    lbl = project(-1.05, -1, 1.15); ctx.fillText('y', lbl.x, lbl.y);

    // Drawables
    var drawables = [];
    var planeN = 8;
    for (var i = 0; i < planeN; i++) {
      for (var j = 0; j < planeN; j++) {
        var corners = [], depthSum = 0;
        for (var di = 0; di <= 1; di++) {
          for (var dj = 0; dj <= 1; dj++) {
            var gx1 = -3 + 6 * (i + di) / planeN;
            var gx2 = -3 + 6 * (j + dj) / planeN;
            var gz = gdW1 * gx1 + gdW2 * gx2;
            var nz = LR2.clamp(normY(gz), -1.5, 1.5);
            var p = project(normX(gx1), normX(gx2), nz);
            corners.push(p); depthSum += p.depth;
          }
        }
        drawables.push({ type: 'quad', corners: [corners[0], corners[1], corners[3], corners[2]], depth: depthSum / 4 });
      }
    }
    for (var i = 0; i < data.length; i++) {
      var pt = data[i];
      var pred = gdW1 * pt.x1 + gdW2 * pt.x2;
      var pD = project(normX(pt.x1), normX(pt.x2), LR2.clamp(normY(pt.y), -1.5, 1.5));
      var pP = project(normX(pt.x1), normX(pt.x2), LR2.clamp(normY(pred), -1.5, 1.5));
      drawables.push({ type: 'point', px: pD.x, py: pD.y, predX: pP.x, predY: pP.y, depth: pD.depth });
    }
    drawables.sort(function(a, b) { return a.depth - b.depth; });
    drawables.forEach(function(el) {
      if (el.type === 'quad') {
        ctx.fillStyle = c.plane; ctx.strokeStyle = c.planeLine; ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(el.corners[0].x, el.corners[0].y);
        for (var k = 1; k < 4; k++) ctx.lineTo(el.corners[k].x, el.corners[k].y);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      } else {
        ctx.strokeStyle = c.error; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(el.px, el.py); ctx.lineTo(el.predX, el.predY); ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(el.px, el.py, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = c.point; ctx.fill();
      }
    });
  }

  function drawLoss() {
    var ctx = LR2.setupCanvas(lossCanvas, LW, LH);
    var c = LR2.getColors();
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
    ctx.fillText(maxL.toFixed(1), lPadL - 4, lPadT + 10);
    ctx.fillText(minL.toFixed(1), lPadL - 4, lPadT + ph);

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
    var cost = LR2.cost(gdW1, gdW2);
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

  LR2.onThemeChange(function() { buildGrid(); drawAll(); });
  LR2.onDataChange(function() {
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
<strong>Try this:</strong> Click <strong>Step</strong> 10 times slowly to see individual gradient descent steps. Watch how the green dot takes larger steps when far from the minimum and smaller steps as it approaches. Then click <strong>Run</strong> to see rapid convergence. Try different learning rates - too high and the path overshoots; too low and convergence is painfully slow.
</div>

After running gradient descent for enough iterations, the green dot settles at the bowl's minimum, and the plane in the right panel fits snugly through the data. The convergence curve shows the cost rapidly decreasing at first and then flattening as it approaches the minimum - the same pattern we saw in the single-feature case.

---

## What to Learn From This

- With **one feature**, the model is a **line**. With **two features**, it becomes a **plane**. With $$n$$ features, it becomes a **hyperplane** in $$(n+1)$$-dimensional space - the same idea, just harder to visualize.

- Each weight $$w_k$$ independently controls how much feature $$x_k$$ contributes to the prediction. Setting $$w_k = 0$$ means "ignore feature $$k$$."

- The **cost surface** $$J(w_1, w_2)$$ is still bowl-shaped (convex), guaranteeing a single global minimum. This holds for any number of features in linear regression.

- **Gradient descent** generalizes naturally: each weight gets its own partial derivative, and all weights update simultaneously each iteration.

- We kept $$b = 0$$ intentionally for clarity. Adding a bias $$b$$ adds one more dimension to the cost surface but changes nothing about how the algorithm works.
