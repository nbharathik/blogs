---
layout: post
title: "Binary Trees and BST"
author: bharathikannan
categories: [Data Structures]
description: "Build and explore binary search trees interactively. Traversals, insertion, deletion, search  - all visualized step by step."
permalink: /binary-trees-and-bst/
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

A tree is a hierarchical data structure consisting of nodes connected by edges. Unlike linear structures (arrays, linked lists), trees model hierarchical relationships: file systems, HTML DOM, organization charts. A binary tree is a tree where each node has at most two children (left and right). A binary search tree (BST) adds a critical ordering property: for every node, all values in its left subtree are smaller, and all values in its right subtree are larger. This property enables O(log n) search, insert, and delete.

This guide covers the three classic tree traversals (inorder, preorder, postorder), BST insertion that maintains the ordering property, BST search as binary search applied to a tree, and BST deletion with its three distinct cases.

---

## Tree Traversals

There are three classic ways to visit every node in a binary tree. Each visits the left subtree, the right subtree, and the root, but in a different order. Inorder (Left, Root, Right) visits BST nodes in sorted order, preorder (Root, Left, Right) is useful for copying or serializing a tree, and postorder (Left, Right, Root) is the natural choice when deleting a tree because children are freed before their parent.

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
  <div class="demo-caption">Settings: BST built from [50, 30, 70, 20, 40, 60, 80]. Yellow is the current node, gray nodes have been visited, and the output array builds as nodes are visited.</div>
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

To insert a value into a BST, we compare it with the current node and go left (if smaller) or right (if larger) until we find an empty spot. This preserves the BST invariant at every node: all left subtree values are smaller, and all right subtree values are larger. Insertion is therefore a guided search followed by one pointer update, which is why balanced trees stay efficient.

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

Time complexity: O(h) where h is the height. In a balanced BST, h = O(log n). In the worst case (skewed tree), h = O(n).

<div class="interactive-demo">
  <canvas id="bst-insert-canvas" width="680" height="320"></canvas>
  <div class="demo-controls">
    <label>Value: <input type="number" id="bst-insert-value" value="45" style="width:60px;"></label>
    <button id="bst-insert-btn">Insert</button>
    <button id="bst-insert-reset">Reset</button>
  </div>
  <div class="demo-info" id="bst-insert-info">BST: [50, 30, 70, 20, 40, 60, 80]</div>
  <div class="demo-caption">Settings: starting BST [50, 30, 70, 20, 40, 60, 80]. The algorithm traverses the tree comparing at each node, then places the new node in purple.</div>
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

Searching a BST follows the same path as insertion: compare the target with the current node and go left or right. You never need to explore both branches. Each comparison discards half of the remaining possibilities in a balanced tree. That is why BST search can be logarithmic when height stays small.

<div class="interactive-demo">
  <canvas id="bst-search-canvas" width="680" height="300"></canvas>
  <div class="demo-controls">
    <label>Target: <input type="number" id="bst-search-value" value="40" style="width:60px;"></label>
    <button id="bst-search-step">Step</button>
    <button id="bst-search-run">Run</button>
    <button id="bst-search-reset">Reset</button>
  </div>
  <div class="demo-info" id="bst-search-info">Ready</div>
  <div class="demo-caption">Settings: BST [50, 30, 70, 20, 40, 60, 80], default target 40. Green means found, and the highlighted path shows exactly how it got there.</div>
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

Deleting a node from a BST has three cases. If the node is a leaf with no children, you simply remove it. If it has one child, you replace the node with that child. If it has two children, you find the inorder successor (the smallest value in the right subtree), replace the node's value with it, and then delete the successor from its original position.

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

<div class="interactive-demo">
  <canvas id="bst-delete-canvas" width="680" height="320"></canvas>
  <div class="demo-controls">
    <label>Delete: <input type="number" id="bst-delete-value" value="30" style="width:60px;"></label>
    <button id="bst-delete-btn">Delete</button>
    <button id="bst-delete-reset">Reset</button>
  </div>
  <div class="demo-info" id="bst-delete-info">BST: [50, 30, 70, 20, 40, 60, 80]</div>
  <div class="demo-caption">Settings: BST [50, 30, 70, 20, 40, 60, 80]. Try deleting a leaf (20), a node with one child (30), and a node with two children (50).</div>
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

| Concept | Key Idea |
|---|---|
| Binary Tree | Hierarchical structure with at most two children per node. |
| BST Property | Left subtree values are smaller, right subtree values are larger than the root. |
| Traversals | Inorder gives sorted order, preorder serializes, postorder deletes safely. |
| Time Complexity | Search, insert, and delete are O(h); balanced trees give O(log n). |
| Deletion Cases | Leaf, one child, or two children (which requires the inorder successor). |
| Balancing | Use AVL or Red-Black trees to guarantee O(log n) regardless of insertion order. |

To guarantee O(log n) performance regardless of insertion order, use a self-balancing tree like AVL or Red-Black, covered in the [Balanced Trees Interactive Guide]({{ site.baseurl }}/balanced-trees/).

---

## What's Next?

BSTs can become unbalanced (imagine inserting 1, 2, 3, 4, 5 in order). **AVL trees** and **Red-Black trees** solve this with automatic rebalancing. Continue to the [Balanced Trees Interactive Guide]({{ site.baseurl }}/balanced-trees/).

Explore the full [DSA in Python series]({{ site.baseurl }}/dsa/).
