"""A trained DBCNN predicts a real continuous image-quality score (not a heuristic)."""
import sys
sys.dont_write_bytecode = True
import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import runtime_paths
sys.path.insert(0, str(ROOT / ".python"))
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageOps


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--image", default=str(ROOT / "assets" / "car.jpg"))
    p.add_argument("--out", default=str(ROOT / "results" / "02_quality_regression"))
    a = p.parse_args()
    lock = json.loads((ROOT / "sources.lock.json").read_text("utf-8"))["models"]["quality"]
    model = ROOT / "models" / lock["repo"] / "dbcnn_model.onnx"
    options = ort.SessionOptions()
    options.intra_op_num_threads = 4
    sess = ort.InferenceSession(str(model), options, providers=["CPUExecutionProvider"])
    with Image.open(a.image) as im:
        image = ImageOps.exif_transpose(im).convert("RGB").resize((224, 224), Image.Resampling.BILINEAR)
    x = np.asarray(image, dtype=np.float32) / 255
    x = (x - np.array([.485, .456, .406], dtype=np.float32)) / np.array([.229, .224, .225], dtype=np.float32)
    x = np.ascontiguousarray(x.transpose(2, 0, 1)[None])
    prediction = sess.run(None, {sess.get_inputs()[0].name: x})[0]
    score = float(prediction.reshape(-1)[0])
    if not np.isfinite(score):
        raise RuntimeError("Model produced a nonfinite score")
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    result = {"task": "no-reference image quality regression", "model": lock["repo"],
              "revision": lock["revision"], "architecture": "DBCNN", "device": "CPU",
              "input": str(Path(a.image).resolve()), "score_raw": score,
              "note": "Raw output of a trained regressor. Not a calibrated universal percentage; do not interpret it as probability."}
    (out / "result.json").write_text(json.dumps(result, indent=2), "utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
