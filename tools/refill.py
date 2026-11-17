"""把已出的占位版成片换成实录版：用这一步的素材包 + 已有配音重出，并更新历史里的 has_footage。
用法：python tools/refill.py <编号>"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "pipeline"))
import make
from pack import load_pack

def refill(vid: str, root: Path = ROOT, history_path: Path = None, backend: str = "voxcpm") -> Path:
    root = Path(root); history_path = Path(history_path or root / "data" / "history.json")
    d = root / "out" / vid
    try: pub = json.loads((d / "publish.json").read_text(encoding="utf-8"))
    except (OSError, ValueError): raise SystemExit(f"✗ 找不到 {vid} 的 publish.json，先正常出片")
    if not pub.get("pending_footage"): raise SystemExit(f"✗ {vid} 已经是实录版，不需要重出")
    script = json.loads((d / "script.json").read_text(encoding="utf-8"))
    if not load_pack(make.step_id(script)):
        raise SystemExit(f"✗ 步骤 {script.get('step')} 还没有可用的素材包（先录屏，并在人工确认后执行 python pipeline/pack.py approve {make.step_id(script)}）")
    old = history_path.read_text(encoding="utf-8") if history_path.is_file() else "[]"
    full = json.loads(old)
    pos = next((i for i, h in enumerate(full) if h.get("id") == vid), len(full))
    hist = [h for h in full if h.get("id") != vid]
    history_path.write_text(json.dumps(hist, ensure_ascii=False, indent=1), encoding="utf-8")
    try:
        # 同一份剧本重出：只和它原来之前的历史比“近 N 条不重复”，新记录放回原来的位置
        final = make.run(d / "script.json", ["auto"], backend, reuse_voice=True, check_history=hist[:pos])
        now = json.loads(history_path.read_text(encoding="utf-8"))
        new = [h for h in now if h.get("id") == vid]; rest = [h for h in now if h.get("id") != vid]
        history_path.write_text(json.dumps(rest[:pos] + new + rest[pos:], ensure_ascii=False, indent=1), encoding="utf-8")
        return final
    except BaseException as e:
        history_path.write_text(old, encoding="utf-8")         # 重出失败：历史恢复原样
        if isinstance(e, make.Stop): raise SystemExit(f"✗ {e}")
        raise

if __name__ == "__main__":
    if len(sys.argv) != 2: print(__doc__); sys.exit(1)
    print("✓ 实录版：", refill(sys.argv[1]))
