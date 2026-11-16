import test, { after } from 'node:test'; import assert from 'node:assert/strict';
import fs from 'node:fs'; import path from 'node:path'; import { execFileSync } from 'node:child_process';
import { visibleText, openContent, ROOT, closeBrowser } from './helpers.mjs';
import { fixture } from './scene_fixtures.mjs';
after(closeBrowser);
test('placeholder slot shows the word 示意', async () => {
  assert.ok((await visibleText(fixture('footage',{frames:null}), 1.0)).includes('示意'));
});
test('real footage does not show 示意 and draws the frame', async () => {
  const dir=path.join(ROOT,'out','_test_frames'); fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
  execFileSync('ffmpeg',['-v','error','-y','-f','lavfi','-i','color=c=red:s=640x360:d=1:r=30','-frames:v','15',path.join(dir,'%04d.jpg'),'-start_number','0']);
  // ffmpeg 默认从 0001 起编号，改成 0000 起
  fs.readdirSync(dir).sort().forEach((f,i)=>fs.renameSync(path.join(dir,f),path.join(dir,String(i).padStart(4,'0')+'.jpg')));
  const c=fixture('footage',{frames:'../out/_test_frames',n:15,speed:4,timer:true});
  assert.ok(!(await visibleText(c,1.0)).includes('示意'));
  const p=await openContent(c); await p.evaluate(()=>seek(1.0));
  const box=await p.locator('.sc canvas').boundingBox(); const shot=path.join(dir,'shot.png');
  await p.screenshot({path:shot,clip:{x:Math.round(box.x+box.width/2),y:Math.round(box.y+box.height/2),width:2,height:2}});
  const px=[...execFileSync('ffmpeg',['-v','error','-i',shot,'-frames:v','1','-vf','crop=1:1:0:0','-f','rawvideo','-pix_fmt','rgb24','-'])];
  await p.close(); fs.rmSync(dir,{recursive:true,force:true});
  assert.ok(px[0]>200 && px[1]<60 && px[2]<60, 'frame not drawn: '+px);
});
