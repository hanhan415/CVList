// A child process per task frees model memory before the next demo.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {python} from './lib/python.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const tasks=JSON.parse(fs.readFileSync(path.join(root,'tasks.json'),'utf8'));
const arguments_=process.argv.slice(2),choice=arguments_[0];
if(!choice || choice==='--list' || choice==='--help'){
  for(const t of tasks)console.log(`${t.id} ${t.name}  ${t.script??'[skipped] '+t.reason}`);
  console.log('\nRun one: node run.mjs 16 --text "the green car"\nRun all implemented: node run.mjs --all');
} else {
  const selected=choice==='--all'?tasks.filter(t=>t.script):tasks.filter(t=>t.id===choice.padStart(2,'0'));
  if(!selected.length){console.error('Unknown task');process.exitCode=1;}
  const report=[];
  for(const t of selected){
    if(!t.script){console.error(`Task ${t.id} skipped: ${t.reason}`);process.exitCode=2;break;}
    console.log(`\n${t.id} ${t.name}`);
    const start=Date.now(),extra=choice==='--all'?[]:arguments_.slice(1);
    let exitCode;
    if(t.script.endsWith('.py'))exitCode=python(path.join(root,t.script),extra,{cwd:root});
    else {
      const r=spawnSync(process.execPath,[path.join(root,t.script),...extra],{cwd:root,stdio:'inherit'});
      if(r.error)console.error(r.error.message);
      exitCode=r.status??1;
    }
    report.push({id:t.id,task:t.name,script:t.script,exit_code:exitCode,seconds:(Date.now()-start)/1000});
    if(exitCode)process.exitCode=1;
  }
  if(choice==='--all'){
    fs.mkdirSync(path.join(root,'results'),{recursive:true});
    fs.writeFileSync(path.join(root,'results','execution-report.json'),JSON.stringify({run_at:new Date().toISOString(),runtime:'Node '+process.version,tasks:report,skipped:tasks.filter(t=>!t.script)},null,2));
  }
}
