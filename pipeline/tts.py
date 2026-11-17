"""配音：逐段合成、去首尾静音、实测时长。某一段失败只重试那一段；重试用尽就整体报错，不产出带静音的结果。"""
import json
from pathlib import Path
import numpy as np
from audio import SR, read_wav, write_wav
from script_check import CPS, spoken_chars

class TTSFailed(Exception):
    pass

def expected_seconds(text: str) -> float:
    return spoken_chars(text) / CPS

class FakeBackend:
    """测试用：按字数生成等长的提示音，两头各带一段静音。"""
    def __init__(self, pad: float = 0.2): self.pad = pad
    def say(self, text, ref_wav, ref_text, out):
        n = int(expected_seconds(text) * SR); t = np.arange(n) / SR
        z = np.zeros(int(self.pad * SR), np.float32)
        write_wav(out, np.concatenate([z, 0.4 * np.sin(2 * np.pi * 300 * t), z]))

def load_model():
    """加载本机的 VoxCPM2。环境变量 VOXCPM_MODEL_DIR 指向本地模型目录时用本地模型，否则用 openbmb/VoxCPM2。
    按 8 GB 显存的设置加载：不做编译优化，不加载降噪器。"""
    import os
    from voxcpm import VoxCPM
    src = os.environ.get("VOXCPM_MODEL_DIR") or "openbmb/VoxCPM2"
    kw = {"load_denoiser": False, "optimize": False}
    if os.environ.get("VOXCPM_DEVICE"): kw["device"] = os.environ["VOXCPM_DEVICE"]
    try:
        return VoxCPM.from_pretrained(src, **kw)
    except TypeError:                      # 旧版本没有 optimize / device 参数
        return VoxCPM.from_pretrained(src, load_denoiser=False)

class VoxCPMBackend:
    """本机 VoxCPM2。用固定的参考音频做克隆，保证每条视频是同一个声音。"""
    def __init__(self, seed: int = 42):
        self.seed, self._m = seed, None
    def _model(self):
        if self._m is None: self._m = load_model()
        return self._m
    def say(self, text, ref_wav, ref_text, out):
        m = self._model()
        kw = dict(text=text, reference_wav_path=str(ref_wav), cfg_value=2.0, inference_timesteps=10, seed=self.seed)
        if ref_text: kw.update(prompt_wav_path=str(ref_wav), prompt_text=ref_text)   # 有参考文本时用更贴近原声的克隆方式
        wav = m.generate(**kw)
        write_wav(out, np.asarray(wav, dtype=np.float32).reshape(-1), sr=int(m.tts_model.sample_rate))

def _trim(x: np.ndarray) -> np.ndarray:
    if not len(x) or np.abs(x).max() < 1e-4:
        return x[:0]
    loud = np.flatnonzero(np.abs(x) > 0.02 * np.abs(x).max())
    m = int(0.03 * SR)
    return x[max(0, loud[0] - m): loud[-1] + m]

def synthesize(segments, out_dir: Path, backend, ref_wav: Path, ref_text: str, retries: int = 2) -> dict:
    out_dir, ref_wav = Path(out_dir), Path(ref_wav)
    if not ref_wav.is_file():
        raise FileNotFoundError(f"找不到参考音色：{ref_wav}（先运行 tools/design_voice.py）")
    for sid, text in segments:
        if not spoken_chars(text):
            raise ValueError(f"配音段 {sid} 没有文字")
    out_dir.mkdir(parents=True, exist_ok=True)
    durations = {}
    for sid, text in segments:
        out = out_dir / f"{sid}.wav"; exp = expected_seconds(text); last = ""
        for _ in range(retries + 1):
            try:
                backend.say(text, ref_wav, ref_text, out)
                x = _trim(read_wav(out)); d = len(x) / SR
                if not (0.4 * exp <= d <= max(2.5 * exp, exp + 1.5)):
                    raise RuntimeError(f"时长异常：{d:.1f} 秒（预期约 {exp:.1f} 秒）")
                write_wav(out, x); durations[sid] = round(d, 3); break
            except Exception as e:
                last = str(e)
        else:
            raise TTSFailed(f"配音段 {sid} 合成失败（已重试 {retries} 次）：{last}")
    (out_dir / "texts.json").write_text(json.dumps(dict(segments), ensure_ascii=False), encoding="utf-8")
    (out_dir / "voice.json").write_text(json.dumps(durations, ensure_ascii=False), encoding="utf-8")
    return durations

ROOT = Path(__file__).resolve().parent.parent
_BACKEND = None

def voice_for_script(script: dict, out_dir: Path, backend_name: str = "voxcpm") -> dict:
    """给一个剧本合成全部配音到 out_dir/voice/。backend_name: voxcpm（本机真实合成）或 fake（测试）"""
    from compile_script import segments
    vdir = Path(out_dir) / "voice"
    if backend_name == "fake":
        backend = FakeBackend(); ref = vdir / "_ref.wav"; write_wav(ref, np.zeros(4800)); ref_text = ""
    else:
        ref = ROOT / "assets" / "voice" / "ref.wav"; ref_txt = ROOT / "assets" / "voice" / "ref.txt"
        if not ref.is_file():
            raise TTSFailed("找不到参考音色 assets/voice/ref.wav：先运行 python tools/setup_tts.py，再运行 python tools/design_voice.py --auto")
        try:
            import voxcpm  # noqa: F401
        except ImportError:
            raise TTSFailed("这个 Python 环境里没有安装 voxcpm：先运行 python tools/setup_tts.py")
        global _BACKEND
        if _BACKEND is None: _BACKEND = VoxCPMBackend()        # 多个剧本共用一次模型加载
        backend = _BACKEND; ref_text = ref_txt.read_text(encoding="utf-8").strip() if ref_txt.is_file() else ""
    return synthesize(segments(script), vdir, backend, ref, ref_text)

def reuse_voice(script: dict, out_dir: Path) -> dict:
    """复用已合成的配音；配音文本和剧本对不上时报错"""
    from compile_script import segments
    vdir = Path(out_dir) / "voice"
    try:
        texts = json.loads((vdir / "texts.json").read_text(encoding="utf-8")); voice = json.loads((vdir / "voice.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        raise TTSFailed(f"没有可复用的配音：{vdir}")
    want = dict(segments(script))
    if texts != want or set(voice) != set(want) or any(not (vdir / f"{k}.wav").is_file() for k in want):
        raise TTSFailed("已有配音与剧本不一致，请重新合成（去掉 --reuse-voice）")
    return voice

if __name__ == "__main__":
    import argparse, sys
    for s_ in (sys.stdout, sys.stderr):
        try: s_.reconfigure(encoding="utf-8")
        except Exception: pass
    ap = argparse.ArgumentParser(description="只合成配音：python pipeline/tts.py out/<id>/script.json [更多剧本…]")
    ap.add_argument("scripts", nargs="+"); ap.add_argument("--backend", default="voxcpm", choices=["voxcpm", "fake"])
    a = ap.parse_args(); rc = 0
    for f in a.scripts:
        f = Path(f).resolve()
        try:
            d = voice_for_script(json.loads(f.read_text(encoding="utf-8")), f.parent, a.backend)
            print(f"✓ {f.parent.name}：{len(d)} 段，共 {sum(d.values()):.1f} 秒")
        except (TTSFailed, OSError, ValueError) as e:
            print(f"✗ {f.parent.name}：{e}"); rc = 1
    sys.exit(rc)
