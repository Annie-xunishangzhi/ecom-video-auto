"""打码：按画面比例（0–1）给出的矩形区域做强模糊，并检查这些区域的细节确实被抹掉。
没有任何打码规则的素材包，review 置为 pending（等人工确认画面里没有敏感信息）。"""
import shutil, subprocess, tempfile
from pathlib import Path
import numpy as np
from PIL import Image

DETAIL_MAX = 3.0   # 打码后区域内相邻像素平均差值的上限（灰度 0–255）

def _size(clip):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", str(clip)],
                       capture_output=True, text=True)
    w, h = r.stdout.strip().split(",")[:2]; return int(w), int(h)

def _px(rect, W, H):
    x, y, w, h = (float(rect[k]) for k in ("x", "y", "w", "h"))
    if min(x, y) < 0 or w <= 0 or h <= 0 or x + w > 1.0001 or y + h > 1.0001:
        raise ValueError(f"打码区域超出画面（按比例 0–1 填写）：{rect}")
    X, Y = int(x * W) // 2 * 2, int(y * H) // 2 * 2
    w2, h2 = max(2, int(w * W) // 2 * 2), max(2, int(h * H) // 2 * 2)
    return X, Y, min(w2, W - X), min(h2, H - Y)

def apply_mask(clip, rects, out) -> Path:
    clip, out = Path(clip), Path(out)
    W, H = _size(clip)
    boxes = [_px(r, W, H) for r in rects]
    if not boxes:
        shutil.copyfile(clip, out); return out
    n = len(boxes)
    parts = [f"[0:v]split={n + 1}[base]" + "".join(f"[c{i}]" for i in range(n))]
    for i, (x, y, w, h) in enumerate(boxes):
        rad = max(2, min(w, h) // 4)
        parts.append(f"[c{i}]crop={w}:{h}:{x}:{y},boxblur={rad}:4,boxblur={rad}:4[b{i}]")
    last = "base"
    for i, (x, y, w, h) in enumerate(boxes):
        parts.append(f"[{last}][b{i}]overlay={x}:{y}[o{i}]"); last = f"o{i}"
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(clip), "-filter_complex", ";".join(parts), "-map", f"[{last}]",
                        "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", str(out)],
                       capture_output=True, text=True)
    if r.returncode != 0: raise RuntimeError("打码失败：" + r.stderr.strip()[-300:])
    return out

def _frames(clip, k=3):
    d = Path(tempfile.mkdtemp())
    try:
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(clip)], capture_output=True, text=True)
        dur = float(r.stdout.strip() or 0)
        out = []
        for i in range(k):
            t = dur * (i + 1) / (k + 1)
            f = d / f"{i}.png"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(clip), "-frames:v", "1", str(f)], capture_output=True)
            if f.is_file(): out.append(np.asarray(Image.open(f).convert("L"), dtype=np.float32))
        return out
    finally:
        shutil.rmtree(d, ignore_errors=True)

def region_detail(clip, rect) -> float:
    """区域内相邻像素的平均差值：文字、数字越多越大，打码后接近 0。"""
    vals = []
    for g in _frames(clip):
        H, W = g.shape; x, y, w, h = _px(rect, W, H)
        a = g[y:y + h, x:x + w]
        vals.append((np.abs(np.diff(a, axis=0)).mean() + np.abs(np.diff(a, axis=1)).mean()) / 2)
    return float(np.mean(vals)) if vals else 0.0

def verify_mask(out, rects) -> bool:
    return all(region_detail(out, r) <= DETAIL_MAX for r in rects)

def mask_pack_clip(clip, rects, out) -> dict:
    """打码并返回素材包里的 masked / review 两项。没有规则 → 待人工确认；打码没抹干净 → 抛错。"""
    apply_mask(clip, rects or [], out)
    if not rects: return {"masked": False, "review": "pending"}
    if not verify_mask(out, rects): raise RuntimeError("打码区域里仍能看到细节，素材不能用")
    return {"masked": True, "review": "ok"}
