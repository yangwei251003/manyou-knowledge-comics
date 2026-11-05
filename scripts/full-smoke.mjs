import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chapters,formulas,courseSubjects,pilotAssets,routes} from '../content/courses.js';
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
const page=await context.newPage(),errors=[],failed=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))failed.push(`${r.status()} ${r.url()}`);});
await mkdir('docs/media',{recursive:true});await mkdir('tmp/full-test',{recursive:true});
await page.goto(base);await page.locator('.subject-shelf').first().waitFor();
assert.equal(await page.locator('.subject-shelf').count(),5);
assert.equal(await page.locator('.pilot-cover').count(),Object.keys(pilotAssets).length);
await page.screenshot({path:'docs/media/full-home-desktop.png',fullPage:true});
let checked=0,patternCards=0;
for(const c of chapters){
 await page.evaluate(id=>{location.hash='#chapter/'+id;},c.id);
 await page.waitForFunction(title=>document.querySelector('.chapter-heading h1')?.textContent===title,c.title);
 assert.equal(await page.locator('.knowledge-section').count(),c.sections.length,c.id);
 assert.equal(await page.locator('.knowledge-items article').count(),c.sections.reduce((n,s)=>n+s.knowledge.length,0),c.id);
 assert.equal(await page.locator('#worked-answer').count(),1);
 patternCards+=await page.locator('.pattern-workshop details').count();
 assert(!(await page.locator('#worked-answer').evaluate(e=>e.open)));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
 assert(!overflow,`Desktop overflow ${c.id}`);checked++;
}
assert.equal(patternCards,160);
for(const s of courseSubjects){
 await page.goto(base+'#map/'+s.id);await page.locator('.chapter-line').first().waitFor();
 assert.equal(await page.locator('.chapter-line').count(),s.chapters.length);
}
await page.locator('#catalog-search').fill('减数分裂');
assert((await page.locator('.section-results>a').count())>=1);
await page.locator('.section-results>a').first().click();await page.locator('.chapter-heading').waitFor();
assert((await page.locator('.chapter-heading h1').textContent()).includes('染色体'));
await page.goto(base+'#chapter/m13');await page.locator('#course-bookmark').click();
await page.locator('[data-read]').first().check();
await page.locator('#course-note').fill('先找焦点与距离约束，再联立直线方程。');
await page.locator('#example-thinking').fill('a²=25，b²=9，由c²=a²−b²求参数。');
await page.locator('#worked-answer summary').click();assert(await page.locator('#worked-answer').evaluate(e=>e.open));
await page.locator('[data-recall="review"]').click();await page.reload();
await page.locator('.chapter-heading').waitFor();assert(await page.locator('[data-read]').first().isChecked());
assert.equal(await page.locator('#course-note').inputValue(),'先找焦点与距离约束，再联立直线方程。');
await page.screenshot({path:'docs/media/full-chapter-desktop.png',fullPage:true});
await page.goto(base+'#formulas');await page.locator('.formula-result').first().waitFor();assert.equal(await page.locator('.formula-result').count(),formulas.length);
await page.locator('#formula-search').fill('机械能');assert((await page.locator('.formula-result').count())>0);
await page.goto(base+'#routes');assert.equal(await page.locator('.trail').count(),routes.length);
await page.goto(base+'#study');assert((await page.locator('.chapter-line').count())>=3);
const download=page.waitForEvent('download');await page.locator('#export-course').click();const d=await download;await d.saveAs('tmp/full-test/study-export.json');
await page.goto(base+'#chapter/b08/comic');await page.locator('#open-comic').click();assert(await page.locator('.raster-dialog').isVisible());await page.keyboard.press('Escape');await page.locator('.raster-dialog').waitFor({state:'detached'});
for(const id of ['m13','p18','c18','b05','g12']){
 await page.goto(base+'#chapter/'+id+'/precision');await page.locator('.precision-canvas svg').waitFor();
 assert(!(await page.locator('.precision-canvas').innerHTML()).includes('NaN'));
 await page.locator('.precision-zoom').click();await page.locator('.precision-dialog').waitFor();await page.keyboard.press('Escape');await page.locator('.precision-dialog').waitFor({state:'detached'});
}
await page.goto(base+'#chapter/m13');assert.equal(await page.locator('.advanced-method').count(),1);
await page.locator('[data-conic="hyperbola"]').click();assert((await page.locator('.precision-readout').textContent()).includes('4.00'));
await page.goto(base+'#chapter/c18');await page.locator('[data-chem="elimination"]').click();assert((await page.locator('.precision-readout').textContent()).includes('邻碳'));
await page.goto(base+'#videos');await page.locator('video').waitFor();
const metadata=await page.locator('video').evaluate(v=>new Promise((resolve,reject)=>{if(v.readyState>=1)return resolve({duration:v.duration,width:v.videoWidth,height:v.videoHeight});v.addEventListener('loadedmetadata',()=>resolve({duration:v.duration,width:v.videoWidth,height:v.videoHeight}),{once:true});v.addEventListener('error',()=>reject(Error('Video load failed')),{once:true});}));
assert(Math.abs(metadata.duration-62.5)<.1);assert.equal(metadata.width,1280);assert.equal(metadata.height,720);
await page.locator('video').evaluate(async v=>{v.muted=true;await v.play();});await page.waitForFunction(()=>document.querySelector('video')?.currentTime>.2,{},{timeout:5000});await page.locator('video').evaluate(v=>v.pause());
await page.goto(base+'#lesson/energy');await page.locator('[data-answer]').first().waitFor();assert.equal(await page.locator('[data-answer]').count(),4);
await page.setViewportSize({width:375,height:812});
let mobileChecked=0;
for(const c of chapters){await page.goto(base+'#chapter/'+c.id);await page.locator('.chapter-heading').waitFor();const width=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));assert(width.scroll<=width.w+2,`Mobile overflow ${c.id} ${JSON.stringify(width)}`);mobileChecked++;}
await page.goto(base+'#home');await page.locator('.subject-shelf').first().waitFor();await page.screenshot({path:'docs/media/full-home-mobile.png',fullPage:true});
await page.goto(base+'#chapter/m05');await page.locator('.chapter-heading').waitFor();await page.screenshot({path:'docs/media/full-chapter-mobile.png',fullPage:true});
await page.goto(base+'#map/physics');await page.locator('.chapter-line').first().waitFor();await page.screenshot({path:'docs/media/full-physics-mobile.png',fullPage:true});
await page.goto(base+'#coverage');await page.locator('.coverage-table').waitFor();assert.equal(await page.locator('.coverage-table tbody tr').count(),5);
await page.goto(base+'#chapter/unknown');assert((await page.locator('h1').textContent()).includes('没有找到'));
assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
const result={at:new Date().toISOString(),base,desktopChapterRoutes:checked,mobileChapterRoutes:mobileChecked,subjectCatalogs:5,formulaCount:formulas.length,readableComicPages:Object.keys(pilotAssets).length,newPrecisionModels:5,advancedMethodCard:true,videoMetadata:metadata,videoPlaybackCheckedMuted:true,fullListeningReview:false,search:true,notesPersistence:true,readMarkers:true,bookmarks:true,hiddenWorkedAnswer:true,export:true,comicDialog:true,legacyModel:true,consoleErrors:errors,failedResources:failed};
await writeFile('docs/full-smoke-results.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));await browser.close();
