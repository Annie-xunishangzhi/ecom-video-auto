"""生成并固定视频的配音音色：温润的男孩童音（VoxCPM 音色设计，不克隆任何真实人声）。
用法：python tools/design_voice.py            生成 3 个候选到 assets/voice/candidates/
      python tools/design_voice.py --pick 2   把第 2 个定为固定音色（assets/voice/ref.wav + ref.txt）"""
import shutil, sys
from pathlib import Path
from _paths import ROOT

VOICE_DESC = "八到十岁的男孩，声音温润柔和，吐字清晰，语速中等，不尖不刺耳，带一点笑意"
SAMPLE_TEXT = "上架一千个商品，以前要好几天，现在十分钟就够了。"
SEEDS = (11, 22, 33)
VOICE_DIR = ROOT / "assets" / "voice"

def design_text() -> str:
    return f"({VOICE_DESC}){SAMPLE_TEXT}"

def make_candidates(voice_dir: Path = VOICE_DIR) -> list:
    import numpy as np
    from voxcpm import VoxCPM
    from audio import write_wav
    m = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)
    out = voice_dir / "candidates"; out.mkdir(parents=True, exist_ok=True); files = []
    for i, seed in enumerate(SEEDS, 1):
        wav = m.generate(text=design_text(), cfg_value=2.0, inference_timesteps=10, seed=seed)
        f = out / f"c{i}.wav"; write_wav(f, np.asarray(wav, dtype=np.float32).reshape(-1), sr=int(m.tts_model.sample_rate)); files.append(f)
        print("候选", i, f)
    return files

def pick_candidate(n: int, voice_dir: Path = VOICE_DIR) -> None:
    src = Path(voice_dir) / "candidates" / f"c{n}.wav"
    if not src.is_file():
        raise FileNotFoundError(f"没有第 {n} 个候选：{src}")
    shutil.copyfile(src, Path(voice_dir) / "ref.wav")
    (Path(voice_dir) / "ref.txt").write_text(SAMPLE_TEXT, encoding="utf-8")

def harshness(wav: Path) -> float:
    """刺耳程度：4 kHz 以上的能量占比。越小越温润。"""
    import numpy as np
    from audio import SR, read_wav
    x = read_wav(wav); X = np.abs(np.fft.rfft(x)) ** 2; f = np.fft.rfftfreq(len(x), 1 / SR)
    return float(X[f >= 4000].sum() / (X[f >= 80].sum() or 1.0))

def auto_pick(voice_dir: Path = VOICE_DIR) -> int:
    """按测得的刺耳程度选最温润的一个候选（是测量值，不是听感）。"""
    cands = sorted((Path(voice_dir) / "candidates").glob("c*.wav"))
    if not cands:
        raise FileNotFoundError(f"还没有候选音色：{Path(voice_dir) / 'candidates'}")
    best = min(cands, key=harshness); n = int(best.stem[1:]); pick_candidate(n, voice_dir); return n

if __name__ == "__main__":
    if "--auto" in sys.argv:
        if not list((VOICE_DIR / "candidates").glob("c*.wav")): make_candidates()
        for f in sorted((VOICE_DIR / "candidates").glob("c*.wav")): print(f.name, "刺耳程度", round(harshness(f), 4))
        print("已自动选定第", auto_pick(), "个候选：assets/voice/ref.wav（不满意可用 --pick N 换）"); sys.exit(0)
    if "--pick" in sys.argv:
        pick_candidate(int(sys.argv[sys.argv.index("--pick") + 1])); print("已固定音色：assets/voice/ref.wav")
    else:
        make_candidates(); print("听一下 assets/voice/candidates/ 里的三个候选，再用 --pick N 选定。")
