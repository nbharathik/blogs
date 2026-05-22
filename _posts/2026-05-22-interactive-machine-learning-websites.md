---
layout: post
title: "Awesome Interactive AI and Math Websites"
author: bharathikannan
categories: [Machine learning]
tags: [machine-learning, deep-learning, artificial-intelligence, interactive, visualization, resources]
description: "A curated list of interactive websites for learning AI, math and related topics in the browser."
permalink: /interactive-ml-websites/
date: 2026-05-22
show_series_preview: false
---

<style>
/* Let this post use the full container width since it is mostly a table */
.post-layout {
  max-width: var(--wide-width) !important;
  grid-template-columns: 1fr !important;
}
.post-content {
  max-width: none !important;
}
.post-sidebar {
  display: none !important;
}

.resource-intro {
  color: var(--text-secondary);
  max-width: 760px;
  margin: 0 0 1rem;
  line-height: 1.6;
}
.resource-meta {
  margin: 0 0 1.1rem;
  font-size: 0.82rem;
  color: var(--text-tertiary);
}
.resource-meta strong {
  color: var(--text-primary);
  font-weight: 600;
}
.resource-meta .sep {
  margin: 0 0.5rem;
  opacity: 0.5;
}

/* Filter chips: simple, editorial */
.resource-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin: 0 0 0.9rem;
}
.resource-filter {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.3rem 0.7rem;
  transition: border-color var(--transition), color var(--transition), background var(--transition);
}
.resource-filter:hover {
  border-color: var(--text-secondary);
  color: var(--text-primary);
}
.resource-filter.active {
  border-color: var(--text-primary);
  background: var(--text-primary);
  color: var(--bg-primary);
}

.resource-count {
  color: var(--text-tertiary);
  font-size: 0.8rem;
  margin: 0 0 0.6rem;
}
.resource-count:empty {
  display: none;
}

/* Table: editorial, no big card or shadow */
.resource-table-wrap {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin: 0 0 1.5rem;
}
.resource-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  table-layout: fixed;
}
.resource-table col.col-name { width: 26%; }
.resource-table col.col-desc { width: 54%; }
.resource-table col.col-tags { width: 20%; }

.resource-table th,
.resource-table td {
  border-bottom: 1px solid var(--border-light);
  padding: 0.55rem 0.9rem;
  text-align: left;
  vertical-align: middle;
  word-wrap: break-word;
}
.resource-table th {
  color: var(--text-tertiary);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: transparent;
  border-bottom: 1px solid var(--border);
  padding: 0.45rem 0.9rem;
}
.resource-table tbody tr {
  transition: background var(--transition);
}
.resource-table tbody tr:hover {
  background: var(--bg-secondary);
}
.resource-table tr:last-child td {
  border-bottom: 0;
}

/* Clickable website name (replaces the Open button column) */
.resource-name {
  color: var(--text-primary);
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none !important;
  display: inline-flex;
  align-items: baseline;
  gap: 0.28rem;
  transition: color var(--transition);
}
.resource-name::after {
  content: '↗';
  font-size: 0.78em;
  color: var(--text-tertiary);
  transition: color var(--transition), transform var(--transition);
}
.resource-name:hover {
  color: var(--accent);
}
.resource-name:hover::after {
  color: var(--accent);
  transform: translate(1px, -1px);
}

.resource-desc {
  color: var(--text-secondary);
  font-size: 0.86rem;
  line-height: 1.5;
}

/* Tags: neutral, no per-category color */
.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.resource-tag {
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-tertiary);
  font-size: 0.68rem;
  font-weight: 500;
  line-height: 1.2;
  padding: 0.16rem 0.55rem;
  background: transparent;
  white-space: nowrap;
}

@media (max-width: 820px) {
  .resource-table {
    table-layout: auto;
    min-width: 640px;
  }
  .resource-table-wrap {
    overflow-x: auto;
  }
}

@media (max-width: 640px) {
  .resource-filter {
    font-size: 0.74rem;
    padding: 0.28rem 0.6rem;
  }
}
</style>

<p class="resource-intro">
A collection of interactive websites for learning AI, math, and related topics. Many of these websites inspired and helped me while writing posts for my blogs. If you know a useful website that should be on this list, feel free to open an issue or pull request on the <a href="{{ site.repository_url }}" target="_blank" rel="noopener">blog repository</a>.
</p>
<p class="resource-meta">
  <strong id="resourceTotal">27</strong> websites <span class="sep">·</span> Updated May 22, 2026
</p>

<div class="resource-tools" data-resource-explorer>
  <button class="resource-filter active" type="button" data-filter="all">All</button>
  <button class="resource-filter" type="button" data-filter="ml">ML</button>
  <button class="resource-filter" type="button" data-filter="dl">Deep learning</button>
  <button class="resource-filter" type="button" data-filter="llms">LLMs</button>
  <button class="resource-filter" type="button" data-filter="vision">Vision</button>
  <button class="resource-filter" type="button" data-filter="math">Math</button>
  <button class="resource-filter" type="button" data-filter="algo">Algorithms</button>
</div>
<p class="resource-count" id="resourceCount"></p>

<div class="resource-table-wrap">
  <table class="resource-table">
    <colgroup>
      <col class="col-name">
      <col class="col-desc">
      <col class="col-tags">
    </colgroup>
    <thead>
      <tr>
        <th>Website</th>
        <th>Description</th>
        <th>Tags</th>
      </tr>
    </thead>
    <tbody id="resourceRows">
      <tr data-tags="ml dl">
        <td><a class="resource-name" href="https://playground.tensorflow.org/" target="_blank" rel="noopener">TensorFlow Playground</a></td>
        <td><span class="resource-desc">A small neural network sandbox you can shape live in the browser.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">ML</span><span class="resource-tag">Deep learning</span></span></td>
      </tr>
      <tr data-tags="ml vision">
        <td><a class="resource-name" href="https://teachablemachine.withgoogle.com/" target="_blank" rel="noopener">Teachable Machine</a></td>
        <td><span class="resource-desc">Train your own image, sound, and pose models without writing any code.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">ML</span><span class="resource-tag">Vision</span></span></td>
      </tr>
      <tr data-tags="llms ml">
        <td><a class="resource-name" href="https://pair.withgoogle.com/explorables/" target="_blank" rel="noopener">Google PAIR AI Explorables</a></td>
        <td><span class="resource-desc">Interactive essays from Google PAIR on fairness, privacy, and model behavior.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">ML</span><span class="resource-tag">LLMs</span></span></td>
      </tr>
      <tr data-tags="dl ml">
        <td><a class="resource-name" href="https://www.deeplearning.ai/ai-notes/index.html" target="_blank" rel="noopener">DeepLearning.AI AI Notes</a></td>
        <td><span class="resource-desc">Visual notes that demystify initialization and optimization in deep learning.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Deep learning</span></span></td>
      </tr>
      <tr data-tags="dl ml">
        <td><a class="resource-name" href="https://distill.pub/" target="_blank" rel="noopener">Distill</a></td>
        <td><span class="resource-desc">A journal of beautifully visual essays on how neural networks really work.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Deep learning</span></span></td>
      </tr>
      <tr data-tags="dl">
        <td><a class="resource-name" href="https://poloclub.github.io/ganlab/" target="_blank" rel="noopener">GAN Lab</a></td>
        <td><span class="resource-desc">Watch a GAN's generator and discriminator learn from each other live.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Deep learning</span></span></td>
      </tr>
      <tr data-tags="vision dl">
        <td><a class="resource-name" href="https://poloclub.github.io/cnn-explainer/" target="_blank" rel="noopener">CNN Explainer</a></td>
        <td><span class="resource-desc">See how a CNN turns pixels into predictions, layer by layer.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Vision</span><span class="resource-tag">Deep learning</span></span></td>
      </tr>
      <tr data-tags="llms dl">
        <td><a class="resource-name" href="https://poloclub.github.io/transformer-explainer/" target="_blank" rel="noopener">Transformer Explainer</a></td>
        <td><span class="resource-desc">A live transformer that lets you inspect tokens, attention, and predictions.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">LLMs</span></span></td>
      </tr>
      <tr data-tags="ml">
        <td><a class="resource-name" href="https://projector.tensorflow.org/" target="_blank" rel="noopener">Embedding Projector</a></td>
        <td><span class="resource-desc">Explore high-dimensional embeddings using PCA, t-SNE, and UMAP.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">ML</span></span></td>
      </tr>
      <tr data-tags="ml">
        <td><a class="resource-name" href="https://pair-code.github.io/what-if-tool/" target="_blank" rel="noopener">What-If Tool</a></td>
        <td><span class="resource-desc">Probe a model's behavior and explore fairness scenarios visually.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">ML</span></span></td>
      </tr>
      <tr data-tags="ml">
        <td><a class="resource-name" href="https://mlu-explain.github.io/" target="_blank" rel="noopener">MLU-Explain</a></td>
        <td><span class="resource-desc">Amazon's visual essays covering the core ideas of machine learning.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">ML</span></span></td>
      </tr>
      <tr data-tags="ml">
        <td><a class="resource-name" href="https://r2d3.us/visual-intro-to-machine-learning-part-1/" target="_blank" rel="noopener">R2D3 Visual Intro to ML</a></td>
        <td><span class="resource-desc">A scrollytelling intro to decision trees and the bias-variance trade-off.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">ML</span></span></td>
      </tr>
      <tr data-tags="math ml">
        <td><a class="resource-name" href="https://setosa.io/ev/" target="_blank" rel="noopener">Explained Visually</a></td>
        <td><span class="resource-desc">Setosa's short visual explainers for statistics and ML fundamentals.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Math</span></span></td>
      </tr>
      <tr data-tags="math">
        <td><a class="resource-name" href="https://seeing-theory.brown.edu/" target="_blank" rel="noopener">Seeing Theory</a></td>
        <td><span class="resource-desc">A beautiful visual introduction to probability and statistics.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Math</span></span></td>
      </tr>
      <tr data-tags="math ml">
        <td><a class="resource-name" href="https://www.infinitecuriosity.org/vizgp/" target="_blank" rel="noopener">Interactive Gaussian Process</a></td>
        <td><span class="resource-desc">Tweak kernels and watch a Gaussian process update its uncertainty live.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Math</span></span></td>
      </tr>
      <tr data-tags="algo">
        <td><a class="resource-name" href="https://visualgo.net/en" target="_blank" rel="noopener">VisuAlgo</a></td>
        <td><span class="resource-desc">Animated walkthroughs of classic data structures and algorithms.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Algorithms</span></span></td>
      </tr>
      <tr data-tags="algo math">
        <td><a class="resource-name" href="https://www.redblobgames.com/" target="_blank" rel="noopener">Red Blob Games</a></td>
        <td><span class="resource-desc">Interactive notes on pathfinding, grids, and procedural noise.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Algorithms</span><span class="resource-tag">Math</span></span></td>
      </tr>
      <tr data-tags="math">
        <td><a class="resource-name" href="https://ncase.me/" target="_blank" rel="noopener">Nicky Case</a></td>
        <td><span class="resource-desc">Playable essays on game theory, networks, and social dynamics.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Math</span></span></td>
      </tr>
      <tr data-tags="math">
        <td><a class="resource-name" href="https://explorabl.es/" target="_blank" rel="noopener">Explorable Explanations Hub</a></td>
        <td><span class="resource-desc">A hub of interactive learning experiences spanning many topics.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Math</span></span></td>
      </tr>
      <tr data-tags="ml dl">
        <td><a class="resource-name" href="https://cs.stanford.edu/people/karpathy/convnetjs/demo/classify2d.html" target="_blank" rel="noopener">ConvNetJS Classifier Demo</a></td>
        <td><span class="resource-desc">Watch a small neural network learn a 2D decision boundary in real time.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">ML</span></span></td>
      </tr>
      <tr data-tags="ml dl llms">
        <td><a class="resource-name" href="https://www.overfitting.io/" target="_blank" rel="noopener">Overfitting.io</a></td>
        <td><span class="resource-desc">Small visualizers for optimizers, MNIST, and tokenization in the browser.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">ML</span><span class="resource-tag">Deep learning</span></span></td>
      </tr>
      <tr data-tags="llms">
        <td><a class="resource-name" href="https://bbycroft.net/llm" target="_blank" rel="noopener">LLM Visualization</a></td>
        <td><span class="resource-desc">A 3D walkthrough of a full GPT model as it processes tokens, layer by layer.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">LLMs</span></span></td>
      </tr>
      <tr data-tags="llms vision dl">
        <td><a class="resource-name" href="https://poloclub.github.io/diffusion-explainer/" target="_blank" rel="noopener">Diffusion Explainer</a></td>
        <td><span class="resource-desc">An interactive explainer for how Stable Diffusion turns text into images.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">LLMs</span><span class="resource-tag">Vision</span></span></td>
      </tr>
      <tr data-tags="llms">
        <td><a class="resource-name" href="https://tiktokenizer.vercel.app/" target="_blank" rel="noopener">Tiktokenizer</a></td>
        <td><span class="resource-desc">Type any text and see exactly how it tokenizes for GPT-style models.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">LLMs</span></span></td>
      </tr>
      <tr data-tags="ml llms">
        <td><a class="resource-name" href="https://poloclub.github.io/wizmap/" target="_blank" rel="noopener">WizMap</a></td>
        <td><span class="resource-desc">Pan and zoom around large embedding spaces with millions of points.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">ML</span></span></td>
      </tr>
      <tr data-tags="dl">
        <td><a class="resource-name" href="https://tensorspace.org/" target="_blank" rel="noopener">TensorSpace.js</a></td>
        <td><span class="resource-desc">View pre-trained neural networks as rotatable 3D layer stacks.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Deep learning</span></span></td>
      </tr>
      <tr data-tags="algo">
        <td><a class="resource-name" href="https://www.cs.usfca.edu/~galles/visualization/Algorithms.html" target="_blank" rel="noopener">USFCA Algorithm Visualizations</a></td>
        <td><span class="resource-desc">A classic, comprehensive set of DSA visualizations by David Galles.</span></td>
        <td><span class="resource-tags"><span class="resource-tag">Algorithms</span></span></td>
      </tr>
    </tbody>
  </table>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  var explorer = document.querySelector('[data-resource-explorer]');
  if (!explorer) return;

  var rows = Array.prototype.slice.call(document.querySelectorAll('#resourceRows tr'));
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.resource-filter'));
  var count = document.getElementById('resourceCount');
  var total = document.getElementById('resourceTotal');
  var activeFilter = 'all';

  if (total) total.textContent = rows.length;

  function updateResources() {
    var visible = 0;
    rows.forEach(function(row) {
      var tags = row.getAttribute('data-tags') || '';
      var matches = activeFilter === 'all' || tags.indexOf(activeFilter) !== -1;
      row.hidden = !matches;
      if (matches) visible += 1;
    });

    if (visible === 0) {
      count.textContent = 'No websites match this tag.';
    } else if (activeFilter === 'all') {
      count.textContent = '';
    } else {
      count.textContent = visible + ' of ' + rows.length + ' websites';
    }
  }

  buttons.forEach(function(button) {
    button.addEventListener('click', function() {
      activeFilter = button.getAttribute('data-filter') || 'all';
      buttons.forEach(function(item) {
        item.classList.toggle('active', item === button);
      });
      updateResources();
    });
  });

  updateResources();
});
</script>
