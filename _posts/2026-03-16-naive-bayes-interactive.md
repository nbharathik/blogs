---
layout: post
title: "Naive Bayes Classifier from Scratch - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Understand Naive Bayes through interactive Gaussian distributions, posterior probability heatmaps, prior adjustment, and a live text classification demo - all from scratch in your browser."
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
.nb-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.9rem;
}
.nb-table th, .nb-table td {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}
.nb-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
.nb-table td {
  background: var(--bg-primary);
}
.nb-word-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.6rem 0;
}
.nb-word-tag {
  padding: 0.25rem 0.55rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}
.nb-text-input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  box-sizing: border-box;
}
.nb-text-input:focus {
  outline: none;
  border-color: var(--accent);
}
.nb-result-bar {
  height: 28px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  margin: 0.5rem 0;
  font-size: 0.75rem;
  font-weight: 600;
}
.nb-result-bar > div {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.3s ease;
  color: #fff;
}
.nb-area-diagram {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
  margin: 0.5rem 0;
}
</style>

<script>
window.NB = (function() {
  var N = {};

  N.getColors = function() {
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
      class0RGB: isDark ? [122,162,247] : [37,99,235],
      class1: isDark ? '#f7768e' : '#e63946',
      class1Light: isDark ? 'rgba(247,118,142,0.15)' : 'rgba(230,57,70,0.12)',
      class1RGB: isDark ? [247,118,142] : [230,57,70],
      green: isDark ? '#9ece6a' : '#16a34a',
      orange: isDark ? '#ff9e64' : '#d97706',
      purple: isDark ? '#bb9af7' : '#7c3aed',
      isDark: isDark
    };
  };

  N.setupCanvas = function(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  N.observeTheme = function(cb) {
    var obs = new MutationObserver(function() { cb(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb);
  };

  // Gaussian PDF
  N.gaussPDF = function(x, mu, sigma) {
    var z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
  };

  // Log Gaussian PDF (for numerical stability)
  N.logGaussPDF = function(x, mu, sigma) {
    var z = (x - mu) / sigma;
    return -0.5 * z * z - Math.log(sigma) - 0.5 * Math.log(2 * Math.PI);
  };

  // Draw axes helper
  N.drawAxes = function(ctx, W, H, c, xRange, yRange, pad) {
    pad = pad || 45;
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 0.5;
    var nx = 8, ny = 6;
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
      ctx.fillText(val.toFixed(2), pad - 8, y + 4);
    }
    return pad;
  };

  N.toCanvasX = function(val, W, pad, xR) {
    return pad + (val - xR[0]) / (xR[1] - xR[0]) * (W - 2 * pad);
  };

  N.toCanvasY = function(val, H, pad, yR) {
    return H - pad - (val - yR[0]) / (yR[1] - yR[0]) * (H - 2 * pad);
  };

  N.fromCanvasX = function(cx, W, pad, xR) {
    return xR[0] + (cx - pad) / (W - 2 * pad) * (xR[1] - xR[0]);
  };

  N.fromCanvasY = function(cy, H, pad, yR) {
    return yR[0] + (H - pad - cy) / (H - 2 * pad) * (yR[1] - yR[0]);
  };

  return N;
})();
</script>

Naive Bayes is one of the simplest yet most effective classification algorithms in machine learning. Despite its "naive" assumption that features are independent, it performs remarkably well for text classification, spam filtering, and medical diagnosis. Its secret weapon is **Bayes' theorem**, which gives us a principled way to update beliefs in the face of new evidence.

In this chapter, we will build Naive Bayes from scratch with interactive visualizations that let you manipulate every parameter and see the results in real time.

---

## 1. Bayes' Theorem Intuition

At the heart of Naive Bayes lies **Bayes' theorem**. It tells us how to reverse conditional probabilities:

$$P(A \mid B) = \frac{P(B \mid A) \, P(A)}{P(B)}$$

where:
- $$P(A \mid B)$$ is the **posterior** -- the probability of $$A$$ given we observed $$B$$
- $$P(B \mid A)$$ is the **likelihood** -- how likely is $$B$$ if $$A$$ is true
- $$P(A)$$ is the **prior** -- our initial belief about $$A$$
- $$P(B)$$ is the **evidence** -- total probability of observing $$B$$

The evidence is computed using the law of total probability:

$$P(B) = P(B \mid A) \, P(A) + P(B \mid \neg A) \, P(\neg A)$$

### Try It: Bayes' Theorem Calculator

<div class="demo-hint">
<strong>Interactive:</strong> Adjust the three sliders to see how P(A|B) changes. The area diagram on the right shows the proportional areas -- the highlighted region is the posterior probability.
</div>

<div class="interactive-demo">
  <canvas id="bayes-canvas"></canvas>
  <div class="demo-controls">
    <label>P(A): <input type="range" id="bayes-pa" min="1" max="99" value="30"> <span class="demo-value" id="bayes-pa-val">0.30</span></label>
    <label>P(B|A): <input type="range" id="bayes-pba" min="1" max="99" value="80"> <span class="demo-value" id="bayes-pba-val">0.80</span></label>
    <label>P(B|~A): <input type="range" id="bayes-pbna" min="1" max="99" value="20"> <span class="demo-value" id="bayes-pbna-val">0.20</span></label>
  </div>
  <div class="demo-info" id="bayes-info"></div>
</div>

<script>
(function() {
  var canvas = document.getElementById('bayes-canvas');
  var paSlider = document.getElementById('bayes-pa');
  var pbaSlider = document.getElementById('bayes-pba');
  var pbnaSlider = document.getElementById('bayes-pbna');
  var paVal = document.getElementById('bayes-pa-val');
  var pbaVal = document.getElementById('bayes-pba-val');
  var pbnaVal = document.getElementById('bayes-pbna-val');
  var infoEl = document.getElementById('bayes-info');

  var W = 680, H = 340;

  function draw() {
    var ctx = NB.setupCanvas(canvas, W, H);
    var c = NB.getColors();

    var pA = parseInt(paSlider.value) / 100;
    var pBA = parseInt(pbaSlider.value) / 100;
    var pBnA = parseInt(pbnaSlider.value) / 100;

    paVal.textContent = pA.toFixed(2);
    pbaVal.textContent = pBA.toFixed(2);
    pbnaVal.textContent = pBnA.toFixed(2);

    var pB = pBA * pA + pBnA * (1 - pA);
    var pAB = (pBA * pA) / pB;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Left side: formula result
    var leftW = W * 0.4;
    ctx.fillStyle = c.text;
    ctx.font = 'bold 14px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Bayes\' Theorem', leftW / 2, 35);

    ctx.font = '13px JetBrains Mono, monospace';
    ctx.fillStyle = c.textMuted;
    ctx.fillText('P(B|A) * P(A)', leftW / 2, 70);
    ctx.fillText('P(A|B) = ---------------', leftW / 2, 90);
    ctx.fillText('P(B)', leftW / 2, 110);

    ctx.font = '12px JetBrains Mono, monospace';
    ctx.fillStyle = c.text;
    ctx.fillText(pBA.toFixed(2) + ' * ' + pA.toFixed(2), leftW / 2, 145);
    ctx.fillText('= --------------------------', leftW / 2, 162);
    ctx.fillText(pB.toFixed(4), leftW / 2, 179);

    ctx.font = 'bold 28px JetBrains Mono, monospace';
    ctx.fillStyle = c.accent;
    ctx.fillText(pAB.toFixed(4), leftW / 2, 230);

    ctx.font = '12px JetBrains Mono, monospace';
    ctx.fillStyle = c.textMuted;
    ctx.fillText('P(A|B)', leftW / 2, 255);

    // Additional info
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = c.textMuted;
    ctx.fillText('P(B) = ' + pB.toFixed(4), leftW / 2, 290);
    ctx.fillText('P(~A|B) = ' + (1 - pAB).toFixed(4), leftW / 2, 310);

    // Right side: area diagram
    var rx = leftW + 30;
    var ry = 30;
    var rw = W - leftW - 60;
    var rh = H - 60;

    // Full rectangle = total population
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(rx, ry, rw, rh);

    // P(A) region (left portion)
    var aWidth = rw * pA;

    // A region: P(A)
    ctx.fillStyle = c.class0Light;
    ctx.fillRect(rx, ry, aWidth, rh);

    // ~A region
    ctx.fillStyle = c.class1Light;
    ctx.fillRect(rx + aWidth, ry, rw - aWidth, rh);

    // B|A region (within A)
    var baHeight = rh * pBA;
    ctx.fillStyle = c.isDark ? 'rgba(122,162,247,0.45)' : 'rgba(37,99,235,0.3)';
    ctx.fillRect(rx, ry, aWidth, baHeight);

    // B|~A region (within ~A)
    var bnaHeight = rh * pBnA;
    ctx.fillStyle = c.isDark ? 'rgba(247,118,142,0.35)' : 'rgba(230,57,70,0.2)';
    ctx.fillRect(rx + aWidth, ry, rw - aWidth, bnaHeight);

    // Highlight the P(A and B) area with strong color -- this is the numerator
    ctx.fillStyle = c.isDark ? 'rgba(122,162,247,0.7)' : 'rgba(37,99,235,0.45)';
    ctx.fillRect(rx, ry, aWidth, baHeight);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(rx, ry, aWidth, baHeight);

    // Labels
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = c.class0;
    ctx.fillText('A', rx + aWidth / 2, ry + rh + 18);
    ctx.fillStyle = c.class1;
    ctx.fillText('~A', rx + aWidth + (rw - aWidth) / 2, ry + rh + 18);

    ctx.fillStyle = c.text;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('B|A', rx + 4, ry + baHeight / 2 + 3);
    ctx.fillText('B|~A', rx + aWidth + 4, ry + bnaHeight / 2 + 3);

    // Divider line for B region
    ctx.strokeStyle = c.green;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(rx, ry + baHeight);
    ctx.lineTo(rx + aWidth, ry + baHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx + aWidth, ry + bnaHeight);
    ctx.lineTo(rx + rw, ry + bnaHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Title
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillStyle = c.text;
    ctx.textAlign = 'center';
    ctx.fillText('Area Diagram', rx + rw / 2, ry - 8);

    infoEl.textContent = 'P(A|B) = ' + pAB.toFixed(4) + ' | P(B) = ' + pB.toFixed(4) +
      ' | Lift = ' + (pAB / pA).toFixed(2) + 'x';
  }

  paSlider.addEventListener('input', draw);
  pbaSlider.addEventListener('input', draw);
  pbnaSlider.addEventListener('input', draw);
  NB.observeTheme(draw);
  draw();
})();
</script>

**Key insight:** Even if $$P(A)$$ is small (a rare disease, for example), a high likelihood $$P(B \mid A)$$ can produce a significant posterior $$P(A \mid B)$$. Conversely, if $$P(B \mid \neg A)$$ is also high (the test gives many false positives), the posterior drops dramatically. This is the **base rate fallacy** that Bayes' theorem helps us avoid.

---

## 2. Class-Conditional Distributions

In Gaussian Naive Bayes, we model each feature's distribution within each class as a Gaussian (normal distribution). The **class-conditional density** for feature $$x$$ given class $$C_k$$ is:

$$P(x \mid C_k) = \frac{1}{\sqrt{2\pi\sigma_k^2}} \exp\left(-\frac{(x - \mu_k)^2}{2\sigma_k^2}\right)$$

When we observe a new data point $$x$$, we compare the height of each class's Gaussian at that point. The class whose bell curve is taller at $$x$$ gives a higher likelihood.

The **decision boundary** occurs where the two class-conditional densities are equal (assuming equal priors):

$$P(x \mid C_0) = P(x \mid C_1)$$

### Try It: Adjust the Gaussians

<div class="demo-hint">
<strong>Interactive:</strong> Drag the sliders to change the mean and variance of each class's Gaussian. Watch the decision boundary (green dashed line) shift as the distributions change. The shaded regions show the classification regions for each class.
</div>

<div class="interactive-demo">
  <canvas id="gauss1d-canvas"></canvas>
  <div class="demo-controls">
    <label style="color:var(--class0, #2563eb)">~0: <input type="range" id="g1d-mu0" min="-40" max="40" value="-15"> <span class="demo-value" id="g1d-mu0-val">-1.5</span></label>
    <label style="color:var(--class0, #2563eb)">~0: <input type="range" id="g1d-s0" min="3" max="30" value="10"> <span class="demo-value" id="g1d-s0-val">1.0</span></label>
    <label style="color:var(--class1, #e63946)">~1: <input type="range" id="g1d-mu1" min="-40" max="40" value="15"> <span class="demo-value" id="g1d-mu1-val">1.5</span></label>
    <label style="color:var(--class1, #e63946)">~1: <input type="range" id="g1d-s1" min="3" max="30" value="10"> <span class="demo-value" id="g1d-s1-val">1.0</span></label>
  </div>
  <div class="demo-info" id="g1d-info"></div>
</div>

<script>
(function() {
  var canvas = document.getElementById('gauss1d-canvas');
  var mu0Slider = document.getElementById('g1d-mu0');
  var s0Slider = document.getElementById('g1d-s0');
  var mu1Slider = document.getElementById('g1d-mu1');
  var s1Slider = document.getElementById('g1d-s1');
  var mu0Val = document.getElementById('g1d-mu0-val');
  var s0Val = document.getElementById('g1d-s0-val');
  var mu1Val = document.getElementById('g1d-mu1-val');
  var s1Val = document.getElementById('g1d-s1-val');
  var infoEl = document.getElementById('g1d-info');

  var W = 680, H = 380;
  var pad = 45;
  var xR = [-6, 6], yR = [0, 0.55];

  function draw() {
    var ctx = NB.setupCanvas(canvas, W, H);
    var c = NB.getColors();
    var mu0 = parseInt(mu0Slider.value) / 10;
    var s0 = parseInt(s0Slider.value) / 10;
    var mu1 = parseInt(mu1Slider.value) / 10;
    var s1 = parseInt(s1Slider.value) / 10;

    mu0Val.textContent = mu0.toFixed(1);
    s0Val.textContent = s0.toFixed(1);
    mu1Val.textContent = mu1.toFixed(1);
    s1Val.textContent = s1.toFixed(1);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    NB.drawAxes(ctx, W, H, c, xR, yR, pad);

    // Compute PDFs and find decision boundaries
    var steps = 400;
    var dx = (xR[1] - xR[0]) / steps;
    var pdf0 = [], pdf1 = [], xs = [];
    var boundaries = [];

    for (var i = 0; i <= steps; i++) {
      var x = xR[0] + dx * i;
      xs.push(x);
      var p0 = NB.gaussPDF(x, mu0, s0);
      var p1 = NB.gaussPDF(x, mu1, s1);
      pdf0.push(p0);
      pdf1.push(p1);
      if (i > 0) {
        var prevDiff = pdf0[i-1] - pdf1[i-1];
        var currDiff = p0 - p1;
        if (prevDiff * currDiff < 0) {
          // Linear interpolation for boundary
          var t = prevDiff / (prevDiff - currDiff);
          boundaries.push(xs[i-1] + t * dx);
        }
      }
    }

    // Fill classification regions
    var plotW = W - 2 * pad;
    var plotH = H - 2 * pad;
    for (var i = 0; i < steps; i++) {
      var x = xs[i];
      var cx = NB.toCanvasX(x, W, pad, xR);
      var cxNext = NB.toCanvasX(xs[i+1], W, pad, xR);
      var isClass0 = pdf0[i] >= pdf1[i];
      ctx.fillStyle = isClass0 ? c.class0Light : c.class1Light;
      ctx.fillRect(cx, pad, cxNext - cx + 1, plotH);
    }

    // Draw filled curves
    // Class 0
    ctx.beginPath();
    ctx.moveTo(NB.toCanvasX(xs[0], W, pad, xR), NB.toCanvasY(0, H, pad, yR));
    for (var i = 0; i <= steps; i++) {
      ctx.lineTo(NB.toCanvasX(xs[i], W, pad, xR), NB.toCanvasY(pdf0[i], H, pad, yR));
    }
    ctx.lineTo(NB.toCanvasX(xs[steps], W, pad, xR), NB.toCanvasY(0, H, pad, yR));
    ctx.closePath();
    ctx.fillStyle = c.isDark ? 'rgba(122,162,247,0.2)' : 'rgba(37,99,235,0.15)';
    ctx.fill();

    ctx.beginPath();
    for (var i = 0; i <= steps; i++) {
      var cx = NB.toCanvasX(xs[i], W, pad, xR);
      var cy = NB.toCanvasY(pdf0[i], H, pad, yR);
      if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = c.class0;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Class 1
    ctx.beginPath();
    ctx.moveTo(NB.toCanvasX(xs[0], W, pad, xR), NB.toCanvasY(0, H, pad, yR));
    for (var i = 0; i <= steps; i++) {
      ctx.lineTo(NB.toCanvasX(xs[i], W, pad, xR), NB.toCanvasY(pdf1[i], H, pad, yR));
    }
    ctx.lineTo(NB.toCanvasX(xs[steps], W, pad, xR), NB.toCanvasY(0, H, pad, yR));
    ctx.closePath();
    ctx.fillStyle = c.isDark ? 'rgba(247,118,142,0.2)' : 'rgba(230,57,70,0.15)';
    ctx.fill();

    ctx.beginPath();
    for (var i = 0; i <= steps; i++) {
      var cx = NB.toCanvasX(xs[i], W, pad, xR);
      var cy = NB.toCanvasY(pdf1[i], H, pad, yR);
      if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = c.class1;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw decision boundaries
    for (var b = 0; b < boundaries.length; b++) {
      var bx = NB.toCanvasX(boundaries[b], W, pad, xR);
      ctx.strokeStyle = c.green;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(bx, pad);
      ctx.lineTo(bx, H - pad);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = c.green;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('x=' + boundaries[b].toFixed(2), bx, pad - 6);
    }

    // Legend
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.class0;
    ctx.fillText('Class 0 (u=' + mu0.toFixed(1) + ', s=' + s0.toFixed(1) + ')', pad + 10, pad + 18);
    ctx.fillStyle = c.class1;
    ctx.fillText('Class 1 (u=' + mu1.toFixed(1) + ', s=' + s1.toFixed(1) + ')', pad + 10, pad + 35);

    var bText = boundaries.length > 0 ? boundaries.map(function(b) { return b.toFixed(3); }).join(', ') : 'none';
    infoEl.textContent = 'Decision boundary at x = ' + bText;
  }

  mu0Slider.addEventListener('input', draw);
  s0Slider.addEventListener('input', draw);
  mu1Slider.addEventListener('input', draw);
  s1Slider.addEventListener('input', draw);
  NB.observeTheme(draw);
  draw();
})();
</script>

**Notice:** When the variances are equal, there is exactly one decision boundary midway between the two means. When they differ, you can get **two** boundaries, creating a region where the class with the wider spread "wraps around" the narrower one.

---

## 3. Prior Probability and Its Effect

So far we have assumed equal priors: $$P(C_0) = P(C_1) = 0.5$$. But in many real-world problems, classes are imbalanced. Bayes' theorem combines the likelihood with the prior:

$$P(C_k \mid x) \propto P(x \mid C_k) \, P(C_k)$$

When we increase $$P(C_k)$$, the decision boundary shifts **away** from class $$k$$, because we now believe class $$k$$ is more likely a priori. This means class $$k$$ claims more territory even though its distribution has not changed.

### Try It: Shift the Decision Boundary with Priors

<div class="demo-hint">
<strong>Interactive:</strong> Adjust the prior probability for Class 0. The class-conditional distributions stay fixed, but watch how the decision boundary shifts as you change the prior.
</div>

<div class="interactive-demo">
  <canvas id="prior-canvas"></canvas>
  <div class="demo-controls">
    <label>P(Class 0): <input type="range" id="prior-p0" min="5" max="95" value="50"> <span class="demo-value" id="prior-p0-val">0.50</span></label>
    <button id="prior-reset">Reset to 0.50</button>
  </div>
  <div class="demo-info" id="prior-info"></div>
</div>

<script>
(function() {
  var canvas = document.getElementById('prior-canvas');
  var p0Slider = document.getElementById('prior-p0');
  var p0Val = document.getElementById('prior-p0-val');
  var infoEl = document.getElementById('prior-info');
  var resetBtn = document.getElementById('prior-reset');

  var W = 680, H = 380;
  var pad = 45;
  var xR = [-6, 6], yR = [0, 0.55];
  var mu0 = -1.5, s0 = 1.0, mu1 = 1.5, s1 = 1.0;

  function draw() {
    var ctx = NB.setupCanvas(canvas, W, H);
    var c = NB.getColors();
    var prior0 = parseInt(p0Slider.value) / 100;
    var prior1 = 1 - prior0;

    p0Val.textContent = prior0.toFixed(2);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);
    NB.drawAxes(ctx, W, H, c, xR, yR, pad);

    var steps = 400;
    var dx = (xR[1] - xR[0]) / steps;
    var xs = [], post0 = [], post1 = [], pdf0 = [], pdf1 = [];
    var boundaries = [];

    for (var i = 0; i <= steps; i++) {
      var x = xR[0] + dx * i;
      xs.push(x);
      var p0 = NB.gaussPDF(x, mu0, s0);
      var p1 = NB.gaussPDF(x, mu1, s1);
      pdf0.push(p0);
      pdf1.push(p1);
      var num0 = p0 * prior0;
      var num1 = p1 * prior1;
      var total = num0 + num1;
      post0.push(total > 0 ? num0 / total : 0.5);
      post1.push(total > 0 ? num1 / total : 0.5);

      if (i > 0) {
        var prevW0 = pdf0[i-1] * prior0;
        var prevW1 = pdf1[i-1] * prior1;
        var currW0 = p0 * prior0;
        var currW1 = p1 * prior1;
        var prevDiff = prevW0 - prevW1;
        var currDiff = currW0 - currW1;
        if (prevDiff * currDiff < 0) {
          var t = prevDiff / (prevDiff - currDiff);
          boundaries.push(xs[i-1] + t * dx);
        }
      }
    }

    // Fill classification regions
    for (var i = 0; i < steps; i++) {
      var cx = NB.toCanvasX(xs[i], W, pad, xR);
      var cxNext = NB.toCanvasX(xs[i+1], W, pad, xR);
      var isClass0 = pdf0[i] * prior0 >= pdf1[i] * prior1;
      ctx.fillStyle = isClass0 ? c.class0Light : c.class1Light;
      ctx.fillRect(cx, pad, cxNext - cx + 1, H - 2 * pad);
    }

    // Weighted PDFs (posterior numerators, scaled for visibility)
    var maxH = 0;
    for (var i = 0; i <= steps; i++) {
      var h0 = pdf0[i] * prior0;
      var h1 = pdf1[i] * prior1;
      if (h0 > maxH) maxH = h0;
      if (h1 > maxH) maxH = h1;
    }
    var scale = yR[1] / (maxH > 0 ? maxH : 1);

    // Class 0 weighted
    ctx.beginPath();
    for (var i = 0; i <= steps; i++) {
      var cx = NB.toCanvasX(xs[i], W, pad, xR);
      var cy = NB.toCanvasY(pdf0[i] * prior0 * scale, H, pad, yR);
      if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = c.class0;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Class 1 weighted
    ctx.beginPath();
    for (var i = 0; i <= steps; i++) {
      var cx = NB.toCanvasX(xs[i], W, pad, xR);
      var cy = NB.toCanvasY(pdf1[i] * prior1 * scale, H, pad, yR);
      if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = c.class1;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw decision boundaries
    for (var b = 0; b < boundaries.length; b++) {
      var bx = NB.toCanvasX(boundaries[b], W, pad, xR);
      ctx.strokeStyle = c.green;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(bx, pad);
      ctx.lineTo(bx, H - pad);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = c.green;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('x=' + boundaries[b].toFixed(2), bx, pad - 6);
    }

    // Legend
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.class0;
    ctx.fillText('P(x|C0) * P(C0)  [prior=' + prior0.toFixed(2) + ']', pad + 10, pad + 18);
    ctx.fillStyle = c.class1;
    ctx.fillText('P(x|C1) * P(C1)  [prior=' + prior1.toFixed(2) + ']', pad + 10, pad + 35);

    var bText = boundaries.length > 0 ? boundaries.map(function(b) { return b.toFixed(3); }).join(', ') : 'none';
    infoEl.textContent = 'Decision boundary at x = ' + bText + ' | Prior ratio = ' + (prior0 / prior1).toFixed(2);
  }

  p0Slider.addEventListener('input', draw);
  resetBtn.addEventListener('click', function() {
    p0Slider.value = 50;
    draw();
  });
  NB.observeTheme(draw);
  draw();
})();
</script>

**Key insight:** Notice that at $$P(C_0) = 0.50$$ the boundary sits at $$x = 0$$, exactly between the two means. As you increase $$P(C_0)$$, the boundary shifts right -- Class 0 needs less likelihood evidence because its prior is already high. This is precisely why accounting for class imbalance matters.

---

## 4. 2D Gaussian Naive Bayes

In practice, we have multiple features. The **naive** assumption says that features are conditionally independent given the class:

$$P(\mathbf{x} \mid C_k) = P(x_1 \mid C_k) \cdot P(x_2 \mid C_k) \cdots P(x_d \mid C_k)$$

For two features and Gaussian distributions, each class $$k$$ has parameters $$(\mu_{k,1}, \sigma_{k,1})$$ for feature 1 and $$(\mu_{k,2}, \sigma_{k,2})$$ for feature 2. The joint class-conditional under the naive assumption becomes:

$$P(x_1, x_2 \mid C_k) = \frac{1}{2\pi \sigma_{k,1} \sigma_{k,2}} \exp\left(-\frac{(x_1 - \mu_{k,1})^2}{2\sigma_{k,1}^2} - \frac{(x_2 - \mu_{k,2})^2}{2\sigma_{k,2}^2}\right)$$

This creates **axis-aligned** elliptical contours because the independence assumption eliminates any correlation between features.

### Try It: 2D Classification

<div class="demo-hint">
<strong>Interactive:</strong> Click anywhere on the canvas to add a test point and see its posterior probability. The contour lines show class-conditional density levels. Click <strong>Generate</strong> for sample data, or use <strong>Clear Points</strong> to start fresh.
</div>

<div class="interactive-demo">
  <canvas id="nb2d-canvas"></canvas>
  <div class="demo-controls">
    <button id="nb2d-gen">Generate Data</button>
    <button id="nb2d-clear">Clear Points</button>
    <label>P(C0): <input type="range" id="nb2d-prior" min="10" max="90" value="50"> <span class="demo-value" id="nb2d-prior-val">0.50</span></label>
  </div>
  <div class="demo-info" id="nb2d-info">Click to classify a point</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('nb2d-canvas');
  var genBtn = document.getElementById('nb2d-gen');
  var clearBtn = document.getElementById('nb2d-clear');
  var priorSlider = document.getElementById('nb2d-prior');
  var priorVal = document.getElementById('nb2d-prior-val');
  var infoEl = document.getElementById('nb2d-info');

  var W = 680, H = 500;
  var pad = 45;
  var xR = [-5, 5], yR = [-5, 5];

  // Class parameters
  var cls0 = { mu1: -1.5, s1: 1.0, mu2: -1.0, s2: 1.2 };
  var cls1 = { mu1: 1.5, s1: 1.2, mu2: 1.0, s2: 1.0 };

  var trainPts = [];
  var testPts = [];

  function genData() {
    trainPts = [];
    var n = 60;
    for (var i = 0; i < n; i++) {
      var isC0 = i < n / 2;
      var cl = isC0 ? cls0 : cls1;
      trainPts.push({
        x: cl.mu1 + gaussRand() * cl.s1,
        y: cl.mu2 + gaussRand() * cl.s2,
        label: isC0 ? 0 : 1
      });
    }
    testPts = [];
  }

  function gaussRand() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function posterior(x, y, prior0) {
    var logL0 = NB.logGaussPDF(x, cls0.mu1, cls0.s1) + NB.logGaussPDF(y, cls0.mu2, cls0.s2);
    var logL1 = NB.logGaussPDF(x, cls1.mu1, cls1.s1) + NB.logGaussPDF(y, cls1.mu2, cls1.s2);
    var logP0 = logL0 + Math.log(prior0);
    var logP1 = logL1 + Math.log(1 - prior0);
    var maxLog = Math.max(logP0, logP1);
    var p0 = Math.exp(logP0 - maxLog);
    var p1 = Math.exp(logP1 - maxLog);
    var sum = p0 + p1;
    return { p0: p0 / sum, p1: p1 / sum };
  }

  function draw() {
    var ctx = NB.setupCanvas(canvas, W, H);
    var c = NB.getColors();
    var prior0 = parseInt(priorSlider.value) / 100;
    priorVal.textContent = prior0.toFixed(2);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Decision region heatmap
    var plotW = W - 2 * pad;
    var plotH = H - 2 * pad;
    var res = 4; // pixel step
    var imgData = ctx.createImageData(plotW, plotH);

    for (var py = 0; py < plotH; py += res) {
      for (var px = 0; px < plotW; px += res) {
        var fx = NB.fromCanvasX(pad + px, W, pad, xR);
        var fy = NB.fromCanvasY(pad + py, H, pad, yR);
        var post = posterior(fx, fy, prior0);
        var r, g, b;
        if (post.p0 > post.p1) {
          var t = post.p0;
          r = c.class0RGB[0]; g = c.class0RGB[1]; b = c.class0RGB[2];
          var alpha = Math.floor(15 + (t - 0.5) * 2 * 40);
          for (var dy = 0; dy < res && py + dy < plotH; dy++) {
            for (var dx = 0; dx < res && px + dx < plotW; dx++) {
              var idx = ((py + dy) * plotW + (px + dx)) * 4;
              imgData.data[idx] = r;
              imgData.data[idx+1] = g;
              imgData.data[idx+2] = b;
              imgData.data[idx+3] = alpha;
            }
          }
        } else {
          var t = post.p1;
          r = c.class1RGB[0]; g = c.class1RGB[1]; b = c.class1RGB[2];
          var alpha = Math.floor(15 + (t - 0.5) * 2 * 40);
          for (var dy = 0; dy < res && py + dy < plotH; dy++) {
            for (var dx = 0; dx < res && px + dx < plotW; dx++) {
              var idx = ((py + dy) * plotW + (px + dx)) * 4;
              imgData.data[idx] = r;
              imgData.data[idx+1] = g;
              imgData.data[idx+2] = b;
              imgData.data[idx+3] = alpha;
            }
          }
        }
      }
    }
    ctx.putImageData(imgData, pad, pad);

    NB.drawAxes(ctx, W, H, c, xR, yR, pad);

    // Draw contours for each class
    drawContours(ctx, cls0, c.class0, W, H, pad, xR, yR);
    drawContours(ctx, cls1, c.class1, W, H, pad, xR, yR);

    // Draw decision boundary
    ctx.strokeStyle = c.green;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    var prevClass = null;
    for (var px = 0; px < plotW; px++) {
      var fx = NB.fromCanvasX(pad + px, W, pad, xR);
      for (var py = 0; py < plotH; py++) {
        var fy = NB.fromCanvasY(pad + py, H, pad, yR);
        var post = posterior(fx, fy, prior0);
        var cls = post.p0 > 0.5 ? 0 : 1;
        if (py > 0 && cls !== prevClass) {
          ctx.fillStyle = c.green;
          ctx.fillRect(pad + px, pad + py, 1.5, 1.5);
        }
        prevClass = cls;
      }
    }
    ctx.setLineDash([]);

    // Draw training points
    for (var i = 0; i < trainPts.length; i++) {
      var p = trainPts[i];
      var cx = NB.toCanvasX(p.x, W, pad, xR);
      var cy = NB.toCanvasY(p.y, H, pad, yR);
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 0 ? c.class0 : c.class1;
      ctx.fill();
    }

    // Draw test points
    for (var i = 0; i < testPts.length; i++) {
      var p = testPts[i];
      var cx = NB.toCanvasX(p.x, W, pad, xR);
      var cy = NB.toCanvasY(p.y, H, pad, yR);
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.strokeStyle = p.pred === 0 ? c.class0 : c.class1;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = c.text;
      ctx.fill();

      // Label
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = c.text;
      ctx.textAlign = 'left';
      ctx.fillText('P(C0)=' + p.p0.toFixed(2), cx + 12, cy - 2);
      ctx.fillText('P(C1)=' + p.p1.toFixed(2), cx + 12, cy + 10);
    }

    // Legend
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.class0;
    ctx.fillText('Class 0', pad + 8, pad + 16);
    ctx.fillStyle = c.class1;
    ctx.fillText('Class 1', pad + 8, pad + 32);
  }

  function drawContours(ctx, cl, color, W, H, pad, xR, yR) {
    // Draw elliptical contours at 1-sigma, 2-sigma
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    for (var s = 1; s <= 2; s++) {
      ctx.beginPath();
      for (var a = 0; a <= 64; a++) {
        var theta = (a / 64) * Math.PI * 2;
        var ex = cl.mu1 + s * cl.s1 * Math.cos(theta);
        var ey = cl.mu2 + s * cl.s2 * Math.sin(theta);
        var cx = NB.toCanvasX(ex, W, pad, xR);
        var cy = NB.toCanvasY(ey, H, pad, yR);
        if (a === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // Draw mean as cross
    var mcx = NB.toCanvasX(cl.mu1, W, pad, xR);
    var mcy = NB.toCanvasY(cl.mu2, H, pad, yR);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mcx - 6, mcy); ctx.lineTo(mcx + 6, mcy);
    ctx.moveTo(mcx, mcy - 6); ctx.lineTo(mcx, mcy + 6);
    ctx.stroke();
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (W / rect.width);
    var sy = (e.clientY - rect.top) * (H / rect.height);
    var fx = NB.fromCanvasX(sx, W, pad, xR);
    var fy = NB.fromCanvasY(sy, H, pad, yR);
    if (fx < xR[0] || fx > xR[1] || fy < yR[0] || fy > yR[1]) return;

    var prior0 = parseInt(priorSlider.value) / 100;
    var post = posterior(fx, fy, prior0);
    testPts.push({ x: fx, y: fy, p0: post.p0, p1: post.p1, pred: post.p0 > post.p1 ? 0 : 1 });
    infoEl.textContent = 'Point (' + fx.toFixed(2) + ', ' + fy.toFixed(2) + '): P(C0|x)=' +
      post.p0.toFixed(4) + ', P(C1|x)=' + post.p1.toFixed(4) + ' -> Class ' + (post.p0 > post.p1 ? '0' : '1');
    draw();
  });

  // Touch support
  canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    var touch = e.changedTouches[0];
    var rect = canvas.getBoundingClientRect();
    var sx = (touch.clientX - rect.left) * (W / rect.width);
    var sy = (touch.clientY - rect.top) * (H / rect.height);
    var fx = NB.fromCanvasX(sx, W, pad, xR);
    var fy = NB.fromCanvasY(sy, H, pad, yR);
    if (fx < xR[0] || fx > xR[1] || fy < yR[0] || fy > yR[1]) return;
    var prior0 = parseInt(priorSlider.value) / 100;
    var post = posterior(fx, fy, prior0);
    testPts.push({ x: fx, y: fy, p0: post.p0, p1: post.p1, pred: post.p0 > post.p1 ? 0 : 1 });
    draw();
  });

  genBtn.addEventListener('click', function() { genData(); draw(); });
  clearBtn.addEventListener('click', function() { testPts = []; draw(); });
  priorSlider.addEventListener('input', function() {
    // Recompute test point posteriors
    var prior0 = parseInt(priorSlider.value) / 100;
    for (var i = 0; i < testPts.length; i++) {
      var post = posterior(testPts[i].x, testPts[i].y, prior0);
      testPts[i].p0 = post.p0;
      testPts[i].p1 = post.p1;
      testPts[i].pred = post.p0 > post.p1 ? 0 : 1;
    }
    draw();
  });

  NB.observeTheme(draw);
  genData();
  draw();
})();
</script>

---

## 5. Posterior Probability Heatmap

To get a complete picture of how Naive Bayes classifies the entire feature space, we can render a **posterior probability heatmap**. Each pixel is colored by $$P(C_0 \mid \mathbf{x})$$ -- from deep blue (high confidence for Class 0) through white (uncertain) to deep red (high confidence for Class 1).

### Try It: Full Posterior Landscape

<div class="demo-hint">
<strong>Interactive:</strong> Adjust the prior and watch the entire heatmap shift. The contour line at P(C0|x) = 0.5 is the decision boundary. Move the mouse over the canvas to see exact posterior values.
</div>

<div class="interactive-demo">
  <canvas id="heatmap-canvas"></canvas>
  <div class="demo-controls">
    <label>P(Class 0): <input type="range" id="hm-prior" min="5" max="95" value="50"> <span class="demo-value" id="hm-prior-val">0.50</span></label>
    <button id="hm-reset">Reset</button>
  </div>
  <div class="demo-info" id="hm-info">Hover over the canvas to see posterior values</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('heatmap-canvas');
  var priorSlider = document.getElementById('hm-prior');
  var priorVal = document.getElementById('hm-prior-val');
  var resetBtn = document.getElementById('hm-reset');
  var infoEl = document.getElementById('hm-info');

  var W = 680, H = 500;
  var pad = 45;
  var xR = [-5, 5], yR = [-5, 5];

  var cls0 = { mu1: -1.2, s1: 1.0, mu2: 0.8, s2: 0.9 };
  var cls1 = { mu1: 1.5, s1: 0.8, mu2: -0.5, s2: 1.1 };

  function posterior(x, y, prior0) {
    var logL0 = NB.logGaussPDF(x, cls0.mu1, cls0.s1) + NB.logGaussPDF(y, cls0.mu2, cls0.s2);
    var logL1 = NB.logGaussPDF(x, cls1.mu1, cls1.s1) + NB.logGaussPDF(y, cls1.mu2, cls1.s2);
    var logP0 = logL0 + Math.log(prior0);
    var logP1 = logL1 + Math.log(1 - prior0);
    var maxLog = Math.max(logP0, logP1);
    var p0 = Math.exp(logP0 - maxLog);
    var p1 = Math.exp(logP1 - maxLog);
    var sum = p0 + p1;
    return p0 / sum;
  }

  function draw() {
    var ctx = NB.setupCanvas(canvas, W, H);
    var c = NB.getColors();
    var prior0 = parseInt(priorSlider.value) / 100;
    priorVal.textContent = prior0.toFixed(2);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var plotW = W - 2 * pad;
    var plotH = H - 2 * pad;
    var res = 3;
    var imgData = ctx.createImageData(plotW, plotH);

    var c0r = c.class0RGB, c1r = c.class1RGB;
    var bgR = c.isDark ? 26 : 255;
    var bgG = c.isDark ? 27 : 255;
    var bgB = c.isDark ? 38 : 255;

    for (var py = 0; py < plotH; py += res) {
      for (var px = 0; px < plotW; px += res) {
        var fx = NB.fromCanvasX(pad + px, W, pad, xR);
        var fy = NB.fromCanvasY(pad + py, H, pad, yR);
        var p0 = posterior(fx, fy, prior0);

        var r, g, b;
        if (p0 >= 0.5) {
          var t = (p0 - 0.5) * 2; // 0 to 1
          r = Math.round(bgR + (c0r[0] - bgR) * t);
          g = Math.round(bgG + (c0r[1] - bgG) * t);
          b = Math.round(bgB + (c0r[2] - bgB) * t);
        } else {
          var t = (0.5 - p0) * 2; // 0 to 1
          r = Math.round(bgR + (c1r[0] - bgR) * t);
          g = Math.round(bgG + (c1r[1] - bgG) * t);
          b = Math.round(bgB + (c1r[2] - bgB) * t);
        }

        for (var dy = 0; dy < res && py + dy < plotH; dy++) {
          for (var dx = 0; dx < res && px + dx < plotW; dx++) {
            var idx = ((py + dy) * plotW + (px + dx)) * 4;
            imgData.data[idx] = r;
            imgData.data[idx+1] = g;
            imgData.data[idx+2] = b;
            imgData.data[idx+3] = 220;
          }
        }
      }
    }
    ctx.putImageData(imgData, pad, pad);

    // Decision boundary (p0 = 0.5 contour)
    ctx.fillStyle = c.green;
    for (var px = 0; px < plotW; px += 2) {
      var fx = NB.fromCanvasX(pad + px, W, pad, xR);
      var prevP0 = null;
      for (var py = 0; py < plotH; py += 2) {
        var fy = NB.fromCanvasY(pad + py, H, pad, yR);
        var p0 = posterior(fx, fy, prior0);
        if (prevP0 !== null && ((prevP0 - 0.5) * (p0 - 0.5) < 0)) {
          ctx.fillRect(pad + px, pad + py, 2, 2);
        }
        prevP0 = p0;
      }
    }

    NB.drawAxes(ctx, W, H, c, xR, yR, pad);

    // Draw class means
    var marks = [
      { cl: cls0, color: c.class0, label: 'C0' },
      { cl: cls1, color: c.class1, label: 'C1' }
    ];
    for (var m = 0; m < marks.length; m++) {
      var mk = marks[m];
      var cx = NB.toCanvasX(mk.cl.mu1, W, pad, xR);
      var cy = NB.toCanvasY(mk.cl.mu2, H, pad, yR);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy);
      ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8);
      ctx.stroke();
      ctx.strokeStyle = mk.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy);
      ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8);
      ctx.stroke();
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText(mk.label, cx + 10, cy - 4);
    }

    // Color scale legend
    var lx = W - pad - 20;
    var ly = pad + 10;
    var lh = 120;
    for (var i = 0; i < lh; i++) {
      var t = i / lh;
      var p0 = 1 - t;
      var r, g, b;
      if (p0 >= 0.5) {
        var s = (p0 - 0.5) * 2;
        r = Math.round(bgR + (c0r[0] - bgR) * s);
        g = Math.round(bgG + (c0r[1] - bgG) * s);
        b = Math.round(bgB + (c0r[2] - bgB) * s);
      } else {
        var s = (0.5 - p0) * 2;
        r = Math.round(bgR + (c1r[0] - bgR) * s);
        g = Math.round(bgG + (c1r[1] - bgG) * s);
        b = Math.round(bgB + (c1r[2] - bgB) * s);
      }
      ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
      ctx.fillRect(lx, ly + i, 15, 1);
    }
    ctx.strokeStyle = c.border;
    ctx.strokeRect(lx, ly, 15, lh);
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = c.text;
    ctx.textAlign = 'left';
    ctx.fillText('C0', lx + 18, ly + 6);
    ctx.fillText('0.5', lx + 18, ly + lh / 2 + 3);
    ctx.fillText('C1', lx + 18, ly + lh);
  }

  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var sx = (e.clientX - rect.left) * (W / rect.width);
    var sy = (e.clientY - rect.top) * (H / rect.height);
    var fx = NB.fromCanvasX(sx, W, pad, xR);
    var fy = NB.fromCanvasY(sy, H, pad, yR);
    if (fx < xR[0] || fx > xR[1] || fy < yR[0] || fy > yR[1]) return;
    var prior0 = parseInt(priorSlider.value) / 100;
    var p0 = posterior(fx, fy, prior0);
    infoEl.textContent = 'x=(' + fx.toFixed(2) + ', ' + fy.toFixed(2) + ') | P(C0|x)=' +
      p0.toFixed(4) + ' P(C1|x)=' + (1 - p0).toFixed(4) + ' -> ' + (p0 > 0.5 ? 'Class 0' : 'Class 1');
  });

  priorSlider.addEventListener('input', draw);
  resetBtn.addEventListener('click', function() {
    priorSlider.value = 50;
    draw();
  });
  NB.observeTheme(draw);
  draw();
})();
</script>

The smooth gradient in the heatmap tells us not just the predicted class but also the **confidence** of each prediction. Points near the decision boundary (green line) have near-50/50 posteriors, while points deep in each class's territory have posteriors close to 1.0.

---

## 6. The "Naive" Assumption

The word "naive" comes from the assumption that features are **conditionally independent** given the class. In reality, features are almost always correlated. So why does Naive Bayes still work?

Consider the true joint distribution $$P(x_1, x_2 \mid C_k)$$ for correlated features. The Naive Bayes model approximates it as the product of marginals:

$$P_{NB}(x_1, x_2 \mid C_k) = P(x_1 \mid C_k) \cdot P(x_2 \mid C_k)$$

The **key insight** is that for classification, we do not need the densities to be correct -- we only need the **argmax** to be correct. Even if the estimated probabilities are poorly calibrated, the ranking of classes may still be right.

### Try It: Correlated vs. Independent Features

<div class="demo-hint">
<strong>Interactive:</strong> Adjust the correlation slider to see how the true distribution (left) changes. The right panel always shows the Naive Bayes approximation (independent features). Notice that the decision boundary is often similar even when the contour shapes differ significantly.
</div>

<div class="interactive-demo">
  <div class="demo-split">
    <div>
      <canvas id="naive-true-canvas"></canvas>
      <div class="demo-caption">True Joint Distribution (with correlation)</div>
    </div>
    <div>
      <canvas id="naive-indep-canvas"></canvas>
      <div class="demo-caption">Naive Bayes Approximation (independent)</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Correlation (rho): <input type="range" id="naive-rho" min="-90" max="90" value="60"> <span class="demo-value" id="naive-rho-val">0.60</span></label>
    <button id="naive-reset">Reset</button>
  </div>
  <div class="demo-info" id="naive-info"></div>
</div>

<script>
(function() {
  var trueCanvas = document.getElementById('naive-true-canvas');
  var indepCanvas = document.getElementById('naive-indep-canvas');
  var rhoSlider = document.getElementById('naive-rho');
  var rhoVal = document.getElementById('naive-rho-val');
  var resetBtn = document.getElementById('naive-reset');
  var infoEl = document.getElementById('naive-info');

  var W = 320, H = 320;
  var pad = 35;
  var xR = [-5, 5], yR = [-5, 5];

  var cls0 = { mu1: -1.2, mu2: -1.0, s1: 1.0, s2: 1.0 };
  var cls1 = { mu1: 1.2, mu2: 1.0, s1: 1.0, s2: 1.0 };

  function bivarGauss(x, y, mu1, mu2, s1, s2, rho) {
    var z1 = (x - mu1) / s1;
    var z2 = (y - mu2) / s2;
    var r2 = 1 - rho * rho;
    if (r2 < 1e-8) r2 = 1e-8;
    var exponent = -(z1 * z1 - 2 * rho * z1 * z2 + z2 * z2) / (2 * r2);
    return Math.exp(exponent) / (2 * Math.PI * s1 * s2 * Math.sqrt(r2));
  }

  function logBivarGauss(x, y, mu1, mu2, s1, s2, rho) {
    var z1 = (x - mu1) / s1;
    var z2 = (y - mu2) / s2;
    var r2 = 1 - rho * rho;
    if (r2 < 1e-8) r2 = 1e-8;
    return -(z1 * z1 - 2 * rho * z1 * z2 + z2 * z2) / (2 * r2) -
      Math.log(2 * Math.PI * s1 * s2 * Math.sqrt(r2));
  }

  function draw() {
    var c = NB.getColors();
    var rho = parseInt(rhoSlider.value) / 100;
    rhoVal.textContent = rho.toFixed(2);

    // Draw true distribution
    drawPanel(trueCanvas, c, rho, true);
    // Draw naive (independent) approximation
    drawPanel(indepCanvas, c, 0, false);

    infoEl.textContent = 'rho = ' + rho.toFixed(2) + ' | The naive assumption removes all correlation';
  }

  function drawPanel(canvas, c, rho, isTrue) {
    var ctx = NB.setupCanvas(canvas, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var plotW = W - 2 * pad;
    var plotH = H - 2 * pad;
    var res = 4;
    var imgData = ctx.createImageData(plotW, plotH);

    var c0r = c.class0RGB, c1r = c.class1RGB;
    var bgR = c.isDark ? 26 : 255;
    var bgG = c.isDark ? 27 : 255;
    var bgB = c.isDark ? 38 : 255;

    for (var py = 0; py < plotH; py += res) {
      for (var px = 0; px < plotW; px += res) {
        var fx = NB.fromCanvasX(pad + px, W, pad, xR);
        var fy = NB.fromCanvasY(pad + py, H, pad, yR);

        var logL0, logL1;
        if (isTrue) {
          logL0 = logBivarGauss(fx, fy, cls0.mu1, cls0.mu2, cls0.s1, cls0.s2, rho);
          logL1 = logBivarGauss(fx, fy, cls1.mu1, cls1.mu2, cls1.s1, cls1.s2, rho);
        } else {
          logL0 = NB.logGaussPDF(fx, cls0.mu1, cls0.s1) + NB.logGaussPDF(fy, cls0.mu2, cls0.s2);
          logL1 = NB.logGaussPDF(fx, cls1.mu1, cls1.s1) + NB.logGaussPDF(fy, cls1.mu2, cls1.s2);
        }

        var maxL = Math.max(logL0, logL1);
        var p0 = Math.exp(logL0 - maxL);
        var p1 = Math.exp(logL1 - maxL);
        var post0 = p0 / (p0 + p1);

        var r, g, b;
        if (post0 >= 0.5) {
          var t = (post0 - 0.5) * 2;
          r = Math.round(bgR + (c0r[0] - bgR) * t);
          g = Math.round(bgG + (c0r[1] - bgG) * t);
          b = Math.round(bgB + (c0r[2] - bgB) * t);
        } else {
          var t = (0.5 - post0) * 2;
          r = Math.round(bgR + (c1r[0] - bgR) * t);
          g = Math.round(bgG + (c1r[1] - bgG) * t);
          b = Math.round(bgB + (c1r[2] - bgB) * t);
        }

        for (var dy = 0; dy < res && py + dy < plotH; dy++) {
          for (var dx = 0; dx < res && px + dx < plotW; dx++) {
            var idx = ((py + dy) * plotW + (px + dx)) * 4;
            imgData.data[idx] = r;
            imgData.data[idx+1] = g;
            imgData.data[idx+2] = b;
            imgData.data[idx+3] = 200;
          }
        }
      }
    }
    ctx.putImageData(imgData, pad, pad);

    // Decision boundary
    ctx.fillStyle = c.green;
    for (var px = 0; px < plotW; px += 2) {
      var fx = NB.fromCanvasX(pad + px, W, pad, xR);
      var prevP0 = null;
      for (var py = 0; py < plotH; py += 2) {
        var fy = NB.fromCanvasY(pad + py, H, pad, yR);
        var logL0, logL1;
        if (isTrue) {
          logL0 = logBivarGauss(fx, fy, cls0.mu1, cls0.mu2, cls0.s1, cls0.s2, parseFloat(rhoSlider.value) / 100);
          logL1 = logBivarGauss(fx, fy, cls1.mu1, cls1.mu2, cls1.s1, cls1.s2, parseFloat(rhoSlider.value) / 100);
        } else {
          logL0 = NB.logGaussPDF(fx, cls0.mu1, cls0.s1) + NB.logGaussPDF(fy, cls0.mu2, cls0.s2);
          logL1 = NB.logGaussPDF(fx, cls1.mu1, cls1.s1) + NB.logGaussPDF(fy, cls1.mu2, cls1.s2);
        }
        var maxL = Math.max(logL0, logL1);
        var p0 = Math.exp(logL0 - maxL) / (Math.exp(logL0 - maxL) + Math.exp(logL1 - maxL));
        if (prevP0 !== null && ((prevP0 - 0.5) * (p0 - 0.5) < 0)) {
          ctx.fillRect(pad + px, pad + py, 2, 2);
        }
        prevP0 = p0;
      }
    }

    // Draw simple axes
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(pad, pad, plotW, plotH);
    ctx.fillStyle = c.textMuted;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(xR[0], pad, H - pad + 12);
    ctx.fillText(xR[1], W - pad, H - pad + 12);
    ctx.textAlign = 'right';
    ctx.fillText(yR[0], pad - 4, H - pad + 3);
    ctx.fillText(yR[1], pad - 4, pad + 3);
  }

  rhoSlider.addEventListener('input', draw);
  resetBtn.addEventListener('click', function() {
    rhoSlider.value = 60;
    draw();
  });
  NB.observeTheme(draw);
  draw();
})();
</script>

**Observation:** Even at $$\rho = 0.9$$ (extreme correlation), the decision boundary from the true distribution and the Naive Bayes approximation are often quite close. The contour shapes differ dramatically -- tilted ellipses vs axis-aligned ones -- but the dividing line between classes is similar. This explains Naive Bayes' surprising effectiveness in practice.

---

## 7. Text Classification: Spam Detection Demo

Perhaps the most famous application of Naive Bayes is **text classification**. For text, we use **Multinomial Naive Bayes**, where features are word counts (or presence/absence).

For a document $$d$$ with words $$w_1, w_2, \ldots, w_n$$:

$$P(\text{spam} \mid d) \propto P(\text{spam}) \prod_{i=1}^{n} P(w_i \mid \text{spam})$$

We compare this to $$P(\text{ham} \mid d)$$ and classify by whichever is larger. Taking logarithms:

$$\log P(\text{spam} \mid d) \propto \log P(\text{spam}) + \sum_{i=1}^{n} \log P(w_i \mid \text{spam})$$

### Try It: Spam Classifier

<div class="demo-hint">
<strong>Interactive:</strong> Type a message in the text box below. The classifier will break it into words, compute log-probabilities for each word, and give you a spam/ham verdict with confidence. Words are color-coded: <span style="color:#e63946;font-weight:600">red = spammy</span>, <span style="color:#2563eb;font-weight:600">blue = ham-like</span>, <span style="color:#94a3b8">gray = neutral</span>.
</div>

<div class="interactive-demo">
  <input type="text" class="nb-text-input" id="spam-input" placeholder="Type a message... e.g. 'Congratulations! You won a free prize click here now'" value="Congratulations! You won a free prize click here now">
  <div id="spam-word-tags" class="nb-word-breakdown" style="margin-top:0.75rem"></div>
  <div class="nb-result-bar" id="spam-bar">
    <div id="spam-bar-ham" style="background:#2563eb">Ham</div>
    <div id="spam-bar-spam" style="background:#e63946">Spam</div>
  </div>
  <div class="demo-info" id="spam-info"></div>
  <div class="demo-controls">
    <button id="spam-ex1">Try: "Meeting at 3pm tomorrow"</button>
    <button id="spam-ex2">Try: "FREE money click now!!!"</button>
    <button id="spam-ex3">Try: "Hi, can you review the report?"</button>
  </div>
</div>

<script>
(function() {
  var input = document.getElementById('spam-input');
  var tagsEl = document.getElementById('spam-word-tags');
  var barHam = document.getElementById('spam-bar-ham');
  var barSpam = document.getElementById('spam-bar-spam');
  var infoEl = document.getElementById('spam-info');

  // Pre-trained word log-probabilities (log P(word|class))
  // Positive values = more spam, negative = more ham
  var wordScores = {
    // Spam indicators
    'free': 2.1, 'win': 2.0, 'winner': 2.3, 'won': 2.0, 'prize': 2.4, 'cash': 2.2,
    'money': 2.0, 'congratulations': 2.5, 'congratulation': 2.5, 'claim': 2.1, 'urgent': 1.8,
    'click': 1.9, 'subscribe': 1.5, 'offer': 1.7, 'deal': 1.5, 'discount': 1.8,
    'buy': 1.3, 'cheap': 1.6, 'limited': 1.4, 'act': 1.2, 'now': 0.8,
    'credit': 1.4, 'card': 0.6, 'viagra': 3.0, 'pill': 2.0, 'pharmacy': 2.2,
    'lottery': 2.5, 'selected': 1.3, 'guaranteed': 1.9, 'exclusive': 1.6,
    'million': 1.8, 'billion': 1.9, 'income': 1.5, 'earn': 1.6,
    'apply': 1.0, 'bonus': 1.7, 'gift': 1.4, 'reward': 1.5,
    'account': 0.5, 'verify': 1.3, 'password': 0.8, 'bank': 0.9,
    'unsubscribe': 1.2, 'promotion': 1.5, 'advertisement': 1.4,
    '!!!': 1.5, '!': 0.3, '$': 1.5, '%': 0.8,
    // Ham indicators
    'meeting': -1.8, 'report': -1.5, 'project': -1.6, 'team': -1.4,
    'please': -0.8, 'thanks': -1.2, 'thank': -1.2, 'hi': -0.9, 'hello': -0.7,
    'review': -1.3, 'update': -0.8, 'schedule': -1.5, 'discuss': -1.4,
    'tomorrow': -1.3, 'today': -0.6, 'monday': -1.0, 'tuesday': -1.0,
    'wednesday': -1.0, 'thursday': -1.0, 'friday': -1.0,
    'lunch': -1.2, 'dinner': -0.8, 'coffee': -1.0,
    'document': -1.3, 'file': -1.0, 'attachment': -0.9, 'attached': -1.1,
    'question': -1.0, 'help': -0.5, 'can': -0.4, 'would': -0.5,
    'could': -0.5, 'should': -0.4, 'need': -0.3, 'work': -0.8,
    'office': -1.2, 'home': -0.6, 'family': -0.9, 'friend': -0.7,
    'regards': -1.0, 'sincerely': -1.1, 'best': -0.5, 'dear': -0.3,
    'sorry': -0.8, 'appreciate': -1.0, 'confirm': -0.6, 'available': -0.7
  };

  var logPriorSpam = Math.log(0.3);  // P(spam) = 0.3
  var logPriorHam = Math.log(0.7);   // P(ham) = 0.7
  var defaultScore = 0.0;            // Unknown words are neutral

  function classify(text) {
    var words = text.toLowerCase().replace(/[^a-z0-9!$%\s]/g, '').split(/\s+/).filter(function(w) { return w.length > 0; });
    var logSpam = logPriorSpam;
    var logHam = logPriorHam;
    var wordDetails = [];

    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      var score = wordScores.hasOwnProperty(w) ? wordScores[w] : defaultScore;
      logSpam += score > 0 ? Math.log(0.5 + score * 0.15) : Math.log(0.5 - Math.abs(score) * 0.1);
      logHam += score < 0 ? Math.log(0.5 + Math.abs(score) * 0.15) : Math.log(0.5 - score * 0.1);
      wordDetails.push({ word: w, score: score });
    }

    // Normalize to probabilities
    var maxLog = Math.max(logSpam, logHam);
    var pSpam = Math.exp(logSpam - maxLog);
    var pHam = Math.exp(logHam - maxLog);
    var total = pSpam + pHam;
    pSpam /= total;
    pHam /= total;

    return { pSpam: pSpam, pHam: pHam, words: wordDetails };
  }

  function render() {
    var c = NB.getColors();
    var result = classify(input.value);

    // Render word tags
    var html = '';
    for (var i = 0; i < result.words.length; i++) {
      var w = result.words[i];
      var bgColor, textColor;
      if (w.score > 0.5) {
        var intensity = Math.min(w.score / 2.5, 1);
        bgColor = 'rgba(' + c.class1RGB.join(',') + ',' + (0.15 + intensity * 0.35) + ')';
        textColor = c.class1;
      } else if (w.score < -0.5) {
        var intensity = Math.min(Math.abs(w.score) / 2, 1);
        bgColor = 'rgba(' + c.class0RGB.join(',') + ',' + (0.15 + intensity * 0.35) + ')';
        textColor = c.class0;
      } else {
        bgColor = c.isDark ? 'rgba(86,95,137,0.3)' : 'rgba(148,163,184,0.25)';
        textColor = c.textMuted;
      }
      html += '<span class="nb-word-tag" style="background:' + bgColor + ';color:' + textColor + '">' +
        w.word + ' (' + (w.score > 0 ? '+' : '') + w.score.toFixed(1) + ')</span>';
    }
    tagsEl.innerHTML = html;

    // Update bar
    var pctHam = Math.round(result.pHam * 100);
    var pctSpam = Math.round(result.pSpam * 100);
    barHam.style.width = pctHam + '%';
    barSpam.style.width = pctSpam + '%';
    barHam.textContent = pctHam > 8 ? 'Ham ' + pctHam + '%' : '';
    barSpam.textContent = pctSpam > 8 ? 'Spam ' + pctSpam + '%' : '';

    var verdict = result.pSpam > 0.5 ? 'SPAM' : 'HAM';
    var confidence = Math.max(result.pSpam, result.pHam);
    infoEl.textContent = 'Verdict: ' + verdict + ' (confidence: ' + (confidence * 100).toFixed(1) +
      '%) | log P(spam)=' + Math.log(result.pSpam).toFixed(2) + ', log P(ham)=' + Math.log(result.pHam).toFixed(2);
  }

  input.addEventListener('input', render);

  document.getElementById('spam-ex1').addEventListener('click', function() {
    input.value = 'Meeting at 3pm tomorrow';
    render();
  });
  document.getElementById('spam-ex2').addEventListener('click', function() {
    input.value = 'FREE money click now!!!';
    render();
  });
  document.getElementById('spam-ex3').addEventListener('click', function() {
    input.value = 'Hi, can you review the report?';
    render();
  });

  render();
})();
</script>

---

## 8. Laplace Smoothing

There is a critical problem with Naive Bayes: if a word has **never** appeared in spam training data, then $$P(w \mid \text{spam}) = 0$$, and the entire product becomes zero -- no matter how many other spammy words are present. A single unseen word kills the entire prediction.

**Laplace smoothing** (also called additive smoothing) fixes this by adding a pseudo-count $$\alpha$$ to every word's count:

$$P(w \mid C_k) = \frac{\text{count}(w, C_k) + \alpha}{\sum_w \text{count}(w, C_k) + \alpha \cdot |V|}$$

where $$|V|$$ is the vocabulary size. When $$\alpha = 1$$, this is classic **add-one smoothing**. When $$\alpha < 1$$, it is **Lidstone smoothing**.

### Try It: The Effect of Smoothing

<div class="demo-hint">
<strong>Interactive:</strong> The bars show estimated word probabilities from a small training set. Toggle smoothing on/off and adjust alpha to see how zero-count words get assigned nonzero probabilities and how other probabilities shrink slightly to compensate.
</div>

<div class="interactive-demo">
  <canvas id="smooth-canvas"></canvas>
  <div class="demo-controls">
    <label>Smoothing: <input type="checkbox" id="smooth-toggle" checked> <span class="demo-value" id="smooth-status">ON</span></label>
    <label>Alpha: <input type="range" id="smooth-alpha" min="1" max="30" value="10"> <span class="demo-value" id="smooth-alpha-val">1.00</span></label>
    <button id="smooth-reset">Reset</button>
  </div>
  <div class="demo-info" id="smooth-info"></div>
</div>

<script>
(function() {
  var canvas = document.getElementById('smooth-canvas');
  var toggleEl = document.getElementById('smooth-toggle');
  var statusEl = document.getElementById('smooth-status');
  var alphaSlider = document.getElementById('smooth-alpha');
  var alphaVal = document.getElementById('smooth-alpha-val');
  var resetBtn = document.getElementById('smooth-reset');
  var infoEl = document.getElementById('smooth-info');

  var W = 680, H = 380;
  var pad = 50;

  // Simulated word counts in "spam" class
  var words = ['free', 'win', 'money', 'click', 'offer', 'hello', 'meeting', 'report', 'pizza', 'quantum'];
  var counts = [45, 32, 28, 22, 18, 3, 1, 0, 0, 0];
  var totalCount = 0;
  for (var i = 0; i < counts.length; i++) totalCount += counts[i];
  var vocabSize = 5000; // Realistic vocabulary size

  function draw() {
    var ctx = NB.setupCanvas(canvas, W, H);
    var c = NB.getColors();
    var smoothing = toggleEl.checked;
    var alpha = parseInt(alphaSlider.value) / 10;

    alphaVal.textContent = alpha.toFixed(2);
    statusEl.textContent = smoothing ? 'ON' : 'OFF';

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.font = 'bold 13px JetBrains Mono, monospace';
    ctx.fillStyle = c.text;
    ctx.textAlign = 'center';
    ctx.fillText('P(word | spam) Estimates', W / 2, 22);

    // Compute probabilities
    var probs = [];
    var maxProb = 0;
    var zeroCount = 0;
    for (var i = 0; i < words.length; i++) {
      var p;
      if (smoothing) {
        p = (counts[i] + alpha) / (totalCount + alpha * vocabSize);
      } else {
        p = counts[i] / totalCount;
      }
      probs.push(p);
      if (p > maxProb) maxProb = p;
      if (counts[i] === 0) zeroCount++;
    }

    var barAreaW = W - 2 * pad;
    var barAreaH = H - pad - 70;
    var barW = barAreaW / words.length * 0.7;
    var gap = barAreaW / words.length;
    var yScale = maxProb > 0 ? barAreaH / maxProb : 1;

    for (var i = 0; i < words.length; i++) {
      var x = pad + i * gap + (gap - barW) / 2;
      var barH = probs[i] * yScale;
      var y = pad + 30 + barAreaH - barH;

      // Determine color based on whether word had zero count
      var barColor;
      if (counts[i] === 0 && smoothing) {
        barColor = c.green; // smoothed zero-count word
      } else if (counts[i] === 0 && !smoothing) {
        barColor = c.isDark ? '#3b4261' : '#e2e8f0'; // dead zero
      } else {
        barColor = c.accent;
      }

      ctx.fillStyle = barColor;
      ctx.fillRect(x, y, barW, barH);

      // Bar outline
      ctx.strokeStyle = c.border;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, barW, barH);

      // Word label (rotated)
      ctx.save();
      ctx.translate(x + barW / 2, pad + 30 + barAreaH + 8);
      ctx.rotate(Math.PI / 4);
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillStyle = counts[i] === 0 ? (smoothing ? c.green : c.class1) : c.text;
      ctx.textAlign = 'left';
      ctx.fillText(words[i], 0, 0);
      ctx.restore();

      // Probability label on top of bar
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillStyle = c.text;
      ctx.textAlign = 'center';
      if (probs[i] > 0) {
        ctx.fillText(probs[i].toFixed(4), x + barW / 2, y - 4);
      } else {
        ctx.fillStyle = c.class1;
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText('ZERO!', x + barW / 2, y - 4);
      }

      // Count label
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillStyle = c.textMuted;
      ctx.fillText('n=' + counts[i], x + barW / 2, y - 16);
    }

    // Y-axis label
    ctx.save();
    ctx.translate(15, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = c.textMuted;
    ctx.textAlign = 'center';
    ctx.fillText('P(word | spam)', 0, 0);
    ctx.restore();

    // Legend
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = c.accent;
    ctx.fillRect(W - 200, 10, 10, 10);
    ctx.fillStyle = c.text;
    ctx.fillText('Observed words', W - 186, 19);
    ctx.fillStyle = c.green;
    ctx.fillRect(W - 200, 25, 10, 10);
    ctx.fillStyle = c.text;
    ctx.fillText('Smoothed zeros', W - 186, 34);

    var problemText = smoothing ?
      'Smoothing (alpha=' + alpha.toFixed(2) + '): Zero-count words get P=' + ((alpha) / (totalCount + alpha * vocabSize)).toExponential(2) :
      'WARNING: ' + zeroCount + ' words have P=0. Any message containing them is automatically classified wrong!';
    infoEl.textContent = problemText;
  }

  toggleEl.addEventListener('change', draw);
  alphaSlider.addEventListener('input', draw);
  resetBtn.addEventListener('click', function() {
    toggleEl.checked = true;
    alphaSlider.value = 10;
    draw();
  });
  NB.observeTheme(draw);
  draw();
})();
</script>

**The takeaway:** Without smoothing, the three zero-count words ("report", "pizza", "quantum") have $$P = 0$$, which means any document containing them will never be classified as spam -- even if it also contains "free", "win", and "money". Smoothing eliminates this catastrophic failure by assigning small but nonzero probabilities to unseen words.

---

## 9. Summary

Naive Bayes classifiers are a family of algorithms that apply Bayes' theorem with the "naive" conditional independence assumption. Despite this simplification, they are fast, simple to implement, and surprisingly effective for many real-world tasks.

### Types of Naive Bayes

<table class="nb-table">
<tr>
  <th>Variant</th>
  <th>Feature Type</th>
  <th>Distribution</th>
  <th>Use Cases</th>
</tr>
<tr>
  <td><strong>Gaussian NB</strong></td>
  <td>Continuous (real-valued)</td>
  <td>$$P(x \mid C_k) = \mathcal{N}(\mu_k, \sigma_k^2)$$</td>
  <td>Iris classification, sensor data, general continuous features</td>
</tr>
<tr>
  <td><strong>Multinomial NB</strong></td>
  <td>Discrete counts (word frequencies)</td>
  <td>$$P(\mathbf{x} \mid C_k) = \frac{n!}{\prod x_i!} \prod p_{k,i}^{x_i}$$</td>
  <td>Text classification, spam filtering, document categorization</td>
</tr>
<tr>
  <td><strong>Bernoulli NB</strong></td>
  <td>Binary (word present/absent)</td>
  <td>$$P(\mathbf{x} \mid C_k) = \prod p_{k,i}^{x_i}(1-p_{k,i})^{1-x_i}$$</td>
  <td>Short text classification, binary feature data</td>
</tr>
</table>

### Pros and Cons

<table class="nb-table">
<tr>
  <th>Advantages</th>
  <th>Disadvantages</th>
</tr>
<tr>
  <td>Extremely fast training and prediction -- $$O(n \cdot d)$$</td>
  <td>Independence assumption is rarely true</td>
</tr>
<tr>
  <td>Works well with small training sets</td>
  <td>Poor probability estimates (well-calibrated ranking, but not probabilities)</td>
</tr>
<tr>
  <td>Handles high-dimensional data (many features)</td>
  <td>Cannot learn feature interactions</td>
</tr>
<tr>
  <td>Naturally handles multi-class problems</td>
  <td>Sensitive to feature distributions (Gaussian assumption may not hold)</td>
</tr>
<tr>
  <td>Robust to irrelevant features</td>
  <td>Zero-frequency problem requires smoothing</td>
</tr>
<tr>
  <td>Good baseline for text classification</td>
  <td>Outperformed by more complex models on large datasets</td>
</tr>
</table>

### When to Use Naive Bayes

- **Text classification** -- spam filtering, sentiment analysis, topic labeling. This is where Naive Bayes shines brightest.
- **As a baseline** -- before trying complex models, Naive Bayes gives you a quick lower bound on performance.
- **Real-time classification** -- when prediction speed matters more than marginal accuracy gains.
- **Small datasets** -- when you do not have enough data to estimate complex model parameters.
- **Multi-class problems** -- Naive Bayes scales naturally to many classes without modification.

### The Big Picture

Naive Bayes teaches us a profound lesson: **simplicity can be powerful**. By making a "wrong" assumption (feature independence), we get an algorithm that is:
1. Trivially easy to train (just count and divide)
2. Extremely fast at prediction
3. Often competitive with far more complex models

The classifier's success illustrates a recurring theme in machine learning: the **bias-variance tradeoff**. Naive Bayes has high bias (the independence assumption) but very low variance (few parameters to estimate). When data is scarce or dimensions are high, this tradeoff works in its favor.

In the next chapter, we will explore **decision trees**, which take the opposite approach -- making no assumptions about feature distributions but building complex, hierarchical decision rules from the data itself.
