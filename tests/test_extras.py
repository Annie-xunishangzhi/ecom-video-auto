import json, subprocess, sys, wave, pytest
import numpy as np
from pathlib import Path
import audio
from audio import write_wav, read_wav, SR
from audio_util import tone

def test_read_wav_pcm_needs_no_ffmpeg(tmp_path, monkeypatch):
    f = tmp_path/"a.wav"; write_wav(f, tone(300, 1.0, sr=16000), sr=16000)
    def boom(*a, **k): raise AssertionError("ffmpeg should not be called for PCM wav")
    monkeypatch.setattr(audio.subprocess, "run", boom)
    x = read_wav(f); assert abs(len(x)/SR - 1.0) < 0.01 and 0.3 < np.abs(x).max() < 0.6
def test_read_wav_stereo_pcm_mono_is_average(tmp_path):
    f = tmp_path/"s.wav"; write_wav(f, np.stack([tone(300,0.5), tone(300,0.5)], axis=1))
    assert np.abs(read_wav(f)).max() < 0.55 and read_wav(f, mono=False).shape[1] == 2

def test_auto_pick_prefers_mellow_voice(tmp_path):
    import design_voice as dv
    c = tmp_path/"candidates"; c.mkdir()
    t = np.arange(SR*2)/SR
    mellow = sum(np.sin(2*np.pi*300*k*t)/k**2 for k in range(1, 6))
    harsh  = sum(np.sin(2*np.pi*300*k*t)/k**0.3 for k in range(1, 25))
    write_wav(c/"c1.wav", 0.3*harsh/np.abs(harsh).max()); write_wav(c/"c2.wav", 0.3*mellow/np.abs(mellow).max())
    assert dv.auto_pick(tmp_path) == 2 and (tmp_path/"ref.wav").exists()
    assert dv.harshness(c/"c1.wav") > dv.harshness(c/"c2.wav")
def test_auto_pick_without_candidates_raises(tmp_path):
    import design_voice as dv
    with pytest.raises(FileNotFoundError): dv.auto_pick(tmp_path)

def test_tts_cli_writes_voice_for_each_script(tmp_path, root, fx):
    d = tmp_path/"out"/"x"; d.mkdir(parents=True); (d/"script.json").write_text((fx/"script_ok.json").read_text(encoding="utf-8"), encoding="utf-8")
    r = subprocess.run([sys.executable, str(root/"pipeline"/"tts.py"), str(d/"script.json"), "--backend", "fake"], capture_output=True, text=True, encoding="utf-8")
    assert r.returncode == 0, r.stdout + r.stderr
    v = json.loads((d/"voice"/"voice.json").read_text()); assert len(v) == 7 and (d/"voice"/"s07.wav").exists()

def test_doctor_reports_missing_tool(monkeypatch, capsys):
    import doctor
    monkeypatch.setattr(doctor.shutil, "which", lambda name: None if name == "ffmpeg" else "/usr/bin/" + name)
    rc = doctor.main([]); out = capsys.readouterr().out
    assert rc == 1 and "ffmpeg" in out and "✗" in out
def test_doctor_lists_every_check(capsys):
    import doctor
    doctor.main([]); out = capsys.readouterr().out
    for word in ["Python", "node", "ffmpeg", "Playwright", "配音", "曲库", "企鹅"]: assert word in out, word

def test_add_track_keeps_attribution(tmp_path):
    from add_track import add_track
    src = tmp_path/"a.wav"; write_wav(src, tone(220, 6.0))
    e = add_track(src, mood="calm", source="s", license="CC BY 4.0", license_url="u", attribution="《曲名》作者", music_dir=tmp_path/"m")
    assert e["attribution"] == "《曲名》作者"
