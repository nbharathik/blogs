---
layout: post
title: "Binary Trees and BST: An Interactive Guide"
author: bharathikannan
categories: [Data Structures]
description: "Build and explore binary search trees interactively. Traversals, insertion, deletion, search  - all visualized step by step."
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
window.DSA_Tree = (function() {
  function getColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg: dark ? '#1a1b26' : '#ffffff',
      node: dark ? '#7aa2f7' : '#2563eb',
      nodeVisited: dark ? '#565f89' : '#d1d5db',
      nodeCurrent: dark ? '#ff9e64' : '#f59e0b',
      nodeFound: dark ? '#9ece6a' : '#16a34a',
      nodeNew: dark ? '#bb9af7' : '#7c3aed',
      nodeDelete: dark ? '#f7768e' : '#e63946',
      nodePath: dark ? '#ff9e64' : '#f59e0b',
      edge: dark ? '#565f89' : '#9ca3af',
      edgeHighlight: dark ? '#ff9e64' : '#f59e0b',
      text: dark ? '#c0caf5' : '#1a1b26',
      textOnNode: '#ffffff',
      textMuted: dark ? '#565f89' : '#6b7280'
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

  // BST node constructor
  function BSTNode(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }

  // Insert into BST
  function bstInsert(root, val) {
    if (!root) return new BSTNode(val);
    if (val < root.val) root.left = bstInsert(root.left, val);
    else if (val > root.val) root.right = bstInsert(root.right, val);
    return root;
  }

  // Build BST from array
  function buildBST(arr) {
    var root = null;
    arr.forEach(function(v) { root = bstInsert(root, v); });
    return root;
  }

  // Compute positions for tree rendering
  // Returns flat array: [{ val, x, y, left, right }]
  function layoutTree(root, w, h) {
    if (!root) return [];
    var padT = 40, padB = 20, levelH = 60;
    var positions = [];

    function computePositions(node, depth, left, right) {
      if (!node) return;
      var x = (left + right) / 2;
      var y = padT + depth * levelH;
      positions.push({ val: node.val, x: x, y: y, node: node });
      computePositions(node.left, depth + 1, left, x);
      computePositions(node.right, depth + 1, x, right);
    }

    computePositions(root, 0, 30, w - 30);
    return positions;
  }

  // Draw a tree
  // highlights: { val: 'current'|'visited'|'found'|'new'|'delete'|'path' }
  function drawTree(ctx, root, w, h, highlights) {
    var c = getColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    if (!root) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Empty tree', w / 2, h / 2);
      return;
    }

    var positions = layoutTree(root, w, h);
    highlights = highlights || {};

    // Draw edges first
    function drawEdges(node, depth, left, right) {
      if (!node) return;
      var x = (left + right) / 2;
      var y = 40 + depth * 60;
      if (node.left) {
        var cx = (left + x) / 2;
        var cy = 40 + (depth + 1) * 60;
        var hl = highlights[node.left.val];
        ctx.strokeStyle = (hl === 'path' || hl === 'current') ? c.edgeHighlight : c.edge;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + NODE_R);
        ctx.lineTo(cx, cy - NODE_R);
        ctx.stroke();
        drawEdges(node.left, depth + 1, left, x);
      }
      if (node.right) {
        var cx2 = (x + right) / 2;
        var cy2 = 40 + (depth + 1) * 60;
        var hl2 = highlights[node.right.val];
        ctx.strokeStyle = (hl2 === 'path' || hl2 === 'current') ? c.edgeHighlight : c.edge;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + NODE_R);
        ctx.lineTo(cx2, cy2 - NODE_R);
        ctx.stroke();
        drawEdges(node.right, depth + 1, x, right);
      }
    }
    drawEdges(root, 0, 30, w - 30);

    // Draw nodes
    positions.forEach(function(p) {
      var hl = highlights[p.val];
      var col = c.node;
      if (hl === 'current') col = c.nodeCurrent;
      else if (hl === 'visited') col = c.nodeVisited;
      else if (hl === 'found') col = c.nodeFound;
      else if (hl === 'new') col = c.nodeNew;
      else if (hl === 'delete') col = c.nodeDelete;
      else if (hl === 'path') col = c.nodePath;

      ctx.beginPath();
      ctx.arc(p.x, p.y, NODE_R, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      ctx.fillStyle = c.textOnNode;
      ctx.font = 'bold 13px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.val, p.x, p.y + 5);
    });
  }

  // Traversal state generators
  function inorderStates(root) {
    var states = [];
    var visited = {};
    function inorder(node) {
      if (!node) return;
      inorder(node.left);
      visited[node.val] = 'visited';
      var hl = {};
      for (var k in visited) hl[k] = visited[k];
      hl[node.val] = 'current';
      states.push({ highlights: hl, info: 'Visit ' + node.val, output: Object.keys(visited).filter(function(k) { return visited[k]; }).map(Number) });
      inorder(node.right);
    }
    states.push({ highlights: {}, info: 'Start inorder traversal (Left, Root, Right)', output: [] });
    inorder(root);
    var allVisited = {};
    states[states.length - 1].output.forEach(function(v) { allVisited[v] = 'found'; });
    states.push({ highlights: allVisited, info: 'Inorder complete!', output: states[states.length - 1].output });
    return states;
  }

  function preorderStates(root) {
    var states = [];
    var visited = {};
    var order = [];
    function preorder(node) {
      if (!node) return;
      order.push(node.val);
      visited[node.val] = 'visited';
      var hl = {};
      for (var k in visited) hl[k] = visited[k];
      hl[node.val] = 'current';
      states.push({ highlights: hl, info: 'Visit ' + node.val, output: order.slice() });
      preorder(node.left);
      preorder(node.right);
    }
    states.push({ highlights: {}, info: 'Start preorder traversal (Root, Left, Right)', output: [] });
    preorder(root);
    var allVisited = {};
    order.forEach(function(v) { allVisited[v] = 'found'; });
    states.push({ highlights: allVisited, info: 'Preorder complete!', output: order });
    return states;
  }

  function postorderStates(root) {
    var states = [];
    var visited = {};
    var order = [];
    function postorder(node) {
      if (!node) return;
      postorder(node.left);
      postorder(node.right);
      order.push(node.val);
      visited[node.val] = 'visited';
      var hl = {};
      for (var k in visited) hl[k] = visited[k];
      hl[node.val] = 'current';
      states.push({ highlights: hl, info: 'Visit ' + node.val, output: order.slice() });
    }
    states.push({ highlights: {}, info: 'Start postorder traversal (Left, Right, Root)', output: [] });
    postorder(root);
    var allVisited = {};
    order.forEach(function(v) { allVisited[v] = 'found'; });
    states.push({ highlights: allVisited, info: 'Postorder complete!', output: order });
    return states;
  }

  // Search states
  function searchStates(root, target) {
    var states = [];
    var node = root;
    states.push({ highlights: {}, info: 'Search for ' + target });
    while (node) {
      var hl = {};
      hl[node.val] = 'current';
      if (node.val === target) {
        hl[node.val] = 'found';
        states.push({ highlights: hl, info: 'Found ' + target + '!' });
        return states;
      } else if (target < node.val) {
        states.push({ highlights: hl, info: target + ' < ' + node.val + ', go left' });
        node = node.left;
      } else {
        states.push({ highlights: hl, info: target + ' > ' + node.val + ', go right' });
        node = node.right;
      }
    }
    states.push({ highlights: {}, info: target + ' not found in tree' });
    return states;
  }

  var themeCallbacks = [];
  function onThemeChange(cb) { themeCallbacks.push(cb); }
  var observer = new MutationObserver(function() {
    themeCallbacks.forEach(function(cb) { cb(); });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    getColors: getColors, setupCanvas: setupCanvas, drawTree: drawTree,
    BSTNode: BSTNode, bstInsert: bstInsert, buildBST: buildBST,
    inorderStates: inorderStates, preorderStates: preorderStates,
    postorderStates: postorderStates, searchStates: searchStates,
    NODE_R: NODE_R, onThemeChange: onThemeChange
  };
})();
</script>

A **tree** is a hierarchical data structure consisting of nodes connected by edges. Unlike linear structures (arrays, linked lists), trees model hierarchical relationships: file systems, HTML DOM, organization charts.

A **binary tree** is a tree where each node has at most **two children** (left and right). A **binary search tree (BST)** adds a critical ordering property: for every node, all values in its left subtree are smaller, and all values in its right subtree are larger. This property enables O(log n) search, insert, and delete.

By the end of this guide you will understand:
- **Tree traversals**  - inorder, preorder, postorder
- **BST insertion**  - maintaining the ordering property
- **BST search**  - binary search on a tree structure
- **BST deletion**  - the three cases

<div class="demo-hint">
<strong>How to use the demos:</strong> Step through each algorithm and watch nodes highlight as they are visited. Insert and delete values to see the tree restructure.
</div>

---

## Tree Traversals

There are three classic ways to visit every node in a binary tree. Each visits the left subtree, the right subtree, and the root  - but in a different order.

- **Inorder** (Left, Root, Right)  - visits BST nodes in **sorted order**
- **Preorder** (Root, Left, Right)  - useful for copying/serializing a tree
- **Postorder** (Left, Right, Root)  - useful for deleting a tree

### Python Implementation

```python
def inorder(node):
    if node:
        inorder(node.left)
        print(node.data)
        inorder(node.right)

def preorder(node):
    if node:
        print(node.data)
        preorder(node.left)
        preorder(node.right)

def postorder(node):
    if node:
        postorder(node.left)
        postorder(node.right)
        print(node.data)
```

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> Choose a traversal order and step through. The yellow node is currently being visited. Gray nodes have been visited. The output array builds as nodes are visited.
</div>

<div class="interactive-demo">
  <canvas id="traversal-canvas" width="680" height="300"></canvas>
  <div class="demo-controls">
    <button id="trav-inorder" class="active">Inorder</button>
    <button id="trav-preorder">Preorder</button>
    <button id="trav-postorder">Postorder</button>
    <span style="color:var(--text-secondary);">|</span>
    <button id="trav-step">Step</button>
    <button id="trav-run">Run</button>
    <button id="trav-reset">Reset</button>
    <label>Speed: <input type="range" id="trav-speed" min="1" max="10" value="4"> <span class="demo-value" id="trav-speed-val">4</span></label>
  </div>
  <div class="demo-info" id="trav-info">Output: [] | Ready</div>
</div>

<script>
(function() {
  var T = window.DSA_Tree;
  var canvas = document.getElementById('traversal-canvas');
  var W = 680, H = 300;
  var ctx = T.setupCanvas(canvas, W, H);
  var root = T.buildBST([50, 30, 70, 20, 40, 60, 80]);
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;
  var mode = 'inorder';

  function init() {
    if (mode === 'inorder') states = T.inorderStates(root);
    else if (mode === 'preorder') states = T.preorderStates(root);
    else states = T.postorderStates(root);
    step = 0; running = false;
    if (timer) clearTimeout(timer);
    draw();
  }

  function draw() {
    var st = states[step] || states[0];
    T.drawTree(ctx, root, W, H, st.highlights);
    var output = st.output ? '[' + st.output.join(', ') + ']' : '[]';
    document.getElementById('trav-info').textContent = 'Output: ' + output + ' | ' + st.info;
  }

  function advance() {
    if (step < states.length - 1) {
      step++; draw();
      if (running) {
        var speed = parseInt(document.getElementById('trav-speed').value) || 4;
        timer = setTimeout(advance, Math.max(150, 1200 - speed * 110));
      }
    } else { running = false; document.getElementById('trav-run').textContent = 'Run'; }
  }

  init();
  T.onThemeChange(draw);

  function setMode(m) {
    mode = m;
    document.getElementById('trav-inorder').className = m === 'inorder' ? 'active' : '';
    document.getElementById('trav-preorder').className = m === 'preorder' ? 'active' : '';
    document.getElementById('trav-postorder').className = m === 'postorder' ? 'active' : '';
    init();
  }
  document.getElementById('trav-inorder').onclick = function() { setMode('inorder'); };
  document.getElementById('trav-preorder').onclick = function() { setMode('preorder'); };
  document.getElementById('trav-postorder').onclick = function() { setMode('postorder'); };
  document.getElementById('trav-step').onclick = function() {
    running = false; if (timer) clearTimeout(timer);
    document.getElementById('trav-run').textContent = 'Run';
    advance();
  };
  document.getElementById('trav-run').onclick = function() {
    if (running) { running = false; if (timer) clearTimeout(timer); this.textContent = 'Run'; }
    else { if (step >= states.length - 1) init(); running = true; this.textContent = 'Pause'; advance(); }
  };
  document.getElementById('trav-reset').onclick = init;
  document.getElementById('trav-speed').oninput = function() {
    document.getElementById('trav-speed-val').textContent = this.value;
  };
})();
</script>

---

## BST Insertion

To insert a value into a BST, we compare it with the current node and go left (if smaller) or right (if larger) until we find an empty spot.

This preserves the BST invariant at every node: all left subtree values are smaller, and all right subtree values are larger. Insertion is therefore a guided search followed by one pointer update, which is why balanced trees stay efficient.

### Python Implementation

```python
class BST:
    def __init__(self):
        self.root = None

    def insert(self, data):
        if not self.root:
            self.root = Node(data)
            return

        current = self.root
        while current:
            if data < current.data:
                if not current.left:
                    current.left = Node(data)
                    return
                current = current.left
            elif data > current.data:
                if not current.right:
                    current.right = Node(data)
                    return
                current = current.right
            else:
                return  # duplicate, ignore
```

**Time complexity:** O(h) where h is the height. In a balanced BST, h = O(log n). In the worst case (skewed tree), h = O(n).

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> Enter a value and click <strong>Insert</strong>. Watch the algorithm traverse the tree comparing at each node, then place the new node (shown in purple).
</div>

<div class="interactive-demo">
  <canvas id="bst-insert-canvas" width="680" height="320"></canvas>
  <div class="demo-controls">
    <label>Value: <input type="number" id="bst-insert-value" value="45" style="width:60px;"></label>
    <button id="bst-insert-btn">Insert</button>
    <button id="bst-insert-reset">Reset</button>
  </div>
  <div class="demo-info" id="bst-insert-info">BST: [50, 30, 70, 20, 40, 60, 80]</div>
</div>

<script>
(function() {
  var T = window.DSA_Tree;
  var canvas = document.getElementById('bst-insert-canvas');
  var W = 680, H = 320;
  var ctx = T.setupCanvas(canvas, W, H);
  var values = [50, 30, 70, 20, 40, 60, 80];
  var root = T.buildBST(values);

  function draw(hl) {
    T.drawTree(ctx, root, W, H, hl || {});
    document.getElementById('bst-insert-info').textContent = 'BST: [' + values.join(', ') + ']';
  }

  draw();
  T.onThemeChange(function() { draw(); });

  document.getElementById('bst-insert-btn').onclick = function() {
    var val = parseInt(document.getElementById('bst-insert-value').value);
    if (isNaN(val) || values.indexOf(val) >= 0) return;
    // Animate the search path then insert
    var path = [];
    var node = root;
    while (node) {
      path.push(node.val);
      if (val < node.val) node = node.left;
      else node = node.right;
    }
    var i = 0;
    function animatePath() {
      if (i < path.length) {
        var hl = {};
        for (var j = 0; j < i; j++) hl[path[j]] = 'path';
        hl[path[i]] = 'current';
        draw(hl);
        document.getElementById('bst-insert-info').textContent = val + (val < path[i] ? ' < ' : ' > ') + path[i] + ', go ' + (val < path[i] ? 'left' : 'right');
        i++;
        setTimeout(animatePath, 500);
      } else {
        // Insert
        values.push(val);
        root = T.bstInsert(root, val);
        var hl2 = {};
        hl2[val] = 'new';
        draw(hl2);
        document.getElementById('bst-insert-info').textContent = 'Inserted ' + val + '!';
        setTimeout(function() { draw(); }, 1000);
      }
    }
    animatePath();
  };
  document.getElementById('bst-insert-reset').onclick = function() {
    values = [50, 30, 70, 20, 40, 60, 80];
    root = T.buildBST(values);
    draw();
  };
})();
</script>

---

## BST Search

Searching a BST follows the same path as insertion: compare the target with the current node and go left or right.

You never need to explore both branches. Each comparison discards half of the remaining possibilities in a balanced tree. That is why BST search can be logarithmic when height stays small.

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> Enter a value and click <strong>Search</strong>. Watch the algorithm follow the comparison path. Green means found, and the path shows exactly how it got there.
</div>

<div class="interactive-demo">
  <canvas id="bst-search-canvas" width="680" height="300"></canvas>
  <div class="demo-controls">
    <label>Target: <input type="number" id="bst-search-value" value="40" style="width:60px;"></label>
    <button id="bst-search-step">Step</button>
    <button id="bst-search-run">Run</button>
    <button id="bst-search-reset">Reset</button>
  </div>
  <div class="demo-info" id="bst-search-info">Ready</div>
</div>

<script>
(function() {
  var T = window.DSA_Tree;
  var canvas = document.getElementById('bst-search-canvas');
  var W = 680, H = 300;
  var ctx = T.setupCanvas(canvas, W, H);
  var root = T.buildBST([50, 30, 70, 20, 40, 60, 80]);
  var states = [];
  var step = 0;
  var running = false;
  var timer = null;

  function init() {
    var target = parseInt(document.getElementById('bst-search-value').value) || 40;
    states = T.searchStates(root, target);
    step = 0; running = false;
    if (timer) clearTimeout(timer);
    draw();
  }

  function draw() {
    var st = states[step] || states[0];
    T.drawTree(ctx, root, W, H, st.highlights);
    document.getElementById('bst-search-info').textContent = st.info;
  }

  function advance() {
    if (step < states.length - 1) {
      step++; draw();
      if (running) timer = setTimeout(advance, 700);
    } else { running = false; document.getElementById('bst-search-run').textContent = 'Run'; }
  }

  init();
  T.onThemeChange(draw);

  document.getElementById('bst-search-step').onclick = function() {
    running = false; if (timer) clearTimeout(timer);
    document.getElementById('bst-search-run').textContent = 'Run';
    advance();
  };
  document.getElementById('bst-search-run').onclick = function() {
    if (running) { running = false; if (timer) clearTimeout(timer); this.textContent = 'Run'; }
    else { if (step >= states.length - 1) init(); running = true; this.textContent = 'Pause'; advance(); }
  };
  document.getElementById('bst-search-reset').onclick = init;
  document.getElementById('bst-search-value').onchange = init;
})();
</script>

---

## BST Deletion

Deleting a node from a BST has three cases:
1. **Leaf node** (no children)  - simply remove it
2. **One child**  - replace the node with its child
3. **Two children**  - find the **inorder successor** (smallest value in the right subtree), replace the node's value with it, then delete the successor

### Python Implementation

```python
def delete(self, root, data):
    if not root:
        return root

    if data < root.data:
        root.left = self.delete(root.left, data)
    elif data > root.data:
        root.right = self.delete(root.right, data)
    else:
        # Case 1 & 2: no child or one child
        if not root.left:
            return root.right
        if not root.right:
            return root.left

        # Case 3: two children
        successor = root.right
        while successor.left:
            successor = successor.left
        root.data = successor.data
        root.right = self.delete(root.right, successor.data)

    return root
```

### Interactive Visualization

<div class="demo-hint">
<strong>Interactive:</strong> Enter a value to delete. The algorithm highlights the node in red, then restructures the tree. Try deleting a leaf (20), a node with one child (30), and a node with two children (50).
</div>

<div class="interactive-demo">
  <canvas id="bst-delete-canvas" width="680" height="320"></canvas>
  <div class="demo-controls">
    <label>Delete: <input type="number" id="bst-delete-value" value="30" style="width:60px;"></label>
    <button id="bst-delete-btn">Delete</button>
    <button id="bst-delete-reset">Reset</button>
  </div>
  <div class="demo-info" id="bst-delete-info">BST: [50, 30, 70, 20, 40, 60, 80]</div>
</div>

<script>
(function() {
  var T = window.DSA_Tree;
  var canvas = document.getElementById('bst-delete-canvas');
  var W = 680, H = 320;
  var ctx = T.setupCanvas(canvas, W, H);
  var values = [50, 30, 70, 20, 40, 60, 80];
  var root = T.buildBST(values);

  function draw(hl) {
    T.drawTree(ctx, root, W, H, hl || {});
    document.getElementById('bst-delete-info').textContent = 'BST: [' + values.join(', ') + ']';
  }

  function deleteFromBST(node, val) {
    if (!node) return null;
    if (val < node.val) { node.left = deleteFromBST(node.left, val); return node; }
    if (val > node.val) { node.right = deleteFromBST(node.right, val); return node; }
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    var succ = node.right;
    while (succ.left) succ = succ.left;
    node.val = succ.val;
    node.right = deleteFromBST(node.right, succ.val);
    return node;
  }

  draw();
  T.onThemeChange(function() { draw(); });

  document.getElementById('bst-delete-btn').onclick = function() {
    var val = parseInt(document.getElementById('bst-delete-value').value);
    if (isNaN(val) || values.indexOf(val) < 0) return;
    // Highlight then delete
    var hl = {};
    hl[val] = 'delete';
    draw(hl);
    document.getElementById('bst-delete-info').textContent = 'Deleting ' + val + '...';
    setTimeout(function() {
      root = deleteFromBST(root, val);
      values = values.filter(function(v) { return v !== val; });
      draw();
    }, 800);
  };
  document.getElementById('bst-delete-reset').onclick = function() {
    values = [50, 30, 70, 20, 40, 60, 80];
    root = T.buildBST(values);
    draw();
  };
})();
</script>

---

## Key Takeaways

1. **Binary trees** are hierarchical structures with at most two children per node. **BSTs** add the ordering property (left < root < right).

2. **Traversals** visit every node: inorder gives sorted order, preorder is useful for serialization, postorder for deletion.

3. **BST operations** (search, insert, delete) are all O(h), where h is the height. A balanced BST has h = O(log n), but a skewed BST has h = O(n).

4. **Deletion** is the most complex operation with three cases. The two-children case requires finding the inorder successor.

5. To guarantee O(log n) performance, use **self-balancing trees** like AVL or Red-Black trees  - covered in the [Balanced Trees Interactive Guide]({{ site.baseurl }}/balanced-trees-interactive/).

---

## What's Next?

BSTs can become unbalanced (imagine inserting 1, 2, 3, 4, 5 in order). **AVL trees** and **Red-Black trees** solve this with automatic rebalancing. Continue to the [Balanced Trees Interactive Guide]({{ site.baseurl }}/balanced-trees-interactive/).

Explore the full [DSA in Python series]({{ site.baseurl }}/dsa/).
