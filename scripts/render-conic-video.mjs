import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const ff=process.env.FFMPEG_BIN||'ffmpeg';
const timeline=JSON.parse(await readFile('production/conic-timeline.json','utf8'));
await mkdir('assets/video',{recursive:true});await mkdir('tmp/video-review',{recursive:true});
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:timeline.width,height:timeline.height},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173/production/conic-film.html');await page.waitForFunction(()=>window.movieReady);await page.evaluate(()=>document.fonts.ready);
const video=spawn(ff,['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(timeline.fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart','tmp/conic-silent.mp4'],{windowsHide:true,stdio:['pipe','ignore','pipe']});
let err='';video.stderr.on('data',d=>err+=d);let exitPromise=once(video,'close');
const frames=Math.round(timeline.duration*timeline.fps),sceneSamples=[];
for(const [i,s]of timeline.scenes.entries()){const at=Math.min(s.end-.2,s.start+Math.max(1.5,(s.end-s.start)*.65));await page.evaluate(t=>window.renderMovie(t),at);const output=`tmp/video-review/${String(i+1).padStart(2,'0')}-${s.id}.png`;await page.screenshot({path:output});sceneSamples.push({id:s.id,start:s.start,end:s.end,reviewFrame:output,frameAt:at});}
await page.evaluate(()=>window.renderMovie(4));await page.screenshot({path:'assets/video/conic-poster.jpg',type:'jpeg',quality:92});
for(let i=0;i<frames;i++){
 await page.evaluate(t=>window.renderMovie(t),i/timeline.fps);
 const frame=await page.screenshot({type:'jpeg',quality:94});
 if(!video.stdin.write(frame))await once(video.stdin,'drain');
 if(i%(timeline.fps*10)===0)console.log(`Rendered ${i/timeline.fps}s / ${timeline.duration}s`);
}
video.stdin.end();const [code]=await exitPromise;await browser.close();if(code!==0)throw Error(err);if(errors.length)throw Error(errors.join('\n'));
await writeFile('production/conic-render-report.json',JSON.stringify({date:new Date().toISOString(),frames,fps:timeline.fps,duration:timeline.duration,width:timeline.width,height:timeline.height,sceneSamples,renderer:'Original deterministic HTML/SVG via Playwright, FFmpeg H.264',externalVideoFootage:0,comicImagesInserted:0,uniqueSceneIds:timeline.scenes.map(s=>s.id),browserErrors:errors,renderedSilent:true,continuousWatch:false,listenedFull:false},null,2)+'\n');
console.log('Silent video rendered; narration/music mix remains separate.');
