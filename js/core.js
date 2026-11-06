// ===== 공용 유틸 =====
const SVGNS = 'http://www.w3.org/2000/svg';

function S(tag, attrs = {}, parent = null) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function G(parent, html = '', attrs = {}) {
  const e = S('g', attrs, parent);
  if (html) e.innerHTML = html;
  return e;
}

const ease = {
  linear: t => t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};

function tween(dur, fn, e = ease.outCubic) {
  return new Promise(res => {
    const t0 = performance.now();
    function f(now) {
      const t = Math.min(1, (now - t0) / dur);
      fn(e(t), t);
      if (t < 1) requestAnimationFrame(f); else res();
    }
    requestAnimationFrame(f);
  });
}
const wait = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

// 화면 좌표 → 특정 SVG 요소의 좌표계
function toLocal(el, evt) {
  const pt = new DOMPoint(evt.clientX, evt.clientY);
  return pt.matrixTransform(el.getScreenCTM().inverse());
}
// 한 요소 좌표계의 점 → 다른 요소 좌표계
function convertPoint(fromEl, toEl, x, y) {
  const p = new DOMPoint(x, y).matrixTransform(fromEl.getScreenCTM());
  return p.matrixTransform(toEl.getScreenCTM().inverse());
}

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(clamp(r * f, 0, 255)); g = Math.round(clamp(g * f, 0, 255)); b = Math.round(clamp(b * f, 0, 255));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// ===== 사운드 (파일 없이 WebAudio로 합성) =====
const Sound = (() => {
  let ctx = null, noiseBuf = null, muted = false;

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    const len = ctx.sampleRate;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  function noise(dur, freq, q, vol, sweepTo) {
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(freq, t);
    if (sweepTo) bp.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  function tone(freq, dur, vol, type = 'sine', at = 0, slideTo = 0) {
    if (!ctx || muted) return;
    const t = ctx.currentTime + at;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  return {
    init,
    rustle() { noise(0.16, 2600, 0.8, 0.18); },
    flap() { noise(0.28, 2200, 0.7, 0.3, 500); },
    fold() { noise(0.32, 900, 0.6, 0.35, 4200); tone(160, 0.1, 0.07, 'triangle', 0.26); },
    pop() { tone(420, 0.16, 0.14, 'sine', 0, 950); noise(0.08, 3000, 1, 0.1); },
    slide() { noise(0.2, 700, 0.5, 0.2, 1400); },
    chime() { [784, 988, 1319].forEach((f, i) => tone(f, 0.55, 0.11, 'sine', i * 0.09)); },
    fanfare() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.7, 0.1, 'triangle', i * 0.12)); },
    splash() { noise(0.35, 1500, 0.5, 0.25, 300); },
    bonk() { tone(140, 0.12, 0.12, 'triangle', 0, 90); },
    toggle() { muted = !muted; return muted; },
    get muted() { return muted; },
  };
})();
