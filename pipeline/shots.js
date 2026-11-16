// 抽帧检查：CONTENT=… OUT_DIR=… node shots.js [时刻...] → OUT_DIR/shot_<t>.jpg，并拼成 contact.jpg
const {chromium}=require('playwright');const {execFileSync}=require('child_process');const fs=require('fs');const path=require('path');const {pathToFileURL}=require('url');
const CONTENT=path.resolve(process.env.CONTENT||path.join(__dirname,'..','engine','content.js'));
const OUT=path.resolve(process.env.OUT_DIR||path.dirname(CONTENT));
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
  await p.goto(pathToFileURL(path.join(__dirname,'..','engine','index.html')).href+'?c='+encodeURIComponent(pathToFileURL(CONTENT).href));await p.evaluate(()=>document.fonts.ready);
  if(await p.evaluate(()=>!!window.ready))await p.evaluate(()=>window.ready());
  let ts=process.argv.slice(2).map(Number);
  if(!ts.length){const T=await p.evaluate(()=>T);ts=T.slice(0,-1).map((a,i)=>+(a+(T[i+1]-a)*0.7).toFixed(2))}
  const files=[];for(const t of ts){await p.evaluate(t=>seek(t),t);const f=path.join(OUT,`shot_${t}.jpg`);await p.screenshot({path:f,type:'jpeg',quality:80});files.push(f)}
  await b.close();
  const n=files.length,cols=Math.min(4,n);
  const lay=files.map((_,i)=>`${(i%cols)?Array.from({length:i%cols},()=>'w0').join('+'):'0'}_${Math.floor(i/cols)?Array.from({length:Math.floor(i/cols)},()=>'h0').join('+'):'0'}`).join('|');
  execFileSync('ffmpeg',['-v','error','-y',...files.flatMap(f=>['-i',f]),'-filter_complex',n>1?`xstack=inputs=${n}:layout=${lay}:fill=white,scale=1440:-1`:'scale=360:-1',path.join(OUT,'contact.jpg')]);
  files.forEach(f=>fs.unlinkSync(f));console.log(path.join(OUT,'contact.jpg'));
})().catch(e=>{console.error(e.message);process.exit(1)});
