"""agent 一侧：通过 out/_kimi/ 文件中转调用 Kimi 浏览器扩展（需要 Kimi中转.cmd 在本机运行）。
用法：python tools/kimi_call.py <action> ['<args JSON>'] [--label 按钮文字] [--mark 步骤名 [--hl hook]] [--timeout 秒]
只打印结果 JSON。"""
import argparse, json, sys, time, uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOX = ROOT / "out" / "_kimi"

def call(action, args=None, label=None, mark=None, hl=None, timeout=90, wait=None):
    alive = BOX / "alive"
    if not alive.is_file() or time.time() - json.loads(alive.read_text(encoding="utf-8"))["t"] > 15:
        raise SystemExit("✗ Kimi 中转没有在运行（先在本机双击 Kimi中转.cmd）")
    rid = time.strftime("%H%M%S-") + uuid.uuid4().hex[:6]
    req = {"id": rid, "action": action, "args": args or {}, "timeout": timeout}
    if label: req["label"] = label
    if mark: req["mark"] = mark
    if hl: req["hl"] = hl
    tmp = BOX / "req" / f"{rid}.json.tmp"
    tmp.write_text(json.dumps(req, ensure_ascii=False), encoding="utf-8"); tmp.rename(BOX / "req" / f"{rid}.json")
    resp = BOX / "resp" / f"{rid}.json"
    end = time.time() + (wait or timeout + 20)
    while time.time() < end:
        if resp.is_file():
            try: return json.loads(resp.read_text(encoding="utf-8"))
            except ValueError: pass
        time.sleep(0.3)
    raise SystemExit(f"✗ 等不到结果（{rid}），结果未知：先读页面再决定")

if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("action"); ap.add_argument("args", nargs="?", default="{}")
    ap.add_argument("--label"); ap.add_argument("--mark"); ap.add_argument("--hl"); ap.add_argument("--timeout", type=int, default=90)
    a = ap.parse_args()
    print(json.dumps(call(a.action, json.loads(a.args), a.label, a.mark, a.hl, a.timeout), ensure_ascii=False))
