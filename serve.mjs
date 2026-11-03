// Optional local preview. Double-click index.html also works without a server.
import './lib/paths.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT??4173);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.npy':'application/octet-stream'};
const server=http.createServer((req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch{res.writeHead(400);res.end();return;}
  if(pathname==='/'||pathname==='/index.html'){res.writeHead(302,{Location:'/web/dist/'});res.end();return;}
  if(pathname.endsWith('/'))pathname+='index.html';
  const allowed=['/web/dist/','/assets/','/results/'].some(prefix=>pathname.startsWith(prefix));
  const file=path.resolve(root,'.'+pathname);
  if(!allowed||!file.startsWith(root+path.sep)||!['GET','HEAD'].includes(req.method)){res.writeHead(403);res.end();return;}
  fs.stat(file,(error,stat)=>{
    if(error||!stat.isFile()){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
  });
});
server.listen(port,'127.0.0.1',()=>console.log(`CVList local preview: http://127.0.0.1:${port}/web/dist/`));
server.on('error',error=>{console.error(error.message);process.exitCode=1;});
