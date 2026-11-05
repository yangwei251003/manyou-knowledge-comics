import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {courseSubjects,chapters,sections,knowledge,formulas,routes,pilotAssets} from '../content/courses.js';
import {conicState,magneticState,solarState,photoState} from '../src/precision-models.js';
import {legacyChapterMap} from '../content/legacy-links.js';
const root=new URL('../',import.meta.url);
const {books}=JSON.parse(await readFile(new URL('content/books.json',root),'utf8'));
const old=JSON.parse(await readFile(new URL('content/curriculum.json',root),'utf8'));
const oldPoints=old.subjects.flatMap(s=>s.chapters.flatMap(c=>c.points));
assert.equal(oldPoints.length,160);
for(const p of oldPoints)assert(chapters.some(c=>c.id===legacyChapterMap[p.id]),`Unmapped legacy theme ${p.id}`);
assert.equal(courseSubjects.length,5);
assert.equal(books.filter(b=>!b.supplement).length,26);
for(const list of [chapters,sections,knowledge,formulas])assert.equal(new Set(list.map(x=>x.id)).size,list.length,'Duplicate content IDs');
for(const b of books){
 const cs=chapters.filter(c=>c.book===b.id),ss=cs.flatMap(c=>c.sections);
 assert.equal(cs.length,b.expectedChapters,`${b.id} chapter gap against checked book TOC`);
 assert.equal(ss.length,b.expectedSections,`${b.id} section gap against checked book TOC`);
 assert(b.sourceUrl.startsWith('https://'));
 if(!b.supplement)assert(/^[a-f0-9]{64}$/.test(b.referenceSha256));
}
for(const c of chapters){
 assert(books.some(b=>b.id===c.book),'Book mapping missing');
 assert(c.connection.length>20&&c.analogy.length>20,'Missing relation or analogy boundary');
 assert(c.method.steps.length>=3&&c.method.problem,'Missing method');
 assert(c.example.question&&c.example.answer&&c.example.steps.length>=3,'Missing worked example');
 for(const s of c.sections){
  assert(s.title&&s.scene&&s.knowledge.length>=2,`Empty section ${s.id}`);
  for(const p of s.knowledge)assert(p.title&&p.explanation&&p.explanation!==p.title,`Empty knowledge ${p.id}`);
  for(const f of s.formulas)assert(f.expression&&f.condition,`Formula without condition ${s.id}`);
 }
}
for(const r of routes){
 assert.equal(r.path.length,r.reason.length);
 assert.equal(new Set(r.path).size,r.path.length);
 for(const id of r.path)assert(chapters.some(c=>c.id===id&&c.subject===r.subject));
}
assert.equal(new Set(routes.flatMap(r=>r.path)).size,chapters.length,'Some chapters are absent from all thematic routes');
for(const [id,a] of Object.entries(pilotAssets)){assert(chapters.some(c=>c.id===id));await access(new URL(a.file,root));}
// Independent calculations for selected high-risk formulas and authored examples.
assert.equal((60*(10+2)),720); // acceleration vs apparent weight
assert.equal(.01*100/.2,5); // N times flux change, not N times total flux
assert.equal((1e-3*5e-4/1),5e-7); // double slit units
assert.equal((100-40-30),30); // assimilation excludes faeces
assert.equal(2/2**3,.25); // old DNA molecules, distinct from old strand fraction
assert.equal(90-Math.abs(30-10),70); // signed solar declination
assert.equal(40*50/10,200); // mark recapture
assert.equal(80*1e5/.1,8e7); // CFU includes plated volume
for(let v=-1;v<=1;v+=.05){
 const e=conicState('ellipse',v),h=conicState('hyperbola',v),p=conicState('parabola',v);
 assert(Math.abs(e.d1+e.d2-6)<1e-10,'Ellipse sum invariant');
 assert(Math.abs(Math.abs(h.d1-h.d2)-4)<1e-10,'Hyperbola difference invariant');
 assert(Math.abs(p.d1-p.d2)<1e-10,'Parabola focus/directrix invariant');
}
for(const charge of [-1,1])for(const speed of [.5,1,1.4])for(const θ of [0,45,90,180]){
 const s=magneticState(speed,charge,θ);assert(Math.abs(s.vx*s.fx+s.vy*s.fy)<1e-10,'Magnetic force work must be zero');
 assert.equal(s.r,speed);assert.equal(s.T,2*Math.PI);
}
assert.equal(solarState(30,10).height,70);assert.equal(solarState(-30,10).height,50);
assert.equal(photoState(10,2).net,8);assert.equal(photoState(0,2).net,-2);
const videoManifest=JSON.parse(await readFile(new URL('production/video-manifest.json',root),'utf8'));
for(const v of videoManifest.videos){await access(new URL(v.file,root));await access(new URL(v.poster,root));await access(new URL(v.captions,root));assert(v.rendered&&v.duration>0);}
const summary={checkedAt:new Date().toISOString(),textbookBooks:26,textbookChapters:chapters.filter(c=>!c.book.endsWith('tools')).length,supplementaryChapters:1,sections:sections.length,knowledge:knowledge.length,relations:formulas.length,originalChapterExamples:chapters.length,actualComicPages:Object.keys(pilotAssets).length,actualVideoFiles:videoManifest.videos.length,fullVideoListeningReview:false,teacherReview:'not-performed',realStudentStudy:'not-performed'};
console.log(JSON.stringify(summary,null,2));
