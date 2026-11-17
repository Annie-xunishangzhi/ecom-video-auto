"""环境体检：出片需要的东西是否齐全。✓ 就绪  ✗ 必须先解决  ! 可以先跑但功能不全。退出码：有 ✗ 时为 1。"""
import importlib.util, json, shutil, subprocess, sys
from pathlib import Path
from _paths import ROOT

def _node_has(pkg: str) -> bool:
    try:
        return subprocess.run(["node", "-e", f"require('{pkg}')"], cwd=str(ROOT), capture_output=True, timeout=30).returncode == 0
    except Exception:
        return False

def checks():
    v = sys.version_info
    yield "✓" if (3, 10) <= v[:2] else "✗", f"Python {v[0]}.{v[1]}", "需要 3.10 及以上（语音合成需要 3.10–3.12）"
    for tool, hint in (("node", "安装 Node.js 18 以上：https://nodejs.org"), ("ffmpeg", "安装 ffmpeg 并加入 PATH（Windows 可用：winget install Gyan.FFmpeg）"), ("ffprobe", "随 ffmpeg 一起安装")):
        yield ("✓" if shutil.which(tool) else "✗"), tool, hint
    missing = [m for m in ("numpy", "scipy", "PIL") if importlib.util.find_spec(m) is None]
    yield ("✗" if missing else "✓"), "Python 依赖", "运行：python -m pip install -r requirements.txt"
    pw = bool(shutil.which("node")) and _node_has("playwright")
    yield ("✓" if pw else "✗"), "Playwright", "在工程根目录运行：npm install，然后 npx playwright install chromium"
    pypw = importlib.util.find_spec("playwright") is not None
    yield ("✓" if pypw else "!"), "Python 版 Playwright（录网页工具、爆款采集）", "运行：python -m pip install playwright，然后 python -m playwright install chromium"
    sf = (ROOT / "assets" / "soundfont" / "GeneralUser-GS.sf2").is_file() and importlib.util.find_spec("tinysoundfont") is not None
    yield ("✓" if sf else "!"), "原创编曲（SoundFont 音色）", "运行：python -m pip install --no-deps tinysoundfont；音色库应在 assets/soundfont/"
    ref = (ROOT / "assets" / "voice" / "ref.wav").is_file(); vox = importlib.util.find_spec("voxcpm") is not None
    yield ("✓" if ref and vox else "!"), "配音（VoxCPM + 固定音色）", "运行：python tools/setup_tts.py，再运行 python tools/design_voice.py --auto"
    lib = ROOT / "assets" / "music" / "library.json"
    n = len(json.loads(lib.read_text(encoding="utf-8"))) if lib.is_file() else 0
    yield ("✓" if n >= 12 else "!" if n else "✗"), f"曲库（{n} 首）", "用 tools/add_track.py 入库，建议 30 首以上"
    poses = len(list((ROOT / "assets" / "mascot").glob("*.png")))
    yield ("✓" if poses >= 9 else "✗"), f"企鹅素材（{poses} 个姿势）", "assets/mascot/ 里应有 9 个姿势"

def main(argv=None) -> int:
    for s in (sys.stdout, sys.stderr):
        try: s.reconfigure(encoding="utf-8")
        except Exception: pass
    bad = False
    for mark, label, hint in checks():
        print(mark, label, "" if mark == "✓" else "— " + hint); bad |= mark == "✗"
    return 1 if bad else 0

if __name__ == "__main__":
    sys.exit(main())
