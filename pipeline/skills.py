"""用户已有的电商自动化 skill：登记、判断、在本机查找。

"有 skill"的大类（选题时优先）满足任一条：
  1. data/skills.local.json 里登记了这一类、且路径存在（本机路径，不进 git）；
  2. data/topics.json 这一类写了 skill_path、且路径存在；
  3. assets/footage/s<步骤>/pack.json 存在且 review 为 ok（录屏过、用户确认过）。
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REGISTRY = ROOT / "data" / "skills.local.json"
DOCS = ("SKILL.md", "README.md")


def _doc(path) -> Path | None:
    """skill 路径对应的说明文件：文件本身，或文件夹里的 SKILL.md / README.md。"""
    if not path: return None
    p = Path(str(path).strip().strip('"'))
    if p.is_file(): return p
    if p.is_dir(): return next((p / d for d in DOCS if (p / d).is_file()), None)
    return None


def load_registry(path: Path = None) -> dict:
    """{步骤号(int): {"path", "name"}}；文件不存在或坏了当成空。"""
    try: d = json.loads(Path(path or REGISTRY).read_text(encoding="utf-8"))
    except (OSError, ValueError): return {}
    if not isinstance(d, dict): return {}
    out = {}
    for k, v in d.items():
        try: step = int(k)
        except ValueError: continue
        if isinstance(v, str): v = {"path": v}
        if isinstance(v, dict) and v.get("path"): out[step] = v
    return out


def save_registry(reg: dict, path: Path = None) -> None:
    path = Path(path or REGISTRY); path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({str(k): reg[k] for k in sorted(reg)}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")


def _pack_ok(step: int, root: Path) -> bool:
    try: return json.loads((root / "assets" / "footage" / f"s{step}" / "pack.json").read_text(encoding="utf-8")).get("review") == "ok"
    except (OSError, ValueError): return False


def owned(topics: list, root: Path = ROOT, registry: Path = None) -> dict:
    """{步骤号: {"path": skill 路径或 None, "from": "registry"|"topics"|"pack"}}，只含真有 skill 的大类。"""
    root = Path(root); reg = load_registry(registry or root / "data" / "skills.local.json"); out = {}
    for t in topics:
        s = t["step"]
        if s in reg and _doc(reg[s]["path"]): out[s] = {"path": reg[s]["path"], "from": "registry"}
        elif _doc(t.get("skill_path")): out[s] = {"path": t["skill_path"], "from": "topics"}
        elif _pack_ok(s, root): out[s] = {"path": None, "from": "pack"}
    return out


# ---------- 在本机查找 skill ----------

def _grams(text: str) -> set:
    """中文按两字切，英文按词；用来粗略比对 skill 说明和选题大类。"""
    text = re.sub(r"[\s\W_]+", " ", str(text).lower())
    out = set(re.findall(r"[a-z]{3,}", text))
    for run in re.findall(r"[一-鿿]+", text):
        out |= {run[i:i + 2] for i in range(len(run) - 1)}
    return out - {"自动", "一个", "一键", "可以", "我们", "工具", "使用", "需要", "适用", "支持"}


def topic_text(t: dict) -> str:
    pts = [p["point"] if isinstance(p, dict) else p for p in t.get("points") or []]
    pains = [x for p in t.get("points") or [] if isinstance(p, dict) for x in p.get("pain") or []]
    return " ".join([t.get("name", "")] * 3 + pts + (t.get("pain") or []) + pains)


def match(doc_text: str, topics: list, top: int = 2) -> list:
    """说明文字最像哪几类：[(步骤号, 名称, 分数)]，分数为共同词数。"""
    g = _grams(doc_text)
    scored = sorted(((len(g & _grams(topic_text(t))), t["step"], t["name"]) for t in topics), key=lambda x: (-x[0], x[1]))
    return [(s, n, sc) for sc, s, n in scored[:top] if sc > 0]


def default_roots(root: Path = ROOT) -> list:
    home = Path.home()
    return [Path(root).parent, home / ".claude" / "skills", home / ".agents" / "skills", home / ".codex" / "skills", Path(root) / ".claude" / "skills"]


def discover(roots: list, exclude: Path = ROOT, depth: int = 3) -> list:
    """在这些目录下找 SKILL.md（以及带 README.md 的工具文件夹）：[{"path", "doc", "name", "summary"}]。"""
    sys_path = str(Path(__file__).resolve().parent)
    import sys
    if sys_path not in sys.path: sys.path.insert(0, sys_path)
    from read_skill import _parse
    seen, out = set(), []
    ex = Path(exclude).resolve()
    for r in roots:
        r = Path(r)
        if not r.is_dir(): continue
        # SKILL.md：本层和往下 depth 层；README.md 只看下一层（本地网页工具这类没有 SKILL.md 的）
        docs = [p for k in range(depth + 1) for p in r.glob("*/" * k + "SKILL.md")] + list(r.glob("*/README.md"))
        for doc in sorted(docs):
            d = doc.parent.resolve()
            if d == ex or ex in d.parents or "node_modules" in d.parts or d in seen: continue
            if doc.name == "README.md" and (d / "SKILL.md").is_file(): continue
            seen.add(d)
            try: name, summary, _ = _parse(doc.read_text(encoding="utf-8", errors="replace"))
            except OSError: continue
            out.append({"path": str(d), "doc": str(doc), "name": name or d.name, "summary": summary[:200]})
    return out
