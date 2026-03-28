---
layout: post
title: "Balanced Trees: An Interactive Guide to AVL and Red-Black Trees"
author: bharathikannan
categories: [Data Structures]
description: "Understand self-balancing BSTs through interactive visualizations. AVL rotations, Red-Black recoloring  - all animated step by step."
permalink: /balanced-trees/
hidden: true
---

<style>
.interactive-demo { border: 1px solid var(--border); border-radius: 12px; padding: 1.2rem; margin: 1.5rem 0; background: var(--bg-secondary); overflow: hidden; }
.interactive-demo canvas { display: block; margin: 0 auto; max-width: 100%; border-radius: 8px; }
.demo-controls { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-top: 0.75rem; font-size: 0.9rem; }
.demo-controls label { display: flex; align-items: center; gap: 0.4rem; font-weight: 500; }
.demo-controls input[type="range"] { width: 160px; accent-color: var(--accent); }
.demo-controls input[type="number"] { width: 70px; padding: 0.3rem 0.5rem; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; }
.demo-controls input[type="text"] { width: 200px; padding: 0.3rem 0.5rem; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem; font-family: 'JetBrains Mono', monospace; }
.demo-controls button { padding: 0.4rem 1rem; border: 1px solid var(--accent); border-radius: 6px; background: transparent; color: var(--accent); cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: background 0.15s, color 0.15s; }
.demo-controls button:hover { background: var(--accent); color: var(--bg-primary); }
.demo-controls button.active { background: var(--accent); color: var(--bg-primary); }
.demo-controls .demo-value { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; min-width: 4rem; }
.demo-info { margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }
.demo-hint { background: var(--bg-secondary); border-left: 3px solid var(--accent); padding: 0.6rem 0.9rem; margin: 1rem 0; border-radius: 0 6px 6px 0; font-size: 0.85rem; color: var(--text-secondary); }
.comparison-table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
.comparison-table th, .comparison-table td { padding: 0.6rem 1rem; border: 1px solid var(--border); text-align: left; }
.comparison-table th { background: var(--bg-secondary); font-weight: 600; }
.comparison-table tr:nth-child(even) td { background: var(--bg-secondary); }
@media (max-width: 640px) { .demo-controls input[type="range"] { width: 120px; } }
</style>

<script>
window.DSA_Bal = (function() {
  function getColors() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      bg: dark ? '#1a1b26' : '#ffffff',
      node: dark ? '#7aa2f7' : '#2563eb',
      nodeHighlight: dark ? '#ff9e64' : '#f59e0b',
      nodeImbalanced: dark ? '#f7768e' : '#e63946',
      nodeNew: dark ? '#bb9af7' : '#7c3aed',
      nodeBalanced: dark ? '#9ece6a' : '#16a34a',
      nodeRed: dark ? '#f7768e' : '#dc2626',
      nodeBlack: dark ? '#414868' : '#1e293b',
      edge: dark ? '#565f89' : '#9ca3af',
      edgeHighlight: dark ? '#ff9e64' : '#f59e0b',
      text: dark ? '#c0caf5' : '#1a1b26',
      textOnNode: '#ffffff',
      textMuted: dark ? '#565f89' : '#6b7280',
      balanceFactor: dark ? '#ff9e64' : '#ea580c',
      balanceOk: dark ? '#9ece6a' : '#16a34a'
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

  // --- AVL Node ---
  function AVLNode(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
  }

  function avlHeight(node) {
    return node ? node.height : 0;
  }

  function avlBalanceFactor(node) {
    return node ? avlHeight(node.left) - avlHeight(node.right) : 0;
  }

  function avlUpdateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(avlHeight(node.left), avlHeight(node.right));
    }
  }

  function avlRotateRight(y) {
    var x = y.left;
    var T2 = x.right;
    x.right = y;
    y.left = T2;
    avlUpdateHeight(y);
    avlUpdateHeight(x);
    return x;
  }

  function avlRotateLeft(x) {
    var y = x.right;
    var T2 = y.left;
    y.left = x;
    x.right = T2;
    avlUpdateHeight(x);
    avlUpdateHeight(y);
    return y;
  }

  function avlInsert(root, val) {
    if (!root) return new AVLNode(val);
    if (val < root.val) root.left = avlInsert(root.left, val);
    else if (val > root.val) root.right = avlInsert(root.right, val);
    else return root;

    avlUpdateHeight(root);
    var bf = avlBalanceFactor(root);

    // LL
    if (bf > 1 && val < root.left.val) return avlRotateRight(root);
    // RR
    if (bf < -1 && val > root.right.val) return avlRotateLeft(root);
    // LR
    if (bf > 1 && val > root.left.val) {
      root.left = avlRotateLeft(root.left);
      return avlRotateRight(root);
    }
    // RL
    if (bf < -1 && val < root.right.val) {
      root.right = avlRotateRight(root.right);
      return avlRotateLeft(root);
    }

    return root;
  }

  function buildAVL(arr) {
    var root = null;
    arr.forEach(function(v) { root = avlInsert(root, v); });
    return root;
  }

  // --- Red-Black Node ---
  var RED = 'red';
  var BLACK = 'black';

  function RBNode(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.color = RED;
  }

  function rbRotateLeft(tree, x) {
    var y = x.right;
    x.right = y.left;
    if (y.left) y.left.parent = x;
    y.parent = x.parent;
    if (!x.parent) tree.root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  }

  function rbRotateRight(tree, y) {
    var x = y.left;
    y.left = x.right;
    if (x.right) x.right.parent = y;
    x.parent = y.parent;
    if (!y.parent) tree.root = x;
    else if (y === y.parent.left) y.parent.left = x;
    else y.parent.right = x;
    x.right = y;
    y.parent = x;
  }

  function rbFixInsert(tree, z) {
    while (z.parent && z.parent.color === RED) {
      if (z.parent === z.parent.parent.left) {
        var uncle = z.parent.parent.right;
        if (uncle && uncle.color === RED) {
          z.parent.color = BLACK;
          uncle.color = BLACK;
          z.parent.parent.color = RED;
          z = z.parent.parent;
        } else {
          if (z === z.parent.right) {
            z = z.parent;
            rbRotateLeft(tree, z);
          }
          z.parent.color = BLACK;
          z.parent.parent.color = RED;
          rbRotateRight(tree, z.parent.parent);
        }
      } else {
        var uncle2 = z.parent.parent.left;
        if (uncle2 && uncle2.color === RED) {
          z.parent.color = BLACK;
          uncle2.color = BLACK;
          z.parent.parent.color = RED;
          z = z.parent.parent;
        } else {
          if (z === z.parent.left) {
            z = z.parent;
            rbRotateRight(tree, z);
          }
          z.parent.color = BLACK;
          z.parent.parent.color = RED;
          rbRotateLeft(tree, z.parent.parent);
        }
      }
    }
    tree.root.color = BLACK;
  }

  function rbInsert(tree, val) {
    var z = new RBNode(val);
    var y = null;
    var x = tree.root;
    while (x) {
      y = x;
      if (val < x.val) x = x.left;
      else if (val > x.val) x = x.right;
      else return; // duplicate
    }
    z.parent = y;
    if (!y) tree.root = z;
    else if (val < y.val) y.left = z;
    else y.right = z;
    rbFixInsert(tree, z);
  }

  function buildRBTree(arr) {
    var tree = { root: null };
    arr.forEach(function(v) { rbInsert(tree, v); });
    return tree;
  }

  // --- Layout tree (recursive position computation) ---
  function layoutTree(root, w, padT, levelH) {
    padT = padT || 40;
    levelH = levelH || 60;
    if (!root) return [];
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

  // --- Draw AVL tree with balance factors ---
  function drawAVLTree(ctx, root, w, h, highlights) {
    var c = getColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    if (!root) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Empty tree  - insert a value to begin', w / 2, h / 2);
      return;
    }

    highlights = highlights || {};
    var positions = layoutTree(root, w, 40, 60);

    // Draw edges
    function drawEdges(node, depth, left, right) {
      if (!node) return;
      var x = (left + right) / 2;
      var y = 40 + depth * 60;
      if (node.left) {
        var cx = (left + x) / 2;
        var cy = 40 + (depth + 1) * 60;
        var hl = highlights[node.left.val];
        ctx.strokeStyle = (hl === 'highlight' || hl === 'imbalanced') ? c.edgeHighlight : c.edge;
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
        ctx.strokeStyle = (hl2 === 'highlight' || hl2 === 'imbalanced') ? c.edgeHighlight : c.edge;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + NODE_R);
        ctx.lineTo(cx2, cy2 - NODE_R);
        ctx.stroke();
        drawEdges(node.right, depth + 1, x, right);
      }
    }
    drawEdges(root, 0, 30, w - 30);

    // Draw nodes with balance factors
    positions.forEach(function(p) {
      var hl = highlights[p.val];
      var col = c.node;
      if (hl === 'highlight') col = c.nodeHighlight;
      else if (hl === 'imbalanced') col = c.nodeImbalanced;
      else if (hl === 'new') col = c.nodeNew;
      else if (hl === 'balanced') col = c.nodeBalanced;

      ctx.beginPath();
      ctx.arc(p.x, p.y, NODE_R, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      ctx.fillStyle = c.textOnNode;
      ctx.font = 'bold 13px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.val, p.x, p.y + 5);

      // Draw balance factor
      var bf = avlBalanceFactor(p.node);
      var bfColor = (bf >= -1 && bf <= 1) ? c.balanceOk : c.balanceFactor;
      ctx.fillStyle = bfColor;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText((bf >= 0 ? '+' : '') + bf, p.x + NODE_R + 3, p.y - 6);
    });
  }

  // --- Draw Red-Black tree ---
  function drawRBTree(ctx, root, w, h, highlights) {
    var c = getColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    if (!root) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Empty tree  - insert a value to begin', w / 2, h / 2);
      return;
    }

    highlights = highlights || {};
    var positions = layoutTree(root, w, 40, 60);

    // Draw edges
    function drawEdges(node, depth, left, right) {
      if (!node) return;
      var x = (left + right) / 2;
      var y = 40 + depth * 60;
      if (node.left) {
        var cx = (left + x) / 2;
        var cy = 40 + (depth + 1) * 60;
        ctx.strokeStyle = c.edge;
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
        ctx.strokeStyle = c.edge;
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
      var col;
      if (hl === 'highlight') {
        col = c.nodeHighlight;
      } else if (hl === 'new') {
        col = c.nodeNew;
      } else {
        col = p.node.color === RED ? c.nodeRed : c.nodeBlack;
      }

      // Draw outer ring for highlighted nodes
      if (hl === 'highlight' || hl === 'new') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, NODE_R + 3, 0, Math.PI * 2);
        ctx.strokeStyle = c.nodeHighlight;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, NODE_R, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      // Outline for black nodes in dark mode
      if (p.node.color === BLACK && !hl) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, NODE_R, 0, Math.PI * 2);
        ctx.strokeStyle = c.edge;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = c.textOnNode;
      ctx.font = 'bold 13px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.val, p.x, p.y + 5);

      // Color label below node
      var label = p.node.color === RED ? 'R' : 'B';
      ctx.fillStyle = p.node.color === RED ? c.nodeRed : c.textMuted;
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, p.x, p.y + NODE_R + 14);
    });
  }

  // --- Theme observer ---
  var themeCallbacks = [];
  function onThemeChange(cb) { themeCallbacks.push(cb); }
  var observer = new MutationObserver(function() {
    themeCallbacks.forEach(function(cb) { cb(); });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    getColors: getColors,
    setupCanvas: setupCanvas,
    NODE_R: NODE_R,
    AVLNode: AVLNode,
    avlHeight: avlHeight,
    avlBalanceFactor: avlBalanceFactor,
    avlUpdateHeight: avlUpdateHeight,
    avlRotateRight: avlRotateRight,
    avlRotateLeft: avlRotateLeft,
    avlInsert: avlInsert,
    buildAVL: buildAVL,
    RBNode: RBNode,
    RED: RED,
    BLACK: BLACK,
    rbRotateLeft: rbRotateLeft,
    rbRotateRight: rbRotateRight,
    rbFixInsert: rbFixInsert,
    rbInsert: rbInsert,
    buildRBTree: buildRBTree,
    layoutTree: layoutTree,
    drawAVLTree: drawAVLTree,
    drawRBTree: drawRBTree,
    onThemeChange: onThemeChange
  };
})();
</script>

In the [Binary Trees and BST guide]({{ site.baseurl }}/binary-trees-and-bst/), we saw that BST operations run in $$O(h)$$ time where $$h$$ is the height. In the best case $$h = O(\log n)$$, but if we insert values in sorted order we get a degenerate "linked list" tree with $$h = O(n)$$.

**Self-balancing BSTs** solve this by automatically restructuring after every insertion (and deletion), guaranteeing $$h = O(\log n)$$ regardless of insertion order. The two most important self-balancing BSTs are:

- **AVL trees**  - strictly balanced, at most 1 height difference between subtrees
- **Red-Black trees**  - relaxed balance using node coloring, used in most standard libraries

By the end of this guide you will understand:
- **Balance factor** and why height balance matters
- **AVL rotations**  - LL, RR, LR, RL
- **Red-Black properties**  - coloring rules and fix-up procedures
- When to choose AVL vs Red-Black in practice

<div class="demo-hint">
<strong>How to use the demos:</strong> Insert values one at a time and watch the tree rebalance. Step through to see each rotation or recoloring as it happens.
</div>

---

## Why Self-Balancing?

Consider inserting the values 1, 2, 3, 4, 5 into a plain BST:

```
1
 \
  2
   \
    3
     \
      4
       \
        5
```

This "right-skewed" tree has height 5. Searching for 5 requires visiting every node  - $$O(n)$$.

A balanced tree holding the same values:

```
      3
     / \
    2   4
   /     \
  1       5
```

This tree has height 3 and any search takes at most $$O(\log n)$$ comparisons.

Self-balancing BSTs enforce balance invariants after every modification, guaranteeing $$O(\log n)$$ for search, insert, and delete.

---

## AVL Trees

**AVL trees** (named after inventors **A**delson-**V**elsky and **L**andis, 1962) are the oldest self-balancing BST. They maintain a strict balance invariant:

> For every node, the **balance factor** (height of left subtree minus height of right subtree) must be $$-1$$, $$0$$, or $$+1$$.

$$
\text{Balance Factor}(n) = \text{height}(n.\text{left}) - \text{height}(n.\text{right})
$$

When an insertion violates this invariant, we restore balance using **rotations**.

### AVL Heights and Balance Factors

Each node stores its **height** (longest path to a leaf). A leaf has height 1, a null child has height 0.

```python
class AVLNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
        self.height = 1

def get_height(node):
    return node.height if node else 0

def get_balance(node):
    return get_height(node.left) - get_height(node.right) if node else 0
```

### The Four Rotation Types

When an insertion causes a node's balance factor to become $$+2$$ or $$-2$$, we apply one of four rotations:

#### 1. Right Rotation (LL case)

The imbalance is in the **left subtree of the left child**. We perform a **right rotation** at the imbalanced node.

```
Before:            After:
    z                 y
   / \              /   \
  y   T4           x     z
 / \              / \   / \
x   T3           T1 T2 T3 T4
/ \
T1 T2
```

```python
def rotate_right(z):
    y = z.left
    T3 = y.right

    y.right = z
    z.left = T3

    z.height = 1 + max(get_height(z.left), get_height(z.right))
    y.height = 1 + max(get_height(y.left), get_height(y.right))

    return y
```

#### 2. Left Rotation (RR case)

The imbalance is in the **right subtree of the right child**. We perform a **left rotation**.

```
Before:            After:
  z                   y
 / \                /   \
T1  y              z     x
   / \            / \   / \
  T2  x          T1 T2 T3 T4
     / \
    T3 T4
```

```python
def rotate_left(z):
    y = z.right
    T2 = y.left

    y.left = z
    z.right = T2

    z.height = 1 + max(get_height(z.left), get_height(z.right))
    y.height = 1 + max(get_height(y.left), get_height(y.right))

    return y
```

#### 3. Left-Right Rotation (LR case)

The imbalance is in the **right subtree of the left child**. We first left-rotate the left child, then right-rotate the root.

```
Before:           Step 1:           After:
    z                z                 x
   / \              / \              /   \
  y   T4           x   T4          y     z
 / \              / \             / \   / \
T1  x            y   T3         T1 T2 T3 T4
   / \          / \
  T2 T3        T1 T2
```

#### 4. Right-Left Rotation (RL case)

The imbalance is in the **left subtree of the right child**. We first right-rotate the right child, then left-rotate the root.

```
Before:           Step 1:           After:
  z                  z                 x
 / \                / \              /   \
T1  y              T1  x            z     y
   / \                / \          / \   / \
  x   T4            T2   y       T1 T2 T3 T4
 / \                    / \
T2 T3                  T3 T4
```

### Complete AVL Insert in Python

```python
class AVLTree:
    def __init__(self):
        self.root = None

    def insert(self, val):
        self.root = self._insert(self.root, val)

    def _insert(self, node, val):
        # Step 1: Standard BST insert
        if not node:
            return AVLNode(val)
        if val < node.val:
            node.left = self._insert(node.left, val)
        elif val > node.val:
            node.right = self._insert(node.right, val)
        else:
            return node  # no duplicates

        # Step 2: Update height
        node.height = 1 + max(
            get_height(node.left),
            get_height(node.right)
        )

        # Step 3: Get balance factor
        balance = get_balance(node)

        # Step 4: Rebalance if needed (4 cases)

        # LL  - left-left heavy
        if balance > 1 and val < node.left.val:
            return rotate_right(node)

        # RR  - right-right heavy
        if balance < -1 and val > node.right.val:
            return rotate_left(node)

        # LR  - left-right heavy
        if balance > 1 and val > node.left.val:
            node.left = rotate_left(node.left)
            return rotate_right(node)

        # RL  - right-left heavy
        if balance < -1 and val < node.right.val:
            node.right = rotate_right(node.right)
            return rotate_left(node)

        return node
```

**Time complexity:** $$O(\log n)$$ for insert, search, and delete  - guaranteed, since the tree height is always $$O(\log n)$$.

### Interactive AVL Demo

<div class="demo-hint">
<strong>Interactive:</strong> Insert values one at a time. The <span style="color:#ea580c;font-weight:bold;">balance factor</span> is shown next to each node. When a node becomes imbalanced (|BF| > 1), it turns <span style="color:#e63946;font-weight:bold;">red</span> and the rotation is animated. Use <strong>Step</strong> to insert one value from the queue, or <strong>Run</strong> to insert all automatically.
</div>

<div class="interactive-demo">
  <canvas id="avl-canvas" width="680" height="350"></canvas>
  <div class="demo-controls">
    <label>Value: <input type="number" id="avl-insert-value" value="25" style="width:60px;"></label>
    <button id="avl-insert-btn">Insert</button>
    <span style="color:var(--text-secondary);">|</span>
    <label>Queue: <input type="text" id="avl-queue" value="30,20,10" style="width:140px;" placeholder="e.g. 3,1,2"></label>
    <button id="avl-step-btn">Step</button>
    <button id="avl-run-btn">Run</button>
    <span style="color:var(--text-secondary);">|</span>
    <button id="avl-reset-btn">Reset</button>
    <label>Speed: <input type="range" id="avl-speed" min="1" max="10" value="4"> <span class="demo-value" id="avl-speed-val">4</span></label>
  </div>
  <div class="demo-info" id="avl-info">AVL Tree: empty | Insert values to begin</div>
</div>

<script>
(function() {
  var B = window.DSA_Bal;
  var canvas = document.getElementById('avl-canvas');
  var W = 680, H = 350;
  var ctx = B.setupCanvas(canvas, W, H);

  // Internal AVL tree with step-by-step tracking
  var root = null;
  var values = [];
  var animSteps = [];
  var animIndex = 0;
  var running = false;
  var timer = null;

  // Deep clone an AVL tree for snapshotting
  function cloneTree(node) {
    if (!node) return null;
    var n = new B.AVLNode(node.val);
    n.height = node.height;
    n.left = cloneTree(node.left);
    n.right = cloneTree(node.right);
    return n;
  }

  // Generate step-by-step animation states for an AVL insert
  function generateInsertSteps(rootBefore, val) {
    var steps = [];
    // Step 1: Show where the value will be inserted (BST path)
    var path = [];
    var node = rootBefore;
    while (node) {
      path.push(node.val);
      if (val < node.val) node = node.left;
      else if (val > node.val) node = node.right;
      else return steps; // duplicate
    }

    // Show search path
    for (var i = 0; i < path.length; i++) {
      var hl = {};
      for (var j = 0; j < i; j++) hl[path[j]] = 'highlight';
      hl[path[i]] = 'highlight';
      steps.push({
        tree: cloneTree(rootBefore),
        highlights: hl,
        info: 'Searching: ' + val + (val < path[i] ? ' < ' : ' > ') + path[i] + ', go ' + (val < path[i] ? 'left' : 'right')
      });
    }

    // Step 2: Insert the node (before balancing)  - use a simple BST insert
    var inserted = bstInsertOnly(cloneTree(rootBefore), val);
    var hlNew = {};
    hlNew[val] = 'new';
    steps.push({
      tree: inserted,
      highlights: hlNew,
      info: 'Inserted ' + val + ' as a new leaf'
    });

    // Step 3: Check for imbalance going back up
    // Find the first imbalanced ancestor
    var imbalancedVal = findImbalanced(inserted);
    if (imbalancedVal !== null) {
      var hlImb = {};
      hlImb[val] = 'new';
      hlImb[imbalancedVal] = 'imbalanced';
      var bfNode = findNode(inserted, imbalancedVal);
      var bf = B.avlBalanceFactor(bfNode);
      var rotationType = getRotationType(bfNode, val);
      steps.push({
        tree: cloneTree(inserted),
        highlights: hlImb,
        info: 'Imbalance at ' + imbalancedVal + ' (BF=' + bf + '). Need ' + rotationType + ' rotation'
      });
    }

    // Step 4: Show the balanced result
    var balanced = B.avlInsert(cloneTree(rootBefore), val);
    var hlDone = {};
    hlDone[val] = 'new';
    if (imbalancedVal !== null) {
      steps.push({
        tree: balanced,
        highlights: hlDone,
        info: 'Rotation complete! Tree is balanced.'
      });
    } else {
      steps.push({
        tree: balanced,
        highlights: hlDone,
        info: 'No rotation needed  - tree remains balanced.'
      });
    }

    // Step 5: Clean state
    steps.push({
      tree: balanced,
      highlights: {},
      info: 'AVL Tree: [' + values.concat([val]).sort(function(a,b){return a-b;}).join(', ') + ']'
    });

    return steps;
  }

  // Simple BST insert (no balancing) for visualization
  function bstInsertOnly(node, val) {
    if (!node) {
      var n = new B.AVLNode(val);
      return n;
    }
    if (val < node.val) node.left = bstInsertOnly(node.left, val);
    else if (val > node.val) node.right = bstInsertOnly(node.right, val);
    // Update heights
    B.avlUpdateHeight(node);
    return node;
  }

  // Find the first imbalanced node (nearest to leaves going up)
  function findImbalanced(node) {
    if (!node) return null;
    var leftResult = findImbalanced(node.left);
    if (leftResult !== null) return leftResult;
    var rightResult = findImbalanced(node.right);
    if (rightResult !== null) return rightResult;
    var bf = B.avlBalanceFactor(node);
    if (bf < -1 || bf > 1) return node.val;
    return null;
  }

  // Find a node by value
  function findNode(node, val) {
    if (!node) return null;
    if (node.val === val) return node;
    if (val < node.val) return findNode(node.left, val);
    return findNode(node.right, val);
  }

  // Determine rotation type
  function getRotationType(node, insertedVal) {
    var bf = B.avlBalanceFactor(node);
    if (bf > 1 && insertedVal < node.left.val) return 'LL (Right)';
    if (bf < -1 && insertedVal > node.right.val) return 'RR (Left)';
    if (bf > 1 && insertedVal > node.left.val) return 'LR (Left-Right)';
    if (bf < -1 && insertedVal < node.right.val) return 'RL (Right-Left)';
    return 'unknown';
  }

  function draw(tree, hl) {
    B.drawAVLTree(ctx, tree || root, W, H, hl || {});
  }

  function updateInfo(msg) {
    document.getElementById('avl-info').textContent = msg;
  }

  function getSpeed() {
    return parseInt(document.getElementById('avl-speed').value) || 4;
  }

  function getDelay() {
    return Math.max(200, 1400 - getSpeed() * 130);
  }

  function stopRunning() {
    running = false;
    if (timer) { clearTimeout(timer); timer = null; }
    document.getElementById('avl-run-btn').textContent = 'Run';
  }

  // Insert a single value with animation
  function doInsert(val, callback) {
    if (isNaN(val) || values.indexOf(val) >= 0) {
      updateInfo(isNaN(val) ? 'Enter a valid number' : val + ' already in tree');
      if (callback) callback();
      return;
    }

    var steps = generateInsertSteps(root, val);
    if (steps.length === 0) {
      updateInfo(val + ' is a duplicate');
      if (callback) callback();
      return;
    }

    var si = 0;
    function animateStep() {
      if (si < steps.length) {
        var s = steps[si];
        draw(s.tree, s.highlights);
        updateInfo(s.info);
        si++;
        if (si < steps.length) {
          timer = setTimeout(animateStep, getDelay());
        } else {
          // Commit the insert
          root = B.avlInsert(root, val);
          values.push(val);
          draw(root, {});
          if (callback) setTimeout(callback, 200);
        }
      }
    }
    animateStep();
  }

  // Get queue values
  function getQueue() {
    var text = document.getElementById('avl-queue').value.trim();
    if (!text) return [];
    return text.split(',').map(function(s) { return parseInt(s.trim()); }).filter(function(v) { return !isNaN(v); });
  }

  function setQueue(arr) {
    document.getElementById('avl-queue').value = arr.join(',');
  }

  // Init
  draw(root, {});
  B.onThemeChange(function() { draw(root, {}); });

  // Insert button
  document.getElementById('avl-insert-btn').onclick = function() {
    stopRunning();
    var val = parseInt(document.getElementById('avl-insert-value').value);
    doInsert(val, null);
  };

  // Step button  - take one value from queue
  document.getElementById('avl-step-btn').onclick = function() {
    stopRunning();
    var q = getQueue();
    if (q.length === 0) { updateInfo('Queue is empty  - add values to queue'); return; }
    var val = q.shift();
    setQueue(q);
    doInsert(val, null);
  };

  // Run button  - insert all queue values
  document.getElementById('avl-run-btn').onclick = function() {
    if (running) { stopRunning(); return; }
    var q = getQueue();
    if (q.length === 0) { updateInfo('Queue is empty  - add values to queue'); return; }
    running = true;
    document.getElementById('avl-run-btn').textContent = 'Pause';
    function runNext() {
      if (!running) return;
      var q2 = getQueue();
      if (q2.length === 0) { stopRunning(); return; }
      var val = q2.shift();
      setQueue(q2);
      doInsert(val, function() {
        if (running) runNext();
      });
    }
    runNext();
  };

  // Reset button
  document.getElementById('avl-reset-btn').onclick = function() {
    stopRunning();
    root = null;
    values = [];
    draw(root, {});
    updateInfo('AVL Tree: empty | Insert values to begin');
  };

  // Speed display
  document.getElementById('avl-speed').oninput = function() {
    document.getElementById('avl-speed-val').textContent = this.value;
  };
})();
</script>

<div class="demo-hint">
<strong>Try these sequences</strong> to see each rotation type:
<br>- <strong>LL:</strong> Reset, then queue <code>30,20,10</code>  - right rotation at 30
<br>- <strong>RR:</strong> Reset, then queue <code>10,20,30</code>  - left rotation at 10
<br>- <strong>LR:</strong> Reset, then queue <code>30,10,20</code>  - left-right rotation at 30
<br>- <strong>RL:</strong> Reset, then queue <code>10,30,20</code>  - right-left rotation at 10
</div>

---

## AVL Rotation Diagrams

To solidify your understanding, here is exactly what happens during each rotation:

### Right Rotation (LL Case)

When a node has $$\text{BF} = +2$$ and its left child has $$\text{BF} = +1$$:

```
    30 (BF=+2)              20 (BF=0)
   /                       /  \
  20 (BF=+1)    =>       10    30
 /                       (BF=0)(BF=0)
10 (BF=0)
```

The left child (20) becomes the new root of this subtree. The old root (30) becomes the right child.

### Left Rotation (RR Case)

When a node has $$\text{BF} = -2$$ and its right child has $$\text{BF} = -1$$:

```
10 (BF=-2)                  20 (BF=0)
  \                         /  \
   20 (BF=-1)    =>       10    30
     \                   (BF=0)(BF=0)
      30 (BF=0)
```

The right child (20) becomes the new root. The old root (10) becomes the left child.

### Left-Right Rotation (LR Case)

When a node has $$\text{BF} = +2$$ and its left child has $$\text{BF} = -1$$:

```
    30 (BF=+2)         30 (BF=+2)          20 (BF=0)
   /                  /                    /  \
  10 (BF=-1)  =>    20 (BF=+1)   =>     10    30
    \               /                   (BF=0)(BF=0)
     20 (BF=0)    10 (BF=0)
```

First left-rotate the left child, then right-rotate the root. Two rotations, hence "double rotation."

### Right-Left Rotation (RL Case)

When a node has $$\text{BF} = -2$$ and its right child has $$\text{BF} = +1$$:

```
10 (BF=-2)        10 (BF=-2)            20 (BF=0)
  \                  \                  /  \
   30 (BF=+1) =>     20 (BF=-1)  =>  10    30
  /                     \            (BF=0)(BF=0)
 20 (BF=0)               30 (BF=0)
```

First right-rotate the right child, then left-rotate the root.

---

## Red-Black Trees

**Red-Black trees** are a self-balancing BST used in many production systems: Java's `TreeMap`, C++ `std::map`, Linux kernel schedulers, and more.

Instead of maintaining strict height balance like AVL, Red-Black trees use **node coloring** to maintain a relaxed balance.

### Red-Black Properties

A Red-Black tree is a BST where every node is colored either **red** or **black**, and the following five properties hold:

1. **Every node is either red or black.**
2. **The root is always black.**
3. **Every null leaf (NIL) is black.** (We treat null pointers as black sentinel nodes.)
4. **Red rule:** If a node is red, both its children must be black. (No two consecutive red nodes on any path.)
5. **Black-height rule:** Every path from a node to any of its descendant NIL leaves contains the **same number of black nodes.**

These properties guarantee that the longest path is at most **twice** the shortest path, ensuring $$h = O(\log n)$$.

### Why These Properties Work

The black-height rule is the key insight. If every path from root to leaf has the same number of black nodes (say $$b$$), and red nodes cannot be consecutive, then:

- The **shortest** path has $$b$$ nodes (all black)
- The **longest** path has $$2b$$ nodes (alternating red-black)
- Therefore $$h \leq 2b = O(\log n)$$

### Red-Black Insert

When we insert a new node, it is always colored **red** (to preserve black-height). This may violate the red rule (red parent with red child). We fix this using **recoloring** and **rotations**.

There are three cases to fix (when the parent is red):

**Case 1: Uncle is red**  - Recolor parent, uncle to black; grandparent to red. Move the problem up.

```
       G(B)                G(R)
      / \                 / \
    P(R)  U(R)   =>     P(B)  U(B)
    /                   /
  N(R)                N(R)
```

**Case 2: Uncle is black, node is inner child**  - Rotate to convert to Case 3.

**Case 3: Uncle is black, node is outer child**  - Rotate grandparent, recolor.

```
       G(B)                P(B)
      / \                 / \
    P(R)  U(B)   =>     N(R)  G(R)
    /                           \
  N(R)                          U(B)
```

### Python Implementation

```python
class RBNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
        self.parent = None
        self.color = "RED"  # new nodes are always red

class RedBlackTree:
    def __init__(self):
        self.NIL = RBNode(None)
        self.NIL.color = "BLACK"
        self.root = self.NIL

    def insert(self, val):
        new_node = RBNode(val)
        new_node.left = self.NIL
        new_node.right = self.NIL

        parent = None
        current = self.root

        while current != self.NIL:
            parent = current
            if val < current.val:
                current = current.left
            elif val > current.val:
                current = current.right
            else:
                return  # no duplicates

        new_node.parent = parent
        if not parent:
            self.root = new_node
        elif val < parent.val:
            parent.left = new_node
        else:
            parent.right = new_node

        self._fix_insert(new_node)

    def _fix_insert(self, z):
        while z.parent and z.parent.color == "RED":
            if z.parent == z.parent.parent.left:
                uncle = z.parent.parent.right

                # Case 1: Uncle is red  - recolor
                if uncle.color == "RED":
                    z.parent.color = "BLACK"
                    uncle.color = "BLACK"
                    z.parent.parent.color = "RED"
                    z = z.parent.parent

                else:
                    # Case 2: z is right child  - rotate left
                    if z == z.parent.right:
                        z = z.parent
                        self._rotate_left(z)

                    # Case 3: z is left child  - rotate right
                    z.parent.color = "BLACK"
                    z.parent.parent.color = "RED"
                    self._rotate_right(z.parent.parent)
            else:
                # Mirror cases (parent is right child)
                uncle = z.parent.parent.left

                if uncle.color == "RED":
                    z.parent.color = "BLACK"
                    uncle.color = "BLACK"
                    z.parent.parent.color = "RED"
                    z = z.parent.parent
                else:
                    if z == z.parent.left:
                        z = z.parent
                        self._rotate_right(z)
                    z.parent.color = "BLACK"
                    z.parent.parent.color = "RED"
                    self._rotate_left(z.parent.parent)

        self.root.color = "BLACK"

    def _rotate_left(self, x):
        y = x.right
        x.right = y.left
        if y.left != self.NIL:
            y.left.parent = x
        y.parent = x.parent
        if not x.parent:
            self.root = y
        elif x == x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        y.left = x
        x.parent = y

    def _rotate_right(self, y):
        x = y.left
        y.left = x.right
        if x.right != self.NIL:
            x.right.parent = y
        x.parent = y.parent
        if not y.parent:
            self.root = x
        elif y == y.parent.left:
            y.parent.left = x
        else:
            y.parent.right = x
        x.right = y
        y.parent = x
```

### Interactive Red-Black Tree Demo

<div class="demo-hint">
<strong>Interactive:</strong> Insert values one at a time into the Red-Black tree. Nodes are colored <span style="color:#dc2626;font-weight:bold;">red</span> or <span style="color:#1e293b;font-weight:bold;">black</span>. Watch recoloring and rotations preserve the Red-Black properties after each insert. The letter below each node shows its color (R/B).
</div>

<div class="interactive-demo">
  <canvas id="rb-canvas" width="680" height="350"></canvas>
  <div class="demo-controls">
    <label>Value: <input type="number" id="rb-insert-value" value="10" style="width:60px;"></label>
    <button id="rb-insert-btn">Insert</button>
    <span style="color:var(--text-secondary);">|</span>
    <label>Queue: <input type="text" id="rb-queue" value="7,3,18,10,22,8,11,26" style="width:180px;" placeholder="e.g. 7,3,18"></label>
    <button id="rb-step-btn">Step</button>
    <button id="rb-run-btn">Run</button>
    <span style="color:var(--text-secondary);">|</span>
    <button id="rb-reset-btn">Reset</button>
    <label>Speed: <input type="range" id="rb-speed" min="1" max="10" value="4"> <span class="demo-value" id="rb-speed-val">4</span></label>
  </div>
  <div class="demo-info" id="rb-info">Red-Black Tree: empty | Insert values to begin</div>
</div>

<script>
(function() {
  var B = window.DSA_Bal;
  var canvas = document.getElementById('rb-canvas');
  var W = 680, H = 350;
  var ctx = B.setupCanvas(canvas, W, H);

  var tree = { root: null };
  var values = [];
  var running = false;
  var timer = null;

  // Deep clone an RB tree
  function cloneRBNode(node, parent) {
    if (!node) return null;
    var n = new B.RBNode(node.val);
    n.color = node.color;
    n.parent = parent;
    n.left = cloneRBNode(node.left, n);
    n.right = cloneRBNode(node.right, n);
    return n;
  }

  function cloneRBTree(t) {
    return { root: cloneRBNode(t.root, null) };
  }

  // Collect all node values and their colors from tree
  function collectNodes(node) {
    if (!node) return [];
    return collectNodes(node.left).concat([{ val: node.val, color: node.color }]).concat(collectNodes(node.right));
  }

  // Generate step-by-step animation states for RB insert
  function generateRBInsertSteps(treeBefore, val) {
    var steps = [];

    // Step 1: Show BST search path
    var path = [];
    var node = treeBefore.root;
    while (node) {
      path.push(node.val);
      if (val < node.val) node = node.left;
      else if (val > node.val) node = node.right;
      else return steps; // duplicate
    }

    for (var i = 0; i < path.length; i++) {
      var hl = {};
      hl[path[i]] = 'highlight';
      steps.push({
        tree: cloneRBTree(treeBefore),
        highlights: hl,
        info: 'Searching: ' + val + (val < path[i] ? ' < ' : ' > ') + path[i] + ', go ' + (val < path[i] ? 'left' : 'right')
      });
    }

    // Step 2: Insert as red node (before fix-up)
    var preFixTree = cloneRBTree(treeBefore);
    rbInsertNoFix(preFixTree, val);
    var hlNew = {};
    hlNew[val] = 'new';
    steps.push({
      tree: preFixTree,
      highlights: hlNew,
      info: 'Inserted ' + val + ' as RED node'
    });

    // Step 3: Check if fix-up is needed
    var insertedNode = findRBNode(preFixTree.root, val);
    var needsFix = insertedNode && insertedNode.parent && insertedNode.parent.color === B.RED;

    if (!treeBefore.root) {
      // First node  - it gets colored black
      var fixedTree = cloneRBTree(treeBefore);
      B.rbInsert(fixedTree, val);
      steps.push({
        tree: fixedTree,
        highlights: {},
        info: 'Root must be BLACK  - recolored ' + val + ' to black'
      });
    } else if (needsFix) {
      // Determine the type of fix
      var parent = insertedNode.parent;
      var grandparent = parent ? parent.parent : null;
      var uncle = null;
      if (grandparent) {
        uncle = (parent === grandparent.left) ? grandparent.right : grandparent.left;
      }
      var uncleIsRed = uncle && uncle.color === B.RED;

      if (uncleIsRed) {
        steps.push({
          tree: cloneRBTree(preFixTree),
          highlights: hlNew,
          info: 'Violation: parent ' + parent.val + ' is RED. Uncle ' + (uncle ? uncle.val : 'NIL') + ' is RED  - recolor'
        });
      } else {
        steps.push({
          tree: cloneRBTree(preFixTree),
          highlights: hlNew,
          info: 'Violation: parent ' + parent.val + ' is RED. Uncle is BLACK  - rotate and recolor'
        });
      }

      // Show the fixed result
      var fixedTree2 = cloneRBTree(treeBefore);
      B.rbInsert(fixedTree2, val);
      steps.push({
        tree: fixedTree2,
        highlights: {},
        info: 'Fix-up complete! All Red-Black properties restored.'
      });
    } else {
      // No fix needed
      var fixedTree3 = cloneRBTree(treeBefore);
      B.rbInsert(fixedTree3, val);
      steps.push({
        tree: fixedTree3,
        highlights: {},
        info: 'No violation  - parent is BLACK. Tree is valid.'
      });
    }

    // Final clean state
    var finalTree = cloneRBTree(treeBefore);
    B.rbInsert(finalTree, val);
    steps.push({
      tree: finalTree,
      highlights: {},
      info: 'Red-Black Tree: [' + values.concat([val]).sort(function(a,b){return a-b;}).join(', ') + ']'
    });

    return steps;
  }

  // Insert into RB tree without fix-up (for visualization of pre-fix state)
  function rbInsertNoFix(t, val) {
    var z = new B.RBNode(val);
    z.color = B.RED;
    var y = null;
    var x = t.root;
    while (x) {
      y = x;
      if (val < x.val) x = x.left;
      else if (val > x.val) x = x.right;
      else return;
    }
    z.parent = y;
    if (!y) { t.root = z; }
    else if (val < y.val) y.left = z;
    else y.right = z;
    // Don't fix  - just insert as red
  }

  // Find an RB node by value
  function findRBNode(node, val) {
    if (!node) return null;
    if (node.val === val) return node;
    if (val < node.val) return findRBNode(node.left, val);
    return findRBNode(node.right, val);
  }

  function draw(t, hl) {
    B.drawRBTree(ctx, t ? t.root : null, W, H, hl || {});
  }

  function updateInfo(msg) {
    document.getElementById('rb-info').textContent = msg;
  }

  function getSpeed() {
    return parseInt(document.getElementById('rb-speed').value) || 4;
  }

  function getDelay() {
    return Math.max(200, 1400 - getSpeed() * 130);
  }

  function stopRunning() {
    running = false;
    if (timer) { clearTimeout(timer); timer = null; }
    document.getElementById('rb-run-btn').textContent = 'Run';
  }

  // Insert a single value with animation
  function doInsert(val, callback) {
    if (isNaN(val) || values.indexOf(val) >= 0) {
      updateInfo(isNaN(val) ? 'Enter a valid number' : val + ' already in tree');
      if (callback) callback();
      return;
    }

    var steps = generateRBInsertSteps(tree, val);
    if (steps.length === 0) {
      updateInfo(val + ' is a duplicate');
      if (callback) callback();
      return;
    }

    var si = 0;
    function animateStep() {
      if (si < steps.length) {
        var s = steps[si];
        draw(s.tree, s.highlights);
        updateInfo(s.info);
        si++;
        if (si < steps.length) {
          timer = setTimeout(animateStep, getDelay());
        } else {
          // Commit the insert
          B.rbInsert(tree, val);
          values.push(val);
          draw(tree, {});
          if (callback) setTimeout(callback, 200);
        }
      }
    }
    animateStep();
  }

  // Get queue values
  function getQueue() {
    var text = document.getElementById('rb-queue').value.trim();
    if (!text) return [];
    return text.split(',').map(function(s) { return parseInt(s.trim()); }).filter(function(v) { return !isNaN(v); });
  }

  function setQueue(arr) {
    document.getElementById('rb-queue').value = arr.join(',');
  }

  // Init
  draw(tree, {});
  B.onThemeChange(function() { draw(tree, {}); });

  // Insert button
  document.getElementById('rb-insert-btn').onclick = function() {
    stopRunning();
    var val = parseInt(document.getElementById('rb-insert-value').value);
    doInsert(val, null);
  };

  // Step button
  document.getElementById('rb-step-btn').onclick = function() {
    stopRunning();
    var q = getQueue();
    if (q.length === 0) { updateInfo('Queue is empty  - add values to queue'); return; }
    var val = q.shift();
    setQueue(q);
    doInsert(val, null);
  };

  // Run button
  document.getElementById('rb-run-btn').onclick = function() {
    if (running) { stopRunning(); return; }
    var q = getQueue();
    if (q.length === 0) { updateInfo('Queue is empty  - add values to queue'); return; }
    running = true;
    document.getElementById('rb-run-btn').textContent = 'Pause';
    function runNext() {
      if (!running) return;
      var q2 = getQueue();
      if (q2.length === 0) { stopRunning(); return; }
      var val = q2.shift();
      setQueue(q2);
      doInsert(val, function() {
        if (running) runNext();
      });
    }
    runNext();
  };

  // Reset button
  document.getElementById('rb-reset-btn').onclick = function() {
    stopRunning();
    tree = { root: null };
    values = [];
    draw(tree, {});
    updateInfo('Red-Black Tree: empty | Insert values to begin');
  };

  // Speed display
  document.getElementById('rb-speed').oninput = function() {
    document.getElementById('rb-speed-val').textContent = this.value;
  };
})();
</script>

<div class="demo-hint">
<strong>Try this sequence</strong> to see all fix-up cases: Reset, then run the default queue <code>7,3,18,10,22,8,11,26</code>. Watch how recoloring and rotations maintain the Red-Black properties as the tree grows.
</div>

---

## AVL vs Red-Black Tree Comparison

Both AVL and Red-Black trees guarantee $$O(\log n)$$ operations, but they make different trade-offs:

<table class="comparison-table">
<thead>
<tr>
<th>Property</th>
<th>AVL Tree</th>
<th>Red-Black Tree</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Balance strictness</strong></td>
<td>Strict: |BF| &le; 1 at every node</td>
<td>Relaxed: longest path &le; 2x shortest</td>
</tr>
<tr>
<td><strong>Height bound</strong></td>
<td>$$\leq 1.44 \log_2(n+2)$$</td>
<td>$$\leq 2 \log_2(n+1)$$</td>
</tr>
<tr>
<td><strong>Search speed</strong></td>
<td>Faster (shorter height)</td>
<td>Slightly slower (taller tree)</td>
</tr>
<tr>
<td><strong>Insert speed</strong></td>
<td>Slower (more rotations)</td>
<td>Faster (fewer rotations)</td>
</tr>
<tr>
<td><strong>Delete speed</strong></td>
<td>Slower (up to O(log n) rotations)</td>
<td>Faster (at most 3 rotations)</td>
</tr>
<tr>
<td><strong>Max rotations per insert</strong></td>
<td>2 (one single or double rotation)</td>
<td>2 rotations + O(log n) recolorings</td>
</tr>
<tr>
<td><strong>Max rotations per delete</strong></td>
<td>O(log n)</td>
<td>3</td>
</tr>
<tr>
<td><strong>Extra storage per node</strong></td>
<td>Height (integer)</td>
<td>Color (1 bit)</td>
</tr>
<tr>
<td><strong>Best use case</strong></td>
<td>Read-heavy / lookup-heavy workloads</td>
<td>Write-heavy / mixed workloads</td>
</tr>
<tr>
<td><strong>Used in</strong></td>
<td>Databases, in-memory lookups</td>
<td>Java TreeMap, C++ std::map, Linux CFS</td>
</tr>
</tbody>
</table>

### When to Choose Which?

- **Choose AVL** when your workload is **read-heavy** (many searches, few insertions/deletions). The stricter balance means shorter trees and faster lookups.

- **Choose Red-Black** when your workload involves **frequent insertions and deletions**. The relaxed balance means fewer structural changes per modification. This is why most standard library implementations choose Red-Black trees.

- In practice, the difference is small for most workloads. Both guarantee $$O(\log n)$$ for all operations.

---

## Side-by-Side Comparison Demo

<div class="demo-hint">
<strong>Interactive:</strong> Insert the same sequence into both an AVL tree and a Red-Black tree simultaneously. Compare how each tree structures itself and count the rotations performed.
</div>

<div class="interactive-demo">
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
    <div style="text-align:center; font-weight:600; font-size:0.85rem; color:var(--text-secondary);">AVL Tree</div>
    <div style="text-align:center; font-weight:600; font-size:0.85rem; color:var(--text-secondary);">Red-Black Tree</div>
  </div>
  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
    <canvas id="cmp-avl-canvas" width="335" height="300"></canvas>
    <canvas id="cmp-rb-canvas" width="335" height="300"></canvas>
  </div>
  <div class="demo-controls">
    <label>Queue: <input type="text" id="cmp-queue" value="10,20,30,15,25,5,35" style="width:180px;"></label>
    <button id="cmp-step-btn">Step</button>
    <button id="cmp-run-btn">Run</button>
    <button id="cmp-reset-btn">Reset</button>
    <label>Speed: <input type="range" id="cmp-speed" min="1" max="10" value="4"> <span class="demo-value" id="cmp-speed-val">4</span></label>
  </div>
  <div class="demo-info" id="cmp-info">Insert the same values into both trees to compare | AVL height: 0, RB height: 0</div>
</div>

<script>
(function() {
  var B = window.DSA_Bal;
  var avlCanvas = document.getElementById('cmp-avl-canvas');
  var rbCanvas = document.getElementById('cmp-rb-canvas');
  var AW = 335, AH = 300;
  var avlCtx = B.setupCanvas(avlCanvas, AW, AH);
  var rbCtx = B.setupCanvas(rbCanvas, AW, AH);

  var avlRoot = null;
  var rbTree = { root: null };
  var values = [];
  var running = false;
  var timer = null;

  function treeHeight(node) {
    if (!node) return 0;
    return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
  }

  function drawBoth() {
    B.drawAVLTree(avlCtx, avlRoot, AW, AH, {});
    B.drawRBTree(rbCtx, rbTree.root, AW, AH, {});
    var ah = treeHeight(avlRoot);
    var rh = treeHeight(rbTree.root);
    document.getElementById('cmp-info').textContent =
      'Values: [' + values.join(', ') + '] | AVL height: ' + ah + ', RB height: ' + rh;
  }

  function getSpeed() {
    return parseInt(document.getElementById('cmp-speed').value) || 4;
  }

  function getDelay() {
    return Math.max(300, 1200 - getSpeed() * 100);
  }

  function stopRunning() {
    running = false;
    if (timer) { clearTimeout(timer); timer = null; }
    document.getElementById('cmp-run-btn').textContent = 'Run';
  }

  function getQueue() {
    var text = document.getElementById('cmp-queue').value.trim();
    if (!text) return [];
    return text.split(',').map(function(s) { return parseInt(s.trim()); }).filter(function(v) { return !isNaN(v); });
  }

  function setQueue(arr) {
    document.getElementById('cmp-queue').value = arr.join(',');
  }

  function insertOne(val) {
    if (isNaN(val) || values.indexOf(val) >= 0) return;
    avlRoot = B.avlInsert(avlRoot, val);
    B.rbInsert(rbTree, val);
    values.push(val);
    // Highlight the new node briefly
    var hlAvl = {}; hlAvl[val] = 'new';
    var hlRb = {}; hlRb[val] = 'new';
    B.drawAVLTree(avlCtx, avlRoot, AW, AH, hlAvl);
    B.drawRBTree(rbCtx, rbTree.root, AW, AH, hlRb);
    var ah = treeHeight(avlRoot);
    var rh = treeHeight(rbTree.root);
    document.getElementById('cmp-info').textContent =
      'Inserted ' + val + ' | AVL height: ' + ah + ', RB height: ' + rh;
    setTimeout(drawBoth, 600);
  }

  drawBoth();
  B.onThemeChange(drawBoth);

  document.getElementById('cmp-step-btn').onclick = function() {
    stopRunning();
    var q = getQueue();
    if (q.length === 0) return;
    var val = q.shift();
    setQueue(q);
    insertOne(val);
  };

  document.getElementById('cmp-run-btn').onclick = function() {
    if (running) { stopRunning(); return; }
    running = true;
    document.getElementById('cmp-run-btn').textContent = 'Pause';
    function runNext() {
      if (!running) return;
      var q = getQueue();
      if (q.length === 0) { stopRunning(); return; }
      var val = q.shift();
      setQueue(q);
      insertOne(val);
      timer = setTimeout(runNext, getDelay());
    }
    runNext();
  };

  document.getElementById('cmp-reset-btn').onclick = function() {
    stopRunning();
    avlRoot = null;
    rbTree = { root: null };
    values = [];
    drawBoth();
  };

  document.getElementById('cmp-speed').oninput = function() {
    document.getElementById('cmp-speed-val').textContent = this.value;
  };
})();
</script>

<div class="demo-hint">
<strong>Try inserting sorted values</strong> like <code>1,2,3,4,5,6,7</code>  - the worst case for a plain BST. Both AVL and Red-Black trees keep the height logarithmic, but notice the AVL tree is shorter.
</div>

---

## Complexity Summary

All three BST variants support the same operations but with different guarantees:

| Operation | Plain BST (avg) | Plain BST (worst) | AVL Tree | Red-Black Tree |
|-----------|------------------|--------------------|----------|----------------|
| **Search** | $$O(\log n)$$ | $$O(n)$$ | $$O(\log n)$$ | $$O(\log n)$$ |
| **Insert** | $$O(\log n)$$ | $$O(n)$$ | $$O(\log n)$$ | $$O(\log n)$$ |
| **Delete** | $$O(\log n)$$ | $$O(n)$$ | $$O(\log n)$$ | $$O(\log n)$$ |
| **Space** | $$O(n)$$ | $$O(n)$$ | $$O(n)$$ | $$O(n)$$ |

The key difference: plain BSTs have $$O(n)$$ worst case, while balanced trees guarantee $$O(\log n)$$ always.

---

## Key Takeaways

1. **Self-balancing BSTs** prevent the $$O(n)$$ worst case of plain BSTs by automatically restructuring after modifications, guaranteeing $$O(\log n)$$ for all operations.

2. **AVL trees** use a strict balance factor ($$-1, 0, +1$$) and four rotation types (LL, RR, LR, RL) to maintain balance. They produce shorter trees and faster lookups but require more rotations during modifications.

3. **Red-Black trees** use a relaxed color-based balance: red nodes cannot have red children, and all root-to-leaf paths must have equal black height. They require fewer structural changes per operation, making them better for write-heavy workloads.

4. **AVL trees are better for read-heavy workloads** (databases, in-memory lookups) where search speed matters most. **Red-Black trees are better for write-heavy workloads** (standard library maps, OS schedulers) where insert/delete frequency is high.

5. In practice, both are $$O(\log n)$$ and the constant-factor differences are small. Understanding the theory helps you reason about performance, but most of the time you can trust your language's standard library (which almost always uses Red-Black trees).

---

## What's Next?

Self-balancing trees ensure efficient dictionary operations, but what about priority-based access? **Heaps** give us $$O(1)$$ access to the minimum (or maximum) element and $$O(\log n)$$ insertion. Continue to the [Heaps Interactive Guide]({{ site.baseurl }}/heaps/).

Explore the full [DSA in Python series]({{ site.baseurl }}/dsa/).
