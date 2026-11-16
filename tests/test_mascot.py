import numpy as np
from PIL import Image
POSES = ["base","talk","blink","phone","point","cheer","shock","clip","wave"]
def load(root, p): return np.asarray(Image.open(root/"assets/mascot"/f"{p}.png").convert("RGBA")).astype(int)
def test_all_poses_present_same_canvas(root):
    assert {Image.open(root/"assets/mascot"/f"{p}.png").size for p in POSES} == {(640, 640)}
def test_poses_are_transparent_at_corners(root):
    for p in POSES:
        a = load(root, p)[..., 3]; assert a[:6,:6].max() == 0 and a[:6,-6:].max() == 0 and a[-6:,:6].max() == 0 and a[-6:,-6:].max() == 0, p
def test_poses_wear_orange(root):
    for p in POSES:
        x = load(root, p); r, g, b, a = x[...,0], x[...,1], x[...,2], x[...,3]
        orange = (a > 200) & (r > 200) & (g > 50) & (g < 150) & (b < 90)
        assert orange.sum() / max(1, (a > 200).sum()) > 0.03, p
def test_no_magenta_fringe(root):
    for p in POSES:
        x = load(root, p); r, g, b, a = x[...,0], x[...,1], x[...,2], x[...,3]
        assert ((a > 60) & (r > 200) & (b > 200) & (g < 90)).sum() < 40, p
