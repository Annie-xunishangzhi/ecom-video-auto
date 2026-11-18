"""自动选题：从选题池（data/topics.json，大类 → 小点）里挑最久没做过的一类（"auto": false 的大类不参与），类内按顺序轮换小点；按七比三穿插热点视频。
用户已有 skill 的大类优先（pipeline/skills.py：登记表、topics.json 的 skill_path、确认过的素材包），--all 不看 skill。
自定义选题跳出选题池：python pipeline/pick_topic.py --topic "退货地址自动核对" [--step 9] [--pain "痛点1,痛点2"]
  --step 可选：挂到最接近的大类（用于素材包、话题标签、轮换记录）；不挂时 step 为 null。"""
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

def pick(topics: list, history: list, hot_enabled: bool = False, hot_items=None, today: datetime.date = None, skills=None) -> dict:
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
            if isinstance(h.get("angle_index", 0), int):   # 自定义选题的 angle_index 为 null，不影响类内轮换
                last_angle[h["step"]] = h.get("angle_index", 0)
    # 用户已有 skill 的大类优先（skills 为步骤号集合，见 pipeline/skills.py）；一个都没有时，按主线（不含 "auto": false）轮换
    have = [t for t in topics if skills and t["step"] in skills]
    pool = have or [t for t in topics if t.get("auto", True)] or topics
    topic = min(pool, key=lambda t: (last_seen.get(t["step"], -1), t["step"]))
    step = topic["step"]
    n = max(1, len(topic.get("points", [])))
    angle = (last_angle[step] + 1) % n if step in last_angle else 0
    return {"type": "product", "step": step, "angle_index": angle}

def point_of(topic: dict, i: int):
    """第 i 个小点的文字和痛点：小点可以是字符串（用大类的痛点），也可以是 {"point", "pain"}。"""
    pts = topic.get("points") or [""]
    pt = pts[i % len(pts)]
    if isinstance(pt, dict): return pt["point"], pt.get("pain") or topic.get("pain") or []
    return pt, topic.get("pain") or []

def custom(argv: list, topics: list) -> dict:
    """--topic 自定义选题；--step 挂到某个大类；--pain 逗号分隔的痛点。"""
    def opt(k):
        return argv[argv.index(k) + 1] if k in argv and argv.index(k) + 1 < len(argv) else None
    text = (opt("--topic") or "").strip()
    if not text: raise SystemExit("--topic 后面要写选题，例如 --topic \"退货地址自动核对\"")
    step = opt("--step"); step = int(step) if step else None
    t = next((t for t in topics if t["step"] == step), None)
    if step is not None and not t: raise SystemExit(f"没有第 {step} 类，可选：" + "、".join(f"{t['step']} {t['name']}" for t in topics))
    pain = [x.strip() for x in (opt("--pain") or "").replace("，", ",").split(",") if x.strip()] or (t or {}).get("pain") or []
    return {"type": "product", "step": step, "angle_index": None, "custom": True, "name": t["name"] if t else text, "point": text, "pain": pain}

if __name__ == "__main__":
    topics = json.loads((ROOT / "data" / "topics.json").read_text(encoding="utf-8"))
    hot_f = ROOT / "data" / "hot.json"
    hot_items = json.loads(hot_f.read_text(encoding="utf-8")) if hot_f.is_file() else []
    import skills as SK
    own = SK.owned(topics, ROOT)
    if "--topic" in sys.argv:
        r = custom(sys.argv, topics)
    else:   # --all：不看已有 skill，按全部主线轮换
        r = pick(topics, load_history(ROOT / "data" / "history.json"), hot_enabled="--hot" in sys.argv, hot_items=hot_items,
                 skills=None if "--all" in sys.argv else set(own))
        if r["step"]:
            t = next(t for t in topics if t["step"] == r["step"])
            pt, pain = point_of(t, r["angle_index"]); r.update(name=t["name"], point=pt, pain=pain)
    if r.get("type") == "product":
        s = own.get(r.get("step"))   # 这一类有没有 skill：有就带上路径，第 2 步不用再问
        r.update(has_skill=bool(s), skill_path=(s or {}).get("path"), skill_from=(s or {}).get("from"), owned_steps=sorted(own))
    hist = load_history(ROOT / "data" / "history.json")
    try:
        sys.path.insert(0, str(ROOT / "tools")); import report
        m = report.load_metrics(ROOT / "data" / "metrics.csv")
        r["prefer"] = {"structure": report.recommend("structure", m, hist, {h.get("structure") for h in hist[-5:]}),
                       "mid_hook": report.recommend("mid_hook", m, hist, {h.get("mid_hook") for h in hist[-3:]})}
    except (OSError, ValueError, ImportError):
        pass   # 还没有数据表或数据表有问题：不给偏好，照常选
    print(json.dumps(r, ensure_ascii=False, indent=1))
