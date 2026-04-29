---
layout: post
title: "Machine Learning from Scratch"
author: bharathikannan
categories: [Machine learning]
description: "Learn machine learning from scratch with interactive visualizations all in your browser with math and code."
permalink: /ml/
date: 2026-04-29
---

<style>
.ml-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.ml-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0;
  background: var(--bg-secondary);
  transition: border-color 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
  display: block;
  overflow: hidden;
}
.ml-card:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  text-decoration: none;
  color: inherit;
}
.ml-card-body {
  padding: 0.85rem 1rem 0.9rem;
}
.ml-card h3 {
  font-size: 0.9rem;
  margin: 0 0 0.15rem 0;
  color: var(--text-primary);
}
.ml-card p {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}
.ml-category {
  margin-bottom: 1.5rem;
}
.ml-category h2 {
  font-size: 1.15rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-top: 0;
  margin-bottom: 0.5rem;
  padding-top: 0;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--border);
}
.ml-part-label {
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 0.25rem;
  font-weight: 600;
}
.ml-coming-soon {
  opacity: 0.55;
}
.ml-coming-soon .ml-card {
  pointer-events: none;
  cursor: default;
  padding: 1rem 1.1rem;
}
.ml-coming-soon .ml-card:hover {
  border-color: var(--border);
  box-shadow: none;
}
.ml-coming-soon .ml-card h3 {
  margin-bottom: 0;
}
.ml-badge {
  display: inline-block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
  margin-left: 0.4rem;
  vertical-align: middle;
}
.ml-preview {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.1rem;
  margin: 1.2rem 0 1.8rem 0;
  background: linear-gradient(180deg, var(--bg-secondary), var(--bg-primary));
}
.ml-preview-header {
  margin: -0.15rem 0 0.9rem 0;
}
.ml-preview-title {
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0 !important;
  padding-top: 0;
  color: var(--text-primary);
}
.ml-preview-subtitle {
  font-size: 0.82rem;
  color: var(--text-tertiary);
  margin: 0;
  line-height: 1.4;
}
.ml-preview-hint {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0.55rem 0 0 0;
  line-height: 1.45;
  font-style: italic;
}
.ml-preview-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
}
.ml-preview-tab {
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.78rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.ml-preview-tab:hover,
.ml-preview-tab.is-active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--bg-secondary);
}
.ml-preview-canvas {
  width: 100%;
  height: auto;
  border: 1px solid var(--border);
  border-radius: 10px;
  display: block;
  background: var(--bg-primary);
}
.ml-preview-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.65rem;
  font-size: 0.82rem;
  color: var(--text-secondary);
}
.ml-preview-footer button {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 0.34rem 0.56rem;
  font-size: 0.76rem;
  cursor: pointer;
}
.ml-preview-footer button:hover {
  border-color: var(--accent);
  color: var(--accent);
}
@media (max-width: 640px) {
  .ml-grid { grid-template-columns: 1fr; }
  .ml-preview { padding: 0.9rem; }
}
</style>

This is an interactive series on machine learning where every algorithm is built from scratch, explained with math, and visualized so you can see exactly what is happening under the hood. The series covers linear and logistic regression, gradient descent with optimizers like SGD, Momentum, and Adam, polynomial regression and the bias-variance tradeoff, regularization with Ridge, Lasso, and Elastic Net, and neural networks from a single perceptron to multi-layer networks with backpropagation and activation functions. It also includes chapters on loss functions, decision trees, and clustering algorithms like K-Means and so much more.

Each post starts with the intuition, walks through the math step by step, and then lets you experiment with interactive demos right in your browser. You can drag data points, tune hyperparameters, and watch algorithms train in real time. No prerequisites beyond basic algebra is required. This series will give you a deep understanding of how machine learning algorithms work from the ground up, and the interactive visualizations will help you build intuitions easily.

<div class="ml-preview" id="ml-series-preview">
  <div class="ml-preview-header">
    <h2 class="ml-preview-title">See It in Action</h2>
    <p class="ml-preview-subtitle">This is a simple example. You can expect similar interactive visualizations in each blog post. Switch between algorithms to see how each one tackles the same dataset differently.  </p>
  </div>
  <div class="ml-preview-controls" role="tablist" aria-label="Algorithm preview tabs">
    <button class="ml-preview-tab is-active" type="button" data-algo="linear" aria-pressed="true">Linear Regression</button>
    <button class="ml-preview-tab" type="button" data-algo="logistic" aria-pressed="false">Logistic Regression</button>
    <!-- <button class="ml-preview-tab" type="button" data-algo="knn" aria-pressed="false">KNN</button> -->
    <button class="ml-preview-tab" type="button" data-algo="kmeans" aria-pressed="false">K-Means</button>
    <button class="ml-preview-tab" type="button" data-algo="nn" aria-pressed="false">Simple NN</button>
  </div>

  <svg id="ml-preview-canvas" class="ml-preview-canvas" viewBox="0 0 640 380" role="img" aria-label="Machine learning interactive preview"></svg>
  <p class="ml-preview-hint" id="ml-preview-hint"></p>
  <div class="ml-preview-footer">
    <button type="button" id="ml-preview-shuffle">Randomize Data</button>
  </div>
</div>

<p class="ml-part-label">Part 1</p>

<div class="ml-category">
  <h2>Foundations of Supervised Learning</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/linear-regression/">
      <div class="ml-card-body">
        <h3>Linear Regression</h3>
        <p>The starting point. Learn how a line fits data and how gradient descent finds the best weights.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/linear-regression-multivariate/">
      <div class="ml-card-body">
        <h3>Linear Regression - Multivariate</h3>
        <p>More features, a plane instead of a line. See how each input contributes to the prediction.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/logistic-regression/">
      <div class="ml-card-body">
        <h3>Logistic Regression</h3>
        <p>Use the sigmoid to turn a score into a probability. Train a binary classifier and find your first decision boundary.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/logistic-regression-multivariate/">
      <div class="ml-card-body">
        <h3>Logistic Regression - Multivariate</h3>
        <p>Two features, one boundary. See why cross-entropy works better than MSE for classification.</p>
      </div>
    </a>
  </div>
</div>

<div class="ml-category">
  <h2>Optimization & Regularization</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/gradient-descent/">
      <div class="ml-card-body">
        <h3>Gradient Descent Deep Dive</h3>
        <p>The engine behind every ML model. Race SGD, Momentum, and Adam on loss surfaces and see which one wins.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/polynomial-regression/">
      <div class="ml-card-body">
        <h3>Polynomial Regression & Bias-Variance</h3>
        <p>Fit curves, not just lines. See what happens when a model is too simple or too complex.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/regularization-ridge-lasso/">
      <div class="ml-card-body">
        <h3>Regularization: Ridge, Lasso & Elastic Net</h3>
        <p>Penalize large weights to stop overfitting. See why Lasso pushes coefficients to zero but Ridge only shrinks them.</p>
      </div>
    </a>
  </div>
</div>

<div class="ml-category">
  <h2>Neural Networks from Scratch</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/perceptron-mlp/">
      <div class="ml-card-body">
        <h3>The Perceptron & MLP</h3>
        <p>One neuron cannot solve XOR. Add a hidden layer and unlock nonlinear decision boundaries.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/backpropagation/">
      <div class="ml-card-body">
        <h3>Backpropagation Visualized</h3>
        <p>The chain rule applied layer by layer. Watch gradients weaken as they travel back through the network.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/activation-functions/">
      <div class="ml-card-body">
        <h3>Activation Functions</h3>
        <p>What sits between layers shapes what a network can learn. Compare sigmoid, ReLU, tanh, and GELU side by side.</p>
      </div>
    </a>
  </div>
</div>

<hr style="margin: 2.5rem 0 1.5rem; border: none; border-top: 1px solid var(--border);">

<p class="ml-part-label">Coming Soon</p>

<div class="ml-category ml-coming-soon">
  <h2>Classification Algorithms</h2>
  <div class="ml-grid">
    <div class="ml-card">
      <h3>K-Nearest Neighbors <span class="ml-badge">Coming Soon</span></h3>
    </div>
    <div class="ml-card">
      <h3>Naive Bayes Classifier <span class="ml-badge">Coming Soon</span></h3>
    </div>
    <div class="ml-card">
      <h3>Support Vector Machines <span class="ml-badge">Coming Soon</span></h3>
    </div>
    <div class="ml-card">
      <h3>Decision Trees <span class="ml-badge">Coming Soon</span></h3>
    </div>
  </div>
</div>

<div class="ml-category ml-coming-soon">
  <h2>Ensemble Methods</h2>
  <div class="ml-grid">
    <div class="ml-card">
      <h3>Random Forests & Bagging <span class="ml-badge">Coming Soon</span></h3>
    </div>
    <div class="ml-card">
      <h3>Boosting: AdaBoost & Gradient Boosting <span class="ml-badge">Coming Soon</span></h3>
    </div>
  </div>
</div>

<div class="ml-category ml-coming-soon">
  <h2>Unsupervised Learning</h2>
  <div class="ml-grid">
    <div class="ml-card">
      <h3>K-Means Clustering <span class="ml-badge">Coming Soon</span></h3>
    </div>
    <div class="ml-card">
      <h3>DBSCAN & Hierarchical Clustering <span class="ml-badge">Coming Soon</span></h3>
    </div>
    <div class="ml-card">
      <h3>Principal Component Analysis (PCA) <span class="ml-badge">Coming Soon</span></h3>
    </div>
  </div>
</div>

<div class="ml-category ml-coming-soon">
  <h2>Evaluation & Practical ML</h2>
  <div class="ml-grid">
    <div class="ml-card">
      <h3>Model Evaluation <span class="ml-badge">Coming Soon</span></h3>
    </div>
    <div class="ml-card">
      <h3>Feature Engineering & Preprocessing <span class="ml-badge">Coming Soon</span></h3>
    </div>
  </div>
</div>

<script>
(function () {
  var root = document.getElementById('ml-series-preview');
  if (!root) return;

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var WIDTH = 640;
  var HEIGHT = 380;
  var PAD = 34;
  var activeAlgo = 'linear';
  var datasetSeed = 246813579;
  var sharedData = buildSharedData(datasetSeed);
  var modelCache = {};

  var svg = document.getElementById('ml-preview-canvas');
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.ml-preview-tab'));
  var shuffleButton = document.getElementById('ml-preview-shuffle');
  var hintEl = document.getElementById('ml-preview-hint');

  var hints = {
    linear: 'Fits a straight line through data using least squares, the starting point of supervised learning.',
    logistic: 'Draws a decision boundary to classify points into two groups using the sigmoid function.',
    knn: 'Classifies each point by majority vote of its K nearest neighbors, no training step needed.',
    kmeans: 'Groups unlabeled data into K clusters by iteratively moving centroids to cluster centers.',
    nn: 'A small neural network learns a nonlinear decision boundary through backpropagation.'
  };

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activeAlgo = tab.getAttribute('data-algo') || 'linear';
      syncTabs();
      render();
    });
  });

  shuffleButton.addEventListener('click', function () {
    datasetSeed = (datasetSeed + 98765431) >>> 0;
    sharedData = buildSharedData(datasetSeed);
    modelCache = {};
    render();
  });

  syncTabs();
  render();

  function syncTabs() {
    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute('data-algo') === activeAlgo;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function render() {
    clearSvg();
    drawGrid();

    hintEl.textContent = hints[activeAlgo] || '';

    if (activeAlgo === 'linear') {
      renderLinear();
    } else if (activeAlgo === 'logistic') {
      renderLogistic();
    } else if (activeAlgo === 'kmeans') {
      renderKmeans();
    } else {
      renderSimpleNn();
    }
  }

  // else if (activeAlgo === 'knn') {
  //     renderKnn();
  //   } 

  function getModel(key, builder) {
    if (!modelCache[key]) {
      modelCache[key] = builder();
    }
    return modelCache[key];
  }

  function renderLinear() {
    var points = sharedData.points;
    var fit = getModel('linear', function () {
      return fitLine(points);
    });

    drawRegressionPoints(points);
    drawLine(0, clamp01(fit.b), 1, clamp01(fit.m + fit.b), 'var(--accent)', 3, 1);
  }

  function renderLogistic() {
    var points = sharedData.points;
    var model = getModel('logistic', function () {
      return fitLogistic2D(points, 650, 0.45);
    });

    drawProbabilityBackground(function (x, y) {
      return predictLogistic(model, x, y);
    });

    drawClassPoints(points);
    drawDecisionBoundary(
      model.wx,
      model.wy,
      model.b - (0.5 * model.wx) - (0.5 * model.wy),
      'var(--accent)',
      2.6,
      '7 5'
    );
  }

  function renderKnn() {
    var points = sharedData.points;
    var k = 7;

    drawProbabilityBackground(function (x, y) {
      return knnProb(points, x, y, k);
    });

    drawClassPoints(points);
  }

  function renderKmeans() {
    var points = sharedData.points;
    var result = getModel('kmeans', function () {
      return fitKmeans(points, 3, 9);
    });
    var colors = ['#2e86c1', '#e67e22', '#16a085'];

    points.forEach(function (p, idx) {
      var cls = result.assignments[idx];
      drawCircle(p.x, p.y, 4.2, colors[cls], '#ffffff', 0.8, 0.9);
    });

    result.centroids.forEach(function (c, idx) {
      var color = colors[idx];
      drawLine(c.x - 0.018, c.y, c.x + 0.018, c.y, color, 3, 1);
      drawLine(c.x, c.y - 0.018, c.x, c.y + 0.018, color, 3, 1);
      drawCircle(c.x, c.y, 9, 'transparent', color, 2, 1);
    });
  }

  function renderSimpleNn() {
    var points = sharedData.points;
    var model = getModel('nn', function () {
      return trainSimpleNn(points, 6, 640, 0.16);
    });

    drawProbabilityBackground(function (x, y) {
      return predictSimpleNn(model, x, y);
    });

    drawClassPoints(points);
  }

  function drawClassPoints(points) {
    points.forEach(function (p) {
      var color = p.cls ? '#e67e22' : '#2e86c1';
      drawCircle(p.x, p.y, 4.2, color, '#ffffff', 0.9, 0.92);
    });
  }

  function drawRegressionPoints(points) {
    points.forEach(function (p) {
      drawCircle(p.x, p.y, 4.2, '#2e86c1', '#ffffff', 0.9, 0.92);
    });
  }

  function drawProbabilityBackground(probFn) {
    var compact = window.innerWidth <= 640;
    var cellsX = compact ? 42 : 60;
    var cellsY = compact ? 26 : 36;
    var cellW = 1 / cellsX;
    var cellH = 1 / cellsY;
    var xi;
    var yi;

    for (xi = 0; xi < cellsX; xi++) {
      for (yi = 0; yi < cellsY; yi++) {
        var x = (xi + 0.5) * cellW;
        var y = (yi + 0.5) * cellH;
        var prob = probFn(x, y);
        var confidence = Math.abs(prob - 0.5) * 2;
        var fill = prob >= 0.5 ? '#ffb36b' : '#68b7ff';
        drawRect(xi * cellW, yi * cellH, cellW, cellH, fill, 0.13 + (confidence * 0.34));
      }
    }
  }

  function drawDecisionBoundary(wx, wy, b, color, width, dash) {
    var eps = 1e-9;
    var candidates = [];

    if (Math.abs(wy) > eps) {
      var yAtX0 = (-b) / wy;
      var yAtX1 = (-(wx + b)) / wy;
      if (yAtX0 >= 0 && yAtX0 <= 1) candidates.push({ x: 0, y: yAtX0 });
      if (yAtX1 >= 0 && yAtX1 <= 1) candidates.push({ x: 1, y: yAtX1 });
    }
    if (Math.abs(wx) > eps) {
      var xAtY0 = (-b) / wx;
      var xAtY1 = (-(wy + b)) / wx;
      if (xAtY0 >= 0 && xAtY0 <= 1) candidates.push({ x: xAtY0, y: 0 });
      if (xAtY1 >= 0 && xAtY1 <= 1) candidates.push({ x: xAtY1, y: 1 });
    }

    candidates = uniquePoints(candidates);
    if (candidates.length < 2) return;

    var bestA = candidates[0];
    var bestB = candidates[1];
    var bestD2 = -1;
    var i;
    var j;
    for (i = 0; i < candidates.length; i++) {
      for (j = i + 1; j < candidates.length; j++) {
        var dx = candidates[i].x - candidates[j].x;
        var dy = candidates[i].y - candidates[j].y;
        var d2 = (dx * dx) + (dy * dy);
        if (d2 > bestD2) {
          bestD2 = d2;
          bestA = candidates[i];
          bestB = candidates[j];
        }
      }
    }

    drawLine(bestA.x, bestA.y, bestB.x, bestB.y, color, width || 2, 1, dash);
  }

  function uniquePoints(points) {
    var out = [];
    points.forEach(function (p) {
      var duplicate = out.some(function (q) {
        return Math.abs(p.x - q.x) < 1e-6 && Math.abs(p.y - q.y) < 1e-6;
      });
      if (!duplicate) out.push(p);
    });
    return out;
  }

  function knnProb(points, x, y, k) {
    var ranked = points
      .map(function (p) {
        var dx = p.x - x;
        var dy = p.y - y;
        return { cls: p.cls, d2: (dx * dx) + (dy * dy) };
      })
      .sort(function (a, b) { return a.d2 - b.d2; });

    var sum = 0;
    for (var i = 0; i < k; i++) {
      sum += ranked[i].cls;
    }
    return sum / k;
  }

  function fitKmeans(points, k, iterations) {
    var centroids = initKmeansCentroids(points, k);
    var assignments = [];
    var i;

    for (i = 0; i < iterations; i++) {
      assignments = points.map(function (p) {
        return nearestCentroidIndex(p, centroids);
      });
      centroids = updateCentroids(points, assignments, k, centroids);
    }

    return { centroids: centroids, assignments: assignments };
  }

  function initKmeansCentroids(points, k) {
    var sorted = points.slice().sort(function (a, b) { return a.x - b.x; });
    var centroids = [];
    for (var i = 0; i < k; i++) {
      var idx = Math.floor(((i + 0.5) / k) * sorted.length);
      var p = sorted[Math.min(idx, sorted.length - 1)];
      centroids.push({ x: p.x, y: p.y });
    }
    return centroids;
  }

  function nearestCentroidIndex(point, centroids) {
    var minDist = Number.POSITIVE_INFINITY;
    var best = 0;
    for (var i = 0; i < centroids.length; i++) {
      var dx = point.x - centroids[i].x;
      var dy = point.y - centroids[i].y;
      var d2 = (dx * dx) + (dy * dy);
      if (d2 < minDist) {
        minDist = d2;
        best = i;
      }
    }
    return best;
  }

  function updateCentroids(points, assignments, k, previousCentroids) {
    var sums = [];
    var i;
    for (i = 0; i < k; i++) {
      sums.push({ x: 0, y: 0, count: 0 });
    }
    points.forEach(function (p, idx) {
      var cluster = assignments[idx];
      sums[cluster].x += p.x;
      sums[cluster].y += p.y;
      sums[cluster].count += 1;
    });
    return sums.map(function (sum, idx) {
      if (!sum.count) return previousCentroids[idx];
      return { x: sum.x / sum.count, y: sum.y / sum.count };
    });
  }

  function fitLogistic2D(points, steps, lr) {
    var wx = 0;
    var wy = 0;
    var b = 0;
    var n = points.length;
    var reg = 0.01;
    var step;

    for (step = 0; step < steps; step++) {
      var gwx = 0;
      var gwy = 0;
      var gb = 0;
      var i;
      for (i = 0; i < n; i++) {
        var p = points[i];
        var x = p.x - 0.5;
        var y = p.y - 0.5;
        var pred = sigmoid((wx * x) + (wy * y) + b);
        var err = pred - p.cls;
        gwx += err * x;
        gwy += err * y;
        gb += err;
      }
      wx -= lr * ((gwx / n) + (reg * wx));
      wy -= lr * ((gwy / n) + (reg * wy));
      b -= lr * (gb / n);
    }

    return { wx: wx, wy: wy, b: b };
  }

  function predictLogistic(model, x, y) {
    return sigmoid((model.wx * (x - 0.5)) + (model.wy * (y - 0.5)) + model.b);
  }

  function trainSimpleNn(points, hiddenSize, epochs, lr) {
    var rand = createRng(datasetSeed + 1701);
    var w1 = [];
    var b1 = [];
    var w2 = [];
    var b2 = (rand() - 0.5) * 0.2;
    var i;

    for (i = 0; i < hiddenSize; i++) {
      w1.push([(rand() - 0.5) * 1.2, (rand() - 0.5) * 1.2]);
      b1.push((rand() - 0.5) * 0.2);
      w2.push((rand() - 0.5) * 1.2);
    }

    var n = points.length;
    var reg = 0.002;

    for (var epoch = 0; epoch < epochs; epoch++) {
      var gw1 = [];
      var gb1 = [];
      var gw2 = [];
      var gb2 = 0;

      for (i = 0; i < hiddenSize; i++) {
        gw1.push([0, 0]);
        gb1.push(0);
        gw2.push(0);
      }

      for (var idx = 0; idx < n; idx++) {
        var p = points[idx];
        var x1 = (p.x - 0.5) * 2;
        var x2 = (p.y - 0.5) * 2;
        var target = p.cls;

        var h = [];
        for (i = 0; i < hiddenSize; i++) {
          h.push(Math.tanh((w1[i][0] * x1) + (w1[i][1] * x2) + b1[i]));
        }

        var z2 = b2;
        for (i = 0; i < hiddenSize; i++) {
          z2 += w2[i] * h[i];
        }
        var pred = sigmoid(z2);
        var dz2 = pred - target;

        gb2 += dz2;
        for (i = 0; i < hiddenSize; i++) {
          gw2[i] += dz2 * h[i];
        }

        for (i = 0; i < hiddenSize; i++) {
          var dz1 = dz2 * w2[i] * (1 - (h[i] * h[i]));
          gw1[i][0] += dz1 * x1;
          gw1[i][1] += dz1 * x2;
          gb1[i] += dz1;
        }
      }

      var invN = 1 / n;
      for (i = 0; i < hiddenSize; i++) {
        w1[i][0] -= lr * ((gw1[i][0] * invN) + (reg * w1[i][0]));
        w1[i][1] -= lr * ((gw1[i][1] * invN) + (reg * w1[i][1]));
        b1[i] -= lr * (gb1[i] * invN);
        w2[i] -= lr * ((gw2[i] * invN) + (reg * w2[i]));
      }
      b2 -= lr * (gb2 * invN);
    }

    return { w1: w1, b1: b1, w2: w2, b2: b2 };
  }

  function predictSimpleNn(model, x, y) {
    var x1 = (x - 0.5) * 2;
    var x2 = (y - 0.5) * 2;
    var h = [];
    var i;
    for (i = 0; i < model.w1.length; i++) {
      h.push(Math.tanh((model.w1[i][0] * x1) + (model.w1[i][1] * x2) + model.b1[i]));
    }
    var z = model.b2;
    for (i = 0; i < model.w2.length; i++) {
      z += model.w2[i] * h[i];
    }
    return sigmoid(z);
  }

  function fitLine(points) {
    var n = points.length;
    var sx = 0;
    var sy = 0;
    var sxx = 0;
    var sxy = 0;
    points.forEach(function (p) {
      sx += p.x;
      sy += p.y;
      sxx += p.x * p.x;
      sxy += p.x * p.y;
    });
    var denom = (n * sxx) - (sx * sx);
    if (Math.abs(denom) < 1e-9) {
      return { m: 0, b: sy / n };
    }
    var m = ((n * sxy) - (sx * sy)) / denom;
    var b = (sy - (m * sx)) / n;
    return { m: m, b: b };
  }

  function drawGrid() {
    var i;
    for (i = 0; i <= 5; i++) {
      var x = i / 5;
      drawLine(x, 0, x, 1, '#e4e8ee', 1, 1);
      var y = i / 5;
      drawLine(0, y, 1, y, '#e4e8ee', 1, 1);
    }

    drawLine(0, 0, 1, 0, '#b6c0cb', 1.3, 1);
    drawLine(0, 0, 0, 1, '#b6c0cb', 1.3, 1);
    drawLabel('0', 0.006, 0.02);
    drawLabel('x', 0.98, 0.03, 'end');
    drawLabel('y', 0.02, 0.98);
  }

  function drawLabel(text, x, y, anchor) {
    svg.appendChild(makeSvg('text', {
      x: toX(x),
      y: toY(y),
      'font-size': 11,
      fill: '#8c99a7',
      'text-anchor': anchor || 'start'
    }, text));
  }

  function drawCircle(x, y, radius, fill, stroke, strokeWidth, opacity) {
    svg.appendChild(makeSvg('circle', {
      cx: toX(x),
      cy: toY(y),
      r: radius,
      fill: fill,
      stroke: stroke || 'none',
      'stroke-width': strokeWidth || 0,
      opacity: opacity == null ? 1 : opacity
    }));
  }

  function drawLine(x1, y1, x2, y2, color, width, opacity, dash) {
    var attrs = {
      x1: toX(x1),
      y1: toY(y1),
      x2: toX(x2),
      y2: toY(y2),
      stroke: color,
      'stroke-width': width || 1.5,
      opacity: opacity == null ? 1 : opacity
    };
    if (dash) attrs['stroke-dasharray'] = dash;
    svg.appendChild(makeSvg('line', attrs));
  }

  function drawRect(x, y, w, h, fill, opacity) {
    var x1 = toX(x);
    var x2 = toX(x + w);
    var y1 = toY(y);
    var y2 = toY(y + h);
    svg.appendChild(makeSvg('rect', {
      x: x1,
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
      fill: fill,
      stroke: 'none',
      opacity: opacity == null ? 1 : opacity
    }));
  }

  function makeSvg(tag, attrs, textContent) {
    var el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach(function (key) {
      el.setAttribute(key, String(attrs[key]));
    });
    if (textContent) {
      el.textContent = textContent;
    }
    return el;
  }

  function clearSvg() {
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
  }

  function toX(value) {
    return PAD + (value * (WIDTH - (2 * PAD)));
  }

  function toY(value) {
    return HEIGHT - PAD - (value * (HEIGHT - (2 * PAD)));
  }

  function clamp01(v) {
    if (v < 0) return 0;
    if (v > 1) return 1;
    return v;
  }

  function clampY(v) {
    return clamp01(v);
  }

  function sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  function buildSharedData(seed) {
    var rand = createRng(seed);
    var points = [];
    var centers = [
      { x: 0.2, y: 0.24 },
      { x: 0.5, y: 0.53 },
      { x: 0.78, y: 0.78 }
    ];

    centers.forEach(function (c) {
      for (var i = 0; i < 18; i++) {
        var x = clamp01(c.x + ((rand() - 0.5) * 0.27));
        var trendY = 0.18 + (0.58 * x);
        var y = clamp01((0.72 * trendY) + (0.28 * c.y) + ((rand() - 0.5) * 0.24));
        var boundary = 0.26 + (0.43 * x) + (0.11 * Math.sin((x * 8.2) + 0.5));
        var cls = y > boundary ? 1 : 0;

        points.push({ x: x, y: y, cls: cls });
      }
    });

    return { points: points };
  }

  function createRng(seed) {
    var state = seed >>> 0;
    return function () {
      state = ((state * 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }
})();
</script>
