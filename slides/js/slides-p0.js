/* ============================================================
   slides-p0.js — 开场 + 第 0 章「零基础铺垫」
   这一章不写公式，只讲现象、直觉和类比。
   目标：完全没接触过电机和电路的人也能跟上。
   ============================================================ */
window.SLIDES = (window.SLIDES || []).concat([

/* ================================================================
   开场
   ================================================================ */
{
  id: 'cover', part: '开场', partKey: 'p0', title: '封面', cls: 'cover',
  html: `<div class="cover-inner">
    <div class="eyebrow">RoboMaster · 硬件组新人培训</div>
    <h1>功率控制<br><span class="accent">与超级电容</span></h1>
    <p class="lede">这一讲从"为什么车跑着跑着没劲了"开始。<br>
       不预设你懂电机、懂电路、懂控制——<b>所有公式都会先讲清楚它是怎么来的，再写出来。</b></p>
    <div class="meta">
      <div><b>三步走</b>先看现象 · 再讲道理 · 最后推公式</div>
      <div><b>两部分</b>功率控制（13 页）· 超级电容（37 页）</div>
      <div><b>操作</b>← → 翻页 · G 快速导航 · F 全屏</div>
    </div>
  </div>`
},
{
  id: 'roadmap', part: '开场', partKey: 'p0', title: '今天讲什么',
  sub: '路线图 · 先轻松，后烧脑',
  html: `<div class="row grow">
    <div class="col" style="flex:1.15">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>难度是一层层加码的</div>
        <table class="tb" style="font-size:14.5px">
          <tr><th style="width:16%">层</th><th style="width:34%">你在这一层学到</th><th>会不会用到公式</th></tr>
          <tr><td><b class="accent">第 0 章</b></td><td>现象、直觉、生活类比</td><td>只有一个 <span class="var">P = F·v</span></td></tr>
          <tr><td><b class="accent">Part I</b></td><td>怎么让四个轮子不超功率</td><td>有，但每个都从道理推起</td></tr>
          <tr><td><b class="accent">Part II</b></td><td>怎么把超出去的功率存起来</td><td>多，但都对应一颗真实器件</td></tr>
        </table>
      </div>
      <div class="note" style="font-size:15.5px">
        <b>如果某一页你跟不上：</b>不是你的问题，是我跳步了。
        直接问——这一讲的每一页都假设"上一页没听懂的人还在听"。</div>
    </div>
    <div class="col" style="flex:1">
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>第 0 章 · 零基础铺垫（9 页）</div>
        <p class="tiny" style="color:var(--muted)">先不碰机器人，先回答四个问题：</p>
        <ol class="steps" style="font-size:14px;margin-top:8px">
          <li>功率<b>是什么</b>？</li>
          <li>电机里<b>发生了什么</b>？</li>
          <li>为什么电池<b>不能无限给</b>？</li>
          <li>那<b>怎么办</b>？</li>
        </ol>
      </div>
      <div class="card p1">
        <div class="card-title"><span class="dot"></span>然后才是正题</div>
        <p class="tiny" style="font-size:14.5px;color:var(--muted)">
          <b>Part I</b>：从"四个轮子总共只能用这么多电"这句话，推到能写进代码的公式。<br><br>
          <b>Part II</b>：从那颗让电压能升能降的电感开始，一颗一颗讲板子上的元器件。</p>
      </div>
    </div>
  </div>`
},

/* ================================================================
   第 0 章 · 零基础铺垫
   ================================================================ */
{
  id: 'c0-divider', part: '第 0 章', partKey: 'p1', title: '零基础铺垫', cls: 'divider acc-p1',
  html: `<div class="big-num">0</div>
    <h2>先把道理讲通</h2>
    <p>不讲电路、不讲代码、不推公式。<br>
      只回答四个问题：功率是什么？电机里发生了什么？电池为什么不能无限给？那怎么办？</p>`
},

/* ---------- 0-1 现象 ---------- */
{
  id: 'c0-phenomenon', part: '第 0 章', partKey: 'p1', title: '先看一个现象',
  sub: '0.1 · 三件让你觉得"不对劲"的事',
  html: `<div class="col grow" style="justify-content:center;gap:16px">
    <div class="card p2">
      <div class="card-title"><span class="dot"></span>现象一：同样的电池，两台车表现差很多</div>
      <p style="font-size:16px">同一块满电电池，装在两台<b>一模一样</b>的车上。
         A 车起步一冲就走，B 车起步慢半拍，还时不时"卡一下"。<br>
         <span class="muted">如果电池没差别、车也没差别，那差别只能在"<b>怎么用电</b>"上。</span></p>
    </div>
    <div class="card p2">
      <div class="card-title"><span class="dot"></span>现象二：直道很猛，一进弯就软</div>
      <p style="font-size:16px">直道上加速很痛快，但一打方向、四个轮子都要出力的时候，
         整车突然像"泄了气"。<br>
         <span class="muted">这说明<b>不是电机不行</b>，而是"同时要力的地方太多"。</span></p>
    </div>
    <div class="card p2">
      <div class="card-title"><span class="dot"></span>现象三：猛踩一下就"断电"</div>
      <p style="font-size:16px">有一瞬间特别猛，紧接着整车就失去动力几秒钟。<br>
         <span class="muted">这不是故障，是<b>规则在惩罚"超用"</b>。</span></p>
    </div>
    <div class="okbox" style="font-size:16.5px">
      这三件事背后是同一个原因：<b>能量的"给"是有限的，而"要"是瞬间的。</b>
      接下来我们一点一点把它拆开。
    </div>
  </div>`
},

/* ---------- 0-2 功率是什么 ---------- */
{
  id: 'c0-power', part: '第 0 章', partKey: 'p1', title: '功率到底是什么',
  sub: '0.2 · 从推一个箱子说起',
  html: `<div class="row grow">
    <div class="col" style="flex:1.05">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>想象你在推箱子</div>
        <p style="font-size:16px">你推一个箱子往前走。有两个东西决定你有多"累"：</p>
        <ul style="font-size:16px;margin-top:8px">
          <li><b>用了多大力</b> <span class="var">F</span>（单位：牛）</li>
          <li><b>推得多快</b> <span class="var">v</span>（单位：米/秒）</li>
        </ul>
        <p style="font-size:16px;margin-top:10px">把这两个量乘起来，就得到一个叫
          <b>功率</b> <span class="var">P</span> 的东西：</p>
        <div class="formula p2" style="margin-top:10px">$$ P = F \\times v $$</div>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>换个说法：功率是"花能量的快慢"</div>
        <p style="font-size:16px">把同样一个箱子搬到 3 楼，<b>做的功一样多</b>。
          但慢慢走上去和跑上去，<b>累的程度完全不同</b>。</p>
        <p style="font-size:16px;margin-top:8px">
          → 功是"一共花了多少能量"；<b>功率是"每秒花多少能量"</b>。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat" style="padding:10px">
        <svg viewBox="0 0 520 300" style="width:100%">
          <rect x="60" y="150" width="70" height="70" rx="6" fill="#1b241b" stroke="#69c8e0" stroke-width="2.4"/>
          <text x="95" y="192" text-anchor="middle" font-size="15" fill="#dfe6da" font-weight="700">箱子</text>
          <line x1="60" y1="185" x2="18" y2="185" stroke="#c5f76a" stroke-width="3.4" marker-end="url(#a4)"/>
          <text x="16" y="168" font-size="14" fill="#c5f76a" font-weight="700">F 力</text>
          <line x1="140" y1="238" x2="250" y2="238" stroke="#a8aea5" stroke-width="2.4" marker-end="url(#a1)"/>
          <text x="196" y="258" text-anchor="middle" font-size="13" fill="#a8aea5">v 速度</text>

          <text x="300" y="70" font-size="13" fill="#6f7a6c">同样推到 3 楼，做功一样</text>
          <rect x="300" y="86" width="196" height="88" rx="9" fill="#1b241b" stroke="#2a322a"/>
          <text x="312" y="112" font-size="13" fill="#dfe6da">慢慢走 → 用时 60 s</text>
          <text x="312" y="134" font-size="13" fill="#69c8e0" font-weight="700">功率小</text>
          <text x="312" y="158" font-size="12" fill="#6f7a6c">省力，但慢</text>

          <rect x="300" y="186" width="196" height="88" rx="9" fill="#1b241b" stroke="#2a322a"/>
          <text x="312" y="212" font-size="13" fill="#dfe6da">跑上去 → 用时 10 s</text>
          <text x="312" y="234" font-size="13" fill="#f0b45e" font-weight="700">功率大 6 倍</text>
          <text x="312" y="258" font-size="12" fill="#6f7a6c">累，但快</text>
        </svg>
      </div>
      <div class="okbox" style="font-size:16px"><b>记住这一句就够：</b>
        功率 = 力 × 速度。<br>想把功率做大，<b>要么更用力，要么更快</b>。</div>
    </div>
  </div>`
},

/* ---------- 0-3 电机里发生了什么 ---------- */
{
  id: 'c0-motor', part: '第 0 章', partKey: 'p1', title: '电机里发生了什么',
  sub: '0.3 · 通电 → 有磁性 → 被推着转',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>三句话讲完一台电机的原理</div>
        <ol class="steps" style="font-size:16px">
          <li>给线圈<b>通电</b>，它周围就产生<b>磁场</b>（像一个电磁铁）</li>
          <li>磁场和外圈的磁铁互相<b>推挤</b></li>
          <li>于是中间的转子被推着<b>转</b>起来</li>
        </ol>
        <p style="font-size:16px;margin-top:12px">
          就这么简单。<b>没有任何魔法</b>——电一转成磁，磁一转成转动。</p>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>由此可以看出两件事</div>
        <ul style="font-size:16px">
          <li><b>电流越大 → 磁越强 → 推得越狠</b><br>
              <span class="muted" style="font-size:14.5px">所以"电流"决定<b>力气</b>（力矩）</span></li>
          <li><b>转得越快 → 磁场每秒钟变化的次数越多</b><br>
              <span class="muted" style="font-size:14.5px">所以"转速"决定<b>转多快</b></span></li>
        </ul>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat" style="padding:10px">
        <svg viewBox="0 0 480 300" style="width:100%">
          <circle cx="240" cy="150" r="104" fill="none" stroke="#3d4a35" stroke-width="3"/>
          <g fill="#1b241b" stroke="#69c8e0" stroke-width="2">
            <rect x="150" y="66" width="42" height="30" rx="4"/>
            <rect x="288" y="66" width="42" height="30" rx="4"/>
            <rect x="150" y="204" width="42" height="30" rx="4"/>
            <rect x="288" y="204" width="42" height="30" rx="4"/>
          </g>
          <text x="171" y="86" text-anchor="middle" font-size="12" fill="#69c8e0" font-weight="700">N</text>
          <text x="309" y="86" text-anchor="middle" font-size="12" fill="#69c8e0" font-weight="700">S</text>
          <text x="171" y="224" text-anchor="middle" font-size="12" fill="#69c8e0" font-weight="700">S</text>
          <text x="309" y="224" text-anchor="middle" font-size="12" fill="#69c8e0" font-weight="700">N</text>
          <circle cx="240" cy="150" r="52" fill="#1e3a1f" stroke="#7ee787" stroke-width="2.6"/>
          <text x="240" y="146" text-anchor="middle" font-size="13" fill="#9df2a4" font-weight="700">转子</text>
          <text x="240" y="166" text-anchor="middle" font-size="11" fill="#9df2a4">（线圈）</text>
          <path d="M240,98 A52,52 0 0 1 292,150" fill="none" stroke="#c5f76a" stroke-width="3" marker-end="url(#a4)"/>
          <text x="240" y="286" text-anchor="middle" font-size="12" fill="#6f7a6c">
            外圈磁铁给推力 → 转子转起来</text>
        </svg>
      </div>
    </div>
  </div>`
},

/* ---------- 0-4 力矩×转速=功率 ---------- */
{
  id: 'c0-torque', part: '第 0 章', partKey: 'p1', title: '力矩 × 转速 = 功率',
  sub: '0.4 · 把上一节的直觉写成式子',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>完全对应推箱子</div>
        <div class="row" style="gap:10px;margin:8px 0;align-items:center">
          <div class="card flat tight" style="flex:1;background:#1b241b;text-align:center">
            <p class="tiny" style="font-size:12px;color:var(--dim)">推箱子</p>
            <p style="font-family:var(--mono);font-size:15px;color:var(--fg)">F × v</p>
          </div>
          <div style="color:var(--dim);font-size:18px">⟷</div>
          <div class="card flat tight" style="flex:1;background:#12222a;text-align:center">
            <p class="tiny" style="font-size:12px;color:var(--dim)">电机</p>
            <p style="font-family:var(--mono);font-size:15px;color:var(--cyan)">τ × ω</p>
          </div>
        </div>
        <p style="font-size:15.5px">用力 ← 换成 → <b>力矩</b> <span class="var">τ</span>（转动的"劲"）<br>
          走得多快 ← 换成 → <b>转速</b> <span class="var">ω</span>（每秒转多少圈）</p>
        <div class="formula p2" style="margin-top:10px">$$ P = \\tau \\times \\omega $$</div>
        <p class="explain" style="margin-top:8px">式中 <span class="var">P</span> 为机械功率（W）；
          <span class="var">τ</span> 为力矩（N·m）；<span class="var">ω</span> 为转速（rad/s）。
          <b>和推箱子是同一个式子，只是换了名字。</b></p>
      </div>
      <div class="okbox" style="font-size:15.5px">
        <b>这条式子是全篇的地基。</b>后面所有关于"超功率""分配功率"的讨论，
        都是在跟它打交道。</div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat" style="padding:10px">
        <svg viewBox="0 0 480 300" style="width:100%">
          <path class="axis" d="M56,250 H450"/><path class="axis" d="M56,30 V250"/>
          <text x="440" y="272" font-size="12" fill="#a8aea5" text-anchor="end">转速 ω →</text>
          <text x="46" y="38" font-size="12" fill="#a8aea5" text-anchor="end">力矩 τ</text>
          <!-- 等功率双曲线 -->
          <path d="M96,52 C120,150 160,205 220,222 C300,243 380,248 440,250"
                fill="none" stroke="#f0b45e" stroke-width="2.6" stroke-dasharray="8 6"/>
          <text x="330" y="228" font-size="12" fill="#f0b45e" font-weight="700">同一条功率线</text>
          <circle cx="122" cy="120" r="6" fill="#c5f76a"/>
          <circle cx="232" cy="224" r="6" fill="#69c8e0"/>
          <text x="134" y="116" font-size="12" fill="#c5f76a" font-weight="700">慢而用力</text>
          <text x="246" y="218" font-size="12" fill="#69c8e0" font-weight="700">快而省力</text>
          <line x1="56" y1="120" x2="122" y2="120" stroke="#4a5642" stroke-dasharray="4 4"/>
          <line x1="122" y1="120" x2="122" y2="250" stroke="#4a5642" stroke-dasharray="4 4"/>
          <line x1="56" y1="224" x2="232" y2="224" stroke="#4a5642" stroke-dasharray="4 4"/>
          <line x1="232" y1="224" x2="232" y2="250" stroke="#4a5642" stroke-dasharray="4 4"/>
        </svg>
      </div>
      <div class="card warn tight">
        <div class="card-title"><span class="dot"></span>这张图最重要的一句话</div>
        <p style="font-size:15.5px">沿着那条虚线走，<b>功率一直不变</b>：
          转速越低，力矩必须越大；转速越高，力矩只能越小。</p>
        <p style="font-size:15.5px;margin-top:8px">
          <b>这就是"起步有劲、高速没劲"的原因</b>——不是电机偷懒，是功率就那么多，
          分给转速多了，留给力矩的就少了。</p>
      </div>
    </div>
  </div>`
},

/* ---------- 0-5 电池不是无限的 ---------- */
{
  id: 'c0-battery', part: '第 0 章', partKey: 'p1', title: '电池为什么不能无限给',
  sub: '0.5 · 它里面藏着一个"绊脚石"',
  html: `<div class="row grow">
    <div class="col" style="flex:1.05">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>电池不是理想电压源</div>
        <p style="font-size:16px">你可能会以为电池就是一个恒定的电压，像墙上的插座。<b>不是的。</b></p>
        <p style="font-size:16px;margin-top:10px">真实的电池里串着一个小电阻，
          叫 <b>内阻</b> <span class="var">R</span>。电流流过它，就会<b>扣掉一部分电压</b>：</p>
        <div class="formula p2" style="margin-top:10px">$$ U_{\\mathrm{out}} = U_{\\mathrm{bat}} - I R $$</div>
        <p class="explain" style="margin-top:8px">式中 <span class="var">U<sub>out</sub></span> 为实际能拿到的电压（V）；
          <span class="var">U<sub>bat</sub></span> 为电池本身的电压（V）；
          <span class="var">I</span> 为取用电流（A）；<span class="var">R</span> 为内阻（Ω）。</p>
      </div>
      <div class="card warn tight">
        <div class="card-title"><span class="dot"></span>更麻烦的是发热</div>
        <div class="formula" style="border-left-color:var(--rose)">$$ P_{\\mathrm{heat}} = I^{2} R $$</div>
        <p style="font-size:15.5px;margin-top:8px">
          注意 <span class="var">I</span> 上有<b>平方</b>：电流翻一倍，发热变成<b>四倍</b>。
          这就是为什么大电流不能一直给——电池会烫、会掉压、会保护。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat" style="padding:10px">
        <svg viewBox="0 0 500 290" style="width:100%">
          <text x="250" y="24" text-anchor="middle" font-size="13" fill="#a8aea5">电流越大，端电压掉得越快</text>
          <path class="axis" d="M70,240 H460"/><path class="axis" d="M70,40 V240"/>
          <text x="448" y="262" font-size="12" fill="#a8aea5" text-anchor="end">电流 I →</text>
          <text x="60" y="48" font-size="12" fill="#a8aea5" text-anchor="end">电压</text>
          <line x1="70" y1="70" x2="460" y2="70" stroke="#4a5642" stroke-dasharray="5 5"/>
          <text x="80" y="64" font-size="11" fill="#6f7a6c">空载电压</text>
          <path d="M70,70 L450,222" stroke="#e8888a" stroke-width="3"/>
          <circle cx="70" cy="70" r="5" fill="#7ee787"/>
          <circle cx="450" cy="222" r="5" fill="#e8888a"/>
          <text x="320" y="150" font-size="12" fill="#e8888a" font-weight="700">I·R 压降</text>
          <text x="90" y="132" font-size="12" fill="#7ee787" font-weight="700">小电流 → 几乎不掉</text>
          <text x="330" y="248" font-size="12" fill="#e8888a" font-weight="700">大电流 → 掉得厉害</text>
        </svg>
      </div>
      <div class="okbox" style="font-size:16px">
        <b>所以电池的"供电能力"是有上限的。</b>
        不是"有多少电"的问题，而是<b>"每秒钟最多能安全地给多少"</b>的问题。</div>
    </div>
  </div>`
},

/* ---------- 0-6 为什么要限功率 ---------- */
{
  id: 'c0-rule', part: '第 0 章', partKey: 'p1', title: '所以比赛要限功率',
  sub: '0.6 · 一条让所有人站在同一起跑线的规则',
  html: `<div class="row grow">
    <div class="col" style="flex:1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>为什么规则偏偏选"功率"</div>
        <ul style="font-size:16px">
          <li>如果只限<b>电压</b>：换大电池就行，没意义</li>
          <li>如果只限<b>电流</b>：慢慢用也能用很多，比不出高下</li>
          <li>限<b>功率</b>：直接卡住"每秒能用多少能量"——
              逼着大家去比<b>怎么用得更聪明</b>，而不是比谁电池更大</li>
        </ul>
      </div>
      <div class="card warn tight">
        <div class="card-title"><span class="dot"></span>超了会怎样</div>
        <p style="font-size:15.5px">规则不是"一刀切禁止超"，而是给了一点点余地，
          然后<b>超多少就罚多少</b>。罚到一定程度——
          <b>整车直接断电</b>。</p>
        <p style="font-size:15.5px;margin-top:8px">
          这就解释了现象三：猛踩一下，然后车不动了。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat" style="padding:10px">
        <svg viewBox="0 0 500 280" style="width:100%">
          <text x="250" y="24" text-anchor="middle" font-size="13" fill="#a8aea5">规则给了一条线，还给了缓冲</text>
          <rect x="70" y="44" width="390" height="196" rx="10" fill="#101a18" stroke="#2a322a"/>
          <line x1="70" y1="120" x2="460" y2="120" stroke="#e8888a" stroke-width="2.6" stroke-dasharray="9 6"/>
          <text x="452" y="112" font-size="12" fill="#e8888a" text-anchor="end" font-weight="700">P_max 功率上限</text>
          <path d="M100,196 C150,190 180,72 230,68 C270,66 300,176 350,180 C400,184 430,120 455,116"
                fill="none" stroke="#f0b45e" stroke-width="3"/>
          <text x="112" y="214" font-size="12" fill="#f0b45e">实际取用</text>
          <rect x="196" y="70" width="74" height="50" rx="6" fill="rgba(232,136,138,.16)"/>
          <text x="233" y="62" font-size="11.5" fill="#e8888a" text-anchor="middle" font-weight="700">超了</text>
          <text x="250" y="264" font-size="12" fill="#6f7a6c" text-anchor="middle">
            超出去的部分，从"缓冲额度"里扣</text>
        </svg>
      </div>
      <div class="note" style="font-size:16px">
        <b>关键认识：</b>约束的对象不是"某一瞬间"，而是<b>"每 100 毫秒结算一次的平均值"</b>。
        这个细节后面会变得很重要——它既是麻烦的来源，也是突破口。</div>
    </div>
  </div>`
},

/* ---------- 0-7 缓冲能量（水桶） ---------- */
{
  id: 'c0-buffer', part: '第 0 章', partKey: 'p1', title: '缓冲能量：可以借，但要还',
  sub: '0.7 · 用一只水桶讲清楚',
  html: `<div class="row grow">
    <div class="col" style="flex:1.1">
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>想象一只水桶</div>
        <p style="font-size:16px">水桶上有一根<b>进水管</b>（电池送来的功率）
          和一根<b>出水管</b>（底盘用掉的功率）。</p>
        <ul style="font-size:16px;margin-top:8px">
          <li>用得比进得快 → 桶里的水位<b>下降</b></li>
          <li>用得比进得慢 → 水位<b>回升</b>，最多到桶满</li>
          <li>水位<b>见底</b> → 没水了，<b>底盘断电</b></li>
        </ul>
      </div>
      <div class="card p2">
        <div class="card-title"><span class="dot"></span>换成正式名字</div>
        <p style="font-size:16px">这只桶，规则里叫 <b>缓冲能量</b> <span class="var">E<sub>buf</sub></span>，
          最多装 60 焦耳。</p>
        <div class="formula p2" style="margin-top:10px">
          $$ \\frac{dE_{\\mathrm{buf}}}{dt} = P_{\\max} - P_{\\mathrm{in}} $$
        </div>
        <p class="explain" style="margin-top:8px">
          这个式子只是在说<b>同一件事</b>：水位的变化速度 = 进水量 − 出水量。
          式中 <span class="var">P<sub>max</sub></span> 是"进水管粗细"，<span class="var">P<sub>in</sub></span> 是"实际用水速度"。</p>
      </div>
    </div>
    <div class="col" style="flex:1">
      <div class="card flat" style="padding:10px">
        <svg viewBox="0 0 460 300" style="width:100%">
          <!-- 水桶 -->
          <path d="M150,60 L140,240 Q140,258 158,258 L302,258 Q320,258 320,240 L310,60 Z"
                fill="rgba(105,200,224,.13)" stroke="#69c8e0" stroke-width="2.6"/>
          <path d="M146,150 L314,150 L308,240 Q308,254 300,254 L160,254 Q152,254 152,240 Z"
                fill="rgba(105,200,224,.28)"/>
          <line x1="146" y1="150" x2="314" y2="150" stroke="#69c8e0" stroke-width="2.2"/>
          <text x="230" y="208" text-anchor="middle" font-size="13" fill="#c2e6f2" font-weight="700">缓冲能量</text>
          <text x="230" y="228" text-anchor="middle" font-size="11.5" fill="#8fc7d6">当前水位</text>
          <!-- 进水管 -->
          <path d="M60,54 H150" stroke="#c5f76a" stroke-width="4" marker-end="url(#a4)"/>
          <text x="52" y="42" font-size="12" fill="#c5f76a" font-weight="700">进：P_max</text>
          <!-- 出水管 -->
          <path d="M312,222 H400" stroke="#f0b45e" stroke-width="4" marker-end="url(#a1)"/>
          <text x="326" y="210" font-size="12" fill="#f0b45e" font-weight="700">出：P_in</text>
          <line x1="150" y1="76" x2="310" y2="76" stroke="#e8888a" stroke-width="2" stroke-dasharray="6 5"/>
          <text x="230" y="70" text-anchor="middle" font-size="11.5" fill="#e8888a" font-weight="700">满 = 60 J</text>
          <line x1="152" y1="250" x2="308" y2="250" stroke="#e8888a" stroke-width="2" stroke-dasharray="6 5"/>
          <text x="230" y="282" text-anchor="middle" font-size="11.5" fill="#e8888a" font-weight="700">0 J → 断电</text>
        </svg>
      </div>
      <div class="okbox" style="font-size:16px">
        <b>这只桶解释了全部三条现象：</b><br>
        ① 短时间超一点没事——桶里有水垫着；<br>
        ② 超太多太快 → 桶很快见底 → 断电；<br>
        ③ 桶满了就装不下了，多出来的只能白白浪费。</div>
    </div>
  </div>`
},

/* ---------- 0-8 两条路 + 五句话 ---------- */
{
  id: 'core', part: '第 0 章', partKey: 'p1', title: '那怎么办？两条路',
  sub: '0.8 · 也是这一讲全部内容的目录',
  html: `<div class="row grow">
    <div class="card p1 grow">
      <div class="card-title"><span class="dot"></span>路一：算着用（Part I）</div>
      <p style="font-size:15.5px">既然每秒能用的能量有限，
        那就<b>先算清楚要花多少，再决定给多少</b>。</p>
      <p style="font-size:15.5px;margin-top:8px">
        → 需要知道<b>每个轮子会花多少功率</b><br>
        → 需要能反过来<b>指定功率、求解指令</b><br>
        → 需要把有限的额度<b>分给四个轮子</b></p>
      <div class="note" style="margin-top:12px;font-size:14.5px">
        这条路的关键前提：底盘必须能<b>直接控制力矩</b>。否则一切无从谈起。</div>
    </div>
    <div class="card p2 grow">
      <div class="card-title"><span class="dot"></span>路二：存着用（Part II）</div>
      <p style="font-size:15.5px">既然超一点也没关系，
        那就<b>在规则允许的范围内，先借一点存起来，需要时再放出来</b>。</p>
      <p style="font-size:15.5px;margin-top:8px">
        → 需要一个能<b>快速充放电</b>的容器（超级电容）<br>
        → 需要能<b>让电压升上去、降下来</b>的电路<br>
        → 需要一套<b>控制它的软件</b></p>
      <div class="note" style="margin-top:12px;font-size:14.5px">
        这条路的关键是<b>四开关 Buck-Boost</b> 和它周围那一圈元器件。</div>
    </div>
  </div>
  <div class="card flat tight" style="flex:0 0 auto;background:#101a18">
    <p style="font-size:15.5px;text-align:center;color:var(--muted)">
      <b class="accent">回头看那五句话，现在应该都能听懂了：</b>
      <b>①</b> 功率 = 力矩 × 转速 &nbsp;·&nbsp;
      <b>②</b> 功率必须"先算再发" &nbsp;·&nbsp;
      <b>③</b> 电容储能与电压平方成正比 &nbsp;·&nbsp;
      <b>④</b> 选型是算出来的 &nbsp;·&nbsp;
      <b>⑤</b> 死区与保护不是可选项
    </p>
  </div>`
}

]);
