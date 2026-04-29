---
layout: post
title: "K-Nearest Neighbors from Scratch"
author: bharathikannan
categories: [Machine learning]
tags: [ml-part-2]
series: false
hidden: true
description: "Explore KNN classification interactively - paint decision boundaries, tune K from 1 to 30, compare distance metrics, and visualize the curse of dimensionality, all in your browser."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /knn/
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
.demo-controls select {
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
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
.knn-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.9rem;
}
.knn-table th, .knn-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}
.knn-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
.knn-table td {
  background: var(--bg-primary);
}
.dim-trio {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}
@media (max-width: 640px) {
  .dim-trio { grid-template-columns: 1fr; }
}
.dim-trio-item {
  text-align: center;
}
.dim-trio-item canvas {
  width: 100%;
}
.dim-trio-item .dim-label {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
</style>

<script>
window.KNN = (function() {
  var K = {};

  K.getColors = function() { return window.Viz.colors(); };

  K.setupCanvas = function(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  K.observeTheme = function(cb) {
    var obs = new MutationObserver(function() { cb(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb);
  };

  // Distance functions
  K.euclidean = function(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  K.manhattan = function(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  };

  K.chebyshev = function(a, b) {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  };

  K.getDistFn = function(name) {
    if (name === 'manhattan') return K.manhattan;
    if (name === 'chebyshev') return K.chebyshev;
    return K.euclidean;
  };

  // KNN classification predict
  K.predict = function(pts, qx, qy, k, distFn, weighted) {
    if (!pts.length || k < 1) return { label: 0, neighbors: [] };
    distFn = distFn || K.euclidean;
    var q = { x: qx, y: qy };
    var dists = [];
    for (var i = 0; i < pts.length; i++) {
      dists.push({ idx: i, d: distFn(pts[i], q) });
    }
    dists.sort(function(a, b) { return a.d - b.d; });
    var kn = Math.min(k, dists.length);
    var neighbors = dists.slice(0, kn);
    var votes = {};
    for (var i = 0; i < kn; i++) {
      var lbl = pts[neighbors[i].idx].label;
      var w = 1;
      if (weighted && neighbors[i].d > 1e-10) {
        w = 1.0 / neighbors[i].d;
      } else if (weighted && neighbors[i].d <= 1e-10) {
        w = 1e10;
      }
      votes[lbl] = (votes[lbl] || 0) + w;
    }
    var best = null, bestV = -1;
    for (var lbl in votes) {
      if (votes[lbl] > bestV) { bestV = votes[lbl]; best = parseInt(lbl); }
    }
    return { label: best, neighbors: neighbors };
  };

  // KNN regression predict
  K.predictRegression = function(pts, qx, k, distFn, weighted) {
    if (!pts.length || k < 1) return { value: 0, neighbors: [] };
    distFn = distFn || K.euclidean;
    var q = { x: qx, y: 0 };
    var dists = [];
    for (var i = 0; i < pts.length; i++) {
      dists.push({ idx: i, d: Math.abs(pts[i].x - qx) });
    }
    dists.sort(function(a, b) { return a.d - b.d; });
    var kn = Math.min(k, dists.length);
    var neighbors = dists.slice(0, kn);
    var sum = 0, wsum = 0;
    for (var i = 0; i < kn; i++) {
      var w = 1;
      if (weighted && neighbors[i].d > 1e-10) {
        w = 1.0 / neighbors[i].d;
      } else if (weighted && neighbors[i].d <= 1e-10) {
        w = 1e10;
      }
      sum += pts[neighbors[i].idx].y * w;
      wsum += w;
    }
    return { value: sum / wsum, neighbors: neighbors };
  };

  // Data generators
  K.genBlobs = function(n) {
    var pts = [];
    var centers = [{ x: -1.5, y: -1.5 }, { x: 1.5, y: 1.5 }];
    for (var i = 0; i < n; i++) {
      var ci = Math.random() < 0.5 ? 0 : 1;
      var c = centers[ci];
      pts.push({
        x: c.x + (Math.random() - 0.5) * 2.5,
        y: c.y + (Math.random() - 0.5) * 2.5,
        label: ci
      });
    }
    return pts;
  };

  K.genMoons = function(n) {
    var pts = [];
    var half = Math.floor(n / 2);
    for (var i = 0; i < half; i++) {
      var t = Math.PI * i / half;
      pts.push({
        x: Math.cos(t) * 2 + (Math.random() - 0.5) * 0.5,
        y: Math.sin(t) * 2 + (Math.random() - 0.5) * 0.5,
        label: 0
      });
    }
    for (var i = 0; i < n - half; i++) {
      var t = Math.PI * i / (n - half);
      pts.push({
        x: 1 - Math.cos(t) * 2 + (Math.random() - 0.5) * 0.5,
        y: 0.5 - Math.sin(t) * 2 + (Math.random() - 0.5) * 0.5,
        label: 1
      });
    }
    return pts;
  };

  K.genCircles = function(n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var angle = Math.random() * Math.PI * 2;
      var inner = Math.random() < 0.5;
      var r = inner ? Math.random() * 1.2 : 2.0 + Math.random() * 1.0;
      pts.push({
        x: Math.cos(angle) * r + (Math.random() - 0.5) * 0.2,
        y: Math.sin(angle) * r + (Math.random() - 0.5) * 0.2,
        label: inner ? 0 : 1
      });
    }
    return pts;
  };

  K.genXOR = function(n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var x = Math.random() * 6 - 3;
      var y = Math.random() * 6 - 3;
      var label = (x * y > 0) ? 0 : 1;
      pts.push({ x: x, y: y, label: label });
    }
    return pts;
  };

  K.genSpiral = function(n) {
    var pts = [];
    var half = Math.floor(n / 2);
    for (var i = 0; i < half; i++) {
      var t = 1.5 * Math.PI * i / half + 0.5;
      var r = t * 0.5;
      pts.push({
        x: r * Math.cos(t) + (Math.random() - 0.5) * 0.4,
        y: r * Math.sin(t) + (Math.random() - 0.5) * 0.4,
        label: 0
      });
    }
    for (var i = 0; i < n - half; i++) {
      var t = 1.5 * Math.PI * i / (n - half) + 0.5;
      var r = t * 0.5;
      pts.push({
        x: -r * Math.cos(t) + (Math.random() - 0.5) * 0.4,
        y: -r * Math.sin(t) + (Math.random() - 0.5) * 0.4,
        label: 1
      });
    }
    return pts;
  };

  // Draw axes
  K.drawAxes = function(ctx, W, H, c, xR, yR) {
    var pad = 45;
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    var nx = 8, ny = 8;
    for (var i = 0; i <= nx; i++) {
      var x = pad + (W - 2 * pad) * i / nx;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H - pad); ctx.stroke();
    }
    for (var i = 0; i <= ny; i++) {
      var y = pad + (H - 2 * pad) * i / ny;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var i = 0; i <= 4; i++) {
      var val = xR[0] + (xR[1] - xR[0]) * i / 4;
      var x = pad + (W - 2 * pad) * i / 4;
      ctx.fillText(val.toFixed(1), x, H - pad + 15);
    }
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var val = yR[0] + (yR[1] - yR[0]) * i / 4;
      var y = H - pad - (H - 2 * pad) * i / 4;
      ctx.fillText(val.toFixed(1), pad - 8, y + 4);
    }
    return pad;
  };

  K.toCanvas = function(px, py, W, H, pad, xR, yR) {
    return {
      x: pad + (px - xR[0]) / (xR[1] - xR[0]) * (W - 2 * pad),
      y: H - pad - (py - yR[0]) / (yR[1] - yR[0]) * (H - 2 * pad)
    };
  };

  K.fromCanvas = function(cx, cy, W, H, pad, xR, yR) {
    return {
      x: xR[0] + (cx - pad) / (W - 2 * pad) * (xR[1] - xR[0]),
      y: yR[0] + (H - pad - cy) / (H - 2 * pad) * (yR[1] - yR[0])
    };
  };

  K.drawPoints = function(ctx, pts, W, H, pad, xR, yR, c) {
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var cp = K.toCanvas(p.x, p.y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 0 ? c.class0 : c.class1;
      ctx.fill();
      ctx.strokeStyle = p.label === 0 ? c.class0 : c.class1;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  // Draw decision boundary as pixel-level coloring
  K.drawBoundary = function(ctx, pts, W, H, pad, xR, yR, c, k, distFn, weighted, res) {
    res = res || 2;
    var imgW = W - 2 * pad, imgH = H - 2 * pad;
    var imgData = ctx.createImageData(imgW, imgH);
    var c0 = c.class0RGB;
    var c1 = c.class1RGB;
    for (var py = 0; py < imgH; py += res) {
      for (var px = 0; px < imgW; px += res) {
        var coord = K.fromCanvas(pad + px, pad + py, W, H, pad, xR, yR);
        var pred = K.predict(pts, coord.x, coord.y, k, distFn, weighted);
        var col = pred.label === 0 ? c0 : c1;
        for (var dy = 0; dy < res && py + dy < imgH; dy++) {
          for (var dx = 0; dx < res && px + dx < imgW; dx++) {
            var idx = ((py + dy) * imgW + (px + dx)) * 4;
            imgData.data[idx] = col[0];
            imgData.data[idx + 1] = col[1];
            imgData.data[idx + 2] = col[2];
            imgData.data[idx + 3] = 30;
          }
        }
      }
    }
    ctx.putImageData(imgData, pad, pad);
  };

  // Compute training accuracy
  K.accuracy = function(pts, k, distFn, weighted) {
    if (pts.length < 2) return 0;
    var correct = 0;
    for (var i = 0; i < pts.length; i++) {
      // Leave-one-out: exclude current point
      var others = [];
      for (var j = 0; j < pts.length; j++) {
        if (j !== i) others.push(pts[j]);
      }
      var pred = K.predict(others, pts[i].x, pts[i].y, k, distFn, weighted);
      if (pred.label === pts[i].label) correct++;
    }
    return correct / pts.length;
  };

  return K;
})();
</script>

Most machine learning algorithms learn a model during training and then discard the training data. K-Nearest Neighbors (KNN) does something radically different: it keeps all the training data and makes predictions by looking at the K closest examples to a new query point. This "lazy learning" approach is beautifully simple. There are no weights to optimize, no gradients to compute, no loss functions to minimize. The training data is the model. Yet despite this simplicity, KNN can produce remarkably complex decision boundaries that adapt to any shape in the data. Let us build KNN from scratch and develop deep intuition for how it works.

---

## 1. How KNN Works

The KNN algorithm has exactly three steps:

1. **Store**: keep all training data (that is the entire "training" phase)
2. **Find**: locate the K nearest neighbors to the query point
3. **Vote**: for classification, the majority class among K neighbors wins. For regression, take the average of their values

The distance between two points $$\mathbf{x}^{(a)}$$ and $$\mathbf{x}^{(b)}$$ in $$d$$ dimensions is typically the Euclidean distance:

$$d(\mathbf{x}^{(a)}, \mathbf{x}^{(b)}) = \sqrt{\sum_{i=1}^{d}(x_i^{(a)} - x_i^{(b)})^2}$$

For $$K$$ neighbors, the predicted class is:

$$\hat{y} = \text{mode}(y^{(1)}, y^{(2)}, \ldots, y^{(K)})$$

where $$y^{(1)}, \ldots, y^{(K)}$$ are the labels of the K nearest neighbors. Click anywhere on the canvas below to place a query point. The K nearest neighbors are highlighted with connecting lines, and the majority vote decides the class. Use the K slider to change how many neighbors are considered.

<div class="interactive-demo">
  <canvas id="knn-how-canvas"></canvas>
  <div class="demo-controls">
    <label>K: <input type="range" id="knn-how-k" min="1" max="15" value="3"> <span class="demo-value" id="knn-how-k-val">3</span></label>
    <button id="knn-how-gen">Generate</button>
    <button id="knn-how-clear">Clear Query</button>
  </div>
  <div class="demo-info" id="knn-how-info">Click on the canvas to place a query point</div>
  <div class="demo-caption">Settings: 40-point Gaussian blobs, Euclidean distance, K=3, uniform voting.</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('knn-how-canvas');
  var kSlider = document.getElementById('knn-how-k');
  var kVal = document.getElementById('knn-how-k-val');
  var genBtn = document.getElementById('knn-how-gen');
  var clearBtn = document.getElementById('knn-how-clear');
  var infoEl = document.getElementById('knn-how-info');

  var W = 680, H = 460;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];
  var query = null;

  function generate() {
    pts = KNN.genBlobs(40);
    query = null;
    draw();
  }

  function draw() {
    var ctx = KNN.setupCanvas(canvas, W, H);
    var c = KNN.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    KNN.drawAxes(ctx, W, H, c, xR, yR);

    var k = parseInt(kSlider.value);
    kVal.textContent = k;

    // Draw points
    KNN.drawPoints(ctx, pts, W, H, pad, xR, yR, c);

    if (query) {
      var pred = KNN.predict(pts, query.x, query.y, k, KNN.euclidean, false);
      var neighbors = pred.neighbors;
      var qc = KNN.toCanvas(query.x, query.y, W, H, pad, xR, yR);

      // Draw connecting lines to neighbors
      for (var i = 0; i < neighbors.length; i++) {
        var np = pts[neighbors[i].idx];
        var nc = KNN.toCanvas(np.x, np.y, W, H, pad, xR, yR);
        ctx.strokeStyle = c.highlight;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(qc.x, qc.y);
        ctx.lineTo(nc.x, nc.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Highlight neighbor
        ctx.beginPath();
        ctx.arc(nc.x, nc.y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = c.highlight;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Draw query point
      ctx.beginPath();
      ctx.arc(qc.x, qc.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = c.query;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw predicted label indicator
      ctx.beginPath();
      ctx.arc(qc.x, qc.y - 18, 6, 0, Math.PI * 2);
      ctx.fillStyle = pred.label === 0 ? c.class0 : c.class1;
      ctx.fill();

      // Count votes
      var v0 = 0, v1 = 0;
      for (var i = 0; i < neighbors.length; i++) {
        if (pts[neighbors[i].idx].label === 0) v0++; else v1++;
      }
      infoEl.textContent = 'K=' + k + ' | Votes: Class A=' + v0 + ', Class B=' + v1 +
        ' | Prediction: Class ' + (pred.label === 0 ? 'A' : 'B');
    } else {
      infoEl.textContent = 'Click on the canvas to place a query point';
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (W / rect.width);
    var sy = (e.clientY - rect.top) * (H / rect.height);
    var coord = KNN.fromCanvas(sx, sy, W, H, pad, xR, yR);
    if (coord.x < xR[0] || coord.x > xR[1] || coord.y < yR[0] || coord.y > yR[1]) return;
    query = coord;
    draw();
  });

  kSlider.addEventListener('input', draw);
  genBtn.addEventListener('click', generate);
  clearBtn.addEventListener('click', function() { query = null; draw(); });
  KNN.observeTheme(draw);
  generate();
})();
</script>

Notice how the prediction can change as you move K. With K=1, the prediction always matches the single closest point. With larger K, the vote of the neighborhood matters, and the prediction becomes more stable.

---

## 2. Decision Boundary Canvas

The decision boundary is the line (or curve) where the predicted class changes. For KNN, this boundary is determined entirely by the data points and the value of K. Left-click to add Class A points and shift+click (or right-click) to add Class B points; the boundary updates in real time with pixel-level coloring.

<div class="interactive-demo">
  <canvas id="knn-boundary-canvas"></canvas>
  <div class="demo-controls">
    <label>K: <input type="range" id="knn-boundary-k" min="1" max="20" value="5"> <span class="demo-value" id="knn-boundary-k-val">5</span></label>
    <button id="knn-boundary-gen">Generate</button>
    <button id="knn-boundary-clear">Clear</button>
  </div>
  <div class="demo-info" id="knn-boundary-info">Add points to see the boundary</div>
  <div class="demo-caption">Settings: empty canvas, Euclidean distance, K=5, uniform voting; click to paint points.</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('knn-boundary-canvas');
  var kSlider = document.getElementById('knn-boundary-k');
  var kVal = document.getElementById('knn-boundary-k-val');
  var genBtn = document.getElementById('knn-boundary-gen');
  var clearBtn = document.getElementById('knn-boundary-clear');
  var infoEl = document.getElementById('knn-boundary-info');

  var W = 680, H = 460;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];

  function draw() {
    var ctx = KNN.setupCanvas(canvas, W, H);
    var c = KNN.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    KNN.drawAxes(ctx, W, H, c, xR, yR);

    var k = parseInt(kSlider.value);
    kVal.textContent = k;

    var hasA = false, hasB = false;
    for (var i = 0; i < pts.length; i++) {
      if (pts[i].label === 0) hasA = true;
      if (pts[i].label === 1) hasB = true;
    }

    if (hasA && hasB && pts.length >= 2) {
      KNN.drawBoundary(ctx, pts, W, H, pad, xR, yR, c, k, KNN.euclidean, false, 3);
      var acc = KNN.accuracy(pts, k, KNN.euclidean, false);
      infoEl.textContent = pts.length + ' points | K=' + k + ' | LOO accuracy=' + (acc * 100).toFixed(1) + '%';
    } else {
      infoEl.textContent = pts.length + ' points (need both classes)';
    }

    KNN.drawPoints(ctx, pts, W, H, pad, xR, yR, c);
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (W / rect.width);
    var sy = (e.clientY - rect.top) * (H / rect.height);
    var coord = KNN.fromCanvas(sx, sy, W, H, pad, xR, yR);
    if (coord.x < xR[0] || coord.x > xR[1] || coord.y < yR[0] || coord.y > yR[1]) return;
    var label = e.shiftKey ? 1 : 0;
    pts.push({ x: coord.x, y: coord.y, label: label });
    draw();
  });

  canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (W / rect.width);
    var sy = (e.clientY - rect.top) * (H / rect.height);
    var coord = KNN.fromCanvas(sx, sy, W, H, pad, xR, yR);
    if (coord.x < xR[0] || coord.x > xR[1] || coord.y < yR[0] || coord.y > yR[1]) return;
    pts.push({ x: coord.x, y: coord.y, label: 1 });
    draw();
  });

  kSlider.addEventListener('input', draw);
  genBtn.addEventListener('click', function() { pts = KNN.genBlobs(50); draw(); });
  clearBtn.addEventListener('click', function() { pts = []; draw(); });
  KNN.observeTheme(draw);
  draw();
})();
</script>

Try placing a few Class A points on the left and Class B points on the right, then add a single Class A point deep inside Class B territory. Watch how it creates an island of Class A in the boundary; this is KNN memorizing that individual point.

---

## 3. The K Slider: Overfitting vs. Underfitting

The choice of K is the single most important decision in KNN. It controls the bias-variance tradeoff:

- **Small K** (e.g. K=1): the boundary is jagged and follows every point, including noise. This is overfitting (low bias, high variance).
- **Large K** (e.g. K=30): the boundary is very smooth, potentially ignoring meaningful patterns. This is underfitting (high bias, low variance).

Drag the K slider and watch the decision boundary transform from jagged to smooth. The training accuracy drops as K increases because the model becomes less sensitive to individual points.

<div class="interactive-demo">
  <canvas id="knn-kslider-canvas"></canvas>
  <div class="demo-controls">
    <label>K: <input type="range" id="knn-kslider-k" min="1" max="30" value="1" style="width:300px"> <span class="demo-value" id="knn-kslider-k-val" style="min-width:6rem">K=1 (overfit)</span></label>
    <button id="knn-kslider-gen">New Data</button>
  </div>
  <div class="demo-info" id="knn-kslider-info"></div>
  <div class="demo-caption">Settings: 80-point moons dataset, Euclidean distance, K=1; slide K from 1 to 30.</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('knn-kslider-canvas');
  var kSlider = document.getElementById('knn-kslider-k');
  var kVal = document.getElementById('knn-kslider-k-val');
  var genBtn = document.getElementById('knn-kslider-gen');
  var infoEl = document.getElementById('knn-kslider-info');

  var W = 680, H = 460;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];

  function generate() {
    pts = KNN.genMoons(80);
    draw();
  }

  function draw() {
    var ctx = KNN.setupCanvas(canvas, W, H);
    var c = KNN.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    KNN.drawAxes(ctx, W, H, c, xR, yR);

    var k = parseInt(kSlider.value);
    var desc = k <= 3 ? ' (overfit)' : (k >= 20 ? ' (underfit)' : '');
    kVal.textContent = 'K=' + k + desc;

    if (pts.length >= 2) {
      KNN.drawBoundary(ctx, pts, W, H, pad, xR, yR, c, k, KNN.euclidean, false, 3);
      var acc = KNN.accuracy(pts, k, KNN.euclidean, false);
      infoEl.textContent = 'LOO accuracy=' + (acc * 100).toFixed(1) + '% | ' +
        (k === 1 ? 'Every point creates its own region - high variance!' :
         k >= 20 ? 'Very smooth boundary - may miss real patterns' :
         'Moderate smoothing');
    }

    KNN.drawPoints(ctx, pts, W, H, pad, xR, yR, c);
  }

  kSlider.addEventListener('input', draw);
  genBtn.addEventListener('click', generate);
  KNN.observeTheme(draw);
  generate();
})();
</script>

Notice the accuracy paradox: with K=1, the leave-one-out accuracy is often lower than with moderate K values. The model fits the training data perfectly (every point is classified by its nearest non-self neighbor) but is fragile to noise. The sweet spot is usually somewhere in the middle.

---

## 4. Distance Metrics: Euclidean vs Manhattan vs Chebyshev

The choice of distance metric fundamentally changes what "close" means, and therefore changes the shape of neighborhoods and decision boundaries.

- **Euclidean distance** (L2): $$d = \sqrt{(x_1-x_2)^2 + (y_1-y_2)^2}$$ — circular neighborhoods.
- **Manhattan distance** (L1): $$d = |x_1-x_2| + |y_1-y_2|$$ — diamond-shaped neighborhoods.
- **Chebyshev distance** (L-infinity): $$d = \max(|x_1-x_2|, |y_1-y_2|)$$ — square neighborhoods.

Switch between metrics below and watch the decision boundary change shape. With Euclidean, boundaries curve smoothly. With Manhattan, they follow axis-aligned diamond patterns. With Chebyshev, they form boxy squares.

<div class="interactive-demo">
  <canvas id="knn-dist-canvas"></canvas>
  <div class="demo-controls">
    <label>K: <input type="range" id="knn-dist-k" min="1" max="15" value="5"> <span class="demo-value" id="knn-dist-k-val">5</span></label>
    <label>Metric:
      <select id="knn-dist-metric">
        <option value="euclidean">Euclidean (L2)</option>
        <option value="manhattan">Manhattan (L1)</option>
        <option value="chebyshev">Chebyshev (L-inf)</option>
      </select>
    </label>
    <button id="knn-dist-gen">New Data</button>
  </div>
  <div class="demo-info" id="knn-dist-info"></div>
  <div class="demo-caption">Settings: 50-point blobs, K=5, Euclidean distance; click to place a query point and see the equidistant contour.</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('knn-dist-canvas');
  var kSlider = document.getElementById('knn-dist-k');
  var kVal = document.getElementById('knn-dist-k-val');
  var metricSel = document.getElementById('knn-dist-metric');
  var genBtn = document.getElementById('knn-dist-gen');
  var infoEl = document.getElementById('knn-dist-info');

  var W = 680, H = 460;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];
  var query = null;

  function generate() {
    pts = KNN.genBlobs(50);
    query = null;
    draw();
  }

  function draw() {
    var ctx = KNN.setupCanvas(canvas, W, H);
    var c = KNN.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    KNN.drawAxes(ctx, W, H, c, xR, yR);

    var k = parseInt(kSlider.value);
    kVal.textContent = k;
    var metric = metricSel.value;
    var distFn = KNN.getDistFn(metric);

    if (pts.length >= 2) {
      KNN.drawBoundary(ctx, pts, W, H, pad, xR, yR, c, k, distFn, false, 3);

      // If query, draw equidistant contour
      if (query) {
        var qc = KNN.toCanvas(query.x, query.y, W, H, pad, xR, yR);
        var pred = KNN.predict(pts, query.x, query.y, k, distFn, false);
        var maxDist = pred.neighbors.length > 0 ? pred.neighbors[pred.neighbors.length - 1].d : 1;

        // Draw equidistant contour
        ctx.strokeStyle = c.highlight;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        if (metric === 'euclidean') {
          // Circle
          var rPx = maxDist / (xR[1] - xR[0]) * (W - 2 * pad);
          ctx.beginPath();
          ctx.arc(qc.x, qc.y, rPx, 0, Math.PI * 2);
          ctx.stroke();
        } else if (metric === 'manhattan') {
          // Diamond
          var rx = maxDist / (xR[1] - xR[0]) * (W - 2 * pad);
          var ry = maxDist / (yR[1] - yR[0]) * (H - 2 * pad);
          ctx.beginPath();
          ctx.moveTo(qc.x, qc.y - ry);
          ctx.lineTo(qc.x + rx, qc.y);
          ctx.lineTo(qc.x, qc.y + ry);
          ctx.lineTo(qc.x - rx, qc.y);
          ctx.closePath();
          ctx.stroke();
        } else {
          // Square
          var rx = maxDist / (xR[1] - xR[0]) * (W - 2 * pad);
          var ry = maxDist / (yR[1] - yR[0]) * (H - 2 * pad);
          ctx.strokeRect(qc.x - rx, qc.y - ry, rx * 2, ry * 2);
        }
        ctx.setLineDash([]);

        // Draw neighbor lines
        for (var i = 0; i < pred.neighbors.length; i++) {
          var np = pts[pred.neighbors[i].idx];
          var nc = KNN.toCanvas(np.x, np.y, W, H, pad, xR, yR);
          ctx.strokeStyle = c.highlight;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(qc.x, qc.y);
          ctx.lineTo(nc.x, nc.y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(nc.x, nc.y, 9, 0, Math.PI * 2);
          ctx.strokeStyle = c.highlight;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Query point
        ctx.beginPath();
        ctx.arc(qc.x, qc.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = c.query;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      var acc = KNN.accuracy(pts, k, distFn, false);
      var metricNames = { euclidean: 'Euclidean (circles)', manhattan: 'Manhattan (diamonds)', chebyshev: 'Chebyshev (squares)' };
      infoEl.textContent = metric.charAt(0).toUpperCase() + metric.slice(1) + ' | K=' + k +
        ' | LOO accuracy=' + (acc * 100).toFixed(1) + '% | Neighborhoods: ' + metricNames[metric];
    }

    KNN.drawPoints(ctx, pts, W, H, pad, xR, yR, c);
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (W / rect.width);
    var sy = (e.clientY - rect.top) * (H / rect.height);
    query = KNN.fromCanvas(sx, sy, W, H, pad, xR, yR);
    draw();
  });

  kSlider.addEventListener('input', draw);
  metricSel.addEventListener('change', draw);
  genBtn.addEventListener('click', generate);
  KNN.observeTheme(draw);
  generate();
})();
</script>

Click on the canvas to see the neighborhood shape for each metric. The dashed outline shows the region that encloses the K nearest neighbors. Euclidean treats all directions equally (isotropic), Manhattan favors axis-aligned directions (useful when features are on different scales), and Chebyshev only cares about the maximum difference in any single dimension.

---

## 5. Weighted KNN: Closer Neighbors Matter More

Standard KNN gives every neighbor an equal vote, regardless of how close or far it is within the K neighbors. Distance-weighted KNN gives each neighbor a vote proportional to the inverse of its distance:

$$w_i = \frac{1}{d(\mathbf{x}_{query}, \mathbf{x}_i)}$$

This means very close neighbors have a much stronger influence than distant ones, which often improves accuracy near decision boundaries. Toggle between uniform and distance-weighted voting in the side-by-side demo and watch how the boundary becomes smoother and more accurate near class transitions.

<div class="interactive-demo">
  <div class="demo-split">
    <div>
      <canvas id="knn-uniform-canvas"></canvas>
      <div class="demo-caption">Uniform voting (1 vote each)</div>
    </div>
    <div>
      <canvas id="knn-weighted-canvas"></canvas>
      <div class="demo-caption">Distance-weighted voting (1/d)</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>K: <input type="range" id="knn-weight-k" min="1" max="20" value="7"> <span class="demo-value" id="knn-weight-k-val">7</span></label>
    <button id="knn-weight-gen">New Data</button>
  </div>
  <div class="demo-info" id="knn-weight-info"></div>
  <div class="demo-caption">Settings: 60-point moons, Euclidean distance, K=7; left = uniform votes, right = inverse-distance weights.</div>
</div>

<script>
(function() {
  var canvasU = document.getElementById('knn-uniform-canvas');
  var canvasW = document.getElementById('knn-weighted-canvas');
  var kSlider = document.getElementById('knn-weight-k');
  var kVal = document.getElementById('knn-weight-k-val');
  var genBtn = document.getElementById('knn-weight-gen');
  var infoEl = document.getElementById('knn-weight-info');

  var W = 330, H = 330;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 35;
  var pts = [];

  function generate() {
    pts = KNN.genMoons(60);
    draw();
  }

  function drawOne(canvas, weighted, label) {
    var ctx = KNN.setupCanvas(canvas, W, H);
    var c = KNN.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var k = parseInt(kSlider.value);
    kVal.textContent = k;

    // Simplified axes
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);

    if (pts.length >= 2) {
      // Draw boundary
      var imgW = W - 2 * pad, imgH = H - 2 * pad;
      var imgData = ctx.createImageData(imgW, imgH);
      var c0 = c.class0RGB;
      var c1 = c.class1RGB;
      var res = 3;
      for (var py = 0; py < imgH; py += res) {
        for (var px = 0; px < imgW; px += res) {
          var coord = KNN.fromCanvas(pad + px, pad + py, W, H, pad, xR, yR);
          var pred = KNN.predict(pts, coord.x, coord.y, k, KNN.euclidean, weighted);
          var col = pred.label === 0 ? c0 : c1;
          for (var dy = 0; dy < res && py + dy < imgH; dy++) {
            for (var dx = 0; dx < res && px + dx < imgW; dx++) {
              var idx = ((py + dy) * imgW + (px + dx)) * 4;
              imgData.data[idx] = col[0];
              imgData.data[idx + 1] = col[1];
              imgData.data[idx + 2] = col[2];
              imgData.data[idx + 3] = 30;
            }
          }
        }
      }
      ctx.putImageData(imgData, pad, pad);
    }

    // Draw points
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var cp = KNN.toCanvas(p.x, p.y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 0 ? c.class0 : c.class1;
      ctx.fill();
    }

    return KNN.accuracy(pts, k, KNN.euclidean, weighted);
  }

  function draw() {
    var accU = drawOne(canvasU, false);
    var accW = drawOne(canvasW, true);
    var k = parseInt(kSlider.value);
    infoEl.textContent = 'K=' + k + ' | Uniform LOO accuracy=' + (accU * 100).toFixed(1) +
      '% | Weighted LOO accuracy=' + (accW * 100).toFixed(1) + '%';
  }

  kSlider.addEventListener('input', draw);
  genBtn.addEventListener('click', generate);
  KNN.observeTheme(draw);
  generate();
})();
</script>

The difference is most visible at larger K values. With uniform voting and K=15, distant neighbors can outvote a very close neighbor. With weighted voting, the closest neighbor always has the strongest say, making the boundary more locally adaptive.

---

## 6. KNN for Regression

KNN is not limited to classification. For regression, instead of taking a majority vote, we average the target values of the K nearest neighbors:

$$\hat{y} = \frac{1}{K}\sum_{i=1}^{K} y^{(i)} \quad \text{(uniform)}$$

$$\hat{y} = \frac{\sum_{i=1}^{K} w_i \, y^{(i)}}{\sum_{i=1}^{K} w_i} \quad \text{(weighted, } w_i = 1/d_i\text{)}$$

Adjust K below to see how the regression curve changes from stepped (K=1) to smooth (large K). Toggle weighting for smoother interpolation.

<div class="interactive-demo">
  <canvas id="knn-reg-canvas"></canvas>
  <div class="demo-controls">
    <label>K: <input type="range" id="knn-reg-k" min="1" max="20" value="1"> <span class="demo-value" id="knn-reg-k-val">1</span></label>
    <label><input type="checkbox" id="knn-reg-weighted"> Weighted</label>
    <button id="knn-reg-gen">New Data</button>
  </div>
  <div class="demo-info" id="knn-reg-info"></div>
  <div class="demo-caption">Settings: 40 noisy samples of sin(x), K=1, uniform weights; dashed line shows the true function.</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('knn-reg-canvas');
  var kSlider = document.getElementById('knn-reg-k');
  var kVal = document.getElementById('knn-reg-k-val');
  var weightedCb = document.getElementById('knn-reg-weighted');
  var genBtn = document.getElementById('knn-reg-gen');
  var infoEl = document.getElementById('knn-reg-info');

  var W = 680, H = 400;
  var xR = [-4, 4], yR = [-3, 3];
  var pad = 45;
  var pts = [];

  function generate() {
    pts = [];
    for (var i = 0; i < 40; i++) {
      var x = Math.random() * 8 - 4;
      var y = Math.sin(x) * 1.5 + (Math.random() - 0.5) * 1.0;
      pts.push({ x: x, y: y });
    }
    draw();
  }

  function draw() {
    var ctx = KNN.setupCanvas(canvas, W, H);
    var c = KNN.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    KNN.drawAxes(ctx, W, H, c, xR, yR);

    var k = parseInt(kSlider.value);
    kVal.textContent = k;
    var weighted = weightedCb.checked;

    if (pts.length < 1) return;

    // Draw true function
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (var px = pad; px <= W - pad; px++) {
      var coord = KNN.fromCanvas(px, H / 2, W, H, pad, xR, yR);
      var trueY = Math.sin(coord.x) * 1.5;
      var cp = KNN.toCanvas(coord.x, trueY, W, H, pad, xR, yR);
      if (px === pad) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw KNN regression curve
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    var mse = 0;
    for (var px = pad; px <= W - pad; px++) {
      var coord = KNN.fromCanvas(px, H / 2, W, H, pad, xR, yR);
      var pred = KNN.predictRegression(pts, coord.x, k, KNN.euclidean, weighted);
      var cp = KNN.toCanvas(coord.x, pred.value, W, H, pad, xR, yR);
      if (px === pad) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();

    // Compute MSE on training data
    for (var i = 0; i < pts.length; i++) {
      var pred = KNN.predictRegression(pts, pts[i].x, k, KNN.euclidean, weighted);
      var err = pred.value - pts[i].y;
      mse += err * err;
    }
    mse /= pts.length;

    // Draw data points
    for (var i = 0; i < pts.length; i++) {
      var cp = KNN.toCanvas(pts[i].x, pts[i].y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = c.class0;
      ctx.fill();
      ctx.strokeStyle = c.bg;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    infoEl.textContent = 'K=' + k + (weighted ? ' (weighted)' : ' (uniform)') +
      ' | Training MSE=' + mse.toFixed(3) +
      ' | Dashed = true function sin(x)';
  }

  kSlider.addEventListener('input', draw);
  weightedCb.addEventListener('change', draw);
  genBtn.addEventListener('click', generate);
  KNN.observeTheme(draw);
  generate();
})();
</script>

With K=1, the regression curve passes through (or very near) every training point, creating a stepped, noisy prediction. As K increases, the curve smooths out. With distance-weighted KNN, the curve remains smoother while still being locally adaptive. Compare the blue prediction curve to the gray dashed true function to see how different K values trade off fit vs. smoothness.

---

## 7. The Curse of Dimensionality

KNN seems perfect in 2D, but it has a fundamental problem in high dimensions called the curse of dimensionality. As the number of dimensions grows, data becomes sparse (to maintain the same density, the number of points needed grows exponentially with dimension), distances become similar (all points end up roughly the same distance from each other, making "nearest" meaningless), and volume grows explosively (the fraction of the space you need to cover to capture K neighbors grows exponentially). To capture a fixed fraction $$f$$ of data in $$d$$ dimensions with a hypercube, the side length must be:

$$\ell = f^{1/d}$$

For example, to capture 10% of data: in 1D you need $$\ell = 0.1$$, in 2D $$\ell = 0.32$$, in 10D $$\ell = 0.79$$, in 100D $$\ell = 0.977$$. You need nearly the entire space. The visualization below shows how the ratio of the nearest neighbor distance to the farthest neighbor distance approaches 1 as dimensions increase. When all distances are similar, KNN cannot distinguish neighbors from non-neighbors.

<div class="interactive-demo">
  <canvas id="knn-curse-canvas"></canvas>
  <div class="demo-controls">
    <label>Points: <input type="range" id="knn-curse-n" min="20" max="200" value="100" step="10"> <span class="demo-value" id="knn-curse-n-val">100</span></label>
    <button id="knn-curse-run">Regenerate</button>
  </div>
  <div class="demo-info" id="knn-curse-info">Distance ratio = nearest / farthest distance to a query point</div>
  <div class="demo-caption">Settings: 100 random points in unit hypercubes from 1D to 1000D, averaged over 10 trials per dimension.</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('knn-curse-canvas');
  var nSlider = document.getElementById('knn-curse-n');
  var nVal = document.getElementById('knn-curse-n-val');
  var runBtn = document.getElementById('knn-curse-run');
  var infoEl = document.getElementById('knn-curse-info');

  var W = 680, H = 400;
  var pad = 55;

  function run() {
    var ctx = KNN.setupCanvas(canvas, W, H);
    var c = KNN.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var n = parseInt(nSlider.value);
    nVal.textContent = n;

    var dims = [1, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000];
    var ratios = [];
    var trials = 10;

    for (var di = 0; di < dims.length; di++) {
      var d = dims[di];
      var avgRatio = 0;
      for (var t = 0; t < trials; t++) {
        // Generate random points in d-dimensional unit cube
        var points = [];
        for (var i = 0; i < n; i++) {
          var pt = [];
          for (var j = 0; j < d; j++) pt.push(Math.random());
          points.push(pt);
        }
        // Query point at center
        var query = [];
        for (var j = 0; j < d; j++) query.push(0.5);

        // Compute all distances
        var dists = [];
        for (var i = 0; i < n; i++) {
          var dist = 0;
          for (var j = 0; j < d; j++) {
            var diff = points[i][j] - query[j];
            dist += diff * diff;
          }
          dists.push(Math.sqrt(dist));
        }
        dists.sort(function(a, b) { return a - b; });

        var minD = dists[0];
        var maxD = dists[dists.length - 1];
        if (maxD > 1e-10) avgRatio += minD / maxD;
      }
      ratios.push(avgRatio / trials);
    }

    // Draw chart
    var pw = W - 2 * pad, ph = H - 2 * pad;

    // Grid
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) {
      var y = pad + ph * i / 5;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, pw, ph);

    // Y-axis labels
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    for (var i = 0; i <= 5; i++) {
      var val = 1 - i / 5;
      ctx.fillText(val.toFixed(1), pad - 8, pad + ph * i / 5 + 4);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    for (var i = 0; i < dims.length; i++) {
      var x = pad + pw * i / (dims.length - 1);
      ctx.save();
      ctx.translate(x, H - pad + 15);
      ctx.fillText(dims[i] + 'D', 0, 0);
      ctx.restore();
    }

    // Axis titles
    ctx.fillStyle = c.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Number of Dimensions', W / 2, H - 5);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('min dist / max dist', 0, 0);
    ctx.restore();

    // Plot line
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i < dims.length; i++) {
      var x = pad + pw * i / (dims.length - 1);
      var y = pad + ph * (1 - ratios[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Plot dots
    for (var i = 0; i < dims.length; i++) {
      var x = pad + pw * i / (dims.length - 1);
      var y = pad + ph * (1 - ratios[i]);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = c.accent;
      ctx.fill();
      ctx.strokeStyle = c.bg;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw the "danger zone" - ratio > 0.9
    ctx.fillStyle = c.class1Light;
    var dangerY = pad + ph * (1 - 0.9);
    ctx.fillRect(pad, pad, pw, dangerY - pad);
    ctx.fillStyle = c.class1;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Danger zone: distances nearly equal', pad + 5, pad + 14);

    infoEl.textContent = 'With ' + n + ' points: at 1D ratio=' + ratios[0].toFixed(3) +
      ', at 100D ratio=' + ratios[7].toFixed(3) + ', at 1000D ratio=' + ratios[10].toFixed(3);
  }

  nSlider.addEventListener('input', run);
  runBtn.addEventListener('click', run);
  KNN.observeTheme(run);
  run();
})();
</script>

As dimensions increase, the ratio of nearest-to-farthest distance climbs toward 1.0, meaning all points are essentially equidistant from the query. In the red "danger zone" (ratio > 0.9), KNN is effectively choosing neighbors at random. This is why feature selection and dimensionality reduction (like PCA) are critical preprocessing steps for KNN.

---

## 8. Interactive Classification Playground

Now let us put it all together. Choose a dataset, configure K, the distance metric, and weighting, and watch the full decision boundary with accuracy statistics. Select a preset dataset, tune all hyperparameters, and observe how the decision boundary changes. Try to find the best K for each dataset.

<div class="interactive-demo">
  <canvas id="knn-play-canvas"></canvas>
  <div class="demo-controls">
    <label>Dataset:
      <select id="knn-play-dataset">
        <option value="blobs">Blobs</option>
        <option value="moons" selected>Moons</option>
        <option value="circles">Circles</option>
        <option value="xor">XOR</option>
        <option value="spiral">Spiral</option>
      </select>
    </label>
    <label>K: <input type="range" id="knn-play-k" min="1" max="30" value="5"> <span class="demo-value" id="knn-play-k-val">5</span></label>
    <label>Metric:
      <select id="knn-play-metric">
        <option value="euclidean">Euclidean</option>
        <option value="manhattan">Manhattan</option>
        <option value="chebyshev">Chebyshev</option>
      </select>
    </label>
    <label><input type="checkbox" id="knn-play-weighted"> Weighted</label>
    <button id="knn-play-gen">Regenerate</button>
  </div>
  <div class="demo-info" id="knn-play-info"></div>
  <div class="demo-caption">Settings: moons dataset, Euclidean distance, K=5, uniform voting; switch dataset, K, metric, or weighting to explore.</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('knn-play-canvas');
  var datasetSel = document.getElementById('knn-play-dataset');
  var kSlider = document.getElementById('knn-play-k');
  var kVal = document.getElementById('knn-play-k-val');
  var metricSel = document.getElementById('knn-play-metric');
  var weightedCb = document.getElementById('knn-play-weighted');
  var genBtn = document.getElementById('knn-play-gen');
  var infoEl = document.getElementById('knn-play-info');

  var W = 680, H = 460;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];

  function generate() {
    var ds = datasetSel.value;
    if (ds === 'blobs') pts = KNN.genBlobs(80);
    else if (ds === 'moons') pts = KNN.genMoons(80);
    else if (ds === 'circles') pts = KNN.genCircles(80);
    else if (ds === 'xor') pts = KNN.genXOR(80);
    else if (ds === 'spiral') pts = KNN.genSpiral(100);
    draw();
  }

  function draw() {
    var ctx = KNN.setupCanvas(canvas, W, H);
    var c = KNN.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    KNN.drawAxes(ctx, W, H, c, xR, yR);

    var k = parseInt(kSlider.value);
    kVal.textContent = k;
    var metric = metricSel.value;
    var distFn = KNN.getDistFn(metric);
    var weighted = weightedCb.checked;

    if (pts.length >= 2) {
      KNN.drawBoundary(ctx, pts, W, H, pad, xR, yR, c, k, distFn, weighted, 3);
      var acc = KNN.accuracy(pts, k, distFn, weighted);
      infoEl.textContent = datasetSel.value + ' | K=' + k + ' | ' + metric +
        (weighted ? ' (weighted)' : ' (uniform)') +
        ' | LOO accuracy=' + (acc * 100).toFixed(1) + '%';
    }

    KNN.drawPoints(ctx, pts, W, H, pad, xR, yR, c);
  }

  datasetSel.addEventListener('change', generate);
  kSlider.addEventListener('input', draw);
  metricSel.addEventListener('change', draw);
  weightedCb.addEventListener('change', draw);
  genBtn.addEventListener('click', generate);
  KNN.observeTheme(draw);
  generate();
})();
</script>

Some observations to explore:

- **Blobs**: linearly separable; even K=1 works well, but K=5-10 gives the cleanest boundary
- **Moons**: need moderate K to capture the curved boundary without overfitting
- **Circles**: KNN handles them naturally since the boundary is based on local neighborhoods
- **XOR**: requires a non-linear boundary that KNN provides effortlessly
- **Spiral**: the hardest; only small K values can trace the spiral arms, but they also overfit to noise

---

## 9. Summary

<table class="knn-table">
<tr><th>Concept</th><th>Key Idea</th><th>Formula / Detail</th></tr>
<tr><td>KNN Classification</td><td>Majority vote of K nearest neighbors</td><td>$$\hat{y} = \text{mode}(y^{(1)}, \ldots, y^{(K)})$$</td></tr>
<tr><td>KNN Regression</td><td>Average of K nearest neighbors</td><td>$$\hat{y} = \frac{1}{K}\sum_{i=1}^{K} y^{(i)}$$</td></tr>
<tr><td>Euclidean Distance</td><td>Straight-line distance (circular neighborhoods)</td><td>$$\sqrt{\sum(x_i - x_i')^2}$$</td></tr>
<tr><td>Manhattan Distance</td><td>Axis-aligned distance (diamond neighborhoods)</td><td>$$\sum|x_i - x_i'|$$</td></tr>
<tr><td>Chebyshev Distance</td><td>Maximum coordinate difference (square neighborhoods)</td><td>$$\max|x_i - x_i'|$$</td></tr>
<tr><td>Weighted KNN</td><td>Closer neighbors get more vote weight</td><td>$$w_i = 1 / d_i$$</td></tr>
<tr><td>K=1 (overfit)</td><td>Jagged boundary, memorizes noise</td><td>Low bias, high variance</td></tr>
<tr><td>K=N (underfit)</td><td>Predicts majority class everywhere</td><td>High bias, low variance</td></tr>
<tr><td>Curse of dimensionality</td><td>Distances become meaningless in high-D</td><td>Neighborhood side length: $$f^{1/d}$$</td></tr>
</table>

### When to Use KNN

- **Good for**: small-to-medium datasets, non-linear boundaries, multi-class problems, when you want a simple baseline, recommendation systems
- **Less ideal for**: large datasets (prediction is slow because it must compute distance to every training point), high-dimensional data, features on very different scales (must normalize first)
- **Key hyperparameters**: K (number of neighbors), distance metric, weighting scheme, feature scaling

### Computational Complexity

| Phase | Time | Space |
|-------|------|-------|
| Training | $$O(1)$$ - just store data | $$O(nd)$$ |
| Prediction | $$O(nd)$$ per query | $$O(1)$$ |

where $$n$$ is the number of training points and $$d$$ is the number of dimensions. KNN's prediction cost is its main drawback. For large datasets, KD-trees or ball trees reduce this to $$O(d \log n)$$ on average.

### What is Next

In the next chapter, we will explore Decision Trees, an algorithm that recursively partitions the feature space into axis-aligned rectangles. Unlike KNN, decision trees learn an explicit model during training, making predictions extremely fast. They are also the building blocks for ensemble methods like Random Forests and Gradient Boosting.

---
