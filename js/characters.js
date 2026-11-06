// ===== 주인공 5종 =====
// 모든 캐릭터는 발 중심이 (0,0). hat/hand 는 여행 모자와 튤립을 붙일 위치.
// ownHat: 원래 쓰고 있는 모자(베레모·비니) — 여행 모자를 쓰면 숨긴다.

const HAT_ART = `
  <path d="M-15 1 L0 -22 L15 1 Z" fill="#B7D2F7" stroke="#B7D2F7" stroke-width="2" stroke-linejoin="round" ${P}/>
  <rect x="-16" y="-3" width="32" height="6" rx="2" fill="#94BBF0"/>
  <path d="M0 -2.4 l1 2 2.2 .3 -1.6 1.5 .4 2.2 -2 -1 -2 1 .4 -2.2 -1.6 -1.5 2.2 -.3z" fill="${C.butter}"/>`;

const TULIP_ART = `
  <line x1="0" y1="0" x2="3" y2="-20" stroke="${C.treeDark}" stroke-width="2" stroke-linecap="round"/>
  <path d="M3 -20 l-5 -3 1 -7 4 4 4 -4 1 7z" fill="${C.pink}" stroke="#FF9EB8" stroke-width="1" stroke-linejoin="round"/>`;

const SKIN = '#F6DDCD';

const CHARACTERS = {
  kid: {
    name: '노란 우비 아이',
    desc: '호기심 많은 꼬마 탐험가',
    h: 80, sceneScale: 1, previewScale: 1.35,
    hat: [0, -58, 1], hand: [12, -24],
    body: `
      <rect x="-7.5" y="-15" width="5.5" height="15" rx="2.75" fill="#8C84AC"/>
      <rect x="2" y="-15" width="5.5" height="15" rx="2.75" fill="#8C84AC"/>
      <rect x="-19" y="-40" width="10" height="20" rx="4.5" fill="${C.coral}" ${P}/>
      <path d="M-13 -12 L-8.5 -40 Q0 -45 8.5 -40 L13 -12 Q0 -9 -13 -12Z" fill="${C.butter}" stroke="${C.butter}" stroke-width="2" stroke-linejoin="round" ${P}/>
      <line x1="0" y1="-38" x2="0" y2="-13" stroke="#F2CB78" stroke-width="1"/>
      <circle cx="0" cy="-51" r="11.5" fill="#FFE1CF" ${P}/>
      <path d="M-11.5 -52 Q-11 -64 0 -63.5 Q11.5 -64 11.5 -51 Q6 -58 -1 -57 Q-8 -57 -11.5 -52Z" fill="#8A7398"/>
      <circle cx="-2.5" cy="-50" r="1.6" fill="${C.ink}"/><circle cx="5" cy="-50" r="1.6" fill="${C.ink}"/>
      <circle cx="8" cy="-46" r="2.3" fill="${C.pink}" opacity=".8"/><circle cx="-6" cy="-46" r="2.3" fill="${C.pink}" opacity=".8"/>
      <path d="M0 -45 q1.5 1.5 3 0" stroke="#B0788A" stroke-width="1" fill="none" stroke-linecap="round"/>`,
  },

  coat: {
    name: '트렌치코트 여행자',
    desc: '보리를 찾아 길을 나선 어른',
    h: 128, sceneScale: 0.72, previewScale: 1,
    hat: [0, -121, 0.72], hand: [19, -55],
    body: `
      <rect x="-8" y="-48" width="6.5" height="48" rx="3" fill="#7A7397"/><rect x="1.5" y="-48" width="6.5" height="48" rx="3" fill="#7A7397"/>
      <ellipse cx="-5.5" cy="-1.5" rx="6" ry="3" fill="${C.ink}"/><ellipse cx="5.5" cy="-1.5" rx="6" ry="3" fill="${C.ink}"/>
      <path d="M-13 -97 Q0 -102 13 -97 L18 -42 Q0 -37 -18 -42Z" fill="#EAD7C3" ${P}/>
      <path d="M0 -95 L2 -41" stroke="#D6BEA6" stroke-width="1.2"/>
      <path d="M-6 -96 L0 -84 L6 -96" fill="none" stroke="#D6BEA6" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="-16" y="-68" width="32" height="4" rx="2" fill="#D6BEA6"/>
      <path d="M-12 -95 Q-21 -80 -19 -58" stroke="#E2CDB7" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M12 -95 Q21 -80 19 -58" stroke="#E2CDB7" stroke-width="7" stroke-linecap="round" fill="none"/>
      <circle cx="-19" cy="-55" r="3.4" fill="${SKIN}"/><circle cx="19" cy="-55" r="3.4" fill="${SKIN}"/>
      <path d="M-11 -94 L14 -60" stroke="${C.coral}" stroke-width="2.2" stroke-linecap="round"/>
      <rect x="9" y="-64" width="13" height="11" rx="3" fill="${C.coral}" ${P}/>
      <rect x="-3" y="-106" width="6" height="7" fill="#F0D0BF"/>
      <path d="M-8 -100 Q0 -95 8 -100 L9 -96 Q0 -91 -9 -96Z" fill="${C.lavender}"/>
      <path d="M4 -96 L8 -80 L3 -80Z" fill="${C.lavender}"/>
      <ellipse cx="0" cy="-115" rx="9" ry="10.5" fill="${SKIN}" ${P}/>
      <path d="M-9.6 -114 Q-10.5 -128 0 -127 Q10.5 -127 9.8 -113 Q7 -121 -1 -120 Q-6 -118 -9.6 -114Z" fill="#6B5A7A"/>
      <path d="M-4.6 -114 h2.6 M2 -114 h2.6" stroke="${C.ink}" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M-1.5 -108.5 q1.5 1 3 0" stroke="#B0788A" stroke-width="1" fill="none" stroke-linecap="round"/>`,
  },

  cloak: {
    name: '망토 방랑자',
    desc: '바람을 따라 걷는 이름 없는 여행자',
    h: 132, sceneScale: 0.72, previewScale: 1,
    hat: [0, -116, 0.7], hand: [16, -58],
    body: `
      <rect x="-7" y="-16" width="5" height="16" rx="2.5" fill="#6E6788"/><rect x="2" y="-16" width="5" height="16" rx="2.5" fill="#6E6788"/>
      <path class="scarf" d="M-6 -96 Q-30 -90 -46 -100 Q-36 -84 -10 -88Z" fill="${C.pink}" ${P}/>
      <path d="M0 -124 Q-12 -122 -13 -106 L-25 -14 Q0 -8 25 -14 L13 -106 Q12 -122 0 -124Z" fill="#A9C8F5" ${P}/>
      <path d="M0 -106 L1 -11 Q13 -10 25 -14 L13 -106 Q12 -118 6 -122Z" fill="#BCD5F8"/>
      <path d="M0 -124 Q6 -132 14 -128 Q8 -126 6 -120Z" fill="#A9C8F5"/>
      <ellipse cx="0" cy="-106" rx="6.5" ry="8" fill="${SKIN}"/>
      <path d="M-8 -96 Q0 -91 8 -96 L8 -92 Q0 -87 -8 -92Z" fill="${C.pink}"/>`,
  },

  paper: {
    name: '페이퍼컷 아티스트',
    desc: '종이 세상을 꼭 닮은 예술가',
    h: 132, sceneScale: 0.72, previewScale: 1,
    hat: [0, -117, 0.68], hand: [20, -61],
    body: `
      <polygon points="-8,-46 -2,-46 -2,0 -9,0" fill="${C.ink}"/><polygon points="2,-46 8,-46 9,0 2,0" fill="#6E6788"/>
      <polygon points="-11,-2 -1,-2 -1,2 -13,2" fill="#3F3858"/><polygon points="1,-2 11,-2 13,2 1,2" fill="#3F3858"/>
      <g ${P}><polygon points="0,-98 -20,-42 0,-42" fill="#9FDCC2"/><polygon points="0,-98 20,-42 0,-42" fill="#86CDB0"/></g>
      <polygon points="-11,-90 -22,-62 -17,-60 -8,-84" fill="#9FDCC2"/>
      <polygon points="11,-90 22,-62 17,-60 8,-84" fill="#86CDB0"/>
      <polygon points="-9,-97 9,-97 7,-91 -7,-91" fill="${C.butter}"/>
      <polygon points="5,-92 12,-74 7,-76 9,-70 3,-74 2,-91" fill="${C.butter}"/>
      <polygon points="-3,-104 3,-104 3,-97 -3,-97" fill="#F0D0BF"/>
      <polygon points="0,-122 9,-116 9,-106 0,-101 -9,-106 -9,-116" fill="${SKIN}" ${P}/>
      <polygon points="0,-122 9,-116 9,-106 0,-101" fill="#EFCFBD"/>
      <g class="own-hat"><polygon points="-12,-118 2,-128 13,-121 6,-116" fill="${C.coral}" ${P}/><polygon points="2,-128 4,-132 6,-127" fill="${C.coral}"/></g>
      <rect x="-5" y="-112" width="2.2" height="2.2" fill="${C.ink}"/><rect x="3" y="-112" width="2.2" height="2.2" fill="${C.ink}"/>`,
  },

  hoodie: {
    name: '후드티 산책러',
    desc: '매일 보리랑 산책하던 그 모습 그대로',
    h: 128, sceneScale: 0.72, previewScale: 1,
    hat: [0, -118, 0.72], hand: [-18, -53],
    body: `
      <path d="M-11 -46 L-2 -46 L-3 -3 L-12 -3Z" fill="#8C84AC"/><path d="M2 -46 L11 -46 L12 -3 L3 -3Z" fill="#7F77A2"/>
      <ellipse cx="-7.5" cy="-2" rx="7" ry="3.4" fill="#FFFFFF" stroke="#D9D2EA" stroke-width="1"/>
      <ellipse cx="7.5" cy="-2" rx="7" ry="3.4" fill="#FFFFFF" stroke="#D9D2EA" stroke-width="1"/>
      <path d="M-17 -92 Q0 -100 17 -92 Q21 -70 19 -44 Q0 -40 -19 -44 Q-21 -70 -17 -92Z" fill="${C.lavender}" ${P}/>
      <path d="M-9 -60 Q0 -57 9 -60 L8 -50 Q0 -48 -8 -50Z" fill="#B9A6EC"/>
      <path d="M-10 -95 Q0 -88 10 -95 Q6 -100 0 -100 Q-6 -100 -10 -95Z" fill="#B9A6EC"/>
      <path d="M-3 -92 L-3 -82 M3 -92 L3 -82" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M-15 -88 Q-22 -72 -18 -56" stroke="${C.lavender}" stroke-width="8" stroke-linecap="round" fill="none"/>
      <path d="M15 -88 Q26 -78 32 -70" stroke="${C.lavender}" stroke-width="8" stroke-linecap="round" fill="none"/>
      <circle cx="-18" cy="-53" r="3.4" fill="${SKIN}"/><circle cx="34" cy="-68" r="3.4" fill="${SKIN}"/>
      <path class="leash" d="M34 -66 Q58 -40 70 -27" stroke="${C.coral}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <rect x="-3" y="-103" width="6" height="6" fill="#F0D0BF"/>
      <ellipse cx="0" cy="-112" rx="9" ry="10" fill="${SKIN}" ${P}/>
      <g class="own-hat"><path d="M-10 -112 Q-10 -126 0 -126 Q10 -126 10 -112 Q0 -116 -10 -112Z" fill="${C.butter}" ${P}/>
        <rect x="-10.5" y="-115" width="21" height="4" rx="2" fill="#F5D27A"/><circle cx="0" cy="-127" r="2.6" fill="${C.butter}"/></g>
      <path d="M-9 -112 Q-11 -104 -8 -101 M9 -112 Q11 -104 8 -101" stroke="#8A7398" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="-3.4" cy="-109" r="1.3" fill="${C.ink}"/><circle cx="3.4" cy="-109" r="1.3" fill="${C.ink}"/>
      <path d="M-1.6 -105 q1.6 1.4 3.2 0" stroke="#B0788A" stroke-width="1" fill="none" stroke-linecap="round"/>
      <circle cx="-6" cy="-106" r="1.8" fill="${C.pink}" opacity=".6"/><circle cx="6" cy="-106" r="1.8" fill="${C.pink}" opacity=".6"/>`,
  },
};
const CHARACTER_IDS = ['kid', 'coat', 'cloak', 'paper', 'hoodie'];

// 캐릭터 SVG (발 중심 0,0). opts: { hat, tulip, leash }
function characterSVG(id, opts = {}) {
  const ch = CHARACTERS[id] || CHARACTERS.kid;
  const [hx, hy, hs] = ch.hat, [tx, ty] = ch.hand;
  const w = id === 'kid' ? 15 : 19;
  return `<g class="kid-body char-${id}${opts.leash ? '' : ' no-leash'}${opts.hat ? ' has-hat' : ''}">
    <ellipse cx="0" cy="1" rx="${w}" ry="4" fill="rgba(107,90,158,.16)"/>
    ${ch.body}
    <g class="kid-tulip" style="display:${opts.tulip ? '' : 'none'}" transform="translate(${tx} ${ty})">${TULIP_ART}
      <circle cx="0" cy="0" r="3.2" fill="${SKIN}"/></g>
    <g class="kid-hat" style="display:${opts.hat ? '' : 'none'}" transform="translate(${hx} ${hy}) scale(${hs})">${HAT_ART}</g>
  </g>`;
}
