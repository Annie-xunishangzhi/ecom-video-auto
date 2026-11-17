"""混音：配音 + 曲库配乐 + 音效 → WAV，并写字幕。配乐来自曲库，不再用代码合成旋律和鼓点。"""
import sys
from pathlib import Path
import numpy as np
from audio import SR, read_wav, write_wav
from music_pick import best_offset

ROOT = Path(__file__).resolve().parent.parent
rng = np.random.default_rng(7)
VOICE_PEAK = 0.62   # 人声峰值；用户要求人声比之前（0.85）稍低

def _tone(f, d, att=.01, rel=.3):
    tt = np.arange(int(SR * d)) / SR
    return np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / att) * np.clip((d - tt) / rel, 0, 1)
def _whoosh(d=.4):
    n = int(SR * d); x = rng.standard_normal(n); c = .02 + .5 * np.arange(n) / n
    y = np.zeros(n); a = 0.0
    for k in range(n): a += c[k] * (x[k] - a); y[k] = a
    return y * np.sin(np.pi * np.arange(n) / n) ** 2
def _add(buf, sig, at, g=1.0):
    i = int(at * SR); j = min(len(buf), i + len(sig))
    if 0 <= i < len(buf): buf[i:j] += g * sig[:j - i]

def _music_bed(track: dict, n: int, cuts: list) -> np.ndarray:
    f = Path(track["file"]); f = f if f.is_absolute() else ROOT / "assets" / "music" / f
    m = read_wav(f, mono=False).astype(np.float64)
    if len(m) < SR:
        raise ValueError(f"曲子太短：{f}")
    rms = np.sqrt((m ** 2).mean()) or 1.0
    m *= 0.12 / rms
    off = 0 if track.get("aligned") else int(best_offset(cuts, track.get("bpm") or 0, track.get("first_beat") or 0.0) * SR)
    out = m[off:]
    xf = min(SR, len(m) // 4); up = np.linspace(0, 1, xf)[:, None]
    while len(out) < n:                       # 不够长就循环，接缝处交叉淡化
        out = np.concatenate([out[:-xf], out[-xf:] * (1 - up) + m[:xf] * up, m[xf:]])
    return out[:n]

def _ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def duck_envelope(vo: np.ndarray) -> np.ndarray:
    """有人声的地方把配乐压低 60%"""
    w = int(SR * .15)
    env = np.convolve(np.abs(vo), np.ones(w) / w, "same")
    return 1 - .6 * np.clip(env / .05, 0, 1)

def mix(timeline: dict, voice_dir: Path, track: dict, out_wav: Path, out_srt: Path) -> None:
    voice_dir = Path(voice_dir); n = int(round(float(timeline["dur"]) * SR))
    files = [(v, voice_dir / f"{v['id']}.wav") for v in timeline.get("voice", [])]
    missing = [v["id"] for v, f in files if not f.is_file()]
    if missing:
        raise FileNotFoundError("缺少配音文件：" + "、".join(missing))
    vo = np.zeros(n); fx = np.zeros(n)
    for v, f in files:
        _add(vo, read_wav(f), v["at"])
    pk = np.abs(vo).max()
    if pk > 0: vo *= VOICE_PEAK / pk
    for c in timeline.get("cuts", []):
        _add(fx, _whoosh(), c - .25, .35)
    for t0, k in timeline.get("sfx", []):
        if k == "tick": _add(fx, _tone(1568, .06, .002, .05), t0, .12)
        elif k == "ding": _add(fx, _tone(880, .5, .003, .45), t0, .16); _add(fx, _tone(1318.5, .4, .003, .35), t0 + .06, .08)
        elif k == "pop": _add(fx, _tone(660, .12, .002, .1), t0, .11); _add(fx, _tone(990, .1, .002, .08), t0 + .05, .08)
    bed = _music_bed(track, n, timeline.get("cuts", [])) * duck_envelope(vo)[:, None]
    out = bed + (vo + fx * .8)[:, None]
    fl = int(1.2 * SR); out[-fl:] *= np.linspace(1, 0, fl)[:, None]
    out = np.tanh(out * 1.05) / np.tanh(1.05)
    peak = np.abs(out).max()
    if peak > .95: out *= .95 / peak
    write_wav(out_wav, out)
    caps = timeline.get("captions", [])
    Path(out_srt).write_text("\n".join(f"{i+1}\n{_ts(a)} --> {_ts(b)}\n{tx}\n" for i, (a, b, tx) in enumerate(caps)), encoding="utf-8")
