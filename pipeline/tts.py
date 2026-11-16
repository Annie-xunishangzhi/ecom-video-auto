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

class VoxCPMBackend:
    """本机 VoxCPM2。用固定的参考音频做克隆，保证每条视频是同一个声音。"""
    def __init__(self, model_id: str = "openbmb/VoxCPM2", seed: int = 42):
        self.model_id, self.seed, self._m = model_id, seed, None
    def _model(self):
        if self._m is None:
            from voxcpm import VoxCPM
            self._m = VoxCPM.from_pretrained(self.model_id, load_denoiser=False)
        return self._m
    def say(self, text, ref_wav, ref_text, out):
        m = self._model()
        wav = m.generate(text=text, prompt_wav_path=str(ref_wav), prompt_text=ref_text,
                         reference_wav_path=str(ref_wav), cfg_value=2.0, inference_timesteps=10, seed=self.seed)
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
    (out_dir / "voice.json").write_text(json.dumps(durations, ensure_ascii=False), encoding="utf-8")
    return durations
