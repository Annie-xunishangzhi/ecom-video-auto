import pytest
import guard
from guard import Blocked, check_action, is_dangerous

@pytest.mark.parametrize("w", ["提交", "发布", "上架", "确认", "支付", "付款", "投放", "充值", "报名", "发送", "加好友", "删除"])
def test_each_keyword(w):
    assert is_dangerous(w)
    assert is_dangerous(f"立即{w}")

@pytest.mark.parametrize("t", ["确认发布商品", "提 交", "Submit", "PUBLISH now", "去付款", "立即购买", "一键上架", "保存并提交审核",
                               "Confirm", "Pay", "Delete", "下单", "推广投放", "群发消息"])
def test_variants(t):
    assert is_dangerous(t)

@pytest.mark.parametrize("t", ["开始检查", "使用演示数据", "下一步", "导出报告", "查看结果", "", None])
def test_safe(t):
    assert not is_dangerous(t)

def test_default_blocks_everything_dangerous():
    with pytest.raises(Blocked):
        check_action({"do": "click", "target": "text=确认发布商品", "name": "确认发布商品"}, set())

def test_target_text_also_checked():
    with pytest.raises(Blocked):
        check_action({"do": "click", "target": "button:has-text('提交')", "name": "下一步"}, set())

def test_allow_list_exact(capsys):
    check_action({"do": "click", "target": "text=提交", "name": "提交"}, {"提交"})
    assert "放行" in capsys.readouterr().out
    with pytest.raises(Blocked):
        check_action({"do": "click", "target": "text=确认发布商品", "name": "确认发布商品"}, {"提交"})

def test_fill_and_wait_not_blocked():
    check_action({"do": "fill", "target": "#title", "value": "测试商品", "name": "填标题"}, set())
    check_action({"do": "wait", "target": "text=提交成功", "name": "等结果"}, set())

def test_upload_of_dangerous_button_blocked():
    with pytest.raises(Blocked):
        check_action({"do": "press", "target": "text=发布", "name": "回车发布"}, set())

@pytest.mark.parametrize("t", ["div.border-box", "#sender-list", ".preorder", "Ordered list"])
def test_english_words_need_word_boundary(t):
    assert not is_dangerous(t)

@pytest.mark.parametrize("t", ["#submit-btn", "button.pay_now", "[data-action=publish]"])
def test_english_selectors_still_caught(t):
    assert is_dangerous(t)
