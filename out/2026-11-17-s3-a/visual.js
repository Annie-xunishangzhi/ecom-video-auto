/* 2026-11-17-s3-a 素材生产 · 专属画面。色调：暖玫红 + 琥珀（摄影棚、设计感）。
   主线：一款新品的图越堆越多 → 排期表塞爆、上新延期 → 资料进去、初稿出来 → 三步藏一步 → 选风格、初稿一批批出 → 你亲自挑：留下 / 重做。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I}=K;
const BG={seed:3,hue:[255,90,140],hue2:[255,170,60],hue3:[255,220,180],base:['#2a1424','#1a0d18','#0c060b']};
const GR=[['#ff9a8b','#ff6a88'],['#a18cd1','#fbc2eb'],['#f6d365','#fda085'],['#84fab0','#8fd3f4'],['#fccb90','#d57eeb'],['#e0c3fc','#8ec5fc']];
const css=`
.e-img{position:absolute;width:200px;height:250px;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,.45);border:4px solid #fff}
.e-img .k{position:absolute;left:10px;bottom:10px;padding:4px 14px;border-radius:10px;background:rgba(0,0,0,.55);color:#fff;font-size:24px;font-weight:800}
.e-img svg{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%)}
.e-col{position:absolute;top:470px;width:170px;height:760px;border-radius:26px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1)}
.e-col .d{height:66px;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:900;color:#f3d9e6;border-bottom:2px solid rgba(255,255,255,.1)}
.e-job{position:absolute;left:12px;right:12px;height:120px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff}
.e-mach{position:absolute;left:340px;top:640px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,#ffb08a 0,#ff4d1a 45%,rgba(255,77,26,0) 70%)}
.e-doc{position:absolute;width:260px;height:320px;border-radius:24px;background:#F4EFE6;padding:26px;box-shadow:0 30px 60px rgba(0,0,0,.5)}
.e-doc b{display:block;font-size:34px;color:#1c1a17;margin-bottom:16px}.e-doc i{display:block;height:16px;border-radius:8px;background:#d8d0bf;margin:14px 0}
.e-out{position:absolute;width:250px;height:330px;border-radius:28px;overflow:hidden;border:5px solid #fff;box-shadow:0 30px 60px rgba(0,0,0,.5)}
.e-out .k{position:absolute;left:0;right:0;bottom:0;height:70px;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;color:#fff;font-size:38px;font-weight:900}
.e-step{display:flex;align-items:center;gap:30px;height:200px;padding:0 44px;border-radius:44px;font-size:64px;font-weight:900;color:#fff}
.e-step .no{flex:none;width:110px;height:110px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:62px;background:#fff;color:#111}
.e-sty{padding:14px 34px;border-radius:999px;font-size:36px;font-weight:900;color:#fff;background:rgba(255,255,255,.1);border:3px solid rgba(255,255,255,.2)}
.e-th{position:absolute;width:250px;height:300px;border-radius:20px;overflow:hidden}
.e-card{position:absolute;left:290px;top:520px;width:500px;height:640px;border-radius:40px;overflow:hidden;border:6px solid #fff;box-shadow:0 40px 80px rgba(0,0,0,.55);transform-origin:50% 120%}
.e-badge{position:absolute;top:40px;padding:10px 30px;border-radius:16px;font-size:56px;font-weight:900;border:6px solid;letter-spacing:4px}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const JN=34;
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
const shoe=(w=120,c='rgba(255,255,255,.9)')=>`<svg width="${w}" height="${w*0.6}" viewBox="0 0 100 60"><path d="M6 44c0-8 8-10 16-12l18-14c4-3 8-2 10 2l6 10c8 2 22 4 34 10 6 3 6 10 0 10H10c-3 0-4-2-4-6z" fill="${c}"/><path d="M8 50h84" stroke="rgba(0,0,0,.25)" stroke-width="4"/></svg>`;
const img=(k,i,label='',w=200,h=250)=>{const g=GR[i%GR.length];return `<div class="e-img" id="${k}" style="width:${w}px;height:${h}px;background:linear-gradient(150deg,${g[0]},${g[1]})">${shoe(w*0.6)}${label?`<span class="k">${label}</span>`:''}</div>`};

window.VISUALS={
/* 0 钩子：一款新品，图一张张往外冒，越堆越多 */
pile:{bg:'#1a0d18',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="position:absolute;left:-60px;top:-60px;width:1200px;height:2040px;object-fit:cover;opacity:.45">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(26,13,24,.8),rgba(26,13,24,.5) 40%,rgba(26,13,24,.95))"></div>`+K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:170px;font-size:124px">${H.fmt(sc.head)}</div>
  ${Array.from({length:14},(_,k)=>img(id+'i'+k,k,H.fmt(sc.kinds[k%3]),190,240)).join('')}
  <div class="v-a v-t v-ctr v-acc" id="${id}end" style="top:1180px;font-size:150px">${H.fmt(sc.end)}</div>
  <div class="v-a v-ctr" id="${id}nt" style="top:1350px"><span class="v-pill dim" style="font-size:30px;padding:8px 20px">${H.fmt(sc.note)}</span></div>`),
 init:(sc,id)=>split(id,'hd','end'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,dust:20,grid:false},{seed:2,push:0.03});
  MO.set($(id+'img'),{s:1.05+0.1*MO.prog(t,0,H.dur)});K.title($(id+'hd')._chars,t,0.05,'rise');
  const k0=[H.at(sc,'主图')??0.9,H.at(sc,'详情')??1.5,H.at(sc,'短视频')??2.1];
  for(let k=0;k<14;k++){const kind=k%3;const a=k0[kind]+Math.floor(k/3)*0.25+(k>8?0.3:0);const p=MO.spring(t-a,1.6,6);
   const col=k%5,row=Math.floor(k/5);const x=70+col*190+(row%2)*60+MO.wob(t,k,10,0.5),y=420+row*230+MO.wob(t,k+30,10,0.5);
   MO.set($(id+'i'+k),{x,y:y+(1-Math.min(1,p))*-300,r:(MO.hash(k,3)-0.5)*16+MO.wob(t,k+60,2,0.6),s:Math.max(0,Math.min(1.1,p)),o:Math.min(1,Math.max(0,p*2))})}
  const E=H.at(sc,'十几张')??3.6;K.title($(id+'end')._chars,t,E-0.1,'punch');MO.set($(id+'nt'),{o:MO.tw(t,E+0.3,0.3)});
  MO.ring(g,t,E,540,1250,{r1:500,width:12});MO.burst(g,t,E,540,1250,{n:28,seed:3,speed:[300,900],life:1.0})},
 sfx:()=>[[0.9,'pop'],[1.5,'pop'],[2.1,'pop'],[3.6,'ding']]},

/* 1 排期表：活一块块往下掉，塞满溢出，"延期"盖章 */
queue:{bg:'#1a0d18',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:128px">${H.fmt(sc.head)}</div>
  <div class="v-a" id="${id}ppl" style="left:70px;top:350px;display:flex;gap:16px">${[0,1].map(k=>`<div class="v-av" style="background:${['#ff6a88','#a18cd1'][k]}">美</div>`).join('')}<span class="v-pill dim" style="font-size:32px">美工 × 2</span></div>
  ${sc.days.map((d,i)=>`<div class="e-col" id="${id}c${i}" style="left:${70+i*188}px"><div class="d">${H.fmt(d)}</div></div>`).join('')}
  ${Array.from({length:JN},(_,k)=>`<div class="e-job" id="${id}j${k}" style="width:146px;background:linear-gradient(150deg,${GR[k%6][0]},${GR[k%6][1]})">${H.fmt(sc.jobs[k%sc.jobs.length])}</div>`).join('')}
  <div class="v-a v-stamp" id="${id}stp" style="left:70px;top:1270px;z-index:5;font-size:96px;background:rgba(26,13,24,.85)">${H.fmt(sc.delay)}</div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:12});K.title($(id+'hd')._chars,t,(H.at(sc,'排期')??1.4)-0.2,'punch');
  MO.set($(id+'ppl'),{o:MO.tw(t,0.1,0.3),x:-40*(1-MO.tw(t,0.1,0.4,'outBack'))});
  sc.days.forEach((_,i)=>MO.set($(id+'c'+i),{y:300*(1-MO.tw(t,0.1+i*0.06,0.5,'outBack')),o:MO.tw(t,0.1+i*0.06,0.2)}));
  // 活块按顺序掉进每天的栏里，后来的塞不下、溢出栏外
  // 活块越掉越快，每天只排得下 5 块；第 6 块起压不进去，抖一下就从栏底被挤出去、掉出画面（=延期）
  const cnt=[0,0,0,0,0];const N=JN;for(let k=0;k<N;k++){const day=k%5;const slot=cnt[day]++;const a=0.4+3.0*Math.pow(k/N,0.8);const u=MO.prog(t,a,a+0.4);
   const x=70+day*188+12,y=470+66+12+Math.min(slot,4)*132;const over=slot>=5;const el=$(id+'j'+k);
   let yy=MO.lerp(-200,y,MO.E.outBack(u)),r=0,o=u>0?1:0;
   if(over){const d=Math.max(0,t-a-0.4);yy+=Math.sin(t*30+k)*6*Math.min(1,d*4)+d*d*1400;r=d*60*(k%2?1:-1);el.style.boxShadow=d>0?'0 0 30px rgba(255,77,26,.9)':''}
   MO.set(el,{x,y:yy,r,o})}
  const D=H.at(sc,'一拖再拖')??3.0;const sp=MO.prog(t,D,D+0.3);MO.set($(id+'stp'),{s:MO.lerp(2.4,1,MO.E.outBackBig(sp)),r:-8+MO.wob(t,3,1.5,0.8),o:sp>0?1:0});
  MO.ring(g,t,D,540,1310,{r1:500,width:12})},
 sfx:()=>[[0.6,'tick'],[0.9,'tick'],[1.2,'tick'],[1.5,'tick'],[3.0,'pop']]},

/* 2 资料进去，三种初稿出来 */
gen:{bg:'#1a0d18',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}a" style="top:170px;font-size:110px">${H.fmt(sc.head)}</div>
  <div class="v-a v-t v-ctr" id="${id}b" style="top:300px;font-size:130px">${H.fmt(sc.head2)}</div>
  <div class="e-mach" id="${id}m"></div>
  <svg class="v-a" id="${id}rg" style="left:300px;top:600px" width="480" height="480" viewBox="0 0 480 480"><circle cx="240" cy="240" r="220" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="4" stroke-dasharray="14 18"/><circle cx="240" cy="240" r="180" fill="none" stroke="${GOLD}" stroke-width="6" stroke-dasharray="90 50" stroke-linecap="round"/></svg>
  <div class="e-doc" id="${id}doc"><b>商品资料</b><i style="width:90%"></i><i style="width:70%"></i><i style="width:80%"></i><i style="width:50%"></i></div>
  ${sc.outs.map((o,i)=>`<div class="e-out" id="${id}o${i}" style="background:linear-gradient(150deg,${GR[i*2][0]},${GR[i*2][1]})">${i===2?`<svg style="position:absolute;left:85px;top:100px" width="80" height="80" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg>`:shoe(160)}<div class="k">${H.fmt(o)}</div></div>`).join('')}
  <div class="v-a v-ctr" id="${id}nt" style="top:1370px"><span class="v-pill dim" style="font-size:30px;padding:8px 20px">${H.fmt(sc.note)}</span></div>`),
 init:(sc,id)=>split(id,'a','b'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:22});const IN=H.at(sc,'交给它')??1.0,OUT=H.at(sc,'图文')??1.8,DR=H.at(sc,'自动生成')??3.2;
  K.title($(id+'a')._chars,t,0.1,'rise');K.title($(id+'b')._chars,t,DR-0.2,'punch');
  MO.set($(id+'m'),{s:0.8+0.15*Math.sin(t*4)+0.3*MO.tw(t,IN+0.3,0.3),o:MO.tw(t,0.2,0.4)});MO.set($(id+'rg'),{r:t*50,s:MO.tw(t,0.2,0.5,'outBack')});
  const u=MO.prog(t,0.3,IN+0.4);MO.set($(id+'doc'),{x:MO.lerp(-300,410,MO.E.inOutC(u)),y:MO.lerp(500,680,u),r:MO.lerp(-20,0,u),s:1-0.7*MO.prog(u,0.75,1),o:u<1?1:0});
  sc.outs.forEach((_,i)=>{const a=OUT+i*0.45;const p=MO.spring(t-a,1.3,6);const tx=[70,415,760][i],ty=[1000,1060,1000][i];
   MO.set($(id+'o'+i),{x:MO.lerp(415,tx,Math.min(1,Math.max(0,p))),y:MO.lerp(700,ty,Math.min(1,Math.max(0,p)))+MO.wob(t,i+3,10,0.6),r:[-8,0,8][i]*Math.min(1,Math.max(0,p))+MO.wob(t,i+7,2,0.6),s:Math.max(0,Math.min(1.1,p)),o:t>a?1:0});
   MO.ring(g,t,a,540,840,{r1:300,width:8,color:'255,201,77'})});
  MO.set($(id+'nt'),{o:MO.tw(t,DR+0.2,0.3)});MO.stream(g,t,540,840,540,1100,{n:12,seed:4,bend:0,speed:1.4,color:'255,201,77'})},
 sfx:()=>[[1.0,'pop'],[1.8,'pop'],[2.25,'pop'],[2.7,'pop']]},

/* 3 中段悬念：三步，第三步上锁 */
three:{bg:'#1a0d18',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:130px">${H.fmt(sc.head)}</div>
  ${sc.cards.map((s,i)=>{const lock=i===2;return `<div class="v-a e-step ${lock?'':'v-glass'}" id="${id}s${i}" style="left:70px;width:940px;top:${430+i*240}px;${lock?`background:linear-gradient(150deg,#3a1a32,#1a0d18);border:4px solid rgba(255,201,77,.75);box-shadow:0 0 70px rgba(255,77,26,.45)`:''}">
   <div class="no" style="${lock?`background:${GOLD}`:''}">${i+1}</div><span id="${id}x${i}" style="${lock?'font-size:120px;text-shadow:0 0 40px rgba(255,201,77,.9)':''}">${H.fmt(s)}</span>${lock?`<span style="margin-left:auto">${I.lock(90)}</span><div id="${id}sh" style="position:absolute;inset:0;border-radius:44px"></div>`:`<span style="margin-left:auto" class="v-ok">${I.check(36)}</span>`}</div>`}).join('')}`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,hue:[255,170,40]},{seed:32,push:0.07});
  K.title($(id+'hd')._chars,t,0.05,'drop');const a1=H.at(sc,'前两步')??1.4,a3=H.at(sc,'最后')??2.6;
  [0.35,a1,a3].forEach((a,i)=>{const p=MO.spring(t-a,1.3,6);MO.set($(id+'s'+i),{x:(i%2?1:-1)*700*(1-Math.min(1,p)),y:MO.wob(t,i+5,6,0.5),s:i===2?1+0.03*Math.sin(t*5)*(t>a+0.5?1:0):1,ry:i===2?MO.wob(t,9,8,0.4):0})});
  if(t>a1)MO.set($(id+'s1'),{x:0,y:MO.wob(t,6,6,0.5)});
  MO.set($(id+'x2'),{s:1+0.12*Math.sin(t*6)});MO.sheen($(id+'sh'),(t*0.9)%1.3/1.3*1.3,{w:12,color:'rgba(255,255,255,.3)'});
  MO.ring(g,t,a3+0.2,540,1010,{r1:600,color:'255,201,77'});MO.dust(g,t,{n:24,seed:77,color:'255,201,77',size:[3,7],alpha:[.3,.9],speed:-70,drift:60})},
 sfx:()=>[[0.35,'tick'],[1.4,'tick'],[2.6,'pop']]},

/* 4 实录槽位（示意）：选好风格，初稿一批批铺出来 */
batch:{bg:'#1a0d18',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" style="left:70px;top:175px"><span class="v-pill dim" id="${id}ln" style="font-size:38px">${H.fmt(sc.line)}</span></div>
  ${K.win(id,H.fmt(sc.win),{x:60,y:290,w:960,h:1100})}
  <div class="v-a v-shi" style="right:84px;top:370px">示意</div>`),
 init:(sc,id,H)=>{H.$(id+'body').innerHTML=`<canvas id="${id}cv" width="960" height="1036" style="position:absolute;inset:0;display:none"></canvas><div id="${id}sim">
  <div style="display:flex;gap:18px;padding:30px 30px 10px">${sc.styles.map((s,i)=>`<div class="e-sty" id="${id}y${i}">${H.fmt(s)}</div>`).join('')}</div>
  ${Array.from({length:9},(_,k)=>`<div class="e-th" id="${id}t${k}" style="left:${45+(k%3)*300}px;top:${120+Math.floor(k/3)*310}px;background:rgba(255,255,255,.06)"><div id="${id}tf${k}" style="position:absolute;inset:0;background:linear-gradient(150deg,${GR[k%6][0]},${GR[k%6][1]});display:flex;align-items:center;justify-content:center">${shoe(150)}</div></div>`).join('')}</div>`;
  if(H.frame(sc,0)){H.$(id+'cv').style.display='block';H.$(id+'sim').style.display='none'}},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:42});
  MO.set($(id+'win'),{y:200*(1-MO.tw(t,0,0.6,'outBack')),r:MO.wob(t,2,0.4,0.3)});MO.set($(id+'ln'),{o:MO.tw(t,0.2,0.3)});
  const im=H.frame(sc,t);if(im){const c=$(id+'cv');H.drawFrame(c.getContext('2d'),im,0,0,c.width,c.height);return}
  const ST=H.at(sc,'选好风格')??1.0,GO=H.at(sc,'初稿')??2.0;
  sc.styles.forEach((_,i)=>{const on=t>ST+0.3?i===sc.pick:Math.floor(t*4)%3===i&&t>ST-0.4;const el=$(id+'y'+i);el.style.background=on?ACC:'rgba(255,255,255,.1)';el.style.borderColor=on?ACC:'rgba(255,255,255,.2)';MO.set(el,{s:on?1.08:1})});
  for(let k=0;k<9;k++){const batch=Math.floor(k/3);const a=GO+batch*0.55+(k%3)*0.08;const p=MO.tw(t,a,0.4,'outBack');
   const sk=$(id+'t'+k);sk.style.background=t<a?`rgba(255,255,255,${(0.05+0.05*Math.sin(t*6-k)).toFixed(3)})`:'transparent';
   MO.set($(id+'tf'+k),{s:p,o:MO.tw(t,a,0.2),r:(1-p)*8});MO.set(sk,{y:MO.wob(t,k,4,0.6)*(t>a+0.4?1:0)})}
  for(let b=0;b<3;b++)MO.ring(g,t,GO+b*0.55,540,660+b*310,{r1:500,width:8,color:'255,140,180'})},
 sfx:()=>[[1.0,'tick'],[2.0,'pop'],[2.55,'pop'],[3.1,'pop']]},

/* 5 揭晓：你一张张挑，好的划进"留下"，不满意的划去"重做" */
pick:{bg:'#1a0d18',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:175px;font-size:140px">${H.fmt(sc.head)}</div>
  <div class="v-a v-ctr" id="${id}sub" style="top:345px"><span class="v-pill dim" style="font-size:36px">${H.fmt(sc.sub)}</span></div>
  <div class="v-a" id="${id}kp" style="left:760px;top:1220px"><span class="v-pill" style="background:rgba(91,214,155,.2);color:${MINT};border:3px solid ${MINT};font-size:40px">${I.check(36,MINT)} ${H.fmt(sc.keep)} <b id="${id}kn" style="font-family:'DejaVu Sans Mono',monospace">0</b></span></div>
  <div class="v-a" id="${id}rd" style="left:70px;top:1220px"><span class="v-pill" style="background:rgba(255,77,26,.2);color:#FF9F7E;border:3px solid ${ACC};font-size:40px">↻ ${H.fmt(sc.redo)}</span></div>
  ${[0,1,2,3].map(k=>`<div class="e-card" id="${id}c${k}" style="background:linear-gradient(150deg,${GR[(k+1)%6][0]},${GR[(k+1)%6][1]})"><div style="position:absolute;left:0;right:0;top:170px;display:flex;justify-content:center">${shoe(320)}</div>
   <div class="e-badge" id="${id}bk${k}" style="left:30px;color:${MINT};border-color:${MINT};background:rgba(0,0,0,.35);opacity:0">${H.fmt(sc.keep)}</div><div class="e-badge" id="${id}br${k}" style="right:30px;color:#FF9F7E;border-color:${ACC};background:rgba(0,0,0,.35);opacity:0">${H.fmt(sc.redo)}</div></div>`).reverse().join('')}
  <div class="v-a" id="${id}hand" style="left:0;top:0">${I.hand(140)}</div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$;const P=H.at(sc,'亲自挑')??1.0,KEEP=H.at(sc,'好的留下')??2.4,REDO=H.at(sc,'不满意')??3.4;
  const g=K.frame(id,t,H,{...BG,hue:[91,214,155]},{seed:52,beats:[H.at(sc,'最后一步')??0.2,H.at(sc,'发布前')??0.7,P,H.at(sc,'一遍')??1.6,KEEP,REDO]});K.title($(id+'hd')._chars,t,P-0.3,'punch');MO.set($(id+'sub'),{o:MO.tw(t,P+0.4,0.3)});
  // 四张初稿，依次被手划走：右=留下，左=重做，第四张重做后重新生成
  const sw=[[KEEP-0.4,1],[KEEP+0.2,1],[REDO,-1],[REDO+0.7,1]];let kept=0;
  sw.forEach(([a,dir],k)=>{const u=MO.prog(t,a,a+0.5);const top=k===sw.findIndex(([b])=>t<b+0.5);if(t>a+0.5&&dir>0)kept++;
   const base=Math.max(0,k-sw.filter(([b])=>t>b+0.5).length);
   const deal=MO.spring(t-0.1-(3-k)*0.22,1.5,6);   // 开场一张张发牌进来
   MO.set($(id+'c'+k),{x:dir*900*MO.E.inQ(u)+(u>0?0:base*10)+(1-Math.min(1,deal))*(k%2?600:-600),y:base*-18+MO.wob(t,k,6,0.5)*(top?1:0)+(1-Math.min(1,deal))*300,r:dir*30*MO.E.inQ(u)+(top?MO.wob(t,k+5,2,0.5):base*2)+(1-Math.min(1,deal))*(k%2?25:-25),s:1-base*0.04,o:u<1&&deal>0?1:0});
   MO.set($(id+'bk'+k),{o:dir>0?MO.prog(t,a-0.2,a+0.1):0,r:-12});MO.set($(id+'br'+k),{o:dir<0?MO.prog(t,a-0.2,a+0.1):0,r:12})});
  $(id+'kn').textContent=kept;
  const hx=MO.kf(t,[[0.8,900],[KEEP-0.5,600],[KEEP-0.1,1000,'inC'],[KEEP+0.1,600],[KEEP+0.5,1000,'inC'],[REDO-0.1,580],[REDO+0.3,180,'inC'],[REDO+0.6,580],[REDO+1.0,1000,'inC']]);
  MO.set($(id+'hand'),{x:hx,y:880+MO.wob(t,3,20,0.8),o:MO.tw(t,0.8,0.2),r:MO.wob(t,4,8,0.6)});
  MO.set($(id+'kp'),{s:1+0.12*Math.sin(MO.prog(t,KEEP,KEEP+0.3)*Math.PI)+0.12*Math.sin(MO.prog(t,KEEP+0.6,KEEP+0.9)*Math.PI)});
  MO.set($(id+'rd'),{s:1+0.15*Math.sin(MO.prog(t,REDO+0.3,REDO+0.6)*Math.PI),r:MO.prog(t,REDO+0.3,REDO+0.9)*360*0});
  MO.burst(g,t,KEEP+0.1,880,1260,{n:20,seed:5,colors:[MINT,'#fff'],speed:[200,600],life:0.9});MO.ring(g,t,REDO+0.3,200,1260,{r1:260,width:8})},
 sfx:()=>[[2.0,'tick'],[2.6,'tick'],[3.4,'pop'],[4.1,'tick']]},

cta:{bg:'#1a0d18',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:960});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:150px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:530px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:560px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#ff9a8b,#ff6a88)">${I.image(120,'#fff','#ff4d1a')}</div>`+cb.html)},
 init:(sc,id)=>split(id,'tt'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:62});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=H.at(sc,'关注')??2.2,S=(H.at(sc,'上线就')??3.8)-0.2;const p=sc._cb.anim(t,{show:1.3,follow:F,type:(H.at(sc,'评论')??2.8)+0.2,send:S});
  MO.burst(g,t,OPEN,540,640,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,640,{r1:700,width:14,color:'255,140,180'});K.flash(g,t,OPEN,0.25,'255,200,220');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.2,'pop'],[3.6,'pop']]},
outro:K.outro(BG),
};
})();
