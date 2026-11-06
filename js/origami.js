// ===== 종이접기 세션 화면 =====
// 점선(접는 선)과 화살표를 보여주고, 손가락으로 끌면 종이가 실시간으로 접힌다.
const Origami = (() => {
  const layer = () => document.getElementById('origami');
  let finalMarkup = {};

  function run(recipeId) {
    return new Promise(resolve => {
      const R = RECIPES[recipeId];
      const root = layer();
      const svg = document.getElementById('oriSvg');
      const title = document.getElementById('oriTitle');
      const stepLbl = document.getElementById('oriStep');
      const text = document.getElementById('oriText');
      const btn = document.getElementById('oriNext');

      svg.innerHTML = `
        <defs>
          <filter id="oriShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0.035" stdDeviation="0.03" flood-color="#000" flood-opacity="0.35"/>
          </filter>
          <marker id="oriArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#ffd166"/>
          </marker>
        </defs>`;
      const cam = G(svg);
      const paperG = G(cam, '', { filter: 'url(#oriShadow)' });
      const guideG = G(cam);
      const decoG = G(cam, '', { class: 'ori-deco' });

      let layers = [{ pts: R.start.map(p => p.slice()), flip: false }];
      let idx = 0, split = null, theta = 0, busy = true, drag = null, smax = 1;
      let camX = 0, camY = 0;

      title.textContent = R.name;
      stepLbl.textContent = '';
      text.innerHTML = R.intro;
      btn.textContent = '접어 볼래!';
      btn.classList.remove('hidden');
      root.classList.remove('hidden');
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
          stroke: shade(col, 0.7),
          'stroke-width': 0.012,
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
          poly(L, L.pts.map(p => Fold.project(p, split.li, c)), f, 0.8 + 0.2 * Math.abs(c), flipped && step.paint ? step.paint : null);
        });
      }

      function setCam(x, y) { camX = x; camY = y; cam.setAttribute('transform', `translate(${-x} ${-y})`); }

      function recenter() {
        const b = Fold.bbox(layers);
        const sx = camX, sy = camY;
        return tween(450, t => setCam(lerp(sx, b.cx, t), lerp(sy, b.cy, t)), ease.inOutCubic);
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
        const a = li.a, u = li.u, n = li.n;
        // 무게중심(대략)
        let cx = 0, cy = 0, k = 0;
        split.move.forEach(L => L.pts.forEach(p => { cx += p[0]; cy += p[1]; k++; }));
        cx /= k; cy /= k;
        const c = [cx, cy];
        const t = Fold.project(c, li, -1);
        const mid = [(c[0] + t[0]) / 2, (c[1] + t[1]) / 2];
        const dist = Math.hypot(t[0] - c[0], t[1] - c[1]);
        // 곡선은 바깥쪽(종이 중심에서 먼 쪽)으로 휘게
        const bb = Fold.bbox(layers);
        let side = (mid[0] - bb.cx) * u[0] + (mid[1] - bb.cy) * u[1];
        side = side >= 0 ? 1 : -1;
        const ctrl = [mid[0] + u[0] * dist * 0.45 * side, mid[1] + u[1] * dist * 0.45 * side];
        guideG.innerHTML = `
          <line class="ori-line" x1="${a[0] - u[0] * 4}" y1="${a[1] - u[1] * 4}" x2="${a[0] + u[0] * 4}" y2="${a[1] + u[1] * 4}"
            stroke="#fff" stroke-width="0.018" stroke-dasharray="0.07 0.05"/>
          <path class="ori-arrow" d="M${c[0]} ${c[1]} Q${ctrl[0]} ${ctrl[1]} ${t[0]} ${t[1]}" fill="none"
            stroke="#ffd166" stroke-width="0.035" stroke-linecap="round" marker-end="url(#oriArrow)"/>
          <circle r="0.07" fill="#fff" opacity="0.9">
            <animateMotion dur="1.6s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.75;1" calcMode="linear"
              path="M${c[0]} ${c[1]} Q${ctrl[0]} ${ctrl[1]} ${t[0]} ${t[1]}"/>
            <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.15;0.75;1" dur="1.6s" repeatCount="indefinite"/>
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
        const d = -(dx * split.li.n[0] + dy * split.li.n[1]);
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
          await recenter();
          if (idx < R.steps.length) { busy = false; beginStep(); }
          else finish();
        } else {
          await tween(220, t => { theta = lerp(from, 0, t); render(); });
          guideG.style.opacity = '1';
          busy = false;
        }
      };

      async function finish() {
        stepLbl.textContent = '';
        decoG.innerHTML = R.decorate;
        decoG.classList.remove('show'); void decoG.getBBox(); decoG.classList.add('show');
        Sound.fanfare();
        text.innerHTML = `<b>${R.done}</b>`;
        svg.classList.add('ori-done');
        finalMarkup[recipeId] = { markup: paperG.outerHTML + decoG.outerHTML, cx: camX, cy: camY };
        await wait(700);
        btn.textContent = '계속하기';
        btn.classList.remove('hidden');
        btn.onclick = () => {
          btn.classList.add('hidden');
          svg.classList.remove('ori-done');
          root.classList.add('hidden');
          svg.onpointerdown = svg.onpointermove = svg.onpointerup = svg.onpointercancel = null;
          resolve();
        };
      }
    });
  }

  // 엔딩 등에서 완성작을 다시 보여주기 위한 SVG
  function snapshotSVG(recipeId) {
    const f = finalMarkup[recipeId];
    if (!f) return '';
    return `<svg viewBox="-1.12 -1.0 2.24 2.0"><defs><filter id="oriShadow2" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0.035" stdDeviation="0.03" flood-color="#000" flood-opacity="0.35"/></filter></defs>
      <g transform="translate(${-f.cx} ${-f.cy})">${f.markup.replace('url(#oriShadow)', 'url(#oriShadow2)')}</g></svg>`;
  }

  return { run, snapshotSVG };
})();
