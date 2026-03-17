---
layout: post
title: "Boosting: AdaBoost & Gradient Boosting - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Watch AdaBoost reweight misclassified samples, see gradient boosting fit residuals step-by-step, and compare boosting vs bagging - all interactively in your browser."
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
.boost-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.9rem;
}
.boost-table th, .boost-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}
.boost-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
.boost-table td {
  background: var(--bg-primary);
}
</style>

<script>
window.BST = (function() {
  var B = {};

  B.getColors = function() {
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
      class1: isDark ? '#f7768e' : '#e63946',
      class1Light: isDark ? 'rgba(247,118,142,0.15)' : 'rgba(230,57,70,0.12)',
      green: isDark ? '#9ece6a' : '#16a34a',
      orange: isDark ? '#e0af68' : '#d97706',
      purple: isDark ? '#bb9af7' : '#7c3aed',
      teal: isDark ? '#2ac3de' : '#0891b2',
      isDark: isDark
    };
  };

  B.setupCanvas = function(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  B.observeTheme = function(cb) {
    var obs = new MutationObserver(function() { cb(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb);
  };

  B.randGauss = function() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  // Generate 2D classification data with some overlap
  B.genData = function(n, noise) {
    noise = noise || 0.3;
    var pts = [];
    for (var i = 0; i < n; i++) {
      var x = Math.random() * 6 - 3;
      var y = Math.random() * 6 - 3;
      var boundary = 0.6 * Math.sin(1.5 * x) + 0.3 * x;
      var label = (y > boundary + (Math.random() - 0.5) * noise) ? 1 : -1;
      pts.push({ x: x, y: y, label: label });
    }
    return pts;
  };

  // Generate moons dataset
  B.genMoons = function(n, noise) {
    noise = noise || 0.25;
    var pts = [];
    var half = Math.floor(n / 2);
    for (var i = 0; i < half; i++) {
      var t = Math.PI * i / half;
      pts.push({
        x: Math.cos(t) + B.randGauss() * noise,
        y: Math.sin(t) + B.randGauss() * noise,
        label: -1
      });
    }
    for (var i = 0; i < n - half; i++) {
      var t = Math.PI * i / (n - half);
      pts.push({
        x: 1 - Math.cos(t) + B.randGauss() * noise,
        y: 0.5 - Math.sin(t) + B.randGauss() * noise,
        label: 1
      });
    }
    return pts;
  };

  // Generate regression data: a noisy function
  B.genRegression = function(n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var x = -3 + 6 * i / (n - 1);
      var y = Math.sin(1.5 * x) + 0.5 * Math.cos(0.8 * x) + B.randGauss() * 0.25;
      pts.push({ x: x, y: y });
    }
    return pts;
  };

  // Decision stump: best axis-aligned split
  B.trainStump = function(pts, weights) {
    var n = pts.length;
    var bestErr = Infinity, bestFeat = 'x', bestThresh = 0, bestPol = 1;
    var features = ['x', 'y'];
    for (var fi = 0; fi < features.length; fi++) {
      var feat = features[fi];
      var vals = [];
      for (var i = 0; i < n; i++) vals.push(pts[i][feat]);
      vals.sort(function(a, b) { return a - b; });
      var thresholds = [];
      for (var i = 0; i < vals.length - 1; i++) {
        thresholds.push((vals[i] + vals[i + 1]) / 2);
      }
      for (var ti = 0; ti < thresholds.length; ti++) {
        var thresh = thresholds[ti];
        for (var pol = -1; pol <= 1; pol += 2) {
          var err = 0;
          for (var i = 0; i < n; i++) {
            var pred = (pts[i][feat] <= thresh) ? pol : -pol;
            if (pred !== pts[i].label) err += weights[i];
          }
          if (err < bestErr) {
            bestErr = err;
            bestFeat = feat;
            bestThresh = thresh;
            bestPol = pol;
          }
        }
      }
    }
    return { feature: bestFeat, threshold: bestThresh, polarity: bestPol, error: bestErr };
  };

  // Predict with a stump
  B.stumpPredict = function(stump, x, y) {
    var val = (stump.feature === 'x') ? x : y;
    return (val <= stump.threshold) ? stump.polarity : -stump.polarity;
  };

  // Decision stump for regression (minimizes weighted MSE)
  B.trainRegressionStump = function(xs, residuals, depth) {
    depth = depth || 1;
    return B._buildRegTree(xs, residuals, depth, 0);
  };

  B._buildRegTree = function(xs, ys, maxDepth, curDepth) {
    var n = xs.length;
    if (n <= 1 || curDepth >= maxDepth) {
      var sum = 0;
      for (var i = 0; i < n; i++) sum += ys[i];
      return { leaf: true, value: n > 0 ? sum / n : 0 };
    }
    var bestMSE = Infinity, bestThresh = 0;
    var sorted = [];
    for (var i = 0; i < n; i++) sorted.push({ x: xs[i], y: ys[i] });
    sorted.sort(function(a, b) { return a.x - b.x; });
    for (var i = 0; i < n - 1; i++) {
      var thresh = (sorted[i].x + sorted[i + 1].x) / 2;
      var lSum = 0, lCnt = 0, rSum = 0, rCnt = 0;
      for (var j = 0; j <= i; j++) { lSum += sorted[j].y; lCnt++; }
      for (var j = i + 1; j < n; j++) { rSum += sorted[j].y; rCnt++; }
      var lMean = lSum / lCnt, rMean = rSum / rCnt;
      var mse = 0;
      for (var j = 0; j <= i; j++) mse += (sorted[j].y - lMean) * (sorted[j].y - lMean);
      for (var j = i + 1; j < n; j++) mse += (sorted[j].y - rMean) * (sorted[j].y - rMean);
      if (mse < bestMSE) { bestMSE = mse; bestThresh = thresh; }
    }
    var lXs = [], lYs = [], rXs = [], rYs = [];
    for (var i = 0; i < n; i++) {
      if (xs[i] <= bestThresh) { lXs.push(xs[i]); lYs.push(ys[i]); }
      else { rXs.push(xs[i]); rYs.push(ys[i]); }
    }
    return {
      leaf: false,
      threshold: bestThresh,
      left: B._buildRegTree(lXs, lYs, maxDepth, curDepth + 1),
      right: B._buildRegTree(rXs, rYs, maxDepth, curDepth + 1)
    };
  };

  B.regTreePredict = function(tree, x) {
    if (tree.leaf) return tree.value;
    return x <= tree.threshold ? B.regTreePredict(tree.left, x) : B.regTreePredict(tree.right, x);
  };

  // AdaBoost training: returns array of { stump, alpha } for each round
  B.adaboost = function(pts, rounds) {
    var n = pts.length;
    var weights = [];
    for (var i = 0; i < n; i++) weights.push(1 / n);
    var stumps = [];
    var history = []; // weight snapshots per round
    history.push(weights.slice());
    for (var r = 0; r < rounds; r++) {
      var stump = B.trainStump(pts, weights);
      var err = Math.max(stump.error, 1e-10);
      if (err >= 0.5) break;
      var alpha = 0.5 * Math.log((1 - err) / err);
      var newWeights = [];
      var wSum = 0;
      for (var i = 0; i < n; i++) {
        var pred = B.stumpPredict(stump, pts[i].x, pts[i].y);
        var w = weights[i] * Math.exp(-alpha * pts[i].label * pred);
        newWeights.push(w);
        wSum += w;
      }
      for (var i = 0; i < n; i++) newWeights[i] /= wSum;
      weights = newWeights;
      stumps.push({ stump: stump, alpha: alpha });
      history.push(weights.slice());
    }
    return { stumps: stumps, weightHistory: history };
  };

  // AdaBoost ensemble prediction
  B.adaPredict = function(stumps, x, y, upToRound) {
    var limit = (upToRound !== undefined) ? upToRound : stumps.length;
    var score = 0;
    for (var r = 0; r < limit; r++) {
      score += stumps[r].alpha * B.stumpPredict(stumps[r].stump, x, y);
    }
    return score;
  };

  // Gradient Boosting for regression
  B.gradientBoosting = function(pts, rounds, lr, treeDepth) {
    lr = lr || 0.3;
    treeDepth = treeDepth || 2;
    var n = pts.length;
    var xs = [], ys = [];
    for (var i = 0; i < n; i++) { xs.push(pts[i].x); ys.push(pts[i].y); }
    // Initial prediction: mean
    var sum = 0;
    for (var i = 0; i < n; i++) sum += ys[i];
    var initPred = sum / n;
    var preds = [];
    for (var i = 0; i < n; i++) preds.push(initPred);
    var trees = [];
    var predHistory = [preds.slice()];
    for (var r = 0; r < rounds; r++) {
      var residuals = [];
      for (var i = 0; i < n; i++) residuals.push(ys[i] - preds[i]);
      var tree = B.trainRegressionStump(xs, residuals, treeDepth);
      trees.push(tree);
      for (var i = 0; i < n; i++) {
        preds[i] += lr * B.regTreePredict(tree, xs[i]);
      }
      predHistory.push(preds.slice());
    }
    return { initPred: initPred, trees: trees, lr: lr, predHistory: predHistory };
  };

  // Gradient boosting prediction at a point
  B.gbPredict = function(model, x, upToRound) {
    var limit = (upToRound !== undefined) ? upToRound : model.trees.length;
    var pred = model.initPred;
    for (var r = 0; r < limit; r++) {
      pred += model.lr * B.regTreePredict(model.trees[r], x);
    }
    return pred;
  };

  // Draw axes for 2D classification plots
  B.drawAxes = function(ctx, W, H, c, xRange, yRange) {
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
      var val = xRange[0] + (xRange[1] - xRange[0]) * i / 4;
      var x = pad + (W - 2 * pad) * i / 4;
      ctx.fillText(val.toFixed(1), x, H - pad + 15);
    }
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var val = yRange[0] + (yRange[1] - yRange[0]) * i / 4;
      var y = H - pad - (H - 2 * pad) * i / 4;
      ctx.fillText(val.toFixed(1), pad - 8, y + 4);
    }
    return pad;
  };

  B.toCanvas = function(px, py, W, H, pad, xR, yR) {
    return {
      x: pad + (px - xR[0]) / (xR[1] - xR[0]) * (W - 2 * pad),
      y: H - pad - (py - yR[0]) / (yR[1] - yR[0]) * (H - 2 * pad)
    };
  };

  B.fromCanvas = function(cx, cy, W, H, pad, xR, yR) {
    return {
      x: xR[0] + (cx - pad) / (W - 2 * pad) * (xR[1] - xR[0]),
      y: yR[0] + (H - pad - cy) / (H - 2 * pad) * (yR[1] - yR[0])
    };
  };

  return B;
})();
</script>

In the [previous chapter on SVMs]({% post_url 2026-03-16-svm-interactive %}), we learned to find a single powerful decision boundary. But what if, instead of building one strong model, we built many **weak models** and combined them strategically?

This is the core insight behind **boosting**: a family of ensemble methods that turn weak learners into a strong learner by training them **sequentially**, where each new learner focuses on correcting the mistakes of its predecessors.

Boosting has produced some of the most successful machine learning algorithms in practice. XGBoost, LightGBM, and CatBoost -- all based on gradient boosting -- dominate Kaggle competitions and power production systems at scale. Let us build this family of algorithms from scratch.

---

## 1. Weak Learners: The Decision Stump

A **weak learner** is a model that is only slightly better than random guessing. The simplest example is a **decision stump**: a one-level decision tree that splits on a single feature with a single threshold.

A stump says: "if feature $$x_j \leq \theta$$, predict +1; otherwise predict -1" (or vice versa). It draws a single axis-aligned line through the data. Alone, it is almost useless. But combined...

### Try It: A Single Decision Stump

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>New Stump</strong> to train a single decision stump on the data. Notice how it gets many points wrong -- it can only draw one horizontal or vertical line. The accuracy is barely above 50%. But each stump captures <em>some</em> signal.
</div>

<div class="interactive-demo">
  <canvas id="stump-canvas"></canvas>
  <div class="demo-controls">
    <button id="stump-new">New Stump</button>
    <button id="stump-data">New Data</button>
    <span class="demo-value" id="stump-info">Click New Stump</span>
  </div>
</div>

<script>
(function() {
  var canvas = document.getElementById('stump-canvas');
  var newBtn = document.getElementById('stump-new');
  var dataBtn = document.getElementById('stump-data');
  var infoEl = document.getElementById('stump-info');

  var W = 680, H = 420;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];
  var stump = null;

  function init() {
    pts = BST.genMoons(60, 0.3);
    stump = null;
    infoEl.textContent = 'Click New Stump';
    draw();
  }

  function draw() {
    var ctx = BST.setupCanvas(canvas, W, H);
    var c = BST.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    BST.drawAxes(ctx, W, H, c, xR, yR);

    // Draw decision region if stump exists
    if (stump) {
      var imgW = W - 2 * pad, imgH = H - 2 * pad;
      var c0col = c.isDark ? [122, 162, 247] : [37, 99, 235];
      var c1col = c.isDark ? [247, 118, 142] : [230, 57, 70];
      for (var py = 0; py < imgH; py += 3) {
        for (var px = 0; px < imgW; px += 3) {
          var coord = BST.fromCanvas(pad + px, pad + py, W, H, pad, xR, yR);
          var pred = BST.stumpPredict(stump, coord.x, coord.y);
          ctx.fillStyle = pred === 1 ? c.class1Light : c.class0Light;
          ctx.fillRect(pad + px, pad + py, 3, 3);
        }
      }
      // Draw split line
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      if (stump.feature === 'x') {
        var cx = BST.toCanvas(stump.threshold, 0, W, H, pad, xR, yR).x;
        ctx.moveTo(cx, pad); ctx.lineTo(cx, H - pad);
      } else {
        var cy = BST.toCanvas(0, stump.threshold, W, H, pad, xR, yR).y;
        ctx.moveTo(pad, cy); ctx.lineTo(W - pad, cy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw points
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var cp = BST.toCanvas(p.x, p.y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? c.class1 : c.class0;
      ctx.fill();
      // Mark misclassified if stump exists
      if (stump) {
        var pred = BST.stumpPredict(stump, p.x, p.y);
        if (pred !== p.label) {
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, 9, 0, Math.PI * 2);
          ctx.strokeStyle = c.orange;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
  }

  newBtn.addEventListener('click', function() {
    var w = [];
    for (var i = 0; i < pts.length; i++) w.push(1 / pts.length);
    stump = BST.trainStump(pts, w);
    var correct = 0;
    for (var i = 0; i < pts.length; i++) {
      if (BST.stumpPredict(stump, pts[i].x, pts[i].y) === pts[i].label) correct++;
    }
    var acc = (100 * correct / pts.length).toFixed(1);
    infoEl.textContent = 'Split: ' + stump.feature + ' <= ' + stump.threshold.toFixed(2) +
      ' | Accuracy: ' + acc + '% | Misclassified: ' + (pts.length - correct);
    draw();
  });

  dataBtn.addEventListener('click', function() { init(); });

  BST.observeTheme(draw);
  init();
})();
</script>

As you can see, a single stump gets many points wrong. It can only draw one straight cut through the feature space. But here is the key idea: **what if we could focus the next stump on the mistakes the previous one made?**

---

## 2. AdaBoost Step-by-Step

**AdaBoost** (Adaptive Boosting) works by maintaining a weight distribution over the training samples. Initially all samples have equal weight. After each round:

1. Train a weak learner (stump) on the weighted data
2. Compute its weighted error: $$\epsilon_t = \sum_{i: h_t(x_i) \neq y_i} w_i$$
3. Compute the learner's vote strength: $$\alpha_t = \frac{1}{2}\ln\frac{1 - \epsilon_t}{\epsilon_t}$$
4. Update weights: $$w_i \leftarrow w_i \cdot \exp(-\alpha_t \cdot y_i \cdot h_t(x_i))$$
5. Normalize weights to sum to 1

The final prediction combines all stumps: $$H(x) = \text{sign}\left(\sum_{t=1}^{T} \alpha_t \cdot h_t(x)\right)$$

Points that are **misclassified** get larger weights (they grow bigger in the visualization below), so the next stump concentrates on getting those hard cases right.

### Try It: Watch AdaBoost Build an Ensemble

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>Step</strong> to add one stump at a time, or <strong>Play</strong> to animate. Point sizes are proportional to their sample weights -- notice how misclassified points grow larger each round, forcing the next stump to focus on them. The decision boundary on the right shows the combined ensemble.
</div>

<div class="interactive-demo" id="demo-adaboost">
  <div class="demo-split">
    <div>
      <canvas id="ada-weights-canvas"></canvas>
      <div class="demo-caption">Weighted samples (round <span id="ada-round">0</span>/<span id="ada-total">10</span>)</div>
    </div>
    <div>
      <canvas id="ada-boundary-canvas"></canvas>
      <div class="demo-caption">Combined ensemble boundary</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="ada-play">Play</button>
    <button id="ada-step">Step</button>
    <button id="ada-reset">Reset</button>
    <label>Rounds: <input type="range" id="ada-rounds-slider" min="3" max="20" value="10"><span class="demo-value" id="ada-rounds-val">10</span></label>
  </div>
  <div class="demo-info" id="ada-info">Click Step or Play to begin</div>
</div>

<script>
(function() {
  var wCanvas = document.getElementById('ada-weights-canvas');
  var bCanvas = document.getElementById('ada-boundary-canvas');
  var playBtn = document.getElementById('ada-play');
  var stepBtn = document.getElementById('ada-step');
  var resetBtn = document.getElementById('ada-reset');
  var roundsSlider = document.getElementById('ada-rounds-slider');
  var roundsVal = document.getElementById('ada-rounds-val');
  var roundEl = document.getElementById('ada-round');
  var totalEl = document.getElementById('ada-total');
  var infoEl = document.getElementById('ada-info');

  var W = 340, H = 340;
  var xR = [-3, 3], yR = [-3, 3];
  var pad = 35;
  var pts, model, curRound, maxRounds, playing, animId;

  function init() {
    maxRounds = parseInt(roundsSlider.value);
    roundsVal.textContent = maxRounds;
    totalEl.textContent = maxRounds;
    pts = BST.genMoons(50, 0.25);
    model = BST.adaboost(pts, maxRounds);
    curRound = 0;
    playing = false;
    playBtn.textContent = 'Play';
    roundEl.textContent = '0';
    infoEl.textContent = 'Click Step or Play to begin';
    if (animId) cancelAnimationFrame(animId);
    draw();
  }

  function drawWeights() {
    var ctx = BST.setupCanvas(wCanvas, W, H);
    var c = BST.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Simplified axes
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);

    // Get current weights
    var weights = model.weightHistory[curRound];
    var maxW = 0;
    for (var i = 0; i < weights.length; i++) {
      if (weights[i] > maxW) maxW = weights[i];
    }

    // Current stump split line
    if (curRound > 0) {
      var s = model.stumps[curRound - 1].stump;
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      if (s.feature === 'x') {
        var cx = BST.toCanvas(s.threshold, 0, W, H, pad, xR, yR).x;
        ctx.moveTo(cx, pad); ctx.lineTo(cx, H - pad);
      } else {
        var cy = BST.toCanvas(0, s.threshold, W, H, pad, xR, yR).y;
        ctx.moveTo(pad, cy); ctx.lineTo(W - pad, cy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw points with size proportional to weight
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var cp = BST.toCanvas(p.x, p.y, W, H, pad, xR, yR);
      var r = 3 + 18 * (weights[i] / maxW);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, r, 0, Math.PI * 2);
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = p.label === 1 ? c.class1 : c.class0;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, Math.min(r, 6), 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? c.class1 : c.class0;
      ctx.fill();
    }
  }

  function drawBoundary() {
    var ctx = BST.setupCanvas(bCanvas, W, H);
    var c = BST.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);

    if (curRound > 0) {
      // Draw decision regions
      var imgW = W - 2 * pad, imgH = H - 2 * pad;
      var step = 3;
      var c0col = c.isDark ? [122, 162, 247] : [37, 99, 235];
      var c1col = c.isDark ? [247, 118, 142] : [230, 57, 70];
      for (var py = 0; py < imgH; py += step) {
        for (var px = 0; px < imgW; px += step) {
          var coord = BST.fromCanvas(pad + px, pad + py, W, H, pad, xR, yR);
          var score = BST.adaPredict(model.stumps, coord.x, coord.y, curRound);
          var col = score > 0 ? c1col : c0col;
          var alpha = Math.min(0.4, Math.abs(score) * 0.15);
          ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + alpha + ')';
          ctx.fillRect(pad + px, pad + py, step, step);
        }
      }
    }

    // Draw points
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var cp = BST.toCanvas(p.x, p.y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? c.class1 : c.class0;
      ctx.fill();
    }

    // Accuracy
    if (curRound > 0) {
      var correct = 0;
      for (var i = 0; i < pts.length; i++) {
        var pred = BST.adaPredict(model.stumps, pts[i].x, pts[i].y, curRound) > 0 ? 1 : -1;
        if (pred === pts[i].label) correct++;
      }
      ctx.fillStyle = c.text;
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('Accuracy: ' + (100 * correct / pts.length).toFixed(1) + '%', W - pad - 5, pad + 16);
    }
  }

  function draw() {
    drawWeights();
    drawBoundary();
  }

  function step() {
    if (curRound >= model.stumps.length) {
      playing = false;
      playBtn.textContent = 'Play';
      infoEl.textContent = 'Done! ' + model.stumps.length + ' stumps combined.';
      return false;
    }
    curRound++;
    roundEl.textContent = curRound;
    var s = model.stumps[curRound - 1];
    infoEl.textContent = 'Round ' + curRound + ': split ' + s.stump.feature +
      ' <= ' + s.stump.threshold.toFixed(2) +
      ' | alpha = ' + s.alpha.toFixed(3) +
      ' | error = ' + s.stump.error.toFixed(3);
    draw();
    return true;
  }

  function playLoop() {
    if (!playing) return;
    if (!step()) return;
    animId = setTimeout(playLoop, 700);
  }

  playBtn.addEventListener('click', function() {
    if (playing) {
      playing = false;
      playBtn.textContent = 'Play';
    } else {
      playing = true;
      playBtn.textContent = 'Pause';
      playLoop();
    }
  });

  stepBtn.addEventListener('click', function() {
    playing = false;
    playBtn.textContent = 'Play';
    step();
  });

  resetBtn.addEventListener('click', function() { init(); });
  roundsSlider.addEventListener('input', function() {
    roundsVal.textContent = roundsSlider.value;
    totalEl.textContent = roundsSlider.value;
  });
  roundsSlider.addEventListener('change', function() { init(); });

  BST.observeTheme(draw);
  init();
})();
</script>

Notice how after just a few rounds, the combined boundary becomes highly non-linear even though each individual stump can only draw a single axis-aligned line. This is the power of boosting: **combining many weak learners creates a strong learner**.

---

## 3. AdaBoost Weight Evolution

Let us look at the sample weights more closely. Below, each bar represents one sample's weight across AdaBoost rounds. Points that are consistently hard to classify accumulate large weights, while easy points shrink toward zero.

<div class="demo-hint">
<strong>Interactive:</strong> Drag the <strong>Round</strong> slider to see how sample weights evolve. Red bars are Class +1 samples, blue bars are Class -1. The tallest bars are the points the ensemble finds hardest to classify.
</div>

<div class="interactive-demo">
  <canvas id="weight-evo-canvas"></canvas>
  <div class="demo-controls">
    <label>Round: <input type="range" id="weight-round-slider" min="0" max="10" value="0"><span class="demo-value" id="weight-round-val">0</span></label>
    <button id="weight-reset">New Data</button>
  </div>
  <div class="demo-info" id="weight-evo-info">Round 0: uniform weights</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('weight-evo-canvas');
  var slider = document.getElementById('weight-round-slider');
  var valEl = document.getElementById('weight-round-val');
  var infoEl = document.getElementById('weight-evo-info');
  var resetBtn = document.getElementById('weight-reset');

  var W = 680, H = 320;
  var pts, model;

  function init() {
    pts = BST.genMoons(40, 0.25);
    model = BST.adaboost(pts, 15);
    slider.max = model.weightHistory.length - 1;
    slider.value = 0;
    valEl.textContent = '0';
    draw();
  }

  function draw() {
    var round = parseInt(slider.value);
    valEl.textContent = round;
    var ctx = BST.setupCanvas(canvas, W, H);
    var c = BST.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var weights = model.weightHistory[round];
    var n = weights.length;
    var maxW = 0;
    for (var i = 0; i < n; i++) { if (weights[i] > maxW) maxW = weights[i]; }
    if (maxW === 0) maxW = 1;

    var barPad = 40;
    var barW = (W - 2 * barPad) / n - 1;
    var barMaxH = H - 80;

    // Axis
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(barPad, H - barPad);
    ctx.lineTo(W - barPad, H - barPad);
    ctx.stroke();

    // Uniform line
    var uniformH = barMaxH / (maxW * n);
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    var uniformY = H - barPad - barMaxH * (1 / n) / maxW;
    ctx.beginPath();
    ctx.moveTo(barPad, uniformY);
    ctx.lineTo(W - barPad, uniformY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.textMuted;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('1/N', W - barPad + 4, uniformY + 4);

    // Bars
    for (var i = 0; i < n; i++) {
      var bh = barMaxH * weights[i] / maxW;
      var bx = barPad + i * ((W - 2 * barPad) / n);
      var by = H - barPad - bh;
      ctx.fillStyle = pts[i].label === 1 ? c.class1 : c.class0;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(bx, by, Math.max(barW, 2), bh);
      ctx.globalAlpha = 1;
    }

    // Label
    ctx.fillStyle = c.text;
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Sample Index', W / 2, H - 8);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Weight', 0, 0);
    ctx.restore();

    if (round === 0) {
      infoEl.textContent = 'Round 0: uniform weights (1/N = ' + (1 / n).toFixed(4) + ')';
    } else {
      var s = model.stumps[round - 1];
      infoEl.textContent = 'Round ' + round + ': alpha=' + s.alpha.toFixed(3) +
        ' | Max weight: ' + maxW.toFixed(4) + ' (' + (maxW * n).toFixed(1) + 'x uniform)';
    }
  }

  slider.addEventListener('input', draw);
  resetBtn.addEventListener('click', init);
  BST.observeTheme(draw);
  init();
})();
</script>

After several rounds, you can see that a few "hard" samples have weights many times larger than the uniform weight $$1/N$$. These are typically points near the decision boundary or noise points. AdaBoost ensures every subsequent stump pays special attention to these difficult cases.

---

## 4. Gradient Boosting: Fitting Residuals

While AdaBoost reweights samples, **Gradient Boosting** takes a different approach: each new learner fits the **residuals** (errors) of the current ensemble.

For regression with squared loss:
1. Start with a constant prediction: $$F_0(x) = \bar{y}$$ (the mean)
2. Compute residuals: $$r_i = y_i - F_{t-1}(x_i)$$
3. Fit a new tree $$h_t$$ to the residuals
4. Update: $$F_t(x) = F_{t-1}(x) + \eta \cdot h_t(x)$$

where $$\eta$$ is the learning rate.

The residuals are actually the **negative gradient** of the loss function:

$$r_i = -\frac{\partial L(y_i, F(x_i))}{\partial F(x_i)} = y_i - F(x_i)$$

This is why it is called **gradient** boosting -- we are doing gradient descent in function space.

### Try It: Watch Residuals Shrink

<div class="demo-hint">
<strong>Interactive:</strong> The top plot shows the true function (green), the data points, and the current ensemble prediction (blue). The bottom plot shows the residuals that the next tree will fit. Click <strong>Step</strong> to add one tree at a time and watch the prediction converge to the true function while residuals shrink toward zero.
</div>

<div class="interactive-demo">
  <canvas id="gb-fit-canvas"></canvas>
  <canvas id="gb-resid-canvas"></canvas>
  <div class="demo-controls">
    <button id="gb-play">Play</button>
    <button id="gb-step">Step</button>
    <button id="gb-reset">Reset</button>
    <label>Tree depth: <input type="range" id="gb-depth" min="1" max="4" value="2"><span class="demo-value" id="gb-depth-val">2</span></label>
  </div>
  <div class="demo-info" id="gb-fit-info">Click Step or Play to begin</div>
</div>

<script>
(function() {
  var fCanvas = document.getElementById('gb-fit-canvas');
  var rCanvas = document.getElementById('gb-resid-canvas');
  var playBtn = document.getElementById('gb-play');
  var stepBtn = document.getElementById('gb-step');
  var resetBtn = document.getElementById('gb-reset');
  var depthSlider = document.getElementById('gb-depth');
  var depthVal = document.getElementById('gb-depth-val');
  var infoEl = document.getElementById('gb-fit-info');

  var W = 680, H = 260;
  var rH = 180;
  var xR = [-3.5, 3.5], yR = [-2.5, 2.5], rYR = [-2, 2];
  var pad = 45;
  var pts, model, curRound, playing, animId;

  function trueFunc(x) {
    return Math.sin(1.5 * x) + 0.5 * Math.cos(0.8 * x);
  }

  function init() {
    var depth = parseInt(depthSlider.value);
    depthVal.textContent = depth;
    pts = BST.genRegression(40);
    model = BST.gradientBoosting(pts, 30, 0.3, depth);
    curRound = 0;
    playing = false;
    playBtn.textContent = 'Play';
    infoEl.textContent = 'Round 0: prediction = mean(y) = ' + model.initPred.toFixed(3);
    draw();
  }

  function drawFit() {
    var ctx = BST.setupCanvas(fCanvas, W, H);
    var c = BST.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    BST.drawAxes(ctx, W, H, c, xR, yR);

    // True function
    ctx.strokeStyle = c.green;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (var px = pad; px <= W - pad; px++) {
      var coord = BST.fromCanvas(px, 0, W, H, pad, xR, yR);
      var fy = trueFunc(coord.x);
      var cp = BST.toCanvas(coord.x, fy, W, H, pad, xR, yR);
      if (px === pad) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Ensemble prediction
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var px = pad; px <= W - pad; px++) {
      var coord = BST.fromCanvas(px, 0, W, H, pad, xR, yR);
      var fy = BST.gbPredict(model, coord.x, curRound);
      var cp = BST.toCanvas(coord.x, fy, W, H, pad, xR, yR);
      if (px === pad) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();

    // Data points
    for (var i = 0; i < pts.length; i++) {
      var cp = BST.toCanvas(pts[i].x, pts[i].y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = c.text;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Legend
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.green;
    ctx.fillText('-- true f(x)', pad + 5, pad + 14);
    ctx.fillStyle = c.accent;
    ctx.fillText('-- ensemble F(x)', pad + 5, pad + 28);
  }

  function drawResiduals() {
    var ctx = BST.setupCanvas(rCanvas, W, rH);
    var c = BST.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, rH);

    var rPad = 35;
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(rPad, 10, W - 2 * rPad, rH - 30);

    // Zero line
    var zeroY = 10 + (rH - 30) / 2;
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(rPad, zeroY);
    ctx.lineTo(W - rPad, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Residuals
    for (var i = 0; i < pts.length; i++) {
      var pred = BST.gbPredict(model, pts[i].x, curRound);
      var resid = pts[i].y - pred;
      var cx = rPad + (pts[i].x - xR[0]) / (xR[1] - xR[0]) * (W - 2 * rPad);
      var rScale = (rH - 30) / (rYR[1] - rYR[0]);
      var cy = zeroY - resid * rScale;
      cy = Math.max(12, Math.min(rH - 22, cy));

      // Line from zero
      ctx.strokeStyle = resid > 0 ? c.class1 : c.class0;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, zeroY);
      ctx.lineTo(cx, cy);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = resid > 0 ? c.class1 : c.class0;
      ctx.fill();
    }

    // Label
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Residuals: y - F(x)', W / 2, rH - 4);

    // MSE
    var mse = 0;
    for (var i = 0; i < pts.length; i++) {
      var pred = BST.gbPredict(model, pts[i].x, curRound);
      var r = pts[i].y - pred;
      mse += r * r;
    }
    mse /= pts.length;
    ctx.textAlign = 'right';
    ctx.fillText('MSE: ' + mse.toFixed(4), W - rPad - 5, 22);
  }

  function draw() {
    drawFit();
    drawResiduals();
  }

  function step() {
    if (curRound >= model.trees.length) {
      playing = false;
      playBtn.textContent = 'Play';
      return false;
    }
    curRound++;
    var mse = 0;
    for (var i = 0; i < pts.length; i++) {
      var pred = BST.gbPredict(model, pts[i].x, curRound);
      var r = pts[i].y - pred;
      mse += r * r;
    }
    mse /= pts.length;
    infoEl.textContent = 'Round ' + curRound + '/' + model.trees.length +
      ' | MSE: ' + mse.toFixed(4) + ' | Trees: ' + curRound;
    draw();
    return true;
  }

  function playLoop() {
    if (!playing) return;
    if (!step()) return;
    animId = setTimeout(playLoop, 500);
  }

  playBtn.addEventListener('click', function() {
    if (playing) { playing = false; playBtn.textContent = 'Play'; }
    else { playing = true; playBtn.textContent = 'Pause'; playLoop(); }
  });
  stepBtn.addEventListener('click', function() {
    playing = false; playBtn.textContent = 'Play'; step();
  });
  resetBtn.addEventListener('click', init);
  depthSlider.addEventListener('input', function() { depthVal.textContent = depthSlider.value; });
  depthSlider.addEventListener('change', init);
  BST.observeTheme(draw);
  init();
})();
</script>

Watch how after the first tree (which fits a rough version of the residuals), subsequent trees make finer and finer corrections. The residual plot gradually flattens toward zero as the ensemble captures more of the underlying signal.

---

## 5. Learning Rate and Iterations Tradeoff

The **learning rate** $$\eta$$ (also called shrinkage) controls how much each tree contributes. A smaller learning rate means each tree makes a smaller correction, requiring more trees to achieve the same fit -- but generalizing better.

$$F_t(x) = F_{t-1}(x) + \eta \cdot h_t(x)$$

This creates a fundamental tradeoff:
- **High $$\eta$$ + few trees**: Fast but rough, may overfit to noise
- **Low $$\eta$$ + many trees**: Smooth convergence, better generalization, but slower

### Try It: Learning Rate vs Iterations

<div class="demo-hint">
<strong>Interactive:</strong> Adjust the learning rate and number of iterations. Watch how a low learning rate needs more iterations to converge. The prediction curve shows the ensemble fit; the info panel shows MSE.
</div>

<div class="interactive-demo">
  <canvas id="lr-canvas"></canvas>
  <div class="demo-controls">
    <label>Learning rate: <input type="range" id="lr-slider" min="0.01" max="1.0" step="0.01" value="0.3"><span class="demo-value" id="lr-val">0.30</span></label>
    <label>Iterations: <input type="range" id="lr-iter-slider" min="1" max="50" value="10"><span class="demo-value" id="lr-iter-val">10</span></label>
    <button id="lr-reset">New Data</button>
  </div>
  <div class="demo-info" id="lr-info"></div>
</div>

<script>
(function() {
  var canvas = document.getElementById('lr-canvas');
  var lrSlider = document.getElementById('lr-slider');
  var lrVal = document.getElementById('lr-val');
  var iterSlider = document.getElementById('lr-iter-slider');
  var iterVal = document.getElementById('lr-iter-val');
  var resetBtn = document.getElementById('lr-reset');
  var infoEl = document.getElementById('lr-info');

  var W = 680, H = 380;
  var xR = [-3.5, 3.5], yR = [-2.5, 2.5];
  var pad = 45;
  var pts;

  function trueFunc(x) {
    return Math.sin(1.5 * x) + 0.5 * Math.cos(0.8 * x);
  }

  function init() {
    pts = BST.genRegression(40);
    draw();
  }

  function draw() {
    var lr = parseFloat(lrSlider.value);
    var iters = parseInt(iterSlider.value);
    lrVal.textContent = lr.toFixed(2);
    iterVal.textContent = iters;

    var model = BST.gradientBoosting(pts, iters, lr, 2);

    var ctx = BST.setupCanvas(canvas, W, H);
    var c = BST.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    BST.drawAxes(ctx, W, H, c, xR, yR);

    // True function
    ctx.strokeStyle = c.green;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (var px = pad; px <= W - pad; px++) {
      var coord = BST.fromCanvas(px, 0, W, H, pad, xR, yR);
      var fy = trueFunc(coord.x);
      var cp = BST.toCanvas(coord.x, fy, W, H, pad, xR, yR);
      if (px === pad) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Ensemble
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var px = pad; px <= W - pad; px++) {
      var coord = BST.fromCanvas(px, 0, W, H, pad, xR, yR);
      var fy = BST.gbPredict(model, coord.x);
      var cp = BST.toCanvas(coord.x, fy, W, H, pad, xR, yR);
      if (px === pad) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();

    // Data
    for (var i = 0; i < pts.length; i++) {
      var cp = BST.toCanvas(pts[i].x, pts[i].y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = c.text;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Legend
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.green;
    ctx.fillText('-- true f(x)', pad + 5, pad + 14);
    ctx.fillStyle = c.accent;
    ctx.fillText('-- ensemble (lr=' + lr.toFixed(2) + ', T=' + iters + ')', pad + 5, pad + 28);

    // MSE
    var mse = 0;
    for (var i = 0; i < pts.length; i++) {
      var pred = BST.gbPredict(model, pts[i].x);
      var r = pts[i].y - pred;
      mse += r * r;
    }
    mse /= pts.length;
    infoEl.textContent = 'MSE: ' + mse.toFixed(4) + ' | lr=' + lr.toFixed(2) + ' x ' + iters + ' trees';
  }

  lrSlider.addEventListener('input', draw);
  iterSlider.addEventListener('input', draw);
  resetBtn.addEventListener('click', init);
  BST.observeTheme(draw);
  init();
})();
</script>

Try setting the learning rate to 1.0 with 5 iterations, then compare to 0.1 with 50 iterations. Both use similar total "learning capacity", but the low learning rate version typically produces a smoother, more generalizable fit.

---

## 6. Stagewise Additive Model

The gradient boosting prediction is a **stagewise additive model** -- a sum of individual weak learner contributions:

$$F(x) = F_0 + \eta \cdot h_1(x) + \eta \cdot h_2(x) + \cdots + \eta \cdot h_T(x)$$

Each term adds a small correction. Below you can toggle individual tree contributions on and off to see what each one is doing.

### Try It: Toggle Individual Tree Contributions

<div class="demo-hint">
<strong>Interactive:</strong> Each colored line shows an individual tree's contribution (scaled by learning rate). The thick blue line is the sum of all active contributions. Click the checkboxes to toggle individual trees on/off and see how the total changes.
</div>

<div class="interactive-demo">
  <canvas id="stage-canvas"></canvas>
  <div class="demo-controls" id="stage-controls">
    <button id="stage-all">All On</button>
    <button id="stage-none">All Off</button>
    <button id="stage-reset">New Data</button>
  </div>
  <div id="stage-checks" style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-top:0.5rem;font-size:0.8rem;"></div>
  <div class="demo-info" id="stage-info"></div>
</div>

<script>
(function() {
  var canvas = document.getElementById('stage-canvas');
  var allBtn = document.getElementById('stage-all');
  var noneBtn = document.getElementById('stage-none');
  var resetBtn = document.getElementById('stage-reset');
  var checksEl = document.getElementById('stage-checks');
  var infoEl = document.getElementById('stage-info');

  var W = 680, H = 400;
  var xR = [-3.5, 3.5], yR = [-2.5, 2.5];
  var pad = 45;
  var pts, model;
  var active = [];
  var treeColors = ['#f7768e','#7aa2f7','#9ece6a','#ff9e64','#bb9af7','#2ac3de','#e0af68','#73daca',
                    '#f7768e','#7aa2f7','#9ece6a','#ff9e64'];
  var numTrees = 8;

  function init() {
    pts = BST.genRegression(40);
    model = BST.gradientBoosting(pts, numTrees, 0.3, 2);
    active = [];
    checksEl.innerHTML = '';
    for (var i = 0; i < model.trees.length; i++) {
      active.push(true);
      var lbl = document.createElement('label');
      lbl.style.display = 'inline-flex';
      lbl.style.alignItems = 'center';
      lbl.style.gap = '2px';
      lbl.style.color = treeColors[i % treeColors.length];
      lbl.style.fontWeight = '600';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = true;
      cb.dataset.idx = i;
      cb.addEventListener('change', function() {
        active[parseInt(this.dataset.idx)] = this.checked;
        draw();
      });
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode('Tree ' + (i + 1)));
      checksEl.appendChild(lbl);
    }
    draw();
  }

  function draw() {
    var ctx = BST.setupCanvas(canvas, W, H);
    var c = BST.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    BST.drawAxes(ctx, W, H, c, xR, yR);

    // Individual tree contributions (faint)
    for (var t = 0; t < model.trees.length; t++) {
      if (!active[t]) continue;
      ctx.strokeStyle = treeColors[t % treeColors.length];
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      for (var px = pad; px <= W - pad; px++) {
        var coord = BST.fromCanvas(px, 0, W, H, pad, xR, yR);
        var fy = model.lr * BST.regTreePredict(model.trees[t], coord.x);
        var cp = BST.toCanvas(coord.x, fy, W, H, pad, xR, yR);
        if (px === pad) ctx.moveTo(cp.x, cp.y);
        else ctx.lineTo(cp.x, cp.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Combined prediction
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var px = pad; px <= W - pad; px++) {
      var coord = BST.fromCanvas(px, 0, W, H, pad, xR, yR);
      var fy = model.initPred;
      for (var t = 0; t < model.trees.length; t++) {
        if (active[t]) {
          fy += model.lr * BST.regTreePredict(model.trees[t], coord.x);
        }
      }
      var cp = BST.toCanvas(coord.x, fy, W, H, pad, xR, yR);
      if (px === pad) ctx.moveTo(cp.x, cp.y);
      else ctx.lineTo(cp.x, cp.y);
    }
    ctx.stroke();

    // Data points
    for (var i = 0; i < pts.length; i++) {
      var cp = BST.toCanvas(pts[i].x, pts[i].y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = c.text;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    var activeCount = 0;
    for (var i = 0; i < active.length; i++) if (active[i]) activeCount++;
    infoEl.textContent = activeCount + '/' + model.trees.length + ' trees active | F(x) = F0 + sum of selected tree contributions';
  }

  allBtn.addEventListener('click', function() {
    for (var i = 0; i < active.length; i++) active[i] = true;
    var cbs = checksEl.querySelectorAll('input');
    for (var i = 0; i < cbs.length; i++) cbs[i].checked = true;
    draw();
  });
  noneBtn.addEventListener('click', function() {
    for (var i = 0; i < active.length; i++) active[i] = false;
    var cbs = checksEl.querySelectorAll('input');
    for (var i = 0; i < cbs.length; i++) cbs[i].checked = false;
    draw();
  });
  resetBtn.addEventListener('click', init);
  BST.observeTheme(draw);
  init();
})();
</script>

Try turning off all trees, then adding them back one at a time. Each tree captures a different piece of the residual error. Together they build up the full prediction. Turning off a single tree degrades the fit in the region where that tree was making corrections.

---

## 7. Boosting vs Bagging

Both boosting and bagging (bootstrap aggregating, used in Random Forests) are ensemble methods, but they work very differently:

| Property | **Bagging** (Random Forest) | **Boosting** (AdaBoost/GB) |
|----------|---------------------------|--------------------------|
| Training | Parallel -- each tree trained independently | Sequential -- each tree depends on previous |
| Sampling | Bootstrap samples (random subsets with replacement) | Full dataset, reweighted |
| Focus | Equal attention to all samples | Extra attention to hard/misclassified samples |
| Bias-Variance | Reduces **variance** | Reduces **bias** (and variance) |
| Trees | Full-depth, high-variance trees | Shallow stumps/trees, high-bias learners |
| Overfitting | Resistant | Can overfit with too many rounds |

### Try It: Bagging vs Boosting Side-by-Side

<div class="demo-hint">
<strong>Interactive:</strong> The same dataset is shown on both sides. Left: a bagging ensemble (parallel random stumps with equal vote). Right: AdaBoost (sequential, weighted voting). Click <strong>Add Trees</strong> to grow both ensembles. Notice how boosting typically achieves higher accuracy faster.
</div>

<div class="interactive-demo">
  <div class="demo-split">
    <div>
      <canvas id="bag-canvas"></canvas>
      <div class="demo-caption">Bagging (parallel, equal weight)</div>
    </div>
    <div>
      <canvas id="boost-canvas"></canvas>
      <div class="demo-caption">Boosting (sequential, adaptive)</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="bb-add">Add 5 Trees</button>
    <button id="bb-reset">Reset</button>
    <span class="demo-value" id="bb-info">Trees: 0</span>
  </div>
</div>

<script>
(function() {
  var bagCanvas = document.getElementById('bag-canvas');
  var boostCanvas = document.getElementById('boost-canvas');
  var addBtn = document.getElementById('bb-add');
  var resetBtn = document.getElementById('bb-reset');
  var infoEl = document.getElementById('bb-info');

  var W = 340, H = 340;
  var xR = [-3, 3], yR = [-3, 3];
  var pad = 35;
  var pts, bagStumps, boostModel, numTrees;

  function init() {
    pts = BST.genMoons(60, 0.25);
    bagStumps = [];
    boostModel = null;
    numTrees = 0;
    infoEl.textContent = 'Trees: 0';
    draw();
  }

  // Train a stump on a bootstrap sample (bagging)
  function trainBagStump() {
    var n = pts.length;
    var sample = [];
    for (var i = 0; i < n; i++) {
      sample.push(pts[Math.floor(Math.random() * n)]);
    }
    var w = [];
    for (var i = 0; i < n; i++) w.push(1 / n);
    return BST.trainStump(sample, w);
  }

  function bagPredict(x, y) {
    if (bagStumps.length === 0) return 0;
    var sum = 0;
    for (var i = 0; i < bagStumps.length; i++) {
      sum += BST.stumpPredict(bagStumps[i], x, y);
    }
    return sum / bagStumps.length;
  }

  function drawSide(canvas, predictFn, label, accuracy) {
    var ctx = BST.setupCanvas(canvas, W, H);
    var c = BST.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);

    if (numTrees > 0) {
      var step = 4;
      var c0col = c.isDark ? [122, 162, 247] : [37, 99, 235];
      var c1col = c.isDark ? [247, 118, 142] : [230, 57, 70];
      for (var py = 0; py < H - 2 * pad; py += step) {
        for (var px = 0; px < W - 2 * pad; px += step) {
          var coord = BST.fromCanvas(pad + px, pad + py, W, H, pad, xR, yR);
          var score = predictFn(coord.x, coord.y);
          var col = score > 0 ? c1col : c0col;
          var alpha = Math.min(0.35, Math.abs(score) * 0.2);
          ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + alpha + ')';
          ctx.fillRect(pad + px, pad + py, step, step);
        }
      }
    }

    for (var i = 0; i < pts.length; i++) {
      var cp = BST.toCanvas(pts[i].x, pts[i].y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = pts[i].label === 1 ? c.class1 : c.class0;
      ctx.fill();
    }

    if (numTrees > 0) {
      ctx.fillStyle = c.text;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('Acc: ' + accuracy.toFixed(1) + '%', W - pad - 5, pad + 14);
    }
  }

  function draw() {
    var bagAcc = 0, boostAcc = 0;
    if (numTrees > 0) {
      var bc = 0, boc = 0;
      for (var i = 0; i < pts.length; i++) {
        var bp = bagPredict(pts[i].x, pts[i].y) > 0 ? 1 : -1;
        if (bp === pts[i].label) bc++;
        if (boostModel) {
          var bop = BST.adaPredict(boostModel.stumps, pts[i].x, pts[i].y) > 0 ? 1 : -1;
          if (bop === pts[i].label) boc++;
        }
      }
      bagAcc = 100 * bc / pts.length;
      boostAcc = boostModel ? 100 * boc / pts.length : 0;
    }
    drawSide(bagCanvas, bagPredict, 'Bagging', bagAcc);
    drawSide(boostCanvas, function(x, y) {
      return boostModel ? BST.adaPredict(boostModel.stumps, x, y) : 0;
    }, 'Boosting', boostAcc);
  }

  addBtn.addEventListener('click', function() {
    numTrees += 5;
    // Add 5 bagging stumps
    for (var i = 0; i < 5; i++) {
      bagStumps.push(trainBagStump());
    }
    // Retrain full boosting with numTrees rounds
    boostModel = BST.adaboost(pts, numTrees);
    infoEl.textContent = 'Trees: ' + numTrees +
      ' | Bag acc: ' + (function() {
        var c = 0;
        for (var i = 0; i < pts.length; i++) {
          if ((bagPredict(pts[i].x, pts[i].y) > 0 ? 1 : -1) === pts[i].label) c++;
        }
        return (100 * c / pts.length).toFixed(1);
      })() + '% | Boost acc: ' + (function() {
        var c = 0;
        for (var i = 0; i < pts.length; i++) {
          if ((BST.adaPredict(boostModel.stumps, pts[i].x, pts[i].y) > 0 ? 1 : -1) === pts[i].label) c++;
        }
        return (100 * c / pts.length).toFixed(1);
      })() + '%';
    draw();
  });

  resetBtn.addEventListener('click', init);
  BST.observeTheme(draw);
  init();
})();
</script>

Boosting typically reaches higher accuracy faster because each new tree specifically targets the mistakes of previous trees. Bagging is more robust to overfitting since each tree is independent and they are simply averaged. In practice, gradient boosting (with careful tuning) often achieves the best accuracy, while random forests are the safer default.

---

## 8. Overfitting in Boosting

Boosting can overfit if we use too many rounds or too high a learning rate. Unlike bagging, where adding more trees almost never hurts, boosting can start memorizing noise.

The training error will always decrease toward zero. But at some point the test error starts increasing -- the classic overfitting signature. **Early stopping** (monitoring validation error and stopping when it starts to rise) is one of the most important regularization techniques for boosting.

### Try It: Overfitting Demo

<div class="demo-hint">
<strong>Interactive:</strong> Watch the training error (blue) and test error (red) as you increase the number of boosting rounds. With high learning rate, notice the test error eventually rises while training error keeps dropping. This is overfitting. Drag the slider to find the optimal stopping point.
</div>

<div class="interactive-demo">
  <canvas id="overfit-canvas"></canvas>
  <div class="demo-controls">
    <label>Rounds: <input type="range" id="overfit-rounds" min="1" max="50" value="25"><span class="demo-value" id="overfit-rounds-val">25</span></label>
    <label>Learning rate: <input type="range" id="overfit-lr" min="0.05" max="1.0" step="0.05" value="0.5"><span class="demo-value" id="overfit-lr-val">0.50</span></label>
    <button id="overfit-reset">New Data</button>
  </div>
  <div class="demo-info" id="overfit-info"></div>
</div>

<script>
(function() {
  var canvas = document.getElementById('overfit-canvas');
  var roundsSlider = document.getElementById('overfit-rounds');
  var roundsVal = document.getElementById('overfit-rounds-val');
  var lrSlider = document.getElementById('overfit-lr');
  var lrVal = document.getElementById('overfit-lr-val');
  var resetBtn = document.getElementById('overfit-reset');
  var infoEl = document.getElementById('overfit-info');

  var W = 680, H = 380;
  var trainPts, testPts;

  function init() {
    trainPts = BST.genRegression(30);
    testPts = [];
    for (var i = 0; i < 30; i++) {
      var x = -3 + 6 * Math.random();
      var y = Math.sin(1.5 * x) + 0.5 * Math.cos(0.8 * x) + BST.randGauss() * 0.25;
      testPts.push({ x: x, y: y });
    }
    draw();
  }

  function draw() {
    var maxRounds = parseInt(roundsSlider.value);
    var lr = parseFloat(lrSlider.value);
    roundsVal.textContent = maxRounds;
    lrVal.textContent = lr.toFixed(2);

    // Train full model
    var model = BST.gradientBoosting(trainPts, maxRounds, lr, 3);

    // Compute errors at each round
    var trainErrors = [];
    var testErrors = [];
    for (var r = 0; r <= maxRounds; r++) {
      var trainMSE = 0;
      for (var i = 0; i < trainPts.length; i++) {
        var pred = BST.gbPredict(model, trainPts[i].x, r);
        var err = trainPts[i].y - pred;
        trainMSE += err * err;
      }
      trainMSE /= trainPts.length;
      trainErrors.push(trainMSE);

      var testMSE = 0;
      for (var i = 0; i < testPts.length; i++) {
        var pred = BST.gbPredict(model, testPts[i].x, r);
        var err = testPts[i].y - pred;
        testMSE += err * err;
      }
      testMSE /= testPts.length;
      testErrors.push(testMSE);
    }

    var ctx = BST.setupCanvas(canvas, W, H);
    var c = BST.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var plotPad = 60;
    var plotW = W - 2 * plotPad;
    var plotH = H - 2 * plotPad;

    // Find max error for scaling
    var maxErr = 0;
    for (var i = 0; i < trainErrors.length; i++) {
      if (trainErrors[i] > maxErr) maxErr = trainErrors[i];
      if (testErrors[i] > maxErr) maxErr = testErrors[i];
    }
    maxErr *= 1.1;

    // Grid
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) {
      var y = plotPad + plotH * i / 5;
      ctx.beginPath(); ctx.moveTo(plotPad, y); ctx.lineTo(W - plotPad, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(plotPad, plotPad, plotW, plotH);

    // Axis labels
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var i = 0; i <= 5; i++) {
      var r = Math.round(maxRounds * i / 5);
      var x = plotPad + plotW * i / 5;
      ctx.fillText(r, x, H - plotPad + 18);
    }
    ctx.fillText('Boosting Rounds', W / 2, H - 10);
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var v = maxErr * (1 - i / 4);
      var y = plotPad + plotH * i / 4;
      ctx.fillText(v.toFixed(2), plotPad - 8, y + 4);
    }
    ctx.save();
    ctx.translate(16, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('MSE', 0, 0);
    ctx.restore();

    // Train error line
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < trainErrors.length; i++) {
      var x = plotPad + plotW * i / maxRounds;
      var y = plotPad + plotH * (1 - trainErrors[i] / maxErr);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Test error line
    ctx.strokeStyle = c.class1;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < testErrors.length; i++) {
      var x = plotPad + plotW * i / maxRounds;
      var y = plotPad + plotH * (1 - testErrors[i] / maxErr);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Find best test round
    var bestRound = 0, bestTest = testErrors[0];
    for (var i = 1; i < testErrors.length; i++) {
      if (testErrors[i] < bestTest) { bestTest = testErrors[i]; bestRound = i; }
    }

    // Best round marker
    var bx = plotPad + plotW * bestRound / maxRounds;
    ctx.strokeStyle = c.green;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(bx, plotPad);
    ctx.lineTo(bx, plotPad + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Legend
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.accent;
    ctx.fillText('-- Train MSE', plotPad + 10, plotPad + 16);
    ctx.fillStyle = c.class1;
    ctx.fillText('-- Test MSE', plotPad + 10, plotPad + 30);
    ctx.fillStyle = c.green;
    ctx.fillText('| Best test (round ' + bestRound + ')', plotPad + 10, plotPad + 44);

    infoEl.textContent = 'Best test MSE: ' + bestTest.toFixed(4) + ' at round ' + bestRound +
      ' | Train MSE at ' + maxRounds + ': ' + trainErrors[maxRounds].toFixed(4) +
      ' | Test MSE at ' + maxRounds + ': ' + testErrors[maxRounds].toFixed(4);
  }

  roundsSlider.addEventListener('input', draw);
  lrSlider.addEventListener('input', draw);
  resetBtn.addEventListener('click', init);
  BST.observeTheme(draw);
  init();
})();
</script>

With a high learning rate (try 0.8+) and many rounds (40+), you will often see the test error curve rise after an initial drop -- classic overfitting. The green dashed line marks the optimal early stopping point. In practice, you would use a validation set and stop training when validation error stops improving.

---

## 9. Summary

We have built three key concepts from scratch:

**AdaBoost** maintains sample weights and trains weak learners sequentially. Misclassified samples get higher weights, forcing subsequent learners to focus on hard cases. The final prediction is a weighted vote.

**Gradient Boosting** fits residuals (negative gradients) sequentially. Each new tree corrects the errors of the current ensemble. The learning rate controls how aggressive each correction is.

**Both methods** turn weak learners (decision stumps) into a powerful ensemble through the principle of sequential, adaptive learning.

### Comparison Table

<table class="boost-table">
<thead>
<tr><th>Property</th><th>AdaBoost</th><th>Gradient Boosting</th><th>XGBoost/LightGBM</th></tr>
</thead>
<tbody>
<tr><td>Mechanism</td><td>Reweight samples</td><td>Fit residuals (gradients)</td><td>Regularized gradient boosting</td></tr>
<tr><td>Loss function</td><td>Exponential loss</td><td>Any differentiable loss</td><td>Any + regularization terms</td></tr>
<tr><td>Weak learner</td><td>Decision stumps</td><td>Shallow trees (depth 3-8)</td><td>Shallow trees + pruning</td></tr>
<tr><td>Regularization</td><td>Number of rounds</td><td>Learning rate, tree depth, rounds</td><td>L1/L2 on weights, subsampling, column sampling</td></tr>
<tr><td>Sensitivity to noise</td><td>High (outlier weights explode)</td><td>Moderate</td><td>Low (robust losses available)</td></tr>
<tr><td>Speed</td><td>Fast</td><td>Moderate</td><td>Fast (optimized, parallel)</td></tr>
<tr><td>When to use</td><td>Simple problems, fast prototyping</td><td>General purpose, flexible</td><td>Production, competitions, large data</td></tr>
</tbody>
</table>

### Key Takeaways

1. **Weak + sequential = strong.** A single decision stump is barely better than random. Hundreds of them, trained sequentially to fix each other's mistakes, can match or beat deep neural networks on tabular data.

2. **Learning rate matters.** Small learning rates with more trees almost always generalize better than large learning rates with few trees. This is the "slow learning" principle.

3. **Watch for overfitting.** Unlike random forests, boosting can overfit. Always use early stopping based on a validation set.

4. **Gradient boosting is more flexible.** AdaBoost is elegant but limited to exponential loss. Gradient boosting works with any differentiable loss function, making it the foundation for modern boosting libraries.

In the next chapter, we will explore **neural networks and the perceptron** -- moving from ensemble methods to the building blocks of deep learning.
