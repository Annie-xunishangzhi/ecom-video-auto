"""查看、查找、登记用户已有的电商自动化 skill（选题时优先做有 skill 的大类）。

  python tools/find_skills.py                  # 现在哪些大类有 skill + 在本机找到的候选 skill 及最像的大类
  python tools/find_skills.py --roots D:\\某目录 …   # 指定在哪些目录下找（默认：本工程的上一级、~/.claude/skills、~/.agents/skills、~/.codex/skills）
  python tools/find_skills.py --set 4 "D:\\…\\pdd-publish-assistant"   # 登记：第 4 类用这个 skill（先请用户确认）
  python tools/find_skills.py --remove 4       # 取消登记

登记表是 data/skills.local.json（本机路径，已被 .gitignore 排除）。"""
import argparse, json, sys
from pathlib import Path
from _paths import ROOT
sys.path.insert(0, str(ROOT / "pipeline"))
import skills as SK
from read_skill import _parse

import re
MIN_SCORE = 10   # 和大类共同词少于这个数的候选不列出来（多半是和电商无关的通用 skill）
ECOM = re.compile(r"电商|商品|店铺|商家|卖家|拼多多|淘宝|天猫|京东|抖店|小红书店|订单|上架|售后|选品|e-?commerce|shop", re.I)


def main(argv=None) -> int:
    for s in (sys.stdout, sys.stderr):
        try: s.reconfigure(encoding="utf-8")
        except Exception: pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--set", nargs=2, metavar=("步骤号", "路径")); ap.add_argument("--remove", type=int, metavar="步骤号")
    ap.add_argument("--roots", nargs="*"); ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    topics = json.loads((ROOT / "data" / "topics.json").read_text(encoding="utf-8"))
    names = {t["step"]: t["name"] for t in topics}
    reg = SK.load_registry()
    if a.set:
        step, path = int(a.set[0]), a.set[1]
        if step not in names: print(f"✗ 没有第 {step} 类"); return 2
        doc = SK._doc(path)
        if not doc: print(f"✗ 找不到 skill：{path}（要是一个含 SKILL.md 或 README.md 的文件夹，或说明文件本身）"); return 2
        name = _parse(doc.read_text(encoding="utf-8", errors="replace"))[0] or Path(path).name
        reg[step] = {"path": str(Path(path)), "name": name}; SK.save_registry(reg)
        print(f"✓ 第 {step} 类「{names[step]}」登记为 {name}：{path}"); return 0
    if a.remove is not None:
        if reg.pop(a.remove, None) is None: print(f"第 {a.remove} 类本来就没登记"); return 0
        SK.save_registry(reg); print(f"✓ 已取消第 {a.remove} 类的登记"); return 0

    own = SK.owned(topics, ROOT)
    roots = [Path(r) for r in a.roots] if a.roots else SK.default_roots(ROOT)
    found = []
    for c in SK.discover(roots):
        text = c["name"] + " " + c["summary"] + " " + Path(c["doc"]).read_text(encoding="utf-8", errors="replace")[:3000]
        m = SK.match(text, topics)
        if m and m[0][2] >= MIN_SCORE and ECOM.search(text):
            c["best"] = [{"step": s, "name": n, "score": sc} for s, n, sc in m]
            c["registered_as"] = [s for s, v in reg.items() if Path(v["path"]).resolve() == Path(c["path"]).resolve()]
            found.append(c)
    if a.json:
        print(json.dumps({"owned": {str(k): {**v, "name": names[k]} for k, v in own.items()}, "candidates": found}, ensure_ascii=False, indent=1)); return 0
    print("已有 skill 的大类（选题时优先）：" if own else "还没有任何大类有 skill：选题按主线 1–8 类轮换")
    for s, v in sorted(own.items()):
        how = {"registry": "已登记", "topics": "topics.json 写了路径", "pack": "有确认过的素材包，还没登记 skill 路径"}[v["from"]]
        print(f"  {s} {names[s]} — {how}" + (f"：{v['path']}" if v["path"] else ""))
    print(f"\n在本机找到的候选 skill（{len(found)} 个；登记前先请用户确认对应哪一类）：" if found else "\n在本机没有找到和选题池相关的 skill")
    for c in found:
        best = "、".join(f"{b['step']} {b['name']}（{b['score']}）" for b in c["best"])
        tag = f"  [已登记为第 {'、'.join(map(str, c['registered_as']))} 类]" if c["registered_as"] else ""
        print(f"  · {c['name']}：{c['path']}{tag}\n    最像：{best}\n    {c['summary'][:90]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
