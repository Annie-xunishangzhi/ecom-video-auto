import numpy as np, pytest
from audio import SR, write_wav, read_wav
from compose import compose, plan_music, sections_from_script, MOODS
import json

TL = {"dur": 24.0, "cuts": [4.0, 9.0, 13.0, 17.0, 21.5]}
SEC = [(0, 4.0, "hook"), (4.0, 9.0, "build"), (9.0, 13.0, "suspense"), (13.0, 17.0, "reveal"), (17.0, 21.5, "cta"), (21.5, 24.0, "outro")]
def rms(x, a, b): return float(np.sqrt((x[int(a*SR):int(b*SR)]**2).mean()))

def test_length_is_exact_and_stereo():
    x = compose(TL, SEC, "upbeat", seed=1); assert x.shape == (int(24.0*SR), 2)
def test_soundfont_in_unicode_directory_renders_audio(tmp_path, monkeypatch):
    import compose as compose_module
    font = tmp_path / "中文音色" / "乐器.sf2"
    font.parent.mkdir()
    font.write_bytes(compose_module.SOUNDFONT.read_bytes())
    monkeypatch.setattr(compose_module, "SOUNDFONT", font)
    x = compose({"dur": 1.0, "cuts": []}, [(0, 1.0, "hook")], "warm", seed=1)
    assert x.shape == (SR, 2) and np.isfinite(x).all() and np.abs(x).max() > 0.01
def test_same_seed_same_music():
    assert np.array_equal(compose(TL, SEC, "upbeat", seed=3), compose(TL, SEC, "upbeat", seed=3))
def test_different_seed_different_music():
    a, b = compose(TL, SEC, "upbeat", seed=3), compose(TL, SEC, "upbeat", seed=4)
    assert not np.allclose(a, b, atol=1e-3)
def test_seeds_give_varied_plans():
    plans = {(p["key"], tuple(map(tuple, p["progression"])), p["palette"], p["bpm"]) for p in (plan_music(TL, "upbeat", s) for s in range(8))}
    assert len(plans) >= 5
@pytest.mark.parametrize("mood", sorted(MOODS))
def test_every_mood_renders_without_clipping_or_dead_air(mood):
    x = compose(TL, SEC, mood, seed=7); assert np.abs(x).max() <= 1.0
    for a in np.arange(0, 22.0, 2.0): assert rms(x, a, a+2.0) > 0.004, f"{mood}: silent at {a}s"
def test_tempo_stays_in_mood_range():
    for mood, cfg in MOODS.items():
        lo, hi = cfg["bpm"]; assert lo <= plan_music(TL, mood, 5)["bpm"] <= hi
def test_suspense_is_thinner_than_reveal():
    x = compose(TL, SEC, "upbeat", seed=2); assert rms(x, 9.5, 12.5) < rms(x, 13.2, 16.5) * 0.8
def test_reveal_lands_on_the_cut():
    x = compose(TL, SEC, "tense", seed=2); assert rms(x, 13.0, 13.4) > rms(x, 12.4, 12.9) * 1.3
def test_sections_from_script(fx):
    s = json.loads((fx/"script_ok.json").read_text(encoding="utf-8"))
    tl = {"dur": 40.0, "cuts": [5, 9, 16, 22, 27, 32, 37.8]}
    sec = sections_from_script(s, tl)
    assert [r for _, _, r in sec] == ["hook", "build", "build", "suspense", "suspense", "reveal", "cta", "outro"]
    assert sec[0][0] == 0 and sec[-1][1] == 40.0 and sec[3][0] == 16
def test_music_bed_keeps_composed_track_aligned(tmp_path):
    from mix import _music_bed
    f = tmp_path/"m.wav"; x = np.zeros((SR*6, 2), np.float32); x[int(0.3*SR):] = 0.3; write_wav(f, x)
    cuts = [4.25, 9.25]
    aligned = _music_bed({"file": str(f), "bpm": 120, "first_beat": 0.0, "aligned": True}, SR*5, cuts)
    shifted = _music_bed({"file": str(f), "bpm": 120, "first_beat": 0.0}, SR*5, cuts)
    assert np.abs(aligned[:int(0.25*SR)]).max() < 1e-4 and np.abs(shifted[int(0.1*SR):int(0.25*SR)]).max() > 0.01
def test_set_voice_lowers_pitch(tmp_path):
    import set_voice
    t = np.arange(SR*2)/SR; src = tmp_path/"v.wav"; write_wav(src, 0.4*np.sin(2*np.pi*400*t))
    set_voice.set_voice(src, semitones=-1.5, voice_dir=tmp_path/"voice", text="")
    y = read_wav(tmp_path/"voice"/"ref.wav"); f = np.fft.rfftfreq(len(y), 1/SR)[np.argmax(np.abs(np.fft.rfft(y)))]
    assert abs(f - 400*2**(-1.5/12)) < 3 and (tmp_path/"voice"/"ref.txt").read_text(encoding="utf-8") == ""
def test_backend_without_transcript_uses_reference_only(tmp_path):
    import tts
    seen = {}
    class M:
        class tts_model: sample_rate = 48000
        def generate(self, **kw): seen.update(kw); return np.zeros(4800, np.float32)
    b = tts.VoxCPMBackend(); b._m = M(); b.say("你好", tmp_path/"r.wav", "", tmp_path/"o.wav")
    assert "prompt_wav_path" not in seen and seen["reference_wav_path"].endswith("r.wav")
    seen.clear(); b.say("你好", tmp_path/"r.wav", "文本", tmp_path/"o.wav"); assert seen["prompt_text"] == "文本"
