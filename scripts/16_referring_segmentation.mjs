// Image + English expression -> Florence-predicted polygon -> pixel mask.
import path from 'node:path';
import sharp from 'sharp';
import {args,asset,imageFile,outputDir,saveJSON,run} from '../lib/common.mjs';
import {florenceSession} from '../lib/florence.mjs';
await run(async()=>{
  const a=args('node scripts/16_referring_segmentation.mjs [--image file] [--text "the green car"] [--out dir]');
  const file=a.image??asset('car.jpg'),text=String(a.text??'the green car'),image=await imageFile(file),session=await florenceSession();
  try {
    const r=await session.infer(image,'<REFERRING_EXPRESSION_SEGMENTATION>',text,768),dir=await outputDir('16_referring_segmentation',a.out);
    const shapes=r.polygons.map(p=>`<polygon points="${p.reduce((s,v,i)=>s+(i%2?',':' ')+v,'').trim()}" fill="white"/>`).join('');
    const svg=Buffer.from(`<svg width="${image.width}" height="${image.height}"><rect width="100%" height="100%" fill="black"/>${shapes}</svg>`);
    await sharp(svg).removeAlpha().greyscale().threshold(127).toColourspace('b-w').png().toFile(path.join(dir,'mask.png'));
    const overlay=Buffer.from(`<svg width="${image.width}" height="${image.height}">${shapes.replaceAll('fill="white"','fill="#00ff88" fill-opacity=".5"')}</svg>`);
    await sharp(Buffer.from(image.data),{raw:{width:image.width,height:image.height,channels:image.channels}}).composite([{input:overlay}]).png().toFile(path.join(dir,'overlay.png'));
    await saveJSON(dir,{...session.provenance,task:'referring expression segmentation',input:file,text,size:image.size,coordinate_system:'resized inference image, polygons in xy pixel coordinates',polygons:r.polygons,raw:r.raw,truncated:r.truncated,note:'Mask is rasterized exclusively from model-generated polygons; an empty prediction produces an empty mask.'});
    console.log('Predicted polygons:',r.polygons.length);console.log(dir);
  } finally {await session.dispose();}
});
