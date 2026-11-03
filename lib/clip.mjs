import {CLIPModel,AutoProcessor,AutoTokenizer} from '@huggingface/transformers';
import {OPTIONS,imageFile,provenance} from './common.mjs';

export async function clipFeatures(files,texts) {
  if(!files.length || !texts.length)throw Error('Need at least one image and one text');
  const p=await provenance('clip');
  const tokenizer=await AutoTokenizer.from_pretrained(p.model);
  const processor=await AutoProcessor.from_pretrained(p.model);
  const model=await CLIPModel.from_pretrained(p.model,OPTIONS);
  try {
    const images=await Promise.all(files.map(f=>imageFile(f,512)));
    const output=await model({...tokenizer(texts,{padding:true,truncation:true}),...await processor(images)});
    return {provenance:p,imageEmbeddings:output.image_embeds.tolist(),textEmbeddings:output.text_embeds.tolist(),logits:output.logits_per_image.tolist()};
  } finally {await model.dispose();}
}

export function cosine(a,b) {
  const dot=a.reduce((s,x,i)=>s+x*b[i],0);
  return dot/Math.max(1e-12,Math.hypot(...a)*Math.hypot(...b));
}

export function softmax(a) {
  const ex=a.map(x=>Math.exp(x-Math.max(...a)));const sum=ex.reduce((x,y)=>x+y,0);return ex.map(x=>x/sum);
}
