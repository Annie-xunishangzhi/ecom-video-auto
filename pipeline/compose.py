"""原创配乐：按视频的段落（钩子、铺垫、悬念、揭晓、转化、落版）用代码编曲，再用真实乐器采样（SoundFont）渲染。
每条视频按自己的编号取种子，调性、和弦进行、乐器组合、节奏型、动机都不同；段落变化对准画面转场。"""
import zlib
from pathlib import Path
import numpy as np
from scipy.signal import fftconvolve

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
SOUNDFONT = ROOT / "assets" / "soundfont" / "GeneralUser-GS.sf2"
MAJOR, MINOR = [0, 2, 4, 5, 7, 9, 11], [0, 2, 3, 5, 7, 8, 10]
PENTA = {"major": [0, 2, 4, 7, 9], "minor": [0, 3, 5, 7, 10]}
P = lambda keys, bass, lead, pad, kit=0: dict(keys=keys, bass=bass, lead=lead, pad=pad, kit=kit)
MOODS = {
 "upbeat":  dict(bpm=(104, 126), mode="major", swing=0.0, drum="pop",  feel="stab",
                 progs=[[0, 4, 5, 3], [0, 3, 4, 3], [5, 3, 0, 4], [0, 2, 3, 4]],
                 palettes={"band": P(4, 33, 12, 48), "guitar": P(25, 33, 11, 48), "piano": P(0, 32, 27, 89)}),
 "playful": dict(bpm=(100, 124), mode="major", swing=0.14, drum="pop", feel="stab",
                 progs=[[0, 3, 1, 4], [0, 5, 1, 4], [3, 4, 0, 5]],
                 palettes={"pizz": P(45, 32, 71, 48), "mallet": P(12, 32, 13, 48), "keys": P(4, 32, 73, 89)}),
 "tense":   dict(bpm=(92, 116), mode="minor", swing=0.0, drum="tom",  feel="ostinato",
                 progs=[[0, 5, 2, 6], [0, 3, 5, 4], [0, 6, 5, 6]],
                 palettes={"strings": P(45, 32, 0, 48), "piano": P(0, 33, 45, 89), "pulse": P(11, 38, 0, 48)}),
 "warm":    dict(bpm=(84, 104), mode="major", swing=0.0, drum="soft", feel="arp",
                 progs=[[0, 5, 3, 4], [3, 0, 4, 5], [0, 4, 5, 3]],
                 palettes={"piano": P(0, 32, 24, 48, 40), "guitar": P(24, 32, 0, 48, 40), "ep": P(4, 32, 11, 89, 40)}),
 "calm":    dict(bpm=(76, 96), mode="major", swing=0.0, drum="soft", feel="arp",
                 progs=[[0, 3, 0, 3], [5, 3, 0, 4], [0, 5, 3, 3]],
                 palettes={"ep": P(4, 32, 11, 89, 40), "piano": P(0, 32, 46, 48, 40), "nylon": P(24, 32, 12, 89, 40)}),
}
LEVEL = {"hook": 0.6, "build": 0.85, "suspense": 0.35, "reveal": 1.0, "cta": 0.95, "outro": 0.5}
STABS = [[0, 1.5, 2.5], [0, 0.75, 1.5, 2.5, 3.25], [0.5, 1.5, 2.5, 3.5], [0, 1, 2.5, 3]]

def seed_for(video_id: str) -> int:
    return zlib.crc32(video_id.encode("utf-8")) % 100000

def sections_from_script(script: dict, timeline: dict) -> list:
    """[(开始秒, 结束秒, 角色)]：按剧本里的中段钩子和揭晓位置划分段落，最后一段是落版"""
    T = [0.0] + list(timeline["cuts"]) + [float(timeline["dur"])]
    sc = script["scenes"]; n = len(sc)
    mid = next((i for i, s in enumerate(sc) if s.get("mid_hook")), n)
    pay = next((i for i, s in enumerate(sc) if s.get("payoff")), n)
    out = []
    for i in range(len(T) - 1):
        role = ("outro" if i >= n else "hook" if i == 0 else "build" if i < mid else "suspense" if i < pay
                else "reveal" if i == pay else "cta")
        out.append((T[i], T[i + 1], role))
    return out

def plan_music(timeline: dict, mood: str, seed: int) -> dict:
    cfg = MOODS[mood]; rng = np.random.default_rng(seed * 7919 + sum(map(ord, mood)))
    cuts = np.asarray(timeline.get("cuts") or [0.0], float); lo, hi = cfg["bpm"]
    def cost(bpm):
        half = 120.0 / bpm; d = cuts % half
        return float(np.minimum(d, half - d).sum())
    best = sorted(range(lo, hi + 1), key=cost)[:4]           # 让转场尽量落在半小节上，再从最合适的几个里随机挑
    names = sorted(cfg["palettes"])
    return {"mood": mood, "bpm": int(best[rng.integers(len(best))]), "key": int(48 + rng.choice([0, 2, 3, 5, 7, 9, 10])),
            "progression": [cfg["progs"][rng.integers(len(cfg["progs"]))]], "palette": names[rng.integers(len(names))],
            "stab": int(rng.integers(len(STABS))), "seed": int(seed)}

def _events(timeline, sections, plan):
    cfg = MOODS[plan["mood"]]; rng = np.random.default_rng(plan["seed"] * 104729 + 1)
    scale = MAJOR if cfg["mode"] == "major" else MINOR; penta = PENTA[cfg["mode"]]
    key, bpm = plan["key"], plan["bpm"]; beat = 60.0 / bpm; bar = 4 * beat; dur = float(timeline["dur"])
    prog = plan["progression"][0]; ev = []
    def deg(d, octave=0):
        return key + 12 * octave + scale[d % 7] + 12 * (d // 7)
    def chord(d):
        return [deg(d), deg(d + 2), deg(d + 4)]
    def note(t, length, ch, k, vel, jitter=0.006):
        t = max(0.0, t + rng.normal(0, jitter))
        if t < dur - 0.05: ev.append((t, min(length, dur - t), ch, int(k), int(np.clip(vel + rng.integers(-7, 8), 1, 127))))
    def swing(pos):
        return pos + cfg["swing"] if abs((pos * 2) % 2 - 1) < 1e-6 else pos
    def role_at(t):
        return next((r for a, b, r in sections if a <= t < b), sections[-1][2])
    # 动机：五声音阶上的小乐句，A 句和变化的 B 句
    rhythm = [[0, 0.5, 1.5, 2, 3], [0, 1, 1.5, 2.5, 3.5], [0.5, 1, 2, 2.5, 3], [0, 1.5, 2, 3, 3.5]][rng.integers(4)]
    step = int(rng.integers(0, 3)); motif_a = []
    for pos in rhythm:
        step = int(np.clip(step + rng.choice([-2, -1, 1, 1, 2]), -1, 6)); motif_a.append((pos, step))
    motif_b = [(p, s + int(rng.choice([-1, 0, 1]))) for p, s in motif_a[:-1]] + [(motif_a[-1][0], 0)]
    def pent(s, octave):
        return key + 12 * octave + penta[s % 5] + 12 * (s // 5)
    stab = STABS[plan["stab"]]; nbars = int(np.ceil(dur / bar)); prev = None; in_sec = 0
    for b in range(nbars):
        t0 = b * bar; role = role_at(min(t0 + beat, dur - 0.01)); lv = LEVEL[role]; d = prog[b % len(prog)]
        in_sec = 0 if role != prev else in_sec + 1; prev = role
        nxt = role_at(min(t0 + bar + beat, dur - 0.01)); ch = chord(d)
        if role == "outro":
            if in_sec == 0:
                for k in chord(0) + [deg(0, 1)]: note(t0, bar * 2, 0, k + 12, 62)
                for k in chord(0): note(t0, bar * 2, 3, k + 12, 50)
                note(t0, bar * 2, 1, deg(0, -1), 70)
            continue
        # 和声乐器
        if role == "suspense":
            for q in range(4): note(t0 + q * beat, beat * 0.5, 0, ch[q % 3] + 24, 46)
            for k in [ch[0], ch[2], deg(d + 1, 1)]: note(t0, bar * 0.98, 3, k + 12, 44)
            note(t0, bar * 0.98, 1, deg(prog[0], -1), 52)
        else:
            if cfg["feel"] == "stab":
                for pos in stab:
                    for k in ch: note(t0 + swing(pos) * beat, beat * 0.42, 0, k + 12, 66 * lv)
            elif cfg["feel"] == "ostinato":
                for i in range(8): note(t0 + i * beat / 2, beat * 0.4, 0, [ch[0], ch[2], ch[1], ch[2]][i % 4] + (0 if i % 4 else 12), 70 * lv)
            else:
                order = [0, 1, 2, 1, 0, 2, 1, 2]
                for i in range(8): note(t0 + i * beat / 2, beat * 0.9, 0, ch[order[i]] + 12 + (12 if i in (2, 5) else 0), 60 * lv)
            # 低音
            for pos, k in ([(0, 0), (1.5, 0), (2.5, 7), (3, 0)] if role in ("reveal", "cta") and cfg["feel"] != "arp" else [(0, 0), (2.5, 0)] if role == "build" else [(0, 0)]):
                note(t0 + swing(pos) * beat, beat * (0.9 if pos else 1.4), 1, deg(d, -1) + k, 86 * lv)
            if role in ("reveal", "cta"):
                for k in ch: note(t0, bar * 0.98, 3, k + 12, 46)
            # 旋律：只在铺垫、揭晓、转化段出现，给人声让位置
            if role in ("build", "reveal", "cta") and in_sec >= (1 if role == "build" else 0):
                up = 2 if role != "build" else 1
                for pos, s in (motif_a if in_sec % 2 == 0 else motif_b):
                    note(t0 + swing(pos) * beat, beat * 0.55, 2, pent(s, up), (58 if role == "build" else 72))
        # 鼓
        K, S, HH, OH, RIM, CR, TOM = 36, 38, 42, 46, 37, 49, 45
        if role == "suspense":
            for q in (1, 3): note(t0 + q * beat, 0.1, 9, RIM, 40, 0.003)
            for q in range(4): note(t0 + q * beat, 0.1, 9, HH, 30, 0.003)
        elif cfg["drum"] == "soft":
            note(t0, 0.1, 9, K, 70 * lv, 0.003); note(t0 + 2.5 * beat, 0.1, 9, K, 50 * lv, 0.003)
            for q in (1, 3): note(t0 + q * beat, 0.1, 9, RIM, 55 * lv, 0.003)
            for i in range(8): note(t0 + i * beat / 2, 0.1, 9, HH, (44 if i % 2 == 0 else 28) * lv, 0.004)
        else:
            kicks = [0, 2] if role == "hook" else ([0, 1.5, 2.5] if cfg["drum"] == "tom" else [0, 2, 2.5])
            for pos in kicks: note(t0 + pos * beat, 0.1, 9, K, 96 * lv, 0.003)
            if role != "hook":
                for q in ([3] if cfg["drum"] == "tom" else [1, 3]): note(t0 + q * beat, 0.1, 9, S, 84 * lv, 0.003)
            for i in range(8): note(t0 + swing(i / 2) * beat, 0.1, 9, HH, (58 if i % 2 == 0 else 36) * lv, 0.004)
            if role in ("reveal", "cta"): note(t0 + 3.5 * beat, 0.3, 9, OH, 52, 0.003)
            if cfg["drum"] == "tom" and role != "hook":
                for i in (6, 7): note(t0 + i * beat / 2, 0.2, 9, TOM - 2 * (i - 6), 70 * lv, 0.003)
        # 换段前的过门：小军鼓渐强
        if nxt != role and nxt in ("build", "reveal", "cta") and role != "outro":
            for i in range(8): note(t0 + 3 * beat + i * beat / 8, 0.08, 9, S, 28 + i * 6, 0.002)
    # 对准画面转场的重音：揭晓和转化落在切点上，悬念开始时一声低音
    for a, _, role in sections:
        if role in ("reveal", "cta") and a > 0:
            note(a, 1.5, 9, CR, 112, 0); note(a, 0.2, 9, K, 118, 0)
            for k in chord(prog[0]): note(a, beat * 1.5, 0, k + 12, 100, 0)
            note(a, beat * 2, 1, deg(prog[0], -1), 110, 0)
        elif role == "suspense":
            note(a, 1.0, 9, 41, 84, 0); note(a, beat * 3, 1, deg(prog[0], -2) + 12, 70, 0)
        elif role == "outro":
            note(a, 2.0, 9, CR, 70, 0)
    return ev

def _render(events, plan, dur):
    import tinysoundfont
    if not SOUNDFONT.is_file():
        raise FileNotFoundError(f"缺少音色库：{SOUNDFONT}")
    pal = MOODS[plan["mood"]]["palettes"][plan["palette"]]
    syn = tinysoundfont.Synth(samplerate=SR); sf = syn.sfload(str(SOUNDFONT))
    for ch, prog in ((0, pal["keys"]), (1, pal["bass"]), (2, pal["lead"]), (3, pal["pad"])):
        syn.program_select(ch, sf, 0, prog)
    try: syn.program_select(9, sf, 128, pal["kit"], True)
    except Exception: syn.program_select(9, sf, 128, 0, True)
    acts = []
    for t, length, ch, k, vel in events:
        acts.append((t, 1, ch, k, vel)); acts.append((t + length, 0, ch, k, 0))
    acts.sort(key=lambda a: (a[0], a[1])); n = int(round(dur * SR)); out = np.zeros((n, 2), np.float32); pos = 0
    for t, on, ch, k, vel in acts:
        i = min(n, int(t * SR))
        if i > pos:
            out[pos:i] = np.frombuffer(syn.generate(i - pos), np.float32).reshape(-1, 2); pos = i
        (syn.noteon(ch, k, vel) if on else syn.noteoff(ch, k))
    if pos < n: out[pos:] = np.frombuffer(syn.generate(n - pos), np.float32).reshape(-1, 2)
    return out

def _room(x, seed):
    """一点房间混响，让采样乐器不那么干"""
    rng = np.random.default_rng(seed); m = int(1.1 * SR); t = np.arange(m) / SR
    ir = rng.standard_normal((m, 2)) * np.exp(-t / 0.28)[:, None]; ir[: int(0.012 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum(axis=0))
    wet = np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in (0, 1)], axis=1)
    return x + 0.16 * wet

def compose(timeline: dict, sections: list, mood: str, seed: int) -> np.ndarray:
    if mood not in MOODS: mood = "upbeat"
    plan = plan_music(timeline, mood, seed); dur = float(timeline["dur"])
    x = _room(_render(_events(timeline, sections, plan), plan, dur).astype(np.float64), seed)
    x *= 0.1 / (np.sqrt((x ** 2).mean()) or 1.0)
    peak = np.abs(x).max()
    if peak > 0.95: x *= 0.95 / peak
    return x.astype(np.float32)
