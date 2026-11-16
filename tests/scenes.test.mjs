import test, { after } from 'node:test'; import assert from 'node:assert/strict';
import { textBoxes, visibleText, openContent, timelineFor, closeBrowser } from './helpers.mjs';
import { fixture, TYPES } from './scene_fixtures.mjs';
after(closeBrowser);
const inside=b=>b.top>=150-1 && b.bottom<=1620+1 && b.left>=0 && b.right<=1080+1;
for (const type of TYPES.filter(t=>t!=='footage'))
  test(`${type} keeps all text inside the safe area`, async () => {
    const c=fixture(type); const TL=await timelineFor(c);
    const boxes = await textBoxes(c, TL.dur-0.8);
    assert.ok(boxes.length>0, 'no text found');
    for (const b of boxes) assert.ok(inside(b), JSON.stringify(b));
  });
const LONG='一'.repeat(40);
const longCases={hookContrast:{line:LONG,left:{label:LONG.slice(0,12),value:LONG.slice(0,10),note:LONG.slice(0,14)},right:{label:LONG.slice(0,12),value:LONG.slice(0,10),note:LONG.slice(0,14)}},
  counter:{title:LONG,caption:LONG,unit:LONG.slice(0,10)}, timer:{title:LONG,caption:LONG}, bars:{title:LONG,items:[[LONG.slice(0,12),5,LONG.slice(0,14)],['乙',1,'丙']]},
  photo:{line1:LONG,line2:LONG}, steps:{title:LONG,items:[LONG,LONG,LONG],hide_last:false}, reveal:{title:LONG,line:LONG},
  statement:{line1:LONG,line2:LONG,kicker:LONG}, cta:{title:LONG,foot:LONG,kicker:LONG}};
for (const [type,over] of Object.entries(longCases))
  test(`${type}: double-length CJK text still fits (auto shrink or wrap)`, async () => {
    const c=fixture(type,over); const TL=await timelineFor(c);
    for (const b of await textBoxes(c, TL.dur-0.8)) assert.ok(inside(b), JSON.stringify(b));
  });
test('every theme keeps the brand accent and uses a registered transition', async () => {
  const p=await openContent(fixture('statement'));
  const {themes,trans}=await p.evaluate(()=>({themes:window.THEMES,trans:Object.keys(window.TRANSITIONS)})); await p.close();
  assert.ok(Object.keys(themes).length>=4); assert.ok(trans.length>=4);
  for (const k of ['paper','ink','mint','dusk']) assert.ok(themes[k], k);
  for (const t of Object.values(themes)){ assert.equal(t.accent,'#FF4D1A'); assert.ok(trans.includes(t.transition), t.transition); }
});
test('theme changes the page colours', async () => {
  const bg=async th=>{const p=await openContent(fixture('statement',{},th));const v=await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--paper').trim());await p.close();return v};
  assert.notEqual(await bg('paper'), await bg('mint'));
});
test('steps with hide_last masks the last item', async () => {
  const c=fixture('steps'); const TL=await timelineFor(c); const s=await visibleText(c, TL.dur-0.8);
  assert.ok(s.includes('？')); assert.ok(!s.includes('提交前亲自确认')); assert.ok(s.includes('准备商品资料'));
});
test('steps without hide_last shows every item', async () => {
  const c=fixture('steps',{hide_last:false}); const TL=await timelineFor(c);
  assert.ok((await visibleText(c, TL.dur-0.8)).includes('提交前亲自确认'));
});
test('counter reaches its target', async () => {
  const c=fixture('counter'); const TL=await timelineFor(c);
  assert.ok((await visibleText(c, TL.dur-0.8)).replace(/[,，\s]/g,'').includes('1000'));
});
test('unknown scene type fails loudly', async () => {
  await assert.rejects(openContent({scenes:[{type:'hologram'}]}), /hologram/);
});
test('inline font sizes survive auto-fit (brand name stays large)', async () => {
  const c={outro:true,scenes:[{type:'cta',title:'甲'}]}; const TL=await timelineFor(c);
  const p=await openContent(c); await p.evaluate(t=>seek(t),TL.dur-0.5);
  const h=await p.evaluate(()=>[...document.querySelectorAll('.sc [data-fit]')].find(e=>e.textContent==='韬行科技').getBoundingClientRect().height); await p.close();
  assert.ok(h>100, 'brand name height '+h);
});
