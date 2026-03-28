---
layout: post
title: "Random Forests & Bagging from Scratch - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Watch a random forest grow tree-by-tree, see bootstrap sampling in action, compare individual vs ensemble predictions, and explore feature importance - all interactively."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /random-forests/
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
.rf-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.9rem;
}
.rf-table th, .rf-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}
.rf-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
.rf-table td {
  background: var(--bg-primary);
}
</style>

<script>
window.RF = (function() {
  var R = {};

  R.getColors = function() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') &&
       window.matchMedia('(prefers-color-scheme: dark)').matches);
    return {
      bg: isDark ? '#1a1b26' : '#ffffff',
      bgSecondary: isDark ? '#24283b' : '#f1f5f9',
      text: isDark ? '#c0caf5' : '#1e293b',
      textMuted: isDark ? '#565f89' : '#94a3b8',
      grid: isDark ? '#292e42' : '#e2e8f0',
      border: isDark ? '#3b4261' : '#cbd5e1',
      accent: isDark ? '#7aa2f7' : '#2563eb',
      class0: isDark ? '#7aa2f7' : '#2563eb',
      class0Light: isDark ? 'rgba(122,162,247,0.15)' : 'rgba(37,99,235,0.12)',
      class0Mid: isDark ? 'rgba(122,162,247,0.4)' : 'rgba(37,99,235,0.3)',
      class1: isDark ? '#f7768e' : '#e63946',
      class1Light: isDark ? 'rgba(247,118,142,0.15)' : 'rgba(230,57,70,0.12)',
      class1Mid: isDark ? 'rgba(247,118,142,0.4)' : 'rgba(230,57,70,0.3)',
      highlight: isDark ? '#e0af68' : '#d97706',
      success: isDark ? '#9ece6a' : '#16a34a',
      treeColors: isDark
        ? ['#7aa2f7','#f7768e','#9ece6a','#ff9e64','#bb9af7','#2ac3de','#e0af68','#73daca']
        : ['#2563eb','#e63946','#16a34a','#ea580c','#7c3aed','#0891b2','#ca8a04','#059669'],
      isDark: isDark
    };
  };

  R.setupCanvas = function(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  R.observeTheme = function(cb) {
    var obs = new MutationObserver(function() { cb(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb);
  };

  R.randGauss = function() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  // --- Dataset Generators ---
  R.genMoons = function(n) {
    var pts = [];
    var half = Math.floor(n / 2);
    for (var i = 0; i < half; i++) {
      var t = Math.PI * i / half;
      pts.push({ x: Math.cos(t) + R.randGauss() * 0.15, y: Math.sin(t) + R.randGauss() * 0.15, label: 0 });
    }
    for (var i = 0; i < n - half; i++) {
      var t = Math.PI * i / (n - half);
      pts.push({ x: 1 - Math.cos(t) + R.randGauss() * 0.15, y: 0.5 - Math.sin(t) + R.randGauss() * 0.15, label: 1 });
    }
    return pts;
  };

  R.genCircles = function(n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var angle = Math.random() * Math.PI * 2;
      var inner = i < n / 2;
      var r = inner ? 0.4 + R.randGauss() * 0.1 : 1.1 + R.randGauss() * 0.12;
      pts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r, label: inner ? 0 : 1 });
    }
    return pts;
  };

  R.genBlobs = function(n) {
    var pts = [];
    var half = Math.floor(n / 2);
    for (var i = 0; i < half; i++) {
      pts.push({ x: -1 + R.randGauss() * 0.55, y: -0.5 + R.randGauss() * 0.55, label: 0 });
    }
    for (var i = 0; i < n - half; i++) {
      pts.push({ x: 1 + R.randGauss() * 0.55, y: 0.5 + R.randGauss() * 0.55, label: 1 });
    }
    return pts;
  };

  R.genSpiral = function(n) {
    var pts = [];
    var half = Math.floor(n / 2);
    for (var i = 0; i < half; i++) {
      var t = 1.5 * Math.PI * i / half + 0.5;
      var r = t / 5;
      pts.push({ x: r * Math.cos(t) + R.randGauss() * 0.08, y: r * Math.sin(t) + R.randGauss() * 0.08, label: 0 });
    }
    for (var i = 0; i < n - half; i++) {
      var t = 1.5 * Math.PI * i / (n - half) + 0.5;
      var r = t / 5;
      pts.push({ x: -r * Math.cos(t) + R.randGauss() * 0.08, y: -r * Math.sin(t) + R.randGauss() * 0.08, label: 1 });
    }
    return pts;
  };

  // --- Bootstrap Sampling ---
  R.bootstrap = function(data) {
    var n = data.length;
    var sample = [];
    var chosen = {};
    for (var i = 0; i < n; i++) {
      var idx = Math.floor(Math.random() * n);
      sample.push(data[idx]);
      chosen[idx] = true;
    }
    var oob = [];
    for (var i = 0; i < n; i++) {
      if (!chosen[i]) oob.push(i);
    }
    return { sample: sample, oobIndices: oob, chosenMap: chosen };
  };

  // --- Decision Tree (axis-aligned, for 2D classification) ---
  // Features are x and y. Labels are 0 or 1.
  function gini(counts, total) {
    if (total === 0) return 0;
    var imp = 1;
    for (var k in counts) {
      var p = counts[k] / total;
      imp -= p * p;
    }
    return imp;
  }

  function countLabels(data) {
    var c = {};
    for (var i = 0; i < data.length; i++) {
      var l = data[i].label;
      c[l] = (c[l] || 0) + 1;
    }
    return c;
  }

  function majorityLabel(data) {
    var c = countLabels(data);
    var best = -1, bestK = 0;
    for (var k in c) {
      if (c[k] > best) { best = c[k]; bestK = parseInt(k); }
    }
    return bestK;
  }

  function bestSplit(data, featureSubset) {
    var bestGain = -1, bestFeat = null, bestThresh = null;
    var n = data.length;
    if (n < 2) return null;
    var parentCounts = countLabels(data);
    var parentGini = gini(parentCounts, n);

    var features = featureSubset || ['x', 'y'];
    for (var fi = 0; fi < features.length; fi++) {
      var feat = features[fi];
      var vals = [];
      for (var i = 0; i < n; i++) vals.push(data[i][feat]);
      vals.sort(function(a, b) { return a - b; });
      // Try midpoints between unique values (sample up to 20 thresholds)
      var uniq = [vals[0]];
      for (var i = 1; i < vals.length; i++) {
        if (vals[i] !== vals[i - 1]) uniq.push(vals[i]);
      }
      var step = Math.max(1, Math.floor(uniq.length / 20));
      for (var ti = 0; ti < uniq.length - 1; ti += step) {
        var thresh = (uniq[ti] + uniq[ti + 1]) / 2;
        var leftC = {}, rightC = {}, nL = 0, nR = 0;
        for (var i = 0; i < n; i++) {
          var l = data[i].label;
          if (data[i][feat] <= thresh) { leftC[l] = (leftC[l] || 0) + 1; nL++; }
          else { rightC[l] = (rightC[l] || 0) + 1; nR++; }
        }
        if (nL === 0 || nR === 0) continue;
        var gain = parentGini - (nL / n) * gini(leftC, nL) - (nR / n) * gini(rightC, nR);
        if (gain > bestGain) {
          bestGain = gain;
          bestFeat = feat;
          bestThresh = thresh;
        }
      }
    }
    if (bestGain <= 0) return null;
    return { feature: bestFeat, threshold: bestThresh, gain: bestGain };
  }

  // Build a decision tree (returns tree node)
  // maxDepth, minSamples, maxFeatures (number of features to consider per split)
  R.buildTree = function(data, maxDepth, minSamples, maxFeatures) {
    maxDepth = maxDepth || 8;
    minSamples = minSamples || 2;
    maxFeatures = maxFeatures || 2; // total features = 2 (x, y)

    function build(subset, depth) {
      if (depth >= maxDepth || subset.length < minSamples) {
        return { leaf: true, label: majorityLabel(subset), count: subset.length };
      }
      var counts = countLabels(subset);
      var keys = Object.keys(counts);
      if (keys.length <= 1) {
        return { leaf: true, label: parseInt(keys[0]) || 0, count: subset.length };
      }

      // Random feature subset
      var allFeats = ['x', 'y'];
      var feats;
      if (maxFeatures >= 2) {
        feats = allFeats;
      } else {
        var idx = Math.floor(Math.random() * 2);
        feats = [allFeats[idx]];
      }

      var split = bestSplit(subset, feats);
      if (!split) {
        return { leaf: true, label: majorityLabel(subset), count: subset.length };
      }

      var left = [], right = [];
      for (var i = 0; i < subset.length; i++) {
        if (subset[i][split.feature] <= split.threshold) left.push(subset[i]);
        else right.push(subset[i]);
      }
      if (left.length === 0 || right.length === 0) {
        return { leaf: true, label: majorityLabel(subset), count: subset.length };
      }

      return {
        leaf: false,
        feature: split.feature,
        threshold: split.threshold,
        gain: split.gain,
        left: build(left, depth + 1),
        right: build(right, depth + 1)
      };
    }

    return build(data, 0);
  };

  // Predict with a single tree
  R.predictTree = function(tree, point) {
    var node = tree;
    while (!node.leaf) {
      if (point[node.feature] <= node.threshold) node = node.left;
      else node = node.right;
    }
    return node.label;
  };

  // Collect feature importance from a tree (sum of gain * n at each split)
  R.treeImportance = function(tree, totalN) {
    var imp = { x: 0, y: 0 };
    function walk(node) {
      if (node.leaf) return;
      imp[node.feature] += node.gain;
      walk(node.left);
      walk(node.right);
    }
    walk(tree);
    return imp;
  };

  // --- Random Forest ---
  R.buildForest = function(data, nTrees, maxDepth, minSamples, maxFeatures) {
    maxDepth = maxDepth || 8;
    minSamples = minSamples || 2;
    maxFeatures = maxFeatures || 1; // sqrt(2) ~ 1.4, so 1 feature per split
    var trees = [];
    var oobSets = [];
    for (var t = 0; t < nTrees; t++) {
      var bs = R.bootstrap(data);
      var tree = R.buildTree(bs.sample, maxDepth, minSamples, maxFeatures);
      trees.push(tree);
      oobSets.push(bs.oobIndices);
    }
    return { trees: trees, oobSets: oobSets };
  };

  // Predict with the forest (majority vote)
  R.predictForest = function(forest, point, nTrees) {
    var votes = [0, 0];
    var count = nTrees || forest.trees.length;
    for (var t = 0; t < count; t++) {
      var pred = R.predictTree(forest.trees[t], point);
      votes[pred]++;
    }
    return votes[1] > votes[0] ? 1 : 0;
  };

  // Predict with confidence (fraction of trees voting class 1)
  R.predictForestProba = function(forest, point, nTrees) {
    var count = nTrees || forest.trees.length;
    var v1 = 0;
    for (var t = 0; t < count; t++) {
      if (R.predictTree(forest.trees[t], point) === 1) v1++;
    }
    return v1 / count;
  };

  // Forest accuracy
  R.accuracy = function(data, forest, nTrees) {
    var correct = 0;
    for (var i = 0; i < data.length; i++) {
      var pred = R.predictForest(forest, data[i], nTrees);
      if (pred === data[i].label) correct++;
    }
    return correct / data.length;
  };

  // OOB error
  R.oobError = function(data, forest, nTrees) {
    var count = nTrees || forest.trees.length;
    var correct = 0, total = 0;
    for (var i = 0; i < data.length; i++) {
      var votes = [0, 0];
      var voted = false;
      for (var t = 0; t < count; t++) {
        // Check if i is in the OOB set for tree t
        if (forest.oobSets[t].indexOf(i) >= 0) {
          var pred = R.predictTree(forest.trees[t], data[i]);
          votes[pred]++;
          voted = true;
        }
      }
      if (voted) {
        var pred = votes[1] > votes[0] ? 1 : 0;
        if (pred === data[i].label) correct++;
        total++;
      }
    }
    return total > 0 ? 1 - correct / total : 0;
  };

  // Feature importance across forest
  R.featureImportance = function(forest, nTrees) {
    var count = nTrees || forest.trees.length;
    var imp = { x: 0, y: 0 };
    for (var t = 0; t < count; t++) {
      var ti = R.treeImportance(forest.trees[t]);
      imp.x += ti.x;
      imp.y += ti.y;
    }
    var total = imp.x + imp.y;
    if (total > 0) { imp.x /= total; imp.y /= total; }
    return imp;
  };

  // --- Drawing Helpers ---
  R.drawGrid = function(ctx, W, H, pad, c) {
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 8; i++) {
      var x = pad + (W - 2 * pad) * i / 8;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H - pad); ctx.stroke();
      var y = pad + (H - 2 * pad) * i / 8;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);
  };

  R.getDataRange = function(data) {
    var xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    for (var i = 0; i < data.length; i++) {
      if (data[i].x < xMin) xMin = data[i].x;
      if (data[i].x > xMax) xMax = data[i].x;
      if (data[i].y < yMin) yMin = data[i].y;
      if (data[i].y > yMax) yMax = data[i].y;
    }
    var mx = (xMax - xMin) * 0.15 || 0.5;
    var my = (yMax - yMin) * 0.15 || 0.5;
    return { xR: [xMin - mx, xMax + mx], yR: [yMin - my, yMax + my] };
  };

  R.toCanvas = function(px, py, W, H, pad, xR, yR) {
    return {
      x: pad + (px - xR[0]) / (xR[1] - xR[0]) * (W - 2 * pad),
      y: H - pad - (py - yR[0]) / (yR[1] - yR[0]) * (H - 2 * pad)
    };
  };

  R.drawPoints = function(ctx, data, W, H, pad, xR, yR, c, highlights) {
    for (var i = 0; i < data.length; i++) {
      var p = data[i];
      var cp = R.toCanvas(p.x, p.y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? c.class1 : c.class0;
      if (highlights && !highlights[i]) ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  };

  // Draw decision boundary via pixel grid
  R.drawBoundary = function(ctx, W, H, pad, xR, yR, predictor, c, resolution) {
    resolution = resolution || 3;
    var iW = W - 2 * pad, iH = H - 2 * pad;
    for (var py = 0; py < iH; py += resolution) {
      for (var px = 0; px < iW; px += resolution) {
        var dx = xR[0] + (px / iW) * (xR[1] - xR[0]);
        var dy = yR[1] - (py / iH) * (yR[1] - yR[0]);
        var pred = predictor({ x: dx, y: dy });
        ctx.fillStyle = pred === 1 ? c.class1Light : c.class0Light;
        ctx.fillRect(pad + px, pad + py, resolution, resolution);
      }
    }
  };

  // Draw boundary with confidence shading
  R.drawBoundaryProba = function(ctx, W, H, pad, xR, yR, probaFn, c, resolution) {
    resolution = resolution || 3;
    var iW = W - 2 * pad, iH = H - 2 * pad;
    for (var py = 0; py < iH; py += resolution) {
      for (var px = 0; px < iW; px += resolution) {
        var dx = xR[0] + (px / iW) * (xR[1] - xR[0]);
        var dy = yR[1] - (py / iH) * (yR[1] - yR[0]);
        var prob = probaFn({ x: dx, y: dy });
        // Blend from class0Light to class1Light based on prob
        var alpha = Math.abs(prob - 0.5) * 2; // 0 at boundary, 1 at edges
        alpha = 0.08 + alpha * 0.2;
        if (prob > 0.5) {
          ctx.fillStyle = c.isDark ? 'rgba(247,118,142,' + alpha + ')' : 'rgba(230,57,70,' + alpha + ')';
        } else {
          ctx.fillStyle = c.isDark ? 'rgba(122,162,247,' + alpha + ')' : 'rgba(37,99,235,' + alpha + ')';
        }
        ctx.fillRect(pad + px, pad + py, resolution, resolution);
      }
    }
  };

  return R;
})();
</script>

A single decision tree is fast, interpretable, and intuitive. But it has a fatal flaw: it **overfits**. A fully grown decision tree memorizes every quirk and noise pattern in the training data, producing jagged, unstable decision boundaries that fall apart on new data.

What if, instead of trusting one opinionated tree, we consulted a whole **forest** of diverse trees and let them vote? That is the core insight behind **Random Forests**, one of the most successful and widely used machine learning algorithms.

In this chapter, we will build Random Forests from scratch, starting with the **bagging** (bootstrap aggregating) principle, and see how combining many weak, overfitting trees produces a strong, smooth classifier.

---

## 1. Why Ensembles? The Problem with a Single Tree

A single deep decision tree creates very complex, jagged decision boundaries. It perfectly fits the training data, but small changes in the data can produce completely different trees. This is **high variance**.

The ensemble idea is simple: if individual trees are noisy but on average correct, combining many of them cancels out the noise. This is the **wisdom of crowds** applied to machine learning.

Mathematically, if we have $$B$$ independent estimators each with variance $$\sigma^2$$, the variance of their average is:

$$\text{Var}\left(\frac{1}{B}\sum_{b=1}^{B} f_b(x)\right) = \frac{\sigma^2}{B}$$

More trees means lower variance. Let us see this in action.

### Try It: Single Tree vs Ensemble

<div class="demo-hint">
<strong>Interactive:</strong> Compare a single decision tree (left) against a 20-tree ensemble (right) on the same dataset. Click <strong>Regenerate</strong> to see how unstable the single tree is, while the ensemble remains stable. Use the dataset selector to try different shapes.
</div>

<div class="interactive-demo">
  <div class="demo-controls">
    <button id="why-regen">Regenerate</button>
    <label>Dataset:
      <select id="why-dataset" style="padding:0.3rem;border-radius:4px;border:1px solid var(--border);background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
        <option value="moons">Moons</option>
        <option value="circles">Circles</option>
        <option value="blobs">Blobs</option>
      </select>
    </label>
  </div>
  <div class="demo-split">
    <div>
      <canvas id="why-single-canvas"></canvas>
      <div class="demo-caption">Single Tree (depth=8)</div>
    </div>
    <div>
      <canvas id="why-ensemble-canvas"></canvas>
      <div class="demo-caption">20-Tree Ensemble</div>
    </div>
  </div>
  <div class="demo-info" id="why-info">Click Regenerate to compare stability</div>
</div>

<script>
(function() {
  var W = 320, H = 280, pad = 10;
  var canvasS = document.getElementById('why-single-canvas');
  var canvasE = document.getElementById('why-ensemble-canvas');
  var regenBtn = document.getElementById('why-regen');
  var datasetSel = document.getElementById('why-dataset');
  var infoEl = document.getElementById('why-info');

  var data = [];
  var range = {};

  function genData() {
    var ds = datasetSel.value;
    if (ds === 'moons') data = RF.genMoons(120);
    else if (ds === 'circles') data = RF.genCircles(120);
    else data = RF.genBlobs(120);
    range = RF.getDataRange(data);
  }

  function draw() {
    var c = RF.getColors();
    // Single tree
    var tree = RF.buildTree(data, 8, 2, 2);
    var ctxS = RF.setupCanvas(canvasS, W, H);
    ctxS.fillStyle = c.bg;
    ctxS.fillRect(0, 0, W, H);
    RF.drawBoundary(ctxS, W, H, pad, range.xR, range.yR, function(pt) {
      return RF.predictTree(tree, pt);
    }, c, 4);
    RF.drawPoints(ctxS, data, W, H, pad, range.xR, range.yR, c);

    var singleAcc = 0;
    for (var i = 0; i < data.length; i++) {
      if (RF.predictTree(tree, data[i]) === data[i].label) singleAcc++;
    }
    singleAcc /= data.length;

    // Ensemble
    var forest = RF.buildForest(data, 20, 8, 2, 1);
    var ctxE = RF.setupCanvas(canvasE, W, H);
    ctxE.fillStyle = c.bg;
    ctxE.fillRect(0, 0, W, H);
    RF.drawBoundaryProba(ctxE, W, H, pad, range.xR, range.yR, function(pt) {
      return RF.predictForestProba(forest, pt, 20);
    }, c, 4);
    RF.drawPoints(ctxE, data, W, H, pad, range.xR, range.yR, c);

    var ensAcc = RF.accuracy(data, forest, 20);
    infoEl.textContent = 'Single tree acc: ' + (singleAcc * 100).toFixed(1) + '%  |  Ensemble acc: ' + (ensAcc * 100).toFixed(1) + '%';
  }

  regenBtn.addEventListener('click', function() { genData(); draw(); });
  datasetSel.addEventListener('change', function() { genData(); draw(); });
  RF.observeTheme(draw);
  genData();
  draw();
})();
</script>

Notice how the single tree's boundary is jagged and changes dramatically each time you regenerate. The ensemble's boundary is much smoother and more stable. This is variance reduction in action.

---

## 2. Bootstrap Sampling

The foundation of bagging is **bootstrap sampling**: creating new training sets by sampling **with replacement** from the original data. Each bootstrap sample has the same size as the original, but some points appear multiple times and others are left out entirely.

On average, each bootstrap sample includes about **63.2%** of the unique original data points. The remaining **36.8%** are called **out-of-bag (OOB)** samples, these serve as a free validation set.

Why 63.2%? The probability that a specific point is **not** chosen in any of $$n$$ draws is:

$$P(\text{not chosen}) = \left(1 - \frac{1}{n}\right)^n \xrightarrow{n \to \infty} \frac{1}{e} \approx 0.368$$

### Try It: Bootstrap Sampling Visualized

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>New Sample</strong> to draw a bootstrap sample. Blue highlighted points are included; faded points are out-of-bag. Watch the inclusion rate converge to ~63.2% as you draw more samples. Click <strong>Auto</strong> to draw many samples automatically.
</div>

<div class="interactive-demo">
  <canvas id="bootstrap-canvas"></canvas>
  <div class="demo-controls">
    <button id="bootstrap-sample">New Sample</button>
    <button id="bootstrap-auto">Auto (20 samples)</button>
    <button id="bootstrap-reset">Reset</button>
  </div>
  <div class="demo-info" id="bootstrap-info">Click "New Sample" to begin</div>
</div>

<script>
(function() {
  var W = 680, H = 360, pad = 20;
  var canvas = document.getElementById('bootstrap-canvas');
  var sampleBtn = document.getElementById('bootstrap-sample');
  var autoBtn = document.getElementById('bootstrap-auto');
  var resetBtn = document.getElementById('bootstrap-reset');
  var infoEl = document.getElementById('bootstrap-info');

  var data = RF.genMoons(40);
  var range = RF.getDataRange(data);
  var currentChosen = null;
  var totalSamples = 0;
  var inclusionCounts = new Array(data.length);
  for (var i = 0; i < data.length; i++) inclusionCounts[i] = 0;
  var autoTimer = null;

  function drawSample() {
    var bs = RF.bootstrap(data);
    currentChosen = bs.chosenMap;
    totalSamples++;
    for (var i = 0; i < data.length; i++) {
      if (currentChosen[i]) inclusionCounts[i]++;
    }
    draw();
  }

  function draw() {
    var c = RF.getColors();
    var ctx = RF.setupCanvas(canvas, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Draw title sections
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.fillStyle = c.textMuted;
    ctx.textAlign = 'center';
    ctx.fillText('Dataset (' + data.length + ' points)', W * 0.3, 14);
    ctx.fillText('Bootstrap Stats', W * 0.75, 14);

    // Draw points
    var plotW = W * 0.55, plotH = H - 40, plotPad = 20;
    for (var i = 0; i < data.length; i++) {
      var p = data[i];
      var cp = RF.toCanvas(p.x, p.y, plotW, plotH, plotPad, range.xR, range.yR);
      cp.y += 20;
      var isChosen = currentChosen && currentChosen[i];
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, isChosen ? 7 : 5, 0, Math.PI * 2);
      if (!currentChosen) {
        ctx.fillStyle = p.label === 1 ? c.class1 : c.class0;
        ctx.globalAlpha = 0.8;
      } else if (isChosen) {
        ctx.fillStyle = c.highlight;
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = c.textMuted;
        ctx.globalAlpha = 0.25;
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw stats on right side
    if (totalSamples > 0) {
      var sx = W * 0.6, sy = 40;
      ctx.textAlign = 'left';
      ctx.font = '13px JetBrains Mono, monospace';
      ctx.fillStyle = c.text;

      var included = 0;
      for (var k in currentChosen) included++;
      var pct = (included / data.length * 100).toFixed(1);
      ctx.fillText('This sample:', sx, sy);
      ctx.fillStyle = c.highlight;
      ctx.fillText('  Included: ' + included + '/' + data.length + ' (' + pct + '%)', sx, sy + 22);
      ctx.fillStyle = c.textMuted;
      ctx.fillText('  OOB: ' + (data.length - included) + '/' + data.length, sx, sy + 44);

      ctx.fillStyle = c.text;
      ctx.fillText('After ' + totalSamples + ' samples:', sx, sy + 80);
      var everIncluded = 0;
      for (var i = 0; i < data.length; i++) {
        if (inclusionCounts[i] > 0) everIncluded++;
      }
      var avgRate = 0;
      for (var i = 0; i < data.length; i++) {
        avgRate += inclusionCounts[i] / totalSamples;
      }
      avgRate /= data.length;
      ctx.fillStyle = c.success;
      ctx.fillText('  Avg inclusion: ' + (avgRate * 100).toFixed(1) + '%', sx, sy + 102);
      ctx.fillStyle = c.textMuted;
      ctx.fillText('  Expected: 63.2%', sx, sy + 124);

      // Draw inclusion rate bar
      var barY = sy + 150, barW = W * 0.33, barH = 18;
      ctx.fillStyle = c.bgSecondary;
      ctx.fillRect(sx, barY, barW, barH);
      ctx.fillStyle = c.success;
      ctx.fillRect(sx, barY, barW * avgRate, barH);
      ctx.strokeStyle = c.border;
      ctx.strokeRect(sx, barY, barW, barH);
      // Expected line
      ctx.strokeStyle = c.highlight;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(sx + barW * 0.632, barY - 3);
      ctx.lineTo(sx + barW * 0.632, barY + barH + 3);
      ctx.stroke();
      ctx.setLineDash([]);

      infoEl.textContent = 'Sample #' + totalSamples + ': ' + included + '/' + data.length + ' unique points included (' + pct + '%)';
    }
  }

  sampleBtn.addEventListener('click', drawSample);
  autoBtn.addEventListener('click', function() {
    if (autoTimer) return;
    var count = 0;
    autoTimer = setInterval(function() {
      drawSample();
      count++;
      if (count >= 20) { clearInterval(autoTimer); autoTimer = null; }
    }, 250);
  });
  resetBtn.addEventListener('click', function() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    currentChosen = null;
    totalSamples = 0;
    for (var i = 0; i < data.length; i++) inclusionCounts[i] = 0;
    data = RF.genMoons(40);
    range = RF.getDataRange(data);
    infoEl.textContent = 'Click "New Sample" to begin';
    draw();
  });
  RF.observeTheme(draw);
  draw();
})();
</script>

After many bootstrap samples, the average inclusion rate converges to approximately 63.2%, matching our theoretical prediction. This means each tree gets a slightly different view of the data, which is exactly what we want for diversity.

---

## 3. Bagging: Bootstrap Aggregating

**Bagging** (Bootstrap AGGregatING) is Leo Breiman's 1996 insight: train multiple models on different bootstrap samples and **aggregate** their predictions. For classification, we use majority vote; for regression, we average.

The algorithm:

1. Draw $$B$$ bootstrap samples from the training data
2. Train one decision tree on each sample (fully grown, no pruning)
3. For a new point, each tree votes and the majority wins

$$\hat{y}(x) = \text{mode}\left\{f_1(x), f_2(x), \ldots, f_B(x)\right\}$$

Each tree overfits to its bootstrap sample, but they overfit in **different ways**. The aggregated prediction smooths out individual errors.

### Try It: Bagging in Action

<div class="demo-hint">
<strong>Interactive:</strong> See 6 individual trees trained on different bootstrap samples (top) and the aggregated ensemble prediction (bottom). Click <strong>Retrain</strong> to see different bootstrap samples produce different trees, but the ensemble remains stable.
</div>

<div class="interactive-demo">
  <div class="demo-controls">
    <button id="bag-retrain">Retrain</button>
    <label>Dataset:
      <select id="bag-dataset" style="padding:0.3rem;border-radius:4px;border:1px solid var(--border);background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
        <option value="moons">Moons</option>
        <option value="circles">Circles</option>
        <option value="blobs">Blobs</option>
      </select>
    </label>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:0.5rem;">
    <div><canvas id="bag-t0"></canvas><div class="demo-caption">Tree 1</div></div>
    <div><canvas id="bag-t1"></canvas><div class="demo-caption">Tree 2</div></div>
    <div><canvas id="bag-t2"></canvas><div class="demo-caption">Tree 3</div></div>
    <div><canvas id="bag-t3"></canvas><div class="demo-caption">Tree 4</div></div>
    <div><canvas id="bag-t4"></canvas><div class="demo-caption">Tree 5</div></div>
    <div><canvas id="bag-t5"></canvas><div class="demo-caption">Tree 6</div></div>
  </div>
  <div style="margin-top:0.5rem;">
    <canvas id="bag-ensemble"></canvas>
    <div class="demo-caption">Ensemble (majority vote of all 6 trees)</div>
  </div>
  <div class="demo-info" id="bag-info"></div>
</div>

<script>
(function() {
  var TW = 215, TH = 170, EW = 650, EH = 220, pad = 6;
  var tCanvases = [];
  for (var i = 0; i < 6; i++) tCanvases.push(document.getElementById('bag-t' + i));
  var eCanvas = document.getElementById('bag-ensemble');
  var retrainBtn = document.getElementById('bag-retrain');
  var datasetSel = document.getElementById('bag-dataset');
  var infoEl = document.getElementById('bag-info');

  var data = [], range = {};

  function genData() {
    var ds = datasetSel.value;
    if (ds === 'moons') data = RF.genMoons(100);
    else if (ds === 'circles') data = RF.genCircles(100);
    else data = RF.genBlobs(100);
    range = RF.getDataRange(data);
  }

  function draw() {
    var c = RF.getColors();
    var trees = [];
    // Train 6 individual trees on bootstrap samples
    for (var t = 0; t < 6; t++) {
      var bs = RF.bootstrap(data);
      trees.push(RF.buildTree(bs.sample, 8, 2, 2));
    }

    // Draw individual trees
    for (var t = 0; t < 6; t++) {
      var ctx = RF.setupCanvas(tCanvases[t], TW, TH);
      ctx.fillStyle = c.bg;
      ctx.fillRect(0, 0, TW, TH);
      var tree = trees[t];
      RF.drawBoundary(ctx, TW, TH, pad, range.xR, range.yR, function(pt) {
        return RF.predictTree(tree, pt);
      }, c, 4);
      RF.drawPoints(ctx, data, TW, TH, pad, range.xR, range.yR, c);
    }

    // Draw ensemble
    var ctx = RF.setupCanvas(eCanvas, EW, EH);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, EW, EH);
    RF.drawBoundaryProba(ctx, EW, EH, pad, range.xR, range.yR, function(pt) {
      var v = 0;
      for (var t = 0; t < trees.length; t++) {
        if (RF.predictTree(trees[t], pt) === 1) v++;
      }
      return v / trees.length;
    }, c, 4);
    RF.drawPoints(ctx, data, EW, EH, pad, range.xR, range.yR, c);

    // Compute accuracies
    var accs = [];
    for (var t = 0; t < trees.length; t++) {
      var correct = 0;
      for (var i = 0; i < data.length; i++) {
        if (RF.predictTree(trees[t], data[i]) === data[i].label) correct++;
      }
      accs.push((correct / data.length * 100).toFixed(1));
    }
    var ensCorrect = 0;
    for (var i = 0; i < data.length; i++) {
      var votes = 0;
      for (var t = 0; t < trees.length; t++) {
        if (RF.predictTree(trees[t], data[i]) === 1) votes++;
      }
      var pred = votes > trees.length / 2 ? 1 : 0;
      if (pred === data[i].label) ensCorrect++;
    }
    infoEl.textContent = 'Individual accs: [' + accs.join(', ') + ']%  |  Ensemble: ' + (ensCorrect / data.length * 100).toFixed(1) + '%';
  }

  retrainBtn.addEventListener('click', function() { genData(); draw(); });
  datasetSel.addEventListener('change', function() { genData(); draw(); });
  RF.observeTheme(draw);
  genData();
  draw();
})();
</script>

Each individual tree has a different jagged boundary because each one trained on a different bootstrap sample. But when we aggregate their votes, the boundary becomes much smoother. The ensemble accuracy is typically as good as or better than the best individual tree.

---

## 4. Forest Growth: Adding Trees One by One

This is the key insight of Random Forests: as you add more trees, the decision boundary progressively smooths out and accuracy stabilizes. There is no overfitting from adding more trees, only diminishing returns.

### Try It: Grow the Forest

<div class="demo-hint">
<strong>Interactive:</strong> Drag the slider to add trees from 1 to 50. Watch the decision boundary smooth out as the forest grows. The accuracy curve on the right shows how performance improves and stabilizes.
</div>

<div class="interactive-demo">
  <div class="demo-controls">
    <label>Trees: <input type="range" id="grow-slider" min="1" max="50" value="1"><span class="demo-value" id="grow-val">1</span></label>
    <button id="grow-regen">New Forest</button>
    <label>Dataset:
      <select id="grow-dataset" style="padding:0.3rem;border-radius:4px;border:1px solid var(--border);background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
        <option value="moons">Moons</option>
        <option value="circles">Circles</option>
        <option value="blobs">Blobs</option>
        <option value="spiral">Spiral</option>
      </select>
    </label>
  </div>
  <div class="demo-split">
    <div>
      <canvas id="grow-boundary-canvas"></canvas>
      <div class="demo-caption">Decision Boundary</div>
    </div>
    <div>
      <canvas id="grow-acc-canvas"></canvas>
      <div class="demo-caption">Accuracy vs Number of Trees</div>
    </div>
  </div>
  <div class="demo-info" id="grow-info"></div>
</div>

<script>
(function() {
  var BW = 320, BH = 280, AW = 320, AH = 280;
  var bCanvas = document.getElementById('grow-boundary-canvas');
  var aCanvas = document.getElementById('grow-acc-canvas');
  var slider = document.getElementById('grow-slider');
  var valEl = document.getElementById('grow-val');
  var regenBtn = document.getElementById('grow-regen');
  var datasetSel = document.getElementById('grow-dataset');
  var infoEl = document.getElementById('grow-info');

  var data = [], range = {}, forest = null;
  var accHistory = [];
  var pad = 10, aPad = 40;

  function genData() {
    var ds = datasetSel.value;
    if (ds === 'moons') data = RF.genMoons(120);
    else if (ds === 'circles') data = RF.genCircles(120);
    else if (ds === 'spiral') data = RF.genSpiral(150);
    else data = RF.genBlobs(120);
    range = RF.getDataRange(data);
  }

  function buildFullForest() {
    forest = RF.buildForest(data, 50, 8, 2, 1);
    // Precompute accuracy for each number of trees
    accHistory = [];
    for (var t = 1; t <= 50; t++) {
      accHistory.push(RF.accuracy(data, forest, t));
    }
  }

  function draw() {
    var nTrees = parseInt(slider.value);
    valEl.textContent = nTrees;
    var c = RF.getColors();

    // Boundary
    var ctx = RF.setupCanvas(bCanvas, BW, BH);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, BW, BH);
    RF.drawBoundaryProba(ctx, BW, BH, pad, range.xR, range.yR, function(pt) {
      return RF.predictForestProba(forest, pt, nTrees);
    }, c, 4);
    RF.drawPoints(ctx, data, BW, BH, pad, range.xR, range.yR, c);

    // Accuracy curve
    var actx = RF.setupCanvas(aCanvas, AW, AH);
    actx.fillStyle = c.bg;
    actx.fillRect(0, 0, AW, AH);

    // Axes
    actx.strokeStyle = c.border;
    actx.lineWidth = 1;
    actx.beginPath();
    actx.moveTo(aPad, aPad);
    actx.lineTo(aPad, AH - aPad);
    actx.lineTo(AW - aPad, AH - aPad);
    actx.stroke();

    // Labels
    actx.fillStyle = c.textMuted;
    actx.font = '11px JetBrains Mono, monospace';
    actx.textAlign = 'center';
    actx.fillText('Number of Trees', AW / 2, AH - 5);
    actx.save();
    actx.translate(12, AH / 2);
    actx.rotate(-Math.PI / 2);
    actx.fillText('Accuracy', 0, 0);
    actx.restore();

    // Tick labels
    var ticks = [1, 10, 20, 30, 40, 50];
    for (var i = 0; i < ticks.length; i++) {
      var tx = aPad + (ticks[i] - 1) / 49 * (AW - 2 * aPad);
      actx.fillText(ticks[i], tx, AH - aPad + 15);
    }
    var yTicks = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    actx.textAlign = 'right';
    for (var i = 0; i < yTicks.length; i++) {
      var ty = AH - aPad - (yTicks[i] - 0.5) / 0.5 * (AH - 2 * aPad);
      actx.fillText(yTicks[i].toFixed(1), aPad - 5, ty + 4);
      // Grid line
      actx.strokeStyle = c.grid;
      actx.lineWidth = 0.5;
      actx.beginPath();
      actx.moveTo(aPad, ty);
      actx.lineTo(AW - aPad, ty);
      actx.stroke();
    }

    // Draw accuracy line
    actx.strokeStyle = c.accent;
    actx.lineWidth = 2;
    actx.beginPath();
    for (var t = 0; t < nTrees; t++) {
      var px = aPad + t / 49 * (AW - 2 * aPad);
      var py = AH - aPad - (accHistory[t] - 0.5) / 0.5 * (AH - 2 * aPad);
      py = Math.max(aPad, Math.min(AH - aPad, py));
      if (t === 0) actx.moveTo(px, py);
      else actx.lineTo(px, py);
    }
    actx.stroke();

    // Current point marker
    var cpx = aPad + (nTrees - 1) / 49 * (AW - 2 * aPad);
    var cpy = AH - aPad - (accHistory[nTrees - 1] - 0.5) / 0.5 * (AH - 2 * aPad);
    cpy = Math.max(aPad, Math.min(AH - aPad, cpy));
    actx.beginPath();
    actx.arc(cpx, cpy, 5, 0, Math.PI * 2);
    actx.fillStyle = c.accent;
    actx.fill();

    infoEl.textContent = nTrees + ' tree' + (nTrees > 1 ? 's' : '') + '  |  Accuracy: ' + (accHistory[nTrees - 1] * 100).toFixed(1) + '%';
  }

  function init() {
    genData();
    buildFullForest();
    slider.value = 1;
    draw();
  }

  slider.addEventListener('input', draw);
  regenBtn.addEventListener('click', init);
  datasetSel.addEventListener('change', init);
  RF.observeTheme(draw);
  init();
})();
</script>

With just one tree, the boundary is jagged and noisy. By 5-10 trees, major improvements appear. By 20-30 trees, the boundary has largely converged. Adding more trees beyond that provides diminishing returns but **never hurts**, a key advantage of Random Forests.

---

## 5. Individual vs Ensemble Boundaries

One of the most illuminating views is to see all individual tree boundaries overlaid, versus the clean ensemble result.

### Try It: Individual Trees vs Ensemble

<div class="demo-hint">
<strong>Interactive:</strong> Toggle between viewing all individual tree boundaries and the ensemble boundary. Each individual tree is colored differently. Together they are diverse and noisy, but their vote is smooth.
</div>

<div class="interactive-demo">
  <div class="demo-controls">
    <button id="vsmode-individual" class="active">Individual Trees</button>
    <button id="vsmode-ensemble">Ensemble</button>
    <button id="vs-regen">Regenerate</button>
    <label>Trees: <input type="range" id="vs-ntrees" min="3" max="20" value="8"><span class="demo-value" id="vs-ntrees-val">8</span></label>
  </div>
  <canvas id="vs-canvas"></canvas>
  <div class="demo-info" id="vs-info"></div>
</div>

<script>
(function() {
  var W = 680, H = 400, pad = 10;
  var canvas = document.getElementById('vs-canvas');
  var btnInd = document.getElementById('vsmode-individual');
  var btnEns = document.getElementById('vsmode-ensemble');
  var regenBtn = document.getElementById('vs-regen');
  var sliderN = document.getElementById('vs-ntrees');
  var valN = document.getElementById('vs-ntrees-val');
  var infoEl = document.getElementById('vs-info');

  var mode = 'individual';
  var data = [], range = {}, forest = null;

  function genData() {
    data = RF.genMoons(100);
    range = RF.getDataRange(data);
    forest = RF.buildForest(data, 20, 8, 2, 1);
  }

  function draw() {
    var nTrees = parseInt(sliderN.value);
    valN.textContent = nTrees;
    var c = RF.getColors();
    var ctx = RF.setupCanvas(canvas, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var iW = W - 2 * pad, iH = H - 2 * pad;
    var res = 4;

    if (mode === 'individual') {
      // For each pixel, show the color of each tree's prediction blended
      for (var py = 0; py < iH; py += res) {
        for (var px = 0; px < iW; px += res) {
          var dx = range.xR[0] + (px / iW) * (range.xR[1] - range.xR[0]);
          var dy = range.yR[1] - (py / iH) * (range.yR[1] - range.yR[0]);
          var pt = { x: dx, y: dy };
          var v0 = 0, v1 = 0;
          for (var t = 0; t < nTrees; t++) {
            if (RF.predictTree(forest.trees[t], pt) === 1) v1++;
            else v0++;
          }
          // Color by the diversity: closer to 50/50 is more purple/mixed
          var frac = v1 / nTrees;
          var alpha = 0.12 + Math.abs(frac - 0.5) * 0.16;
          if (frac > 0.5) {
            ctx.fillStyle = c.isDark ? 'rgba(247,118,142,' + alpha + ')' : 'rgba(230,57,70,' + alpha + ')';
          } else {
            ctx.fillStyle = c.isDark ? 'rgba(122,162,247,' + alpha + ')' : 'rgba(37,99,235,' + alpha + ')';
          }
          ctx.fillRect(pad + px, pad + py, res, res);
        }
      }

      // Draw individual boundaries as contour lines
      for (var t = 0; t < nTrees; t++) {
        var tColor = c.treeColors[t % c.treeColors.length];
        ctx.strokeStyle = tColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        // Simple contour: find boundary pixels
        for (var py = 0; py < iH; py += res) {
          for (var px = 0; px < iW; px += res) {
            var dx = range.xR[0] + (px / iW) * (range.xR[1] - range.xR[0]);
            var dy = range.yR[1] - (py / iH) * (range.yR[1] - range.yR[0]);
            var pred = RF.predictTree(forest.trees[t], { x: dx, y: dy });
            // Check neighbor
            var dxR = range.xR[0] + ((px + res) / iW) * (range.xR[1] - range.xR[0]);
            var dyD = range.yR[1] - ((py + res) / iH) * (range.yR[1] - range.yR[0]);
            var predR = RF.predictTree(forest.trees[t], { x: dxR, y: dy });
            var predD = RF.predictTree(forest.trees[t], { x: dx, y: dyD });
            if (pred !== predR || pred !== predD) {
              ctx.fillStyle = tColor;
              ctx.fillRect(pad + px, pad + py, res, res);
            }
          }
        }
        ctx.globalAlpha = 1;
      }
    } else {
      // Ensemble boundary
      RF.drawBoundaryProba(ctx, W, H, pad, range.xR, range.yR, function(pt) {
        return RF.predictForestProba(forest, pt, nTrees);
      }, c, 3);
    }

    RF.drawPoints(ctx, data, W, H, pad, range.xR, range.yR, c);

    var acc = RF.accuracy(data, forest, nTrees);
    infoEl.textContent = mode.charAt(0).toUpperCase() + mode.slice(1) + ' view  |  ' + nTrees + ' trees  |  Accuracy: ' + (acc * 100).toFixed(1) + '%';
  }

  btnInd.addEventListener('click', function() { mode = 'individual'; btnInd.classList.add('active'); btnEns.classList.remove('active'); draw(); });
  btnEns.addEventListener('click', function() { mode = 'ensemble'; btnEns.classList.add('active'); btnInd.classList.remove('active'); draw(); });
  sliderN.addEventListener('input', draw);
  regenBtn.addEventListener('click', function() { genData(); draw(); });
  RF.observeTheme(draw);
  genData();
  draw();
})();
</script>

In the **Individual** view, you can see the colored contour lines of each tree's decision boundary. They are all different, that is diversity, and it is essential. When you switch to **Ensemble** view, those diverse opinions merge into a smooth, confident boundary.

---

## 6. Random Feature Selection

Bagging alone helps, but the trees can still be **correlated**, if one feature is very strong, all trees will split on it first, making them similar. Random Forests add a second source of randomness: at each split, only a random subset of features is considered.

For classification, the default is $$\sqrt{p}$$ features per split (where $$p$$ is the total number of features). This forces trees to explore different features and produces more **decorrelated** trees, which further reduces ensemble variance.

With $$B$$ trees that have pairwise correlation $$\rho$$, the ensemble variance is:

$$\text{Var} = \rho \sigma^2 + \frac{1 - \rho}{B}\sigma^2$$

Reducing $$\rho$$ (correlation between trees) reduces the first term, which does not shrink with $$B$$. This is why random feature selection matters.

### Try It: Feature Selection Per Split

<div class="demo-hint">
<strong>Interactive:</strong> Toggle between using all features per split (bagging) vs random feature subset (Random Forest). With only 2 features in 2D, the difference is subtle, but the principle is demonstrated. In high dimensions with many features, this decorrelation is critical.
</div>

<div class="interactive-demo">
  <div class="demo-controls">
    <button id="feat-all" class="active">All Features (Bagging)</button>
    <button id="feat-random">Random Subset (RF)</button>
    <button id="feat-regen">Regenerate</button>
  </div>
  <div class="demo-split">
    <div>
      <canvas id="feat-canvas-left"></canvas>
      <div class="demo-caption" id="feat-caption-left">Bagging (all features)</div>
    </div>
    <div>
      <canvas id="feat-canvas-right"></canvas>
      <div class="demo-caption" id="feat-caption-right">Feature importance</div>
    </div>
  </div>
  <div class="demo-info" id="feat-info"></div>
</div>

<script>
(function() {
  var BW = 320, BH = 280, pad = 10;
  var canvasL = document.getElementById('feat-canvas-left');
  var canvasR = document.getElementById('feat-canvas-right');
  var btnAll = document.getElementById('feat-all');
  var btnRand = document.getElementById('feat-random');
  var regenBtn = document.getElementById('feat-regen');
  var captionL = document.getElementById('feat-caption-left');
  var infoEl = document.getElementById('feat-info');

  var maxFeat = 2; // all features
  var data = [], range = {};

  function genData() {
    data = RF.genMoons(100);
    range = RF.getDataRange(data);
  }

  function draw() {
    var c = RF.getColors();
    var forest = RF.buildForest(data, 30, 8, 2, maxFeat);

    // Boundary
    var ctx = RF.setupCanvas(canvasL, BW, BH);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, BW, BH);
    RF.drawBoundaryProba(ctx, BW, BH, pad, range.xR, range.yR, function(pt) {
      return RF.predictForestProba(forest, pt, 30);
    }, c, 4);
    RF.drawPoints(ctx, data, BW, BH, pad, range.xR, range.yR, c);

    captionL.textContent = maxFeat === 2 ? 'Bagging (all features per split)' : 'Random Forest (1 feature per split)';

    // Feature importance bar chart
    var imp = RF.featureImportance(forest, 30);
    var ctxR = RF.setupCanvas(canvasR, BW, BH);
    ctxR.fillStyle = c.bg;
    ctxR.fillRect(0, 0, BW, BH);

    var barPad = 50, barW = 60, gap = 40;
    var maxImp = Math.max(imp.x, imp.y, 0.01);
    var barArea = BH - 2 * barPad;
    var feats = [{name: 'Feature X', val: imp.x}, {name: 'Feature Y', val: imp.y}];

    ctxR.font = '12px JetBrains Mono, monospace';
    ctxR.textAlign = 'center';
    ctxR.fillStyle = c.textMuted;
    ctxR.fillText('Feature Importance', BW / 2, 20);

    for (var i = 0; i < feats.length; i++) {
      var bx = BW / 2 + (i - 0.5) * (barW + gap) - barW / 2 + gap / 2;
      var bh = (feats[i].val / maxImp) * (barArea - 20);
      var by = BH - barPad - bh;

      ctxR.fillStyle = c.treeColors[i];
      ctxR.fillRect(bx, by, barW, bh);
      ctxR.strokeStyle = c.border;
      ctxR.strokeRect(bx, by, barW, bh);

      ctxR.fillStyle = c.text;
      ctxR.font = '11px JetBrains Mono, monospace';
      ctxR.fillText(feats[i].name, bx + barW / 2, BH - barPad + 18);
      ctxR.fillText((feats[i].val * 100).toFixed(1) + '%', bx + barW / 2, by - 8);
    }

    var acc = RF.accuracy(data, forest, 30);
    infoEl.textContent = (maxFeat === 2 ? 'Bagging' : 'Random Forest') + '  |  30 trees  |  Accuracy: ' + (acc * 100).toFixed(1) + '%  |  X imp: ' + (imp.x * 100).toFixed(1) + '%  Y imp: ' + (imp.y * 100).toFixed(1) + '%';
  }

  btnAll.addEventListener('click', function() { maxFeat = 2; btnAll.classList.add('active'); btnRand.classList.remove('active'); draw(); });
  btnRand.addEventListener('click', function() { maxFeat = 1; btnRand.classList.add('active'); btnAll.classList.remove('active'); draw(); });
  regenBtn.addEventListener('click', function() { genData(); draw(); });
  RF.observeTheme(draw);
  genData();
  draw();
})();
</script>

When all features are considered at every split (bagging), both trees tend to use the same best feature first, making them correlated. With random feature selection, trees are forced to find different splitting strategies, producing more diverse, and ultimately more effective, ensembles.

---

## 7. Feature Importance

Random Forests provide a natural measure of **feature importance**: the total reduction in Gini impurity that a feature contributes across all trees and all splits, averaged over the forest.

$$\text{Importance}(f) = \frac{1}{B}\sum_{b=1}^{B}\sum_{\text{splits on } f \text{ in tree } b} n_{\text{node}} \cdot \Delta\text{Gini}$$

This is one of the most practical benefits of Random Forests, you get feature ranking for free.

### Try It: Feature Importance by Forest Size

<div class="demo-hint">
<strong>Interactive:</strong> Drag the slider to add trees and watch the feature importance bars stabilize. With few trees, importance estimates are noisy. With many trees, they converge to a stable ranking.
</div>

<div class="interactive-demo">
  <div class="demo-controls">
    <label>Trees: <input type="range" id="imp-slider" min="1" max="50" value="1"><span class="demo-value" id="imp-val">1</span></label>
    <button id="imp-regen">New Forest</button>
  </div>
  <canvas id="imp-canvas"></canvas>
  <div class="demo-info" id="imp-info"></div>
</div>

<script>
(function() {
  var W = 680, H = 300;
  var canvas = document.getElementById('imp-canvas');
  var slider = document.getElementById('imp-slider');
  var valEl = document.getElementById('imp-val');
  var regenBtn = document.getElementById('imp-regen');
  var infoEl = document.getElementById('imp-info');

  var data = [], forest = null;
  var impHistory = []; // importance at each tree count

  function init() {
    data = RF.genMoons(120);
    forest = RF.buildForest(data, 50, 8, 2, 1);
    // Precompute importance at each step
    impHistory = [];
    for (var t = 1; t <= 50; t++) {
      impHistory.push(RF.featureImportance(forest, t));
    }
    slider.value = 1;
    draw();
  }

  function draw() {
    var nTrees = parseInt(slider.value);
    valEl.textContent = nTrees;
    var c = RF.getColors();
    var ctx = RF.setupCanvas(canvas, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var pad = 40;
    // Left half: bar chart
    var barArea = W * 0.4;
    var imp = impHistory[nTrees - 1];
    var feats = [{name: 'Feature X', val: imp.x, color: c.treeColors[0]}, {name: 'Feature Y', val: imp.y, color: c.treeColors[1]}];
    var barW = 55, gap = 30;
    var maxVal = 1.0;

    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = c.textMuted;
    ctx.fillText('Importance (' + nTrees + ' trees)', barArea / 2, 20);

    for (var i = 0; i < feats.length; i++) {
      var bx = barArea / 2 + (i - 0.5) * (barW + gap) - barW / 2 + gap / 2;
      var bh = (feats[i].val / maxVal) * (H - 2 * pad - 30);
      var by = H - pad - bh;
      ctx.fillStyle = feats[i].color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(bx, by, barW, bh);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = c.border;
      ctx.strokeRect(bx, by, barW, bh);
      ctx.fillStyle = c.text;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(feats[i].name, bx + barW / 2, H - pad + 16);
      ctx.fillText((feats[i].val * 100).toFixed(1) + '%', bx + barW / 2, by - 6);
    }

    // Right half: importance over time
    var rPad = 45;
    var rx = barArea + 20, rw = W - barArea - 40, rh = H - 40;
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx + rPad, 20);
    ctx.lineTo(rx + rPad, 20 + rh - rPad);
    ctx.lineTo(rx + rw, 20 + rh - rPad);
    ctx.stroke();

    ctx.fillStyle = c.textMuted;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Trees', rx + rPad + (rw - rPad) / 2, H - 5);

    // Plot lines for each feature
    for (var fi = 0; fi < 2; fi++) {
      var feat = fi === 0 ? 'x' : 'y';
      ctx.strokeStyle = c.treeColors[fi];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (var t = 0; t < nTrees; t++) {
        var px = rx + rPad + t / 49 * (rw - rPad);
        var py = 20 + rh - rPad - impHistory[t][feat] * (rh - rPad - 10);
        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Legend
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    for (var fi = 0; fi < 2; fi++) {
      ctx.fillStyle = c.treeColors[fi];
      ctx.fillRect(rx + rw - 100, 30 + fi * 18, 12, 12);
      ctx.fillStyle = c.text;
      ctx.fillText(fi === 0 ? 'Feature X' : 'Feature Y', rx + rw - 84, 40 + fi * 18);
    }

    // Vertical line at current nTrees
    var curX = rx + rPad + (nTrees - 1) / 49 * (rw - rPad);
    ctx.strokeStyle = c.highlight;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(curX, 20);
    ctx.lineTo(curX, 20 + rh - rPad);
    ctx.stroke();
    ctx.setLineDash([]);

    infoEl.textContent = nTrees + ' trees  |  X importance: ' + (imp.x * 100).toFixed(1) + '%  |  Y importance: ' + (imp.y * 100).toFixed(1) + '%';
  }

  slider.addEventListener('input', draw);
  regenBtn.addEventListener('click', init);
  RF.observeTheme(draw);
  init();
})();
</script>

With a single tree, importance estimates are unreliable, they depend heavily on which bootstrap sample was drawn. As more trees are added, the estimates converge to stable values that reflect the true relevance of each feature.

---

## 8. Out-of-Bag Error Estimation

One of the most elegant properties of Random Forests is **free cross-validation** through **Out-of-Bag (OOB) error**.

Since each tree only sees about 63.2% of the data, the remaining 36.8% (OOB samples) can be used as a validation set. For each data point, we aggregate the predictions of **only the trees that did not see it** during training:

$$\hat{y}_{\text{OOB}}(x_i) = \text{mode}\left\{f_b(x_i) : i \notin \text{bootstrap}_b\right\}$$

The OOB error is an unbiased estimate of the test error, requiring no separate validation set.

### Try It: OOB Error Convergence

<div class="demo-hint">
<strong>Interactive:</strong> Watch the OOB error (red) and training accuracy (blue) as trees are added. The OOB error gives an honest estimate of generalization performance without needing a holdout set.
</div>

<div class="interactive-demo">
  <div class="demo-controls">
    <label>Trees: <input type="range" id="oob-slider" min="1" max="50" value="1"><span class="demo-value" id="oob-val">1</span></label>
    <button id="oob-regen">New Forest</button>
    <label>Dataset:
      <select id="oob-dataset" style="padding:0.3rem;border-radius:4px;border:1px solid var(--border);background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
        <option value="moons">Moons</option>
        <option value="circles">Circles</option>
        <option value="spiral">Spiral</option>
      </select>
    </label>
  </div>
  <canvas id="oob-canvas"></canvas>
  <div class="demo-info" id="oob-info"></div>
</div>

<script>
(function() {
  var W = 680, H = 320;
  var canvas = document.getElementById('oob-canvas');
  var slider = document.getElementById('oob-slider');
  var valEl = document.getElementById('oob-val');
  var regenBtn = document.getElementById('oob-regen');
  var datasetSel = document.getElementById('oob-dataset');
  var infoEl = document.getElementById('oob-info');

  var data = [], forest = null;
  var oobHistory = [], accHistory = [];
  var pad = 45;

  function init() {
    var ds = datasetSel.value;
    if (ds === 'moons') data = RF.genMoons(120);
    else if (ds === 'circles') data = RF.genCircles(120);
    else data = RF.genSpiral(150);
    forest = RF.buildForest(data, 50, 8, 2, 1);
    oobHistory = [];
    accHistory = [];
    for (var t = 1; t <= 50; t++) {
      oobHistory.push(RF.oobError(data, forest, t));
      accHistory.push(1 - RF.accuracy(data, forest, t));
    }
    slider.value = 1;
    draw();
  }

  function draw() {
    var nTrees = parseInt(slider.value);
    valEl.textContent = nTrees;
    var c = RF.getColors();
    var ctx = RF.setupCanvas(canvas, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Axes
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, H - pad);
    ctx.lineTo(W - pad, H - pad);
    ctx.stroke();

    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Number of Trees', W / 2, H - 5);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Error Rate', 0, 0);
    ctx.restore();

    // Y axis: 0 to 0.5
    var yMax = 0.5;
    var yTicks = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
    ctx.textAlign = 'right';
    for (var i = 0; i < yTicks.length; i++) {
      var ty = H - pad - (yTicks[i] / yMax) * (H - 2 * pad);
      ctx.fillStyle = c.textMuted;
      ctx.fillText(yTicks[i].toFixed(1), pad - 8, ty + 4);
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(pad, ty);
      ctx.lineTo(W - pad, ty);
      ctx.stroke();
    }

    // X ticks
    ctx.textAlign = 'center';
    var xTicks = [1, 10, 20, 30, 40, 50];
    for (var i = 0; i < xTicks.length; i++) {
      var tx = pad + (xTicks[i] - 1) / 49 * (W - 2 * pad);
      ctx.fillStyle = c.textMuted;
      ctx.fillText(xTicks[i], tx, H - pad + 18);
    }

    // Training error line
    ctx.strokeStyle = c.class0;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var t = 0; t < nTrees; t++) {
      var px = pad + t / 49 * (W - 2 * pad);
      var py = H - pad - (accHistory[t] / yMax) * (H - 2 * pad);
      py = Math.max(pad, Math.min(H - pad, py));
      if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // OOB error line
    ctx.strokeStyle = c.class1;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var t = 0; t < nTrees; t++) {
      var px = pad + t / 49 * (W - 2 * pad);
      var py = H - pad - (oobHistory[t] / yMax) * (H - 2 * pad);
      py = Math.max(pad, Math.min(H - pad, py));
      if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Current position markers
    var cx = pad + (nTrees - 1) / 49 * (W - 2 * pad);
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, pad);
    ctx.lineTo(cx, H - pad);
    ctx.stroke();
    ctx.setLineDash([]);

    // Legend
    ctx.textAlign = 'left';
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.fillStyle = c.class0;
    ctx.fillRect(pad + 20, pad + 10, 16, 3);
    ctx.fillStyle = c.text;
    ctx.fillText('Training Error', pad + 42, pad + 16);
    ctx.fillStyle = c.class1;
    ctx.fillRect(pad + 20, pad + 28, 16, 3);
    ctx.fillStyle = c.text;
    ctx.fillText('OOB Error', pad + 42, pad + 34);

    infoEl.textContent = nTrees + ' trees  |  Training error: ' + (accHistory[nTrees - 1] * 100).toFixed(1) + '%  |  OOB error: ' + (oobHistory[nTrees - 1] * 100).toFixed(1) + '%';
  }

  slider.addEventListener('input', draw);
  regenBtn.addEventListener('click', init);
  datasetSel.addEventListener('change', init);
  RF.observeTheme(draw);
  init();
})();
</script>

The training error (blue) is typically very low because each tree memorizes its bootstrap sample. The OOB error (red) gives a more honest picture of generalization. As more trees are added, the OOB error decreases and stabilizes. This is equivalent to running cross-validation, but it comes for free with the bagging process.

---

## 9. Random Forest vs Single Tree

Let us do a comprehensive comparison. A single tree is fast and interpretable, but prone to overfitting. A Random Forest trades some interpretability for dramatically better generalization.

### Try It: Head-to-Head Comparison

<div class="demo-hint">
<strong>Interactive:</strong> Compare a single tree against a Random Forest across different datasets. The single tree's boundary is jagged and unstable. The forest's boundary is smooth and robust.
</div>

<div class="interactive-demo">
  <div class="demo-controls">
    <button id="comp-regen">Regenerate</button>
    <label>Dataset:
      <select id="comp-dataset" style="padding:0.3rem;border-radius:4px;border:1px solid var(--border);background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
        <option value="moons">Moons</option>
        <option value="circles">Circles</option>
        <option value="blobs">Blobs</option>
        <option value="spiral">Spiral</option>
      </select>
    </label>
    <label>Forest trees: <input type="range" id="comp-ntrees" min="5" max="50" value="30"><span class="demo-value" id="comp-ntrees-val">30</span></label>
  </div>
  <div class="demo-split">
    <div>
      <canvas id="comp-single-canvas"></canvas>
      <div class="demo-caption" id="comp-single-cap">Single Tree</div>
    </div>
    <div>
      <canvas id="comp-forest-canvas"></canvas>
      <div class="demo-caption" id="comp-forest-cap">Random Forest</div>
    </div>
  </div>
  <div class="demo-info" id="comp-info"></div>
</div>

<script>
(function() {
  var W = 320, H = 280, pad = 10;
  var canvasS = document.getElementById('comp-single-canvas');
  var canvasF = document.getElementById('comp-forest-canvas');
  var regenBtn = document.getElementById('comp-regen');
  var datasetSel = document.getElementById('comp-dataset');
  var sliderN = document.getElementById('comp-ntrees');
  var valN = document.getElementById('comp-ntrees-val');
  var capS = document.getElementById('comp-single-cap');
  var capF = document.getElementById('comp-forest-cap');
  var infoEl = document.getElementById('comp-info');

  var data = [], range = {};

  function genData() {
    var ds = datasetSel.value;
    var n = ds === 'spiral' ? 150 : 120;
    if (ds === 'moons') data = RF.genMoons(n);
    else if (ds === 'circles') data = RF.genCircles(n);
    else if (ds === 'spiral') data = RF.genSpiral(n);
    else data = RF.genBlobs(n);
    range = RF.getDataRange(data);
  }

  function draw() {
    var nTrees = parseInt(sliderN.value);
    valN.textContent = nTrees;
    var c = RF.getColors();

    // Single tree
    var tree = RF.buildTree(data, 10, 2, 2);
    var ctxS = RF.setupCanvas(canvasS, W, H);
    ctxS.fillStyle = c.bg;
    ctxS.fillRect(0, 0, W, H);
    RF.drawBoundary(ctxS, W, H, pad, range.xR, range.yR, function(pt) {
      return RF.predictTree(tree, pt);
    }, c, 4);
    RF.drawPoints(ctxS, data, W, H, pad, range.xR, range.yR, c);

    var singleAcc = 0;
    for (var i = 0; i < data.length; i++) {
      if (RF.predictTree(tree, data[i]) === data[i].label) singleAcc++;
    }
    singleAcc /= data.length;

    // Random Forest
    var forest = RF.buildForest(data, nTrees, 8, 2, 1);
    var ctxF = RF.setupCanvas(canvasF, W, H);
    ctxF.fillStyle = c.bg;
    ctxF.fillRect(0, 0, W, H);
    RF.drawBoundaryProba(ctxF, W, H, pad, range.xR, range.yR, function(pt) {
      return RF.predictForestProba(forest, pt, nTrees);
    }, c, 4);
    RF.drawPoints(ctxF, data, W, H, pad, range.xR, range.yR, c);

    var forestAcc = RF.accuracy(data, forest, nTrees);
    var oobErr = RF.oobError(data, forest, nTrees);

    capS.textContent = 'Single Tree (acc: ' + (singleAcc * 100).toFixed(1) + '%)';
    capF.textContent = 'Random Forest, ' + nTrees + ' trees (acc: ' + (forestAcc * 100).toFixed(1) + '%)';
    infoEl.textContent = 'Single tree: ' + (singleAcc * 100).toFixed(1) + '%  |  Forest: ' + (forestAcc * 100).toFixed(1) + '%  |  OOB error: ' + (oobErr * 100).toFixed(1) + '%';
  }

  regenBtn.addEventListener('click', function() { genData(); draw(); });
  datasetSel.addEventListener('change', function() { genData(); draw(); });
  sliderN.addEventListener('input', draw);
  RF.observeTheme(draw);
  genData();
  draw();
})();
</script>

Try different datasets and click **Regenerate** multiple times. The single tree changes dramatically each time, while the Random Forest remains remarkably consistent. This stability is the hallmark of ensemble methods.

---

## 10. Summary

Random Forests combine two powerful ideas, **bootstrap sampling** and **random feature selection**, to build ensembles of decorrelated decision trees. The result is one of the most reliable and widely used machine learning algorithms.

### The Random Forest Algorithm

1. For $$b = 1, 2, \ldots, B$$:
   - Draw a bootstrap sample from the training data
   - Grow a decision tree, but at each split consider only $$m \approx \sqrt{p}$$ random features
   - Grow the tree fully (no pruning)
2. For prediction, aggregate by majority vote (classification) or averaging (regression)

### Key Hyperparameters

<table class="rf-table">
<thead>
<tr><th>Parameter</th><th>What it controls</th><th>Typical default</th></tr>
</thead>
<tbody>
<tr><td><code>n_estimators</code></td><td>Number of trees in the forest</td><td>100-500</td></tr>
<tr><td><code>max_features</code></td><td>Features considered per split</td><td>sqrt(p) for classification, p/3 for regression</td></tr>
<tr><td><code>max_depth</code></td><td>Maximum depth of each tree</td><td>None (fully grown)</td></tr>
<tr><td><code>min_samples_split</code></td><td>Minimum samples to split a node</td><td>2</td></tr>
<tr><td><code>min_samples_leaf</code></td><td>Minimum samples in a leaf</td><td>1</td></tr>
</tbody>
</table>

### Pros and Cons

**Advantages:**
- Excellent out-of-the-box performance with minimal tuning
- Resistant to overfitting (adding more trees does not overfit)
- Built-in feature importance
- Free cross-validation via OOB error
- Handles both numerical and categorical features
- Robust to outliers and noise
- Easily parallelizable

**Disadvantages:**
- Less interpretable than a single tree
- Slower to train and predict than a single tree
- Can be memory-intensive with many trees
- May not capture complex interactions as well as boosting methods
- Tends to favor features with many levels/values in importance rankings

### When to Use Random Forests

Random Forests are an excellent **first model** to try on almost any tabular dataset. They work well when:
- You want a strong baseline with minimal tuning
- Feature importance is valuable for understanding the problem
- You need robust performance on noisy data
- Training time is not extremely constrained

### What is Next

Random Forests reduce variance by averaging many independent models. But what if we could do better by training each new model to **correct the mistakes** of the previous ones? That is the idea behind **Boosting** methods like Gradient Boosted Trees and XGBoost, which we will explore in the next chapter.

---

*This is part of the [Machine Learning from Scratch]({{ site.baseurl }}/ml/) series. You might also enjoy [Decision Trees]({{ site.baseurl }}/decision-trees/) (which Random Forests build on) or continue to [Boosting]({{ site.baseurl }}/boosting/).*
