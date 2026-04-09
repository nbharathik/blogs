---
layout: post
title: "Transformers Visualized - Interactive Architecture and Matrix Math"
author: bharathikannan
categories: [Machine learning]
series: false
hidden: true
archived: false
description: "A visualization-first guide to Transformers with interactive architecture flow, Q/K/V matrix projection, attention matrix multiplication, multi-head patterns, decoder cross-attention, and generation mechanics."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /transformers/
date: 2026-04-08
---

<style>
.interactive-demo {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 1.1rem;
  margin: 1.55rem 0;
  background: linear-gradient(180deg, var(--bg-secondary), var(--bg-primary));
  overflow: hidden;
}
.interactive-demo canvas,
.interactive-demo svg {
  display: block;
  width: 100%;
  max-width: 100%;
  border-radius: 10px;
}
.demo-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
}
.demo-controls label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
}
.demo-controls input[type="range"] {
  width: 165px;
  accent-color: var(--accent);
}
.demo-controls select,
.demo-controls input[type="text"] {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.4rem 0.58rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font: inherit;
}
.demo-controls button,
.step-buttons button {
  padding: 0.43rem 0.95rem;
  border: 1px solid var(--accent);
  border-radius: 8px;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 600;
  transition: background 0.15s, color 0.15s, transform 0.15s;
}
.demo-controls button:hover,
.step-buttons button:hover {
  background: var(--accent);
  color: var(--bg-primary);
  transform: translateY(-1px);
}
.demo-controls button.active,
.step-buttons button.active {
  background: var(--accent);
  color: var(--bg-primary);
}
.demo-controls button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.demo-value {
  min-width: 3.6rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  color: var(--text-secondary);
}
.demo-info {
  margin-top: 0.65rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.83rem;
  color: var(--text-secondary);
  line-height: 1.55;
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
  border-radius: 0 7px 7px 0;
  padding: 0.68rem 0.95rem;
  margin: 1rem 0;
  font-size: 0.84rem;
  color: var(--text-secondary);
}
.tr-grid-2,
.tr-grid-3 {
  display: grid;
  gap: 0.85rem;
}
.tr-grid-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.tr-grid-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.tr-panel {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-primary);
  padding: 0.78rem;
}
.tr-title {
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 0.45rem;
}
.token-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.7rem;
}
.token-chip {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.25rem 0.66rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.8rem;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.token-chip.active {
  border-color: var(--accent);
  background: rgba(37, 99, 235, 0.14);
  color: var(--accent);
}
.vector-bars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(36px, 1fr));
  align-items: end;
  gap: 0.42rem;
  min-height: 120px;
}
.vector-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.28rem;
}
.vector-track {
  width: 100%;
  height: 78px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.18), rgba(148, 163, 184, 0.05));
}
.vector-fill {
  position: absolute;
  left: 0;
  width: 100%;
  border-radius: 8px;
}
.vector-label,
.vector-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.71rem;
}
.vector-label { color: var(--text-secondary); }
.vector-value { color: var(--text-primary); }

.matrix-wrap {
  overflow-x: auto;
}
.matrix-table {
  border-collapse: collapse;
  width: 100%;
  min-width: 280px;
  table-layout: fixed;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
}
.matrix-table th,
.matrix-table td {
  border: 1px solid var(--border);
  text-align: center;
  padding: 0.34rem 0.2rem;
}
.matrix-table th {
  background: rgba(148, 163, 184, 0.15);
  color: var(--text-secondary);
  font-weight: 700;
}
.matrix-table td.hl {
  box-shadow: inset 0 0 0 2px var(--accent);
}
.matrix-table td.hrow {
  box-shadow: inset 3px 0 0 var(--accent), inset -3px 0 0 var(--accent);
}
.matrix-table td.hcol {
  box-shadow: inset 0 3px 0 var(--accent), inset 0 -3px 0 var(--accent);
}

.math-box {
  border: 1px dashed var(--border);
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  color: var(--text-primary);
  background: var(--bg-primary);
  line-height: 1.5;
}
.math-line {
  margin: 0.18rem 0;
}

.weight-list {
  display: grid;
  gap: 0.4rem;
}
.weight-row {
  display: grid;
  grid-template-columns: 84px 1fr 56px;
  align-items: center;
  gap: 0.45rem;
}
.weight-name,
.weight-value {
  font-size: 0.78rem;
  font-family: 'JetBrains Mono', monospace;
}
.weight-name { color: var(--text-secondary); }
.weight-value { color: var(--text-primary); text-align: right; }
.weight-bar {
  height: 11px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.2);
  position: relative;
  overflow: hidden;
}
.weight-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 999px;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.85rem;
}
.summary-table th,
.summary-table td {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  text-align: left;
  vertical-align: top;
}
.summary-table th {
  background: var(--bg-secondary);
  font-weight: 700;
}
.references {
  margin: 0.75rem 0 0;
  padding-left: 1.2rem;
}
.references li {
  margin: 0.55rem 0;
  line-height: 1.5;
}
.references a { word-break: break-word; }

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
  max-width: 330px;
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

@media (max-width: 860px) {
  .tr-grid-3 {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .tr-grid-2 {
    grid-template-columns: 1fr;
  }
  .demo-controls input[type="range"] {
    width: 122px;
  }
  .vector-bars {
    grid-template-columns: repeat(6, minmax(28px, 1fr));
  }
}
</style>

## The Transformer, But Actually Visual

This version is built around one goal: make the Transformer mechanism visible, especially the parts that usually remain abstract in text-only explainers.

You will see:

- Full architecture flow animation from tokens to output probabilities
- Q/K/V projection as explicit matrix multiplication (`X * Wq`, `X * Wk`, `X * Wv`)
- Attention score computation as explicit matrix multiplication (`QK^T`)
- Softmax weighting and output projection (`A * V`) at selected row and dimension
- Multi-head behavior differences on the same token sequence

The demos are inspired by the structure of the original Transformer paper<sup class="cite"><a class="cite-ref" href="#ref-1" data-cite-preview="Vaswani et al. introduced the encoder-decoder Transformer and scaled dot-product attention in 2017.">1</a></sup> and visualization-first explainers from Jay Alammar, 3Blue1Brown, and Transformer Explainer.<sup class="cite"><a class="cite-ref" href="#ref-2" data-cite-preview="The Illustrated Transformer popularized the high-level and matrix-level decomposition of self-attention and multi-head attention.">2</a></sup><sup class="cite"><a class="cite-ref" href="#ref-3" data-cite-preview="Transformer Explainer demonstrates layered, interactive views of embedding, attention, and generation in one UI.">3</a></sup><sup class="cite"><a class="cite-ref" href="#ref-4" data-cite-preview="3Blue1Brown explains GPT mechanics with visual emphasis on matrix operations, token interactions, and next-token probabilities.">4</a></sup>

---

## 1. Why Transformers Matter

Transformers replaced recurrence with attention-based token interaction. Instead of carrying a single hidden state through time, each token builds its own context from all relevant tokens in the sequence.

That gives three practical advantages:

- Better parallelism during training
- Better direct access to long-range dependencies
- More flexible context routing (different heads can capture different relations)

The key mechanism is not magic. It is matrix multiplication plus normalization.

---

## 2. The Big Picture Architecture

The original Transformer is encoder-decoder. Watch the full data flow below.

<div class="interactive-demo" id="demo-arch-flow">
  <div class="demo-controls">
    <button type="button" id="arch-play">Play</button>
    <button type="button" id="arch-step">Step</button>
    <button type="button" id="arch-reset">Reset</button>
    <label>Speed
      <input type="range" id="arch-speed" min="1" max="5" step="1" value="3">
      <span class="demo-value" id="arch-speed-val">3x</span>
    </label>
  </div>
  <canvas id="arch-canvas" width="920" height="360"></canvas>
  <div class="demo-info" id="arch-info">Press Play to animate token flow through embedding, QKV projections, attention, feed-forward, decoder masking, cross-attention, and output probabilities.</div>
</div>
<div class="demo-caption">Architecture flow board: encoder-decoder pipeline with animated data movement.</div>

---

## 3. Tokens, Embeddings, and Positional Encoding

The model never receives raw words. It receives vectors.

- Token ids select rows from an embedding matrix
- Positional vectors are added so order is recoverable
- The summed vector becomes the input `X` to attention layers

<div class="interactive-demo" id="demo-embed">
  <div class="demo-controls">
    <label>Token <select id="emb-token"></select></label>
    <label>Position
      <input type="range" id="emb-pos" min="0" max="4" step="1" value="1">
      <span class="demo-value" id="emb-pos-val">1</span>
    </label>
    <label><input type="checkbox" id="emb-add-pos" checked> Add positional encoding</label>
  </div>
  <div class="token-row" id="emb-token-row"></div>
  <div class="tr-grid-3">
    <div class="tr-panel"><div class="tr-title">Token Embedding</div><div id="emb-bars-token" class="vector-bars"></div></div>
    <div class="tr-panel"><div class="tr-title">Positional Vector</div><div id="emb-bars-pos" class="vector-bars"></div></div>
    <div class="tr-panel"><div class="tr-title">Final Input X</div><div id="emb-bars-final" class="vector-bars"></div></div>
  </div>
  <div class="demo-info" id="emb-info">Final input is embedding + positional vector.</div>
</div>

---

## 4. Q, K, V Projection Studio (Matrix Multiplication)

This is the core you asked for: explicit Q/K/V projection math.

Given one token embedding row vector `x` and projection matrix `Wq`, one output component is:

$$q_j = \sum_d x_d \cdot W^Q_{d,j} + b^Q_j$$

Use the controls to select token, projection (`Q`, `K`, or `V`), and output dimension `j`. The demo highlights the exact column used in multiplication and shows term-by-term contribution.

<div class="interactive-demo" id="demo-qkv-proj">
  <div class="demo-controls">
    <label>Token <select id="qkv-token"></select></label>
    <label>Projection <select id="qkv-kind"><option value="q">Q</option><option value="k">K</option><option value="v">V</option></select></label>
    <label>Output dim j
      <input type="range" id="qkv-dim" min="0" max="3" step="1" value="1">
      <span class="demo-value" id="qkv-dim-val">1</span>
    </label>
  </div>
  <div class="token-row" id="qkv-token-row"></div>
  <div class="tr-grid-2">
    <div class="tr-panel">
      <div class="tr-title">Input Token Vector x</div>
      <div id="qkv-x-bars" class="vector-bars"></div>
      <div class="tr-title" style="margin-top:0.7rem;">Projected Vector</div>
      <div id="qkv-out-bars" class="vector-bars"></div>
    </div>
    <div class="tr-panel">
      <div class="tr-title">Projection Matrix W</div>
      <div id="qkv-matrix"></div>
      <div class="tr-title" style="margin-top:0.65rem;">Selected Cell Derivation</div>
      <div class="math-box" id="qkv-math"></div>
    </div>
  </div>
  <div class="demo-info" id="qkv-info">Select a different dimension to inspect a different column of the projection matrix.</div>
</div>

---
## 5. Scaled Dot-Product Attention Workbench

Now we compute attention end-to-end with visible matrix operations:

1. `S = QK^T`
2. `S_scaled = S / sqrt(d_k)`
3. Optional causal mask
4. `A = softmax(S_scaled)` row-wise
5. `O = AV`

Pick one score cell `(i, j)` and one output component `m`. The demo will show both dot products explicitly.

<div class="interactive-demo" id="demo-attn-matmul">
  <div class="demo-controls">
    <label>Query row i
      <input type="range" id="attn-i" min="0" max="4" step="1" value="2">
      <span class="demo-value" id="attn-i-val">2</span>
    </label>
    <label>Key row j
      <input type="range" id="attn-j" min="0" max="4" step="1" value="1">
      <span class="demo-value" id="attn-j-val">1</span>
    </label>
    <label>Output dim m
      <input type="range" id="attn-m" min="0" max="3" step="1" value="2">
      <span class="demo-value" id="attn-m-val">2</span>
    </label>
    <label><input type="checkbox" id="attn-mask"> Causal mask</label>
  </div>
  <div class="tr-grid-2">
    <div class="tr-panel"><div class="tr-title">Q Matrix</div><div id="attn-q"></div></div>
    <div class="tr-panel"><div class="tr-title">K Matrix</div><div id="attn-k"></div></div>
  </div>
  <div class="tr-grid-2" style="margin-top:0.85rem;">
    <div class="tr-panel"><div class="tr-title">Score Matrix S = QK^T (scaled + masked)</div><div id="attn-s"></div></div>
    <div class="tr-panel"><div class="tr-title">Attention Weights A = softmax(S)</div><div id="attn-a"></div></div>
  </div>
  <div class="tr-grid-2" style="margin-top:0.85rem;">
    <div class="tr-panel">
      <div class="tr-title">V Matrix</div>
      <div id="attn-v"></div>
      <div class="tr-title" style="margin-top:0.6rem;">Output O = A * V</div>
      <div id="attn-o"></div>
    </div>
    <div class="tr-panel">
      <div class="tr-title">Cell-Level Derivation</div>
      <div class="math-box" id="attn-math"></div>
    </div>
  </div>
  <div class="demo-info" id="attn-info">This view explicitly links the score dot product and the output dot product.</div>
</div>

<div class="demo-hint">Set `i=0` and enable causal mask. The first token should only attend to itself, so row 0 becomes almost one-hot.</div>

---

## 6. Multi-Head Attention Patterns

Different heads learn different routing patterns. The example below shows four heads over the same token sequence. Move the slider to inspect how one query token is treated by each head.

<div class="interactive-demo" id="demo-heads">
  <div class="demo-controls">
    <label>Query token index
      <input type="range" id="heads-row" min="0" max="5" step="1" value="2">
      <span class="demo-value" id="heads-row-val">2</span>
    </label>
  </div>
  <div class="token-row" id="heads-token-row"></div>
  <div class="tr-grid-2">
    <div class="tr-panel"><div class="tr-title">Head 1</div><div id="head-1"></div></div>
    <div class="tr-panel"><div class="tr-title">Head 2</div><div id="head-2"></div></div>
    <div class="tr-panel"><div class="tr-title">Head 3</div><div id="head-3"></div></div>
    <div class="tr-panel"><div class="tr-title">Head 4</div><div id="head-4"></div></div>
  </div>
  <div class="demo-info" id="heads-info">Heads can focus differently even when processing the same query token.</div>
</div>

---

## 7. The Encoder Block

Encoder block recipe:

- Multi-head self-attention
- Residual add
- Layer normalization
- Feed-forward (token-wise MLP)
- Residual add
- Layer normalization

The stepper below visualizes one token representation through this pipeline.

<div class="interactive-demo" id="demo-encoder-block">
  <div class="demo-controls step-buttons" id="enc-btns">
    <button class="active" type="button" data-step="0">Input</button>
    <button type="button" data-step="1">Self-Attn</button>
    <button type="button" data-step="2">Add + Norm</button>
    <button type="button" data-step="3">FFN</button>
    <button type="button" data-step="4">Add + Norm</button>
  </div>
  <div class="tr-grid-2">
    <div class="tr-panel"><div class="tr-title" id="enc-title">Input</div><div id="enc-bars" class="vector-bars"></div></div>
    <div class="tr-panel"><div class="tr-title">Explanation</div><div class="math-box" id="enc-text"></div></div>
  </div>
  <div class="demo-info" id="enc-info">Shape stays constant while representation meaning changes.</div>
</div>

---

## 8. The Decoder Block and Cross-Attention

Decoder block adds two critical ideas:

- Masked self-attention over target prefix
- Cross-attention where decoder queries encoder memory

<div class="interactive-demo" id="demo-decoder-cross">
  <div class="demo-controls step-buttons" id="dec-btns">
    <button class="active" type="button" data-step="0">Masked Self-Attn</button>
    <button type="button" data-step="1">Cross-Attn</button>
    <button type="button" data-step="2">FFN</button>
  </div>
  <div class="tr-grid-2">
    <div class="tr-panel"><div class="tr-title">Target Tokens (Masked)</div><div class="token-row" id="dec-target-row"></div><div id="dec-mask-mat"></div></div>
    <div class="tr-panel"><div class="tr-title">Source Memory Weights</div><div class="token-row" id="dec-source-row"></div><div id="dec-cross-weights" class="weight-list"></div></div>
  </div>
  <div class="tr-grid-2" style="margin-top:0.85rem;">
    <div class="tr-panel"><div class="tr-title" id="dec-stage-title">Masked Self-Attention Output</div><div id="dec-stage-bars" class="vector-bars"></div></div>
    <div class="tr-panel"><div class="tr-title">Interpretation</div><div class="math-box" id="dec-stage-text"></div></div>
  </div>
  <div class="demo-info" id="dec-info">Cross-attention is the bridge from target-side state to source-side information.</div>
</div>

---

## 9. Layer Stacking and Representation Evolution

Stacking many blocks gradually converts lexical vectors into context-rich vectors. Use the layer slider to inspect one token across depth.

<div class="interactive-demo" id="demo-layer-evolution">
  <div class="demo-controls">
    <label>Layer
      <input type="range" id="layers-l" min="0" max="5" step="1" value="0">
      <span class="demo-value" id="layers-l-val">0</span>
    </label>
    <label>Token <select id="layers-token"></select></label>
  </div>
  <div class="token-row" id="layers-token-row"></div>
  <div class="tr-grid-2">
    <div class="tr-panel"><div class="tr-title">Current Representation</div><div id="layers-bars" class="vector-bars"></div></div>
    <div class="tr-panel"><div class="tr-title">Layer Note</div><div class="math-box" id="layers-note"></div></div>
  </div>
  <div class="demo-info" id="layers-info">Same dimensionality, richer semantics as layers increase.</div>
</div>

---

## 10. Training vs Autoregressive Generation

Teacher forcing during training vs token-by-token decoding during inference.

<div class="interactive-demo" id="demo-generation">
  <div class="demo-controls">
    <button class="active" type="button" id="gen-train">Training</button>
    <button type="button" id="gen-infer">Inference</button>
    <button type="button" id="gen-next">Next</button>
    <button type="button" id="gen-reset">Reset</button>
  </div>
  <div class="tr-grid-2">
    <div class="tr-panel"><div class="tr-title" id="gen-left-title">Shifted Inputs</div><div class="math-box" id="gen-left"></div></div>
    <div class="tr-panel"><div class="tr-title" id="gen-right-title">Prediction Distribution</div><div id="gen-right"></div></div>
  </div>
  <div class="demo-info" id="gen-info">Training predicts all next tokens in parallel; inference predicts one token at a time.</div>
</div>

---

## 11. Decoder-Only LLMs (GPT Style)

GPT-style models keep the decoder stack and causal mask, and remove the separate encoder path. The core mechanics remain the same:

- embedding + positional information
- stacked masked attention + MLP blocks
- linear projection to logits
- softmax distribution over vocabulary

### Optional Tiny Live Model (Browser)

This optional section loads a tiny GPT model via Transformers.js only on demand.

<div class="interactive-demo" id="demo-live">
  <div class="demo-controls">
    <input id="live-prompt" type="text" value="Transformers are powerful because">
    <button type="button" id="live-load">Load Tiny Model</button>
    <button type="button" id="live-run" disabled>Generate</button>
  </div>
  <div class="demo-info" id="live-status">Model not loaded. This optional demo needs network and browser module support.</div>
  <div class="tr-panel"><div class="tr-title">Generated Text</div><pre class="math-box" id="live-out">Not loaded.</pre></div>
</div>

---

## 12. Complexity and Context Length

Attention score matrices scale as `n^2` per head. The visualization below shows how quickly pairwise interactions grow.

<div class="interactive-demo" id="demo-complexity">
  <canvas id="comp-canvas" width="700" height="290"></canvas>
  <div class="demo-controls">
    <label>Sequence length
      <input type="range" id="comp-n" min="4" max="160" step="4" value="40">
      <span class="demo-value" id="comp-n-val">40</span>
    </label>
    <label>Heads
      <input type="range" id="comp-h" min="1" max="16" step="1" value="8">
      <span class="demo-value" id="comp-h-val">8</span>
    </label>
  </div>
  <div class="demo-info" id="comp-info">Cost grows quadratically with context length.</div>
</div>

---

## 13. Summary

If you understand these visuals, you understand the core Transformer mechanism:

- `X -> Q/K/V` via learned projections
- `QK^T` for token compatibility
- scaling + masking + softmax for routing
- `A * V` for contextualized outputs
- repeated block stacking for richer representations

### Quick Cheat Sheet

<table class="summary-table">
  <thead><tr><th>Concept</th><th>What it computes</th><th>Why it matters</th></tr></thead>
  <tbody>
    <tr><td>Projection</td><td>`Q = XWq`, `K = XWk`, `V = XWv`</td><td>Creates query/key/value views of token states.</td></tr>
    <tr><td>Score matrix</td><td>`S = QK^T / sqrt(dk)`</td><td>Measures query-key compatibility across tokens.</td></tr>
    <tr><td>Causal mask</td><td>Upper-triangle suppression</td><td>Prevents future-token leakage in decoding.</td></tr>
    <tr><td>Attention weights</td><td>`A = softmax(S)`</td><td>Converts scores into normalized routing weights.</td></tr>
    <tr><td>Context output</td><td>`O = AV`</td><td>Mixes value vectors according to learned routing.</td></tr>
    <tr><td>Multi-head</td><td>Parallel attention subspaces</td><td>Captures different relation patterns simultaneously.</td></tr>
  </tbody>
</table>

## References

<ol class="references">
  <li id="ref-1">Vaswani et al. <em>Attention Is All You Need</em>. NeurIPS 2017. <a href="https://arxiv.org/abs/1706.03762">https://arxiv.org/abs/1706.03762</a></li>
  <li id="ref-2">Jay Alammar. <em>The Illustrated Transformer</em>. <a href="https://jalammar.github.io/illustrated-transformer/">https://jalammar.github.io/illustrated-transformer/</a></li>
  <li id="ref-3">Polo Club et al. <em>Transformer Explainer</em>. <a href="https://poloclub.github.io/transformer-explainer/">https://poloclub.github.io/transformer-explainer/</a></li>
  <li id="ref-4">3Blue1Brown. <em>What is GPT?</em>. <a href="https://www.3blue1brown.com/lessons/gpt">https://www.3blue1brown.com/lessons/gpt</a></li>
  <li id="ref-5">Hugging Face. <em>Transformers.js Docs</em>. <a href="https://huggingface.co/docs/transformers.js/index">https://huggingface.co/docs/transformers.js/index</a></li>
  <li id="ref-6">Ki-Seki. <em>Awesome Transformer Visualization</em>. <a href="https://github.com/Ki-Seki/Awesome-Transformer-Visualization">https://github.com/Ki-Seki/Awesome-Transformer-Visualization</a></li>
</ol>

<script>
window.TR = (function() {
  var listeners = [];
  var observerReady = false;

  function getColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      dark: dark,
      bg: dark ? '#1a1b26' : '#ffffff',
      bg2: dark ? '#21253a' : '#f8fafc',
      text: dark ? '#c0caf5' : '#1f2937',
      muted: dark ? '#7d89b0' : '#6b7280',
      border: dark ? '#3a4263' : '#d1d5db',
      grid: dark ? '#2b3355' : '#e5e7eb',
      accent: dark ? '#7aa2f7' : '#2563eb',
      accent2: dark ? '#73daca' : '#059669',
      accent3: dark ? '#e0af68' : '#d97706',
      accent4: dark ? '#bb9af7' : '#7c3aed',
      pos: dark ? '#9ece6a' : '#16a34a',
      neg: dark ? '#f7768e' : '#dc2626'
    };
  }

  function onThemeChange(cb) {
    listeners.push(cb);
    if (!observerReady) {
      var obs = new MutationObserver(function(ms) {
        for (var i = 0; i < ms.length; i++) {
          if (ms[i].attributeName === 'data-theme') {
            for (var j = 0; j < listeners.length; j++) listeners[j]();
          }
        }
      });
      obs.observe(document.documentElement, { attributes: true });
      observerReady = true;
    }
  }

  function round(v, d) {
    var p = Math.pow(10, d == null ? 3 : d);
    return Math.round(v * p) / p;
  }

  function dot(a, b) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  function addVec(a, b) {
    var out = [];
    for (var i = 0; i < a.length; i++) out.push(a[i] + b[i]);
    return out;
  }

  function softmax(arr) {
    var max = -Infinity;
    for (var i = 0; i < arr.length; i++) if (isFinite(arr[i]) && arr[i] > max) max = arr[i];
    var e = [];
    var sum = 0;
    for (i = 0; i < arr.length; i++) {
      if (!isFinite(arr[i])) e.push(0);
      else {
        var v = Math.exp(arr[i] - max);
        e.push(v);
        sum += v;
      }
    }
    if (sum === 0) return arr.map(function() { return 0; });
    return e.map(function(v) { return v / sum; });
  }

  function transpose(M) {
    var out = [];
    for (var c = 0; c < M[0].length; c++) {
      out[c] = [];
      for (var r = 0; r < M.length; r++) out[c][r] = M[r][c];
    }
    return out;
  }

  function matMul(A, B) {
    var out = [];
    for (var r = 0; r < A.length; r++) {
      out[r] = [];
      for (var c = 0; c < B[0].length; c++) {
        var s = 0;
        for (var k = 0; k < B.length; k++) s += A[r][k] * B[k][c];
        out[r][c] = s;
      }
    }
    return out;
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

  function renderTokenRow(el, tokens, active) {
    if (!el) return;
    var html = '';
    for (var i = 0; i < tokens.length; i++) {
      html += '<span class="token-chip' + (i === active ? ' active' : '') + '">' + tokens[i] + '</span>';
    }
    el.innerHTML = html;
  }

  function renderBars(el, values, accent) {
    if (!el) return;
    var colors = getColors();
    var maxAbs = 1e-6;
    for (var i = 0; i < values.length; i++) maxAbs = Math.max(maxAbs, Math.abs(values[i]));
    var html = '';
    for (i = 0; i < values.length; i++) {
      var v = values[i];
      var h = Math.max(4, Math.round(Math.abs(v) / maxAbs * 74));
      var y = v >= 0 ? (78 - h) : 38;
      var col = v >= 0 ? accent : colors.neg;
      html += '<div class="vector-col"><div class="vector-track"><div class="vector-fill" style="height:' + h + 'px; top:' + y + 'px; background:' + col + '; opacity:0.9;"></div></div><div class="vector-label">d' + i + '</div><div class="vector-value">' + round(v, 2).toFixed(2) + '</div></div>';
    }
    el.innerHTML = html;
  }

  function colorCell(v, min, max) {
    var c = getColors();
    if (!isFinite(v)) return c.grid;
    var span = Math.max(1e-6, Math.max(Math.abs(min), Math.abs(max)));
    var a = Math.abs(v) / span;
    if (v >= 0) return c.dark ? 'rgba(122,162,247,' + round(0.2 + a * 0.65, 3) + ')' : 'rgba(37,99,235,' + round(0.15 + a * 0.55, 3) + ')';
    return c.dark ? 'rgba(247,118,142,' + round(0.2 + a * 0.65, 3) + ')' : 'rgba(220,38,38,' + round(0.15 + a * 0.5, 3) + ')';
  }

  function renderMatrix(el, matrix, rowLabels, colLabels, opts) {
    if (!el) return;
    opts = opts || {};
    var min = Infinity, max = -Infinity;
    for (var r = 0; r < matrix.length; r++) {
      for (var c = 0; c < matrix[r].length; c++) {
        var v = matrix[r][c];
        if (isFinite(v)) {
          min = Math.min(min, v);
          max = Math.max(max, v);
        }
      }
    }
    if (!isFinite(min)) { min = -1; max = 1; }
    var digits = opts.digits == null ? 2 : opts.digits;
    var html = '<div class="matrix-wrap"><table class="matrix-table"><thead><tr><th></th>';
    for (c = 0; c < colLabels.length; c++) html += '<th>' + colLabels[c] + '</th>';
    html += '</tr></thead><tbody>';
    for (r = 0; r < matrix.length; r++) {
      html += '<tr><th>' + rowLabels[r] + '</th>';
      for (c = 0; c < matrix[r].length; c++) {
        var cls = [];
        if (opts.cell && opts.cell[0] === r && opts.cell[1] === c) cls.push('hl');
        if (opts.row === r) cls.push('hrow');
        if (opts.col === c) cls.push('hcol');
        var value = matrix[r][c];
        html += '<td class="' + cls.join(' ') + '" style="background:' + colorCell(value, min, max) + ';">' + (isFinite(value) ? round(value, digits).toFixed(digits) : '&minus;&infin;') + '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    el.innerHTML = html;
  }

  function renderWeightList(el, labels, values, accent) {
    if (!el) return;
    var html = '';
    for (var i = 0; i < labels.length; i++) {
      html += '<div class="weight-row"><div class="weight-name">' + labels[i] + '</div><div class="weight-bar"><div class="weight-fill" style="width:' + round(values[i] * 100, 2) + '%; background:' + accent + ';"></div></div><div class="weight-value">' + round(values[i], 3).toFixed(3) + '</div></div>';
    }
    el.innerHTML = html;
  }

  return {
    getColors: getColors,
    onThemeChange: onThemeChange,
    round: round,
    dot: dot,
    addVec: addVec,
    softmax: softmax,
    transpose: transpose,
    matMul: matMul,
    setupCanvas: setupCanvas,
    renderTokenRow: renderTokenRow,
    renderBars: renderBars,
    renderMatrix: renderMatrix,
    renderWeightList: renderWeightList
  };
})();

// Demo 1: Architecture flow animator
(function() {
  var canvas = document.getElementById('arch-canvas');
  if (!canvas) return;
  var ctx = TR.setupCanvas(canvas, 920, 360);
  var info = document.getElementById('arch-info');
  var speedSlider = document.getElementById('arch-speed');
  var speedVal = document.getElementById('arch-speed-val');
  var playBtn = document.getElementById('arch-play');
  var stepBtn = document.getElementById('arch-step');
  var resetBtn = document.getElementById('arch-reset');

  var nodes = {
    src: { x: 40, y: 58, w: 120, h: 44, label: 'Source Tokens' },
    emb: { x: 190, y: 54, w: 130, h: 52, label: 'Embed + Pos' },
    qkv: { x: 350, y: 54, w: 120, h: 52, label: 'Q K V' },
    attn: { x: 500, y: 50, w: 145, h: 60, label: 'Self-Attention' },
    ffn: { x: 680, y: 54, w: 120, h: 52, label: 'FFN' },
    mem: { x: 815, y: 58, w: 90, h: 44, label: 'Memory' },

    tgt: { x: 40, y: 248, w: 120, h: 44, label: 'Target Prefix' },
    temb: { x: 190, y: 244, w: 130, h: 52, label: 'Embed + Pos' },
    mask: { x: 350, y: 244, w: 140, h: 52, label: 'Masked Attn' },
    cross: { x: 520, y: 238, w: 140, h: 64, label: 'Cross-Attn' },
    dffn: { x: 690, y: 244, w: 112, h: 52, label: 'FFN' },
    out: { x: 820, y: 238, w: 90, h: 60, label: 'Logits' }
  };

  var stages = [
    { a: 'src', b: 'emb', text: 'Source tokens are embedded and position-aware.' },
    { a: 'emb', b: 'qkv', text: 'Encoder computes Q, K, V projections.' },
    { a: 'qkv', b: 'attn', text: 'Self-attention mixes token information.' },
    { a: 'attn', b: 'ffn', text: 'Feed-forward refines each token representation.' },
    { a: 'ffn', b: 'mem', text: 'Encoder outputs become decoder memory.' },
    { a: 'tgt', b: 'temb', text: 'Target prefix enters decoder embedding path.' },
    { a: 'temb', b: 'mask', text: 'Masked attention prevents future-token leakage.' },
    { a: 'mask', b: 'cross', text: 'Decoder state queries encoder memory via cross-attention.' },
    { a: 'mem', b: 'cross', text: 'Cross-attention reads source-side memory.' },
    { a: 'cross', b: 'dffn', text: 'Decoder FFN rewrites contextualized state.' },
    { a: 'dffn', b: 'out', text: 'Linear projection produces logits for next-token probabilities.' }
  ];

  var stageIndex = 0;
  var t = 0;
  var running = false;
  var lastTs = 0;

  function roundedRectPath(x, y, w, h, r) {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      return;
    }
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
  }

  function drawNode(n, active) {
    var c = TR.getColors();
    ctx.fillStyle = active ? (c.dark ? 'rgba(122,162,247,0.18)' : 'rgba(37,99,235,0.12)') : c.bg2;
    ctx.strokeStyle = active ? c.accent : c.border;
    ctx.lineWidth = active ? 2.3 : 1.5;
    roundedRectPath(n.x, n.y, n.w, n.h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(n.label, n.x + n.w / 2, n.y + n.h / 2 + 4);
  }

  function drawArrow(a, b, active) {
    var c = TR.getColors();
    var x1 = a.x + a.w;
    var y1 = a.y + a.h / 2;
    var x2 = b.x;
    var y2 = b.y + b.h / 2;
    ctx.strokeStyle = active ? c.accent : c.grid;
    ctx.lineWidth = active ? 2.5 : 1.4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    var ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 9 * Math.cos(ang - 0.35), y2 - 9 * Math.sin(ang - 0.35));
    ctx.lineTo(x2 - 9 * Math.cos(ang + 0.35), y2 - 9 * Math.sin(ang + 0.35));
    ctx.closePath();
    ctx.fillStyle = active ? c.accent : c.grid;
    ctx.fill();
  }

  function drawPacket(a, b, progress) {
    var c = TR.getColors();
    var x1 = a.x + a.w;
    var y1 = a.y + a.h / 2;
    var x2 = b.x;
    var y2 = b.y + b.h / 2;
    var x = x1 + (x2 - x1) * progress;
    var y = y1 + (y2 - y1) * progress;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = c.accent3;
    ctx.fill();
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function render() {
    var c = TR.getColors();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, 920, 360);
    ctx.fillStyle = c.muted;
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Encoder', 40, 34);
    ctx.fillText('Decoder', 40, 224);

    var activeStage = stages[stageIndex];
    for (var key in nodes) {
      var active = activeStage && (key === activeStage.a || key === activeStage.b);
      drawNode(nodes[key], active);
    }

    for (var i = 0; i < stages.length; i++) {
      var s = stages[i];
      drawArrow(nodes[s.a], nodes[s.b], i === stageIndex);
    }

    if (activeStage) drawPacket(nodes[activeStage.a], nodes[activeStage.b], t);
    info.textContent = activeStage ? activeStage.text : 'Press Play to animate the pipeline.';
  }

  function tick(ts) {
    if (!running) return;
    if (!lastTs) lastTs = ts;
    var dt = (ts - lastTs) / 1000;
    lastTs = ts;
    var speed = parseInt(speedSlider.value, 10);
    speedVal.textContent = speed + 'x';
    t += dt * (0.45 * speed);
    if (t >= 1) {
      t = 0;
      stageIndex = (stageIndex + 1) % stages.length;
    }
    render();
    requestAnimationFrame(tick);
  }

  playBtn.addEventListener('click', function() {
    running = !running;
    playBtn.textContent = running ? 'Pause' : 'Play';
    if (running) requestAnimationFrame(tick);
  });
  stepBtn.addEventListener('click', function() {
    running = false;
    playBtn.textContent = 'Play';
    stageIndex = (stageIndex + 1) % stages.length;
    t = 0;
    render();
  });
  resetBtn.addEventListener('click', function() {
    running = false;
    playBtn.textContent = 'Play';
    stageIndex = 0;
    t = 0;
    render();
  });
  speedSlider.addEventListener('input', function() { speedVal.textContent = speedSlider.value + 'x'; render(); });
  TR.onThemeChange(render);
  render();
})();

// Demo 2: Embedding
(function() {
  var tokens = ['Data', 'models', 'learn', 'context', '.'];
  var emb = {
    Data:    [0.66, -0.22, 0.14, 0.58, -0.11, 0.23],
    models:  [0.18, 0.62, 0.74, -0.08, 0.20, 0.51],
    learn:   [0.84, 0.46, 0.31, 0.10, 0.65, -0.18],
    context: [0.22, 0.70, 0.82, 0.36, -0.10, 0.77],
    '.':     [-0.10, 0.16, -0.04, 0.22, -0.06, 0.12]
  };
  var pos = [
    [0.00, 1.00, 0.00, 1.00, 0.00, 1.00],
    [0.84, 0.54, 0.05, 1.00, 0.01, 1.00],
    [0.91, -0.42, 0.10, 0.99, 0.02, 1.00],
    [0.14, -0.99, 0.15, 0.99, 0.03, 1.00],
    [-0.76, -0.65, 0.20, 0.98, 0.04, 0.99]
  ];

  var tokSel = document.getElementById('emb-token');
  var posSl = document.getElementById('emb-pos');
  var posVal = document.getElementById('emb-pos-val');
  var add = document.getElementById('emb-add-pos');
  if (!tokSel) return;
  tokSel.innerHTML = tokens.map(function(t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
  tokSel.value = 'learn';

  function render() {
    var c = TR.getColors();
    var tok = tokSel.value;
    var p = parseInt(posSl.value, 10);
    var e = emb[tok];
    var pv = pos[p];
    var fv = add.checked ? TR.addVec(e, pv) : e.slice();
    TR.renderTokenRow(document.getElementById('emb-token-row'), tokens, tokens.indexOf(tok));
    TR.renderBars(document.getElementById('emb-bars-token'), e, c.accent);
    TR.renderBars(document.getElementById('emb-bars-pos'), pv, c.accent2);
    TR.renderBars(document.getElementById('emb-bars-final'), fv, c.accent3);
    posVal.textContent = String(p);
    document.getElementById('emb-info').textContent = 'Token "' + tok + '" at position ' + p + ': X = embedding ' + (add.checked ? '+ position.' : '(position disabled).');
  }

  tokSel.addEventListener('change', render);
  posSl.addEventListener('input', render);
  add.addEventListener('change', render);
  TR.onThemeChange(render);
  render();
})();
// Demo 3: QKV projection lab
(function() {
  var tokens = ['Data', 'models', 'learn', 'context', '.'];
  var X = {
    Data:    [0.66, -0.22, 0.14, 0.58, -0.11, 0.23],
    models:  [0.18, 0.62, 0.74, -0.08, 0.20, 0.51],
    learn:   [0.84, 0.46, 0.31, 0.10, 0.65, -0.18],
    context: [0.22, 0.70, 0.82, 0.36, -0.10, 0.77],
    '.':     [-0.10, 0.16, -0.04, 0.22, -0.06, 0.12]
  };
  var Wq = [
    [0.70, 0.10, 0.24, -0.08],
    [-0.18, 0.62, 0.08, 0.12],
    [0.12, 0.66, 0.54, 0.04],
    [0.52, -0.12, 0.22, 0.44],
    [-0.04, 0.20, 0.68, 0.18],
    [0.24, 0.40, -0.14, 0.58]
  ];
  var Wk = [
    [0.64, 0.05, 0.20, -0.10],
    [-0.12, 0.58, 0.06, 0.18],
    [0.10, 0.71, 0.50, 0.07],
    [0.49, -0.08, 0.16, 0.42],
    [0.02, 0.26, 0.63, 0.24],
    [0.20, 0.35, -0.10, 0.55]
  ];
  var Wv = [
    [0.58, 0.22, 0.18, 0.04],
    [0.08, 0.68, 0.12, 0.20],
    [0.21, 0.56, 0.60, 0.10],
    [0.42, 0.06, 0.18, 0.52],
    [0.10, 0.24, 0.72, 0.28],
    [0.16, 0.44, 0.02, 0.62]
  ];
  var bq = [0.01, -0.02, 0.03, 0.00];
  var bk = [0.00, -0.01, 0.02, 0.01];
  var bv = [0.02, 0.00, -0.01, 0.03];

  var tSel = document.getElementById('qkv-token');
  var kindSel = document.getElementById('qkv-kind');
  var dimSl = document.getElementById('qkv-dim');
  var dimVal = document.getElementById('qkv-dim-val');
  if (!tSel) return;
  tSel.innerHTML = tokens.map(function(t) { return '<option value="' + t + '">' + t + '</option>'; }).join('');
  tSel.value = 'learn';

  function getMatrix(kind) { return kind === 'q' ? Wq : kind === 'k' ? Wk : Wv; }
  function getBias(kind) { return kind === 'q' ? bq : kind === 'k' ? bk : bv; }
  function kindName(kind) { return kind === 'q' ? 'Q' : kind === 'k' ? 'K' : 'V'; }

  function matVec(vec, M, b) {
    var out = [];
    for (var c = 0; c < M[0].length; c++) {
      var s = b[c];
      for (var r = 0; r < M.length; r++) s += vec[r] * M[r][c];
      out[c] = s;
    }
    return out;
  }

  function render() {
    var c = TR.getColors();
    var tok = tSel.value;
    var kind = kindSel.value;
    var dim = parseInt(dimSl.value, 10);
    dimVal.textContent = String(dim);
    var x = X[tok];
    var M = getMatrix(kind);
    var b = getBias(kind);
    var out = matVec(x, M, b);

    TR.renderTokenRow(document.getElementById('qkv-token-row'), tokens, tokens.indexOf(tok));
    TR.renderBars(document.getElementById('qkv-x-bars'), x, c.accent);
    TR.renderBars(document.getElementById('qkv-out-bars'), out, c.accent2);

    var rows = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5'];
    var cols = ['0', '1', '2', '3'];
    TR.renderMatrix(document.getElementById('qkv-matrix'), M, rows, cols, { col: dim, digits: 2 });

    var parts = [];
    var sum = b[dim];
    for (var r = 0; r < M.length; r++) {
      var term = x[r] * M[r][dim];
      sum += term;
      parts.push('x[' + r + ']*W[' + r + ',' + dim + '] = ' + TR.round(x[r], 3).toFixed(3) + '*' + TR.round(M[r][dim], 3).toFixed(3) + ' = ' + TR.round(term, 3).toFixed(3));
    }
    parts.push('bias = ' + TR.round(b[dim], 3).toFixed(3));
    parts.push(kindName(kind) + '[' + dim + '] = ' + TR.round(sum, 3).toFixed(3));
    document.getElementById('qkv-math').innerHTML = parts.map(function(line) { return '<div class="math-line">' + line + '</div>'; }).join('');

    document.getElementById('qkv-info').textContent = kindName(kind) + ' projection for token "' + tok + '": each output component is a dot product between token vector and one matrix column.';
  }

  tSel.addEventListener('change', render);
  kindSel.addEventListener('change', render);
  dimSl.addEventListener('input', render);
  TR.onThemeChange(render);
  render();
})();

// Demo 4: Attention matrix multiplication workbench
(function() {
  var tokens = ['Data', 'visual', 'models', 'learn', 'patterns'];
  var Q = [
    [0.80, 0.18, 0.20, 0.06],
    [0.62, 0.54, 0.26, 0.10],
    [0.50, 0.78, 0.44, 0.14],
    [0.24, 0.92, 0.86, 0.22],
    [0.16, 0.70, 1.02, 0.34]
  ];
  var K = [
    [0.78, 0.12, 0.22, 0.04],
    [0.58, 0.50, 0.22, 0.12],
    [0.44, 0.74, 0.42, 0.16],
    [0.22, 0.88, 0.80, 0.24],
    [0.12, 0.68, 0.96, 0.36]
  ];
  var V = [
    [0.86, 0.18, 0.12, 0.05],
    [0.68, 0.60, 0.20, 0.10],
    [0.52, 0.74, 0.36, 0.15],
    [0.24, 0.82, 0.88, 0.28],
    [0.16, 0.62, 1.00, 0.42]
  ];

  var iSl = document.getElementById('attn-i');
  var jSl = document.getElementById('attn-j');
  var mSl = document.getElementById('attn-m');
  var mask = document.getElementById('attn-mask');
  if (!iSl) return;

  function render() {
    var i = parseInt(iSl.value, 10);
    var j = parseInt(jSl.value, 10);
    var m = parseInt(mSl.value, 10);
    document.getElementById('attn-i-val').textContent = String(i);
    document.getElementById('attn-j-val').textContent = String(j);
    document.getElementById('attn-m-val').textContent = String(m);

    var S = TR.matMul(Q, TR.transpose(K));
    var scale = Math.sqrt(Q[0].length);
    var Sc = S.map(function(row, r) {
      return row.map(function(v, c) {
        var x = v / scale;
        if (mask.checked && c > r) return -Infinity;
        return x;
      });
    });
    var A = Sc.map(function(row) { return TR.softmax(row); });
    var O = TR.matMul(A, V);

    TR.renderMatrix(document.getElementById('attn-q'), Q, tokens, ['d0', 'd1', 'd2', 'd3'], { row: i, digits: 2 });
    TR.renderMatrix(document.getElementById('attn-k'), K, tokens, ['d0', 'd1', 'd2', 'd3'], { row: j, digits: 2 });
    TR.renderMatrix(document.getElementById('attn-s'), Sc, tokens, tokens, { cell: [i, j], row: i, col: j, digits: 2 });
    TR.renderMatrix(document.getElementById('attn-a'), A, tokens, tokens, { row: i, digits: 2 });
    TR.renderMatrix(document.getElementById('attn-v'), V, tokens, ['m0', 'm1', 'm2', 'm3'], { col: m, digits: 2 });
    TR.renderMatrix(document.getElementById('attn-o'), O, tokens, ['m0', 'm1', 'm2', 'm3'], { cell: [i, m], row: i, col: m, digits: 2 });

    var scoreTerms = [];
    var rawScore = 0;
    for (var d = 0; d < 4; d++) {
      var t = Q[i][d] * K[j][d];
      rawScore += t;
      scoreTerms.push('q[' + i + ',' + d + ']*k[' + j + ',' + d + '] = ' + TR.round(Q[i][d], 3).toFixed(3) + '*' + TR.round(K[j][d], 3).toFixed(3) + ' = ' + TR.round(t, 3).toFixed(3));
    }
    var scaled = rawScore / scale;

    var outTerms = [];
    var out = 0;
    for (var r = 0; r < tokens.length; r++) {
      var tt = A[i][r] * V[r][m];
      out += tt;
      outTerms.push('A[' + i + ',' + r + ']*V[' + r + ',' + m + '] = ' + TR.round(A[i][r], 3).toFixed(3) + '*' + TR.round(V[r][m], 3).toFixed(3) + ' = ' + TR.round(tt, 3).toFixed(3));
    }

    var lines = [];
    lines.push('<div class="math-line"><strong>Score cell S[' + i + ',' + j + ']</strong></div>');
    for (var s = 0; s < scoreTerms.length; s++) lines.push('<div class="math-line">' + scoreTerms[s] + '</div>');
    lines.push('<div class="math-line">raw = ' + TR.round(rawScore, 3).toFixed(3) + '</div>');
    lines.push('<div class="math-line">scaled = raw / sqrt(4) = ' + TR.round(scaled, 3).toFixed(3) + (mask.checked && j > i ? ' (masked to -inf)' : '') + '</div>');
    lines.push('<div class="math-line" style="margin-top:0.45rem;"><strong>Output cell O[' + i + ',' + m + ']</strong></div>');
    for (s = 0; s < outTerms.length; s++) lines.push('<div class="math-line">' + outTerms[s] + '</div>');
    lines.push('<div class="math-line">O[' + i + ',' + m + '] = ' + TR.round(out, 3).toFixed(3) + '</div>');
    document.getElementById('attn-math').innerHTML = lines.join('');

    document.getElementById('attn-info').textContent = 'Selected score S[' + i + ',' + j + '] and output O[' + i + ',' + m + '] are both explicit dot products. This is the core attention computation.';
  }

  iSl.addEventListener('input', render);
  jSl.addEventListener('input', render);
  mSl.addEventListener('input', render);
  mask.addEventListener('change', render);
  TR.onThemeChange(render);
  render();
})();
// Demo 5: Multi-head
(function() {
  var tokens = ['The', 'animal', 'did', "n't", 'cross', 'street'];
  var heads = [
    [[0.60,0.20,0.08,0.04,0.05,0.03],[0.22,0.52,0.12,0.06,0.05,0.03],[0.08,0.18,0.52,0.12,0.07,0.03],[0.05,0.11,0.26,0.36,0.16,0.06],[0.04,0.07,0.10,0.14,0.45,0.20],[0.03,0.05,0.06,0.10,0.22,0.54]],
    [[0.22,0.35,0.10,0.05,0.22,0.06],[0.14,0.40,0.10,0.05,0.24,0.07],[0.10,0.36,0.16,0.08,0.22,0.08],[0.08,0.30,0.18,0.12,0.22,0.10],[0.06,0.28,0.10,0.07,0.31,0.18],[0.06,0.24,0.09,0.07,0.26,0.28]],
    [[0.30,0.10,0.08,0.08,0.10,0.34],[0.16,0.18,0.10,0.08,0.12,0.36],[0.08,0.14,0.16,0.12,0.16,0.34],[0.06,0.11,0.14,0.16,0.18,0.35],[0.04,0.09,0.10,0.12,0.19,0.46],[0.04,0.08,0.09,0.10,0.16,0.53]],
    [[0.50,0.14,0.08,0.07,0.12,0.09],[0.20,0.44,0.10,0.06,0.10,0.10],[0.12,0.20,0.42,0.10,0.08,0.08],[0.10,0.14,0.18,0.36,0.12,0.10],[0.06,0.10,0.12,0.15,0.38,0.19],[0.06,0.08,0.10,0.12,0.18,0.46]]
  ];
  var rowSl = document.getElementById('heads-row');
  if (!rowSl) return;
  function render() {
    var r = parseInt(rowSl.value, 10);
    document.getElementById('heads-row-val').textContent = String(r);
    TR.renderTokenRow(document.getElementById('heads-token-row'), tokens, r);
    TR.renderMatrix(document.getElementById('head-1'), heads[0], tokens, tokens, { row: r, digits: 2 });
    TR.renderMatrix(document.getElementById('head-2'), heads[1], tokens, tokens, { row: r, digits: 2 });
    TR.renderMatrix(document.getElementById('head-3'), heads[2], tokens, tokens, { row: r, digits: 2 });
    TR.renderMatrix(document.getElementById('head-4'), heads[3], tokens, tokens, { row: r, digits: 2 });
    document.getElementById('heads-info').textContent = 'Query token "' + tokens[r] + '": heads distribute attention differently, which is why multi-head attention is richer than single-head routing.';
  }
  rowSl.addEventListener('input', render);
  TR.onThemeChange(render);
  render();
})();

// Demo 6: Encoder block stepper
(function() {
  var x = [0.42,-0.10,0.58,0.30,-0.08,0.34];
  var a = [0.20,0.52,0.18,-0.04,0.12,0.22];
  var n1 = [0.66,0.34,0.74,0.18,0.12,0.56];
  var ff = [0.26,0.16,0.42,0.08,0.22,0.36];
  var n2 = [0.82,0.50,0.98,0.26,0.26,0.80];
  var stages = [
    { title: 'Input Token State', v: x, t: 'Input vector from previous layer or embedding stage.' },
    { title: 'Self-Attention Output', v: a, t: 'Attention routes information from other tokens into this token.' },
    { title: 'Residual + LayerNorm', v: n1, t: 'Residual path preserves original signal; normalization stabilizes scale.' },
    { title: 'Feed-Forward Output', v: ff, t: 'Position-wise MLP applies nonlinear feature transformation.' },
    { title: 'Final Residual + Norm', v: n2, t: 'Block output keeps shape but carries richer context.' }
  ];
  var btns = Array.prototype.slice.call(document.querySelectorAll('#enc-btns button'));
  if (!btns.length) return;
  function render(idx) {
    var c = TR.getColors();
    document.getElementById('enc-title').textContent = stages[idx].title;
    TR.renderBars(document.getElementById('enc-bars'), stages[idx].v, c.accent2);
    document.getElementById('enc-text').textContent = stages[idx].t;
    document.getElementById('enc-info').textContent = 'Step ' + (idx + 1) + ' of ' + stages.length + ': ' + stages[idx].title;
  }
  btns.forEach(function(b) {
    b.addEventListener('click', function() {
      btns.forEach(function(x) { x.classList.remove('active'); });
      b.classList.add('active');
      render(parseInt(b.getAttribute('data-step'), 10));
    });
  });
  TR.onThemeChange(function() {
    var act = document.querySelector('#enc-btns button.active');
    render(act ? parseInt(act.getAttribute('data-step'), 10) : 0);
  });
  render(0);
})();

// Demo 7: Decoder + cross attention
(function() {
  var tTokens = ['<bos>', 'The', 'animal'];
  var sTokens = ['Le', 'animal', 'fatigue'];
  var masked = [[1,0,0],[0.38,0.62,0],[0.14,0.28,0.58]];
  var cross = [[0.15,0.72,0.13],[0.12,0.75,0.13],[0.10,0.22,0.68]];
  var stages = [
    { title: 'Masked Self-Attention Output', v: [0.14,0.56,0.20,-0.02,0.28,0.12], t: 'Target token can only read the prefix due to causal mask.' },
    { title: 'Cross-Attention Output', v: [0.34,0.72,0.18,0.10,0.50,0.24], t: 'Decoder query reads encoder memory and aligns source meaning.' },
    { title: 'Feed-Forward Output', v: [0.58,0.84,0.22,0.18,0.70,0.38], t: 'MLP reshapes aligned state before logits projection.' }
  ];
  var btns = Array.prototype.slice.call(document.querySelectorAll('#dec-btns button'));
  if (!btns.length) return;
  TR.renderTokenRow(document.getElementById('dec-target-row'), tTokens, 2);
  TR.renderTokenRow(document.getElementById('dec-source-row'), sTokens, 2);
  function render(idx) {
    var c = TR.getColors();
    TR.renderMatrix(document.getElementById('dec-mask-mat'), masked, tTokens, tTokens, { row: 2, digits: 2 });
    TR.renderWeightList(document.getElementById('dec-cross-weights'), sTokens, cross[2], c.accent);
    document.getElementById('dec-stage-title').textContent = stages[idx].title;
    TR.renderBars(document.getElementById('dec-stage-bars'), stages[idx].v, c.accent3);
    document.getElementById('dec-stage-text').textContent = stages[idx].t;
    document.getElementById('dec-info').textContent = 'Decoder stage: ' + stages[idx].title;
  }
  btns.forEach(function(b) {
    b.addEventListener('click', function() {
      btns.forEach(function(x) { x.classList.remove('active'); });
      b.classList.add('active');
      render(parseInt(b.getAttribute('data-step'), 10));
    });
  });
  TR.onThemeChange(function() {
    var act = document.querySelector('#dec-btns button.active');
    render(act ? parseInt(act.getAttribute('data-step'), 10) : 0);
  });
  render(0);
})();

// Demo 8: Layer evolution
(function() {
  var tokens = ['The', 'animal', 'did', "n't", 'cross'];
  var layers = [
    { note: 'Mostly lexical signal.', vecs: [[0.12,-0.22,0.08,0.30,-0.10,0.06],[0.80,0.26,-0.06,0.14,0.52,-0.12],[0.22,0.70,0.54,-0.10,0.12,0.34],[0.10,0.18,0.20,0.32,0.06,0.12],[0.18,0.46,0.82,0.60,-0.06,0.56]] },
    { note: 'Syntax starts to emerge.', vecs: [[0.16,-0.18,0.10,0.36,-0.06,0.10],[0.88,0.34,0.02,0.20,0.60,-0.02],[0.30,0.82,0.66,-0.04,0.20,0.46],[0.14,0.24,0.28,0.40,0.12,0.18],[0.24,0.54,0.92,0.72,0.02,0.66]] },
    { note: 'Longer-range links become stronger.', vecs: [[0.20,-0.10,0.14,0.42,0.00,0.14],[0.96,0.42,0.12,0.26,0.68,0.08],[0.42,0.94,0.82,0.04,0.32,0.62],[0.20,0.30,0.36,0.50,0.20,0.26],[0.30,0.62,1.02,0.84,0.10,0.76]] },
    { note: 'Context-heavy representation.', vecs: [[0.24,-0.02,0.18,0.48,0.08,0.18],[1.04,0.52,0.18,0.30,0.76,0.16],[0.54,1.00,0.92,0.10,0.46,0.74],[0.24,0.34,0.42,0.58,0.26,0.32],[0.36,0.72,1.10,0.96,0.18,0.86]] },
    { note: 'Task-level features are prominent.', vecs: [[0.28,0.04,0.22,0.52,0.14,0.22],[1.10,0.60,0.24,0.36,0.82,0.22],[0.64,1.06,0.98,0.16,0.54,0.84],[0.30,0.40,0.50,0.66,0.32,0.40],[0.42,0.78,1.16,1.04,0.26,0.94]] },
    { note: 'Final layer before logits in this toy view.', vecs: [[0.30,0.08,0.24,0.56,0.18,0.24],[1.14,0.66,0.28,0.40,0.88,0.26],[0.70,1.10,1.02,0.20,0.60,0.90],[0.34,0.46,0.56,0.72,0.38,0.46],[0.46,0.84,1.22,1.12,0.30,1.00]] }
  ];
  var lSl = document.getElementById('layers-l');
  var tSel = document.getElementById('layers-token');
  if (!lSl) return;
  tSel.innerHTML = tokens.map(function(t, i) { return '<option value="' + i + '">' + t + '</option>'; }).join('');
  tSel.value = '1';
  function render() {
    var c = TR.getColors();
    var l = parseInt(lSl.value, 10);
    var t = parseInt(tSel.value, 10);
    document.getElementById('layers-l-val').textContent = String(l);
    TR.renderTokenRow(document.getElementById('layers-token-row'), tokens, t);
    TR.renderBars(document.getElementById('layers-bars'), layers[l].vecs[t], c.accent4);
    document.getElementById('layers-note').textContent = layers[l].note + '\n\nToken: "' + tokens[t] + '"';
    document.getElementById('layers-info').textContent = 'Layer ' + l + ', token "' + tokens[t] + '".';
  }
  lSl.addEventListener('input', render);
  tSel.addEventListener('change', render);
  TR.onThemeChange(render);
  render();
})();
// Demo 9: Generation mode
(function() {
  var trainBtn = document.getElementById('gen-train');
  var inferBtn = document.getElementById('gen-infer');
  var nextBtn = document.getElementById('gen-next');
  var resetBtn = document.getElementById('gen-reset');
  if (!trainBtn) return;

  var mode = 'train';
  var step = 0;
  var infer = [
    { ctx: ['The', 'animal'], logits: { was: 2.8, is: 1.2, felt: 0.9, '<eos>': -0.3 }, pick: 'was' },
    { ctx: ['The', 'animal', 'was'], logits: { tired: 3.1, calm: 1.4, fast: 0.6, '<eos>': 0.3 }, pick: 'tired' },
    { ctx: ['The', 'animal', 'was', 'tired'], logits: { '.': 2.6, and: 1.1, '<eos>': 1.8, because: 0.7 }, pick: '.' }
  ];

  function logitsToDist(logits) {
    var keys = Object.keys(logits);
    var values = keys.map(function(k) { return logits[k]; });
    return { keys: keys, probs: TR.softmax(values) };
  }

  function renderTrain() {
    var c = TR.getColors();
    document.getElementById('gen-left-title').textContent = 'Shifted Decoder Inputs';
    document.getElementById('gen-right-title').textContent = 'Parallel Target Predictions';
    document.getElementById('gen-left').textContent = '[<bos>, The, animal, was]\n\nAll positions are supervised in parallel during training.';
    var labels = ['pos0->The','pos1->animal','pos2->was','pos3->tired'];
    var vals = [1,1,1,1];
    TR.renderWeightList(document.getElementById('gen-right'), labels, vals, c.accent2);
    document.getElementById('gen-info').textContent = 'Teacher forcing mode: next-token targets are known for all positions.';
    nextBtn.disabled = true;
  }

  function renderInfer() {
    var cur = infer[step];
    var dist = logitsToDist(cur.logits);
    document.getElementById('gen-left-title').textContent = 'Current Prefix';
    document.getElementById('gen-right-title').textContent = 'Next-Token Distribution';
    document.getElementById('gen-left').textContent = '[' + cur.ctx.join(' ') + ']\n\nPick: ' + cur.pick + '\nThen append and decode again.';
    TR.renderWeightList(document.getElementById('gen-right'), dist.keys, dist.probs, TR.getColors().accent);
    document.getElementById('gen-info').textContent = 'Inference step ' + (step + 1) + ': decoding is sequential.';
    nextBtn.disabled = false;
  }

  function render() {
    trainBtn.classList.toggle('active', mode === 'train');
    inferBtn.classList.toggle('active', mode === 'infer');
    if (mode === 'train') renderTrain(); else renderInfer();
  }

  trainBtn.addEventListener('click', function() { mode = 'train'; render(); });
  inferBtn.addEventListener('click', function() { mode = 'infer'; render(); });
  nextBtn.addEventListener('click', function() { if (mode !== 'infer') return; step = (step + 1) % infer.length; render(); });
  resetBtn.addEventListener('click', function() { step = 0; render(); });
  TR.onThemeChange(render);
  render();
})();

// Demo 10: Optional live model
(function() {
  var loadBtn = document.getElementById('live-load');
  var runBtn = document.getElementById('live-run');
  var status = document.getElementById('live-status');
  var out = document.getElementById('live-out');
  var prompt = document.getElementById('live-prompt');
  if (!loadBtn) return;

  var pipe = null;
  var loading = false;

  async function load() {
    if (pipe || loading) return;
    loading = true;
    loadBtn.disabled = true;
    status.textContent = 'Loading Transformers.js and tiny GPT model...';
    out.textContent = 'Loading...';
    try {
      var hf = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
      if (hf.env) hf.env.allowLocalModels = false;
      pipe = await hf.pipeline('text-generation', 'Xenova/distilgpt2');
      runBtn.disabled = false;
      out.textContent = 'Model ready.';
      status.textContent = 'Loaded. This is optional and independent from the hand-crafted visual demos above.';
    } catch (e) {
      status.textContent = 'Optional live demo failed to load: ' + (e && e.message ? e.message : 'unknown error');
      out.textContent = 'Could not load model.';
      loadBtn.disabled = false;
    } finally {
      loading = false;
    }
  }

  async function run() {
    if (!pipe) return;
    runBtn.disabled = true;
    out.textContent = 'Generating...';
    status.textContent = 'Generating in browser...';
    try {
      var res = await pipe(prompt.value || 'Transformers are powerful because', { max_new_tokens: 20, do_sample: false });
      out.textContent = res && res[0] && res[0].generated_text ? res[0].generated_text : JSON.stringify(res, null, 2);
      status.textContent = 'Generation complete.';
    } catch (e) {
      out.textContent = 'Generation failed.';
      status.textContent = 'Generation failed: ' + (e && e.message ? e.message : 'unknown error');
    } finally {
      runBtn.disabled = !pipe;
    }
  }

  loadBtn.addEventListener('click', load);
  runBtn.addEventListener('click', run);
})();

// Demo 11: Complexity
(function() {
  var canvas = document.getElementById('comp-canvas');
  var nSl = document.getElementById('comp-n');
  var hSl = document.getElementById('comp-h');
  if (!canvas) return;
  var ctx = TR.setupCanvas(canvas, 700, 290);

  function draw() {
    var c = TR.getColors();
    var n = parseInt(nSl.value, 10);
    var h = parseInt(hSl.value, 10);
    document.getElementById('comp-n-val').textContent = String(n);
    document.getElementById('comp-h-val').textContent = String(h);

    ctx.clearRect(0, 0, 700, 290);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, 700, 290);

    ctx.fillStyle = c.text;
    ctx.font = '15px sans-serif';
    ctx.fillText('Attention cost grows as O(n^2)', 20, 26);

    var sample = Math.max(4, Math.min(24, Math.round(n / 5)));
    var cell = Math.min(8, Math.max(3, 130 / sample));
    var ox = 26;
    var oy = 50;
    var alpha = Math.min(0.85, 0.16 + n / 190);
    for (var r = 0; r < sample; r++) {
      for (var cc = 0; cc < sample; cc++) {
        ctx.fillStyle = c.dark ? 'rgba(122,162,247,' + alpha + ')' : 'rgba(37,99,235,' + alpha + ')';
        ctx.fillRect(ox + cc * cell, oy + r * cell, cell - 1, cell - 1);
      }
    }
    ctx.strokeStyle = c.border;
    ctx.strokeRect(ox - 1, oy - 1, sample * cell + 2, sample * cell + 2);

    var bx = 290;
    var by = 52;
    var bw = 390;
    var bh = 160;
    ctx.fillStyle = c.bg2;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = c.border;
    ctx.strokeRect(bx, by, bw, bh);

    var oneHead = n * n;
    var total = oneHead * h;
    var twoN = n * 2;
    var twoCells = twoN * twoN;

    ctx.fillStyle = c.text;
    ctx.font = '13px sans-serif';
    ctx.fillText('n = ' + n + ', heads = ' + h, bx + 16, by + 30);
    ctx.fillText('One head score cells: ' + oneHead.toLocaleString(), bx + 16, by + 56);
    ctx.fillText('All heads score cells per layer: ' + total.toLocaleString(), bx + 16, by + 82);
    ctx.fillText('If n doubles to ' + twoN + ': ' + twoCells.toLocaleString() + ' cells/head', bx + 16, by + 108);
    ctx.fillText('Growth factor: ' + TR.round(twoCells / oneHead, 2).toFixed(2) + 'x', bx + 16, by + 134);

    ctx.strokeStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(bx + 18, by + bh + 24);
    ctx.lineTo(bx + bw - 14, by + bh + 24);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + 24, by + bh + 22);
    ctx.lineTo(bx + 70, by + bh + 16);
    ctx.lineTo(bx + 130, by + bh + 0);
    ctx.lineTo(bx + 220, by + bh - 40);
    ctx.lineTo(bx + 330, by + bh - 108);
    ctx.stroke();

    document.getElementById('comp-info').textContent = 'With n=' + n + ' and ' + h + ' heads, one layer computes ' + total.toLocaleString() + ' score cells.';
  }

  nSl.addEventListener('input', draw);
  hSl.addEventListener('input', draw);
  TR.onThemeChange(draw);
  draw();
})();
</script>
