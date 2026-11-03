// Image -> image retrieval; cosine similarity of learned visual embeddings.
import path from 'node:path';
import {args,asset,outputDir,saveJSON,run} from '../lib/common.mjs';
import {clipFeatures,cosine} from '../lib/clip.mjs';
import {gallery} from '../lib/gallery.mjs';
await run(async()=>{
  const a=args('node scripts/extra_image_retrieval.mjs [--image file] [--gallery dir] [--out dir]');
  const query=a.image??asset('query_cat.jpg'),files=await gallery(a.gallery);
  const candidates=files.filter(file=>path.resolve(file)!==path.resolve(query));
  if(!candidates.length)throw Error('Gallery must contain an image different from the query');
  const r=await clipFeatures([query,...candidates],['a photo']);
  const ranking=candidates.map((file,i)=>({file,cosine_similarity:cosine(r.imageEmbeddings[0],r.imageEmbeddings[i+1])})).sort((x,y)=>y.cosine_similarity-x.cosine_similarity);
  const dir=await outputDir('extra_image_retrieval',a.out);
  await saveJSON(dir,{...r.provenance,task:'image-to-image retrieval',query,ranking,note:'Exact query file is excluded. The tiny gallery illustrates ranking; it is not a retrieval benchmark.'});
  console.log(ranking);console.log(dir);
});
