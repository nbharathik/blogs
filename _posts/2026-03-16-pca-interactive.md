---
layout: post
title: "Principal Component Analysis (PCA) from Scratch - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Visualize PCA eigenvectors, project data onto principal components, reduce 3D to 2D interactively, and understand variance explained - all from scratch in your browser."
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
.demo-3d-container {
  position: relative;
}
.pca-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.9rem;
}
.pca-table th, .pca-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}
.pca-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
.pca-table td {
  background: var(--bg-primary);
}
</style>

<script>
window.PCA = (function() {
  var P = {};

  P.getColors = function() {
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
      pc1: isDark ? '#f7768e' : '#e63946',
      pc2: isDark ? '#9ece6a' : '#16a34a',
      pc3: isDark ? '#e0af68' : '#d97706',
      point: isDark ? '#7aa2f7' : '#2563eb',
      pointLight: isDark ? 'rgba(122,162,247,0.3)' : 'rgba(37,99,235,0.25)',
      projection: isDark ? 'rgba(247,118,142,0.4)' : 'rgba(230,57,70,0.35)',
      cluster0: isDark ? '#f7768e' : '#e63946',
      cluster1: isDark ? '#7aa2f7' : '#2563eb',
      cluster2: isDark ? '#9ece6a' : '#16a34a',
      isDark: isDark
    };
  };

  P.setupCanvas = function(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  P.observeTheme = function(cb) {
    var obs = new MutationObserver(function() { cb(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb);
  };

  P.randGauss = function() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  // Compute mean of each column
  P.mean = function(data, dim) {
    var n = data.length;
    var m = new Array(dim);
    for (var j = 0; j < dim; j++) m[j] = 0;
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < dim; j++) m[j] += data[i][j];
    }
    for (var j = 0; j < dim; j++) m[j] /= n;
    return m;
  };

  // Center the data (subtract mean)
  P.center = function(data, dim) {
    var m = P.mean(data, dim);
    var centered = [];
    for (var i = 0; i < data.length; i++) {
      var row = new Array(dim);
      for (var j = 0; j < dim; j++) row[j] = data[i][j] - m[j];
      centered.push(row);
    }
    return { data: centered, mean: m };
  };

  // Compute covariance matrix (dim x dim)
  P.covariance = function(centered, dim) {
    var n = centered.length;
    var cov = [];
    for (var i = 0; i < dim; i++) {
      cov[i] = new Array(dim);
      for (var j = 0; j < dim; j++) {
        var s = 0;
        for (var k = 0; k < n; k++) {
          s += centered[k][i] * centered[k][j];
        }
        cov[i][j] = s / (n - 1 || 1);
      }
    }
    return cov;
  };

  // 2x2 eigendecomposition (closed form)
  P.eigen2x2 = function(cov) {
    var a = cov[0][0], b = cov[0][1], c = cov[1][0], d = cov[1][1];
    var trace = a + d;
    var det = a * d - b * c;
    var disc = Math.sqrt(Math.max(0, trace * trace / 4 - det));
    var l1 = trace / 2 + disc;
    var l2 = trace / 2 - disc;

    var v1, v2;
    if (Math.abs(b) > 1e-12) {
      v1 = [b, l1 - a];
      v2 = [b, l2 - a];
    } else if (Math.abs(c) > 1e-12) {
      v1 = [l1 - d, c];
      v2 = [l2 - d, c];
    } else {
      v1 = [1, 0];
      v2 = [0, 1];
      if (a < d) { var t = v1; v1 = v2; v2 = t; var tl = l1; l1 = l2; l2 = tl; }
    }
    // Normalize
    var n1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    var n2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
    if (n1 > 1e-12) { v1[0] /= n1; v1[1] /= n1; }
    if (n2 > 1e-12) { v2[0] /= n2; v2[1] /= n2; }

    // Ensure l1 >= l2
    if (l1 < l2) {
      var tl = l1; l1 = l2; l2 = tl;
      var tv = v1; v1 = v2; v2 = tv;
    }
    return { values: [l1, l2], vectors: [v1, v2] };
  };

  // Jacobi eigendecomposition for NxN symmetric matrices
  P.eigenJacobi = function(mat, dim, maxIter) {
    maxIter = maxIter || 100;
    // Clone matrix
    var A = [];
    for (var i = 0; i < dim; i++) {
      A[i] = new Array(dim);
      for (var j = 0; j < dim; j++) A[i][j] = mat[i][j];
    }
    // Initialize eigenvectors to identity
    var V = [];
    for (var i = 0; i < dim; i++) {
      V[i] = new Array(dim);
      for (var j = 0; j < dim; j++) V[i][j] = (i === j) ? 1 : 0;
    }

    for (var iter = 0; iter < maxIter; iter++) {
      // Find largest off-diagonal element
      var p = 0, q = 1, maxVal = Math.abs(A[0][1]);
      for (var i = 0; i < dim; i++) {
        for (var j = i + 1; j < dim; j++) {
          if (Math.abs(A[i][j]) > maxVal) {
            maxVal = Math.abs(A[i][j]);
            p = i; q = j;
          }
        }
      }
      if (maxVal < 1e-12) break;

      // Compute rotation
      var app = A[p][p], aqq = A[q][q], apq = A[p][q];
      var theta;
      if (Math.abs(app - aqq) < 1e-12) {
        theta = Math.PI / 4;
      } else {
        theta = 0.5 * Math.atan2(2 * apq, app - aqq);
      }
      var cosT = Math.cos(theta), sinT = Math.sin(theta);

      // Update A
      var newA = [];
      for (var i = 0; i < dim; i++) {
        newA[i] = new Array(dim);
        for (var j = 0; j < dim; j++) newA[i][j] = A[i][j];
      }
      newA[p][p] = cosT * cosT * app + 2 * sinT * cosT * apq + sinT * sinT * aqq;
      newA[q][q] = sinT * sinT * app - 2 * sinT * cosT * apq + cosT * cosT * aqq;
      newA[p][q] = 0;
      newA[q][p] = 0;
      for (var i = 0; i < dim; i++) {
        if (i !== p && i !== q) {
          newA[i][p] = cosT * A[i][p] + sinT * A[i][q];
          newA[p][i] = newA[i][p];
          newA[i][q] = -sinT * A[i][p] + cosT * A[i][q];
          newA[q][i] = newA[i][q];
        }
      }
      A = newA;

      // Update eigenvectors
      for (var i = 0; i < dim; i++) {
        var vip = V[i][p], viq = V[i][q];
        V[i][p] = cosT * vip + sinT * viq;
        V[i][q] = -sinT * vip + cosT * viq;
      }
    }

    // Extract eigenvalues and sort descending
    var eigenvalues = [];
    for (var i = 0; i < dim; i++) eigenvalues.push(A[i][i]);
    var indices = [];
    for (var i = 0; i < dim; i++) indices.push(i);
    indices.sort(function(a, b) { return eigenvalues[b] - eigenvalues[a]; });

    var sortedValues = [];
    var sortedVectors = [];
    for (var i = 0; i < dim; i++) {
      sortedValues.push(eigenvalues[indices[i]]);
      var vec = new Array(dim);
      for (var j = 0; j < dim; j++) vec[j] = V[j][indices[i]];
      sortedVectors.push(vec);
    }
    return { values: sortedValues, vectors: sortedVectors };
  };

  // Project data onto k principal components
  P.project = function(centered, vectors, k) {
    var projected = [];
    for (var i = 0; i < centered.length; i++) {
      var row = new Array(k);
      for (var c = 0; c < k; c++) {
        var s = 0;
        for (var j = 0; j < centered[i].length; j++) {
          s += centered[i][j] * vectors[c][j];
        }
        row[c] = s;
      }
      projected.push(row);
    }
    return projected;
  };

  // Reconstruct data from k principal components
  P.reconstruct = function(projected, vectors, mean, dim) {
    var reconstructed = [];
    var k = projected[0].length;
    for (var i = 0; i < projected.length; i++) {
      var row = new Array(dim);
      for (var j = 0; j < dim; j++) {
        var s = mean[j];
        for (var c = 0; c < k; c++) {
          s += projected[i][c] * vectors[c][j];
        }
        row[j] = s;
      }
      reconstructed.push(row);
    }
    return reconstructed;
  };

  // Dot product
  P.dot = function(a, b) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  };

  // Vector norm
  P.norm = function(v) {
    return Math.sqrt(P.dot(v, v));
  };

  // Generate correlated 2D data
  P.genCorrelated2D = function(n, angle, spread1, spread2) {
    angle = angle || 0.7;
    spread1 = spread1 || 2.0;
    spread2 = spread2 || 0.5;
    var pts = [];
    var cosA = Math.cos(angle), sinA = Math.sin(angle);
    for (var i = 0; i < n; i++) {
      var x = P.randGauss() * spread1;
      var y = P.randGauss() * spread2;
      pts.push([cosA * x - sinA * y, sinA * x + cosA * y]);
    }
    return pts;
  };

  // Generate 3D data on a tilted plane with some noise
  P.gen3D = function(n) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var u = P.randGauss() * 2;
      var v = P.randGauss() * 1.5;
      var noise = P.randGauss() * 0.3;
      // Tilted plane: x = u, y = 0.5*u + v, z = 0.3*u - 0.4*v + noise
      pts.push([u, 0.5 * u + v, 0.3 * u - 0.4 * v + noise]);
    }
    return pts;
  };

  // Generate 4D iris-like data with 3 clusters
  P.genIrisLike = function(n) {
    var pts = [];
    var labels = [];
    var centers = [
      [1, 1, 0.5, 0.2],
      [-1, 0.5, -0.5, 1],
      [0.3, -1.5, 1, -0.5]
    ];
    var perCluster = Math.floor(n / 3);
    for (var c = 0; c < 3; c++) {
      var count = (c === 2) ? n - 2 * perCluster : perCluster;
      for (var i = 0; i < count; i++) {
        var pt = new Array(4);
        for (var j = 0; j < 4; j++) {
          pt[j] = centers[c][j] + P.randGauss() * 0.4;
        }
        pts.push(pt);
        labels.push(c);
      }
    }
    return { data: pts, labels: labels };
  };

  // Draw arrow
  P.drawArrow = function(ctx, x1, y1, x2, y2, color, lineWidth) {
    var headLen = 10;
    var dx = x2 - x1, dy = y2 - y1;
    var angle = Math.atan2(dy, dx);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  };

  // 3D rotation helpers
  P.rotX = function(p, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return [p[0], c * p[1] - s * p[2], s * p[1] + c * p[2]];
  };
  P.rotY = function(p, a) {
    var c = Math.cos(a), s = Math.sin(a);
    return [c * p[0] + s * p[2], p[1], -s * p[0] + c * p[2]];
  };
  P.project3Dto2D = function(p, rotX, rotY, cx, cy, scale) {
    var r = P.rotY(p, rotY);
    r = P.rotX(r, rotX);
    return { x: cx + r[0] * scale, y: cy - r[1] * scale, z: r[2] };
  };

  return P;
})();
</script>

## Why Dimensionality Reduction?

In the [previous chapter on K-Means]({% post_url 2026-03-16-k-means-clustering-interactive %}), we clustered data by grouping similar points. But what happens when our data has dozens, hundreds, or thousands of features?

High-dimensional data causes real problems:

- **Visualization becomes impossible.** We can see 2D and 3D, but not 50D.
- **Distances become meaningless.** In high dimensions, all pairs of points tend to be roughly equidistant, the **curse of dimensionality**.
- **Models overfit.** More features mean more parameters, more noise, and less signal.
- **Computation slows down.** Every algorithm pays a cost per feature.

**Dimensionality reduction** addresses all of these by finding a lower-dimensional representation that preserves the important structure. The most fundamental technique is **Principal Component Analysis (PCA)**.

The core insight of PCA is beautifully simple: **find the directions along which the data varies the most, and project onto those directions.**

---

## 1. Variance as Information

Why variance? Because a direction with high variance is a direction where data points are spread apart, they differ from each other. A direction with zero variance means all points are identical along that axis, so it carries no information.

PCA finds the direction of **maximum variance** first. That direction is called the **first principal component (PC1)**. Then it finds the direction of maximum variance perpendicular to PC1, that is **PC2**. And so on.

### Try It: Rotate a Line, Measure Variance

Drag the angle slider to rotate a projection line through the point cloud. Watch how the variance of projections changes. The angle that maximizes variance gives you PC1.

<div class="interactive-demo" id="demo-variance">
  <canvas id="canvas-variance"></canvas>
  <div class="demo-controls">
    <label>Angle: <input type="range" id="slider-var-angle" min="0" max="314" value="70"><span class="demo-value" id="val-var-angle">0.70</span></label>
    <button id="btn-var-reset">New Data</button>
  </div>
  <div class="demo-info" id="info-variance">Drag angle to find the direction of maximum variance</div>
</div>

<script>
(function() {
  var W = 680, H = 420;
  var canvas = document.getElementById('canvas-variance');
  var ctx = PCA.setupCanvas(canvas, W, H);
  var slider = document.getElementById('slider-var-angle');
  var valEl = document.getElementById('val-var-angle');
  var info = document.getElementById('info-variance');
  var btnReset = document.getElementById('btn-var-reset');

  var pts, centered, eigen, maxVar, maxAngle;

  function init() {
    pts = PCA.genCorrelated2D(80, 0.6 + Math.random() * 0.8, 1.8 + Math.random() * 0.8, 0.3 + Math.random() * 0.3);
    var res = PCA.center(pts, 2);
    centered = res.data;
    var cov = PCA.covariance(centered, 2);
    eigen = PCA.eigen2x2(cov);
    maxVar = eigen.values[0];
    maxAngle = Math.atan2(eigen.vectors[0][1], eigen.vectors[0][0]);
    if (maxAngle < 0) maxAngle += Math.PI;
    draw();
  }

  function draw() {
    var c = PCA.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var cx = W / 2, cy = H / 2;
    var scale = 70;

    // Grid
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = -4; i <= 4; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * scale, 30); ctx.lineTo(cx + i * scale, H - 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, cy + i * scale); ctx.lineTo(W - 30, cy + i * scale); ctx.stroke();
    }
    // Axes
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, cy); ctx.lineTo(W - 30, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, H - 30); ctx.stroke();

    var angle = parseFloat(slider.value) / 100;
    valEl.textContent = angle.toFixed(2) + ' rad';
    var dirX = Math.cos(angle), dirY = Math.sin(angle);

    // Draw projection line
    ctx.strokeStyle = c.pc1;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(cx - dirX * 300, cy + dirY * 300);
    ctx.lineTo(cx + dirX * 300, cy - dirY * 300);
    ctx.stroke();
    ctx.setLineDash([]);

    // Project points and draw
    var projections = [];
    var variance = 0;
    for (var i = 0; i < centered.length; i++) {
      var px = centered[i][0], py = centered[i][1];
      var proj = px * dirX + py * dirY;
      projections.push(proj);

      var sx = cx + px * scale, sy = cy - py * scale;
      var ppx = cx + proj * dirX * scale, ppy = cy - proj * dirY * scale;

      // Drop line from point to projection
      ctx.strokeStyle = c.projection;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ppx, ppy);
      ctx.stroke();

      // Projected point on line
      ctx.fillStyle = c.pc1;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(ppx, ppy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Original point
      ctx.fillStyle = c.point;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Compute variance
    var meanP = 0;
    for (var i = 0; i < projections.length; i++) meanP += projections[i];
    meanP /= projections.length;
    for (var i = 0; i < projections.length; i++) {
      variance += (projections[i] - meanP) * (projections[i] - meanP);
    }
    variance /= (projections.length - 1);

    // Variance bar
    var barW = 200, barH = 16;
    var barX = W - barW - 20, barY = 20;
    ctx.fillStyle = c.bgSecondary;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);
    var fillW = Math.min(1, variance / (maxVar * 1.1)) * barW;
    ctx.fillStyle = c.pc1;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(barX, barY, fillW, barH);
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.text;
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Variance: ' + variance.toFixed(3), barX, barY + barH + 16);

    // Show PC1 optimal direction marker
    var optAngleNorm = maxAngle;
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillText('PC1 optimal: ' + optAngleNorm.toFixed(2) + ' rad', barX, barY + barH + 32);
    ctx.fillText('Max variance: ' + maxVar.toFixed(3), barX, barY + barH + 48);

    var pctOfMax = (variance / maxVar * 100).toFixed(1);
    info.textContent = 'Projection variance: ' + variance.toFixed(3) + ' (' + pctOfMax + '% of max)  |  Angle: ' + angle.toFixed(2) + ' rad';
  }

  slider.addEventListener('input', draw);
  btnReset.addEventListener('click', init);
  PCA.observeTheme(draw);

  // Touch support
  canvas.addEventListener('touchstart', function(e) { e.preventDefault(); }, { passive: false });

  init();
})();
</script>

Notice how the variance peaks when the line aligns with the elongated direction of the point cloud, and drops to its minimum when the line is perpendicular to that. The direction of maximum variance **is** PC1.

---

## 2. Eigenvector Visualization

PCA computes eigenvectors of the **covariance matrix**. In 2D, there are exactly two eigenvectors, PC1 and PC2, and they are always perpendicular. The corresponding eigenvalues tell us how much variance each component captures.

### Try It: Click to Add Points

Click anywhere on the canvas to add points. Watch the eigenvectors (arrows) update in real-time. PC1 (red) always points in the direction of maximum spread. PC2 (green) is perpendicular. Arrow lengths are proportional to eigenvalues.

<div class="demo-hint">
<strong>Interactive:</strong> Click to add points. The eigenvectors update instantly. Try creating elongated clusters, circular clouds, or L-shapes to see how the principal components change.
</div>

<div class="interactive-demo" id="demo-eigen">
  <canvas id="canvas-eigen"></canvas>
  <div class="demo-controls">
    <button id="btn-eigen-clear">Clear</button>
    <button id="btn-eigen-gen">Generate Cluster</button>
    <button id="btn-eigen-circle">Generate Circle</button>
  </div>
  <div class="demo-info" id="info-eigen">Click to add points (need at least 3)</div>
</div>

<script>
(function() {
  var W = 680, H = 460;
  var canvas = document.getElementById('canvas-eigen');
  var ctx = PCA.setupCanvas(canvas, W, H);
  var info = document.getElementById('info-eigen');
  var btnClear = document.getElementById('btn-eigen-clear');
  var btnGen = document.getElementById('btn-eigen-gen');
  var btnCircle = document.getElementById('btn-eigen-circle');

  var xR = [-4, 4], yR = [-4, 4];
  var pad = 45;
  var pts = [];

  function toCanvas(px, py) {
    return {
      x: pad + (px - xR[0]) / (xR[1] - xR[0]) * (W - 2 * pad),
      y: H - pad - (py - yR[0]) / (yR[1] - yR[0]) * (H - 2 * pad)
    };
  }

  function fromCanvas(cx, cy) {
    return {
      x: xR[0] + (cx - pad) / (W - 2 * pad) * (xR[1] - xR[0]),
      y: yR[0] + (H - pad - cy) / (H - 2 * pad) * (yR[1] - yR[0])
    };
  }

  function draw() {
    var c = PCA.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Grid
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

    // Tick labels
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var i = 0; i <= 4; i++) {
      var val = xR[0] + (xR[1] - xR[0]) * i / 4;
      var x = pad + (W - 2 * pad) * i / 4;
      ctx.fillText(val.toFixed(0), x, H - pad + 15);
    }
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var val = yR[0] + (yR[1] - yR[0]) * i / 4;
      var y = H - pad - (H - 2 * pad) * i / 4;
      ctx.fillText(val.toFixed(0), pad - 8, y + 4);
    }

    // Draw points
    for (var i = 0; i < pts.length; i++) {
      var cp = toCanvas(pts[i][0], pts[i][1]);
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = c.point;
      ctx.globalAlpha = 0.75;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (pts.length >= 3) {
      var res = PCA.center(pts, 2);
      var cov = PCA.covariance(res.data, 2);
      var eigen = PCA.eigen2x2(cov);

      var meanPt = PCA.mean(pts, 2);
      var mc = toCanvas(meanPt[0], meanPt[1]);

      // Mean point
      ctx.beginPath();
      ctx.arc(mc.x, mc.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = c.text;
      ctx.fill();

      var totalVar = eigen.values[0] + eigen.values[1];
      var arrowScale = 80;

      // Draw PC1 arrow
      var ev1 = eigen.vectors[0];
      var len1 = Math.sqrt(eigen.values[0]) * arrowScale / Math.sqrt(totalVar > 0 ? totalVar : 1) * 2;
      PCA.drawArrow(ctx, mc.x, mc.y,
        mc.x + ev1[0] * len1, mc.y - ev1[1] * len1, c.pc1, 3);
      PCA.drawArrow(ctx, mc.x, mc.y,
        mc.x - ev1[0] * len1, mc.y + ev1[1] * len1, c.pc1, 3);

      // Draw PC2 arrow
      var ev2 = eigen.vectors[1];
      var len2 = Math.sqrt(Math.max(0, eigen.values[1])) * arrowScale / Math.sqrt(totalVar > 0 ? totalVar : 1) * 2;
      PCA.drawArrow(ctx, mc.x, mc.y,
        mc.x + ev2[0] * len2, mc.y - ev2[1] * len2, c.pc2, 3);
      PCA.drawArrow(ctx, mc.x, mc.y,
        mc.x - ev2[0] * len2, mc.y + ev2[1] * len2, c.pc2, 3);

      // Labels
      ctx.font = 'bold 13px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = c.pc1;
      ctx.fillText('PC1', mc.x + ev1[0] * len1 + 8, mc.y - ev1[1] * len1 - 4);
      ctx.fillStyle = c.pc2;
      ctx.fillText('PC2', mc.x + ev2[0] * len2 + 8, mc.y - ev2[1] * len2 - 4);

      // Covariance matrix display
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillStyle = c.text;
      ctx.textAlign = 'left';
      var tx = 12, ty = 20;
      ctx.fillText('Cov Matrix:', tx, ty);
      ctx.fillText('[' + cov[0][0].toFixed(2) + ', ' + cov[0][1].toFixed(2) + ']', tx, ty + 16);
      ctx.fillText('[' + cov[1][0].toFixed(2) + ', ' + cov[1][1].toFixed(2) + ']', tx, ty + 32);

      var pct1 = totalVar > 0 ? (eigen.values[0] / totalVar * 100).toFixed(1) : '0.0';
      var pct2 = totalVar > 0 ? (eigen.values[1] / totalVar * 100).toFixed(1) : '0.0';
      info.textContent = pts.length + ' points  |  eigenvalue1=' + eigen.values[0].toFixed(3) +
        ' (' + pct1 + '%)  eigenvalue2=' + eigen.values[1].toFixed(3) + ' (' + pct2 + '%)';
    } else {
      info.textContent = pts.length + ' points, need at least 3 for PCA';
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (W / rect.width);
    var sy = (e.clientY - rect.top) * (H / rect.height);
    var coord = fromCanvas(sx, sy);
    if (coord.x < xR[0] || coord.x > xR[1] || coord.y < yR[0] || coord.y > yR[1]) return;
    pts.push([coord.x, coord.y]);
    draw();
  });

  canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    var touch = e.changedTouches[0];
    var rect = canvas.getBoundingClientRect();
    var sx = (touch.clientX - rect.left) * (W / rect.width);
    var sy = (touch.clientY - rect.top) * (H / rect.height);
    var coord = fromCanvas(sx, sy);
    if (coord.x < xR[0] || coord.x > xR[1] || coord.y < yR[0] || coord.y > yR[1]) return;
    pts.push([coord.x, coord.y]);
    draw();
  }, { passive: false });

  btnClear.addEventListener('click', function() {
    pts = [];
    draw();
  });

  btnGen.addEventListener('click', function() {
    pts = PCA.genCorrelated2D(50, 0.3 + Math.random() * 1.2, 1.5 + Math.random(), 0.3 + Math.random() * 0.3);
    draw();
  });

  btnCircle.addEventListener('click', function() {
    pts = [];
    for (var i = 0; i < 50; i++) {
      var angle = Math.random() * Math.PI * 2;
      var r = 1.5 + PCA.randGauss() * 0.3;
      pts.push([Math.cos(angle) * r, Math.sin(angle) * r]);
    }
    draw();
  });

  PCA.observeTheme(draw);
  draw();
})();
</script>

Key observations:

- For an **elongated cloud**, PC1 aligns with the long axis, and the first eigenvalue is much larger than the second. Most information is along PC1.
- For a **circular cloud**, both eigenvalues are nearly equal. Neither direction is more important, PCA cannot reduce dimensionality effectively when variance is uniform.
- The eigenvalues always sum to the **total variance** of the data.

---

## 3. The Math: Covariance and Eigenvectors

Given data matrix $$\mathbf{X}$$ with $$n$$ samples and $$d$$ features, PCA proceeds in four steps:

**Step 1: Center the data.** Subtract the mean of each feature:

$$\bar{x}_j = \frac{1}{n}\sum_{i=1}^{n} x_{ij}, \qquad \tilde{x}_{ij} = x_{ij} - \bar{x}_j$$

**Step 2: Compute the covariance matrix.**

$$\mathbf{C} = \frac{1}{n-1}\tilde{\mathbf{X}}^T\tilde{\mathbf{X}}$$

This $$d \times d$$ matrix captures how each pair of features varies together:

$$C_{jk} = \frac{1}{n-1}\sum_{i=1}^{n}\tilde{x}_{ij}\tilde{x}_{ik}$$

Diagonal entries are variances. Off-diagonal entries are covariances. If $$C_{jk}$$ is large and positive, features $$j$$ and $$k$$ increase together.

**Step 3: Eigendecomposition.**

$$\mathbf{C}\mathbf{v}_k = \lambda_k \mathbf{v}_k$$

Each eigenvector $$\mathbf{v}_k$$ is a principal component direction. Its eigenvalue $$\lambda_k$$ equals the variance of projections onto that direction.

**Step 4: Project.**

$$z_{ik} = \tilde{\mathbf{x}}_i \cdot \mathbf{v}_k$$

Each data point gets a new coordinate for each principal component.

### Try It: Adjust Correlation, Watch Eigenvectors

Drag the slider to control the correlation between two features. Watch the covariance matrix change and the eigenvectors rotate.

<div class="interactive-demo" id="demo-covariance">
  <canvas id="canvas-covariance"></canvas>
  <div class="demo-controls">
    <label>Correlation: <input type="range" id="slider-cov-corr" min="-95" max="95" value="70"><span class="demo-value" id="val-cov-corr">0.70</span></label>
    <button id="btn-cov-reset">Regenerate</button>
  </div>
  <div class="demo-info" id="info-covariance">Adjust correlation to see covariance matrix and eigenvectors change</div>
</div>

<script>
(function() {
  var W = 680, H = 460;
  var canvas = document.getElementById('canvas-covariance');
  var ctx = PCA.setupCanvas(canvas, W, H);
  var slider = document.getElementById('slider-cov-corr');
  var valEl = document.getElementById('val-cov-corr');
  var info = document.getElementById('info-covariance');
  var btnReset = document.getElementById('btn-cov-reset');

  var basePoints; // uncorrelated base points
  var seed;

  function genBase() {
    basePoints = [];
    for (var i = 0; i < 80; i++) {
      basePoints.push([PCA.randGauss(), PCA.randGauss()]);
    }
  }

  function getCorrelatedPts(rho) {
    var pts = [];
    for (var i = 0; i < basePoints.length; i++) {
      var x = basePoints[i][0];
      var y = rho * basePoints[i][0] + Math.sqrt(1 - rho * rho) * basePoints[i][1];
      pts.push([x * 1.5, y * 1.5]);
    }
    return pts;
  }

  function draw() {
    var c = PCA.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var rho = parseFloat(slider.value) / 100;
    valEl.textContent = rho.toFixed(2);
    var pts = getCorrelatedPts(rho);

    var cx = W / 2, cy = H / 2;
    var scale = 60;

    // Grid
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = -4; i <= 4; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * scale, 30); ctx.lineTo(cx + i * scale, H - 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, cy + i * scale); ctx.lineTo(W - 30, cy + i * scale); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, cy); ctx.lineTo(W - 30, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, H - 30); ctx.stroke();

    // Points
    for (var i = 0; i < pts.length; i++) {
      var sx = cx + pts[i][0] * scale, sy = cy - pts[i][1] * scale;
      ctx.fillStyle = c.point;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // PCA
    var res = PCA.center(pts, 2);
    var cov = PCA.covariance(res.data, 2);
    var eigen = PCA.eigen2x2(cov);
    var meanPt = PCA.mean(pts, 2);
    var mc = { x: cx + meanPt[0] * scale, y: cy - meanPt[1] * scale };

    var totalVar = eigen.values[0] + eigen.values[1];
    var arrowScale = 80;

    // PC1
    var ev1 = eigen.vectors[0];
    var len1 = Math.sqrt(eigen.values[0]) * arrowScale / Math.sqrt(totalVar > 0 ? totalVar : 1) * 2;
    PCA.drawArrow(ctx, mc.x, mc.y, mc.x + ev1[0] * len1, mc.y - ev1[1] * len1, c.pc1, 3);
    PCA.drawArrow(ctx, mc.x, mc.y, mc.x - ev1[0] * len1, mc.y + ev1[1] * len1, c.pc1, 3);

    // PC2
    var ev2 = eigen.vectors[1];
    var len2 = Math.sqrt(Math.max(0, eigen.values[1])) * arrowScale / Math.sqrt(totalVar > 0 ? totalVar : 1) * 2;
    PCA.drawArrow(ctx, mc.x, mc.y, mc.x + ev2[0] * len2, mc.y - ev2[1] * len2, c.pc2, 3);
    PCA.drawArrow(ctx, mc.x, mc.y, mc.x - ev2[0] * len2, mc.y + ev2[1] * len2, c.pc2, 3);

    // Labels
    ctx.font = 'bold 13px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.pc1;
    ctx.fillText('PC1', mc.x + ev1[0] * len1 + 8, mc.y - ev1[1] * len1 - 4);
    ctx.fillStyle = c.pc2;
    ctx.fillText('PC2', mc.x + ev2[0] * len2 + 8, mc.y - ev2[1] * len2 - 4);

    // Covariance matrix display
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.text;
    var tx = 12, ty = 20;
    ctx.fillText('Covariance Matrix:', tx, ty);
    ctx.fillText('[ ' + cov[0][0].toFixed(2) + '  ' + cov[0][1].toFixed(2) + ' ]', tx, ty + 18);
    ctx.fillText('[ ' + cov[1][0].toFixed(2) + '  ' + cov[1][1].toFixed(2) + ' ]', tx, ty + 36);
    ctx.fillText('', tx, ty + 54);
    ctx.fillStyle = c.pc1;
    ctx.fillText('l1=' + eigen.values[0].toFixed(2), tx, ty + 60);
    ctx.fillStyle = c.pc2;
    ctx.fillText('l2=' + eigen.values[1].toFixed(2), tx + 90, ty + 60);

    var pct1 = totalVar > 0 ? (eigen.values[0] / totalVar * 100).toFixed(1) : '0.0';
    info.textContent = 'rho=' + rho.toFixed(2) + '  |  PC1 explains ' + pct1 + '% of variance  |  cov(x,y)=' + cov[0][1].toFixed(3);
  }

  slider.addEventListener('input', draw);
  btnReset.addEventListener('click', function() { genBase(); draw(); });
  PCA.observeTheme(draw);
  genBase();
  draw();
})();
</script>

When correlation is near zero, the data cloud is circular and both eigenvalues are similar, neither direction dominates. As you increase correlation, the cloud elongates, the eigenvalues diverge, and PC1 rotates to align with the diagonal. At high correlation, almost all variance lies along PC1, meaning we could drop PC2 with minimal information loss.

---

## 4. Projection Animation

When we project data onto PC1 only, we reduce from 2D to 1D. Each point drops a perpendicular line onto the PC1 axis. The red dots on the line are our 1D representation. The dropped lines represent the **information lost**, the reconstruction error.

<div class="interactive-demo" id="demo-projection">
  <canvas id="canvas-projection"></canvas>
  <div class="demo-controls">
    <label>Show: <select id="select-proj-mode" style="padding:0.3rem;border-radius:4px;border:1px solid var(--border);background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
      <option value="pc1">PC1 only (2D to 1D)</option>
      <option value="both">PC1 + PC2 (full 2D)</option>
    </select></label>
    <button id="btn-proj-animate">Animate Projection</button>
    <button id="btn-proj-reset">New Data</button>
  </div>
  <div class="demo-info" id="info-projection">Click Animate to watch points project onto principal components</div>
</div>

<script>
(function() {
  var W = 680, H = 460;
  var canvas = document.getElementById('canvas-projection');
  var ctx = PCA.setupCanvas(canvas, W, H);
  var select = document.getElementById('select-proj-mode');
  var btnAnimate = document.getElementById('btn-proj-animate');
  var btnReset = document.getElementById('btn-proj-reset');
  var info = document.getElementById('info-projection');

  var pts, centered, eigen, meanPt, animT, animating, animFrame;

  function init() {
    pts = PCA.genCorrelated2D(60, 0.5 + Math.random() * 0.8, 2.0, 0.5);
    var res = PCA.center(pts, 2);
    centered = res.data;
    meanPt = res.mean;
    var cov = PCA.covariance(centered, 2);
    eigen = PCA.eigen2x2(cov);
    animT = 1;
    animating = false;
    draw();
  }

  function draw() {
    var c = PCA.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var cx = W / 2, cy = H / 2;
    var scale = 65;
    var mode = select.value;
    var t = animT; // 0 = original positions, 1 = projected

    // Grid
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = -4; i <= 4; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * scale, 30); ctx.lineTo(cx + i * scale, H - 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, cy + i * scale); ctx.lineTo(W - 30, cy + i * scale); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(30, cy); ctx.lineTo(W - 30, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 30); ctx.lineTo(cx, H - 30); ctx.stroke();

    var ev1 = eigen.vectors[0];
    var ev2 = eigen.vectors[1];

    // Draw PC axes
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = c.pc1;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - ev1[0] * 300, cy + ev1[1] * 300);
    ctx.lineTo(cx + ev1[0] * 300, cy - ev1[1] * 300);
    ctx.stroke();

    if (mode === 'both') {
      ctx.strokeStyle = c.pc2;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - ev2[0] * 300, cy + ev2[1] * 300);
      ctx.lineTo(cx + ev2[0] * 300, cy - ev2[1] * 300);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // For each point, compute original and projected positions
    var totalError = 0;
    for (var i = 0; i < centered.length; i++) {
      var ox = centered[i][0], oy = centered[i][1];
      var proj1 = ox * ev1[0] + oy * ev1[1];
      var proj2 = ox * ev2[0] + oy * ev2[1];

      var targetX, targetY;
      if (mode === 'both') {
        targetX = ox;
        targetY = oy;
      } else {
        targetX = proj1 * ev1[0];
        targetY = proj1 * ev1[1];
      }

      var drawX = ox * (1 - t) + targetX * t;
      var drawY = oy * (1 - t) + targetY * t;

      var sx = cx + ox * scale, sy = cy - oy * scale;
      var dx = cx + drawX * scale, dy = cy - drawY * scale;

      // Drop line
      if (mode === 'pc1' && t > 0.01) {
        ctx.strokeStyle = c.projection;
        ctx.lineWidth = 1;
        ctx.globalAlpha = t;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(dx, dy);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Error computation for info
      if (mode === 'pc1') {
        var errX = ox - proj1 * ev1[0];
        var errY = oy - proj1 * ev1[1];
        totalError += errX * errX + errY * errY;
      }

      // Point
      ctx.fillStyle = c.point;
      ctx.globalAlpha = mode === 'pc1' ? 0.4 + 0.35 * (1 - t) : 0.75;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Projected point
      if (t > 0.01 && mode === 'pc1') {
        ctx.fillStyle = c.pc1;
        ctx.globalAlpha = t * 0.85;
        ctx.beginPath();
        ctx.arc(dx, dy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Arrow labels
    ctx.font = 'bold 13px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.pc1;
    ctx.fillText('PC1', cx + ev1[0] * 240, cy - ev1[1] * 240 - 8);
    if (mode === 'both') {
      ctx.fillStyle = c.pc2;
      ctx.fillText('PC2', cx + ev2[0] * 200, cy - ev2[1] * 200 - 8);
    }

    var totalVar = eigen.values[0] + eigen.values[1];
    var retained = mode === 'both' ? 100 : (totalVar > 0 ? eigen.values[0] / totalVar * 100 : 0);
    info.textContent = 'Variance retained: ' + retained.toFixed(1) + '%' +
      (mode === 'pc1' ? '  |  Reconstruction error: ' + totalError.toFixed(3) : '  |  No information lost');
  }

  function animate() {
    if (!animating) return;
    animT += 0.025;
    if (animT >= 1) {
      animT = 1;
      animating = false;
    }
    draw();
    if (animating) animFrame = requestAnimationFrame(animate);
  }

  btnAnimate.addEventListener('click', function() {
    animT = 0;
    animating = true;
    animate();
  });

  select.addEventListener('change', function() { animT = 1; draw(); });
  btnReset.addEventListener('click', init);
  PCA.observeTheme(function() { draw(); });

  init();
})();
</script>

When projecting onto PC1 only, the perpendicular distances (red drop lines) represent the error. If PC1 captures 95% of the variance, this error is small, we lost only 5% of the information while halving the dimensionality.

---

## 5. 3D to 2D Reduction

The real power of PCA is reducing high-dimensional data. Here we have a 3D point cloud that mostly lives on a tilted plane. PCA finds the plane (spanned by PC1 and PC2) and projects the data onto it. Drag to rotate the 3D view.

<div class="interactive-demo" id="demo-3d">
  <div class="demo-split">
    <div>
      <canvas id="canvas-3d-original" style="cursor:grab;"></canvas>
      <div class="demo-caption">3D Original (drag to rotate)</div>
    </div>
    <div>
      <canvas id="canvas-3d-projected"></canvas>
      <div class="demo-caption">2D Projection (PC1 vs PC2)</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btn-3d-reset">New Data</button>
    <label>Points: <input type="range" id="slider-3d-n" min="30" max="150" value="80"><span class="demo-value" id="val-3d-n">80</span></label>
  </div>
  <div class="demo-info" id="info-3d">Drag the 3D plot to rotate. PCA finds the best 2D plane.</div>
</div>

<script>
(function() {
  var CW = 330, CH = 330;
  var canvasOrig = document.getElementById('canvas-3d-original');
  var canvasProj = document.getElementById('canvas-3d-projected');
  var ctxO = PCA.setupCanvas(canvasOrig, CW, CH);
  var ctxP = PCA.setupCanvas(canvasProj, CW, CH);
  var btnReset = document.getElementById('btn-3d-reset');
  var sliderN = document.getElementById('slider-3d-n');
  var valN = document.getElementById('val-3d-n');
  var info = document.getElementById('info-3d');

  var pts3d, centered3d, mean3d, eigen3d, projected2d;
  var rotX = -0.4, rotY = 0.6;
  var dragging = false, lastMX, lastMY;

  function init() {
    var n = parseInt(sliderN.value);
    valN.textContent = n;
    pts3d = PCA.gen3D(n);
    var res = PCA.center(pts3d, 3);
    centered3d = res.data;
    mean3d = res.mean;
    var cov = PCA.covariance(centered3d, 3);
    eigen3d = PCA.eigenJacobi(cov, 3);
    projected2d = PCA.project(centered3d, eigen3d.vectors, 2);
    draw();
  }

  function draw3D() {
    var c = PCA.getColors();
    ctxO.fillStyle = c.bg;
    ctxO.fillRect(0, 0, CW, CH);

    var cx = CW / 2, cy = CH / 2;
    var scale = 50;

    // Draw axes
    var axes = [[2, 0, 0], [0, 2, 0], [0, 0, 2]];
    var axisColors = [c.pc1, c.pc2, c.pc3];
    var axisLabels = ['x', 'y', 'z'];
    for (var a = 0; a < 3; a++) {
      var p0 = PCA.project3Dto2D([0, 0, 0], rotX, rotY, cx, cy, scale);
      var p1 = PCA.project3Dto2D(axes[a], rotX, rotY, cx, cy, scale);
      ctxO.strokeStyle = axisColors[a];
      ctxO.lineWidth = 1.5;
      ctxO.globalAlpha = 0.5;
      ctxO.beginPath();
      ctxO.moveTo(p0.x, p0.y);
      ctxO.lineTo(p1.x, p1.y);
      ctxO.stroke();
      ctxO.globalAlpha = 1;
      ctxO.fillStyle = axisColors[a];
      ctxO.font = '11px JetBrains Mono, monospace';
      ctxO.fillText(axisLabels[a], p1.x + 4, p1.y - 4);
    }

    // Draw PC arrows
    var pcColors = [c.pc1, c.pc2, c.pc3];
    var totalVar = 0;
    for (var i = 0; i < eigen3d.values.length; i++) totalVar += eigen3d.values[i];
    for (var k = 0; k < 3; k++) {
      var ev = eigen3d.vectors[k];
      var len = Math.sqrt(eigen3d.values[k]) * 1.5;
      var p0 = PCA.project3Dto2D([0, 0, 0], rotX, rotY, cx, cy, scale);
      var p1 = PCA.project3Dto2D([ev[0] * len, ev[1] * len, ev[2] * len], rotX, rotY, cx, cy, scale);
      PCA.drawArrow(ctxO, p0.x, p0.y, p1.x, p1.y, pcColors[k], 2.5);
      ctxO.fillStyle = pcColors[k];
      ctxO.font = 'bold 11px JetBrains Mono, monospace';
      ctxO.fillText('PC' + (k + 1), p1.x + 6, p1.y - 4);
    }

    // Sort points by z for depth ordering
    var sortedPts = [];
    for (var i = 0; i < centered3d.length; i++) {
      var r = PCA.rotY(centered3d[i], rotY);
      r = PCA.rotX(r, rotX);
      sortedPts.push({ idx: i, z: r[2] });
    }
    sortedPts.sort(function(a, b) { return a.z - b.z; });

    // Draw points
    for (var si = 0; si < sortedPts.length; si++) {
      var i = sortedPts[si].idx;
      var p = PCA.project3Dto2D(centered3d[i], rotX, rotY, cx, cy, scale);
      var depth = (sortedPts[si].z + 4) / 8;
      ctxO.fillStyle = c.point;
      ctxO.globalAlpha = 0.3 + 0.5 * Math.max(0, Math.min(1, depth));
      ctxO.beginPath();
      ctxO.arc(p.x, p.y, 3 + depth * 2, 0, Math.PI * 2);
      ctxO.fill();
    }
    ctxO.globalAlpha = 1;

    // Info text
    ctxO.fillStyle = c.textMuted;
    ctxO.font = '10px JetBrains Mono, monospace';
    ctxO.textAlign = 'left';
    var varPcts = [];
    for (var i = 0; i < 3; i++) {
      varPcts.push((totalVar > 0 ? eigen3d.values[i] / totalVar * 100 : 0).toFixed(1));
    }
    ctxO.fillText('Var: ' + varPcts[0] + '% / ' + varPcts[1] + '% / ' + varPcts[2] + '%', 8, CH - 8);
  }

  function draw2D() {
    var c = PCA.getColors();
    ctxP.fillStyle = c.bg;
    ctxP.fillRect(0, 0, CW, CH);

    if (!projected2d || projected2d.length === 0) return;

    // Find range
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < projected2d.length; i++) {
      if (projected2d[i][0] < minX) minX = projected2d[i][0];
      if (projected2d[i][0] > maxX) maxX = projected2d[i][0];
      if (projected2d[i][1] < minY) minY = projected2d[i][1];
      if (projected2d[i][1] > maxY) maxY = projected2d[i][1];
    }
    var pad = 40;
    var rangeX = maxX - minX || 1, rangeY = maxY - minY || 1;
    var margin = 0.1;
    minX -= rangeX * margin; maxX += rangeX * margin;
    minY -= rangeY * margin; maxY += rangeY * margin;

    // Grid
    ctxP.strokeStyle = c.grid;
    ctxP.lineWidth = 0.5;
    for (var i = 0; i <= 6; i++) {
      var x = pad + (CW - 2 * pad) * i / 6;
      ctxP.beginPath(); ctxP.moveTo(x, pad); ctxP.lineTo(x, CH - pad); ctxP.stroke();
      var y = pad + (CH - 2 * pad) * i / 6;
      ctxP.beginPath(); ctxP.moveTo(pad, y); ctxP.lineTo(CW - pad, y); ctxP.stroke();
    }
    ctxP.strokeStyle = c.border;
    ctxP.lineWidth = 1;
    ctxP.strokeRect(pad, pad, CW - 2 * pad, CH - 2 * pad);

    // Points
    for (var i = 0; i < projected2d.length; i++) {
      var px = pad + (projected2d[i][0] - minX) / (maxX - minX) * (CW - 2 * pad);
      var py = CH - pad - (projected2d[i][1] - minY) / (maxY - minY) * (CH - 2 * pad);
      ctxP.fillStyle = c.point;
      ctxP.globalAlpha = 0.75;
      ctxP.beginPath();
      ctxP.arc(px, py, 4, 0, Math.PI * 2);
      ctxP.fill();
    }
    ctxP.globalAlpha = 1;

    // Axis labels
    ctxP.fillStyle = c.pc1;
    ctxP.font = 'bold 12px JetBrains Mono, monospace';
    ctxP.textAlign = 'center';
    ctxP.fillText('PC1', CW / 2, CH - 8);
    ctxP.save();
    ctxP.translate(12, CH / 2);
    ctxP.rotate(-Math.PI / 2);
    ctxP.fillStyle = c.pc2;
    ctxP.fillText('PC2', 0, 0);
    ctxP.restore();

    // Reconstruction error
    var reconstructed = PCA.reconstruct(projected2d, eigen3d.vectors, mean3d, 3);
    var totalErr = 0;
    for (var i = 0; i < pts3d.length; i++) {
      for (var j = 0; j < 3; j++) {
        var diff = pts3d[i][j] - reconstructed[i][j];
        totalErr += diff * diff;
      }
    }
    var avgErr = totalErr / pts3d.length;
    var totalVar = 0;
    for (var i = 0; i < 3; i++) totalVar += eigen3d.values[i];
    var retained = totalVar > 0 ? (eigen3d.values[0] + eigen3d.values[1]) / totalVar * 100 : 0;

    info.textContent = 'Variance retained (2 PCs): ' + retained.toFixed(1) + '%  |  Avg reconstruction error: ' + avgErr.toFixed(4);
  }

  function draw() {
    draw3D();
    draw2D();
  }

  // Drag rotation for 3D canvas
  canvasOrig.addEventListener('mousedown', function(e) {
    dragging = true;
    lastMX = e.clientX;
    lastMY = e.clientY;
    canvasOrig.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    var dx = e.clientX - lastMX;
    var dy = e.clientY - lastMY;
    rotY += dx * 0.01;
    rotX += dy * 0.01;
    lastMX = e.clientX;
    lastMY = e.clientY;
    draw3D();
  });

  window.addEventListener('mouseup', function() {
    dragging = false;
    canvasOrig.style.cursor = 'grab';
  });

  // Touch support for 3D rotation
  canvasOrig.addEventListener('touchstart', function(e) {
    e.preventDefault();
    dragging = true;
    lastMX = e.touches[0].clientX;
    lastMY = e.touches[0].clientY;
  }, { passive: false });

  canvasOrig.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (!dragging) return;
    var dx = e.touches[0].clientX - lastMX;
    var dy = e.touches[0].clientY - lastMY;
    rotY += dx * 0.01;
    rotX += dy * 0.01;
    lastMX = e.touches[0].clientX;
    lastMY = e.touches[0].clientY;
    draw3D();
  }, { passive: false });

  canvasOrig.addEventListener('touchend', function() { dragging = false; });

  btnReset.addEventListener('click', init);
  sliderN.addEventListener('input', function() { valN.textContent = sliderN.value; init(); });
  PCA.observeTheme(draw);
  init();
})();
</script>

The 3D data mostly lives on a tilted 2D plane (it has three dimensions, but the third has very little variance). PCA discovers this plane and projects the data onto it, preserving the distances between points almost perfectly. The variance retained by the first two components is typically above 95%.

---

## 6. Scree Plot: How Many Components?

In practice, we must choose how many principal components to keep. The **scree plot** shows eigenvalues (or explained variance ratios) in descending order. We look for an "elbow", the point where additional components add little variance.

The **cumulative variance** line shows how much total variance is explained. A common rule of thumb: keep enough components to explain 90--95% of the total variance.

<div class="interactive-demo" id="demo-scree">
  <div class="demo-split">
    <div>
      <canvas id="canvas-scree-bar"></canvas>
      <div class="demo-caption">Explained variance ratio per component</div>
    </div>
    <div>
      <canvas id="canvas-scree-cumulative"></canvas>
      <div class="demo-caption">Cumulative variance explained</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Dimensions: <select id="select-scree-dim" style="padding:0.3rem;border-radius:4px;border:1px solid var(--border);background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
      <option value="4">4D</option>
      <option value="6" selected>6D</option>
      <option value="8">8D</option>
      <option value="10">10D</option>
    </select></label>
    <label>Threshold: <input type="range" id="slider-scree-thresh" min="50" max="99" value="90"><span class="demo-value" id="val-scree-thresh">90%</span></label>
    <button id="btn-scree-reset">New Data</button>
  </div>
  <div class="demo-info" id="info-scree">Generate data to see explained variance breakdown</div>
</div>

<script>
(function() {
  var CW = 330, CH = 280;
  var canvasBar = document.getElementById('canvas-scree-bar');
  var canvasCum = document.getElementById('canvas-scree-cumulative');
  var ctxB = PCA.setupCanvas(canvasBar, CW, CH);
  var ctxC = PCA.setupCanvas(canvasCum, CW, CH);
  var selectDim = document.getElementById('select-scree-dim');
  var sliderThresh = document.getElementById('slider-scree-thresh');
  var valThresh = document.getElementById('val-scree-thresh');
  var btnReset = document.getElementById('btn-scree-reset');
  var info = document.getElementById('info-scree');

  var eigenvalues, dim;

  function genData() {
    dim = parseInt(selectDim.value);
    var n = 100;
    // Generate data with decaying variances along random directions
    var variances = [];
    var baseVar = 5;
    for (var j = 0; j < dim; j++) {
      variances.push(baseVar);
      baseVar *= 0.4 + Math.random() * 0.3;
    }
    // Generate data
    var pts = [];
    for (var i = 0; i < n; i++) {
      var row = new Array(dim);
      for (var j = 0; j < dim; j++) {
        row[j] = PCA.randGauss() * Math.sqrt(variances[j]);
      }
      pts.push(row);
    }
    // Apply random rotation to mix features
    var Q = randomRotation(dim);
    var rotated = [];
    for (var i = 0; i < n; i++) {
      var row = new Array(dim);
      for (var j = 0; j < dim; j++) {
        row[j] = 0;
        for (var k = 0; k < dim; k++) {
          row[j] += Q[j][k] * pts[i][k];
        }
      }
      rotated.push(row);
    }

    var res = PCA.center(rotated, dim);
    var cov = PCA.covariance(res.data, dim);
    var eigen = PCA.eigenJacobi(cov, dim, 200);
    eigenvalues = eigen.values;
    drawAll();
  }

  function randomRotation(d) {
    // Gram-Schmidt on random vectors
    var Q = [];
    for (var i = 0; i < d; i++) {
      var v = new Array(d);
      for (var j = 0; j < d; j++) v[j] = PCA.randGauss();
      // Orthogonalize against previous vectors
      for (var k = 0; k < i; k++) {
        var dot = 0;
        for (var j = 0; j < d; j++) dot += v[j] * Q[k][j];
        for (var j = 0; j < d; j++) v[j] -= dot * Q[k][j];
      }
      // Normalize
      var norm = 0;
      for (var j = 0; j < d; j++) norm += v[j] * v[j];
      norm = Math.sqrt(norm);
      for (var j = 0; j < d; j++) v[j] /= norm;
      Q.push(v);
    }
    return Q;
  }

  function drawAll() {
    var c = PCA.getColors();
    var thresh = parseInt(sliderThresh.value) / 100;
    valThresh.textContent = (thresh * 100).toFixed(0) + '%';

    var total = 0;
    for (var i = 0; i < eigenvalues.length; i++) total += Math.max(0, eigenvalues[i]);
    var ratios = [];
    for (var i = 0; i < eigenvalues.length; i++) ratios.push(total > 0 ? Math.max(0, eigenvalues[i]) / total : 0);

    // Bar chart
    ctxB.fillStyle = c.bg;
    ctxB.fillRect(0, 0, CW, CH);
    var pad = 45;
    var plotW = CW - 2 * pad, plotH = CH - 2 * pad;
    // Grid
    ctxB.strokeStyle = c.grid;
    ctxB.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) {
      var y = pad + plotH * (1 - i / 5);
      ctxB.beginPath(); ctxB.moveTo(pad, y); ctxB.lineTo(CW - pad, y); ctxB.stroke();
    }
    ctxB.strokeStyle = c.border;
    ctxB.lineWidth = 1;
    ctxB.strokeRect(pad, pad, plotW, plotH);

    var barW = plotW / eigenvalues.length * 0.7;
    var gap = plotW / eigenvalues.length * 0.3;
    var maxR = Math.max.apply(null, ratios) * 1.1;

    var keptComponents = 0;
    var cumSum = 0;
    for (var i = 0; i < ratios.length; i++) {
      cumSum += ratios[i];
      if (keptComponents === 0 && cumSum >= thresh) keptComponents = i + 1;
    }
    if (keptComponents === 0) keptComponents = eigenvalues.length;

    for (var i = 0; i < ratios.length; i++) {
      var x = pad + (plotW / eigenvalues.length) * i + gap / 2;
      var h = ratios[i] / maxR * plotH;
      var y = pad + plotH - h;
      ctxB.fillStyle = i < keptComponents ? c.accent : c.textMuted;
      ctxB.globalAlpha = i < keptComponents ? 0.85 : 0.35;
      ctxB.fillRect(x, y, barW, h);
      ctxB.globalAlpha = 1;
      // Label
      ctxB.fillStyle = c.text;
      ctxB.font = '10px JetBrains Mono, monospace';
      ctxB.textAlign = 'center';
      ctxB.fillText('PC' + (i + 1), x + barW / 2, pad + plotH + 14);
      ctxB.fillText((ratios[i] * 100).toFixed(1) + '%', x + barW / 2, y - 5);
    }
    // Y label
    ctxB.fillStyle = c.textMuted;
    ctxB.font = '10px JetBrains Mono, monospace';
    ctxB.textAlign = 'right';
    for (var i = 0; i <= 5; i++) {
      var val = maxR * i / 5 * 100;
      var y = pad + plotH * (1 - i / 5);
      ctxB.fillText(val.toFixed(0) + '%', pad - 5, y + 4);
    }

    // Cumulative chart
    ctxC.fillStyle = c.bg;
    ctxC.fillRect(0, 0, CW, CH);
    ctxC.strokeStyle = c.grid;
    ctxC.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) {
      var y = pad + plotH * (1 - i / 5);
      ctxC.beginPath(); ctxC.moveTo(pad, y); ctxC.lineTo(CW - pad, y); ctxC.stroke();
    }
    ctxC.strokeStyle = c.border;
    ctxC.lineWidth = 1;
    ctxC.strokeRect(pad, pad, plotW, plotH);

    // Threshold line
    var threshY = pad + plotH * (1 - thresh);
    ctxC.strokeStyle = c.pc1;
    ctxC.lineWidth = 1.5;
    ctxC.setLineDash([5, 3]);
    ctxC.beginPath();
    ctxC.moveTo(pad, threshY);
    ctxC.lineTo(CW - pad, threshY);
    ctxC.stroke();
    ctxC.setLineDash([]);
    ctxC.fillStyle = c.pc1;
    ctxC.font = '10px JetBrains Mono, monospace';
    ctxC.textAlign = 'left';
    ctxC.fillText((thresh * 100).toFixed(0) + '% threshold', pad + 4, threshY - 5);

    // Cumulative line
    var cum = 0;
    ctxC.strokeStyle = c.accent;
    ctxC.lineWidth = 2.5;
    ctxC.beginPath();
    for (var i = 0; i < ratios.length; i++) {
      cum += ratios[i];
      var x = pad + (plotW / eigenvalues.length) * (i + 0.5);
      var y = pad + plotH * (1 - cum);
      if (i === 0) ctxC.moveTo(x, y);
      else ctxC.lineTo(x, y);
    }
    ctxC.stroke();

    // Points on cumulative line
    cum = 0;
    for (var i = 0; i < ratios.length; i++) {
      cum += ratios[i];
      var x = pad + (plotW / eigenvalues.length) * (i + 0.5);
      var y = pad + plotH * (1 - cum);
      ctxC.fillStyle = i < keptComponents ? c.accent : c.textMuted;
      ctxC.beginPath();
      ctxC.arc(x, y, 5, 0, Math.PI * 2);
      ctxC.fill();
      // Labels
      ctxC.fillStyle = c.text;
      ctxC.font = '9px JetBrains Mono, monospace';
      ctxC.textAlign = 'center';
      ctxC.fillText((cum * 100).toFixed(0) + '%', x, y - 9);
      ctxC.fillText('PC' + (i + 1), x, pad + plotH + 14);
    }

    // Y labels
    ctxC.fillStyle = c.textMuted;
    ctxC.font = '10px JetBrains Mono, monospace';
    ctxC.textAlign = 'right';
    for (var i = 0; i <= 5; i++) {
      var val = i / 5 * 100;
      var y = pad + plotH * (1 - i / 5);
      ctxC.fillText(val.toFixed(0) + '%', pad - 5, y + 4);
    }

    info.textContent = 'Need ' + keptComponents + ' of ' + dim + ' components to reach ' + (thresh * 100).toFixed(0) + '% variance';
  }

  sliderThresh.addEventListener('input', drawAll);
  selectDim.addEventListener('change', genData);
  btnReset.addEventListener('click', genData);
  PCA.observeTheme(drawAll);
  genData();
})();
</script>

<div class="demo-hint">Tip: Try 10D data. You will often find that 2--3 components capture 80%+ of the variance, meaning the "intrinsic dimensionality" of the data is much lower than 10.</div>

---

## 7. Reconstruction

If we keep only $$k < d$$ components, we can **reconstruct** an approximation of the original data:

$$\hat{\mathbf{x}}_i = \bar{\mathbf{x}} + \sum_{j=1}^{k} z_{ij}\mathbf{v}_j$$

The reconstruction error is the variance captured by the discarded components:

$$\text{Error} = \sum_{j=k+1}^{d}\lambda_j$$

### Try It: Add Components Progressively

Use the slider to increase the number of components. Watch the reconstructed points (red) converge toward the original points (blue) as more components are added.

<div class="interactive-demo" id="demo-reconstruct">
  <canvas id="canvas-reconstruct"></canvas>
  <div class="demo-controls">
    <label>Components: <input type="range" id="slider-recon-k" min="1" max="2" value="1"><span class="demo-value" id="val-recon-k">1</span></label>
    <button id="btn-recon-reset">New Data</button>
  </div>
  <div class="demo-info" id="info-reconstruct">Adjust number of components to see reconstruction improve</div>
</div>

<script>
(function() {
  var W = 680, H = 460;
  var canvas = document.getElementById('canvas-reconstruct');
  var ctx = PCA.setupCanvas(canvas, W, H);
  var slider = document.getElementById('slider-recon-k');
  var valEl = document.getElementById('val-recon-k');
  var btnReset = document.getElementById('btn-recon-reset');
  var info = document.getElementById('info-reconstruct');

  var xR = [-5, 5], yR = [-5, 5];
  var pad = 45;
  var pts, centered, meanPt, eigen;

  function toCanvas(px, py) {
    return {
      x: pad + (px - xR[0]) / (xR[1] - xR[0]) * (W - 2 * pad),
      y: H - pad - (py - yR[0]) / (yR[1] - yR[0]) * (H - 2 * pad)
    };
  }

  function init() {
    pts = PCA.genCorrelated2D(60, 0.3 + Math.random() * 1.0, 2.0 + Math.random() * 0.5, 0.4 + Math.random() * 0.3);
    var res = PCA.center(pts, 2);
    centered = res.data;
    meanPt = res.mean;
    var cov = PCA.covariance(centered, 2);
    eigen = PCA.eigen2x2(cov);
    slider.max = 2;
    draw();
  }

  function draw() {
    var c = PCA.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var k = parseInt(slider.value);
    valEl.textContent = k;

    // Grid
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    var nx = 10, ny = 10;
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

    // Project and reconstruct
    var projected = PCA.project(centered, eigen.vectors, k);
    var padded = [];
    for (var i = 0; i < projected.length; i++) {
      var row = new Array(k);
      for (var j = 0; j < k; j++) row[j] = projected[i][j];
      padded.push(row);
    }
    var reconstructed = PCA.reconstruct(padded, eigen.vectors, meanPt, 2);

    var totalError = 0;

    for (var i = 0; i < pts.length; i++) {
      var op = toCanvas(pts[i][0], pts[i][1]);
      var rp = toCanvas(reconstructed[i][0], reconstructed[i][1]);

      // Error line
      ctx.strokeStyle = c.projection;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(op.x, op.y);
      ctx.lineTo(rp.x, rp.y);
      ctx.stroke();

      // Original point
      ctx.fillStyle = c.point;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(op.x, op.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Reconstructed point
      ctx.fillStyle = c.pc1;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      var dx = pts[i][0] - reconstructed[i][0];
      var dy = pts[i][1] - reconstructed[i][1];
      totalError += dx * dx + dy * dy;
    }

    // Legend
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.point;
    ctx.beginPath(); ctx.arc(pad + 10, 25, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.text;
    ctx.fillText('Original', pad + 20, 29);
    ctx.fillStyle = c.pc1;
    ctx.beginPath(); ctx.arc(pad + 100, 25, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c.text;
    ctx.fillText('Reconstructed', pad + 110, 29);

    var totalVar = eigen.values[0] + eigen.values[1];
    var retained = 0;
    for (var i = 0; i < k; i++) retained += eigen.values[i];
    var pct = totalVar > 0 ? retained / totalVar * 100 : 0;

    info.textContent = k + ' component(s)  |  Variance retained: ' + pct.toFixed(1) + '%  |  Total reconstruction error: ' + totalError.toFixed(3);
  }

  slider.addEventListener('input', draw);
  btnReset.addEventListener('click', init);
  PCA.observeTheme(draw);
  init();
})();
</script>

With 1 component, reconstructed points lie on a line (the PC1 axis). The error lines show what we lost. With 2 components in 2D data, the reconstruction is perfect, zero error, because we kept everything.

---

## 8. PCA for Visualization: High-Dimensional Clusters

One of PCA's most powerful applications is visualizing high-dimensional data. Here we generate a 4D dataset with 3 clusters. In any single pair of original features, the clusters may overlap. But PCA finds the 2D projection that best separates them.

<div class="interactive-demo" id="demo-highdim">
  <div class="demo-split">
    <div>
      <canvas id="canvas-highdim-orig"></canvas>
      <div class="demo-caption">Feature 1 vs Feature 2 (original)</div>
    </div>
    <div>
      <canvas id="canvas-highdim-pca"></canvas>
      <div class="demo-caption">PC1 vs PC2 (PCA projection)</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Original axes: <select id="select-hd-x" style="padding:0.3rem;border-radius:4px;border:1px solid var(--border);background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
      <option value="0">Feature 1</option>
      <option value="1">Feature 2</option>
      <option value="2">Feature 3</option>
      <option value="3">Feature 4</option>
    </select>
    vs
    <select id="select-hd-y" style="padding:0.3rem;border-radius:4px;border:1px solid var(--border);background:var(--bg-primary);color:var(--text-primary);font-size:0.85rem;">
      <option value="0">Feature 1</option>
      <option value="1" selected>Feature 2</option>
      <option value="2">Feature 3</option>
      <option value="3">Feature 4</option>
    </select></label>
    <button id="btn-hd-reset">New Data</button>
  </div>
  <div class="demo-info" id="info-highdim">Compare original feature pairs with PCA projection</div>
</div>

<script>
(function() {
  var CW = 330, CH = 330;
  var canvasOrig = document.getElementById('canvas-highdim-orig');
  var canvasPCA = document.getElementById('canvas-highdim-pca');
  var ctxO = PCA.setupCanvas(canvasOrig, CW, CH);
  var ctxP = PCA.setupCanvas(canvasPCA, CW, CH);
  var selectX = document.getElementById('select-hd-x');
  var selectY = document.getElementById('select-hd-y');
  var btnReset = document.getElementById('btn-hd-reset');
  var info = document.getElementById('info-highdim');

  var dataset, projected, labels, eigen;
  var clusterColors;

  function init() {
    var res = PCA.genIrisLike(90);
    dataset = res.data;
    labels = res.labels;
    var cr = PCA.center(dataset, 4);
    var cov = PCA.covariance(cr.data, 4);
    eigen = PCA.eigenJacobi(cov, 4, 200);
    projected = PCA.project(cr.data, eigen.vectors, 2);
    draw();
  }

  function drawScatter(ctx, data, xIdx, yIdx, labelArr, xLabel, yLabel) {
    var c = PCA.getColors();
    clusterColors = [c.cluster0, c.cluster1, c.cluster2];
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, CW, CH);

    var pad = 40;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (var i = 0; i < data.length; i++) {
      var x = data[i][xIdx], y = data[i][yIdx];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    var rx = maxX - minX || 1, ry = maxY - minY || 1;
    minX -= rx * 0.1; maxX += rx * 0.1;
    minY -= ry * 0.1; maxY += ry * 0.1;

    // Grid
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 5; i++) {
      var x = pad + (CW - 2 * pad) * i / 5;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, CH - pad); ctx.stroke();
      var y = pad + (CH - 2 * pad) * i / 5;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(CW - pad, y); ctx.stroke();
    }
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, CW - 2 * pad, CH - 2 * pad);

    // Points
    for (var i = 0; i < data.length; i++) {
      var px = pad + (data[i][xIdx] - minX) / (maxX - minX) * (CW - 2 * pad);
      var py = CH - pad - (data[i][yIdx] - minY) / (maxY - minY) * (CH - 2 * pad);
      ctx.fillStyle = clusterColors[labelArr[i]];
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Labels
    ctx.fillStyle = c.text;
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(xLabel, CW / 2, CH - 6);
    ctx.save();
    ctx.translate(10, CH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
  }

  function draw() {
    var xi = parseInt(selectX.value);
    var yi = parseInt(selectY.value);
    drawScatter(ctxO, dataset, xi, yi, labels, 'Feature ' + (xi + 1), 'Feature ' + (yi + 1));
    drawScatter(ctxP, projected, 0, 1, labels, 'PC1', 'PC2');

    var totalVar = 0;
    for (var i = 0; i < eigen.values.length; i++) totalVar += eigen.values[i];
    var pc12 = (eigen.values[0] + eigen.values[1]) / totalVar * 100;
    info.textContent = 'PCA captures ' + pc12.toFixed(1) + '% variance in 2D  |  Clusters are most separated in PCA space';
  }

  selectX.addEventListener('change', draw);
  selectY.addEventListener('change', draw);
  btnReset.addEventListener('click', init);
  PCA.observeTheme(draw);
  init();
})();
</script>

<div class="demo-hint">Try switching the original axes using the dropdowns on the left plot. In many feature pair combinations, the clusters overlap heavily. But in the PCA projection (right), the clusters are optimally separated because PCA finds the directions of maximum overall variance, which often aligns with cluster separation.</div>

---

## 9. Full PCA Pipeline: step-by-step

Let us trace through the complete PCA algorithm on a concrete example. Consider a 2D dataset with $$n$$ points:

**1. Compute the mean and center the data:**

$$\bar{\mathbf{x}} = \frac{1}{n}\sum_{i=1}^{n}\mathbf{x}_i$$

$$\tilde{\mathbf{x}}_i = \mathbf{x}_i - \bar{\mathbf{x}}$$

**2. Compute the covariance matrix:**

$$\mathbf{C} = \frac{1}{n-1}\sum_{i=1}^{n}\tilde{\mathbf{x}}_i\tilde{\mathbf{x}}_i^T = \begin{bmatrix} \text{Var}(x_1) & \text{Cov}(x_1, x_2) \\ \text{Cov}(x_1, x_2) & \text{Var}(x_2) \end{bmatrix}$$

**3. Find eigenvalues by solving the characteristic equation:**

$$\det(\mathbf{C} - \lambda\mathbf{I}) = 0$$

For a $$2 \times 2$$ matrix, this gives a quadratic:

$$\lambda^2 - \text{tr}(\mathbf{C})\lambda + \det(\mathbf{C}) = 0$$

$$\lambda = \frac{\text{tr}(\mathbf{C}) \pm \sqrt{\text{tr}(\mathbf{C})^2 - 4\det(\mathbf{C})}}{2}$$

**4. Find eigenvectors** by solving $$(\mathbf{C} - \lambda_k\mathbf{I})\mathbf{v}_k = 0$$ for each eigenvalue.

**5. Project** onto the top $$k$$ eigenvectors to get the $$k$$-dimensional representation.

### Connection to SVD

PCA is closely related to the **Singular Value Decomposition (SVD)**. If $$\tilde{\mathbf{X}} = \mathbf{U}\mathbf{\Sigma}\mathbf{V}^T$$, then:

- The right singular vectors $$\mathbf{V}$$ are the principal component directions (eigenvectors of $$\mathbf{C}$$)
- The singular values satisfy $$\sigma_k^2 / (n-1) = \lambda_k$$
- The projected data is $$\mathbf{U}\mathbf{\Sigma}$$ (first $$k$$ columns)

In practice, SVD is more numerically stable than forming the covariance matrix explicitly, especially for high-dimensional data.

---

## 10. Summary

<table class="pca-table">
  <tr>
    <th>Concept</th>
    <th>Key Idea</th>
  </tr>
  <tr>
    <td>Goal</td>
    <td>Find low-dimensional representation that preserves maximum variance</td>
  </tr>
  <tr>
    <td>Principal Components</td>
    <td>Eigenvectors of the covariance matrix, ordered by eigenvalue</td>
  </tr>
  <tr>
    <td>Eigenvalue</td>
    <td>Variance of data projected onto corresponding eigenvector</td>
  </tr>
  <tr>
    <td>Explained Variance Ratio</td>
    <td>$$\lambda_k / \sum_j \lambda_j$$, fraction of total variance captured by PC$$k$$</td>
  </tr>
  <tr>
    <td>Choosing k</td>
    <td>Scree plot, cumulative variance threshold (90--95%), or domain knowledge</td>
  </tr>
  <tr>
    <td>Reconstruction</td>
    <td>$$\hat{\mathbf{x}} = \bar{\mathbf{x}} + \sum_{j=1}^{k} z_j \mathbf{v}_j$$, error = discarded eigenvalues</td>
  </tr>
  <tr>
    <td>Relation to SVD</td>
    <td>PC directions = right singular vectors; eigenvalues = squared singular values / (n-1)</td>
  </tr>
</table>

### When PCA Works Well

- **Correlated features.** If features are linearly correlated, PCA compresses them efficiently.
- **Visualization.** Projecting to 2D or 3D for exploratory analysis.
- **Preprocessing.** Reducing dimensions before running other ML algorithms (speeds them up, reduces overfitting).
- **Noise reduction.** Discarding low-variance components often removes noise.

### Limitations

- **Linear only.** PCA finds linear projections. If the structure is curved (a Swiss roll, for example), PCA fails, you need kernel PCA or nonlinear methods like t-SNE / UMAP.
- **Variance is not always importance.** The direction of maximum variance is not necessarily the most discriminative for classification. That is what **Linear Discriminant Analysis (LDA)** addresses.
- **Sensitive to scaling.** Features with large ranges dominate the covariance. Always standardize features before applying PCA (unless all features share the same units).
- **Interpretability.** Principal components are linear combinations of all features, which can be hard to interpret.

### The PCA Algorithm

1. **Standardize** the data (zero mean, optionally unit variance)
2. **Compute** the covariance matrix $$\mathbf{C}$$
3. **Eigendecompose** $$\mathbf{C}$$ to get eigenvalues and eigenvectors
4. **Sort** eigenvectors by descending eigenvalue
5. **Choose** $$k$$ components (scree plot / threshold)
6. **Project** data onto top $$k$$ eigenvectors

PCA is one of the most important algorithms in data science. It connects linear algebra, statistics, and geometry in a way that is both theoretically beautiful and practically indispensable. Every data scientist should understand it deeply, and now you have seen it work, from scratch, with your own data.

---

*In the next chapter, we will explore neural networks, the Perceptron and Multi-Layer Perceptron, where we move from linear to nonlinear models and begin the journey toward deep learning.*
