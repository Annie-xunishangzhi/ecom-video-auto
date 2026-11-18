"""按场景做画面运动检查：只渲染指定的几个场景（不配乐、不合成），逐个场景报"冻结"和"缺新动作"，时间是场景内的秒数。
出片时运动检查没过，用它在几十秒内定位、修改、复查，不用每次整片重出。
用法：python pipeline/scene_check.py out/<编号> [场景序号 …]     （序号从 0 开始；不写就查全部场景）"""
import argparse, json, os, subprocess, sys, tempfile
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "pipeline"))
import motion_check
from compile_script import compile_script, segments
from script_check import CPS, spoken_chars


def check_scenes(out: Path, scenes=None) -> list:
    out = Path(out).resolve(); s = json.loads((out / "script.json").read_text(encoding="utf-8"))
    vj = out / "voice" / "voice.json"
    voice = json.loads(vj.read_text()) if vj.is_file() else {sid: round(spoken_chars(t) / CPS, 2) for sid, t in segments(s)}
    foot = {slot: {"frames": str(out / "frames" / slot), "n": len(list((out / "frames" / slot).glob("*.jpg"))), "speed": 1}
            for slot in ("hook", "mid") if (out / "frames" / slot).is_dir()}
    content = out / "content.preview.js"; content.write_text(compile_script(s, voice, foot, out / "visual.js"), encoding="utf-8")
    results = []
    with tempfile.TemporaryDirectory() as tmp:
        env = {**os.environ, "CONTENT": str(content), "OUT_DIR": tmp}
        r = subprocess.run(["node", str(ROOT / "pipeline" / "render.js"), *map(str, scenes or [])], env=env, capture_output=True, text=True, cwd=str(ROOT))
        if r.returncode: raise SystemExit((r.stdout + r.stderr).strip()[-1500:])
        cuts = json.loads((Path(tmp) / "timeline.json").read_text(encoding="utf-8"))
        starts = [0.0] + list(cuts["cuts"])
        for f in sorted(Path(tmp).glob("scene*.mp4"), key=lambda p: int(p.stem[5:])):
            i = int(f.stem[5:]); m = motion_check.check(f)
            name = (s["scenes"][i].get("visual") or s["scenes"][i].get("type")) if i < len(s["scenes"]) else "outro"
            results.append({"scene": i, "name": name, "start": round(starts[i], 2), **{k: m[k] for k in ("still_ratio", "still_runs", "event_gaps", "ok")}})
    return results


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0]); ap.add_argument("out"); ap.add_argument("scenes", nargs="*", type=int)
    a = ap.parse_args(); bad = 0
    for r in check_scenes(Path(a.out), a.scenes):
        mark = "✓" if r["ok"] else "✗"; bad += not r["ok"]
        extra = "；".join([f"冻结 {x['start']}–{x['end']} 秒" for x in r["still_runs"]] + [f"缺新动作 {x['start']}–{x['end']} 秒" for x in r["event_gaps"]])
        print(f"{mark} 场景 {r['scene']}（{r['name']}，全片 {r['start']} 秒起）静止 {r['still_ratio']:.1%}" + (f"：{extra}" if extra else ""))
    sys.exit(1 if bad else 0)
