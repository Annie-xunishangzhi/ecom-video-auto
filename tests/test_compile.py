import json, re, pytest
from pathlib import Path
from compile_script import compile_script, segments
@pytest.fixture
def ok(fx): return json.loads((fx/"script_ok.json").read_text(encoding="utf-8"))
VO = {f"s{i:02d}": 3.0 for i in range(1, 8)}
def content(js): return json.loads(re.search(r"window\.CONTENT=(.*?);\nwindow\.VO=", js, re.S).group(1))
def test_segments_in_scene_order(ok):
    s = segments(ok); assert [i for i, _ in s] == [f"s{i:02d}" for i in range(1, 8)] and s[0][1].startswith("一千个商品")
def test_voice_ids_assigned_in_order(ok):
    js = compile_script(ok, VO, {}); assert '"v": "s01"' in js and '"v": "s07"' in js
    assert [s.get("v") for s in content(js)["scenes"]] == [f"s{i:02d}" for i in range(1, 8)]
def test_scene_without_vo_gets_no_voice_id(ok):
    ok["scenes"][1]["vo"] = ""; c = content(compile_script(ok, VO, {}))
    assert "v" not in c["scenes"][1] and c["scenes"][2]["v"] == "s02"
def test_slot_without_footage_becomes_placeholder(ok):
    js = compile_script(ok, VO, {}); assert '"frames": null' in js
    assert all(s["n"] == 0 for s in content(js)["scenes"] if s["type"] == "footage")
def test_slot_with_footage_gets_frames_url(ok, tmp_path):
    d = tmp_path/"帧 目录"; d.mkdir()
    c = content(compile_script(ok, VO, {"hook": {"frames": str(d), "n": 15, "speed": 4.0, "seconds": 0.5}}))
    hook = next(s for s in c["scenes"] if s.get("slot") == "hook"); mid = next(s for s in c["scenes"] if s.get("slot") == "mid")
    assert hook["frames"].startswith("file://") and hook["n"] == 15 and hook["speed"] == 4.0 and mid["frames"] is None
def test_outro_theme_mascot_always_set(ok):
    js = compile_script(ok, VO, {}); c = content(js)
    assert '"outro": true' in js and c["theme"] == "paper" and c["mascot"]["dir"] == "../assets/mascot" and len(c["mascot"]["poses"]) == 9
def test_vo_durations_exported(ok):
    assert json.loads(compile_script(ok, VO, {}).split("window.VO=")[1].rstrip(";\n")) == VO
def test_cta_keyword_filled_from_cta(ok):
    assert content(compile_script(ok, VO, {}))["scenes"][-1]["keyword"] == "上架"
def test_photo_scene_takes_image_file(ok):
    ok["scenes"][2] = {"type":"photo","vo":"凌晨两点还在填表格","line1":"凌晨两点","line2":"还在填表格"}
    ok["images"] = [{"scene":2,"prompt":"x","file":"office-night.jpg"}]
    assert content(compile_script(ok, VO, {}))["scenes"][2]["image"] == "office-night.jpg"


def test_visual_file_goes_into_content(tmp_path):
    import json as _j
    from compile_script import compile_script
    vis = tmp_path / "visual.js"; vis.write_text("window.VISUALS={a:{}}", encoding="utf-8")
    sc = {"theme": "ink", "scenes": [{"type": "statement", "visual": "a", "vo": "你好"}]}
    js = compile_script(sc, {"s01": 1.0}, {}, vis)
    c = _j.loads(js.split("window.CONTENT=")[1].split(";\nwindow.VO=")[0])
    assert c["visual"] == vis.resolve().as_uri() and c["scenes"][0]["visual"] == "a"


def test_visual_named_but_file_missing(tmp_path):
    import pytest
    from compile_script import compile_script
    with pytest.raises(FileNotFoundError):
        compile_script({"scenes": [{"type": "statement", "visual": "a"}]}, {}, {}, tmp_path / "visual.js")
