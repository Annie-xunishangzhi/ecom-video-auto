import copy, json
import pytest
from dedupe import check, similarity, load_history_scripts

@pytest.fixture
def a(fx): return json.loads((fx / "script_ok.json").read_text(encoding="utf-8"))

def _different(a):
    b = copy.deepcopy(a)
    b.update(id="other", structure="zzz-structure", mid_hook="zzz-hook", title="完全不同的标题写法")
    for i, sc in enumerate(b["scenes"]):
        if sc.get("vo"): sc["vo"] = f"另一段毫无关系的话术第{i}句，讲选品数据和报表汇总"
    b["scenes"] = [b["scenes"][-1]] + list(reversed(b["scenes"][:-1]))
    return b

def test_identical_is_one(a):
    assert similarity(a, copy.deepcopy(a)) == pytest.approx(1.0)

def test_only_theme_changed_still_blocked(a):
    b = copy.deepcopy(a); b["id"] = "b"; b["theme"] = "ink" if a["theme"] != "ink" else "paper"
    assert similarity(a, b) > 0.6
    probs = check(a, [b])
    assert probs and "b" in probs[0]

def test_different_passes(a):
    b = _different(a)
    assert similarity(a, b) < 0.6
    assert check(a, [b]) == []

def test_window_only_last_n(a):
    same = copy.deepcopy(a); same["id"] = "old"
    others = [dict(_different(a), id=f"o{i}") for i in range(10)]
    assert check(a, [same] + others, window=10) == []
    assert check(a, [same] + others[:3], window=10)

def test_short_history_ok(a):
    assert check(a, []) == []
    assert check(a, [_different(a)]) == []

def test_message_says_where(a):
    b = copy.deepcopy(a); b["id"] = "b"
    msg = check(a, [b])[0]
    assert "结构" in msg and "文案" in msg

def test_load_history_scripts(tmp_path, a):
    for vid in ("x1", "x2"):
        d = tmp_path / "out" / vid; d.mkdir(parents=True)
        (d / "script.json").write_text(json.dumps(dict(a, id=vid), ensure_ascii=False), encoding="utf-8")
    hist = [{"id": "x1"}, {"id": "gone"}, {"id": "x2"}, {"id": "me"}]
    got = load_history_scripts(hist, tmp_path / "out", exclude="me")
    assert [s["id"] for s in got] == ["x1", "x2"]
