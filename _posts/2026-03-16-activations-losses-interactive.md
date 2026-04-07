---
layout: post
title: "Activation Functions - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
series: true
hidden: true
description: "Explore every major activation function interactively - see why activations matter, compare Sigmoid, Tanh, ReLU, Leaky ReLU, ELU, Swish, and GELU with their derivatives."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /activation-functions/
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
.grid-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.gt-matrix-panel {
  margin-top: 0.75rem;
  padding: 0.6rem 0.8rem;
  background: var(--bg-primary);
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  line-height: 1.6;
  overflow-x: auto;
}
.gt-matrix-panel .gt-layer-row {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 0.15rem 0.3rem;
  border-radius: 4px;
  transition: background 0.2s;
  flex-wrap: wrap;
}
.gt-matrix-panel .gt-layer-row.active {
  background: var(--bg-secondary);
}
.gt-matrix-panel .gt-layer-row.done {
  opacity: 0.5;
}
.gt-matrix-panel .gt-layer-label {
  font-weight: 700;
  min-width: 4.5rem;
  color: var(--accent, #2563eb);
}
.gt-matrix-panel .gt-layer-vals {
  color: var(--text-secondary);
}
.gt-matrix-panel .gt-relu-tag {
  color: #9ece6a;
  font-weight: 600;
  margin-left: 0.3rem;
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
.act-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.82rem;
}
.act-legend span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
sup.cite {
  font-size: 0.72em;
  vertical-align: super;
  line-height: 0;
}
sup.cite .cite-ref {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px dotted transparent;
  position: relative;
  padding: 0 1px;
}
sup.cite .cite-ref:hover,
sup.cite .cite-ref:focus {
  border-bottom-color: var(--accent);
  outline: none;
}
sup.cite .cite-ref::after {
  content: attr(data-cite-preview);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%) translateY(6px);
  min-width: 220px;
  max-width: 320px;
  width: max-content;
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.78rem;
  line-height: 1.35;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 30;
  white-space: normal;
}
sup.cite .cite-ref:hover::after,
sup.cite .cite-ref:focus::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.references {
  margin: 0.75rem 0 0;
  padding-left: 1.2rem;
}
.references li {
  margin: 0.55rem 0;
  line-height: 1.5;
}
.references a {
  word-break: break-word;
}
</style>

<script>
// Shared utilities for all activation & loss demos
window.AL = (function() {
  function getColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg: dark ? '#1a1b26' : '#ffffff',
      text: dark ? '#c0caf5' : '#1a1b26',
      textMuted: dark ? '#565f89' : '#6b7280',
      grid: dark ? '#292e42' : '#e5e7eb',
      axis: dark ? '#414868' : '#9ca3af',
      accent: dark ? '#7aa2f7' : '#2563eb',
      sigmoid: '#f7768e',
      tanh: '#7aa2f7',
      relu: '#9ece6a',
      leaky: '#ff9e64',
      elu: '#bb9af7',
      swish: '#73daca',
      gelu: '#e0af68',
      positive: '#9ece6a',
      negative: '#f7768e',
      warn: '#e0af68',
      btnBg: dark ? '#292e42' : '#f3f4f6',
      crosshair: dark ? 'rgba(192,202,245,0.5)' : 'rgba(26,27,38,0.3)',
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

  // ---- Activation functions ----
  function sigmoid(x) { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))); }
  function sigmoidDeriv(x) { var s = sigmoid(x); return s * (1 - s); }

  function tanhFn(x) { var e = Math.exp(2 * Math.max(-500, Math.min(500, x))); return (e - 1) / (e + 1); }
  function tanhDeriv(x) { var t = tanhFn(x); return 1 - t * t; }

  function relu(x) { return Math.max(0, x); }
  function reluDeriv(x) { return x > 0 ? 1 : 0; }

  function leakyRelu(x, a) { a = a || 0.01; return x >= 0 ? x : a * x; }
  function leakyReluDeriv(x, a) { a = a || 0.01; return x >= 0 ? 1 : a; }

  function elu(x, a) { a = a || 1.0; return x >= 0 ? x : a * (Math.exp(x) - 1); }
  function eluDeriv(x, a) { a = a || 1.0; return x >= 0 ? 1 : a * Math.exp(x); }

  function swish(x) { return x * sigmoid(x); }
  function swishDeriv(x) { var s = sigmoid(x); return s + x * s * (1 - s); }

  function gelu(x) {
    // Approximation: 0.5*x*(1+tanh(sqrt(2/pi)*(x+0.044715*x^3)))
    var c = Math.sqrt(2 / Math.PI);
    var inner = c * (x + 0.044715 * x * x * x);
    return 0.5 * x * (1 + tanhFn(inner));
  }
  function geluDeriv(x) {
    // Numerical derivative for simplicity
    var h = 0.0001;
    return (gelu(x + h) - gelu(x - h)) / (2 * h);
  }

  var activations = {
    sigmoid: { fn: sigmoid, deriv: sigmoidDeriv, label: 'Sigmoid', formula: '1/(1+e^(-x))' },
    tanh:    { fn: tanhFn, deriv: tanhDeriv, label: 'Tanh', formula: 'tanh(x)' },
    relu:    { fn: relu, deriv: reluDeriv, label: 'ReLU', formula: 'max(0, x)' },
    leaky:   { fn: leakyRelu, deriv: leakyReluDeriv, label: 'Leaky ReLU', formula: 'max(ax, x)' },
    elu:     { fn: elu, deriv: eluDeriv, label: 'ELU', formula: 'x if x>0, a(e^x-1) if x<=0' },
    swish:   { fn: swish, deriv: swishDeriv, label: 'Swish', formula: 'x * sigmoid(x)' },
    gelu:    { fn: gelu, deriv: geluDeriv, label: 'GELU', formula: 'x * Phi(x)' }
  };

  // ---- Plot helpers ----
  function drawAxes(ctx, w, h, pad, xMin, xMax, yMin, yMax, colors, xlabel, ylabel) {
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1;
    var pw = w - 2 * pad, ph = h - 2 * pad;

    // Grid lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    for (var i = 0; i <= 4; i++) {
      var px = pad + pw * i / 4;
      var py = pad + ph * i / 4;
      ctx.beginPath(); ctx.moveTo(px, pad); ctx.lineTo(px, pad + ph); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, py); ctx.lineTo(pad + pw, py); ctx.stroke();
    }

    // Zero lines
    var zx = pad + (0 - xMin) / (xMax - xMin) * pw;
    var zy = pad + ph - (0 - yMin) / (yMax - yMin) * ph;
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1;
    if (zx >= pad && zx <= pad + pw) {
      ctx.beginPath(); ctx.moveTo(zx, pad); ctx.lineTo(zx, pad + ph); ctx.stroke();
    }
    if (zy >= pad && zy <= pad + ph) {
      ctx.beginPath(); ctx.moveTo(pad, zy); ctx.lineTo(pad + pw, zy); ctx.stroke();
    }

    // Tick labels
    ctx.fillStyle = colors.textMuted;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var i = 0; i <= 4; i++) {
      var v = xMin + (xMax - xMin) * i / 4;
      var px = pad + pw * i / 4;
      ctx.fillText(v.toFixed(1), px, h - pad + 14);
    }
    ctx.textAlign = 'right';
    for (var i = 0; i <= 4; i++) {
      var v = yMin + (yMax - yMin) * i / 4;
      var py = pad + ph - ph * i / 4;
      ctx.fillText(v.toFixed(1), pad - 5, py + 3);
    }

    if (xlabel) {
      ctx.textAlign = 'center';
      ctx.fillText(xlabel, w / 2, h - 2);
    }
    if (ylabel) {
      ctx.save();
      ctx.translate(10, h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(ylabel, 0, 0);
      ctx.restore();
    }

    return { pad: pad, pw: pw, ph: ph };
  }

  function plotLine(ctx, fn, xMin, xMax, yMin, yMax, pad, pw, ph, color, lineWidth, param) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth || 2;
    ctx.beginPath();
    var steps = pw * 2;
    for (var i = 0; i <= steps; i++) {
      var x = xMin + (xMax - xMin) * i / steps;
      var y = param !== undefined ? fn(x, param) : fn(x);
      var px = pad + (x - xMin) / (xMax - xMin) * pw;
      var py = pad + ph - (y - yMin) / (yMax - yMin) * ph;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // Theme observer
  var observers = [];
  function onThemeChange(fn) { observers.push(fn); }
  var mo = new MutationObserver(function() {
    observers.forEach(function(fn) { fn(); });
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    getColors: getColors,
    setupCanvas: setupCanvas,
    activations: activations,
    sigmoid: sigmoid,
    tanhFn: tanhFn,
    relu: relu,
    leakyRelu: leakyRelu,
    elu: elu,
    swish: swish,
    gelu: gelu,
    sigmoidDeriv: sigmoidDeriv,
    tanhDeriv: tanhDeriv,
    reluDeriv: reluDeriv,
    leakyReluDeriv: leakyReluDeriv,
    eluDeriv: eluDeriv,
    swishDeriv: swishDeriv,
    geluDeriv: geluDeriv,
    drawAxes: drawAxes,
    plotLine: plotLine,
    onThemeChange: onThemeChange
  };
})();
</script>

Activation functions are one of the most important design choices in neural networks. They control what patterns a model can represent and how gradients flow during learning. This chapter explains them from the ground up, with interactive visualizations to build deep intuition.

In this guide, you will:

- See why activation functions are necessary by watching a network collapse without them
- Explore every major activation function (Sigmoid, Tanh, ReLU, Leaky ReLU, ELU, Swish, GELU) with their derivatives
- Understand saturation, vanishing gradients, and how modern activations solve these problems

---

## 1. Why Activation Functions?

Without activation functions, every layer in a neural network performs a linear transformation: multiply by weights, add bias. The composition of linear functions is still linear:

$$f(\mathbf{x}) = W_2(W_1 \mathbf{x} + b_1) + b_2 = (W_2 W_1)\mathbf{x} + (W_2 b_1 + b_2) = W'\mathbf{x} + b'$$

No matter how many layers you stack, the entire network collapses to a single linear transformation. Adding a nonlinear activation function between layers breaks this collapse and gives depth its power.<sup class="cite"><a class="cite-ref" href="#ref-3" data-cite-preview="Cybenko (1989), Approximation by superpositions of a sigmoidal function. Mathematics of Control, Signals, and Systems.">3</a></sup>

Each layer in a neural network computes a 2D transformation on its input:

$$\mathbf{h} = W\mathbf{x} + \mathbf{b} = \begin{bmatrix} w_{11} & w_{12} \\ w_{21} & w_{22} \end{bmatrix} \begin{bmatrix} x_1 \\ x_2 \end{bmatrix} + \begin{bmatrix} b_1 \\ b_2 \end{bmatrix}$$

This is a linear transformation: a combination of rotation, scaling, and shearing. When you compose multiple linear layers, the result is always another linear transformation (just multiplying the matrices together). But when you insert ReLU between layers, it clips all negative values to zero:

$$\text{ReLU}(\mathbf{h}) = \begin{bmatrix} \max(0,\, h_1) \\ \max(0,\, h_2) \end{bmatrix}$$

This clipping is nonlinear. It folds parts of the space onto the axes, creating bends that no single matrix can undo. The visualization below shows this in action. A 2D grid of points is passed through neural network layers. On the left, no activation function is applied, so every layer is just a matrix multiply plus bias. On the right, ReLU is applied after each layer. Watch what happens to the grid:

<div class="interactive-demo" id="demo-grid-transform">
  <div class="demo-split">
    <div>
      <div class="grid-label">Without Activation (Linear Only)</div>
      <canvas id="canvas-grid-linear" width="330" height="330"></canvas>
    </div>
    <div>
      <div class="grid-label">With ReLU Activation</div>
      <canvas id="canvas-grid-relu" width="330" height="330"></canvas>
    </div>
  </div>
  <div class="demo-controls">
    <label>Layers <input type="range" id="gt-layers" min="1" max="4" step="1" value="1"><span class="demo-value" id="val-gt-layers">1</span></label>
    <button id="btn-gt-animate">&#9654; Animate</button>
    <button id="btn-gt-reset">Reset</button>
    <button id="btn-gt-newweights">New Weights</button>
  </div>
  <div class="demo-info" id="info-gt">Click "Animate" to watch the transformation unfold layer by layer. Both sides use the same weight matrices.</div>
  <div class="gt-matrix-panel" id="gt-matrices"></div>
</div>
---

## 2. Activation Function Explorer

The choice of activation function has a huge impact on training dynamics and final performance. This explorer lets you visualize the most popular activations and their derivatives. The derivative is crucial because it controls how much the weights update during backpropagation. If the derivative is too small (vanishing gradients) or zero (dead neurons), learning can stall.

$$\text{Sigmoid: } \sigma(x) = \frac{1}{1+e^{-x}} \qquad \sigma'(x) = \sigma(x)(1 - \sigma(x))$$

$$\text{Tanh: } \tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}} \qquad \tanh'(x) = 1 - \tanh^2(x)$$

$$\text{ReLU: } f(x) = \max(0, x) \qquad f'(x) = \begin{cases} 1 & x > 0 \\ 0 & x \leq 0 \end{cases}$$

$$\text{Leaky ReLU: } f(x) = \max(\alpha x, x) \qquad f'(x) = \begin{cases} 1 & x > 0 \\ \alpha & x \leq 0 \end{cases}$$

$$\text{ELU: } f(x) = \begin{cases} x & x > 0 \\ \alpha(e^x - 1) & x \leq 0 \end{cases}$$

$$\text{Swish: } f(x) = x \cdot \sigma(x)$$

$$\text{GELU: } f(x) = x \cdot \Phi(x) \approx 0.5x\left(1 + \tanh\left(\sqrt{\frac{2}{\pi}}(x + 0.044715x^3)\right)\right)$$

<div class="interactive-demo" id="demo-explorer">
  <div class="demo-split">
    <div>
      <canvas id="canvas-act-fn" width="330" height="300"></canvas>
      <div class="demo-caption">Activation Function</div>
    </div>
    <div>
      <canvas id="canvas-act-deriv" width="330" height="300"></canvas>
      <div class="demo-caption">Derivative</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="exp-sigmoid" class="active">Sigmoid</button>
    <button id="exp-tanh">Tanh</button>
    <button id="exp-relu">ReLU</button>
    <button id="exp-leaky">Leaky ReLU</button>
    <button id="exp-elu">ELU</button>
    <button id="exp-swish">Swish</button>
    <button id="exp-gelu">GELU</button>
    <button id="exp-all">Show All</button>
  </div>
  <div class="demo-info" id="info-explorer">Sigmoid: output in (0,1), max derivative = 0.25 at x=0.</div>
</div>
---

## 3. Sigmoid & Tanh Deep Dive

Sigmoid and Tanh were commonly used in early neural networks.<sup class="cite"><a class="cite-ref" href="#ref-1" data-cite-preview="Rumelhart, Hinton &amp; Williams (1986), Learning representations by back-propagating errors. Nature, 323, 533-536.">1</a></sup> They are smooth and differentiable everywhere, but they share a critical flaw: saturation. When the input is very large or very small, the output plateaus and the gradient approaches zero.<sup class="cite"><a class="cite-ref" href="#ref-2" data-cite-preview="Glorot &amp; Bengio (2010), Understanding the difficulty of training deep feedforward neural networks. AISTATS.">2</a></sup>. This is the vanishing gradient problem. During backpropagation, gradients are multiplied through each layer. If every layer has a near-zero gradient, the product vanishes exponentially, and early layers learn almost nothing.

<div class="interactive-demo" id="demo-saturation">
  <canvas id="canvas-saturation" width="680" height="320"></canvas>
  <div class="demo-controls">
    <label>Input x <input type="range" id="sat-x" min="-6" max="6" step="0.1" value="0"><span class="demo-value" id="val-sat-x">0.0</span></label>
    <button id="sat-sigmoid" class="active">Sigmoid</button>
    <button id="sat-tanh">Tanh</button>
  </div>
  <div class="demo-info" id="info-saturation">x = 0.0 | output = 0.500 | gradient = 0.250 | Gradient is HEALTHY</div>
</div>
---

## 4. ReLU Family

ReLU (Rectified Linear Unit) solved the vanishing gradient problem with a very simple idea: output zero for negative inputs, pass positive inputs through unchanged.<sup class="cite"><a class="cite-ref" href="#ref-4" data-cite-preview="Nair &amp; Hinton (2010), Rectified Linear Units Improve Restricted Boltzmann Machines. ICML.">4</a></sup> The gradient is either 0 or 1, no saturation. But ReLU has its own problem: dead neurons. If a neuron's input is always negative (due to improper initialization or a large gradient update), its output is always 0, its gradient is always 0, and it can never recover. The ReLU family offers several fixes:

<div class="interactive-demo" id="demo-relu-family">
  <canvas id="canvas-relu-family" width="680" height="320"></canvas>
  <div class="demo-controls">
    <label>Leak/Alpha <input type="range" id="relu-alpha" min="0.01" max="0.5" step="0.01" value="0.01"><span class="demo-value" id="val-relu-alpha">0.01</span></label>
    <button id="rf-relu" class="active">ReLU</button>
    <button id="rf-leaky">Leaky ReLU</button>
    <button id="rf-elu">ELU</button>
    <button id="rf-all">Show All</button>
  </div>
  <div class="demo-info" id="info-relu-family">ReLU: zero for x &lt; 0. Leaky ReLU allows a small gradient. ELU smoothly approaches -alpha.</div>
</div>
---

## 5. Modern Activations: Swish & GELU

Modern architectures (EfficientNet, BERT, GPT) use smoother activation functions that are not monotonic, they allow small negative values through:

**Swish** $$f(x) = x \cdot \sigma(x)$$ was discovered by neural architecture search at Google.<sup class="cite"><a class="cite-ref" href="#ref-5" data-cite-preview="Ramachandran, Zoph &amp; Le (2017), Searching for Activation Functions. arXiv:1710.05941.">5</a></sup> It is smooth, non-monotonic, and self-gated.

**GELU** $$f(x) = x \cdot \Phi(x)$$ (Gaussian Error Linear Unit) uses the CDF of the standard normal distribution.<sup class="cite"><a class="cite-ref" href="#ref-6" data-cite-preview="Hendrycks &amp; Gimpel (2016), Gaussian Error Linear Units (GELUs). arXiv:1606.08415.">6</a></sup> It is the default activation in Transformers (BERT, GPT).

Both functions look similar to ReLU for large positive inputs but curve smoothly near zero, allowing a small "dip" into negative values. This can help optimization by providing a non-zero gradient for mildly negative inputs, unlike ReLU which is exactly 0.

<div class="interactive-demo" id="demo-modern">
  <canvas id="canvas-modern" width="680" height="320"></canvas>
  <div class="demo-controls">
    <button id="mod-relu">ReLU</button>
    <button id="mod-swish" class="active">Swish</button>
    <button id="mod-gelu">GELU</button>
    <button id="mod-all">Compare All</button>
  </div>
  <div class="demo-info" id="info-modern">Swish and GELU are smooth and non-monotonic near zero, unlike ReLU's hard corner.</div>
</div>
---

## 6. Summary

### Activation Function Cheat Sheet

<table class="summary-table">
<thead>
<tr><th>Function</th><th>Range</th><th>Pros</th><th>Cons</th><th>Use When</th></tr>
</thead>
<tbody>
<tr><td><strong>Sigmoid</strong></td><td>(0, 1)</td><td>Smooth, probabilistic</td><td>Vanishing gradients, not zero-centered</td><td>Output layer for binary classification</td></tr>
<tr><td><strong>Tanh</strong></td><td>(-1, 1)</td><td>Zero-centered, stronger gradients than sigmoid</td><td>Still saturates</td><td>RNNs, hidden layers (legacy)</td></tr>
<tr><td><strong>ReLU</strong></td><td>[0, inf)</td><td>Fast, no saturation for positive</td><td>Dead neurons</td><td>Default for most hidden layers</td></tr>
<tr><td><strong>Leaky ReLU</strong></td><td>(-inf, inf)</td><td>No dead neurons</td><td>Extra hyperparameter</td><td>When dead neurons are a problem</td></tr>
<tr><td><strong>ELU</strong></td><td>(-alpha, inf)</td><td>Smooth, zero-centered outputs</td><td>Exp computation is slower</td><td>When mean activation near zero matters</td></tr>
<tr><td><strong>Swish</strong></td><td>~(-0.28, inf)</td><td>Smooth, self-gated</td><td>Slightly more compute</td><td>EfficientNet, deep CNNs</td></tr>
<tr><td><strong>GELU</strong></td><td>~(-0.17, inf)</td><td>Smooth, stochastic regularization effect</td><td>Slightly more compute</td><td>Transformers (BERT, GPT)</td></tr>
</tbody>
</table>

---

## References

<ol class="references">
  <li id="ref-1">Rumelhart, D. E., Hinton, G. E., &amp; Williams, R. J. (1986). <em>Learning representations by back-propagating errors</em>. Nature, 323, 533-536. <a href="https://doi.org/10.1038/323533a0" target="_blank" rel="noopener">https://doi.org/10.1038/323533a0</a></li>
  <li id="ref-2">Glorot, X., &amp; Bengio, Y. (2010). <em>Understanding the difficulty of training deep feedforward neural networks</em>. AISTATS. <a href="http://proceedings.mlr.press/v9/glorot10a.html" target="_blank" rel="noopener">http://proceedings.mlr.press/v9/glorot10a.html</a></li>
  <li id="ref-3">Cybenko, G. (1989). <em>Approximation by superpositions of a sigmoidal function</em>. Mathematics of Control, Signals, and Systems, 2, 303-314. <a href="https://doi.org/10.1007/BF02551274" target="_blank" rel="noopener">https://doi.org/10.1007/BF02551274</a></li>
  <li id="ref-4">Nair, V., &amp; Hinton, G. E. (2010). <em>Rectified Linear Units Improve Restricted Boltzmann Machines</em>. ICML. <a href="https://www.cs.toronto.edu/~hinton/absps/reluICML.pdf" target="_blank" rel="noopener">https://www.cs.toronto.edu/~hinton/absps/reluICML.pdf</a></li>
  <li id="ref-5">Ramachandran, P., Zoph, B., &amp; Le, Q. V. (2017). <em>Searching for Activation Functions</em>. arXiv:1710.05941. <a href="https://arxiv.org/abs/1710.05941" target="_blank" rel="noopener">https://arxiv.org/abs/1710.05941</a></li>
  <li id="ref-6">Hendrycks, D., &amp; Gimpel, K. (2016). <em>Gaussian Error Linear Units (GELUs)</em>. arXiv:1606.08415. <a href="https://arxiv.org/abs/1606.08415" target="_blank" rel="noopener">https://arxiv.org/abs/1606.08415</a></li>
</ol>


<script>
// ==================== DEMO 1: 2D Grid Transformation (3B1B style) ====================
(function(){
  var canvasL = document.getElementById('canvas-grid-linear');
  var canvasR = document.getElementById('canvas-grid-relu');
  var ctxL = AL.setupCanvas(canvasL, 330, 330);
  var ctxR = AL.setupCanvas(canvasR, 330, 330);
  var layerSlider = document.getElementById('gt-layers');
  var layerVal = document.getElementById('val-gt-layers');
  var btnAnimate = document.getElementById('btn-gt-animate');
  var btnReset = document.getElementById('btn-gt-reset');
  var btnNewWeights = document.getElementById('btn-gt-newweights');
  var info = document.getElementById('info-gt');
  var matrixPanel = document.getElementById('gt-matrices');
  var CW = 330, CH = 330, PAD = 15;
  var GRID_RANGE = 2.0;
  var DISPLAY_RANGE = 2.5;
  var GRID_LINES = 11;
  var GRID_RES = 50;
  var animId = null;
  var animStart = 0;
  var animT = 0; // current T value (0 = identity, nLayers = fully transformed)
  var isAnimating = false;

  // --- Math utilities ---
  function ease(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; }
  function lerp2d(a, b, t) { return [a[0]*(1-t) + b[0]*t, a[1]*(1-t) + b[1]*t]; }
  function matmul2d(M, v) { return [M[0][0]*v[0] + M[0][1]*v[1], M[1][0]*v[0] + M[1][1]*v[1]]; }
  function addVec(a, b) { return [a[0]+b[0], a[1]+b[1]]; }
  function relu2d(v) { return [Math.max(0, v[0]), Math.max(0, v[1])]; }

  // --- Layer generation ---
  function makeLayer(angle, scaleX, scaleY, shear, bx, by) {
    var c = Math.cos(angle), s = Math.sin(angle);
    return {
      W: [[scaleX * (c + shear * s), scaleX * (-s)],
          [scaleY * (s), scaleY * (c + shear * c)]],
      b: [bx, by]
    };
  }

  function generateDefaultLayers() {
    return [
      makeLayer(0.52, 0.9, 0.85, 0.15, 0.0, 0.0),   // ~30deg rotation + slight shear
      makeLayer(-0.35, 0.85, 0.95, -0.2, 0.1, -0.05), // counter-rotate + shear
      makeLayer(0.25, 0.95, 0.8, 0.1, -0.05, 0.1),    // mild rotation + scale
      makeLayer(-0.15, 0.9, 0.9, -0.15, 0.05, -0.05)  // gentle counter
    ];
  }

  function generateRandomLayers() {
    var layers = [];
    for (var i = 0; i < 4; i++) {
      var angle = (Math.random() - 0.5) * Math.PI * 0.5;
      var sx = 0.7 + Math.random() * 0.4;
      var sy = 0.7 + Math.random() * 0.4;
      var sh = (Math.random() - 0.5) * 0.4;
      var bx = (Math.random() - 0.5) * 0.2;
      var by = (Math.random() - 0.5) * 0.2;
      layers.push(makeLayer(angle, sx, sy, sh, bx, by));
    }
    return layers;
  }

  var allLayers = generateDefaultLayers();

  // --- Grid generation ---
  function genGridLines() {
    var hLines = [], vLines = [];
    for (var li = 0; li < GRID_LINES; li++) {
      var coord = -GRID_RANGE + (2 * GRID_RANGE) * li / (GRID_LINES - 1);
      var hLine = [], vLine = [];
      for (var si = 0; si <= GRID_RES; si++) {
        var s = -GRID_RANGE + (2 * GRID_RANGE) * si / GRID_RES;
        hLine.push([s, coord]);
        vLine.push([coord, s]);
      }
      hLines.push(hLine);
      vLines.push(vLine);
    }
    return { h: hLines, v: vLines };
  }

  var grid = genGridLines();

  // --- Core animated transform ---
  function transformPt(p, layers, nLayers, useRelu, T) {
    var cur = [p[0], p[1]];
    for (var i = 0; i < nLayers; i++) {
      var lp = Math.max(0, Math.min(1, T - i)); // layer progress 0..1
      if (lp <= 0) break;
      var target = addVec(matmul2d(layers[i].W, cur), layers[i].b);
      cur = lerp2d(cur, target, ease(lp));
      if (useRelu && lp >= 1) {
        cur = relu2d(cur);
      } else if (useRelu && lp > 0.5) {
        // smoothly blend toward relu in second half of layer
        var reluBlend = (lp - 0.5) * 2; // 0 at lp=0.5, 1 at lp=1
        var reluTarget = relu2d(cur);
        cur = lerp2d(cur, reluTarget, ease(reluBlend));
      }
    }
    return cur;
  }

  // --- Coordinate transform ---
  function toScreen(p) {
    var sx = PAD + (p[0] + DISPLAY_RANGE) / (2 * DISPLAY_RANGE) * (CW - 2 * PAD);
    var sy = PAD + (DISPLAY_RANGE - p[1]) / (2 * DISPLAY_RANGE) * (CH - 2 * PAD);
    return [sx, sy];
  }

  // --- Drawing ---
  function drawArrow(ctx, from, to, color, lw, headSize) {
    var dx = to[0] - from[0], dy = to[1] - from[1];
    var len = Math.sqrt(dx*dx + dy*dy);
    if (len < 1) return;
    var angle = Math.atan2(dy, dx);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(to[0], to[1]);
    ctx.lineTo(to[0] - headSize * Math.cos(angle - 0.4), to[1] - headSize * Math.sin(angle - 0.4));
    ctx.lineTo(to[0] - headSize * Math.cos(angle + 0.4), to[1] - headSize * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  function drawScene(ctx, useRelu, T, colors) {
    var nLayers = parseInt(layerSlider.value);
    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, CW, CH);

    // Ghost grid (original, faint dashed)
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = colors.grid;
    var i, j, sp;
    for (i = 0; i < grid.h.length; i++) {
      ctx.beginPath();
      for (j = 0; j <= GRID_RES; j++) {
        sp = toScreen(grid.h[i][j]);
        if (j === 0) ctx.moveTo(sp[0], sp[1]); else ctx.lineTo(sp[0], sp[1]);
      }
      ctx.stroke();
    }
    for (i = 0; i < grid.v.length; i++) {
      ctx.beginPath();
      for (j = 0; j <= GRID_RES; j++) {
        sp = toScreen(grid.v[i][j]);
        if (j === 0) ctx.moveTo(sp[0], sp[1]); else ctx.lineTo(sp[0], sp[1]);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Transformed grid
    var midIdx = Math.floor(GRID_LINES / 2);
    // Horizontal lines
    for (i = 0; i < grid.h.length; i++) {
      var isAxis = (i === midIdx);
      ctx.strokeStyle = isAxis ? colors.sigmoid : (useRelu ? 'rgba(122,162,247,0.35)' : 'rgba(122,162,247,0.35)');
      ctx.lineWidth = isAxis ? 2 : 1;
      ctx.beginPath();
      for (j = 0; j <= GRID_RES; j++) {
        var tp = transformPt(grid.h[i][j], allLayers, nLayers, useRelu, T);
        sp = toScreen(tp);
        if (j === 0) ctx.moveTo(sp[0], sp[1]); else ctx.lineTo(sp[0], sp[1]);
      }
      ctx.stroke();
    }
    // Vertical lines
    for (i = 0; i < grid.v.length; i++) {
      var isAxis = (i === midIdx);
      ctx.strokeStyle = isAxis ? colors.relu : (useRelu ? 'rgba(158,206,106,0.35)' : 'rgba(158,206,106,0.35)');
      ctx.lineWidth = isAxis ? 2 : 1;
      ctx.beginPath();
      for (j = 0; j <= GRID_RES; j++) {
        var tp = transformPt(grid.v[i][j], allLayers, nLayers, useRelu, T);
        sp = toScreen(tp);
        if (j === 0) ctx.moveTo(sp[0], sp[1]); else ctx.lineTo(sp[0], sp[1]);
      }
      ctx.stroke();
    }

    // Basis vectors
    var origin = transformPt([0, 0], allLayers, nLayers, useRelu, T);
    var iHat = transformPt([1, 0], allLayers, nLayers, useRelu, T);
    var jHat = transformPt([0, 1], allLayers, nLayers, useRelu, T);
    var oScr = toScreen(origin);
    var iScr = toScreen(iHat);
    var jScr = toScreen(jHat);
    drawArrow(ctx, oScr, iScr, colors.relu, 2.5, 8);   // i-hat green
    drawArrow(ctx, oScr, jScr, colors.sigmoid, 2.5, 8); // j-hat pink/red

    // Origin dot
    ctx.fillStyle = colors.text;
    ctx.beginPath();
    ctx.arc(oScr[0], oScr[1], 3, 0, 2 * Math.PI);
    ctx.fill();

    // Basis labels
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = colors.relu;
    ctx.textAlign = 'left';
    ctx.fillText('î', iScr[0] + 5, iScr[1] - 5);
    ctx.fillStyle = colors.sigmoid;
    ctx.fillText('ĵ', jScr[0] + 5, jScr[1] - 5);

    // Title overlay
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillStyle = colors.textMuted;
    ctx.textAlign = 'left';
    if (useRelu) {
      ctx.fillText('With ReLU', PAD, PAD - 8);
    } else {
      ctx.fillText('Linear only', PAD, PAD - 8);
    }

    // Layer indicator during animation
    if (T > 0 && T < nLayers) {
      var currentLayer = Math.floor(T) + 1;
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'right';
      ctx.fillText('Layer ' + currentLayer + '/' + nLayers, CW - PAD, PAD - 8);
    } else if (T >= nLayers && nLayers > 0) {
      ctx.fillStyle = colors.positive;
      ctx.textAlign = 'right';
      ctx.fillText(nLayers + ' layer' + (nLayers > 1 ? 's' : '') + ' applied', CW - PAD, PAD - 8);
    }
  }

  // --- Animation loop ---
  function drawBoth(T) {
    var colors = AL.getColors();
    var nLayers = parseInt(layerSlider.value);
    layerVal.textContent = nLayers;
    drawScene(ctxL, false, T, colors);
    drawScene(ctxR, true, T, colors);
    updateMatrixDisplay(T, nLayers);
    updateInfo(T, nLayers);
  }

  function animate(timestamp) {
    if (!isAnimating) return;
    if (!animStart) animStart = timestamp;
    var nLayers = parseInt(layerSlider.value);
    var totalDuration = nLayers * 1200; // 1.2s per layer
    var elapsed = timestamp - animStart;
    var progress = Math.min(elapsed / totalDuration, 1);

    // Map progress to T with pauses between layers
    var T;
    if (nLayers === 0) {
      T = 0;
    } else {
      // Each layer gets 1 unit of T, with slight easing overlap
      T = progress * nLayers;
    }

    animT = T;
    drawBoth(T);

    if (progress < 1) {
      animId = requestAnimationFrame(animate);
    } else {
      isAnimating = false;
      animT = nLayers;
      btnAnimate.textContent = '\u25B6 Animate';
    }
  }

  function fmt(v) { return (v < 0 ? '' : '\u2007') + v.toFixed(2); }

  function updateMatrixDisplay(T, nLayers) {
    var html = '';
    for (var i = 0; i < nLayers; i++) {
      var L = allLayers[i];
      var lp = Math.max(0, Math.min(1, T - i));
      var cls = '';
      if (lp > 0 && lp < 1) cls = ' active';
      else if (lp >= 1) cls = ' done';
      var tag = '';
      if (lp > 0 && lp < 1) tag = ' <span style="color:var(--accent,#2563eb);font-weight:600;">\u25C0 applying</span>';
      else if (lp >= 1) tag = ' <span class="gt-relu-tag">+ ReLU on right</span>';

      html += '<div class="gt-layer-row' + cls + '">'
        + '<span class="gt-layer-label">Layer ' + (i + 1) + ':</span>'
        + '<span class="gt-layer-vals">'
        + 'W = [' + fmt(L.W[0][0]) + ', ' + fmt(L.W[0][1]) + '; '
        + fmt(L.W[1][0]) + ', ' + fmt(L.W[1][1]) + ']'
        + '&ensp;b = [' + fmt(L.b[0]) + ', ' + fmt(L.b[1]) + ']'
        + tag
        + '</span></div>';
    }
    if (nLayers === 0) html = '<span class="gt-layer-vals">No layers selected.</span>';
    matrixPanel.innerHTML = html;
  }

  function updateInfo(T, nLayers) {
    if (T <= 0) {
      info.textContent = 'Click "Animate" to watch the transformation unfold layer by layer. Both sides use the same weight matrices.';
    } else if (T < nLayers) {
      var cl = Math.floor(T) + 1;
      info.textContent = 'Applying layer ' + cl + ' of ' + nLayers + '... Left: grid deforms but stays rectilinear. Right: ReLU bends it at the zero-boundaries.';
    } else {
      info.textContent = nLayers + ' layer' + (nLayers > 1 ? 's' : '') + ' applied. Left: still a perfect grid (linear = rotate, scale, shear). Right: nonlinear warping from ReLU, this is expressive power.';
    }
  }

  function drawStatic() {
    var nLayers = parseInt(layerSlider.value);
    animT = nLayers;
    drawBoth(nLayers);
  }

  // --- Event handlers ---
  btnAnimate.addEventListener('click', function() {
    if (isAnimating) {
      isAnimating = false;
      if (animId) cancelAnimationFrame(animId);
      btnAnimate.textContent = '\u25B6 Animate';
      return;
    }
    isAnimating = true;
    animStart = 0;
    btnAnimate.textContent = '\u23F8 Pause';
    animId = requestAnimationFrame(animate);
  });

  btnReset.addEventListener('click', function() {
    isAnimating = false;
    if (animId) cancelAnimationFrame(animId);
    animT = 0;
    btnAnimate.textContent = '\u25B6 Animate';
    drawBoth(0);
  });

  btnNewWeights.addEventListener('click', function() {
    isAnimating = false;
    if (animId) cancelAnimationFrame(animId);
    allLayers = generateRandomLayers();
    animT = 0;
    btnAnimate.textContent = '\u25B6 Animate';
    drawBoth(0);
  });

  layerSlider.addEventListener('input', function() {
    isAnimating = false;
    if (animId) cancelAnimationFrame(animId);
    animT = 0;
    btnAnimate.textContent = '\u25B6 Animate';
    drawBoth(0);
  });

  AL.onThemeChange(function() {
    drawBoth(animT);
  });

  // Initial draw
  drawBoth(0);
})();

// ==================== DEMO 2: Activation Function Explorer ====================
(function(){
  var canvasFn = document.getElementById('canvas-act-fn');
  var canvasDeriv = document.getElementById('canvas-act-deriv');
  var ctxFn = AL.setupCanvas(canvasFn, 330, 300);
  var ctxD = AL.setupCanvas(canvasDeriv, 330, 300);
  var info = document.getElementById('info-explorer');
  var W = 330, H = 300, pad = 45;
  var current = 'sigmoid';
  var showAll = false;
  var hoverX = null;

  var btnMap = {
    'exp-sigmoid': 'sigmoid', 'exp-tanh': 'tanh', 'exp-relu': 'relu',
    'exp-leaky': 'leaky', 'exp-elu': 'elu', 'exp-swish': 'swish', 'exp-gelu': 'gelu'
  };
  var colorMap = {
    sigmoid: 'sigmoid', tanh: 'tanh', relu: 'relu', leaky: 'leaky',
    elu: 'elu', swish: 'swish', gelu: 'gelu'
  };
  var allKeys = ['sigmoid', 'tanh', 'relu', 'leaky', 'elu', 'swish', 'gelu'];

  function draw() {
    var colors = AL.getColors();
    var xMin = -6, xMax = 6;
    var yMinFn = -2, yMaxFn = 4;
    var yMinD = -0.5, yMaxD = 1.5;

    // Clear
    ctxFn.clearRect(0, 0, W, H);
    ctxFn.fillStyle = colors.bg;
    ctxFn.fillRect(0, 0, W, H);
    ctxD.clearRect(0, 0, W, H);
    ctxD.fillStyle = colors.bg;
    ctxD.fillRect(0, 0, W, H);

    var dimsFn = AL.drawAxes(ctxFn, W, H, pad, xMin, xMax, yMinFn, yMaxFn, colors, 'x', 'f(x)');
    var dimsD = AL.drawAxes(ctxD, W, H, pad, xMin, xMax, yMinD, yMaxD, colors, 'x', "f'(x)");

    var toDraw = showAll ? allKeys : [current];

    for (var k = 0; k < toDraw.length; k++) {
      var key = toDraw[k];
      var act = AL.activations[key];
      var col = colors[colorMap[key]];
      AL.plotLine(ctxFn, act.fn, xMin, xMax, yMinFn, yMaxFn, dimsFn.pad, dimsFn.pw, dimsFn.ph, col, 2);
      AL.plotLine(ctxD, act.deriv, xMin, xMax, yMinD, yMaxD, dimsD.pad, dimsD.pw, dimsD.ph, col, 2);
    }

    // Hover crosshair
    if (hoverX !== null) {
      var px = dimsFn.pad + (hoverX - xMin) / (xMax - xMin) * dimsFn.pw;
      ctxFn.strokeStyle = colors.crosshair;
      ctxFn.lineWidth = 1;
      ctxFn.setLineDash([3, 3]);
      ctxFn.beginPath(); ctxFn.moveTo(px, pad); ctxFn.lineTo(px, pad + dimsFn.ph); ctxFn.stroke();
      ctxFn.setLineDash([]);
      ctxD.strokeStyle = colors.crosshair;
      ctxD.lineWidth = 1;
      ctxD.setLineDash([3, 3]);
      ctxD.beginPath(); ctxD.moveTo(px, pad); ctxD.lineTo(px, pad + dimsD.ph); ctxD.stroke();
      ctxD.setLineDash([]);

      // Dots on curves
      for (var k = 0; k < toDraw.length; k++) {
        var key = toDraw[k];
        var act = AL.activations[key];
        var col = colors[colorMap[key]];
        var yf = act.fn(hoverX);
        var yd = act.deriv(hoverX);
        var pyf = dimsFn.pad + dimsFn.ph - (yf - yMinFn) / (yMaxFn - yMinFn) * dimsFn.ph;
        var pyd = dimsD.pad + dimsD.ph - (yd - yMinD) / (yMaxD - yMinD) * dimsD.ph;
        ctxFn.beginPath(); ctxFn.arc(px, pyf, 4, 0, Math.PI * 2); ctxFn.fillStyle = col; ctxFn.fill();
        ctxD.beginPath(); ctxD.arc(px, pyd, 4, 0, Math.PI * 2); ctxD.fillStyle = col; ctxD.fill();
      }

      // Update info
      var parts = [];
      for (var k = 0; k < toDraw.length; k++) {
        var key = toDraw[k];
        var act = AL.activations[key];
        parts.push(act.label + ': f(' + hoverX.toFixed(1) + ')=' + act.fn(hoverX).toFixed(4) + " f'=" + act.deriv(hoverX).toFixed(4));
      }
      info.textContent = 'x=' + hoverX.toFixed(2) + ' | ' + parts.join(' | ');
    }

    // Legend if showAll
    if (showAll) {
      ctxFn.font = '10px sans-serif';
      ctxFn.textAlign = 'left';
      for (var k = 0; k < allKeys.length; k++) {
        var col = colors[colorMap[allKeys[k]]];
        ctxFn.fillStyle = col;
        ctxFn.fillRect(dimsFn.pad + 5, dimsFn.pad + 5 + k * 15, 10, 10);
        ctxFn.fillText(AL.activations[allKeys[k]].label, dimsFn.pad + 18, dimsFn.pad + 14 + k * 15);
      }
    }
  }

  // Hover handling
  function handleHover(e) {
    var rect = canvasFn.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    if (mx >= pad && mx <= W - pad) {
      hoverX = -6 + (mx - pad) / (W - 2 * pad) * 12;
      draw();
    }
  }
  canvasFn.addEventListener('mousemove', handleHover);
  canvasFn.addEventListener('touchmove', function(e) {
    e.preventDefault();
    handleHover(e.touches[0]);
  }, { passive: false });
  canvasFn.addEventListener('mouseleave', function() { hoverX = null; draw(); });
  canvasDeriv.addEventListener('mousemove', function(e) {
    var rect = canvasDeriv.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    if (mx >= pad && mx <= W - pad) {
      hoverX = -6 + (mx - pad) / (W - 2 * pad) * 12;
      draw();
    }
  });
  canvasDeriv.addEventListener('mouseleave', function() { hoverX = null; draw(); });

  // Buttons
  Object.keys(btnMap).forEach(function(id) {
    document.getElementById(id).addEventListener('click', function() {
      showAll = false;
      current = btnMap[id];
      Object.keys(btnMap).forEach(function(bid) { document.getElementById(bid).classList.remove('active'); });
      document.getElementById('exp-all').classList.remove('active');
      this.classList.add('active');
      hoverX = null;
      info.textContent = AL.activations[current].label + ': ' + AL.activations[current].formula;
      draw();
    });
  });
  document.getElementById('exp-all').addEventListener('click', function() {
    showAll = true;
    Object.keys(btnMap).forEach(function(bid) { document.getElementById(bid).classList.remove('active'); });
    this.classList.add('active');
    info.textContent = 'All activation functions overlaid. Hover to compare values.';
    draw();
  });

  AL.onThemeChange(draw);
  draw();
})();

// ==================== DEMO 3: Sigmoid & Tanh Saturation ====================
(function(){
  var canvas = document.getElementById('canvas-saturation');
  var ctx = AL.setupCanvas(canvas, 680, 320);
  var slider = document.getElementById('sat-x');
  var valSpan = document.getElementById('val-sat-x');
  var btnSig = document.getElementById('sat-sigmoid');
  var btnTanh = document.getElementById('sat-tanh');
  var info = document.getElementById('info-saturation');
  var W = 680, H = 320, pad = 50;
  var useTanh = false;

  function draw() {
    var colors = AL.getColors();
    var x = parseFloat(slider.value);
    valSpan.textContent = x.toFixed(1);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    var fn = useTanh ? AL.tanhFn : AL.sigmoid;
    var deriv = useTanh ? AL.tanhDeriv : AL.sigmoidDeriv;
    var xMin = -6, xMax = 6;
    var yMin = useTanh ? -1.5 : -0.5;
    var yMax = useTanh ? 1.5 : 1.5;
    var dims = AL.drawAxes(ctx, W, H, pad, xMin, xMax, yMin, yMax, colors, 'x', 'value');

    // Saturation regions (gradient < 0.01)
    var threshold = 0.01;
    ctx.fillStyle = 'rgba(247,118,142,0.12)';
    var steps = dims.pw * 2;
    for (var i = 0; i <= steps; i++) {
      var xv = xMin + (xMax - xMin) * i / steps;
      var g = deriv(xv);
      if (g < threshold) {
        var px = dims.pad + (xv - xMin) / (xMax - xMin) * dims.pw;
        ctx.fillRect(px, dims.pad, 1, dims.ph);
      }
    }

    // Plot function
    var col = useTanh ? colors.tanh : colors.sigmoid;
    AL.plotLine(ctx, fn, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, col, 2.5);

    // Plot derivative
    AL.plotLine(ctx, deriv, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.warn, 2, undefined);

    // Current point marker
    var yVal = fn(x);
    var gVal = deriv(x);
    var px = dims.pad + (x - xMin) / (xMax - xMin) * dims.pw;
    var pyVal = dims.pad + dims.ph - (yVal - yMin) / (yMax - yMin) * dims.ph;
    var pyGrad = dims.pad + dims.ph - (gVal - yMin) / (yMax - yMin) * dims.ph;

    // Vertical line at x
    ctx.strokeStyle = colors.crosshair;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(px, dims.pad); ctx.lineTo(px, dims.pad + dims.ph); ctx.stroke();
    ctx.setLineDash([]);

    // Dots
    ctx.beginPath(); ctx.arc(px, pyVal, 6, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

    ctx.beginPath(); ctx.arc(px, pyGrad, 6, 0, Math.PI * 2);
    ctx.fillStyle = colors.warn; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

    // Legend
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = col;
    ctx.fillText((useTanh ? 'tanh' : 'sigmoid') + '(x)', dims.pad + 10, dims.pad + 15);
    ctx.fillStyle = colors.warn;
    ctx.fillText('derivative', dims.pad + 10, dims.pad + 30);
    ctx.fillStyle = 'rgba(247,118,142,0.5)';
    ctx.fillText('saturation zone (gradient < 0.01)', dims.pad + 10, dims.pad + 45);

    var status = gVal < 0.01 ? 'SATURATED - gradient vanishing!' : gVal < 0.1 ? 'WEAK gradient' : 'HEALTHY';
    info.textContent = 'x = ' + x.toFixed(1) + ' | output = ' + yVal.toFixed(4) + ' | gradient = ' + gVal.toFixed(4) + ' | Gradient is ' + status;
  }

  slider.addEventListener('input', draw);
  btnSig.addEventListener('click', function() { useTanh = false; btnSig.classList.add('active'); btnTanh.classList.remove('active'); draw(); });
  btnTanh.addEventListener('click', function() { useTanh = true; btnTanh.classList.add('active'); btnSig.classList.remove('active'); draw(); });
  AL.onThemeChange(draw);
  draw();
})();

// ==================== DEMO 4: ReLU Family ====================
(function(){
  var canvas = document.getElementById('canvas-relu-family');
  var ctx = AL.setupCanvas(canvas, 680, 320);
  var alphaSlider = document.getElementById('relu-alpha');
  var alphaVal = document.getElementById('val-relu-alpha');
  var info = document.getElementById('info-relu-family');
  var W = 680, H = 320, pad = 50;
  var current = 'relu';
  var showAll = false;

  var btns = { 'rf-relu': 'relu', 'rf-leaky': 'leaky', 'rf-elu': 'elu' };

  function draw() {
    var colors = AL.getColors();
    var alpha = parseFloat(alphaSlider.value);
    alphaVal.textContent = alpha.toFixed(2);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    var xMin = -4, xMax = 4, yMin = -2, yMax = 4;
    var dims = AL.drawAxes(ctx, W, H, pad, xMin, xMax, yMin, yMax, colors, 'x', 'f(x)');

    if (showAll || current === 'relu') {
      AL.plotLine(ctx, AL.relu, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.relu, 2.5);
    }
    if (showAll || current === 'leaky') {
      AL.plotLine(ctx, function(x) { return AL.leakyRelu(x, alpha); }, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.leaky, 2.5);
    }
    if (showAll || current === 'elu') {
      AL.plotLine(ctx, function(x) { return AL.elu(x, alpha); }, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.elu, 2.5);
    }

    // Legend
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    var y0 = dims.pad + 15;
    if (showAll || current === 'relu') { ctx.fillStyle = colors.relu; ctx.fillText('ReLU', dims.pad + 10, y0); y0 += 16; }
    if (showAll || current === 'leaky') { ctx.fillStyle = colors.leaky; ctx.fillText('Leaky ReLU (a=' + alpha.toFixed(2) + ')', dims.pad + 10, y0); y0 += 16; }
    if (showAll || current === 'elu') { ctx.fillStyle = colors.elu; ctx.fillText('ELU (a=' + alpha.toFixed(2) + ')', dims.pad + 10, y0); }
  }

  Object.keys(btns).forEach(function(id) {
    document.getElementById(id).addEventListener('click', function() {
      showAll = false;
      current = btns[id];
      Object.keys(btns).forEach(function(bid) { document.getElementById(bid).classList.remove('active'); });
      document.getElementById('rf-all').classList.remove('active');
      this.classList.add('active');
      draw();
    });
  });
  document.getElementById('rf-all').addEventListener('click', function() {
    showAll = true;
    Object.keys(btns).forEach(function(bid) { document.getElementById(bid).classList.remove('active'); });
    this.classList.add('active');
    draw();
  });
  alphaSlider.addEventListener('input', draw);
  AL.onThemeChange(draw);
  draw();
})();

// ==================== DEMO 5: Modern Activations ====================
(function(){
  var canvas = document.getElementById('canvas-modern');
  var ctx = AL.setupCanvas(canvas, 680, 320);
  var info = document.getElementById('info-modern');
  var W = 680, H = 320, pad = 50;
  var current = 'swish';
  var showAll = false;

  var btns = { 'mod-relu': 'relu', 'mod-swish': 'swish', 'mod-gelu': 'gelu' };
  var hoverX = null;
  var fnMap = { relu: AL.relu, swish: AL.swish, gelu: AL.gelu };
  var labelMap = { relu: 'ReLU', swish: 'Swish', gelu: 'GELU' };

  function draw() {
    var colors = AL.getColors();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    var xMin = -5, xMax = 5, yMin = -1.5, yMax = 4;
    var dims = AL.drawAxes(ctx, W, H, pad, xMin, xMax, yMin, yMax, colors, 'x', 'f(x)');

    var toDraw = showAll ? ['relu', 'swish', 'gelu'] : [current];

    if (showAll || current === 'relu') {
      AL.plotLine(ctx, AL.relu, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.relu, 2.5);
    }
    if (showAll || current === 'swish') {
      AL.plotLine(ctx, AL.swish, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.swish, 2.5);
    }
    if (showAll || current === 'gelu') {
      AL.plotLine(ctx, AL.gelu, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.gelu, 2.5);
    }

    // Hover crosshair and dots
    if (hoverX !== null) {
      var px = dims.pad + (hoverX - xMin) / (xMax - xMin) * dims.pw;
      ctx.strokeStyle = colors.crosshair;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(px, pad); ctx.lineTo(px, pad + dims.ph); ctx.stroke();
      ctx.setLineDash([]);
      var parts = [];
      for (var k = 0; k < toDraw.length; k++) {
        var key = toDraw[k];
        var yVal = fnMap[key](hoverX);
        var pyVal = dims.pad + dims.ph - (yVal - yMin) / (yMax - yMin) * dims.ph;
        var col = colors[key === 'relu' ? 'relu' : key === 'swish' ? 'swish' : 'gelu'];
        ctx.beginPath(); ctx.arc(px, pyVal, 4, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
        parts.push(labelMap[key] + '(' + hoverX.toFixed(1) + ')=' + yVal.toFixed(4));
      }
      info.textContent = 'x=' + hoverX.toFixed(2) + ' | ' + parts.join(' | ');
    }

    // Legend
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    var y0 = dims.pad + 15;
    if (showAll || current === 'relu') { ctx.fillStyle = colors.relu; ctx.fillText('ReLU', dims.pad + 10, y0); y0 += 16; }
    if (showAll || current === 'swish') { ctx.fillStyle = colors.swish; ctx.fillText('Swish (x * sigmoid(x))', dims.pad + 10, y0); y0 += 16; }
    if (showAll || current === 'gelu') { ctx.fillStyle = colors.gelu; ctx.fillText('GELU (x * Phi(x))', dims.pad + 10, y0); }

    // Highlight the negative dip
    if ((showAll || current === 'swish' || current === 'gelu') && !showAll && hoverX === null) {
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      var dipX = current === 'swish' ? -1.28 : -1.0;
      var dipY = current === 'swish' ? AL.swish(dipX) : AL.gelu(dipX);
      var dpx = dims.pad + (dipX - xMin) / (xMax - xMin) * dims.pw;
      var dpy = dims.pad + dims.ph - (dipY - yMin) / (yMax - yMin) * dims.ph;
      ctx.fillText('small negative dip', dpx, dpy + 18);
    }
  }

  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (W / rect.width);
    if (mx >= pad && mx <= W - pad) {
      hoverX = -5 + (mx - pad) / (W - 2 * pad) * 10;
      draw();
    }
  });
  canvas.addEventListener('mouseleave', function() { hoverX = null; draw(); });

  Object.keys(btns).forEach(function(id) {
    document.getElementById(id).addEventListener('click', function() {
      showAll = false;
      current = btns[id];
      Object.keys(btns).forEach(function(bid) { document.getElementById(bid).classList.remove('active'); });
      document.getElementById('mod-all').classList.remove('active');
      this.classList.add('active');
      draw();
    });
  });
  document.getElementById('mod-all').addEventListener('click', function() {
    showAll = true;
    Object.keys(btns).forEach(function(bid) { document.getElementById(bid).classList.remove('active'); });
    this.classList.add('active');
    info.textContent = 'All three overlaid. Swish and GELU are nearly identical and both smoother than ReLU.';
    draw();
  });

  AL.onThemeChange(draw);
  draw();
})();

</script>
