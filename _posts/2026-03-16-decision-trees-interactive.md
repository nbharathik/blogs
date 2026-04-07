---
layout: post
title: "Decision Trees from Scratch - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
tags: [ml-part-2]
series: false
hidden: true
description: "Watch decision trees grow split-by-split, compare Gini vs Entropy, control tree depth to see overfitting, and explore regression trees - all interactively in your browser."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /decision-trees/
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
.dt-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.9rem;
}
.dt-table th, .dt-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}
.dt-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
.dt-table td {
  background: var(--bg-primary);
}
</style>

<script>
window.DT = (function() {
  var D = {};

  D.getColors = function() {
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
      class0Light: isDark ? 'rgba(122,162,247,0.18)' : 'rgba(37,99,235,0.12)',
      class1: isDark ? '#f7768e' : '#e63946',
      class1Light: isDark ? 'rgba(247,118,142,0.18)' : 'rgba(230,57,70,0.12)',
      class2: isDark ? '#9ece6a' : '#16a34a',
      class2Light: isDark ? 'rgba(158,206,106,0.18)' : 'rgba(22,163,74,0.12)',
      split: isDark ? '#e0af68' : '#d97706',
      node: isDark ? '#bb9af7' : '#7c3aed',
      leaf0: isDark ? '#7aa2f7' : '#2563eb',
      leaf1: isDark ? '#f7768e' : '#e63946',
      isDark: isDark
    };
  };

  D.setupCanvas = function(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  D.observeTheme = function(cb) {
    var obs = new MutationObserver(function() { cb(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb);
  };

  // --- Impurity measures ---
  D.gini = function(counts, total) {
    if (total === 0) return 0;
    var sum = 0;
    for (var i = 0; i < counts.length; i++) {
      var p = counts[i] / total;
      sum += p * p;
    }
    return 1 - sum;
  };

  D.entropy = function(counts, total) {
    if (total === 0) return 0;
    var sum = 0;
    for (var i = 0; i < counts.length; i++) {
      var p = counts[i] / total;
      if (p > 0) sum -= p * Math.log2(p);
    }
    return sum;
  };

  D.variance = function(values) {
    if (values.length === 0) return 0;
    var mean = 0;
    for (var i = 0; i < values.length; i++) mean += values[i];
    mean /= values.length;
    var v = 0;
    for (var i = 0; i < values.length; i++) {
      var d = values[i] - mean;
      v += d * d;
    }
    return v / values.length;
  };

  D.mean = function(values) {
    if (values.length === 0) return 0;
    var s = 0;
    for (var i = 0; i < values.length; i++) s += values[i];
    return s / values.length;
  };

  // --- Count classes ---
  D.classCounts = function(pts, nClasses) {
    var counts = [];
    for (var c = 0; c < nClasses; c++) counts.push(0);
    for (var i = 0; i < pts.length; i++) {
      counts[pts[i].label]++;
    }
    return counts;
  };

  // --- Find best split ---
  D.findBestSplit = function(pts, nClasses, criterion, features) {
    if (!features) features = ['x', 'y'];
    var best = { gain: -1, feature: null, threshold: null };
    var parentCounts = D.classCounts(pts, nClasses);
    var parentImpurity = criterion === 'entropy' ?
      D.entropy(parentCounts, pts.length) : D.gini(parentCounts, pts.length);

    for (var fi = 0; fi < features.length; fi++) {
      var feat = features[fi];
      var vals = [];
      for (var i = 0; i < pts.length; i++) vals.push(pts[i][feat]);
      vals.sort(function(a, b) { return a - b; });
      var unique = [vals[0]];
      for (var i = 1; i < vals.length; i++) {
        if (vals[i] !== vals[i - 1]) unique.push(vals[i]);
      }
      for (var i = 0; i < unique.length - 1; i++) {
        var threshold = (unique[i] + unique[i + 1]) / 2;
        var leftCounts = [];
        var rightCounts = [];
        for (var c = 0; c < nClasses; c++) { leftCounts.push(0); rightCounts.push(0); }
        var nLeft = 0, nRight = 0;
        for (var j = 0; j < pts.length; j++) {
          if (pts[j][feat] <= threshold) {
            leftCounts[pts[j].label]++;
            nLeft++;
          } else {
            rightCounts[pts[j].label]++;
            nRight++;
          }
        }
        var leftImp = criterion === 'entropy' ?
          D.entropy(leftCounts, nLeft) : D.gini(leftCounts, nLeft);
        var rightImp = criterion === 'entropy' ?
          D.entropy(rightCounts, nRight) : D.gini(rightCounts, nRight);
        var weightedImp = (nLeft * leftImp + nRight * rightImp) / pts.length;
        var gain = parentImpurity - weightedImp;
        if (gain > best.gain) {
          best = { gain: gain, feature: feat, threshold: threshold,
            leftCounts: leftCounts, rightCounts: rightCounts,
            leftImpurity: leftImp, rightImpurity: rightImp,
            parentImpurity: parentImpurity };
        }
      }
    }
    return best;
  };

  // --- Find best split for regression ---
  D.findBestSplitRegression = function(pts, features) {
    if (!features) features = ['x'];
    var best = { gain: -1, feature: null, threshold: null };
    var allVals = [];
    for (var i = 0; i < pts.length; i++) allVals.push(pts[i].y);
    var parentVar = D.variance(allVals);

    for (var fi = 0; fi < features.length; fi++) {
      var feat = features[fi];
      var vals = [];
      for (var i = 0; i < pts.length; i++) vals.push(pts[i][feat]);
      vals.sort(function(a, b) { return a - b; });
      var unique = [vals[0]];
      for (var i = 1; i < vals.length; i++) {
        if (vals[i] !== vals[i - 1]) unique.push(vals[i]);
      }
      for (var i = 0; i < unique.length - 1; i++) {
        var threshold = (unique[i] + unique[i + 1]) / 2;
        var leftVals = [], rightVals = [];
        for (var j = 0; j < pts.length; j++) {
          if (pts[j][feat] <= threshold) leftVals.push(pts[j].y);
          else rightVals.push(pts[j].y);
        }
        if (leftVals.length === 0 || rightVals.length === 0) continue;
        var leftVar = D.variance(leftVals);
        var rightVar = D.variance(rightVals);
        var weightedVar = (leftVals.length * leftVar + rightVals.length * rightVar) / pts.length;
        var gain = parentVar - weightedVar;
        if (gain > best.gain) {
          best = { gain: gain, feature: feat, threshold: threshold };
        }
      }
    }
    return best;
  };

  // --- Build tree recursively ---
  D.buildTree = function(pts, nClasses, criterion, maxDepth, minSamples, depth, features) {
    if (!depth) depth = 0;
    if (!minSamples) minSamples = 2;
    if (!features) features = ['x', 'y'];
    var counts = D.classCounts(pts, nClasses);
    var majority = 0;
    for (var c = 1; c < nClasses; c++) {
      if (counts[c] > counts[majority]) majority = c;
    }

    // Check stopping criteria
    var pure = false;
    for (var c = 0; c < nClasses; c++) {
      if (counts[c] === pts.length) { pure = true; break; }
    }
    if (pure || depth >= maxDepth || pts.length < minSamples) {
      return { leaf: true, label: majority, counts: counts, n: pts.length, depth: depth };
    }

    var split = D.findBestSplit(pts, nClasses, criterion, features);
    if (split.gain <= 0) {
      return { leaf: true, label: majority, counts: counts, n: pts.length, depth: depth };
    }

    var leftPts = [], rightPts = [];
    for (var i = 0; i < pts.length; i++) {
      if (pts[i][split.feature] <= split.threshold) leftPts.push(pts[i]);
      else rightPts.push(pts[i]);
    }

    if (leftPts.length === 0 || rightPts.length === 0) {
      return { leaf: true, label: majority, counts: counts, n: pts.length, depth: depth };
    }

    return {
      leaf: false,
      feature: split.feature,
      threshold: split.threshold,
      gain: split.gain,
      counts: counts,
      n: pts.length,
      depth: depth,
      left: D.buildTree(leftPts, nClasses, criterion, maxDepth, minSamples, depth + 1, features),
      right: D.buildTree(rightPts, nClasses, criterion, maxDepth, minSamples, depth + 1, features)
    };
  };

  // --- Build regression tree ---
  D.buildRegressionTree = function(pts, maxDepth, minSamples, depth) {
    if (!depth) depth = 0;
    if (!minSamples) minSamples = 2;
    var vals = [];
    for (var i = 0; i < pts.length; i++) vals.push(pts[i].y);
    var avg = D.mean(vals);
    var v = D.variance(vals);

    if (depth >= maxDepth || pts.length < minSamples || v < 0.001) {
      return { leaf: true, value: avg, n: pts.length, depth: depth };
    }

    var split = D.findBestSplitRegression(pts, ['x']);
    if (split.gain <= 0) {
      return { leaf: true, value: avg, n: pts.length, depth: depth };
    }

    var leftPts = [], rightPts = [];
    for (var i = 0; i < pts.length; i++) {
      if (pts[i][split.feature] <= split.threshold) leftPts.push(pts[i]);
      else rightPts.push(pts[i]);
    }

    if (leftPts.length === 0 || rightPts.length === 0) {
      return { leaf: true, value: avg, n: pts.length, depth: depth };
    }

    return {
      leaf: false,
      feature: split.feature,
      threshold: split.threshold,
      gain: split.gain,
      value: avg,
      n: pts.length,
      depth: depth,
      left: D.buildRegressionTree(leftPts, maxDepth, minSamples, depth + 1),
      right: D.buildRegressionTree(rightPts, maxDepth, minSamples, depth + 1)
    };
  };

  // --- Predict single point ---
  D.predict = function(tree, pt) {
    if (tree.leaf) return tree.label;
    if (pt[tree.feature] <= tree.threshold) return D.predict(tree.left, pt);
    return D.predict(tree.right, pt);
  };

  D.predictRegression = function(tree, pt) {
    if (tree.leaf) return tree.value;
    if (pt[tree.feature] <= tree.threshold) return D.predictRegression(tree.left, pt);
    return D.predictRegression(tree.right, pt);
  };

  // --- Collect tree nodes for drawing (BFS with positions) ---
  D.layoutTree = function(tree, width, startY, yStep) {
    if (!startY) startY = 30;
    if (!yStep) yStep = 55;
    var nodes = [];
    var queue = [{ node: tree, x: width / 2, y: startY, xMin: 0, xMax: width }];
    while (queue.length > 0) {
      var item = queue.shift();
      var n = item.node;
      var entry = { x: item.x, y: item.y, node: n };
      nodes.push(entry);
      if (!n.leaf) {
        var midX = (item.xMin + item.xMax) / 2;
        var childY = item.y + yStep;
        var leftX = (item.xMin + midX) / 2;
        var rightX = (midX + item.xMax) / 2;
        entry.leftChild = { x: leftX, y: childY };
        entry.rightChild = { x: rightX, y: childY };
        queue.push({ node: n.left, x: leftX, y: childY, xMin: item.xMin, xMax: midX });
        queue.push({ node: n.right, x: rightX, y: childY, xMin: midX, xMax: item.xMax });
      }
    }
    return nodes;
  };

  // --- Collect splits in order (for animation) ---
  D.collectSplitsInOrder = function(tree) {
    var splits = [];
    function walk(node) {
      if (!node || node.leaf) return;
      splits.push(node);
      walk(node.left);
      walk(node.right);
    }
    walk(tree);
    return splits;
  };

  // --- Build tree level by level (for step animation) ---
  D.buildTreeSteps = function(pts, nClasses, criterion, maxDepth, minSamples, features) {
    if (!minSamples) minSamples = 2;
    if (!features) features = ['x', 'y'];
    // Returns array of trees at increasing depth
    var steps = [];
    for (var d = 0; d <= maxDepth; d++) {
      steps.push(D.buildTree(pts, nClasses, criterion, d, minSamples, 0, features));
    }
    return steps;
  };

  // --- Data generators ---
  D.genTwoBlobs = function(n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var label = i < n / 2 ? 0 : 1;
      var cx = label === 0 ? -1.2 : 1.2;
      var cy = label === 0 ? -1.0 : 1.0;
      pts.push({
        x: cx + (Math.random() - 0.5) * 2.4,
        y: cy + (Math.random() - 0.5) * 2.4,
        label: label
      });
    }
    return pts;
  };

  D.genMoons = function(n) {
    var pts = [];
    var half = Math.floor(n / 2);
    for (var i = 0; i < half; i++) {
      var t = Math.PI * i / half;
      pts.push({
        x: Math.cos(t) + (Math.random() - 0.5) * 0.25,
        y: Math.sin(t) + (Math.random() - 0.5) * 0.25,
        label: 0
      });
    }
    for (var i = 0; i < n - half; i++) {
      var t = Math.PI * i / (n - half);
      pts.push({
        x: 1 - Math.cos(t) + (Math.random() - 0.5) * 0.25,
        y: 0.5 - Math.sin(t) + (Math.random() - 0.5) * 0.25,
        label: 1
      });
    }
    return pts;
  };

  D.genSpiral = function(n) {
    var pts = [];
    var half = Math.floor(n / 2);
    for (var i = 0; i < half; i++) {
      var t = i / half * 2 * Math.PI;
      var r = 0.3 + t * 0.25;
      pts.push({
        x: r * Math.cos(t) + (Math.random() - 0.5) * 0.3,
        y: r * Math.sin(t) + (Math.random() - 0.5) * 0.3,
        label: 0
      });
    }
    for (var i = 0; i < n - half; i++) {
      var t = i / (n - half) * 2 * Math.PI;
      var r = 0.3 + t * 0.25;
      pts.push({
        x: -r * Math.cos(t) + (Math.random() - 0.5) * 0.3,
        y: -r * Math.sin(t) + (Math.random() - 0.5) * 0.3,
        label: 1
      });
    }
    return pts;
  };

  D.genRegression = function(n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var x = -3 + 6 * i / (n - 1);
      var y = Math.sin(x) + 0.5 * Math.sin(2.5 * x) + (Math.random() - 0.5) * 0.5;
      pts.push({ x: x, y: y });
    }
    return pts;
  };

  // --- Drawing helpers ---
  D.drawGrid = function(ctx, W, H, pad, c) {
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 8; i++) {
      var x = pad + (W - 2 * pad) * i / 8;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H - pad); ctx.stroke();
    }
    for (var i = 0; i <= 8; i++) {
      var y = pad + (H - 2 * pad) * i / 8;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);
  };

  D.toCanvas = function(px, py, W, H, pad, xR, yR) {
    return {
      x: pad + (px - xR[0]) / (xR[1] - xR[0]) * (W - 2 * pad),
      y: H - pad - (py - yR[0]) / (yR[1] - yR[0]) * (H - 2 * pad)
    };
  };

  D.fromCanvas = function(cx, cy, W, H, pad, xR, yR) {
    return {
      x: xR[0] + (cx - pad) / (W - 2 * pad) * (xR[1] - xR[0]),
      y: yR[0] + (H - pad - cy) / (H - 2 * pad) * (yR[1] - yR[0])
    };
  };

  return D;
})();
</script>

## What is a Decision Tree?

A **decision tree** is one of the most intuitive machine learning models. It makes predictions by asking a series of yes/no questions about the features, splitting the data at each step until it arrives at a final prediction. Think of it as a flowchart for classification.

Every internal node tests a condition like "Is feature X <= threshold?". Each branch leads to a child node, and the **leaf nodes** hold the final prediction. The path from root to leaf represents a chain of logical rules that any human can read and understand.

Click the nodes in the tree below to trace a decision path. The highlighted path shows how the tree classifies a data point about whether to go outside today.

<div class="interactive-demo" id="demo-intro">
  <canvas id="canvas-intro"></canvas>
  <div class="demo-info" id="info-intro">Click any leaf node to highlight the decision path</div>
</div>

<script>
(function() {
  var W = 680, H = 340;
  var canvas = document.getElementById('canvas-intro');
  var ctx = DT.setupCanvas(canvas, W, H);
  var info = document.getElementById('info-intro');

  // Pre-built "go outside?" tree
  var treeData = {
    q: 'Raining?', x: W / 2, y: 40,
    yes: {
      q: 'Have Umbrella?', x: W / 4, y: 130,
      yes: { answer: 'Go Outside', x: W / 8, y: 225, cls: 0 },
      no: { answer: 'Stay In', x: 3 * W / 8, y: 225, cls: 1 }
    },
    no: {
      q: 'Temp > 35C?', x: 3 * W / 4, y: 130,
      yes: { answer: 'Stay In', x: 5 * W / 8, y: 225, cls: 1 },
      no: { answer: 'Go Outside', x: 7 * W / 8, y: 225, cls: 0 }
    }
  };

  var highlighted = null;

  function getPath(node, target, path) {
    path.push(node);
    if (node === target) return true;
    if (node.yes && getPath(node.yes, target, path)) return true;
    if (node.no && getPath(node.no, target, path)) return true;
    path.pop();
    return false;
  }

  function getAllLeaves(node, leaves) {
    if (node.answer) { leaves.push(node); return; }
    getAllLeaves(node.yes, leaves);
    getAllLeaves(node.no, leaves);
  }

  function draw() {
    var c = DT.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var path = [];
    if (highlighted) getPath(treeData, highlighted, path);
    var pathSet = new Set(path);

    function drawEdge(parent, child, label) {
      var onPath = pathSet.has(parent) && pathSet.has(child);
      ctx.strokeStyle = onPath ? c.accent : c.border;
      ctx.lineWidth = onPath ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(parent.x, parent.y + 18);
      ctx.lineTo(child.x, child.y - 18);
      ctx.stroke();
      // Edge label
      var mx = (parent.x + child.x) / 2;
      var my = (parent.y + child.y) / 2;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillStyle = onPath ? c.accent : c.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText(label, mx + (child.x < parent.x ? -14 : 14), my - 2);
    }

    function drawNode(node) {
      var onPath = pathSet.has(node);
      if (node.answer) {
        // Leaf
        var col = node.cls === 0 ? c.class0 : c.class1;
        var bg = node.cls === 0 ? c.class0Light : c.class1Light;
        ctx.fillStyle = onPath ? col : bg;
        ctx.beginPath();
        ctx.roundRect(node.x - 52, node.y - 16, 104, 32, 8);
        ctx.fill();
        ctx.strokeStyle = col;
        ctx.lineWidth = onPath ? 2.5 : 1.5;
        ctx.stroke();
        ctx.font = (onPath ? 'bold ' : '') + '12px system-ui, sans-serif';
        ctx.fillStyle = onPath ? (c.isDark ? '#1a1b26' : '#ffffff') : col;
        ctx.textAlign = 'center';
        ctx.fillText(node.answer, node.x, node.y + 4);
      } else {
        // Internal node
        ctx.fillStyle = onPath ? c.node : c.bgSecondary;
        ctx.strokeStyle = onPath ? c.node : c.border;
        ctx.lineWidth = onPath ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.roundRect(node.x - 60, node.y - 18, 120, 36, 10);
        ctx.fill();
        ctx.stroke();
        ctx.font = (onPath ? 'bold ' : '') + '13px system-ui, sans-serif';
        ctx.fillStyle = onPath ? (c.isDark ? '#1a1b26' : '#ffffff') : c.text;
        ctx.textAlign = 'center';
        ctx.fillText(node.q, node.x, node.y + 5);
      }
    }

    // Draw edges first
    function drawEdges(node) {
      if (node.yes) { drawEdge(node, node.yes, 'Yes'); drawEdges(node.yes); }
      if (node.no) { drawEdge(node, node.no, 'No'); drawEdges(node.no); }
    }
    drawEdges(treeData);

    // Draw nodes
    function drawNodes(node) {
      drawNode(node);
      if (node.yes) drawNodes(node.yes);
      if (node.no) drawNodes(node.no);
    }
    drawNodes(treeData);

    // Legend
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.textMuted;
    ctx.fillText('Click a leaf to trace the decision path', W / 2 - 130, H - 15);
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    var my = (e.clientY - rect.top) * (H / rect.height);
    var leaves = [];
    getAllLeaves(treeData, leaves);
    highlighted = null;
    for (var i = 0; i < leaves.length; i++) {
      var dx = mx - leaves[i].x, dy = my - leaves[i].y;
      if (Math.abs(dx) < 55 && Math.abs(dy) < 20) {
        highlighted = leaves[i];
        break;
      }
    }
    draw();
    if (highlighted) {
      var path = [];
      getPath(treeData, highlighted, path);
      var desc = path.map(function(n) { return n.q || n.answer; }).join(' -> ');
      info.textContent = 'Path: ' + desc;
    } else {
      info.textContent = 'Click any leaf node to highlight the decision path';
    }
  });

  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var t = e.touches[0];
    var rect = canvas.getBoundingClientRect();
    var mx = (t.clientX - rect.left) * (W / rect.width);
    var my = (t.clientY - rect.top) * (H / rect.height);
    var leaves = [];
    getAllLeaves(treeData, leaves);
    highlighted = null;
    for (var i = 0; i < leaves.length; i++) {
      var dx = mx - leaves[i].x, dy = my - leaves[i].y;
      if (Math.abs(dx) < 55 && Math.abs(dy) < 20) { highlighted = leaves[i]; break; }
    }
    draw();
  }, { passive: false });

  DT.observeTheme(draw);
  draw();
})();
</script>

The beauty of decision trees is **interpretability**. Unlike a neural network or SVM, you can explain exactly *why* the model made a prediction by reading the path from root to leaf. This makes them popular in regulated industries (finance, healthcare) where model transparency is required.

---

## Splitting Criteria: Gini Impurity and Entropy

How does a decision tree decide *where* to split? It evaluates every possible feature and threshold, and picks the one that **reduces impurity the most**. The two most common impurity measures are:

**Gini Impurity:**

$$\text{Gini}(S) = 1 - \sum_{k=1}^{K} p_k^2$$

**Entropy:**

$$\text{Entropy}(S) = -\sum_{k=1}^{K} p_k \log_2(p_k)$$

where $$p_k$$ is the fraction of samples belonging to class $$k$$.

Both equal **0 for a pure node** (all one class) and reach their maximum for a perfectly balanced split. Drag the threshold below to see how both measures change as you move the split point across a 1D dataset.

<div class="interactive-demo" id="demo-split-criteria">
  <canvas id="canvas-split-criteria"></canvas>
  <div class="demo-controls">
    <label>Threshold: <input type="range" id="slider-split-thresh" min="0" max="100" value="50"> <span class="demo-value" id="val-split-thresh">0.50</span></label>
    <button id="btn-split-regen">New Data</button>
  </div>
  <div class="demo-info" id="info-split-criteria">Drag the threshold to see how impurity changes</div>
</div>

<script>
(function() {
  var W = 680, H = 300;
  var canvas = document.getElementById('canvas-split-criteria');
  var ctx = DT.setupCanvas(canvas, W, H);
  var slider = document.getElementById('slider-split-thresh');
  var valSpan = document.getElementById('val-split-thresh');
  var btnRegen = document.getElementById('btn-split-regen');
  var info = document.getElementById('info-split-criteria');

  var pad = 45, pts = [];

  function genData() {
    pts = [];
    for (var i = 0; i < 40; i++) {
      var x = Math.random();
      var label = x < 0.35 ? 0 : (x > 0.65 ? 1 : (Math.random() < 0.5 ? 0 : 1));
      pts.push({ x: x, label: label });
    }
    pts.sort(function(a, b) { return a.x - b.x; });
  }

  function draw() {
    var c = DT.getColors();
    var thresh = parseInt(slider.value) / 100;
    valSpan.textContent = thresh.toFixed(2);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Regions
    var splitX = pad + thresh * (W - 2 * pad);
    ctx.fillStyle = c.class0Light;
    ctx.fillRect(pad, pad, splitX - pad, H - 2 * pad);
    ctx.fillStyle = c.class1Light;
    ctx.fillRect(splitX, pad, W - pad - splitX, H - 2 * pad);

    // Split line
    ctx.strokeStyle = c.split;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(splitX, pad);
    ctx.lineTo(splitX, H - pad);
    ctx.stroke();
    ctx.setLineDash([]);

    // Grid + border
    DT.drawGrid(ctx, W, H, pad, c);

    // Points on a line at y=H/2
    var yLine = H / 2;
    for (var i = 0; i < pts.length; i++) {
      var px = pad + pts[i].x * (W - 2 * pad);
      var py = yLine + (Math.sin(i * 1.5) * 20);
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = pts[i].label === 0 ? c.class0 : c.class1;
      ctx.fill();
      ctx.strokeStyle = c.bg;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Compute impurities
    var leftC = [0, 0], rightC = [0, 0], nL = 0, nR = 0;
    for (var i = 0; i < pts.length; i++) {
      if (pts[i].x <= thresh) { leftC[pts[i].label]++; nL++; }
      else { rightC[pts[i].label]++; nR++; }
    }
    var giniL = DT.gini(leftC, nL), giniR = DT.gini(rightC, nR);
    var entL = DT.entropy(leftC, nL), entR = DT.entropy(rightC, nR);
    var wGini = (nL * giniL + nR * giniR) / pts.length;
    var wEnt = (nL * entL + nR * entR) / pts.length;

    // Bars on right side
    var barX = W - 180, barW = 130, barH = 18;
    var barY = pad + 10;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';

    // Gini
    ctx.fillStyle = c.text;
    ctx.fillText('Gini (weighted)', barX, barY);
    barY += 14;
    ctx.fillStyle = c.bgSecondary;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = c.class0;
    ctx.fillRect(barX, barY, barW * Math.min(wGini, 1), barH);
    ctx.fillStyle = c.bg;
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillText(wGini.toFixed(3), barX + 4, barY + 13);

    // Entropy
    barY += 34;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = c.text;
    ctx.fillText('Entropy (weighted)', barX, barY);
    barY += 14;
    ctx.fillStyle = c.bgSecondary;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = c.class1;
    ctx.fillRect(barX, barY, barW * Math.min(wEnt, 1), barH);
    ctx.fillStyle = c.bg;
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillText(wEnt.toFixed(3), barX + 4, barY + 13);

    // Counts
    barY += 34;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = c.textMuted;
    ctx.fillText('Left: ' + nL + ' (' + leftC[0] + '/' + leftC[1] + ')', barX, barY);
    ctx.fillText('Right: ' + nR + ' (' + rightC[0] + '/' + rightC[1] + ')', barX, barY + 16);

    info.textContent = 'Gini=' + wGini.toFixed(3) + '  Entropy=' + wEnt.toFixed(3) +
      '  |  Left: ' + nL + ' pts  Right: ' + nR + ' pts';
  }

  slider.addEventListener('input', draw);
  btnRegen.addEventListener('click', function() { genData(); draw(); });
  DT.observeTheme(draw);
  genData();
  draw();
})();
</script>

Notice how both measures agree on the best split location, they almost always pick the same threshold. The optimal split is where the two classes are separated most cleanly, giving the lowest weighted impurity.

---

## Gini vs Entropy: Side-by-Side Comparison

Let us plot both functions over the full range of $$p$$ (probability of class 1 in a binary problem). The x-axis is $$p$$, and the y-axis is impurity.

<div class="interactive-demo" id="demo-gini-entropy">
  <canvas id="canvas-gini-entropy"></canvas>
  <div class="demo-controls">
    <label><input type="checkbox" id="chk-show-gini" checked> Gini</label>
    <label><input type="checkbox" id="chk-show-entropy" checked> Entropy (scaled)</label>
    <label>p = <input type="range" id="slider-p-val" min="0" max="100" value="50"> <span class="demo-value" id="val-p-val">0.50</span></label>
  </div>
  <div class="demo-info" id="info-gini-entropy">Both peak at p=0.5 and equal 0 at the extremes</div>
</div>

<script>
(function() {
  var W = 680, H = 320;
  var canvas = document.getElementById('canvas-gini-entropy');
  var ctx = DT.setupCanvas(canvas, W, H);
  var chkGini = document.getElementById('chk-show-gini');
  var chkEnt = document.getElementById('chk-show-entropy');
  var sliderP = document.getElementById('slider-p-val');
  var valP = document.getElementById('val-p-val');
  var info = document.getElementById('info-gini-entropy');
  var pad = 50;

  function gini(p) { return 1 - p * p - (1 - p) * (1 - p); }
  function entropy(p) {
    if (p <= 0 || p >= 1) return 0;
    return -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
  }

  function draw() {
    var c = DT.getColors();
    var pVal = parseInt(sliderP.value) / 100;
    valP.textContent = pVal.toFixed(2);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    DT.drawGrid(ctx, W, H, pad, c);

    // Axes labels
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = c.textMuted;
    ctx.textAlign = 'center';
    ctx.fillText('p (proportion of class 1)', W / 2, H - 8);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Impurity', 0, 0);
    ctx.restore();

    // Tick labels
    for (var i = 0; i <= 4; i++) {
      var v = i * 0.25;
      var x = pad + v * (W - 2 * pad);
      ctx.fillStyle = c.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText(v.toFixed(2), x, H - pad + 16);
    }
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var v = i * 0.25;
      var y = H - pad - v * (H - 2 * pad);
      ctx.fillText(v.toFixed(2), pad - 8, y + 4);
    }

    var steps = 200;
    // Draw Entropy (scaled by /1 so max ~1.0)
    if (chkEnt.checked) {
      ctx.strokeStyle = c.class1;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var i = 0; i <= steps; i++) {
        var p = i / steps;
        var val = entropy(p);
        var x = pad + p * (W - 2 * pad);
        var y = H - pad - val * (H - 2 * pad);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw Gini
    if (chkGini.checked) {
      ctx.strokeStyle = c.class0;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var i = 0; i <= steps; i++) {
        var p = i / steps;
        var val = gini(p) * 2; // Scale Gini to match entropy range
        var x = pad + p * (W - 2 * pad);
        var y = H - pad - val * (H - 2 * pad);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Vertical indicator at p
    var px = pad + pVal * (W - 2 * pad);
    ctx.strokeStyle = c.split;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(px, pad);
    ctx.lineTo(px, H - pad);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dots at intersection
    var gVal = gini(pVal);
    var eVal = entropy(pVal);
    if (chkGini.checked) {
      var gy = H - pad - gVal * 2 * (H - 2 * pad);
      ctx.beginPath();
      ctx.arc(px, gy, 5, 0, Math.PI * 2);
      ctx.fillStyle = c.class0;
      ctx.fill();
    }
    if (chkEnt.checked) {
      var ey = H - pad - eVal * (H - 2 * pad);
      ctx.beginPath();
      ctx.arc(px, ey, 5, 0, Math.PI * 2);
      ctx.fillStyle = c.class1;
      ctx.fill();
    }

    // Legend
    var lx = pad + 12, ly = pad + 18;
    if (chkGini.checked) {
      ctx.fillStyle = c.class0;
      ctx.fillRect(lx, ly - 6, 14, 3);
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillStyle = c.text;
      ctx.textAlign = 'left';
      ctx.fillText('Gini (x2 scaled)', lx + 20, ly);
      ly += 18;
    }
    if (chkEnt.checked) {
      ctx.fillStyle = c.class1;
      ctx.fillRect(lx, ly - 6, 14, 3);
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillStyle = c.text;
      ctx.textAlign = 'left';
      ctx.fillText('Entropy', lx + 20, ly);
    }

    info.textContent = 'p=' + pVal.toFixed(2) +
      '  |  Gini=' + gVal.toFixed(3) + '  Entropy=' + eVal.toFixed(3);
  }

  sliderP.addEventListener('input', draw);
  chkGini.addEventListener('change', draw);
  chkEnt.addEventListener('change', draw);
  DT.observeTheme(draw);
  draw();
})();
</script>

When scaled to the same range, Gini and Entropy have nearly identical shapes. Gini peaks at 0.5, Entropy at 1.0. In practice, they produce the same tree in the vast majority of cases. Scikit-learn uses **Gini by default** because it avoids the logarithm computation and is slightly faster.

---

## Tree Builder Animation

This is the core demo. Press **Play** to watch a decision tree grow split-by-split on 2D data. The left panel shows the tree structure being built, while the right panel shows the feature space being partitioned into rectangles.

<div class="interactive-demo" id="demo-builder">
  <div class="demo-split">
    <div>
      <canvas id="canvas-builder-tree"></canvas>
      <div class="demo-caption">Tree Structure</div>
    </div>
    <div>
      <canvas id="canvas-builder-space"></canvas>
      <div class="demo-caption">Feature Space Partitions</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btn-builder-play">Play</button>
    <button id="btn-builder-step">Step</button>
    <button id="btn-builder-reset">Reset</button>
    <label>Speed: <input type="range" id="slider-builder-speed" min="1" max="10" value="4"> <span class="demo-value" id="val-builder-speed">4</span></label>
    <label>Criterion:
      <select id="sel-builder-criterion" style="padding:0.3rem 0.5rem;border:1px solid var(--border);border-radius:4px;background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
        <option value="gini">Gini</option>
        <option value="entropy">Entropy</option>
      </select>
    </label>
  </div>
  <div class="demo-info" id="info-builder">Press Play to watch the tree grow split-by-split</div>
</div>

<script>
(function() {
  var TW = 330, TH = 320, SW = 330, SH = 320;
  var canvasTree = document.getElementById('canvas-builder-tree');
  var canvasSpace = document.getElementById('canvas-builder-space');
  var ctxT = DT.setupCanvas(canvasTree, TW, TH);
  var ctxS = DT.setupCanvas(canvasSpace, SW, SH);
  var btnPlay = document.getElementById('btn-builder-play');
  var btnStep = document.getElementById('btn-builder-step');
  var btnReset = document.getElementById('btn-builder-reset');
  var sliderSpeed = document.getElementById('slider-builder-speed');
  var valSpeed = document.getElementById('val-builder-speed');
  var selCriterion = document.getElementById('sel-builder-criterion');
  var info = document.getElementById('info-builder');

  var pts, treeSteps, currentStep, playing, animId, maxSteps;
  var xR = [-3, 3], yR = [-3, 3], pad = 30;

  function init() {
    playing = false;
    if (animId) cancelAnimationFrame(animId);
    btnPlay.textContent = 'Play';
    pts = DT.genTwoBlobs(80);
    maxSteps = 8;
    treeSteps = DT.buildTreeSteps(pts, 2, selCriterion.value, maxSteps, 3);
    currentStep = 0;
    draw();
  }

  function countNodes(node) {
    if (!node) return 0;
    if (node.leaf) return 1;
    return 1 + countNodes(node.left) + countNodes(node.right);
  }

  function treeDepth(node) {
    if (!node || node.leaf) return 0;
    return 1 + Math.max(treeDepth(node.left), treeDepth(node.right));
  }

  function drawTreeVis(tree) {
    var c = DT.getColors();
    ctxT.fillStyle = c.bg;
    ctxT.fillRect(0, 0, TW, TH);

    if (!tree || (tree.leaf && currentStep === 0)) {
      ctxT.font = '13px system-ui, sans-serif';
      ctxT.fillStyle = c.textMuted;
      ctxT.textAlign = 'center';
      ctxT.fillText('Tree will appear here', TW / 2, TH / 2);
      return;
    }

    var nodes = DT.layoutTree(tree, TW, 30, 50);
    // Draw edges
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!n.node.leaf) {
        ctxT.strokeStyle = c.border;
        ctxT.lineWidth = 1.5;
        if (n.leftChild) {
          ctxT.beginPath();
          ctxT.moveTo(n.x, n.y + 14);
          ctxT.lineTo(n.leftChild.x, n.leftChild.y - 14);
          ctxT.stroke();
        }
        if (n.rightChild) {
          ctxT.beginPath();
          ctxT.moveTo(n.x, n.y + 14);
          ctxT.lineTo(n.rightChild.x, n.rightChild.y - 14);
          ctxT.stroke();
        }
      }
    }
    // Draw nodes
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var nd = n.node;
      if (nd.leaf) {
        var col = nd.label === 0 ? c.class0 : c.class1;
        ctxT.fillStyle = col;
        ctxT.globalAlpha = 0.2;
        ctxT.beginPath();
        ctxT.arc(n.x, n.y, 13, 0, Math.PI * 2);
        ctxT.fill();
        ctxT.globalAlpha = 1;
        ctxT.strokeStyle = col;
        ctxT.lineWidth = 2;
        ctxT.stroke();
        ctxT.font = 'bold 10px JetBrains Mono, monospace';
        ctxT.fillStyle = col;
        ctxT.textAlign = 'center';
        ctxT.fillText(nd.n, n.x, n.y + 4);
      } else {
        ctxT.fillStyle = c.bgSecondary;
        ctxT.strokeStyle = c.node;
        ctxT.lineWidth = 2;
        ctxT.beginPath();
        ctxT.roundRect(n.x - 38, n.y - 13, 76, 26, 6);
        ctxT.fill();
        ctxT.stroke();
        ctxT.font = '10px JetBrains Mono, monospace';
        ctxT.fillStyle = c.text;
        ctxT.textAlign = 'center';
        ctxT.fillText(nd.feature + '<=' + nd.threshold.toFixed(1), n.x, n.y + 4);
      }
    }
  }

  function drawDecisionBoundary(tree) {
    var c = DT.getColors();
    ctxS.fillStyle = c.bg;
    ctxS.fillRect(0, 0, SW, SH);

    // Draw regions
    var res = 3;
    for (var px = pad; px < SW - pad; px += res) {
      for (var py = pad; py < SH - pad; py += res) {
        var pt = DT.fromCanvas(px, py, SW, SH, pad, xR, yR);
        var pred = DT.predict(tree, pt);
        ctxS.fillStyle = pred === 0 ? c.class0Light : c.class1Light;
        ctxS.fillRect(px, py, res, res);
      }
    }

    // Draw split lines
    function drawSplits(node, xMin, xMax, yMin, yMax) {
      if (!node || node.leaf) return;
      ctxS.strokeStyle = c.split;
      ctxS.lineWidth = 1.5;
      ctxS.setLineDash([4, 3]);
      if (node.feature === 'x') {
        var cx = DT.toCanvas(node.threshold, 0, SW, SH, pad, xR, yR).x;
        var cy1 = DT.toCanvas(0, yMin, SW, SH, pad, xR, yR).y;
        var cy2 = DT.toCanvas(0, yMax, SW, SH, pad, xR, yR).y;
        ctxS.beginPath();
        ctxS.moveTo(cx, cy1);
        ctxS.lineTo(cx, cy2);
        ctxS.stroke();
        drawSplits(node.left, xMin, node.threshold, yMin, yMax);
        drawSplits(node.right, node.threshold, xMax, yMin, yMax);
      } else {
        var cy = DT.toCanvas(0, node.threshold, SW, SH, pad, xR, yR).y;
        var cx1 = DT.toCanvas(xMin, 0, SW, SH, pad, xR, yR).x;
        var cx2 = DT.toCanvas(xMax, 0, SW, SH, pad, xR, yR).x;
        ctxS.beginPath();
        ctxS.moveTo(cx1, cy);
        ctxS.lineTo(cx2, cy);
        ctxS.stroke();
        drawSplits(node.left, xMin, xMax, yMin, node.threshold);
        drawSplits(node.right, xMin, xMax, node.threshold, yMax);
      }
      ctxS.setLineDash([]);
    }
    drawSplits(tree, xR[0], xR[1], yR[0], yR[1]);

    // Draw grid + points
    DT.drawGrid(ctxS, SW, SH, pad, c);
    for (var i = 0; i < pts.length; i++) {
      var cp = DT.toCanvas(pts[i].x, pts[i].y, SW, SH, pad, xR, yR);
      ctxS.beginPath();
      ctxS.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
      ctxS.fillStyle = pts[i].label === 0 ? c.class0 : c.class1;
      ctxS.fill();
      ctxS.strokeStyle = c.bg;
      ctxS.lineWidth = 1;
      ctxS.stroke();
    }
  }

  function draw() {
    var tree = treeSteps[currentStep];
    drawTreeVis(tree);
    drawDecisionBoundary(tree);

    var acc = 0;
    for (var i = 0; i < pts.length; i++) {
      if (DT.predict(tree, pts[i]) === pts[i].label) acc++;
    }
    acc = (100 * acc / pts.length).toFixed(1);
    info.textContent = 'Depth: ' + currentStep + '/' + maxSteps +
      '  |  Nodes: ' + countNodes(tree) +
      '  |  Train Acc: ' + acc + '%';
  }

  function step() {
    if (currentStep < maxSteps) {
      currentStep++;
      draw();
    } else {
      playing = false;
      btnPlay.textContent = 'Play';
    }
  }

  function animate() {
    if (!playing) return;
    step();
    if (playing) {
      var delay = 1200 - parseInt(sliderSpeed.value) * 100;
      setTimeout(function() { animId = requestAnimationFrame(animate); }, delay);
    }
  }

  btnPlay.addEventListener('click', function() {
    if (playing) {
      playing = false;
      btnPlay.textContent = 'Play';
    } else {
      if (currentStep >= maxSteps) currentStep = 0;
      playing = true;
      btnPlay.textContent = 'Pause';
      animate();
    }
  });

  btnStep.addEventListener('click', function() {
    playing = false;
    btnPlay.textContent = 'Play';
    step();
  });

  btnReset.addEventListener('click', init);
  sliderSpeed.addEventListener('input', function() { valSpeed.textContent = sliderSpeed.value; });
  selCriterion.addEventListener('change', init);
  DT.observeTheme(draw);
  init();
})();
</script>

Watch carefully how each split divides the feature space with an **axis-aligned rectangle**. This is a fundamental property of decision trees, they can only split parallel to the axes, never diagonally. This means diagonal decision boundaries require many small staircase-like splits to approximate.

---

## Overfitting: The Depth Slider

A decision tree with no depth limit will keep splitting until every leaf is pure. On training data, it reaches 100% accuracy, but it memorizes noise and performs poorly on new data. This is **overfitting**.

Drag the **max depth** slider to see how tree complexity affects the decision boundary. At depth 1, the tree underfits (too simple). At depth 15, it overfits (too complex). The sweet spot is usually somewhere in between.

<div class="interactive-demo" id="demo-depth">
  <div class="demo-split">
    <div>
      <canvas id="canvas-depth-tree"></canvas>
      <div class="demo-caption">Tree Structure</div>
    </div>
    <div>
      <canvas id="canvas-depth-space"></canvas>
      <div class="demo-caption">Decision Boundary</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Max Depth: <input type="range" id="slider-depth" min="1" max="15" value="3"> <span class="demo-value" id="val-depth">3</span></label>
    <label>Dataset:
      <select id="sel-depth-data" style="padding:0.3rem 0.5rem;border:1px solid var(--border);border-radius:4px;background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
        <option value="blobs">Two Blobs</option>
        <option value="moons">Moons</option>
        <option value="spiral">Spiral</option>
      </select>
    </label>
    <button id="btn-depth-regen">New Data</button>
  </div>
  <div class="demo-info" id="info-depth">Adjust max depth to see underfitting vs overfitting</div>
</div>

<script>
(function() {
  var TW = 330, TH = 320, SW = 330, SH = 320;
  var canvasTree = document.getElementById('canvas-depth-tree');
  var canvasSpace = document.getElementById('canvas-depth-space');
  var ctxT = DT.setupCanvas(canvasTree, TW, TH);
  var ctxS = DT.setupCanvas(canvasSpace, SW, SH);
  var sliderDepth = document.getElementById('slider-depth');
  var valDepth = document.getElementById('val-depth');
  var selData = document.getElementById('sel-depth-data');
  var btnRegen = document.getElementById('btn-depth-regen');
  var info = document.getElementById('info-depth');

  var pts, pad = 30;
  var xR = [-3, 3], yR = [-3, 3];

  function genData() {
    var ds = selData.value;
    if (ds === 'moons') {
      pts = DT.genMoons(100);
      xR = [-1, 2.5]; yR = [-1, 2];
    } else if (ds === 'spiral') {
      pts = DT.genSpiral(120);
      xR = [-3, 3]; yR = [-3, 3];
    } else {
      pts = DT.genTwoBlobs(80);
      xR = [-3, 3]; yR = [-3, 3];
    }
  }

  function countNodes(node) {
    if (!node) return 0;
    if (node.leaf) return 1;
    return 1 + countNodes(node.left) + countNodes(node.right);
  }

  function draw() {
    var maxD = parseInt(sliderDepth.value);
    valDepth.textContent = maxD;
    var tree = DT.buildTree(pts, 2, 'gini', maxD, 2, 0);
    var c = DT.getColors();

    // Draw tree
    ctxT.fillStyle = c.bg;
    ctxT.fillRect(0, 0, TW, TH);
    var yStep = Math.min(50, Math.max(25, (TH - 60) / (maxD + 1)));
    var nodes = DT.layoutTree(tree, TW, 25, yStep);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!n.node.leaf && n.leftChild) {
        ctxT.strokeStyle = c.border;
        ctxT.lineWidth = 1.2;
        ctxT.beginPath();
        ctxT.moveTo(n.x, n.y + 10);
        ctxT.lineTo(n.leftChild.x, n.leftChild.y - 10);
        ctxT.stroke();
      }
      if (!n.node.leaf && n.rightChild) {
        ctxT.strokeStyle = c.border;
        ctxT.lineWidth = 1.2;
        ctxT.beginPath();
        ctxT.moveTo(n.x, n.y + 10);
        ctxT.lineTo(n.rightChild.x, n.rightChild.y - 10);
        ctxT.stroke();
      }
    }
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var nd = n.node;
      if (nd.leaf) {
        var col = nd.label === 0 ? c.class0 : c.class1;
        ctxT.beginPath();
        ctxT.arc(n.x, n.y, 8, 0, Math.PI * 2);
        ctxT.fillStyle = col;
        ctxT.globalAlpha = 0.3;
        ctxT.fill();
        ctxT.globalAlpha = 1;
        ctxT.strokeStyle = col;
        ctxT.lineWidth = 1.5;
        ctxT.stroke();
      } else {
        ctxT.fillStyle = c.bgSecondary;
        ctxT.strokeStyle = c.node;
        ctxT.lineWidth = 1.5;
        ctxT.beginPath();
        ctxT.arc(n.x, n.y, 10, 0, Math.PI * 2);
        ctxT.fill();
        ctxT.stroke();
      }
    }

    // Draw feature space
    ctxS.fillStyle = c.bg;
    ctxS.fillRect(0, 0, SW, SH);
    var res = 3;
    for (var px = pad; px < SW - pad; px += res) {
      for (var py = pad; py < SH - pad; py += res) {
        var pt = DT.fromCanvas(px, py, SW, SH, pad, xR, yR);
        var pred = DT.predict(tree, pt);
        ctxS.fillStyle = pred === 0 ? c.class0Light : c.class1Light;
        ctxS.fillRect(px, py, res, res);
      }
    }
    DT.drawGrid(ctxS, SW, SH, pad, c);
    for (var i = 0; i < pts.length; i++) {
      var cp = DT.toCanvas(pts[i].x, pts[i].y, SW, SH, pad, xR, yR);
      ctxS.beginPath();
      ctxS.arc(cp.x, cp.y, 3.5, 0, Math.PI * 2);
      ctxS.fillStyle = pts[i].label === 0 ? c.class0 : c.class1;
      ctxS.fill();
      ctxS.strokeStyle = c.bg;
      ctxS.lineWidth = 1;
      ctxS.stroke();
    }

    var acc = 0;
    for (var i = 0; i < pts.length; i++) {
      if (DT.predict(tree, pts[i]) === pts[i].label) acc++;
    }
    acc = (100 * acc / pts.length).toFixed(1);
    info.textContent = 'Max Depth: ' + maxD + '  |  Nodes: ' + countNodes(tree) +
      '  |  Train Accuracy: ' + acc + '%';
  }

  sliderDepth.addEventListener('input', draw);
  selData.addEventListener('change', function() { genData(); draw(); });
  btnRegen.addEventListener('click', function() { genData(); draw(); });
  DT.observeTheme(draw);
  genData();
  draw();
})();
</script>

<div class="demo-hint">
Try the Spiral dataset with depth 1, then slowly increase to 15. Watch how the boundary goes from a single straight line to an intricate staircase pattern that memorizes every point. The optimal depth for moons is typically around 4-6.
</div>

This is why **pruning** matters. In practice, you control complexity via:
- **max_depth**, limits how deep the tree can grow
- **min_samples_split**, minimum samples required to split a node
- **min_samples_leaf**, minimum samples in a leaf node
- **Post-pruning** (cost-complexity pruning), grow a full tree, then remove branches that do not improve validation accuracy

---

## Interactive Feature Space

Click on the canvas below to add data points (left click for class 0, right click for class 1). The decision tree updates in real-time, showing how the rectangular decision regions adapt to your data.

<div class="interactive-demo" id="demo-interactive">
  <canvas id="canvas-interactive"></canvas>
  <div class="demo-controls">
    <label>Max Depth: <input type="range" id="slider-int-depth" min="1" max="10" value="4"> <span class="demo-value" id="val-int-depth">4</span></label>
    <button id="btn-int-clear">Clear</button>
    <button id="btn-int-sample">Add Sample Data</button>
  </div>
  <div class="demo-info" id="info-interactive">Left-click: class 0 (blue) | Right-click: class 1 (red)</div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var canvas = document.getElementById('canvas-interactive');
  var ctx = DT.setupCanvas(canvas, W, H);
  var sliderDepth = document.getElementById('slider-int-depth');
  var valDepth = document.getElementById('val-int-depth');
  var btnClear = document.getElementById('btn-int-clear');
  var btnSample = document.getElementById('btn-int-sample');
  var info = document.getElementById('info-interactive');

  var pts = [], pad = 35;
  var xR = [-3, 3], yR = [-3, 3];

  function draw() {
    var c = DT.getColors();
    var maxD = parseInt(sliderDepth.value);
    valDepth.textContent = maxD;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    if (pts.length >= 4) {
      var tree = DT.buildTree(pts, 2, 'gini', maxD, 2, 0);
      // Decision regions
      var res = 4;
      for (var px = pad; px < W - pad; px += res) {
        for (var py = pad; py < H - pad; py += res) {
          var pt = DT.fromCanvas(px, py, W, H, pad, xR, yR);
          var pred = DT.predict(tree, pt);
          ctx.fillStyle = pred === 0 ? c.class0Light : c.class1Light;
          ctx.fillRect(px, py, res, res);
        }
      }
    }

    DT.drawGrid(ctx, W, H, pad, c);

    for (var i = 0; i < pts.length; i++) {
      var cp = DT.toCanvas(pts[i].x, pts[i].y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = pts[i].label === 0 ? c.class0 : c.class1;
      ctx.fill();
      ctx.strokeStyle = c.bg;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    var c0 = 0, c1 = 0;
    for (var i = 0; i < pts.length; i++) {
      if (pts[i].label === 0) c0++; else c1++;
    }
    info.textContent = 'Points: ' + pts.length + ' (blue=' + c0 + ', red=' + c1 +
      ')  |  Left-click: blue  Right-click: red';
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    var my = (e.clientY - rect.top) * (H / rect.height);
    var pt = DT.fromCanvas(mx, my, W, H, pad, xR, yR);
    pts.push({ x: pt.x, y: pt.y, label: 0 });
    draw();
  });

  canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    var my = (e.clientY - rect.top) * (H / rect.height);
    var pt = DT.fromCanvas(mx, my, W, H, pad, xR, yR);
    pts.push({ x: pt.x, y: pt.y, label: 1 });
    draw();
  });

  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    var rect = canvas.getBoundingClientRect();
    var mx = (touch.clientX - rect.left) * (W / rect.width);
    var my = (touch.clientY - rect.top) * (H / rect.height);
    var pt = DT.fromCanvas(mx, my, W, H, pad, xR, yR);
    // Alternate labels on touch
    var lastLabel = pts.length > 0 ? pts[pts.length - 1].label : 1;
    pts.push({ x: pt.x, y: pt.y, label: 1 - lastLabel });
    draw();
  }, { passive: false });

  sliderDepth.addEventListener('input', draw);
  btnClear.addEventListener('click', function() { pts = []; draw(); });
  btnSample.addEventListener('click', function() {
    pts = DT.genTwoBlobs(60);
    draw();
  });
  DT.observeTheme(draw);
  draw();
})();
</script>

Try creating clusters, then increase the depth to see how the tree captures them. Notice that with enough depth, the tree can perfectly separate **any** configuration of points, but the boundary becomes increasingly jagged and unlikely to generalize.

---

## Regression Trees

Decision trees are not limited to classification. A **regression tree** predicts continuous values by assigning the **mean** of training samples in each leaf region. Instead of minimizing Gini or Entropy, it minimizes **variance** (or equivalently, mean squared error).

$$\text{Variance}(S) = \frac{1}{|S|} \sum_{i \in S} (y_i - \bar{y})^2$$

The result is a **piecewise-constant** step function. Drag the depth slider to see how more splits create a closer approximation to the underlying curve.

<div class="interactive-demo" id="demo-regression">
  <canvas id="canvas-regression"></canvas>
  <div class="demo-controls">
    <label>Max Depth: <input type="range" id="slider-reg-depth" min="1" max="10" value="3"> <span class="demo-value" id="val-reg-depth">3</span></label>
    <button id="btn-reg-regen">New Data</button>
  </div>
  <div class="demo-info" id="info-regression">Drag the depth slider to control how closely the tree fits the data</div>
</div>

<script>
(function() {
  var W = 680, H = 360;
  var canvas = document.getElementById('canvas-regression');
  var ctx = DT.setupCanvas(canvas, W, H);
  var sliderDepth = document.getElementById('slider-reg-depth');
  var valDepth = document.getElementById('val-reg-depth');
  var btnRegen = document.getElementById('btn-reg-regen');
  var info = document.getElementById('info-regression');

  var pts, pad = 50;
  var xR = [-3.5, 3.5], yR = [-2.5, 2.5];

  function genData() {
    pts = DT.genRegression(60);
    // Update yR based on data
    var minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < pts.length; i++) {
      if (pts[i].y < minY) minY = pts[i].y;
      if (pts[i].y > maxY) maxY = pts[i].y;
    }
    var margin = (maxY - minY) * 0.2;
    yR = [minY - margin, maxY + margin];
  }

  function draw() {
    var c = DT.getColors();
    var maxD = parseInt(sliderDepth.value);
    valDepth.textContent = maxD;

    var tree = DT.buildRegressionTree(pts, maxD, 3, 0);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    DT.drawGrid(ctx, W, H, pad, c);

    // Axis labels
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = c.textMuted;
    ctx.textAlign = 'center';
    for (var i = 0; i <= 4; i++) {
      var v = xR[0] + (xR[1] - xR[0]) * i / 4;
      var x = pad + (W - 2 * pad) * i / 4;
      ctx.fillText(v.toFixed(1), x, H - pad + 16);
    }
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var v = yR[0] + (yR[1] - yR[0]) * i / 4;
      var y = H - pad - (H - 2 * pad) * i / 4;
      ctx.fillText(v.toFixed(1), pad - 8, y + 4);
    }

    // Draw piecewise prediction (step function)
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    var steps = 500;
    for (var i = 0; i <= steps; i++) {
      var xVal = xR[0] + (xR[1] - xR[0]) * i / steps;
      var yVal = DT.predictRegression(tree, { x: xVal });
      var cp = DT.toCanvas(xVal, yVal, W, H, pad, xR, yR);
      if (i === 0) ctx.moveTo(cp.x, cp.y); else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();

    // Draw true function (faded)
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (var i = 0; i <= steps; i++) {
      var xVal = xR[0] + (xR[1] - xR[0]) * i / steps;
      var yVal = Math.sin(xVal) + 0.5 * Math.sin(2.5 * xVal);
      var cp = DT.toCanvas(xVal, yVal, W, H, pad, xR, yR);
      if (i === 0) ctx.moveTo(cp.x, cp.y); else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw data points
    for (var i = 0; i < pts.length; i++) {
      var cp = DT.toCanvas(pts[i].x, pts[i].y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = c.class1;
      ctx.fill();
      ctx.strokeStyle = c.bg;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Legend
    var lx = pad + 10, ly = pad + 15;
    ctx.fillStyle = c.accent;
    ctx.fillRect(lx, ly - 2, 16, 3);
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.text;
    ctx.fillText('Tree prediction', lx + 22, ly + 3);
    ly += 18;
    ctx.strokeStyle = c.textMuted;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(lx, ly - 1);
    ctx.lineTo(lx + 16, ly - 1);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.textMuted;
    ctx.fillText('True function', lx + 22, ly + 3);

    // MSE
    var mse = 0;
    for (var i = 0; i < pts.length; i++) {
      var pred = DT.predictRegression(tree, pts[i]);
      var d = pred - pts[i].y;
      mse += d * d;
    }
    mse /= pts.length;
    info.textContent = 'Max Depth: ' + maxD + '  |  MSE: ' + mse.toFixed(4);
  }

  sliderDepth.addEventListener('input', draw);
  btnRegen.addEventListener('click', function() { genData(); draw(); });
  DT.observeTheme(draw);
  genData();
  draw();
})();
</script>

At **depth 1**, the tree makes only one split, a crude two-step approximation. At **depth 10**, it traces every wiggle in the data including noise. The dashed line shows the true underlying function. Notice how the step function converges toward it as depth increases, but eventually starts fitting noise.

---

## Information Gain Walkthrough

**Information gain** is the difference between the parent impurity and the weighted sum of child impurities. The tree always picks the split with the highest information gain.

$$\text{IG}(S, A) = \text{Impurity}(S) - \sum_{v \in \text{values}(A)} \frac{|S_v|}{|S|} \cdot \text{Impurity}(S_v)$$

The demo below shows the information gain for **every possible split** on a small dataset. Each bar represents a candidate threshold. The tallest bar is the one the tree picks.

<div class="interactive-demo" id="demo-ig">
  <canvas id="canvas-ig"></canvas>
  <div class="demo-controls">
    <label>Criterion:
      <select id="sel-ig-criterion" style="padding:0.3rem 0.5rem;border:1px solid var(--border);border-radius:4px;background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
        <option value="gini">Gini</option>
        <option value="entropy">Entropy</option>
      </select>
    </label>
    <button id="btn-ig-regen">New Data</button>
  </div>
  <div class="demo-info" id="info-ig">Each bar shows the information gain for one candidate split</div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var canvas = document.getElementById('canvas-ig');
  var ctx = DT.setupCanvas(canvas, W, H);
  var selCrit = document.getElementById('sel-ig-criterion');
  var btnRegen = document.getElementById('btn-ig-regen');
  var info = document.getElementById('info-ig');

  var pts, pad = 50, topH = 160, botH = 180;

  function genData() {
    pts = [];
    for (var i = 0; i < 20; i++) {
      var x = Math.random() * 4 - 2;
      var label = (x + (Math.random() - 0.5) * 1.5) > 0 ? 1 : 0;
      pts.push({ x: x, label: label });
    }
    pts.sort(function(a, b) { return a.x - b.x; });
  }

  function draw() {
    var c = DT.getColors();
    var criterion = selCrit.value;
    var impFn = criterion === 'entropy' ? DT.entropy : DT.gini;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Data range
    var xMin = -2.5, xMax = 2.5;

    // Top half: data points on a line
    var dataY = 60;
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, dataY);
    ctx.lineTo(W - pad, dataY);
    ctx.stroke();

    // Axis ticks
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = c.textMuted;
    ctx.textAlign = 'center';
    for (var i = 0; i <= 5; i++) {
      var v = xMin + (xMax - xMin) * i / 5;
      var px = pad + (v - xMin) / (xMax - xMin) * (W - 2 * pad);
      ctx.fillText(v.toFixed(1), px, dataY + 18);
      ctx.beginPath();
      ctx.moveTo(px, dataY - 3);
      ctx.lineTo(px, dataY + 3);
      ctx.stroke();
    }

    // Draw data points
    for (var i = 0; i < pts.length; i++) {
      var px = pad + (pts[i].x - xMin) / (xMax - xMin) * (W - 2 * pad);
      ctx.beginPath();
      ctx.arc(px, dataY, 6, 0, Math.PI * 2);
      ctx.fillStyle = pts[i].label === 0 ? c.class0 : c.class1;
      ctx.fill();
      ctx.strokeStyle = c.bg;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = c.text;
    ctx.textAlign = 'left';
    ctx.fillText('Feature X', pad, 28);

    // Compute all possible splits and their info gain
    var parentCounts = [0, 0];
    for (var i = 0; i < pts.length; i++) parentCounts[pts[i].label]++;
    var parentImp = impFn(parentCounts, pts.length);

    var splits = [];
    for (var i = 0; i < pts.length - 1; i++) {
      if (pts[i].x === pts[i + 1].x) continue;
      var thresh = (pts[i].x + pts[i + 1].x) / 2;
      var lc = [0, 0], rc = [0, 0], nL = 0, nR = 0;
      for (var j = 0; j < pts.length; j++) {
        if (pts[j].x <= thresh) { lc[pts[j].label]++; nL++; }
        else { rc[pts[j].label]++; nR++; }
      }
      var childImp = (nL * impFn(lc, nL) + nR * impFn(rc, nR)) / pts.length;
      var gain = parentImp - childImp;
      splits.push({ thresh: thresh, gain: gain, lc: lc, rc: rc, nL: nL, nR: nR,
        leftImp: impFn(lc, nL), rightImp: impFn(rc, nR) });
    }

    // Find best
    var bestIdx = 0;
    for (var i = 1; i < splits.length; i++) {
      if (splits[i].gain > splits[bestIdx].gain) bestIdx = i;
    }

    // Bottom half: bar chart of information gain
    var barAreaTop = 120, barAreaBot = H - 30;
    var barAreaH = barAreaBot - barAreaTop;

    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = c.text;
    ctx.textAlign = 'left';
    ctx.fillText('Information Gain per candidate split', pad, barAreaTop - 8);

    // Y axis for bars
    var maxGain = 0;
    for (var i = 0; i < splits.length; i++) {
      if (splits[i].gain > maxGain) maxGain = splits[i].gain;
    }
    if (maxGain < 0.01) maxGain = 0.01;

    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, barAreaTop);
    ctx.lineTo(pad, barAreaBot);
    ctx.lineTo(W - pad, barAreaBot);
    ctx.stroke();

    // Y axis ticks
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var v = maxGain * i / 4;
      var y = barAreaBot - (v / maxGain) * (barAreaH - 20);
      ctx.fillStyle = c.textMuted;
      ctx.fillText(v.toFixed(3), pad - 6, y + 3);
      ctx.strokeStyle = c.grid;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(W - pad, y);
      ctx.stroke();
    }

    // Draw bars
    if (splits.length > 0) {
      var barW = Math.min(30, (W - 2 * pad - 20) / splits.length);
      var gap = ((W - 2 * pad - 20) - barW * splits.length) / (splits.length + 1);

      for (var i = 0; i < splits.length; i++) {
        var bx = pad + 10 + gap + i * (barW + gap);
        var bh = (splits[i].gain / maxGain) * (barAreaH - 20);
        var by = barAreaBot - bh;

        var isBest = i === bestIdx;
        ctx.fillStyle = isBest ? c.split : c.accent;
        ctx.globalAlpha = isBest ? 1 : 0.5;
        ctx.fillRect(bx, by, barW, bh);
        ctx.globalAlpha = 1;

        if (isBest) {
          ctx.strokeStyle = c.split;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, by, barW, bh);
        }

        // Threshold label
        ctx.save();
        ctx.translate(bx + barW / 2, barAreaBot + 12);
        ctx.rotate(-Math.PI / 4);
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = isBest ? c.split : c.textMuted;
        ctx.textAlign = 'right';
        ctx.fillText(splits[i].thresh.toFixed(2), 0, 0);
        ctx.restore();

        // Draw corresponding split line on data
        if (isBest) {
          var sx = pad + (splits[i].thresh - xMin) / (xMax - xMin) * (W - 2 * pad);
          ctx.strokeStyle = c.split;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]);
          ctx.beginPath();
          ctx.moveTo(sx, dataY - 20);
          ctx.lineTo(sx, dataY + 12);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillStyle = c.split;
          ctx.textAlign = 'center';
          ctx.fillText('best', sx, dataY - 24);
        }
      }
    }

    // Parent impurity label
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = c.text;
    ctx.textAlign = 'right';
    ctx.fillText('Parent ' + criterion + ': ' + parentImp.toFixed(3), W - pad, 28);

    if (splits.length > 0) {
      var best = splits[bestIdx];
      info.textContent = 'Best split: x<=' + best.thresh.toFixed(2) +
        '  |  IG=' + best.gain.toFixed(4) +
        '  |  Left(' + best.nL + '): ' + best.leftImp.toFixed(3) +
        '  Right(' + best.nR + '): ' + best.rightImp.toFixed(3);
    }
  }

  selCrit.addEventListener('change', draw);
  btnRegen.addEventListener('click', function() { genData(); draw(); });
  DT.observeTheme(draw);
  genData();
  draw();
})();
</script>

The highlighted bar (golden) is the **best split**, the one the tree selects at the root. Notice how the information gain is highest where the split most cleanly separates the blue and red points. Thresholds at the extreme ends have very low gain because they put almost all points on one side.

---

## Summary

| Concept | Details |
|---|---|
| **Algorithm** | Recursively split data on the feature/threshold that maximizes information gain |
| **Classification Criterion** | Gini impurity: $$1 - \sum p_k^2$$ or Entropy: $$-\sum p_k \log_2 p_k$$ |
| **Regression Criterion** | Variance reduction (minimize MSE within leaves) |
| **Prediction** | Follow root-to-leaf path; output majority class (classification) or mean value (regression) |
| **Decision Boundaries** | Axis-aligned rectangles (cannot split diagonally) |
| **Time Complexity** | $$O(n \cdot m \cdot d)$$ where $$n$$ = samples, $$m$$ = features, $$d$$ = depth |
| **Overfitting Control** | max_depth, min_samples_split, min_samples_leaf, cost-complexity pruning |

### Key Takeaways

1. Decision trees are the most **interpretable** ML model, every prediction has a human-readable explanation.
2. Gini and Entropy produce nearly identical trees; Gini is faster (no logarithm) and is the default in scikit-learn.
3. An unpruned tree will **memorize** the training data. Always control complexity via depth limits or pruning.
4. Regression trees produce **piecewise-constant** predictions, step functions that approximate the target.
5. Decision boundaries are always **axis-aligned rectangles**, which is both a strength (simplicity) and a limitation (poor on diagonal boundaries).

### What's Next

In the next chapter, we will explore **Random Forests and Ensemble Methods**, where we combine many decision trees to create a model that is far more powerful and resistant to overfitting than any single tree. The key idea: a committee of weak learners, each trained on random subsets of data and features, can outperform any individual member.
