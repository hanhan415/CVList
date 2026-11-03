"""Fetch only small author-published figures, keeping compressed local examples."""
import sys
sys.dont_write_bytecode = True
import runtime_paths
from pathlib import Path
import hashlib
import io
import json
import urllib.request
import time
from PIL import Image

ROOT = Path(__file__).resolve().parent
DEST = ROOT / "assets" / "public-examples"
DEST.mkdir(exist_ok=True)
LIMIT = 8 * 1024**2
FIGURES = {
    "lightglue": "https://raw.githubusercontent.com/cvg/LightGlue/main/assets/easy_hard.jpg",
    "nerf": "https://raw.githubusercontent.com/bmild/nerf/master/imgs/pipeline.jpg",
    "mcubes-input": "https://raw.githubusercontent.com/kyotovision-public/multimodal-material-segmentation/main/img/Fig1.png",
    "stable-diffusion": "https://raw.githubusercontent.com/CompVis/stable-diffusion/main/assets/stable-samples/txt2img/merged-0006.png",
    "instruct-pix2pix": "https://instruct-pix2pix.timothybrooks.com/cityscape.jpg",
}
lock_path = DEST / "downloads.json"
lock = json.loads(lock_path.read_text("utf-8")) if lock_path.exists() else {}
def fetch_data(url, limit):
    data=bytearray()
    for attempt in range(4):
        headers={"User-Agent":"CVList educational task examples","Accept-Encoding":"identity","Cache-Control":"no-cache"}
        if data:
            headers["Range"]=f"bytes={len(data)}-"
        request_url=url if not attempt else url+("&" if "?" in url else "?")+f"cvlist_retry={attempt}"
        request=urllib.request.Request(request_url,headers=headers)
        with urllib.request.urlopen(request,timeout=90) as response:
            if response.status!=206:
                data.clear()
            content_range=response.headers.get("Content-Range")
            if content_range:
                expected=int(content_range.rsplit("/",1)[1])
            else:
                length=response.headers.get("Content-Length")
                expected=(len(data)+int(length)) if length else None
            if expected and expected>limit:
                raise RuntimeError("Source example exceeds download size limit")
            while True:
                chunk=response.read(512*1024)
                if not chunk:
                    break
                data.extend(chunk)
                if len(data)>limit:
                    raise RuntimeError("Source example exceeds download size limit")
            if expected is None or len(data)==expected:
                return bytes(data)
        print("Resuming incomplete source:",len(data),"/",expected,flush=True)
        time.sleep(1)
    raise RuntimeError("Incomplete source download after retries")

for name, url in FIGURES.items():
    if name in lock and all((ROOT / p).exists() for p in lock[name]["files"]):
        print("Already present:", name)
        continue
    for attempt in range(3):
        try:
            data=fetch_data(url,LIMIT)
            with Image.open(io.BytesIO(data)) as check:
                check.load()
            break
        except Exception:
            if attempt==2:
                raise
            time.sleep(1)
    source_sha = hashlib.sha256(data).hexdigest()
    files=[]
    with Image.open(io.BytesIO(data)) as im:
        frames=[0, min(30, getattr(im, "n_frames", 1)-1)] if name=="nerf" and getattr(im,"n_frames",1)>1 else [0]
        for number, frame in enumerate(frames):
            im.seek(frame)
            image=im.convert("RGB")
            image.thumbnail((1400, 1000), Image.Resampling.LANCZOS)
            file=DEST / (name+(f"-{number}" if len(frames)>1 else "")+".webp")
            image.save(file, "WEBP", quality=88)
            files.append(file.relative_to(ROOT).as_posix())
    lock[name]={"source_url":url,"download_bytes":len(data),"download_sha256":source_sha,"files":files}
    lock_path.write_text(json.dumps(lock,indent=2),"utf-8")
    print(name, "download", len(data), "saved", sum((ROOT/p).stat().st_size for p in files), flush=True)
print("Total retained author example images:", sum(p.stat().st_size for p in DEST.glob("*.webp")))

# Moment-DETR's README publishes this exact video/query and ranked prediction.
# Keep three small, genuine frames; discard the 10 MiB source clip after decoding.
if "moment-detr" not in lock and "--skip-video" not in sys.argv:
    sys.path.insert(0, str(ROOT / ".python"))
    import cv2
    url="https://raw.githubusercontent.com/jayleicn/moment_detr/main/run_on_video/example/RoripwjYFp8_60.0_210.0.mp4"
    temporary=ROOT / ".tmp" / "moment-detr-author-example.mp4"
    data=fetch_data(url,12*1024**2)
    temporary.write_bytes(data)
    files=[]
    cap=cv2.VideoCapture(str(temporary))
    try:
        if not cap.isOpened():
            raise RuntimeError("Cannot decode author video")
        for index,second in enumerate([5,108,120]):
            cap.set(cv2.CAP_PROP_POS_MSEC, second*1000)
            ok,frame=cap.read()
            if not ok:
                raise RuntimeError("Cannot read requested sample frame")
            image=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB))
            image.thumbnail((720,480),Image.Resampling.LANCZOS)
            file=DEST / f"moment-detr-{index}.webp"
            image.save(file,"WEBP",quality=86)
            files.append(file.relative_to(ROOT).as_posix())
    finally:
        cap.release()
        temporary.unlink(missing_ok=True)
    lock["moment-detr"]={"source_url":url,"download_bytes":len(data),"download_sha256":hashlib.sha256(data).hexdigest(),"files":files,"frame_seconds":[5,108,120],"query":"Chef makes pizza and cuts it up.","published_prediction_rank":3,"published_prediction_seconds":[105.9434,122.0372],"ground_truth_seconds":[106,122],"prediction_source":"https://github.com/jayleicn/moment_detr#run-predictions-on-your-own-videos-and-queries"}
    lock_path.write_text(json.dumps(lock,indent=2),"utf-8")
    print("moment-detr genuine frames saved; source clip discarded")

# Extract an actual saved rendering result from the authors' Tiny-NeRF notebook.
if "tiny-nerf" not in lock:
    import base64
    url="https://raw.githubusercontent.com/bmild/nerf/master/tiny_nerf.ipynb"
    data=fetch_data(url,4*1024**2)
    notebook=json.loads(data)
    outputs=notebook["cells"][8]["outputs"]
    encoded=[o["data"]["image/png"] for o in outputs if "image/png" in o.get("data",{})][-1]
    if isinstance(encoded,list):
        encoded="".join(encoded)
    with Image.open(io.BytesIO(base64.b64decode(encoded))) as im:
        image=im.convert("RGB")
        image.thumbnail((1400,900),Image.Resampling.LANCZOS)
        file=DEST/"tiny-nerf-result.webp"
        image.save(file,"WEBP",quality=90)
    lock["tiny-nerf"]={"source_url":url,"download_bytes":len(data),"download_sha256":hashlib.sha256(data).hexdigest(),"files":[file.relative_to(ROOT).as_posix()],"extraction":"last saved PNG output of notebook cell 8"}
    lock_path.write_text(json.dumps(lock,indent=2),"utf-8")
    print("Saved actual author notebook rendering output")

if "nerf-render-frame" not in lock or not (DEST/"nerf-0.webp").exists():
    url="https://bmild.github.io/nerf/lego_200k_256w.gif"
    data=fetch_data(url,8*1024**2)
    with Image.open(io.BytesIO(data)) as im:
        im.seek(0)
        image=im.convert("RGB")
        file=DEST/"nerf-0.webp"
        image.save(file,"WEBP",quality=88)
    lock["nerf-render-frame"]={"source_url":url,"download_bytes":len(data),"download_sha256":hashlib.sha256(data).hexdigest(),"files":[file.relative_to(ROOT).as_posix()],"extraction":"first decoded frame of the author-published NeRF rendering"}
    lock_path.write_text(json.dumps(lock,indent=2),"utf-8")
