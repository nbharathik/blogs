---
layout: post
title: "Linked Lists from Scratch: An Interactive Guide"
author: bharathikannan
categories: [Data Structures]
description: "Build and manipulate linked lists visually. Insert, delete, reverse, merge  - all animated with pointer re-routing, step by step."
permalink: /linked-lists/
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
window.DSA_LL = (function() {
  function getColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg: dark ? '#1a1b26' : '#ffffff',
      node: dark ? '#7aa2f7' : '#2563eb',
      nodeHighlight: dark ? '#ff9e64' : '#f59e0b',
      nodeFound: dark ? '#9ece6a' : '#16a34a',
      nodeNew: dark ? '#bb9af7' : '#7c3aed',
      nodeDelete: dark ? '#f7768e' : '#e63946',
      text: dark ? '#c0caf5' : '#1a1b26',
      textOnNode: '#ffffff',
      textMuted: dark ? '#565f89' : '#6b7280',
      arrow: dark ? '#565f89' : '#9ca3af',
      arrowHighlight: dark ? '#ff9e64' : '#f59e0b',
      pointer: dark ? '#9ece6a' : '#16a34a',
      null: dark ? '#f7768e' : '#e63946'
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

  var NODE_W = 60, NODE_H = 36, ARROW_LEN = 40, NODE_R = 8;

  // Draw a single node
  function drawNode(ctx, x, y, value, color, c) {
    ctx.fillStyle = color || c.node;
    ctx.beginPath();
    ctx.moveTo(x + NODE_R, y);
    ctx.lineTo(x + NODE_W - NODE_R, y);
    ctx.quadraticCurveTo(x + NODE_W, y, x + NODE_W, y + NODE_R);
    ctx.lineTo(x + NODE_W, y + NODE_H - NODE_R);
    ctx.quadraticCurveTo(x + NODE_W, y + NODE_H, x + NODE_W - NODE_R, y + NODE_H);
    ctx.lineTo(x + NODE_R, y + NODE_H);
    ctx.quadraticCurveTo(x, y + NODE_H, x, y + NODE_H - NODE_R);
    ctx.lineTo(x, y + NODE_R);
    ctx.quadraticCurveTo(x, y, x + NODE_R, y);
    ctx.fill();

    ctx.fillStyle = c.textOnNode;
    ctx.font = 'bold 14px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(value, x + NODE_W / 2, y + NODE_H / 2 + 5);
  }

  // Draw arrow from one node to next
  function drawArrow(ctx, x1, y1, x2, y2, color, c) {
    ctx.strokeStyle = color || c.arrow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 - 8, y2);
    ctx.stroke();
    // Arrowhead
    ctx.fillStyle = color || c.arrow;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8, y2 - 4);
    ctx.lineTo(x2 - 8, y2 + 4);
    ctx.closePath();
    ctx.fill();
  }

  // Draw a pointer label above/below a node
  function drawPointer(ctx, x, y, label, color, c, above) {
    ctx.fillStyle = color || c.pointer;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    if (above) {
      ctx.fillText(label, x + NODE_W / 2, y - 8);
      // Down arrow
      ctx.beginPath();
      ctx.moveTo(x + NODE_W / 2, y - 5);
      ctx.lineTo(x + NODE_W / 2 - 4, y - 11);
      ctx.lineTo(x + NODE_W / 2 + 4, y - 11);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillText(label, x + NODE_W / 2, y + NODE_H + 20);
      ctx.beginPath();
      ctx.moveTo(x + NODE_W / 2, y + NODE_H + 5);
      ctx.lineTo(x + NODE_W / 2 - 4, y + NODE_H + 11);
      ctx.lineTo(x + NODE_W / 2 + 4, y + NODE_H + 11);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Draw a complete linked list
  // nodes: array of { value, color?, pointerLabel? }
  // options: { showNull: bool, highlightArrows: [index] }
  function drawLinkedList(ctx, w, h, nodes, options) {
    var c = getColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    options = options || {};
    var n = nodes.length;
    if (n === 0) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Empty list', w / 2, h / 2);
      return;
    }

    var totalNodeW = n * NODE_W + (n - 1) * ARROW_LEN + (options.showNull !== false ? ARROW_LEN + 30 : 0);
    var startX = Math.max(20, (w - totalNodeW) / 2);
    var startY = h / 2 - NODE_H / 2;

    // Draw "head" pointer
    drawPointer(ctx, startX, startY, 'head', c.pointer, c, true);

    for (var i = 0; i < n; i++) {
      var x = startX + i * (NODE_W + ARROW_LEN);
      var nodeColor = nodes[i].color || c.node;
      drawNode(ctx, x, startY, nodes[i].value, nodeColor, c);

      // Pointer labels below
      if (nodes[i].pointerLabel) {
        drawPointer(ctx, x, startY, nodes[i].pointerLabel, c.nodeHighlight, c, false);
      }

      // Arrow to next
      if (i < n - 1) {
        var arrowColor = (options.highlightArrows && options.highlightArrows.indexOf(i) >= 0) ? c.arrowHighlight : c.arrow;
        drawArrow(ctx, x + NODE_W, startY + NODE_H / 2, x + NODE_W + ARROW_LEN, startY + NODE_H / 2, arrowColor, c);
      }
    }

    // Null pointer at end
    if (options.showNull !== false) {
      var lastX = startX + (n - 1) * (NODE_W + ARROW_LEN);
      drawArrow(ctx, lastX + NODE_W, startY + NODE_H / 2, lastX + NODE_W + ARROW_LEN - 8, startY + NODE_H / 2, c.arrow, c);
      ctx.fillStyle = c.null;
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('null', lastX + NODE_W + ARROW_LEN - 4, startY + NODE_H / 2 + 4);
    }
  }

  var themeCallbacks = [];
  function onThemeChange(cb) { themeCallbacks.push(cb); }
  var observer = new MutationObserver(function() {
    themeCallbacks.forEach(function(cb) { cb(); });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    getColors: getColors, setupCanvas: setupCanvas,
    drawLinkedList: drawLinkedList, drawNode: drawNode,
    drawArrow: drawArrow, drawPointer: drawPointer,
    NODE_W: NODE_W, NODE_H: NODE_H, ARROW_LEN: ARROW_LEN,
    onThemeChange: onThemeChange
  };
})();
</script>

A linked list is a linear data structure where elements are stored in **nodes**, and each node contains a **pointer** (reference) to the next node. Unlike arrays, linked list elements are not stored in contiguous memory  - they can be scattered anywhere, connected only by pointers.

This gives linked lists a unique advantage: **inserting and deleting elements is O(1)** once you have a reference to the correct position, compared to O(n) for arrays (which must shift elements).

By the end of this guide you will understand:
- **Singly linked list** - nodes with a `next` pointer
- **Doubly linked list** - nodes with `next` and `prev` pointers
- **Core operations** - insert, delete, search, traverse
- **Reversal** - flipping a linked list in-place
- **Merging** - combining two sorted lists

<div class="demo-hint">
<strong>How to use the demos:</strong> Each demo has controls to manipulate the linked list. Watch the nodes and arrows update in real time as you perform operations.
</div>

---

## What is a Linked List?

An array stores elements in a contiguous block of memory. To insert an element in the middle, you must shift all subsequent elements. A linked list avoids this by storing each element in a separate **node** that points to the next one.

Each node has two parts:
- **Data** - the value stored in the node
- **Next** - a pointer/reference to the next node (or `null` if it is the last node)

The list is accessed through a **head** pointer that points to the first node.

### Python Node Class

A node is the atomic unit of a linked list. It stores payload data and one pointer to the next node. This tiny structure is enough to build chains of any length, and it explains why insertion near a known node is cheap: you only rewire pointers instead of shifting a full array.

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None
```

---

## Basic Operations

### Insert, Delete, and Search

The fundamental operations on a linked list are:
- **Insert at head** - O(1) - create a new node, point it to old head, update head
- **Insert at tail** - O(n) - traverse to the end, then append
- **Insert at position** - O(n) - traverse to the position, then splice in
- **Delete** - O(n) - find the node, re-route pointers around it
- **Search** - O(n) - traverse from head until found

### Python Implementation

```python
class LinkedList:
    def __init__(self):
        self.head = None

    def insert_at_head(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node

    def insert_at_tail(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node

    def delete(self, data):
        if not self.head:
            return
        if self.head.data == data:
            self.head = self.head.next
            return
        current = self.head
        while current.next:
            if current.next.data == data:
                current.next = current.next.next
                return
            current = current.next

    def search(self, data):
        current = self.head
        index = 0
        while current:
            if current.data == data:
                return index
            current = current.next
            index += 1
        return -1
```

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> Enter a value and click the operation buttons to manipulate the linked list. Watch nodes appear, disappear, and pointers re-route in real time.
</div>

<div class="interactive-demo">
  <canvas id="ll-ops-canvas" width="680" height="120"></canvas>
  <div class="demo-controls">
    <label>Value: <input type="number" id="ll-value" value="50" style="width:60px;"></label>
    <button id="ll-insert-head">Insert Head</button>
    <button id="ll-insert-tail">Insert Tail</button>
    <button id="ll-delete">Delete</button>
    <button id="ll-search">Search</button>
    <button id="ll-reset">Reset</button>
  </div>
  <div class="demo-info" id="ll-ops-info">List: 10 -> 20 -> 30 -> 40 -> null</div>
</div>

<script>
(function() {
  var S = window.DSA_LL;
  var canvas = document.getElementById('ll-ops-canvas');
  var W = 680, H = 120;
  var ctx = S.setupCanvas(canvas, W, H);
  var list = [10, 20, 30, 40];
  var highlightIdx = -1;
  var highlightColor = '';
  var infoText = '';

  function toNodes() {
    return list.map(function(v, i) {
      var n = { value: v };
      if (i === highlightIdx) n.color = highlightColor || S.getColors().nodeHighlight;
      return n;
    });
  }

  function draw() {
    S.drawLinkedList(ctx, W, H, toNodes());
    var text = 'List: ' + (list.length > 0 ? list.join(' -> ') + ' -> null' : 'empty');
    if (infoText) text += ' | ' + infoText;
    document.getElementById('ll-ops-info').textContent = text;
  }

  function flash(idx, color, msg) {
    highlightIdx = idx;
    highlightColor = color;
    infoText = msg;
    draw();
    setTimeout(function() { highlightIdx = -1; infoText = ''; draw(); }, 1200);
  }

  draw();
  S.onThemeChange(draw);

  document.getElementById('ll-insert-head').onclick = function() {
    var val = parseInt(document.getElementById('ll-value').value);
    if (isNaN(val)) return;
    list.unshift(val);
    flash(0, S.getColors().nodeNew, 'Inserted ' + val + ' at head');
  };
  document.getElementById('ll-insert-tail').onclick = function() {
    var val = parseInt(document.getElementById('ll-value').value);
    if (isNaN(val)) return;
    list.push(val);
    flash(list.length - 1, S.getColors().nodeNew, 'Inserted ' + val + ' at tail');
  };
  document.getElementById('ll-delete').onclick = function() {
    var val = parseInt(document.getElementById('ll-value').value);
    var idx = list.indexOf(val);
    if (idx >= 0) {
      flash(idx, S.getColors().nodeDelete, 'Deleted ' + val);
      setTimeout(function() { list.splice(idx, 1); highlightIdx = -1; infoText = ''; draw(); }, 600);
    } else {
      infoText = val + ' not found';
      draw();
      setTimeout(function() { infoText = ''; draw(); }, 1200);
    }
  };
  document.getElementById('ll-search').onclick = function() {
    var val = parseInt(document.getElementById('ll-value').value);
    var idx = list.indexOf(val);
    if (idx >= 0) {
      flash(idx, S.getColors().nodeFound, 'Found ' + val + ' at index ' + idx);
    } else {
      infoText = val + ' not found';
      draw();
      setTimeout(function() { infoText = ''; draw(); }, 1200);
    }
  };
  document.getElementById('ll-reset').onclick = function() {
    list = [10, 20, 30, 40];
    highlightIdx = -1; infoText = '';
    draw();
  };
})();
</script>

---

## Reversing a Linked List

Reversing a linked list is a classic interview question. The key insight is to use three pointers: `prev`, `current`, and `after`. At each step, we reverse the direction of the `next` pointer, then advance all three pointers.

### Python Implementation

```python
def reverse(self):
    prev = None
    current = self.head

    while current:
        after = current.next     # Save next node
        current.next = prev      # Reverse the link
        prev = current           # Move prev forward
        current = after          # Move current forward

    self.head = prev
```

**Time complexity:** $$O(n)$$  - we visit each node exactly once. **Space:** $$O(1)$$  - only three pointers.

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> Step through the reversal algorithm. Watch the <code>prev</code>, <code>current</code>, and <code>after</code> pointers move, and see arrows flip direction one at a time.
</div>

<div class="interactive-demo">
  <canvas id="ll-reverse-canvas" width="680" height="140"></canvas>
  <div class="demo-controls">
    <button id="reverse-step">Step</button>
    <button id="reverse-run">Run</button>
    <button id="reverse-reset">Reset</button>
    <label>Speed: <input type="range" id="reverse-speed" min="1" max="10" value="3"> <span class="demo-value" id="reverse-speed-val">3</span></label>
  </div>
  <div class="demo-info" id="reverse-info">Ready  - click Step to begin</div>
</div>

<script>
(function() {
  var S = window.DSA_LL;
  var canvas = document.getElementById('ll-reverse-canvas');
  var W = 680, H = 140;
  var ctx = S.setupCanvas(canvas, W, H);

  var origList = [10, 20, 30, 40, 50];
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function genStates() {
    states = [];
    var list = origList.slice();
    var n = list.length;
    // Initial state
    var nodes = list.map(function(v) { return { value: v }; });
    nodes[0].pointerLabel = 'current';
    states.push({ nodes: nodes.slice(), info: 'prev = null, current = ' + list[0], highlightArrows: [] });

    // Simulate reversal with states
    var prev = -1, curr = 0;
    while (curr < n) {
      var after = curr + 1 < n ? curr + 1 : -1;
      // Show after pointer
      var nodes2 = list.map(function(v, i) {
        var nd = { value: v };
        if (i === prev) { nd.pointerLabel = 'prev'; nd.color = S.getColors().nodeFound; }
        if (i === curr) { nd.pointerLabel = 'current'; nd.color = S.getColors().nodeHighlight; }
        if (i === after) { nd.pointerLabel = 'after'; nd.color = S.getColors().nodeNew; }
        return nd;
      });
      states.push({ nodes: nodes2, info: 'prev=' + (prev >= 0 ? list[prev] : 'null') + ', current=' + list[curr] + ', after=' + (after >= 0 ? list[after] : 'null'), highlightArrows: [curr] });

      // Reverse link: current.next = prev (we just show the highlight)
      var nodes3 = list.map(function(v, i) {
        var nd = { value: v };
        if (i === prev) { nd.pointerLabel = 'prev'; nd.color = S.getColors().nodeFound; }
        if (i === curr) { nd.pointerLabel = 'current'; nd.color = S.getColors().nodeHighlight; }
        if (i === after) { nd.pointerLabel = 'after'; nd.color = S.getColors().nodeNew; }
        return nd;
      });
      states.push({ nodes: nodes3, info: 'Reverse: ' + list[curr] + '.next = ' + (prev >= 0 ? list[prev] : 'null'), highlightArrows: [] });

      prev = curr;
      curr = after >= 0 ? after : n;
    }

    // Final state: reversed
    var reversed = origList.slice().reverse();
    var finalNodes = reversed.map(function(v) { return { value: v }; });
    states.push({ nodes: finalNodes, info: 'Reversed! head = ' + reversed[0], highlightArrows: [] });
  }

  function draw() {
    var st = states[step] || states[0];
    S.drawLinkedList(ctx, W, H, st.nodes, { highlightArrows: st.highlightArrows });
    document.getElementById('reverse-info').textContent = st.info;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      draw();
      if (running) {
        var speed = parseInt(document.getElementById('reverse-speed').value) || 3;
        var delay = Math.max(200, 1500 - speed * 130);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('reverse-run').textContent = 'Run';
    }
  }

  function init() {
    genStates();
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    draw();
  }

  init();
  S.onThemeChange(draw);

  document.getElementById('reverse-step').onclick = function() {
    running = false; if (timer) clearTimeout(timer);
    document.getElementById('reverse-run').textContent = 'Run';
    advance();
  };
  document.getElementById('reverse-run').onclick = function() {
    if (running) { running = false; if (timer) clearTimeout(timer); this.textContent = 'Run'; }
    else { if (step >= states.length - 1) init(); running = true; this.textContent = 'Pause'; advance(); }
  };
  document.getElementById('reverse-reset').onclick = init;
  document.getElementById('reverse-speed').oninput = function() {
    document.getElementById('reverse-speed-val').textContent = this.value;
  };
})();
</script>

---

## Doubly Linked List

A doubly linked list extends the singly linked list by adding a **prev** pointer to each node. This allows traversal in both directions and makes deletion O(1) when you have a reference to the node (no need to find the previous node).

### Python Implementation

```python
class DNode:
    def __init__(self, data):
        self.data = data
        self.next = None
        self.prev = None


class DoublyLinkedList:
    def __init__(self):
        self.head = None

    def insert_at_head(self, data):
        new_node = DNode(data)
        new_node.next = self.head
        if self.head:
            self.head.prev = new_node
        self.head = new_node

    def delete(self, node):
        if node.prev:
            node.prev.next = node.next
        else:
            self.head = node.next
        if node.next:
            node.next.prev = node.prev
```

**Trade-off:** Each node uses more memory (two pointers instead of one), but operations like "delete this node" and "insert before this node" become O(1).

### Interactive Visualization

<div class="interactive-demo">
  <canvas id="dll-canvas" width="680" height="130"></canvas>
  <div class="demo-controls">
    <label>Value: <input type="number" id="dll-value" value="50" style="width:60px;"></label>
    <button id="dll-insert-head">Insert Head</button>
    <button id="dll-insert-tail">Insert Tail</button>
    <button id="dll-delete">Delete</button>
    <button id="dll-reset">Reset</button>
  </div>
  <div class="demo-info" id="dll-info">null <-> 10 <-> 20 <-> 30 <-> null</div>
</div>

<script>
(function() {
  var S = window.DSA_LL;
  var canvas = document.getElementById('dll-canvas');
  var W = 680, H = 130;
  var ctx = S.setupCanvas(canvas, W, H);
  var list = [10, 20, 30];
  var highlightIdx = -1;

  function draw() {
    var c = S.getColors();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var n = list.length;
    if (n === 0) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Empty list', W / 2, H / 2);
      updateInfo();
      return;
    }

    var NW = S.NODE_W, NH = S.NODE_H, AL = S.ARROW_LEN;
    var totalW = n * NW + (n - 1) * AL + AL + 30;
    var startX = Math.max(40, (W - totalW) / 2);
    var startY = H / 2 - NH / 2;

    // Head pointer
    S.drawPointer(ctx, startX, startY, 'head', c.pointer, c, true);

    for (var i = 0; i < n; i++) {
      var x = startX + i * (NW + AL);
      var nodeColor = i === highlightIdx ? c.nodeNew : c.node;
      S.drawNode(ctx, x, startY, list[i], nodeColor, c);

      if (i < n - 1) {
        var nx = x + NW;
        var ny = startY + NH / 2;
        // Forward arrow (top)
        S.drawArrow(ctx, nx, ny - 5, nx + AL, ny - 5, c.arrow, c);
        // Backward arrow (bottom)
        ctx.strokeStyle = c.arrow;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(nx + AL, ny + 5);
        ctx.lineTo(nx + 8, ny + 5);
        ctx.stroke();
        ctx.fillStyle = c.arrow;
        ctx.beginPath();
        ctx.moveTo(nx, ny + 5);
        ctx.lineTo(nx + 8, ny + 1);
        ctx.lineTo(nx + 8, ny + 9);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Null at end
    var lastX = startX + (n - 1) * (NW + AL);
    S.drawArrow(ctx, lastX + NW, startY + NH / 2, lastX + NW + AL - 8, startY + NH / 2, c.arrow, c);
    ctx.fillStyle = c.null;
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('null', lastX + NW + AL - 4, startY + NH / 2 + 4);

    // Null at start
    ctx.fillStyle = c.null;
    ctx.textAlign = 'right';
    ctx.fillText('null', startX - 8, startY + NH / 2 + 4);

    updateInfo();
  }

  function updateInfo() {
    document.getElementById('dll-info').textContent =
      list.length > 0 ? 'null <-> ' + list.join(' <-> ') + ' <-> null' : 'Empty list';
  }

  draw();
  S.onThemeChange(draw);

  document.getElementById('dll-insert-head').onclick = function() {
    var val = parseInt(document.getElementById('dll-value').value);
    if (isNaN(val)) return;
    list.unshift(val);
    highlightIdx = 0; draw();
    setTimeout(function() { highlightIdx = -1; draw(); }, 800);
  };
  document.getElementById('dll-insert-tail').onclick = function() {
    var val = parseInt(document.getElementById('dll-value').value);
    if (isNaN(val)) return;
    list.push(val);
    highlightIdx = list.length - 1; draw();
    setTimeout(function() { highlightIdx = -1; draw(); }, 800);
  };
  document.getElementById('dll-delete').onclick = function() {
    var val = parseInt(document.getElementById('dll-value').value);
    var idx = list.indexOf(val);
    if (idx >= 0) { list.splice(idx, 1); }
    draw();
  };
  document.getElementById('dll-reset').onclick = function() {
    list = [10, 20, 30]; highlightIdx = -1; draw();
  };
})();
</script>

---

## Merge Two Sorted Lists

Given two sorted linked lists, we can merge them into one sorted list in O(n + m) time. This is the same merge step used in merge sort.

The important idea is local choice with global correctness. At each step, pick the smaller head node and advance only that list. Because both inputs are already sorted, this greedy rule always preserves sorted order in the final merged list.

### Python Implementation

```python
def merge_sorted_lists(l1, l2):
    dummy = Node(0)
    current = dummy

    while l1 and l2:
        if l1.data <= l2.data:
            current.next = l1
            l1 = l1.next
        else:
            current.next = l2
            l2 = l2.next
        current = current.next

    current.next = l1 or l2
    return dummy.next
```

### Interactive Visualization

<div class="interactive-demo">
  <canvas id="merge-ll-canvas" width="680" height="200"></canvas>
  <div class="demo-controls">
    <button id="merge-ll-step">Step</button>
    <button id="merge-ll-run">Run</button>
    <button id="merge-ll-reset">Reset</button>
    <label>Speed: <input type="range" id="merge-ll-speed" min="1" max="10" value="3"> <span class="demo-value" id="merge-ll-speed-val">3</span></label>
  </div>
  <div class="demo-info" id="merge-ll-info">List 1: 5 -> 15 -> 25 | List 2: 10 -> 20 -> 30</div>
</div>

<script>
(function() {
  var S = window.DSA_LL;
  var canvas = document.getElementById('merge-ll-canvas');
  var W = 680, H = 200;
  var ctx = S.setupCanvas(canvas, W, H);

  var list1 = [5, 15, 25];
  var list2 = [10, 20, 30];
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function genStates() {
    states = [];
    var a = list1.slice(), b = list2.slice();
    var result = [];
    var ai = 0, bi = 0;
    states.push({ a: a.slice(), b: b.slice(), result: [], ai: 0, bi: 0, info: 'Compare heads of both lists' });

    while (ai < a.length && bi < b.length) {
      if (a[ai] <= b[bi]) {
        result.push(a[ai]);
        states.push({ a: a.slice(), b: b.slice(), result: result.slice(), ai: ai, bi: bi, pick: 'a', info: a[ai] + ' <= ' + b[bi] + ', take ' + a[ai] + ' from List 1' });
        ai++;
      } else {
        result.push(b[bi]);
        states.push({ a: a.slice(), b: b.slice(), result: result.slice(), ai: ai, bi: bi, pick: 'b', info: b[bi] + ' < ' + a[ai] + ', take ' + b[bi] + ' from List 2' });
        bi++;
      }
    }
    while (ai < a.length) {
      result.push(a[ai]);
      states.push({ a: a.slice(), b: b.slice(), result: result.slice(), ai: ai, bi: bi, info: 'Append remaining ' + a[ai] + ' from List 1' });
      ai++;
    }
    while (bi < b.length) {
      result.push(b[bi]);
      states.push({ a: a.slice(), b: b.slice(), result: result.slice(), ai: ai, bi: bi, info: 'Append remaining ' + b[bi] + ' from List 2' });
      bi++;
    }
    states.push({ a: a.slice(), b: b.slice(), result: result.slice(), ai: ai, bi: bi, info: 'Merged: ' + result.join(' -> ') });
  }

  function draw() {
    var c = S.getColors();
    var st = states[step] || states[0];
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W, H);

    var NW = S.NODE_W, NH = S.NODE_H;

    // Draw List 1
    ctx.fillStyle = c.text;
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('List 1:', 10, 28);
    for (var i = 0; i < st.a.length; i++) {
      var x = 70 + i * (NW + 20);
      var col = i < st.ai ? c.textMuted : (i === st.ai && st.pick === 'a' ? c.nodeHighlight : c.node);
      S.drawNode(ctx, x, 14, st.a[i], i < st.ai ? '#666' : col, c);
      if (i < st.a.length - 1 && i >= st.ai) S.drawArrow(ctx, x + NW, 14 + NH / 2, x + NW + 20, 14 + NH / 2, c.arrow, c);
    }

    // Draw List 2
    ctx.fillStyle = c.text;
    ctx.fillText('List 2:', 10, 80);
    for (var i = 0; i < st.b.length; i++) {
      var x = 70 + i * (NW + 20);
      var col = i < st.bi ? c.textMuted : (i === st.bi && st.pick === 'b' ? c.nodeHighlight : c.node);
      S.drawNode(ctx, x, 66, st.b[i], i < st.bi ? '#666' : col, c);
      if (i < st.b.length - 1 && i >= st.bi) S.drawArrow(ctx, x + NW, 66 + NH / 2, x + NW + 20, 66 + NH / 2, c.arrow, c);
    }

    // Draw Result
    ctx.fillStyle = c.text;
    ctx.fillText('Result:', 10, 140);
    for (var i = 0; i < st.result.length; i++) {
      var x = 70 + i * (NW + 20);
      S.drawNode(ctx, x, 126, st.result[i], c.nodeFound, c);
      if (i < st.result.length - 1) S.drawArrow(ctx, x + NW, 126 + NH / 2, x + NW + 20, 126 + NH / 2, c.arrow, c);
    }

    document.getElementById('merge-ll-info').textContent = st.info;
  }

  function advance() {
    if (step < states.length - 1) {
      step++;
      draw();
      if (running) {
        var speed = parseInt(document.getElementById('merge-ll-speed').value) || 3;
        var delay = Math.max(200, 1500 - speed * 130);
        timer = setTimeout(advance, delay);
      }
    } else {
      running = false;
      document.getElementById('merge-ll-run').textContent = 'Run';
    }
  }

  function init() {
    genStates();
    step = 0;
    running = false;
    if (timer) clearTimeout(timer);
    draw();
  }

  init();
  S.onThemeChange(draw);

  document.getElementById('merge-ll-step').onclick = function() {
    running = false; if (timer) clearTimeout(timer);
    document.getElementById('merge-ll-run').textContent = 'Run';
    advance();
  };
  document.getElementById('merge-ll-run').onclick = function() {
    if (running) { running = false; if (timer) clearTimeout(timer); this.textContent = 'Run'; }
    else { if (step >= states.length - 1) init(); running = true; this.textContent = 'Pause'; advance(); }
  };
  document.getElementById('merge-ll-reset').onclick = init;
  document.getElementById('merge-ll-speed').oninput = function() {
    document.getElementById('merge-ll-speed-val').textContent = this.value;
  };
})();
</script>

---

## Array vs Linked List

| Operation | Array | Linked List |
|-----------|-------|-------------|
| Access by index | O(1) | O(n) |
| Insert at head | O(n) | O(1) |
| Insert at tail | O(1)* | O(n) |
| Insert at position | O(n) | O(n) |
| Delete | O(n) | O(1)** |
| Search | O(n) | O(n) |
| Memory | Contiguous | Scattered |

*\*Amortized with dynamic array. \*\*If you have a reference to the node.*

**Use arrays when** you need fast random access and your data does not change much. **Use linked lists when** you need frequent insertions and deletions, especially at the front.

---

## Key Takeaways

1. **Linked lists** trade random access for efficient insertion/deletion. They are the foundation for stacks, queues, and more complex data structures.

2. **Singly linked lists** use one pointer per node (next). **Doubly linked lists** use two (next + prev) for bidirectional traversal.

3. **Reversal** uses three pointers (prev, current, after) and runs in O(n) time with O(1) space.

4. **Merging sorted lists** is a key building block  - it is exactly the merge step in merge sort.

---

## What's Next?

Two of the most important data structures built on linked lists are **stacks** and **queues**. Continue to the [Stacks and Queues Interactive Guide]({{ site.baseurl }}/stacks-and-queues/) to see LIFO and FIFO in action.

Explore the full [DSA in Python series]({{ site.baseurl }}/dsa/).
