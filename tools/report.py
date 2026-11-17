"""数据反馈：读用户手填的 data/metrics.csv，按结构、钩子写法、主题、话题标签统计平均表现。
每条视频一行：编号,播放,完播率,点赞,收藏,涨粉（完播率可写 35% 或 0.35）。样本不足 3 条的不下结论。
用法：python tools/report.py"""
import csv, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COLS = ["编号", "播放", "完播率", "点赞", "收藏", "涨粉"]
NUM = COLS[1:]
MIN_N = 3
FIELDS = ["structure", "mid_hook", "theme", "tags"]
NAMES = {"structure": "剧本结构", "mid_hook": "中段钩子", "theme": "主题", "tags": "话题标签"}

def _num(col, s):
    t = str(s).strip().replace(",", "").replace("，", "")
    if col == "完播率" and t.endswith("%"): return float(t[:-1]) / 100
    v = float(t)
    return v if col == "完播率" else int(v) if v.is_integer() else v

def load_metrics(path) -> dict:
    """返回 {编号: {播放, 完播率, 点赞, 收藏, 涨粉}}；缺列或有非数字时抛 ValueError，指出哪几行。"""
    with open(path, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.reader(f, skipinitialspace=True))
    if not rows: raise ValueError("metrics.csv 是空的，第一行应为表头：" + ",".join(COLS))
    head = [h.strip() for h in rows[0]]
    miss = [c for c in COLS if c not in head]
    if miss: raise ValueError("metrics.csv 缺少列：" + "、".join(miss))
    idx = {c: head.index(c) for c in COLS}
    out, bad = {}, []
    for n, r in enumerate(rows[1:], start=2):
        if not any(x.strip() for x in r): continue
        try:
            vid = r[idx["编号"]].strip()
            if not vid: raise ValueError
            out[vid] = {c: _num(c, r[idx[c]]) for c in NUM}
        except (ValueError, IndexError):
            bad.append(f"第 {n} 行")
    if bad: raise ValueError("metrics.csv 这些行有空格子或不是数字：" + "、".join(bad))
    return out

def score_by(field: str, metrics: dict, history: list, scripts: dict = None) -> dict:
    groups = {}
    for h in history:
        m = metrics.get(h.get("id"))
        if not m: continue
        vals = (scripts or {}).get(h["id"], {}).get("tags") or [] if field == "tags" else [h.get(field)]
        for v in vals:
            if v: groups.setdefault(v, []).append(m)
    return {v: {"n": len(ms), "enough": len(ms) >= MIN_N, **{c: sum(x[c] for x in ms) / len(ms) for c in NUM}}
            for v, ms in groups.items()}

def _key(s): return (s["涨粉"] / max(s["播放"], 1) * 1000, s["完播率"], s["播放"])

def recommend(field: str, metrics: dict, history: list, exclude: set = frozenset(), scripts: dict = None) -> list:
    """样本够的取值按表现排序（千次播放涨粉、完播率、播放），去掉 exclude（近 N 条用过的）。"""
    s = score_by(field, metrics, history, scripts)
    return [v for v, x in sorted(s.items(), key=lambda kv: _key(kv[1]), reverse=True) if x["enough"] and v not in exclude]

def _scripts(history):
    out = {}
    for h in history:
        try: out[h["id"]] = json.loads((ROOT / "out" / h["id"] / "script.json").read_text(encoding="utf-8"))
        except (OSError, ValueError, KeyError): pass
    return out

def main() -> int:
    for s in (sys.stdout, sys.stderr):
        try: s.reconfigure(encoding="utf-8")
        except Exception: pass
    sys.path.insert(0, str(ROOT / "pipeline"))
    from pick_topic import load_history
    f = ROOT / "data" / "metrics.csv"
    if not f.is_file():
        f.write_text(",".join(COLS) + "\n", encoding="utf-8-sig")
        print("已生成空表 data/metrics.csv，每条视频发布几天后填一行再运行。"); return 0
    try: m = load_metrics(f)
    except ValueError as e: print("✗", e); return 1
    hist = load_history(ROOT / "data" / "history.json"); sc = _scripts(hist)
    for field in FIELDS:
        print(f"\n## {NAMES[field]}")
        rows = sorted(score_by(field, m, hist, sc).items(), key=lambda kv: (kv[1]["enough"], _key(kv[1])), reverse=True)
        for v, x in rows:
            note = "" if x["enough"] else "（样本不足，不下结论）"
            print(f"  {v:<28} {x['n']} 条  播放 {x['播放']:.0f}  完播 {x['完播率']:.0%}  千次播放涨粉 {_key(x)[0]:.1f}{note}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
