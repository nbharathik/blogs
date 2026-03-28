---
layout: post
title: "Heaps (Min-Heap): An Interactive Guide"
author: bharathikannan
categories: [Data Structures]
description: "Visualize min-heap operations interactively. Insert with sift-up, remove-min with sift-down, and build-heap  - all animated step by step with dual tree + array views."
permalink: /heaps/
hidden: true
---

<style>
.interactive-demo { border: 1px solid var(--border); border-radius: 12px; padding: 1.2rem; margin: 1.5rem 0; background: var(--bg-secondary); overflow: hidden; }
.interactive-demo canvas { display: block; margin: 0 auto; max-width: 100%; border-radius: 8px; }
.demo-controls { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-top: 0.75rem; font-size: 0.9rem; }
.demo-controls label { display: flex; align-items: center; gap: 0.4rem; font-weight: 500; }
.demo-controls input[type="range"] { width: 160px; accent-color: var(--accent); }
.demo-controls input[type="number"] { width: 70px; padding: 0.3rem 0.5rem; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; }
.demo-controls button { padding: 0.4rem 1rem; border: 1px solid var(--accent); border-radius: 6px; background: transparent; color: var(--accent); cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: background 0.15s, color 0.15s; }
.demo-controls button:hover { background: var(--accent); color: var(--bg-primary); }
.demo-controls button.active { background: var(--accent); color: var(--bg-primary); }
.demo-controls .demo-value { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; min-width: 4rem; }
.demo-info { margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
.demo-hint { background: var(--bg-secondary); border-left: 3px solid var(--accent); padding: 0.6rem 0.9rem; margin: 1rem 0; border-radius: 0 6px 6px 0; font-size: 0.85rem; color: var(--text-secondary); }
@media (max-width: 640px) { .demo-controls input[type="range"] { width: 120px; } }
</style>

<script>
window.DSA_Heap = (function() {
  function getColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg: dark ? '#1a1b26' : '#ffffff',
      node: dark ? '#7aa2f7' : '#2563eb',
      nodeCurrent: dark ? '#ff9e64' : '#f59e0b',
      nodeSwap: dark ? '#f7768e' : '#e63946',
      nodeSettled: dark ? '#9ece6a' : '#16a34a',
      nodeNew: dark ? '#bb9af7' : '#7c3aed',
      nodeGhost: dark ? '#565f89' : '#d1d5db',
      edge: dark ? '#565f89' : '#9ca3af',
      edgeHighlight: dark ? '#ff9e64' : '#f59e0b',
      bar: dark ? '#7aa2f7' : '#2563eb',
      barCurrent: dark ? '#ff9e64' : '#f59e0b',
      barSwap: dark ? '#f7768e' : '#e63946',
      barSettled: dark ? '#9ece6a' : '#16a34a',
      barNew: dark ? '#bb9af7' : '#7c3aed',
      text: dark ? '#c0caf5' : '#1a1b26',
      textOnNode: '#ffffff',
      textMuted: dark ? '#565f89' : '#6b7280',
      border: dark ? '#292e42' : '#e5e7eb'
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

  var NODE_R = 20;

  // Compute tree positions from a heap array
  // Returns array of { val, x, y, idx }
  function layoutHeap(arr, w, treeH, offsetY) {
    if (!arr.length) return [];
    var positions = [];
    var padSide = 40;
    var padT = offsetY + 30;

    // Compute depth of tree
    var depth = Math.floor(Math.log2(arr.length)) + 1;
    var levelH = Math.min(55, (treeH - 50) / Math.max(depth, 1));

    for (var i = 0; i < arr.length; i++) {
      var d = Math.floor(Math.log2(i + 1));
      var posInLevel = i - (Math.pow(2, d) - 1);
      var nodesInLevel = Math.pow(2, d);
      var spacing = (w - 2 * padSide) / nodesInLevel;
      var x = padSide + spacing * posInLevel + spacing / 2;
      var y = padT + d * levelH;
      positions.push({ val: arr[i], x: x, y: y, idx: i });
    }
    return positions;
  }

  // Draw the heap as a tree in the top portion of canvas
  // highlights: { idx: 'current'|'swap'|'settled'|'new'|'ghost' }
  function drawHeapTree(ctx, arr, w, treeH, offsetY, highlights) {
    var c = getColors();
    highlights = highlights || {};
    var positions = layoutHeap(arr, w, treeH, offsetY);

    // Draw edges
    for (var i = 0; i < arr.length; i++) {
      var left = 2 * i + 1;
      var right = 2 * i + 2;
      var px = positions[i].x;
      var py = positions[i].y;

      if (left < arr.length) {
        var hl = highlights[left];
        ctx.strokeStyle = (hl === 'current' || hl === 'swap') ? c.edgeHighlight : c.edge;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py + NODE_R);
        ctx.lineTo(positions[left].x, positions[left].y - NODE_R);
        ctx.stroke();
      }
      if (right < arr.length) {
        var hl2 = highlights[right];
        ctx.strokeStyle = (hl2 === 'current' || hl2 === 'swap') ? c.edgeHighlight : c.edge;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py + NODE_R);
        ctx.lineTo(positions[right].x, positions[right].y - NODE_R);
        ctx.stroke();
      }
    }

    // Draw nodes
    for (var j = 0; j < positions.length; j++) {
      var p = positions[j];
      var hlType = highlights[p.idx];
      var col = c.node;
      if (hlType === 'current') col = c.nodeCurrent;
      else if (hlType === 'swap') col = c.nodeSwap;
      else if (hlType === 'settled') col = c.nodeSettled;
      else if (hlType === 'new') col = c.nodeNew;
      else if (hlType === 'ghost') col = c.nodeGhost;

      ctx.beginPath();
      ctx.arc(p.x, p.y, NODE_R, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      ctx.fillStyle = c.textOnNode;
      ctx.font = 'bold 13px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.val, p.x, p.y);
    }
  }

  // Draw the heap array as bars at the bottom portion of canvas
  // highlights: same map { idx: type }
  function drawHeapArray(ctx, arr, w, barAreaH, offsetY, highlights) {
    var c = getColors();
    highlights = highlights || {};

    if (arr.length === 0) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Empty heap', w / 2, offsetY + barAreaH / 2);
      return;
    }

    var padSide = 30;
    var maxBarW = 48;
    var gap = 4;
    var availW = w - 2 * padSide;
    var barW = Math.min(maxBarW, (availW - gap * (arr.length - 1)) / arr.length);
    var totalW = arr.length * barW + (arr.length - 1) * gap;
    var startX = (w - totalW) / 2;

    var maxVal = Math.max.apply(null, arr);
    if (maxVal === 0) maxVal = 1;
    var maxBarH = barAreaH - 50;

    for (var i = 0; i < arr.length; i++) {
      var x = startX + i * (barW + gap);
      var barH = Math.max(8, (arr[i] / maxVal) * maxBarH);
      var y = offsetY + barAreaH - 28 - barH;

      var hlType = highlights[i];
      var col = c.bar;
      if (hlType === 'current') col = c.barCurrent;
      else if (hlType === 'swap') col = c.barSwap;
      else if (hlType === 'settled') col = c.barSettled;
      else if (hlType === 'new') col = c.barNew;

      // Draw bar
      ctx.fillStyle = col;
      ctx.beginPath();
      var r = 3;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.fill();

      // Value on top of bar
      ctx.fillStyle = c.text;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(arr[i], x + barW / 2, y - 2);

      // Index below bar
      ctx.fillStyle = c.textMuted;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textBaseline = 'top';
      ctx.fillText(i, x + barW / 2, offsetY + barAreaH - 24);
    }
  }

  // Combined draw: tree on top, array on bottom
  function drawDualView(ctx, arr, w, h, highlights) {
    var c = getColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    if (arr.length === 0) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Empty heap', w / 2, h / 2);
      return;
    }

    var treeH = h * 0.6;
    var barH = h * 0.4;

    // Separator line
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, treeH);
    ctx.lineTo(w - 20, treeH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = c.textMuted;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Tree View', 8, 4);
    ctx.fillText('Array View', 8, treeH + 4);

    drawHeapTree(ctx, arr, w, treeH, 0, highlights);
    drawHeapArray(ctx, arr, w, barH, treeH, highlights);
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
    drawDualView: drawDualView,
    drawHeapTree: drawHeapTree,
    drawHeapArray: drawHeapArray,
    layoutHeap: layoutHeap,
    NODE_R: NODE_R,
    onThemeChange: onThemeChange
  };
})();
</script>

A **heap** is a specialized tree-based data structure that satisfies two properties: it is a **complete binary tree** and it maintains the **heap property**. Heaps are the engine behind priority queues, heap sort, and numerous graph algorithms like Dijkstra's shortest path.

This guide focuses on the **min-heap**, where the smallest element is always at the root. By the end you will understand:

- **Complete binary tree** property and why heaps use arrays
- **Insert** with sift-up
- **Remove minimum** with sift-down
- **Build heap** (heapify) from an unsorted array in $$O(n)$$

<div class="demo-hint">
<strong>How to use the demos:</strong> Each interactive visualization shows both a tree view and an array view side by side. As you step through operations, both views update simultaneously so you can see how tree movements correspond to array swaps.
</div>

---

## What is a Heap?

A heap is a **complete binary tree** stored as an array. "Complete" means every level is fully filled except possibly the last, which is filled from left to right. This structure guarantees the tree is always balanced, giving us $$O(\log n)$$ height.

The **min-heap property** states: for every node $$i$$, the value of $$i$$ is less than or equal to the values of its children.

$$\text{For all } i: \quad A[i] \leq A[\text{left}(i)] \quad \text{and} \quad A[i] \leq A[\text{right}(i)]$$

This means the **minimum element is always at the root** (index 0).

### Why Use an Array?

Because the tree is complete, we can map every node to an array index with a simple formula. No pointers needed.

For a node at index $$i$$:
- **Parent:** $$\lfloor (i - 1) / 2 \rfloor$$
- **Left child:** $$2i + 1$$
- **Right child:** $$2i + 2$$

```python
def parent(i):
    return (i - 1) // 2

def left_child(i):
    return 2 * i + 1

def right_child(i):
    return 2 * i + 2
```

For example, in the array `[2, 5, 8, 10, 7, 15, 20]`:
- Index 0 holds value 2 (the root, and the minimum)
- Index 0's left child is at index 1 (value 5), right child at index 2 (value 8)
- Index 1's left child is at index 3 (value 10), right child at index 4 (value 7)

### Interactive: Explore the Mapping

<div class="demo-hint">
<strong>Interactive:</strong> Click on any node in the tree or any bar in the array to highlight it and see its parent/children relationships. The corresponding indices light up in both views.
</div>

<div class="interactive-demo">
  <canvas id="heap-explore-canvas" width="680" height="340"></canvas>
  <div class="demo-controls">
    <button id="heap-explore-reset">Reset</button>
    <span class="demo-value" id="heap-explore-selected"></span>
  </div>
  <div class="demo-info" id="heap-explore-info">Click a node to see its parent/children. Array: [2, 5, 8, 10, 7, 15, 20]</div>
</div>

<script>
(function() {
  var H = window.DSA_Heap;
  var canvas = document.getElementById('heap-explore-canvas');
  var W = 680, HH = 340;
  var ctx = H.setupCanvas(canvas, W, HH);
  var arr = [2, 5, 8, 10, 7, 15, 20];
  var selected = -1;

  function draw() {
    var highlights = {};
    if (selected >= 0 && selected < arr.length) {
      highlights[selected] = 'current';
      var p = Math.floor((selected - 1) / 2);
      if (selected > 0 && p >= 0) highlights[p] = 'settled';
      var l = 2 * selected + 1;
      var r = 2 * selected + 2;
      if (l < arr.length) highlights[l] = 'swap';
      if (r < arr.length) highlights[r] = 'swap';
    }
    H.drawDualView(ctx, arr, W, HH, highlights);

    if (selected >= 0 && selected < arr.length) {
      var p2 = Math.floor((selected - 1) / 2);
      var l2 = 2 * selected + 1;
      var r2 = 2 * selected + 2;
      var info = 'Index ' + selected + ' (value ' + arr[selected] + ')';
      if (selected > 0) info += ' | Parent: idx ' + p2 + ' (val ' + arr[p2] + ')';
      else info += ' | Root (no parent)';
      if (l2 < arr.length) info += ' | Left: idx ' + l2 + ' (val ' + arr[l2] + ')';
      else info += ' | Left: none';
      if (r2 < arr.length) info += ' | Right: idx ' + r2 + ' (val ' + arr[r2] + ')';
      else info += ' | Right: none';
      document.getElementById('heap-explore-info').textContent = info;
      document.getElementById('heap-explore-selected').textContent = 'Selected: [' + selected + '] = ' + arr[selected];
    } else {
      document.getElementById('heap-explore-info').textContent = 'Click a node to see its parent/children. Array: [' + arr.join(', ') + ']';
      document.getElementById('heap-explore-selected').textContent = '';
    }
  }

  draw();
  H.onThemeChange(draw);

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = W / rect.width;
    var scaleY = HH / rect.height;
    var mx = (e.clientX - rect.left) * scaleX;
    var my = (e.clientY - rect.top) * scaleY;

    var treeH = HH * 0.6;
    // Check tree nodes
    var positions = H.layoutHeap(arr, W, treeH, 0);
    for (var i = 0; i < positions.length; i++) {
      var dx = mx - positions[i].x;
      var dy = my - positions[i].y;
      if (dx * dx + dy * dy < H.NODE_R * H.NODE_R * 1.5) {
        selected = (selected === i) ? -1 : i;
        draw();
        return;
      }
    }

    // Check array bars region
    if (my > treeH) {
      var padSide = 30;
      var maxBarW = 48;
      var gap = 4;
      var availW = W - 2 * padSide;
      var barW = Math.min(maxBarW, (availW - gap * (arr.length - 1)) / arr.length);
      var totalW = arr.length * barW + (arr.length - 1) * gap;
      var startX = (W - totalW) / 2;
      for (var j = 0; j < arr.length; j++) {
        var bx = startX + j * (barW + gap);
        if (mx >= bx && mx <= bx + barW) {
          selected = (selected === j) ? -1 : j;
          draw();
          return;
        }
      }
    }

    selected = -1;
    draw();
  });

  document.getElementById('heap-explore-reset').onclick = function() {
    selected = -1;
    draw();
  };
})();
</script>

---

## Min-Heap Insert (Sift Up)

To insert a value into a min-heap:

1. **Append** the new value at the end of the array (the next available position in the complete tree).
2. **Sift up:** compare the new value with its parent. If it is smaller, swap them. Repeat until the heap property is restored or we reach the root.

This takes $$O(\log n)$$ time since the tree has at most $$\log_2 n$$ levels.

### Python Implementation

```python
class MinHeap:
    def __init__(self):
        self.heap = []

    def insert(self, val):
        self.heap.append(val)
        self._sift_up(len(self.heap) - 1)

    def _sift_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self.heap[i] < self.heap[parent]:
                self.heap[i], self.heap[parent] = self.heap[parent], self.heap[i]
                i = parent
            else:
                break
```

The `_sift_up` method walks from the newly inserted node up toward the root. At each step, if the child is smaller than its parent, we swap and continue. The moment the child is not smaller, the min-heap property holds for the entire tree.

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> Enter a value and click <strong>Insert</strong>. The new value appears at the end of the array (in purple), then sifts up through the tree. Yellow highlights the node being compared; red highlights a swap. Both the tree and the array update simultaneously.
</div>

<div class="interactive-demo">
  <canvas id="heap-insert-canvas" width="680" height="340"></canvas>
  <div class="demo-controls">
    <label>Value: <input type="number" id="heap-insert-value" value="3" style="width:60px;"></label>
    <button id="heap-insert-btn">Insert</button>
    <button id="heap-insert-step">Step</button>
    <button id="heap-insert-run">Run</button>
    <button id="heap-insert-reset">Reset</button>
    <label>Speed: <input type="range" id="heap-insert-speed" min="1" max="10" value="4"> <span class="demo-value" id="heap-insert-speed-val">4</span></label>
  </div>
  <div class="demo-info" id="heap-insert-info">Heap: [2, 5, 8, 10, 7, 15, 20] | Ready  - enter a value and click Insert</div>
</div>

<script>
(function() {
  var HP = window.DSA_Heap;
  var canvas = document.getElementById('heap-insert-canvas');
  var W = 680, H = 340;
  var ctx = HP.setupCanvas(canvas, W, H);
  var initialArr = [2, 5, 8, 10, 7, 15, 20];
  var arr = initialArr.slice();
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;
  var animating = false;

  function setInfo(msg) {
    document.getElementById('heap-insert-info').textContent = msg;
  }

  function draw(highlights) {
    HP.drawDualView(ctx, arr, W, H, highlights || {});
  }

  function drawState() {
    if (states.length === 0) {
      draw();
      setInfo('Heap: [' + arr.join(', ') + '] | Ready  - enter a value and click Insert');
      return;
    }
    var st = states[step];
    arr = st.arr.slice();
    draw(st.highlights);
    setInfo(st.info);
  }

  // Generate sift-up animation states
  function generateInsertStates(heapArr, val) {
    var result = [];
    var a = heapArr.slice();
    a.push(val);
    var i = a.length - 1;

    // State: just inserted
    var hl0 = {};
    hl0[i] = 'new';
    result.push({
      arr: a.slice(),
      highlights: hl0,
      info: 'Inserted ' + val + ' at index ' + i + '. Start sift-up.'
    });

    while (i > 0) {
      var parent = Math.floor((i - 1) / 2);

      // State: comparing
      var hlCmp = {};
      hlCmp[i] = 'current';
      hlCmp[parent] = 'current';
      result.push({
        arr: a.slice(),
        highlights: hlCmp,
        info: 'Compare index ' + i + ' (val ' + a[i] + ') with parent index ' + parent + ' (val ' + a[parent] + ')'
      });

      if (a[i] < a[parent]) {
        // State: swapping
        var temp = a[i];
        a[i] = a[parent];
        a[parent] = temp;

        var hlSwap = {};
        hlSwap[i] = 'swap';
        hlSwap[parent] = 'swap';
        result.push({
          arr: a.slice(),
          highlights: hlSwap,
          info: 'Swap! ' + a[parent] + ' < ' + a[i] + '. Move ' + a[parent] + ' up to index ' + parent + '.'
        });

        i = parent;
      } else {
        // State: no swap needed
        var hlDone = {};
        hlDone[i] = 'settled';
        result.push({
          arr: a.slice(),
          highlights: hlDone,
          info: a[i] + ' >= ' + a[parent] + '. Heap property satisfied. Sift-up complete!'
        });
        break;
      }
    }

    if (i === 0) {
      var hlRoot = {};
      hlRoot[0] = 'settled';
      result.push({
        arr: a.slice(),
        highlights: hlRoot,
        info: 'Reached root. Sift-up complete! New min is ' + a[0] + '.'
      });
    }

    // Final state: all normal
    result.push({
      arr: a.slice(),
      highlights: {},
      info: 'Heap: [' + a.join(', ') + '] | Insert complete.'
    });

    return result;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      drawState();
      if (running) {
        var speed = parseInt(document.getElementById('heap-insert-speed').value) || 4;
        timer = setTimeout(advance, Math.max(150, 1200 - speed * 110));
      }
    } else {
      running = false;
      animating = false;
      document.getElementById('heap-insert-run').textContent = 'Run';
    }
  }

  function stopRunning() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('heap-insert-run').textContent = 'Run';
  }

  draw();
  setInfo('Heap: [' + arr.join(', ') + '] | Ready  - enter a value and click Insert');
  HP.onThemeChange(function() { drawState(); });

  document.getElementById('heap-insert-btn').onclick = function() {
    if (animating) return;
    var val = parseInt(document.getElementById('heap-insert-value').value);
    if (isNaN(val)) return;
    if (arr.length >= 15) {
      setInfo('Heap is full (max 15 for visualization). Click Reset.');
      return;
    }
    animating = true;
    states = generateInsertStates(arr, val);
    step = 0;
    drawState();
  };

  document.getElementById('heap-insert-step').onclick = function() {
    if (states.length === 0) return;
    stopRunning();
    advance();
  };

  document.getElementById('heap-insert-run').onclick = function() {
    if (states.length === 0) return;
    if (running) {
      stopRunning();
    } else {
      if (step >= states.length - 1) {
        step = 0;
        drawState();
      }
      running = true;
      document.getElementById('heap-insert-run').textContent = 'Pause';
      advance();
    }
  };

  document.getElementById('heap-insert-reset').onclick = function() {
    stopRunning();
    animating = false;
    arr = initialArr.slice();
    states = [];
    step = 0;
    draw();
    setInfo('Heap: [' + arr.join(', ') + '] | Ready  - enter a value and click Insert');
  };

  document.getElementById('heap-insert-speed').oninput = function() {
    document.getElementById('heap-insert-speed-val').textContent = this.value;
  };
})();
</script>

### Sift Up Complexity

Each swap moves the node one level up the tree. A complete binary tree with $$n$$ nodes has height $$\lfloor \log_2 n \rfloor$$, so sift-up performs at most $$O(\log n)$$ comparisons and swaps. Since each comparison and swap is $$O(1)$$, insert is $$O(\log n)$$.

---

## Min-Heap Remove Min (Sift Down)

The minimum element is always at the root (index 0). To remove it:

1. **Replace** the root with the last element in the array.
2. **Remove** the last element (shrink the array by one).
3. **Sift down:** compare the new root with its children. Swap it with the **smaller child** if it is larger. Repeat until the heap property is restored or we reach a leaf.

This also takes $$O(\log n)$$ time.

### Python Implementation

```python
class MinHeap:
    def __init__(self):
        self.heap = []

    def remove_min(self):
        if not self.heap:
            return None
        if len(self.heap) == 1:
            return self.heap.pop()

        min_val = self.heap[0]
        self.heap[0] = self.heap.pop()  # move last to root
        self._sift_down(0)
        return min_val

    def _sift_down(self, i):
        n = len(self.heap)
        while True:
            smallest = i
            left = 2 * i + 1
            right = 2 * i + 2

            if left < n and self.heap[left] < self.heap[smallest]:
                smallest = left
            if right < n and self.heap[right] < self.heap[smallest]:
                smallest = right

            if smallest != i:
                self.heap[i], self.heap[smallest] = self.heap[smallest], self.heap[i]
                i = smallest
            else:
                break
```

The `_sift_down` method starts at the root and pushes the out-of-place value downward. At each level, it finds the smallest among the current node and its two children. If the current node is not the smallest, it swaps with the smallest child and continues.

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>Remove Min</strong> to extract the root. The last element moves to the root (shown in purple), then sifts down. Yellow marks the comparison, red marks a swap. Step through or run the full animation.
</div>

<div class="interactive-demo">
  <canvas id="heap-remove-canvas" width="680" height="340"></canvas>
  <div class="demo-controls">
    <button id="heap-remove-btn">Remove Min</button>
    <button id="heap-remove-step">Step</button>
    <button id="heap-remove-run">Run</button>
    <button id="heap-remove-reset">Reset</button>
    <label>Speed: <input type="range" id="heap-remove-speed" min="1" max="10" value="4"> <span class="demo-value" id="heap-remove-speed-val">4</span></label>
  </div>
  <div class="demo-info" id="heap-remove-info">Heap: [2, 5, 8, 10, 7, 15, 20] | Ready  - click Remove Min</div>
</div>

<script>
(function() {
  var HP = window.DSA_Heap;
  var canvas = document.getElementById('heap-remove-canvas');
  var W = 680, H = 340;
  var ctx = HP.setupCanvas(canvas, W, H);
  var initialArr = [2, 5, 8, 10, 7, 15, 20];
  var arr = initialArr.slice();
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;
  var animating = false;
  var removedValues = [];

  function setInfo(msg) {
    document.getElementById('heap-remove-info').textContent = msg;
  }

  function draw(highlights) {
    HP.drawDualView(ctx, arr, W, H, highlights || {});
  }

  function drawState() {
    if (states.length === 0) {
      draw();
      var rmStr = removedValues.length ? ' | Removed: [' + removedValues.join(', ') + ']' : '';
      setInfo('Heap: [' + arr.join(', ') + ']' + rmStr + ' | Ready');
      return;
    }
    var st = states[step];
    arr = st.arr.slice();
    draw(st.highlights);
    setInfo(st.info);
  }

  // Generate sift-down animation states for remove-min
  function generateRemoveStates(heapArr) {
    var result = [];
    var a = heapArr.slice();
    if (a.length === 0) return result;

    var minVal = a[0];

    // State: highlight root being removed
    var hl0 = {};
    hl0[0] = 'swap';
    result.push({
      arr: a.slice(),
      highlights: hl0,
      info: 'Removing min value ' + minVal + ' from root.'
    });

    if (a.length === 1) {
      result.push({
        arr: [],
        highlights: {},
        info: 'Removed ' + minVal + '. Heap is now empty.'
      });
      return result;
    }

    // State: move last to root
    var lastVal = a[a.length - 1];
    a[0] = lastVal;
    a.pop();

    var hl1 = {};
    hl1[0] = 'new';
    result.push({
      arr: a.slice(),
      highlights: hl1,
      info: 'Moved last element ' + lastVal + ' to root. Start sift-down.'
    });

    // Sift down
    var i = 0;
    var n = a.length;
    while (true) {
      var smallest = i;
      var left = 2 * i + 1;
      var right = 2 * i + 2;

      // State: comparing with children
      var hlCmp = {};
      hlCmp[i] = 'current';
      if (left < n) hlCmp[left] = 'current';
      if (right < n) hlCmp[right] = 'current';
      var childInfo = '';
      if (left < n && right < n) {
        childInfo = 'Compare index ' + i + ' (val ' + a[i] + ') with children: left ' + a[left] + ', right ' + a[right];
      } else if (left < n) {
        childInfo = 'Compare index ' + i + ' (val ' + a[i] + ') with left child ' + a[left];
      } else {
        childInfo = 'Index ' + i + ' (val ' + a[i] + ') is a leaf. Sift-down complete!';
      }
      result.push({
        arr: a.slice(),
        highlights: hlCmp,
        info: childInfo
      });

      if (left >= n) break;

      if (left < n && a[left] < a[smallest]) smallest = left;
      if (right < n && a[right] < a[smallest]) smallest = right;

      if (smallest !== i) {
        // State: swap
        var temp = a[i];
        a[i] = a[smallest];
        a[smallest] = temp;

        var hlSwap = {};
        hlSwap[i] = 'swap';
        hlSwap[smallest] = 'swap';
        result.push({
          arr: a.slice(),
          highlights: hlSwap,
          info: 'Swap index ' + i + ' with index ' + smallest + '. Value ' + a[i] + ' moves up, ' + a[smallest] + ' moves down.'
        });

        i = smallest;
      } else {
        // No swap needed
        var hlOk = {};
        hlOk[i] = 'settled';
        result.push({
          arr: a.slice(),
          highlights: hlOk,
          info: a[i] + ' is smaller than its children. Heap property restored!'
        });
        break;
      }
    }

    // Final state
    result.push({
      arr: a.slice(),
      highlights: {},
      info: 'Removed ' + minVal + '. Heap: [' + a.join(', ') + ']'
    });

    return result;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      drawState();
      if (running) {
        var speed = parseInt(document.getElementById('heap-remove-speed').value) || 4;
        timer = setTimeout(advance, Math.max(150, 1200 - speed * 110));
      }
    } else {
      running = false;
      animating = false;
      document.getElementById('heap-remove-run').textContent = 'Run';
    }
  }

  function stopRunning() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('heap-remove-run').textContent = 'Run';
  }

  draw();
  setInfo('Heap: [' + arr.join(', ') + '] | Ready  - click Remove Min');
  HP.onThemeChange(function() { drawState(); });

  document.getElementById('heap-remove-btn').onclick = function() {
    if (animating) return;
    if (arr.length === 0) {
      setInfo('Heap is empty! Click Reset.');
      return;
    }
    animating = true;
    removedValues.push(arr[0]);
    states = generateRemoveStates(arr);
    step = 0;
    drawState();
  };

  document.getElementById('heap-remove-step').onclick = function() {
    if (states.length === 0) return;
    stopRunning();
    advance();
  };

  document.getElementById('heap-remove-run').onclick = function() {
    if (states.length === 0) return;
    if (running) {
      stopRunning();
    } else {
      if (step >= states.length - 1) {
        step = 0;
        drawState();
      }
      running = true;
      document.getElementById('heap-remove-run').textContent = 'Pause';
      advance();
    }
  };

  document.getElementById('heap-remove-reset').onclick = function() {
    stopRunning();
    animating = false;
    arr = initialArr.slice();
    states = [];
    step = 0;
    removedValues = [];
    draw();
    setInfo('Heap: [' + arr.join(', ') + '] | Ready  - click Remove Min');
  };

  document.getElementById('heap-remove-speed').oninput = function() {
    document.getElementById('heap-remove-speed-val').textContent = this.value;
  };
})();
</script>

### Sift Down Complexity

Like sift-up, each swap moves the node one level down. The maximum number of levels is $$\lfloor \log_2 n \rfloor$$, so remove-min is $$O(\log n)$$.

---

## Build Heap (Heapify)

Given an unsorted array, we can build a valid min-heap **in-place** in $$O(n)$$ time using the **bottom-up heapify** algorithm.

### The Naive Approach

One way to build a heap is to insert elements one by one. Each insert is $$O(\log n)$$, so building from $$n$$ elements takes $$O(n \log n)$$. We can do better.

### Bottom-Up Heapify

The key insight: **leaf nodes are already valid heaps** (a single node trivially satisfies the heap property). So we only need to fix the internal nodes, working from the bottom up.

1. Start from the last internal node (index $$\lfloor n/2 \rfloor - 1$$).
2. Call sift-down on each internal node, moving backward to the root.
3. After processing every internal node, the array is a valid heap.

```python
class MinHeap:
    def __init__(self):
        self.heap = []

    def build_heap(self, arr):
        self.heap = arr[:]
        # Start from last internal node
        for i in range(len(self.heap) // 2 - 1, -1, -1):
            self._sift_down(i)

    def _sift_down(self, i):
        n = len(self.heap)
        while True:
            smallest = i
            left = 2 * i + 1
            right = 2 * i + 2

            if left < n and self.heap[left] < self.heap[smallest]:
                smallest = left
            if right < n and self.heap[right] < self.heap[smallest]:
                smallest = right

            if smallest != i:
                self.heap[i], self.heap[smallest] = self.heap[smallest], self.heap[i]
                i = smallest
            else:
                break
```

### Why is Heapify O(n)?

This is a subtle but important result. Although we call sift-down $$O(n)$$ times, most nodes are near the bottom of the tree where sift-down does very little work.

- $$n/2$$ nodes are leaves (0 swaps)
- $$n/4$$ nodes are at height 1 (at most 1 swap)
- $$n/8$$ nodes are at height 2 (at most 2 swaps)
- And so on...

The total work is:

$$\sum_{h=0}^{\lfloor \log n \rfloor} \frac{n}{2^{h+1}} \cdot h = n \sum_{h=0}^{\infty} \frac{h}{2^{h+1}} = n \cdot 1 = O(n)$$

This is significantly better than the $$O(n \log n)$$ naive approach.

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> Start with a random unsorted array. Click <strong>Step</strong> to see each sift-down operation, or <strong>Run</strong> to watch the full build-heap process. The current node being sifted is highlighted in yellow, and swaps are shown in red. Click <strong>New Random</strong> to try a different array.
</div>

<div class="interactive-demo">
  <canvas id="heap-build-canvas" width="680" height="360"></canvas>
  <div class="demo-controls">
    <button id="heap-build-step">Step</button>
    <button id="heap-build-run">Run</button>
    <button id="heap-build-reset">Reset</button>
    <button id="heap-build-random">New Random</button>
    <label>Speed: <input type="range" id="heap-build-speed" min="1" max="10" value="4"> <span class="demo-value" id="heap-build-speed-val">4</span></label>
  </div>
  <div class="demo-info" id="heap-build-info">Unsorted array. Click Step or Run to build the heap bottom-up.</div>
</div>

<script>
(function() {
  var HP = window.DSA_Heap;
  var canvas = document.getElementById('heap-build-canvas');
  var W = 680, H = 360;
  var ctx = HP.setupCanvas(canvas, W, H);

  function randomArr() {
    var a = [];
    var used = {};
    while (a.length < 10) {
      var v = Math.floor(Math.random() * 90) + 5;
      if (!used[v]) {
        used[v] = true;
        a.push(v);
      }
    }
    return a;
  }

  var originalArr = randomArr();
  var arr = originalArr.slice();
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function setInfo(msg) {
    document.getElementById('heap-build-info').textContent = msg;
  }

  function draw(highlights) {
    HP.drawDualView(ctx, arr, W, H, highlights || {});
  }

  function drawState() {
    if (states.length === 0) {
      draw();
      setInfo('Array: [' + arr.join(', ') + '] | Click Step or Run to build heap');
      return;
    }
    var st = states[step];
    arr = st.arr.slice();
    draw(st.highlights);
    setInfo(st.info);
  }

  // Generate all build-heap states
  function generateBuildStates(inputArr) {
    var result = [];
    var a = inputArr.slice();
    var n = a.length;
    var startIdx = Math.floor(n / 2) - 1;

    // Initial state
    result.push({
      arr: a.slice(),
      highlights: {},
      info: 'Unsorted: [' + a.join(', ') + ']. Start from last internal node (index ' + startIdx + ').'
    });

    // Mark leaves as already valid
    var leafHl = {};
    for (var lf = startIdx + 1; lf < n; lf++) {
      leafHl[lf] = 'settled';
    }
    result.push({
      arr: a.slice(),
      highlights: leafHl,
      info: 'Leaf nodes (indices ' + (startIdx + 1) + ' to ' + (n - 1) + ') are already valid heaps.'
    });

    // Process each internal node from bottom to top
    for (var idx = startIdx; idx >= 0; idx--) {
      // Highlight which node we are about to sift
      var hlStart = {};
      hlStart[idx] = 'new';
      result.push({
        arr: a.slice(),
        highlights: hlStart,
        info: 'Sift-down index ' + idx + ' (val ' + a[idx] + ').'
      });

      // Sift down this node
      var i = idx;
      while (true) {
        var smallest = i;
        var left = 2 * i + 1;
        var right = 2 * i + 2;

        // Compare state
        var hlCmp = {};
        hlCmp[i] = 'current';
        if (left < n) hlCmp[left] = 'current';
        if (right < n) hlCmp[right] = 'current';

        var childStr = '';
        if (left < n && right < n) {
          childStr = 'Comparing ' + a[i] + ' with children ' + a[left] + ' and ' + a[right];
        } else if (left < n) {
          childStr = 'Comparing ' + a[i] + ' with left child ' + a[left];
        } else {
          childStr = a[i] + ' is a leaf.';
        }
        result.push({
          arr: a.slice(),
          highlights: hlCmp,
          info: childStr
        });

        if (left >= n) break;

        if (left < n && a[left] < a[smallest]) smallest = left;
        if (right < n && a[right] < a[smallest]) smallest = right;

        if (smallest !== i) {
          var tmp = a[i];
          a[i] = a[smallest];
          a[smallest] = tmp;

          var hlSwap = {};
          hlSwap[i] = 'swap';
          hlSwap[smallest] = 'swap';
          result.push({
            arr: a.slice(),
            highlights: hlSwap,
            info: 'Swap index ' + i + ' and ' + smallest + '. (' + a[i] + ' <-> ' + a[smallest] + ')'
          });

          i = smallest;
        } else {
          var hlOk = {};
          hlOk[i] = 'settled';
          result.push({
            arr: a.slice(),
            highlights: hlOk,
            info: a[i] + ' is already smaller than children. Done with this node.'
          });
          break;
        }
      }
    }

    // Final state
    result.push({
      arr: a.slice(),
      highlights: {},
      info: 'Build complete! Min-heap: [' + a.join(', ') + ']. Root ' + a[0] + ' is the minimum.'
    });

    return result;
  }

  function initStates() {
    states = generateBuildStates(arr);
    step = 0;
    drawState();
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      drawState();
      if (running) {
        var speed = parseInt(document.getElementById('heap-build-speed').value) || 4;
        timer = setTimeout(advance, Math.max(150, 1200 - speed * 110));
      }
    } else {
      running = false;
      document.getElementById('heap-build-run').textContent = 'Run';
    }
  }

  function stopRunning() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('heap-build-run').textContent = 'Run';
  }

  draw();
  setInfo('Array: [' + arr.join(', ') + '] | Click Step or Run to build heap');
  HP.onThemeChange(function() { drawState(); });

  document.getElementById('heap-build-step').onclick = function() {
    if (states.length === 0) initStates();
    stopRunning();
    advance();
  };

  document.getElementById('heap-build-run').onclick = function() {
    if (states.length === 0) initStates();
    if (running) {
      stopRunning();
    } else {
      if (step >= states.length - 1) {
        arr = originalArr.slice();
        initStates();
      }
      running = true;
      document.getElementById('heap-build-run').textContent = 'Pause';
      advance();
    }
  };

  document.getElementById('heap-build-reset').onclick = function() {
    stopRunning();
    arr = originalArr.slice();
    states = [];
    step = 0;
    draw();
    setInfo('Array: [' + arr.join(', ') + '] | Click Step or Run to build heap');
  };

  document.getElementById('heap-build-random').onclick = function() {
    stopRunning();
    originalArr = randomArr();
    arr = originalArr.slice();
    states = [];
    step = 0;
    draw();
    setInfo('Array: [' + arr.join(', ') + '] | Click Step or Run to build heap');
  };

  document.getElementById('heap-build-speed').oninput = function() {
    document.getElementById('heap-build-speed-val').textContent = this.value;
  };
})();
</script>

---

## Complete Min-Heap Implementation

Here is the full Python class combining all operations:

```python
class MinHeap:
    def __init__(self):
        self.heap = []

    def insert(self, val):
        """Insert a value and maintain heap property via sift-up."""
        self.heap.append(val)
        self._sift_up(len(self.heap) - 1)

    def remove_min(self):
        """Remove and return the minimum value via sift-down."""
        if not self.heap:
            return None
        if len(self.heap) == 1:
            return self.heap.pop()

        min_val = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._sift_down(0)
        return min_val

    def peek(self):
        """Return the minimum value without removing it."""
        return self.heap[0] if self.heap else None

    def build_heap(self, arr):
        """Build a heap from an unsorted array in O(n)."""
        self.heap = arr[:]
        for i in range(len(self.heap) // 2 - 1, -1, -1):
            self._sift_down(i)

    def _sift_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self.heap[i] < self.heap[parent]:
                self.heap[i], self.heap[parent] = self.heap[parent], self.heap[i]
                i = parent
            else:
                break

    def _sift_down(self, i):
        n = len(self.heap)
        while True:
            smallest = i
            left = 2 * i + 1
            right = 2 * i + 2

            if left < n and self.heap[left] < self.heap[smallest]:
                smallest = left
            if right < n and self.heap[right] < self.heap[smallest]:
                smallest = right

            if smallest != i:
                self.heap[i], self.heap[smallest] = self.heap[smallest], self.heap[i]
                i = smallest
            else:
                break

    def __len__(self):
        return len(self.heap)

    def __repr__(self):
        return f"MinHeap({self.heap})"
```

Usage example:

```python
h = MinHeap()
h.build_heap([20, 15, 8, 10, 5, 7, 2])
print(h)           # MinHeap([2, 5, 7, 10, 15, 8, 20])
print(h.peek())    # 2
print(h.remove_min())  # 2
print(h)           # MinHeap([5, 10, 7, 20, 15, 8])
h.insert(1)
print(h)           # MinHeap([1, 10, 5, 20, 15, 8, 7])
```

---

## Combined Playground

<div class="demo-hint">
<strong>Interactive:</strong> A full min-heap playground. Insert values, remove the minimum, or build from a custom array. All operations are animated in the dual view.
</div>

<div class="interactive-demo">
  <canvas id="heap-playground-canvas" width="680" height="360"></canvas>
  <div class="demo-controls">
    <label>Value: <input type="number" id="playground-value" value="4" style="width:60px;"></label>
    <button id="playground-insert">Insert</button>
    <button id="playground-remove">Remove Min</button>
    <button id="playground-step">Step</button>
    <button id="playground-run">Run</button>
    <span style="color:var(--text-secondary);">|</span>
    <button id="playground-reset">Reset</button>
    <button id="playground-clear">Clear</button>
    <label>Speed: <input type="range" id="playground-speed" min="1" max="10" value="5"> <span class="demo-value" id="playground-speed-val">5</span></label>
  </div>
  <div class="demo-info" id="playground-info">Heap: [1, 3, 5, 7, 9, 11, 13] | Ready</div>
</div>

<script>
(function() {
  var HP = window.DSA_Heap;
  var canvas = document.getElementById('heap-playground-canvas');
  var W = 680, H = 360;
  var ctx = HP.setupCanvas(canvas, W, H);
  var initialArr = [1, 3, 5, 7, 9, 11, 13];
  var arr = initialArr.slice();
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;
  var animating = false;

  function setInfo(msg) {
    document.getElementById('playground-info').textContent = msg;
  }

  function draw(highlights) {
    HP.drawDualView(ctx, arr, W, H, highlights || {});
  }

  function drawState() {
    if (states.length === 0) {
      draw();
      setInfo('Heap: [' + arr.join(', ') + '] | Ready');
      return;
    }
    var st = states[step];
    arr = st.arr.slice();
    draw(st.highlights);
    setInfo(st.info);
  }

  function generateInsertStates(heapArr, val) {
    var result = [];
    var a = heapArr.slice();
    a.push(val);
    var i = a.length - 1;

    var hl0 = {};
    hl0[i] = 'new';
    result.push({ arr: a.slice(), highlights: hl0, info: 'Inserted ' + val + ' at index ' + i + '.' });

    while (i > 0) {
      var parent = Math.floor((i - 1) / 2);
      var hlCmp = {};
      hlCmp[i] = 'current';
      hlCmp[parent] = 'current';
      result.push({ arr: a.slice(), highlights: hlCmp, info: 'Compare ' + a[i] + ' with parent ' + a[parent] });

      if (a[i] < a[parent]) {
        var temp = a[i]; a[i] = a[parent]; a[parent] = temp;
        var hlS = {};
        hlS[i] = 'swap';
        hlS[parent] = 'swap';
        result.push({ arr: a.slice(), highlights: hlS, info: 'Swap! ' + a[parent] + ' moves up.' });
        i = parent;
      } else {
        var hlD = {};
        hlD[i] = 'settled';
        result.push({ arr: a.slice(), highlights: hlD, info: a[i] + ' >= ' + a[parent] + '. Done.' });
        break;
      }
    }
    if (i === 0) {
      var hlR = {};
      hlR[0] = 'settled';
      result.push({ arr: a.slice(), highlights: hlR, info: 'Reached root. Insert complete.' });
    }
    result.push({ arr: a.slice(), highlights: {}, info: 'Heap: [' + a.join(', ') + ']' });
    return result;
  }

  function generateRemoveStates(heapArr) {
    var result = [];
    var a = heapArr.slice();
    if (a.length === 0) return result;
    var minVal = a[0];

    var hl0 = {};
    hl0[0] = 'swap';
    result.push({ arr: a.slice(), highlights: hl0, info: 'Removing min = ' + minVal });

    if (a.length === 1) {
      result.push({ arr: [], highlights: {}, info: 'Removed ' + minVal + '. Heap is empty.' });
      return result;
    }

    a[0] = a[a.length - 1];
    a.pop();
    var hl1 = {};
    hl1[0] = 'new';
    result.push({ arr: a.slice(), highlights: hl1, info: 'Moved ' + a[0] + ' to root. Sift down.' });

    var i = 0;
    var n = a.length;
    while (true) {
      var smallest = i;
      var left = 2 * i + 1;
      var right = 2 * i + 2;

      var hlC = {};
      hlC[i] = 'current';
      if (left < n) hlC[left] = 'current';
      if (right < n) hlC[right] = 'current';
      result.push({ arr: a.slice(), highlights: hlC, info: 'Comparing index ' + i + ' (' + a[i] + ') with children' });

      if (left >= n) break;
      if (left < n && a[left] < a[smallest]) smallest = left;
      if (right < n && a[right] < a[smallest]) smallest = right;

      if (smallest !== i) {
        var tmp = a[i]; a[i] = a[smallest]; a[smallest] = tmp;
        var hlSw = {};
        hlSw[i] = 'swap';
        hlSw[smallest] = 'swap';
        result.push({ arr: a.slice(), highlights: hlSw, info: 'Swap ' + a[i] + ' and ' + a[smallest] });
        i = smallest;
      } else {
        var hlOk = {};
        hlOk[i] = 'settled';
        result.push({ arr: a.slice(), highlights: hlOk, info: 'Heap property restored.' });
        break;
      }
    }
    result.push({ arr: a.slice(), highlights: {}, info: 'Removed ' + minVal + '. Heap: [' + a.join(', ') + ']' });
    return result;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      drawState();
      if (running) {
        var speed = parseInt(document.getElementById('playground-speed').value) || 5;
        timer = setTimeout(advance, Math.max(120, 1200 - speed * 110));
      }
    } else {
      running = false;
      animating = false;
      document.getElementById('playground-run').textContent = 'Run';
    }
  }

  function stopRunning() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('playground-run').textContent = 'Run';
  }

  draw();
  setInfo('Heap: [' + arr.join(', ') + '] | Ready');
  HP.onThemeChange(function() { drawState(); });

  document.getElementById('playground-insert').onclick = function() {
    if (animating) return;
    var val = parseInt(document.getElementById('playground-value').value);
    if (isNaN(val)) return;
    if (arr.length >= 15) { setInfo('Max 15 elements for visualization. Clear first.'); return; }
    animating = true;
    states = generateInsertStates(arr, val);
    step = 0;
    drawState();
  };

  document.getElementById('playground-remove').onclick = function() {
    if (animating) return;
    if (arr.length === 0) { setInfo('Heap is empty!'); return; }
    animating = true;
    states = generateRemoveStates(arr);
    step = 0;
    drawState();
  };

  document.getElementById('playground-step').onclick = function() {
    if (states.length === 0) return;
    stopRunning();
    advance();
  };

  document.getElementById('playground-run').onclick = function() {
    if (states.length === 0) return;
    if (running) {
      stopRunning();
    } else {
      if (step >= states.length - 1) { step = 0; drawState(); }
      running = true;
      document.getElementById('playground-run').textContent = 'Pause';
      advance();
    }
  };

  document.getElementById('playground-reset').onclick = function() {
    stopRunning();
    animating = false;
    arr = initialArr.slice();
    states = [];
    step = 0;
    draw();
    setInfo('Heap: [' + arr.join(', ') + '] | Ready');
  };

  document.getElementById('playground-clear').onclick = function() {
    stopRunning();
    animating = false;
    arr = [];
    states = [];
    step = 0;
    draw();
    setInfo('Heap is empty. Insert values to begin.');
  };

  document.getElementById('playground-speed').oninput = function() {
    document.getElementById('playground-speed-val').textContent = this.value;
  };
})();
</script>

---

## Min-Heap vs Max-Heap

Everything in this guide applies to **max-heaps** as well, with the comparison reversed. In a max-heap, the largest element is at the root, and every parent is greater than or equal to its children.

To convert our min-heap to a max-heap, simply reverse the comparisons:

```python
# Min-heap sift-up comparison
if self.heap[i] < self.heap[parent]:   # child smaller -> swap

# Max-heap sift-up comparison
if self.heap[i] > self.heap[parent]:   # child larger -> swap
```

Python's `heapq` module implements a **min-heap**. For a max-heap, a common trick is to negate the values:

```python
import heapq

max_heap = []
heapq.heappush(max_heap, -5)
heapq.heappush(max_heap, -3)
heapq.heappush(max_heap, -8)

largest = -heapq.heappop(max_heap)  # 8
```

---

## Key Takeaways

1. A **heap** is a complete binary tree stored as an array. The parent-child relationship is computed with simple index arithmetic: parent = $$(i-1)/2$$, children = $$2i+1$$ and $$2i+2$$.

2. In a **min-heap**, every parent is smaller than its children. The minimum is always at index 0 (the root).

3. **Insert** appends the value and sifts up  - $$O(\log n)$$. **Remove-min** replaces the root with the last element and sifts down  - $$O(\log n)$$.

4. **Build-heap** (heapify) constructs a heap from an unsorted array in $$O(n)$$ by sifting down from the last internal node to the root. This is faster than $$O(n \log n)$$ because most nodes are near the bottom.

5. Heaps power **priority queues**, which are used in Dijkstra's algorithm, Prim's MST, task scheduling, event-driven simulations, and more.

| Operation | Time Complexity |
|---|---|
| Insert | $$O(\log n)$$ |
| Remove Min | $$O(\log n)$$ |
| Peek Min | $$O(1)$$ |
| Build Heap | $$O(n)$$ |
| Search | $$O(n)$$ |

---

## What's Next?

Heaps are a building block for more advanced topics:

- **Heap Sort**  - use a max-heap to sort an array in $$O(n \log n)$$ in place. See the [Sorting Algorithms Interactive Guide]({{ site.baseurl }}/sorting-algorithms/).
- **Priority Queues**  - the primary application of heaps in practice.
- **Graph Algorithms**  - Dijkstra's shortest path and Prim's minimum spanning tree both rely on priority queues backed by heaps.

Explore the full [DSA in Python series]({{ site.baseurl }}/dsa/).
