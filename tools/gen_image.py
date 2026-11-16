"""视频配图：生成或登记，并记录来源与授权。每条视频用 1–2 张，只作氛围示意。
用法：python tools/gen_image.py "深夜的电商办公室，桌上堆满表格" --id office-night
      python tools/gen_image.py --register 图.jpg --id stock1 --source https://… --license CC0"""
import argparse, datetime, io, json, sys
from pathlib import Path
from PIL import Image
from _paths import ROOT
import openai_images

IMAGES_DIR = ROOT / "assets" / "images"
SUFFIX = "。竖版构图，电影感光线，画面中不出现可辨认的真实人物面孔、品牌标志和文字。"
W, H = 1080, 1920

def _cover(im: Image.Image) -> Image.Image:
    im = im.convert("RGB"); k = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2
    return im.crop((l, t, l + W, t + H))

def _index(images_dir: Path) -> list:
    p = images_dir / "index.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.is_file() else []

def _save(images_dir: Path, im: Image.Image, entry: dict) -> dict:
    idx = _index(images_dir)
    if any(e["id"] == entry["id"] for e in idx): raise ValueError(f"配图编号已存在：{entry['id']}")
    images_dir.mkdir(parents=True, exist_ok=True)
    _cover(im).save(images_dir / entry["file"], quality=90)
    idx.append(entry); (images_dir / "index.json").write_text(json.dumps(idx, ensure_ascii=False, indent=1), encoding="utf-8")
    return entry

def generate(prompt: str, id: str, images_dir: Path = IMAGES_DIR) -> dict:
    images_dir = Path(images_dir)
    if any(e["id"] == id for e in _index(images_dir)): raise ValueError(f"配图编号已存在：{id}")
    png = openai_images.generate(prompt + SUFFIX, size="1024x1536")
    return _save(images_dir, Image.open(io.BytesIO(png)), {"id": id, "file": f"{id}.jpg", "source": "generated", "model": openai_images.MODEL,
                 "prompt": prompt, "license": "自有（模型生成）", "date": datetime.date.today().isoformat()})

def register(file, id: str, source: str, license: str, images_dir: Path = IMAGES_DIR) -> dict:
    if not (source or "").strip() or not (license or "").strip(): raise ValueError("外部图片必须写明来源和授权，否则不登记")
    return _save(Path(images_dir), Image.open(file), {"id": id, "file": f"{id}.jpg", "source": source.strip(), "license": license.strip(),
                 "date": datetime.date.today().isoformat()})

def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt", nargs="?"); ap.add_argument("--id", required=True)
    ap.add_argument("--register"); ap.add_argument("--source", default=""); ap.add_argument("--license", default="")
    ap.add_argument("--images-dir", default=str(IMAGES_DIR))
    a = ap.parse_args(argv)
    try:
        e = register(a.register, a.id, a.source, a.license, Path(a.images_dir)) if a.register else generate(a.prompt, a.id, Path(a.images_dir))
    except (ValueError, RuntimeError) as err:
        print("✗", err); return 1
    print("✓", e["file"]); return 0

if __name__ == "__main__":
    sys.exit(main())
