import json
import pytest
import record_screen as rs

def test_args_whole_desktop(tmp_path):
    a = rs.ffmpeg_args(tmp_path / "r.mp4", None)
    i = a.index("-f"); assert a[i + 1] == "gdigrab"
    assert a[a.index("-i") + 1] == "desktop" and a[-1] == str(tmp_path / "r.mp4")
    assert "-framerate" in a and "libx264" in a

def test_args_one_window(tmp_path):
    a = rs.ffmpeg_args(tmp_path / "r.mp4", "拼多多商家后台 - Google Chrome")
    assert a[a.index("-i") + 1] == "title=拼多多商家后台 - Google Chrome"

def test_not_windows_message(tmp_path, monkeypatch):
    monkeypatch.setattr(rs.os, "name", "posix")
    with pytest.raises(rs.NotSupported) as e:
        rs.start(tmp_path / "r.mp4", None, step="s4", product="上架")
    assert "Windows" in str(e.value)

def test_marks_file_and_steps(tmp_path, monkeypatch):
    state = tmp_path / "r.rec.json"
    state.write_text(json.dumps({"out": str(tmp_path / "r.mp4"), "t0": 100.0, "pid": 1, "step": "s4"}), encoding="utf-8")
    clock = iter([103.0, 110.5, 125.0])
    monkeypatch.setattr(rs.time, "time", lambda: next(clock))
    rs.mark(state, "打开后台"); rs.mark(state, "批量填写"); rs.mark(state, "停在提交前")
    lines = (tmp_path / "r.marks.jsonl").read_text(encoding="utf-8").splitlines()
    assert [json.loads(l) for l in lines] == [{"name": "打开后台", "t": 3.0}, {"name": "批量填写", "t": 10.5}, {"name": "停在提交前", "t": 25.0}]
    assert rs.steps_from_marks(tmp_path / "r.marks.jsonl", 30.0) == [
        {"name": "打开后台", "start": 3.0, "end": 10.5}, {"name": "批量填写", "start": 10.5, "end": 25.0}, {"name": "停在提交前", "start": 25.0, "end": 30.0}]

def test_steps_from_missing_marks(tmp_path):
    assert rs.steps_from_marks(tmp_path / "none.jsonl", 10.0) == []

def test_hl_mark(tmp_path):
    f = tmp_path / "m.jsonl"; f.write_text('{"name":"批量填写","t":1.0,"hl":"hook"}\n', encoding="utf-8")
    assert rs.steps_from_marks(f, 5.0)[0]["hl"] == "hook"

def test_absolute_marks_written_by_agent(tmp_path):
    f = tmp_path / "m.jsonl"
    f.write_text('{"name":"b","at":1010.0}\n{"name":"a","at":1002.5}\n{"name":"late","at":5000}\n', encoding="utf-8")
    assert rs.steps_from_marks(f, 20.0, t0=1000.0) == [{"name": "a", "start": 2.5, "end": 10.0}, {"name": "b", "start": 10.0, "end": 20.0}]
