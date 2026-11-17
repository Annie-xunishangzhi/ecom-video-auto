import json, sys
from pathlib import Path
import pytest
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "research"))
import digest

def _it(url, kw, likes=0, comments=0, shares=0, saves=0, tags=()):
    return {"platform": "douyin", "keyword": kw, "url": url, "title": "t", "likes": likes, "comments": comments,
            "shares": shares, "saves": saves, "tags": list(tags)}

def test_rank_sorts_and_dedupes():
    items = [_it("u1", "k", likes=10), _it("u2", "k", likes=500), _it("u1", "k2", likes=10), _it("u3", "k", likes=100, shares=200)]
    r = digest.rank(items)
    assert [x["url"] for x in r] == ["u3", "u2", "u1"]

def test_tag_stats_and_layers(topics):
    kw = "商品上架"
    items = [_it(f"u{i}", kw, tags=["电商运营", "拼多多运营", "商品上架", "拼多多批量上架技巧"]) for i in range(6)]
    items += [_it(f"v{i}", kw, tags=["电商运营", "店铺运营", "上架神器一键搞定"]) for i in range(3)]
    st = digest.tag_stats(items, topics)
    layers = digest.layer(st[4])
    assert layers["core"] == ["#电商运营"]
    assert len(layers["scene"]) == 2 and "#电商运营" not in layers["scene"]
    assert 1 <= len(layers["long"]) <= 2 and all(len(t) >= 6 for t in layers["long"])
    assert not set(layers["core"]) & set(layers["scene"]) & set(layers["long"])

def test_unknown_keyword_ignored(topics):
    assert digest.tag_stats([_it("u", "不相关的词", tags=["x"])], topics) == {}

def test_write_tags(tmp_path, topics):
    items = [_it(f"u{i}", "商品上架", tags=["电商运营", "拼多多运营", "商品上架", "拼多多批量上架技巧"]) for i in range(3)]
    f = tmp_path / "tags.json"
    digest.write_tags(digest.tag_stats(items, topics), f)
    d = json.loads(f.read_text(encoding="utf-8"))
    assert d["4"]["core"] and "#电商自动化" in d["common"]

def test_unapproved_proposals_not_merged():
    props = [{"kind": "structure", "id": "new-a", "desc": "d", "scene_types": ["photo", "cta"], "approved": False},
             {"kind": "hook", "id": "new-h", "how": "h", "approved": True},
             {"kind": "structure", "id": "new-b", "desc": "d", "scene_types": ["photo", "cta"]}]
    s, h, left = digest.merge_proposals(props, [{"id": "old"}], [{"id": "oldh"}])
    assert [x["id"] for x in s] == ["old"] and [x["id"] for x in h] == ["oldh", "new-h"]
    assert [p["id"] for p in left] == ["new-a", "new-b"]
    assert "approved" not in h[-1] and "kind" not in h[-1]

def test_duplicate_proposal_id_rejected():
    s, h, left = digest.merge_proposals([{"kind": "hook", "id": "oldh", "how": "x", "approved": True}], [], [{"id": "oldh"}])
    assert h == [{"id": "oldh"}] and left[0]["id"] == "oldh"

def test_script_tags_must_come_from_tags_json(tmp_path):
    from script_check import tag_problems
    f = tmp_path / "tags.json"
    assert tag_problems({"step": 4, "tags": ["#随便"]}, f) == []          # 没有词库时跳过
    f.write_text(json.dumps({"common": ["#电商自动化"], "4": {"core": ["#电商运营"], "scene": ["#拼多多运营", "#商品上架"], "long": ["#拼多多批量上架技巧"]}}, ensure_ascii=False), encoding="utf-8")
    assert tag_problems({"step": 4, "tags": ["#电商自动化", "#电商运营", "#商品上架"]}, f) == []
    assert "#随便" in tag_problems({"step": 4, "tags": ["#电商运营", "#随便"]}, f)[0]
    assert tag_problems({"step": 7, "tags": ["#随便"]}, f) == []          # 这一步还没调研
