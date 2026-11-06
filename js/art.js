// ===== 파스텔 종이 공예 아트 조각들 (SVG 문자열) =====
// 엘리베이션: P1(먼 배경, 얕은 그림자) · P(중간) · P3(가까운 물체, 깊은 그림자)
const P1 = 'filter="url(#e1)"';
const P = 'filter="url(#paper)"';
const P3 = 'filter="url(#e3)"';

const C = {
  ink: '#5B5170',
  sun: '#FFD9A8', sunCore: '#FFE7C2',
  treeFar: '#BFE3CE', tree: '#8FD0AE', treeDark: '#7CC39F', treeLight: '#A8DCC0',
  trunk: '#E2C2A8', trunkDark: '#CFA98C',
  trail: '#FDE9D6',
  water: '#B9E0F6', waterLight: '#E0F3FD',
  rock: '#D5CDE6', rockLight: '#E9E3F5', rockDark: '#BDB3D3',
  coral: '#FF9EAE', pink: '#FFB8CF', lavender: '#C9B8F2', butter: '#FFE29A', peach: '#FFC9A8',
  sky: '#A9D2F5', mint: '#A8E6CF', cream: '#FFFBF5',
  brown: '#B9927A',
};

const Art = {
  // 둥근 모서리 소나무 (같은 색 굵은 외곽선 + round join 으로 모서리를 부드럽게)
  pine(x, y, h, color = C.tree, f = P) {
    const w = h * 0.4;
    return `<g ${f}>
      <rect x="${x - h * 0.045}" y="${y - h * 0.14}" width="${h * 0.09}" height="${h * 0.16}" rx="${h * 0.03}" fill="${C.trunk}"/>
      <path d="M${x} ${y - h} L${x + w * 0.62} ${y - h * 0.52} L${x + w * 0.36} ${y - h * 0.52} L${x + w} ${y - h * 0.12}
        L${x - w} ${y - h * 0.12} L${x - w * 0.36} ${y - h * 0.52} L${x - w * 0.62} ${y - h * 0.52}Z"
        fill="${color}" stroke="${color}" stroke-width="${Math.max(4, h * 0.08)}" stroke-linejoin="round"/>
      <path d="M${x} ${y - h + 4} L${x - w * 0.45} ${y - h * 0.58}" stroke="#fff" stroke-opacity=".45" stroke-width="${Math.max(2, h * 0.03)}" stroke-linecap="round"/>
    </g>`;
  },
  roundTree(x, y, r, color = C.tree, f = P) {
    return `<g ${f}>
      <rect x="${x - r * 0.12}" y="${y - r * 1.2}" width="${r * 0.24}" height="${r * 1.2}" rx="${r * 0.08}" fill="${C.trunk}"/>
      <circle cx="${x}" cy="${y - r * 1.6}" r="${r}" fill="${color}"/>
      <circle cx="${x - r * 0.35}" cy="${y - r * 1.9}" r="${r * 0.28}" fill="#fff" opacity=".35"/>
    </g>`;
  },
  cloud(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})" ${P1}>
      <rect x="-4" y="-8" width="96" height="22" rx="11" fill="#FFFFFF"/>
      <circle cx="26" cy="-10" r="16" fill="#FFFFFF"/><circle cx="54" cy="-14" r="20" fill="#FFFFFF"/>
    </g>`;
  },
  sun(x, y, r) {
    return `<circle cx="${x}" cy="${y}" r="${r * 2.2}" fill="url(#sunGlow)"/>
      <circle cx="${x}" cy="${y}" r="${r}" fill="${C.sun}" ${P}/>
      <circle cx="${x}" cy="${y}" r="${r * 0.68}" fill="${C.sunCore}"/>`;
  },
  tuft(x, y, color = C.treeDark) {
    return `<path d="M${x} ${y} q2 -11 4 -1 q2 -14 4 0 q2 -10 4 1 z" fill="${color}" opacity=".8"/>`;
  },
  flower(x, y, color = C.butter) {
    return `<g>
      <line x1="${x}" y1="${y}" x2="${x}" y2="${y - 12}" stroke="${C.treeDark}" stroke-width="1.8" stroke-linecap="round"/>
      <g ${P1}>
        <circle cx="${x - 3.2}" cy="${y - 14}" r="3.4" fill="${color}"/><circle cx="${x + 3.2}" cy="${y - 14}" r="3.4" fill="${color}"/>
        <circle cx="${x}" cy="${y - 17.2}" r="3.4" fill="${color}"/><circle cx="${x}" cy="${y - 10.8}" r="3.4" fill="${color}"/>
        <circle cx="${x}" cy="${y - 14}" r="2.2" fill="#FFFFFF"/>
      </g>
    </g>`;
  },
  mushroom(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})" ${P}>
      <rect x="-5" y="-16" width="10" height="17" rx="4" fill="${C.cream}"/>
      <path d="M-16 -14 Q-15 -34 0 -34 Q15 -34 16 -14Z" fill="${C.coral}" stroke="${C.coral}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="-6" cy="-24" r="3" fill="#fff"/><circle cx="5" cy="-27" r="2.3" fill="#fff"/><circle cx="9" cy="-19" r="2" fill="#fff"/>
    </g>`;
  },

  // ---- 단서 아이콘 (중심 0,0) ----
  paw(color = C.brown) {
    return `<g fill="${color}" ${P}>
      <path d="M-9 5 Q-10 -4 0 -4 Q10 -4 9 5 Q8 11 0 10 Q-8 11 -9 5Z"/>
      <circle cx="-10" cy="-9" r="3.6"/><circle cx="-4" cy="-14" r="3.6"/>
      <circle cx="4" cy="-14" r="3.6"/><circle cx="10" cy="-9" r="3.6"/>
    </g>`;
  },
  ball() {
    return `<g ${P}>
      <circle r="12" fill="${C.coral}"/>
      <path d="M-11.5 -2 Q0 -9 11.5 -2" stroke="#fff" stroke-width="2.4" fill="none"/>
      <path d="M-10 5 Q0 11 10 5" stroke="#fff" stroke-width="2.4" fill="none"/>
      <path d="M5 -11 l2 3 2 -2 1 3 2 -1" stroke="#C9637A" stroke-width="1.3" fill="none" stroke-linejoin="round"/>
      <circle cx="-5" cy="-6" r="2.5" fill="#fff" opacity=".5"/>
    </g>`;
  },
  collar() {
    return `<g ${P}>
      <circle r="11" fill="none" stroke="${C.lavender}" stroke-width="5.5"/>
      <circle cx="-7" cy="-8" r="1.2" fill="#fff"/><circle cx="7" cy="-8" r="1.2" fill="#fff"/><circle cx="0" cy="-11" r="1.2" fill="#fff"/>
      <line x1="0" y1="11" x2="0" y2="14" stroke="#E0B85A" stroke-width="1.5"/>
      <circle cx="0" cy="19" r="7" fill="${C.butter}" stroke="#E8C46A" stroke-width="1.2"/>
      <text x="0" y="21.4" font-size="6.5" text-anchor="middle" fill="${C.ink}">보리</text>
    </g>`;
  },

  // ---- 보리 (앉은 모습, 발 중심 0,0) ----
  bori() {
    return `<g>
      <ellipse cx="0" cy="1" rx="26" ry="4" fill="rgba(107,90,158,.16)"/>
      <path d="M18 -10 Q34 -18 30 -30 Q27 -20 14 -16Z" fill="#F2C9A4" ${P}/>
      <path d="M-20 0 Q-24 -30 0 -34 Q24 -30 20 0Z" fill="${C.cream}" ${P}/>
      <ellipse cx="-9" cy="-2" rx="7" ry="4" fill="${C.cream}" stroke="#EADFD0" stroke-width="1"/>
      <ellipse cx="9" cy="-2" rx="7" ry="4" fill="${C.cream}" stroke="#EADFD0" stroke-width="1"/>
      <circle cx="0" cy="-46" r="17" fill="${C.cream}" ${P}/>
      <path d="M-14 -58 Q-28 -52 -22 -32 Q-14 -40 -10 -52Z" fill="#E0AE86" ${P}/>
      <path d="M14 -58 Q28 -52 22 -32 Q14 -40 10 -52Z" fill="#E0AE86" ${P}/>
      <ellipse cx="0" cy="-38" rx="8" ry="6" fill="#FFFFFF"/>
      <circle cx="-6.5" cy="-48" r="2.4" fill="${C.ink}"/><circle cx="6.5" cy="-48" r="2.4" fill="${C.ink}"/>
      <circle cx="-5.8" cy="-48.8" r=".8" fill="#fff"/><circle cx="7.2" cy="-48.8" r=".8" fill="#fff"/>
      <ellipse cx="0" cy="-40" rx="3.2" ry="2.4" fill="${C.ink}"/>
      <path d="M-3 -36 Q0 -33 0 -37 Q0 -33 3 -36" stroke="${C.ink}" stroke-width="1" fill="none"/>
      <circle cx="-11" cy="-41" r="2.6" fill="${C.pink}" opacity=".7"/><circle cx="11" cy="-41" r="2.6" fill="${C.pink}" opacity=".7"/>
      <circle cx="0" cy="-27" r="6" fill="none" stroke="${C.lavender}" stroke-width="3"/>
    </g>`;
  },
};
