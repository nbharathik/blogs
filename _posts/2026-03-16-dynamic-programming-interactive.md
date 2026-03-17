---
layout: post
title: "Dynamic Programming: An Interactive Guide"
author: bharathikannan
categories: [Data Structures]
description: "Master dynamic programming visually. Step through Fibonacci, Knapsack, LCS, and Edit Distance  - watch DP tables fill cell by cell, all in your browser."
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
.demo-controls input[type="number"] {
  width: 70px;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', monospace;
}
.demo-controls input[type="text"] {
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
.dp-table {
  border-collapse: collapse;
  font-size: 0.82rem;
  font-family: 'JetBrains Mono', monospace;
  margin: 0.5rem auto;
  width: auto;
}
.dp-table th, .dp-table td {
  padding: 0.35rem 0.55rem;
  border: 1px solid var(--border);
  text-align: center;
  min-width: 38px;
  height: 32px;
  transition: background 0.25s, color 0.2s;
}
.dp-table th {
  background: var(--bg-secondary);
  font-weight: 600;
  position: sticky;
  top: 0;
}
.dp-table td.dp-active {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
  z-index: 1;
  position: relative;
}
.dp-table td.dp-filled {
  background: var(--bg-secondary);
}
.dp-table td.dp-highlight {
  background: var(--accent);
  color: #fff;
  font-weight: 700;
}
.dp-table td.dp-match {
  background: #16a34a;
  color: #fff;
  font-weight: 700;
}
.dp-table td.dp-path {
  background: #f59e0b;
  color: #1a1b26;
  font-weight: 700;
}
.dp-table td.dp-include {
  background: #16a34a;
  color: #fff;
  font-weight: 700;
}
.dp-table td.dp-exclude {
  background: #e63946;
  color: #fff;
  font-weight: 700;
}
.dp-table td.dp-replace {
  background: #f59e0b;
  color: #1a1b26;
  font-weight: 700;
}
.dp-table td.dp-insert {
  background: #2563eb;
  color: #fff;
  font-weight: 700;
}
.dp-table td.dp-delete {
  background: #e63946;
  color: #fff;
  font-weight: 700;
}
.dp-table-wrapper {
  overflow-x: auto;
  max-width: 100%;
}
.dp-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
}
.dp-legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.dp-legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: inline-block;
}
</style>

<script>
// Shared utilities for all DP demos
window.DSA_DP = (function() {
  function getColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg: dark ? '#1a1b26' : '#ffffff',
      cell: dark ? '#7aa2f7' : '#2563eb',
      cellActive: dark ? '#ff9e64' : '#f59e0b',
      cellFilled: dark ? '#292e42' : '#f1f5f9',
      cellMatch: dark ? '#9ece6a' : '#16a34a',
      cellPath: dark ? '#ff9e64' : '#f59e0b',
      cellInclude: dark ? '#9ece6a' : '#16a34a',
      cellExclude: dark ? '#f7768e' : '#e63946',
      cellReplace: dark ? '#ff9e64' : '#f59e0b',
      cellInsert: dark ? '#7aa2f7' : '#2563eb',
      cellDelete: dark ? '#f7768e' : '#e63946',
      text: dark ? '#c0caf5' : '#1a1b26',
      textMuted: dark ? '#565f89' : '#6b7280',
      textOnColor: '#ffffff',
      grid: dark ? '#292e42' : '#e5e7eb',
      treeLine: dark ? '#565f89' : '#9ca3af',
      treeNode: dark ? '#7aa2f7' : '#2563eb',
      treeNodeActive: dark ? '#ff9e64' : '#f59e0b',
      treeNodeCached: dark ? '#9ece6a' : '#16a34a',
      treeNodeDuplicate: dark ? '#f7768e' : '#e63946',
      dpBar: dark ? '#9ece6a' : '#16a34a',
      dpBarActive: dark ? '#ff9e64' : '#f59e0b'
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

  var themeCallbacks = [];
  function onThemeChange(cb) { themeCallbacks.push(cb); }
  var observer = new MutationObserver(function() {
    themeCallbacks.forEach(function(cb) { try { cb(); } catch(e) {} });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    getColors: getColors,
    setupCanvas: setupCanvas,
    onThemeChange: onThemeChange
  };
})();
</script>

Dynamic programming (DP) is one of the most powerful algorithmic techniques in computer science. It transforms problems that would take exponential time into elegant polynomial-time solutions by recognizing and reusing repeated work.

In this interactive guide, we will build **four classic DP algorithms from scratch** in Python. You will watch DP tables fill cell by cell, see recursion trees explode in size, and understand exactly *why* DP is so efficient.

By the end of this post you will understand:
- **The core idea** - overlapping subproblems and optimal substructure
- **Fibonacci** - the "hello world" of DP, recursion vs memoization vs tabulation
- **0/1 Knapsack** - choosing items to maximize value under a weight limit
- **Longest Common Subsequence** - finding the longest shared subsequence of two strings
- **Edit Distance** - the minimum operations to transform one string into another

<div class="demo-hint">
<strong>How to use the interactive demos:</strong> Each section has a hands-on visualization. Click <strong>Step</strong> to advance one cell at a time, or <strong>Run</strong> to auto-play. Click <strong>Reset</strong> to start over. You can modify inputs and watch the algorithm adapt.
</div>

---

## What Is Dynamic Programming?

Dynamic programming is not really about "programming" in the coding sense. The name comes from Richard Bellman, who coined it in the 1950s. It is a method for solving complex problems by breaking them into simpler **overlapping subproblems**.

Two conditions must hold for a problem to be solvable with DP:

**1. Overlapping Subproblems**  - The same subproblem is solved multiple times. Instead of recomputing the answer each time, we store it and look it up.

**2. Optimal Substructure**  - The optimal solution to the problem can be constructed from optimal solutions of its subproblems.

### Memoization vs Tabulation

There are two main approaches to implementing DP:

- **Memoization (Top-Down):** Start from the original problem and recursively break it down. Cache results of subproblems as you go. This is like adding a "memory" to recursion.

- **Tabulation (Bottom-Up):** Build a table starting from the smallest subproblems and iteratively fill in larger ones. No recursion needed.

Both approaches yield the same time complexity, but tabulation avoids recursion overhead and is generally preferred for production code.

---

## Fibonacci: Recursion vs Dynamic Programming

The Fibonacci sequence is the classic introduction to DP. Each number is the sum of the two preceding ones:

$$F(n) = F(n-1) + F(n-2), \quad F(0) = 0, \quad F(1) = 1$$

The sequence goes: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...

### The Naive Recursive Approach

The simplest approach directly translates the mathematical definition into code:

```python
def fib_recursive(n):
    if n <= 1:
        return n
    return fib_recursive(n - 1) + fib_recursive(n - 2)
```

This is clean and readable, but it has a fatal flaw: it recomputes the same values over and over. To compute `fib(5)`, it computes `fib(3)` twice, `fib(2)` three times, and so on. The time complexity is $$O(2^n)$$  - exponential. For `fib(40)`, that is over a billion function calls.

Let us count the exact calls for small values of $$n$$:

| $$n$$ | Recursive Calls | DP Steps | Speedup |
|-------|----------------|----------|---------|
| 5     | 15             | 6        | 2.5x    |
| 8     | 67             | 9        | 7.4x    |
| 10    | 177            | 11       | 16x     |
| 20    | 21,891         | 21       | 1,042x  |
| 30    | 2,692,537      | 31       | 86,856x |

The gap grows *exponentially* because the recursive approach has $$O(2^n)$$ calls while the DP approach always takes exactly $$n + 1$$ steps.

### The Memoization Approach (Top-Down)

Before jumping to tabulation, there is a middle ground: memoization. We keep the recursive structure but cache results to avoid recomputation:

```python
def fib_memo(n, cache=None):
    if cache is None:
        cache = {}
    if n in cache:
        return cache[n]
    if n <= 1:
        return n
    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)
    return cache[n]
```

This brings the time complexity down to $$O(n)$$  - each value is computed only once and then looked up from the cache. The space complexity is $$O(n)$$ for the cache plus $$O(n)$$ for the recursion stack.

Memoization is often the easiest way to convert a recursive solution into a DP solution because the code structure stays almost identical. You just add a cache. However, for very large $$n$$, the recursion stack depth can cause a stack overflow. That is where tabulation shines.

### The DP Approach (Tabulation)

With DP, we fill a table from the bottom up, computing each value exactly once:

```python
def fib_dp(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[0] = 0
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]
```

Time complexity: $$O(n)$$. Space complexity: $$O(n)$$. We can even optimize space to $$O(1)$$ since we only need the last two values.

```python
def fib_optimized(n):
    if n <= 1:
        return n
    prev2, prev1 = 0, 1
    for i in range(2, n + 1):
        curr = prev1 + prev2
        prev2 = prev1
        prev1 = curr
    return prev1
```

### Interactive Visualization: Recursion Tree vs DP Table

The left side shows the recursion tree for the naive approach  - notice how it branches exponentially and repeats the same subproblems (shown in red). The right side shows the DP table filling linearly, computing each value exactly once.

<div class="demo-hint">
<strong>Interactive:</strong> Use the <strong>n</strong> slider to change the Fibonacci number being computed. Click <strong>Step</strong> to advance one operation at a time. Watch the call count explode on the left while the right side stays linear.
</div>

<div class="interactive-demo">
  <canvas id="fib-canvas" width="680" height="300"></canvas>
  <div class="demo-controls">
    <button id="fib-step">Step</button>
    <button id="fib-run">Run</button>
    <button id="fib-reset">Reset</button>
    <label>Speed: <input type="range" id="fib-speed" min="1" max="20" value="8"> <span class="demo-value" id="fib-speed-val">8</span></label>
    <label>n: <input type="range" id="fib-n" min="2" max="8" value="5"> <span class="demo-value" id="fib-n-val">5</span></label>
  </div>
  <div class="demo-info" id="fib-info">Recursive calls: 0 | DP lookups: 0 | Ready</div>
</div>

<script>
(function() {
  var DP = window.DSA_DP;
  var canvas = document.getElementById('fib-canvas');
  var W = 680, H = 300;
  var ctx = DP.setupCanvas(canvas, W, H);

  var n = 5;
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  // Build recursion tree structure
  function buildTree(n) {
    if (n <= 1) return { val: n, result: n, children: [], duplicate: false };
    var left = buildTree(n - 1);
    var right = buildTree(n - 2);
    return { val: n, result: left.result + right.result, children: [left, right], duplicate: false };
  }

  // Flatten tree into visit order (pre-order)
  function flattenTree(node, seen, list) {
    if (!node) return;
    var dup = seen[node.val] !== undefined;
    list.push({ val: node.val, result: node.result, duplicate: dup });
    if (!dup) seen[node.val] = true;
    for (var i = 0; i < node.children.length; i++) {
      flattenTree(node.children[i], seen, list);
    }
  }

  // Generate states for step-through
  function generateStates(n) {
    var tree = buildTree(n);
    var visits = [];
    flattenTree(tree, {}, visits);

    var st = [];
    var dpTable = new Array(n + 1);
    for (var i = 0; i <= n; i++) dpTable[i] = null;
    var recCalls = 0;
    var dpStep = 0;

    // State 0: initial
    st.push({
      treeVisited: 0,
      visits: visits,
      dp: dpTable.slice(),
      dpHighlight: -1,
      recCalls: 0,
      dpStep: 0,
      info: 'Ready  - computing F(' + n + ')'
    });

    // Recursion states (one per tree visit)
    for (var i = 0; i < visits.length; i++) {
      recCalls++;
      st.push({
        treeVisited: i + 1,
        visits: visits,
        dp: dpTable.slice(),
        dpHighlight: -1,
        recCalls: recCalls,
        dpStep: dpStep,
        info: 'Recursive call: F(' + visits[i].val + ')' + (visits[i].duplicate ? ' [DUPLICATE]' : ' = ' + visits[i].result)
      });
    }

    // DP states (one per table fill)
    dpTable[0] = 0;
    dpTable[1] = 1;
    st.push({
      treeVisited: visits.length,
      visits: visits,
      dp: dpTable.slice(),
      dpHighlight: 0,
      recCalls: recCalls,
      dpStep: 1,
      info: 'DP: dp[0] = 0 (base case)'
    });
    st.push({
      treeVisited: visits.length,
      visits: visits,
      dp: dpTable.slice(),
      dpHighlight: 1,
      recCalls: recCalls,
      dpStep: 2,
      info: 'DP: dp[1] = 1 (base case)'
    });
    for (var i = 2; i <= n; i++) {
      dpTable[i] = dpTable[i - 1] + dpTable[i - 2];
      dpStep++;
      st.push({
        treeVisited: visits.length,
        visits: visits,
        dp: dpTable.slice(),
        dpHighlight: i,
        recCalls: recCalls,
        dpStep: dpStep + 1,
        info: 'DP: dp[' + i + '] = dp[' + (i - 1) + '] + dp[' + (i - 2) + '] = ' + dpTable[i - 1] + ' + ' + dpTable[i - 2] + ' = ' + dpTable[i]
      });
    }

    // Final state
    st.push({
      treeVisited: visits.length,
      visits: visits,
      dp: dpTable.slice(),
      dpHighlight: n,
      recCalls: recCalls,
      dpStep: dpStep + 1,
      info: 'Done! F(' + n + ') = ' + dpTable[n] + ' | Recursive calls: ' + recCalls + ' vs DP steps: ' + (n + 1)
    });

    return st;
  }

  // Assign (x, y) positions to tree nodes for rendering
  function layoutTreePositions(n) {
    var tree = buildTree(n);
    var positions = [];
    var maxDepth = n;
    var halfW = W / 2 - 20;

    function layout(node, depth, xMin, xMax) {
      if (!node) return;
      var x = (xMin + xMax) / 2;
      var y = 30 + depth * Math.min(45, (H - 60) / (maxDepth + 1));
      positions.push({ val: node.val, x: x, y: y, children: [] });
      var parentIdx = positions.length - 1;
      if (node.children.length >= 1) {
        var childStart = positions.length;
        layout(node.children[0], depth + 1, xMin, x);
        positions[parentIdx].children.push(childStart);
      }
      if (node.children.length >= 2) {
        var childStart2 = positions.length;
        layout(node.children[1], depth + 1, x, xMax);
        positions[parentIdx].children.push(childStart2);
      }
    }

    layout(tree, 0, 10, halfW - 10);
    return positions;
  }

  function draw() {
    var c = DP.getColors();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var st = states[step] || states[0];
    var halfW = W / 2;

    // Divider
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(halfW, 10);
    ctx.lineTo(halfW, H - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = c.text;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Recursion Tree (O(2^n))', halfW / 2, 16);
    ctx.fillText('DP Table (O(n))', halfW + halfW / 2, 16);

    // Draw recursion tree
    var treePos = layoutTreePositions(n);
    var visited = st.treeVisited;
    var visits = st.visits;

    // Flatten tree to get pre-order index mapping
    var preOrder = [];
    function flatIdx(node) {
      if (!node) return;
      preOrder.push(node);
      for (var i = 0; i < node.children.length; i++) flatIdx(node.children[i]);
    }
    var treeRoot = buildTree(n);
    flatIdx(treeRoot);

    // Draw edges
    for (var i = 0; i < treePos.length; i++) {
      var p = treePos[i];
      for (var j = 0; j < p.children.length; j++) {
        var ci = p.children[j];
        if (ci < treePos.length) {
          var ch = treePos[ci];
          var alpha = (i < visited && ci < visited) ? 1.0 : 0.2;
          ctx.strokeStyle = c.treeLine;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y + 10);
          ctx.lineTo(ch.x, ch.y - 10);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1.0;

    // Map tree positions to visits for coloring
    // We use the visits array which is in pre-order
    for (var i = 0; i < treePos.length; i++) {
      var p = treePos[i];
      var isVisited = i < visited;
      var isDuplicate = isVisited && visits[i] && visits[i].duplicate;
      var isCurrent = (i === visited - 1) && (visited > 0);

      var radius = 13;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

      if (!isVisited) {
        ctx.fillStyle = c.grid;
        ctx.globalAlpha = 0.4;
      } else if (isCurrent) {
        ctx.fillStyle = c.treeNodeActive;
        ctx.globalAlpha = 1.0;
      } else if (isDuplicate) {
        ctx.fillStyle = c.treeNodeDuplicate;
        ctx.globalAlpha = 1.0;
      } else {
        ctx.fillStyle = c.treeNode;
        ctx.globalAlpha = 1.0;
      }
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('F(' + p.val + ')', p.x, p.y + 4);
    }

    // Draw DP table on right side
    var dpArr = st.dp;
    var dpHL = st.dpHighlight;
    var barMaxW = 80;
    var barH = 22;
    var startX = halfW + 30;
    var startY = 36;
    var gapY = Math.min(30, (H - 60) / (dpArr.length + 1));

    for (var i = 0; i < dpArr.length; i++) {
      var y = startY + i * gapY;
      var val = dpArr[i];

      // Index label
      ctx.fillStyle = c.textMuted;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('dp[' + i + ']', startX + 38, y + barH / 2 + 4);

      if (val !== null) {
        // Draw filled bar
        var maxFib = dpArr[n] || 1;
        var bw = Math.max(10, (val / Math.max(maxFib, 1)) * barMaxW);
        var bx = startX + 44;

        if (i === dpHL) {
          ctx.fillStyle = c.dpBarActive;
        } else {
          ctx.fillStyle = c.dpBar;
        }

        ctx.beginPath();
        var r = 4;
        ctx.moveTo(bx + r, y);
        ctx.lineTo(bx + bw - r, y);
        ctx.quadraticCurveTo(bx + bw, y, bx + bw, y + r);
        ctx.lineTo(bx + bw, y + barH - r);
        ctx.quadraticCurveTo(bx + bw, y + barH, bx + bw - r, y + barH);
        ctx.lineTo(bx + r, y + barH);
        ctx.quadraticCurveTo(bx, y + barH, bx, y + barH - r);
        ctx.lineTo(bx, y + r);
        ctx.quadraticCurveTo(bx, y, bx + r, y);
        ctx.fill();

        // Value label
        ctx.fillStyle = c.text;
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(val, bx + bw + 6, y + barH / 2 + 4);
      } else {
        // Empty slot
        ctx.strokeStyle = c.grid;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(startX + 44, y, barMaxW, barH);
        ctx.setLineDash([]);
      }
    }

    // Update info
    document.getElementById('fib-info').textContent =
      'Recursive calls: ' + st.recCalls + ' | DP steps: ' + st.dpStep + ' | ' + st.info;
  }

  function init() {
    n = parseInt(document.getElementById('fib-n').value) || 5;
    states = generateStates(n);
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    draw();
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      draw();
      if (running) {
        var speed = parseInt(document.getElementById('fib-speed').value) || 8;
        var delay = Math.max(20, 600 - speed * 30);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('fib-run').textContent = 'Run';
    }
  }

  init();
  DP.onThemeChange(draw);

  document.getElementById('fib-step').onclick = function() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('fib-run').textContent = 'Run';
    if (step < states.length - 1) { step++; draw(); }
  };
  document.getElementById('fib-run').onclick = function() {
    if (running) {
      running = false;
      if (timer) clearTimeout(timer);
      this.textContent = 'Run';
    } else {
      if (step >= states.length - 1) { step = 0; }
      running = true;
      this.textContent = 'Pause';
      advance();
    }
  };
  document.getElementById('fib-reset').onclick = init;
  document.getElementById('fib-speed').oninput = function() {
    document.getElementById('fib-speed-val').textContent = this.value;
  };
  document.getElementById('fib-n').oninput = function() {
    document.getElementById('fib-n-val').textContent = this.value;
    init();
  };
})();
</script>

Notice how the recursion tree for $$F(5)$$ requires 15 calls, but the DP table needs only 6 steps. As $$n$$ grows, this gap becomes catastrophic: $$F(8)$$ needs 67 recursive calls vs just 9 DP steps. This is the power of dynamic programming  - it trades a small amount of memory for a massive reduction in computation.

---

## Climbing Stairs: Your First DP Problem

Before tackling the heavyweight problems, let us solidify the DP mindset with a simple but instructive problem. You are climbing a staircase with $$n$$ steps. At each step you can climb either 1 or 2 steps. How many distinct ways can you reach the top?

This is essentially Fibonacci in disguise. To reach step $$n$$, you either came from step $$n-1$$ (one step) or step $$n-2$$ (two steps). The number of ways to reach step $$n$$ is the sum of the ways to reach those two:

$$dp[i] = dp[i-1] + dp[i-2], \quad dp[1] = 1, \quad dp[2] = 2$$

### Python Implementation

```python
def climb_stairs(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]
```

For $$n = 5$$, there are 8 distinct ways. For $$n = 10$$, there are 89 ways. The pattern matches Fibonacci numbers (shifted by one index).

### Why This Matters

Climbing Stairs teaches you to recognize DP in problems that do not look like "optimization" at first glance. Any time a problem asks "how many ways" or "how many distinct paths" and the choices at each stage overlap, DP is likely the right tool.

### Generalizing: What if you could take 1, 2, or 3 steps?

```python
def climb_stairs_k(n, k=3):
    """Climb n stairs taking 1 to k steps at a time."""
    dp = [0] * (n + 1)
    dp[0] = 1
    for i in range(1, n + 1):
        for j in range(1, min(k, i) + 1):
            dp[i] += dp[i - j]
    return dp[n]
```

This generalization shows how the Fibonacci recurrence is a special case of a broader class of linear DP problems. The transition function simply sums over all valid previous states.

### Interactive Visualization: Climbing Stairs

This visualization shows the DP table being filled for the Climbing Stairs problem. Each cell represents the number of ways to reach that step. The value is always the sum of the previous two cells.

<div class="demo-hint">
<strong>Interactive:</strong> Use the <strong>n</strong> slider to change the number of steps. Click <strong>Step</strong> to fill one cell at a time and see how each value is computed from the previous two.
</div>

<div class="interactive-demo">
  <canvas id="stairs-canvas" width="680" height="200"></canvas>
  <div class="demo-controls">
    <button id="stairs-step">Step</button>
    <button id="stairs-run">Run</button>
    <button id="stairs-reset">Reset</button>
    <label>Speed: <input type="range" id="stairs-speed" min="1" max="20" value="8"> <span class="demo-value" id="stairs-speed-val">8</span></label>
    <label>Steps: <input type="range" id="stairs-n" min="3" max="12" value="6"> <span class="demo-value" id="stairs-n-val">6</span></label>
  </div>
  <div class="demo-info" id="stairs-info">Stairs: 6 | Ready</div>
</div>

<script>
(function() {
  var DP = window.DSA_DP;
  var canvas = document.getElementById('stairs-canvas');
  var W = 680, H = 200;
  var ctx = DP.setupCanvas(canvas, W, H);

  var stairsN = 6;
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function generateStates(n) {
    var dp = new Array(n + 1);
    for (var i = 0; i <= n; i++) dp[i] = null;
    var st = [];

    st.push({ dp: dp.slice(), highlight: -1, info: 'Climbing ' + n + ' stairs. dp[1]=1, dp[2]=2 are base cases.' });

    dp[1] = 1;
    st.push({ dp: dp.slice(), highlight: 1, info: 'dp[1] = 1 (one way to reach step 1: take 1 step)' });

    if (n >= 2) {
      dp[2] = 2;
      st.push({ dp: dp.slice(), highlight: 2, info: 'dp[2] = 2 (two ways: 1+1 or 2)' });
    }

    for (var i = 3; i <= n; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
      st.push({ dp: dp.slice(), highlight: i, info: 'dp[' + i + '] = dp[' + (i - 1) + '] + dp[' + (i - 2) + '] = ' + dp[i - 1] + ' + ' + dp[i - 2] + ' = ' + dp[i] });
    }

    st.push({ dp: dp.slice(), highlight: n, info: 'Done! There are ' + dp[n] + ' ways to climb ' + n + ' stairs.' });
    return st;
  }

  function draw() {
    var c = DP.getColors();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var st = states[step] || states[0];
    var dp = st.dp;
    var hl = st.highlight;
    var n = stairsN;

    // Title
    ctx.fillStyle = c.text;
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Climbing Stairs  - DP Table', W / 2, 22);

    // Draw stair-like boxes
    var boxW = Math.min(60, (W - 80) / (n + 1));
    var boxH = 44;
    var startX = (W - (n * (boxW + 8))) / 2;
    var baseY = H - 50;

    for (var i = 1; i <= n; i++) {
      var x = startX + (i - 1) * (boxW + 8);
      // Stair effect: higher steps are drawn slightly higher
      var stairOffset = Math.min(i * 6, 60);
      var y = baseY - stairOffset;

      // Box
      var isFilled = dp[i] !== null;
      var isHL = (i === hl);

      if (isHL) {
        ctx.fillStyle = c.dpBarActive;
      } else if (isFilled) {
        ctx.fillStyle = c.dpBar;
      } else {
        ctx.fillStyle = c.grid;
        ctx.globalAlpha = 0.4;
      }

      ctx.beginPath();
      var r = 6;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + boxW - r, y);
      ctx.quadraticCurveTo(x + boxW, y, x + boxW, y + r);
      ctx.lineTo(x + boxW, y + boxH - r);
      ctx.quadraticCurveTo(x + boxW, y + boxH, x + boxW - r, y + boxH);
      ctx.lineTo(x + r, y + boxH);
      ctx.quadraticCurveTo(x, y + boxH, x, y + boxH - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Value inside box
      if (isFilled) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(dp[i], x + boxW / 2, y + boxH / 2 + 5);
      }

      // Step label below
      ctx.fillStyle = c.textMuted;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('step ' + i, x + boxW / 2, y + boxH + 14);

      // Draw arrows from previous two cells if this is the highlighted cell
      if (isHL && i >= 3 && dp[i] !== null) {
        // Arrow from i-1
        var prevX1 = startX + (i - 2) * (boxW + 8) + boxW;
        var prevY1 = baseY - Math.min((i - 1) * 6, 60) + boxH / 2;
        ctx.strokeStyle = c.cellActive;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(prevX1 + 2, prevY1);
        ctx.lineTo(x - 2, y + boxH / 2);
        ctx.stroke();
        // Arrowhead
        ctx.fillStyle = c.cellActive;
        ctx.beginPath();
        ctx.moveTo(x - 2, y + boxH / 2);
        ctx.lineTo(x - 8, y + boxH / 2 - 4);
        ctx.lineTo(x - 8, y + boxH / 2 + 4);
        ctx.closePath();
        ctx.fill();

        // Arrow from i-2
        if (i >= 3) {
          var prevX2 = startX + (i - 3) * (boxW + 8) + boxW;
          var prevY2 = baseY - Math.min((i - 2) * 6, 60) + boxH / 4;
          ctx.strokeStyle = c.cellInsert;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(prevX2 + 2, prevY2);
          ctx.quadraticCurveTo((prevX2 + x) / 2, prevY2 - 25, x - 2, y + boxH / 4);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }

    document.getElementById('stairs-info').textContent = st.info;
  }

  function init() {
    stairsN = parseInt(document.getElementById('stairs-n').value) || 6;
    states = generateStates(stairsN);
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    draw();
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      draw();
      if (running) {
        var speed = parseInt(document.getElementById('stairs-speed').value) || 8;
        var delay = Math.max(20, 600 - speed * 30);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('stairs-run').textContent = 'Run';
    }
  }

  init();
  DP.onThemeChange(draw);

  document.getElementById('stairs-step').onclick = function() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('stairs-run').textContent = 'Run';
    if (step < states.length - 1) { step++; draw(); }
  };
  document.getElementById('stairs-run').onclick = function() {
    if (running) {
      running = false;
      if (timer) clearTimeout(timer);
      this.textContent = 'Run';
    } else {
      if (step >= states.length - 1) { step = 0; }
      running = true;
      this.textContent = 'Pause';
      advance();
    }
  };
  document.getElementById('stairs-reset').onclick = init;
  document.getElementById('stairs-speed').oninput = function() {
    document.getElementById('stairs-speed-val').textContent = this.value;
  };
  document.getElementById('stairs-n').oninput = function() {
    document.getElementById('stairs-n-val').textContent = this.value;
    init();
  };
})();
</script>

The Climbing Stairs problem reinforces a critical DP pattern: the current state depends only on a small number of previous states. This "sliding window" over previous states is the basis for many DP optimizations, including reducing space from $$O(n)$$ to $$O(1)$$.

---

## 0/1 Knapsack Problem

The 0/1 Knapsack is one of the most important problems in combinatorial optimization. You have a knapsack with a weight capacity, and a set of items each with a weight and a value. You must choose which items to include to maximize total value without exceeding the capacity. Each item can either be taken (1) or left (0)  - no partial items.

### Problem Setup

Given $$n$$ items with weights $$w_1, w_2, \ldots, w_n$$ and values $$v_1, v_2, \ldots, v_n$$, and a knapsack capacity $$W$$, find the subset that maximizes total value:

$$\text{maximize} \sum_{i} v_i x_i \quad \text{subject to} \quad \sum_{i} w_i x_i \leq W, \quad x_i \in \{0, 1\}$$

### Recurrence Relation

For each item $$i$$ and capacity $$w$$, we have two choices:

- **Exclude** item $$i$$: $$dp[i][w] = dp[i-1][w]$$
- **Include** item $$i$$ (if $$w_i \leq w$$): $$dp[i][w] = dp[i-1][w - w_i] + v_i$$

We take the maximum of the two:

$$dp[i][w] = \max(dp[i-1][w], \; dp[i-1][w - w_i] + v_i)$$

### Python Implementation

```python
def knapsack_01(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            # Option 1: don't take item i
            dp[i][w] = dp[i - 1][w]
            # Option 2: take item i (if it fits)
            if weights[i - 1] <= w:
                include_val = dp[i - 1][w - weights[i - 1]] + values[i - 1]
                dp[i][w] = max(dp[i][w], include_val)

    return dp[n][capacity]
```

Time complexity: $$O(n \cdot W)$$ where $$n$$ is the number of items and $$W$$ is the capacity. Space complexity: $$O(n \cdot W)$$.

### Interactive Visualization

The table below shows the DP grid being filled. Rows represent items (starting from "no items"), columns represent capacities from 0 to $$W$$. Green cells indicate the item was **included** at that decision point. Red cells indicate it was **excluded**. The highlighted cell is the one currently being computed.

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>Step</strong> to fill one cell at a time. Modify the items using the input fields and click <strong>Apply</strong> to rebuild the table. Watch how at each cell, the algorithm decides whether to include or exclude the current item.
</div>

<div class="interactive-demo">
  <div class="dp-table-wrapper" id="knapsack-table-wrapper">
    <table class="dp-table" id="knapsack-table"></table>
  </div>
  <div class="demo-controls">
    <button id="knapsack-step">Step</button>
    <button id="knapsack-run">Run</button>
    <button id="knapsack-reset">Reset</button>
    <label>Speed: <input type="range" id="knapsack-speed" min="1" max="20" value="8"> <span class="demo-value" id="knapsack-speed-val">8</span></label>
  </div>
  <div class="demo-controls">
    <label>Items (w,v): <input type="text" id="knapsack-items" value="2,3 3,4 4,5 5,6" style="width:220px"></label>
    <label>Capacity: <input type="number" id="knapsack-cap" value="8" min="1" max="15"></label>
    <button id="knapsack-apply">Apply</button>
  </div>
  <div class="dp-legend">
    <div class="dp-legend-item"><span class="dp-legend-swatch" style="background:#16a34a"></span> Include</div>
    <div class="dp-legend-item"><span class="dp-legend-swatch" style="background:#e63946"></span> Exclude</div>
    <div class="dp-legend-item"><span class="dp-legend-swatch" style="background:#f59e0b"></span> Current cell</div>
    <div class="dp-legend-item"><span class="dp-legend-swatch" style="background:#2563eb"></span> Optimal path</div>
  </div>
  <div class="demo-info" id="knapsack-info">Items: 4 | Capacity: 8 | Ready</div>
</div>

<script>
(function() {
  var DP = window.DSA_DP;

  var defaultItems = [
    { w: 2, v: 3 },
    { w: 3, v: 4 },
    { w: 4, v: 5 },
    { w: 5, v: 6 }
  ];
  var items = defaultItems.slice();
  var capacity = 8;

  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function parseItems() {
    var txt = document.getElementById('knapsack-items').value.trim();
    var parts = txt.split(/\s+/);
    var parsed = [];
    for (var i = 0; i < parts.length; i++) {
      var wv = parts[i].split(',');
      if (wv.length === 2) {
        var w = parseInt(wv[0]);
        var v = parseInt(wv[1]);
        if (!isNaN(w) && !isNaN(v) && w > 0 && v > 0) {
          parsed.push({ w: w, v: v });
        }
      }
    }
    return parsed.length > 0 ? parsed : defaultItems.slice();
  }

  function generateStates() {
    var n = items.length;
    var W = capacity;
    var dp = [];
    for (var i = 0; i <= n; i++) {
      dp[i] = [];
      for (var j = 0; j <= W; j++) dp[i][j] = 0;
    }

    var st = [];
    // decisions[i][w] = 'include' | 'exclude' | 'base'
    var decisions = [];
    for (var i = 0; i <= n; i++) {
      decisions[i] = [];
      for (var j = 0; j <= W; j++) decisions[i][j] = 'base';
    }

    // State 0: empty table
    st.push({
      dp: dp.map(function(r) { return r.slice(); }),
      decisions: decisions.map(function(r) { return r.slice(); }),
      activeRow: -1,
      activeCol: -1,
      info: 'Knapsack: ' + n + ' items, capacity ' + W + '. Base row is all zeros.'
    });

    // Fill table row by row
    for (var i = 1; i <= n; i++) {
      for (var w = 0; w <= W; w++) {
        var excl = dp[i - 1][w];
        var incl = -1;
        if (items[i - 1].w <= w) {
          incl = dp[i - 1][w - items[i - 1].w] + items[i - 1].v;
        }
        if (incl > excl) {
          dp[i][w] = incl;
          decisions[i][w] = 'include';
        } else {
          dp[i][w] = excl;
          decisions[i][w] = 'exclude';
        }

        var decisionStr = '';
        if (items[i - 1].w > w) {
          decisionStr = 'Item ' + i + ' (w=' + items[i - 1].w + ') too heavy for capacity ' + w + '. Exclude.';
        } else if (incl > excl) {
          decisionStr = 'Include item ' + i + ': dp[' + (i - 1) + '][' + (w - items[i - 1].w) + '] + ' + items[i - 1].v + ' = ' + incl + ' > ' + excl;
        } else {
          decisionStr = 'Exclude item ' + i + ': dp[' + (i - 1) + '][' + w + '] = ' + excl + ' >= ' + (incl >= 0 ? incl : 'N/A');
        }

        st.push({
          dp: dp.map(function(r) { return r.slice(); }),
          decisions: decisions.map(function(r) { return r.slice(); }),
          activeRow: i,
          activeCol: w,
          info: decisionStr
        });
      }
    }

    // Traceback: find which items are included in the optimal solution
    var traceback = [];
    var tw = W;
    for (var i = n; i >= 1; i--) {
      if (decisions[i][tw] === 'include') {
        traceback.push({ row: i, col: tw });
        tw -= items[i - 1].w;
      }
    }

    st.push({
      dp: dp.map(function(r) { return r.slice(); }),
      decisions: decisions.map(function(r) { return r.slice(); }),
      activeRow: -1,
      activeCol: -1,
      traceback: traceback,
      info: 'Done! Max value = ' + dp[n][W] + '. Optimal items: ' + traceback.map(function(t) { return 'Item ' + t.row; }).join(', ')
    });

    return st;
  }

  function buildTable() {
    var table = document.getElementById('knapsack-table');
    var n = items.length;
    var W = capacity;

    var html = '<thead><tr><th></th><th></th>';
    for (var w = 0; w <= W; w++) html += '<th>w=' + w + '</th>';
    html += '</tr></thead><tbody>';

    // Row 0: base case
    html += '<tr><th>0</th><th>None</th>';
    for (var w = 0; w <= W; w++) {
      html += '<td id="ks-' + 0 + '-' + w + '">0</td>';
    }
    html += '</tr>';

    // Item rows
    for (var i = 1; i <= n; i++) {
      html += '<tr><th>' + i + '</th><th>w=' + items[i - 1].w + ' v=' + items[i - 1].v + '</th>';
      for (var w = 0; w <= W; w++) {
        html += '<td id="ks-' + i + '-' + w + '"></td>';
      }
      html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;
  }

  function renderState() {
    var st = states[step] || states[0];
    var n = items.length;
    var W = capacity;
    var traceSet = {};
    if (st.traceback) {
      for (var t = 0; t < st.traceback.length; t++) {
        traceSet[st.traceback[t].row + '-' + st.traceback[t].col] = true;
      }
    }

    for (var i = 0; i <= n; i++) {
      for (var w = 0; w <= W; w++) {
        var cell = document.getElementById('ks-' + i + '-' + w);
        if (!cell) continue;
        cell.className = '';
        var val = st.dp[i][w];
        var decision = st.decisions[i][w];
        var filled = (i === 0) || (val !== undefined && (i < st.activeRow || (i === st.activeRow && w <= st.activeCol) || st.activeRow === -1 && step > 0));

        if (i === 0) {
          cell.textContent = '0';
          cell.className = 'dp-filled';
        } else if (i === st.activeRow && w === st.activeCol) {
          cell.textContent = val;
          if (decision === 'include') {
            cell.className = 'dp-include dp-active';
          } else {
            cell.className = 'dp-exclude dp-active';
          }
        } else if (traceSet[i + '-' + w]) {
          cell.textContent = val;
          cell.className = 'dp-path';
        } else if (filled && (i < st.activeRow || (i === st.activeRow && w < st.activeCol) || (st.activeRow === -1 && step > 0))) {
          cell.textContent = val;
          if (decision === 'include') {
            cell.className = 'dp-include';
          } else if (decision === 'exclude') {
            cell.className = 'dp-filled';
          } else {
            cell.className = 'dp-filled';
          }
        } else {
          cell.textContent = '';
          cell.className = '';
        }
      }
    }

    document.getElementById('knapsack-info').textContent = st.info;
  }

  function init() {
    items = parseItems();
    capacity = parseInt(document.getElementById('knapsack-cap').value) || 8;
    if (capacity > 15) capacity = 15;
    states = generateStates();
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    buildTable();
    renderState();
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      renderState();
      if (running) {
        var speed = parseInt(document.getElementById('knapsack-speed').value) || 8;
        var delay = Math.max(20, 600 - speed * 30);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('knapsack-run').textContent = 'Run';
    }
  }

  init();
  DP.onThemeChange(function() { renderState(); });

  document.getElementById('knapsack-step').onclick = function() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('knapsack-run').textContent = 'Run';
    if (step < states.length - 1) { step++; renderState(); }
  };
  document.getElementById('knapsack-run').onclick = function() {
    if (running) {
      running = false;
      if (timer) clearTimeout(timer);
      this.textContent = 'Run';
    } else {
      if (step >= states.length - 1) { step = 0; renderState(); }
      running = true;
      this.textContent = 'Pause';
      advance();
    }
  };
  document.getElementById('knapsack-reset').onclick = init;
  document.getElementById('knapsack-apply').onclick = init;
  document.getElementById('knapsack-speed').oninput = function() {
    document.getElementById('knapsack-speed-val').textContent = this.value;
  };
})();
</script>

The key insight of the 0/1 Knapsack is that each cell encodes the best decision given a specific set of available items and remaining capacity. By filling the table bottom-up, we guarantee that every subproblem is solved before it is needed.

### Tracing the Optimal Solution

Building the DP table gives us the *value* of the optimal solution, but often we also need to know *which items* to include. To reconstruct the solution, we backtrack from $$dp[n][W]$$:

```python
def knapsack_items(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i][w],
                    dp[i - 1][w - weights[i - 1]] + values[i - 1])

    # Backtrack to find included items
    selected = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            selected.append(i - 1)  # item index (0-based)
            w -= weights[i - 1]

    return dp[n][capacity], selected[::-1]
```

The backtracking logic is simple: at each row, if the value changed from the row above, the item was included. We subtract its weight and move up. If the value is the same, the item was excluded and we just move up. This runs in $$O(n)$$ time.

### Space Optimization

In practice, you can reduce the Knapsack table from $$O(n \cdot W)$$ to $$O(W)$$ space by using a single row and iterating capacities in reverse:

```python
def knapsack_optimized(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for i in range(len(weights)):
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    return dp[capacity]
```

Iterating in reverse ensures that each item is used at most once (the "0/1" constraint). If you iterate forward, you would allow unlimited copies of each item  - that is the Unbounded Knapsack variant.

---

## Longest Common Subsequence (LCS)

The Longest Common Subsequence problem is a classic in bioinformatics (DNA sequence alignment), version control (diff algorithms), and spell checking. Given two strings, find the longest subsequence common to both. A subsequence is a sequence that appears in the same relative order but not necessarily contiguously.

For example, the LCS of **"ABCBDAB"** and **"BDCAB"** is **"BCAB"** (length 4).

### Recurrence Relation

Let $$X = x_1 x_2 \ldots x_m$$ and $$Y = y_1 y_2 \ldots y_n$$. Define $$dp[i][j]$$ as the length of the LCS of $$X[1..i]$$ and $$Y[1..j]$$.

$$dp[i][j] = \begin{cases} 0 & \text{if } i = 0 \text{ or } j = 0 \\ dp[i-1][j-1] + 1 & \text{if } x_i = y_j \\ \max(dp[i-1][j], \; dp[i][j-1]) & \text{if } x_i \neq y_j \end{cases}$$

### Python Implementation

```python
def lcs(X, Y):
    m, n = len(X), len(Y)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if X[i - 1] == Y[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    # Backtrack to find the actual LCS
    lcs_str = []
    i, j = m, n
    while i > 0 and j > 0:
        if X[i - 1] == Y[j - 1]:
            lcs_str.append(X[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] > dp[i][j - 1]:
            i -= 1
        else:
            j -= 1

    return ''.join(reversed(lcs_str))
```

Time complexity: $$O(m \cdot n)$$. Space complexity: $$O(m \cdot n)$$.

### Interactive Visualization

The DP table fills cell by cell. When characters match, the cell is highlighted in green and the value comes from the diagonal (top-left) + 1. When they differ, the value is the maximum of the cell above and the cell to the left. After filling, the backtrack path is shown in orange, revealing the actual LCS.

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>Step</strong> to fill one cell at a time. Modify the two strings and click <strong>Apply</strong>. Green cells indicate character matches (diagonal moves). The orange path at the end traces the LCS.
</div>

<div class="interactive-demo">
  <div class="dp-table-wrapper" id="lcs-table-wrapper">
    <table class="dp-table" id="lcs-table"></table>
  </div>
  <div class="demo-controls">
    <button id="lcs-step">Step</button>
    <button id="lcs-run">Run</button>
    <button id="lcs-reset">Reset</button>
    <label>Speed: <input type="range" id="lcs-speed" min="1" max="20" value="8"> <span class="demo-value" id="lcs-speed-val">8</span></label>
  </div>
  <div class="demo-controls">
    <label>String 1: <input type="text" id="lcs-str1" value="ABCBDAB"></label>
    <label>String 2: <input type="text" id="lcs-str2" value="BDCAB"></label>
    <button id="lcs-apply">Apply</button>
  </div>
  <div class="dp-legend">
    <div class="dp-legend-item"><span class="dp-legend-swatch" style="background:#16a34a"></span> Match (diagonal)</div>
    <div class="dp-legend-item"><span class="dp-legend-swatch" style="background:#f59e0b"></span> Backtrack path</div>
    <div class="dp-legend-item"><span class="dp-legend-swatch" style="background:var(--bg-secondary, #f1f5f9)"></span> Filled cell</div>
  </div>
  <div class="demo-info" id="lcs-info">Strings: "ABCBDAB" and "BDCAB" | Ready</div>
</div>

<script>
(function() {
  var DP = window.DSA_DP;

  var str1 = 'ABCBDAB';
  var str2 = 'BDCAB';

  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function generateStates() {
    var m = str1.length;
    var n = str2.length;
    var dp = [];
    for (var i = 0; i <= m; i++) {
      dp[i] = [];
      for (var j = 0; j <= n; j++) dp[i][j] = 0;
    }

    var types = []; // 'match', 'top', 'left', 'base'
    for (var i = 0; i <= m; i++) {
      types[i] = [];
      for (var j = 0; j <= n; j++) types[i][j] = 'base';
    }

    var st = [];
    st.push({
      dp: dp.map(function(r) { return r.slice(); }),
      types: types.map(function(r) { return r.slice(); }),
      activeRow: -1,
      activeCol: -1,
      info: 'LCS of "' + str1 + '" and "' + str2 + '". Base row and column are all zeros.'
    });

    for (var i = 1; i <= m; i++) {
      for (var j = 1; j <= n; j++) {
        var infoStr = '';
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          types[i][j] = 'match';
          infoStr = 'Match! "' + str1[i - 1] + '" == "' + str2[j - 1] + '": dp[' + (i - 1) + '][' + (j - 1) + '] + 1 = ' + dp[i][j];
        } else {
          if (dp[i - 1][j] >= dp[i][j - 1]) {
            dp[i][j] = dp[i - 1][j];
            types[i][j] = 'top';
          } else {
            dp[i][j] = dp[i][j - 1];
            types[i][j] = 'left';
          }
          infoStr = 'No match "' + str1[i - 1] + '" != "' + str2[j - 1] + '": max(dp[' + (i - 1) + '][' + j + ']=' + dp[i - 1][j] + ', dp[' + i + '][' + (j - 1) + ']=' + dp[i][j - 1] + ') = ' + dp[i][j];
        }

        st.push({
          dp: dp.map(function(r) { return r.slice(); }),
          types: types.map(function(r) { return r.slice(); }),
          activeRow: i,
          activeCol: j,
          info: infoStr
        });
      }
    }

    // Backtrack to find LCS and path
    var path = [];
    var lcsChars = [];
    var bi = m, bj = n;
    while (bi > 0 && bj > 0) {
      path.push({ row: bi, col: bj });
      if (str1[bi - 1] === str2[bj - 1]) {
        lcsChars.push(str1[bi - 1]);
        bi--;
        bj--;
      } else if (dp[bi - 1][bj] > dp[bi][bj - 1]) {
        bi--;
      } else {
        bj--;
      }
    }
    lcsChars.reverse();

    st.push({
      dp: dp.map(function(r) { return r.slice(); }),
      types: types.map(function(r) { return r.slice(); }),
      activeRow: -1,
      activeCol: -1,
      path: path,
      info: 'Done! LCS = "' + lcsChars.join('') + '" (length ' + dp[m][n] + ')'
    });

    return st;
  }

  function buildTable() {
    var table = document.getElementById('lcs-table');
    var m = str1.length;
    var n = str2.length;

    var html = '<thead><tr><th></th><th>-</th>';
    for (var j = 0; j < n; j++) html += '<th>' + str2[j] + '</th>';
    html += '</tr></thead><tbody>';

    // Row 0
    html += '<tr><th>-</th>';
    for (var j = 0; j <= n; j++) {
      html += '<td id="lcs-' + 0 + '-' + j + '">0</td>';
    }
    html += '</tr>';

    for (var i = 1; i <= m; i++) {
      html += '<tr><th>' + str1[i - 1] + '</th>';
      html += '<td id="lcs-' + i + '-0">0</td>';
      for (var j = 1; j <= n; j++) {
        html += '<td id="lcs-' + i + '-' + j + '"></td>';
      }
      html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;
  }

  function renderState() {
    var st = states[step] || states[0];
    var m = str1.length;
    var n = str2.length;

    var pathSet = {};
    if (st.path) {
      for (var p = 0; p < st.path.length; p++) {
        pathSet[st.path[p].row + '-' + st.path[p].col] = true;
      }
    }

    for (var i = 0; i <= m; i++) {
      for (var j = 0; j <= n; j++) {
        var cell = document.getElementById('lcs-' + i + '-' + j);
        if (!cell) continue;
        cell.className = '';

        if (i === 0 || j === 0) {
          cell.textContent = '0';
          cell.className = 'dp-filled';
          continue;
        }

        var isFilled = (i < st.activeRow || (i === st.activeRow && j <= st.activeCol) || (st.activeRow === -1 && step > 0));
        var isActive = (i === st.activeRow && j === st.activeCol);

        if (isActive) {
          cell.textContent = st.dp[i][j];
          var t = st.types[i][j];
          if (t === 'match') {
            cell.className = 'dp-match dp-active';
          } else {
            cell.className = 'dp-filled dp-active';
          }
        } else if (pathSet[i + '-' + j]) {
          cell.textContent = st.dp[i][j];
          cell.className = 'dp-path';
        } else if (isFilled) {
          cell.textContent = st.dp[i][j];
          var t2 = st.types[i][j];
          if (t2 === 'match') {
            cell.className = 'dp-match';
          } else {
            cell.className = 'dp-filled';
          }
        } else {
          cell.textContent = '';
        }
      }
    }

    document.getElementById('lcs-info').textContent = st.info;
  }

  function init() {
    str1 = (document.getElementById('lcs-str1').value || 'ABCBDAB').toUpperCase();
    str2 = (document.getElementById('lcs-str2').value || 'BDCAB').toUpperCase();
    if (str1.length > 10) str1 = str1.substring(0, 10);
    if (str2.length > 10) str2 = str2.substring(0, 10);
    document.getElementById('lcs-str1').value = str1;
    document.getElementById('lcs-str2').value = str2;
    states = generateStates();
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    buildTable();
    renderState();
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      renderState();
      if (running) {
        var speed = parseInt(document.getElementById('lcs-speed').value) || 8;
        var delay = Math.max(20, 600 - speed * 30);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('lcs-run').textContent = 'Run';
    }
  }

  init();
  DP.onThemeChange(function() { renderState(); });

  document.getElementById('lcs-step').onclick = function() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('lcs-run').textContent = 'Run';
    if (step < states.length - 1) { step++; renderState(); }
  };
  document.getElementById('lcs-run').onclick = function() {
    if (running) {
      running = false;
      if (timer) clearTimeout(timer);
      this.textContent = 'Run';
    } else {
      if (step >= states.length - 1) { step = 0; renderState(); }
      running = true;
      this.textContent = 'Pause';
      advance();
    }
  };
  document.getElementById('lcs-reset').onclick = init;
  document.getElementById('lcs-apply').onclick = init;
  document.getElementById('lcs-speed').oninput = function() {
    document.getElementById('lcs-speed-val').textContent = this.value;
  };
})();
</script>

The LCS algorithm is the foundation for **diff tools** like `git diff`. When you see green and red lines in a code review, a variant of this algorithm determined which lines were added, removed, or unchanged.

### Understanding the Backtracking

The backtracking step is where LCS becomes truly useful. The DP table tells us the *length* of the LCS, but we need the actual subsequence. Starting from $$dp[m][n]$$, we trace back:

1. If $$X[i] = Y[j]$$, this character is part of the LCS. Add it and move diagonally to $$dp[i-1][j-1]$$.
2. Otherwise, move in the direction of the larger value: up ($$dp[i-1][j]$$) or left ($$dp[i][j-1]$$).

This greedy backtracking always produces a valid LCS, though multiple valid LCS strings may exist if there are ties.

### Variants and Applications

The LCS problem has several important variants:

- **Longest Common Substring** (contiguous): Use a similar DP table but reset to 0 when characters differ. This finds the longest *contiguous* common sequence.

- **Shortest Common Supersequence**: Given two strings, find the shortest string that contains both as subsequences. Length = $$m + n - \text{LCS length}$$.

- **Diff algorithm**: The classic diff algorithm uses LCS to identify unchanged lines between two file versions, then marks the rest as additions or deletions.

```python
def shortest_common_supersequence(X, Y):
    """Returns length of shortest common supersequence."""
    lcs_len = len(lcs(X, Y))
    return len(X) + len(Y) - lcs_len
```

---

## Edit Distance (Levenshtein Distance)

The Edit Distance problem measures the minimum number of single-character operations needed to transform one string into another. The allowed operations are:

- **Insert** a character
- **Delete** a character
- **Replace** a character

This is used in spell checkers, DNA alignment, and fuzzy string matching. For example, the edit distance between **"kitten"** and **"sitting"** is 3.

### Recurrence Relation

Let $$X = x_1 x_2 \ldots x_m$$ and $$Y = y_1 y_2 \ldots y_n$$. Define $$dp[i][j]$$ as the edit distance between $$X[1..i]$$ and $$Y[1..j]$$.

$$dp[i][j] = \begin{cases} j & \text{if } i = 0 \\ i & \text{if } j = 0 \\ dp[i-1][j-1] & \text{if } x_i = y_j \\ 1 + \min(dp[i-1][j], \; dp[i][j-1], \; dp[i-1][j-1]) & \text{if } x_i \neq y_j \end{cases}$$

Where the three options in the min correspond to:
- $$dp[i-1][j] + 1$$  - **delete** $$x_i$$
- $$dp[i][j-1] + 1$$  - **insert** $$y_j$$
- $$dp[i-1][j-1] + 1$$  - **replace** $$x_i$$ with $$y_j$$

### Python Implementation

```python
def edit_distance(X, Y):
    m, n = len(X), len(Y)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    # Base cases
    for i in range(m + 1):
        dp[i][0] = i  # delete all characters from X
    for j in range(n + 1):
        dp[0][j] = j  # insert all characters of Y

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if X[i - 1] == Y[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]  # no operation needed
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],      # delete
                    dp[i][j - 1],      # insert
                    dp[i - 1][j - 1]   # replace
                )

    return dp[m][n]
```

Time complexity: $$O(m \cdot n)$$. Space complexity: $$O(m \cdot n)$$.

### Interactive Visualization

Each cell is color-coded by the operation that was chosen: **green** for character match (no cost), **yellow** for replace, **blue** for insert, and **red** for delete. The backtrack path shows the optimal sequence of operations.

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>Step</strong> to fill one cell at a time. Change the input strings and click <strong>Apply</strong>. Each cell's color tells you which operation was optimal. At the end, the orange path traces the minimum-cost transformation.
</div>

<div class="interactive-demo">
  <div class="dp-table-wrapper" id="edit-table-wrapper">
    <table class="dp-table" id="edit-table"></table>
  </div>
  <div class="demo-controls">
    <button id="edit-step">Step</button>
    <button id="edit-run">Run</button>
    <button id="edit-reset">Reset</button>
    <label>Speed: <input type="range" id="edit-speed" min="1" max="20" value="8"> <span class="demo-value" id="edit-speed-val">8</span></label>
  </div>
  <div class="demo-controls">
    <label>From: <input type="text" id="edit-str1" value="kitten"></label>
    <label>To: <input type="text" id="edit-str2" value="sitting"></label>
    <button id="edit-apply">Apply</button>
  </div>
  <div class="dp-legend">
    <div class="dp-legend-item"><span class="dp-legend-swatch" style="background:#16a34a"></span> Match (free)</div>
    <div class="dp-legend-item"><span class="dp-legend-swatch" style="background:#f59e0b"></span> Replace (+1)</div>
    <div class="dp-legend-item"><span class="dp-legend-swatch" style="background:#2563eb"></span> Insert (+1)</div>
    <div class="dp-legend-item"><span class="dp-legend-swatch" style="background:#e63946"></span> Delete (+1)</div>
  </div>
  <div class="demo-info" id="edit-info">Transform "kitten" into "sitting" | Ready</div>
</div>

<script>
(function() {
  var DP = window.DSA_DP;

  var str1 = 'kitten';
  var str2 = 'sitting';

  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function generateStates() {
    var m = str1.length;
    var n = str2.length;
    var dp = [];
    for (var i = 0; i <= m; i++) {
      dp[i] = [];
      for (var j = 0; j <= n; j++) dp[i][j] = 0;
    }

    // ops[i][j] = 'match' | 'replace' | 'insert' | 'delete' | 'base'
    var ops = [];
    for (var i = 0; i <= m; i++) {
      ops[i] = [];
      for (var j = 0; j <= n; j++) ops[i][j] = 'base';
    }

    // Base cases
    for (var i = 0; i <= m; i++) { dp[i][0] = i; ops[i][0] = 'base'; }
    for (var j = 0; j <= n; j++) { dp[0][j] = j; ops[0][j] = 'base'; }

    var st = [];
    st.push({
      dp: dp.map(function(r) { return r.slice(); }),
      ops: ops.map(function(r) { return r.slice(); }),
      activeRow: -1,
      activeCol: -1,
      info: 'Edit distance: "' + str1 + '" -> "' + str2 + '". Base: row = deletions, col = insertions.'
    });

    for (var i = 1; i <= m; i++) {
      for (var j = 1; j <= n; j++) {
        var infoStr = '';
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
          ops[i][j] = 'match';
          infoStr = 'Match! "' + str1[i - 1] + '" == "' + str2[j - 1] + '": cost = dp[' + (i - 1) + '][' + (j - 1) + '] = ' + dp[i][j] + ' (no operation)';
        } else {
          var del = dp[i - 1][j] + 1;
          var ins = dp[i][j - 1] + 1;
          var rep = dp[i - 1][j - 1] + 1;
          var minVal = Math.min(del, ins, rep);
          dp[i][j] = minVal;

          if (minVal === rep) {
            ops[i][j] = 'replace';
            infoStr = 'Replace "' + str1[i - 1] + '" with "' + str2[j - 1] + '": min(del=' + del + ', ins=' + ins + ', rep=' + rep + ') = ' + minVal;
          } else if (minVal === del) {
            ops[i][j] = 'delete';
            infoStr = 'Delete "' + str1[i - 1] + '": min(del=' + del + ', ins=' + ins + ', rep=' + rep + ') = ' + minVal;
          } else {
            ops[i][j] = 'insert';
            infoStr = 'Insert "' + str2[j - 1] + '": min(del=' + del + ', ins=' + ins + ', rep=' + rep + ') = ' + minVal;
          }
        }

        st.push({
          dp: dp.map(function(r) { return r.slice(); }),
          ops: ops.map(function(r) { return r.slice(); }),
          activeRow: i,
          activeCol: j,
          info: infoStr
        });
      }
    }

    // Backtrack to find path
    var path = [];
    var opSeq = [];
    var bi = m, bj = n;
    while (bi > 0 || bj > 0) {
      path.push({ row: bi, col: bj });
      if (bi > 0 && bj > 0 && ops[bi][bj] === 'match') {
        opSeq.push('keep "' + str1[bi - 1] + '"');
        bi--; bj--;
      } else if (bi > 0 && bj > 0 && ops[bi][bj] === 'replace') {
        opSeq.push('replace "' + str1[bi - 1] + '" -> "' + str2[bj - 1] + '"');
        bi--; bj--;
      } else if (bi > 0 && (bj === 0 || ops[bi][bj] === 'delete')) {
        opSeq.push('delete "' + str1[bi - 1] + '"');
        bi--;
      } else {
        opSeq.push('insert "' + str2[bj - 1] + '"');
        bj--;
      }
    }
    opSeq.reverse();

    st.push({
      dp: dp.map(function(r) { return r.slice(); }),
      ops: ops.map(function(r) { return r.slice(); }),
      activeRow: -1,
      activeCol: -1,
      path: path,
      info: 'Done! Edit distance = ' + dp[m][n] + '. Operations: ' + opSeq.filter(function(o) { return o.indexOf('keep') === -1; }).join(', ')
    });

    return st;
  }

  function buildTable() {
    var table = document.getElementById('edit-table');
    var m = str1.length;
    var n = str2.length;

    var html = '<thead><tr><th></th><th>-</th>';
    for (var j = 0; j < n; j++) html += '<th>' + str2[j] + '</th>';
    html += '</tr></thead><tbody>';

    // Row 0
    html += '<tr><th>-</th>';
    for (var j = 0; j <= n; j++) {
      html += '<td id="ed-0-' + j + '">' + j + '</td>';
    }
    html += '</tr>';

    for (var i = 1; i <= m; i++) {
      html += '<tr><th>' + str1[i - 1] + '</th>';
      html += '<td id="ed-' + i + '-0">' + i + '</td>';
      for (var j = 1; j <= n; j++) {
        html += '<td id="ed-' + i + '-' + j + '"></td>';
      }
      html += '</tr>';
    }
    html += '</tbody>';
    table.innerHTML = html;
  }

  function renderState() {
    var st = states[step] || states[0];
    var m = str1.length;
    var n = str2.length;

    var pathSet = {};
    if (st.path) {
      for (var p = 0; p < st.path.length; p++) {
        pathSet[st.path[p].row + '-' + st.path[p].col] = true;
      }
    }

    for (var i = 0; i <= m; i++) {
      for (var j = 0; j <= n; j++) {
        var cell = document.getElementById('ed-' + i + '-' + j);
        if (!cell) continue;
        cell.className = '';

        // Base row/column
        if (i === 0 || j === 0) {
          cell.textContent = st.dp[i][j];
          if (i === 0 && j === 0) {
            cell.className = 'dp-filled';
          } else if (i === 0) {
            cell.className = 'dp-insert';
          } else {
            cell.className = 'dp-delete';
          }
          continue;
        }

        var isFilled = (i < st.activeRow || (i === st.activeRow && j <= st.activeCol) || (st.activeRow === -1 && step > 0));
        var isActive = (i === st.activeRow && j === st.activeCol);

        if (isActive) {
          cell.textContent = st.dp[i][j];
          var op = st.ops[i][j];
          if (op === 'match') cell.className = 'dp-match dp-active';
          else if (op === 'replace') cell.className = 'dp-replace dp-active';
          else if (op === 'insert') cell.className = 'dp-insert dp-active';
          else if (op === 'delete') cell.className = 'dp-delete dp-active';
          else cell.className = 'dp-filled dp-active';
        } else if (pathSet[i + '-' + j]) {
          cell.textContent = st.dp[i][j];
          cell.className = 'dp-path';
        } else if (isFilled) {
          cell.textContent = st.dp[i][j];
          var op2 = st.ops[i][j];
          if (op2 === 'match') cell.className = 'dp-match';
          else if (op2 === 'replace') cell.className = 'dp-replace';
          else if (op2 === 'insert') cell.className = 'dp-insert';
          else if (op2 === 'delete') cell.className = 'dp-delete';
          else cell.className = 'dp-filled';
        } else {
          cell.textContent = '';
        }
      }
    }

    document.getElementById('edit-info').textContent = st.info;
  }

  function init() {
    str1 = (document.getElementById('edit-str1').value || 'kitten').toLowerCase();
    str2 = (document.getElementById('edit-str2').value || 'sitting').toLowerCase();
    if (str1.length > 10) str1 = str1.substring(0, 10);
    if (str2.length > 10) str2 = str2.substring(0, 10);
    document.getElementById('edit-str1').value = str1;
    document.getElementById('edit-str2').value = str2;
    states = generateStates();
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    buildTable();
    renderState();
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      renderState();
      if (running) {
        var speed = parseInt(document.getElementById('edit-speed').value) || 8;
        var delay = Math.max(20, 600 - speed * 30);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('edit-run').textContent = 'Run';
    }
  }

  init();
  DP.onThemeChange(function() { renderState(); });

  document.getElementById('edit-step').onclick = function() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('edit-run').textContent = 'Run';
    if (step < states.length - 1) { step++; renderState(); }
  };
  document.getElementById('edit-run').onclick = function() {
    if (running) {
      running = false;
      if (timer) clearTimeout(timer);
      this.textContent = 'Run';
    } else {
      if (step >= states.length - 1) { step = 0; renderState(); }
      running = true;
      this.textContent = 'Pause';
      advance();
    }
  };
  document.getElementById('edit-reset').onclick = init;
  document.getElementById('edit-apply').onclick = init;
  document.getElementById('edit-speed').oninput = function() {
    document.getElementById('edit-speed-val').textContent = this.value;
  };
})();
</script>

Edit distance has many practical applications. Spell checkers use it to suggest corrections by finding dictionary words with the smallest edit distance to the misspelled word. Search engines use it for fuzzy matching. In bioinformatics, a weighted variant is used to align DNA sequences.

### Tracing the Operations

The backtrack path through the DP table gives us the exact sequence of operations to transform one string into the other. Starting from $$dp[m][n]$$:

1. **Diagonal move with same value**  - character match, no operation needed
2. **Diagonal move with value + 1**  - replace operation
3. **Move up with value + 1**  - delete operation (remove from source string)
4. **Move left with value + 1**  - insert operation (add from target string)

Here is a helper that reconstructs the full alignment:

```python
def edit_operations(X, Y):
    m, n = len(X), len(Y)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i
    for j in range(n + 1): dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if X[i-1] == Y[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])

    # Backtrack
    ops = []
    i, j = m, n
    while i > 0 or j > 0:
        if i > 0 and j > 0 and X[i-1] == Y[j-1]:
            ops.append(('match', X[i-1]))
            i -= 1; j -= 1
        elif i > 0 and j > 0 and dp[i][j] == dp[i-1][j-1] + 1:
            ops.append(('replace', X[i-1], Y[j-1]))
            i -= 1; j -= 1
        elif i > 0 and dp[i][j] == dp[i-1][j] + 1:
            ops.append(('delete', X[i-1]))
            i -= 1
        else:
            ops.append(('insert', Y[j-1]))
            j -= 1
    return list(reversed(ops))
```

For "kitten" to "sitting", the operations are:
1. Replace 'k' with 's'
2. Keep 'i'
3. Keep 't'
4. Keep 't'
5. Replace 'e' with 'i'
6. Keep 'n'
7. Insert 'g'

### Weighted Edit Distance

In real-world applications, not all operations have equal cost. For example, in a spell checker, replacing a character with an adjacent key on the keyboard should cost less than replacing with a distant key. In DNA analysis, certain mutations are more likely than others.

```python
def weighted_edit_distance(X, Y, insert_cost=1, delete_cost=1,
                           replace_cost=1):
    m, n = len(X), len(Y)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i * delete_cost
    for j in range(n + 1): dp[0][j] = j * insert_cost

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if X[i-1] == Y[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = min(
                    dp[i-1][j] + delete_cost,
                    dp[i][j-1] + insert_cost,
                    dp[i-1][j-1] + replace_cost
                )
    return dp[m][n]
```

The structure of the DP solution does not change  - only the cost model does. This flexibility is what makes DP so powerful: the framework stays the same while the problem-specific details slot in naturally.

---

## Recognizing DP Problems

Not every problem can be solved with DP. Here is a checklist to identify DP-solvable problems:

1. **Can the problem be broken into subproblems?** If the solution depends on solutions to smaller instances of the same problem, DP might apply.

2. **Are there overlapping subproblems?** If the same subproblem is computed multiple times in a naive recursive solution, caching will help.

3. **Does optimal substructure hold?** The optimal solution to the overall problem must be constructible from optimal solutions of subproblems.

4. **Can you define a recurrence?** If you can write $$dp[i] = f(dp[i-1], dp[i-2], \ldots)$$, you have a DP formulation.

### The DP Problem-Solving Framework

When you encounter a new problem, work through these steps:

**Step 1: Define the state.** What parameters uniquely identify a subproblem? For Fibonacci it is $$n$$. For Knapsack it is the item index and remaining capacity. For LCS it is the indices into both strings.

**Step 2: Write the recurrence.** Express the solution to a subproblem in terms of smaller subproblems. This is the core of the DP solution.

**Step 3: Identify the base cases.** What are the trivially solvable subproblems? These anchor your recurrence and prevent infinite recursion.

**Step 4: Determine the fill order.** In tabulation, you must fill smaller subproblems before larger ones. Usually this means iterating indices from small to large.

**Step 5: Extract the answer.** The final answer is typically in $$dp[n]$$, $$dp[n][W]$$, $$dp[m][n]$$, or similar.

**Step 6 (optional): Backtrack.** If you need the actual solution (not just its value), trace back through the table using the decisions recorded at each cell.

### Bonus: Coin Change Problem

Here is another classic DP problem to solidify your understanding. Given a set of coin denominations and a target amount, find the minimum number of coins needed:

```python
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i and dp[i - coin] + 1 < dp[i]:
                dp[i] = dp[i - coin] + 1

    return dp[amount] if dp[amount] != float('inf') else -1
```

This is a variation of the Unbounded Knapsack: each coin can be used unlimited times, and we are minimizing the count rather than maximizing value. The recurrence is:

$$dp[i] = \min_{c \in \text{coins}} (dp[i - c] + 1), \quad dp[0] = 0$$

For coins = [1, 5, 10, 25] and amount = 36, the answer is 3 coins (25 + 10 + 1). Notice how this is *not* the greedy solution for all coin sets  - greedy fails for coins = [1, 3, 4] and amount = 6 (greedy gives 4+1+1 = 3 coins, but DP finds 3+3 = 2 coins).

### Common DP problem types:

<table class="dp-table" style="margin: 1rem auto; font-size: 0.85rem;">
<thead>
<tr><th>Pattern</th><th>Examples</th><th>Complexity</th></tr>
</thead>
<tbody>
<tr><td style="text-align:left; font-weight:500;">Linear DP</td><td style="text-align:left;">Fibonacci, Climbing Stairs, House Robber</td><td>O(n)</td></tr>
<tr><td style="text-align:left; font-weight:500;">Two-string DP</td><td style="text-align:left;">LCS, Edit Distance, Regex Matching</td><td>O(m * n)</td></tr>
<tr><td style="text-align:left; font-weight:500;">Knapsack-type</td><td style="text-align:left;">0/1 Knapsack, Subset Sum, Coin Change</td><td>O(n * W)</td></tr>
<tr><td style="text-align:left; font-weight:500;">Interval DP</td><td style="text-align:left;">Matrix Chain, Burst Balloons, Palindrome Partitioning</td><td>O(n^3)</td></tr>
<tr><td style="text-align:left; font-weight:500;">Tree DP</td><td style="text-align:left;">Diameter, Max Path Sum, House Robber III</td><td>O(n)</td></tr>
<tr><td style="text-align:left; font-weight:500;">Bitmask DP</td><td style="text-align:left;">Traveling Salesman, Assignment Problem</td><td>O(2^n * n)</td></tr>
<tr><td style="text-align:left; font-weight:500;">Digit DP</td><td style="text-align:left;">Count numbers with property, digit sum</td><td>O(digits * state)</td></tr>
</tbody>
</table>

### When DP is NOT the answer

DP does not apply when:

- **No overlapping subproblems:** If every subproblem is unique (like in standard merge sort), DP adds overhead without benefit. This is just divide-and-conquer.
- **No optimal substructure:** Some problems, like finding the longest simple path in a general graph, do not have optimal substructure. Subpath optimality does not guarantee overall path optimality when revisiting nodes is forbidden.
- **The state space is too large:** If the DP table would require $$O(2^n)$$ cells, the "DP solution" is no better than brute force. Problems like the Traveling Salesman have DP solutions that are better than naive brute force ($$O(2^n \cdot n)$$ vs $$O(n!)$$) but still exponential.

---

## Complexity Comparison: All Problems

Here is a summary of the DP problems we covered and their complexities:

<table class="dp-table" style="margin: 1rem auto; font-size: 0.85rem;">
<thead>
<tr><th>Problem</th><th>Brute Force</th><th>DP Time</th><th>DP Space</th><th>Optimized Space</th></tr>
</thead>
<tbody>
<tr><td style="text-align:left; font-weight:500;">Fibonacci</td><td>O(2^n)</td><td>O(n)</td><td>O(n)</td><td>O(1)</td></tr>
<tr><td style="text-align:left; font-weight:500;">Climbing Stairs</td><td>O(2^n)</td><td>O(n)</td><td>O(n)</td><td>O(1)</td></tr>
<tr><td style="text-align:left; font-weight:500;">0/1 Knapsack</td><td>O(2^n)</td><td>O(n*W)</td><td>O(n*W)</td><td>O(W)</td></tr>
<tr><td style="text-align:left; font-weight:500;">LCS</td><td>O(2^(m+n))</td><td>O(m*n)</td><td>O(m*n)</td><td>O(min(m,n))</td></tr>
<tr><td style="text-align:left; font-weight:500;">Edit Distance</td><td>O(3^(m+n))</td><td>O(m*n)</td><td>O(m*n)</td><td>O(min(m,n))</td></tr>
<tr><td style="text-align:left; font-weight:500;">Coin Change</td><td>O(amount^n)</td><td>O(n*amount)</td><td>O(amount)</td><td>O(amount)</td></tr>
</tbody>
</table>

---

## Key Takeaways

1. **Dynamic programming avoids redundant work** by caching solutions to overlapping subproblems. A problem that takes $$O(2^n)$$ with naive recursion can often be solved in $$O(n)$$ or $$O(n^2)$$ with DP.

2. **Tabulation (bottom-up) is generally preferred** over memoization (top-down) because it avoids recursion overhead and stack overflow issues on large inputs. However, memoization is easier to implement when starting from a recursive solution.

3. **The hardest part is defining the recurrence.** Once you identify the state (what changes between subproblems) and the transition (how to compute a state from smaller states), the implementation is straightforward.

4. **The 0/1 Knapsack** teaches the "include or exclude" pattern that appears in many optimization problems. At each step, you make a binary choice and take the best outcome.

5. **LCS and Edit Distance** are foundational string algorithms. LCS powers diff tools and version control. Edit distance powers spell checkers and search engines. Both follow the same 2D table-filling pattern.

6. **Space optimization is often possible.** Since most DP recurrences only look at the previous row (or previous few values), you can reduce space from $$O(n \cdot m)$$ to $$O(m)$$ or even $$O(1)$$.

7. **Practice the framework:** For every new DP problem, follow the steps: define state, write recurrence, identify base cases, determine fill order, extract answer. This systematic approach demystifies even hard problems.

8. **Try experimenting above:** Change the Fibonacci $$n$$ value to see how the recursion tree explodes. Modify the knapsack items to see how different weights and values change the optimal selection. Try different strings in LCS and Edit Distance to build intuition for how the table structure changes.

---

## What's Next?

Dynamic programming is a technique that becomes easier with practice. The patterns repeat across problems: identify the state, write the recurrence, fill the table. Now that you have built intuition with these classic problems, you are well-equipped to tackle more advanced DP challenges like matrix chain multiplication, longest increasing subsequence, and bitmask DP.

Some recommended next problems to practice:
- **Longest Increasing Subsequence (LIS)**  - $$O(n^2)$$ DP, $$O(n \log n)$$ with binary search
- **Matrix Chain Multiplication**  - interval DP with $$O(n^3)$$ complexity
- **Palindrome Partitioning**  - minimum cuts to partition a string into palindromes
- **House Robber**  - linear DP with the "take or skip" pattern
- **Coin Change 2**  - count the number of ways (not minimum coins)

Continue exploring the [DSA Interactive Guide series]({{ site.baseurl }}/) for more hands-on algorithm visualizations, from sorting and searching to trees and graphs.
