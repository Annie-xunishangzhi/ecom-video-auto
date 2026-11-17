import pytest
from highlights import choose

def _ov(a, b):
    return a["start"] < b["start"] + b["dur"] and b["start"] < a["start"] + a["dur"]

def _out(h): return h["dur"] / h["speed"]

STEPS = [{"name": "打开", "start": 0.5, "end": 2.0}, {"name": "批量填写", "start": 2.0, "end": 22.0},
         {"name": "检查", "start": 22.0, "end": 25.0}, {"name": "完成", "start": 25.0, "end": 28.0}]

def test_with_steps():
    h = choose(STEPS, 30.0)
    assert h["hook"]["start"] == pytest.approx(2.0) and 2 <= _out(h["hook"]) <= 4 and 2 <= h["hook"]["speed"] <= 10
    assert 3 <= _out(h["mid"]) <= 5 and h["mid"]["start"] + h["mid"]["dur"] == pytest.approx(28.0)
    assert not _ov(h["hook"], h["mid"])

def test_marked_steps_win():
    steps = [dict(s) for s in STEPS]; steps[2]["hl"] = "hook"
    h = choose(steps, 30.0)
    assert h["hook"]["start"] == pytest.approx(22.0)
    assert not _ov(h["hook"], h["mid"])

def test_overlap_resolved():
    steps = [{"name": "批量", "start": 0.0, "end": 9.0}, {"name": "完成", "start": 9.0, "end": 10.0}]
    h = choose(steps, 10.0)
    assert not _ov(h["hook"], h["mid"]) and h["hook"]["dur"] > 0 and h["mid"]["dur"] > 0

def test_without_steps_uses_activity():
    act = [0.1] * 40; act[5:9] = [5] * 4; act[30:34] = [8] * 4          # 每 0.5 秒一个值
    h = choose([], 20.0, activity=act, step_s=0.5)
    assert not _ov(h["hook"], h["mid"])
    centers = sorted([h["hook"]["start"] + h["hook"]["dur"] / 2, h["mid"]["start"] + h["mid"]["dur"] / 2])
    assert 2 <= centers[0] <= 5.5 and 14 <= centers[1] <= 17.5

def test_short_clip():
    h = choose([{"name": "做完", "start": 0.0, "end": 3.0}], 3.0)
    assert not _ov(h["hook"], h["mid"])
    for k in ("hook", "mid"):
        assert h[k]["start"] >= 0 and h[k]["start"] + h[k]["dur"] <= 3.0 + 1e-6 and h[k]["speed"] == 1

def test_bounds():
    h = choose(STEPS, 30.0)
    for k in ("hook", "mid"):
        assert h[k]["start"] >= 0 and h[k]["start"] + h[k]["dur"] <= 30.0 + 1e-6

def test_activity_on_real_clip(fx):
    from highlights import activity
    a = activity(fx / "clip.mp4")
    assert len(a) >= 2 and all(x >= 0 for x in a)
