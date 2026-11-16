"""剧本规则检查。check() 返回问题列表，空列表表示通过。"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CPS = 4.2                      # 估算语速：字/秒
MIN_S, MAX_S = 30, 55
OUTRO_S = 2.2
LEAD_TAIL = 0.55
SILENT_SCENE_S = 3.0
BANNED = ["必定", "保证", "100%", "稳赚", "暴利", "加微信", "加V", "vx", "微信号", "不关注就"]
HOOK_TYPES = {"hookContrast", "footage", "photo", "counter", "timer"}
SCENE_TYPES = {"hookContrast", "counter", "timer", "bars", "photo", "steps", "reveal", "footage", "statement", "cta"}
THEMES = {"paper", "ink", "mint", "dusk"}
MOODS = {"upbeat", "calm", "tense", "playful", "warm"}
OFFSITE = ["微信", "公众号", "企微", "企业微信", "二维码", "链接"]
QTY = re.compile(r"[0-9０-９一二两三四五六七八九十百千万半几]+\s*(?:秒|分钟|小时|天|倍)")
_PUNCT = re.compile(r"[\s，。！？、；：,.!?;:“”\"'‘’（）()《》…—\-{}]")

def _ids(name):
    return {x["id"] for x in json.loads((ROOT / "data" / name).read_text(encoding="utf-8"))}

def spoken_chars(vo: str) -> int:
    return len(_PUNCT.sub("", vo or ""))

def scene_seconds(sc: dict) -> float:
    n = spoken_chars(sc.get("vo", ""))
    return max(sc.get("dur", 0) or 0, n / CPS + LEAD_TAIL) if n else (sc.get("dur") or SILENT_SCENE_S)

def estimate_seconds(script: dict) -> float:
    return sum(scene_seconds(s) for s in script.get("scenes", [])) + OUTRO_S

def _texts(obj):
    """场景里所有会上屏或被读出来的文字"""
    if isinstance(obj, str): yield obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            if k not in ("type", "slot", "image", "pose", "pos", "frames"): yield from _texts(v)
    elif isinstance(obj, (list, tuple)):
        for v in obj: yield from _texts(v)

def check(script: dict, history: list) -> list:
    P = []
    scenes = script.get("scenes") or []
    if not scenes:
        return ["剧本没有场景"]
    # 取值是否认识
    if script.get("structure") not in _ids("structures.json"): P.append(f"结构不在结构库里：{script.get('structure')}")
    if script.get("mid_hook") not in _ids("hooks.json"): P.append(f"中段钩子写法不认识：{script.get('mid_hook')}")
    if script.get("theme") not in THEMES: P.append(f"主题不认识：{script.get('theme')}")
    if script.get("mood") not in MOODS: P.append(f"情绪不认识：{script.get('mood')}")
    for i, s in enumerate(scenes):
        if s.get("type") not in SCENE_TYPES: P.append(f"第 {i+1} 个场景类型不认识：{s.get('type')}")
    # 时长
    total = estimate_seconds(script)
    if not MIN_S <= total <= MAX_S:
        diff = (MIN_S - total) if total < MIN_S else (total - MAX_S)
        P.append(f"估算时长 {total:.0f} 秒，不在 {MIN_S}–{MAX_S} 秒内，大约要{'加' if total < MIN_S else '删'} {int(diff*CPS)+1} 个字")
    # 禁用表述
    everything = " ".join(_texts(scenes)) + " " + script.get("title", "")
    for b in BANNED:
        if b.lower() in everything.lower(): P.append(f"出现禁用表述：{b}")
    # 钩子
    if scenes[0].get("type") not in HOOK_TYPES: P.append("开头第一个场景必须是钩子类场景")
    mids = [i for i, s in enumerate(scenes) if s.get("mid_hook")]
    if len(mids) != 1:
        P.append("需要且只能有一个中段钩子场景（mid_hook: true）")
    else:
        start = sum(scene_seconds(s) for s in scenes[:mids[0]]) / total
        if not 0.35 <= start <= 0.65: P.append(f"中段钩子出现在全片 {start:.0%} 处，应在 35%–65% 之间")
    if not any(s.get("payoff") for s in scenes[-2:]): P.append("最后两个场景里要有一个揭晓悬念（payoff: true）")
    if scenes[-1].get("type") != "cta": P.append("最后一个场景必须是转化场景（cta）")
    # 企鹅
    if sum(1 for s in scenes if s.get("mascot")) < 2: P.append("企鹅至少出场两次")
    if not scenes[-1].get("mascot"): P.append("最后的转化场景里企鹅必须出场")
    # 配图、录屏、标签
    if not 1 <= len(script.get("images") or []) <= 2: P.append("配图数量应为 1–2 张")
    foot = sum(scene_seconds(s) for s in scenes if s.get("type") == "footage")
    if foot > total / 3: P.append(f"录屏约 {foot:.0f} 秒，超过全片三分之一")
    if not 3 <= len(script.get("tags") or []) <= 5: P.append("话题标签应为 3–5 个")
    # 与近期成片不重复
    if script.get("structure") in [h.get("structure") for h in history[-5:]]: P.append("这个结构近 5 条里用过，换一个结构")
    if script.get("mid_hook") in [h.get("mid_hook") for h in history[-3:]]: P.append("这种中段钩子写法近 3 条里用过，换一种钩子")
    # skill 未输入时的规则
    if not (script.get("skill") or {}).get("provided"):
        if "实测" in everything: P.append("skill 未输入，不能出现“实测”")
        for i, s in enumerate(scenes):
            if s.get("about") == "manual": continue
            if any(QTY.search(t) for t in _texts(s)):
                P.append(f"skill 未输入，第 {i+1} 个场景不能写自动化一侧的具体数字")
        if "上线" not in " ".join(_texts(scenes[-1])): P.append("skill 未输入，结尾话术要说明“上线”后领取")
    # 平台
    if (script.get("cta") or {}).get("platform") == "douyin":
        cta_text = " ".join(_texts(scenes[-1]))
        for w in OFFSITE:
            if w in cta_text: P.append(f"抖音视频不能做站外导流：{w}"); break
    return P

if __name__ == "__main__":
    from pick_topic import load_history
    script = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    probs = check(script, load_history(ROOT / "data" / "history.json"))
    print(f"估算时长 {estimate_seconds(script):.1f} 秒")
    for p in probs: print("✗", p)
    if not probs: print("✓ 剧本检查通过")
    sys.exit(1 if probs else 0)
