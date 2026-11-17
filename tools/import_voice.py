"""把网页版 VoxCPM 生成的分段配音导入 out/<编号>/voice/：去首尾静音、把句中长停顿压到 0.3 秒，写 voice.json / texts.json。
用法：python tools/import_voice.py out/<编号> 源目录   （源目录里放 s01.wav s02.wav …，与剧本场景一一对应）"""
import json, sys
from pathlib import Path
import numpy as np
from _paths import ROOT
sys.path.insert(0, str(ROOT / "pipeline"))
from audio import SR, read_wav, write_wav
from tts import _trim
from compile_script import segments

def squeeze(x: np.ndarray, max_gap: float = 0.3, floor: float = 0.02) -> np.ndarray:
    """句中低于 floor×峰值、长于 max_gap 的停顿压到 max_gap"""
    if not len(x): return x
    quiet = np.abs(x) < floor * np.abs(x).max()
    win = int(0.01 * SR); keep = []; i = 0; n = len(x); gap = int(max_gap * SR)
    while i < n:
        j = i
        while j < n and quiet[j]: j += 1
        if j - i > gap:
            keep.append(x[i:i + gap // 2]); keep.append(x[j - gap // 2:j]); i = j
        elif j > i:
            keep.append(x[i:j]); i = j
        else:
            k = i
            while k < n and not quiet[k]: k += win
            keep.append(x[i:min(k, n)]); i = min(k, n)
    return np.concatenate(keep)

def main(out_dir: Path, src: Path):
    script = json.loads((out_dir / "script.json").read_text(encoding="utf-8"))
    segs = dict(segments(script)); vdir = out_dir / "voice"; vdir.mkdir(parents=True, exist_ok=True)
    voice = {}
    for sid in segs:
        x = squeeze(_trim(read_wav(src / f"{sid}.wav")))
        write_wav(vdir / f"{sid}.wav", x); voice[sid] = round(len(x) / SR, 3)
    (vdir / "voice.json").write_text(json.dumps(voice), encoding="utf-8")
    (vdir / "texts.json").write_text(json.dumps(segs, ensure_ascii=False), encoding="utf-8")
    print(voice)

if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
