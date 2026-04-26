---
layout: post
title: "Stacks and Queues"
author: bharathikannan
categories: [Data Structures]
description: "Visualize LIFO and FIFO in action. Push, pop, enqueue, dequeue  - all animated step by step in your browser."
permalink: /stacks-and-queues/
hidden: true
---

<style>
.interactive-demo { border: 1px solid var(--border); border-radius: 12px; padding: 1.2rem; margin: 1.5rem 0; background: var(--bg-secondary); overflow: hidden; }
.interactive-demo canvas { display: block; margin: 0 auto; max-width: 100%; border-radius: 8px; }
.demo-controls { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-top: 0.75rem; font-size: 0.9rem; }
.demo-controls label { display: flex; align-items: center; gap: 0.4rem; font-weight: 500; }
.demo-controls input[type="number"] { width: 70px; padding: 0.3rem 0.5rem; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; }
.demo-controls input[type="text"] { width: 200px; padding: 0.3rem 0.5rem; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; }
.demo-controls button { padding: 0.4rem 1rem; border: 1px solid var(--accent); border-radius: 6px; background: transparent; color: var(--accent); cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: background 0.15s, color 0.15s; }
.demo-controls button:hover { background: var(--accent); color: var(--bg-primary); }
.demo-controls .demo-value { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; min-width: 4rem; }
.demo-info { margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
.demo-split { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 640px) { .demo-split { grid-template-columns: 1fr; } }
.demo-hint { background: var(--bg-secondary); border-left: 3px solid var(--accent); padding: 0.6rem 0.9rem; margin: 1rem 0; border-radius: 0 6px 6px 0; font-size: 0.85rem; color: var(--text-secondary); }
</style>

<script>
window.DSA_SQ = (function() {
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

  // Draw a vertical stack (top is visual top)
  function drawStack(ctx, w, h, items, highlight) {
    var c = getColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    var n = items.length;
    var boxW = 80, boxH = 36, gap = 4;
    var maxShow = Math.floor((h - 40) / (boxH + gap));
    var startX = w / 2 - boxW / 2;
    var baseY = h - 20;

    // Stack container outline
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(startX - 10, 20, boxW + 20, h - 40);
    ctx.setLineDash([]);

    if (n === 0) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Empty', w / 2, h / 2);
      return;
    }

    for (var i = 0; i < Math.min(n, maxShow); i++) {
      var idx = n - 1 - i; // top of stack is last element
      var y = baseY - (i + 1) * (boxH + gap);
      var col = c.box;
      if (highlight && highlight.index === idx) col = highlight.color;
      else if (i === 0 && highlight && highlight.top) col = highlight.color;

      ctx.fillStyle = col;
      ctx.beginPath();
      var r = 6;
      ctx.moveTo(startX + r, y);
      ctx.lineTo(startX + boxW - r, y);
      ctx.quadraticCurveTo(startX + boxW, y, startX + boxW, y + r);
      ctx.lineTo(startX + boxW, y + boxH - r);
      ctx.quadraticCurveTo(startX + boxW, y + boxH, startX + boxW - r, y + boxH);
      ctx.lineTo(startX + r, y + boxH);
      ctx.quadraticCurveTo(startX, y + boxH, startX, y + boxH - r);
      ctx.lineTo(startX, y + r);
      ctx.quadraticCurveTo(startX, y, startX + r, y);
      ctx.fill();

      ctx.fillStyle = c.textOnBox;
      ctx.font = 'bold 14px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(items[idx], w / 2, y + boxH / 2 + 5);

      // "top" label for topmost
      if (i === 0) {
        ctx.fillStyle = c.pointer;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('top', startX + boxW + 14, y + boxH / 2 + 4);
        ctx.fillStyle = c.pointer;
        ctx.beginPath();
        ctx.moveTo(startX + boxW + 10, y + boxH / 2);
        ctx.lineTo(startX + boxW + 4, y + boxH / 2 - 4);
        ctx.lineTo(startX + boxW + 4, y + boxH / 2 + 4);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // Draw a horizontal queue (front on left, rear on right)
  function drawQueue(ctx, w, h, items, highlight) {
    var c = getColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    var n = items.length;
    var boxW = 60, boxH = 40, gap = 6;
    var totalW = n * (boxW + gap) - gap;
    var startX = Math.max(30, (w - totalW) / 2);
    var y = h / 2 - boxH / 2;

    if (n === 0) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Empty', w / 2, h / 2);
      return;
    }

    for (var i = 0; i < n; i++) {
      var x = startX + i * (boxW + gap);
      var col = c.box;
      if (highlight && highlight.index === i) col = highlight.color;

      ctx.fillStyle = col;
      var r = 6;
      ctx.beginPath();
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

      ctx.fillStyle = c.textOnBox;
      ctx.font = 'bold 14px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(items[i], x + boxW / 2, y + boxH / 2 + 5);
    }

    // Front and rear labels
    var frontX = startX + boxW / 2;
    var rearX = startX + (n - 1) * (boxW + gap) + boxW / 2;
    ctx.fillStyle = c.pointer;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('front', frontX, y + boxH + 18);
    ctx.fillText('rear', rearX, y + boxH + 18);
  }

  var themeCallbacks = [];
  function onThemeChange(cb) { themeCallbacks.push(cb); }
  var observer = new MutationObserver(function() {
    themeCallbacks.forEach(function(cb) { cb(); });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    getColors: getColors, setupCanvas: setupCanvas,
    drawStack: drawStack, drawQueue: drawQueue,
    onThemeChange: onThemeChange
  };
})();
</script>

Stacks and queues are two of the most fundamental abstract data types in computer science. They can be implemented with arrays or linked lists, but what defines them is their access pattern: a stack is Last In, First Out (LIFO), like a stack of plates, while a queue is First In, First Out (FIFO), like a line at a store.

This guide walks through the core stack operations (push, pop, peek) and the core queue operations (enqueue, dequeue), shows how LIFO versus FIFO changes program behavior, and finishes with a practical application: balanced parentheses checking.

---

## Stack

A stack follows the LIFO principle: the last element added is the first one removed. Think of it like a stack of plates, you can only add or remove from the top. In practice, stacks are used when you need to reverse recent actions quickly. Undo systems, browser history, function call management, and depth first search all rely on this pattern. The key intuition is that the most recent context is usually the most relevant next context.

```python
class Stack:
    def __init__(self):
        self.items = []

    def push(self, data):
        self.items.append(data)

    def pop(self):
        if self.is_empty():
            return None
        return self.items.pop()

    def peek(self):
        if self.is_empty():
            return None
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)
```

All operations are O(1) since push, pop, and peek all happen at the top of the stack. Enter a value and push to add it to the top, pop removes the top element, and peek highlights the top without removing it.

<div class="interactive-demo">
  <canvas id="stack-canvas" width="300" height="320"></canvas>
  <div class="demo-controls">
    <label>Value: <input type="number" id="stack-value" value="50" style="width:60px;"></label>
    <button id="stack-push">Push</button>
    <button id="stack-pop">Pop</button>
    <button id="stack-peek">Peek</button>
    <button id="stack-reset">Reset</button>
  </div>
  <div class="demo-info" id="stack-info">Stack: [10, 20, 30] | Size: 3 | Top: 30</div>
  <div class="demo-caption">Settings: stack initialized with [10, 20, 30]; top element shown at the visual top.</div>
</div>

<script>
(function() {
  var S = window.DSA_SQ;
  var canvas = document.getElementById('stack-canvas');
  var W = 300, H = 320;
  var ctx = S.setupCanvas(canvas, W, H);
  var items = [10, 20, 30];
  var highlight = null;

  function draw() {
    S.drawStack(ctx, W, H, items, highlight);
    var top = items.length > 0 ? items[items.length - 1] : 'none';
    document.getElementById('stack-info').textContent =
      'Stack: [' + items.join(', ') + '] | Size: ' + items.length + ' | Top: ' + top;
  }

  draw();
  S.onThemeChange(draw);

  document.getElementById('stack-push').onclick = function() {
    var val = parseInt(document.getElementById('stack-value').value);
    if (isNaN(val)) return;
    items.push(val);
    highlight = { top: true, color: S.getColors().boxNew };
    draw();
    setTimeout(function() { highlight = null; draw(); }, 600);
  };
  document.getElementById('stack-pop').onclick = function() {
    if (items.length === 0) return;
    highlight = { top: true, color: S.getColors().boxPop };
    draw();
    setTimeout(function() { items.pop(); highlight = null; draw(); }, 400);
  };
  document.getElementById('stack-peek').onclick = function() {
    if (items.length === 0) return;
    highlight = { top: true, color: S.getColors().boxPeek };
    draw();
    setTimeout(function() { highlight = null; draw(); }, 800);
  };
  document.getElementById('stack-reset').onclick = function() {
    items = [10, 20, 30]; highlight = null; draw();
  };
})();
</script>

---

## Queue

A queue follows the FIFO principle: the first element added is the first one removed. Think of it like waiting in line, the person who arrives first gets served first. Queues are useful when fairness and order matter. Task schedulers, request pipelines, message brokers, and breadth first search all benefit from FIFO behavior. If your system must process work in arrival order, a queue is usually the default choice.

```python
class Queue:
    def __init__(self):
        self.items = []

    def enqueue(self, data):
        self.items.append(data)

    def dequeue(self):
        if self.is_empty():
            return None
        return self.items.pop(0)

    def is_empty(self):
        return len(self.items) == 0

    def size(self):
        return len(self.items)
```

Enqueue is O(1), dequeue is O(n) with a list (O(1) with `collections.deque`). Enqueue adds to the rear, dequeue removes from the front, and elements flow left to right.

<div class="interactive-demo">
  <canvas id="queue-canvas" width="680" height="120"></canvas>
  <div class="demo-controls">
    <label>Value: <input type="number" id="queue-value" value="50" style="width:60px;"></label>
    <button id="queue-enqueue">Enqueue</button>
    <button id="queue-dequeue">Dequeue</button>
    <button id="queue-reset">Reset</button>
  </div>
  <div class="demo-info" id="queue-info">Queue: [10, 20, 30] | Front: 10 | Rear: 30</div>
  <div class="demo-caption">Settings: queue initialized with [10, 20, 30]; front on the left, rear on the right.</div>
</div>

<script>
(function() {
  var S = window.DSA_SQ;
  var canvas = document.getElementById('queue-canvas');
  var W = 680, H = 120;
  var ctx = S.setupCanvas(canvas, W, H);
  var items = [10, 20, 30];
  var highlight = null;

  function draw() {
    S.drawQueue(ctx, W, H, items, highlight);
    var front = items.length > 0 ? items[0] : 'none';
    var rear = items.length > 0 ? items[items.length - 1] : 'none';
    document.getElementById('queue-info').textContent =
      'Queue: [' + items.join(', ') + '] | Front: ' + front + ' | Rear: ' + rear;
  }

  draw();
  S.onThemeChange(draw);

  document.getElementById('queue-enqueue').onclick = function() {
    var val = parseInt(document.getElementById('queue-value').value);
    if (isNaN(val)) return;
    items.push(val);
    highlight = { index: items.length - 1, color: S.getColors().boxNew };
    draw();
    setTimeout(function() { highlight = null; draw(); }, 600);
  };
  document.getElementById('queue-dequeue').onclick = function() {
    if (items.length === 0) return;
    highlight = { index: 0, color: S.getColors().boxPop };
    draw();
    setTimeout(function() { items.shift(); highlight = null; draw(); }, 400);
  };
  document.getElementById('queue-reset').onclick = function() {
    items = [10, 20, 30]; highlight = null; draw();
  };
})();
</script>

---

## Stack vs Queue: Side by Side

The same sequence of operations produces completely different results depending on whether you use a stack or a queue.

<div class="interactive-demo">
  <div class="demo-split">
    <div>
      <div style="font-weight:600;text-align:center;margin-bottom:0.25rem;font-size:0.9rem;">Stack (LIFO)</div>
      <canvas id="compare-stack" width="200" height="280"></canvas>
      <div class="demo-info" id="compare-stack-info">-</div>
    </div>
    <div>
      <div style="font-weight:600;text-align:center;margin-bottom:0.25rem;font-size:0.9rem;">Queue (FIFO)</div>
      <canvas id="compare-queue" width="330" height="120"></canvas>
      <div class="demo-info" id="compare-queue-info" style="margin-top:0.5rem;">-</div>
    </div>
  </div>
  <div class="demo-controls" style="justify-content:center;">
    <label>Value: <input type="number" id="compare-value" value="40" style="width:60px;"></label>
    <button id="compare-add">Add to Both</button>
    <button id="compare-remove">Remove from Both</button>
    <button id="compare-reset">Reset</button>
  </div>
  <div class="demo-caption">Settings: both structures initialized with [10, 20, 30]; same operations applied to each.</div>
</div>

<script>
(function() {
  var S = window.DSA_SQ;
  var stackItems = [10, 20, 30];
  var queueItems = [10, 20, 30];

  var sCanvas = document.getElementById('compare-stack');
  var sCtx = S.setupCanvas(sCanvas, 200, 280);
  var qCanvas = document.getElementById('compare-queue');
  var qCtx = S.setupCanvas(qCanvas, 330, 120);

  function draw() {
    S.drawStack(sCtx, 200, 280, stackItems);
    S.drawQueue(qCtx, 330, 120, queueItems);
    document.getElementById('compare-stack-info').textContent = 'Top: ' + (stackItems.length ? stackItems[stackItems.length - 1] : 'empty');
    document.getElementById('compare-queue-info').textContent = 'Front: ' + (queueItems.length ? queueItems[0] : 'empty');
  }

  draw();
  S.onThemeChange(draw);

  document.getElementById('compare-add').onclick = function() {
    var val = parseInt(document.getElementById('compare-value').value);
    if (isNaN(val)) return;
    stackItems.push(val);
    queueItems.push(val);
    draw();
  };
  document.getElementById('compare-remove').onclick = function() {
    if (stackItems.length > 0) stackItems.pop();
    if (queueItems.length > 0) queueItems.shift();
    draw();
  };
  document.getElementById('compare-reset').onclick = function() {
    stackItems = [10, 20, 30]; queueItems = [10, 20, 30]; draw();
  };
})();
</script>

---

## Application: Balanced Parentheses

A classic use of stacks is checking whether parentheses in a string are balanced. For every opening bracket, we push it onto the stack. For every closing bracket, we pop and check if it matches.

```python
def is_balanced(s):
    stack = []
    pairs = {'(': ')', '[': ']', '{': '}'}

    for char in s:
        if char in pairs:
            stack.append(char)
        elif char in pairs.values():
            if not stack or pairs[stack.pop()] != char:
                return False

    return len(stack) == 0
```

Enter a string with parentheses and step through it. The stack grows on opening brackets and shrinks on closing ones, with green indicating a match and red a mismatch.

<div class="interactive-demo">
  <canvas id="paren-canvas" width="680" height="200"></canvas>
  <div class="demo-controls">
    <label>Input: <input type="text" id="paren-input" value="{[()]}" style="width:160px;"></label>
    <button id="paren-step">Step</button>
    <button id="paren-run">Run</button>
    <button id="paren-reset">Reset</button>
  </div>
  <div class="demo-info" id="paren-info">Ready  - enter a string and click Step</div>
  <div class="demo-caption">Settings: input "{[()]}" by default; step or run to walk through stack updates.</div>
</div>

<script>
(function() {
  var S = window.DSA_SQ;
  var canvas = document.getElementById('paren-canvas');
  var W = 680, H = 200;
  var ctx = S.setupCanvas(canvas, W, H);
  var pairs = { '(': ')', '[': ']', '{': '}' };
  var closers = { ')': '(', ']': '[', '}': '{' };
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function genStates() {
    var input = document.getElementById('paren-input').value;
    states = [];
    var stack = [];
    states.push({ input: input, pos: -1, stack: [], status: 'ready', info: 'Input: ' + input });

    for (var i = 0; i < input.length; i++) {
      var ch = input[i];
      if (pairs[ch]) {
        stack.push(ch);
        states.push({ input: input, pos: i, stack: stack.slice(), status: 'push', info: "Push '" + ch + "' onto stack" });
      } else if (closers[ch]) {
        if (stack.length === 0 || stack[stack.length - 1] !== closers[ch]) {
          states.push({ input: input, pos: i, stack: stack.slice(), status: 'mismatch', info: "Mismatch! '" + ch + "' has no matching opener" });
          states.push({ input: input, pos: i, stack: stack.slice(), status: 'fail', info: 'NOT BALANCED' });
          return;
        }
        stack.pop();
        states.push({ input: input, pos: i, stack: stack.slice(), status: 'match', info: "Match! Pop '" + closers[ch] + "' for '" + ch + "'" });
      }
    }

    if (stack.length === 0) {
      states.push({ input: input, pos: input.length, stack: [], status: 'success', info: 'BALANCED! Stack is empty' });
    } else {
      states.push({ input: input, pos: input.length, stack: stack.slice(), status: 'fail', info: 'NOT BALANCED  - unclosed: ' + stack.join(', ') });
    }
  }

  function draw() {
    var c = S.getColors();
    var st = states[step] || states[0];
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    // Draw input characters
    var charW = 30, startX = 40, charY = 30;
    ctx.font = 'bold 18px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (var i = 0; i < st.input.length; i++) {
      var x = startX + i * charW;
      if (i === st.pos && st.status === 'mismatch') ctx.fillStyle = c.boxMismatch;
      else if (i === st.pos && st.status === 'match') ctx.fillStyle = c.boxMatch;
      else if (i === st.pos) ctx.fillStyle = c.boxPeek;
      else if (i < st.pos) ctx.fillStyle = c.textMuted;
      else ctx.fillStyle = c.text;
      ctx.fillText(st.input[i], x + charW / 2, charY + 5);
    }
    // Cursor
    if (st.pos >= 0 && st.pos < st.input.length) {
      ctx.fillStyle = c.boxPeek;
      ctx.fillRect(startX + st.pos * charW, charY + 10, charW, 2);
    }

    // Draw stack (horizontal for visibility)
    ctx.fillStyle = c.text;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Stack:', 40, 80);

    var boxW = 36, boxH = 36;
    for (var i = 0; i < st.stack.length; i++) {
      var x = 100 + i * (boxW + 4);
      var col = c.box;
      if (i === st.stack.length - 1 && st.status === 'push') col = c.boxNew;
      ctx.fillStyle = col;
      ctx.beginPath();
      var r = 6;
      ctx.moveTo(x + r, 64); ctx.lineTo(x + boxW - r, 64);
      ctx.quadraticCurveTo(x + boxW, 64, x + boxW, 64 + r);
      ctx.lineTo(x + boxW, 64 + boxH - r);
      ctx.quadraticCurveTo(x + boxW, 64 + boxH, x + boxW - r, 64 + boxH);
      ctx.lineTo(x + r, 64 + boxH);
      ctx.quadraticCurveTo(x, 64 + boxH, x, 64 + boxH - r);
      ctx.lineTo(x, 64 + r);
      ctx.quadraticCurveTo(x, 64, x + r, 64);
      ctx.fill();
      ctx.fillStyle = c.textOnBox;
      ctx.font = 'bold 16px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(st.stack[i], x + boxW / 2, 64 + boxH / 2 + 6);
    }
    if (st.stack.length === 0) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('(empty)', 100, 88);
    }

    // Status
    if (st.status === 'success') {
      ctx.fillStyle = c.boxMatch;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BALANCED', W / 2, 150);
    } else if (st.status === 'fail') {
      ctx.fillStyle = c.boxMismatch;
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NOT BALANCED', W / 2, 150);
    }

    document.getElementById('paren-info').textContent = st.info;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      draw();
      if (running) timer = setTimeout(advance, 600);
    } else {
      running = false;
      document.getElementById('paren-run').textContent = 'Run';
    }
  }

  function init() {
    genStates(); step = 0; running = false;
    if (timer) clearTimeout(timer);
    draw();
  }

  init();
  S.onThemeChange(draw);

  document.getElementById('paren-step').onclick = function() {
    running = false; if (timer) clearTimeout(timer);
    document.getElementById('paren-run').textContent = 'Run';
    advance();
  };
  document.getElementById('paren-run').onclick = function() {
    if (running) { running = false; if (timer) clearTimeout(timer); this.textContent = 'Run'; }
    else { if (step >= states.length - 1) init(); running = true; this.textContent = 'Pause'; advance(); }
  };
  document.getElementById('paren-reset').onclick = init;
  document.getElementById('paren-input').onchange = init;
})();
</script>

---

## Key Takeaways

| Concept | Key Idea |
|---|---|
| Stack (LIFO) | Last in, first out; natural fit for undo, function calls, and DFS. |
| Queue (FIFO) | First in, first out; used in BFS, task scheduling, and buffering. |
| Time Complexity | Both achieve O(1) push/pop or enqueue/dequeue when implemented properly. |
| Implementation | Stacks use array append/pop; queues prefer `collections.deque` for O(1) dequeue. |
| Balanced Parentheses | The canonical stack application, matching openers and closers in order. |

---

## What's Next?

With arrays, linked lists, stacks, and queues under your belt, it is time to explore trees, hierarchical data structures that power everything from file systems to databases. Continue to the [Binary Trees and BST Interactive Guide]({{ site.baseurl }}/binary-trees-and-bst/).

Explore the full [DSA in Python series]({{ site.baseurl }}/dsa/).
