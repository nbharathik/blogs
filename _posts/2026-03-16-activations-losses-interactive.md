---
layout: post
title: "Activation Functions & Loss Functions - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Explore every major activation function and loss function interactively - see derivatives, dead neurons, loss landscapes, softmax probabilities, and MSE vs cross-entropy compared."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /activations-losses/
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
.neuron-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(28px, 1fr));
  gap: 4px;
  margin: 0.5rem 0;
}
.neuron-cell {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--border);
}
.bar-chart-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem 0;
  font-size: 0.82rem;
  font-family: 'JetBrains Mono', monospace;
}
.bar-chart-label { min-width: 60px; text-align: right; }
.bar-chart-track { flex: 1; height: 22px; background: var(--bg-primary); border-radius: 4px; overflow: hidden; position: relative; }
.bar-chart-fill { height: 100%; border-radius: 4px; transition: width 0.15s; }
.bar-chart-val { min-width: 50px; }
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
      mse: '#7aa2f7',
      mae: '#f7768e',
      huber: '#9ece6a',
      bce: '#f7768e',
      hinge: '#7aa2f7',
      focal: '#bb9af7',
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

  // ---- Loss functions ----
  function mseLoss(y, yhat) { return (y - yhat) * (y - yhat); }
  function maeLoss(y, yhat) { return Math.abs(y - yhat); }
  function huberLoss(y, yhat, delta) {
    delta = delta || 1.0;
    var a = Math.abs(y - yhat);
    return a <= delta ? 0.5 * a * a : delta * (a - 0.5 * delta);
  }
  function bceLoss(y, p) {
    p = Math.max(1e-7, Math.min(1 - 1e-7, p));
    return -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
  }
  function hingeLoss(y, f) {
    // y in {-1, 1}, f is raw score
    return Math.max(0, 1 - y * f);
  }
  function focalLoss(y, p, gamma) {
    gamma = gamma || 2;
    p = Math.max(1e-7, Math.min(1 - 1e-7, p));
    var pt = y === 1 ? p : 1 - p;
    return -Math.pow(1 - pt, gamma) * Math.log(pt);
  }

  // Softmax
  function softmax(logits, temp) {
    temp = temp || 1;
    var scaled = logits.map(function(v) { return v / temp; });
    var maxV = Math.max.apply(null, scaled);
    var exps = scaled.map(function(v) { return Math.exp(v - maxV); });
    var sum = exps.reduce(function(a, b) { return a + b; }, 0);
    return exps.map(function(v) { return v / sum; });
  }

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
    mseLoss: mseLoss,
    maeLoss: maeLoss,
    huberLoss: huberLoss,
    bceLoss: bceLoss,
    hingeLoss: hingeLoss,
    focalLoss: focalLoss,
    softmax: softmax,
    drawAxes: drawAxes,
    plotLine: plotLine,
    onThemeChange: onThemeChange
  };
})();
</script>

In the [previous chapter on the perceptron and MLP]({% post_url 2026-03-16-perceptron-mlp-interactive %}), we saw that activation functions are what give neural networks their power, without them, stacking layers would be pointless. And we trained networks using loss functions without examining what makes one loss better than another.

This chapter is dedicated entirely to these two critical ingredients. We will explore every major activation function, understand why some cause vanishing gradients, see dead neurons in action, and then turn to loss functions, understanding why cross-entropy dominates classification and when to use alternatives. Every concept comes with an interactive visualization.

---

## 1. Why Activation Functions?

Without activation functions, every layer in a neural network performs a linear transformation: multiply by weights, add bias. The composition of linear functions is still linear:

$$f(\mathbf{x}) = W_2(W_1 \mathbf{x} + b_1) + b_2 = (W_2 W_1)\mathbf{x} + (W_2 b_1 + b_2) = W'\mathbf{x} + b'$$

No matter how many layers you stack, the entire network collapses to a single linear transformation. Adding a nonlinear activation function between layers is what breaks this collapse and gives depth its power.

<div class="interactive-demo" id="demo-linear-collapse">
  <canvas id="canvas-linear-collapse" width="680" height="320"></canvas>
  <div class="demo-controls">
    <label>Layers <input type="range" id="lc-layers" min="1" max="6" step="1" value="1"><span class="demo-value" id="val-lc-layers">1</span></label>
    <button id="btn-lc-linear" class="active">No Activation (Linear)</button>
    <button id="btn-lc-relu">With ReLU</button>
  </div>
  <div class="demo-info" id="info-lc">With no activation, stacking layers produces the same linear function (orange). With ReLU, the network can learn complex shapes (green).</div>
</div>
<div class="demo-caption">Stack up to 6 layers. Without activation, the result is always a straight line. With ReLU, each layer adds a "bend."</div>

<div class="demo-hint">Try increasing the layers from 1 to 6 in linear mode, the line changes slope but stays straight. Then switch to ReLU and watch each layer add a new hinge point.</div>

---

## 2. Activation Function Explorer

This is the flagship demo. Every major activation function, plotted side-by-side with its derivative. Hover over the plot to see exact values at any input.

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
<div class="demo-caption">Switch between activation functions or overlay them all. Hover over the canvas to see exact values.</div>

---

## 3. Sigmoid & Tanh Deep Dive

Sigmoid and Tanh were the workhorses of early neural networks. They are smooth and differentiable everywhere, but they share a critical flaw: **saturation**. When the input is very large or very small, the output plateaus and the gradient approaches zero.

This is the **vanishing gradient problem**. During backpropagation, gradients are multiplied through each layer. If every layer has a near-zero gradient, the product vanishes exponentially, and early layers learn almost nothing.

<div class="interactive-demo" id="demo-saturation">
  <canvas id="canvas-saturation" width="680" height="320"></canvas>
  <div class="demo-controls">
    <label>Input x <input type="range" id="sat-x" min="-6" max="6" step="0.1" value="0"><span class="demo-value" id="val-sat-x">0.0</span></label>
    <button id="sat-sigmoid" class="active">Sigmoid</button>
    <button id="sat-tanh">Tanh</button>
  </div>
  <div class="demo-info" id="info-saturation">x = 0.0 | output = 0.500 | gradient = 0.250 | Gradient is HEALTHY</div>
</div>
<div class="demo-caption">Slide the input value and watch the gradient shrink as you move away from zero. The red zones mark saturation regions where the gradient is below 0.01.</div>

<div class="demo-hint">Slide x beyond +/-4 for Sigmoid or +/-2 for Tanh. The gradient drops to nearly zero, this is why deep networks with these activations are hard to train.</div>

---

## 4. ReLU Family

ReLU (Rectified Linear Unit) solved the vanishing gradient problem with a brutally simple idea: output zero for negative inputs, pass positive inputs through unchanged. The gradient is either 0 or 1, no saturation.

But ReLU has its own problem: **dead neurons**. If a neuron's input is always negative (due to unlucky initialization or a large gradient update), its output is always 0, its gradient is always 0, and it can never recover. It is permanently "dead."

The ReLU family offers several fixes:

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
<div class="demo-caption">Adjust the leak parameter to see how Leaky ReLU and ELU allow gradient flow for negative inputs.</div>

<div class="demo-hint">Increase the alpha slider to 0.3 and compare. A larger leak means more gradient flow for negative inputs, but the function becomes less "rectified." ELU provides smooth saturation to -alpha.</div>

---

## 5. Dead Neuron Demo

Let us see the dead neuron problem in action. We simulate a hidden layer of 64 ReLU neurons receiving random inputs during training. When weights push a neuron's pre-activation permanently negative, it dies. Compare with Leaky ReLU where neurons survive.

<div class="interactive-demo" id="demo-dead-neurons">
  <div class="demo-split">
    <div>
      <canvas id="canvas-dead-relu" width="330" height="280"></canvas>
      <div class="demo-caption" id="dead-relu-caption">ReLU: 0% dead</div>
    </div>
    <div>
      <canvas id="canvas-dead-leaky" width="330" height="280"></canvas>
      <div class="demo-caption" id="dead-leaky-caption">Leaky ReLU: 0% dead</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btn-dead-run">Run Training Simulation</button>
    <button id="btn-dead-reset">Reset</button>
    <label>Learning Rate <input type="range" id="dead-lr" min="0.01" max="0.5" step="0.01" value="0.1"><span class="demo-value" id="val-dead-lr">0.10</span></label>
    <span class="demo-value" id="dead-step">Step: 0</span>
  </div>
  <div class="demo-info" id="info-dead">Green = active neuron, Red = dead (always 0). Higher learning rates kill more neurons.</div>
</div>
<div class="demo-caption">Each circle is a neuron. Watch ReLU neurons die off (turn red) while Leaky ReLU neurons stay alive.</div>

---

## 6. Modern Activations: Swish & GELU

Modern architectures (EfficientNet, BERT, GPT) use smoother activation functions that are not monotonic, they allow small negative values through:

**Swish** $$f(x) = x \cdot \sigma(x)$$ was discovered by neural architecture search at Google. It is smooth, non-monotonic, and self-gated.

**GELU** $$f(x) = x \cdot \Phi(x)$$ (Gaussian Error Linear Unit) uses the CDF of the standard normal distribution. It is the default in Transformers.

Both functions look similar to ReLU for large positive inputs but curve smoothly near zero, allowing a small "dip" into negative territory.

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
<div class="demo-caption">Notice how Swish and GELU dip slightly below zero before rising, this small negative bump helps gradient flow.</div>

---

## 7. Loss Functions for Regression

A loss function measures how wrong our model's predictions are. For regression, the three major choices are:

**Mean Squared Error (MSE):** $$L = \frac{1}{n}\sum(y_i - \hat{y}_i)^2$$

Penalizes large errors quadratically. Sensitive to outliers.

**Mean Absolute Error (MAE):** $$L = \frac{1}{n}\sum|y_i - \hat{y}_i|$$

Linear penalty. Robust to outliers but not differentiable at zero.

**Huber Loss:** $$L = \begin{cases} \frac{1}{2}(y - \hat{y})^2 & |y - \hat{y}| \leq \delta \\ \delta|y - \hat{y}| - \frac{1}{2}\delta^2 & \text{otherwise} \end{cases}$$

Best of both: quadratic near zero (smooth gradients), linear for large errors (outlier robustness).

<div class="interactive-demo" id="demo-regression-loss">
  <canvas id="canvas-reg-loss" width="680" height="340"></canvas>
  <div class="demo-controls">
    <button id="rl-mse" class="active">MSE</button>
    <button id="rl-mae">MAE</button>
    <button id="rl-huber">Huber</button>
    <button id="rl-all">Compare All</button>
    <label>Huber delta <input type="range" id="rl-delta" min="0.1" max="3" step="0.1" value="1"><span class="demo-value" id="val-rl-delta">1.0</span></label>
  </div>
  <div class="demo-info" id="info-reg-loss">MSE grows quadratically. MAE grows linearly. Huber transitions between them at delta.</div>
</div>
<div class="demo-caption">The x-axis is the error (y - y_hat), the y-axis is the loss. Notice how MSE explodes for large errors while MAE stays linear.</div>

<div class="demo-hint">Adjust the Huber delta slider with "Compare All" active to see how Huber transitions from MSE-like behavior near zero to MAE-like behavior for large errors.</div>

---

## 8. Loss Functions for Classification

For classification, the loss must penalize wrong predictions more than it rewards correct ones, especially when the model is confident and wrong.

**Binary Cross-Entropy:** $$L = -[y\log(p) + (1-y)\log(1-p)]$$

The standard for binary classification. Goes to infinity when the model is confidently wrong.

**Hinge Loss:** $$L = \max(0, 1 - y \cdot f(x))$$

Used by SVMs. Only penalizes predictions within the margin.

**Focal Loss:** $$L = -(1 - p_t)^\gamma \log(p_t)$$

Down-weights easy examples, focuses on hard ones. Crucial for imbalanced datasets.

<div class="interactive-demo" id="demo-class-loss">
  <canvas id="canvas-class-loss" width="680" height="340"></canvas>
  <div class="demo-controls">
    <button id="cl-bce" class="active">Cross-Entropy</button>
    <button id="cl-hinge">Hinge Loss</button>
    <button id="cl-focal">Focal Loss</button>
    <button id="cl-all">Compare All</button>
    <label>Focal gamma <input type="range" id="cl-gamma" min="0" max="5" step="0.5" value="2"><span class="demo-value" id="val-cl-gamma">2.0</span></label>
  </div>
  <div class="demo-info" id="info-class-loss">Showing loss for the TRUE class (y=1) as predicted probability varies from 0 to 1.</div>
</div>
<div class="demo-caption">The x-axis is the model's predicted probability for the true class. Cross-entropy rises steeply as the prediction approaches 0 (confident wrong answer).</div>

---

## 9. MSE vs Cross-Entropy for Classification

A common mistake is using MSE for classification. Let us see why cross-entropy converges faster. We train a tiny network on the same 2D classification task with both losses side-by-side.

The key insight: MSE's gradient depends on $$(\hat{y} - y) \cdot \sigma'(z)$$. When the sigmoid saturates (confident wrong prediction), $$\sigma'(z) \approx 0$$, so the gradient vanishes and the model learns very slowly. Cross-entropy cancels this term: its gradient is simply $$(\hat{y} - y)$$, which is large precisely when the model is wrong.

<div class="interactive-demo" id="demo-mse-vs-ce">
  <div class="demo-split">
    <div>
      <canvas id="canvas-mse-train" width="330" height="280"></canvas>
      <div class="demo-caption">MSE Loss Curve</div>
    </div>
    <div>
      <canvas id="canvas-ce-train" width="330" height="280"></canvas>
      <div class="demo-caption">Cross-Entropy Loss Curve</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btn-mse-ce-train">Train Both</button>
    <button id="btn-mse-ce-reset">Reset</button>
    <label>Learning Rate <input type="range" id="mse-ce-lr" min="0.1" max="5" step="0.1" value="1"><span class="demo-value" id="val-mse-ce-lr">1.0</span></label>
    <span class="demo-value" id="mse-ce-epoch">Epoch: 0</span>
  </div>
  <div class="demo-info" id="info-mse-ce">Cross-entropy typically converges 2-5x faster than MSE for classification.</div>
</div>
<div class="demo-caption">Watch the loss curves. Cross-entropy drops faster because its gradient does not suffer from sigmoid saturation.</div>

---

## 10. Softmax Visualization

For multi-class classification, we use **softmax** to convert raw logits into a probability distribution:

$$\text{softmax}(z_i) = \frac{e^{z_i}}{\sum_j e^{z_j}}$$

The **temperature** parameter $$T$$ controls the sharpness of the distribution:

$$\text{softmax}(z_i; T) = \frac{e^{z_i/T}}{\sum_j e^{z_j/T}}$$

Low temperature makes the distribution peaked (more confident). High temperature makes it uniform (more uncertain). This is used in knowledge distillation and language model sampling.

<div class="interactive-demo" id="demo-softmax">
  <canvas id="canvas-softmax" width="680" height="300"></canvas>
  <div class="demo-controls">
    <label>Class A <input type="range" id="sm-a" min="-5" max="5" step="0.1" value="2"><span class="demo-value" id="val-sm-a">2.0</span></label>
    <label>Class B <input type="range" id="sm-b" min="-5" max="5" step="0.1" value="1"><span class="demo-value" id="val-sm-b">1.0</span></label>
    <label>Class C <input type="range" id="sm-c" min="-5" max="5" step="0.1" value="-1"><span class="demo-value" id="val-sm-c">-1.0</span></label>
    <label>Class D <input type="range" id="sm-d" min="-5" max="5" step="0.1" value="0"><span class="demo-value" id="val-sm-d">0.0</span></label>
  </div>
  <div class="demo-controls">
    <label>Temperature <input type="range" id="sm-temp" min="0.1" max="5" step="0.1" value="1"><span class="demo-value" id="val-sm-temp">1.0</span></label>
  </div>
  <div class="demo-info" id="info-softmax">Probabilities: A=0.576, B=0.212, C=0.029, D=0.078 | Temperature: 1.0</div>
</div>
<div class="demo-caption">Adjust logit sliders to change the raw scores. The temperature slider controls distribution sharpness. Low temp = peaked, high temp = uniform.</div>

<div class="demo-hint">Try setting one logit much higher than the others, then lower the temperature to 0.1, the distribution becomes nearly one-hot. Then raise temperature to 5, it becomes nearly uniform regardless of the logits.</div>

---

## 11. Summary

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

### Loss Function Selection Guide

<table class="summary-table">
<thead>
<tr><th>Task</th><th>Loss Function</th><th>When to Use</th></tr>
</thead>
<tbody>
<tr><td><strong>Regression</strong></td><td>MSE</td><td>Default choice, data has few outliers</td></tr>
<tr><td><strong>Regression</strong></td><td>MAE</td><td>Data has outliers, want robust estimates</td></tr>
<tr><td><strong>Regression</strong></td><td>Huber</td><td>Want the best of MSE and MAE</td></tr>
<tr><td><strong>Binary Classification</strong></td><td>Cross-Entropy</td><td>Default choice for probabilistic outputs</td></tr>
<tr><td><strong>Binary Classification</strong></td><td>Hinge</td><td>SVM-style margin-based classification</td></tr>
<tr><td><strong>Multi-class</strong></td><td>Softmax + Cross-Entropy</td><td>Standard multi-class classification</td></tr>
<tr><td><strong>Imbalanced</strong></td><td>Focal Loss</td><td>Extreme class imbalance (e.g., object detection)</td></tr>
</tbody>
</table>

**What's next:** In the next chapter, we will explore **regularization**, dropout, weight decay, batch normalization, and the techniques that prevent neural networks from memorizing training data.

---

<script>
// ==================== DEMO 1: Linear Collapse ====================
(function(){
  var canvas = document.getElementById('canvas-linear-collapse');
  var ctx = AL.setupCanvas(canvas, 680, 320);
  var layerSlider = document.getElementById('lc-layers');
  var layerVal = document.getElementById('val-lc-layers');
  var btnLinear = document.getElementById('btn-lc-linear');
  var btnRelu = document.getElementById('btn-lc-relu');
  var info = document.getElementById('info-lc');
  var useRelu = false;
  var W = 680, H = 320, pad = 50;

  // Generate random layer weights and biases
  function genParams(nLayers) {
    var params = [];
    for (var i = 0; i < nLayers; i++) {
      params.push({
        w: 0.6 + Math.sin(i * 2.1 + 0.5) * 0.8,
        b: Math.cos(i * 1.7 + 0.3) * 0.5
      });
    }
    return params;
  }

  function computeOutput(x, params, activation) {
    var val = x;
    for (var i = 0; i < params.length; i++) {
      val = params[i].w * val + params[i].b;
      if (activation) val = AL.relu(val);
    }
    return val;
  }

  function draw() {
    var colors = AL.getColors();
    var nLayers = parseInt(layerSlider.value);
    layerVal.textContent = nLayers;
    var params = genParams(nLayers);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    var xMin = -3, xMax = 3, yMin = -3, yMax = 3;
    var dims = AL.drawAxes(ctx, W, H, pad, xMin, xMax, yMin, yMax, colors, 'x', 'f(x)');

    // Draw identity line for reference
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1;
    ctx.beginPath();
    var steps = 200;
    for (var i = 0; i <= steps; i++) {
      var x = xMin + (xMax - xMin) * i / steps;
      var px = dims.pad + (x - xMin) / (xMax - xMin) * dims.pw;
      var py = dims.pad + dims.ph - (x - yMin) / (yMax - yMin) * dims.ph;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw linear composition
    ctx.strokeStyle = colors.sigmoid;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (var i = 0; i <= steps; i++) {
      var x = xMin + (xMax - xMin) * i / steps;
      var y = computeOutput(x, params, false);
      var px = dims.pad + (x - xMin) / (xMax - xMin) * dims.pw;
      var py = dims.pad + dims.ph - (y - yMin) / (yMax - yMin) * dims.ph;
      py = Math.max(dims.pad, Math.min(dims.pad + dims.ph, py));
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw with activation
    if (useRelu) {
      ctx.strokeStyle = colors.positive;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var i = 0; i <= steps; i++) {
        var x = xMin + (xMax - xMin) * i / steps;
        var y = computeOutput(x, params, true);
        var px = dims.pad + (x - xMin) / (xMax - xMin) * dims.pw;
        var py = dims.pad + dims.ph - (y - yMin) / (yMax - yMin) * dims.ph;
        py = Math.max(dims.pad, Math.min(dims.pad + dims.ph, py));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Legend
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('--- identity (y=x)', dims.pad + 10, dims.pad + 15);
    ctx.fillStyle = colors.sigmoid;
    ctx.fillText(nLayers + ' linear layer' + (nLayers > 1 ? 's' : '') + ' (no activation)', dims.pad + 10, dims.pad + 32);
    if (useRelu) {
      ctx.fillStyle = colors.positive;
      ctx.fillText(nLayers + ' layer' + (nLayers > 1 ? 's' : '') + ' with ReLU', dims.pad + 10, dims.pad + 49);
    }

    info.textContent = useRelu
      ? 'Orange = linear stack (always a line). Green = with ReLU (' + nLayers + ' hinge points possible).'
      : nLayers + ' linear layers compose to: y = ' + (params.reduce(function(a,p){return a*p.w;},1)).toFixed(3) + 'x + ' + computeOutput(0, params, false).toFixed(3) + ', still linear!';
  }

  btnLinear.addEventListener('click', function() {
    useRelu = false;
    btnLinear.classList.add('active');
    btnRelu.classList.remove('active');
    draw();
  });
  btnRelu.addEventListener('click', function() {
    useRelu = true;
    btnRelu.classList.add('active');
    btnLinear.classList.remove('active');
    draw();
  });
  layerSlider.addEventListener('input', draw);
  AL.onThemeChange(draw);
  draw();
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

// ==================== DEMO 5: Dead Neuron Demo ====================
(function(){
  var canvasR = document.getElementById('canvas-dead-relu');
  var canvasL = document.getElementById('canvas-dead-leaky');
  var ctxR = AL.setupCanvas(canvasR, 330, 280);
  var ctxL = AL.setupCanvas(canvasL, 330, 280);
  var btnRun = document.getElementById('btn-dead-run');
  var btnReset = document.getElementById('btn-dead-reset');
  var lrSlider = document.getElementById('dead-lr');
  var lrVal = document.getElementById('val-dead-lr');
  var stepSpan = document.getElementById('dead-step');
  var capR = document.getElementById('dead-relu-caption');
  var capL = document.getElementById('dead-leaky-caption');
  var W = 330, H = 280;
  var nNeurons = 64;
  var cols = 8, rows = 8;
  var weightsR, weightsL, biasR, biasL;
  var step = 0, animId = null;

  function initWeights() {
    weightsR = []; weightsL = []; biasR = []; biasL = [];
    for (var i = 0; i < nNeurons; i++) {
      var w = (Math.random() - 0.5) * 2;
      weightsR.push(w);
      weightsL.push(w);
      var b = (Math.random() - 0.5) * 0.5;
      biasR.push(b);
      biasL.push(b);
    }
    step = 0;
    stepSpan.textContent = 'Step: 0';
  }

  function drawNeurons(ctx_, weights, biases, isLeaky, caption) {
    var colors = AL.getColors();
    ctx_.clearRect(0, 0, W, H);
    ctx_.fillStyle = colors.bg;
    ctx_.fillRect(0, 0, W, H);

    var cellW = (W - 40) / cols;
    var cellH = (H - 60) / rows;
    var r = Math.min(cellW, cellH) * 0.38;
    var deadCount = 0;

    for (var i = 0; i < nNeurons; i++) {
      var row = Math.floor(i / cols);
      var col = i % cols;
      var cx = 20 + col * cellW + cellW / 2;
      var cy = 30 + row * cellH + cellH / 2;

      // Simulate activation with random input
      var input = Math.sin(step * 0.1 + i * 0.7) * 2;
      var z = weights[i] * input + biases[i];
      var active = isLeaky ? (z > 0 || true) : (z > 0);
      // Track if neuron has been consistently dead
      var testInputs = [-2, -1, 0, 1, 2];
      var anyActive = false;
      for (var t = 0; t < testInputs.length; t++) {
        var zt = weights[i] * testInputs[t] + biases[i];
        if (zt > 0) anyActive = true;
      }
      var isDead = !isLeaky && !anyActive;
      if (isDead) deadCount++;

      ctx_.beginPath();
      ctx_.arc(cx, cy, r, 0, Math.PI * 2);
      if (isDead) {
        ctx_.fillStyle = colors.negative;
      } else {
        var act = isLeaky ? Math.max(0.01 * z, z) : Math.max(0, z);
        var intensity = Math.min(1, Math.abs(act) / 3);
        ctx_.fillStyle = 'rgba(158,206,106,' + (0.3 + 0.7 * intensity) + ')';
      }
      ctx_.fill();
      ctx_.strokeStyle = colors.textMuted;
      ctx_.lineWidth = 1.5;
      ctx_.stroke();
    }

    var pct = Math.round(deadCount / nNeurons * 100);
    caption.textContent = (isLeaky ? 'Leaky ReLU' : 'ReLU') + ': ' + pct + '% dead (' + deadCount + '/' + nNeurons + ')';

    // Title
    ctx_.fillStyle = colors.text;
    ctx_.font = 'bold 13px sans-serif';
    ctx_.textAlign = 'center';
    ctx_.fillText(isLeaky ? 'Leaky ReLU' : 'ReLU', W / 2, 18);
  }

  function simulateStep() {
    var lr = parseFloat(lrSlider.value);
    // Simulate gradient updates that can push weights negative
    for (var i = 0; i < nNeurons; i++) {
      var grad = (Math.random() - 0.55) * 2; // slightly biased negative
      weightsR[i] -= lr * grad;
      weightsL[i] -= lr * grad;
      var gradB = (Math.random() - 0.55) * 1;
      biasR[i] -= lr * gradB;
      biasL[i] -= lr * gradB;
    }
    step++;
    stepSpan.textContent = 'Step: ' + step;
  }

  function drawAll() {
    drawNeurons(ctxR, weightsR, biasR, false, capR);
    drawNeurons(ctxL, weightsL, biasL, true, capL);
  }

  function animate() {
    simulateStep();
    drawAll();
    if (step < 200) {
      animId = requestAnimationFrame(animate);
    }
  }

  btnRun.addEventListener('click', function() {
    if (animId) cancelAnimationFrame(animId);
    if (step === 0) initWeights();
    animate();
  });

  btnReset.addEventListener('click', function() {
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    initWeights();
    drawAll();
  });

  lrSlider.addEventListener('input', function() {
    lrVal.textContent = parseFloat(this.value).toFixed(2);
  });

  AL.onThemeChange(drawAll);
  initWeights();
  drawAll();
})();

// ==================== DEMO 6: Modern Activations ====================
(function(){
  var canvas = document.getElementById('canvas-modern');
  var ctx = AL.setupCanvas(canvas, 680, 320);
  var info = document.getElementById('info-modern');
  var W = 680, H = 320, pad = 50;
  var current = 'swish';
  var showAll = false;

  var btns = { 'mod-relu': 'relu', 'mod-swish': 'swish', 'mod-gelu': 'gelu' };

  function draw() {
    var colors = AL.getColors();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    var xMin = -5, xMax = 5, yMin = -1.5, yMax = 4;
    var dims = AL.drawAxes(ctx, W, H, pad, xMin, xMax, yMin, yMax, colors, 'x', 'f(x)');

    if (showAll || current === 'relu') {
      AL.plotLine(ctx, AL.relu, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.relu, 2.5);
    }
    if (showAll || current === 'swish') {
      AL.plotLine(ctx, AL.swish, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.swish, 2.5);
    }
    if (showAll || current === 'gelu') {
      AL.plotLine(ctx, AL.gelu, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.gelu, 2.5);
    }

    // Legend
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    var y0 = dims.pad + 15;
    if (showAll || current === 'relu') { ctx.fillStyle = colors.relu; ctx.fillText('ReLU', dims.pad + 10, y0); y0 += 16; }
    if (showAll || current === 'swish') { ctx.fillStyle = colors.swish; ctx.fillText('Swish (x * sigmoid(x))', dims.pad + 10, y0); y0 += 16; }
    if (showAll || current === 'gelu') { ctx.fillStyle = colors.gelu; ctx.fillText('GELU (x * Phi(x))', dims.pad + 10, y0); }

    // Highlight the negative dip
    if ((showAll || current === 'swish' || current === 'gelu') && !showAll) {
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      // Arrow pointing to the dip
      var dipX = current === 'swish' ? -1.28 : -1.0;
      var dipY = current === 'swish' ? AL.swish(dipX) : AL.gelu(dipX);
      var dpx = dims.pad + (dipX - xMin) / (xMax - xMin) * dims.pw;
      var dpy = dims.pad + dims.ph - (dipY - yMin) / (yMax - yMin) * dims.ph;
      ctx.fillText('small negative dip', dpx, dpy + 18);
    }
  }

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

// ==================== DEMO 7: Regression Loss Functions ====================
(function(){
  var canvas = document.getElementById('canvas-reg-loss');
  var ctx = AL.setupCanvas(canvas, 680, 340);
  var deltaSlider = document.getElementById('rl-delta');
  var deltaVal = document.getElementById('val-rl-delta');
  var info = document.getElementById('info-reg-loss');
  var W = 680, H = 340, pad = 50;
  var current = 'mse';
  var showAll = false;

  var btns = { 'rl-mse': 'mse', 'rl-mae': 'mae', 'rl-huber': 'huber' };

  function draw() {
    var colors = AL.getColors();
    var delta = parseFloat(deltaSlider.value);
    deltaVal.textContent = delta.toFixed(1);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    var xMin = -4, xMax = 4, yMin = 0, yMax = 8;
    var dims = AL.drawAxes(ctx, W, H, pad, xMin, xMax, yMin, yMax, colors, 'error (y - y_hat)', 'loss');

    if (showAll || current === 'mse') {
      AL.plotLine(ctx, function(e) { return e * e; }, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.mse, 2.5);
    }
    if (showAll || current === 'mae') {
      AL.plotLine(ctx, function(e) { return Math.abs(e); }, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.mae, 2.5);
    }
    if (showAll || current === 'huber') {
      AL.plotLine(ctx, function(e) { return AL.huberLoss(0, e, delta); }, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.huber, 2.5);
    }

    // Legend
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    var y0 = dims.pad + 15;
    if (showAll || current === 'mse') { ctx.fillStyle = colors.mse; ctx.fillText('MSE (quadratic)', dims.pad + 10, y0); y0 += 16; }
    if (showAll || current === 'mae') { ctx.fillStyle = colors.mae; ctx.fillText('MAE (linear)', dims.pad + 10, y0); y0 += 16; }
    if (showAll || current === 'huber') { ctx.fillStyle = colors.huber; ctx.fillText('Huber (delta=' + delta.toFixed(1) + ')', dims.pad + 10, y0); }
  }

  Object.keys(btns).forEach(function(id) {
    document.getElementById(id).addEventListener('click', function() {
      showAll = false;
      current = btns[id];
      Object.keys(btns).forEach(function(bid) { document.getElementById(bid).classList.remove('active'); });
      document.getElementById('rl-all').classList.remove('active');
      this.classList.add('active');
      draw();
    });
  });
  document.getElementById('rl-all').addEventListener('click', function() {
    showAll = true;
    Object.keys(btns).forEach(function(bid) { document.getElementById(bid).classList.remove('active'); });
    this.classList.add('active');
    info.textContent = 'All three losses compared. MSE penalizes outliers harshly; MAE is linear; Huber transitions at delta.';
    draw();
  });
  deltaSlider.addEventListener('input', draw);
  AL.onThemeChange(draw);
  draw();
})();

// ==================== DEMO 8: Classification Loss Functions ====================
(function(){
  var canvas = document.getElementById('canvas-class-loss');
  var ctx = AL.setupCanvas(canvas, 680, 340);
  var gammaSlider = document.getElementById('cl-gamma');
  var gammaVal = document.getElementById('val-cl-gamma');
  var info = document.getElementById('info-class-loss');
  var W = 680, H = 340, pad = 50;
  var current = 'bce';
  var showAll = false;

  var btns = { 'cl-bce': 'bce', 'cl-hinge': 'hinge', 'cl-focal': 'focal' };

  function draw() {
    var colors = AL.getColors();
    var gamma = parseFloat(gammaSlider.value);
    gammaVal.textContent = gamma.toFixed(1);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    // x-axis = predicted probability for y=1
    var xMin = 0.01, xMax = 0.99, yMin = 0, yMax = 5;
    var dims = AL.drawAxes(ctx, W, H, pad, xMin, xMax, yMin, yMax, colors, 'predicted P(y=1)', 'loss');

    if (showAll || current === 'bce') {
      AL.plotLine(ctx, function(p) { return AL.bceLoss(1, p); }, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.bce, 2.5);
    }
    if (showAll || current === 'hinge') {
      // Map probability to score: f = 2p - 1 (so p=0.5 -> f=0, p=1 -> f=1)
      AL.plotLine(ctx, function(p) { return AL.hingeLoss(1, 2 * p - 1); }, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.hinge, 2.5);
    }
    if (showAll || current === 'focal') {
      AL.plotLine(ctx, function(p) { return AL.focalLoss(1, p, gamma); }, xMin, xMax, yMin, yMax, dims.pad, dims.pw, dims.ph, colors.focal, 2.5);
    }

    // Legend
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    var y0 = dims.pad + 15;
    if (showAll || current === 'bce') { ctx.fillStyle = colors.bce; ctx.fillText('Cross-Entropy', dims.pad + 10, y0); y0 += 16; }
    if (showAll || current === 'hinge') { ctx.fillStyle = colors.hinge; ctx.fillText('Hinge Loss', dims.pad + 10, y0); y0 += 16; }
    if (showAll || current === 'focal') { ctx.fillStyle = colors.focal; ctx.fillText('Focal (gamma=' + gamma.toFixed(1) + ')', dims.pad + 10, y0); }
  }

  Object.keys(btns).forEach(function(id) {
    document.getElementById(id).addEventListener('click', function() {
      showAll = false;
      current = btns[id];
      Object.keys(btns).forEach(function(bid) { document.getElementById(bid).classList.remove('active'); });
      document.getElementById('cl-all').classList.remove('active');
      this.classList.add('active');
      draw();
    });
  });
  document.getElementById('cl-all').addEventListener('click', function() {
    showAll = true;
    Object.keys(btns).forEach(function(bid) { document.getElementById(bid).classList.remove('active'); });
    this.classList.add('active');
    info.textContent = 'All losses for true class y=1. Cross-entropy explodes near p=0. Focal loss is suppressed for easy (high p) examples.';
    draw();
  });
  gammaSlider.addEventListener('input', draw);
  AL.onThemeChange(draw);
  draw();
})();

// ==================== DEMO 9: MSE vs Cross-Entropy ====================
(function(){
  var canvasMSE = document.getElementById('canvas-mse-train');
  var canvasCE = document.getElementById('canvas-ce-train');
  var ctxM = AL.setupCanvas(canvasMSE, 330, 280);
  var ctxC = AL.setupCanvas(canvasCE, 330, 280);
  var btnTrain = document.getElementById('btn-mse-ce-train');
  var btnReset = document.getElementById('btn-mse-ce-reset');
  var lrSlider = document.getElementById('mse-ce-lr');
  var lrVal = document.getElementById('val-mse-ce-lr');
  var epochSpan = document.getElementById('mse-ce-epoch');
  var info = document.getElementById('info-mse-ce');
  var W = 330, H = 280, pad = 45;

  // Simple 1D classification: 4 points
  var data = [
    { x: -2, y: 0 }, { x: -1, y: 0 },
    { x: 1, y: 1 }, { x: 2, y: 1 }
  ];

  var wMSE, bMSE, wCE, bCE;
  var lossMSE, lossCE;
  var epoch, animId;

  function init() {
    wMSE = 0.1; bMSE = 0;
    wCE = 0.1; bCE = 0;
    lossMSE = []; lossCE = [];
    epoch = 0;
    epochSpan.textContent = 'Epoch: 0';
  }

  function trainStep() {
    var lr = parseFloat(lrSlider.value);
    // MSE training
    var dwM = 0, dbM = 0, lM = 0;
    for (var i = 0; i < data.length; i++) {
      var z = wMSE * data[i].x + bMSE;
      var a = AL.sigmoid(z);
      var err = a - data[i].y;
      var sd = a * (1 - a);
      lM += 0.5 * err * err;
      dwM += err * sd * data[i].x;
      dbM += err * sd;
    }
    wMSE -= lr * dwM / data.length;
    bMSE -= lr * dbM / data.length;
    lossMSE.push(lM / data.length);

    // CE training
    var dwC = 0, dbC = 0, lC = 0;
    for (var i = 0; i < data.length; i++) {
      var z = wCE * data[i].x + bCE;
      var a = AL.sigmoid(z);
      var err = a - data[i].y;
      lC += AL.bceLoss(data[i].y, a);
      dwC += err * data[i].x;  // CE gradient: no sigmoid derivative term!
      dbC += err;
    }
    wCE -= lr * dwC / data.length;
    bCE -= lr * dbC / data.length;
    lossCE.push(lC / data.length);

    epoch++;
    epochSpan.textContent = 'Epoch: ' + epoch;
  }

  function drawLossCurve(ctx_, losses, title, color) {
    var colors = AL.getColors();
    ctx_.clearRect(0, 0, W, H);
    ctx_.fillStyle = colors.bg;
    ctx_.fillRect(0, 0, W, H);

    if (losses.length < 2) {
      ctx_.fillStyle = colors.textMuted;
      ctx_.font = '13px sans-serif';
      ctx_.textAlign = 'center';
      ctx_.fillText('Click "Train Both" to start', W / 2, H / 2);
      ctx_.fillStyle = colors.text;
      ctx_.font = 'bold 13px sans-serif';
      ctx_.fillText(title, W / 2, 20);
      return;
    }

    var maxL = Math.max.apply(null, losses.slice(0, Math.min(20, losses.length)));
    maxL = Math.max(maxL, 0.1);
    var xMin = 0, xMax = losses.length, yMin = 0, yMax = maxL * 1.1;
    var dims = AL.drawAxes(ctx_, W, H, pad, xMin, xMax, yMin, yMax, colors, 'epoch', 'loss');

    ctx_.strokeStyle = color;
    ctx_.lineWidth = 2;
    ctx_.beginPath();
    for (var i = 0; i < losses.length; i++) {
      var px = dims.pad + i / (losses.length - 1) * dims.pw;
      var py = dims.pad + dims.ph - (losses[i] - yMin) / (yMax - yMin) * dims.ph;
      py = Math.max(dims.pad, Math.min(dims.pad + dims.ph, py));
      if (i === 0) ctx_.moveTo(px, py); else ctx_.lineTo(px, py);
    }
    ctx_.stroke();

    ctx_.fillStyle = colors.text;
    ctx_.font = 'bold 12px sans-serif';
    ctx_.textAlign = 'center';
    ctx_.fillText(title, W / 2, 16);

    // Final loss
    ctx_.fillStyle = colors.textMuted;
    ctx_.font = '10px JetBrains Mono, monospace';
    ctx_.fillText('loss: ' + losses[losses.length - 1].toFixed(4), W / 2, 32);
  }

  function drawAll() {
    var colors = AL.getColors();
    drawLossCurve(ctxM, lossMSE, 'MSE Loss', colors.mse);
    drawLossCurve(ctxC, lossCE, 'Cross-Entropy Loss', colors.bce);
  }

  function animate() {
    for (var i = 0; i < 5; i++) trainStep();
    drawAll();
    if (epoch < 500) {
      animId = requestAnimationFrame(animate);
    } else {
      info.textContent = 'Done! MSE final: ' + lossMSE[lossMSE.length-1].toFixed(4) + ', CE final: ' + lossCE[lossCE.length-1].toFixed(4);
    }
  }

  btnTrain.addEventListener('click', function() {
    if (animId) cancelAnimationFrame(animId);
    if (epoch === 0) init();
    animate();
  });
  btnReset.addEventListener('click', function() {
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    init();
    drawAll();
    info.textContent = 'Cross-entropy typically converges 2-5x faster than MSE for classification.';
  });
  lrSlider.addEventListener('input', function() { lrVal.textContent = parseFloat(this.value).toFixed(1); });

  AL.onThemeChange(drawAll);
  init();
  drawAll();
})();

// ==================== DEMO 10: Softmax Visualization ====================
(function(){
  var canvas = document.getElementById('canvas-softmax');
  var ctx = AL.setupCanvas(canvas, 680, 300);
  var sliderA = document.getElementById('sm-a');
  var sliderB = document.getElementById('sm-b');
  var sliderC = document.getElementById('sm-c');
  var sliderD = document.getElementById('sm-d');
  var sliderTemp = document.getElementById('sm-temp');
  var valA = document.getElementById('val-sm-a');
  var valB = document.getElementById('val-sm-b');
  var valC = document.getElementById('val-sm-c');
  var valD = document.getElementById('val-sm-d');
  var valTemp = document.getElementById('val-sm-temp');
  var info = document.getElementById('info-softmax');
  var W = 680, H = 300;

  var labels = ['A', 'B', 'C', 'D'];
  var barColors = ['#7aa2f7', '#f7768e', '#9ece6a', '#bb9af7'];

  function draw() {
    var colors = AL.getColors();
    var logits = [parseFloat(sliderA.value), parseFloat(sliderB.value), parseFloat(sliderC.value), parseFloat(sliderD.value)];
    var temp = parseFloat(sliderTemp.value);
    valA.textContent = logits[0].toFixed(1);
    valB.textContent = logits[1].toFixed(1);
    valC.textContent = logits[2].toFixed(1);
    valD.textContent = logits[3].toFixed(1);
    valTemp.textContent = temp.toFixed(1);

    var probs = AL.softmax(logits, temp);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    var pad = 40;
    var barAreaW = W - 2 * pad;
    var barAreaH = H - 2 * pad - 30;

    // Title
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Softmax Probabilities (Temperature = ' + temp.toFixed(1) + ')', W / 2, 22);

    // Draw bars
    var barW = barAreaW / labels.length * 0.6;
    var gap = barAreaW / labels.length;
    var baseY = pad + barAreaH + 10;

    for (var i = 0; i < labels.length; i++) {
      var cx = pad + gap * i + gap / 2;
      var barH = probs[i] * barAreaH;

      // Bar
      ctx.fillStyle = barColors[i];
      ctx.fillRect(cx - barW / 2, baseY - barH, barW, barH);

      // Label
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Class ' + labels[i], cx, baseY + 18);

      // Probability on top
      ctx.fillStyle = colors.text;
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.fillText((probs[i] * 100).toFixed(1) + '%', cx, baseY - barH - 8);

      // Logit value
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('z=' + logits[i].toFixed(1), cx, baseY + 32);
    }

    // Baseline
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, baseY);
    ctx.lineTo(pad + barAreaW, baseY);
    ctx.stroke();

    // Scale marks
    ctx.fillStyle = colors.textMuted;
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    for (var p = 0; p <= 1; p += 0.25) {
      var y = baseY - p * barAreaH;
      ctx.fillText((p * 100).toFixed(0) + '%', pad - 5, y + 3);
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + barAreaW, y); ctx.stroke();
    }

    info.textContent = 'Probabilities: A=' + probs[0].toFixed(3) + ', B=' + probs[1].toFixed(3) + ', C=' + probs[2].toFixed(3) + ', D=' + probs[3].toFixed(3) + ' | Temperature: ' + temp.toFixed(1);
  }

  [sliderA, sliderB, sliderC, sliderD, sliderTemp].forEach(function(s) {
    s.addEventListener('input', draw);
  });

  AL.onThemeChange(draw);
  draw();
})();
</script>
