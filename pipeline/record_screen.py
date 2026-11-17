"""屏幕录制（供 agent 在用户真实浏览器里执行 skill 时用）。只支持 Windows（ffmpeg gdigrab）。
三个命令分别由 录屏开始.cmd / 录屏标记.cmd / 录屏结束.cmd 调用：
  python pipeline/record_screen.py start --step s4 --product 拼多多上架 [--title 窗口标题]   （一直运行到收到结束信号）
  python pipeline/record_screen.py mark 批量填写 [--hl hook]
  python pipeline/record_screen.py stop        （结束录屏，生成待人工确认的素材包）
录屏中途失败或被中断：不生成素材包，删除半截录像。"""
import argparse, datetime, json, os, subprocess, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
REC = ROOT / "out" / "_rec"
STATE = REC / "current.rec.json"

class NotSupported(Exception):
    pass

def ffmpeg_args(out: Path, title) -> list:
    src = f"title={title}" if title else "desktop"
    return ["ffmpeg", "-y", "-f", "gdigrab", "-framerate", "30", "-draw_mouse", "1", "-i", src,
            "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23",
            "-pix_fmt", "yuv420p", str(out)]

def _marks(state: Path) -> Path:
    return state.with_name(state.name.replace(".rec.json", ".marks.jsonl"))

def mark(state: Path, name: str, hl: str = None) -> None:
    st = json.loads(Path(state).read_text(encoding="utf-8"))
    rec = {"name": name, "t": round(time.time() - st["t0"], 2)}
    if hl: rec["hl"] = hl
    with open(_marks(Path(state)), "a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")

def steps_from_marks(marks: Path, total: float, t0: float = None) -> list:
    """标记文件每行一条：{"name","t"}（相对录屏开始的秒数）或 {"name","at"}（Unix 时间戳，agent 可直接写文件追加）。"""
    try: rows = [json.loads(l) for l in Path(marks).read_text(encoding="utf-8").splitlines() if l.strip()]
    except OSError: return []
    for r in rows:
        if "t" not in r and "at" in r and t0 is not None: r["t"] = round(r["at"] - t0, 2)
    rows = sorted([r for r in rows if "t" in r and 0 <= r["t"] <= total], key=lambda r: r["t"])
    out = []
    for i, r in enumerate(rows):
        end = rows[i + 1]["t"] if i + 1 < len(rows) else total
        s = {"name": r["name"], "start": r["t"], "end": round(max(end, r["t"]), 2)}
        if r.get("hl"): s["hl"] = r["hl"]
        out.append(s)
    return out

def start(out: Path, title, step: str, product: str, state: Path = STATE, mask=None) -> None:
    if os.name != "nt":
        raise NotSupported("屏幕录制目前只支持 Windows（ffmpeg gdigrab）。其他系统请改用 record_web.py 录网页工具。")
    state = Path(state); state.parent.mkdir(parents=True, exist_ok=True)
    if state.exists(): raise RuntimeError("已经有一个录屏在进行中；先运行 录屏结束.cmd")
    out = Path(out)
    for f in (_marks(state), state.with_suffix(".stop")):
        if f.exists(): f.unlink()
    p = subprocess.Popen(ffmpeg_args(out, title), stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    state.write_text(json.dumps({"out": str(out), "t0": time.time(), "pid": p.pid, "step": step, "product": product,
                                 "title": title, "mask": mask or []}, ensure_ascii=False), encoding="utf-8")
    stop_flag = state.with_suffix(".stop")
    try:
        while p.poll() is None and not stop_flag.exists():
            time.sleep(0.3)
        if p.poll() is None:
            p.stdin.write(b"q"); p.stdin.flush(); p.wait(timeout=30)
        ok = p.returncode == 0 and out.is_file() and out.stat().st_size > 0
    except BaseException:
        p.kill(); ok = False
    st = json.loads(state.read_text(encoding="utf-8")); st["done"] = True; st["ok"] = ok
    state.write_text(json.dumps(st, ensure_ascii=False), encoding="utf-8")

def stop(state: Path = STATE, wait_s: float = 60) -> Path:
    """发出结束信号，等录像收尾，然后生成素材包（review 一律 pending，人工看过再 approve）。"""
    state = Path(state)
    if not state.exists(): raise RuntimeError("没有正在进行的录屏")
    state.with_suffix(".stop").write_text("stop", encoding="utf-8")
    end = time.time() + wait_s
    st = {}
    while time.time() < end:
        st = json.loads(state.read_text(encoding="utf-8"))
        if st.get("done"): break
        time.sleep(0.5)
    out = Path(st["out"]); marks = _marks(state)
    try:
        if not st.get("ok"):
            raise RuntimeError("录屏没有正常结束（中途失败或被中断），不生成素材包")
        from build_pack import _secs, finish
        total = _secs(out)
        draft = {"step": st["step"], "product": st.get("product", ""), "recorder": "screen", "clip": out.name,
                 "recorded_at": datetime.datetime.fromtimestamp(st["t0"]).isoformat(timespec="seconds"),
                 "measured": {"items": None, "seconds": None}, "steps": steps_from_marks(marks, total, st["t0"]),
                 "highlights": {}, "masked": False, "review": "pending"}
        return finish(draft, out, st.get("mask") or [], force_pending=True)
    finally:
        for f in (out, marks, state, state.with_suffix(".stop")):
            try: f.unlink()
            except OSError: pass

def main(argv=None) -> int:
    for s in (sys.stdout, sys.stderr):
        try: s.reconfigure(encoding="utf-8")
        except Exception: pass
    ap = argparse.ArgumentParser(); sub = ap.add_subparsers(dest="cmd", required=True)
    a1 = sub.add_parser("start"); a1.add_argument("--step"); a1.add_argument("--product", default=""); a1.add_argument("--title")
    a1.add_argument("--mask", help='打码区域 JSON，例如 [{"x":0,"y":0,"w":0.3,"h":0.08}]')
    a1.add_argument("--config", help="从 JSON 文件读 step/product/title/mask（供双击 .cmd 用）")
    a2 = sub.add_parser("mark"); a2.add_argument("name"); a2.add_argument("--hl", choices=["hook", "mid"])
    sub.add_parser("stop")
    a = ap.parse_args(argv)
    try:
        if a.cmd == "start":
            if a.config:
                c = json.loads(Path(a.config).read_text(encoding="utf-8"))
                a.step, a.product, a.title, a.mask = c["step"], c.get("product", ""), c.get("title"), json.dumps(c.get("mask") or [])
            if not a.step: raise ValueError("缺少 --step")
            out = REC / f"screen-{datetime.datetime.now():%Y%m%d-%H%M%S}.mp4"
            print("● 录屏中……运行 录屏结束.cmd 结束。"); start(out, a.title, a.step, a.product, mask=json.loads(a.mask) if a.mask else None)
        elif a.cmd == "mark": mark(STATE, a.name, a.hl); print("✓ 已标记：", a.name)
        else: print("✓ 素材包（待人工确认）：", stop())
    except (NotSupported, RuntimeError, OSError, ValueError) as e:
        print("✗", e); return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
