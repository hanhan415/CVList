import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
async function size(dir){let n=0;for(const f of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,f.name);n+=f.isDirectory()?await size(p):(await fs.stat(p)).size;}return n;}
const report={};
for(const name of ['models','assets','results','node_modules','.python']){
  const p=path.join(root,name);report[name]=await size(p).catch(()=>0);
}
report.total=await size(root);
console.log(JSON.stringify(Object.fromEntries(Object.entries(report).map(([k,v])=>[k,{bytes:v,MiB:Number((v/1024**2).toFixed(2))}])),null,2));
if(process.argv.includes('--save')){
  await fs.mkdir(path.join(root,'results'),{recursive:true});
  await fs.writeFile(path.join(root,'results','storage-report.json'),JSON.stringify(report,null,2));
}
