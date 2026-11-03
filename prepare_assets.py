"""Extract a few real, chronologically ordered frames from the public PETS video."""
import sys
sys.dont_write_bytecode = True
import runtime_paths
from pathlib import Path
import json
import sys
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / ".python"))
import cv2
from PIL import Image

dest = ROOT / "assets" / "frames"
dest.mkdir(exist_ok=True)
cap = cv2.VideoCapture(str(ROOT / "assets" / "people.avi"))
if not cap.isOpened():
    raise RuntimeError("Cannot decode assets/people.avi; run setup.py first")
selected = [0, 5, 10, 15, 20, 25]
manifest = []
try:
    for number in range(selected[-1] + 1):
        ok, frame = cap.read()
        if not ok:
            raise RuntimeError("Input video is shorter than expected")
        if number in selected:
            h, w = frame.shape[:2]
            if w > 640:
                frame = cv2.resize(frame, (640, round(h * 640 / w)))
            name = f"frame_{number:04d}.jpg"
            if not cv2.imwrite(str(dest / name), frame, [cv2.IMWRITE_JPEG_QUALITY, 85]):
                raise RuntimeError("Cannot save frame")
            manifest.append({"file": name, "original_frame": number, "source": "../people.avi"})
finally:
    cap.release()
(dest / "manifest.json").write_text(json.dumps(manifest, indent=2), "utf-8")
with Image.open(ROOT / "assets" / "cats.png") as image:
    w, h = image.size
    image.convert("RGB").crop((0, 0, round(w * .6), h)).save(ROOT / "assets" / "query_cat.jpg", quality=90)
(ROOT / "assets" / "derived-inputs.json").write_text(json.dumps({"query_cat.jpg": {"source": "cats.png", "operation": "left 60 percent crop, used only as retrieval query"}}, indent=2), "utf-8")
print("Saved", len(manifest), "real video frames")
