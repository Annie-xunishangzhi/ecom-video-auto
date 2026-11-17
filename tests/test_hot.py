import copy, json
import pytest
from script_check import check

@pytest.fixture
def hot(fx):
    s = json.loads((fx / "script_ok.json").read_text(encoding="utf-8"))
    s.update(type="hot", step=None, skill={"provided": False},
             hot={"topic": "双11 客服量暴涨", "source_url": "https://example.com/n/1", "source_date": "2026-11-14", "relevant_to": "ecommerce"})
    s["scenes"][2]["vo"] = "大促一来客服忙不过来，这正是电商自动化最该接手的地方，标题类目规格价格库存都一样。"
    s["scenes"][-1]["vo"] = "关注我，电商自动化工具陆续免费送，上线第一时间发你，评论区发上架。"
    for sc in s["scenes"]:
        if sc["type"] == "footage": sc["type"] = "statement"; sc.update(line1=sc.pop("line"), line2="")
    return s

def has(P, w): return any(w in p for p in P)

def test_hot_ok(hot):
    assert check(hot, []) == []

def test_hot_must_land_on_ecom_automation(hot):
    for sc in hot["scenes"]: sc["vo"] = sc["vo"].replace("电商自动化", "这个")
    assert has(check(hot, []), "电商自动化")

def test_hot_needs_source(hot):
    hot["hot"]["source_url"] = ""
    assert has(check(hot, []), "来源")

def test_hot_unrelated_rejected(hot):
    hot["hot"]["relevant_to"] = "sports"
    assert has(check(hot, []), "电商")

def test_hot_still_needs_hooks_and_cta(hot):
    hot["scenes"][-1]["type"] = "statement"
    assert has(check(hot, []), "转化")

def test_mark_hot_used(tmp_path):
    import make
    f = tmp_path / "hot.json"; f.write_text(json.dumps([{"source_url": "https://a"}, {"source_url": "https://b"}]), encoding="utf-8")
    make.mark_hot_used("https://b", f)
    assert [h.get("used") for h in json.loads(f.read_text(encoding="utf-8"))] == [None, True]
