// Real YOLO-series detection through ONNX Runtime.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {python} from '../lib/python.mjs';
const script=path.join(path.dirname(fileURLToPath(import.meta.url)),'03_detection_yolo.py');
process.exitCode=python(script,process.argv.slice(2));
