---
layout: post
title: "Transformers Explained: An Interactive Visual Guide"
author: bharathikannan
categories: [Machine learning]
series: true
hidden: true
description: "Build deep intuition for Transformers interactively — visualize tokenization, embeddings, positional encoding, self-attention, Q/K/V projections, multi-head attention, masked attention, and autoregressive generation with Canvas 2D demos."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /transformers/
date: 2026-04-08
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
.demo-controls input[type="text"] {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.35rem 0.6rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  font: inherit;
  font-size: 0.85rem;
  flex: 1;
  min-width: 140px;
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
.demo-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
.demo-triple {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
}
@media (max-width: 640px) {
  .demo-split { grid-template-columns: 1fr; }
  .demo-triple { grid-template-columns: 1fr; }
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
.references a { word-break: break-word; }
</style>

## Transformers from the Ground Up

This guide builds your intuition for the Transformer architecture step by step. Every major concept is explained with simple language first, followed by a visual interactive demo, and then the formal math. By the end, you will understand how a prompt becomes a prediction.

The Transformer was introduced in the 2017 paper *Attention Is All You Need*<sup class="cite"><a class="cite-ref" href="#ref-1" data-cite-preview="Vaswani et al. (2017). Attention Is All You Need. NeurIPS.">1</a></sup> and has since become the foundation of nearly all large language models, including GPT, BERT, and T5.

---

## 1. Why Transformers Were Needed

Before Transformers, the dominant models for processing sequences of text were Recurrent Neural Networks (RNNs) and their improved variants, LSTMs and GRUs.<sup class="cite"><a class="cite-ref" href="#ref-5" data-cite-preview="Hochreiter & Schmidhuber (1997). Long Short-Term Memory. Neural Computation.">5</a></sup>

These models process tokens one at a time, passing a hidden state from each step to the next. This creates two fundamental problems:

**Sequential bottleneck.** Because each step depends on the previous step, these models cannot process tokens in parallel. Training is slow, especially on long sequences.

**Vanishing context.** Information from early tokens must survive through a chain of transformations to reach later tokens. In practice, the hidden state gradually loses earlier information. Even LSTMs, designed to help with this, struggle on very long sequences.

The Transformer solves both problems at once. Instead of processing tokens sequentially, it lets every token look at every other token directly through a mechanism called **attention**. This means:

- All tokens are processed in parallel during training
- Any token can directly access information from any other token, regardless of distance
- The model learns which tokens are relevant to each other

<div class="interactive-demo" id="demo-rnn-vs-tf">
  <div class="demo-split">
    <div>
      <canvas id="canvas-rnn" width="330" height="320"></canvas>
      <div class="demo-caption">RNN: Sequential processing</div>
    </div>
    <div>
      <canvas id="canvas-tf-parallel" width="330" height="320"></canvas>
      <div class="demo-caption">Transformer: Parallel processing</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="rnn-tf-play">Play</button>
    <button id="rnn-tf-reset">Reset</button>
    <label>Speed <input type="range" id="rnn-tf-speed" min="1" max="5" step="1" value="3"><span class="demo-value" id="rnn-tf-speed-val">3x</span></label>
  </div>
  <div class="demo-info" id="rnn-tf-info">Press Play to compare: RNN processes tokens one by one, Transformer processes all at once.</div>
</div>

<div class="demo-hint"><strong>Watch:</strong> On the left, the RNN must wait for each token before moving to the next. On the right, the Transformer processes all tokens simultaneously, with attention connections forming between them.</div>

---

## 2. The Big Picture

At the highest level, a Transformer takes a sequence of tokens and produces a new sequence of enriched representations. Each output token "knows about" the other tokens through attention.

Think of it like a classroom discussion. In an RNN, students pass notes one by one down a chain. In a Transformer, everyone can hear everyone else and decide who to listen to.

The core idea has three parts:

1. **Turn words into numbers** — tokenize text and look up embedding vectors
2. **Let tokens talk to each other** — self-attention finds relevant relationships
3. **Refine the understanding** — feed-forward layers process each token's enriched representation

These three operations form a single Transformer block. Stack many blocks, and the model builds increasingly sophisticated understanding of the input.

<div class="demo-hint"><strong>Example:</strong> Consider the sentence "The bank by the river was steep." The word "bank" is ambiguous. After self-attention, the representation of "bank" gets updated with information from "river" and "steep", helping the model understand this is a riverbank, not a financial institution.</div>

---

## 3. Tokenization and Embeddings

Neural networks work with numbers, not words. The first step is converting text into a numerical form the model can process.

**Tokenization** splits text into small units called tokens. Modern models use subword tokenization (like BPE or WordPiece), which means common words stay whole while rare words are split into pieces.<sup class="cite"><a class="cite-ref" href="#ref-6" data-cite-preview="Sennrich et al. (2016). Neural Machine Translation of Rare Words with Subword Units. ACL.">6</a></sup>

For example:
- "Hello" → `["Hello"]` (common word, one token)
- "unhappiness" → `["un", "happiness"]` (split into subwords)
- "transformers" → `["transform", "ers"]` (split at morpheme boundary)

Each token gets a unique integer ID from the vocabulary. Then, an **embedding layer** converts each ID into a dense vector — a list of numbers that captures the token's meaning. These vectors typically have 768 or more dimensions in real models, but we will use small examples to keep things visible.

<div class="interactive-demo" id="demo-tokenize">
  <div class="demo-controls">
    <input type="text" id="tok-input" value="The cat sat on the mat" placeholder="Type a sentence...">
    <button id="tok-go">Tokenize</button>
  </div>
  <canvas id="canvas-tokenize" width="680" height="280"></canvas>
  <div class="demo-info" id="tok-info">Type a sentence and click Tokenize to see how it splits into tokens with IDs.</div>
</div>

<div class="demo-caption">Simplified tokenization: words are split into tokens, each mapped to an ID.</div>

After tokenization, each token ID is used to look up a row in the embedding matrix. This row is the token's embedding vector — its numerical representation.

<div class="interactive-demo" id="demo-embedding">
  <canvas id="canvas-embedding" width="680" height="300"></canvas>
  <div class="demo-controls">
    <label>Dimensions <input type="range" id="emb-dims" min="4" max="12" step="1" value="8"><span class="demo-value" id="emb-dims-val">8</span></label>
  </div>
  <div class="demo-info" id="emb-info">Click a token to see its embedding vector. Each dimension captures a different aspect of meaning.</div>
</div>

<div class="demo-hint"><strong>Key insight:</strong> Words with similar meanings end up with similar embedding vectors. The model learns these representations during training so that related words cluster together in the vector space.</div>

---

## 4. Positional Encoding

Attention treats all tokens equally — it has no built-in sense of order. The sentence "dog bites man" and "man bites dog" would produce identical attention patterns without position information. We need to tell the model where each token sits in the sequence.

**Positional encoding** adds a unique position signal to each token's embedding. The original Transformer uses sinusoidal functions at different frequencies:

$$PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$

$$PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$

where $$pos$$ is the position in the sequence and $$i$$ is the dimension index. Each dimension gets a different frequency, creating a unique "fingerprint" for each position.

**Why sinusoidal?** These functions have a useful property: the model can learn to attend to relative positions because the positional encoding at position $$pos + k$$ can be expressed as a linear function of the encoding at position $$pos$$. This means the model can generalize to sequence lengths it has not seen during training.

Modern models often use **learned positional embeddings** instead — a separate embedding matrix indexed by position, trained alongside the rest of the model. Some recent architectures use **Rotary Position Embeddings (RoPE)**<sup class="cite"><a class="cite-ref" href="#ref-7" data-cite-preview="Su et al. (2021). RoFormer: Enhanced Transformer with Rotary Position Embedding.">7</a></sup> which encode position directly into the attention computation.

The final input to the Transformer is the sum: **token embedding + positional encoding**.

<div class="interactive-demo" id="demo-posenc">
  <canvas id="canvas-posenc" width="680" height="360"></canvas>
  <div class="demo-controls">
    <label>Positions <input type="range" id="pe-positions" min="4" max="32" step="1" value="16"><span class="demo-value" id="pe-positions-val">16</span></label>
    <label>Dimensions <input type="range" id="pe-dims" min="4" max="32" step="2" value="16"><span class="demo-value" id="pe-dims-val">16</span></label>
  </div>
  <div class="demo-info" id="pe-info">Heatmap of positional encodings. Rows = positions, columns = dimensions. Hover over cells to see values. Low-index dimensions change slowly; high-index dimensions change rapidly.</div>
</div>

<div class="demo-hint"><strong>Notice:</strong> The leftmost columns oscillate slowly (low frequency), capturing broad position information. The rightmost columns oscillate quickly (high frequency), capturing fine position differences. Together, they give each position a unique pattern.</div>

---

## 5. Self-Attention: The Core Idea

Self-attention is the mechanism that lets each token gather information from all other tokens in the sequence. It answers the question: "For this token, which other tokens should I pay attention to?"

Consider the sentence: **"The animal didn't cross the street because it was too tired."**

What does "it" refer to? A human immediately knows "it" refers to "the animal." Self-attention learns to make this connection: when processing the token "it", the model assigns high attention weights to "animal" and lower weights to other tokens.

The key insight: **attention weights are context-dependent**. In a different sentence like "The street was too wide because it was recently expanded", the same word "it" would attend strongly to "street" instead.

<div class="interactive-demo" id="demo-self-attn">
  <canvas id="canvas-self-attn" width="680" height="350"></canvas>
  <div class="demo-controls">
    <button id="sa-sent1" class="active">Sentence 1</button>
    <button id="sa-sent2">Sentence 2</button>
    <button id="sa-sent3">Sentence 3</button>
  </div>
  <div class="demo-info" id="sa-info">Click any token to see which other tokens it attends to. Thicker arcs = stronger attention.</div>
</div>

<div class="demo-hint"><strong>Try this:</strong> Click on "it" in Sentence 1 and notice how it strongly attends to "animal". Then switch to Sentence 2 and click "it" again — the attention pattern changes based on context.</div>

---

## 6. Query, Key, Value

Self-attention works through three projections called **Query (Q)**, **Key (K)**, and **Value (V)**. This is the mechanism that makes attention learnable and flexible.

Think of it like a library search:
- **Query (Q)**: "What am I looking for?" — what this token wants to know
- **Key (K)**: "What do I contain?" — what this token advertises about itself
- **Value (V)**: "What information do I carry?" — the actual content to pass along

Each token's embedding is multiplied by three different weight matrices to produce its Q, K, and V vectors:

$$Q = XW^Q, \quad K = XW^K, \quad V = XW^V$$

where $$X$$ is the input embedding matrix (one row per token) and $$W^Q$$, $$W^K$$, $$W^V$$ are learned weight matrices.

The attention score between two tokens is the dot product of one token's Query with another token's Key. High dot product means the Query and Key are similar — the first token should attend to the second.

<div class="interactive-demo" id="demo-qkv">
  <canvas id="canvas-qkv" width="680" height="400"></canvas>
  <div class="demo-controls">
    <button id="qkv-step1" class="active">Step 1: Input</button>
    <button id="qkv-step2">Step 2: Project</button>
    <button id="qkv-step3">Step 3: Q, K, V</button>
    <button id="qkv-auto">Auto Play</button>
  </div>
  <div class="demo-info" id="qkv-info">Watch how input embeddings are projected into three separate spaces: Query (red), Key (blue), Value (green).</div>
</div>

<div class="demo-hint"><strong>Why three projections?</strong> If we used the same vector for querying and being queried, the model would be too constrained. Separate Q and K let the model learn asymmetric relationships — "what I look for" can be different from "what I advertise."</div>

---

## 7. Scaled Dot-Product Attention

Now we have Q, K, and V matrices. The full attention computation follows these steps:

**Step 1:** Compute raw scores — how much each token's query matches each token's key:

$$\text{scores} = QK^T$$

**Step 2:** Scale the scores by $$\sqrt{d_k}$$ where $$d_k$$ is the key dimension. Without scaling, large dot products push softmax into regions with tiny gradients:

$$\text{scaled} = \frac{QK^T}{\sqrt{d_k}}$$

**Step 3:** Apply softmax row-wise to convert scores into probabilities. Each row sums to 1, giving a probability distribution over which tokens to attend to:

$$\text{weights} = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)$$

**Step 4:** Multiply weights by Values to get the weighted combination of value vectors:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right) V$$

<div class="interactive-demo" id="demo-attn-pipeline">
  <canvas id="canvas-attn-pipeline" width="680" height="380"></canvas>
  <div class="demo-controls">
    <button id="ap-step1" class="active">1. QK^T</button>
    <button id="ap-step2">2. Scale</button>
    <button id="ap-step3">3. Softmax</button>
    <button id="ap-step4">4. × V = Output</button>
    <button id="ap-full">Full Pipeline</button>
  </div>
  <div class="demo-info" id="ap-info">Step through the attention computation. Hover over cells to see exact values.</div>
</div>

### Understanding Softmax

Softmax converts any list of numbers into a probability distribution. Large values get amplified, small values get suppressed. It is defined as:

$$\text{softmax}(z_i) = \frac{e^{z_i}}{\sum_j e^{z_j}}$$

<div class="interactive-demo" id="demo-softmax">
  <canvas id="canvas-softmax" width="680" height="260"></canvas>
  <div class="demo-controls">
    <label>Score A <input type="range" id="sm-a" min="-3" max="5" step="0.1" value="2.0"><span class="demo-value" id="sm-a-val">2.0</span></label>
    <label>Score B <input type="range" id="sm-b" min="-3" max="5" step="0.1" value="1.0"><span class="demo-value" id="sm-b-val">1.0</span></label>
    <label>Score C <input type="range" id="sm-c" min="-3" max="5" step="0.1" value="0.5"><span class="demo-value" id="sm-c-val">0.5</span></label>
    <label>Score D <input type="range" id="sm-d" min="-3" max="5" step="0.1" value="-1.0"><span class="demo-value" id="sm-d-val">-1.0</span></label>
  </div>
  <div class="demo-info" id="sm-info">Adjust raw scores to see how softmax transforms them into probabilities.</div>
</div>

<div class="demo-hint"><strong>Try this:</strong> Set one score much higher than the others and watch how softmax makes that probability dominate. Then make all scores equal — softmax produces a uniform distribution.</div>

---

## 8. Multi-Head Attention

A single attention pattern captures one type of relationship. But language has many simultaneous relationships: syntactic (subject-verb), semantic (pronoun-referent), positional (adjacent words), and more.

**Multi-head attention** runs several attention computations in parallel, each with its own Q, K, V projections. Each "head" can learn to focus on a different type of relationship.

For $$h$$ heads with model dimension $$d_{model}$$:
- Each head operates on dimension $$d_k = d_{model} / h$$
- The outputs of all heads are concatenated and projected:

$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \ldots, \text{head}_h) W^O$$

where each $$\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

<div class="interactive-demo" id="demo-multihead">
  <div class="demo-triple">
    <div>
      <canvas id="canvas-head1" width="210" height="210"></canvas>
      <div class="demo-caption">Head 1: Adjacent</div>
    </div>
    <div>
      <canvas id="canvas-head2" width="210" height="210"></canvas>
      <div class="demo-caption">Head 2: Syntactic</div>
    </div>
    <div>
      <canvas id="canvas-head3" width="210" height="210"></canvas>
      <div class="demo-caption">Head 3: Semantic</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="mh-sent1" class="active">Example 1</button>
    <button id="mh-sent2">Example 2</button>
  </div>
  <div class="demo-info" id="mh-info">Three attention heads on the same sentence, each capturing different relationships. Brighter cells = stronger attention.</div>
</div>

<div class="demo-hint"><strong>Notice:</strong> Head 1 tends to attend to nearby tokens (positional patterns). Head 2 captures grammatical structure. Head 3 focuses on meaning-based connections. Real models with 12+ heads learn even more diverse patterns.</div>

---

## 9. Residual Connections and Layer Normalization

Deep networks face a problem: as information passes through many layers, signals can degrade or explode. Two techniques stabilize the Transformer:

**Residual connections** (skip connections) add the input of a sublayer directly to its output:

$$\text{output} = \text{sublayer}(x) + x$$

This means the sublayer only needs to learn the *difference* from the input, making it much easier to train. If a layer is not helpful, the gradient can flow directly through the skip connection.

**Layer normalization** normalizes the values across the feature dimension, ensuring each layer receives inputs with consistent statistics:

$$\text{LayerNorm}(x) = \frac{x - \mu}{\sigma + \epsilon} \cdot \gamma + \beta$$

where $$\mu$$ and $$\sigma$$ are the mean and standard deviation across features, and $$\gamma$$ and $$\beta$$ are learned scaling and shifting parameters.

Together, the pattern in each Transformer sublayer is:

$$x \rightarrow \text{LayerNorm}(x + \text{Sublayer}(x))$$

<div class="interactive-demo" id="demo-residual">
  <canvas id="canvas-residual" width="680" height="300"></canvas>
  <div class="demo-controls">
    <button id="res-with" class="active">With Residual</button>
    <button id="res-without">Without Residual</button>
    <label>Layers <input type="range" id="res-layers" min="1" max="12" step="1" value="6"><span class="demo-value" id="res-layers-val">6</span></label>
  </div>
  <div class="demo-info" id="res-info">Compare signal strength with and without residual connections across layers. Without them, the signal degrades rapidly.</div>
</div>

<div class="demo-hint"><strong>Key insight:</strong> Without residual connections, the input signal becomes unrecognizably distorted after just a few layers. With them, the original information is always preserved and the network only needs to learn refinements.</div>

---

## 10. Feed-Forward Network

After attention, each token's representation passes through a feed-forward network (FFN). This is a simple two-layer MLP applied independently to each token position:

$$\text{FFN}(x) = \text{ReLU}(xW_1 + b_1)W_2 + b_2$$

The inner dimension is typically 4× larger than the model dimension (e.g., 3072 for a 768-dim model). This expansion and compression lets the network learn complex transformations of each token's representation.

**Key point:** The FFN is applied to each token *independently*. While attention is about relationships between tokens, the FFN is about refining each individual token's representation. Think of attention as "gathering information" and FFN as "processing that information."

In modern Transformers, the ReLU activation is often replaced with GELU or SwiGLU for smoother gradients and better performance.

---

## 11. The Transformer Block

Now we can put all the pieces together into a single Transformer block:

1. **Multi-Head Self-Attention** — each token attends to all other tokens
2. **Add & Normalize** — residual connection + layer normalization
3. **Feed-Forward Network** — independent processing per token
4. **Add & Normalize** — another residual connection + layer normalization

The output has the same shape as the input, so blocks can be stacked. A typical model uses 6 to 96 blocks. Each block refines the representations, building increasingly rich understanding.

<div class="interactive-demo" id="demo-block">
  <canvas id="canvas-block" width="680" height="480"></canvas>
  <div class="demo-controls">
    <label>Layer <input type="range" id="block-layer" min="1" max="6" step="1" value="1"><span class="demo-value" id="block-layer-val">1</span></label>
    <button id="block-animate">Animate Flow</button>
    <button id="block-reset">Reset</button>
  </div>
  <div class="demo-info" id="block-info">A single Transformer block. Click Animate to watch data flow through each component. Use the Layer slider to see stacking.</div>
</div>

<div class="demo-hint"><strong>Stacking:</strong> Layer 1 captures basic patterns (which tokens are near each other). Layer 3 captures phrase-level structure. Layer 6 captures document-level semantics. Each layer builds on the representations from the layer below.</div>

---

## 12. Encoder and Decoder

The original Transformer has two main halves:

**Encoder:** Processes the input sequence with bidirectional self-attention (every token can see every other token). Used when the model needs to understand the full input. The encoder produces a rich representation of the input that the decoder can use.

**Decoder:** Generates the output sequence one token at a time, using:
- **Masked self-attention** — each token can only see previous tokens (not future ones)
- **Cross-attention** — decoder tokens attend to encoder outputs, connecting output generation to input understanding

Different model families use different parts:

| Architecture | Uses | Examples |
|---|---|---|
| Encoder-only | Encoder | BERT, RoBERTa |
| Decoder-only | Decoder | GPT, LLaMA, Claude |
| Encoder-Decoder | Both | T5, BART, original Transformer |

<div class="interactive-demo" id="demo-enc-dec">
  <div class="demo-split">
    <div>
      <canvas id="canvas-encoder" width="330" height="420"></canvas>
      <div class="demo-caption">Encoder</div>
    </div>
    <div>
      <canvas id="canvas-decoder" width="330" height="420"></canvas>
      <div class="demo-caption">Decoder</div>
    </div>
  </div>
  <div class="demo-controls">
    <button id="ed-full" class="active">Encoder-Decoder</button>
    <button id="ed-enc">Encoder-Only</button>
    <button id="ed-dec">Decoder-Only</button>
  </div>
  <div class="demo-info" id="ed-info">Compare the three architecture variants. Encoder-Decoder uses both halves with cross-attention connecting them.</div>
</div>

---

## 13. Masked Attention

In decoder models (like GPT), the model generates text left to right. During training, we process entire sequences at once for efficiency, but each position should only be able to see tokens at earlier positions — not future ones. This is enforced with a **causal mask**.

The mask sets attention scores for future positions to $$-\infty$$ before softmax, which makes their attention weights exactly zero:

$$\text{MaskedAttention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}} + M\right) V$$

where $$M$$ is a matrix with 0 on the lower triangle and $$-\infty$$ on the upper triangle.

**Bidirectional models** (like BERT) do not use this mask — every token can attend to every other token. This gives them access to full context but means they cannot generate text autoregressively.

<div class="interactive-demo" id="demo-mask">
  <canvas id="canvas-mask" width="680" height="340"></canvas>
  <div class="demo-controls">
    <button id="mask-causal" class="active">Causal (GPT)</button>
    <button id="mask-bidir">Bidirectional (BERT)</button>
    <label>Sequence Length <input type="range" id="mask-len" min="4" max="10" step="1" value="6"><span class="demo-value" id="mask-len-val">6</span></label>
  </div>
  <div class="demo-info" id="mask-info">Causal mask: each token can only attend to itself and earlier tokens. Red X = blocked. Green = allowed.</div>
</div>

<div class="demo-hint"><strong>Why mask?</strong> Without masking, a language model could "cheat" during training by looking at the answer. Masking forces the model to predict each next token using only the preceding context, which is exactly what it must do during generation.</div>

---

## 14. Training

Training a Transformer language model is conceptually straightforward: predict the next token.

**Next-token prediction:** Given a sequence like "The cat sat on", the model should predict "the" as the most likely next token. The training objective maximizes the probability of each correct next token:

$$\mathcal{L} = -\sum_{t=1}^{T} \log P(x_t \mid x_1, \ldots, x_{t-1})$$

This is the cross-entropy loss — the model outputs a probability distribution over the entire vocabulary, and we penalize it for assigning low probability to the correct token.

**Teacher forcing:** During training, the model receives the correct previous tokens at each position (not its own predictions). This is possible because of the causal mask — all positions are computed simultaneously, but each position can only attend to earlier positions.

**Backpropagation** computes gradients through the entire network — attention weights, projection matrices, FFN parameters, and embeddings — and updates them via gradient descent. For background on backpropagation, see the [Backpropagation Visualized]({{ site.baseurl }}/backpropagation/) guide.

The model sees billions of tokens from books, websites, and other text, gradually learning patterns at every level: spelling, grammar, facts, reasoning, and more.

---

## 15. Inference and Generation

During inference, the model generates text one token at a time in an autoregressive loop:

1. Feed the prompt tokens through the model
2. Get a probability distribution over the vocabulary for the next token
3. **Sample** a token from that distribution
4. Append it to the sequence
5. Repeat from step 1 with the extended sequence

The sampling strategy dramatically affects the output:

**Greedy decoding:** Always pick the most probable token. Deterministic but often repetitive and boring.

**Temperature:** Divide logits by a temperature $$\tau$$ before softmax. $$\tau < 1$$ makes the distribution sharper (more confident), $$\tau > 1$$ makes it flatter (more random).

**Top-k sampling:** Only consider the $$k$$ most probable tokens. This prevents sampling very unlikely tokens.

**Top-p (nucleus) sampling:** Only consider the smallest set of tokens whose cumulative probability exceeds $$p$$. This adapts the number of candidates based on the model's confidence.

<div class="interactive-demo" id="demo-generation">
  <canvas id="canvas-generation" width="680" height="360"></canvas>
  <div class="demo-controls">
    <input type="text" id="gen-prompt" value="The Transformer" placeholder="Enter prompt...">
    <button id="gen-next">Generate Next</button>
    <button id="gen-auto">Auto Generate</button>
    <button id="gen-reset">Reset</button>
  </div>
  <div class="demo-controls">
    <label>Max tokens <input type="range" id="gen-max" min="3" max="20" step="1" value="10"><span class="demo-value" id="gen-max-val">10</span></label>
  </div>
  <div class="demo-info" id="gen-info">Watch the model generate tokens one at a time. The bar chart shows the probability distribution for the next token.</div>
</div>

<div class="interactive-demo" id="demo-temperature">
  <canvas id="canvas-temperature" width="680" height="300"></canvas>
  <div class="demo-controls">
    <label>Temperature <input type="range" id="temp-t" min="0.1" max="3.0" step="0.1" value="1.0"><span class="demo-value" id="temp-t-val">1.0</span></label>
    <label>Top-k <input type="range" id="temp-k" min="1" max="10" step="1" value="10"><span class="demo-value" id="temp-k-val">10</span></label>
    <label>Top-p <input type="range" id="temp-p" min="0.1" max="1.0" step="0.05" value="0.9"><span class="demo-value" id="temp-p-val">0.90</span></label>
    <button id="temp-sample">Sample</button>
  </div>
  <div class="demo-info" id="temp-info">Adjust temperature and sampling parameters. Low temperature → confident/deterministic. High temperature → creative/random.</div>
</div>

<div class="demo-hint"><strong>Try this:</strong> Set temperature to 0.1 to see a very peaked distribution (almost greedy). Then set it to 3.0 to see an almost uniform distribution. Watch how top-k and top-p further constrain the eligible tokens.</div>

---

## 16. Context Window and Limitations

The self-attention mechanism computes a score between every pair of tokens. For a sequence of $$n$$ tokens, this requires $$O(n^2)$$ operations and $$O(n^2)$$ memory. This quadratic cost limits how long the context window can be.

| Sequence Length | Attention Operations | Memory (approx.) |
|---|---|---|
| 512 | 262K | ~1 MB |
| 2,048 | 4.2M | ~16 MB |
| 8,192 | 67M | ~256 MB |
| 32,768 | 1.07B | ~4 GB |
| 131,072 | 17.2B | ~64 GB |

<div class="interactive-demo" id="demo-quadratic">
  <canvas id="canvas-quadratic" width="680" height="300"></canvas>
  <div class="demo-controls">
    <label>Sequence Length <input type="range" id="quad-n" min="128" max="16384" step="128" value="2048"><span class="demo-value" id="quad-n-val">2048</span></label>
  </div>
  <div class="demo-info" id="quad-info">O(n) FFN cost vs O(n²) attention cost. As sequence length grows, attention dominates.</div>
</div>

Beyond computational cost, Transformers have other known limitations:

**Hallucinations.** The model generates plausible-sounding but factually incorrect text. Since it predicts the most likely next token based on patterns, it cannot truly verify facts.

**Context window.** Everything the model "remembers" must fit in the context window. There is no persistent memory between conversations (unless explicitly provided in the prompt).

**No true reasoning.** Transformers learn statistical patterns, not logical rules. They can approximate reasoning through patterns seen in training data, but they do not have a genuine reasoning engine.

---

## 17. Modern Extensions

The original Transformer has been improved in many ways. Here are the most important ones:

**Sparse attention** reduces the quadratic cost by having each token attend to only a subset of other tokens (local windows, strided patterns, or learned routing).

**Rotary Position Embeddings (RoPE)**<sup class="cite"><a class="cite-ref" href="#ref-7" data-cite-preview="Su et al. (2021). RoFormer: Enhanced Transformer with Rotary Position Embedding.">7</a></sup> encode position information directly in the Q/K dot product, enabling better generalization to longer sequences.

**Grouped Query Attention (GQA)** shares Key and Value heads across multiple Query heads, reducing memory during inference while maintaining quality.<sup class="cite"><a class="cite-ref" href="#ref-8" data-cite-preview="Ainslie et al. (2023). GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints.">8</a></sup>

**Mixture of Experts (MoE)** replaces the FFN with multiple "expert" sub-networks, routing each token to only a few experts. This allows much larger models without proportional compute increase.

**KV cache** stores previously computed Key and Value vectors during generation, so the model does not recompute them for earlier tokens. This makes autoregressive generation practical.

**Flash Attention** reorganizes the attention computation to minimize memory transfers between GPU memory tiers, achieving significant speedups.

---

## 18. Practical Intuition: What Happens When You Type a Prompt

When you type a prompt into a language model, here is the full pipeline:

1. **Tokenization:** Your text is split into tokens. "How does attention work?" might become `["How", " does", " attention", " work", "?"]`

2. **Embedding lookup:** Each token ID selects a row from the embedding matrix, producing a vector per token

3. **Positional encoding:** Position vectors are added so the model knows token order

4. **Through the blocks:** The sequence of vectors passes through many Transformer blocks (e.g., 32 blocks in a 7B parameter model). Each block:
   - Runs multi-head self-attention (masked, so each token only sees previous tokens)
   - Adds residual connection and layer norm
   - Runs the feed-forward network
   - Adds another residual connection and layer norm

5. **Output projection:** The final block's output for the last token is projected to vocabulary size (e.g., 32,000 logits)

6. **Sampling:** Temperature, top-k, and top-p are applied. One token is sampled from the resulting distribution.

7. **Loop:** The sampled token is appended to the sequence and steps 2-6 repeat until a stop condition is met

Every single response you receive from a language model was generated this way — one token at a time.

---

## 19. Summary and Mental Model

<table class="summary-table">
  <thead><tr><th>Component</th><th>What It Does</th><th>Why It Matters</th></tr></thead>
  <tbody>
    <tr><td>Tokenizer</td><td>Splits text into subword tokens</td><td>Converts language to discrete IDs</td></tr>
    <tr><td>Embedding</td><td>Maps token IDs to dense vectors</td><td>Captures meaning in numbers</td></tr>
    <tr><td>Positional Encoding</td><td>Adds position signal to embeddings</td><td>Gives order information</td></tr>
    <tr><td>Self-Attention</td><td>Each token attends to all others</td><td>Builds context-aware representations</td></tr>
    <tr><td>Q, K, V</td><td>Learned projections for matching</td><td>Flexible query-key similarity</td></tr>
    <tr><td>Multi-Head</td><td>Multiple parallel attention patterns</td><td>Captures diverse relationships</td></tr>
    <tr><td>Residual + LayerNorm</td><td>Skip connections and normalization</td><td>Stabilizes deep networks</td></tr>
    <tr><td>Feed-Forward Network</td><td>Per-token MLP processing</td><td>Refines individual representations</td></tr>
    <tr><td>Causal Mask</td><td>Blocks future token visibility</td><td>Enables autoregressive generation</td></tr>
    <tr><td>Softmax + Sampling</td><td>Converts logits to token choice</td><td>Controls creativity vs. determinism</td></tr>
  </tbody>
</table>

**Your compact mental model:**

> A Transformer takes a sequence of tokens, converts them to vectors, adds position information, then repeatedly refines those vectors through attention (let tokens communicate) and feed-forward (let each token think). After many layers of this, the final vector for the last token is converted to a probability distribution over the next word.

That is the entire mechanism behind GPT, Claude, LLaMA, and every modern large language model.

---

## References

<ol class="references">
  <li id="ref-1">Vaswani, A., et al. (2017). <em>Attention Is All You Need</em>. NeurIPS. <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">https://arxiv.org/abs/1706.03762</a></li>
  <li id="ref-2">Alammar, J. <em>The Illustrated Transformer</em>. <a href="https://jalammar.github.io/illustrated-transformer/" target="_blank" rel="noopener">https://jalammar.github.io/illustrated-transformer/</a></li>
  <li id="ref-3">Polo Club. <em>Transformer Explainer</em>. <a href="https://poloclub.github.io/transformer-explainer/" target="_blank" rel="noopener">https://poloclub.github.io/transformer-explainer/</a></li>
  <li id="ref-4">3Blue1Brown. <em>But what is GPT? Visual intro to Transformers</em>. <a href="https://www.3blue1brown.com/lessons/gpt" target="_blank" rel="noopener">https://www.3blue1brown.com/lessons/gpt</a></li>
  <li id="ref-5">Hochreiter, S. & Schmidhuber, J. (1997). <em>Long Short-Term Memory</em>. Neural Computation, 9(8), 1735-1780.</li>
  <li id="ref-6">Sennrich, R., Haddow, B., & Birch, A. (2016). <em>Neural Machine Translation of Rare Words with Subword Units</em>. ACL. <a href="https://arxiv.org/abs/1508.07909" target="_blank" rel="noopener">https://arxiv.org/abs/1508.07909</a></li>
  <li id="ref-7">Su, J., et al. (2021). <em>RoFormer: Enhanced Transformer with Rotary Position Embedding</em>. <a href="https://arxiv.org/abs/2104.09864" target="_blank" rel="noopener">https://arxiv.org/abs/2104.09864</a></li>
  <li id="ref-8">Ainslie, J., et al. (2023). <em>GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints</em>. <a href="https://arxiv.org/abs/2305.13245" target="_blank" rel="noopener">https://arxiv.org/abs/2305.13245</a></li>
</ol>

<script>
// ==================== SHARED TRANSFORMER UTILITIES ====================
window.TF = (function() {
  var listeners = [];
  var observerReady = false;

  function getColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      dark: dark,
      bg: dark ? '#1a1b26' : '#ffffff',
      bg2: dark ? '#24283b' : '#f8f9fa',
      text: dark ? '#c0caf5' : '#1f2937',
      muted: dark ? '#7d89b0' : '#6b7280',
      border: dark ? '#3a4263' : '#d1d5db',
      grid: dark ? '#2b3355' : '#e5e7eb',
      accent: dark ? '#7aa2f7' : '#2563eb',
      query: dark ? '#f7768e' : '#dc2626',
      key: dark ? '#7aa2f7' : '#2563eb',
      value: dark ? '#9ece6a' : '#16a34a',
      attn: dark ? '#ff9e64' : '#ea580c',
      embed: dark ? '#bb9af7' : '#7c3aed',
      pos: dark ? '#73daca' : '#0d9488',
      green: dark ? '#9ece6a' : '#16a34a',
      red: dark ? '#f7768e' : '#dc2626',
      orange: dark ? '#ff9e64' : '#ea580c',
      purple: dark ? '#bb9af7' : '#7c3aed',
      teal: dark ? '#73daca' : '#0d9488',
      yellow: dark ? '#e0af68' : '#d97706',
      blocked: dark ? 'rgba(247,118,142,0.35)' : 'rgba(220,38,38,0.2)',
      allowed: dark ? 'rgba(158,206,106,0.35)' : 'rgba(22,163,74,0.2)',
      heatPos: dark ? [26, 27, 38] : [255, 255, 255],
      heatNeg: dark ? [122, 162, 247] : [37, 99, 235]
    };
  }

  function onThemeChange(fn) {
    listeners.push(fn);
    if (!observerReady) {
      var obs = new MutationObserver(function() {
        for (var i = 0; i < listeners.length; i++) listeners[i]();
      });
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      observerReady = true;
    }
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

  function softmax(arr) {
    var max = -Infinity;
    for (var i = 0; i < arr.length; i++) if (isFinite(arr[i]) && arr[i] > max) max = arr[i];
    var exps = [], sum = 0;
    for (i = 0; i < arr.length; i++) {
      if (!isFinite(arr[i])) { exps.push(0); }
      else { var v = Math.exp(arr[i] - max); exps.push(v); sum += v; }
    }
    if (sum === 0) return arr.map(function() { return 0; });
    return exps.map(function(v) { return v / sum; });
  }

  function dot(a, b) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  function round(v, d) {
    var p = Math.pow(10, d == null ? 2 : d);
    return Math.round(v * p) / p;
  }

  function drawRoundedRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  }

  function drawArrow(ctx, x1, y1, x2, y2, color, width) {
    var headLen = 8;
    var angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawText(ctx, text, x, y, color, size, align) {
    ctx.fillStyle = color;
    ctx.font = (size || 12) + 'px "JetBrains Mono", monospace';
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  function valueToHeatColor(v, min, max, c) {
    var t = (v - min) / (max - min + 1e-8);
    t = Math.max(0, Math.min(1, t));
    var r = Math.round(c.heatPos[0] + (c.heatNeg[0] - c.heatPos[0]) * t);
    var g = Math.round(c.heatPos[1] + (c.heatNeg[1] - c.heatPos[1]) * t);
    var b = Math.round(c.heatPos[2] + (c.heatNeg[2] - c.heatPos[2]) * t);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  // Simple tokenizer for demos
  function simpleTokenize(text) {
    var tokens = [];
    var words = text.split(/(\s+)/);
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (/^\s+$/.test(w)) continue;
      if (w.length > 6) {
        var mid = Math.ceil(w.length * 0.6);
        tokens.push(w.substring(0, mid));
        tokens.push(w.substring(mid));
      } else {
        tokens.push(w);
      }
    }
    return tokens;
  }

  // Seeded random for reproducible demos
  function seededRandom(seed) {
    var s = seed;
    return function() {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  return {
    getColors: getColors,
    onThemeChange: onThemeChange,
    setupCanvas: setupCanvas,
    softmax: softmax,
    dot: dot,
    round: round,
    drawRoundedRect: drawRoundedRect,
    drawArrow: drawArrow,
    drawText: drawText,
    valueToHeatColor: valueToHeatColor,
    lerp: lerp,
    easeInOut: easeInOut,
    simpleTokenize: simpleTokenize,
    seededRandom: seededRandom
  };
})();
</script>

<!-- Demo 1: RNN vs Transformer -->
<script>
(function() {
  var canvasRnn = document.getElementById('canvas-rnn');
  var canvasTf = document.getElementById('canvas-tf-parallel');
  if (!canvasRnn || !canvasTf) return;
  var ctxR = TF.setupCanvas(canvasRnn, 330, 320);
  var ctxT = TF.setupCanvas(canvasTf, 330, 320);
  var info = document.getElementById('rnn-tf-info');
  var playBtn = document.getElementById('rnn-tf-play');
  var resetBtn = document.getElementById('rnn-tf-reset');
  var speedSlider = document.getElementById('rnn-tf-speed');
  var speedVal = document.getElementById('rnn-tf-speed-val');

  var tokens = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
  var progress = 0;
  var running = false;
  var animId = null;

  function draw() {
    var c = TF.getColors();
    var W = 330, H = 320;

    // Draw RNN
    ctxR.clearRect(0, 0, W, H);
    ctxR.fillStyle = c.bg;
    ctxR.fillRect(0, 0, W, H);

    var boxW = 42, boxH = 32, gap = 6;
    var startX = (W - tokens.length * (boxW + gap)) / 2;
    var y = 140;
    var activeRnn = Math.floor(progress * tokens.length);

    for (var i = 0; i < tokens.length; i++) {
      var x = startX + i * (boxW + gap);
      var lit = i <= activeRnn && progress > 0;
      TF.drawRoundedRect(ctxR, x, y, boxW, boxH, 6,
        lit ? c.accent : c.bg2,
        lit ? c.accent : c.border);
      TF.drawText(ctxR, tokens[i], x + boxW / 2, y + boxH / 2,
        lit ? (c.dark ? '#1a1b26' : '#ffffff') : c.text, 10);
      // Arrow to next
      if (i < tokens.length - 1 && i < activeRnn && progress > 0) {
        TF.drawArrow(ctxR, x + boxW + 2, y + boxH / 2, x + boxW + gap - 2, y + boxH / 2, c.attn, 2);
      }
    }

    // Hidden state
    var hx = startX + activeRnn * (boxW + gap) + boxW / 2;
    if (progress > 0 && activeRnn < tokens.length) {
      ctxR.beginPath();
      ctxR.arc(hx, y - 30, 14, 0, Math.PI * 2);
      ctxR.fillStyle = c.orange;
      ctxR.globalAlpha = 0.7;
      ctxR.fill();
      ctxR.globalAlpha = 1;
      TF.drawText(ctxR, 'h', hx, y - 30, c.bg, 10);
    }

    TF.drawText(ctxR, 'Sequential: one token at a time', W / 2, H - 30, c.muted, 10);
    if (progress > 0) {
      TF.drawText(ctxR, 'Step ' + Math.min(activeRnn + 1, tokens.length) + '/' + tokens.length, W / 2, 30, c.text, 11);
    }

    // Draw Transformer
    ctxT.clearRect(0, 0, W, H);
    ctxT.fillStyle = c.bg;
    ctxT.fillRect(0, 0, W, H);

    var tfActive = progress > 0.1;
    for (var j = 0; j < tokens.length; j++) {
      var tx = startX + j * (boxW + gap);
      TF.drawRoundedRect(ctxT, tx, y, boxW, boxH, 6,
        tfActive ? c.accent : c.bg2,
        tfActive ? c.accent : c.border);
      TF.drawText(ctxT, tokens[j], tx + boxW / 2, y + boxH / 2,
        tfActive ? (c.dark ? '#1a1b26' : '#ffffff') : c.text, 10);
    }

    // Attention arcs
    if (tfActive) {
      var arcAlpha = Math.min(1, (progress - 0.1) / 0.3);
      ctxT.globalAlpha = arcAlpha * 0.4;
      for (var a = 0; a < tokens.length; a++) {
        for (var b = a + 1; b < tokens.length; b++) {
          var ax = startX + a * (boxW + gap) + boxW / 2;
          var bx = startX + b * (boxW + gap) + boxW / 2;
          var radius = (bx - ax) / 2;
          ctxT.beginPath();
          ctxT.arc((ax + bx) / 2, y, radius, Math.PI, 0);
          ctxT.strokeStyle = c.attn;
          ctxT.lineWidth = 1.5;
          ctxT.stroke();
        }
      }
      ctxT.globalAlpha = 1;
    }

    TF.drawText(ctxT, 'Parallel: all tokens at once', W / 2, H - 30, c.muted, 10);
    if (tfActive) {
      TF.drawText(ctxT, 'All ' + tokens.length + ' tokens processed', W / 2, 30, c.text, 11);
    }
  }

  function animate() {
    var speed = parseFloat(speedSlider.value);
    progress += 0.008 * speed;
    if (progress >= 1) { progress = 1; running = false; info.textContent = 'Done. The Transformer finished while the RNN was still processing sequentially.'; }
    draw();
    if (running) animId = requestAnimationFrame(animate);
  }

  playBtn.addEventListener('click', function() {
    if (running) return;
    if (progress >= 1) progress = 0;
    running = true;
    info.textContent = 'Animating...';
    animate();
  });

  resetBtn.addEventListener('click', function() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    progress = 0;
    info.textContent = 'Press Play to compare: RNN processes tokens one by one, Transformer processes all at once.';
    draw();
  });

  speedSlider.addEventListener('input', function() {
    speedVal.textContent = speedSlider.value + 'x';
  });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 2: Tokenization -->
<script>
(function() {
  var canvas = document.getElementById('canvas-tokenize');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 280);
  var input = document.getElementById('tok-input');
  var goBtn = document.getElementById('tok-go');
  var info = document.getElementById('tok-info');
  var tokens = [];
  var rng = TF.seededRandom(42);

  function tokenize() {
    tokens = TF.simpleTokenize(input.value || 'The cat sat');
    draw();
    info.textContent = tokens.length + ' tokens generated.';
  }

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 280;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    if (tokens.length === 0) {
      TF.drawText(ctx, 'Type a sentence and click Tokenize', W / 2, H / 2, c.muted, 13);
      return;
    }

    // Draw original text
    TF.drawText(ctx, 'Input: "' + input.value + '"', W / 2, 30, c.text, 12);

    // Draw arrow
    TF.drawArrow(ctx, W / 2, 48, W / 2, 68, c.muted, 1.5);
    TF.drawText(ctx, 'tokenize', W / 2 + 40, 58, c.muted, 10);

    // Draw token chips
    var chipH = 34, chipGap = 8, chipY = 80;
    var totalW = 0;
    var chipWidths = [];
    ctx.font = '11px "JetBrains Mono", monospace';
    for (var i = 0; i < tokens.length; i++) {
      var tw = ctx.measureText(tokens[i]).width + 24;
      chipWidths.push(tw);
      totalW += tw + chipGap;
    }
    totalW -= chipGap;

    var cols = [c.accent, c.purple, c.green, c.orange, c.teal, c.yellow, c.red];
    var sx = (W - Math.min(totalW, W - 40)) / 2;
    var cx = sx;
    var row = 0;

    for (var j = 0; j < tokens.length; j++) {
      if (cx + chipWidths[j] > W - 20) {
        cx = sx;
        row++;
      }
      var cy = chipY + row * (chipH + chipGap + 30);
      var col = cols[j % cols.length];

      TF.drawRoundedRect(ctx, cx, cy, chipWidths[j], chipH, chipH / 2, col + '22', col);
      TF.drawText(ctx, tokens[j], cx + chipWidths[j] / 2, cy + chipH / 2, c.text, 11);

      // Token ID
      var tokenId = Math.abs(hashCode(tokens[j])) % 50000;
      TF.drawText(ctx, 'ID: ' + tokenId, cx + chipWidths[j] / 2, cy + chipH + 14, c.muted, 9);

      cx += chipWidths[j] + chipGap;
    }
  }

  function hashCode(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return h;
  }

  goBtn.addEventListener('click', tokenize);
  input.addEventListener('keydown', function(e) { if (e.key === 'Enter') tokenize(); });
  tokenize();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 3: Embedding Lookup -->
<script>
(function() {
  var canvas = document.getElementById('canvas-embedding');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 300);
  var dimsSlider = document.getElementById('emb-dims');
  var dimsVal = document.getElementById('emb-dims-val');
  var info = document.getElementById('emb-info');

  var tokens = ['The', 'cat', 'sat', 'on'];
  var selectedToken = 0;
  var rng = TF.seededRandom(123);
  var embeddings = {};

  function genEmbedding(token, dims) {
    var r = TF.seededRandom(hashCode(token));
    var vec = [];
    for (var i = 0; i < dims; i++) vec.push(TF.round(r() * 2 - 1, 2));
    return vec;
  }

  function hashCode(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return h;
  }

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 300;
    var dims = parseInt(dimsSlider.value);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Token chips on left
    var chipW = 60, chipH = 30, chipGap = 8;
    var tokY = 40;
    for (var i = 0; i < tokens.length; i++) {
      var y = tokY + i * (chipH + chipGap);
      var sel = i === selectedToken;
      TF.drawRoundedRect(ctx, 20, y, chipW, chipH, chipH / 2,
        sel ? c.accent : c.bg2, sel ? c.accent : c.border);
      TF.drawText(ctx, tokens[i], 20 + chipW / 2, y + chipH / 2,
        sel ? (c.dark ? '#1a1b26' : '#fff') : c.text, 11);
    }

    // Arrow
    TF.drawArrow(ctx, 90, tokY + selectedToken * (chipH + chipGap) + chipH / 2,
      140, tokY + selectedToken * (chipH + chipGap) + chipH / 2, c.accent, 2);
    TF.drawText(ctx, 'lookup', 115, tokY + selectedToken * (chipH + chipGap) + chipH / 2 - 12, c.muted, 9);

    // Embedding bars
    var emb = genEmbedding(tokens[selectedToken], dims);
    var barArea = W - 160;
    var barW = Math.min(30, (barArea - (dims - 1) * 4) / dims);
    var barMaxH = 120;
    var bx = 155;
    var by = 60;
    var maxVal = 1;

    for (var d = 0; d < dims; d++) {
      var x = bx + d * (barW + 4);
      var v = emb[d];
      var h = Math.abs(v) / maxVal * barMaxH;
      var barY = v >= 0 ? by + barMaxH - h : by + barMaxH;

      ctx.fillStyle = v >= 0 ? c.accent + '55' : c.red + '55';
      ctx.fillRect(x, barY, barW, h);
      ctx.strokeStyle = v >= 0 ? c.accent : c.red;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, barY, barW, h);

      TF.drawText(ctx, 'd' + d, x + barW / 2, by + barMaxH + 16, c.muted, 8);
      TF.drawText(ctx, v.toFixed(2), x + barW / 2, by + barMaxH + 30, c.text, 7.5);
    }

    TF.drawText(ctx, 'Embedding vector for "' + tokens[selectedToken] + '"', (155 + W) / 2, 30, c.text, 12);
    TF.drawText(ctx, dims + ' dimensions', (155 + W) / 2, by + barMaxH + 50, c.muted, 10);

    // Zero line
    ctx.beginPath();
    ctx.moveTo(bx - 5, by + barMaxH);
    ctx.lineTo(bx + dims * (barW + 4), by + barMaxH);
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    var mx = (e.clientX - rect.left);
    var my = (e.clientY - rect.top);
    var chipH = 30, chipGap = 8, tokY = 40;
    for (var i = 0; i < tokens.length; i++) {
      var y = tokY + i * (chipH + chipGap);
      if (mx >= 20 && mx <= 80 && my >= y && my <= y + chipH) {
        selectedToken = i;
        draw();
        break;
      }
    }
  });

  dimsSlider.addEventListener('input', function() {
    dimsVal.textContent = dimsSlider.value;
    draw();
  });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 4: Positional Encoding Heatmap -->
<script>
(function() {
  var canvas = document.getElementById('canvas-posenc');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 360);
  var posSlider = document.getElementById('pe-positions');
  var posVal = document.getElementById('pe-positions-val');
  var dimSlider = document.getElementById('pe-dims');
  var dimVal = document.getElementById('pe-dims-val');
  var info = document.getElementById('pe-info');
  var hoverPos = -1, hoverDim = -1;

  function pe(pos, dim, dmodel) {
    var i = Math.floor(dim / 2);
    var freq = 1.0 / Math.pow(10000, 2 * i / dmodel);
    return dim % 2 === 0 ? Math.sin(pos * freq) : Math.cos(pos * freq);
  }

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 360;
    var npos = parseInt(posSlider.value);
    var ndim = parseInt(dimSlider.value);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var margin = { top: 40, left: 55, right: 20, bottom: 50 };
    var plotW = W - margin.left - margin.right;
    var plotH = H - margin.top - margin.bottom;
    var cellW = plotW / ndim;
    var cellH = plotH / npos;

    // Title
    TF.drawText(ctx, 'Positional Encoding Heatmap', W / 2, 18, c.text, 12);

    // Axis labels
    TF.drawText(ctx, 'Dimension →', W / 2, H - 10, c.muted, 10);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    TF.drawText(ctx, 'Position →', 0, 0, c.muted, 10);
    ctx.restore();

    // Draw heatmap
    for (var p = 0; p < npos; p++) {
      for (var d = 0; d < ndim; d++) {
        var val = pe(p, d, ndim);
        var x = margin.left + d * cellW;
        var y = margin.top + p * cellH;

        // Color: blue for positive, red for negative
        var t = (val + 1) / 2; // 0 to 1
        var r, g, b;
        if (c.dark) {
          r = Math.round(26 + t * 96);
          g = Math.round(27 + t * 135);
          b = Math.round(38 + t * 209);
        } else {
          r = Math.round(220 - t * 183);
          g = Math.round(38 + t * 200);
          b = Math.round(38 + t * 199);
        }
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);

        if (p === hoverPos && d === hoverDim) {
          ctx.strokeStyle = c.text;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, cellW, cellH);
        }
      }
    }

    // Dim labels (sparse)
    var dimStep = Math.max(1, Math.floor(ndim / 8));
    for (var dl = 0; dl < ndim; dl += dimStep) {
      TF.drawText(ctx, dl, margin.left + dl * cellW + cellW / 2, margin.top + plotH + 14, c.muted, 8);
    }

    // Pos labels (sparse)
    var posStep = Math.max(1, Math.floor(npos / 8));
    ctx.textAlign = 'right';
    for (var pl = 0; pl < npos; pl += posStep) {
      ctx.fillStyle = c.muted;
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(pl, margin.left - 6, margin.top + pl * cellH + cellH / 2 + 3);
    }
    ctx.textAlign = 'center';

    // Hover tooltip
    if (hoverPos >= 0 && hoverDim >= 0 && hoverPos < npos && hoverDim < ndim) {
      var hv = pe(hoverPos, hoverDim, ndim);
      var fn = hoverDim % 2 === 0 ? 'sin' : 'cos';
      info.textContent = 'pos=' + hoverPos + ', dim=' + hoverDim + ': ' + fn + ' → ' + TF.round(hv, 4);
    }
  }

  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var npos = parseInt(posSlider.value);
    var ndim = parseInt(dimSlider.value);
    var margin = { top: 40, left: 55, right: 20, bottom: 50 };
    var plotW = 680 - margin.left - margin.right;
    var plotH = 360 - margin.top - margin.bottom;
    var cellW = plotW / ndim;
    var cellH = plotH / npos;

    var d = Math.floor((mx - margin.left) / cellW);
    var p = Math.floor((my - margin.top) / cellH);
    if (d >= 0 && d < ndim && p >= 0 && p < npos) {
      hoverPos = p;
      hoverDim = d;
    } else {
      hoverPos = -1;
      hoverDim = -1;
    }
    draw();
  });

  canvas.addEventListener('mouseleave', function() {
    hoverPos = -1;
    hoverDim = -1;
    draw();
  });

  posSlider.addEventListener('input', function() { posVal.textContent = posSlider.value; draw(); });
  dimSlider.addEventListener('input', function() { dimVal.textContent = dimSlider.value; draw(); });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 5: Self-Attention Visualization -->
<script>
(function() {
  var canvas = document.getElementById('canvas-self-attn');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 350);
  var info = document.getElementById('sa-info');
  var sent1Btn = document.getElementById('sa-sent1');
  var sent2Btn = document.getElementById('sa-sent2');
  var sent3Btn = document.getElementById('sa-sent3');

  var sentences = [
    { tokens: ['The', 'animal', 'didn\'t', 'cross', 'the', 'street', 'because', 'it', 'was', 'tired'],
      attn: {7: [0, 0.35, 0.02, 0.05, 0, 0.03, 0.05, 0.05, 0.15, 0.30],
             1: [0.10, 0.30, 0.05, 0.15, 0.05, 0.10, 0.05, 0.05, 0.05, 0.10],
             3: [0.05, 0.10, 0.05, 0.25, 0.15, 0.25, 0.05, 0.02, 0.03, 0.05]} },
    { tokens: ['The', 'street', 'was', 'wide', 'because', 'it', 'was', 'recently', 'expanded'],
      attn: {5: [0.05, 0.40, 0.05, 0.10, 0.05, 0.05, 0.05, 0.10, 0.15],
             1: [0.15, 0.25, 0.10, 0.10, 0.05, 0.05, 0.10, 0.10, 0.10],
             3: [0.05, 0.15, 0.10, 0.25, 0.10, 0.05, 0.10, 0.10, 0.10]} },
    { tokens: ['I', 'love', 'the', 'dog', 'that', 'chased', 'the', 'ball'],
      attn: {5: [0.05, 0.10, 0.05, 0.35, 0.15, 0.10, 0.05, 0.15],
             3: [0.10, 0.15, 0.10, 0.30, 0.10, 0.10, 0.05, 0.10],
             7: [0.05, 0.05, 0.05, 0.05, 0.05, 0.40, 0.10, 0.25]} }
  ];

  var currentSent = 0;
  var selectedToken = -1;

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 350;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var s = sentences[currentSent];
    var tokens = s.tokens;
    var n = tokens.length;

    // Measure token widths
    ctx.font = '12px "JetBrains Mono", monospace';
    var chipPad = 16, chipGap = 6, chipH = 32;
    var widths = [];
    var totalW = 0;
    for (var i = 0; i < n; i++) {
      var tw = ctx.measureText(tokens[i]).width + chipPad * 2;
      widths.push(tw);
      totalW += tw + chipGap;
    }
    totalW -= chipGap;

    var sx = Math.max(10, (W - totalW) / 2);
    var tokenY = H - 80;

    // Draw tokens
    var tokenCenters = [];
    var cx = sx;
    for (var j = 0; j < n; j++) {
      var sel = j === selectedToken;
      TF.drawRoundedRect(ctx, cx, tokenY, widths[j], chipH, chipH / 2,
        sel ? c.accent : c.bg2, sel ? c.accent : c.border);
      TF.drawText(ctx, tokens[j], cx + widths[j] / 2, tokenY + chipH / 2,
        sel ? (c.dark ? '#1a1b26' : '#fff') : c.text, 12);
      tokenCenters.push(cx + widths[j] / 2);
      cx += widths[j] + chipGap;
    }

    // Draw attention arcs
    if (selectedToken >= 0 && s.attn[selectedToken]) {
      var weights = s.attn[selectedToken];
      for (var k = 0; k < n; k++) {
        if (k === selectedToken) continue;
        var w = weights[k];
        if (w < 0.02) continue;
        var fromX = tokenCenters[selectedToken];
        var toX = tokenCenters[k];
        var radius = Math.abs(toX - fromX) / 2;
        var midX = (fromX + toX) / 2;

        ctx.beginPath();
        ctx.arc(midX, tokenY, radius, Math.PI, 0);
        ctx.strokeStyle = c.attn;
        ctx.lineWidth = Math.max(1, w * 8);
        ctx.globalAlpha = 0.3 + w * 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Weight label
        TF.drawText(ctx, TF.round(w, 2).toString(), midX, tokenY - radius - 8, c.attn, 9);
      }
    }

    // Instructions
    if (selectedToken < 0) {
      TF.drawText(ctx, 'Click any token to see its attention pattern', W / 2, 30, c.muted, 11);
    } else {
      TF.drawText(ctx, '"' + tokens[selectedToken] + '" attends to:', W / 2, 30, c.text, 12);
    }
  }

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var s = sentences[currentSent];
    var n = s.tokens.length;
    var chipPad = 16, chipGap = 6, chipH = 32;
    ctx.font = '12px "JetBrains Mono", monospace';
    var widths = [];
    var totalW = 0;
    for (var i = 0; i < n; i++) {
      var tw = ctx.measureText(s.tokens[i]).width + chipPad * 2;
      widths.push(tw);
      totalW += tw + chipGap;
    }
    totalW -= chipGap;
    var sx = Math.max(10, (680 - totalW) / 2);
    var tokenY = 350 - 80;
    var cx = sx;
    selectedToken = -1;
    for (var j = 0; j < n; j++) {
      if (mx >= cx && mx <= cx + widths[j] && my >= tokenY && my <= tokenY + chipH) {
        selectedToken = j;
        break;
      }
      cx += widths[j] + chipGap;
    }
    draw();
  });

  function switchSent(idx) {
    currentSent = idx;
    selectedToken = -1;
    [sent1Btn, sent2Btn, sent3Btn].forEach(function(b, i) {
      b.classList.toggle('active', i === idx);
    });
    draw();
  }

  sent1Btn.addEventListener('click', function() { switchSent(0); });
  sent2Btn.addEventListener('click', function() { switchSent(1); });
  sent3Btn.addEventListener('click', function() { switchSent(2); });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 6: Q/K/V Projection Flow -->
<script>
(function() {
  var canvas = document.getElementById('canvas-qkv');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 400);
  var info = document.getElementById('qkv-info');
  var step1 = document.getElementById('qkv-step1');
  var step2 = document.getElementById('qkv-step2');
  var step3 = document.getElementById('qkv-step3');
  var autoBtn = document.getElementById('qkv-auto');

  var currentStep = 0;
  var animId = null;
  var animProgress = 0;
  var autoRunning = false;

  var tokens = ['The', 'cat', 'sat', 'on'];
  var rng = TF.seededRandom(77);
  var X = [];
  for (var i = 0; i < 4; i++) {
    X[i] = [];
    for (var j = 0; j < 3; j++) X[i][j] = TF.round(rng() * 2 - 1, 2);
  }

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 400;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var boxW = 90, boxH = 130, gap = 30;

    // Input embeddings X
    var xLeft = 30;
    var xTop = 70;
    TF.drawRoundedRect(ctx, xLeft, xTop, boxW, boxH, 8, c.bg2, c.border);
    TF.drawText(ctx, 'X', xLeft + boxW / 2, xTop - 12, c.text, 13, 'center');
    TF.drawText(ctx, '(input)', xLeft + boxW / 2, xTop - 0, c.muted, 9, 'center');

    // Draw matrix values in X
    for (var r = 0; r < 4; r++) {
      for (var cc = 0; cc < 3; cc++) {
        TF.drawText(ctx, X[r][cc].toFixed(1), xLeft + 15 + cc * 25, xTop + 20 + r * 28, c.text, 9);
      }
      // Token label
      ctx.textAlign = 'right';
      ctx.fillStyle = c.muted;
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(tokens[r], xLeft - 4, xTop + 20 + r * 28);
      ctx.textAlign = 'center';
    }

    // Weight matrices (show at step 2+)
    if (currentStep >= 1) {
      var alpha = currentStep === 1 ? Math.min(1, animProgress * 2) : 1;
      ctx.globalAlpha = alpha;

      var wColors = [c.query, c.key, c.value];
      var wLabels = ['W^Q', 'W^K', 'W^V'];
      var wX = 170;
      var wW = 55, wH = 75;

      for (var w = 0; w < 3; w++) {
        var wy = xTop + w * (wH + 12) - 10;
        TF.drawRoundedRect(ctx, wX, wy, wW, wH, 6, wColors[w] + '22', wColors[w]);
        TF.drawText(ctx, wLabels[w], wX + wW / 2, wy + wH / 2, wColors[w], 11);

        // Arrow from X
        TF.drawArrow(ctx, xLeft + boxW + 4, xTop + boxH / 3 + w * 15, wX - 4, wy + wH / 2, c.muted, 1);
      }
      ctx.globalAlpha = 1;
    }

    // Output Q, K, V matrices (show at step 3)
    if (currentStep >= 2) {
      var alpha2 = currentStep === 2 ? Math.min(1, animProgress * 2) : 1;
      ctx.globalAlpha = alpha2;

      var outColors = [c.query, c.key, c.value];
      var outLabels = ['Q', 'K', 'V'];
      var outDescs = ['Query', 'Key', 'Value'];
      var outX = 290;
      var outW = 110, outH = 80;

      for (var o = 0; o < 3; o++) {
        var oy = xTop + o * (outH + 15) - 15;
        TF.drawRoundedRect(ctx, outX, oy, outW, outH, 8, outColors[o] + '18', outColors[o]);
        TF.drawText(ctx, outLabels[o] + ' = X × ' + ['W^Q', 'W^K', 'W^V'][o], outX + outW / 2, oy + 14, outColors[o], 10);
        TF.drawText(ctx, outDescs[o], outX + outW / 2, oy + outH - 12, c.muted, 9);

        // Arrow from weight
        var wX2 = 170 + 55;
        TF.drawArrow(ctx, wX2 + 4, xTop + o * 87 + 28, outX - 4, oy + outH / 2, outColors[o], 1.5);
      }

      // Descriptions on right
      var descX = outX + outW + 30;
      var descs = [
        '"What am I looking for?"',
        '"What do I contain?"',
        '"What info do I carry?"'
      ];
      for (var d = 0; d < 3; d++) {
        var dy = xTop + d * (outH + 15) - 15 + outH / 2;
        TF.drawText(ctx, descs[d], descX + 80, dy, outColors[d], 10);
      }
      ctx.globalAlpha = 1;
    }

    // Title
    var stepNames = ['Input embeddings X', 'Weight matrices W^Q, W^K, W^V', 'Q, K, V projections'];
    TF.drawText(ctx, 'Step ' + (currentStep + 1) + ': ' + stepNames[currentStep], W / 2, 30, c.text, 13);
  }

  function setStep(s) {
    currentStep = s;
    animProgress = 1;
    [step1, step2, step3].forEach(function(b, i) { b.classList.toggle('active', i === s); });
    draw();
  }

  step1.addEventListener('click', function() { setStep(0); });
  step2.addEventListener('click', function() { setStep(1); });
  step3.addEventListener('click', function() { setStep(2); });

  autoBtn.addEventListener('click', function() {
    if (autoRunning) return;
    autoRunning = true;
    currentStep = 0;
    animProgress = 0;
    var startTime = Date.now();
    function tick() {
      var elapsed = Date.now() - startTime;
      var phase = Math.floor(elapsed / 1500);
      animProgress = (elapsed % 1500) / 1500;
      if (phase >= 3) { autoRunning = false; currentStep = 2; animProgress = 1; draw(); return; }
      currentStep = Math.min(phase, 2);
      [step1, step2, step3].forEach(function(b, i) { b.classList.toggle('active', i === currentStep); });
      draw();
      animId = requestAnimationFrame(tick);
    }
    tick();
  });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 7: Attention Score Pipeline -->
<script>
(function() {
  var canvas = document.getElementById('canvas-attn-pipeline');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 380);
  var info = document.getElementById('ap-info');
  var btns = [
    document.getElementById('ap-step1'),
    document.getElementById('ap-step2'),
    document.getElementById('ap-step3'),
    document.getElementById('ap-step4'),
    document.getElementById('ap-full')
  ];
  var currentStep = 0;
  var hoverR = -1, hoverC = -1;

  var tokens = ['I', 'love', 'cats', 'too'];
  var dk = 3;
  var rng = TF.seededRandom(55);

  // Generate Q, K, V
  function genMat(rows, cols, seed) {
    var r = TF.seededRandom(seed);
    var m = [];
    for (var i = 0; i < rows; i++) {
      m[i] = [];
      for (var j = 0; j < cols; j++) m[i][j] = TF.round(r() * 2 - 1, 2);
    }
    return m;
  }

  var Q = genMat(4, 3, 101);
  var K = genMat(4, 3, 202);
  var V = genMat(4, 3, 303);

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
        out[r][c] = TF.round(s, 2);
      }
    }
    return out;
  }

  var KT = transpose(K);
  var scores = matMul(Q, KT);
  var scale = Math.sqrt(dk);
  var scaled = scores.map(function(row) { return row.map(function(v) { return TF.round(v / scale, 2); }); });
  var weights = scaled.map(function(row) { return TF.softmax(row); });
  var output = matMul(weights, V);

  function drawMatrix(mat, x, y, w, h, label, color, rlabels, clabels) {
    var rows = mat.length, cols = mat[0].length;
    var cellW = w / cols, cellH = h / rows;

    TF.drawRoundedRect(ctx, x - 2, y - 2, w + 4, h + 4, 6, null, color + '66');
    TF.drawText(ctx, label, x + w / 2, y - 14, color, 10);

    var minV = Infinity, maxV = -Infinity;
    for (var r = 0; r < rows; r++)
      for (var c = 0; c < cols; c++) {
        if (mat[r][c] < minV) minV = mat[r][c];
        if (mat[r][c] > maxV) maxV = mat[r][c];
      }

    var colors = TF.getColors();
    for (var rr = 0; rr < rows; rr++) {
      for (var cc = 0; cc < cols; cc++) {
        var cx = x + cc * cellW, cy = y + rr * cellH;
        var t = (mat[rr][cc] - minV) / (maxV - minV + 1e-8);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.1 + t * 0.4;
        ctx.fillRect(cx, cy, cellW - 1, cellH - 1);
        ctx.globalAlpha = 1;
        TF.drawText(ctx, TF.round(mat[rr][cc], 2).toFixed(2), cx + cellW / 2, cy + cellH / 2, colors.text, 8);
      }
    }
  }

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 380;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var mW = 100, mH = 80;
    var step = currentStep;

    // Always show Q and K^T
    drawMatrix(Q, 20, 50, mW, mH, 'Q', c.query);
    drawMatrix(KT, 20, 180, mW, mH, 'K^T', c.key);

    if (step >= 0) {
      // QK^T
      drawMatrix(scores, 170, 50, mW, mH, 'QK^T (raw)', c.attn);
      TF.drawArrow(ctx, 122, 90, 166, 90, c.muted, 1);
      TF.drawArrow(ctx, 122, 220, 166, 90, c.muted, 1);
    }
    if (step >= 1) {
      // Scaled
      drawMatrix(scaled, 310, 50, mW, mH, 'Scaled (÷√d)', c.orange);
      TF.drawArrow(ctx, 272, 90, 306, 90, c.muted, 1);
      TF.drawText(ctx, '÷ √' + dk, 289, 75, c.muted, 9);
    }
    if (step >= 2) {
      // Softmax
      drawMatrix(weights, 450, 50, mW, mH, 'Softmax', c.green);
      TF.drawArrow(ctx, 412, 90, 446, 90, c.muted, 1);
    }
    if (step >= 3) {
      // V and Output
      drawMatrix(V, 310, 220, mW, mH, 'V', c.value);
      drawMatrix(output, 560, 120, mW, mH, 'Output', c.purple);
      TF.drawArrow(ctx, 552, 90, 556, 120, c.muted, 1);
      TF.drawArrow(ctx, 412, 260, 556, 170, c.muted, 1);
      TF.drawText(ctx, '× V', 500, 150, c.muted, 10);
    }

    var stepLabels = ['Step 1: Compute raw scores QK^T', 'Step 2: Scale by √d_k', 'Step 3: Apply softmax (row-wise)', 'Step 4: Multiply by V → Output', 'Full attention pipeline'];
    TF.drawText(ctx, stepLabels[step], W / 2, 20, c.text, 12);
  }

  for (var bi = 0; bi < btns.length; bi++) {
    (function(idx) {
      btns[idx].addEventListener('click', function() {
        currentStep = idx === 4 ? 3 : idx;
        btns.forEach(function(b, i) { b.classList.toggle('active', i === idx); });
        draw();
      });
    })(bi);
  }

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 8: Softmax Transformation -->
<script>
(function() {
  var canvas = document.getElementById('canvas-softmax');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 260);
  var info = document.getElementById('sm-info');
  var sliders = ['sm-a', 'sm-b', 'sm-c', 'sm-d'].map(function(id) { return document.getElementById(id); });
  var vals = ['sm-a-val', 'sm-b-val', 'sm-c-val', 'sm-d-val'].map(function(id) { return document.getElementById(id); });

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 260;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var raw = sliders.map(function(s) { return parseFloat(s.value); });
    var probs = TF.softmax(raw);
    var labels = ['A', 'B', 'C', 'D'];

    var barW = 50, gap = 20;
    var groupW = 4 * barW + 3 * gap;

    // Raw scores (left half)
    var lx = 60;
    TF.drawText(ctx, 'Raw Scores', lx + groupW / 2, 20, c.text, 12);
    var maxRaw = Math.max.apply(null, raw.map(Math.abs));
    maxRaw = Math.max(maxRaw, 1);
    var barMaxH = 90;
    var baseline = 130;

    for (var i = 0; i < 4; i++) {
      var x = lx + i * (barW + gap);
      var h = Math.abs(raw[i]) / maxRaw * barMaxH;
      var barY = raw[i] >= 0 ? baseline - h : baseline;
      ctx.fillStyle = raw[i] >= 0 ? c.accent + '66' : c.red + '66';
      ctx.fillRect(x, barY, barW, h);
      ctx.strokeStyle = raw[i] >= 0 ? c.accent : c.red;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, barY, barW, h);
      TF.drawText(ctx, labels[i], x + barW / 2, baseline + 18, c.text, 11);
      TF.drawText(ctx, raw[i].toFixed(1), x + barW / 2, baseline + 35, c.muted, 10);
    }

    // baseline
    ctx.beginPath();
    ctx.moveTo(lx - 5, baseline);
    ctx.lineTo(lx + groupW + 5, baseline);
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Arrow
    TF.drawArrow(ctx, lx + groupW + 20, H / 2, lx + groupW + 60, H / 2, c.muted, 2);
    TF.drawText(ctx, 'softmax', lx + groupW + 40, H / 2 - 14, c.muted, 9);

    // Softmax probabilities (right half)
    var rx = lx + groupW + 75;
    TF.drawText(ctx, 'Probabilities', rx + groupW / 2, 20, c.text, 12);
    var probBaseline = baseline;

    for (var j = 0; j < 4; j++) {
      var px = rx + j * (barW + gap);
      var ph = probs[j] * barMaxH;
      ctx.fillStyle = c.green + '66';
      ctx.fillRect(px, probBaseline - ph, barW, ph);
      ctx.strokeStyle = c.green;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px, probBaseline - ph, barW, ph);
      TF.drawText(ctx, labels[j], px + barW / 2, probBaseline + 18, c.text, 11);
      TF.drawText(ctx, TF.round(probs[j], 3).toFixed(3), px + barW / 2, probBaseline + 35, c.muted, 10);
    }

    ctx.beginPath();
    ctx.moveTo(rx - 5, probBaseline);
    ctx.lineTo(rx + groupW + 5, probBaseline);
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    ctx.stroke();

    TF.drawText(ctx, 'Sum = ' + TF.round(probs.reduce(function(a, b) { return a + b; }, 0), 3).toFixed(3), rx + groupW / 2, H - 20, c.muted, 10);
  }

  sliders.forEach(function(s, i) {
    s.addEventListener('input', function() {
      vals[i].textContent = parseFloat(s.value).toFixed(1);
      draw();
    });
  });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 9: Multi-Head Comparison -->
<script>
(function() {
  var c1 = document.getElementById('canvas-head1');
  var c2 = document.getElementById('canvas-head2');
  var c3 = document.getElementById('canvas-head3');
  if (!c1 || !c2 || !c3) return;
  var ctx1 = TF.setupCanvas(c1, 210, 210);
  var ctx2 = TF.setupCanvas(c2, 210, 210);
  var ctx3 = TF.setupCanvas(c3, 210, 210);

  var sent1Btn = document.getElementById('mh-sent1');
  var sent2Btn = document.getElementById('mh-sent2');
  var info = document.getElementById('mh-info');

  var examples = [
    { tokens: ['The', 'cat', 'sat', 'on', 'mat'],
      heads: [
        [[0.5,0.3,0.1,0.05,0.05],[0.2,0.4,0.25,0.1,0.05],[0.05,0.25,0.4,0.2,0.1],[0.05,0.1,0.25,0.4,0.2],[0.05,0.05,0.1,0.3,0.5]],
        [[0.3,0.1,0.3,0.2,0.1],[0.1,0.3,0.1,0.1,0.4],[0.3,0.1,0.3,0.2,0.1],[0.2,0.1,0.2,0.3,0.2],[0.1,0.4,0.1,0.2,0.2]],
        [[0.3,0.3,0.1,0.1,0.2],[0.15,0.3,0.15,0.1,0.3],[0.1,0.15,0.3,0.15,0.3],[0.1,0.1,0.15,0.35,0.3],[0.2,0.3,0.15,0.15,0.2]]
      ]},
    { tokens: ['I', 'love', 'deep', 'learn', 'ing'],
      heads: [
        [[0.5,0.3,0.1,0.05,0.05],[0.25,0.4,0.2,0.1,0.05],[0.05,0.2,0.45,0.2,0.1],[0.05,0.1,0.2,0.45,0.2],[0.05,0.05,0.1,0.25,0.55]],
        [[0.4,0.2,0.1,0.2,0.1],[0.2,0.2,0.2,0.2,0.2],[0.1,0.1,0.3,0.3,0.2],[0.1,0.2,0.3,0.2,0.2],[0.1,0.1,0.2,0.3,0.3]],
        [[0.2,0.3,0.2,0.2,0.1],[0.1,0.2,0.3,0.3,0.1],[0.1,0.1,0.2,0.4,0.2],[0.1,0.2,0.3,0.2,0.2],[0.2,0.1,0.2,0.2,0.3]]
      ]}
  ];

  var currentEx = 0;

  function drawHeatmap(ctx, matrix, tokens, W, H) {
    var c = TF.getColors();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var n = tokens.length;
    var margin = 35;
    var cellSize = (W - margin - 10) / n;

    for (var r = 0; r < n; r++) {
      for (var col = 0; col < n; col++) {
        var x = margin + col * cellSize;
        var y = margin + r * cellSize;
        var v = matrix[r][col];

        ctx.fillStyle = c.accent;
        ctx.globalAlpha = 0.08 + v * 0.85;
        ctx.fillRect(x, y, cellSize - 1, cellSize - 1);
        ctx.globalAlpha = 1;

        TF.drawText(ctx, TF.round(v, 2).toFixed(2), x + cellSize / 2, y + cellSize / 2, c.text, 7.5);
      }
    }

    // Labels
    ctx.font = '8px "JetBrains Mono", monospace';
    for (var t = 0; t < n; t++) {
      ctx.textAlign = 'right';
      ctx.fillStyle = c.muted;
      ctx.fillText(tokens[t], margin - 4, margin + t * cellSize + cellSize / 2 + 3);
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(margin + t * cellSize + cellSize / 2, margin - 5);
      ctx.rotate(-0.5);
      ctx.fillText(tokens[t], 0, 0);
      ctx.restore();
    }
    ctx.textAlign = 'center';
  }

  function draw() {
    var ex = examples[currentEx];
    drawHeatmap(ctx1, ex.heads[0], ex.tokens, 210, 210);
    drawHeatmap(ctx2, ex.heads[1], ex.tokens, 210, 210);
    drawHeatmap(ctx3, ex.heads[2], ex.tokens, 210, 210);
  }

  sent1Btn.addEventListener('click', function() { currentEx = 0; sent1Btn.classList.add('active'); sent2Btn.classList.remove('active'); draw(); });
  sent2Btn.addEventListener('click', function() { currentEx = 1; sent2Btn.classList.add('active'); sent1Btn.classList.remove('active'); draw(); });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 10: Residual Connection Flow -->
<script>
(function() {
  var canvas = document.getElementById('canvas-residual');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 300);
  var info = document.getElementById('res-info');
  var withBtn = document.getElementById('res-with');
  var withoutBtn = document.getElementById('res-without');
  var layerSlider = document.getElementById('res-layers');
  var layerVal = document.getElementById('res-layers-val');

  var useResidual = true;

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 300;
    var nLayers = parseInt(layerSlider.value);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var margin = 60;
    var plotW = W - 2 * margin;
    var plotH = H - 100;
    var barW = Math.min(40, (plotW - (nLayers) * 8) / (nLayers + 1));
    var baseline = 70;

    TF.drawText(ctx, useResidual ? 'Signal Strength WITH Residual' : 'Signal Strength WITHOUT Residual',
      W / 2, 25, c.text, 12);

    // Simulate signal degradation
    var signals = [1.0];
    for (var l = 0; l < nLayers; l++) {
      var prev = signals[l];
      if (useResidual) {
        signals.push(Math.max(0.3, prev * 0.85 + 0.15));
      } else {
        signals.push(prev * 0.65);
      }
    }

    // Draw bars
    for (var i = 0; i <= nLayers; i++) {
      var x = margin + i * ((plotW) / nLayers);
      var h = signals[i] * plotH;
      var y = baseline + plotH - h;

      var barColor = useResidual ? c.green : (signals[i] < 0.3 ? c.red : c.orange);
      ctx.fillStyle = barColor + '55';
      ctx.fillRect(x - barW / 2, y, barW, h);
      ctx.strokeStyle = barColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - barW / 2, y, barW, h);

      TF.drawText(ctx, TF.round(signals[i], 2).toFixed(2), x, y - 12, c.text, 9);
      TF.drawText(ctx, i === 0 ? 'Input' : 'L' + i, x, baseline + plotH + 18, c.muted, 9);
    }

    // Baseline
    ctx.beginPath();
    ctx.moveTo(margin - 20, baseline + plotH);
    ctx.lineTo(W - margin + 20, baseline + plotH);
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    ctx.stroke();

    var finalSig = signals[nLayers];
    info.textContent = useResidual
      ? 'After ' + nLayers + ' layers: signal strength = ' + TF.round(finalSig, 2) + ' (well preserved)'
      : 'After ' + nLayers + ' layers: signal strength = ' + TF.round(finalSig, 4) + (finalSig < 0.1 ? ' (severely degraded!)' : '');
  }

  withBtn.addEventListener('click', function() { useResidual = true; withBtn.classList.add('active'); withoutBtn.classList.remove('active'); draw(); });
  withoutBtn.addEventListener('click', function() { useResidual = false; withoutBtn.classList.add('active'); withBtn.classList.remove('active'); draw(); });
  layerSlider.addEventListener('input', function() { layerVal.textContent = layerSlider.value; draw(); });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 11: Transformer Block Diagram -->
<script>
(function() {
  var canvas = document.getElementById('canvas-block');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 480);
  var info = document.getElementById('block-info');
  var layerSlider = document.getElementById('block-layer');
  var layerVal = document.getElementById('block-layer-val');
  var animBtn = document.getElementById('block-animate');
  var resetBtn = document.getElementById('block-reset');

  var animProgress = -1;
  var animId = null;

  var components = [
    { label: 'Input Embeddings', y: 430, color: 'embed', desc: 'Token + Position vectors' },
    { label: 'Multi-Head Attention', y: 350, color: 'attn', desc: 'Tokens attend to each other' },
    { label: 'Add & Norm', y: 290, color: 'green', desc: 'Residual + LayerNorm' },
    { label: 'Feed-Forward', y: 220, color: 'purple', desc: 'Per-token MLP (expand + contract)' },
    { label: 'Add & Norm', y: 160, color: 'green', desc: 'Residual + LayerNorm' },
    { label: 'Output', y: 90, color: 'accent', desc: 'Enriched representations' }
  ];

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 480;
    var nLayers = parseInt(layerSlider.value);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    TF.drawText(ctx, 'Transformer Block × ' + nLayers, W / 2, 25, c.text, 13);

    var boxW = 220, centerX = W / 2;

    for (var i = 0; i < components.length; i++) {
      var comp = components[i];
      var col = c[comp.color] || c.accent;
      var lit = animProgress >= 0 && i <= Math.floor(animProgress * components.length);

      TF.drawRoundedRect(ctx, centerX - boxW / 2, comp.y - 20, boxW, 40, 8,
        lit ? col + '33' : c.bg2, lit ? col : c.border);
      TF.drawText(ctx, comp.label, centerX, comp.y, lit ? col : c.text, 11);
      TF.drawText(ctx, comp.desc, centerX + boxW / 2 + 15, comp.y, c.muted, 9, 'left');

      // Arrow to next
      if (i < components.length - 1) {
        TF.drawArrow(ctx, centerX, comp.y - 22, centerX, components[i + 1].y + 22, c.muted, 1);
      }

      // Residual skip arrows
      if (i === 1) {
        // skip from input to add&norm
        ctx.beginPath();
        ctx.moveTo(centerX - boxW / 2 - 15, components[0].y);
        ctx.lineTo(centerX - boxW / 2 - 15, components[2].y);
        ctx.strokeStyle = c.green + '88';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        TF.drawArrow(ctx, centerX - boxW / 2 - 15, components[2].y, centerX - boxW / 2 - 2, components[2].y, c.green + '88', 1);
      }
      if (i === 3) {
        ctx.beginPath();
        ctx.moveTo(centerX - boxW / 2 - 15, components[2].y);
        ctx.lineTo(centerX - boxW / 2 - 15, components[4].y);
        ctx.strokeStyle = c.green + '88';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        TF.drawArrow(ctx, centerX - boxW / 2 - 15, components[4].y, centerX - boxW / 2 - 2, components[4].y, c.green + '88', 1);
      }
    }

    // Layer stacking indicator
    if (nLayers > 1) {
      TF.drawText(ctx, '×' + nLayers + ' blocks stacked', centerX, H - 20, c.muted, 10);
    }
  }

  animBtn.addEventListener('click', function() {
    animProgress = 0;
    var start = Date.now();
    function tick() {
      animProgress = Math.min(1, (Date.now() - start) / 2000);
      draw();
      if (animProgress < 1) animId = requestAnimationFrame(tick);
    }
    tick();
  });

  resetBtn.addEventListener('click', function() {
    if (animId) cancelAnimationFrame(animId);
    animProgress = -1;
    draw();
  });

  layerSlider.addEventListener('input', function() { layerVal.textContent = layerSlider.value; draw(); });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 12: Encoder vs Decoder -->
<script>
(function() {
  var canvasEnc = document.getElementById('canvas-encoder');
  var canvasDec = document.getElementById('canvas-decoder');
  if (!canvasEnc || !canvasDec) return;
  var ctxE = TF.setupCanvas(canvasEnc, 330, 420);
  var ctxD = TF.setupCanvas(canvasDec, 330, 420);
  var info = document.getElementById('ed-info');
  var fullBtn = document.getElementById('ed-full');
  var encBtn = document.getElementById('ed-enc');
  var decBtn = document.getElementById('ed-dec');

  var mode = 'full'; // full, enc, dec

  function drawStack(ctx, W, H, type, active) {
    var c = TF.getColors();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var centerX = W / 2;
    var boxW = 180;
    var dimmed = !active;

    if (dimmed) {
      ctx.globalAlpha = 0.25;
    }

    if (type === 'encoder') {
      var eComps = [
        { label: 'Input Embedding', y: 380, color: c.embed },
        { label: 'Self-Attention', y: 310, color: c.attn },
        { label: 'Add & Norm', y: 260, color: c.green },
        { label: 'Feed-Forward', y: 200, color: c.purple },
        { label: 'Add & Norm', y: 150, color: c.green },
        { label: 'Encoder Output', y: 80, color: c.accent }
      ];
      TF.drawText(ctx, 'ENCODER', centerX, 30, c.text, 13);

      for (var i = 0; i < eComps.length; i++) {
        TF.drawRoundedRect(ctx, centerX - boxW / 2, eComps[i].y - 18, boxW, 36, 7, eComps[i].color + '22', eComps[i].color);
        TF.drawText(ctx, eComps[i].label, centerX, eComps[i].y, c.text, 10);
        if (i < eComps.length - 1) TF.drawArrow(ctx, centerX, eComps[i].y - 20, centerX, eComps[i + 1].y + 20, c.muted, 1);
      }
    } else {
      var dComps = [
        { label: 'Output Embedding', y: 380, color: c.embed },
        { label: 'Masked Self-Attn', y: 310, color: c.red },
        { label: 'Add & Norm', y: 265, color: c.green },
        { label: 'Cross-Attention', y: 210, color: c.yellow },
        { label: 'Add & Norm', y: 165, color: c.green },
        { label: 'Feed-Forward', y: 120, color: c.purple },
        { label: 'Add & Norm', y: 80, color: c.green },
        { label: 'Linear + Softmax', y: 40, color: c.accent }
      ];
      TF.drawText(ctx, 'DECODER', centerX, 15, c.text, 13);

      for (var j = 0; j < dComps.length; j++) {
        var isCA = dComps[j].label === 'Cross-Attention';
        if (mode === 'dec' && isCA) {
          ctx.globalAlpha = 0.15;
        }
        TF.drawRoundedRect(ctx, centerX - boxW / 2, dComps[j].y - 16, boxW, 32, 7, dComps[j].color + '22', dComps[j].color);
        TF.drawText(ctx, dComps[j].label, centerX, dComps[j].y, c.text, 9.5);
        if (mode === 'dec' && isCA) ctx.globalAlpha = dimmed ? 0.25 : 1;
        if (j < dComps.length - 1) TF.drawArrow(ctx, centerX, dComps[j].y - 18, centerX, dComps[j + 1].y + 18, c.muted, 1);
      }
    }

    ctx.globalAlpha = 1;
  }

  function draw() {
    var showEnc = mode === 'full' || mode === 'enc';
    var showDec = mode === 'full' || mode === 'dec';
    drawStack(ctxE, 330, 420, 'encoder', showEnc);
    drawStack(ctxD, 330, 420, 'decoder', showDec);

    var descs = {
      full: 'Encoder-Decoder: Full architecture with cross-attention connecting encoder output to decoder.',
      enc: 'Encoder-Only (BERT): Bidirectional understanding. No generation. Used for classification, NER, embeddings.',
      dec: 'Decoder-Only (GPT): Autoregressive generation. No cross-attention. Most modern LLMs use this.'
    };
    info.textContent = descs[mode];
  }

  fullBtn.addEventListener('click', function() { mode = 'full'; fullBtn.classList.add('active'); encBtn.classList.remove('active'); decBtn.classList.remove('active'); draw(); });
  encBtn.addEventListener('click', function() { mode = 'enc'; encBtn.classList.add('active'); fullBtn.classList.remove('active'); decBtn.classList.remove('active'); draw(); });
  decBtn.addEventListener('click', function() { mode = 'dec'; decBtn.classList.add('active'); fullBtn.classList.remove('active'); encBtn.classList.remove('active'); draw(); });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 13: Causal Mask -->
<script>
(function() {
  var canvas = document.getElementById('canvas-mask');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 340);
  var info = document.getElementById('mask-info');
  var causalBtn = document.getElementById('mask-causal');
  var bidirBtn = document.getElementById('mask-bidir');
  var lenSlider = document.getElementById('mask-len');
  var lenVal = document.getElementById('mask-len-val');

  var isCausal = true;

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 340;
    var n = parseInt(lenSlider.value);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    TF.drawText(ctx, isCausal ? 'Causal Mask (Decoder / GPT)' : 'No Mask (Encoder / BERT)', W / 2, 25, c.text, 13);

    var margin = 60;
    var matSize = Math.min(250, H - 90);
    var cellSize = matSize / n;
    var ox = (W - matSize) / 2;
    var oy = 50;

    for (var r = 0; r < n; r++) {
      for (var col = 0; col < n; col++) {
        var x = ox + col * cellSize;
        var y = oy + r * cellSize;
        var blocked = isCausal && col > r;

        ctx.fillStyle = blocked ? c.blocked : c.allowed;
        ctx.fillRect(x, y, cellSize - 1, cellSize - 1);

        if (blocked) {
          // Draw X
          ctx.strokeStyle = c.red;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + 3, y + 3);
          ctx.lineTo(x + cellSize - 4, y + cellSize - 4);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + cellSize - 4, y + 3);
          ctx.lineTo(x + 3, y + cellSize - 4);
          ctx.stroke();
        } else {
          TF.drawText(ctx, '✓', x + cellSize / 2, y + cellSize / 2, c.green, Math.min(12, cellSize * 0.5));
        }
      }
    }

    // Labels
    for (var t = 0; t < n; t++) {
      TF.drawText(ctx, 't' + t, ox + t * cellSize + cellSize / 2, oy + matSize + 14, c.muted, 8);
      ctx.textAlign = 'right';
      ctx.fillStyle = c.muted;
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText('t' + t, ox - 6, oy + t * cellSize + cellSize / 2 + 3);
      ctx.textAlign = 'center';
    }

    TF.drawText(ctx, '← Key tokens', W / 2, oy + matSize + 30, c.muted, 9);
    ctx.save();
    ctx.translate(ox - 25, oy + matSize / 2);
    ctx.rotate(-Math.PI / 2);
    TF.drawText(ctx, 'Query tokens →', 0, 0, c.muted, 9);
    ctx.restore();

    var allowed = 0, blocked2 = 0;
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      if (isCausal && j > i) blocked2++; else allowed++;
    }
    info.textContent = isCausal
      ? 'Causal: ' + allowed + ' allowed, ' + blocked2 + ' blocked. Each token sees only past + self.'
      : 'Bidirectional: All ' + (n * n) + ' positions visible. Full context in both directions.';
  }

  causalBtn.addEventListener('click', function() { isCausal = true; causalBtn.classList.add('active'); bidirBtn.classList.remove('active'); draw(); });
  bidirBtn.addEventListener('click', function() { isCausal = false; bidirBtn.classList.add('active'); causalBtn.classList.remove('active'); draw(); });
  lenSlider.addEventListener('input', function() { lenVal.textContent = lenSlider.value; draw(); });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 14: Next-Token Generation Loop -->
<script>
(function() {
  var canvas = document.getElementById('canvas-generation');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 360);
  var info = document.getElementById('gen-info');
  var promptInput = document.getElementById('gen-prompt');
  var nextBtn = document.getElementById('gen-next');
  var autoBtn = document.getElementById('gen-auto');
  var resetBtn = document.getElementById('gen-reset');
  var maxSlider = document.getElementById('gen-max');
  var maxVal = document.getElementById('gen-max-val');

  var vocab = ['is', 'a', 'model', 'that', 'uses', 'attention', 'to', 'process', 'sequences', 'of', 'tokens', 'in', 'parallel', 'for', 'language', 'understanding', '.', 'The', 'architecture', 'was'];
  var generated = [];
  var currentProbs = [];
  var autoRunning = false;
  var autoId = null;
  var rng = TF.seededRandom(42);

  function genProbs() {
    var probs = [];
    var r = TF.seededRandom(generated.length * 7 + 13);
    for (var i = 0; i < vocab.length; i++) probs.push(r() * 3 - 0.5);
    return TF.softmax(probs);
  }

  function sampleToken() {
    currentProbs = genProbs();
    var r = rng();
    var cum = 0;
    for (var i = 0; i < currentProbs.length; i++) {
      cum += currentProbs[i];
      if (r <= cum) return i;
    }
    return currentProbs.length - 1;
  }

  function generateOne() {
    var maxT = parseInt(maxSlider.value);
    if (generated.length >= maxT) { info.textContent = 'Max tokens reached.'; return false; }
    var idx = sampleToken();
    generated.push(vocab[idx]);
    draw();
    return true;
  }

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 360;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Prompt + generated tokens
    var prompt = promptInput.value;
    var promptTokens = prompt.split(/\s+/);
    var allTokens = promptTokens.concat(generated);

    // Token row at top
    var chipH = 26, chipGap = 4;
    var cx = 15, cy = 15;
    ctx.font = '10px "JetBrains Mono", monospace';

    for (var i = 0; i < allTokens.length; i++) {
      var tw = ctx.measureText(allTokens[i]).width + 14;
      if (cx + tw > W - 15) { cx = 15; cy += chipH + 6; }
      var isGenerated = i >= promptTokens.length;
      var isLast = i === allTokens.length - 1 && isGenerated;

      TF.drawRoundedRect(ctx, cx, cy, tw, chipH, chipH / 2,
        isLast ? c.accent + '33' : (isGenerated ? c.green + '22' : c.bg2),
        isLast ? c.accent : (isGenerated ? c.green : c.border));
      TF.drawText(ctx, allTokens[i], cx + tw / 2, cy + chipH / 2,
        isGenerated ? c.green : c.text, 10);
      cx += tw + chipGap;
    }

    // Probability bar chart
    if (currentProbs.length > 0) {
      var barArea = W - 40;
      var barW = Math.min(28, (barArea - (vocab.length - 1) * 3) / vocab.length);
      var barMaxH = 120;
      var barY = H - 40;
      var bx = 20;

      TF.drawText(ctx, 'Next token probabilities:', W / 2, barY - barMaxH - 25, c.muted, 10);

      var maxP = Math.max.apply(null, currentProbs);
      for (var j = 0; j < Math.min(vocab.length, 15); j++) {
        var x = bx + j * (barW + 3);
        var h = (currentProbs[j] / maxP) * barMaxH;

        ctx.fillStyle = c.accent + '55';
        ctx.fillRect(x, barY - h, barW, h);
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, barY - h, barW, h);

        ctx.save();
        ctx.translate(x + barW / 2, barY + 4);
        ctx.rotate(Math.PI / 4);
        ctx.textAlign = 'left';
        ctx.fillStyle = c.muted;
        ctx.font = '7px "JetBrains Mono", monospace';
        ctx.fillText(vocab[j], 0, 0);
        ctx.restore();
        ctx.textAlign = 'center';
      }
    }

    info.textContent = 'Generated ' + generated.length + ' tokens. Prompt: "' + prompt + '"';
  }

  nextBtn.addEventListener('click', function() { generateOne(); });
  autoBtn.addEventListener('click', function() {
    if (autoRunning) { autoRunning = false; clearInterval(autoId); return; }
    autoRunning = true;
    autoId = setInterval(function() {
      if (!generateOne()) { autoRunning = false; clearInterval(autoId); }
    }, 500);
  });
  resetBtn.addEventListener('click', function() {
    autoRunning = false;
    if (autoId) clearInterval(autoId);
    generated = [];
    currentProbs = [];
    rng = TF.seededRandom(42);
    draw();
  });
  maxSlider.addEventListener('input', function() { maxVal.textContent = maxSlider.value; });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 15: Temperature / Sampling -->
<script>
(function() {
  var canvas = document.getElementById('canvas-temperature');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 300);
  var info = document.getElementById('temp-info');
  var tempSlider = document.getElementById('temp-t');
  var tempVal = document.getElementById('temp-t-val');
  var topkSlider = document.getElementById('temp-k');
  var topkVal = document.getElementById('temp-k-val');
  var toppSlider = document.getElementById('temp-p');
  var toppVal = document.getElementById('temp-p-val');
  var sampleBtn = document.getElementById('temp-sample');

  var vocab = ['is', 'the', 'a', 'was', 'model', 'uses', 'for', 'to', 'that', 'in'];
  var baseLogits = [3.2, 2.8, 2.1, 1.5, 1.2, 0.8, 0.3, -0.2, -0.8, -1.5];
  var sampledIdx = -1;

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 300;
    var temp = parseFloat(tempSlider.value);
    var topk = parseInt(topkSlider.value);
    var topp = parseFloat(toppSlider.value);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Apply temperature
    var scaled = baseLogits.map(function(v) { return v / temp; });
    var probs = TF.softmax(scaled);

    // Apply top-k
    var indices = [];
    for (var i = 0; i < probs.length; i++) indices.push(i);
    indices.sort(function(a, b) { return probs[b] - probs[a]; });
    var eligible = [];
    for (var j = 0; j < probs.length; j++) eligible.push(j < topk);

    // Apply top-p
    var cumProb = 0;
    for (var k = 0; k < indices.length; k++) {
      if (cumProb < topp) { eligible[indices[k]] = eligible[indices[k]] && true; }
      else { eligible[indices[k]] = false; }
      cumProb += probs[indices[k]];
    }

    // Draw bars
    var barW = 45, gap = 15;
    var totalW = vocab.length * barW + (vocab.length - 1) * gap;
    var sx = (W - totalW) / 2;
    var barMaxH = 150;
    var baseline = 220;
    var maxP = Math.max.apply(null, probs);

    TF.drawText(ctx, 'Temperature: ' + temp.toFixed(1) + '  |  Top-k: ' + topk + '  |  Top-p: ' + topp.toFixed(2), W / 2, 22, c.text, 11);

    for (var b = 0; b < vocab.length; b++) {
      var x = sx + b * (barW + gap);
      var h = (probs[b] / maxP) * barMaxH;
      var isEligible = eligible[b];
      var isSampled = b === sampledIdx;

      ctx.fillStyle = isSampled ? c.green + '77' : (isEligible ? c.accent + '44' : c.muted + '22');
      ctx.fillRect(x, baseline - h, barW, h);
      ctx.strokeStyle = isSampled ? c.green : (isEligible ? c.accent : c.muted + '44');
      ctx.lineWidth = isSampled ? 2.5 : 1.5;
      ctx.strokeRect(x, baseline - h, barW, h);

      TF.drawText(ctx, vocab[b], x + barW / 2, baseline + 16, isEligible ? c.text : c.muted, 9);
      TF.drawText(ctx, TF.round(probs[b], 3).toFixed(3), x + barW / 2, baseline + 32, isEligible ? c.text : c.muted, 8);

      if (!isEligible) {
        ctx.beginPath();
        ctx.moveTo(x, baseline - h);
        ctx.lineTo(x + barW, baseline);
        ctx.strokeStyle = c.red + '44';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Baseline
    ctx.beginPath();
    ctx.moveTo(sx - 10, baseline);
    ctx.lineTo(sx + totalW + 10, baseline);
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    ctx.stroke();

    if (sampledIdx >= 0) {
      TF.drawText(ctx, 'Sampled: "' + vocab[sampledIdx] + '"', W / 2, H - 15, c.green, 11);
    }
  }

  sampleBtn.addEventListener('click', function() {
    var temp = parseFloat(tempSlider.value);
    var topk = parseInt(topkSlider.value);
    var topp = parseFloat(toppSlider.value);
    var scaled = baseLogits.map(function(v) { return v / temp; });
    var probs = TF.softmax(scaled);

    // Filter
    var indices = [];
    for (var i = 0; i < probs.length; i++) indices.push(i);
    indices.sort(function(a, b) { return probs[b] - probs[a]; });
    var eligible = [];
    for (var j = 0; j < probs.length; j++) eligible.push(j < topk);
    var cumProb = 0;
    for (var k = 0; k < indices.length; k++) {
      if (cumProb >= topp) eligible[indices[k]] = false;
      cumProb += probs[indices[k]];
    }

    // Renormalize
    var filteredProbs = probs.map(function(p, i) { return eligible[i] ? p : 0; });
    var sum = filteredProbs.reduce(function(a, b) { return a + b; }, 0);
    if (sum > 0) filteredProbs = filteredProbs.map(function(p) { return p / sum; });

    // Sample
    var r = Math.random(), cum = 0;
    sampledIdx = filteredProbs.length - 1;
    for (var s = 0; s < filteredProbs.length; s++) {
      cum += filteredProbs[s];
      if (r <= cum) { sampledIdx = s; break; }
    }
    draw();
  });

  tempSlider.addEventListener('input', function() { tempVal.textContent = parseFloat(tempSlider.value).toFixed(1); sampledIdx = -1; draw(); });
  topkSlider.addEventListener('input', function() { topkVal.textContent = topkSlider.value; sampledIdx = -1; draw(); });
  toppSlider.addEventListener('input', function() { toppVal.textContent = parseFloat(toppSlider.value).toFixed(2); sampledIdx = -1; draw(); });

  draw();
  TF.onThemeChange(draw);
})();
</script>

<!-- Demo 16: Quadratic Cost -->
<script>
(function() {
  var canvas = document.getElementById('canvas-quadratic');
  if (!canvas) return;
  var ctx = TF.setupCanvas(canvas, 680, 300);
  var info = document.getElementById('quad-info');
  var nSlider = document.getElementById('quad-n');
  var nVal = document.getElementById('quad-n-val');

  function draw() {
    var c = TF.getColors();
    var W = 680, H = 300;
    var n = parseInt(nSlider.value);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var margin = { top: 40, left: 65, right: 30, bottom: 50 };
    var plotW = W - margin.left - margin.right;
    var plotH = H - margin.top - margin.bottom;

    TF.drawText(ctx, 'Computational Cost: O(n) vs O(n²)', W / 2, 18, c.text, 12);

    // Axes
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + plotH);
    ctx.lineTo(margin.left + plotW, margin.top + plotH);
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    var maxN = 16384;
    var maxOps = maxN * maxN;

    // Plot lines
    var points = 200;
    function toX(val) { return margin.left + (val / maxN) * plotW; }
    function toY(val) { return margin.top + plotH - (val / maxOps) * plotH; }

    // O(n) FFN
    ctx.beginPath();
    for (var i = 0; i <= points; i++) {
      var x = (i / points) * maxN;
      var px = toX(x), py = toY(x * 768); // scale for visibility
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = c.green;
    ctx.lineWidth = 2;
    ctx.stroke();

    // O(n^2) attention
    ctx.beginPath();
    for (var j = 0; j <= points; j++) {
      var x2 = (j / points) * maxN;
      var px2 = toX(x2), py2 = toY(x2 * x2);
      if (j === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
    }
    ctx.strokeStyle = c.red;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current n indicator
    var curX = toX(n);
    ctx.beginPath();
    ctx.moveTo(curX, margin.top);
    ctx.lineTo(curX, margin.top + plotH);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Legend
    TF.drawText(ctx, '— O(n²) Attention', W - 130, margin.top + 15, c.red, 10);
    TF.drawText(ctx, '— O(n) FFN', W - 130, margin.top + 32, c.green, 10);

    // Axis labels
    TF.drawText(ctx, 'Sequence length (n)', W / 2, H - 8, c.muted, 10);
    ctx.save();
    ctx.translate(14, H / 2);
    ctx.rotate(-Math.PI / 2);
    TF.drawText(ctx, 'Operations', 0, 0, c.muted, 10);
    ctx.restore();

    var attnOps = n * n;
    var ffnOps = n * 768;
    info.textContent = 'n=' + n + ': Attention = ' + attnOps.toLocaleString() + ' ops | FFN = ' + ffnOps.toLocaleString() + ' ops | Ratio: ' + TF.round(attnOps / ffnOps, 1) + '×';
  }

  nSlider.addEventListener('input', function() { nVal.textContent = nSlider.value; draw(); });

  draw();
  TF.onThemeChange(draw);
})();
</script>
