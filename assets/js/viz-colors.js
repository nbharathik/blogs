/* ============================================================
   window.Viz - centralized color palette for canvas demos
   ------------------------------------------------------------
   Posts call window.Viz.colors() in their inline scripts to
   get a palette object with semantic keys (point, line, bar,
   nodeNew, etc.). All values trace back to CSS variables in
   assets/css/style.css, so a single edit there retunes every
   interactive visualization site-wide.

   API:
     Viz.colors()                  -> palette object (read fresh each call)
     Viz.onThemeChange(cb)         -> register callback for data-theme flips
     Viz.setupCanvas(canvas, w, h) -> DPR-scaled 2D context
     Viz.isDark()                  -> bool
     Viz.rgba(hex, alpha)          -> rgba string from hex + alpha
   ============================================================ */
window.Viz = (function() {
  function _read(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function _isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }
  function _rgba(hex, alpha) {
    var h = (hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function(c) { return c + c; }).join('');
    if (h.length < 6) return 'rgba(0,0,0,' + alpha + ')';
    var r = parseInt(h.substring(0, 2), 16);
    var g = parseInt(h.substring(2, 4), 16);
    var b = parseInt(h.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }
  function _rgb(hex) {
    var h = (hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function(c) { return c + c; }).join('');
    return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
  }

  function colors() {
    var dark = _isDark();

    // Read base colors from CSS (chrome + viz palette)
    var bg     = _read('--bg-primary',   dark ? '#12131a' : '#ffffff');
    var bgAlt  = _read('--bg-secondary', dark ? '#1a1b26' : '#f6f7fb');
    var bgTert = _read('--bg-tertiary',  dark ? '#24283b' : '#e8eaf2');
    var text   = _read('--text-primary', dark ? '#ededf0' : '#1a1a2e');
    var muted  = _read('--text-secondary', dark ? '#b0b0c0' : '#4a4a6a');
    var border = _read('--border',       dark ? '#24283b' : '#e5e7eb');
    var accent = _read('--accent',       dark ? '#5d8de8' : '#34548a');
    var blue   = accent;
    var green  = _read('--viz-green',  dark ? '#9ece6a' : '#16a34a');
    var orange = _read('--viz-orange', dark ? '#ff9e64' : '#d97706');
    var pink   = _read('--viz-pink',   dark ? '#f9a8d4' : '#ec4899');
    var red    = _read('--viz-red',    dark ? '#f7768e' : '#dc2626');
    var cyan   = _read('--viz-cyan',   dark ? '#7dcfff' : '#0891b2');
    var yellow = _read('--viz-yellow', dark ? '#fde047' : '#facc15');
    var grid   = _read('--viz-grid',   dark ? '#24283b' : '#e5e7eb');
    var vMute  = _read('--viz-muted',  dark ? '#565f89' : '#6b7280');

    // Pre-computed alpha fills (frequent in posts)
    var redFill    = _rgba(red,    dark ? 0.35 : 0.20);
    var greenFill  = _rgba(green,  dark ? 0.30 : 0.15);
    var blueFill   = _rgba(blue,   dark ? 0.18 : 0.13);
    var pinkFill   = _rgba(pink,   dark ? 0.18 : 0.13);
    var orangeFill = _rgba(orange, dark ? 0.18 : 0.13);

    // Cluster palette (categorical, used by k-means / dbscan / category posts).
    // No purple. Pink replaces the legacy violet slot.
    var clusters = dark
      ? ['#7aa2f7','#9ece6a','#ff9e64','#f9a8d4','#7dcfff','#fde047','#ff79c6','#bb9af7']
      : ['#2563eb','#16a34a','#d97706','#ec4899','#0891b2','#ca8a04','#db2777','#7c3aed'];
    // Note: the LAST two cluster slots keep magenta/violet only as a fallback for
    // posts that draw 7+ clusters and need maximum hue separation. If you want
    // strict no-purple even with many clusters, swap the last entries for warmer
    // alternatives (e.g., '#94a3b8' and '#475569').

    // Coefficient palette (15 distinct hues, used by regularization post for
    // per-feature coefficient bars). Repeats clusters then extends with extras.
    var coefColors = dark
      ? ['#7aa2f7','#9ece6a','#ff9e64','#f9a8d4','#7dcfff','#fde047','#ff79c6','#bb9af7',
         '#5eead4','#fb923c','#a3e635','#fca5a5','#67e8f9','#facc15','#c4b5fd']
      : ['#2563eb','#16a34a','#d97706','#ec4899','#0891b2','#ca8a04','#db2777','#7c3aed',
         '#0d9488','#ea580c','#65a30d','#dc2626','#0e7490','#a16207','#6366f1'];

    return {
      // ---- Surfaces ----
      bg: bg, bgAlt: bgAlt, bgSec: bgAlt, bgSecondary: bgAlt, bgTertiary: bgTert,

      // ---- Text ----
      text: text, textMuted: muted, textSec: muted, textTertiary: muted,
      textOnNode: '#ffffff', textOnBox: '#ffffff', textOnCell: '#ffffff', textOnColor: '#ffffff',

      // ---- Grids / borders ----
      grid: grid, border: border,

      // ---- Accent palette (semantic) ----
      accent: blue, accent2: green, accent3: orange, accent4: pink,
      blue: blue, green: green, orange: orange, pink: pink,
      red: red, cyan: cyan, yellow: yellow,
      // Legacy alias: posts that referenced "purple" semantic now get pink.
      purple: pink,

      // ---- Status ----
      error: red, errorFill: redFill, errorStroke: red,
      success: green, valid: green, warn: orange,
      positive: green, negative: red, waiting: vMute,

      // ---- Regression / scatter ----
      point: blue, pointStroke: dark ? '#3d59a1' : '#1d4ed8',
      line: orange, path: green,
      curve1: blue, curve2: green, curve3: orange,
      trueFunc: pink, boundary: pink,
      contourHigh: red, contourLow: blue,
      crosshair: vMute,
      pointFail: red, pointFailBg: redFill, pointFailStroke: red,
      pointPass: green, pointPassBg: greenFill, pointPassStroke: green,
      axis: muted,

      // ---- Bars (sorting / DP) ----
      bar: blue, barAlt: dark ? '#414868' : '#cbd5e1',
      barNew: pink, barCompare: orange, barCurrent: blue, barMin: green,
      barPivot: pink, barSorted: green, barSortedRegion: greenFill,
      barSwap: orange, barSettled: green,
      dpBar: vMute, dpBarActive: blue,

      // ---- Tree / graph nodes ----
      node: blue, nodeNew: green, nodeMatch: green,
      nodeCollision: pink, nodeBalanced: green,
      nodeBlack: dark ? '#1a1b26' : '#1a1a2e',
      nodeRed: red, nodeImbalanced: orange,
      nodeEnd: vMute, nodeGhost: bgAlt, nodeMuted: bgAlt,
      nodeDelete: red, nodeCurrent: blue, nodeFound: green,
      nodeHighlight: pink, nodePath: orange, nodeSettled: green,
      nodeSwap: orange, nodeVisited: vMute,

      // ---- Edges ----
      edge: vMute, edgeHighlight: blue, edgeMatch: green,

      // ---- Cells (search / grid) ----
      cell: bgAlt,
      cellActive: blue, cellChecked: green, cellCurrent: blue,
      cellDelete: red, cellEliminated: vMute, cellExclude: bgAlt,
      cellFilled: blue, cellFound: green, cellInclude: green,
      cellInsert: pink, cellMatch: green, cellMid: pink,
      cellNotFound: red, cellPath: orange, cellReplace: pink,

      // ---- Stack / queue boxes ----
      box: blue, boxMatch: green, boxMismatch: red,
      boxNew: pink, boxPeek: orange, boxPop: vMute,

      // ---- Hash tables ----
      arrow: vMute, arrowHighlight: blue,
      asciiChar: blue, asciiVal: vMute,
      bucket: bgAlt, bucketEmpty: bgAlt, bucketHighlight: blue,
      modResult: pink,

      // ---- Gradient descent variants ----
      adam: orange, momentum: blue, rmsprop: green, sgd: pink,

      // ---- Regularization ----
      elastic: pink,
      l1Border: orange, l1Region: orangeFill,
      l2Border: blue,   l2Region: blueFill,
      lasso: orange, ridge: blue, unregularized: vMute,

      // ---- Activations ----
      elu: orange, gelu: green, leaky: vMute, relu: blue,
      sigmoid: pink, swish: cyan, tanh: green,

      // ---- Classification ----
      class0: blue, class0bg: blueFill, class0Light: blueFill,
      class0Mid: _rgba(blue, dark ? 0.30 : 0.22),
      class0RGB: _rgb(blue),
      class0Stroke: dark ? '#3d59a1' : '#1d4ed8',
      class1: pink, class1bg: pinkFill, class1Light: pinkFill,
      class1Mid: _rgba(pink, dark ? 0.30 : 0.22),
      class1RGB: _rgb(pink),
      class1Stroke: dark ? '#a8537a' : '#9d174d',
      class2: green, class2bg: greenFill, class2Light: greenFill,
      class2Mid: _rgba(green, dark ? 0.30 : 0.22),
      class2RGB: _rgb(green),
      class2Stroke: dark ? '#5a8a4a' : '#15803d',
      region0: _rgba(blue, 0.08), region1: _rgba(pink, 0.08), region2: _rgba(green, 0.08),

      // ---- DP / Trees specifics ----
      balanceFactor: vMute, balanceOk: green,
      treeLine: vMute, treeNode: blue, treeNodeNew: green,
      treeNodeMatch: green, treeNodeMuted: bgAlt,
      treeNodeActive: blue, treeNodeDuplicate: pink, treeNodeCached: pink,

      // ---- Tries ----
      rootBg: bgAlt, rootBorder: blue,

      // ---- UI ----
      btnBg: bgTert, pointer: blue,
      highlight: pink,

      // ---- KNN / SVM / decision trees specifics ----
      query: pink, neighbor: orange,
      margin: orange, sv: pink,
      split: pink, leaf0: blue, leaf1: pink,

      // ---- DBSCAN ----
      noise: vMute, core: blue, borderPt: green,
      dendro: vMute, cutLine: pink,

      // ---- K-means ----
      centroid: pink, centroidStroke: dark ? '#3d59a1' : '#1d4ed8',

      // ---- Backprop ----
      forward: blue, forwardGlow: blueFill,
      backward: pink, backwardGlow: pinkFill,

      // ---- Feature engineering / heatmaps ----
      pointAlt: orange,
      heatLow: blue, heatMid: vMute,
      heatPos: green, heatNeg: red,

      // ---- Confusion matrix / ROC ----
      tp: green, tn: blue, fp: red, fn: orange,
      tpBg: greenFill, tnBg: blueFill, fpBg: redFill, fnBg: orangeFill,
      auc: orange,
      fold: blue, foldVal: orange,
      foldBg: blueFill, foldValBg: orangeFill,

      // ---- PCA ----
      pc1: blue, pc2: green, pc3: orange,
      pointLight: blueFill, projection: pink,
      cluster0: clusters[0], cluster1: clusters[1], cluster2: clusters[2],

      // ---- Theme flag ----
      isDark: dark, dark: dark,

      // ---- 3D plane (regression-multivariate) ----
      plane: _rgba(blue, dark ? 0.18 : 0.12),
      planeLine: _rgba(blue, dark ? 0.32 : 0.22),

      // ---- Per-tree palette (random forests) ----
      treeColors: clusters,

      // ---- Cluster categorical palette ----
      clusters: clusters,
      coefColors: coefColors,

      // ---- Misc ----
      'null': vMute
    };
  }

  var _listeners = [];
  function onThemeChange(cb) {
    _listeners.push(cb);
    if (!onThemeChange._observed) {
      new MutationObserver(function() {
        _listeners.forEach(function(f) { try { f(); } catch (e) {} });
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      onThemeChange._observed = true;
    }
  }

  function setupCanvas(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    return ctx;
  }

  return {
    colors: colors,
    onThemeChange: onThemeChange,
    setupCanvas: setupCanvas,
    isDark: _isDark,
    rgba: _rgba
  };
})();
