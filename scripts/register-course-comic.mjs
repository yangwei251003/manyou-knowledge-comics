import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {chapters} from '../content/courses.js';
const args=Object.fromEntries(process.argv.slice(2).map(x=>{const i=x.indexOf('=');return [x.slice(0,i).replace(/^--/,''),x.slice(i+1)];}));
const c=chapters.find(x=>x.id===args.chapter);if(!c)throw Error('Unknown chapter');
const root=path.resolve(import.meta.dirname,'..'),data=await readFile(args.source);
if(data.toString('hex',0,8)!=='89504e470d0a1a0a')throw Error('Expected original PNG');
const width=data.readUInt32BE(16),height=data.readUInt32BE(20),sha256=createHash('sha256').update(data).digest('hex');
const version=Number(args.version||1);if(!Number.isInteger(version)||version<1)throw Error('Invalid version');
const file=`assets/comics/${c.id}-page1-v${version}.png`,target=path.resolve(root,file);
try{const old=await readFile(target);if(createHash('sha256').update(old).digest('hex')!==sha256)throw Error('Target differs: use a new asset version');}catch(e){if(e.code!=='ENOENT')throw e;await mkdir(path.dirname(target),{recursive:true});await copyFile(args.source,target);}
const mf=path.join(root,'production/course-comic-manifest.json');let manifest={updated:'2026-11-06',generator:'built-in image_gen',modelId:null,assets:[]};
try{manifest=JSON.parse(await readFile(mf,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const scope=(args.scope||'').split(',').filter(Boolean),valid=new Set(c.sections.flatMap(s=>s.knowledge.map(k=>k.id)));if(scope.some(id=>!valid.has(id)))throw Error('Invalid knowledge mapping');
manifest.assets=manifest.assets.filter(x=>!(x.chapter===c.id&&(x.version||1)===version));
manifest.assets.push({chapter:c.id,version,title:args.title,file,width,height,bytes:data.length,sha256,prompt:`production/prompts/${c.id}-page1${version>1?'-edit-v'+version:''}.txt`,coveredKnowledgeIds:scope,contentReview:'pending',teacherReview:'not-performed',note:'A focused comic page, not a claim that every chapter point is illustrated.'});
manifest.assets.sort((a,b)=>a.chapter.localeCompare(b.chapter));await writeFile(mf,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({chapter:c.id,file,width,height,sha256}));
