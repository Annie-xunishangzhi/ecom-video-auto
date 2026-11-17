import json, sys
from pathlib import Path
import pytest
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "research"))
import collect
from collect import EmptyResult, NeedsHuman, items_from_payloads, keywords, parse_count

@pytest.mark.parametrize("s,v", [("1.2万", 12000), ("3w+", 30000), ("3W", 30000), ("10万+", 100000), ("1,024", 1024), ("1.5k", 1500),
                                 ("2亿", 200000000), ("356", 356), (42, 42), ("", 0), (None, 0), ("赞", 0)])
def test_parse_count(s, v):
    assert parse_count(s) == v

@pytest.fixture
def R(fx): return fx / "research"

def _load(R, name): return json.loads((R / name).read_text(encoding="utf-8"))

def test_douyin_parse(R):
    items = items_from_payloads("douyin", "商品上架", [_load(R, "douyin_search.json")], limit=30)
    assert len(items) == 2
    a = items[0]
    assert a["url"] == "https://www.douyin.com/video/7300000000000000001" and a["likes"] == 12000 and a["saves"] == 2100
    assert a["duration_s"] == 38.5 and a["tags"] == ["电商运营", "拼多多运营", "AI工具"] and a["music"] == "@某某创作的原声"
    assert a["platform"] == "douyin" and a["keyword"] == "商品上架" and a["collected_at"]

def test_xhs_parse(R):
    items = items_from_payloads("xhs", "上架", [_load(R, "xhs_search.json")], limit=30)
    assert [i["likes"] for i in items] == [12000, 88]
    assert items[0]["saves"] == 30000 and items[0]["shares"] == 1024 and items[1]["saves"] == 100000
    assert items[0]["url"].startswith("https://www.xiaohongshu.com/explore/6650000000000000000a")

def test_dedup_and_limit(R):
    p = _load(R, "douyin_search.json")
    assert len(items_from_payloads("douyin", "k", [p, p], limit=30)) == 2
    assert len(items_from_payloads("douyin", "k", [p], limit=1)) == 1

def test_zero_items_is_error():
    with pytest.raises(EmptyResult):
        items_from_payloads("douyin", "k", [{"data": []}], limit=30)
    with pytest.raises(EmptyResult):
        items_from_payloads("xhs", "k", [{"data": {"items": [{"model_type": "hot_query"}]}}], limit=30)

def test_limit_capped_at_30(R):
    p = _load(R, "douyin_search.json")
    many = {"data": [dict(p["data"][0], aweme_info=dict(p["data"][0]["aweme_info"], aweme_id=str(i))) for i in range(50)]}
    assert len(items_from_payloads("douyin", "k", [many], limit=100)) == 30

@pytest.mark.parametrize("url,text", [("https://www.douyin.com/login?x", ""), ("https://www.xiaohongshu.com/x", "请完成安全验证"),
                                      ("https://www.douyin.com/search/x", "验证码")])
def test_needs_human(url, text):
    with pytest.raises(NeedsHuman):
        collect.guard_page(url, text)

def test_guard_ok():
    collect.guard_page("https://www.douyin.com/search/商品上架", "搜索结果 综合 视频")

def test_keywords(topics):
    ks = keywords(topics)
    assert "商品上架" in ks and "一个个翻竞品价格" in ks and len(ks) == len(set(ks))
