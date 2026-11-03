"""Download selected trained ONNX weights and tiny public examples, never whole repos."""
from __future__ import annotations

import sys
sys.dont_write_bytecode = True
import runtime_paths
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import time
import urllib.request

ROOT = Path(__file__).resolve().parent
MODEL_BUDGET = 640 * 1024**2
ASSET_BUDGET = 16 * 1024**2
MODELS = {
    "clip": ("Xenova/clip-vit-base-patch32", ["onnx/model_quantized.onnx"]),
    "florence": ("onnx-community/Florence-2-base-ft", [
        "onnx/embed_tokens_quantized.onnx", "onnx/vision_encoder_quantized.onnx",
        "onnx/encoder_model_quantized.onnx", "onnx/decoder_model_merged_quantized.onnx",
    ]),
    "segformer": ("Xenova/segformer-b0-finetuned-ade-512-512", ["onnx/model_quantized.onnx"]),
    "depth": ("onnx-community/depth-anything-v2-small", ["onnx/model_quantized.onnx"]),
    "quality": ("86Cao/IQA-ONNX-Models", ["dbcnn_model.onnx", "dbcnn_model.onnx.data"]),
}
ASSETS = {
    "car.jpg": "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/transformers/tasks/car.jpg",
    "cats.png": "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/coco_sample.png",
    "dog.jpg": "https://raw.githubusercontent.com/pjreddie/darknet/master/data/dog.jpg",
    "house.jpg": "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/house.jpg",
    "people.avi": "https://raw.githubusercontent.com/opencv/opencv/4.x/samples/data/vtest.avi",
}


def get_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "CVList/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024**2), b""):
            h.update(chunk)
    return h.hexdigest()


def bytes_under(path):
    return sum(p.stat().st_size for p in path.rglob("*") if p.is_file()) if path.exists() else 0


def download(url, dest, cap, expected_size=None, sha256=None):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and (expected_size is None or dest.stat().st_size == expected_size):
        if sha256 is None or digest(dest) == sha256:
            return {"bytes": dest.stat().st_size, "sha256": digest(dest)}
    part = dest.with_name(dest.name + ".part")
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "CVList/1.0"})
            with urllib.request.urlopen(req, timeout=120) as r, part.open("wb") as f:
                length = r.headers.get("Content-Length")
                if length and int(length) > cap:
                    raise ValueError(f"File exceeds budget: {url}")
                count = 0
                for chunk in iter(lambda: r.read(1024**2), b""):
                    count += len(chunk)
                    if count > cap:
                        raise ValueError(f"File exceeds budget: {url}")
                    f.write(chunk)
            if expected_size is not None and count != expected_size:
                raise ValueError(f"Incomplete download: {dest}")
            actual_sha = digest(part)
            if sha256 and actual_sha != sha256:
                raise ValueError(f"SHA256 mismatch: {dest}")
            part.replace(dest)
            print(f"{dest.relative_to(ROOT)}  {count / 1024**2:.1f} MiB", flush=True)
            return {"bytes": count, "sha256": actual_sha}
        except Exception:
            part.unlink(missing_ok=True)
            if attempt == 2:
                raise
            time.sleep(1 + attempt)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--models", default=",".join(MODELS), help="comma-separated groups, or none")
    parser.add_argument("--no-assets", action="store_true")
    args = parser.parse_args()
    lock_path = ROOT / "sources.lock.json"
    lock = json.loads(lock_path.read_text("utf-8")) if lock_path.exists() else {"models": {}, "assets": {}}
    groups = [] if args.models == "none" else args.models.split(",")
    for group in groups:
        if group not in MODELS:
            parser.error(f"Unknown model group: {group}")
        repo, weights = MODELS[group]
        old = lock["models"].get(group, {})
        revision = old.get("revision", "main")
        meta = get_json(f"https://huggingface.co/api/models/{repo}/revision/{revision}?blobs=true")
        revision = meta["sha"]
        files = [f for f in meta["siblings"] if f["rfilename"] in weights or (
            "/" not in f["rfilename"] and f["rfilename"].endswith((".json", ".txt", ".md"))
            and f.get("size", 0) < 10 * 1024**2 and group != "quality"
        )]
        present = {f["rfilename"] for f in files}
        if not set(weights).issubset(present):
            raise RuntimeError(f"Selected weights not found for {repo}")
        added = sum(f.get("size", 0) for f in files if not (ROOT / "models" / repo / f["rfilename"]).exists())
        if bytes_under(ROOT / "models") + added > MODEL_BUDGET:
            raise RuntimeError("Model cache would exceed 640 MiB. Remove unused model groups explicitly first.")
        entry = {"repo": repo, "revision": revision, "source": f"https://huggingface.co/{repo}", "files": {}}
        for f in files:
            name = f["rfilename"]
            info = download(f"https://huggingface.co/{repo}/resolve/{revision}/{name}",
                            ROOT / "models" / repo / name, MODEL_BUDGET,
                            f.get("size"), f.get("lfs", {}).get("sha256"))
            entry["files"][name] = info
        lock["models"][group] = entry
        lock_path.write_text(json.dumps(lock, indent=2, ensure_ascii=False), "utf-8")
    if not args.no_assets:
        for name, url in ASSETS.items():
            remaining = ASSET_BUDGET - bytes_under(ROOT / "assets")
            dest = ROOT / "assets" / name
            cap = remaining + (dest.stat().st_size if dest.exists() else 0)
            lock["assets"][name] = {"url": url, **download(url, dest, cap)}
            lock_path.write_text(json.dumps(lock, indent=2, ensure_ascii=False), "utf-8")
    print(f"Models: {bytes_under(ROOT / 'models') / 1024**2:.1f} MiB; assets: {bytes_under(ROOT / 'assets') / 1024**2:.1f} MiB")


if __name__ == "__main__":
    main()
