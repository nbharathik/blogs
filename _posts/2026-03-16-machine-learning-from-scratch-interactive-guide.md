---
layout: post
title: "Interactive Machine Learning"
author: bharathikannan
categories: [Machine learning]
description: "Learn machine learning with interactive visualizations in your browser with math and code."
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
@media (max-width: 640px) {
  .ml-grid { grid-template-columns: 1fr; }
}
</style>

An interactive series where machine learning algorithms are built from scratch, explained with simple math, and visualized step by step. The posts cover topics like regression, gradient descent, regularization, neural networks, decision trees, clustering, and more. Each post starts with the intuition, then walks through the math and lets you experiment directly in the browser. You can move data points, tune parameters, and watch algorithms learn in real time. The goal is to make machine learning easier to understand from the ground up.
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

<p class="ml-part-label">Part 2</p>

<div class="ml-category">
  <h2>Classification</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/knn/">
      <div class="ml-card-body">
        <h3>K-Nearest Neighbors</h3>
        <p>Classify by proximity. Paint decision boundaries, tune K from 1 to 30, and watch the curse of dimensionality bite.</p>
      </div>
    </a>
  </div>
</div>
