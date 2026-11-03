import './paths.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {env, RawImage} from '@huggingface/transformers';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const asset = name => path.join(ROOT, 'assets', name);
env.localModelPath = path.join(ROOT, 'models') + path.sep;
env.allowRemoteModels = false;  // No hidden downloads during inference.
env.allowLocalModels = true;
env.useFSCache = false;        // Selected files already exist in models/.
export const OPTIONS = {dtype:'q8', device:'cpu', session_options:{intraOpNumThreads:4, interOpNumThreads:1, logSeverityLevel:3}};

export function args(help) {
  const result = {};
  for(let i=2; i<process.argv.length; i++) {
    const key=process.argv[i];
    if(key==='--help' || key==='-h') {console.log(help);process.exit(0);}
    if(!key.startsWith('--')) throw Error(`Expected --option, got ${key}`);
    if(process.argv[i+1] && !process.argv[i+1].startsWith('--')) result[key.slice(2)]=process.argv[++i];
    else result[key.slice(2)]=true;
  }
  return result;
}

export async function imageFile(file, maxSide=768) {
  const source = path.resolve(file);
  await fs.access(source);
  const {data,info}=await sharp(source).rotate().resize({width:maxSide,height:maxSide,fit:'inside',withoutEnlargement:true}).removeAlpha().toColourspace('srgb').raw().toBuffer({resolveWithObject:true});
  return new RawImage(new Uint8ClampedArray(data),info.width,info.height,3);
}

export async function outputDir(id, option) {
  const dir=option?path.resolve(option):path.join(ROOT,'results',id);
  await fs.mkdir(dir,{recursive:true});return dir;
}

export async function saveJSON(dir, value, name='result.json') {
  await fs.writeFile(path.join(dir,name),JSON.stringify(value,(_,v)=>typeof v==='bigint'?Number(v):v,2)+'\n');
}

export async function provenance(group) {
  const lock=JSON.parse(await fs.readFile(path.join(ROOT,'sources.lock.json'),'utf8'));
  const m=lock.models[group];
  if(!m)throw Error(`Missing model ${group}; run python setup.py --models ${group}`);
  return {model:m.repo,revision:m.revision,weight_format:'trained ONNX; q8 except quality FP32',device:'CPU'};
}

export async function rawPNG(data,width,height,channels,file) {
  let output=sharp(Buffer.from(data),{raw:{width,height,channels}});
  if(channels===1)output=output.toColourspace('b-w');
  await output.png().toFile(file);
}

export const escapeXML = value => String(value).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));

export async function boxesPNG(image, boxes, file, tracks=false) {
  const marks=boxes.map((b,i)=>{
    const [x0,y0,x1,y1]=b.box;
    const text=escapeXML(`${tracks?'ID '+b.track_id+' ':''}${b.label ?? ''}`);
    return `<rect x="${x0}" y="${y0}" width="${Math.max(0,x1-x0)}" height="${Math.max(0,y1-y0)}" fill="none" stroke="#00ff88" stroke-width="2"/><text x="${Math.max(0,x0)}" y="${Math.max(15,y0-3)}" font-size="14" fill="#00ff88">${text}</text>`;
  }).join('');
  const svg=Buffer.from(`<svg width="${image.width}" height="${image.height}">${marks}</svg>`);
  await sharp(Buffer.from(image.data),{raw:{width:image.width,height:image.height,channels:image.channels}}).composite([{input:svg}]).png().toFile(file);
}

export function validBoxes(result, width, height) {
  return (result.bboxes??[]).map((b,i)=>({label:result.labels?.[i]??'',box:b.map((v,j)=>Math.max(0,Math.min(j%2?height:width,Number(v))))})).filter(b=>b.box[2]>b.box[0]&&b.box[3]>b.box[1]);
}

export async function run(main) {
  try {await main();}
  catch(error) {console.error(error.stack??error);process.exitCode=1;}
}
