import copy, json, pytest
from script_check import check, estimate_seconds, CPS
@pytest.fixture
def ok(fx): return json.loads((fx/"script_ok.json").read_text(encoding="utf-8"))
@pytest.fixture
def hist(): return []
def has(probs, word): return any(word in p for p in probs)
def test_ok_script_passes(ok, hist): assert check(ok, hist) == []
def test_estimate_in_range(ok): assert 30 <= estimate_seconds(ok) <= 55 and CPS == 4.2
def test_duration_too_long(ok, hist):
    ok["scenes"][2]["vo"] = "字"*400; assert has(check(ok, hist), "时长")
def test_duration_too_short(ok, hist):
    for s in ok["scenes"]: s["vo"] = "短"
    assert has(check(ok, hist), "时长")
@pytest.mark.parametrize("bad", ["必定","保证","100%","稳赚","暴利","加微信","加V","vx","微信号","不关注就"])
def test_banned_phrase(ok, hist, bad):
    ok["scenes"][2]["vo"] += bad; assert has(check(ok, hist), bad)
def test_banned_phrase_in_onscreen_text(ok, hist):
    ok["scenes"][2]["line1"] = "营业额必定翻倍"; assert has(check(ok, hist), "必定")
def test_first_scene_must_be_hook(ok, hist):
    ok["scenes"][0]["type"] = "statement"; assert has(check(ok, hist), "开头")
def test_mid_hook_required(ok, hist):
    del ok["scenes"][3]["mid_hook"]; assert has(check(ok, hist), "中段钩子")
def test_mid_hook_position(ok, hist):
    del ok["scenes"][3]["mid_hook"]; ok["scenes"][0]["mid_hook"] = True; assert has(check(ok, hist), "中段钩子")
def test_suspense_needs_payoff(ok, hist):
    del ok["scenes"][5]["payoff"]; assert has(check(ok, hist), "揭晓")
def test_last_content_scene_is_cta(ok, hist):
    ok["scenes"][-1]["type"] = "statement"; assert has(check(ok, hist), "转化")
def test_mascot_at_least_twice(ok, hist):
    del ok["scenes"][0]["mascot"]; assert has(check(ok, hist), "企鹅")
def test_mascot_in_cta(ok, hist):
    ok["scenes"][2]["mascot"] = ok["scenes"][-1].pop("mascot"); assert has(check(ok, hist), "企鹅")
def test_images_one_or_two(ok, hist):
    ok["images"] = []; assert has(check(ok, hist), "配图")
    ok["images"] = [{"scene":0,"prompt":"a"}]*3; assert has(check(ok, hist), "配图")
def test_footage_at_most_one_third(ok, hist):
    ok["scenes"][2]["type"] = "footage"; ok["scenes"][2]["slot"] = "mid"; ok["scenes"][5]["type"]="footage"
    assert has(check(ok, hist), "录屏")
def test_unknown_ids(ok, hist):
    ok["structure"] = "nope"; ok["theme"] = "neon"; ok["mood"] = "sad"; ok["mid_hook"]="x"
    p = check(ok, hist); assert has(p,"结构") and has(p,"主题") and has(p,"情绪") and has(p,"钩子")
def test_unknown_scene_type(ok, hist):
    ok["scenes"][2]["type"] = "hologram"; assert has(check(ok, hist), "hologram")
def test_structure_not_in_last_5(ok):
    assert has(check(ok, [{"structure":"contrast-then-suspense","mid_hook":"pitfall"}]), "结构")
def test_structure_older_than_5_is_fine(ok):
    h = [{"structure":"contrast-then-suspense","mid_hook":"x"}] + [{"structure":f"s{i}","mid_hook":"x"} for i in range(5)]
    assert check(ok, h) == []
def test_mid_hook_style_not_in_last_3(ok):
    assert has(check(ok, [{"structure":"a","mid_hook":"steps"}]), "钩子")
def test_skipped_skill_rules(ok, hist):
    ok["skill"]["provided"] = False
    ok["scenes"][2]["vo"] = "实测十分钟上架一千个"
    probs = check(ok, hist)
    assert has(probs,"实测") and has(probs,"数字") and has(probs,"上线")
def test_skipped_skill_ok_when_rules_followed(ok, hist):
    ok["skill"]["provided"] = False
    ok["scenes"][-1]["vo"] = "这个上架助手马上上线，免费送，关注我，上线第一时间发你，评论区发上架。"
    assert check(ok, hist) == []
def test_manual_side_estimate_allowed_when_skipped(ok, hist):
    ok["skill"]["provided"] = False
    ok["scenes"][-1]["vo"] = "这个上架助手马上上线，免费送，关注我，上线第一时间发你，评论区发上架。"
    ok["scenes"][0]["vo"] = "一千个商品要上架，人工一个个填，几个人要忙三天。"
    assert check(ok, hist) == []
def test_douyin_cta_no_offsite(ok, hist):
    ok["scenes"][-1]["vo"] += "也可以来公众号找我"; assert has(check(ok, hist), "站外")
def test_channels_cta_may_mention_gzh(ok, hist):
    ok["cta"]["platform"] = "channels"; ok["scenes"][-1]["vo"] = "这个上架助手免费送，关注我，公众号回复上架两个字就能领。"
    assert check(ok, hist) == []
def test_tags_three_to_five(ok, hist):
    ok["tags"] = ["#a"]; assert has(check(ok, hist), "话题")

def test_mascot_hop_must_be_list_of_times():
    import json, copy
    from pathlib import Path
    s = json.loads((Path(__file__).parent / "fixtures" / "script_ok.json").read_text(encoding="utf-8"))
    s["scenes"][-1]["mascot"]["hop"] = True
    assert any("hop" in p for p in check(s, []))
