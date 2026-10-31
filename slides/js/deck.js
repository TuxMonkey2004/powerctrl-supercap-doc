/* ============================================================
   deck.js — 幻灯片引擎 + 交互
   ============================================================ */
(function () {
  'use strict';

  const SLIDES = window.SLIDES || [];
  const deck = document.getElementById('deck');
  const bar = document.getElementById('progressBar');
  const stage = document.getElementById('stage');
  const mhRight = document.getElementById('mhRight');
  const sectionName = document.getElementById('sectionName');
  const pageNow = document.getElementById('pageNow');
  const pageTotal = document.getElementById('pageTotal');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const overlay = document.getElementById('overlay');
  const overlayGrid = document.getElementById('overlayGrid');
  const overlayFilters = document.getElementById('overlayFilters');
  const btnOverview = document.getElementById('btnOverview');
  const btnCloseOverview = document.getElementById('btnCloseOverview');
  const hint = document.getElementById('hint');

  let cur = 0;
  let overhead = false;

  /* -------------------------------------------------- 缩放 */
  function fit() {
    const s = Math.min(window.innerWidth / 1600, (window.innerHeight - 76) / 900);
    stage.style.setProperty('--s', Math.max(0.24, s).toFixed(4));
  }
  window.addEventListener('resize', fit);

  /* -------------------------------------------------- 渲染 */
  function render() {
    const frag = document.createDocumentFragment();
    SLIDES.forEach((s, i) => {
      const el = document.createElement('section');
      el.className = 'slide' + (s.cls ? ' ' + s.cls : '');
      el.dataset.id = s.id;
      el.dataset.index = i;
      const isPlain = el.classList.contains('cover') || el.classList.contains('divider');
      const head = isPlain ? '' :
        `<div class="kicker reveal"><span class="num">${String(i + 1).padStart(2, '0')}</span>${s.sub || s.part}</div>
         <h2 class="slide-title reveal d1">${s.title}</h2>`;
      el.innerHTML = head + `<div class="slide-body reveal d2">${s.html || ''}</div>`;
      frag.appendChild(el);
    });
    deck.appendChild(frag);
  }

  /* -------------------------------------------------- 翻页 */
  function goTo(i, force) {
    const n = SLIDES.length;
    i = Math.max(0, Math.min(n - 1, i));
    if (i === cur && !force) { updateHud(); return; }

    const slides = deck.children;
    // 暂停所有正在跑的动画
    Object.keys(anims).forEach(k => { const a = anims[k]; if (a && a.pause) a.pause(); });

    const prev = slides[cur];
    if (prev && prev !== slides[i]) prev.classList.remove('active');
    cur = i;
    const el = slides[cur];
    el.classList.add('active');

    typesetSlide(el);

    requestAnimationFrame(() => {
      const a = anims[SLIDES[cur].id];
      if (a && a.resume) a.resume();
      else if (INIT[SLIDES[cur].id]) anims[SLIDES[cur].id] = INIT[SLIDES[cur].id](el) || {};
    });

    updateHud();
    hideHint();
  }

  function updateHud() {
    const s = SLIDES[cur];
    bar.style.width = ((cur + 1) / SLIDES.length * 100).toFixed(2) + '%';
    pageNow.textContent = cur + 1;
    pageTotal.textContent = SLIDES.length;
    mhRight.textContent = s.part || '';
    sectionName.textContent = s.sub ? s.sub.split('·')[0].trim() : (s.part || '');
    btnPrev.disabled = cur === 0;
    btnNext.disabled = cur === SLIDES.length - 1;
  }

  /* -------------------------------------------------- MathJax 按页排版 */
  const typesetDone = new Set();
  function typesetSlide(el) {
    if (!window.MathJax || !MathJax.typesetPromise) return;
    const key = el.dataset.index;
    if (typesetDone.has(key)) return;
    typesetDone.add(key);
    const ready = (MathJax.startup && MathJax.startup.promise)
      ? MathJax.startup.promise : Promise.resolve();
    ready.then(() => MathJax.typesetPromise([el])).catch(() => {});
  }

  function hideHint() { if (hint) hint.classList.add('gone'); }

  /* -------------------------------------------------- 快速导航 */
  let ovFilter = 'all';
  function buildOverview() {
    const parts = ['all', ...new Set(SLIDES.map(s => s.part))];
    overlayFilters.innerHTML = parts.map(p =>
      `<button data-f="${p}" class="${p === ovFilter ? 'on' : ''}">${p === 'all' ? '全部' : p}</button>`
    ).join('');
    overlayFilters.querySelectorAll('button').forEach(b => {
      b.onclick = () => { ovFilter = b.dataset.f; buildOverview(); };
    });

    overlayGrid.innerHTML = SLIDES.map((s, i) => {
      if (ovFilter !== 'all' && s.part !== ovFilter) return '';
      return `<button class="ov-card ${i === cur ? 'cur' : ''}" data-i="${i}">
                <span class="no">${String(i + 1).padStart(2, '0')}</span>
                <span class="tt">${s.title}</span>
                <span class="pt ${s.partKey || 'p0'}">${s.part}</span>
              </button>`;
    }).join('');

    overlayGrid.querySelectorAll('.ov-card').forEach(c => {
      c.onclick = () => { closeOverview(); goTo(+c.dataset.i, true); };
    });
    const cc = overlayGrid.querySelector('.ov-card.cur');
    if (cc) cc.scrollIntoView({ block: 'center' });
  }

  function openOverview() {
    overhead = true;
    buildOverview();
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('show'));
  }
  function closeOverview() {
    overhead = false;
    overlay.classList.remove('show');
    setTimeout(() => { overlay.hidden = true; }, 220);
  }

  /* -------------------------------------------------- 事件 */
  btnPrev.onclick = () => goTo(cur - 1);
  btnNext.onclick = () => goTo(cur + 1);
  btnOverview.onclick = openOverview;
  btnCloseOverview.onclick = closeOverview;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeOverview(); });

  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (overhead) {
      if (k === 'Escape' || k === 'g' || k === 'G') { e.preventDefault(); closeOverview(); }
      return;
    }
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); goTo(cur + 1); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); goTo(cur - 1); }
    else if (k === 'Home') { e.preventDefault(); goTo(0); }
    else if (k === 'End') { e.preventDefault(); goTo(SLIDES.length - 1); }
    else if (k === 'g' || k === 'G') { e.preventDefault(); openOverview(); }
    else if (k === 'f' || k === 'F') {
      e.preventDefault();
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    }
  });

  let wheelLock = 0;
  window.addEventListener('wheel', e => {
    if (overhead) return;
    const now = Date.now();
    if (now - wheelLock < 640) return;
    if (Math.abs(e.deltaY) < 26) return;
    wheelLock = now;
    goTo(cur + (e.deltaY > 0 ? 1 : -1));
  }, { passive: true });

  let tx = 0, ty = 0;
  window.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchend', e => {
    if (overhead) return;
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy)) goTo(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  let idleT = null;
  function bump() {
    document.body.classList.remove('idle');
    clearTimeout(idleT);
    idleT = setTimeout(() => document.body.classList.add('idle'), 2800);
  }
  window.addEventListener('mousemove', bump);
  window.addEventListener('keydown', bump);
  bump();

  /* ============================================================
     交互注册表
     ============================================================ */
  const INIT = {};
  const anims = {};

  /* ============================================================
     一、Buck / Boost 转换器动画
     ============================================================ */
  function mosSVG(id, cx, cy, label) {
    const w = 82, h = 48;
    return `<g class="mos off" id="${id}">
      <rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="7"></rect>
      <text x="${cx}" y="${cy + 1}">${label}</text>
    </g>`;
  }

  function circuitSVG() {
    const yT = 84, yM = 222, yB = 360;
    const xU1 = 96, xC1 = 176, xBL = 300, xBR = 660, xC2 = 752, xR = 856, xU2 = 950;
    const Lx1 = 372, Lx2 = 578;
    let coil = '', seg = (Lx2 - Lx1) / 4;
    for (let i = 0; i < 4; i++) {
      const x0 = Lx1 + i * seg;
      coil += `M${x0},${yM} a${seg / 2},${seg / 2} 0 0 1 ${seg},0 `;
    }
    let zig = '';
    for (let i = 0; i < 4; i++) zig += `l${i % 2 ? -26 : 26},14 `;

    return `<svg viewBox="0 0 1020 430" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#334155"/>
        </marker>
      </defs>
      <path class="wire" d="M${xU1},${yT} H${xBL}"/>
      <path class="wire" d="M${xBR},${yT} H${xU2}"/>
      <path class="wire" d="M${xU1},${yB} H${xU2}"/>

      <path class="wire" d="M${xU1},${yT} V${yB}"/>
      <path class="wire" d="M${xU1 - 17},${yM - 16} H${xU1 + 17}"/>
      <path class="wire" d="M${xU1 - 9},${yM + 8} H${xU1 + 9}"/>
      <text class="lbl" x="${xU1 - 26}" y="${yM + 6}" text-anchor="end">U₁</text>

      <path class="wire" d="M${xC1},${yT} V${yM - 14}"/>
      <path class="wire" d="M${xC1 - 20},${yM - 14} H${xC1 + 20}"/>
      <path class="wire" d="M${xC1 - 20},${yM + 4} H${xC1 + 20}"/>
      <path class="wire" d="M${xC1},${yM + 4} V${yB}"/>
      <text class="lbl-sm" x="${xC1 + 26}" y="${yM - 4}">C₁</text>

      <!-- 电流路径画在导线之上、开关管之下，否则会盖住 S1~S4 的文字 -->
      <path class="flow" id="flowA" d=""/>

      <path class="wire" d="M${xBL},${yT} V129"/>
      ${mosSVG('sw-S1', xBL, 153, 'S₁')}
      <path class="wire" d="M${xBL},177 V${yM}"/>
      <path class="wire" d="M${xBL},${yM} V267"/>
      ${mosSVG('sw-S2', xBL, 291, 'S₂')}
      <path class="wire" d="M${xBL},315 V${yB}"/>
      <circle cx="${xBL}" cy="${yM}" r="4.5" fill="#334155"/>
      <text class="lbl-sm" x="${xBL - 14}" y="${yM - 12}" text-anchor="end">A</text>

      <path class="wire" d="M${xBL},${yM} H${Lx1}"/>
      <path class="wire" d="${coil}" stroke-width="3"/>
      <path class="wire" d="M${Lx2},${yM} H${xBR}"/>
      <text class="lbl" x="${(Lx1 + Lx2) / 2}" y="${yM - 26}" text-anchor="middle">L</text>

      <path class="wire" d="M${xBR},${yT} V129"/>
      ${mosSVG('sw-S3', xBR, 153, 'S₃')}
      <path class="wire" d="M${xBR},177 V${yM}"/>
      <path class="wire" d="M${xBR},${yM} V267"/>
      ${mosSVG('sw-S4', xBR, 291, 'S₄')}
      <path class="wire" d="M${xBR},315 V${yB}"/>
      <circle cx="${xBR}" cy="${yM}" r="4.5" fill="#334155"/>
      <text class="lbl-sm" x="${xBR + 14}" y="${yM - 12}">B</text>

      <path class="wire" d="M${xC2},${yT} V${yM - 14}"/>
      <path class="wire" d="M${xC2 - 20},${yM - 14} H${xC2 + 20}"/>
      <path class="wire" d="M${xC2 - 20},${yM + 4} H${xC2 + 20}"/>
      <path class="wire" d="M${xC2},${yM + 4} V${yB}"/>
      <text class="lbl-sm" x="${xC2 + 26}" y="${yM - 4}">C₂</text>

      <path class="wire" d="M${xR},${yT} V${yM - 56}"/>
      <path class="wire" d="M${xR},${yM - 56} ${zig}" stroke-width="3"/>
      <path class="wire" d="M${xR},${yM + 4} V${yB}"/>
      <text class="lbl-sm" x="${xR + 26}" y="${yM + 4}">R</text>

      <path class="wire-lite" d="M${xU2},${yT} V${yB}" marker-start="url(#arw)" marker-end="url(#arw)"/>
      <text class="lbl" x="${xU2 + 16}" y="${yM + 6}">U₂</text>
    </svg>`;
  }

  function buildWaveSVG() {
    return `<svg viewBox="0 0 520 300" preserveAspectRatio="xMidYMid meet">
      <path class="axis" d="M46,96 H500"/>
      <text class="lbl-sm" x="40" y="80" text-anchor="end" data-pwmlbl>Vgs</text>
      <g data-bands></g>
      <path class="wave v" d="" data-gateall opacity=".22"/>
      <path class="wave v" d="" data-gate/>
      <path class="axis" d="M46,258 H500"/>
      <text class="lbl-sm" x="40" y="200" text-anchor="end">iL</text>
      <path class="wave up" d="" data-curall opacity=".20"/>
      <path class="wave up" d="" data-cur/>
      <line class="cursor" x1="46" y1="40" x2="46" y2="278" data-cursor/>
      <text class="lbl-sm" x="46" y="288" data-phase>储能相</text>
    </svg>`;
  }

  const CONV = {
    buck: {
      dA: 0.56,
      phases: [
        { sw: { S1: 'on', S2: 'off', S3: 'on', S4: 'off' }, tag: 'store',
          name: '储能相：S₁ 导通，电流经 S₃ 送往输出',
          flow: 'M96,360 V84 H300 V222 H660 V84 H950 V360 H96' },
        { sw: { S1: 'off', S2: 'on', S3: 'on', S4: 'off' }, tag: 'release',
          name: '释能相：S₂ 续流，电感继续向输出供电',
          flow: 'M372,222 H660 V84 H950 V360 H300 V222 H372' }
      ],
      pwmName: 'Vgs1'
    },
    boost: {
      dA: 0.40,
      phases: [
        { sw: { S1: 'on', S2: 'off', S3: 'off', S4: 'on' }, tag: 'store',
          name: '储能相：S₄ 把电感短路，i_L 上升',
          flow: 'M96,360 V84 H300 V222 H660 V360 H96' },
        { sw: { S1: 'on', S2: 'off', S3: 'on', S4: 'off' }, tag: 'release',
          name: '释能相：S₃ 导通，电感叠加电源向输出供电',
          flow: 'M96,360 V84 H300 V222 H660 V84 H950 V360 H96' }
      ],
      pwmName: 'Vgs4'
    }
  };

  function makeConverter(el, mode) {
    const cfg = CONV[mode];
    el.querySelector('.circuit-wrap').innerHTML = circuitSVG();
    el.querySelector('.wave-wrap').innerHTML = buildWaveSVG();

    const svg = el.querySelector('.circuit-wrap svg');
    const flowA = svg.querySelector('#flowA');
    const swMap = {};
    ['S1', 'S2', 'S3', 'S4'].forEach(k => swMap[k] = svg.querySelector('#sw-' + k));

    const wGate = el.querySelector('[data-gate]');
    const wGateAll = el.querySelector('[data-gateall]');
    const wCur = el.querySelector('[data-cur]');
    const wCurAll = el.querySelector('[data-curall]');
    const wCursor = el.querySelector('[data-cursor]');
    const wPhase = el.querySelector('[data-phase]');
    const wBands = el.querySelector('[data-bands]');
    el.querySelector('[data-pwmlbl]').innerHTML = cfg.pwmName;

    const X0 = 46, X1 = 500, YG_HI = 56, YG_LO = 132, YC_LO = 268, YC_HI = 176;
    const PERIODS = 3, dA = cfg.dA, span = X1 - X0;
    const xOf = t => X0 + (t / PERIODS) * span;

    // 幽灵轨迹（全量参考）
    (function ghost() {
      let g = '', c = '', bands = '';
      for (let p = 0; p < PERIODS; p++) {
        const xa = xOf(p), xb = xOf(p + dA), xc = xOf(p + 1);
        bands += `<rect class="band" x="${xa}" y="40" width="${xb - xa}" height="238"/>`;
      }
      for (let i = 0; i <= 160; i++) {
        const u = (i / 160) * PERIODS;
        const x = xOf(u), ph = u % 1;
        const yG = ph < dA ? YG_HI : YG_LO;
        const yC = ph < dA ? YC_LO + (YC_HI - YC_LO) * (ph / dA)
                           : YC_HI - (YC_HI - YC_LO) * ((ph - dA) / (1 - dA));
        g += (i ? 'L' : 'M') + x.toFixed(1) + ',' + yG;
        c += (i ? 'L' : 'M') + x.toFixed(1) + ',' + yC.toFixed(1);
      }
      wGateAll.setAttribute('d', g);
      wCurAll.setAttribute('d', c);
      wBands.innerHTML = bands;
    })();

    let t = 0, raf = null, playing = true, speed = 1, last = 0;

    function phaseAt(tt) {
      const u = ((tt % 1) + 1) % 1;
      return u < dA ? 0 : 1;
    }

    function frame(ts) {
      if (!last) last = ts;
      const dt = Math.min(64, ts - last);
      last = ts;

      if (playing) { t += dt * 0.001 * speed * 0.55; if (t > PERIODS) t -= PERIODS; }

      const idx = phaseAt(t);
      const ph = cfg.phases[idx];

      ['S1', 'S2', 'S3', 'S4'].forEach(k => {
        const g = swMap[k];
        g.classList.remove('on', 'off', 'pwm');
        g.classList.add(ph.sw[k]);
      });
      flowA.setAttribute('d', ph.flow);
      flowA.classList.add('show');

      const tag = el.querySelector('[data-tag]');
      const txt = el.querySelector('[data-txt]');
      if (tag) { tag.className = 'phase-tag ' + ph.tag; tag.textContent = ph.tag === 'store' ? '储能' : '释能'; }
      if (txt) txt.textContent = ph.name;

      // 采样绘制进度轨迹
      const N = 140;
      let g = '', c = '';
      for (let i = 0; i <= N; i++) {
        const u = (i / N) * t;
        const x = xOf(u), ph2 = u % 1;
        const yG = ph2 < dA ? YG_HI : YG_LO;
        const yC = ph2 < dA ? YC_LO + (YC_HI - YC_LO) * (ph2 / dA)
                            : YC_HI - (YC_HI - YC_LO) * ((ph2 - dA) / (1 - dA));
        g += (i ? 'L' : 'M') + x.toFixed(1) + ',' + yG;
        c += (i ? 'L' : 'M') + x.toFixed(1) + ',' + yC.toFixed(1);
      }
      wGate.setAttribute('d', g);
      wCur.setAttribute('d', c);

      const cx = xOf(t);
      wCursor.setAttribute('x1', cx);
      wCursor.setAttribute('x2', cx);
      wPhase.textContent = idx === 0 ? '储能相' : '释能相';

      raf = requestAnimationFrame(frame);
    }

    function start() { if (!raf) { playing = true; last = 0; raf = requestAnimationFrame(frame); } }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    const btnPlay = el.querySelector('[data-play]');
    if (btnPlay) btnPlay.onclick = () => {
      playing = !playing;
      btnPlay.textContent = playing ? '暂停' : '继续';
      if (playing) start();
    };
    const btnStep = el.querySelector('[data-step]');
    if (btnStep) btnStep.onclick = () => {
      playing = false;
      if (btnPlay) btnPlay.textContent = '继续';
      t = Math.floor(t) + ((t - Math.floor(t)) > 0.5 ? 1 : 0.5);
      if (t > PERIODS) t = 0;
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    };
    const seg = el.querySelector('[data-speed]');
    if (seg) seg.querySelectorAll('button').forEach(b => {
      b.onclick = () => {
        seg.querySelectorAll('button').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        speed = +b.dataset.s;
      };
    });

    start();
    return { pause: stop, resume: start };
  }

  INIT['buck-anim'] = el => makeConverter(el, 'buck');
  INIT['boost-anim'] = el => makeConverter(el, 'boost');

  /* ============================================================
     二、四种工作模式
     ============================================================ */
  const MODES = {
    buck: { sw: { S1: 'pwm', S2: 'pwm', S3: 'on', S4: 'off' }, name: 'Buck 降压',
            cond: 'U₂ &lt; U₁', desc: '右半桥被 S₃ 短路成导线，S₁/S₂ 互补 PWM，电路退化为同步 Buck',
            flow: 'M96,360 V84 H300 V222 H660 V84 H950 V360 H96' },
    boost: { sw: { S1: 'on', S2: 'off', S3: 'pwm', S4: 'pwm' }, name: 'Boost 升压',
             cond: 'U₂ &gt; U₁', desc: '左半桥被 S₁ 短路成导线，S₃/S₄ 互补 PWM，电路退化为同步 Boost',
             flow: 'M96,360 V84 H300 V222 H660 V84 H950 V360 H96' },
    trans: { sw: { S1: 'pwm', S2: 'pwm', S3: 'pwm', S4: 'pwm' }, name: '过渡模式',
             cond: 'U₂ ≈ U₁', desc: '四管同时开关。占空比不必跑到 0%/100% 的极端值，代价是开关损耗翻倍',
             flow: 'M96,360 V84 H300 V222 H660 V84 H950 V360 H96' },
    pass: { sw: { S1: 'on', S2: 'off', S3: 'on', S4: 'off' }, name: '直通 bypass',
            cond: '与电压比无关', desc: 'S₁、S₃ 常通，两侧经 L 直接连通，超电等于不存在（旁路）',
            flow: 'M96,360 V84 H300 V222 H660 V84 H950 V360 H96' }
  };

  INIT['four-modes'] = el => {
    el.querySelector('.circuit-wrap').innerHTML = circuitSVG();
    const svg = el.querySelector('.circuit-wrap svg');
    const flow = svg.querySelector('#flowA');
    const map = {};
    ['S1', 'S2', 'S3', 'S4'].forEach(k => map[k] = svg.querySelector('#sw-' + k));

    function apply(key) {
      const m = MODES[key];
      ['S1', 'S2', 'S3', 'S4'].forEach(k => {
        map[k].classList.remove('on', 'off', 'pwm');
        map[k].classList.add(m.sw[k]);
      });
      flow.setAttribute('d', m.flow);
      flow.classList.add('show');
      el.querySelector('[data-mname]').textContent = m.name;
      el.querySelector('[data-mcond]').innerHTML = m.cond;
      el.querySelector('[data-mdesc]').textContent = m.desc;
      el.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b.dataset.m === key));
    }
    el.querySelectorAll('.seg button').forEach(b => { b.onclick = () => apply(b.dataset.m); });
    apply('buck');
  };

  /* ============================================================
     三、纹波计算器
     ============================================================ */
  INIT['ripple'] = el => {
    const V = { u1: 24, u2: 30, l: 22, f: 300 };
    function calc() {
      const d = Math.max(0, 1 - V.u1 / V.u2);
      const dIL = V.u2 * d * (1 - d) / (V.l * 1e-6 * V.f * 1e3);
      el.querySelector('[data-out]').innerHTML = dIL.toFixed(2) + '<small>A</small>';
      el.querySelector('[data-outd]').textContent = (d * 100).toFixed(1) + ' %';
      const lreq = V.u2 * d * (1 - d) / (6 * V.f * 1e3) * 1e6;
      el.querySelector('[data-lreq]').textContent = lreq.toFixed(1) + ' µH';
    }
    ['u1', 'u2', 'l', 'f'].forEach(k => {
      const r = el.querySelector('[data-rng="' + k + '"]');
      const v = el.querySelector('[data-val="' + k + '"]');
      if (!r) return;
      const upd = () => {
        V[k] = +r.value;
        v.textContent = k === 'l' ? V[k] + ' µH' : (k === 'f' ? V[k] + ' kHz' : V[k] + ' V');
        calc();
      };
      r.oninput = upd;
      upd();
    });
  };

  /* ============================================================
     四、三方案对比
     ============================================================ */
  const ALLOC = {
    a: { t: '方案一：功率均分', body: `<p>最直接的想法：每个电机分 <span class="var">P_lim / 4</span>，各自独立反解。</p>
      <ul><li><b>与转速耦合，破坏方向性。</b>同样的预算在不同转速下对应完全不同的控制量；
        四轮转速略有差异就得到不同力矩上限，产生额外偏航力矩，进一步加剧转速差——<em>正反馈</em>。</li>
        <li><b>预算无法转移。</b>用不到那份预算时，剩余不能给别的电机。</li></ul>
      <div class="warnbox"><b>结论：</b>直线跑偏、转向与驾驶意图打架。弃用。</div>` },
    b: { t: '方案二：取绝对值后统一缩放', body: `<p>算出四路不受限指令，取绝对值之和，再统一乘一个系数缩到预算内。</p>
      <ul><li><b>优点是简单、方向性保持得好。</b>四路同乘一个系数，力矩比例不变。</li>
        <li><b>问题是缩放系数与功率不成正比。</b>功率里有 <span class="var">k₂ω²</span> 这样的转速平方项，
          指令缩 <span class="var">k</span> 倍，功率不会缩 <span class="var">k</span> 倍。</li></ul>
      <div class="note"><b>结论：</b>比方案一好，但预算利用率仍不高。</div>` },
    c: { t: '方案三：功率再分配（本文方案）', body: `<p>先用模型算出四路功率 <span class="var">P̂ᵢ</span>，
      求和得 <span class="var">k = P_lim / Σ P̂ᵢ</span>，再按功<em>率</em>比例分配。</p>
      <div class="formula p1" style="font-size:16px">k = P_lim / Σ P̂ᵢ → Pᵢ* = k · P̂ᵢ → I_cmd,i′ = f⁻¹(Pᵢ*, ωᵢ)</div>
      <ul><li>缩放的是<b>功率</b>，所以“缩 k 倍就真的用 k 倍的功率”。</li>
        <li>四路指令仍保持相对比例，方向性不乱。</li>
        <li>用不到的预算可以转移给需要的轮子。</li></ul>
      <div class="okbox"><b>结论：</b>预算利用率最高，方向性也保持。本文采用。</div>` }
  };

  INIT['alloc-compare'] = el => {
    el.querySelectorAll('.seg button').forEach(b => {
      b.onclick = () => {
        el.querySelectorAll('.seg button').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        const a = ALLOC[b.dataset.a];
        el.querySelector('[data-atitle]').textContent = a.t;
        el.querySelector('[data-abody]').innerHTML = a.body;
      };
    });
  };

  /* ============================================================
     五、反解边界情形
     ============================================================ */
  const CASES = {
    normal: { t: '正常情形', c: 'Δ ≥ 0 且 P* ≥ P₀(ω)',
      body: `<p>判别式非负、目标功率高于空载损耗，正根有意义。</p>
        <div class="formula p1">I_cmd′ = ( −C_T ω + √Δ ) / ( 2 k₁ )</div>
        <p class="muted">算例：P* = 40 W、ω = 6000 rpm → I_cmd′ ≈ 2497，回代功率 39.99 W，误差 0.03%。</p>` },
    low: { t: '情形 I：目标功率低于空载损耗', c: 'P* &lt; P₀(ω) → 正根变负',
      body: `<p>连“不出力”的损耗都比预算高，正根会算出<em>负的</em>力矩——相当于要求电机反向出力。</p>
        <div class="formula p1">P* ← max( P*, P₀(ω) )</div>
        <div class="warnbox"><b>最容易被忽略的一步：</b>少了这个钳位，解出的指令会带负号，力矩方向被翻转。</div>` },
    neg: { t: '情形 II：判别式小于零', c: 'Δ &lt; 0 → 无实根',
      body: `<p>说明这个功率预算在该转速下<em>物理上不可达</em>。</p>
        <div class="formula p1">I_cmd′ = 0 <span style="color:#7b8a9e">（兜底）</span></div>
        <p class="muted">由 P_min(ω) ≈ 4.081 − 7.96×10⁻⁶ω² 可知：只要 ω &gt; 716 rpm，P_min &lt; 0，
          判别式恒为非负。只有低速且预算极低时才可能触发。</p>` }
  };

  INIT['inverse-cases'] = el => {
    el.querySelectorAll('.seg button').forEach(b => {
      b.onclick = () => {
        el.querySelectorAll('.seg button').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        const c = CASES[b.dataset.c];
        el.querySelector('[data-ctitle]').textContent = c.t;
        el.querySelector('[data-ccond]').innerHTML = c.c;
        el.querySelector('[data-cbody]').innerHTML = c.body;
      };
    });
    const first = el.querySelector('.seg button');
    if (first) first.onclick();
  };

  /* ============================================================
     六、状态机优先级
     ============================================================ */
  const LOOPS = [
    ['CAN_Offline_Loop()', 'CAN 离线', '1 s 内收不到报文'],
    ['Soft_Start_Loop()', '软启动', '限制上电浪涌'],
    ['Over_Current_Protection_Loop()', '过流', '母线 30 A / 200 ms'],
    ['Bat_Over_Voltage_Protection_Loop()', '母线过压', '35 V / 200 ms'],
    ['Bat_Undervoltage_Protection_Loop()', '母线欠压', '20 V / 1 s'],
    ['CAP_Undervoltage_Protection_Loop()', '电容组欠压', '8 V / 500 ms'],
    ['Over_Temperature_Protect_Loop()', '过温', '100 °C / 5 s'],
    ['Charge_Loop()', '充电', '母线功率低于目标'],
    ['Discharge_Loop()', '放电', '补足底盘差额'],
    ['Wait_Loop()', '待机', '电容接近满且无需补偿']
  ];

  INIT['state-machine'] = el => {
    const list = el.querySelector('#loopList');
    if (!list) return;
    list.innerHTML = LOOPS.map((l, i) => `
      <button class="loop-item ${i < 7 ? 'guard' : 'work'}" data-i="${i}">
        <span class="loop-no">${i + 1}</span>
        <span class="loop-name">${l[1]}</span>
        <span class="loop-fn">${l[0]}</span>
      </button>`).join('');
    const det = el.querySelector('[data-loopdetail]');
    list.querySelectorAll('.loop-item').forEach(b => {
      b.onclick = () => {
        list.querySelectorAll('.loop-item').forEach(x => x.classList.remove('cur'));
        b.classList.add('cur');
        const i = +b.dataset.i, l = LOOPS[i];
        det.innerHTML = `<div class="card-title"><span class="dot"></span>第 ${i + 1} 优先级 · ${l[1]}</div>
          <div style="font-family:var(--mono);font-size:15px;color:var(--p2);margin-bottom:8px">${l[0]}</div>
          <p class="muted">${l[2]}</p>
          ${i < 7
            ? '<div class="warnbox" style="margin-top:12px">这是<b>保护</b>环路：一旦命中，<b>不执行</b> CAN 下发的充放电命令，并关半桥、关 PMOS。</div>'
            : '<div class="okbox" style="margin-top:12px">这是<b>工作</b>环路：只有在前面七条保护全部未命中时才会执行。</div>'}`;
      };
    });
    // 默认选中第 1 条，避免右侧空着
    const firstItem = list.querySelector('.loop-item');
    if (firstItem) firstItem.click();
  };

  /* ============================================================
     七、CAN 字段说明
     ============================================================ */
  const CANINFO = {
    '0x001-0': ['DATA[0] 【使能】', '1 = 使能，0 = 失能。失能后静态功耗 &lt; 1 W，不用为了省电频繁切换。'],
    '0x001-2': ['DATA[2] 【功率上限】', '单位 W 的整型。这是<b>参考值</b>不是控制量，必须与裁判系统的底盘功率上限一致。'],
    '0x100-0': ['DATA[0] 【可用】', '1 = 可用，0 = 不可用。只读；只有模组处于充电、充满、放电或待机时才为可用。'],
    '0x100-2': ['DATA[2] 【电容组能量】', '0~100%。建议只做界面显示，不要自己另写“低于多少就关超电”的判断。'],
    '0x100-3': ['DATA[3] 【电机功率】', '单位 W，0~500。<b>发送时右移了一位（除以 2）</b>，接收端必须左移还原并用 uint16 接。'],
    '0x100-4': ['DATA[4] 电池电压', '放大 10 倍发送：读到 222 即 22.2 V。'],
    '0x100-5': ['DATA[5] 【Chassis 功率】', '单位 W，0~255。2025 赛季裁判系统已不再直接反馈，需自检。']
  };

  INIT['can-proto'] = el => {
    const info = el.querySelector('[data-caninfo]');
    el.querySelectorAll('[data-can]').forEach(n => {
      n.addEventListener('mouseenter', () => {
        const it = CANINFO[n.dataset.can];
        if (!it || !info) return;
        info.innerHTML = `<div class="card-title"><span class="dot"></span>${it[0]}</div>
          <p style="font-size:16px">${it[1]}</p>`;
        info.classList.add('lit');
      });
    });
  };

  /* -------------------------------------------------- 深链接：#12 或 #buck-anim */
  function fromHash() {
    const raw = (location.hash || '').replace(/^#/, '');
    if (!raw) return 0;
    if (/^\d+$/.test(raw)) return Math.max(0, Math.min(SLIDES.length - 1, parseInt(raw, 10) - 1));
    const k = SLIDES.findIndex(s => s.id === raw);
    return k >= 0 ? k : 0;
  }

  /* -------------------------------------------------- 启动 */
  render();
  fit();
  goTo(fromHash(), true);
  window.addEventListener('hashchange', () => goTo(fromHash(), true));
  setTimeout(hideHint, 7000);
})();
