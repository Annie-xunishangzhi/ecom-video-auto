import socket, sys
import pytest
import record_web
from guard import Blocked

def _port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0)); return s.getsockname()[1]

@pytest.fixture
def demo(fx):
    port = _port()
    return {"type": "web", "step": "s2", "product": "测试页",
            "start": [sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1", "--directory", str(fx / "web")],
            "url": f"http://127.0.0.1:{port}/index.html", "wait_for": "text=使用演示数据",
            "actions": [{"do": "click", "target": "#demo", "name": "使用演示数据"},
                        {"do": "click", "target": "#run", "name": "开始检查"},
                        {"do": "wait", "target": "#result", "name": "结果出现"}],
            "measure": {"items": 10, "seconds": ["开始检查", "结果出现"]}}

def test_records_and_returns_draft(demo, tmp_path):
    out = tmp_path / "rec"
    p = record_web.record_web(demo, out)
    clip = out / p["clip"]
    assert clip.is_file() and clip.suffix == ".mp4"
    assert [s["name"] for s in p["steps"]] == ["使用演示数据", "开始检查", "结果出现"]
    assert all(s["end"] >= s["start"] >= 0 for s in p["steps"])
    assert p["measured"]["items"] == 10
    assert 1.0 <= p["measured"]["seconds"] <= 5
    assert p["review"] == "pending" and p["masked"] is False and p["recorder"] == "web"
    assert record_web.probe_size(clip) == (1920, 1080)

def test_dangerous_button_blocked_and_cleaned(demo, tmp_path):
    demo["actions"].insert(1, {"do": "click", "target": "#pub", "name": "确认发布商品"})
    out = tmp_path / "rec"
    with pytest.raises(Blocked):
        record_web.record_web(demo, out)
    assert not out.exists()

def test_failure_midway_leaves_nothing(demo, tmp_path):
    demo["actions"].append({"do": "wait", "target": "#never", "name": "不会出现", "timeout": 500})
    out = tmp_path / "rec"
    with pytest.raises(RuntimeError):
        record_web.record_web(demo, out)
    assert not out.exists()

def test_existing_out_dir_refused(demo, tmp_path):
    out = tmp_path / "rec"; out.mkdir(); (out / "keep.txt").write_text("x")
    with pytest.raises(FileExistsError):
        record_web.record_web(demo, out)
    assert (out / "keep.txt").exists()

def test_build_pack_end_to_end(demo, tmp_path, monkeypatch):
    import build_pack, pack
    monkeypatch.setattr(pack, "FOOTAGE", tmp_path)
    f = build_pack.build(demo)
    p = pack.load_pack("s2", allow_pending=True)
    assert f.is_file() and p["review"] == "pending"            # 没有打码规则 → 待人工确认
    assert (tmp_path / "s2" / p["clip"]).is_file()
    assert set(p["highlights"]) == {"hook", "mid"}
    assert [x.name for x in (tmp_path / "s2").iterdir() if x.name.startswith("_rec")] == []

def test_build_pack_failure_leaves_nothing(demo, tmp_path, monkeypatch):
    import build_pack, pack
    monkeypatch.setattr(pack, "FOOTAGE", tmp_path)
    demo["actions"].append({"do": "wait", "target": "#never", "name": "不会出现", "timeout": 500})
    with pytest.raises(RuntimeError):
        build_pack.build(demo)
    assert not (tmp_path / "s2" / "pack.json").exists()
    assert list((tmp_path / "s2").glob("*.mp4")) == [] and list((tmp_path / "s2").glob("_rec*")) == []
