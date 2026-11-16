"""skill 读取接口：读一个 skill（或本地工具）的说明，提炼名称、简介和功能点。没有输入时跳过。"""
import json, re, sys
from pathlib import Path

class SkillNotFound(Exception):
    pass

DOCS = ("SKILL.md", "README.md")

def _parse(text: str):
    name = summary = None
    body = text
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?", text, re.S)
    if m:
        body = text[m.end():]
        for line in m.group(1).splitlines():
            k, _, v = line.partition(":")
            if k.strip() == "name": name = v.strip().strip("'\"")
            if k.strip() == "description": summary = v.strip().strip("'\"")
    if not name:
        h1 = re.search(r"^#\s+(.+)$", body, re.M)
        name = h1.group(1).strip() if h1 else ""
    if not summary:
        paras = [p.strip() for p in re.split(r"\n\s*\n", body)
                 if p.strip() and not p.strip().startswith(("#", "!", "|", "```", "-", ">"))]
        summary = paras[0].replace("\n", " ") if paras else ""
    points = [h.strip() for h in re.findall(r"^##\s+(.+)$", body, re.M)]
    return name, summary, points

def load_skill(path, topic: dict) -> dict:
    if path is None or not str(path).strip():
        return {"provided": False, "step": topic["step"], "name": topic["name"], "summary": "",
                "points": list(topic["points"]), "source": None}
    p = Path(str(path).strip().strip('"'))
    if not p.exists():
        raise SkillNotFound(f"找不到这个路径：{p}")
    if p.is_dir():
        doc = next((p / d for d in DOCS if (p / d).is_file()), None)
        if doc is None:
            raise SkillNotFound(f"这个文件夹里没有 SKILL.md 或 README.md：{p}")
    else:
        doc = p
    name, summary, points = _parse(doc.read_text(encoding="utf-8", errors="replace"))
    return {"provided": True, "step": topic["step"], "name": name or topic["name"], "summary": summary,
            "points": points or list(topic["points"]), "source": str(doc)}

if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    topics = json.loads((root / "data" / "topics.json").read_text(encoding="utf-8"))
    step = int(sys.argv[1]); path = sys.argv[2] if len(sys.argv) > 2 else None
    try:
        print(json.dumps(load_skill(path, next(t for t in topics if t["step"] == step)), ensure_ascii=False, indent=1))
    except SkillNotFound as e:
        sys.exit(str(e))
