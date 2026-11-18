"""审片联系表：从成片里每秒抽一帧，拼成一张 review.jpg（左上角是时间），出片后由 agent 自己打开看。

对照清单逐格看：
  1. 满屏：主体居中偏上，关键内容在上 150、下 460 像素之外，不出现大片空白
  2. 层次：前景（文字/主体）、中景（卡片/图形）、背景（光斑/粒子/配图）都有
  3. 运动：相邻两格之间画面有明显变化（motion.json 会给出静止比例和冻结段落）
  4. 没有文字重叠、溢出、被企鹅挡住；实录位置有"示意"字样（未录屏时）
用法：python pipeline/review.py 成片.mp4 [输出.jpg]
"""
import subprocess, sys
from pathlib import Path

def review(video: Path, out: Path | None = None, every: float = 1.0, cols: int = 8) -> Path:
    video = Path(video); out = Path(out) if out else video.with_name("review.jpg")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
                               capture_output=True, text=True, check=True).stdout.strip().strip(","))
    n = int(dur / every) + 1; rows = (n + cols - 1) // cols
    base = f"fps={1/every},scale=270:480"
    stamp = ",drawtext=text='%{pts\\:hms}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6"
    for vf in (base + stamp, base):          # 有的 ffmpeg 没编进 drawtext，就不打时间戳（每格固定 1 秒）
        r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-vf", f"{vf},tile={cols}x{rows}", "-frames:v", "1", str(out)],
                           capture_output=True, text=True)
        if r.returncode == 0: return out
    raise RuntimeError("联系表生成失败：" + r.stderr[-300:])

if __name__ == "__main__":
    print(review(Path(sys.argv[1]), Path(sys.argv[2]) if len(sys.argv) > 2 else None))
