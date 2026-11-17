import pytest
import kimi_relay as kr
from guard import Blocked

@pytest.mark.parametrize("req", [
    {"action": "click", "args": {"selector": "e181"}, "label": "确认发布该类商品"},
    {"action": "mouse_click", "args": {"selector": "e9"}, "label": "提交并上架"},
    {"action": "click", "args": {"selector": "e9"}},                                   # 没写 label
    {"action": "send_keys", "args": {"keys": "Enter"}, "label": "发布"},
    {"action": "evaluate", "args": {"code": "document.querySelector('button').click()"}},
    {"action": "evaluate", "args": {"code": "el.value = '1'"}},
    {"action": "navigate", "args": {"url": "https://evil.example.com"}},
    {"action": "close_session", "args": {}},
])
def test_blocked(req):
    with pytest.raises(Blocked):
        kr.vet(req, set())

@pytest.mark.parametrize("req", [
    {"action": "click", "args": {"selector": "e3"}, "label": "发布新商品"},          # 菜单入口：打开发布页，不是提交
    {"action": "fill", "args": {"selector": "e5", "value": "测试"}},
    {"action": "evaluate", "args": {"code": "document.activeElement.tagName"}},
    {"action": "navigate", "args": {"url": "https://mms.pinduoduo.com/goods/category"}},
    {"action": "send_keys", "args": {"keys": "Enter"}, "label": "分类搜索框"},
])
def test_allowed(req):
    if req.get("label") == "发布新商品":
        with pytest.raises(Blocked): kr.vet(req, set())          # 含“发布”默认也拦，要放行须明确 --allow
        kr.vet(req, {"发布新商品"})
    else:
        kr.vet(req, set())
