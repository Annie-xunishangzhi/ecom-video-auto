REQUIRED = ["SKILL.md","AGENTS.md",".claude/skills/ecom-video/SKILL.md",
            ".agents/skills/ecom-video/SKILL.md","engine/index.html","engine/engine.js",
            "pipeline/render.js","pipeline/shots.js","requirements.txt","package.json"]
def test_required_files_exist(root):
    assert [p for p in REQUIRED if not (root/p).exists()] == []
def test_entries_point_to_root_skill(root):
    for e in [".claude/skills/ecom-video/SKILL.md",".agents/skills/ecom-video/SKILL.md"]:
        assert "../../../SKILL.md" in (root/e).read_text(encoding="utf-8")
