// ===== 스테이지 (챕터 1: 종이 숲) =====
// 각 스테이지는 api로 배경을 쌓고, 상호작용 부품을 배치한다.
// 먼 배경일수록 P1(얕은 그림자), 가까울수록 P3(깊은 그림자)로 깊이감을 준다.

function bgSky(api, grad) {
  api.add(`<rect width="360" height="640" fill="url(#${grad})"/>`);
}
function tufts(list, color) { return list.map(([x, y]) => Art.tuft(x, y, color)).join(''); }
function pines(list, color, f) { return list.map(([x, y, h]) => Art.pine(x, y, h, color, f)).join(''); }

const SCENES = {
  // ---------------------------------------------------------------- 1
  entrance: {
    title: '숲의 입구',
    build(api) {
      bgSky(api, 'skyMorning');
      api.add(Art.sun(285, 130, 32));
      api.add(`<g class="drift">${Art.cloud(24, 182, 1)}</g><g class="drift slow">${Art.cloud(200, 228, 0.75)}</g>`);
      api.add(`<path d="M0 340 Q60 300 120 330 T240 318 T360 305 V640 H0Z" fill="url(#hillFar)" ${P1}/>`);
      api.add(pines([[30, 336, 70], [78, 342, 92], [250, 326, 60], [300, 316, 82], [342, 322, 66]], C.treeFar, P1));
      api.add(`<path d="M0 410 Q90 360 180 395 T360 380 V640 H0Z" fill="url(#hillMid)" ${P}/>`);
      api.add(pines([[18, 420, 112], [112, 404, 92], [272, 404, 86], [326, 398, 124]], C.tree, P));
      api.add(`<path d="M0 470 Q120 440 220 462 T360 452 V640 H0Z" fill="url(#ground)" ${P}/>`);
      api.add(`<path d="M110 640 Q130 560 200 525 Q260 495 360 486 L360 506 Q275 516 232 545 Q185 585 205 640Z" fill="${C.trail}" ${P1}/>`);
      api.add(tufts([[30, 500], [70, 540], [20, 620], [300, 560], [340, 620], [260, 610], [95, 480], [330, 470]]));
      api.add(Art.flower(48, 575, C.butter) + Art.flower(62, 590, C.pink) + Art.flower(310, 535, C.lavender));

      // 덤불 밑에 숨겨진 단서
      api.add(`<ellipse cx="222" cy="534" rx="30" ry="11" fill="#8FCCAC" opacity=".55"/>`);
      const clue = api.clue({
        x: 222, y: 530, icon: Art.paw(), slot: 0,
        msg: '작은 발자국…<br>보리 발자국이야! 🐾',
        onDone: () => api.complete([[200, 545], [290, 505], [400, 490]]),
      });

      api.flap({
        html: `
          <g ${P3}><path d="M152 562 Q144 528 172 514 Q168 480 204 474 Q222 450 250 468 Q282 468 282 504 Q302 520 294 562 Z" fill="${C.treeDark}"/></g>
          <g ${P}><circle cx="192" cy="500" r="16" fill="${C.treeLight}"/><circle cx="248" cy="490" r="14" fill="${C.treeLight}"/>
            <circle cx="268" cy="532" r="12" fill="${C.treeLight}"/><circle cx="174" cy="538" r="11" fill="${C.treeLight}"/></g>
          <g ${P1}>
            <circle cx="206" cy="522" r="4.5" fill="${C.coral}"/><circle cx="234" cy="506" r="4.5" fill="${C.pink}"/>
            <circle cx="258" cy="544" r="4.5" fill="${C.coral}"/><circle cx="186" cy="550" r="4.5" fill="${C.pink}"/>
            <circle cx="240" cy="550" r="4.5" fill="${C.coral}"/>
          </g>`,
        hinge: [[150, 562], [296, 562]], toward: [222, 505], reach: 95, hint: true,
        onOpen() { clue.reveal(); api.hint('뭔가 반짝여! 톡 눌러 봐 ✨'); },
      });

      api.kid(78, 600);
      api.popup({ html: Art.mushroom(316, 610, 1.1), base: [316, 610], hitW: 22, hitH: 42 });
      api.popup({ html: Art.mushroom(342, 602, 0.7), base: [342, 602], hitW: 14, hitH: 28, ring: false });
      api.hint('덤불 뒤에 뭔가 있어!<br>덤불을 <b>아래로 쓱—</b> 끌어내려 봐 👇');
    },
  },

  // ---------------------------------------------------------------- 2
  stream: {
    title: '반짝이는 개울',
    build(api) {
      bgSky(api, 'skyMint');
      api.add(Art.sun(70, 112, 26));
      api.add(`<g class="drift">${Art.cloud(176, 158, 1.05)}</g><g class="drift slow">${Art.cloud(14, 236, 0.7)}</g>`);
      api.add(`<path d="M0 330 Q90 290 170 320 T360 300 V640 H0Z" fill="url(#hillFar)" ${P1}/>`);
      api.add(pines([[40, 336, 80], [120, 328, 64], [230, 320, 90], [320, 312, 70]], C.treeFar, P1));
      api.add(`<path d="M0 400 Q100 375 180 392 T360 388 V640 H0Z" fill="url(#ground)" ${P}/>`);
      api.add(pines([[24, 404, 100], [330, 398, 110]], C.tree, P));

      // 개울
      api.add(`<path d="M150 392 C136 470 172 520 146 640 L234 640 C254 540 214 470 216 392Z" fill="url(#water)" ${P1}/>
        <path d="M168 396 C158 470 188 520 170 640 L208 640 C224 540 198 470 200 396Z" fill="${C.waterLight}" opacity=".8"/>
        <g class="ripples">
          <path d="M168 430 q8 -4 16 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          <path d="M182 470 q8 -4 16 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          <path d="M170 515 q8 -4 16 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
          <path d="M186 585 q8 -4 16 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        </g>`);
      api.add(`<g ${P}><ellipse cx="140" cy="600" rx="14" ry="8" fill="${C.rock}"/><ellipse cx="238" cy="430" rx="11" ry="6" fill="${C.rock}"/>
        <ellipse cx="130" cy="452" rx="9" ry="5" fill="${C.rockLight}"/></g>`);
      api.add(tufts([[30, 470], [90, 520], [40, 560], [300, 440], [340, 600], [270, 600], [110, 420]]));
      api.add(Art.flower(60, 455, C.pink) + Art.flower(318, 590, C.butter) + Art.flower(82, 615, C.lavender));

      // 물고기 (장식)
      api.toy(`<circle cx="190" cy="478" r="20" fill="transparent"/>
        <g class="fish" opacity="0" ${P}><path d="M-11 0 Q0 -8 11 0 Q0 8 -11 0Z" fill="${C.peach}"/><path d="M10 0 l8 -6 v12z" fill="${C.peach}"/>
          <circle cx="-5" cy="-1.5" r="1.4" fill="${C.ink}"/></g>`, async g => {
        const fish = g.querySelector('.fish');
        Sound.splash();
        await tween(800, t => {
          fish.setAttribute('opacity', t < 0.95 ? 1 : 0);
          fish.setAttribute('transform', `translate(${190 + 26 * t} ${478 - 70 * Math.sin(Math.PI * t)}) rotate(${-50 + 100 * t})`);
        }, ease.linear);
        Sound.splash();
      });

      // 바위 밑 단서
      api.add(`<ellipse cx="296" cy="528" rx="30" ry="10" fill="#8FCCAC" opacity=".55"/>`);
      const clue = api.clue({
        x: 296, y: 514, icon: Art.ball(), slot: 1,
        msg: '씹다 만 공…<br>보리가 제일 좋아하던 공이야! 🎾',
        onDone: () => api.complete([[345, 600], [400, 600]]),
      });

      let bridged = false;
      const rock = api.flap({
        html: `
          <g ${P3}><path d="M254 546 Q246 500 272 476 Q300 456 326 476 Q346 498 338 546Z" fill="${C.rock}"/></g>
          <path d="M272 486 Q290 468 312 478 Q296 486 285 502Z" fill="${C.rockLight}"/>
          <path d="M300 520 Q312 512 326 522" stroke="${C.rockDark}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M256 546 Q262 530 280 532 Q300 527 318 546Z" fill="${C.treeLight}"/>`,
        hinge: [[339, 466], [339, 548]], toward: [295, 505], reach: 82,
        locked: () => !bridged,
        onLocked: () => api.hint('손이 안 닿아…<br>먼저 <b>다리</b>를 놓아야 해! 👉'),
        onOpen() { clue.reveal(); api.hint('뭔가 있다! 톡 눌러 봐 ✨'); },
      });

      // 통나무 다리 (탭으로 밀어 넣음)
      const log = api.add(`
        <g ${P3}><rect x="118" y="536" width="142" height="24" rx="12" fill="${C.trunk}"/></g>
        <path d="M135 543 h40 M190 553 h36 M150 553 h22 M200 542 h30" stroke="${C.trunkDark}" stroke-width="1.6" stroke-linecap="round"/>
        <ellipse cx="254" cy="548" rx="7.5" ry="12" fill="#F6E1CF"/>
        <ellipse cx="254" cy="548" rx="3.5" ry="6" fill="none" stroke="${C.trunkDark}" stroke-width="1.2"/>`);
      const kid = api.kid(80, 580);

      api.tab({
        x: 44, y: 616, axis: [1, 0], length: 150, label: '당겨', hint: true,
        onProgress: t => log.setAttribute('transform', `translate(${lerp(-270, 0, t)} 0)`),
        async onComplete() {
          Sound.bonk();
          api.hint('다리가 생겼다! 건너 보자 🚶');
          await kid.walkPath([[118, 552], [258, 552], [242, 600], [246, 600]]);
          bridged = true;
          api.hint('건넜다!<br>이제 바위를 <b>오른쪽으로</b> 젖혀 볼까? 👉');
          rock.showHint();
        },
      });
      api.hint('바위 쪽이 수상해… 근데 개울 건너편이야!<br>아래 종이 탭을 <b>오른쪽으로</b> 당겨 봐 👉');
    },
  },

  // ---------------------------------------------------------------- 3
  tree: {
    title: '커다란 나무',
    build(api) {
      bgSky(api, 'skySunset');
      api.add(Art.sun(72, 232, 40));
      api.add(`<g class="drift slow">${Art.cloud(214, 126, 1)}</g><g class="drift">${Art.cloud(-14, 168, 0.75)}</g>`);
      api.add(`<path d="M0 360 Q80 320 160 350 T360 330 V640 H0Z" fill="url(#hillFar)" ${P1}/>`);
      api.add(pines([[30, 368, 76], [330, 344, 84], [290, 352, 60]], C.treeFar, P1));
      api.add(`<path d="M0 520 Q120 500 200 512 T360 505 V640 H0Z" fill="url(#ground)" ${P}/>`);
      api.add(tufts([[30, 540], [60, 625], [300, 540], [330, 610], [250, 620], [120, 620]]));
      api.add(Art.flower(28, 600, C.pink) + Art.flower(42, 612, C.butter) + Art.flower(320, 575, C.lavender) + Art.flower(300, 590, C.pink));
      api.add(`<ellipse cx="180" cy="577" rx="70" ry="9" fill="rgba(107,90,158,.14)"/>`);

      // 접혀 있는 큰 나무 (팝업)
      const pop = api.popup({
        base: [180, 576], s0: 0.07, hitW: 90, hitH: 50,
        html: `
          <g ${P3}><path d="M146 576 Q158 470 160 380 L202 380 Q204 470 216 576 Q198 566 181 576 Q164 566 146 576Z" fill="${C.trunk}"/></g>
          <path d="M166 400 Q170 450 168 520 M196 410 Q192 470 198 540" stroke="${C.trunkDark}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <g ${P}><path d="M162 410 Q130 390 112 360 L120 354 Q140 380 166 396Z" fill="${C.trunk}"/>
            <path d="M200 400 Q236 380 252 352 L260 358 Q244 392 202 414Z" fill="${C.trunk}"/></g>
          <ellipse cx="181" cy="480" rx="18" ry="25" fill="#8E7A9E"/>`,
        onPop: () => {
          api.hint('나무에 작은 문이 있네?<br>문을 <b>왼쪽으로</b> 열어 봐 👈');
          door.showHint();
        },
      });
      const P2 = pop.el;
      // 수관 (터치하면 나뭇잎이 떨어짐)
      api.toy(`
        <g ${P3}><circle cx="180" cy="300" r="88" fill="${C.treeDark}"/><circle cx="104" cy="340" r="52" fill="${C.treeDark}"/>
          <circle cx="258" cy="336" r="56" fill="${C.treeDark}"/></g>
        <g ${P}><circle cx="140" cy="250" r="46" fill="${C.tree}"/><circle cx="226" cy="246" r="48" fill="${C.tree}"/>
          <circle cx="182" cy="330" r="40" fill="${C.treeLight}"/></g>
        <g ${P1}><circle cx="120" cy="300" r="5.5" fill="${C.coral}"/><circle cx="236" cy="296" r="5.5" fill="${C.pink}"/><circle cx="196" cy="236" r="5.5" fill="${C.coral}"/></g>`,
        async () => {
          Sound.rustle();
          const leaves = [];
          for (let i = 0; i < 6; i++) {
            const x0 = 100 + Math.random() * 160, y0 = 280 + Math.random() * 60;
            const l = G(api.layer, `<path d="M0 -6 Q6 0 0 6 Q-6 0 0 -6Z" fill="${[C.treeLight, C.butter, C.pink][i % 3]}"/>`);
            leaves.push([l, x0, y0, Math.random() * 6]);
          }
          await tween(1500, t => leaves.forEach(([l, x0, y0, ph]) =>
            l.setAttribute('transform', `translate(${x0 + Math.sin(t * 6 + ph) * 14} ${y0 + t * 260}) rotate(${t * 300 + ph * 50})`)), ease.linear);
          leaves.forEach(([l]) => l.remove());
        }, P2);

      const clue = api.clue({
        parent: P2, x: 181, y: 476, scale: 0.78, icon: Art.collar(), slot: 2,
        msg: '"보리" 이름표가 달린 목줄…<br>보리가 이 길로 지나갔어!',
        onDone: () => api.complete([[250, 605], [400, 605]]),
      });
      const door = api.flap({
        parent: P2,
        html: `
          <g ${P3}><ellipse cx="181" cy="479" rx="20" ry="27" fill="${C.peach}"/></g>
          <path d="M171 456 V503 M181 452 V506 M191 456 V503" stroke="#F0AE8A" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="195" cy="482" r="2.6" fill="${C.butter}"/>`,
        hinge: [[161, 450], [161, 508]], toward: [181, 479], reach: 40,
        onOpen() { clue.reveal(); api.hint('안에 뭔가 있어! 톡 ✨'); },
      });

      api.kid(64, 606);
      api.hint('커다란 나무가 접혀 있어!<br>가운데를 <b>톡—</b> 눌러 봐 ☝️');
    },
  },
};
