// 渲染：每个场景一个 page 并行 → OUT_DIR/scene<i>.mp4；同时写出 OUT_DIR/timeline.json。
// 环境变量：CONTENT=内容文件绝对路径  OUT_DIR=输出目录绝对路径。参数：只渲染的场景序号（可选）。
const {chromium}=require('playwright');const {spawn}=require('child_process');const fs=require('fs');const path=require('path');const {pathToFileURL}=require('url');
const FPS=30;
const CONTENT=path.resolve(process.env.CONTENT||path.join(__dirname,'..','engine','content.js'));
const OUT=path.resolve(process.env.OUT_DIR||path.dirname(CONTENT));
const URL_=pathToFileURL(path.join(__dirname,'..','engine','index.html')).href+'?c='+encodeURIComponent(pathToFileURL(CONTENT).href);
(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  const b=await chromium.launch();
  const probe=await b.newPage();const errs=[];probe.on('pageerror',e=>errs.push(e.message));
  await probe.goto(URL_);
  if(errs.length){console.error('页面错误: '+errs.join('; '));process.exit(2)}
  const {T,TL}=await probe.evaluate(()=>({T:window.T,TL:window.TIMELINE}));await probe.close();
  fs.writeFileSync(path.join(OUT,'timeline.json'),JSON.stringify(TL,null,1));
  const only=process.argv.length>2?process.argv.slice(2).map(Number):T.slice(0,-1).map((_,i)=>i);
  fs.readdirSync(OUT).filter(f=>/^scene\d+\.mp4$/.test(f)&&+f.match(/\d+/)[0]>=T.length-1).forEach(f=>fs.unlinkSync(path.join(OUT,f)));
  const queue=[...only];const N=Math.min(4,queue.length);
  await Promise.all(Array.from({length:N},async()=>{
    const p=await b.newPage({viewport:{width:1080,height:1920}});await p.goto(URL_);await p.evaluate(()=>document.fonts.ready);
    if(await p.evaluate(()=>!!window.ready))await p.evaluate(()=>window.ready());
    while(queue.length){const i=queue.shift();
      const f0=Math.round(T[i]*FPS),f1=Math.round(T[i+1]*FPS);
      const tmp=path.join(OUT,`scene${i}.tmp.mp4`),out=path.join(OUT,`scene${i}.mp4`);
      const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-r',String(FPS),tmp]);
      const done=new Promise((res,rej)=>ff.on('close',c=>c===0?res():rej(new Error('ffmpeg '+i+' '+c))));
      for(let f=f0;f<f1;f++){await p.evaluate(t=>seek(t),f/FPS);const buf=await p.screenshot({type:'jpeg',quality:92});
        if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
      ff.stdin.end();await done;fs.renameSync(tmp,out);console.log('scene',i,f1-f0,'frames');}
    await p.close();}));
  await b.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
