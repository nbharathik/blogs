---
layout: post
title: "Polynomial Regression & the Bias-Variance Tradeoff: An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Explore polynomial regression and the bias-variance tradeoff with interactive visualizations. Drag a degree slider from underfitting to overfitting, watch training vs validation curves, and build intuition for model complexity - all in your browser."
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
.code-runner-area {
  width: 100%;
  min-height: 220px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  line-height: 1.5;
  tab-size: 2;
}
.code-runner-output {
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}
.feature-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  margin-top: 0.5rem;
}
.feature-table th, .feature-table td {
  border: 1px solid var(--border);
  padding: 0.3rem 0.5rem;
  text-align: right;
}
.feature-table th {
  background: var(--bg-primary);
  font-weight: 600;
}
.feature-table td.highlight-col {
  background: rgba(122, 162, 247, 0.12);
}
</style>

<script>
// ============================================================
// Shared utilities for Polynomial Regression demos
// ============================================================
window.PR = (function() {
  'use strict';

  // ---- Theme colours ----
  function getColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg:          dark ? '#1a1b26' : '#ffffff',
      text:        dark ? '#c0caf5' : '#1a1b26',
      textMuted:   dark ? '#565f89' : '#6b7280',
      grid:        dark ? '#292e42' : '#e5e7eb',
      point:       dark ? '#7aa2f7' : '#2563eb',
      pointStroke: dark ? '#3d59a1' : '#1d4ed8',
      line:        dark ? '#ff9e64' : '#e63946',
      error:       dark ? 'rgba(247,118,142,0.35)' : 'rgba(230,57,70,0.2)',
      errorStroke: dark ? '#f7768e' : '#e63946',
      accent:      dark ? '#9ece6a' : '#16a34a',
      path:        dark ? '#9ece6a' : '#16a34a',
      trueFunc:    dark ? '#bb9af7' : '#7c3aed',
      valid:       dark ? '#e0af68' : '#d97706',
      curve1:      dark ? '#7aa2f7' : '#2563eb',
      curve2:      dark ? '#ff9e64' : '#e63946',
      curve3:      dark ? '#9ece6a' : '#16a34a',
      btnBg:       dark ? '#292e42' : '#f3f4f6'
    };
  }

  // ---- DPR-aware canvas setup ----
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

  // ---- Coordinate mapping ----
  function mapX(v, xMin, xMax, pL, pW) { return pL + (v - xMin) / (xMax - xMin) * pW; }
  function mapY(v, yMin, yMax, pT, pH) { return pT + pH - (v - yMin) / (yMax - yMin) * pH; }
  function unmapX(px, xMin, xMax, pL, pW) { return xMin + (px - pL) / pW * (xMax - xMin); }
  function unmapY(py, yMin, yMax, pT, pH) { return yMin + (pT + pH - py) / pH * (yMax - yMin); }

  // ---- Draw grid + axes ----
  function drawGrid(ctx, w, h, pL, pR, pT, pB, xMin, xMax, yMin, yMax, xLab, yLab) {
    var c = getColors();
    var pW = w - pL - pR, pH = h - pT - pB;
    ctx.strokeStyle = c.grid; ctx.lineWidth = 1;
    var xT = 5, yT = 5;
    for (var i = 0; i <= xT; i++) {
      var x = pL + pW / xT * i;
      ctx.beginPath(); ctx.moveTo(x, pT); ctx.lineTo(x, pT + pH); ctx.stroke();
    }
    for (var j = 0; j <= yT; j++) {
      var y = pT + pH / yT * j;
      ctx.beginPath(); ctx.moveTo(pL, y); ctx.lineTo(pL + pW, y); ctx.stroke();
    }
    ctx.strokeStyle = c.textMuted; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pL, pT + pH); ctx.lineTo(pL + pW, pT + pH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pL, pT); ctx.lineTo(pL, pT + pH); ctx.stroke();
    ctx.fillStyle = c.textMuted; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    for (var i = 0; i <= xT; i++) {
      var v = xMin + (xMax - xMin) / xT * i;
      ctx.fillText(v.toFixed(1), pL + pW / xT * i, pT + pH + 16);
    }
    ctx.textAlign = 'right';
    for (var j = 0; j <= yT; j++) {
      var v = yMax - (yMax - yMin) / yT * j;
      ctx.fillText(v.toFixed(1), pL - 6, pT + pH / yT * j + 4);
    }
    ctx.fillStyle = c.text; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center';
    if (xLab) ctx.fillText(xLab, pL + pW / 2, h - 2);
    if (yLab) {
      ctx.save(); ctx.translate(12, pT + pH / 2);
      ctx.rotate(-Math.PI / 2); ctx.fillText(yLab, 0, 0); ctx.restore();
    }
  }

  // ---- Gaussian random (Box-Muller) ----
  function randn() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // ---- True function: y = sin(1.5x) + 0.5x ----
  function trueFunc(x) {
    return Math.sin(1.5 * x) + 0.5 * x;
  }

  // ---- Generate noisy data from trueFunc ----
  function generateData(n, xMin, xMax, sigma) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var x = xMin + (xMax - xMin) * Math.random();
      var y = trueFunc(x) + sigma * randn();
      pts.push({ x: x, y: y });
    }
    pts.sort(function(a, b) { return a.x - b.x; });
    return pts;
  }

  // ============================================================
  // MATRIX OPERATIONS for polynomial fitting via normal equation
  // ============================================================

  // Build Vandermonde matrix: each row [1, x, x^2, ..., x^d]
  function vandermonde(xs, deg) {
    var n = xs.length, cols = deg + 1;
    var X = [];
    for (var i = 0; i < n; i++) {
      var row = new Array(cols);
      row[0] = 1;
      for (var j = 1; j < cols; j++) row[j] = row[j - 1] * xs[i];
      X.push(row);
    }
    return X;
  }

  // Transpose
  function matT(A) {
    var r = A.length, c = A[0].length;
    var T = [];
    for (var j = 0; j < c; j++) {
      T[j] = new Array(r);
      for (var i = 0; i < r; i++) T[j][i] = A[i][j];
    }
    return T;
  }

  // Matrix multiply
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

  // Matrix-vector multiply
  function matVec(A, v) {
    var r = A.length, c = A[0].length, out = new Array(r);
    for (var i = 0; i < r; i++) {
      var s = 0;
      for (var j = 0; j < c; j++) s += A[i][j] * v[j];
      out[i] = s;
    }
    return out;
  }

  // Gauss-Jordan inversion of a square matrix (returns null if singular)
  function matInv(M) {
    var n = M.length;
    // Augment with identity
    var A = [];
    for (var i = 0; i < n; i++) {
      A[i] = new Array(2 * n);
      for (var j = 0; j < n; j++) A[i][j] = M[i][j];
      for (var j = 0; j < n; j++) A[i][n + j] = (i === j) ? 1 : 0;
    }
    for (var col = 0; col < n; col++) {
      // Partial pivoting
      var maxVal = Math.abs(A[col][col]), maxRow = col;
      for (var r = col + 1; r < n; r++) {
        if (Math.abs(A[r][col]) > maxVal) { maxVal = Math.abs(A[r][col]); maxRow = r; }
      }
      if (maxVal < 1e-14) return null; // singular
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

  // ---- Fit polynomial of degree d, returns weights [w0, w1, ..., wd] ----
  // Uses ridge regularization with small lambda for numerical stability
  function polyFit(pts, deg, lambda) {
    if (typeof lambda === 'undefined') lambda = 1e-8;
    var xs = pts.map(function(p) { return p.x; });
    var ys = pts.map(function(p) { return p.y; });
    var X = vandermonde(xs, deg);
    var Xt = matT(X);
    var XtX = matMul(Xt, X);
    // Add ridge term
    for (var i = 0; i < XtX.length; i++) XtX[i][i] += lambda;
    var XtXinv = matInv(XtX);
    if (!XtXinv) return null;
    // y as column vectors stored as array of 1-element arrays
    var yCol = ys.map(function(v) { return [v]; });
    var Xty = matMul(Xt, yCol);
    var w = matMul(XtXinv, Xty);
    return w.map(function(row) { return row[0]; });
  }

  // ---- Evaluate polynomial at a single x ----
  function polyEval(w, x) {
    var val = 0, xp = 1;
    for (var i = 0; i < w.length; i++) {
      val += w[i] * xp;
      xp *= x;
    }
    return val;
  }

  // ---- Compute MSE of polynomial fit on a set of points ----
  function polyMSE(w, pts) {
    var sum = 0;
    for (var i = 0; i < pts.length; i++) {
      var err = pts[i].y - polyEval(w, pts[i].x);
      sum += err * err;
    }
    return sum / pts.length;
  }

  // ---- Draw data points ----
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

  // ---- Draw polynomial curve ----
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

  // ---- Draw true function curve ----
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

  // ---- Theme observer: re-render all registered callbacks ----
  var _renders = [];
  function onThemeChange(fn) { _renders.push(fn); }
  var _obs = new MutationObserver(function() {
    _renders.forEach(function(fn) { fn(); });
  });
  _obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // ---- Get mouse/touch position relative to canvas ----
  function getPos(canvas, e) {
    var rect = canvas.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }

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
    polyFit: polyFit,
    polyEval: polyEval,
    polyMSE: polyMSE,
    drawPoints: drawPoints,
    drawCurve: drawCurve,
    drawTrueFunc: drawTrueFunc,
    onThemeChange: onThemeChange,
    getPos: getPos,
    matInv: matInv, matMul: matMul, matT: matT, matVec: matVec
  };
})();
</script>

## 1. Introduction: From Lines to Curves

In the [Linear Regression]({{ site.baseurl }}/linear-regression-from-scratch-interactive/) guide, we built linear regression from scratch and saw how a straight line can capture the trend in data. But the real world is rarely so cooperative. Think about how fuel efficiency changes with engine RPM -- it rises, peaks, and then drops. Or how a patient's risk changes with age -- it follows a curve, not a line.

When the underlying relationship between input and output is **nonlinear**, forcing a straight line through the data leaves systematic patterns in the residuals. The model is too simple for the data. We call this **underfitting**.

The natural next step: let our model learn curves. That is exactly what **polynomial regression** does. But with greater flexibility comes a new danger -- the model can bend so aggressively that it memorises noise rather than capturing the true pattern. This is **overfitting**, and the tension between underfitting and overfitting is the **bias-variance tradeoff**, one of the most important concepts in all of machine learning.

In this chapter you will:
- Extend linear regression to polynomial features
- **Drag a slider** to watch a model go from underfitting to overfitting
- See the bias-variance tradeoff come alive through multiple random datasets
- Understand the classic U-shaped validation curve
- Build polynomial regression from scratch in code

Let's dive in.

---

## 2. From Linear to Polynomial

### The idea

Linear regression fits:

$$h(x) = w_0 + w_1 x$$

Polynomial regression simply adds powers of $$x$$ as extra features:

$$h(x) = w_0 + w_1 x + w_2 x^2 + \ldots + w_d x^d$$

where $$d$$ is the **degree** of the polynomial. A degree-1 polynomial is a line. Degree 2 is a parabola. Degree 3 can have one inflection point, and so on.

### It is still "linear" regression

Despite the nonlinear features, this is still a linear model in the parameters $$w_0, w_1, \ldots, w_d$$. We simply construct a new feature matrix (the **Vandermonde matrix**):

$$\mathbf{X} = \begin{bmatrix} 1 & x_1 & x_1^2 & \cdots & x_1^d \\ 1 & x_2 & x_2^2 & \cdots & x_2^d \\ \vdots & \vdots & \vdots & \ddots & \vdots \\ 1 & x_n & x_n^2 & \cdots & x_n^d \end{bmatrix}$$

and solve the same normal equation from the multivariate chapter:

$$\mathbf{w} = (\mathbf{X}^T \mathbf{X})^{-1} \mathbf{X}^T \mathbf{y}$$

### Try it: Compare Degrees 1, 3, and 5

Click on the canvas to add data points, then see polynomial fits of degree 1 (line), degree 3, and degree 5 overlaid.

<div class="interactive-demo" id="demo-compare">
  <canvas id="canvas-compare"></canvas>
  <div class="demo-controls">
    <button id="btn-compare-clear">Clear Points</button>
    <button id="btn-compare-sample">Sample Data</button>
  </div>
  <div class="demo-info" id="info-compare">Click to add points. Minimum 2 required.</div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var pL = 50, pR = 20, pT = 20, pB = 40;
  var pW = W - pL - pR, pH = H - pT - pB;
  var canvas = document.getElementById('canvas-compare');
  var ctx = PR.setupCanvas(canvas, W, H);
  var info = document.getElementById('info-compare');
  var pts = [];
  var xMin = -0.5, xMax = 6.5, yMin = -3, yMax = 5;

  function sampleData() {
    pts = [];
    for (var i = 0; i < 15; i++) {
      var x = 0.3 + 5.5 * Math.random();
      var y = Math.sin(1.2 * x) + 0.4 * x - 1 + 0.4 * PR.randn();
      pts.push({ x: x, y: y });
    }
    draw();
  }

  function draw() {
    var c = PR.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    PR.drawGrid(ctx, W, H, pL, pR, pT, pB, xMin, xMax, yMin, yMax, 'x', 'y');
    PR.drawPoints(ctx, pts, xMin, xMax, yMin, yMax, pL, pW, pT, pH);

    if (pts.length >= 2) {
      var w1 = PR.polyFit(pts, 1);
      var w3 = pts.length >= 4 ? PR.polyFit(pts, 3) : null;
      var w5 = pts.length >= 6 ? PR.polyFit(pts, 5) : null;

      if (w1) PR.drawCurve(ctx, w1, xMin, xMax, yMin, yMax, pL, pW, pT, pH, c.curve1, 2.5);
      if (w3) PR.drawCurve(ctx, w3, xMin, xMax, yMin, yMax, pL, pW, pT, pH, c.curve2, 2.5);
      if (w5) PR.drawCurve(ctx, w5, xMin, xMax, yMin, yMax, pL, pW, pT, pH, c.curve3, 2.5);

      // Legend
      var lx = pL + 10, ly = pT + 16;
      ctx.font = '12px Inter, sans-serif';
      [[c.curve1, 'Degree 1'], [c.curve2, 'Degree 3'], [c.curve3, 'Degree 5']].forEach(function(item, idx) {
        ctx.strokeStyle = item[0]; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(lx, ly + idx * 20); ctx.lineTo(lx + 24, ly + idx * 20); ctx.stroke();
        ctx.fillStyle = c.text; ctx.textAlign = 'left';
        ctx.fillText(item[1], lx + 30, ly + idx * 20 + 4);
      });

      var mse1 = w1 ? PR.polyMSE(w1, pts).toFixed(4) : '-';
      var mse3 = w3 ? PR.polyMSE(w3, pts).toFixed(4) : '-';
      var mse5 = w5 ? PR.polyMSE(w5, pts).toFixed(4) : '-';
      info.textContent = 'MSE  deg1: ' + mse1 + '   deg3: ' + mse3 + '   deg5: ' + mse5;
    } else {
      info.textContent = 'Click to add points. Minimum 2 required.';
    }
  }

  canvas.addEventListener('click', function(e) {
    var pos = PR.getPos(canvas, e);
    var x = PR.unmapX(pos.x, xMin, xMax, pL, pW);
    var y = PR.unmapY(pos.y, yMin, yMax, pT, pH);
    if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
      pts.push({ x: x, y: y });
      draw();
    }
  });
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var pos = PR.getPos(canvas, e);
    var x = PR.unmapX(pos.x, xMin, xMax, pL, pW);
    var y = PR.unmapY(pos.y, yMin, yMax, pT, pH);
    if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
      pts.push({ x: x, y: y });
      draw();
    }
  }, { passive: false });

  document.getElementById('btn-compare-clear').addEventListener('click', function() { pts = []; draw(); });
  document.getElementById('btn-compare-sample').addEventListener('click', sampleData);

  PR.onThemeChange(draw);
  sampleData();
})();
</script>

<div class="demo-hint">Try it: Click to place your own points. Notice how degree 5 wiggles to pass through more points while degree 1 stays straight.</div>

---

## 3. The Degree Slider: From Underfitting to Overfitting

This is the core intuition builder. Below, 25 noisy points are sampled from a hidden true function (shown as a dashed purple line). Use the **degree slider** to control the polynomial degree from 1 to 15 and watch the fitted curve evolve:

- **Degree 1-2**: The curve is too rigid. It cannot capture the true shape. This is **underfitting**.
- **Degree 3-5**: The curve follows the true function nicely. The sweet spot.
- **Degree 10+**: The curve oscillates wildly between points, chasing noise. This is **overfitting**.

<div class="interactive-demo" id="demo-degree">
  <canvas id="canvas-degree"></canvas>
  <div class="demo-controls">
    <label>Degree: <input type="range" id="slider-degree" min="1" max="15" value="3" step="1">
    <span class="demo-value" id="val-degree">3</span></label>
    <button id="btn-degree-new">New Data</button>
  </div>
  <div class="demo-info" id="info-degree"></div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var pL = 50, pR = 20, pT = 20, pB = 40;
  var pW = W - pL - pR, pH = H - pT - pB;
  var canvas = document.getElementById('canvas-degree');
  var ctx = PR.setupCanvas(canvas, W, H);
  var slider = document.getElementById('slider-degree');
  var valSpan = document.getElementById('val-degree');
  var info = document.getElementById('info-degree');

  var xMin = -0.5, xMax = 6.5, yMin = -3.5, yMax = 5.5;
  var pts = [];
  var fits = {}; // cached fits per degree

  function regenerate() {
    pts = PR.generateData(25, 0, 6, 0.5);
    precomputeFits();
    draw();
  }

  function precomputeFits() {
    fits = {};
    for (var d = 1; d <= 15; d++) {
      if (pts.length > d) {
        fits[d] = PR.polyFit(pts, d);
      }
    }
  }

  function draw() {
    var c = PR.getColors();
    var deg = parseInt(slider.value);
    valSpan.textContent = deg;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    PR.drawGrid(ctx, W, H, pL, pR, pT, pB, xMin, xMax, yMin, yMax, 'x', 'y');

    // True function
    PR.drawTrueFunc(ctx, xMin, xMax, yMin, yMax, pL, pW, pT, pH);

    // Fitted curve
    var w = fits[deg];
    if (w) {
      PR.drawCurve(ctx, w, xMin, xMax, yMin, yMax, pL, pW, pT, pH, c.line, 3);
    }

    // Data points
    PR.drawPoints(ctx, pts, xMin, xMax, yMin, yMax, pL, pW, pT, pH);

    // Legend
    ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.strokeStyle = c.trueFunc; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(pL + 10, pT + 16); ctx.lineTo(pL + 34, pT + 16); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.text; ctx.fillText('True function', pL + 40, pT + 20);

    ctx.strokeStyle = c.line; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(pL + 10, pT + 36); ctx.lineTo(pL + 34, pT + 36); ctx.stroke();
    ctx.fillStyle = c.text; ctx.fillText('Degree ' + deg + ' fit', pL + 40, pT + 40);

    // Info
    var label = deg <= 2 ? 'UNDERFITTING' : (deg >= 10 ? 'OVERFITTING' : 'GOOD FIT');
    var mse = w ? PR.polyMSE(w, pts).toFixed(4) : '-';
    info.textContent = 'Training MSE: ' + mse + '   |   ' + label;
  }

  slider.addEventListener('input', draw);
  document.getElementById('btn-degree-new').addEventListener('click', regenerate);
  PR.onThemeChange(draw);
  regenerate();
})();
</script>

<div class="demo-hint">Drag the slider slowly from 1 to 15. Watch the training MSE keep dropping -- but does a lower training error mean a better model? Not necessarily. The curve starts memorising noise.</div>

### Underfitting vs Overfitting

| | Underfitting | Overfitting |
|---|---|---|
| **Degree** | Too low (1-2) | Too high (10+) |
| **Training error** | High | Very low |
| **Test error** | High | High |
| **Symptom** | Model misses the pattern | Model memorises noise |
| **Bias** | High | Low |
| **Variance** | Low | High |

---

## 4. The Bias-Variance Tradeoff

### The Decomposition

For any model, the expected prediction error on new data decomposes as:

$$E\left[(y - \hat{f}(x))^2\right] = \underbrace{\text{Bias}(\hat{f}(x))^2}_{\text{systematic error}} + \underbrace{\text{Var}(\hat{f}(x))}_{\text{sensitivity to training data}} + \underbrace{\sigma^2}_{\text{irreducible noise}}$$

- **Bias** measures how far the average prediction is from the truth. A line fit to curved data will always be off in the same way, no matter how much data you collect.
- **Variance** measures how much the prediction changes when you train on a different random sample. A degree-15 polynomial produces wildly different curves for each sample.
- **Irreducible noise** is the noise floor -- randomness in the data that no model can remove.

The tradeoff: increasing model complexity **decreases bias** but **increases variance**. The optimal complexity balances the two.

### See It: Multiple Training Sets

Below, we generate **10 different random training sets** from the same true function and fit a polynomial to each. All 10 fitted curves are overlaid.

- **Low degree**: All curves are similar (low variance) but systematically wrong (high bias).
- **High degree**: Curves are all over the place (high variance) even though each one fits its own data well (low bias).

<div class="interactive-demo" id="demo-bv">
  <canvas id="canvas-bv"></canvas>
  <div class="demo-controls">
    <label>Degree: <input type="range" id="slider-bv-deg" min="1" max="12" value="2" step="1">
    <span class="demo-value" id="val-bv-deg">2</span></label>
    <button id="btn-bv-resample">Resample All</button>
  </div>
  <div class="demo-info" id="info-bv"></div>
</div>

<script>
(function() {
  var W = 680, H = 400;
  var pL = 50, pR = 20, pT = 20, pB = 40;
  var pW = W - pL - pR, pH = H - pT - pB;
  var canvas = document.getElementById('canvas-bv');
  var ctx = PR.setupCanvas(canvas, W, H);
  var slider = document.getElementById('slider-bv-deg');
  var valSpan = document.getElementById('val-bv-deg');
  var info = document.getElementById('info-bv');

  var xMin = -0.5, xMax = 6.5, yMin = -3.5, yMax = 5.5;
  var NUM_SETS = 10;
  var N_PER_SET = 20;
  var SIGMA = 0.5;
  var datasets = [];
  var allFits = {}; // degree -> array of weight vectors

  var curveColors = [
    '#7aa2f7', '#ff9e64', '#9ece6a', '#f7768e', '#e0af68',
    '#bb9af7', '#73daca', '#2ac3de', '#c0caf5', '#ff7a93'
  ];

  function resample() {
    datasets = [];
    for (var s = 0; s < NUM_SETS; s++) {
      datasets.push(PR.generateData(N_PER_SET, 0, 6, SIGMA));
    }
    precompute();
    draw();
  }

  function precompute() {
    allFits = {};
    for (var d = 1; d <= 12; d++) {
      allFits[d] = [];
      for (var s = 0; s < NUM_SETS; s++) {
        var w = PR.polyFit(datasets[s], d);
        allFits[d].push(w);
      }
    }
  }

  function draw() {
    var c = PR.getColors();
    var deg = parseInt(slider.value);
    valSpan.textContent = deg;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    PR.drawGrid(ctx, W, H, pL, pR, pT, pB, xMin, xMax, yMin, yMax, 'x', 'y');

    // True function
    PR.drawTrueFunc(ctx, xMin, xMax, yMin, yMax, pL, pW, pT, pH);

    // All fitted curves
    var fits = allFits[deg];
    if (fits) {
      for (var s = 0; s < fits.length; s++) {
        if (fits[s]) {
          var col = curveColors[s % curveColors.length];
          PR.drawCurve(ctx, fits[s], xMin, xMax, yMin, yMax, pL, pW, pT, pH, col, 1.8);
        }
      }
    }

    // Compute average bias^2 and variance at sampled x points
    var testXs = [];
    for (var i = 0; i <= 50; i++) testXs.push(0 + 6 * i / 50);
    var avgBias2 = 0, avgVar = 0;
    for (var i = 0; i < testXs.length; i++) {
      var tx = testXs[i];
      var trueY = PR.trueFunc(tx);
      var preds = [];
      for (var s = 0; s < fits.length; s++) {
        if (fits[s]) preds.push(PR.polyEval(fits[s], tx));
      }
      if (preds.length === 0) continue;
      var mean = preds.reduce(function(a, b) { return a + b; }, 0) / preds.length;
      avgBias2 += (mean - trueY) * (mean - trueY);
      var v = 0;
      for (var j = 0; j < preds.length; j++) v += (preds[j] - mean) * (preds[j] - mean);
      avgVar += v / preds.length;
    }
    avgBias2 /= testXs.length;
    avgVar /= testXs.length;

    // Legend
    ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.strokeStyle = c.trueFunc; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(pL + 10, pT + 16); ctx.lineTo(pL + 34, pT + 16); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.text; ctx.fillText('True function', pL + 40, pT + 20);
    ctx.fillText('10 fits (degree ' + deg + ')', pL + 40, pT + 40);

    info.textContent = 'Avg Bias\u00b2: ' + avgBias2.toFixed(4) + '   Avg Variance: ' + avgVar.toFixed(4) + '   Sum: ' + (avgBias2 + avgVar).toFixed(4);
  }

  slider.addEventListener('input', draw);
  document.getElementById('btn-bv-resample').addEventListener('click', resample);
  PR.onThemeChange(draw);
  resample();
})();
</script>

<div class="demo-hint">Try degree 1: all curves are nearly identical (low variance) but they all miss the shape (high bias). Now try degree 10: each curve is different (high variance). The sweet spot is around degree 3-5 where Bias^2 + Variance is minimised.</div>

---

## 5. Training vs Validation Error

The practical way to detect overfitting is to split data into **training** and **validation** sets, then plot error vs model complexity.

- **Training error** always decreases as degree increases (a more flexible model can always fit training data better).
- **Validation error** first decreases (less underfitting), then increases (overfitting). This produces the classic **U-shaped curve**.

The optimal degree is where validation error is lowest.

<div class="interactive-demo" id="demo-trainval">
  <div class="demo-split">
    <div>
      <canvas id="canvas-tv-fit"></canvas>
      <div class="demo-caption">Polynomial fit at selected degree</div>
    </div>
    <div>
      <canvas id="canvas-tv-curve"></canvas>
      <div class="demo-caption">Training & validation error vs degree</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Degree: <input type="range" id="slider-tv-deg" min="1" max="12" value="3" step="1">
    <span class="demo-value" id="val-tv-deg">3</span></label>
    <button id="btn-tv-new">New Split</button>
  </div>
  <div class="demo-info" id="info-tv"></div>
</div>

<script>
(function() {
  var WL = 330, WR = 330, H = 340;
  var pL = 50, pR = 15, pT = 20, pB = 40;

  var canvasFit = document.getElementById('canvas-tv-fit');
  var ctxFit = PR.setupCanvas(canvasFit, WL, H);
  var canvasCurve = document.getElementById('canvas-tv-curve');
  var ctxCurve = PR.setupCanvas(canvasCurve, WR, H);
  var slider = document.getElementById('slider-tv-deg');
  var valSpan = document.getElementById('val-tv-deg');
  var info = document.getElementById('info-tv');

  var xMin = -0.5, xMax = 6.5, yMin = -3.5, yMax = 5.5;
  var trainPts = [], valPts = [];
  var trainErrors = [], valErrors = [];
  var fits = {};

  function splitData() {
    var all = PR.generateData(40, 0, 6, 0.5);
    // Shuffle
    for (var i = all.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = all[i]; all[i] = all[j]; all[j] = tmp;
    }
    trainPts = all.slice(0, 25);
    valPts = all.slice(25);
    computeAll();
    draw();
  }

  function computeAll() {
    fits = {};
    trainErrors = [];
    valErrors = [];
    for (var d = 1; d <= 12; d++) {
      var w = PR.polyFit(trainPts, d);
      fits[d] = w;
      trainErrors.push(w ? PR.polyMSE(w, trainPts) : 0);
      valErrors.push(w ? PR.polyMSE(w, valPts) : 0);
    }
  }

  function draw() {
    var c = PR.getColors();
    var deg = parseInt(slider.value);
    valSpan.textContent = deg;
    var pWL = WL - pL - pR, pHL = H - pT - pB;
    var pWR = WR - pL - pR, pHR = H - pT - pB;

    // ---- Left canvas: fit ----
    ctxFit.fillStyle = c.bg;
    ctxFit.fillRect(0, 0, WL, H);
    PR.drawGrid(ctxFit, WL, H, pL, pR, pT, pB, xMin, xMax, yMin, yMax, 'x', 'y');
    PR.drawTrueFunc(ctxFit, xMin, xMax, yMin, yMax, pL, pWL, pT, pHL);

    // Validation points (different color)
    PR.drawPoints(ctxFit, valPts, xMin, xMax, yMin, yMax, pL, pWL, pT, pHL, c.valid, c.valid, 4);
    // Training points
    PR.drawPoints(ctxFit, trainPts, xMin, xMax, yMin, yMax, pL, pWL, pT, pHL);

    var w = fits[deg];
    if (w) PR.drawCurve(ctxFit, w, xMin, xMax, yMin, yMax, pL, pWL, pT, pHL, c.line, 2.5);

    // Legend
    ctxFit.font = '11px Inter, sans-serif'; ctxFit.textAlign = 'left';
    ctxFit.fillStyle = c.point;
    ctxFit.beginPath(); ctxFit.arc(pL + 14, pT + 14, 4, 0, Math.PI * 2); ctxFit.fill();
    ctxFit.fillStyle = c.text; ctxFit.fillText('Train', pL + 24, pT + 18);
    ctxFit.fillStyle = c.valid;
    ctxFit.beginPath(); ctxFit.arc(pL + 14, pT + 32, 4, 0, Math.PI * 2); ctxFit.fill();
    ctxFit.fillStyle = c.text; ctxFit.fillText('Valid', pL + 24, pT + 36);

    // ---- Right canvas: error curves ----
    ctxCurve.fillStyle = c.bg;
    ctxCurve.fillRect(0, 0, WR, H);

    // Compute y range for error plot
    var allErr = trainErrors.concat(valErrors).filter(function(v) { return isFinite(v); });
    var eMin = 0;
    var eMax = Math.min(Math.max.apply(null, allErr) * 1.1, 5);
    if (eMax <= eMin) eMax = 1;

    PR.drawGrid(ctxCurve, WR, H, pL, pR, pT, pB, 1, 12, eMin, eMax, 'Degree', 'MSE');

    // Training error line
    ctxCurve.beginPath();
    ctxCurve.strokeStyle = c.curve1; ctxCurve.lineWidth = 2.5;
    for (var d = 1; d <= 12; d++) {
      var px = PR.mapX(d, 1, 12, pL, pWR);
      var py = PR.mapY(Math.min(trainErrors[d - 1], eMax), eMin, eMax, pT, pHR);
      if (d === 1) ctxCurve.moveTo(px, py); else ctxCurve.lineTo(px, py);
    }
    ctxCurve.stroke();

    // Validation error line
    ctxCurve.beginPath();
    ctxCurve.strokeStyle = c.valid; ctxCurve.lineWidth = 2.5;
    for (var d = 1; d <= 12; d++) {
      var px = PR.mapX(d, 1, 12, pL, pWR);
      var py = PR.mapY(Math.min(valErrors[d - 1], eMax), eMin, eMax, pT, pHR);
      if (d === 1) ctxCurve.moveTo(px, py); else ctxCurve.lineTo(px, py);
    }
    ctxCurve.stroke();

    // Dots on curves
    for (var d = 1; d <= 12; d++) {
      var px = PR.mapX(d, 1, 12, pL, pWR);
      // Train dot
      var pyT = PR.mapY(Math.min(trainErrors[d - 1], eMax), eMin, eMax, pT, pHR);
      ctxCurve.beginPath(); ctxCurve.arc(px, pyT, 3.5, 0, Math.PI * 2);
      ctxCurve.fillStyle = c.curve1; ctxCurve.fill();
      // Val dot
      var pyV = PR.mapY(Math.min(valErrors[d - 1], eMax), eMin, eMax, pT, pHR);
      ctxCurve.beginPath(); ctxCurve.arc(px, pyV, 3.5, 0, Math.PI * 2);
      ctxCurve.fillStyle = c.valid; ctxCurve.fill();
    }

    // Vertical line at selected degree
    var sx = PR.mapX(deg, 1, 12, pL, pWR);
    ctxCurve.strokeStyle = c.text; ctxCurve.lineWidth = 1;
    ctxCurve.setLineDash([4, 3]);
    ctxCurve.beginPath(); ctxCurve.moveTo(sx, pT); ctxCurve.lineTo(sx, pT + pHR); ctxCurve.stroke();
    ctxCurve.setLineDash([]);

    // Legend
    ctxCurve.font = '11px Inter, sans-serif'; ctxCurve.textAlign = 'left';
    ctxCurve.strokeStyle = c.curve1; ctxCurve.lineWidth = 2.5;
    ctxCurve.beginPath(); ctxCurve.moveTo(pL + 8, pT + 14); ctxCurve.lineTo(pL + 28, pT + 14); ctxCurve.stroke();
    ctxCurve.fillStyle = c.text; ctxCurve.fillText('Train', pL + 34, pT + 18);
    ctxCurve.strokeStyle = c.valid; ctxCurve.lineWidth = 2.5;
    ctxCurve.beginPath(); ctxCurve.moveTo(pL + 8, pT + 32); ctxCurve.lineTo(pL + 28, pT + 32); ctxCurve.stroke();
    ctxCurve.fillStyle = c.text; ctxCurve.fillText('Valid', pL + 34, pT + 36);

    // Find best degree
    var bestDeg = 1, bestVal = Infinity;
    for (var d = 1; d <= 12; d++) {
      if (valErrors[d - 1] < bestVal) { bestVal = valErrors[d - 1]; bestDeg = d; }
    }

    var tErr = trainErrors[deg - 1];
    var vErr = valErrors[deg - 1];
    info.textContent = 'Degree ' + deg + '  |  Train MSE: ' + tErr.toFixed(4) + '  Val MSE: ' + vErr.toFixed(4) + '  |  Best degree: ' + bestDeg;
  }

  slider.addEventListener('input', draw);
  document.getElementById('btn-tv-new').addEventListener('click', splitData);
  PR.onThemeChange(draw);
  splitData();
})();
</script>

<div class="demo-hint">Notice the U-shape of the validation (yellow) curve. Training error (blue) always goes down, but validation error rises after the sweet spot. This gap between training and validation error is the hallmark of overfitting.</div>

---

## 6. Noise Level and Model Complexity

The amount of noise in your data affects which model complexity is optimal. With **low noise**, you can afford a higher-degree polynomial because the true pattern is clearer. With **high noise**, simpler models generalise better.

<div class="interactive-demo" id="demo-noise">
  <div class="demo-split">
    <div>
      <canvas id="canvas-noise-low"></canvas>
      <div class="demo-caption" id="cap-noise-low">Low noise (sigma = 0.2)</div>
    </div>
    <div>
      <canvas id="canvas-noise-high"></canvas>
      <div class="demo-caption" id="cap-noise-high">High noise (sigma = 1.0)</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Degree: <input type="range" id="slider-noise-deg" min="1" max="12" value="4" step="1">
    <span class="demo-value" id="val-noise-deg">4</span></label>
    <label>Low sigma: <input type="range" id="slider-noise-lo" min="0.05" max="0.8" value="0.2" step="0.05">
    <span class="demo-value" id="val-noise-lo">0.20</span></label>
    <label>High sigma: <input type="range" id="slider-noise-hi" min="0.5" max="2.0" value="1.0" step="0.1">
    <span class="demo-value" id="val-noise-hi">1.00</span></label>
    <button id="btn-noise-new">Regenerate</button>
  </div>
  <div class="demo-info" id="info-noise"></div>
</div>

<script>
(function() {
  var WH = 330, H = 340;
  var pL = 50, pR = 15, pT = 20, pB = 40;

  var canvasLo = document.getElementById('canvas-noise-low');
  var ctxLo = PR.setupCanvas(canvasLo, WH, H);
  var canvasHi = document.getElementById('canvas-noise-high');
  var ctxHi = PR.setupCanvas(canvasHi, WH, H);

  var sliderDeg = document.getElementById('slider-noise-deg');
  var valDeg = document.getElementById('val-noise-deg');
  var sliderLo = document.getElementById('slider-noise-lo');
  var valLo = document.getElementById('val-noise-lo');
  var sliderHi = document.getElementById('slider-noise-hi');
  var valHi = document.getElementById('val-noise-hi');
  var infoEl = document.getElementById('info-noise');

  var xMin = -0.5, xMax = 6.5, yMin = -4, yMax = 6;
  var ptsLo = [], ptsHi = [];

  function regenerate() {
    var sLo = parseFloat(sliderLo.value);
    var sHi = parseFloat(sliderHi.value);
    ptsLo = PR.generateData(25, 0, 6, sLo);
    ptsHi = PR.generateData(25, 0, 6, sHi);
    draw();
  }

  function drawSide(ctx, pts, sigma, w2, label) {
    var c = PR.getColors();
    var deg = parseInt(sliderDeg.value);
    var pW2 = w2 - pL - pR, pH2 = H - pT - pB;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w2, H);
    PR.drawGrid(ctx, w2, H, pL, pR, pT, pB, xMin, xMax, yMin, yMax, 'x', 'y');
    PR.drawTrueFunc(ctx, xMin, xMax, yMin, yMax, pL, pW2, pT, pH2);

    var w = PR.polyFit(pts, deg);
    if (w) PR.drawCurve(ctx, w, xMin, xMax, yMin, yMax, pL, pW2, pT, pH2, c.line, 2.5);

    PR.drawPoints(ctx, pts, xMin, xMax, yMin, yMax, pL, pW2, pT, pH2);
    return w ? PR.polyMSE(w, pts) : 0;
  }

  function draw() {
    var deg = parseInt(sliderDeg.value);
    valDeg.textContent = deg;
    var sLo = parseFloat(sliderLo.value);
    var sHi = parseFloat(sliderHi.value);
    valLo.textContent = sLo.toFixed(2);
    valHi.textContent = sHi.toFixed(2);

    document.getElementById('cap-noise-low').textContent = 'Low noise (\u03c3 = ' + sLo.toFixed(2) + ')';
    document.getElementById('cap-noise-high').textContent = 'High noise (\u03c3 = ' + sHi.toFixed(2) + ')';

    var mseLo = drawSide(ctxLo, ptsLo, sLo, WH);
    var mseHi = drawSide(ctxHi, ptsHi, sHi, WH);

    infoEl.textContent = 'Degree ' + deg + '  |  Low-noise MSE: ' + mseLo.toFixed(4) + '  |  High-noise MSE: ' + mseHi.toFixed(4);
  }

  sliderDeg.addEventListener('input', draw);
  sliderLo.addEventListener('input', function() { regenerate(); });
  sliderHi.addEventListener('input', function() { regenerate(); });
  document.getElementById('btn-noise-new').addEventListener('click', regenerate);
  PR.onThemeChange(draw);
  regenerate();
})();
</script>

<div class="demo-hint">Try degree 8 on both panels. In the low-noise case it tracks the true function fairly well. In the high-noise case, the same degree 8 produces wild oscillations. More noise demands a simpler model.</div>

---

## 7. Polynomial Feature Visualization

When we fit a degree-$$d$$ polynomial, we construct a feature matrix where each column is a power of $$x$$. As the degree grows, the numbers in the higher-order columns explode -- this is why **feature scaling** becomes important for numerical stability.

<div class="interactive-demo" id="demo-features">
  <div class="demo-controls">
    <label>Degree: <input type="range" id="slider-feat-deg" min="1" max="8" value="3" step="1">
    <span class="demo-value" id="val-feat-deg">3</span></label>
  </div>
  <div style="overflow-x: auto; margin-top: 0.75rem;">
    <table class="feature-table" id="table-features">
    </table>
  </div>
  <div class="demo-info" id="info-features"></div>
</div>

<script>
(function() {
  var slider = document.getElementById('slider-feat-deg');
  var valSpan = document.getElementById('val-feat-deg');
  var table = document.getElementById('table-features');
  var infoEl = document.getElementById('info-features');

  // Sample x values
  var sampleXs = [0.5, 1.0, 2.0, 3.0, 4.0, 5.0];

  function draw() {
    var deg = parseInt(slider.value);
    valSpan.textContent = deg;

    var html = '<thead><tr><th>x</th>';
    for (var j = 0; j <= deg; j++) {
      html += '<th>x<sup>' + j + '</sup></th>';
    }
    html += '</tr></thead><tbody>';

    var maxVal = 0;
    for (var i = 0; i < sampleXs.length; i++) {
      var x = sampleXs[i];
      html += '<tr><td>' + x.toFixed(1) + '</td>';
      var xp = 1;
      for (var j = 0; j <= deg; j++) {
        var isNew = (j === deg && deg > 1);
        html += '<td' + (isNew ? ' class="highlight-col"' : '') + '>' + xp.toFixed(2) + '</td>';
        xp *= x;
        if (Math.abs(xp) > maxVal) maxVal = Math.abs(xp);
      }
      html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;

    infoEl.textContent = 'Largest value in matrix: ' + maxVal.toFixed(1) + ' — features span ' + Math.ceil(Math.log10(maxVal + 1)) + ' orders of magnitude. Feature scaling helps!';
  }

  slider.addEventListener('input', draw);
  draw();
})();
</script>

<div class="demo-hint">Increase the degree and watch the highlighted column. At degree 8, x=5.0 becomes 5^8 = 390,625. Without normalisation, the normal equation becomes numerically unstable.</div>

---

## 8. Code Runner: Polynomial Regression from Scratch

Here is a complete implementation of polynomial regression using the normal equation. The code runs in your browser -- edit it and click **Run**.

<div class="interactive-demo" id="demo-code">
  <textarea class="code-runner-area" id="code-area">// Polynomial Regression from Scratch
// ====================================

// Step 1: Generate training data from y = sin(1.5x) + 0.5x + noise
var N = 20, sigma = 0.4;
var trainX = [], trainY = [];
for (var i = 0; i < N; i++) {
  var x = 6.0 * i / (N - 1);
  var noise = sigma * (Math.sqrt(-2*Math.log(Math.random())) * Math.cos(2*Math.PI*Math.random()));
  trainX.push(x);
  trainY.push(Math.sin(1.5 * x) + 0.5 * x + noise);
}
print("Generated " + N + " training points");

// Step 2: Build the Vandermonde matrix for degree d
var degree = 4;
function buildVandermonde(xs, deg) {
  var X = [];
  for (var i = 0; i < xs.length; i++) {
    var row = [1];
    for (var j = 1; j <= deg; j++) row.push(Math.pow(xs[i], j));
    X.push(row);
  }
  return X;
}
var X = buildVandermonde(trainX, degree);
print("Vandermonde matrix: " + X.length + " x " + X[0].length);

// Step 3: Solve normal equation w = (X^T X)^{-1} X^T y
// (Using the matrix functions from PR module)
var Xt = PR.matT(X);
var XtX = PR.matMul(Xt, X);

// Add small ridge term for stability
for (var i = 0; i < XtX.length; i++) XtX[i][i] += 1e-8;

var XtXinv = PR.matInv(XtX);
var yCol = trainY.map(function(v) { return [v]; });
var Xty = PR.matMul(Xt, yCol);
var weights = PR.matMul(XtXinv, Xty).map(function(r) { return r[0]; });

print("\nFitted weights (degree " + degree + "):");
for (var i = 0; i < weights.length; i++) {
  print("  w" + i + " = " + weights[i].toFixed(6));
}

// Step 4: Compute training MSE
var mse = 0;
for (var i = 0; i < N; i++) {
  var pred = 0, xp = 1;
  for (var j = 0; j <= degree; j++) { pred += weights[j] * xp; xp *= trainX[i]; }
  mse += Math.pow(trainY[i] - pred, 2);
}
mse /= N;
print("\nTraining MSE: " + mse.toFixed(6));

// Step 5: Predict at a new point
var xNew = 3.0;
var yPred = 0, xp = 1;
for (var j = 0; j <= degree; j++) { yPred += weights[j] * xp; xp *= xNew; }
var yTrue = Math.sin(1.5 * xNew) + 0.5 * xNew;
print("\nPrediction at x=" + xNew + ": " + yPred.toFixed(4) + "  (true: " + yTrue.toFixed(4) + ")");
</textarea>
  <div class="demo-controls">
    <button id="btn-code-run">Run Code</button>
  </div>
  <div class="code-runner-output" id="code-output"></div>
</div>

<script>
(function() {
  var area = document.getElementById('code-area');
  var output = document.getElementById('code-output');

  document.getElementById('btn-code-run').addEventListener('click', function() {
    output.textContent = '';
    var lines = [];
    var printFn = function(msg) { lines.push(String(msg)); };
    try {
      var code = area.value;
      var fn = new Function('print', 'PR', code);
      fn(printFn, PR);
      output.textContent = lines.join('\n');
    } catch (e) {
      output.textContent = 'Error: ' + e.message;
    }
  });

  // Run on load
  document.getElementById('btn-code-run').click();
})();
</script>

<div class="demo-hint">Try changing the degree variable from 4 to 1 or to 12. Watch how the training MSE changes. Also try increasing sigma to see how noise affects the fit.</div>

---

## 9. Summary

We have covered a lot of ground in this chapter. Here is a recap:

| Concept | Key Insight |
|---|---|
| **Polynomial features** | Add $$x^2, x^3, \ldots, x^d$$ to turn nonlinear regression into multivariate linear regression |
| **Degree = model complexity** | Higher degree = more flexible, more parameters |
| **Underfitting** | Model too simple, high bias, high training error |
| **Overfitting** | Model too complex, high variance, low training error but high test error |
| **Bias-variance tradeoff** | Total error = Bias^2 + Variance + Noise. Increasing complexity trades bias for variance |
| **Validation curve** | Training error always decreases; validation error has a U-shape. Pick the minimum |
| **Noise level** | More noise requires simpler models; less noise allows more complexity |
| **Feature scaling** | Polynomial features grow exponentially; normalisation is essential for stability |

### The Big Picture

Polynomial regression is a powerful demonstration of a universal principle: **model complexity must be matched to the signal-to-noise ratio in your data**. Too simple and you miss the pattern. Too complex and you memorise the noise.

But manually choosing the right degree is fragile. In the next chapter, we will learn a principled way to control complexity without choosing a degree by hand: **regularisation**. Ridge regression (L2) and Lasso (L1) add penalty terms that shrink the weights, effectively smoothing the curve even when the degree is high. This lets us use flexible models without the overfitting penalty.

### What's Next

**Next up: [Regularization -- Ridge, Lasso & Elastic Net]({{ site.baseurl }}/regularization-ridge-lasso-interactive/)** -- Add a penalty term to tame overfitting, explore the L1/L2 landscape interactively, and see how regularisation connects to the bias-variance tradeoff.

---

*All visualisations in this post run entirely in your browser using HTML5 Canvas and vanilla JavaScript. No data leaves your machine.*
