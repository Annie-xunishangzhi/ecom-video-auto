"""实录槽位：把录屏片段按倍速抽成帧序列；没有实录时返回占位。"""
import shutil, subprocess
from pathlib import Path

def probe_seconds(clip: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(clip)],
                         capture_output=True, text=True)
    try:
        return float(out.stdout.strip())
    except ValueError:
        raise ValueError(f"读不出这个视频的时长：{clip}")

def extract(clip: Path, out_dir: Path, start: float, dur: float, speed: float = 4.0, fps: int = 30) -> dict:
    clip, out_dir = Path(clip), Path(out_dir)
    if not clip.is_file():
        raise FileNotFoundError(f"找不到实录文件：{clip}")
    total = probe_seconds(clip)
    if start < 0 or dur <= 0 or start + dur > total + 0.05:
        raise ValueError(f"截取范围 {start}–{start+dur} 秒超出了视频长度 {total:.1f} 秒")
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)
    n = int(round(dur / speed * fps))
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(start), "-t", str(dur), "-i", str(clip),
                        "-vf", f"setpts=PTS/{speed},fps={fps},scale=940:-2", "-frames:v", str(n), "-q:v", "3",
                        "-start_number", "0", str(out_dir / "%04d.jpg")], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError("抽帧失败：" + r.stderr.strip()[-300:])
    n = len(list(out_dir.glob("*.jpg")))
    return {"frames": str(out_dir), "n": n, "seconds": n / fps, "speed": speed}

def placeholder() -> dict:
    return {"frames": None, "n": 0}
