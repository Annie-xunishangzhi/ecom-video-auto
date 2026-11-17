import json
import frames_pack as fp

def test_concat_durations(tmp_path):
    fr = [{"file": "out\\_kimi\\shots\\b.png", "at": 105.0}, {"file": "out/_kimi/shots/a.png", "at": 100.0}]
    t = fp.concat_list(fr, tmp_path, tail=2)
    lines = t.splitlines()
    assert lines[0].endswith("a.png'") and lines[1] == "duration 5.000"
    assert lines[2].endswith("b.png'") and lines[3] == "duration 2.000" and lines[4].endswith("b.png'")

def test_steps_from_marks():
    m = [{"name": "填价格", "at": 130, "hl": "hook"}, {"name": "进表单", "at": 110}]
    assert fp.steps_from(m, 100, 50) == [{"name": "进表单", "start": 10, "end": 30}, {"name": "填价格", "start": 30, "end": 50, "hl": "hook"}]

def test_build_end_to_end(tmp_path, monkeypatch, fx):
    import pack, subprocess
    monkeypatch.setattr(pack, "FOOTAGE", tmp_path / "footage")
    for i, c in enumerate(["red", "blue", "green"]):
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color={c}:s=640x360", "-frames:v", "1", str(tmp_path / f"{i}.png")], check=True)
    (tmp_path / "f.jsonl").write_text("\n".join(json.dumps({"file": f"{i}.png", "at": 100 + 3 * i}) for i in range(3)), encoding="utf-8")
    (tmp_path / "m.jsonl").write_text(json.dumps({"name": "全程", "at": 100}), encoding="utf-8")
    f = fp.build("s4", "上架", tmp_path / "f.jsonl", tmp_path / "m.jsonl", [], root=tmp_path)
    p = pack.load_pack("s4", allow_pending=True)
    assert p["review"] == "pending" and p["recorder"] == "kimi-frames" and 7.5 < fp_secs(tmp_path, p) < 8.6

def fp_secs(tmp_path, p):
    from build_pack import _secs
    return _secs(tmp_path / "footage" / "s4" / p["clip"])
