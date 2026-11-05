const timeline=await (await fetch('./conic-timeline.json')).json();
const $=s=>document.querySelector(s),ink='#294c40',orange='#df6d48',teal='#278184',gold='#c3a358';
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return 1-(1-x)**3;};
const tx=(x,y,s,size=25,color=ink,weight=500)=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-family="Microsoft YaHei" font-weight="${weight}">${s}</text>`;
const ln=(x,y,a,b,c=ink,width=3,dash='')=>`<path d="M${x} ${y}L${a} ${b}" fill="none" stroke="${c}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const dot=(x,y,label,color=orange)=>`<circle cx="${x}" cy="${y}" r="6" fill="${color}"/>${label?tx(x+10,y-11,label,22,color,600):''}`;
const curve=(pts,c=teal,progress=1,width=4)=>`<path d="${pts.slice(0,Math.max(2,Math.ceil(pts.length*clamp(progress)))).map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('')}" fill="none" stroke="${c}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const panel=(x,y,w,h,color='#fffdf7')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${color}" stroke="#d5ddca"/>`;
const arrow=(x,y,a,b,c=orange)=>ln(x,y,a,b,c,3)+`<path d="M${a} ${b}l-11 -6v12Z" fill="${c}"/>`;
const axes=(cx,cy)=>ln(cx-245,cy,cx+245,cy,'#d7dfcc',1)+ln(cx,cy-165,cx,cy+165,'#d7dfcc',1);
const note=(x,y,w,title,body,opacity=1)=>`<g opacity="${clamp(opacity)}">${panel(x,y,w,106)}${tx(x+22,y+39,title,23,orange,700)}${tx(x+22,y+78,body,27,ink,600)}</g>`;
function smallCurve(type,cx,cy,p=1){if(type==='ellipse')return curve(Array.from({length:121},(_,i)=>[cx+130*Math.cos(i*Math.PI/60),cy+72*Math.sin(i*Math.PI/60)]),teal,p);if(type==='hyperbola'){let q='';for(const s of[-1,1])q+=curve(Array.from({length:101},(_,i)=>{const y=(i-50)*1.4;return[cx+s*53*Math.sqrt(1+y*y/2100),cy-y];}),orange,p);return q;}return curve(Array.from({length:101},(_,i)=>{const y=(i-50)*1.8;return[cx-48+y*y/100,cy-y];}),gold,p);}
function render(t){t=Math.max(0,Math.min(timeline.duration-.0001,t));const index=timeline.scenes.findIndex(s=>t>=s.start&&t<s.end),s=timeline.scenes[Math.max(0,index)],local=t-s.start,p=local/(s.end-s.start),enter=ease(local/1.2);let art='';
 if(s.id==='question'){
  const y=360;for(const [i,type,name]of [[0,'ellipse','椭圆'],[1,'hyperbola','双曲线'],[2,'parabola','抛物线']]){const x=55+i*405,op=ease((local-i*.28)/.9);art+=`<g opacity="${op}" transform="translate(0 ${(1-op)*40})">${panel(x,230,360,295)}${smallCurve(type,x+180,y,clamp((local-i*.28)/1.6))}${tx(x+133,490,name,27,ink,700)}</g>`;}
  if(local>4.5)art+=`<g opacity="${ease((local-4.5)/1)}">${tx(270,592,'先看「距离」怎样被约束',37,orange,800)}</g>`;
 }
 if(s.id==='ellipse'){
  const cx=350,cy=377,a=235,b=145,c=Math.sqrt(a*a-b*b),θ=(-.8+p*1.6),x=cx+a*Math.cos(θ),y=cy-b*Math.sin(θ),d1=Math.hypot(x-(cx-c),y-cy)/47,d2=Math.hypot(x-(cx+c),y-cy)/47;
  art+=panel(50,206,612,388)+axes(cx,cy)+curve(Array.from({length:181},(_,i)=>[cx+a*Math.cos(i*Math.PI/90),cy-b*Math.sin(i*Math.PI/90)]),teal,ease(local/1.4))+dot(cx-c,cy,'F₁')+dot(cx+c,cy,'F₂');
  if(local>.8)art+=ln(cx-c,cy,x,y,orange)+ln(cx+c,cy,x,y,teal)+dot(x,y,'P',ink);
  art+=note(710,235,500,'一段变长，另一段变短',`PF₁ = ${d1.toFixed(2)}    PF₂ = ${d2.toFixed(2)}`,ease((local-1)/1));
  art+=note(710,373,500,'两段相加，始终不变','PF₁ + PF₂ = 2a = 10',ease((local-2.4)/1));
  art+=tx(730,550,'条件：2a大于两焦点距离。',21,ink,500);
 }
 if(s.id==='hyperbola'){
  const cx=360,cy=390,unit=61,a=2,b=1.5,c=2.5,τ=.12+p*.9,x=a*Math.cosh(τ),y=b*Math.sinh(τ),d1=Math.hypot(x+c,y),d2=Math.hypot(x-c,y);
  art+=panel(50,205,622,393)+axes(cx,cy);
  for(const sign of[-1,1])art+=curve(Array.from({length:121},(_,i)=>{const z=(i-60)/60*1.16;return[cx+sign*a*Math.cosh(z)*unit,cy-b*Math.sinh(z)*unit];}),teal,ease(local/1.2));
  art+=dot(cx-c*unit,cy,'F₁')+dot(cx+c*unit,cy,'F₂');
  for(const sign of[-1,1]){const px=cx+sign*x*unit,py=cy-y*unit,op=sign>0?enter:ease((local-3.2)/1.1);art+=`<g opacity="${op}">${ln(cx-c*unit,cy,px,py,orange)}${ln(cx+c*unit,cy,px,py,teal)}${dot(px,py,sign>0?'P右':'P左',ink)}</g>`;}
  art+=note(715,230,495,'右支：远减近',`${d1.toFixed(2)} − ${d2.toFixed(2)} = 4`,ease((local-.8)/1));
  art+=note(715,365,495,'左支：交换远近','距离差变为−4，绝对值仍为4',ease((local-3.2)/1));
  art+=tx(738,550,'|PF₁ − PF₂| = 2a',34,orange,700);
 }
 if(s.id==='parabola'){
  const cx=290,cy=385,unit=55,param=2,Y=-2.5+p*5,X=Y*Y/(2*param),px=cx+X*unit,py=cy-Y*unit,fx=cx+unit,hx=cx-unit,d=X+1;
  art+=panel(50,202,620,399)+axes(cx,cy)+ln(hx,225,hx,570,gold,3)+tx(hx-40,588,'准线',20,gold,600)+dot(fx,cy,'F');
  art+=curve(Array.from({length:151},(_,i)=>{const y=(i-75)/75*3;return[cx+y*y/4*unit,cy-y*unit];}),teal,ease(local/1.5));
  if(local>1)art+=ln(px,py,fx,cy,orange)+ln(px,py,hx,py,teal)+dot(px,py,'P',ink)+dot(hx,py,'H',gold)+ln(hx,py,hx+10,py,ink,2)+ln(hx+10,py,hx+10,py+10,ink,2);
  art+=note(715,225,495,'比较对象换了','一个焦点F + 一条准线',ease((local-.7)/1));
  art+=note(715,363,495,'两段距离始终相等',`PF = PH = ${d.toFixed(2)}`,ease((local-2)/1));
  art+=tx(740,550,'PH必须垂直于准线。',25,orange,700);
 }
 if(s.id==='choose'){
  const choices=[['和不变','椭圆','PF₁+PF₂=2a'],['差的绝对值不变','双曲线','|PF₁−PF₂|=2a'],['点线等距','抛物线','PF=PH']];
  choices.forEach((a,i)=>{const active=Math.floor(p*3)===i,x=50+i*412,op=ease((local-i*.35)/.8);art+=`<g opacity="${op}" transform="translate(0 ${(1-op)*30})">${panel(x,240,385,300,active?'#e6efda':'#fffdf7')}${tx(x+22,285,`0${i+1} / 先认条件`,17,orange,600)}${tx(x+22,348,a[0],26,ink,700)}${tx(x+22,409,a[1],43,active?orange:teal,800)}${tx(x+22,482,a[2],25,ink,600)}</g>`;});
 }
 if(s.id==='example'){
  const cx=345,cy=410,a=250,b=150,c=200;art+=panel(50,200,625,406)+axes(cx,cy)+curve(Array.from({length:181},(_,i)=>[cx+a*Math.cos(i*Math.PI/90),cy-b*Math.sin(i*Math.PI/90)]),teal,enter)+dot(cx-c,cy,'F₁')+dot(cx+c,cy,'F₂')+dot(cx,cy,'O',ink);
  if(local>1.2)art+=`<g opacity="${ease((local-1.2)/1)}"><path d="M${cx},${cy}L${cx},${cy-b}L${cx+c},${cy}Z" fill="#ebd7b833" stroke="${orange}" stroke-width="3"/>${tx(cx-58,cy-b/2,'b=3',24)}${tx(cx+c/2-15,cy+32,'c=?',24)}${tx(cx+c/2+14,cy-b/2-10,'a=5',24)}</g>`;
  art+=note(715,220,500,'先看标准式','a = 5，b = 3',ease(local/1));art+=note(715,354,500,'椭圆关系：c²=a²−b²','c² = 25 − 9 = 16',ease((local-2.4)/1));
  art+=`<g opacity="${ease((local-5.2)/1)}">${tx(738,535,'c = 4',42,ink,800)}${tx(930,535,'焦距 2c = 8',35,orange,800)}</g>`;
 }
 if(s.id==='connect'){
  const words=[['画面','辨认研究对象'],['距离','说出不变条件'],['方程','选择计算工具']];
  words.forEach((a,i)=>{const x=75+i*410,op=ease((local-i*.6)/1);art+=`<g opacity="${op}" transform="translate(${(1-op)*-40} 0)">${panel(x,275,320,220,i===1?'#e7efdc':'#fffdf7')}${tx(x+92,362,a[0],52,i===1?orange:teal,800)}${tx(x+55,435,a[1],24,ink,600)}</g>`;if(i<2)art+=`<g opacity="${ease((local-i*.6-.5)/1)}">${arrow(x+335,385,x+390,385)}</g>`;});
  art+=tx(315,580,'下一步：换一个条件，验证你的理解。',29,orange,700);
 }
 if(s.id==='credits'){
  art+=tx(345,315,'原理看得见，方法接得上。',37,teal,800)+tx(315,393,'原创讲解与图形 · 本地Qwen合成旁白',22)+tx(220,442,"Music: ‘A Kind Of Hope’ — Scott Buckley · CC BY 4.0",21)+tx(395,478,'www.scottbuckley.com.au',21)+tx(345,550,'教材原理复习稿，教师教审待进行',19,'#7f8a73');
 }
 $('#art').innerHTML=`<svg viewBox="0 0 1280 720" width="1280" height="720">${art}</svg>`;
 $('#heading').textContent=s.title;$('#kicker').textContent=s.kicker;
 $('#heading').style.opacity=enter;$('#heading').style.transform=`translateY(${(1-enter)*15}px)`;
 const caption=timeline.subtitles.find(c=>t>=c[0]&&t<c[1]);$('#subtitle').textContent=caption?.[2]||'';$('#subtitle').style.visibility=caption?'visible':'hidden';
 $('#scene-count').textContent=`${String(index+1).padStart(2,'0')} / ${timeline.scenes.length}`;$('#progress').style.width=`${100*t/timeline.duration}%`;
 return {scene:s.id,time:t,caption:caption?.[2]||null};
}
window.renderMovie=render;window.movieTimeline=timeline;render(0);window.movieReady=true;
