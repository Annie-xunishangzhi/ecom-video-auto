import pytest
from pick_topic import load_history, pick, point_of, custom
def test_first_run_missing_history_is_empty(tmp_path):
    assert load_history(tmp_path/"nope.json") == []
def test_corrupt_history_is_empty(tmp_path):
    p = tmp_path/"h.json"; p.write_text("{not json", encoding="utf-8")
    assert load_history(p) == []
def test_non_list_history_is_empty(tmp_path):
    p = tmp_path/"h.json"; p.write_text('{"a":1}', encoding="utf-8")
    assert load_history(p) == []
STEPS = lambda topics: [t["step"] for t in topics if t.get("auto", True)]   # 参与自动轮换的大类
def test_pool_is_wide(topics):
    assert len(topics) >= 15 and sum(len(t["points"]) for t in topics) >= 60
    assert len({t["step"] for t in topics}) == len(topics)
def test_picks_least_recently_used_step(topics):
    *rest, last = STEPS(topics)
    assert pick(topics, [{"type":"product","step":s} for s in rest])["step"] == last
def test_never_made_step_wins_over_old_one(topics):
    assert pick(topics, [{"type":"product","step":4}])["step"] != 4
def _others(topics, step): return [{"type":"product","step":s} for s in STEPS(topics) if s != step]
def test_angle_rotates_within_step(topics):
    hist = [{"type":"product","step":4,"angle_index":0}] + _others(topics, 4)
    r = pick(topics, hist); assert (r["step"], r["angle_index"]) == (4, 1)
def test_angle_wraps_around(topics):
    n = len(next(t for t in topics if t["step"] == 4)["points"])
    hist = [{"type":"product","step":4,"angle_index":n - 1}] + _others(topics, 4)
    assert pick(topics, hist)["angle_index"] == 0
def test_custom_topic_in_history_does_not_break_rotation(topics):
    hist = [{"type":"product","step":4,"angle_index":1}, {"type":"product","step":4,"angle_index":None}] + _others(topics, 4)
    assert (pick(topics, hist)["step"], pick(topics, hist)["angle_index"]) == (4, 2)
def test_point_text_and_dict_with_own_pain():
    t = {"step": 1, "name": "x", "points": ["纯文字", {"point": "带痛点", "pain": ["p1"]}], "pain": ["大类痛点"]}
    assert point_of(t, 0) == ("纯文字", ["大类痛点"]) and point_of(t, 1) == ("带痛点", ["p1"]) and point_of(t, 2)[0] == "纯文字"
def test_every_point_is_usable(topics):
    for t in topics:
        for i in range(len(t["points"])):
            pt, pain = point_of(t, i); assert pt.strip() and pain
def test_auto_false_steps_are_skipped(topics):
    off = [t["step"] for t in topics if t.get("auto") is False]
    assert off and set(range(1, 9)) <= set(STEPS(topics))   # 主线 1–8 类在轮换里，后加的类先不进
    for i in range(30):
        assert pick(topics, [{"type":"product","step":s} for s in STEPS(topics)][:i % 8])["step"] not in off
def test_auto_false_step_still_usable_by_name(topics):
    assert custom(["x", "--topic", "退款预审", "--step", "9"], topics)["step"] == 9
def test_custom_topic(topics):
    r = custom(["x", "--topic", "退货地址自动核对", "--step", "9", "--pain", "地址填错，退货寄丢"], topics)
    assert r["custom"] and r["step"] == 9 and r["point"] == "退货地址自动核对" and r["pain"] == ["地址填错", "退货寄丢"] and r["angle_index"] is None
    r = custom(["x", "--topic", "跨境报关"], topics); assert r["step"] is None and r["name"] == "跨境报关"
def test_custom_topic_rejects_bad_input(topics):
    with pytest.raises(SystemExit): custom(["x", "--topic"], topics)
    with pytest.raises(SystemExit): custom(["x", "--topic", "a", "--step", "999"], topics)
def test_hot_disabled_always_product(topics):
    assert all(pick(topics, [{"type":"product","step":1}]*i)["type"]=="product" for i in range(12))
def test_hot_enabled_keeps_7_to_3(topics):
    assert pick(topics, [{"type":"product","step":1}]*7, hot_enabled=True)["type"] == "hot"
def test_hot_enabled_but_quota_met(topics):
    hist = [{"type":"hot","step":None}]*3 + [{"type":"product","step":1}]*7
    assert pick(topics, hist, hot_enabled=True)["type"] == "product"

import datetime
TODAY = datetime.date(2026, 11, 17)
def _hot(**kw):
    h = {"topic": "双11 AI 客服", "angle": "大促客服量暴涨，AI 接住了多少", "source_url": "https://example.com/news/1",
         "source_date": "2026-11-14", "relevant_to": "ecommerce", "used": False}
    h.update(kw); return h

def test_hot_ratio_about_30_percent(topics):
    hist, hot = [], [_hot(source_url=f"https://e.com/{i}") for i in range(10)]
    for _ in range(20):
        r = pick(topics, hist, hot_enabled=True, hot_items=hot, today=TODAY)
        hist.append({"type": r["type"], "step": r["step"]})
        if r["type"] == "hot": r["hot"]["used"] = True
    n = sum(1 for h in hist[-10:] if h["type"] == "hot")
    assert 2 <= n <= 3

def test_no_hot_items_falls_back_to_product(topics):
    hist = [{"type": "product", "step": 1}] * 7
    assert pick(topics, hist, hot_enabled=True, hot_items=[], today=TODAY)["type"] == "product"
    assert pick(topics, hist, hot_enabled=True, hot_items=[_hot(used=True)], today=TODAY)["type"] == "product"

@pytest.mark.parametrize("bad", [dict(relevant_to="sports"), dict(source_url=""), dict(source_url="不是链接"),
                                 dict(source_date="2026-11-01"), dict(source_date="坏日期"), dict(topic="")])
def test_invalid_hot_rejected(topics, bad):
    hist = [{"type": "product", "step": 1}] * 7
    assert pick(topics, hist, hot_enabled=True, hot_items=[_hot(**bad)], today=TODAY)["type"] == "product"

def test_hot_pick_returns_entry(topics):
    r = pick(topics, [{"type": "product", "step": 1}] * 7, hot_enabled=True, hot_items=[_hot()], today=TODAY)
    assert r["type"] == "hot" and r["hot"]["source_url"] == "https://example.com/news/1"
