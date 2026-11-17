"""录制 → 打码 → 挑高光 → 存入 assets/footage/<step>/ 成为素材包。任何一步失败都不留下半截文件。"""
import datetime, shutil, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import pack
from highlights import activity, choose
from mask import mask_pack_clip

def _secs(clip) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(clip)], capture_output=True, text=True)
    return float(r.stdout.strip())

def finish(draft: dict, raw_clip: Path, rects: list, force_pending: bool = False) -> Path:
    """把录好的原始片段打码、挑高光，写成素材包。"""
    d = pack.pack_dir(draft["step"]); d.mkdir(parents=True, exist_ok=True)
    final = d / Path(draft["clip"]).name
    if final.exists(): final = d / f"{final.stem}-{datetime.datetime.now():%f}.mp4"
    try:
        m = mask_pack_clip(raw_clip, rects, final)
        secs = _secs(final)
        hl = choose(draft.get("steps") or [], secs, None if draft.get("steps") else activity(final))
        p = {**draft, **m, "clip": final.name, "highlights": hl}
        if force_pending: p["review"] = "pending"
        return pack.save_pack(p)
    except Exception:
        if final.exists(): final.unlink()
        raise

def build(demo: dict, allow: set = frozenset(), headed: bool = False) -> Path:
    from record_web import record_web
    tmp = pack.pack_dir(demo["step"]) / f"_rec-{datetime.datetime.now():%Y%m%d-%H%M%S}"
    try:
        draft = record_web(demo, tmp, allow, headed)
        return finish(draft, tmp / draft["clip"], demo.get("mask") or [])
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
