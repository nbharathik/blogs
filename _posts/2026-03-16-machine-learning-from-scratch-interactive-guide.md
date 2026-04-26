---
layout: post
title: "Machine Learning from Scratch"
author: bharathikannan
categories: [Machine learning]
description: "Learn machine learning from scratch with interactive visualizations. Drag data points, tune hyperparameters, watch algorithms train in real-time - all in your browser with math and code."
permalink: /ml/
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
.ml-card-vis {
  width: 100%;
  height: 160px;
  display: block;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  border-radius: 11px 11px 0 0;
}
.ml-card-vis svg {
  width: 100%;
  height: 100%;
  border-radius: 11px 11px 0 0;
}
.ml-card-body {
  padding: 0.35rem 0.8rem 0.65rem;
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
      <div class="ml-card-vis" aria-hidden="true"><svg viewBox="0 0 300 140" fill="none">
        <!-- axis lines -->
        <line x1="28" y1="125" x2="275" y2="125" stroke="#d5dbe3" stroke-width="0.8"/><line x1="28" y1="125" x2="28" y2="12" stroke="#d5dbe3" stroke-width="0.8"/>
        <!-- data points -->
        <circle cx="45" cy="105" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="70" cy="92" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="95" cy="82" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="115" cy="74" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="138" cy="68" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="162" cy="55" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="185" cy="50" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="205" cy="42" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="230" cy="35" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="255" cy="25" r="4" fill="#2e86c1" opacity="0.75"/>
        <!-- best fit line -->
        <line x1="32" y1="114" x2="272" y2="18" stroke="#e67e22" stroke-width="2.5" stroke-linecap="round"/>
        <!-- residual lines -->
        <line x1="70" y1="92" x2="70" y2="100" stroke="#e67e22" stroke-width="0.8" stroke-dasharray="2.5 1.5" opacity="0.45"/><line x1="115" y1="74" x2="115" y2="81" stroke="#e67e22" stroke-width="0.8" stroke-dasharray="2.5 1.5" opacity="0.45"/><line x1="162" y1="55" x2="162" y2="60" stroke="#e67e22" stroke-width="0.8" stroke-dasharray="2.5 1.5" opacity="0.45"/><line x1="205" y1="42" x2="205" y2="39" stroke="#e67e22" stroke-width="0.8" stroke-dasharray="2.5 1.5" opacity="0.45"/><line x1="230" y1="35" x2="230" y2="28" stroke="#e67e22" stroke-width="0.8" stroke-dasharray="2.5 1.5" opacity="0.45"/>
      </svg></div>
      <div class="ml-card-body">
        <h3>Linear Regression</h3>
        <p>Fit a line through data with gradient descent. Drag points and watch parameters converge.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/linear-regression-multivariate/">
      <div class="ml-card-vis" aria-hidden="true"><svg viewBox="0 0 300 140" fill="none">
        <!-- 3D axes -->
        <line x1="50" y1="115" x2="260" y2="115" stroke="#c8cfd8" stroke-width="1"/><line x1="50" y1="115" x2="50" y2="20" stroke="#c8cfd8" stroke-width="1"/><line x1="50" y1="115" x2="15" y2="90" stroke="#c8cfd8" stroke-width="1"/>
        <text x="262" y="128" font-size="9" fill="#8c99a7">x&#x2081;</text><text x="42" y="16" font-size="9" fill="#8c99a7">y</text><text x="6" y="86" font-size="9" fill="#8c99a7">x&#x2082;</text>
        <!-- tilted prediction plane -->
        <polygon points="65,100 235,75 250,35 80,58" fill="#2e86c1" opacity="0.08"/>
        <line x1="65" y1="100" x2="235" y2="75" stroke="#2e86c1" stroke-width="1" opacity="0.25"/><line x1="235" y1="75" x2="250" y2="35" stroke="#2e86c1" stroke-width="1" opacity="0.25"/><line x1="250" y1="35" x2="80" y2="58" stroke="#2e86c1" stroke-width="1" opacity="0.25"/><line x1="80" y1="58" x2="65" y2="100" stroke="#2e86c1" stroke-width="1" opacity="0.25"/>
        <!-- grid lines on plane -->
        <line x1="80" y1="90" x2="240" y2="65" stroke="#2e86c1" stroke-width="0.5" opacity="0.15"/><line x1="95" y1="79" x2="245" y2="55" stroke="#2e86c1" stroke-width="0.5" opacity="0.15"/>
        <line x1="110" y1="96" x2="122" y2="42" stroke="#2e86c1" stroke-width="0.5" opacity="0.15"/><line x1="165" y1="88" x2="178" y2="38" stroke="#2e86c1" stroke-width="0.5" opacity="0.15"/>
        <!-- data points with red residual lines to plane -->
        <line x1="95" y1="82" x2="95" y2="90" stroke="#e74c3c" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.55"/><circle cx="95" cy="82" r="3.5" fill="#2e86c1" opacity="0.75"/>
        <line x1="130" y1="68" x2="130" y2="78" stroke="#e74c3c" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.55"/><circle cx="130" cy="68" r="3.5" fill="#2e86c1" opacity="0.75"/>
        <line x1="160" y1="55" x2="160" y2="65" stroke="#e74c3c" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.55"/><circle cx="160" cy="55" r="3.5" fill="#2e86c1" opacity="0.75"/>
        <line x1="185" y1="48" x2="185" y2="58" stroke="#e74c3c" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.55"/><circle cx="185" cy="48" r="3.5" fill="#2e86c1" opacity="0.75"/>
        <line x1="210" y1="60" x2="210" y2="68" stroke="#e74c3c" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.55"/><circle cx="210" cy="60" r="3.5" fill="#2e86c1" opacity="0.75"/>
        <line x1="120" y1="92" x2="120" y2="86" stroke="#e74c3c" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.55"/><circle cx="120" cy="92" r="3.5" fill="#2e86c1" opacity="0.75"/>
        <line x1="230" y1="42" x2="230" y2="50" stroke="#e74c3c" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.55"/><circle cx="230" cy="42" r="3.5" fill="#2e86c1" opacity="0.75"/>
        <line x1="150" y1="78" x2="150" y2="72" stroke="#e74c3c" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.55"/><circle cx="150" cy="78" r="3.5" fill="#2e86c1" opacity="0.75"/>
      </svg></div>
      <div class="ml-card-body">
        <h3>Linear Regression - Multivariate</h3>
        <p>Multiple features in 3D. Watch a prediction plane tilt through your data.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/logistic-regression/">
      <div class="ml-card-vis" aria-hidden="true"><svg viewBox="0 0 300 140" fill="none">
        <!-- y=0 line at y=125, y=1 line at y=18, y=0.5 at y=72 -->
        <line x1="25" y1="125" x2="280" y2="125" stroke="#d5dbe3" stroke-width="0.6"/><line x1="25" y1="18" x2="280" y2="18" stroke="#d5dbe3" stroke-width="0.6"/>
        <text x="12" y="128" font-size="7" fill="#8c99a7">0</text><text x="12" y="22" font-size="7" fill="#8c99a7">1</text>
        <!-- sigmoid curve (0 to 1 range) -->
        <path d="M30 122 Q75 121 110 118 Q140 108 155 72 Q170 36 195 22 Q230 19 275 18" stroke="#e67e22" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- 0.5 threshold line -->
        <line x1="155" y1="10" x2="155" y2="135" stroke="#8c99a7" stroke-width="1" stroke-dasharray="4 3" opacity="0.4"/>
        <text x="282" y="75" font-size="8" fill="#8c99a7">0.5</text>
        <!-- class 0 data points at y=0 (bottom) -->
        <circle cx="50" cy="125" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="75" cy="125" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="100" cy="125" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="125" cy="125" r="4" fill="#2e86c1" opacity="0.75"/><circle cx="140" cy="125" r="4" fill="#2e86c1" opacity="0.75"/>
        <!-- class 1 data points at y=1 (top) -->
        <circle cx="175" cy="18" r="4" fill="#e67e22" opacity="0.75"/><circle cx="200" cy="18" r="4" fill="#e67e22" opacity="0.75"/><circle cx="225" cy="18" r="4" fill="#e67e22" opacity="0.75"/><circle cx="250" cy="18" r="4" fill="#e67e22" opacity="0.75"/><circle cx="265" cy="18" r="4" fill="#e67e22" opacity="0.75"/>
      </svg></div>
      <div class="ml-card-body">
        <h3>Logistic Regression</h3>
        <p>The sigmoid curve turns regression into classification. Train a binary classifier live.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/logistic-regression-multivariate/">
      <div class="ml-card-vis" aria-hidden="true"><svg viewBox="0 0 300 140" fill="none">
        <defs>
          <linearGradient id="lrm-bg" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stop-color="#e67e22" stop-opacity="0.18"/>
            <stop offset="42%" stop-color="#e67e22" stop-opacity="0.06"/>
            <stop offset="50%" stop-color="#ffffff" stop-opacity="0"/>
            <stop offset="58%" stop-color="#2e86c1" stop-opacity="0.06"/>
            <stop offset="100%" stop-color="#2e86c1" stop-opacity="0.18"/>
          </linearGradient>
        </defs>
        <!-- probability background -->
        <rect x="20" y="8" width="260" height="124" rx="3" fill="url(#lrm-bg)"/>
        <!-- axes -->
        <line x1="20" y1="132" x2="280" y2="132" stroke="#c8cfd8" stroke-width="0.8"/>
        <line x1="20" y1="8" x2="20" y2="132" stroke="#c8cfd8" stroke-width="0.8"/>
        <text x="150" y="140" text-anchor="middle" font-size="8" fill="#8c99a7">x&#x2081;</text>
        <text x="10" y="72" font-size="8" fill="#8c99a7">x&#x2082;</text>
        <!-- decision boundary (diagonal) -->
        <line x1="230" y1="8" x2="50" y2="132" stroke="#555" stroke-width="2" stroke-linecap="round"/>
        <!-- probability bands near boundary -->
        <line x1="218" y1="8" x2="38" y2="132" stroke="#8c99a7" stroke-width="0.5" stroke-dasharray="3 3" opacity="0.25"/>
        <line x1="242" y1="8" x2="62" y2="132" stroke="#8c99a7" stroke-width="0.5" stroke-dasharray="3 3" opacity="0.25"/>
        <!-- class 0 (orange) bottom-left -->
        <circle cx="48" cy="110" r="4.5" fill="#e67e22" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <circle cx="75" cy="95" r="4.5" fill="#e67e22" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <circle cx="55" cy="80" r="4.5" fill="#e67e22" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <circle cx="95" cy="115" r="4.5" fill="#e67e22" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <circle cx="110" cy="90" r="4.5" fill="#e67e22" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <circle cx="85" cy="70" r="4.5" fill="#e67e22" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <circle cx="130" cy="105" r="4.5" fill="#e67e22" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <!-- class 1 (blue) top-right -->
        <circle cx="195" cy="25" r="4.5" fill="#2e86c1" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <circle cx="220" cy="45" r="4.5" fill="#2e86c1" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <circle cx="250" cy="30" r="4.5" fill="#2e86c1" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <circle cx="175" cy="50" r="4.5" fill="#2e86c1" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <circle cx="210" cy="70" r="4.5" fill="#2e86c1" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <circle cx="240" cy="60" r="4.5" fill="#2e86c1" opacity="0.8" stroke="#fff" stroke-width="1"/>
        <circle cx="260" cy="20" r="4.5" fill="#2e86c1" opacity="0.8" stroke="#fff" stroke-width="1"/>
      </svg></div>
      <div class="ml-card-body">
        <h3>Logistic Regression - Multivariate</h3>
        <p>Two features, one decision boundary. Explore 3D sigmoid surfaces and cost landscapes.</p>
      </div>
    </a>
  </div>
</div>

<div class="ml-category">
  <h2>Optimization & Regularization</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/gradient-descent/">
      <div class="ml-card-vis" aria-hidden="true"><svg viewBox="0 0 300 140" fill="none">
        <ellipse cx="150" cy="70" rx="110" ry="50" fill="none" stroke="#d5dbe3" stroke-width="1"/>
        <ellipse cx="150" cy="70" rx="75" ry="34" fill="none" stroke="#d5dbe3" stroke-width="1"/>
        <ellipse cx="150" cy="70" rx="40" ry="18" fill="none" stroke="#d5dbe3" stroke-width="1"/>
        <ellipse cx="150" cy="70" rx="12" ry="5.5" fill="#2e86c1" opacity="0.15" stroke="#d5dbe3" stroke-width="1"/>
        <circle cx="62" cy="48" r="4" fill="#e67e22"/><circle cx="90" cy="42" r="3.5" fill="#e67e22" opacity="0.8"/><circle cx="112" cy="50" r="3" fill="#e67e22" opacity="0.6"/><circle cx="132" cy="62" r="2.5" fill="#e67e22" opacity="0.5"/><circle cx="148" cy="69" r="3.5" fill="#2e86c1"/>
        <polyline points="62,48 90,42 112,50 132,62 148,69" stroke="#e67e22" stroke-width="1.5" stroke-dasharray="4 2" fill="none" stroke-linecap="round"/>
        <text x="150" y="132" text-anchor="middle" font-size="9" fill="#8c99a7">SGD &middot; Momentum &middot; Adam</text>
      </svg></div>
      <div class="ml-card-body">
        <h3>Gradient Descent Deep Dive</h3>
        <p>Race SGD, Momentum, and Adam side-by-side on contour surfaces.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/polynomial-regression/">
      <div class="ml-card-vis" aria-hidden="true"><svg viewBox="0 0 300 140" fill="none">
        <circle cx="40" cy="100" r="3.5" fill="#2e86c1" opacity="0.7"/><circle cx="70" cy="85" r="3.5" fill="#2e86c1" opacity="0.7"/><circle cx="100" cy="92" r="3.5" fill="#2e86c1" opacity="0.7"/><circle cx="130" cy="50" r="3.5" fill="#2e86c1" opacity="0.7"/><circle cx="160" cy="40" r="3.5" fill="#2e86c1" opacity="0.7"/><circle cx="190" cy="55" r="3.5" fill="#2e86c1" opacity="0.7"/><circle cx="220" cy="75" r="3.5" fill="#2e86c1" opacity="0.7"/><circle cx="250" cy="35" r="3.5" fill="#2e86c1" opacity="0.7"/>
        <path d="M30 108 Q60 78 100 88 Q140 42 170 38 Q200 48 230 70 Q255 28 275 25" stroke="#e67e22" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M30 105 L275 35" stroke="#8c99a7" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.5"/>
        <text x="60" y="22" font-size="9" fill="#8c99a7">degree=1</text><text x="200" y="22" font-size="9" fill="#e67e22">degree=7</text>
      </svg></div>
      <div class="ml-card-body">
        <h3>Polynomial Regression & Bias-Variance</h3>
        <p>Slide polynomial degree and watch underfitting become overfitting.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/regularization-ridge-lasso/">
      <div class="ml-card-vis" aria-hidden="true"><svg viewBox="0 0 300 140" fill="none">
        <line x1="150" y1="10" x2="150" y2="130" stroke="#d5dbe3" stroke-width="0.8"/><line x1="40" y1="70" x2="260" y2="70" stroke="#d5dbe3" stroke-width="0.8"/>
        <circle cx="150" cy="70" r="42" fill="none" stroke="#2e86c1" stroke-width="2" opacity="0.6"/>
        <rect x="120" y="40" width="60" height="60" fill="none" stroke="#e67e22" stroke-width="2" opacity="0.6" transform="rotate(45 150 70)"/>
        <ellipse cx="200" cy="38" rx="60" ry="30" fill="none" stroke="#8c99a7" stroke-width="1.2" stroke-dasharray="4 2" transform="rotate(-25 200 38)"/>
        <circle cx="192" cy="70" r="4.5" fill="#2e86c1" opacity="0.8"/><circle cx="150" cy="28" r="4.5" fill="#e67e22" opacity="0.8"/>
        <text x="50" y="132" font-size="9" fill="#2e86c1">Ridge (L2)</text><text x="210" y="132" font-size="9" fill="#e67e22">Lasso (L1)</text>
      </svg></div>
      <div class="ml-card-body">
        <h3>Regularization: Ridge, Lasso & Elastic Net</h3>
        <p>Diamond vs circle geometry. Watch coefficients shrink to zero.</p>
      </div>
    </a>
  </div>
</div>

<div class="ml-category">
  <h2>Neural Networks from Scratch</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/perceptron-mlp/">
      <div class="ml-card-vis" aria-hidden="true"><svg viewBox="0 0 300 140" fill="none">
        <circle cx="50" cy="40" r="10" fill="#2e86c1" opacity="0.15" stroke="#2e86c1" stroke-width="1.5"/><circle cx="50" cy="100" r="10" fill="#2e86c1" opacity="0.15" stroke="#2e86c1" stroke-width="1.5"/>
        <circle cx="150" cy="30" r="10" fill="#e67e22" opacity="0.15" stroke="#e67e22" stroke-width="1.5"/><circle cx="150" cy="70" r="10" fill="#e67e22" opacity="0.15" stroke="#e67e22" stroke-width="1.5"/><circle cx="150" cy="110" r="10" fill="#e67e22" opacity="0.15" stroke="#e67e22" stroke-width="1.5"/>
        <circle cx="250" cy="70" r="10" fill="#16a085" opacity="0.15" stroke="#16a085" stroke-width="1.5"/>
        <line x1="60" y1="40" x2="140" y2="30" stroke="#8c99a7" stroke-width="1" opacity="0.5"/><line x1="60" y1="40" x2="140" y2="70" stroke="#8c99a7" stroke-width="1" opacity="0.5"/><line x1="60" y1="40" x2="140" y2="110" stroke="#8c99a7" stroke-width="1" opacity="0.5"/>
        <line x1="60" y1="100" x2="140" y2="30" stroke="#8c99a7" stroke-width="1" opacity="0.5"/><line x1="60" y1="100" x2="140" y2="70" stroke="#8c99a7" stroke-width="1" opacity="0.5"/><line x1="60" y1="100" x2="140" y2="110" stroke="#8c99a7" stroke-width="1" opacity="0.5"/>
        <line x1="160" y1="30" x2="240" y2="70" stroke="#8c99a7" stroke-width="1" opacity="0.5"/><line x1="160" y1="70" x2="240" y2="70" stroke="#8c99a7" stroke-width="1" opacity="0.5"/><line x1="160" y1="110" x2="240" y2="70" stroke="#8c99a7" stroke-width="1" opacity="0.5"/>
        <text x="50" y="44" text-anchor="middle" font-size="8" fill="#2e86c1">x</text><text x="250" y="74" text-anchor="middle" font-size="8" fill="#16a085">y</text>
      </svg></div>
      <div class="ml-card-body">
        <h3>The Perceptron & MLP</h3>
        <p>A single neuron fails on XOR. Add a hidden layer for the "aha!" moment.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/backpropagation/">
      <div class="ml-card-vis" aria-hidden="true"><svg viewBox="0 0 300 140" fill="none">
        <circle cx="45" cy="45" r="9" fill="#2e86c1" opacity="0.15" stroke="#2e86c1" stroke-width="1.3"/><circle cx="45" cy="95" r="9" fill="#2e86c1" opacity="0.15" stroke="#2e86c1" stroke-width="1.3"/>
        <circle cx="130" cy="35" r="9" fill="#e67e22" opacity="0.15" stroke="#e67e22" stroke-width="1.3"/><circle cx="130" cy="70" r="9" fill="#e67e22" opacity="0.15" stroke="#e67e22" stroke-width="1.3"/><circle cx="130" cy="105" r="9" fill="#e67e22" opacity="0.15" stroke="#e67e22" stroke-width="1.3"/>
        <circle cx="215" cy="50" r="9" fill="#e67e22" opacity="0.15" stroke="#e67e22" stroke-width="1.3"/><circle cx="215" cy="90" r="9" fill="#e67e22" opacity="0.15" stroke="#e67e22" stroke-width="1.3"/>
        <circle cx="270" cy="70" r="9" fill="#16a085" opacity="0.15" stroke="#16a085" stroke-width="1.3"/>
        <line x1="54" y1="45" x2="121" y2="35" stroke="#2e86c1" stroke-width="1" opacity="0.4"/><line x1="54" y1="45" x2="121" y2="70" stroke="#2e86c1" stroke-width="1" opacity="0.4"/><line x1="54" y1="95" x2="121" y2="70" stroke="#2e86c1" stroke-width="1" opacity="0.4"/><line x1="54" y1="95" x2="121" y2="105" stroke="#2e86c1" stroke-width="1" opacity="0.4"/>
        <line x1="139" y1="35" x2="206" y2="50" stroke="#e67e22" stroke-width="1" opacity="0.4"/><line x1="139" y1="70" x2="206" y2="50" stroke="#e67e22" stroke-width="1" opacity="0.4"/><line x1="139" y1="70" x2="206" y2="90" stroke="#e67e22" stroke-width="1" opacity="0.4"/><line x1="139" y1="105" x2="206" y2="90" stroke="#e67e22" stroke-width="1" opacity="0.4"/>
        <line x1="224" y1="50" x2="261" y2="70" stroke="#16a085" stroke-width="1" opacity="0.4"/><line x1="224" y1="90" x2="261" y2="70" stroke="#16a085" stroke-width="1" opacity="0.4"/>
        <path d="M270 58 L285 50 L280 56" stroke="#2e86c1" stroke-width="1.5" fill="none" opacity="0.7"/>
        <text x="285" y="48" font-size="8" fill="#2e86c1">fwd</text>
        <path d="M45 110 L30 118 L35 112" stroke="#e67e22" stroke-width="1.5" fill="none" opacity="0.7"/>
        <text x="10" y="130" font-size="8" fill="#e67e22">grad</text>
      </svg></div>
      <div class="ml-card-body">
        <h3>Backpropagation Visualized</h3>
        <p>Data flows forward, gradients flow backward. See vanishing gradients in action.</p>
      </div>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/activation-functions/">
      <div class="ml-card-vis" aria-hidden="true"><svg viewBox="0 0 300 140" fill="none">
        <!-- axes: x-axis at y=95 (represents 0), y-axis at x=150 -->
        <line x1="20" y1="95" x2="280" y2="95" stroke="#d5dbe3" stroke-width="0.8"/>
        <line x1="150" y1="10" x2="150" y2="130" stroke="#d5dbe3" stroke-width="0.8"/>
        <!-- tick marks and labels -->
        <text x="144" y="106" font-size="8" fill="#8c99a7">0</text>
        <text x="280" y="92" font-size="8" fill="#8c99a7">1</text>
        <text x="280" y="48" font-size="8" fill="#8c99a7" opacity="0.6">-1</text>
        <!-- ReLU: flat at 0 for x<0, linear up for x>0 -->
        <path d="M20 95 L150 95 L260 25" stroke="#e67e22" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <!-- Sigmoid: 0 to 1 range only (y=95 is 0, y=35 is 1) -->
        <path d="M20 93 Q70 92 110 88 Q135 80 150 65 Q165 50 175 42 Q210 37 280 35" stroke="#2e86c1" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="6 3"/>
        <!-- Tanh: -1 to 1 range (y=95 is 0, y=35 is +1, y=130 would be beyond but we cap display) -->
        <path d="M20 125 Q60 124 100 120 Q130 110 150 95 Q170 80 180 60 Q200 42 240 36 Q260 35 280 35" stroke="#16a085" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="2 3"/>
        <!-- reference lines for ranges -->
        <line x1="20" y1="35" x2="280" y2="35" stroke="#d5dbe3" stroke-width="0.5" stroke-dasharray="3 3" opacity="0.5"/>
        <!-- labels -->
        <text x="250" y="20" font-size="9" fill="#e67e22">ReLU</text>
        <text x="195" y="30" font-size="9" fill="#2e86c1">Sigmoid</text>
        <text x="40" y="132" font-size="9" fill="#16a085">Tanh</text>
      </svg></div>
      <div class="ml-card-body">
        <h3>Activation Functions</h3>
        <p>Sigmoid, ReLU, Tanh, GELU side-by-side with derivative overlays.</p>
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
