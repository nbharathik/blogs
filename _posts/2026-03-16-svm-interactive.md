---
layout: post
title: "Support Vector Machines from Scratch: An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Build intuition for Support Vector Machines with interactive visualizations. Find the maximum margin, explore soft margins with the C parameter, visualize the kernel trick in 3D, and compare RBF vs polynomial kernels - all in your browser."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /svm/
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
.demo-3d-container {
  position: relative;
}
.svm-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.9rem;
}
.svm-table th, .svm-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}
.svm-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
.svm-table td {
  background: var(--bg-primary);
}
</style>

<script>
window.SVM = (function() {
  var S = {};

  S.getColors = function() {
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
      margin: isDark ? '#9ece6a' : '#16a34a',
      sv: isDark ? '#e0af68' : '#d97706',
      isDark: isDark
    };
  };

  S.setupCanvas = function(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  S.observeTheme = function(cb) {
    var obs = new MutationObserver(function() { cb(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb);
  };

  // Generate linearly separable data
  S.genLinear = function(n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var x = Math.random() * 6 - 3;
      var y = Math.random() * 6 - 3;
      var label = (y > x * 0.6 + 0.8 + (Math.random() - 0.5) * 0.3) ? 1 : -1;
      pts.push({ x: x, y: y, label: label });
    }
    // Ensure separation
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var margin = p.y - (p.x * 0.6 + 0.8);
      if (Math.abs(margin) < 0.6) {
        p.y += p.label * 0.6;
      }
    }
    return pts;
  };

  // Generate circular data
  S.genCircular = function(n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var angle = Math.random() * Math.PI * 2;
      var inner = Math.random() < 0.5;
      var r = inner ? Math.random() * 1.2 : 1.8 + Math.random() * 1.2;
      pts.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        label: inner ? -1 : 1
      });
    }
    return pts;
  };

  // Generate XOR data
  S.genXOR = function(n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var x = Math.random() * 6 - 3;
      var y = Math.random() * 6 - 3;
      var label = (x * y > 0) ? 1 : -1;
      pts.push({ x: x, y: y, label: label });
    }
    return pts;
  };

  // Generate moons data
  S.genMoons = function(n) {
    var pts = [];
    var half = Math.floor(n / 2);
    for (var i = 0; i < half; i++) {
      var t = Math.PI * i / half;
      pts.push({
        x: Math.cos(t) + (Math.random() - 0.5) * 0.3,
        y: Math.sin(t) + (Math.random() - 0.5) * 0.3,
        label: -1
      });
    }
    for (var i = 0; i < n - half; i++) {
      var t = Math.PI * i / (n - half);
      pts.push({
        x: 1 - Math.cos(t) + (Math.random() - 0.5) * 0.3,
        y: 0.5 - Math.sin(t) + (Math.random() - 0.5) * 0.3,
        label: 1
      });
    }
    return pts;
  };

  // Train linear SVM via gradient descent on hinge loss
  // Returns { w: [w1,w2], b: number, sv: indices }
  S.trainLinear = function(pts, C, lr, epochs) {
    if (!pts.length) return { w: [0, 0], b: 0, sv: [] };
    C = C || 1.0;
    lr = lr || 0.01;
    epochs = epochs || 800;
    var w = [0, 0], b = 0;
    var m = pts.length;
    for (var ep = 0; ep < epochs; ep++) {
      var dw = [0, 0], db = 0;
      for (var i = 0; i < m; i++) {
        var p = pts[i];
        var score = w[0] * p.x + w[1] * p.y + b;
        var yl = p.label * score;
        if (yl < 1) {
          dw[0] += -p.label * p.x;
          dw[1] += -p.label * p.y;
          db += -p.label;
        }
      }
      w[0] -= lr * (w[0] + C * dw[0]);
      w[1] -= lr * (w[1] + C * dw[1]);
      b -= lr * (C * db);
    }
    // Find support vectors (points close to margin)
    var sv = [];
    for (var i = 0; i < m; i++) {
      var p = pts[i];
      var score = p.label * (w[0] * p.x + w[1] * p.y + b);
      if (score < 1.05) sv.push(i);
    }
    return { w: w, b: b, sv: sv };
  };

  // Simplified kernel SVM using SGD in dual-ish form
  // For visualization: train alphas then evaluate decision function on grid
  S.trainKernel = function(pts, kernelFn, C, epochs) {
    if (!pts.length) return { alphas: [], b: 0 };
    C = C || 1.0;
    epochs = epochs || 200;
    var m = pts.length;
    var alphas = new Array(m);
    for (var i = 0; i < m; i++) alphas[i] = 0;
    var b = 0;

    // Pre-compute kernel matrix
    var K = [];
    for (var i = 0; i < m; i++) {
      K[i] = [];
      for (var j = 0; j < m; j++) {
        K[i][j] = kernelFn(pts[i], pts[j]);
      }
    }

    // SMO-like single pass updates
    var lr = 0.001;
    for (var ep = 0; ep < epochs; ep++) {
      for (var i = 0; i < m; i++) {
        var f = b;
        for (var j = 0; j < m; j++) {
          f += alphas[j] * pts[j].label * K[j][i];
        }
        var margin = pts[i].label * f;
        if (margin < 1) {
          alphas[i] += lr * (1 - margin);
          b += lr * pts[i].label * (1 - margin);
        }
        // Clamp alpha
        if (alphas[i] < 0) alphas[i] = 0;
        if (alphas[i] > C) alphas[i] = C;
      }
    }
    return { alphas: alphas, b: b };
  };

  S.kernelLinear = function(a, b) {
    return a.x * b.x + a.y * b.y;
  };

  S.kernelRBF = function(gamma) {
    return function(a, b) {
      var dx = a.x - b.x, dy = a.y - b.y;
      return Math.exp(-gamma * (dx * dx + dy * dy));
    };
  };

  S.kernelPoly = function(degree) {
    return function(a, b) {
      return Math.pow(a.x * b.x + a.y * b.y + 1, degree);
    };
  };

  S.predict = function(pts, model, kernelFn, px, py) {
    var f = model.b;
    var pt = { x: px, y: py };
    for (var j = 0; j < pts.length; j++) {
      f += model.alphas[j] * pts[j].label * kernelFn(pts[j], pt);
    }
    return f;
  };

  // Draw axes, grid, standard 2D plot setup
  S.drawAxes = function(ctx, W, H, c, xRange, yRange) {
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
    // Border
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);
    // Tick labels
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

  S.toCanvas = function(px, py, W, H, pad, xR, yR) {
    return {
      x: pad + (px - xR[0]) / (xR[1] - xR[0]) * (W - 2 * pad),
      y: H - pad - (py - yR[0]) / (yR[1] - yR[0]) * (H - 2 * pad)
    };
  };

  S.fromCanvas = function(cx, cy, W, H, pad, xR, yR) {
    return {
      x: xR[0] + (cx - pad) / (W - 2 * pad) * (xR[1] - xR[0]),
      y: yR[0] + (H - pad - cy) / (H - 2 * pad) * (yR[1] - yR[0])
    };
  };

  S.drawPoints = function(ctx, pts, W, H, pad, xR, yR, c, svIndices) {
    var svSet = {};
    if (svIndices) {
      for (var i = 0; i < svIndices.length; i++) svSet[svIndices[i]] = true;
    }
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var cp = S.toCanvas(p.x, p.y, W, H, pad, xR, yR);
      if (svSet[i]) {
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = c.sv;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? c.class1 : c.class0;
      ctx.fill();
      ctx.strokeStyle = p.label === 1 ? c.class1 : c.class0;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  return S;
})();
</script>

In the [previous chapter on logistic regression]({% post_url 2026-03-16-logistic-regression-from-scratch-interactive %}), we found **a** decision boundary that separates classes. But there are infinitely many lines that can separate two classes. Which one should we pick?

**Support Vector Machines** answer this question with a beautiful geometric principle: pick the boundary that is as far away as possible from the nearest data points on both sides. This boundary has the **maximum margin** and tends to generalize best to unseen data.

SVMs were one of the most powerful classification algorithms before deep learning, and they remain widely used today for small-to-medium datasets, especially in high-dimensional spaces. Let us build them from scratch.

---

## 1. The Maximum Margin Classifier

Suppose we have two classes of points that are linearly separable. A **decision boundary** is a hyperplane:

$$\mathbf{w} \cdot \mathbf{x} + b = 0$$

where $$\mathbf{w}$$ is the weight vector (normal to the hyperplane) and $$b$$ is the bias term.

The **margin** is the distance between the two closest points from opposite classes to the decision boundary. For a hyperplane parameterized by $$\mathbf{w}$$ and $$b$$, the margin is:

$$\text{margin} = \frac{2}{\|\mathbf{w}\|}$$

The SVM optimization problem is to maximize this margin:

$$\min_{\mathbf{w}, b} \frac{1}{2}\|\mathbf{w}\|^2 \quad \text{subject to} \quad y^{(i)}(\mathbf{w} \cdot \mathbf{x}^{(i)} + b) \geq 1 \; \forall \, i$$

The constraint says every point must be on the correct side of the margin. The points that sit exactly on the margin boundary (where $$y^{(i)}(\mathbf{w} \cdot \mathbf{x}^{(i)} + b) = 1$$) are called **support vectors**.

### Try It: Find the Maximum Margin

<div class="demo-hint">
<strong>Interactive:</strong> Left-click to add <span style="color:#2563eb;font-weight:600">Class -1</span> points. Shift+click (or right-click) to add <span style="color:#e63946;font-weight:600">Class +1</span> points. The SVM will find the maximum margin boundary. Support vectors are highlighted with golden rings. Click <strong>Generate</strong> for a random separable dataset.
</div>

<div class="interactive-demo">
  <canvas id="svm-margin-canvas"></canvas>
  <div class="demo-controls">
    <button id="svm-margin-gen">Generate</button>
    <button id="svm-margin-clear">Clear</button>
    <span class="demo-value" id="svm-margin-info">Add points to begin</span>
  </div>
  <div class="demo-info" id="svm-margin-details"></div>
</div>

<script>
(function() {
  var canvas = document.getElementById('svm-margin-canvas');
  var infoEl = document.getElementById('svm-margin-info');
  var detailsEl = document.getElementById('svm-margin-details');
  var genBtn = document.getElementById('svm-margin-gen');
  var clearBtn = document.getElementById('svm-margin-clear');

  var W = 680, H = 460;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];
  var model = null;

  function train() {
    if (pts.length < 2) { model = null; return; }
    var hasPos = false, hasNeg = false;
    for (var i = 0; i < pts.length; i++) {
      if (pts[i].label === 1) hasPos = true;
      else hasNeg = true;
    }
    if (!hasPos || !hasNeg) { model = null; return; }
    model = SVM.trainLinear(pts, 1.0, 0.005, 1200);
  }

  function draw() {
    var ctx = SVM.setupCanvas(canvas, W, H);
    var c = SVM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    SVM.drawAxes(ctx, W, H, c, xR, yR);

    if (model && (model.w[0] !== 0 || model.w[1] !== 0)) {
      var ww = model.w, bb = model.b;
      var norm = Math.sqrt(ww[0] * ww[0] + ww[1] * ww[1]);
      var marginWidth = 2 / norm;

      // Draw decision regions (light background)
      var imgW = W - 2 * pad, imgH = H - 2 * pad;
      var imgData = ctx.createImageData(imgW, imgH);
      var c0col = c.isDark ? [122, 162, 247] : [37, 99, 235];
      var c1col = c.isDark ? [247, 118, 142] : [230, 57, 70];
      for (var py = 0; py < imgH; py++) {
        for (var px = 0; px < imgW; px++) {
          var coord = SVM.fromCanvas(pad + px, pad + py, W, H, pad, xR, yR);
          var score = ww[0] * coord.x + ww[1] * coord.y + bb;
          var idx = (py * imgW + px) * 4;
          var col = score > 0 ? c1col : c0col;
          imgData.data[idx] = col[0];
          imgData.data[idx + 1] = col[1];
          imgData.data[idx + 2] = col[2];
          imgData.data[idx + 3] = 22;
        }
      }
      ctx.putImageData(imgData, pad, pad);

      // Decision boundary line
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      drawLine(ctx, ww, bb, 0);

      // Margin lines
      ctx.strokeStyle = c.margin;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      drawLine(ctx, ww, bb, 1);
      drawLine(ctx, ww, bb, -1);
      ctx.setLineDash([]);

      // Info
      infoEl.textContent = pts.length + ' points';
      detailsEl.textContent = 'w=[' + ww[0].toFixed(3) + ', ' + ww[1].toFixed(3) +
        '] b=' + bb.toFixed(3) + ' | margin=' + marginWidth.toFixed(3) +
        ' | support vectors: ' + model.sv.length;
    } else {
      infoEl.textContent = pts.length + ' points' + (pts.length >= 2 ? ' (need both classes)' : '');
      detailsEl.textContent = '';
    }

    SVM.drawPoints(ctx, pts, W, H, pad, xR, yR, c, model ? model.sv : null);
  }

  function drawLine(ctx, ww, bb, offset) {
    // w0*x + w1*y + b = offset => y = (offset - b - w0*x) / w1
    // or x = (offset - b - w1*y) / w0
    var pts2 = [];
    if (Math.abs(ww[1]) > 1e-8) {
      for (var i = 0; i < 2; i++) {
        var xx = xR[i];
        var yy = (offset - bb - ww[0] * xx) / ww[1];
        pts2.push(SVM.toCanvas(xx, yy, W, H, pad, xR, yR));
      }
    } else if (Math.abs(ww[0]) > 1e-8) {
      var xx = (offset - bb) / ww[0];
      pts2.push(SVM.toCanvas(xx, yR[0], W, H, pad, xR, yR));
      pts2.push(SVM.toCanvas(xx, yR[1], W, H, pad, xR, yR));
    }
    if (pts2.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts2[0].x, pts2[0].y);
      ctx.lineTo(pts2[1].x, pts2[1].y);
      ctx.stroke();
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (W / rect.width);
    var sy = (e.clientY - rect.top) * (H / rect.height);
    var coord = SVM.fromCanvas(sx, sy, W, H, pad, xR, yR);
    if (coord.x < xR[0] || coord.x > xR[1] || coord.y < yR[0] || coord.y > yR[1]) return;
    var label = e.shiftKey ? 1 : -1;
    pts.push({ x: coord.x, y: coord.y, label: label });
    train();
    draw();
  });

  canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (W / rect.width);
    var sy = (e.clientY - rect.top) * (H / rect.height);
    var coord = SVM.fromCanvas(sx, sy, W, H, pad, xR, yR);
    if (coord.x < xR[0] || coord.x > xR[1] || coord.y < yR[0] || coord.y > yR[1]) return;
    pts.push({ x: coord.x, y: coord.y, label: 1 });
    train();
    draw();
  });

  genBtn.addEventListener('click', function() {
    pts = SVM.genLinear(40);
    train();
    draw();
  });

  clearBtn.addEventListener('click', function() {
    pts = [];
    model = null;
    draw();
  });

  SVM.observeTheme(draw);
  draw();
})();
</script>

Notice how the dashed green lines (the margin) run parallel to the decision boundary, and the golden-ringed points (the **support vectors**) sit exactly on or near these lines. The SVM has found the widest possible "street" between the two classes.

---

## 2. Support Vectors: The Points That Matter

Here is the remarkable property of SVMs: **only the support vectors determine the decision boundary**. If you move a point that is far from the margin, the boundary does not change at all. But move a support vector, and the entire boundary shifts.

This means the SVM is robust to outliers far from the boundary and is determined by a small number of critical points.

### Try It: Drag Points Around

<div class="demo-hint">
<strong>Interactive:</strong> Drag any point. When you drag a point far from the margin (not a support vector), notice the boundary stays the same. When you drag a support vector (golden ring), the boundary shifts.
</div>

<div class="interactive-demo">
  <canvas id="svm-drag-canvas"></canvas>
  <div class="demo-controls">
    <button id="svm-drag-gen">New Data</button>
    <span class="demo-value" id="svm-drag-info"></span>
  </div>
  <div class="demo-info" id="svm-drag-details"></div>
</div>

<script>
(function() {
  var canvas = document.getElementById('svm-drag-canvas');
  var infoEl = document.getElementById('svm-drag-info');
  var detailsEl = document.getElementById('svm-drag-details');
  var genBtn = document.getElementById('svm-drag-gen');

  var W = 680, H = 460;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];
  var model = null;
  var dragIdx = -1;
  var isDragging = false;

  function train() {
    if (pts.length < 4) { model = null; return; }
    model = SVM.trainLinear(pts, 1.0, 0.005, 1200);
  }

  function draw() {
    var ctx = SVM.setupCanvas(canvas, W, H);
    var c = SVM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    SVM.drawAxes(ctx, W, H, c, xR, yR);

    if (model && (model.w[0] !== 0 || model.w[1] !== 0)) {
      var ww = model.w, bb = model.b;
      var norm = Math.sqrt(ww[0] * ww[0] + ww[1] * ww[1]);

      // Decision boundary
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      drawLine(ctx, ww, bb, 0);

      // Margin lines
      ctx.strokeStyle = c.margin;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      drawLine(ctx, ww, bb, 1);
      drawLine(ctx, ww, bb, -1);
      ctx.setLineDash([]);

      detailsEl.textContent = 'margin=' + (2 / norm).toFixed(3) + ' | SVs: ' + model.sv.length +
        ' | Drag a support vector (gold ring) vs a regular point';
    }

    SVM.drawPoints(ctx, pts, W, H, pad, xR, yR, c, model ? model.sv : null);

    if (dragIdx >= 0) {
      var p = pts[dragIdx];
      var cp = SVM.toCanvas(p.x, p.y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 14, 0, Math.PI * 2);
      ctx.strokeStyle = c.text;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function drawLine(ctx, ww, bb, offset) {
    var pts2 = [];
    if (Math.abs(ww[1]) > 1e-8) {
      for (var i = 0; i < 2; i++) {
        var xx = xR[i];
        var yy = (offset - bb - ww[0] * xx) / ww[1];
        pts2.push(SVM.toCanvas(xx, yy, W, H, pad, xR, yR));
      }
    } else if (Math.abs(ww[0]) > 1e-8) {
      var xx = (offset - bb) / ww[0];
      pts2.push(SVM.toCanvas(xx, yR[0], W, H, pad, xR, yR));
      pts2.push(SVM.toCanvas(xx, yR[1], W, H, pad, xR, yR));
    }
    if (pts2.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts2[0].x, pts2[0].y);
      ctx.lineTo(pts2[1].x, pts2[1].y);
      ctx.stroke();
    }
  }

  function getMouseCoord(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (W / rect.width);
    var sy = (e.clientY - rect.top) * (H / rect.height);
    return SVM.fromCanvas(sx, sy, W, H, pad, xR, yR);
  }

  function findNearest(coord) {
    var best = -1, bestD = 0.3;
    for (var i = 0; i < pts.length; i++) {
      var dx = pts[i].x - coord.x, dy = pts[i].y - coord.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  canvas.addEventListener('mousedown', function(e) {
    var coord = getMouseCoord(e);
    dragIdx = findNearest(coord);
    if (dragIdx >= 0) isDragging = true;
  });

  canvas.addEventListener('mousemove', function(e) {
    if (!isDragging || dragIdx < 0) return;
    var coord = getMouseCoord(e);
    pts[dragIdx].x = Math.max(xR[0] + 0.2, Math.min(xR[1] - 0.2, coord.x));
    pts[dragIdx].y = Math.max(yR[0] + 0.2, Math.min(yR[1] - 0.2, coord.y));
    train();
    draw();
  });

  canvas.addEventListener('mouseup', function() {
    isDragging = false;
    dragIdx = -1;
    draw();
  });

  canvas.addEventListener('mouseleave', function() {
    isDragging = false;
    dragIdx = -1;
  });

  // Touch support
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var touch = e.touches[0];
    var rect = canvas.getBoundingClientRect();
    var sx = (touch.clientX - rect.left) * (W / rect.width);
    var sy = (touch.clientY - rect.top) * (H / rect.height);
    var coord = SVM.fromCanvas(sx, sy, W, H, pad, xR, yR);
    dragIdx = findNearest(coord);
    if (dragIdx >= 0) isDragging = true;
  }, { passive: false });

  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (!isDragging || dragIdx < 0) return;
    var touch = e.touches[0];
    var rect = canvas.getBoundingClientRect();
    var sx = (touch.clientX - rect.left) * (W / rect.width);
    var sy = (touch.clientY - rect.top) * (H / rect.height);
    var coord = SVM.fromCanvas(sx, sy, W, H, pad, xR, yR);
    pts[dragIdx].x = Math.max(xR[0] + 0.2, Math.min(xR[1] - 0.2, coord.x));
    pts[dragIdx].y = Math.max(yR[0] + 0.2, Math.min(yR[1] - 0.2, coord.y));
    train();
    draw();
  }, { passive: false });

  canvas.addEventListener('touchend', function() {
    isDragging = false;
    dragIdx = -1;
  });

  function generate() {
    pts = SVM.genLinear(30);
    train();
    draw();
  }

  genBtn.addEventListener('click', generate);
  SVM.observeTheme(draw);
  generate();
})();
</script>

This is a powerful insight: the SVM compresses the entire training set down to just a handful of critical **support vectors**. This is why SVMs are memory-efficient once trained and why they work well even in high-dimensional spaces.

---

## 3. Soft Margin: The C Parameter

Real-world data is noisy. Some points may overlap between classes, making perfect separation impossible (or undesirable - a perfectly separating boundary might be overfitting noise).

The **soft margin** SVM allows some points to be inside the margin or even misclassified, controlled by the parameter $$C$$:

$$J = \frac{1}{2}\|\mathbf{w}\|^2 + C\sum_{i=1}^{m}\max(0, 1 - y^{(i)}(\mathbf{w}\cdot\mathbf{x}^{(i)} + b))$$

This is the **hinge loss** plus L2 regularization:

- **Large C**: Pay a heavy penalty for misclassifications. Narrow margin, few errors. Risk overfitting.
- **Small C**: Allow more misclassifications. Wider margin, more errors. Better generalization.

### Try It: Adjust C

<div class="demo-hint">
<strong>Interactive:</strong> Drag the <strong>C</strong> slider to see how the margin width and number of misclassifications change. Low C = wide margin (underfitting). High C = narrow margin (overfitting). Points marked with <strong>X</strong> are misclassified.
</div>

<div class="interactive-demo">
  <canvas id="svm-c-canvas"></canvas>
  <div class="demo-controls">
    <label>C: <input type="range" id="svm-c-slider" min="-2" max="2" step="0.05" value="0"></label>
    <span class="demo-value" id="svm-c-val">C = 1.00</span>
    <button id="svm-c-gen">New Data</button>
  </div>
  <div class="demo-info" id="svm-c-info"></div>
</div>

<script>
(function() {
  var canvas = document.getElementById('svm-c-canvas');
  var cSlider = document.getElementById('svm-c-slider');
  var cValEl = document.getElementById('svm-c-val');
  var infoEl = document.getElementById('svm-c-info');
  var genBtn = document.getElementById('svm-c-gen');

  var W = 680, H = 460;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];

  function genNoisyData() {
    pts = [];
    for (var i = 0; i < 50; i++) {
      var x = Math.random() * 6 - 3;
      var y = Math.random() * 6 - 3;
      var label = (y > x * 0.5 + 0.2 + (Math.random() - 0.5) * 2.5) ? 1 : -1;
      pts.push({ x: x, y: y, label: label });
    }
  }

  function draw() {
    var C = Math.pow(10, parseFloat(cSlider.value));
    cValEl.textContent = 'C = ' + C.toFixed(2);

    var model = SVM.trainLinear(pts, C, 0.005, 1200);
    var ctx = SVM.setupCanvas(canvas, W, H);
    var c = SVM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    SVM.drawAxes(ctx, W, H, c, xR, yR);

    var ww = model.w, bb = model.b;
    if (ww[0] === 0 && ww[1] === 0) {
      SVM.drawPoints(ctx, pts, W, H, pad, xR, yR, c, null);
      return;
    }

    var norm = Math.sqrt(ww[0] * ww[0] + ww[1] * ww[1]);
    var marginWidth = 2 / norm;

    // Decision regions
    var imgW = W - 2 * pad, imgH = H - 2 * pad;
    var imgData = ctx.createImageData(imgW, imgH);
    var c0col = c.isDark ? [122, 162, 247] : [37, 99, 235];
    var c1col = c.isDark ? [247, 118, 142] : [230, 57, 70];
    for (var py = 0; py < imgH; py++) {
      for (var px = 0; px < imgW; px++) {
        var coord = SVM.fromCanvas(pad + px, pad + py, W, H, pad, xR, yR);
        var score = ww[0] * coord.x + ww[1] * coord.y + bb;
        var idx = (py * imgW + px) * 4;
        var col = score > 0 ? c1col : c0col;
        imgData.data[idx] = col[0];
        imgData.data[idx + 1] = col[1];
        imgData.data[idx + 2] = col[2];
        imgData.data[idx + 3] = 22;
      }
    }
    ctx.putImageData(imgData, pad, pad);

    // Boundary
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    drawLine(ctx, ww, bb, 0);

    // Margin
    ctx.strokeStyle = c.margin;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    drawLine(ctx, ww, bb, 1);
    drawLine(ctx, ww, bb, -1);
    ctx.setLineDash([]);

    // Draw points and mark misclassified
    var misclass = 0;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var cp = SVM.toCanvas(p.x, p.y, W, H, pad, xR, yR);
      var score = p.label * (ww[0] * p.x + ww[1] * p.y + bb);
      var isSV = model.sv.indexOf(i) >= 0;

      if (isSV) {
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = c.sv;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? c.class1 : c.class0;
      ctx.fill();

      // Mark misclassified with X
      if (score < 0) {
        misclass++;
        ctx.strokeStyle = c.text;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cp.x - 7, cp.y - 7); ctx.lineTo(cp.x + 7, cp.y + 7);
        ctx.moveTo(cp.x + 7, cp.y - 7); ctx.lineTo(cp.x - 7, cp.y + 7);
        ctx.stroke();
      }
    }

    infoEl.textContent = 'margin=' + marginWidth.toFixed(3) +
      ' | misclassified=' + misclass +
      ' | SVs=' + model.sv.length;
  }

  function drawLine(ctx, ww, bb, offset) {
    var pts2 = [];
    if (Math.abs(ww[1]) > 1e-8) {
      for (var i = 0; i < 2; i++) {
        var xx = xR[i];
        var yy = (offset - bb - ww[0] * xx) / ww[1];
        pts2.push(SVM.toCanvas(xx, yy, W, H, pad, xR, yR));
      }
    } else if (Math.abs(ww[0]) > 1e-8) {
      var xx = (offset - bb) / ww[0];
      pts2.push(SVM.toCanvas(xx, yR[0], W, H, pad, xR, yR));
      pts2.push(SVM.toCanvas(xx, yR[1], W, H, pad, xR, yR));
    }
    if (pts2.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts2[0].x, pts2[0].y);
      ctx.lineTo(pts2[1].x, pts2[1].y);
      ctx.stroke();
    }
  }

  cSlider.addEventListener('input', draw);
  genBtn.addEventListener('click', function() { genNoisyData(); draw(); });
  SVM.observeTheme(draw);
  genNoisyData();
  draw();
})();
</script>

The C parameter is the most important hyperparameter for linear SVMs. In practice you would use cross-validation to find the best C for your dataset.

---

## 4. The Kernel Trick: Why It Is Genius

So far we have drawn straight lines. But what if the data is not linearly separable? Consider a dataset where one class forms a circle inside the other.

### Try It: Can You Separate These With a Straight Line?

<div class="demo-hint">
<strong>Interactive:</strong> This circular dataset cannot be separated by any straight line. Click anywhere to try placing a boundary - you will always misclassify some points. This motivates the kernel trick.
</div>

<div class="interactive-demo">
  <canvas id="svm-nosep-canvas"></canvas>
  <div class="demo-controls">
    <button id="svm-nosep-gen">Regenerate</button>
    <button id="svm-nosep-clear">Clear Line</button>
    <span class="demo-value" id="svm-nosep-info">Click two points to draw a line</span>
  </div>
</div>

<script>
(function() {
  var canvas = document.getElementById('svm-nosep-canvas');
  var infoEl = document.getElementById('svm-nosep-info');
  var genBtn = document.getElementById('svm-nosep-gen');
  var clearBtn = document.getElementById('svm-nosep-clear');

  var W = 680, H = 460;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];
  var lineP1 = null, lineP2 = null;

  function generate() {
    pts = SVM.genCircular(60);
    lineP1 = null;
    lineP2 = null;
    draw();
  }

  function draw() {
    var ctx = SVM.setupCanvas(canvas, W, H);
    var c = SVM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    SVM.drawAxes(ctx, W, H, c, xR, yR);

    // If we have a line, compute accuracy
    if (lineP1 && lineP2) {
      var dx = lineP2.x - lineP1.x, dy = lineP2.y - lineP1.y;
      // Normal: (-dy, dx)
      var correct = 0;
      for (var i = 0; i < pts.length; i++) {
        var side = -dy * (pts[i].x - lineP1.x) + dx * (pts[i].y - lineP1.y);
        var predicted = side > 0 ? 1 : -1;
        if (predicted === pts[i].label) correct++;
      }
      var acc = (correct / pts.length * 100).toFixed(1);

      // Draw the line
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 2;
      var cp1 = SVM.toCanvas(lineP1.x, lineP1.y, W, H, pad, xR, yR);
      var cp2 = SVM.toCanvas(lineP2.x, lineP2.y, W, H, pad, xR, yR);
      // Extend the line
      var ldx = cp2.x - cp1.x, ldy = cp2.y - cp1.y;
      var len = Math.sqrt(ldx * ldx + ldy * ldy);
      if (len > 0) {
        var ext = 1000;
        ctx.beginPath();
        ctx.moveTo(cp1.x - ldx / len * ext, cp1.y - ldy / len * ext);
        ctx.lineTo(cp1.x + ldx / len * ext, cp1.y + ldy / len * ext);
        ctx.stroke();
      }

      infoEl.textContent = 'Accuracy: ' + acc + '% - cannot reach 100%!';
    } else if (lineP1) {
      infoEl.textContent = 'Click second point to complete the line';
      var cp1 = SVM.toCanvas(lineP1.x, lineP1.y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp1.x, cp1.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = c.accent;
      ctx.fill();
    } else {
      infoEl.textContent = 'Click two points to draw a separating line';
    }

    SVM.drawPoints(ctx, pts, W, H, pad, xR, yR, c, null);
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (W / rect.width);
    var sy = (e.clientY - rect.top) * (H / rect.height);
    var coord = SVM.fromCanvas(sx, sy, W, H, pad, xR, yR);
    if (!lineP1) {
      lineP1 = coord;
    } else if (!lineP2) {
      lineP2 = coord;
    } else {
      lineP1 = coord;
      lineP2 = null;
    }
    draw();
  });

  clearBtn.addEventListener('click', function() {
    lineP1 = null; lineP2 = null; draw();
  });
  genBtn.addEventListener('click', generate);
  SVM.observeTheme(draw);
  generate();
})();
</script>

No matter where you place the line, you cannot get 100% accuracy. The data is **not linearly separable** in 2D.

The kernel trick solves this by implicitly mapping the data into a higher-dimensional space where it **is** linearly separable, without ever computing the coordinates in that space explicitly.

---

## 5. Kernel Trick Visualization: The 3D Lift

The key insight: consider the mapping:

$$\phi(x_1, x_2) = (x_1, \; x_2, \; x_1^2 + x_2^2)$$

This adds a third dimension equal to the distance from the origin squared. Points near the center (inner class) get small values for the third coordinate, while points far from the center (outer class) get large values. In this 3D space, a flat plane can separate the two classes!

### Try It: Rotate the 3D View

<div class="demo-hint">
<strong>Interactive:</strong> Drag to rotate the 3D view. The same circular data is now plotted in 3D using the mapping $$\phi(x_1,x_2) = (x_1, x_2, x_1^2+x_2^2)$$. The grey plane separates the classes perfectly. The <strong>inner</strong> class (blue) sits below the plane, the <strong>outer</strong> class (pink) sits above it.
</div>

<div class="interactive-demo">
  <div class="demo-3d-container">
    <canvas id="svm-3d-canvas" style="cursor:grab"></canvas>
  </div>
  <div class="demo-caption">Drag to rotate. Blue = inner class (low z). Pink = outer class (high z). Grey plane = separating hyperplane.</div>
  <div class="demo-controls">
    <button id="svm-3d-gen">New Data</button>
    <button id="svm-3d-reset">Reset View</button>
    <label>Plane height: <input type="range" id="svm-3d-plane" min="0.5" max="5" step="0.1" value="2.5"></label>
    <span class="demo-value" id="svm-3d-plane-val">z = 2.50</span>
  </div>
</div>

<script>
(function() {
  var canvas = document.getElementById('svm-3d-canvas');
  var genBtn = document.getElementById('svm-3d-gen');
  var resetBtn = document.getElementById('svm-3d-reset');
  var planeSlider = document.getElementById('svm-3d-plane');
  var planeValEl = document.getElementById('svm-3d-plane-val');

  var W = 680, H = 500;
  var azimuth = 35, elevation = 25;
  var isDragging = false, lastMX = 0, lastMY = 0;
  var pts = [];

  function generate() {
    pts = SVM.genCircular(60);
    draw();
  }

  function draw() {
    var ctx = SVM.setupCanvas(canvas, W, H);
    var c = SVM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var planeZ = parseFloat(planeSlider.value);
    planeValEl.textContent = 'z = ' + planeZ.toFixed(2);

    // Projection setup
    var az = azimuth * Math.PI / 180, el = elevation * Math.PI / 180;
    var cosAz = Math.cos(az), sinAz = Math.sin(az);
    var cosEl = Math.cos(el), sinEl = Math.sin(el);
    var cx = W / 2, cy = H / 2 + 30, scale = 55;

    function project(nx, ny, nz) {
      var x3 = nx * cosAz - ny * sinAz;
      var y3 = nx * sinAz + ny * cosAz;
      var zp = y3 * sinEl + nz * cosEl;
      return { x: cx + x3 * scale, y: cy - zp * scale, depth: y3 * cosEl - nz * sinEl };
    }

    // Grid at z=0
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    var gN = 8;
    for (var i = 0; i <= gN; i++) {
      var t = -4 + 8 * i / gN;
      var p1 = project(t, -4, 0), p2 = project(t, 4, 0);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      p1 = project(-4, t, 0); p2 = project(4, t, 0);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = c.textMuted;
    ctx.lineWidth = 1.5;
    var origin = project(-4, -4, 0);
    var axEnd;
    axEnd = project(4.5, -4, 0);
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(axEnd.x, axEnd.y); ctx.stroke();
    axEnd = project(-4, 4.5, 0);
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(axEnd.x, axEnd.y); ctx.stroke();
    axEnd = project(-4, -4, 9);
    ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(axEnd.x, axEnd.y); ctx.stroke();

    ctx.fillStyle = c.text;
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    var lbl;
    lbl = project(5, -4, 0); ctx.fillText('x\u2081', lbl.x, lbl.y + 5);
    lbl = project(-4, 5, 0); ctx.fillText('x\u2082', lbl.x, lbl.y + 5);
    lbl = project(-4.3, -4, 9.5); ctx.fillText('x\u2081\u00B2+x\u2082\u00B2', lbl.x, lbl.y);

    // Collect drawables for depth sorting
    var drawables = [];

    // Separating plane
    var planeCorners = [
      project(-4, -4, planeZ), project(4, -4, planeZ),
      project(4, 4, planeZ), project(-4, 4, planeZ)
    ];
    var planeDepth = 0;
    for (var i = 0; i < 4; i++) planeDepth += planeCorners[i].depth;
    planeDepth /= 4;
    drawables.push({ type: 'plane', corners: planeCorners, depth: planeDepth });

    // Data points in 3D
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var z = p.x * p.x + p.y * p.y;
      var proj = project(p.x, p.y, z);
      drawables.push({ type: 'point', proj: proj, label: p.label, depth: proj.depth });
    }

    // Sort by depth (back to front)
    drawables.sort(function(a, b) { return a.depth - b.depth; });

    // Draw
    for (var i = 0; i < drawables.length; i++) {
      var d = drawables[i];
      if (d.type === 'plane') {
        ctx.beginPath();
        ctx.moveTo(d.corners[0].x, d.corners[0].y);
        for (var j = 1; j < 4; j++) ctx.lineTo(d.corners[j].x, d.corners[j].y);
        ctx.closePath();
        ctx.fillStyle = c.isDark ? 'rgba(86,95,137,0.25)' : 'rgba(148,163,184,0.25)';
        ctx.fill();
        ctx.strokeStyle = c.textMuted;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(d.proj.x, d.proj.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = d.label === 1 ? c.class1 : c.class0;
        ctx.fill();
        ctx.strokeStyle = d.label === 1 ? c.class1 : c.class0;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Vertical drop lines for a few points
    for (var i = 0; i < pts.length; i += 5) {
      var p = pts[i];
      var z = p.x * p.x + p.y * p.y;
      var top = project(p.x, p.y, z);
      var bot = project(p.x, p.y, 0);
      ctx.strokeStyle = c.isDark ? 'rgba(86,95,137,0.3)' : 'rgba(148,163,184,0.3)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(bot.x, bot.y); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Mouse drag rotation
  canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    lastMX = e.clientX;
    lastMY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    var dx = e.clientX - lastMX, dy = e.clientY - lastMY;
    azimuth += dx * 0.5;
    elevation = Math.max(-80, Math.min(80, elevation - dy * 0.5));
    lastMX = e.clientX;
    lastMY = e.clientY;
    draw();
  });

  window.addEventListener('mouseup', function() {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });

  // Touch drag
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    isDragging = true;
    lastMX = e.touches[0].clientX;
    lastMY = e.touches[0].clientY;
  }, { passive: false });

  canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (!isDragging) return;
    var dx = e.touches[0].clientX - lastMX, dy = e.touches[0].clientY - lastMY;
    azimuth += dx * 0.5;
    elevation = Math.max(-80, Math.min(80, elevation - dy * 0.5));
    lastMX = e.touches[0].clientX;
    lastMY = e.touches[0].clientY;
    draw();
  }, { passive: false });

  canvas.addEventListener('touchend', function() { isDragging = false; });

  planeSlider.addEventListener('input', draw);
  genBtn.addEventListener('click', generate);
  resetBtn.addEventListener('click', function() {
    azimuth = 35; elevation = 25; draw();
  });
  SVM.observeTheme(draw);
  generate();
})();
</script>

This is the essence of the **kernel trick**: by adding a dimension $$z = x_1^2 + x_2^2$$, the circular data that was inseparable in 2D becomes perfectly separable in 3D with a flat plane. The beautiful part is that we never need to explicitly compute these coordinates - the kernel function implicitly operates in this higher-dimensional space.

---

## 6. The RBF Kernel

The most popular kernel is the **Radial Basis Function** (RBF) kernel, also called the Gaussian kernel:

$$K(\mathbf{x}, \mathbf{x}') = \exp\left(-\gamma \|\mathbf{x} - \mathbf{x}'\|^2\right)$$

The parameter $$\gamma$$ controls how "local" the influence of each training point is:

- **Small $$\gamma$$**: Each point influences a large area. Smooth, simple boundary.
- **Large $$\gamma$$**: Each point influences only its immediate neighborhood. Complex, wiggly boundary.

The RBF kernel implicitly maps data into an **infinite-dimensional** space. It can learn any boundary shape, making it extremely powerful - but also prone to overfitting if $$\gamma$$ is too large.

### Try It: Adjust Gamma

<div class="demo-hint">
<strong>Interactive:</strong> Drag the <strong>gamma</strong> slider to see how the decision boundary changes. The colored background shows the decision regions. Low gamma = smooth. High gamma = complex (wraps tightly around each point). Switch datasets with the buttons.
</div>

<div class="interactive-demo">
  <canvas id="svm-rbf-canvas"></canvas>
  <div class="demo-controls">
    <label>&gamma;: <input type="range" id="svm-rbf-gamma" min="-1.5" max="1.5" step="0.05" value="0"></label>
    <span class="demo-value" id="svm-rbf-gamma-val">&gamma; = 1.00</span>
    <label>C: <input type="range" id="svm-rbf-c" min="-1" max="2" step="0.05" value="0.5"></label>
    <span class="demo-value" id="svm-rbf-c-val">C = 3.16</span>
  </div>
  <div class="demo-controls">
    <button id="svm-rbf-circular">Circular</button>
    <button id="svm-rbf-moons">Moons</button>
    <button id="svm-rbf-xor">XOR</button>
    <button id="svm-rbf-linear">Linear</button>
  </div>
  <div class="demo-info" id="svm-rbf-info"></div>
</div>

<script>
(function() {
  var canvas = document.getElementById('svm-rbf-canvas');
  var gammaSlider = document.getElementById('svm-rbf-gamma');
  var gammaValEl = document.getElementById('svm-rbf-gamma-val');
  var cSlider = document.getElementById('svm-rbf-c');
  var cValEl = document.getElementById('svm-rbf-c-val');
  var infoEl = document.getElementById('svm-rbf-info');

  var W = 680, H = 480;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];
  var cachedModel = null;
  var cachedGamma = -1, cachedC = -1;
  var drawTimeout = null;

  function setDataset(name) {
    if (name === 'circular') pts = SVM.genCircular(50);
    else if (name === 'moons') pts = SVM.genMoons(60);
    else if (name === 'xor') pts = SVM.genXOR(50);
    else pts = SVM.genLinear(40);
    cachedGamma = -1;
    scheduleDraw();
  }

  function scheduleDraw() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(draw, 30);
  }

  function draw() {
    var gamma = Math.pow(10, parseFloat(gammaSlider.value));
    var C = Math.pow(10, parseFloat(cSlider.value));
    gammaValEl.textContent = '\u03b3 = ' + gamma.toFixed(2);
    cValEl.textContent = 'C = ' + C.toFixed(2);

    var ctx = SVM.setupCanvas(canvas, W, H);
    var c = SVM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    SVM.drawAxes(ctx, W, H, c, xR, yR);

    if (pts.length < 4) return;

    // Train if params changed
    if (gamma !== cachedGamma || C !== cachedC) {
      var kernelFn = SVM.kernelRBF(gamma);
      cachedModel = SVM.trainKernel(pts, kernelFn, C, 150);
      cachedGamma = gamma;
      cachedC = C;
    }

    var kernelFn = SVM.kernelRBF(gamma);
    var model = cachedModel;

    // Draw decision regions on grid
    var imgW = W - 2 * pad, imgH = H - 2 * pad;
    var step = 4; // pixel step for performance
    var imgData = ctx.createImageData(imgW, imgH);
    var c0col = c.isDark ? [122, 162, 247] : [37, 99, 235];
    var c1col = c.isDark ? [247, 118, 142] : [230, 57, 70];

    for (var py = 0; py < imgH; py += step) {
      for (var px = 0; px < imgW; px += step) {
        var coord = SVM.fromCanvas(pad + px, pad + py, W, H, pad, xR, yR);
        var f = SVM.predict(pts, model, kernelFn, coord.x, coord.y);
        var col = f > 0 ? c1col : c0col;
        var alpha = Math.min(60, Math.abs(f) * 30 + 15);
        for (var dy = 0; dy < step && py + dy < imgH; dy++) {
          for (var dx = 0; dx < step && px + dx < imgW; dx++) {
            var idx = ((py + dy) * imgW + (px + dx)) * 4;
            imgData.data[idx] = col[0];
            imgData.data[idx + 1] = col[1];
            imgData.data[idx + 2] = col[2];
            imgData.data[idx + 3] = alpha;
          }
        }
      }
    }
    ctx.putImageData(imgData, pad, pad);

    // Draw decision boundary contour (f=0)
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2;
    var gridRes = 60;
    var grid = [];
    for (var gy = 0; gy <= gridRes; gy++) {
      grid[gy] = [];
      for (var gx = 0; gx <= gridRes; gx++) {
        var gxv = xR[0] + (xR[1] - xR[0]) * gx / gridRes;
        var gyv = yR[0] + (yR[1] - yR[0]) * gy / gridRes;
        grid[gy][gx] = SVM.predict(pts, model, kernelFn, gxv, gyv);
      }
    }

    // Marching squares for contour at f=0
    for (var gy = 0; gy < gridRes; gy++) {
      for (var gx = 0; gx < gridRes; gx++) {
        var v00 = grid[gy][gx], v10 = grid[gy][gx + 1];
        var v01 = grid[gy + 1][gx], v11 = grid[gy + 1][gx + 1];
        var s00 = v00 > 0 ? 1 : 0, s10 = v10 > 0 ? 1 : 0;
        var s01 = v01 > 0 ? 1 : 0, s11 = v11 > 0 ? 1 : 0;
        var code = s00 | (s10 << 1) | (s01 << 2) | (s11 << 3);
        if (code === 0 || code === 15) continue;

        var x0 = xR[0] + (xR[1] - xR[0]) * gx / gridRes;
        var x1 = xR[0] + (xR[1] - xR[0]) * (gx + 1) / gridRes;
        var y0 = yR[0] + (yR[1] - yR[0]) * gy / gridRes;
        var y1 = yR[0] + (yR[1] - yR[0]) * (gy + 1) / gridRes;

        function interp(va, vb, a, b) {
          var t = va / (va - vb);
          return a + t * (b - a);
        }

        var segments = [];
        var top = { x: interp(v00, v10, x0, x1), y: y0 };
        var bot = { x: interp(v01, v11, x0, x1), y: y1 };
        var left = { x: x0, y: interp(v00, v01, y0, y1) };
        var right = { x: x1, y: interp(v10, v11, y0, y1) };

        if (code === 1 || code === 14) segments.push([top, left]);
        else if (code === 2 || code === 13) segments.push([top, right]);
        else if (code === 3 || code === 12) segments.push([left, right]);
        else if (code === 4 || code === 11) segments.push([bot, left]);
        else if (code === 5) { segments.push([top, right]); segments.push([bot, left]); }
        else if (code === 6 || code === 9) segments.push([top, bot]);
        else if (code === 7 || code === 8) segments.push([bot, right]);
        else if (code === 10) { segments.push([top, left]); segments.push([bot, right]); }

        for (var si = 0; si < segments.length; si++) {
          var seg = segments[si];
          var cp1 = SVM.toCanvas(seg[0].x, seg[0].y, W, H, pad, xR, yR);
          var cp2 = SVM.toCanvas(seg[1].x, seg[1].y, W, H, pad, xR, yR);
          ctx.beginPath();
          ctx.moveTo(cp1.x, cp1.y);
          ctx.lineTo(cp2.x, cp2.y);
          ctx.stroke();
        }
      }
    }

    // Draw points
    SVM.drawPoints(ctx, pts, W, H, pad, xR, yR, c, null);

    // Count accuracy
    var correct = 0;
    for (var i = 0; i < pts.length; i++) {
      var f = SVM.predict(pts, model, kernelFn, pts[i].x, pts[i].y);
      if ((f > 0 && pts[i].label === 1) || (f <= 0 && pts[i].label === -1)) correct++;
    }
    infoEl.textContent = 'accuracy=' + (correct / pts.length * 100).toFixed(1) +
      '% | \u03b3=' + gamma.toFixed(2) + ' | C=' + C.toFixed(2);
  }

  gammaSlider.addEventListener('input', function() { cachedGamma = -1; scheduleDraw(); });
  cSlider.addEventListener('input', function() { cachedC = -1; scheduleDraw(); });

  document.getElementById('svm-rbf-circular').addEventListener('click', function() { setDataset('circular'); });
  document.getElementById('svm-rbf-moons').addEventListener('click', function() { setDataset('moons'); });
  document.getElementById('svm-rbf-xor').addEventListener('click', function() { setDataset('xor'); });
  document.getElementById('svm-rbf-linear').addEventListener('click', function() { setDataset('linear'); });

  SVM.observeTheme(function() { scheduleDraw(); });
  setDataset('circular');
})();
</script>

Notice how with very high gamma, the boundary wraps tightly around individual points - this is overfitting. With very low gamma, the boundary becomes too simple. The sweet spot is somewhere in between.

---

## 7. Kernel Comparison

Different kernels produce different decision boundaries. Let us compare the three main kernels side by side.

**Linear kernel**: $$K(\mathbf{x}, \mathbf{x}') = \mathbf{x} \cdot \mathbf{x}'$$ - produces straight-line boundaries.

**Polynomial kernel**: $$K(\mathbf{x}, \mathbf{x}') = (\mathbf{x} \cdot \mathbf{x}' + 1)^d$$ - produces curved boundaries, controlled by degree $$d$$.

**RBF kernel**: $$K(\mathbf{x}, \mathbf{x}') = \exp(-\gamma\|\mathbf{x} - \mathbf{x}'\|^2)$$ - produces flexible, local boundaries.

### Try It: Compare Kernels

<div class="demo-hint">
<strong>Interactive:</strong> Three panels show the same dataset with different kernels. Adjust the polynomial degree and RBF gamma. Switch datasets with the buttons below.
</div>

<div class="interactive-demo">
  <div class="demo-split" style="grid-template-columns: 1fr 1fr 1fr;">
    <div>
      <canvas id="svm-cmp-linear"></canvas>
      <div class="demo-caption">Linear Kernel</div>
    </div>
    <div>
      <canvas id="svm-cmp-poly"></canvas>
      <div class="demo-caption">Polynomial (d=<span id="svm-cmp-poly-dval">3</span>)</div>
    </div>
    <div>
      <canvas id="svm-cmp-rbf"></canvas>
      <div class="demo-caption">RBF (&gamma;=<span id="svm-cmp-rbf-gval">1.00</span>)</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Poly degree: <input type="range" id="svm-cmp-degree" min="2" max="6" step="1" value="3"></label>
    <label>&gamma;: <input type="range" id="svm-cmp-gamma" min="-1" max="1.5" step="0.05" value="0"></label>
    <button id="svm-cmp-circular">Circular</button>
    <button id="svm-cmp-moons">Moons</button>
    <button id="svm-cmp-xor">XOR</button>
    <button id="svm-cmp-linear-btn">Linear</button>
  </div>
</div>

<script>
(function() {
  var canvases = [
    document.getElementById('svm-cmp-linear'),
    document.getElementById('svm-cmp-poly'),
    document.getElementById('svm-cmp-rbf')
  ];
  var degreeSlider = document.getElementById('svm-cmp-degree');
  var gammaSlider = document.getElementById('svm-cmp-gamma');
  var polyDVal = document.getElementById('svm-cmp-poly-dval');
  var rbfGVal = document.getElementById('svm-cmp-rbf-gval');

  var W = 220, H = 220;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 25;
  var pts = [];

  function setDataset(name) {
    if (name === 'circular') pts = SVM.genCircular(40);
    else if (name === 'moons') pts = SVM.genMoons(50);
    else if (name === 'xor') pts = SVM.genXOR(40);
    else pts = SVM.genLinear(30);
    draw();
  }

  function drawPanel(canvasEl, kernelFn, title) {
    var ctx = SVM.setupCanvas(canvasEl, W, H);
    var c = SVM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, W - 2 * pad, H - 2 * pad);

    if (pts.length < 4) return;

    var model = SVM.trainKernel(pts, kernelFn, 5.0, 120);

    // Decision regions
    var imgW = W - 2 * pad, imgH = H - 2 * pad;
    var step = 3;
    var imgData = ctx.createImageData(imgW, imgH);
    var c0col = c.isDark ? [122, 162, 247] : [37, 99, 235];
    var c1col = c.isDark ? [247, 118, 142] : [230, 57, 70];

    for (var py = 0; py < imgH; py += step) {
      for (var px = 0; px < imgW; px += step) {
        var coord = SVM.fromCanvas(pad + px, pad + py, W, H, pad, xR, yR);
        var f = SVM.predict(pts, model, kernelFn, coord.x, coord.y);
        var col = f > 0 ? c1col : c0col;
        var alpha = Math.min(50, Math.abs(f) * 20 + 15);
        for (var dy = 0; dy < step && py + dy < imgH; dy++) {
          for (var dx = 0; dx < step && px + dx < imgW; dx++) {
            var idx = ((py + dy) * imgW + (px + dx)) * 4;
            imgData.data[idx] = col[0];
            imgData.data[idx + 1] = col[1];
            imgData.data[idx + 2] = col[2];
            imgData.data[idx + 3] = alpha;
          }
        }
      }
    }
    ctx.putImageData(imgData, pad, pad);

    // Contour (f=0) using marching squares
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.5;
    var gridRes = 40;
    var grid = [];
    for (var gy = 0; gy <= gridRes; gy++) {
      grid[gy] = [];
      for (var gx = 0; gx <= gridRes; gx++) {
        var gxv = xR[0] + (xR[1] - xR[0]) * gx / gridRes;
        var gyv = yR[0] + (yR[1] - yR[0]) * gy / gridRes;
        grid[gy][gx] = SVM.predict(pts, model, kernelFn, gxv, gyv);
      }
    }

    for (var gy = 0; gy < gridRes; gy++) {
      for (var gx = 0; gx < gridRes; gx++) {
        var v00 = grid[gy][gx], v10 = grid[gy][gx + 1];
        var v01 = grid[gy + 1][gx], v11 = grid[gy + 1][gx + 1];
        var s00 = v00 > 0 ? 1 : 0, s10 = v10 > 0 ? 1 : 0;
        var s01 = v01 > 0 ? 1 : 0, s11 = v11 > 0 ? 1 : 0;
        var code = s00 | (s10 << 1) | (s01 << 2) | (s11 << 3);
        if (code === 0 || code === 15) continue;

        var x0 = xR[0] + (xR[1] - xR[0]) * gx / gridRes;
        var x1v = xR[0] + (xR[1] - xR[0]) * (gx + 1) / gridRes;
        var y0 = yR[0] + (yR[1] - yR[0]) * gy / gridRes;
        var y1v = yR[0] + (yR[1] - yR[0]) * (gy + 1) / gridRes;

        function interp(va, vb, a, b) {
          var t = va / (va - vb);
          return a + t * (b - a);
        }

        var top = { x: interp(v00, v10, x0, x1v), y: y0 };
        var bot = { x: interp(v01, v11, x0, x1v), y: y1v };
        var left = { x: x0, y: interp(v00, v01, y0, y1v) };
        var right = { x: x1v, y: interp(v10, v11, y0, y1v) };

        var segments = [];
        if (code === 1 || code === 14) segments.push([top, left]);
        else if (code === 2 || code === 13) segments.push([top, right]);
        else if (code === 3 || code === 12) segments.push([left, right]);
        else if (code === 4 || code === 11) segments.push([bot, left]);
        else if (code === 5) { segments.push([top, right]); segments.push([bot, left]); }
        else if (code === 6 || code === 9) segments.push([top, bot]);
        else if (code === 7 || code === 8) segments.push([bot, right]);
        else if (code === 10) { segments.push([top, left]); segments.push([bot, right]); }

        for (var si = 0; si < segments.length; si++) {
          var seg = segments[si];
          var cp1 = SVM.toCanvas(seg[0].x, seg[0].y, W, H, pad, xR, yR);
          var cp2 = SVM.toCanvas(seg[1].x, seg[1].y, W, H, pad, xR, yR);
          ctx.beginPath(); ctx.moveTo(cp1.x, cp1.y); ctx.lineTo(cp2.x, cp2.y); ctx.stroke();
        }
      }
    }

    // Points
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var cp = SVM.toCanvas(p.x, p.y, W, H, pad, xR, yR);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? c.class1 : c.class0;
      ctx.fill();
    }
  }

  function draw() {
    var degree = parseInt(degreeSlider.value);
    var gamma = Math.pow(10, parseFloat(gammaSlider.value));
    polyDVal.textContent = degree;
    rbfGVal.textContent = gamma.toFixed(2);

    drawPanel(canvases[0], SVM.kernelLinear, 'Linear');
    drawPanel(canvases[1], SVM.kernelPoly(degree), 'Poly d=' + degree);
    drawPanel(canvases[2], SVM.kernelRBF(gamma), 'RBF');
  }

  degreeSlider.addEventListener('input', draw);
  gammaSlider.addEventListener('input', draw);

  document.getElementById('svm-cmp-circular').addEventListener('click', function() { setDataset('circular'); });
  document.getElementById('svm-cmp-moons').addEventListener('click', function() { setDataset('moons'); });
  document.getElementById('svm-cmp-xor').addEventListener('click', function() { setDataset('xor'); });
  document.getElementById('svm-cmp-linear-btn').addEventListener('click', function() { setDataset('linear'); });

  SVM.observeTheme(draw);
  setDataset('circular');
})();
</script>

Key observations:
- The **linear kernel** fails on non-linear data but works well on linearly separable data
- The **polynomial kernel** can capture curves, with higher degrees producing more complex boundaries
- The **RBF kernel** is the most flexible and handles all dataset types, but requires careful tuning of $$\gamma$$

---

## 8. SVM vs Logistic Regression

Both SVMs and logistic regression find a decision boundary. How do they differ?

| | **SVM** | **Logistic Regression** |
|---|---|---|
| **Objective** | Maximize margin | Maximize likelihood |
| **Loss function** | Hinge loss | Log loss (cross-entropy) |
| **Output** | Class label (distance from boundary) | Probability $$P(y=1 \mid x)$$ |
| **Decision boundary** | Determined by support vectors only | Influenced by all points |
| **Works best when** | Clear margin, high dimensions | Need probability estimates |

### Try It: See Both Boundaries

<div class="demo-hint">
<strong>Interactive:</strong> The <span style="color:#2563eb;font-weight:600">blue solid line</span> is the SVM boundary (maximum margin). The <span style="color:#e0af68;font-weight:600">golden dashed line</span> is the logistic regression boundary. Notice how the SVM boundary sits in the widest gap, while logistic regression is pulled by all points.
</div>

<div class="interactive-demo">
  <canvas id="svm-vs-lr-canvas"></canvas>
  <div class="demo-controls">
    <button id="svm-vs-lr-gen">New Data</button>
    <button id="svm-vs-lr-outlier">Add Outlier</button>
    <span class="demo-value" id="svm-vs-lr-info"></span>
  </div>
</div>

<script>
(function() {
  var canvas = document.getElementById('svm-vs-lr-canvas');
  var infoEl = document.getElementById('svm-vs-lr-info');
  var genBtn = document.getElementById('svm-vs-lr-gen');
  var outlierBtn = document.getElementById('svm-vs-lr-outlier');

  var W = 680, H = 460;
  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];

  // Simple logistic regression via gradient descent
  function trainLR(pts) {
    var w = [0, 0], b = 0;
    var lr = 0.05;
    for (var ep = 0; ep < 1000; ep++) {
      var dw = [0, 0], db = 0;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var yi = (p.label === 1) ? 1 : 0;
        var z = w[0] * p.x + w[1] * p.y + b;
        var sig = 1 / (1 + Math.exp(-z));
        var err = sig - yi;
        dw[0] += err * p.x;
        dw[1] += err * p.y;
        db += err;
      }
      w[0] -= lr * dw[0] / pts.length;
      w[1] -= lr * dw[1] / pts.length;
      b -= lr * db / pts.length;
    }
    return { w: w, b: b };
  }

  function drawLine(ctx, ww, bb, style, dash) {
    ctx.strokeStyle = style;
    ctx.lineWidth = 2.5;
    ctx.setLineDash(dash || []);
    var pts2 = [];
    if (Math.abs(ww[1]) > 1e-8) {
      for (var i = 0; i < 2; i++) {
        var xx = xR[i];
        var yy = (-bb - ww[0] * xx) / ww[1];
        pts2.push(SVM.toCanvas(xx, yy, W, H, pad, xR, yR));
      }
    } else if (Math.abs(ww[0]) > 1e-8) {
      var xx = -bb / ww[0];
      pts2.push(SVM.toCanvas(xx, yR[0], W, H, pad, xR, yR));
      pts2.push(SVM.toCanvas(xx, yR[1], W, H, pad, xR, yR));
    }
    if (pts2.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts2[0].x, pts2[0].y);
      ctx.lineTo(pts2[1].x, pts2[1].y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function draw() {
    var ctx = SVM.setupCanvas(canvas, W, H);
    var c = SVM.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    SVM.drawAxes(ctx, W, H, c, xR, yR);

    if (pts.length < 4) return;

    var svmModel = SVM.trainLinear(pts, 1.0, 0.005, 1200);
    var lrModel = trainLR(pts);

    // SVM boundary (solid)
    if (svmModel.w[0] !== 0 || svmModel.w[1] !== 0) {
      drawLine(ctx, svmModel.w, svmModel.b, c.accent, []);
      // Margin
      var ww = svmModel.w, bb = svmModel.b;
      ctx.strokeStyle = c.margin;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      var pts2;
      if (Math.abs(ww[1]) > 1e-8) {
        pts2 = [];
        for (var i = 0; i < 2; i++) {
          var xx = xR[i];
          pts2.push(SVM.toCanvas(xx, (1 - bb - ww[0] * xx) / ww[1], W, H, pad, xR, yR));
        }
        ctx.beginPath(); ctx.moveTo(pts2[0].x, pts2[0].y); ctx.lineTo(pts2[1].x, pts2[1].y); ctx.stroke();
        pts2 = [];
        for (var i = 0; i < 2; i++) {
          var xx = xR[i];
          pts2.push(SVM.toCanvas(xx, (-1 - bb - ww[0] * xx) / ww[1], W, H, pad, xR, yR));
        }
        ctx.beginPath(); ctx.moveTo(pts2[0].x, pts2[0].y); ctx.lineTo(pts2[1].x, pts2[1].y); ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // LR boundary (dashed)
    drawLine(ctx, lrModel.w, lrModel.b, c.sv, [8, 5]);

    // Draw points
    SVM.drawPoints(ctx, pts, W, H, pad, xR, yR, c, svmModel.sv);

    infoEl.textContent = 'Blue solid = SVM | Gold dashed = Logistic Regression | SVs: ' + svmModel.sv.length;
  }

  function generate() {
    pts = SVM.genLinear(35);
    draw();
  }

  outlierBtn.addEventListener('click', function() {
    // Add a point far on the wrong side
    var label = Math.random() > 0.5 ? 1 : -1;
    var x = (Math.random() - 0.5) * 4;
    var y = label === 1 ? -2 - Math.random() : 2 + Math.random();
    pts.push({ x: x, y: y, label: label });
    draw();
  });

  genBtn.addEventListener('click', generate);
  SVM.observeTheme(draw);
  generate();
})();
</script>

Try clicking **Add Outlier** a few times. Notice how:
- The **logistic regression** boundary shifts noticeably toward the outlier (it considers all points)
- The **SVM** boundary is more stable (it only cares about support vectors)

This robustness to outliers is one of the key practical advantages of SVMs.

---

## 9. Summary

<table class="svm-table">
<tr><th>Concept</th><th>Key Idea</th><th>Formula / Detail</th></tr>
<tr><td>Decision boundary</td><td>Hyperplane separating classes</td><td>$$\mathbf{w}\cdot\mathbf{x}+b=0$$</td></tr>
<tr><td>Margin</td><td>Width of the "street" between classes</td><td>$$\frac{2}{\|\mathbf{w}\|}$$</td></tr>
<tr><td>Support vectors</td><td>Points on the margin boundary</td><td>Only these determine the boundary</td></tr>
<tr><td>Hard margin SVM</td><td>Perfect separation required</td><td>$$\min\frac{1}{2}\|\mathbf{w}\|^2$$ s.t. constraints</td></tr>
<tr><td>Soft margin (C)</td><td>Allow some misclassifications</td><td>Large C = strict, Small C = tolerant</td></tr>
<tr><td>Hinge loss</td><td>Loss function for SVM</td><td>$$\max(0,1-y(\mathbf{w}\cdot\mathbf{x}+b))$$</td></tr>
<tr><td>Kernel trick</td><td>Implicit mapping to higher dimensions</td><td>$$K(\mathbf{x},\mathbf{x}')=\phi(\mathbf{x})\cdot\phi(\mathbf{x}')$$</td></tr>
<tr><td>RBF kernel</td><td>Infinite-dimensional mapping</td><td>$$\exp(-\gamma\|\mathbf{x}-\mathbf{x}'\|^2)$$</td></tr>
<tr><td>Polynomial kernel</td><td>Polynomial feature mapping</td><td>$$(\mathbf{x}\cdot\mathbf{x}'+1)^d$$</td></tr>
</table>

### When to Use SVMs

- **Good for**: High-dimensional data, small-to-medium datasets, when margin matters, text classification, image classification
- **Less ideal for**: Very large datasets (training is slow), when you need probability outputs, when interpretability is critical
- **Key hyperparameters**: C (regularization), kernel choice, gamma (for RBF), degree (for polynomial)

### What is Next

In the next chapter, we will explore **Decision Trees** - a fundamentally different approach to classification that recursively splits the feature space into regions. Unlike SVMs, decision trees are highly interpretable: you can trace exactly why the model made each prediction.

---

*This is part of the [Machine Learning from Scratch]({{ site.baseurl }}/ml/) series. You can explore topics in any order, though they build naturally on each other.*
