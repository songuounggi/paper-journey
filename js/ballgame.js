// ===== 보리 공놀이: 떨어지는 공을 보리 머리로 톡! 받아내는 미니게임 =====
const BallGame = (() => {
  const W = 360, GROUND = 598, BORI_S = 1.25;
  const HEAD = GROUND - 63 * BORI_S;      // 보리 머리 꼭대기
  const R = 14, HIT_W = 40;
  const BEST_KEY = 'bori.ballBest';

  let svg, world, shadowL, itemL, boriG, ballL, fxL;
  let state = 'idle';                      // idle | ready | play | over
  let raf = 0, last = 0, clock = 0;
  let score = 0, lives = 3, balls = [], items = [], parts = [];
  let bori = { x: 180, vx: 0, sq: 0 }, targetX = 180, keyDir = 0;
  let spawnCd = 0, itemCd = 0, shake = 0, spawned = 0;
  const el = id => document.getElementById(id);

  // ---- 그림 ----
  const BALL_ROT = `
    <circle r="12" fill="${C.coral}"/>
    <path d="M-11.5 -2 Q0 -9 11.5 -2" stroke="#fff" stroke-width="2.4" fill="none"/>
    <path d="M-10 5 Q0 11 10 5" stroke="#fff" stroke-width="2.4" fill="none"/>
    <path d="M5 -11 l2 3 2 -2 1 3 2 -1" stroke="#C9637A" stroke-width="1.3" fill="none" stroke-linejoin="round"/>`;
  const BONE = `<g ${P}>
    <rect x="-12" y="-3.6" width="24" height="7.2" rx="3.6" fill="#FFF8EE"/>
    <circle cx="-12" cy="-4" r="4.8" fill="#FFF8EE"/><circle cx="-12" cy="4" r="4.8" fill="#FFF8EE"/>
    <circle cx="12" cy="-4" r="4.8" fill="#FFF8EE"/><circle cx="12" cy="4" r="4.8" fill="#FFF8EE"/></g>`;
  const HEART = `<path ${P} d="M0 -4 c-5 -10 -20 -7 -17 5 c2.5 7.5 17 15 17 15 s14.5 -7.5 17 -15 c3 -12 -12 -15 -17 -5z" fill="#FF9FBA"/>`;
  const CONFETTI = [C.pink, C.butter, C.mint, C.lavender, C.sky, C.peach];

  function scenery() {
    let tufts = '';
    for (let x = 14; x < W; x += 46) tufts += Art.tuft(x + (x * 7 % 13), GROUND + 4 + (x % 3) * 6);
    return `
      <rect width="360" height="640" fill="url(#skyMint)"/>
      ${Art.sun(296, 168, 20)}
      <g class="drift slow">${Art.cloud(18, 210, .8)}</g>
      <g class="drift">${Art.cloud(220, 290, .6)}</g>
      <g class="drift slow">${Art.cloud(110, 390, .45)}</g>
      <path d="M0 520 Q90 470 180 506 T360 488 V640 H0Z" fill="url(#hillFar)" ${P1}/>
      ${Art.pine(34, 566, 92, C.treeFar, P1)}${Art.pine(328, 560, 112, C.treeFar, P1)}${Art.roundTree(286, 572, 20, C.treeLight, P1)}
      <path d="M0 574 Q120 548 240 568 T360 562 V640 H0Z" fill="url(#hillMid)" ${P}/>
      <path d="M0 ${GROUND - 4} Q180 ${GROUND - 14} 360 ${GROUND - 4} V640 H0Z" fill="url(#ground)" ${P}/>
      ${tufts}
      ${Art.flower(30, 630, C.pink)}${Art.flower(332, 628, C.butter)}${Art.flower(250, 634, C.lavender)}`;
  }

  function build() {
    svg = el('bgSvg');
    svg.innerHTML = '';
    world = G(svg);
    G(world, scenery());
    shadowL = G(world);
    itemL = G(world);
    boriG = G(world, `<g class="bg-bori">${Art.bori()}</g>`);
    ballL = G(world);
    fxL = G(world);
    svg.onpointerdown = svg.onpointermove = e => {
      if (state === 'idle') return;
      targetX = toLocal(svg, e).x;
    };
  }

  // ---- 공 ----
  function makeBall(x) {
    const sh = S('ellipse', { cx: x, cy: GROUND + 2, rx: 12, ry: 3.5, fill: 'rgba(107,90,158,.2)' }, shadowL);
    const g = G(ballL, `<g ${P}><g class="rot">${BALL_ROT}</g><circle cx="-5" cy="-6" r="2.5" fill="#fff" opacity=".55"/></g>`);
    const warn = G(fxL, `<g class="bg-warn"><circle r="11" fill="${C.butter}" ${P1}/>
      <text y="5.5" font-size="15" text-anchor="middle" fill="${C.ink}">!</text></g>`, { transform: `translate(${x} 128)` });
    const b = { x, y: -40, vx: (Math.random() - .5) * 60, vy: 40, rot: 0, sq: 0, g, rotG: g.querySelector('.rot'), sh, warn };
    balls.push(b);
    spawned++;
    return b;
  }
  function removeBall(b) {
    b.g.remove(); b.sh.remove(); b.warn.remove();
    balls.splice(balls.indexOf(b), 1);
  }
  const grav = () => 760 + Math.min(score, 80) * 7;
  const wanted = () => 1 + (score >= 15) + (score >= 40);

  function spawnBall() {
    let x;
    if (spawned === 0) x = bori.x;
    else {
      // 다른 공과 너무 겹치지 않는 위치
      for (let i = 0; i < 6; i++) {
        x = 50 + Math.random() * 260;
        if (balls.every(o => Math.abs(o.x - x) > 70)) break;
      }
    }
    makeBall(clamp(x, 40, 320));
    if (balls.length > 1 && balls.length === wanted()) toast(`공이 ${balls.length}개! 🎾`);
  }

  function hit(b, dx) {
    const perfect = Math.abs(dx) < 9;
    const gain = perfect ? 2 : 1;
    score += gain;
    const g = grav();
    const apex = 160 + Math.random() * 110;
    b.y = HEAD - R;
    b.vy = -Math.sqrt(2 * g * (HEAD - R - apex));
    b.vx = clamp(dx * 7 + bori.vx * 0.25 + (Math.random() - .5) * 70, -280, 280);
    b.sq = 1; bori.sq = 1;
    Sound.pop();
    if (perfect) Sound.chime();
    burst(b.x, HEAD, perfect ? 16 : 6);
    floatText(b.x, HEAD - 34, perfect ? 'PERFECT +2' : '+1', perfect);
    setHud(true);
  }

  function miss(b) {
    puff(b.x, GROUND);
    removeBall(b);
    lives--;
    shake = 1;
    Sound.bonk(); Sound.splash();
    setHud();
    if (lives <= 0) return gameOver();
    spawnCd = Math.max(spawnCd, 1.1);
  }

  // ---- 보너스 아이템 (뼈다귀 +3 / 하트 회복) ----
  function spawnItem() {
    const heal = lives < 3 && Math.random() < 0.35;
    const x = 40 + Math.random() * 280;
    const g = G(itemL, heal ? HEART : BONE);
    items.push({ x, y: -20, ph: Math.random() * 6, heal, g });
  }
  function takeItem(it) {
    it.g.remove();
    items.splice(items.indexOf(it), 1);
    if (it.heal) { lives = Math.min(3, lives + 1); floatText(it.x, HEAD - 30, '♥ +1', true); }
    else { score += 3; floatText(it.x, HEAD - 30, '뼈다귀 +3', true); }
    Sound.chime();
    burst(it.x, HEAD + 10, 10);
    bori.sq = 0.7;
    setHud(true);
  }

  // ---- 이펙트 ----
  function burst(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - .5) * 2.4;
      const sp = 140 + Math.random() * 180;
      const e = S('rect', { width: 6, height: 4, rx: 1, fill: CONFETTI[i % CONFETTI.length] }, fxL);
      parts.push({ e, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: Math.random() * 360, vr: (Math.random() - .5) * 720, life: 1, g: 520 });
    }
  }
  function puff(x, y) {
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI * (i / 7);
      const e = S('circle', { r: 5 + Math.random() * 3, fill: '#FFFFFF', opacity: .9 }, fxL);
      parts.push({ e, x, y, vx: Math.cos(a) * 70, vy: Math.sin(a) * 40, r: 0, vr: 0, life: 1, g: 0, circle: true });
    }
  }
  function floatText(x, y, txt, big) {
    const e = S('text', {
      'font-size': big ? 19 : 16, 'text-anchor': 'middle', fill: big ? '#FF7FA0' : C.ink,
      stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke', 'stroke-linejoin': 'round',
    }, fxL);
    e.textContent = txt;
    parts.push({ e, x: clamp(x, 64, 296), y, vx: 0, vy: -60, r: 0, vr: 0, life: 1.1, g: 0, text: true });
  }

  // ---- HUD / 화면 ----
  function setHud(bump) {
    const s = el('bgScore');
    s.textContent = score;
    if (bump) { s.classList.remove('bump'); void s.offsetWidth; s.classList.add('bump'); }
    el('bgHearts').innerHTML = [0, 1, 2].map(i => `<span class="${i < lives ? '' : 'off'}">♥</span>`).join('');
  }
  const best = () => +localStorage.getItem(BEST_KEY) || 0;

  function reset() {
    balls.slice().forEach(removeBall);
    items.forEach(it => it.g.remove());
    parts.forEach(p => p.e.remove());
    items = []; parts = [];
    score = 0; lives = 3; spawned = 0; shake = 0;
    spawnCd = 0.7; itemCd = 9;
    bori.x = targetX = 180; bori.vx = 0;
    setHud();
  }

  function start() {
    Sound.init();
    reset();
    el('bgReady').classList.add('hidden');
    el('bgOver').classList.add('hidden');
    state = 'play';
  }

  function gameOver() {
    state = 'over';
    const prev = best();
    const isNew = score > prev;
    if (isNew) localStorage.setItem(BEST_KEY, score);
    setTimeout(() => {
      if (state !== 'over') return;
      el('bgFinal').textContent = score;
      el('bgBestOver').textContent = Math.max(prev, score);
      el('bgNew').classList.toggle('hidden', !isNew || score === 0);
      el('bgOver').classList.remove('hidden');
      isNew && score > 0 ? Sound.fanfare() : Sound.flap();
    }, 700);
  }

  // ---- 메인 루프 ----
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.033, (now - last) / 1000 || 0);
    last = now;
    clock += dt;

    // 보리 이동 (손가락을 부드럽게 따라감)
    if (keyDir) targetX += keyDir * 380 * dt;
    targetX = clamp(targetX, 30, 330);
    const px = bori.x;
    if (state === 'play' || state === 'ready') bori.x += (targetX - bori.x) * Math.min(1, dt * 16);
    bori.vx = dt ? (bori.x - px) / dt : 0;
    bori.sq *= Math.pow(0.0008, dt);
    const lean = clamp(bori.vx * 0.02, -9, 9);
    const breathe = state === 'play' ? 0 : Math.sin(clock * 3) * 0.02;
    const sx = BORI_S * (1 + 0.12 * bori.sq), sy = BORI_S * (1 - 0.16 * bori.sq + breathe);
    boriG.setAttribute('transform', `translate(${bori.x} ${GROUND}) rotate(${lean}) scale(${sx} ${sy})`);

    if (state === 'play') {
      // 공 생성
      spawnCd -= dt;
      if (balls.length < wanted() && spawnCd <= 0) { spawnBall(); spawnCd = 1.2; }
      // 아이템 생성
      if (score >= 5) {
        itemCd -= dt;
        if (itemCd <= 0) { spawnItem(); itemCd = 8 + Math.random() * 5; }
      }
      const g = grav();
      for (const b of balls.slice()) {
        const prevBottom = b.y + R;
        b.vy += g * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * 0.9; }
        if (b.x > W - R) { b.x = W - R; b.vx = -Math.abs(b.vx) * 0.9; }
        const bottom = b.y + R;
        if (b.vy > 0 && ((prevBottom < HEAD && bottom >= HEAD) || (bottom >= HEAD && bottom <= HEAD + 22))) {
          const dx = b.x - bori.x;
          if (Math.abs(dx) <= HIT_W) { hit(b, dx); continue; }
        }
        if (b.y - R > GROUND - 4) { miss(b); if (state !== 'play') break; }
      }
      for (const it of items.slice()) {
        it.y += 125 * dt;
        it.x += Math.sin(clock * 3 + it.ph) * 26 * dt;
        if (it.y > HEAD - 6 && it.y < GROUND && Math.abs(it.x - bori.x) < 40) { takeItem(it); continue; }
        if (it.y > GROUND + 30) { it.g.remove(); items.splice(items.indexOf(it), 1); }
      }
    }

    // 그리기
    for (const b of balls) {
      b.rot += b.vx * dt * 3;
      b.sq *= Math.pow(0.0005, dt);
      const s = 1.15;
      b.g.setAttribute('transform', `translate(${b.x} ${b.y}) scale(${s * (1 + .28 * b.sq)} ${s * (1 - .28 * b.sq)})`);
      b.rotG.setAttribute('transform', `rotate(${b.rot})`);
      const h = clamp((GROUND - b.y) / 500, 0, 1);
      b.sh.setAttribute('cx', b.x);
      b.sh.setAttribute('rx', 13 - 7 * h);
      b.sh.setAttribute('opacity', 1 - h * 0.7);
      b.warn.style.display = b.y < 70 ? '' : 'none';
    }
    for (const it of items) it.g.setAttribute('transform', `translate(${it.x} ${it.y}) rotate(${Math.sin(clock * 4 + it.ph) * 14})`);
    for (const p of parts.slice()) {
      p.life -= dt * (p.text ? 0.9 : 1.3);
      if (p.life <= 0) { p.e.remove(); parts.splice(parts.indexOf(p), 1); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      if (p.circle) { p.e.setAttribute('cx', p.x); p.e.setAttribute('cy', p.y); p.e.setAttribute('opacity', p.life * .9); }
      else if (p.text) { p.e.setAttribute('x', p.x); p.e.setAttribute('y', p.y); p.e.setAttribute('opacity', Math.min(1, p.life * 2)); }
      else { p.e.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${p.r})`); p.e.setAttribute('opacity', Math.min(1, p.life * 2)); }
    }
    shake *= Math.pow(0.002, dt);
    world.setAttribute('transform', shake > 0.02 ? `translate(${(Math.random() - .5) * 12 * shake} ${(Math.random() - .5) * 8 * shake})` : '');
  }

  function onKey(e) {
    if (state === 'idle') return;
    if (e.key === 'ArrowLeft') keyDir = e.type === 'keydown' ? -1 : (keyDir === -1 ? 0 : keyDir);
    if (e.key === 'ArrowRight') keyDir = e.type === 'keydown' ? 1 : (keyDir === 1 ? 0 : keyDir);
  }
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', onKey);

  // ---- 열기 / 닫기 ----
  function open() {
    if (!svg) build();
    reset();
    state = 'ready';
    el('bgBest').textContent = best();
    el('bgReady').classList.remove('hidden');
    el('bgOver').classList.add('hidden');
    el('ballgame').classList.remove('hidden');
    cancelAnimationFrame(raf);
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function close() {
    state = 'idle';
    keyDir = 0;
    cancelAnimationFrame(raf);
    el('ballgame').classList.add('hidden');
  }

  return { open, close, start };
})();
