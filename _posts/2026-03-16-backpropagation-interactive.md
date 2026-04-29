---
layout: post
title: "Backpropagation Visualized"
author: bharathikannan
categories: [Machine learning]
series: true
hidden: true
description: "Watch data flow forward and gradients flow backward through neural networks, visualize the chain rule at every node, and understand vanishing gradients - all interactively."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /backpropagation/
date: 2026-04-29
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
.demo-controls select {
  padding: 0.35rem 0.6rem;
  border: 1px solid var(--accent);
  border-radius: 6px;
  background: transparent;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.demo-controls select:focus {
  outline: none;
  background: var(--accent);
  color: var(--bg-primary);
}
.demo-controls select option {
  background: var(--bg-primary);
  color: var(--text-primary);
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

In the [Perceptron & MLP]({% post_url 2026-03-16-perceptron-mlp-interactive %}) guide, we built multi-layer perceptrons  and we saw how they learn. But we treated the weight update as a black box: how does the network know which weight to adjust and by how much? This chapter answers that question and is fully self-contained, so you can continue directly from here. The answer is backpropagation: an algorithm that computes the gradient of the loss with respect to every weight in the network using the chain rule from calculus. 

**In this guide, you will:**

- Visualize the chain rule on a computational graph and trace gradients through each node
- See how weights evolve as a network trains, and how the loss function shapes that evolution
- Train a real network on 2D classification tasks in a configurable playground

---

## 1. The Chain Rule

Every neural network computation can be written as a computational graph: a directed graph where each node performs a simple operation, such as addition, multiplication, or an activation function. Backpropagation is just the chain rule applied backward through this graph.

Consider a simple expression:

$$
f(x, y, z) = (x + y) \cdot z
$$

Let

$$
q = x + y
$$

so that

$$
f = q \cdot z
$$

Now we can compute the gradients step by step:

$$
\frac{\partial f}{\partial x}
=
\frac{\partial f}{\partial q}
\cdot
\frac{\partial q}{\partial x}
=
z \cdot 1
=
z
$$

$$
\frac{\partial f}{\partial y}
=
\frac{\partial f}{\partial q}
\cdot
\frac{\partial q}{\partial y}
=
z \cdot 1
=
z
$$

$$
\frac{\partial f}{\partial z}
=
q
=
x + y
$$

The important idea is that each node only needs to know its local derivative. By multiplying these local derivatives together, we get the gradient of the final output with respect to every input. The demo below shows this visually. Click any node to see its local derivative and how it contributes to the final gradient.

<div class="interactive-demo" id="demo-chain">
  <canvas id="canvas-chain" width="680" height="400"></canvas>
  <div class="demo-controls">
    <label>x <input type="range" id="chain-x" min="-5" max="5" step="0.5" value="2"><span class="demo-value" id="val-chain-x">2.0</span></label>
    <label>y <input type="range" id="chain-y" min="-5" max="5" step="0.5" value="1"><span class="demo-value" id="val-chain-y">1.0</span></label>
    <label>z <input type="range" id="chain-z" min="-5" max="5" step="0.5" value="-3"><span class="demo-value" id="val-chain-z">-3.0</span></label>
  </div>
  <div class="demo-info" id="info-chain">Click a node to see the chain rule derivation at that point.</div>
  <div class="demo-caption">Setup: f(x,y,z) = (x+y)·z. Drag the sliders, click any node to see its local gradient.</div>
</div>

---

## 2. Backpropagation

One full training step has four phases: a forward pass that produces a prediction, a loss computation that compares the prediction to the target, a backward pass that propagates gradients to every weight using the chain rule, and a weight update that adjusts each weight according to $$w \leftarrow w - \eta \cdot \frac{\partial L}{\partial w}$$. 

In practice, this cycle is repeated many times until the weights converge to values that solve the task. The demo below trains a 2-4-1 network on the XOR problem with inputs [0,0], [0,1], [1,0], [1,1] and targets 0, 1, 1, 0, using binary cross-entropy loss $$L = -\bigl[y \log \hat{y} + (1-y)\log(1-\hat{y})\bigr]$$ and He initialization, where each weight is drawn from a distribution scaled by $$\sqrt{2/n_{\text{in}}}$$ to keep signal variance stable across layers.

<div class="interactive-demo" id="demo-weights">
  <canvas id="canvas-weights" width="680" height="400"></canvas>
  <div class="demo-controls">
    <button id="btn-wt-train">Train (10 steps)</button>
    <button id="btn-wt-run">Continuous</button>
    <button id="btn-wt-stop">Stop</button>
    <button id="btn-wt-reset">Reset</button>
    <label>Learning Rate <input type="range" id="wt-lr" min="0.1" max="3" step="0.1" value="1.0"><span class="demo-value" id="val-wt-lr">1.0</span></label>
    <span class="demo-value" id="wt-epoch">Step: 0</span>
  </div>
  <div class="demo-info" id="info-weights">Click Train to step, Continuous to run.</div>
  <div class="demo-caption">Settings: 2-4-1 network on XOR, sigmoid, BCE loss, full-batch SGD.</div>
</div>

The choice of activation matters here too. See the [Activation Functions]({{ site.baseurl }}/activation-functions/) guide for an in-depth look at how different activations affect gradient flow and learning dynamics. 

---

## 3. Playground

Time to see the whole training loop in action. Choose a dataset, select an activation function, configure the network architecture, and press Train. The decision boundary on the left updates as the network learns, while the loss curve on the right shows how the loss changes over epochs. Try more difficult datasets such as Spiral with deeper or wider networks, or add noise to test how robust your model is.

<div class="interactive-demo" id="demo-real">
  <div class="demo-split">
    <div>
      <canvas id="canvas-real-boundary" width="320" height="320"></canvas>
    </div>
    <div>
      <canvas id="canvas-real-loss" width="320" height="320"></canvas>
    </div>
  </div>
  <div class="demo-controls">
    <label>Dataset
      <select id="rl-dataset">
        <option value="circle" selected>Circle</option>
        <option value="xor">XOR</option>
        <option value="spiral">Spiral</option>
        <option value="gauss">Gauss</option>
      </select>
    </label>
    <label>Activation
      <select id="rl-activation">
        <option value="sigmoid" selected>Sigmoid</option>
        <option value="tanh">Tanh</option>
        <option value="relu">ReLU</option>
      </select>
    </label>
    <label>Hidden layers <input type="range" id="rl-layers" min="1" max="3" step="1" value="2"><span class="demo-value" id="val-rl-layers">2</span></label>
    <label>Neurons/layer <input type="range" id="rl-neurons" min="2" max="8" step="1" value="4"><span class="demo-value" id="val-rl-neurons">4</span></label>
  </div>
  <div class="demo-controls">
    <label>Learning rate <input type="range" id="rl-lr" min="0.1" max="3" step="0.1" value="1.0"><span class="demo-value" id="val-rl-lr">1.0</span></label>
    <label>Noise <input type="range" id="rl-noise" min="0" max="0.3" step="0.05" value="0"><span class="demo-value" id="val-rl-noise">0.00</span></label>
  </div>
  <div class="demo-controls">
    <button id="btn-rl-train">Train</button>
    <button id="btn-rl-stop">Stop</button>
    <button id="btn-rl-reset">Reset</button>
    <span class="demo-value" id="rl-epoch">Epoch: 0</span>
    <span class="demo-value" id="rl-loss">Loss: --</span>
  </div>
  <div class="demo-info" id="info-real">Left: decision boundary. Right: training loss curve. Updates every 5 epochs.</div>
  <div class="demo-caption">Settings: configurable MLP, He init, BCE loss, full-batch SGD. Try Circle at LR 0.5 to 1.5, XOR at 1.0 to 2.0, Spiral at 1.5 to 2.5 with ReLU and 3 hidden layers.</div>
</div>

---

## 4. Summary

| Concept | Key Idea |
|---|---|
| Chain Rule | Gradients propagate backward by multiplying local derivatives at each node. |
| Forward Pass | Data flows input to output, computing weighted sums and activations. |
| Backward Pass | Gradients flow output to input, applying the chain rule at every connection. |
| Weight Update | Each weight is nudged opposite to its gradient: $$w \leftarrow w - \eta \nabla_w L$$. |
| Computational Graph | Any expression can be decomposed into a graph for automatic differentiation. |

Backpropagation is not just an algorithm, it is a way of thinking about computation. Every modern deep learning framework (PyTorch, TensorFlow, JAX) is built around the idea of recording a computational graph during the forward pass and then traversing it backward to compute gradients automatically. This process is called automatic differentiation, and backpropagation is its most important application in neural networks. The time complexity of backpropagation is linear in the number of operations in the forward pass, O(n), since each operation is visited once during the forward pass and once during the backward pass. This efficiency is what makes training networks with millions of parameters practical.

#### Continue the ML Series

This post is part of a bigger [Machine Learning from Scratch]({{ site.baseurl }}/ml/) series. If you would like to learn more, check out the other posts in this series. Next up is [Activation Functions]({{ site.baseurl }}/activation-functions/), where we will explore different activation functions and understand how they affect gradient flow and network expressivity.
 
<script>
// ==================== SHARED BACKPROP UTILITIES ====================
window.BP = (function() {
  function getColors() { return window.Viz.colors(); }

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
    },
    gauss: function(n) {
      n = n || 100; var X = [], y = [], half = Math.floor(n / 2);
      function gaussian() {
        var u = 1 - Math.random(), v = Math.random();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      }
      var centers = [[0.3, 0.3], [0.7, 0.7]];
      for (var c = 0; c < 2; c++) {
        for (var i = 0; i < half; i++) {
          var px = centers[c][0] + gaussian() * 0.08;
          var py = centers[c][1] + gaussian() * 0.08;
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
  var W = 680, H = 400;
  var slX = document.getElementById('chain-x');
  var slY = document.getElementById('chain-y');
  var slZ = document.getElementById('chain-z');
  var valX = document.getElementById('val-chain-x');
  var valY = document.getElementById('val-chain-y');
  var valZ = document.getElementById('val-chain-z');
  var infoEl = document.getElementById('info-chain');
  var selectedNode = -1;

  // Node positions. varName is the variable each node carries (used in labels).
  var nodes = [
    { x: 80,  y: 80,  label: 'x', varName: 'x', type: 'input' },
    { x: 80,  y: 280, label: 'y', varName: 'y', type: 'input' },
    { x: 280, y: 180, label: '+', varName: 'q', type: 'op' },
    { x: 280, y: 340, label: 'z', varName: 'z', type: 'input' },
    { x: 540, y: 250, label: '\u00d7', varName: 'f', type: 'output' }
  ];
  // Each edge carries one local derivative (the multiplier the chain rule uses).
  var edges = [
    { from: 0, to: 2, getLocal: function(d) { return 1; } },     // dq/dx
    { from: 1, to: 2, getLocal: function(d) { return 1; } },     // dq/dy
    { from: 2, to: 4, getLocal: function(d) { return d.z; } },   // df/dq
    { from: 3, to: 4, getLocal: function(d) { return d.q; } }    // df/dz
  ];

  function compute() {
    var x = parseFloat(slX.value);
    var y = parseFloat(slY.value);
    var z = parseFloat(slZ.value);
    var q = x + y;
    var f = q * z;
    // Forward value at each node (same order as nodes array)
    var vals = [x, y, q, z, f];
    // Gradient df/d(node) at each node
    var grads = [z, z, z, q, 1];
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

    // Draw edges with local derivatives
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      var from = nodes[edge.from], to = nodes[edge.to];
      ctx.strokeStyle = c.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(from.x + 25, from.y);
      ctx.lineTo(to.x - 25, to.y);
      ctx.stroke();
      // Local derivative label at midpoint (the chain-rule multiplier on this edge)
      var mx = (from.x + to.x) / 2;
      var my = (from.y + to.y) / 2;
      var localVal = edge.getLocal(data);
      ctx.fillStyle = c.textSec;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u00d7 ' + localVal.toFixed(1), mx, my - 10);
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

    // Draw nodes with label inside, value below (forward color), gradient above (backward color)
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var color = n.type === 'input' ? c.forward : n.type === 'output' ? c.green : c.purple;
      if (i === selectedNode) color = c.yellow;
      BP.drawNode(ctx, n.x, n.y, 24, color, n.label);
      // Forward: varName = value
      ctx.fillStyle = c.forward;
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(n.varName + ' = ' + data.vals[i].toFixed(1), n.x, n.y + 32);
      // Backward: df/d(varName) = gradient
      ctx.fillStyle = c.backward;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textBaseline = 'bottom';
      ctx.fillText('\u2202f/\u2202' + n.varName + ' = ' + data.grads[i].toFixed(1), n.x, n.y - 32);
    }

    // Info text
    if (selectedNode >= 0) {
      var txt = '';
      if (selectedNode === 0) txt = '\u2202f/\u2202x = \u2202f/\u2202q \u00b7 \u2202q/\u2202x = (' + data.z.toFixed(1) + ') \u00b7 1 = ' + data.grads[0].toFixed(1);
      else if (selectedNode === 1) txt = '\u2202f/\u2202y = \u2202f/\u2202q \u00b7 \u2202q/\u2202y = (' + data.z.toFixed(1) + ') \u00b7 1 = ' + data.grads[1].toFixed(1);
      else if (selectedNode === 2) txt = 'q = x + y = ' + data.q.toFixed(1) + ',  \u2202f/\u2202q = z = ' + data.z.toFixed(1);
      else if (selectedNode === 3) txt = '\u2202f/\u2202z = q = (x + y) = ' + data.q.toFixed(1);
      else if (selectedNode === 4) txt = 'f = q \u00b7 z = ' + data.f.toFixed(1) + ',  \u2202f/\u2202f = 1 (output)';
      infoEl.textContent = txt;
    } else {
      infoEl.textContent = 'Forward values in blue, gradients \u2202f/\u2202node in red, edges show the local derivative (\u00d7). Click a node for its chain rule.';
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
  var initialState = null;

  function clone2D(arr) {
    var out = [];
    for (var i = 0; i < arr.length; i++) out.push(arr[i].slice());
    return out;
  }

  function snapshotState(model) {
    return {
      W: model.W.map(function(layer) { return clone2D(layer); }),
      b: clone2D(model.b)
    };
  }

  function applyState(model, state) {
    model.W = state.W.map(function(layer) { return clone2D(layer); });
    model.b = clone2D(state.b);
  }

  function initNet() {
    net = new BP.MLP(sizes, 'sigmoid');
    step = 0;
    if (!initialState) initialState = snapshotState(net);
  }

  function restoreInitialNet() {
    net = new BP.MLP(sizes, 'sigmoid');
    if (initialState) applyState(net, initialState);
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

  var running = false;
  var runAnimId = null;
  var runToken = 0;
  var btnRun = document.getElementById('btn-wt-run');
  var btnStop = document.getElementById('btn-wt-stop');

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

  function continuousLoop(token) {
    if (!running || token !== runToken) return;
    trainStep();
    runAnimId = requestAnimationFrame(function() { continuousLoop(token); });
  }

  function startContinuous() {
    if (running) return;
    running = true;
    runToken++;
    continuousLoop(runToken);
  }

  function stopContinuous() {
    running = false;
    runToken++;
    if (runAnimId) {
      cancelAnimationFrame(runAnimId);
      runAnimId = null;
    }
  }

  function reset() {
    stopContinuous();
    restoreInitialNet();
    epochEl.textContent = 'Step: 0';
    infoEl.textContent = 'Reset complete.';
    drawNet();
  }

  btnTrain.addEventListener('click', function() { stopContinuous(); trainStep(); });
  btnRun.addEventListener('click', startContinuous);
  btnStop.addEventListener('click', stopContinuous);
  btnReset.addEventListener('click', reset);
  slLR.addEventListener('input', function() { valLR.textContent = parseFloat(slLR.value).toFixed(1); });
  reset();
  BP.onThemeChange(drawNet);
})();
</script>

<!-- ==================== DEMO Playground ==================== -->
<script>
(function() {
  var canvasBound = document.getElementById('canvas-real-boundary');
  var canvasLoss = document.getElementById('canvas-real-loss');
  var ctxB = BP.setupCanvas(canvasBound);
  var ctxL = BP.setupCanvas(canvasLoss);
  var BW = 320, BH = 320;

  var selDataset = document.getElementById('rl-dataset');
  var selActivation = document.getElementById('rl-activation');
  var slLayers = document.getElementById('rl-layers');
  var valLayers = document.getElementById('val-rl-layers');
  var slNeurons = document.getElementById('rl-neurons');
  var valNeurons = document.getElementById('val-rl-neurons');
  var slLR = document.getElementById('rl-lr');
  var valLR = document.getElementById('val-rl-lr');
  var slNoise = document.getElementById('rl-noise');
  var valNoise = document.getElementById('val-rl-noise');
  var btnTrain = document.getElementById('btn-rl-train');
  var btnStop = document.getElementById('btn-rl-stop');
  var btnReset = document.getElementById('btn-rl-reset');
  var epochEl = document.getElementById('rl-epoch');
  var lossEl = document.getElementById('rl-loss');
  var infoEl = document.getElementById('info-real');

  var net, data, epoch, losses, training, animId;

  function buildData() {
    var name = selDataset.value;
    var ds;
    if (name === 'xor') ds = BP.datasets.xor();
    else if (name === 'spiral') ds = BP.datasets.spiral(120);
    else if (name === 'gauss') ds = BP.datasets.gauss(120);
    else ds = BP.datasets.circle(120);
    var noise = parseFloat(slNoise.value);
    if (noise > 0) {
      for (var i = 0; i < ds.X.length; i++) {
        ds.X[i][0] = Math.max(0, Math.min(1, ds.X[i][0] + (Math.random() - 0.5) * 2 * noise));
        ds.X[i][1] = Math.max(0, Math.min(1, ds.X[i][1] + (Math.random() - 0.5) * 2 * noise));
      }
    }
    return ds;
  }

  function buildNet() {
    var L = parseInt(slLayers.value);
    var N = parseInt(slNeurons.value);
    var sizes = [2];
    for (var i = 0; i < L; i++) sizes.push(N);
    sizes.push(1);
    return new BP.MLP(sizes, selActivation.value);
  }

  function stopTraining() {
    training = false;
    if (animId) cancelAnimationFrame(animId);
  }

  function resetTrainingState() {
    stopTraining();
    epoch = 0;
    losses = [];
    epochEl.textContent = 'Epoch: 0';
    lossEl.textContent = 'Loss: --';
  }

  function rebuildNet() {
    resetTrainingState();
    net = buildNet();
    drawBoundary();
    drawLoss();
  }

  function rebuildData() {
    resetTrainingState();
    data = buildData();
    net = buildNet();
    drawBoundary();
    drawLoss();
  }

  function initAll() { rebuildData(); }

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

  selDataset.addEventListener('change', rebuildData);
  selActivation.addEventListener('change', rebuildNet);
  slLayers.addEventListener('input', function() {
    valLayers.textContent = slLayers.value;
    rebuildNet();
  });
  slNeurons.addEventListener('input', function() {
    valNeurons.textContent = slNeurons.value;
    rebuildNet();
  });
  slNoise.addEventListener('input', function() {
    valNoise.textContent = parseFloat(slNoise.value).toFixed(2);
    rebuildData();
  });
  slLR.addEventListener('input', function() {
    valLR.textContent = parseFloat(slLR.value).toFixed(1);
  });

  btnTrain.addEventListener('click', function() {
    if (training) return;
    training = true;
    trainLoop();
  });
  btnStop.addEventListener('click', stopTraining);
  btnReset.addEventListener('click', rebuildData);

  initAll();
  BP.onThemeChange(function() { drawBoundary(); drawLoss(); });
})();
</script>
