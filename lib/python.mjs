import './paths.mjs';
import {spawnSync} from 'node:child_process';
export function python(script,args=[],options={}) {
  const command=process.env.CVLIST_PYTHON??(process.platform==='win32'?'py':'python3');
  const prefix=process.env.CVLIST_PYTHON?[]:(process.platform==='win32'?['-3.12']:[]);
  const r=spawnSync(command,[...prefix,script,...args],{stdio:'inherit',...options});
  if(r.error)throw r.error;
  return r.status??1;
}
