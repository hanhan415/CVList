// Model downloads use Python's HTTPS client and an explicit allowlist/budget.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {python} from './lib/python.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
let status=python(path.join(root,'setup.py'),process.argv.slice(2),{cwd:root});
if(!status && !process.argv.includes('--no-assets')){
  status=python(path.join(root,'bootstrap_python.py'),[],{cwd:root});
  if(!status)status=python(path.join(root,'prepare_assets.py'),[],{cwd:root});
}
process.exitCode=status;
