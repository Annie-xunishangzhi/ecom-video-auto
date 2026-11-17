import subprocess
import numpy as np
import pytest
from PIL import Image, ImageDraw
import mask

@pytest.fixture(scope="module")
def text_clip(tmp_path_factory):
    d = tmp_path_factory.mktemp("mask")
    rng = np.random.default_rng(1)
    for i in range(15):
        im = Image.new("RGB", (640, 360), "white"); dr = ImageDraw.Draw(im)
        for y in range(10, 350, 14):
            for x in range(10, 630, 9):
                if rng.random() < .6: dr.rectangle([x, y, x + 5, y + 9], fill="black")   # 像文字的细密纹理
        im.save(d / f"{i:03d}.png")
    clip = d / "text.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "15", "-i", str(d / "%03d.png"), "-c:v", "libx264", "-crf", "12",
                    "-pix_fmt", "yuv420p", str(clip)], check=True)
    return clip

RECT = {"x": 0.0, "y": 0.0, "w": 0.5, "h": 0.5}
OUTSIDE = {"x": 0.55, "y": 0.55, "w": 0.4, "h": 0.4}

def test_masked_region_loses_detail(text_clip, tmp_path):
    out = tmp_path / "m.mp4"
    mask.apply_mask(text_clip, [RECT], out)
    before = mask.region_detail(text_clip, RECT); after = mask.region_detail(out, RECT)
    assert after < before * 0.2
    assert mask.verify_mask(out, [RECT])
    assert not mask.verify_mask(text_clip, [RECT])

def test_outside_unchanged(text_clip, tmp_path):
    out = tmp_path / "m.mp4"
    mask.apply_mask(text_clip, [RECT], out)
    b = mask.region_detail(text_clip, OUTSIDE); a = mask.region_detail(out, OUTSIDE)
    assert abs(a - b) / b < 0.15

def test_no_rules_means_pending(text_clip, tmp_path):
    out = tmp_path / "m.mp4"
    assert mask.mask_pack_clip(text_clip, [], out) == {"masked": False, "review": "pending"}
    assert out.is_file()

def test_rules_verified_ok(text_clip, tmp_path):
    out = tmp_path / "m.mp4"
    assert mask.mask_pack_clip(text_clip, [RECT], out) == {"masked": True, "review": "ok"}

def test_bad_rect_rejected(text_clip, tmp_path):
    with pytest.raises(ValueError):
        mask.apply_mask(text_clip, [{"x": 0.8, "y": 0, "w": 0.5, "h": 0.2}], tmp_path / "m.mp4")
