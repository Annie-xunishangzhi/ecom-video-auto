"""高光片段：从录屏里挑开头钩子（批量处理的快进，成片 2–4 秒）和中段钩子（完成的一刻，3–5 秒）。
有步骤时间时按步骤挑；没有时按帧间变化量找最活跃的两段。两段不重叠。"""
import subprocess
import numpy as np

HOOK_OUT = 3.0      # 开头钩子成片秒数（加速后）
MID_S = 4.0         # 中段钩子原速秒数
MAX_SPEED = 10.0
SHORT_S = 6.0       # 短于这个长度的片子直接对半分

def _seg(start, dur, speed=1.0):
    return {"start": round(max(0.0, start), 2), "dur": round(max(0.1, dur), 2), "speed": round(speed, 2)}

def _hook(ws, we):
    L = we - ws
    if L <= HOOK_OUT + 1: return _seg(ws, L, 1.0)
    speed = min(MAX_SPEED, L / HOOK_OUT)
    dur = min(L, speed * 4.0)
    return _seg(we - dur, dur, speed) if dur < L else _seg(ws, L, speed)

def _split(total):
    h = total / 2
    return {"hook": _seg(0, h), "mid": _seg(h, total - h)}

def _by_activity(act, step_s, total):
    act = np.asarray(act, dtype=float)
    n = max(1, int(round(3.5 / step_s)))
    if len(act) < 2 * n or act.max() <= 0:
        return {"hook": _seg(0, min(HOOK_OUT, total / 2)), "mid": _seg(max(total / 2, total - MID_S), min(MID_S, total / 2))}
    sums = np.convolve(act, np.ones(n), "valid")
    a = int(sums.argmax())
    masked = sums.copy(); masked[max(0, a - n + 1):a + n] = -1
    b = int(masked.argmax())
    first, second = sorted([a, b])
    return {"hook": _seg(first * step_s, n * step_s), "mid": _seg(second * step_s, min(n * step_s, total - second * step_s))}

def choose(steps: list, clip_seconds: float, activity=None, step_s: float = 0.5) -> dict:
    total = float(clip_seconds)
    if total < SHORT_S: return _split(total)
    steps = [s for s in steps or [] if s.get("end", 0) > s.get("start", 0)]
    if not steps:
        return _by_activity(activity or [], step_s, total)
    end = min(total, max(s["end"] for s in steps))
    mid = _seg(end - min(MID_S, end), min(MID_S, end))
    marked = [s for s in steps if s.get("hl") == "hook"]
    if marked: ws, we = min(s["start"] for s in marked), max(s["end"] for s in marked)
    else:
        top = max(steps, key=lambda s: s["end"] - s["start"]); ws, we = top["start"], top["end"]
    we = min(we, mid["start"])
    if we - ws < 1.0:                     # 和中段挤在一起：钩子取中段之前的一段
        ws = max(0.0, mid["start"] - HOOK_OUT); we = mid["start"]
        if we - ws < 1.0: return _split(total)
    return {"hook": _hook(ws, we), "mid": mid}

def activity(clip, step_s: float = 0.5) -> list:
    """每 step_s 秒一个值：相邻两帧的平均像素变化。"""
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(clip), "-vf", f"fps={1 / step_s},scale=64:36,format=gray",
                        "-f", "rawvideo", "-"], capture_output=True)
    a = np.frombuffer(r.stdout, dtype=np.uint8)
    if a.size < 64 * 36 * 2: return []
    f = a[: a.size // (64 * 36) * 64 * 36].reshape(-1, 36, 64).astype(float)
    d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
    return [0.0] + d.tolist()
