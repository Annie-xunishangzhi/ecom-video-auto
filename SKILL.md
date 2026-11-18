---
name: ecom-video
description: 自动制作电商自动化 skills 的推广短视频（选题、剧本、配音、动效画面、配乐、出片、审片）；也用于按新画面标准重做已出过的视频
---

# 电商推广短视频自动生成

为抖音和微信视频号制作 30–55 秒的竖屏推广短视频。每条视频围绕一个电商自动化 skill，只讲一件事：**这一步可以自动化，真实可靠，省下大量时间**。目的是推广，不是教程。

脚本负责配音、配乐、渲染、合成和各项检查；你负责：选题、问用户要 skill、写剧本、**写这条视频的动效画面代码**（第 3b 节）、看检查结果和审片。从工程根目录运行命令。

**画面质量优先。** 画面要按 Opus / Fable 的前端水准做：满屏、有层次、一直在动，不能像 PPT。跨 agent 通用是次要的，两者冲突时为画面让步。

**两种用法**
- 做新视频：按第 1–7 节顺序。
- 重做已出过的视频（换画面标准或换音色）：见第 10 节。

## 0. 首次使用

```
python tools/doctor.py
```

按提示补齐带 ✗ 的项。配音需要本机 NVIDIA 显卡（约 8 GB 显存）：

```
python tools/setup_tts.py          # 检查并安装 VoxCPM；退出码 3 表示硬件不够，此时如实告诉用户，不要换别的声音
# 默认音色已经在 assets/voice/（见"配乐与声音"），不要再运行 design_voice.py 覆盖它
```

## 1. 选题

```
python pipeline/pick_topic.py
```

输出这次要做的步骤、功能点和痛点。选题池是 `data/topics.json` 里的电商运营八步。加 `--hot` 时按七比三穿插热点视频（见第 8 节）。

有账号数据时（见第 9 节）输出里会带 `prefer`：表现好、且近期没用过的结构和钩子写法，写剧本时优先选。

## 2. 问用户要 skill（可以跳过）

问用户一句："这一步对应的 skill 放在哪？没有就直接回车跳过。"

```
python pipeline/read_skill.py <步骤号> [skill 路径]
```

- 有路径：得到 skill 的名称、简介和功能点，剧本里 `skill.provided` 写 `true`。
- 没有路径：`skill.provided` 写 `false`，按通用功能点写，实录位置留空。**这时不能写"实测"，不能写自动化一侧的具体数字，结尾要说"上线后领取"。**

## 2b. 录屏，生成素材包（有 skill 时）

录到的片段放进实录槽位，实测数字才能写进剧本。**只在测试店铺、测试商品或虚构演示数据上录；默认停在提交之前；花钱或对外触达的动作（投放、报名、发消息、加好友）不真实执行。**

先看这一步有没有可用的素材包：`assets/footage/s<步骤>/pack.json` 存在且 `review` 为 `ok`。有就跳到第 3 步。

**本地网页工具**（例如商品资料检查）：写演示清单 `data/demos/s<步骤>.json`（照 `data/demos/s2.json`），然后

```
python pipeline/record_web.py data/demos/s<步骤>.json
```

每个点击都先过安全闸（`pipeline/guard.py`），按钮文字含提交、发布、确认、支付等会被拦下。确需点击时用 `--allow "按钮文字"` 明确放行，并先问用户。

**在用户已登录的浏览器里执行的 skill**（例如拼多多上架）：用 Kimi 浏览器扩展操作，自己直接运行命令，不需要用户点任何东西（本机 Kimi WebBridge 没启动会自动 start）。

```
python tools/kimi_call.py list_browser_tabs                      # 找到目标标签页
python tools/kimi_call.py attach_tab '{"tabId": 123}'
python tools/kimi_call.py snapshot                               # 读页面，拿元素引用
python tools/kimi_call.py fill '{"selector":"@e12","value":"…"}' --mark "填写标题"
python tools/kimi_call.py click '{"selector":"@e30"}' --label "40"   # 点击必须写 --label（按钮上的文字）
python tools/kimi_call.py screenshot                             # 每做一两步截一张，就是录像的画面
```

- 每做完一步用 `--mark 步骤名` 打标记，批量处理那步加 `--hl hook`。**停在提交之前**：按钮文字含提交、发布、确认、保存草稿等会被安全闸拦下。
- 做完后生成素材包（`--mask` 盖住店铺名、账号等区域，按画面比例 0–1）：

```
python pipeline/frames_pack.py --step s4 --product 拼多多上架 --mask '[{"x":0.79,"y":0,"w":0.19,"h":0.065}]'
```

- 画面里不能出现别家品牌：带品牌标识的商品图不要上传，品牌字段不填。

两种方式都会生成素材包。没有打码规则、或是真实后台录的素材包都是"待人工确认"，**不要停下来等**：照常出片（实录槽位先用占位），在最后交付时一并请用户看录像。用户确认后运行 `python pipeline/pack.py approve s<步骤>`，再 `python tools/refill.py <编号>` 换成实录版。

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
- 数字：自动化一侧只用素材包里量出来的数（`pack.json` 的 `measured`），写了实测数字的场景加 `"measured": true`，检查时会和素材包核对；人工一侧可以估算，场景加 `"about": "manual"` 并在画面注明"估算"。
- 禁用：必定、保证、100%、稳赚、暴利，以及任何收益承诺。收益只说"省下的时间拿去选品和运营"。

**场景类型**（字段见 `tests/scene_fixtures.mjs`）。`type` 决定剧本检查怎么看这个场景（钩子、揭晓、实录、转化）；画面怎么做见第 3b 节。

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

## 3b. 画面：自己写代码（画面档），场景库只是兜底

**先看你是什么模型。** 画面档要求 Opus / Fable 这一级的前端能力：每条视频由你写一份专属的动效代码。其他模型只能用兜底场景库（不写 `visual.js`），出片会被标成"画面为兜底版"，交付时必须告诉用户。**画面质量优先于跨 agent 通用**：不要为了让别的模型也能做而降低画面标准。

**画面档的做法**

0. **先读 `docs/画面档写法.md`**（分镜、构图、运动、骨架、踩过的坑），再读范例 `out/2026-11-17-s7-a/visual.js`。先给每个场景写一句分镜（画面在演什么变化），再写代码。
1. 剧本每个场景加 `"visual": "场景名"`，画面要用到的文字也写进这个场景的字段（例如 `"rows": [...]`、`"chips": [...]`）——剧本检查会扫到它们，禁用词、数字规则照样生效。画面代码里不要硬写上屏文字。
2. 写 `out/<编号>/visual.js`，注册 `window.VISUALS = {场景名: {bg, build, init?, anim, sfx?}, …, outro?}`。完整范例：`out/2026-11-17-s7-a/visual.js`（私域回访，八个场景，先读它再写）。
   - `build(sc, id, H)` 返回 HTML；元素 id 一律以 `id` 开头。`init` 在搭好后跑一次（例如 `H.MO.split` 拆字）。
   - `anim(sc, id, t, H)`：`t` 是场景内秒数，`H.dur` 场景时长，`H.T` 全片时间。**画面必须是 t 的纯函数**：渲染是逐帧 `seek(t)` 截图，CSS `animation`/`transition`、`requestAnimationFrame`、`Math.random` 都不能用。
   - 动效库 `H.MO`（`engine/motion.js`）：缓动与弹簧 `E` `spring`、关键帧 `kf`、`tw`；确定性随机与噪声 `rng` `hash` `noise` `wob`；`set` 一次设好位移/缩放/3D 旋转/透明度/模糊；逐字动画 `split` `textIn` `textOut` `textWave`；`stagger` `count` `typed` `sheen`；Canvas 的 `dust`（漂浮粒子）`burst`（彩片爆开）`ring`（冲击环）`stream`（数据流）`glow`；镜头 `camera`。
   - 其他：`H.at(sc,'词')` 配音说到这个词的时刻（用来卡点），`H.frame(sc,t)` / `H.drawFrame(...)` 实录帧（footage 场景有素材包时），`H.fmt` 行内标记，`H.img(文件名)` 配图路径，`H.SAFE` 安全区，`H.BRAND` `H.BRAND_LOGO` 落版用。
   - 写了 `outro` 就替换默认落版，但必须保留韬行科技标志和名字。
3. 企鹅仍由引擎画（场景的 `mascot` 字段），可以用 `S` `x` `f` 自定位置，`move: [[t, x, f, S], …]` 让它走位。

**画面标准**（审片时逐条对照）

- 满屏：竖屏 1080×1920 全部用上，主体居中偏上，不要"大字靠左、半屏空白"。背景要有层次（渐变光斑、网格、粒子、配图推拉）。
- 一直在动：每 1–2 秒有一个新动作（入场、变化、数字跳动、镜头推移、转场），其余时间有持续微动（漂浮、呼吸、扫光）。不要整块淡入后停住。
- 讲故事而不是列字：用画面演出"以前怎么乱 → 现在怎么自动"（零散记录被吸进名单、通知越堆越多把回访挤掉、卡片翻开揭晓……）。
- 关键内容在上 150、下 460 像素之外（下面是字幕条和平台界面）；装饰可以满出去。
- 文字不重叠、不溢出、不被企鹅挡住；没录屏的实录位置必须有"示意"字样；skill 未输入时画面上要有"开发中 / 功能示意"。

## 4. 检查剧本

```
python pipeline/script_check.py out/<编号>/script.json
```

有 ✗ 就改，直到通过。出片时还会和近 10 条成片查重（结构、钩子、主题、配乐情绪、场景顺序、文案），太像会报出和哪一条像、像在哪里，按提示换结构或重写文案。话题标签在有 `data/tags.json` 时必须从里面这一步的词里选。

## 5. 配图

```
python tools/gen_image.py "深夜的电商办公室，桌上堆满表格和样品" --id <图片编号>
```

把生成的文件名写进剧本对应 `photo` 场景的 `image`，以及 `images` 列表的 `file`。也可以用明确可商用的图片：`--register 图.jpg --id … --source 网址 --license 授权`。来源或授权不明的图不要用。

## 6. 配音与出片

**先配音。** 用户一般开着 VoxCPM 网页版（http://127.0.0.1:8808，显卡被它占着，本地再加载一份模型会爆显存），所以默认走网页版：

```
python tools/web_tts.py out/<编号>                 # 全部配音，固定音色；某段失败只重试那一段
python tools/web_tts.py out/<编号> --only s03      # 只重配某一段（改了这段文案时）
```

网页版没开时：`python tools/web_tts.py` 会报连不上，此时请用户打开网页版（或改用 `make.py` 不加 `--reuse-voice`，由本地模型直接配音）。

**再出片**（复用刚配好的音）：

```
python pipeline/make.py out/<编号>/script.json --reuse-voice
python pipeline/make.py out/<编号>/script.json --reuse-voice --footage auto
python pipeline/make.py out/<编号>/script.json --reuse-voice --footage hook=录屏.mp4:0:8:2 --footage mid=录屏.mp4:20:10:2
```

出片时会自动做**画面运动检查**（`pipeline/motion_check.py`，结果写进 `motion.json`）：连续静止 ≥0.8 秒、超过 2 秒没有新动作、整片静止比例 ≥5%，任一条不合格就不出片，按报出的时间段改 `visual.js` 后重跑（只改画面时加 `--reuse-voice`）。兜底版不拦，但 `publish.json` 里 `visual_tier` 是"兜底版"。`--allow-still` 只用于调试，不能交付。

`--footage 槽位=视频:起点秒:时长秒:倍速`。有素材包时直接用 `--footage auto`，自动取高光片段；没有可用素材包就用示意占位。只换实录、不改文案时加 `--reuse-voice` 可以不重新配音。

已发的占位版（`publish.json` 里 `pending_footage` 为 `true`），等这一步有了素材包，一键换成实录版：

```
python tools/refill.py <编号>
```

失败时会说明原因（例如时长超出、缺配图、配音失败），按提示处理后重跑。

## 7. 看成片并交付

1. 打开 `out/<编号>/review.jpg`（成片每秒一格，左上角是时间），对照第 3b 节的画面标准逐格看：满屏、层次、相邻两格有明显变化、文字不重叠不溢出、企鹅不挡字。拿不准的时刻用 `ffmpeg -ss 秒 -i 成片.mp4 -frames:v 1 x.png` 抽原尺寸帧细看。不合格就改 `visual.js` 重跑，**自己看过、改到合格再交付**。
2. 把 `<编号>.mp4` 和 `publish.json` 交给用户。说明：
   - 这是给人终审的成片，**发布时要在平台上打 AI 生成内容标识**，本 skill 不做自动发布。
   - `publish.json` 里有标题、话题标签、评论关键词，以及配图和配乐的授权记录。配乐要求署名时，把 `music.attribution` 贴进视频简介。
   - `pending_footage` 为 `true` 表示实录位置还是示意画面，skill 录屏后可以替换重出。

## 8. 热点视频

只做和电商、AI 相关、一周内、有可查来源的热点。用网页搜索找，写进 `data/hot.json`：

```
[{"topic": "…", "angle": "和电商人有什么关系", "source_url": "https://…", "source_date": "2026-11-15", "relevant_to": "ecommerce", "used": false}]
```

`pick_topic.py --hot` 选中热点时，剧本写 `"type": "hot"`、`"step": null`，把这条热点原样放进 `"hot"`，结构从 `data/structures.json` 里 `"for": "hot"` 的几种选。规则：最后要落到"电商自动化"上；钩子、中段悬念、结尾转化照常；只写来源里有的说法，不编数字；引用来源里的数字的场景加 `"about": "manual"`。出片后来源链接写进 `publish.json`，这条热点自动标记为用过。

## 9. 爆款调研与数据反馈（定期做，不是每条都做）

**调研**（需要用户先登录一次，之后小量采集公开搜索结果的文字信息，不下载视频）：

```
python research/collect.py douyin --login      # 首次：打开浏览器让用户登录
python research/collect.py douyin              # 按选题池关键词采集，每词最多 30 条
python research/digest.py tags data/research/<日期>-douyin.json   # 更新 data/tags.json
python research/digest.py top data/research/<日期>-douyin.json    # 看排名靠前的标题
```

遇到验证码或登录页会立刻停下，请用户处理。采集到 0 条会报错（页面变了），不要当成"没有爆款"。读完排名靠前的标题后，可以把新的结构或钩子写法写进 `data/research/proposals.json`（每条带 `"kind": "structure"|"hook"`），**请用户确认、把 `approved` 改成 `true` 后**再运行 `python research/digest.py merge`。

**数据反馈**：用户把每条视频的播放、完播率、点赞、收藏、涨粉填进 `data/metrics.csv`（第一行是表头），然后 `python tools/report.py` 看各结构、钩子、主题、标签的平均表现。样本不足 3 条的不下结论。

## 10. 重做已出过的视频

用于画面标准升级或换了音色之后，把旧片按新标准重出。**配音文本不变**（已经发过、观众听过），画面和声音换新。

1. 找剧本 `out/<编号>/script.json`。如果剧本没留下来，用 `out/成片/<名>.srt` 还原：字幕之间相隔约 0.55 秒的地方是场景分界，同一场景的几句字幕按原意加上标点连成这个场景的 `vo`；标题、话题标签、评论关键词、配图从同名 `.publish.json` 取；结构、钩子写法、主题从 `data/history.json` 里这条的记录取。
2. 给每个场景加 `visual` 和上屏文字字段，写 `visual.js`（第 3b 节）。`python pipeline/script_check.py` 检查时，"近 N 条用过"会把这条自己算进去，这几条可以忽略；`redo.py` 出片时会正确排除。
3. `python tools/web_tts.py out/<编号>` 用当前音色重新配音。
4. `python tools/redo.py <编号>`：同一编号重出（有可用素材包自动用实录），历史记录留在原位置。
5. 按第 7 节审片。旧成片先备份成 `<名>.旧版.mp4`，再把新片和 `publish.json`、`.srt` 复制进 `out/成片/`。

## 配乐与声音

- 配乐默认由代码原创编曲（`--music compose`）：按剧本段落编排，用 GeneralUser GS 音色库的真实乐器采样渲染，每条视频的调性、和弦、乐器组都不同，不需要署名。`--music library` 改用曲库。
- 声音固定为 `assets/voice/ref.wav` + `ref.txt` 这一对参考（2026-11-18 起是拼多多发布助手 v6b 企鹅片的人声，来源见 `assets/voice/SOURCE.md`），全片、每条视频都用它，不要换别的声音。克隆参数 cfg 2.0、步数 10、种子 42。
- 网页版配音用 `tools/web_tts.py`（第 6 节）。它会把参考音复制到网页版能读的 `VoxCPM\output\gradio\ecomvoice_ref\ref.wav`（网页版只读得到自己目录里的文件），调用 `/gradio_api/call/generate`，参数 `[文本, '', {path: 参考音路径, meta:{_type:'gradio.FileData'}}, true, ref.txt 的文字, 2, false, false, 10, 42]`。如果你的命令行连不到用户电脑的 127.0.0.1（远程会话），就在用户电脑的浏览器里用同样参数调这个接口，把生成的各段放进一个目录（s01.wav…），运行 `python tools/import_voice.py out/<编号> 该目录`。
- agent 听不了音频：配音和配乐的听感要请用户判断。

## 命令由你直接运行

本说明里的所有命令都由你（agent）在用户电脑上直接运行，结果自己读，不要让用户去点文件。用户只需要在两处出面：首次登录调研用的浏览器（`python research/collect.py douyin --login` 会弹出窗口），以及最后的成片终审。

`tools/cmd/` 里的 `.cmd` 只给不能在用户电脑上直接执行命令的远程会话备用，正常流程用不到。

## 维护

- 曲库：`python tools/add_track.py 曲子.mp3 --mood upbeat --source 来源 --license 授权 [--attribution 署名行]`。没有来源和授权的曲子不会入库。
- 新姿势的企鹅：`tools/mascot_outfit.py` 加装扮，`tools/mascot_finish.py` 抠图并统一画布。
- 测试：`python -m pytest` 和 `node --test tests/*.test.mjs`。
