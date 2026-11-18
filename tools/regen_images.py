"""补齐缺失的配图：扫描 out/*/script.json，凡是剧本里登记了但 assets/images/ 里没有的图，用剧本里记下的原提示词重新生成并登记授权。
用法：python tools/regen_images.py            （全部补齐）
      python tools/regen_images.py <编号> …    （只补这几条）
需要 OPENAI_API_KEY（环境变量或 tools/*.env）。在 Windows 上也可以直接双击 tools/cmd/regen_images.cmd。"""
import json, sys
from pathlib import Path
from _paths import ROOT
import gen_image


def missing(ids=None):
    out = []
    for p in sorted((ROOT / "out").glob("*/script.json")):
        s = json.loads(p.read_text(encoding="utf-8"))
        if ids and s.get("id") not in ids: continue
        for im in s.get("images") or []:
            f = im.get("file")
            if f and im.get("prompt") and not (ROOT / "assets" / "images" / f).is_file():
                out.append((s["id"], Path(f).stem, im["prompt"]))
    return out


def main(argv):
    todo = missing(set(argv) or None)
    if not todo: print("没有缺失的配图"); return 0
    bad = 0
    for vid, img_id, prompt in todo:
        try:
            gen_image.generate(prompt, img_id); print("✓", vid, img_id)
        except Exception as e:
            bad += 1; print("✗", vid, img_id, e)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
