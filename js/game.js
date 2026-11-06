// ===== 게임 흐름 =====
const State = { hasHat: false, hasTulip: false, found: [], char: localStorage.getItem('bori.char') || 'kid' };
if (!CHARACTERS[State.char]) State.char = 'kid';

const FLOW = [
  { t: 'scene', id: 'entrance' },
  { t: 'origami', id: 'hat' },
  { t: 'scene', id: 'stream' },
  { t: 'origami', id: 'tulip' },
  { t: 'scene', id: 'tree' },
  { t: 'origami', id: 'dog' },
  { t: 'ending' },
];
const CLUE_ICONS = [Art.paw(), Art.ball(), Art.collar()];

const $ = id => document.getElementById(id);
let svg, sceneLayer, hud, flyLayer, hudTitle, slots = [];
let flowIdx = -1;

function slotPos(i) { return [232 + i * 44, 37]; }

function setupHud() {
  hud.innerHTML = '';
  G(hud, `
    <g ${P}><rect x="203" y="13" width="146" height="48" rx="24" fill="#FFFFFF" fill-opacity=".9"/></g>
    <g ${P}><rect x="60" y="20" width="132" height="34" rx="17" fill="#FFFFFF" fill-opacity=".9"/></g>`);
  slots = [0, 1, 2].map(i => {
    const [x, y] = slotPos(i);
    G(hud, `<circle cx="${x}" cy="${y}" r="17" fill="#F4F0FF" stroke="#C9B8F2" stroke-width="1.5" stroke-dasharray="3 3"/>`);
    return G(hud, '', { transform: `translate(${x} ${y}) scale(.8)` });
  });
  hudTitle = S('text', { x: 126, y: 42.5, 'font-size': 15, fill: C.ink, 'text-anchor': 'middle', class: 'hud-title' }, hud);
}

// ---- 주인공 ----
function makeKid(parent, x, y) {
  const g = G(parent, '', { class: 'kid' });
  G(g, characterSVG(State.char, { hat: State.hasHat, tulip: State.hasTulip }));
  const sc = CHARACTERS[State.char].sceneScale;
  let cx = x, cy = y, facing = 1, hopping = false;
  const place = (dy = 0) => g.setAttribute('transform', `translate(${cx} ${cy + dy}) scale(${facing * sc} ${sc})`);
  place();
  g.addEventListener('pointerdown', async e => {
    e.stopPropagation();
    if (hopping) return;
    hopping = true;
    Sound.init(); Sound.pop();
    await tween(380, t => place(-22 * Math.sin(Math.PI * t)), ease.linear);
    hopping = false;
  });
  const kid = {
    el: g,
    async walkTo(tx, ty, speed = 120) {
      facing = tx < cx ? -1 : 1;
      const sx = cx, sy = cy;
      const dist = Math.hypot(tx - sx, ty - sy);
      g.classList.add('walking');
      await tween(Math.max(1, dist / speed * 1000), t => { cx = lerp(sx, tx, t); cy = lerp(sy, ty, t); place(); }, ease.linear);
      g.classList.remove('walking');
    },
    async walkPath(pts) { for (const p of pts) await kid.walkTo(p[0], p[1]); },
  };
  return kid;
}

// ---- 스테이지 API ----
function buildScene(id) {
  const def = SCENES[id];
  sceneLayer.innerHTML = '';
  const root = G(sceneLayer);
  let kid = null, completed = false;
  hudTitle.textContent = def.title;

  const api = {
    layer: root,
    add(html, parent = root) { return G(parent, html); },
    kid(x, y) { kid = makeKid(root, x, y); return kid; },
    hint,
    flap(o) { return Book.flap(o.parent || root, o); },
    tab(o) { return Book.tab(o.parent || root, o); },
    popup(o) { return Book.popup(o.parent || root, o); },
    toy(html, fn, parent = root) { return Book.toy(parent, html, fn); },
    clue(o) {
      const parent = o.parent || root;
      return Book.clue(parent, {
        ...o,
        async onTake(el) {
          Sound.chime();
          hint('');
          toast(o.msg);
          await Book.fly(el, parent, o.x, o.y, slotPos(o.slot), o.scale || 1, 0.8);
          el.remove();
          slots[o.slot].innerHTML = CLUE_ICONS[o.slot];
          slots[o.slot].classList.add('slot-pop');
          State.found[o.slot] = true;
          await wait(1100);
          o.onDone && o.onDone();
        },
      });
    },
    async complete(path) {
      if (completed) return;
      completed = true;
      hint('');
      if (kid) await kid.walkPath(path);
      next();
    },
  };
  def.build(api);
}

// ---- UI 문구 ----
let hintTimer = null;
function hint(html) {
  const h = $('hint');
  clearTimeout(hintTimer);
  if (!html) { h.classList.remove('show'); return; }
  h.classList.remove('show');
  hintTimer = setTimeout(() => { h.innerHTML = html; h.classList.add('show'); }, 120);
}
let toastTimer = null;
function toast(html) {
  const t = $('toast');
  t.innerHTML = html;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
async function banner(sub, title) {
  const b = $('banner');
  b.innerHTML = `<small>${sub}</small>${title}`;
  b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
}

// ---- 페이지 넘김 ----
async function turnPage(swap) {
  const sheet = $('pageturn');
  sheet.classList.remove('hidden');
  Sound.flap();
  await sheet.animate(
    [{ transform: 'perspective(1400px) rotateY(-88deg)', transformOrigin: 'left center' },
     { transform: 'perspective(1400px) rotateY(0deg)', transformOrigin: 'left center' }],
    { duration: 380, easing: 'cubic-bezier(.4,0,.8,.6)', fill: 'forwards' }).finished;
  swap();
  await wait(120);
  await sheet.animate(
    [{ transform: 'perspective(1400px) rotateY(0deg)', transformOrigin: 'right center' },
     { transform: 'perspective(1400px) rotateY(88deg)', transformOrigin: 'right center' }],
    { duration: 420, easing: 'cubic-bezier(.2,.4,.6,1)', fill: 'forwards' }).finished;
  sheet.classList.add('hidden');
}

function hideLayers() {
  ['title', 'select', 'origami', 'ending'].forEach(id => $(id).classList.add('hidden'));
  hint('');
}

// ---- 흐름 진행 ----
async function next() {
  flowIdx++;
  const f = FLOW[flowIdx];
  if (!f) return;
  let oriDone = null;
  await turnPage(() => {
    hideLayers();
    if (f.t === 'scene') buildScene(f.id);
    if (f.t === 'origami') oriDone = Origami.run(f.id);
    if (f.t === 'ending') showEnding();
  });
  if (f.t === 'scene') {
    const n = FLOW.slice(0, flowIdx + 1).filter(x => x.t === 'scene').length;
    banner(`종이 숲 · ${n}`, SCENES[f.id].title);
  }
  if (f.t === 'origami') {
    await oriDone;
    if (f.id === 'hat') State.hasHat = true;
    if (f.id === 'tulip') State.hasTulip = true;
    next();
  }
}

function showEnding() {
  const e = $('ending');
  e.classList.remove('hidden');
  $('endAlbum').innerHTML = ['hat', 'tulip', 'dog'].filter(Origami.has).map(id =>
    `<div class="album-item">${Origami.snapshotSVG(id)}<span>${RECIPES[id].name}</span></div>`).join('');
  $('endItems').innerHTML = CLUE_ICONS.map(ic => `<svg viewBox="-24 -24 48 54">${ic}</svg>`).join('');
  sceneLayer.innerHTML = '';
  Sound.fanfare();
}

// ---- 주인공 선택 ----
const SEL_SCENE = `
  <rect x="0" y="0" width="200" height="240" fill="url(#skyMorning)"/>
  <circle cx="162" cy="96" r="13" fill="${C.sun}"/>
  <path d="M0 175 Q50 150 100 168 T200 160 V240 H0Z" fill="url(#hillFar)"/>
  <ellipse cx="100" cy="216" rx="96" ry="22" fill="url(#ground)" ${P}/>`;

function thumbViewBox(id) {
  const h = CHARACTERS[id].h;
  return `-${h * 0.3} ${-h - 6} ${h * 0.6} ${h * 0.6}`;
}

function renderSelect() {
  const id = State.char, ch = CHARACTERS[id];
  $('selPreview').innerHTML = SEL_SCENE + `
    <g class="sel-char"><g transform="translate(${id === 'hoodie' ? 70 : 75} 214) scale(${ch.previewScale})">${characterSVG(id, { leash: true })}</g></g>
    <g transform="translate(140 214) scale(.85)">${Art.bori()}</g>`;
  $('selName').textContent = ch.name;
  $('selDesc').textContent = ch.desc;
  document.querySelectorAll('.sel-item').forEach(b => b.classList.toggle('on', b.dataset.id === id));
}

function showSelect() {
  return turnPage(() => {
    hideLayers();
    sceneLayer.innerHTML = '';
    $('selList').innerHTML = CHARACTER_IDS.map(id =>
      `<button class="sel-item" data-id="${id}" aria-label="${CHARACTERS[id].name}">
        <svg viewBox="${thumbViewBox(id)}">${characterSVG(id)}</svg></button>`).join('');
    document.querySelectorAll('.sel-item').forEach(b => b.onclick = () => {
      if (State.char === b.dataset.id) return;
      Sound.pop();
      State.char = b.dataset.id;
      renderSelect();
    });
    renderSelect();
    $('select').classList.remove('hidden');
  });
}

function restart() {
  State.hasHat = false;
  State.hasTulip = false;
  State.found = [];
  Origami.reset();
  slots.forEach(s => { s.innerHTML = ''; s.classList.remove('slot-pop'); });
  flowIdx = -1;
  showSelect();
}

// ---- 시작 ----
window.addEventListener('DOMContentLoaded', () => {
  svg = $('stage');
  sceneLayer = $('scene');
  hud = $('hud');
  flyLayer = $('fly');
  Book.setup(svg, flyLayer);
  setupHud();

  $('titleArt').innerHTML = `<svg viewBox="0 0 360 300">
    <ellipse cx="180" cy="262" rx="156" ry="24" fill="url(#ground)" filter="url(#e3)"/>
    ${Art.pine(60, 262, 120, C.tree, P3)}${Art.pine(300, 262, 140, C.treeDark, P3)}${Art.pine(255, 262, 80, C.treeLight, P)}
    ${Art.flower(96, 272, C.pink)}${Art.flower(268, 276, C.butter)}${Art.flower(110, 280, C.lavender)}
    <g transform="translate(140 262) scale(${1.5 * CHARACTERS[State.char].sceneScale})">${characterSVG(State.char)}</g>
    <g transform="translate(222 262) scale(1.15)"><g class="title-bori">${Art.bori()}</g></g>
    <g class="title-heart"><path d="M180 150 c-6 -12 -24 -8 -20 6 c3 9 20 18 20 18 s17 -9 20 -18 c4 -14 -14 -18 -20 -6z" fill="${C.pink}" filter="url(#paper)"/></g>
  </svg>`;
  $('startBtn').onclick = () => { Sound.init(); showSelect(); };
  $('selGo').onclick = () => {
    Sound.init();
    localStorage.setItem('bori.char', State.char);
    next();
  };
  $('restartBtn').onclick = () => { Sound.init(); restart(); };
  $('mute').onclick = () => {
    Sound.init();
    const m = Sound.toggle();
    $('mute').textContent = m ? '🔇' : '🔊';
  };
});
