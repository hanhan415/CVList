"""Install only OpenCV locally; reuse this computer's NumPy, Pillow, ONNX Runtime."""
import sys
sys.dont_write_bytecode = True
import runtime_paths
import json
import importlib
from pathlib import Path
import sys
import zipfile
from setup import ROOT, download, get_json

target = ROOT / ".python"
sys.path.insert(0, str(target))
try:
    import cv2
    print("OpenCV ready:", cv2.__version__)
except ImportError:
    meta = get_json("https://pypi.org/pypi/opencv-python-headless/4.11.0.86/json")
    candidates = [f for f in meta["urls"] if f["filename"].endswith("cp37-abi3-win_amd64.whl")]
    if sys.platform != "win32" or not candidates:
        raise SystemExit("On other platforms install requirements-python.txt with pip.")
    f = candidates[0]
    wheel = target / f["filename"]
    info = download(f["url"], wheel, 50 * 1024**2, f["size"], f["digests"]["sha256"])
    with zipfile.ZipFile(wheel) as z:
        for member in z.infolist():
            dest = (target / member.filename).resolve()
            if not dest.is_relative_to(target.resolve()):
                raise ValueError("Unexpected path in wheel")
            if member.filename.startswith(("cv2/", "opencv_python_headless-")):
                z.extract(member, target)
    wheel.unlink()
    (ROOT / "python-runtime.lock.json").write_text(json.dumps({"package": "opencv-python-headless", "version": "4.11.0.86", "source": f["url"], **info}, indent=2), "utf-8")
    importlib.invalidate_caches()
    import cv2
    print("OpenCV ready:", cv2.__version__)

import numpy
import PIL
import onnxruntime
print("NumPy", numpy.__version__, "Pillow", PIL.__version__, "ONNX Runtime", onnxruntime.__version__)
