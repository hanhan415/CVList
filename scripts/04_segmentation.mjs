// Trained SegFormer-B0, ADE20K semantic segmentation, 150 classes.
import {args,asset,imageFile,outputDir,saveJSON,run} from '../lib/common.mjs';
import {segmentationSession,saveSegmentation} from '../lib/segmentation.mjs';
await run(async()=>{
  const a=args('node scripts/04_segmentation.mjs [--image file] [--out dir]');
  const file=a.image??asset('house.jpg'), image=await imageFile(file,640),session=await segmentationSession();
  try {
    const r=await session.infer(image),dir=await outputDir('04_segmentation',a.out);
    const labels=await saveSegmentation(image,r,dir);
    await saveJSON(dir,{...session.provenance,task:'semantic segmentation',input:file,size:image.size,labels,id2label:session.id2label,note:'class_ids.png contains ADE20K class IDs; segmentation.png is a false-color rendering of predicted labels.'});
    console.log(labels);console.log(dir);
  } finally {await session.dispose();}
});
