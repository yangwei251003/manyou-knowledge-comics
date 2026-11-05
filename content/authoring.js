// Original course authoring helpers. Strings contain authored content, not generated filler.
export function S(number,title,knowledge,rules='',scene=''){
  return {number,title,knowledge:knowledge.split('；').filter(Boolean).map(x=>{const i=x.indexOf('：');return i<0?{title:x,explanation:x}:{title:x.slice(0,i),explanation:x.slice(i+1)};}),formulas:rules.split('；').filter(Boolean).map(x=>{const [expression,...conditions]=x.split('::');return {expression,condition:conditions.join('::')};}),scene};
}
export function C(id,book,category,title,sections,method,example,connection,analogy){
  // Absolute-value bars can occur inside a worked solution. Only the outer
  // separators delimit question / solution / answer.
  const parts=example.split('|');
  const question=parts.shift(),answer=parts.pop(),steps=parts.join('|');
  const [problem,...workflow]=method.split('>');
  return {id,book,category,title,sections:sections.map((s,i)=>({...s,id:`${id}-s${String(i+1).padStart(2,'0')}`,knowledge:s.knowledge.map((p,j)=>({...p,id:`${id}-s${String(i+1).padStart(2,'0')}-k${j+1}`}))})),method:{problem,steps:workflow},example:{question,steps:steps.split('>'),answer},connection,analogy,status:{text:'authored',scienceReview:'self-checked',teacherReview:'not-performed',comic:'pending',video:'pending'}};
}
