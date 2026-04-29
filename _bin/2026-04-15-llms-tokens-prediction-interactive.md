---
layout: post
title: "LLMs from Scratch I: Tokens, Text, and the Prediction Game"
author: bharathikannan
categories: [Machine learning, LLMs]
series: False
hidden: False
description: "Open the hood of a language model. See how raw text turns into token IDs, how vocabularies are built, and how the whole job of an LLM boils down to one game: guess the next token. With interactive tokenizers, vocabulary explorers, and a tiny live next-token predictor."
image: assets/images/linear-regression-math/linear-regression-banner.jpg
permalink: /llms-tokens-prediction/
date: 2026-04-15
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
.demo-controls input[type="text"], .demo-controls textarea {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}
.demo-controls textarea { width: 100%; min-height: 70px; resize: vertical; }
.demo-controls select {
  font-size: 0.85rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
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
.demo-controls button:hover { background: var(--accent); color: var(--bg-primary); }
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
.demo-caption {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.4rem;
}
.demo-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0.4rem 0 0.6rem;
  font-style: italic;
}
.demo-try {
  margin-top: 0.6rem;
  padding: 0.55rem 0.75rem;
  border: 1px dashed var(--border);
  border-radius: 8px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  background: var(--bg-primary);
}
.token-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-primary);
  border-radius: 8px;
  min-height: 36px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
}
.token-chip {
  padding: 3px 7px;
  border-radius: 5px;
  white-space: pre;
  color: #1a1b26;
  font-weight: 600;
  font-size: 0.85rem;
  position: relative;
  cursor: default;
}
.token-chip .tid {
  font-size: 0.65rem;
  margin-left: 4px;
  opacity: 0.65;
  font-weight: 500;
}
.tok-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-top: 0.5rem;
}
@media (max-width: 600px) { .tok-stats { grid-template-columns: 1fr; } }
.tok-stat {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 0.55rem 0.7rem;
  text-align: center;
}
.tok-stat .num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent);
}
.tok-stat .lab {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
}
.demo-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
@media (max-width: 700px) { .demo-split { grid-template-columns: 1fr; } }
.references {
  list-style: decimal;
  margin: 0.75rem 0 0;
  padding-left: 1.2rem;
}
.references li { margin: 0.55rem 0; line-height: 1.5; }
.references a { word-break: break-word; }
.flow-step {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 0.5rem 0.7rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  margin: 0.3rem 0;
  border-left: 3px solid var(--accent);
}
.demo-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-top: 0.5rem; }
</style>

<script>
// Shared utilities for the LLMs from Scratch series.
// Reused across posts: color palette, canvas DPR setup, theme listener, tokenizers, math helpers.
window.LLM = window.LLM || (function() {
  var themeListeners = [];
  var observer = null;

  function getColors() { return window.Viz.colors(); }

  // A small fixed palette used to color tokens consistently by ID.
  var PALETTE = [
    '#fbbf24', '#a78bfa', '#34d399', '#f472b6', '#60a5fa', '#fb923c',
    '#facc15', '#4ade80', '#f87171', '#22d3ee', '#c084fc', '#fdba74',
    '#86efac', '#93c5fd', '#fcd34d', '#fda4af', '#a5f3fc', '#d8b4fe'
  ];
  function colorFor(id) { return PALETTE[((id % PALETTE.length) + PALETTE.length) % PALETTE.length]; }

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

  function onThemeChange(cb) {
    themeListeners.push(cb);
    if (!observer) {
      observer = new MutationObserver(function() { themeListeners.forEach(function(f) { try { f(); } catch (e) {} }); });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
  }

  // -----------------------------
  // Tokenizers
  // -----------------------------

  // Character-level: every character (including spaces) is a token.
  function charTokenize(text) {
    var toks = [];
    for (var i = 0; i < text.length; i++) toks.push(text[i]);
    return toks;
  }

  // Word-level: split on whitespace, keep punctuation attached or split off.
  // We split words but keep leading whitespace as part of the token (GPT-style spacing).
  function wordTokenize(text) {
    if (!text) return [];
    // Match: leading-space + word-chars OR leading-space + punctuation OR a sequence of whitespace.
    var re = /(\s*[A-Za-z0-9']+|\s*[^A-Za-z0-9'\s]|\s+)/g;
    var out = [], m;
    while ((m = re.exec(text)) !== null) out.push(m[0]);
    return out;
  }

  // A tiny BPE-style subword tokenizer: pre-trained merges baked in for demo purposes.
  // Real BPE learns merges from a corpus. Here we ship a curated merge list so the
  // visualization is meaningful without needing to train at page load.
  var BPE_MERGES = [
    ['t','h'], ['th','e'], ['i','n'], ['e','r'], ['r','e'], ['o','n'], ['e','n'], ['a','t'],
    ['o','u'], ['e','d'], ['h','a'], ['ha','t'], ['a','n'], ['o','r'], ['i','t'], ['i','s'],
    ['o','f'], ['t','o'], ['a','l'], ['a','r'], ['s','t'], ['en','t'], ['in','g'], ['i','o'],
    ['io','n'], ['l','y'], ['l','l'], ['s','e'], ['v','e'], ['l','e'], ['m','e'], ['c','o'],
    ['de','e'], ['l','i'], ['ti','on'], ['c','h'], ['s','h'], ['p','l'], ['r','o'], ['t','i'],
    ['s','o'], ['un','d'], ['er','s'], ['m','an'], ['be','en'], ['no','t'], ['wi','th'],
    ['fo','r'], ['fr','om'], ['lear','n'], ['lo','ve'], ['mod','el'], ['toke','n'], ['p','re']
  ];
  function bpeTokenize(text) {
    if (!text) return [];
    // First split into pre-tokens like word tokenizer (so merges don't cross words).
    var pre = wordTokenize(text);
    var out = [];
    for (var i = 0; i < pre.length; i++) {
      var piece = pre[i];
      // For pure whitespace or single char, keep as-is.
      if (piece.length <= 1) { out.push(piece); continue; }
      // Strip leading whitespace, remember it.
      var lead = '', body = piece;
      var ws = piece.match(/^\s+/);
      if (ws) { lead = ws[0]; body = piece.slice(lead.length); }
      // Start with each character.
      var chars = body.split('');
      // Try to apply merges greedily in order until none applies.
      var changed = true;
      while (changed) {
        changed = false;
        for (var m = 0; m < BPE_MERGES.length; m++) {
          var a = BPE_MERGES[m][0], b = BPE_MERGES[m][1];
          for (var k = 0; k < chars.length - 1; k++) {
            if (chars[k] === a && chars[k+1] === b) {
              chars.splice(k, 2, a + b);
              changed = true;
              break;
            }
          }
          if (changed) break;
        }
      }
      // Reattach leading whitespace to first chunk for nicer chips.
      if (lead) chars[0] = lead + chars[0];
      for (var c = 0; c < chars.length; c++) out.push(chars[c]);
    }
    return out;
  }

  function tokenize(text, mode) {
    if (mode === 'char') return charTokenize(text);
    if (mode === 'word') return wordTokenize(text);
    return bpeTokenize(text);
  }

  // Build a vocabulary from a list of tokens. Returns { vocab: [...], stoi: {..}, ids: [...] }
  function buildVocab(tokens) {
    var stoi = Object.create(null);
    var vocab = [];
    var ids = [];
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (!(t in stoi)) { stoi[t] = vocab.length; vocab.push(t); }
      ids.push(stoi[t]);
    }
    return { vocab: vocab, stoi: stoi, ids: ids };
  }

  function softmax(arr, temperature) {
    var T = (temperature && temperature > 0) ? temperature : 1.0;
    var max = -Infinity;
    for (var i = 0; i < arr.length; i++) if (arr[i] > max) max = arr[i];
    var exps = new Array(arr.length), sum = 0;
    for (var j = 0; j < arr.length; j++) { exps[j] = Math.exp((arr[j] - max) / T); sum += exps[j]; }
    for (var k = 0; k < exps.length; k++) exps[k] /= sum;
    return exps;
  }

  function sampleFromDist(probs) {
    var r = Math.random(), acc = 0;
    for (var i = 0; i < probs.length; i++) { acc += probs[i]; if (r <= acc) return i; }
    return probs.length - 1;
  }

  function escapeWhitespace(s) {
    return s.replace(/ /g, '\u00b7').replace(/\n/g, '\u21b5').replace(/\t/g, '\u2192');
  }

  return {
    getColors: getColors, setupCanvas: setupCanvas, onThemeChange: onThemeChange,
    colorFor: colorFor,
    charTokenize: charTokenize, wordTokenize: wordTokenize, bpeTokenize: bpeTokenize, tokenize: tokenize,
    buildVocab: buildVocab, softmax: softmax, sampleFromDist: sampleFromDist,
    escapeWhitespace: escapeWhitespace
  };
})();
</script>

A language model never reads a single letter. It sees integers. When you type "hello" into ChatGPT, those five characters are quietly chopped into pieces, each piece is looked up in a giant dictionary, and the model receives a small list of numbers like `[15496]`. From the model's point of view, English does not exist. The whole job of an LLM is one game: given a list of integers, predict the next integer. Everything else, the embeddings, the attention, the trillion parameters, is in service of that single guess.

This post pulls that game apart. We will build the bridge between text and numbers ourselves, watch what happens when you change how text is split, see why a vocabulary of 256 characters and a vocabulary of 50000 subwords behave very differently, and end with a tiny live model that plays the next-token game in your browser. By the end you will understand why people obsess over tokenization and why "the model has 32k context" really means "32000 of these little integers".

> This is Part 1 of an interactive series on building LLMs from the ground up. Future posts will cover embeddings, attention, the full transformer, training, and beyond. Each post is interactive first, math second.

---

## 1. Why Numbers, Not Letters

Neural networks are stacks of matrix multiplications and elementwise functions. Matrices want numbers. There is no operation in linear algebra that takes the letter `t` as input. So before any model can touch text, we must convert text to numbers. The conversion has two stages and they are easy to confuse:

1. **Tokenization** splits text into pieces. The pieces can be characters, whole words, or subword chunks. A piece is called a **token**.
2. **Encoding** maps each token to an integer ID, using a fixed lookup table called a **vocabulary**.

A model never sees the raw token string. It sees the integer ID. The string side of the vocabulary exists only so we can read what comes out at the other end.

<div class="demo-hint">Type something below. Watch the same text get carved into different tokens, then turned into integer IDs. The colors are stable per ID, so identical tokens always look the same.</div>

<div class="interactive-demo">
<div class="demo-controls">
  <label>Tokenizer:
    <select id="tok-mode">
      <option value="char">character</option>
      <option value="word">word</option>
      <option value="bpe" selected>subword (BPE-like)</option>
    </select>
  </label>
  <button id="tok-example1">Example: short</button>
  <button id="tok-example2">Example: punctuation</button>
  <button id="tok-example3">Example: numbers</button>
</div>
<textarea id="tok-input" style="width:100%; min-height: 70px; margin-top: 0.6rem; font-family: 'JetBrains Mono', monospace; font-size:0.9rem; padding: 0.5rem; border:1px solid var(--border); border-radius:8px; background: var(--bg-primary); color: var(--text-primary);">The transformer learned to predict the next token.</textarea>
<div class="demo-caption" style="text-align:left; margin-top:0.6rem; font-weight:600; color: var(--text-primary);">Tokens (each chip is one token; small number is its ID in this text's local vocab):</div>
<div class="token-row" id="tok-chips"></div>
<div class="demo-caption" style="text-align:left; margin-top:0.6rem; font-weight:600; color: var(--text-primary);">Encoded (the only thing the model sees):</div>
<div class="token-row" id="tok-ids" style="font-family: 'JetBrains Mono', monospace;"></div>
<div class="tok-stats">
  <div class="tok-stat"><div class="num" id="tok-chars">0</div><div class="lab">characters</div></div>
  <div class="tok-stat"><div class="num" id="tok-tokens">0</div><div class="lab">tokens</div></div>
  <div class="tok-stat"><div class="num" id="tok-ratio">0.00</div><div class="lab">chars / token</div></div>
</div>
</div>

<script>
(function() {
  var modeSel = document.getElementById('tok-mode');
  var input = document.getElementById('tok-input');
  var chipsEl = document.getElementById('tok-chips');
  var idsEl = document.getElementById('tok-ids');
  var charsEl = document.getElementById('tok-chars');
  var tokensEl = document.getElementById('tok-tokens');
  var ratioEl = document.getElementById('tok-ratio');

  function render() {
    var text = input.value;
    var mode = modeSel.value;
    var toks = LLM.tokenize(text, mode);
    var v = LLM.buildVocab(toks);
    chipsEl.innerHTML = '';
    idsEl.innerHTML = '';
    toks.forEach(function(t, i) {
      var id = v.ids[i];
      var chip = document.createElement('span');
      chip.className = 'token-chip';
      chip.style.background = LLM.colorFor(id);
      chip.textContent = LLM.escapeWhitespace(t);
      var idSpan = document.createElement('span');
      idSpan.className = 'tid';
      idSpan.textContent = id;
      chip.appendChild(idSpan);
      chipsEl.appendChild(chip);

      var idChip = document.createElement('span');
      idChip.className = 'token-chip';
      idChip.style.background = LLM.colorFor(id);
      idChip.textContent = id;
      idsEl.appendChild(idChip);
    });
    charsEl.textContent = text.length;
    tokensEl.textContent = toks.length;
    ratioEl.textContent = toks.length ? (text.length / toks.length).toFixed(2) : '0.00';
  }

  modeSel.addEventListener('change', render);
  input.addEventListener('input', render);
  document.getElementById('tok-example1').addEventListener('click', function() {
    input.value = 'hello world';
    render();
  });
  document.getElementById('tok-example2').addEventListener('click', function() {
    input.value = "Don't say it isn't possible, it's already happening!";
    render();
  });
  document.getElementById('tok-example3').addEventListener('click', function() {
    input.value = 'The price was $19,432.50 in 2023.';
    render();
  });
  render();
})();
</script>

<div class="demo-try">
<strong>Try this:</strong> Switch to <em>character</em> mode and notice how every space is its own token. Now switch to <em>subword</em> and watch <code>the</code>, <code>tion</code>, and <code>ing</code> snap together into single chunks. The chars / token number is what people mean when they say "this model is more efficient on English".
</div>

Notice the IDs in the bottom row. That is what the model sees. The chips with letters are for our benefit only. If we shuffled the colors and removed the strings entirely, the model would still work fine, because the model never reads the strings either.

---

## 2. Three Ways to Slice Text

There are three popular families of tokenizers. Each one is a different answer to the same question: how big should a token be?

### Character-level

Each character is one token. A vocabulary of around 256 entries covers ASCII; a few thousand covers Unicode. The wins are obvious: any input is representable, no out-of-vocabulary words, very small lookup table. The cost is severity. The word `tokenization` becomes 12 separate inputs, so the model has to do 12 prediction steps to write it. Sequences are long, training is slow, and the model has to learn the concept of "word" from scratch.

### Word-level

Each whitespace-separated word is one token. Now `tokenization` is a single input, sequences are short, and the model can immediately reason about words. The trouble is the vocabulary. English alone has hundreds of thousands of word forms once you count plurals, tenses, and proper nouns. Anything outside the vocabulary becomes an `<UNK>` placeholder, and `<UNK>` is a black hole. Misspell a name and the model literally cannot see it.

### Subword (BPE, WordPiece, SentencePiece)

A middle path. Common words stay whole. Rare words split into reusable chunks. `tokenization` might become `token` + `ization`. `Bharathikannan` might become `B` + `hara` + `thi` + `kannan`. Vocabularies sit between 30000 and 100000, and any string is representable as a fallback to characters. This is what every modern LLM uses.

<div class="demo-hint">Same sentence, three tokenizers, side by side. Watch the token count and the average chunk size change. The point is that a "5000 token context window" means very different amounts of text depending on the tokenizer.</div>

<div class="interactive-demo">
<textarea id="tri-input" style="width:100%; min-height: 60px; font-family: 'JetBrains Mono', monospace; font-size:0.9rem; padding: 0.5rem; border:1px solid var(--border); border-radius:8px; background: var(--bg-primary); color: var(--text-primary);">Tokenization is the first step in any language model pipeline.</textarea>
<div style="margin-top: 0.7rem;">
  <div style="font-weight:600; font-size:0.85rem; margin-bottom:0.2rem;">Character (<span id="tri-c-count">0</span> tokens)</div>
  <div class="token-row" id="tri-c"></div>
  <div style="font-weight:600; font-size:0.85rem; margin-top:0.5rem; margin-bottom:0.2rem;">Word (<span id="tri-w-count">0</span> tokens)</div>
  <div class="token-row" id="tri-w"></div>
  <div style="font-weight:600; font-size:0.85rem; margin-top:0.5rem; margin-bottom:0.2rem;">Subword / BPE-like (<span id="tri-b-count">0</span> tokens)</div>
  <div class="token-row" id="tri-b"></div>
</div>
</div>

<script>
(function() {
  var input = document.getElementById('tri-input');
  function renderRow(rowEl, countEl, toks) {
    countEl.textContent = toks.length;
    rowEl.innerHTML = '';
    var v = LLM.buildVocab(toks);
    toks.forEach(function(t, i) {
      var chip = document.createElement('span');
      chip.className = 'token-chip';
      chip.style.background = LLM.colorFor(v.ids[i]);
      chip.textContent = LLM.escapeWhitespace(t);
      rowEl.appendChild(chip);
    });
  }
  function render() {
    var text = input.value;
    renderRow(document.getElementById('tri-c'), document.getElementById('tri-c-count'), LLM.charTokenize(text));
    renderRow(document.getElementById('tri-w'), document.getElementById('tri-w-count'), LLM.wordTokenize(text));
    renderRow(document.getElementById('tri-b'), document.getElementById('tri-b-count'), LLM.bpeTokenize(text));
  }
  input.addEventListener('input', render);
  render();
})();
</script>

<div class="demo-try">
<strong>Try this:</strong> Paste a paragraph from a foreign language, or some code, or a string of emojis. The character tokenizer shrugs and handles everything. The word tokenizer is fine for English and miserable for Chinese. The subword tokenizer is somewhere in between but degrades gracefully.
</div>

For the rest of this post and the rest of the series I will use the BPE-style tokenizer, because that matches what real LLMs use. Just remember the tradeoff. Smaller tokens means longer sequences and more compute. Larger tokens means a bigger vocabulary and more parameters in the embedding table. Real systems are tuned to a sweet spot.

---

## 3. Building a Vocabulary

A vocabulary is the only piece of the model that touches the string side of the world. It is just a list. Position in the list is the integer ID. If `the` lives at index 217, then the token `the` becomes 217. That is the whole "lookup".

Real vocabularies are built once, on a giant corpus, then frozen. We can build a tiny one live to see what it looks like.

<div class="demo-hint">Type or paste some text. We tokenize it with the subword tokenizer and assign IDs in the order tokens first appear. The bar chart shows token frequency. Hover any bar to see the token.</div>

<div class="interactive-demo">
<textarea id="vocab-input" style="width:100%; min-height: 80px; font-family: 'JetBrains Mono', monospace; font-size:0.85rem; padding: 0.5rem; border:1px solid var(--border); border-radius:8px; background: var(--bg-primary); color: var(--text-primary);">The cat sat on the mat. The dog sat on the rug. The cat and the dog are friends. The friends learned to share the mat and the rug.</textarea>
<div class="demo-controls">
  <button id="vocab-load1">Load: tongue-twister</button>
  <button id="vocab-load2">Load: longer paragraph</button>
</div>
<div style="margin-top: 0.8rem;">
  <canvas id="vocab-canvas" width="700" height="280"></canvas>
</div>
<div class="demo-info" id="vocab-info">Vocab size: 0 / Total tokens: 0</div>
</div>

<script>
(function() {
  var input = document.getElementById('vocab-input');
  var canvas = document.getElementById('vocab-canvas');
  var info = document.getElementById('vocab-info');
  var W = 700, H = 280;
  var hoverIdx = -1;

  document.getElementById('vocab-load1').addEventListener('click', function() {
    input.value = 'How much wood would a woodchuck chuck if a woodchuck could chuck wood? A woodchuck would chuck as much wood as a woodchuck could chuck if a woodchuck could chuck wood.';
    render();
  });
  document.getElementById('vocab-load2').addEventListener('click', function() {
    input.value = 'Language models are trained on text, but they do not see text. They see integers. The job of the tokenizer is to turn text into integers and back again. A vocabulary is a fixed list of token strings. Each position in the list is the integer ID for that token. Given an unseen string, the tokenizer chops it into known pieces and looks up each piece in the vocabulary. The result is a sequence of integers that the model can actually compute on.';
    render();
  });

  function render() {
    var text = input.value;
    var toks = LLM.bpeTokenize(text);
    // Frequency count
    var freq = Object.create(null);
    var firstOrder = [];
    toks.forEach(function(t) {
      if (!(t in freq)) { freq[t] = 0; firstOrder.push(t); }
      freq[t]++;
    });
    // Sort by frequency desc
    var entries = firstOrder.map(function(t) { return { tok: t, n: freq[t] }; });
    entries.sort(function(a, b) { return b.n - a.n; });
    var top = entries.slice(0, 40);
    var ctx = LLM.setupCanvas(canvas, W, H);
    var c = LLM.getColors();
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
    var padL = 40, padR = 10, padT = 14, padB = 60;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var maxN = top[0] ? top[0].n : 1;
    var bw = plotW / Math.max(top.length, 1);
    // Y grid
    ctx.strokeStyle = c.grid; ctx.lineWidth = 1;
    ctx.fillStyle = c.textMuted; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'right';
    for (var g = 0; g <= 4; g++) {
      var y = padT + plotH * g / 4;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
      var v = Math.round(maxN - maxN * g / 4);
      ctx.fillText(v, padL - 4, y + 3);
    }
    // Bars
    top.forEach(function(e, i) {
      var x = padL + i * bw + 1;
      var h = (e.n / maxN) * plotH;
      var y = padT + plotH - h;
      ctx.fillStyle = (i === hoverIdx) ? c.accent3 : LLM.colorFor(firstOrder.indexOf(e.tok));
      ctx.fillRect(x, y, bw - 2, h);
    });
    // X labels: only first ~12 to avoid crowding
    ctx.fillStyle = c.text; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    top.forEach(function(e, i) {
      if (i < 14 || i === hoverIdx) {
        var x = padL + i * bw + bw / 2;
        ctx.save();
        ctx.translate(x, padT + plotH + 8);
        ctx.rotate(-Math.PI / 4);
        var lbl = LLM.escapeWhitespace(e.tok);
        if (lbl.length > 8) lbl = lbl.slice(0, 7) + '...';
        ctx.textAlign = 'right';
        ctx.fillText(lbl, 0, 0);
        ctx.restore();
      }
    });
    ctx.textAlign = 'left'; ctx.fillStyle = c.textMuted; ctx.font = '10px Inter, sans-serif';
    ctx.fillText('rank (most frequent first)', padL, H - 4);

    info.textContent = 'Unique tokens (vocab size): ' + firstOrder.length + ' / Total tokens: ' + toks.length + ' / Compression: ' + (text.length / Math.max(toks.length,1)).toFixed(2) + ' chars per token';

    // Save state for hover
    canvas._top = top; canvas._firstOrder = firstOrder;
    canvas._padL = padL; canvas._padT = padT; canvas._plotW = plotW; canvas._plotH = plotH; canvas._bw = bw;
  }

  canvas.addEventListener('mousemove', function(e) {
    var r = canvas.getBoundingClientRect();
    var mx = (e.clientX - r.left) * (W / r.width);
    var my = (e.clientY - r.top) * (H / r.height);
    if (!canvas._top) return;
    var idx = -1;
    if (my > canvas._padT && my < canvas._padT + canvas._plotH) {
      var rel = (mx - canvas._padL) / canvas._bw;
      if (rel >= 0 && rel < canvas._top.length) idx = Math.floor(rel);
    }
    if (idx !== hoverIdx) { hoverIdx = idx; render(); }
  });
  canvas.addEventListener('mouseleave', function() { if (hoverIdx !== -1) { hoverIdx = -1; render(); } });
  input.addEventListener('input', render);
  LLM.onThemeChange(render);
  render();
})();
</script>

A few things that show up immediately:

**Frequencies are not flat.** A small handful of tokens (`the`, `a`, common punctuation) dominate. Most tokens appear only a couple of times. This is Zipf's law and it is the entire reason subword tokenization works. The most common 5000 tokens cover most of normal English. Everything else can fall back to smaller pieces.

**Real vocabularies are huge by comparison.** GPT-2 uses about 50257 tokens. Llama uses 32000. The vocabulary sits inside the model as a learned matrix of shape (vocab_size, embedding_dim), so vocabulary size is a real cost. Doubling it doubles a chunk of the model's parameters.

**Vocabularies are frozen.** In your demo above, every paragraph builds its own little vocab. A real model trains its tokenizer once on hundreds of gigabytes of text, locks the vocabulary, then never changes it. If a brand new word shows up at inference time, the tokenizer falls back to subword pieces it already knows.

---

## 4. Encoding and Decoding

Once the vocabulary exists, two functions do all the work:

- `encode(text) -> [int]` splits the text into tokens and looks each one up.
- `decode([int]) -> text` looks up each integer in the vocab and concatenates the strings.

These are exact inverses. If you encode then decode you get the original text back, character for character.

<div class="demo-hint">Type text on the left, watch it travel through the pipeline on the right. Then edit the integer list directly to feel what it is like to "speak in IDs".</div>

<div class="interactive-demo">
<div class="demo-split">
  <div>
    <div style="font-weight:600; font-size:0.85rem; margin-bottom:0.3rem;">Text in</div>
    <textarea id="codec-text" style="width:100%; min-height:90px; font-family: 'JetBrains Mono', monospace; font-size:0.85rem; padding: 0.5rem; border:1px solid var(--border); border-radius:8px; background: var(--bg-primary); color: var(--text-primary);">attention is all you need</textarea>
  </div>
  <div>
    <div style="font-weight:600; font-size:0.85rem; margin-bottom:0.3rem;">Token IDs (edit me)</div>
    <textarea id="codec-ids" style="width:100%; min-height:90px; font-family: 'JetBrains Mono', monospace; font-size:0.85rem; padding: 0.5rem; border:1px solid var(--border); border-radius:8px; background: var(--bg-primary); color: var(--text-primary);"></textarea>
  </div>
</div>
<div style="margin-top: 0.8rem;">
  <div class="flow-step">1. <strong>Tokenize</strong>: split text into tokens (subword)</div>
  <div class="token-row" id="codec-tokens"></div>
  <div class="flow-step">2. <strong>Encode</strong>: map each token to its ID via the vocabulary</div>
  <div class="token-row" id="codec-encoded"></div>
  <div class="flow-step">3. <strong>Decode</strong>: map IDs back to tokens, concatenate strings</div>
  <div style="padding: 0.6rem 0.8rem; background: var(--bg-primary); border-radius: 8px; font-family: 'JetBrains Mono', monospace; margin-top: 0.4rem;" id="codec-out"></div>
</div>
</div>

<script>
(function() {
  var textEl = document.getElementById('codec-text');
  var idsEl = document.getElementById('codec-ids');
  var tokensRow = document.getElementById('codec-tokens');
  var encRow = document.getElementById('codec-encoded');
  var outEl = document.getElementById('codec-out');
  var lastVocab = null;
  var muteText = false, muteIds = false;

  function renderFromText() {
    if (muteText) return;
    var text = textEl.value;
    var toks = LLM.bpeTokenize(text);
    var v = LLM.buildVocab(toks);
    lastVocab = v;
    drawTokens(toks, v.ids);
    muteIds = true;
    idsEl.value = v.ids.join(' ');
    muteIds = false;
    drawDecoded(v.ids, v.vocab);
  }

  function renderFromIds() {
    if (muteIds || !lastVocab) return;
    var raw = idsEl.value.trim();
    if (!raw) return;
    var ids = raw.split(/[\s,]+/).map(function(s) { return parseInt(s, 10); }).filter(function(n) { return !isNaN(n); });
    drawDecoded(ids, lastVocab.vocab);
    drawTokens(ids.map(function(id) { return lastVocab.vocab[id] || '<UNK>'; }), ids);
    muteText = true;
    textEl.value = ids.map(function(id) { return lastVocab.vocab[id] || ''; }).join('');
    muteText = false;
  }

  function drawTokens(toks, ids) {
    tokensRow.innerHTML = ''; encRow.innerHTML = '';
    toks.forEach(function(t, i) {
      var chip = document.createElement('span');
      chip.className = 'token-chip';
      chip.style.background = LLM.colorFor(ids[i]);
      chip.textContent = LLM.escapeWhitespace(t);
      tokensRow.appendChild(chip);

      var idChip = document.createElement('span');
      idChip.className = 'token-chip';
      idChip.style.background = LLM.colorFor(ids[i]);
      idChip.textContent = ids[i];
      encRow.appendChild(idChip);
    });
  }
  function drawDecoded(ids, vocab) {
    var pieces = ids.map(function(id) { return vocab[id] !== undefined ? vocab[id] : '<?>'; });
    outEl.textContent = pieces.join('');
  }

  textEl.addEventListener('input', renderFromText);
  idsEl.addEventListener('input', renderFromIds);
  renderFromText();
})();
</script>

<div class="demo-try">
<strong>Try this:</strong> Edit the ID list. Repeat one of the IDs three times. Swap two IDs. Decode shows you exactly what the model would "say" if it produced that integer sequence. Now you have a feel for the language the model actually speaks.
</div>

That is everything in the data pipeline. Text in. Integers in. Integers out. Text out. The middle of the model never escapes the integer world.

---

## 5. The Whole Job: Predict the Next Token

The model is a function. It takes a sequence of token IDs and returns a probability distribution over the entire vocabulary, predicting what the next token should be.

$$
P(t_{n+1} \mid t_1, t_2, \dots, t_n)
$$

That is it. Everything in an LLM, every single architectural choice from positional encoding to grouped query attention to mixture of experts, is a way to compute that distribution well. To generate text, we do the obvious thing: take the most likely token (or sample one), append it to the sequence, and ask again.

<div class="demo-hint">Below is a tiny next-token model. It is not a transformer; it is just a bigram lookup learned from a small text. But it plays exactly the next-token game. Pick a starting token, see the predicted distribution over the vocabulary, then click <em>Step</em> to append the prediction and continue.</div>

<div class="interactive-demo">
<div class="demo-controls">
  <label>Corpus:
    <select id="ng-corpus">
      <option value="0">tongue twister</option>
      <option value="1" selected>cats and dogs</option>
      <option value="2">tokenization paragraph</option>
    </select>
  </label>
  <label>Strategy:
    <select id="ng-strategy">
      <option value="greedy" selected>greedy (argmax)</option>
      <option value="sample">sample</option>
    </select>
  </label>
  <label>Temperature: <input type="range" id="ng-temp" min="0.1" max="2.0" step="0.05" value="1.0"><span class="demo-value" id="ng-temp-val">1.00</span></label>
  <button id="ng-step">Step</button>
  <button id="ng-step5">Step x5</button>
  <button id="ng-reset">Reset</button>
</div>
<div style="margin-top: 0.7rem;">
  <div style="font-weight:600; font-size:0.85rem; margin-bottom:0.3rem;">Sequence so far (last token highlighted):</div>
  <div class="token-row" id="ng-seq"></div>
</div>
<div style="margin-top: 0.7rem;">
  <div style="font-weight:600; font-size:0.85rem; margin-bottom:0.3rem;">Predicted distribution over the vocabulary for the next token:</div>
  <canvas id="ng-canvas" width="700" height="240"></canvas>
</div>
<div class="demo-info" id="ng-info"></div>
</div>

<script>
(function() {
  var corpora = [
    'how much wood would a woodchuck chuck if a woodchuck could chuck wood a woodchuck would chuck as much wood as a woodchuck could chuck if a woodchuck could chuck wood',
    'the cat sat on the mat the dog sat on the rug the cat and the dog are friends the friends learned to share the mat and the rug the cat liked the rug the dog liked the mat',
    'language models are trained on text but they do not see text they see integers the tokenizer turns text into integers and back again the model predicts the next integer over and over'
  ];

  var corpusSel = document.getElementById('ng-corpus');
  var stratSel = document.getElementById('ng-strategy');
  var tempSlider = document.getElementById('ng-temp');
  var tempVal = document.getElementById('ng-temp-val');
  var seqRow = document.getElementById('ng-seq');
  var canvas = document.getElementById('ng-canvas');
  var info = document.getElementById('ng-info');
  var W = 700, H = 240;

  var vocab, stoi, transitions, sequence;

  function trainBigram(text) {
    var toks = LLM.bpeTokenize(text);
    var v = LLM.buildVocab(toks);
    vocab = v.vocab; stoi = v.stoi;
    var V = vocab.length;
    transitions = []; for (var i = 0; i < V; i++) transitions.push(new Array(V).fill(0));
    for (var k = 0; k < v.ids.length - 1; k++) transitions[v.ids[k]][v.ids[k+1]]++;
    // Convert each row to logits with a small smoothing so unseen pairs get nonzero probability.
    for (var r = 0; r < V; r++) {
      for (var c = 0; c < V; c++) transitions[r][c] = Math.log(transitions[r][c] + 0.05);
    }
    sequence = [v.ids[0]];
  }

  function renderSeq() {
    seqRow.innerHTML = '';
    sequence.forEach(function(id, i) {
      var chip = document.createElement('span');
      chip.className = 'token-chip';
      chip.style.background = LLM.colorFor(id);
      chip.textContent = LLM.escapeWhitespace(vocab[id]);
      if (i === sequence.length - 1) {
        chip.style.boxShadow = '0 0 0 2px var(--accent)';
      }
      seqRow.appendChild(chip);
    });
  }

  function currentDist() {
    var T = parseFloat(tempSlider.value);
    var lastId = sequence[sequence.length - 1];
    return LLM.softmax(transitions[lastId], T);
  }

  function drawDist() {
    var ctx = LLM.setupCanvas(canvas, W, H);
    var c = LLM.getColors();
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
    var probs = currentDist();
    var V = vocab.length;
    // Sort by probability desc and take top 18 for readability.
    var idxs = []; for (var i = 0; i < V; i++) idxs.push(i);
    idxs.sort(function(a, b) { return probs[b] - probs[a]; });
    var top = idxs.slice(0, 18);
    var padL = 14, padR = 10, padT = 12, padB = 50;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var bw = plotW / top.length;
    var maxP = Math.max.apply(null, top.map(function(i) { return probs[i]; }));
    // Bars
    top.forEach(function(idx, i) {
      var p = probs[idx];
      var h = (p / maxP) * plotH;
      var x = padL + i * bw + 2;
      var y = padT + plotH - h;
      ctx.fillStyle = LLM.colorFor(idx);
      ctx.fillRect(x, y, bw - 4, h);
      // prob label on top
      ctx.fillStyle = c.text; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
      if (p > maxP * 0.05) ctx.fillText(p.toFixed(2), x + (bw - 4) / 2, y - 3);
      // token label below
      ctx.save(); ctx.translate(x + (bw - 4) / 2, padT + plotH + 6); ctx.rotate(-Math.PI / 5);
      ctx.textAlign = 'right'; ctx.fillStyle = c.text;
      var lbl = LLM.escapeWhitespace(vocab[idx]); if (lbl.length > 8) lbl = lbl.slice(0,7)+'...';
      ctx.fillText(lbl, 0, 0); ctx.restore();
    });
    // baseline
    ctx.strokeStyle = c.textMuted;
    ctx.beginPath(); ctx.moveTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH); ctx.stroke();
    ctx.fillStyle = c.textMuted; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('top 18 of ' + V + ' vocab tokens, sorted by P(next | last token)', padL, H - 6);
  }

  function step() {
    var probs = currentDist();
    var nextId;
    if (stratSel.value === 'greedy') {
      nextId = 0; var best = -Infinity;
      for (var i = 0; i < probs.length; i++) if (probs[i] > best) { best = probs[i]; nextId = i; }
    } else {
      nextId = LLM.sampleFromDist(probs);
    }
    sequence.push(nextId);
    if (sequence.length > 30) sequence.shift();
    renderAll();
  }

  function renderAll() {
    renderSeq();
    drawDist();
    var lastId = sequence[sequence.length - 1];
    info.textContent = 'last token = "' + LLM.escapeWhitespace(vocab[lastId]) + '" (id ' + lastId + '), vocab size ' + vocab.length + ', sequence length ' + sequence.length;
  }

  function reset() {
    trainBigram(corpora[parseInt(corpusSel.value, 10)]);
    renderAll();
  }

  corpusSel.addEventListener('change', reset);
  stratSel.addEventListener('change', renderAll);
  tempSlider.addEventListener('input', function() { tempVal.textContent = parseFloat(tempSlider.value).toFixed(2); drawDist(); });
  document.getElementById('ng-step').addEventListener('click', step);
  document.getElementById('ng-step5').addEventListener('click', function() { for (var i = 0; i < 5; i++) step(); });
  document.getElementById('ng-reset').addEventListener('click', reset);
  LLM.onThemeChange(renderAll);
  reset();
})();
</script>

The demo above is the smallest possible language model: it just remembers, for every token in the training text, what tokens followed it. Then it builds a probability distribution from those counts. A real LLM does the same job (output a distribution over the vocabulary) but conditioned on the entire history, with billions of parameters dedicated to the conditioning. The output shape is the same. The output meaning is the same. Only the quality differs.

Watch what happens when you change the temperature.

---

## 6. Temperature, Sampling, and Why the Same Prompt Gives Different Answers

The model outputs a distribution. The question is what to do with it.

**Greedy decoding** picks the most likely token every time. It is deterministic, fast, and boring. Repeated runs from the same prompt produce identical text.

**Sampling** draws a token at random according to the probabilities. High probability tokens are picked often, low probability tokens get a chance too. Repeated runs vary.

**Temperature** is a scaling parameter inside the softmax that reshapes the distribution before sampling. The softmax is

$$
P_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}
$$

where $$z_i$$ are the model's raw output values (the **logits**) and $$T$$ is the temperature. Three regimes:

- $$T \to 0$$: distribution becomes a spike on the argmax. Equivalent to greedy.
- $$T = 1$$: the model's natural distribution, unchanged.
- $$T > 1$$: distribution flattens. Less likely tokens get more chance. Output gets weirder.

<div class="demo-hint">Drag the logit bars to set the model's "raw scores", then move the temperature slider to see how the probability distribution warps. Watch how a confident model with one big logit becomes uncertain at high temperature, and how an uncertain model collapses to one answer at low temperature.</div>

<div class="interactive-demo">
<div class="demo-controls">
  <label>Temperature: <input type="range" id="temp-slider" min="0.05" max="3" step="0.01" value="1.0"><span class="demo-value" id="temp-val">1.00</span></label>
  <button id="temp-preset1">Preset: confident</button>
  <button id="temp-preset2">Preset: uncertain</button>
  <button id="temp-preset3">Preset: bimodal</button>
</div>
<div style="margin-top: 0.5rem;">
  <canvas id="temp-canvas" width="700" height="320"></canvas>
</div>
<div class="demo-info" id="temp-info">Drag the logit bars (top row). The bottom row shows the resulting probabilities.</div>
</div>

<script>
(function() {
  var canvas = document.getElementById('temp-canvas');
  var slider = document.getElementById('temp-slider');
  var val = document.getElementById('temp-val');
  var info = document.getElementById('temp-info');
  var W = 700, H = 320;
  var labels = ['cat', 'dog', 'fish', 'bird', 'horse', 'fox', 'wolf', 'lion'];
  var logits = [3.2, 2.8, 1.5, 1.0, 0.7, 0.4, 0.2, -0.4];
  var dragIdx = -1;
  var padL = 30, padR = 10, padT = 16, padB = 56;

  function presets(name) {
    if (name === 'conf') logits = [4.0, 0.5, 0.3, 0.1, 0.0, -0.1, -0.2, -0.3];
    else if (name === 'unc') logits = [1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65];
    else if (name === 'bi') logits = [3.0, 0.0, 0.0, 0.0, 3.0, 0.0, 0.0, 0.0];
    draw();
  }

  function draw() {
    var ctx = LLM.setupCanvas(canvas, W, H);
    var c = LLM.getColors();
    ctx.fillStyle = c.bg; ctx.fillRect(0, 0, W, H);
    var T = parseFloat(slider.value); val.textContent = T.toFixed(2);
    var rowH = (H - padT - padB) / 2;
    var plotW = W - padL - padR;
    var bw = plotW / labels.length;
    // Logits row (top)
    ctx.fillStyle = c.textMuted; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Logits (drag bars)', padL, padT - 2);
    var lmin = -1.5, lmax = 4.5;
    function lY(v) { return padT + rowH - ((v - lmin) / (lmax - lmin)) * rowH; }
    // baseline at 0
    ctx.strokeStyle = c.grid; ctx.beginPath(); ctx.moveTo(padL, lY(0)); ctx.lineTo(padL+plotW, lY(0)); ctx.stroke();
    logits.forEach(function(z, i) {
      var x = padL + i * bw + 4;
      var w = bw - 8;
      var y0 = lY(0); var y1 = lY(z);
      ctx.fillStyle = LLM.colorFor(i);
      var top = Math.min(y0, y1), bh = Math.abs(y1 - y0);
      ctx.fillRect(x, top, w, bh);
      ctx.fillStyle = c.text; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
      ctx.fillText(z.toFixed(2), x + w/2, (z >= 0 ? y1 - 3 : y1 + 11));
    });
    // Probs row (bottom)
    var probs = LLM.softmax(logits, T);
    ctx.fillStyle = c.textMuted; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('Probabilities after softmax(logits / T), T = ' + T.toFixed(2), padL, padT + rowH + 16);
    var pTop = padT + rowH + 22, pH = rowH - 6;
    var pBase = pTop + pH;
    ctx.strokeStyle = c.grid; ctx.beginPath(); ctx.moveTo(padL, pBase); ctx.lineTo(padL+plotW, pBase); ctx.stroke();
    probs.forEach(function(p, i) {
      var x = padL + i * bw + 4;
      var w = bw - 8;
      var h = p * pH;
      ctx.fillStyle = LLM.colorFor(i);
      ctx.fillRect(x, pBase - h, w, h);
      ctx.fillStyle = c.text; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
      if (p > 0.04) ctx.fillText((p*100).toFixed(0)+'%', x + w/2, pBase - h - 3);
      // labels under
      ctx.fillStyle = c.text; ctx.font = '11px Inter, sans-serif';
      ctx.fillText(labels[i], x + w/2, H - 8);
    });
    // entropy
    var H_ent = 0;
    probs.forEach(function(p) { if (p > 1e-9) H_ent -= p * Math.log2(p); });
    info.textContent = 'Entropy = ' + H_ent.toFixed(2) + ' bits (max possible for ' + labels.length + ' tokens = ' + Math.log2(labels.length).toFixed(2) + '). Drag bars in the top row to change logits.';
  }

  function getMP(e) {
    var r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  }
  function pickIdx(p) {
    var rowH = (H - padT - padB) / 2;
    if (p.y < padT || p.y > padT + rowH) return -1;
    var plotW = W - padL - padR;
    var bw = plotW / labels.length;
    var rel = (p.x - padL) / bw;
    if (rel < 0 || rel >= labels.length) return -1;
    return Math.floor(rel);
  }
  function applyDrag(p) {
    var rowH = (H - padT - padB) / 2;
    var lmin = -1.5, lmax = 4.5;
    var v = lmin + (1 - (p.y - padT) / rowH) * (lmax - lmin);
    v = Math.max(lmin, Math.min(lmax, v));
    logits[dragIdx] = v;
    draw();
  }
  canvas.addEventListener('mousedown', function(e) { var p = getMP(e); var i = pickIdx(p); if (i >= 0) { dragIdx = i; applyDrag(p); } });
  window.addEventListener('mousemove', function(e) { if (dragIdx < 0) return; applyDrag(getMP(e)); });
  window.addEventListener('mouseup', function() { dragIdx = -1; });
  canvas.addEventListener('touchstart', function(e) { e.preventDefault(); var t = e.touches[0]; var p = getMP(t); var i = pickIdx(p); if (i >= 0) { dragIdx = i; applyDrag(p); } }, {passive:false});
  canvas.addEventListener('touchmove', function(e) { e.preventDefault(); if (dragIdx < 0) return; applyDrag(getMP(e.touches[0])); }, {passive:false});
  canvas.addEventListener('touchend', function() { dragIdx = -1; });
  slider.addEventListener('input', draw);
  document.getElementById('temp-preset1').addEventListener('click', function() { presets('conf'); });
  document.getElementById('temp-preset2').addEventListener('click', function() { presets('unc'); });
  document.getElementById('temp-preset3').addEventListener('click', function() { presets('bi'); });
  LLM.onThemeChange(draw);
  draw();
})();
</script>

<div class="demo-try">
<strong>Try this:</strong> Set the <em>bimodal</em> preset. Two equally good options. With <code>T = 1</code> they get equal probability. Push <code>T</code> down toward zero and watch one side win the entire mass. This is the difference between "the model is hesitating between two valid answers" and "the model picked one and forgot the other existed".
</div>

A side note: there are other sampling tricks like top-k (keep only the k most likely tokens, redistribute probability among them) and nucleus (top-p) sampling (keep the smallest set of tokens whose cumulative probability exceeds p). They are post-processing on the same distribution. We will get into them properly in the post on text generation. The point here is just that the model produces probabilities, and what we do with those probabilities determines what comes out.

---

## 7. Putting it All Together

This is the full pipeline of a working language model, end to end:

<div class="interactive-demo" style="background: var(--bg-primary);">
<div class="flow-step"><strong>Input text:</strong> "The cat sat on the"</div>
<div class="flow-step"><strong>Tokenize:</strong> ["The", " cat", " sat", " on", " the"]</div>
<div class="flow-step"><strong>Encode:</strong> [464, 3797, 3332, 319, 262]</div>
<div class="flow-step" style="border-left-color: var(--accent3);"><strong>Model forward pass:</strong> sequence of integers in, distribution over vocabulary out (this is the trillion-parameter middle)</div>
<div class="flow-step"><strong>Output distribution:</strong> { " mat": 0.42, " rug": 0.18, " floor": 0.09, ... } over all 50000 tokens</div>
<div class="flow-step"><strong>Sample / greedy:</strong> pick token id 2603</div>
<div class="flow-step"><strong>Decode:</strong> 2603 -> " mat"</div>
<div class="flow-step"><strong>Append, repeat</strong> from the top with one extra token in the input.</div>
</div>

Everything in this series will be about that "middle" step: how the model turns a sequence of integer IDs into a probability distribution over the next integer ID. We will look at embeddings (how an integer becomes a learned vector), at attention (how the model decides which earlier tokens matter), at the transformer block (the unit that gets stacked dozens of times), and eventually at training (how the parameters get set in the first place). But the input and output of the model never change. It is always integers in, distribution over integers out.

---

## 8. Common Misconceptions

A few things people get wrong about tokens:

**Tokens are not words.** The token `" cat"` has a leading space and is different from `"cat"`. The token `Cat` is different from `cat`. The token `cat,` (with comma attached) is different from both. Different tokenizers give very different splits. This is why prompts that look identical to a human can score differently in length tests.

**Token count is not character count.** "Hello world" is 11 characters but maybe 2 or 3 tokens. A novel chapter might be 5000 characters but 1200 tokens. Pricing and context limits are in tokens, not characters.

**Tokenization is not learned by the model.** It is fixed before training even starts. The model never sees the strings; it sees only the integer IDs. If your tokenizer is bad (lots of rare tokens, weird splits), the model has to compensate, but it cannot fix it.

**Numbers and code are often tokenized poorly.** A number like `19432` might split into `1`, `94`, `32` rather than staying whole. This is one reason LLMs historically struggled with arithmetic. Modern models often add digit-level tokenization for numbers specifically.

**`<UNK>` does not exist in modern LLMs.** Subword tokenizers always have a fallback path down to byte level, so any string is representable. But a string that is awkwardly tokenized (lots of single-byte pieces) will use up your context very fast.

---

## Summary

| Concept | What it is |
|---|---|
| Token | A string piece. Char, word, or subword. |
| Vocabulary | A fixed list of token strings. Position = ID. |
| Encode | text -> token strings -> integer IDs |
| Decode | integer IDs -> token strings -> concatenated text |
| LLM job | $$P(t_{n+1} \mid t_1, \dots, t_n)$$, a distribution over the vocabulary |
| Logits | The model's raw output before softmax |
| Softmax | Turns logits into probabilities |
| Temperature | Scaling factor $$T$$ inside the softmax: smaller = sharper, larger = flatter |
| Greedy / sample | Two ways to pick a token from the distribution |
| Generation | Sample, append, repeat |

Three things to remember:

1. **Models live in integer-land.** Strings are a UI for humans. The model sees a list of small integers and emits a distribution over a fixed vocabulary.
2. **The whole job is next-token prediction.** Every architectural complication in the next eight posts of this series exists to compute that distribution well.
3. **Tokenization is upstream of everything.** A bad tokenizer cripples even a great model. A good tokenizer makes the same model effectively bigger.

#### Next in the series

Now that the model speaks in integers, the obvious question is: what does it do with them? Looking up `464` in a 50000-row table is the first step inside the model. That table is called the **embedding matrix**, and what makes it interesting is that the rows learn during training to encode meaning. In Part 2 we will build that table, see what it actually learns, and make `king - man + woman = queen` happen with our own hands.

#### References

<ol class="references">
  <li>Sennrich, R., Haddow, B., &amp; Birch, A. (2016). <em>Neural Machine Translation of Rare Words with Subword Units</em>. ACL. <a href="https://arxiv.org/abs/1508.07909" target="_blank" rel="noopener">https://arxiv.org/abs/1508.07909</a></li>
  <li>Radford, A., Wu, J., Child, R., Luan, D., Amodei, D., &amp; Sutskever, I. (2019). <em>Language Models are Unsupervised Multitask Learners</em> (GPT-2). OpenAI. <a href="https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf" target="_blank" rel="noopener">PDF</a></li>
  <li>Kudo, T., &amp; Richardson, J. (2018). <em>SentencePiece: A simple and language independent subword tokenizer</em>. EMNLP Demo. <a href="https://arxiv.org/abs/1808.06226" target="_blank" rel="noopener">https://arxiv.org/abs/1808.06226</a></li>
  <li>Karpathy, A. (2024). <em>Let's build the GPT Tokenizer</em>. <a href="https://www.youtube.com/watch?v=zduSFxRajkE" target="_blank" rel="noopener">YouTube lecture</a></li>
</ol>
