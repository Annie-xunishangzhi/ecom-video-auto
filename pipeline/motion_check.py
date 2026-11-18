"""静止检测：成片里不能有\"画面停住\"的段落。

按帧比较相邻两帧（缩小成灰度后的平均像素差），差值低于阈值的帧算\"静止\"。
- 任意一段连续静止 ≥ MAX_RUN 秒 → 不合格
- 整片静止比例 ≥ MAX_RATIO → 不合格
- 任意 EVENT_GAP 秒内没有一次明显的新动作（帧差 ≥ EVENT）→ 不合格

用法：python pipeline/motion_check.py 成片.mp4 [--json 报告.json]
退出码：0 合格，1 不合格。
"""
import argparse, json, subprocess, sys
from pathlib import Path
import numpy as np

W, H = 180, 320          # 缩小后比较：对字幕和大块运动敏感，对编码噪点不敏感
THRESHOLD = 0.15         # 平均像素差（0–255）低于它算静止。旧引擎成片：34% 的帧完全不变，其余多半只有角落里企鹅呼吸（≈0.1–0.2），都算静止
MAX_RUN = 0.8            # 连续静止上限（秒）
MAX_RATIO = 0.05         # 整片静止比例上限
EVENT = 1.5              # "新动作"：一帧的平均像素差达到它（元素入场、镜头推移、转场、数字跳动）
EVENT_GAP = 2.0          # 任意这么长的时间里至少要有一次新动作


def frame_diffs(video: Path) -> tuple[np.ndarray, float]:
    """返回相邻帧差序列和帧率"""
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
                            "-of", "csv=p=0", str(video)], capture_output=True, text=True, check=True).stdout.strip().strip(",").splitlines()[0].strip(",")
    a, b = probe.split("/") if "/" in probe else (probe, "1")
    fps = float(a) / float(b)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-vf", f"scale={W}:{H},format=gray",
                          "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    f = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
    if len(f) < 2:
        return np.zeros(0), fps
    return np.abs(np.diff(f, axis=0)).mean(axis=(1, 2)), fps


def analyze(diffs: np.ndarray, fps: float, threshold: float = THRESHOLD, max_run: float = MAX_RUN,
            max_ratio: float = MAX_RATIO, event: float = EVENT, event_gap: float = EVENT_GAP) -> dict:
    still = diffs < threshold
    runs, i, n = [], 0, len(still)
    while i < n:
        if still[i]:
            j = i
            while j < n and still[j]: j += 1
            dur = (j - i) / fps
            if dur >= max_run:
                runs.append({"start": round((i + 1) / fps, 2), "end": round((j + 1) / fps, 2), "seconds": round(dur, 2)})
            i = j
        else:
            i += 1
    ratio = float(still.mean()) if n else 0.0
    gaps, last = [], 0
    hits = np.flatnonzero(diffs >= event).tolist() + [n]
    for h in hits:
        if (h - last) / fps > event_gap:
            gaps.append({"start": round(last / fps, 2), "end": round(h / fps, 2), "seconds": round((h - last) / fps, 2)})
        last = h
    problems = []
    if runs:
        problems.append(f"有 {len(runs)} 段画面连续静止 ≥ {max_run} 秒：" +
                        "、".join(f"{r['start']}–{r['end']} 秒" for r in runs[:8]) + ("…" if len(runs) > 8 else ""))
    if gaps:
        problems.append(f"有 {len(gaps)} 段超过 {event_gap} 秒没有新动作：" +
                        "、".join(f"{g['start']}–{g['end']} 秒" for g in gaps[:8]) + ("…" if len(gaps) > 8 else ""))
    if ratio >= max_ratio:
        problems.append(f"整片静止比例 {ratio:.1%}，要求低于 {max_ratio:.0%}")
    return {"frames": n + 1, "fps": fps, "still_ratio": round(ratio, 4), "still_runs": runs, "event_gaps": gaps,
            "threshold": threshold, "ok": not problems, "problems": problems}


def check(video: Path, **kw) -> dict:
    d, fps = frame_diffs(Path(video))
    return analyze(d, fps, **kw)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("video"); ap.add_argument("--json")
    a = ap.parse_args(argv)
    r = check(Path(a.video))
    if a.json: Path(a.json).write_text(json.dumps(r, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"静止比例 {r['still_ratio']:.1%}，连续静止 ≥{MAX_RUN} 秒的段落 {len(r['still_runs'])} 段")
    for p in r["problems"]: print("  ✗ " + p)
    if r["ok"]: print("  ✓ 画面运动检查通过")
    return 0 if r["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
