// Real Florence detections in every frame + a transparent IoU association baseline.
import fs from 'node:fs/promises';
import path from 'node:path';
import {args,asset,imageFile,outputDir,saveJSON,boxesPNG,validBoxes,run} from '../lib/common.mjs';
import {florenceSession} from '../lib/florence.mjs';
import {IoUTracker} from '../lib/tracking.mjs';
await run(async()=>{
  const a=args('node scripts/09_multi_object_tracking.mjs [--frames folder] [--max-frames 6] [--iou 0.2] [--out dir]');
  const folder=path.resolve(a.frames??asset('frames')),limit=Number(a['max-frames']??6),threshold=Number(a.iou??.2);
  if(!Number.isInteger(limit)||limit<1||limit>30||threshold<0||threshold>1)throw Error('Use 1..30 frames and an IoU threshold in [0,1]');
  const files=(await fs.readdir(folder)).filter(f=>/\.(png|jpe?g)$/i.test(f)).sort().slice(0,limit);
  if(!files.length)throw Error('No real frames found; run prepare_assets.py');
  const session=await florenceSession(),tracker=new IoUTracker(threshold),dir=await outputDir('09_multi_object_tracking',a.out),frames=[];
  try {
    for(const file of files){
      const image=await imageFile(path.join(folder,file),640),r=await session.infer(image,'<OD>','',512),boxes=validBoxes(r.prediction,image.width,image.height),tracks=tracker.update(boxes);
      await boxesPNG(image,tracks,path.join(dir,file.replace(/\.[^.]+$/,'.png')),true);
      frames.push({file,size:image.size,detections:boxes.length,tracks,raw:r.raw,truncated:r.truncated});
      console.log(file,'objects',boxes.length,'IDs',tracks.map(t=>t.track_id));
    }
    await saveJSON(dir,{...session.provenance,task:'multi-object tracking',frames_folder:folder,association:'class-consistent greedy IoU; no motion model or re-identification',iou_threshold:threshold,frames,note:'IDs follow genuine per-frame detections. Occlusion, camera movement and missed detections can cause ID switches.'});
    console.log(dir);
  } finally {await session.dispose();}
});
