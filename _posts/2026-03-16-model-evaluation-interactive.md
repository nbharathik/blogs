---
layout: post
title: "Model Evaluation: Metrics, Curves & Cross-Validation - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Build confusion matrices, trace ROC and Precision-Recall curves, animate K-Fold cross-validation, and diagnose bias vs variance with learning curves - all interactively."
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
.cm-grid {
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  grid-template-rows: auto 1fr 1fr;
  gap: 3px;
  max-width: 280px;
  margin: 0 auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
}
.cm-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 0.5rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 1.1rem;
  transition: background 0.3s, transform 0.2s;
}
.cm-header {
  font-weight: 600;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
}
.cm-corner { }
.metric-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
}
@media (max-width: 640px) {
  .metric-cards { grid-template-columns: 1fr; }
}
.metric-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.6rem;
  text-align: center;
}
.metric-card .metric-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.metric-card .metric-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.3rem;
  font-weight: 700;
  margin-top: 0.15rem;
}
.ev-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.85rem;
}
.ev-table th, .ev-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}
.ev-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
.ev-table td {
  background: var(--bg-primary);
}
.kfold-fold {
  display: inline-block;
  width: 100%;
  height: 28px;
  border-radius: 4px;
  margin: 2px 0;
  transition: all 0.4s ease;
}
</style>

<script>
window.EV = (function() {
  var E = {};

  E.getColors = function() {
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
      tp: isDark ? '#9ece6a' : '#16a34a',
      tpBg: isDark ? 'rgba(158,206,106,0.25)' : 'rgba(22,163,74,0.15)',
      tn: isDark ? '#7aa2f7' : '#2563eb',
      tnBg: isDark ? 'rgba(122,162,247,0.25)' : 'rgba(37,99,235,0.15)',
      fp: isDark ? '#ff9e64' : '#d97706',
      fpBg: isDark ? 'rgba(255,158,100,0.25)' : 'rgba(217,119,6,0.15)',
      fn: isDark ? '#f7768e' : '#e63946',
      fnBg: isDark ? 'rgba(247,118,142,0.25)' : 'rgba(230,57,70,0.15)',
      green: isDark ? '#9ece6a' : '#16a34a',
      orange: isDark ? '#ff9e64' : '#d97706',
      purple: isDark ? '#bb9af7' : '#7c3aed',
      auc: isDark ? 'rgba(122,162,247,0.2)' : 'rgba(37,99,235,0.12)',
      fold: isDark ? '#7aa2f7' : '#2563eb',
      foldVal: isDark ? '#ff9e64' : '#d97706',
      foldBg: isDark ? 'rgba(122,162,247,0.3)' : 'rgba(37,99,235,0.2)',
      foldValBg: isDark ? 'rgba(255,158,100,0.3)' : 'rgba(217,119,6,0.2)',
      isDark: isDark
    };
  };

  E.setupCanvas = function(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  E.observeTheme = function(cb) {
    var obs = new MutationObserver(function() { cb(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb);
  };

  // Generate 2-class data with controllable imbalance
  E.genData = function(nPos, nNeg, seed) {
    var pts = [];
    var rng = E.mulberry32(seed || 42);
    // Positive class: cluster around (2, 2) with spread
    for (var i = 0; i < nPos; i++) {
      pts.push({
        x: 1.5 + rng() * 2.5,
        y: 1.0 + rng() * 2.5,
        label: 1
      });
    }
    // Negative class: cluster around (-1, -1) with spread
    for (var i = 0; i < nNeg; i++) {
      pts.push({
        x: -2.5 + rng() * 2.5,
        y: -2.5 + rng() * 2.5,
        label: 0
      });
    }
    // Add some overlap
    for (var i = 0; i < Math.floor(nPos * 0.15); i++) {
      pts.push({ x: -0.5 + rng() * 2, y: -0.5 + rng() * 2, label: 1 });
    }
    for (var i = 0; i < Math.floor(nNeg * 0.15); i++) {
      pts.push({ x: -0.5 + rng() * 2, y: -0.5 + rng() * 2, label: 0 });
    }
    return pts;
  };

  // Generate imbalanced data (95/5 split)
  E.genImbalanced = function(n, posRatio, seed) {
    var rng = E.mulberry32(seed || 99);
    posRatio = posRatio || 0.05;
    var nPos = Math.round(n * posRatio);
    var nNeg = n - nPos;
    var pts = [];
    for (var i = 0; i < nNeg; i++) {
      var angle = rng() * Math.PI * 2;
      var r = 1.0 + rng() * 2.5;
      pts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r, label: 0 });
    }
    for (var i = 0; i < nPos; i++) {
      pts.push({ x: -0.3 + rng() * 0.6, y: -0.3 + rng() * 0.6, label: 1 });
    }
    return pts;
  };

  E.mulberry32 = function(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };

  // Simple logistic regression classifier
  E.trainLogistic = function(pts, lr, epochs) {
    lr = lr || 0.05;
    epochs = epochs || 500;
    var w = [0, 0], b = 0;
    for (var ep = 0; ep < epochs; ep++) {
      var dw = [0, 0], db = 0;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var z = w[0] * p.x + w[1] * p.y + b;
        var pred = 1 / (1 + Math.exp(-z));
        var err = pred - p.label;
        dw[0] += err * p.x;
        dw[1] += err * p.y;
        db += err;
      }
      w[0] -= lr * dw[0] / pts.length;
      w[1] -= lr * dw[1] / pts.length;
      b -= lr * db / pts.length;
    }
    return { w: w, b: b };
  };

  // Predict probability for a point
  E.predictProba = function(model, x, y) {
    var z = model.w[0] * x + model.w[1] * y + model.b;
    return 1 / (1 + Math.exp(-z));
  };

  // Compute scores for all points
  E.scoreAll = function(model, pts) {
    var scores = [];
    for (var i = 0; i < pts.length; i++) {
      scores.push({
        score: E.predictProba(model, pts[i].x, pts[i].y),
        label: pts[i].label
      });
    }
    return scores;
  };

  // Compute confusion matrix at threshold
  E.confusionMatrix = function(scores, threshold) {
    var tp = 0, fp = 0, tn = 0, fn = 0;
    for (var i = 0; i < scores.length; i++) {
      var pred = scores[i].score >= threshold ? 1 : 0;
      var actual = scores[i].label;
      if (pred === 1 && actual === 1) tp++;
      else if (pred === 1 && actual === 0) fp++;
      else if (pred === 0 && actual === 0) tn++;
      else fn++;
    }
    return { tp: tp, fp: fp, tn: tn, fn: fn };
  };

  // Compute metrics from confusion matrix
  E.metrics = function(cm) {
    var precision = cm.tp + cm.fp > 0 ? cm.tp / (cm.tp + cm.fp) : 0;
    var recall = cm.tp + cm.fn > 0 ? cm.tp / (cm.tp + cm.fn) : 0;
    var f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
    var accuracy = (cm.tp + cm.tn) / (cm.tp + cm.fp + cm.tn + cm.fn);
    var specificity = cm.tn + cm.fp > 0 ? cm.tn / (cm.tn + cm.fp) : 0;
    var fpr = 1 - specificity;
    return { precision: precision, recall: recall, f1: f1, accuracy: accuracy, specificity: specificity, fpr: fpr };
  };

  // Generate full ROC curve data
  E.rocCurve = function(scores) {
    var thresholds = [];
    for (var t = 0; t <= 1.001; t += 0.005) thresholds.push(t);
    thresholds.sort(function(a, b) { return b - a; });
    var pts = [];
    for (var i = 0; i < thresholds.length; i++) {
      var cm = E.confusionMatrix(scores, thresholds[i]);
      var m = E.metrics(cm);
      pts.push({ fpr: m.fpr, tpr: m.recall, threshold: thresholds[i] });
    }
    return pts;
  };

  // Compute AUC using trapezoidal rule
  E.computeAUC = function(rocPts) {
    var auc = 0;
    for (var i = 1; i < rocPts.length; i++) {
      var dx = rocPts[i].fpr - rocPts[i - 1].fpr;
      var avgY = (rocPts[i].tpr + rocPts[i - 1].tpr) / 2;
      auc += dx * avgY;
    }
    return Math.abs(auc);
  };

  // Generate PR curve data
  E.prCurve = function(scores) {
    var thresholds = [];
    for (var t = 0; t <= 1.001; t += 0.005) thresholds.push(t);
    thresholds.sort(function(a, b) { return b - a; });
    var pts = [];
    for (var i = 0; i < thresholds.length; i++) {
      var cm = E.confusionMatrix(scores, thresholds[i]);
      var m = E.metrics(cm);
      if (cm.tp + cm.fp > 0) {
        pts.push({ recall: m.recall, precision: m.precision, threshold: thresholds[i] });
      }
    }
    return pts;
  };

  // Draw standard axes
  E.drawAxes = function(ctx, W, H, c, xLabel, yLabel, xRange, yRange) {
    var pad = 50;
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) {
      var x = pad + (W - 2 * pad) * i / 5;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H - pad); ctx.stroke();
      var y = pad + (H - 2 * pad) * i / 5;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var i = 0; i <= 5; i++) {
      var val = xRange[0] + (xRange[1] - xRange[0]) * i / 5;
      var x = pad + (W - 2 * pad) * i / 5;
      ctx.fillText(val.toFixed(1), x, H - pad + 16);
    }
    ctx.textAlign = 'right';
    for (var i = 0; i <= 5; i++) {
      var val = yRange[0] + (yRange[1] - yRange[0]) * i / 5;
      var y = H - pad - (H - 2 * pad) * i / 5;
      ctx.fillText(val.toFixed(1), pad - 8, y + 4);
    }
    ctx.fillStyle = c.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(xLabel, W / 2, H - 8);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
    return pad;
  };

  E.toCanvas = function(val, min, max, pixMin, pixMax) {
    return pixMin + (val - min) / (max - min) * (pixMax - pixMin);
  };

  return E;
})();
</script>

You just built an amazing classifier. It predicts with **95% accuracy** on your test set. Time to ship it to production, right?

Not so fast. What if your dataset has 95% negative samples and 5% positive? A model that **always predicts negative** would also score 95% accuracy, while being completely useless at finding the positive cases you actually care about.

This chapter builds the toolkit you need to properly evaluate classification models. We will construct confusion matrices, trace ROC and Precision-Recall curves, animate cross-validation, and diagnose whether your model suffers from bias or variance, all interactively.

---

## 1. Why Accuracy Isn't Enough

Consider a medical screening test for a rare disease that affects 5% of patients. A "model" that always says "no disease" achieves 95% accuracy. But it misses **every** sick patient.

<div class="interactive-demo" id="demo-imbalance">
  <h4 style="margin-top:0">The Accuracy Trap: Imbalanced Data</h4>
  <canvas id="canvas-imbalance" width="580" height="340"></canvas>
  <div class="demo-controls">
    <label>Positive class ratio: <input type="range" id="imb-ratio" min="2" max="50" value="5" step="1"><span class="demo-value" id="imb-ratio-val">5%</span></label>
    <button id="imb-reset">Regenerate</button>
  </div>
  <div class="demo-info" id="imb-info">Always-negative accuracy: 95.0% | Actual positives missed: 100%</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-imbalance');
  var ratioSlider = document.getElementById('imb-ratio');
  var ratioVal = document.getElementById('imb-ratio-val');
  var info = document.getElementById('imb-info');
  var W = 580, H = 340;
  var seed = 42;

  function draw() {
    var ctx = EV.setupCanvas(canvas, W, H);
    var c = EV.getColors();
    var ratio = parseInt(ratioSlider.value) / 100;
    ratioVal.textContent = ratioSlider.value + '%';
    var n = 200;
    var pts = EV.genImbalanced(n, ratio, seed);
    var nPos = 0, nNeg = 0;
    for (var i = 0; i < pts.length; i++) {
      if (pts[i].label === 1) nPos++; else nNeg++;
    }

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var pad = 50;
    // Draw axes
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) {
      var x = pad + (W - 2 * pad) * i / 5;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H - pad); ctx.stroke();
      var y = pad + (H - 2 * pad) * i / 5;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);

    var xR = [-4, 4], yR = [-4, 4];
    // Draw points
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var cx = pad + (p.x - xR[0]) / (xR[1] - xR[0]) * (W - 2 * pad);
      var cy = H - pad - (p.y - yR[0]) / (yR[1] - yR[0]) * (H - 2 * pad);
      ctx.beginPath();
      ctx.arc(cx, cy, p.label === 1 ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? c.class1 : c.class0;
      ctx.globalAlpha = p.label === 1 ? 1.0 : 0.5;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Legend
    ctx.font = '12px sans-serif';
    ctx.fillStyle = c.class1;
    ctx.beginPath(); ctx.arc(W - 150, pad + 15, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.text;
    ctx.textAlign = 'left';
    ctx.fillText('Positive (' + nPos + ')', W - 140, pad + 19);
    ctx.fillStyle = c.class0;
    ctx.beginPath(); ctx.arc(W - 150, pad + 35, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.text;
    ctx.fillText('Negative (' + nNeg + ')', W - 140, pad + 39);

    var accNeg = (nNeg / pts.length * 100).toFixed(1);
    info.textContent = 'Always-negative accuracy: ' + accNeg + '% | Actual positives missed: 100%';
  }

  ratioSlider.addEventListener('input', draw);
  document.getElementById('imb-reset').addEventListener('click', function() {
    seed = Math.floor(Math.random() * 10000);
    draw();
  });
  draw();
  EV.observeTheme(draw);
})();
</script>

<div class="demo-hint">
Drag the <strong>positive class ratio</strong> slider. At 5%, a naive "always negative" model gets 95% accuracy. We need metrics that measure how well the model finds the rare positive class.
</div>

The core problem: **accuracy treats all errors equally**. In practice, the cost of a false negative (missing a disease) and a false positive (unnecessary treatment) are rarely the same. We need a richer vocabulary for describing model performance.

---

## 2. The Confusion Matrix

Every binary classification prediction falls into one of four buckets:

|  | **Predicted Positive** | **Predicted Negative** |
|---|---|---|
| **Actually Positive** | True Positive (TP) | False Negative (FN) |
| **Actually Negative** | False Positive (FP) | True Negative (TN) |

The **decision threshold** determines where we draw the line. For a model that outputs probabilities, we predict positive when \\( P(y=1 \mid x) \geq t \\).

<div class="interactive-demo" id="demo-confusion">
  <h4 style="margin-top:0">Confusion Matrix Builder</h4>
  <div class="demo-split">
    <div>
      <canvas id="canvas-confusion" width="380" height="340"></canvas>
      <div class="demo-caption">Decision boundary at threshold</div>
    </div>
    <div>
      <div class="cm-grid" id="cm-grid">
        <div class="cm-corner"></div>
        <div class="cm-header">Pred +</div>
        <div class="cm-header">Pred &minus;</div>
        <div class="cm-header" style="text-align:right;">Act +</div>
        <div class="cm-cell" id="cm-tp" style="background:var(--bg-primary);">0</div>
        <div class="cm-cell" id="cm-fn" style="background:var(--bg-primary);">0</div>
        <div class="cm-header" style="text-align:right;">Act &minus;</div>
        <div class="cm-cell" id="cm-fp" style="background:var(--bg-primary);">0</div>
        <div class="cm-cell" id="cm-tn" style="background:var(--bg-primary);">0</div>
      </div>
      <div class="metric-cards" id="cm-metrics">
        <div class="metric-card"><div class="metric-label">Accuracy</div><div class="metric-val" id="cm-acc">0.00</div></div>
        <div class="metric-card"><div class="metric-label">Precision</div><div class="metric-val" id="cm-prec">0.00</div></div>
        <div class="metric-card"><div class="metric-label">Recall</div><div class="metric-val" id="cm-rec">0.00</div></div>
      </div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Threshold: <input type="range" id="cm-threshold" min="0" max="100" value="50" step="1"><span class="demo-value" id="cm-thresh-val">0.50</span></label>
    <button id="cm-reset">New Data</button>
  </div>
  <div class="demo-info" id="cm-info">TP=0  FP=0  TN=0  FN=0</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-confusion');
  var threshSlider = document.getElementById('cm-threshold');
  var threshVal = document.getElementById('cm-thresh-val');
  var infoEl = document.getElementById('cm-info');
  var W = 380, H = 340;
  var seed = 42;
  var pts, model, scores;

  function init() {
    pts = EV.genData(50, 50, seed);
    model = EV.trainLogistic(pts, 0.1, 800);
    scores = EV.scoreAll(model, pts);
  }

  function draw() {
    var ctx = EV.setupCanvas(canvas, W, H);
    var c = EV.getColors();
    var threshold = parseInt(threshSlider.value) / 100;
    threshVal.textContent = threshold.toFixed(2);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var pad = 45;
    var xR = [-4, 5], yR = [-4, 5];

    // Draw decision regions
    var res = 60;
    var cw = (W - 2 * pad) / res;
    var ch = (H - 2 * pad) / res;
    for (var i = 0; i < res; i++) {
      for (var j = 0; j < res; j++) {
        var px = xR[0] + (xR[1] - xR[0]) * (j + 0.5) / res;
        var py = yR[0] + (yR[1] - yR[0]) * (i + 0.5) / res;
        var prob = EV.predictProba(model, px, py);
        var pred = prob >= threshold ? 1 : 0;
        ctx.fillStyle = pred === 1 ? c.class1Light : c.class0Light;
        ctx.fillRect(pad + j * cw, H - pad - (i + 1) * ch, Math.ceil(cw), Math.ceil(ch));
      }
    }

    // Grid and border
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) {
      var x = pad + (W - 2 * pad) * i / 5;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H - pad); ctx.stroke();
      var y = pad + (H - 2 * pad) * i / 5;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);

    // Compute confusion matrix
    var cm = EV.confusionMatrix(scores, threshold);
    var met = EV.metrics(cm);

    // Draw points colored by TP/FP/TN/FN
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var s = scores[i];
      var pred = s.score >= threshold ? 1 : 0;
      var cx = pad + (p.x - xR[0]) / (xR[1] - xR[0]) * (W - 2 * pad);
      var cy = H - pad - (p.y - yR[0]) / (yR[1] - yR[0]) * (H - 2 * pad);

      var color;
      if (pred === 1 && p.label === 1) color = c.tp;
      else if (pred === 1 && p.label === 0) color = c.fp;
      else if (pred === 0 && p.label === 0) color = c.tn;
      else color = c.fn;

      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = c.bg;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Mark actual positives with a different shape
      if (p.label === 1) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Update confusion matrix display
    var tpEl = document.getElementById('cm-tp');
    var fpEl = document.getElementById('cm-fp');
    var tnEl = document.getElementById('cm-tn');
    var fnEl = document.getElementById('cm-fn');
    tpEl.textContent = cm.tp; tpEl.style.background = c.tpBg; tpEl.style.color = c.tp;
    fpEl.textContent = cm.fp; fpEl.style.background = c.fpBg; fpEl.style.color = c.fp;
    tnEl.textContent = cm.tn; tnEl.style.background = c.tnBg; tnEl.style.color = c.tn;
    fnEl.textContent = cm.fn; fnEl.style.background = c.fnBg; fnEl.style.color = c.fn;

    document.getElementById('cm-acc').textContent = met.accuracy.toFixed(3);
    document.getElementById('cm-prec').textContent = met.precision.toFixed(3);
    document.getElementById('cm-rec').textContent = met.recall.toFixed(3);

    infoEl.textContent = 'TP=' + cm.tp + '  FP=' + cm.fp + '  TN=' + cm.tn + '  FN=' + cm.fn + '  |  Total=' + pts.length;
  }

  threshSlider.addEventListener('input', draw);
  document.getElementById('cm-reset').addEventListener('click', function() {
    seed = Math.floor(Math.random() * 10000);
    init();
    draw();
  });
  init();
  draw();
  EV.observeTheme(draw);
})();
</script>

<div class="demo-hint">
Drag the <strong>threshold slider</strong> and watch the confusion matrix update in real-time. Notice how lowering the threshold catches more true positives but also increases false positives. Points are color-coded: <span style="color:#16a34a;font-weight:600;">TP</span>, <span style="color:#d97706;font-weight:600;">FP</span>, <span style="color:#2563eb;font-weight:600;">TN</span>, <span style="color:#e63946;font-weight:600;">FN</span>.
</div>

---

## 3. Precision, Recall, and F1 Score

From the confusion matrix, we derive the metrics that actually matter:

$$\text{Precision} = \frac{TP}{TP + FP}$$

Of all the items we **predicted positive**, how many were actually positive? High precision means few false alarms.

$$\text{Recall (Sensitivity)} = \frac{TP}{TP + FN}$$

Of all the items that **are actually positive**, how many did we catch? High recall means few missed positives.

$$F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

The harmonic mean of precision and recall. It penalizes models that sacrifice one for the other.

<div class="interactive-demo" id="demo-prf">
  <h4 style="margin-top:0">Precision-Recall Tradeoff</h4>
  <canvas id="canvas-prf" width="580" height="300"></canvas>
  <div class="demo-controls">
    <label>Threshold: <input type="range" id="prf-threshold" min="0" max="100" value="50" step="1"><span class="demo-value" id="prf-thresh-val">0.50</span></label>
  </div>
  <div class="demo-info" id="prf-info">Precision: 0.00 | Recall: 0.00 | F1: 0.00</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-prf');
  var slider = document.getElementById('prf-threshold');
  var valEl = document.getElementById('prf-thresh-val');
  var infoEl = document.getElementById('prf-info');
  var W = 580, H = 300;

  var pts = EV.genData(60, 60, 77);
  var model = EV.trainLogistic(pts, 0.1, 800);
  var scores = EV.scoreAll(model, pts);

  // Precompute metrics at all thresholds
  var allMetrics = [];
  for (var t = 0; t <= 100; t++) {
    var th = t / 100;
    var cm = EV.confusionMatrix(scores, th);
    var m = EV.metrics(cm);
    allMetrics.push({ t: th, p: m.precision, r: m.recall, f: m.f1 });
  }

  function draw() {
    var ctx = EV.setupCanvas(canvas, W, H);
    var c = EV.getColors();
    var threshold = parseInt(slider.value) / 100;
    valEl.textContent = threshold.toFixed(2);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var pad = 50;
    // Draw axes
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) {
      var x = pad + (W - 2 * pad) * i / 5;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H - pad); ctx.stroke();
      var y = pad + (H - 2 * pad) * i / 5;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);

    // Axis labels
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var i = 0; i <= 5; i++) {
      ctx.fillText((i * 0.2).toFixed(1), pad + (W - 2 * pad) * i / 5, H - pad + 16);
    }
    ctx.textAlign = 'right';
    for (var i = 0; i <= 5; i++) {
      ctx.fillText((i * 0.2).toFixed(1), pad - 8, H - pad - (H - 2 * pad) * i / 5 + 4);
    }
    ctx.fillStyle = c.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Threshold', W / 2, H - 8);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Score', 0, 0);
    ctx.restore();

    var pw = W - 2 * pad;
    var ph = H - 2 * pad;

    // Draw precision curve
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i < allMetrics.length; i++) {
      var x = pad + allMetrics[i].t * pw;
      var y = H - pad - allMetrics[i].p * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw recall curve
    ctx.strokeStyle = c.class1;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i < allMetrics.length; i++) {
      var x = pad + allMetrics[i].t * pw;
      var y = H - pad - allMetrics[i].r * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw F1 curve
    ctx.strokeStyle = c.green;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    for (var i = 0; i < allMetrics.length; i++) {
      var x = pad + allMetrics[i].t * pw;
      var y = H - pad - allMetrics[i].f * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Current threshold line
    var tx = pad + threshold * pw;
    ctx.strokeStyle = c.text;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(tx, pad); ctx.lineTo(tx, H - pad); ctx.stroke();
    ctx.setLineDash([]);

    // Current values
    var idx = Math.round(threshold * 100);
    if (idx > 100) idx = 100;
    var cur = allMetrics[idx];

    // Dots on curves
    var dotSize = 6;
    ctx.beginPath();
    ctx.arc(tx, H - pad - cur.p * ph, dotSize, 0, Math.PI * 2);
    ctx.fillStyle = c.accent; ctx.fill();
    ctx.beginPath();
    ctx.arc(tx, H - pad - cur.r * ph, dotSize, 0, Math.PI * 2);
    ctx.fillStyle = c.class1; ctx.fill();
    ctx.beginPath();
    ctx.arc(tx, H - pad - cur.f * ph, dotSize, 0, Math.PI * 2);
    ctx.fillStyle = c.green; ctx.fill();

    // Legend
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    var ly = pad + 12;
    ctx.fillStyle = c.accent;
    ctx.fillRect(pad + 8, ly - 5, 16, 3); ctx.fillText('Precision', pad + 28, ly);
    ctx.fillStyle = c.class1;
    ctx.fillRect(pad + 8, ly + 13, 16, 3); ctx.fillText('Recall', pad + 28, ly + 18);
    ctx.fillStyle = c.green;
    ctx.setLineDash([3, 2]); ctx.strokeStyle = c.green; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pad + 8, ly + 30); ctx.lineTo(pad + 24, ly + 30); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('F1', pad + 28, ly + 34);

    infoEl.textContent = 'Precision: ' + cur.p.toFixed(3) + ' | Recall: ' + cur.r.toFixed(3) + ' | F1: ' + cur.f.toFixed(3);
  }

  slider.addEventListener('input', draw);
  draw();
  EV.observeTheme(draw);
})();
</script>

<div class="demo-hint">
As you raise the threshold, <strong style="color:#2563eb;">precision</strong> tends to increase (fewer false positives) while <strong style="color:#e63946;">recall</strong> drops (more false negatives). The <strong style="color:#16a34a;">F1 score</strong> peaks where they balance.
</div>

---

## 4. ROC Curve and AUC

The **Receiver Operating Characteristic (ROC)** curve plots True Positive Rate (recall) against False Positive Rate across all thresholds. It answers: "How well does the model separate the two classes?"

$$\text{TPR} = \frac{TP}{TP + FN} \quad\quad \text{FPR} = \frac{FP}{FP + TN}$$

The **Area Under the Curve (AUC)** summarizes this into a single number. AUC = 1.0 is a perfect classifier; AUC = 0.5 is random guessing.

<div class="interactive-demo" id="demo-roc">
  <h4 style="margin-top:0">ROC Curve Explorer</h4>
  <div class="demo-split">
    <div>
      <canvas id="canvas-roc" width="360" height="360"></canvas>
      <div class="demo-caption">ROC Curve</div>
    </div>
    <div>
      <canvas id="canvas-roc-scatter" width="360" height="360"></canvas>
      <div class="demo-caption">Score distributions by class</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Threshold: <input type="range" id="roc-threshold" min="0" max="100" value="50" step="1"><span class="demo-value" id="roc-thresh-val">0.50</span></label>
    <label>Model quality: <input type="range" id="roc-quality" min="1" max="10" value="5" step="1"><span class="demo-value" id="roc-quality-val">5</span></label>
  </div>
  <div class="demo-info" id="roc-info">AUC: 0.000 | TPR: 0.000 | FPR: 0.000</div>
</div>

<script>
(function() {
  var canvasROC = document.getElementById('canvas-roc');
  var canvasScatter = document.getElementById('canvas-roc-scatter');
  var threshSlider = document.getElementById('roc-threshold');
  var qualSlider = document.getElementById('roc-quality');
  var threshVal = document.getElementById('roc-thresh-val');
  var qualVal = document.getElementById('roc-quality-val');
  var infoEl = document.getElementById('roc-info');
  var WR = 360, HR = 360;

  var scores, rocPts, auc;

  function generateScores() {
    var q = parseInt(qualSlider.value);
    qualVal.textContent = q;
    var rng = EV.mulberry32(42);
    scores = [];
    var sep = q * 0.3;
    // Negative class scores: centered low
    for (var i = 0; i < 100; i++) {
      var s = 0.3 - sep * 0.15 + (rng() + rng() + rng() - 1.5) * 0.25;
      s = Math.max(0, Math.min(1, s));
      scores.push({ score: s, label: 0 });
    }
    // Positive class scores: centered high
    for (var i = 0; i < 100; i++) {
      var s = 0.7 + sep * 0.15 + (rng() + rng() + rng() - 1.5) * 0.25;
      s = Math.max(0, Math.min(1, s));
      scores.push({ score: s, label: 1 });
    }
    rocPts = EV.rocCurve(scores);
    auc = EV.computeAUC(rocPts);
  }

  function drawROC() {
    var ctx = EV.setupCanvas(canvasROC, WR, HR);
    var c = EV.getColors();
    var threshold = parseInt(threshSlider.value) / 100;
    threshVal.textContent = threshold.toFixed(2);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, WR, HR);

    var pad = EV.drawAxes(ctx, WR, HR, c, 'FPR', 'TPR', [0, 1], [0, 1]);
    var pw = WR - 2 * pad, ph = HR - 2 * pad;

    // Fill AUC area
    ctx.beginPath();
    ctx.moveTo(pad, HR - pad);
    for (var i = 0; i < rocPts.length; i++) {
      var x = pad + rocPts[i].fpr * pw;
      var y = HR - pad - rocPts[i].tpr * ph;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(pad + pw, HR - pad);
    ctx.closePath();
    ctx.fillStyle = c.auc;
    ctx.fill();

    // Random classifier diagonal
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pad, HR - pad);
    ctx.lineTo(pad + pw, pad);
    ctx.stroke();
    ctx.setLineDash([]);

    // ROC curve
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i < rocPts.length; i++) {
      var x = pad + rocPts[i].fpr * pw;
      var y = HR - pad - rocPts[i].tpr * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current threshold point on ROC
    var cm = EV.confusionMatrix(scores, threshold);
    var met = EV.metrics(cm);
    var cx = pad + met.fpr * pw;
    var cy = HR - pad - met.recall * ph;
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fillStyle = c.class1;
    ctx.fill();
    ctx.strokeStyle = c.bg;
    ctx.lineWidth = 2;
    ctx.stroke();

    // AUC label
    ctx.fillStyle = c.text;
    ctx.font = 'bold 13px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AUC = ' + auc.toFixed(3), WR / 2, HR / 2 + 20);

    infoEl.textContent = 'AUC: ' + auc.toFixed(3) + ' | TPR: ' + met.recall.toFixed(3) + ' | FPR: ' + met.fpr.toFixed(3);
  }

  function drawScatter() {
    var ctx = EV.setupCanvas(canvasScatter, WR, HR);
    var c = EV.getColors();
    var threshold = parseInt(threshSlider.value) / 100;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, WR, HR);

    var pad = 50;
    var pw = WR - 2 * pad;
    var ph = HR - 2 * pad;

    // Axes
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, pw, ph);
    ctx.fillStyle = c.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Predicted Score', WR / 2, HR - 10);

    // Tick labels
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    for (var i = 0; i <= 5; i++) {
      var v = i * 0.2;
      var x = pad + v * pw;
      ctx.fillText(v.toFixed(1), x, HR - pad + 16);
      ctx.strokeStyle = c.grid; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, HR - pad); ctx.stroke();
    }

    // Labels for rows
    ctx.fillStyle = c.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Negative', pad - 8, pad + ph * 0.25 + 4);
    ctx.fillText('Positive', pad - 8, pad + ph * 0.75 + 4);

    // Threshold line
    var tx = pad + threshold * pw;
    ctx.strokeStyle = c.text;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(tx, pad); ctx.lineTo(tx, HR - pad); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.text;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('t=' + threshold.toFixed(2), tx, pad - 5);

    // Draw score distributions as jittered dots
    var rng = EV.mulberry32(123);
    for (var i = 0; i < scores.length; i++) {
      var s = scores[i];
      var x = pad + s.score * pw;
      var baseY = s.label === 0 ? pad + ph * 0.25 : pad + ph * 0.75;
      var jitter = (rng() - 0.5) * ph * 0.18;
      var y = baseY + jitter;
      var pred = s.score >= threshold ? 1 : 0;

      var color;
      if (pred === 1 && s.label === 1) color = c.tp;
      else if (pred === 1 && s.label === 0) color = c.fp;
      else if (pred === 0 && s.label === 0) color = c.tn;
      else color = c.fn;

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Shade regions
    ctx.fillStyle = c.class1Light;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(tx, pad, pad + pw - tx, ph);
    ctx.globalAlpha = 1;
  }

  function drawAll() {
    drawROC();
    drawScatter();
  }

  threshSlider.addEventListener('input', drawAll);
  qualSlider.addEventListener('input', function() {
    generateScores();
    drawAll();
  });

  generateScores();
  drawAll();
  EV.observeTheme(drawAll);
})();
</script>

<div class="demo-hint">
Drag <strong>threshold</strong> to trace along the ROC curve. Adjust <strong>model quality</strong> to see how better separation between class score distributions creates a more bowed-out ROC (higher AUC). The right panel shows where the threshold cuts through the score distributions.
</div>

---

## 5. Precision-Recall Curve

On imbalanced datasets, the ROC curve can be **overly optimistic**. Because there are many true negatives, the FPR stays low even with many false positives. The **Precision-Recall curve** focuses only on the positive class, making it more informative when positives are rare.

<div class="interactive-demo" id="demo-pr">
  <h4 style="margin-top:0">PR Curve vs ROC: Imbalanced Data</h4>
  <div class="demo-split">
    <div>
      <canvas id="canvas-pr-roc" width="360" height="340"></canvas>
      <div class="demo-caption">ROC Curve</div>
    </div>
    <div>
      <canvas id="canvas-pr-pr" width="360" height="340"></canvas>
      <div class="demo-caption">Precision-Recall Curve</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Threshold: <input type="range" id="pr-threshold" min="0" max="100" value="50" step="1"><span class="demo-value" id="pr-thresh-val">0.50</span></label>
    <label>Imbalance (% positive): <input type="range" id="pr-imbalance" min="2" max="50" value="5" step="1"><span class="demo-value" id="pr-imb-val">5%</span></label>
  </div>
  <div class="demo-info" id="pr-info">ROC AUC: 0.000 | Precision: 0.000 | Recall: 0.000</div>
</div>

<script>
(function() {
  var canvasROC = document.getElementById('canvas-pr-roc');
  var canvasPR = document.getElementById('canvas-pr-pr');
  var threshSlider = document.getElementById('pr-threshold');
  var imbSlider = document.getElementById('pr-imbalance');
  var threshVal = document.getElementById('pr-thresh-val');
  var imbVal = document.getElementById('pr-imb-val');
  var infoEl = document.getElementById('pr-info');
  var W = 360, H = 340;

  var scores, rocPts, prPts, aucVal;

  function generateScores() {
    var posRatio = parseInt(imbSlider.value) / 100;
    imbVal.textContent = imbSlider.value + '%';
    var rng = EV.mulberry32(55);
    var n = 400;
    var nPos = Math.round(n * posRatio);
    var nNeg = n - nPos;
    scores = [];
    for (var i = 0; i < nNeg; i++) {
      var s = 0.3 + (rng() + rng() - 1) * 0.25;
      s = Math.max(0.01, Math.min(0.99, s));
      scores.push({ score: s, label: 0 });
    }
    for (var i = 0; i < nPos; i++) {
      var s = 0.65 + (rng() + rng() - 1) * 0.25;
      s = Math.max(0.01, Math.min(0.99, s));
      scores.push({ score: s, label: 1 });
    }
    rocPts = EV.rocCurve(scores);
    prPts = EV.prCurve(scores);
    aucVal = EV.computeAUC(rocPts);
  }

  function drawROC() {
    var ctx = EV.setupCanvas(canvasROC, W, H);
    var c = EV.getColors();
    var threshold = parseInt(threshSlider.value) / 100;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    var pad = EV.drawAxes(ctx, W, H, c, 'FPR', 'TPR', [0, 1], [0, 1]);
    var pw = W - 2 * pad, ph = H - 2 * pad;

    // AUC fill
    ctx.beginPath();
    ctx.moveTo(pad, H - pad);
    for (var i = 0; i < rocPts.length; i++) {
      ctx.lineTo(pad + rocPts[i].fpr * pw, H - pad - rocPts[i].tpr * ph);
    }
    ctx.lineTo(pad + pw, H - pad);
    ctx.closePath();
    ctx.fillStyle = c.auc;
    ctx.fill();

    // Diagonal
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(pad, H - pad); ctx.lineTo(pad + pw, pad); ctx.stroke();
    ctx.setLineDash([]);

    // ROC curve
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i < rocPts.length; i++) {
      var x = pad + rocPts[i].fpr * pw, y = H - pad - rocPts[i].tpr * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current point
    var cm = EV.confusionMatrix(scores, threshold);
    var met = EV.metrics(cm);
    ctx.beginPath();
    ctx.arc(pad + met.fpr * pw, H - pad - met.recall * ph, 6, 0, Math.PI * 2);
    ctx.fillStyle = c.class1; ctx.fill();

    ctx.fillStyle = c.text;
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AUC = ' + aucVal.toFixed(3), W / 2, H / 2 + 20);
  }

  function drawPR() {
    var ctx = EV.setupCanvas(canvasPR, W, H);
    var c = EV.getColors();
    var threshold = parseInt(threshSlider.value) / 100;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    var pad = EV.drawAxes(ctx, W, H, c, 'Recall', 'Precision', [0, 1], [0, 1]);
    var pw = W - 2 * pad, ph = H - 2 * pad;

    // PR curve
    ctx.strokeStyle = c.green;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    var started = false;
    for (var i = 0; i < prPts.length; i++) {
      var x = pad + prPts[i].recall * pw;
      var y = H - pad - prPts[i].precision * ph;
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Baseline: ratio of positives
    var posRatio = parseInt(imbSlider.value) / 100;
    var by = H - pad - posRatio * ph;
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(pad, by); ctx.lineTo(pad + pw, by); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.textMuted;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('random baseline', pad + 5, by - 5);

    // Current point
    var cm = EV.confusionMatrix(scores, threshold);
    var met = EV.metrics(cm);
    if (cm.tp + cm.fp > 0) {
      ctx.beginPath();
      ctx.arc(pad + met.recall * pw, H - pad - met.precision * ph, 6, 0, Math.PI * 2);
      ctx.fillStyle = c.class1; ctx.fill();
    }

    infoEl.textContent = 'ROC AUC: ' + aucVal.toFixed(3) + ' | Precision: ' + met.precision.toFixed(3) + ' | Recall: ' + met.recall.toFixed(3);
  }

  function drawAll() {
    threshVal.textContent = (parseInt(threshSlider.value) / 100).toFixed(2);
    drawROC();
    drawPR();
  }

  threshSlider.addEventListener('input', drawAll);
  imbSlider.addEventListener('input', function() { generateScores(); drawAll(); });
  generateScores();
  drawAll();
  EV.observeTheme(drawAll);
})();
</script>

<div class="demo-hint">
Set imbalance to <strong>5%</strong> and notice the ROC still looks great (high AUC), but the PR curve reveals the model struggles, precision drops sharply as recall increases. The PR curve is more honest about performance on the minority class.
</div>

---

## 6. Threshold Selection by Use Case

The "best" threshold depends on the **cost of errors**. A medical test should minimize false negatives (catch all sick patients), while a spam filter should minimize false positives (never block real email).

<div class="interactive-demo" id="demo-usecase">
  <h4 style="margin-top:0">Threshold Selection: What's the Cost?</h4>
  <canvas id="canvas-usecase" width="580" height="320"></canvas>
  <div class="demo-controls">
    <label>Use case:
      <select id="uc-select" style="padding:0.3rem;border-radius:4px;border:1px solid var(--border);background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
        <option value="balanced">Balanced (equal cost)</option>
        <option value="medical">Medical Screening (minimize FN)</option>
        <option value="spam">Spam Filter (minimize FP)</option>
        <option value="fraud">Fraud Detection (high recall)</option>
      </select>
    </label>
    <label>FN cost: <input type="range" id="uc-fn-cost" min="1" max="20" value="1" step="1"><span class="demo-value" id="uc-fn-val">1</span></label>
    <label>FP cost: <input type="range" id="uc-fp-cost" min="1" max="20" value="1" step="1"><span class="demo-value" id="uc-fp-val">1</span></label>
  </div>
  <div class="demo-info" id="uc-info">Optimal threshold: 0.50 | Total cost: 0</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-usecase');
  var selectEl = document.getElementById('uc-select');
  var fnSlider = document.getElementById('uc-fn-cost');
  var fpSlider = document.getElementById('uc-fp-cost');
  var fnVal = document.getElementById('uc-fn-val');
  var fpVal = document.getElementById('uc-fp-val');
  var infoEl = document.getElementById('uc-info');
  var W = 580, H = 320;

  var pts = EV.genData(60, 60, 88);
  var model = EV.trainLogistic(pts, 0.1, 800);
  var scores = EV.scoreAll(model, pts);

  var presets = {
    balanced: { fn: 1, fp: 1 },
    medical: { fn: 15, fp: 1 },
    spam: { fn: 1, fp: 10 },
    fraud: { fn: 10, fp: 1 }
  };

  selectEl.addEventListener('change', function() {
    var p = presets[selectEl.value];
    fnSlider.value = p.fn; fpSlider.value = p.fp;
    fnVal.textContent = p.fn; fpVal.textContent = p.fp;
    draw();
  });

  function draw() {
    var ctx = EV.setupCanvas(canvas, W, H);
    var c = EV.getColors();
    var fnCost = parseInt(fnSlider.value);
    var fpCost = parseInt(fpSlider.value);
    fnVal.textContent = fnCost;
    fpVal.textContent = fpCost;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var pad = 50;
    var pw = W - 2 * pad, ph = H - 2 * pad;

    // Compute total cost at each threshold
    var costs = [];
    var minCost = Infinity, bestT = 0.5;
    for (var t = 0; t <= 100; t++) {
      var th = t / 100;
      var cm = EV.confusionMatrix(scores, th);
      var cost = cm.fn * fnCost + cm.fp * fpCost;
      costs.push({ t: th, cost: cost });
      if (cost < minCost) { minCost = cost; bestT = th; }
    }

    var maxCost = 0;
    for (var i = 0; i < costs.length; i++) {
      if (costs[i].cost > maxCost) maxCost = costs[i].cost;
    }
    if (maxCost === 0) maxCost = 1;

    // Axes
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) {
      var x = pad + pw * i / 5;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H - pad); ctx.stroke();
      var y = pad + ph * i / 5;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, pw, ph);

    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var i = 0; i <= 5; i++) {
      ctx.fillText((i * 0.2).toFixed(1), pad + pw * i / 5, H - pad + 16);
    }
    ctx.textAlign = 'right';
    for (var i = 0; i <= 5; i++) {
      var v = maxCost * (1 - i / 5);
      ctx.fillText(Math.round(v).toString(), pad - 8, pad + ph * i / 5 + 4);
    }
    ctx.fillStyle = c.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Threshold', W / 2, H - 8);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Total Cost', 0, 0);
    ctx.restore();

    // Cost curve
    ctx.strokeStyle = c.class1;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i < costs.length; i++) {
      var x = pad + costs[i].t * pw;
      var y = H - pad - (costs[i].cost / maxCost) * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // FN cost component
    ctx.strokeStyle = c.fn;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (var t = 0; t <= 100; t++) {
      var th = t / 100;
      var cm = EV.confusionMatrix(scores, th);
      var x = pad + th * pw;
      var y = H - pad - (cm.fn * fnCost / maxCost) * ph;
      if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // FP cost component
    ctx.strokeStyle = c.fp;
    ctx.beginPath();
    for (var t = 0; t <= 100; t++) {
      var th = t / 100;
      var cm = EV.confusionMatrix(scores, th);
      var x = pad + th * pw;
      var y = H - pad - (cm.fp * fpCost / maxCost) * ph;
      if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Optimal threshold marker
    var bx = pad + bestT * pw;
    ctx.strokeStyle = c.green;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(bx, pad); ctx.lineTo(bx, H - pad); ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(bx, H - pad - (minCost / maxCost) * ph, 7, 0, Math.PI * 2);
    ctx.fillStyle = c.green;
    ctx.fill();

    // Legend
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    var lx = pad + 10, ly = pad + 15;
    ctx.fillStyle = c.class1;
    ctx.fillRect(lx, ly - 4, 14, 3);
    ctx.fillStyle = c.text;
    ctx.fillText('Total cost', lx + 18, ly);
    ctx.strokeStyle = c.fn; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(lx, ly + 14); ctx.lineTo(lx + 14, ly + 14); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('FN cost', lx + 18, ly + 18);
    ctx.strokeStyle = c.fp; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(lx, ly + 30); ctx.lineTo(lx + 14, ly + 30); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('FP cost', lx + 18, ly + 34);
    ctx.fillStyle = c.green;
    ctx.fillRect(lx, ly + 44, 14, 3);
    ctx.fillStyle = c.text;
    ctx.fillText('Optimal (t=' + bestT.toFixed(2) + ')', lx + 18, ly + 48);

    infoEl.textContent = 'Optimal threshold: ' + bestT.toFixed(2) + ' | Min total cost: ' + minCost + ' | FN cost weight: ' + fnCost + ' | FP cost weight: ' + fpCost;
  }

  fnSlider.addEventListener('input', draw);
  fpSlider.addEventListener('input', draw);
  draw();
  EV.observeTheme(draw);
})();
</script>

<div class="demo-hint">
Select a <strong>use case</strong> preset or manually adjust the FN/FP cost sliders. For medical screening, the high FN cost pushes the optimal threshold lower (predict positive more often). For spam filtering, the high FP cost pushes the threshold higher (only flag clear spam).
</div>

---

## 7. K-Fold Cross-Validation

Evaluating on a single train/test split is risky, you might get lucky (or unlucky) with the split. **K-Fold Cross-Validation** provides a more robust estimate by using every data point for both training and validation.

The algorithm:
1. Split data into \\(K\\) equal folds
2. For each fold \\(i\\): train on all folds except \\(i\\), validate on fold \\(i\\)
3. Average the \\(K\\) validation scores

<div class="interactive-demo" id="demo-kfold">
  <h4 style="margin-top:0">K-Fold Cross-Validation Animation</h4>
  <canvas id="canvas-kfold" width="580" height="380"></canvas>
  <div class="demo-controls">
    <label>K folds: <input type="range" id="kf-k" min="2" max="10" value="5" step="1"><span class="demo-value" id="kf-k-val">5</span></label>
    <button id="kf-play">Animate</button>
    <button id="kf-reset">Reset</button>
  </div>
  <div class="demo-info" id="kf-info">Click "Animate" to see K-Fold in action</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-kfold');
  var kSlider = document.getElementById('kf-k');
  var kVal = document.getElementById('kf-k-val');
  var playBtn = document.getElementById('kf-play');
  var resetBtn = document.getElementById('kf-reset');
  var infoEl = document.getElementById('kf-info');
  var W = 580, H = 380;

  var animState = { fold: -1, animating: false, scores: [], timer: null };

  // Generate synthetic accuracy scores per fold
  function genFoldScores(K, seed) {
    var rng = EV.mulberry32(seed || 42);
    var sc = [];
    var base = 0.78 + rng() * 0.1;
    for (var i = 0; i < K; i++) {
      sc.push(base + (rng() - 0.5) * 0.12);
    }
    return sc;
  }

  function draw() {
    var ctx = EV.setupCanvas(canvas, W, H);
    var c = EV.getColors();
    var K = parseInt(kSlider.value);
    kVal.textContent = K;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var pad = 30;
    var topArea = 220;
    var barH = Math.min(28, (topArea - 60) / K - 4);
    var barW = W - 2 * pad - 80;
    var startY = pad + 30;

    // Title
    ctx.fillStyle = c.text;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Data Splits (K = ' + K + ')', pad, pad + 15);

    // Draw fold bars
    for (var i = 0; i < K; i++) {
      var y = startY + i * (barH + 4);
      var foldW = barW / K;

      // Label
      ctx.fillStyle = c.textMuted;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('Fold ' + (i + 1), pad + 45, y + barH / 2 + 4);

      for (var j = 0; j < K; j++) {
        var x = pad + 50 + j * foldW;
        var isVal = (j === i);
        var isActive = (animState.fold >= i);
        var isCurrent = (animState.fold === i);

        if (isActive || !animState.animating) {
          if (isVal) {
            ctx.fillStyle = isCurrent ? c.foldVal : (animState.fold > i ? c.foldVal : c.foldValBg);
            if (!animState.animating) ctx.fillStyle = c.foldValBg;
          } else {
            ctx.fillStyle = isCurrent ? c.fold : (animState.fold > i ? c.fold : c.foldBg);
            if (!animState.animating) ctx.fillStyle = c.foldBg;
          }
        } else {
          ctx.fillStyle = c.bgSecondary;
        }

        ctx.beginPath();
        var r = 3;
        var bx = x + 1, by = y, bw = foldW - 2, bh = barH;
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + bw - r, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
        ctx.lineTo(bx + bw, by + bh - r);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
        ctx.lineTo(bx + r, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.fill();

        if (isCurrent && isVal) {
          ctx.strokeStyle = c.foldVal;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Show score if computed
      if (animState.fold >= i && animState.scores[i] !== undefined) {
        ctx.fillStyle = c.text;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText((animState.scores[i] * 100).toFixed(1) + '%', pad + 55 + barW, y + barH / 2 + 4);
      }
    }

    // Legend
    var ly = startY + K * (barH + 4) + 10;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.fold;
    ctx.fillRect(pad + 50, ly, 16, 10);
    ctx.fillStyle = c.text;
    ctx.fillText('Training', pad + 70, ly + 9);
    ctx.fillStyle = c.foldVal;
    ctx.fillRect(pad + 150, ly, 16, 10);
    ctx.fillStyle = c.text;
    ctx.fillText('Validation', pad + 170, ly + 9);

    // Results section
    var resY = topArea + 30;
    if (animState.scores.length > 0) {
      ctx.fillStyle = c.text;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Results', pad, resY);

      // Draw bar chart of fold scores
      var chartPad = 60;
      var chartW = W - 2 * pad - chartPad;
      var chartH = H - resY - 50;
      var chartY = resY + 20;

      // Y axis
      ctx.strokeStyle = c.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad + chartPad, chartY);
      ctx.lineTo(pad + chartPad, chartY + chartH);
      ctx.lineTo(pad + chartPad + chartW, chartY + chartH);
      ctx.stroke();

      // Y ticks
      ctx.fillStyle = c.textMuted;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      for (var i = 0; i <= 4; i++) {
        var v = 0.6 + i * 0.1;
        var yy = chartY + chartH - (v - 0.6) / 0.4 * chartH;
        ctx.fillText(v.toFixed(1), pad + chartPad - 5, yy + 3);
        ctx.strokeStyle = c.grid;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(pad + chartPad, yy); ctx.lineTo(pad + chartPad + chartW, yy); ctx.stroke();
      }

      var nScores = animState.scores.length;
      var bw = Math.min(40, chartW / nScores - 8);
      for (var i = 0; i < nScores; i++) {
        var sc = animState.scores[i];
        var x = pad + chartPad + (i + 0.5) * (chartW / K) - bw / 2;
        var barHeight = (sc - 0.6) / 0.4 * chartH;
        barHeight = Math.max(2, barHeight);
        var y = chartY + chartH - barHeight;

        ctx.fillStyle = (i === animState.fold) ? c.foldVal : c.fold;
        ctx.beginPath();
        var rr = 3;
        ctx.moveTo(x + rr, y);
        ctx.lineTo(x + bw - rr, y);
        ctx.quadraticCurveTo(x + bw, y, x + bw, y + rr);
        ctx.lineTo(x + bw, chartY + chartH);
        ctx.lineTo(x, chartY + chartH);
        ctx.lineTo(x, y + rr);
        ctx.quadraticCurveTo(x, y, x + rr, y);
        ctx.fill();

        ctx.fillStyle = c.text;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('F' + (i + 1), x + bw / 2, chartY + chartH + 14);
      }

      // Mean line
      if (nScores > 1) {
        var sum = 0;
        for (var i = 0; i < nScores; i++) sum += animState.scores[i];
        var mean = sum / nScores;
        var meanY = chartY + chartH - (mean - 0.6) / 0.4 * chartH;
        ctx.strokeStyle = c.green;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(pad + chartPad, meanY);
        ctx.lineTo(pad + chartPad + chartW, meanY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = c.green;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Mean = ' + (mean * 100).toFixed(1) + '%', pad + chartPad + chartW + 5, meanY + 4);

        // Std
        var sqSum = 0;
        for (var i = 0; i < nScores; i++) sqSum += (animState.scores[i] - mean) * (animState.scores[i] - mean);
        var std = Math.sqrt(sqSum / nScores);
        infoEl.textContent = 'Mean accuracy: ' + (mean * 100).toFixed(1) + '% +/- ' + (std * 100).toFixed(1) + '% (computed over ' + nScores + ' folds)';
      }
    }
  }

  function startAnimation() {
    if (animState.animating) return;
    var K = parseInt(kSlider.value);
    var foldScores = genFoldScores(K, 42);
    animState = { fold: -1, animating: true, scores: [], timer: null };
    draw();

    var step = 0;
    animState.timer = setInterval(function() {
      if (step >= K) {
        clearInterval(animState.timer);
        animState.animating = false;
        draw();
        return;
      }
      animState.fold = step;
      animState.scores.push(foldScores[step]);
      draw();
      step++;
    }, 800);
  }

  playBtn.addEventListener('click', startAnimation);
  resetBtn.addEventListener('click', function() {
    if (animState.timer) clearInterval(animState.timer);
    animState = { fold: -1, animating: false, scores: [], timer: null };
    infoEl.textContent = 'Click "Animate" to see K-Fold in action';
    draw();
  });
  kSlider.addEventListener('input', function() {
    if (animState.timer) clearInterval(animState.timer);
    animState = { fold: -1, animating: false, scores: [], timer: null };
    infoEl.textContent = 'Click "Animate" to see K-Fold in action';
    draw();
  });
  draw();
  EV.observeTheme(draw);
})();
</script>

<div class="demo-hint">
Adjust <strong>K</strong> and click <strong>Animate</strong>. Each fold takes turns as the validation set (orange). The bar chart accumulates accuracy scores and shows their mean. Higher K means more computation but lower variance in the estimate.
</div>

---

## 8. Stratified K-Fold

Regular K-Fold can produce folds with different class proportions, especially on imbalanced data. **Stratified K-Fold** ensures each fold has approximately the same class distribution as the full dataset.

<div class="interactive-demo" id="demo-stratified">
  <h4 style="margin-top:0">Stratified vs Regular K-Fold</h4>
  <div class="demo-split">
    <div>
      <canvas id="canvas-regular-kf" width="360" height="300"></canvas>
      <div class="demo-caption">Regular K-Fold</div>
    </div>
    <div>
      <canvas id="canvas-stratified-kf" width="360" height="300"></canvas>
      <div class="demo-caption">Stratified K-Fold</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>K folds: <input type="range" id="strat-k" min="3" max="8" value="5" step="1"><span class="demo-value" id="strat-k-val">5</span></label>
    <label>Positive ratio: <input type="range" id="strat-ratio" min="5" max="50" value="15" step="5"><span class="demo-value" id="strat-ratio-val">15%</span></label>
    <button id="strat-reshuffle">Reshuffle</button>
  </div>
  <div class="demo-info" id="strat-info">Compare class proportions in each fold</div>
</div>

<script>
(function() {
  var canvasReg = document.getElementById('canvas-regular-kf');
  var canvasStrat = document.getElementById('canvas-stratified-kf');
  var kSlider = document.getElementById('strat-k');
  var ratioSlider = document.getElementById('strat-ratio');
  var kVal = document.getElementById('strat-k-val');
  var ratioVal = document.getElementById('strat-ratio-val');
  var infoEl = document.getElementById('strat-info');
  var W = 360, H = 300;
  var seed = 42;

  function drawFolds(canvas, folds, K, c, title) {
    var ctx = EV.setupCanvas(canvas, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var pad = 30;
    var barH = Math.min(30, (H - 2 * pad - 40) / K - 6);
    var barW = W - 2 * pad - 60;

    ctx.fillStyle = c.text;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, pad, pad + 10);

    for (var i = 0; i < K; i++) {
      var y = pad + 25 + i * (barH + 6);
      var fold = folds[i];
      var nPos = 0, nNeg = 0;
      for (var j = 0; j < fold.length; j++) {
        if (fold[j] === 1) nPos++; else nNeg++;
      }
      var total = fold.length;
      var posRatio = nPos / total;

      // Label
      ctx.fillStyle = c.textMuted;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('F' + (i + 1), pad + 18, y + barH / 2 + 3);

      // Negative portion
      var negW = (nNeg / total) * barW;
      ctx.fillStyle = c.class0;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.roundRect(pad + 22, y, negW, barH, [3, 0, 0, 3]);
      ctx.fill();

      // Positive portion
      ctx.fillStyle = c.class1;
      ctx.beginPath();
      ctx.roundRect(pad + 22 + negW, y, barW - negW, barH, [0, 3, 3, 0]);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Percentage label
      ctx.fillStyle = c.text;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText((posRatio * 100).toFixed(0) + '% +', pad + 26 + barW, y + barH / 2 + 3);
    }

    // Legend
    var ly = pad + 25 + K * (barH + 6) + 10;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = c.class0;
    ctx.fillRect(pad + 22, ly, 12, 10);
    ctx.fillStyle = c.class1;
    ctx.fillRect(pad + 80, ly, 12, 10);
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.text;
    ctx.fillText('Neg', pad + 38, ly + 9);
    ctx.fillText('Pos', pad + 96, ly + 9);
  }

  function draw() {
    var c = EV.getColors();
    var K = parseInt(kSlider.value);
    var posRatio = parseInt(ratioSlider.value) / 100;
    kVal.textContent = K;
    ratioVal.textContent = ratioSlider.value + '%';

    var n = 100;
    var nPos = Math.round(n * posRatio);
    var nNeg = n - nPos;
    var labels = [];
    for (var i = 0; i < nNeg; i++) labels.push(0);
    for (var i = 0; i < nPos; i++) labels.push(1);

    // Shuffle for regular K-Fold
    var rng = EV.mulberry32(seed);
    var shuffled = labels.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }

    // Regular K-Fold: split sequentially
    var regularFolds = [];
    var foldSize = Math.floor(n / K);
    for (var i = 0; i < K; i++) {
      var start = i * foldSize;
      var end = (i === K - 1) ? n : start + foldSize;
      regularFolds.push(shuffled.slice(start, end));
    }

    // Stratified K-Fold: split each class separately
    var posIndices = [], negIndices = [];
    for (var i = 0; i < labels.length; i++) {
      if (labels[i] === 1) posIndices.push(1); else negIndices.push(0);
    }
    // Shuffle each class
    for (var i = posIndices.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = posIndices[i]; posIndices[i] = posIndices[j]; posIndices[j] = tmp;
    }
    for (var i = negIndices.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = negIndices[i]; negIndices[i] = negIndices[j]; negIndices[j] = tmp;
    }

    var stratFolds = [];
    for (var i = 0; i < K; i++) stratFolds.push([]);
    var pi = 0, ni = 0;
    for (var i = 0; i < K; i++) {
      var nPosPerFold = Math.floor(posIndices.length / K);
      var nNegPerFold = Math.floor(negIndices.length / K);
      if (i === K - 1) {
        nPosPerFold = posIndices.length - pi;
        nNegPerFold = negIndices.length - ni;
      }
      for (var j = 0; j < nNegPerFold && ni < negIndices.length; j++) {
        stratFolds[i].push(negIndices[ni++]);
      }
      for (var j = 0; j < nPosPerFold && pi < posIndices.length; j++) {
        stratFolds[i].push(posIndices[pi++]);
      }
    }

    drawFolds(canvasReg, regularFolds, K, c, 'Regular K-Fold');
    drawFolds(canvasStrat, stratFolds, K, c, 'Stratified K-Fold');

    // Compute variance in positive ratios
    var regVars = [], stratVars = [];
    for (var i = 0; i < K; i++) {
      var rp = 0, sp = 0;
      for (var j = 0; j < regularFolds[i].length; j++) rp += regularFolds[i][j];
      for (var j = 0; j < stratFolds[i].length; j++) sp += stratFolds[i][j];
      regVars.push(rp / regularFolds[i].length);
      stratVars.push(sp / stratFolds[i].length);
    }
    var regMean = 0, stratMean = 0;
    for (var i = 0; i < K; i++) { regMean += regVars[i]; stratMean += stratVars[i]; }
    regMean /= K; stratMean /= K;
    var regStd = 0, stratStd = 0;
    for (var i = 0; i < K; i++) {
      regStd += (regVars[i] - regMean) * (regVars[i] - regMean);
      stratStd += (stratVars[i] - stratMean) * (stratVars[i] - stratMean);
    }
    regStd = Math.sqrt(regStd / K) * 100;
    stratStd = Math.sqrt(stratStd / K) * 100;

    infoEl.textContent = 'Pos-ratio std: Regular=' + regStd.toFixed(1) + '% | Stratified=' + stratStd.toFixed(1) + '% (lower is more consistent)';
  }

  kSlider.addEventListener('input', draw);
  ratioSlider.addEventListener('input', draw);
  document.getElementById('strat-reshuffle').addEventListener('click', function() {
    seed = Math.floor(Math.random() * 10000);
    draw();
  });
  draw();
  EV.observeTheme(draw);
})();
</script>

<div class="demo-hint">
With <strong>low positive ratio</strong> (e.g. 5-15%), regular K-Fold can create folds where some have no positive samples at all. Stratified K-Fold maintains the original class balance in every fold, giving more reliable evaluation.
</div>

---

## 9. Learning Curves: Bias vs Variance

Learning curves plot model performance against training set size. They reveal whether your model suffers from **high bias** (underfitting) or **high variance** (overfitting).

- **High bias**: Both training and validation errors are high and converge. More data will not help much. You need a more complex model.
- **High variance**: Training error is low but validation error is high. The gap between them is large. More data can help, or you need regularization.

<div class="interactive-demo" id="demo-learning">
  <h4 style="margin-top:0">Learning Curves: Diagnosing Your Model</h4>
  <canvas id="canvas-learning" width="580" height="340"></canvas>
  <div class="demo-controls">
    <label>Model complexity: <input type="range" id="lc-complexity" min="1" max="10" value="5" step="1"><span class="demo-value" id="lc-complex-val">5</span></label>
    <label>
      <select id="lc-preset" style="padding:0.3rem;border-radius:4px;border:1px solid var(--border);background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
        <option value="custom">Custom</option>
        <option value="highbias">High Bias (Underfitting)</option>
        <option value="good">Good Fit</option>
        <option value="highvar">High Variance (Overfitting)</option>
      </select>
    </label>
  </div>
  <div class="demo-info" id="lc-info">Adjust model complexity to see how learning curves change</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('canvas-learning');
  var complexSlider = document.getElementById('lc-complexity');
  var complexVal = document.getElementById('lc-complex-val');
  var presetSelect = document.getElementById('lc-preset');
  var infoEl = document.getElementById('lc-info');
  var W = 580, H = 340;

  var presets = { highbias: 1, good: 5, highvar: 10 };

  presetSelect.addEventListener('change', function() {
    if (presets[presetSelect.value] !== undefined) {
      complexSlider.value = presets[presetSelect.value];
      complexVal.textContent = presets[presetSelect.value];
      draw();
    }
  });

  function genLearningCurve(complexity) {
    // Simulate learning curves based on complexity
    var rng = EV.mulberry32(42);
    var sizes = [];
    var trainErrors = [];
    var valErrors = [];
    var maxN = 200;
    var steps = 20;

    // Parameters based on complexity
    var biasLevel = Math.max(0.05, 0.5 - complexity * 0.045);
    var overfitGap = complexity * 0.03;
    var convergenceRate = 0.3 + complexity * 0.05;

    for (var i = 1; i <= steps; i++) {
      var n = Math.round(10 + (maxN - 10) * i / steps);
      sizes.push(n);

      var t = n / maxN;
      // Training error: starts low, increases as model sees more varied data
      var trainErr = biasLevel * 0.5 + biasLevel * 0.5 * (1 - Math.exp(-convergenceRate * t * 3));
      trainErr += (rng() - 0.5) * 0.01;

      // Validation error: starts high, decreases
      var valErr = biasLevel + overfitGap * (1 - t * 0.5) + 0.15 * Math.exp(-convergenceRate * t * 4);
      valErr += (rng() - 0.5) * 0.015;

      trainErrors.push(Math.max(0, trainErr));
      valErrors.push(Math.max(0, valErr));
    }
    return { sizes: sizes, train: trainErrors, val: valErrors };
  }

  function draw() {
    var ctx = EV.setupCanvas(canvas, W, H);
    var c = EV.getColors();
    var complexity = parseInt(complexSlider.value);
    complexVal.textContent = complexity;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var data = genLearningCurve(complexity);
    var pad = 55;
    var pw = W - 2 * pad, ph = H - 2 * pad;

    // Find y range
    var maxErr = 0;
    for (var i = 0; i < data.train.length; i++) {
      if (data.train[i] > maxErr) maxErr = data.train[i];
      if (data.val[i] > maxErr) maxErr = data.val[i];
    }
    maxErr = Math.ceil(maxErr * 10) / 10 + 0.05;
    var minErr = 0;

    // Axes
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) {
      var x = pad + pw * i / 5;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, H - pad); ctx.stroke();
      var y = pad + ph * i / 5;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, pw, ph);

    // Tick labels
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var i = 0; i <= 5; i++) {
      var v = 10 + (200 - 10) * i / 5;
      ctx.fillText(Math.round(v).toString(), pad + pw * i / 5, H - pad + 16);
    }
    ctx.textAlign = 'right';
    for (var i = 0; i <= 5; i++) {
      var v = maxErr * (1 - i / 5);
      ctx.fillText(v.toFixed(2), pad - 8, pad + ph * i / 5 + 4);
    }

    ctx.fillStyle = c.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Training Set Size', W / 2, H - 8);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Error', 0, 0);
    ctx.restore();

    // Fill gap between curves
    ctx.beginPath();
    for (var i = 0; i < data.sizes.length; i++) {
      var x = pad + (data.sizes[i] - 10) / (200 - 10) * pw;
      var y = H - pad - (data.val[i] - minErr) / (maxErr - minErr) * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    for (var i = data.sizes.length - 1; i >= 0; i--) {
      var x = pad + (data.sizes[i] - 10) / (200 - 10) * pw;
      var y = H - pad - (data.train[i] - minErr) / (maxErr - minErr) * ph;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = complexity > 7 ? c.fnBg : (complexity < 3 ? c.fpBg : c.tpBg);
    ctx.fill();

    // Training error curve
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i < data.sizes.length; i++) {
      var x = pad + (data.sizes[i] - 10) / (200 - 10) * pw;
      var y = H - pad - (data.train[i] - minErr) / (maxErr - minErr) * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Validation error curve
    ctx.strokeStyle = c.class1;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i < data.sizes.length; i++) {
      var x = pad + (data.sizes[i] - 10) / (200 - 10) * pw;
      var y = H - pad - (data.val[i] - minErr) / (maxErr - minErr) * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Legend
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    var lx = pad + 15, ly = pad + 15;
    ctx.strokeStyle = c.accent; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 20, ly); ctx.stroke();
    ctx.fillStyle = c.text;
    ctx.fillText('Training error', lx + 25, ly + 4);
    ctx.strokeStyle = c.class1;
    ctx.beginPath(); ctx.moveTo(lx, ly + 18); ctx.lineTo(lx + 20, ly + 18); ctx.stroke();
    ctx.fillText('Validation error', lx + 25, ly + 22);

    // Diagnosis label
    var gap = data.val[data.val.length - 1] - data.train[data.train.length - 1];
    var finalVal = data.val[data.val.length - 1];
    var diagnosis;
    if (complexity <= 2) {
      diagnosis = 'HIGH BIAS (Underfitting): Both errors high, small gap. Try a more complex model.';
    } else if (complexity >= 8) {
      diagnosis = 'HIGH VARIANCE (Overfitting): Low train error, high val error. Try regularization or more data.';
    } else {
      diagnosis = 'GOOD FIT: Errors converge at a reasonable level with moderate gap.';
    }
    infoEl.textContent = diagnosis;
  }

  complexSlider.addEventListener('input', function() {
    presetSelect.value = 'custom';
    draw();
  });
  draw();
  EV.observeTheme(draw);
})();
</script>

<div class="demo-hint">
Use the <strong>preset selector</strong> or drag <strong>model complexity</strong>. At low complexity, both curves plateau high (underfitting). At high complexity, the gap widens (overfitting). The shaded gap between curves is the variance component of the error.
</div>

---

## 10. Putting It All Together

Choosing the right evaluation metric depends on your problem:

<table class="ev-table">
<tr><th>Scenario</th><th>Priority</th><th>Recommended Metric</th><th>Why</th></tr>
<tr><td>Medical diagnosis</td><td>Catch all sick patients</td><td>Recall (Sensitivity)</td><td>Missing a disease (FN) is catastrophic</td></tr>
<tr><td>Spam filtering</td><td>Don't block real email</td><td>Precision</td><td>Blocking a real email (FP) annoys users</td></tr>
<tr><td>Balanced classes</td><td>Overall correctness</td><td>F1 Score / Accuracy</td><td>Errors are roughly equally costly</td></tr>
<tr><td>Imbalanced data</td><td>Find rare positives</td><td>PR AUC</td><td>ROC AUC is overly optimistic here</td></tr>
<tr><td>Ranking quality</td><td>Separate classes well</td><td>ROC AUC</td><td>Threshold-independent separation measure</td></tr>
<tr><td>Model comparison</td><td>Reliable estimate</td><td>Stratified K-Fold CV</td><td>Reduces variance from a single split</td></tr>
</table>

### Evaluation Best Practices

1. **Never evaluate on training data.** Always hold out a test set or use cross-validation.

2. **Match the metric to the business cost.** If false negatives cost 10x more than false positives, your metric should reflect that.

3. **Use stratified splits** on imbalanced data to ensure each fold has representative class proportions.

4. **Look at multiple metrics.** A single number rarely tells the whole story. Check the confusion matrix, ROC, and PR curves together.

5. **Plot learning curves** to diagnose whether you need more data, a simpler model, or a more complex one.

6. **Report confidence intervals.** The mean CV score alone is incomplete, always report the standard deviation across folds.

### Key Formulas Reference

$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$

$$\text{Precision} = \frac{TP}{TP + FP} \qquad \text{Recall} = \frac{TP}{TP + FN}$$

$$F_1 = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

$$\text{Specificity} = \frac{TN}{TN + FP} \qquad \text{FPR} = 1 - \text{Specificity}$$

---

In the next chapter, we will explore **Feature Engineering and Selection**, how to create, transform, and choose the right features to feed your models.
