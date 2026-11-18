"""从成片字幕还原每个场景的配音文本（SKILL.md 第 11 节第 1 步用）。
字幕之间相隔 ≥0.4 秒的地方是场景分界（引擎在场景之间留 0.4 秒尾 + 0.15 秒头）。字幕去掉了标点，输出里先用"，"连起来，句末标点要你按原意改。
用法：python tools/srt_scenes.py out/成片/D_数据复盘.srt"""
import re, sys
from pathlib import Path

def parse(text: str):
    out = []
    for blk in re.split(r"\n\s*\n", text.strip()):
        lines = blk.strip().splitlines()
        if len(lines) < 3: continue
        m = re.match(r"(\d+):(\d+):(\d+),(\d+)\s*-->\s*(\d+):(\d+):(\d+),(\d+)", lines[1])
        if not m: continue
        g = list(map(int, m.groups()))
        out.append((g[0]*3600+g[1]*60+g[2]+g[3]/1000, g[4]*3600+g[5]*60+g[6]+g[7]/1000, "".join(lines[2:]).strip()))
    return out

def scenes(caps, gap: float = 0.4):
    groups = []
    for a, b, t in caps:
        if groups and a - groups[-1][-1][1] < gap: groups[-1].append((a, b, t))
        else: groups.append([(a, b, t)])
    return [{"start": round(g[0][0], 2), "end": round(g[-1][1], 2), "vo": "，".join(x[2] for x in g) + "。"} for g in groups]

if __name__ == "__main__":
    for i, s in enumerate(scenes(parse(Path(sys.argv[1]).read_text(encoding="utf-8")))):
        print(f"{i+1:>2}  {s['start']:6.2f}–{s['end']:6.2f}  {s['vo']}")
