---
layout: post
title: "Loss Functions - An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
hidden: true
description: "Explore regression losses (MSE, MAE, Huber), classification losses (Cross-Entropy, Hinge, Focal), MSE vs cross-entropy convergence, and softmax temperature interactively."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /loss-functions/
date: 2026-03-17
---

<!-- Loss function content extracted from activations-losses post. To be expanded into a full standalone post. -->

<!-- ============ SECTIONS ============ -->

## Regression Loss Functions

A loss function measures how wrong our model's predictions are. For regression, the three major choices are:

**Mean Squared Error (MSE):** $$L = \frac{1}{n}\sum(y_i - \hat{y}_i)^2$$

Penalizes large errors quadratically. Sensitive to outliers.

**Mean Absolute Error (MAE):** $$L = \frac{1}{n}\sum|y_i - \hat{y}_i|$$

Linear penalty. Robust to outliers but not differentiable at zero.

**Huber Loss:** $$L = \begin{cases} \frac{1}{2}(y - \hat{y})^2 & |y - \hat{y}| \leq \delta \\ \delta|y - \hat{y}| - \frac{1}{2}\delta^2 & \text{otherwise} \end{cases}$$

Best of both: quadratic near zero (smooth gradients), linear for large errors (outlier robustness).

<!-- TODO: Add interactive demo for regression loss -->

---

## Classification Loss Functions

For classification, the loss must penalize wrong predictions more than it rewards correct ones, especially when the model is confident and wrong.

**Binary Cross-Entropy:** $$L = -[y\log(p) + (1-y)\log(1-p)]$$

The standard for binary classification. Goes to infinity when the model is confidently wrong.

**Hinge Loss:** $$L = \max(0, 1 - y \cdot f(x))$$

Used by SVMs. Only penalizes predictions within the margin.

**Focal Loss:** $$L = -(1 - p_t)^\gamma \log(p_t)$$

Down-weights easy examples, focuses on hard ones. Crucial for imbalanced datasets.

<!-- TODO: Add interactive demo for classification loss -->

---

## MSE vs Cross-Entropy for Classification

A common mistake is using MSE for classification. Let us see why cross-entropy converges faster. We train a tiny network on the same 2D classification task with both losses side-by-side.

The key insight: MSE's gradient depends on $$(\hat{y} - y) \cdot \sigma'(z)$$. When the sigmoid saturates (confident wrong prediction), $$\sigma'(z) \approx 0$$, so the gradient vanishes and the model learns very slowly. Cross-entropy cancels this term: its gradient is simply $$(\hat{y} - y)$$, which is large precisely when the model is wrong.

<!-- TODO: Add interactive MSE vs CE training demo -->

---

## Softmax Visualization

For multi-class classification, we use softmax to convert raw logits into a probability distribution:

$$\text{softmax}(z_i) = \frac{e^{z_i}}{\sum_j e^{z_j}}$$

The temperature parameter $$T$$ controls the sharpness of the distribution:

$$\text{softmax}(z_i; T) = \frac{e^{z_i/T}}{\sum_j e^{z_j/T}}$$

Low temperature makes the distribution peaked (more confident). High temperature makes it uniform (more uncertain). This is used in knowledge distillation and language model sampling.

<!-- TODO: Add interactive softmax demo -->

---

## Loss Function Selection Guide

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

---

## References

<ol class="references">
  <li>Lin, T.-Y., Goyal, P., Girshick, R., He, K., &amp; Dollar, P. (2017). <em>Focal Loss for Dense Object Detection</em>. ICCV. <a href="https://doi.org/10.1109/ICCV.2017.324" target="_blank" rel="noopener">https://doi.org/10.1109/ICCV.2017.324</a></li>
</ol>
