import test, { after } from 'node:test'; import assert from 'node:assert/strict';
import os from 'node:os'; import path from 'node:path';
import { copyEngineTo, loadTimeline, closeBrowser } from './helpers.mjs';
after(closeBrowser);
test('legacy content loads from a path with CJK and spaces', async () => {
  const dir = await copyEngineTo(path.join(os.tmpdir(), '测试 目录'));
  const TL = await loadTimeline(dir, 'content.pdd.js');
  assert.equal(TL.cuts.length, 7);
  assert.ok(TL.dur > 40 && TL.dur < 50);
});
