import {pipeline} from '@huggingface/transformers';
import {OPTIONS,provenance,rawPNG} from './common.mjs';
import path from 'node:path';

export async function segmentationSession() {
  const p=await provenance('segformer');
  const model=await pipeline('image-segmentation',p.model,OPTIONS);
  return {provenance:p,id2label:model.model.config.id2label,
    async infer(image) {
      // Let the pipeline infer semantic mode. 3.8.1 has a bug when the explicit
      // subtask option is used (it calls a function name instead of the function).
      const annotations=await model(image);
      const ids=new Uint8Array(image.width*image.height);
      const config=model.model.config.id2label;
      const labelToId=new Map(Object.entries(config).map(([i,label])=>[label,Number(i)]));
      for(const a of annotations){const id=labelToId.get(a.label);if(id===undefined)throw Error(`Unknown label ${a.label}`);for(let i=0;i<ids.length;i++)if(a.mask.data[i])ids[i]=id;}
      return {ids,annotations};
    },
    async dispose(){await model.dispose();}
  };
}

export async function saveSegmentation(image, result, dir) {
  await rawPNG(result.ids,image.width,image.height,1,path.join(dir,'class_ids.png'));
  const colors=new Uint8Array(result.ids.length*3);
  for(let i=0;i<result.ids.length;i++){const id=result.ids[i];colors[i*3]=(id*67+31)%256;colors[i*3+1]=(id*113+83)%256;colors[i*3+2]=(id*41+157)%256;}
  await rawPNG(colors,image.width,image.height,3,path.join(dir,'segmentation.png'));
  const labels=result.annotations.map(a=>({label:a.label,pixels:Array.from(a.mask.data).filter(v=>v!==0).length}));
  return labels;
}
