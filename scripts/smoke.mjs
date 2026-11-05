import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {lessons} from '../content/lessons.js';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.TEST_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});
const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))failed.push(`${r.status()} ${r.url()}`);});
const checks=[];
await mkdir('docs/media',{recursive:true});
try{
  await page.goto(base,{waitUntil:'networkidle'});await page.locator('.lesson-card').first().waitFor();
  assert.equal(await page.locator('.lesson-card').count(),5);checks.push('首页显示5个可读样章');
  await page.locator('[data-filter="chemistry"]').click();assert.equal(await page.locator('.lesson-card').count(),1);
  await page.locator('[data-filter="all"]').click();await page.locator('#home-search').fill('坡度');assert.equal(await page.locator('.lesson-card').count(),1);
  await page.locator('#home-search').fill('火星上不存在的主题');assert.equal(await page.locator('.lesson-card').count(),0);await page.locator('#home-search').fill('');checks.push('学科筛选、搜索与空结果');
  await page.screenshot({path:'docs/media/home-desktop.png',fullPage:true});
  await page.locator('[data-bookmark="derivative"]').click();assert.equal(await page.locator('[data-bookmark="derivative"]').getAttribute('aria-pressed'),'true');
  for(const subject of ['math','physics','chemistry','biology','geography']){await page.goto(base+'#map/'+subject);assert.equal(await page.locator('.chapter').count(),8);assert.equal(await page.locator('[data-point]').count(),32);}
  await page.locator('[data-point]').first().click();await page.locator('dialog[open]').waitFor();assert((await page.locator('dialog').innerText()).includes('规划'));await page.locator('.close-dialog').click();
  await page.locator('#map-search').fill('导数');assert((await page.locator('[data-point]').count())>0);await page.locator('#map-search').fill('');checks.push('五科160目录、详情弹窗、跨科搜索');
  await page.screenshot({path:'docs/media/map-desktop.png',fullPage:true});
  for(const lesson of lessons){
    await page.goto(base+'#lesson/'+lesson.id);await page.locator('[data-step="0"]').click();
    for(let i=0;i<6;i++){await page.locator(`[data-step="${i}"]`).click();assert.equal(await page.locator('#panel-number').textContent(),`${String(i+1).padStart(2,'0')} / 06`);assert(await page.locator('.live-model svg').count());}
    const slider=page.locator('#model-slider');if(await slider.count()){const before=await page.locator('.live-model').innerHTML();await slider.evaluate(el=>{el.value=el.min;el.dispatchEvent(new Event('input',{bubbles:true}));});const first=await page.locator('.live-model').innerHTML();await slider.evaluate(el=>{el.value=el.max;el.dispatchEvent(new Event('input',{bubbles:true}));});const second=await page.locator('.live-model').innerHTML();assert.notEqual(first,second,`${lesson.id} slider must change the science diagram`);}
    await page.locator(`[data-answer="${(lesson.quiz.answer+1)%4}"]`).click();assert(await page.locator('.quiz-feedback.retry').count());
    await page.locator(`[data-answer="${lesson.quiz.answer}"]`).click();assert(await page.locator('.quiz-feedback.success').count());
  }
  checks.push('全部30幕可达、4个参数对照、5题正确与错误解释');
  await page.goto(base+'#lesson/meiosis');await page.locator('[data-step="3"]').click();await page.waitForTimeout(1800);await page.screenshot({path:'docs/media/lesson-desktop.png',fullPage:true});
  await page.reload();assert.equal(await page.locator('#panel-number').textContent(),'04 / 06');checks.push('阅读位置刷新恢复');
  await page.locator('#zoom-model').click();await page.locator('.model-dialog[open]').waitFor();assert(await page.locator('.model-dialog svg').count());await page.locator('.model-dialog .close-dialog').click();checks.push('科学图放大与静态观察');
  await page.goto(base+'#study');assert.equal(await page.locator('.continue-list>a').count(),5);assert.equal(await page.locator('.study-stats b').nth(1).textContent(),'5');
  const downloadPromise=page.waitForEvent('download');await page.locator('#export-progress').click();const download=await downloadPromise;assert(download.suggestedFilename().endsWith('.json'));checks.push('本机收藏与答题记录、记录导出');
  for(const viewport of [{width:375,height:812},{width:1440,height:1050}]){
    await page.setViewportSize(viewport);
    for(const hash of ['home','map/math','lesson/derivative','lesson/energy','lesson/equilibrium','lesson/meiosis','lesson/sea-breeze','study','about']){
      await page.goto(base+'#'+hash);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Horizontal overflow: ${viewport.width} ${hash}`);
    }
  }
  await page.setViewportSize({width:375,height:812});await page.goto(base+'#home');await page.screenshot({path:'docs/media/home-mobile.png',fullPage:true});await page.goto(base+'#lesson/sea-breeze');await page.locator('[data-step="2"]').click();await page.waitForTimeout(1800);await page.screenshot({path:'docs/media/lesson-mobile.png',fullPage:true});
  checks.push('375px与1440px主要页面无横向溢出');
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-step="1"]').click();assert(await page.locator('.live-model svg').count());checks.push('减少动态模式可用');
  const timed=await browser.newPage();await timed.clock.install();await timed.goto(base+'#lesson/derivative');await timed.locator('[data-step="0"]').click();await timed.locator('#play-story').click();await timed.clock.runFor(160000);assert.equal(await timed.locator('#panel-number').textContent(),'06 / 06');assert((await timed.locator('#play-story').textContent()).includes('连续阅读一次'));await timed.clock.runFor(60000);assert.equal(await timed.locator('#panel-number').textContent(),'06 / 06');await timed.close();checks.push('加速时钟检查连续阅读一遍即停、不会自动循环');
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);checks.push('无浏览器脚本错误与本地资源404');
  await writeFile('docs/smoke-results.json',JSON.stringify({tested:'2026-11-05',mode:'headless-chromium',base:base.startsWith('http://127.0.0.1')?'local-preview':base,checks,errors,failed},null,2));
  console.log(JSON.stringify({result:'PASS',checks},null,2));
}finally{await browser.close();}
