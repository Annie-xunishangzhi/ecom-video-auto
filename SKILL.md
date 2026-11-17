---
name: ecom-video
description: 自动制作电商自动化 skills 的推广短视频（选题、剧本、配音、配乐、出片）
---

# 电商推广短视频自动生成

为抖音和微信视频号制作 30–55 秒的竖屏推广短视频。每条视频围绕一个电商自动化 skill，只讲一件事：**这一步可以自动化，真实可靠，省下大量时间**。目的是推广，不是教程。

所有实际工作由脚本完成，你只负责：选题、问用户要 skill、写剧本、看检查结果。从工程根目录运行命令。

## 0. 首次使用

```
python tools/doctor.py
```

按提示补齐带 ✗ 的项。配音需要本机 NVIDIA 显卡（约 8 GB 显存）：

```
python tools/setup_tts.py          # 检查并安装 VoxCPM；退出码 3 表示硬件不够，此时如实告诉用户，不要换别的声音
python tools/design_voice.py --auto   # 生成并固定"温润男孩童音"，以后每条视频都用它
```

## 1. 选题

```
python pipeline/pick_topic.py
```

输出这次要做的步骤、功能点和痛点。选题池是 `data/topics.json` 里的电商运营八步。

## 2. 问用户要 skill（可以跳过）

问用户一句："这一步对应的 skill 放在哪？没有就直接回车跳过。"

```
python pipeline/read_skill.py <步骤号> [skill 路径]
```

- 有路径：得到 skill 的名称、简介和功能点，剧本里 `skill.provided` 写 `true`。
- 没有路径：`skill.provided` 写 `false`，按通用功能点写，实录位置留空。**这时不能写"实测"，不能写自动化一侧的具体数字，结尾要说"上线后领取"。**

## 3. 写剧本 `out/<编号>/script.json`

编号用 `日期-s步骤-序号`，例如 `2026-11-17-s4-a`。格式照 `tests/fixtures/script_ok.json`。

**必须遵守**

- 主线只有一条：以前怎么费时 → 现在自动完成 → 省下时间 → 关注领取。不讲原理，不讲操作步骤。
- 开头第一个场景是钩子，优先用前后对比或一张工作场景配图。
- 中段放一个悬念钩子（场景加 `"mid_hook": true`，位置在全片 35%–65%），答案留到最后两个场景揭晓（加 `"payoff": true`）。写法从 `data/hooks.json` 里选，近 3 条用过的不能再用。
- 揭晓的内容要实在：是真正关键的一步，或者直接接转化动作。
- 最后一个场景是 `cta`：强调免费，引导"关注 + 评论区发关键词"。抖音不能出现微信、公众号等站外引导；视频号可以引到公众号或企业微信。
- 结构从 `data/structures.json` 里选，近 5 条用过的不能再用。主题（`paper` `ink` `mint` `dusk`）和情绪（`upbeat` `calm` `tense` `playful` `warm`）也要和最近几条错开。
- 企鹅至少出场两次（场景里加 `mascot`），最后的 `cta` 必须有。
- 配图 1–2 张，只作氛围示意。
- 数字：自动化一侧只用实录里量出来的数；人工一侧可以估算，场景加 `"about": "manual"` 并在画面注明"估算"。
- 禁用：必定、保证、100%、稳赚、暴利，以及任何收益承诺。收益只说"省下的时间拿去选品和运营"。

**场景类型**（字段见 `tests/scene_fixtures.mjs`）

| 类型 | 用途 |
|---|---|
| `hookContrast` | 人工与自动化左右对比 |
| `photo` | 全屏配图加两行大字 |
| `counter` / `timer` | 数量滚动 / 计时 |
| `bars` | 2–4 项数据条对比 |
| `statement` | 两行大字的转折句 |
| `steps` | 分步列表，`hide_last` 可把最后一步藏成问号 |
| `reveal` | 揭晓悬念 |
| `footage` | 实录槽位，`slot` 为 `hook` 或 `mid`；没有实录时自动显示带"示意"字样的占位 |
| `cta` | 结尾转化 |

每个场景的 `vo` 是配音文本，也会切成屏幕字幕。企鹅：`"mascot": {"pos": "bottomRight", "pose": "point", "say": [[0.6, "交给我！"]]}`，`pos` 可选 `topRight` `bottomRight` `big` `cta`，`pose` 可选 `base` `talk` `blink` `phone` `point` `cheer` `shock` `clip` `wave`。

## 4. 检查剧本

```
python pipeline/script_check.py out/<编号>/script.json
```

有 ✗ 就改，直到通过。

## 5. 配图

```
python tools/gen_image.py "深夜的电商办公室，桌上堆满表格和样品" --id <图片编号>
```

把生成的文件名写进剧本对应 `photo` 场景的 `image`，以及 `images` 列表的 `file`。也可以用明确可商用的图片：`--register 图.jpg --id … --source 网址 --license 授权`。来源或授权不明的图不要用。

## 6. 出片

```
python pipeline/make.py out/<编号>/script.json
python pipeline/make.py out/<编号>/script.json --footage hook=录屏.mp4:0:8:2 --footage mid=录屏.mp4:20:10:2
```

`--footage 槽位=视频:起点秒:时长秒:倍速`。只换实录、不改文案时加 `--reuse-voice` 可以不重新配音。

失败时会说明原因（例如时长超出、缺配图、配音失败），按提示处理后重跑。

## 7. 看成片并交付

1. 打开 `out/<编号>/contact.jpg`，逐格检查：文字有没有重叠或溢出，企鹅有没有挡字。有问题就改剧本重跑。
2. 把 `<编号>.mp4` 和 `publish.json` 交给用户。说明：
   - 这是给人终审的成片，**发布时要在平台上打 AI 生成内容标识**，本 skill 不做自动发布。
   - `publish.json` 里有标题、话题标签、评论关键词，以及配图和配乐的授权记录。配乐要求署名时，把 `music.attribution` 贴进视频简介。
   - `pending_footage` 为 `true` 表示实录位置还是示意画面，skill 录屏后可以替换重出。

## 维护

- 曲库：`python tools/add_track.py 曲子.mp3 --mood upbeat --source 来源 --license 授权 [--attribution 署名行]`。没有来源和授权的曲子不会入库。
- 新姿势的企鹅：`tools/mascot_outfit.py` 加装扮，`tools/mascot_finish.py` 抠图并统一画布。
- 测试：`python -m pytest` 和 `node --test tests/`。
