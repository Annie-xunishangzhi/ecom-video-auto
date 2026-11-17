import copy, json, shutil
import pytest
import make, pack
from script_check import check, measured_problems

def _pack(fx, d, **kw):
    (d / "s2").mkdir(parents=True, exist_ok=True); shutil.copy(fx / "clip.mp4", d / "s2" / "clip-1.mp4")
    p = {"step": "s2", "product": "t", "recorder": "web", "clip": "clip-1.mp4", "recorded_at": "x",
         "measured": {"items": 120, "seconds": 90.0}, "steps": [],
         "highlights": {"hook": {"start": 0.0, "dur": 1.0, "speed": 1.0}, "mid": {"start": 1.0, "dur": 1.0, "speed": 1.0}},
         "masked": True, "review": "ok"}
    p.update(kw); pack.save_pack(p)

@pytest.fixture
def fdir(tmp_path, monkeypatch):
    monkeypatch.setattr(pack, "FOOTAGE", tmp_path / "footage"); return tmp_path / "footage"

SCRIPT = {"step": 2, "scenes": [{"type": "footage", "slot": "hook"}, {"type": "statement"}, {"type": "footage", "slot": "mid"}]}

def test_parse_auto():
    assert make._parse_footage(["auto"]) == "auto"

def test_auto_uses_pack(fx, fdir, tmp_path):
    _pack(fx, fdir)
    foot = make.footage_slots(SCRIPT, "auto", tmp_path / "out")
    assert foot["hook"]["n"] > 0 and foot["mid"]["n"] > 0

def test_auto_without_pack_is_placeholder(fdir, tmp_path):
    foot = make.footage_slots(SCRIPT, "auto", tmp_path / "out")
    assert foot == {"hook": {"frames": None, "n": 0}, "mid": {"frames": None, "n": 0}}

def test_auto_pending_pack_is_placeholder(fx, fdir, tmp_path):
    _pack(fx, fdir, review="pending")
    assert make.footage_slots(SCRIPT, "auto", tmp_path / "out")["hook"]["n"] == 0

def _measured_script(text, to=None):
    s = {"step": 2, "skill": {"provided": True}, "scenes": [{"type": "counter", "measured": True, "title": text, **({"to": to} if to is not None else {})}]}
    return s

@pytest.mark.parametrize("text,to", [("实测 120 个商品", None), ("一共", 120), ("只用 1.5 分钟", None), ("90 秒搞定", None), ("1分半", None)])
def test_measured_numbers_match(text, to):
    assert measured_problems(_measured_script(text, to), {"items": 120, "seconds": 90.0}) == []

@pytest.mark.parametrize("text,to", [("实测 200 个商品", None), ("一共", 300), ("只用 3 分钟", None)])
def test_measured_numbers_mismatch(text, to):
    assert measured_problems(_measured_script(text, to), {"items": 120, "seconds": 90.0})

def test_measured_without_pack():
    probs = measured_problems(_measured_script("实测 120 个商品"), None)
    assert probs and "素材包" in probs[0]

def test_check_passes_pack_through(fx):
    s = json.loads((fx / "script_ok.json").read_text(encoding="utf-8"))
    s = copy.deepcopy(s); s["scenes"][0]["measured"] = True
    assert any("素材包" in p for p in check(s, [], measured=None))

def test_refill(fx, fdir, tmp_path, monkeypatch):
    import refill
    out = tmp_path / "out" / "v1"; out.mkdir(parents=True)
    (out / "script.json").write_text(json.dumps({"id": "v1", "step": 2}), encoding="utf-8")
    (out / "publish.json").write_text(json.dumps({"pending_footage": True}), encoding="utf-8")
    hist = tmp_path / "history.json"
    hist.write_text(json.dumps([{"id": "v0"}, {"id": "v1", "has_footage": False}, {"id": "v9"}]), encoding="utf-8")
    calls = []
    def fake_run(script_path, footage, backend, reuse_voice=False, music_mode="compose", check_history=None):
        calls.append((footage, reuse_voice, [h["id"] for h in check_history]))
        h = json.loads(hist.read_text(encoding="utf-8")); assert [x["id"] for x in h] == ["v0", "v9"]   # 旧记录已先移除
        h.append({"id": "v1", "has_footage": True}); hist.write_text(json.dumps(h), encoding="utf-8")
        return out / "v1.mp4"
    monkeypatch.setattr(make, "run", fake_run)
    with pytest.raises(SystemExit):
        refill.refill("v1", root=tmp_path, history_path=hist)          # 没有素材包 → 不动历史
    assert len(json.loads(hist.read_text(encoding="utf-8"))) == 3
    _pack(fx, fdir)
    refill.refill("v1", root=tmp_path, history_path=hist)
    assert calls == [(["auto"], True, ["v0"])]
    assert json.loads(hist.read_text(encoding="utf-8")) == [{"id": "v0"}, {"id": "v1", "has_footage": True}, {"id": "v9"}]

def test_refill_skips_done(tmp_path):
    import refill
    out = tmp_path / "out" / "v2"; out.mkdir(parents=True)
    (out / "publish.json").write_text(json.dumps({"pending_footage": False}), encoding="utf-8")
    with pytest.raises(SystemExit):
        refill.refill("v2", root=tmp_path, history_path=tmp_path / "h.json")
