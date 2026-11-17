"""一键出片：剧本检查 → 实录抽帧/占位 → 配音 → 编译 → 抽帧检查 → 渲染 → 时长复查 → 选曲混音 → 合成 → 发布信息 → 记入历史。
用法：python pipeline/make.py out/<id>/script.json [--footage hook=<视频>:<起点秒>:<时长秒>[:<倍速>]] [--footage mid=…] [--tts-backend voxcpm|fake]
任何一步失败都不记入历史。"""
import argparse, datetime, json, os, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
from compile_script import compile_script, segments
from footage import extract, placeholder
from mix import mix
from music_pick import pick as pick_track
from pick_topic import load_history
from script_check import MAX_S, MIN_S, CPS, check
import tts

class Stop(Exception):
    pass

def _parse_footage(args) -> dict:
    out = {}
    for a in args or []:
        slot, _, rest = a.partition("=")
        parts = rest.rsplit(":", 3)
        try:
            if len(parts) == 4: clip, start, dur, speed = parts[0], float(parts[1]), float(parts[2]), float(parts[3])
            else:
                parts = rest.rsplit(":", 2); clip, start, dur, speed = parts[0], float(parts[1]), float(parts[2]), 4.0
        except (ValueError, IndexError):
            raise Stop(f"--footage 写法不对：{a}（应为 槽位=视频路径:起点秒:时长秒[:倍速]）")
        if slot not in ("hook", "mid"): raise Stop(f"实录槽位只能是 hook 或 mid：{slot}")
        out[slot] = (Path(clip), start, dur, speed)
    return out

def _node(script_name: str, content: Path, out: Path, what: str):
    r = subprocess.run(["node", str(HERE / script_name)], env={**os.environ, "CONTENT": str(content), "OUT_DIR": str(out)},
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise Stop(f"{what}失败：{(r.stderr or r.stdout).strip()[-400:]}")

def _ffmpeg(args, cwd, what):
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", *args], cwd=str(cwd), capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise Stop(f"{what}失败：{r.stderr.strip()[-300:]}")

def run(script_path: Path, footage_args, backend_name: str, reuse_voice: bool = False) -> Path:
    script = json.loads(script_path.read_text(encoding="utf-8"))
    vid = script["id"]; out = script_path.parent
    history_path = ROOT / "data" / "history.json"; history = load_history(history_path)
    final = out / f"{vid}.mp4"
    if final.exists(): final.unlink()

    print("1/9 剧本检查")
    probs = check(script, history)
    if probs:
        raise Stop("剧本检查没通过：\n" + "\n".join("  ✗ " + p for p in probs))
    for i, sc in enumerate(script["scenes"]):
        img = sc.get("image") or next((im.get("file") for im in script.get("images") or [] if im.get("scene") == i and sc["type"] == "photo"), None)
        if sc["type"] == "photo" and (not img or not (ROOT / "assets" / "images" / img).is_file()):
            raise Stop(f"第 {i+1} 个场景的配图不存在：{img}（先用 tools/gen_image.py 生成）")

    print("2/9 实录槽位")
    wanted = _parse_footage(footage_args); foot = {}
    for slot in {sc.get("slot") for sc in script["scenes"] if sc["type"] == "footage"}:
        if slot in wanted:
            clip, start, dur, speed = wanted[slot]
            try: foot[slot] = extract(clip, out / "frames" / slot, start, dur, speed)
            except (FileNotFoundError, ValueError, RuntimeError) as e: raise Stop(str(e))
        else:
            foot[slot] = placeholder()
    pending = any(not f.get("n") for f in foot.values())

    print("3/9 配音")
    try:
        voice = tts.reuse_voice(script, out) if reuse_voice else tts.voice_for_script(script, out, backend_name)
    except tts.TTSFailed as e:
        raise Stop(f"配音失败：{e}")

    print("4/9 编译内容")
    content = out / "content.js"
    content.write_text(compile_script(script, voice, foot), encoding="utf-8")

    print("5/9 抽帧检查 → contact.jpg")
    _node("shots.js", content, out, "抽帧")
    print("6/9 渲染")
    for f in out.glob("scene*.mp4"): f.unlink()
    _node("render.js", content, out, "渲染")
    timeline = json.loads((out / "timeline.json").read_text(encoding="utf-8"))
    secs = float(timeline["dur"])
    if not MIN_S <= secs <= MAX_S:
        diff = (MIN_S - secs) if secs < MIN_S else (secs - MAX_S)
        raise Stop(f"成片时长 {secs:.1f} 秒，不在 {MIN_S}–{MAX_S} 秒内：配音文本大约要{'加' if secs < MIN_S else '删'} {int(diff * CPS) + 1} 个字")

    print("7/9 选曲与混音")
    lib_path = ROOT / "assets" / "music" / "library.json"
    library = json.loads(lib_path.read_text(encoding="utf-8")) if lib_path.is_file() else []
    try:
        track = pick_track(library, script.get("mood"), history)
        mix(timeline, out / "voice", track, out / "audio.wav", out / f"{vid}.srt")
    except (ValueError, FileNotFoundError, RuntimeError) as e:
        raise Stop(f"配乐失败：{e}")

    print("8/9 合成")
    n = len(timeline["cuts"]) + 1
    (out / "list.txt").write_text("".join(f"file 'scene{i}.mp4'\n" for i in range(n)), encoding="utf-8")
    _ffmpeg(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", "video.mp4"], out, "拼接")
    _ffmpeg(["-i", "video.mp4", "-i", "audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
             "-shortest", "-movflags", "+faststart", "final.tmp.mp4"], out, "合成")
    (out / "final.tmp.mp4").replace(final)
    for f in [out / "video.mp4", out / "list.txt", *out.glob("scene*.mp4")]: f.unlink()

    print("9/9 发布信息与历史")
    idx_path = ROOT / "assets" / "images" / "index.json"
    idx = {e["file"]: e for e in (json.loads(idx_path.read_text(encoding="utf-8")) if idx_path.is_file() else [])}
    used = {sc.get("image") for sc in json.loads(content.read_text(encoding="utf-8").split("window.CONTENT=")[1].split(";\nwindow.VO=")[0])["scenes"] if sc.get("image")}
    publish = {"id": vid, "title": script.get("title"), "tags": script.get("tags"), "platform": (script.get("cta") or {}).get("platform"),
               "comment_keyword": (script.get("cta") or {}).get("keyword"), "seconds": round(secs, 1),
               "reminder": "发布前请人工看一遍成片，并在平台上打 AI 生成内容标识。" + ("配乐要求署名，请把 music.attribution 这一行贴进视频简介。" if track.get("attribution") else ""),
               "pending_footage": pending, "pending_note": "实录槽位目前是示意画面，对应 skill 录屏后可替换重出。" if pending else "",
               "images": [idx.get(f, {"file": f, "license": "未登记"}) for f in sorted(used)],
               "music": {k: track.get(k) for k in ("id", "title", "source", "license", "license_url", "attribution")},
               "files": {"video": final.name, "subtitles": f"{vid}.srt", "contact_sheet": "contact.jpg"}}
    (out / "publish.json").write_text(json.dumps(publish, ensure_ascii=False, indent=1), encoding="utf-8")
    history.append({"id": vid, "date": datetime.date.today().isoformat(), "type": script.get("type"), "step": script.get("step"),
                    "angle_index": script.get("angle_index", 0), "structure": script.get("structure"), "mid_hook": script.get("mid_hook"),
                    "theme": script.get("theme"), "track": track["id"], "has_footage": not pending})
    history_path.parent.mkdir(parents=True, exist_ok=True)
    history_path.write_text(json.dumps(history, ensure_ascii=False, indent=1), encoding="utf-8")
    return final

def main(argv=None) -> int:
    for s in (sys.stdout, sys.stderr):
        try: s.reconfigure(encoding="utf-8")
        except Exception: pass
    ap = argparse.ArgumentParser()
    ap.add_argument("script"); ap.add_argument("--footage", action="append"); ap.add_argument("--tts-backend", default="voxcpm", choices=["voxcpm", "fake"])
    ap.add_argument("--reuse-voice", action="store_true", help="复用 out/<id>/voice/ 里已合成的配音")
    a = ap.parse_args(argv)
    try:
        final = run(Path(a.script).resolve(), a.footage, a.tts_backend, a.reuse_voice)
    except Stop as e:
        print("✗", e); return 1
    print("✓ 成片：", final); return 0

if __name__ == "__main__":
    sys.exit(main())
