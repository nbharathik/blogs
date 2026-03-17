---
layout: post
title: "Hash Tables from Scratch: An Interactive Guide"
author: bharathikannan
categories: [Data Structures]
description: "Understand hash tables visually. Hash functions, collisions, separate chaining, and rehashing  - all animated step by step in your browser."
hidden: true
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
.demo-controls input[type="number"], .demo-controls input[type="text"] {
  width: 140px;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', monospace;
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
  .demo-controls input[type="text"] { width: 100px; }
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
</style>

<script>
window.DSA_Hash = (function() {
  function getColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg: dark ? '#1a1b26' : '#ffffff',
      bucket: dark ? '#7aa2f7' : '#2563eb',
      bucketEmpty: dark ? '#292e42' : '#e5e7eb',
      bucketHighlight: dark ? '#ff9e64' : '#f59e0b',
      node: dark ? '#7aa2f7' : '#2563eb',
      nodeNew: dark ? '#9ece6a' : '#16a34a',
      nodeHighlight: dark ? '#ff9e64' : '#f59e0b',
      nodeFound: dark ? '#9ece6a' : '#16a34a',
      nodeDelete: dark ? '#f7768e' : '#e63946',
      nodeCollision: dark ? '#bb9af7' : '#7c3aed',
      text: dark ? '#c0caf5' : '#1a1b26',
      textOnNode: '#ffffff',
      textMuted: dark ? '#565f89' : '#6b7280',
      arrow: dark ? '#565f89' : '#9ca3af',
      arrowHighlight: dark ? '#ff9e64' : '#f59e0b',
      border: dark ? '#292e42' : '#e5e7eb',
      accent: dark ? '#7aa2f7' : '#2563eb',
      asciiChar: dark ? '#ff9e64' : '#f59e0b',
      asciiVal: dark ? '#9ece6a' : '#16a34a',
      modResult: dark ? '#bb9af7' : '#7c3aed'
    };
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

  var BUCKET_W = 70, BUCKET_H = 40, BUCKET_R = 6;
  var CHAIN_NODE_W = 56, CHAIN_NODE_H = 28, CHAIN_NODE_R = 5;

  // Draw a rounded rectangle
  function drawRoundRect(ctx, x, y, w, h, r) {
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
  }

  // Draw a single bucket rectangle with index label
  function drawBucket(ctx, x, y, index, color, c) {
    ctx.fillStyle = color || c.bucketEmpty;
    drawRoundRect(ctx, x, y, BUCKET_W, BUCKET_H, BUCKET_R);
    ctx.fill();

    // Index label below
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[' + index + ']', x + BUCKET_W / 2, y + BUCKET_H + 14);
  }

  // Draw a chain node (smaller rectangle for items within a bucket)
  function drawChainNode(ctx, x, y, label, color, c) {
    ctx.fillStyle = color || c.node;
    drawRoundRect(ctx, x, y, CHAIN_NODE_W, CHAIN_NODE_H, CHAIN_NODE_R);
    ctx.fill();

    ctx.fillStyle = c.textOnNode;
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + CHAIN_NODE_W / 2, y + CHAIN_NODE_H / 2 + 4);
  }

  // Draw a small arrow between chain nodes
  function drawChainArrow(ctx, x1, y1, x2, y2, color, c) {
    ctx.strokeStyle = color || c.arrow;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 - 6, y2);
    ctx.stroke();
    // Arrowhead
    ctx.fillStyle = color || c.arrow;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 6, y2 - 3);
    ctx.lineTo(x2 - 6, y2 + 3);
    ctx.closePath();
    ctx.fill();
  }

  // Simple hash function: sum of char codes mod tableSize
  function hashString(key, tableSize) {
    var sum = 0;
    for (var i = 0; i < key.length; i++) {
      sum += key.charCodeAt(i);
    }
    return sum % tableSize;
  }

  // Get ASCII breakdown of a string
  function getAsciiBreakdown(key) {
    var chars = [];
    var sum = 0;
    for (var i = 0; i < key.length; i++) {
      var code = key.charCodeAt(i);
      chars.push({ char: key[i], code: code });
      sum += code;
    }
    return { chars: chars, sum: sum };
  }

  // Draw bucket array (horizontal row of buckets)
  function drawBucketArray(ctx, w, h, tableSize, buckets, highlights) {
    var c = getColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    highlights = highlights || {};
    var totalW = tableSize * BUCKET_W + (tableSize - 1) * 8;
    var startX = Math.max(20, (w - totalW) / 2);
    var y = h / 2 - BUCKET_H / 2;

    // Title
    ctx.fillStyle = c.textMuted;
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Hash Table (size = ' + tableSize + ')', w / 2, 18);

    for (var i = 0; i < tableSize; i++) {
      var x = startX + i * (BUCKET_W + 8);
      var bucketColor = c.bucketEmpty;
      if (highlights[i] === 'highlight') bucketColor = c.bucketHighlight;
      else if (highlights[i] === 'found') bucketColor = c.nodeFound;
      else if (highlights[i] === 'new') bucketColor = c.nodeNew;
      else if (highlights[i] === 'collision') bucketColor = c.nodeCollision;
      else if (buckets && buckets[i] && buckets[i].length > 0) bucketColor = c.bucket;

      drawBucket(ctx, x, y, i, bucketColor, c);

      // Draw value inside bucket if single item
      if (buckets && buckets[i] && buckets[i].length > 0) {
        var label = buckets[i][0];
        if (buckets[i].length > 1) label = buckets[i].length + ' items';
        ctx.fillStyle = c.textOnNode;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        var displayLabel = label.length > 7 ? label.substring(0, 6) + '..' : label;
        ctx.fillText(displayLabel, x + BUCKET_W / 2, y + BUCKET_H / 2 + 4);
      }
    }
  }

  // Draw bucket array with chaining (vertical layout: buckets on left, chains extending right)
  function drawChainedTable(ctx, w, h, tableSize, buckets, highlights) {
    var c = getColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    highlights = highlights || {};
    var bucketGap = 6;
    var totalH = tableSize * (BUCKET_H + bucketGap) - bucketGap;
    var startY = Math.max(20, (h - totalH) / 2);
    var bucketX = 30;

    // Title
    ctx.fillStyle = c.textMuted;
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Hash Table with Separate Chaining', bucketX, startY - 8);

    for (var i = 0; i < tableSize; i++) {
      var y = startY + i * (BUCKET_H + bucketGap);

      // Index label to the left
      ctx.fillStyle = c.textMuted;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('[' + i + ']', bucketX - 6, y + BUCKET_H / 2 + 4);

      // Bucket rectangle
      var bucketColor = c.bucketEmpty;
      if (highlights.bucket === i && highlights.type === 'highlight') bucketColor = c.bucketHighlight;
      else if (highlights.bucket === i && highlights.type === 'new') bucketColor = c.nodeNew;
      else if (highlights.bucket === i && highlights.type === 'found') bucketColor = c.nodeFound;
      else if (highlights.bucket === i && highlights.type === 'collision') bucketColor = c.nodeCollision;
      else if (buckets[i] && buckets[i].length > 0) bucketColor = c.bucket;

      ctx.fillStyle = bucketColor;
      drawRoundRect(ctx, bucketX, y, BUCKET_W, BUCKET_H, BUCKET_R);
      ctx.fill();

      // Draw chain nodes extending to the right
      if (buckets[i] && buckets[i].length > 0) {
        var chainX = bucketX + BUCKET_W + 16;
        var chainY = y + (BUCKET_H - CHAIN_NODE_H) / 2;

        // Arrow from bucket to first chain node
        drawChainArrow(ctx, bucketX + BUCKET_W, y + BUCKET_H / 2, chainX, y + BUCKET_H / 2, c.arrow, c);

        for (var j = 0; j < buckets[i].length; j++) {
          var nx = chainX + j * (CHAIN_NODE_W + 24);
          var item = buckets[i][j];
          var nodeColor = c.node;

          if (highlights.bucket === i && highlights.nodeIndex === j) {
            if (highlights.type === 'new') nodeColor = c.nodeNew;
            else if (highlights.type === 'found') nodeColor = c.nodeFound;
            else if (highlights.type === 'delete') nodeColor = c.nodeDelete;
            else if (highlights.type === 'highlight') nodeColor = c.nodeHighlight;
            else if (highlights.type === 'collision') nodeColor = c.nodeCollision;
          }

          var displayKey = item.key;
          if (displayKey.length > 6) displayKey = displayKey.substring(0, 5) + '..';

          drawChainNode(ctx, nx, chainY, displayKey, nodeColor, c);

          // Draw value below the node
          ctx.fillStyle = c.textMuted;
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          var displayVal = String(item.value);
          if (displayVal.length > 7) displayVal = displayVal.substring(0, 6) + '..';
          ctx.fillText('v=' + displayVal, nx + CHAIN_NODE_W / 2, chainY + CHAIN_NODE_H + 11);

          // Arrow to next node
          if (j < buckets[i].length - 1) {
            drawChainArrow(ctx, nx + CHAIN_NODE_W, chainY + CHAIN_NODE_H / 2, nx + CHAIN_NODE_W + 24, chainY + CHAIN_NODE_H / 2, c.arrow, c);
          } else {
            // null marker at end
            var endX = nx + CHAIN_NODE_W + 4;
            ctx.fillStyle = c.textMuted;
            ctx.font = '10px JetBrains Mono, monospace';
            ctx.textAlign = 'left';
            ctx.fillText('null', endX + 2, chainY + CHAIN_NODE_H / 2 + 4);
          }
        }
      } else {
        // Empty bucket  - show "null" or "empty"
        ctx.fillStyle = c.textMuted;
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('empty', bucketX + BUCKET_W / 2, y + BUCKET_H / 2 + 4);
      }
    }
  }

  var themeCallbacks = [];
  function onThemeChange(cb) { themeCallbacks.push(cb); }
  var observer = new MutationObserver(function() {
    themeCallbacks.forEach(function(cb) { cb(); });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    getColors: getColors,
    setupCanvas: setupCanvas,
    drawRoundRect: drawRoundRect,
    drawBucket: drawBucket,
    drawChainNode: drawChainNode,
    drawChainArrow: drawChainArrow,
    drawBucketArray: drawBucketArray,
    drawChainedTable: drawChainedTable,
    hashString: hashString,
    getAsciiBreakdown: getAsciiBreakdown,
    BUCKET_W: BUCKET_W,
    BUCKET_H: BUCKET_H,
    CHAIN_NODE_W: CHAIN_NODE_W,
    CHAIN_NODE_H: CHAIN_NODE_H,
    onThemeChange: onThemeChange
  };
})();
</script>

A **hash table** (also called a hash map) is one of the most important data structures in computer science. It provides **average-case $$O(1)$$ time** for insertion, lookup, and deletion  - far faster than the $$O(n)$$ of arrays or $$O(\log n)$$ of balanced trees for search operations.

The core idea is simple: instead of searching through a collection to find a key, we **compute** exactly where the key should live using a **hash function**. The hash function converts a key (like a string) into an array index, giving us direct access to the value.

Hash tables power some of the most common constructs in programming:
- Python **dictionaries** (`dict`)
- JavaScript **objects** and `Map`
- Database **indexes**
- **Caches** and **memoization**
- **Symbol tables** in compilers

By the end of this guide you will understand:
- **Hash functions**  - how keys are converted to array indices
- **Collisions**  - what happens when two keys map to the same index
- **Separate chaining**  - resolving collisions with linked lists
- **Load factor and rehashing**  - keeping the table efficient

<div class="demo-hint">
<strong>How to use the demos:</strong> Each demo has input fields and buttons. Type a key, click an action, and watch the hash table respond visually  - buckets light up, chains grow, and collisions are resolved before your eyes.
</div>

---

## How Hash Functions Work

A hash function takes a key of arbitrary size and maps it to a **fixed-size integer**  - the index into our bucket array. A good hash function should:

1. **Be deterministic**  - the same key always produces the same hash
2. **Distribute uniformly**  - keys spread evenly across all buckets
3. **Be fast to compute**  - the whole point is speed

The simplest approach for strings is to sum the ASCII values of each character, then take the result **modulo** the table size:

$$h(\text{key}) = \left(\sum_{i=0}^{n-1} \text{ord}(\text{key}[i])\right) \mod \text{table\_size}$$

### Python Implementation

```python
def simple_hash(key, table_size):
    """Hash a string key by summing ASCII values mod table_size."""
    total = 0
    for char in key:
        total += ord(char)
    return total % table_size


# Example
key = "cat"
size = 7
index = simple_hash(key, size)
# ord('c')=99, ord('a')=97, ord('t')=116
# total = 99 + 97 + 116 = 312
# 312 % 7 = 4
print(f"'{key}' hashes to index {index}")  # 'cat' hashes to index 4
```

The `ord()` function returns the ASCII (Unicode code point) value of a character. Summing these values and taking the modulo ensures the result always falls within our array bounds $$[0, \text{table\_size})$$.

<div class="demo-hint">
<strong>Note:</strong> This simple hash function is fine for learning, but real-world hash tables use more sophisticated functions (like Python's built-in <code>hash()</code>) that reduce collisions through techniques like polynomial rolling hashes and bit mixing.
</div>

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> Type a key string and click <strong>Hash It</strong> to see the ASCII calculation step by step. Each character's code is shown, summed together, then the mod operation maps it to a bucket index. The target bucket lights up in the array below.
</div>

<div class="interactive-demo">
  <canvas id="hash-fn-canvas" width="680" height="250"></canvas>
  <div class="demo-controls">
    <label>Key: <input type="text" id="hash-fn-key" value="cat" maxlength="12" style="width:120px;"></label>
    <label>Table size: <input type="number" id="hash-fn-size" value="7" min="2" max="13" style="width:60px;"></label>
    <button id="hash-fn-go">Hash It</button>
    <button id="hash-fn-reset">Reset</button>
  </div>
  <div class="demo-info" id="hash-fn-info">Enter a key and click "Hash It"</div>
</div>

<script>
(function() {
  var H = window.DSA_Hash;
  var canvas = document.getElementById('hash-fn-canvas');
  var W = 680, HT = 250;
  var ctx = H.setupCanvas(canvas, W, HT);
  var tableSize = 7;
  var animTimer = null;
  var animStep = 0;
  var animData = null;

  function drawIdle() {
    var c = H.getColors();
    ctx.clearRect(0, 0, W, HT);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, HT);

    // Draw empty bucket array at bottom
    var bucketGap = 8;
    var totalBW = tableSize * H.BUCKET_W + (tableSize - 1) * bucketGap;
    var startX = Math.max(20, (W - totalBW) / 2);
    var bucketY = HT - H.BUCKET_H - 30;

    for (var i = 0; i < tableSize; i++) {
      var x = startX + i * (H.BUCKET_W + bucketGap);
      H.drawBucket(ctx, x, bucketY, i, c.bucketEmpty, c);
    }

    // Prompt text
    ctx.fillStyle = c.textMuted;
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Type a key and click "Hash It" to see the calculation', W / 2, 60);
  }

  function drawAnimFrame() {
    if (!animData) return;
    var c = H.getColors();
    ctx.clearRect(0, 0, W, HT);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, HT);

    var key = animData.key;
    var breakdown = animData.breakdown;
    var hash = animData.hash;
    var chars = breakdown.chars;
    var sum = breakdown.sum;

    // Top area: show characters and their ASCII values
    var charAreaY = 25;
    var charW = 44;
    var charGap = 6;
    var totalCharW = chars.length * charW + (chars.length - 1) * charGap;
    var charStartX = Math.max(40, (W - totalCharW) / 2);

    // Title: key = "..."
    ctx.fillStyle = c.text;
    ctx.font = 'bold 13px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('key = "' + key + '"', W / 2, charAreaY);

    // Draw each character box
    var runningSum = 0;
    var charsToShow = Math.min(animStep, chars.length);

    for (var i = 0; i < chars.length; i++) {
      var cx = charStartX + i * (charW + charGap);
      var cy = charAreaY + 16;

      // Character box
      var isActive = i < charsToShow;
      var isCurrent = i === charsToShow - 1 && animStep <= chars.length;

      ctx.fillStyle = isCurrent ? c.asciiChar : (isActive ? c.accent : c.border);
      ctx.globalAlpha = isActive ? 1.0 : 0.4;
      H.drawRoundRect(ctx, cx, cy, charW, 30, 4);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Character label
      ctx.fillStyle = isActive ? c.textOnNode : c.textMuted;
      ctx.font = 'bold 14px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText("'" + chars[i].char + "'", cx + charW / 2, cy + 20);

      // ASCII value below
      if (isActive) {
        ctx.fillStyle = c.asciiVal;
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(chars[i].code), cx + charW / 2, cy + 46);
        runningSum += chars[i].code;
      }
    }

    // Running sum line
    var sumLineY = charAreaY + 78;
    if (charsToShow > 0) {
      var parts = [];
      for (var j = 0; j < charsToShow; j++) {
        parts.push(String(chars[j].code));
      }
      var sumExpr = parts.join(' + ');
      if (charsToShow < chars.length) sumExpr += ' + ...';
      sumExpr += ' = ' + runningSum;

      ctx.fillStyle = c.text;
      ctx.font = '13px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sumExpr, W / 2, sumLineY);
    }

    // Mod operation (show after all chars revealed)
    var modLineY = sumLineY + 24;
    if (animStep > chars.length) {
      ctx.fillStyle = c.modResult;
      ctx.font = 'bold 13px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(sum + ' % ' + tableSize + ' = ' + hash, W / 2, modLineY);

      // Arrow pointing down to bucket
      var arrowY1 = modLineY + 8;
      var bucketGap2 = 8;
      var totalBW2 = tableSize * H.BUCKET_W + (tableSize - 1) * bucketGap2;
      var startX2 = Math.max(20, (W - totalBW2) / 2);
      var targetBucketX = startX2 + hash * (H.BUCKET_W + bucketGap2) + H.BUCKET_W / 2;
      var bucketY2 = HT - H.BUCKET_H - 30;
      var arrowY2 = bucketY2 - 4;

      ctx.strokeStyle = c.modResult;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(W / 2, arrowY1);
      ctx.lineTo(W / 2, arrowY1 + 10);
      ctx.lineTo(targetBucketX, arrowY2 - 10);
      ctx.lineTo(targetBucketX, arrowY2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrowhead
      ctx.fillStyle = c.modResult;
      ctx.beginPath();
      ctx.moveTo(targetBucketX, arrowY2);
      ctx.lineTo(targetBucketX - 4, arrowY2 - 7);
      ctx.lineTo(targetBucketX + 4, arrowY2 - 7);
      ctx.closePath();
      ctx.fill();
    }

    // Draw bucket array at bottom
    var bucketGap3 = 8;
    var totalBW3 = tableSize * H.BUCKET_W + (tableSize - 1) * bucketGap3;
    var startX3 = Math.max(20, (W - totalBW3) / 2);
    var bucketY3 = HT - H.BUCKET_H - 30;

    for (var k = 0; k < tableSize; k++) {
      var bx = startX3 + k * (H.BUCKET_W + bucketGap3);
      var bColor = c.bucketEmpty;
      if (animStep > chars.length && k === hash) {
        bColor = c.nodeNew;
        // Draw key inside the target bucket
        ctx.fillStyle = bColor;
        H.drawRoundRect(ctx, bx, bucketY3, H.BUCKET_W, H.BUCKET_H, 6);
        ctx.fill();
        ctx.fillStyle = c.textOnNode;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        var dKey = key.length > 7 ? key.substring(0, 6) + '..' : key;
        ctx.fillText(dKey, bx + H.BUCKET_W / 2, bucketY3 + H.BUCKET_H / 2 + 4);
        // Index label
        ctx.fillStyle = c.textMuted;
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[' + k + ']', bx + H.BUCKET_W / 2, bucketY3 + H.BUCKET_H + 14);
      } else {
        H.drawBucket(ctx, bx, bucketY3, k, bColor, c);
      }
    }
  }

  function runAnimation() {
    var key = document.getElementById('hash-fn-key').value.trim();
    tableSize = parseInt(document.getElementById('hash-fn-size').value) || 7;
    if (tableSize < 2) tableSize = 2;
    if (tableSize > 13) tableSize = 13;
    if (!key) { document.getElementById('hash-fn-info').textContent = 'Please enter a key'; return; }
    if (key.length > 12) key = key.substring(0, 12);

    var breakdown = H.getAsciiBreakdown(key);
    var hash = breakdown.sum % tableSize;

    animData = { key: key, breakdown: breakdown, hash: hash };
    animStep = 0;
    if (animTimer) clearInterval(animTimer);

    var totalSteps = breakdown.chars.length + 2; // chars + mod + settle

    animTimer = setInterval(function() {
      animStep++;
      drawAnimFrame();

      // Update info text
      if (animStep <= breakdown.chars.length) {
        var ch = breakdown.chars[animStep - 1];
        document.getElementById('hash-fn-info').textContent = "'" + ch.char + "' -> ord('" + ch.char + "') = " + ch.code;
      } else if (animStep === breakdown.chars.length + 1) {
        document.getElementById('hash-fn-info').textContent = 'Sum = ' + breakdown.sum + '  |  ' + breakdown.sum + ' % ' + tableSize + ' = ' + hash + '  ->  bucket [' + hash + ']';
      }

      if (animStep >= totalSteps) {
        clearInterval(animTimer);
        animTimer = null;
      }
    }, 450);
  }

  drawIdle();
  H.onThemeChange(function() {
    if (animData && animStep > 0) drawAnimFrame();
    else drawIdle();
  });

  document.getElementById('hash-fn-go').onclick = runAnimation;
  document.getElementById('hash-fn-key').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') runAnimation();
  });
  document.getElementById('hash-fn-reset').onclick = function() {
    if (animTimer) clearInterval(animTimer);
    animData = null;
    animStep = 0;
    tableSize = parseInt(document.getElementById('hash-fn-size').value) || 7;
    drawIdle();
    document.getElementById('hash-fn-info').textContent = 'Enter a key and click "Hash It"';
  };
  document.getElementById('hash-fn-size').onchange = function() {
    tableSize = parseInt(this.value) || 7;
    if (tableSize < 2) { tableSize = 2; this.value = 2; }
    if (tableSize > 13) { tableSize = 13; this.value = 13; }
    if (animData) {
      animData.hash = animData.breakdown.sum % tableSize;
      drawAnimFrame();
    } else {
      drawIdle();
    }
  };
})();
</script>

---

## Collisions and Why They Happen

What happens when two different keys produce the **same hash value**? This is called a **collision**.

Consider a table of size 7:
- `"cat"`: ord('c') + ord('a') + ord('t') = 99 + 97 + 116 = 312, and 312 % 7 = **4**
- `"act"`: ord('a') + ord('c') + ord('t') = 97 + 99 + 116 = 312, and 312 % 7 = **4**

Both `"cat"` and `"act"` hash to index 4. This is inevitable  - with more keys than buckets (the **pigeonhole principle**), collisions **must** occur. The question is how we handle them.

The two main strategies are:
1. **Separate chaining**  - each bucket holds a linked list of entries
2. **Open addressing**  - probe for the next available bucket

We will focus on **separate chaining**, which is the most intuitive approach and the one used by Python's `dict` (in a highly optimized form).

---

## Separate Chaining

With separate chaining, each bucket stores a **linked list** (or any dynamic collection). When a collision occurs, we simply append the new entry to the chain at that bucket index.

To **look up** a key, we hash it to find the bucket, then walk the chain comparing keys until we find a match (or reach the end).

### Python Implementation

```python
class HashTable:
    def __init__(self, size=7):
        self.size = size
        self.table = [[] for _ in range(size)]
        self.count = 0

    def _hash(self, key):
        """Sum of ASCII values mod table size."""
        total = 0
        for char in str(key):
            total += ord(char)
        return total % self.size

    def insert(self, key, value):
        """Insert a key-value pair (update if key exists)."""
        index = self._hash(key)
        bucket = self.table[index]

        # Check if key already exists  - update it
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return

        # New key  - append to chain
        bucket.append((key, value))
        self.count += 1

    def get(self, key):
        """Retrieve value by key. Returns None if not found."""
        index = self._hash(key)
        bucket = self.table[index]

        for k, v in bucket:
            if k == key:
                return v
        return None

    def delete(self, key):
        """Remove a key-value pair. Returns True if found."""
        index = self._hash(key)
        bucket = self.table[index]

        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self.count -= 1
                return True
        return False

    def __str__(self):
        lines = []
        for i, bucket in enumerate(self.table):
            chain = " -> ".join(f"({k}: {v})" for k, v in bucket)
            lines.append(f"[{i}]: {chain if chain else 'empty'}")
        return "\n".join(lines)
```

### Using the Hash Table

```python
ht = HashTable(size=7)

ht.insert("cat", 10)
ht.insert("dog", 20)
ht.insert("act", 30)  # collides with "cat"
ht.insert("bat", 40)
ht.insert("elk", 50)

print(ht)
# [0]: empty
# [1]: (bat: 40)
# [2]: (elk: 50)
# [3]: (dog: 20)
# [4]: (cat: 10) -> (act: 30)   <-- collision chain!
# [5]: empty
# [6]: empty

print(ht.get("act"))   # 30
print(ht.get("cat"))   # 10
print(ht.get("fox"))   # None

ht.delete("cat")
print(ht.get("cat"))   # None
print(ht.get("act"))   # 30 (still there!)
```

Notice how `"cat"` and `"act"` share bucket [4] as a chain. The `get()` method walks the chain to find the exact key match. Deleting `"cat"` from the chain does not affect `"act"`.

### Time Complexity

| Operation | Average | Worst Case |
|-----------|---------|------------|
| Insert    | $$O(1)$$ | $$O(n)$$  |
| Get       | $$O(1)$$ | $$O(n)$$  |
| Delete    | $$O(1)$$ | $$O(n)$$  |

**Average case** is $$O(1)$$ because a good hash function distributes keys evenly, keeping chains short. **Worst case** is $$O(n)$$ when all keys collide into a single bucket (forming one long chain). This is why hash function quality and table resizing matter.

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> Insert key-value pairs into the hash table. When two keys hash to the same bucket, you will see a chain form. Use <strong>Get</strong> to search and <strong>Delete</strong> to remove entries. The table uses separate chaining to handle collisions.
</div>

<div class="interactive-demo">
  <canvas id="chain-canvas" width="680" height="300"></canvas>
  <div class="demo-controls">
    <label>Key: <input type="text" id="chain-key" value="cat" maxlength="10" style="width:100px;"></label>
    <label>Value: <input type="text" id="chain-value" value="10" maxlength="6" style="width:60px;"></label>
    <button id="chain-insert">Insert</button>
    <button id="chain-get">Get</button>
    <button id="chain-delete">Delete</button>
    <button id="chain-reset">Reset</button>
  </div>
  <div class="demo-info" id="chain-info">Insert key-value pairs to build the hash table</div>
</div>

<script>
(function() {
  var H = window.DSA_Hash;
  var canvas = document.getElementById('chain-canvas');
  var W = 680, HT = 300;
  var ctx = H.setupCanvas(canvas, W, HT);
  var TABLE_SIZE = 7;

  // Each bucket is an array of { key, value }
  var buckets = [];
  for (var i = 0; i < TABLE_SIZE; i++) buckets.push([]);

  var highlight = {};
  var flashTimer = null;

  function hashKey(key) {
    return H.hashString(key, TABLE_SIZE);
  }

  function draw() {
    H.drawChainedTable(ctx, W, HT, TABLE_SIZE, buckets, highlight);
  }

  function setInfo(msg) {
    document.getElementById('chain-info').textContent = msg;
  }

  function flashHighlight(bucket, nodeIndex, type, msg, duration) {
    highlight = { bucket: bucket, nodeIndex: nodeIndex, type: type };
    draw();
    setInfo(msg);
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(function() {
      highlight = {};
      draw();
    }, duration || 1200);
  }

  function getTableSummary() {
    var items = [];
    for (var i = 0; i < TABLE_SIZE; i++) {
      for (var j = 0; j < buckets[i].length; j++) {
        items.push(buckets[i][j].key + ':' + buckets[i][j].value);
      }
    }
    return items.length > 0 ? '{' + items.join(', ') + '}' : '(empty)';
  }

  draw();
  H.onThemeChange(draw);

  // Insert operation with step-by-step animation
  document.getElementById('chain-insert').onclick = function() {
    var key = document.getElementById('chain-key').value.trim();
    var value = document.getElementById('chain-value').value.trim();
    if (!key) { setInfo('Please enter a key'); return; }
    if (!value) value = '0';

    var index = hashKey(key);
    var bucket = buckets[index];
    var breakdown = H.getAsciiBreakdown(key);
    var hashInfo = 'hash("' + key + '") = ' + breakdown.sum + ' % ' + TABLE_SIZE + ' = ' + index;

    // Check if key already exists (update)
    for (var i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        var oldVal = bucket[i].value;
        bucket[i].value = value;
        flashHighlight(index, i, 'highlight', hashInfo + ' | Updated "' + key + '": ' + oldVal + ' -> ' + value, 1500);
        return;
      }
    }

    // Check for collision
    var isCollision = bucket.length > 0;
    bucket.push({ key: key, value: value });
    var nodeIdx = bucket.length - 1;

    if (isCollision) {
      // First flash collision color, then switch to new color
      highlight = { bucket: index, nodeIndex: nodeIdx, type: 'collision' };
      draw();
      setInfo(hashInfo + ' | COLLISION! Chaining "' + key + '" at bucket [' + index + ']');
      if (flashTimer) clearTimeout(flashTimer);
      flashTimer = setTimeout(function() {
        highlight = { bucket: index, nodeIndex: nodeIdx, type: 'new' };
        draw();
        flashTimer = setTimeout(function() {
          highlight = {};
          draw();
        }, 800);
      }, 800);
    } else {
      flashHighlight(index, nodeIdx, 'new', hashInfo + ' | Inserted "' + key + '" at bucket [' + index + ']', 1200);
    }
  };

  // Get operation
  document.getElementById('chain-get').onclick = function() {
    var key = document.getElementById('chain-key').value.trim();
    if (!key) { setInfo('Please enter a key to search'); return; }

    var index = hashKey(key);
    var bucket = buckets[index];
    var breakdown = H.getAsciiBreakdown(key);
    var hashInfo = 'hash("' + key + '") = ' + breakdown.sum + ' % ' + TABLE_SIZE + ' = ' + index;

    // Walk the chain step by step
    if (bucket.length === 0) {
      flashHighlight(index, -1, 'highlight', hashInfo + ' | Bucket [' + index + '] is empty. "' + key + '" not found.', 1500);
      return;
    }

    var found = false;
    var stepIdx = 0;
    if (flashTimer) clearTimeout(flashTimer);

    function searchStep() {
      if (stepIdx >= bucket.length) {
        flashHighlight(index, -1, 'highlight', hashInfo + ' | "' + key + '" not found in chain at bucket [' + index + ']', 1500);
        return;
      }
      var item = bucket[stepIdx];
      if (item.key === key) {
        flashHighlight(index, stepIdx, 'found', hashInfo + ' | Found "' + key + '" = ' + item.value + ' at bucket [' + index + '], position ' + stepIdx, 2000);
        return;
      }
      // Highlight current node being checked
      highlight = { bucket: index, nodeIndex: stepIdx, type: 'highlight' };
      draw();
      setInfo(hashInfo + ' | Checking "' + item.key + '" != "' + key + '", moving to next...');
      stepIdx++;
      flashTimer = setTimeout(searchStep, 600);
    }
    searchStep();
  };

  // Delete operation
  document.getElementById('chain-delete').onclick = function() {
    var key = document.getElementById('chain-key').value.trim();
    if (!key) { setInfo('Please enter a key to delete'); return; }

    var index = hashKey(key);
    var bucket = buckets[index];
    var breakdown = H.getAsciiBreakdown(key);
    var hashInfo = 'hash("' + key + '") = ' + breakdown.sum + ' % ' + TABLE_SIZE + ' = ' + index;

    for (var i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        // Flash delete color, then remove
        highlight = { bucket: index, nodeIndex: i, type: 'delete' };
        draw();
        setInfo(hashInfo + ' | Deleting "' + key + '" from bucket [' + index + ']...');
        if (flashTimer) clearTimeout(flashTimer);
        flashTimer = setTimeout(function() {
          bucket.splice(i, 1);
          highlight = {};
          draw();
          setInfo('Deleted "' + key + '". Table: ' + getTableSummary());
        }, 700);
        return;
      }
    }

    flashHighlight(index, -1, 'highlight', hashInfo + ' | "' + key + '" not found  - nothing to delete', 1500);
  };

  // Reset
  document.getElementById('chain-reset').onclick = function() {
    if (flashTimer) clearTimeout(flashTimer);
    buckets = [];
    for (var j = 0; j < TABLE_SIZE; j++) buckets.push([]);
    highlight = {};
    draw();
    setInfo('Table cleared. Insert key-value pairs to build the hash table.');
  };

  // Enter key on input fields triggers insert
  document.getElementById('chain-key').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('chain-insert').click();
  });
  document.getElementById('chain-value').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('chain-insert').click();
  });
})();
</script>

<div class="demo-hint">
<strong>Try this:</strong> Insert <code>cat:10</code>, then <code>act:30</code>. Both hash to the same bucket (they are anagrams with the same ASCII sum), so you will see a chain form. Then try <strong>Get</strong> for <code>act</code>  - watch the search walk the chain.
</div>

---

## Collision Patterns

Why do some keys collide more than others? Our simple sum-of-ASCII hash treats anagrams identically  - `"cat"`, `"act"`, and `"tac"` all produce the same sum (312). A better hash function would incorporate **positional information**:

### Improved Hash: Polynomial Rolling Hash

```python
def better_hash(key, table_size):
    """Polynomial rolling hash  - position-aware."""
    total = 0
    base = 31  # small prime
    for i, char in enumerate(key):
        total += ord(char) * (base ** i)
    return total % table_size


# Now anagrams hash differently:
print(better_hash("cat", 7))  # different from
print(better_hash("act", 7))  # this!
```

By multiplying each character's code by an increasing power of a prime base, the hash becomes **position-sensitive**. The character `'c'` at index 0 contributes differently than `'c'` at index 1. This dramatically reduces collisions for real-world data.

Python's built-in `hash()` uses an even more sophisticated algorithm (SipHash) that provides both good distribution and protection against hash collision attacks.

---

## Load Factor and Rehashing

The **load factor** of a hash table is the ratio of stored entries to table size:

$$\alpha = \frac{n}{\text{table\_size}}$$

where $$n$$ is the number of entries. The load factor directly affects performance:

| Load Factor | Effect |
|-------------|--------|
| $$\alpha < 0.5$$ | Plenty of empty buckets, very few collisions |
| $$\alpha \approx 0.7$$ | Good balance of space and speed (common threshold) |
| $$\alpha > 1.0$$ | More entries than buckets, chains are guaranteed |
| $$\alpha \gg 1$$ | Long chains, performance degrades toward $$O(n)$$ |

When the load factor exceeds a threshold (commonly 0.7 or 0.75), the table triggers a **rehash**: it creates a new, larger array (typically 2x the size), then re-inserts every entry using the new table size for the mod operation.

### Python Implementation

```python
class HashTable:
    def __init__(self, size=7):
        self.size = size
        self.table = [[] for _ in range(size)]
        self.count = 0
        self.load_threshold = 0.7

    def _hash(self, key):
        total = 0
        for char in str(key):
            total += ord(char)
        return total % self.size

    def load_factor(self):
        return self.count / self.size

    def _rehash(self):
        """Double the table size and re-insert all entries."""
        old_table = self.table
        self.size = self.size * 2
        self.table = [[] for _ in range(self.size)]
        self.count = 0

        for bucket in old_table:
            for key, value in bucket:
                self.insert(key, value)

    def insert(self, key, value):
        # Check load factor before inserting
        if self.load_factor() >= self.load_threshold:
            self._rehash()

        index = self._hash(key)
        bucket = self.table[index]

        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return

        bucket.append((key, value))
        self.count += 1
```

Rehashing is an $$O(n)$$ operation, but it happens infrequently. Because the table doubles in size each time, the **amortized** cost of insertion remains $$O(1)$$  - the same principle behind dynamic arrays (like Python lists).

### Visualizing Load Factor

<div class="demo-hint">
<strong>Interactive:</strong> Insert keys and watch the load factor grow. When it reaches the threshold (0.70), the table automatically rehashes  - doubling in size and redistributing all entries. Notice how entries may land in different buckets after rehashing because the table size changes the mod operation.
</div>

<div class="interactive-demo">
  <canvas id="rehash-canvas" width="680" height="300"></canvas>
  <div class="demo-controls">
    <label>Key: <input type="text" id="rehash-key" value="" maxlength="10" style="width:100px;"></label>
    <button id="rehash-insert">Insert</button>
    <button id="rehash-auto">Auto-Fill</button>
    <button id="rehash-reset">Reset</button>
  </div>
  <div class="demo-info" id="rehash-info">Size: 7 | Items: 0 | Load factor: 0.00 / 0.70</div>
</div>

<script>
(function() {
  var H = window.DSA_Hash;
  var canvas = document.getElementById('rehash-canvas');
  var W = 680, HT = 300;
  var ctx = H.setupCanvas(canvas, W, HT);

  var tableSize = 7;
  var buckets = [];
  var count = 0;
  var LOAD_THRESHOLD = 0.70;
  var allEntries = []; // track all inserted { key, value } for rehashing
  var flashTimer = null;
  var autoTimer = null;
  var autoKeys = ['cat', 'dog', 'bat', 'elk', 'fox', 'owl', 'ant', 'bee', 'cow', 'emu', 'hen', 'jay', 'ram', 'yak'];
  var autoIdx = 0;

  function initBuckets() {
    buckets = [];
    for (var i = 0; i < tableSize; i++) buckets.push([]);
    count = 0;
  }
  initBuckets();

  function hashKey(key) {
    return H.hashString(key, tableSize);
  }

  function loadFactor() {
    return count / tableSize;
  }

  function draw(hl) {
    H.drawChainedTable(ctx, W, HT, tableSize, buckets, hl || {});
  }

  function updateInfo(extra) {
    var lf = loadFactor().toFixed(2);
    var text = 'Size: ' + tableSize + ' | Items: ' + count + ' | Load factor: ' + lf + ' / ' + LOAD_THRESHOLD.toFixed(2);
    if (extra) text += ' | ' + extra;
    document.getElementById('rehash-info').textContent = text;
  }

  function doInsert(key, value, skipRehashCheck) {
    // Check load factor
    if (!skipRehashCheck && loadFactor() >= LOAD_THRESHOLD) {
      doRehash(function() {
        doInsert(key, value, true);
      });
      return;
    }

    var index = hashKey(key);
    var bucket = buckets[index];

    // Check for existing key
    for (var i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket[i].value = value;
        draw({ bucket: index, nodeIndex: i, type: 'highlight' });
        updateInfo('Updated "' + key + '"');
        if (flashTimer) clearTimeout(flashTimer);
        flashTimer = setTimeout(function() { draw(); updateInfo(); }, 800);
        return;
      }
    }

    bucket.push({ key: key, value: value });
    count++;
    allEntries.push({ key: key, value: value });

    var nodeIdx = bucket.length - 1;
    var isCollision = bucket.length > 1;
    var type = isCollision ? 'collision' : 'new';

    draw({ bucket: index, nodeIndex: nodeIdx, type: type });
    updateInfo((isCollision ? 'Collision! ' : '') + 'Inserted "' + key + '" -> [' + index + ']');
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(function() { draw(); updateInfo(); }, 900);
  }

  function doRehash(callback) {
    var oldSize = tableSize;
    tableSize = tableSize * 2;
    var oldBuckets = buckets;

    // Flash to indicate rehash
    draw();
    updateInfo('REHASHING! ' + oldSize + ' -> ' + tableSize);

    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(function() {
      // Re-insert all entries into new table
      initBuckets();
      for (var i = 0; i < allEntries.length; i++) {
        var entry = allEntries[i];
        var idx = hashKey(entry.key);
        var bkt = buckets[idx];
        var exists = false;
        for (var j = 0; j < bkt.length; j++) {
          if (bkt[j].key === entry.key) { bkt[j].value = entry.value; exists = true; break; }
        }
        if (!exists) { bkt.push({ key: entry.key, value: entry.value }); count++; }
      }
      draw();
      updateInfo('Rehash complete! New size: ' + tableSize);
      if (callback) {
        flashTimer = setTimeout(function() {
          callback();
        }, 400);
      }
    }, 600);
  }

  draw();
  updateInfo();
  H.onThemeChange(function() { draw(); });

  document.getElementById('rehash-insert').onclick = function() {
    var key = document.getElementById('rehash-key').value.trim();
    if (!key) { updateInfo('Please enter a key'); return; }
    doInsert(key, String(count + 1));
  };

  document.getElementById('rehash-key').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('rehash-insert').click();
  });

  document.getElementById('rehash-auto').onclick = function() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; document.getElementById('rehash-auto').textContent = 'Auto-Fill'; return; }
    document.getElementById('rehash-auto').textContent = 'Stop';
    autoTimer = setInterval(function() {
      if (autoIdx >= autoKeys.length) {
        clearInterval(autoTimer);
        autoTimer = null;
        document.getElementById('rehash-auto').textContent = 'Auto-Fill';
        return;
      }
      var key = autoKeys[autoIdx];
      document.getElementById('rehash-key').value = key;
      doInsert(key, String(autoIdx + 1));
      autoIdx++;
    }, 1400);
  };

  document.getElementById('rehash-reset').onclick = function() {
    if (flashTimer) clearTimeout(flashTimer);
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; document.getElementById('rehash-auto').textContent = 'Auto-Fill'; }
    tableSize = 7;
    initBuckets();
    allEntries = [];
    autoIdx = 0;
    draw();
    updateInfo();
  };
})();
</script>

<div class="demo-hint">
<strong>Try this:</strong> Click <strong>Auto-Fill</strong> to watch keys being inserted one by one. When the load factor hits 0.70, the table doubles from 7 to 14 buckets. Notice how all entries get new positions because the mod divisor changed.
</div>

---

## Open Addressing (Brief Overview)

An alternative to separate chaining is **open addressing**, where all entries live directly in the bucket array (no linked lists). When a collision occurs, we probe for the next empty slot using a probing sequence.

The most common probing strategies are:

**Linear probing**  - check the next slot, then the next, and so on:

```python
def _probe_linear(self, key):
    index = self._hash(key)
    for i in range(self.size):
        probe_idx = (index + i) % self.size
        if self.table[probe_idx] is None or self.table[probe_idx][0] == key:
            return probe_idx
    raise Exception("Table is full")
```

**Quadratic probing**  - check positions at increasing square offsets (index + 1, index + 4, index + 9, ...):

```python
def _probe_quadratic(self, key):
    index = self._hash(key)
    for i in range(self.size):
        probe_idx = (index + i * i) % self.size
        if self.table[probe_idx] is None or self.table[probe_idx][0] == key:
            return probe_idx
    raise Exception("Table is full")
```

Open addressing has better cache performance (no pointer chasing) but is more sensitive to high load factors. Python's `dict` actually uses open addressing internally with a custom probing scheme, combined with a load factor threshold of about 2/3.

---

## Hash Tables in Python

Python dictionaries are hash tables. You have been using them all along:

```python
# Python dict IS a hash table
phonebook = {}
phonebook["Alice"] = "555-0101"
phonebook["Bob"] = "555-0102"
phonebook["Charlie"] = "555-0103"

# O(1) average lookup
print(phonebook["Bob"])       # "555-0102"
print("Alice" in phonebook)   # True

# O(1) average deletion
del phonebook["Charlie"]
```

Python also provides `set`, which is a hash table that stores only keys (no values)  - perfect for membership testing:

```python
visited = set()
visited.add("page_a")
visited.add("page_b")

print("page_a" in visited)  # True  - O(1)
print("page_c" in visited)  # False  - O(1)
```

### When to Use Hash Tables

| Use Case | Why Hash Tables Work |
|----------|---------------------|
| Counting frequencies | O(1) increment per element |
| Detecting duplicates | O(1) membership check with sets |
| Caching/memoization | O(1) lookup for previously computed results |
| Two-sum problems | O(1) complement lookup |
| Graph adjacency lists | O(1) neighbor access |
| Database indexing | O(1) record lookup by key |

### Common Patterns in Coding Interviews

```python
# 1. Frequency counter
def char_frequency(s):
    freq = {}
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    return freq


# 2. Two-sum using a hash map
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []


# 3. Check for duplicates
def has_duplicates(lst):
    return len(lst) != len(set(lst))
```

---

## Complexity Summary

| Operation | Average | Worst Case | Notes |
|-----------|---------|------------|-------|
| Insert | $$O(1)$$ | $$O(n)$$ | Worst case: all keys collide |
| Lookup | $$O(1)$$ | $$O(n)$$ | Chain traversal in worst case |
| Delete | $$O(1)$$ | $$O(n)$$ | Must find key in chain first |
| Rehash | $$O(n)$$ | $$O(n)$$ | Amortized $$O(1)$$ per insert |
| Space  | $$O(n)$$ | $$O(n)$$ | Proportional to entries stored |

The $$O(1)$$ average case assumes a **good hash function** and a **reasonable load factor**. In practice, well-implemented hash tables (like Python's `dict`) maintain these properties automatically through rehashing and sophisticated hash functions.

---

## Key Takeaways

1. **Hash tables** provide $$O(1)$$ average-case insert, lookup, and delete by converting keys into array indices via a hash function.

2. **Collisions are inevitable** (pigeonhole principle). The two main resolution strategies are **separate chaining** (linked lists per bucket) and **open addressing** (probing for empty slots).

3. **Load factor** (entries / table size) determines performance. When it exceeds a threshold, the table **rehashes**  - doubling in size and re-inserting all entries. This keeps chains short and lookups fast.

4. **Hash function quality** is critical. A poor hash function causes clustering and long chains. Good hash functions distribute keys uniformly and are position-sensitive.

5. **Python's `dict` and `set`** are production-grade hash tables. Use them freely  - they handle hashing, collision resolution, and rehashing automatically.

---

## What's Next?

Hash tables are the foundation for many advanced data structures: **Bloom filters** for probabilistic membership testing, **consistent hashing** for distributed systems, and **cuckoo hashing** for worst-case $$O(1)$$ lookups. They also appear in nearly every coding interview  - mastering them is essential.

Explore the full [DSA in Python series]({{ site.baseurl }}/dsa/).
