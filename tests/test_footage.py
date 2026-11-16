import pytest
from footage import extract, placeholder
@pytest.fixture
def clip(fx): return fx/"clip.mp4"
def test_extract_frame_count(tmp_path, clip):
    r = extract(clip, tmp_path/"f", start=0, dur=2.0, speed=4.0)
    assert r["n"] == 15 and (tmp_path/"f"/"0000.jpg").exists() and (tmp_path/"f"/"0014.jpg").exists()
    assert not (tmp_path/"f"/"0015.jpg").exists() and r["seconds"] == 0.5 and r["speed"] == 4.0
def test_extract_out_of_range_raises(tmp_path, clip):
    with pytest.raises(ValueError): extract(clip, tmp_path/"f", start=5, dur=2)
def test_extract_missing_clip_raises(tmp_path):
    with pytest.raises(FileNotFoundError): extract(tmp_path/"no.mp4", tmp_path/"f", 0, 1)
def test_extract_clears_old_frames(tmp_path, clip):
    extract(clip, tmp_path/"f", 0, 2.0, speed=1.0)
    assert extract(clip, tmp_path/"f", 0, 2.0, speed=4.0)["n"] == 15 and not (tmp_path/"f"/"0020.jpg").exists()
def test_cjk_space_paths(tmp_path, clip):
    d = tmp_path/"实录 帧"; assert extract(clip, d, 0, 1.0, speed=2.0)["n"] == 15
def test_placeholder_has_no_frames(): assert placeholder() == {"frames": None, "n": 0}
