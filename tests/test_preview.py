"""画面预览：能出联系表；画面代码有错（重复 id、KIT.frame 少传 H）时直接报出来。"""
import json, sys
from pathlib import Path
import pytest
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "pipeline"))
import preview

SCRIPT = {"id": "pv", "theme": "ink", "scenes": [{"type": "statement", "visual": "a", "vo": "先把名单备好。", "line": "名单"},
                                                {"type": "cta", "visual": "a", "vo": "关注我。", "line": "关注"}]}
OK = """(function(){const K=window.KIT;window.VISUALS={a:{bg:'#111',build:(sc,id,H)=>K.layers(id,'<div class="v-a v-t" id="'+id+'t" style="top:300px;left:70px;font-size:120px">'+H.fmt(sc.line)+'</div>'),
 init:(sc,id)=>window.MO.split(document.getElementById(id+'t')),anim:(sc,id,t,H)=>{K.frame(id,t,H,{});K.title(H.$(id+'t')._chars,t,0.1,'drop')}},outro:K.outro({})}})();"""


def _out(tmp, visual):
    d = tmp / "out" / "pv"; d.mkdir(parents=True)
    (d / "script.json").write_text(json.dumps(SCRIPT, ensure_ascii=False), encoding="utf-8"); (d / "visual.js").write_text(visual, encoding="utf-8")
    return d


def test_preview_sheet(tmp_path):
    out = preview.preview(_out(tmp_path, OK), 1.0)
    assert out.is_file() and out.stat().st_size > 5000


def test_duplicate_id_is_reported(tmp_path):
    bad = OK.replace("id+'t\" style", "id+'st\" style").replace("(id+'t')", "(id+'st')")   # 文字层的 id 和舞台层撞名
    assert bad.count("id+'st'") >= 2
    with pytest.raises(SystemExit, match="重复的元素 id"):
        preview.preview(_out(tmp_path, bad), 1.0)


def test_missing_H_is_reported(tmp_path):
    with pytest.raises(SystemExit, match="第三个参数要传 H"):
        preview.preview(_out(tmp_path, OK.replace("K.frame(id,t,H,{})", "K.frame(id,t,{})")), 1.0)


def test_scene_check_reports_per_scene(tmp_path):
    import scene_check
    still = OK.replace("K.title(H.$(id+'t')._chars,t,0.1,'drop')", "")      # 只有背景微动，没有新动作
    rs = scene_check.check_scenes(_out(tmp_path, still), [0])
    assert len(rs) == 1 and rs[0]["scene"] == 0 and rs[0]["name"] == "a" and "event_gaps" in rs[0]
