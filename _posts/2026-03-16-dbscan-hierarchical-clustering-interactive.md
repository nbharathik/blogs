---
layout: post
title: "DBSCAN & Hierarchical Clustering - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
tags: [ml-part-2]
series: false
hidden: true
description: "Explore density-based clustering with DBSCAN, build dendrograms interactively, compare linkage methods, and see why K-Means fails on non-convex shapes - all in your browser."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /dbscan-hierarchical-clustering/
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
.demo-controls select {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
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
.demo-quad {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
@media (max-width: 640px) {
  .demo-quad { grid-template-columns: 1fr; }
}
.hc-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.9rem;
}
.hc-table th, .hc-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}
.hc-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
.hc-table td {
  background: var(--bg-primary);
}
</style>

<script>
window.HC = (function() {
  var darkColors = {
    bg: '#1a1b26', text: '#c0caf5',
    textMuted: '#565f89',
    grid: 'rgba(192,202,245,0.08)', axis: 'rgba(192,202,245,0.18)',
    border: '#3b4261',
    clusters: ['#f7768e','#7aa2f7','#9ece6a','#ff9e64','#bb9af7','#2ac3de','#e0af68','#73daca','#f7768e','#7aa2f7'],
    noise: '#565f89',
    core: '#9ece6a',
    borderPt: '#e0af68',
    accent: '#7aa2f7',
    dendro: '#7aa2f7',
    cutLine: '#f7768e'
  };
  var lightColors = {
    bg: '#ffffff', text: '#1e293b',
    textMuted: '#94a3b8',
    grid: 'rgba(30,41,59,0.06)', axis: 'rgba(30,41,59,0.15)',
    border: '#cbd5e1',
    clusters: ['#e63946','#2563eb','#16a34a','#ea580c','#7c3aed','#0891b2','#ca8a04','#059669','#e63946','#2563eb'],
    noise: '#94a3b8',
    core: '#16a34a',
    borderPt: '#ca8a04',
    accent: '#2563eb',
    dendro: '#2563eb',
    cutLine: '#e63946'
  };

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ||
      (window.getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim().match(/^#[0-3]/) !== null);
  }

  function getColors() { return isDark() ? darkColors : lightColors; }

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

  function randGauss() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // --- Dataset generators ---
  function generateBlobs(n, k, w, h, spread) {
    spread = spread || 30;
    var pts = [], centers = [];
    for (var i = 0; i < k; i++) {
      centers.push({ x: 60 + Math.random() * (w - 120), y: 60 + Math.random() * (h - 120) });
    }
    var perCluster = Math.floor(n / k);
    for (var i = 0; i < k; i++) {
      for (var j = 0; j < perCluster; j++) {
        pts.push({
          x: Math.max(5, Math.min(w - 5, centers[i].x + randGauss() * spread)),
          y: Math.max(5, Math.min(h - 5, centers[i].y + randGauss() * spread))
        });
      }
    }
    return pts;
  }

  function generateMoons(n, w, h) {
    var pts = [], half = Math.floor(n / 2);
    var cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.28;
    for (var i = 0; i < half; i++) {
      var angle = Math.PI * i / half;
      pts.push({ x: cx + r * Math.cos(angle) - r * 0.5 + randGauss() * 6, y: cy - r * Math.sin(angle) + randGauss() * 6 });
    }
    for (var i = 0; i < half; i++) {
      var angle = Math.PI + Math.PI * i / half;
      pts.push({ x: cx + r * Math.cos(angle) + r * 0.5 + randGauss() * 6, y: cy - r * Math.sin(angle) + r * 0.4 + randGauss() * 6 });
    }
    return pts;
  }

  function generateCircles(n, w, h) {
    var pts = [], half = Math.floor(n / 2);
    var cx = w / 2, cy = h / 2;
    var rIn = Math.min(w, h) * 0.1, rOut = Math.min(w, h) * 0.3;
    for (var i = 0; i < half; i++) {
      var a = Math.random() * 2 * Math.PI;
      pts.push({ x: cx + (rIn + randGauss() * 6) * Math.cos(a), y: cy + (rIn + randGauss() * 6) * Math.sin(a) });
    }
    for (var i = 0; i < half; i++) {
      var a = Math.random() * 2 * Math.PI;
      pts.push({ x: cx + (rOut + randGauss() * 6) * Math.cos(a), y: cy + (rOut + randGauss() * 6) * Math.sin(a) });
    }
    return pts;
  }

  function generateSpirals(n, w, h) {
    var pts = [], half = Math.floor(n / 2);
    var cx = w / 2, cy = h / 2;
    for (var i = 0; i < half; i++) {
      var t = 1.5 * Math.PI * (i / half);
      var r = 10 + 60 * (i / half);
      pts.push({ x: cx + r * Math.cos(t) + randGauss() * 5, y: cy + r * Math.sin(t) + randGauss() * 5 });
    }
    for (var i = 0; i < half; i++) {
      var t = 1.5 * Math.PI * (i / half) + Math.PI;
      var r = 10 + 60 * (i / half);
      pts.push({ x: cx + r * Math.cos(t) + randGauss() * 5, y: cy + r * Math.sin(t) + randGauss() * 5 });
    }
    return pts;
  }

  function addNoise(pts, count, w, h) {
    for (var i = 0; i < count; i++) {
      pts.push({ x: Math.random() * w, y: Math.random() * h });
    }
    return pts;
  }

  // --- DBSCAN ---
  function dbscan(points, eps, minPts) {
    var n = points.length;
    var labels = new Array(n);
    var types = new Array(n); // 'core', 'border', 'noise'
    for (var i = 0; i < n; i++) { labels[i] = -1; types[i] = 'noise'; }

    // Find neighbors for each point
    var neighbors = [];
    for (var i = 0; i < n; i++) {
      neighbors[i] = [];
      for (var j = 0; j < n; j++) {
        if (i !== j && dist(points[i], points[j]) <= eps) {
          neighbors[i].push(j);
        }
      }
    }

    // Mark core points
    for (var i = 0; i < n; i++) {
      if (neighbors[i].length >= minPts) types[i] = 'core';
    }

    // Expand clusters
    var cluster = 0;
    for (var i = 0; i < n; i++) {
      if (types[i] !== 'core' || labels[i] !== -1) continue;
      var queue = [i];
      labels[i] = cluster;
      while (queue.length > 0) {
        var p = queue.shift();
        for (var k = 0; k < neighbors[p].length; k++) {
          var nb = neighbors[p][k];
          if (labels[nb] === -1) {
            labels[nb] = cluster;
            if (types[nb] !== 'core') types[nb] = 'border';
            if (types[nb] === 'core') queue.push(nb);
          }
        }
      }
      cluster++;
    }
    return { labels: labels, types: types, nClusters: cluster, neighbors: neighbors };
  }

  // --- DBSCAN step-by-step ---
  function dbscanSteps(points, eps, minPts) {
    var n = points.length;
    var labels = new Array(n);
    var types = new Array(n);
    for (var i = 0; i < n; i++) { labels[i] = -1; types[i] = 'noise'; }
    var neighbors = [];
    for (var i = 0; i < n; i++) {
      neighbors[i] = [];
      for (var j = 0; j < n; j++) {
        if (i !== j && dist(points[i], points[j]) <= eps) neighbors[i].push(j);
      }
    }
    for (var i = 0; i < n; i++) {
      if (neighbors[i].length >= minPts) types[i] = 'core';
    }

    var steps = [];
    steps.push({ labels: labels.slice(), types: types.slice(), current: -1, expanding: [], desc: 'Initial: core points identified' });

    var cluster = 0;
    for (var i = 0; i < n; i++) {
      if (types[i] !== 'core' || labels[i] !== -1) continue;
      var queue = [i];
      labels[i] = cluster;
      steps.push({ labels: labels.slice(), types: types.slice(), current: i, expanding: [i], desc: 'Start cluster ' + cluster + ' from point ' + i });

      while (queue.length > 0) {
        var p = queue.shift();
        var added = [];
        for (var k = 0; k < neighbors[p].length; k++) {
          var nb = neighbors[p][k];
          if (labels[nb] === -1) {
            labels[nb] = cluster;
            added.push(nb);
            if (types[nb] !== 'core') types[nb] = 'border';
            if (types[nb] === 'core') queue.push(nb);
          }
        }
        if (added.length > 0) {
          steps.push({ labels: labels.slice(), types: types.slice(), current: p, expanding: added, desc: 'Expand from point ' + p + ': added ' + added.length + ' points to cluster ' + cluster });
        }
      }
      cluster++;
    }
    steps.push({ labels: labels.slice(), types: types.slice(), current: -1, expanding: [], desc: 'Done: ' + cluster + ' clusters found' });
    return steps;
  }

  // --- K-Means (for comparison) ---
  function kmeans(points, k, maxIter) {
    maxIter = maxIter || 50;
    var n = points.length;
    var centroids = [];
    var used = {};
    for (var i = 0; i < k; i++) {
      var idx;
      do { idx = Math.floor(Math.random() * n); } while (used[idx]);
      used[idx] = true;
      centroids.push({ x: points[idx].x, y: points[idx].y });
    }
    var assignments = new Array(n);
    for (var iter = 0; iter < maxIter; iter++) {
      for (var i = 0; i < n; i++) {
        var minD = Infinity, minK = 0;
        for (var j = 0; j < k; j++) {
          var d = dist(points[i], centroids[j]);
          if (d < minD) { minD = d; minK = j; }
        }
        assignments[i] = minK;
      }
      var newC = [];
      for (var j = 0; j < k; j++) {
        var sx = 0, sy = 0, cnt = 0;
        for (var i = 0; i < n; i++) {
          if (assignments[i] === j) { sx += points[i].x; sy += points[i].y; cnt++; }
        }
        newC.push(cnt > 0 ? { x: sx / cnt, y: sy / cnt } : centroids[j]);
      }
      centroids = newC;
    }
    return assignments;
  }

  // --- Hierarchical (agglomerative) clustering ---
  function agglomerative(points, linkage) {
    linkage = linkage || 'single';
    var n = points.length;
    // Each cluster starts as a single point
    var clusters = [];
    for (var i = 0; i < n; i++) clusters.push([i]);
    var merges = []; // { a, b, dist, newCluster }
    var active = [];
    for (var i = 0; i < n; i++) active.push(i);

    // Precompute distance matrix
    var D = [];
    for (var i = 0; i < n; i++) {
      D[i] = [];
      for (var j = 0; j < n; j++) {
        D[i][j] = dist(points[i], points[j]);
      }
    }

    function clusterDist(c1, c2) {
      var d;
      if (linkage === 'single') {
        d = Infinity;
        for (var i = 0; i < c1.length; i++)
          for (var j = 0; j < c2.length; j++)
            d = Math.min(d, D[c1[i]][c2[j]]);
      } else if (linkage === 'complete') {
        d = 0;
        for (var i = 0; i < c1.length; i++)
          for (var j = 0; j < c2.length; j++)
            d = Math.max(d, D[c1[i]][c2[j]]);
      } else if (linkage === 'average') {
        d = 0;
        var cnt = 0;
        for (var i = 0; i < c1.length; i++)
          for (var j = 0; j < c2.length; j++) {
            d += D[c1[i]][c2[j]];
            cnt++;
          }
        d /= cnt;
      } else { // ward
        var cx1 = 0, cy1 = 0, cx2 = 0, cy2 = 0;
        for (var i = 0; i < c1.length; i++) { cx1 += points[c1[i]].x; cy1 += points[c1[i]].y; }
        cx1 /= c1.length; cy1 /= c1.length;
        for (var j = 0; j < c2.length; j++) { cx2 += points[c2[j]].x; cy2 += points[c2[j]].y; }
        cx2 /= c2.length; cy2 /= c2.length;
        var merged = c1.concat(c2);
        var cxm = 0, cym = 0;
        for (var i = 0; i < merged.length; i++) { cxm += points[merged[i]].x; cym += points[merged[i]].y; }
        cxm /= merged.length; cym /= merged.length;
        var sse1 = 0, sse2 = 0, ssem = 0;
        for (var i = 0; i < c1.length; i++) {
          var dx = points[c1[i]].x - cx1, dy = points[c1[i]].y - cy1;
          sse1 += dx * dx + dy * dy;
        }
        for (var j = 0; j < c2.length; j++) {
          var dx = points[c2[j]].x - cx2, dy = points[c2[j]].y - cy2;
          sse2 += dx * dx + dy * dy;
        }
        for (var i = 0; i < merged.length; i++) {
          var dx = points[merged[i]].x - cxm, dy = points[merged[i]].y - cym;
          ssem += dx * dx + dy * dy;
        }
        d = ssem - sse1 - sse2;
      }
      return d;
    }

    while (active.length > 1) {
      var bestDist = Infinity, bestA = -1, bestB = -1;
      for (var i = 0; i < active.length; i++) {
        for (var j = i + 1; j < active.length; j++) {
          var d = clusterDist(clusters[active[i]], clusters[active[j]]);
          if (d < bestDist) { bestDist = d; bestA = i; bestB = j; }
        }
      }
      var idxA = active[bestA], idxB = active[bestB];
      var newCluster = clusters[idxA].concat(clusters[idxB]);
      clusters.push(newCluster);
      merges.push({ a: idxA, b: idxB, dist: bestDist, idx: clusters.length - 1 });
      active.splice(bestB, 1);
      active.splice(bestA, 1);
      active.push(clusters.length - 1);
    }
    return { clusters: clusters, merges: merges, n: n };
  }

  // Get cluster labels at a given cut distance
  function cutTree(result, cutDist) {
    var n = result.n;
    var labels = new Array(n);
    for (var i = 0; i < n; i++) labels[i] = -1;
    // Rebuild: start from leaf clusters, apply merges up to cutDist
    var parent = {};
    var clusterSets = [];
    for (var i = 0; i < n; i++) clusterSets.push([i]);
    for (var m = 0; m < result.merges.length; m++) {
      var merge = result.merges[m];
      if (merge.dist <= cutDist) {
        clusterSets.push(result.clusters[merge.idx]);
        parent[merge.a] = merge.idx;
        parent[merge.b] = merge.idx;
      }
    }
    // Find root clusters (those not merged into anything)
    var roots = {};
    for (var i = 0; i < n + result.merges.length; i++) {
      if (i < n || (i >= n && result.merges[i - n] && result.merges[i - n].dist <= cutDist)) {
        var r = i;
        while (parent[r] !== undefined) r = parent[r];
        roots[r] = true;
      }
    }
    var rootList = Object.keys(roots).map(Number);
    for (var c = 0; c < rootList.length; c++) {
      var members = result.clusters[rootList[c]];
      for (var j = 0; j < members.length; j++) {
        labels[members[j]] = c;
      }
    }
    return labels;
  }

  function drawPoint(ctx, x, y, r, color, alpha) {
    ctx.globalAlpha = alpha || 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  return {
    getColors: getColors, isDark: isDark,
    setupCanvas: setupCanvas, observeTheme: observeTheme,
    dist: dist, randGauss: randGauss,
    generateBlobs: generateBlobs, generateMoons: generateMoons,
    generateCircles: generateCircles, generateSpirals: generateSpirals,
    addNoise: addNoise,
    dbscan: dbscan, dbscanSteps: dbscanSteps,
    kmeans: kmeans,
    agglomerative: agglomerative, cutTree: cutTree,
    drawPoint: drawPoint
  };
})();
</script>

## Introduction: Beyond K-Means

In the [previous chapter](/k-means-clustering), we built K-Means from scratch. It is fast, simple, and works well on compact, globular clusters. But K-Means has fundamental limitations:

- It **requires specifying K** in advance
- It assumes clusters are **convex and roughly equal-sized**
- It is **sensitive to outliers**
- It **cannot discover arbitrarily-shaped clusters**

What happens when your data looks like two interlocking crescents? Or concentric rings? K-Means will fail badly, it will draw straight-line boundaries through structures that clearly belong together.

This chapter introduces two powerful alternatives:
- **DBSCAN**: a density-based method that discovers clusters of arbitrary shape and automatically identifies noise
- **Hierarchical Clustering**: a method that builds a tree of nested clusters, letting you choose the number of clusters after the fact

Let us see the problem first, then build the solutions.

---

## Where K-Means Fails

K-Means assigns each point to the nearest centroid, which means it always produces **convex (Voronoi-shaped) clusters**. When the true structure is non-convex, this is a disaster. Compare K-Means (left) with DBSCAN (right) on the same data.

<div class="interactive-demo" id="demo-failure">
  <div class="demo-split">
    <div>
      <canvas id="canvas-fail-kmeans"></canvas>
      <div class="demo-caption">K-Means (K=2)</div>
    </div>
    <div>
      <canvas id="canvas-fail-dbscan"></canvas>
      <div class="demo-caption">DBSCAN</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Dataset:
      <select id="sel-fail-data">
        <option value="moons">Two Moons</option>
        <option value="circles">Concentric Circles</option>
        <option value="spirals">Spirals</option>
        <option value="blobs">Blobs + Noise</option>
      </select>
    </label>
    <button id="btn-fail-regen">Regenerate</button>
  </div>
  <div class="demo-info" id="info-fail">Select a dataset to compare clustering methods</div>
</div>

<div class="demo-hint">Try each dataset. Notice how K-Means splits the moons and circles incorrectly, while DBSCAN recovers the true structure every time. On blobs with noise, DBSCAN also identifies the outliers (gray points).</div>

<script>
(function() {
  var W = 320, H = 280;
  var cK = document.getElementById('canvas-fail-kmeans');
  var cD = document.getElementById('canvas-fail-dbscan');
  var sK = HC.setupCanvas(cK, W, H);
  var sD = HC.setupCanvas(cD, W, H);
  var ctxK = sK.ctx, ctxD = sD.ctx;
  var sel = document.getElementById('sel-fail-data');
  var btnRegen = document.getElementById('btn-fail-regen');
  var info = document.getElementById('info-fail');

  var points = [];

  function genData() {
    var v = sel.value;
    if (v === 'moons') points = HC.generateMoons(160, W, H);
    else if (v === 'circles') points = HC.generateCircles(160, W, H);
    else if (v === 'spirals') points = HC.generateSpirals(160, W, H);
    else { points = HC.generateBlobs(120, 3, W, H, 22); HC.addNoise(points, 20, W, H); }
    run();
  }

  function autoEps() {
    var v = sel.value;
    if (v === 'moons') return 22;
    if (v === 'circles') return 20;
    if (v === 'spirals') return 18;
    return 28;
  }

  function run() {
    var kmLabels = HC.kmeans(points, 2, 50);
    var dbResult = HC.dbscan(points, autoEps(), 4);
    var c = HC.getColors();

    // K-Means side
    ctxK.fillStyle = c.bg;
    ctxK.fillRect(0, 0, W, H);
    for (var i = 0; i < points.length; i++) {
      var col = c.clusters[kmLabels[i] % c.clusters.length];
      HC.drawPoint(ctxK, points[i].x, points[i].y, 4, col, 0.8);
    }

    // DBSCAN side
    ctxD.fillStyle = c.bg;
    ctxD.fillRect(0, 0, W, H);
    for (var i = 0; i < points.length; i++) {
      var lbl = dbResult.labels[i];
      var col = lbl === -1 ? c.noise : c.clusters[lbl % c.clusters.length];
      var alpha = lbl === -1 ? 0.4 : 0.8;
      HC.drawPoint(ctxD, points[i].x, points[i].y, 4, col, alpha);
    }

    info.textContent = 'K-Means: 2 clusters  |  DBSCAN: ' + dbResult.nClusters + ' clusters, ' +
      dbResult.labels.filter(function(l) { return l === -1; }).length + ' noise points';
  }

  sel.addEventListener('change', genData);
  btnRegen.addEventListener('click', genData);
  HC.observeTheme(run);
  genData();
})();
</script>

The failure is structural. K-Means minimizes within-cluster variance, which always produces convex partitions. Non-convex clusters require a fundamentally different approach.

---

## DBSCAN: Density-Based Spatial Clustering

**DBSCAN** (Density-Based Spatial Clustering of Applications with Noise) takes a completely different approach. Instead of starting from centroids, it starts from **density**. The key idea: a cluster is a dense region of points separated from other dense regions by sparse regions.

DBSCAN has two parameters:

- **$$\varepsilon$$ (epsilon)**: the radius of the neighborhood around each point
- **MinPts**: the minimum number of points within $$\varepsilon$$-distance to qualify as a dense region

These give us three types of points:

- **Core point**: has at least MinPts neighbors within $$\varepsilon$$
- **Border point**: within $$\varepsilon$$ of a core point, but not itself a core point
- **Noise point**: neither core nor border

### The Algorithm

1. Pick any unvisited point
2. If it is a core point, start a new cluster and add all its $$\varepsilon$$-neighbors
3. For each newly added core point, recursively add its $$\varepsilon$$-neighbors
4. Continue until the cluster cannot expand further
5. Pick the next unvisited point and repeat
6. Any remaining unvisited points are noise

---

## Core, Border, and Noise Points

Click to place points on the canvas. Adjust $$\varepsilon$$ to see the neighborhood circles. Points are colored by their type: **green** = core (enough neighbors), **gold** = border (near a core), **gray** = noise (isolated).

<div class="interactive-demo" id="demo-concepts">
  <canvas id="canvas-concepts"></canvas>
  <div class="demo-controls">
    <label>$$\varepsilon$$: <input type="range" id="slider-concept-eps" min="15" max="80" value="40"><span class="demo-value" id="val-concept-eps">40</span></label>
    <label>MinPts: <input type="range" id="slider-concept-min" min="2" max="8" value="3"><span class="demo-value" id="val-concept-min">3</span></label>
    <button id="btn-concept-clear">Clear</button>
    <button id="btn-concept-sample">Sample Data</button>
  </div>
  <div class="demo-info" id="info-concepts">Click on the canvas to place points</div>
</div>

<div class="demo-hint">Place a few tight clusters and some scattered points. Increase $$\varepsilon$$ and watch isolated points become border or core points. Decrease MinPts and watch border points become core points.</div>

<script>
(function() {
  var W = 680, H = 360;
  var canvas = document.getElementById('canvas-concepts');
  var s = HC.setupCanvas(canvas, W, H);
  var ctx = s.ctx;
  var sliderEps = document.getElementById('slider-concept-eps');
  var sliderMin = document.getElementById('slider-concept-min');
  var valEps = document.getElementById('val-concept-eps');
  var valMin = document.getElementById('val-concept-min');
  var btnClear = document.getElementById('btn-concept-clear');
  var btnSample = document.getElementById('btn-concept-sample');
  var info = document.getElementById('info-concepts');

  var points = [];
  var hoveredIdx = -1;

  function getEps() { return parseFloat(sliderEps.value); }
  function getMin() { return parseInt(sliderMin.value); }

  function classify() {
    var eps = getEps(), minPts = getMin();
    var n = points.length;
    for (var i = 0; i < n; i++) {
      var cnt = 0;
      for (var j = 0; j < n; j++) {
        if (i !== j && HC.dist(points[i], points[j]) <= eps) cnt++;
      }
      points[i].neighborCount = cnt;
      points[i].type = cnt >= minPts ? 'core' : 'noise';
    }
    // Border: within eps of a core but not core itself
    for (var i = 0; i < n; i++) {
      if (points[i].type === 'core') continue;
      for (var j = 0; j < n; j++) {
        if (points[j].type === 'core' && HC.dist(points[i], points[j]) <= eps) {
          points[i].type = 'border';
          break;
        }
      }
    }
  }

  function draw() {
    var c = HC.getColors();
    var eps = getEps();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    classify();

    // Draw epsilon circles for hovered or all core points
    for (var i = 0; i < points.length; i++) {
      if (i === hoveredIdx || points[i].type === 'core') {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, eps, 0, 2 * Math.PI);
        ctx.strokeStyle = i === hoveredIdx ? c.accent : c.grid;
        ctx.lineWidth = i === hoveredIdx ? 1.5 : 0.5;
        ctx.setLineDash(i === hoveredIdx ? [] : [3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw points
    for (var i = 0; i < points.length; i++) {
      var col = points[i].type === 'core' ? c.core : points[i].type === 'border' ? c.borderPt : c.noise;
      var alpha = points[i].type === 'noise' ? 0.5 : 0.9;
      var r = points[i].type === 'core' ? 6 : 4.5;
      HC.drawPoint(ctx, points[i].x, points[i].y, r, col, alpha);
    }

    // Legend
    ctx.font = '12px sans-serif';
    var lx = W - 150, ly = 20;
    var types = [['Core', c.core], ['Border', c.borderPt], ['Noise', c.noise]];
    for (var i = 0; i < types.length; i++) {
      HC.drawPoint(ctx, lx, ly + i * 20, 5, types[i][1], 1);
      ctx.fillStyle = c.text;
      ctx.textAlign = 'left';
      ctx.fillText(types[i][0], lx + 12, ly + i * 20 + 4);
    }

    var nCore = 0, nBorder = 0, nNoise = 0;
    for (var i = 0; i < points.length; i++) {
      if (points[i].type === 'core') nCore++;
      else if (points[i].type === 'border') nBorder++;
      else nNoise++;
    }
    info.textContent = points.length + ' points  |  Core: ' + nCore + '  Border: ' + nBorder + '  Noise: ' + nNoise;
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) * (W / rect.width);
    var y = (e.clientY - rect.top) * (H / rect.height);
    points.push({ x: x, y: y });
    draw();
  });

  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    var my = (e.clientY - rect.top) * (H / rect.height);
    var best = -1, bestD = 20;
    for (var i = 0; i < points.length; i++) {
      var d = HC.dist({ x: mx, y: my }, points[i]);
      if (d < bestD) { bestD = d; best = i; }
    }
    if (best !== hoveredIdx) { hoveredIdx = best; draw(); }
  });

  canvas.addEventListener('mouseleave', function() {
    hoveredIdx = -1;
    draw();
  });

  sliderEps.addEventListener('input', function() { valEps.textContent = sliderEps.value; draw(); });
  sliderMin.addEventListener('input', function() { valMin.textContent = sliderMin.value; draw(); });

  btnClear.addEventListener('click', function() { points = []; draw(); });
  btnSample.addEventListener('click', function() {
    points = [];
    // Tight cluster
    for (var i = 0; i < 12; i++) points.push({ x: 150 + HC.randGauss() * 20, y: 180 + HC.randGauss() * 20 });
    // Another cluster
    for (var i = 0; i < 10; i++) points.push({ x: 400 + HC.randGauss() * 25, y: 150 + HC.randGauss() * 25 });
    // Scattered noise
    for (var i = 0; i < 5; i++) points.push({ x: 50 + Math.random() * 580, y: 30 + Math.random() * 300 });
    draw();
  });

  HC.observeTheme(draw);
  draw();
})();
</script>

---

## DBSCAN Parameter Explorer

This is the core interactive. Adjust $$\varepsilon$$ and MinPts and watch clusters form, dissolve, and merge in real-time. Clusters are color-coded; noise points appear in gray.

<div class="interactive-demo" id="demo-params">
  <canvas id="canvas-params"></canvas>
  <div class="demo-controls">
    <label>$$\varepsilon$$: <input type="range" id="slider-param-eps" min="8" max="80" value="30" step="1"><span class="demo-value" id="val-param-eps">30</span></label>
    <label>MinPts: <input type="range" id="slider-param-min" min="2" max="12" value="4"><span class="demo-value" id="val-param-min">4</span></label>
    <label>Dataset:
      <select id="sel-param-data">
        <option value="moons">Two Moons</option>
        <option value="circles">Circles</option>
        <option value="spirals">Spirals</option>
        <option value="blobs">Blobs + Noise</option>
      </select>
    </label>
    <button id="btn-param-regen">Regenerate</button>
  </div>
  <div class="demo-info" id="info-params">Adjust parameters to explore clustering</div>
</div>

<div class="demo-hint">Start with $$\varepsilon$$ very small (everything is noise), then slowly increase it. Watch clusters nucleate around dense regions and grow outward. If $$\varepsilon$$ is too large, everything merges into one cluster. The sweet spot captures the natural structure.</div>

<script>
(function() {
  var W = 680, H = 400;
  var canvas = document.getElementById('canvas-params');
  var s = HC.setupCanvas(canvas, W, H);
  var ctx = s.ctx;
  var sliderEps = document.getElementById('slider-param-eps');
  var sliderMin = document.getElementById('slider-param-min');
  var valEps = document.getElementById('val-param-eps');
  var valMin = document.getElementById('val-param-min');
  var sel = document.getElementById('sel-param-data');
  var btnRegen = document.getElementById('btn-param-regen');
  var info = document.getElementById('info-params');

  var points = [];

  function genData() {
    var v = sel.value;
    if (v === 'moons') points = HC.generateMoons(200, W, H);
    else if (v === 'circles') points = HC.generateCircles(200, W, H);
    else if (v === 'spirals') points = HC.generateSpirals(200, W, H);
    else { points = HC.generateBlobs(160, 3, W, H, 28); HC.addNoise(points, 25, W, H); }
    draw();
  }

  function draw() {
    var c = HC.getColors();
    var eps = parseFloat(sliderEps.value);
    var minPts = parseInt(sliderMin.value);
    var result = HC.dbscan(points, eps, minPts);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Draw connections between core points in same cluster
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.15;
    for (var i = 0; i < points.length; i++) {
      if (result.types[i] !== 'core') continue;
      for (var k = 0; k < result.neighbors[i].length; k++) {
        var j = result.neighbors[i][k];
        if (j > i && result.types[j] === 'core' && result.labels[i] === result.labels[j]) {
          ctx.strokeStyle = c.clusters[result.labels[i] % c.clusters.length];
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // Draw points
    for (var i = 0; i < points.length; i++) {
      var lbl = result.labels[i];
      var col = lbl === -1 ? c.noise : c.clusters[lbl % c.clusters.length];
      var alpha = lbl === -1 ? 0.35 : 0.85;
      var r = result.types[i] === 'core' ? 5 : lbl === -1 ? 3 : 4;
      HC.drawPoint(ctx, points[i].x, points[i].y, r, col, alpha);
    }

    var nNoise = result.labels.filter(function(l) { return l === -1; }).length;
    info.textContent = 'Clusters: ' + result.nClusters + '  |  Noise: ' + nNoise + '  |  eps=' + eps + '  minPts=' + minPts;
  }

  sliderEps.addEventListener('input', function() { valEps.textContent = sliderEps.value; draw(); });
  sliderMin.addEventListener('input', function() { valMin.textContent = sliderMin.value; draw(); });
  sel.addEventListener('change', genData);
  btnRegen.addEventListener('click', genData);
  HC.observeTheme(draw);
  genData();
})();
</script>

The parameter sensitivity is important to understand:

- **$$\varepsilon$$ too small**: every point is noise
- **$$\varepsilon$$ too large**: everything merges into one cluster
- **MinPts too small**: noise gets absorbed into clusters
- **MinPts too large**: small clusters vanish into noise

A common heuristic: set MinPts $$\geq d + 1$$ where $$d$$ is the dimensionality of the data (so MinPts $$\geq 3$$ for 2D data). For $$\varepsilon$$, plot the k-distance graph (distance to k-th nearest neighbor, sorted) and look for an elbow.

---

## Non-Convex Cluster Comparison

Side-by-side comparison on four preset datasets. DBSCAN succeeds where K-Means fails because it does not assume convexity, it follows density.

<div class="interactive-demo" id="demo-nonconvex">
  <div class="demo-split">
    <div>
      <canvas id="canvas-nc-km"></canvas>
      <div class="demo-caption">K-Means</div>
    </div>
    <div>
      <canvas id="canvas-nc-db"></canvas>
      <div class="demo-caption">DBSCAN</div>
    </div>
  </div>
  <div class="demo-controls">
    <button class="active" id="btn-nc-moons">Moons</button>
    <button id="btn-nc-circles">Circles</button>
    <button id="btn-nc-spirals">Spirals</button>
    <button id="btn-nc-blobs">Blobs+Noise</button>
  </div>
  <div class="demo-info" id="info-nc">Comparing clustering approaches</div>
</div>

<script>
(function() {
  var W = 320, H = 280;
  var cKm = document.getElementById('canvas-nc-km');
  var cDb = document.getElementById('canvas-nc-db');
  var sKm = HC.setupCanvas(cKm, W, H);
  var sDb = HC.setupCanvas(cDb, W, H);
  var ctxKm = sKm.ctx, ctxDb = sDb.ctx;
  var info = document.getElementById('info-nc');
  var buttons = {
    moons: document.getElementById('btn-nc-moons'),
    circles: document.getElementById('btn-nc-circles'),
    spirals: document.getElementById('btn-nc-spirals'),
    blobs: document.getElementById('btn-nc-blobs')
  };

  var current = 'moons';
  var points = [];

  var epsMap = { moons: 22, circles: 20, spirals: 18, blobs: 30 };
  var kMap = { moons: 2, circles: 2, spirals: 2, blobs: 3 };

  function genAndDraw(type) {
    current = type;
    for (var key in buttons) buttons[key].classList.remove('active');
    buttons[type].classList.add('active');

    if (type === 'moons') points = HC.generateMoons(160, W, H);
    else if (type === 'circles') points = HC.generateCircles(160, W, H);
    else if (type === 'spirals') points = HC.generateSpirals(160, W, H);
    else { points = HC.generateBlobs(120, 3, W, H, 22); HC.addNoise(points, 20, W, H); }

    draw();
  }

  function draw() {
    var c = HC.getColors();
    var kmLabels = HC.kmeans(points, kMap[current], 50);
    var dbResult = HC.dbscan(points, epsMap[current], 4);

    ctxKm.fillStyle = c.bg;
    ctxKm.fillRect(0, 0, W, H);
    for (var i = 0; i < points.length; i++) {
      HC.drawPoint(ctxKm, points[i].x, points[i].y, 4, c.clusters[kmLabels[i] % c.clusters.length], 0.8);
    }

    ctxDb.fillStyle = c.bg;
    ctxDb.fillRect(0, 0, W, H);
    for (var i = 0; i < points.length; i++) {
      var lbl = dbResult.labels[i];
      HC.drawPoint(ctxDb, points[i].x, points[i].y, 4,
        lbl === -1 ? c.noise : c.clusters[lbl % c.clusters.length],
        lbl === -1 ? 0.4 : 0.8);
    }

    var nNoise = dbResult.labels.filter(function(l) { return l === -1; }).length;
    info.textContent = 'K-Means: ' + kMap[current] + ' clusters  |  DBSCAN: ' + dbResult.nClusters + ' clusters, ' + nNoise + ' noise';
  }

  for (var key in buttons) {
    (function(k) { buttons[k].addEventListener('click', function() { genAndDraw(k); }); })(key);
  }

  HC.observeTheme(draw);
  genAndDraw('moons');
})();
</script>

---

## DBSCAN Step-by-Step

Watch the algorithm unfold. It picks an unvisited core point, starts a new cluster, then recursively expands by absorbing neighbors. Use **Step** to advance one expansion at a time, or **Play** to animate.

<div class="interactive-demo" id="demo-stepwise">
  <canvas id="canvas-step"></canvas>
  <div class="demo-controls">
    <button id="btn-step-play">Play</button>
    <button id="btn-step-step">Step</button>
    <button id="btn-step-reset">Reset</button>
    <label>Speed: <input type="range" id="slider-step-speed" min="1" max="10" value="5"><span class="demo-value" id="val-step-speed">5</span></label>
  </div>
  <div class="demo-info" id="info-step">Click Play or Step to begin</div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var canvas = document.getElementById('canvas-step');
  var s = HC.setupCanvas(canvas, W, H);
  var ctx = s.ctx;
  var btnPlay = document.getElementById('btn-step-play');
  var btnStep = document.getElementById('btn-step-step');
  var btnReset = document.getElementById('btn-step-reset');
  var sliderSpeed = document.getElementById('slider-step-speed');
  var valSpeed = document.getElementById('val-step-speed');
  var info = document.getElementById('info-step');

  var points, steps, stepIdx, playing, timer;

  function init() {
    points = HC.generateMoons(120, W, H);
    HC.addNoise(points, 10, W, H);
    steps = HC.dbscanSteps(points, 24, 4);
    stepIdx = 0;
    playing = false;
    if (timer) clearTimeout(timer);
    btnPlay.textContent = 'Play';
    draw();
  }

  function draw() {
    var c = HC.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var st = steps[stepIdx];

    // Draw points
    for (var i = 0; i < points.length; i++) {
      var lbl = st.labels[i];
      var type = st.types[i];
      var col, alpha = 0.8, r = 4;

      if (lbl >= 0) {
        col = c.clusters[lbl % c.clusters.length];
        r = type === 'core' ? 5.5 : 4;
      } else if (type === 'core') {
        col = c.core;
        alpha = 0.4;
        r = 5;
      } else {
        col = c.noise;
        alpha = 0.3;
      }

      HC.drawPoint(ctx, points[i].x, points[i].y, r, col, alpha);
    }

    // Highlight current point
    if (st.current >= 0) {
      ctx.beginPath();
      ctx.arc(points[st.current].x, points[st.current].y, 24, 0, 2 * Math.PI);
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Highlight expanding points
    for (var i = 0; i < st.expanding.length; i++) {
      var idx = st.expanding[i];
      ctx.beginPath();
      ctx.arc(points[idx].x, points[idx].y, 8, 0, 2 * Math.PI);
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    info.textContent = 'Step ' + stepIdx + '/' + (steps.length - 1) + '  |  ' + st.desc;
  }

  function advance() {
    if (stepIdx >= steps.length - 1) {
      playing = false;
      btnPlay.textContent = 'Play';
      return;
    }
    stepIdx++;
    draw();
    if (playing) {
      var delay = 600 - (parseInt(sliderSpeed.value) - 1) * 55;
      timer = setTimeout(advance, delay);
    }
  }

  btnPlay.addEventListener('click', function() {
    if (playing) {
      playing = false;
      btnPlay.textContent = 'Play';
      if (timer) clearTimeout(timer);
    } else {
      if (stepIdx >= steps.length - 1) { stepIdx = 0; }
      playing = true;
      btnPlay.textContent = 'Pause';
      advance();
    }
  });

  btnStep.addEventListener('click', function() {
    playing = false;
    btnPlay.textContent = 'Play';
    if (timer) clearTimeout(timer);
    if (stepIdx < steps.length - 1) { stepIdx++; draw(); }
  });

  btnReset.addEventListener('click', init);
  sliderSpeed.addEventListener('input', function() { valSpeed.textContent = sliderSpeed.value; });
  HC.observeTheme(draw);
  init();
})();
</script>

Notice the recursive expansion: when DBSCAN encounters a new core point within the cluster, it explores that point's neighborhood too. This is what allows it to "follow" the density through curved and elongated shapes.

---

## Hierarchical Clustering: Agglomerative

Hierarchical clustering takes yet another approach. Instead of requiring K or density parameters upfront, it builds a **complete hierarchy** of clusters, from N individual points down to one big cluster. You decide how many clusters to keep afterward.

**Agglomerative** (bottom-up) hierarchical clustering works like this:

1. Start with each point as its own cluster
2. Find the two closest clusters
3. Merge them into one
4. Repeat until only one cluster remains

The key question is: how do we measure the distance between two clusters? This is the **linkage** criterion:

$$d_{\text{single}}(A, B) = \min_{a \in A, b \in B} \|a - b\|$$

$$d_{\text{complete}}(A, B) = \max_{a \in A, b \in B} \|a - b\|$$

$$d_{\text{average}}(A, B) = \frac{1}{|A||B|}\sum_{a \in A}\sum_{b \in B} \|a - b\|$$

$$d_{\text{Ward}}(A, B) = \text{SSE}(A \cup B) - \text{SSE}(A) - \text{SSE}(B)$$

where SSE is the sum of squared distances to the cluster centroid.

---

## Agglomerative Clustering Animation

Watch the bottom-up merging process. Each step finds and merges the two closest clusters. Lines connect the merging clusters on the scatter plot.

<div class="interactive-demo" id="demo-agglo">
  <canvas id="canvas-agglo"></canvas>
  <div class="demo-controls">
    <button id="btn-agglo-play">Play</button>
    <button id="btn-agglo-step">Step</button>
    <button id="btn-agglo-reset">Reset</button>
    <label>Linkage:
      <select id="sel-agglo-link">
        <option value="single">Single</option>
        <option value="complete">Complete</option>
        <option value="average">Average</option>
        <option value="ward" selected>Ward</option>
      </select>
    </label>
  </div>
  <div class="demo-info" id="info-agglo">Click Play or Step to begin merging</div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var canvas = document.getElementById('canvas-agglo');
  var s = HC.setupCanvas(canvas, W, H);
  var ctx = s.ctx;
  var btnPlay = document.getElementById('btn-agglo-play');
  var btnStep = document.getElementById('btn-agglo-step');
  var btnReset = document.getElementById('btn-agglo-reset');
  var selLink = document.getElementById('sel-agglo-link');
  var info = document.getElementById('info-agglo');

  var points, result, mergeIdx, playing, timer;

  function init() {
    points = HC.generateBlobs(30, 4, W, H, 30);
    result = HC.agglomerative(points, selLink.value);
    mergeIdx = -1;
    playing = false;
    if (timer) clearTimeout(timer);
    btnPlay.textContent = 'Play';
    draw();
  }

  function getLabelsAtStep(step) {
    var n = points.length;
    // Build union-find
    var parent = new Array(n + result.merges.length);
    for (var i = 0; i < parent.length; i++) parent[i] = i;
    function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }

    for (var m = 0; m <= step && m < result.merges.length; m++) {
      var mg = result.merges[m];
      parent[find(mg.a)] = find(mg.idx);
      parent[find(mg.b)] = find(mg.idx);
    }

    // Map roots to cluster labels
    var rootMap = {}, label = 0;
    var labels = [];
    for (var i = 0; i < n; i++) {
      var r = find(i);
      if (rootMap[r] === undefined) rootMap[r] = label++;
      labels.push(rootMap[r]);
    }
    return labels;
  }

  function draw() {
    var c = HC.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var labels = getLabelsAtStep(mergeIdx);
    var nClusters = 0;
    var seen = {};
    for (var i = 0; i < labels.length; i++) {
      if (!seen[labels[i]]) { seen[labels[i]] = true; nClusters++; }
    }

    // Draw merge line if applicable
    if (mergeIdx >= 0 && mergeIdx < result.merges.length) {
      var mg = result.merges[mergeIdx];
      var membersA = result.clusters[mg.a];
      var membersB = result.clusters[mg.b];
      // Draw line between centroids
      var cax = 0, cay = 0, cbx = 0, cby = 0;
      for (var i = 0; i < membersA.length; i++) { cax += points[membersA[i]].x; cay += points[membersA[i]].y; }
      cax /= membersA.length; cay /= membersA.length;
      for (var i = 0; i < membersB.length; i++) { cbx += points[membersB[i]].x; cby += points[membersB[i]].y; }
      cbx /= membersB.length; cby /= membersB.length;
      ctx.beginPath();
      ctx.moveTo(cax, cay);
      ctx.lineTo(cbx, cby);
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw points
    for (var i = 0; i < points.length; i++) {
      var col = c.clusters[labels[i] % c.clusters.length];
      HC.drawPoint(ctx, points[i].x, points[i].y, 5.5, col, 0.85);
    }

    info.textContent = 'Merge ' + (mergeIdx + 1) + '/' + result.merges.length + '  |  Clusters: ' + nClusters +
      (mergeIdx >= 0 ? '  |  Merge distance: ' + result.merges[mergeIdx].dist.toFixed(1) : '');
  }

  function advance() {
    if (mergeIdx >= result.merges.length - 1) {
      playing = false;
      btnPlay.textContent = 'Play';
      return;
    }
    mergeIdx++;
    draw();
    if (playing) timer = setTimeout(advance, 500);
  }

  btnPlay.addEventListener('click', function() {
    if (playing) { playing = false; btnPlay.textContent = 'Play'; if (timer) clearTimeout(timer); }
    else {
      if (mergeIdx >= result.merges.length - 1) mergeIdx = -1;
      playing = true; btnPlay.textContent = 'Pause'; advance();
    }
  });
  btnStep.addEventListener('click', function() {
    playing = false; btnPlay.textContent = 'Play'; if (timer) clearTimeout(timer);
    if (mergeIdx < result.merges.length - 1) { mergeIdx++; draw(); }
  });
  btnReset.addEventListener('click', init);
  selLink.addEventListener('change', init);
  HC.observeTheme(draw);
  init();
})();
</script>

---

## Dendrogram Builder

A **dendrogram** is the tree diagram that records the entire merge history. The y-axis shows the merge distance, the height at which two clusters were joined. Watch it grow from the bottom up as clusters merge.

<div class="interactive-demo" id="demo-dendro">
  <div class="demo-split">
    <div>
      <canvas id="canvas-dendro-scatter"></canvas>
      <div class="demo-caption">Scatter plot (colored by clusters)</div>
    </div>
    <div>
      <canvas id="canvas-dendro-tree"></canvas>
      <div class="demo-caption">Dendrogram</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btn-dendro-play">Play</button>
    <button id="btn-dendro-reset">Reset</button>
    <label>Linkage:
      <select id="sel-dendro-link">
        <option value="ward" selected>Ward</option>
        <option value="single">Single</option>
        <option value="complete">Complete</option>
        <option value="average">Average</option>
      </select>
    </label>
  </div>
  <div class="demo-info" id="info-dendro">Click Play to build the dendrogram</div>
</div>

<script>
(function() {
  var W = 330, H = 300;
  var cScatter = document.getElementById('canvas-dendro-scatter');
  var cTree = document.getElementById('canvas-dendro-tree');
  var sS = HC.setupCanvas(cScatter, W, H);
  var sT = HC.setupCanvas(cTree, W, H);
  var ctxS = sS.ctx, ctxT = sT.ctx;
  var btnPlay = document.getElementById('btn-dendro-play');
  var btnReset = document.getElementById('btn-dendro-reset');
  var selLink = document.getElementById('sel-dendro-link');
  var info = document.getElementById('info-dendro');

  var points, result, mergeIdx, playing, timer;

  function init() {
    points = HC.generateBlobs(24, 3, W, H, 25);
    result = HC.agglomerative(points, selLink.value);
    mergeIdx = -1;
    playing = false;
    if (timer) clearTimeout(timer);
    btnPlay.textContent = 'Play';
    drawAll();
  }

  function getLabelsAtStep(step) {
    var n = points.length;
    var parent = new Array(n + result.merges.length);
    for (var i = 0; i < parent.length; i++) parent[i] = i;
    function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    for (var m = 0; m <= step && m < result.merges.length; m++) {
      var mg = result.merges[m];
      parent[find(mg.a)] = find(mg.idx);
      parent[find(mg.b)] = find(mg.idx);
    }
    var rootMap = {}, label = 0, labels = [];
    for (var i = 0; i < n; i++) {
      var r = find(i);
      if (rootMap[r] === undefined) rootMap[r] = label++;
      labels.push(rootMap[r]);
    }
    return labels;
  }

  function drawScatter() {
    var c = HC.getColors();
    ctxS.fillStyle = c.bg;
    ctxS.fillRect(0, 0, W, H);
    var labels = getLabelsAtStep(mergeIdx);
    for (var i = 0; i < points.length; i++) {
      HC.drawPoint(ctxS, points[i].x, points[i].y, 5, c.clusters[labels[i] % c.clusters.length], 0.85);
    }
  }

  function drawDendro() {
    var c = HC.getColors();
    ctxT.fillStyle = c.bg;
    ctxT.fillRect(0, 0, W, H);

    if (result.merges.length === 0) return;

    var pad = { l: 40, r: 15, t: 15, b: 30 };
    var pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    var n = points.length;

    // Max dist for scaling
    var maxDist = 0;
    for (var m = 0; m < result.merges.length; m++) {
      maxDist = Math.max(maxDist, result.merges[m].dist);
    }
    maxDist *= 1.1;
    if (maxDist === 0) maxDist = 1;

    // Compute leaf order via DFS of merge tree
    var order = [];
    var nodePos = {};
    function dfs(idx) {
      if (idx < n) { order.push(idx); return; }
      var mg = result.merges[idx - n];
      if (!mg) { order.push(idx); return; }
      dfs(mg.a);
      dfs(mg.b);
    }
    dfs(result.merges.length > 0 ? result.merges[result.merges.length - 1].idx : 0);

    // Assign x positions to leaves
    for (var i = 0; i < order.length; i++) {
      nodePos[order[i]] = pad.l + (i + 0.5) / order.length * pw;
    }

    // Y scale
    function yScale(d) { return H - pad.b - (d / maxDist) * ph; }

    // Draw axes
    ctxT.strokeStyle = c.axis;
    ctxT.lineWidth = 1;
    ctxT.beginPath();
    ctxT.moveTo(pad.l, pad.t);
    ctxT.lineTo(pad.l, H - pad.b);
    ctxT.stroke();

    // Y ticks
    ctxT.fillStyle = c.textMuted;
    ctxT.font = '10px sans-serif';
    ctxT.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var val = maxDist * i / 4;
      var y = yScale(val);
      ctxT.fillText(val.toFixed(0), pad.l - 4, y + 3);
      ctxT.strokeStyle = c.grid;
      ctxT.beginPath();
      ctxT.moveTo(pad.l, y);
      ctxT.lineTo(W - pad.r, y);
      ctxT.stroke();
    }

    // Draw merges up to current step
    ctxT.strokeStyle = c.dendro;
    ctxT.lineWidth = 1.5;
    var drawUpTo = Math.min(mergeIdx, result.merges.length - 1);
    for (var m = 0; m <= drawUpTo; m++) {
      var mg = result.merges[m];
      var xA = nodePos[mg.a], xB = nodePos[mg.b];
      var yMerge = yScale(mg.dist);
      var yA = mg.a < n ? yScale(0) : yScale(result.merges[mg.a - n].dist);
      var yB = mg.b < n ? yScale(0) : yScale(result.merges[mg.b - n].dist);

      // Draw U shape
      ctxT.beginPath();
      ctxT.moveTo(xA, yA);
      ctxT.lineTo(xA, yMerge);
      ctxT.lineTo(xB, yMerge);
      ctxT.lineTo(xB, yB);
      ctxT.stroke();

      // Position for merged node
      nodePos[mg.idx] = (xA + xB) / 2;
    }
  }

  function drawAll() { drawScatter(); drawDendro(); }

  function advance() {
    if (mergeIdx >= result.merges.length - 1) {
      playing = false;
      btnPlay.textContent = 'Play';
      return;
    }
    mergeIdx++;
    drawAll();
    info.textContent = 'Merge ' + (mergeIdx + 1) + '/' + result.merges.length +
      '  |  Distance: ' + result.merges[mergeIdx].dist.toFixed(1);
    if (playing) timer = setTimeout(advance, 400);
  }

  btnPlay.addEventListener('click', function() {
    if (playing) { playing = false; btnPlay.textContent = 'Play'; if (timer) clearTimeout(timer); }
    else {
      if (mergeIdx >= result.merges.length - 1) mergeIdx = -1;
      playing = true; btnPlay.textContent = 'Pause'; advance();
    }
  });
  btnReset.addEventListener('click', init);
  selLink.addEventListener('change', init);
  HC.observeTheme(drawAll);
  init();
})();
</script>

The dendrogram encodes the **entire clustering hierarchy**. Tall vertical bars indicate large jumps in merge distance, these are natural cluster boundaries. The next demo makes this actionable.

---

## Cut Height Slider

Drag the cut line up and down on the dendrogram. Every horizontal cut defines a set of clusters: the number of vertical lines it crosses equals the number of clusters. Watch the scatter plot update in real-time.

<div class="interactive-demo" id="demo-cut">
  <div class="demo-split">
    <div>
      <canvas id="canvas-cut-scatter"></canvas>
      <div class="demo-caption">Clusters at current cut height</div>
    </div>
    <div>
      <canvas id="canvas-cut-dendro"></canvas>
      <div class="demo-caption">Dendrogram (drag red line)</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Cut height: <input type="range" id="slider-cut-height" min="0" max="100" value="50"><span class="demo-value" id="val-cut-height">50%</span></label>
    <label>Linkage:
      <select id="sel-cut-link">
        <option value="ward" selected>Ward</option>
        <option value="single">Single</option>
        <option value="complete">Complete</option>
        <option value="average">Average</option>
      </select>
    </label>
    <button id="btn-cut-regen">Regenerate</button>
  </div>
  <div class="demo-info" id="info-cut">Drag the slider to change the cut height</div>
</div>

<div class="demo-hint">Move the cut line low to get many small clusters. Move it high to get fewer, larger clusters. The "right" cut is where there is a big gap in the dendrogram, a natural separation between merge distances.</div>

<script>
(function() {
  var W = 330, H = 300;
  var cS = document.getElementById('canvas-cut-scatter');
  var cD = document.getElementById('canvas-cut-dendro');
  var sS = HC.setupCanvas(cS, W, H);
  var sD = HC.setupCanvas(cD, W, H);
  var ctxS = sS.ctx, ctxD = sD.ctx;
  var slider = document.getElementById('slider-cut-height');
  var valH = document.getElementById('val-cut-height');
  var selLink = document.getElementById('sel-cut-link');
  var btnRegen = document.getElementById('btn-cut-regen');
  var info = document.getElementById('info-cut');

  var points, result, maxDist;

  function init() {
    points = HC.generateBlobs(30, 4, W, H, 22);
    result = HC.agglomerative(points, selLink.value);
    maxDist = 0;
    for (var m = 0; m < result.merges.length; m++) {
      maxDist = Math.max(maxDist, result.merges[m].dist);
    }
    maxDist *= 1.15;
    if (maxDist === 0) maxDist = 1;
    drawAll();
  }

  function getCutDist() {
    return (parseFloat(slider.value) / 100) * maxDist;
  }

  function drawScatter() {
    var c = HC.getColors();
    ctxS.fillStyle = c.bg;
    ctxS.fillRect(0, 0, W, H);
    var labels = HC.cutTree(result, getCutDist());
    for (var i = 0; i < points.length; i++) {
      HC.drawPoint(ctxS, points[i].x, points[i].y, 5, c.clusters[labels[i] % c.clusters.length], 0.85);
    }
    var nC = 0, seen = {};
    for (var i = 0; i < labels.length; i++) { if (!seen[labels[i]]) { seen[labels[i]] = true; nC++; } }
    return nC;
  }

  function drawDendro() {
    var c = HC.getColors();
    ctxD.fillStyle = c.bg;
    ctxD.fillRect(0, 0, W, H);
    if (result.merges.length === 0) return;

    var pad = { l: 40, r: 15, t: 15, b: 30 };
    var pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    var n = points.length;

    function yScale(d) { return H - pad.b - (d / maxDist) * ph; }

    var order = [];
    var nodePos = {};
    function dfs(idx) {
      if (idx < n) { order.push(idx); return; }
      var mg = result.merges[idx - n];
      if (!mg) { order.push(idx); return; }
      dfs(mg.a); dfs(mg.b);
    }
    dfs(result.merges[result.merges.length - 1].idx);

    for (var i = 0; i < order.length; i++) {
      nodePos[order[i]] = pad.l + (i + 0.5) / order.length * pw;
    }

    // Axes
    ctxD.strokeStyle = c.axis;
    ctxD.lineWidth = 1;
    ctxD.beginPath();
    ctxD.moveTo(pad.l, pad.t);
    ctxD.lineTo(pad.l, H - pad.b);
    ctxD.stroke();

    ctxD.fillStyle = c.textMuted;
    ctxD.font = '10px sans-serif';
    ctxD.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var val = maxDist * i / 4;
      var y = yScale(val);
      ctxD.fillText(val.toFixed(0), pad.l - 4, y + 3);
      ctxD.strokeStyle = c.grid;
      ctxD.beginPath(); ctxD.moveTo(pad.l, y); ctxD.lineTo(W - pad.r, y); ctxD.stroke();
    }

    // Get labels for coloring
    var labels = HC.cutTree(result, getCutDist());

    // Draw all merges
    for (var m = 0; m < result.merges.length; m++) {
      var mg = result.merges[m];
      var xA = nodePos[mg.a], xB = nodePos[mg.b];
      var yMerge = yScale(mg.dist);
      var yA = mg.a < n ? yScale(0) : yScale(result.merges[mg.a - n].dist);
      var yB = mg.b < n ? yScale(0) : yScale(result.merges[mg.b - n].dist);

      // Color: if merge is below cut, color by cluster
      if (mg.dist <= getCutDist()) {
        var rep = result.clusters[mg.idx][0];
        ctxD.strokeStyle = c.clusters[labels[rep] % c.clusters.length];
      } else {
        ctxD.strokeStyle = c.textMuted;
      }
      ctxD.lineWidth = 1.5;
      ctxD.beginPath();
      ctxD.moveTo(xA, yA); ctxD.lineTo(xA, yMerge); ctxD.lineTo(xB, yMerge); ctxD.lineTo(xB, yB);
      ctxD.stroke();

      nodePos[mg.idx] = (xA + xB) / 2;
    }

    // Draw cut line
    var cutY = yScale(getCutDist());
    ctxD.strokeStyle = c.cutLine;
    ctxD.lineWidth = 2;
    ctxD.setLineDash([6, 4]);
    ctxD.beginPath();
    ctxD.moveTo(pad.l, cutY);
    ctxD.lineTo(W - pad.r, cutY);
    ctxD.stroke();
    ctxD.setLineDash([]);

    ctxD.fillStyle = c.cutLine;
    ctxD.font = 'bold 11px sans-serif';
    ctxD.textAlign = 'left';
    ctxD.fillText('cut', W - pad.r - 22, cutY - 5);
  }

  function drawAll() {
    var nC = drawScatter();
    drawDendro();
    valH.textContent = slider.value + '%';
    info.textContent = 'Cut distance: ' + getCutDist().toFixed(1) + '  |  Clusters: ' + nC;
  }

  slider.addEventListener('input', drawAll);
  selLink.addEventListener('change', init);
  btnRegen.addEventListener('click', init);
  HC.observeTheme(drawAll);
  init();
})();
</script>

This is the great advantage of hierarchical clustering: you do not need to choose the number of clusters in advance. Build the full hierarchy once, then explore different cuts.

---

## Linkage Comparison

The choice of linkage dramatically affects the result. Here are four linkage methods applied to the same data. Notice how **single linkage** creates elongated "chain" clusters, **complete linkage** prefers compact clusters, **average** is a compromise, and **Ward** minimizes total variance (similar to K-Means).

<div class="interactive-demo" id="demo-linkage">
  <div class="demo-quad">
    <div>
      <canvas id="canvas-link-single"></canvas>
      <div class="demo-caption">Single linkage</div>
    </div>
    <div>
      <canvas id="canvas-link-complete"></canvas>
      <div class="demo-caption">Complete linkage</div>
    </div>
    <div>
      <canvas id="canvas-link-average"></canvas>
      <div class="demo-caption">Average linkage</div>
    </div>
    <div>
      <canvas id="canvas-link-ward"></canvas>
      <div class="demo-caption">Ward linkage</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Clusters: <input type="range" id="slider-link-k" min="2" max="6" value="3"><span class="demo-value" id="val-link-k">3</span></label>
    <button id="btn-link-regen">Regenerate</button>
  </div>
  <div class="demo-info" id="info-linkage">Comparing four linkage methods on identical data</div>
</div>

<script>
(function() {
  var W = 320, H = 240;
  var canvases = {
    single: document.getElementById('canvas-link-single'),
    complete: document.getElementById('canvas-link-complete'),
    average: document.getElementById('canvas-link-average'),
    ward: document.getElementById('canvas-link-ward')
  };
  var contexts = {};
  for (var key in canvases) {
    var s = HC.setupCanvas(canvases[key], W, H);
    contexts[key] = s.ctx;
  }
  var sliderK = document.getElementById('slider-link-k');
  var valK = document.getElementById('val-link-k');
  var btnRegen = document.getElementById('btn-link-regen');
  var info = document.getElementById('info-linkage');

  var points, results = {};

  function init() {
    points = HC.generateBlobs(40, 4, W, H, 25);
    var linkages = ['single', 'complete', 'average', 'ward'];
    for (var l = 0; l < linkages.length; l++) {
      results[linkages[l]] = HC.agglomerative(points, linkages[l]);
    }
    draw();
  }

  function draw() {
    var c = HC.getColors();
    var nClusters = parseInt(sliderK.value);
    var linkages = ['single', 'complete', 'average', 'ward'];

    for (var l = 0; l < linkages.length; l++) {
      var link = linkages[l];
      var ctx = contexts[link];
      var res = results[link];

      // Find cut distance for nClusters
      // We need to find the merge that reduces cluster count to nClusters
      var cutIdx = res.merges.length - nClusters;
      var cutDist = cutIdx >= 0 && cutIdx < res.merges.length ? res.merges[cutIdx].dist : 0;
      if (cutIdx < 0) cutDist = 0;

      var labels = HC.cutTree(res, cutDist);

      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < points.length; i++) {
        HC.drawPoint(ctx, points[i].x, points[i].y, 4.5, c.clusters[labels[i] % c.clusters.length], 0.85);
      }
    }

    info.textContent = nClusters + ' clusters  |  Same data, different linkage methods';
  }

  sliderK.addEventListener('input', function() { valK.textContent = sliderK.value; draw(); });
  btnRegen.addEventListener('click', init);
  HC.observeTheme(draw);
  init();
})();
</script>

<div class="demo-hint">Try 2 clusters. Single linkage will often "chain" disparate groups together, while Ward gives balanced, round clusters. Try 4 clusters on data with 4 natural groups, Ward and complete usually agree, but single linkage may isolate individual outliers as their own cluster.</div>

---

## Summary: When to Use What

Each clustering method has its strengths. Here is a practical guide:

<table class="hc-table">
<thead>
<tr>
  <th>Property</th>
  <th>K-Means</th>
  <th>DBSCAN</th>
  <th>Hierarchical</th>
</tr>
</thead>
<tbody>
<tr>
  <td><strong>Cluster shape</strong></td>
  <td>Convex (spherical)</td>
  <td>Arbitrary</td>
  <td>Depends on linkage</td>
</tr>
<tr>
  <td><strong>Number of clusters</strong></td>
  <td>Must specify K</td>
  <td>Automatic</td>
  <td>Choose via dendrogram cut</td>
</tr>
<tr>
  <td><strong>Handles noise</strong></td>
  <td>No (assigns everything)</td>
  <td>Yes (labels outliers)</td>
  <td>No (assigns everything)</td>
</tr>
<tr>
  <td><strong>Parameters</strong></td>
  <td>K</td>
  <td>$$\varepsilon$$, MinPts</td>
  <td>Linkage method, cut height</td>
</tr>
<tr>
  <td><strong>Time complexity</strong></td>
  <td>$$O(nKt)$$</td>
  <td>$$O(n^2)$$ typical</td>
  <td>$$O(n^3)$$ naive</td>
</tr>
<tr>
  <td><strong>Scalability</strong></td>
  <td>Excellent</td>
  <td>Good</td>
  <td>Poor for large N</td>
</tr>
<tr>
  <td><strong>Best for</strong></td>
  <td>Large data, round clusters</td>
  <td>Non-convex, noisy data</td>
  <td>Small data, need hierarchy</td>
</tr>
</tbody>
</table>

**Rules of thumb:**

- **Start with K-Means** if your clusters are likely round and you have a rough idea of K. It is fast and often good enough.
- **Use DBSCAN** when you suspect non-convex clusters, have noise/outliers, or do not know K. You need to tune $$\varepsilon$$ and MinPts.
- **Use hierarchical clustering** when N is small enough (under a few thousand), you want to explore multiple granularities, or you need the dendrogram itself (e.g., for taxonomy or phylogenetics).
- **Single linkage** is good for detecting elongated or chain-like clusters but is sensitive to noise.
- **Ward linkage** produces compact, balanced clusters and is often the best default.

---

## Key Takeaways

1. **K-Means fails on non-convex shapes** because it uses distance to centroids, which always produces convex boundaries.

2. **DBSCAN** defines clusters as dense regions separated by sparse regions. It requires no K, handles arbitrary shapes, and identifies noise. The tradeoff is sensitivity to $$\varepsilon$$ and MinPts.

3. **Hierarchical clustering** builds a complete merge tree. You choose the number of clusters afterward by cutting the dendrogram. It is flexible but $$O(n^3)$$ for naive implementations.

4. **Linkage matters**. Single linkage follows chains; complete and Ward linkage prefer compact clusters. The choice significantly affects results.

5. **There is no universally best method.** The right choice depends on your data shape, size, noise level, and whether you need to specify K in advance.

In the next chapter, we will shift from unsupervised learning to **dimensionality reduction**, techniques like PCA that let us visualize and compress high-dimensional data.
