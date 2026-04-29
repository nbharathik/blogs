---
layout: post
title: "The Perceptron & Multi-Layer Perceptron"
author: bharathikannan
categories: [Machine learning]
series: true
hidden: true
description: "Build neural networks with interactive visualizations. Train a single neuron, watch it fail on XOR, then add a hidden layer to solve it. Adjust network architecture and watch decision boundaries evolve in real-time - all in your browser."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /perceptron-mlp/
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
.truth-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
}
.truth-table th, .truth-table td {
  border: 1px solid var(--border);
  padding: 0.4rem 0.8rem;
  text-align: center;
}
.truth-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
.truth-table .wrong {
  color: var(--viz-red);
  font-weight: 700;
}
.truth-table .correct {
  color: var(--viz-cyan);
  font-weight: 700;
}
</style>

## Perceptrons and Neural Networks

A perceptron is one of the simplest models for binary classification: it computes a weighted sum of inputs, adds a bias, and applies an activation function. If you want background on the closely related linear classifier, see [Logistic Regression]({% post_url 2026-03-16-logistic-regression-from-scratch-interactive %}). This chapter is fully self-contained, so you can continue directly from here.

The perceptron at its core is the same computation as logistic regression: a weighted sum of inputs passed through an activation function. The key difference is how this output is interpreted and how multiple neurons can be combined. When we stack neurons into layers, this simple computation becomes the foundation of neural networks.

---

## 1. The Single Neuron

A single neuron takes inputs, multiplies each by a weight, adds a bias, and passes the result through an activation function:

$$z = w_1 x_1 + w_2 x_2 + b = \mathbf{w} \cdot \mathbf{x} + b$$

$$a = \sigma(z)$$

where $$\sigma$$ is an activation function (we will use the sigmoid $$\sigma(z) = \frac{1}{1+e^{-z}}$$ for now). If $$a \geq 0.5$$ we predict class 1, otherwise class 0.

With this choice of activation function, a single neuron is mathematically identical to logistic regression. The neural network perspective begins when we stack many such neurons into layers and allowing the model to learn more complex functions.

<div class="interactive-demo" id="demo-neuron">
  <canvas id="canvas-neuron" width="680" height="340"></canvas>
  <div class="demo-controls">
    <label>w₁ <input type="range" id="neuron-w1" min="-5" max="5" step="0.1" value="1.5"><span class="demo-value" id="val-w1">1.5</span></label>
    <label>w₂ <input type="range" id="neuron-w2" min="-5" max="5" step="0.1" value="-1"><span class="demo-value" id="val-w2">-1.0</span></label>
    <label>b <input type="range" id="neuron-b" min="-5" max="5" step="0.1" value="0"><span class="demo-value" id="val-b">0.0</span></label>
  </div>
</div>

---

## 2. Learning Logic Gates

Boolean logic gates are among the simplest classification problems. Each gate defines a dataset with four points: two binary inputs and one binary output. For the AND gate, the output is 1 only when both inputs are 1. For the OR gate, the output is 1 when at least one input is 1. Both problems are linearly separable, meaning a single straight line can separate the class-1 points from the class-0 points. Because of this, a single perceptron can learn both gates easily.

<div class="interactive-demo" id="demo-gates">
  <canvas id="canvas-gates" width="680" height="340"></canvas>
  <div class="demo-controls">
    <button id="btn-and" class="active">Train AND</button>
    <button id="btn-or">Train OR</button>
    <button id="btn-gates-reset">Reset</button>
    <span class="demo-value" id="gates-epoch">Epoch: 0</span>
  </div>
  <div class="demo-info" id="info-gates">Click a button to train the perceptron on a logic gate.</div>
  <table class="truth-table" id="gates-table">
    <thead><tr><th>x₁</th><th>x₂</th><th>Target</th><th>Prediction</th></tr></thead>
    <tbody>
      <tr><td>0</td><td>0</td><td id="gt-00">-</td><td id="gp-00">-</td></tr>
      <tr><td>0</td><td>1</td><td id="gt-01">-</td><td id="gp-01">-</td></tr>
      <tr><td>1</td><td>0</td><td id="gt-10">-</td><td id="gp-10">-</td></tr>
      <tr><td>1</td><td>1</td><td id="gt-11">-</td><td id="gp-11">-</td></tr>
    </tbody>
  </table>
<div class="demo-caption">Default: sigmoid activations, SGD.</div>
</div>

---

## 3. The XOR Problem, Where Single Neurons Fail

Now consider the XOR gate: the output is 1 when the two inputs are different.

| x₁ | x₂ | XOR |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

If we plot these four points on a 2D plane, the class-1 points lie at (0,1) and (1,0), which are diagonally opposite corners. The class-0 points lie at (0,0) and (1,1). Unlike the AND and OR gates, no single straight line can separate these two classes. This is not a matter of choosing better weights. It is mathematically impossible. A single neuron can only produce a linear decision boundary, but the XOR problem requires a nonlinear one. This limitation motivates the need for multiple neurons arranged in layers.

<div class="interactive-demo" id="demo-xor-fail">
  <canvas id="canvas-xor-fail" width="680" height="340"></canvas>
  <div class="demo-controls">
    <button id="btn-xor-train">Train Perceptron on XOR</button>
    <button id="btn-xor-reset">Reset</button>
    <span class="demo-value" id="xor-fail-epoch">Epoch: 0</span>
  </div>
  <div class="demo-info" id="info-xor-fail">The perceptron will try, and fail. Watch the line oscillate.</div>
  <table class="truth-table" id="xor-fail-table">
    <thead><tr><th>x₁</th><th>x₂</th><th>Target</th><th>Prediction</th></tr></thead>
    <tbody>
      <tr><td>0</td><td>0</td><td>0</td><td id="xf-00">-</td></tr>
      <tr><td>0</td><td>1</td><td>1</td><td id="xf-01">-</td></tr>
      <tr><td>1</td><td>0</td><td>1</td><td id="xf-10">-</td></tr>
      <tr><td>1</td><td>1</td><td>0</td><td id="xf-11">-</td></tr>
    </tbody>
  </table>
  <div class="demo-caption">Default: sigmoid activations, SGD.</div>
</div>


<!-- In 1969, Marvin Minsky and Seymour Papert published "Perceptrons", where they showed rigorously that single-layer perceptrons cannot solve XOR or, more generally, any problem that is not linearly separable.

This limitation was widely interpreted as a fundamental weakness of neural networks and contributed to the first “AI Winter”, a period of reduced interest and funding for neural network research.

The solution, as we will see next, was already known: combine multiple neurons into layers. -->
---

## 4. The Solution: Hidden Layers

The key insight is simple: if one neuron can draw one line, two neurons can draw two lines, and another neuron can combine them. By stacking neurons into layers, we can adjust the input space into increasingly complex regions.

A Multi-Layer Perceptron (MLP) adds one or more hidden layers between the input and the output:

Layer 1 (hidden):

$$
\mathbf{h} = \sigma(\mathbf{W}_1 \mathbf{x} + \mathbf{b}_1)
$$

Layer 2 (output):

$$
\hat{y} = \sigma(\mathbf{W}_2 \mathbf{h} + \mathbf{b}_2)
$$

Each hidden neuron creates its own linear boundary in the input space. The output neuron then combines these intermediate features into a nonlinear decision rule.

For XOR, we need only two hidden neurons. One hidden neuron can learn one diagonal separation, the second learns the other, and the output neuron combines them to correctly classify all four points. We will refer to this architecture as `2-2-1`. The three numbers are the size of each layer in order, so two inputs, two hidden units, one output. 

<div class="interactive-demo" id="demo-xor-mlp">
  <div class="demo-split">
    <div>
      <canvas id="canvas-xor-network" width="320" height="320"></canvas>
      <div class="demo-caption">Network (numbers are current weights)</div>
    </div>
    <div>
      <canvas id="canvas-xor-boundary" width="320" height="320"></canvas>
      <div class="demo-caption">Decision boundary</div>
    </div>
    <div>
      <canvas id="canvas-xor-loss" width="320" height="320"></canvas>
      <div class="demo-caption">Training loss</div>
    </div>
    <div>
      <table class="truth-table" id="xor-mlp-table" style="margin-top:50px;">
        <thead><tr><th>x₁</th><th>x₂</th><th>Target</th><th>Prediction</th></tr></thead>
        <tbody>
          <tr><td>0</td><td>0</td><td>0</td><td id="xm-00">-</td></tr>
          <tr><td>0</td><td>1</td><td>1</td><td id="xm-01">-</td></tr>
          <tr><td>1</td><td>0</td><td>1</td><td id="xm-10">-</td></tr>
          <tr><td>1</td><td>1</td><td>0</td><td id="xm-11">-</td></tr>
        </tbody>
      </table>
      <div class="demo-caption">Predictions vs targets</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="btn-xor-mlp-train">Train MLP (2-2-1)</button>
    <button id="btn-xor-mlp-reset">Reset</button>
    <label>Learning Rate <input type="range" id="xor-mlp-lr" min="0.5" max="5" step="0.1" value="2"><span class="demo-value" id="val-xor-lr">2.0</span></label>
    <span class="demo-value" id="xor-mlp-epoch">Epoch: 0</span>
  </div>
  <div class="demo-info" id="info-xor-mlp">Click "Train MLP" and watch the network solve what the single perceptron could not.</div>
  <div class="demo-caption">Default: sigmoid activations, SGD. If it gets stuck, click Reset to initialize different weights and try again.</div>
</div>

---

## 5. Network Architecture Playground
Now let us explore how network architecture affects what a model can learn. Choose a dataset, adjust the number of hidden layers and neurons and watch how the decision boundary changes as the network trains. This makes it easier to see how deeper or wider networks can represent more complex patterns.

<div class="interactive-demo" id="demo-playground">
  <div class="demo-split">
    <div>
      <canvas id="canvas-playground" width="320" height="320"></canvas>
      <div class="demo-caption">Decision boundary</div>
    </div>
    <div>
      <canvas id="canvas-playground-loss" width="320" height="320"></canvas>
      <div class="demo-caption">Training loss</div>
    </div>
  </div>
  <div class="demo-controls">
    <label>Dataset:
      <button id="pg-ds-xor" class="active">XOR</button>
      <button id="pg-ds-circle">Circle</button>
      <button id="pg-ds-spiral">Spiral</button>
      <button id="pg-ds-linear">Linear</button>
    </label>
  </div>
  <div class="demo-controls">
    <label>Hidden Layers <input type="range" id="pg-layers" min="1" max="3" step="1" value="1"><span class="demo-value" id="val-pg-layers">1</span></label>
    <label>Neurons/Layer <input type="range" id="pg-neurons" min="1" max="8" step="1" value="4"><span class="demo-value" id="val-pg-neurons">4</span></label>
    <label>Learning Rate <input type="range" id="pg-lr" min="0.1" max="3" step="0.1" value="1"><span class="demo-value" id="val-pg-lr">1.0</span></label>
  </div>
  <div class="demo-controls">
    <button id="btn-pg-train">Train</button>
    <button id="btn-pg-stop">Stop</button>
    <button id="btn-pg-reset">Reset</button>
    <label>Activation:
      <button id="pg-act-sigmoid" class="active">Sigmoid</button>
      <button id="pg-act-relu">ReLU</button>
      <button id="pg-act-tanh">Tanh</button>
    </label>
    <span class="demo-value" id="pg-epoch">Epoch: 0</span>
  </div>
  <div class="demo-info" id="info-playground">Configure the network and click Train.</div>
  <div class="demo-caption">
Default: sigmoid activations, SGD on binary cross-entropy loss. Weights are initialized with Kaiming (He) initialization and biases with zeros.</div>
</div>

---

## 6. Activation Functions Compared

The activation function determines the type of nonlinearity each neuron introduces. Without nonlinear activation functions, stacking layers would still produce only a linear model. The three most common choices are sigmoid, tanh, and ReLU.

### Sigmoid

$$
\sigma(z) = \frac{1}{1+e^{-z}}
$$

Maps outputs to the range (0, 1). It is smooth and interpretable as a probability, but its gradients become very small for large positive or negative inputs, which can slow learning.

### Tanh

$$
\tanh(z) = \frac{e^z - e^{-z}}{e^z + e^{-z}}
$$

Maps outputs to the range (-1, 1). Because it is zero-centered, optimization is often more stable than with sigmoid.

### ReLU

$$
f(z) = \max(0, z)
$$

Simple and computationally efficient. It avoids saturation for positive inputs and is the standard choice in modern deep learning. However, neurons can become inactive if they receive only negative inputs during training.

<div class="interactive-demo" id="demo-activations">
  <canvas id="canvas-activations" width="680" height="300"></canvas>
  <div class="demo-controls">
    <button id="act-sigmoid" class="active">Sigmoid</button>
    <button id="act-tanh">Tanh</button>
    <button id="act-relu">ReLU</button>
    <button id="act-all">Show All</button>
  </div>
<div class="demo-caption">Activation comparison.</div>
</div>

---

## 7. How Backpropagation Works (Intuition)

Training a neural network means finding weights that minimize the loss. We use gradient descent for this, but the challenge is how do we compute the gradient of the loss with respect to a weight that is deep inside the network? The key idea is the chain rule. The loss depends on the output, the output depends on intermediate activations, and those activations depend on earlier weights. By applying the chain rule, we can trace how a small change in a weight affects the final loss:

$$
\frac{\partial L}{\partial w}
=
\frac{\partial L}{\partial a}
\cdot
\frac{\partial a}{\partial z}
\cdot
\frac{\partial z}{\partial w}
$$

Backpropagation computes these gradients layer by layer, starting from the output and moving backward through the network. Each layer receives a gradient from the next layer and passes it backward after scaling it by its local derivative. In this way, every weight in the network learns how it contributed to the final error and how it should change to reduce it.

<div class="interactive-demo" id="demo-backprop">
  <canvas id="canvas-backprop" width="680" height="460"></canvas>
  <div class="demo-controls">
    <button id="btn-bp-prev">Previous</button>
    <button id="btn-bp-next">Next step</button>
    <button id="btn-bp-reset">Reset</button>
    <span class="demo-value" id="bp-step">1 / 9</span>
  </div>
</div>

<div class="demo-hint">A short note: <code>z</code> is the pre-activation (weighted sum + bias), <code>a</code> is the activation (sigmoid of z), <code>ŷ</code> is the network's prediction, <code>L</code> is the loss, <code>δ</code> is the gradient of the loss with respect to <code>z</code> at that neuron, and <code>η</code> is the learning rate. We derive backprop fully in the <a href="{{ site.baseurl }}/backpropagation/">Backpropagation Visualized</a> guide.</div>

---

## 8. Universal Approximation
One of the most important theoretical results in neural network research is the Universal Approximation Theorem: a neural network with a single hidden layer containing enough neurons can approximate any continuous function on a bounded domain to arbitrary accuracy. In other words, even a shallow network is expressive enough to represent very complex functions. The practical question, however, is not whether a network can represent a function, but how many neurons are needed and whether such a network can be trained efficiently in practice.

<div class="interactive-demo" id="demo-universal">
  <canvas id="canvas-universal" width="680" height="340"></canvas>
  <div class="demo-controls">
    <label>Hidden Neurons <input type="range" id="ua-neurons" min="1" max="20" step="1" value="3"><span class="demo-value" id="val-ua-neurons">3</span></label>
    <button id="btn-ua-train">Train</button>
    <button id="btn-ua-reset">Reset</button>
    <span class="demo-value" id="ua-epoch">Epoch: 0</span>
  </div>
  <div class="demo-caption" id="info-universal">Target: sin(x). Universal Approximation.</div>
</div>
---

## 9. Summary

| Concept | Key Idea |
|---|---|
| Perceptron | A single neuron: weighted sum + activation. With sigmoid activation, it is equivalent to logistic regression. |
| Linear separability | A single perceptron can learn linearly separable patterns (AND, OR) but not XOR. |
| Multi-Layer Perceptron | Adding hidden layers enables nonlinear decision boundaries. |
| Backpropagation | Applies the chain rule layer by layer to compute gradients for all weights. |
| Activation functions | Sigmoid, tanh, and ReLU introduce nonlinearity with different training behavior. |

**What’s next:** In [Backpropagation Visualized]({{ site.baseurl }}/backpropagation/), we will explore how backpropagation works step by step and why deep networks can be difficult to train.

#### Continue the ML Series

This post is part of a bigger [Interactive Machine Learning]({{ site.baseurl }}/ml/) series. If you would like to learn more, check out the other posts in this series.


<script>
(function(){
  // ==================== SHARED UTILITIES ====================
  window.NN = window.NN || {};

  function getColors() { return window.Viz.colors(); }
  NN.getColors = getColors;

  function setupCanvas(canvas){
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.width, h = canvas.height;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx._w = w; ctx._h = h;
    return ctx;
  }
  NN.setupCanvas = setupCanvas;

  // Activation functions
  function sigmoid(x){ return 1/(1+Math.exp(-Math.max(-500,Math.min(500,x)))); }
  function sigmoidDeriv(a){ return a*(1-a); }
  function relu(x){ return Math.max(0,x); }
  function reluDeriv(a){ return a>0?1:0; }
  function tanh_(x){ var e=Math.exp(2*Math.max(-500,Math.min(500,x))); return (e-1)/(e+1); }
  function tanhDeriv(a){ return 1-a*a; }
  NN.sigmoid = sigmoid; NN.sigmoidDeriv = sigmoidDeriv;
  NN.relu = relu; NN.reluDeriv = reluDeriv;
  NN.tanh = tanh_; NN.tanhDeriv = tanhDeriv;

  function getActFn(name){
    if(name==='relu') return {fn:relu,deriv:reluDeriv};
    if(name==='tanh') return {fn:tanh_,deriv:tanhDeriv};
    return {fn:sigmoid,deriv:sigmoidDeriv};
  }
  NN.getActFn = getActFn;

  // MLP class
  function MLP(sizes, actName){
    this.sizes = sizes;
    this.L = sizes.length-1;
    this.actName = actName||'sigmoid';
    var act = getActFn(this.actName);
    this.actFn = act.fn;
    this.actDeriv = act.deriv;
    this.W = []; this.b = [];
    for(var l=0;l<this.L;l++){
      var rows=sizes[l+1], cols=sizes[l];
      var scale = Math.sqrt(2.0/cols);
      var w=[];
      for(var i=0;i<rows;i++){
        var row=[];
        for(var j=0;j<cols;j++) row.push((Math.random()*2-1)*scale);
        w.push(row);
      }
      this.W.push(w);
      var bb=[];
      for(var i=0;i<rows;i++) bb.push(0);
      this.b.push(bb);
    }
  }
  MLP.prototype.forward = function(x){
    var a = x.slice();
    this.as = [a.slice()];
    this.zs = [];
    for(var l=0;l<this.L;l++){
      var W=this.W[l], b=this.b[l];
      var z=[], newA=[];
      for(var i=0;i<W.length;i++){
        var s=b[i];
        for(var j=0;j<W[i].length;j++) s+=W[i][j]*a[j];
        z.push(s);
        if(l===this.L-1) newA.push(sigmoid(s));
        else newA.push(this.actFn(s));
      }
      this.zs.push(z);
      a=newA;
      this.as.push(a.slice());
    }
    return a;
  };
  MLP.prototype.train = function(X,y,lr,epochs){
    var totalLoss=0;
    for(var ep=0;ep<epochs;ep++){
      totalLoss=0;
      for(var s=0;s<X.length;s++){
        var out=this.forward(X[s]);
        var target=y[s];
        totalLoss += -( target*Math.log(out[0]+1e-15) + (1-target)*Math.log(1-out[0]+1e-15) );
        // Backprop
        var deltas=[];
        for(var l=this.L-1;l>=0;l--){
          var delta=[];
          if(l===this.L-1){
            for(var i=0;i<this.as[l+1].length;i++){
              delta.push(this.as[l+1][i]-target);
            }
          } else {
            var Wnext=this.W[l+1];
            var dnext=deltas[0];
            for(var i=0;i<this.as[l+1].length;i++){
              var err=0;
              for(var j=0;j<dnext.length;j++) err+=Wnext[j][i]*dnext[j];
              var d_act = (this.actName==='relu') ? reluDeriv(this.as[l+1][i]) :
                          (this.actName==='tanh') ? tanhDeriv(this.as[l+1][i]) :
                          sigmoidDeriv(this.as[l+1][i]);
              delta.push(err * d_act);
            }
          }
          deltas.unshift(delta);
        }
        // Update
        for(var l=0;l<this.L;l++){
          var d=deltas[l], aIn=this.as[l];
          for(var i=0;i<this.W[l].length;i++){
            for(var j=0;j<this.W[l][i].length;j++){
              this.W[l][i][j] -= lr*d[i]*aIn[j];
            }
            this.b[l][i] -= lr*d[i];
          }
        }
      }
    }
    return totalLoss/X.length;
  };
  MLP.prototype.predict = function(x){ return this.forward(x)[0]; };
  NN.MLP = MLP;

  // Datasets
  NN.datasets = {
    xor: function(){
      return {X:[[0,0],[0,1],[1,0],[1,1]], y:[0,1,1,0]};
    },
    circle: function(n){
      n=n||100;
      var X=[],y=[];
      for(var i=0;i<n;i++){
        var r=Math.random()*2, a=Math.random()*Math.PI*2;
        var px=r*Math.cos(a)*0.4+0.5, py=r*Math.sin(a)*0.4+0.5;
        px=Math.max(0,Math.min(1,px)); py=Math.max(0,Math.min(1,py));
        X.push([px,py]);
        y.push(r<1?1:0);
      }
      return {X:X,y:y};
    },
    spiral: function(n){
      n=n||100;
      var X=[],y=[];
      var half=Math.floor(n/2);
      for(var c=0;c<2;c++){
        for(var i=0;i<half;i++){
          var t=i/half*2*Math.PI+c*Math.PI;
          var r=(i/half)*0.4+0.05;
          var px=r*Math.cos(t)+0.5+(Math.random()-0.5)*0.05;
          var py=r*Math.sin(t)+0.5+(Math.random()-0.5)*0.05;
          px=Math.max(0,Math.min(1,px)); py=Math.max(0,Math.min(1,py));
          X.push([px,py]);
          y.push(c);
        }
      }
      return {X:X,y:y};
    },
    linear: function(n){
      n=n||80;
      var X=[],y=[];
      for(var i=0;i<n;i++){
        var px=Math.random(), py=Math.random();
        X.push([px,py]);
        y.push(px+py>1?1:0);
      }
      return {X:X,y:y};
    }
  };

  // Drawing utilities
  function drawDecisionBoundary(ctx,net,w,h,res){
    res=res||3;
    var img=ctx.createImageData(Math.ceil(w/res),Math.ceil(h/res));
    var c=getColors();
    for(var py=0;py<h;py+=res){
      for(var px=0;px<w;px+=res){
        var nx=px/w, ny=1-py/h;
        var out=net.predict([nx,ny]);
        var r,g,b;
        if(out>0.5){
          r=247; g=118; b=142;
        } else {
          r=122; g=162; b=247;
        }
        var alpha=Math.abs(out-0.5)*0.6+0.05;
        var idx=4*(Math.floor(py/res)*Math.ceil(w/res)+Math.floor(px/res));
        img.data[idx]=r; img.data[idx+1]=g; img.data[idx+2]=b; img.data[idx+3]=Math.floor(alpha*255);
      }
    }
    var tmpCanvas=document.createElement('canvas');
    tmpCanvas.width=Math.ceil(w/res); tmpCanvas.height=Math.ceil(h/res);
    tmpCanvas.getContext('2d').putImageData(img,0,0);
    ctx.drawImage(tmpCanvas,0,0,w,h);
  }
  NN.drawDecisionBoundary = drawDecisionBoundary;

  function drawPoints(ctx,X,y,w,h,radius){
    radius=radius||5;
    var c=getColors();
    for(var i=0;i<X.length;i++){
      var px=X[i][0]*w, py=(1-X[i][1])*h;
      ctx.beginPath();
      ctx.arc(px,py,radius,0,Math.PI*2);
      ctx.fillStyle=y[i]===1?c.class1:c.class0;
      ctx.fill();
      ctx.strokeStyle=c.text;
      ctx.lineWidth=1.5;
      ctx.stroke();
    }
  }
  NN.drawPoints = drawPoints;

  function drawLossCurve(ctx,losses,w,h){
    var c=getColors();
    ctx.fillStyle=c.bg;
    ctx.fillRect(0,0,w,h);
    if(losses.length<2) {
      ctx.fillStyle=c.textSec;
      ctx.font='13px sans-serif';
      ctx.textAlign='center';
      ctx.fillText('Loss curve will appear during training',w/2,h/2);
      return;
    }
    var pad=40;
    var maxL=Math.max.apply(null,losses);
    var minL=Math.min.apply(null,losses);
    if(maxL===minL) maxL=minL+1;
    // Axes
    ctx.strokeStyle=c.border;
    ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad,10); ctx.lineTo(pad,h-pad); ctx.lineTo(w-10,h-pad); ctx.stroke();
    // Labels
    ctx.fillStyle=c.textSec;
    ctx.font='11px JetBrains Mono, monospace';
    ctx.textAlign='right';
    ctx.fillText(maxL.toFixed(2),pad-4,16);
    ctx.fillText(minL.toFixed(2),pad-4,h-pad);
    ctx.textAlign='center';
    ctx.fillText('Epoch',w/2,h-5);
    ctx.save(); ctx.translate(12,h/2); ctx.rotate(-Math.PI/2); ctx.fillText('Loss',0,0); ctx.restore();
    // Curve
    ctx.strokeStyle=c.accent;
    ctx.lineWidth=2;
    ctx.beginPath();
    for(var i=0;i<losses.length;i++){
      var x=pad+i/(losses.length-1)*(w-pad-10);
      var y_=10+(1-(losses[i]-minL)/(maxL-minL))*(h-pad-10);
      if(i===0) ctx.moveTo(x,y_); else ctx.lineTo(x,y_);
    }
    ctx.stroke();
  }
  NN.drawLossCurve = drawLossCurve;

  // Theme observer
  var obs = new MutationObserver(function(){ if(NN.onThemeChange) NN.onThemeChange(); });
  obs.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','class']});

})();
</script>

<!-- ==================== DEMO 1: Single Neuron ==================== -->
<script>
(function(){
  var canvas = document.getElementById('canvas-neuron');
  var ctx = NN.setupCanvas(canvas);
  var w=canvas.style.width.replace('px','')|0, h=canvas.style.height.replace('px','')|0;
  var slW1=document.getElementById('neuron-w1');
  var slW2=document.getElementById('neuron-w2');
  var slB=document.getElementById('neuron-b');
  var valW1=document.getElementById('val-w1');
  var valW2=document.getElementById('val-w2');
  var valB=document.getElementById('val-b');

  function draw(){
    var c=NN.getColors();
    var w1=parseFloat(slW1.value), w2=parseFloat(slW2.value), b=parseFloat(slB.value);
    valW1.textContent=w1.toFixed(1); valW2.textContent=w2.toFixed(1); valB.textContent=b.toFixed(1);
    ctx.fillStyle=c.bg;
    ctx.fillRect(0,0,w,h);

    // Left: Neuron diagram (0..300)
    var cx=150,cy=h/2;
    // Input nodes
    var inputs=[{label:'x\u2081',y:cy-60},{label:'x\u2082',y:cy+60}];
    var weights=[w1,w2];
    ctx.font='13px sans-serif';
    ctx.textAlign='center';
    for(var i=0;i<2;i++){
      ctx.beginPath(); ctx.arc(50,inputs[i].y,20,0,Math.PI*2);
      ctx.fillStyle=c.bgSec; ctx.fill(); ctx.strokeStyle=c.border; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle=c.text; ctx.fillText(inputs[i].label,50,inputs[i].y+4);
      // Weight line
      var lw=Math.min(6,Math.abs(weights[i])*1.5+0.5);
      ctx.strokeStyle=weights[i]>=0?c.positive:c.negative;
      ctx.lineWidth=lw;
      ctx.beginPath(); ctx.moveTo(70,inputs[i].y); ctx.lineTo(130,cy); ctx.stroke();
      ctx.fillStyle=weights[i]>=0?c.positive:c.negative;
      ctx.font='11px JetBrains Mono, monospace';
      ctx.fillText('w='+(weights[i]>=0?'+':'')+weights[i].toFixed(1), 100, inputs[i].y+(i===0?-12:16));
    }
    // Neuron body
    ctx.beginPath(); ctx.arc(cx,cy,26,0,Math.PI*2);
    ctx.fillStyle=c.accent+'33'; ctx.fill(); ctx.strokeStyle=c.accent; ctx.lineWidth=2.5; ctx.stroke();
    ctx.fillStyle=c.text; ctx.font='11px JetBrains Mono, monospace'; ctx.textAlign='center';
    ctx.fillText('\u03C3(\u03A3)',cx,cy+4);
    // Bias
    ctx.fillStyle=c.textSec; ctx.font='11px JetBrains Mono, monospace';
    ctx.fillText('b='+b.toFixed(1),cx,cy+42);
    // Output
    ctx.strokeStyle=c.accent; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx+26,cy); ctx.lineTo(cx+80,cy); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx+100,cy,20,0,Math.PI*2);
    ctx.fillStyle=c.bgSec; ctx.fill(); ctx.strokeStyle=c.border; ctx.lineWidth=2; ctx.stroke();
    ctx.fillStyle=c.text; ctx.font='12px sans-serif'; ctx.fillText('out',cx+100,cy+4);

    // Right: Decision boundary (340..680)
    var ox=340, ow=w-ox-10, oh=h-20, oy=10;
    ctx.fillStyle=c.bgSec;
    ctx.fillRect(ox,oy,ow,oh);
    ctx.strokeStyle=c.border; ctx.lineWidth=1;
    ctx.strokeRect(ox,oy,ow,oh);
    // Color regions
    var res=4;
    for(var py=0;py<oh;py+=res){
      for(var px=0;px<ow;px+=res){
        var nx=px/ow*6-3, ny=(1-py/oh)*6-3;
        var z_=w1*nx+w2*ny+b;
        var a_=NN.sigmoid(z_);
        var r,g,bb2;
        if(a_>0.5){r=247;g=118;bb2=142;} else {r=122;g=162;bb2=247;}
        var alpha=Math.abs(a_-0.5)*0.5+0.05;
        ctx.fillStyle='rgba('+r+','+g+','+bb2+','+alpha.toFixed(2)+')';
        ctx.fillRect(ox+px,oy+py,res,res);
      }
    }
    // Decision line: w1*x + w2*y + b = 0
    if(Math.abs(w2)>0.01){
      var x0=-3, y0=(-b-w1*x0)/w2;
      var x1_=3, y1_=(-b-w1*x1_)/w2;
      var sx0=ox+(x0+3)/6*ow, sy0=oy+(1-(y0+3)/6)*oh;
      var sx1=ox+(x1_+3)/6*ow, sy1=oy+(1-(y1_+3)/6)*oh;
      ctx.strokeStyle=c.text; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(sx0,sy0); ctx.lineTo(sx1,sy1); ctx.stroke();
    } else if(Math.abs(w1)>0.01){
      var xv=-b/w1;
      var sx=ox+(xv+3)/6*ow;
      ctx.strokeStyle=c.text; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(sx,oy); ctx.lineTo(sx,oy+oh); ctx.stroke();
    }
    // Axis labels
    ctx.fillStyle=c.textSec; ctx.font='11px sans-serif'; ctx.textAlign='center';
    ctx.fillText('x\u2081',ox+ow/2,oy+oh+15);
    ctx.save(); ctx.translate(ox-8,oy+oh/2); ctx.rotate(-Math.PI/2); ctx.fillText('x\u2082',0,0); ctx.restore();
  }

  slW1.addEventListener('input',draw);
  slW2.addEventListener('input',draw);
  slB.addEventListener('input',draw);
  draw();
  NN.onThemeChange = function(){ draw(); };
})();
</script>

<!-- ==================== DEMO 2: Logic Gates ==================== -->
<script>
(function(){
  var canvas=document.getElementById('canvas-gates');
  var ctx=NN.setupCanvas(canvas);
  var w=680,h=340;
  var btnAnd=document.getElementById('btn-and');
  var btnOr=document.getElementById('btn-or');
  var btnReset=document.getElementById('btn-gates-reset');
  var epochEl=document.getElementById('gates-epoch');
  var infoEl=document.getElementById('info-gates');

  var gateData={and:{y:[0,0,0,1]},or:{y:[0,1,1,1]}};
  var X=[[0,0],[0,1],[1,0],[1,1]];
  var curGate='and';
  var gW1=0,gW2=0,gB=0;
  var animId=null, epoch=0;

  function resetWeights(){ gW1=(Math.random()-0.5)*0.5; gW2=(Math.random()-0.5)*0.5; gB=(Math.random()-0.5)*0.5; epoch=0; }
  resetWeights();

  function predict(x1,x2){ return NN.sigmoid(gW1*x1+gW2*x2+gB); }

  function updateTable(){
    var labels=gateData[curGate].y;
    for(var i=0;i<4;i++){
      var x=X[i];
      document.getElementById('gt-'+x[0]+''+x[1]).textContent=labels[i];
      var p=predict(x[0],x[1]);
      var pred=p>=0.5?1:0;
      var el=document.getElementById('gp-'+x[0]+''+x[1]);
      el.textContent=pred+' ('+p.toFixed(2)+')';
      el.className=(pred===labels[i])?'correct':'wrong';
    }
  }

  function draw(){
    var c=NN.getColors();
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    var labels=gateData[curGate].y;
    // Plot area
    var ox=60,oy=30,ow=280,oh=280;
    // Color regions
    var res=4;
    for(var py=0;py<oh;py+=res){
      for(var px=0;px<ow;px+=res){
        var nx=px/ow*1.4-0.2, ny=(1-py/oh)*1.4-0.2;
        var a_=predict(nx,ny);
        var r_,g_,b_;
        if(a_>0.5){r_=247;g_=118;b_=142;} else {r_=122;g_=162;b_=247;}
        var alpha=Math.abs(a_-0.5)*0.5+0.08;
        ctx.fillStyle='rgba('+r_+','+g_+','+b_+','+alpha.toFixed(2)+')';
        ctx.fillRect(ox+px,oy+py,res,res);
      }
    }
    ctx.strokeStyle=c.border; ctx.lineWidth=1; ctx.strokeRect(ox,oy,ow,oh);
    // Decision line
    if(Math.abs(gW2)>0.01||Math.abs(gW1)>0.01){
      ctx.strokeStyle=c.text; ctx.lineWidth=2; ctx.setLineDash([6,4]);
      if(Math.abs(gW2)>0.01){
        var x0=-0.2,y0=(-gB-gW1*x0)/gW2;
        var x1_=1.2,y1_=(-gB-gW1*x1_)/gW2;
        ctx.beginPath();
        ctx.moveTo(ox+(x0+0.2)/1.4*ow, oy+(1-(y0+0.2)/1.4)*oh);
        ctx.lineTo(ox+(x1_+0.2)/1.4*ow, oy+(1-(y1_+0.2)/1.4)*oh);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    // Data points
    for(var i=0;i<4;i++){
      var px=ox+(X[i][0]+0.2)/1.4*ow;
      var py=oy+(1-(X[i][1]+0.2)/1.4)*oh;
      ctx.beginPath(); ctx.arc(px,py,8,0,Math.PI*2);
      ctx.fillStyle=labels[i]===1?c.class1:c.class0;
      ctx.fill(); ctx.strokeStyle=c.text; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle=c.text; ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
      ctx.fillText(labels[i],px,py+4);
    }
    // Labels
    ctx.fillStyle=c.textSec; ctx.font='12px sans-serif'; ctx.textAlign='center';
    ctx.fillText('x\u2081',ox+ow/2,oy+oh+20);
    ctx.save(); ctx.translate(ox-14,oy+oh/2); ctx.rotate(-Math.PI/2); ctx.fillText('x\u2082',0,0); ctx.restore();
    // Right side: gate name and weights
    var rx=380;
    ctx.fillStyle=c.text; ctx.font='bold 18px sans-serif'; ctx.textAlign='left';
    ctx.fillText(curGate.toUpperCase()+' Gate',rx,60);
    ctx.font='13px JetBrains Mono, monospace'; ctx.fillStyle=c.textSec;
    ctx.fillText('w\u2081 = '+gW1.toFixed(3),rx,90);
    ctx.fillText('w\u2082 = '+gW2.toFixed(3),rx,110);
    ctx.fillText('b  = '+gB.toFixed(3),rx,130);
    ctx.fillText('epoch = '+epoch,rx,160);
    updateTable();
    epochEl.textContent='Epoch: '+epoch;
  }

  function trainStep(){
    var labels=gateData[curGate].y;
    var lr=2;
    for(var i=0;i<4;i++){
      var p=predict(X[i][0],X[i][1]);
      var err=p-labels[i];
      gW1-=lr*err*X[i][0];
      gW2-=lr*err*X[i][1];
      gB-=lr*err;
    }
    epoch++;
  }

  function startTraining(){
    if(animId) cancelAnimationFrame(animId);
    resetWeights();
    var maxEp=200;
    function step(){
      trainStep();
      draw();
      if(epoch<maxEp){
        animId=requestAnimationFrame(step);
      } else {
        infoEl.textContent='Training complete! All predictions correct for '+curGate.toUpperCase()+'.';
        animId=null;
      }
    }
    step();
  }

  btnAnd.addEventListener('click',function(){
    curGate='and'; btnAnd.classList.add('active'); btnOr.classList.remove('active');
    infoEl.textContent='Training perceptron on AND gate...'; startTraining();
  });
  btnOr.addEventListener('click',function(){
    curGate='or'; btnOr.classList.add('active'); btnAnd.classList.remove('active');
    infoEl.textContent='Training perceptron on OR gate...'; startTraining();
  });
  btnReset.addEventListener('click',function(){
    if(animId) cancelAnimationFrame(animId); animId=null;
    resetWeights(); draw(); infoEl.textContent='Click a button to train the perceptron on a logic gate.';
  });
  draw();
})();
</script>

<!-- ==================== DEMO 3: XOR Failure ==================== -->
<script>
(function(){
  var canvas=document.getElementById('canvas-xor-fail');
  var ctx=NN.setupCanvas(canvas);
  var w=680,h=340;
  var btnTrain=document.getElementById('btn-xor-train');
  var btnReset=document.getElementById('btn-xor-reset');
  var epochEl=document.getElementById('xor-fail-epoch');
  var infoEl=document.getElementById('info-xor-fail');

  var X=[[0,0],[0,1],[1,0],[1,1]];
  var Y=[0,1,1,0];
  var xW1=0,xW2=0,xB=0, epoch=0, animId=null;

  function resetW(){ xW1=(Math.random()-0.5); xW2=(Math.random()-0.5); xB=(Math.random()-0.5)*0.2; epoch=0; }
  resetW();

  function predict(x1,x2){ return NN.sigmoid(xW1*x1+xW2*x2+xB); }

  function updateTable(){
    for(var i=0;i<4;i++){
      var p=predict(X[i][0],X[i][1]);
      var pred=p>=0.5?1:0;
      var el=document.getElementById('xf-'+X[i][0]+''+X[i][1]);
      el.textContent=pred+' ('+p.toFixed(2)+')';
      el.className=(pred===Y[i])?'correct':'wrong';
    }
  }

  function draw(){
    var c=NN.getColors();
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    var ox=60,oy=30,ow=280,oh=280;
    var res=4;
    for(var py=0;py<oh;py+=res){
      for(var px=0;px<ow;px+=res){
        var nx=px/ow*1.4-0.2,ny=(1-py/oh)*1.4-0.2;
        var a_=predict(nx,ny);
        var r_,g_,b_;
        if(a_>0.5){r_=247;g_=118;b_=142;}else{r_=122;g_=162;b_=247;}
        var alpha=Math.abs(a_-0.5)*0.5+0.08;
        ctx.fillStyle='rgba('+r_+','+g_+','+b_+','+alpha.toFixed(2)+')';
        ctx.fillRect(ox+px,oy+py,res,res);
      }
    }
    ctx.strokeStyle=c.border; ctx.lineWidth=1; ctx.strokeRect(ox,oy,ow,oh);
    if(Math.abs(xW2)>0.01){
      ctx.strokeStyle=c.text; ctx.lineWidth=2; ctx.setLineDash([6,4]);
      var x0=-0.2,y0=(-xB-xW1*x0)/xW2;
      var x1_=1.2,y1_=(-xB-xW1*x1_)/xW2;
      ctx.beginPath();
      ctx.moveTo(ox+(x0+0.2)/1.4*ow,oy+(1-(y0+0.2)/1.4)*oh);
      ctx.lineTo(ox+(x1_+0.2)/1.4*ow,oy+(1-(y1_+0.2)/1.4)*oh);
      ctx.stroke(); ctx.setLineDash([]);
    }
    for(var i=0;i<4;i++){
      var px=ox+(X[i][0]+0.2)/1.4*ow;
      var py=oy+(1-(X[i][1]+0.2)/1.4)*oh;
      ctx.beginPath(); ctx.arc(px,py,8,0,Math.PI*2);
      ctx.fillStyle=Y[i]===1?c.class1:c.class0;
      ctx.fill(); ctx.strokeStyle=c.text; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle=c.text; ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
      ctx.fillText(Y[i],px,py+4);
    }
    ctx.fillStyle=c.textSec; ctx.font='12px sans-serif'; ctx.textAlign='center';
    ctx.fillText('x\u2081',ox+ow/2,oy+oh+20);
    ctx.save(); ctx.translate(ox-14,oy+oh/2); ctx.rotate(-Math.PI/2); ctx.fillText('x\u2082',0,0); ctx.restore();
    // Right info
    var rx=380;
    ctx.fillStyle=c.text; ctx.font='bold 18px sans-serif'; ctx.textAlign='left';
    ctx.fillText('XOR Gate',rx,60);
    ctx.font='13px JetBrains Mono, monospace'; ctx.fillStyle=c.textSec;
    ctx.fillText('w\u2081 = '+xW1.toFixed(3),rx,90);
    ctx.fillText('w\u2082 = '+xW2.toFixed(3),rx,110);
    ctx.fillText('b  = '+xB.toFixed(3),rx,130);
    ctx.fillText('epoch = '+epoch,rx,160);
    var loss=0;
    for(var i=0;i<4;i++){
      var p=predict(X[i][0],X[i][1]);
      loss+=-(Y[i]*Math.log(p+1e-15)+(1-Y[i])*Math.log(1-p+1e-15));
    }
    ctx.fillText('loss  = '+(loss/4).toFixed(4),rx,185);
    // Accuracy
    var correct=0;
    for(var i=0;i<4;i++) if((predict(X[i][0],X[i][1])>=0.5?1:0)===Y[i]) correct++;
    ctx.fillStyle=correct===4?c.green:c.class1;
    ctx.fillText('accuracy = '+correct+'/4',rx,210);
    updateTable();
    epochEl.textContent='Epoch: '+epoch;
  }

  function trainStep(){
    var lr=1;
    for(var i=0;i<X.length;i++){
      var p=predict(X[i][0],X[i][1]);
      var err=p-Y[i];
      xW1-=lr*err*X[i][0]; xW2-=lr*err*X[i][1]; xB-=lr*err;
    }
    epoch++;
  }

  btnTrain.addEventListener('click',function(){
    if(animId) cancelAnimationFrame(animId);
    resetW();
    infoEl.textContent='Training... watch the line oscillate. It can never solve XOR.';
    var maxEp=500;
    function step(){
      for(var i=0;i<2;i++) trainStep();
      draw();
      if(epoch<maxEp) animId=requestAnimationFrame(step);
      else { infoEl.textContent='500 epochs done. The perceptron FAILED, accuracy is never 4/4. XOR is not linearly separable.'; animId=null; }
    }
    step();
  });
  btnReset.addEventListener('click',function(){
    if(animId) cancelAnimationFrame(animId); animId=null;
    resetW(); draw(); infoEl.textContent='The perceptron will try, and fail. Watch the line oscillate.';
  });
  draw();
})();
</script>

<!-- ==================== DEMO 4: XOR with MLP ==================== -->
<script>
(function(){
  var canvasB=document.getElementById('canvas-xor-boundary');
  var canvasL=document.getElementById('canvas-xor-loss');
  var canvasN=document.getElementById('canvas-xor-network');
  var ctxB=NN.setupCanvas(canvasB);
  var ctxL=NN.setupCanvas(canvasL);
  var ctxN=NN.setupCanvas(canvasN);
  var bw=320,bh=320;
  var btnTrain=document.getElementById('btn-xor-mlp-train');
  var btnReset=document.getElementById('btn-xor-mlp-reset');
  var slLR=document.getElementById('xor-mlp-lr');
  var valLR=document.getElementById('val-xor-lr');
  var epochEl=document.getElementById('xor-mlp-epoch');
  var infoEl=document.getElementById('info-xor-mlp');

  var X=[[0,0],[0,1],[1,0],[1,1]], Y=[0,1,1,0];
  var net=null, losses=[], epoch=0, animId=null;

  function initNet(){
    net=new NN.MLP([2,2,1],'sigmoid');
    // The shared MLP class uses He init + zero biases. For a 2-2-1 sigmoid
    // network on XOR this leaves the two hidden neurons nearly symmetric,
    // and SGD often converges to a 3/4 local minimum where one input pattern
    // stays misclassified. Override with Xavier (Glorot) init + small random
    // biases to break symmetry and converge reliably.
    for(var l=0;l<net.L;l++){
      var rows=net.sizes[l+1], cols=net.sizes[l];
      var scale=Math.sqrt(6.0/(cols+rows));
      for(var i=0;i<rows;i++){
        for(var j=0;j<cols;j++){
          net.W[l][i][j]=(Math.random()*2-1)*scale;
        }
        net.b[l][i]=(Math.random()*2-1)*0.1;
      }
    }
    losses=[]; epoch=0;
  }
  initNet();

  function updateTable(){
    for(var i=0;i<4;i++){
      var p=net.predict(X[i]);
      var pred=p>=0.5?1:0;
      var el=document.getElementById('xm-'+X[i][0]+''+X[i][1]);
      el.textContent=pred+' ('+p.toFixed(3)+')';
      el.className=(pred===Y[i])?'correct':'wrong';
    }
  }

  function draw(){
    var c=NN.getColors();
    // Boundary
    ctxB.fillStyle=c.bg; ctxB.fillRect(0,0,bw,bh);
    var padL=34, padR=10, padT=10, padB=24;
    var pw=bw-padL-padR, ph=bh-padT-padB;
    ctxB.save();
    ctxB.translate(padL, padT);
    NN.drawDecisionBoundary(ctxB,net,pw,ph,3);
    ctxB.restore();
    // Border
    ctxB.strokeStyle=c.border; ctxB.lineWidth=1; ctxB.strokeRect(padL,padT,pw,ph);
    // Points
    for(var i=0;i<4;i++){
      var px=padL+X[i][0]*pw, py=padT+(1-X[i][1])*ph;
      ctxB.beginPath(); ctxB.arc(px,py,7,0,Math.PI*2);
      ctxB.fillStyle=Y[i]===1?c.class1:c.class0;
      ctxB.fill(); ctxB.strokeStyle=c.text; ctxB.lineWidth=2; ctxB.stroke();
    }
    // Axis labels
    ctxB.fillStyle=c.textSec; ctxB.font='11px sans-serif';
    ctxB.textAlign='center';
    ctxB.fillText('x\u2081', padL+pw/2, bh-6);
    ctxB.save();
    ctxB.translate(12, padT+ph/2);
    ctxB.rotate(-Math.PI/2);
    ctxB.fillText('x\u2082', 0, 0);
    ctxB.restore();
    // Loss
    NN.drawLossCurve(ctxL,losses,bw,bh);
    // Network diagram
    drawNetwork();
    updateTable();
    epochEl.textContent='Epoch: '+epoch;
  }

  function drawNetwork(){
    var c=NN.getColors();
    var nw=ctxN._w, nh=ctxN._h;
    ctxN.fillStyle=c.bg; ctxN.fillRect(0,0,nw,nh);
    var r=18;
    var xIn=50, xH=nw/2, xOut=nw-50;
    var yTop=nh/2-60, yBot=nh/2+60, yMid=nh/2;
    var inputs=[{label:'x\u2081',y:yTop},{label:'x\u2082',y:yBot}];
    var hidden=[{y:yTop},{y:yBot}];
    var output={y:yMid};
    // Layer headers
    ctxN.fillStyle=c.textSec; ctxN.font='10px JetBrains Mono, monospace'; ctxN.textAlign='center';
    ctxN.fillText('Input', xIn, 16);
    ctxN.fillText('Hidden', xH, 16);
    ctxN.fillText('Output', xOut, 16);

    function fmt(v){ return (v>=0?'+':'')+v.toFixed(2); }

    // Input -> Hidden (W1[j][i] = weight from input i to hidden j)
    ctxN.font='10px JetBrains Mono, monospace';
    for(var i=0;i<2;i++){
      for(var j=0;j<2;j++){
        var w_=net?net.W[0][j][i]:0;
        var lw=Math.min(4, Math.abs(w_)*1.0+0.4);
        ctxN.strokeStyle=w_>=0?c.positive:c.negative;
        ctxN.lineWidth=lw;
        ctxN.beginPath();
        ctxN.moveTo(xIn+r, inputs[i].y);
        ctxN.lineTo(xH-r, hidden[j].y);
        ctxN.stroke();
        // Label position: 35% along line for top input, 65% for bottom input
        // so crossing diagonals do not overlap at center
        var t=(i===0?0.32:0.68);
        var lx=(xIn+r)+t*((xH-r)-(xIn+r));
        var ly=inputs[i].y+t*(hidden[j].y-inputs[i].y);
        var dy=(hidden[j].y>inputs[i].y)?-7:9;
        ctxN.fillStyle=w_>=0?c.positive:c.negative;
        ctxN.fillText(fmt(w_), lx, ly+dy);
      }
    }
    // Hidden -> Output (W2[0][j] = weight from hidden j to output)
    for(var j=0;j<2;j++){
      var w_=net?net.W[1][0][j]:0;
      var lw=Math.min(4, Math.abs(w_)*1.0+0.4);
      ctxN.strokeStyle=w_>=0?c.positive:c.negative;
      ctxN.lineWidth=lw;
      ctxN.beginPath();
      ctxN.moveTo(xH+r, hidden[j].y);
      ctxN.lineTo(xOut-r, output.y);
      ctxN.stroke();
      var t=0.45;
      var lx=(xH+r)+t*((xOut-r)-(xH+r));
      var ly=hidden[j].y+t*(output.y-hidden[j].y);
      var dy=(j===0)?-7:11;
      ctxN.fillStyle=w_>=0?c.positive:c.negative;
      ctxN.fillText(fmt(w_), lx, ly+dy);
    }

    function drawNode(x,y,label,fillCol,strokeCol){
      ctxN.beginPath(); ctxN.arc(x,y,r,0,Math.PI*2);
      ctxN.fillStyle=fillCol; ctxN.fill();
      ctxN.strokeStyle=strokeCol; ctxN.lineWidth=2; ctxN.stroke();
      ctxN.fillStyle=c.text; ctxN.font='12px sans-serif'; ctxN.textAlign='center';
      ctxN.fillText(label, x, y+4);
    }
    for(var i=0;i<2;i++) drawNode(xIn, inputs[i].y, inputs[i].label, c.bgSec, c.border);
    for(var j=0;j<2;j++) drawNode(xH, hidden[j].y, '\u03c3', c.accent+'33', c.accent);
    drawNode(xOut, output.y, '\u03c3', c.accent+'33', c.accent);

    // Biases under each non-input node
    ctxN.fillStyle=c.textSec; ctxN.font='10px JetBrains Mono, monospace'; ctxN.textAlign='center';
    for(var j=0;j<2;j++){
      var b_=net?net.b[0][j]:0;
      ctxN.fillText('b='+fmt(b_), xH, hidden[j].y+r+12);
    }
    var bo=net?net.b[1][0]:0;
    ctxN.fillText('b='+fmt(bo), xOut, output.y+r+12);

    // Output arrow and label
    ctxN.strokeStyle=c.accent; ctxN.lineWidth=1.5;
    ctxN.beginPath(); ctxN.moveTo(xOut+r, output.y); ctxN.lineTo(xOut+r+18, output.y); ctxN.stroke();
    ctxN.fillStyle=c.text; ctxN.font='11px sans-serif'; ctxN.textAlign='left';
    ctxN.fillText('\u0177', xOut+r+22, output.y+4);
  }

  btnTrain.addEventListener('click',function(){
    if(animId) cancelAnimationFrame(animId);
    initNet();
    var lr=parseFloat(slLR.value);
    valLR.textContent=lr.toFixed(1);
    infoEl.textContent='Training MLP [2-2-1] on XOR...';
    var maxEp=2000;
    function step(){
      var l=net.train(X,Y,lr,10);
      epoch+=10;
      losses.push(l);
      draw();
      if(epoch<maxEp){
        animId=requestAnimationFrame(step);
      } else {
        var correct=0;
        for(var i=0;i<4;i++) if((net.predict(X[i])>=0.5?1:0)===Y[i]) correct++;
        infoEl.textContent='Training complete! Accuracy: '+correct+'/4. Loss: '+l.toFixed(4);
        animId=null;
      }
    }
    step();
  });
  slLR.addEventListener('input',function(){ valLR.textContent=parseFloat(slLR.value).toFixed(1); });
  btnReset.addEventListener('click',function(){
    if(animId) cancelAnimationFrame(animId); animId=null;
    initNet(); draw(); infoEl.textContent='Click "Train MLP" and watch the network solve what the single perceptron could not.';
  });
  draw();
})();
</script>

<!-- ==================== DEMO 5: Playground ==================== -->
<script>
(function(){
  var canvasP=document.getElementById('canvas-playground');
  var canvasL=document.getElementById('canvas-playground-loss');
  var ctxP=NN.setupCanvas(canvasP);
  var ctxL=NN.setupCanvas(canvasL);
  var pw=320,ph=320;

  var slLayers=document.getElementById('pg-layers');
  var slNeurons=document.getElementById('pg-neurons');
  var slLR=document.getElementById('pg-lr');
  var valLayers=document.getElementById('val-pg-layers');
  var valNeurons=document.getElementById('val-pg-neurons');
  var valLR=document.getElementById('val-pg-lr');
  var epochEl=document.getElementById('pg-epoch');
  var infoEl=document.getElementById('info-playground');
  var btnTrain=document.getElementById('btn-pg-train');
  var btnStop=document.getElementById('btn-pg-stop');
  var btnReset=document.getElementById('btn-pg-reset');

  var dsButtons={xor:document.getElementById('pg-ds-xor'),circle:document.getElementById('pg-ds-circle'),spiral:document.getElementById('pg-ds-spiral'),linear:document.getElementById('pg-ds-linear')};
  var actButtons={sigmoid:document.getElementById('pg-act-sigmoid'),relu:document.getElementById('pg-act-relu'),tanh:document.getElementById('pg-act-tanh')};

  var curDS='xor', curAct='sigmoid';
  var data=null, net=null, losses=[], epoch=0, animId=null;

  function genData(){
    data=NN.datasets[curDS](120);
  }
  genData();

  function buildNet(){
    var nLayers=parseInt(slLayers.value);
    var nNeurons=parseInt(slNeurons.value);
    var sizes=[2];
    for(var i=0;i<nLayers;i++) sizes.push(nNeurons);
    sizes.push(1);
    net=new NN.MLP(sizes,curAct);
    losses=[]; epoch=0;
  }
  buildNet();

  function draw(){
    var c=NN.getColors();
    ctxP.fillStyle=c.bg; ctxP.fillRect(0,0,pw,ph);
    NN.drawDecisionBoundary(ctxP,net,pw,ph,4);
    NN.drawPoints(ctxP,data.X,data.y,pw,ph,4);
    ctxP.strokeStyle=c.border; ctxP.lineWidth=1; ctxP.strokeRect(0,0,pw,ph);
    NN.drawLossCurve(ctxL,losses,pw,ph);
    epochEl.textContent='Epoch: '+epoch;
  }

  // Dataset buttons
  Object.keys(dsButtons).forEach(function(k){
    dsButtons[k].addEventListener('click',function(){
      Object.keys(dsButtons).forEach(function(j){dsButtons[j].classList.remove('active');});
      dsButtons[k].classList.add('active');
      curDS=k; genData(); buildNet(); draw();
    });
  });
  // Activation buttons
  Object.keys(actButtons).forEach(function(k){
    actButtons[k].addEventListener('click',function(){
      Object.keys(actButtons).forEach(function(j){actButtons[j].classList.remove('active');});
      actButtons[k].classList.add('active');
      curAct=k; buildNet(); draw();
    });
  });

  slLayers.addEventListener('input',function(){ valLayers.textContent=slLayers.value; });
  slNeurons.addEventListener('input',function(){ valNeurons.textContent=slNeurons.value; });
  slLR.addEventListener('input',function(){ valLR.textContent=parseFloat(slLR.value).toFixed(1); });

  btnTrain.addEventListener('click',function(){
    if(animId) cancelAnimationFrame(animId);
    buildNet();
    var lr=parseFloat(slLR.value);
    infoEl.textContent='Training...';
    function step(){
      var l=net.train(data.X,data.y,lr,5);
      epoch+=5;
      if(epoch%20===0) losses.push(l);
      draw();
      if(epoch<3000) animId=requestAnimationFrame(step);
      else { infoEl.textContent='Training complete (3000 epochs). Final loss: '+l.toFixed(4); animId=null; }
    }
    step();
  });
  btnStop.addEventListener('click',function(){
    if(animId){ cancelAnimationFrame(animId); animId=null; infoEl.textContent='Training stopped at epoch '+epoch+'.'; }
  });
  btnReset.addEventListener('click',function(){
    if(animId) cancelAnimationFrame(animId); animId=null;
    genData(); buildNet(); draw(); infoEl.textContent='Configure the network and click Train.';
  });
  draw();
})();
</script>

<!-- ==================== DEMO 6: Activation Functions ==================== -->
<script>
(function(){
  var canvas=document.getElementById('canvas-activations');
  var ctx=NN.setupCanvas(canvas);
  var w=680,h=300;
  var btnSig=document.getElementById('act-sigmoid');
  var btnTanh=document.getElementById('act-tanh');
  var btnRelu=document.getElementById('act-relu');
  var btnAll=document.getElementById('act-all');
  var infoEl=document.getElementById('info-activations');
  var show='sigmoid';

  var fns={
    sigmoid:{fn:NN.sigmoid, deriv:function(x){var s=NN.sigmoid(x);return s*(1-s);}, color:'#7aa2f7', label:'Sigmoid'},
    tanh:{fn:NN.tanh, deriv:function(x){var t=NN.tanh(x);return 1-t*t;}, color:'#73daca', label:'Tanh'},
    relu:{fn:NN.relu, deriv:function(x){return x>0?1:0;}, color:'#f7768e', label:'ReLU'}
  };

  function draw(){
    var c=NN.getColors();
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    var pad=50, pw=w/2-pad-10, phh=h-60;
    // Two plots: left = function, right = derivative
    for(var side=0;side<2;side++){
      var ox=side*(w/2)+pad, oy=20;
      ctx.strokeStyle=c.border; ctx.lineWidth=1;
      // Axes
      var midY=oy+phh/2;
      ctx.beginPath(); ctx.moveTo(ox,midY); ctx.lineTo(ox+pw,midY); ctx.stroke();
      var midX=ox+pw/2;
      ctx.beginPath(); ctx.moveTo(midX,oy); ctx.lineTo(midX,oy+phh); ctx.stroke();
      // Labels
      ctx.fillStyle=c.textSec; ctx.font='11px sans-serif'; ctx.textAlign='center';
      ctx.fillText(side===0?'f(z)':'f\'(z)',ox+pw/2,oy-4);
      ctx.fillText('-5',ox+2,midY+14); ctx.fillText('5',ox+pw-2,midY+14);
      ctx.fillText('z',ox+pw/2,oy+phh+16);
      // Y range
      var yMin=side===0?-1.5:-.5, yMax=side===0?1.5:1.2;
      function toSX(z){ return ox+(z+5)/10*pw; }
      function toSY(v){ return oy+(1-(v-yMin)/(yMax-yMin))*phh; }
      // Tick marks
      ctx.fillStyle=c.textSec; ctx.font='10px JetBrains Mono, monospace'; ctx.textAlign='right';
      if(side===0){
        [-1,0,1].forEach(function(v){ ctx.fillText(v,midX-4,toSY(v)+3); });
      } else {
        [0,0.5,1].forEach(function(v){ ctx.fillText(v.toFixed(1),midX-4,toSY(v)+3); });
      }

      var toDraw=(show==='all')?['sigmoid','tanh','relu']:[show];
      toDraw.forEach(function(name){
        var f=fns[name];
        var func=side===0?f.fn:f.deriv;
        ctx.strokeStyle=f.color; ctx.lineWidth=2.5;
        ctx.beginPath();
        for(var i=0;i<=200;i++){
          var z=-5+i/200*10;
          var v=func(z);
          var sx=toSX(z), sy=toSY(v);
          if(i===0) ctx.moveTo(sx,sy); else ctx.lineTo(sx,sy);
        }
        ctx.stroke();
      });
    }
    // Legend
    if(show==='all'){
      var lx=w/2-80, ly=h-15;
      ['sigmoid','tanh','relu'].forEach(function(name,i){
        ctx.fillStyle=fns[name].color;
        ctx.fillRect(lx+i*80,ly,14,3);
        ctx.font='11px sans-serif'; ctx.textAlign='left';
        ctx.fillText(fns[name].label,lx+i*80+18,ly+4);
      });
    }
    // Title
    ctx.fillStyle=c.text; ctx.font='13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('Activation Function',w/4, h-5);
    ctx.fillText('Derivative',3*w/4, h-5);
  }

  [['act-sigmoid','sigmoid'],['act-tanh','tanh'],['act-relu','relu'],['act-all','all']].forEach(function(pair){
    document.getElementById(pair[0]).addEventListener('click',function(){
      [btnSig,btnTanh,btnRelu,btnAll].forEach(function(b){b.classList.remove('active');});
      this.classList.add('active');
      show=pair[1]; draw();
    });
  });
  draw();
})();
</script>

<!-- ==================== DEMO 7: Backpropagation Visualization ==================== -->
<script>
(function(){
  var canvas=document.getElementById('canvas-backprop');
  var ctx=NN.setupCanvas(canvas);
  var w=680, h=460;
  var btnPrev=document.getElementById('btn-bp-prev');
  var btnNext=document.getElementById('btn-bp-next');
  var btnReset=document.getElementById('btn-bp-reset');
  var stepLabelEl=document.getElementById('bp-step');

  // Fixed example so the math is identical every run
  var x1=0.5, x2=1.0, y=1.0, lr=0.5;
  var W1=[[0.4,-0.2],[-0.5,0.3]]; // W1[hidden_idx][input_idx]
  var b1=[0.1, 0.0];
  var W2=[0.6, -0.4];             // W2[hidden_idx]
  var b2=0.2;

  function sig(z){ return 1/(1+Math.exp(-z)); }

  // Forward pass
  var z_h=[ W1[0][0]*x1+W1[0][1]*x2+b1[0], W1[1][0]*x1+W1[1][1]*x2+b1[1] ];
  var a_h=[ sig(z_h[0]), sig(z_h[1]) ];
  var z_o = W2[0]*a_h[0]+W2[1]*a_h[1]+b2;
  var yhat = sig(z_o);
  var loss = -y*Math.log(yhat) - (1-y)*Math.log(1-yhat);

  // Backward pass (sigmoid + binary cross-entropy gives a clean output delta)
  var d_o = yhat - y;
  var d_h = [
    W2[0]*d_o*a_h[0]*(1-a_h[0]),
    W2[1]*d_o*a_h[1]*(1-a_h[1])
  ];

  // Weight gradients
  var dW2=[d_o*a_h[0], d_o*a_h[1]];
  var db2=d_o;
  var dW1=[
    [d_h[0]*x1, d_h[0]*x2],
    [d_h[1]*x1, d_h[1]*x2]
  ];
  var db1=[d_h[0], d_h[1]];

  // Updated weights after one SGD step
  var W2_new=[W2[0]-lr*dW2[0], W2[1]-lr*dW2[1]];
  var b2_new=b2-lr*db2;
  var W1_new=[
    [W1[0][0]-lr*dW1[0][0], W1[0][1]-lr*dW1[0][1]],
    [W1[1][0]-lr*dW1[1][0], W1[1][1]-lr*dW1[1][1]]
  ];
  var b1_new=[b1[0]-lr*db1[0], b1[1]-lr*db1[1]];

  // Forward again with the new weights, same input
  var z_h_n=[W1_new[0][0]*x1+W1_new[0][1]*x2+b1_new[0], W1_new[1][0]*x1+W1_new[1][1]*x2+b1_new[1]];
  var a_h_n=[sig(z_h_n[0]), sig(z_h_n[1])];
  var z_o_n=W2_new[0]*a_h_n[0]+W2_new[1]*a_h_n[1]+b2_new;
  var yhat_n=sig(z_o_n);
  var loss_n=-y*Math.log(yhat_n)-(1-y)*Math.log(1-yhat_n);

  function p(v){ return (v<0?'(':'')+v.toFixed(3)+(v<0?')':''); }

  var steps = [
    {
      title: "Step 1 of 9: Setup",
      caption: "Pick a fixed input, target, and learning rate for one update step.",
      math: [
        "Inputs:  x\u2081 = 0.50,  x\u2082 = 1.00",
        "Target:  y  = 1.00",
        "Learning rate \u03b7 = 0.50"
      ],
      show: { inputs:true }
    },
    {
      title: "Step 2 of 9: Forward to h\u2081",
      caption: "Hidden neuron h\u2081: weighted sum of inputs, plus bias, then sigmoid.",
      math: [
        "z = w\u2081\u00b7x\u2081 + w\u2082\u00b7x\u2082 + b",
        "  = 0.40\u00d70.50 + (-0.20)\u00d71.00 + 0.10",
        "  = "+z_h[0].toFixed(3),
        "a = \u03c3(z) = "+a_h[0].toFixed(3)
      ],
      show: { inputs:true, h1:true }, highlight: ['x1-h1','x2-h1','h1']
    },
    {
      title: "Step 3 of 9: Forward to h\u2082",
      caption: "Same idea for the second hidden neuron, with its own weights and bias.",
      math: [
        "z = (-0.50)\u00d70.50 + 0.30\u00d71.00 + 0.00",
        "  = "+z_h[1].toFixed(3),
        "a = \u03c3(z) = "+a_h[1].toFixed(3)
      ],
      show: { inputs:true, h1:true, h2:true }, highlight: ['x1-h2','x2-h2','h2']
    },
    {
      title: "Step 4 of 9: Forward to \u0177",
      caption: "Output: weighted sum of hidden activations, plus bias, then sigmoid.",
      math: [
        "z = 0.60\u00d7"+a_h[0].toFixed(3)+" + (-0.40)\u00d7"+a_h[1].toFixed(3)+" + 0.20",
        "  = "+z_o.toFixed(3),
        "\u0177 = \u03c3(z) = "+yhat.toFixed(3)
      ],
      show: { inputs:true, h1:true, h2:true, out:true }, highlight: ['h1-out','h2-out','out']
    },
    {
      title: "Step 5 of 9: Loss",
      caption: "Binary cross-entropy: small when \u0177 matches y, large otherwise.",
      math: [
        "L = -y\u00b7log(\u0177) - (1-y)\u00b7log(1-\u0177)",
        "  = -1.00\u00b7log("+yhat.toFixed(3)+") - 0",
        "  = "+loss.toFixed(3)
      ],
      show: { inputs:true, h1:true, h2:true, out:true, loss:true }, highlight: ['out']
    },
    {
      title: "Step 6 of 9: Output gradient",
      caption: "For sigmoid + cross-entropy, the output's gradient is just (prediction - target).",
      math: [
        "\u03b4_out = \u0177 - y",
        "      = "+yhat.toFixed(3)+" - 1.000",
        "      = "+d_o.toFixed(3)
      ],
      show: { inputs:true, h1:true, h2:true, out:true, loss:true, d_out:true }, highlight: ['out']
    },
    {
      title: "Step 7 of 9: Hidden gradients (chain rule)",
      caption: "Each hidden \u03b4 = next-layer \u03b4, scaled by the connecting weight, times \u03c3'(z) = a(1-a).",
      math: [
        "\u03b4_h\u2081 = 0.60 \u00d7 "+p(d_o)+" \u00d7 "+(a_h[0]*(1-a_h[0])).toFixed(3)+" = "+d_h[0].toFixed(3),
        "\u03b4_h\u2082 = (-0.40) \u00d7 "+p(d_o)+" \u00d7 "+(a_h[1]*(1-a_h[1])).toFixed(3)+" = "+d_h[1].toFixed(3)
      ],
      show: { inputs:true, h1:true, h2:true, out:true, loss:true, d_out:true, d_h:true }, highlight: ['h1-out','h2-out','h1','h2']
    },
    {
      title: "Step 8 of 9: Weight updates",
      caption: "For each weight: new = old - \u03b7 \u00d7 (\u03b4 at receiver \u00d7 activation at sender).",
      math: [
        "\u2202L/\u2202w_h\u2081\u2192out = \u03b4_out \u00d7 a_h\u2081 = "+dW2[0].toFixed(3),
        "  new w_h\u2081\u2192out = 0.60 - 0.50\u00d7"+p(dW2[0])+" = "+W2_new[0].toFixed(3),
        "",
        "\u2202L/\u2202w_x\u2081\u2192h\u2081 = \u03b4_h\u2081 \u00d7 x\u2081 = "+dW1[0][0].toFixed(3),
        "  new w_x\u2081\u2192h\u2081 = 0.40 - 0.50\u00d7"+p(dW1[0][0])+" = "+W1_new[0][0].toFixed(3),
        "",
        "(every other weight and bias updates the same way.)"
      ],
      show: { inputs:true, h1:true, h2:true, out:true, loss:true, d_out:true, d_h:true, weights_new:true }
    },
    {
      title: "Step 9 of 9: One step complete",
      caption: "Same input, new weights: loss has dropped. Repeat for thousands of inputs.",
      math: [
        "Loss before update: "+loss.toFixed(3),
        "Loss after update:  "+loss_n.toFixed(3),
        "Change:             "+(loss_n-loss).toFixed(3)
      ],
      show: { inputs:true, h1:true, h2:true, out:true, loss:true, weights_new:true, yhat_new:true }
    }
  ];

  var step = 0;
  var N = steps.length;

  // Node positions (network area: y 36 to y 268)
  var rNode = 22;
  var posX1 = {x:70, y:90}, posX2 = {x:70, y:210};
  var posH1 = {x:320, y:90}, posH2 = {x:320, y:210};
  var posO  = {x:560, y:150};

  // Layout constants for the on-canvas panels
  var TITLE_Y = 22;           // step title baseline
  var DIVIDER_Y = 32;         // line separating title from network
  var CAPTION_Y = 290;        // single-line caption baseline
  var MATH_BOX = {x:20, y:308, w:w-40, h:h-318};

  function isHL(id){ var hl=steps[step].highlight||[]; return hl.indexOf(id)>=0; }

  function drawEdge(from, to, wOld, wNew, hl, showNew, labelT, labelDy){
    var c = NN.getColors();
    var wt = showNew ? wNew : wOld;
    var lw = Math.min(4, Math.abs(wt)*1.2+0.4);
    ctx.strokeStyle = wt>=0 ? c.positive : c.negative;
    ctx.globalAlpha = hl ? 1.0 : 0.55;
    ctx.lineWidth = hl ? lw+1.5 : lw;
    ctx.beginPath();
    ctx.moveTo(from.x+rNode, from.y);
    ctx.lineTo(to.x-rNode, to.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    var lx = (from.x+rNode) + labelT*((to.x-rNode) - (from.x+rNode));
    var ly = from.y + labelT*(to.y - from.y);
    ctx.font='10px JetBrains Mono, monospace'; ctx.textAlign='center';
    if(showNew && Math.abs(wOld - wNew) > 0.001){
      ctx.fillStyle = c.green;
      ctx.fillText(wOld.toFixed(2)+' \u2192 '+wNew.toFixed(2), lx, ly+labelDy);
    } else {
      ctx.fillStyle = wt>=0 ? c.positive : c.negative;
      ctx.fillText((wt>=0?'+':'')+wt.toFixed(2), lx, ly+labelDy);
    }
  }

  function drawNode(pos, label, glow){
    var c = NN.getColors();
    ctx.beginPath(); ctx.arc(pos.x, pos.y, rNode, 0, Math.PI*2);
    ctx.fillStyle = glow ? (c.accent+'66') : (c.accent+'22');
    ctx.fill();
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = glow ? 3 : 2;
    ctx.stroke();
    ctx.fillStyle = c.text; ctx.font='13px sans-serif'; ctx.textAlign='center';
    ctx.fillText(label, pos.x, pos.y+4);
  }

  function drawInputNode(pos, label, val){
    var c = NN.getColors();
    ctx.beginPath(); ctx.arc(pos.x, pos.y, rNode, 0, Math.PI*2);
    ctx.fillStyle = c.bgSec; ctx.fill();
    ctx.strokeStyle = c.border; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = c.text; ctx.font='13px sans-serif'; ctx.textAlign='center';
    ctx.fillText(label, pos.x, pos.y+4);
    ctx.fillStyle = c.textSec; ctx.font='11px JetBrains Mono, monospace'; ctx.textAlign='right';
    ctx.fillText(val.toFixed(2), pos.x-rNode-8, pos.y+4);
  }

  function draw(){
    var c = NN.getColors();
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    var s = steps[step];
    var showNew = !!(s.show && s.show.weights_new);

    // Title bar
    ctx.fillStyle = c.text;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(s.title, 20, TITLE_Y);
    ctx.fillStyle = c.textSec;
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('('+(step+1)+' / '+N+')', w-20, TITLE_Y);
    ctx.strokeStyle = c.border;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(20, DIVIDER_Y); ctx.lineTo(w-20, DIVIDER_Y); ctx.stroke();
    ctx.globalAlpha = 1;

    // Edges (input -> hidden). t=0.32 for top input, 0.68 for bottom input to keep
    // crossing diagonal labels apart.
    drawEdge(posX1, posH1, W1[0][0], W1_new[0][0], isHL('x1-h1'), showNew, 0.32, 9);
    drawEdge(posX1, posH2, W1[1][0], W1_new[1][0], isHL('x1-h2'), showNew, 0.32, -8);
    drawEdge(posX2, posH1, W1[0][1], W1_new[0][1], isHL('x2-h1'), showNew, 0.68, -8);
    drawEdge(posX2, posH2, W1[1][1], W1_new[1][1], isHL('x2-h2'), showNew, 0.68, 9);
    // Edges (hidden -> output)
    drawEdge(posH1, posO, W2[0], W2_new[0], isHL('h1-out'), showNew, 0.45, -8);
    drawEdge(posH2, posO, W2[1], W2_new[1], isHL('h2-out'), showNew, 0.45, 11);

    // Nodes
    drawInputNode(posX1, 'x\u2081', x1);
    drawInputNode(posX2, 'x\u2082', x2);
    drawNode(posH1, '\u03c3', isHL('h1'));
    drawNode(posH2, '\u03c3', isHL('h2'));
    drawNode(posO,  '\u03c3', isHL('out'));

    // Bias labels under non-input nodes
    var biasW1 = showNew ? b1_new : b1;
    var biasW2 = showNew ? b2_new : b2;
    ctx.font='10px JetBrains Mono, monospace'; ctx.textAlign='center';
    ctx.fillStyle = c.textSec;
    ctx.fillText('b='+(biasW1[0]>=0?'+':'')+biasW1[0].toFixed(2), posH1.x, posH1.y-rNode-6);
    ctx.fillText('b='+(biasW1[1]>=0?'+':'')+biasW1[1].toFixed(2), posH2.x, posH2.y-rNode-6);
    ctx.fillText('b='+(biasW2>=0?'+':'')+biasW2.toFixed(2),       posO.x,  posO.y-rNode-6);

    // Activation values below each computed neuron
    function actLabel(pos, val){
      ctx.fillStyle = c.text;
      ctx.font='10px JetBrains Mono, monospace';
      ctx.textAlign='center';
      ctx.fillText('a='+val.toFixed(3), pos.x, pos.y+rNode+14);
    }
    if(s.show && s.show.h1) actLabel(posH1, showNew && s.show.yhat_new ? a_h_n[0] : a_h[0]);
    if(s.show && s.show.h2) actLabel(posH2, showNew && s.show.yhat_new ? a_h_n[1] : a_h[1]);
    if(s.show && s.show.out){
      ctx.fillStyle = c.text;
      ctx.font='10px JetBrains Mono, monospace';
      ctx.textAlign='center';
      var yv = (showNew && s.show.yhat_new) ? yhat_n : yhat;
      ctx.fillText('\u0177='+yv.toFixed(3), posO.x, posO.y+rNode+14);
    }

    // Delta values under activations (red)
    function dLabel(pos, val){
      ctx.fillStyle = c.class1;
      ctx.font='10px JetBrains Mono, monospace';
      ctx.textAlign='center';
      ctx.fillText('\u03b4='+val.toFixed(3), pos.x, pos.y+rNode+30);
    }
    if(s.show && s.show.d_h){
      dLabel(posH1, d_h[0]);
      dLabel(posH2, d_h[1]);
    }
    if(s.show && s.show.d_out) dLabel(posO, d_o);

    // Loss / target panel near output
    if(s.show && s.show.loss){
      ctx.fillStyle = c.text;
      ctx.font='11px JetBrains Mono, monospace'; ctx.textAlign='left';
      var ll = (showNew && s.show.yhat_new) ? loss_n : loss;
      ctx.fillText('y = 1.00',       posO.x+rNode+12, posO.y-4);
      ctx.fillText('L = '+ll.toFixed(3), posO.x+rNode+12, posO.y+12);
    }

    // One-line caption between network and math panel
    ctx.fillStyle = c.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.caption, w/2, CAPTION_Y);

    // Math panel at the bottom of the canvas
    ctx.fillStyle = c.bgSec;
    ctx.fillRect(MATH_BOX.x, MATH_BOX.y, MATH_BOX.w, MATH_BOX.h);
    ctx.fillStyle = c.accent;
    ctx.fillRect(MATH_BOX.x, MATH_BOX.y, 3, MATH_BOX.h);
    ctx.fillStyle = c.text;
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    for(var li=0; li<s.math.length; li++){
      ctx.fillText(s.math[li], MATH_BOX.x+14, MATH_BOX.y+22+li*18);
    }
  }

  function update(){
    draw();
    stepLabelEl.textContent = (step+1)+' / '+N;
    btnPrev.disabled = (step===0);
    btnNext.disabled = (step===N-1);
  }

  btnNext.addEventListener('click', function(){ if(step<N-1){ step++; update(); } });
  btnPrev.addEventListener('click', function(){ if(step>0){ step--; update(); } });
  btnReset.addEventListener('click', function(){ step=0; update(); });

  update();
})();
</script>

<!-- ==================== DEMO 8: Universal Approximation ==================== -->
<script>
(function(){
  var canvas=document.getElementById('canvas-universal');
  var ctx=NN.setupCanvas(canvas);
  var w=680,h=340;
  var slNeurons=document.getElementById('ua-neurons');
  var valNeurons=document.getElementById('val-ua-neurons');
  var btnTrain=document.getElementById('btn-ua-train');
  var btnReset=document.getElementById('btn-ua-reset');
  var epochEl=document.getElementById('ua-epoch');
  var infoEl=document.getElementById('info-universal');

  // 1D regression: approximate sin(x) over [0, 2*pi]
  var nSamples=40;
  var trainX=[], trainY=[];
  for(var i=0;i<nSamples;i++){
    var x=i/(nSamples-1);
    trainX.push(x);
    trainY.push((Math.sin(x*Math.PI*2)+1)/2); // normalize to [0,1]
  }

  var net=null, epoch=0, animId=null;

  // 1D MLP: 1 -> n -> 1
  function MLP1D(hidden){
    this.nH=hidden;
    this.W1=[]; this.b1=[]; this.W2=[]; this.b2=0;
    var scale=Math.sqrt(2.0);
    for(var i=0;i<hidden;i++){
      this.W1.push((Math.random()*2-1)*scale);
      this.b1.push((Math.random()*2-1)*0.5);
      this.W2.push((Math.random()*2-1)*scale/Math.sqrt(hidden));
    }
    this.b2=(Math.random()-0.5)*0.2;
  }
  MLP1D.prototype.forward=function(x){
    this.hid=[];
    for(var i=0;i<this.nH;i++){
      this.hid.push(NN.sigmoid(this.W1[i]*x+this.b1[i]));
    }
    var out=this.b2;
    for(var i=0;i<this.nH;i++) out+=this.W2[i]*this.hid[i];
    this.out=NN.sigmoid(out);
    this.outZ=out;
    return this.out;
  };
  MLP1D.prototype.train=function(xs,ys,lr,epochs){
    var totalLoss=0;
    for(var ep=0;ep<epochs;ep++){
      totalLoss=0;
      for(var s=0;s<xs.length;s++){
        var pred=this.forward(xs[s]);
        var target=ys[s];
        var err=pred-target;
        totalLoss+=err*err;
        var dOut=err*pred*(1-pred);
        // Grad for W2, b2
        for(var i=0;i<this.nH;i++){
          var dW2=dOut*this.hid[i];
          var dH=dOut*this.W2[i]*this.hid[i]*(1-this.hid[i]);
          this.W2[i]-=lr*dW2;
          this.W1[i]-=lr*dH*xs[s];
          this.b1[i]-=lr*dH;
        }
        this.b2-=lr*dOut;
      }
    }
    return totalLoss/xs.length;
  };
  MLP1D.prototype.predict=function(x){ return this.forward(x); };

  function initNet(){ net=new MLP1D(parseInt(slNeurons.value)); epoch=0; }
  initNet();

  function draw(){
    var c=NN.getColors();
    ctx.fillStyle=c.bg; ctx.fillRect(0,0,w,h);
    var pad=50, pw=w-pad*2, ph=h-70;

    // Axes
    ctx.strokeStyle=c.border; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pad,20); ctx.lineTo(pad,20+ph); ctx.lineTo(pad+pw,20+ph); ctx.stroke();
    ctx.fillStyle=c.textSec; ctx.font='11px sans-serif'; ctx.textAlign='center';
    ctx.fillText('0',pad,20+ph+14); ctx.fillText('2\u03C0',pad+pw,20+ph+14);
    ctx.fillText('x',pad+pw/2,h-5);
    ctx.textAlign='right';
    ctx.fillText('1',pad-6,26); ctx.fillText('0',pad-6,20+ph+4);

    // Target function (sin)
    ctx.strokeStyle=c.textSec; ctx.lineWidth=1.5; ctx.setLineDash([5,5]);
    ctx.beginPath();
    for(var i=0;i<=200;i++){
      var x=i/200;
      var y=(Math.sin(x*Math.PI*2)+1)/2;
      var sx=pad+x*pw, sy=20+(1-y)*ph;
      if(i===0) ctx.moveTo(sx,sy); else ctx.lineTo(sx,sy);
    }
    ctx.stroke(); ctx.setLineDash([]);

    // Network prediction
    ctx.strokeStyle=c.accent; ctx.lineWidth=2.5;
    ctx.beginPath();
    for(var i=0;i<=200;i++){
      var x=i/200;
      var y=net.predict(x);
      var sx=pad+x*pw, sy=20+(1-y)*ph;
      if(i===0) ctx.moveTo(sx,sy); else ctx.lineTo(sx,sy);
    }
    ctx.stroke();

    // Data points
    for(var i=0;i<nSamples;i++){
      var sx=pad+trainX[i]*pw, sy=20+(1-trainY[i])*ph;
      ctx.beginPath(); ctx.arc(sx,sy,3,0,Math.PI*2);
      ctx.fillStyle=c.class1; ctx.fill();
    }

    // Legend
    ctx.font='11px sans-serif'; ctx.textAlign='left';
    ctx.strokeStyle=c.textSec; ctx.lineWidth=1.5; ctx.setLineDash([5,5]);
    ctx.beginPath(); ctx.moveTo(pad+10,20+ph+30); ctx.lineTo(pad+40,20+ph+30); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle=c.textSec; ctx.fillText('sin(x) target',pad+45,20+ph+34);
    ctx.strokeStyle=c.accent; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(pad+160,20+ph+30); ctx.lineTo(pad+190,20+ph+30); ctx.stroke();
    ctx.fillStyle=c.accent; ctx.fillText('Network ('+slNeurons.value+' neurons)',pad+195,20+ph+34);

    epochEl.textContent='Epoch: '+epoch;
  }

  slNeurons.addEventListener('input',function(){ valNeurons.textContent=slNeurons.value; });

  btnTrain.addEventListener('click',function(){
    if(animId) cancelAnimationFrame(animId);
    initNet();
    infoEl.textContent='Training 1-'+slNeurons.value+'-1 network on sin(x)...';
    var maxEp=5000;
    function step(){
      var l=net.train(trainX,trainY,1.5,20);
      epoch+=20;
      draw();
      if(epoch<maxEp) animId=requestAnimationFrame(step);
      else { infoEl.textContent='Training complete. MSE: '+l.toFixed(6)+'. Try more neurons for a better fit.'; animId=null; }
    }
    step();
  });

  btnReset.addEventListener('click',function(){
    if(animId) cancelAnimationFrame(animId); animId=null;
    initNet(); draw(); infoEl.textContent='Target: sin(x). Increase hidden neurons and retrain to see the approximation improve.';
  });

  draw();
})();
</script>
