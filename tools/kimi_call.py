"""agent 调用 Kimi 浏览器扩展（Kimi WebBridge）操作用户已登录的浏览器。
- agent 在用户电脑上运行时（Claude Code、Codex 等）：直接连本机 WebBridge，没启动就自动 start，不需要用户点任何东西。
- 连不上本机时（例如云端会话）：退回文件中转，需要本机运行 tools/cmd/Kimi中转.cmd。
每次点击、按键都先过安全闸（tools/kimi_relay.py 的 vet）：提交、发布、确认、付款等按钮一律拦下。
截图自动存到 out/_kimi/shots/ 并记进 out/_kimi/frames.jsonl；--mark 记步骤到 out/_kimi/marks.jsonl。
之后用 python pipeline/frames_pack.py --step s<步骤> 生成素材包。
用法：python tools/kimi_call.py <action> ['<args JSON>'] [--label 按钮文字] [--mark 步骤名 [--hl hook]] [--timeout 秒] [--allow 按钮文字]"""
import argparse, json, os, shutil, subprocess, sys, time, uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools")); sys.path.insert(0, str(ROOT / "pipeline"))
from kimi_relay import NAV, post, vet
from guard import Blocked

BOX = ROOT / "out" / "_kimi"
BASE = os.environ.get("KIMI_BRIDGE", "http://127.0.0.1:10086")
EXE = Path(os.environ.get("USERPROFILE", str(Path.home()))) / ".kimi-webbridge" / "bin" / ("kimi-webbridge.exe" if os.name == "nt" else "kimi-webbridge")

def _session() -> str:
    f = BOX / "session.txt"; BOX.mkdir(parents=True, exist_ok=True)
    if not f.is_file(): f.write_text("ecom-video-" + uuid.uuid4().hex[:12], encoding="utf-8")
    return f.read_text(encoding="utf-8").strip()

def _reachable() -> bool:
    r = post(BASE, {"action": "list_tabs", "args": {}, "session": _session()}, 5)
    return not (r.get("error") or {}).get("code") == "transport"

def ensure_bridge() -> bool:
    """本机 WebBridge 能连上就用；没启动且装了就自动 start。"""
    if _reachable(): return True
    if EXE.is_file():
        subprocess.run([str(EXE), "start"], capture_output=True, timeout=60)
        for _ in range(20):
            if _reachable(): return True
            time.sleep(0.5)
    return False

def _via_relay(req: dict, timeout: int) -> dict:
    alive = BOX / "alive"
    if not alive.is_file() or time.time() - json.loads(alive.read_text(encoding="utf-8"))["t"] > 15:
        raise SystemExit("✗ 连不上本机 Kimi WebBridge，文件中转也没在运行。"
                         "agent 在本机运行时会自动连接；远程会话请先在本机运行 tools/cmd/Kimi中转.cmd")
    rid = req["id"]; (BOX / "req").mkdir(parents=True, exist_ok=True)
    tmp = BOX / "req" / f"{rid}.json.tmp"
    tmp.write_text(json.dumps(req, ensure_ascii=False), encoding="utf-8"); tmp.rename(BOX / "req" / f"{rid}.json")
    resp = BOX / "resp" / f"{rid}.json"; end = time.time() + timeout + 20
    while time.time() < end:
        if resp.is_file():
            try: return json.loads(resp.read_text(encoding="utf-8"))
            except ValueError: pass
        time.sleep(0.3)
    raise SystemExit(f"✗ 等不到结果（{rid}），结果未知：先读页面再决定")

def _log(name: str, rec: dict) -> None:
    BOX.mkdir(parents=True, exist_ok=True)
    with open(BOX / name, "a", encoding="utf-8") as f: f.write(json.dumps(rec, ensure_ascii=False) + "\n")

def call(action, args=None, label=None, mark=None, hl=None, timeout=90, allow=(), direct=None):
    rid = time.strftime("%H%M%S-") + uuid.uuid4().hex[:6]
    req = {"id": rid, "action": action, "args": args or {}, "timeout": timeout}
    if label: req["label"] = label
    if mark: _log("marks.jsonl", {"name": mark, "at": time.time(), **({"hl": hl} if hl else {})})
    if direct is None: direct = ensure_bridge()
    if direct:
        try:
            vet(req, set(NAV) | set(allow))
        except Blocked as e:
            return {"ok": False, "blocked": True, "error": {"code": "blocked", "message": str(e)}}
        out = post(BASE, {"action": action, "args": args or {}, "session": _session()}, timeout)
        path = (out.get("data") or {}).get("path") if isinstance(out.get("data"), dict) else None
        if action == "screenshot" and path and Path(path).is_file():
            (BOX / "shots").mkdir(parents=True, exist_ok=True)
            dst = BOX / "shots" / f"{rid}{Path(path).suffix or '.png'}"; shutil.copyfile(path, dst)
            out["copied"] = str(dst.relative_to(ROOT))
    else:
        out = _via_relay(req, timeout)
    if action == "screenshot" and out.get("copied"):
        _log("frames.jsonl", {"file": out["copied"].replace("\\", "/"), "at": time.time()})
    return out

if __name__ == "__main__":
    for s in (sys.stdout, sys.stderr):
        try: s.reconfigure(encoding="utf-8")
        except Exception: pass
    ap = argparse.ArgumentParser(); ap.add_argument("action"); ap.add_argument("args", nargs="?", default="{}")
    ap.add_argument("--label"); ap.add_argument("--mark"); ap.add_argument("--hl"); ap.add_argument("--timeout", type=int, default=90)
    ap.add_argument("--allow", action="append", default=[])
    a = ap.parse_args()
    print(json.dumps(call(a.action, json.loads(a.args), a.label, a.mark, a.hl, a.timeout, a.allow), ensure_ascii=False))
