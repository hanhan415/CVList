"""Real YOLOv10n ONNX detection; download <=16 MiB in memory when no model is supplied."""
from pathlib import Path
import argparse
import hashlib
import json
import urllib.request
import numpy as np
import onnxruntime as ort
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
REVISION = "c03e02456387191807059ef0ebe2c56315ddff55"
MODEL_URL = f"https://huggingface.co/onnx-community/YOLOv10/resolve/{REVISION}/yolov10n.onnx"
MODEL_SHA256 = "a77dd863933f184a19e84361c64b788228a7c7dacc2c78939239a96ad3efca3b"
NAMES = "person,bicycle,car,motorcycle,airplane,bus,train,truck,boat,traffic light,fire hydrant,stop sign,parking meter,bench,bird,cat,dog,horse,sheep,cow,elephant,bear,zebra,giraffe,backpack,umbrella,handbag,tie,suitcase,frisbee,skis,snowboard,sports ball,kite,baseball bat,baseball glove,skateboard,surfboard,tennis racket,bottle,wine glass,cup,fork,knife,spoon,bowl,banana,apple,sandwich,orange,broccoli,carrot,hot dog,pizza,donut,cake,chair,couch,potted plant,bed,dining table,toilet,tv,laptop,mouse,remote,keyboard,cell phone,microwave,oven,toaster,sink,refrigerator,book,clock,vase,scissors,teddy bear,hair drier,toothbrush".split(",")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--image", type=Path, default=ROOT / "assets/dog.jpg")
    parser.add_argument("--out", type=Path, default=ROOT / "results/03_detection")
    parser.add_argument("--model", type=Path, help="Optional existing YOLOv10n ONNX weight")
    parser.add_argument("--threshold", type=float, default=0.4)
    args = parser.parse_args()
    if args.model:
        weight = args.model.read_bytes()
    else:
        with urllib.request.urlopen(MODEL_URL, timeout=90) as response:
            weight = response.read(16 * 1024**2 + 1)
        if len(weight) > 16 * 1024**2:
            raise ValueError("Model exceeds download limit")
    digest = hashlib.sha256(weight).hexdigest()
    if digest != MODEL_SHA256:
        raise ValueError("Unexpected YOLO weight checksum")
    session = ort.InferenceSession(weight, providers=["CPUExecutionProvider"])
    image = Image.open(args.image).convert("RGB")
    width, height = image.size
    scale = min(640 / width, 640 / height)
    rw, rh = round(width * scale), round(height * scale)
    left, top = (640 - rw) // 2, (640 - rh) // 2
    padded = Image.new("RGB", (640, 640), (114, 114, 114))
    padded.paste(image.resize((rw, rh), Image.Resampling.BILINEAR), (left, top))
    tensor = np.asarray(padded).astype(np.float32).transpose(2, 0, 1)[None] / 255
    prediction = session.run(None, {session.get_inputs()[0].name: tensor})[0][0]
    boxes = []
    for row in prediction:
        x1, y1, x2, y2, score, class_id = map(float, row)
        if score < args.threshold:
            continue
        box = [max(0, min(width, (x1-left)/scale)), max(0, min(height, (y1-top)/scale)),
               max(0, min(width, (x2-left)/scale)), max(0, min(height, (y2-top)/scale))]
        if box[2] <= box[0] or box[3] <= box[1]:
            continue
        boxes.append({"label": NAMES[int(class_id)], "class_id": int(class_id), "score": score, "box": box})
    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default(size=19)
    colors = ["#378b44", "#bb562e", "#376fa7", "#8955a5"]
    for index, item in enumerate(boxes):
        color = colors[index % len(colors)]
        x1, y1, x2, y2 = item["box"]
        draw.rectangle((x1, y1, x2, y2), outline=color, width=4)
        text = f'{item["label"]} {item["score"]:.2f}'
        text_width = draw.textlength(text, font=font)
        label_y = max(0, y1 - 27)
        draw.rectangle((x1, label_y, min(width, x1+text_width+10), label_y+26), fill=color)
        draw.text((x1+5, label_y+2), text, fill="white", font=font)
    args.out.mkdir(parents=True, exist_ok=True)
    image.save(args.out / "detections.png")
    report = {"model": "onnx-community/YOLOv10 (YOLOv10n)", "revision": REVISION,
              "model_url": MODEL_URL, "model_sha256": digest, "model_bytes": len(weight),
              "device": "CPU", "task": "object detection", "input": str(args.image),
              "size": [width, height], "coordinate_system": "original image, xyxy pixels",
              "confidence_threshold": args.threshold, "boxes": boxes}
    (args.out / "result.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), "utf-8")
    print(json.dumps({"model": "YOLOv10n", "detections": boxes, "weights_written": 0}))

if __name__ == "__main__":
    main()
