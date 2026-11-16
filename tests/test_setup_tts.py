import setup_tts
def patch(mp, py=(3,11), gpu=("RTX 4070", 12.0), installed=True, cached=True):
    mp.setattr(setup_tts, "_python_version", lambda: py); mp.setattr(setup_tts, "_gpu", lambda: gpu)
    mp.setattr(setup_tts, "_voxcpm_installed", lambda: installed); mp.setattr(setup_tts, "_model_cached", lambda: cached)
    calls = []; mp.setattr(setup_tts, "_install", lambda: calls.append("install") or True)
    mp.setattr(setup_tts, "_download_model", lambda: calls.append("download") or True); return calls
def test_ready_exits_0_without_installing(monkeypatch):
    calls = patch(monkeypatch); assert setup_tts.main([]) == 0 and calls == []
def test_installs_when_missing(monkeypatch):
    calls = patch(monkeypatch, installed=False, cached=False); assert setup_tts.main([]) == 0 and calls == ["install","download"]
def test_low_vram_exits_3(monkeypatch, capsys):
    calls = patch(monkeypatch, gpu=("GTX 1650", 4.0), installed=False)
    assert setup_tts.main([]) == 3 and calls == [] and "显存" in capsys.readouterr().out
def test_no_gpu_exits_3(monkeypatch, capsys):
    calls = patch(monkeypatch, gpu=None, installed=False)
    assert setup_tts.main([]) == 3 and calls == [] and "显卡" in capsys.readouterr().out
def test_python_313_exits_4(monkeypatch):
    calls = patch(monkeypatch, py=(3,13), installed=False); assert setup_tts.main([]) == 4 and calls == []
def test_python_39_exits_4(monkeypatch):
    patch(monkeypatch, py=(3,9)); assert setup_tts.main([]) == 4
def test_check_reports_fields(monkeypatch):
    patch(monkeypatch); c = setup_tts.check()
    assert c == {"python_ok": True, "gpu_name": "RTX 4070", "vram_gb": 12.0, "voxcpm_installed": True, "model_cached": True}
def test_install_failure_exits_1(monkeypatch):
    patch(monkeypatch, installed=False); monkeypatch.setattr(setup_tts, "_install", lambda: False)
    assert setup_tts.main([]) == 1
