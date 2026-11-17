import json, threading
from http.server import BaseHTTPRequestHandler, HTTPServer
import pytest
import kimi_call as kc

@pytest.fixture
def bridge(tmp_path, monkeypatch):
    seen = []
    class H(BaseHTTPRequestHandler):
        def do_POST(self):
            body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            seen.append(body)
            data = {"success": True}
            if body["action"] == "screenshot":
                p = tmp_path / "shot.png"; p.write_bytes(b"png"); data = {"path": str(p)}
            out = json.dumps({"ok": True, "data": data}).encode()
            self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers(); self.wfile.write(out)
        def log_message(self, *a): pass
    srv = HTTPServer(("127.0.0.1", 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
    monkeypatch.setattr(kc, "BASE", f"http://127.0.0.1:{srv.server_port}")
    monkeypatch.setattr(kc, "BOX", tmp_path / "_kimi"); monkeypatch.setattr(kc, "ROOT", tmp_path)
    yield seen
    srv.shutdown()

def test_direct_mode_without_relay(bridge):
    r = kc.call("click", {"selector": "@e1"}, label="开始整理与检查")
    assert r["ok"] and bridge[-1]["action"] == "click" and bridge[-1]["session"].startswith("ecom-video-")

def test_direct_mode_still_blocks_submit(bridge):
    r = kc.call("click", {"selector": "@e9"}, label="提交并上架")
    assert r.get("blocked") and all(b["action"] != "click" for b in bridge)

def test_nav_buttons_allowed(bridge):
    assert kc.call("click", {"selector": "@e2"}, label="确认发布该类商品")["ok"]

def test_screenshot_and_marks_logged(bridge, tmp_path):
    kc.call("screenshot", {}, mark="批量填写", hl="hook")
    frames = [json.loads(l) for l in (tmp_path / "_kimi" / "frames.jsonl").read_text(encoding="utf-8").splitlines()]
    marks = [json.loads(l) for l in (tmp_path / "_kimi" / "marks.jsonl").read_text(encoding="utf-8").splitlines()]
    assert frames[0]["file"].startswith("_kimi/shots/") and (tmp_path / frames[0]["file"]).is_file()
    assert marks[0]["name"] == "批量填写" and marks[0]["hl"] == "hook"

def test_unreachable_without_relay_says_what_to_do(tmp_path, monkeypatch):
    monkeypatch.setattr(kc, "BASE", "http://127.0.0.1:9"); monkeypatch.setattr(kc, "BOX", tmp_path / "_kimi")
    monkeypatch.setattr(kc, "EXE", tmp_path / "none.exe")
    with pytest.raises(SystemExit) as e:
        kc.call("list_tabs", {})
    assert "自动连接" in str(e.value)
