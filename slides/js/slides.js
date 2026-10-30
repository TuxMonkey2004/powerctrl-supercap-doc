/* ============================================================
   slides.js — 幻灯片内容（数据驱动）
   每项：{ id, part, partKey, title, sub?, cls?, html }
   partKey: p0 开场 / p1 功率控制 / p2 超级电容
   ============================================================ */
window.SLIDES = [

/* ================================================================
   开场
   ================================================================ */
{
  id: 'cover', part: '开场', partKey: 'p0', title: '封面', cls: 'cover',
  html: `<div class="cover-inner">
    <div class="eyebrow">RoboMaster · 硬件组新人培训</div>
    <h1>功率控制<br><span class="accent">与超级电容</span></h1>
    <p class="lede">从一块电调的电流指令，讲到电机真正消耗的功率；<br>
       再从四开关 Buck-Boost 的四个管子，讲到电容组里那 1980 焦耳怎么存、怎么放。</p>
    <div class="meta">
      <div><b>两个部分</b>功率控制 · 超级电容</div>
      <div><b>配套教材</b>《功率控制算法与超级电容技术文档》</div>
      <div><b>操作</b>← → 翻页 · G 快速导航 · F 全屏</div>
    </div>
  </div>`
},
{
  id: 'roadmap', part: '开场', partKey: 'p0', title: '今天讲什么',
  sub: '先看全景，再逐块拆解',
  html: `<div class="row grow">
    <div class="card p1 grow">
      <div class="card-title"><span class="dot"></span>Part I · 功率控制</div>
      <p class="tiny" style="color:var(--ink-3);margin-bottom:10px">核心问题：<b>怎样让四个轮子的总功率，永远不超裁判给的那条线？</b></p>
      <ol class="steps" style="font-size:16px">
        <li>缓冲能量：规则到底怎么算账</li>
        <li>力控底盘：为什么它是前提</li>
        <li>控制量 → 力矩 → 功率的物理链路</li>
        <li>功率模型与最小二乘参数辨识</li>
        <li>给定功率反解力矩</li>
        <li>多电机功率再分配</li>
      </ol>
    </div>
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>Part II · 超级电容</div>
      <p class="tiny" style="color:var(--ink-3);margin-bottom:10px">核心问题：<b>怎样把“超出去的功率”临时存在电容里，事后再还回去？</b></p>
      <ol class="steps" style="font-size:16px">
        <li>能量与电压：为什么电压窗口这么重要</li>
        <li>Buck / Boost / 四开关 Buck-Boost</li>
        <li>四种工作模式与波形</li>
        <li>纹波、死区、采样、保护</li>
        <li>双环结构、状态机、CAN 协议</li>
        <li>上手注意事项与检查清单</li>
      </ol>
    </div>
  </div>
  <div class="note" style="margin-top:4px">
    <b>学习方法建议：</b>每讲完一小节，回到教材对应的小节把公式自己推一遍。
    培训只讲“为什么”和“怎么用”，推导细节交给文档。
  </div>`
},
{
  id: 'core', part: '开场', partKey: 'p0', title: '先记住这五句话',
  sub: '后面所有内容都围绕它们展开',
  html: `<div class="col grow" style="justify-content:center;gap:14px">
    <div class="card tight p1"><p style="font-size:22px"><b>① 功率是力矩乘转速。</b>
      所以只有能直接控制<b>力矩</b>的底盘，才能反过来控制功率。</p></div>
    <div class="card tight p1"><p style="font-size:22px"><b>② 功率必须“先算再发”。</b>
      反馈式控制是“先超了再收”，永远滞后一个结算周期（100 ms）。</p></div>
    <div class="card tight p1"><p style="font-size:22px"><b>③ 缩放要缩功率，不是缩指令。</b>
      指令里含着转速平方项，指令缩 k 倍，功率不会缩 k 倍。</p></div>
    <div class="card tight p2"><p style="font-size:22px"><b>④ 电容储能与电压平方成正比。</b>
      放掉一半电压，只放出四分之三的能量。</p></div>
    <div class="card tight p2"><p style="font-size:22px"><b>⑤ 死区与保护不是可选项。</b>
      上下管同时导通 = 把母线短路，瞬间炸管。</p></div>
  </div>`
},

/* ================================================================
   Part I
   ================================================================ */
{
  id: 'p1-divider', part: 'Part I', partKey: 'p1', title: '功率控制', cls: 'divider',
  html: `<div class="big-num">I</div>
    <h2>功率控制</h2>
    <p>从裁判系统的缓冲能量，到四个轮子的力矩指令——<br>一条完整的“功率约束”链路。</p>`
},

/* ---------- 1.1 缓冲能量 ---------- */
{
  id: 'buffer-energy', part: 'Part I', partKey: 'p1', title: '缓冲能量：规则到底怎么算账',
  sub: '1.1 · 缓冲能量是怎么工作的',
  html: `<div class="row grow">
    <div class="col" style="flex:1.15">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>它不是一个“不能超过”的功率线</div>
        <p>裁判系统给的其实是<b>两个量</b>：功率上限 <span class="var">P_max</span>
           和缓冲能量 <span class="var">E_buf</span>。规则把“还能用多少”和“已经超了多少”
           合并到同一个池子里管。</p>
        <div class="formula p1" style="margin-top:12px">dE_buf/dt = P_max − P_in</div>
        <p class="explain" style="margin-top:10px">
          式中 <span class="var">E_buf</span> 为缓冲能量（J）；<span class="var">P_max</span> 为本赛季的底盘功率上限（W）；
          <span class="var">P_in</span> 为底盘实际取用的功率（W）。</p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>三条推论</div>
        <ul style="font-size:17px">
          <li><b>低于上限</b> → <span class="var">E_buf</span> 回升（充电），最多回到 <span class="var">E_max</span>（常见 60 J）</li>
          <li><b>高于上限</b> → 多出来的部分从 <span class="var">E_buf</span> 里扣</li>
          <li><b>扣到 0 之后</b> → 每周期直接扣血 / 断电</li>
        </ul>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat" style="padding:10px">
        <svg viewBox="0 0 520 420" style="width:100%">
          <!-- 上：功率 -->
          <text class="lbl" x="8" y="20">P (W)</text>
          <path class="axis" d="M46,210 H500"/>
          <path d="M46,210 H160 L200,96 L300,120 L420,190 L500,205 L500,210 Z"
                fill="rgba(37,99,235,.13)" stroke="#2563eb" stroke-width="3"/>
          <line x1="46" y1="150" x2="500" y2="150" stroke="#dc2626" stroke-width="2" stroke-dasharray="7 5"/>
          <text class="lbl-sm" x="492" y="142" text-anchor="end" fill="#dc2626">P_max = 45 W</text>
          <circle cx="200" cy="96" r="5" fill="#dc2626"/>
          <text class="lbl-sm" x="212" y="88" fill="#dc2626">此处多用了 65 W</text>
          <text class="lbl-sm" x="300" y="132" fill="#2563eb">实际功率 P_in</text>

          <!-- 下：缓冲能量 -->
          <text class="lbl" x="8" y="238">E_buf (J)</text>
          <path class="axis" d="M46,400 H500"/>
          <path d="M46,400 L120,400 L160,300 L210,300 L260,300 L320,300 L360,392 L500,400"
                fill="none" stroke="#0d9488" stroke-width="3"/>
          <line x1="46" y1="300" x2="500" y2="300" stroke="#dc2626" stroke-width="2" stroke-dasharray="7 5"/>
          <text class="lbl-sm" x="492" y="292" text-anchor="end" fill="#dc2626">E_max = 60 J</text>
          <text class="lbl-sm" x="64" y="392">0</text>
          <text class="lbl-sm" x="170" y="286" fill="#0d9488">到 60 J 后不再增加</text>
          <text class="lbl-sm" x="372" y="384" fill="#dc2626">扣到 0 → 扣血</text>
        </svg>
      </div>
      <div class="note"><b>关键：</b>60 J 的缓冲能量不代表可以超 60 W。
        超 10 W 能用 6 秒，超 60 W 只能用 1 秒。</div>
    </div>
  </div>`
},

/* ---------- 1.2 超电为什么让缓冲失效 ---------- */
{
  id: 'supercap-breaks', part: 'Part I', partKey: 'p1', title: '超电为什么会让缓冲能量失效',
  sub: '1.2 · 一个反直觉的现象',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>现象</div>
        <p>装了超电之后，<b>“缓冲能量闭环 + 固定力矩阈值”</b>的方案突然不灵了：
           明明电容里还有电，底盘却仍然超功率、仍然掉缓冲能量。</p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>原因</div>
        <p>缓冲能量闭环的<em>被控对象</em>变了。原来它控的是“四个电机吃了多少”，
           现在功率可以在<b>电池母线</b>与<b>电容组</b>之间来回窜。</p>
        <div class="formula p1" style="margin-top:10px">P_chassis = P_motor − P_discharge</div>
        <p class="explain" style="margin-top:8px">
          式中 <span class="var">P_chassis</span> 为电池侧实际取用功率（W）；
          <span class="var">P_motor</span> 为电机实际消耗（W）；
          <span class="var">P_discharge</span> 为超电补出的功率（W）。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>于是出现两件事</div>
        <ul style="font-size:17px">
          <li><b>观测点错位。</b>你看的是缓冲能量，但真正决定它的是<b>电池侧</b>的功率；
              而电池侧功率现在被超电“搅”了一遍，不再等于电机功率。</li>
          <li><b>执行器变多了。</b>你现在有两个可调的东西：电机指令、超电输出。
              一个积分器管两个执行器，必然打架。</li>
        </ul>
      </div>
      <div class="warnbox">
        <b>一句话：</b>缓冲能量闭环的“模型”是
        <span class="var">P_in ≈ f(四个电机的指令)</span>。
        装了超电，这个等式右边少了超电那一项，模型就不成立了。
        <br><br>解决办法不是把 PID 调得更猛，而是<b>重新划分职责</b>——
        见后面「与超级电容的协同」。
      </div>
    </div>
  </div>`
},

/* ---------- 1.3 两条技术路线 ---------- */
{
  id: 'two-routes', part: 'Part I', partKey: 'p1', title: '两条技术路线',
  sub: '1.3 · 反馈 vs 预测',
  html: `<div class="row grow">
    <div class="card p1 grow">
      <div class="card-title"><span class="dot"></span>(a) 反馈式：先下发，再测量，再修正</div>
      <svg viewBox="0 0 520 260" style="width:100%;margin:6px 0">
        <g fill="#fff" stroke="#c7d2e0" stroke-width="2" rx="9">
          <rect x="10" y="40" width="106" height="50" rx="9"/>
          <rect x="150" y="40" width="86" height="50" rx="9"/>
          <rect x="270" y="40" width="106" height="50" rx="9"/>
          <rect x="410" y="40" width="100" height="50" rx="9"/>
        </g>
        <g class="lbl-sm" text-anchor="middle" fill="#16202b">
          <text x="63" y="70">力矩指令</text><text x="193" y="70">电机</text>
          <text x="323" y="70">实际功率</text><text x="460" y="70">与上限比较</text>
        </g>
        <g stroke="#47566a" stroke-width="2" fill="none" marker-end="url(#a1)">
          <path d="M116,65 H148"/><path d="M236,65 H268"/><path d="M376,65 H408"/>
        </g>
        <path d="M460,92 V150 H63 V92" stroke="#dc2626" stroke-width="2" fill="none"
              stroke-dasharray="7 5" marker-end="url(#a1)"/>
        <text x="260" y="176" class="lbl-sm" text-anchor="middle" fill="#dc2626">要等下一个结算周期（100 ms）才生效</text>
        <text x="260" y="200" class="lbl-sm" text-anchor="middle" fill="#7b8a9e">→ 此刻已经超功率了</text>
      </svg>
      <p style="font-size:17px">滞后一个结算周期是<b>结构性的</b>，调 PID 参数补不回来。</p>
    </div>

    <div class="card p1 grow">
      <div class="card-title"><span class="dot"></span>(b) 预测式：先算，再发</div>
      <svg viewBox="0 0 520 260" style="width:100%;margin:6px 0">
        <g fill="#fff" stroke="#c7d2e0" stroke-width="2">
          <rect x="10" y="30" width="104" height="50" rx="9"/>
          <rect x="146" y="30" width="104" height="50" rx="9"/>
          <rect x="282" y="30" width="104" height="50" rx="9"/>
          <rect x="418" y="30" width="92" height="50" rx="9"/>
          <rect x="146" y="126" width="104" height="50" rx="9" stroke="#2563eb"/>
        </g>
        <g class="lbl-sm" text-anchor="middle" fill="#16202b">
          <text x="62" y="60">目标功率</text><text x="198" y="60">模型反解</text>
          <text x="334" y="60">力矩指令</text><text x="464" y="60">电机</text>
          <text x="198" y="156" fill="#2563eb">功率预测</text>
        </g>
        <g stroke="#47566a" stroke-width="2" fill="none" marker-end="url(#a2)">
          <path d="M114,55 H144"/><path d="M250,55 H280"/><path d="M386,55 H416"/>
          <path d="M198,126 V82"/>
        </g>
        <text x="290" y="196" class="lbl-sm" text-anchor="middle" fill="#2563eb">同一套模型正反两用</text>
        <text x="290" y="220" class="lbl-sm" text-anchor="middle" fill="#7b8a9e">下发前就算好了，不需要“事后修正”</text>
      </svg>
      <p style="font-size:17px">代价是：准确性完全取决于<b>模型</b>是否准。</p>
    </div>
  </div>
  <div class="okbox"><b>本文选择预测式。</b>但也保留了缓冲能量闭环作为<b>兜底</b>——模型偏了、参数漂了，外环还能救回来。</div>`
},

/* ---------- 1.4 问题的本质 ---------- */
{
  id: 'power-constraint', part: 'Part I', partKey: 'p1', title: '问题的本质：从力矩约束到功率约束',
  sub: '1.4 · 一句话说清为什么要换思路',
  html: `<div class="col grow" style="justify-content:center">
    <div class="row">
      <div class="card grow">
        <div class="card-title"><span class="dot" style="background:#94a3b8"></span>过去：力矩约束</div>
        <p>规则（或经验）给你一个<b>固定的力矩上限</b>
           <span class="var">I_max</span>，四个轮子各自不许超过它。</p>
        <div class="formula">| I_cmd | ≤ I_max</div>
        <p class="explain" style="margin-top:10px">这种约束<b>与转速无关</b>，查表、限幅，一秒就能写完。</p>
      </div>
      <div class="card grow p1">
        <div class="card-title"><span class="dot"></span>现在：功率约束</div>
        <p>规则给的是<b>功率上限</b> <span class="var">P_max</span>，
           而功率同时取决于力矩<b>和转速</b>。</p>
        <div class="formula p1">P_in = f( I_cmd , ω )</div>
        <p class="explain" style="margin-top:10px">同一个 <span class="var">I_cmd</span>，
          在 1000 rpm 和 8000 rpm 下消耗的功率完全不同——<b>固定阈值必然失效</b>。</p>
      </div>
    </div>
    <div class="note" style="margin-top:6px">
      <b>这就是全部麻烦的来源：</b>约束从“一个与转速无关的常数”变成了“一条随转速变化的曲线”。
      于是你必须回答两个新问题——<b>① 我这套指令会消耗多少功率？</b>（正问题）
      &nbsp;<b>② 想用这么多功率，指令该给多少？</b>（反问题）
    </div>
  </div>`
},

/* ---------- 1.5 为什么必须预测 ---------- */
{
  id: 'why-predict', part: 'Part I', partKey: 'p1', title: '为什么必须“预测”功率',
  sub: '1.5 · 反馈式的三个死结',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>死结一：滞后是结构性的</div>
        <p>裁判系统以 <b>10 Hz</b> 结算缓冲能量。你下发指令 → 超功率 → 下一个结算周期才看到
           → 再修正。<b>这中间必然有一段“已经超了”的窗口。</b></p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>死结二：四路无法精确分配</div>
        <p>反馈式只能给一个“统一缩放”，而四个轮子转速差很大时，
           同样缩放对功率的影响完全不同，<b>预算利用率低</b>。</p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>死结三：调参调到怀疑人生</div>
        <p>PID 的增益与“转速—功率”关系强耦合，换一组齿轮比、换一块场地摩擦系数，参数就全废。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>预测式换了个问法</div>
        <p>不问“我超了多少”，而问<b>“我打算用多少”</b>：</p>
        <div class="formula p1" style="margin-top:12px">P̂ᵢ = k₁ Iᵢ² + C_T Iᵢ ωᵢ + k₂ ωᵢ² + a</div>
        <p class="explain" style="margin-top:10px">
          式中 <span class="var">P̂ᵢ</span> 为第 <span class="var">i</span> 台电机的输入功率估计（W）；
          <span class="var">Iᵢ</span> 为它的力矩电流指令（无量纲）；
          <span class="var">ωᵢ</span> 为它的转速（rpm）；
          <span class="var">k₁, k₂, C_T, a</span> 为标定得到的模型系数。</p>
      </div>
      <div class="okbox">
        <b>三个直接好处：</b><br>
        ① 下发<b>之前</b>就分配好了，不存在“先超再收”的窗口；<br>
        ② 预算可以精确分给四个电机，而不是靠一个笼统系数去凑；<br>
        ③ <b>恒功率运行</b>成为可能——从起步到加速，始终贴着上限走。
      </div>
    </div>
  </div>`
},

/* ---------- 1.6 系统总体结构 ---------- */
{
  id: 'system-arch', part: 'Part I', partKey: 'p1', title: '系统总体结构',
  sub: '1.6 · 四层，两个节奏',
  html: `<div class="card p1 grow" style="display:flex;align-items:center">
    <svg viewBox="0 0 1180 400" style="width:100%">
      <g fill="#fff" stroke="#c7d2e0" stroke-width="2">
        <rect x="24" y="18" width="150" height="58" rx="11"/>
        <rect x="288" y="18" width="150" height="58" rx="11"/>
        <rect x="864" y="18" width="150" height="58" rx="11"/>
        <rect x="560" y="112" width="122" height="58" rx="11"/>
        <rect x="842" y="112" width="150" height="58" rx="11"/>
        <rect x="24" y="206" width="176" height="58" rx="11" stroke="#2563eb"/>
        <rect x="380" y="206" width="176" height="58" rx="11"/>
        <rect x="656" y="206" width="176" height="58" rx="11"/>
        <rect x="24" y="308" width="128" height="54" rx="11"/>
        <rect x="278" y="308" width="128" height="54" rx="11"/>
        <rect x="532" y="308" width="150" height="54" rx="11"/>
        <rect x="24" y="382" width="128" height="0" rx="11" fill="none" stroke="none"/>
        <rect x="470" y="382" width="180" height="54" rx="11" fill="#e0f5f2" stroke="#0d9488"/>
      </g>
      <g class="lbl-sm" text-anchor="middle" fill="#16202b">
        <text x="99" y="42">操作手</text><text x="99" y="62">遥控指令</text>
        <text x="363" y="42">裁判系统</text><text x="363" y="62">P_max 、E_buf</text>
        <text x="939" y="42">电机反馈</text><text x="939" y="62">ω 、given_current</text>
        <text x="621" y="136">缓冲能量</text><text x="621" y="156">外环 PID</text>
        <text x="917" y="136">功率预算</text><text x="917" y="156">P_lim</text>
        <text x="112" y="230" fill="#2563eb">功率预测</text><text x="112" y="250" fill="#2563eb">P̂ᵢ = f(I_cmd,i, ωᵢ)</text>
        <text x="468" y="230">功率再分配</text><text x="468" y="250">k = P_lim / Σ P̂ᵢ</text>
        <text x="744" y="230">反解</text><text x="744" y="250">I_cmd,i′ = f⁻¹(Pᵢ*, ωᵢ)</text>
        <text x="88" y="340">CAN 发送</text>
        <text x="342" y="340">C620 电调</text>
        <text x="607" y="340">M3508 电机 ×4</text>
        <text x="560" y="416" fill="#0d9488">超级电容 + 双向 DC–DC</text>
      </g>
      <g stroke="#47566a" stroke-width="2" fill="none" marker-end="url(#a3)">
        <path d="M174,47 H286"/><path d="M363,76 V110"/>
        <path d="M363,141 H556"/><path d="M682,141 H840"/>
        <path d="M200,235 H378"/><path d="M556,235 H654"/>
        <path d="M744,264 V306 H88 V306"/>
        <path d="M152,335 H276"/><path d="M406,335 H530"/>
      </g>
      <path d="M112,206 V170 H60 V136 H200 V160" stroke="#47566a" stroke-width="2" fill="none" stroke-dasharray="6 4" marker-end="url(#a3)"/>
      <path d="M939,76 V100" stroke="#16a34a" stroke-width="2" fill="none" stroke-dasharray="6 4" marker-end="url(#a3)"/>
      <path d="M1014,76 H1116 V300 H660" stroke="#16a34a" stroke-width="2" fill="none" stroke-dasharray="6 4" marker-end="url(#a3)"/>
      <text x="1070" y="196" class="lbl-sm" text-anchor="middle" fill="#16a34a" transform="rotate(90 1070 196)">反馈</text>
      <!-- 虚线框：软件 -->
      <rect x="14" y="104" width="1000" height="170" rx="14" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="8 6"/>
      <text x="28" y="98" class="lbl-sm" fill="#7b8a9e">主控软件（决策层）</text>
      <text x="862" y="262" class="lbl-sm" fill="#7b8a9e">外环 10 Hz · 内环 1 kHz</text>
    </svg>
  </div>
  <div class="note"><b>两个节奏是关键：</b>外环（缓冲能量 PID）跟裁判系统的 <b>10 Hz</b> 结算节奏；
    内环（预测—分配—反解）跑 <b>1 kHz</b>。内环必须在每个控制周期里把功率“重新算一遍”。</div>`
},

/* ---------- 1.7 力控底盘：为什么 ---------- */
{
  id: 'force-why', part: 'Part I', partKey: 'p1', title: '力控底盘：做功率控制之前必须先完成的一步',
  sub: '1.8 · 为什么速度环底盘做不了功率控制',
  html: `<div class="row grow">
    <div class="col" style="flex:1.05">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>前提：你下发的必须是力矩</div>
        <p>本文后面所有推导都假设：<b>你对电机下发的是力矩（电流）指令</b>，
           而不是速度或位置指令。这个前提不成立，功率控制就无从谈起。</p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>速度环底盘的三个绕不开的困难</div>
        <ol style="font-size:16px">
          <li><b>功率不可预测。</b>你下发“目标速度”，真正的电流由内环 PID 决定。
              同一句“跑 2 m/s”，平地和爬坡的功率差好几倍。</li>
          <li><b>预算不可缩放。</b>再分配是把四路指令同乘 k。
              作用在力矩上是“各少出一点力”，含义明确；作用在速度上与功率没有线性关系。</li>
          <li><b>反解结果送不下去。</b>反解出来的 <span class="var">I_cmd′</span> 就是力矩指令，
              下游接速度环就无处安放。</li>
        </ol>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="warnbox" style="font-size:18px">
        <b>一句话概括：</b><br><br>
        功率控制要求「<b>我下发的那个量</b>」与「<b>电机实际消耗的功率</b>」
        之间存在<b>确定</b>的对应关系。<br><br>
        在常见的几种控制量里，<b>只有力矩满足这一点</b>。
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>好消息：硬件上几乎零成本</div>
        <p><b>C620 电调内部已经有一个电流环。</b>所以你只要通过 CAN 发电流指令，
           就等于在做力矩控制——不需要改硬件。</p>
      </div>
      <div class="note"><b>所以顺序是：</b>先把底盘做成力控 → 再谈功率控制。
        “力控底盘”不是功率控制的可选项，而是它的<em>前置条件</em>。</div>
    </div>
  </div>`
},

/* ---------- 1.8 力控底盘：怎么做 ---------- */
{
  id: 'force-how', part: 'Part I', partKey: 'p1', title: '力控底盘怎么实现',
  sub: '1.8 · 电控端的六个步骤',
  html: `<div class="row grow">
    <div class="col" style="flex:1.15">
      <div class="card p1 grow">
        <div class="card-title"><span class="dot"></span>六个步骤</div>
        <ol class="steps" style="font-size:16px">
          <li><b>遥控解算成期望速度。</b>前后、左右、旋转三个通道 → 本体的
              <span class="var">v_x, v_y, ω_z</span>。</li>
          <li><b>运动学反解成四轮目标转速。</b>麦轮/全向轮的逆运动学，纯几何。</li>
          <li><b>速度环算力矩。</b>控制量是力矩，速度只出现在误差里。</li>
          <li><b>补前馈。</b>按目标加速度估惯性力矩，或直接“电流＝摇杆”。</li>
          <li><b>限幅与死区。</b>限到 ±16384，处理 C620 的死区与零漂。</li>
          <li><b>打包发 CAN。</b>四路指令进一帧 <code>0x200</code>，每路两字节。</li>
        </ol>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>核心公式：速度环输出力矩</div>
        <div class="formula p1" style="font-size:18px;white-space:normal">
          I_cmd,i = K_p (vᵢ* − vᵢ) + K_i ∫(vᵢ* − vᵢ) dt + I_ff,i
        </div>
        <p class="explain" style="margin-top:10px">
          式中 <span class="var">I_cmd,i</span> 为第 i 个轮子的力矩电流指令（无量纲，−16384~16384）；
          <span class="var">vᵢ*</span> 为目标线速度（m/s）；<span class="var">vᵢ</span> 为实测线速度（m/s）；
          <span class="var">K_p, K_i</span> 为比例、积分增益；<span class="var">I_ff,i</span> 为前馈力矩。</p>
        <div class="okbox" style="margin-top:10px"><b>注意：</b>控制量是力矩，
          <b>速度只出现在误差项中</b>——这正是“力控”的含义。</div>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>即使不做功率控制，力控也更值得做</div>
        <p class="tiny" style="font-size:16px">响应更快（省掉外环相位滞后）· 手感更实（摇杆到力矩直接映射）·
           便于补偿（摩擦、重力、线损都能折算成力矩）· 便于限功率。</p>
      </div>
    </div>
  </div>`
},

/* ---------- 2.1 C620 链路 ---------- */
{
  id: 'c620-link', part: 'Part I', partKey: 'p1', title: '从控制量到力矩：C620 与 M3508',
  sub: '2.1 · 一根完整的量纲链路',
  html: `<div class="card p1 grow" style="display:flex;align-items:center">
    <svg viewBox="0 0 1180 320" style="width:100%">
      <g fill="#fff" stroke="#c7d2e0" stroke-width="2">
        <rect x="20" y="96" width="150" height="72" rx="12"/>
        <rect x="236" y="96" width="150" height="72" rx="12"/>
        <rect x="452" y="96" width="150" height="72" rx="12"/>
        <rect x="668" y="96" width="150" height="72" rx="12"/>
        <rect x="884" y="96" width="150" height="72" rx="12"/>
        <rect x="1090" y="96" width="80" height="72" rx="12" fill="#e0f5f2" stroke="#0d9488"/>
      </g>
      <g class="lbl-sm" text-anchor="middle" fill="#16202b">
        <text x="95" y="124">CAN 报文</text><text x="95" y="146" fill="#7b8a9e">−16384 ~ 16384</text>
        <text x="311" y="124">力矩电流</text><text x="311" y="146" fill="#7b8a9e">±20 A（C620）</text>
        <text x="527" y="124">力矩</text><text x="527" y="146" fill="#7b8a9e">K_T · I</text>
        <text x="743" y="124">轮端力矩</text><text x="743" y="146" fill="#7b8a9e">× k_g ≈ 19.2</text>
        <text x="959" y="124">机械功率</text><text x="959" y="146" fill="#7b8a9e">τ · ω</text>
        <text x="1130" y="124" fill="#0d9488">电功率</text><text x="1130" y="146" fill="#0d9488">P_in</text>
      </g>
      <g stroke="#2563eb" stroke-width="2.4" fill="none" marker-end="url(#a4)">
        <path d="M170,132 H234"/><path d="M386,132 H450"/><path d="M602,132 H666"/>
        <path d="M818,132 H882"/><path d="M1034,132 H1088"/>
      </g>
      <g class="lbl-sm" text-anchor="middle" fill="#dc2626">
        <text x="202" y="118">/20/16384</text><text x="418" y="118">K_T</text>
        <text x="634" y="118">k_g</text><text x="850" y="118">· ω</text><text x="1061" y="118">/η</text>
      </g>
      <text x="590" y="228" class="lbl-sm" text-anchor="middle" fill="#7b8a9e">
        每一步都是乘一个常数——所以整条链路可以写成一个闭式：P_in = f(I_cmd, ω)
      </text>
      <rect x="20" y="252" width="1150" height="52" rx="10" fill="#f0f6ff" stroke="#d5e4ff"/>
      <text x="42" y="284" class="lbl-sm" fill="#1e3a8a">
        方向：CAN 报文 → 电流 → 力矩 → 轮端 → 功率。反过来就是“反解”，见后面第 5 节。
      </text>
    </svg>
  </div>
  <div class="row">
    <div class="card tight grow"><p class="tiny"><b>K_T = 0.3 × 187 / 3591 ≈ 0.01562 N·m/A</b><br>转子侧力矩常数</p></div>
    <div class="card tight grow"><p class="tiny"><b>k_g = 3591 / 187 ≈ 19.203</b><br>减速比</p></div>
    <div class="card tight grow"><p class="tiny"><b>C_T ≈ 1.997 × 10⁻⁶ W/rpm</b><br>“发送值×转速”直接换成功率</p></div>
    <div class="card tight grow"><p class="tiny"><b>20 / 16384 A</b><br>一个控制量对应多少安培</p></div>
  </div>`
},

/* ---------- 2.2 give vs given ---------- */
{
  id: 'give-given', part: 'Part I', partKey: 'p1', title: 'give_current 与 given_current 到底差在哪',
  sub: '2.1 · 新手最容易卡住的地方',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>两句话分清</div>
        <table class="tb" style="margin-top:4px">
          <tr><th style="width:34%">变量</th><th>方向</th><th>含义</th></tr>
          <tr><td><code>give_current</code></td>
              <td>主控 <span class="arrow-right">→</span> 电调</td>
              <td><b>“我说的”</b>：你下发的目标值，无量纲 −16384~16384</td></tr>
          <tr><td><code>given_current</code></td>
              <td>电调 <span class="arrow-right">→</span> 主控</td>
              <td><b>“它做的”</b>：电调内部环回读的实际力矩电流（A）</td></tr>
        </table>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>两者为什么会不一样</div>
        <ul style="font-size:16px">
          <li><b>电流环带宽不足</b>——指令突变时实际值要花几个采样周期才追上</li>
          <li><b>达到物理上限</b>——指令超过电调能给的电流，实际值被“削平”</li>
          <li><b>零漂与死区</b>——指令接近 0 时，采样与驱动的非线性让两者有偏差</li>
          <li><b>电机空载</b>——只需要很小电流即可维持转速，指令与实际电流的对应关系失真</li>
        </ul>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat" style="padding:10px">
        <svg viewBox="0 0 520 300" style="width:100%">
          <path class="axis" d="M46,240 H500"/><path class="axis" d="M46,40 V240"/>
          <text class="lbl-sm" x="40" y="46" text-anchor="end">+16384</text>
          <text class="lbl-sm" x="40" y="244" text-anchor="end">−16384</text>
          <text class="lbl-sm" x="46" y="266">0</text>
          <!-- 发送值 -->
          <path d="M60,140 C130,40 200,40 270,140 C340,240 410,240 480,140"
                fill="none" stroke="#2563eb" stroke-width="3.4"/>
          <!-- 回读值（滞后） -->
          <path d="M60,140 C136,52 206,52 276,140 C346,228 416,228 486,140"
                fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="9 6"/>
          <text x="120" y="66" class="lbl-sm" fill="#2563eb">give_current（发送值）</text>
          <text x="120" y="216" class="lbl-sm" fill="#dc2626">given_current（回馈值）· 滞后</text>
        </svg>
      </div>
      <div class="warnbox"><b>模型必须用 give_current 作输入。</b>
        因为功率模型要回答的是“<b>这样下发</b>会消耗多少功率”——
        输入必须是你能控制的量，而不是它的执行结果。</div>
      <div class="okbox">但这两个量本身是一次很好的<b>硬件体检</b>：画在一起，两条曲线基本贴合说明电流环合格；
        明显分离就先去查硬件与参数。</div>
    </div>
  </div>`
},

/* ---------- 2.3 力矩常数与减速比 ---------- */
{
  id: 'torque-chain', part: 'Part I', partKey: 'p1', title: '力矩常数、减速比与量纲换算',
  sub: '2.1 · 三个常数撑起整条链路',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>转子侧力矩常数</div>
        <div class="formula p1">K_T = 0.3 × 187 / 3591 ≈ 0.01562 N·m/A</div>
        <p class="explain">式中 0.3 为官方给的力矩常数（N·m/A，指<em>输出轴</em>）；
          187 与 3591 分别是减速箱的齿轮齿数。因为官方常数是“输出轴”口径，
          换算到转子侧要乘上齿数比。</p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>减速比</div>
        <div class="formula p1">k_g = 3591 / 187 ≈ 19.203</div>
        <p class="explain">转子转 19.2 圈，输出轴转 1 圈。力矩放大 19.2 倍、转速缩小 19.2 倍，
          功率不变（忽略损耗）。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>三路“电流”不是一回事</div>
        <table class="tb">
          <tr><th>量</th><th>是什么</th><th>谁来测</th></tr>
          <tr><td><b>力矩电流</b></td><td>与力矩成正比的等效电流</td><td>电调内部计算</td></tr>
          <tr><td><b>母线电流</b></td><td>整块板子输出的总电流</td><td>需外加采样</td></tr>
          <tr><td><b>相电流</b></td><td>真正流过线圈的交流电流</td><td>需要电流探头</td></tr>
        </table>
      </div>
      <div class="warnbox"><b>别把力矩电流当相电流。</b>
        力矩电流是一个<b>经过坐标变换的等效量</b>，不是任意时刻线圈里流过的瞬时电流，
        也不等于母线电流。用万用表量出来的那个数是<b>母线电流</b>。</div>
    </div>
  </div>`
},

/* ---------- 3.1 功率模型四项 ---------- */
{
  id: 'model-four', part: 'Part I', partKey: 'p1', title: '电机功率模型：四项从哪来',
  sub: '3.1 · 输入功率的构成',
  html: `<div class="row grow">
    <div class="col" style="flex:1.25">
      <div class="card p1 grow">
        <div class="card-title"><span class="dot"></span>四项各管一段</div>
        <svg viewBox="0 0 620 300" style="width:100%">
          <g fill="#fff" stroke="#c7d2e0" stroke-width="2">
            <rect x="10" y="94" width="140" height="66" rx="10"/>
            <rect x="230" y="16" width="176" height="50" rx="10"/>
            <rect x="230" y="82" width="176" height="50" rx="10"/>
            <rect x="230" y="148" width="176" height="50" rx="10"/>
            <rect x="230" y="214" width="176" height="50" rx="10"/>
            <circle cx="486" cy="139" r="26" fill="#e0f5f2" stroke="#0d9488"/>
            <rect x="530" y="112" width="78" height="54" rx="10" fill="#e0f5f2" stroke="#0d9488"/>
          </g>
          <g class="lbl-sm" text-anchor="middle" fill="#16202b">
            <text x="80" y="122">I_cmd</text><text x="80" y="142" fill="#7b8a9e">力矩电流指令</text>
            <text x="318" y="46">C_T · I_cmd · ω</text>
            <text x="318" y="112">k₂ · ω²</text>
            <text x="318" y="178">k₁ · I_cmd²</text>
            <text x="318" y="244">a</text>
            <text x="486" y="144" font-size="20" font-weight="800" fill="#0d9488">Σ</text>
            <text x="569" y="134" fill="#0d9488">P_in</text><text x="569" y="152" fill="#0d9488" font-size="12">预估功率</text>
          </g>
          <g class="lbl-sm" fill="#7b8a9e">
            <text x="414" y="46">机械功率</text>
            <text x="414" y="112">铁损 + 阻尼</text>
            <text x="414" y="178">铜损</text>
            <text x="414" y="244">控制器静态功耗</text>
          </g>
          <g stroke="#47566a" stroke-width="2" fill="none" marker-end="url(#a5)">
            <path d="M150,127 H228" opacity="0"/>
            <path d="M150,127 C190,127 190,41 228,41"/>
            <path d="M150,127 C190,127 190,107 228,107"/>
            <path d="M150,127 C190,127 190,173 228,173"/>
            <path d="M150,127 C190,127 190,239 228,239"/>
            <path d="M406,41 H459"/><path d="M406,107 H459"/>
            <path d="M406,173 H459"/><path d="M406,239 H459"/>
            <path d="M512,139 H528"/>
          </g>
        </svg>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="formula p1" style="white-space:normal;font-size:19px">
        P_in = k₁ I² + C_T I ω + k₂ ω² + a
      </div>
      <div class="card p1">
        <p class="explain" style="font-size:16px">
          式中 <span class="var">P_in</span> 为电机输入功率（W）；
          <span class="var">I</span> 为力矩电流指令（无量纲，±16384）；
          <span class="var">ω</span> 为转速（rpm）；
          <span class="var">k₁</span> 为铜损系数（W/单位指令²）；
          <span class="var">C_T</span> 为机械功率系数（W/rpm）；
          <span class="var">k₂</span> 为铁损与阻尼系数（W/rpm²）；
          <span class="var">a</span> 为控制器静态功耗（W）。</p>
      </div>
      <div class="note"><b>只有三项需要拟合：</b>
        <span class="var">k₁, k₂, a</span>。
        <span class="var">C_T</span> 由物理常数直接算出——这就是后面“可辨识性”那一小节的伏笔。</div>
    </div>
  </div>`
},

/* ---------- 3.2 为什么是平方 ---------- */
{
  id: 'model-loss', part: 'Part I', partKey: 'p1', title: '损耗项为什么是转速平方与电流平方',
  sub: '3.3 · 从物理推导，不是拍脑袋',
  html: `<div class="row grow">
    <div class="card p1 grow">
      <div class="card-title"><span class="dot"></span>铜损：∝ I²</div>
      <p>线圈电阻上耗散的热功率是焦耳定律：</p>
      <div class="formula p1">P_cu = I_rms² · R</div>
      <p class="explain">式中 <span class="var">I_rms</span> 为相电流有效值（A）；
        <span class="var">R</span> 为相电阻（Ω）。而力矩电流与相电流幅值成正比，
        所以也正比于 <span class="var">I²</span>——<b>平方关系来自焦耳定律本身</b>。</p>
      <div class="okbox">这也解释了为什么“大电流跑同样的速度更费电”：
        同样的机械功，铜损随电流平方涨。</div>
    </div>
    <div class="card p1 grow">
      <div class="card-title"><span class="dot"></span>铁损 + 阻尼：∝ ω²</div>
      <p>铁损（磁滞 + 涡流）在高速时随频率（即转速）上升；机械阻尼也随转速上升。
        两者合起来近似：</p>
      <div class="formula p1">P_fe ≈ k₂ · ω²</div>
      <p class="explain">式中 <span class="var">k₂</span> 为等效系数（W/rpm²）；
        <span class="var">ω</span> 为转速（rpm）。
        模型里把它写成对 <span class="var">ω²</span> 的一项，是因为磁滞损耗∝频率、
        涡流损耗∝频率²，合成后平方项占主导。</p>
      <div class="note"><b>实测印证：</b>空载（I=0）下测不同转速的输入功率，
        画出来基本是一条过原点的抛物线——斜率就是 <span class="var">k₂</span>。</div>
    </div>
  </div>
  <div class="warnbox" style="font-size:16px"><b>注意：</b>机械功率项 <span class="var">C_T·I·ω</span> 是<b>一次</b>的，
    不是平方——它是“力矩×转速”。三项量纲不同、来源不同，这也是为什么最小二乘要把它们当作不同的回归量。</div>`
},

/* ---------- 3.3 模型最终形式 ---------- */
{
  id: 'model-final', part: 'Part I', partKey: 'p1', title: '模型的最终形式与适用边界',
  sub: '3.4 / 3.6 · 什么时候它能信',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>最终形式</div>
        <div class="formula p1" style="white-space:normal;font-size:20px">
          P_in = k₁ I² + C_T I ω + k₂ ω² + a
        </div>
        <p class="explain" style="margin-top:12px">这是本文全部推导的<b>地基</b>。
          后面“预测”“反解”“再分配”全都建立在它上面。</p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>为什么 C_T 不用拟合</div>
        <p>因为 <span class="var">C_T</span> 可以完全由物理常数算出：
          力矩常数、减速比、rpm 到 rad/s 的换算、发送值到安培的换算——
          <b>四个常数一乘就出来了</b>。</p>
        <div class="okbox" style="margin-top:10px"><b>好处：</b>把它固定在物理值上，
          最小二乘只需要拟合三项，<b>条件数更好、外推更稳</b>。</div>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>适用边界：这几条要记牢</div>
        <ul style="font-size:16px">
          <li><b>只对“这一批”电机有效。</b>不同批次、不同磨损，参数会漂</li>
          <li><b>温度会改参数。</b>铜阻随温度上升，<span class="var">k₁</span> 会变大</li>
          <li><b>不适用于堵转与超低速。</b>此时反电动势接近 0，模型误差放大</li>
          <li><b>不包含瞬态。</b>模型是稳态的，指令突变后的暂态过程它算不出来</li>
        </ul>
      </div>
      <div class="note"><b>工程态度：</b>模型不是“真理”，是一个<b>够用的近似</b>。
        所以后面所有方案都保留缓冲能量闭环兜底——模型偏了，兜底还能救。</div>
    </div>
  </div>`
},

/* ---------- 4.1 最小二乘 ---------- */
{
  id: 'lsq', part: 'Part I', partKey: 'p1', title: '参数辨识：最小二乘',
  sub: '4.1–4.3 · 把拟合问题写成线性代数',
  html: `<div class="row grow">
    <div class="col" style="flex:1.15">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>第一步：写成线性回归</div>
        <p>把每个采样点的四项当作<b>回归量</b>，待拟合的系数当作<b>未知数</b>：</p>
        <div class="formula p1" style="white-space:normal;font-size:18px">
          y = X θ + ε&nbsp;&nbsp;，&nbsp;&nbsp;θ = ( k₁ , k₂ , a )ᵀ
        </div>
        <p class="explain">式中 <span class="var">y</span> 为每组实测的输入功率（N×1）；
          <span class="var">X</span> 为设计矩阵，每行是
          <span class="var">[ I² , ω² , 1 ]</span>（N×3）；
          <span class="var">θ</span> 为待估参数（3×1）；
          <span class="var">ε</span> 为残差（N×1）。</p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>第二步：最小化残差平方和</div>
        <div class="formula p1" style="font-size:18px">S(θ) = ‖y − X θ‖² = Σ ( yᵢ − xᵢᵀθ )²</div>
        <p class="explain">对 <span class="var">θ</span> 求导、令其为零，得到<b>正规方程</b>：</p>
        <div class="formula p1" style="font-size:18px">XᵀX θ = Xᵀy&nbsp;&nbsp;⟹&nbsp;&nbsp;θ = (XᵀX)⁻¹ Xᵀy</div>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>注意矩阵的形状</div>
        <svg viewBox="0 0 460 230" style="width:100%">
          <g font-size="13" text-anchor="middle" fill="#16202b">
            <rect x="10" y="88" width="60" height="54" fill="#dbeafe" stroke="#2563eb" stroke-width="1.6"/>
            <rect x="10" y="76" width="60" height="0" fill="none"/>
            <rect x="86" y="8" width="86" height="54" fill="#e0f5f2" stroke="#0d9488" stroke-width="1.6"/>
            <rect x="188" y="84" width="56" height="62" fill="#fef3e2" stroke="#ea7317" stroke-width="1.6"/>
            <rect x="260" y="84" width="56" height="62" fill="#fef3e2" stroke="#ea7317" stroke-width="1.6"/>
            <rect x="332" y="84" width="56" height="62" fill="#fde8e8" stroke="#dc2626" stroke-width="1.6"/>
            <text x="40" y="118">Xᵀ</text><text x="129" y="0"></text>
            <text x="129" y="40">X</text><text x="216" y="120">XᵀX</text>
            <text x="288" y="120">θ</text><text x="360" y="120">Xᵀy</text>
          </g>
          <g font-size="11" fill="#7b8a9e" text-anchor="middle">
            <text x="40" y="162">3×N</text><text x="129" y="82">N×3</text>
            <text x="216" y="162">3×3</text><text x="288" y="162">3×1</text><text x="360" y="162">3×1</text>
          </g>
          <g font-size="18" fill="#47566a" text-anchor="middle">
            <text x="76" y="122">×</text><text x="174" y="122">=</text><text x="250" y="122">×</text><text x="322" y="122">=</text>
          </g>
          <text x="230" y="204" font-size="12" fill="#7b8a9e" text-anchor="middle">
            N 可以上万，但真正要求解的只是 3×3 的方程组
          </text>
        </svg>
      </div>
      <div class="okbox"><b>这就是“最小二乘”名字的来源：</b>
        它最小化的正是观测向量 y 到 X 列空间的<b>垂直距离</b>。</div>
    </div>
  </div>`
},

/* ---------- 4.2 几何意义 ---------- */
{
  id: 'lsq-geo', part: 'Part I', partKey: 'p1', title: '最小二乘的几何意义：正交投影',
  sub: '4.5 · 为什么残差一定垂直于列空间',
  html: `<div class="row grow">
    <div class="card flat grow" style="padding:10px">
      <svg viewBox="0 0 620 420" style="width:100%">
        <!-- 列空间平面 -->
        <path d="M130,300 L360,220 L560,290 L330,380 Z" fill="rgba(37,99,235,.10)" stroke="#2563eb" stroke-width="2"/>
        <text x="470" y="248" font-size="15" fill="#2563eb" font-weight="700">col(X)</text>
        <!-- 原点 -->
        <circle cx="190" cy="330" r="5.5" fill="#16202b"/>
        <text x="176" y="352" font-size="14" fill="#7b8a9e">0</text>
        <!-- y -->
        <line x1="190" y1="330" x2="330" y2="88" stroke="#dc2626" stroke-width="3" marker-end="url(#a6)"/>
        <text x="342" y="86" font-size="17" fill="#dc2626" font-weight="700">y</text>
        <!-- yhat -->
        <line x1="190" y1="330" x2="352" y2="268" stroke="#0d9488" stroke-width="3.4" marker-end="url(#a6)"/>
        <text x="358" y="292" font-size="17" fill="#0d9488" font-weight="700">ŷ = Xθ̂</text>
        <!-- 残差 -->
        <line x1="352" y1="268" x2="330" y2="88" stroke="#ea7317" stroke-width="3" stroke-dasharray="8 5" marker-end="url(#a6)"/>
        <text x="364" y="180" font-size="16" fill="#ea7317" font-weight="700">ε</text>
        <!-- 直角标记 -->
        <path d="M340,258 L352,272 L338,284" fill="none" stroke="#ea7317" stroke-width="2"/>
        <text x="330" y="408" font-size="13" fill="#7b8a9e" text-anchor="middle">残差 ε 与列空间正交 ⟹ 这就是“最短距离”</text>
      </svg>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>三句话读懂这张图</div>
        <ul style="font-size:16px">
          <li><b>y 通常在列空间外。</b>N 个方程、3 个未知数，超定，无精确解。</li>
          <li><b>最小二乘在列空间里找离 y 最近的点</b>——也就是 y 的<b>正交投影</b>。</li>
          <li><b>残差垂直于列空间。</b>所以“残差与每个回归量都正交”，这就是一阶必要条件。</li>
        </ul>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>投影矩阵</div>
        <div class="formula p1" style="font-size:17px">H = X(XᵀX)⁻¹Xᵀ&nbsp;&nbsp;，&nbsp;&nbsp;H² = H，Hᵀ = H</div>
        <p class="explain">式中 <span class="var">H</span> 为投影矩阵（帽矩阵）。
          它满足<b>幂等</b>（再投影一次不变）与<b>对称</b>——这正是一个投影算子的定义性质。</p>
      </div>
    </div>
  </div>`
},

/* ---------- 5.1 反解 ---------- */
{
  id: 'inverse', part: 'Part I', partKey: 'p1', title: '给定功率反解力矩',
  sub: '5.1 / 5.4 · 一个二次方程，两个根',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>把模型当成关于 I 的一元二次方程</div>
        <div class="formula p1" style="white-space:normal">
          k₁ I² + C_T ω I + ( k₂ ω² + a − P* ) = 0
        </div>
        <p class="explain">记成 <span class="var">A I² + B I + C = 0</span>，其中</p>
        <div class="formula p1" style="font-size:17px">
          A = k₁&nbsp;&nbsp;·&nbsp;&nbsp;B = C_T ω&nbsp;&nbsp;·&nbsp;&nbsp;C = k₂ω² + a − P*
        </div>
        <p class="explain">求根公式：</p>
        <div class="formula p1" style="font-size:18px">
          I = ( −C_T ω ± √Δ ) / ( 2 k₁ )&nbsp;&nbsp;，&nbsp;&nbsp;Δ = B² − 4AC
        </div>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>两个根都有物理意义</div>
        <p>负号那个根代表<b>回馈制动</b>（电机往反方向出力、把能量送回母线），
          不是“错误解”。所以选根必须按<b>原始指令的符号</b>来，不能一律取正。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>选根规则</div>
        <table class="tb" style="font-size:15px">
          <tr><th>情形</th><th>怎么取</th></tr>
          <tr><td>原指令 <b>&gt; 0</b></td><td>取 <span class="var">(−B+√Δ)/2k₁</span></td></tr>
          <tr><td>原指令 <b>&lt; 0</b></td><td>取 <span class="var">(−B−√Δ)/2k₁</span></td></tr>
          <tr><td>判别式 <b>&lt; 0</b></td><td>置 0（物理不可达）</td></tr>
          <tr><td>P* &lt; P₀(ω)</td><td>先钳位 <span class="var">P* ← max(P*, P₀)</span></td></tr>
        </table>
      </div>
      <div class="note"><b>判别式其实很少为负：</b>
        由 <span class="var">P_min(ω) ≈ 4.081 − 7.96×10⁻⁶ ω²</span> 可得，
        <b>ω &gt; 716 rpm 时 P_min &lt; 0</b>，判别式恒为非负。
        所以“判别式小于零就跳过”这个分支在正常行驶下几乎永远不触发——
        真正的风险在<b>根的正负号</b>。</div>
    </div>
  </div>`
},

/* ---------- 5.2 边界情形 ---------- */
{
  id: 'inverse-cases', part: 'Part I', partKey: 'p1', title: '反解的两类边界情形',
  sub: '5.6 · 最容易被忽略的两步',
  html: `<div class="row grow">
    <div class="col" style="flex:1.15">
      <div class="seg" style="margin-bottom:14px">
        <button data-c="normal" class="on">正常</button>
        <button data-c="low">情形 I：功率太低</button>
        <button data-c="neg">情形 II：无实根</button>
      </div>
      <div class="card p1 grow">
        <div class="card-title"><span class="dot"></span><span data-ctitle>正常情形</span></div>
        <div class="formula p1" style="font-size:16px;margin-bottom:12px" data-ccond>Δ ≥ 0</div>
        <div data-cbody></div>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>工程上真正会咬人的地方</div>
        <p style="font-size:17px">不是判别式，而是<b>“P* 低于空载损耗”时算出的负根</b>。
          它会让你给电机下发一个反向力矩——看起来像“莫名其妙的倒车”。</p>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>修法：一律先钳位</div>
        <div class="formula p1" style="font-size:17px">P* ← max( P*, P₀(ω) )</div>
        <p class="explain">其中 <span class="var">P₀(ω) = k₂ω² + a</span> 是该转速下的空载损耗。
          钳位之后再反解，就不会出现“要求电机反向出力”的荒谬结果。</p>
        <div class="okbox" style="margin-top:10px">代价是：此时实际功率会<b>略高于</b>目标。
          这是必要的妥协——物理上做不到更低。</div>
      </div>
    </div>
  </div>`
},

/* ---------- 6.1 再分配 ---------- */
{
  id: 'redistribute', part: 'Part I', partKey: 'p1', title: '多电机功率再分配',
  sub: '6.3 / 6.5 · 一个系数解决四路',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>核心：缩放的是功率，不是指令</div>
        <ol class="steps" style="font-size:16px">
          <li><b>先正向算。</b>对四路指令分别用模型估功率
              <span class="var">P̂ᵢ</span>，求和得 <span class="var">P_tot</span>。</li>
          <li><b>算缩放系数。</b><span class="var">k = P_lim / P_tot</span>（若 <span class="var">P_tot ≤ P_lim</span> 则不干预）。</li>
          <li><b>按功率比例分配。</b><span class="var">Pᵢ* = k · P̂ᵢ</span>。</li>
          <li><b>反解。</b><span class="var">I_cmd,i′ = f⁻¹(Pᵢ*, ωᵢ)</span>。</li>
        </ol>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>负功率电机：一个容易写错的细节</div>
        <p style="font-size:16px">正在<b>回馈制动</b>的电机 <span class="var">P̂ᵢ &lt; 0</span>，
          它其实在<b>往母线送电</b>。这时候不该跟着缩放，而应保持原指令不变——
          否则会把“发电”缩成“耗电”，白白浪费制动能量。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat grow" style="padding:14px">
        <svg viewBox="0 0 480 340" style="width:100%">
          <g fill="#fff" stroke="#c7d2e0" stroke-width="2">
            <rect x="90" y="8" width="300" height="46" rx="9"/>
            <rect x="90" y="92" width="300" height="46" rx="9"/>
            <rect x="90" y="176" width="300" height="46" rx="9" fill="#e8efff" stroke="#2563eb"/>
            <rect x="90" y="260" width="300" height="46" rx="9" fill="#e0f5f2" stroke="#0d9488"/>
          </g>
          <g class="lbl-sm" text-anchor="middle" fill="#16202b">
            <text x="240" y="36">① 正向：P̂ᵢ = f(I_cmd,i, ωᵢ) ，P_tot = Σ P̂ᵢ</text>
            <text x="240" y="120">② 判据：P_tot &gt; P_lim ？否则不干预</text>
            <text x="240" y="204">③ 缩放：k = P_lim / P_tot ，Pᵢ* = k·P̂ᵢ</text>
            <text x="240" y="288">④ 反解：I_cmd,i′ = f⁻¹(Pᵢ*, ωᵢ)</text>
          </g>
          <g stroke="#2563eb" stroke-width="2.4" fill="none" marker-end="url(#a7)">
            <path d="M240,54 V90"/><path d="M240,138 V174"/><path d="M240,222 V258"/>
          </g>
        </svg>
      </div>
      <div class="note"><b>关键设计：</b>正向计算时<b>保留功率符号</b>。
        负值代表回馈制动，这一信息必须一路带到第 ③ 步，否则负功率电机会被误缩放。</div>
    </div>
  </div>`
},

/* ---------- 6.2 三方案对比 ---------- */
{
  id: 'alloc-compare', part: 'Part I', partKey: 'p1', title: '三种分配方案对比',
  sub: '6.6 · 为什么最终选方案三',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="seg" style="margin-bottom:14px">
        <button data-a="a" class="on">方案一 均分</button>
        <button data-a="b">方案二 统一缩放</button>
        <button data-a="c">方案三 功率再分配</button>
      </div>
      <div class="card p1 grow">
        <div class="card-title"><span class="dot"></span><span data-atitle>方案一：功率均分</span></div>
        <div data-abody></div>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>一张表看懂差别</div>
        <table class="tb" style="font-size:15px">
          <tr><th>方案</th><th>方向性</th><th>预算利用率</th><th>实现难度</th></tr>
          <tr><td>① 均分</td><td style="color:#dc2626">差（正反馈）</td><td style="color:#dc2626">低</td><td>低</td></tr>
          <tr><td>② 统一缩放</td><td style="color:#16a34a">好</td><td style="color:#b45309">中</td><td>低</td></tr>
          <tr><td><b>③ 功率再分配</b></td><td style="color:#16a34a">好</td><td style="color:#16a34a">高</td><td>中</td></tr>
        </table>
      </div>
      <div class="okbox"><b>核心区别：</b>方案三缩放的是<b>功率</b>，所以“缩 k 倍就真的用 k 倍功率”；
        方案二缩放的是<b>指令</b>，与功率之间没有线性关系。</div>
    </div>
  </div>`
},

/* ---------- 7.1 缓冲能量闭环 ---------- */
{
  id: 'buffer-loop', part: 'Part I', partKey: 'p1', title: '缓冲能量闭环：兜底与极性',
  sub: '7.3 / 7.4 · 一个符号写反就成正反馈',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>闭环结构</div>
        <div class="formula p1" style="white-space:normal;font-size:17px">
          e = E_buf* − E_buf&nbsp;&nbsp;→&nbsp;&nbsp;u = K_p e + K_i ∫e dt
        </div>
        <div class="formula p1" style="white-space:normal;font-size:17px;margin-top:8px">
          P_lim = P_max − u
        </div>
        <p class="explain">式中 <span class="var">E_buf*</span> 为设定值（常见取 30 J）；
          <span class="var">u</span> 为 PID 输出；<span class="var">P_lim</span> 为本周期功率预算。</p>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>极性判据：必须核对</div>
        <p style="font-size:17px">要让闭环稳定，必须满足
          <span class="var">∂P_lim / ∂E_buf &gt; 0</span>。</p>
        <p style="font-size:16px;margin-top:8px">直白说：<b>缓冲能量越低，功率预算必须越小</b>——
          两者同向变化。写反了就成了正反馈，一超再超，直接断电。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat grow" style="padding:14px">
        <svg viewBox="0 0 520 260" style="width:100%">
          <text class="lbl-sm" x="130" y="18" fill="#47566a">软件部分（虚线内）</text>
          <rect x="10" y="26" width="500" height="120" rx="12" fill="none" stroke="#94a3b8" stroke-dasharray="8 6"/>
          <g fill="#fff" stroke="#c7d2e0" stroke-width="2">
            <circle cx="96" cy="86" r="17"/>
            <rect x="150" y="62" width="96" height="48" rx="9"/>
            <circle cx="286" cy="86" r="17"/>
            <rect x="336" y="62" width="120" height="48" rx="9"/>
          </g>
          <g class="lbl-sm" text-anchor="middle" fill="#16202b">
            <text x="96" y="92" font-size="19">+</text>
            <text x="150" y="16" fill="#16202b" font-size="0"></text>
            <text x="198" y="84">PID(t)</text><text x="198" y="102" font-size="11" fill="#7b8a9e">缓冲能量外环</text>
            <text x="286" y="92" font-size="19">−</text>
            <text x="396" y="84">功率再分配</text><text x="396" y="102" font-size="11" fill="#7b8a9e">→ I_cmd → 电机</text>
          </g>
          <text class="lbl-sm" x="60" y="80" text-anchor="middle" fill="#2563eb">E_buf*</text>
          <g stroke="#47566a" stroke-width="2" fill="none" marker-end="url(#a8)">
            <path d="M62,86 H77"/><path d="M113,86 H148"/><path d="M246,86 H267"/>
            <path d="M303,86 H334"/><path d="M456,86 H486"/>
          </g>
          <path d="M486,86 V196 H96 V106" stroke="#0d9488" stroke-width="2" fill="none" stroke-dasharray="7 5" marker-end="url(#a8)"/>
          <text class="lbl-sm" x="300" y="216" fill="#0d9488" text-anchor="middle">E_buf 实测反馈</text>
          <text class="lbl-sm" x="300" y="240" fill="#dc2626" text-anchor="middle" font-size="13">
            P_lim = P_max − u ⟹ ∂P_lim/∂E_buf &gt; 0
          </text>
        </svg>
      </div>
      <div class="note"><b>定位：</b>模型准的时候，缓冲能量几乎不动；
        它真正的作用是<b>兜底</b>——模型偏了、参数漂了、场地换了，外环还能把状态拉回来。</div>
    </div>
  </div>`
},

/* ---------- 7.2 2025 规则变化 ---------- */
{
  id: 'rule-2025', part: 'Part I', partKey: 'p1', title: '2025 赛季的两条规则变化',
  sub: '7.2 · 直接动摇了“纯缓冲能量闭环”的根基',
  html: `<div class="col grow" style="justify-content:center;gap:18px">
    <div class="row">
      <div class="card warn grow">
        <div class="card-title"><span class="dot"></span>变化一：裁判系统删除了 Chassis 功率反馈</div>
        <p style="font-size:18px">2025 赛季起，<b>参赛队伍必须自行检测底盘功率</b>来完成功率闭环。</p>
        <p style="font-size:16px;margin-top:10px;color:var(--ink-3)">
          这正是超电控制板要把功率回读做准、并专门做<b>远端补偿</b>的原因。</p>
      </div>
      <div class="card warn grow">
        <div class="card-title"><span class="dot"></span>变化二：缓冲能量耗尽从“扣血”改为“底盘断电”</div>
        <p style="font-size:18px">以往缓冲能量耗尽只是扣血，现在<b>直接断电</b>。</p>
        <p style="font-size:16px;margin-top:10px;color:var(--ink-3)">
          这意味着“基于缓冲能量的功率控制算法”的<b>容错率大幅降低</b>。</p>
      </div>
    </div>
    <div class="warnbox" style="font-size:18px">
      <b>使用手册原话：</b>「不建议使用这种算法来进行底盘功率控制。」
    </div>
    <div class="okbox" style="font-size:17px">
      <b>所以本节描述的缓冲能量闭环，今天更合适的定位是「兜底与保护」，
      而不是主要的功率分配手段。</b>主要手段应当是功率模型 + 功率再分配。
      另外记住：<b>60 J 的缓冲能量不等于可以超 60 W</b>——超 10 W 能用 6 s，超 60 W 只能用 1 s。
    </div>
  </div>`
},

/* ---------- 8. 代码实现 ---------- */
{
  id: 'code-impl', part: 'Part I', partKey: 'p1', title: '代码实现的几个要点',
  sub: '8.2 / 8.3 · 三个容易写错的地方',
  html: `<div class="row grow">
    <div class="col" style="flex:1.05">
      <pre class="code"><span class="c">// 主循环：每 1 ms 一次</span>
<span class="k">void</span> chassis_power_loop(<span class="k">void</span>) {
    <span class="c">// ① 读电调回读</span>
    <span class="k">for</span> (i=<span class="n">0</span>; i&lt;<span class="n">4</span>; i++)
        w[i] = get_rotor_rpm(i);

    <span class="c">// ② 正向预测四路功率</span>
    P_tot = <span class="n">0</span>;
    <span class="k">for</span> (i=<span class="n">0</span>; i&lt;<span class="n">4</span>; i++) {
        P[i] = k1*I[i]*I[i]
             + CT*I[i]*w[i]
             + k2*w[i]*w[i] + a;
        P_tot += P[i];        <span class="c">// 保留符号</span>
    }

    <span class="c">// ③ 超了才缩放</span>
    <span class="k">if</span> (P_tot &gt; P_lim) k = P_lim / P_tot;
    <span class="k">else</span> k = <span class="n">1.0f</span>;

    <span class="c">// ④ 反解 + 限幅</span>
    <span class="k">for</span> (i=<span class="n">0</span>; i&lt;<span class="n">4</span>; i++) {
        Ps = k * P[i];
        <span class="k">if</span> (P[i] &lt; <span class="n">0</span>) {       <span class="c">// 回馈制动不缩</span>
            I_out[i] = I[i];
            <span class="k">continue</span>;
        }
        I_out[i] = inverse(Ps, w[i]);
    }
}</pre>
    </div>
    <div class="col" style="flex:1">
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>坑一：忘了保留功率符号</div>
        <p style="font-size:16px">正向计算时如果取了绝对值，回馈制动的那一路会被当成“耗电”，
          结果被缩放到接近 0——白白浪费掉本可以回收的制动能量。</p>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>坑二：反解前忘了钳位</div>
        <p style="font-size:16px">没做 <span class="var">P* ← max(P*, P₀)</span>，
          低功率目标会解出负指令，力矩方向被翻转。</p>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>坑三：限幅放在反解之后</div>
        <p style="font-size:16px">限幅必须<b>最后</b>做（限到 ±16384）。
          如果先限幅再反解，反解出来的值可能又超限。</p>
      </div>
      <div class="note"><b>浮点开销可忽略：</b>1 kHz 下每周期只有十几次乘加，
        STM32F4/G4 带 FPU，完全够用。</div>
    </div>
  </div>`
},

/* ---------- 9. 标定与排查 ---------- */
{
  id: 'calibration', part: 'Part I', partKey: 'p1', title: '标定与故障排查',
  sub: '9.3 / 9.4 · 怎么确认模型是准的',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>标定流程</div>
        <ol class="steps" style="font-size:16px">
          <li><b>标电流采样量程。</b>选一个能覆盖峰值的大功率电阻 + 高边采样</li>
          <li><b>喂正弦力矩指令。</b>幅值扫过整个量程，同时记录 ω 与 I_cmd</li>
          <li><b>算损耗功率。</b>实测输入功率减去已知机械功率，得到 y</li>
          <li><b>最小二乘拟合。</b>解 3×3 正规方程，得到 k₁、k₂、a</li>
          <li><b>物理自检。</b>k₁ 应能反解出合理的等效电阻</li>
        </ol>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>验证方法</div>
        <p style="font-size:17px">用<b>没参与拟合</b>的数据做交叉验证；再画“允许控制量上限—转速”曲线，
          与理论包络对照。</p>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>常见故障速查</div>
        <table class="tb" style="font-size:15px">
          <tr><th>现象</th><th>先查什么</th></tr>
          <tr><td>起步无力、加速慢</td><td>还在用固定力矩阈值；或 k₁、k₂ 偏大</td></tr>
          <tr><td>走不直、行进中偏航</td><td>分配破坏了各轮相对关系；或四台参数不一致</td></tr>
          <tr><td>持续超功率</td><td>模型参数偏小；或反解没做钳位</td></tr>
          <tr><td>猛转头就断电</td><td>缓冲能量耗尽——纯能量闭环的典型失效</td></tr>
        </table>
      </div>
      <div class="note"><b>调试顺序：</b>先确认采样准 → 再确认模型准 → 最后才动控制参数。
        顺序反了会浪费大量时间。</div>
    </div>
  </div>`
},

/* ================================================================
   Part II
   ================================================================ */
{
  id: 'p2-divider', part: 'Part II', partKey: 'p2', title: '超级电容', cls: 'divider',
  html: `<div class="big-num">II</div>
    <h2>超级电容</h2>
    <p>四开关 Buck-Boost 的四个管子怎么开、怎么关；<br>能量怎么存进去、怎么放出来。</p>`
},

/* ---------- 11.1 为什么需要超电 ---------- */
{
  id: 'sc-why', part: 'Part II', partKey: 'p2', title: '为什么需要超级电容',
  sub: '11.1 · 把“超出去的功率”临时存起来',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>规则的约束是<em>平均</em>，不是<em>瞬时</em></div>
        <p>底盘功率上限约束的是<b>电池侧</b>的取用功率。而底盘在起步、猛打方向时需要远超平均值的功率。</p>
        <div class="formula p2" style="margin-top:10px">P_chassis = P_motor − P_discharge</div>
        <p class="explain">只要在爆发时让 <span class="var">P_discharge</span> 顶上一部分，
          电池侧就永远不会超限——<b>这就是超电的全部价值</b>。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>它解决的是“两个时间尺度”的矛盾</div>
        <p style="font-size:17px">电机要的是<b>毫秒级</b>的功率突变；裁判系统算的是<b>百毫秒级</b>的平均。
          超电正好卡在这两个尺度之间做缓冲。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat grow" style="padding:14px">
        <svg viewBox="0 0 520 300" style="width:100%">
          <path class="axis" d="M46,250 H500"/>
          <path class="axis" d="M46,30 V250"/>
          <text class="lbl-sm" x="40" y="36" text-anchor="end">P</text>
          <!-- 电机需求 -->
          <path d="M60,240 C110,236 130,80 180,76 C230,72 250,230 300,234 C350,238 370,90 420,86 C470,82 480,236 500,240"
                fill="none" stroke="#ea7317" stroke-width="3.2"/>
          <!-- 电池限制 -->
          <line x1="46" y1="150" x2="500" y2="150" stroke="#dc2626" stroke-width="2.4" stroke-dasharray="8 5"/>
          <text class="lbl-sm" x="496" y="142" text-anchor="end" fill="#dc2626">P_max</text>
          <!-- 电池实际 -->
          <path d="M60,200 H160 C200,160 220,150 260,150 H330 C350,150 370,170 400,150 H500"
                fill="none" stroke="#0d9488" stroke-width="3.2"/>
          <!-- 超电补偿区 -->
          <path d="M140,110 C170,84 200,86 215,150 L215,150 C200,90 170,100 140,150 Z" fill="rgba(13,148,136,.18)"/>
          <text x="128" y="72" class="lbl-sm" fill="#ea7317">电机实际需求</text>
          <text x="330" y="142" class="lbl-sm" fill="#dc2626">电池侧上限</text>
          <text x="330" y="182" class="lbl-sm" fill="#0d9488">电池侧实际（被削平）</text>
          <text x="150" y="212" class="lbl-sm" fill="#0d9488" font-size="12">超电补这里</text>
        </svg>
      </div>
      <div class="okbox">电容负责<b>削峰填谷</b>：爆发时放电顶住，平稳时充电补回。
        规则允许的能量上限约 <b>2000 J</b>。</div>
    </div>
  </div>`
},

/* ---------- 11.2 系统构成 ---------- */
{
  id: 'sc-layers', part: 'Part II', partKey: 'p2', title: '系统构成：四层分工',
  sub: '11.2 · 硬件上是什么',
  html: `<div class="col grow" style="justify-content:center;gap:14px">
    <div class="row">
      <div class="card p2 grow"><div class="card-title"><span class="dot"></span>① 电容组</div>
        <p class="tiny" style="font-size:16px">若干单体串并联。串联提升耐压，并联降低等效串联电阻（ESR）。
          单体之间必须<b>均衡</b>，否则个别单体过压会迅速失效。</p></div>
      <div class="card p2 grow"><div class="card-title"><span class="dot"></span>② 双向 DC–DC</div>
        <p class="tiny" style="font-size:16px">负责在电池母线与电容组之间双向传递能量。
          常见拓扑：同步 Buck/Boost、四开关 Buck-Boost（FSBB）、双并联式。
          后者在体积、效率与控制难度上各有取舍。</p></div>
    </div>
    <div class="row">
      <div class="card p2 grow"><div class="card-title"><span class="dot"></span>③ 超电控制器</div>
        <p class="tiny" style="font-size:16px">采样母线电压电流与电容电压电流，运行<b>内层控制环</b>，
          并通过 CAN 与主控通信。</p></div>
      <div class="card p2 grow"><div class="card-title"><span class="dot"></span>④ 主控侧接口</div>
        <p class="tiny" style="font-size:16px">把“本周期底盘计划从电池取多少功率”这一<b>意图</b>告知超电控制器；
          超电自己决定怎么充、怎么放。</p></div>
    </div>
    <div class="note"><b>职责划分是最关键的设计决策：</b>
      主控只管一件事——<b>下发动机率目标</b>。具体的充放电策略、电量保护、模式切换，
      全在超电控制器内部完成。这样主控的代码保持在 1 kHz 的简单循环里，不必去管电容状态。</div>
  </div>`
},

/* ---------- 11.3 能量与电压 ---------- */
{
  id: 'sc-energy', part: 'Part II', partKey: 'p2', title: '能量与电压：为什么电压窗口这么重要',
  sub: '11.3 · E = ½CU²',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>电容储能</div>
        <div class="formula p2" style="font-size:24px">E = ½ C U²</div>
        <p class="explain" style="margin-top:10px">式中 <span class="var">E</span> 为储能（J）；
          <span class="var">C</span> 为电容（F）；<span class="var">U</span> 为两端电压（V）。</p>
        <div class="note" style="margin-top:12px"><b>注意：</b>这里的 C 与 Part I 里“力矩电流系数”的 C
          <b>只是字母相同，含义无关</b>。</div>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>可用能量的比例</div>
        <div class="formula p2" style="font-size:18px">E_usable / E_max = 1 − (U_min/U_max)²</div>
        <p class="explain">放电到 <b>一半电压</b>时，放出的能量是 <b>3/4</b>——
          <b>一半的电压窗口里藏着四分之三的能量</b>。这是电容储能的基本特征。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat grow" style="padding:14px">
        <svg viewBox="0 0 480 320" style="width:100%">
          <path class="axis" d="M56,270 H450"/>
          <path class="axis" d="M56,40 V270"/>
          <text class="lbl-sm" x="50" y="46" text-anchor="end">E</text>
          <text class="lbl-sm" x="440" y="294" text-anchor="end">U</text>
          <path d="M56,270 Q240,270 420,70" fill="none" stroke="#0d9488" stroke-width="3.6"/>
          <!-- 50% 电压处 -->
          <line x1="238" y1="270" x2="238" y2="190" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 5"/>
          <line x1="56" y1="190" x2="238" y2="190" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 5"/>
          <circle cx="238" cy="190" r="6" fill="#dc2626"/>
          <text x="248" y="186" class="lbl-sm" fill="#dc2626">U_max/2 → 还剩 3/4 能量</text>
          <text x="90" y="90" class="lbl-sm" fill="#0d9488">E ∝ U²</text>
          <text x="60" y="60" class="lbl-sm" fill="#7b8a9e" font-size="12">平方关系</text>
        </svg>
      </div>
      <div class="warnbox"><b>实际后果：</b>如果放电压到一半就停，你只用到了 75% 的能量；
        如果把下限设得太高（怕欠压），可用能量会进一步缩水。<b>电压窗口是选型的核心指标。</b></div>
    </div>
  </div>`
},

/* ---------- 12.1 三种基本变换器 ---------- */
{
  id: 'converters', part: 'Part II', partKey: 'p2', title: '三种基本变换器',
  sub: '12.1 · Buck / Boost / Buck-Boost',
  html: `<div class="col grow" style="justify-content:center;gap:16px">
    <div class="row">
      <div class="card p2 grow">
        <div class="card-title"><span class="dot"></span>Buck（降压）</div>
        <div class="formula p2" style="font-size:19px">U_out = D · U_in</div>
        <p class="explain">输出永远 ≤ 输入。开关管导通时储能，关断时经续流管释放。</p>
      </div>
      <div class="card p2 grow">
        <div class="card-title"><span class="dot"></span>Boost（升压）</div>
        <div class="formula p2" style="font-size:19px">U_out = U_in / (1 − D)</div>
        <p class="explain">输出永远 ≥ 输入。开关管导通时把电感短路储能，关断时电感叠加上电源一起输出。</p>
      </div>
      <div class="card p2 grow">
        <div class="card-title"><span class="dot"></span>Buck-Boost（升降压）</div>
        <div class="formula p2" style="font-size:19px">U_out = −D·U_in / (1−D)</div>
        <p class="explain">输出可高可低，但<b>极性反相</b>——这是它不方便的地方。</p>
      </div>
    </div>
    <div class="card p2">
      <div class="card-title"><span class="dot"></span>超电为什么要用“四开关”</div>
      <p>超电两侧电压关系是<b>会变的</b>：电容从 0 V 充到 21 V（或 30 V），
        有时要降压充、有时要升压放，有时两侧电压几乎相等。
        单一 Buck 或单一 Boost 都覆盖不了这个范围，
        而反相 Buck-Boost 的负输出又不便使用。</p>
      <div class="okbox" style="margin-top:12px"><b>四开关 Buck-Boost（FSBB）</b>用两个半桥 + 一个电感，
        不反相，且能<b>在升降压之间平滑切换</b>——这就是超电控制板的选择。</div>
    </div>
  </div>`
},

/* ---------- 12.2 Buck 动画 ---------- */
{
  id: 'buck-anim', part: 'Part II', partKey: 'p2', title: 'Buck 工作原理：看电流怎么走',
  sub: '12.1.1 · 四个管子里，右边两个是“固定”的',
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
    电路退化为同步 Buck。所以真正在“开关”的只有 <b>S₁ 与 S₂</b>（互补）——
    这就是为什么后面说“四种模式的区别只有一对管子”。</div>`
},

/* ---------- 12.3 Boost 动画 ---------- */
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
  <div class="note" style="flex:0 0 auto"><b>S₁ 常通、S₂ 常断</b> → 左半桥被短路成导线，电路退化为同步 Boost。
    注意储能相：<b>S₄ 导通时其实是把电感短路</b>，电感在这段时间里攒能量，
    之后 S₃ 导通才把“电源 + 电感”叠起来送给输出。</div>`
},

/* ---------- 12.4 四模式 ---------- */
{
  id: 'four-modes', part: 'Part II', partKey: 'p2', title: '四种工作模式：区别只有“哪一对管子在工作”',
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
    <b>过渡模式</b>只在两侧电压接近时短暂经过——此时单靠 Buck 或 Boost，占空比都要跑到 0% 或 100% 的极端值，
    开关管无法工作。<b>直通模式</b>用于电容耗尽或模块故障时旁路，此时超电等于不存在。
  </div>`
},

/* ---------- 12.5 纹波计算器 ---------- */
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
        <p class="explain">式中 <span class="var">ΔI_L</span> 为电感电流峰峰值（A）；
          <span class="var">U₂</span> 为两侧电压中较高的那个（V）；
          <span class="var">D</span> 为占空比（无量纲）；<span class="var">L</span> 为电感量（H）；
          <span class="var">f_sw</span> 为开关频率（Hz）。</p>
        <div class="note" style="margin-top:12px"><b>记住：</b>D(1−D) 在 D=0.5 时取最大值 1/4。
          所以<b>占空比一半时纹波最大</b>，设计要按这个最坏情况留裕量。</div>
      </div>
      <div class="card p2 grow">
        <div class="card-title"><span class="dot"></span>解出所需最小电感</div>
        <div class="formula p2" style="font-size:18px">
          L_min = U₂ / ( 4 · ΔI_L · f_sw )
        </div>
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

/* ---------- 12.6 死区 ---------- */
{
  id: 'deadtime', part: 'Part II', partKey: 'p2', title: '死区：半桥设计里唯一不能省的东西',
  sub: '12.4 · 上下管同时导通 = 短路',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么必须有死区</div>
        <p>半桥的上下两只管子<b>绝不能同时导通</b>：那等于把母线电压直接短路，
          瞬间电流只受几毫欧的回路电阻限制——<b>结果一定是炸管</b>。</p>
        <p style="margin-top:10px">所以必须在两只管子都关断时插入一段<b>死区时间</b>
          <span class="var">t_d</span>，让它们有一个“都关”的窗口。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>死区的两难</div>
        <ul style="font-size:16px">
          <li><b>太长</b> → 电流只能经下管体二极管续流，压降大、损耗高</li>
          <li><b>太短</b> → 开关管关断有延迟，可能直通</li>
          <li>典型取值：<b>几十纳秒到几百纳秒</b></li>
        </ul>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat" style="padding:14px">
        <svg viewBox="0 0 520 300" style="width:100%">
          <!-- 死区底色 -->
          <rect x="212" y="26" width="30" height="230" fill="rgba(220,38,38,.12)"/>
          <rect x="392" y="26" width="30" height="230" fill="rgba(220,38,38,.12)"/>
          <!-- 上管 -->
          <text class="lbl-sm" x="10" y="80">V_gs,H</text>
          <path d="M46,96 H212 V56 H242 V96 H362 V56 H392 V96 H500"
                fill="none" stroke="#3b82f6" stroke-width="3"/>
          <!-- 下管 -->
          <text class="lbl-sm" x="10" y="196">V_gs,L</text>
          <path d="M46,212 H46 V212 H242 V212 H242 V172 H362 V212 H392 V172 H500"
                fill="none" stroke="#16a34a" stroke-width="3"/>
          <path d="M46,212 H242 V172 H362 V212 H392 V172 H500" fill="none" stroke="#16a34a" stroke-width="3"/>
          <text x="227" y="46" font-size="12" fill="#dc2626" text-anchor="middle" font-weight="700">死区</text>
          <text x="407" y="46" font-size="12" fill="#dc2626" text-anchor="middle" font-weight="700">死区</text>
          <text x="260" y="286" font-size="12" fill="#7b8a9e" text-anchor="middle">
            死区期间两管都关断，电流经下管体二极管续流
          </text>
        </svg>
      </div>
      <div class="warnbox"><b>体二极管还有另一个坑——“僵尸车”：</b>
        机器人断电后，电容组会经 MOSFET 的体二极管倒灌回母线，
        让车“诈尸”。所以必须加一只 <b>PMOS</b> 做彻底切断。</div>
    </div>
  </div>`
},

/* ---------- 12.7 采样 ---------- */
{
  id: 'sampling', part: 'Part II', partKey: 'p2', title: '采样链路：四个量，四种做法',
  sub: '12.5 · 为什么把电容电流采样换成“下管续流”',
  html: `<div class="row grow">
    <div class="col" style="flex:1.15">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>要测的四个量</div>
        <table class="tb" style="font-size:15px">
          <tr><th>被测量</th><th>器件</th><th>方式</th></tr>
          <tr><td>U₁ 电池端口电压</td><td>STM32G4 内部运放</td><td>分压 + <b>远端补偿</b></td></tr>
          <tr><td>U₂ 电容电压</td><td>同上</td><td>分压</td></tr>
          <tr><td>I₁ 电池端口电流</td><td><b>INA139</b></td><td>高侧采样</td></tr>
          <tr><td>I_L 超电支路电流</td><td><b>TLV9061</b></td><td><b>下管续流采样</b></td></tr>
        </table>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么不用 INA181 了</div>
        <p style="font-size:16px">Lite 版用电容支路串分流电阻 + INA181。28 V 耐压对 21 V 电容组本有冗余，
          但仍会<b>偶尔烧毁</b>（推测是上电尖峰或热插拔浪涌）。更麻烦的是失效后果：
          烧掉之后代码改一改还能跑，但<b>再也测不到底盘真实功率</b>。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>下管续流采样的取舍</div>
        <p style="font-size:16px"><b>好处：</b>① 成本更低；② <b>没有共模电压的担忧</b>——
          采样点取在下管源极与地之间，共模几乎为零。</p>
        <p style="font-size:16px;margin-top:8px"><b>代价：</b>下管开通时间过短时误差变大。
          实测：<b>下管 10% 占空比、10 A 负载时约 2 A 误差</b>（空载约 0.2 A）。</p>
      </div>
      <div class="okbox"><b>为什么可以接受：</b>下管占空比小只发生在“压降很小”时。
        以 21 V 电容组为例，下管占空比 10% 对应最低输入约 23.3 V，
        此时电池电量本身也低了；且软件限制了下管最小占空比。</div>
      <div class="note"><b>概念上更重要：</b>这个下管电流只负责<b>超电充放电支路</b>的功率与限流；
        底盘运行功率是由它与<b>电池端口功率</b>运算得到的。
        <b>只要保证电池端口功率准，就能避免超功率</b>——这就是为什么精度预算放在 U₁ 与 I₁ 上。</div>
    </div>
  </div>`
},

/* ---------- 12.8 远端补偿 ---------- */
{
  id: 'remote-sense', part: 'Part II', partKey: 'p2', title: '远端补偿：把电压采样点搬到裁判系统那一端',
  sub: '12.6 · Plus 相对 Lite 最有价值的改进',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>问题：导线压降让回读功率偏小</div>
        <div class="formula p2">V_drop = I · R</div>
        <p class="explain">控制板测的是<b>自己电池端口</b>的电压；裁判系统测的是<b>电源管理模块 Chassis 端口</b>的电压。
          两点之间隔着导线，大电流流过时会有压降。于是控制板按偏低的电压算功率，
          <b>算出来的功率就偏小</b>。</p>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>为什么“偏小”很危险</div>
        <p style="font-size:16px">设上限 100 W、回读偏小 5 W。你设 100 W，实际也跑了 100 W，
          但回读只有 95 W → 代码认为“还没到” → 继续加到 105 W → <b>小幅超功率</b>。
          若缓冲能量已很低，就可能断电。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>做法与两个关键细节</div>
        <p style="font-size:16px">用 MMCX 转 SMA 同轴线，把 Chassis 端口电压引回控制板。</p>
        <ul style="font-size:16px">
          <li><b>必须用全差分放大器。</b>否则输出以板 GND 做差，<b>负极导线的线损补不了</b>。
              Plus 用的是 STM32G4 内部运放。</li>
          <li><b>MMCX/SMA 外壳不属于 GND</b>，不能碰任何金属，否则引入误差；不用时悬空即可。</li>
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
      <div class="note">剩下的误差来源是“参考源不同”——控制板自己用四位半万用表校准过，
        绝对精度够；但与裁判系统的<b>相对一致性</b>只能相信其出厂校准。</div>
    </div>
  </div>`
},

/* ---------- 12.9 硬件保护 ---------- */
{
  id: 'protection', part: 'Part II', partKey: 'p2', title: '硬件保护：Plus 相对 Lite 的核心增量',
  sub: '12.7 · 四道防线',
  html: `<div class="row grow" style="align-items:stretch">
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>① 电源浪涌保护</div>
      <p style="font-size:15px">电池端口与电容端口都加 SMC 封装 TVS，削减热插拔尖峰。
        辅助电源前另加“自恢复保险丝 + 限流电阻 + 小功率 TVS”——
        因为 MLCC 阻抗极低，上电瞬间浪涌很大，可能烧掉设计余量不足的 DCDC。</p>
      <div class="card-title" style="margin-top:18px"><span class="dot"></span>② ESD 保护</div>
      <p style="font-size:15px">Lite 版把 INA181 的 REF 引脚与 MCU 运放输出脚直连，
        该脚要承受较大共模电压，已出现过烧毁。Plus 把<b>凡是与功率线路直接或间接相连的引脚都加了 ESD</b>。</p>
    </div>
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>③ 保险丝与熔断检测</div>
      <p style="font-size:15px">选 <b>5A 慢断</b>：插件封装便于更换；熔断曲线更接近裁判系统的保护曲线。
        即使以 10 A（240 W）放电也只持续 5 s 左右，不会熔断。</p>
      <p style="font-size:15px;margin-top:8px">检测原理：测保险丝两侧压差。最常见熔断原因是<b>半桥 MOS 烧毁导致对地短路</b>，
        短路电流熔断保险丝 → 升压侧与电容侧都被拉地 → 检测脚变 0 → 触发保护。
        正常时该脚高于 0.7 V_DD 判为高，对应电池端口约 13 V 以上——
        而 13 V 恰是控制板能运行的最低极限电压，所以<b>不会误触发</b>。</p>
    </div>
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>④ PMOS 与 PWM 时序延迟保护</div>
      <p style="font-size:15px">必须保证 <b>PMOS 永远在 PWM 输出之前导通、在 PWM 停止之后关断</b>。</p>
      <ul style="font-size:15px">
        <li><b>Buck（充）</b>：PMOS 通不通影响不大，只是损耗大些</li>
        <li><b>Boost（放）</b>：若 PMOS 没导通，而“电感电流不能突变”，
            电流无处可去，会在 PMOS 前面产生<b>电压尖峰</b>，可能同时击穿 PMOS 与半桥 MOS</li>
      </ul>
      <p style="font-size:15px;margin-top:8px">实现：用与门、或门搭延迟电路，输入 ENABLE，
        输出分别控制定时器的 <b>BREAK</b> 与 PMOS 栅极。软件也做了同样的时序控制，
        但作者更相信硬件。</p>
    </div>
  </div>
  <div class="warnbox" style="flex:0 0 auto"><b>一句话：</b>软件保护是“尽量不出事”，硬件保护是“出事了也别炸”。
    两者不是替代关系。</div>`
},

/* ---------- 12.10 电容组 ---------- */
{
  id: 'capbank', part: 'Part II', partKey: 'p2', title: '电容组与均衡',
  sub: '12.8 · 两套数字别搞混',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>两套配置要分清</div>
        <table class="tb" style="font-size:15px">
          <tr><th></th><th>官方配套</th><th>本文复刻</th></tr>
          <tr><td>结构</td><td>7 串 3V/60F</td><td><b>10 串</b>，每串 34F ∥ 10F</td></tr>
          <tr><td>电压</td><td>21 V</td><td><b>30 V</b></td></tr>
          <tr><td>电容</td><td>8.57 F</td><td><b>4.4 F</b></td></tr>
          <tr><td>内阻</td><td>—</td><td><b>≈ 271 mΩ</b></td></tr>
          <tr><td>储能</td><td>1890 J</td><td><b>1980 J</b></td></tr>
        </table>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>“1980 J”这个名字怎么来的</div>
        <div class="formula p2" style="font-size:17px">
          E = ½ × C × U² = ½ × 4.4 × 30² = 1980 J
        </div>
        <p class="explain">C = 44/10 = 4.4 F；U = 10 × 3.0 = 30 V；
          ESR = 10 × (68mΩ ∥ 45mΩ) ≈ 271 mΩ。</p>
        <div class="warnbox" style="margin-top:12px"><b>必须核对的一处：</b>
          控制板手册标的电容侧电压范围是 <b>1~21 V</b>，而本电容组最高 30 V。
          直接搭配会在 21 V 就停止充电，实际可用能量只有约 <b>970 J</b>，
          不到标称值一半。要么改串联数，要么放宽固件阈值——<b>必须实测确认</b>。</div>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>均衡为什么必须有</div>
        <p style="font-size:15px">串联的单体容量、漏电流不可能完全一致。充电时容量小的先到顶，
          若不管它就会<b>过压失效</b>。被动均衡用一个电阻把多的能量泄放掉
          （如 BW6103，泄放电流约 200 mA），代价是发热与效率。</p>
      </div>
    </div>
  </div>`
},

/* ---------- 12.11 接线 ---------- */
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
          <text x="366" y="152">超电控制板 Plus</text><text x="366" y="172" fill="#7b8a9e">本文复刻对象</text>
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
    <div class="col" style="flex:0 0 380px">
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

/* ---------- 13.1 双环结构 ---------- */
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
          <path d="M200,48 H265 V150 H302"/>
          <path d="M200,150 H302"/>
          <path d="M200,252 H265 V150"/>
          <path d="M356,150 H408"/><path d="M580,150 H648"/>
          <path d="M740,178 V300 H495 V178"/>
        </g>
        <path d="M740,122 V60 H10 V150 H18" stroke="#0d9488" stroke-width="2" fill="none" stroke-dasharray="7 5" marker-end="url(#a10)"/>
        <text x="380" y="52" class="lbl-sm" fill="#0d9488">U₂、功率反馈（慢，ms 级）</text>
        <text x="620" y="290" class="lbl-sm" fill="#0d9488">i_L 反馈（快，μs 级）</text>
      </svg>
    </div>
    <div class="col" style="flex:0 0 360px">
      <div class="note"><b>为什么内环必须是电流环：</b>
        电感电流是变换器里唯一的<b>储能状态量</b>。直接控制它，就等于直接控制能量流；
        而并联电压环的输出只是给它一个参考值，环与环之间不再互相“抢控制权”。</div>
      <div class="warnbox"><b>三个外环取最小值：</b>这样任何一条保护条件成立都能<b>立即压住</b>内环，
        而不需要“切换模式”。</div>
      <div class="okbox"><b>带宽要错开：</b>外环带宽必须远低于内环，否则两层会互相打架。
        典型：内环几十 kHz 量级，外环 Hz～百 Hz。</div>
    </div>
  </div>`
},

/* ---------- 13.2 状态机 ---------- */
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
      <div class="note"><b>设计要点：</b>状态判断函数<b>只能让控制板进入保护，不能让它退出保护</b>；
        退出的判据写在各个保护环路内部。这样“进入”与“退出”的条件分别集中在各自那一小段代码里，
        不会出现“谁都能把它复位”的混乱。</div>
      <div class="warnbox"><b>前七条都是保护：</b>一旦命中，<b>不执行</b> CAN 下发的充放电命令。</div>
    </div>
  </div>`
},

/* ---------- 13.3 CAN 协议 ---------- */
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
      <div class="card p2" data-caninfo>
        <div class="card-title"><span class="dot"></span>字段说明</div>
        <p class="muted">把鼠标移到左边的字节上。</p>
      </div>
      <div class="warnbox"><b>最容易踩的坑：</b>
        <code>DATA[3]</code> 的电机功率<b>发送时右移了一位（除以 2）</b>，
        接收端必须左移还原（乘 2）并用 <code>uint16</code> 接收。</div>
    </div>
  </div>`
},

/* ---------- 13.4 采样时刻 ---------- */
{
  id: 'adc-timing', part: 'Part II', partKey: 'p2', title: '采样时刻：为什么选在占空比的三分之一处',
  sub: '13.14 · 全篇最精细的一段',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>先算采样要多久</div>
        <div class="formula p2" style="font-size:17px">
          t_conv = (24.5 + 12.5) / 56.7 MHz = 652 ns
        </div>
        <p class="explain">采样 24.5 个 ADC 时钟 + 转换固定 12.5 个；ADC 时钟 56.7 MHz。
          而开关频率 100 kHz，周期 10 µs。</p>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>最坏情况：上管只开 2 µs</div>
        <p style="font-size:16px">电容 5 V、电池 25 V 时只需约 20% 占空比，
          <b>上管开通时间只有 2 µs</b>。而项目要采<b>两次</b>（电容侧、电池侧）。
          把触发点放在占空比的 <b>3/8 处</b>，两次采样一次略早于中点、一次略晚于中点，
          都落在开通区间内。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么非要在中点附近</div>
        <p style="font-size:16px">开关电源的纹波因为电容充放电，大致呈<b>三角波</b>。
          在三角波的“半山腰”采样，得到的值近似等于多个周期的平均值，<b>精度最高</b>。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>三条采样经验</div>
        <ul style="font-size:15px">
          <li><b>避开开关瞬间。</b>即使是带 PWM 抑制的放大器，开关瞬间也有误差，
              更别说电源轨上的毛刺噪声</li>
          <li><b>PWM 抑制有频率上限。</b>INA240 约 100 kHz 以内有效（INA241 标称 125 kHz），
              再高就无法保证</li>
          <li><b>想更准就提高采样率。</b>能做到开关频率两倍以上，就可以采完整个三角波求平均</li>
        </ul>
      </div>
      <div class="note"><b>另一个反直觉的设计：</b>环路用的是<b>未软件滤波</b>的瞬时值。
        作者的理由是“响应速度比精准输出电压更重要”。实测跳变幅度 &lt; 0.1 V，而纹波本身就有 0.2 Vpp。</div>
    </div>
  </div>`
},

/* ---------- 14 注意事项 ---------- */
{
  id: 'notes', part: 'Part II', partKey: 'p2', title: '上手注意事项',
  sub: '14.1 / 14.4 · 几条反直觉但重要的结论',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>上电与断电</div>
        <ul style="font-size:16px">
          <li>正常工作状态<b>只允许用「电池」端口</b>给超电供电</li>
          <li>控制板跟随底盘上下电</li>
          <li><b>不要从调试端口供电</b>——会导致程序跳过上电初始化</li>
          <li>先接电容组，再上电；断电时先断底盘</li>
        </ul>
      </div>
      <div class="card warn">
        <div class="card-title"><span class="dot"></span>调试顺序</div>
        <ol class="steps" style="font-size:16px">
          <li>确认供电与基准（万用表量 ADC 基准）</li>
          <li>看驱动与开关波形（示波器看死区）</li>
          <li>最后才动控制环参数</li>
        </ol>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>三条反直觉的结论</div>
        <ul style="font-size:16px">
          <li><b>电容电压低 ≠ 能量少。</b>电压减半，能量还剩 3/4。
              所以“按电压百分比估电量”是错的</li>
          <li><b>“放电功率”不可直接控制。</b>它是自动分配的结果：
              <span class="var">P_dis = P_motor − P_chassis</span></li>
          <li><b>电容有电也可能断电。</b>超电只在电池侧超限时才帮上忙；
              如果底盘整体功率太高，缓冲能量照样会耗尽</li>
        </ul>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>指示灯速查（红灯亮 = 保护中）</div>
        <table class="tb" style="font-size:15px">
          <tr><th>状态</th><th>含义</th></tr>
          <tr><td>红绿蓝常亮</td><td>保险丝熔断（多半是半桥炸管）</td></tr>
          <tr><td>红灯闪 + 绿蓝交替</td><td>过温保护（100 °C / 5 s）</td></tr>
          <tr><td>红灯常亮</td><td>母线欠压（20 V / 1 s）</td></tr>
          <tr><td>三灯同闪</td><td>CAN 离线（1 s 收不到报文）</td></tr>
        </table>
      </div>
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
      <ul style="font-size:16px">
        <li>电容组极性与控制板端口方向一致</li>
        <li>保险丝规格正确（5 A 慢断，不要擅自换大）</li>
        <li>散热与风道；电感到磁环型号是否匹配（106-125）</li>
        <li>MMCX/SMA 外壳<b>没有</b>碰到任何金属</li>
        <li>CAN 终端电阻开关状态正确</li>
      </ul>
    </div>
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>软件</div>
      <ul style="font-size:16px">
        <li>ADC 基准与板上基准芯片一致（否则全偏 10%）</li>
        <li>电容侧过压阈值与本电容组电压匹配</li>
        <li>CAN 波特率 1 Mbps；ID 正确（0x001 / 0x100）</li>
        <li>使能前先确认【可用】标志为 1</li>
        <li>反解做了钳位 <span class="var">P* ← max(P*, P₀)</span></li>
      </ul>
    </div>
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>联调</div>
      <ul style="font-size:16px">
        <li>先不装车，用电子负载老化半小时</li>
        <li>示波器确认死区、确认无直通</li>
        <li>回读功率与裁判系统对比（误差应 &lt; 5 W）</li>
        <li>满载跑一次，摸 MOS 与电感温度</li>
        <li>拔电池测试：确认不会“僵尸车”</li>
      </ul>
    </div>
  </div>
  <div class="okbox" style="flex:0 0 auto"><b>记住：</b>接错一根线，后面的调试全部白做。
    上电前花十分钟对清单，比炸一块板子省一周。</div>`
},

/* ---------- 收尾 ---------- */
{
  id: 'end', part: '结束', partKey: 'p0', title: '小结', cls: 'divider',
  html: `<div style="max-width:1000px;margin:0 auto;text-align:left">
    <h2 style="margin-bottom:26px">把两件事连起来看</h2>
    <div class="row" style="gap:20px">
      <div class="card p1 grow"><div class="card-title"><span class="dot"></span>功率控制</div>
        <p style="font-size:16px">把“能不能用这么多功率”变成一个<b>可计算</b>的问题：
          建模 → 预测 → 反解 → 再分配。核心是<b>力控底盘</b>与<b>模型精度</b>。</p></div>
      <div class="card p2 grow"><div class="card-title"><span class="dot"></span>超级电容</div>
        <p style="font-size:16px">把“超出去的功率”变成<b>可以借的时间</b>：
          削峰填谷。核心是<b>四开关拓扑</b>与<b>双环控制</b>。</p></div>
    </div>
    <div class="note" style="margin-top:24px;font-size:18px">
      配套教材：《功率控制算法与超级电容技术文档》——
      所有推导、公式、图表与实测数据都在里面。培训只是地图，细节请回文档查。
    </div>
    <p class="muted" style="margin-top:24px;text-align:center">
      按 <kbd>G</kbd> 回到快速导航 · 按 <kbd>Home</kbd> 回到第一页
    </p>
  </div>`
}

];
