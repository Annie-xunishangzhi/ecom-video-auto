"""音频读写：解码统一走 ffmpeg，写出统一为 16 位 WAV。"""
import subprocess, wave
from pathlib import Path
import numpy as np

SR = 48000

def read_wav(path, sr: int = SR, mono: bool = True) -> np.ndarray:
    path = Path(path)
    if not path.is_file():
        raise FileNotFoundError(f"找不到音频文件：{path}")
    if path.suffix.lower() == ".wav":          # 16 位 PCM 的 WAV 直接读，不依赖 ffmpeg
        try:
            with wave.open(str(path), "rb") as w:
                if w.getsampwidth() == 2 and w.getcomptype() == "NONE":
                    ch, rate = w.getnchannels(), w.getframerate()
                    x = np.frombuffer(w.readframes(w.getnframes()), "<i2").astype(np.float32) / 32768.0
                    x = x.reshape(-1, ch)
                    if rate != sr:
                        from math import gcd
                        from scipy.signal import resample_poly
                        g = gcd(sr, rate); x = resample_poly(x, sr // g, rate // g, axis=0).astype(np.float32)
                    if mono: return x.mean(axis=1)
                    return np.repeat(x, 2, axis=1) if ch == 1 else x[:, :2].copy()
        except wave.Error:
            pass
    # 其他格式按双声道解码，单声道时取两声道平均（ffmpeg 自带的下混会把电平抬高）
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "2", "-ar", str(sr), "-f", "f32le", "-"],
                       capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(f"音频解码失败：{path}：" + r.stderr.decode("utf-8", "replace")[-200:])
    x = np.frombuffer(r.stdout, "<f4").reshape(-1, 2)
    return x.mean(axis=1) if mono else x.copy()

def write_wav(path, x: np.ndarray, sr: int = SR) -> None:
    x = np.clip(np.asarray(x, dtype=np.float64), -1.0, 1.0)
    ch = 1 if x.ndim == 1 else x.shape[1]
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((x * 32767).astype("<i2").tobytes())

def duration(path) -> float:
    with wave.open(str(path), "rb") as w:
        return w.getnframes() / w.getframerate()
