import pytest
import report

HEAD = "编号,播放,完播率,点赞,收藏,涨粉\n"

def _w(tmp_path, body, head=HEAD):
    f = tmp_path / "m.csv"; f.write_text(head + body, encoding="utf-8-sig"); return f

HIST = [{"id": f"v{i}", "structure": "A" if i < 3 else "B", "mid_hook": "steps", "theme": "paper"} for i in range(5)]
SCRIPTS = {f"v{i}": {"tags": ["#电商运营", "#上架"] if i % 2 else ["#电商运营"]} for i in range(5)}

def test_load_ok_with_spaces_and_percent(tmp_path):
    f = _w(tmp_path, " v0 , \"1,200\", 35% ,10,2,1\nv1,800,0.4,5,1,0\n\n")
    m = report.load_metrics(f)
    assert m["v0"] == {"播放": 1200, "完播率": 0.35, "点赞": 10, "收藏": 2, "涨粉": 1}
    assert m["v1"]["完播率"] == 0.4

def test_missing_column(tmp_path):
    with pytest.raises(ValueError) as e:
        report.load_metrics(_w(tmp_path, "v0,1,0.1,1,1\n", head="编号,播放,完播率,点赞,收藏\n"))
    assert "涨粉" in str(e.value)

def test_dirty_rows_named(tmp_path):
    with pytest.raises(ValueError) as e:
        report.load_metrics(_w(tmp_path, "v0,很多,0.1,1,1,1\nv1,10,0.1,1,1\nv2,10,0.1,1,1,1\n"))
    msg = str(e.value)
    assert "第 2 行" in msg and "第 3 行" in msg and "第 4 行" not in msg

def test_score_by_structure(tmp_path):
    m = report.load_metrics(_w(tmp_path, "".join(f"v{i},{100*(i+1)},0.5,1,1,{i}\n" for i in range(5))))
    s = report.score_by("structure", m, HIST)
    assert s["A"]["n"] == 3 and s["A"]["播放"] == pytest.approx(200) and s["A"]["enough"]
    assert s["B"]["n"] == 2 and not s["B"]["enough"]

def test_score_by_tags(tmp_path):
    m = report.load_metrics(_w(tmp_path, "".join(f"v{i},100,0.5,1,1,1\n" for i in range(5))))
    s = report.score_by("tags", m, HIST, SCRIPTS)
    assert s["#电商运营"]["n"] == 5 and s["#上架"]["n"] == 2

def test_recommend_respects_recent_and_samples(tmp_path):
    m = report.load_metrics(_w(tmp_path, "".join(f"v{i},{100*(i+1)},0.5,1,1,{i}\n" for i in range(5))))
    assert report.recommend("structure", m, HIST, exclude=set()) == ["A"]          # B 样本不足
    assert report.recommend("structure", m, HIST, exclude={"A"}) == []
