"""重做一条已出过的视频：同一份剧本，按新的画面/音色重出（配音先用 tools/web_tts.py 配好）。
有可用素材包就自动用实录（--footage auto），没有就示意占位。
"近 N 条不重复"只和这条原来之前的历史比，新记录放回原来的位置；失败时历史恢复原样。
用法：python tools/redo.py <编号> [--allow-still]"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "pipeline"))
import make


def redo(vid: str, root: Path = ROOT, history_path: Path = None, backend: str = "voxcpm", allow_still: bool = False) -> Path:
    root = Path(root); history_path = Path(history_path or root / "data" / "history.json")
    d = root / "out" / vid
    if not (d / "script.json").is_file(): raise SystemExit(f"✗ 找不到 out/{vid}/script.json")
    old = history_path.read_text(encoding="utf-8") if history_path.is_file() else "[]"
    full = json.loads(old)
    pos = next((i for i, h in enumerate(full) if h.get("id") == vid), len(full))
    hist = [h for h in full if h.get("id") != vid]
    history_path.write_text(json.dumps(hist, ensure_ascii=False, indent=1), encoding="utf-8")
    try:
        final = make.run(d / "script.json", ["auto"], backend, reuse_voice=True, check_history=hist[:pos], allow_still=allow_still)
        now = json.loads(history_path.read_text(encoding="utf-8"))
        new = [h for h in now if h.get("id") == vid]; rest = [h for h in now if h.get("id") != vid]
        history_path.write_text(json.dumps(rest[:pos] + new + rest[pos:], ensure_ascii=False, indent=1), encoding="utf-8")
        return final
    except BaseException as e:
        history_path.write_text(old, encoding="utf-8")
        if isinstance(e, make.Stop): raise SystemExit(f"✗ {e}")
        raise


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1: print(__doc__); sys.exit(1)
    print("✓ 重做完成：", redo(args[0], allow_still="--allow-still" in sys.argv))
