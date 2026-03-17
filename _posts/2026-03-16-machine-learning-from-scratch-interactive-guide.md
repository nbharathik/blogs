---
layout: post
title: "Machine Learning from Scratch: An Interactive Guide"
author: bharathikannan
categories: [Machine learning]
description: "Learn machine learning from scratch with interactive visualizations. Drag data points, tune hyperparameters, watch algorithms train in real-time - all in your browser with math and code."
permalink: /ml/
---

<style>
.ml-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.ml-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  background: var(--bg-secondary);
  transition: border-color 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
  display: block;
}
.ml-card:hover {
  border-color: var(--accent);
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  text-decoration: none;
  color: inherit;
}
.ml-card-icon {
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
}
.ml-card h3 {
  font-size: 1.05rem;
  margin: 0 0 0.4rem 0;
  color: var(--text-primary);
}
.ml-card p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0 0 0.6rem 0;
  line-height: 1.5;
}
.ml-tag {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.ml-tag.beginner {
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
}
.ml-tag.intermediate {
  background: rgba(234, 179, 8, 0.12);
  color: #ca8a04;
}
.ml-tag.advanced {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}
.ml-category {
  margin-bottom: 2rem;
}
.ml-category h2 {
  font-size: 1.15rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border);
}
.ml-hero-demo {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0 2rem 0;
  background: var(--bg-secondary);
}
.ml-hero-demo canvas {
  display: block;
  margin: 0 auto;
  border-radius: 8px;
  cursor: crosshair;
  max-width: 100%;
}
.ml-hero-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
}
.ml-hero-controls button {
  padding: 0.4rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: border-color 0.2s;
}
.ml-hero-controls button:hover {
  border-color: var(--accent);
}
.ml-hero-controls button.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.ml-hero-controls select {
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.85rem;
}
.ml-hero-hint {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.6rem;
}
.ml-stats {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: center;
  margin-top: 0.5rem;
}
@media (max-width: 640px) {
  .ml-grid { grid-template-columns: 1fr; }
}
</style>

This is a complete interactive guide to **Machine Learning from Scratch**. Every algorithm below comes with real-time visualizations - you can drag data points, tune parameters, and watch models learn step by step, right in your browser.

No black boxes. Every algorithm is derived mathematically and built from first principles. The interactive demos let you develop genuine intuition for *why* these algorithms work, not just *how* to call them.

Here's a taste of what every chapter feels like:

<div class="ml-hero-demo">
<canvas id="heroCanvas" width="700" height="380"></canvas>
<div class="ml-hero-controls">
  <button id="heroAlgLR" class="active" onclick="heroSetAlg('lr')">Linear Regression</button>
  <button id="heroAlgLog" onclick="heroSetAlg('log')">Logistic Regression</button>
  <button id="heroAlgKNN" onclick="heroSetAlg('knn')">KNN</button>
  <button id="heroAlgTree" onclick="heroSetAlg('tree')">Decision Tree</button>
  <button id="heroAlgKM" onclick="heroSetAlg('km')">K-Means</button>
  <button id="heroClear" onclick="heroClear()">Clear</button>
</div>
<div class="ml-hero-hint">Click to add points. <strong>Shift+click</strong> for a second class. Switch algorithms and watch the model change instantly.</div>
<div class="ml-stats" id="heroStats"></div>
</div>

<script>
(function(){
  const c = document.getElementById('heroCanvas');
  const ctx = c.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  c.width = 700 * dpr; c.height = 380 * dpr;
  c.style.width = '700px'; c.style.height = '380px';
  ctx.scale(dpr, dpr);
  const W = 700, H = 380;

  function getColors(){
    const s = getComputedStyle(document.documentElement);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches &&
       document.documentElement.getAttribute('data-theme') !== 'light');
    return {
      bg: isDark ? '#1a1b26' : '#ffffff',
      grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      text: isDark ? '#a9b1d6' : '#4a5568',
      c0: '#7aa2f7', c1: '#f7768e', c2: '#9ece6a', c3: '#ff9e64', c4: '#bb9af7',
      line: isDark ? '#7aa2f7' : '#3b82f6',
      boundary: isDark ? 'rgba(122,162,247,0.25)' : 'rgba(59,130,246,0.18)',
      centroid: '#e0af68',
    };
  }
  let col = getColors();

  const obs = new MutationObserver(()=>{ col = getColors(); draw(); });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let pts = [];
  let alg = 'lr';
  const classColors = () => [col.c0, col.c1, col.c2, col.c3, col.c4];

  c.addEventListener('click', function(e){
    const rect = c.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    const cls = e.shiftKey ? 1 : 0;
    pts.push({ x, y, c: cls });
    draw();
  });

  window.heroSetAlg = function(a){
    alg = a;
    document.querySelectorAll('.ml-hero-controls button').forEach(b => {
      if(b.id && b.id.startsWith('heroAlg')) b.classList.remove('active');
    });
    const map = {lr:'heroAlgLR',log:'heroAlgLog',knn:'heroAlgKNN',tree:'heroAlgTree',km:'heroAlgKM'};
    const el = document.getElementById(map[a]);
    if(el) el.classList.add('active');
    draw();
  };

  window.heroClear = function(){
    pts = [];
    draw();
  };

  function linReg(points){
    if(points.length < 2) return null;
    let sx=0,sy=0,sxx=0,sxy=0,n=points.length;
    for(const p of points){ sx+=p.x; sy+=p.y; sxx+=p.x*p.x; sxy+=p.x*p.y; }
    const d = n*sxx - sx*sx;
    if(Math.abs(d)<1e-12) return null;
    const m = (n*sxy - sx*sy)/d;
    const b = (sy - m*sx)/n;
    return {m, b};
  }

  function logReg(points){
    if(points.length < 2) return null;
    const lr = 0.05;
    let w0=0, w1=0, w2=0;
    for(let iter=0; iter<300; iter++){
      let g0=0,g1=0,g2=0;
      for(const p of points){
        const z = w0 + w1*(p.x/W) + w2*(p.y/H);
        const sig = 1/(1+Math.exp(-z));
        const err = sig - p.c;
        g0 += err; g1 += err*(p.x/W); g2 += err*(p.y/H);
      }
      w0 -= lr*g0/points.length;
      w1 -= lr*g1/points.length;
      w2 -= lr*g2/points.length;
    }
    return {w0,w1,w2};
  }

  function knnPredict(px,py,points,k){
    if(points.length===0) return 0;
    const dists = points.map(p => ({d:(p.x-px)**2+(p.y-py)**2, c:p.c}));
    dists.sort((a,b)=>a.d-b.d);
    const kk = Math.min(k, dists.length);
    let votes = {};
    for(let i=0;i<kk;i++){
      votes[dists[i].c] = (votes[dists[i].c]||0)+1;
    }
    let best=0, bestV=-1;
    for(const [cls,v] of Object.entries(votes)){
      if(v>bestV){ bestV=v; best=Number(cls); }
    }
    return best;
  }

  function buildTree(points, depth, maxD){
    if(points.length === 0) return {cls:0};
    const classes = [...new Set(points.map(p=>p.c))];
    if(classes.length === 1 || depth >= maxD) {
      const votes = {};
      points.forEach(p => votes[p.c]=(votes[p.c]||0)+1);
      let best=0,bestV=0;
      for(const [c,v] of Object.entries(votes)) if(v>bestV){bestV=v;best=Number(c);}
      return {cls:best};
    }
    let bestGini=Infinity, bestFeat='x', bestThr=0;
    for(const feat of ['x','y']){
      const vals = [...new Set(points.map(p=>p[feat]))].sort((a,b)=>a-b);
      for(let i=0;i<vals.length-1;i++){
        const thr = (vals[i]+vals[i+1])/2;
        const left = points.filter(p=>p[feat]<=thr);
        const right = points.filter(p=>p[feat]>thr);
        const gl = gini(left), gr = gini(right);
        const wg = (left.length*gl + right.length*gr)/points.length;
        if(wg < bestGini){ bestGini=wg; bestFeat=feat; bestThr=thr; }
      }
    }
    const left = points.filter(p=>p[bestFeat]<=bestThr);
    const right = points.filter(p=>p[bestFeat]>bestThr);
    if(left.length===0||right.length===0){
      const votes={};points.forEach(p=>votes[p.c]=(votes[p.c]||0)+1);
      let best=0,bestV=0;for(const[c,v]of Object.entries(votes))if(v>bestV){bestV=v;best=Number(c);}
      return{cls:best};
    }
    return {feat:bestFeat, thr:bestThr, left:buildTree(left,depth+1,maxD), right:buildTree(right,depth+1,maxD)};
  }
  function gini(pts){
    if(pts.length===0) return 0;
    const counts={};pts.forEach(p=>counts[p.c]=(counts[p.c]||0)+1);
    let s=0;for(const v of Object.values(counts)) s+=(v/pts.length)**2;
    return 1-s;
  }
  function treePred(node,x,y){
    if(node.cls !== undefined && !node.feat) return node.cls;
    const val = node.feat==='x'?x:y;
    return val<=node.thr ? treePred(node.left,x,y) : treePred(node.right,x,y);
  }

  function kmeans(points, K){
    if(points.length < K) return {assigns:points.map((_,i)=>i%K), centroids:points.map(p=>({x:p.x,y:p.y}))};
    let centroids = [];
    const shuffled = [...points].sort(()=>Math.random()-0.5);
    for(let i=0;i<K;i++) centroids.push({x:shuffled[i].x, y:shuffled[i].y});
    let assigns = new Array(points.length).fill(0);
    for(let iter=0;iter<30;iter++){
      for(let i=0;i<points.length;i++){
        let best=0,bestD=Infinity;
        for(let k=0;k<K;k++){
          const d=(points[i].x-centroids[k].x)**2+(points[i].y-centroids[k].y)**2;
          if(d<bestD){bestD=d;best=k;}
        }
        assigns[i]=best;
      }
      for(let k=0;k<K;k++){
        let sx=0,sy=0,n=0;
        for(let i=0;i<points.length;i++){
          if(assigns[i]===k){sx+=points[i].x;sy+=points[i].y;n++;}
        }
        if(n>0){centroids[k]={x:sx/n,y:sy/n};}
      }
    }
    return {assigns, centroids};
  }

  function draw(){
    const cc = classColors();
    ctx.fillStyle = col.bg;
    ctx.fillRect(0,0,W,H);

    // grid
    ctx.strokeStyle = col.grid;
    ctx.lineWidth = 1;
    for(let x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    const statsEl = document.getElementById('heroStats');

    if(alg === 'lr'){
      const fit = linReg(pts);
      if(fit){
        ctx.strokeStyle = col.line;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, fit.b);
        ctx.lineTo(W, fit.m*W+fit.b);
        ctx.stroke();
        // residuals
        ctx.lineWidth = 1;
        ctx.strokeStyle = col.c1;
        ctx.globalAlpha = 0.4;
        for(const p of pts){
          const pred = fit.m*p.x + fit.b;
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x,pred); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        let mse = 0;
        for(const p of pts) mse += (p.y-(fit.m*p.x+fit.b))**2;
        mse /= pts.length;
        statsEl.textContent = `y = ${fit.m.toFixed(2)}x + ${fit.b.toFixed(1)} · MSE: ${mse.toFixed(1)}`;
      } else { statsEl.textContent = 'Add points to fit a line'; }
      for(const p of pts){
        ctx.fillStyle = col.c0;
        ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fill();
      }

    } else if(alg === 'log'){
      if(pts.length >= 2 && pts.some(p=>p.c===0) && pts.some(p=>p.c===1)){
        const model = logReg(pts);
        if(model){
          const step = 6;
          const imgData = ctx.getImageData(0,0,W*dpr,H*dpr);
          for(let py=0;py<H;py+=step){
            for(let px=0;px<W;px+=step){
              const z = model.w0 + model.w1*(px/W) + model.w2*(py/H);
              const sig = 1/(1+Math.exp(-z));
              const cls = sig < 0.5 ? 0 : 1;
              const r = cls===0 ? 122 : 247;
              const g = cls===0 ? 162 : 118;
              const b = cls===0 ? 247 : 142;
              for(let dy=0;dy<step*dpr&&(py*dpr+dy)<H*dpr;dy++){
                for(let dx=0;dx<step*dpr&&(px*dpr+dx)<W*dpr;dx++){
                  const idx=((py*dpr+dy)*W*dpr+(px*dpr+dx))*4;
                  imgData.data[idx]=r; imgData.data[idx+1]=g; imgData.data[idx+2]=b; imgData.data[idx+3]=30;
                }
              }
            }
          }
          ctx.putImageData(imgData,0,0);
          // boundary line
          if(Math.abs(model.w2)>1e-6){
            ctx.strokeStyle = col.line; ctx.lineWidth = 2; ctx.setLineDash([6,4]);
            ctx.beginPath();
            const y0 = -(model.w0 + model.w1*0)/model.w2 * H;
            const y1 = -(model.w0 + model.w1*1)/model.w2 * H;
            ctx.moveTo(0,y0); ctx.lineTo(W,y1); ctx.stroke();
            ctx.setLineDash([]);
          }
        }
        statsEl.textContent = `Decision boundary trained · ${pts.filter(p=>p.c===0).length} blue, ${pts.filter(p=>p.c===1).length} red points`;
      } else { statsEl.textContent = 'Add both classes (click = blue, shift+click = red)'; }
      for(const p of pts){
        ctx.fillStyle = p.c===0 ? cc[0] : cc[1];
        ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = col.bg; ctx.lineWidth = 1.5; ctx.stroke();
      }

    } else if(alg === 'knn'){
      if(pts.length > 0){
        const K = Math.min(5, pts.length);
        const step = 8;
        const imgData = ctx.getImageData(0,0,W*dpr,H*dpr);
        for(let py=0;py<H;py+=step){
          for(let px=0;px<W;px+=step){
            const cls = knnPredict(px,py,pts,K);
            const colors = [[122,162,247],[247,118,142],[158,206,106],[255,158,100],[187,154,247]];
            const rgb = colors[cls % colors.length];
            for(let dy=0;dy<step*dpr&&(py*dpr+dy)<H*dpr;dy++){
              for(let dx=0;dx<step*dpr&&(px*dpr+dx)<W*dpr;dx++){
                const idx=((py*dpr+dy)*W*dpr+(px*dpr+dx))*4;
                imgData.data[idx]=rgb[0]; imgData.data[idx+1]=rgb[1]; imgData.data[idx+2]=rgb[2]; imgData.data[idx+3]=30;
              }
            }
          }
        }
        ctx.putImageData(imgData,0,0);
        statsEl.textContent = `K=${K} · ${pts.length} points · Decision regions shown`;
      } else { statsEl.textContent = 'Click to add blue points, shift+click for red'; }
      for(const p of pts){
        ctx.fillStyle = cc[p.c % cc.length];
        ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = col.bg; ctx.lineWidth = 1.5; ctx.stroke();
      }

    } else if(alg === 'tree'){
      if(pts.length >= 2){
        const tree = buildTree(pts, 0, 6);
        const step = 6;
        const imgData = ctx.getImageData(0,0,W*dpr,H*dpr);
        for(let py=0;py<H;py+=step){
          for(let px=0;px<W;px+=step){
            const cls = treePred(tree,px,py);
            const colors = [[122,162,247],[247,118,142],[158,206,106],[255,158,100],[187,154,247]];
            const rgb = colors[cls % colors.length];
            for(let dy=0;dy<step*dpr&&(py*dpr+dy)<H*dpr;dy++){
              for(let dx=0;dx<step*dpr&&(px*dpr+dx)<W*dpr;dx++){
                const idx=((py*dpr+dy)*W*dpr+(px*dpr+dx))*4;
                imgData.data[idx]=rgb[0]; imgData.data[idx+1]=rgb[1]; imgData.data[idx+2]=rgb[2]; imgData.data[idx+3]=30;
              }
            }
          }
        }
        ctx.putImageData(imgData,0,0);
        statsEl.textContent = `Decision tree (max depth 6) · ${pts.length} points · Rectangular regions`;
      } else { statsEl.textContent = 'Click to add points from two classes'; }
      for(const p of pts){
        ctx.fillStyle = cc[p.c % cc.length];
        ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = col.bg; ctx.lineWidth = 1.5; ctx.stroke();
      }

    } else if(alg === 'km'){
      if(pts.length >= 2){
        const K = Math.min(4, pts.length);
        const allPts = pts.map(p=>({x:p.x, y:p.y, c:0}));
        const res = kmeans(allPts, K);
        // Voronoi regions
        const step = 6;
        const imgData = ctx.getImageData(0,0,W*dpr,H*dpr);
        for(let py=0;py<H;py+=step){
          for(let px=0;px<W;px+=step){
            let best=0,bestD=Infinity;
            for(let k=0;k<res.centroids.length;k++){
              const d=(px-res.centroids[k].x)**2+(py-res.centroids[k].y)**2;
              if(d<bestD){bestD=d;best=k;}
            }
            const colors=[[122,162,247],[247,118,142],[158,206,106],[255,158,100],[187,154,247]];
            const rgb=colors[best%colors.length];
            for(let dy=0;dy<step*dpr&&(py*dpr+dy)<H*dpr;dy++){
              for(let dx=0;dx<step*dpr&&(px*dpr+dx)<W*dpr;dx++){
                const idx=((py*dpr+dy)*W*dpr+(px*dpr+dx))*4;
                imgData.data[idx]=rgb[0]; imgData.data[idx+1]=rgb[1]; imgData.data[idx+2]=rgb[2]; imgData.data[idx+3]=30;
              }
            }
          }
        }
        ctx.putImageData(imgData,0,0);
        // points colored by cluster
        for(let i=0;i<pts.length;i++){
          ctx.fillStyle = cc[res.assigns[i] % cc.length];
          ctx.beginPath(); ctx.arc(pts[i].x,pts[i].y,5,0,Math.PI*2); ctx.fill();
          ctx.strokeStyle = col.bg; ctx.lineWidth = 1.5; ctx.stroke();
        }
        // centroids
        for(const cent of res.centroids){
          ctx.fillStyle = col.centroid;
          ctx.strokeStyle = col.bg; ctx.lineWidth = 2;
          ctx.beginPath();
          const s = 8;
          ctx.moveTo(cent.x, cent.y-s); ctx.lineTo(cent.x+s, cent.y);
          ctx.lineTo(cent.x, cent.y+s); ctx.lineTo(cent.x-s, cent.y);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        }
        statsEl.textContent = `K=${K} clusters · ${pts.length} points · Voronoi regions with centroids (◆)`;
      } else { statsEl.textContent = 'Click to add points (no shift needed for K-Means)'; }
      if(pts.length < 2){
        for(const p of pts){
          ctx.fillStyle = cc[0];
          ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fill();
        }
      }
    }

    // empty state
    if(pts.length === 0){
      ctx.fillStyle = col.text;
      ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click anywhere to add data points', W/2, H/2 - 10);
      ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Shift+click adds a second class (for classification)', W/2, H/2 + 15);
      ctx.textAlign = 'left';
    }
  }

  draw();
})();
</script>

---

<div class="ml-category">
  <h2>Foundations of Supervised Learning</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/linear-regression-from-scratch-interactive/">
      <div class="ml-card-icon">📈</div>
      <h3>Linear Regression</h3>
      <p>Fit a line to data with gradient descent. Drag points, watch the cost surface, and see parameters converge in real time.</p>
      <span class="ml-tag beginner">Beginner</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/linear-regression-multivariate-extension/">
      <div class="ml-card-icon">📊</div>
      <h3>Linear Regression — Multivariate</h3>
      <p>Extend to multiple features with 3D visualizations. Watch a prediction plane tilt through data and explore the cost surface.</p>
      <span class="ml-tag beginner">Beginner</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/logistic-regression-from-scratch-interactive/">
      <div class="ml-card-icon">🔀</div>
      <h3>Logistic Regression</h3>
      <p>From regression to classification. See the sigmoid curve, drag the decision boundary, and train a binary classifier live.</p>
      <span class="ml-tag beginner">Beginner</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/logistic-regression-multivariate-extension/">
      <div class="ml-card-icon">🌐</div>
      <h3>Logistic Regression — Multivariate</h3>
      <p>Classify with two features. Explore 3D sigmoid surfaces, rotating decision boundaries, and multi-feature cost landscapes.</p>
      <span class="ml-tag beginner">Beginner</span>
    </a>
  </div>
</div>

<div class="ml-category">
  <h2>Optimization & Regularization</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/gradient-descent-deep-dive-interactive/">
      <div class="ml-card-icon">⚡</div>
      <h3>Gradient Descent Deep Dive</h3>
      <p>Race SGD, Momentum, RMSProp, and Adam side-by-side. Tune learning rates, escape saddle points, and compare mini-batch strategies.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/polynomial-regression-bias-variance-interactive/">
      <div class="ml-card-icon">〰️</div>
      <h3>Polynomial Regression & Bias-Variance</h3>
      <p>Slide polynomial degree from 1→15 and watch underfitting become overfitting. Decompose bias and variance visually.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/regularization-ridge-lasso-interactive/">
      <div class="ml-card-icon">🛡️</div>
      <h3>Regularization: Ridge, Lasso & Elastic Net</h3>
      <p>Watch coefficients shrink to zero. See why L1 creates sparsity with the diamond-vs-circle geometry. Morph between Ridge and Lasso.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
  </div>
</div>

<div class="ml-category">
  <h2>Classification Algorithms</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/knn-interactive/">
      <div class="ml-card-icon">📍</div>
      <h3>K-Nearest Neighbors</h3>
      <p>Place points and watch decision boundaries reshape. Slide K from 1→30, toggle distance metrics, and see the curse of dimensionality.</p>
      <span class="ml-tag beginner">Beginner</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/naive-bayes-interactive/">
      <div class="ml-card-icon">🎲</div>
      <h3>Naive Bayes Classifier</h3>
      <p>Adjust class distributions and watch the decision boundary shift. Build a live spam classifier that scores words in real time.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/svm-interactive/">
      <div class="ml-card-icon">✂️</div>
      <h3>Support Vector Machines</h3>
      <p>Find the maximum margin. Drag support vectors, tune the C parameter, and watch the kernel trick project data into 3D.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/decision-trees-interactive/">
      <div class="ml-card-icon">🌳</div>
      <h3>Decision Trees</h3>
      <p>Watch a tree grow split-by-split with dual-panel animation: tree structure on the left, rectangular regions on the right.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
  </div>
</div>

<div class="ml-category">
  <h2>Ensemble Methods</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/random-forests-interactive/">
      <div class="ml-card-icon">🌲</div>
      <h3>Random Forests & Bagging</h3>
      <p>Add trees one-by-one and watch the boundary smooth out. Compare individual trees vs the ensemble, and see OOB error converge.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/boosting-interactive/">
      <div class="ml-card-icon">🚀</div>
      <h3>Boosting: AdaBoost & Gradient Boosting</h3>
      <p>Watch sample weights grow on mistakes. See residuals shrink as weak learners stack up. Compare boosting vs bagging head-to-head.</p>
      <span class="ml-tag advanced">Advanced</span>
    </a>
  </div>
</div>

<div class="ml-category">
  <h2>Unsupervised Learning</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/k-means-clustering-interactive/">
      <div class="ml-card-icon">🎯</div>
      <h3>K-Means Clustering</h3>
      <p>Step through the assign-update cycle with animated centroids. Explore the elbow method, Voronoi regions, and K-Means++ initialization.</p>
      <span class="ml-tag beginner">Beginner</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/dbscan-hierarchical-clustering-interactive/">
      <div class="ml-card-icon">🔗</div>
      <h3>DBSCAN & Hierarchical Clustering</h3>
      <p>Cluster non-convex shapes that K-Means can't handle. Build dendrograms step-by-step and drag the cut height to form clusters.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/pca-interactive/">
      <div class="ml-card-icon">🔬</div>
      <h3>Principal Component Analysis (PCA)</h3>
      <p>Rotate a projection line to maximize variance. Project 3D data onto 2D, explore scree plots, and see reconstruction error change.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
  </div>
</div>

<div class="ml-category">
  <h2>Neural Networks from Scratch</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/perceptron-mlp-interactive/">
      <div class="ml-card-icon">🧠</div>
      <h3>The Perceptron & MLP</h3>
      <p>Train a single neuron, watch it fail on XOR, then add a hidden layer for the "aha!" moment. Build network architectures live.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/backpropagation-interactive/">
      <div class="ml-card-icon">🔄</div>
      <h3>Backpropagation Visualized</h3>
      <p>Watch data flow forward and gradients flow backward with animated particles. See vanishing gradients in deep networks.</p>
      <span class="ml-tag advanced">Advanced</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/activations-losses-interactive/">
      <div class="ml-card-icon">⚙️</div>
      <h3>Activation & Loss Functions</h3>
      <p>Explore every activation function with derivative overlays. Watch neurons die with ReLU, and race MSE against cross-entropy.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
  </div>
</div>

<div class="ml-category">
  <h2>Evaluation & Practical ML</h2>
  <div class="ml-grid">
    <a class="ml-card" href="{{ site.baseurl }}/model-evaluation-interactive/">
      <div class="ml-card-icon">📋</div>
      <h3>Model Evaluation</h3>
      <p>Drag a threshold slider and watch the confusion matrix, ROC curve, and precision-recall curve update together. Animate K-Fold CV.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
    <a class="ml-card" href="{{ site.baseurl }}/feature-engineering-interactive/">
      <div class="ml-card-icon">🔧</div>
      <h3>Feature Engineering & Preprocessing</h3>
      <p>Compare scaling methods side-by-side, explore correlation heatmaps, and build an end-to-end pipeline with toggleable steps.</p>
      <span class="ml-tag intermediate">Intermediate</span>
    </a>
  </div>
</div>
