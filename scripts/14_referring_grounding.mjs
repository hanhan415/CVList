// Image + English referring expression -> predicted boxes.
import path from 'node:path';
import {args,asset,imageFile,outputDir,saveJSON,validBoxes,boxesPNG,run} from '../lib/common.mjs';
import {florenceSession} from '../lib/florence.mjs';
await run(async()=>{
  const a=args('node scripts/14_referring_grounding.mjs [--image file] [--text "the green car"] [--out dir]');
  const file=a.image??asset('car.jpg'),text=String(a.text??'the green car'),image=await imageFile(file),session=await florenceSession();
  try {
    const r=await session.infer(image,'<CAPTION_TO_PHRASE_GROUNDING>',text,256),boxes=validBoxes(r.prediction,image.width,image.height),dir=await outputDir('14_referring_grounding',a.out);
    await boxesPNG(image,boxes,path.join(dir,'grounding.png'));
    await saveJSON(dir,{...session.provenance,task:'phrase grounding',input:file,text,size:image.size,coordinate_system:'resized inference image, xyxy pixels',boxes,raw:r.raw,truncated:r.truncated,note:'English phrase grounding baseline; relational referring expressions may fail. No box is inserted when the model finds none.'});
    console.log(boxes);console.log(dir);
  } finally {await session.dispose();}
});
