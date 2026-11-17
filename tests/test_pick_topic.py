import pytest
from pick_topic import load_history, pick
def test_first_run_missing_history_is_empty(tmp_path):
    assert load_history(tmp_path/"nope.json") == []
def test_corrupt_history_is_empty(tmp_path):
    p = tmp_path/"h.json"; p.write_text("{not json", encoding="utf-8")
    assert load_history(p) == []
def test_non_list_history_is_empty(tmp_path):
    p = tmp_path/"h.json"; p.write_text('{"a":1}', encoding="utf-8")
    assert load_history(p) == []
def test_picks_least_recently_used_step(topics):
    hist = [{"type":"product","step":s} for s in [1,2,3,4,5,6,7]]
    assert pick(topics, hist)["step"] == 8
def test_never_made_step_wins_over_old_one(topics):
    assert pick(topics, [{"type":"product","step":4}])["step"] in {1,2,3,5,6,7,8}
def test_angle_rotates_within_step(topics):
    hist = [{"type":"product","step":4,"angle_index":0}] + [{"type":"product","step":s} for s in [1,2,3,5,6,7,8]]
    r = pick(topics, hist); assert (r["step"], r["angle_index"]) == (4, 1)
def test_angle_wraps_around(topics):
    hist = [{"type":"product","step":4,"angle_index":2}] + [{"type":"product","step":s} for s in [1,2,3,5,6,7,8]]
    assert pick(topics, hist)["angle_index"] == 0
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
