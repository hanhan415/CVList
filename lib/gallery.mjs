import fs from 'node:fs/promises';
import path from 'node:path';
import {asset} from './common.mjs';
export async function gallery(dir) {
  if(!dir)return [asset('car.jpg'),asset('cats.png'),asset('dog.jpg'),asset('house.jpg')];
  const files=(await fs.readdir(dir)).filter(x=>/\.(jpe?g|png|webp)$/i.test(x)).sort().map(x=>path.resolve(dir,x));
  if(!files.length)throw Error('No supported gallery images');
  if(files.length>32)throw Error('Limit gallery to 32 images to keep this example small');
  return files;
}
