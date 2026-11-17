"""剧本 JSON → 引擎内容（window.CONTENT / window.VO）。"""
import copy, json
from pathlib import Path

POSES = ["base", "talk", "blink", "phone", "point", "cheer", "shock", "clip", "wave"]

def _voiced(script):
    k = 0
    for i, sc in enumerate(script["scenes"]):
        if (sc.get("vo") or "").strip():
            k += 1; yield i, f"s{k:02d}", sc["vo"].strip()

def segments(script: dict) -> list:
    """[(配音段编号, 文本)]，按场景顺序"""
    return [(sid, text) for _, sid, text in _voiced(script)]

def compile_script(script: dict, voice: dict, footage: dict) -> str:
    scenes = copy.deepcopy(script["scenes"])
    for i, sid, _ in _voiced(script):
        scenes[i]["v"] = sid
    images = {im.get("scene"): im.get("file") for im in script.get("images") or [] if im.get("file")}
    for i, sc in enumerate(scenes):
        if sc["type"] == "footage":
            f = (footage or {}).get(sc.get("slot")) or {}
            if f.get("frames") and f.get("n"):
                sc.update(frames=Path(f["frames"]).resolve().as_uri(), n=f["n"], speed=f.get("speed", 1))
            else:
                sc.update(frames=None, n=0)
        if sc["type"] == "photo" and not sc.get("image") and images.get(i):
            sc["image"] = images[i]
    if scenes and scenes[-1]["type"] == "cta" and not scenes[-1].get("keyword"):
        scenes[-1]["keyword"] = (script.get("cta") or {}).get("keyword")
    content = {"theme": script.get("theme", "paper"), "outro": True, "captions": True,
               "mascot": {"dir": "../assets/mascot", "poses": POSES}, "scenes": scenes}
    return ("window.CONTENT=" + json.dumps(content, ensure_ascii=False) + ";\nwindow.VO=" + json.dumps(voice, ensure_ascii=False) + ";\n")
