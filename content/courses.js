import {math} from './math.js';
import {physics} from './physics.js';
import {chemistry} from './chemistry.js';
import {biology} from './biology.js';
import {geography} from './geography.js';
import {enrich} from './depth.js';
import {additionalRoutes} from './additional-routes.js';
enrich([...math,...physics,...chemistry,...biology,...geography]);
export const courseSubjects=[
 {id:'math',name:'数学',icon:'ƒ',color:'#e86742',bg:'#fbe9da',tag:'从集合到统计，让抽象长出形状',chapters:math},
 {id:'physics',name:'物理',icon:'↗',color:'#397a98',bg:'#e6eff1',tag:'从运动到原子，把模型连成规律',chapters:physics},
 {id:'chemistry',name:'化学',icon:'⚗',color:'#8b6b9d',bg:'#f0e9f4',tag:'从物质到合成，看见结构与变化',chapters:chemistry},
 {id:'biology',name:'生物',icon:'⌘',color:'#4e865b',bg:'#e8efdd',tag:'从分子到生态，追踪生命的因果链',chapters:biology},
 {id:'geography',name:'地理',icon:'◎',color:'#b17b35',bg:'#f4ecd8',tag:'从地球到区域，用过程解释分布',chapters:geography}
];
export const chapters=courseSubjects.flatMap(s=>s.chapters.map(c=>({...c,subject:s.id})));
export const sections=chapters.flatMap(c=>c.sections.map(s=>({...s,chapter:c.id,subject:c.subject})));
export const knowledge=sections.flatMap(s=>s.knowledge.map(k=>({...k,section:s.id,chapter:s.chapter,subject:s.subject})));
export const formulas=sections.flatMap(s=>s.formulas.map((f,i)=>({...f,id:s.id+'-f'+(i+1),section:s.id,chapter:s.chapter,subject:s.subject})));
// Relations are conceptual connections, not a forced single prerequisite chain.
export const routes=[
 {id:'math-function',subject:'math',title:'把函数学成一条线',goal:'由定义域和图象走向零点、变化率、含参最值。',path:['m01','m02','m03','m04','m15'],reason:['集合约束定义域','不等式控制符号和范围','函数性质定位图象','零点建立局部与整体联系','导数解释单调和最值']},
 {id:'math-geometry',subject:'math',title:'把几何变成可计算的关系',goal:'综合几何、向量和坐标法互相验证。',path:['m05','m06','m08','m11','m12','m13'],reason:['角与投影','平面向量','空间位置关系','三维坐标度量','直线圆的坐标工具','距离约束与曲线']},
 {id:'math-random',subject:'math',title:'从数得清，到判断不确定',goal:'用事件、计数、分布与统计模型处理随机问题。',path:['m10','m16','m17','m09','m18'],reason:['事件与概率','计算可能结果','分布和期望','抽样获取证据','相关、回归与检验']},
 {id:'physics-motion',subject:'physics',title:'力怎样改变运动',goal:'先会描述、再查相互作用，最后选择整体方法。',path:['p01','p02','p03','p04','p05','p06','p08','p14'],reason:['运动量含义','恒加速度模型','真实受力图','合力决定a','二维分解','径向变化','功与能的过程账本','冲量与系统动量']},
 {id:'physics-electric',subject:'physics',title:'电与磁的两种连接',goal:'区分力、能量、场和电路，再研究它们的相互转化。',path:['p09','p10','p11','p12','p13','p18','p19','p20','p21'],reason:['场强描述力','电势描述能量','电路连接关系','电源与能量转化','磁通与电磁波初步','磁力改变方向','磁通变化产生电动势','正弦交流与输电','振荡与传播']},
 {id:'chemistry-reaction',subject:'chemistry',title:'反应为什么这样进行',goal:'从守恒与计量到速率、平衡和电化学。',path:['c01','c02','c09','c10','c11','c12'],reason:['离子电子守恒','物质的量桥梁','反应能量','变化快慢与限度','水中多个平衡','电子转移的装置实现']},
 {id:'chemistry-structure',subject:'chemistry',title:'结构如何长出性质',goal:'电子排布→成键→分子/晶体→有机设计。',path:['c04','c13','c14','c15','c16','c17','c18','c20'],reason:['周期与键','轨道和价电子','空间构型与作用力','周期排列和材料','结构证据','碳骨架','官能团互转','聚合与材料']},
 {id:'biology-cell',subject:'biology',title:'一座细胞怎样运转',goal:'分子、结构、运输和代谢协作，最后连接分裂与分化。',path:['b01','b02','b03','b04','b05','b06'],reason:['研究单位','结构材料','区室与协作','输入输出','能量耦联','复制分配与表达选择']},
 {id:'biology-gene',subject:'biology',title:'遗传信息怎样传与变',goal:'概率规律、染色体行为和分子过程互相解释。',path:['b07','b08','b09','b10','b11','b12'],reason:['遗传概率模型','染色体分配机制','DNA结构与复制','表达形成性状','产生变异','种群中的选择与频率变化']},
 {id:'biology-ecology',subject:'biology',title:'从个体走向生态网络',goal:'把数量、关系、能量与稳定性分层理解。',path:['b18','b19','b20','b21'],reason:['种群数量','群落相互关系','系统物质能量信息','保护与生态设计']},
 {id:'geography-natural',subject:'geography',title:'地球系统的因果接力',goal:'用能量、环流和水量解释环境过程与空间差异。',path:['g01','g12','g02','g14','g03','g15','g13','g05','g16'],reason:['圈层和能量来源','辐射几何与季节','受热与局地风','天气与全球环流','水循环','陆海水体交换','地表过程','植被土壤响应','整体性与地域差异']},
 {id:'geography-region',subject:'geography',title:'从条件到区域方案',goal:'定位、找证据、解释机制，再评价发展取舍。',path:['g25','g07','g08','g09','g10','g17','g18','g19','g20','g21','g22','g23','g24'],reason:['读图和定位工具','人口需求','城乡空间','产业选择','可达性','区域尺度','资源与生态约束','城市产业联系','区际协调','服务功能','资源供给安全','环境风险','行动与验证']}
];
// Include foundations and biomolecules in their relevant paths; these remain
// conceptual links and do not claim that every adjacent pair is prerequisite.
const reactionRoute=routes.find(r=>r.id==='chemistry-reaction');
reactionRoute.path.splice(2,0,'c06');reactionRoute.reason.splice(2,0,'能量、速率与限度初步');
const structureRoute=routes.find(r=>r.id==='chemistry-structure');
let insertion=structureRoute.path.indexOf('c16');structureRoute.path.splice(insertion,0,'c07');structureRoute.reason.splice(insertion,0,'有机物与官能团基础');
insertion=structureRoute.path.indexOf('c20');structureRoute.path.splice(insertion,0,'c19');structureRoute.reason.splice(insertion,0,'生物大分子连接与性质');
routes.push(...additionalRoutes);
export const pilotAssets={
 m13:{file:'assets/comics/m13-page1-v2.png',title:'距离，画出曲线',model:true,note:'聚焦三类距离定义；漫画示意不按比例，精确距离用下方模型验证。'},
 m15:{file:'assets/comics/math-07-v1.png',legacy:'derivative',title:'割线怎样靠近切线'},
 p08:{file:'assets/comics/physics-06-v1.png',legacy:'energy',title:'能量没有消失'},
 c10:{file:'assets/comics/chemistry-15-v1.png',legacy:'equilibrium',title:'平衡从来没有停工'},
 b05:{file:'assets/comics/b05-page1-v2.png',title:'阳光怎样变成糖',model:true,note:'聚焦光合场所、物质能量接力、停光短时变化与净总量。C5再生标签已返修。'},
 b08:{file:'assets/comics/biology-10-v1.png',legacy:'meiosis',title:'染色体的两次分发'},
 g02:{file:'assets/comics/geography-05-v1.png',legacy:'sea-breeze',title:'风从温差开始'},
 g12:{file:'assets/comics/g12-page1-v2.png',title:'季节，不是离太阳远近',model:true,note:'聚焦轴倾、太阳高度、昼长与地方时；纬度及光线示意不按比例，模型核对几何关系。'}
};
