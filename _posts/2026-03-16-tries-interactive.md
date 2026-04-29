---
layout: post
title: "Tries (Prefix Trees)"
author: bharathikannan
categories: [Data Structures]
description: "Build and explore tries interactively. Insert words, search prefixes, visualize autocomplete  - all animated step by step on a canvas."
permalink: /tries/
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
  width: 120px;
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
.demo-hint {
  background: var(--bg-secondary);
  border-left: 3px solid var(--accent);
  padding: 0.6rem 0.9rem;
  margin: 1rem 0;
  border-radius: 0 6px 6px 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.demo-word-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}
.demo-word-tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.78rem;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
}
.demo-word-tag.highlight {
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}
@media (max-width: 640px) {
  .demo-controls input[type="range"] { width: 120px; }
  .demo-controls input[type="text"] { width: 90px; }
}
</style>

<script>
window.DSA_Trie = (function() {
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

  var NODE_R = 16;
  var ROOT_R = 22;
  var LEVEL_H = 58;
  var PAD_T = 45;

  // TrieNode constructor
  function TrieNode(char) {
    this.char = char || '';
    this.children = {};
    this.isEnd = false;
  }

  // Insert a word into the trie
  function trieInsert(root, word) {
    var node = root;
    for (var i = 0; i < word.length; i++) {
      var ch = word[i].toLowerCase();
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode(ch);
      }
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  // Search for exact word
  function trieSearch(root, word) {
    var node = root;
    for (var i = 0; i < word.length; i++) {
      var ch = word[i].toLowerCase();
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isEnd;
  }

  // Search for prefix, return the node at end of prefix (or null)
  function triePrefix(root, prefix) {
    var node = root;
    for (var i = 0; i < prefix.length; i++) {
      var ch = prefix[i].toLowerCase();
      if (!node.children[ch]) return null;
      node = node.children[ch];
    }
    return node;
  }

  // Collect all words from a node
  function collectWords(node, prefix, results) {
    if (node.isEnd) results.push(prefix);
    var keys = Object.keys(node.children).sort();
    for (var i = 0; i < keys.length; i++) {
      collectWords(node.children[keys[i]], prefix + keys[i], results);
    }
  }

  // Autocomplete: find all words with given prefix
  function autocomplete(root, prefix) {
    var node = triePrefix(root, prefix);
    if (!node) return [];
    var results = [];
    collectWords(node, prefix, results);
    return results;
  }

  // Delete a word from the trie, returns true if deleted
  function trieDelete(root, word) {
    function _delete(node, word, depth) {
      if (!node) return false;
      if (depth === word.length) {
        if (!node.isEnd) return false;
        node.isEnd = false;
        return Object.keys(node.children).length === 0;
      }
      var ch = word[depth].toLowerCase();
      if (!node.children[ch]) return false;
      var shouldDelete = _delete(node.children[ch], word, depth + 1);
      if (shouldDelete) {
        delete node.children[ch];
        return !node.isEnd && Object.keys(node.children).length === 0;
      }
      return false;
    }
    _delete(root, word.toLowerCase(), 0);
  }

  // Build trie from array of words
  function buildTrie(words) {
    var root = new TrieNode('');
    for (var i = 0; i < words.length; i++) {
      trieInsert(root, words[i].toLowerCase());
    }
    return root;
  }

  // Count total nodes in trie (for layout)
  function countNodes(node) {
    var count = 1;
    var keys = Object.keys(node.children);
    for (var i = 0; i < keys.length; i++) {
      count += countNodes(node.children[keys[i]]);
    }
    return count;
  }

  // Count leaves (for width computation)
  function countLeaves(node) {
    var keys = Object.keys(node.children).sort();
    if (keys.length === 0) return 1;
    var leaves = 0;
    for (var i = 0; i < keys.length; i++) {
      leaves += countLeaves(node.children[keys[i]]);
    }
    return leaves;
  }

  // Compute layout positions for trie nodes
  // Returns array of { node, char, x, y, px, py, depth, isEnd }
  function layoutTrie(root, w, h) {
    var positions = [];
    if (!root) return positions;
    var padL = 40, padR = 40;
    var usableW = w - padL - padR;

    // First pass: count leaves under each node for spacing
    function assignPositions(node, depth, leftX, rightX, parentX, parentY) {
      var x = (leftX + rightX) / 2;
      var y = PAD_T + depth * LEVEL_H;
      positions.push({
        node: node,
        char: node.char,
        x: x,
        y: y,
        px: parentX,
        py: parentY,
        depth: depth,
        isEnd: node.isEnd
      });
      var keys = Object.keys(node.children).sort();
      if (keys.length === 0) return;

      // Compute leaf counts for children to allocate proportional space
      var leafCounts = [];
      var totalLeaves = 0;
      for (var i = 0; i < keys.length; i++) {
        var lc = countLeaves(node.children[keys[i]]);
        leafCounts.push(lc);
        totalLeaves += lc;
      }

      var childLeft = leftX;
      for (var j = 0; j < keys.length; j++) {
        var childWidth = (leafCounts[j] / totalLeaves) * (rightX - leftX);
        assignPositions(
          node.children[keys[j]],
          depth + 1,
          childLeft,
          childLeft + childWidth,
          x,
          y
        );
        childLeft += childWidth;
      }
    }

    assignPositions(root, 0, padL, padL + usableW, -1, -1);
    return positions;
  }

  // Draw the trie
  // highlights: Map of node references to color type strings
  // highlightNodes: Set of node references that should be highlighted
  // highlightType: 'current', 'match', 'new', 'delete'
  function drawTrie(ctx, root, w, h, highlightSet, highlightType, pathSet) {
    var c = getColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    if (!root || Object.keys(root.children).length === 0) {
      ctx.fillStyle = c.textMuted;
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Empty trie  - insert a word to begin', w / 2, h / 2);
      return;
    }

    highlightSet = highlightSet || new Set();
    pathSet = pathSet || new Set();

    var positions = layoutTrie(root, w, h);

    // Draw edges first
    for (var i = 0; i < positions.length; i++) {
      var p = positions[i];
      if (p.px >= 0 && p.py >= 0) {
        var isPathEdge = pathSet.has(p.node);
        var isHighlightEdge = highlightSet.has(p.node);
        if (isPathEdge || isHighlightEdge) {
          ctx.strokeStyle = highlightType === 'match' ? c.edgeMatch : c.edgeHighlight;
          ctx.lineWidth = 2.5;
        } else {
          ctx.strokeStyle = c.edge;
          ctx.lineWidth = 1.5;
        }
        ctx.beginPath();
        // Compute edge start and end to stop at node borders
        var dx = p.x - p.px;
        var dy = p.y - p.py;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var parentR = (p.depth === 1) ? ROOT_R : NODE_R;
        var startX = p.px + (dx / dist) * parentR;
        var startY = p.py + (dy / dist) * parentR;
        var endX = p.x - (dx / dist) * NODE_R;
        var endY = p.y - (dy / dist) * NODE_R;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }

    // Draw nodes
    for (var j = 0; j < positions.length; j++) {
      var pos = positions[j];
      var isHighlighted = highlightSet.has(pos.node);
      var isPath = pathSet.has(pos.node);
      var r = (pos.depth === 0) ? ROOT_R : NODE_R;

      // Determine node color
      var fillCol = c.node;
      if (isHighlighted) {
        if (highlightType === 'current') fillCol = c.nodeCurrent;
        else if (highlightType === 'match') fillCol = c.nodeMatch;
        else if (highlightType === 'new') fillCol = c.nodeNew;
        else if (highlightType === 'delete') fillCol = c.nodeDelete;
        else fillCol = c.nodeCurrent;
      } else if (isPath) {
        fillCol = c.nodeCurrent;
      } else if (pos.depth === 0) {
        fillCol = c.rootBg;
      } else if (pos.isEnd) {
        fillCol = c.nodeEnd;
      }

      // Draw node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = fillCol;
      ctx.fill();

      // Draw border for root and end-of-word nodes
      if (pos.depth === 0) {
        ctx.strokeStyle = c.rootBorder;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (pos.isEnd && !isHighlighted && !isPath) {
        ctx.strokeStyle = c.nodeEnd;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw letter or "root" label
      if (pos.depth === 0) {
        ctx.fillStyle = c.text;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('root', pos.x, pos.y);
      } else {
        ctx.fillStyle = c.textOnNode;
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pos.char, pos.x, pos.y);
      }

      // Draw end-of-word indicator (small dot below node)
      if (pos.isEnd && pos.depth > 0) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y + r + 6, 3, 0, Math.PI * 2);
        ctx.fillStyle = c.nodeEnd;
        ctx.fill();
      }
    }
  }

  // Get the path of nodes from root for a given prefix
  function getPathNodes(root, prefix) {
    var nodes = [root];
    var node = root;
    for (var i = 0; i < prefix.length; i++) {
      var ch = prefix[i].toLowerCase();
      if (!node.children[ch]) break;
      node = node.children[ch];
      nodes.push(node);
    }
    return nodes;
  }

  // Get all nodes in the subtree rooted at a given node
  function getSubtreeNodes(node) {
    var nodes = [node];
    var keys = Object.keys(node.children).sort();
    for (var i = 0; i < keys.length; i++) {
      var sub = getSubtreeNodes(node.children[keys[i]]);
      for (var j = 0; j < sub.length; j++) {
        nodes.push(sub[j]);
      }
    }
    return nodes;
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
    TrieNode: TrieNode,
    trieInsert: trieInsert,
    trieSearch: trieSearch,
    triePrefix: triePrefix,
    trieDelete: trieDelete,
    autocomplete: autocomplete,
    buildTrie: buildTrie,
    collectWords: collectWords,
    countNodes: countNodes,
    layoutTrie: layoutTrie,
    drawTrie: drawTrie,
    getPathNodes: getPathNodes,
    getSubtreeNodes: getSubtreeNodes,
    NODE_R: NODE_R,
    ROOT_R: ROOT_R,
    onThemeChange: onThemeChange
  };
})();
</script>

A **trie** (pronounced "try"), also called a **prefix tree**, is a tree-like data structure used for efficiently storing and searching strings. Unlike a hash table which stores entire keys, a trie breaks each key into individual characters and stores them along branching paths from a shared root.

This makes tries ideal for problems involving prefix-based lookups: autocomplete systems, spell checkers, IP routing tables, and dictionary implementations. If you have ever started typing a word into a search bar and seen suggestions appear instantly, there is likely a trie (or a similar structure) working behind the scenes.

By the end of this guide you will understand the trie structure (how nodes, edges, and the end-of-word flag work), insertion (adding words character by character), search and prefix matching for finding words and autocomplete suggestions, and deletion that removes words while preserving shared prefixes.

---

## What Makes Tries Special?

Consider storing these words: `cat`, `car`, `card`, `care`, `do`, `dog`.

In a hash map, each word is stored independently. In a trie, words that share prefixes share the same path from the root: `cat`, `car`, `card`, `care` all share the path `c → a`, and `do`, `dog` share the path `d → o`. This prefix sharing is what gives tries their power. Searching for all words starting with `"car"` requires only 3 steps down the tree, regardless of how many total words exist.

The key properties to keep in mind: search time is $$O(m)$$ where $$m$$ is the length of the key, independent of how many keys are stored; prefix queries are natural since you simply walk to the prefix node and collect all descendants; space can be large due to pointer overhead, but shared prefixes reduce storage for similar keys; and each edge represents a character, while each path from root to a marked node represents a stored word.

---

## Trie Structure

A trie is built from TrieNode objects. Each node has a `children` dictionary mapping characters to child nodes, and an `is_end` boolean flag indicating whether the node marks the end of a complete word. The root node represents the empty string. It has no character of its own but branches out to all first characters of stored words.

```python
class TrieNode:
    def __init__(self):
        self.children = {}  # char -> TrieNode
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
```

The `children` dictionary is the branching factor: each entry maps a single character to the next node in the path. For the English alphabet, each node can have at most 26 children (for lowercase letters), but typically far fewer are present. Throughout the visualizations below, blue nodes are internal (not end-of-word), green nodes mark the end of a stored word (shown with a small green dot beneath), and the root node is labeled "root" and drawn larger.

---

## Trie Insertion

Inserting a word into a trie means walking the tree character by character, creating new nodes as needed, and marking the final node as the end of a word.

```python
def insert(self, word):
    """Insert a word into the trie."""
    node = self.root
    for char in word:
        if char not in node.children:
            node.children[char] = TrieNode()
        node = node.children[char]
    node.is_end = True
```

The algorithm starts at the root, then for each character in the word it either follows an existing child node or creates a new one and follows it; after processing the last character, it marks the current node as `is_end = True`.

The time complexity is $$O(m)$$ where $$m$$ is the length of the word being inserted. Each character requires at most one dictionary lookup and possibly one node creation. In the demo below, type a word and click Insert to watch the trie grow letter by letter; new nodes appear in purple, and the final node gets a green end-of-word marker.

<div class="interactive-demo">
  <canvas id="insert-canvas" width="680" height="350"></canvas>
  <div class="demo-controls">
    <label>Word: <input type="text" id="insert-word" value="cape" maxlength="10" placeholder="a-z only"></label>
    <button id="insert-btn">Insert</button>
    <button id="insert-reset">Reset</button>
    <label>Speed: <input type="range" id="insert-speed" min="1" max="10" value="5"> <span class="demo-value" id="insert-speed-val">5</span></label>
  </div>
  <div class="demo-info" id="insert-info">Words in trie: cat, car, card, care, do, dog</div>
  <div class="demo-word-list" id="insert-words"></div>
  <div class="demo-caption">Settings: trie pre-loaded with cat, car, card, care, do, dog. Default insert word: cape.</div>
</div>

<script>
(function() {
  var T = window.DSA_Trie;
  var canvas = document.getElementById('insert-canvas');
  var W = 680, H = 350;
  var ctx = T.setupCanvas(canvas, W, H);

  var initialWords = ['cat', 'car', 'card', 'care', 'do', 'dog'];
  var words = initialWords.slice();
  var root = T.buildTrie(words);

  function updateWordList() {
    var container = document.getElementById('insert-words');
    container.innerHTML = '';
    for (var i = 0; i < words.length; i++) {
      var tag = document.createElement('span');
      tag.className = 'demo-word-tag';
      tag.textContent = words[i];
      container.appendChild(tag);
    }
  }

  function draw(hlSet, hlType, pathSet) {
    T.drawTrie(ctx, root, W, H, hlSet, hlType, pathSet);
    document.getElementById('insert-info').textContent = 'Words in trie: ' + words.join(', ');
  }

  draw();
  updateWordList();
  T.onThemeChange(function() { draw(); });

  var animating = false;

  document.getElementById('insert-btn').onclick = function() {
    if (animating) return;
    var input = document.getElementById('insert-word');
    var word = input.value.toLowerCase().replace(/[^a-z]/g, '');
    if (!word || word.length === 0) return;

    if (words.indexOf(word) >= 0) {
      document.getElementById('insert-info').textContent = '"' + word + '" is already in the trie!';
      return;
    }

    animating = true;
    var speed = parseInt(document.getElementById('insert-speed').value) || 5;
    var delay = Math.max(150, 1000 - speed * 85);

    // Animate character by character
    var node = root;
    var charIndex = 0;
    var pathNodes = [root];

    function animateStep() {
      if (charIndex < word.length) {
        var ch = word[charIndex];
        var isNew = !node.children[ch];

        if (isNew) {
          node.children[ch] = new T.TrieNode(ch);
        }
        node = node.children[ch];
        pathNodes.push(node);

        // Build highlight sets
        var pathSet = new Set();
        for (var p = 0; p < pathNodes.length - 1; p++) {
          pathSet.add(pathNodes[p]);
        }
        var hlSet = new Set();
        hlSet.add(node);

        var hlType = isNew ? 'new' : 'current';
        draw(hlSet, hlType, pathSet);

        var status = isNew ? 'Created new node "' + ch + '"' : 'Followed existing node "' + ch + '"';
        document.getElementById('insert-info').textContent =
          'Inserting "' + word + '"  - step ' + (charIndex + 1) + '/' + word.length + ': ' + status;

        charIndex++;
        setTimeout(animateStep, delay);
      } else {
        // Mark as end of word
        node.isEnd = true;
        words.push(word);

        var endSet = new Set();
        endSet.add(node);
        var fullPath = new Set();
        for (var p2 = 0; p2 < pathNodes.length - 1; p2++) {
          fullPath.add(pathNodes[p2]);
        }
        draw(endSet, 'match', fullPath);
        document.getElementById('insert-info').textContent =
          'Inserted "' + word + '"! Marked end-of-word.';
        updateWordList();

        setTimeout(function() {
          draw();
          animating = false;
        }, delay * 1.5);
      }
    }

    animateStep();
  };

  document.getElementById('insert-word').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('insert-btn').click();
  });

  document.getElementById('insert-reset').onclick = function() {
    if (animating) return;
    words = initialWords.slice();
    root = T.buildTrie(words);
    draw();
    updateWordList();
    document.getElementById('insert-word').value = 'cape';
  };

  document.getElementById('insert-speed').oninput = function() {
    document.getElementById('insert-speed-val').textContent = this.value;
  };
})();
</script>

Notice how shared prefixes are reused. Inserting `"cape"` after `"car"` and `"cat"` reuses the existing `c → a` path and only creates a new branch at `p → e`. This prefix sharing is the fundamental advantage of tries over hash-based structures for string data.

---

## Trie Search

Searching a trie is straightforward: walk the tree character by character. If at any point the required child does not exist, the word is not in the trie. If we reach the end of the word, we check the `is_end` flag.

```python
def search(self, word):
    """Return True if word is in the trie."""
    node = self.root
    for char in word:
        if char not in node.children:
            return False
        node = node.children[char]
    return node.is_end

def starts_with(self, prefix):
    """Return True if any word starts with the given prefix."""
    node = self.root
    for char in prefix:
        if char not in node.children:
            return False
        node = node.children[char]
    return True
```

There are two types of search: exact search asks whether the trie contains a specific word and is answered by checking `is_end` at the final node, while prefix search asks whether any word starts with a given prefix and is answered by simply verifying the path exists. Both operations run in $$O(m)$$ time where $$m$$ is the length of the search string.

### Autocomplete with Prefix Search

The real power of tries shows when implementing autocomplete. Given a prefix, we can find all stored words that start with it:

```python
def autocomplete(self, prefix):
    """Return all words in the trie that start with prefix."""
    node = self.root
    for char in prefix:
        if char not in node.children:
            return []
        node = node.children[char]

    # Collect all words from this node onward
    results = []
    self._collect(node, prefix, results)
    return results

def _collect(self, node, prefix, results):
    """Recursively collect all words from node."""
    if node.is_end:
        results.append(prefix)
    for char in sorted(node.children):
        self._collect(node.children[char], prefix + char, results)
```

The time complexity is $$O(m + k)$$ where $$m$$ is the prefix length and $$k$$ is the total number of characters in all matching words. This is optimal because you cannot do better than visiting every character you need to return. The demo below visualizes both stages: as each character of the prefix is matched, the path highlights in yellow; once the prefix is found, the subtree of matching words highlights in purple and autocomplete results appear below. Try prefixes like "ca", "do", or "c".

<div class="interactive-demo">
  <canvas id="search-canvas" width="680" height="350"></canvas>
  <div class="demo-controls">
    <label>Prefix: <input type="text" id="search-prefix" value="ca" maxlength="10" placeholder="a-z only"></label>
    <button id="search-btn">Search</button>
    <button id="search-step">Step</button>
    <button id="search-reset">Reset</button>
    <label>Speed: <input type="range" id="search-speed" min="1" max="10" value="5"> <span class="demo-value" id="search-speed-val">5</span></label>
  </div>
  <div class="demo-info" id="search-info">Type a prefix and search. Words: cat, car, card, care, do, dog, cape, can</div>
  <div class="demo-word-list" id="search-results"></div>
  <div class="demo-caption">Settings: trie loaded with cat, car, card, care, do, dog, cape, can. Default prefix: ca.</div>
</div>

<script>
(function() {
  var T = window.DSA_Trie;
  var canvas = document.getElementById('search-canvas');
  var W = 680, H = 350;
  var ctx = T.setupCanvas(canvas, W, H);

  var words = ['cat', 'car', 'card', 'care', 'do', 'dog', 'cape', 'can'];
  var root = T.buildTrie(words);

  var animating = false;
  var stepMode = false;
  var stepResolve = null;

  function draw(hlSet, hlType, pathSet) {
    T.drawTrie(ctx, root, W, H, hlSet, hlType, pathSet);
  }

  function showResults(results, prefix) {
    var container = document.getElementById('search-results');
    container.innerHTML = '';
    if (results.length === 0) {
      var tag = document.createElement('span');
      tag.className = 'demo-word-tag';
      tag.textContent = 'No matches';
      container.appendChild(tag);
      return;
    }
    for (var i = 0; i < results.length; i++) {
      var tag2 = document.createElement('span');
      tag2.className = 'demo-word-tag highlight';
      tag2.textContent = results[i];
      container.appendChild(tag2);
    }
  }

  function clearResults() {
    document.getElementById('search-results').innerHTML = '';
  }

  draw();
  T.onThemeChange(function() { draw(); });

  function runSearch(isStepMode) {
    if (animating) return;
    var prefix = document.getElementById('search-prefix').value.toLowerCase().replace(/[^a-z]/g, '');
    if (!prefix) return;

    animating = true;
    stepMode = isStepMode;
    clearResults();
    var speed = parseInt(document.getElementById('search-speed').value) || 5;
    var delay = Math.max(150, 1000 - speed * 85);

    var node = root;
    var charIndex = 0;
    var pathNodes = [root];
    var failed = false;

    function doStep() {
      if (charIndex < prefix.length && !failed) {
        var ch = prefix[charIndex];

        // Highlight current path
        var pathSet = new Set();
        for (var p = 0; p < pathNodes.length; p++) {
          pathSet.add(pathNodes[p]);
        }

        if (!node.children[ch]) {
          // Character not found
          failed = true;
          draw(pathSet, 'current', new Set());
          document.getElementById('search-info').textContent =
            'Searching "' + prefix + '"  - "' + ch + '" not found! No words match this prefix.';
          showResults([], prefix);
          animating = false;
          return;
        }

        node = node.children[ch];
        pathNodes.push(node);

        var hlSet = new Set();
        hlSet.add(node);
        pathSet = new Set();
        for (var p2 = 0; p2 < pathNodes.length - 1; p2++) {
          pathSet.add(pathNodes[p2]);
        }
        draw(hlSet, 'current', pathSet);
        document.getElementById('search-info').textContent =
          'Searching "' + prefix + '"  - matched "' + ch + '" (step ' + (charIndex + 1) + '/' + prefix.length + ')';

        charIndex++;

        if (stepMode) {
          // Wait for next step click
          stepResolve = doStep;
        } else {
          setTimeout(doStep, delay);
        }
      } else if (!failed) {
        // Prefix matched, show autocomplete results
        var results = T.autocomplete(root, prefix);

        // Highlight the entire subtree of matching nodes
        var subtreeNodes = T.getSubtreeNodes(node);
        var matchSet = new Set();
        for (var s = 0; s < subtreeNodes.length; s++) {
          matchSet.add(subtreeNodes[s]);
        }
        var fullPath = new Set();
        for (var p3 = 0; p3 < pathNodes.length; p3++) {
          fullPath.add(pathNodes[p3]);
        }
        draw(matchSet, 'match', fullPath);

        document.getElementById('search-info').textContent =
          'Prefix "' + prefix + '" found! ' + results.length + ' word(s) match: ' + results.join(', ');
        showResults(results, prefix);

        animating = false;
        stepResolve = null;
      }
    }

    doStep();
  }

  document.getElementById('search-btn').onclick = function() { runSearch(false); };
  document.getElementById('search-step').onclick = function() {
    if (stepResolve) {
      stepResolve();
    } else {
      runSearch(true);
    }
  };

  document.getElementById('search-prefix').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('search-btn').click();
  });

  document.getElementById('search-reset').onclick = function() {
    animating = false;
    stepResolve = null;
    clearResults();
    draw();
    document.getElementById('search-info').textContent =
      'Type a prefix and search. Words: ' + words.join(', ');
    document.getElementById('search-prefix').value = 'ca';
  };

  document.getElementById('search-speed').oninput = function() {
    document.getElementById('search-speed-val').textContent = this.value;
  };
})();
</script>

Observe the prefix sharing in action. Searching for `"ca"` immediately narrows down to `cat`, `car`, `card`, `care`, `can`, and `cape`, all reachable from the `c → a` path. The trie does not need to scan every stored word; it follows pointers directly to the relevant subtree.

---

## Building a Complete Trie

Let us put insertion and search together into a complete interactive demo where you can build a trie from scratch, insert words, and search for prefixes all in one place. Toggle between Insert and Search modes, and try building a trie of related words to see how prefixes are shared.

<div class="interactive-demo">
  <canvas id="full-canvas" width="680" height="380"></canvas>
  <div class="demo-controls">
    <button id="full-mode-insert" class="active">Insert Mode</button>
    <button id="full-mode-search">Search Mode</button>
    <span style="color:var(--text-secondary);">|</span>
    <label>Input: <input type="text" id="full-input" value="bat" maxlength="10" placeholder="a-z only"></label>
    <button id="full-go">Go</button>
    <button id="full-clear">Clear All</button>
  </div>
  <div class="demo-info" id="full-info">Insert mode  - type a word and click Go</div>
  <div class="demo-word-list" id="full-words"></div>
  <div class="demo-caption">Settings: empty trie by default, Insert mode active. Default input: bat.</div>
</div>

<script>
(function() {
  var T = window.DSA_Trie;
  var canvas = document.getElementById('full-canvas');
  var W = 680, H = 380;
  var ctx = T.setupCanvas(canvas, W, H);

  var words = [];
  var root = new T.TrieNode('');
  var mode = 'insert';
  var animating = false;

  function updateWordList(highlight) {
    var container = document.getElementById('full-words');
    container.innerHTML = '';
    for (var i = 0; i < words.length; i++) {
      var tag = document.createElement('span');
      tag.className = 'demo-word-tag';
      if (highlight && highlight.indexOf(words[i]) >= 0) {
        tag.className += ' highlight';
      }
      tag.textContent = words[i];
      container.appendChild(tag);
    }
  }

  function draw(hlSet, hlType, pathSet) {
    T.drawTrie(ctx, root, W, H, hlSet, hlType, pathSet);
  }

  function updateInfo(msg) {
    document.getElementById('full-info').textContent = msg;
  }

  draw();
  updateWordList();

  T.onThemeChange(function() { draw(); });

  function setMode(m) {
    mode = m;
    document.getElementById('full-mode-insert').className = (m === 'insert') ? 'active' : '';
    document.getElementById('full-mode-search').className = (m === 'search') ? 'active' : '';
    if (m === 'insert') {
      updateInfo('Insert mode  - type a word and click Go');
    } else {
      updateInfo('Search mode  - type a prefix and click Go');
    }
    draw();
    updateWordList();
  }

  document.getElementById('full-mode-insert').onclick = function() { setMode('insert'); };
  document.getElementById('full-mode-search').onclick = function() { setMode('search'); };

  document.getElementById('full-go').onclick = function() {
    if (animating) return;
    var val = document.getElementById('full-input').value.toLowerCase().replace(/[^a-z]/g, '');
    if (!val) return;

    if (mode === 'insert') {
      if (words.indexOf(val) >= 0) {
        updateInfo('"' + val + '" is already in the trie.');
        return;
      }
      animating = true;
      var node = root;
      var charIndex = 0;
      var pathNodes = [root];

      function animateInsert() {
        if (charIndex < val.length) {
          var ch = val[charIndex];
          var isNew = !node.children[ch];
          if (isNew) {
            node.children[ch] = new T.TrieNode(ch);
          }
          node = node.children[ch];
          pathNodes.push(node);

          var pathSet = new Set();
          for (var p = 0; p < pathNodes.length - 1; p++) pathSet.add(pathNodes[p]);
          var hlSet = new Set();
          hlSet.add(node);
          draw(hlSet, isNew ? 'new' : 'current', pathSet);
          updateInfo('Inserting "' + val + '": ' + (isNew ? 'created' : 'followed') + ' "' + ch + '"');

          charIndex++;
          setTimeout(animateInsert, 350);
        } else {
          node.isEnd = true;
          words.push(val);
          words.sort();
          var endSet = new Set();
          endSet.add(node);
          draw(endSet, 'match', new Set());
          updateInfo('Inserted "' + val + '"!');
          updateWordList([val]);

          setTimeout(function() {
            draw();
            updateWordList();
            animating = false;
          }, 600);
        }
      }
      animateInsert();

    } else {
      // Search mode
      animating = true;
      var sNode = root;
      var sCharIndex = 0;
      var sPathNodes = [root];
      var failed2 = false;

      function animateSearch() {
        if (sCharIndex < val.length && !failed2) {
          var ch2 = val[sCharIndex];
          if (!sNode.children[ch2]) {
            failed2 = true;
            var fSet = new Set(sPathNodes);
            draw(fSet, 'current', new Set());
            updateInfo('Prefix "' + val + '": "' + ch2 + '" not found  - no matches.');
            updateWordList();
            animating = false;
            return;
          }
          sNode = sNode.children[ch2];
          sPathNodes.push(sNode);

          var pSet = new Set();
          for (var p2 = 0; p2 < sPathNodes.length - 1; p2++) pSet.add(sPathNodes[p2]);
          var hSet = new Set();
          hSet.add(sNode);
          draw(hSet, 'current', pSet);
          updateInfo('Searching "' + val + '": matched "' + ch2 + '"');

          sCharIndex++;
          setTimeout(animateSearch, 350);
        } else if (!failed2) {
          var results = [];
          T.collectWords(sNode, val, results);
          var subtree = T.getSubtreeNodes(sNode);
          var mSet = new Set(subtree);
          var fpSet = new Set(sPathNodes);
          draw(mSet, 'match', fpSet);
          updateInfo('Found ' + results.length + ' word(s) with prefix "' + val + '": ' + results.join(', '));
          updateWordList(results);
          animating = false;
        }
      }
      animateSearch();
    }
  };

  document.getElementById('full-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('full-go').click();
  });

  document.getElementById('full-clear').onclick = function() {
    if (animating) return;
    words = [];
    root = new T.TrieNode('');
    draw();
    updateWordList();
    updateInfo(mode === 'insert' ? 'Insert mode  - type a word and click Go' : 'Search mode  - type a prefix and click Go');
  };
})();
</script>

---

## Trie Deletion

Deleting a word from a trie is more nuanced than insertion. We cannot simply remove the end-of-word marker; we also need to clean up any nodes that are no longer part of another word's path.

The algorithm first walks the trie to find the word. If the word exists (the final node has `is_end = True`), it sets `is_end = False`. Then it cleans up by working backwards from the last character, removing nodes that are not the end of another word (`is_end = False`) and have no other children. This ensures we do not accidentally remove nodes that are shared with other words.

```python
def delete(self, word):
    """Delete a word from the trie."""
    self._delete(self.root, word, 0)

def _delete(self, node, word, depth):
    """Recursively delete, returning True if parent should remove this node."""
    if not node:
        return False

    if depth == len(word):
        # Reached end of word
        if not node.is_end:
            return False  # Word not in trie
        node.is_end = False
        # Delete node if it has no children
        return len(node.children) == 0

    char = word[depth]
    if char not in node.children:
        return False

    should_delete = self._delete(node.children[char], word, depth + 1)

    if should_delete:
        del node.children[char]
        # Delete current node if not end of another word and has no children
        return not node.is_end and len(node.children) == 0

    return False
```

The time complexity is $$O(m)$$ where $$m$$ is the length of the word to delete.

Consider deleting `"card"` from a trie containing `"car"`, `"card"`, `"care"`. We walk to `c → a → r → d` where the node `d` has `is_end = True`, set `d.is_end = False`, and since node `d` has no children we remove it from `r`'s children. Node `r` still has `is_end = True` (for "car") and has child `e` (for "care"), so we stop here. The shared prefix `c → a → r` remains intact because it is used by other words. The demo below visualizes this: the algorithm walks to the word, unmarks the end-of-word flag, and cleans up any orphaned nodes (shown in red before removal).

<div class="interactive-demo">
  <canvas id="delete-canvas" width="680" height="350"></canvas>
  <div class="demo-controls">
    <label>Word: <input type="text" id="delete-word" value="card" maxlength="10" placeholder="a-z only"></label>
    <button id="delete-btn">Delete</button>
    <button id="delete-reset">Reset</button>
    <label>Speed: <input type="range" id="delete-speed" min="1" max="10" value="5"> <span class="demo-value" id="delete-speed-val">5</span></label>
  </div>
  <div class="demo-info" id="delete-info">Words: cat, car, card, care, can, cape, do, dog</div>
  <div class="demo-word-list" id="delete-words"></div>
  <div class="demo-caption">Settings: trie pre-loaded with cat, car, card, care, can, cape, do, dog. Default word to delete: card.</div>
</div>

<script>
(function() {
  var T = window.DSA_Trie;
  var canvas = document.getElementById('delete-canvas');
  var W = 680, H = 350;
  var ctx = T.setupCanvas(canvas, W, H);

  var initialWords = ['cat', 'car', 'card', 'care', 'can', 'cape', 'do', 'dog'];
  var words = initialWords.slice();
  var root = T.buildTrie(words);
  var animating = false;

  function updateWordList() {
    var container = document.getElementById('delete-words');
    container.innerHTML = '';
    for (var i = 0; i < words.length; i++) {
      var tag = document.createElement('span');
      tag.className = 'demo-word-tag';
      tag.textContent = words[i];
      container.appendChild(tag);
    }
  }

  function draw(hlSet, hlType, pathSet) {
    T.drawTrie(ctx, root, W, H, hlSet, hlType, pathSet);
    document.getElementById('delete-info').textContent = 'Words: ' + words.join(', ');
  }

  draw();
  updateWordList();
  T.onThemeChange(function() { draw(); });

  document.getElementById('delete-btn').onclick = function() {
    if (animating) return;
    var word = document.getElementById('delete-word').value.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return;

    if (words.indexOf(word) < 0) {
      document.getElementById('delete-info').textContent = '"' + word + '" is not in the trie.';
      return;
    }

    animating = true;
    var speed = parseInt(document.getElementById('delete-speed').value) || 5;
    var delay = Math.max(200, 1000 - speed * 80);

    // Phase 1: walk to the word, highlighting the path
    var pathNodes = T.getPathNodes(root, word);
    var step = 0;

    function animateWalk() {
      if (step < pathNodes.length) {
        var pathSet = new Set();
        for (var p = 0; p < step; p++) pathSet.add(pathNodes[p]);
        var hlSet = new Set();
        hlSet.add(pathNodes[step]);
        draw(hlSet, 'current', pathSet);

        if (step === 0) {
          document.getElementById('delete-info').textContent =
            'Deleting "' + word + '"  - starting at root';
        } else {
          document.getElementById('delete-info').textContent =
            'Deleting "' + word + '"  - traversing to "' + word[step - 1] + '"';
        }

        step++;
        setTimeout(animateWalk, delay);
      } else {
        // Phase 2: highlight the target node in red
        var targetNode = pathNodes[pathNodes.length - 1];
        var redSet = new Set();
        redSet.add(targetNode);
        var fullPath = new Set();
        for (var p2 = 0; p2 < pathNodes.length - 1; p2++) fullPath.add(pathNodes[p2]);
        draw(redSet, 'delete', fullPath);
        document.getElementById('delete-info').textContent =
          'Found "' + word + '"  - removing end-of-word marker...';

        setTimeout(function() {
          // Phase 3: figure out which nodes to remove
          // Determine nodes that will be removed (backwards from end)
          var nodesToRemove = [];
          for (var i = pathNodes.length - 1; i >= 1; i--) {
            var n = pathNodes[i];
            // Check if this node would be removed after deletion
            // A node is removed if: it's not end-of-word for another word AND has no children (after child removal)
            var isEndOfOtherWord = n.isEnd && (i < pathNodes.length - 1);
            var childCount = Object.keys(n.children).length;
            // After potential removal of the child we already decided to remove
            if (nodesToRemove.length > 0 && i < pathNodes.length - 1) {
              // This node would lose one child (the one we're removing)
              childCount = childCount - 1;
            }
            if (i === pathNodes.length - 1) {
              // This is the target node
              if (Object.keys(n.children).length === 0) {
                nodesToRemove.push(i);
              }
              // If it has children, we just unmark is_end, no removal
            } else {
              if (!n.isEnd && childCount === 0) {
                nodesToRemove.push(i);
              } else {
                break; // Stop  - this node is needed
              }
            }
          }

          // Actually delete the word
          T.trieDelete(root, word);
          words = words.filter(function(w) { return w !== word; });

          if (nodesToRemove.length > 0) {
            // Show which nodes got removed
            draw();
            document.getElementById('delete-info').textContent =
              'Deleted "' + word + '" and cleaned up ' + nodesToRemove.length + ' orphaned node(s).';
          } else {
            draw();
            document.getElementById('delete-info').textContent =
              'Deleted "' + word + '"  - node kept (shared by other words).';
          }
          updateWordList();

          animating = false;
        }, delay);
      }
    }

    animateWalk();
  };

  document.getElementById('delete-word').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('delete-btn').click();
  });

  document.getElementById('delete-reset').onclick = function() {
    if (animating) return;
    words = initialWords.slice();
    root = T.buildTrie(words);
    draw();
    updateWordList();
    document.getElementById('delete-word').value = 'card';
  };

  document.getElementById('delete-speed').oninput = function() {
    document.getElementById('delete-speed-val').textContent = this.value;
  };
})();
</script>

---

## Trie vs Hash Table

When should you use a trie instead of a hash table?

| Operation | Trie | Hash Table |
|---|---|---|
| **Exact search** | $$O(m)$$ | $$O(m)$$ average |
| **Prefix search** | $$O(m + k)$$ | $$O(n \cdot m)$$  - must scan all keys |
| **Autocomplete** | Natural  - walk subtree | Not directly supported |
| **Sorted iteration** | Natural  - DFS gives sorted order | Requires separate sort |
| **Space** | Can be large (pointer overhead) | Generally more compact |
| **Worst-case search** | Always $$O(m)$$ | $$O(n)$$ with hash collisions |

Use a trie when you need prefix-based lookups (autocomplete, spell checking), sorted iteration over keys, when keys share common prefixes so the trie can compress shared structure, or when worst-case guarantees matter and you cannot tolerate hash collision issues. Use a hash table instead when you only need exact key lookups, when memory is constrained, or when keys are not strings (tries work best with character sequences).

---

## Practical Applications

### 1. Autocomplete Systems

Every search engine and text editor uses some form of prefix matching. A trie stores the dictionary of suggestions and returns all matches for the user's current input in $$O(m)$$ time, where $$m$$ is the length of what has been typed so far.

### 2. Spell Checking

A spell checker stores a dictionary in a trie. To check if a word is valid, search for it in $$O(m)$$ time. To suggest corrections, you can traverse nearby branches (edit distance variants on tries).

### 3. IP Routing (Longest Prefix Match)

Network routers use a specialized trie (often a Patricia trie or radix tree) to find the longest matching prefix for an IP address. This determines which network interface to forward a packet to.

### 4. Word Games

Games like Scrabble and Boggle use tries to quickly verify whether a sequence of letters forms a valid word or a valid prefix of a word, enabling efficient board traversal with pruning.

---

## Space Optimization: Compressed Tries

A standard trie can waste space when chains of single-child nodes exist. For example, if the only word starting with `"u"` is `"unique"`, the trie stores five single-child nodes: `u → n → i → q → u → e`. A compressed trie (also called a radix tree or Patricia trie) merges these single-child chains into single nodes with multi-character labels:

```
Standard trie:     root → u → n → i → q → u → e
Compressed trie:   root → "unique"
```

This reduces the number of nodes significantly while preserving $$O(m)$$ search time.

```python
class CompressedTrieNode:
    def __init__(self):
        self.children = {}  # first_char -> (label, node)
        self.is_end = False

def compressed_insert(root, word):
    """Insert into a compressed trie (simplified)."""
    node = root
    i = 0
    while i < len(word):
        char = word[i]
        if char not in node.children:
            # No match  - create new edge with remaining string
            new_node = CompressedTrieNode()
            new_node.is_end = True
            node.children[char] = (word[i:], new_node)
            return
        label, child = node.children[char]
        # Check how much of the label matches
        j = 0
        while j < len(label) and i + j < len(word) and label[j] == word[i + j]:
            j += 1
        if j == len(label):
            # Full label matched, continue to child
            node = child
            i += j
        else:
            # Partial match  - split the edge
            split_node = CompressedTrieNode()
            split_node.children[label[j]] = (label[j:], child)
            new_leaf = CompressedTrieNode()
            new_leaf.is_end = True
            split_node.children[word[i + j]] = (word[i + j:], new_leaf)
            node.children[char] = (label[:j], split_node)
            return
    node.is_end = True
```

---

## Complete Trie Implementation

Here is a complete, production-style trie implementation in Python:

```python
class TrieNode:
    """A single node in the trie."""
    __slots__ = ['children', 'is_end']

    def __init__(self):
        self.children = {}
        self.is_end = False


class Trie:
    """A trie (prefix tree) for string storage and retrieval."""

    def __init__(self):
        self.root = TrieNode()
        self._size = 0

    def insert(self, word):
        """Insert a word into the trie. O(m) time."""
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        if not node.is_end:
            node.is_end = True
            self._size += 1

    def search(self, word):
        """Return True if the exact word exists. O(m) time."""
        node = self._find_node(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        """Return True if any word starts with prefix. O(m) time."""
        return self._find_node(prefix) is not None

    def delete(self, word):
        """Delete a word from the trie. O(m) time."""
        if self._delete(self.root, word, 0):
            self._size -= 1

    def autocomplete(self, prefix, limit=10):
        """Return up to `limit` words starting with prefix. O(m + k) time."""
        node = self._find_node(prefix)
        if not node:
            return []
        results = []
        self._collect(node, prefix, results, limit)
        return results

    def __len__(self):
        return self._size

    def __contains__(self, word):
        return self.search(word)

    # --- Private helpers ---

    def _find_node(self, prefix):
        """Walk trie to the node at end of prefix, or None."""
        node = self.root
        for char in prefix:
            if char not in node.children:
                return None
            node = node.children[char]
        return node

    def _collect(self, node, prefix, results, limit):
        """DFS to collect words from node."""
        if len(results) >= limit:
            return
        if node.is_end:
            results.append(prefix)
        for char in sorted(node.children):
            self._collect(node.children[char], prefix + char, results, limit)

    def _delete(self, node, word, depth):
        """Recursively delete. Returns True if word was found and deleted."""
        if depth == len(word):
            if not node.is_end:
                return False
            node.is_end = False
            return True
        char = word[depth]
        if char not in node.children:
            return False
        deleted = self._delete(node.children[char], word, depth + 1)
        if deleted:
            child = node.children[char]
            if not child.is_end and len(child.children) == 0:
                del node.children[char]
        return deleted
```

**Usage example:**

```python
trie = Trie()

# Insert words
for word in ["cat", "car", "card", "care", "do", "dog"]:
    trie.insert(word)

# Exact search
print(trie.search("car"))     # True
print(trie.search("ca"))      # False (not a complete word)

# Prefix check
print(trie.starts_with("ca")) # True
print(trie.starts_with("bat"))# False

# Autocomplete
print(trie.autocomplete("ca"))# ['can', 'car', 'card', 'care', 'cat']

# Delete
trie.delete("card")
print(trie.search("card"))    # False
print(trie.search("car"))     # True (still exists)

# Size
print(len(trie))              # 5
```

---

## Key Takeaways

| Concept | Key Idea |
|---|---|
| Structure | Each path from root to a marked node represents a stored word, with characters on edges and an `is_end` flag for completeness. |
| $$O(m)$$ Operations | Insert, search, and delete run in $$O(m)$$ time, independent of how many keys the trie contains. |
| Prefix Power | Autocomplete via prefix search runs in $$O(m + k)$$ time, something hash tables cannot match without scanning every key. |
| Deletion | Must walk backward and prune orphaned nodes that are no longer part of any word's path. |
| Space Tradeoff | Tries use more memory than hash tables; compressed variants like radix trees reduce the overhead. |
| Applications | Autocomplete, spell checking, IP routing, and word games, anywhere fast prefix matching is needed. |

---

## What's Next?

Tries are the foundation for more advanced string data structures: radix trees (Patricia tries) compress single-child chains for better space efficiency, suffix trees store all suffixes of a string and enable powerful substring operations, and ternary search trees combine trie-like prefix matching with BST-like space efficiency.

Explore the full [DSA in Python series]({{ site.baseurl }}/dsa/).
