"""把通过 Kimi 浏览器扩展逐步截下的页面截图拼成录像，生成素材包（录真实后台时用）。
截图只含网页本身，不会录到桌面上的其他窗口。每张截图一直显示到下一张截图的时刻，时间轴和真实操作一致。
用法：python pipeline/frames_pack.py --step s4 --product 拼多多上架 --frames out/_kimi/frames.jsonl --marks out/_kimi/marks.jsonl
      [--mask '[{"x":0.85,"y":0,"w":0.13,"h":0.06}]']
生成的素材包一律待人工确认（真实后台）。"""
import argparse, datetime, json, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))

def read_jsonl(f) -> list:
    try: return [json.loads(l) for l in Path(f).read_text(encoding="utf-8").splitlines() if l.strip()]
    except OSError: return []

def concat_list(frames: list, root: Path, tail: float = 2.0) -> str:
    """ffmpeg concat 清单：每张图显示到下一张的时刻，最后一张多停 tail 秒。"""
    fr = sorted(frames, key=lambda x: x["at"])
    lines = []
    for i, f in enumerate(fr):
        dur = (fr[i + 1]["at"] - f["at"]) if i + 1 < len(fr) else tail
        p = (Path(root) / f["file"].replace("\\", "/")).resolve()
        lines += [f"file '{p.as_posix()}'", f"duration {max(dur, 0.05):.3f}"]
    if fr: lines.append(f"file '{(Path(root) / fr[-1]['file'].replace(chr(92), '/')).resolve().as_posix()}'")
    return "\n".join(lines) + "\n"

def concat_secs(frames: list, tail: float = 2.0) -> float:
    """concat_list 里各段时长之和。"""
    ats = sorted(f["at"] for f in frames)
    return sum(max(b - a, 0.05) for a, b in zip(ats, ats[1:])) + tail

def steps_from(marks: list, t0: float, total: float) -> list:
    ms = sorted(marks, key=lambda m: m["at"]); out = []
    for i, m in enumerate(ms):
        s = max(0.0, m["at"] - t0); e = (ms[i + 1]["at"] - t0) if i + 1 < len(ms) else total
        st = {"name": m["name"], "start": round(s, 2), "end": round(min(max(e, s), total), 2)}
        if m.get("hl"): st["hl"] = m["hl"]
        out.append(st)
    return out

def build(step, product, frames_f, marks_f, rects, root: Path = ROOT) -> Path:
    from build_pack import _secs, finish
    frames = read_jsonl(frames_f)
    if len(frames) < 2: raise RuntimeError("截图少于 2 张，不能生成录像")
    t0 = min(f["at"] for f in frames)
    with tempfile.TemporaryDirectory() as d:
        lst = Path(d) / "list.txt"; lst.write_text(concat_list(frames, root), encoding="utf-8")
        raw = Path(d) / f"kimi-{datetime.datetime.now():%Y%m%d-%H%M%S}.mp4"
        r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
                            "-vf", "scale=1920:-2:flags=lanczos,fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                            "-t", f"{concat_secs(frames):.3f}", str(raw)],   # 新版 ffmpeg 会让末尾重复的那张再多停一段，按清单总长截断
                           capture_output=True, text=True)
        if r.returncode: raise RuntimeError("截图拼接失败：" + r.stderr[-300:])
        total = _secs(raw)
        draft = {"step": step, "product": product, "recorder": "kimi-frames", "clip": raw.name,
                 "recorded_at": datetime.datetime.fromtimestamp(t0).isoformat(timespec="seconds"),
                 "measured": {"items": None, "seconds": None}, "steps": steps_from(read_jsonl(marks_f), t0, total),
                 "highlights": {}, "masked": False, "review": "pending"}
        return finish(draft, raw, rects, force_pending=True)

if __name__ == "__main__":
    for s in (sys.stdout, sys.stderr):
        try: s.reconfigure(encoding="utf-8")
        except Exception: pass
    ap = argparse.ArgumentParser(); ap.add_argument("--step", required=True); ap.add_argument("--product", default="")
    ap.add_argument("--frames", default="out/_kimi/frames.jsonl"); ap.add_argument("--marks", default="out/_kimi/marks.jsonl"); ap.add_argument("--mask", default="[]")
    a = ap.parse_args()
    print("✓ 素材包（待人工确认）：", build(a.step, a.product, a.frames, a.marks, json.loads(a.mask)))
