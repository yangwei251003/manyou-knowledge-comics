import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {lessons} from '../content/lessons.js';
import {diagram,derivativeState,energyState,equilibriumState} from '../src/diagrams.js';
const d=JSON.parse(await readFile(new URL('../content/curriculum.json',import.meta.url),'utf8'));
assert.equal(d.subjects.length,5);
const points=d.subjects.flatMap(s=>s.chapters.flatMap(c=>c.points));
const map=new Map(points.map(p=>[p.id,p]));assert.equal(map.size,points.length);
const sources=new Set(d.sources.map(s=>s.id));
const done=new Set(),active=new Set();
function visit(id){assert(map.has(id),`Missing prerequisite ${id}`);assert(!active.has(id),`Cyclic prerequisite ${id}`);if(done.has(id))return;active.add(id);for(const pre of map.get(id).prerequisites)visit(pre);active.delete(id);done.add(id);}
for(const p of points){visit(p.id);assert(p.core&&p.visualIdea&&p.method.length>=3);assert.equal(p.status,'planned');for(const s of p.sourceIds)assert(sources.has(s));}
assert.equal(lessons.length,5);assert.equal(new Set(lessons.map(l=>l.subject)).size,5);
for(const l of lessons){assert.equal(l.panels.length,6);assert.equal(l.quiz.choices.length,4);assert(l.quiz.answer>=0&&l.quiz.answer<4);assert(l.conditions&&l.pitfall&&l.sources.length);for(let s=0;s<6;s++){assert.equal(l.panels[s].dialogue.length,2);for(const t of [0,.5,1]){const out=diagram(l.id,s,.6,false,t);assert(out.includes('<svg'));assert(!/NaN|undefined/.test(out));}}}
// Independent mathematical checks of the two numeric sample questions and chemical quotient.
assert.equal(derivativeState(5,.1,1).tangentSlope,-2);assert.equal(derivativeState(5,.1,1).secantSlope,-1.9);assert.equal(-2*(-1)-1,1);
assert.equal(energyState(5,.36,1).kineticJ,1*10*5-18);assert.equal(energyState(5,.36,1).dissipatedJ,18);
assert.equal(equilibriumState(2,.5,1).q,2/(2**2));assert(Math.abs(equilibriumState(3,.5,1).q-1)<1e-10);
console.log(`PASS: ${d.subjects.length} subjects / ${points.length} topics / acyclic prerequisites / ${lessons.length} lessons / 30 panels / 5 quiz schemas / finite SVG samples.`);
