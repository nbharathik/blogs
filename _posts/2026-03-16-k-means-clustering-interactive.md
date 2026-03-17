---
layout: post
title: "K-Means Clustering from Scratch: An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Build K-Means clustering from scratch with interactive visualizations. Watch centroids move step-by-step, explore K selection with the elbow method, compare initialization strategies, and see Voronoi regions form - all in your browser."
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
</style>

<script>
window.KM = (function() {
  var darkColors = {
    bg: '#1a1b26', text: '#c0caf5',
    grid: 'rgba(192,202,245,0.08)', axis: 'rgba(192,202,245,0.18)',
    clusters: ['#f7768e','#7aa2f7','#9ece6a','#ff9e64','#bb9af7','#2ac3de','#e0af68','#73daca'],
    centroidStroke: '#c0caf5'
  };
  var lightColors = {
    bg: '#ffffff', text: '#1e293b',
    grid: 'rgba(30,41,59,0.06)', axis: 'rgba(30,41,59,0.15)',
    clusters: ['#e63946','#2563eb','#16a34a','#ea580c','#7c3aed','#0891b2','#ca8a04','#059669'],
    centroidStroke: '#1e293b'
  };

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ||
      (window.getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim().match(/^#[0-3]/) !== null);
  }

  function getColors() {
    return isDark() ? darkColors : lightColors;
  }

  function setupCanvas(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: w, h: h, dpr: dpr };
  }

  function observeTheme(cb) {
    var obs = new MutationObserver(function() { cb(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return obs;
  }

  function dist(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function distSq(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function randGauss() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function generateClusters(k, perCluster, w, h, margin, spread) {
    margin = margin || 80;
    spread = spread || 30;
    var points = [];
    var centers = [];
    for (var i = 0; i < k; i++) {
      var cx = margin + Math.random() * (w - 2 * margin);
      var cy = margin + Math.random() * (h - 2 * margin);
      centers.push({ x: cx, y: cy });
      for (var j = 0; j < perCluster; j++) {
        var px = cx + randGauss() * spread;
        var py = cy + randGauss() * spread;
        px = Math.max(5, Math.min(w - 5, px));
        py = Math.max(5, Math.min(h - 5, py));
        points.push({ x: px, y: py });
      }
    }
    return { points: points, trueCenters: centers };
  }

  function generateMoons(n, w, h) {
    var points = [];
    var half = Math.floor(n / 2);
    var cx = w / 2, cy = h / 2;
    var r = Math.min(w, h) * 0.3;
    for (var i = 0; i < half; i++) {
      var angle = Math.PI * i / half;
      points.push({
        x: cx + r * Math.cos(angle) - r * 0.5 + randGauss() * 8,
        y: cy - r * Math.sin(angle) + randGauss() * 8,
        trueLabel: 0
      });
    }
    for (var i = 0; i < half; i++) {
      var angle = Math.PI + Math.PI * i / half;
      points.push({
        x: cx + r * Math.cos(angle) + r * 0.5 + randGauss() * 8,
        y: cy - r * Math.sin(angle) + r * 0.4 + randGauss() * 8,
        trueLabel: 1
      });
    }
    return points;
  }

  function generateCircles(n, w, h) {
    var points = [];
    var half = Math.floor(n / 2);
    var cx = w / 2, cy = h / 2;
    var rInner = Math.min(w, h) * 0.12;
    var rOuter = Math.min(w, h) * 0.32;
    for (var i = 0; i < half; i++) {
      var angle = Math.random() * 2 * Math.PI;
      var r = rInner + randGauss() * 8;
      points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), trueLabel: 0 });
    }
    for (var i = 0; i < half; i++) {
      var angle = Math.random() * 2 * Math.PI;
      var r = rOuter + randGauss() * 8;
      points.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), trueLabel: 1 });
    }
    return points;
  }

  function kmeans(points, k, maxIter, initMethod) {
    maxIter = maxIter || 100;
    initMethod = initMethod || 'random';
    var centroids = [];
    if (initMethod === 'kmpp') {
      var idx = Math.floor(Math.random() * points.length);
      centroids.push({ x: points[idx].x, y: points[idx].y });
      for (var c = 1; c < k; c++) {
        var dists = [];
        var total = 0;
        for (var i = 0; i < points.length; i++) {
          var minD = Infinity;
          for (var j = 0; j < centroids.length; j++) {
            var d = distSq(points[i], centroids[j]);
            if (d < minD) minD = d;
          }
          dists.push(minD);
          total += minD;
        }
        var r = Math.random() * total;
        var cum = 0;
        for (var i = 0; i < dists.length; i++) {
          cum += dists[i];
          if (cum >= r) {
            centroids.push({ x: points[i].x, y: points[i].y });
            break;
          }
        }
      }
    } else {
      var indices = [];
      while (indices.length < k) {
        var idx = Math.floor(Math.random() * points.length);
        if (indices.indexOf(idx) === -1) indices.push(idx);
      }
      for (var i = 0; i < indices.length; i++) {
        centroids.push({ x: points[indices[i]].x, y: points[indices[i]].y });
      }
    }
    var assignments = new Array(points.length);
    var history = [centroids.map(function(c) { return { x: c.x, y: c.y }; })];
    for (var iter = 0; iter < maxIter; iter++) {
      for (var i = 0; i < points.length; i++) {
        var minD = Infinity, minK = 0;
        for (var j = 0; j < k; j++) {
          var d = distSq(points[i], centroids[j]);
          if (d < minD) { minD = d; minK = j; }
        }
        assignments[i] = minK;
      }
      var newCentroids = [];
      var converged = true;
      for (var j = 0; j < k; j++) {
        var sx = 0, sy = 0, cnt = 0;
        for (var i = 0; i < points.length; i++) {
          if (assignments[i] === j) { sx += points[i].x; sy += points[i].y; cnt++; }
        }
        if (cnt > 0) {
          var nx = sx / cnt, ny = sy / cnt;
          if (Math.abs(nx - centroids[j].x) > 0.01 || Math.abs(ny - centroids[j].y) > 0.01) converged = false;
          newCentroids.push({ x: nx, y: ny });
        } else {
          newCentroids.push({ x: centroids[j].x, y: centroids[j].y });
        }
      }
      centroids = newCentroids;
      history.push(centroids.map(function(c) { return { x: c.x, y: c.y }; }));
      if (converged) break;
    }
    var inertia = 0;
    for (var i = 0; i < points.length; i++) {
      inertia += distSq(points[i], centroids[assignments[i]]);
    }
    return { centroids: centroids, assignments: assignments, inertia: inertia, history: history, iterations: history.length - 1 };
  }

  function computeInertia(points, centroids, assignments) {
    var inertia = 0;
    for (var i = 0; i < points.length; i++) {
      inertia += distSq(points[i], centroids[assignments[i]]);
    }
    return inertia;
  }

  function assign(points, centroids) {
    var assignments = [];
    for (var i = 0; i < points.length; i++) {
      var minD = Infinity, minK = 0;
      for (var j = 0; j < centroids.length; j++) {
        var d = distSq(points[i], centroids[j]);
        if (d < minD) { minD = d; minK = j; }
      }
      assignments.push(minK);
    }
    return assignments;
  }

  function drawPoint(ctx, x, y, r, color, alpha) {
    ctx.globalAlpha = alpha || 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawCentroid(ctx, x, y, size, color, strokeColor) {
    ctx.strokeStyle = strokeColor || '#fff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - size, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.moveTo(x + size, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - size, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.moveTo(x + size, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.stroke();
  }

  function drawDiamond(ctx, x, y, size, fillColor, strokeColor) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  return {
    getColors: getColors,
    setupCanvas: setupCanvas,
    observeTheme: observeTheme,
    dist: dist,
    distSq: distSq,
    randGauss: randGauss,
    generateClusters: generateClusters,
    generateMoons: generateMoons,
    generateCircles: generateCircles,
    kmeans: kmeans,
    assign: assign,
    computeInertia: computeInertia,
    drawPoint: drawPoint,
    drawCentroid: drawCentroid,
    drawDiamond: drawDiamond
  };
})();
</script>

## Introduction: Discovering Structure Without Labels

So far in this series, we have worked with **supervised learning** -- we had labeled data and trained models to predict those labels. Linear regression predicted continuous values; logistic regression predicted categories. In both cases, we told the model the right answer during training.

But what if we have no labels at all? What if we just have a pile of data and we want to find **structure** in it?

This is **unsupervised learning**, and **clustering** is its most intuitive form. The goal is simple: group similar data points together. No labels needed. The algorithm discovers the groups on its own.

**K-Means** is the most widely used clustering algorithm. It is fast, simple, and often the first thing you should try. Applications include:

- **Customer segmentation** -- grouping customers by purchasing behavior
- **Image compression** -- reducing colors by clustering pixel values
- **Document organization** -- grouping articles by topic
- **Anomaly detection** -- points far from all cluster centers might be outliers
- **Feature engineering** -- cluster membership as a new feature for supervised models

Let us build it from scratch.

---

## The K-Means Algorithm

K-Means partitions N data points into K clusters. Each cluster is defined by its **centroid** (center point). The algorithm alternates between two steps until convergence:

### Step 1: Assignment

Assign each point to the nearest centroid:

$$c^{(i)} = \arg\min_k \|x^{(i)} - \mu_k\|^2$$

where $$x^{(i)}$$ is the $$i$$-th data point and $$\mu_k$$ is the $$k$$-th centroid.

### Step 2: Update

Move each centroid to the mean of all points assigned to it:

$$\mu_k = \frac{1}{|C_k|}\sum_{x \in C_k} x$$

where $$C_k$$ is the set of points assigned to cluster $$k$$.

### The Objective

K-Means minimizes the **inertia** (Within-Cluster Sum of Squares):

$$J = \sum_{k=1}^{K}\sum_{x \in C_k} \|x - \mu_k\|^2$$

Each iteration of assign-then-update is guaranteed to decrease $$J$$ (or leave it unchanged). The algorithm converges when assignments no longer change.

The full procedure:

1. **Initialize** K centroids (randomly or with a smarter strategy)
2. **Assign** each point to the nearest centroid
3. **Update** each centroid to the mean of its assigned points
4. **Repeat** steps 2--3 until convergence

Let us watch this happen live.

---

## Step-by-Step K-Means

This demo runs K-Means on pre-generated clustered data. Use **Step** to advance one iteration at a time, or **Play** to animate. Watch the centroids (diamond markers) migrate toward the cluster centers while points change color to match their nearest centroid.

<div class="interactive-demo" id="demo-stepwise">
  <canvas id="canvas-stepwise"></canvas>
  <div class="demo-controls">
    <button id="btn-step-play">Play</button>
    <button id="btn-step-step">Step</button>
    <button id="btn-step-reset">Reset</button>
    <label>K: <input type="range" id="slider-step-k" min="2" max="6" value="3"><span class="demo-value" id="val-step-k">3</span></label>
  </div>
  <div class="demo-info" id="info-stepwise">Click Play or Step to begin</div>
</div>

<div class="demo-hint">Tip: Try different values of K. With K=2 on 3-cluster data, watch how the algorithm merges two natural groups. With K=5, see how it splits one group into sub-clusters.</div>

<script>
(function() {
  var W = 680, H = 400;
  var canvas = document.getElementById('canvas-stepwise');
  var s = KM.setupCanvas(canvas, W, H);
  var ctx = s.ctx;
  var btnPlay = document.getElementById('btn-step-play');
  var btnStep = document.getElementById('btn-step-step');
  var btnReset = document.getElementById('btn-step-reset');
  var sliderK = document.getElementById('slider-step-k');
  var valK = document.getElementById('val-step-k');
  var info = document.getElementById('info-stepwise');

  var points, centroids, assignments, K, iteration, converged, playing, animFrame;
  var prevCentroids, animProgress, animating;

  function init() {
    K = parseInt(sliderK.value);
    valK.textContent = K;
    var data = KM.generateClusters(3, 20, W, H, 80, 40);
    points = data.points;
    centroids = null;
    assignments = null;
    iteration = 0;
    converged = false;
    playing = false;
    animating = false;
    prevCentroids = null;
    animProgress = 1;
    btnPlay.textContent = 'Play';
    info.textContent = 'Click Play or Step to begin';
    draw();
  }

  function initCentroids() {
    centroids = [];
    var indices = [];
    while (indices.length < K) {
      var idx = Math.floor(Math.random() * points.length);
      if (indices.indexOf(idx) === -1) indices.push(idx);
    }
    for (var i = 0; i < indices.length; i++) {
      centroids.push({ x: points[indices[i]].x, y: points[indices[i]].y });
    }
    assignments = new Array(points.length);
    for (var i = 0; i < points.length; i++) assignments[i] = -1;
  }

  function stepAssign() {
    for (var i = 0; i < points.length; i++) {
      var minD = Infinity, minK = 0;
      for (var j = 0; j < K; j++) {
        var d = KM.distSq(points[i], centroids[j]);
        if (d < minD) { minD = d; minK = j; }
      }
      assignments[i] = minK;
    }
  }

  function stepUpdate() {
    prevCentroids = centroids.map(function(c) { return { x: c.x, y: c.y }; });
    var newCentroids = [];
    converged = true;
    for (var j = 0; j < K; j++) {
      var sx = 0, sy = 0, cnt = 0;
      for (var i = 0; i < points.length; i++) {
        if (assignments[i] === j) { sx += points[i].x; sy += points[i].y; cnt++; }
      }
      if (cnt > 0) {
        var nx = sx / cnt, ny = sy / cnt;
        if (Math.abs(nx - centroids[j].x) > 0.5 || Math.abs(ny - centroids[j].y) > 0.5) converged = false;
        newCentroids.push({ x: nx, y: ny });
      } else {
        newCentroids.push({ x: centroids[j].x, y: centroids[j].y });
      }
    }
    centroids = newCentroids;
  }

  function doStep() {
    if (converged) {
      if (playing) { playing = false; btnPlay.textContent = 'Play'; }
      return;
    }
    if (!centroids) {
      initCentroids();
      stepAssign();
      iteration = 1;
      animProgress = 1;
      updateInfo();
      draw();
      return;
    }
    stepUpdate();
    iteration++;
    animProgress = 0;
    animating = true;
    animateCentroids();
  }

  function animateCentroids() {
    animProgress += 0.06;
    if (animProgress >= 1) {
      animProgress = 1;
      animating = false;
      stepAssign();
      updateInfo();
      draw();
      if (playing && !converged) {
        setTimeout(doStep, 400);
      }
      return;
    }
    drawWithInterp();
    animFrame = requestAnimationFrame(animateCentroids);
  }

  function computeInertia() {
    if (!centroids || !assignments) return 0;
    var inertia = 0;
    for (var i = 0; i < points.length; i++) {
      if (assignments[i] >= 0) inertia += KM.distSq(points[i], centroids[assignments[i]]);
    }
    return inertia;
  }

  function updateInfo() {
    var inertia = computeInertia();
    info.textContent = 'Iteration: ' + iteration + '  |  Inertia (J): ' + inertia.toFixed(1) + (converged ? '  |  Converged!' : '');
  }

  function draw() {
    var c = KM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < points.length; i++) {
      var col = (assignments && assignments[i] >= 0) ? c.clusters[assignments[i] % c.clusters.length] : c.text;
      KM.drawPoint(ctx, points[i].x, points[i].y, 4.5, col, 0.8);
    }
    if (centroids) {
      for (var j = 0; j < centroids.length; j++) {
        KM.drawDiamond(ctx, centroids[j].x, centroids[j].y, 10, c.clusters[j % c.clusters.length], c.centroidStroke);
      }
    }
  }

  function drawWithInterp() {
    var c = KM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < points.length; i++) {
      var col = (assignments && assignments[i] >= 0) ? c.clusters[assignments[i] % c.clusters.length] : c.text;
      KM.drawPoint(ctx, points[i].x, points[i].y, 4.5, col, 0.8);
    }
    if (centroids && prevCentroids) {
      var t = animProgress;
      t = t * t * (3 - 2 * t);
      for (var j = 0; j < centroids.length; j++) {
        var ix = prevCentroids[j].x + (centroids[j].x - prevCentroids[j].x) * t;
        var iy = prevCentroids[j].y + (centroids[j].y - prevCentroids[j].y) * t;
        KM.drawDiamond(ctx, ix, iy, 10, c.clusters[j % c.clusters.length], c.centroidStroke);
      }
    }
  }

  btnPlay.addEventListener('click', function() {
    if (playing) {
      playing = false;
      btnPlay.textContent = 'Play';
    } else {
      playing = true;
      btnPlay.textContent = 'Pause';
      doStep();
    }
  });

  btnStep.addEventListener('click', function() {
    playing = false;
    btnPlay.textContent = 'Play';
    doStep();
  });

  btnReset.addEventListener('click', init);
  sliderK.addEventListener('input', function() { valK.textContent = sliderK.value; init(); });

  KM.observeTheme(draw);
  init();
})();
</script>

Notice how each iteration makes progress: points snap to their nearest centroid, then centroids glide toward the center of their cluster. After a few iterations the algorithm converges -- assignments stop changing and inertia stabilizes.

---

## K Selection: The Elbow Method

K-Means requires you to choose K in advance. But how? One popular approach is the **Elbow Method**: run K-Means for K = 1, 2, ..., 10, record the inertia (WCSS) for each, and look for an "elbow" in the curve -- the point where adding more clusters stops giving significant improvement.

<div class="interactive-demo" id="demo-elbow">
  <div class="demo-split">
    <div>
      <canvas id="canvas-elbow-chart"></canvas>
      <div class="demo-caption">Inertia vs K (click a point to select)</div>
    </div>
    <div>
      <canvas id="canvas-elbow-clusters"></canvas>
      <div class="demo-caption">Clustering for selected K</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btn-elbow-run">Generate New Data & Run</button>
  </div>
  <div class="demo-info" id="info-elbow">Click "Generate New Data & Run" to begin</div>
</div>

<script>
(function() {
  var CW = 330, CH = 300;
  var canvasChart = document.getElementById('canvas-elbow-chart');
  var canvasClust = document.getElementById('canvas-elbow-clusters');
  var sChart = KM.setupCanvas(canvasChart, CW, CH);
  var sClust = KM.setupCanvas(canvasClust, CW, CH);
  var ctxC = sChart.ctx;
  var ctxK = sClust.ctx;
  var btnRun = document.getElementById('btn-elbow-run');
  var info = document.getElementById('info-elbow');

  var points, results, selectedK;
  var maxK = 10;

  function run() {
    var data = KM.generateClusters(3, 25, CW, CH, 50, 30);
    points = data.points;
    results = [];
    for (var k = 1; k <= maxK; k++) {
      var best = null;
      for (var trial = 0; trial < 5; trial++) {
        var res = KM.kmeans(points, k, 100, 'kmpp');
        if (!best || res.inertia < best.inertia) best = res;
      }
      results.push(best);
    }
    selectedK = 3;
    drawChart();
    drawClusters();
    info.textContent = 'Selected K=' + selectedK + '  |  Inertia: ' + results[selectedK - 1].inertia.toFixed(1);
  }

  function drawChart() {
    var c = KM.getColors();
    ctxC.fillStyle = c.bg;
    ctxC.fillRect(0, 0, CW, CH);
    var pad = { l: 55, r: 20, t: 20, b: 40 };
    var pw = CW - pad.l - pad.r, ph = CH - pad.t - pad.b;
    var maxInertia = results[0].inertia * 1.1;

    ctxC.strokeStyle = c.axis;
    ctxC.lineWidth = 1;
    ctxC.beginPath();
    ctxC.moveTo(pad.l, pad.t);
    ctxC.lineTo(pad.l, CH - pad.b);
    ctxC.lineTo(CW - pad.r, CH - pad.b);
    ctxC.stroke();

    ctxC.fillStyle = c.text;
    ctxC.font = '11px sans-serif';
    ctxC.textAlign = 'center';
    for (var k = 1; k <= maxK; k++) {
      var x = pad.l + (k - 1) / (maxK - 1) * pw;
      ctxC.fillText(k, x, CH - pad.b + 16);
    }
    ctxC.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var val = maxInertia * i / 4;
      var y = CH - pad.b - (i / 4) * ph;
      ctxC.fillText(Math.round(val), pad.l - 6, y + 4);
      ctxC.strokeStyle = c.grid;
      ctxC.beginPath();
      ctxC.moveTo(pad.l, y);
      ctxC.lineTo(CW - pad.r, y);
      ctxC.stroke();
    }

    ctxC.strokeStyle = c.clusters[1];
    ctxC.lineWidth = 2;
    ctxC.beginPath();
    for (var k = 1; k <= maxK; k++) {
      var x = pad.l + (k - 1) / (maxK - 1) * pw;
      var y = CH - pad.b - (results[k - 1].inertia / maxInertia) * ph;
      if (k === 1) ctxC.moveTo(x, y); else ctxC.lineTo(x, y);
    }
    ctxC.stroke();

    for (var k = 1; k <= maxK; k++) {
      var x = pad.l + (k - 1) / (maxK - 1) * pw;
      var y = CH - pad.b - (results[k - 1].inertia / maxInertia) * ph;
      var isSelected = k === selectedK;
      ctxC.beginPath();
      ctxC.arc(x, y, isSelected ? 7 : 4, 0, 2 * Math.PI);
      ctxC.fillStyle = isSelected ? c.clusters[0] : c.clusters[1];
      ctxC.fill();
      if (isSelected) {
        ctxC.strokeStyle = c.centroidStroke;
        ctxC.lineWidth = 2;
        ctxC.stroke();
      }
    }

    ctxC.fillStyle = c.text;
    ctxC.font = '11px sans-serif';
    ctxC.textAlign = 'center';
    ctxC.fillText('K', CW / 2, CH - 4);
    ctxC.save();
    ctxC.translate(14, CH / 2);
    ctxC.rotate(-Math.PI / 2);
    ctxC.fillText('Inertia', 0, 0);
    ctxC.restore();
  }

  function drawClusters() {
    var c = KM.getColors();
    var res = results[selectedK - 1];
    ctxK.fillStyle = c.bg;
    ctxK.fillRect(0, 0, CW, CH);
    for (var i = 0; i < points.length; i++) {
      var col = c.clusters[res.assignments[i] % c.clusters.length];
      KM.drawPoint(ctxK, points[i].x, points[i].y, 4, col, 0.75);
    }
    for (var j = 0; j < res.centroids.length; j++) {
      KM.drawDiamond(ctxK, res.centroids[j].x, res.centroids[j].y, 9, c.clusters[j % c.clusters.length], c.centroidStroke);
    }
  }

  canvasChart.addEventListener('click', function(e) {
    if (!results) return;
    var rect = canvasChart.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (CW / rect.width);
    var pad = { l: 55, r: 20 };
    var pw = CW - pad.l - pad.r;
    var closestK = 1, closestDist = Infinity;
    for (var k = 1; k <= maxK; k++) {
      var x = pad.l + (k - 1) / (maxK - 1) * pw;
      var d = Math.abs(mx - x);
      if (d < closestDist) { closestDist = d; closestK = k; }
    }
    selectedK = closestK;
    drawChart();
    drawClusters();
    info.textContent = 'Selected K=' + selectedK + '  |  Inertia: ' + results[selectedK - 1].inertia.toFixed(1);
  });

  btnRun.addEventListener('click', run);
  KM.observeTheme(function() { if (results) { drawChart(); drawClusters(); } });
  run();
})();
</script>

The curve typically drops steeply as K increases from 1, then flattens out. The "elbow" is where the rate of decrease sharply changes. For data with 3 natural clusters, the elbow is usually at K = 3. Click different K values on the chart to see how the clustering changes.

---

## Voronoi Regions

Each point in K-Means is assigned to its nearest centroid. If we color every pixel in the space by which centroid is closest, we get **Voronoi regions** -- the territory each centroid "owns."

**Drag the centroids** around to see how the Voronoi regions reshape in real-time.

<div class="interactive-demo" id="demo-voronoi">
  <canvas id="canvas-voronoi"></canvas>
  <div class="demo-controls">
    <button id="btn-voronoi-reset">Reset Centroids</button>
    <label>K: <input type="range" id="slider-voronoi-k" min="2" max="6" value="3"><span class="demo-value" id="val-voronoi-k">3</span></label>
  </div>
  <div class="demo-info" id="info-voronoi">Drag the diamond markers to reshape Voronoi regions</div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var canvas = document.getElementById('canvas-voronoi');
  var s = KM.setupCanvas(canvas, W, H);
  var ctx = s.ctx;
  var btnReset = document.getElementById('btn-voronoi-reset');
  var sliderK = document.getElementById('slider-voronoi-k');
  var valK = document.getElementById('val-voronoi-k');

  var K, centroids, points, dragging;

  function init() {
    K = parseInt(sliderK.value);
    valK.textContent = K;
    centroids = [];
    for (var i = 0; i < K; i++) {
      centroids.push({
        x: 80 + Math.random() * (W - 160),
        y: 80 + Math.random() * (H - 160)
      });
    }
    var data = KM.generateClusters(3, 20, W, H, 60, 35);
    points = data.points;
    dragging = -1;
    draw();
  }

  function draw() {
    var c = KM.getColors();
    var imgData = ctx.createImageData(W, H);
    var data = imgData.data;
    var step = 3;
    for (var py = 0; py < H; py += step) {
      for (var px = 0; px < W; px += step) {
        var minD = Infinity, minK = 0;
        for (var j = 0; j < centroids.length; j++) {
          var dx = px - centroids[j].x, dy = py - centroids[j].y;
          var d = dx * dx + dy * dy;
          if (d < minD) { minD = d; minK = j; }
        }
        var hex = c.clusters[minK % c.clusters.length];
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        for (var sy = 0; sy < step && py + sy < H; sy++) {
          for (var sx = 0; sx < step && px + sx < W; sx++) {
            var idx = ((py + sy) * W + (px + sx)) * 4;
            data[idx] = r; data[idx + 1] = g; data[idx + 2] = b; data[idx + 3] = 40;
          }
        }
      }
    }
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.putImageData(imgData, 0, 0);

    var assignments = KM.assign(points, centroids);
    for (var i = 0; i < points.length; i++) {
      KM.drawPoint(ctx, points[i].x, points[i].y, 4, c.clusters[assignments[i] % c.clusters.length], 0.9);
    }

    for (var j = 0; j < centroids.length; j++) {
      KM.drawDiamond(ctx, centroids[j].x, centroids[j].y, 11, c.clusters[j % c.clusters.length], c.centroidStroke);
    }
  }

  function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height)
    };
  }

  canvas.addEventListener('mousedown', function(e) {
    var pos = getMousePos(e);
    for (var j = 0; j < centroids.length; j++) {
      if (KM.dist(pos, centroids[j]) < 18) { dragging = j; return; }
    }
  });
  canvas.addEventListener('mousemove', function(e) {
    if (dragging < 0) return;
    var pos = getMousePos(e);
    centroids[dragging].x = Math.max(5, Math.min(W - 5, pos.x));
    centroids[dragging].y = Math.max(5, Math.min(H - 5, pos.y));
    draw();
  });
  canvas.addEventListener('mouseup', function() { dragging = -1; });
  canvas.addEventListener('mouseleave', function() { dragging = -1; });

  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    var pos = getMousePos(touch);
    for (var j = 0; j < centroids.length; j++) {
      if (KM.dist(pos, centroids[j]) < 24) { dragging = j; return; }
    }
  }, { passive: false });
  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (dragging < 0) return;
    var touch = e.touches[0];
    var pos = getMousePos(touch);
    centroids[dragging].x = Math.max(5, Math.min(W - 5, pos.x));
    centroids[dragging].y = Math.max(5, Math.min(H - 5, pos.y));
    draw();
  }, { passive: false });
  canvas.addEventListener('touchend', function() { dragging = -1; });

  btnReset.addEventListener('click', init);
  sliderK.addEventListener('input', function() { valK.textContent = sliderK.value; init(); });
  KM.observeTheme(draw);
  init();
})();
</script>

The Voronoi diagram makes the decision boundaries explicit. Each region is a convex polygon -- this is a fundamental property that both explains K-Means' strength (fast, clean boundaries) and its limitation (it can only find convex clusters).

---

## Initialization Matters

K-Means only finds a **local minimum** of the inertia function. Different random initializations can lead to very different results -- sometimes good, sometimes bad.

Run the demo below multiple times. Each run uses a fresh random initialization on the **same data**. Notice how the final inertia varies, and some runs produce clearly worse clusterings.

<div class="interactive-demo" id="demo-init">
  <canvas id="canvas-init"></canvas>
  <div class="demo-controls">
    <button id="btn-init-run">Run 5 Random Initializations</button>
    <button id="btn-init-prev">&lt; Prev</button>
    <button id="btn-init-next">Next &gt;</button>
  </div>
  <div class="demo-info" id="info-init">Click "Run 5 Random Initializations" to compare results</div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var canvas = document.getElementById('canvas-init');
  var s = KM.setupCanvas(canvas, W, H);
  var ctx = s.ctx;
  var btnRun = document.getElementById('btn-init-run');
  var btnPrev = document.getElementById('btn-init-prev');
  var btnNext = document.getElementById('btn-init-next');
  var info = document.getElementById('info-init');

  var points, allResults, current;

  function genPoints() {
    var data = KM.generateClusters(3, 20, W, H, 80, 40);
    return data.points;
  }

  function runAll() {
    if (!points) points = genPoints();
    allResults = [];
    for (var t = 0; t < 5; t++) {
      allResults.push(KM.kmeans(points, 3, 100, 'random'));
    }
    allResults.sort(function(a, b) { return a.inertia - b.inertia; });
    current = 0;
    draw();
  }

  function draw() {
    if (!allResults) return;
    var c = KM.getColors();
    var res = allResults[current];
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < points.length; i++) {
      var col = c.clusters[res.assignments[i] % c.clusters.length];
      KM.drawPoint(ctx, points[i].x, points[i].y, 4.5, col, 0.8);
    }
    for (var j = 0; j < res.centroids.length; j++) {
      KM.drawDiamond(ctx, res.centroids[j].x, res.centroids[j].y, 10, c.clusters[j % c.clusters.length], c.centroidStroke);
    }
    var best = current === 0;
    info.textContent = 'Run ' + (current + 1) + '/5  |  Inertia: ' + res.inertia.toFixed(1) +
      '  |  Iterations: ' + res.iterations + (best ? '  |  BEST' : '');
  }

  btnRun.addEventListener('click', function() { points = genPoints(); runAll(); });
  btnPrev.addEventListener('click', function() {
    if (!allResults) return;
    current = (current - 1 + allResults.length) % allResults.length;
    draw();
  });
  btnNext.addEventListener('click', function() {
    if (!allResults) return;
    current = (current + 1) % allResults.length;
    draw();
  });

  KM.observeTheme(draw);
  runAll();
})();
</script>

The results are sorted by inertia (best first). Use the Prev/Next buttons to cycle through all 5 runs. The best run often has an inertia 20--50% lower than the worst run on the same data. This is why running K-Means multiple times and picking the best result is standard practice.

---

## K-Means++ Initialization

**K-Means++** is a smarter initialization that produces better starting centroids. The idea is simple: spread the initial centroids out by choosing each new centroid with probability proportional to its squared distance from the nearest existing centroid.

$$P(x) = \frac{D(x)^2}{\sum_{x'} D(x')^2}$$

where $$D(x)$$ is the distance from point $$x$$ to the nearest already-chosen centroid.

This ensures centroids start well-separated, avoiding the pathological cases of random initialization.

<div class="interactive-demo" id="demo-kmpp">
  <div class="demo-split">
    <div>
      <canvas id="canvas-kmpp-random"></canvas>
      <div class="demo-caption">Random Initialization (5 runs)</div>
    </div>
    <div>
      <canvas id="canvas-kmpp-plus"></canvas>
      <div class="demo-caption">K-Means++ (5 runs)</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btn-kmpp-run">Run Comparison</button>
  </div>
  <div class="demo-info" id="info-kmpp">Click "Run Comparison" to compare initialization strategies</div>
</div>

<script>
(function() {
  var CW = 330, CH = 300;
  var canvasR = document.getElementById('canvas-kmpp-random');
  var canvasP = document.getElementById('canvas-kmpp-plus');
  var sR = KM.setupCanvas(canvasR, CW, CH);
  var sP = KM.setupCanvas(canvasP, CW, CH);
  var ctxR = sR.ctx;
  var ctxP = sP.ctx;
  var btnRun = document.getElementById('btn-kmpp-run');
  var info = document.getElementById('info-kmpp');

  var points;

  function run() {
    var data = KM.generateClusters(3, 25, CW, CH, 50, 28);
    points = data.points;
    var randomResults = [], ppResults = [];
    for (var t = 0; t < 5; t++) {
      randomResults.push(KM.kmeans(points, 3, 100, 'random'));
      ppResults.push(KM.kmeans(points, 3, 100, 'kmpp'));
    }
    randomResults.sort(function(a, b) { return a.inertia - b.inertia; });
    ppResults.sort(function(a, b) { return a.inertia - b.inertia; });

    drawResult(ctxR, CW, CH, randomResults[0]);
    drawResult(ctxP, CW, CH, ppResults[0]);

    var rInertias = randomResults.map(function(r) { return r.inertia.toFixed(0); });
    var pInertias = ppResults.map(function(r) { return r.inertia.toFixed(0); });
    info.textContent = 'Random inertias: [' + rInertias.join(', ') + ']  |  K-Means++ inertias: [' + pInertias.join(', ') + ']';
  }

  function drawResult(ctx, w, h, res) {
    var c = KM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);
    for (var i = 0; i < points.length; i++) {
      KM.drawPoint(ctx, points[i].x, points[i].y, 4, c.clusters[res.assignments[i] % c.clusters.length], 0.8);
    }
    for (var j = 0; j < res.centroids.length; j++) {
      KM.drawDiamond(ctx, res.centroids[j].x, res.centroids[j].y, 9, c.clusters[j % c.clusters.length], c.centroidStroke);
    }
    ctx.fillStyle = c.text;
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Best inertia: ' + res.inertia.toFixed(1), 8, h - 8);
  }

  btnRun.addEventListener('click', run);
  KM.observeTheme(run);
  run();
})();
</script>

The canvases show the **best** result out of 5 runs for each method. The info line shows all 5 inertia values. K-Means++ typically produces more consistent results with lower variance in inertia. In practice, sklearn's KMeans uses K-Means++ by default.

---

## Interactive Clustering Canvas

Now it is your turn. Click on the canvas to place points, choose K, and run K-Means to see how it clusters your data.

<div class="interactive-demo" id="demo-interactive">
  <canvas id="canvas-interactive"></canvas>
  <div class="demo-controls">
    <button id="btn-inter-run">Run K-Means</button>
    <button id="btn-inter-clear">Clear All</button>
    <label>K: <input type="range" id="slider-inter-k" min="2" max="6" value="3"><span class="demo-value" id="val-inter-k">3</span></label>
  </div>
  <div class="demo-info" id="info-interactive">Click on the canvas to add points, then click "Run K-Means"</div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var canvas = document.getElementById('canvas-interactive');
  var s = KM.setupCanvas(canvas, W, H);
  var ctx = s.ctx;
  var btnRun = document.getElementById('btn-inter-run');
  var btnClear = document.getElementById('btn-inter-clear');
  var sliderK = document.getElementById('slider-inter-k');
  var valK = document.getElementById('val-inter-k');
  var info = document.getElementById('info-interactive');

  var points = [], result = null;

  function draw() {
    var c = KM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    if (points.length === 0) {
      ctx.fillStyle = c.text;
      ctx.globalAlpha = 0.3;
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click to add points', W / 2, H / 2);
      ctx.globalAlpha = 1;
      return;
    }
    for (var i = 0; i < points.length; i++) {
      var col = (result && result.assignments) ? c.clusters[result.assignments[i] % c.clusters.length] : c.text;
      KM.drawPoint(ctx, points[i].x, points[i].y, 5, col, 0.85);
    }
    if (result && result.centroids) {
      for (var j = 0; j < result.centroids.length; j++) {
        KM.drawDiamond(ctx, result.centroids[j].x, result.centroids[j].y, 10, c.clusters[j % c.clusters.length], c.centroidStroke);
      }
    }
  }

  function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height)
    };
  }

  canvas.addEventListener('click', function(e) {
    var pos = getMousePos(e);
    points.push({ x: pos.x, y: pos.y });
    result = null;
    info.textContent = points.length + ' points  |  Click "Run K-Means" to cluster';
    draw();
  });

  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    var pos = getMousePos(touch);
    points.push({ x: pos.x, y: pos.y });
    result = null;
    info.textContent = points.length + ' points  |  Click "Run K-Means" to cluster';
    draw();
  }, { passive: false });

  btnRun.addEventListener('click', function() {
    var K = parseInt(sliderK.value);
    if (points.length < K) {
      info.textContent = 'Need at least ' + K + ' points. Add more!';
      return;
    }
    result = KM.kmeans(points, K, 100, 'kmpp');
    info.textContent = 'K=' + K + '  |  Inertia: ' + result.inertia.toFixed(1) + '  |  Iterations: ' + result.iterations;
    draw();
  });

  btnClear.addEventListener('click', function() {
    points = [];
    result = null;
    info.textContent = 'Click on the canvas to add points, then click "Run K-Means"';
    draw();
  });

  sliderK.addEventListener('input', function() {
    valK.textContent = sliderK.value;
    result = null;
    draw();
  });

  KM.observeTheme(draw);
  draw();
})();
</script>

<div class="demo-hint">Try creating a few tight groups and running K-Means with the correct K. Then try with too few or too many clusters. Notice how the algorithm always finds a solution, even if K is wrong -- it just splits or merges your intended groups.</div>

---

## Limitations of K-Means

K-Means is powerful but it has fundamental limitations:

1. **Assumes spherical (convex) clusters** -- It uses Euclidean distance to assign points, creating convex Voronoi regions. It cannot discover non-convex shapes.
2. **Sensitive to outliers** -- A single far-away point can pull a centroid off course.
3. **Requires choosing K** -- The elbow method helps, but there is no universal automatic solution.
4. **Local minima** -- Different initializations give different results.

The demo below shows K-Means trying to cluster two classic non-convex shapes: **crescent moons** and **concentric circles**. The algorithm fails because its decision boundaries are always linear.

<div class="interactive-demo" id="demo-limits">
  <div class="demo-split">
    <div>
      <canvas id="canvas-limit-moons"></canvas>
      <div class="demo-caption">Two Moons (K=2)</div>
    </div>
    <div>
      <canvas id="canvas-limit-circles"></canvas>
      <div class="demo-caption">Concentric Circles (K=2)</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btn-limit-rerun">Re-run K-Means</button>
  </div>
  <div class="demo-info" id="info-limits">K-Means splits these shapes incorrectly -- it cannot find non-convex clusters</div>
</div>

<script>
(function() {
  var CW = 330, CH = 300;
  var canvasM = document.getElementById('canvas-limit-moons');
  var canvasC = document.getElementById('canvas-limit-circles');
  var sM = KM.setupCanvas(canvasM, CW, CH);
  var sC = KM.setupCanvas(canvasC, CW, CH);
  var ctxM = sM.ctx;
  var ctxC = sC.ctx;
  var btnRerun = document.getElementById('btn-limit-rerun');
  var info = document.getElementById('info-limits');

  var moonPts, circlePts;

  function run() {
    moonPts = KM.generateMoons(120, CW, CH);
    circlePts = KM.generateCircles(120, CW, CH);

    var resMoons = KM.kmeans(moonPts, 2, 100, 'kmpp');
    var resCircles = KM.kmeans(circlePts, 2, 100, 'kmpp');

    drawResult(ctxM, CW, CH, moonPts, resMoons);
    drawResult(ctxC, CW, CH, circlePts, resCircles);

    var moonCorrect = 0, circleCorrect = 0;
    for (var i = 0; i < moonPts.length; i++) {
      if (resMoons.assignments[i] === moonPts[i].trueLabel) moonCorrect++;
    }
    moonCorrect = Math.max(moonCorrect, moonPts.length - moonCorrect);
    for (var i = 0; i < circlePts.length; i++) {
      if (resCircles.assignments[i] === circlePts[i].trueLabel) circleCorrect++;
    }
    circleCorrect = Math.max(circleCorrect, circlePts.length - circleCorrect);
    info.textContent = 'Moons accuracy: ~' + Math.round(100 * moonCorrect / moonPts.length) +
      '%  |  Circles accuracy: ~' + Math.round(100 * circleCorrect / circlePts.length) + '%';
  }

  function drawResult(ctx, w, h, pts, res) {
    var c = KM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    for (var i = 0; i < pts.length; i++) {
      var col = c.clusters[res.assignments[i] % c.clusters.length];
      KM.drawPoint(ctx, pts[i].x, pts[i].y, 3.5, col, 0.8);
    }
    for (var j = 0; j < res.centroids.length; j++) {
      KM.drawDiamond(ctx, res.centroids[j].x, res.centroids[j].y, 9, c.clusters[j % c.clusters.length], c.centroidStroke);
    }

    ctx.strokeStyle = c.axis;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    var cx0 = res.centroids[0], cx1 = res.centroids[1];
    var mx = (cx0.x + cx1.x) / 2, my = (cx0.y + cx1.y) / 2;
    var dx = cx1.x - cx0.x, dy = cx1.y - cx0.y;
    var len = Math.sqrt(dx * dx + dy * dy);
    var nx = -dy / len, ny = dx / len;
    ctx.beginPath();
    ctx.moveTo(mx - nx * 300, my - ny * 300);
    ctx.lineTo(mx + nx * 300, my + ny * 300);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  btnRerun.addEventListener('click', run);
  KM.observeTheme(run);
  run();
})();
</script>

The dashed line shows the linear decision boundary K-Means creates. For moons, it cuts across both crescents instead of separating them. For concentric circles, it bisects both rings. Density-based algorithms like **DBSCAN** handle these shapes correctly -- that is a story for the next chapter.

---

## Summary

| Concept | Details |
|---|---|
| **Algorithm** | Alternate between assigning points to nearest centroid and updating centroids to cluster means |
| **Objective** | Minimize inertia: $$J = \sum_k \sum_{x \in C_k} \|x - \mu_k\|^2$$ |
| **Convergence** | Guaranteed to converge (inertia decreases monotonically), but to a local minimum |
| **Initialization** | Random is simple; K-Means++ gives better, more consistent results |
| **Choosing K** | Elbow method (plot inertia vs K), silhouette analysis, domain knowledge |
| **Time Complexity** | $$O(nKT)$$ where $$n$$ = points, $$K$$ = clusters, $$T$$ = iterations |
| **Limitations** | Assumes convex clusters, sensitive to outliers, must pre-specify K |

### Key Takeaways

1. K-Means is fast and intuitive -- it should be your **first clustering attempt** on any new dataset.
2. Always use **K-Means++** initialization (it is the default in sklearn).
3. Run the algorithm **multiple times** and keep the result with lowest inertia.
4. Use the **elbow method** to guide your choice of K, but also consider domain knowledge.
5. K-Means creates **linear (Voronoi) boundaries** -- if your clusters are non-convex, you need a different algorithm.

### What's Next

In the next chapter, we will explore **DBSCAN and Hierarchical Clustering** -- algorithms that can discover clusters of arbitrary shape, handle noise, and even determine the number of clusters automatically.
