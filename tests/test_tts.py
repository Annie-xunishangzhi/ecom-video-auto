import json, pytest
from pathlib import Path
import numpy as np
from audio import write_wav, read_wav, duration, SR
from tts import synthesize, FakeBackend, TTSFailed, expected_seconds
from audio_util import tone

@pytest.fixture
def ref(tmp_path):
    w = tmp_path/"ref.wav"; write_wav(w, tone(300, 1.0)); return (w, "参考文本")

class FlakyBackend(FakeBackend):
    def __init__(self, fail_first_n): super().__init__(); self.left = dict(fail_first_n); self.calls = {}
    def say(self, text, ref_wav, ref_text, out):
        sid = Path(out).stem; self.calls[sid] = self.calls.get(sid, 0) + 1
        if self.left.get(sid, 0) > 0: self.left[sid] -= 1; raise RuntimeError("boom")
        super().say(text, ref_wav, ref_text, out)
class LongSilenceBackend(FakeBackend):
    def __init__(self): super().__init__(); self.calls = 0
    def say(self, text, ref_wav, ref_text, out):
        self.calls += 1; write_wav(out, np.concatenate([tone(300, 0.2), np.zeros(SR*30, np.float32), tone(300, 0.2)]))

def test_durations_written(tmp_path, ref):
    d = synthesize([("s01","你好世界你好"),("s02","上架一千个商品")], tmp_path/"v", FakeBackend(), *ref)
    assert set(d) == {"s01","s02"} and json.loads((tmp_path/"v"/"voice.json").read_text()) == d
    assert abs(d["s02"] - duration(tmp_path/"v"/"s02.wav")) < 0.02
def test_silence_is_trimmed(tmp_path, ref):
    d = synthesize([("s01","上架一千个商品")], tmp_path/"v", FakeBackend(pad=0.5), *ref)
    assert abs(d["s01"] - expected_seconds("上架一千个商品")) < 0.12
def test_output_is_mono_48k(tmp_path, ref):
    synthesize([("s01","上架一千个商品")], tmp_path/"v", FakeBackend(), *ref)
    import wave; w = wave.open(str(tmp_path/"v"/"s01.wav")); assert (w.getnchannels(), w.getframerate()) == (1, 48000)
def test_only_failed_segment_is_retried(tmp_path, ref):
    b = FlakyBackend(fail_first_n={"s02": 1})
    synthesize([("s01","你好世界你好"),("s02","再见世界再见")], tmp_path/"v", b, *ref)
    assert b.calls == {"s01": 1, "s02": 2}
def test_gives_up_with_clear_error(tmp_path, ref):
    with pytest.raises(TTSFailed) as e:
        synthesize([("s01","你好世界你好")], tmp_path/"v", FlakyBackend(fail_first_n={"s01": 9}), *ref)
    assert "s01" in str(e.value)
    assert not (tmp_path/"v"/"voice.json").exists()
def test_abnormal_duration_counts_as_failure(tmp_path, ref):
    b = LongSilenceBackend()
    with pytest.raises(TTSFailed): synthesize([("s01","你好世界你好")], tmp_path/"v", b, *ref, retries=2)
    assert b.calls == 3
def test_empty_text_rejected(tmp_path, ref):
    with pytest.raises(ValueError): synthesize([("s01","  ")], tmp_path/"v", FakeBackend(), *ref)
def test_missing_reference_voice_rejected(tmp_path):
    with pytest.raises(FileNotFoundError): synthesize([("s01","你好")], tmp_path/"v", FakeBackend(), tmp_path/"no.wav", "x")

def test_pick_candidate_fixes_reference(tmp_path):
    import design_voice as dv
    c = tmp_path/"candidates"; c.mkdir(); write_wav(c/"c2.wav", tone(300, 1.0))
    dv.pick_candidate(2, tmp_path)
    assert (tmp_path/"ref.wav").exists() and (tmp_path/"ref.txt").read_text(encoding="utf-8") == dv.SAMPLE_TEXT
def test_pick_missing_candidate_raises(tmp_path):
    import design_voice as dv
    with pytest.raises(FileNotFoundError): dv.pick_candidate(3, tmp_path)
def test_voice_description_is_the_agreed_one():
    import design_voice as dv
    assert "男孩" in dv.VOICE_DESC and "温润" in dv.VOICE_DESC and dv.design_text().startswith("(" + dv.VOICE_DESC + ")")
