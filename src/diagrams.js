// Original finite scientific transitions. progress is not calibrated physical time.
const C={ink:'#273831',orange:'#ef6844',teal:'#267c75',blue:'#648ac0',muted:'#839080',gold:'#d1a13b',paper:'#fffaf0'};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(Number(x))?Number(x):a));
const lerp=(a,b,p)=>a+(b-a)*p;
const fmt=(x,d=2)=>Number(x).toFixed(d);
const xml=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const text=(x,y,t,c=C.ink,size=17,extra='')=>'<text x="'+x+'" y="'+y+'" fill="'+c+'" font-size="'+size+'" '+extra+'>'+xml(t)+'</text>';
const line=(x1,y1,x2,y2,c=C.ink,w=2,extra='')=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+c+'" stroke-width="'+w+'" '+extra+'/>';
const dot=(x,y,r=6,c=C.orange)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+c+'" stroke="'+C.paper+'" stroke-width="2"/>';
const rect=(x,y,w,h,c,rx=10,extra='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+c+'" '+extra+'/>';
function arrow(x1,y1,x2,y2,c=C.orange,w=3,p=1){
  p=clamp(p);if(p<.015)return '';
  const x=lerp(x1,x2,p),y=lerp(y1,y2,p),a=Math.atan2(y2-y1,x2-x1),r=8+w;
  return line(x1,y1,x,y,c,w,'stroke-linecap="round"')+'<path d="M'+x+' '+y+'L'+(x-r*Math.cos(a-.43))+' '+(y-r*Math.sin(a-.43))+'L'+(x-r*Math.cos(a+.43))+' '+(y-r*Math.sin(a+.43))+'Z" fill="'+c+'"/>';
}
function tag(x,y,t,c=C.teal,size=15){return rect(x,y-21,Math.min(590-x,Math.max(70,t.length*size+20)),31,c,15,'fill-opacity=".10"')+text(x+10,y,t,c,size);}
function frame(body,label,id,s,p,small){
  const uid=id+'-'+s+(small?'-thumb':'-live');
  return '<svg class="science-svg" viewBox="0 0 640 330" role="img" aria-label="'+xml(label)+'" data-model="'+id+'" data-stage="'+s+'" data-progress="'+fmt(p,3)+'" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid-'+uid+'" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#d6dccd" stroke-width=".7"/></pattern><clipPath id="plot-'+uid+'"><rect x="66" y="22" width="378" height="269"/></clipPath></defs><g font-family="Microsoft YaHei, PingFang SC, sans-serif">'+body+'</g></svg>';
}
export function diagram(id,step=0,value=1,thumb=false,progress=1){
  const s=Math.round(clamp(step,0,5)),p=thumb?1:clamp(progress);
  if(id==='derivative')return derivative(s,value,thumb,p);
  if(id==='energy')return energy(s,value,thumb,p);
  if(id==='equilibrium')return equilibrium(s,value,thumb,p);
  if(id==='meiosis')return meiosis(s,thumb,p);
  if(id==='sea-breeze')return breeze(s,value,thumb,p);
  return frame(text(80,160,'本主题尚无科学示意图'),'尚无科学示意图','unknown',s,p,thumb);
}
export function derivativeState(step=0,value=.8,progress=1){
  const s=Math.round(clamp(step,0,5)),p=clamp(progress),a=s===5?-1:1;
  const dx=s===1?1:s===2?lerp(1,.10,p):s===3?lerp(.45,.015,p):clamp(value,.05,1.5);
  return {a,dx,q:a+dx,secantSlope:2*a+dx,tangentSlope:2*a,tangentIntercept:-a*a};
}
function derivative(s,v,small,p){
  const st=derivativeState(s,v,p),a=st.a,dx=st.dx,k=st.secantSlope;
  const px=x=>225+x*74,py=y=>270-y*36,uid='derivative-'+s+(small?'-thumb':'-live');
  const curve=Array.from({length:100},(_,i)=>{const x=-2.1+i*.049;return (i?'L':'M')+px(x)+','+py(x*x);}).join(' ');
  const gl=(slope,anchor,color,width=2,extra='')=>'<path d="M'+px(-2.2)+' '+py(anchor*anchor+slope*(-2.2-anchor))+'L'+px(2.95)+' '+py(anchor*anchor+slope*(2.95-anchor))+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" '+extra+'/>';
  let b=rect(66,22,378,269,'url(#grid-'+uid+')',0)+arrow(70,270,444,270,C.ink,2)+arrow(225,289,225,24,C.ink,2);
  b+=text(447,282,'x',C.ink,17)+text(208,27,'y',C.ink,17)+text(82,47,'y = x²',C.teal,23);
  for(const x of [-1,1,2])b+=line(px(x),266,px(x),275,C.ink,1)+text(px(x)-6,290,x,C.muted,14);
  let plots='<path d="'+curve+'" fill="none" stroke="'+C.teal+'" stroke-width="4"/>';
  if(s===0){
    plots+=gl(-2,-1,C.blue,3)+gl(2,1,C.orange,3);
    b+=line(px(-1),py(1),px(1),py(1),C.muted,1,'stroke-dasharray="5 4"')+dot(px(-1),py(1),6,C.blue)+dot(px(1),py(1));
    b+=text(467,91,'同样高度',C.ink,18)+text(467,127,'f(-1)=f(1)=1',C.teal,16)+text(467,175,'左边斜率 -2',C.blue,17)+text(467,210,'右边斜率 +2',C.orange,17);
  }else{
    const q=a+dx;
    if(s<=2)plots+=gl(k,a,C.orange,3);
    if(s===3)plots+=gl(2,a,C.orange,3)+gl(k,a,C.blue,2,'stroke-dasharray="5 4" opacity="'+(1-p)+'"');
    if(s>=4)plots+=gl(2*a,a,C.orange,3)+gl(k,a,C.blue,2,'stroke-dasharray="6 4"');
    b+=dot(px(a),py(a*a),7,C.orange)+text(px(a)-22,py(a*a)-15,'P',C.orange,20);
    if(s!==3)b+=line(px(a),py(a*a),px(q),py(a*a),C.muted,1,'stroke-dasharray="4 4"')+line(px(q),py(a*a),px(q),py(q*q),C.muted,1,'stroke-dasharray="4 4"')+dot(px(q),py(q*q),6,C.blue)+text(px(q)+10,py(q*q)-9,'Q',C.blue,18);
    if(s===1)b+=text(467,87,'P(1,1)',C.orange,18)+text(467,121,'Q(2,4)',C.blue,18)+text(467,173,'割线斜率',C.ink,17)+text(467,213,'k = 3',C.orange,25);
    if(s===2)b+=text(467,82,'h = '+fmt(dx),C.blue,18)+text(467,116,'k = '+fmt(k),C.orange,20)+text(467,165,'从右：2+h',C.ink,16)+text(467,199,'从左：2−|h|',C.ink,16)+text(467,238,'两侧都趋近 2',C.teal,17);
    if(s===3)b+=text(467,83,'h → 0',C.blue,22)+text(467,128,'f′(1) = 2',C.orange,23)+text(467,178,'切线经过 P',C.ink,17)+text(467,215,'y = 2x−1',C.ink,20);
    if(s===4)b+=text(467,74,'f′(x) = 2x',C.orange,23)+text(467,116,'x<0：递减',C.blue,17)+text(467,151,'x>0：递增',C.teal,17)+text(467,198,'对照割线',C.ink,16)+text(467,231,'k = '+fmt(k),C.blue,19);
    if(s===5)b+=text(467,76,'P(-1,1)',C.orange,20)+text(467,116,'f′(-1) = −2',C.orange,21)+text(467,160,'y = −2x−1',C.ink,19)+text(467,203,'割线 k=−2+h',C.blue,16)+text(467,235,'= '+fmt(k),C.blue,21);
  }
  b='<g clip-path="url(#plot-'+uid+')">'+plots+'</g>'+b;
  const caps=['同一高度，切线可以朝相反方向倾斜。','先取两点，平均变化率由割线斜率表示。','Q 靠近 P；h 仍非零，不能直接用分母零计算。','切线斜率是差商的极限，不是任意一条割线。','实线为切线，虚线为割线；拖动 h 比较两者。','切点换到 x=−1，切线与割线都必须重新计算。'];
  b+=text(43,319,caps[s],C.muted,small?14:15);
  return frame(b,'y等于x平方，第'+(s+1)+'幕；'+caps[s],'derivative',s,p,small);
}
export function energyState(step=0,value=.36,progress=1){
  const s=Math.round(clamp(step,0,5)),p=clamp(progress),loss=clamp(value,0,.5);
  const pos=[0,.28,.5,.68,.68,.5],from=s===0?0:s===3?.5:pos[Math.max(0,s-1)];
  const t=s<4?lerp(from,pos[s],p):pos[s],height=s===5?0:Math.cos(Math.PI*t)**2;
  const dissipated=s<3?0:s===3?loss*p:loss,potential=height,kinetic=Math.max(0,1-height-dissipated);
  return {t,x:60+370*t,y:75+170*Math.sin(Math.PI*t)**2,height,potential,kinetic,dissipated,total:potential+kinetic+dissipated,initialJ:50,kineticJ:50*(s===5?1-loss:kinetic),dissipatedJ:50*dissipated};
}
function bars(rows,x=455,y=116,width=142){return rows.map((r,i)=>text(x-2,y+i*58,r[0],r[2],16)+rect(x,y+10+i*58,width,16,'#e1e3d5',7)+rect(x,y+10+i*58,Math.max(0,r[1])*width,16,r[2],7)).join('');}
function energy(s,v,small,p){
  const e=energyState(s,v,p);let b='';
  if(s<4){
    const track=Array.from({length:101},(_,i)=>(i?'L':'M')+(60+370*i/100)+','+(75+170*Math.sin(Math.PI*i/100)**2)).join(' ');
    const t=e.t,x=e.x,y=e.y,angle=Math.atan(170*Math.PI*Math.sin(2*Math.PI*t)/370)*180/Math.PI;
    b+=text(45,34,s===0?'先定零势能面，再看能量账本':s===1?'理想段：势能减少，动能增加':s===2?'同样的高度差，比较末速率':'加入滑动制动段',C.ink,20);
    b+='<path d="'+track+'" fill="none" stroke="'+C.ink+'" stroke-width="4"/>'+line(43,245,434,245,C.muted,1,'stroke-dasharray="5 4"');
    if(s===2)b+='<path d="M60 75 Q225 78 245 245" fill="none" stroke="'+C.blue+'" stroke-width="2.5" stroke-dasharray="6 5"/>'+text(60,56,'两条光滑轨道：同起点、同终点',C.muted,14);
    if(s===3){const rough=Array.from({length:30},(_,i)=>{const tt=.51+i*.17/29;return (i?'L':'M')+(60+370*tt)+','+(75+170*Math.sin(Math.PI*tt)**2);}).join(' ');b+='<path d="'+rough+'" fill="none" stroke="'+C.gold+'" stroke-width="9" stroke-dasharray="3 4"/>';}
    b+='<g transform="translate('+x+','+(y-11)+') rotate('+angle+')">'+rect(-21,-20,42,25,C.orange,8,'stroke="'+C.ink+'" stroke-width="2"')+'<circle cx="-12" cy="9" r="6" fill="'+C.ink+'"/><circle cx="12" cy="9" r="6" fill="'+C.ink+'"/></g>';
    b+=arrow(x+35,y-14,x+35,y+19,C.teal,2)+text(x+45,y+6,'mg',C.teal,15);
    b+=text(43,278,'h=0',C.muted,15)+bars([['重力势能',e.potential,C.teal],['动能',e.kinetic,C.orange],['内能增量',e.dissipated,C.gold]],459,93,135);
    if(s===2)b+=tag(70,295,'光滑可达时，v²=2gΔh',C.teal,15);
    b+=text(43,319,s===3?'能量条合计为初始能量；动画进度不代表物理时间。':'质点、固定光滑轨道；能量归一化，进度不代表物理时间。',C.muted,14);
  }else if(s===4){
    b+=text(45,34,'放大账本：机械能减少，内能增加',C.ink,21);
    b+=rect(55,69,218,188,'#edf0e5',16,'stroke="'+C.teal+'" stroke-width="2"')+text(81,106,'小车 + 地球',C.teal,20)+text(81,142,'机械能剩余',C.ink,18)+text(82,193,fmt((1-e.dissipated)*100,0)+'%',C.teal,39);
    b+=(e.dissipated>0?arrow(286,161,352,161,C.gold,5,p):'')+text(286,136,e.dissipated>0?'摩擦转化':'零耗散',C.gold,15);
    b+=rect(369,69,216,188,'#f5ecd5',16,'stroke="'+C.gold+'" stroke-width="2"')+text(395,106,'小车 + 制动轨道',C.gold,18)+text(395,142,'内能增加',C.ink,18)+text(396,193,fmt(e.dissipated*100,0)+'%',C.gold,39);
    b+=text(76,291,'两部分合计 100%；不是能量凭空消失。',C.ink,19);
  }else{
    const loss=e.dissipated,ek=50*(1-loss),q=50*loss;
    b+=text(45,34,'回到题目：终点 h=0，查能量去向',C.ink,21);
    b+=rect(56,72,528,40,'#e2e5d7',8)+rect(56,72,528*(1-loss),40,C.orange,8)+rect(56+528*(1-loss),72,528*loss,40,C.gold,8);
    b+=text(56,145,'初始机械能 50 J',C.ink,20)+text(56,191,'末动能 '+fmt(ek,0)+' J',C.orange,26)+text(354,191,'内能增加 '+fmt(q,0)+' J',C.gold,23)+text(87,244,'50 = '+fmt(ek,0)+' + '+fmt(q,0)+'  (J)',C.ink,32);
    b+=tag(81,288,Math.abs(loss-.36)<.001?'题例：Wf=−18 J，末速度 8 m/s':'当前为参数对照，题例取耗散18 J',C.teal,16);
  }
  return frame(b,'机械能第'+(s+1)+'幕；势能、动能与内能按同一初始能量归一化，合计为一','energy',s,p,small);
}
export function equilibriumState(step=0,value=.5,progress=1){
  const s=Math.round(clamp(step,0,5)),p=clamp(progress),target=clamp(value,.4,1);
  const volume=s<2?1:s===2?lerp(1,target,p):target,initialA=1.5,initialB=2.25;
  const instantA=initialA/volume,instantB=initialB/volume,eqA=(-1+Math.sqrt(1+48/volume))/4,eqB=eqA*eqA;
  const extent=s<3?0:s===3?p:1,a=lerp(instantA,eqA,extent),b=instantB+(instantA-a)/2;
  return {volume,a,b,q:b/(a*a),K:1,nitrogenUnits:volume*(a+2*b),initialA,initialB,instantA,instantB,eqA,eqB,extent};
}
function moleculeUnit(x,y,dir=1,scale=1){return '<g transform="translate('+x+','+y+') scale('+scale+')">'+line(0,0,dir*10,-9,C.ink,1.3)+line(0,0,dir*10,9,C.ink,1.3)+'<circle cx="0" cy="0" r="4.5" fill="'+C.blue+'"/><circle cx="'+(dir*10)+'" cy="-9" r="4" fill="'+C.orange+'"/><circle cx="'+(dir*10)+'" cy="9" r="4" fill="'+C.orange+'"/></g>';}
function chamber(e,s,p){
  const w=290*e.volume,left=52;let b=rect(left,70,w,196,'#e9bdac',12,'fill-opacity="'+Math.min(.28,.06*e.a)+'" stroke="'+C.ink+'" stroke-width="2.5"')+rect(left+w-4,62,13,212,'#a4afa0',4,'stroke="'+C.ink+'" stroke-width="2"');
  for(let i=0;i<6;i++){const cx=left+w*(i%2?.75:.25),cy=104+Math.floor(i/2)*64,bind=i<3?1:i===3?e.extent:0,gap=lerp(13,6,bind),drift=s<2?(1-p)*((i%2?1:-1)*5):0;b+=line(cx-gap+drift,cy,cx+gap+drift,cy,C.ink,1.3,'opacity="'+bind+'"')+moleculeUnit(cx-gap+drift,cy,-1,.72)+moleculeUnit(cx+gap+drift,cy,1,.72);}
  return b;
}
function equilibrium(s,v,small,p){
  const e=equilibriumState(s,v,p),compressed=e.volume<.999999;let b=text(45,34,'2 NO₂(g)  ⇌  N₂O₄(g)',C.ink,25);
  if(s===4){
    const vals=[e.initialA,e.instantA,lerp(e.instantA,e.eqA,p)],names=['压缩前','压缩瞬间','新平衡'];
    vals.forEach((a,i)=>{const x=66+i*190;b+=rect(x,83,126,142,'#b35632',10,'fill-opacity="'+Math.min(.8,.18*a)+'" stroke="'+C.ink+'" stroke-width="2"')+text(x-2,63,names[i],C.ink,18)+text(x+5,255,'c(NO₂)='+fmt(a),C.ink,16);});
    b+=text(52,302,compressed?'先变深，再相对“压缩瞬间”变浅；比较必须说清参照时刻。':'体积未变，三个时刻的浓度相同；仍是动态平衡。',C.muted,16);
  }else if(s===5){
    b+=text(67,82,'压缩前的平衡',C.teal,20)+text(365,82,'同温下的新平衡',C.teal,20)+text(67,125,'c(NO₂) = 1.50',C.ink,19)+text(67,160,'c(N₂O₄) = 2.25',C.ink,19)+text(365,125,'c(NO₂) = '+fmt(e.eqA),C.ink,19)+text(365,160,'c(N₂O₄) = '+fmt(e.eqB),C.ink,19);
    b+=arrow(270,134,337,134,C.orange,4,p)+text(72,222,'Qc=Kc=1',C.orange,27)+text(370,222,'Qc=Kc=1',C.orange,27)+tag(71,275,'浓度可以改变，同温 Kc 不变',C.teal,18)+text(56,315,'数值为 Kc=1 的归一化模型，不是实测浓度。',C.muted,15);
  }else{
    b+=chamber(e,s,p);
    if(s<=1)b+=text(377,88,s===0?'颜色稳定，反应继续':'相等的是反应速率',C.ink,18)+arrow(384,119,570,119,C.orange,3,p)+arrow(570,165,384,165,C.teal,3,p)+text(383,108,'正反应',C.orange,16)+text(383,195,'逆反应',C.teal,16)+text(377,231,'v正 = v逆',C.ink,22)+text(377,265,'浓度不必相等',C.ink,18);
    else b+=text(372,80,!compressed?'体积未变：没有压缩':s===2?'等温压缩的瞬间':'随后：净反应向右',C.ink,18)+text(372,120,'相对 V = '+fmt(e.volume),C.ink,18)+text(372,161,'Qc/Kc = '+fmt(e.q),C.orange,23)+text(372,204,!compressed?'Q=K，不发生净移动':s===2?'两种浓度同时增大':'起点 Q<K → 重新平衡',C.ink,16)+text(372,241,s===2?'Kc 未改变':'终点 Qc=Kc，仍动态',C.teal,17)+text(372,277,'Kc = 1（归一化）',C.muted,15);
    b+=text(46,302,'蓝色N、橙色O；代表性分子不按数量比例表示浓度。',C.muted,14);
    if(!small)b+=text(46,324,'数值模型固定温度，守恒 n(NO₂)+2n(N₂O₄)。',C.muted,14);
  }
  return frame(b,'化学平衡第'+(s+1)+'幕；体积变化与反应重建分开表示，分子为定性图','equilibrium',s,p,small);
}
function chromosome(x,y,color,length=40,copies=2,spread=9){
  const h=length/2;
  if(copies===1)return line(x,y-h,x,y+h,color,6,'stroke-linecap="round"')+dot(x,y,2.4,color);
  return line(x-spread,y-h,x+spread,y+h,color,6,'stroke-linecap="round"')+line(x+spread,y-h,x-spread,y+h,color,6,'stroke-linecap="round"')+dot(x,y,2.4,color);
}
const cell=(x,y,rx,ry,opacity=1)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#edf0e4" fill-opacity=".8" stroke="'+C.ink+'" stroke-width="2" opacity="'+opacity+'"/>';
function meiosis(s,small,p){
  let b=text(43,32,['复制前：先认两对同源','复制一次：DNA数量加倍','减Ⅰ前期：同源配对','减Ⅰ：同源分离，姐妹仍相连','减Ⅱ：姐妹分离，不再复制','产物类型：不能一律画成卵子'][s],C.ink,21);
  if(s<3){
    b+=cell(320,155,166,103);
    const xs=s===2?[lerp(249,265,p),lerp(296,289,p),lerp(353,355,p),lerp(400,379,p)]:[249,296,353,400];
    [C.orange,C.blue,C.orange,C.blue].forEach((c,i)=>{b+=chromosome(xs[i],153,c,i<2?58:36,s===0?1:2,s===1?lerp(0,9,p):9);});
    if(s===2)b+='<ellipse cx="277" cy="153" rx="35" ry="43" fill="none" stroke="'+C.teal+'" stroke-width="2" stroke-dasharray="5 4" opacity="'+p+'"/><ellipse cx="367" cy="153" rx="35" ry="32" fill="none" stroke="'+C.teal+'" stroke-width="2" stroke-dasharray="5 4" opacity="'+p+'"/>'+text(219,233,'同源对①',C.teal,15)+text(350,233,'同源对②',C.teal,15);
    b+=text(48,285,s===0?'每细胞：4条染色体 / 4个核DNA分子':'完成后每细胞：4条染色体 / 8个核DNA分子',C.ink,19);
  }else if(s===3){
    b+=cell(320,155,166,103,1-p)+cell(185,155,94,91,p)+cell(455,155,94,91,p);
    const start=[265,289,355,379],target=[165,435,205,475];
    [C.orange,C.blue,C.orange,C.blue].forEach((c,i)=>{b+=chromosome(lerp(start[i],target[i],p),155,c,i<2?58:36,2,9);});
    b+=text(48,285,'减Ⅰ完成后每细胞：2条染色体 / 4个核DNA分子',C.ink,19);
  }else if(s===4){
    [185,455].forEach(x=>b+=cell(x,155,94,91,1-p));[110,250,390,530].forEach(x=>b+=cell(x,155,62,75,p));
    [185,455].forEach((parent,i)=>{const color=i===0?C.orange:C.blue;[0,1].forEach(j=>{const len=j===0?48:28,base=parent+(j===0?-21:21);[0,1].forEach(side=>{const target=[110,250,390,530][2*i+side]+(j===0?-15:15),top=base+(side===0?-9:9),bottom=base+(side===0?9:-9);b+=line(lerp(top,target,p),155-len/2,lerp(bottom,target,p),155+len/2,color,6,'stroke-linecap="round"')+dot(lerp(base,target,p),155,2.4,color);});});});
    b+=text(48,285,'减Ⅱ完成后每细胞：2条染色体 / 2个核DNA分子',C.ink,19);
  }else{
    b+=rect(44,62,263,202,'#edf0e4',15)+rect(330,62,266,202,'#f5e9dc',15);
    [103,246].forEach((x,i)=>[125,213].forEach(y=>{const color=i===0?C.orange:C.blue;b+=cell(x,y,42,31)+chromosome(x-10,y,color,28,1)+chromosome(x+10,y,color,18,1);}));
    b+=text(63,89,'精细胞形成简图',C.teal,19)+text(77,258,'四个精细胞，还需分化',C.ink,17)+cell(463,163,57,56)+chromosome(448,163,C.blue,39,1)+chromosome(478,163,C.blue,25,1)+text(347,89,'卵子发生另有分工',C.orange,19)+text(357,239,'一个功能卵细胞',C.ink,18)+text(377,261,'其余进入极体',C.muted,16);
    b+=text(51,301,'四个等大产物不能照搬卵子发生；也不保证基因型全不同。',C.ink,17);
  }
  b+=text(47,325,'2n=4模型；长短标不同染色体，颜色标来源；未展开互换和异常分离。',C.muted,13.5);
  return frame(b,'减数分裂2n等于4，第'+(s+1)+'幕；染色体与核DNA按每细胞及指定完成阶段计数','meiosis',s,p,small);
}
function breeze(s,v,small,p){
  const night=s===4||s===5&&Number(v)===1,sea=177,land=466,warm=night?sea:land,cool=night?land:sea;
  let b=rect(35,49,570,254,night?'#e2e8ed':'#f7efdf',20);
  b+='<path d="M35 252Q85 244 135 253T235 252L321 252V303H35Z" fill="#99c8cf"/><path d="M321 252L353 228 398 240 450 228 504 239 605 220V303H321Z" fill="#d6bd84"/>';
  b+=text(45,32,night?'夜间陆风：先比较海陆相对冷热':'白天海风：热力差异驱动局地环流',C.ink,20)+'<circle cx="570" cy="80" r="17" fill="'+(night?'#f6f3d6':'#efbf4c')+'"/>';
  if(night)b+='<circle cx="578" cy="74" r="15" fill="#e2e8ed"/>';
  b+=text(111,288,'海洋',C.teal,20)+text(454,288,'陆地','#8a6a34',20)+text(sea-58,75,night?'海面相对暖':'海面相对冷',night?C.orange:C.blue,17)+text(land-59,75,night?'陆面相对冷':'陆面相对暖',night?C.blue:C.orange,17);
  if(s===0)b+=rect(120,130,42,90,C.blue,6)+rect(432,lerp(154,103,p),42,lerp(66,117,p),C.orange,6)+text(80,248,'温度变化较缓',C.blue,17)+text(416,248,'升温较快',C.orange,17)+text(242,166,'相对比较',C.ink,22);
  else{
    const vertical=s===1?p:1,ground=s===2?p:s>=3?clamp(p*4):.22,top=s>=3?clamp(p*4-2):.16;
    b+=arrow(warm,221,warm,111,C.orange,4,s===3?clamp(p*4-1):vertical)+arrow(cool,111,cool,221,C.blue,4,s===3?clamp(p*4-3):vertical);
    if(s>=2)b+=arrow(cool+(cool<warm?17:-17),224,warm+(cool<warm?-17:17),224,C.teal,4,ground);
    if(s>=3)b+=arrow(warm+(warm<cool?17:-17),111,cool+(warm<cool?-17:17),111,C.orange,3,top);
    b+=text(cool<320?cool-112:cool+25,198,'相对高压',C.blue,16)+text(warm<320?warm-112:warm+25,198,'相对低压',C.orange,16)+text(253,177,s===1?'先看竖直运动':night?'陆风：陆→海':'海风：海→陆',C.ink,20);
    if(s>=3)b+=text(258,99,'高空回流',C.muted,15);
  }
  const caps=['温度条仅作相对示意，不是测量数据。','近地面气压在同一高度比较；暖侧上升、冷侧下沉。','风按来向命名：从海面吹来，称海风。','四支环流闭合；高空回流与近地面风相反。','适合形成陆风时环流反向；并非每天准时换班。','模型条件：晴朗、背景风弱；强季风或台风时需另行分析。'];
  b+=text(43,324,caps[s],C.muted,small?14:15);
  return frame(b,(night?'夜间':'白天')+'海陆风第'+(s+1)+'幕；'+caps[s],'sea-breeze',s,p,small);
}
export const modelControls={
  derivative:{label:'移动 Q，比较割线与切线',min:.05,max:1.5,step:.05,initial:.8,left:'更接近',right:'更远'},
  energy:{label:'比较摩擦造成的能量转移（示意）',min:0,max:.5,step:.02,initial:.36,left:'较少',right:'较多'},
  equilibrium:{label:'改变容器体积（相对值）',min:.4,max:1,step:.05,initial:.5,left:'压缩',right:'还原'},
  'sea-breeze':{label:'比较白天与夜晚',min:0,max:1,step:1,initial:0,left:'白天',right:'夜晚'}
};
