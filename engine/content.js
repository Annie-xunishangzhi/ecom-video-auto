/* ======================================================================
   空白母版内容：只改这个文件就能出一条新片。
   复制一份另存（如 content.myproduct.js），渲染时用 CONTENT=content.myproduct.js 指定。

   行内标记：{s:强调色文字} {g:绿色} {m:灰色} {b}=换行
   场景类型 type：hook / table / statement / terminal / form / checklist / status / cta
   每个场景可选：dur（秒，不填用默认）、bg（paper/ink/accent 或任意颜色）、mascot（吉祥物）
   ====================================================================== */
window.CONTENT = {
  legacyLayout: true,
  palette: { paper: '#F3EFE6', ink: '#141210', accent: '#FF4D1A', ok: '#17865A' },
  bpm: 120,

  // 吉祥物：dir=姿势图文件夹（同一画布、透明底），poses=可用姿势名；不需要就删掉整个 mascot
  mascot: { dir: '../assets/mascot', feet: 0.89, poses: ['base', 'talk', 'blink', 'phone', 'point', 'cheer', 'shock', 'clip', 'wave'] },

  scenes: [
    { type: 'hook',  // 钩子：标签满屏弹出 + 两行大字提问（标签前加 * 为强调色，最多 14 个）
      tags: ['要点一', '要点二', '*关键词', '要点四', '要点五', '要点六', '*关键词', '要点八', '要点九', '要点十', '…'],
      line1: '一句话场景', line2: '抛出问题？' },

    { type: 'table',  // 痛点：表格中某格出错
      kicker: '现在的做法', title: '痛点{b}一句话',
      columns: ['项目', '列 A', '列 B', '列 C'],
      rows: [['第 1 行', '10', '20', '30'], ['第 2 行', '10', '20', '30'], ['第 3 行', '10', '20', '30'], ['第 4 行', '10', '20', '30']],
      error: { row: 1, col: 2, to: '200', at: 3.0 },          // 第 at 秒把这格改成 to
      loop: ['步骤', '步骤', '步骤', '再核对'],                  // 出错前循环高亮的重复动作
      caption: '后果一句话，{s:强调后半句}',
      mascot: { pos: 'bottomRight', in: 3.0, pose: 'shock', startle: 3.05, say: [[3.25, '哎呀！']] } },

    { type: 'statement',  // 转折：两行大字
      kicker: '产品名 · 一句话定位', line1: '交给{b}工具做', line2: '你只管{b}确认',
      mascot: { pos: 'big', in: 1.5, pose: 'phone', spark: 2.0, say: [[2.0, '交给我！']] } },

    { type: 'terminal',  // 步骤：命令行检查（$ 开头的行会逐字打出）
      num: '01', title: '第一步标题',
      lines: ['$ 命令 {s:参数}', '状态: {g:正常}', '$ 第二条命令', '{g:✓} 结果说明'],
      badge: '检查通过', foot: '补充说明一句',
      mascot: { pos: 'topRight', pose: [[0, 'point'], [4.35, 'cheer'], [5.1, 'base']], hop: [4.35], spark: 4.35,
                say: [[0.8, '先检查～'], [4.4, '通过啦！']] } },

    { type: 'form',  // 步骤：逐项填写 + 读回
      num: '02', title: '第二步标题',
      fields: [['字段一', '示例值'], ['字段二', '示例值'], ['字段三', '示例值'], ['字段四', '示例值']],
      readback: '读回 ✓', note: '示例数据 · 说明一句',
      mascot: { pos: 'topRight', pose: [[0, 'point'], [1.7, 'base']], nod: true, say: [[0.8, '写一项，核一项']] } },

    { type: 'checklist',  // 步骤：核对清单 + 按钮
      num: '03', title: '第三步标题',
      items: [['检查项一', '备注'], ['检查项二', '备注'], ['检查项三', '备注'], ['检查项四', '备注']],
      button: '确认后 · 执行', buttonDone: '已执行 · 等待结果',
      mascot: { pos: 'topRight', pose: [[0, 'clip'], [4.0, 'cheer']], hop: [4.0], spark: 4.0,
                say: [[0.6, '先给你过目～'], [4.05, '完成！']] } },

    { type: 'status',  // 边界：状态流转
      title: '甲 {s:≠} 乙',
      states: [['状态一', '说明'], ['状态二', '说明'], ['状态三', '说明'], ['状态四', '说明']],
      caption: '一句提醒？{b}{s:正确做法}',
      mascot: { pos: 'bottomRight', in: 1.2, pose: 'base', say: [[1.6, '记住这一点哦']] } },

    { type: 'cta',  // 结尾：领取 / 关注
      kicker: '版本 · 说明', title: '领取 XX{b}{s:+ 附赠}',
      files: [['MD', '文件一', '用途'], ['MD', '文件二', '用途'], ['MD', '文件三', '用途']],
      foot: '使用前提一句{b}{m:免责一句}',
      mascot: { pos: 'cta', in: 0.9, pose: 'wave', wave: true, spark: 1.4, say: [[1.4, '来领吧～']] } },
  ],
};
