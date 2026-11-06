import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {chapters,formulas,courseSubjects,pilotAssets,routes} from '../content/courses.js';
import {storyFor} from '../content/stories/index.js';
const {artworks} = JSON.parse(await readFile(new URL('../content/chapter-comic-art.json', import.meta.url), 'utf8'));
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4173/';
const evidenceDir=process.env.SMOKE_EVIDENCE_DIR||'docs';
const mediaDir=join(evidenceDir,'media');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
const page=await context.newPage(),errors=[],failed=[];
// A full-page screenshot does not itself wait for lazy images or SVG decoding.
// Verify actual decoded media before recording a visual result.
async function readyImages(){
 await page.locator('img').evaluateAll(async imgs=>{
  imgs.forEach(img=>{img.loading='eager';});
  await Promise.all(imgs.map(async img=>{await img.decode();if(!img.naturalWidth)throw Error('Undecoded image: '+img.currentSrc);}));
  await document.fonts.ready;
 });
}
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))failed.push(`${r.status()} ${r.url()}`);});
await mkdir(mediaDir,{recursive:true});await mkdir('tmp/full-test',{recursive:true});
await page.goto(base);await page.locator('.subject-shelf').first().waitFor();
await page.keyboard.press('Tab');
assert(await page.locator('.skip-link').evaluate(link=>link===document.activeElement));
await page.keyboard.press('Enter');
assert(await page.locator('#main').evaluate(main=>main===document.activeElement));
assert.equal(new URL(page.url()).hash,'');
assert.equal(await page.locator('.subject-shelf').count(),5);
assert.equal(await page.locator('.pilot-cover').count(),courseSubjects.length);
await readyImages();
const decodedHomeImages=await page.locator('img').count();
await page.screenshot({path:join(mediaDir,'full-home-desktop.png'),fullPage:true});
let checked=0,patternCards=0,comicPages=0,comicPanels=0,comicSections=0,comicKnowledge=0,comicFormulas=0;
for(const c of chapters){
 await page.evaluate(id=>{location.hash='#chapter/'+id;},c.id);
 await page.waitForFunction(title=>document.querySelector('.chapter-heading h1')?.textContent===title,c.title);
 assert.equal(await page.locator('.knowledge-section').count(),c.sections.length,c.id);
 assert.equal(await page.locator('.knowledge-items article').count(),c.sections.reduce((n,s)=>n+s.knowledge.length,0),c.id);
 assert.equal(await page.locator('#worked-answer').count(),1);
 patternCards+=await page.locator('.pattern-workshop details').count();
 assert(!(await page.locator('#worked-answer').evaluate(e=>e.open)));
 const art = artworks[c.id], story = storyFor(c);
 const size = await page.locator('.story-frame img').evaluate(async img=>{
  await img.decode();
  return [img.naturalWidth,img.naturalHeight];
 });
 assert.deepEqual(size, [art.width,art.height], `Comic image failed to decode ${c.id}`);
 assert.equal(await page.locator('.story-heading h2').textContent(),story.title);
 assert.equal(await page.locator('[data-story-panel]').count(),story.panels.length);
 for (const [index,panel] of story.panels.entries()) {
  await page.locator(`[data-story-panel="${index}"]`).evaluate(button=>button.click());
  if (panel.section) {
   const ids = await page.locator('[data-story-knowledge]').evaluateAll(items=>items.map(item=>item.dataset.storyKnowledge));
   assert.deepEqual(ids,panel.section.knowledge.map(point=>point.id),`${c.id} frame ${index+1} knowledge mismatch`);
   assert.equal(await page.locator('.story-formulas p').count(),panel.section.formulas.length);
   comicFormulas+=panel.section.formulas.length;
   comicSections++;
   comicKnowledge+=ids.length;
  }
  comicPanels++;
 }
 comicPages++;
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
 assert(!overflow,`Desktop overflow ${c.id}`);checked++;
}
assert.equal(patternCards,160);
let comicShelfPreviews=0;
for(const s of courseSubjects){
 await page.goto(base+'#map/'+s.id);await page.locator('.chapter-line').first().waitFor();
 assert.equal(await page.locator('.chapter-line').count(),s.chapters.length);
 await page.goto(base+'#comics/'+s.id);
 await page.locator(`[data-comic-subject="${s.id}"].selected`).waitFor();
 const previews=page.locator('.comic-bookshelf img');
 assert.equal(await previews.count(),s.chapters.length);
 await readyImages();
 assert(await previews.evaluateAll(imgs=>imgs.every(img=>img.naturalWidth===480 && img.currentSrc.endsWith('-preview.webp'))));
 comicShelfPreviews+=s.chapters.length;
}
await page.goto(base+'#map/geography');await page.locator('#catalog-search').waitFor();
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
await readyImages();
await page.screenshot({path:join(mediaDir,'full-chapter-desktop.png'),fullPage:true});
await page.goto(base+'#formulas');await page.locator('.formula-result').first().waitFor();assert.equal(await page.locator('.formula-result').count(),formulas.length);
await page.locator('#formula-search').fill('机械能');assert((await page.locator('.formula-result').count())>0);
await page.goto(base+'#routes');assert.equal(await page.locator('.trail').count(),routes.length);
await page.goto(base+'#study');assert((await page.locator('.chapter-line').count())>=3);
const download=page.waitForEvent('download');await page.locator('#export-course').click();const d=await download;await d.saveAs('tmp/full-test/study-export.json');
await page.goto(base+'#chapter/b08/comic');await page.locator('#open-comic').click();assert(await page.locator('.raster-dialog').isVisible());await page.locator('.raster-dialog img').evaluate(img=>img.decode());await page.keyboard.press('Escape');await page.locator('.raster-dialog').waitFor({state:'detached'});
await page.goto(base+'#chapter/m03/comic');
await page.locator('[data-story-move="1"]').click();
assert.equal(await page.locator('.story-progress').textContent(),'2 / 4');
await page.locator('.chapter-story-reader').focus();
await page.keyboard.press('ArrowRight');
assert.equal(await page.locator('.story-progress').textContent(),'3 / 4');
await page.locator('.story-facts summary').click();
assert(await page.locator('.story-facts').evaluate(details=>details.open));
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
for(const c of chapters){await page.goto(base+'#chapter/'+c.id);await page.waitForFunction(title=>document.querySelector('.chapter-heading h1')?.textContent===title,c.title);const width=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth}));assert(width.scroll<=width.w+2,`Mobile overflow ${c.id} ${JSON.stringify(width)}`);mobileChecked++;}
await page.goto(base+'#home');await page.locator('.subject-shelf').first().waitFor();await readyImages();await page.screenshot({path:join(mediaDir,'full-home-mobile.png'),fullPage:true});
await page.goto(base+'#chapter/m05');await page.locator('.chapter-heading').waitFor();await readyImages();await page.screenshot({path:join(mediaDir,'full-chapter-mobile.png'),fullPage:true});
await page.goto(base+'#comics');
await page.locator('[data-comic-subject="geography"]').click();
await page.locator('[data-comic-subject="geography"].selected').waitFor();
await page.locator('.comic-bookshelf a[href="#chapter/g25/comic"]').click();
await page.locator('.story-heading h2').waitFor();
assert.equal(await page.locator('.story-heading h2').textContent(),storyFor(chapters.find(c=>c.id==='g25')).title);
await page.locator('#open-comic').click();
const preview=page.locator('.story-page-preview');
assert(await preview.evaluate(d=>d.scrollWidth<=d.clientWidth+2));
await preview.getByRole('button',{name:'关闭漫画预览'}).click();
await preview.waitFor({state:'detached'});
await page.locator('[data-story-panel="1"]').click();
await page.locator('.story-facts summary').click();
await page.locator('.story-frame img').evaluate(img=>img.decode());
await page.locator('.chapter-story-reader').screenshot({path:join(mediaDir,'chapter-comic-reader-mobile.png')});
const sectionHash=await page.locator('.story-facts a').getAttribute('href');
await page.locator('.story-facts a').click();
await page.waitForURL(base+sectionHash);
await page.waitForFunction(id=>document.getElementById(id)?.getBoundingClientRect().top < innerHeight/2,sectionHash.split('/').at(-1));
await page.goto(base+'#map/physics');await page.locator('.chapter-line').first().waitFor();await readyImages();await page.screenshot({path:join(mediaDir,'full-physics-mobile.png'),fullPage:true});
await page.goto(base+'#coverage');await page.locator('.coverage-table').waitFor();assert.equal(await page.locator('.coverage-table tbody tr').count(),5);
await page.goto(base+'#chapter/unknown');assert((await page.locator('h1').textContent()).includes('没有找到'));
assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
const result={at:new Date().toISOString(),base,desktopChapterRoutes:checked,mobileChapterRoutes:mobileChecked,subjectCatalogs:5,formulaCount:formulas.length,chapterComicPagesDecoded:comicPages,comicPanels,comicSections,comicKnowledge,comicFormulas,comicShelfPreviews,comicSectionNavigation:true,additionalFocusedComics:Object.keys(pilotAssets).length,decodedHomeImages,newPrecisionModels:5,advancedMethodCard:true,videoMetadata:metadata,videoPlaybackCheckedMuted:true,fullListeningReview:false,search:true,notesPersistence:true,readMarkers:true,bookmarks:true,hiddenWorkedAnswer:true,export:true,comicDialog:true,comicKeyboard:true,legacyModel:true,consoleErrors:errors,failedResources:failed};
await writeFile(join(evidenceDir,'full-smoke-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));await browser.close();
