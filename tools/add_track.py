"""曲目入库：测 BPM 和首拍，转成统一格式，写入来源与授权。没有来源或授权的曲子不入库。
用法：python tools/add_track.py 曲子.mp3 --mood upbeat --source "Pixabay Music" --license "Pixabay Content License" --license-url https://…"""
import argparse, json, subprocess, sys
from pathlib import Path
import numpy as np
from scipy.signal import stft
from _paths import ROOT
from audio import SR, read_wav

MOODS = ("upbeat", "calm", "tense", "playful", "warm")
MUSIC_DIR = ROOT / "assets" / "music"
FPS = 200  # 起音包络的帧率

def estimate_bpm(x: np.ndarray, sr: int = SR):
    """返回 (bpm, first_beat 秒)。做法：谱通量起音包络 → 在 60–180 BPM 里找自相关最强的节拍 → 再找相位。"""
    hop = sr // FPS
    _, _, Z = stft(x, fs=sr, nperseg=hop * 4, noverlap=hop * 3, boundary=None, padded=False)
    mag = np.log1p(50 * np.abs(Z)); flux = np.maximum(0, np.diff(mag, axis=1)).sum(axis=0)
    flux = flux - flux.mean(); n = len(flux)
    acf = np.correlate(flux, flux, "full")[n - 1:]; acf = acf / (acf[0] or 1.0)
    lags = np.arange(len(acf))
    def score(bpm):
        lag = 60.0 / bpm * FPS
        s = sum(np.interp(m * lag, lags, acf) for m in (1, 2, 3, 4) if m * lag < n - 1)
        return s * np.exp(-0.5 * (np.log2(bpm / 120.0) / 0.6) ** 2)
    cands = np.arange(60, 180.01, 0.25)
    bpm = float(cands[int(np.argmax([score(b) for b in cands]))])
    beat = 60.0 / bpm; times = np.arange(n) / FPS + (hop * 2.5) / sr   # 帧中心，再补上差分的半帧
    def phase_score(ph):
        return float(np.interp(np.arange(ph, times[-1], beat), times, flux).sum())
    phases = np.arange(0, beat, 0.005)
    first = float(phases[int(np.argmax([phase_score(p) for p in phases]))])
    return round(bpm, 2), round(first, 3)

def add_track(src, mood: str, source: str, license: str, license_url: str = "", music_dir: Path = MUSIC_DIR, attribution: str = "", title: str = "") -> dict:
    src, music_dir = Path(src), Path(music_dir)
    if mood not in MOODS: raise ValueError(f"情绪只能是：{'、'.join(MOODS)}")
    if not (source or "").strip() or not (license or "").strip(): raise ValueError("必须写明来源和授权，否则不入库")
    x = read_wav(src)
    bpm, first = estimate_bpm(x)
    music_dir.mkdir(parents=True, exist_ok=True)
    lib_path = music_dir / "library.json"
    lib = json.loads(lib_path.read_text(encoding="utf-8")) if lib_path.is_file() else []
    k = 1
    while any(t["id"] == f"{mood}-{k:03d}" for t in lib): k += 1
    tid = f"{mood}-{k:03d}"; out = music_dir / f"{tid}.m4a"
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vn", "-ac", "2", "-ar", str(SR), "-c:a", "aac", "-b:a", "192k", str(out)],
                       capture_output=True, text=True)
    if r.returncode != 0: raise RuntimeError("转码失败：" + r.stderr[-200:])
    entry = {"id": tid, "file": out.name, "mood": mood, "bpm": bpm, "first_beat": first, "seconds": round(len(x) / SR, 1),
             "title": title or src.stem, "source": source.strip(), "license": license.strip(), "license_url": license_url.strip(), "attribution": attribution.strip()}
    lib.append(entry)
    lib_path.write_text(json.dumps(lib, ensure_ascii=False, indent=1), encoding="utf-8")
    return entry

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("file"); ap.add_argument("--mood", required=True, choices=MOODS)
    ap.add_argument("--source", required=True); ap.add_argument("--license", required=True)
    ap.add_argument("--license-url", default=""); ap.add_argument("--attribution", default="", help="需要署名时，贴进视频简介的那一行"); ap.add_argument("--title", default=""); ap.add_argument("--music-dir", default=str(MUSIC_DIR))
    a = ap.parse_args()
    print(json.dumps(add_track(a.file, a.mood, a.source, a.license, a.license_url, Path(a.music_dir), a.attribution, a.title), ensure_ascii=False))
