---
layout: post
title: "Theme Gallery: Pick One (Light + Dark)"
author: bharathikannan
categories: [Meta]
hidden: true
description: "Side-by-side theme variations for the blog, each with a paired light + dark palette. Toggle the site theme from the header to see every card swap simultaneously. Same sample content in every card so only the palette varies."
permalink: /theme-preview/
date: 2026-04-25
---

<style>
/* ============================================================
   Theme gallery
   ------------------------------------------------------------
   Each card is identified by data-tid="NN". Colors are defined
   twice per card: once as defaults (light), once under
   [data-theme="dark"]. The site's existing theme toggle in the
   header sets data-theme on <html>, so toggling switches every
   card at once. Swatches and SVG charts read from the same vars,
   so they auto-update too.
   ============================================================ */
.tg-intro {
  margin: 1.5rem 0 2rem;
  padding: 1rem 1.2rem;
  border-left: 3px solid var(--accent);
  background: var(--bg-secondary);
  border-radius: 0 8px 8px 0;
  font-size: 0.95rem;
}
.tg-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; margin: 1.5rem 0;
}
@media (max-width: 800px) { .tg-grid { grid-template-columns: 1fr; } }

.tg-card {
  background: var(--card-bg);
  color: var(--card-text);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 1rem 1.1rem 1.1rem;
  display: flex; flex-direction: column; gap: 0.6rem;
  position: relative; overflow: hidden;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.tg-card .tg-name {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--card-muted); font-weight: 600; margin-bottom: 0.1rem;
}
.tg-card .tg-name .tg-num {
  font-family: 'JetBrains Mono', monospace;
  background: var(--card-bg2); color: var(--card-muted);
  padding: 1px 7px; border-radius: 999px; font-size: 0.72rem;
}
.tg-card .tg-swatches { display: flex; gap: 4px; margin-bottom: 0.2rem; }
.tg-card .tg-sw {
  width: 22px; height: 14px; border-radius: 3px;
  border: 1px solid var(--card-border);
}
.tg-card h4 {
  margin: 0; color: var(--card-text);
  font-size: 1.05rem; font-weight: 700;
}
.tg-card .tg-meta { font-size: 0.78rem; color: var(--card-muted); margin-top: -0.2rem; }
.tg-card p { margin: 0; color: var(--card-text); font-size: 0.88rem; line-height: 1.55; }
.tg-card .tg-link {
  color: var(--card-accent); text-decoration: none;
  border-bottom: 1px solid var(--card-accent-light);
}
.tg-card .tg-link:hover {
  color: var(--card-accent-hover); border-bottom-color: var(--card-accent);
}
.tg-card .tg-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.tg-card .tg-tag {
  display: inline-block;
  background: var(--card-tag-bg); color: var(--card-tag-text);
  font-size: 0.74rem; font-weight: 500;
  padding: 0.18rem 0.55rem; border-radius: 999px;
}
.tg-card .tg-btn {
  background: var(--card-accent); color: var(--card-bg);
  border: none; padding: 0.35rem 0.8rem; border-radius: 6px;
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
}
.tg-card .tg-btn-ghost {
  background: transparent; color: var(--card-accent);
  border: 1px solid var(--card-accent);
  padding: 0.32rem 0.78rem; border-radius: 6px;
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
}
.tg-card .tg-code {
  font-family: 'JetBrains Mono', monospace; font-size: 0.78rem;
  background: var(--card-bg2); color: var(--card-text);
  padding: 0.15rem 0.4rem; border-radius: 4px;
}
.tg-card blockquote {
  margin: 0; padding: 0.4rem 0.7rem;
  border-left: 3px solid var(--card-accent);
  background: var(--card-accent-light);
  font-style: italic; font-size: 0.82rem;
  color: var(--card-text);
  border-radius: 0 6px 6px 0;
}
.tg-card .tg-chart {
  display: block; margin-top: 0.2rem;
  border-radius: 6px; background: var(--card-bg2); padding: 0.5rem;
}
.tg-card .tg-hexes {
  margin-top: auto; padding-top: 0.6rem;
  border-top: 1px dashed var(--card-border);
  font-family: 'JetBrains Mono', monospace; font-size: 0.72rem;
  color: var(--card-muted);
  display: flex; flex-wrap: wrap; gap: 0.4rem 0.9rem;
}
.tg-card .tg-hexes b { font-weight: 600; color: var(--card-text); }
.tg-card .tg-hexes-dark { display: none; }
[data-theme="dark"] .tg-card .tg-hexes-light { display: none; }
[data-theme="dark"] .tg-card .tg-hexes-dark { display: flex; }

/* ============================================================
   PER-THEME COLOR DEFINITIONS
   Each block: light defaults first, then [data-theme="dark"]
   override.
   ============================================================ */

/* ---------- 01. Current (Indigo) ---------- */
.tg-card[data-tid="01"] {
  --card-bg: #ffffff; --card-bg2: #f8f9fa;
  --card-text: #1a1a2e; --card-muted: #4a4a6a;
  --card-accent: #6366f1; --card-accent-hover: #4f46e5;
  --card-accent-light: rgba(99,102,241,0.10);
  --card-tag-bg: #eef2ff; --card-tag-text: #4338ca;
  --card-border: #e5e7eb;
}
[data-theme="dark"] .tg-card[data-tid="01"] {
  --card-bg: #0f0f1a; --card-bg2: #1a1a2e;
  --card-text: #e4e4ef; --card-muted: #a0a0bc;
  --card-accent: #818cf8; --card-accent-hover: #a5b4fc;
  --card-accent-light: rgba(129,140,248,0.15);
  --card-tag-bg: rgba(129,140,248,0.15); --card-tag-text: #a5b4fc;
  --card-border: #2a2a45;
}

/* ---------- 02. Linear App ---------- */
.tg-card[data-tid="02"] {
  --card-bg: #ffffff; --card-bg2: #f7f8f8;
  --card-text: #08090a; --card-muted: #5e5f63;
  --card-accent: #5e6ad2; --card-accent-hover: #4a55b8;
  --card-accent-light: rgba(94,106,210,0.10);
  --card-tag-bg: #eef0fc; --card-tag-text: #4a55b8;
  --card-border: #e5e5e6;
}
[data-theme="dark"] .tg-card[data-tid="02"] {
  --card-bg: #08090a; --card-bg2: #131316;
  --card-text: #f7f8f8; --card-muted: #8a8b8f;
  --card-accent: #b1b4f3; --card-accent-hover: #c7c9f7;
  --card-accent-light: rgba(177,180,243,0.13);
  --card-tag-bg: rgba(177,180,243,0.13); --card-tag-text: #c7c9f7;
  --card-border: #1f1f24;
}

/* ---------- 03. Atom One Dark / Light ---------- */
.tg-card[data-tid="03"] {
  --card-bg: #fafafa; --card-bg2: #f0f0f1;
  --card-text: #383a42; --card-muted: #a0a1a7;
  --card-accent: #4078f2; --card-accent-hover: #2461db;
  --card-accent-light: rgba(64,120,242,0.10);
  --card-tag-bg: rgba(64,120,242,0.10); --card-tag-text: #2461db;
  --card-border: #e5e5e6;
}
[data-theme="dark"] .tg-card[data-tid="03"] {
  --card-bg: #282c34; --card-bg2: #21252b;
  --card-text: #abb2bf; --card-muted: #5c6370;
  --card-accent: #61afef; --card-accent-hover: #82c0ff;
  --card-accent-light: rgba(97,175,239,0.14);
  --card-tag-bg: rgba(97,175,239,0.14); --card-tag-text: #82c0ff;
  --card-border: #3e4451;
}

/* ---------- 04. GitHub Light / Dark Dimmed ---------- */
.tg-card[data-tid="04"] {
  --card-bg: #ffffff; --card-bg2: #f6f8fa;
  --card-text: #1f2328; --card-muted: #656d76;
  --card-accent: #0969da; --card-accent-hover: #0550ae;
  --card-accent-light: rgba(9,105,218,0.10);
  --card-tag-bg: #ddf4ff; --card-tag-text: #0969da;
  --card-border: #d1d9e0;
}
[data-theme="dark"] .tg-card[data-tid="04"] {
  --card-bg: #22272e; --card-bg2: #2d333b;
  --card-text: #adbac7; --card-muted: #768390;
  --card-accent: #539bf5; --card-accent-hover: #6cb6ff;
  --card-accent-light: rgba(83,155,245,0.14);
  --card-tag-bg: rgba(83,155,245,0.14); --card-tag-text: #6cb6ff;
  --card-border: #373e47;
}

/* ---------- 05. Tokyo Day / Tokyo Night ---------- */
.tg-card[data-tid="05"] {
  --card-bg: #ffffff; --card-bg2: #e1e2e7;
  --card-text: #343b58; --card-muted: #6172b0;
  --card-accent: #34548a; --card-accent-hover: #283655;
  --card-accent-light: rgba(52,84,138,0.10);
  --card-tag-bg: rgba(52,84,138,0.13); --card-tag-text: #34548a;
  --card-border: #c4c8da;
}
[data-theme="dark"] .tg-card[data-tid="05"] {
  --card-bg: #1a1b26; --card-bg2: #24283b;
  --card-text: #c0caf5; --card-muted: #7982a9;
  --card-accent: #7aa2f7; --card-accent-hover: #9ab8ff;
  --card-accent-light: rgba(122,162,247,0.14);
  --card-tag-bg: rgba(122,162,247,0.14); --card-tag-text: #9ab8ff;
  --card-border: #292e42;
}

/* ---------- 06. Nord Snow Storm / Polar Night ---------- */
.tg-card[data-tid="06"] {
  --card-bg: #eceff4; --card-bg2: #e5e9f0;
  --card-text: #2e3440; --card-muted: #4c566a;
  --card-accent: #5e81ac; --card-accent-hover: #4c6e95;
  --card-accent-light: rgba(94,129,172,0.12);
  --card-tag-bg: rgba(94,129,172,0.13); --card-tag-text: #5e81ac;
  --card-border: #d8dee9;
}
[data-theme="dark"] .tg-card[data-tid="06"] {
  --card-bg: #2e3440; --card-bg2: #3b4252;
  --card-text: #d8dee9; --card-muted: #828a9a;
  --card-accent: #88c0d0; --card-accent-hover: #a3cfdb;
  --card-accent-light: rgba(136,192,208,0.14);
  --card-tag-bg: rgba(136,192,208,0.14); --card-tag-text: #a3cfdb;
  --card-border: #434c5e;
}

/* ---------- 07. Vercel White / Black (no chrome accent) ---------- */
.tg-card[data-tid="07"] {
  --card-bg: #ffffff; --card-bg2: #fafafa;
  --card-text: #171717; --card-muted: #666666;
  --card-accent: #171717; --card-accent-hover: #000000;
  --card-accent-light: rgba(23,23,23,0.06);
  --card-tag-bg: #fafafa; --card-tag-text: #171717;
  --card-border: #eaeaea;
}
[data-theme="dark"] .tg-card[data-tid="07"] {
  --card-bg: #000000; --card-bg2: #0a0a0a;
  --card-text: #ededed; --card-muted: #888888;
  --card-accent: #ededed; --card-accent-hover: #ffffff;
  --card-accent-light: rgba(237,237,237,0.10);
  --card-tag-bg: #1a1a1a; --card-tag-text: #ededed;
  --card-border: #1f1f1f;
}

/* ---------- 08. Lilian Weng minimal ---------- */
.tg-card[data-tid="08"] {
  --card-bg: #ffffff; --card-bg2: #f7f7f7;
  --card-text: #1f2328; --card-muted: #888888;
  --card-accent: #0969da; --card-accent-hover: #0550ae;
  --card-accent-light: rgba(9,105,218,0.08);
  --card-tag-bg: #f0f0f0; --card-tag-text: #1f2328;
  --card-border: #e5e5e5;
}
[data-theme="dark"] .tg-card[data-tid="08"] {
  --card-bg: #1d1e20; --card-bg2: #26272a;
  --card-text: #d4d4d4; --card-muted: #888888;
  --card-accent: #58a6ff; --card-accent-hover: #79b8ff;
  --card-accent-light: rgba(88,166,255,0.10);
  --card-tag-bg: #2a2b2e; --card-tag-text: #d4d4d4;
  --card-border: #2e2f33;
}

/* ---------- 09. Substack sepia (warm parchment) ---------- */
.tg-card[data-tid="09"] {
  --card-bg: #fdfaf3; --card-bg2: #f7f1e3;
  --card-text: #1c1815; --card-muted: #7a7165;
  --card-accent: #a07845; --card-accent-hover: #8a6437;
  --card-accent-light: rgba(160,120,69,0.10);
  --card-tag-bg: rgba(160,120,69,0.12); --card-tag-text: #8a6437;
  --card-border: #e8dfc9;
}
[data-theme="dark"] .tg-card[data-tid="09"] {
  --card-bg: #1c1815; --card-bg2: #25201c;
  --card-text: #ece1d1; --card-muted: #8a7e6f;
  --card-accent: #d4a574; --card-accent-hover: #e8be94;
  --card-accent-light: rgba(212,165,116,0.13);
  --card-tag-bg: rgba(212,165,116,0.14); --card-tag-text: #e8be94;
  --card-border: #322a23;
}

/* ---------- 10. Anthropic warm (cream + peach) ---------- */
.tg-card[data-tid="10"] {
  --card-bg: #faf9f5; --card-bg2: #f0ece4;
  --card-text: #181818; --card-muted: #6b6453;
  --card-accent: #cc785c; --card-accent-hover: #a55a3f;
  --card-accent-light: rgba(204,120,92,0.10);
  --card-tag-bg: rgba(204,120,92,0.13); --card-tag-text: #a55a3f;
  --card-border: #e6e0d3;
}
[data-theme="dark"] .tg-card[data-tid="10"] {
  --card-bg: #1f1a14; --card-bg2: #2a241c;
  --card-text: #f5efe6; --card-muted: #968b7a;
  --card-accent: #d97757; --card-accent-hover: #e89878;
  --card-accent-light: rgba(217,119,87,0.13);
  --card-tag-bg: rgba(217,119,87,0.14); --card-tag-text: #e89878;
  --card-border: #3a2f24;
}

/* ---------- 11. Solarized Light / Dark ---------- */
.tg-card[data-tid="11"] {
  --card-bg: #fdf6e3; --card-bg2: #eee8d5;
  --card-text: #586e75; --card-muted: #93a1a1;
  --card-accent: #268bd2; --card-accent-hover: #1f6da3;
  --card-accent-light: rgba(38,139,210,0.10);
  --card-tag-bg: rgba(38,139,210,0.14); --card-tag-text: #268bd2;
  --card-border: #e6deca;
}
[data-theme="dark"] .tg-card[data-tid="11"] {
  --card-bg: #002b36; --card-bg2: #073642;
  --card-text: #cbd5cc; --card-muted: #586e75;
  --card-accent: #268bd2; --card-accent-hover: #4ba3df;
  --card-accent-light: rgba(38,139,210,0.16);
  --card-tag-bg: rgba(38,139,210,0.16); --card-tag-text: #4ba3df;
  --card-border: #073642;
}

/* ---------- 12. Catppuccin Latte / Mocha (blue) ---------- */
.tg-card[data-tid="12"] {
  --card-bg: #eff1f5; --card-bg2: #e6e9ef;
  --card-text: #4c4f69; --card-muted: #7c7f93;
  --card-accent: #1e66f5; --card-accent-hover: #1552c4;
  --card-accent-light: rgba(30,102,245,0.10);
  --card-tag-bg: rgba(30,102,245,0.12); --card-tag-text: #1e66f5;
  --card-border: #dce0e8;
}
[data-theme="dark"] .tg-card[data-tid="12"] {
  --card-bg: #1e1e2e; --card-bg2: #313244;
  --card-text: #cdd6f4; --card-muted: #7f849c;
  --card-accent: #89b4fa; --card-accent-hover: #a5c6ff;
  --card-accent-light: rgba(137,180,250,0.14);
  --card-tag-bg: rgba(137,180,250,0.14); --card-tag-text: #a5c6ff;
  --card-border: #313244;
}
</style>

<div class="tg-intro" markdown="1">
**How to use this page.** Each card below is a self-contained theme with paired light + dark palettes. Toggle the site theme from the header button (top-right) and every card swaps simultaneously, so you can validate both modes for each option without leaving this page. Same sample content in every card so the only thing that varies is the palette. Tell me a number and I'll lock that as the site theme.

No greens. Card #01 is the current site palette, included as an honest baseline.
</div>

<div class="tg-grid">

<!-- shared sample card content lives in each card; only data-tid differs -->

<!-- 01. Current (Indigo) -->
<div class="tg-card" data-tid="01">
  <div class="tg-name"><span>Current site (Indigo)</span><span class="tg-num">01</span></div>
  <div class="tg-swatches">
    <span class="tg-sw" style="background: var(--card-bg)"></span>
    <span class="tg-sw" style="background: var(--card-bg2)"></span>
    <span class="tg-sw" style="background: var(--card-accent)"></span>
    <span class="tg-sw" style="background: var(--card-accent-hover)"></span>
  </div>
  <h4>Attention is All You Need</h4>
  <div class="tg-meta">Machine Learning &middot; 6 min read</div>
  <p>The transformer architecture replaced recurrent networks with self-attention, letting any position attend to any other in constant path length. <a class="tg-link" href="#">See the interactive visualization</a>.</p>
  <div class="tg-row">
    <span class="tg-tag">transformers</span>
    <span class="tg-tag">deep learning</span>
    <span class="tg-code">softmax(QK&#8868;/&radic;d)</span>
  </div>
  <div class="tg-row">
    <button class="tg-btn">Open notebook</button>
    <button class="tg-btn-ghost">Cite</button>
  </div>
  <blockquote>All models are wrong, but some are useful.</blockquote>
  <svg class="tg-chart" width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
    <line x1="0" y1="40" x2="220" y2="40" style="stroke: var(--card-border)" stroke-width="1"/>
    <rect x="10"  y="14" width="32" height="26" rx="2" style="fill: var(--card-accent)"/>
    <rect x="50"  y="6"  width="32" height="34" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="90"  y="22" width="32" height="18" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="130" y="2"  width="32" height="38" rx="2" style="fill: var(--card-accent-hover)"/>
    <rect x="170" y="18" width="32" height="22" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
  </svg>
  <div class="tg-hexes tg-hexes-light"><b>bg</b> #ffffff <b>panel</b> #f8f9fa <b>accent</b> #6366f1 <b>text</b> #1a1a2e</div>
  <div class="tg-hexes tg-hexes-dark"><b>bg</b> #0f0f1a <b>panel</b> #1a1a2e <b>accent</b> #818cf8 <b>text</b> #e4e4ef</div>
</div>

<!-- 02. Linear App -->
<div class="tg-card" data-tid="02">
  <div class="tg-name"><span>Linear App</span><span class="tg-num">02</span></div>
  <div class="tg-swatches">
    <span class="tg-sw" style="background: var(--card-bg)"></span>
    <span class="tg-sw" style="background: var(--card-bg2)"></span>
    <span class="tg-sw" style="background: var(--card-accent)"></span>
    <span class="tg-sw" style="background: var(--card-accent-hover)"></span>
  </div>
  <h4>Attention is All You Need</h4>
  <div class="tg-meta">Machine Learning &middot; 6 min read</div>
  <p>The transformer architecture replaced recurrent networks with self-attention, letting any position attend to any other in constant path length. <a class="tg-link" href="#">See the interactive visualization</a>.</p>
  <div class="tg-row">
    <span class="tg-tag">transformers</span>
    <span class="tg-tag">deep learning</span>
    <span class="tg-code">softmax(QK&#8868;/&radic;d)</span>
  </div>
  <div class="tg-row">
    <button class="tg-btn">Open notebook</button>
    <button class="tg-btn-ghost">Cite</button>
  </div>
  <blockquote>All models are wrong, but some are useful.</blockquote>
  <svg class="tg-chart" width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
    <line x1="0" y1="40" x2="220" y2="40" style="stroke: var(--card-border)" stroke-width="1"/>
    <rect x="10"  y="14" width="32" height="26" rx="2" style="fill: var(--card-accent)"/>
    <rect x="50"  y="6"  width="32" height="34" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="90"  y="22" width="32" height="18" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="130" y="2"  width="32" height="38" rx="2" style="fill: var(--card-accent-hover)"/>
    <rect x="170" y="18" width="32" height="22" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
  </svg>
  <div class="tg-hexes tg-hexes-light"><b>bg</b> #ffffff <b>panel</b> #f7f8f8 <b>accent</b> #5e6ad2 <b>text</b> #08090a</div>
  <div class="tg-hexes tg-hexes-dark"><b>bg</b> #08090a <b>panel</b> #131316 <b>accent</b> #b1b4f3 <b>text</b> #f7f8f8</div>
</div>

<!-- 03. Atom One -->
<div class="tg-card" data-tid="03">
  <div class="tg-name"><span>Atom One</span><span class="tg-num">03</span></div>
  <div class="tg-swatches">
    <span class="tg-sw" style="background: var(--card-bg)"></span>
    <span class="tg-sw" style="background: var(--card-bg2)"></span>
    <span class="tg-sw" style="background: var(--card-accent)"></span>
    <span class="tg-sw" style="background: var(--card-accent-hover)"></span>
  </div>
  <h4>Attention is All You Need</h4>
  <div class="tg-meta">Machine Learning &middot; 6 min read</div>
  <p>The transformer architecture replaced recurrent networks with self-attention, letting any position attend to any other in constant path length. <a class="tg-link" href="#">See the interactive visualization</a>.</p>
  <div class="tg-row">
    <span class="tg-tag">transformers</span>
    <span class="tg-tag">deep learning</span>
    <span class="tg-code">softmax(QK&#8868;/&radic;d)</span>
  </div>
  <div class="tg-row">
    <button class="tg-btn">Open notebook</button>
    <button class="tg-btn-ghost">Cite</button>
  </div>
  <blockquote>All models are wrong, but some are useful.</blockquote>
  <svg class="tg-chart" width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
    <line x1="0" y1="40" x2="220" y2="40" style="stroke: var(--card-border)" stroke-width="1"/>
    <rect x="10"  y="14" width="32" height="26" rx="2" style="fill: var(--card-accent)"/>
    <rect x="50"  y="6"  width="32" height="34" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="90"  y="22" width="32" height="18" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="130" y="2"  width="32" height="38" rx="2" style="fill: var(--card-accent-hover)"/>
    <rect x="170" y="18" width="32" height="22" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
  </svg>
  <div class="tg-hexes tg-hexes-light"><b>bg</b> #fafafa <b>panel</b> #f0f0f1 <b>accent</b> #4078f2 <b>text</b> #383a42</div>
  <div class="tg-hexes tg-hexes-dark"><b>bg</b> #282c34 <b>panel</b> #21252b <b>accent</b> #61afef <b>text</b> #abb2bf</div>
</div>

<!-- 04. GitHub -->
<div class="tg-card" data-tid="04">
  <div class="tg-name"><span>GitHub Light / Dark Dimmed</span><span class="tg-num">04</span></div>
  <div class="tg-swatches">
    <span class="tg-sw" style="background: var(--card-bg)"></span>
    <span class="tg-sw" style="background: var(--card-bg2)"></span>
    <span class="tg-sw" style="background: var(--card-accent)"></span>
    <span class="tg-sw" style="background: var(--card-accent-hover)"></span>
  </div>
  <h4>Attention is All You Need</h4>
  <div class="tg-meta">Machine Learning &middot; 6 min read</div>
  <p>The transformer architecture replaced recurrent networks with self-attention, letting any position attend to any other in constant path length. <a class="tg-link" href="#">See the interactive visualization</a>.</p>
  <div class="tg-row">
    <span class="tg-tag">transformers</span>
    <span class="tg-tag">deep learning</span>
    <span class="tg-code">softmax(QK&#8868;/&radic;d)</span>
  </div>
  <div class="tg-row">
    <button class="tg-btn">Open notebook</button>
    <button class="tg-btn-ghost">Cite</button>
  </div>
  <blockquote>All models are wrong, but some are useful.</blockquote>
  <svg class="tg-chart" width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
    <line x1="0" y1="40" x2="220" y2="40" style="stroke: var(--card-border)" stroke-width="1"/>
    <rect x="10"  y="14" width="32" height="26" rx="2" style="fill: var(--card-accent)"/>
    <rect x="50"  y="6"  width="32" height="34" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="90"  y="22" width="32" height="18" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="130" y="2"  width="32" height="38" rx="2" style="fill: var(--card-accent-hover)"/>
    <rect x="170" y="18" width="32" height="22" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
  </svg>
  <div class="tg-hexes tg-hexes-light"><b>bg</b> #ffffff <b>panel</b> #f6f8fa <b>accent</b> #0969da <b>text</b> #1f2328</div>
  <div class="tg-hexes tg-hexes-dark"><b>bg</b> #22272e <b>panel</b> #2d333b <b>accent</b> #539bf5 <b>text</b> #adbac7</div>
</div>

<!-- 05. Tokyo Day / Tokyo Night -->
<div class="tg-card" data-tid="05">
  <div class="tg-name"><span>Tokyo Day / Tokyo Night</span><span class="tg-num">05</span></div>
  <div class="tg-swatches">
    <span class="tg-sw" style="background: var(--card-bg)"></span>
    <span class="tg-sw" style="background: var(--card-bg2)"></span>
    <span class="tg-sw" style="background: var(--card-accent)"></span>
    <span class="tg-sw" style="background: var(--card-accent-hover)"></span>
  </div>
  <h4>Attention is All You Need</h4>
  <div class="tg-meta">Machine Learning &middot; 6 min read</div>
  <p>The transformer architecture replaced recurrent networks with self-attention, letting any position attend to any other in constant path length. <a class="tg-link" href="#">See the interactive visualization</a>.</p>
  <div class="tg-row">
    <span class="tg-tag">transformers</span>
    <span class="tg-tag">deep learning</span>
    <span class="tg-code">softmax(QK&#8868;/&radic;d)</span>
  </div>
  <div class="tg-row">
    <button class="tg-btn">Open notebook</button>
    <button class="tg-btn-ghost">Cite</button>
  </div>
  <blockquote>All models are wrong, but some are useful.</blockquote>
  <svg class="tg-chart" width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
    <line x1="0" y1="40" x2="220" y2="40" style="stroke: var(--card-border)" stroke-width="1"/>
    <rect x="10"  y="14" width="32" height="26" rx="2" style="fill: var(--card-accent)"/>
    <rect x="50"  y="6"  width="32" height="34" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="90"  y="22" width="32" height="18" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="130" y="2"  width="32" height="38" rx="2" style="fill: var(--card-accent-hover)"/>
    <rect x="170" y="18" width="32" height="22" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
  </svg>
  <div class="tg-hexes tg-hexes-light"><b>bg</b> #ffffff <b>panel</b> #e1e2e7 <b>accent</b> #34548a <b>text</b> #343b58</div>
  <div class="tg-hexes tg-hexes-dark"><b>bg</b> #1a1b26 <b>panel</b> #24283b <b>accent</b> #7aa2f7 <b>text</b> #c0caf5</div>
</div>

<!-- 06. Nord -->
<div class="tg-card" data-tid="06">
  <div class="tg-name"><span>Nord</span><span class="tg-num">06</span></div>
  <div class="tg-swatches">
    <span class="tg-sw" style="background: var(--card-bg)"></span>
    <span class="tg-sw" style="background: var(--card-bg2)"></span>
    <span class="tg-sw" style="background: var(--card-accent)"></span>
    <span class="tg-sw" style="background: var(--card-accent-hover)"></span>
  </div>
  <h4>Attention is All You Need</h4>
  <div class="tg-meta">Machine Learning &middot; 6 min read</div>
  <p>The transformer architecture replaced recurrent networks with self-attention, letting any position attend to any other in constant path length. <a class="tg-link" href="#">See the interactive visualization</a>.</p>
  <div class="tg-row">
    <span class="tg-tag">transformers</span>
    <span class="tg-tag">deep learning</span>
    <span class="tg-code">softmax(QK&#8868;/&radic;d)</span>
  </div>
  <div class="tg-row">
    <button class="tg-btn">Open notebook</button>
    <button class="tg-btn-ghost">Cite</button>
  </div>
  <blockquote>All models are wrong, but some are useful.</blockquote>
  <svg class="tg-chart" width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
    <line x1="0" y1="40" x2="220" y2="40" style="stroke: var(--card-border)" stroke-width="1"/>
    <rect x="10"  y="14" width="32" height="26" rx="2" style="fill: var(--card-accent)"/>
    <rect x="50"  y="6"  width="32" height="34" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="90"  y="22" width="32" height="18" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="130" y="2"  width="32" height="38" rx="2" style="fill: var(--card-accent-hover)"/>
    <rect x="170" y="18" width="32" height="22" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
  </svg>
  <div class="tg-hexes tg-hexes-light"><b>bg</b> #eceff4 <b>panel</b> #e5e9f0 <b>accent</b> #5e81ac <b>text</b> #2e3440</div>
  <div class="tg-hexes tg-hexes-dark"><b>bg</b> #2e3440 <b>panel</b> #3b4252 <b>accent</b> #88c0d0 <b>text</b> #d8dee9</div>
</div>

<!-- 07. Vercel -->
<div class="tg-card" data-tid="07">
  <div class="tg-name"><span>Vercel (no chrome accent)</span><span class="tg-num">07</span></div>
  <div class="tg-swatches">
    <span class="tg-sw" style="background: var(--card-bg)"></span>
    <span class="tg-sw" style="background: var(--card-bg2)"></span>
    <span class="tg-sw" style="background: var(--card-accent)"></span>
    <span class="tg-sw" style="background: var(--card-muted)"></span>
  </div>
  <h4>Attention is All You Need</h4>
  <div class="tg-meta">Machine Learning &middot; 6 min read</div>
  <p>The transformer architecture replaced recurrent networks with self-attention, letting any position attend to any other in constant path length. <a class="tg-link" href="#">See the interactive visualization</a>.</p>
  <div class="tg-row">
    <span class="tg-tag">transformers</span>
    <span class="tg-tag">deep learning</span>
    <span class="tg-code">softmax(QK&#8868;/&radic;d)</span>
  </div>
  <div class="tg-row">
    <button class="tg-btn">Open notebook</button>
    <button class="tg-btn-ghost">Cite</button>
  </div>
  <blockquote>All models are wrong, but some are useful.</blockquote>
  <svg class="tg-chart" width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
    <line x1="0" y1="40" x2="220" y2="40" style="stroke: var(--card-border)" stroke-width="1"/>
    <rect x="10"  y="14" width="32" height="26" rx="2" style="fill: var(--card-accent); opacity: 0.6"/>
    <rect x="50"  y="6"  width="32" height="34" rx="2" style="fill: var(--card-accent); opacity: 0.45"/>
    <rect x="90"  y="22" width="32" height="18" rx="2" style="fill: var(--card-accent); opacity: 0.45"/>
    <rect x="130" y="2"  width="32" height="38" rx="2" style="fill: var(--card-accent)"/>
    <rect x="170" y="18" width="32" height="22" rx="2" style="fill: var(--card-accent); opacity: 0.45"/>
  </svg>
  <div class="tg-hexes tg-hexes-light"><b>bg</b> #ffffff <b>panel</b> #fafafa <b>accent</b> #171717 <b>text</b> #171717</div>
  <div class="tg-hexes tg-hexes-dark"><b>bg</b> #000000 <b>panel</b> #0a0a0a <b>accent</b> #ededed <b>text</b> #ededed</div>
</div>

<!-- 08. Lilian Weng minimal -->
<div class="tg-card" data-tid="08">
  <div class="tg-name"><span>Lilian Weng minimal</span><span class="tg-num">08</span></div>
  <div class="tg-swatches">
    <span class="tg-sw" style="background: var(--card-bg)"></span>
    <span class="tg-sw" style="background: var(--card-bg2)"></span>
    <span class="tg-sw" style="background: var(--card-accent)"></span>
    <span class="tg-sw" style="background: var(--card-muted)"></span>
  </div>
  <h4>Attention is All You Need</h4>
  <div class="tg-meta">Machine Learning &middot; 6 min read</div>
  <p>The transformer architecture replaced recurrent networks with self-attention, letting any position attend to any other in constant path length. <a class="tg-link" href="#">See the interactive visualization</a>.</p>
  <div class="tg-row">
    <span class="tg-tag">transformers</span>
    <span class="tg-tag">deep learning</span>
    <span class="tg-code">softmax(QK&#8868;/&radic;d)</span>
  </div>
  <div class="tg-row">
    <button class="tg-btn">Open notebook</button>
    <button class="tg-btn-ghost">Cite</button>
  </div>
  <blockquote>All models are wrong, but some are useful.</blockquote>
  <svg class="tg-chart" width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
    <line x1="0" y1="40" x2="220" y2="40" style="stroke: var(--card-border)" stroke-width="1"/>
    <rect x="10"  y="14" width="32" height="26" rx="2" style="fill: var(--card-muted)"/>
    <rect x="50"  y="6"  width="32" height="34" rx="2" style="fill: var(--card-muted); opacity: 0.7"/>
    <rect x="90"  y="22" width="32" height="18" rx="2" style="fill: var(--card-muted); opacity: 0.7"/>
    <rect x="130" y="2"  width="32" height="38" rx="2" style="fill: var(--card-accent)"/>
    <rect x="170" y="18" width="32" height="22" rx="2" style="fill: var(--card-muted); opacity: 0.7"/>
  </svg>
  <div class="tg-hexes tg-hexes-light"><b>bg</b> #ffffff <b>panel</b> #f7f7f7 <b>accent</b> #0969da <b>text</b> #1f2328</div>
  <div class="tg-hexes tg-hexes-dark"><b>bg</b> #1d1e20 <b>panel</b> #26272a <b>accent</b> #58a6ff <b>text</b> #d4d4d4</div>
</div>

<!-- 09. Substack sepia -->
<div class="tg-card" data-tid="09">
  <div class="tg-name"><span>Substack sepia (warm parchment)</span><span class="tg-num">09</span></div>
  <div class="tg-swatches">
    <span class="tg-sw" style="background: var(--card-bg)"></span>
    <span class="tg-sw" style="background: var(--card-bg2)"></span>
    <span class="tg-sw" style="background: var(--card-accent)"></span>
    <span class="tg-sw" style="background: var(--card-accent-hover)"></span>
  </div>
  <h4>Attention is All You Need</h4>
  <div class="tg-meta">Machine Learning &middot; 6 min read</div>
  <p>The transformer architecture replaced recurrent networks with self-attention, letting any position attend to any other in constant path length. <a class="tg-link" href="#">See the interactive visualization</a>.</p>
  <div class="tg-row">
    <span class="tg-tag">transformers</span>
    <span class="tg-tag">deep learning</span>
    <span class="tg-code">softmax(QK&#8868;/&radic;d)</span>
  </div>
  <div class="tg-row">
    <button class="tg-btn">Open notebook</button>
    <button class="tg-btn-ghost">Cite</button>
  </div>
  <blockquote>All models are wrong, but some are useful.</blockquote>
  <svg class="tg-chart" width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
    <line x1="0" y1="40" x2="220" y2="40" style="stroke: var(--card-border)" stroke-width="1"/>
    <rect x="10"  y="14" width="32" height="26" rx="2" style="fill: var(--card-accent)"/>
    <rect x="50"  y="6"  width="32" height="34" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="90"  y="22" width="32" height="18" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="130" y="2"  width="32" height="38" rx="2" style="fill: var(--card-accent-hover)"/>
    <rect x="170" y="18" width="32" height="22" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
  </svg>
  <div class="tg-hexes tg-hexes-light"><b>bg</b> #fdfaf3 <b>panel</b> #f7f1e3 <b>accent</b> #a07845 <b>text</b> #1c1815</div>
  <div class="tg-hexes tg-hexes-dark"><b>bg</b> #1c1815 <b>panel</b> #25201c <b>accent</b> #d4a574 <b>text</b> #ece1d1</div>
</div>

<!-- 10. Anthropic warm -->
<div class="tg-card" data-tid="10">
  <div class="tg-name"><span>Anthropic warm (cream + peach)</span><span class="tg-num">10</span></div>
  <div class="tg-swatches">
    <span class="tg-sw" style="background: var(--card-bg)"></span>
    <span class="tg-sw" style="background: var(--card-bg2)"></span>
    <span class="tg-sw" style="background: var(--card-accent)"></span>
    <span class="tg-sw" style="background: var(--card-accent-hover)"></span>
  </div>
  <h4>Attention is All You Need</h4>
  <div class="tg-meta">Machine Learning &middot; 6 min read</div>
  <p>The transformer architecture replaced recurrent networks with self-attention, letting any position attend to any other in constant path length. <a class="tg-link" href="#">See the interactive visualization</a>.</p>
  <div class="tg-row">
    <span class="tg-tag">transformers</span>
    <span class="tg-tag">deep learning</span>
    <span class="tg-code">softmax(QK&#8868;/&radic;d)</span>
  </div>
  <div class="tg-row">
    <button class="tg-btn">Open notebook</button>
    <button class="tg-btn-ghost">Cite</button>
  </div>
  <blockquote>All models are wrong, but some are useful.</blockquote>
  <svg class="tg-chart" width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
    <line x1="0" y1="40" x2="220" y2="40" style="stroke: var(--card-border)" stroke-width="1"/>
    <rect x="10"  y="14" width="32" height="26" rx="2" style="fill: var(--card-accent)"/>
    <rect x="50"  y="6"  width="32" height="34" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="90"  y="22" width="32" height="18" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="130" y="2"  width="32" height="38" rx="2" style="fill: var(--card-accent-hover)"/>
    <rect x="170" y="18" width="32" height="22" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
  </svg>
  <div class="tg-hexes tg-hexes-light"><b>bg</b> #faf9f5 <b>panel</b> #f0ece4 <b>accent</b> #cc785c <b>text</b> #181818</div>
  <div class="tg-hexes tg-hexes-dark"><b>bg</b> #1f1a14 <b>panel</b> #2a241c <b>accent</b> #d97757 <b>text</b> #f5efe6</div>
</div>

<!-- 11. Solarized -->
<div class="tg-card" data-tid="11">
  <div class="tg-name"><span>Solarized Light / Dark</span><span class="tg-num">11</span></div>
  <div class="tg-swatches">
    <span class="tg-sw" style="background: var(--card-bg)"></span>
    <span class="tg-sw" style="background: var(--card-bg2)"></span>
    <span class="tg-sw" style="background: var(--card-accent)"></span>
    <span class="tg-sw" style="background: var(--card-accent-hover)"></span>
  </div>
  <h4>Attention is All You Need</h4>
  <div class="tg-meta">Machine Learning &middot; 6 min read</div>
  <p>The transformer architecture replaced recurrent networks with self-attention, letting any position attend to any other in constant path length. <a class="tg-link" href="#">See the interactive visualization</a>.</p>
  <div class="tg-row">
    <span class="tg-tag">transformers</span>
    <span class="tg-tag">deep learning</span>
    <span class="tg-code">softmax(QK&#8868;/&radic;d)</span>
  </div>
  <div class="tg-row">
    <button class="tg-btn">Open notebook</button>
    <button class="tg-btn-ghost">Cite</button>
  </div>
  <blockquote>All models are wrong, but some are useful.</blockquote>
  <svg class="tg-chart" width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
    <line x1="0" y1="40" x2="220" y2="40" style="stroke: var(--card-border)" stroke-width="1"/>
    <rect x="10"  y="14" width="32" height="26" rx="2" style="fill: var(--card-accent)"/>
    <rect x="50"  y="6"  width="32" height="34" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="90"  y="22" width="32" height="18" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="130" y="2"  width="32" height="38" rx="2" style="fill: var(--card-accent-hover)"/>
    <rect x="170" y="18" width="32" height="22" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
  </svg>
  <div class="tg-hexes tg-hexes-light"><b>bg</b> #fdf6e3 <b>panel</b> #eee8d5 <b>accent</b> #268bd2 <b>text</b> #586e75</div>
  <div class="tg-hexes tg-hexes-dark"><b>bg</b> #002b36 <b>panel</b> #073642 <b>accent</b> #268bd2 <b>text</b> #cbd5cc</div>
</div>

<!-- 12. Catppuccin -->
<div class="tg-card" data-tid="12">
  <div class="tg-name"><span>Catppuccin Latte / Mocha (blue)</span><span class="tg-num">12</span></div>
  <div class="tg-swatches">
    <span class="tg-sw" style="background: var(--card-bg)"></span>
    <span class="tg-sw" style="background: var(--card-bg2)"></span>
    <span class="tg-sw" style="background: var(--card-accent)"></span>
    <span class="tg-sw" style="background: var(--card-accent-hover)"></span>
  </div>
  <h4>Attention is All You Need</h4>
  <div class="tg-meta">Machine Learning &middot; 6 min read</div>
  <p>The transformer architecture replaced recurrent networks with self-attention, letting any position attend to any other in constant path length. <a class="tg-link" href="#">See the interactive visualization</a>.</p>
  <div class="tg-row">
    <span class="tg-tag">transformers</span>
    <span class="tg-tag">deep learning</span>
    <span class="tg-code">softmax(QK&#8868;/&radic;d)</span>
  </div>
  <div class="tg-row">
    <button class="tg-btn">Open notebook</button>
    <button class="tg-btn-ghost">Cite</button>
  </div>
  <blockquote>All models are wrong, but some are useful.</blockquote>
  <svg class="tg-chart" width="100%" height="44" viewBox="0 0 220 44" preserveAspectRatio="none">
    <line x1="0" y1="40" x2="220" y2="40" style="stroke: var(--card-border)" stroke-width="1"/>
    <rect x="10"  y="14" width="32" height="26" rx="2" style="fill: var(--card-accent)"/>
    <rect x="50"  y="6"  width="32" height="34" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="90"  y="22" width="32" height="18" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
    <rect x="130" y="2"  width="32" height="38" rx="2" style="fill: var(--card-accent-hover)"/>
    <rect x="170" y="18" width="32" height="22" rx="2" style="fill: var(--card-accent); opacity: 0.65"/>
  </svg>
  <div class="tg-hexes tg-hexes-light"><b>bg</b> #eff1f5 <b>panel</b> #e6e9ef <b>accent</b> #1e66f5 <b>text</b> #4c4f69</div>
  <div class="tg-hexes tg-hexes-dark"><b>bg</b> #1e1e2e <b>panel</b> #313244 <b>accent</b> #89b4fa <b>text</b> #cdd6f4</div>
</div>

</div>

## Quick reading guide

- **#01 Current site (Indigo).** What's there now. Honest baseline.
- **#02 Linear App.** Light: warm-neutral surfaces with a desaturated indigo. Dark: near-black with the same family of subtle violet. Closest to "no theme" while keeping a hint of color.
- **#03 Atom One.** Cream-ish light, warm slate dark, calm blue accent. Polished and forgiving for long reading.
- **#04 GitHub.** Familiar, professional. The "serious technical blog" look in both modes.
- **#05 Tokyo.** What the existing canvas viz palette aligns with already - picking this means viz colors barely change in dark.
- **#06 Nord.** Frost cyan accent in both modes. Quiet, design-aware.
- **#07 Vercel.** No chrome accent at all. Pure black/white minimalism, links are just slightly different text. The most extreme "no theme" answer.
- **#08 Lilian Weng minimal.** Near-monochrome with one calm blue link. Closest match to her actual blog's quietness.
- **#09 Substack sepia.** Warm cream/parchment in light, parchment-dark in dark, tan-brown accent. Reading-blog feel.
- **#10 Anthropic warm.** Cream-on-cream in light, cream-on-warm-dark in dark, peach accent. Distinctive without being loud.
- **#11 Solarized.** Iconic warm-cool palette with a blue accent. Polarizing - it clicks or it doesn't.
- **#12 Catppuccin.** Blue accent on slightly purple-tinted slate (dark) / cool gray (light). Reads as blue, not purple.

Toggle the site theme in the header to validate both modes for the cards you're considering, then tell me a number.
