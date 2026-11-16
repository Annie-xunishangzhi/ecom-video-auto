import pytest
from read_skill import load_skill, SkillNotFound
def test_none_means_skipped(topic4):
    r = load_skill(None, topic4); assert r["provided"] is False and r["points"] == topic4["points"] and r["step"] == 4
def test_blank_string_means_skipped(topic4):
    assert load_skill("   ", topic4)["provided"] is False
def test_reads_frontmatter(fx, topic4):
    r = load_skill(str(fx/"skill_ok"), topic4)
    assert r["provided"] and r["name"] == "pdd-publish-assistant" and len(r["points"]) >= 2
    assert "拼多多" in r["summary"]
def test_accepts_file_path(fx, topic4):
    assert load_skill(str(fx/"skill_ok"/"SKILL.md"), topic4)["name"] == "pdd-publish-assistant"
def test_falls_back_to_readme(fx, topic2):
    r = load_skill(str(fx/"tool_readme"), topic2)
    assert r["name"] == "商品资料整理与检查" and "本地运行" in r["summary"]
def test_missing_path_raises(topic4):
    with pytest.raises(SkillNotFound) as e: load_skill("D:/不存在/的 路径", topic4)
    assert "不存在" in str(e.value)
def test_dir_without_docs_raises(tmp_path, topic4):
    with pytest.raises(SkillNotFound): load_skill(str(tmp_path), topic4)
def test_cjk_space_path(tmp_path, fx, topic4):
    d = tmp_path/"我的 技能"; d.mkdir(); (d/"SKILL.md").write_text((fx/"skill_ok"/"SKILL.md").read_text(encoding="utf-8"), encoding="utf-8")
    assert load_skill(str(d), topic4)["provided"]
