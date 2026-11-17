"""把采集结果整理成：互动排名、各步骤的话题标签分层（写入 data/tags.json）。
新的剧本结构和钩子写法由 agent 读排名靠前的标题后写进 data/research/proposals.json，
只有用户确认（"approved": true）的才并入 data/structures.json / data/hooks.json。
用法：python research/digest.py tags data/research/<文件>.json [...]
      python research/digest.py top data/research/<文件>.json [--n 20]
      python research/digest.py merge"""
import collections, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "research"))
COMMON = ["#电商自动化"]           # 账号固定标签，各步都可用

def score(it) -> float:
    return it.get("likes", 0) + 2 * it.get("comments", 0) + 3 * it.get("shares", 0) + 2 * it.get("saves", 0)

def rank(items) -> list:
    best = {}
    for it in items:
        u = it.get("url")
        if u and (u not in best or score(it) > score(best[u])): best[u] = it
    return sorted(best.values(), key=score, reverse=True)

def tag_stats(items, topics) -> dict:
    from collect import keywords
    step_of = {}
    for t in topics:
        for k in keywords([t]): step_of.setdefault(k, t["step"])
    out = collections.defaultdict(collections.Counter)
    for it in rank(items):
        s = step_of.get(it.get("keyword"))
        if s is None: continue
        for tag in {t.strip().lstrip("#") for t in it.get("tags") or [] if t and t.strip()}:
            out[s][tag] += 1
    return dict(out)

def layer(counter) -> dict:
    """1 个核心词（最高频）、2 个场景词（随后的短词）、1–2 个长尾词（6 字以上的较长词）。"""
    tags = [t for t, _ in counter.most_common()]
    core = tags[:1]
    scene = [t for t in tags[1:] if len(t) <= 5][:2]
    long = [t for t in tags[1:] if len(t) >= 6 and t not in scene][:2]
    return {k: ["#" + t for t in v] for k, v in (("core", core), ("scene", scene), ("long", long))}

def write_tags(stats: dict, path: Path = ROOT / "data" / "tags.json") -> Path:
    path = Path(path)
    old = json.loads(path.read_text(encoding="utf-8")) if path.is_file() else {}
    old["common"] = COMMON
    for step, c in stats.items(): old[str(step)] = layer(c)
    path.write_text(json.dumps(old, ensure_ascii=False, indent=1), encoding="utf-8")
    return path

def merge_proposals(proposals, structures, hooks):
    """返回（新结构库，新钩子库，没并入的提案）。只并入 approved 为真、且 id 不重复的。"""
    S, H, left = list(structures), list(hooks), []
    for p in proposals:
        target = S if p.get("kind") == "structure" else H if p.get("kind") == "hook" else None
        if target is None or p.get("approved") is not True or any(x.get("id") == p.get("id") for x in target):
            left.append(p); continue
        target.append({k: v for k, v in p.items() if k not in ("kind", "approved", "evidence")})
    return S, H, left

def main(argv=None) -> int:
    for s in (sys.stdout, sys.stderr):
        try: s.reconfigure(encoding="utf-8")
        except Exception: pass
    a = list(sys.argv[1:] if argv is None else argv)
    if not a: print(__doc__); return 1
    if a[0] == "merge":
        pf = ROOT / "data" / "research" / "proposals.json"
        props = json.loads(pf.read_text(encoding="utf-8")) if pf.is_file() else []
        sf, hf = ROOT / "data" / "structures.json", ROOT / "data" / "hooks.json"
        S, H, left = merge_proposals(props, json.loads(sf.read_text(encoding="utf-8")), json.loads(hf.read_text(encoding="utf-8")))
        sf.write_text(json.dumps(S, ensure_ascii=False, indent=1), encoding="utf-8")
        hf.write_text(json.dumps(H, ensure_ascii=False, indent=1), encoding="utf-8")
        pf.parent.mkdir(parents=True, exist_ok=True); pf.write_text(json.dumps(left, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"✓ 并入 {len(props) - len(left)} 条，剩 {len(left)} 条待确认"); return 0
    files = [f for f in a[1:] if not f.startswith("--")]
    items = [x for f in files for x in json.loads(Path(f).read_text(encoding="utf-8"))]
    if a[0] == "tags":
        topics = json.loads((ROOT / "data" / "topics.json").read_text(encoding="utf-8"))
        print("✓", write_tags(tag_stats(items, topics))); return 0
    if a[0] == "top":
        n = int(a[a.index("--n") + 1]) if "--n" in a else 20
        for it in rank(items)[:n]:
            print(f"{score(it):>8.0f}  {it['platform']}  {it['keyword']}  {it['title'][:40]}  {it['url']}")
        return 0
    print(__doc__); return 1

if __name__ == "__main__":
    sys.exit(main())
