import {legacyChapterMap} from '../content/legacy-links.js';
import {createCourseLibrary} from './course-library.js';
import {lessons} from '../content/lessons.js';
import {diagram,modelControls} from './diagrams.js';

const subjects=[
  {id:'math',name:'数学',icon:'ƒ',color:'#e86742',bg:'#fbe9da',tag:'让抽象长出形状',topic:'derivative'},
  {id:'physics',name:'物理',icon:'↗',color:'#397a98',bg:'#e6eff1',tag:'看见世界的底层规则',topic:'energy'},
  {id:'chemistry',name:'化学',icon:'⚗',color:'#8b6b9d',bg:'#f0e9f4',tag:'潜入微观反应现场',topic:'equilibrium'},
  {id:'biology',name:'生物',icon:'⌘',color:'#4e865b',bg:'#e8efdd',tag:'破解生命的精密设计',topic:'meiosis'},
  {id:'geography',name:'地理',icon:'◎',color:'#b17b35',bg:'#f4ecd8',tag:'把地球的故事连起来',topic:'sea-breeze'}
];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let saved={bookmarks:[],progress:{},attempts:{}};
try{saved={...saved,...JSON.parse(localStorage.getItem('manu-v1')||'{}')};}catch{}
let curriculum={subjects:[],sources:[]},filter='all',mapSubject='math',query='',lessonStep=0,modelValue=0,playing=false,timer=null;
let currentLesson=null,pointDialog=null;
let modelFrame=null,motionEnabled=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const app=$('#app');
const courseLibrary=createCourseLibrary({header,footer,esc,toast,diagram});
function persist(){try{localStorage.setItem('manu-v1',JSON.stringify(saved));}catch{toast('当前浏览器无法保存本机记录；仍可继续体验。');}}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),3000);}
const getSub=id=>subjects.find(s=>s.id===id)||subjects[0];
const allPoints=()=>curriculum.subjects.flatMap(s=>(s.chapters||[]).flatMap(c=>(c.points||[]).map(p=>({...p,subject:s.id,chapter:c.title}))));
function header(active='home'){return `<header class="site-header"><a class="brand" href="#home" aria-label="漫游知识首页"><img src="./assets/favicon.svg" width="38" height="38" alt=""><span>漫游知识<small>KNOWLEDGE, IN MOTION.</small></span></a><nav aria-label="主导航"><a class="${active==='home'?'active':''}" href="#home">发现知识</a><a class="${active==='map'?'active':''}" href="#map">五科课程</a><a class="${active==='comics'?'active':''}" href="#comics">漫画</a><a class="${active==='videos'?'active':''}" href="#videos">短视频</a><a class="${active==='study'?'active':''}" href="#study">我的学习</a></nav><a class="edition" href="#about"><span class="green-dot"></span>广东 · 2027届 <span class="edition-label">共建版</span></a></header>`;}
function footer(){return `<footer class="site-footer"><a class="brand" href="#home">漫游知识<span class="footer-tag">让知识有画面，让理解有来路。</span></a><div><a href="#about">关于与制作边界</a><a href="#coverage">覆盖与制作台账 ↗</a></div><p>26册教材映射 · 114个教材章节 + 地理跨章工具 · 原创复习稿，教师教审尚未进行</p></footer>`;}
function subjectChips(selected,all=true){return `<div class="subject-tabs" role="group" aria-label="选择学科">${all?`<button data-filter="all" class="subject-tab ${selected==='all'?'selected':''}">全部学科</button>`:''}${subjects.map(s=>`<button data-filter="${s.id}" class="subject-tab ${selected===s.id?'selected':''}" style="--subject:${s.color};--subject-bg:${s.bg}"><span>${s.icon}</span>${s.name}</button>`).join('')}</div>`;}
function home(){courseLibrary.home();}
function updateLessonGrid(){
  const list=lessons.filter(l=>(filter==='all'||l.subject===filter)&&(!query||`${l.title} ${l.question} ${l.summary}`.includes(query)));
  $('#lesson-grid').innerHTML=list.length?list.map((l,i)=>card(l,i)).join(''):`<div class="empty"><b>这个问题，下一格再见。</b><p>样章暂未覆盖“${esc(query)}”，可以到知识地图查找规划主题。</p><a class="text-button" href="#map">去知识地图 →</a></div>`;
  bindBookmarks();
}
function card(l,i){const s=getSub(l.subject);return `<article class="lesson-card" style="--subject:${s.color};--subject-bg:${s.bg}"><a href="#lesson/${l.id}" class="card-visual" aria-label="阅读${esc(l.title)}"><div class="card-topline"><span>${s.icon} ${s.name}</span><span>原创 · 互动漫画</span></div>${diagram(l.id,i%4,l.id==='sea-breeze'?0:.8,true)}<span class="read-circle" aria-hidden="true">↗</span></a><div class="card-body"><div class="card-meta"><span>${esc(l.kicker)}</span><span>约 ${l.minutes} 分钟</span></div><a href="#lesson/${l.id}"><h3>${esc(l.title)}</h3><p>${esc(l.question)}</p></a><div class="card-bottom"><span>6幕故事 <b>·</b> 1次动手 <b>·</b> 1道迁移题</span><button class="bookmark ${saved.bookmarks.includes(l.id)?'saved':''}" data-bookmark="${l.id}" aria-label="${saved.bookmarks.includes(l.id)?'取消收藏':'收藏'}${esc(l.title)}" aria-pressed="${saved.bookmarks.includes(l.id)}">${saved.bookmarks.includes(l.id)?'★':'☆'}</button></div></div></article>`;}
function bindBookmarks(){$$('[data-bookmark]').forEach(b=>b.onclick=()=>{const id=b.dataset.bookmark,has=saved.bookmarks.includes(id);saved.bookmarks=has?saved.bookmarks.filter(x=>x!==id):[...saved.bookmarks,id];persist();b.classList.toggle('saved',!has);b.textContent=!has?'★':'☆';b.setAttribute('aria-pressed',String(!has));b.setAttribute('aria-label',`${!has?'取消收藏':'收藏'}${lessons.find(x=>x.id===id)?.title||id}`);toast(has?'已取消收藏':'已加入本机收藏');});}
function mapPage(){courseLibrary.catalog(mapSubject);}
function chapterCard(c,i,s){return `<section class="chapter"><div class="chapter-heading"><span class="chapter-no">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(c.title)}</h3><span>${c.points.length}个重点主题</span></div></div><div class="points">${c.points.map(p=>pointButton(p,s)).join('')}</div></section>`;}
function pointButton(p,s){return `<button class="point" data-point="${esc(p.id)}" style="--subject:${s.color}"><span class="point-dot"></span><b>${esc(p.title)}</b><span class="point-status">规划中</span><span aria-hidden="true">↗</span></button>`;}
function searchPoints(q){const points=allPoints().filter(p=>`${p.title} ${p.core} ${p.chapter} ${p.method}`.toLowerCase().includes(q));return `<div class="search-results-label">五科找到 ${points.length} 个相关主题</div>${points.length?`<div class="points search-points">${points.map(p=>pointButton({...p,title:`${getSub(p.subject).name} · ${p.title}`},getSub(p.subject))).join('')}</div>`:'<div class="empty">暂未找到相关主题。试试“平衡”“函数”“分裂”。</div>'}`;}
function bindPoints(){$$('[data-point]').forEach(b=>b.onclick=()=>showPoint(b.dataset.point));}
function showPoint(id){const p=allPoints().find(x=>x.id===id);if(!p)return;pointDialog?.remove();const s=getSub(p.subject);pointDialog=document.createElement('dialog');pointDialog.className='point-dialog';pointDialog.innerHTML=`<button class="close-dialog" aria-label="关闭">×</button><span class="eyebrow">${s.name} / ${esc(p.chapter)} / 规划主题</span><h2>${esc(p.title)}</h2><p class="detail-core">${esc(p.core)}</p><dl><dt>先修知识</dt><dd>${p.prerequisites?.length?p.prerequisites.map(x=>{const prev=allPoints().find(y=>y.id===x);return `<button class="prerequisite-link" data-prev="${esc(x)}">${esc(prev?.title||x)} ↗</button>`;}).join(''):'可作为该主线的入口；仍需对应初高中基础。'}</dd><dt>准备怎样画</dt><dd>${esc(p.visualIdea)}</dd><dt>典型方法</dt><dd>${esc(Array.isArray(p.method)?p.method.join(' → '):p.method)}</dd></dl><p class="detail-note">本条为原主题索引。完整课程已按教材章节展开；漫画是否已有，见对应章节的实际状态。</p><a class="button primary" href="#chapter/${legacyChapterMap[p.id]}">阅读对应完整章节 ↗</a>`;document.body.append(pointDialog);pointDialog.showModal();pointDialog.querySelector('.close-dialog').onclick=()=>pointDialog.close();pointDialog.querySelector('a').onclick=()=>pointDialog.close();pointDialog.querySelectorAll('[data-prev]').forEach(b=>b.onclick=()=>showPoint(b.dataset.prev));pointDialog.onclick=e=>{if(e.target===pointDialog){const r=pointDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)pointDialog.close();}};}
function lessonPage(id){
  currentLesson=lessons.find(l=>l.id===id);if(!currentLesson){notFound();return;}
  const l=currentLesson,s=getSub(l.subject),progress=saved.progress[id];
  lessonStep=Math.min(5,Math.max(0,progress?.step||0));modelValue=modelControls[id]?.initial||0;
  app.innerHTML=header()+`<main id="main" class="wrap lesson-page" style="--subject:${s.color};--subject-bg:${s.bg}"><div class="breadcrumb"><a href="#home">发现知识</a> / <a href="#map/${s.id}">${s.name}</a> / 互动样章</div><div class="lesson-title"><div><span class="eyebrow">${s.name} · ${esc(l.kicker)}</span><h1>${esc(l.title)}</h1><p>${esc(l.summary)}</p></div><button class="button light" data-bookmark="${l.id}" aria-pressed="${saved.bookmarks.includes(id)}">${saved.bookmarks.includes(id)?'★':'☆'}</button></div><div class="lesson-layout"><section class="comic-reader" aria-label="分步科学模型阅读器"><div class="reader-top"><span>SCIENCE MODEL / <b id="panel-number"></b></span><span>科学示意 · 可逐步观察</span></div><div id="panel-content" aria-live="polite"></div><div class="reader-controls"><button id="prev-step" aria-label="上一幕">← 上一幕</button><button id="play-story" class="play-control">▷ 连续阅读一次</button><button id="next-step">下一幕 →</button></div></section><aside class="lesson-outline"><div class="eyebrow">这一节，我们一起走过</div><ol>${l.panels.map((p,i)=>`<li><button data-step="${i}"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(p.title)}</b></button></li>`).join('')}</ol><div class="reader-tip">✳ 默认由你翻页。连续阅读只播放一遍，随时可停；长对话请暂停慢慢看。</div><a class="text-button" href="#quiz">跳到迁移练习 ↓</a></aside></div><section class="method-section"><div class="section-heading"><div><div class="eyebrow">FROM UNDERSTANDING TO SOLVING</div><h2>把看懂，变成会用。</h2></div></div><div class="method-grid"><div class="method-card"><h3>↝ 解题时，这样想</h3><ol>${l.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div><div class="method-card caution"><h3>✳ 两个地方，别想当然</h3><b>适用条件</b><p>${esc(l.conditions)}</p><b>容易混淆</b><p>${esc(l.pitfall)}</p></div></div></section><section id="quiz" class="quiz-section"><span class="eyebrow">ONE MORE STEP / 换个问题试试</span><h2>${esc(l.quiz.question)}</h2><div class="quiz-options">${l.quiz.choices.map((c,i)=>`<button data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${esc(c)}</button>`).join('')}</div><div id="quiz-feedback" role="status"></div></section><details class="lesson-sources"><summary>科学来源与样章说明</summary><p>以下资料用于核对科学事实。人物、对话、交互图形与练习为独立创作；本样章尚未经过任课教师教审与广东高中生学习效果验证。</p><ul>${l.sources.map(x=>`<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)} ↗</a></li>`).join('')}</ul></details><div class="lesson-end"><a class="text-button" href="#map/${s.id}">← 回到${s.name}知识地图</a><a class="button primary" href="#lesson/${lessons[(lessons.indexOf(l)+1)%lessons.length].id}">探索另一科样章 ↗</a></div></main>`+footer();
  bindBookmarks();renderPanel();
  $$('[data-step]').forEach(b=>b.onclick=()=>{stopPlay();setStep(Number(b.dataset.step));});
  $('#prev-step').onclick=()=>{stopPlay();setStep(lessonStep-1);};$('#next-step').onclick=()=>{stopPlay();setStep(lessonStep+1);};
  $('#play-story').onclick=()=>{if(playing){stopPlay();return;}if(lessonStep===5)setStep(0);playing=true;$('#play-story').textContent='Ⅱ 暂停阅读';queueStep();};
  $$('[data-answer]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer)));
  $('.lesson-outline a').onclick=e=>{e.preventDefault();stopPlay();$('#quiz').scrollIntoView({behavior:'smooth',block:'center'});};
}
function renderPanel(){const l=currentLesson,p=l.panels[lessonStep],control=modelControls[l.id];
  $('#panel-number').textContent=`${String(lessonStep+1).padStart(2,'0')} / 06`;
  $('#panel-content').innerHTML=`<div class="panel-heading"><span class="focus-tag">${esc(p.focus)}</span><h2>${esc(p.title)}</h2></div><div class="live-model">${diagram(l.id,lessonStep,modelValue)}</div><div class="motion-row"><span>每幕动画只推进一次，可停下观察。</span><button id="toggle-motion" aria-pressed="${motionEnabled}">${motionEnabled?'切换静态观察':'开启动态演示'}</button></div><div class="dialogues">${p.dialogue.map((d,i)=>`<div class="dialogue ${i%2?'guide':'student'}"><div class="character-avatar" aria-hidden="true">${i%2?'蓝':'橙'}</div><p>${esc(d)}</p></div>`).join('')}</div><p class="panel-explanation">${esc(p.explanation)}</p>${control?`<div class="model-control"><label for="model-slider">${esc(control.label)} <span>${l.id==='energy'&&lessonStep<3?'（第4幕起引入摩擦）':l.id==='derivative'&&lessonStep<4?'（第5幕可动手比较）':l.id==='equilibrium'&&lessonStep<2?'（第3幕起比较压缩）':''}</span></label><div class="range-row"><span>${control.left}</span><input type="range" id="model-slider" min="${control.min}" max="${control.max}" step="${control.step}" value="${modelValue}" ${l.id==='energy'&&lessonStep<3||l.id==='equilibrium'&&lessonStep<2||l.id==='derivative'&&lessonStep<4?'disabled':''}><span>${control.right}</span></div><div id="model-note" class="model-note"></div></div>`:`<div class="model-note">以2n = 4简化示意；每幕检查每个细胞中的数量。未完整表现互换与卵细胞不均等分裂。</div>`}`;
  if($('#model-slider')){$('#model-slider').oninput=e=>{stopPlay();modelValue=Number(e.target.value);$('.live-model').innerHTML=diagram(l.id,lessonStep,modelValue);updateModelNote();};updateModelNote();}
  if(l.id==='sea-breeze'&&lessonStep<5){$('#model-slider').disabled=true;$('.model-control label span').textContent='（第6幕可切换日夜）';}
  $('#prev-step').disabled=lessonStep===0;$('#next-step').disabled=lessonStep===5;
  $$('[data-step]').forEach(b=>{b.classList.toggle('current',Number(b.dataset.step)===lessonStep);b.setAttribute('aria-current',Number(b.dataset.step)===lessonStep?'step':'false');});
  $('#toggle-motion').onclick=()=>{stopPlay();motionEnabled=!motionEnabled;renderPanel();};
  $('.motion-row').insertAdjacentHTML('beforeend','<button id="zoom-model">放大图示 ↗</button>');
  $('#zoom-model').onclick=showModelZoom;
  animateModel();
}
function showModelZoom(){stopPlay();pointDialog?.remove();pointDialog=document.createElement('dialog');pointDialog.className='model-dialog';pointDialog.innerHTML=`<button class="close-dialog" aria-label="关闭放大图示">×</button><h2>${esc(currentLesson.panels[lessonStep].title)}</h2><p>可左右滑动查看完整图示；这是当前幕的静态观察图。</p><div class="zoom-scroll">${diagram(currentLesson.id,lessonStep,modelValue,false,1)}</div>`;document.body.append(pointDialog);pointDialog.showModal();pointDialog.querySelector('button').onclick=()=>pointDialog.close();}
function animateModel(){cancelAnimationFrame(modelFrame);if(!motionEnabled)return;const id=currentLesson.id,step=lessonStep,value=modelValue,start=performance.now();const tick=now=>{if(!$('.live-model')||!location.hash.startsWith('#lesson/'))return;const p=Math.min(1,(now-start)/1600),ease=p*p*(3-2*p);$('.live-model').innerHTML=diagram(id,step,value,false,ease);if(p<1)modelFrame=requestAnimationFrame(tick);};modelFrame=requestAnimationFrame(tick);}
function updateModelNote(){if(!$('#model-note'))return;const id=currentLesson.id;$('#model-note').textContent=id==='derivative'?(lessonStep===5?'固定 a = -1；割线斜率为 -2 + h，h 趋近0时导数为 -2。':'固定 a = 1；割线斜率为 2 + h，h 趋近0时导数为 2。'):id==='equilibrium'?'粒子为定性图，不按数量比例表示浓度。数值仅为固定K的归一化模型。':id==='energy'?'能量条按归一化能量表示；摩擦滑块改变当前累计耗散，不模拟真实时间演化。':'切换日夜是两个条件下的对照示意，不是实时天气预报。';}
function setStep(i){lessonStep=Math.max(0,Math.min(5,i));saved.progress[currentLesson.id]={step:lessonStep,updated:new Date().toISOString()};persist();renderPanel();}
function queueStep(){clearTimeout(timer);const p=currentLesson.panels[lessonStep];const ms=Math.max(9000,Math.min(22000,(p.dialogue.join('').length+p.explanation.length)*180));timer=setTimeout(()=>{if(!playing)return;if(lessonStep===5){stopPlay();return;}setStep(lessonStep+1);queueStep();},ms);}
function stopPlay(){playing=false;clearTimeout(timer);cancelAnimationFrame(modelFrame);if($('#play-story'))$('#play-story').textContent='▷ 连续阅读一次';}
function answer(i){stopPlay();const l=currentLesson,correct=i===l.quiz.answer;$$('[data-answer]').forEach(b=>{b.classList.remove('correct','incorrect');if(Number(b.dataset.answer)===i)b.classList.add(correct?'correct':'incorrect');b.setAttribute('aria-pressed',String(Number(b.dataset.answer)===i));});$('#quiz-feedback').className=`quiz-feedback ${correct?'success':'retry'}`;$('#quiz-feedback').innerHTML=`<b>${correct?'✓ 这次迁移，走通了。':'↝ 这个地方值得再想一步。'}</b><p>${esc(l.quiz.explanation)}</p><small>${correct?'单题答对仅记录为“本题已通过”，不等于整章掌握。':'可以回到漫画，检查条件后再作答。'}</small>`;saved.attempts[l.id]={correct:correct||saved.attempts[l.id]?.correct||false,lastCorrect:correct,date:new Date().toISOString()};persist();}
function studyPage(){courseLibrary.study();}
function about(){courseLibrary.about();}
function notFound(){app.innerHTML=header()+`<main id="main" class="wrap empty"><h1>这一页还没有画出来。</h1><a class="button primary" href="#home">回到发现漫画</a></main>`+footer();}
function route(){
 stopPlay();pointDialog?.close();const [page,id,section]=(location.hash.slice(1)||'home').split('/');
 if(page==='quiz'&&currentLesson){$('#quiz')?.scrollIntoView();return;}
 if(page==='map'){if(subjects.some(s=>s.id===id))mapSubject=id;mapPage();}
 else if(page==='chapter')courseLibrary.chapter(id,section);
 else if(page==='formulas')courseLibrary.formulaPage(id);
 else if(page==='routes')courseLibrary.routePage(id);
 else if(page==='comics')courseLibrary.comicPage(id);
 else if(page==='videos')courseLibrary.videoPage();
 else if(page==='coverage')courseLibrary.coverage();
 else if(page==='lesson')lessonPage(id);
 else if(page==='study')studyPage();
 else if(page==='about')about();
 else if(page==='home')home();
 else notFound();
 window.scrollTo(0,0);
}
document.querySelector('.skip-link').addEventListener('click',event=>{
 const main=document.getElementById('main');
 if(!main)return;
 event.preventDefault();
 main.tabIndex=-1;
 main.focus({preventScroll:true});
 main.scrollIntoView({block:'start'});
});
window.addEventListener('hashchange',route);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlay();});
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches){stopPlay();motionEnabled=false;if(location.hash.startsWith('#lesson/')&&currentLesson)renderPanel();}});
document.addEventListener('keydown',e=>{if(!currentLesson||!location.hash.startsWith('#lesson/')||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||pointDialog?.open)return;if(e.key==='ArrowRight'){stopPlay();setStep(lessonStep+1);}if(e.key==='ArrowLeft'){stopPlay();setStep(lessonStep-1);}});
try{const res=await fetch('./content/curriculum.json');if(!res.ok)throw Error('directory unavailable');curriculum=await res.json();}catch{console.warn('知识目录加载失败');}
try{await courseLibrary.load(curriculum);route();}catch(error){console.error(error);app.innerHTML='<main class="wrap empty"><h1>教材映射暂时未载入</h1><p>请刷新页面重试；本机学习记录仍保留。</p><button onclick="location.reload()" class="button primary">重新载入</button></main>';}
