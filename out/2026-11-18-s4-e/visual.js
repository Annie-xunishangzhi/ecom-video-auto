/* 2026-11-18-s4-e 商品上架 · 断线后接着填、不会重复提交（自定义选题）。色调：钢青 + 警报红（深夜断网）。
   主线：填到一半断了，填了哪些、交没交全得重查 → 手动再点一次就重复提交 vs 助手每一步都记下 →
   实录：边填边写任务记录 → 两个本事，最省心的是哪个？→ 揭晓：提交前先记一笔，卡住先查结果，绝不重发 → 关注领取。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I,AVC}=K;
const RED='#FF4F5E',CY='#5ad1ff';
const BG={seed:107,hue:[90,209,255],hue2:[255,79,94],hue3:[140,170,220],base:['#0e1e2c','#08131d','#03080d']};
const css=`
.j-form{position:absolute;left:70px;top:420px;width:940px;border-radius:34px;background:rgba(8,22,34,.9);border:2px solid rgba(255,255,255,.12);padding:26px 32px;box-shadow:0 30px 60px rgba(0,0,0,.5)}
.j-row{display:flex;align-items:center;gap:20px;height:100px;border-bottom:2px solid rgba(255,255,255,.07);font-size:38px;font-weight:900;color:#cfe9f7;white-space:nowrap}
.j-row:last-child{border-bottom:0}
.j-row .l{width:120px}
.j-row .f{flex:1;height:60px;border-radius:16px;background:rgba(255,255,255,.07);position:relative;overflow:hidden}
.j-row .f i{position:absolute;left:14px;top:19px;height:22px;border-radius:11px;background:rgba(207,233,247,.55)}
.j-row .q{width:60px;height:60px;border-radius:50%;background:rgba(255,79,94,.25);color:#ffb3bb;font-size:42px;display:flex;align-items:center;justify-content:center}
.j-cut{position:absolute;left:140px;top:700px;width:800px;height:170px;border-radius:40px;background:${RED};color:#fff;font-size:70px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:20px;box-shadow:0 24px 70px rgba(255,79,94,.6);white-space:nowrap}
.j-watch{position:absolute;left:660px;top:170px;width:350px;height:140px;border-radius:40px;background:rgba(0,0,0,.5);border:4px solid ${RED};color:#ffb3bb;font-size:86px;font-weight:900;display:flex;align-items:center;justify-content:center;font-family:"DejaVu Sans Mono",monospace}
.j-half{position:absolute;top:400px;width:460px;height:900px;border-radius:36px;padding:26px;border:3px solid rgba(255,255,255,.14)}
.j-item{position:absolute;left:30px;width:400px;height:200px;border-radius:28px;background:#f2f7fb;color:#0e1e2c;padding:22px;box-shadow:0 18px 36px rgba(0,0,0,.45)}
.j-item .t{display:flex;gap:12px;align-items:center;font-size:32px;font-weight:900;white-space:nowrap}
.j-item i{display:block;height:18px;border-radius:9px;background:#d6e2ec;margin-top:16px}
.j-dup{position:absolute;left:60px;top:780px;padding:14px 26px;border-radius:20px;border:8px solid ${RED};color:${RED};font-size:52px;font-weight:900;background:rgba(40,8,10,.7);white-space:nowrap}
.j-log{display:flex;align-items:center;gap:16px;height:108px;border-radius:24px;background:rgba(255,255,255,.07);margin-bottom:16px;padding:0 20px;font-size:38px;font-weight:900;color:#fff;white-space:nowrap}
.j-log .bx{margin-left:auto;width:54px;height:54px;border-radius:50%;border:4px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;flex:none}
.j-rec{position:absolute;left:560px;top:1060px;width:460px;border-radius:30px;background:rgba(8,22,34,.92);border:3px solid ${CY};padding:20px 24px;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.j-rec .hd{display:flex;gap:12px;align-items:center;font-size:36px;font-weight:900;color:${CY};margin-bottom:10px;white-space:nowrap}
.j-rec .r{display:flex;gap:12px;align-items:center;height:62px;font-size:32px;font-weight:900;color:#fff;white-space:nowrap}
.j-card{position:absolute;left:0;top:0;width:460px;height:420px;border-radius:40px;background:linear-gradient(160deg,#173650,#0b1d2c);border:3px solid rgba(90,209,255,.45);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:#fff;white-space:nowrap}
.j-card .a{font-size:46px;font-weight:900;color:#cfe9f7}.j-card .b{font-size:72px;font-weight:900}
.j-node{position:absolute;left:150px;width:600px;height:118px;border-radius:30px;background:rgba(255,255,255,.07);border:3px solid rgba(255,255,255,.14);display:flex;align-items:center;gap:20px;padding:0 28px;font-size:42px;font-weight:900;color:#fff;white-space:nowrap}
.j-node .ic{width:66px;height:66px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;flex:none}
.j-spin{width:46px;height:46px;border-radius:50%;border:7px solid rgba(255,201,77,.25);border-top-color:${GOLD}}
.j-no{position:absolute;left:780px;top:640px;width:240px;height:110px;border-radius:28px;background:rgba(255,79,94,.2);border:4px solid ${RED};color:#ffb3bb;font-size:36px;font-weight:900;display:flex;align-items:center;justify-content:center;white-space:nowrap}
.j-x{position:absolute;left:840px;top:610px;width:150px;height:150px}
.j-stamp{position:absolute;left:640px;top:1110px;width:380px;height:170px;border-radius:30px;border:14px solid ${MINT};color:${MINT};font-size:76px;font-weight:900;display:flex;align-items:center;justify-content:center;background:rgba(10,40,30,.6);white-space:nowrap}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
const at=(sc,w,d,H)=>{H=H||sc._H;return H?(H.at(sc,w)??d):d};
const wifiOff=w=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24"><path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="12" cy="19" r="1.6" fill="#fff"/><path d="M3 3l18 18" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></svg>`;

window.VISUALS={
/* 0 钩子：表单填到一半，断了；每格冒问号，秒表红字走 */
drop:{bg:'#08131d',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="display:none">`+K.layers(id,`
  <div class="v-a" style="left:0;top:0;width:1080px;height:1920px;background:linear-gradient(180deg,rgba(8,19,29,.55),rgba(8,19,29,.2) 40%,rgba(8,19,29,.9))"></div>
  <div class="j-watch" id="${id}w">00:00</div>
  <div class="j-form" id="${id}fm">${sc.fields.map((f,i)=>`<div class="j-row"><span class="l">${H.fmt(f)}</span><div class="f"><i id="${id}i${i}"></i></div><span class="q" id="${id}q${i}">?</span></div>`).join('')}</div>
  <div class="j-cut" id="${id}ct">${wifiOff(80)} ${H.fmt(sc.cut)}</div>
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:1100px;font-size:112px">${H.fmt(sc.head)}</div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const CUT=at(sc,'断了',1.5,H),HAND=at(sc,'手动',2.6,H),Q=at(sc,'填了哪些',3.4,H),RE=at(sc,'重新查',D-1.2,H);
  const g=K.frame(id,t,H,{...BG,img:$(id+'img'),imgAlpha:0.75,grid:false,dust:12},{seed:7,push:0.04,beats:[0.4,CUT,HAND,Q,RE]});
  const glitch=MO.prog(t,CUT,CUT+0.15)*(1-MO.prog(t,CUT+0.5,CUT+0.8));
  MO.set($(id+'fm'),{y:200*(1-MO.tw(t,0.05,0.5,'outBack')),o:MO.tw(t,0.05,0.2),x:Math.sin(t*60)*16*glitch,blur:glitch*4,r:MO.wob(t,4,0.5,0.4)});
  // 断之前一格格在填，断的那一刻停住（只填到第三格）
  sc.fields.forEach((_,i)=>{const p=MO.prog(t,0.3+i*0.4,0.75+i*0.4)*(i<3?1:0)*(t<CUT||i<2?1:Math.min(1,MO.prog(t,0.3+i*0.4,0.75+i*0.4)));$(id+'i'+i).style.width=(Math.min(p,i===2?Math.min(1,MO.prog(t,1.1,CUT)):1)*[520,300,420,200,180][i]).toFixed(0)+'px';
   MO.set($(id+'q'+i),{s:MO.ease('outBackBig')(MO.prog(t,Q-0.1+i*0.12,Q+0.2+i*0.12)),o:t>Q-0.1+i*0.12?1:0,r:Math.sin(t*6+i)*10})});
  MO.set($(id+'ct'),{s:MO.ease('outBackBig')(MO.prog(t,CUT,CUT+0.25))*(1-0.4*MO.prog(t,Q-0.3,Q)),o:t>CUT?1-0.85*MO.prog(t,Q-0.3,Q):0,y:-260*MO.prog(t,Q-0.3,Q)});
  const s=Math.floor(Math.max(0,t-CUT)*47);$(id+'w').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');MO.set($(id+'w'),{s:MO.ease('outBack')(MO.prog(t,CUT,CUT+0.3)),o:t>CUT?1:0,r:t>RE?Math.sin(t*22)*3:0});
  K.title($(id+'hd')._chars,t,RE-0.15,'punch');
  K.flash(g,t,CUT,0.15,'255,220,225');MO.ring(g,t,CUT+0.1,540,785,{r1:560,width:16,color:'255,79,94'});MO.ring(g,t,Q,540,670,{r1:460,width:8,color:'255,201,77'})},
 sfx:sc=>[[0.3,'tick'],[at(sc,'断了',1.5),'pop'],[at(sc,'填了哪些',3.4),'tick'],[at(sc,'重新查',5.6),'pop']]},

/* 1 对比：左边连点两次 → 两张一样的商品卡、"重复提交"；右边任务记录一项项打勾 */
twice:{bg:'#08131d',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}la" style="left:60px;top:200px"><span class="v-pill hot" style="font-size:40px">${H.fmt(sc.left.label)} · ${H.fmt(sc.left.value)}</span></div>
  <div class="v-a" id="${id}ra" style="left:560px;top:300px"><span class="v-pill" style="background:rgba(90,209,255,.2);color:${CY};border:3px solid ${CY};font-size:34px">${H.fmt(sc.right.label)} · ${H.fmt(sc.right.value)}</span></div>
  <div class="j-half" id="${id}L" style="left:50px;background:rgba(60,14,18,.35)">
   <div class="j-item" id="${id}c0" style="top:80px"><div class="t">${I.bag(40,RED)}${H.fmt(sc.item)}</div><i style="width:80%"></i><i style="width:55%"></i></div>
   <div class="j-item" id="${id}c1" style="top:80px"><div class="t">${I.bag(40,RED)}${H.fmt(sc.item)}</div><i style="width:80%"></i><i style="width:55%"></i></div>
   <div class="v-a" id="${id}hd2" style="left:180px;top:420px">${I.hand(110)}</div>
   <div class="j-dup" id="${id}dp">${H.fmt(sc.dup)}</div></div>
  <div class="j-half" id="${id}R" style="left:570px;background:rgba(14,40,60,.35)"><div style="height:80px"></div>${sc.log.map((x,i)=>`<div class="j-log" id="${id}g${i}">${H.fmt(x)}<div class="bx" id="${id}b${i}"></div></div>`).join('')}</div>`),
 init:(sc,id,H)=>{sc._H=H},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const AG=at(sc,'再点一次',2.0,H),DP=at(sc,'重复提交',3.0,H),R=at(sc,'发布助手',4.2,H),LG=at(sc,'记下来',D-0.9,H);
  const g=K.frame(id,t,H,BG,{seed:17,beats:[0.4,AG,DP,R,LG]});
  MO.set($(id+'la'),{x:-500*(1-MO.tw(t,0.05,0.45,'outBack')),o:MO.tw(t,0.05,0.2)});MO.set($(id+'L'),{y:200*(1-MO.tw(t,0.1,0.5,'outBack')),o:MO.tw(t,0.1,0.2)*(1-0.4*MO.tw(t,R,0.4))});
  MO.set($(id+'c0'),{y:MO.wob(t,3,4,0.6),o:MO.tw(t,0.4,0.2)});
  // 手指连点两下，第二张一模一样的卡掉下来叠上
  const tap=Math.max(Math.sin(Math.PI*MO.prog(t,AG-0.2,AG)),Math.sin(Math.PI*MO.prog(t,AG+0.2,AG+0.4)));MO.set($(id+'hd2'),{s:1-0.2*tap,y:-20*tap+MO.wob(t,5,6,0.6),o:MO.tw(t,0.6,0.2)});
  const d=MO.ease('outBounce')(MO.prog(t,AG+0.3,AG+0.8));MO.set($(id+'c1'),{y:MO.lerp(-500,230,d),r:d*4,o:t>AG+0.3?1:0});
  MO.set($(id+'dp'),{s:MO.lerp(2.4,1,MO.E.inQ(MO.prog(t,DP-0.1,DP+0.15))),r:-8,o:t>DP-0.1?1:0});
  MO.set($(id+'ra'),{x:500*(1-MO.tw(t,R-0.1,0.45,'outBack')),o:MO.tw(t,R-0.1,0.2)});MO.set($(id+'R'),{y:200*(1-MO.tw(t,R,0.5,'outBack')),o:MO.tw(t,R,0.2)});
  const span=Math.max(0.3,(D-R-0.6)/sc.log.length);sc.log.forEach((_,i)=>{const a=R+0.3+i*span;MO.set($(id+'g'+i),{x:80*(1-MO.tw(t,a,0.35,'outBack')),o:MO.tw(t,a,0.2)});
   const ok=t>a+span*0.6;const b=$(id+'b'+i);b.innerHTML=ok?I.check(32,'#08131d'):'';b.style.background=ok?CY:'transparent';b.style.borderColor=ok?CY:'rgba(255,255,255,.3)';$(id+'g'+i).style.background=ok&&t<a+span+0.3?'rgba(90,209,255,.25)':'rgba(255,255,255,.07)'});
  MO.ring(g,t,DP,280,850,{r1:360,width:12,color:'255,79,94'});MO.ring(g,t,R,800,700,{r1:400,width:8,color:'90,209,255'})},
 sfx:sc=>[[at(sc,'再点一次',2.0),'tick'],[at(sc,'再点一次',2.0)+0.3,'tick'],[at(sc,'重复提交',3.0),'pop'],[at(sc,'发布助手',4.2),'ding']]},

/* 2 实录：真实后台 + 右下角"任务记录"一条条写进去 */
real:{bg:'#08131d',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}ln" style="left:70px;top:180px"><span class="v-pill" style="background:rgba(91,214,155,.18);color:${MINT};border:3px solid ${MINT};font-size:40px">${H.fmt(sc.line)}</span></div>
  ${K.win(id,H.fmt(sc.win),{x:60,y:300,w:960,h:740})}
  <div class="v-a v-shi" id="${id}shi" style="right:84px;top:380px">示意</div>
  <div class="j-rec" id="${id}rc"><div class="hd">${I.list(36,CY)}${H.fmt(sc.rec)}</div>${sc.recs.map((r,i)=>`<div class="r" id="${id}r${i}">${I.check(30,MINT)}${H.fmt(r)}</div>`).join('')}</div>`),
 init:(sc,id,H)=>{sc._H=H;H.$(id+'body').innerHTML=`<canvas id="${id}cv" width="960" height="676" style="position:absolute;inset:0"></canvas>`;if(H.frame(sc,0))H.$(id+'shi').style.display='none'},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const B1=at(sc,'边填边记',0.9,H),B2=at(sc,'核对过了',2.4,H),B3=at(sc,'任务记录',3.6,H);
  const g=K.frame(id,t,H,BG,{seed:27,beats:[B1,B2,B3]});MO.set($(id+'ln'),{s:MO.ease('outBack')(MO.prog(t,0.05,0.4)),o:MO.tw(t,0.05,0.2)});
  MO.set($(id+'win'),{y:160*(1-MO.tw(t,0.05,0.55,'outBack')),r:MO.wob(t,3,0.4,0.3)});
  const c=$(id+'cv'),cg=c.getContext('2d');cg.fillStyle='#f4f5f8';cg.fillRect(0,0,c.width,c.height);const im=H.frame(sc,t);
  if(im){const W=im.width,Hh=im.height,z0=Math.max(1,W*c.height/c.width/Hh)*1.01;
   const z=MO.kf(t,[[0,z0],[B1,z0*1.05],[B1+0.5,z0*1.4,'outBack'],[B2,z0*1.45],[B2+0.5,z0*1.75,'outBack'],[D,z0*1.85]]);
   const vx=MO.kf(t,[[0,W/2],[B1+0.5,W*0.45,'inOutC'],[B2+0.5,W*0.5,'inOutC'],[D,W*0.52]]),vy=MO.kf(t,[[0,Hh/2],[B1+0.5,Hh*0.4,'inOutC'],[B2+0.5,Hh*0.55,'inOutC'],[D,Hh*0.6]]);
   const vw=W/z,vh=vw*c.height/c.width,sx=Math.min(Math.max(vx-vw/2,0),Math.max(0,W-vw)),sy=Math.min(Math.max(vy-vh/2,0),Math.max(0,Hh-vh));cg.drawImage(im,sx,sy,vw,vh,0,0,c.width,c.height)}
  else{for(let k=0;k<6;k++){cg.fillStyle='rgba(0,0,0,.08)';cg.fillRect(60,50+k*100,MO.lerp(100,700,MO.prog(t,0.3+k*0.2,0.9+k*0.2)),40)}}
  const sp=((t*0.7)%1)*(c.width+400)-200,gr=cg.createLinearGradient(sp-120,0,sp+120,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.5,'rgba(255,255,255,.3)');gr.addColorStop(1,'rgba(255,255,255,0)');cg.fillStyle=gr;cg.fillRect(0,0,c.width,c.height);
  MO.set($(id+'rc'),{x:500*(1-MO.tw(t,B1-0.2,0.45,'outBack')),o:MO.tw(t,B1-0.2,0.2),y:MO.wob(t,8,5,0.6)});
  const R=[B1+0.4,B2,B3];sc.recs.forEach((_,i)=>{MO.set($(id+'r'+i),{x:60*(1-MO.tw(t,R[i],0.35,'outBack')),o:MO.tw(t,R[i],0.2)});$(id+'r'+i).style.color=t>R[i]&&t<R[i]+0.5?CY:'#fff'});
  R.forEach((a,i)=>MO.ring(g,t,a,790,1170+i*62,{r1:200,width:6,color:'90,209,255'}))},
 sfx:sc=>[[at(sc,'边填边记',0.9)+0.4,'tick'],[at(sc,'核对过了',2.4),'tick'],[at(sc,'任务记录',3.6),'ding']]},

/* 3 中段悬念：两个本事两张大卡，"最省心的是哪个？" */
two:{bg:'#08131d',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:136px">${H.fmt(sc.head)}</div>
  ${sc.items.map((it,i)=>`<div class="j-card" id="${id}c${i}"><div style="width:110px;height:110px;border-radius:30px;background:rgba(90,209,255,.18);display:flex;align-items:center;justify-content:center">${[wifiOff(70),I.search(70,'#fff')][i]}</div><div class="a">${H.fmt(it[0])}</div><div class="b">${H.fmt(it[1])}</div></div>`).join('')}
  <div class="v-a v-ctr" id="${id}q" style="top:1000px"><span class="v-pill" style="background:linear-gradient(150deg,#173650,#0b1d2c);border:3px solid rgba(255,201,77,.75);color:#fff;font-size:52px">${I.lock(46)} ${H.fmt(sc.q)}</span></div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const A=[at(sc,'断了',1.2,H),at(sc,'交没交',2.4,H)],Q=at(sc,'最省心',D-1.8,H);
  const g=K.frame(id,t,H,{...BG,hue:[255,180,60]},{seed:37,beats:[0.4,...A,Q]});K.title($(id+'hd')._chars,t,0.05,'drop');
  sc.items.forEach((_,i)=>{const a=Math.min(A[i]-0.3,0.3+i*0.3);const u=MO.spring(t-a,1.4,6),uu=Math.min(1,Math.max(0,u));const lit=t>A[i]&&t<(A[i+1]??Q);
   MO.set($(id+'c'+i),{x:[60,560][i],y:MO.lerp(1500,470,uu)+MO.wob(t,i+3,8,0.6)+(t>Q?Math.sin(t*5+i*3)*14:0),s:Math.max(0,Math.min(1.08,u))*(lit?1.05:1),r:(t>Q?Math.sin(t*4+i*2)*4:0),o:t>a?1:0});
   $(id+'c'+i).style.borderColor=lit?GOLD:'rgba(90,209,255,.45)';$(id+'c'+i).style.boxShadow=lit?'0 0 60px rgba(255,201,77,.45)':''});
  MO.set($(id+'q'),{s:MO.ease('outBackBig')(MO.prog(t,Q-0.1,Q+0.25)),o:t>Q-0.1?1:0,y:MO.wob(t,7,5,0.6)});
  A.forEach((a,i)=>MO.ring(g,t,a,[290,790][i],680,{r1:300,width:8,color:'90,209,255'}));MO.dust(g,t,{n:20,seed:71,color:'255,201,77',size:[3,7],alpha:[.3,.85],speed:-60,drift:50})},
 sfx:sc=>[[at(sc,'断了',1.2),'tick'],[at(sc,'交没交',2.4),'tick'],[at(sc,'最省心',3.6),'pop']]},

/* 4 揭晓：流程五步——先记一笔、点一次、卡住、去查、已提交；"再点一次"打叉；盖"不重发" */
noresend:{bg:'#08131d',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:180px;font-size:120px">${H.fmt(sc.head)}</div>
  <canvas class="v-a" id="${id}ln" width="1080" height="900" style="left:0;top:380px"></canvas>
  ${sc.flow.map((f,i)=>`<div class="j-node" id="${id}n${i}" style="top:${400+i*150}px;left:${i===2?130:70}px"><div class="ic" id="${id}i${i}">${i===2?`<div class="j-spin" id="${id}sp"></div>`:[I.list(40,'#fff'),I.hand(46),'',I.search(40,'#fff'),I.check(40,'#fff')][i]}</div>${H.fmt(f)}</div>`).join('')}
  <div class="j-no" id="${id}no">${H.fmt(sc.no)}</div>
  <svg class="j-x" id="${id}x" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke="${RED}" stroke-width="3.6" stroke-linecap="round"/></svg>
  <div class="j-stamp" id="${id}stp">${H.fmt(sc.stamp)}</div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const PRE=at(sc,'提交前',1.0,H),W=[Math.min(at(sc,'先记一笔',1.4,H),PRE+0.1),at(sc,'万一',2.6,H),at(sc,'卡住了',3.2,H),at(sc,'去后台',4.2,H),at(sc,'查结果',4.9,H)],NR=at(sc,'绝不重发',D-1.0,H);
  const g=K.frame(id,t,H,{...BG,hue:[91,214,155]},{seed:47,beats:[0.4,PRE,...W,NR]});K.title($(id+'hd')._chars,t,0.05,'drop');if(t>NR-0.2)MO.textWave($(id+'hd')._chars,t,{amp:8,from:NR-0.2});
  const lg=MO.canvas($(id+'ln'));
  sc.flow.forEach((_,i)=>{const a=Math.min(W[i]-0.25,0.2+i*0.18);const el=$(id+'n'+i);MO.set(el,{x:-700*(1-MO.tw(t,a,0.45,'outBack')),o:MO.tw(t,a,0.2)*(t<W[i]-0.1?0.45:1)});
   const on=t>W[i]-0.1&&t<(W[i+1]??NR)+0.1;const done=t>(W[i+1]??NR);el.style.borderColor=on?(i===2?GOLD:CY):done?'rgba(91,214,155,.55)':'rgba(255,255,255,.14)';el.style.background=on?(i===2?'rgba(255,201,77,.16)':'rgba(90,209,255,.16)'):i===4&&t>W[4]?'rgba(91,214,155,.2)':'rgba(255,255,255,.07)';
   $(id+'i'+i).style.background=i===4&&t>W[4]?MINT:'rgba(255,255,255,.1)';
   if(i<4){const y0=60+i*150+59,u=MO.prog(t,W[i],W[i+1]);lg.strokeStyle='rgba(90,209,255,.8)';lg.lineWidth=6;lg.beginPath();lg.moveTo(130,y0+40);lg.lineTo(130,y0+40+110*u);lg.stroke()}});
  MO.set($(id+'sp'),{r:t*420});
  // "再点一次"出现在卡住那一步旁边，随即被打叉
  MO.set($(id+'no'),{x:300*(1-MO.tw(t,W[2],0.4,'outBack')),o:MO.tw(t,W[2],0.2)*(t>W[3]+0.4?0.5:1)});MO.set($(id+'x'),{s:MO.ease('outBackBig')(MO.prog(t,W[2]+0.4,W[2]+0.7)),o:t>W[2]+0.4?1:0,r:-10});
  const sp=MO.prog(t,NR-0.1,NR+0.15);MO.set($(id+'stp'),{s:MO.lerp(2.6,1,MO.E.inQ(sp)),r:-8,o:t>NR-0.1?1:0,blur:(1-sp)*6});
  MO.ring(g,t,W[2],360,780+59,{r1:300,width:10,color:'255,201,77'});MO.ring(g,t,W[4],340,1080+59,{r1:340,width:10,color:'91,214,155'});MO.burst(g,t,NR+0.15,830,1195,{n:34,seed:6,colors:[MINT,'#fff',GOLD],speed:[300,1000],life:1.1})},
 sfx:sc=>[[at(sc,'先记一笔',1.4),'tick'],[at(sc,'卡住了',3.2),'pop'],[at(sc,'查结果',4.9),'tick'],[at(sc,'绝不重发',5.6),'ding']]},

/* 5 结尾 */
cta:{bg:'#08131d',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:1030});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:118px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:640px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:670px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#7ddcff,#1f78b8)">${I.list(110,'#1f78b8')}</div>`+cb.html)},
 init:(sc,id,H)=>{sc._H=H;split(id,'tt')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,KW=at(sc,'断线',3.6,H),g=K.frame(id,t,H,BG,{seed:67,beats:[at(sc,'关注',2.2,H),at(sc,'评论区',3.0,H),KW]});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6)-90*Math.sin(Math.PI*MO.prog(t,KW,KW+0.45)),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=at(sc,'关注',2.2,H),S=at(sc,'私信',4.4,H)-0.3;const p=sc._cb.anim(t,{show:1.3,follow:F,type:at(sc,'评论',2.8,H)+0.2,send:S});
  MO.burst(g,t,OPEN,540,780,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,780,{r1:700,width:14,color:'90,209,255'});K.flash(g,t,OPEN,0.2,'225,245,255');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.ring(g,t,KW,540,760,{r1:480,width:10,color:'255,201,77'});MO.burst(g,t,KW+0.2,540,700,{n:30,seed:12,colors:[CY,'#fff',GOLD],speed:[300,900],life:1});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.2,'pop'],[3.8,'pop']]},
outro:K.outro(BG),
};
})();
