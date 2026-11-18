"""画面预览：不配乐、不合成，只按时间点抽帧拼成一张图，写 visual.js 时反复用（每次十几秒，比完整出片快得多）。
有 out/<编号>/voice/voice.json 就按真实配音时长排时间轴，没有就按字数估算；有 frames/ 就带上实录帧。
页面报错（例如元素 id 重复、KIT.frame 少传 H）会直接打印出来。
用法：python pipeline/preview.py out/<编号> [每格秒数，默认 1] [--at 3.2 7.5 …]
输出：out/<编号>/preview.jpg（左上角是时间）"""
import argparse, json, os, subprocess, sys, tempfile
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "pipeline"))
from compile_script import compile_script, segments
from script_check import CPS, spoken_chars

JS = r"""
const {chromium}=require('playwright');const {pathToFileURL}=require('url');
(async()=>{const [,,engine,content,dir,step,ats]=process.argv;const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(pathToFileURL(engine).href+'?c='+encodeURIComponent(pathToFileURL(content).href));
try{await p.evaluate(()=>window.ready&&window.ready())}catch(e){errs.push(e.message)}
if(errs.length){console.log('页面报错：'+errs.join(' | '));await b.close();process.exit(2)}
const T=await p.evaluate(()=>window.T);const dur=T.at(-1);const times=ats?ats.split(',').map(Number):[];if(!times.length)for(let t=0;t<dur;t+=+step)times.push(t);
let i=0;for(const t of times){try{await p.evaluate(t=>seek(t),t)}catch(e){console.log('第 '+t.toFixed(2)+' 秒报错：'+e.message);await b.close();process.exit(2)}
 await p.screenshot({path:dir+'/p'+String(i++).padStart(3,'0')+'.jpg',type:'jpeg',quality:80})}
console.log(JSON.stringify({dur,cuts:T,times}));await b.close()})();"""


def preview(out: Path, step: float = 1.0, at=None) -> Path:
    out = Path(out).resolve(); s = json.loads((out / "script.json").read_text(encoding="utf-8"))
    vj = out / "voice" / "voice.json"
    voice = json.loads(vj.read_text()) if vj.is_file() else {sid: round(spoken_chars(t) / CPS, 2) for sid, t in segments(s)}
    foot = {}
    for slot in ("hook", "mid"):
        d = out / "frames" / slot
        if d.is_dir(): foot[slot] = {"frames": str(d), "n": len(list(d.glob("*.jpg"))), "speed": 1}
    content = out / "content.preview.js"
    content.write_text(compile_script(s, voice, foot, out / "visual.js"), encoding="utf-8")
    with tempfile.TemporaryDirectory() as tmp:
        js = Path(tmp) / "pv.js"; js.write_text(JS, encoding="utf-8")
        r = subprocess.run(["node", str(js), str(ROOT / "engine" / "index.html"), str(content), tmp, str(step), ",".join(map(str, at or []))],
                           capture_output=True, text=True, encoding="utf-8", errors="replace", cwd=str(ROOT),
                           env={**os.environ, "NODE_PATH": str(ROOT / "node_modules")})   # 临时目录里的脚本也能找到 playwright
        if r.returncode:
            raise SystemExit((r.stdout + r.stderr).strip()[-1500:])
        info = json.loads(r.stdout.strip().splitlines()[-1])
        n = len(info["times"]); cols = 8 if n > 8 else n; rows = (n + cols - 1) // cols
        dst = out / "preview.jpg"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "1", "-i", str(Path(tmp) / "p%03d.jpg"),
                        "-vf", f"scale=270:480,tile={cols}x{rows}", "-frames:v", "1", str(dst)], check=True)
    print(f"时长 {info['dur']:.2f} 秒，场景分界 {', '.join(f'{x:.2f}' for x in info['cuts'][1:-1])}")
    print(f"{n} 格（{'、'.join(f'{x:.1f}' for x in info['times'][:12])}{'…' if n > 12 else ''} 秒）→ {dst}")
    return dst


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("out"); ap.add_argument("step", nargs="?", type=float, default=1.0); ap.add_argument("--at", nargs="*", type=float)
    a = ap.parse_args(); preview(Path(a.out), a.step, a.at)
