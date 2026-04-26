---
layout: post
title: "Sorting Algorithms from Scratch"
author: bharathikannan
categories: [Data Structures]
description: "Visualize bubble sort, selection sort, insertion sort, merge sort, and quick sort step by step. Race them against each other  - all in your browser."
permalink: /sorting-algorithms/
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
.sort-race-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
@media (max-width: 640px) {
  .sort-race-grid { grid-template-columns: 1fr; }
}
.sort-race-item {
  text-align: center;
}
.sort-race-item canvas {
  width: 100%;
}
.sort-race-label {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.complexity-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin: 1rem 0;
}
.complexity-table th, .complexity-table td {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  text-align: center;
}
.complexity-table th {
  background: var(--bg-secondary);
  font-weight: 600;
}
.complexity-table td:first-child {
  text-align: left;
  font-weight: 500;
}
</style>

<script>
// Shared utilities and state for all sorting demos
window.DSA_Sort = (function() {
  var defaultArr = [38, 27, 43, 3, 9, 82, 10, 64, 52, 17];
  var arr = defaultArr.slice();

  function resetArr() {
    arr.length = 0;
    defaultArr.forEach(function(v) { arr.push(v); });
    notifyDataChange();
  }

  function randomize(n) {
    n = n || arr.length;
    arr.length = 0;
    for (var i = 0; i < n; i++) {
      arr.push(Math.floor(Math.random() * 95) + 5);
    }
    notifyDataChange();
  }

  function getColors() { return window.Viz.colors(); }

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

  // Draw bars with optional highlights
  // highlights: { index: 'compare'|'swap'|'sorted'|'pivot'|'min'|'current' }
  function drawBars(ctx, data, w, h, highlights, label) {
    var c = getColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    var n = data.length;
    if (n === 0) return;

    var padL = 10, padR = 10, padT = label ? 28 : 12, padB = 24;
    var plotW = w - padL - padR;
    var plotH = h - padT - padB;
    var barW = plotW / n;
    var gap = Math.max(1, barW * 0.15);
    var maxVal = Math.max.apply(null, data) || 1;

    // Label
    if (label) {
      ctx.fillStyle = c.text;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, w / 2, 18);
    }

    for (var i = 0; i < n; i++) {
      var barH = (data[i] / maxVal) * plotH;
      var x = padL + i * barW + gap / 2;
      var y = padT + plotH - barH;
      var bw = barW - gap;

      // Choose color based on highlight
      var hl = highlights && highlights[i];
      if (hl === 'sorted') ctx.fillStyle = c.barSorted;
      else if (hl === 'compare') ctx.fillStyle = c.barCompare;
      else if (hl === 'swap') ctx.fillStyle = c.barSwap;
      else if (hl === 'pivot') ctx.fillStyle = c.barPivot;
      else if (hl === 'min') ctx.fillStyle = c.barMin;
      else if (hl === 'current') ctx.fillStyle = c.barCurrent;
      else ctx.fillStyle = c.bar;

      // Draw rounded bar
      var r = Math.min(3, bw / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + bw - r, y);
      ctx.quadraticCurveTo(x + bw, y, x + bw, y + r);
      ctx.lineTo(x + bw, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.fill();

      // Value label below
      if (barW > 18) {
        ctx.fillStyle = c.textMuted;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(data[i], x + bw / 2, padT + plotH + 14);
      }
    }
  }

  // Generate sorting states for step-through
  function bubbleSortStates(input) {
    var a = input.slice();
    var states = [];
    var n = a.length;
    var comparisons = 0, swaps = 0;
    states.push({ arr: a.slice(), highlights: {}, comparisons: 0, swaps: 0, pass: 0, info: 'Initial array' });
    for (var i = 0; i < n - 1; i++) {
      for (var j = 0; j < n - 1 - i; j++) {
        comparisons++;
        var hl = {};
        hl[j] = 'compare';
        hl[j + 1] = 'compare';
        for (var k = n - i; k < n; k++) hl[k] = 'sorted';
        states.push({ arr: a.slice(), highlights: hl, comparisons: comparisons, swaps: swaps, pass: i + 1, info: 'Compare ' + a[j] + ' and ' + a[j + 1] });
        if (a[j] > a[j + 1]) {
          var tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp;
          swaps++;
          var hl2 = {};
          hl2[j] = 'swap';
          hl2[j + 1] = 'swap';
          for (var k = n - i; k < n; k++) hl2[k] = 'sorted';
          states.push({ arr: a.slice(), highlights: hl2, comparisons: comparisons, swaps: swaps, pass: i + 1, info: 'Swap ' + a[j + 1] + ' and ' + a[j] });
        }
      }
      var hlEnd = {};
      for (var k = n - 1 - i; k < n; k++) hlEnd[k] = 'sorted';
      states.push({ arr: a.slice(), highlights: hlEnd, comparisons: comparisons, swaps: swaps, pass: i + 1, info: 'Pass ' + (i + 1) + ' complete' });
    }
    var hlFinal = {};
    for (var k = 0; k < n; k++) hlFinal[k] = 'sorted';
    states.push({ arr: a.slice(), highlights: hlFinal, comparisons: comparisons, swaps: swaps, pass: n - 1, info: 'Sorted!' });
    return states;
  }

  function selectionSortStates(input) {
    var a = input.slice();
    var states = [];
    var n = a.length;
    var comparisons = 0, swaps = 0;
    states.push({ arr: a.slice(), highlights: {}, comparisons: 0, swaps: 0, pass: 0, info: 'Initial array' });
    for (var i = 0; i < n - 1; i++) {
      var minIdx = i;
      var hl = {};
      for (var k = 0; k < i; k++) hl[k] = 'sorted';
      hl[i] = 'current';
      hl[minIdx] = 'min';
      states.push({ arr: a.slice(), highlights: hl, comparisons: comparisons, swaps: swaps, pass: i + 1, info: 'Find minimum starting from index ' + i });
      for (var j = i + 1; j < n; j++) {
        comparisons++;
        var hl2 = {};
        for (var k = 0; k < i; k++) hl2[k] = 'sorted';
        hl2[minIdx] = 'min';
        hl2[j] = 'compare';
        states.push({ arr: a.slice(), highlights: hl2, comparisons: comparisons, swaps: swaps, pass: i + 1, info: 'Compare ' + a[j] + ' with min ' + a[minIdx] });
        if (a[j] < a[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        swaps++;
        var tmp = a[i]; a[i] = a[minIdx]; a[minIdx] = tmp;
        var hl3 = {};
        for (var k = 0; k < i; k++) hl3[k] = 'sorted';
        hl3[i] = 'swap';
        hl3[minIdx] = 'swap';
        states.push({ arr: a.slice(), highlights: hl3, comparisons: comparisons, swaps: swaps, pass: i + 1, info: 'Swap ' + a[minIdx] + ' into position ' + i });
      }
      var hl4 = {};
      for (var k = 0; k <= i; k++) hl4[k] = 'sorted';
      states.push({ arr: a.slice(), highlights: hl4, comparisons: comparisons, swaps: swaps, pass: i + 1, info: 'Position ' + i + ' is set to ' + a[i] });
    }
    var hlFinal = {};
    for (var k = 0; k < n; k++) hlFinal[k] = 'sorted';
    states.push({ arr: a.slice(), highlights: hlFinal, comparisons: comparisons, swaps: swaps, pass: n - 1, info: 'Sorted!' });
    return states;
  }

  function insertionSortStates(input) {
    var a = input.slice();
    var states = [];
    var n = a.length;
    var comparisons = 0, swaps = 0;
    states.push({ arr: a.slice(), highlights: { 0: 'sorted' }, comparisons: 0, swaps: 0, pass: 0, info: 'First element is trivially sorted' });
    for (var i = 1; i < n; i++) {
      var key = a[i];
      var j = i - 1;
      var hl = {};
      for (var k = 0; k < i; k++) hl[k] = 'sorted';
      hl[i] = 'current';
      states.push({ arr: a.slice(), highlights: hl, comparisons: comparisons, swaps: swaps, pass: i, info: 'Insert ' + key + ' into sorted region' });
      while (j >= 0 && a[j] > key) {
        comparisons++;
        a[j + 1] = a[j];
        swaps++;
        var hl2 = {};
        for (var k = 0; k <= i; k++) hl2[k] = 'sorted';
        hl2[j + 1] = 'swap';
        hl2[j] = 'compare';
        states.push({ arr: a.slice(), highlights: hl2, comparisons: comparisons, swaps: swaps, pass: i, info: 'Shift ' + a[j + 1] + ' right' });
        j--;
      }
      if (j >= 0) comparisons++;
      a[j + 1] = key;
      var hl3 = {};
      for (var k = 0; k <= i; k++) hl3[k] = 'sorted';
      hl3[j + 1] = 'pivot';
      states.push({ arr: a.slice(), highlights: hl3, comparisons: comparisons, swaps: swaps, pass: i, info: 'Place ' + key + ' at index ' + (j + 1) });
    }
    var hlFinal = {};
    for (var k = 0; k < n; k++) hlFinal[k] = 'sorted';
    states.push({ arr: a.slice(), highlights: hlFinal, comparisons: comparisons, swaps: swaps, pass: n - 1, info: 'Sorted!' });
    return states;
  }

  function mergeSortStates(input) {
    var a = input.slice();
    var states = [];
    var comparisons = 0, swaps = 0;
    states.push({ arr: a.slice(), highlights: {}, comparisons: 0, swaps: 0, pass: 0, info: 'Initial array' });

    function mergeSort(arr, left, right) {
      if (left >= right) return;
      var mid = Math.floor((left + right) / 2);
      mergeSort(arr, left, mid);
      mergeSort(arr, mid + 1, right);
      merge(arr, left, mid, right);
    }

    function merge(arr, left, mid, right) {
      var leftArr = arr.slice(left, mid + 1);
      var rightArr = arr.slice(mid + 1, right + 1);
      var i = 0, j = 0, k = left;

      var hl = {};
      for (var x = left; x <= mid; x++) hl[x] = 'compare';
      for (var x = mid + 1; x <= right; x++) hl[x] = 'pivot';
      states.push({ arr: arr.slice(), highlights: hl, comparisons: comparisons, swaps: swaps, pass: 0, info: 'Merge [' + left + '..' + mid + '] and [' + (mid + 1) + '..' + right + ']' });

      while (i < leftArr.length && j < rightArr.length) {
        comparisons++;
        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i]; i++;
        } else {
          arr[k] = rightArr[j]; j++;
        }
        swaps++;
        k++;
        var hl2 = {};
        for (var x = left; x < k; x++) hl2[x] = 'sorted';
        states.push({ arr: arr.slice(), highlights: hl2, comparisons: comparisons, swaps: swaps, pass: 0, info: 'Placed ' + arr[k - 1] + ' at index ' + (k - 1) });
      }
      while (i < leftArr.length) {
        arr[k] = leftArr[i]; i++; k++; swaps++;
        var hl3 = {};
        for (var x = left; x < k; x++) hl3[x] = 'sorted';
        states.push({ arr: arr.slice(), highlights: hl3, comparisons: comparisons, swaps: swaps, pass: 0, info: 'Copy remaining ' + arr[k - 1] });
      }
      while (j < rightArr.length) {
        arr[k] = rightArr[j]; j++; k++; swaps++;
        var hl4 = {};
        for (var x = left; x < k; x++) hl4[x] = 'sorted';
        states.push({ arr: arr.slice(), highlights: hl4, comparisons: comparisons, swaps: swaps, pass: 0, info: 'Copy remaining ' + arr[k - 1] });
      }
    }

    mergeSort(a, 0, a.length - 1);
    var hlFinal = {};
    for (var k = 0; k < a.length; k++) hlFinal[k] = 'sorted';
    states.push({ arr: a.slice(), highlights: hlFinal, comparisons: comparisons, swaps: swaps, pass: 0, info: 'Sorted!' });
    return states;
  }

  function quickSortStates(input) {
    var a = input.slice();
    var states = [];
    var comparisons = 0, swaps = 0;
    states.push({ arr: a.slice(), highlights: {}, comparisons: 0, swaps: 0, pass: 0, info: 'Initial array' });

    function quickSort(arr, low, high) {
      if (low < high) {
        var pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
      }
    }

    function partition(arr, low, high) {
      var pivot = arr[high];
      var hl = {};
      hl[high] = 'pivot';
      states.push({ arr: arr.slice(), highlights: hl, comparisons: comparisons, swaps: swaps, pass: 0, info: 'Pivot = ' + pivot + ' (index ' + high + ')' });
      var i = low - 1;
      for (var j = low; j < high; j++) {
        comparisons++;
        var hl2 = {};
        hl2[high] = 'pivot';
        hl2[j] = 'compare';
        if (i >= low) hl2[i] = 'current';
        states.push({ arr: arr.slice(), highlights: hl2, comparisons: comparisons, swaps: swaps, pass: 0, info: 'Compare ' + arr[j] + ' with pivot ' + pivot });
        if (arr[j] < pivot) {
          i++;
          var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
          swaps++;
          if (i !== j) {
            var hl3 = {};
            hl3[high] = 'pivot';
            hl3[i] = 'swap';
            hl3[j] = 'swap';
            states.push({ arr: arr.slice(), highlights: hl3, comparisons: comparisons, swaps: swaps, pass: 0, info: 'Swap ' + arr[j] + ' and ' + arr[i] });
          }
        }
      }
      var tmp2 = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = tmp2;
      swaps++;
      var hl4 = {};
      hl4[i + 1] = 'sorted';
      states.push({ arr: arr.slice(), highlights: hl4, comparisons: comparisons, swaps: swaps, pass: 0, info: 'Pivot ' + arr[i + 1] + ' placed at index ' + (i + 1) });
      return i + 1;
    }

    quickSort(a, 0, a.length - 1);
    var hlFinal = {};
    for (var k = 0; k < a.length; k++) hlFinal[k] = 'sorted';
    states.push({ arr: a.slice(), highlights: hlFinal, comparisons: comparisons, swaps: swaps, pass: 0, info: 'Sorted!' });
    return states;
  }

  // Theme change observer
  var themeCallbacks = [];
  function onThemeChange(cb) { themeCallbacks.push(cb); }
  var observer = new MutationObserver(function() {
    themeCallbacks.forEach(function(cb) { cb(); });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Data change callbacks
  var dataCallbacks = [];
  function onDataChange(cb) { dataCallbacks.push(cb); }
  function notifyDataChange() {
    dataCallbacks.forEach(function(cb) { try { cb(); } catch(e) {} });
  }

  return {
    arr: arr, defaultArr: defaultArr, resetArr: resetArr, randomize: randomize,
    getColors: getColors, setupCanvas: setupCanvas, drawBars: drawBars,
    bubbleSortStates: bubbleSortStates,
    selectionSortStates: selectionSortStates,
    insertionSortStates: insertionSortStates,
    mergeSortStates: mergeSortStates,
    quickSortStates: quickSortStates,
    onThemeChange: onThemeChange,
    onDataChange: onDataChange, notifyDataChange: notifyDataChange
  };
})();
</script>

Sorting is one of the most fundamental operations in computer science. Every time you use a search engine, browse a sorted list, or see "sort by price" on a shopping site, a sorting algorithm is at work behind the scenes. In this interactive guide, we will build five classic sorting algorithms completely from scratch in Python. You will watch each algorithm work step by step, understand why it makes each decision, and see how they compare in performance.

This post walks through the simplest comparison-based sort (Bubble Sort), then Selection Sort which finds the minimum and places it in turn, then Insertion Sort which builds a sorted region one element at a time, before moving to the O(n log n) algorithms Merge Sort (divide, conquer, merge) and Quick Sort (partition around a pivot).

---

## Why Does Sorting Matter?

Sorting is not just about putting numbers in order. It is a building block for binary search (which only works on sorted data, giving O(log n) instead of O(n)), for finding duplicates (trivial once data is sorted), for database operations like ORDER BY, GROUP BY, and indexing, and for scheduling tasks via priority queues. Understanding sorting algorithms also teaches fundamental CS concepts like divide and conquer, recursion, time complexity analysis, and space-time tradeoffs. Here is a summary of what we will build:

<table class="complexity-table">
<thead>
<tr><th>Algorithm</th><th>Best</th><th>Average</th><th>Worst</th><th>Space</th><th>Stable</th></tr>
</thead>
<tbody>
<tr><td>Bubble Sort</td><td>O(n)</td><td>O(n&sup2;)</td><td>O(n&sup2;)</td><td>O(1)</td><td>Yes</td></tr>
<tr><td>Selection Sort</td><td>O(n&sup2;)</td><td>O(n&sup2;)</td><td>O(n&sup2;)</td><td>O(1)</td><td>No</td></tr>
<tr><td>Insertion Sort</td><td>O(n)</td><td>O(n&sup2;)</td><td>O(n&sup2;)</td><td>O(1)</td><td>Yes</td></tr>
<tr><td>Merge Sort</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n)</td><td>Yes</td></tr>
<tr><td>Quick Sort</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n&sup2;)</td><td>O(log n)</td><td>No</td></tr>
</tbody>
</table>

---

## The Dataset

Every sorting algorithm starts with unsorted data. Below is a set of numbers displayed as vertical bars where taller bars represent larger values. This dataset is shared across all the demos in this post, so any change you make here propagates to every algorithm visualization that follows. Use Randomize for a new array, the size slider to change the number of elements, and Reset to return to the original dataset.

<div class="interactive-demo">
  <canvas id="dataset-canvas" width="680" height="220"></canvas>
  <div class="demo-controls">
    <button id="dataset-randomize">Randomize</button>
    <button id="dataset-sorted">Sorted</button>
    <button id="dataset-reversed">Reversed</button>
    <button id="dataset-reset">Reset</button>
    <label>Size: <input type="range" id="dataset-size" min="5" max="30" value="10"> <span class="demo-value" id="dataset-size-val">10</span></label>
  </div>
  <div class="demo-info" id="dataset-info">Array: [38, 27, 43, 3, 9, 82, 10, 64, 52, 17]</div>
  <div class="demo-caption">Settings: 10-element default array [38, 27, 43, 3, 9, 82, 10, 64, 52, 17], shared across all sorting demos below.</div>
</div>

<script>
(function() {
  var S = window.DSA_Sort;
  var canvas = document.getElementById('dataset-canvas');
  var W = 680, H = 220;
  var ctx = S.setupCanvas(canvas, W, H);

  function draw() {
    S.drawBars(ctx, S.arr, W, H, {});
    document.getElementById('dataset-info').textContent = 'Array: [' + S.arr.join(', ') + ']';
    document.getElementById('dataset-size-val').textContent = S.arr.length;
    document.getElementById('dataset-size').value = S.arr.length;
  }

  draw();
  S.onThemeChange(draw);
  S.onDataChange(draw);

  document.getElementById('dataset-randomize').onclick = function() {
    var n = parseInt(document.getElementById('dataset-size').value) || 10;
    S.randomize(n);
  };
  document.getElementById('dataset-sorted').onclick = function() {
    var sorted = S.arr.slice().sort(function(a, b) { return a - b; });
    S.arr.length = 0;
    sorted.forEach(function(v) { S.arr.push(v); });
    S.notifyDataChange();
  };
  document.getElementById('dataset-reversed').onclick = function() {
    var rev = S.arr.slice().sort(function(a, b) { return b - a; });
    S.arr.length = 0;
    rev.forEach(function(v) { S.arr.push(v); });
    S.notifyDataChange();
  };
  document.getElementById('dataset-reset').onclick = function() {
    S.resetArr();
  };
  document.getElementById('dataset-size').oninput = function() {
    document.getElementById('dataset-size-val').textContent = this.value;
    S.randomize(parseInt(this.value));
  };
})();
</script>

---

## Bubble Sort

Bubble sort is the simplest sorting algorithm. It works by repeatedly stepping through the list, comparing adjacent elements, and swapping them if they are in the wrong order. After each pass, the largest unsorted element "bubbles up" to its correct position at the end.

Start at the beginning of the array and compare each pair of adjacent elements; if the left element is greater than the right, swap them. After one pass, the largest element has settled at the end and is considered sorted. Repeat the same scan over the remaining unsorted portion, and stop as soon as a pass completes without any swaps because the array is fully sorted at that point.

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr
```

The outer loop runs $$n$$ times, and the inner loop runs up to $$n - 1 - i$$ times. In the worst case, this gives us $$O(n^2)$$ comparisons. The `swapped` flag is an optimization: if no swaps happen in a pass, the array is already sorted and we can stop early. This makes the best case $$O(n)$$ for an already-sorted array. The demo below visualizes each comparison and swap, with green bars marking elements already in their final sorted position.

<div class="interactive-demo">
  <canvas id="bubble-canvas" width="680" height="250"></canvas>
  <div class="demo-controls">
    <button id="bubble-step">Step</button>
    <button id="bubble-run">Run</button>
    <button id="bubble-reset">Reset</button>
    <label>Speed: <input type="range" id="bubble-speed" min="1" max="20" value="8"> <span class="demo-value" id="bubble-speed-val">8</span></label>
  </div>
  <div class="demo-info" id="bubble-info">Pass: 0 | Comparisons: 0 | Swaps: 0 | Ready</div>
  <div class="demo-caption">Settings: shared dataset, default speed 8. Step advances one operation, Run auto-plays.</div>
</div>

<script>
(function() {
  var S = window.DSA_Sort;
  var canvas = document.getElementById('bubble-canvas');
  var W = 680, H = 250;
  var ctx = S.setupCanvas(canvas, W, H);
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function init() {
    states = S.bubbleSortStates(S.arr);
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    draw();
  }

  function draw() {
    var st = states[step] || states[0];
    S.drawBars(ctx, st.arr, W, H, st.highlights);
    document.getElementById('bubble-info').textContent =
      'Pass: ' + st.pass + ' | Comparisons: ' + st.comparisons + ' | Swaps: ' + st.swaps + ' | ' + st.info;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      draw();
      if (running) {
        var speed = parseInt(document.getElementById('bubble-speed').value) || 8;
        var delay = Math.max(20, 600 - speed * 30);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('bubble-run').textContent = 'Run';
    }
  }

  init();
  S.onThemeChange(draw);
  S.onDataChange(init);

  document.getElementById('bubble-step').onclick = function() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('bubble-run').textContent = 'Run';
    advance();
  };
  document.getElementById('bubble-run').onclick = function() {
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
  document.getElementById('bubble-reset').onclick = init;
  document.getElementById('bubble-speed').oninput = function() {
    document.getElementById('bubble-speed-val').textContent = this.value;
  };
})();
</script>

---

## Selection Sort

Selection sort improves on bubble sort's approach by making fewer swaps. Instead of bubbling elements up, it finds the minimum element in the unsorted portion and places it at the front. This means it always makes exactly $$n - 1$$ swaps, regardless of the input.

Find the minimum element in the unsorted portion, swap it with the first unsorted element so that it lands in its final position, then repeat the same process on the remaining unsorted portion until everything is in place.

```python
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
```

Selection sort always runs in $$O(n^2)$$ time, even on already-sorted arrays, because it always scans the entire unsorted portion. However, it only makes $$O(n)$$ swaps, which can be beneficial when swap operations are expensive. In the demo below, the red bar tracks the current minimum as the algorithm scans, the yellow bar shows the element being compared, and green bars are in their final position.

<div class="interactive-demo">
  <canvas id="selection-canvas" width="680" height="250"></canvas>
  <div class="demo-controls">
    <button id="selection-step">Step</button>
    <button id="selection-run">Run</button>
    <button id="selection-reset">Reset</button>
    <label>Speed: <input type="range" id="selection-speed" min="1" max="20" value="8"> <span class="demo-value" id="selection-speed-val">8</span></label>
  </div>
  <div class="demo-info" id="selection-info">Pass: 0 | Comparisons: 0 | Swaps: 0 | Ready</div>
  <div class="demo-caption">Settings: shared dataset, default speed 8. Red bar = current minimum, yellow = comparison, green = sorted.</div>
</div>

<script>
(function() {
  var S = window.DSA_Sort;
  var canvas = document.getElementById('selection-canvas');
  var W = 680, H = 250;
  var ctx = S.setupCanvas(canvas, W, H);
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function init() {
    states = S.selectionSortStates(S.arr);
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    draw();
  }

  function draw() {
    var st = states[step] || states[0];
    S.drawBars(ctx, st.arr, W, H, st.highlights);
    document.getElementById('selection-info').textContent =
      'Pass: ' + st.pass + ' | Comparisons: ' + st.comparisons + ' | Swaps: ' + st.swaps + ' | ' + st.info;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      draw();
      if (running) {
        var speed = parseInt(document.getElementById('selection-speed').value) || 8;
        var delay = Math.max(20, 600 - speed * 30);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('selection-run').textContent = 'Run';
    }
  }

  init();
  S.onThemeChange(draw);
  S.onDataChange(init);

  document.getElementById('selection-step').onclick = function() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('selection-run').textContent = 'Run';
    advance();
  };
  document.getElementById('selection-run').onclick = function() {
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
  document.getElementById('selection-reset').onclick = init;
  document.getElementById('selection-speed').oninput = function() {
    document.getElementById('selection-speed-val').textContent = this.value;
  };
})();
</script>

---

## Insertion Sort

Insertion sort works the way you might sort a hand of playing cards. You pick up cards one at a time and insert each card into its correct position among the cards you have already sorted.

Start with the first element, which is trivially sorted, then pick the next element (the "key") and compare it with elements in the sorted region, moving from right to left. Shift larger elements one position to the right to make room, insert the key at the correct position, and repeat until every element has been placed.

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr
```

Insertion sort is $$O(n^2)$$ in the worst case, but it has a major advantage: it runs in $$O(n)$$ time on nearly-sorted data. This makes it the best choice when you know the input is almost sorted, or when the array is very small. Many real-world sorting implementations (like Python's Timsort) use insertion sort for small sub-arrays. In the demo below, the yellow bar is the current element being inserted, and the green region on the left is already sorted, with elements shifting right to make room for each insertion.

<div class="interactive-demo">
  <canvas id="insertion-canvas" width="680" height="250"></canvas>
  <div class="demo-controls">
    <button id="insertion-step">Step</button>
    <button id="insertion-run">Run</button>
    <button id="insertion-reset">Reset</button>
    <label>Speed: <input type="range" id="insertion-speed" min="1" max="20" value="8"> <span class="demo-value" id="insertion-speed-val">8</span></label>
  </div>
  <div class="demo-info" id="insertion-info">Pass: 0 | Comparisons: 0 | Swaps: 0 | Ready</div>
  <div class="demo-caption">Settings: shared dataset, default speed 8. Yellow = key being inserted, green region = already sorted.</div>
</div>

<script>
(function() {
  var S = window.DSA_Sort;
  var canvas = document.getElementById('insertion-canvas');
  var W = 680, H = 250;
  var ctx = S.setupCanvas(canvas, W, H);
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function init() {
    states = S.insertionSortStates(S.arr);
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    draw();
  }

  function draw() {
    var st = states[step] || states[0];
    S.drawBars(ctx, st.arr, W, H, st.highlights);
    document.getElementById('insertion-info').textContent =
      'Pass: ' + st.pass + ' | Comparisons: ' + st.comparisons + ' | Swaps: ' + st.swaps + ' | ' + st.info;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      draw();
      if (running) {
        var speed = parseInt(document.getElementById('insertion-speed').value) || 8;
        var delay = Math.max(20, 600 - speed * 30);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('insertion-run').textContent = 'Run';
    }
  }

  init();
  S.onThemeChange(draw);
  S.onDataChange(init);

  document.getElementById('insertion-step').onclick = function() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('insertion-run').textContent = 'Run';
    advance();
  };
  document.getElementById('insertion-run').onclick = function() {
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
  document.getElementById('insertion-reset').onclick = init;
  document.getElementById('insertion-speed').oninput = function() {
    document.getElementById('insertion-speed-val').textContent = this.value;
  };
})();
</script>

---

## Merge Sort

Merge sort is a divide and conquer algorithm and one of the most important algorithmic paradigms. It splits the array in half, recursively sorts each half, then merges the two sorted halves back together. This guarantees $$O(n \log n)$$ time in all cases.

The algorithm divides the array in half, recursively sorts each half (the conquer step), and then merges the two sorted halves into a single sorted array. The key insight is that merging two sorted arrays is easy and efficient ($$O(n)$$): just compare the front elements of each array and take the smaller one.

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)


def merge(left, right):
    result = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

Merge sort always runs in $$O(n \log n)$$ time. The divide step is $$O(1)$$ (just compute the midpoint), and the merge step is $$O(n)$$. Since we divide $$\log n$$ times, the total is $$O(n \log n)$$. The tradeoff is $$O(n)$$ extra space for the temporary arrays during merging. The demo below shows the divide-and-merge process: yellow and purple bars show the two halves being merged, and green bars show elements placed in their merged position.

<div class="interactive-demo">
  <canvas id="merge-canvas" width="680" height="250"></canvas>
  <div class="demo-controls">
    <button id="merge-step">Step</button>
    <button id="merge-run">Run</button>
    <button id="merge-reset">Reset</button>
    <label>Speed: <input type="range" id="merge-speed" min="1" max="20" value="8"> <span class="demo-value" id="merge-speed-val">8</span></label>
  </div>
  <div class="demo-info" id="merge-info">Comparisons: 0 | Moves: 0 | Ready</div>
  <div class="demo-caption">Settings: shared dataset, default speed 8. Yellow/purple = halves being merged, green = placed in final position.</div>
</div>

<script>
(function() {
  var S = window.DSA_Sort;
  var canvas = document.getElementById('merge-canvas');
  var W = 680, H = 250;
  var ctx = S.setupCanvas(canvas, W, H);
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function init() {
    states = S.mergeSortStates(S.arr);
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    draw();
  }

  function draw() {
    var st = states[step] || states[0];
    S.drawBars(ctx, st.arr, W, H, st.highlights);
    document.getElementById('merge-info').textContent =
      'Comparisons: ' + st.comparisons + ' | Moves: ' + st.swaps + ' | ' + st.info;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      draw();
      if (running) {
        var speed = parseInt(document.getElementById('merge-speed').value) || 8;
        var delay = Math.max(20, 600 - speed * 30);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('merge-run').textContent = 'Run';
    }
  }

  init();
  S.onThemeChange(draw);
  S.onDataChange(init);

  document.getElementById('merge-step').onclick = function() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('merge-run').textContent = 'Run';
    advance();
  };
  document.getElementById('merge-run').onclick = function() {
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
  document.getElementById('merge-reset').onclick = init;
  document.getElementById('merge-speed').oninput = function() {
    document.getElementById('merge-speed-val').textContent = this.value;
  };
})();
</script>

---

## Quick Sort

Quick sort is another divide-and-conquer algorithm, but with a different strategy: instead of splitting at the midpoint, it picks a pivot element and partitions the array around it. All elements smaller than the pivot go to the left, and all elements larger go to the right. The pivot is then in its final sorted position.

Choose a pivot (we use the last element), then partition the array so that everything less than the pivot ends up on the left and everything greater on the right. The pivot is now in its correct final position, and we recursively apply the same procedure to the left and right sub-arrays.

```python
def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr


def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1

    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]

    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
```

Quick sort has $$O(n \log n)$$ average time complexity. However, if the pivot is always the smallest or largest element (e.g., on an already-sorted array), it degrades to $$O(n^2)$$. In practice, randomized pivot selection avoids this. Quick sort is often faster than merge sort because it sorts in-place (no extra arrays), giving it better cache performance. In the demo below, the purple bar is the pivot, yellow bars show elements being compared to it, red shows swaps during partitioning, and when the pivot is placed it turns green.

<div class="interactive-demo">
  <canvas id="quick-canvas" width="680" height="250"></canvas>
  <div class="demo-controls">
    <button id="quick-step">Step</button>
    <button id="quick-run">Run</button>
    <button id="quick-reset">Reset</button>
    <label>Speed: <input type="range" id="quick-speed" min="1" max="20" value="8"> <span class="demo-value" id="quick-speed-val">8</span></label>
  </div>
  <div class="demo-info" id="quick-info">Comparisons: 0 | Swaps: 0 | Ready</div>
  <div class="demo-caption">Settings: shared dataset, default speed 8, pivot = last element of each partition.</div>
</div>

<script>
(function() {
  var S = window.DSA_Sort;
  var canvas = document.getElementById('quick-canvas');
  var W = 680, H = 250;
  var ctx = S.setupCanvas(canvas, W, H);
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function init() {
    states = S.quickSortStates(S.arr);
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    timer = null;
    draw();
  }

  function draw() {
    var st = states[step] || states[0];
    S.drawBars(ctx, st.arr, W, H, st.highlights);
    document.getElementById('quick-info').textContent =
      'Comparisons: ' + st.comparisons + ' | Swaps: ' + st.swaps + ' | ' + st.info;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      draw();
      if (running) {
        var speed = parseInt(document.getElementById('quick-speed').value) || 8;
        var delay = Math.max(20, 600 - speed * 30);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('quick-run').textContent = 'Run';
    }
  }

  init();
  S.onThemeChange(draw);
  S.onDataChange(init);

  document.getElementById('quick-step').onclick = function() {
    running = false;
    if (timer) clearTimeout(timer);
    document.getElementById('quick-run').textContent = 'Run';
    advance();
  };
  document.getElementById('quick-run').onclick = function() {
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
  document.getElementById('quick-reset').onclick = init;
  document.getElementById('quick-speed').oninput = function() {
    document.getElementById('quick-speed-val').textContent = this.value;
  };
})();
</script>

---

## Algorithm Race

Now for the fun part: let us race all five algorithms against each other on the same input. This is the best way to see how $$O(n^2)$$ compares to $$O(n \log n)$$ in practice. Click Race! to start all five algorithms simultaneously on the same array, and try sorted, reversed, and random arrays to see how input order affects performance.

<div class="interactive-demo">
  <div class="sort-race-grid">
    <div class="sort-race-item"><div class="sort-race-label">Bubble Sort</div><canvas id="race-bubble" width="330" height="160"></canvas><div class="demo-info" id="race-bubble-info">-</div></div>
    <div class="sort-race-item"><div class="sort-race-label">Selection Sort</div><canvas id="race-selection" width="330" height="160"></canvas><div class="demo-info" id="race-selection-info">-</div></div>
    <div class="sort-race-item"><div class="sort-race-label">Insertion Sort</div><canvas id="race-insertion" width="330" height="160"></canvas><div class="demo-info" id="race-insertion-info">-</div></div>
    <div class="sort-race-item"><div class="sort-race-label">Merge Sort</div><canvas id="race-merge" width="330" height="160"></canvas><div class="demo-info" id="race-merge-info">-</div></div>
    <div class="sort-race-item"><div class="sort-race-label">Quick Sort</div><canvas id="race-quick" width="330" height="160"></canvas><div class="demo-info" id="race-quick-info">-</div></div>
    <div class="sort-race-item" style="display:flex;align-items:center;justify-content:center;">
      <div id="race-results" style="font-size:0.85rem;color:var(--text-secondary);text-align:left;font-family:'JetBrains Mono',monospace;"></div>
    </div>
  </div>
  <div class="demo-controls" style="justify-content:center;">
    <button id="race-start" style="font-size:1rem;padding:0.6rem 2rem;">Race!</button>
    <button id="race-reset">Reset</button>
    <label>Speed: <input type="range" id="race-speed" min="1" max="20" value="12"> <span class="demo-value" id="race-speed-val">12</span></label>
  </div>
  <div class="demo-caption">Settings: same shared dataset run through all five algorithms in parallel, default speed 12.</div>
</div>

<script>
(function() {
  var S = window.DSA_Sort;
  var algos = [
    { id: 'bubble', gen: S.bubbleSortStates, name: 'Bubble' },
    { id: 'selection', gen: S.selectionSortStates, name: 'Selection' },
    { id: 'insertion', gen: S.insertionSortStates, name: 'Insertion' },
    { id: 'merge', gen: S.mergeSortStates, name: 'Merge' },
    { id: 'quick', gen: S.quickSortStates, name: 'Quick' }
  ];
  var W = 330, H = 160;
  var raceState = [];
  var running = false;
  var timer = null;

  function init() {
    running = false;
    if (timer) clearTimeout(timer);
    raceState = algos.map(function(algo) {
      var canvas = document.getElementById('race-' + algo.id);
      var ctx = S.setupCanvas(canvas, W, H);
      var states = algo.gen(S.arr);
      return { algo: algo, ctx: ctx, states: states, step: 0, done: false };
    });
    drawAll();
    document.getElementById('race-results').innerHTML = '';
    document.getElementById('race-start').textContent = 'Race!';
  }

  function drawAll() {
    raceState.forEach(function(rs) {
      var st = rs.states[rs.step] || rs.states[0];
      S.drawBars(rs.ctx, st.arr, W, H, st.highlights, rs.algo.name);
      var info = document.getElementById('race-' + rs.algo.id + '-info');
      info.textContent = 'Steps: ' + rs.step + '/' + (rs.states.length - 1) +
        ' | C: ' + st.comparisons + ' | S: ' + st.swaps;
    });
  }

  function advance() {
    var allDone = true;
    raceState.forEach(function(rs) {
      if (!rs.done && rs.step < rs.states.length - 1) {
        rs.step++;
        allDone = false;
      } else {
        rs.done = true;
      }
    });
    drawAll();

    if (!allDone && running) {
      var speed = parseInt(document.getElementById('race-speed').value) || 12;
      var delay = Math.max(10, 400 - speed * 20);
      timer = setTimeout(advance, delay);
    } else {
      running = false;
      document.getElementById('race-start').textContent = 'Race!';
      // Show results
      var results = raceState.map(function(rs) {
        var last = rs.states[rs.states.length - 1];
        return { name: rs.algo.name, steps: rs.states.length - 1, comparisons: last.comparisons, swaps: last.swaps };
      }).sort(function(a, b) { return a.steps - b.steps; });
      var html = '<strong>Results:</strong><br>';
      results.forEach(function(r, i) {
        html += (i + 1) + '. ' + r.name + ' (' + r.steps + ' steps)<br>';
      });
      document.getElementById('race-results').innerHTML = html;
    }
  }

  init();
  S.onThemeChange(drawAll);
  S.onDataChange(init);

  document.getElementById('race-start').onclick = function() {
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
  document.getElementById('race-reset').onclick = init;
  document.getElementById('race-speed').oninput = function() {
    document.getElementById('race-speed-val').textContent = this.value;
  };
})();
</script>

---

## Key Takeaways

| Concept | Key Idea |
|---|---|
| Quadratic Sorts | Bubble, selection, and insertion sort are $$O(n^2)$$ and simple but slow on large datasets. |
| Insertion's Edge | Insertion sort runs in $$O(n)$$ on nearly-sorted data, which is why hybrid sorts use it for small chunks. |
| Merge Sort | Guarantees $$O(n \log n)$$ in all cases and is stable, but needs $$O(n)$$ extra space. |
| Quick Sort | Average $$O(n \log n)$$ and in-place, usually fastest in practice and the default in many libraries. |
| No Universal Best | The right choice depends on input size, sortedness, memory, and whether stability matters. |
| Experiment | Try Sorted, Reversed, and size 30 in the dataset above to see how each algorithm reacts. |

---

## What's Next?

Now that you understand sorting, the natural next step is searching, because sorted data unlocks the power of binary search. Continue to the [Searching Algorithms Interactive Guide]({{ site.baseurl }}/searching-algorithms/) to see why $$O(\log n)$$ is so much better than $$O(n)$$.

You can also explore the full [DSA in Python series]({{ site.baseurl }}/dsa/) for linked lists, trees, heaps, hash tables, and more.
