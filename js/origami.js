// ===== 종이접기 세션 화면 =====
// 점선(접는 선)과 화살표를 보여주고, 손가락으로 끌면 종이가 실시간으로 접힌다.
// 다 접으면 완성작을 크게 확대해서 보여주고, 앨범에 저장한다.
const Origami = (() => {
  const layer = () => document.getElementById('origami');
  const album = {};

  const SHADOW_DEFS = id => `
    <filter id="${id}" x="-30%" y="-30%" width="160%" height="170%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.06" result="b1"/>
      <feOffset in="b1" dy="0.07" result="o1"/>
      <feFlood flood-color="#6B5A9E" flood-opacity="0.22"/>
      <feComposite in2="o1" operator="in" result="s1"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.012" result="b2"/>
      <feOffset in="b2" dy="0.015" result="o2"/>
      <feFlood flood-color="#4A3F6B" flood-opacity="0.18"/>
      <feComposite in2="o2" operator="in" result="s2"/>
      <feMerge><feMergeNode in="s1"/><feMergeNode in="s2"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;

  function run(recipeId) {
    return new Promise(resolve => {
      const R = RECIPES[recipeId];
      const root = layer();
      const svg = document.getElementById('oriSvg');
      const stage = root.querySelector('.ori-stage');
      const title = document.getElementById('oriTitle');
      const stepLbl = document.getElementById('oriStep');
      const text = document.getElementById('oriText');
      const btn = document.getElementById('oriNext');

      svg.innerHTML = `
        <defs>
          ${SHADOW_DEFS('oriShadow')}
          <marker id="oriArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9 z" fill="#FF8FA8" stroke="#FF8FA8" stroke-width="1.5" stroke-linejoin="round"/>
          </marker>
        </defs>`;
      const cam = G(svg);
      const paperG = G(cam, '', { filter: 'url(#oriShadow)' });
      const guideG = G(cam);
      const decoG = G(cam, '', { class: 'ori-deco' });
      const fxG = G(svg);

      let layers = [{ pts: R.start.map(p => p.slice()), flip: false }];
      let idx = 0, split = null, theta = 0, busy = true, drag = null, smax = 1;
      let camX = 0, camY = 0, camS = 1;

      stage.classList.remove('done');
      title.textContent = R.name;
      stepLbl.textContent = '';
      text.innerHTML = R.intro;
      btn.textContent = '접어 볼래!';
      btn.classList.remove('hidden');
      root.classList.remove('hidden');
      setCam(0, 0, 1);
      render();

      btn.onclick = () => {
        Sound.init();
        btn.classList.add('hidden');
        busy = false;
        beginStep();
      };

      function colorOf(L, flip) {
        if (L.paint && L.paintFlip === flip) return L.paint;
        return flip ? R.back : R.front;
      }

      function poly(L, pts, flip, dim, overridePaint) {
        const col = overridePaint || colorOf(L, flip);
        S('polygon', {
          points: pts.map(p => p[0].toFixed(4) + ',' + p[1].toFixed(4)).join(' '),
          fill: shade(col, dim),
          stroke: shade(col, 0.86),
          'stroke-width': 0.014,
          'stroke-linejoin': 'round',
        }, paperG);
      }

      function render() {
        paperG.innerHTML = '';
        if (!split) { layers.forEach(L => poly(L, L.pts, L.flip, 1)); return; }
        split.stay.forEach(L => poly(L, L.pts, L.flip, 1));
        const c = Math.cos(theta), flipped = c < 0;
        const mv = flipped ? split.move.slice().reverse() : split.move;
        const step = R.steps[idx];
        mv.forEach(L => {
          const f = flipped ? !L.flip : L.flip;
          poly(L, L.pts.map(p => Fold.project(p, split.li, c)), f, 0.86 + 0.14 * Math.abs(c), flipped && step.paint ? step.paint : null);
        });
      }

      function setCam(x, y, s) {
        camX = x; camY = y; camS = s;
        cam.setAttribute('transform', `scale(${s}) translate(${-x} ${-y})`);
      }

      function recenter(scale = 1, dur = 450, box = null) {
        const b = box || Fold.bbox(layers);
        const sx = camX, sy = camY, ss = camS;
        return tween(dur, t => setCam(lerp(sx, b.cx, t), lerp(sy, b.cy, t), lerp(ss, scale, t)), ease.inOutCubic);
      }

      function beginStep() {
        const step = R.steps[idx];
        split = Fold.split(layers, step);
        smax = Math.max(0.2, ...split.move.flatMap(L => L.pts.map(p => Fold.sd(p, split.li))));
        theta = 0;
        stepLbl.textContent = `${idx + 1} / ${R.steps.length}`;
        text.innerHTML = step.text + '<br><small>화살표 방향으로 쓱— 끌어 봐!</small>';
        drawGuide();
        render();
      }

      function drawGuide() {
        const li = split.li;
        const a = li.a, u = li.u;
        let cx = 0, cy = 0, k = 0;
        split.move.forEach(L => L.pts.forEach(p => { cx += p[0]; cy += p[1]; k++; }));
        cx /= k; cy /= k;
        const c = [cx, cy];
        const t = Fold.project(c, li, -1);
        const mid = [(c[0] + t[0]) / 2, (c[1] + t[1]) / 2];
        const dist = Math.hypot(t[0] - c[0], t[1] - c[1]);
        const bb = Fold.bbox(layers);
        let side = (mid[0] - bb.cx) * u[0] + (mid[1] - bb.cy) * u[1];
        side = side >= 0 ? 1 : -1;
        const ctrl = [mid[0] + u[0] * dist * 0.45 * side, mid[1] + u[1] * dist * 0.45 * side];
        const path = `M${c[0]} ${c[1]} Q${ctrl[0]} ${ctrl[1]} ${t[0]} ${t[1]}`;
        guideG.innerHTML = `
          <line class="ori-line" x1="${a[0] - u[0] * 4}" y1="${a[1] - u[1] * 4}" x2="${a[0] + u[0] * 4}" y2="${a[1] + u[1] * 4}"
            stroke="#9F8BD9" stroke-width="0.02" stroke-dasharray="0.07 0.05" stroke-linecap="round"/>
          <path d="${path}" fill="none" stroke="#fff" stroke-width="0.07" stroke-linecap="round" opacity=".85"/>
          <path class="ori-arrow" d="${path}" fill="none" stroke="#FF8FA8" stroke-width="0.035" stroke-linecap="round" marker-end="url(#oriArrow)"/>
          <circle r="0.075" fill="#fff" stroke="#C9B8F2" stroke-width="0.015" filter="url(#oriShadow)">
            <animateMotion dur="1.6s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.75;1" calcMode="linear" path="${path}"/>
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.75;1" dur="1.6s" repeatCount="indefinite"/>
          </circle>`;
      }

      svg.onpointerdown = e => {
        if (busy || !split) return;
        Sound.init();
        drag = { p: toLocal(svg, e), moved: false };
        svg.setPointerCapture(e.pointerId);
        Sound.rustle();
      };
      svg.onpointermove = e => {
        if (!drag) return;
        const p = toLocal(svg, e);
        const dx = p.x - drag.p.x, dy = p.y - drag.p.y;
        if (Math.hypot(dx, dy) > 0.03) drag.moved = true;
        const d = -(dx * split.li.n[0] + dy * split.li.n[1]) / camS;
        const c = clamp(1 - d / (smax * 0.95), -1, 1);
        theta = Math.acos(c);
        guideG.style.opacity = String(1 - theta / Math.PI);
        render();
      };
      svg.onpointerup = svg.onpointercancel = async () => {
        if (!drag) return;
        const wasTap = !drag.moved;
        drag = null;
        if (wasTap) { guideG.classList.remove('flash'); void guideG.getBBox(); guideG.classList.add('flash'); }
        busy = true;
        const from = theta;
        if (theta > Math.PI * 0.42) {
          await tween(260 * (1 - from / Math.PI) + 80, t => { theta = lerp(from, Math.PI, t); render(); });
          Sound.fold();
          layers = Fold.applyFold(layers, R.steps[idx]);
          split = null;
          guideG.innerHTML = '';
          guideG.style.opacity = '1';
          render();
          idx++;
          if (idx < R.steps.length) { await recenter(); busy = false; beginStep(); }
          else finish();
        } else {
          await tween(220, t => { theta = lerp(from, 0, t); render(); });
          guideG.style.opacity = '1';
          busy = false;
        }
      };

      async function finish() {
        stepLbl.textContent = '';
        text.innerHTML = '';
        // 장식(눈, 줄기 등)까지 포함한 크기를 재서 화면 가득 확대
        decoG.innerHTML = R.decorate;
        decoG.style.opacity = '0';
        const pb = Fold.bbox(layers), db = decoG.getBBox();
        const b = {
          x0: Math.min(pb.x0, db.x), y0: Math.min(pb.y0, db.y),
          x1: Math.max(pb.x1, db.x + db.width), y1: Math.max(pb.y1, db.y + db.height),
        };
        b.cx = (b.x0 + b.x1) / 2; b.cy = (b.y0 + b.y1) / 2;
        const fit = Math.min(2.1 / (b.x1 - b.x0), 2.1 / (b.y1 - b.y0), 2.2);
        stage.classList.add('done');
        await recenter(fit, 700, b);
        decoG.style.opacity = '';
        decoG.classList.remove('show'); void decoG.getBBox(); decoG.classList.add('show');
        // 반짝이
        fxG.innerHTML = [[-1.1, -0.9, 0.11], [1.05, -0.7, 0.08], [-0.95, 0.85, 0.07], [1.1, 0.95, 0.1], [0, -1.25, 0.07]]
          .map(([x, y, r], i) => `<g transform="translate(${x} ${y}) scale(${r})"><path class="ori-sparkle" style="animation-delay:${i * 0.25}s"
            d="M0 -1 L0.25 -0.25 L1 0 L0.25 0.25 L0 1 L-0.25 0.25 L-1 0 L-0.25 -0.25Z" fill="${['#FFE29A', '#FFB8CF', '#C9B8F2'][i % 3]}"/></g>`).join('');
        Sound.fanfare();
        text.innerHTML = `<span class="done-name">${R.name} 완성!</span><br>${R.done}`;
        // 앨범에 저장 (완성작 + 장식, 꼭 맞는 viewBox)
        const pad = 0.15;
        album[recipeId] = {
          name: R.name,
          vb: `${b.x0 - pad} ${b.y0 - pad} ${b.x1 - b.x0 + pad * 2} ${b.y1 - b.y0 + pad * 2}`,
          markup: paperG.innerHTML + decoG.innerHTML,
        };
        await wait(600);
        btn.textContent = '계속하기';
        btn.classList.remove('hidden');
        btn.onclick = () => {
          btn.classList.add('hidden');
          stage.classList.remove('done');
          fxG.innerHTML = '';
          root.classList.add('hidden');
          svg.onpointerdown = svg.onpointermove = svg.onpointerup = svg.onpointercancel = null;
          resolve();
        };
      }
    });
  }

  // 엔딩 앨범용 SVG
  function snapshotSVG(recipeId) {
    const a = album[recipeId];
    if (!a) return '';
    const fid = 'alb_' + recipeId;
    return `<svg viewBox="${a.vb}"><defs>${SHADOW_DEFS(fid)}</defs><g filter="url(#${fid})">${a.markup}</g></svg>`;
  }
  const has = id => !!album[id];
  const reset = () => { for (const k in album) delete album[k]; };

  return { run, snapshotSVG, has, reset };
})();
