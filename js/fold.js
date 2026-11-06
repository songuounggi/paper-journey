// ===== 종이접기 엔진 =====
// 종이를 "여러 겹의 다각형"으로 표현하고, 접는 선 기준으로 잘라서 반대편으로 뒤집는다.
// 모든 겹을 함께 접는 방식(valley fold)이라 단순하지만 꽤 그럴듯하게 보인다.
const Fold = (() => {
  const EPS = 1e-6;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1];

  // 접는 선 정보: a(기준점), u(선 방향), n(접히는 쪽을 향하는 법선)
  function lineInfo(step) {
    const d = sub(step.b, step.a);
    const L = Math.hypot(d[0], d[1]);
    const u = [d[0] / L, d[1] / L];
    let n = [-u[1], u[0]];
    if (dot(sub(step.flap, step.a), n) < 0) n = [-n[0], -n[1]];
    return { a: step.a, u, n };
  }

  const sd = (p, li) => dot(sub(p, li.a), li.n);

  // Sutherland–Hodgman: 반평면으로 다각형 자르기
  function clip(pts, li, positive) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const P = pts[i], Q = pts[(i + 1) % pts.length];
      let sp = sd(P, li), sq = sd(Q, li);
      if (!positive) { sp = -sp; sq = -sq; }
      const pin = sp >= -EPS, qin = sq >= -EPS;
      if (pin) out.push(P);
      if (pin !== qin) {
        const t = sp / (sp - sq);
        out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]);
      }
    }
    return clean(out);
  }

  function clean(pts) {
    const out = [];
    for (const p of pts) {
      const q = out[out.length - 1];
      if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-5) out.push(p);
    }
    if (out.length > 1) {
      const f = out[0], l = out[out.length - 1];
      if (Math.hypot(f[0] - l[0], f[1] - l[1]) < 1e-5) out.pop();
    }
    return out;
  }

  function area(pts) {
    let s = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      s += p[0] * q[1] - q[0] * p[1];
    }
    return Math.abs(s) / 2;
  }

  // 접히는 중인 점의 화면 위치 (cosT=1: 원래 자리, cosT=-1: 완전히 접힘)
  function project(p, li, cosT) {
    const s = sd(p, li);
    return [p[0] - li.n[0] * s * (1 - cosT), p[1] - li.n[1] * s * (1 - cosT)];
  }

  function split(layers, step) {
    const li = lineInfo(step);
    const stay = [], move = [];
    for (const L of layers) {
      const a = clip(L.pts, li, false);
      if (a.length >= 3 && area(a) > 1e-4) stay.push({ ...L, pts: a });
      const b = clip(L.pts, li, true);
      if (b.length >= 3 && area(b) > 1e-4) move.push({ ...L, pts: b });
    }
    return { li, stay, move };
  }

  function applyFold(layers, step) {
    const { li, stay, move } = split(layers, step);
    const moved = move.slice().reverse().map(L => {
      const flip = !L.flip;
      const out = { ...L, pts: L.pts.map(p => project(p, li, -1)), flip };
      if (step.paint) { out.paint = step.paint; out.paintFlip = flip; }
      return out;
    });
    return stay.concat(moved);
  }

  function bbox(layers) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const L of layers) for (const p of L.pts) {
      x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]);
      x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]);
    }
    return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }

  return { lineInfo, split, applyFold, project, bbox, sd };
})();

// ===== 종이접기 레시피 =====
// 좌표계: 종이 한 변 = 2 (중심 0,0), y는 아래가 +
const RECIPES = {
  hat: {
    name: '여행 모자',
    intro: '발자국이 숲 안쪽으로 이어져 있어.<br>여행을 떠나기 전에 모자를 접어 보자!',
    done: '완성! 이제 여행 준비 끝 🧢',
    front: '#FFF3E2', back: '#B7D2F7',
    start: [[-1, -1], [1, -1], [1, 1], [-1, 1]],
    steps: [
      { a: [-1, 0], b: [1, 0], flap: [0, -0.5], text: '위쪽 절반을 아래로 접어요' },
      { a: [0, 0], b: [-1, 1], flap: [-0.8, 0.2], text: '왼쪽 모서리를 가운데로 접어요' },
      { a: [0, 0], b: [1, 1], flap: [0.8, 0.2], text: '오른쪽 모서리도 가운데로!' },
      { a: [-1, 0.72], b: [1, 0.72], flap: [0, 0.9], text: '아래 띠를 위로 접어 올려요', paint: '#94BBF0' },
    ],
    decorate: `
      <path d="M0 0.47 l0.035 0.07 0.077 0.011 -0.056 0.054 0.013 0.077 -0.069 -0.036 -0.069 0.036 0.013 -0.077 -0.056 -0.054 0.077 -0.011z" fill="#FFE29A" stroke="#F2C66B" stroke-width="0.012"/>
    `,
  },
  tulip: {
    name: '튤립 한 송이',
    intro: '보리랑 산책하던 꽃길이 생각나…<br>꽃 한 송이를 접어 보자.',
    done: '완성! 보리가 냄새 맡던 그 꽃 🌷',
    front: '#FFF3E2', back: '#FFC4D6',
    start: [[0, -1], [1, 0], [0, 1], [-1, 0]],
    steps: [
      { a: [-1, 0], b: [1, 0], flap: [0, 0.5], text: '아래쪽을 위로 반 접어요' },
      { a: [-0.068, 0], b: [-0.725, -0.425], flap: [-0.85, -0.05], text: '왼쪽 끝을 위로 비스듬히!', paint: '#FF9FBA' },
      { a: [0.068, 0], b: [0.725, -0.425], flap: [0.85, -0.05], text: '오른쪽 끝도 위로 비스듬히!', paint: '#FF9FBA' },
    ],
    decorate: `
      <path d="M0 0.02 C0.02 0.35 -0.02 0.6 0 0.95" stroke="#8FD0AE" stroke-width="0.06" fill="none" stroke-linecap="round"/>
      <path d="M0 0.7 C0.25 0.55 0.4 0.6 0.45 0.45 C0.25 0.45 0.1 0.5 0 0.7Z" fill="#A8DCC0" stroke="#8FD0AE" stroke-width="0.012"/>
      <path d="M0 0.82 C-0.22 0.7 -0.35 0.72 -0.4 0.6 C-0.2 0.6 -0.08 0.66 0 0.82Z" fill="#A8DCC0" stroke="#8FD0AE" stroke-width="0.012"/>
    `,
  },
  dog: {
    name: '보리 얼굴',
    intro: '보리가 보고 싶어…<br>보리 얼굴을 접어 보자.',
    done: '완성! 보리야, 금방 찾으러 갈게 🐶',
    front: '#FFF8EE', back: '#F5D2AE',
    start: [[0, -1], [1, 0], [0, 1], [-1, 0]],
    steps: [
      { a: [-1, 0], b: [1, 0], flap: [0, -0.5], text: '위쪽을 아래로 반 접어 세모를 만들어요' },
      { a: [-0.35, 0], b: [-0.8, 0.2], flap: [-0.9, 0.03], text: '왼쪽 귀를 아래로 접어요', paint: '#DDA77F' },
      { a: [0.35, 0], b: [0.8, 0.2], flap: [0.9, 0.03], text: '오른쪽 귀도 아래로!', paint: '#DDA77F' },
      { a: [-0.25, 0.75], b: [0.25, 0.75], flap: [0, 0.95], text: '아래 끝을 살짝 위로 접어 코를 만들어요', paint: '#FFF8EE' },
    ],
    decorate: `
      <circle cx="-0.21" cy="0.25" r="0.065" fill="#5B5170"/><circle cx="-0.19" cy="0.23" r="0.02" fill="#fff"/>
      <circle cx="0.21" cy="0.25" r="0.065" fill="#5B5170"/><circle cx="0.23" cy="0.23" r="0.02" fill="#fff"/>
      <ellipse cx="0" cy="0.53" rx="0.09" ry="0.065" fill="#5B5170"/>
      <path d="M-0.08 0.63 Q0 0.69 0 0.6 Q0 0.69 0.08 0.63" stroke="#5B5170" stroke-width="0.022" fill="none" stroke-linecap="round"/>
      <circle cx="-0.36" cy="0.42" r="0.06" fill="#FFB8CF" opacity="0.8"/>
      <circle cx="0.36" cy="0.42" r="0.06" fill="#FFB8CF" opacity="0.8"/>
    `,
  },
};
