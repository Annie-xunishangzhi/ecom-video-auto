import subprocess, sys, json
import numpy as np
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "pipeline"))
import motion_check as mc

def test_moving_passes():
    d = np.full(300, 2.0)
    r = mc.analyze(d, 30)
    assert r["ok"] and r["still_ratio"] == 0 and not r["still_runs"] and not r["event_gaps"]

def test_frozen_run_fails():
    d = np.full(300, 2.0); d[60:90] = 0.0          # 1 秒冻结
    r = mc.analyze(d, 30)
    assert not r["ok"] and len(r["still_runs"]) == 1 and r["still_runs"][0]["seconds"] == 1.0

def test_short_pause_ok_but_counts():
    d = np.full(300, 2.0); d[60:75] = 0.0          # 0.5 秒，不算冻结；静止比例 5% 正好不合格
    r = mc.analyze(d, 30)
    assert not r["still_runs"] and r["still_ratio"] == 0.05 and not r["ok"]

def test_micro_motion_only_has_no_new_action():
    d = np.full(300, 0.3)                          # 只有角落里的轻微晃动：不算静止，但 2 秒内没有新动作
    r = mc.analyze(d, 30)
    assert r["still_ratio"] == 0 and r["event_gaps"] and not r["ok"]

def test_real_video(tmp_path):
    v = tmp_path / "still.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "color=c=gray:s=180x320:d=2:r=30", str(v)], check=True)
    r = mc.check(v)
    assert not r["ok"] and r["still_ratio"] > 0.9

def test_review_sheet(tmp_path):
    import review
    v = tmp_path / "v.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "testsrc=s=270x480:d=3:r=30", str(v)], check=True)
    out = review.review(v, tmp_path / "r.jpg")
    assert out.is_file() and out.stat().st_size > 1000
