// Native, calculable science models complement original ImageGen art.
// They are explicitly not counted as generated comics or video files.
const ink='#284d43',coral='#df6746',teal='#287f83',gold='#ba9440';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>Math.abs(x)<.0005?'0':x.toFixed(2);
const t=(x,y,s,c=ink,size=14)=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size}" font-family="Microsoft YaHei, sans-serif">${esc(s)}</text>`;
const l=(x,y,a,b,c=ink,dash='')=>`<path d="M${x} ${y}L${a} ${b}" fill="none" stroke="${c}" stroke-width="2" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const dot=(x,y,label,c=coral)=>`<circle cx="${x}" cy="${y}" r="4" fill="${c}"/>${label?t(x+7,y-7,label,c):''}`;
const curve=(p,c=teal)=>`<path d="${p.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(3)} ${y.toFixed(3)}`).join('')}" fill="none" stroke="${c}" stroke-width="2.5"/>`;
const svg=body=>`<svg viewBox="0 0 640 400" role="img" aria-label="可调的精确科学模型">${body}</svg>`;
const arrow=(x,y,dx,dy,color=coral)=>{const len=Math.hypot(dx,dy);if(!len)return'';const ux=dx/len,uy=dy/len;return l(x,y,x+dx,y+dy,color)+`<path d="M${x+dx} ${y+dy}L${x+dx-ux*10-uy*5} ${y+dy-uy*10+ux*5}L${x+dx-ux*10+uy*5} ${y+dy-uy*10-ux*5}Z" fill="${color}"/>`;};
const slider=(id,label,min,max,value,step=.1)=>`<label for="${id}">${label}<input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;
export const modelIds=new Set(['m13','p18','c18','b05','g12']);
export function precisionHTML(id){if(!modelIds.has(id))return'';let controls='';
 if(id==='m13')controls=`<div class="precision-tabs" role="group" aria-label="选择圆锥曲线">${[['ellipse','椭圆'],['hyperbola','双曲线'],['parabola','抛物线']].map(([v,n])=>`<button data-conic="${v}">${n}</button>`).join('')}</div>${slider('conic-point','移动曲线上的P点',-1,1,.25,.01)}`;
 if(id==='p18')controls=`<div class="precision-tabs" role="group" aria-label="选择电荷正负"><button data-charge="1">正电荷</button><button data-charge="-1">负电荷</button></div>${slider('mag-speed','速率 v（归一化）',.5,1.4,1,.05)}${slider('mag-angle','沿轨迹走过的圆心角',0,180,45,1)}`;
 if(id==='c18')controls=`<div class="precision-tabs" role="group" aria-label="选择反应条件"><button data-chem="hydrolysis">卤代烃 · 碱性水溶液</button><button data-chem="elimination">卤代烃 · 碱性醇溶液</button><button data-chem="oxidation">乙醇 · 逐步氧化</button><button data-chem="ester">酯 · 碱性水解</button></div>`;
 if(id==='b05')controls=`${slider('photo-gross','总光合固定CO₂量（同单位）',0,20,10,.5)}${slider('photo-resp','呼吸释放CO₂量（同单位）',0,10,2,.5)}`;
 if(id==='g12')controls=`${slider('solar-lat','观测纬度 φ（北正南负）',-60,60,30,1)}${slider('solar-dec','太阳直射纬度 δ（北正南负）',-23.4,23.4,10,.1)}`;
 return `<section id="precision-lab" class="precision-lab" data-precision="${id}"><div class="section-label">SCIENCE MODEL / 精确关系，动手验证</div><h2>${{m13:'移动一个点，哪些量始终不变？',p18:'改变速率和电荷，什么变、什么不变？',c18:'换一个条件，反应走向就不同。',b05:'把“净值”和“总量”分开调一调。',g12:'太阳高度，由哪两个纬度决定？'}[id]}</h2><div class="precision-controls">${controls}</div><button class="precision-zoom text-button" type="button">放大模型 ↗</button><div class="precision-canvas"></div><div class="precision-readout" role="status" aria-live="polite"></div><p class="precision-boundary"></p></section>`;
}
export function conicState(type,v){
 if(type==='ellipse'){const a=3,b=2,c=Math.sqrt(a*a-b*b),θ=(v+1)*Math.PI,x=a*Math.cos(θ),y=b*Math.sin(θ);return{a,b,c,x,y,d1:Math.hypot(x+c,y),d2:Math.hypot(x-c,y)};}
 if(type==='hyperbola'){const a=2,b=1.5,c=2.5,sign=v<0?-1:1,τ=Math.abs(v)*1.05,x=sign*a*Math.cosh(τ),y=b*Math.sinh(τ);return{a,b,c,x,y,d1:Math.hypot(x+c,y),d2:Math.hypot(x-c,y)};}
 const p=2,y=v*3,x=y*y/(2*p);return{p,x,y,d1:Math.hypot(x-p/2,y),d2:x+p/2};
}
export function magneticState(speed,charge,degrees){const θ=degrees*Math.PI/180,r=speed,T=2*Math.PI;return{r,T,θ,time:θ,Tnormal:T,charge,vx:speed*Math.cos(θ),vy:charge*speed*Math.sin(θ),fx:-speed*Math.sin(θ),fy:charge*speed*Math.cos(θ)};}
export function solarState(latitude,declination){return{height:90-Math.abs(latitude-declination),difference:Math.abs(latitude-declination)};}
export function photoState(gross,respiration){return{gross,respiration,net:gross-respiration};}
export function bindPrecision(root=document){const box=root.querySelector('[data-precision]');if(!box)return;const id=box.dataset.precision;let conic='ellipse',charge=1,chem='hydrolysis';const $=s=>box.querySelector(s);
 function render(){let body='',read='',bound='';
  if(id==='m13'){
   const v=Number($('#conic-point').value),s=conicState(conic,v),scale=56,px=x=>320+x*scale,py=y=>205-y*scale;
   body=l(50,205,595,205,'#cbd3c5')+l(320,35,320,375,'#cbd3c5');
   if(conic==='ellipse')body+=curve(Array.from({length:181},(_,i)=>{const a=i*Math.PI/90;return[px(s.a*Math.cos(a)),py(s.b*Math.sin(a))];}));
   if(conic==='hyperbola')for(const sign of[-1,1])body+=curve(Array.from({length:121},(_,i)=>{const z=(i-60)/60*1.15;return[px(sign*s.a*Math.cosh(z)),py(s.b*Math.sinh(z))];}));
   if(conic!=='parabola')body+=dot(px(-s.c),py(0),'F₁')+dot(px(s.c),py(0),'F₂')+l(px(s.x),py(s.y),px(-s.c),py(0),coral)+l(px(s.x),py(s.y),px(s.c),py(0),teal);
   else{body+=curve(Array.from({length:141},(_,i)=>{const y=(i-70)/70*3;return[px(y*y/(2*s.p)),py(y)];}))+l(px(-s.p/2),35,px(-s.p/2),375,gold)+dot(px(s.p/2),py(0),'F')+dot(px(-s.p/2),py(s.y),'H',gold)+l(px(s.x),py(s.y),px(s.p/2),py(0),coral)+l(px(s.x),py(s.y),px(-s.p/2),py(s.y),teal)+t(px(-s.p/2)-48,25,'准线');}
   body+=dot(px(s.x),py(s.y),'P',ink);
   read=conic==='ellipse'?`PF₁=${fmt(s.d1)}，PF₂=${fmt(s.d2)}；距离和=${fmt(s.d1+s.d2)}=2a。`:conic==='hyperbola'?`PF₁=${fmt(s.d1)}，PF₂=${fmt(s.d2)}；距离差绝对值=${fmt(Math.abs(s.d1-s.d2))}=2a。`:`PF=${fmt(s.d1)}，PH=${fmt(s.d2)}；到焦点与准线始终等距。`;
   bound='模型由方程直接计算，图形与距离同一比例。固定参数分别为椭圆a=3,b=2；双曲线a=2,b=1.5；抛物线y²=4x。切换曲线会改变定义条件。漫画为示意，不按比例测量。';
  }
  if(id==='p18'){
   const speed=Number($('#mag-speed').value),degrees=Number($('#mag-angle').value),s=magneticState(speed,charge,degrees),r=s.r*70,sx=250,sy=200,cx=sx,cy=sy-charge*r;
   for(let x=50;x<620;x+=44)for(let y=40;y<390;y+=42)body+=t(x,y,'×','#b8d2c8',16);
   body+=curve(Array.from({length:101},(_,i)=>{const θ=i/100*Math.PI;return[sx+r*Math.sin(θ),cy+charge*r*Math.cos(θ)];}),'#a1c2b4');
   body+=curve(Array.from({length:81},(_,i)=>{const θ=i/80*s.θ;return[sx+r*Math.sin(θ),cy+charge*r*Math.cos(θ)];}),coral);
   const x=sx+r*Math.sin(s.θ),y=cy+charge*r*Math.cos(s.θ);
   body+=dot(cx,cy,'O',ink)+l(cx,cy,x,y,'#93a99a','5 4')+dot(x,y,charge>0?'+q':'−q',coral)+arrow(x,y,s.vx*48,-s.vy*48,teal)+arrow(x,y,s.fx*40,-s.fy*40,coral)+t(38,27,'×：B垂直向里；青色v，橙色磁力F',ink,15);
   read=`归一化m=|q|=B=1：r=${fmt(s.r)}，T=${fmt(s.T)}，经过${degrees}°用时${fmt(s.time)}。v·F=${fmt(s.vx*s.fx+s.vy*s.fy)}，磁力不做功。`;
   bound='忽略重力及其他作用，速度垂直匀强磁场，非相对论。此处为可核算的归一化模型，不代表真实粒子的质量和电量。图只随你操作变化，不自动循环。';
  }
  if(id==='c18'){
   const data={hydrolysis:{left:'CH₃CH₂Br',right:'CH₃CH₂OH',condition:'NaOH水溶液，加热',note:'Br被OH替换；产物还包括Br⁻。'},elimination:{left:'CH₃CH₂Br',right:'CH₂=CH₂',condition:'NaOH醇溶液，加热',note:'邻碳必须有可脱H；还生成H₂O和Br⁻。'},oxidation:{left:'CH₃CH₂OH',right:'CH₃CHO → CH₃COOH',condition:'分别选择适当氧化剂与条件',note:'分两步表示氧化层级；不是同一试剂必能选择性停在任何一级。'},ester:{left:'CH₃COOCH₂CH₃',right:'CH₃COO⁻ + CH₃CH₂OH',condition:'碱性水解',note:'生成羧酸盐与醇，不能把碱性产物直接写成游离酸。'}}[chem];
   body=`<rect x="30" y="115" width="220" height="145" rx="12" fill="#f5e6ce"/><rect x="365" y="115" width="250" height="145" rx="12" fill="#e3eddd"/>`+t(50,145,'原料',ink,14)+t(48,205,data.left,ink,24)+t(385,145,'产物主体',ink,14)+t(380,205,data.right,ink,chem==='ester'?17:20)+arrow(262,190,88,0,coral)+t(44,80,data.condition,coral,21)+t(35,320,'碳骨架、官能团和条件一起核对',ink,17);
   read=data.note;bound='结构简式为原生文字，可与下方反应条件核对。示意箭头不声称展示反应的完整微观机理。溶剂、温度及底物结构共同决定路线。';
  }
  if(id==='b05'){
   const s=photoState(Number($('#photo-gross').value),Number($('#photo-resp').value)),x0=150,scale=18;
   body=t(30,55,'同一计量口径下：净光合 = 总光合 − 呼吸',ink,20);
   for(const [i,label,val,color]of [[0,'总光合',s.gross,teal],[1,'呼吸',s.respiration,coral],[2,'净光合',s.net,gold]]){const y=110+i*95;body+=t(25,y+28,label,ink,17)+l(x0,y-8,x0,y+55,'#a4b4a1')+`<rect x="${val<0?x0+val*scale:x0}" y="${y}" width="${Math.abs(val)*scale}" height="40" rx="4" fill="${color}"/>`+t(val<0?x0+6:x0+val*scale+9,y+27,fmt(val),color,18);}
   read=`${fmt(s.gross)} − ${fmt(s.respiration)} = ${fmt(s.net)}。${s.net>0?'净吸收CO₂':s.net<0?'净释放CO₂':'CO₂净交换为0'}，不代表光合和呼吸都停止。`;
   bound='所有量须在同时间、面积或质量口径及可比条件下测量。滑块是用于比较的设定参数，不表示光合和呼吸在生理上彼此独立；总量不能未经条件核查直接由暗呼吸估算。';
  }
  if(id==='g12'){
   const φ=Number($('#solar-lat').value),δ=Number($('#solar-dec').value),s=solarState(φ,δ),r=145,cx=225,cy=205,rad=x=>x*Math.PI/180;
   const pt=a=>[cx+r*Math.cos(rad(a)),cy-r*Math.sin(rad(a))],P=pt(φ),D=pt(δ);
   body=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#e1ecda" stroke="${ink}" stroke-width="2"/>`+l(cx,cy,cx+r,cy,'#b3c1ac')+l(cx,cy,...P,coral)+l(cx,cy,...D,teal)+dot(...P,'观测点',coral)+dot(...D,'直射点',teal)+dot(cx,cy,'O',ink);
   const ux=Math.cos(rad(δ)),uy=-Math.sin(rad(δ));
   for(const off of[-50,0,50]){const sx=510+(-uy)*off,sy=165+ux*off;body+=arrow(sx,sy,-ux*135,-uy*135,gold);}
   body+=t(420,55,'平行太阳光',gold,16)+t(38,385,`φ=${φ}°，δ=${δ}°；纬差=${fmt(s.difference)}°`,ink,18);
   read=`H = 90° − |${φ}° − (${δ}°)| = ${fmt(s.height)}°。${φ===δ?'此时太阳直射观测纬度。':'正午太阳高度不是两纬度直接相加。'}`;
   bound='球形地球、地方正午、忽略大气折射与地形遮挡。纬度按北正南负；观测范围限制为±60°以避免极昼夜和太阳低于地平线的额外情形。自转轴倾角不随滑块改变。';
  }
  $('.precision-canvas').innerHTML=svg(body);$('.precision-readout').textContent=read;$('.precision-boundary').textContent=bound;
  box.querySelectorAll('[data-conic]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.conic===conic)));
  box.querySelectorAll('[data-charge]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.charge)===charge)));
  box.querySelectorAll('[data-chem]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chem===chem)));
 }
 $('.precision-zoom').onclick=()=>{const d=document.createElement('dialog');d.className='raster-dialog precision-dialog';d.innerHTML='<div class="raster-dialog-head"><b>精确科学模型 · 可横向滑动查看</b><button aria-label="关闭模型放大">关闭 ×</button></div><div class="precision-zoom-canvas">'+$('.precision-canvas').innerHTML+'</div><p style="padding:16px;font-size:14px;line-height:1.9">'+esc($('.precision-readout').textContent)+'</p>';document.body.append(d);d.showModal();d.querySelector('button').onclick=()=>d.close();d.addEventListener('close',()=>d.remove(),{once:true});};
 box.querySelectorAll('input').forEach(x=>x.addEventListener('input',render));
 box.querySelectorAll('[data-conic]').forEach(b=>b.onclick=()=>{conic=b.dataset.conic;render();});
 box.querySelectorAll('[data-charge]').forEach(b=>b.onclick=()=>{charge=Number(b.dataset.charge);render();});
 box.querySelectorAll('[data-chem]').forEach(b=>b.onclick=()=>{chem=b.dataset.chem;render();});render();
}
