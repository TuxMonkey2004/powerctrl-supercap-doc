/* ============================================================
   slides-p1.js — 开场 + Part I 功率控制（精简版）
   ============================================================ */
window.SLIDES = (window.SLIDES || []).concat([

{
  id: 'p1-divider', part: 'Part I', partKey: 'p1', title: '功率控制', cls: 'divider',
  html: `<div class="big-num">I</div>
    <h2>功率控制</h2>
    <p>第 0 章已经把道理讲通了。<br>
      这一章开始动手算：怎么把一个"不能超"的限制，变成能写进代码的公式。共 13 页。</p>`
},

/* ---------- 缓冲能量 ---------- */
{
  id: 'buffer-energy', part: 'Part I', partKey: 'p1', title: '缓冲能量：规则到底怎么算账',
  sub: '1.1 · 它不是一个"不能超过"的功率线',
  html: `<div class="row grow">
    <div class="col" style="flex:1.05">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>两个量，一个池子</div>
        <p>裁判系统给的是<b>功率上限 <span class="var">P_max</span></b> 与
           <b>缓冲能量 <span class="var">E_buf</span></b>。规则把"还能用多少"和"已经超了多少"
           合并到同一个池子里管。</p>
        <div class="formula p1">$$ \\frac{dE_{\\mathrm{buf}}}{dt} = P_{\\max} - P_{\\mathrm{in}} $$</div>
        <p class="explain" style="margin-top:10px">式中 <span class="var">E_buf</span> 为缓冲能量（J）；
          <span class="var">P_max</span> 为本赛季底盘功率上限（W）；
          <span class="var">P_in</span> 为底盘实际取用功率（W）。</p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>三条推论</div>
        <ul style="font-size:17px">
          <li><b>低于上限</b> → <span class="var">E_buf</span> 回升，最多回到 <span class="var">E_max</span>（常见 60 J）</li>
          <li><b>高于上限</b> → 多出来的部分从 <span class="var">E_buf</span> 里扣</li>
          <li><b>扣到 0 之后</b> → 每周期直接扣血 / 断电</li>
        </ul>
      </div>
      <div class="note"><b>关键：</b>60 J 不代表能超 60 W。超 10 W 能用 6 秒，超 60 W 只能用 1 秒。</div>
    </div>
    <div class="card flat" style="flex:1;padding:10px">
      <svg viewBox="0 0 520 420" style="width:100%">
        <text class="lbl" x="8" y="20">P (W)</text>
        <path class="axis" d="M46,210 H500"/>
        <path d="M46,210 H160 L200,96 L300,120 L420,190 L500,205 L500,210 Z"
              fill="rgba(37,99,235,.13)" stroke="#c5f76a" stroke-width="3"/>
        <line x1="46" y1="150" x2="500" y2="150" stroke="#e8888a" stroke-width="2" stroke-dasharray="7 5"/>
        <text class="lbl-sm" x="492" y="142" text-anchor="end" fill="#e8888a">P_max = 45 W</text>
        <circle cx="200" cy="96" r="5" fill="#e8888a"/>
        <text class="lbl-sm" x="212" y="88" fill="#e8888a">此处多用了 65 W</text>
        <text class="lbl-sm" x="300" y="132" fill="#c5f76a">实际功率 P_in</text>

        <text class="lbl" x="8" y="238">E_buf (J)</text>
        <path class="axis" d="M46,400 H500"/>
        <path d="M46,400 L120,400 L160,300 L210,300 L260,300 L320,300 L360,392 L500,400"
              fill="none" stroke="#69c8e0" stroke-width="3"/>
        <line x1="46" y1="300" x2="500" y2="300" stroke="#e8888a" stroke-width="2" stroke-dasharray="7 5"/>
        <text class="lbl-sm" x="492" y="292" text-anchor="end" fill="#e8888a">E_max = 60 J</text>
        <text class="lbl-sm" x="64" y="392">0</text>
        <text class="lbl-sm" x="170" y="286" fill="#69c8e0">到 60 J 后不再增加</text>
        <text class="lbl-sm" x="372" y="384" fill="#e8888a">扣到 0 → 扣血</text>
      </svg>
    </div>
  </div>`
},

/* ---------- 超电让缓冲失效 ---------- */
{
  id: 'supercap-breaks', part: 'Part I', partKey: 'p1', title: '超电为什么会让缓冲能量失效',
  sub: '1.2 · 被控对象变了，模型就不成立了',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>现象</div>
        <p>装了超电之后，<b>"缓冲能量闭环 + 固定力矩阈值"</b>突然不灵了：
           明明电容里还有电，底盘却仍然超功率、仍然掉缓冲能量。</p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>原因：功率多了一条支路</div>
        <div class="formula p1">$$ P_{\\mathrm{chassis}} = P_{\\mathrm{motor}} - P_{\\mathrm{discharge}} $$</div>
        <p class="explain" style="margin-top:8px">式中 <span class="var">P_chassis</span> 为电池侧实际取用功率（W）；
          <span class="var">P_motor</span> 为电机实际消耗（W）；
          <span class="var">P_discharge</span> 为超电补出的功率（W）。</p>
        <p style="font-size:16px;margin-top:10px">决定缓冲能量的是<b>电池侧</b>功率，而它现在被超电"搅"了一遍，
          不再等于电机功率。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>两个后果</div>
        <ul style="font-size:16px">
          <li><b>观测点错位。</b>你看的是 <span class="var">E_buf</span>，被控对象却是 <span class="var">P_chassis</span>。</li>
          <li><b>执行器变多了。</b>现在有两个可调的东西（电机指令、超电输出），
              一个积分器管两个执行器，必然打架。</li>
        </ul>
      </div>
      <div class="warnbox">
        <b>一句话：</b>缓冲能量闭环的隐含模型是
        <span class="var">P_in ≈ f(四个电机的指令)</span>。装了超电，右边少了超电那一项，模型就不成立。
        <br><br>解决办法<b>不是把 PID 调得更猛</b>，而是重新划分职责——
        缓冲能量降为兜底，主分配交给功率模型。
      </div>
    </div>
  </div>`
},

/* ---------- 问题的本质 + 两条路线 + 为什么预测 ---------- */
{
  id: 'why-predict', part: 'Part I', partKey: 'p1', title: '问题的本质：从力矩约束到功率约束',
  sub: '1.3–1.5 · 以及为什么必须"预测"',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>约束变了</div>
        <div class="row" style="gap:12px;margin-top:4px">
          <div class="card flat tight" style="flex:1;background:#161d16">
            <p class="tiny" style="font-size:14px;color:var(--ink-3)">过去：力矩约束</p>
            <div class="formula">$$ |\\,I_{\\mathrm{cmd}}\\,| \\le I_{\\max} $$</div>
            <p class="tiny" style="font-size:13px;margin-top:6px">与转速无关，限幅就行</p>
          </div>
          <div class="card flat tight" style="flex:1;background:#1a2410">
            <p class="tiny" style="font-size:14px;color:var(--p1)">现在：功率约束</p>
            <div class="formula p1">$$ P_{\\mathrm{in}} = f\\left(I_{\\mathrm{cmd}},\\;\\omega\\right) $$</div>
            <p class="tiny" style="font-size:13px;margin-top:6px">同一指令，不同转速耗功差几倍</p>
          </div>
        </div>
        <p style="font-size:16px;margin-top:12px">约束从"一个与转速无关的常数"变成"一条随转速变化的曲线"，
          于是必须回答两个新问题：<b>① 这样下发会用多少功率？② 想用这么多，指令该给多少？</b></p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>两条技术路线</div>
        <ul style="font-size:15px">
          <li><b>反馈式：</b>先下发 → 超了 → 下一个结算周期才知道 → 再修正。
              <em>滞后是结构性的</em>，调 PID 补不回来</li>
          <li><b>预测式：</b>事先用模型算，下发前就分配好。代价是准确性完全取决于模型</li>
        </ul>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>预测式换了个问法</div>
        <p style="font-size:16px">不问"我超了多少"，而问<b>"我打算用多少"</b>：</p>
        <div class="formula p1">$$ \\hat{P}_i = k_1 I_i^2 + C_T I_i \\omega_i + k_2 \\omega_i^2 + a $$</div>
        <p class="explain" style="margin-top:8px;font-size:14px">
          式中 <span class="var">P̂ᵢ</span> 为第 i 台电机输入功率估计（W）；
          <span class="var">Iᵢ</span> 为其力矩电流指令（无量纲）；<span class="var">ωᵢ</span> 为其转速（rpm）；
          <span class="var">k₁, k₂, C_T, a</span> 为标定系数。</p>
      </div>
      <div class="okbox">
        <b>三个直接好处：</b><br>
        ① 下发<b>之前</b>就分配好，不存在"先超再收"的窗口；<br>
        ② 预算可精确分给四个电机，不靠笼统系数去凑；<br>
        ③ <b>恒功率运行</b>成为可能——从起步到加速，始终贴着上限走。
      </div>
    </div>
  </div>`
},

/* ---------- 系统结构 ---------- */
{
  id: 'system-arch', part: 'Part I', partKey: 'p1', title: '系统总体结构',
  sub: '1.6 · 四层，两个节奏',
  html: `<div class="card p1 grow" style="display:flex;align-items:center">
    <svg viewBox="0 0 1180 400" style="width:100%">
      <g fill="#1b241b" stroke="#4a5642" stroke-width="2">
        <rect x="24" y="18" width="150" height="58" rx="11"/>
        <rect x="288" y="18" width="150" height="58" rx="11"/>
        <rect x="864" y="18" width="150" height="58" rx="11"/>
        <rect x="560" y="112" width="122" height="58" rx="11"/>
        <rect x="842" y="112" width="150" height="58" rx="11"/>
        <rect x="24" y="206" width="176" height="58" rx="11" stroke="#c5f76a"/>
        <rect x="380" y="206" width="176" height="58" rx="11"/>
        <rect x="656" y="206" width="176" height="58" rx="11"/>
        <rect x="24" y="308" width="128" height="54" rx="11"/>
        <rect x="278" y="308" width="128" height="54" rx="11"/>
        <rect x="532" y="308" width="150" height="54" rx="11"/>
        <rect x="470" y="382" width="180" height="54" rx="11" fill="#12222a" stroke="#69c8e0"/>
      </g>
      <g class="lbl-sm" text-anchor="middle" fill="#f5f5f3">
        <text x="99" y="42">操作手</text><text x="99" y="62">遥控指令</text>
        <text x="363" y="42">裁判系统</text><text x="363" y="62">P_max 、E_buf</text>
        <text x="939" y="42">电机反馈</text><text x="939" y="62">ω 、given_current</text>
        <text x="621" y="136">缓冲能量</text><text x="621" y="156">外环 PID</text>
        <text x="917" y="136">功率预算</text><text x="917" y="156">P_lim</text>
        <text x="112" y="230" fill="#c5f76a">功率预测</text><text x="112" y="250" fill="#c5f76a">P̂ᵢ = f(I_cmd,i, ωᵢ)</text>
        <text x="468" y="230">功率再分配</text><text x="468" y="250">k = P_lim / Σ P̂ᵢ</text>
        <text x="744" y="230">反解</text><text x="744" y="250">I_cmd,i′ = f⁻¹(Pᵢ*, ωᵢ)</text>
        <text x="88" y="340">CAN 发送</text>
        <text x="342" y="340">C620 电调</text>
        <text x="607" y="340">M3508 电机 ×4</text>
        <text x="560" y="416" fill="#69c8e0">超级电容 + 双向 DC–DC</text>
      </g>
      <g stroke="#a8aea5" stroke-width="2" fill="none" marker-end="url(#a3)">
        <path d="M174,47 H286"/><path d="M363,76 V110"/>
        <path d="M363,141 H556"/><path d="M682,141 H840"/>
        <path d="M200,235 H378"/><path d="M556,235 H654"/>
        <path d="M744,264 V306 H88 V306"/>
        <path d="M152,335 H276"/><path d="M406,335 H530"/>
      </g>
      <path d="M112,206 V170 H60 V136 H200 V160" stroke="#a8aea5" stroke-width="2" fill="none" stroke-dasharray="6 4" marker-end="url(#a3)"/>
      <path d="M939,76 V100" stroke="#7ee787" stroke-width="2" fill="none" stroke-dasharray="6 4" marker-end="url(#a3)"/>
      <path d="M1014,76 H1116 V300 H660" stroke="#7ee787" stroke-width="2" fill="none" stroke-dasharray="6 4" marker-end="url(#a3)"/>
      <text x="1070" y="196" class="lbl-sm" text-anchor="middle" fill="#7ee787" transform="rotate(90 1070 196)">反馈</text>
      <rect x="14" y="104" width="1000" height="170" rx="14" fill="none" stroke="#55614f" stroke-width="2" stroke-dasharray="8 6"/>
      <text x="28" y="98" class="lbl-sm" fill="#6f7a6c">主控软件（决策层）</text>
      <text x="862" y="262" class="lbl-sm" fill="#6f7a6c">外环 10 Hz · 内环 1 kHz</text>
    </svg>
  </div>
  <div class="note" style="flex:0 0 auto"><b>两个节奏是关键：</b>
    外环（缓冲能量 PID）跟裁判系统的 <b>10 Hz</b> 结算节奏；
    内环（预测—分配—反解）跑 <b>1 kHz</b>。内环每个控制周期都要把功率重算一遍。</div>`
},

/* ---------- 力控底盘 ---------- */
{
  id: 'force-chassis', part: 'Part I', partKey: 'p1', title: '力控底盘：功率控制的前置条件',
  sub: '1.8 · 为什么速度环底盘做不了，以及怎么做',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>前提：你下发的必须是力矩</div>
        <p style="font-size:16px">如果底盘用<b>速度环</b>（遥控 → 目标速度 → PID → 电流），
          真正决定电流的是内环 PID，<b>不是你下发的数</b>。于是三个困难绕不开：</p>
        <ul style="font-size:15px;margin-top:8px">
          <li><b>功率不可预测。</b>同一句"跑 2 m/s"，平地和爬坡的功率差好几倍</li>
          <li><b>预算不可缩放。</b>再分配是把四路指令同乘 k；作用在速度上与功率没有线性关系</li>
          <li><b>反解送不下去。</b>反解出来的 <span class="var">I_cmd′</span> 就是力矩指令，下游接速度环无处安放</li>
        </ul>
      </div>
      <div class="note"><b>好消息：</b>C620 电调内部<b>已经有一个电流环</b>，
        所以只要通过 CAN 发电流指令就等于在做力矩控制——硬件上几乎零成本。</div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>力控底盘怎么实现</div>
        <ol class="steps" style="font-size:14px">
          <li>遥控解算成本体 <span class="var">v_x, v_y, ω_z</span></li>
          <li>运动学反解成四轮目标转速 <span class="var">vᵢ*</span></li>
          <li>速度环算出<b>力矩</b>（控制量是力矩，速度只在误差里）</li>
          <li>补前馈：惯性力矩，或直接"电流＝摇杆"</li>
          <li>限幅 ±16384，处理死区与零漂</li>
          <li>四路打包进一帧 <code>0x200</code> 发给 C620</li>
        </ol>
        <div class="formula p1">$$ I_{\\mathrm{cmd},i} = K_p\\left(v_i^{*} - v_i\\right) + K_i\\!\\int\\!\\left(v_i^{*} - v_i\\right)dt + I_{\\mathrm{ff},i} $$</div>
      </div>
      <div class="warnbox" style="font-size:16px">
        <b>一句话：</b>功率是力矩乘转速，<b>只有能直接控力矩的底盘，才能反过来控功率</b>。
        顺序必须是：先力控，再功率控制。
      </div>
    </div>
  </div>`
},

/* ---------- C620 链路 + give/given ---------- */
{
  id: 'c620-link', part: 'Part I', partKey: 'p1', title: '控制量 → 力矩 → 功率',
  sub: '2.1 · 一根完整的量纲链路',
  html: `<div class="card p1" style="flex:0 0 auto;padding:12px">
    <svg viewBox="0 0 1180 200" style="width:100%">
      <g fill="#1b241b" stroke="#4a5642" stroke-width="2">
        <rect x="20" y="30" width="150" height="66" rx="12"/>
        <rect x="236" y="30" width="150" height="66" rx="12"/>
        <rect x="452" y="30" width="150" height="66" rx="12"/>
        <rect x="668" y="30" width="150" height="66" rx="12"/>
        <rect x="884" y="30" width="150" height="66" rx="12"/>
        <rect x="1090" y="30" width="80" height="66" rx="12" fill="#12222a" stroke="#69c8e0"/>
      </g>
      <g class="lbl-sm" text-anchor="middle" fill="#f5f5f3">
        <text x="95" y="58">CAN 报文</text><text x="95" y="80" fill="#6f7a6c">−16384 ~ 16384</text>
        <text x="311" y="58">力矩电流</text><text x="311" y="80" fill="#6f7a6c">±20 A（C620）</text>
        <text x="527" y="58">力矩</text><text x="527" y="80" fill="#6f7a6c">K_T · I</text>
        <text x="743" y="58">轮端力矩</text><text x="743" y="80" fill="#6f7a6c">× k_g ≈ 19.2</text>
        <text x="959" y="58">机械功率</text><text x="959" y="80" fill="#6f7a6c">τ · ω</text>
        <text x="1130" y="58" fill="#69c8e0">电功率</text><text x="1130" y="80" fill="#69c8e0">P_in</text>
      </g>
      <g stroke="#c5f76a" stroke-width="2.4" fill="none" marker-end="url(#a4)">
        <path d="M170,63 H234"/><path d="M386,63 H450"/><path d="M602,63 H666"/>
        <path d="M818,63 H882"/><path d="M1034,63 H1088"/>
      </g>
      <g class="lbl-sm" text-anchor="middle" fill="#e8888a">
        <text x="202" y="50">/20/16384</text><text x="418" y="50">K_T</text>
        <text x="634" y="50">k_g</text><text x="850" y="50">· ω</text><text x="1061" y="50">/η</text>
      </g>
      <text x="590" y="132" class="lbl-sm" text-anchor="middle" fill="#6f7a6c">
        每一步都是乘一个常数 —— 所以整条链路能写成一个闭式：P_in = f(I_cmd, ω)
      </text>
      <rect x="20" y="152" width="1150" height="42" rx="10" fill="#1a2410" stroke="#3d4a35"/>
      <text x="42" y="179" class="lbl-sm" fill="#c5f76a">方向：报文 → 电流 → 力矩 → 轮端 → 功率。反过来就是"反解"。</text>
    </svg>
  </div>
  <div class="row" style="flex:1">
    <div class="card p1" style="flex:1.25">
      <div class="card-title"><span class="dot"></span>give_current 与 given_current</div>
      <table class="tb" style="font-size:15px">
        <tr><th style="width:32%">变量</th><th>方向</th><th>含义</th></tr>
        <tr><td><code>give_current</code></td><td>主控 → 电调</td><td><b>"我说的"</b>：下发的目标值，无量纲</td></tr>
        <tr><td><code>given_current</code></td><td>电调 → 主控</td><td><b>"它做的"</b>：内环回读的实际力矩电流（A）</td></tr>
      </table>
      <p style="font-size:15px;margin-top:10px">两者不一样的原因：电流环带宽不足、达到物理上限被削平、
        零漂与死区、电机空载。<b>模型必须用 give_current 作输入</b>——它要回答"<em>这样下发</em>会用多少功率"，
        输入必须是你可控的量。</p>
    </div>
    <div class="card flat" style="flex:1;padding:10px">
      <svg viewBox="0 0 520 240" style="width:100%">
        <path class="axis" d="M46,200 H500"/><path class="axis" d="M46,30 V200"/>
        <text class="lbl-sm" x="40" y="36" text-anchor="end">+16384</text>
        <text class="lbl-sm" x="40" y="204" text-anchor="end">−16384</text>
        <path d="M60,116 C130,34 200,34 270,116 C340,198 410,198 480,116"
              fill="none" stroke="#c5f76a" stroke-width="3.4"/>
        <path d="M60,116 C136,44 206,44 276,116 C346,188 416,188 486,116"
              fill="none" stroke="#e8888a" stroke-width="3" stroke-dasharray="9 6"/>
        <text x="100" y="56" class="lbl-sm" fill="#c5f76a">give_current（发送值）</text>
        <text x="100" y="182" class="lbl-sm" fill="#e8888a">given_current（回馈值）· 滞后</text>
      </svg>
    </div>
  </div>`
},

/* ---------- 功率模型 ---------- */
{
  id: 'model', part: 'Part I', partKey: 'p1', title: '电机功率模型：四项从哪来',
  sub: '3.1–3.4 · 每一项都有物理出处',
  html: `<div class="row grow">
    <div class="col" style="flex:1.15">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>最终形式</div>
        <div class="formula p1">$$ P_{\\mathrm{in}} = k_1 I^2 + C_T I \\omega + k_2 \\omega^2 + a $$</div>
        <p class="explain" style="margin-top:10px;font-size:15px">
          式中 <span class="var">P_in</span> 为输入功率（W）；<span class="var">I</span> 为力矩电流指令（±16384）；
          <span class="var">ω</span> 为转速（rpm）；<span class="var">k₁</span> 为铜损系数；
          <span class="var">C_T</span> 为机械功率系数（W/rpm）；<span class="var">k₂</span> 为铁损与阻尼系数；
          <span class="var">a</span> 为控制器静态功耗。</p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>为什么是 I² 与 ω²</div>
        <ul style="font-size:15px">
          <li><b>铜损 ∝ I²</b>：来自焦耳定律 <span class="var">P_cu = I_rms²·R</span>，平方关系是定律本身给的</li>
          <li><b>铁损 + 阻尼 ∝ ω²</b>：磁滞损耗∝频率、涡流损耗∝频率²，合成后平方项占主导</li>
          <li><b>机械功率 ∝ I·ω</b>：它是"力矩×转速"，是<b>一次</b>的，不是平方</li>
        </ul>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>只有三项需要拟合</div>
        <p style="font-size:16px"><span class="var">k₁, k₂, a</span> 需要标定；
          <span class="var">C_T</span> 可以完全由物理常数算出（力矩常数 × 减速比 × 单位换算）。</p>
        <div class="okbox" style="margin-top:10px">把 <span class="var">C_T</span> 固定在物理值上，
          最小二乘只拟合三项，<b>条件数更好、外推更稳</b>。</div>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>适用边界</div>
        <ul style="font-size:14px">
          <li>只对<b>这一批</b>电机有效，不同批次/磨损会漂</li>
          <li>温度会改参数（铜阻随温度上升，<span class="var">k₁</span> 变大）</li>
          <li>不适用于堵转与超低速（反电动势接近 0，误差放大）</li>
          <li>不包含瞬态——模型是稳态的</li>
        </ul>
      </div>
    </div>
  </div>`
},

/* ---------- 最小二乘 ---------- */
{
  id: 'lsq', part: 'Part I', partKey: 'p1', title: '参数辨识：最小二乘',
  sub: '4.1–4.4 · 一次正交投影',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>三步</div>
        <p style="font-size:16px"><b>① 写成线性回归</b>：把每个采样点的四项当回归量，系数当未知数。</p>
        <div class="formula p1">$$ y = X\\theta + \\varepsilon,\\qquad \\theta = \\left(k_1,\\;k_2,\\;a\\right)^{\\mathsf{T}} $$</div>
        <p class="explain" style="font-size:14px;margin-top:8px">式中 <span class="var">y</span> 为实测功率（N×1）；
          <span class="var">X</span> 为设计矩阵，每行 <span class="var">[I², ω², 1]</span>（N×3）；
          <span class="var">θ</span> 为待估参数（3×1）；<span class="var">ε</span> 为残差（N×1）。</p>
        <p style="font-size:16px;margin-top:12px"><b>② 最小化残差平方和</b>，求导令零得<b>正规方程</b>：</p>
        <div class="formula p1">$$ X^{\\mathsf{T}}X\\,\\theta = X^{\\mathsf{T}}y \\;\\;\\Longrightarrow\\;\\; \\theta = \\left(X^{\\mathsf{T}}X\\right)^{-1}X^{\\mathsf{T}}y $$</div>
        <p style="font-size:16px;margin-top:12px"><b>③ 解 3×3 方程组</b>。N 可能上万，但要求解的只有三个未知数。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat" style="padding:8px">
        <svg viewBox="0 0 520 320" style="width:100%">
          <path d="M120,240 L330,170 L490,232 L280,302 Z" fill="rgba(37,99,235,.10)" stroke="#c5f76a" stroke-width="2"/>
          <text x="410" y="196" font-size="14" fill="#c5f76a" font-weight="700">col(X)</text>
          <circle cx="170" cy="262" r="5" fill="#f5f5f3"/>
          <text x="156" y="282" font-size="13" fill="#6f7a6c">0</text>
          <line x1="170" y1="262" x2="292" y2="66" stroke="#e8888a" stroke-width="3" marker-end="url(#a6)"/>
          <text x="302" y="64" font-size="16" fill="#e8888a" font-weight="700">y</text>
          <line x1="170" y1="262" x2="318" y2="208" stroke="#69c8e0" stroke-width="3.2" marker-end="url(#a6)"/>
          <text x="324" y="232" font-size="16" fill="#69c8e0" font-weight="700">ŷ = Xθ̂</text>
          <line x1="318" y1="208" x2="292" y2="66" stroke="#f0b45e" stroke-width="2.8" stroke-dasharray="8 5" marker-end="url(#a6)"/>
          <text x="330" y="140" font-size="15" fill="#f0b45e" font-weight="700">ε</text>
          <path d="M306,200 L318,212 L304,222" fill="none" stroke="#f0b45e" stroke-width="2"/>
          <text x="260" y="316" font-size="12" fill="#6f7a6c" text-anchor="middle">残差与列空间正交 ⟹ 这就是"最短距离"</text>
        </svg>
      </div>
      <div class="note" style="font-size:16px"><b>几何意义：</b>
        最小二乘就是在 <span class="var">X</span> 的列空间里，找离 <span class="var">y</span> 最近的那个点——
        也就是 <span class="var">y</span> 的<b>正交投影</b>。所以残差必然垂直于整个列空间。
        <br><br>这就是它名字的来历：它最小化的正是那个垂直距离。</div>
    </div>
  </div>`
},

/* ---------- 反解 ---------- */
{
  id: 'inverse', part: 'Part I', partKey: 'p1', title: '给定功率反解力矩',
  sub: '5.1–5.6 · 一个二次方程，两个根，两类边界',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>把它当成关于 I 的二次方程</div>
        <div class="formula p1">$$ k_1 I^2 + C_T \\omega\\, I + \\left(k_2\\omega^2 + a - P^{*}\\right) = 0 $$</div>
        <p class="explain" style="font-size:14px;margin-top:8px">
          记 <span class="var">A = k₁</span>、<span class="var">B = C_T ω</span>、
          <span class="var">C = k₂ω² + a − P*</span>，则</p>
        <div class="formula p1">$$ I = \\frac{-C_T \\omega \\pm \\sqrt{\\Delta}}{2k_1},\\qquad \\Delta = B^2 - 4AC $$</div>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>选根必须看符号</div>
        <p style="font-size:15px">负号那个根代表<b>回馈制动</b>（电机反向出力、把能量送回母线），
          不是"错误解"。所以按<b>原始指令的符号</b>选根，不能一律取正。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>两类边界情形</div>
        <table class="tb" style="font-size:14px">
          <tr><th>情形</th><th>现象</th><th>修法</th></tr>
          <tr><td><b>I</b><br>P* &lt; P₀(ω)</td>
              <td>正根变<b>负</b>，力矩方向被翻转，表现为"莫名倒车"</td>
              <td><span class="var">P* ← max(P*, P₀)</span><br><span class="muted">先钳位再反解</span></td></tr>
          <tr><td><b>II</b><br>Δ &lt; 0</td>
              <td>物理不可达，无实根</td>
              <td>置 <span class="var">I_cmd′ = 0</span> 兜底</td></tr>
        </table>
      </div>
      <div class="note" style="font-size:15px"><b>判别式其实很少为负：</b>
        由 <span class="var">P_min(ω) ≈ 4.081 − 7.96×10⁻⁶ω²</span> 可得，
        <b>ω &gt; 716 rpm 时 P_min &lt; 0</b>，判别式恒非负。
        所以"判别式小于零就跳过"这个分支在正常行驶下几乎不触发——
        <b>真正的风险在根的正负号</b>。</div>
    </div>
  </div>`
},

/* ---------- 再分配 ---------- */
{
  id: 'redistribute', part: 'Part I', partKey: 'p1', title: '多电机功率再分配',
  sub: '6.1–6.6 · 缩放的是功率，不是指令',
  html: `<div class="row grow">
    <div class="col" style="flex:1.15">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>四步</div>
        <ol class="steps" style="font-size:15px">
          <li><b>正向算。</b>四路指令分别估功率 <span class="var">P̂ᵢ</span>，求和得 <span class="var">P_tot</span></li>
          <li><b>算系数。</b><span class="var">k = P_lim / P_tot</span>（<span class="var">P_tot ≤ P_lim</span> 则不干预）</li>
          <li><b>按功率比例分配。</b><span class="var">Pᵢ* = k·P̂ᵢ</span></li>
          <li><b>反解。</b><span class="var">I_cmd,i′ = f⁻¹(Pᵢ*, ωᵢ)</span></li>
        </ol>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>负功率电机：一个容易写错的细节</div>
        <p style="font-size:15px">正在<b>回馈制动</b>的电机 <span class="var">P̂ᵢ &lt; 0</span>，
          它其实在<b>往母线送电</b>。这时候不该跟着缩放，应保持原指令不变——
          否则会把"发电"缩成"耗电"，白白浪费制动能量。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>三种方案，为什么选第三个</div>
        <table class="tb" style="font-size:14px">
          <tr><th>方案</th><th>做法</th><th>致命问题</th></tr>
          <tr><td><b>① 均分</b></td><td>每台分 <span class="var">P_lim/4</span></td>
              <td style="color:#e8888a">与转速耦合，破坏方向性→跑偏、正反馈</td></tr>
          <tr><td><b>② 统一缩放</b></td><td>指令同乘一个系数</td>
              <td style="color:#f0b45e">缩的是指令不是功率，两者无线性关系</td></tr>
          <tr><td><b>③ 功率再分配</b></td><td>缩放<b>功率</b>再反解</td>
              <td style="color:#7ee787">预算利用率最高，方向性也保持</td></tr>
        </table>
      </div>
      <div class="okbox" style="font-size:16px"><b>核心区别：</b>
        方案③"缩 k 倍就真的用 k 倍功率"；方案②指令缩了 k 倍，功率并不缩 k 倍。</div>
    </div>
  </div>`
},

/* ---------- 兜底闭环 + 2025 规则 ---------- */
{
  id: 'buffer-loop', part: 'Part I', partKey: 'p1', title: '兜底闭环与 2025 规则变化',
  sub: '7.1–7.4 · 一个符号写反就成正反馈',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>闭环结构</div>
        <div class="formula p1">$$ e = E_{\\mathrm{buf}}^{*} - E_{\\mathrm{buf}} \\;\\to\\; u = K_p e + K_i\\!\\int\\! e\\,dt \\;\\to\\; P_{\\lim} = P_{\\max} - u $$</div>
        <p class="explain" style="font-size:14px;margin-top:8px">式中 <span class="var">E_buf*</span> 为设定值（常见 30 J）；
          <span class="var">u</span> 为 PID 输出；<span class="var">P_lim</span> 为本周期功率预算。</p>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>极性判据：必须核对</div>
        <p style="font-size:16px">稳定条件是 <span class="var">∂P_lim / ∂E_buf &gt; 0</span>——
          <b>缓冲能量越低，功率预算必须越小</b>。写反就是正反馈，一超再超直接断电。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>2025 赛季两条变化</div>
        <ul style="font-size:15px">
          <li><b>裁判系统删除了 Chassis 功率反馈。</b>队伍必须<b>自行检测</b>底盘功率——
              这正是超电板要把功率回读做准、并专门做<b>远端补偿</b>的原因</li>
          <li><b>缓冲能量耗尽从"扣血"改为"底盘断电"。</b>
              纯能量闭环的容错率大幅降低</li>
        </ul>
      </div>
      <div class="warnbox" style="font-size:16px">
        <b>所以定位变了：</b>缓冲能量闭环今天只做<b>兜底与保护</b>，
        主分配交给功率模型 + 再分配。
      </div>
      <div class="note" style="font-size:15px">模型准的时候，缓冲能量几乎不动；
        它真正的作用是模型偏了、参数漂了、场地换了之后还能把状态拉回来。</div>
    </div>
  </div>`
},

/* ---------- 代码与排查 ---------- */
{
  id: 'code-impl', part: 'Part I', partKey: 'p1', title: '代码要点与故障排查',
  sub: '8–9 · 三个容易写错的地方',
  html: `<div class="row grow">
    <div class="col" style="flex:1.05">
      <pre class="code" style="font-size:13px"><span class="c">// 每 1 ms 一次</span>
<span class="k">for</span> (i=<span class="n">0</span>; i&lt;<span class="n">4</span>; i++) w[i] = rpm(i);

P_tot = <span class="n">0</span>;
<span class="k">for</span> (i=<span class="n">0</span>; i&lt;<span class="n">4</span>; i++) {
    P[i] = k1*I[i]*I[i] + CT*I[i]*w[i]
         + k2*w[i]*w[i] + a;
    P_tot += P[i];       <span class="c">// 保留符号</span>
}

<span class="k">if</span> (P_tot &gt; P_lim) k = P_lim / P_tot;
<span class="k">else</span> k = <span class="n">1.0f</span>;

<span class="k">for</span> (i=<span class="n">0</span>; i&lt;<span class="n">4</span>; i++) {
    <span class="k">if</span> (P[i] &lt; <span class="n">0</span>) {         <span class="c">// 回馈制动不缩</span>
        I_out[i] = I[i]; <span class="k">continue</span>;
    }
    I_out[i] = inverse(k*P[i], w[i]);
}</pre>
    </div>
    <div class="col" style="flex:1">
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>三个坑</div>
        <ul style="font-size:15px">
          <li><b>忘了保留功率符号</b> → 回馈制动被当成耗电，白白浪费制动能量</li>
          <li><b>反解前忘了钳位</b> → 低功率目标解出负指令，力矩方向翻转</li>
          <li><b>限幅放在反解之后</b> → 反解出来的值可能又超限</li>
        </ul>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>故障速查</div>
        <table class="tb" style="font-size:14px">
          <tr><th>现象</th><th>先查什么</th></tr>
          <tr><td>起步无力、加速慢</td><td>还在用固定力矩阈值；或 k₁、k₂ 偏大</td></tr>
          <tr><td>走不直、行进偏航</td><td>分配破坏了各轮相对关系；或四台参数不一致</td></tr>
          <tr><td>持续超功率</td><td>模型参数偏小；或反解没做钳位</td></tr>
          <tr><td>猛转头就断电</td><td>缓冲能量耗尽——纯能量闭环的典型失效</td></tr>
        </table>
      </div>
      <div class="note" style="font-size:15px"><b>调试顺序：</b>先确认采样准 → 再确认模型准 → 最后才动控制参数。
        顺序反了会浪费大量时间。</div>
    </div>
  </div>`
}

]);
