import {writeFile,mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const ink='#164c48',red='#e76542',blue='#268bc0';
const text=(x,y,s,size=20)=>`<text x="${x}" y="${y}" font-family="Microsoft YaHei" font-size="${size}" fill="${ink}">${s}</text>`;
const dot=(x,y,label,color=red)=>`<circle cx="${x}" cy="${y}" r="5" fill="${color}"/>${label?text(x+7,y-8,label,18):''}`;
const line=(x,y,a,b,color=ink,dash='')=>`<path d="M${x},${y}L${a},${b}" fill="none" stroke="${color}" stroke-width="3" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const path=(points,color=ink)=>`<path d="${points.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`).join('')}" fill="none" stroke="${color}" stroke-width="3"/>`;
function ellipse(cx,cy,a=140,b=70){const f=Math.sqrt(a*a-b*b);return `<ellipse cx="${cx}" cy="${cy}" rx="${a}" ry="${b}" fill="none" stroke="${ink}" stroke-width="3"/>`+dot(cx-f,cy,'F₁')+dot(cx+f,cy,'F₂')+dot(cx,cy,'O',ink);}
function hyper(cx,cy,a=65,b=45){const f=Math.hypot(a,b);let out='';for(const sign of [-1,1])out+=path(Array.from({length:101},(_,i)=>{const y=(i-50)*2;return [cx+sign*a*Math.sqrt(1+y*y/(b*b)),cy-y];}));return out+dot(cx-f,cy,'F₁')+dot(cx+f,cy,'F₂')+line(cx-190,cy,cx+190,cy,'#aab4a9');}
function parab(vx,vy,p=60){const px=vx+45,py=vy-Math.sqrt(2*p*45),direct=vx-p/2;return path(Array.from({length:101},(_,i)=>{const y=(i-50)*2;return[vx+y*y/(2*p),vy-y];}))+line(direct,vy-130,direct,vy+130)+dot(vx+p/2,vy,'F')+dot(px,py,'P',ink)+dot(direct,py,'H',ink)+line(px,py,vx+p/2,vy,blue)+line(px,py,direct,py,red)+text(direct-10,vy+155,'准线',18);}
const common=(title,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1536" viewBox="0 0 1024 1536"><rect width="1024" height="1536" fill="#fffdf4"/>${text(35,45,title,25)}${body}</svg>`;
const m13=common('精确科学参考：保留原漫画角色和对话，仅按这里纠正图形',[
 text(35,100,'左上：椭圆，焦点在内部'),ellipse(255,300),
 text(540,100,'右上：两焦距之和不变'),ellipse(770,300),line(770+90,300-70*Math.sqrt(1-90**2/140**2),770-Math.sqrt(140**2-70**2),300,red),line(860,300-70*Math.sqrt(1-90**2/140**2),770+Math.sqrt(140**2-70**2),300,blue),
 text(35,590,'左中：左支向左开，右支向右开'),hyper(255,800),
 text(540,590,'右中：焦点在各支顶点外侧'),hyper(770,800),
 text(35,1110,'左下：到焦点与准线等距'),parab(240,1320),
 text(540,1110,'右下：三个定义各有正确小图'),ellipse(765,1195,100,48),hyper(765,1320,48,27),parab(760,1460,35)
].join(''));
const polar=(cx,cy,r,deg)=>[cx+r*Math.cos(deg*Math.PI/180),cy-r*Math.sin(deg*Math.PI/180)];
let earth=`<circle cx="240" cy="370" r="185" fill="#d6e7d3" stroke="${ink}" stroke-width="2"/>`;
for(const [lat,label]of [[10,'直射点10°N'],[30,'观测点30°N']]){const [x,y]=polar(240,370,185,lat);earth+=line(240,370,x,y)+dot(x,y,label);}
for(const off of [-80,-40,0,40,80]){const d=10*Math.PI/180;earth+=line(495,290+off,330,290+off+165*Math.tan(d),red);}
earth+=line(240,370,425,370,'#aab4a9')+text(35,570,'太阳光沿10°N的径向照射；30°N位置应在其北侧。',18)+text(35,610,'正午太阳高度 = 90° − |30°−10°| = 70°',24);
const g12=common('地理返修参考：纬度、直射点与平行光几何',earth+text(35,760,'太阳在左时，北端向左倾，才是北半球夏季。',22)+`<circle cx="300" cy="1080" r="180" fill="#d6e7d3" stroke="${ink}"/>`+line(210,870,390,1290,red)+text(170,850,'北端',22)+text(392,1320,'南端',22)+line(30,1000,140,1000,red)+line(30,1080,140,1080,red)+line(30,1160,140,1160,red)+text(40,970,'太阳光→',20));
await mkdir('tmp/scientific-reference',{recursive:true});
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1024,height:1536}});
for(const [id,svg]of [['m13',m13],['g12',g12]]){await writeFile(`tmp/scientific-reference/${id}.svg`,svg);await page.setContent(`<style>body{margin:0}</style>${svg}`);await page.screenshot({path:`tmp/scientific-reference/${id}.png`});}
await browser.close();console.log('Created exact geometric references for ImageGen edits.');
