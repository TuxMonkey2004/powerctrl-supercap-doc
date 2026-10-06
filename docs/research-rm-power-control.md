# RoboMaster 底盘功率控制与超级电容能量管理 · 技术调研报告

> 调研方式：`web_search` 发现来源 → 因本机 DNS 处于 fake-IP 模式（`bbs.robomaster.com` 解析到 `198.18.1.37`），`web_fetch` 被拒，改用 PowerShell `Invoke-WebRequest` 直连 + headless Edge 渲染 JS 页面 + `git clone` 拉取开源仓库 + PyMuPDF 解析官方 PDF。
> **可信度标注**：`官方` = 大疆/RM 组委会原始文档或官方手册；`开源仓库` = 可直接读取源码/README 的公开仓库；`博客/论坛` = 个人博客或论坛帖。
>
> **重要说明（不要误用）**：网络上广为流传的「广工电机功率公式」原始出处**未找到公开可访问的在线文档**，目前只能通过 XJTLU（西交利物浦）的开源报告转引。下文所有转引均已明确标注。

---

## 0. 全景速览（两个关键词）

| 主题簇 | 核心问题 | 代表方案 |
|---|---|---|
| **基于电机功率模型反解力矩/电流** | 给定功率上限 $P^\*$，当前转速 $\omega$ 下该发多大指令？ | XJTLU 功率再分配、港科广（HKUST-GZ）解析式、ZJU 削减系数、H7-Framework 分组求解 |
| **超级电容能量调度** | 超电使缓冲能量失去可观性后，如何在线调度能量？ | 填谷削峰、$e=\sqrt{E_s}-\sqrt{E_f}$ 能量环、ESR 前馈模型、电容电流内环 |

**关键结构关系**：一旦接入超电，缓冲能量不再反映电机功率与上限的关系 → 必须直接建模电机功率 → 而超电本身需要一个**独立的外层能量调度环**来决定「本周期允许底盘用多少功率」。两者是**分层**关系：能量调度层输出 $P_{\max}$，功率模型反解层把 $P_{\max}$ 分配到各电机。

---

## 1. M3508/C620 电机功率模型的常见形式与系数

### 1.1 ZJU HelloWorld 的三系数模型（含实测系数与完整调参流程）

浙江大学 HelloWorld 战队的通用组件文档给出的模型为

$$P_{\text{model}} = k_1 \cdot I \cdot \omega + k_2 \cdot I^2 + k_3 \cdot |\omega|$$

$I$ 为转矩电流，$\omega$ 为角速度。文档同时给出**可直接使用的两组实测系数**：

| 参数 | 轮电机（M3508） | 舵电机 |
|---|---|---|
| $k_1$（$I\omega$ 项） | 0.259 | 0.65 |
| $k_2$（$I^2$ 项） | 0.106 | 5.78 |
| $k_3$（$\lvert\omega\rvert$ 项） | 0.169 | 0.0 |
| 输出限幅 | 20 A | 3 A |
| 电机数 | 4 | 4 |
| 底盘静息功率 $P_{\text{bias}}$ | 5.3 W | — |
| 分配给舵电机的功率比例 | 0.5（非舵轮底盘填 0） | — |

来源：[底盘功率限制 · ZJU-HelloWorld Wiki](https://raw.githubusercontent.com/ZJU-HelloWorld/Wiki/main/docs/%E7%BB%84%E4%BB%B6%E8%AF%B4%E6%98%8E/%E6%9C%BA%E5%99%A8%E4%BA%BA%E9%80%9A%E7%94%A8%E7%BB%84%E4%BB%B6/%E7%AE%97%E6%B3%95/%E5%BA%95%E7%9B%98%E5%8A%9F%E7%8E%87%E9%99%90%E5%88%B6.md)（来源：开源仓库 · 高可信）

### 1.2 港科广（HKUST-GZ）PnX 的四系数模型（$\omega^2$ 项系数极小）

M3508 物理模型：

$$P = k_1\,\omega I + k_2\,I^2 + k_3\,\omega^2 + k_4$$

| 电机 | $k_1$ | $k_2$ | $k_3$ | $k_4$ | 电流换算 |
|---|---|---|---|---|---|
| M3508 | $1.5756\times10^{-2}$ | $1.94\times10^{-1}$ | $1.9202\times10^{-5}$ | 1.15 | $20/16384$ |
| M6020 | $0.751$ | $2.5$ | $2.1\times10^{-5}$ | 1.15 | $3/16384$ |

其中 $\omega$ 为 rad/s、$I$ 为 A。注意 $k_3$ 只有 $10^{-5}$ 量级，说明**在 rad/s 单位下 $\omega^2$ 项几乎可忽略**；M6020 的 $k_1,k_2$ 比 M3508 大 1~2 个数量级。

来源：[ckq1115/H7-Framework · Power_Ctrl.c](https://github.com/ckq1115/H7-Framework)（来源：开源仓库 · 高可信，系数直接读自源码）

### 1.3 港科广（HKUST）PowerModule：力矩形式模型 $P=\tau\omega+k_1|\omega|+k_2\tau^2+k_3$

$$P = \sum_{i=1}^{n}\tau_i\omega_i + k_1\sum_{i=1}^{n}|\omega_i| + k_2\sum_{i=1}^{n}\tau_i^2 + k_3$$

默认参数（README 与代码一致）：

| 参数 | 麦轮/全向轮底盘 | 平衡步兵 |
|---|---|---|
| $k_1$（转速相关损耗） | **0.22** | 0.2 |
| $k_2$（力矩平方损耗） | **1.2** | 2.8 |
| $k_3$（整机静息损耗） | **2.78** | 3.21 |
| RLS 遗忘因子 $\lambda$ | 0.9999 / 0.99999 | — |

单电机形式为 $P_i=\tau_i\omega_i+k_1|\omega_i|+k_2\tau_i^2+\frac{k_3}{n}$。

来源：[hkustenterprize/RM2024-PowerModule · README.md](https://github.com/hkustenterprize/RM2024-PowerModule)（来源：开源仓库 · 高可信）

### 1.4 XJTLU（西交利物浦）GMaster：以力矩电流控制值 $I_{\text{cmd}}$ 为回归量

$$P_{\text{in}} = C_T I_{\text{cmd}}\omega + k_1\omega^2 + k_2 I_{\text{cmd}}^2,\qquad C_T = \frac{K_T}{9.55}\times\frac{20}{16384} = 1.996\times10^{-6}$$

其中 $\omega$ 单位 RPM、$I_{\text{cmd}}$ 为无量纲控制值（$\pm16384$）。采用这套「直接用发送值 $I_{\text{cmd}}$ 拟合」的写法是为了省掉数据换算。

来源：[Motor-modeling-and-power-control/开源报告.pdf](https://github.com/MaxwellDemonLin/Motor-modeling-and-power-control) · [rcbbs.top 同名技术文档](https://rcbbs.top/t/topic/4058)（来源：开源仓库 + 论坛 · 高可信）

### 1.5 系数取值范围汇总与「来源」真相

| 来源 | 模型形式 | 系数 |
|---|---|---|
| ZJU HelloWorld | $I\omega,\ I^2,\ \lvert\omega\rvert$ | $k_1{=}0.259,\ k_2{=}0.106,\ k_3{=}0.169$（轮）/ $0.65,5.78,0$（舵） |
| 港科广 PnX | $I\omega,\ I^2,\ \omega^2,\ 1$ | $1.58{\times}10^{-2},\ 1.94{\times}10^{-1},\ 1.92{\times}10^{-5},\ 1.15$ |
| 港科 PowerModule | $\tau\omega,\ \lvert\omega\rvert,\ \tau^2,\ 1$ | $0.22,\ 1.2,\ 2.78$ |
| XJTLU | $I_{\text{cmd}}\omega,\ \omega^2,\ I_{\text{cmd}}^2$ | $C_T{=}1.996{\times}10^{-6}$；拟合示例 $k_1{=}2.11{\times}10^{-7},\ k_2{=}9.805{\times}10^{-8},\ c{=}2.138$；部署版 $1.453{\times}10^{-7},1.230{\times}10^{-7},4.081$ |

> **⚠️ 不可直接横向比较**：上表第 1、2 行是「A / rad·s⁻¹」量纲；第 4 行是「控制值 / RPM」量纲。两套数的数值差异主要来自单位，而非电机差异。

**「广工公式」的出处**：XJTLU 报告原文写道——

> 「通过查阅**广东工业大学**给出的功率控制方案，电机的输入功率除机械功率之外，还与转速和力矩的二次项有关……对于这个模型，笔者查看了很多资料并没有找到该式子的来源，推测为经验公式，但是该模型在 RM 队伍中广泛使用，应该是有一定原因的。」

论坛评论区补充：「实际上，主要和转速的关系比较复杂，比较准确的 **1.5 次方**，但用一次项或者二次项去拟合也够用。」

来源：[【RM2023-电机功率模型与功率控制开源】西交利物浦大学](https://bbs.robomaster.com/article/9438)（来源：论坛 · 中可信）
**未找到**：广工官方在线文档的公开可访问地址。广工开源组织 [gdut-dynamicx-circuit](https://github.com/gdut-dynamicx-circuit) 下 4 个仓库（`RM_Power_Manager`、`RM_High_side_switch`、`RM_High_side_switch_schottky`、`LED_DRV`）**均不含底盘功率控制算法**，只有超电主控代码。建议在正式发表时把该引用标注为「转引自 XJTLU 开源报告」，不要写成一手来源。

### 1.6 「机械功率项不用拟合」是共识

多个方案都把 $\tau\omega$ 视为解析已知项：$K_T=0.3\times\frac{187}{3591}=0.01562\ \mathrm{N\cdot m/A}$，$P_m=\frac{\tau\omega}{9.55}$。只拟合损耗项。港科 PowerModule 更直接把「电机力矩反馈 $\times$ 转速」作为有效功率 $P_1$ 实测累加，只把损耗交给 RLS。
来源：[XJTLU 开源报告](https://github.com/MaxwellDemonLin/Motor-modeling-and-power-control)、[hkustenterprize/RM2024-PowerModule](https://github.com/hkustenterprize/RM2024-PowerModule)

---

## 2. 缓冲能量机制：官方规则原文

### 2.1 官方动态方程（10 Hz 结算）

裁判系统每 **100 ms** 结算一次：

$$Z \leftarrow Z - (P_r - P_l)\times 0.1,\qquad Z\in[0,60]\ \mathrm{J}$$

- $Z$：缓冲能量；$P_r$：瞬时底盘输出功率；$P_l$：上限功率
- 未触发飞坡增益时 **$Z$ 上限 = 60 J**
- 触发飞坡增益后上限升至 **250 J**；此后若消耗至 60 J 以下，**最高只能恢复到 60 J**

来源：[RoboMaster 2024 机甲大师超级对抗赛比赛规则手册 V1.1](https://terra-1.g.djicdn.com/b2a076471c6c4b72b574a977334d3e05/RM2024/RoboMaster%202024%20%E6%9C%BA%E7%94%B2%E5%A4%A7%E5%B8%88%E8%B6%85%E7%BA%A7%E5%AF%B9%E6%8A%97%E8%B5%9B%E6%AF%94%E8%B5%9B%E8%A7%84%E5%88%99%E6%89%8B%E5%86%8CV1.1%EF%BC%8820231228%EF%BC%89.pdf) 第 68–70 页（来源：**官方** · 最高可信）

### 2.2 超功率惩罚：超限比例 → 扣血档位

$$K = \frac{P_r - P_l}{P_l}\times100\%$$

| 超限比例 $K$ | 扣血系数 $N\%$ |
|---|---|
| $K \le 10\%$ | 10% |
| $10\% < K \le 20\%$ | 20% |
| $K > 20\%$ | **40%** |

缓冲能量耗尽后，每个检测周期扣血 $= \text{上限血量}\times N\%\times 0.1$。

**官方算例**：英雄底盘上限 60 W、上限血量 350，以 120 W 持续输出 → 1 秒消耗完 60 J 缓冲能量；下一周期 $K=(120-60)/60=100\%>20\%$，扣血 $=350\times40\%\times0.1=14$。

来源：同上，规则手册第 68 页（来源：**官方**）

### 2.3 恢复速率的正确读法（重要澄清）

规则文档**只给出扣减公式，没有单独规定「恢复速率」**。但从同一条 $\Delta Z = -(P_r-P_l)\times0.1$ 可直接推出：

$$\dot Z = (P_l - P_r)\times10\ \mathrm{J/s}$$

即 $P_r < P_l$ 时缓冲能量**以与超功率消耗完全相同的速率回充**。

- 若底盘稳定在 $P_r = P_l$，则 $\dot Z = 0$，$Z$ 停在任意值不动；
- **在网上未找到**官方给出的「固定恢复速率」数值（如某些队伍传说的 24 J/s / 36 J/s）。凡出现此类具体数字的说法，均属队伍自行推导或口口相传，**不建议引用为规则**。

来源：对官方规则第 69 页逻辑图 $\Delta Z = -(P_r-P_l)\times0.1$ 的推导（来源：**官方**，推导部分为本报告分析）

### 2.4 缓冲能量闭环 PID 的实际调参经验

**(a) 设定值普遍取 30 J**

XJTLU：`PID_calc(&chassis_power_control->buffer_pid, chassis_power_buffer, 30);`，随后
`input_power = max_power_limit - buffer_pid.out`。他们报告最终效果是「**使缓冲能量稳定在 30，并且电容容值为满**」，做法是把功率上限设成**略大于**底盘最大输入功率，以防底盘静止时电容满电无法充电。
来源：[chassis_power_control.c](https://github.com/MaxwellDemonLin/Motor-modeling-and-power-control)（来源：开源仓库）

港科 PowerModule 取 `refereeBaseBuffSet = 50.0f`、`refereeFullBuffSet = 60.0f`，**同时跑两个并联 PID** 产生功率下限与上限（`baseMaxPower` / `fullMaxPower`），并用 `fmax(..., MIN_MAXPOWER_CONFIGURED)` 兜底（`MIN_MAXPOWER_CONFIGURED = refereeMaxPower * 0.8f`）。
来源：[PowerController.cpp](https://github.com/hkustenterprize/RM2024-PowerModule)（来源：开源仓库）

**(b) 用 $\sqrt{\cdot}$ 而不是线性误差（防超调的关键技巧）**

$$e(t)=\sqrt{E_s}-\sqrt{E_f},\qquad P_{\max}=P_{ref\_max}-K_p e(t)-K_d\frac{e(t)-e(t-1)}{\Delta t}$$

港科 README 的解释：线性关系已够用，但采用过渡函数可「在剩余能量相对较高时扩展功率使用区间，而在剩余能量相对较低时迅速收缩」。$K_p=50$，$K_d=0.2$，更新周期 100 ms（即 10 Hz，与裁判系统同步）。
→ 平方根使误差在能量接近满量程时增益变小，避免在 $E$ 接近 60 J 时功率上限剧烈振荡。

来源：[hkustenterprize/RM2024-PowerModule · README.md「能量环」](https://github.com/hkustenterprize/RM2024-PowerModule)（来源：开源仓库 · 高可信）

**(c) D 项容易引起震荡**

港科原文：「我们简单地利用 P 控制器或者 PD 控制器（防止超调，但**经过实验，实际加入 D 项比较容易使能量环震荡**）」。他们的 `powerPDParam` 实际为 `PID(50.0f, 0.0f, 0.2f, ...)`，即 **Kp=50、Ki=0、Kd=0.2**。

来源：同上（来源：开源仓库）

**(d) 无超电时用解析式而非 PID**

港科在超电断连分支里根本不用闭环，而是直接解析计算：

$$P_{\text{upper}} = P_{\text{referee\_max}} + K_P\left(\sqrt{E_{\text{full}}}-\sqrt{E_{\text{base}}}\right),\quad K_P=50$$

来源：[PowerController.cpp 第 398 行](https://github.com/hkustenterprize/RM2024-PowerModule)（来源：开源仓库）

**(e) 缓冲能量前馈公式（社区提出，作者自注「未经实测」）**

$$P_s=\frac{2E_0-E_1-E_{\text{target}}}{100\,\mathrm{ms}}+P_{s,\text{last}},\qquad E_{\text{target}}=30\ \mathrm{J}$$

用「本次/上次缓冲能量读数」直接前馈算出 FSBB 母线端期望功率，作者认为比功率 PID 响应更快。**作者明确声明该讨论「未经实际测试（纯口嗨）」**，请谨慎对待。
来源：[ZhuaX0/RoboMasterSuperCapCtrller_Adernal](https://github.com/ZhuaX0/RoboMasterSuperCapCtrller_Adernal)（来源：开源仓库 · 观点未验证）

### 2.5 2019 年官方圆桌的早期工程经验（仍适用）

- 裁判系统以 **10 Hz** 检测底盘功率；当年英雄/步兵上限 **80 W**，哨兵新增 20 W
- 超功率主要发生在 **启停过程**（制动比启动更易超功率）、**上下坡**（需大转矩）、**碰撞堵转**
- 推荐做法：动态计算「当前可用功率上限」，用 $W_{\text{缓冲}}-W_{\text{危险值}}=t_{\text{通讯周期}}\cdot P_{\text{可用上限}}$，**不要**刚超功率就立刻硬限，否则会出现「一顿一顿」的抖振
- 经验数值：步兵（20 kg 以内）最大启动功率 **< 400 W**
- 明确反对切换供电方式：「必须保证电调供电电压稳定，否则可能造成电调重启或断电」

来源：[RM圆桌006 | 功率控制飞驰人生](https://www.robomaster.com/zh-CN/resource/pages/activities/1013)（来源：**官方**圆桌 · 高可信）

---

## 3. 广工方案与「力矩缩放系数」的完整图景

### 3.1 广工的经典做法（经 XJTLU 转引与批评）

据 XJTLU 描述，广工方案是：**设一个总力矩缩放系数 $k$，先将模型公式中所有参数取绝对值，再计算该缩放系数**（$\tau_{\text{cmd}}$ 为原始发送力矩）。

来源：[XJTLU 开源报告 §4.1](https://github.com/MaxwellDemonLin/Motor-modeling-and-power-control)（来源：开源仓库转引 · 中可信，一手出处未找到）

### 3.2 XJTLU 对「取绝对值」方案的两点批评（技术价值高）

1. **丢失负功信息**：全程取绝对值意味着无法考虑电机减速时反电动势产生的负功。「在负功情况下根本不消耗功率，但是使用该式子计算依然会得到一个较大的『正』功率，这会导致**对于功率利用的严重不充分**。」
2. **符号必须全程保留**：因为两个根都有物理意义——「在同一时刻，确实存在一正一负两个力矩值，它们令该电机消耗的功率都为 $P_{\max}$」；且「若转速为正，若让它消耗同一功率，其输出的**正的加速力矩绝对值要小于负的减速力矩的绝对值**」，这与电机反电动势原理一致。因此必须**按原 PID 输出的符号选根**。

来源：同上（来源：开源仓库 · 高可信，论证清晰）

### 3.3 XJTLU 的改进方案：功率再分配

$$k=\frac{P_{\max}}{\sum P_{\text{cmd}}} \quad(\text{若 } k>1 \text{ 则不缩放}),\qquad P'=k\times P_{\text{cmd}}$$

然后按原始力矩方向代入反解公式。**对输出负功的电机不缩放**（它本身已不消耗功率），好处是既减少负功带来的误差，又让总输出功率略微变大（令其他电机吸收这部分负功）。
来源：同上 §4.2（来源：开源仓库）

### 3.4 ZJU HelloWorld：轮电机用「转速削减系数」，舵电机才用「电流削减系数」

设 $I_{\text{limited}}=k_{\text{limit}}I$ 代入模型得一元二次方程：

$$\sum\!\left(k_2 I^2\right)k_{\text{limit}}^2+\sum\!\left(k_1\omega I\right)k_{\text{limit}}+\sum\!\left(k_3|\omega|\right)-P_{\text{ref}}-P_{\text{negative}}=0$$

- **舵电机**：同比例削减转矩电流；对**作负功的电机不限制其电流**
- **轮电机**：改为同比例削减**目标转速**，理由是「保证底盘运动方向不变」。轮电机用 P 控制器加前馈时 $I=k_p(\omega_{\text{ref}}-\omega)+I_{\text{ffd}}$，限速后 $I_{\text{limited}}=k_p(k_{\text{limit}}\omega_{\text{ref}}-\omega)+I_{\text{ffd}}$，同样反解二次方程求 $k_{\text{limit}}$
- 期望功率：$P_{\text{ref\_min}}=0.8P_{\text{referee\_max}}$，$P_{\text{ref\_max}}=1.2P_{\text{referee\_max}}$，`energy_converge=20`，`danger_energy=5`，`p_slope=1.5`

来源：[底盘功率限制 · ZJU-HelloWorld Wiki](https://raw.githubusercontent.com/ZJU-HelloWorld/Wiki/main/docs/%E7%BB%84%E4%BB%B6%E8%AF%B4%E6%98%8E/%E6%9C%BA%E5%99%A8%E4%BA%BA%E9%80%9A%E7%94%A8%E7%BB%84%E4%BB%B6/%E7%AE%97%E6%B3%95/%E5%BA%95%E7%9B%98%E5%8A%9F%E7%8E%87%E9%99%90%E5%88%B6.md)（来源：开源仓库 · 高可信）

### 3.5 港科广 H7-Framework：直接解「电流缩放系数」

$$A=\sum_i k_2 I_i^2,\quad B=\sum_i k_1\omega_i I_i,\quad C=\sum_i\left(k_3\omega_i^2+k_4\right)-P_{\text{limit}}$$

$$\text{scale}=\frac{-B+\sqrt{B^2-4AC}}{2A}\quad(\Delta<0\Rightarrow \text{scale}=0),\qquad \text{scale}\leftarrow\mathrm{clamp}(\text{scale},0,1)$$

特别之处是**分组优先级阶梯分配**：`groups[0]` 放驱动轮（最先被砍），`groups[1]` 放舵轮（最后被砍），倒序遍历保证高优先级组先拿配额，配额枯竭后低优先级组直接输出 0。

来源：[H7-Framework · Power_Ctrl.c](https://github.com/ckq1115/H7-Framework)（来源：开源仓库 · 高可信）

### 3.6 反解公式的统一形式（各队等价）

由 $P_i=k_2\tau_i^2+\omega_i\tau_i+k_1|\omega_i|+\frac{k_3}{n}-P_i=0$ 得

$$\Delta=\omega_i^2-4k_2\!\left(k_1|\omega_i|+\frac{k_3}{n}-P_i\right)$$

$$\tau_i=\frac{-\omega_i\pm\sqrt{\Delta}}{2k_2}\quad(\text{原 PID 输出为正取 }+,\ \text{为负取 }-),\qquad \Delta<0\ \text{时取}\ \tau_i=\frac{-\omega_i}{2k_2}$$

港科代码实现完全对应：`newTorqueCurrent[i] = (-p->curAv + sqrtf(delta)) / (2.0f * manager.k2) / k0`。

来源：[hkustenterprize/RM2024-PowerModule](https://github.com/hkustenterprize/RM2024-PowerModule)（来源：开源仓库 · 高可信）

---

## 4. 最小二乘法 / Matlab fit 辨识电机功率模型

### 4.1 XJTLU 的数据采集与拟合流程（可直接复现）

1. 用 **RM C 型开发板**向 C620 发送**不同频率、幅值的正弦力矩电流控制值**
2. 对电机**施加随机大小的负载**（关键：不能空载）
3. 用 **INA226** 采样电调实时消耗电流与总线电压
4. 用 **STM32CubeMonitor** 导出真实电流值、力矩控制值、转子转速到 CSV
5. 用 Matlab 的 **`fit` + `fittype`** 拟合，并用**不同组数据交叉验证**，选仿真效果最好的参数

拟合代码核心：

```matlab
g = fittype('k1*motor_chassis0speed_rpm^2+k2*give_current.^2+c', ...
    'independent',{'motor_chassis0speed_rpm','give_current'}, ...
    'dependent','Pother','coefficients',{'k1','k2','c'});
myfit = fit([motor_chassis0speed_rpm,give_current],Pother,g);
% 拟合结果示例：
Pre_Pother = 2.11e-07*speed_rpm.^2 + 9.805e-08*give_current.^2 + 2.138;
```

其中 `Pother = input_power - machine_power`，`machine_power = speed_rpm .* give_toque / 9.550`。

来源：[power_model.m](https://github.com/MaxwellDemonLin/Motor-modeling-and-power-control/blob/master/model_fit/power_model.m)、[开源报告.pdf §3.3](https://github.com/MaxwellDemonLin/Motor-modeling-and-power-control)（来源：开源仓库 · 高可信）

### 4.2 拟合注意事项（原文与代码给出的坑）

| # | 注意事项 | 出处 |
|---|---|---|
| 1 | **拟合数据时电机不要空载**——「电机空载时力矩电流控制值不等于力矩电流」 | XJTLU 报告 §5.1 |
| 2 | **走不直就先把功率均分**，用于隔离是「分配算法」还是「模型」的问题 | XJTLU 报告 §5.1 |
| 3 | 不同电机的**齿轮箱阻尼系数不同**，会产生随转速二次相关的力矩，**反映为每台电机的 $k_1$（$\omega^2$ 项）不同**，所以参数必须取自同一台/同批同状态电机 | XJTLU 报告 §6 |
| 4 | **INA226 超量程会导致数据失真**，报告图 1 的注记明确写「输入功率出现失真是因为**电流超过 INA226 最大采样电流**」 | XJTLU 报告 §3.1 图 1 |
| 5 | 电调力矩电流环可视为理想（$\tau_{\text{cur}}=\tau_{\text{feedback}}$，$f>1000$ Hz），已通过对比 `give_current` / `given_current` 印证 | XJTLU 报告 §3.2 |

来源：[XJTLU 开源报告](https://github.com/MaxwellDemonLin/Motor-modeling-and-power-control)（来源：开源仓库）

### 4.3 递推最小二乘（RLS）在线辨识（港科 PowerModule，工程化最完整）

**做法**：设 $\tau_{\text{cur}}=\tau_{\text{fb}}$、单周期内 $\omega$ 对力矩变化不敏感、每台电机静息损耗 $\approx k_3/n$，则

$$k_2\tau_i^2+\omega_i\tau_i+k_1|\omega_i|+\frac{k_3}{n}-P_i=0$$

代码中回归量为 $\big[\,\lvert\omega\rvert,\ \tau^2\,\big]^{\mathsf T}$，实际更新式为

```cpp
manager.estimatedPower = k1*samples[0] + k2*samples[1] + effectivePower + k3;
params = rls.update(samples, measuredPower - effectivePower - k3);
manager.k1 = fmax(params[0][0], 1e-5f);   // 防止 k1 收敛到负数
manager.k2 = fmax(params[1][0], 1e-5f);   // 防止 k2 收敛到负数
```

RLS 递推实现（[Utils/RLS.hpp](https://github.com/hkustenterprize/RM2024-PowerModule)）：

$$K_k=\frac{P_{k-1}\varphi_k}{\lambda+\varphi_k^{\mathsf T}P_{k-1}\varphi_k},\qquad \hat\theta_k=\hat\theta_{k-1}+K_k\big(y_k-\varphi_k^{\mathsf T}\hat\theta_{k-1}\big),\qquad P_k=\frac{1}{\lambda}\big(P_{k-1}-K_k\varphi_k^{\mathsf T}P_{k-1}\big)$$

构造函数为 `rls(1e-5f, 0.99999f)`（$\delta=10^{-5}$，$\lambda=0.99999$），任务以 **1000 Hz** 持续更新。

**$k_3$ 不参与在线辨识**，而是「**失能所有底盘电机，从裁判系统或电容反馈的底盘实时功率得知系统静态功率损耗，取一段时间平均值**」。

**RLS 启用条件（安全门控）**：仅在**有真实功率反馈**时启用——超电正常连接中，或超电断连且能量耗尽（此时裁判系统功率可信）。代码门控：`fabs(measuredPower) > 5.0f && !(CAPDisConnect && estimatedPower < 0)`；理由注释为「裁判系统无法检测负功率，导致真实测量失效」。

来源：[hkustenterprize/RM2024-PowerModule · README.md「递归最小二乘算法（RLS）」+ RLS.hpp + PowerController.cpp](https://github.com/hkustenterprize/RM2024-PowerModule)（来源：开源仓库 · 高可信）

### 4.4 另一个可直接参考的「一阶最小二乘」标定示例（超电母线电流系数）

广工超电主控用 **5 点一阶函数最小二乘**标定本地功率计与裁判系统功率的比例系数：

$$k=\frac{\sum x_iy_i-4\bar x\bar y}{\sum x_i^2-4\bar x^2},\qquad b=\bar y-k\bar x,\qquad P_{\text{校准}}=kP_{\text{本地}}+b$$

并做了**合理性校验**：若 $k>1.3$ 或 $k<0.9$ 则回退到经验值 $k=1.2,\ b=0$，同时把结果写入 RTC 备份寄存器避免重复标定。

来源：[RM_Power_Manager · algorithm/power.c](https://github.com/gdut-dynamicx-circuit/RM_Power_Manager)（来源：开源仓库 · 高可信）

---

## 5. 超级电容：接入方式、调度策略、CAN 协议、充放电

### 5.1 三种接入拓扑与工程取舍（Adernal 的系统性比较）

| 拓扑 | 结构 | 优点 | 缺点 |
|---|---|---|---|
| **串联式降压/升压** | 恒流降压给电容充电 + 升压给底盘 + 电子开关旁路 | 搭建与控制难度最低，可买淘宝成品模块 | 体积大；电容低压时压差大、效率低；早期因电容能量不受限而被普遍采用 |
| **并联式四开关（FSBB）** | Chassis 电源串 ORing 后并底盘母线，FSBB 另一端接电容组 | 性能最接近规则下的理论最优；**公认的「版本答案」** | 研发难度高，MCU 编程与电路设计强耦合 |
| **并联式两开关** | 单半桥变换器并联在母线 | 复杂度低于 FSBB；无需处理电容电压接近电池电压时的控制问题；理论效率更高 | 性能上限较低；需解决机器人死亡断电后电容经上管体二极管窜入母线的「**僵尸车**」问题 |

来源：[ZhuaX0/RoboMasterSuperCapCtrller_Adernal · README](https://github.com/ZhuaX0/RoboMasterSuperCapCtrller_Adernal)（来源：开源仓库 · 高可信）

### 5.2 「填谷削峰」与分层能量调度

PSP/UBC 的描述最简洁：「电容模组通过『**填谷削峰**』的方式，在实际功率低时将盈余功率用于充电，在实际功率高时放电」。
Adernal 的表述更精确：**底盘功率 < 裁判限制时，FSBB 为电容组恒功率充电，使 Chassis 电源输出与限制一致；底盘功率 > 限制时，FSBB 通过电容恒功率放电，同样使 Chassis 电源输出与限制一致。**

来源：[wele0612/PSP_supercapacitor](https://github.com/wele0612/PSP_supercapacitor)、[Adernal](https://github.com/ZhuaX0/RoboMasterSuperCapCtrller_Adernal)（来源：开源仓库）

**分层关系**（本报告综合）：超电控制板负责**内层**（母线功率/电流环、电容电压保护），主控负责**外层**（决定本周期允许底盘用多少功率）。ZJU 文档明确指出：「**安装了超级电容后，缓冲能量控制由超电控制板负责**，如果在超电仍有电量的时候出现了超功率，找硬件联调。」
来源：[ZJU-HelloWorld Wiki](https://raw.githubusercontent.com/ZJU-HelloWorld/Wiki/main/docs/%E7%BB%84%E4%BB%B6%E8%AF%B4%E6%98%8E/%E6%9C%BA%E5%99%A8%E4%BA%BA%E9%80%9A%E7%94%A8%E7%BB%84%E4%BB%B6/%E7%AE%97%E6%B3%95/%E5%BA%95%E7%9B%98%E5%8A%9F%E7%8E%87%E9%99%90%E5%88%B6.md)（来源：开源仓库）

**期望功率与剩余能量的线性规划**（ZJU）：

$$P_{\text{ref}}=\mathrm{clip}\!\left(P_{\text{referee\_max}}+p_{\text{slope}}(E_{\text{remain}}-E_{\text{converge}}),\ P_{\text{ref\_min}},\ P_{\text{ref\_max}}\right)$$

低于 $E_{\text{danger}}$ 时 $P_{\text{ref}}=0$（**强制关断作为最后保险**）。扣除静息功率 $P_{\text{bias}}$ 后按 $p_{\text{steering\_ratio}}$ 分配给轮电机与舵电机。
来源：同上（来源：开源仓库 · 高可信）

**两种可切换的功率模式**（港科 ENTERPRIZE 的实战策略）：
- **充电模式**：功率上限设为略低于裁判限制，让底盘产生冗余功率给电容充电 → 即使交战中也缓慢充电
- **补电模式**：功率上限设为远高于限制（例：1 级步兵 45 W 限制下设 80 W），超电长时间补偿 35 W → **「1 级步兵拥有 8 级底盘功率」**；2000 J 近满电状态可支撑**长达 1 分钟**交战

来源：[hkustenterprize/RM2024-PowerModule · README「外部接口」](https://github.com/hkustenterprize/RM2024-PowerModule)（来源：开源仓库 · 高可信）

### 5.3 CAN 通信协议实例（三套不同协议，可对比选型）

**(a) HITSZ 南工骁鹰（STM32F334，10 串 2.7 V 电容）——最简明**

| 方向 | 标识符 | 字节定义 |
|---|---|---|
| 超电 → 主控（反馈） | **0x211** | 1-2 输入电压（低/高八位）、3-4 电容电压、5-6 输入电流、7-8 目标功率 |
| 主控 → 超电（控制） | **0x210** | 1-2 目标功率（高/低八位） |

规格：最大输入功率 200 W，电容侧最大充电电流 10 A、最大放电电流 20 A（**新规则下调整为 14.5 A**）。**注意文档警告**：「在电容电压较低时，可能会出现电容补偿功率不足的现象，此时可能会超功率，故在电容电压低时应降低底盘功率。」

来源：[【RM2024-超级电容控制板开源】哈尔滨工业大学（深圳）南工骁鹰战队](https://bbs.robomaster.com/article/772470)（来源：论坛 · 中高可信，正文已渲染读取）

**(b) PSP（UBC/五大湖，STM32G474，四开关 Buck-Boost）**

```c
/* Message send to capacitor module */
#define CAPCAN_RXMSG_ID 0x2C7
typedef struct capcan_rx_t {   // ALL UNITS IN watt, multiplies by 100
    uint16_t power_target;     // 底盘期望总功率
    uint16_t referee_power;    // 裁判系统功率上限
    uint16_t rsvd1;            // Must be 0x2012
    uint16_t rsvd2;            // Must be 0x0712
} capcan_rx_t;

/* Message come from capacitor module; Expected message frequency = 100Hz */
#define CAPCAN_TXMSG_ID 0x2C8
typedef struct capcan_tx_t {
    uint16_t max_discharge_power;
    uint16_t base_power;
    int16_t  cap_energy_percentage;
    uint16_t cap_state;
} capcan_tx_t;
```

规格：多相并联四开关 Buck-Boost，最大功率 **1200 W（20 V/60 A）**，电流调整动态响应 **10~百 µs 级**。

来源：[PSP_supercapacitor · USER/Inc/cap_canmsg_protocal.h](https://github.com/wele0612/PSP_supercapacitor)（来源：开源仓库 · 高可信，直接读源码）

**(c) H7-Framework（超电报文含缓冲能量透传）**

```c
typedef union {
    struct {
        uint8_t power_key;       // 开关控制 (1:开, 0:关)
        uint8_t capPowerLimit;   // 功率限制 (W)
        uint8_t buffer_now;      // 裁判系统当前剩余缓冲能量
        uint8_t robot_state;     // 机器人存活状态 (1:存活, 0:死亡)
        uint8_t check_code;      // 校验位 (0xAA)
        uint8_t reserved[3];
    } Control;
    uint8_t raw_data[8];
} CapSetData_t;
```

接收侧 `CapRxData_t` 含 `nowPower`（当前底盘功率）、`Cap_Capacity`（电容容量百分比）、`bat_voltage`。**注意：该设计把裁判系统缓冲能量透传给超电控制板，说明能量调度被下放到超电侧。**

来源：[H7-Framework · Power_CAP.h](https://github.com/ckq1115/H7-Framework)（来源：开源仓库 · 高可信）

**(d) 广工超电主控（19 字节状态帧 + CRC16）**

`{0xA5, 0x0A, 0x00, 0x00, 0xA9, 0x01, 0x83, ...}` 帧头，第 7~14 字节依次为底盘功率、期望底盘功率、充电功率、电容百分比（各 16 位，$\times100$ 定点），末两字节为 CRC16。电容能量百分比用 $E\propto CV^2$ 的差值归一化：`ZERO_ENERGY = 7.5³`、`FULL_ENERGY = 7.5×15.7²`。
来源：[RM_Power_Manager · algorithm/power.c](https://github.com/gdut-dynamicx-circuit/RM_Power_Manager)（来源：开源仓库 · 高可信）

### 5.4 超电内部控制环：从 µs 级响应到「五个误差放大器并联」

**(a) HKUST-GZ PnX：用 $P=CV\frac{dV}{dt}$ 做前馈，PID 只补误差**

电容端功率与电容电压变化率的关系（转引南方科技大学 2024 技术方案）：

$$P=CV\frac{\mathrm{d}V}{\mathrm{d}t}\ \Longrightarrow\ \Delta V=\frac{P}{CVf}$$

由 $\Delta V$ 经「电压比 ↔ 占空比」关系算出 $\Delta\eta$。作者结论：「**功率控制可以由等式计算得来，无需使用 PID 等反馈控制方法**。实际上因为存在能量损失和采样误差，最好还是以理论公式为前馈，使用 PID 补足误差。」另外「条件 1」指电容端电压可由输入电压与 BuckBoost 占空比直接计算。

来源：[HKUSTGZ-ROBOMASTER-PNX/RM25_SC5.5_OpenSource · README](https://github.com/HKUSTGZ-ROBOMASTER-PNX/RM25_SC5.5_OpenSource)（来源：开源仓库 · 高可信）

**(b) HITSZ：从「竞争式多环」到「电容电流内环 + 外环并联」，响应从几十 ms 降到几 ms**

作者自述的演进路径与最终结构非常值得引用：
1. 初版：高压电压环、低压电压环、电容充电电流环、电容放电电流环、功率环**五环并联比大小** → 响应差，电压环切换到电流环耗时很长
2. 改增量式 PID + 限制电压环积分 → 响应仍需**几十 ms**
3. **受 ADI LT8708 内部框图启发**（其本质是「一堆误差放大器并联后输出给电感的电流环」）→ 改为 **电容电流作为内环，高压/低压电压环与功率环的并联作为外环** → **响应降到几 ms**，「和 G4 做出的超电不相上下」

来源：[【RM2024-超级电容控制板开源】哈尔滨工业大学（深圳）南工骁鹰战队](https://bbs.robomaster.com/article/772470)（来源：论坛 · 中高可信）

**(c) Adernal：ESR 修正的功率→电流前馈模型（三档精度）**

简单模型 $I_c=\frac{P_s}{U_c}$ 会导致「$I_c$ 抖动收敛，曲线类似带阻尼的谐波曲线」（电容组 ESR 造成）。修正过程：

$$\text{ESR 模型：}\ I_c=\frac{P_s}{U_c+\mathrm{ESR}\cdot(I_c-I_{C,\text{last}})},\qquad \text{简化 ESR 模型：}\ I_c=\frac{P_s}{U_c+\mathrm{ESR}\left(\frac{P_s}{U_c}-I_{C,\text{last}}\right)}$$

并给出**预载积分值** $\frac{U_c}{U_b}$（$U_c$ 电容电压、$U_b$ 母线电压）以消除 FSBB 启动时的短时大电流；实测量化：期望 205 W 时反馈约 203 W。另外定义了**广义占空比** $\alpha=\frac{U_1}{U_2}=\frac{D_2}{D_1}$ 作为主环路控制量，用于解决电容电压接近电池电压时的振荡。

来源：[Adernal · README §环路控制](https://github.com/ZhuaX0/RoboMasterSuperCapCtrller_Adernal)（来源：开源仓库 · 高可信，作者自注部分设想未实测）

**(d) 电容组设计规则（Adernal 给出定量建议）**

> 1. 充满时两端电压 **30 V**；2. 充满时存储能量 **2 kJ**；3. ESR 尽可能小。

按其选型（11s1p，50 F/3 V，ESR 22 mΩ 单体）：组容值 4.54 F、耐压 33 V、**组 ESR 242 mΩ**；充至 30 V 时

$$E=\tfrac{1}{2}CU^2=2045.45\ \mathrm{J}$$

均衡采用 BW6103（内置功率管泄流 0.2 A@2.95 V），但作者认为 200 mA 泄放不足，**外置 AO3400A + 电阻做主要泄放回路**，BW6103 仅作触发。

来源：同上 §电容组设计（来源：开源仓库）

**(e) 工程细节（对复刻极有价值）**

- 港科广 PnX：空载 **0.8 W**（24 V 输入/25.1 V 输出）、全负载范围 **97.6%** 效率（45–200 W）、峰值 **98.2%**、20 A 最大输出电流；针对 **RM25 赛季 20000 J 总能量限制**重点优化了静态功率与效率
- 港科广 PnX 反复强调 **UCC27211 有严重 UVLO 问题**（上管驱动波形不正常），推荐国产 SLM27211 等效替换
- PSP 反复强调 **ADC 基准电压必须与 PCB 上的 REF3033(3.3 V)/REF3030(3.0 V) 一致**，「已经多个队伍复刻时出现这个问题」
- HITSZ 给出**内部基准校准**公式：$V_{dda}=3.3\,\mathrm{V}\times\frac{\text{vrefint\_cal}}{\text{vrefint\_data}}$（STM32F334 出厂校验值地址 `0x1FFFF7BA`）
- HITSZ 的电容电流采样用 INA240 双 REF 偏置到 2.2 V 实现双向测量，量程 **−22 A ~ +11 A**

来源：[HKUSTGZ RM25_SC5.5_OpenSource](https://github.com/HKUSTGZ-ROBOMASTER-PNX/RM25_SC5.5_OpenSource)、[PSP_supercapacitor](https://github.com/wele0612/PSP_supercapacitor)、[HITSZ 超电开源](https://bbs.robomaster.com/article/772470)（来源：开源仓库 + 论坛）

---

## 6. 常见的坑（逐条对应证据）

### 6.1 起步无力 / 起步昏厥

**根因**：以总力矩阈值做功率限制时，「力矩阈值在**低速情况下严重偏小**，造成底盘**起步疲软无力，加速缓慢**」（XJTLU 报告 §3.1）。作者自述曾写过「基于力矩电流缩放的功率控制，有着很严重的**起步昏厥**的问题」，且「到了今年分区赛，我们队伍还是使用着我的那套很不好用的功率控制，在比赛场上有着严重的起步昏厥的问题」。

**正解**：目标是**恒功率启动**——「保证从加速到匀速整个过程电机均工作在最大功率处，以实现理论最大加速度」，这必须通过功率模型**反解力矩**实现。

来源：[【RM2023-电机功率模型与功率控制开源】西交利物浦大学](https://bbs.robomaster.com/article/9438)、[XJTLU 开源报告](https://github.com/MaxwellDemonLin/Motor-modeling-and-power-control)（来源：开源仓库 + 论坛 · 高可信）

### 6.2 走不直

**根因**：直接把每个轮电机的力矩输出乘一个衰减系数「会破坏底盘原有的运动学解算，导致走不了直线等问题（布朗运动 XD）」；因为「四个电机的电流不是线性关系，直接乘以一个系数可能导致运动失真，轮子转动不协调」。

**对策**：
1. **大 P 分配**（港科）——按转速误差分配功率，用置信度 $K_{coe}$ 在两种策略间平滑插值：

$$P_{\max_i}=K_{coe}\frac{error_i}{\sum error_i}+(1-K_{coe})\frac{P_{cmd_i}}{\sum P_{cmd_i}}$$

$K_{coe}$ 在 $\sum error_i$ 小于 $E_{lower}$ 时为 0、大于 $E_{upper}$ 时为 1，中间线性插值。代码中取 `error_powerDistribution_set = 20.0f`、`prop_powerDistribution_set = 15.0f`。
2. **削转速而不是削电流**（ZJU）——「对于轮电机，同比例削减所有电机目标转速，**以保证底盘运动方向不变**」。
3. 快速排查手段：「**走不直把功率均分看看**」（XJTLU）——用于区分是分配算法问题还是模型问题。

来源：[hkustenterprize/RM2024-PowerModule · README §功率环](https://github.com/hkustenterprize/RM2024-PowerModule)、[ZJU-HelloWorld Wiki](https://raw.githubusercontent.com/ZJU-HelloWorld/Wiki/main/docs/%E7%BB%84%E4%BB%B6%E8%AF%B4%E6%98%8E/%E6%9C%BA%E5%99%A8%E4%BA%BA%E9%80%9A%E7%94%A8%E7%BB%84%E4%BB%B6/%E7%AE%97%E6%B3%95/%E5%BA%95%E7%9B%98%E5%8A%9F%E7%8E%87%E9%99%90%E5%88%B6.md)（来源：开源仓库）

### 6.3 超功率（仍发生的情况与对策）

| 场景 | 原因 | 对策 |
|---|---|---|
| 启停、制动 | 制动比启动更易超功率；平地匀速功率远低于启停 | 限制最大转速；动态可用功率上限而非固定 80 W |
| 上下坡 | 需要大转矩，单靠底盘功率无法充分 | 依靠超级电容 |
| 碰撞堵转 | 短时间内轮子堵转 | — |
| 急转弯/斜着走 | 「加了功率环之后……还是会超功率」（2019 圆桌提问者） | 官方回答：他们试过功率环**效果很差，最后放弃了**，改用基于缓冲能量的动态上限方案 |
| 刚超功率就硬限 | 产生「一顿一顿」的抖振（类似 PID 超调） | 「没必要刚超功率就马上限住……可以利用『**用的越多限的越多**』的思想，把这个过程变平缓」 |
| 电容电压低 | 电容补偿功率不足 | 「在电容电压低时应降低底盘功率」（HITSZ 明确警告） |
| 超电断连但仍有电量 | 电容离线时以 **37 W** 无偿补电，裁判功率反馈不可用 | 闭环裁判缓冲能量当作「隐形能量池」：`CAP_OFFLINE_ENERGY_RUNOUT_POWER_THRESHOLD = 43.0f`、`CAP_OFFLINE_ENERGY_TARGET_POWER = 37.0f` |
| 通讯丢数 | 与裁判系统通讯不稳定 | ZJU/圆桌建议：预期时间内未收到信息或解析反常时，把可用功率**严格设为上限值** |

来源：[RM圆桌006](https://www.robomaster.com/zh-CN/resource/pages/activities/1013)（官方）、[hkustenterprize/RM2024-PowerModule](https://github.com/hkustenterprize/RM2024-PowerModule)、[HITSZ 超电开源](https://bbs.robomaster.com/article/772470)

### 6.4 平衡步兵与功率控制的冲突（两种相反的冲突，务必区分）

**(a) XJTLU：功率限制过严 → 无法减速 → 滑铲**

> 「该功率控制算法由于**对功率限制过于严格**，这会与平衡步兵的平衡控制算法冲突，导致平衡步兵在高移速的时候**无法再输出足够的功率改变倾角进行减速**，会使平衡步兵出现**滑铲**的现象。为了兼容平衡步兵，这需要额外的算法对输出功率进行调度，**在减速时及时调高功率上限**，让超级电容介入以正常减速。」

来源：[XJTLU 开源报告 §6](https://github.com/MaxwellDemonLin/Motor-modeling-and-power-control)（来源：开源仓库 · 高可信）

**(b) ZJU：平衡轮电机功率限制尚未完善**

> 「履带电机、平衡轮电机功率限制待完善。」

来源：[ZJU-HelloWorld Wiki · 注意事项](https://raw.githubusercontent.com/ZJU-HelloWorld/Wiki/main/docs/%E7%BB%84%E4%BB%B6%E8%AF%B4%E6%98%8E/%E6%9C%BA%E5%99%A8%E4%BA%BA%E9%80%9A%E7%94%A8%E7%BB%84%E4%BB%B6/%E7%AE%97%E6%B3%95/%E5%BA%95%E7%9B%98%E5%8A%9F%E7%8E%87%E9%99%90%E5%88%B6.md)（来源：开源仓库）

**(c) 港科的解法：为轮腿底盘单独写解析管理器，并做「衰减系数」平滑**

对平衡步兵使用解析式反解 $U_{speed}$/$U_{yaw}$，并把求得的限制值经一阶低通变成衰减系数（`decayUspeed = decayUspeed*0.97 + 1.0*0.03`，或 `temp*0.1 + last*0.9`），在**刹车/反向**工况下把衰减系数缓慢释放回 1.0。目标函数含腿部项 $U_{leg}+U_{pitch}$，说明**腿部力矩被并入功率预测**。
来源：[AnalyticalPowerManager.cpp](https://github.com/hkustenterprize/RM2024-PowerModule)（来源：开源仓库）

> **注意**：官方规则明确「不包含……足式机器人的关节电机」计入底盘功率。因此平衡步兵做功率预测时把腿部力矩纳入，属于**保守做法**（宁多算不少算），不是规则要求。

### 6.5 电流采样：INA226 量程限制与 INA240 的 PWM 抑制陷阱

**(a) INA226 的硬性量程**

- 分流电压输入范围：**−81.9175 ~ +81.92 mV**；满量程 **81.92 mV（decimal = 7FFF）**，**LSB = 2.5 µV**
- 总线电压输入范围 **0~36 V**（ADC 满量程 40.96 V，**不可超过 36 V**）
- 折算电流上限：$I_{\max}=\dfrac{81.92\ \mathrm{mV}}{R_{shunt}}$
  - $R=2\ \mathrm{m}\Omega$ → **±40.96 A**
  - $R=4\ \mathrm{m}\Omega$ → **±20.48 A**
  - $R=5\ \mathrm{m}\Omega$ → **±16.38 A**
- **实测证据**：XJTLU 报告图 1 注记「输入功率出现失真是因为**电流超过 INA226 最大采样电流**」

来源：[TI INA226 Datasheet (SBOS547)](https://www.ti.com/lit/ds/symlink/ina226.pdf)（来源：**官方**芯片手册 · 最高可信）、[XJTLU 开源报告](https://github.com/MaxwellDemonLin/Motor-modeling-and-power-control)（来源：开源仓库）

**(b) INA240 不适合放在半桥 SW 网络（反直觉但很重要）**

Adernal 指出：「INA240 被放置在半桥的 SW 网络检测无刷电机三相线的电流……但是 **INA240 不适合放置在超级电容控制器的 SW 网络**。」依据是数据手册的 PWM 抑制曲线：**共模电压阶跃后输出失准时间约 1 µs**；以 160 kHz 开关频率为例，上升沿+下降沿失准占整个开关周期约 **32%**，半桥占空比过大或过小时 INA240 无法反馈准确电流值。推荐的替代是**低侧电流检测 + 运放自搭采样电路**。

**(c) 母线电流不要用低侧采样**

「不建议通过低侧采样的方式检测母线电流，考虑到 RM 赛事中超级电容控制器与超级电容组之间存在**裁判系统超级电容管理模块**，该模块与裁判系统电源管理模块之间存在 **4 Pin 通讯线的直接连接（包含 GND）**，不排除电流从 4PIN 线直接回流至裁判系统电源管理模块的可能性，导致低侧采样出现失准。」

**(d) INA240 的输出驱动能力极弱**

港科广 PnX 警告：「**INA240 的输出能力极弱**，如果接 RC 低通滤波可能需要调大截止频率（调大电阻，调小电容），按照手册数据，**输出电流最好不超过 2 mA**，否则会**直接震荡**，表现为输出 3 V 到 0 V 的锯齿波。」

**实测参考量程与精度**：
- 港科广 PnX：2×0805 0.5 W 并联 ≈ 1 W 电阻，**检测范围 ±30 A，分辨率约 0.015 A（12 bits）**；成品实测**电压 0.01 V@0~35 V、电流 0.02 A@±30 A**
- HITSZ：INA240A2，电容侧偏置 2.2 V，可达 **−22 A ~ +11 A**

来源：[Adernal README](https://github.com/ZhuaX0/RoboMasterSuperCapCtrller_Adernal)、[HKUSTGZ RM25_SC5.5_OpenSource](https://github.com/HKUSTGZ-ROBOMASTER-PNX/RM25_SC5.5_OpenSource)、[HITSZ 超电开源](https://bbs.robomaster.com/article/772470)（来源：开源仓库 + 论坛 · 高可信）

### 6.6 其他工程细节

- **电调供电电压必须稳定**：「必须保证电调供电电压稳定，否则可能造成电调重启或断电」，明确反对电容/电源交替供电
- **电源电压波动**：「电源模块的输出电压可能会有波动，在利用底盘电机电流值计算功率时可能会有少量误差」
- **必须用规则指定的地胶测试**：「实际地面情况可能会对功率使用造成影响，尽量选择规则手册上指定的地胶测试」
- **轮电机 PID 参数变更必须同步更新功率限制参数**：「调轮电机 PID 以后，一定要记得在功率限制参数中更新」；「轮电机控制不能有 $k_i$ 和 $k_d$，否则预测输出会与实际输出不一致，如使用前馈，一定要填到 `updateWheelModel` 参数中」
- **改减速比必须重标模型**：「轮电机更改减速比后，需要重新调节功率模型参数（通常 $k_2$ 不用调，$k_1,k_3$ 除以减速比）」
- **重心偏移**：「机器人重心不在中心会导致前后轮受力不同，这个在爬坡时表现更加明显。因此可以根据自己机器人具体情况考虑在爬坡时减小负载小电机的目标电流，增加负载低的电机目标电流。这样利于机器人爬坡，却可能会导致在上坡过程中机器人运动不是直线，但外面实际测试是在能接受范围内」
- **推车导致超电误启动炸机**：港科广 PnX 版本迭代记录——「5.4 发现 GaN 4.1 和 5.2 炸的原因，**推车时底盘电机泵升电压启动了超电**（LGS5148 4.5 V 启动），占空比计算错误然后 MOS 炸了」；修法是把 24 V→10 V 的 EN 分压改到约 17 V 启动，「从根源上避免推车等意外上电情况」
- **ADC 基准电压不一致是复刻头号杀手**：PSP 把该条列为 README 最顶部「重要提示！！！」

来源：[RM圆桌006](https://www.robomaster.com/zh-CN/resource/pages/activities/1013)、[ZJU-HelloWorld Wiki](https://raw.githubusercontent.com/ZJU-HelloWorld/Wiki/main/docs/%E7%BB%84%E4%BB%B6%E8%AF%B4%E6%98%8E/%E6%9C%BA%E5%99%A8%E4%BA%BA%E9%80%9A%E7%94%A8%E7%BB%84%E4%BB%B6/%E7%AE%97%E6%B3%95/%E5%BA%95%E7%9B%98%E5%8A%9F%E7%8E%87%E9%99%90%E5%88%B6.md)、[HKUSTGZ RM25_SC5.5_OpenSource](https://github.com/HKUSTGZ-ROBOMASTER-PNX/RM25_SC5.5_OpenSource)、[PSP_supercapacitor](https://github.com/wele0612/PSP_supercapacitor)

### 6.7 2019 圆桌给出的硬件数据点

- C620 额定电压 24 V，**最大允许电流（持续）20 A**，CAN 1 Mbps，重量 35 g
- 步兵（≤20 kg）实测**最大启动功率 < 400 W**（由此推算启动电流约 16~20 A）
- 关于保护二极管：「30 A 的我们试过会炸」，可能炸在启动也可能炸在制动

来源：[RoboMaster 官网 · C620 无刷电机调速器 2](https://bbs.robomaster.com/wiki/20204847/817324)（来源：**官方**产品页 · 最高可信）、[RM圆桌006](https://www.robomaster.com/zh-CN/resource/pages/activities/1013)（来源：**官方**圆桌）

---

## 7. 与两大主题的对应关系（写作时用于归类）

### 7.1 与「基于电机功率模型反解力矩/电流」直接相关

| 内容 | 位置 |
|---|---|
| 功率模型三种形式（$I\omega+I^2+|\omega|$ / $\tau\omega+|\omega|+\tau^2$ / $I\omega+\omega^2+I^2$） | §1.1–1.4 |
| 各队实测系数与量纲不可比问题 | §1.5 |
| 反解二次方程与「两根取符号」 | §3.2、§3.6 |
| 广工力矩缩放系数 + XJTLU 的绝对值批评 | §3.1–3.2 |
| XJTLU 功率再分配 | §3.3 |
| ZJU 轮电机削转速 / 舵电机削电流、负功不限流 | §3.4 |
| H7 分组优先级阶梯分配与电流缩放系数 | §3.5 |
| Matlab `fit`/`fittype` 辨识流程与数据集 | §4.1 |
| RLS 在线辨识与安全门控 | §4.3 |
| 起步昏厥 / 走不直的根因与对策 | §6.1、§6.2 |
| 平衡步兵与反解力矩的冲突 | §6.4 |

### 7.2 与「超级电容能量调度」直接相关

| 内容 | 位置 |
|---|---|
| 缓冲能量动态 $Z\mathrel{-}=(P_r-P_l)\times0.1$ 与 60 J / 250 J 上限 | §2.1 |
| 超功率扣血档位 $K\to N\%$ | §2.2 |
| 恢复速率 = 消耗速率的同一公式（不可引用「24 J/s」等传说数值） | §2.3 |
| 缓冲能量闭环设定值 30 J / 50 J / 60 J，$\sqrt{\cdot}$ 过渡函数，PD 参数 50/0/0.2 | §2.4 |
| 超电断连时的 37 W 离线补电与 43 W 判据 | §2.4、§6.3 |
| 三种拓扑与「填谷削峰」 | §5.1–5.2 |
| 期望功率与剩余能量线性规划、危险值强制关断 | §5.2 |
| CAN 协议四套实例（0x210/0x211、0x2C7/0x2C8、H7 CapSetData、广工 19 字节帧） | §5.3 |
| 超电内环：$P=CV\,dV/dt$ 前馈、电容电流内环、ESR 修正模型、广义占空比 | §5.4 |
| 电容组设计规则（30 V / 2 kJ / 低 ESR）与均衡泄放 | §5.4 |
| 充电模式 / 补电模式与「1 级步兵用 8 级功率」 | §5.2 |
| 电容电压低导致补偿不足 | §6.3 |

---

## 8. 最有价值的参考链接清单（18 条）

| # | 标题 | URL | 类型 |
|---|---|---|---|
| 1 | RoboMaster 2024 超级对抗赛比赛规则手册 V1.1（§5.1.3 底盘功率超限，第 68–70 页） | https://terra-1.g.djicdn.com/b2a076471c6c4b72b574a977334d3e05/RM2024/RoboMaster%202024%20%E6%9C%BA%E7%94%B2%E5%A4%A7%E5%B8%88%E8%B6%85%E7%BA%A7%E5%AF%B9%E6%8A%97%E8%B5%9B%E6%AF%94%E8%B5%9B%E8%A7%84%E5%88%99%E6%89%8B%E5%86%8CV1.1%EF%BC%8820231228%EF%BC%89.pdf | **官方规则** |
| 2 | RoboMaster 2023 超级对抗赛比赛规则手册 V1.1 | https://terra-1.g.djicdn.com/b2a076471c6c4b72b574a977334d3e05/RM2022/RoboMaster%202023%20%E6%9C%BA%E7%94%B2%E5%A4%A7%E5%B8%88%E8%B6%85%E7%BA%A7%E5%AF%B9%E6%8A%97%E8%B5%9B%E6%AF%94%E8%B5%9B%E8%A7%84%E5%88%99%E6%89%8B%E5%86%8CV1.1%EF%BC%8820230113%EF%BC%89.pdf | **官方规则** |
| 3 | RM圆桌006 · 功率控制飞驰人生（官方早期工程经验问答） | https://www.robomaster.com/zh-CN/resource/pages/activities/1013 | **官方圆桌** |
| 4 | 底盘功率限制 · ZJU-HelloWorld Wiki（三系数模型 + 实测系数 + 完整调参流程 + 注意事项） | https://raw.githubusercontent.com/ZJU-HelloWorld/Wiki/main/docs/%E7%BB%84%E4%BB%B6%E8%AF%B4%E6%98%8E/%E6%9C%BA%E5%99%A8%E4%BA%BA%E9%80%9A%E7%94%A8%E7%BB%84%E4%BB%B6/%E7%AE%97%E6%B3%95/%E5%BA%95%E7%9B%98%E5%8A%9F%E7%8E%87%E9%99%90%E5%88%B6.md | 开源仓库 |
| 5 | ZJU HelloWorld HW-Components（功率限制组件源码） | https://github.com/ZJU-HelloWorld/HW-Components | 开源仓库 |
| 6 | MaxwellDemonLin/Motor-modeling-and-power-control（XJTLU 电机功率模型 + Matlab 拟合 + 功率控制代码 + 开源报告 + 数据集） | https://github.com/MaxwellDemonLin/Motor-modeling-and-power-control | 开源仓库 |
| 7 | 【RM2023-电机功率模型与功率控制开源】西交利物浦大学（论坛帖，含评论区关于 1.5 次方的讨论） | https://bbs.robomaster.com/article/9438 | 论坛 |
| 8 | rcbbs.top · 电机功率模型与底盘功率控制（与 #6 同源技术文档） | https://rcbbs.top/t/topic/4058 | 论坛 |
| 9 | hkustenterprize/RM2024-PowerModule（港科：RLS 辨识 + 能量环 $\sqrt{\cdot}$ + 功率再分配 + 错误处理 + 平衡步兵解析管理器） | https://github.com/hkustenterprize/RM2024-PowerModule | 开源仓库 |
| 10 | ckq1115/H7-Framework（港科广：M3508/M6020 四系数模型 + 分组优先级功率限制 + 超电 CAN 报文） | https://github.com/ckq1115/H7-Framework | 开源仓库 |
| 11 | HKUSTGZ-ROBOMASTER-PNX/RM25_SC5.5_OpenSource（港科广 PnX 超电 5.5：$P=CV\,dV/dt$ 前馈 + 效率/静态功耗实测 + 焊接流程） | https://github.com/HKUSTGZ-ROBOMASTER-PNX/RM25_SC5.5_OpenSource | 开源仓库 |
| 12 | 【RM2024-超级电容控制板开源】哈工大（深圳）南工骁鹰（0x210/0x211 协议、INA240 陷阱、控制环演进） | https://bbs.robomaster.com/article/772470 | 论坛 |
| 13 | wele0612/PSP_supercapacitor（UBC/五大湖：四开关 1200 W 超电，0x2C7/0x2C8 协议源码） | https://github.com/wele0612/PSP_supercapacitor | 开源仓库 |
| 14 | ZhuaX0/RoboMasterSuperCapCtrller_Adernal（NOMAD：三种拓扑对比、ESR 修正模型、广义占空比、电容组设计规则、缓冲能量前馈） | https://github.com/ZhuaX0/RoboMasterSuperCapCtrller_Adernal | 开源仓库 |
| 15 | gdut-dynamicx-circuit/RM_Power_Manager（广工超电主控：状态机/功率模式、最小二乘标定系数、19 字节 CAN 帧） | https://github.com/gdut-dynamicx-circuit/RM_Power_Manager | 开源仓库 |
| 16 | TI INA226 Datasheet（SBOS547，±81.92 mV 量程 / 2.5 µV LSB / 36 V 上限） | https://www.ti.com/lit/ds/symlink/ina226.pdf | **官方芯片手册** |
| 17 | 【RM2026-可逐周期峰值电感电流控制的超级电容控制器】南京理工大学 Alliance 战队（电感电流内环 100 kHz） | https://bbs.robomaster.com/article/1941994 | 论坛 |
| 18 | 【RM2026-三相并联 BuckBoost 超级电容控制板开源】青岛大学未来战队 | https://bbs.robomaster.com/article/1935515 | 论坛 |

### 补充备选（第 19–24 条，按需取用）

| # | 标题 | URL | 备注 |
|---|---|---|---|
| 19 | RM 官方 · C620 无刷电机调速器 2 产品页（24 V / 持续 20 A / CAN 1 Mbps） | https://bbs.robomaster.com/wiki/20204847/817324 | 官方 |
| 20 | 【RM2025 个人开源】山海机甲平衡步兵完全开源 | https://bbs.robomaster.com/article/810688 | 平衡步兵，正文可访问 |
| 21 | 【RM2024-技术报告开源】南方科技大学 ARTINX 战队（含「硬件：动能回收」「硬件：GaN 容组」章节） | https://bbs.robomaster.com/article/55220 | PDF 附件 |
| 22 | 【RM2026-串联腿步兵底盘控制系统设计与实现开源】同济大学 SuperPower | https://bbs.robomaster.com/article/1969880 | PDF 附件 |
| 23 | 【RM2026-功率计软硬件开源】华北理工大学 Horizon 战队 | https://bbs.robomaster.com/article/1451143 | 功率计 |
| 24 | 【RM2026开源】XT30/XT60 彩屏功率计 · 北京工业大学 PIP 战队 | https://bbs.robomaster.com/article/1969272 | 功率计 |

---

## 9. 明确「未找到」的内容（不要编造）

1. **广工电机功率公式的一手公开出处**：未找到。只能通过 XJTLU 开源报告转引；广工开源 GitHub 组织下无底盘功率控制算法仓库。建议引用时标注「转引自 XJTLU 开源报告」。
2. **缓冲能量的「固定恢复速率」数值**：官方规则未规定独立恢复速率。规则只用同一条 $\Delta Z=-(P_r-P_l)\times0.1$ 描述充放电。网上流传的 24 J/s、36 J/s 等具体数字**无官方依据**。
3. **DC 电机功率模型的理论推导来源**：XJTLU 报告本身写明「笔者查看了很多资料并没有找到该式子的来源，推测为经验公式」。论坛有人建议查阅《电机学》/《电力拖动》教材，但本次调研**未找到**把 $k_1\omega^2+k_2\tau^2$ 从电机学第一性原理推导出来的中文资料。
4. **山海机甲《全构型功率控制技术方案》（article/1969319）全文**：该文章**已被删除**（页面返回「哎呀~文章不存在」），Wayback Machine 无存档。搜索引擎索引中仅残留片段：提到「半舵半全向构型中两个全向轮既属于前轮又属于后轮……只把两个全向轮的功率归入后轮预测功率」、「舵向位置环非常硬导致舵向转向时出现短暂功率尖峰」、以及一张含「平移峰/旋转起步峰/$\theta,\theta'$」-1.638、0.903、1.708 等拟合系数的表格。**这些片段未经全文验证，引用需谨慎。**
5. **【RM2026 底盘功率与能量双重约束】（article/1970152）**：搜索引擎索引显示该文提到「2026 赛季步兵 1 级底盘功率上限仅 45 W，整车总能量池 20000 J」，但该文章链接当前指向的内容与标题不符（返回的是华农过洞步兵机械结构开源），**未能取得全文**。45 W / 20000 J 这两个数字在港科 PowerModule 代码（`InfantryChassisPowerLimit_HP_FIRST[0] = 45U`）与港科广 PnX README（「针对 RM25 赛季的底盘 20000 J 总能量限制」）中**得到侧面印证**，但 2026 具体规则细节请以官方手册为准。
6. **DeepWiki 的 H7-Framework 功率控制页面**：`deepwiki.com` 被 Vercel 安全检查拦截（Code 99），无法获取；但已通过直接 `git clone` 读取原始源码，信息量更完整。
7. **CSDN / 知乎上关于 RM 底盘功率模型的高质量专文**：本次检索未找到。唯一的 CSDN 命中（`Matlab电机模型辨识`）讲的是用 System Identification Toolbox 拟合**电机传递函数**（tf1，极点 2 零点 0，拟合率 80%），与**功率模型参数辨识**是两件事，参考价值有限。见 https://blog.csdn.net/2503_92339423/article/details/160225314
8. **INA226 在 RM 底盘功率计中的具体选型/量程配置文章**：未找到专文。本报告关于 INA226 量程的结论来自 TI 官方数据手册，以及 XJTLU 报告中「电流超过 INA226 最大采样电流导致输入功率失真」的实测注记。

---

## 10. 给撰写工作的一条重要提示（量纲一致性）

`Docs-of-PowerControl-and-SuperCap/elegantnote-cn.tex` 现有表 `tab:fit` 把两组参数并列：

| 来源 | $\omega^2$ 系数 | $I^2$ 系数 | 常数 |
|---|---|---|---|
| `power_model.m` 拟合示例 | $2.110\times10^{-7}$ | $9.805\times10^{-8}$ | 2.138 |
| 部署代码 `chassis_power_control.c` | $1.453\times10^{-7}$ | $1.230\times10^{-7}$ | 4.081 |

这两组是**同一模型、同一量纲**（$\omega$ 为 RPM，$I$ 为控制值 $\pm16384$），可以直接比较 ✅。

但**不要**把它们与 §1.1/§1.2 的系数放进同一张表比较 ❌：

- ZJU 的 $k_2=0.106$ 对应 $I$ 以 **A** 计、$\omega$ 以 **rad/s** 计
- 港科广的 $k_2=1.94\times10^{-1}$ 同理
- 换算关系：$k_{2,\text{byte}}=k_{2,\text{A}}\times\left(\frac{20}{16384}\right)^2$，量级差异约 $10^{6}$

若确需横向对比，建议按「模型形式 + 单位约定」分成两张表，或在表注中写明单位换算系数。
