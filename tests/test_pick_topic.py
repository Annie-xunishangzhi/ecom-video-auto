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
