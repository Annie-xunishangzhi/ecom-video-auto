// 测试辅助：把内容对象写成临时内容文件，用引擎页面加载
import { chromium } from 'playwright';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let browser;
export async function getBrowser(){ browser ??= await chromium.launch(); return browser; }
export async function closeBrowser(){ if(browser){ await browser.close(); browser=undefined; } }
export function pageUrl(engineDir, contentFile){
  return pathToFileURL(path.join(engineDir,'index.html')).href+'?c='+encodeURIComponent(pathToFileURL(contentFile).href);
}
export async function openContent(content, VO={}, engineDir=path.join(ROOT,'engine')){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ecv-'));
  const f=path.join(dir,'content.js');
  fs.writeFileSync(f,`window.CONTENT=${JSON.stringify(content)};window.VO=${JSON.stringify(VO)};`);
  const b=await getBrowser(); const p=await b.newPage({viewport:{width:1080,height:1920}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(pageUrl(engineDir,f)); await p.evaluate(()=>document.fonts.ready);
  if(errs.length) throw new Error('page error: '+errs.join('; '));
  return p;
}
export async function timelineFor(content, VO={}){ const p=await openContent(content,VO); const TL=await p.evaluate(()=>window.TIMELINE); await p.close(); return TL; }
export async function copyEngineTo(dir){
  fs.rmSync(dir,{recursive:true,force:true}); fs.mkdirSync(dir,{recursive:true});
  fs.cpSync(path.join(ROOT,'engine'),path.join(dir,'engine'),{recursive:true});
  fs.cpSync(path.join(ROOT,'assets','mascot'),path.join(dir,'assets','mascot'),{recursive:true});
  return dir;
}
export async function loadTimeline(dir, contentName){
  const b=await getBrowser(); const p=await b.newPage();
  await p.goto(pageUrl(path.join(dir,'engine'),path.join(dir,'engine',contentName)));
  const TL=await p.evaluate(()=>window.TIMELINE); await p.close(); return TL;
}
// 当前时刻可见文字节点的包围盒
export async function textBoxes(content, t, VO={}){
  const p=await openContent(content,VO); await p.evaluate(t=>seek(t),t);
  const boxes=await p.evaluate(()=>[...document.querySelectorAll('.sc [data-fit]')].filter(e=>e.offsetParent!==null&&e.closest('.sc').style.display!=='none'&&e.textContent.trim()).map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,text:e.textContent}}));
  await p.close(); return boxes;
}
export async function visibleText(content, t, VO={}){
  const p=await openContent(content,VO); await p.evaluate(t=>seek(t),t);
  const s=await p.evaluate(()=>[...document.querySelectorAll('.sc')].filter(e=>e.style.display!=='none').map(e=>e.innerText).join('\n'));
  await p.close(); return s;
}
