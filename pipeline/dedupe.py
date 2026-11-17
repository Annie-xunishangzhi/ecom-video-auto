"""查重：和近 10 条成片的剧本比，太像就不出片。
相似度 0–1，综合结构、中段钩子、主题、配乐情绪、场景类型序列、标题和配音文案的字词重合。"""
import json, re
from pathlib import Path

WEIGHTS = {"结构": 0.2, "中段钩子": 0.1, "主题": 0.1, "配乐情绪": 0.1, "场景顺序": 0.25, "文案": 0.25}
_KEEP = re.compile(r"[一-鿿A-Za-z0-9]")

def _seq(s): return [sc.get("type") for sc in s.get("scenes") or []]

def _edit_sim(x, y) -> float:
    if not x and not y: return 1.0
    d = list(range(len(y) + 1))
    for i, a in enumerate(x, 1):
        prev, d[0] = d[0], i
        for j, b in enumerate(y, 1):
            prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (a != b))
    return 1 - d[-1] / max(len(x), len(y))

def _grams(s):
    t = "".join(_KEEP.findall((s.get("title") or "") + "".join(sc.get("vo") or "" for sc in s.get("scenes") or [])))
    return {t[i:i + 2] for i in range(len(t) - 1)}

def _jaccard(a, b) -> float:
    if not a and not b: return 1.0
    return len(a & b) / len(a | b)

def parts(a: dict, b: dict) -> dict:
    return {"结构": float(a.get("structure") == b.get("structure")),
            "中段钩子": float(a.get("mid_hook") == b.get("mid_hook")),
            "主题": float(a.get("theme") == b.get("theme")),
            "配乐情绪": float(a.get("mood") == b.get("mood")),
            "场景顺序": _edit_sim(_seq(a), _seq(b)),
            "文案": _jaccard(_grams(a), _grams(b))}

def similarity(a: dict, b: dict) -> float:
    return sum(WEIGHTS[k] * v for k, v in parts(a, b).items())

def check(script: dict, history_scripts: list, window: int = 10, limit: float = 0.6) -> list:
    P = []
    for h in history_scripts[-window:]:
        if h.get("id") == script.get("id"): continue
        p = parts(script, h); s = sum(WEIGHTS[k] * v for k, v in p.items())
        if s > limit:
            why = "、".join(f"{k}相同" if k in ("结构", "中段钩子", "主题", "配乐情绪") else f"{k}重合 {v:.0%}"
                           for k, v in sorted(p.items(), key=lambda kv: -WEIGHTS[kv[0]] * kv[1]) if v >= 0.5)
            P.append(f"和 {h.get('id')} 太像（相似度 {s:.2f}，上限 {limit}）：{why}。换结构、钩子写法或重写文案")
    return P

def load_history_scripts(history: list, out_root: Path, exclude: str = None) -> list:
    """按历史顺序读出各成片的剧本；剧本文件不在了就跳过。"""
    got = []
    for h in history:
        if h.get("id") == exclude: continue
        f = Path(out_root) / str(h.get("id")) / "script.json"
        try: got.append(json.loads(f.read_text(encoding="utf-8")))
        except (OSError, ValueError): pass
    return got
