// Text -> image ranking, or image -> text ranking, using trained CLIP embeddings.
import {args,asset,outputDir,saveJSON,run} from '../lib/common.mjs';
import {clipFeatures,cosine} from '../lib/clip.mjs';
import {gallery} from '../lib/gallery.mjs';
await run(async()=>{
  const a=args('node scripts/15_image_text_retrieval.mjs [--query "a cat"] [--gallery dir] [--image file --texts "a car|two cats|a dog"] [--out dir]');
  const dir=await outputDir('15_image_text_retrieval',a.out);
  let output;
  if(a.image){
    const texts=String(a.texts??'a parked car|two cats on a sofa|a dog and a bicycle|a house').split('|');
    const r=await clipFeatures([a.image],texts);
    output={...r.provenance,task:'image-to-text retrieval',input:a.image,ranking:texts.map((text,i)=>({text,cosine_similarity:cosine(r.imageEmbeddings[0],r.textEmbeddings[i])})).sort((x,y)=>y.cosine_similarity-x.cosine_similarity)};
  } else {
    const files=await gallery(a.gallery),query=String(a.query??'two cats on a sofa');
    const r=await clipFeatures(files,[query]);
    output={...r.provenance,task:'text-to-image retrieval',query,ranking:files.map((file,i)=>({file,cosine_similarity:cosine(r.textEmbeddings[0],r.imageEmbeddings[i])})).sort((x,y)=>y.cosine_similarity-x.cosine_similarity)};
  }
  await saveJSON(dir,output);console.log(output.ranking);console.log(dir);
});
