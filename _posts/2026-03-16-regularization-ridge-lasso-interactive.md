---
layout: post
title: "Regularization: Ridge, Lasso & Elastic Net - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Visualize how L1 and L2 regularization shrink coefficients, why Lasso produces sparsity, and how Elastic Net combines both - all interactively in your browser."
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
.coef-bar-container {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
}
.coef-bar-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.coef-bar-label {
  width: 28px;
  text-align: right;
  color: var(--text-secondary);
}
.coef-bar-track {
  flex: 1;
  height: 14px;
  background: var(--bg-primary);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
}
.coef-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.coef-bar-val {
  width: 60px;
  text-align: right;
  color: var(--text-secondary);
}
.feature-tag {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0.1rem;
  font-family: 'JetBrains Mono', monospace;
}
.feature-active {
  background: rgba(158, 206, 106, 0.25);
  color: #9ece6a;
  border: 1px solid rgba(158, 206, 106, 0.4);
}
.feature-dead {
  background: rgba(247, 118, 142, 0.15);
  color: #f7768e;
  border: 1px solid rgba(247, 118, 142, 0.3);
  text-decoration: line-through;
}
.summary-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.85rem;
}
.summary-table th, .summary-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}
.summary-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
</style>

<script>
// Shared utilities for all regularization demos
window.REG = (function() {
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
      ridge: dark ? '#7aa2f7' : '#2563eb',
      lasso: dark ? '#f7768e' : '#dc2626',
      elastic: dark ? '#9ece6a' : '#16a34a',
      unregularized: dark ? '#ff9e64' : '#e67e22',
      trueFunc: dark ? '#bb9af7' : '#7c3aed',
      accent: dark ? '#9ece6a' : '#16a34a',
      valid: dark ? '#f7768e' : '#dc2626',
      coefColors: dark
        ? ['#7aa2f7','#f7768e','#9ece6a','#ff9e64','#e0af68','#bb9af7','#73daca','#2ac3de','#c0caf5','#ff7a93','#7dcfff','#c3e88d','#ffc777','#ff98a4','#86e1fc']
        : ['#2563eb','#dc2626','#16a34a','#e67e22','#ca8a04','#7c3aed','#0d9488','#0284c7','#475569','#be123c','#0369a1','#4d7c0f','#c2410c','#9f1239','#0e7490'],
      contourLow: dark ? '#1a1b26' : '#eef2ff',
      contourHigh: dark ? '#7aa2f7' : '#2563eb',
      l2Region: dark ? 'rgba(122,162,247,0.25)' : 'rgba(37,99,235,0.15)',
      l1Region: dark ? 'rgba(247,118,142,0.25)' : 'rgba(220,38,38,0.15)',
      l2Border: dark ? '#7aa2f7' : '#2563eb',
      l1Border: dark ? '#f7768e' : '#dc2626'
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

  function mapX(val, min, max, pL, pW) { return pL + (val - min) / (max - min) * pW; }
  function mapY(val, min, max, pT, pH) { return pT + pH - (val - min) / (max - min) * pH; }
  function unmapX(px, min, max, pL, pW) { return min + (px - pL) / pW * (max - min); }
  function unmapY(py, min, max, pT, pH) { return min + (pT + pH - py) / pH * (max - min); }

  function drawGrid(ctx, W, H, pL, pR, pT, pB, xMin, xMax, yMin, yMax, xLabel, yLabel) {
    var c = getColors();
    var pW = W - pL - pR, pH = H - pT - pB;
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    // Vertical grid lines
    var xTicks = 6;
    for (var i = 0; i <= xTicks; i++) {
      var x = pL + pW * i / xTicks;
      ctx.beginPath(); ctx.moveTo(x, pT); ctx.lineTo(x, pT + pH); ctx.stroke();
    }
    // Horizontal grid lines
    var yTicks = 5;
    for (var i = 0; i <= yTicks; i++) {
      var y = pT + pH * i / yTicks;
      ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(pL + pW, y); ctx.stroke();
    }
    // Tick labels
    ctx.fillStyle = c.textMuted;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var i = 0; i <= xTicks; i++) {
      var v = xMin + (xMax - xMin) * i / xTicks;
      ctx.fillText(v.toFixed(1), pL + pW * i / xTicks, H - pB + 14);
    }
    ctx.textAlign = 'right';
    for (var i = 0; i <= yTicks; i++) {
      var v = yMax - (yMax - yMin) * i / yTicks;
      ctx.fillText(v.toFixed(1), pL - 5, pT + pH * i / yTicks + 4);
    }
    // Axis labels
    ctx.fillStyle = c.text;
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (xLabel) ctx.fillText(xLabel, pL + pW / 2, H - 2);
    if (yLabel) {
      ctx.save();
      ctx.translate(12, pT + pH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();
    }
  }

  function randn() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // True underlying function
  function trueFunc(x) {
    return Math.sin(1.2 * x) + 0.4 * x - 1;
  }

  function generateData(n, xLo, xHi, sigma) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var x = xLo + (xHi - xLo) * Math.random();
      var y = trueFunc(x) + sigma * randn();
      pts.push({ x: x, y: y });
    }
    return pts;
  }

  // Vandermonde matrix
  function vandermonde(xs, deg) {
    var n = xs.length;
    var X = [];
    for (var i = 0; i < n; i++) {
      X[i] = new Array(deg + 1);
      var xp = 1;
      for (var j = 0; j <= deg; j++) {
        X[i][j] = xp;
        xp *= xs[i];
      }
    }
    return X;
  }

  function matT(A) {
    var r = A.length, c = A[0].length;
    var T = [];
    for (var j = 0; j < c; j++) {
      T[j] = new Array(r);
      for (var i = 0; i < r; i++) T[j][i] = A[i][j];
    }
    return T;
  }

  function matMul(A, B) {
    var rA = A.length, cA = A[0].length, cB = B[0].length;
    var C = [];
    for (var i = 0; i < rA; i++) {
      C[i] = new Array(cB);
      for (var j = 0; j < cB; j++) {
        var s = 0;
        for (var k = 0; k < cA; k++) s += A[i][k] * B[k][j];
        C[i][j] = s;
      }
    }
    return C;
  }

  function matInv(M) {
    var n = M.length;
    var A = [];
    for (var i = 0; i < n; i++) {
      A[i] = new Array(2 * n);
      for (var j = 0; j < n; j++) A[i][j] = M[i][j];
      for (var j = 0; j < n; j++) A[i][n + j] = (i === j) ? 1 : 0;
    }
    for (var col = 0; col < n; col++) {
      var maxVal = Math.abs(A[col][col]), maxRow = col;
      for (var r = col + 1; r < n; r++) {
        if (Math.abs(A[r][col]) > maxVal) { maxVal = Math.abs(A[r][col]); maxRow = r; }
      }
      if (maxVal < 1e-14) return null;
      var tmp = A[col]; A[col] = A[maxRow]; A[maxRow] = tmp;
      var piv = A[col][col];
      for (var j = 0; j < 2 * n; j++) A[col][j] /= piv;
      for (var r = 0; r < n; r++) {
        if (r === col) continue;
        var f = A[r][col];
        for (var j = 0; j < 2 * n; j++) A[r][j] -= f * A[col][j];
      }
    }
    var inv = [];
    for (var i = 0; i < n; i++) {
      inv[i] = new Array(n);
      for (var j = 0; j < n; j++) inv[i][j] = A[i][n + j];
    }
    return inv;
  }

  // Fit polynomial with Ridge (L2) regularization
  // Returns weight vector [w0, w1, ..., wd]
  function polyFitRidge(pts, deg, lambda) {
    if (typeof lambda === 'undefined') lambda = 0;
    var xs = pts.map(function(p) { return p.x; });
    var ys = pts.map(function(p) { return p.y; });
    var X = vandermonde(xs, deg);
    var Xt = matT(X);
    var XtX = matMul(Xt, X);
    // Add lambda * I (skip bias term at index 0 for proper ridge)
    for (var i = 0; i < XtX.length; i++) {
      XtX[i][i] += (i === 0) ? 1e-10 : lambda;
    }
    var XtXinv = matInv(XtX);
    if (!XtXinv) return null;
    var yCol = ys.map(function(v) { return [v]; });
    var Xty = matMul(Xt, yCol);
    var w = matMul(XtXinv, Xty);
    return w.map(function(row) { return row[0]; });
  }

  // Fit polynomial with Lasso (L1) via coordinate descent
  function polyFitLasso(pts, deg, lambda, maxIter) {
    maxIter = maxIter || 1000;
    var xs = pts.map(function(p) { return p.x; });
    var ys = pts.map(function(p) { return p.y; });
    var X = vandermonde(xs, deg);
    var n = xs.length, p = deg + 1;
    var w = new Array(p);
    for (var j = 0; j < p; j++) w[j] = 0;

    // Precompute column norms
    var colNorm = new Array(p);
    for (var j = 0; j < p; j++) {
      var s = 0;
      for (var i = 0; i < n; i++) s += X[i][j] * X[i][j];
      colNorm[j] = s;
    }

    for (var iter = 0; iter < maxIter; iter++) {
      var maxDelta = 0;
      for (var j = 0; j < p; j++) {
        // Compute residual without j-th feature
        var rho = 0;
        for (var i = 0; i < n; i++) {
          var pred = 0;
          for (var k = 0; k < p; k++) pred += X[i][k] * w[k];
          var residual = ys[i] - pred + X[i][j] * w[j];
          rho += X[i][j] * residual;
        }
        var newW;
        if (j === 0) {
          // Don't regularize bias
          newW = rho / (colNorm[j] + 1e-10);
        } else {
          // Soft thresholding
          if (rho > lambda) newW = (rho - lambda) / colNorm[j];
          else if (rho < -lambda) newW = (rho + lambda) / colNorm[j];
          else newW = 0;
        }
        var delta = Math.abs(newW - w[j]);
        if (delta > maxDelta) maxDelta = delta;
        w[j] = newW;
      }
      if (maxDelta < 1e-8) break;
    }
    return w;
  }

  // Fit with Elastic Net (coordinate descent)
  function polyFitElasticNet(pts, deg, lambda, alpha, maxIter) {
    maxIter = maxIter || 1000;
    if (typeof alpha === 'undefined') alpha = 0.5;
    var xs = pts.map(function(p) { return p.x; });
    var ys = pts.map(function(p) { return p.y; });
    var X = vandermonde(xs, deg);
    var n = xs.length, p = deg + 1;
    var w = new Array(p);
    for (var j = 0; j < p; j++) w[j] = 0;

    var colNorm = new Array(p);
    for (var j = 0; j < p; j++) {
      var s = 0;
      for (var i = 0; i < n; i++) s += X[i][j] * X[i][j];
      colNorm[j] = s;
    }

    var l1 = alpha * lambda;
    var l2 = (1 - alpha) * lambda;

    for (var iter = 0; iter < maxIter; iter++) {
      var maxDelta = 0;
      for (var j = 0; j < p; j++) {
        var rho = 0;
        for (var i = 0; i < n; i++) {
          var pred = 0;
          for (var k = 0; k < p; k++) pred += X[i][k] * w[k];
          var residual = ys[i] - pred + X[i][j] * w[j];
          rho += X[i][j] * residual;
        }
        var newW;
        if (j === 0) {
          newW = rho / (colNorm[j] + 1e-10);
        } else {
          if (rho > l1) newW = (rho - l1) / (colNorm[j] + l2);
          else if (rho < -l1) newW = (rho + l1) / (colNorm[j] + l2);
          else newW = 0;
        }
        var delta = Math.abs(newW - w[j]);
        if (delta > maxDelta) maxDelta = delta;
        w[j] = newW;
      }
      if (maxDelta < 1e-8) break;
    }
    return w;
  }

  function polyEval(w, x) {
    var val = 0, xp = 1;
    for (var i = 0; i < w.length; i++) {
      val += w[i] * xp;
      xp *= x;
    }
    return val;
  }

  function polyMSE(w, pts) {
    var sum = 0;
    for (var i = 0; i < pts.length; i++) {
      var err = pts[i].y - polyEval(w, pts[i].x);
      sum += err * err;
    }
    return sum / pts.length;
  }

  function drawPoints(ctx, pts, xMin, xMax, yMin, yMax, pL, pW, pT, pH, color, strokeColor, radius) {
    var c = getColors();
    color = color || c.point;
    strokeColor = strokeColor || c.pointStroke;
    radius = radius || 5;
    for (var i = 0; i < pts.length; i++) {
      var px = mapX(pts[i].x, xMin, xMax, pL, pW);
      var py = mapY(pts[i].y, yMin, yMax, pT, pH);
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function drawCurve(ctx, w, xMin, xMax, yMin, yMax, pL, pW, pT, pH, color, lineWidth, dashed) {
    if (!w) return;
    var steps = 200;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 2.5;
    if (dashed) ctx.setLineDash(dashed);
    else ctx.setLineDash([]);
    for (var i = 0; i <= steps; i++) {
      var x = xMin + (xMax - xMin) * i / steps;
      var y = polyEval(w, x);
      var px = mapX(x, xMin, xMax, pL, pW);
      var py = mapY(y, yMin, yMax, pT, pH);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawTrueFunc(ctx, xMin, xMax, yMin, yMax, pL, pW, pT, pH) {
    var c = getColors();
    var steps = 200;
    ctx.beginPath();
    ctx.strokeStyle = c.trueFunc;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    for (var i = 0; i <= steps; i++) {
      var x = xMin + (xMax - xMin) * i / steps;
      var y = trueFunc(x);
      var px = mapX(x, xMin, xMax, pL, pW);
      var py = mapY(y, yMin, yMax, pT, pH);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function getPos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

  var _renders = [];
  function onThemeChange(fn) { _renders.push(fn); }
  var _obs = new MutationObserver(function() {
    _renders.forEach(function(fn) { fn(); });
  });
  _obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    getColors: getColors,
    setupCanvas: setupCanvas,
    mapX: mapX, mapY: mapY,
    unmapX: unmapX, unmapY: unmapY,
    drawGrid: drawGrid,
    randn: randn,
    trueFunc: trueFunc,
    generateData: generateData,
    vandermonde: vandermonde,
    polyFitRidge: polyFitRidge,
    polyFitLasso: polyFitLasso,
    polyFitElasticNet: polyFitElasticNet,
    polyEval: polyEval,
    polyMSE: polyMSE,
    drawPoints: drawPoints,
    drawCurve: drawCurve,
    drawTrueFunc: drawTrueFunc,
    onThemeChange: onThemeChange,
    getPos: getPos,
    matInv: matInv, matMul: matMul, matT: matT
  };
})();
</script>

In the [previous chapter on polynomial regression]({% post_url 2026-03-16-polynomial-regression-bias-variance-interactive %}), we saw how increasing polynomial degree lets a model fit training data more and more closely, until it starts memorising noise. We identified the bias-variance tradeoff, and the classic U-shaped validation curve showed there is an optimal complexity.

But choosing the "right" degree is only one way to control complexity. What if we could keep a high-degree polynomial (giving it the *capacity* to model complex patterns) but **penalise it for using that capacity excessively**? That is exactly what **regularization** does.

In this chapter you will:
- See why overfitting happens at a coefficient level, wild, large weights
- **Drag a slider** to watch Ridge (L2) smoothly shrink coefficients toward zero
- Visualise the geometry that explains why Lasso (L1) produces **exact zeros** (sparsity)
- Watch Lasso perform automatic feature selection on noisy features
- Blend Ridge and Lasso with Elastic Net and see the constraint region morph
- Build deep intuition for when to use which regularizer

Let us begin.

---

## 1. The Overfitting Problem: Wild Coefficients

We know from the last chapter that a degree-10 polynomial can overfit badly. But *why* does overfitting happen, mechanically? The answer: the model assigns **enormous coefficient values** to fit noise. A coefficient of +500 on $$x^7$$ and -480 on $$x^8$$ can create tiny wiggles that pass through noisy points, but these large opposing weights produce violent oscillations everywhere else.

Below, 20 noisy points are generated from a smooth true function. The unregularized degree-10 fit passes near every point but oscillates wildly. Look at the coefficient magnitudes on the right, some are huge.

<div class="interactive-demo" id="demo-overfit">
  <div class="demo-split">
    <div>
      <canvas id="canvas-overfit-curve"></canvas>
      <div class="demo-caption">Degree 10 polynomial fit (no regularization)</div>
    </div>
    <div>
      <canvas id="canvas-overfit-coefs"></canvas>
      <div class="demo-caption">Coefficient magnitudes |w<sub>i</sub>|</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btn-overfit-new">New Data</button>
  </div>
  <div class="demo-info" id="info-overfit"></div>
</div>

<script>
(function() {
  var WL = 340, WR = 340, H = 340;
  var pL = 50, pR = 15, pT = 20, pB = 40;

  var canvasCurve = document.getElementById('canvas-overfit-curve');
  var ctxCurve = REG.setupCanvas(canvasCurve, WL, H);
  var canvasCoefs = document.getElementById('canvas-overfit-coefs');
  var ctxCoefs = REG.setupCanvas(canvasCoefs, WR, H);
  var info = document.getElementById('info-overfit');

  var xMin = -0.5, xMax = 6.5, yMin = -4, yMax = 6;
  var deg = 10;
  var pts = [];
  var w = null;

  function regenerate() {
    pts = REG.generateData(20, 0.2, 5.8, 0.5);
    w = REG.polyFitRidge(pts, deg, 1e-10);
    draw();
  }

  function draw() {
    var c = REG.getColors();
    var pWL = WL - pL - pR, pHL = H - pT - pB;

    // Left: curve
    ctxCurve.fillStyle = c.bg;
    ctxCurve.fillRect(0, 0, WL, H);
    REG.drawGrid(ctxCurve, WL, H, pL, pR, pT, pB, xMin, xMax, yMin, yMax, 'x', 'y');
    REG.drawTrueFunc(ctxCurve, xMin, xMax, yMin, yMax, pL, pWL, pT, pHL);
    if (w) REG.drawCurve(ctxCurve, w, xMin, xMax, yMin, yMax, pL, pWL, pT, pHL, c.unregularized, 2.5);
    REG.drawPoints(ctxCurve, pts, xMin, xMax, yMin, yMax, pL, pWL, pT, pHL);

    // Legend
    ctxCurve.font = '11px Inter, sans-serif'; ctxCurve.textAlign = 'left';
    ctxCurve.strokeStyle = c.trueFunc; ctxCurve.lineWidth = 2; ctxCurve.setLineDash([6, 4]);
    ctxCurve.beginPath(); ctxCurve.moveTo(pL + 8, pT + 14); ctxCurve.lineTo(pL + 28, pT + 14); ctxCurve.stroke();
    ctxCurve.setLineDash([]);
    ctxCurve.fillStyle = c.text; ctxCurve.fillText('True', pL + 32, pT + 18);
    ctxCurve.strokeStyle = c.unregularized; ctxCurve.lineWidth = 2.5;
    ctxCurve.beginPath(); ctxCurve.moveTo(pL + 8, pT + 32); ctxCurve.lineTo(pL + 28, pT + 32); ctxCurve.stroke();
    ctxCurve.fillStyle = c.text; ctxCurve.fillText('Deg 10 fit', pL + 32, pT + 36);

    // Right: coefficient bar chart
    ctxCoefs.fillStyle = c.bg;
    ctxCoefs.fillRect(0, 0, WR, H);

    if (!w) return;
    var barPL = 40, barPR = 15, barPT = 30, barPB = 40;
    var barW = WR - barPL - barPR;
    var barH = H - barPT - barPB;
    var nCoefs = w.length;
    var gap = 4;
    var bh = (barH - (nCoefs - 1) * gap) / nCoefs;

    // Find max abs coef for scaling
    var maxAbs = 0;
    for (var i = 0; i < nCoefs; i++) maxAbs = Math.max(maxAbs, Math.abs(w[i]));
    if (maxAbs < 1) maxAbs = 1;

    ctxCoefs.fillStyle = c.text;
    ctxCoefs.font = 'bold 12px Inter, sans-serif';
    ctxCoefs.textAlign = 'center';
    ctxCoefs.fillText('Coefficient Magnitudes', WR / 2, 16);

    for (var i = 0; i < nCoefs; i++) {
      var y = barPT + i * (bh + gap);
      var absVal = Math.abs(w[i]);
      var bw = (absVal / maxAbs) * barW;

      // Label
      ctxCoefs.fillStyle = c.textMuted;
      ctxCoefs.font = '10px JetBrains Mono, monospace';
      ctxCoefs.textAlign = 'right';
      ctxCoefs.fillText('w' + i, barPL - 5, y + bh / 2 + 4);

      // Bar background
      ctxCoefs.fillStyle = c.grid;
      ctxCoefs.fillRect(barPL, y, barW, bh);

      // Bar fill
      var isLarge = absVal > maxAbs * 0.3;
      ctxCoefs.fillStyle = isLarge ? c.valid : c.accent;
      ctxCoefs.globalAlpha = 0.7;
      ctxCoefs.fillRect(barPL, y, bw, bh);
      ctxCoefs.globalAlpha = 1;

      // Value
      if (bh > 8) {
        ctxCoefs.fillStyle = c.text;
        ctxCoefs.font = '9px JetBrains Mono, monospace';
        ctxCoefs.textAlign = 'left';
        ctxCoefs.fillText(w[i].toFixed(1), barPL + bw + 4, y + bh / 2 + 3);
      }
    }

    var mse = REG.polyMSE(w, pts);
    var sumAbsW = 0;
    for (var i = 1; i < w.length; i++) sumAbsW += Math.abs(w[i]);
    info.textContent = 'Train MSE: ' + mse.toFixed(4) + '  |  Sum |w_i|: ' + sumAbsW.toFixed(1) + '  |  Max |w_i|: ' + maxAbs.toFixed(1);
  }

  document.getElementById('btn-overfit-new').addEventListener('click', regenerate);
  REG.onThemeChange(draw);
  regenerate();
})();
</script>

<div class="demo-hint">Click "New Data" several times. Each time the coefficients are wildly different, that is high variance. The idea behind regularization: add a penalty term that punishes large weights, forcing the model to find simpler solutions.</div>

The regularization approach adds a **penalty** to the loss function:

$$J_{\text{regularized}}(\mathbf{w}) = \underbrace{\frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2}_{\text{data fit (MSE)}} + \underbrace{\lambda \cdot R(\mathbf{w})}_{\text{penalty}}$$

where $$\lambda > 0$$ controls the penalty strength and $$R(\mathbf{w})$$ is the regularization term. The choice of $$R$$ gives us different regularizers.

---

## 2. Ridge Regression (L2 Regularization)

Ridge regression adds the **sum of squared weights** as the penalty:

$$J_{\text{Ridge}}(\mathbf{w}) = \frac{1}{n}\|\mathbf{y} - \mathbf{X}\mathbf{w}\|^2 + \lambda \sum_{j=1}^{d} w_j^2$$

Note we typically do **not** penalise the bias term $$w_0$$. The penalty discourages any single weight from becoming too large. Larger $$\lambda$$ means stronger penalty, meaning smaller weights.

### Closed-form solution

One of the beautiful things about Ridge is that it has a closed-form solution. Starting from the normal equation and adding the penalty:

$$\mathbf{w}_{\text{Ridge}} = (\mathbf{X}^T\mathbf{X} + \lambda \mathbf{I})^{-1} \mathbf{X}^T\mathbf{y}$$

Compare this to ordinary least squares: $$\mathbf{w}_{\text{OLS}} = (\mathbf{X}^T\mathbf{X})^{-1} \mathbf{X}^T\mathbf{y}$$. The only difference is the $$\lambda \mathbf{I}$$ term added to $$\mathbf{X}^T\mathbf{X}$$. This has two effects:
1. It **shrinks** all coefficients toward zero (more shrinkage for larger $$\lambda$$)
2. It **guarantees invertibility**, even if $$\mathbf{X}^T\mathbf{X}$$ is singular, adding $$\lambda \mathbf{I}$$ makes it positive definite

### Try it: Ridge on a degree-10 polynomial

Drag the $$\lambda$$ slider to see how Ridge regularization smooths out the overfit curve. Watch the coefficient bars shrink as you increase $$\lambda$$.

<div class="interactive-demo" id="demo-ridge">
  <div class="demo-split">
    <div>
      <canvas id="canvas-ridge-curve"></canvas>
      <div class="demo-caption">Ridge-regularized degree 10 fit</div>
    </div>
    <div>
      <canvas id="canvas-ridge-coefs"></canvas>
      <div class="demo-caption">Coefficients shrink toward zero</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>&lambda;: <input type="range" id="slider-ridge-lam" min="-3" max="3" value="-1" step="0.1">
    <span class="demo-value" id="val-ridge-lam">0.1</span></label>
    <button id="btn-ridge-new">New Data</button>
  </div>
  <div class="demo-info" id="info-ridge"></div>
</div>

<script>
(function() {
  var WL = 340, WR = 340, H = 340;
  var pL = 50, pR = 15, pT = 20, pB = 40;

  var canvasCurve = document.getElementById('canvas-ridge-curve');
  var ctxCurve = REG.setupCanvas(canvasCurve, WL, H);
  var canvasCoefs = document.getElementById('canvas-ridge-coefs');
  var ctxCoefs = REG.setupCanvas(canvasCoefs, WR, H);
  var slider = document.getElementById('slider-ridge-lam');
  var valSpan = document.getElementById('val-ridge-lam');
  var info = document.getElementById('info-ridge');

  var xMin = -0.5, xMax = 6.5, yMin = -4, yMax = 6;
  var deg = 10;
  var pts = [];

  function regenerate() {
    pts = REG.generateData(20, 0.2, 5.8, 0.5);
    draw();
  }

  function draw() {
    var c = REG.getColors();
    var logLam = parseFloat(slider.value);
    var lambda = Math.pow(10, logLam);
    valSpan.textContent = lambda.toFixed(lambda < 1 ? 3 : 1);

    var w = REG.polyFitRidge(pts, deg, lambda);
    var wUnreg = REG.polyFitRidge(pts, deg, 1e-10);
    var pWL = WL - pL - pR, pHL = H - pT - pB;

    // Left: curves
    ctxCurve.fillStyle = c.bg;
    ctxCurve.fillRect(0, 0, WL, H);
    REG.drawGrid(ctxCurve, WL, H, pL, pR, pT, pB, xMin, xMax, yMin, yMax, 'x', 'y');
    REG.drawTrueFunc(ctxCurve, xMin, xMax, yMin, yMax, pL, pWL, pT, pHL);

    // Unregularized (faded)
    if (wUnreg) {
      ctxCurve.globalAlpha = 0.25;
      REG.drawCurve(ctxCurve, wUnreg, xMin, xMax, yMin, yMax, pL, pWL, pT, pHL, c.unregularized, 2);
      ctxCurve.globalAlpha = 1;
    }

    // Ridge fit
    if (w) REG.drawCurve(ctxCurve, w, xMin, xMax, yMin, yMax, pL, pWL, pT, pHL, c.ridge, 3);
    REG.drawPoints(ctxCurve, pts, xMin, xMax, yMin, yMax, pL, pWL, pT, pHL);

    // Legend
    ctxCurve.font = '11px Inter, sans-serif'; ctxCurve.textAlign = 'left';
    ctxCurve.strokeStyle = c.trueFunc; ctxCurve.lineWidth = 2; ctxCurve.setLineDash([6, 4]);
    ctxCurve.beginPath(); ctxCurve.moveTo(pL + 8, pT + 14); ctxCurve.lineTo(pL + 28, pT + 14); ctxCurve.stroke();
    ctxCurve.setLineDash([]);
    ctxCurve.fillStyle = c.text; ctxCurve.fillText('True', pL + 32, pT + 18);
    ctxCurve.strokeStyle = c.ridge; ctxCurve.lineWidth = 3;
    ctxCurve.beginPath(); ctxCurve.moveTo(pL + 8, pT + 32); ctxCurve.lineTo(pL + 28, pT + 32); ctxCurve.stroke();
    ctxCurve.fillStyle = c.text; ctxCurve.fillText('Ridge', pL + 32, pT + 36);

    // Right: coefficient bars
    ctxCoefs.fillStyle = c.bg;
    ctxCoefs.fillRect(0, 0, WR, H);

    if (!w) return;
    var barPL = 40, barPR = 15, barPT = 30, barPB = 40;
    var barW = WR - barPL - barPR;
    var barH = H - barPT - barPB;
    var nCoefs = w.length;
    var gap = 4;
    var bh = (barH - (nCoefs - 1) * gap) / nCoefs;

    // Use unregularized max for consistent scaling
    var maxAbs = 0;
    if (wUnreg) {
      for (var i = 0; i < wUnreg.length; i++) maxAbs = Math.max(maxAbs, Math.abs(wUnreg[i]));
    }
    if (maxAbs < 1) maxAbs = 1;

    ctxCoefs.fillStyle = c.text;
    ctxCoefs.font = 'bold 12px Inter, sans-serif';
    ctxCoefs.textAlign = 'center';
    ctxCoefs.fillText('Ridge Coefficients', WR / 2, 16);

    for (var i = 0; i < nCoefs; i++) {
      var y = barPT + i * (bh + gap);
      var absVal = Math.abs(w[i]);
      var bw = Math.min((absVal / maxAbs) * barW, barW);

      ctxCoefs.fillStyle = c.textMuted;
      ctxCoefs.font = '10px JetBrains Mono, monospace';
      ctxCoefs.textAlign = 'right';
      ctxCoefs.fillText('w' + i, barPL - 5, y + bh / 2 + 4);

      ctxCoefs.fillStyle = c.grid;
      ctxCoefs.fillRect(barPL, y, barW, bh);

      ctxCoefs.fillStyle = c.ridge;
      ctxCoefs.globalAlpha = 0.7;
      ctxCoefs.fillRect(barPL, y, bw, bh);
      ctxCoefs.globalAlpha = 1;

      if (bh > 8) {
        ctxCoefs.fillStyle = c.text;
        ctxCoefs.font = '9px JetBrains Mono, monospace';
        ctxCoefs.textAlign = 'left';
        var dispVal = w[i];
        ctxCoefs.fillText((dispVal >= 0 ? '+' : '') + dispVal.toFixed(2), barPL + bw + 4, y + bh / 2 + 3);
      }
    }

    var mse = w ? REG.polyMSE(w, pts) : 0;
    var sumSq = 0;
    for (var i = 1; i < w.length; i++) sumSq += w[i] * w[i];
    info.textContent = 'Train MSE: ' + mse.toFixed(4) + '  |  \u03BB: ' + lambda.toFixed(3) + '  |  \u03A3w\u00b2: ' + sumSq.toFixed(2);
  }

  slider.addEventListener('input', draw);
  document.getElementById('btn-ridge-new').addEventListener('click', regenerate);
  REG.onThemeChange(draw);
  regenerate();
})();
</script>

<div class="demo-hint">Drag &lambda; from 0.001 to 1000. At low &lambda;, the fit is wild (overfitting). At the sweet spot (~0.1-10), the curve smoothly follows the true function. At very high &lambda;, the curve flattens to nearly a constant (underfitting). Notice coefficients shrink but NEVER reach exactly zero.</div>

---

## 3. The Ridge Coefficient Path

A **coefficient path** plot shows how each coefficient changes as $$\lambda$$ varies. This is one of the most informative plots in regularization.

For Ridge, all coefficients shrink **smoothly toward zero** as $$\lambda$$ increases, but they **never reach exactly zero**. This means Ridge keeps all features in the model, it just reduces their influence.

<div class="interactive-demo" id="demo-ridge-path">
  <canvas id="canvas-ridge-path"></canvas>
  <div class="demo-controls">
    <label>log<sub>10</sub>(&lambda;): <input type="range" id="slider-ridge-path" min="-3" max="4" value="0" step="0.05">
    <span class="demo-value" id="val-ridge-path">1.000</span></label>
    <button id="btn-ridge-path-new">New Data</button>
  </div>
  <div class="demo-info" id="info-ridge-path">Vertical line shows current &lambda;. All coefficients approach zero but never reach it.</div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var pL = 55, pR = 20, pT = 25, pB = 45;
  var pW = W - pL - pR, pH = H - pT - pB;
  var canvas = document.getElementById('canvas-ridge-path');
  var ctx = REG.setupCanvas(canvas, W, H);
  var slider = document.getElementById('slider-ridge-path');
  var valSpan = document.getElementById('val-ridge-path');
  var info = document.getElementById('info-ridge-path');

  var deg = 10;
  var pts = [];
  var pathData = []; // array of { logLam, w[] }
  var lambdaSteps = 80;
  var logLamMin = -3, logLamMax = 4;

  function regenerate() {
    pts = REG.generateData(20, 0.2, 5.8, 0.5);
    computePaths();
    draw();
  }

  function computePaths() {
    pathData = [];
    for (var s = 0; s <= lambdaSteps; s++) {
      var logLam = logLamMin + (logLamMax - logLamMin) * s / lambdaSteps;
      var lam = Math.pow(10, logLam);
      var w = REG.polyFitRidge(pts, deg, lam);
      pathData.push({ logLam: logLam, w: w });
    }
  }

  function draw() {
    var c = REG.getColors();
    var curLogLam = parseFloat(slider.value);
    var curLam = Math.pow(10, curLogLam);
    valSpan.textContent = curLam.toFixed(3);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Find y range
    var yMax = 0;
    for (var s = 0; s < pathData.length; s++) {
      if (!pathData[s].w) continue;
      for (var j = 1; j <= deg; j++) {
        yMax = Math.max(yMax, Math.abs(pathData[s].w[j]));
      }
    }
    yMax = Math.min(yMax * 1.1, 500);
    if (yMax < 1) yMax = 1;
    var yMin = -yMax;

    REG.drawGrid(ctx, W, H, pL, pR, pT, pB, logLamMin, logLamMax, yMin, yMax, 'log\u2081\u2080(\u03BB)', 'Coefficient value');

    // Zero line
    var zeroY = REG.mapY(0, yMin, yMax, pT, pH);
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pL, zeroY); ctx.lineTo(pL + pW, zeroY); ctx.stroke();
    ctx.setLineDash([]);

    // Draw each coefficient path
    for (var j = 1; j <= deg; j++) {
      ctx.beginPath();
      ctx.strokeStyle = c.coefColors[(j - 1) % c.coefColors.length];
      ctx.lineWidth = 2;
      var started = false;
      for (var s = 0; s < pathData.length; s++) {
        if (!pathData[s].w) continue;
        var px = REG.mapX(pathData[s].logLam, logLamMin, logLamMax, pL, pW);
        var val = pathData[s].w[j];
        val = Math.max(yMin, Math.min(yMax, val));
        var py = REG.mapY(val, yMin, yMax, pT, pH);
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Current lambda vertical line
    var curPx = REG.mapX(curLogLam, logLamMin, logLamMax, pL, pW);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath(); ctx.moveTo(curPx, pT); ctx.lineTo(curPx, pT + pH); ctx.stroke();
    ctx.setLineDash([]);

    // Draw dots at intersection
    var curW = REG.polyFitRidge(pts, deg, curLam);
    if (curW) {
      for (var j = 1; j <= deg; j++) {
        var val = curW[j];
        val = Math.max(yMin, Math.min(yMax, val));
        var py = REG.mapY(val, yMin, yMax, pT, pH);
        ctx.beginPath();
        ctx.arc(curPx, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = c.coefColors[(j - 1) % c.coefColors.length];
        ctx.fill();
        ctx.strokeStyle = c.bg;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      var nonZero = 0;
      for (var j = 1; j < curW.length; j++) {
        if (Math.abs(curW[j]) > 0.001) nonZero++;
      }
      info.textContent = '\u03BB = ' + curLam.toFixed(3) + '  |  Non-zero coefs: ' + nonZero + '/' + deg + ' (Ridge never reaches exact zero)';
    }

    // Title
    ctx.fillStyle = c.text;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Ridge Coefficient Path', W / 2, 14);
  }

  slider.addEventListener('input', draw);
  document.getElementById('btn-ridge-path-new').addEventListener('click', regenerate);
  REG.onThemeChange(draw);
  regenerate();
})();
</script>

<div class="demo-hint">Drag the slider and watch every coefficient line approach zero as &lambda; grows, but none of them ever touch zero. This is the key limitation of Ridge: it cannot perform feature selection.</div>

---

## 4. L1 vs L2 Constraint Geometry

This is **the** key visualization for understanding why Lasso produces sparsity and Ridge does not.

Regularization can be viewed as a constrained optimisation problem. Instead of minimising $$J(\mathbf{w}) + \lambda R(\mathbf{w})$$, we can equivalently minimise $$J(\mathbf{w})$$ subject to $$R(\mathbf{w}) \leq t$$ for some budget $$t$$.

- **L2 (Ridge)**: $$\sum w_j^2 \leq t$$, the constraint region is a **circle** (sphere in higher dimensions)
- **L1 (Lasso)**: $$\sum |w_j| \leq t$$, the constraint region is a **diamond** (cross-polytope)

The optimal solution is where the elliptical contours of the loss function first touch the constraint region. Because the diamond has **corners on the axes**, the contours are much more likely to touch at a corner, which means one or more weights are exactly zero. The circle has no corners, so the touching point is almost never on an axis.

Drag the contour center to see how this works for different loss function orientations.

<div class="interactive-demo" id="demo-geometry">
  <canvas id="canvas-geometry"></canvas>
  <div class="demo-controls">
    <label>Budget t: <input type="range" id="slider-geo-budget" min="0.3" max="2.5" value="1.2" step="0.05">
    <span class="demo-value" id="val-geo-budget">1.2</span></label>
    <label>Ellipse angle: <input type="range" id="slider-geo-angle" min="0" max="90" value="30" step="1">
    <span class="demo-value" id="val-geo-angle">30&deg;</span></label>
  </div>
  <div class="demo-info" id="info-geometry">Drag the contour center (white dot). Notice: the diamond solution is often on a corner (axis), the circle solution is not.</div>
</div>

<script>
(function() {
  var W = 680, H = 460;
  var canvas = document.getElementById('canvas-geometry');
  var ctx = REG.setupCanvas(canvas, W, H);
  var sliderBudget = document.getElementById('slider-geo-budget');
  var valBudget = document.getElementById('val-geo-budget');
  var sliderAngle = document.getElementById('slider-geo-angle');
  var valAngle = document.getElementById('val-geo-angle');
  var info = document.getElementById('info-geometry');

  var midX = W / 2, midY = H / 2;
  var scale = 100; // pixels per unit

  // Contour center (draggable)
  var cx = 1.8, cy = 1.5;
  var dragging = false;

  // Ellipse parameters
  var a2 = 1.5, b2 = 0.4; // semi-axes squared for the ellipse eigenvalues

  function getEllipseParams() {
    var angle = parseFloat(sliderAngle.value) * Math.PI / 180;
    var cosA = Math.cos(angle), sinA = Math.sin(angle);
    // Rotation matrix for the quadratic form
    // Q = R^T * diag(1/a2, 1/b2) * R
    return { angle: angle, cosA: cosA, sinA: sinA };
  }

  // Loss function value at (w1, w2) given center (cx, cy) and rotation
  function loss(w1, w2) {
    var p = getEllipseParams();
    var dw1 = w1 - cx, dw2 = w2 - cy;
    // Rotate to ellipse coordinates
    var u = p.cosA * dw1 + p.sinA * dw2;
    var v = -p.sinA * dw1 + p.cosA * dw2;
    return u * u / a2 + v * v / b2;
  }

  // Find the point on the constraint boundary closest to touching the loss contours
  // by sampling many points on the boundary and finding min loss
  function findTouch(type, budget) {
    var bestW1 = 0, bestW2 = 0, bestLoss = Infinity;
    var nSamples = 500;
    for (var i = 0; i < nSamples; i++) {
      var t = i / nSamples * 2 * Math.PI;
      var w1, w2;
      if (type === 'l2') {
        w1 = budget * Math.cos(t);
        w2 = budget * Math.sin(t);
      } else {
        // L1 diamond parametrization
        if (t < Math.PI / 2) {
          var f = t / (Math.PI / 2);
          w1 = budget * (1 - f);
          w2 = budget * f;
        } else if (t < Math.PI) {
          var f = (t - Math.PI / 2) / (Math.PI / 2);
          w1 = -budget * f;
          w2 = budget * (1 - f);
        } else if (t < 3 * Math.PI / 2) {
          var f = (t - Math.PI) / (Math.PI / 2);
          w1 = -budget * (1 - f);
          w2 = -budget * f;
        } else {
          var f = (t - 3 * Math.PI / 2) / (Math.PI / 2);
          w1 = budget * f;
          w2 = -budget * (1 - f);
        }
      }
      var l = loss(w1, w2);
      if (l < bestLoss) {
        bestLoss = l;
        bestW1 = w1;
        bestW2 = w2;
      }
    }
    return { w1: bestW1, w2: bestW2, loss: bestLoss };
  }

  function toPixel(w1, w2) {
    return { x: midX + w1 * scale, y: midY - w2 * scale };
  }

  function toWorld(px, py) {
    return { w1: (px - midX) / scale, w2: (midY - py) / scale };
  }

  function draw() {
    var c = REG.getColors();
    var budget = parseFloat(sliderBudget.value);
    valBudget.textContent = budget.toFixed(2);
    valAngle.textContent = parseInt(sliderAngle.value) + '\u00b0';

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Draw axes
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(midX, 0); ctx.lineTo(midX, H); ctx.stroke();

    ctx.fillStyle = c.text;
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('w\u2081', W - 15, midY - 8);
    ctx.fillText('w\u2082', midX + 12, 15);

    // L2 constraint (circle) - left half
    var lHalf = midX;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, lHalf, H);
    ctx.clip();

    ctx.fillStyle = c.l2Region;
    ctx.beginPath();
    ctx.arc(midX, midY, budget * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c.l2Border;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();

    // L1 constraint (diamond) - right half
    ctx.save();
    ctx.beginPath();
    ctx.rect(lHalf, 0, W - lHalf, H);
    ctx.clip();

    var bs = budget * scale;
    ctx.fillStyle = c.l1Region;
    ctx.beginPath();
    ctx.moveTo(midX + bs, midY);
    ctx.lineTo(midX, midY - bs);
    ctx.lineTo(midX - bs, midY);
    ctx.lineTo(midX, midY + bs);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = c.l1Border;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();

    // Draw both shapes fully with lower opacity borders
    ctx.strokeStyle = c.l2Border;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(midX, midY, budget * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(midX + bs, midY);
    ctx.lineTo(midX, midY - bs);
    ctx.lineTo(midX - bs, midY);
    ctx.lineTo(midX, midY + bs);
    ctx.closePath();
    ctx.strokeStyle = c.l1Border;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Draw contour ellipses centered at (cx, cy)
    var ep = getEllipseParams();
    var levels = [0.3, 0.7, 1.2, 2.0, 3.0, 5.0, 8.0];

    // Find tangent losses
    var touchL2 = findTouch('l2', budget);
    var touchL1 = findTouch('l1', budget);

    for (var li = 0; li < levels.length; li++) {
      var lev = levels[li];
      ctx.beginPath();
      var isL2Tangent = Math.abs(lev - touchL2.loss) < 0.15;
      var isL1Tangent = Math.abs(lev - touchL1.loss) < 0.15;

      if (isL2Tangent || isL1Tangent) {
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 2.5;
      } else {
        ctx.strokeStyle = c.textMuted;
        ctx.lineWidth = 0.8;
        ctx.globalAlpha = 0.5;
      }

      for (var i = 0; i <= 120; i++) {
        var t = i / 120 * 2 * Math.PI;
        var u = Math.sqrt(lev * a2) * Math.cos(t);
        var v = Math.sqrt(lev * b2) * Math.sin(t);
        var w1 = ep.cosA * u - ep.sinA * v + cx;
        var w2 = ep.sinA * u + ep.cosA * v + cy;
        var p = toPixel(w1, w2);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw touch points
    // L2
    var pL2 = toPixel(touchL2.w1, touchL2.w2);
    ctx.beginPath();
    ctx.arc(pL2.x, pL2.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = c.l2Border;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // L1
    var pL1 = toPixel(touchL1.w1, touchL1.w2);
    ctx.beginPath();
    ctx.arc(pL1.x, pL1.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = c.l1Border;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw center point (draggable)
    var pCenter = toPixel(cx, cy);
    ctx.beginPath();
    ctx.arc(pCenter.x, pCenter.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = c.text;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = c.text;
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605', pCenter.x, pCenter.y + 3);

    // Labels
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = c.l2Border;
    ctx.fillText('L2 (Ridge)', midX / 2, 20);
    ctx.fillStyle = c.l1Border;
    ctx.fillText('L1 (Lasso)', midX + midX / 2, 20);

    // Info
    var l1Sparse = Math.abs(touchL1.w1) < 0.05 || Math.abs(touchL1.w2) < 0.05;
    var l2Sparse = Math.abs(touchL2.w1) < 0.05 || Math.abs(touchL2.w2) < 0.05;
    info.textContent = 'L2 solution: (' + touchL2.w1.toFixed(2) + ', ' + touchL2.w2.toFixed(2) + ')' +
      '  |  L1 solution: (' + touchL1.w1.toFixed(2) + ', ' + touchL1.w2.toFixed(2) + ')' +
      (l1Sparse ? '  \u2190 Sparse!' : '');
  }

  // Drag handling
  function handleDown(e) {
    e.preventDefault();
    var pos = REG.getPos(canvas, e);
    var pCenter = toPixel(cx, cy);
    var dx = pos.x - pCenter.x, dy = pos.y - pCenter.y;
    if (dx * dx + dy * dy < 400) {
      dragging = true;
    }
  }
  function handleMove(e) {
    if (!dragging) return;
    e.preventDefault();
    var pos = REG.getPos(canvas, e);
    var world = toWorld(pos.x, pos.y);
    cx = Math.max(-2.5, Math.min(2.5, world.w1));
    cy = Math.max(-2.5, Math.min(2.5, world.w2));
    draw();
  }
  function handleUp() { dragging = false; }

  canvas.addEventListener('mousedown', handleDown);
  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('mouseup', handleUp);
  canvas.addEventListener('mouseleave', handleUp);
  canvas.addEventListener('touchstart', handleDown, { passive: false });
  canvas.addEventListener('touchmove', handleMove, { passive: false });
  canvas.addEventListener('touchend', handleUp);

  sliderBudget.addEventListener('input', draw);
  sliderAngle.addEventListener('input', draw);
  REG.onThemeChange(draw);
  draw();
})();
</script>

<div class="demo-hint">Drag the white star (OLS minimum) around and watch where the coloured dots land. The L1 (red) dot frequently snaps to an axis (a corner of the diamond), meaning one weight is exactly 0. The L2 (blue) dot almost never lands on an axis. This is the geometric reason Lasso produces sparsity.</div>

---

## 5. Lasso Regression (L1 Regularization)

Lasso (Least Absolute Shrinkage and Selection Operator) uses the **sum of absolute values** of the weights:

$$J_{\text{Lasso}}(\mathbf{w}) = \frac{1}{n}\|\mathbf{y} - \mathbf{X}\mathbf{w}\|^2 + \lambda \sum_{j=1}^{d} |w_j|$$

Unlike Ridge, Lasso has **no closed-form solution** because the absolute value is not differentiable at zero. It is typically solved via **coordinate descent**, using the soft-thresholding operator:

$$w_j \leftarrow S_{\lambda}\!\left(\rho_j\right) = \begin{cases} (\rho_j - \lambda) / z_j & \text{if } \rho_j > \lambda \\ 0 & \text{if } |\rho_j| \leq \lambda \\ (\rho_j + \lambda) / z_j & \text{if } \rho_j < -\lambda \end{cases}$$

where $$\rho_j = \sum_i x_{ij}(y_i - \hat{y}_i^{(-j)})$$ and $$z_j = \sum_i x_{ij}^2$$.

The crucial property: when $$|\rho_j| \leq \lambda$$, the coefficient is set to **exactly zero**. This is automatic **feature selection**.

### Lasso Coefficient Path

Compare this to the Ridge path above. As $$\lambda$$ increases, coefficients **hit zero and stay there**.

<div class="interactive-demo" id="demo-lasso-path">
  <canvas id="canvas-lasso-path"></canvas>
  <div class="demo-controls">
    <label>log<sub>10</sub>(&lambda;): <input type="range" id="slider-lasso-path" min="-2" max="2" value="0" step="0.05">
    <span class="demo-value" id="val-lasso-path">1.000</span></label>
    <button id="btn-lasso-path-new">New Data</button>
  </div>
  <div class="demo-info" id="info-lasso-path"></div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var pL = 55, pR = 20, pT = 25, pB = 45;
  var pW = W - pL - pR, pH = H - pT - pB;
  var canvas = document.getElementById('canvas-lasso-path');
  var ctx = REG.setupCanvas(canvas, W, H);
  var slider = document.getElementById('slider-lasso-path');
  var valSpan = document.getElementById('val-lasso-path');
  var info = document.getElementById('info-lasso-path');

  var deg = 10;
  var pts = [];
  var pathData = [];
  var lambdaSteps = 80;
  var logLamMin = -2, logLamMax = 2;

  function regenerate() {
    pts = REG.generateData(20, 0.2, 5.8, 0.5);
    computePaths();
    draw();
  }

  function computePaths() {
    pathData = [];
    for (var s = 0; s <= lambdaSteps; s++) {
      var logLam = logLamMin + (logLamMax - logLamMin) * s / lambdaSteps;
      var lam = Math.pow(10, logLam);
      var w = REG.polyFitLasso(pts, deg, lam);
      pathData.push({ logLam: logLam, w: w });
    }
  }

  function draw() {
    var c = REG.getColors();
    var curLogLam = parseFloat(slider.value);
    var curLam = Math.pow(10, curLogLam);
    valSpan.textContent = curLam.toFixed(3);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Find y range
    var yMax = 0;
    for (var s = 0; s < pathData.length; s++) {
      if (!pathData[s].w) continue;
      for (var j = 1; j <= deg; j++) {
        yMax = Math.max(yMax, Math.abs(pathData[s].w[j]));
      }
    }
    yMax = Math.min(yMax * 1.1, 100);
    if (yMax < 1) yMax = 1;
    var yMin = -yMax;

    REG.drawGrid(ctx, W, H, pL, pR, pT, pB, logLamMin, logLamMax, yMin, yMax, 'log\u2081\u2080(\u03BB)', 'Coefficient value');

    // Zero line
    var zeroY = REG.mapY(0, yMin, yMax, pT, pH);
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pL, zeroY); ctx.lineTo(pL + pW, zeroY); ctx.stroke();
    ctx.setLineDash([]);

    // Draw each coefficient path
    for (var j = 1; j <= deg; j++) {
      ctx.beginPath();
      ctx.strokeStyle = c.coefColors[(j - 1) % c.coefColors.length];
      ctx.lineWidth = 2;
      var started = false;
      for (var s = 0; s < pathData.length; s++) {
        if (!pathData[s].w) continue;
        var px = REG.mapX(pathData[s].logLam, logLamMin, logLamMax, pL, pW);
        var val = pathData[s].w[j];
        val = Math.max(yMin, Math.min(yMax, val));
        var py = REG.mapY(val, yMin, yMax, pT, pH);
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Current lambda vertical line
    var curPx = REG.mapX(curLogLam, logLamMin, logLamMax, pL, pW);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath(); ctx.moveTo(curPx, pT); ctx.lineTo(curPx, pT + pH); ctx.stroke();
    ctx.setLineDash([]);

    // Draw dots at intersection
    var curW = REG.polyFitLasso(pts, deg, curLam);
    if (curW) {
      for (var j = 1; j <= deg; j++) {
        var val = curW[j];
        val = Math.max(yMin, Math.min(yMax, val));
        var py = REG.mapY(val, yMin, yMax, pT, pH);
        ctx.beginPath();
        ctx.arc(curPx, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = c.coefColors[(j - 1) % c.coefColors.length];
        ctx.fill();
        ctx.strokeStyle = c.bg;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      var nonZero = 0;
      for (var j = 1; j < curW.length; j++) {
        if (Math.abs(curW[j]) > 0.001) nonZero++;
      }
      info.textContent = '\u03BB = ' + curLam.toFixed(3) + '  |  Non-zero coefs: ' + nonZero + '/' + deg + '  |  Lasso drives coefs to EXACT zero';
    }

    // Title
    ctx.fillStyle = c.text;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Lasso Coefficient Path', W / 2, 14);
  }

  slider.addEventListener('input', draw);
  document.getElementById('btn-lasso-path-new').addEventListener('click', regenerate);
  REG.onThemeChange(draw);
  regenerate();
})();
</script>

<div class="demo-hint">Compare this to the Ridge path in Section 3. Here, as &lambda; increases, coefficient lines hit the zero axis and flatline. At high &lambda;, most coefficients are exactly zero, Lasso has selected just a few features. Ridge never does this.</div>

---

## 6. Lasso Feature Selection in Action

Where Lasso really shines is when you have **many features but only a few are relevant**. Below we simulate a dataset with 8 features: 3 truly useful ones and 5 pure noise. As you increase $$\lambda$$, watch Lasso eliminate the noise features first while keeping the signal features.

<div class="interactive-demo" id="demo-feature-select">
  <canvas id="canvas-feature-select"></canvas>
  <div class="demo-controls">
    <label>log<sub>10</sub>(&lambda;): <input type="range" id="slider-feat-lam" min="-2" max="2" value="-0.5" step="0.05">
    <span class="demo-value" id="val-feat-lam">0.316</span></label>
    <button id="btn-feat-new">New Data</button>
  </div>
  <div class="demo-info" id="info-feature-select"></div>
</div>

<script>
(function() {
  var W = 680, H = 420;
  var pL = 90, pR = 30, pT = 30, pB = 50;
  var pW = W - pL - pR, pH = H - pT - pB;
  var canvas = document.getElementById('canvas-feature-select');
  var ctx = REG.setupCanvas(canvas, W, H);
  var slider = document.getElementById('slider-feat-lam');
  var valSpan = document.getElementById('val-feat-lam');
  var info = document.getElementById('info-feature-select');

  var nFeats = 8;
  var trueWeights = [2.5, -1.8, 1.2, 0, 0, 0, 0, 0]; // first 3 are signal, rest noise
  var featureNames = ['Signal 1', 'Signal 2', 'Signal 3', 'Noise A', 'Noise B', 'Noise C', 'Noise D', 'Noise E'];
  var isSignal = [true, true, true, false, false, false, false, false];
  var nSamples = 50;
  var X = [], y = [];

  function generateFeatureData() {
    X = [];
    y = [];
    for (var i = 0; i < nSamples; i++) {
      var row = [];
      for (var j = 0; j < nFeats; j++) {
        row.push(REG.randn());
      }
      X.push(row);
      var yi = 0;
      for (var j = 0; j < nFeats; j++) yi += trueWeights[j] * row[j];
      yi += 0.3 * REG.randn();
      y.push(yi);
    }
  }

  // Lasso via coordinate descent on raw feature matrix
  function lassoFit(lambda) {
    var p = nFeats;
    var w = new Array(p);
    for (var j = 0; j < p; j++) w[j] = 0;

    var colNorm = new Array(p);
    for (var j = 0; j < p; j++) {
      var s = 0;
      for (var i = 0; i < nSamples; i++) s += X[i][j] * X[i][j];
      colNorm[j] = s;
    }

    for (var iter = 0; iter < 500; iter++) {
      var maxD = 0;
      for (var j = 0; j < p; j++) {
        var rho = 0;
        for (var i = 0; i < nSamples; i++) {
          var pred = 0;
          for (var k = 0; k < p; k++) pred += X[i][k] * w[k];
          var residual = y[i] - pred + X[i][j] * w[j];
          rho += X[i][j] * residual;
        }
        var newW;
        if (rho > lambda) newW = (rho - lambda) / colNorm[j];
        else if (rho < -lambda) newW = (rho + lambda) / colNorm[j];
        else newW = 0;
        var d = Math.abs(newW - w[j]);
        if (d > maxD) maxD = d;
        w[j] = newW;
      }
      if (maxD < 1e-7) break;
    }
    return w;
  }

  function draw() {
    var c = REG.getColors();
    var logLam = parseFloat(slider.value);
    var lambda = Math.pow(10, logLam);
    valSpan.textContent = lambda.toFixed(3);

    var w = lassoFit(lambda);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = c.text;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Lasso Feature Selection (\u03BB = ' + lambda.toFixed(3) + ')', W / 2, 18);

    // Horizontal bar chart
    var barH = (pH - (nFeats - 1) * 8) / nFeats;
    var maxW = 3;

    for (var j = 0; j < nFeats; j++) {
      var by = pT + j * (barH + 8);
      var isActive = Math.abs(w[j]) > 0.001;

      // Feature label
      ctx.fillStyle = isActive ? c.text : c.textMuted;
      ctx.font = (isActive ? 'bold ' : '') + '11px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(featureNames[j], pL - 8, by + barH / 2 + 4);

      // Background bar
      ctx.fillStyle = c.grid;
      ctx.fillRect(pL, by, pW, barH);

      // Center line (zero)
      var zeroPx = pL + pW / 2;
      ctx.strokeStyle = c.textMuted;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(zeroPx, by); ctx.lineTo(zeroPx, by + barH); ctx.stroke();

      // Actual coefficient bar
      var barWidth = (w[j] / maxW) * (pW / 2);
      var barColor = isSignal[j]
        ? (isActive ? c.accent : c.textMuted)
        : (isActive ? c.valid : c.textMuted);

      ctx.fillStyle = barColor;
      ctx.globalAlpha = isActive ? 0.8 : 0.2;
      if (barWidth >= 0) {
        ctx.fillRect(zeroPx, by, barWidth, barH);
      } else {
        ctx.fillRect(zeroPx + barWidth, by, -barWidth, barH);
      }
      ctx.globalAlpha = 1;

      // True weight indicator
      var truePx = zeroPx + (trueWeights[j] / maxW) * (pW / 2);
      ctx.strokeStyle = c.trueFunc;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(truePx, by + 2); ctx.lineTo(truePx, by + barH - 2); ctx.stroke();
      ctx.setLineDash([]);

      // Value label
      ctx.fillStyle = isActive ? c.text : c.textMuted;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      var labelX = zeroPx + barWidth + (barWidth >= 0 ? 4 : -30);
      ctx.fillText(w[j].toFixed(2), pL + pW + 4, by + barH / 2 + 4);

      // Status tag
      if (!isActive) {
        ctx.fillStyle = c.valid;
        ctx.globalAlpha = 0.5;
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ZERO', pL + pW + 20, by + barH / 2 + 4);
        ctx.globalAlpha = 1;
      }
    }

    // Axis label
    ctx.fillStyle = c.textMuted;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var v = -maxW; v <= maxW; v++) {
      var px = pL + pW / 2 + (v / maxW) * (pW / 2);
      ctx.fillText(v.toFixed(0), px, H - pB + 16);
    }
    ctx.fillStyle = c.text;
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Coefficient value (dashed = true weight)', pL + pW / 2, H - 5);

    // Legend
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.accent;
    ctx.fillRect(pL, H - pB + 24, 12, 10);
    ctx.fillStyle = c.text;
    ctx.fillText('Signal feature', pL + 16, H - pB + 33);
    ctx.fillStyle = c.valid;
    ctx.fillRect(pL + 110, H - pB + 24, 12, 10);
    ctx.fillStyle = c.text;
    ctx.fillText('Noise feature', pL + 126, H - pB + 33);

    var nActive = 0, signalActive = 0, noiseActive = 0;
    for (var j = 0; j < nFeats; j++) {
      if (Math.abs(w[j]) > 0.001) {
        nActive++;
        if (isSignal[j]) signalActive++; else noiseActive++;
      }
    }
    info.textContent = 'Active features: ' + nActive + '/' + nFeats +
      '  (Signal: ' + signalActive + '/3, Noise: ' + noiseActive + '/5)' +
      (noiseActive === 0 && signalActive === 3 ? '  Perfect selection!' : '');
  }

  function regenerate() {
    generateFeatureData();
    draw();
  }

  slider.addEventListener('input', draw);
  document.getElementById('btn-feat-new').addEventListener('click', regenerate);
  REG.onThemeChange(draw);
  regenerate();
})();
</script>

<div class="demo-hint">Start with low &lambda; (all features active) and slowly increase it. The noise features (red bars) get eliminated to zero first, while the signal features (green bars) survive much longer. At the right &lambda;, Lasso perfectly selects only the 3 signal features. This is automatic feature selection.</div>

---

## 7. Elastic Net: The Best of Both Worlds

Elastic Net combines L1 and L2 penalties using a mixing parameter $$\alpha \in [0, 1]$$:

$$J_{\text{ElasticNet}}(\mathbf{w}) = \frac{1}{n}\|\mathbf{y} - \mathbf{X}\mathbf{w}\|^2 + \lambda \left[\alpha \sum_{j=1}^{d}|w_j| + (1-\alpha)\sum_{j=1}^{d}w_j^2\right]$$

- $$\alpha = 1$$: Pure Lasso (L1)
- $$\alpha = 0$$: Pure Ridge (L2)
- $$0 < \alpha < 1$$: Blend of both

Why combine them? Pure Lasso has a limitation: when features are highly correlated, it tends to pick one and ignore the rest. Elastic Net's L2 component encourages correlated features to have similar weights, while the L1 component still drives some to zero.

### Constraint Region Morphing

Watch the constraint region shape morph from a circle (Ridge) to a diamond (Lasso) as $$\alpha$$ changes. The Elastic Net region has **rounded corners** at intermediate values, it can still produce sparsity but is smoother than pure Lasso.

<div class="interactive-demo" id="demo-elastic-shape">
  <canvas id="canvas-elastic-shape"></canvas>
  <div class="demo-controls">
    <label>&alpha; (L1 mix): <input type="range" id="slider-elastic-alpha" min="0" max="1" value="0.5" step="0.02">
    <span class="demo-value" id="val-elastic-alpha">0.50</span></label>
    <label>&lambda;: <input type="range" id="slider-elastic-lam" min="-1" max="2" value="0.5" step="0.05">
    <span class="demo-value" id="val-elastic-lam">3.16</span></label>
  </div>
  <div class="demo-info" id="info-elastic-shape"></div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var canvas = document.getElementById('canvas-elastic-shape');
  var ctx = REG.setupCanvas(canvas, W, H);
  var sliderAlpha = document.getElementById('slider-elastic-alpha');
  var valAlpha = document.getElementById('val-elastic-alpha');
  var sliderLam = document.getElementById('slider-elastic-lam');
  var valLam = document.getElementById('val-elastic-lam');
  var info = document.getElementById('info-elastic-shape');

  var midX = W / 2, midY = H / 2;
  var scale = 110;

  function draw() {
    var c = REG.getColors();
    var alpha = parseFloat(sliderAlpha.value);
    var logLam = parseFloat(sliderLam.value);
    var lambda = Math.pow(10, logLam);
    valAlpha.textContent = alpha.toFixed(2);
    valLam.textContent = lambda.toFixed(2);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Draw axes
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, midY); ctx.lineTo(W - 20, midY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(midX, 20); ctx.lineTo(midX, H - 30); ctx.stroke();
    ctx.fillStyle = c.text;
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('w\u2081', W - 20, midY - 10);
    ctx.fillText('w\u2082', midX + 15, 25);

    // Elastic Net constraint: alpha*|w1| + alpha*|w2| + (1-alpha)*(w1^2+w2^2) <= budget
    // We compute the boundary by finding, for each angle theta, the radius r where
    // alpha*(|r*cos(t)| + |r*sin(t)|) + (1-alpha)*(r^2) = 1
    // This is a quadratic in r for each angle
    var budget = 1.5;

    function constraintRadius(theta) {
      var ct = Math.abs(Math.cos(theta));
      var st = Math.abs(Math.sin(theta));
      var l1part = alpha * (ct + st);
      var l2part = (1 - alpha);
      // l2part * r^2 + l1part * r = budget
      if (l2part < 1e-10) {
        // Pure L1
        return l1part > 0 ? budget / l1part : 10;
      }
      // Quadratic: l2*r^2 + l1*r - budget = 0
      var disc = l1part * l1part + 4 * l2part * budget;
      return (-l1part + Math.sqrt(disc)) / (2 * l2part);
    }

    // Fill the constraint region
    ctx.beginPath();
    var nSteps = 200;
    for (var i = 0; i <= nSteps; i++) {
      var theta = i / nSteps * 2 * Math.PI;
      var r = constraintRadius(theta);
      var px = midX + r * Math.cos(theta) * scale;
      var py = midY - r * Math.sin(theta) * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Color interpolation based on alpha
    var fillR = Math.round(122 + (247 - 122) * alpha);
    var fillG = Math.round(162 + (118 - 162) * alpha);
    var fillB = Math.round(247 + (142 - 247) * alpha);
    ctx.fillStyle = 'rgba(' + fillR + ',' + fillG + ',' + fillB + ',0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgb(' + fillR + ',' + fillG + ',' + fillB + ')';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw ghost shapes: pure L2 and pure L1
    // L2 circle ghost
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = c.l2Border;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(midX, midY, Math.sqrt(budget) * scale, 0, Math.PI * 2);
    ctx.stroke();

    // L1 diamond ghost
    ctx.strokeStyle = c.l1Border;
    var dSize = budget * scale;
    ctx.beginPath();
    ctx.moveTo(midX + dSize, midY);
    ctx.lineTo(midX, midY - dSize);
    ctx.lineTo(midX - dSize, midY);
    ctx.lineTo(midX, midY + dSize);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Labels
    ctx.fillStyle = c.text;
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    var label = alpha === 0 ? 'Pure Ridge (L2)' :
                alpha === 1 ? 'Pure Lasso (L1)' :
                'Elastic Net (\u03B1 = ' + alpha.toFixed(2) + ')';
    ctx.fillText(label, midX, 18);

    ctx.font = '11px Inter, sans-serif';
    ctx.fillStyle = c.textMuted;
    ctx.textAlign = 'left';
    ctx.fillText('\u03B1 = 0: Circle (Ridge)', 50, H - 12);
    ctx.textAlign = 'right';
    ctx.fillText('\u03B1 = 1: Diamond (Lasso)', W - 40, H - 12);

    // Mark corners
    if (alpha > 0.01) {
      var cornerR = constraintRadius(0);
      var corners = [
        { x: midX + cornerR * scale, y: midY },
        { x: midX - cornerR * scale, y: midY },
        { x: midX, y: midY - constraintRadius(Math.PI / 2) * scale },
        { x: midX, y: midY + constraintRadius(Math.PI / 2) * scale }
      ];
      for (var i = 0; i < corners.length; i++) {
        ctx.beginPath();
        ctx.arc(corners[i].x, corners[i].y, 4, 0, Math.PI * 2);
        ctx.fillStyle = c.accent;
        ctx.fill();
      }
    }

    info.textContent = '\u03B1=0 \u2192 Circle (Ridge, no sparsity)  |  \u03B1=1 \u2192 Diamond (Lasso, max sparsity)  |  In between \u2192 rounded corners (some sparsity)';
  }

  sliderAlpha.addEventListener('input', draw);
  sliderLam.addEventListener('input', draw);
  REG.onThemeChange(draw);
  draw();
})();
</script>

<div class="demo-hint">Drag the &alpha; slider slowly from 0 to 1. At &alpha;=0 you see a circle (Ridge). At &alpha;=1, a sharp diamond (Lasso). In between, the shape has rounded corners but still has pointed tips on the axes, this means Elastic Net can still produce sparsity, just less aggressively than pure Lasso.</div>

### Elastic Net Coefficient Paths

Now see how the coefficient paths change as you blend between Ridge and Lasso.

<div class="interactive-demo" id="demo-elastic-path">
  <canvas id="canvas-elastic-path"></canvas>
  <div class="demo-controls">
    <label>&alpha; (L1 mix): <input type="range" id="slider-en-alpha" min="0" max="1" value="0.5" step="0.05">
    <span class="demo-value" id="val-en-alpha">0.50</span></label>
    <label>log<sub>10</sub>(&lambda;): <input type="range" id="slider-en-path" min="-2" max="2.5" value="0" step="0.05">
    <span class="demo-value" id="val-en-path">1.000</span></label>
    <button id="btn-en-path-new">New Data</button>
  </div>
  <div class="demo-info" id="info-en-path"></div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var pL = 55, pR = 20, pT = 25, pB = 45;
  var pW = W - pL - pR, pH = H - pT - pB;
  var canvas = document.getElementById('canvas-elastic-path');
  var ctx = REG.setupCanvas(canvas, W, H);
  var sliderAlpha = document.getElementById('slider-en-alpha');
  var valAlpha = document.getElementById('val-en-alpha');
  var sliderLam = document.getElementById('slider-en-path');
  var valLam = document.getElementById('val-en-path');
  var info = document.getElementById('info-en-path');

  var deg = 10;
  var pts = [];
  var logLamMin = -2, logLamMax = 2.5;
  var lambdaSteps = 60;

  function regenerate() {
    pts = REG.generateData(20, 0.2, 5.8, 0.5);
    draw();
  }

  function draw() {
    var c = REG.getColors();
    var alpha = parseFloat(sliderAlpha.value);
    var curLogLam = parseFloat(sliderLam.value);
    var curLam = Math.pow(10, curLogLam);
    valAlpha.textContent = alpha.toFixed(2);
    valLam.textContent = curLam.toFixed(3);

    // Compute paths
    var pathData = [];
    for (var s = 0; s <= lambdaSteps; s++) {
      var logLam = logLamMin + (logLamMax - logLamMin) * s / lambdaSteps;
      var lam = Math.pow(10, logLam);
      var w;
      if (alpha < 0.01) w = REG.polyFitRidge(pts, deg, lam);
      else if (alpha > 0.99) w = REG.polyFitLasso(pts, deg, lam);
      else w = REG.polyFitElasticNet(pts, deg, lam, alpha);
      pathData.push({ logLam: logLam, w: w });
    }

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var yMax = 0;
    for (var s = 0; s < pathData.length; s++) {
      if (!pathData[s].w) continue;
      for (var j = 1; j <= deg; j++) {
        yMax = Math.max(yMax, Math.abs(pathData[s].w[j]));
      }
    }
    yMax = Math.min(yMax * 1.1, 100);
    if (yMax < 1) yMax = 1;
    var yMin = -yMax;

    REG.drawGrid(ctx, W, H, pL, pR, pT, pB, logLamMin, logLamMax, yMin, yMax, 'log\u2081\u2080(\u03BB)', 'Coefficient value');

    var zeroY = REG.mapY(0, yMin, yMax, pT, pH);
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(pL, zeroY); ctx.lineTo(pL + pW, zeroY); ctx.stroke();
    ctx.setLineDash([]);

    for (var j = 1; j <= deg; j++) {
      ctx.beginPath();
      ctx.strokeStyle = c.coefColors[(j - 1) % c.coefColors.length];
      ctx.lineWidth = 2;
      var started = false;
      for (var s = 0; s < pathData.length; s++) {
        if (!pathData[s].w) continue;
        var px = REG.mapX(pathData[s].logLam, logLamMin, logLamMax, pL, pW);
        var val = Math.max(yMin, Math.min(yMax, pathData[s].w[j]));
        var py = REG.mapY(val, yMin, yMax, pT, pH);
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    var curPx = REG.mapX(curLogLam, logLamMin, logLamMax, pL, pW);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath(); ctx.moveTo(curPx, pT); ctx.lineTo(curPx, pT + pH); ctx.stroke();
    ctx.setLineDash([]);

    var curW;
    if (alpha < 0.01) curW = REG.polyFitRidge(pts, deg, curLam);
    else if (alpha > 0.99) curW = REG.polyFitLasso(pts, deg, curLam);
    else curW = REG.polyFitElasticNet(pts, deg, curLam, alpha);

    if (curW) {
      for (var j = 1; j <= deg; j++) {
        var val = Math.max(yMin, Math.min(yMax, curW[j]));
        var py = REG.mapY(val, yMin, yMax, pT, pH);
        ctx.beginPath();
        ctx.arc(curPx, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = c.coefColors[(j - 1) % c.coefColors.length];
        ctx.fill();
      }
      var nonZero = 0;
      for (var j = 1; j < curW.length; j++) {
        if (Math.abs(curW[j]) > 0.001) nonZero++;
      }
      var label = alpha < 0.01 ? 'Ridge' : (alpha > 0.99 ? 'Lasso' : 'Elastic Net');
      info.textContent = label + '  |  \u03B1=' + alpha.toFixed(2) + '  \u03BB=' + curLam.toFixed(3) + '  |  Non-zero: ' + nonZero + '/' + deg;
    }

    ctx.fillStyle = c.text;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    var titleLabel = alpha < 0.01 ? 'Ridge' : (alpha > 0.99 ? 'Lasso' : 'Elastic Net (\u03B1=' + alpha.toFixed(2) + ')');
    ctx.fillText(titleLabel + ' Coefficient Path', W / 2, 14);
  }

  sliderAlpha.addEventListener('input', draw);
  sliderLam.addEventListener('input', draw);
  document.getElementById('btn-en-path-new').addEventListener('click', regenerate);
  REG.onThemeChange(draw);
  regenerate();
})();
</script>

<div class="demo-hint">Set &alpha;=0 (Ridge) and note that no paths touch zero. Switch to &alpha;=1 (Lasso) and see paths hitting zero abruptly. Now try &alpha;=0.5: paths still hit zero but more gradually. Elastic Net gives you a dial between Ridge smoothness and Lasso sparsity.</div>

---

## 8. Regularized Polynomial Fit: Ridge vs Lasso vs Elastic Net

Now let us combine everything. Below is a high-degree polynomial (degree 12) fit to noisy data. Toggle between Ridge, Lasso, and Elastic Net, and use the $$\lambda$$ slider to control regularization strength. See how each method tames the wild oscillations in its own way.

<div class="interactive-demo" id="demo-combined">
  <canvas id="canvas-combined"></canvas>
  <div class="demo-controls">
    <button id="btn-comb-ridge" class="active">Ridge</button>
    <button id="btn-comb-lasso">Lasso</button>
    <button id="btn-comb-elastic">Elastic Net</button>
    <label>log<sub>10</sub>(&lambda;): <input type="range" id="slider-comb-lam" min="-3" max="3" value="0" step="0.1">
    <span class="demo-value" id="val-comb-lam">1.000</span></label>
    <label id="label-comb-alpha" style="display:none">&alpha;: <input type="range" id="slider-comb-alpha" min="0.1" max="0.9" value="0.5" step="0.05">
    <span class="demo-value" id="val-comb-alpha">0.50</span></label>
    <button id="btn-comb-new">New Data</button>
  </div>
  <div class="demo-info" id="info-combined"></div>
</div>

<script>
(function() {
  var W = 680, H = 420;
  var pL = 50, pR = 15, pT = 20, pB = 40;
  var pW = W - pL - pR, pH = H - pT - pB;
  var canvas = document.getElementById('canvas-combined');
  var ctx = REG.setupCanvas(canvas, W, H);
  var sliderLam = document.getElementById('slider-comb-lam');
  var valLam = document.getElementById('val-comb-lam');
  var sliderAlpha = document.getElementById('slider-comb-alpha');
  var valAlpha = document.getElementById('val-comb-alpha');
  var labelAlpha = document.getElementById('label-comb-alpha');
  var info = document.getElementById('info-combined');

  var btnRidge = document.getElementById('btn-comb-ridge');
  var btnLasso = document.getElementById('btn-comb-lasso');
  var btnElastic = document.getElementById('btn-comb-elastic');

  var xMin = -0.5, xMax = 6.5, yMin = -4, yMax = 6;
  var deg = 12;
  var pts = [];
  var mode = 'ridge'; // 'ridge', 'lasso', 'elastic'

  function regenerate() {
    pts = REG.generateData(25, 0.2, 5.8, 0.5);
    draw();
  }

  function setMode(m) {
    mode = m;
    btnRidge.className = m === 'ridge' ? 'active' : '';
    btnLasso.className = m === 'lasso' ? 'active' : '';
    btnElastic.className = m === 'elastic' ? 'active' : '';
    labelAlpha.style.display = m === 'elastic' ? '' : 'none';
    draw();
  }

  function draw() {
    var c = REG.getColors();
    var logLam = parseFloat(sliderLam.value);
    var lambda = Math.pow(10, logLam);
    var alpha = parseFloat(sliderAlpha.value);
    valLam.textContent = lambda.toFixed(3);
    valAlpha.textContent = alpha.toFixed(2);

    var w, wUnreg, lineColor, methodName;
    wUnreg = REG.polyFitRidge(pts, deg, 1e-10);

    if (mode === 'ridge') {
      w = REG.polyFitRidge(pts, deg, lambda);
      lineColor = c.ridge;
      methodName = 'Ridge';
    } else if (mode === 'lasso') {
      w = REG.polyFitLasso(pts, deg, lambda);
      lineColor = c.lasso;
      methodName = 'Lasso';
    } else {
      w = REG.polyFitElasticNet(pts, deg, lambda, alpha);
      lineColor = c.elastic;
      methodName = 'Elastic Net (\u03B1=' + alpha.toFixed(2) + ')';
    }

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    REG.drawGrid(ctx, W, H, pL, pR, pT, pB, xMin, xMax, yMin, yMax, 'x', 'y');
    REG.drawTrueFunc(ctx, xMin, xMax, yMin, yMax, pL, pW, pT, pH);

    // Unregularized (faded)
    if (wUnreg) {
      ctx.globalAlpha = 0.15;
      REG.drawCurve(ctx, wUnreg, xMin, xMax, yMin, yMax, pL, pW, pT, pH, c.unregularized, 2);
      ctx.globalAlpha = 1;
    }

    // Regularized fit
    if (w) REG.drawCurve(ctx, w, xMin, xMax, yMin, yMax, pL, pW, pT, pH, lineColor, 3);
    REG.drawPoints(ctx, pts, xMin, xMax, yMin, yMax, pL, pW, pT, pH);

    // Legend
    ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.strokeStyle = c.trueFunc; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(pL + 8, pT + 14); ctx.lineTo(pL + 28, pT + 14); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.text; ctx.fillText('True function', pL + 32, pT + 18);

    ctx.strokeStyle = c.unregularized; ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(pL + 8, pT + 32); ctx.lineTo(pL + 28, pT + 32); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.textMuted; ctx.fillText('Unregularized', pL + 32, pT + 36);

    ctx.strokeStyle = lineColor; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pL + 8, pT + 50); ctx.lineTo(pL + 28, pT + 50); ctx.stroke();
    ctx.fillStyle = c.text; ctx.fillText(methodName, pL + 32, pT + 54);

    // Info
    if (w) {
      var mse = REG.polyMSE(w, pts);
      var nonZero = 0;
      for (var j = 1; j < w.length; j++) {
        if (Math.abs(w[j]) > 0.001) nonZero++;
      }
      info.textContent = methodName + '  |  \u03BB=' + lambda.toFixed(3) +
        '  |  Train MSE: ' + mse.toFixed(4) +
        '  |  Non-zero coefs: ' + nonZero + '/' + deg;
    }
  }

  btnRidge.addEventListener('click', function() { setMode('ridge'); });
  btnLasso.addEventListener('click', function() { setMode('lasso'); });
  btnElastic.addEventListener('click', function() { setMode('elastic'); });
  sliderLam.addEventListener('input', draw);
  sliderAlpha.addEventListener('input', draw);
  document.getElementById('btn-comb-new').addEventListener('click', regenerate);
  REG.onThemeChange(draw);
  regenerate();
})();
</script>

<div class="demo-hint">Try each method at &lambda;=1. Ridge smooths the curve but keeps all 12 polynomial terms. Lasso aggressively kills coefficients, the curve may look simpler. Elastic Net is in between. For polynomial regression, Ridge often works best because all terms carry some information. Lasso shines when many features are irrelevant.</div>

---

## 9. Summary: Ridge vs Lasso vs Elastic Net

<table class="summary-table">
  <thead>
    <tr>
      <th>Property</th>
      <th>Ridge (L2)</th>
      <th>Lasso (L1)</th>
      <th>Elastic Net</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Penalty</strong></td>
      <td>$$\lambda \sum w_j^2$$</td>
      <td>$$\lambda \sum |w_j|$$</td>
      <td>$$\lambda[\alpha\sum|w_j| + (1-\alpha)\sum w_j^2]$$</td>
    </tr>
    <tr>
      <td><strong>Constraint shape</strong></td>
      <td>Circle (sphere)</td>
      <td>Diamond (cross-polytope)</td>
      <td>Rounded diamond</td>
    </tr>
    <tr>
      <td><strong>Sparsity</strong></td>
      <td>No, coefficients shrink but never reach zero</td>
      <td>Yes, drives coefficients to exactly zero</td>
      <td>Yes, but less aggressively than Lasso</td>
    </tr>
    <tr>
      <td><strong>Feature selection</strong></td>
      <td>No</td>
      <td>Yes, automatic</td>
      <td>Yes</td>
    </tr>
    <tr>
      <td><strong>Correlated features</strong></td>
      <td>Shares weight among correlated features</td>
      <td>Picks one, ignores the rest</td>
      <td>Groups correlated features together</td>
    </tr>
    <tr>
      <td><strong>Closed-form solution</strong></td>
      <td>Yes: $$(\mathbf{X}^T\mathbf{X}+\lambda\mathbf{I})^{-1}\mathbf{X}^T\mathbf{y}$$</td>
      <td>No, requires iterative methods</td>
      <td>No, requires iterative methods</td>
    </tr>
    <tr>
      <td><strong>When to use</strong></td>
      <td>All features likely relevant; prevent overfitting</td>
      <td>Many irrelevant features; want interpretability</td>
      <td>Correlated features; want sparsity + stability</td>
    </tr>
  </tbody>
</table>

### Key Takeaways

1. **Regularization penalises complexity** by adding a term to the loss function that discourages large weights. The hyperparameter $$\lambda$$ controls the penalty strength.

2. **Ridge (L2)** shrinks all coefficients smoothly toward zero but never eliminates any. It has a nice closed-form solution and works well when all features contribute.

3. **Lasso (L1)** can drive coefficients to exactly zero, performing automatic feature selection. This is explained geometrically by the diamond-shaped constraint region having corners on the axes.

4. **Elastic Net** combines both penalties with a mixing parameter $$\alpha$$. It inherits sparsity from L1 and the grouping effect from L2, making it ideal when features are correlated.

5. **Choosing $$\lambda$$** is typically done via cross-validation: try a range of values on a log scale and pick the one with the lowest validation error.

---

### What's Next

In the next chapter, we will move beyond linear models entirely and explore **logistic regression** for classification tasks. The regularization concepts we learned here will carry over directly, you can (and should!) regularize logistic regression too.

<script>
// Force redraw on page load (handles late theme detection)
window.addEventListener('load', function() {
  setTimeout(function() {
    window.dispatchEvent(new Event('resize'));
  }, 100);
});
</script>
