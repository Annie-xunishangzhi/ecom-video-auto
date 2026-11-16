"""给吉祥物的某个姿势穿上固定装扮（橙色毛线帽 + 橙色围巾），输出品红底图，再用 key.py 抠图。
用法：python tools/mascot_outfit.py <无装扮姿势.png> <装扮参考图.png> <输出.png>"""
import io, sys
from pathlib import Path
from PIL import Image
import openai_images

PROMPT = ("Edit the FIRST image. Keep this exact same single character: identical pose, wing positions, held props, facial expression, body shape, "
          "proportions, black ink outline and soft watercolor painting style. Remove any small decorative marks floating around the character. "
          "Add only two clothing items, copied exactly from the character in the SECOND image: "
          "(1) an orange chunky rib-knit beanie with a cream-white folded ribbed brim and a cream-white pom-pom on top, worn tilted on the head; "
          "(2) an orange rib-knit scarf wrapped around the neck with one end hanging down the chest, and on that hanging end a small round white badge "
          "showing a tiny red zig-zag line-chart icon. The orange is a vivid red-orange (#FF4D1A). "
          "Exactly one character, one front-facing view, centered, full body with generous margin on all sides, nothing cropped. "
          "No sparkle stars, no text, no ground shadow. Background: one completely flat uniform pure magenta (#FF00FF), no gradient.")

def on_magenta(src: Path) -> bytes:
    im = Image.open(src).convert("RGBA"); side = int(max(im.size) * 1.25)
    bg = Image.new("RGBA", (side, side), (255, 0, 255, 255)); bg.alpha_composite(im, ((side - im.width) // 2, (side - im.height) // 2))
    b = io.BytesIO(); bg.convert("RGB").resize((1024, 1024), Image.LANCZOS).save(b, "PNG"); return b.getvalue()

if __name__ == "__main__":
    pose, ref, out = map(Path, sys.argv[1:4])
    tmp = out.with_suffix(".in.png"); tmp.write_bytes(on_magenta(pose))
    out.write_bytes(openai_images.edit([tmp, ref], PROMPT, size="1024x1024")); tmp.unlink(); print("ok", out)
