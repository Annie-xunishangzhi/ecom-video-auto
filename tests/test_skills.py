import json, sys
from pathlib import Path
import pytest
import skills as SK
from pick_topic import pick

TOPICS = [{"step": s, "name": n, "points": ["a"], "pain": ["p"], "skill_path": None} for s, n in
          [(1, "选品与控价"), (2, "商品基础信息维护"), (3, "素材生产"), (4, "商品上架")]] + \
         [{"step": 9, "name": "售后与退款", "auto": False, "points": ["a"], "pain": ["p"], "skill_path": None}]


def _skill(d: Path, name="pdd-helper", desc="拼多多商品上架：按资料自动填写商品信息，提交前停下确认") -> Path:
    d.mkdir(parents=True, exist_ok=True)
    (d / "SKILL.md").write_text(f"---\nname: {name}\ndescription: {desc}\n---\n\n# {name}\n", encoding="utf-8")
    return d


def _pack(root: Path, step: int, review: str):
    d = root / "assets" / "footage" / f"s{step}"; d.mkdir(parents=True, exist_ok=True)
    (d / "pack.json").write_text(json.dumps({"review": review}), encoding="utf-8")


def test_registry_roundtrip_and_bad_files(tmp_path):
    f = tmp_path / "r.json"
    assert SK.load_registry(f) == {}
    SK.save_registry({4: {"path": "x", "name": "n"}}, f)
    assert SK.load_registry(f) == {4: {"path": "x", "name": "n"}}
    f.write_text("{坏", encoding="utf-8"); assert SK.load_registry(f) == {}
    f.write_text('{"4": "D:/a", "坏键": "b", "2": {"name": "没路径"}}', encoding="utf-8")
    assert SK.load_registry(f) == {4: {"path": "D:/a"}}


def test_owned_from_registry_topics_and_pack(tmp_path):
    root = tmp_path / "proj"; (root / "data").mkdir(parents=True)
    sk = _skill(tmp_path / "skills" / "pdd")
    SK.save_registry({4: {"path": str(sk)}, 3: {"path": str(tmp_path / "不存在")}}, root / "data" / "skills.local.json")
    topics = [dict(t) for t in TOPICS]; topics[0]["skill_path"] = str(sk)   # 第 1 类在 topics.json 里写了路径
    _pack(root, 2, "ok"); _pack(root, 9, "pending")
    own = SK.owned(topics, root)
    assert own[4]["from"] == "registry" and own[1]["from"] == "topics" and own[2] == {"path": None, "from": "pack"}
    assert 3 not in own and 9 not in own   # 路径不存在、素材包没确认，都不算有 skill


def test_pick_prefers_owned_steps():
    hist = [{"type": "product", "step": 4, "angle_index": 0}]
    assert pick(TOPICS, hist, skills={2, 4})["step"] == 2          # 有 skill 的两类里最久没做的
    hist2 = [{"type": "product", "step": 2}, {"type": "product", "step": 4}]
    assert pick(TOPICS, hist2, skills={2, 4})["step"] == 2          # 第 2 类更早做过，轮到它
    for i in range(10):
        assert pick(TOPICS, [{"type": "product", "step": s} for s in [2, 4] * i], skills={2, 4})["step"] in {2, 4}


def test_pick_owned_auto_false_step_becomes_eligible():
    assert pick(TOPICS, [], skills={9})["step"] == 9   # 备用类有了 skill，也进优先范围


def test_pick_without_skills_falls_back_to_main_line():
    assert pick(TOPICS, [], skills=set())["step"] == 1
    assert pick(TOPICS, [], skills=None)["step"] == 1
    assert pick(TOPICS, [{"type": "product", "step": s} for s in [1, 2, 3]], skills=set())["step"] == 4


def test_match_finds_right_category():
    m = SK.match("拼多多商品上架助手：按资料自动填写商品信息，每填一项核对一项，上新更快", [
        {"step": 4, "name": "商品上架", "points": ["按资料自动填写商品信息", "每填一项自动核对一项"], "pain": ["上新慢"]},
        {"step": 8, "name": "数据复盘", "points": ["多店铺数据自动汇总"], "pain": ["复盘做到半夜"]}])
    assert m[0][0] == 4 and m[0][2] > (m[1][2] if len(m) > 1 else 0)


def test_discover_skill_md_and_readme_tools(tmp_path):
    proj = tmp_path / "电商视频自动生成"; _skill(proj)   # 本工程自己不算
    _skill(tmp_path / "发布助手" / "pdd-v2")
    tool = tmp_path / "资料检查"; tool.mkdir(); (tool / "README.md").write_text("# 商品资料检查\n\n上传 Excel 自动检查商品资料。\n", encoding="utf-8")
    deep = tmp_path / "a" / "b" / "c" / "d"; _skill(deep, name="too-deep")
    nm = tmp_path / "node_modules" / "x"; _skill(nm, name="in-node-modules")
    names = {c["name"] for c in SK.discover([tmp_path], exclude=proj, depth=3)}
    assert names == {"pdd-helper", "商品资料检查"}


def test_find_skills_set_and_remove(tmp_path, monkeypatch, capsys):
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
    import find_skills
    monkeypatch.setattr(SK, "REGISTRY", tmp_path / "skills.local.json")
    sk = _skill(tmp_path / "pdd")
    assert find_skills.main(["--set", "4", str(sk)]) == 0
    assert SK.load_registry()[4]["name"] == "pdd-helper"
    assert find_skills.main(["--set", "99", str(sk)]) == 2
    assert find_skills.main(["--set", "4", str(tmp_path / "没有")]) == 2
    assert find_skills.main(["--remove", "4"]) == 0 and SK.load_registry() == {}
