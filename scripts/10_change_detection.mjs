// Learned semantic-change baseline: SegFormer(t1) != SegFormer(t2).
// Inputs must already be geometrically aligned; this is not a specialized change model.
import path from 'node:path';
import {args,asset,imageFile,outputDir,saveJSON,rawPNG,run} from '../lib/common.mjs';
import {segmentationSession} from '../lib/segmentation.mjs';
await run(async()=>{
  const a=args('node scripts/10_change_detection.mjs [--before aligned1.jpg --after aligned2.jpg] [--out dir]');
  const before=a.before??asset('frames/frame_0000.jpg'),after=a.after??asset('frames/frame_0025.jpg');
  const image1=await imageFile(before,640),image2=await imageFile(after,640);
  if(image1.width!==image2.width||image1.height!==image2.height)throw Error('Use aligned images with the same dimensions; this script does not estimate registration');
  const session=await segmentationSession();
  try {
    const r1=await session.infer(image1),r2=await session.infer(image2),mask=new Uint8Array(r1.ids.length),rgb=new Uint8Array(image2.data),transitions=new Map();
    let count=0;
    for(let i=0;i<mask.length;i++)if(r1.ids[i]!==r2.ids[i]){
      mask[i]=255;count++;rgb[i*3]=Math.round(rgb[i*3]*.4+153);rgb[i*3+1]=Math.round(rgb[i*3+1]*.4);rgb[i*3+2]=Math.round(rgb[i*3+2]*.4);
      const key=`${r1.ids[i]}->${r2.ids[i]}`;transitions.set(key,(transitions.get(key)??0)+1);
    }
    const dir=await outputDir('10_change_detection',a.out);
    await rawPNG(mask,image1.width,image1.height,1,path.join(dir,'change_mask.png'));
    await rawPNG(rgb,image1.width,image1.height,3,path.join(dir,'overlay.png'));
    await rawPNG(r1.ids,image1.width,image1.height,1,path.join(dir,'before_class_ids.png'));
    await rawPNG(r2.ids,image2.width,image2.height,1,path.join(dir,'after_class_ids.png'));
    const changes=[...transitions.entries()].map(([pair,pixels])=>{const [from,to]=pair.split('->');return {from:session.id2label[from],to:session.id2label[to],pixels};}).sort((x,y)=>y.pixels-x.pixels);
    await saveJSON(dir,{...session.provenance,task:'semantic change detection baseline',before,after,size:image1.size,changed_pixels:count,changed_fraction:count/mask.length,changes,note:'Two real video frames. Changed labels can include segmentation jitter and shadows; same-class object changes may be missed. No claim of a trained change-specific detector.'});
    console.log('Changed fraction:',count/mask.length);console.log(dir);
  } finally {await session.dispose();}
});
