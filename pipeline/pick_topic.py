"""自动选题：从八步选题池里挑最久没做过的一步；按七比三穿插热点视频。"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def load_history(path: Path) -> list:
    """读出片历史（按时间从旧到新）。文件不存在或损坏时按空历史处理。"""
    try:
        data = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []
    return data if isinstance(data, list) else []

def pick(topics: list, history: list, hot_enabled: bool = False) -> dict:
    recent = history[-10:]
    if hot_enabled:
        hot = sum(1 for h in recent if h.get("type") == "hot")
        product = sum(1 for h in recent if h.get("type") == "product")
        if hot < 3 and product >= 7:
            return {"type": "hot", "step": None, "angle_index": 0}
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
    r = pick(topics, load_history(ROOT / "data" / "history.json"), hot_enabled="--hot" in sys.argv)
    if r["step"]:
        t = next(t for t in topics if t["step"] == r["step"])
        r.update(name=t["name"], point=t["points"][r["angle_index"] % len(t["points"])], pain=t["pain"])
    print(json.dumps(r, ensure_ascii=False, indent=1))
