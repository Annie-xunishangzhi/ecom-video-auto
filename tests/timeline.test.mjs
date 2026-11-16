import test, { after } from 'node:test'; import assert from 'node:assert/strict';
import { timelineFor, visibleText, closeBrowser } from './helpers.mjs';
after(closeBrowser);
const near=(a,b,e=0.01)=>Math.abs(a-b)<e;
test('scene stretches to fit its voice segment', async () => {
  const TL = await timelineFor({scenes:[{type:'statement',v:'s01',vo:'甲'},{type:'cta',v:'s02',vo:'乙'}]}, {s01:6.0,s02:2.0});
  assert.ok(near(TL.cuts[0], 0.15+6.0+0.4));
  assert.deepEqual(TL.voice[0], {id:'s01', at:0.15});
});
test('custom lead and tail are honoured', async () => {
  const TL = await timelineFor({scenes:[{type:'statement',v:'s01',vo:'甲',lead:0.5,tail:1.0},{type:'cta'}]}, {s01:6.0});
  assert.ok(near(TL.cuts[0], 7.5)); assert.ok(near(TL.voice[0].at, 0.5));
});
test('captions cover each voiced scene and stay inside it', async () => {
  const TL = await timelineFor({scenes:[{type:'statement',v:'s01',vo:'第一句话，第二句话。'},{type:'cta',v:'s02',vo:'第三句话'}]}, {s01:6.0,s02:2.0});
  assert.equal(TL.captions.length, 3);
  assert.deepEqual(TL.captions.map(c=>c[2]), ['第一句话','第二句话','第三句话']);
  for (const [a,b] of TL.captions.slice(0,2)) assert.ok(a>=0.15-1e-6 && b<=TL.cuts[0]+1e-6 && b>a);
  assert.ok(TL.captions[2][0] >= TL.cuts[0]);
});
test('outro is appended and silent', async () => {
  const TL = await timelineFor({outro:true, scenes:[{type:'cta',v:'s01',vo:'甲'}]}, {s01:2});
  assert.equal(TL.cuts.length, 1);
  assert.ok(near(TL.dur, TL.cuts[0] + 2.2));
  assert.equal(TL.voice.length, 1);
});
test('outro shows the brand name', async () => {
  const c={outro:true, scenes:[{type:'cta'}]};
  const TL=await timelineFor(c);
  assert.ok((await visibleText(c, TL.dur-1.0)).includes('韬行科技'));
});
test('missing VO entry falls back to type default duration', async () => {
  const TL = await timelineFor({scenes:[{type:'statement',v:'s09',vo:'甲'},{type:'cta'}]}, {});
  assert.ok(near(TL.cuts[0], 4));
  assert.equal(TL.voice.length, 0);
});
test('footage slots are listed in the timeline', async () => {
  const TL = await timelineFor({scenes:[{type:'footage',slot:'hook',line:'看',frames:null,n:0},{type:'cta'}]});
  assert.equal(TL.footage.length, 1);
  assert.equal(TL.footage[0].slot, 'hook'); assert.equal(TL.footage[0].scene, 0); assert.ok(TL.footage[0].dur>0);
});
