// Trained Depth Anything V2 Small, relative depth. Saves actual float predictions.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pipeline} from '@huggingface/transformers';
import {OPTIONS,args,asset,imageFile,outputDir,saveJSON,provenance,run} from '../lib/common.mjs';
await run(async()=>{
  const a=args('node scripts/06_depth_estimation.mjs [--image file] [--out dir]');
  const file=a.image??asset('car.jpg'),image=await imageFile(file,640),p=await provenance('depth'),model=await pipeline('depth-estimation',p.model,OPTIONS);
  try {
    const r=await model(image),dir=await outputDir('06_depth_estimation',a.out);
    await r.depth.save(path.join(dir,'depth.png'));
    const dims=r.predicted_depth.dims,shape=dims.slice(-2),floats=Float32Array.from(r.predicted_depth.data);
    if(Array.from(floats).some(x=>!Number.isFinite(x)))throw Error('Nonfinite depth prediction');
    // NumPy .npy v1.0, little-endian float32, for downstream numerical use.
    const base=`{'descr': '<f4', 'fortran_order': False, 'shape': (${shape.join(', ')}), }`;
    const padding=(16-(10+base.length+1)%16)%16;
    const header=Buffer.from(base+' '.repeat(padding)+'\n','ascii'),prefix=Buffer.alloc(10);
    prefix[0]=0x93;prefix.write('NUMPY',1,'ascii');prefix[6]=1;prefix[7]=0;prefix.writeUInt16LE(header.length,8);
    await fs.writeFile(path.join(dir,'depth.npy'),Buffer.concat([prefix,header,Buffer.from(floats.buffer)]));
    let min=Infinity,max=-Infinity;for(const x of floats){min=Math.min(min,x);max=Math.max(max,x);}
    await saveJSON(dir,{...p,task:'monocular relative depth estimation',input:file,input_size:image.size,prediction_shape:shape,min,max,units:'relative inverse-depth-like scores; not metres',note:'depth.npy stores raw network output. depth.png is a normalized display. This does not reconstruct hidden surfaces or an entire 3D object.'});
    console.log('Depth shape:',shape,'range:',min,max);console.log(dir);
  } finally {await model.dispose();}
});
