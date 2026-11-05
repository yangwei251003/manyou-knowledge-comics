# 五科漫画样例：科学核对与待审边界

核对日期：2026-11-05。适用产品：广东 2027 届高三一轮复习平台首版。脚本文件：`content/lessons.js`。

这五节是原创教学样例，每节六幕，包含对话、解释、解题步骤、易错点、模型条件与一道原创迁移题。已对照下面的一手教育/气象来源核对科学事实；尚未由广东高中学科教师审定，不能称为“已教审课程”，也不能据此声称提高分数或代表完整一轮复习。

## 已核对与自主验算

| 样例 | 核对的事实和自主验算 | 图形制作必须保留的限制 |
| --- | --- | --- |
| 导数 | 对 y=x²、固定 x=1，差商为 2+h，h≠0；h 从两侧趋于零时斜率趋于 2；切线 y=2x-1。迁移到 x=-1 时切线为 y=-2x-1。 | 割线经过两个准确曲线点；切线经过切点。不能把差商原式直接代 h=0，也不能把高度画成坡度。示意坐标缩放一致。 |
| 机械能 | 理想段 ½mv²+mgh 不变；额外非保守功等于机械能变化。自主数值题 m=1 kg、h=5 m、g=10 m/s²、Wf=-18 J，末动能 32 J、末速度 8 m/s。 | 画成小车但按质点处理，忽略轮子转动。摩擦段是滑动制动，不把所有滚动摩擦都当作耗散。内能条增长须与机械能减少对应，不能画能量消失。 |
| 化学平衡 | 反应固定为 2NO₂(g)⇌N₂O₄(g)，Qc=[N₂O₄]/[NO₂]²。等温体积减半瞬间两浓度加倍，Qc/Kc=1/2，随后净反应向右，Kc不变。 | 物质和原子守恒；动态平衡中两方向都继续。分“压缩前/刚压缩/新平衡”三状态。颜色先变深，再相对刚压缩时变浅；不误写最终一定比压缩前浅。浓度相等不是平衡条件。 |
| 减数分裂 | 2n=4：复制前每细胞 4 条染色体/4 个核DNA；复制后 4/8；减Ⅰ胞质分裂后每细胞 2/4；减Ⅱ完成每细胞 2/2。减Ⅰ分同源，减Ⅱ分姐妹。 | 颜色代表亲本来源，长短代表不同染色体；X 是一条复制后的染色体。计数必须标“每个细胞”和阶段。减Ⅱ后期尚未胞质分裂有暂时加倍，不能沿用终产物计数。四个等大产物用于精细胞简图，不画成四个功能卵子。 |
| 海陆风 | 白天局地模型：近地面海→陆、陆上升、高空陆→海、海上下沉；夜间适合形成陆风时反向。风按来向命名，同一高度比较相对气压。 | 标清海陆位置、昼夜与高空/近地面，四支环流闭合。仅代表晴朗弱背景风条件，不能套到广东所有日期，更不能当实际天气预报。 |

以上公式、数值和计数为独立计算或通用科学事实核对，未采用外部练习题。

## 已打开的一手来源

所有链接访问日期均为 2026-11-05：

- [OpenStax Calculus Volume 1 §3.1：差商与导数](https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative)。
- [OpenStax University Physics Volume 1 §8.3：机械能与非保守功](https://openstax.org/books/university-physics-volume-1/pages/8-3-conservation-of-energy)。
- [OpenStax Physics §9.2：轨道情境中的能量转换](https://openstax.org/books/physics/pages/9-2-mechanical-energy-and-conservation-of-energy)。
- [OpenStax Chemistry 2e §13.1：动态平衡与 NO₂/N₂O₄](https://openstax.org/books/chemistry-2e/pages/13-1-chemical-equilibria)。
- [OpenStax Chemistry 2e §13.2：反应商与平衡常数](https://openstax.org/books/chemistry-2e/pages/13-2-equilibrium-constants)。
- [OpenStax Chemistry 2e §13.3：体积变化引起的气相平衡移动](https://openstax.org/books/chemistry-2e/pages/13-3-shifting-equilibria-le-chateliers-principle)。
- [OpenStax Biology 2e §11.1：减数分裂](https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis)。
- [OpenStax Biology 2e §43.3：精子与卵子发生的区别](https://openstax.org/books/biology-2e/pages/43-3-human-reproductive-anatomy-and-gametogenesis)。
- [NOAA JetStream：The Sea Breeze](https://www.noaa.gov/jetstream/ocean/sea-breeze)。
- [美国国家气象局 Corpus Christi 业务指南，第 26 页：Sea Breeze](https://www.weather.gov/media/crp/NWSCorpusChristiGuide.pdf)。该文件为 2010 年版，仅用于稳定环流机理的交叉核对，不作为广东当前天气资料。

## 许可处理

脚本、角色对话与数值题均为本项目原创，不复刻第三方图像、教材原文、例题或角色。链接用于定位核查依据，不等于素材可直接搬用。核查时，OpenStax 页面页脚已列 CC BY-NC-SA 许可及其他使用限制；不能把其教材图文纳入本项目通用开源许可。将来若需要引用其图、表或活动，须另行检查当时许可和具体用途；首版不这样做。

## 动态漫画的实现验收

- 每一幕必须增加问题、证据、模型状态或推理结果，不能只移动同一个装饰物来充数。
- 学生可暂停、逐幕推进、回看；自动播放应在一轮叙事完成后停止，不用长时间无意义循环代替教学。
- 动画、旁白、公式和答案必须指向同一状态；缩小屏幕不能裁掉关键标签。
- 颜色辅助识别，同时保留文字或形状标记，避免仅靠色觉区分。
- 对数值图使用可计算图形，不把生成式插画中看似精确的刻度当作测量数据。
- 正式 GIF/视频导出、逐帧科学核查、连续看审与声音检查属于后续验收，脚本结构检查不能代替。

## 仍待验证

整合时追加修正：能量对话由“高度条/速度条转账”改为“势能条/动能条”，避免混淆不同物理量；不同轨道相同落差应说末速度**大小**相同，方向仍看轨道。对应图增加同起终点的第二条光滑轨道作对照。

本次已实际运行 Node 模块导入与结构断言：5 节、30 幕、60 句对话、5 道题通过；逐项核对了题目正确选项，并独立计算 50-18=32 J、v=8 m/s、Qc/Kc=1/2。该检查不能证明插画或页面已经正确呈现，图形整合后仍须验证。

1. 广东高中各科教师：术语、课程进度、知识点取舍与 2027 届教材/考试适用性。
2. 完成页面后的整合：图形与每幕文本对应、公式标注、按钮、键盘与手机阅读。
3. 学生试学：先预测再观看、自己解释因果、做未见迁移题，并延迟复测；喜欢观看不能直接记为掌握。
4. 根据真实错误率调整叙事长度与解释，不把本次样例的预计阅读分钟当作实测。
