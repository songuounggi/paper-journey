// ===== 팝업북 상호작용 부품 =====
// flap(넘기는 종이), tab(당기는 탭), popup(톡 누르면 일어서는 종이), clue(단서), toy(장식용 터치)
const Book = (() => {
  let svg, flyLayer;

  function setup(rootSvg, fly) { svg = rootSvg; flyLayer = fly; }

  // 손가락 힌트 (from → to 반복)
  function dragHint(parent, from, to) {
    return G(parent, `
      <g class="drag-hint">
        <circle r="13" fill="#fff" opacity=".9" stroke="#9F8BD9" stroke-width="2" filter="url(#paper)">
          <animateTransform attributeName="transform" type="translate" values="${from[0]} ${from[1]};${to[0]} ${to[1]};${to[0]} ${to[1]}"
            keyTimes="0;0.7;1" dur="1.7s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;.85;.85;0" keyTimes="0;.15;.7;1" dur="1.7s" repeatCount="indefinite"/>
        </circle>
      </g>`);
  }

  // ---- 넘기는 종이 (경첩 선을 기준으로 접혀 넘어감) ----
  function flap(parent, o) {
    const outer = G(parent, '', { class: 'flap' });
    const front = G(outer, o.html);
    const back = G(outer, o.html);
    back.querySelectorAll('[filter]').forEach(n => n.removeAttribute('filter'));
    back.querySelectorAll('[class]').forEach(n => n.removeAttribute('class'));
    back.setAttribute('filter', 'url(#backside)');
    back.style.display = 'none';
    const li = Fold.lineInfo({ a: o.hinge[0], b: o.hinge[1], flap: o.toward });
    const nx = li.n[0], ny = li.n[1];
    let theta = 0, state = 'closed', start = null, hint = null;

    function setTheta(th) {
      theta = th;
      const c = Math.cos(th), k = c - 1;
      const a = 1 + k * nx * nx, b = k * nx * ny, cc = k * nx * ny, d = 1 + k * ny * ny;
      const hx = li.a[0], hy = li.a[1];
      const e = hx - (a * hx + cc * hy), f = hy - (b * hx + d * hy);
      outer.setAttribute('transform', `matrix(${a} ${b} ${cc} ${d} ${e} ${f})`);
      front.style.display = c >= 0 ? '' : 'none';
      back.style.display = c >= 0 ? 'none' : '';
      outer.style.filter = `brightness(${0.8 + 0.2 * Math.abs(c)})`;
    }
    setTheta(0);

    async function wiggle() {
      Sound.bonk();
      await tween(450, t => setTheta(0.35 * Math.sin(t * Math.PI * 3) * (1 - t)), ease.linear);
    }

    const api = {
      el: outer,
      showHint() {
        if (hint) return;
        const from = o.toward;
        const r = o.reach * 0.8;
        hint = dragHint(parent, from, [from[0] - nx * r, from[1] - ny * r]);
      },
      hideHint() { if (hint) { hint.remove(); hint = null; } },
      get open() { return state === 'open'; },
    };

    outer.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (state !== 'closed') return;
      if (o.locked && o.locked()) { o.onLocked && o.onLocked(); wiggle(); return; }
      start = toLocal(svg, e);
      outer.setPointerCapture(e.pointerId);
      state = 'drag';
      api.hideHint();
      Sound.rustle();
    });
    outer.addEventListener('pointermove', e => {
      if (state !== 'drag') return;
      const p = toLocal(svg, e);
      const d = -((p.x - start.x) * nx + (p.y - start.y) * ny);
      setTheta(Math.acos(clamp(1 - d / (o.reach * 0.9), -1, 1)));
    });
    const up = async () => {
      if (state !== 'drag') return;
      const from = theta;
      if (theta > Math.PI * 0.42) {
        state = 'opening';
        Sound.flap();
        await tween(280, t => setTheta(lerp(from, Math.PI, t)));
        state = 'open';
        o.onOpen && o.onOpen();
      } else {
        state = 'anim';
        await tween(220, t => setTheta(lerp(from, 0, t)));
        state = 'closed';
      }
    };
    outer.addEventListener('pointerup', up);
    outer.addEventListener('pointercancel', up);
    if (o.hint) api.showHint();
    return api;
  }

  // ---- 당기는 탭 ----
  function tab(parent, o) {
    const ax = o.axis[0], ay = o.axis[1];
    const x1 = o.x + ax * o.length, y1 = o.y + ay * o.length;
    G(parent, `
      <line x1="${o.x - ax * 10}" y1="${o.y - ay * 10}" x2="${x1 + ax * 10}" y2="${y1 + ay * 10}" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" opacity=".7"/>
      <line x1="${o.x - ax * 10}" y1="${o.y - ay * 10}" x2="${x1 + ax * 10}" y2="${y1 + ay * 10}" stroke="#B9AEDB" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 6"/>`);
    const g = G(parent, `
      <g ${P3}>
        <rect x="-29" y="-18" width="58" height="36" rx="18" fill="#FFFFFF"/>
      </g>
      <text x="-5" y="5" font-size="14" text-anchor="middle" fill="#5B5170">${o.label || '당겨'}</text>
      <circle cx="17" cy="0" r="8" fill="#FFB0C2"/>
      <path d="M15 -3.5 L19 0 L15 3.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
      { class: 'tab' });
    let t = 0, state = 'idle', start = null, base = 0, hint = null;
    const set = v => { t = v; g.setAttribute('transform', `translate(${o.x + ax * o.length * v} ${o.y + ay * o.length * v})`); o.onProgress && o.onProgress(v); };
    set(0);

    const api = {
      showHint() { if (!hint) hint = dragHint(parent, [o.x, o.y], [o.x + ax * o.length * 0.85, o.y + ay * o.length * 0.85]); },
      hideHint() { if (hint) { hint.remove(); hint = null; } },
    };
    g.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (state !== 'idle') return;
      start = toLocal(svg, e); base = t; state = 'drag';
      g.setPointerCapture(e.pointerId);
      api.hideHint();
      Sound.slide();
    });
    g.addEventListener('pointermove', e => {
      if (state !== 'drag') return;
      const p = toLocal(svg, e);
      set(clamp(base + ((p.x - start.x) * ax + (p.y - start.y) * ay) / o.length, 0, 1));
    });
    const up = async () => {
      if (state !== 'drag') return;
      const from = t;
      if (t > 0.72) {
        state = 'done';
        await tween(200, k => set(lerp(from, 1, k)));
        g.classList.add('done');
        o.onComplete && o.onComplete();
      } else {
        state = 'anim';
        await tween(300, k => set(lerp(from, 0, k)), ease.outBack);
        state = 'idle';
      }
    };
    g.addEventListener('pointerup', up);
    g.addEventListener('pointercancel', up);
    if (o.hint) api.showHint();
    return api;
  }

  // ---- 톡 누르면 일어서는 팝업 ----
  function popup(parent, o) {
    const [bx, by] = o.base;
    const s0 = o.s0 ?? 0.1;
    const hitW = o.hitW || 60;
    const g = G(parent, o.html);
    g.style.pointerEvents = 'none';
    const hit = S('rect', { x: bx - hitW, y: by - (o.hitH || 40), width: hitW * 2, height: (o.hitH || 40) + 14, fill: 'transparent', class: 'pop-hit' }, parent);
    const ring = o.ring === false ? null : G(parent, `<circle class="tap-ring" cx="${bx}" cy="${by - 8}" r="16" fill="none" stroke="#fff" stroke-width="3"/>`);
    const set = s => g.setAttribute('transform', `translate(${bx} ${by}) scale(1 ${s}) translate(${-bx} ${-by})`);
    set(s0);
    let popped = false;
    hit.addEventListener('pointerdown', async e => {
      e.stopPropagation();
      if (popped) return;
      popped = true;
      Sound.init();
      Sound.pop();
      hit.remove();
      ring && ring.remove();
      await tween(650, t => set(lerp(s0, 1, t)), ease.outBack);
      set(1);
      g.style.pointerEvents = '';
      o.onPop && o.onPop(g);
    });
    return { el: g, get popped() { return popped; } };
  }

  // ---- 단서 ----
  function clue(parent, o) {
    const g = G(parent, `
      <circle r="26" fill="transparent"/>
      <g class="sparkles">
        <path d="M-20 -18 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#FFE29A"/>
        <path d="M19 -10 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#FFE29A"/>
        <path d="M8 20 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2z" fill="#FFE29A"/>
      </g>
      <g class="clue-icon">${o.icon}</g>`,
      { class: 'clue', transform: `translate(${o.x} ${o.y}) scale(${o.scale || 1})` });
    let revealed = false, taken = false;
    g.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (!revealed || taken) return;
      taken = true;
      o.onTake && o.onTake(g);
    });
    return {
      el: g,
      reveal() { revealed = true; g.classList.add('revealed'); },
    };
  }

  // 단서를 HUD 슬롯으로 날리기
  async function fly(el, fromParent, x, y, to, scale0 = 1, scale1 = 0.8) {
    const p = convertPoint(fromParent, flyLayer, x, y);
    flyLayer.appendChild(el);
    el.classList.remove('revealed');
    const sp = el.querySelector('.sparkles'); if (sp) sp.remove();
    // 위로 살짝 떠오른 뒤 슬롯으로
    await tween(350, t => el.setAttribute('transform', `translate(${p.x} ${p.y - 30 * t}) scale(${lerp(scale0, scale0 * 1.6, t)})`), ease.outBack);
    await wait(250);
    const sx = p.x, sy = p.y - 30;
    await tween(550, t => {
      const xx = lerp(sx, to[0], t), yy = lerp(sy, to[1], t) - Math.sin(t * Math.PI) * 40;
      el.setAttribute('transform', `translate(${xx} ${yy}) scale(${lerp(scale0 * 1.6, scale1, t)})`);
    }, ease.inOutCubic);
  }

  // ---- 장식용 터치 장난감 ----
  function toy(parent, html, onTap) {
    const g = G(parent, html, { class: 'toy' });
    let busy = false;
    g.addEventListener('pointerdown', async e => {
      e.stopPropagation();
      if (busy) return;
      busy = true;
      Sound.init();
      await onTap(g);
      busy = false;
    });
    return g;
  }

  return { setup, flap, tab, popup, clue, fly, toy, dragHint };
})();
