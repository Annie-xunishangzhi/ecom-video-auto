import json
import pytest
import pack

def _pack(step="s2", **kw):
    p = {"step": step, "product": "商品资料检查", "recorder": "web", "clip": "clip.mp4",
         "recorded_at": "2026-11-17T10:00:00", "measured": {"items": 120, "seconds": 8.5},
         "steps": [{"name": "开始检查", "start": 1.0, "end": 9.5}],
         "highlights": {"hook": {"start": 1.0, "dur": 8.0, "speed": 3.0}, "mid": {"start": 6.0, "dur": 3.5, "speed": 1.0}},
         "masked": True, "review": "ok"}
    p.update(kw); return p

@pytest.fixture
def fdir(tmp_path, monkeypatch):
    monkeypatch.setattr(pack, "FOOTAGE", tmp_path)
    return tmp_path

def test_missing_returns_none(fdir):
    assert pack.load_pack("s2") is None

def test_corrupt_returns_none(fdir):
    (fdir / "s2").mkdir(); (fdir / "s2" / "pack.json").write_text("{坏", encoding="utf-8")
    assert pack.load_pack("s2") is None

def test_missing_fields_returns_none(fdir):
    (fdir / "s2").mkdir(); (fdir / "s2" / "pack.json").write_text(json.dumps({"step": "s2"}), encoding="utf-8")
    assert pack.load_pack("s2") is None

def test_pending_returns_none(fdir):
    pack.save_pack(_pack(review="pending"))
    assert pack.load_pack("s2") is None
    assert pack.load_pack("s2", allow_pending=True)["review"] == "pending"

def test_ok_roundtrip(fdir):
    pack.save_pack(_pack())
    p = pack.load_pack("s2")
    assert p["measured"]["items"] == 120 and p["dir"] == str(fdir / "s2")

def test_save_archives_old(fdir):
    pack.save_pack(_pack(clip="old.mp4"))
    pack.save_pack(_pack(clip="new.mp4"))
    old = list((fdir / "s2").glob("pack.*.json"))
    assert len(old) == 1 and json.loads(old[0].read_text(encoding="utf-8"))["clip"] == "old.mp4"
    assert pack.load_pack("s2")["clip"] == "new.mp4"

def test_save_rejects_bad_review(fdir):
    with pytest.raises(ValueError):
        pack.save_pack(_pack(review="maybe"))

def test_approve_in_place(fdir):
    pack.save_pack(_pack(review="pending"))
    pack.approve("s2")
    assert pack.load_pack("s2")["review"] == "ok"
    assert not list((fdir / "s2").glob("pack.*.json"))    # 改状态不算重录，不归档
