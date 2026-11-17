"""素材包：一次录屏的产物（录像、步骤时间、实测数据、高光片段）。
存放在 assets/footage/<step>/pack.json，clip 是相对这个目录的文件名。"""
import datetime, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FOOTAGE = ROOT / "assets" / "footage"
REQUIRED = ("step", "product", "recorder", "clip", "recorded_at", "measured", "steps", "highlights", "masked", "review")
REVIEWS = ("ok", "pending")

def pack_dir(step: str) -> Path:
    return Path(FOOTAGE) / str(step)

def _valid(p) -> bool:
    if not isinstance(p, dict) or any(k not in p for k in REQUIRED): return False
    if p["review"] not in REVIEWS or not isinstance(p["measured"], dict): return False
    if not isinstance(p["steps"], list) or not isinstance(p["highlights"], dict): return False
    return True

def load_pack(step: str, allow_pending: bool = False):
    """读素材包；文件缺失、损坏、字段不全或待人工确认（review != ok）时返回 None。"""
    f = pack_dir(step) / "pack.json"
    try:
        p = json.loads(f.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    if not _valid(p): return None
    if p["review"] != "ok" and not allow_pending: return None
    p["dir"] = str(f.parent)
    return p

def save_pack(p: dict) -> Path:
    """写素材包；同一步骤已有素材包时，先把旧的改名为 pack.<时间>.json 归档，不覆盖。"""
    p = {k: v for k, v in p.items() if k != "dir"}
    if not _valid(p): raise ValueError("素材包字段不全或 review 不是 ok/pending")
    d = pack_dir(p["step"]); d.mkdir(parents=True, exist_ok=True)
    f = d / "pack.json"
    if f.exists():
        stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S-%f")
        f.replace(d / f"pack.{stamp}.json")
    tmp = d / "pack.json.tmp"
    tmp.write_text(json.dumps(p, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(f)
    return f
