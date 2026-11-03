// Image -> natural language; actual Florence-2 generation.
import {args,asset,imageFile,outputDir,saveJSON,run} from '../lib/common.mjs';
import {florenceSession} from '../lib/florence.mjs';
await run(async()=>{
  const a=args('node scripts/12_captioning.mjs [--image file] [--out dir]');
  const file=a.image??asset('car.jpg'),image=await imageFile(file),session=await florenceSession();
  try {
    const r=await session.infer(image,'<MORE_DETAILED_CAPTION>','',128),dir=await outputDir('12_captioning',a.out);
    await saveJSON(dir,{...session.provenance,task:'image captioning',input:file,caption:r.prediction,raw:r.raw,truncated:r.truncated});
    console.log(r.prediction);console.log(dir);
  } finally {await session.dispose();}
});
