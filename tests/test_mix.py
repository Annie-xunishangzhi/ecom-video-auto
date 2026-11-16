import json, subprocess, sys, pytest
import numpy as np
from pathlib import Path
from audio import write_wav, read_wav, duration, SR
from mix import mix
from add_track import add_track, estimate_bpm
from audio_util import tone, band_level

@pytest.fixture
def setup(tmp_path):
    vd = tmp_path/"voice"; vd.mkdir(); write_wav(vd/"s01.wav", tone(2000, 5.0, 0.6))
    tl = {"dur": 40.0, "cuts": [10.0, 20.0, 30.0], "sfx": [[12.0,"ding"],[13.0,"tick"],[14.0,"pop"]],
          "voice": [{"id":"s01","at":20.0}], "captions": [[20.0, 22.5, "第一句"], [22.5, 25.0, "第二句"]]}
    long = tmp_path/"long.wav"; write_wav(long, tone(220, 60.0, 0.5))
    short = tmp_path/"short.wav"; write_wav(short, tone(220, 12.0, 0.5))
    T = lambda f: {"id":"t","file":str(f),"bpm":120,"first_beat":0.0}
    return tl, vd, T(long), T(short), tmp_path
def test_output_length_and_format(setup):
    tl, vd, long, short, tmp = setup; mix(tl, vd, long, tmp/"a.wav", tmp/"c.srt")
    assert abs(duration(tmp/"a.wav") - 40.0) < 0.05
    import wave; w = wave.open(str(tmp/"a.wav")); assert (w.getnchannels(), w.getframerate()) == (2, 48000)
def test_short_track_is_looped_to_full_length(setup):
    tl, vd, long, short, tmp = setup; mix(tl, vd, short, tmp/"a.wav", tmp/"c.srt")
    x = read_wav(tmp/"a.wav")
    assert abs(len(x)/SR - 40.0) < 0.05
    for a in (15, 26, 33): assert band_level(x[a*SR:(a+2)*SR], 220) > 50, f"no music at {a}s"
def test_music_is_ducked_under_voice(setup):
    tl, vd, long, short, tmp = setup; mix(tl, vd, long, tmp/"a.wav", tmp/"c.srt")
    x = read_wav(tmp/"a.wav")
    quiet = band_level(x[21*SR:24*SR], 220); loud = band_level(x[5*SR:8*SR], 220)
    assert quiet < loud*0.6 and band_level(x[21*SR:24*SR], 2000) > band_level(x[5*SR:8*SR], 2000)*10
def test_fades_out_at_end(setup):
    tl, vd, long, short, tmp = setup; mix(tl, vd, long, tmp/"a.wav", tmp/"c.srt")
    x = read_wav(tmp/"a.wav"); assert np.abs(x[-int(0.05*SR):]).max() < 0.02
def test_missing_voice_file_raises(setup):
    tl, vd, long, short, tmp = setup; tl["voice"].append({"id":"s02","at":30.0})
    with pytest.raises(FileNotFoundError) as e: mix(tl, vd, long, tmp/"a.wav", tmp/"c.srt")
    assert "s02" in str(e.value) and not (tmp/"a.wav").exists()
def test_srt_written(setup):
    tl, vd, long, short, tmp = setup; mix(tl, vd, long, tmp/"a.wav", tmp/"c.srt")
    s = (tmp/"c.srt").read_text(encoding="utf-8")
    assert "1\n00:00:20,000 --> 00:00:22,500\n第一句" in s and "2\n00:00:22,500 --> 00:00:25,000\n第二句" in s
def test_no_clipping(setup):
    tl, vd, long, short, tmp = setup; mix(tl, vd, long, tmp/"a.wav", tmp/"c.srt")
    assert np.abs(read_wav(tmp/"a.wav")).max() <= 1.0

def clicks(bpm, first, seconds=20):
    x = np.zeros(int(seconds*SR), np.float32); beat = 60/bpm; t = first
    while t < seconds-0.1:
        i = int(t*SR); x[i:i+400] += tone(1000, 400/SR, 0.9)*np.linspace(1,0,400); t += beat
    return x
@pytest.mark.parametrize("bpm,first", [(120, 0.25), (96, 0.1), (140, 0.0)])
def test_estimate_bpm(bpm, first):
    b, fb = estimate_bpm(clicks(bpm, first)); beat = 60/b
    assert abs(b - bpm) < 2.5
    d = (fb - first) % beat; assert min(d, beat-d) < 0.06
def test_add_track_writes_library(tmp_path):
    src = tmp_path/"我的 曲子.wav"; write_wav(src, clicks(120, 0.25))
    lib = tmp_path/"m"/"library.json"
    e = add_track(src, mood="upbeat", source="Pixabay", license="Pixabay Content License", license_url="https://pixabay.com/service/license-summary/", music_dir=tmp_path/"m")
    data = json.loads(lib.read_text(encoding="utf-8"))
    assert len(data) == 1 and data[0] == e and (tmp_path/"m"/e["file"]).exists()
    assert abs(e["bpm"]-120) < 2.5 and abs(e["seconds"]-20) < 0.2 and e["license"] and e["source"] == "Pixabay"
def test_add_track_unique_ids(tmp_path):
    src = tmp_path/"a.wav"; write_wav(src, clicks(120, 0))
    k = dict(mood="calm", source="s", license="l", license_url="u", music_dir=tmp_path/"m")
    assert add_track(src, **k)["id"] != add_track(src, **k)["id"]
def test_add_track_rejects_unknown_mood(tmp_path):
    src = tmp_path/"a.wav"; write_wav(src, clicks(120, 0))
    with pytest.raises(ValueError): add_track(src, mood="sad", source="s", license="l", license_url="u", music_dir=tmp_path/"m")
def test_add_track_requires_license(tmp_path, root):
    src = tmp_path/"a.wav"; write_wav(src, clicks(120, 0))
    r = subprocess.run([sys.executable, str(root/"tools"/"add_track.py"), str(src), "--mood", "upbeat", "--source", "x", "--music-dir", str(tmp_path/"m")], capture_output=True, text=True)
    assert r.returncode != 0 and not (tmp_path/"m"/"library.json").exists()
