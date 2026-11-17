"""网页工具录制：启动本地工具 → Playwright 以 1920×1080 录像 → 按演示清单逐步操作（每步先过安全闸）→ 转成 mp4 → 返回素材包草稿。
任何一步失败都清理输出目录并抛错，不留半截素材。
用法：python pipeline/record_web.py data/demos/s2.json [--allow "按钮文字"] [--headed]"""
import argparse, datetime, json, os, shutil, signal, socket, subprocess, sys, time, urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
from guard import Blocked, check_action

W, H = 1920, 1080

def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0)); return s.getsockname()[1]

def probe_size(clip: Path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", str(clip)],
                       capture_output=True, text=True)
    w, h = r.stdout.strip().split(",")[:2]
    return int(w), int(h)

def _fill(v, subs):
    if isinstance(v, str):
        for k, x in subs.items(): v = v.replace("{" + k + "}", str(x))
    return v

def _start(cmd, cwd):
    if not cmd: return None
    kw = {"creationflags": subprocess.CREATE_NEW_PROCESS_GROUP} if os.name == "nt" else {"start_new_session": True}
    env = {**os.environ, "PYTHONUTF8": "1", "PYTHONIOENCODING": "utf-8"}
    return subprocess.Popen(cmd, cwd=cwd, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, **kw)

def _stop(proc):
    if not proc or proc.poll() is not None: return
    if os.name == "nt":
        subprocess.run(["taskkill", "/T", "/F", "/PID", str(proc.pid)], capture_output=True)
    else:
        try: os.killpg(proc.pid, signal.SIGTERM)
        except OSError: pass
    try: proc.wait(timeout=10)
    except subprocess.TimeoutExpired: proc.kill()

def _wait_url(url, proc, seconds=180):
    end = time.monotonic() + seconds
    while time.monotonic() < end:
        if proc is not None and proc.poll() is not None:
            raise RuntimeError(f"工具启动后就退出了（返回码 {proc.returncode}）")
        try:
            with urllib.request.urlopen(url, timeout=2) as r:
                if r.status < 500: return
        except OSError:
            time.sleep(0.5)
    raise RuntimeError(f"等了 {seconds} 秒，工具页面还是打不开：{url}")

def _do(page, a, base: Path):
    t = a.get("target"); ms = a.get("timeout", 30000)
    kind = a.get("do")
    if kind == "click": page.locator(t).first.click(timeout=ms)
    elif kind == "fill": page.locator(t).first.fill(str(a.get("value", "")), timeout=ms)
    elif kind == "upload": page.locator(t).first.set_input_files(str((base / a["value"]).resolve()), timeout=ms)
    elif kind == "press": page.locator(t).first.press(a.get("value", "Enter"), timeout=ms)
    elif kind == "scroll": page.locator(t).first.scroll_into_view_if_needed(timeout=ms)
    elif kind == "wait":
        if t: page.locator(t).first.wait_for(state="visible", timeout=ms)
        else: page.wait_for_timeout(float(a.get("value", 1)) * 1000)
    else: raise ValueError(f"不认识的动作：{kind}")
    page.wait_for_timeout(int(float(a.get("pause", 0.6)) * 1000))   # 每步之后停一下，录像里看得清

def _measure(demo, steps):
    m = demo.get("measure") or {}
    items = m.get("items")
    seconds = None
    if m.get("seconds"):
        a, b = m["seconds"]
        sa = next((s for s in steps if s["name"] == a), None); sb = next((s for s in steps if s["name"] == b), None)
        if sa and sb: seconds = round(sb["end"] - sa["start"], 2)
    return {"items": int(items) if isinstance(items, (int, float)) else None, "seconds": seconds}

def record_web(demo: dict, out_dir: Path, allow: set = frozenset(), headed: bool = False, base: Path = ROOT) -> dict:
    out_dir = Path(out_dir)
    if out_dir.exists():
        raise FileExistsError(f"输出目录已存在，为免覆盖请换一个：{out_dir}")
    # 先把整份清单过一遍安全闸，危险动作在启动任何东西之前就拦下
    for a in demo.get("actions", []): check_action(a, allow)
    port = free_port(); subs = {"port": port, "python": sys.executable}
    cmd = [_fill(x, subs) for x in demo.get("start") or []]
    url = _fill(demo["url"], subs)
    cwd = (base / demo["cwd"]).resolve() if demo.get("cwd") else None
    out_dir.mkdir(parents=True)
    proc = None
    try:
        from playwright.sync_api import sync_playwright
        proc = _start(cmd, cwd)
        _wait_url(url, proc)
        steps = []
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=not headed)
            vw, vh = demo.get("viewport") or (W, H)   # 视口小于录像尺寸时画面放大，竖屏里看得清
            ctx = browser.new_context(viewport={"width": vw, "height": vh}, record_video_dir=str(out_dir / "_raw"),
                                      record_video_size={"width": W, "height": H}, locale="zh-CN")
            page = ctx.new_page(); t0 = time.monotonic()
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=60000)
                if demo.get("wait_for"): page.locator(demo["wait_for"]).first.wait_for(timeout=60000)
                page.wait_for_timeout(800)
                for a in demo.get("actions", []):
                    check_action(a, allow)
                    s = time.monotonic() - t0
                    _do(page, a, base)
                    steps.append({"name": a.get("name") or a.get("target"), "start": round(s, 2), "end": round(time.monotonic() - t0, 2)})
                page.wait_for_timeout(1500)
            finally:
                video = page.video
                ctx.close(); browser.close()
            raw = Path(video.path())
        stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
        clip = out_dir / f"clip-{stamp}.mp4"
        r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-vf", f"fps=30,scale={W}:{H}", "-c:v", "libx264",
                            "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-an", str(clip)], capture_output=True, text=True)
        if r.returncode != 0: raise RuntimeError("录像转 mp4 失败：" + r.stderr.strip()[-300:])
        shutil.rmtree(out_dir / "_raw", ignore_errors=True)
        return {"step": demo.get("step"), "product": demo.get("product", ""), "recorder": "web", "clip": clip.name,
                "recorded_at": datetime.datetime.now().isoformat(timespec="seconds"), "measured": _measure(demo, steps),
                "steps": steps, "highlights": {}, "masked": False, "review": "pending"}
    except Blocked:
        shutil.rmtree(out_dir, ignore_errors=True); raise
    except Exception as e:
        shutil.rmtree(out_dir, ignore_errors=True)
        raise RuntimeError(f"录制失败，已清理输出目录：{e}") from e
    finally:
        _stop(proc)

def main(argv=None) -> int:
    for s in (sys.stdout, sys.stderr):
        try: s.reconfigure(encoding="utf-8")
        except Exception: pass
    ap = argparse.ArgumentParser(); ap.add_argument("demo"); ap.add_argument("--allow", action="append", default=[])
    ap.add_argument("--headed", action="store_true")
    a = ap.parse_args(argv)
    if a.allow: print("!!!!!!!! 注意：本次放行了以下危险按钮：", "、".join(a.allow), "!!!!!!!!")
    from build_pack import build
    try:
        f = build(json.loads(Path(a.demo).read_text(encoding="utf-8")), set(a.allow), a.headed)
    except (Blocked, RuntimeError, FileExistsError, ValueError) as e:
        print("✗", e); return 1
    print("✓ 素材包：", f); return 0

if __name__ == "__main__":
    sys.exit(main())
