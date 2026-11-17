import json, os, shutil, subprocess, sys, pytest
import numpy as np
from pathlib import Path
from audio import write_wav
from pick_topic import load_history
from audio_util import tone

@pytest.fixture(scope="module")
def cjk_root(tmp_path_factory):
    """把工程复制到一个带中文和空格的目录里，并放进一首测试曲子"""
    src = Path(__file__).resolve().parent.parent; dst = tmp_path_factory.mktemp("根") / "测试 目录"
    shutil.copytree(src, dst, ignore=shutil.ignore_patterns("node_modules", "out", ".git", ".superpowers", ".secrets", "__pycache__", ".pytest_cache", "*.m4a", "library.json", "history.json"))
    os.symlink(src/"node_modules", dst/"node_modules", target_is_directory=True)
    t = dst/"t.wav"; write_wav(t, tone(220, 20.0, 0.4))
    r = subprocess.run([sys.executable, str(dst/"tools"/"add_track.py"), str(t), "--mood", "upbeat", "--source", "测试", "--license", "测试用"], capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    return dst
def run_make(root, script, *args, sid=None, tts="fake"):
    script = dict(script); script["id"] = sid or script["id"]
    d = root/"out"/script["id"]; d.mkdir(parents=True, exist_ok=True)
    (d/"script.json").write_text(json.dumps(script, ensure_ascii=False), encoding="utf-8")
    r = subprocess.run([sys.executable, str(root/"pipeline"/"make.py"), str(d/"script.json"), "--tts-backend", tts, *args], capture_output=True, text=True, encoding="utf-8")
    return r, d
def probe(f):
    o = subprocess.run(["ffprobe","-v","error","-show_entries","stream=codec_type,width,height,r_frame_rate:format=duration","-of","json",str(f)], capture_output=True, text=True)
    j = json.loads(o.stdout); v = next(s for s in j["streams"] if s["codec_type"]=="video")
    return v["width"], v["height"], v["r_frame_rate"], any(s["codec_type"]=="audio" for s in j["streams"]), float(j["format"]["duration"])
@pytest.fixture
def ok(fx): return json.loads((fx/"script_ok.json").read_text(encoding="utf-8"))

def test_make_end_to_end_fake_tts(cjk_root, ok):
    r, out = run_make(cjk_root, ok, sid="e2e-a")
    assert r.returncode == 0, r.stdout[-800:] + r.stderr[-800:]
    mp4 = out/"e2e-a.mp4"; assert mp4.exists() and (out/"e2e-a.srt").exists() and (out/"contact.jpg").exists()
    w, h, fps, audio, secs = probe(mp4)
    assert (w, h, fps) == (1080, 1920, "30/1") and audio and 30 <= secs <= 55
    hist = load_history(cjk_root/"data"/"history.json")
    assert len(hist) == 1 and hist[0]["id"] == "e2e-a" and hist[0]["structure"] == "contrast-then-suspense" and hist[0]["track"] == "upbeat-001" and hist[0]["has_footage"] is False
    pub = json.loads((out/"publish.json").read_text(encoding="utf-8"))
    assert pub["pending_footage"] is True and "AI" in pub["reminder"] and pub["music"]["license"] == "测试用" and pub["tags"] == ok["tags"]
def test_real_footage_marks_not_pending(cjk_root, ok, fx):
    ok["structure"] = "timer-race"; ok["mid_hook"] = "pitfall"      # 避开上一条用过的结构和钩子
    clip = fx/"clip.mp4"
    r, out = run_make(cjk_root, ok, "--footage", f"hook={clip}:0:2:1", "--footage", f"mid={clip}:0:2:1", sid="e2e-b")
    assert r.returncode == 0, r.stdout[-800:] + r.stderr[-800:]
    pub = json.loads((out/"publish.json").read_text(encoding="utf-8")); assert pub["pending_footage"] is False
    assert load_history(cjk_root/"data"/"history.json")[-1]["has_footage"] is True
def test_failed_check_writes_no_history(cjk_root, ok):
    before = len(load_history(cjk_root/"data"/"history.json"))
    ok["scenes"][2]["vo"] += "保证"; r, out = run_make(cjk_root, ok, sid="bad-1")
    assert r.returncode == 1 and "保证" in r.stdout and not (out/"bad-1.mp4").exists()
    assert len(load_history(cjk_root/"data"/"history.json")) == before
def test_bad_footage_arg_fails_cleanly(cjk_root, ok):
    before = len(load_history(cjk_root/"data"/"history.json"))
    ok["structure"] = "count-up"; ok["mid_hook"] = "best_feature"
    r, out = run_make(cjk_root, ok, "--footage", "hook=不存在.mp4:0:2", sid="bad-2")
    assert r.returncode == 1 and "找不到实录文件" in r.stdout and not (out/"bad-2.mp4").exists()
    assert len(load_history(cjk_root/"data"/"history.json")) == before
def test_missing_photo_image_fails_before_render(cjk_root, ok):
    ok["structure"] = "day-in-life"; ok["mid_hook"] = "result_first"
    ok["scenes"][2] = {"type":"photo","vo":ok["scenes"][2]["vo"],"line1":"凌晨两点","line2":"还在填表格","image":"没有这张图.jpg"}
    r, out = run_make(cjk_root, ok, sid="bad-3")
    assert r.returncode == 1 and "没有这张图.jpg" in r.stdout and not (out/"bad-3.mp4").exists()
def test_tts_unavailable_fails_cleanly(cjk_root, ok):
    before = len(load_history(cjk_root/"data"/"history.json"))
    ok["structure"] = "question-then-pitfall"; ok["mid_hook"] = "result_first"
    r, out = run_make(cjk_root, ok, sid="bad-4", tts="voxcpm")
    assert r.returncode == 1 and ("参考音色" in r.stdout or "配音" in r.stdout) and not (out/"bad-4.mp4").exists()
    assert len(load_history(cjk_root/"data"/"history.json")) == before
