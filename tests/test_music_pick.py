import pytest
from music_pick import pick, best_offset
@pytest.fixture
def lib(): return [{"id":"u1","mood":"upbeat"},{"id":"u2","mood":"upbeat"},{"id":"u3","mood":"upbeat"},{"id":"c1","mood":"calm"}]
def test_excludes_recent_tracks(lib):
    assert pick(lib, "upbeat", [{"track":"u1"},{"track":"u2"}])["id"] == "u3"
def test_relaxes_to_oldest_when_all_used(lib):
    assert pick(lib, "upbeat", [{"track":"u3"},{"track":"u2"},{"track":"u1"}])["id"] == "u3"
def test_prefers_never_used(lib):
    assert pick(lib, "upbeat", [{"track":"u2"}])["id"] in {"u1","u3"}
def test_window_limits_exclusion(lib):
    assert pick(lib, "upbeat", [{"track":"u1"},{"track":"u2"},{"track":"u3"}], window=1)["id"] == "u1"
def test_unknown_mood_falls_back_to_whole_library(lib):
    assert pick(lib, "nope", [])["id"] in {"u1","u2","u3","c1"}
def test_empty_library_raises():
    with pytest.raises(ValueError): pick([], "upbeat", [])
def test_best_offset_aligns_cuts():
    assert abs(best_offset([4.25, 9.25, 14.75], 120, 0.0) - 0.25) < 0.02
def test_best_offset_respects_first_beat():
    assert abs(best_offset([4.0, 9.0], 120, 0.1) - 0.1) < 0.02
def test_best_offset_no_cuts(): assert best_offset([], 120, 0.0) == 0.0
