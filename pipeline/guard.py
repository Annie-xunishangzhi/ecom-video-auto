"""安全闸：录屏自动操作时，拦住提交、发布、付款、对外触达等动作。
默认全拦；只有命令行 --allow "按钮文字" 明确放行的才执行，并打印醒目提示。"""
import re

class Blocked(Exception):
    pass

WORDS = ["提交", "发布", "上架", "确认", "支付", "付款", "投放", "充值", "报名", "发送", "加好友", "删除",
         "购买", "下单", "群发", "推送", "私信", "授权", "开通", "领取", "结算", "转账", "退款",
         "submit", "publish", "confirm", "pay", "purchase", "buy", "checkout", "send", "delete", "remove", "order"]
TRIGGERS = {"click", "dblclick", "press", "check", "select", "tap", "submit"}
_SPACE = re.compile(r"\s+")
_SEL_TEXT = re.compile(r"""(?:text\s*=\s*|has-text\(\s*['"]|text\(\s*['"]|:text\(\s*['"])([^'")]+)""")

def _norm(s) -> str:
    return _SPACE.sub("", str(s or "")).lower()

_EN = re.compile(r"(?<![a-z])(" + "|".join(w for w in WORDS if w.isascii()) + r")(?![a-z])")

def is_dangerous(text) -> bool:
    """中文关键词按包含匹配；英文关键词要求前后不是字母（border 不算 order，submit-btn 算 submit）。"""
    t = _norm(text)
    return bool(t) and (any(w in t for w in WORDS if not w.isascii()) or bool(_EN.search(str(text).lower())))

def _target_text(target) -> str:
    m = _SEL_TEXT.search(str(target or ""))
    return m.group(1) if m else str(target or "")

def check_action(action: dict, allow: set) -> None:
    """危险且不在放行名单时抛 Blocked。只有会触发提交的动作（点击、回车等）才检查。"""
    if action.get("do") not in TRIGGERS: return
    allowed = {_norm(a) for a in allow or ()}
    texts = [t for t in (action.get("name"), _target_text(action.get("target"))) if is_dangerous(t)]
    if not texts: return
    if all(_norm(t) in allowed for t in texts):
        print(f"\n!!!!!!!! 已按 --allow 放行危险动作：{' / '.join(texts)} !!!!!!!!\n")
        return
    raise Blocked(f"已拦住危险动作「{texts[0]}」（{action.get('do')} {action.get('target')}）。默认停在提交之前；"
                  f"确需执行请用 --allow \"{texts[0]}\" 明确放行。")
