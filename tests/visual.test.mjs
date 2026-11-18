// 自写画面（visual.js）接入引擎：加载、按 t 渲染、确定性、配音对齐、缺场景报错、落版替换
import test, { after } from 'node:test'; import assert from 'node:assert/strict';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { pathToFileURL } from 'node:url';
import { openContent, closeBrowser } from './helpers.mjs';
after(closeBrowser);
const vis = (body) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), '画面 ')); const f = path.join(d, 'visual.js'); fs.writeFileSync(f, body); return pathToFileURL(f).href; };
const V = vis(`window.VISUALS={
 a:{bg:'#101020',build:(sc,id,H)=>'<div id="'+id+'box" style="position:absolute;left:0;top:200px;width:100px;height:100px;background:red"></div><div id="'+id+'tx">'+H.fmt(sc.line)+'</div>',
    init:(sc,id,H)=>H.MO.split(document.getElementById(id+'tx')),
    anim:(sc,id,t,H)=>{H.MO.set(H.$(id+'box'),{x:H.MO.kf(t,[[0,0],[1,500]]),y:H.MO.wob(t,1,20)});window._dur=H.dur;window._at=H.at(sc,'名单')}},
 outro:{dur:1.5,bg:'#000',build:(sc,id)=>'<div id="'+id+'o">LOGO</div>',anim:()=>{}}};`);
const content = (extra = {}) => ({ theme: 'ink', outro: true, captions: true, visual: V,
  scenes: [{ type: 'statement', visual: 'a', vo: '老客户该回访谁，先把名单备好。', v: 's01', line: '回访{s:名单}' }, { type: 'cta', title: '关注', vo: '关注我。', v: 's02' }], ...extra });

test('custom visual renders as a pure function of t and replaces the outro', async () => {
  const p = await openContent(content(), { s01: 3.0, s02: 1.0 });
  const pos = async t => p.evaluate(t => { seek(t); return document.getElementById('s0_box').style.transform; }, t);
  const a = await pos(0.5), b = await pos(0.9), a2 = await pos(0.5);
  assert.notEqual(a, b); assert.equal(a, a2);
  assert.equal(await p.evaluate(() => document.querySelectorAll('#s0_tx .ch').length), 4);
  const info = await p.evaluate(() => ({ dur: window._dur, at: window._at, n: window.T.length - 1, outro: !!document.getElementById('s2_o') }));
  assert.ok(Math.abs(info.dur - 3.55) < 0.01);
  assert.ok(info.at > 1.5 && info.at < 2.6, 'at() 应落在"名单"附近：' + info.at);
  assert.equal(info.n, 3); assert.ok(info.outro);
  // 自写场景（这里是落版）不叠引擎的色块转场；兜底场景照旧有
  assert.equal(await p.evaluate(() => { seek(window.T[2] + 0.1); return document.getElementById('wipe').style.display; }), 'none');
  await p.close();
});

test('unknown visual name fails loudly', async () => {
  const c = content(); c.scenes[0].visual = 'nope';
  await assert.rejects(openContent(c, { s01: 3.0, s02: 1.0 }), /画面代码里没有场景 nope/);
});
