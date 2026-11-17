"""自动选题：从八步选题池里挑最久没做过的一步；按七比三穿插热点视频。"""
import datetime, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def load_history(path: Path) -> list:
    """读出片历史（按时间从旧到新）。文件不存在或损坏时按空历史处理。"""
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []
    return data if isinstance(data, list) else []

HOT_SHARE = 0.3
HOT_DAYS = 7

def valid_hot(h: dict, today: datetime.date = None) -> bool:
    """热点要：有题目、可查的来源链接、一周内的来源日期、和电商或 AI 相关、没用过。"""
    today = today or datetime.date.today()
    try: d = datetime.date.fromisoformat(str(h.get("source_date")))
    except ValueError: return False
    return (bool((h.get("topic") or "").strip()) and str(h.get("source_url") or "").startswith(("http://", "https://"))
            and 0 <= (today - d).days <= HOT_DAYS and h.get("relevant_to") in ("ecommerce", "ai") and not h.get("used"))

def pick(topics: list, history: list, hot_enabled: bool = False, hot_items=None, today: datetime.date = None) -> dict:
    """hot_items 为 None 时只看配额（旧用法）；给了列表时还要有可用的热点才出热点。"""
    recent = history[-10:]
    if hot_enabled:
        hot = sum(1 for h in recent if h.get("type") == "hot")
        if (hot + 1) / (len(recent) + 1) <= HOT_SHARE:
            if hot_items is None:
                return {"type": "hot", "step": None, "angle_index": 0}
            ok = [h for h in hot_items if valid_hot(h, today)]
            if ok:
                return {"type": "hot", "step": None, "angle_index": 0, "hot": ok[0]}
    last_seen, last_angle = {}, {}
    for i, h in enumerate(history):
        if h.get("type") == "product" and h.get("step") is not None:
            last_seen[h["step"]] = i
            last_angle[h["step"]] = h.get("angle_index", 0)
    topic = min(topics, key=lambda t: (last_seen.get(t["step"], -1), t["step"]))
    step = topic["step"]
    n = max(1, len(topic.get("points", [])))
    angle = (last_angle[step] + 1) % n if step in last_angle else 0
    return {"type": "product", "step": step, "angle_index": angle}

if __name__ == "__main__":
    topics = json.loads((ROOT / "data" / "topics.json").read_text(encoding="utf-8"))
    hot_f = ROOT / "data" / "hot.json"
    hot_items = json.loads(hot_f.read_text(encoding="utf-8")) if hot_f.is_file() else []
    r = pick(topics, load_history(ROOT / "data" / "history.json"), hot_enabled="--hot" in sys.argv, hot_items=hot_items)
    if r["step"]:
        t = next(t for t in topics if t["step"] == r["step"])
        r.update(name=t["name"], point=t["points"][r["angle_index"] % len(t["points"])], pain=t["pain"])
    hist = load_history(ROOT / "data" / "history.json")
    try:
        sys.path.insert(0, str(ROOT / "tools")); import report
        m = report.load_metrics(ROOT / "data" / "metrics.csv")
        r["prefer"] = {"structure": report.recommend("structure", m, hist, {h.get("structure") for h in hist[-5:]}),
                       "mid_hook": report.recommend("mid_hook", m, hist, {h.get("mid_hook") for h in hist[-3:]})}
    except (OSError, ValueError, ImportError):
        pass   # 还没有数据表或数据表有问题：不给偏好，照常选
    print(json.dumps(r, ensure_ascii=False, indent=1))
