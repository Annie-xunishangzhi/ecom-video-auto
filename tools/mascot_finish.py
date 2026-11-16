"""把品红底的姿势图抠成透明底，统一放到 640×640 画布上（脚底对齐同一高度）。
用法：python tools/mascot_finish.py <品红底图目录> <输出目录>"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

SIZE, FEET_Y = 640, 582          # 引擎按画布高度的 89% 对齐脚底，脚底最低点略低于这条线

def cutout(src: Path) -> Image.Image:
    a = np.array(Image.open(src).convert("RGB")).astype(float); R, G, B = a[..., 0], a[..., 1], a[..., 2]
    m = np.minimum(R, B) - G
    alpha = 1 - np.clip((m - 70) / 100, 0, 1)
    solid = alpha > 0.5; lab, n = ndimage.label(solid); sz = ndimage.sum(solid, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sz) if s > 0.02 * sz.max()])
    alpha = np.where(ndimage.binary_dilation(keep, iterations=3), alpha, 0)
    k = np.clip(m, 0, None) * ndimage.binary_dilation(alpha < 0.99, iterations=4)   # 边缘去品红溢色
    a[..., 0] -= k; a[..., 2] -= k
    return Image.fromarray(np.dstack([np.clip(a, 0, 255), alpha * 255]).astype(np.uint8), "RGBA")

def finish(src: Path, dst: Path) -> None:
    im = cutout(src); im = im.resize((SIZE, SIZE), Image.LANCZOS)
    al = np.asarray(im)[..., 3]; rows = np.flatnonzero(al.max(axis=1) > 128); cols = np.flatnonzero(al.max(axis=0) > 128)
    dy = FEET_Y - rows[-1]
    out = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0)); out.alpha_composite(im.crop((0, max(0, -dy), SIZE, SIZE - max(0, dy))), (0, max(0, dy)))
    arr = np.array(out); arr[:8, :, 3] = 0; arr[-8:, :, 3] = 0; arr[:, :8, 3] = 0; arr[:, -8:, 3] = 0
    Image.fromarray(arr, "RGBA").save(dst)

if __name__ == "__main__":
    src, dst = Path(sys.argv[1]), Path(sys.argv[2]); dst.mkdir(parents=True, exist_ok=True)
    for f in sorted(src.glob("*.png")): finish(f, dst / f.name); print("ok", f.name)
