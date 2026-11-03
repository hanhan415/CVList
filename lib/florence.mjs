import {Florence2ForConditionalGeneration,AutoProcessor} from '@huggingface/transformers';
import {OPTIONS,provenance} from './common.mjs';

export async function florenceSession() {
  const p=await provenance('florence');
  const processor=await AutoProcessor.from_pretrained(p.model);
  const model=await Florence2ForConditionalGeneration.from_pretrained(p.model,OPTIONS);
  return {
    provenance:p,
    async infer(image,task,text='',maxTokens=256) {
      const inputs=await processor(image,task+text);
      const ids=await model.generate({...inputs,max_new_tokens:maxTokens,num_beams:1,do_sample:false});
      const raw=processor.batch_decode(ids,{skip_special_tokens:false})[0];
      const truncated=!raw.trim().endsWith('</s>');
      // Transformers.js 3.8.1 does not implement Florence polygon postprocessing.
      // Decode the model's location tokens directly, using Florence's 1000 bins.
      if(task==='<REFERRING_EXPRESSION_SEGMENTATION>') {
        const pieces=raw.replace(/<s>|<\/s>|<pad>/g,'').split(/<poly>|<\/poly>|<sep>/g);
        const polygons=[];
        for(const piece of pieces) {
          const bins=[...piece.matchAll(/<loc_(\d+)>/g)].map(x=>Number(x[1]));
          if(bins.length<6 || bins.length%2)continue;
          polygons.push(bins.map((v,i)=>Math.max(0,Math.min((i%2?image.height:image.width),(v+.5)/1000*(i%2?image.height:image.width)))));
        }
        return {raw,truncated,polygons};
      }
      const prediction=processor.post_process_generation(raw,task,image.size)[task];
      return {raw,truncated,prediction:typeof prediction==='string'?prediction.trim():prediction};
    },
    async dispose(){await model.dispose();}
  };
}
