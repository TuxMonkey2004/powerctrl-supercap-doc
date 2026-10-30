/* ============================================================
   slides-p2.js — Part II 超级电容（重头戏：元器件选型）
   ============================================================ */
window.SLIDES = (window.SLIDES || []).concat([

/* ================================================================
   Part II
   ================================================================ */
{
  id: 'p2-divider', part: 'Part II', partKey: 'p2', title: '超级电容', cls: 'divider',
  html: `<div class="big-num">II</div>
    <h2>超级电容</h2>
    <p>四开关 Buck-Boost 的四个管子怎么开、怎么关；<br>
      板子上每一颗元器件为什么选它。共 38 页。</p>`
},

/* ---------- 为什么需要 ---------- */
{
  id: 'sc-why', part: 'Part II', partKey: 'p2', title: '为什么需要超级电容',
  sub: '11.1 · 把"超出去的功率"临时存起来',
  html: `<div class="row grow">
    <div class="col" style="flex:1.05">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>规则的约束是<em>平均</em>，不是<em>瞬时</em></div>
        <p style="font-size:17px">功率上限约束的是<b>电池侧</b>取用功率。而底盘在起步、猛打方向时需要远超平均值的功率。</p>
        <div class="formula p2" style="margin-top:10px">P_chassis = P_motor − P_discharge</div>
        <p class="explain" style="margin-top:8px">只要爆发时让 <span class="var">P_discharge</span> 顶上一部分，
          电池侧就永远不会超限——<b>这就是超电的全部价值</b>。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>它解决的是"两个时间尺度"的矛盾</div>
        <p style="font-size:16px">电机要的是<b>毫秒级</b>的功率突变；裁判系统算的是<b>百毫秒级</b>的平均。
          超电正好卡在这两个尺度之间做缓冲。</p>
      </div>
    </div>
    <div class="card flat" style="flex:1;padding:12px">
      <svg viewBox="0 0 520 300" style="width:100%">
        <path class="axis" d="M46,250 H500"/><path class="axis" d="M46,30 V250"/>
        <text class="lbl-sm" x="40" y="36" text-anchor="end">P</text>
        <path d="M60,240 C110,236 130,80 180,76 C230,72 250,230 300,234 C350,238 370,90 420,86 C470,82 480,236 500,240"
              fill="none" stroke="#ea7317" stroke-width="3.2"/>
        <line x1="46" y1="150" x2="500" y2="150" stroke="#dc2626" stroke-width="2.4" stroke-dasharray="8 5"/>
        <text class="lbl-sm" x="496" y="142" text-anchor="end" fill="#dc2626">P_max</text>
        <path d="M60,200 H160 C200,160 220,150 260,150 H330 C350,150 370,170 400,150 H500"
              fill="none" stroke="#0d9488" stroke-width="3.2"/>
        <path d="M140,110 C170,84 200,86 215,150 L215,150 C200,90 170,100 140,150 Z" fill="rgba(13,148,136,.18)"/>
        <text x="128" y="72" class="lbl-sm" fill="#ea7317">电机实际需求</text>
        <text x="330" y="142" class="lbl-sm" fill="#dc2626">电池侧上限</text>
        <text x="330" y="182" class="lbl-sm" fill="#0d9488">电池侧实际（被削平）</text>
        <text x="150" y="212" class="lbl-sm" fill="#0d9488" font-size="12">超电补这里</text>
      </svg>
      <div class="okbox" style="margin-top:10px">电容负责<b>削峰填谷</b>：爆发时放电顶住，平稳时充电补回。
        规则允许的能量上限约 <b>2000 J</b>。</div>
    </div>
  </div>`
},

/* ---------- 系统构成 ---------- */
{
  id: 'sc-layers', part: 'Part II', partKey: 'p2', title: '系统构成：四层分工',
  sub: '11.2 · 从能量到意图',
  html: `<div class="col grow" style="justify-content:center;gap:14px">
    <div class="row">
      <div class="card p2 grow"><div class="card-title"><span class="dot"></span>① 电容组</div>
        <p class="tiny" style="font-size:15px">若干单体串并联。串联提升耐压，并联降低 ESR。
          单体之间必须<b>均衡</b>，否则个别单体过压会迅速失效。</p></div>
      <div class="card p2 grow"><div class="card-title"><span class="dot"></span>② 双向 DC–DC</div>
        <p class="tiny" style="font-size:15px">在电池母线与电容组之间双向传递能量。
          常见拓扑：同步 Buck/Boost、四开关 Buck-Boost、双并联式。
          后者在体积、效率与控制难度上各有取舍。</p></div>
    </div>
    <div class="row">
      <div class="card p2 grow"><div class="card-title"><span class="dot"></span>③ 超电控制器</div>
        <p class="tiny" style="font-size:15px">采样母线电压电流与电容电压电流，运行<b>内层控制环</b>，
          通过 CAN 与主控通信。</p></div>
      <div class="card p2 grow"><div class="card-title"><span class="dot"></span>④ 主控侧接口</div>
        <p class="tiny" style="font-size:15px">把"本周期底盘计划从电池取多少功率"这一<b>意图</b>告知超电；
          超电自己决定怎么充、怎么放。</p></div>
    </div>
    <div class="note"><b>职责划分是最关键的设计决策：</b>
      主控只管一件事——<b>下发动机率目标</b>。充放电策略、电量保护、模式切换全在超电内部完成。
      这样主控的代码保持在 1 kHz 的简单循环里，不必去管电容状态。</div>
  </div>`
},

/* ---------- 能量与电压 ---------- */
{
  id: 'sc-energy', part: 'Part II', partKey: 'p2', title: '能量与电压：为什么电压窗口这么重要',
  sub: '11.3 · E = ½CU²',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>电容储能</div>
        <div class="formula p2" style="font-size:26px">E = ½ C U²</div>
        <p class="explain" style="margin-top:10px">式中 <span class="var">E</span> 为储能（J）；
          <span class="var">C</span> 为电容（F）；<span class="var">U</span> 为两端电压（V）。</p>
        <div class="note" style="margin-top:12px"><b>注意：</b>这里的 C 与 Part I 里"力矩电流系数"的 C
          <b>只是字母相同，含义无关</b>。</div>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>可用能量的比例</div>
        <div class="formula p2" style="font-size:18px">E_usable / E_max = 1 − (U_min/U_max)²</div>
        <p class="explain">放电到<b>一半电压</b>时，放出的能量是 <b>3/4</b>——
          <b>一半的电压窗口里藏着四分之三的能量</b>。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat" style="padding:12px">
        <svg viewBox="0 0 480 260" style="width:100%">
          <path class="axis" d="M56,220 H450"/><path class="axis" d="M56,30 V220"/>
          <text class="lbl-sm" x="50" y="36" text-anchor="end">E</text>
          <text class="lbl-sm" x="440" y="244" text-anchor="end">U</text>
          <path d="M56,220 Q240,220 420,50" fill="none" stroke="#0d9488" stroke-width="3.6"/>
          <line x1="238" y1="220" x2="238" y2="152" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 5"/>
          <line x1="56" y1="152" x2="238" y2="152" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 5"/>
          <circle cx="238" cy="152" r="6" fill="#dc2626"/>
          <text x="248" y="148" class="lbl-sm" fill="#dc2626">U_max/2 → 还剩 3/4 能量</text>
          <text x="96" y="78" class="lbl-sm" fill="#0d9488">E ∝ U²</text>
        </svg>
      </div>
      <div class="warnbox">如果把放电下限设得太高（怕欠压），可用能量会大幅缩水。
        <b>电压窗口是电容组选型的核心指标</b>，后面选型那一页会具体算。</div>
    </div>
  </div>`
},

/* ---------- 三种基本变换器 ---------- */
{
  id: 'converters', part: 'Part II', partKey: 'p2', title: '三种基本变换器',
  sub: '12.1 · 为什么最后选"四开关"',
  html: `<div class="col grow" style="justify-content:center;gap:14px">
    <div class="row">
      <div class="card p2 grow">
        <div class="card-title"><span class="dot"></span>Buck（降压）</div>
        <div class="formula p2" style="font-size:18px">U_out = D · U_in</div>
        <p class="explain" style="font-size:15px">输出永远 ≤ 输入。开关管导通时储能，关断时续流管释放。</p>
      </div>
      <div class="card p2 grow">
        <div class="card-title"><span class="dot"></span>Boost（升压）</div>
        <div class="formula p2" style="font-size:18px">U_out = U_in / (1 − D)</div>
        <p class="explain" style="font-size:15px">输出永远 ≥ 输入。开关管导通时把电感短路储能，关断时电感叠加上电源输出。</p>
      </div>
      <div class="card p2 grow">
        <div class="card-title"><span class="dot"></span>Buck-Boost（升降压）</div>
        <div class="formula p2" style="font-size:18px">U_out = −D·U_in / (1−D)</div>
        <p class="explain" style="font-size:15px">输出可高可低，但<b>极性反相</b>——这是它不方便的地方。</p>
      </div>
    </div>
    <div class="card p2">
      <div class="card-title"><span class="dot"></span>超电的难处：两侧电压关系是<em>会变的</em></div>
      <p style="font-size:16px">电容从 0 V 充到 21 V（或 30 V），有时要<b>降压充</b>、有时要<b>升压放</b>，
        有时两侧几乎相等。单一 Buck 或单一 Boost 都覆盖不了；反相 Buck-Boost 的负输出又不便使用。</p>
      <div class="okbox" style="margin-top:12px"><b>四开关 Buck-Boost（FSBB）</b>用两个半桥 + 一个电感，
        不反相，能在升降压之间<b>平滑切换</b>——这就是超电控制板的选择。
        代价是四颗 MOS、两路驱动，控制也复杂得多。</div>
    </div>
  </div>`
},

/* ---------- Buck 动画 ---------- */
{
  id: 'buck-anim', part: 'Part II', partKey: 'p2', title: 'Buck 工作原理：看电流怎么走',
  sub: '12.1.1 · 四个管子里，右边两个是"固定"的',
  html: `<div class="row grow" style="align-items:stretch">
    <div class="circuit-wrap" style="flex:1.55"></div>
    <div class="col" style="flex:1">
      <div class="wave-wrap card flat" style="padding:8px;flex:1"></div>
      <div class="controlbar">
        <div class="phase">
          <span class="phase-tag store" data-tag>储能</span>
          <span data-txt style="font-size:15px">—</span>
        </div>
      </div>
      <div class="controlbar" style="gap:10px">
        <button class="btn" data-play>暂停</button>
        <button class="btn ghost" data-step>单步</button>
        <div class="seg" data-speed>
          <button data-s="0.6">慢</button>
          <button data-s="1" class="on">中</button>
          <button data-s="1.8">快</button>
        </div>
      </div>
    </div>
  </div>
  <div class="note" style="flex:0 0 auto"><b>S₃ 常通、S₄ 常断</b> → 右半桥被短路成一根导线，
    电路退化为同步 Buck。所以真正在"开关"的只有 <b>S₁ 与 S₂</b>（互补）——
    这就是为什么说"四种模式的区别只有一对管子"。</div>`
},

/* ---------- Boost 动画 ---------- */
{
  id: 'boost-anim', part: 'Part II', partKey: 'p2', title: 'Boost 工作原理：反过来看',
  sub: '12.1.2 · 左边两个固定，右边两个开关',
  html: `<div class="row grow" style="align-items:stretch">
    <div class="circuit-wrap" style="flex:1.55"></div>
    <div class="col" style="flex:1">
      <div class="wave-wrap card flat" style="padding:8px;flex:1"></div>
      <div class="controlbar">
        <div class="phase">
          <span class="phase-tag store" data-tag>储能</span>
          <span data-txt style="font-size:15px">—</span>
        </div>
      </div>
      <div class="controlbar" style="gap:10px">
        <button class="btn" data-play>暂停</button>
        <button class="btn ghost" data-step>单步</button>
        <div class="seg" data-speed>
          <button data-s="0.6">慢</button>
          <button data-s="1" class="on">中</button>
          <button data-s="1.8">快</button>
        </div>
      </div>
    </div>
  </div>
  <div class="note" style="flex:0 0 auto"><b>S₁ 常通、S₂ 常断</b> → 左半桥被短路成导线，退化为同步 Boost。
    注意储能相：<b>S₄ 导通时其实是把电感短路</b>，电感在这段时间攒能量；
    之后 S₃ 导通才把"电源 + 电感"叠起来送给输出。</div>`
},

/* ---------- 四模式 ---------- */
{
  id: 'four-modes', part: 'Part II', partKey: 'p2', title: '四种工作模式',
  sub: '12.2 · 点按钮切换看电流路径',
  html: `<div class="row grow" style="align-items:stretch">
    <div class="circuit-wrap" style="flex:1.6"></div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="seg" style="width:100%;display:grid;grid-template-columns:1fr 1fr;gap:4px">
          <button data-m="buck" class="on">Buck 降压</button>
          <button data-m="boost">Boost 升压</button>
          <button data-m="trans">过渡模式</button>
          <button data-m="pass">直通 bypass</button>
        </div>
      </div>
      <div class="card p2 grow">
        <div class="card-title"><span class="dot"></span><span data-mname>Buck 降压</span></div>
        <div class="formula p2" style="font-size:16px;margin-bottom:10px">
          判据：<span data-mcond>U₂ &lt; U₁</span>
        </div>
        <p data-mdesc style="font-size:17px">右半桥被 S₃ 短路成导线，S₁/S₂ 互补 PWM</p>
      </div>
      <div class="card flat tight">
        <div class="legend">
          <span><i style="background:#dcfce7;border:1.6px solid #16a34a"></i>常通</span>
          <span><i style="background:#f1f5f9;border:1.6px solid #94a3b8"></i>常断</span>
          <span><i style="background:#dbeafe;border:1.6px solid #3b82f6"></i>PWM 开关</span>
          <span><i style="background:#ea7317"></i>电流路径</span>
        </div>
      </div>
    </div>
  </div>
  <div class="note" style="flex:0 0 auto">
    <b>过渡模式</b>只在两侧电压接近时短暂经过——此时单靠 Buck 或 Boost，占空比都要跑到 0% 或 100%，
    开关管无法工作。<b>直通模式</b>用于电容耗尽或模块故障时旁路，此时超电等于不存在。
  </div>`
},

/* ---------- 纹波 ---------- */
{
  id: 'ripple', part: 'Part II', partKey: 'p2', title: '电感、开关频率与纹波',
  sub: '12.3 · 拖动滑块看纹波怎么变',
  html: `<div class="row grow">
    <div class="col" style="flex:1.05">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>纹波公式</div>
        <div class="formula p2" style="white-space:normal;font-size:18px">
          ΔI_L = U₂ · D · (1−D) / ( L · f_sw )
        </div>
        <p class="explain">式中 <span class="var">ΔI_L</span> 为峰峰值（A）；
          <span class="var">U₂</span> 为两侧电压较高者（V）；<span class="var">D</span> 为占空比；
          <span class="var">L</span> 为电感量（H）；<span class="var">f_sw</span> 为开关频率（Hz）。</p>
        <div class="note" style="margin-top:12px"><b>记住：</b>D(1−D) 在 D=0.5 时最大（1/4）。
          所以<b>占空比一半时纹波最大</b>，设计要按这个最坏情况留裕量。</div>
      </div>
      <div class="card p2 grow">
        <div class="card-title"><span class="dot"></span>解出所需最小电感</div>
        <div class="formula p2" style="font-size:18px">L_min = U₂ / ( 4 · ΔI_L · f_sw )</div>
        <p class="explain">（取 D = 0.5 的最坏情况）</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2 grow">
        <div class="card-title"><span class="dot"></span>试一试</div>
        <div class="slider-row"><label>母线电压 U₁</label><input type="range" data-rng="u1" min="12" max="30" value="24"><span class="val" data-val="u1">24 V</span></div>
        <div class="slider-row" style="margin-top:12px"><label>电容电压 U₂</label><input type="range" data-rng="u2" min="12" max="36" value="30"><span class="val" data-val="u2">30 V</span></div>
        <div class="slider-row" style="margin-top:12px"><label>电感 L</label><input type="range" data-rng="l" min="4" max="60" value="22"><span class="val" data-val="l">22 µH</span></div>
        <div class="slider-row" style="margin-top:12px"><label>开关频率</label><input type="range" data-rng="f" min="100" max="500" step="10" value="300"><span class="val" data-val="f">300 kHz</span></div>
      </div>
      <div class="card p2 grow" style="display:flex;align-items:center;gap:26px">
        <div>
          <div class="muted" style="font-size:14px;margin-bottom:4px">电感电流纹波 ΔI_L</div>
          <div class="result" data-out>0.00<small>A</small></div>
        </div>
        <div style="margin-left:auto;text-align:right">
          <div class="muted" style="font-size:13px">占空比 D</div>
          <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--ink)" data-outd>0 %</div>
          <div class="muted" style="font-size:13px;margin-top:6px">限纹波 6 A 所需 L</div>
          <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--ink)" data-lreq>0</div>
        </div>
      </div>
    </div>
  </div>`
},

/* ---------- 死区 ---------- */
{
  id: 'deadtime', part: 'Part II', partKey: 'p2', title: '死区：半桥设计里唯一不能省的东西',
  sub: '12.4 · 上下管同时导通 = 短路',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么必须有死区</div>
        <p style="font-size:16px">半桥的上下两只管子<b>绝不能同时导通</b>：那等于把母线直接短路，
          瞬间电流只受几毫欧回路电阻限制——<b>结果一定是炸管</b>。</p>
        <p style="font-size:16px;margin-top:10px">所以必须在两只管子都关断时插入一段<b>死区时间</b>
          <span class="var">t_d</span>，让它们有一个"都关"的窗口。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>死区的两难</div>
        <ul style="font-size:15px">
          <li><b>太长</b> → 电流只能经下管体二极管续流，压降大、损耗高</li>
          <li><b>太短</b> → 开关管关断有延迟，可能直通</li>
          <li>典型取值：<b>几十纳秒到几百纳秒</b></li>
        </ul>
        <div class="note" style="margin-top:10px;font-size:14px">
          死区一般由<b>MCU 的互补 PWM 模块</b>插入（高级定时器的 DTG 寄存器），
          而不是靠驱动器。所以选栅极驱动时要确认它<b>不做</b>死区，避免两处重复。</div>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat" style="padding:12px">
        <svg viewBox="0 0 520 270" style="width:100%">
          <rect x="212" y="20" width="30" height="210" fill="rgba(220,38,38,.12)"/>
          <rect x="392" y="20" width="30" height="210" fill="rgba(220,38,38,.12)"/>
          <text class="lbl-sm" x="10" y="70">V_gs,H</text>
          <path d="M46,84 H212 V46 H242 V84 H362 V46 H392 V84 H500" fill="none" stroke="#3b82f6" stroke-width="3"/>
          <text class="lbl-sm" x="10" y="180">V_gs,L</text>
          <path d="M46,194 H242 V156 H362 V194 H392 V156 H500" fill="none" stroke="#16a34a" stroke-width="3"/>
          <text x="227" y="40" font-size="12" fill="#dc2626" text-anchor="middle" font-weight="700">死区</text>
          <text x="407" y="40" font-size="12" fill="#dc2626" text-anchor="middle" font-weight="700">死区</text>
          <text x="260" y="252" font-size="12" fill="#7b8a9e" text-anchor="middle">
            死区期间两管都关断，电流经下管体二极管续流</text>
        </svg>
      </div>
      <div class="warnbox"><b>体二极管还有另一个坑——"僵尸车"：</b>
        机器人断电后，电容组会经 MOSFET 的体二极管倒灌回母线，让车"诈尸"。
        所以必须加一只 <b>PMOS</b> 做彻底切断——这一颗器件后面会单独讲。</div>
    </div>
  </div>`
},

/* ================================================================
   ★ 元器件选型（重头戏从这里开始）
   ================================================================ */
{
  id: 'hw-overview', part: 'Part II', partKey: 'p2', title: '硬件总览：一块板子上都有什么',
  sub: '12.5 · 先看全貌，再逐颗拆',
  html: `<div class="row grow">
    <div class="card p2 grow" style="display:flex;align-items:center">
      <svg viewBox="0 0 900 420" style="width:100%">
        <rect x="60" y="30" width="780" height="360" rx="16" fill="#f7fbfa" stroke="#0d9488" stroke-width="2" stroke-dasharray="9 6"/>
        <text x="76" y="22" class="lbl-sm" fill="#0d9488">超电控制板</text>

        <g fill="#fff" stroke="#c7d2e0" stroke-width="2">
          <rect x="90" y="60" width="176" height="66" rx="10" stroke="#2563eb"/>
          <rect x="300" y="60" width="150" height="66" rx="10"/>
          <rect x="484" y="60" width="176" height="66" rx="10" stroke="#0d9488"/>
          <rect x="694" y="60" width="120" height="66" rx="10"/>
          <rect x="90" y="176" width="176" height="66" rx="10" stroke="#b45309"/>
          <rect x="300" y="176" width="150" height="66" rx="10"/>
          <rect x="484" y="176" width="176" height="66" rx="10" stroke="#dc2626"/>
          <rect x="694" y="176" width="120" height="66" rx="10"/>
          <rect x="90" y="300" width="176" height="62" rx="10"/>
          <rect x="300" y="300" width="150" height="62" rx="10"/>
          <rect x="484" y="300" width="330" height="62" rx="10" stroke="#94a3b8"/>
        </g>
        <g class="lbl-sm" text-anchor="middle" fill="#16202b">
          <text x="178" y="86" font-weight="700">主控</text><text x="178" y="106" font-size="12">STM32G431CBT6</text>
          <text x="375" y="86" font-weight="700">栅极驱动</text><text x="375" y="106" font-size="12">LM5109 ×2</text>
          <text x="572" y="86" font-weight="700">功率级</text><text x="572" y="106" font-size="12">IRFH7440 ×4 + L</text>
          <text x="754" y="86" font-weight="700">输出切断</text><text x="754" y="106" font-size="12">PMOS</text>
          <text x="178" y="202" font-weight="700">电流采样</text><text x="178" y="222" font-size="12">INA139 + TLV9061</text>
          <text x="375" y="202" font-weight="700">辅助电源</text><text x="375" y="222" font-size="12">MP2456 + RT9193</text>
          <text x="572" y="202" font-weight="700">保护</text><text x="572" y="222" font-size="12">TVS + 保险丝 + ESD</text>
          <text x="754" y="202" font-weight="700">CAN 收发</text><text x="754" y="222" font-size="12">TCAN1044</text>
          <text x="178" y="326" font-weight="700">调试口</text><text x="178" y="346" font-size="12">UART + SWD</text>
          <text x="375" y="326" font-weight="700">电容组接口</text><text x="375" y="346" font-size="12">+ 均衡</text>
          <text x="649" y="326" font-weight="700">功率端子：电池侧 / 电容侧 / 底盘分电</text>
          <text x="649" y="346" font-size="12">全部 XT30，关键节点留测试点</text>
        </g>
        <g stroke="#0d9488" stroke-width="2" fill="none" stroke-dasharray="6 4">
          <path d="M178,126 V172"/><path d="M375,126 V172"/><path d="M572,126 V172"/>
          <path d="M754,126 V172"/><path d="M178,242 V296"/><path d="M375,242 V296"/>
        </g>
      </svg>
    </div>
    <div class="col" style="flex:0 0 330px">
      <div class="card p2 tight"><p class="tiny" style="font-size:15px">
        <b>接下来每一页讲一颗器件</b>，都回答三个问题：</p>
        <ol class="steps" style="font-size:14px;margin-top:6px">
          <li>它在这块板子上<b>干什么</b></li>
          <li>为什么选<b>这一颗</b>（带数字）</li>
          <li>换成别的会<b>怎样</b></li>
        </ol>
      </div>
      <div class="note" style="font-size:14px"><b>看板子的顺序建议：</b>
        先看功率回路（MOS → 电感 → 电容），再看它的"手脚"（驱动、采样），
        最后看"后勤"（辅助电源、保护、通信）。</div>
    </div>
  </div>`
},

/* ---------- 主控 ---------- */
{
  id: 'sel-mcu', part: 'Part II', partKey: 'p2', title: '主控为什么是 STM32G431',
  sub: '12.5.1 · 数字电源专用的一颗芯片',
  html: `<div class="row grow">
    <div class="col" style="flex:1.15">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>先列需求，再挑芯片</div>
        <table class="tb" style="font-size:14px">
          <tr><th style="width:42%">要干什么</th><th>对 MCU 的要求</th></tr>
          <tr><td>1 kHz 环路、5 µs 内算完</td><td>带 <b>FPU</b>，主频 ≥ 100 MHz</td></tr>
          <tr><td>两路同步采样（电容侧 + 电池侧）</td><td><b>双 ADC</b>，能同步触发</td></tr>
          <tr><td>全差分远端补偿</td><td><b>片内运放</b>（省掉外部全差分放大器）</td></tr>
          <tr><td>互补 PWM + 可编程死区</td><td><b>高级定时器</b>（带 DTG / BREAK）</td></tr>
          <tr><td>与主控通信</td><td>至少一路 <b>CAN</b></td></tr>
          <tr><td>过流/过压硬件保护</td><td><b>片内比较器</b></td></tr>
          <tr><td>成本与采购</td><td>常见型号、单价可接受</td></tr>
        </table>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么正好是 G4 系列</div>
        <p style="font-size:15px">STM32G4 是 ST 专门为<b>数字电源与电机控制</b>做的系列，把上面这些外设
          <b>全都塞进了一颗芯片</b>：</p>
        <ul style="font-size:15px;margin-top:8px">
          <li>内核 <b>Cortex-M4F</b>（带 FPU）+ <b>ART 加速器</b>，Flash 零等待</li>
          <li><b>双 12 位 ADC</b>（5 Msps）+ 片内 <b>OPAMP ×3</b> + <b>比较器 ×4</b></li>
          <li><b>高级定时器</b>支持互补输出、可编程死区、BREAK 刹车</li>
          <li><b>FDCAN</b>（可跑 CAN-FD）、CORDIC、FMAC</li>
        </ul>
      </div>
      <div class="okbox" style="font-size:15px"><b>关键收益：省器件。</b>
        片内运放直接做远端补偿、片内比较器直接做过流封波，
        省掉外部全差分放大器与比较器电路——<b>省的不只是 BOM，还有板面积与调试时间</b>。</div>
      <div class="warnbox" style="font-size:14px"><b>代价：</b>G431 是系列里较小的型号，
        Flash 128 KB / RAM 32 KB，引脚 48。够用但不宽裕——
        所以代码里没有浮点大数组、没有动态分配，全是定长与内联。</div>
    </div>
  </div>`
},

/* ---------- G4 外设 ---------- */
{
  id: 'sel-mcu-periph', part: 'Part II', partKey: 'p2', title: 'G4 的外设是怎么被用起来的',
  sub: '12.5.2 · 每一块外设对应一条功能',
  html: `<div class="row grow">
    <div class="card p2 grow">
      <table class="tb" style="font-size:15px">
        <tr><th style="width:24%">外设</th><th style="width:26%">用在哪</th><th>为什么非它不可</th></tr>
        <tr><td><b>ADC1 / ADC2</b></td>
            <td>电容侧与电池侧的 U、I 采样，<b>100 kHz 触发</b></td>
            <td>要两路同步。单 ADC 轮流采样会有相位差，功率算不准</td></tr>
        <tr><td><b>OPAMP1–3</b></td>
            <td>远端补偿的全差分放大、下管续流的信号调理</td>
            <td>外部全差分放大器贵且占面积；片内可配置增益，省两颗芯片</td></tr>
        <tr><td><b>COMP1–4</b></td>
            <td>过流/过压的<b>硬件封波</b></td>
            <td>软件轮询有延迟，比较器能在一个开关周期内直接掐断 PWM</td></tr>
        <tr><td><b>TIM1（高级）</b></td>
            <td>四路互补 PWM、死区、<b>BREAK 刹车</b></td>
            <td>普通定时器没有互补输出与可编程死区，做不了半桥</td></tr>
        <tr><td><b>FDCAN</b></td>
            <td>与主控通信，1 Mbps</td>
            <td>RM 生态默认 CAN；G4 的 FDCAN 兼容经典 CAN 帧</td></tr>
        <tr><td><b>DMA</b></td>
            <td>ADC 结果搬运</td>
            <td>不占 CPU；搬完触发中断，环路就在中断里跑</td></tr>
        <tr><td><b>IWDG</b></td>
            <td>看门狗</td>
            <td>环路卡死时复位，避免半桥以错误占空比长期运行</td></tr>
        <tr><td><b>UID（96 位）</b></td>
            <td>拟合参数与板子<b>绑定</b></td>
            <td>每块板的采样校准值不同，靠 UID 匹配，换板不会用错参数</td></tr>
      </table>
    </div>
    <div class="col" style="flex:0 0 320px">
      <div class="note" style="font-size:15px"><b>一个很实用的设计：</b>
        用 <b>96 位 UID</b> 来绑定"这块板的 ADC 校准系数"。
        每块板的电阻分压比、运放失调都略有差异，
        把校准值存进 Flash 并用 UID 校验，就能做到<b>换板即用、不重标</b>。</div>
      <div class="warnbox" style="font-size:14px">如果 UID 对不上（比如烧了新固件但没写入校准值），
        固件应当<b>拒绝运行</b>而不是用默认值硬跑——
        指示灯里的"全部熄灭"就是这个状态。</div>
    </div>
  </div>`
},

/* ---------- 栅极驱动 ---------- */
{
  id: 'sel-gate', part: 'Part II', partKey: 'p2', title: '栅极驱动：为什么是 LM5109',
  sub: '12.5.3 · 半个桥一颗，还要解决自举',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>它要干什么</div>
        <p style="font-size:16px">MCU 的 PWM 只有 3.3 V、几毫安，推不动 MOS 的栅极电容。
          驱动器负责把<b>电平抬上去、电流放大</b>，并且给高边管子提供
          <b>高于母线 10 V</b> 的栅压——这就是<b>自举</b>。</p>
        <div class="formula p2" style="font-size:15px;white-space:normal;margin-top:10px">
          V_gs(高边) = V_CC + V_boot − V_D
        </div>
        <p class="explain" style="font-size:14px;margin-top:8px">
          式中 <span class="var">V_CC</span> 为驱动供电（约 12 V）；
          <span class="var">V_boot</span> 为自举电容上的电压；
          <span class="var">V_D</span> 为自举二极管压降。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么选 LM5109</div>
        <ul style="font-size:15px">
          <li><b>半桥双通道</b>：一颗管一个半桥，FSBB 正好用两颗</li>
          <li><b>100 V 耐压</b>：母线最高 35 V，留足余量（热插拔尖峰会远超稳态）</li>
          <li><b>1 A 峰值驱动</b>：够不够要算——见下面</li>
          <li><b>便宜、好买、封装常规</b></li>
        </ul>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>1 A 够不够？算一遍</div>
        <p style="font-size:15px">MOS 的栅极电荷 <span class="var">Q_g ≈ 22 nC</span>，
          希望在 <span class="var">t_r ≈ 50 ns</span> 内开通，则需要的峰值电流</p>
        <div class="formula p2" style="font-size:16px">I_g = Q_g / t_r = 22 nC / 50 ns ≈ 0.44 A</div>
        <div class="okbox" style="margin-top:10px;font-size:15px">
          LM5109 的 <b>1 A</b> 有 2 倍余量，够。
          驱动功率本身很小：<span class="var">P_drv = Q_g·V_gs·f = 22 n×10×100 k ≈ 22 mW</span>。</div>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>换成别的会怎样</div>
        <ul style="font-size:14px">
          <li><b>驱动电流太小</b>（如 0.2 A）→ 开通慢、开关损耗大增，MOS 发烫</li>
          <li><b>耐压不够</b>（如 40 V 器件用在 35 V 母线）→ 热插拔尖峰直接击穿</li>
          <li><b>没有自举</b>（低边驱动）→ 高边管子根本开不起来</li>
          <li><b>驱动器自带死区</b> → 与 MCU 的死区叠加，可能变成"死区太长"</li>
        </ul>
      </div>
    </div>
  </div>`
},

/* ---------- 半桥 MOS ---------- */
{
  id: 'sel-mos', part: 'Part II', partKey: 'p2', title: '半桥 MOS：IRFH7440 与一张损耗账',
  sub: '12.5.4 · 选型就是算损耗',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>三个硬指标</div>
        <table class="tb" style="font-size:14px">
          <tr><th style="width:22%">指标</th><th style="width:22%">这颗器件</th><th>怎么定</th></tr>
          <tr><td><b>V_DS</b></td><td>40 V</td>
              <td>母线最高 35 V，留约 15% 余量。<b>必须配 TVS</b> 钳位热插拔尖峰</td></tr>
          <tr><td><b>R_DS(on)</b></td><td>≈ 4 mΩ @10 V</td>
              <td>直接决定导通损耗，见右表</td></tr>
          <tr><td><b>Q_g</b></td><td>≈ 22 nC</td>
              <td>决定驱动电流与开关损耗；太大会推不动</td></tr>
        </table>
        <p style="font-size:14px;margin-top:8px">封装 PQFN 5×6，底部有大面积散热焊盘，靠 PCB 铜箔散热——
          <b>这也是为什么 PCB 设计里功率回路的铺铜很关键</b>。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>换个 R_DS(on) 会怎样</div>
        <p style="font-size:15px">20 A 时：<b>4 mΩ</b> → 1.6 W/只；<b>20 mΩ</b> → 8 W/只。
          四颗管子同开时差 <b>25 W 以上</b>——这就是"选 4 mΩ 而不是 20 mΩ"的全部理由。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>30 A 满功率的损耗账</div>
        <table class="tb" style="font-size:14px">
          <tr><th>损耗项</th><th>公式</th><th>数值</th></tr>
          <tr><td>导通</td><td><span class="var">I²·R_DS(on)</span></td><td>900 × 4 m = <b>3.6 W</b>/只</td></tr>
          <tr><td>开关</td><td><span class="var">½·V·I·(t_r+t_f)·f</span></td><td>½×24×30×100 n×100 k ≈ <b>3.6 W</b>/只</td></tr>
          <tr><td>驱动</td><td><span class="var">Q_g·V_gs·f</span></td><td>≈ <b>22 mW</b>/只</td></tr>
        </table>
        <p style="font-size:14px;margin-top:8px">同一时刻回路里有<b>两只管子串联</b>（如上桥 + 右桥），
          所以一对的损耗约 <b>7 W</b>；全桥四颗按占空比摊下来，
          总损耗约 <b>10 W 量级</b>——对应输出 150 W 时效率约 <b>94%</b>，
          与手册标称的 96% 是同一量级。</p>
      </div>
      <div class="warnbox" style="font-size:14px"><b>两个反直觉点：</b>
        ① <b>开关损耗与导通损耗同量级</b>——不要只盯 R_DS(on)；
        ② 开关损耗<b>正比于频率</b>，所以"提高开关频率减小电感体积"是有代价的，
        100 kHz 是个折中。</div>
    </div>
  </div>`
},

/* ---------- PMOS ---------- */
{
  id: 'sel-pmos', part: 'Part II', partKey: 'p2', title: '关断 PMOS：为一根体二极管加的器件',
  sub: '12.5.5 · 防"僵尸车"',
  html: `<div class="row grow">
    <div class="col" style="flex:1.15">
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>问题：MOS 关断了，电流还在走</div>
        <p style="font-size:16px">MOSFET 有一个<b>体二极管</b>，方向是"源极 → 漏极"。
          当机器人死亡、Chassis 供电被切断时，电容组会经这个体二极管
          <b>继续向底盘供电</b>——车会"诈尸"，不合规范，也不安全。</p>
        <p style="font-size:16px;margin-top:10px">MOS 只能关断<b>沟道</b>，关不断体二极管。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>解法：串一只 PMOS 做彻底切断</div>
        <p style="font-size:15px">在同步半桥与底盘之间加一只 <b>P 沟道 MOSFET</b>
          （如 -60 V、大电流的 AGM60P100A），用来<b>完全</b>切断输出。</p>
        <ul style="font-size:15px;margin-top:8px">
          <li><b>为什么是 P 沟道：</b>放在<b>高边</b>（电源正端），
              栅极只需相对源极拉低即可导通，<b>不需要电荷泵</b></li>
          <li><b>为什么不是 NMOS 高边：</b>NMOS 高边导通需要栅压高于源极 10 V，
              得额外加自举或电荷泵——多一颗芯片、多一份失效</li>
          <li><b>选型关注：</b>V_GS 耐压（要能承受整段母线）、R_DS(on)（它串在主回路里，直接吃效率）</li>
        </ul>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>用什么判据去开它？</div>
        <p style="font-size:16px">判据要"朴素可靠"：<b>用电池端口的电流</b>。</p>
        <ul style="font-size:15px;margin-top:8px">
          <li>机器人<b>活着</b>时，底盘一动就有电流 → <b>打开</b> PMOS</li>
          <li>机器人<b>死亡</b>时，Chassis 已断电、没有电流 → <b>关闭</b> PMOS</li>
        </ul>
        <div class="okbox" style="margin-top:10px;font-size:15px">
          用"有没有电流"比"电压是多少"更可靠——电压可能因为电容的残余电荷而虚高。</div>
      </div>
      <div class="warnbox" style="font-size:14px"><b>时序要求（后面还会讲）：</b>
        PMOS 必须<b>先于</b> PWM 导通、<b>后于</b> PWM 关断。
        否则在 Boost 放电时，电感电流无处可去，会在 PMOS 前面顶出一个电压尖峰，
        可能同时击穿 PMOS 与半桥 MOS。</div>
    </div>
  </div>`
},

/* ---------- 电感 ---------- */
{
  id: 'sel-inductor', part: 'Part II', partKey: 'p2', title: '电感：22 µH 是怎么算出来、怎么绕出来的',
  sub: '12.5.6 · 感量、饱和电流、DCR 三件事',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>① 感量：由纹波反推</div>
        <p style="font-size:15px">取最坏情况 <span class="var">D = 0.5</span>、
          <span class="var">U = 30 V</span>、<span class="var">f = 100 kHz</span>（按核定开关频率），
          希望纹波不超过 <span class="var">6 A</span>：</p>
        <div class="formula p2" style="font-size:15px;white-space:normal">
          L_min = U / (4·ΔI·f) = 30 / (4×6×100k) = 12.5 µH
        </div>
        <p style="font-size:15px;margin-top:8px">实际取 <b>22 µH</b>——注意这里取的是核定频率，
          若实际跑 300 kHz，纹波只有约 <b>1.1 A</b>，远小于限值。
          <b>感量留大一点，换来的是轻载时不容易进 DCM。</b></p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>② 饱和电流：必须大于峰值</div>
        <p style="font-size:15px">峰值电流 = 额定电流 + 纹波一半 ≈ <b>30 + 1 = 31 A</b>。
          磁芯在这个电流下不能饱和，否则电感量骤降、电流失控。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>③ 为什么是磁环、11 匝、四线并绕</div>
        <ul style="font-size:15px">
          <li><b>磁环（106-125 型号）：</b>气隙<b>分布式</b>，抗饱和好、漏磁小、
              <b>自屏蔽</b>——对旁边的采样电路干扰小。罐形/EE 磁芯漏磁大得多</li>
          <li><b>11 匝 → 22 µH：</b>由 <span class="var">L = N²·A_L</span> 反推，
              <span class="var">A_L ≈ 0.18 µH/N²</span>。匝数少了感量不够，多了绕不下也增 DCR</li>
          <li><b>四线 1.0 mm 并绕：</b>100 kHz 下铜的<b>趋肤深度只有约 0.2 mm</b>，
              单根 1.0 mm 线的中间几乎不导电。四股并绕把有效截面拉回来，<b>显著降低 DCR</b></li>
        </ul>
      </div>
      <div class="note" style="font-size:15px"><b>为什么不用成品电感？</b>
        成本与交期。但代价是<b>磁芯型号必须严格一致</b>——换成别的磁芯，
        同样的匝数会得到完全不同的感量与饱和电流，轻则纹波超标、重则饱和炸管。</div>
      <div class="warnbox" style="font-size:14px">绕制工艺也要一致：四线并绕如果绕得松散，
        漏感与交流电阻都会上升，温升明显变差。</div>
    </div>
  </div>`
},

/* ---------- 电流采样 ---------- */
{
  id: 'sel-sense', part: 'Part II', partKey: 'p2', title: '电流采样：两颗器件，两个位置',
  sub: '12.5.7 · 为什么一个高侧、一个低侧',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>电池端口电流：INA139（高侧）</div>
        <p style="font-size:15px"><b>为什么必须高侧？</b>超电控制板与裁判系统的电容管理模块之间有
          4 pin 连线（含 GND），电流可能从那里回流。低侧采样会<b>漏掉这一部分</b>，功率就算不准。</p>
        <p style="font-size:15px;margin-top:8px">INA139 是<b>电流输出型</b>的高侧检测放大器，共模范围
          −16 V ~ 80 V，增益由一个外部电阻 <span class="var">R_L</span> 设定：
          <span class="var">G = 440 µA/V × R_L</span>。改量程只需换一个电阻。</p>
        <div class="okbox" style="margin-top:10px;font-size:14px">
          <b>为什么不用专用"数字电流传感器"？</b>它把 ADC 也做进去了，
          精度固定在出厂值，改不了量程，也没法与 MCU 的 ADC 基准统一校准。</div>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>超电支路电流：TLV9061（下管续流）</div>
        <p style="font-size:15px">采样点取在<b>下管源极与地之间</b>，共模几乎为零，
          所以不需要高共模能力的专用放大器——一颗<b>普通轨到轨运放</b>就够。
          TLV9061 是 10 MHz、低噪声、轨到轨，便宜且好买。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>上一版为什么改掉 INA181</div>
        <p style="font-size:15px">旧方案用电容支路串分流电阻 + INA181。它的 28 V 耐压对 21 V 电容组
          本有冗余，但仍会<b>偶尔烧毁</b>（怀疑是上电尖峰或热插拔浪涌）。</p>
        <p style="font-size:15px;margin-top:8px">更麻烦的是失效后果：烧掉之后代码改一改还能跑，
          但<b>再也测不到真实功率</b>——这是最危险的故障模式（不报错、只是悄悄失准）。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>下管续流的取舍</div>
        <p style="font-size:15px"><b>好处：</b>成本低、无共模之忧。<br>
          <b>代价：</b>下管开通时间过短时误差变大——实测<b>下管 10% 占空比、10 A 负载时约 2 A 误差</b>（空载约 0.2 A）。</p>
        <p style="font-size:14px;margin-top:8px">这个代价可以接受，因为：下管占空比小只发生在"压降很小"时
          （21 V 电容组对应最低输入约 23.3 V），且软件限制了下管最小占空比。</p>
      </div>
      <div class="note" style="font-size:14px"><b>概念上更重要：</b>这个电流只负责超电支路的功率与限流；
        底盘功率是它与<b>电池端口功率</b>运算得到的。
        <b>只要电池端口准，就不会超功率</b>——所以精度预算放在 INA139 那一路。</div>
    </div>
  </div>`
},

/* ---------- 辅助电源 ---------- */
{
  id: 'sel-power', part: 'Part II', partKey: 'p2', title: '辅助电源：为什么是"两级"',
  sub: '12.5.8 · MP2456 + RT9193',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>两级结构</div>
        <div class="row" style="gap:10px;margin:8px 0">
          <div class="card flat tight" style="flex:1;background:#f8fafc;text-align:center">
            <p class="tiny" style="font-size:13px;color:var(--ink-3)">输入</p>
            <p style="font-family:var(--mono);font-size:19px;font-weight:700">24 V</p>
          </div>
          <div style="display:grid;place-items:center;font-size:20px;color:var(--ink-3)">→</div>
          <div class="card flat tight" style="flex:1;background:#e8efff;text-align:center">
            <p class="tiny" style="font-size:13px;color:var(--p1)">DCDC 降压</p>
            <p style="font-family:var(--mono);font-size:17px;font-weight:700">MP2456</p>
            <p class="tiny" style="font-size:12px">→ 5 V，效率高</p>
          </div>
          <div style="display:grid;place-items:center;font-size:20px;color:var(--ink-3)">→</div>
          <div class="card flat tight" style="flex:1;background:#e0f5f2;text-align:center">
            <p class="tiny" style="font-size:13px;color:var(--p2)">LDO 稳压</p>
            <p style="font-family:var(--mono);font-size:17px;font-weight:700">RT9193</p>
            <p class="tiny" style="font-size:12px">→ 3.3 V，噪声低</p>
          </div>
        </div>
        <p style="font-size:15px"><b>为什么不一级 DCDC 直接到 3.3 V？</b>
          因为开关电源的输出纹波与开关噪声会<b>直接污染 ADC 基准</b>，
          读数就会带周期性误差——正好落在你要测的开关频率上，特别难查。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么不全部用 LDO？</div>
        <p style="font-size:15px">24 V 直接 LDO 到 3.3 V，压差 20.7 V。
          若后级取 100 mA，LDO 上就要烧掉 <b>2 W</b>，封装根本扛不住，效率只有 <b>14%</b>。
          先 DCDC 到 5 V 再 LDO，效率与噪声就都兼顾了。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>辅助电源自身也要防浪涌</div>
        <p style="font-size:15px">在 DCDC 之前加"<b>自恢复保险丝 + 限流电阻 + 小功率 TVS</b>"。
          原因是 MLCC 阻抗极低，上电瞬间会产生很大的浪涌电流，
          可能把设计余量不足的 DCDC 芯片直接烧掉。</p>
        <p style="font-size:15px;margin-top:8px">保险丝额定 100 mA、熔断 250 mA；限流电阻在 250 mA 时
          压降约 11.75 V，后级仍可获得
          <b>(V_bat − 11.75) × 0.25 ≈ 3 W</b>，对辅助电源足够。</p>
      </div>
      <div class="note" style="font-size:15px"><b>选型启示：</b>
        辅助电源看起来"不重要"，但它是最容易炸的一块。
        因为它接在整块板子最前面，所有浪涌都先打在它身上。
        <b>功率级的余量可以算，辅助电源的余量必须留。</b></div>
    </div>
  </div>`
},

/* ---------- 保护器件 ---------- */
{
  id: 'sel-protect', part: 'Part II', partKey: 'p2', title: '保护器件：TVS、保险丝、ESD',
  sub: '12.5.9 · 软件保护是"尽量不出事"，硬件保护是"出事了别炸"',
  html: `<div class="row grow" style="align-items:stretch">
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>① TVS（浪涌钳位）</div>
      <p style="font-size:14px">电池端口与电容端口都加 <b>SMC 封装</b>的 TVS。
        它的作用是<b>把热插拔尖峰钳住</b>——没有它，40 V 的 MOS 在 35 V 母线上并不安全。</p>
      <p style="font-size:14px;margin-top:8px"><b>为什么是 SMC 封装：</b>要吸收瞬态能量，
        封装太小会自己先烧掉。</p>

      <div class="card-title" style="margin-top:18px"><span class="dot"></span>② 保险丝（5 A 慢断）</div>
      <ul style="font-size:14px">
        <li><b>为什么慢断：</b>熔断曲线更接近裁判系统的保护曲线；而且允许短时大电流
          （10 A / 240 W 放电只持续约 5 s，不会熔断）</li>
        <li><b>为什么是插件封装：</b>熔断后拆焊更换方便（焊盘也兼容 1808 贴片快断）</li>
        <li><b>不要擅自换大：</b>超出设计参数的保险丝不一定还能起到保护作用</li>
      </ul>
    </div>
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>③ 熔断检测</div>
      <p style="font-size:14px">原理是<b>测保险丝两侧的压差</b>。最常见的熔断原因是
        <b>半桥 MOS 烧毁导致对地短路</b>：短路电流熔断保险丝后，
        升压侧与电容侧都被拉地、检测脚变 0，于是触发保护。</p>
      <p style="font-size:14px;margin-top:8px">正常时该脚高于 <b>0.7·V_DD</b> 判为高，
        对应电池端口约 <b>13 V</b> 以上。而 13 V 恰是控制板能运行的<b>最低极限电压</b>
        （低于它栅极驱动无法工作）——所以<b>正常运行时不会误触发</b>。</p>
      <div class="okbox" style="margin-top:10px;font-size:14px">
        这个阈值设计得很巧：<b>保护门限与工作下限刚好重合</b>，一个判据同时够用。</div>

      <div class="card-title" style="margin-top:18px"><span class="dot"></span>④ ESD 保护</div>
      <p style="font-size:14px">凡是与<b>功率线路直接或间接相连</b>的引脚都加 ESD 器件。
        上一版有个教训：把电流放大器的 REF 引脚与 MCU 运放输出脚直连，
        该脚要承受较大共模电压，<b>已出现过烧毁</b>。</p>
    </div>
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>⑤ 这一层的意义</div>
      <p style="font-size:14px">硬件保护不是"软件保护的备份"，而是<b>最后一道防线</b>。
        软件能做的：限幅、钳位、状态机、看门狗。
        软件做不到的：<b>在一个开关周期内掐断 PWM</b>、在 MOS 炸开的瞬间熔断。</p>
      <div class="strength" style="margin-top:12px">
        <table class="tb" style="font-size:13px">
          <tr><th>故障</th><th>谁来兜</th></tr>
          <tr><td>过流</td><td>比较器封波 + 保险丝</td></tr>
          <tr><td>过压尖峰</td><td>TVS</td></tr>
          <tr><td>半桥炸管</td><td>保险丝熔断 + 检测</td></tr>
          <tr><td>程序卡死</td><td>看门狗 + BREAK</td></tr>
          <tr><td>静电</td><td>ESD 器件</td></tr>
        </table>
      </div>
    </div>
  </div>`
},

/* ---------- CAN 收发器 ---------- */
{
  id: 'sel-can', part: 'Part II', partKey: 'p2', title: 'CAN 收发器与总线',
  sub: '12.5.10 · 一颗不起眼但选错会很难查的器件',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>它干什么</div>
        <p style="font-size:16px">MCU 的 FDCAN 外设输出的是<b>逻辑电平</b>（TX/RX），
          而总线上跑的是<b>差分电平</b>（CAN_H / CAN_L）。
          收发器负责两者之间的转换，并做<b>总线故障保护</b>。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么选 TCAN1044 一类</div>
        <ul style="font-size:15px">
          <li><b>5 Mbps 级别</b>，跑 1 Mbps 绰绰有余</li>
          <li><b>总线引脚耐压 ±58 V 量级</b>，能扛住底盘上的各种毛刺</li>
          <li><b>支持 3.3 V 逻辑侧</b>，直接连 MCU，不用电平转换</li>
          <li>常见封装，好买</li>
        </ul>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>两个"选错会很难查"的点</div>
        <ul style="font-size:15px">
          <li><b>封装与价格：</b>SOT23-8 封装的型号明显更贵。
              有能力的话可以换成 DFN3×3 的同类器件，价格实惠得多，
              但要注意引脚定义与散热焊盘</li>
          <li><b>终端电阻：</b>总线上终端电阻过多会导致通信异常。
              这块板子在硬件上加了 <b>120 Ω 终端电阻的开关</b>，
              用不到时关掉——这比每次拆焊电阻省事得多</li>
        </ul>
      </div>
      <div class="note" style="font-size:15px"><b>一个实用的硬件设计：</b>
        把 120 Ω 做成<b>拨码/跳线开关</b>。调试时经常要在"这块板是不是终端"之间来回切，
        有开关就不用焊来焊去。</div>
      <div class="okbox" style="font-size:14px">
        CAN 相关的调试坑（终端电阻、波特率、ID 冲突）都会表现为"通信时好时坏"，
        是最耗时的一类问题。<b>硬件上提前留好手段，比事后查值得。</b></div>
    </div>
  </div>`
},

/* ---------- 电容组选型 ---------- */
{
  id: 'sel-capbank', part: 'Part II', partKey: 'p2', title: '电容组选型：串数与容量怎么定',
  sub: '12.8 · 一条公式定全部',
  html: `<div class="row grow">
    <div class="col" style="flex:1.05">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>设计公式</div>
        <div class="formula p2" style="font-size:17px;white-space:normal">
          E = ½ · (C/b) · (bU)² &lt; 2000 J
        </div>
        <p class="explain" style="font-size:14px;margin-top:8px">
          式中 <span class="var">C</span> 为单只电容容量（F）；
          <span class="var">b</span> 为串联数；<span class="var">U</span> 为单体额定电压（V）。
          串联数越多电压越高、储能越多，但受规则上限约束。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>本例的配置</div>
        <table class="tb" style="font-size:14px">
          <tr><th></th><th>参数</th></tr>
          <tr><td>单体</td><td><b>3.0 V / 34 F</b> 与 <b>3.0 V / 10 F</b> 各 10 只</td></tr>
          <tr><td>结构</td><td>每串 34 F ∥ 10 F = <b>44 F</b>，共 <b>10 串</b></td></tr>
          <tr><td>整组</td><td><b>4.4 F / 30 V</b></td></tr>
          <tr><td>储能</td><td>½ × 4.4 × 30² = <b>1980 J</b> &lt; 2000 J ✓</td></tr>
          <tr><td>内阻</td><td>10 × (68 mΩ ∥ 45 mΩ) ≈ <b>271 mΩ</b></td></tr>
        </table>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么这样凑</div>
        <ul style="font-size:15px">
          <li><b>为什么用 3.0 V 而不是 2.7 V：</b>储能 ∝ U²，
              3.0 V 比 2.7 V 多出约 <b>23%</b> 的能量密度，同样的体积能多存不少</li>
          <li><b>为什么是 34 F + 10 F 并联，不是单个 44 F：</b>
              市面上买得到的标准件就是这两个规格，<b>并联凑 44 F 比定制便宜得多</b></li>
          <li><b>为什么 10 串：</b>正好 30 V，配 24 V 母线时既不会"电压不够放不出"，
              也不至于把 MOS 的 40 V 耐压逼到极限</li>
        </ul>
      </div>
      <div class="warnbox" style="font-size:14px">
        <b>ESR 才是真正咬人的：</b>30 A 放电时，ESR 上压降 = 30 × 0.271 = <b>8.1 V</b>
        （占 30 V 的 27%！），瞬时发热 = 30² × 0.271 = <b>244 W</b>。
        <b>"ESR 尽可能小"是电容组选型的首要原则。</b></div>
    </div>
  </div>`
},

/* ---------- 均衡 ---------- */
{
  id: 'balance', part: 'Part II', partKey: 'p2', title: '均衡：串联电容组必须有的电路',
  sub: '12.8 · 为什么被动均衡够用',
  html: `<div class="row grow">
    <div class="col" style="flex:1.05">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>不均衡会怎样</div>
        <p style="font-size:16px">串联的单体容量、漏电流不可能完全一致。充电时<b>容量小的先到顶</b>，
          若不管它就会<b>持续过压</b>——超级电容过压会迅速鼓包失效，甚至漏液。</p>
        <p style="font-size:16px;margin-top:10px">放电时同理，容量小的先放空，被其他单体<b>反向</b>充电。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>被动均衡怎么工作</div>
        <p style="font-size:15px">每一颗单体并一个"<b>电压检测 + 泄放</b>"电路（如 BW6103 这类专用均衡芯片）。
          当某只单体过阈值时，通过一个电阻把<b>多余的能量烧掉</b>。</p>
        <ul style="font-size:15px;margin-top:8px">
          <li><b>泄放电流</b>通常只有几百毫安（约 200 mA）</li>
          <li>它的作用不是"给电容充电"，而是<b>拖住电压最高的那一个</b>，等别人追上来</li>
        </ul>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么不主动均衡</div>
        <table class="tb" style="font-size:14px">
          <tr><th>方案</th><th>优点</th><th>代价</th></tr>
          <tr><td><b>被动</b>（电阻泄放）</td>
              <td>简单、便宜、可靠、不怕坏</td>
              <td>能量白烧掉，发热</td></tr>
          <tr><td><b>主动</b>（电荷搬运）</td>
              <td>效率高、不漏能量</td>
              <td>拓扑复杂、器件多、多一条失效路径</td></tr>
        </table>
        <div class="okbox" style="margin-top:10px;font-size:15px">
          <b>对竞赛场景，被动均衡足够了：</b>
          电容组每个赛季充放循环次数有限，被动均衡"烧掉"的那点能量完全可以接受；
          而主动均衡多出来的失效点，反而是更大的风险。</div>
      </div>
      <div class="warnbox" style="font-size:14px">
        <b>一个容易被忽略的坑：</b>如果整组电容被<b>短路</b>（比如外部短路），
        电量会通过均衡电阻在单体之间<b>倒着跑</b>，把某些单体的<b>反压</b>得很厉害。
        所以均衡板上要考虑防反接与限流。</div>
    </div>
  </div>`
},

/* ---------- 远端补偿 ---------- */
{
  id: 'remote-sense', part: 'Part II', partKey: 'p2', title: '远端补偿：把电压采样点搬到裁判系统那一端',
  sub: '12.6 · 一个让误差从 −5 W 变 ±1 W 的改进',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>问题：导线压降让回读功率偏小</div>
        <div class="formula p2">V_drop = I · R</div>
        <p class="explain" style="font-size:14px">控制板测的是<b>自己电池端口</b>的电压；
          裁判系统测的是<b>Chassis 端口</b>的电压。两点之间隔着导线，大电流流过时会有压降。
          于是控制板按偏低的电压算功率，<b>算出来的功率就偏小</b>。</p>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>为什么"偏小"很危险</div>
        <p style="font-size:15px">设上限 100 W、回读偏小 5 W。你设 100 W，实际也跑了 100 W，
          但回读只有 95 W → 代码认为"还没到" → 继续加到 105 W → <b>小幅超功率</b>。
          若缓冲能量已很低，就可能断电。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>两个关键细节</div>
        <ul style="font-size:15px">
          <li><b>必须用全差分放大器。</b>否则输出以板 GND 做差，<b>负极导线的线损补不了</b>。
              这里用的是 MCU <b>片内运放</b>，不再外加器件</li>
          <li><b>MMCX/SMA 外壳不属于 GND</b>，不能碰任何金属，否则引入误差；不用时悬空即可</li>
        </ul>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>实测效果（50 cm / 18 AWG，24 V、0–10 A）</div>
        <table class="tb" style="font-size:15px">
          <tr><th>工况</th><th>功率检测误差</th></tr>
          <tr><td><b>加</b>远端补偿</td><td style="color:#16a34a;font-weight:700">±1 W</td></tr>
          <tr><td><b>不加</b>远端补偿</td><td style="color:#dc2626;font-weight:700">−5 W</td></tr>
        </table>
      </div>
      <div class="note" style="font-size:14px">剩下的误差来源是"参考源不同"——
        控制板自己用四位半万用表校准过，绝对精度够；
        但与裁判系统的<b>相对一致性</b>只能相信其出厂校准。</div>
    </div>
  </div>`
},

/* ---------- PCB ---------- */
{
  id: 'pcb', part: 'Part II', partKey: 'p2', title: 'PCB 设计：功率回路、散热、测试点',
  sub: '12.5.11 · 板子画不好，前面全白搭',
  html: `<div class="row grow" style="align-items:stretch">
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>① 功率回路面积要小</div>
      <p style="font-size:14px">MOS 关断时，回路里的<b>寄生电感</b>会把电流突变变成电压尖峰：
        <span class="var">V_spike = L_loop · di/dt</span>。
        回路面积越大，<span class="var">L_loop</span> 越大，尖峰越高。</p>
      <p style="font-size:14px;margin-top:8px"><b>做法：</b>输入电容紧贴半桥、功率走线宽而短、
        上下管与电容构成的环路尽量压扁。</p>

      <div class="card-title" style="margin-top:18px"><span class="dot"></span>② 散热靠铺铜</div>
      <p style="font-size:14px">PQFN 封装的散热焊盘要靠<b>过孔阵列</b>把热导到内层与背面铜箔。
        前面算过 30 A 时单管约 3.6 W 导通损耗——<b>没有好的铺铜，这颗管子会自己烧掉</b>。</p>
    </div>
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>③ 测试点：调试效率的关键</div>
      <p style="font-size:14px">在<b>各个关键节点</b>都留测试点，配测试底版用
        <b>pogo pin 转 SMA</b>，就能直接接示波器看波形。</p>
      <div class="okbox" style="margin-top:10px;font-size:14px">
        这一条看起来"不算设计"，但它决定了<b>你排查一个问题要花十分钟还是半天</b>。
        半桥的两个中点、栅极、采样输出、母线，都应该能一插就看。</div>

      <div class="card-title" style="margin-top:18px"><span class="dot"></span>④ 其他</div>
      <ul style="font-size:14px">
        <li><b>高压侧走线远离开关节点</b>，否则采样的毛刺永远消不掉</li>
        <li><b>模拟地与功率地单点连接</b>，避免功率电流流过采样地</li>
        <li><b>CAN 终端电阻做成开关</b>，调试时能随手切换</li>
        <li>板子尺寸 75 × 45 × 25 mm，与电容组面积一致，可直接堆叠</li>
      </ul>
    </div>
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>⑤ 设计完的自检清单</div>
      <ol class="steps" style="font-size:13px">
        <li>功率回路面积是否最小？</li>
        <li>每个 MOS 的散热焊盘有没有足够的过孔与铺铜？</li>
        <li>关键节点是否都有测试点？</li>
        <li>高压侧与采样侧是否分开？</li>
        <li>地的分割是否单点连接？</li>
        <li>丝印是否标清了每个端口的用途？</li>
      </ol>
      <div class="warnbox" style="margin-top:12px;font-size:13px">
        作者的原话：<b>"画板不规范，炸板两行泪。"</b>
        画错一处，后面所有调试都白做。</div>
    </div>
  </div>`
},

/* ---------- 接线 ---------- */
{
  id: 'wiring', part: 'Part II', partKey: 'p2', title: '接线框图：三处与直觉不同',
  sub: '12.9 · 接错一根，后面全白做',
  html: `<div class="row grow">
    <div class="card p2 grow" style="display:flex;align-items:center">
      <svg viewBox="0 0 900 420" style="width:100%">
        <g fill="#fff" stroke="#c7d2e0" stroke-width="2">
          <rect x="322" y="8" width="164" height="60" rx="11"/>
          <rect x="640" y="8" width="150" height="60" rx="11"/>
          <rect x="268" y="128" width="196" height="60" rx="11" fill="#e0f5f2" stroke="#0d9488"/>
          <rect x="600" y="128" width="150" height="60" rx="11"/>
          <rect x="790" y="128" width="110" height="60" rx="11"/>
          <rect x="60" y="128" width="120" height="60" rx="11"/>
          <rect x="268" y="272" width="196" height="60" rx="11"/>
          <rect x="600" y="272" width="150" height="60" rx="11"/>
        </g>
        <g class="lbl-sm" text-anchor="middle" fill="#16202b">
          <text x="404" y="32">【裁判系统】</text><text x="404" y="52">电源管理模块</text>
          <text x="715" y="32">超级电容</text><text x="715" y="52">管理模块</text>
          <text x="366" y="152">超电控制板</text><text x="366" y="172" fill="#7b8a9e">本例板卡</text>
          <text x="675" y="152">【裁判系统】</text><text x="675" y="172">电容管理模块</text>
          <text x="845" y="152">超级</text><text x="845" y="172">电容组</text>
          <text x="120" y="152">分电板</text><text x="120" y="172" fill="#7b8a9e">→ 底盘电机</text>
          <text x="366" y="296">C 板 CAN 总线</text>
          <text x="675" y="296">调试口 UART+SWD</text>
        </g>
        <g stroke="#47566a" stroke-width="2.2" fill="none" marker-end="url(#a9)">
          <path d="M180,158 H266"/><path d="M422,158 H598"/><path d="M750,158 H788"/>
          <path d="M404,68 V126"/><path d="M404,188 V270"/><path d="M715,68 V100 H560 V126"/>
        </g>
        <path d="M366,188 V236 H36 V158" stroke="#94a3b8" stroke-width="2" fill="none" stroke-dasharray="7 5" marker-end="url(#a9)"/>
        <path d="M366,188 V246 H580 V300" stroke="#94a3b8" stroke-width="2" fill="none" stroke-dasharray="7 5"/>
        <text x="196" y="112" class="lbl-sm" fill="#7b8a9e">Chassis →「电池」</text>
        <text x="500" y="148" class="lbl-sm" fill="#7b8a9e">「电容」</text>
        <text x="756" y="148" class="lbl-sm" fill="#7b8a9e">SuperCap</text>
        <text x="284" y="222" class="lbl-sm" fill="#7b8a9e">「CAN」</text>
        <text x="440" y="256" class="lbl-sm" fill="#94a3b8" font-size="12">虚线＝选装</text>
      </svg>
    </div>
    <div class="col" style="flex:0 0 370px">
      <div class="warnbox"><b>其一：</b>控制板与电容组之间<b>并不是直连</b>，
        要经过【裁判系统】电容管理模块（PwrCtrl → SuperCap）。</div>
      <div class="warnbox"><b>其二：</b>控制板上标着「电池」的端口，实际接的是
        <b>Chassis 端口</b>。叫「电池」是因为备赛期多数队伍还没有电源管理模块。</div>
      <div class="warnbox"><b>其三：</b>控制板另有一个<b>「底盘」端口</b>接分电板，
        它才是底盘真正的供电通路。</div>
      <div class="note">两条虚线是选装：<b>NTC 测温</b>与<b>远端补偿</b>。
        本项目<b>不支持无线充电</b>。</div>
    </div>
  </div>`
},

/* ================================================================
   软件
   ================================================================ */
{
  id: 'dual-loop', part: 'Part II', partKey: 'p2', title: '双环结构：为什么内环必须是电流环',
  sub: '13.3 · 三个外环并联，取最小',
  html: `<div class="row grow">
    <div class="card p2 grow" style="display:flex;align-items:center">
      <svg viewBox="0 0 900 340" style="width:100%">
        <g fill="#fff" stroke="#c7d2e0" stroke-width="2">
          <rect x="20" y="20" width="180" height="56" rx="10"/>
          <rect x="20" y="122" width="180" height="56" rx="10"/>
          <rect x="20" y="224" width="180" height="56" rx="10"/>
          <circle cx="330" cy="150" r="26"/>
          <rect x="410" y="122" width="170" height="56" rx="10"/>
          <rect x="650" y="122" width="180" height="56" rx="10" fill="#e0f5f2" stroke="#0d9488"/>
        </g>
        <g class="lbl-sm" text-anchor="middle" fill="#16202b">
          <text x="110" y="44">功率环</text><text x="110" y="64" font-size="11" fill="#7b8a9e">目标功率 → 电流参考</text>
          <text x="110" y="146">低压保护环</text><text x="110" y="166" font-size="11" fill="#7b8a9e">U₂ &lt; U_min 时收缩</text>
          <text x="110" y="248">高压保护环</text><text x="110" y="268" font-size="11" fill="#7b8a9e">U₂ &gt; U_max 时停充</text>
          <text x="330" y="157" font-size="19" font-weight="800" fill="#0d9488">min</text>
          <text x="495" y="146">电感电流环</text><text x="495" y="166" font-size="11" fill="#7b8a9e">PI → 占空比</text>
          <text x="740" y="146">FSBB + 电容组</text><text x="740" y="166" font-size="11" fill="#7b8a9e">被控对象</text>
        </g>
        <g stroke="#0d9488" stroke-width="2.2" fill="none" marker-end="url(#a10)">
          <path d="M200,48 H265 V150 H302"/><path d="M200,150 H302"/><path d="M200,252 H265 V150"/>
          <path d="M356,150 H408"/><path d="M580,150 H648"/>
          <path d="M740,178 V300 H495 V178"/>
        </g>
        <path d="M740,122 V60 H10 V150 H18" stroke="#0d9488" stroke-width="2" fill="none" stroke-dasharray="7 5" marker-end="url(#a10)"/>
        <text x="380" y="52" class="lbl-sm" fill="#0d9488">U₂、功率反馈（慢，ms 级）</text>
        <text x="620" y="290" class="lbl-sm" fill="#0d9488">i_L 反馈（快，μs 级）</text>
      </svg>
    </div>
    <div class="col" style="flex:0 0 330px">
      <div class="note" style="font-size:15px"><b>为什么内环必须是电流环：</b>
        电感电流是变换器里唯一的<b>储能状态量</b>。直接控制它，就等于直接控制能量流；
        并联电压环的输出只是给它一个参考，环与环之间不再互相"抢控制权"。</div>
      <div class="warnbox" style="font-size:14px"><b>三个外环取最小值：</b>
        这样任何一条保护条件成立都能<b>立即压住</b>内环，不需要"切换模式"。</div>
      <div class="okbox" style="font-size:14px"><b>带宽要错开：</b>外环必须远低于内环，
        否则两层互相打架。典型内环几十 kHz、外环 Hz～百 Hz。</div>
    </div>
  </div>`
},

/* ---------- 电压比与占空比 ---------- */
{
  id: 'vratio', part: 'Part II', partKey: 'p2', title: '电压比与占空比：一个漂亮的对称性',
  sub: '13.2 · 前馈就靠它把 PI 的负担卸掉',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>定义</div>
        <div class="formula p2" style="font-size:19px">α ≜ U₁ / U₂</div>
        <p class="explain" style="font-size:14px">式中 <span class="var">α</span> 为<b>电压比</b>（无量纲）；
          <span class="var">U₁</span> 为母线电压（V）；<span class="var">U₂</span> 为电容电压（V）。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>两种模式下的占空比</div>
        <p style="font-size:15px"><b>Buck：</b><span class="var">U₂ = D₁U₁</span> ⟹
          <span class="var">D₁ = U₂/U₁ = 1/α</span></p>
        <p style="font-size:15px;margin-top:6px"><b>Boost：</b><span class="var">U₂ = U₁/D₃</span> ⟹
          <span class="var">D₃ = U₁/U₂ = α</span></p>
        <div class="formula p2" style="font-size:16px;margin-top:10px">
          α = U₁/U₂ = D₂/D₁ = 1 − D₁
        </div>
        <p class="explain" style="font-size:13px;margin-top:6px">
          （其中 <span class="var">D₂ = 1 − D₁</span> 为同一半桥下管的占空比）</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>这个对称性有什么用</div>
        <p style="font-size:16px">它意味着：<b>只要知道两侧电压，占空比就已经定下来了</b>。</p>
        <div class="okbox" style="margin-top:10px;font-size:15px">
          <b>这就是前馈：</b>先用公式算出一个"接近正确"的占空比交给 PWM，
          再让 PI 只去修那一点点残差。
          <b>PI 的工作量从"从零开始算"变成"微调"</b>，响应快得多、也不容易积分饱和。</div>
      </div>
      <div class="warnbox" style="font-size:14px">
        <b>这也解释了为什么上电时必须做"积分预加载"：</b>
        如果一上电 PI 就从 0 开始积分，输出的占空比会从 0 慢慢爬——
        而此时正确的占空比可能已经是 0.6。这段时间里半桥以错误的占空比运行，
        <b>后果就是炸管</b>。所以要先按下式算一个初值再启动。</div>
      <div class="note" style="font-size:14px">
        这条对称性也是判断<b>"驱动极性是否接反"</b>的好工具：
        占空比增大而输出电压反而下降，说明定义反了。</div>
    </div>
  </div>`
},

/* ---------- 程序结构 ---------- */
{
  id: 'sw-structure', part: 'Part II', partKey: 'p2', title: '程序结构：一个中断跑完整个环路',
  sub: '13.14 · 5 µs 的时间预算',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>时序</div>
        <p style="font-size:15px">ADC 以 <b>100 kHz</b> 触发 → DMA 搬完 → 进中断 → 在中断里跑完整个环路。</p>
        <div class="formula p2" style="font-size:15px;white-space:normal;margin-top:10px">
          ADC(100 kHz) → DMA → <b>DMA1_Channel1_IRQHandler</b> → A_Timing_Ranking_Idea()
        </div>
        <p style="font-size:15px;margin-top:10px"><b>每周期必执行三步：</b></p>
        <ol class="steps" style="font-size:14px">
          <li><code>ADC_Convert_To_Reality()</code>：原始值 → 真实物理量</li>
          <li><code>State_Change()</code>：状态判断</li>
          <li><code>Power_Loop()</code>：执行当前状态那一条环路</li>
        </ol>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>其余按分频执行（降到 CPU 占用）</div>
        <p style="font-size:14px">均值滤波、功率计算、CAN 发送、温度、LED、喂狗——
          这些不需要每周期都做。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>5 µs 意味着什么</div>
        <table class="tb" style="font-size:14px">
          <tr><th>项目</th><th>数值</th></tr>
          <tr><td>开关周期（100 kHz）</td><td>10 µs</td></tr>
          <tr><td>实测环路运算时间</td><td><b>接近 5 µs</b></td></tr>
          <tr><td>余量</td><td>约一半</td></tr>
        </table>
        <div class="okbox" style="margin-top:10px;font-size:15px">
          <b>好处：</b>每个开关周期都能用本周期的电压值更新下一周期的占空比
          （因为本周写入的占空比要到下一周期才生效）。<b>这是最快的响应路径。</b></div>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么环路上不用软件滤波</div>
        <p style="font-size:15px">只用了一个<b>硬件 RC 低通</b>，环路拿的是<b>未滤波的瞬时值</b>。
          代价是抗噪差；好处是能捕捉短时间的过冲与跳变。</p>
        <div class="note" style="margin-top:10px;font-size:14px">
          <b>原设计者的取舍：</b>"获得更高的响应速度远比获得精准的输出电压更好。"
          实测输出平均电压跳变 &lt; 0.1 V，而纹波本身就有 0.2 Vpp。</div>
      </div>
    </div>
  </div>`
},

/* ---------- 采样时刻 ---------- */
{
  id: 'adc-timing', part: 'Part II', partKey: 'p2', title: '采样时刻：为什么选在占空比的三分之一处',
  sub: '13.14 · 全篇最精细的一段',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>先算采样要多久</div>
        <div class="formula p2" style="font-size:16px">
          t_conv = (24.5 + 12.5) / 56.7 MHz = 652 ns
        </div>
        <p class="explain" style="font-size:14px">采样 24.5 个 ADC 时钟 + 转换固定 12.5 个；
          ADC 时钟 56.7 MHz。而开关周期是 10 µs。</p>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>最坏情况：上管只开 2 µs</div>
        <p style="font-size:15px">电容 5 V、电池 25 V 时只需约 20% 占空比，
          <b>上管开通时间只有 2 µs</b>。而项目要采<b>两次</b>（电容侧、电池侧）。
          把触发点放在占空比的 <b>3/8 处</b>，两次采样一次略早于中点、一次略晚于中点，
          都落在开通区间内。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么非要在中点附近</div>
        <p style="font-size:15px">纹波因为电容充放电大致呈<b>三角波</b>。在三角波的"半山腰"采样，
          得到的值近似等于多个周期的平均值，<b>精度最高</b>。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>三条采样经验</div>
        <ul style="font-size:14px">
          <li><b>避开开关瞬间。</b>即使带 PWM 抑制的放大器，开关瞬间也有误差，
              更别说电源轨上的毛刺噪声</li>
          <li><b>PWM 抑制有频率上限。</b>某类专用放大器约 100 kHz 以内有效，
              开关频率再高就无法保证</li>
          <li><b>想更准就提高采样率。</b>能做到开关频率两倍以上，就可以采完整个三角波求平均</li>
        </ul>
      </div>
      <div class="note" style="font-size:14px">本项目是"采样率等于开关频率"的简化做法——
        <b>在占空比 3/8 处采两次，比提高采样率更省资源。</b></div>
    </div>
  </div>`
},

/* ---------- 代码优化 ---------- */
{
  id: 'sw-opt', part: 'Part II', partKey: 'p2', title: '代码优化：把 4 µs 压到 2 µs',
  sub: '13.15 · 五条常规 + 一个巧思',
  html: `<div class="row grow">
    <div class="col" style="flex:1.05">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>ATRI：用位运算做任务分频</div>
        <p style="font-size:15px">不是所有函数都需要每个开关周期都执行。做法是用
          <b>二进制计数器 + 位操作</b>做分频：一条 AND 指令就能判断"该我跑了吗"，
          效率最高。</p>
        <p style="font-size:15px;margin-top:8px"><b>代价：</b>分频系数不精确——
          但本应用不需要精确分频，所以无所谓。作者建议 <b>CAN 发送取 500 Hz 左右</b>
          就足够满足电控对底盘功率的实时控制。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>五条常规优化</div>
        <ol class="steps" style="font-size:14px">
          <li>编译器开 <code>-Ofast</code></li>
          <li>启用硬件浮点（FPU）</li>
          <li><b>所有函数内联</b>，省掉跳转开销</li>
          <li><b>不用 CCMRAM</b>——ART 加速器已能让 Flash 零等待，改 CCMRAM 提升 &lt; 5%</li>
          <li>定时器更新用<b>寄存器地址直接赋值</b>，绕开库函数封装</li>
        </ol>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>瓶颈不在运算</div>
        <p style="font-size:15px">用 <code>-O0</code> 编译时能看到两条带链接的分支指令；
          <code>-Ofast</code> 之后汇编明显精简。</p>
        <p style="font-size:15px;margin-top:8px">但作者指出：<b>真正的瓶颈不是运算</b>，
          而是大量的 Load/Store 指令（<code>ldr</code>、<code>vldr</code>、<code>str</code>）
          以及函数跳转。</p>
        <div class="okbox" style="margin-top:10px;font-size:15px">
          这就是为什么要<b>内联</b>、要<b>少传指针</b>、要把数据放在连续的 RAM 里——
          这些比"减少乘法次数"更有效。</div>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>效果</div>
        <table class="tb" style="font-size:15px">
          <tr><th>指标</th><th>优化前</th><th>优化后</th></tr>
          <tr><td>两个 PI 运算</td><td>约 4 µs</td><td><b>约 2 µs</b></td></tr>
        </table>
        <p style="font-size:14px;margin-top:8px">这一倍的提升，直接换成环路里多出来的余量。</p>
      </div>
    </div>
  </div>`
},

/* ---------- 状态机 ---------- */
{
  id: 'state-machine', part: 'Part II', partKey: 'p2', title: '状态机：十条环路，按优先级排队',
  sub: '13.5 · 点卡片看详情',
  html: `<div class="row grow">
    <div class="col" style="flex:1.35">
      <div id="loopList" style="display:grid;gap:7px"></div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2 grow" data-loopdetail>
        <p class="muted">点左边的环路卡片查看详情。</p>
      </div>
      <div class="note" style="font-size:14px"><b>设计要点：</b>状态判断函数<b>只能让板子进入保护，
        不能让它退出保护</b>；退出的判据写在各个保护环路内部。
        这样"进入"与"退出"的条件分别集中在各自那一小段代码里，
        不会出现"谁都能把它复位"的混乱。</div>
      <div class="warnbox" style="font-size:14px"><b>前七条都是保护：</b>一旦命中，
        <b>不执行</b> CAN 下发的充放电命令。</div>
    </div>
  </div>`
},

/* ---------- CAN 协议 ---------- */
{
  id: 'can-proto', part: 'Part II', partKey: 'p2', title: 'CAN 通信协议',
  sub: '13.6 · 悬停字段看说明',
  html: `<div class="row grow">
    <div class="col" style="flex:1.5">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>下行（主控 → 超电）：<code>0x001</code></div>
        <table class="tb" style="font-size:15px">
          <tr><th style="width:22%">字节</th><th>内容</th></tr>
          <tr data-can="0x001-0" style="cursor:help"><td><code>DATA[0]</code></td><td>【使能】1 使能 / 0 失能</td></tr>
          <tr data-can="0x001-2" style="cursor:help"><td><code>DATA[2]</code></td><td>【功率上限】单位 W</td></tr>
        </table>
        <p class="explain" style="margin-top:10px">8 字节标准帧。控制板以 <b>100 Hz</b> 刷新收到的数据；
          发送频率须 &gt; 10 Hz，否则判为<b>离线</b>。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>上行（超电 → 主控）：<code>0x100</code></div>
        <table class="tb" style="font-size:15px">
          <tr><th style="width:22%">字节</th><th>内容</th></tr>
          <tr data-can="0x100-0" style="cursor:help"><td><code>DATA[0]</code></td><td>【可用】1/0</td></tr>
          <tr data-can="0x100-2" style="cursor:help"><td><code>DATA[2]</code></td><td>【电容组能量】0~100%</td></tr>
          <tr data-can="0x100-3" style="cursor:help"><td><code>DATA[3]</code></td><td>【电机功率】W，0~500</td></tr>
          <tr data-can="0x100-4" style="cursor:help"><td><code>DATA[4]</code></td><td>电池电压（×10）</td></tr>
          <tr data-can="0x100-5" style="cursor:help"><td><code>DATA[5]</code></td><td>【Chassis 功率】W，0~255</td></tr>
        </table>
        <p class="explain" style="margin-top:10px">发送频率 <b>200 Hz</b>（可调）。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2 grow" data-caninfo>
        <div class="card-title"><span class="dot"></span>字段说明</div>
        <p class="muted">把鼠标移到左边的字节上。</p>
      </div>
      <div class="warnbox" style="font-size:15px"><b>最容易踩的坑：</b>
        <code>DATA[3]</code> 的电机功率<b>发送时右移了一位（除以 2）</b>，
        接收端必须左移还原（乘 2）并用 <code>uint16</code> 接收。</div>
    </div>
  </div>`
},

/* ---------- 上电时序 ---------- */
{
  id: 'poweron', part: 'Part II', partKey: 'p2', title: '上电时序：两个防炸机细节',
  sub: '13.16 · 都是"不炸"换来的经验',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>① PID 积分预加载</div>
        <p style="font-size:15px">每次上电，电池电压基本固定，而电容电压<b>不固定</b>。
          如果 PID 首次运算时积分从 0 开始累加，PWM 输出也会从 0 起步——
          此时<b>占空比与半桥两侧电压比完全不对应</b>，结果就是炸。</p>
        <p style="font-size:15px;margin-top:8px">对策：PID 首次运行时，
          <b>先由两侧电压比算出一个相近的占空比作为起点</b>，再从这里开始调。
          这就是"积分预加载"。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>② PWM 刹车（TIM_BREAK）</div>
        <p style="font-size:15px">上电初始化时把 <b>TIM1_BKIN</b> 拉高，在"启动 PWM"到"PID 算出正确值"
          这段空窗期里<b>把半桥关掉</b>。</p>
        <p style="font-size:15px;margin-top:8px">不这样做，你会听到电感"嗒"地响一下——
          那是一次很大的浪涌电流。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>一个容易被忽略的细节</div>
        <p style="font-size:16px"><b>TIM1_BKIN 只关闭并拉低 PWM 输出，不影响定时器计数，也不影响 ADC 触发采样。</b></p>
        <p style="font-size:15px;margin-top:8px">也就是说，环路仍在持续运行，只是不往半桥送波形。
          这让"先算再开"成为可能。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>与硬件保护的分工</div>
        <p style="font-size:15px">前面讲过，板上另外用<b>逻辑门</b>搭了一套硬件延迟电路，
          保证 PMOS 先于 PWM 导通、后于 PWM 关断。</p>
        <div class="okbox" style="margin-top:10px;font-size:15px">
          <b>软件管"上电时序"，硬件管"任何情况下都不让 PMOS 与 PWM 错序"。</b>
          关键安全逻辑用硬件兜底、软件再保一层——这是很稳的思路。</div>
      </div>
    </div>
  </div>`
},

/* ---------- 使用注意 ---------- */
{
  id: 'notes', part: 'Part II', partKey: 'p2', title: '上手注意事项',
  sub: '14.1 / 14.4 · 几条反直觉但重要的结论',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>上电与断电</div>
        <ul style="font-size:15px">
          <li>正常工作状态<b>只允许用「电池」端口</b>给超电供电</li>
          <li>控制板跟随底盘上下电</li>
          <li><b>不要从调试端口供电</b>——会让程序跳过上电初始化</li>
          <li>先接电容组，再上电；断电时先断底盘</li>
        </ul>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>调试顺序</div>
        <ol class="steps" style="font-size:15px">
          <li>确认供电与基准（万用表量 ADC 基准）</li>
          <li>看驱动与开关波形（示波器看死区）</li>
          <li>最后才动控制环参数</li>
        </ol>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>三条反直觉的结论</div>
        <ul style="font-size:15px">
          <li><b>电容电压低 ≠ 能量少。</b>电压减半，能量还剩 3/4。
              "按电压百分比估电量"是错的</li>
          <li><b>"放电功率"不可直接控制。</b>它是自动分配的结果：
              <span class="var">P_dis = P_motor − P_chassis</span></li>
          <li><b>电容有电也可能断电。</b>超电只在电池侧超限时才帮上忙；
              如果底盘整体功率太高，缓冲能量照样会耗尽</li>
        </ul>
      </div>
      <div class="note" style="font-size:15px">
        <b>还有一个选型层面的提醒：</b>控制板手册标的电容侧电压范围与你的电容组最高电压
        必须<b>事先核对</b>。不一致的话，电容永远充不满，可用能量可能只有标称值的一半——
        而且不会报错，只会"感觉没劲"。</div>
    </div>
  </div>`
},

/* ---------- 指示灯 ---------- */
{
  id: 'led', part: 'Part II', partKey: 'p2', title: '指示灯：不用示波器也能定位',
  sub: '14.2 · 红灯亮 = 保护中',
  html: `<div class="row grow">
    <div class="card p2 grow">
      <table class="tb" style="font-size:14px">
        <tr><th style="width:30%">指示灯状态</th><th style="width:38%">含义</th><th>恢复方式</th></tr>
        <tr><td>全部熄灭</td><td>程序未运行；或无匹配 UID 的校准参数</td><td>检查供电与烧录</td></tr>
        <tr><td>跑马灯</td><td>上电初始化中</td><td>等待</td></tr>
        <tr><td><b>红、绿、蓝常亮</b></td><td><b>保险丝熔断</b>（超载或半桥炸管）</td><td>换保险丝后重新上电</td></tr>
        <tr><td>红灯闪，绿蓝交替闪</td><td>过温保护（100 °C / 5 s）</td><td>降温 5 s</td></tr>
        <tr><td>红灯常亮</td><td>母线欠压（20 V / 1 s）</td><td>换电池后重新上电</td></tr>
        <tr><td>红灯闪，绿常亮，蓝闪</td><td>母线过流（30 A / 200 ms）</td><td>降低电流 5 s</td></tr>
        <tr><td>红灯闪，绿灭，蓝闪</td><td>母线过压（35 V / 200 ms）</td><td>降低电压 5 s</td></tr>
        <tr><td>三灯同闪</td><td>CAN 离线（1 s 收不到报文）</td><td>1 s 内收到 10 次报文</td></tr>
        <tr><td>红灯闪，绿灯闪，蓝灭</td><td>电容组欠压（8 V / 500 ms）</td><td>充到 10 V 后 5 s</td></tr>
        <tr><td>红灭，绿蓝同闪</td><td>电容组失能，不工作</td><td>收到使能指令</td></tr>
        <tr><td>红灭，绿蓝常亮</td><td>电容组满电</td><td>—</td></tr>
        <tr><td>红灭，绿常亮</td><td>正在充电</td><td>—</td></tr>
        <tr><td>红灭，蓝常亮</td><td>正在放电</td><td>—</td></tr>
      </table>
    </div>
    <div class="col" style="flex:0 0 300px">
      <div class="warnbox"><b>一条判据就够用：</b>
        <b>只要红灯亮起，就说明电容组处于保护状态、不可用。</b></div>
      <div class="note" style="font-size:15px"><b>最常见的那个：</b>
        "红绿蓝常亮"= 保险丝熔断。而熔断的最大原因往往是
        <b>半桥 MOS 烧毁导致对地短路</b>——所以看到这个状态，
        不要只换保险丝就上电，<b>先量一下半桥是否已经短路</b>。</div>
      <div class="okbox" style="font-size:14px">
        指示灯的价值在于：<b>不带电脑、不带示波器，也能知道板子卡在哪一步。</b>
        比赛现场非常有用。</div>
    </div>
  </div>`
},

/* ---------- 检查清单 ---------- */
{
  id: 'checklist', part: 'Part II', partKey: 'p2', title: '一张检查清单',
  sub: '14.5 · 上电前对着过一遍',
  html: `<div class="row grow">
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>硬件</div>
      <ul style="font-size:15px">
        <li>电容组极性与控制板端口方向一致</li>
        <li>保险丝规格正确（5 A 慢断，不要擅自换大）</li>
        <li>电感的磁芯型号是否与设计一致（106-125）</li>
        <li>MMCX/SMA 外壳<b>没有</b>碰到任何金属</li>
        <li>CAN 终端电阻开关状态正确</li>
        <li>半桥对地是否短路（换保险丝前必查）</li>
      </ul>
    </div>
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>软件</div>
      <ul style="font-size:15px">
        <li>ADC 基准与板上基准芯片一致（否则全偏 10%）</li>
        <li><b>电容侧过压阈值与本电容组电压匹配</b></li>
        <li>CAN 波特率 1 Mbps；ID 正确（0x001 / 0x100）</li>
        <li>使能前先确认【可用】标志为 1</li>
        <li>反解做了钳位 <span class="var">P* ← max(P*, P₀)</span></li>
        <li>上电时序：BKIN 拉高 + 积分预加载</li>
      </ul>
    </div>
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>联调</div>
      <ul style="font-size:15px">
        <li>先不装车，用电子负载老化半小时</li>
        <li>示波器确认死区、确认无直通</li>
        <li>回读功率与裁判系统对比（误差应 &lt; 5 W）</li>
        <li>满载跑一次，摸 MOS 与电感温度</li>
        <li>拔电池测试：确认不会"僵尸车"</li>
        <li>断电重启三次，确认每次都能正常启动</li>
      </ul>
    </div>
  </div>
  <div class="okbox" style="flex:0 0 auto"><b>记住：</b>接错一根线，后面的调试全部白做。
    上电前花十分钟对清单，比炸一块板子省一周。</div>`
},

/* ---------- 收尾 ---------- */
{
  id: 'end', part: '结束', partKey: 'p0', title: '小结', cls: 'divider',
  html: `<div style="max-width:1020px;margin:0 auto;text-align:left">
    <h2 style="margin-bottom:24px">把两件事连起来看</h2>
    <div class="row" style="gap:20px">
      <div class="card p1 grow"><div class="card-title"><span class="dot"></span>功率控制</div>
        <p style="font-size:15px">把"能不能用这么多功率"变成<b>可计算</b>的问题：
          建模 → 预测 → 反解 → 再分配。核心是<b>力控底盘</b>与<b>模型精度</b>。</p></div>
      <div class="card p2 grow"><div class="card-title"><span class="dot"></span>超级电容</div>
        <p style="font-size:15px">把"超出去的功率"变成<b>可以借的时间</b>：
          削峰填谷。核心是<b>四开关拓扑</b>、<b>元器件选型</b>与<b>双环控制</b>。</p></div>
    </div>
    <div class="note" style="margin-top:22px;font-size:17px">
      <b>选型这件事，本质上就是</b>：把每一条应力（电压、电流、温度）、
      每一条损耗（导通、开关、驱动）都换算成数字，
      再留出余量。<b>算过的叫设计，抄来的叫赌博。</b>
    </div>
    <p class="muted" style="margin-top:22px;text-align:center;font-size:16px">
      配套教材：《功率控制算法与超级电容技术文档》——所有推导、公式、图表与实测数据都在里面。<br>
      按 <kbd>G</kbd> 回到快速导航 · 按 <kbd>Home</kbd> 回到第一页
    </p>
  </div>`
}

]);
