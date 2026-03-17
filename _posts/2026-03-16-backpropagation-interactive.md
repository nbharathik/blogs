---
layout: post
title: "Backpropagation Visualized - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Watch data flow forward and gradients flow backward through neural networks, visualize the chain rule at every node, and understand vanishing gradients - all interactively."
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
.bp-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.82rem;
}
.bp-legend span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.bp-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>

## The Engine Behind Neural Network Learning

In the [Perceptron & MLP]({{ site.baseurl }}/perceptron-mlp-interactive/) guide, we built multi-layer perceptrons and watched them learn. We saw decision boundaries form, loss decrease, and weights update. But we treated the weight update as a black box. How does the network know which weight to adjust and by how much?

The answer is **backpropagation** -- an elegant algorithm that computes the gradient of the loss with respect to every weight in the network, using nothing more than the chain rule from calculus. It is the engine behind all of deep learning.

This chapter makes the invisible visible. We will watch data flow forward, gradients flow backward, and weights update -- step by step, node by node.

---

## 1. The Chain Rule on a Computational Graph

Every neural network computation can be expressed as a **computational graph**: a directed graph where each node performs a simple operation (add, multiply, apply activation). The chain rule tells us how to propagate gradients backward through this graph.

Consider a simple expression: $$f(x, y, z) = (x + y) \cdot z$$

Let $$q = x + y$$, so $$f = q \cdot z$$. The chain rule gives us:

$$\frac{\partial f}{\partial x} = \frac{\partial f}{\partial q} \cdot \frac{\partial q}{\partial x} = z \cdot 1 = z$$

$$\frac{\partial f}{\partial y} = \frac{\partial f}{\partial q} \cdot \frac{\partial q}{\partial y} = z \cdot 1 = z$$

$$\frac{\partial f}{\partial z} = q$$

Click any node in the graph below to see how the chain rule applies at that point.

<div class="interactive-demo" id="demo-chain">
  <canvas id="canvas-chain" width="680" height="360"></canvas>
  <div class="demo-controls">
    <label>x <input type="range" id="chain-x" min="-5" max="5" step="0.5" value="2"><span class="demo-value" id="val-chain-x">2.0</span></label>
    <label>y <input type="range" id="chain-y" min="-5" max="5" step="0.5" value="1"><span class="demo-value" id="val-chain-y">1.0</span></label>
    <label>z <input type="range" id="chain-z" min="-5" max="5" step="0.5" value="-3"><span class="demo-value" id="val-chain-z">-3.0</span></label>
  </div>
  <div class="demo-info" id="info-chain">Click a node to see the chain rule derivation at that point.</div>
</div>
<div class="demo-caption">A computational graph for f(x,y,z) = (x+y)*z. Blue values flow forward; red gradients flow backward.</div>

---

## 2. Forward Pass Animation

Before we can compute gradients, we need values. The **forward pass** sends input data through the network layer by layer, computing weighted sums and activations at each neuron, until we reach the output and compute the loss.

Watch data flow left to right through a 2-layer network. Each neuron "lights up" as it computes its activation.

<div class="interactive-demo" id="demo-forward">
  <canvas id="canvas-forward" width="680" height="400"></canvas>
  <div class="demo-controls">
    <label>x₁ <input type="range" id="fwd-x1" min="-2" max="2" step="0.1" value="0.5"><span class="demo-value" id="val-fwd-x1">0.5</span></label>
    <label>x₂ <input type="range" id="fwd-x2" min="-2" max="2" step="0.1" value="-0.3"><span class="demo-value" id="val-fwd-x2">-0.3</span></label>
    <button id="btn-fwd-play">Play Forward</button>
    <button id="btn-fwd-reset">Reset</button>
    <label>Speed <input type="range" id="fwd-speed" min="1" max="5" step="1" value="2"><span class="demo-value" id="val-fwd-speed">2</span></label>
  </div>
  <div class="demo-info" id="info-forward">Click "Play Forward" to animate data flowing through the network.</div>
  <div class="bp-legend">
    <span><span class="bp-legend-dot" style="background:#7aa2f7"></span> Input</span>
    <span><span class="bp-legend-dot" style="background:#73daca"></span> Activation computed</span>
    <span><span class="bp-legend-dot" style="background:#565f89"></span> Waiting</span>
  </div>
</div>
<div class="demo-caption">Data flows left to right. Each neuron computes z = sum(w*x) + b, then a = sigmoid(z).</div>

---

## 3. Backward Pass Animation

Now for the heart of backpropagation. After the forward pass, we compute the loss, then send **gradients** flowing right to left. At each connection, the chain rule multiplies the incoming gradient by the local derivative.

This is the flagship visualization. Watch the red/orange gradient signals propagate backward, with the chain rule computation shown at each node.

<div class="interactive-demo" id="demo-backward">
  <canvas id="canvas-backward" width="680" height="420"></canvas>
  <div class="demo-controls">
    <button id="btn-bk-forward">1. Forward</button>
    <button id="btn-bk-backward">2. Backward</button>
    <button id="btn-bk-reset">Reset</button>
    <label>Speed <input type="range" id="bk-speed" min="1" max="5" step="1" value="2"><span class="demo-value" id="val-bk-speed">2</span></label>
  </div>
  <div class="demo-info" id="info-backward">Run forward first, then backward. Watch gradients flow and chain rule multiply at each node.</div>
  <div class="bp-legend">
    <span><span class="bp-legend-dot" style="background:#7aa2f7"></span> Forward flow</span>
    <span><span class="bp-legend-dot" style="background:#f7768e"></span> Backward gradient</span>
    <span><span class="bp-legend-dot" style="background:#ff9e64"></span> Chain rule multiplication</span>
  </div>
</div>
<div class="demo-caption">Gradients flow right to left. At each node: local gradient times upstream gradient equals downstream gradient.</div>

<div class="demo-hint">The key insight: each node only needs to know its local derivative and the gradient coming from above (upstream). It multiplies them together and passes the result backward. No node needs to know the full network structure.</div>

---

## 4. Full Forward + Backward Cycle

Now let us see the complete cycle: forward pass (blue/green), loss computation, backward pass (red/orange), all in one continuous animation. Use the step button to advance one stage at a time, or play the full cycle.

<div class="interactive-demo" id="demo-cycle">
  <canvas id="canvas-cycle" width="680" height="420"></canvas>
  <div class="demo-controls">
    <button id="btn-cy-play">Play Cycle</button>
    <button id="btn-cy-step">Step</button>
    <button id="btn-cy-reset">Reset</button>
    <label>Speed <input type="range" id="cy-speed" min="1" max="5" step="1" value="2"><span class="demo-value" id="val-cy-speed">2</span></label>
    <span class="demo-value" id="cy-phase">Phase: Ready</span>
  </div>
  <div class="demo-info" id="info-cycle">Watch the complete training cycle: forward → loss → backward → update.</div>
</div>
<div class="demo-caption">The complete backpropagation cycle. Blue = forward, red = backward, green = weight update.</div>

---

## 5. Weight Update Visualization

After backpropagation computes gradients, we update each weight: $$w \leftarrow w - \eta \cdot \frac{\partial L}{\partial w}$$

Watch the edges of the network change thickness and color as weights evolve over multiple training iterations. Thick edges carry large weights; blue means positive, red means negative.

<div class="interactive-demo" id="demo-weights">
  <canvas id="canvas-weights" width="680" height="400"></canvas>
  <div class="demo-controls">
    <button id="btn-wt-train">Train (10 steps)</button>
    <button id="btn-wt-reset">Reset</button>
    <label>Learning Rate <input type="range" id="wt-lr" min="0.1" max="3" step="0.1" value="1.0"><span class="demo-value" id="val-wt-lr">1.0</span></label>
    <span class="demo-value" id="wt-epoch">Step: 0</span>
  </div>
  <div class="demo-info" id="info-weights">Edge thickness = weight magnitude. Blue = positive, red = negative. Watch weights evolve.</div>
  <div class="bp-legend">
    <span><span class="bp-legend-dot" style="background:#7aa2f7"></span> Positive weight</span>
    <span><span class="bp-legend-dot" style="background:#f7768e"></span> Negative weight</span>
    <span>Thickness = magnitude</span>
  </div>
</div>
<div class="demo-caption">Click "Train" repeatedly to watch weights evolve. The network is learning XOR.</div>

---

## 6. Gradient Magnitude Heatmap

Not all neurons receive equal gradients. In deep networks, gradients can vary enormously across layers. This heatmap colors each neuron by the magnitude of its gradient -- bright means a large gradient (fast learning), dark means a small gradient (slow learning).

<div class="interactive-demo" id="demo-heatmap">
  <canvas id="canvas-heatmap" width="680" height="380"></canvas>
  <div class="demo-controls">
    <label>Layers <input type="range" id="hm-layers" min="2" max="6" step="1" value="3"><span class="demo-value" id="val-hm-layers">3</span></label>
    <label>Activation:
      <button id="hm-sigmoid" class="active">Sigmoid</button>
      <button id="hm-relu">ReLU</button>
    </label>
    <button id="btn-hm-compute">Compute Gradients</button>
    <button id="btn-hm-reset">Reset</button>
  </div>
  <div class="demo-info" id="info-heatmap">Bright = large gradient, dark = small gradient. Increase layers with Sigmoid to see gradients vanish.</div>
</div>
<div class="demo-caption">Gradient magnitude across layers. With Sigmoid, deeper layers have vanishingly small gradients.</div>

---

## 7. The Vanishing Gradient Problem

The **vanishing gradient problem** is one of the most important challenges in deep learning. With sigmoid or tanh activations, each layer multiplies the gradient by a value between 0 and 0.25 (the maximum of sigmoid's derivative). Stack 5+ layers, and the gradients at early layers become astronomically small -- the network effectively stops learning there.

$$\frac{\partial L}{\partial w_1} = \underbrace{\sigma'(z_5) \cdot \sigma'(z_4) \cdot \sigma'(z_3) \cdot \sigma'(z_2) \cdot \sigma'(z_1)}_{\text{each} \leq 0.25 \implies \text{product} \leq 0.001} \cdot \ldots$$

**ReLU** solves this: its derivative is either 0 or 1, so gradients pass through unchanged (as long as the neuron is active).

<div class="interactive-demo" id="demo-vanishing">
  <div class="demo-split">
    <div>
      <canvas id="canvas-vanish-sig" width="320" height="340"></canvas>
      <div class="demo-caption">Sigmoid (5 layers) -- gradients vanish</div>
    </div>
    <div>
      <canvas id="canvas-vanish-relu" width="320" height="340"></canvas>
      <div class="demo-caption">ReLU (5 layers) -- gradients stay strong</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btn-van-run">Run Comparison</button>
    <button id="btn-van-reset">Reset</button>
    <label>Layers <input type="range" id="van-layers" min="3" max="8" step="1" value="5"><span class="demo-value" id="val-van-layers">5</span></label>
  </div>
  <div class="demo-info" id="info-vanishing">Compare gradient magnitudes: Sigmoid vs ReLU. The bar chart shows average gradient per layer.</div>
</div>

<div class="demo-hint">This is why modern deep networks almost universally use ReLU or its variants (Leaky ReLU, GELU, Swish). The sigmoid is mostly confined to the output layer for binary classification.</div>

---

## 8. Computational Graph Builder

Build your own computational graph and watch backpropagation in action. Add input values, connect them through addition and multiplication nodes, then see gradients compute automatically.

<div class="interactive-demo" id="demo-builder">
  <canvas id="canvas-builder" width="680" height="400"></canvas>
  <div class="demo-controls">
    <button id="btn-bl-add">+ Add Node</button>
    <button id="btn-bl-mul">* Multiply Node</button>
    <button id="btn-bl-run">Compute</button>
    <button id="btn-bl-reset">Reset</button>
    <label>Expression:
      <button id="bl-expr1" class="active">(a+b)*c</button>
      <button id="bl-expr2">a*b + c*d</button>
      <button id="bl-expr3">sigmoid(a*b+c)</button>
    </label>
  </div>
  <div class="demo-info" id="info-builder">Select a preset expression or build your own. Forward values shown in blue, gradients in red.</div>
</div>
<div class="demo-caption">Each node shows its forward value (top) and gradient (bottom). Click "Compute" to run forward + backward.</div>

---

## 9. Backprop on a Real Task

Finally, let us put it all together. Watch a neural network train on a 2D classification task, seeing the complete cycle repeat: forward pass, loss, backward pass, weight update. The decision boundary evolves in real time.

<div class="interactive-demo" id="demo-real">
  <div class="demo-split">
    <div>
      <canvas id="canvas-real-boundary" width="320" height="320"></canvas>
      <div class="demo-caption">Decision boundary</div>
    </div>
    <div>
      <canvas id="canvas-real-loss" width="320" height="320"></canvas>
      <div class="demo-caption">Training loss</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Dataset:
      <button id="rl-ds-circle" class="active">Circle</button>
      <button id="rl-ds-spiral">Spiral</button>
      <button id="rl-ds-xor">XOR</button>
    </label>
    <label>LR <input type="range" id="rl-lr" min="0.1" max="3" step="0.1" value="1.0"><span class="demo-value" id="val-rl-lr">1.0</span></label>
  </div>
  <div class="demo-controls">
    <button id="btn-rl-train">Train</button>
    <button id="btn-rl-stop">Stop</button>
    <button id="btn-rl-reset">Reset</button>
    <span class="demo-value" id="rl-epoch">Epoch: 0</span>
    <span class="demo-value" id="rl-loss">Loss: --</span>
  </div>
  <div class="demo-info" id="info-real">Watch backpropagation train a network in real time. The decision boundary updates after each epoch.</div>
</div>
<div class="demo-caption">A 2-4-4-1 network trained with backpropagation. Watch the decision boundary evolve as gradients update weights.</div>

<div class="demo-hint">Try the spiral dataset -- it requires the network to learn a complex, winding boundary. If it gets stuck, reset and try a higher learning rate.</div>

---

## 10. Summary

| Concept | Key Idea |
|---|---|
| **Chain Rule** | Gradients propagate backward by multiplying local derivatives at each node. |
| **Forward Pass** | Data flows input to output, computing weighted sums and activations. |
| **Backward Pass** | Gradients flow output to input, applying the chain rule at every connection. |
| **Weight Update** | Each weight is nudged opposite to its gradient: $$w \leftarrow w - \eta \nabla_w L$$. |
| **Vanishing Gradients** | Sigmoid/tanh squash gradients exponentially with depth. ReLU preserves them. |
| **Computational Graph** | Any expression can be decomposed into a graph for automatic differentiation. |

Backpropagation is not just an algorithm -- it is a way of thinking about computation. Every modern deep learning framework (PyTorch, TensorFlow, JAX) is built around the idea of recording a computational graph during the forward pass and then traversing it backward to compute gradients automatically. This is called **automatic differentiation**, and backpropagation is its most important special case.

The time complexity of backpropagation is **O(n)** where n is the number of operations in the forward pass -- we traverse each edge exactly once going forward and once going backward. This efficiency is what makes training networks with millions of parameters practical.

**What's next:** In the [Activation & Loss Functions]({{ site.baseurl }}/activations-losses-interactive/) guide, we will explore -- dropout, weight decay, batch normalization -- and understand how they prevent overfitting and stabilize training.

---

<script>
// ==================== SHARED BACKPROP UTILITIES ====================
window.BP = (function() {
  function getColors() {
    var s = getComputedStyle(document.documentElement);
    return {
      bg: s.getPropertyValue('--bg-primary').trim() || '#1a1b26',
      bgSec: s.getPropertyValue('--bg-secondary').trim() || '#24283b',
      border: s.getPropertyValue('--border').trim() || '#414868',
      accent: s.getPropertyValue('--accent').trim() || '#7aa2f7',
      text: s.getPropertyValue('--text-primary').trim() || '#c0caf5',
      textSec: s.getPropertyValue('--text-secondary').trim() || '#565f89',
      forward: '#7aa2f7',
      forwardGlow: '#73daca',
      backward: '#f7768e',
      backwardGlow: '#ff9e64',
      positive: '#7aa2f7',
      negative: '#f7768e',
      green: '#73daca',
      purple: '#bb9af7',
      yellow: '#e0af68',
      waiting: '#565f89'
    };
  }

  function setupCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var w = parseInt(canvas.getAttribute('width'), 10);
    var h = parseInt(canvas.getAttribute('height'), 10);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx._w = w;
    ctx._h = h;
    return ctx;
  }

  function sigmoid(x) { return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))); }
  function sigmoidDeriv(a) { return a * (1 - a); }
  function relu(x) { return Math.max(0, x); }
  function reluDeriv(x) { return x > 0 ? 1 : 0; }
  function tanh_(x) { var e = Math.exp(2 * Math.max(-500, Math.min(500, x))); return (e - 1) / (e + 1); }
  function tanhDeriv(a) { return 1 - a * a; }

  function getActFn(name) {
    if (name === 'relu') return { fn: relu, deriv: reluDeriv, derivFromZ: true };
    if (name === 'tanh') return { fn: tanh_, deriv: tanhDeriv };
    return { fn: sigmoid, deriv: sigmoidDeriv };
  }

  // Simple MLP with stored intermediate values for visualization
  function MLP(sizes, actName) {
    this.sizes = sizes;
    this.L = sizes.length - 1;
    this.actName = actName || 'sigmoid';
    var act = getActFn(this.actName);
    this.actFn = act.fn;
    this.actDeriv = act.deriv;
    this.derivFromZ = act.derivFromZ || false;
    this.W = [];
    this.b = [];
    this.dW = [];
    this.db = [];
    for (var l = 0; l < this.L; l++) {
      var rows = sizes[l + 1], cols = sizes[l];
      var scale = Math.sqrt(2.0 / cols);
      var w = [], dw = [];
      for (var i = 0; i < rows; i++) {
        var row = [], drow = [];
        for (var j = 0; j < cols; j++) {
          row.push((Math.random() * 2 - 1) * scale);
          drow.push(0);
        }
        w.push(row);
        dw.push(drow);
      }
      this.W.push(w);
      this.dW.push(dw);
      var bb = [], dbb = [];
      for (var i = 0; i < rows; i++) { bb.push(0); dbb.push(0); }
      this.b.push(bb);
      this.db.push(dbb);
    }
  }

  MLP.prototype.forward = function(x) {
    var a = x.slice();
    this.as = [a.slice()];
    this.zs = [];
    for (var l = 0; l < this.L; l++) {
      var W = this.W[l], b = this.b[l];
      var z = [], newA = [];
      for (var i = 0; i < W.length; i++) {
        var s = b[i];
        for (var j = 0; j < W[i].length; j++) s += W[i][j] * a[j];
        z.push(s);
        if (l === this.L - 1) newA.push(sigmoid(s));
        else newA.push(this.actFn(s));
      }
      this.zs.push(z);
      a = newA;
      this.as.push(a.slice());
    }
    return a;
  };

  MLP.prototype.backward = function(target) {
    var deltas = [];
    for (var l = this.L - 1; l >= 0; l--) {
      var delta = [];
      if (l === this.L - 1) {
        for (var i = 0; i < this.as[l + 1].length; i++) {
          delta.push(this.as[l + 1][i] - target);
        }
      } else {
        var Wnext = this.W[l + 1];
        var dnext = deltas[0];
        for (var i = 0; i < this.as[l + 1].length; i++) {
          var err = 0;
          for (var j = 0; j < dnext.length; j++) err += Wnext[j][i] * dnext[j];
          var d_act;
          if (this.derivFromZ) d_act = reluDeriv(this.zs[l][i]);
          else if (this.actName === 'tanh') d_act = tanhDeriv(this.as[l + 1][i]);
          else d_act = sigmoidDeriv(this.as[l + 1][i]);
          delta.push(err * d_act);
        }
      }
      deltas.unshift(delta);
    }
    this.deltas = deltas;
    // Compute dW, db
    for (var l = 0; l < this.L; l++) {
      var d = deltas[l], aIn = this.as[l];
      for (var i = 0; i < this.W[l].length; i++) {
        for (var j = 0; j < this.W[l][i].length; j++) {
          this.dW[l][i][j] = d[i] * aIn[j];
        }
        this.db[l][i] = d[i];
      }
    }
    return deltas;
  };

  MLP.prototype.update = function(lr) {
    for (var l = 0; l < this.L; l++) {
      for (var i = 0; i < this.W[l].length; i++) {
        for (var j = 0; j < this.W[l][i].length; j++) {
          this.W[l][i][j] -= lr * this.dW[l][i][j];
        }
        this.b[l][i] -= lr * this.db[l][i];
      }
    }
  };

  MLP.prototype.trainBatch = function(X, y, lr, epochs) {
    var totalLoss = 0;
    for (var ep = 0; ep < epochs; ep++) {
      totalLoss = 0;
      for (var s = 0; s < X.length; s++) {
        var out = this.forward(X[s]);
        var target = y[s];
        totalLoss += -(target * Math.log(out[0] + 1e-15) + (1 - target) * Math.log(1 - out[0] + 1e-15));
        this.backward(target);
        this.update(lr);
      }
    }
    return totalLoss / X.length;
  };

  MLP.prototype.predict = function(x) { return this.forward(x)[0]; };

  // Datasets
  var datasets = {
    xor: function() { return { X: [[0,0],[0,1],[1,0],[1,1]], y: [0,1,1,0] }; },
    circle: function(n) {
      n = n || 100; var X = [], y = [];
      for (var i = 0; i < n; i++) {
        var r = Math.random() * 2, a = Math.random() * Math.PI * 2;
        var px = r * Math.cos(a) * 0.4 + 0.5, py = r * Math.sin(a) * 0.4 + 0.5;
        px = Math.max(0, Math.min(1, px)); py = Math.max(0, Math.min(1, py));
        X.push([px, py]); y.push(r < 1 ? 1 : 0);
      }
      return { X: X, y: y };
    },
    spiral: function(n) {
      n = n || 100; var X = [], y = [], half = Math.floor(n / 2);
      for (var c = 0; c < 2; c++) {
        for (var i = 0; i < half; i++) {
          var t = i / half * 2 * Math.PI + c * Math.PI;
          var r = (i / half) * 0.4 + 0.05;
          var px = r * Math.cos(t) + 0.5 + (Math.random() - 0.5) * 0.05;
          var py = r * Math.sin(t) + 0.5 + (Math.random() - 0.5) * 0.05;
          px = Math.max(0, Math.min(1, px)); py = Math.max(0, Math.min(1, py));
          X.push([px, py]); y.push(c);
        }
      }
      return { X: X, y: y };
    }
  };

  // Drawing helpers
  function drawNode(ctx, x, y, r, color, label, sublabel) {
    var c = getColors();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color + '33';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    if (label) {
      ctx.fillStyle = c.text;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, sublabel ? y - 7 : y);
    }
    if (sublabel) {
      ctx.fillStyle = c.textSec;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(sublabel, x, y + 8);
    }
  }

  function drawEdge(ctx, x1, y1, x2, y2, weight, maxW) {
    var c = getColors();
    maxW = maxW || 3;
    var lw = Math.min(6, Math.abs(weight) / maxW * 5 + 0.5);
    ctx.strokeStyle = weight >= 0 ? c.positive : c.negative;
    ctx.lineWidth = lw;
    ctx.globalAlpha = 0.6 + Math.min(0.4, Math.abs(weight) / maxW * 0.4);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawParticle(ctx, x, y, color, radius) {
    radius = radius || 4;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Network layout helper
  function getNetworkLayout(sizes, w, h, padX, padY) {
    padX = padX || 80;
    padY = padY || 40;
    var layers = [];
    var layerSpacing = (w - 2 * padX) / (sizes.length - 1);
    for (var l = 0; l < sizes.length; l++) {
      var nodes = [];
      var n = sizes[l];
      var totalH = h - 2 * padY;
      var nodeSpacing = n > 1 ? totalH / (n - 1) : 0;
      var startY = n > 1 ? padY : h / 2;
      for (var i = 0; i < n; i++) {
        nodes.push({ x: padX + l * layerSpacing, y: startY + i * nodeSpacing });
      }
      layers.push(nodes);
    }
    return layers;
  }

  function drawDecisionBoundary(ctx, net, w, h, res) {
    res = res || 3;
    var img = ctx.createImageData(Math.ceil(w / res), Math.ceil(h / res));
    for (var py = 0; py < h; py += res) {
      for (var px = 0; px < w; px += res) {
        var nx = px / w, ny = 1 - py / h;
        var out = net.predict([nx, ny]);
        var r, g, b;
        if (out > 0.5) { r = 247; g = 118; b = 142; }
        else { r = 122; g = 162; b = 247; }
        var alpha = Math.abs(out - 0.5) * 0.6 + 0.05;
        var idx = 4 * (Math.floor(py / res) * Math.ceil(w / res) + Math.floor(px / res));
        img.data[idx] = r; img.data[idx + 1] = g; img.data[idx + 2] = b; img.data[idx + 3] = Math.floor(alpha * 255);
      }
    }
    var tmp = document.createElement('canvas');
    tmp.width = Math.ceil(w / res); tmp.height = Math.ceil(h / res);
    tmp.getContext('2d').putImageData(img, 0, 0);
    ctx.drawImage(tmp, 0, 0, w, h);
  }

  function drawPoints(ctx, X, y, w, h, radius) {
    radius = radius || 5;
    var c = getColors();
    for (var i = 0; i < X.length; i++) {
      var px = X[i][0] * w, py = (1 - X[i][1]) * h;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = y[i] === 1 ? c.backward : c.forward;
      ctx.fill();
      ctx.strokeStyle = c.text;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function drawLossCurve(ctx, losses, w, h) {
    var c = getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);
    if (losses.length < 2) {
      ctx.fillStyle = c.textSec; ctx.font = '13px sans-serif';
      ctx.textAlign = 'center'; ctx.fillText('Loss curve appears during training', w / 2, h / 2);
      return;
    }
    var pad = 40;
    var maxL = Math.max.apply(null, losses);
    var minL = Math.min.apply(null, losses);
    if (maxL === minL) maxL = minL + 1;
    ctx.strokeStyle = c.border; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, 10); ctx.lineTo(pad, h - pad); ctx.lineTo(w - 10, h - pad); ctx.stroke();
    ctx.fillStyle = c.textSec; ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(maxL.toFixed(2), pad - 4, 16);
    ctx.fillText(minL.toFixed(2), pad - 4, h - pad);
    ctx.textAlign = 'center';
    ctx.fillText('Epoch', w / 2, h - 5);
    ctx.strokeStyle = c.accent; ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < losses.length; i++) {
      var x = pad + i / (losses.length - 1) * (w - pad - 10);
      var y_ = 10 + (1 - (losses[i] - minL) / (maxL - minL)) * (h - pad - 10);
      if (i === 0) ctx.moveTo(x, y_); else ctx.lineTo(x, y_);
    }
    ctx.stroke();
  }

  // Theme observer
  var themeCallbacks = [];
  function onThemeChange(fn) { themeCallbacks.push(fn); }
  var obs = new MutationObserver(function() { for (var i = 0; i < themeCallbacks.length; i++) themeCallbacks[i](); });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

  return {
    getColors: getColors,
    setupCanvas: setupCanvas,
    sigmoid: sigmoid,
    sigmoidDeriv: sigmoidDeriv,
    relu: relu,
    reluDeriv: reluDeriv,
    tanh: tanh_,
    tanhDeriv: tanhDeriv,
    getActFn: getActFn,
    MLP: MLP,
    datasets: datasets,
    drawNode: drawNode,
    drawEdge: drawEdge,
    drawParticle: drawParticle,
    lerp: lerp,
    getNetworkLayout: getNetworkLayout,
    drawDecisionBoundary: drawDecisionBoundary,
    drawPoints: drawPoints,
    drawLossCurve: drawLossCurve,
    onThemeChange: onThemeChange
  };
})();
</script>

<!-- ==================== DEMO 1: Chain Rule Computational Graph ==================== -->
<script>
(function() {
  var canvas = document.getElementById('canvas-chain');
  var ctx = BP.setupCanvas(canvas);
  var W = 680, H = 360;
  var slX = document.getElementById('chain-x');
  var slY = document.getElementById('chain-y');
  var slZ = document.getElementById('chain-z');
  var valX = document.getElementById('val-chain-x');
  var valY = document.getElementById('val-chain-y');
  var valZ = document.getElementById('val-chain-z');
  var infoEl = document.getElementById('info-chain');
  var selectedNode = -1;

  // Node positions
  var nodes = [
    { x: 80, y: 100, label: 'x', type: 'input' },
    { x: 80, y: 260, label: 'y', type: 'input' },
    { x: 250, y: 180, label: '+', type: 'op' },
    { x: 80, y: 180, label: 'z', type: 'input' },
    { x: 440, y: 180, label: '*', type: 'op' },
    { x: 600, y: 180, label: 'f', type: 'output' }
  ];
  // Edges: from -> to
  var edges = [
    [0, 2], [1, 2], [2, 4], [3, 4], [4, 5]
  ];

  function compute() {
    var x = parseFloat(slX.value);
    var y = parseFloat(slY.value);
    var z = parseFloat(slZ.value);
    var q = x + y;
    var f = q * z;
    // Forward values
    var vals = [x, y, q, z, f, f];
    // Backward gradients: df/d(node)
    var grads = [z, z, z, q, 1, 1];
    return { vals: vals, grads: grads, x: x, y: y, z: z, q: q, f: f };
  }

  function draw() {
    var c = BP.getColors();
    var data = compute();
    valX.textContent = data.x.toFixed(1);
    valY.textContent = data.y.toFixed(1);
    valZ.textContent = data.z.toFixed(1);

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Draw edges
    for (var i = 0; i < edges.length; i++) {
      var from = nodes[edges[i][0]], to = nodes[edges[i][1]];
      ctx.strokeStyle = c.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(from.x + 25, from.y);
      ctx.lineTo(to.x - 25, to.y);
      ctx.stroke();
      // Forward value on edge
      var mx = (from.x + to.x) / 2;
      var my = (from.y + to.y) / 2 - 12;
      ctx.fillStyle = c.forward;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(data.vals[edges[i][0]].toFixed(1), mx, my);
      // Gradient on edge
      ctx.fillStyle = c.backward;
      ctx.fillText('\u2207=' + data.grads[edges[i][0]].toFixed(1), mx, my + 24);
      // Arrow
      var angle = Math.atan2(to.y - from.y, to.x - from.x);
      var ax = to.x - 25, ay = to.y;
      ctx.fillStyle = c.border;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 8 * Math.cos(angle - 0.3), ay - 8 * Math.sin(angle - 0.3));
      ctx.lineTo(ax - 8 * Math.cos(angle + 0.3), ay - 8 * Math.sin(angle + 0.3));
      ctx.fill();
    }

    // Draw nodes
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var color = n.type === 'input' ? c.forward : n.type === 'output' ? c.green : c.purple;
      if (i === selectedNode) color = c.yellow;
      var r = 24;
      BP.drawNode(ctx, n.x, n.y, r, color, n.label);
      // Value below node
      ctx.fillStyle = c.forward;
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('=' + data.vals[i].toFixed(1), n.x, n.y + 38);
      // Gradient above node
      ctx.fillStyle = c.backward;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText('\u2202f/\u2202' + n.label + '=' + data.grads[i].toFixed(1), n.x, n.y - 34);
    }

    // Info text for selected node
    if (selectedNode >= 0) {
      var sn = nodes[selectedNode];
      var txt = '';
      if (selectedNode === 0) txt = 'df/dx = df/dq * dq/dx = ' + data.z.toFixed(1) + ' * 1 = ' + data.grads[0].toFixed(1);
      else if (selectedNode === 1) txt = 'df/dy = df/dq * dq/dy = ' + data.z.toFixed(1) + ' * 1 = ' + data.grads[1].toFixed(1);
      else if (selectedNode === 2) txt = 'q = x + y = ' + data.x.toFixed(1) + ' + ' + data.y.toFixed(1) + ' = ' + data.q.toFixed(1) + ' | df/dq = z = ' + data.z.toFixed(1);
      else if (selectedNode === 3) txt = 'df/dz = q = ' + data.q.toFixed(1);
      else if (selectedNode === 4) txt = 'f = q * z = ' + data.q.toFixed(1) + ' * ' + data.z.toFixed(1) + ' = ' + data.f.toFixed(1);
      else if (selectedNode === 5) txt = 'f = ' + data.f.toFixed(1) + ' | df/df = 1 (output node)';
      infoEl.textContent = txt;
    } else {
      infoEl.textContent = 'f(' + data.x.toFixed(1) + ',' + data.y.toFixed(1) + ',' + data.z.toFixed(1) + ') = (' + data.x.toFixed(1) + '+' + data.y.toFixed(1) + ')*' + data.z.toFixed(1) + ' = ' + data.f.toFixed(1) + '. Click a node to see the chain rule.';
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var mx = (e.clientX - rect.left) * (W / rect.width);
    var my = (e.clientY - rect.top) * (H / rect.height);
    selectedNode = -1;
    for (var i = 0; i < nodes.length; i++) {
      var dx = mx - nodes[i].x, dy = my - nodes[i].y;
      if (dx * dx + dy * dy < 30 * 30) { selectedNode = i; break; }
    }
    draw();
  });

  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var t = e.touches[0];
    var rect = canvas.getBoundingClientRect();
    var mx = (t.clientX - rect.left) * (W / rect.width);
    var my = (t.clientY - rect.top) * (H / rect.height);
    selectedNode = -1;
    for (var i = 0; i < nodes.length; i++) {
      var dx = mx - nodes[i].x, dy = my - nodes[i].y;
      if (dx * dx + dy * dy < 30 * 30) { selectedNode = i; break; }
    }
    draw();
  });

  slX.addEventListener('input', draw);
  slY.addEventListener('input', draw);
  slZ.addEventListener('input', draw);
  draw();
  BP.onThemeChange(draw);
})();
</script>

<!-- ==================== DEMO 2: Forward Pass Animation ==================== -->
<script>
(function() {
  var canvas = document.getElementById('canvas-forward');
  var ctx = BP.setupCanvas(canvas);
  var W = 680, H = 400;
  var slX1 = document.getElementById('fwd-x1');
  var slX2 = document.getElementById('fwd-x2');
  var slSpeed = document.getElementById('fwd-speed');
  var valX1 = document.getElementById('val-fwd-x1');
  var valX2 = document.getElementById('val-fwd-x2');
  var valSpeed = document.getElementById('val-fwd-speed');
  var btnPlay = document.getElementById('btn-fwd-play');
  var btnReset = document.getElementById('btn-fwd-reset');
  var infoEl = document.getElementById('info-forward');

  var sizes = [2, 3, 2, 1];
  var net = new BP.MLP(sizes, 'sigmoid');
  // Set fixed weights for reproducibility
  net.W[0] = [[0.6, -0.4], [0.3, 0.8], [-0.5, 0.7]];
  net.b[0] = [0.1, -0.2, 0.3];
  net.W[1] = [[0.5, -0.3, 0.7], [-0.6, 0.4, 0.2]];
  net.b[1] = [0.1, -0.1];
  net.W[2] = [[0.8, -0.5]];
  net.b[2] = [0.2];

  var layout = BP.getNetworkLayout(sizes, W, H, 90, 60);
  var animState = 'idle'; // idle, animating, done
  var animLayer = 0;
  var animNeuron = 0;
  var animT = 0;
  var litNodes = []; // [layer][neuron] = true
  var animId = null;

  function resetLit() {
    litNodes = [];
    for (var l = 0; l < sizes.length; l++) {
      litNodes.push([]);
      for (var n = 0; n < sizes[l]; n++) litNodes[l].push(false);
    }
  }
  resetLit();

  function drawNetwork(showValues) {
    var c = BP.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Layer labels
    var labels = ['Input', 'Hidden 1', 'Hidden 2', 'Output'];
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    for (var l = 0; l < layout.length; l++) {
      ctx.fillStyle = c.textSec;
      ctx.fillText(labels[l], layout[l][0].x, 25);
    }

    // Edges
    for (var l = 0; l < sizes.length - 1; l++) {
      for (var i = 0; i < sizes[l + 1]; i++) {
        for (var j = 0; j < sizes[l]; j++) {
          var from = layout[l][j], to = layout[l + 1][i];
          BP.drawEdge(ctx, from.x + 20, from.y, to.x - 20, to.y, net.W[l][i][j], 1);
        }
      }
    }

    // Nodes
    for (var l = 0; l < sizes.length; l++) {
      for (var n = 0; n < sizes[l]; n++) {
        var pos = layout[l][n];
        var lit = litNodes[l][n];
        var color = lit ? c.forwardGlow : c.waiting;
        if (l === 0) color = c.forward;
        var r = 20;
        var label = '';
        var sublabel = '';
        if (showValues && net.as && net.as[l]) {
          label = net.as[l][n] !== undefined ? net.as[l][n].toFixed(2) : '';
        }
        if (l === 0) {
          label = l === 0 && n === 0 ? 'x\u2081' : 'x\u2082';
          sublabel = net.as ? net.as[0][n].toFixed(2) : '';
        }
        BP.drawNode(ctx, pos.x, pos.y, r, color, label, sublabel);
        if (showValues && l > 0 && net.as && net.as[l]) {
          ctx.fillStyle = c.text;
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('a=' + net.as[l][n].toFixed(3), pos.x, pos.y + 32);
        }
      }
    }

    // Particle animation
    if (animState === 'animating' && animLayer < sizes.length - 1) {
      var fromNodes = layout[animLayer];
      var toNode = layout[animLayer + 1][animNeuron];
      for (var j = 0; j < fromNodes.length; j++) {
        var fx = fromNodes[j].x + 20, fy = fromNodes[j].y;
        var tx = toNode.x - 20, ty = toNode.y;
        var px = BP.lerp(fx, tx, animT);
        var py = BP.lerp(fy, ty, animT);
        BP.drawParticle(ctx, px, py, c.forwardGlow, 5);
      }
    }
  }

  function startAnim() {
    if (animState === 'animating') return;
    var x1 = parseFloat(slX1.value);
    var x2 = parseFloat(slX2.value);
    net.forward([x1, x2]);
    resetLit();
    litNodes[0][0] = true;
    litNodes[0][1] = true;
    animState = 'animating';
    animLayer = 0;
    animNeuron = 0;
    animT = 0;
    animate();
  }

  function animate() {
    if (animState !== 'animating') return;
    var speed = parseInt(slSpeed.value) * 0.02;
    animT += speed;
    if (animT >= 1) {
      litNodes[animLayer + 1][animNeuron] = true;
      animNeuron++;
      if (animNeuron >= sizes[animLayer + 1]) {
        animNeuron = 0;
        animLayer++;
        if (animLayer >= sizes.length - 1) {
          animState = 'done';
          infoEl.textContent = 'Forward pass complete. Output = ' + net.as[net.as.length - 1][0].toFixed(4);
          drawNetwork(true);
          return;
        }
      }
      animT = 0;
    }
    var layerName = animLayer === 0 ? 'Hidden 1' : animLayer === 1 ? 'Hidden 2' : 'Output';
    infoEl.textContent = 'Computing ' + layerName + ' neuron ' + (animNeuron + 1) + '...';
    drawNetwork(true);
    animId = requestAnimationFrame(animate);
  }

  function reset() {
    if (animId) cancelAnimationFrame(animId);
    animState = 'idle';
    resetLit();
    litNodes[0][0] = true;
    litNodes[0][1] = true;
    var x1 = parseFloat(slX1.value);
    var x2 = parseFloat(slX2.value);
    net.forward([x1, x2]);
    infoEl.textContent = 'Click "Play Forward" to animate data flowing through the network.';
    drawNetwork(false);
  }

  btnPlay.addEventListener('click', startAnim);
  btnReset.addEventListener('click', reset);
  slX1.addEventListener('input', function() { valX1.textContent = parseFloat(slX1.value).toFixed(1); reset(); });
  slX2.addEventListener('input', function() { valX2.textContent = parseFloat(slX2.value).toFixed(1); reset(); });
  slSpeed.addEventListener('input', function() { valSpeed.textContent = slSpeed.value; });

  reset();
  BP.onThemeChange(function() { drawNetwork(animState === 'done'); });
})();
</script>

<!-- ==================== DEMO 3: Backward Pass Animation ==================== -->
<script>
(function() {
  var canvas = document.getElementById('canvas-backward');
  var ctx = BP.setupCanvas(canvas);
  var W = 680, H = 420;
  var btnFwd = document.getElementById('btn-bk-forward');
  var btnBk = document.getElementById('btn-bk-backward');
  var btnReset = document.getElementById('btn-bk-reset');
  var slSpeed = document.getElementById('bk-speed');
  var valSpeed = document.getElementById('val-bk-speed');
  var infoEl = document.getElementById('info-backward');

  var sizes = [2, 3, 2, 1];
  var net = new BP.MLP(sizes, 'sigmoid');
  net.W[0] = [[0.6, -0.4], [0.3, 0.8], [-0.5, 0.7]];
  net.b[0] = [0.1, -0.2, 0.3];
  net.W[1] = [[0.5, -0.3, 0.7], [-0.6, 0.4, 0.2]];
  net.b[1] = [0.1, -0.1];
  net.W[2] = [[0.8, -0.5]];
  net.b[2] = [0.2];

  var layout = BP.getNetworkLayout(sizes, W, H - 40, 90, 70);
  var phase = 'idle'; // idle, forward-done, animating-back, done
  var animLayer = 0, animNeuron = 0, animT = 0;
  var litFwd = [], litBk = [];
  var animId = null;
  var target = 1;

  function resetLit() {
    litFwd = []; litBk = [];
    for (var l = 0; l < sizes.length; l++) {
      litFwd.push([]); litBk.push([]);
      for (var n = 0; n < sizes[l]; n++) { litFwd[l].push(false); litBk[l].push(false); }
    }
  }
  resetLit();

  function drawNet() {
    var c = BP.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var labels = ['Input', 'Hidden 1', 'Hidden 2', 'Output'];
    ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    for (var l = 0; l < layout.length; l++) {
      ctx.fillStyle = c.textSec;
      ctx.fillText(labels[l], layout[l][0].x, 20);
    }

    // Edges
    for (var l = 0; l < sizes.length - 1; l++) {
      for (var i = 0; i < sizes[l + 1]; i++) {
        for (var j = 0; j < sizes[l]; j++) {
          var from = layout[l][j], to = layout[l + 1][i];
          BP.drawEdge(ctx, from.x + 20, from.y, to.x - 20, to.y, net.W[l][i][j], 1);
          // Show gradient on edge if backward done for this layer
          if (phase === 'done' || (phase === 'animating-back' && l >= animLayer + 1) ||
              (phase === 'animating-back' && l === animLayer && litBk[l + 1][i])) {
            if (net.dW && net.dW[l]) {
              var mx = (from.x + to.x) / 2;
              var my = (from.y + to.y) / 2;
              ctx.fillStyle = c.backward;
              ctx.font = '9px JetBrains Mono, monospace';
              ctx.textAlign = 'center';
              ctx.fillText('\u2207w=' + net.dW[l][i][j].toFixed(3), mx, my - 4);
            }
          }
        }
      }
    }

    // Nodes
    for (var l = 0; l < sizes.length; l++) {
      for (var n = 0; n < sizes[l]; n++) {
        var pos = layout[l][n];
        var color = c.waiting;
        if (litFwd[l][n]) color = c.forwardGlow;
        if (litBk[l][n]) color = c.backward;
        if (l === 0 && litFwd[l][n]) color = c.forward;
        var label = '';
        if (l === 0) label = n === 0 ? 'x\u2081' : 'x\u2082';
        if (l === sizes.length - 1) label = 'out';
        BP.drawNode(ctx, pos.x, pos.y, 20, color, label);

        // Forward value
        if (litFwd[l][n] && net.as && net.as[l]) {
          ctx.fillStyle = c.forward;
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('a=' + net.as[l][n].toFixed(3), pos.x, pos.y + 32);
        }
        // Backward gradient
        if (litBk[l][n] && net.deltas) {
          var grad = 0;
          if (l === sizes.length - 1) grad = net.as[l][0] - target;
          else if (l > 0 && net.deltas[l - 1]) grad = net.deltas[l - 1][n];
          ctx.fillStyle = c.backward;
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('\u03B4=' + grad.toFixed(3), pos.x, pos.y - 28);
        }
      }
    }

    // Backward particles
    if (phase === 'animating-back' && animLayer >= 0) {
      var toNodes = layout[animLayer];
      var fromNode = layout[animLayer + 1][animNeuron];
      for (var j = 0; j < toNodes.length; j++) {
        var fx = fromNode.x - 20, fy = fromNode.y;
        var tx = toNodes[j].x + 20, ty = toNodes[j].y;
        var px = BP.lerp(fx, tx, animT);
        var py = BP.lerp(fy, ty, animT);
        BP.drawParticle(ctx, px, py, c.backwardGlow, 5);
      }
    }

    // Loss display
    if (phase !== 'idle' && net.as) {
      var out = net.as[net.as.length - 1][0];
      var loss = -(target * Math.log(out + 1e-15) + (1 - target) * Math.log(1 - out + 1e-15));
      ctx.fillStyle = c.yellow;
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('Loss = ' + loss.toFixed(4), W - 20, H - 10);
      ctx.fillText('Target = ' + target, W - 20, H - 28);
    }
  }

  function doForward() {
    if (animId) cancelAnimationFrame(animId);
    net.forward([0.5, -0.3]);
    resetLit();
    for (var l = 0; l < sizes.length; l++)
      for (var n = 0; n < sizes[l]; n++) litFwd[l][n] = true;
    phase = 'forward-done';
    infoEl.textContent = 'Forward pass done. Output = ' + net.as[net.as.length - 1][0].toFixed(4) + '. Now click "2. Backward".';
    drawNet();
  }

  function startBackward() {
    if (phase !== 'forward-done') { infoEl.textContent = 'Run forward first!'; return; }
    net.backward(target);
    litBk[sizes.length - 1][0] = true;
    phase = 'animating-back';
    animLayer = sizes.length - 2;
    animNeuron = 0;
    animT = 0;
    animateBack();
  }

  function animateBack() {
    if (phase !== 'animating-back') return;
    var speed = parseInt(slSpeed.value) * 0.02;
    animT += speed;
    if (animT >= 1) {
      // Light up target nodes
      for (var j = 0; j < sizes[animLayer]; j++) litBk[animLayer][j] = true;
      animNeuron++;
      if (animNeuron >= sizes[animLayer + 1]) {
        animNeuron = 0;
        animLayer--;
        if (animLayer < 0) {
          phase = 'done';
          infoEl.textContent = 'Backward pass complete! All gradients computed. Each \u03B4 shows the error signal at that neuron.';
          drawNet();
          return;
        }
      }
      animT = 0;
    }
    infoEl.textContent = 'Backpropagating through layer ' + (animLayer + 1) + '...';
    drawNet();
    animId = requestAnimationFrame(animateBack);
  }

  function reset() {
    if (animId) cancelAnimationFrame(animId);
    phase = 'idle';
    resetLit();
    infoEl.textContent = 'Click "1. Forward" to start.';
    drawNet();
  }

  btnFwd.addEventListener('click', doForward);
  btnBk.addEventListener('click', startBackward);
  btnReset.addEventListener('click', reset);
  slSpeed.addEventListener('input', function() { valSpeed.textContent = slSpeed.value; });
  reset();
  BP.onThemeChange(function() { drawNet(); });
})();
</script>

<!-- ==================== DEMO 4: Full Forward + Backward Cycle ==================== -->
<script>
(function() {
  var canvas = document.getElementById('canvas-cycle');
  var ctx = BP.setupCanvas(canvas);
  var W = 680, H = 420;
  var btnPlay = document.getElementById('btn-cy-play');
  var btnStep = document.getElementById('btn-cy-step');
  var btnReset = document.getElementById('btn-cy-reset');
  var slSpeed = document.getElementById('cy-speed');
  var valSpeed = document.getElementById('val-cy-speed');
  var phaseEl = document.getElementById('cy-phase');
  var infoEl = document.getElementById('info-cycle');

  var sizes = [2, 3, 1];
  var net = new BP.MLP(sizes, 'sigmoid');
  net.W[0] = [[0.5, -0.3], [0.8, 0.2], [-0.4, 0.6]];
  net.b[0] = [0.1, -0.1, 0.2];
  net.W[1] = [[0.7, -0.5, 0.3]];
  net.b[1] = [0.1];

  var layout = BP.getNetworkLayout(sizes, W, H - 40, 120, 80);
  var phase = 'ready'; // ready, forward, loss, backward, update, done
  var stepIdx = 0;
  var animT = 0;
  var animLayer = 0, animNeuron = 0;
  var litFwd = [], litBk = [];
  var animId = null;
  var playing = false;
  var target = 1;
  var input = [0.8, 0.4];

  function resetLit() {
    litFwd = []; litBk = [];
    for (var l = 0; l < sizes.length; l++) {
      litFwd.push([]); litBk.push([]);
      for (var n = 0; n < sizes[l]; n++) { litFwd[l].push(l === 0); litBk[l].push(false); }
    }
  }
  resetLit();

  function drawNet() {
    var c = BP.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var labels = ['Input', 'Hidden', 'Output'];
    ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    for (var l = 0; l < layout.length; l++) {
      ctx.fillStyle = c.textSec;
      ctx.fillText(labels[l], layout[l][0].x, 25);
    }

    // Edges with thickness
    for (var l = 0; l < sizes.length - 1; l++) {
      for (var i = 0; i < sizes[l + 1]; i++) {
        for (var j = 0; j < sizes[l]; j++) {
          var from = layout[l][j], to = layout[l + 1][i];
          BP.drawEdge(ctx, from.x + 22, from.y, to.x - 22, to.y, net.W[l][i][j], 1);
        }
      }
    }

    // Nodes
    for (var l = 0; l < sizes.length; l++) {
      for (var n = 0; n < sizes[l]; n++) {
        var pos = layout[l][n];
        var color = c.waiting;
        if (litFwd[l][n] && !litBk[l][n]) color = c.forwardGlow;
        if (litBk[l][n]) color = c.backward;
        if (l === 0) color = c.forward;
        if (phase === 'update') color = c.green;
        BP.drawNode(ctx, pos.x, pos.y, 22, color, '');
        if (net.as && net.as[l]) {
          ctx.fillStyle = c.text; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
          ctx.fillText(net.as[l][n].toFixed(3), pos.x, pos.y + 4);
        }
      }
    }

    // Phase indicator
    var phaseColors = { ready: c.textSec, forward: c.forward, loss: c.yellow, backward: c.backward, update: c.green, done: c.green };
    ctx.fillStyle = phaseColors[phase] || c.textSec;
    ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Phase: ' + phase.toUpperCase(), W / 2, H - 10);

    // Forward particles
    if (phase === 'forward' && animLayer < sizes.length - 1) {
      var fromNodes = layout[animLayer];
      var toNode = layout[animLayer + 1][animNeuron];
      for (var j = 0; j < fromNodes.length; j++) {
        var px = BP.lerp(fromNodes[j].x + 22, toNode.x - 22, animT);
        var py = BP.lerp(fromNodes[j].y, toNode.y, animT);
        BP.drawParticle(ctx, px, py, c.forwardGlow, 5);
      }
    }

    // Backward particles
    if (phase === 'backward' && animLayer >= 0 && animLayer < sizes.length - 1) {
      var fromNode = layout[animLayer + 1][animNeuron];
      var toNodes = layout[animLayer];
      for (var j = 0; j < toNodes.length; j++) {
        var px = BP.lerp(fromNode.x - 22, toNodes[j].x + 22, animT);
        var py = BP.lerp(fromNode.y, toNodes[j].y, animT);
        BP.drawParticle(ctx, px, py, c.backwardGlow, 5);
      }
    }
  }

  function stepForward() {
    phase = 'forward';
    phaseEl.textContent = 'Phase: Forward';
    net.forward(input);
    animLayer = 0; animNeuron = 0; animT = 0;
    animateFwd();
  }

  function animateFwd() {
    if (phase !== 'forward') return;
    var speed = parseInt(slSpeed.value) * 0.025;
    animT += speed;
    if (animT >= 1) {
      litFwd[animLayer + 1][animNeuron] = true;
      animNeuron++;
      if (animNeuron >= sizes[animLayer + 1]) {
        animNeuron = 0; animLayer++;
        if (animLayer >= sizes.length - 1) {
          phase = 'loss';
          phaseEl.textContent = 'Phase: Loss';
          var out = net.as[net.as.length - 1][0];
          var loss = -(target * Math.log(out + 1e-15) + (1 - target) * Math.log(1 - out + 1e-15));
          infoEl.textContent = 'Loss = ' + loss.toFixed(4);
          drawNet();
          if (playing) setTimeout(function() { stepBackward(); }, 600);
          return;
        }
      }
      animT = 0;
    }
    drawNet();
    animId = requestAnimationFrame(animateFwd);
  }

  function stepBackward() {
    phase = 'backward';
    phaseEl.textContent = 'Phase: Backward';
    net.backward(target);
    litBk[sizes.length - 1][0] = true;
    animLayer = sizes.length - 2; animNeuron = 0; animT = 0;
    animateBack();
  }

  function animateBack() {
    if (phase !== 'backward') return;
    var speed = parseInt(slSpeed.value) * 0.025;
    animT += speed;
    if (animT >= 1) {
      for (var j = 0; j < sizes[animLayer]; j++) litBk[animLayer][j] = true;
      animNeuron++;
      if (animNeuron >= sizes[animLayer + 1]) {
        animNeuron = 0; animLayer--;
        if (animLayer < 0) {
          phase = 'update';
          phaseEl.textContent = 'Phase: Update';
          net.update(0.5);
          infoEl.textContent = 'Weights updated! Cycle complete.';
          drawNet();
          if (playing) setTimeout(function() { phase = 'done'; phaseEl.textContent = 'Phase: Done'; playing = false; drawNet(); }, 800);
          return;
        }
      }
      animT = 0;
    }
    drawNet();
    animId = requestAnimationFrame(animateBack);
  }

  function doStep() {
    if (animId) cancelAnimationFrame(animId);
    if (phase === 'ready') stepForward();
    else if (phase === 'loss') stepBackward();
    else if (phase === 'update' || phase === 'done') {
      phase = 'done'; phaseEl.textContent = 'Phase: Done';
      infoEl.textContent = 'Cycle complete. Click Reset to start again.';
    }
  }

  function doPlay() {
    if (animId) cancelAnimationFrame(animId);
    playing = true;
    resetState();
    stepForward();
  }

  function resetState() {
    if (animId) cancelAnimationFrame(animId);
    phase = 'ready';
    playing = false;
    resetLit();
    phaseEl.textContent = 'Phase: Ready';
    infoEl.textContent = 'Click Play or Step to begin the cycle.';
    drawNet();
  }

  btnPlay.addEventListener('click', doPlay);
  btnStep.addEventListener('click', doStep);
  btnReset.addEventListener('click', resetState);
  slSpeed.addEventListener('input', function() { valSpeed.textContent = slSpeed.value; });
  resetState();
  BP.onThemeChange(function() { drawNet(); });
})();
</script>

<!-- ==================== DEMO 5: Weight Update Visualization ==================== -->
<script>
(function() {
  var canvas = document.getElementById('canvas-weights');
  var ctx = BP.setupCanvas(canvas);
  var W = 680, H = 400;
  var btnTrain = document.getElementById('btn-wt-train');
  var btnReset = document.getElementById('btn-wt-reset');
  var slLR = document.getElementById('wt-lr');
  var valLR = document.getElementById('val-wt-lr');
  var epochEl = document.getElementById('wt-epoch');
  var infoEl = document.getElementById('info-weights');

  var sizes = [2, 4, 1];
  var net, step;
  var data = { X: [[0,0],[0,1],[1,0],[1,1]], y: [0,1,1,0] };
  var layout = BP.getNetworkLayout(sizes, W, H, 100, 50);

  function initNet() {
    net = new BP.MLP(sizes, 'sigmoid');
    step = 0;
  }
  initNet();

  function drawNet() {
    var c = BP.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Find max weight for scaling
    var maxW = 0.1;
    for (var l = 0; l < net.W.length; l++)
      for (var i = 0; i < net.W[l].length; i++)
        for (var j = 0; j < net.W[l][i].length; j++)
          maxW = Math.max(maxW, Math.abs(net.W[l][i][j]));

    // Edges
    for (var l = 0; l < sizes.length - 1; l++) {
      for (var i = 0; i < sizes[l + 1]; i++) {
        for (var j = 0; j < sizes[l]; j++) {
          var from = layout[l][j], to = layout[l + 1][i];
          var w = net.W[l][i][j];
          var lw = Math.abs(w) / maxW * 6 + 0.5;
          ctx.strokeStyle = w >= 0 ? c.positive : c.negative;
          ctx.lineWidth = lw;
          ctx.globalAlpha = 0.4 + Math.abs(w) / maxW * 0.6;
          ctx.beginPath();
          ctx.moveTo(from.x + 22, from.y);
          ctx.lineTo(to.x - 22, to.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
          // Weight label
          var mx = (from.x + to.x) / 2 + (j % 2 === 0 ? -20 : 20);
          var my = (from.y + to.y) / 2;
          ctx.fillStyle = c.textSec;
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(w.toFixed(2), mx, my);
        }
      }
    }

    // Nodes
    var labels = ['Input', 'Hidden', 'Output'];
    ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    for (var l = 0; l < sizes.length; l++) {
      ctx.fillStyle = c.textSec;
      ctx.fillText(labels[l], layout[l][0].x, 25);
      for (var n = 0; n < sizes[l]; n++) {
        var pos = layout[l][n];
        var color = l === 0 ? c.forward : l === sizes.length - 1 ? c.green : c.purple;
        BP.drawNode(ctx, pos.x, pos.y, 20, color, '');
        // Bias
        if (l > 0) {
          ctx.fillStyle = c.textSec;
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.fillText('b=' + net.b[l - 1][n].toFixed(2), pos.x, pos.y + 30);
        }
      }
    }

    // Predictions
    ctx.fillStyle = c.text;
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    var px = W - 160, py = 50;
    ctx.fillText('Predictions (XOR):', px, py);
    for (var i = 0; i < data.X.length; i++) {
      var pred = net.predict(data.X[i]);
      var correct = Math.round(pred) === data.y[i];
      ctx.fillStyle = correct ? c.green : c.backward;
      ctx.fillText('[' + data.X[i] + '] \u2192 ' + pred.toFixed(3) + (correct ? ' \u2713' : ' \u2717'), px, py + 22 + i * 20);
    }
  }

  function trainStep() {
    var lr = parseFloat(slLR.value);
    for (var i = 0; i < 10; i++) {
      net.trainBatch(data.X, data.y, lr, 1);
      step++;
    }
    epochEl.textContent = 'Step: ' + step;
    var loss = 0;
    for (var i = 0; i < data.X.length; i++) {
      var out = net.predict(data.X[i]);
      loss += -(data.y[i] * Math.log(out + 1e-15) + (1 - data.y[i]) * Math.log(1 - out + 1e-15));
    }
    infoEl.textContent = 'Loss: ' + (loss / 4).toFixed(4) + '. Watch edge thickness and color change.';
    drawNet();
  }

  function reset() {
    initNet();
    epochEl.textContent = 'Step: 0';
    infoEl.textContent = 'Edge thickness = weight magnitude. Blue = positive, red = negative.';
    drawNet();
  }

  btnTrain.addEventListener('click', trainStep);
  btnReset.addEventListener('click', reset);
  slLR.addEventListener('input', function() { valLR.textContent = parseFloat(slLR.value).toFixed(1); });
  reset();
  BP.onThemeChange(drawNet);
})();
</script>

<!-- ==================== DEMO 6: Gradient Magnitude Heatmap ==================== -->
<script>
(function() {
  var canvas = document.getElementById('canvas-heatmap');
  var ctx = BP.setupCanvas(canvas);
  var W = 680, H = 380;
  var slLayers = document.getElementById('hm-layers');
  var valLayers = document.getElementById('val-hm-layers');
  var btnSig = document.getElementById('hm-sigmoid');
  var btnRelu = document.getElementById('hm-relu');
  var btnCompute = document.getElementById('btn-hm-compute');
  var btnReset = document.getElementById('btn-hm-reset');
  var infoEl = document.getElementById('info-heatmap');

  var actName = 'sigmoid';
  var computed = false;
  var netData = null;

  btnSig.addEventListener('click', function() { actName = 'sigmoid'; btnSig.classList.add('active'); btnRelu.classList.remove('active'); computed = false; draw(); });
  btnRelu.addEventListener('click', function() { actName = 'relu'; btnRelu.classList.add('active'); btnSig.classList.remove('active'); computed = false; draw(); });
  slLayers.addEventListener('input', function() { valLayers.textContent = slLayers.value; computed = false; draw(); });

  function buildAndCompute() {
    var nLayers = parseInt(slLayers.value);
    var sizes = [2];
    for (var i = 0; i < nLayers; i++) sizes.push(4);
    sizes.push(1);
    var net = new BP.MLP(sizes, actName);
    net.forward([0.5, 0.8]);
    net.backward(1);
    // Collect gradient magnitudes per layer
    var gradMags = [];
    for (var l = 0; l < net.deltas.length; l++) {
      var sum = 0;
      for (var i = 0; i < net.deltas[l].length; i++) sum += Math.abs(net.deltas[l][i]);
      gradMags.push(sum / net.deltas[l].length);
    }
    netData = { net: net, sizes: sizes, gradMags: gradMags };
    computed = true;
  }

  function draw() {
    var c = BP.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    if (!computed) {
      ctx.fillStyle = c.textSec; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Click "Compute Gradients" to visualize gradient magnitudes (' + actName + ', ' + slLayers.value + ' layers)', W / 2, H / 2);
      return;
    }

    var sizes = netData.sizes;
    var net = netData.net;
    var gradMags = netData.gradMags;
    var layout = BP.getNetworkLayout(sizes, W, H - 60, 60, 50);
    var maxGrad = Math.max.apply(null, gradMags) || 1;

    // Edges
    for (var l = 0; l < sizes.length - 1; l++) {
      for (var i = 0; i < sizes[l + 1]; i++) {
        for (var j = 0; j < sizes[l]; j++) {
          var from = layout[l][j], to = layout[l + 1][i];
          ctx.strokeStyle = c.border;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.3;
          ctx.beginPath(); ctx.moveTo(from.x + 18, from.y); ctx.lineTo(to.x - 18, to.y); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    // Nodes colored by gradient magnitude
    for (var l = 0; l < sizes.length; l++) {
      for (var n = 0; n < sizes[l]; n++) {
        var pos = layout[l][n];
        var intensity = 0;
        if (l === 0) intensity = 1;
        else if (l < sizes.length - 1) {
          intensity = gradMags[l - 1] / maxGrad;
        } else {
          intensity = 1;
        }
        intensity = Math.max(0.05, Math.min(1, intensity));
        // Color from dark (low gradient) to bright (high gradient)
        var r = Math.floor(BP.lerp(40, 247, intensity));
        var g = Math.floor(BP.lerp(40, 118, intensity));
        var b = Math.floor(BP.lerp(60, 142, intensity));
        if (l === 0) { r = 122; g = 162; b = 247; }
        var color = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = c.border; ctx.lineWidth = 1.5; ctx.stroke();
      }
    }

    // Bar chart at bottom
    var barY = H - 50, barH = 35;
    var barW = (W - 120) / gradMags.length;
    ctx.fillStyle = c.textSec; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Average gradient magnitude per layer', W / 2, barY - 8);
    for (var i = 0; i < gradMags.length; i++) {
      var bx = 60 + i * barW;
      var bh = (gradMags[i] / maxGrad) * barH;
      var intensity = gradMags[i] / maxGrad;
      var r = Math.floor(BP.lerp(80, 247, intensity));
      var g = Math.floor(BP.lerp(80, 118, intensity));
      var b2 = Math.floor(BP.lerp(100, 142, intensity));
      ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b2 + ')';
      ctx.fillRect(bx + 2, barY + barH - bh, barW - 4, bh);
      ctx.fillStyle = c.textSec; ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText('L' + (i + 1), bx + barW / 2, barY + barH + 12);
      ctx.fillText(gradMags[i].toExponential(1), bx + barW / 2, barY + barH - bh - 4);
    }

    infoEl.textContent = actName.toUpperCase() + ': Layer 1 grad = ' + gradMags[0].toExponential(2) + ', Layer ' + gradMags.length + ' grad = ' + gradMags[gradMags.length - 1].toExponential(2);
  }

  btnCompute.addEventListener('click', function() { buildAndCompute(); draw(); });
  btnReset.addEventListener('click', function() { computed = false; draw(); });
  draw();
  BP.onThemeChange(draw);
})();
</script>

<!-- ==================== DEMO 7: Vanishing Gradient Problem ==================== -->
<script>
(function() {
  var canvasSig = document.getElementById('canvas-vanish-sig');
  var canvasRelu = document.getElementById('canvas-vanish-relu');
  var ctxSig = BP.setupCanvas(canvasSig);
  var ctxRelu = BP.setupCanvas(canvasRelu);
  var CW = 320, CH = 340;
  var btnRun = document.getElementById('btn-van-run');
  var btnReset = document.getElementById('btn-van-reset');
  var slLayers = document.getElementById('van-layers');
  var valLayers = document.getElementById('val-van-layers');
  var infoEl = document.getElementById('info-vanishing');
  var computed = false;
  var sigGrads = [], reluGrads = [];

  function buildNet(actName, nLayers) {
    var sizes = [2];
    for (var i = 0; i < nLayers; i++) sizes.push(4);
    sizes.push(1);
    var net = new BP.MLP(sizes, actName);
    // Use moderate weights so gradients are meaningful
    for (var l = 0; l < net.W.length; l++) {
      for (var i = 0; i < net.W[l].length; i++) {
        for (var j = 0; j < net.W[l][i].length; j++) {
          net.W[l][i][j] *= 0.8;
        }
      }
    }
    net.forward([0.5, 0.8]);
    net.backward(1);
    var grads = [];
    for (var l = 0; l < net.deltas.length; l++) {
      var sum = 0;
      for (var i = 0; i < net.deltas[l].length; i++) sum += Math.abs(net.deltas[l][i]);
      grads.push(sum / net.deltas[l].length);
    }
    return grads;
  }

  function drawBars(ctx_, grads, title, maxGrad) {
    var c = BP.getColors();
    ctx_.fillStyle = c.bg;
    ctx_.fillRect(0, 0, CW, CH);

    ctx_.fillStyle = c.text; ctx_.font = 'bold 13px sans-serif'; ctx_.textAlign = 'center';
    ctx_.fillText(title, CW / 2, 25);

    var pad = 40, barArea = CH - 80;
    var barW = (CW - 2 * pad) / grads.length;

    // Y axis
    ctx_.strokeStyle = c.border; ctx_.lineWidth = 1;
    ctx_.beginPath(); ctx_.moveTo(pad, 40); ctx_.lineTo(pad, 40 + barArea); ctx_.lineTo(CW - 10, 40 + barArea); ctx_.stroke();

    for (var i = 0; i < grads.length; i++) {
      var bx = pad + i * barW;
      var normalized = maxGrad > 0 ? grads[i] / maxGrad : 0;
      var bh = normalized * (barArea - 10);
      // Color: bright for large, dark for small
      var intensity = Math.max(0.1, normalized);
      var isSig = title.indexOf('Sigmoid') >= 0;
      var r, g, b;
      if (isSig) {
        r = Math.floor(BP.lerp(60, 247, intensity));
        g = Math.floor(BP.lerp(60, 118, intensity));
        b = Math.floor(BP.lerp(80, 142, intensity));
      } else {
        r = Math.floor(BP.lerp(60, 115, intensity));
        g = Math.floor(BP.lerp(80, 218, intensity));
        b = Math.floor(BP.lerp(60, 202, intensity));
      }
      ctx_.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
      ctx_.fillRect(bx + 4, 40 + barArea - bh, barW - 8, bh);

      // Label
      ctx_.fillStyle = c.textSec; ctx_.font = '10px JetBrains Mono, monospace'; ctx_.textAlign = 'center';
      ctx_.fillText('L' + (i + 1), bx + barW / 2, 40 + barArea + 16);
      ctx_.fillText(grads[i].toExponential(1), bx + barW / 2, 40 + barArea - bh - 6);
    }
  }

  function runComparison() {
    var nLayers = parseInt(slLayers.value);
    sigGrads = buildNet('sigmoid', nLayers);
    reluGrads = buildNet('relu', nLayers);
    computed = true;
    draw();
  }

  function draw() {
    var c = BP.getColors();
    if (!computed) {
      ctxSig.fillStyle = c.bg; ctxSig.fillRect(0, 0, CW, CH);
      ctxRelu.fillStyle = c.bg; ctxRelu.fillRect(0, 0, CW, CH);
      ctxSig.fillStyle = c.textSec; ctxSig.font = '13px sans-serif'; ctxSig.textAlign = 'center';
      ctxSig.fillText('Click "Run Comparison"', CW / 2, CH / 2);
      ctxRelu.fillStyle = c.textSec; ctxRelu.font = '13px sans-serif'; ctxRelu.textAlign = 'center';
      ctxRelu.fillText('Click "Run Comparison"', CW / 2, CH / 2);
      return;
    }
    var maxGrad = 0;
    for (var i = 0; i < sigGrads.length; i++) maxGrad = Math.max(maxGrad, sigGrads[i]);
    for (var i = 0; i < reluGrads.length; i++) maxGrad = Math.max(maxGrad, reluGrads[i]);
    drawBars(ctxSig, sigGrads, 'Sigmoid (' + sigGrads.length + ' layers)', maxGrad);
    drawBars(ctxRelu, reluGrads, 'ReLU (' + reluGrads.length + ' layers)', maxGrad);
    var ratio = sigGrads.length > 0 ? (sigGrads[0] / (sigGrads[sigGrads.length - 1] + 1e-20)).toFixed(1) : '?';
    infoEl.textContent = 'Sigmoid: first layer gradient is ' + ratio + 'x smaller than last layer. ReLU maintains gradient flow.';
  }

  btnRun.addEventListener('click', runComparison);
  btnReset.addEventListener('click', function() { computed = false; draw(); });
  slLayers.addEventListener('input', function() { valLayers.textContent = slLayers.value; computed = false; draw(); });
  draw();
  BP.onThemeChange(draw);
})();
</script>

<!-- ==================== DEMO 8: Computational Graph Builder ==================== -->
<script>
(function() {
  var canvas = document.getElementById('canvas-builder');
  var ctx = BP.setupCanvas(canvas);
  var W = 680, H = 400;
  var btnExpr1 = document.getElementById('bl-expr1');
  var btnExpr2 = document.getElementById('bl-expr2');
  var btnExpr3 = document.getElementById('bl-expr3');
  var btnRun = document.getElementById('btn-bl-run');
  var btnReset = document.getElementById('btn-bl-reset');
  var infoEl = document.getElementById('info-builder');

  var currentExpr = 1;
  var computed = false;

  // Expression definitions
  function getExpr(id) {
    if (id === 1) {
      // (a+b)*c
      return {
        inputs: { a: 2, b: 3, c: -4 },
        nodes: [
          { id: 'a', type: 'input', x: 80, y: 100, val: 2 },
          { id: 'b', type: 'input', x: 80, y: 220, val: 3 },
          { id: 'c', type: 'input', x: 80, y: 340, val: -4 },
          { id: 'q', type: 'add', x: 280, y: 160, val: 0, grad: 0 },
          { id: 'f', type: 'mul', x: 480, y: 250, val: 0, grad: 0 },
          { id: 'out', type: 'output', x: 620, y: 250, val: 0, grad: 1 }
        ],
        edges: [
          { from: 0, to: 3 }, { from: 1, to: 3 },
          { from: 3, to: 4 }, { from: 2, to: 4 },
          { from: 4, to: 5 }
        ],
        forward: function(n) {
          n[3].val = n[0].val + n[1].val;
          n[4].val = n[3].val * n[2].val;
          n[5].val = n[4].val;
        },
        backward: function(n) {
          n[5].grad = 1;
          n[4].grad = 1;
          n[3].grad = n[2].val; // df/dq = c
          n[2].grad = n[3].val; // df/dc = q
          n[0].grad = n[3].grad * 1; // df/da = df/dq * dq/da
          n[1].grad = n[3].grad * 1; // df/db = df/dq * dq/db
        },
        title: 'f = (a + b) * c'
      };
    } else if (id === 2) {
      // a*b + c*d
      return {
        nodes: [
          { id: 'a', type: 'input', x: 60, y: 80, val: 3 },
          { id: 'b', type: 'input', x: 60, y: 180, val: -2 },
          { id: 'c', type: 'input', x: 60, y: 280, val: 4 },
          { id: 'd', type: 'input', x: 60, y: 370, val: 1 },
          { id: 'p', type: 'mul', x: 240, y: 130, val: 0, grad: 0 },
          { id: 'q', type: 'mul', x: 240, y: 320, val: 0, grad: 0 },
          { id: 'f', type: 'add', x: 440, y: 225, val: 0, grad: 0 },
          { id: 'out', type: 'output', x: 600, y: 225, val: 0, grad: 1 }
        ],
        edges: [
          { from: 0, to: 4 }, { from: 1, to: 4 },
          { from: 2, to: 5 }, { from: 3, to: 5 },
          { from: 4, to: 6 }, { from: 5, to: 6 },
          { from: 6, to: 7 }
        ],
        forward: function(n) {
          n[4].val = n[0].val * n[1].val;
          n[5].val = n[2].val * n[3].val;
          n[6].val = n[4].val + n[5].val;
          n[7].val = n[6].val;
        },
        backward: function(n) {
          n[7].grad = 1;
          n[6].grad = 1;
          n[4].grad = 1; // df/dp = 1 (addition)
          n[5].grad = 1; // df/dq = 1
          n[0].grad = n[1].val; // dp/da = b
          n[1].grad = n[0].val; // dp/db = a
          n[2].grad = n[3].val; // dq/dc = d
          n[3].grad = n[2].val; // dq/dd = c
        },
        title: 'f = a*b + c*d'
      };
    } else {
      // sigmoid(a*b + c)
      return {
        nodes: [
          { id: 'a', type: 'input', x: 60, y: 100, val: 1.5 },
          { id: 'b', type: 'input', x: 60, y: 240, val: -1 },
          { id: 'c', type: 'input', x: 60, y: 340, val: 0.5 },
          { id: 'p', type: 'mul', x: 200, y: 170, val: 0, grad: 0 },
          { id: 'q', type: 'add', x: 360, y: 250, val: 0, grad: 0 },
          { id: 's', type: 'sig', x: 500, y: 250, val: 0, grad: 0 },
          { id: 'out', type: 'output', x: 620, y: 250, val: 0, grad: 1 }
        ],
        edges: [
          { from: 0, to: 3 }, { from: 1, to: 3 },
          { from: 3, to: 4 }, { from: 2, to: 4 },
          { from: 4, to: 5 }, { from: 5, to: 6 }
        ],
        forward: function(n) {
          n[3].val = n[0].val * n[1].val;
          n[4].val = n[3].val + n[2].val;
          n[5].val = BP.sigmoid(n[4].val);
          n[6].val = n[5].val;
        },
        backward: function(n) {
          n[6].grad = 1;
          n[5].grad = 1;
          var sd = n[5].val * (1 - n[5].val);
          n[4].grad = sd;
          n[3].grad = sd * 1;
          n[2].grad = sd * 1;
          n[0].grad = sd * n[1].val;
          n[1].grad = sd * n[0].val;
        },
        title: 'f = sigmoid(a*b + c)'
      };
    }
  }

  var expr = getExpr(1);

  function draw() {
    var c = BP.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = c.text; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(expr.title, W / 2, 22);

    var nodes = expr.nodes;

    // Edges
    for (var i = 0; i < expr.edges.length; i++) {
      var e = expr.edges[i];
      var from = nodes[e.from], to = nodes[e.to];
      ctx.strokeStyle = c.border; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(from.x + 24, from.y); ctx.lineTo(to.x - 24, to.y); ctx.stroke();
      // Arrow
      var angle = Math.atan2(to.y - from.y, to.x - from.x);
      var ax = to.x - 24, ay = to.y;
      ctx.fillStyle = c.border;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 7 * Math.cos(angle - 0.3), ay - 7 * Math.sin(angle - 0.3));
      ctx.lineTo(ax - 7 * Math.cos(angle + 0.3), ay - 7 * Math.sin(angle + 0.3));
      ctx.fill();
    }

    // Nodes
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var color = c.waiting;
      if (n.type === 'input') color = c.forward;
      else if (n.type === 'output') color = c.green;
      else if (n.type === 'add') color = c.purple;
      else if (n.type === 'mul') color = c.yellow;
      else if (n.type === 'sig') color = '#bb9af7';

      var label = n.id;
      if (n.type === 'add') label = '+';
      else if (n.type === 'mul') label = '\u00D7';
      else if (n.type === 'sig') label = '\u03C3';

      BP.drawNode(ctx, n.x, n.y, 22, color, label);

      if (computed) {
        // Forward value
        ctx.fillStyle = c.forward;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.val.toFixed(3), n.x, n.y + 36);
        // Gradient
        ctx.fillStyle = c.backward;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText('\u2207=' + n.grad.toFixed(3), n.x, n.y - 30);
      } else if (n.type === 'input') {
        ctx.fillStyle = c.forward;
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('=' + n.val.toFixed(1), n.x, n.y + 36);
      }
    }
  }

  function runCompute() {
    expr.forward(expr.nodes);
    expr.backward(expr.nodes);
    computed = true;
    infoEl.textContent = 'Output = ' + expr.nodes[expr.nodes.length - 1].val.toFixed(4) + '. Gradients shown in red above each node.';
    draw();
  }

  function setExpr(id) {
    currentExpr = id;
    expr = getExpr(id);
    computed = false;
    btnExpr1.classList.toggle('active', id === 1);
    btnExpr2.classList.toggle('active', id === 2);
    btnExpr3.classList.toggle('active', id === 3);
    infoEl.textContent = 'Expression: ' + expr.title + '. Click "Compute" to run forward + backward.';
    draw();
  }

  btnExpr1.addEventListener('click', function() { setExpr(1); });
  btnExpr2.addEventListener('click', function() { setExpr(2); });
  btnExpr3.addEventListener('click', function() { setExpr(3); });
  btnRun.addEventListener('click', runCompute);
  btnReset.addEventListener('click', function() { setExpr(currentExpr); });
  draw();
  BP.onThemeChange(draw);
})();
</script>

<!-- ==================== DEMO 9: Backprop on a Real Task ==================== -->
<script>
(function() {
  var canvasBound = document.getElementById('canvas-real-boundary');
  var canvasLoss = document.getElementById('canvas-real-loss');
  var ctxB = BP.setupCanvas(canvasBound);
  var ctxL = BP.setupCanvas(canvasLoss);
  var BW = 320, BH = 320;

  var btnCircle = document.getElementById('rl-ds-circle');
  var btnSpiral = document.getElementById('rl-ds-spiral');
  var btnXor = document.getElementById('rl-ds-xor');
  var btnTrain = document.getElementById('btn-rl-train');
  var btnStop = document.getElementById('btn-rl-stop');
  var btnReset = document.getElementById('btn-rl-reset');
  var slLR = document.getElementById('rl-lr');
  var valLR = document.getElementById('val-rl-lr');
  var epochEl = document.getElementById('rl-epoch');
  var lossEl = document.getElementById('rl-loss');
  var infoEl = document.getElementById('info-real');

  var dsName = 'circle';
  var net, data, epoch, losses, training, animId;

  function initAll() {
    if (animId) cancelAnimationFrame(animId);
    training = false;
    epoch = 0;
    losses = [];
    if (dsName === 'xor') {
      data = BP.datasets.xor();
      net = new BP.MLP([2, 4, 4, 1], 'sigmoid');
    } else if (dsName === 'spiral') {
      data = BP.datasets.spiral(120);
      net = new BP.MLP([2, 4, 4, 1], 'sigmoid');
    } else {
      data = BP.datasets.circle(100);
      net = new BP.MLP([2, 4, 4, 1], 'sigmoid');
    }
    epochEl.textContent = 'Epoch: 0';
    lossEl.textContent = 'Loss: --';
    drawBoundary();
    drawLoss();
  }

  function drawBoundary() {
    var c = BP.getColors();
    ctxB.fillStyle = c.bg;
    ctxB.fillRect(0, 0, BW, BH);
    BP.drawDecisionBoundary(ctxB, net, BW, BH, 4);
    BP.drawPoints(ctxB, data.X, data.y, BW, BH, 4);
  }

  function drawLoss() {
    BP.drawLossCurve(ctxL, losses, BW, BH);
  }

  function trainLoop() {
    if (!training) return;
    var lr = parseFloat(slLR.value);
    var loss = net.trainBatch(data.X, data.y, lr, 1);
    epoch++;
    losses.push(loss);
    if (losses.length > 500) losses.shift();
    epochEl.textContent = 'Epoch: ' + epoch;
    lossEl.textContent = 'Loss: ' + loss.toFixed(4);
    if (epoch % 5 === 0) { drawBoundary(); drawLoss(); }
    animId = requestAnimationFrame(trainLoop);
  }

  function setDS(name) {
    dsName = name;
    btnCircle.classList.toggle('active', name === 'circle');
    btnSpiral.classList.toggle('active', name === 'spiral');
    btnXor.classList.toggle('active', name === 'xor');
    initAll();
  }

  btnCircle.addEventListener('click', function() { setDS('circle'); });
  btnSpiral.addEventListener('click', function() { setDS('spiral'); });
  btnXor.addEventListener('click', function() { setDS('xor'); });
  btnTrain.addEventListener('click', function() { training = true; trainLoop(); });
  btnStop.addEventListener('click', function() { training = false; if (animId) cancelAnimationFrame(animId); });
  btnReset.addEventListener('click', function() { initAll(); });
  slLR.addEventListener('input', function() { valLR.textContent = parseFloat(slLR.value).toFixed(1); });

  initAll();
  BP.onThemeChange(function() { drawBoundary(); drawLoss(); });
})();
</script>
