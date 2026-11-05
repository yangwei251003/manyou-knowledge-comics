import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8','.wav':'audio/wav','.mp3':'audio/mpeg','.md':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+path.sep))throw Error('Forbidden');
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  const data=await readFile(file);
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
  if(req.headers.range){
   const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!m||(!m[1]&&!m[2])){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}
   const start=m[1]?Number(m[1]):Math.max(0,data.length-Number(m[2]));
   const end=m[1]&&m[2]?Math.min(data.length-1,Number(m[2])):data.length-1;
   if(start>=data.length||end<start){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}
   res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${data.length}`});res.end(req.method==='HEAD'?undefined:data.subarray(start,end+1));return;
  }
  res.writeHead(200,{...headers,'Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('没有找到这个页面');}
}).listen(port,'127.0.0.1',()=>console.log(`Preview http://127.0.0.1:${port}`));
