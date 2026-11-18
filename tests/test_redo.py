import json, sys
from pathlib import Path
import pytest
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools")); sys.path.insert(0, str(ROOT / "pipeline"))
import redo, make


def _setup(tmp):
    (tmp / "out" / "b").mkdir(parents=True); (tmp / "out" / "b" / "script.json").write_text("{}", encoding="utf-8")
    h = tmp / "history.json"; h.write_text(json.dumps([{"id": "a"}, {"id": "b", "old": 1}, {"id": "c"}]), encoding="utf-8")
    return h


def test_redo_keeps_position_and_checks_against_earlier_history(tmp_path, monkeypatch):
    h = _setup(tmp_path); seen = {}
    def fake_run(path, footage, backend, reuse_voice, check_history, allow_still):
        seen.update(footage=footage, reuse=reuse_voice, hist=[x["id"] for x in check_history])
        now = json.loads(h.read_text(encoding="utf-8")); now.append({"id": "b", "new": 1}); h.write_text(json.dumps(now), encoding="utf-8")
        return path.parent / "b.mp4"
    monkeypatch.setattr(make, "run", fake_run)
    redo.redo("b", tmp_path, h)
    assert seen == {"footage": ["auto"], "reuse": True, "hist": ["a"]}
    assert json.loads(h.read_text(encoding="utf-8")) == [{"id": "a"}, {"id": "b", "new": 1}, {"id": "c"}]


def test_redo_failure_restores_history(tmp_path, monkeypatch):
    h = _setup(tmp_path); before = h.read_text(encoding="utf-8")
    def boom(*a, **k): raise make.Stop("画面运动检查没通过")
    monkeypatch.setattr(make, "run", boom)
    with pytest.raises(SystemExit, match="画面运动"):
        redo.redo("b", tmp_path, h)
    assert h.read_text(encoding="utf-8") == before
