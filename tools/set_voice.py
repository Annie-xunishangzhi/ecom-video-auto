"""把一段参考音频定为视频的固定音色，可以顺便把音调调低或调高。
用法：python tools/set_voice.py 参考.wav --pitch -1.5 [--text "参考音频里说的话"]"""
import argparse
from pathlib import Path
from scipy.signal import resample
from _paths import ROOT
from audio import read_wav, write_wav

def set_voice(src, semitones: float = 0.0, voice_dir: Path = ROOT / "assets" / "voice", text: str = "") -> Path:
    x = read_wav(src); ratio = 2 ** (semitones / 12.0)
    if abs(ratio - 1) > 1e-6: x = resample(x, int(round(len(x) / ratio)))    # 放慢即降调；克隆时模型会跟随参考音色
    voice_dir = Path(voice_dir); voice_dir.mkdir(parents=True, exist_ok=True)
    write_wav(voice_dir / "ref.wav", x); (voice_dir / "ref.txt").write_text(text, encoding="utf-8")
    return voice_dir / "ref.wav"

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("wav"); ap.add_argument("--pitch", type=float, default=0.0); ap.add_argument("--text", default="")
    a = ap.parse_args(); print("已设定音色：", set_voice(a.wav, a.pitch, text=a.text))
