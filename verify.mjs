// Validate meaningful artifacts produced by actual end-to-end inference.
// Does not generate or mock predictions. Run node run.mjs --all first.
import './lib/paths.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const root=path.dirname(fileURLToPath(import.meta.url));
const tasks=JSON.parse(await fs.readFile(path.join(root,'tasks.json'),'utf8'));
const read=async id=>JSON.parse(await fs.readFile(path.join(root,'results',tasks.find(t=>t.id===id).script.split('/').at(-1).replace(/\.(mjs|py)$/,''),'result.json'),'utf8'));
const checked=[];
for(const t of tasks.filter(t=>t.script)){
  const r=await read(t.id);assert(r.model && r.revision,`${t.id}: missing real model provenance`);
  if('truncated' in r)assert(!r.truncated,`${t.id}: truncated generation`);
  checked.push({id:t.id,name:t.name,status:'passed'});
}
const classification=await read('01');
assert.equal(classification.predictions[0].label,'car');
assert(Math.abs(classification.predictions.reduce((s,x)=>s+x.probability,0)-1)<1e-6);
assert(Number.isFinite((await read('02')).score_raw));
const det=await read('03');assert(det.boxes.length>0);
for(const b of det.boxes){assert(b.box.every(Number.isFinite));assert(b.box[0]>=0&&b.box[1]>=0&&b.box[2]<=det.size[0]&&b.box[3]<=det.size[1]);}
const seg=await read('04');assert(seg.labels.length>1);assert.equal(seg.labels.reduce((s,x)=>s+x.pixels,0),seg.size[0]*seg.size[1]);
assert((await read('15')).ranking[0].file.endsWith('cats.png'));
assert((await read('12')).caption.length>10);
assert((await read('14')).boxes.length>0);
const ris=await read('16');assert(ris.polygons.length>0);
const mask=await sharp(path.join(root,'results','16_referring_segmentation','mask.png')).greyscale().raw().toBuffer();
assert(mask.some(x=>x===255)&&mask.some(x=>x===0));assert(mask.every(x=>x===0||x===255));
const change=await read('10');assert(change.changed_fraction>0&&change.changed_fraction<1);
const cm=await sharp(path.join(root,'results','10_change_detection','change_mask.png')).greyscale().raw().toBuffer();
assert.equal(Array.from(cm).filter(x=>x!==0).length,change.changed_pixels);
const tr=await read('09');assert(tr.frames.length>=2);assert(tr.frames.every(f=>f.tracks.length>0));
assert(tr.frames[0].tracks.some(t=>tr.frames[1].tracks.some(s=>s.track_id===t.track_id)),'No track ID survived across frames');
const depth=await read('06');assert(Number.isFinite(depth.min)&&Number.isFinite(depth.max)&&depth.max>depth.min);
const npy=await fs.readFile(path.join(root,'results','06_depth_estimation','depth.npy'));assert.equal(npy.subarray(1,6).toString(),'NUMPY');
const summary={checked_at:new Date().toISOString(),actual_model_outputs_checked:checked.length,tasks:checked,notes:['Verifies included public examples; not a dataset benchmark or an accuracy claim.','For custom inputs, zero detections or segmentation failure can be legitimate model outputs.']};
await fs.writeFile(path.join(root,'results','verification.json'),JSON.stringify(summary,null,2));
console.log(`Verified ${checked.length} real-model demos.`);
