// Real zero-shot classification: image + candidate labels -> CLIP probabilities.
import {args,asset,outputDir,saveJSON,run} from '../lib/common.mjs';
import {clipFeatures,softmax} from '../lib/clip.mjs';
await run(async()=>{
  const a=args('node scripts/01_classification.mjs [--image file] [--labels "car,cat,dog,house"] [--out dir]');
  const image=a.image??asset('car.jpg');
  const labels=String(a.labels??'car,cat,dog,house').split(',').map(s=>s.trim()).filter(Boolean);
  if(labels.length<2)throw Error('Provide at least two candidate labels');
  const r=await clipFeatures([image],labels.map(s=>'a photo of a '+s));
  const probabilities=softmax(r.logits[0]);
  const predictions=labels.map((label,i)=>({label,probability:probabilities[i]})).sort((x,y)=>y.probability-x.probability);
  const dir=await outputDir('01_classification',a.out);
  await saveJSON(dir,{...r.provenance,task:'zero-shot image classification',input:image,predictions,note:'Probabilities are relative to the supplied candidate labels.'});
  console.log(predictions);console.log(dir);
});
