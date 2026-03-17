---
layout: post
title: "Searching Algorithms: An Interactive Guide"
author: bharathikannan
categories: [Data Structures]
description: "Visualize linear search and binary search step by step. See why O(log n) crushes O(n)  - all in your browser."
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
  width: 80px;
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
window.DSA_Search = (function() {
  var defaultArr = [3, 9, 10, 17, 27, 38, 43, 52, 64, 82];
  var arr = defaultArr.slice();
  var target = 43;

  function getColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg: dark ? '#1a1b26' : '#ffffff',
      cell: dark ? '#7aa2f7' : '#2563eb',
      cellChecked: dark ? '#565f89' : '#d1d5db',
      cellCurrent: dark ? '#ff9e64' : '#f59e0b',
      cellFound: dark ? '#9ece6a' : '#16a34a',
      cellNotFound: dark ? '#f7768e' : '#e63946',
      cellMid: dark ? '#bb9af7' : '#7c3aed',
      cellEliminated: dark ? '#292e42' : '#f3f4f6',
      text: dark ? '#c0caf5' : '#1a1b26',
      textMuted: dark ? '#565f89' : '#6b7280',
      textOnCell: '#ffffff',
      pointer: dark ? '#ff9e64' : '#e63946'
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

  // Draw array as horizontal cells
  // cellStates: { index: 'default'|'current'|'checked'|'found'|'notfound'|'mid'|'eliminated' }
  // pointers: [{ index, label, color }]
  function drawCells(ctx, data, w, h, cellStates, pointers, label) {
    var c = getColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    var n = data.length;
    if (n === 0) return;

    var padL = 20, padR = 20, padT = label ? 30 : 15, padB = 40;
    var cellH = 40;
    var plotW = w - padL - padR;
    var cellW = Math.min(plotW / n, 60);
    var totalW = cellW * n;
    var startX = padL + (plotW - totalW) / 2;
    var y = padT;

    if (label) {
      ctx.fillStyle = c.text;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, w / 2, 18);
    }

    for (var i = 0; i < n; i++) {
      var x = startX + i * cellW;
      var state = (cellStates && cellStates[i]) || 'default';

      if (state === 'found') ctx.fillStyle = c.cellFound;
      else if (state === 'current') ctx.fillStyle = c.cellCurrent;
      else if (state === 'checked') ctx.fillStyle = c.cellChecked;
      else if (state === 'notfound') ctx.fillStyle = c.cellNotFound;
      else if (state === 'mid') ctx.fillStyle = c.cellMid;
      else if (state === 'eliminated') ctx.fillStyle = c.cellEliminated;
      else ctx.fillStyle = c.cell;

      var r = 4;
      ctx.beginPath();
      ctx.moveTo(x + 1 + r, y);
      ctx.lineTo(x + cellW - 1 - r, y);
      ctx.quadraticCurveTo(x + cellW - 1, y, x + cellW - 1, y + r);
      ctx.lineTo(x + cellW - 1, y + cellH - r);
      ctx.quadraticCurveTo(x + cellW - 1, y + cellH, x + cellW - 1 - r, y + cellH);
      ctx.lineTo(x + 1 + r, y + cellH);
      ctx.quadraticCurveTo(x + 1, y + cellH, x + 1, y + cellH - r);
      ctx.lineTo(x + 1, y + r);
      ctx.quadraticCurveTo(x + 1, y, x + 1 + r, y);
      ctx.fill();

      // Value text
      ctx.fillStyle = (state === 'eliminated' || state === 'checked') ? c.textMuted : c.textOnCell;
      ctx.font = 'bold 14px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(data[i], x + cellW / 2, y + cellH / 2 + 5);

      // Index below
      ctx.fillStyle = c.textMuted;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(i, x + cellW / 2, y + cellH + 14);
    }

    // Draw pointers
    if (pointers) {
      pointers.forEach(function(p) {
        var px = startX + p.index * cellW + cellW / 2;
        var py = y + cellH + 22;
        ctx.fillStyle = p.color || c.pointer;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.label, px, py + 12);
        // Arrow
        ctx.beginPath();
        ctx.moveTo(px, py - 4);
        ctx.lineTo(px - 4, py + 2);
        ctx.lineTo(px + 4, py + 2);
        ctx.closePath();
        ctx.fill();
      });
    }
  }

  // Linear search states
  function linearSearchStates(data, tgt) {
    var states = [];
    states.push({ cellStates: {}, pointers: [], info: 'Search for ' + tgt, found: false, step: 0 });
    for (var i = 0; i < data.length; i++) {
      var cs = {};
      for (var k = 0; k < i; k++) cs[k] = 'checked';
      cs[i] = 'current';
      states.push({ cellStates: cs, pointers: [], info: 'Check index ' + i + ': ' + data[i] + (data[i] === tgt ? ' = ' + tgt + ' Found!' : ' != ' + tgt), found: data[i] === tgt, step: i + 1 });
      if (data[i] === tgt) {
        var csf = {};
        for (var k = 0; k < i; k++) csf[k] = 'checked';
        csf[i] = 'found';
        states.push({ cellStates: csf, pointers: [], info: 'Found ' + tgt + ' at index ' + i + '!', found: true, step: i + 1 });
        return states;
      }
    }
    var csn = {};
    for (var k = 0; k < data.length; k++) csn[k] = 'notfound';
    states.push({ cellStates: csn, pointers: [], info: tgt + ' not found in array', found: false, step: data.length });
    return states;
  }

  // Binary search states
  function binarySearchStates(data, tgt) {
    var states = [];
    var low = 0, high = data.length - 1;
    var c = getColors();
    states.push({ cellStates: {}, pointers: [{ index: low, label: 'low', color: c.cellCurrent }, { index: high, label: 'high', color: c.cellCurrent }], info: 'Search for ' + tgt + ' in sorted array', found: false, step: 0 });

    var stepCount = 0;
    while (low <= high) {
      stepCount++;
      var mid = Math.floor((low + high) / 2);
      var cs = {};
      for (var k = 0; k < data.length; k++) {
        if (k < low || k > high) cs[k] = 'eliminated';
      }
      cs[mid] = 'mid';
      var ptrs = [
        { index: low, label: 'low', color: c.cellCurrent },
        { index: mid, label: 'mid', color: c.cellMid },
        { index: high, label: 'high', color: c.cellCurrent }
      ];
      states.push({ cellStates: cs, pointers: ptrs, info: 'mid = (' + low + '+' + high + ')/2 = ' + mid + ', arr[' + mid + '] = ' + data[mid], found: false, step: stepCount });

      if (data[mid] === tgt) {
        cs[mid] = 'found';
        states.push({ cellStates: cs, pointers: [{ index: mid, label: 'found!', color: c.cellFound }], info: 'Found ' + tgt + ' at index ' + mid + '!', found: true, step: stepCount });
        return states;
      } else if (data[mid] < tgt) {
        var cs2 = {};
        for (var k = 0; k < data.length; k++) {
          if (k <= mid) cs2[k] = 'eliminated';
          else if (k > high) cs2[k] = 'eliminated';
        }
        states.push({ cellStates: cs2, pointers: [{ index: mid + 1, label: 'low', color: c.cellCurrent }, { index: high, label: 'high', color: c.cellCurrent }], info: data[mid] + ' < ' + tgt + ', search right half', found: false, step: stepCount });
        low = mid + 1;
      } else {
        var cs3 = {};
        for (var k = 0; k < data.length; k++) {
          if (k >= mid) cs3[k] = 'eliminated';
          else if (k < low) cs3[k] = 'eliminated';
        }
        states.push({ cellStates: cs3, pointers: [{ index: low, label: 'low', color: c.cellCurrent }, { index: mid - 1, label: 'high', color: c.cellCurrent }], info: data[mid] + ' > ' + tgt + ', search left half', found: false, step: stepCount });
        high = mid - 1;
      }
    }
    var csn = {};
    for (var k = 0; k < data.length; k++) csn[k] = 'notfound';
    states.push({ cellStates: csn, pointers: [], info: tgt + ' not found in array', found: false, step: stepCount });
    return states;
  }

  var themeCallbacks = [];
  function onThemeChange(cb) { themeCallbacks.push(cb); }
  var observer = new MutationObserver(function() {
    themeCallbacks.forEach(function(cb) { cb(); });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    arr: arr, defaultArr: defaultArr, target: target,
    getColors: getColors, setupCanvas: setupCanvas, drawCells: drawCells,
    linearSearchStates: linearSearchStates,
    binarySearchStates: binarySearchStates,
    onThemeChange: onThemeChange
  };
})();
</script>

Searching is one of the most common operations in computing. Every time you press Ctrl+F, look up a contact, or query a database, a search algorithm runs behind the scenes.

In this guide, we will build **two fundamental search algorithms from scratch** and see how they compare.

By the end you will understand:
- **Linear Search** - check every element, one by one (O(n))
- **Binary Search** - divide and conquer on sorted data (O(log n))
- Why sorting your data first can make searching exponentially faster

<div class="demo-hint">
<strong>How to use the demos:</strong> Enter a target value, then step through or auto-play. Watch how each algorithm narrows down the search space differently.
</div>

---

## Linear Search

Linear search is the simplest possible search: start from the beginning and check every element until you find the target or reach the end. It works on **any** array - sorted or unsorted.

### Python Implementation

```python
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
```

**Time complexity:** $$O(n)$$ - in the worst case, you check every element. On average, you check $$n/2$$ elements.

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> Enter a target value and step through. The yellow cell is the current element being checked. Gray cells have already been checked. Green means found.
</div>

<div class="interactive-demo">
  <canvas id="linear-canvas" width="680" height="130"></canvas>
  <div class="demo-controls">
    <label>Target: <input type="number" id="linear-target" value="43"></label>
    <button id="linear-step">Step</button>
    <button id="linear-run">Run</button>
    <button id="linear-reset">Reset</button>
    <label>Speed: <input type="range" id="linear-speed" min="1" max="20" value="6"> <span class="demo-value" id="linear-speed-val">6</span></label>
  </div>
  <div class="demo-info" id="linear-info">Steps: 0 | Ready</div>
</div>

<script>
(function() {
  var S = window.DSA_Search;
  var canvas = document.getElementById('linear-canvas');
  var W = 680, H = 130;
  var ctx = S.setupCanvas(canvas, W, H);
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function init() {
    var tgt = parseInt(document.getElementById('linear-target').value) || 43;
    states = S.linearSearchStates(S.arr, tgt);
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    draw();
  }

  function draw() {
    var st = states[step] || states[0];
    S.drawCells(ctx, S.arr, W, H, st.cellStates, st.pointers);
    document.getElementById('linear-info').textContent = 'Steps: ' + st.step + ' | ' + st.info;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      draw();
      if (running) {
        var speed = parseInt(document.getElementById('linear-speed').value) || 6;
        var delay = Math.max(50, 800 - speed * 40);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('linear-run').textContent = 'Run';
    }
  }

  init();
  S.onThemeChange(draw);

  document.getElementById('linear-step').onclick = function() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('linear-run').textContent = 'Run';
    advance();
  };
  document.getElementById('linear-run').onclick = function() {
    if (running) {
      running = false;
      if (timer) clearTimeout(timer);
      this.textContent = 'Run';
    } else {
      if (step >= states.length - 1) init();
      running = true;
      this.textContent = 'Pause';
      advance();
    }
  };
  document.getElementById('linear-reset').onclick = init;
  document.getElementById('linear-target').onchange = init;
  document.getElementById('linear-speed').oninput = function() {
    document.getElementById('linear-speed-val').textContent = this.value;
  };
})();
</script>

---

## Binary Search

Binary search is dramatically faster, but it requires the array to be **sorted**. It works by comparing the target to the **middle** element. If the target is smaller, search the left half; if larger, search the right half. Each step eliminates half the remaining elements.

### Python Implementation

```python
def binary_search(arr, target):
    low, high = 0, len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1
```

**Time complexity:** $$O(\log n)$$ - each step halves the search space. For an array of 1,000,000 elements, binary search needs at most 20 comparisons. Linear search would need up to 1,000,000.

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> The purple cell is <code>mid</code>. The orange pointers show <code>low</code> and <code>high</code>. Dark cells have been eliminated. Watch how half the array is discarded on every step.
</div>

<div class="interactive-demo">
  <canvas id="binary-canvas" width="680" height="140"></canvas>
  <div class="demo-controls">
    <label>Target: <input type="number" id="binary-target" value="43"></label>
    <button id="binary-step">Step</button>
    <button id="binary-run">Run</button>
    <button id="binary-reset">Reset</button>
    <label>Speed: <input type="range" id="binary-speed" min="1" max="20" value="4"> <span class="demo-value" id="binary-speed-val">4</span></label>
  </div>
  <div class="demo-info" id="binary-info">Steps: 0 | Ready</div>
</div>

<script>
(function() {
  var S = window.DSA_Search;
  var canvas = document.getElementById('binary-canvas');
  var W = 680, H = 140;
  var ctx = S.setupCanvas(canvas, W, H);
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function init() {
    var tgt = parseInt(document.getElementById('binary-target').value) || 43;
    states = S.binarySearchStates(S.arr, tgt);
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    draw();
  }

  function draw() {
    var st = states[step] || states[0];
    S.drawCells(ctx, S.arr, W, H, st.cellStates, st.pointers);
    document.getElementById('binary-info').textContent = 'Steps: ' + st.step + ' | ' + st.info;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      draw();
      if (running) {
        var speed = parseInt(document.getElementById('binary-speed').value) || 4;
        var delay = Math.max(100, 1200 - speed * 55);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('binary-run').textContent = 'Run';
    }
  }

  init();
  S.onThemeChange(draw);

  document.getElementById('binary-step').onclick = function() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('binary-run').textContent = 'Run';
    advance();
  };
  document.getElementById('binary-run').onclick = function() {
    if (running) {
      running = false;
      if (timer) clearTimeout(timer);
      this.textContent = 'Run';
    } else {
      if (step >= states.length - 1) init();
      running = true;
      this.textContent = 'Pause';
      advance();
    }
  };
  document.getElementById('binary-reset').onclick = init;
  document.getElementById('binary-target').onchange = init;
  document.getElementById('binary-speed').oninput = function() {
    document.getElementById('binary-speed-val').textContent = this.value;
  };
})();
</script>

---

## Side-by-Side Comparison

Now let us see both algorithms search for the same target simultaneously. This is the best way to appreciate why $$O(\log n)$$ is so much better than $$O(n)$$.

<div class="demo-hint">
<strong>Interactive:</strong> Click <strong>Race!</strong> to run both algorithms at the same time on the same sorted array and target. Binary search will almost always finish first.
</div>

<div class="interactive-demo">
  <div class="demo-split">
    <div>
      <div style="font-weight:600;text-align:center;margin-bottom:0.25rem;font-size:0.9rem;">Linear Search  - O(n)</div>
      <canvas id="compare-linear" width="330" height="130"></canvas>
      <div class="demo-info" id="compare-linear-info">Steps: 0</div>
    </div>
    <div>
      <div style="font-weight:600;text-align:center;margin-bottom:0.25rem;font-size:0.9rem;">Binary Search  - O(log n)</div>
      <canvas id="compare-binary" width="330" height="130"></canvas>
      <div class="demo-info" id="compare-binary-info">Steps: 0</div>
    </div>
  </div>
  <div class="demo-controls" style="justify-content:center;">
    <label>Target: <input type="number" id="compare-target" value="64"></label>
    <button id="compare-race" style="font-size:1rem;padding:0.6rem 2rem;">Race!</button>
    <button id="compare-reset">Reset</button>
    <label>Speed: <input type="range" id="compare-speed" min="1" max="20" value="5"> <span class="demo-value" id="compare-speed-val">5</span></label>
  </div>
</div>

<script>
(function() {
  var S = window.DSA_Search;
  var WL = 330, HL = 130;
  var canvasL = document.getElementById('compare-linear');
  var ctxL = S.setupCanvas(canvasL, WL, HL);
  var canvasB = document.getElementById('compare-binary');
  var ctxB = S.setupCanvas(canvasB, WL, HL);

  var linStates = [], binStates = [];
  var linStep = 0, binStep = 0;
  var running = false, timer = null;
  var linDone = false, binDone = false;

  function init() {
    var tgt = parseInt(document.getElementById('compare-target').value) || 64;
    linStates = S.linearSearchStates(S.arr, tgt);
    binStates = S.binarySearchStates(S.arr, tgt);
    linStep = 0; binStep = 0;
    linDone = false; binDone = false;
    running = false;
    if (timer) clearTimeout(timer);
    draw();
    document.getElementById('compare-race').textContent = 'Race!';
  }

  function draw() {
    var ls = linStates[linStep] || linStates[0];
    var bs = binStates[binStep] || binStates[0];
    S.drawCells(ctxL, S.arr, WL, HL, ls.cellStates, ls.pointers);
    S.drawCells(ctxB, S.arr, WL, HL, bs.cellStates, bs.pointers);
    document.getElementById('compare-linear-info').textContent = 'Steps: ' + ls.step + ' | ' + ls.info;
    document.getElementById('compare-binary-info').textContent = 'Steps: ' + bs.step + ' | ' + bs.info;
  }

  function advance() {
    if (!linDone && linStep < linStates.length - 1) linStep++;
    else linDone = true;
    if (!binDone && binStep < binStates.length - 1) binStep++;
    else binDone = true;
    draw();

    if ((!linDone || !binDone) && running) {
      var speed = parseInt(document.getElementById('compare-speed').value) || 5;
      var delay = Math.max(50, 800 - speed * 40);
      timer = setTimeout(advance, delay);
    } else {
      running = false;
      document.getElementById('compare-race').textContent = 'Race!';
    }
  }

  init();
  S.onThemeChange(draw);

  document.getElementById('compare-race').onclick = function() {
    if (running) {
      running = false;
      if (timer) clearTimeout(timer);
      this.textContent = 'Race!';
    } else {
      init();
      running = true;
      this.textContent = 'Pause';
      advance();
    }
  };
  document.getElementById('compare-reset').onclick = init;
  document.getElementById('compare-target').onchange = init;
  document.getElementById('compare-speed').oninput = function() {
    document.getElementById('compare-speed-val').textContent = this.value;
  };
})();
</script>

---

## Key Takeaways

1. **Linear search** works on any array but checks every element  - $$O(n)$$. It is fine for small datasets.

2. **Binary search** requires a sorted array but is exponentially faster  - $$O(\log n)$$. For 1 million elements, it needs only ~20 steps instead of 1 million.

3. **The cost of sorting is worth it.** Even though sorting takes $$O(n \log n)$$, if you need to search the same data many times, sorting once and then using binary search saves enormous time.

4. **Try it yourself:** Search for the first element (3) and the last element (82) to see best and worst cases for linear search. Notice that binary search takes roughly the same number of steps regardless of the target's position.

---

## What's Next?

Now that you understand arrays, searching, and sorting, it is time to explore **linked lists**  - a fundamentally different way to organize data. Continue to the [Linked Lists Interactive Guide]({{ site.baseurl }}/linked-lists-interactive/) to see how pointers change everything.

Explore the full [DSA in Python series]({{ site.baseurl }}/dsa/).
