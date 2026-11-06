// ===== 종이 공예 스타일 아트 조각들 (SVG 문자열) =====
const P = 'filter="url(#paper)"';

const Art = {
  pine(x, y, h, color = '#5e8a4c') {
    const w = h * 0.42;
    return `<g ${P}>
      <rect x="${x - h * 0.04}" y="${y - h * 0.12}" width="${h * 0.08}" height="${h * 0.14}" fill="#7a5236"/>
      <path d="M${x} ${y - h} L${x + w * 0.62} ${y - h * 0.5} L${x + w * 0.35} ${y - h * 0.5} L${x + w} ${y - h * 0.1}
        L${x - w} ${y - h * 0.1} L${x - w * 0.35} ${y - h * 0.5} L${x - w * 0.62} ${y - h * 0.5}Z" fill="${color}"/>
    </g>`;
  },
  roundTree(x, y, r, color = '#6f9b55') {
    return `<g ${P}>
      <rect x="${x - r * 0.12}" y="${y - r * 1.2}" width="${r * 0.24}" height="${r * 1.2}" fill="#8b5e3c"/>
      <circle cx="${x}" cy="${y - r * 1.6}" r="${r}" fill="${color}"/>
      <circle cx="${x - r * 0.3}" cy="${y - r * 1.8}" r="${r * 0.35}" fill="${shade(color, 1.15)}"/>
    </g>`;
  },
  cloud(x, y, s = 1, cls = '') {
    return `<path class="${cls}" ${P} transform="translate(${x} ${y}) scale(${s})"
      d="M0 0 q4 -20 26 -14 q10 -18 32 -6 q22 -6 24 14 q14 2 10 14 H-6 q-12 -4 6 -8z" fill="#fffaf0"/>`;
  },
  tuft(x, y, color = '#5e8a4c') {
    return `<path d="M${x} ${y} q2 -11 4 -1 q2 -14 4 0 q2 -10 4 1 z" fill="${color}"/>`;
  },
  flower(x, y, color = '#f2c14e') {
    return `<g>
      <line x1="${x}" y1="${y}" x2="${x}" y2="${y - 12}" stroke="#4f7d43" stroke-width="1.6"/>
      <circle cx="${x - 3}" cy="${y - 14}" r="3" fill="${color}"/><circle cx="${x + 3}" cy="${y - 14}" r="3" fill="${color}"/>
      <circle cx="${x}" cy="${y - 17}" r="3" fill="${color}"/><circle cx="${x}" cy="${y - 11}" r="3" fill="${color}"/>
      <circle cx="${x}" cy="${y - 14}" r="2" fill="#fff6d8"/>
    </g>`;
  },
  mushroom(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})" ${P}>
      <rect x="-5" y="-16" width="10" height="17" rx="3" fill="#f3e3c3"/>
      <path d="M-16 -14 Q-15 -33 0 -33 Q15 -33 16 -14Z" fill="#d9644a"/>
      <circle cx="-6" cy="-24" r="3" fill="#fff6e6"/><circle cx="5" cy="-27" r="2.3" fill="#fff6e6"/><circle cx="9" cy="-19" r="2" fill="#fff6e6"/>
    </g>`;
  },

  // ---- 단서 아이콘 (중심 0,0) ----
  paw(color = '#6b4a35') {
    return `<g fill="${color}">
      <path d="M-9 5 Q-10 -4 0 -4 Q10 -4 9 5 Q8 11 0 10 Q-8 11 -9 5Z"/>
      <circle cx="-10" cy="-9" r="3.6"/><circle cx="-4" cy="-14" r="3.6"/>
      <circle cx="4" cy="-14" r="3.6"/><circle cx="10" cy="-9" r="3.6"/>
    </g>`;
  },
  ball() {
    return `<g>
      <circle r="12" fill="#d9644a" ${P}/>
      <path d="M-11.5 -2 Q0 -9 11.5 -2" stroke="#fff6e6" stroke-width="2.4" fill="none"/>
      <path d="M-10 5 Q0 11 10 5" stroke="#fff6e6" stroke-width="2.4" fill="none"/>
      <path d="M5 -11 l2 3 2 -2 1 3 2 -1" stroke="#7a2e22" stroke-width="1.3" fill="none" stroke-linejoin="round"/>
    </g>`;
  },
  collar() {
    return `<g>
      <circle r="11" fill="none" stroke="#c0392b" stroke-width="5.5" ${P}/>
      <circle cx="-7" cy="-8" r="1.2" fill="#f7d774"/><circle cx="7" cy="-8" r="1.2" fill="#f7d774"/><circle cx="0" cy="-11" r="1.2" fill="#f7d774"/>
      <line x1="0" y1="11" x2="0" y2="14" stroke="#b8860b" stroke-width="1.5"/>
      <circle cx="0" cy="19" r="7" fill="#f2c14e" stroke="#b8860b" stroke-width="1.2"/>
      <text x="0" y="21.4" font-size="6.5" text-anchor="middle" fill="#6b4a00" font-weight="700">보리</text>
    </g>`;
  },

  // ---- 주인공 (발 중심이 0,0) ----
  kid() {
    return `<g class="kid-body">
      <ellipse cx="0" cy="1" rx="15" ry="3.5" fill="rgba(60,40,20,.18)"/>
      <rect x="-7.5" y="-15" width="5.5" height="15" rx="2.5" fill="#4b4453"/>
      <rect x="2" y="-15" width="5.5" height="15" rx="2.5" fill="#4b4453"/>
      <rect x="-19" y="-40" width="10" height="20" rx="4" fill="#c9703c" ${P}/>
      <path d="M-13 -12 L-8.5 -40 Q0 -45 8.5 -40 L13 -12 Q0 -9 -13 -12Z" fill="#f2c14e" ${P}/>
      <line x1="0" y1="-38" x2="0" y2="-13" stroke="#d9a53a" stroke-width="1"/>
      <circle cx="0" cy="-51" r="11.5" fill="#f6d6b8" ${P}/>
      <path d="M-11.5 -52 Q-11 -64 0 -63.5 Q11.5 -64 11.5 -51 Q6 -58 -1 -57 Q-8 -57 -11.5 -52Z" fill="#4a3426"/>
      <circle cx="-2.5" cy="-50" r="1.6" fill="#2b2118"/><circle cx="5" cy="-50" r="1.6" fill="#2b2118"/>
      <circle cx="8" cy="-46" r="2.2" fill="#f2a29a" opacity=".7"/><circle cx="-6" cy="-46" r="2.2" fill="#f2a29a" opacity=".7"/>
      <path d="M0 -45 q1.5 1.5 3 0" stroke="#7a4a3a" stroke-width="1" fill="none" stroke-linecap="round"/>
      <g class="kid-hat" style="display:none">
        <path d="M-13.5 -58 L0 -79 L13.5 -58 Z" fill="#5b8fb9" ${P}/>
        <rect x="-14.5" y="-61" width="29" height="5.5" rx="1" fill="#3f6f96"/>
        <path d="M0 -60.2 l1 2 2.2 .3 -1.6 1.5 .4 2.2 -2 -1 -2 1 .4 -2.2 -1.6 -1.5 2.2 -.3z" fill="#f2c14e"/>
      </g>
    </g>`;
  },

  // ---- 보리 (앉은 모습, 발 중심 0,0) ----
  bori() {
    return `<g>
      <ellipse cx="0" cy="1" rx="26" ry="4" fill="rgba(60,40,20,.18)"/>
      <path d="M18 -10 Q34 -18 30 -30 Q27 -20 14 -16Z" fill="#d39a66" ${P}/>
      <path d="M-20 0 Q-24 -30 0 -34 Q24 -30 20 0Z" fill="#f6e7cf" ${P}/>
      <ellipse cx="-9" cy="-2" rx="7" ry="4" fill="#f6e7cf" stroke="#e2cfae" stroke-width="1"/>
      <ellipse cx="9" cy="-2" rx="7" ry="4" fill="#f6e7cf" stroke="#e2cfae" stroke-width="1"/>
      <circle cx="0" cy="-46" r="17" fill="#f6e7cf" ${P}/>
      <path d="M-14 -58 Q-28 -52 -22 -32 Q-14 -40 -10 -52Z" fill="#8a5a3b" ${P}/>
      <path d="M14 -58 Q28 -52 22 -32 Q14 -40 10 -52Z" fill="#8a5a3b" ${P}/>
      <ellipse cx="0" cy="-38" rx="8" ry="6" fill="#fffaf0"/>
      <circle cx="-6.5" cy="-48" r="2.4" fill="#2b2118"/><circle cx="6.5" cy="-48" r="2.4" fill="#2b2118"/>
      <circle cx="-5.8" cy="-48.8" r=".8" fill="#fff"/><circle cx="7.2" cy="-48.8" r=".8" fill="#fff"/>
      <ellipse cx="0" cy="-40" rx="3.2" ry="2.4" fill="#2b2118"/>
      <path d="M-3 -36 Q0 -33 0 -37 Q0 -33 3 -36" stroke="#2b2118" stroke-width="1" fill="none"/>
      <circle cx="0" cy="-27" r="6" fill="none" stroke="#c0392b" stroke-width="3"/>
    </g>`;
  },
};
