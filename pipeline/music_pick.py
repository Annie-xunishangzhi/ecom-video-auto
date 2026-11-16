"""选曲：按情绪选，避开最近用过的；并算出让转场落在节拍上的起播偏移。"""
import numpy as np

def pick(library: list, mood: str, history: list, window: int = 10) -> dict:
    if not library:
        raise ValueError("曲库是空的，先用 tools/add_track.py 入库")
    pool = [t for t in library if t.get("mood") == mood] or list(library)
    last_used = {h.get("track"): i for i, h in enumerate(history) if h.get("track")}
    recent = {h.get("track") for h in history[-window:]} if window > 0 else set()
    fresh = [t for t in pool if t["id"] not in recent]
    # 没被排除的里面选最久没用的；全被排除时同样按最久没用的放宽
    return min(fresh or pool, key=lambda t: (last_used.get(t["id"], -1), t["id"]))

def best_offset(cuts: list, bpm: float, first_beat: float) -> float:
    """视频时刻 t 对应曲子的 t+offset。返回一拍以内、使各转场点离节拍最近的 offset。"""
    if not cuts or not bpm:
        return 0.0
    beat = 60.0 / bpm; cuts = np.asarray(cuts, dtype=float)
    cands = np.arange(0, beat, 0.005)
    def cost(off):
        d = (cuts + off - first_beat) % beat
        return float(np.minimum(d, beat - d).sum())
    return round(float(min(cands, key=cost)), 3)
