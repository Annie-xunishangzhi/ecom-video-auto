"""Kimi 浏览器扩展中转（在用户 Windows 本机运行，只用标准库）。
agent 的命令行连不到本机的 127.0.0.1，所以用文件中转：agent 往 out/_kimi/req/ 写请求，
本程序转发给本机 Kimi WebBridge（默认 http://127.0.0.1:10086/command），把结果写到 out/_kimi/resp/。
安全：点击、按键必须带 label（要点的按钮上的文字），过安全闸（pipeline/guard.py），提交、发布、确认等一律拦下；
evaluate 只允许只读脚本。放行只能来自启动参数 --allow "按钮文字"。
启动：双击 Kimi中转.cmd；停止：在 out/_kimi/ 里放一个名为 stop 的文件，或关掉窗口。"""
import argparse, json, os, re, shutil, sys, time, urllib.request, uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "pipeline"))
from guard import Blocked, check_action, is_dangerous

BOX = ROOT / "out" / "_kimi"
TRIGGER = {"click": "click", "mouse_click": "click", "send_keys": "press"}
WRITE_JS = re.compile(r"\.click\s*\(|\.submit\s*\(|dispatchEvent|fetch\s*\(|XMLHttpRequest|sendBeacon|\.value\s*=|innerHTML\s*=|location\s*=|\.remove\s*\(", re.I)
NAV = ["发布新商品", "确认发布该类商品"]   # 只是打开发布表单的按钮，不提交任何内容
ALLOWED = {"list_browser_tabs", "attach_tab", "navigate", "snapshot", "find", "read_page", "fill", "click", "mouse_click",
           "upload", "wait", "send_keys", "evaluate", "screenshot", "list_tabs"}

def vet(req: dict, allow: set) -> None:
    """不安全就抛 Blocked。"""
    a = req.get("action")
    if a not in ALLOWED: raise Blocked(f"中转不允许动作 {a}")
    if a == "navigate":
        url = str((req.get("args") or {}).get("url", ""))
        if not url.startswith("https://mms.pinduoduo.com/"): raise Blocked(f"只允许打开拼多多商家后台页面：{url}")
    if a in TRIGGER:
        label = (req.get("label") or "").strip()
        if not label: raise Blocked("点击和按键必须写明 label（按钮或字段上的文字）")
        keys = str((req.get("args") or {}).get("keys", ""))
        name = label + (" Enter" if a == "send_keys" and "enter" in keys.lower() else "")
        check_action({"do": TRIGGER[a], "name": label, "target": label}, allow)
        if a == "send_keys" and "enter" in keys.lower() and is_dangerous(name) and label not in allow:
            raise Blocked(f"拦住了在「{label}」上按回车")
    if a == "evaluate" and WRITE_JS.search(str((req.get("args") or {}).get("code", ""))):
        raise Blocked("evaluate 只能读页面，不能点击、提交或改值")

def post(base: str, body: dict, timeout: int) -> dict:
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    data = json.dumps(body, ensure_ascii=False).encode("utf-8")
    r = urllib.request.Request(base.rstrip("/") + "/command", data=data, headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with opener.open(r, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try: return json.loads(e.read().decode("utf-8"))
        except Exception: return {"ok": False, "error": {"code": f"http_{e.code}", "message": str(e)}}
    except Exception as e:
        return {"ok": False, "error": {"code": "transport", "message": f"{type(e).__name__}: {e}（结果未知，先读页面再决定）"}}

def handle(f: Path, base: str, session: str, allow: set) -> None:
    try: req = json.loads(f.read_text(encoding="utf-8"))
    except (OSError, ValueError): return
    rid = req.get("id") or f.stem
    try:
        vet(req, allow)
        out = post(base, {"action": req["action"], "args": req.get("args") or {}, "session": session}, int(req.get("timeout", 90)))
        path = (out.get("data") or {}).get("path") if isinstance(out.get("data"), dict) else None
        if req["action"] == "screenshot" and path and Path(path).is_file():
            (BOX / "shots").mkdir(parents=True, exist_ok=True)
            dst = BOX / "shots" / f"{rid}{Path(path).suffix or '.png'}"; shutil.copyfile(path, dst); out["copied"] = str(dst.relative_to(ROOT))
    except Blocked as e:
        out = {"ok": False, "blocked": True, "error": {"code": "blocked", "message": str(e)}}
    if req.get("mark"):
        with open(BOX.parent / "_rec" / "current.marks.jsonl", "a", encoding="utf-8") as m:
            m.write(json.dumps({"name": req["mark"], "at": time.time(), **({"hl": req["hl"]} if req.get("hl") else {})}, ensure_ascii=False) + "\n")
    tmp = BOX / "resp" / f"{rid}.json.tmp"
    tmp.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8"); tmp.replace(BOX / "resp" / f"{rid}.json")
    f.unlink()

def main(argv=None) -> int:
    for s in (sys.stdout, sys.stderr):
        try: s.reconfigure(encoding="utf-8")
        except Exception: pass
    ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://127.0.0.1:10086"); ap.add_argument("--allow", action="append", default=[])
    ap.add_argument("--nav-allow", action="store_true", help="放行两个只是进入发布页的导航按钮：" + "、".join(NAV))
    a = ap.parse_args(argv)
    if a.nav_allow: a.allow += NAV
    for d in ("req", "resp", "shots"): (BOX / d).mkdir(parents=True, exist_ok=True)
    (BOX.parent / "_rec").mkdir(parents=True, exist_ok=True)
    stop = BOX / "stop"
    if stop.exists(): stop.unlink()
    session = "ecom-video-" + uuid.uuid4().hex[:12]
    if a.allow: print("!!!!!!!! 本次放行：", "、".join(a.allow), "!!!!!!!!")
    print(f"Kimi 中转已启动（{a.base}，session {session}）。关闭本窗口即停止。", flush=True)
    while not stop.exists():
        (BOX / "alive").write_text(json.dumps({"t": time.time(), "base": a.base, "session": session, "pid": os.getpid()}), encoding="utf-8")
        for f in sorted((BOX / "req").glob("*.json")):
            print("→", f.stem, flush=True); handle(f, a.base, session, set(a.allow))
        time.sleep(0.3)
    stop.unlink(); (BOX / "alive").unlink(missing_ok=True)
    print("已停止"); return 0

if __name__ == "__main__":
    sys.exit(main())
