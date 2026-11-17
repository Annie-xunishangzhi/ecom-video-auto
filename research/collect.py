"""爆款采集：在用户已登录的浏览器目录里，按关键词搜索抖音 / 小红书，读取公开搜索结果的文字信息（标题、互动数、时长、话题、配乐名）。
不下载视频，不搬运文案。每个关键词最多 30 条，翻页之间有间隔；遇到验证码或登录页立刻停下。
公众号只作人工参考，不做自动采集。
首次使用：python research/collect.py douyin --login   （打开浏览器，手动登录一次后关闭）
采集：    python research/collect.py douyin [--limit 30] [--keyword 商品上架]
结果存 data/research/<日期>-<平台>.json"""
import argparse, datetime, json, random, re, sys, time
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
PROFILE = ROOT / ".secrets" / "browser-profile"
MAX = 30
SEARCH = {"douyin": "https://www.douyin.com/search/{kw}?type=video",
          "xhs": "https://www.xiaohongshu.com/search_result?keyword={kw}&source=web_search_result_notes"}
API = {"douyin": "/aweme/v1/web/search/", "xhs": "/api/sns/web/v1/search/notes"}
HUMAN = ["验证码", "安全验证", "请先登录", "登录后查看", "扫码登录", "滑块", "访问频繁"]

class NeedsHuman(Exception):
    pass

class EmptyResult(Exception):
    pass

def parse_count(s) -> int:
    """'1.2万' → 12000，'3w+' → 30000，'1,024' → 1024；认不出时为 0。"""
    if isinstance(s, (int, float)): return int(s)
    t = str(s or "").strip().lower().replace(",", "").replace("+", "")
    m = re.fullmatch(r"(\d+(?:\.\d+)?)\s*(万|w|亿|k|千)?", t)
    if not m: return 0
    mul = {"万": 1e4, "w": 1e4, "亿": 1e8, "k": 1e3, "千": 1e3}.get(m.group(2) or "", 1)
    return int(round(float(m.group(1)) * mul))

def _douyin(payload):
    for d in payload.get("data") or []:
        a = (d or {}).get("aweme_info")
        if not a or not a.get("aweme_id"): continue
        st = a.get("statistics") or {}
        yield {"url": f"https://www.douyin.com/video/{a['aweme_id']}", "title": a.get("desc") or "",
               "likes": parse_count(st.get("digg_count")), "comments": parse_count(st.get("comment_count")),
               "shares": parse_count(st.get("share_count")), "saves": parse_count(st.get("collect_count")),
               "duration_s": round((a.get("duration") or 0) / 1000, 1),
               "tags": [x["hashtag_name"] for x in a.get("text_extra") or [] if x.get("hashtag_name")],
               "music": (a.get("music") or {}).get("title") or ""}

def _xhs(payload):
    for it in ((payload.get("data") or {}).get("items")) or []:
        n = (it or {}).get("note_card")
        if it.get("model_type") != "note" or not n: continue
        ii = n.get("interact_info") or {}
        title = n.get("display_title") or ""
        yield {"url": f"https://www.xiaohongshu.com/explore/{it['id']}", "title": title,
               "likes": parse_count(ii.get("liked_count")), "comments": parse_count(ii.get("comment_count")),
               "shares": parse_count(ii.get("shared_count")), "saves": parse_count(ii.get("collected_count")),
               "duration_s": None, "tags": re.findall(r"#([^#\s]+)", title), "music": "", "note_type": n.get("type")}

def items_from_payloads(platform: str, keyword: str, payloads: list, limit: int = MAX) -> list:
    limit = min(int(limit), MAX)
    parse = {"douyin": _douyin, "xhs": _xhs}[platform]
    now = datetime.datetime.now().isoformat(timespec="seconds")
    seen, out = set(), []
    for p in payloads:
        for it in parse(p or {}):
            if it["url"] in seen: continue
            seen.add(it["url"]); out.append({"platform": platform, "keyword": keyword, **it, "collected_at": now})
            if len(out) >= limit: return out
    if not out:
        raise EmptyResult(f"{platform}「{keyword}」采集到 0 条：页面结构或接口可能变了，不能当成“没有爆款”。请检查后再采。")
    return out

def guard_page(url: str, text: str) -> None:
    if "login" in (url or "").lower() or any(w in (text or "") for w in HUMAN):
        raise NeedsHuman(f"页面要求登录或验证（{url}）。请在打开的浏览器里手动处理后重新运行，本次已停止。")

def keywords(topics: list) -> list:
    """每步的名称（含“与”“和”拆开的部分）和痛点，去重保序。"""
    out = []
    for t in topics:
        name = t.get("name") or ""
        for k in [name, *re.split(r"与|和", name), *(t.get("pain") or [])]:
            k = k.strip()
            if k and k not in out: out.append(k)
    return out

def collect(platform: str, keyword: str, limit: int = MAX, profile_dir: Path = PROFILE, headed: bool = True) -> list:
    from playwright.sync_api import sync_playwright
    limit = min(int(limit), MAX); payloads = []
    with sync_playwright() as p:
        ctx = p.chromium.launch_persistent_context(str(profile_dir), headless=not headed, locale="zh-CN", viewport={"width": 1280, "height": 900})
        try:
            page = ctx.new_page()
            def on_resp(r):
                if API[platform] in r.url:
                    try: payloads.append(r.json())
                    except Exception: pass
            page.on("response", on_resp)
            page.goto(SEARCH[platform].format(kw=quote(keyword)), wait_until="domcontentloaded", timeout=60000)
            page.wait_for_timeout(4000)
            stale = 0
            for _ in range(8):
                guard_page(page.url, page.inner_text("body")[:5000])
                n = len(payloads)
                try:
                    if len(items_from_payloads(platform, keyword, payloads, limit)) >= limit: break
                except EmptyResult: pass
                page.mouse.wheel(0, 2500)
                page.wait_for_timeout(int(random.uniform(2.5, 4.5) * 1000))    # 翻页间隔
                stale = stale + 1 if len(payloads) == n else 0
                if stale >= 3: break
            guard_page(page.url, page.inner_text("body")[:5000])
        finally:
            ctx.close()
    return items_from_payloads(platform, keyword, payloads, limit)

def main(argv=None) -> int:
    for s in (sys.stdout, sys.stderr):
        try: s.reconfigure(encoding="utf-8")
        except Exception: pass
    ap = argparse.ArgumentParser(); ap.add_argument("platform", choices=["douyin", "xhs"])
    ap.add_argument("--limit", type=int, default=MAX); ap.add_argument("--keyword", action="append")
    ap.add_argument("--login", action="store_true", help="只打开浏览器让你登录，关掉窗口即保存")
    a = ap.parse_args(argv)
    PROFILE.mkdir(parents=True, exist_ok=True)
    if a.login:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            ctx = p.chromium.launch_persistent_context(str(PROFILE), headless=False, locale="zh-CN")
            pg = ctx.new_page(); pg.goto(SEARCH[a.platform].split("/search")[0])
            print("请在浏览器里登录，完成后关闭浏览器窗口。"); pg.wait_for_event("close", timeout=0)
            ctx.close()
        return 0
    topics = json.loads((ROOT / "data" / "topics.json").read_text(encoding="utf-8"))
    out_f = ROOT / "data" / "research" / f"{datetime.date.today()}-{a.platform}.json"
    out_f.parent.mkdir(parents=True, exist_ok=True)
    got = json.loads(out_f.read_text(encoding="utf-8")) if out_f.is_file() else []
    for kw in a.keyword or keywords(topics):
        try:
            items = collect(a.platform, kw, a.limit)
        except NeedsHuman as e:
            print("✗", e); break
        except EmptyResult as e:
            print("✗", e); continue
        got += items; print(f"✓ {kw}：{len(items)} 条")
        out_f.write_text(json.dumps(got, ensure_ascii=False, indent=1), encoding="utf-8")
        time.sleep(random.uniform(5, 10))
    print("结果：", out_f); return 0

if __name__ == "__main__":
    sys.exit(main())
