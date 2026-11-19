/* 2026-11-18-s4-b 商品上架 · 每填一项自动核对一项。色调：薄荷青绿（白天的运营工位）+ 企鹅橙。
   主线：手动一格格填、秒表越走越快 → 手动填完才查（填反了一格格找）vs 助手填一项核一项 → 实录：填进后台马上读回 →
   凭什么一项不错？→ 读回：资料飞进页面、再读回来对，对不上就停下提醒 → 关注领取。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I,AVC}=K;
const RED='#FF5A4E',TEAL='#3fd1b5';
const BG={seed:41,hue:[63,209,181],hue2:[255,77,26],hue3:[120,230,200],base:['#0c2a2a','#071a1b','#030c0c']};
const css=`
.b-form{position:absolute;left:70px;width:940px;border-radius:36px;background:rgba(10,34,34,.88);border:2px solid rgba(255,255,255,.12);padding:30px 34px;box-shadow:0 30px 60px rgba(0,0,0,.45)}
.b-row{display:flex;align-items:center;gap:22px;height:104px;border-bottom:2px solid rgba(255,255,255,.07)}
.b-row:last-child{border-bottom:0}
.b-row .l{width:130px;font-size:40px;font-weight:900;color:#bfe9df;white-space:nowrap}
.b-row .f{flex:1;height:64px;border-radius:16px;background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.12);position:relative;overflow:hidden}
.b-row .f i{position:absolute;left:14px;top:20px;height:24px;border-radius:12px;background:rgba(191,233,223,.55)}
.b-row .ck{width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}
.b-watch{position:absolute;left:640px;top:170px;width:370px;height:150px;border-radius:40px;background:rgba(0,0,0,.5);border:4px solid rgba(255,255,255,.22);color:#fff;font-size:92px;font-weight:900;display:flex;align-items:center;justify-content:center;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace}
.b-cur{position:absolute;width:6px;height:52px;border-radius:3px;background:#fff}
.b-half{position:absolute;top:420px;width:460px;height:880px;border-radius:36px;padding:26px;border:3px solid rgba(255,255,255,.14)}
.b-half .hd{display:flex;align-items:center;gap:14px;font-size:44px;font-weight:900;color:#fff;margin-bottom:20px;white-space:nowrap}
.b-mr{position:relative;height:118px;border-radius:24px;background:rgba(255,255,255,.07);margin-bottom:18px;display:flex;align-items:center;gap:16px;padding:0 20px;font-size:36px;font-weight:900;color:#fff;white-space:nowrap}
.b-mr .bx{margin-left:auto;width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}
.b-mag{position:absolute;width:180px;height:180px;border-radius:50%;border:12px solid #fff;box-shadow:0 0 40px rgba(255,255,255,.35),inset 0 0 40px rgba(255,255,255,.2)}
.b-bar{position:absolute;left:70px;width:940px;height:190px;border-radius:36px;background:rgba(255,255,255,.06);border:3px solid rgba(255,255,255,.12);padding:26px 32px}
.b-bar .t{display:flex;align-items:center;gap:16px;font-size:46px;font-weight:900;color:#fff;white-space:nowrap}
.b-bar .t b{margin-left:auto;font-size:38px}
.b-bar .tr{margin-top:22px;height:44px;border-radius:22px;background:rgba(255,255,255,.08);position:relative;overflow:hidden}
.b-bar .tr i{position:absolute;left:0;top:0;bottom:0;border-radius:22px}
.b-col{position:absolute;top:470px;width:430px;border-radius:32px;padding:24px;background:rgba(255,255,255,.06);border:3px solid rgba(255,255,255,.14)}
.b-col .hd{font-size:40px;font-weight:900;color:#bfe9df;margin-bottom:16px;display:flex;gap:12px;align-items:center;white-space:nowrap}
.b-cell{height:126px;border-radius:22px;background:rgba(255,255,255,.08);margin-bottom:16px;padding:14px 20px;color:#fff;white-space:nowrap;position:relative}
.b-cell .k{font-size:28px;color:#9fd8cb;font-weight:800}
.b-cell .v{font-size:44px;font-weight:900;margin-top:6px;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace}
.b-fly{position:absolute;left:0;top:0;padding:10px 22px;border-radius:18px;background:${TEAL};color:#05231d;font-size:40px;font-weight:900;white-space:nowrap;box-shadow:0 12px 30px rgba(0,0,0,.4)}
.b-stop{position:absolute;left:90px;top:1180px;width:900px;height:130px;border-radius:34px;background:${RED};color:#fff;font-size:54px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:18px;box-shadow:0 20px 60px rgba(255,90,78,.6);white-space:nowrap}
.b-wm{position:absolute;font-size:220px;font-weight:900;color:rgba(63,209,181,.12);line-height:1;white-space:nowrap}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
const at=(sc,w,d,H)=>{H=H||sc._H;return H?(H.at(sc,w)??d):d};
const note=(id,k,txt,H,pos)=>`<div class="v-a" id="${id}${k}" style="${pos}"><span class="v-pill dim" style="font-size:30px;padding:8px 20px">${H.fmt(txt)}</span></div>`;
const tick=(w,c)=>I.check(w,c);

window.VISUALS={
/* 0 钩子：配图做背景，表单五格手动一格格慢慢填，秒表越走越快 */
clock:{bg:'#071a1b',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="display:none">`+K.layers(id,`
  <div class="v-a" style="left:0;top:0;width:1080px;height:1920px;background:linear-gradient(180deg,rgba(7,26,27,.55),rgba(7,26,27,.25) 35%,rgba(7,26,27,.9))"></div>
  <div class="b-watch" id="${id}w">00:00</div>
  <div class="b-form" id="${id}fm" style="top:420px">${sc.fields.map((f,i)=>`<div class="b-row"><span class="l">${H.fmt(f)}</span><div class="f"><i id="${id}i${i}"></i><div class="b-cur" id="${id}c${i}" style="top:6px"></div></div></div>`).join('')}</div>
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:1050px;font-size:124px">${H.fmt(sc.head)}</div>
  ${note(id,'nt',sc.note,H,'left:76px;top:1200px')}`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const F=sc.fields.map((f,i)=>at(sc,f,0.6+i*0.8,H)),HD=at(sc,'十几分钟',4.6,H);
  const g=K.frame(id,t,H,{...BG,img:$(id+'img'),imgAlpha:0.75,grid:false,dust:14},{seed:3,push:0.04,beats:[...F,HD]});
  MO.set($(id+'fm'),{y:160*(1-MO.tw(t,0.05,0.5,'outBack')),o:MO.tw(t,0.05,0.2),r:MO.wob(t,2,0.5,0.4)});
  // 每说到一个字段，那一格开始慢慢打字（越往后越拖）
  sc.fields.forEach((_,i)=>{const a=F[i];const w=MO.prog(t,a,a+0.9+i*0.12);$(id+'i'+i).style.width=(w*[520,300,420,200,180][i%5]).toFixed(0)+'px';
   const on=t>a&&w<1;MO.set($(id+'c'+i),{x:14+w*[520,300,420,200,180][i%5],o:on?(Math.sin(t*14)>0?1:0.2):0})});
  // 秒表：分钟数越走越快
  const s=Math.floor(MO.E.inQ(MO.prog(t,0.2,D-0.2))*14*60+t*7);$(id+'w').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  MO.set($(id+'w'),{s:MO.ease('outBack')(MO.prog(t,0.1,0.4))*(1+0.04*Math.sin(t*10)),r:t>HD?Math.sin(t*24)*3:0});
  K.title($(id+'hd')._chars,t,HD-0.1,'punch');MO.set($(id+'nt'),{o:MO.tw(t,HD+0.4,0.3)});
  MO.ring(g,t,HD,820,245,{r1:330,width:10,color:'255,201,77'});F.forEach(a=>MO.ring(g,t,a,330,520+F.indexOf(a)*104,{r1:120,width:5,color:'63,209,181'}))},
 sfx:sc=>[[0.6,'tick'],[at(sc,'规格',2.0),'tick'],[at(sc,'库存',3.4),'tick'],[at(sc,'十几分钟',4.6),'pop']]},

/* 1 对比：左边填完才查（放大镜找到填反的那行），右边填一项打一个勾 */
versus:{bg:'#071a1b',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}la" style="left:70px;top:180px"><span class="v-pill hot" style="font-size:44px">${H.fmt(sc.left.label)} · ${H.fmt(sc.left.value)}</span></div>
  <div class="v-a" id="${id}ra" style="left:560px;top:300px"><span class="v-pill" style="background:rgba(63,209,181,.2);color:${TEAL};border:3px solid ${TEAL};font-size:32px">${H.fmt(sc.right.label)} · ${H.fmt(sc.right.value)}</span></div>
  <div class="b-half" id="${id}L" style="left:60px;background:rgba(60,20,14,.35)">${sc.rows.map((r,i)=>`<div class="b-mr" id="${id}l${i}">${H.fmt(r[0])}<div class="bx" id="${id}lb${i}"></div></div>`).join('')}
   <div class="b-mr" id="${id}lw" style="background:rgba(255,90,78,.22);border:3px solid ${RED};font-size:32px">${I.warn(44,RED)}${H.fmt(sc.wrong)}</div>
   <div class="b-mag" id="${id}mg" style="left:0;top:0"></div></div>
  <div class="b-half" id="${id}R" style="left:560px;background:rgba(14,60,52,.35)">${sc.rows.map((r,i)=>`<div class="b-mr" id="${id}r${i}">${H.fmt(r[0])}<div class="bx" id="${id}rb${i}"></div></div>`).join('')}${sc.rows.map((r,i)=>`<div class="b-mr" id="${id}s${i}">${H.fmt(r[1])}<div class="bx" id="${id}sb${i}"></div></div>`).join('')}</div>`),
 init:(sc,id,H)=>{sc._H=H},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const A=at(sc,'填完再查',0.8,H),W=at(sc,'回头找',2.4,H),R=at(sc,'发布助手',3.6,H),C=at(sc,'读回',5.2,H);
  const g=K.frame(id,t,H,BG,{seed:13,beats:[A,W,R,C]});
  MO.set($(id+'la'),{x:-500*(1-MO.tw(t,0.05,0.45,'outBack')),o:MO.tw(t,0.05,0.2)});MO.set($(id+'L'),{y:200*(1-MO.tw(t,0.1,0.5,'outBack')),o:MO.tw(t,0.1,0.2)*(1-0.45*MO.tw(t,R,0.4)),s:1-0.04*MO.tw(t,R,0.4)});
  // 左：一口气填完（不打勾），然后放大镜来回找，找到填反的那行
  sc.rows.forEach((_,i)=>{MO.set($(id+'l'+i),{x:-60*(1-MO.tw(t,0.3+i*0.15,0.3,'outBack')),o:MO.tw(t,0.3+i*0.15,0.2)});$(id+'lb'+i).innerHTML=t>A+0.4?`<span style="color:#ffb3aa;font-size:40px;font-weight:900">?</span>`:''});
  const sx=MO.lerp(40,250,(Math.sin(t*3)+1)/2),sy=MO.lerp(10,300,(Math.sin(t*1.7+1)+1)/2);const found=t>W;
  MO.set($(id+'mg'),{x:found?MO.lerp(sx,180,MO.prog(t,W,W+0.3)):sx,y:found?MO.lerp(sy,380,MO.prog(t,W,W+0.3)):sy,s:MO.ease('outBack')(MO.prog(t,A,A+0.3)),o:t>A?1:0});
  MO.set($(id+'lw'),{s:MO.ease('outBackBig')(MO.prog(t,W,W+0.3)),o:t>W?1:0,x:found?Math.sin(t*30)*6*(1-MO.prog(t,W+0.4,W+1)):0});
  // 右：填一格、立刻打勾
  MO.set($(id+'ra'),{x:500*(1-MO.tw(t,R-0.1,0.45,'outBack')),o:MO.tw(t,R-0.1,0.2)});MO.set($(id+'R'),{y:200*(1-MO.tw(t,R,0.5,'outBack')),o:MO.tw(t,R,0.2)});
  const step=Math.max(0.3,(D-R-0.8)/6);
  [...sc.rows.map((_,i)=>'r'+i),...sc.rows.map((_,i)=>'s'+i)].forEach((k,j)=>{const a=R+0.3+j*step;const el=$(id+k);MO.set(el,{x:60*(1-MO.tw(t,a,0.3,'outBack')),o:MO.tw(t,a,0.2)});
   const ok=t>a+step*0.6;$(id+k.replace(/(\d)/,'b$1')).innerHTML=ok?tick(36,'#05231d'):'';$(id+k.replace(/(\d)/,'b$1')).style.background=ok?TEAL:'transparent';el.style.borderLeft=ok?`6px solid ${TEAL}`:'6px solid transparent';
   if(ok)MO.set($(id+k.replace(/(\d)/,'b$1')),{s:1+0.25*Math.sin(Math.PI*MO.prog(t,a+step*0.6,a+step*0.6+0.25))})});
  MO.ring(g,t,W,290,820,{r1:300,width:10,color:'255,90,78'});MO.ring(g,t,R,790,600,{r1:360,width:8,color:'63,209,181'})},
 sfx:sc=>[[at(sc,'回头找',2.4),'pop'],[at(sc,'发布助手',3.6),'pop'],[at(sc,'读回',5.2),'ding']]},

/* 2 实录：真实后台放进浏览器框，镜头推近表单；"已读回"标签一个个弹出 */
real:{bg:'#071a1b',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}ln" style="left:70px;top:180px"><span class="v-pill" style="background:rgba(63,209,181,.18);color:${TEAL};border:3px solid ${TEAL};font-size:38px">${H.fmt(sc.line)}</span></div>
  ${K.win(id,H.fmt(sc.win),{x:60,y:300,w:960,h:900})}
  <div class="v-a v-shi" id="${id}shi" style="right:84px;top:380px">示意</div>
  ${[0,1,2].map(k=>`<div class="v-a v-tag ok" id="${id}t${k}" style="font-size:34px">${tick(30,MINT)} ${H.fmt(sc.tag)}</div>`).join('')}`),
 init:(sc,id,H)=>{sc._H=H;H.$(id+'body').innerHTML=`<canvas id="${id}cv" width="960" height="836" style="position:absolute;inset:0"></canvas>`;if(H.frame(sc,0))H.$(id+'shi').style.display='none'},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const B1=at(sc,'标题',0.9,H),B2=at(sc,'货号',1.7,H),B3=at(sc,'读回来',2.9,H);
  const g=K.frame(id,t,H,BG,{seed:23,beats:[B1,B2,B3]});MO.set($(id+'ln'),{o:MO.tw(t,0.1,0.3)});
  MO.set($(id+'win'),{y:160*(1-MO.tw(t,0.05,0.55,'outBack')),r:MO.wob(t,3,0.4,0.3)});
  const c=$(id+'cv'),cg=c.getContext('2d');cg.fillStyle='#f4f5f2';cg.fillRect(0,0,c.width,c.height);const im=H.frame(sc,t);
  if(im){const W=im.width,Hh=im.height,z0=W*c.height/c.width/Hh*1.01;
   const z=MO.kf(t,[[0,z0],[B1,z0*1.05],[B1+0.5,z0*1.45,'outBack'],[B3,z0*1.5],[B3+0.5,z0*1.9,'outBack'],[D,z0*2]]);
   const vx=MO.kf(t,[[0,W/2],[B1+0.5,W*0.5,'inOutC'],[B3+0.5,W*0.45,'inOutC'],[D,W*0.47]]),vy=MO.kf(t,[[0,Hh/2],[B1+0.5,Hh*0.5,'inOutC'],[B2+0.4,Hh*0.56,'inOutC'],[B3+0.5,Hh*0.6,'inOutC'],[D,Hh*0.64]]);
   const vw=W/z,vh=vw*c.height/c.width,sx=Math.min(Math.max(vx-vw/2,0),W-vw),sy=Math.min(Math.max(vy-vh/2,0),Hh-vh);cg.drawImage(im,sx,sy,vw,vh,0,0,c.width,c.height)}
  else{for(let k=0;k<7;k++){cg.fillStyle='rgba(0,0,0,.08)';cg.fillRect(60,60+k*100,MO.lerp(100,700,MO.prog(t,0.3+k*0.2,0.9+k*0.2)),40)}}
  const sp=((t*0.7)%1)*(c.width+400)-200,gr=cg.createLinearGradient(sp-120,0,sp+120,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.5,'rgba(255,255,255,.3)');gr.addColorStop(1,'rgba(255,255,255,0)');cg.fillStyle=gr;cg.fillRect(0,0,c.width,c.height);
  // 每读回一项，旁边弹出一个"已读回"
  [B1+0.4,B2+0.4,B3+0.4].forEach((a,k)=>MO.set($(id+'t'+k),{x:[620,90,560][k],y:[520,760,1000][k]+MO.wob(t,k+5,5,0.7),s:MO.ease('outBackBig')(MO.prog(t,a,a+0.3)),o:t>a?1:0}));
  [B1,B2,B3].forEach((a,k)=>MO.ring(g,t,a+0.4,[760,230,700][k],[545,785,1025][k],{r1:180,width:6,color:'91,214,155'}))},
 sfx:sc=>[[at(sc,'标题',0.9)+0.4,'tick'],[at(sc,'货号',1.7)+0.4,'tick'],[at(sc,'读回来',2.9)+0.4,'ding']]},

/* 3 中段悬念：两条对比条；"关键在最后一步"上锁 */
why:{bg:'#071a1b',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:128px">${H.fmt(sc.head)}</div>
  ${sc.items.map((it,i)=>`<div class="b-bar" id="${id}b${i}" style="top:${470+i*240}px"><div class="t">${i?I.check(46,TEAL):I.cross(46,RED)}${H.fmt(it[0])}<b style="color:${i?TEAL:'#ffb3aa'}">${H.fmt(it[1])}</b></div><div class="tr"><i id="${id}f${i}" style="background:${i?`linear-gradient(90deg,${TEAL},#a6f3e2)`:`linear-gradient(90deg,${RED},#ff9a6b)`}"></i></div></div>`).join('')}
  <div class="v-a" id="${id}kp" style="left:70px;top:1000px"><span class="v-pill" style="background:linear-gradient(150deg,#1a3d39,#0a2220);border:3px solid rgba(255,201,77,.7);color:#fff;font-size:48px">${I.lock(46)} ${H.fmt(sc.key)}</span></div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const Q=at(sc,'凭什么',0.3,H),KY=at(sc,'关键',2.2,H);
  const g=K.frame(id,t,H,{...BG,hue:[255,180,60]},{seed:33,push:0.06,beats:[Q,KY]});
  K.title($(id+'hd')._chars,t,0.05,'punch');if(t>1)MO.textWave($(id+'hd')._chars,t,{amp:6,from:1});
  sc.items.forEach((_,i)=>{const a=0.4+i*0.35;MO.set($(id+'b'+i),{x:-300*(1-MO.tw(t,a,0.45,'outBack')),o:MO.tw(t,a,0.2)});
   const f=$(id+'f'+i);if(i===0){f.style.width=(30+50*MO.prog(t,a,a+1.4)+6*Math.sin(t*7)).toFixed(1)+'%';f.style.opacity=(0.6+0.4*Math.abs(Math.sin(t*5))).toFixed(2)}else f.style.width=(100*MO.E.outC(MO.prog(t,a,a+1.2))).toFixed(1)+'%'});
  MO.set($(id+'kp'),{x:-700*(1-MO.tw(t,KY-0.1,0.5,'outBack')),o:MO.tw(t,KY-0.1,0.2),s:1+0.03*Math.sin(t*5)});
  MO.ring(g,t,KY,380,1050,{r1:380,width:10,color:'255,201,77'});MO.dust(g,t,{n:20,seed:51,color:'255,201,77',size:[3,7],alpha:[.3,.85],speed:-60,drift:50})},
 sfx:sc=>[[0.1,'pop'],[at(sc,'关键',2.2),'pop']]},

/* 4 揭晓：资料飞进页面，再读回来对；库存读回 12 对不上 120，标红停下 */
readback:{bg:'#071a1b',
 build:(sc,id,H)=>K.layers(id,`
  <div class="b-wm" id="${id}wm" style="left:560px;top:1300px">${H.fmt(sc.num)}</div>
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:170px;font-size:124px">${H.fmt(sc.head)}</div>
  <div class="b-col" id="${id}A" style="left:60px"><div class="hd">${I.table(40,TEAL)}${H.fmt(sc.src)}</div>${sc.pairs.map((p,i)=>`<div class="b-cell" id="${id}a${i}"><div class="k">${H.fmt(p[0])}</div><div class="v">${H.fmt(p[1])}</div></div>`).join('')}</div>
  <div class="b-col" id="${id}B" style="left:590px"><div class="hd">${I.list(40,TEAL)}${H.fmt(sc.page)}</div>${sc.pairs.map((p,i)=>`<div class="b-cell" id="${id}b${i}"><div class="k">${H.fmt(p[0])}</div><div class="v" id="${id}v${i}"></div><div class="v-a" id="${id}k${i}" style="right:16px;top:34px;width:58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center"></div></div>`).join('')}</div>
  ${sc.pairs.map((p,i)=>`<div class="b-fly" id="${id}f${i}">${H.fmt(p[1])}</div>`).join('')}
  <div class="b-stop" id="${id}sp">${I.warn(60,'#fff')} ${H.fmt(sc.stop)}</div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const RB=at(sc,'读回',0.3,H),E=at(sc,'对不上',D-2.6,H),ST=at(sc,'停下来',D-1.4,H);
  const g=K.frame(id,t,H,{...BG,hue:[91,214,155]},{seed:43,beats:[RB,E,ST]});
  K.title($(id+'hd')._chars,t,0.05,'punch');MO.set($(id+'wm'),{o:MO.tw(t,0.3,0.4),y:MO.wob(t,3,12,0.4)});
  MO.set($(id+'A'),{x:-400*(1-MO.tw(t,0.1,0.5,'outBack')),o:MO.tw(t,0.1,0.2)});MO.set($(id+'B'),{x:400*(1-MO.tw(t,0.25,0.5,'outBack')),o:MO.tw(t,0.25,0.2)});
  const n=sc.pairs.length,span=Math.max(0.8,(E-0.9)/n);
  sc.pairs.forEach((p,i)=>{const a=0.9+i*span,bad=i===sc.bad;const u=MO.prog(t,a,a+span*0.45),back=MO.prog(t,a+span*0.5,a+span*0.9);
   const y=470+80+i*142+30;MO.set($(id+'f'+i),{x:MO.lerp(90,620,MO.E.inOutC(u))+(back>0?MO.lerp(0,-500,MO.E.inOutC(back)):0),y:y-Math.sin(Math.PI*u)*70-Math.sin(Math.PI*back)*50,s:back>0?0.75:1,o:(t>a&&back<1)?1:0});
   $(id+'f'+i).style.background=back>0?(bad?RED:'#fff'):TEAL;$(id+'f'+i).textContent=H.plain(back>0&&bad?sc.badval:p[1]);
   $(id+'v'+i).textContent=t>a+span*0.45?H.plain(bad?sc.badval:p[1]):'';
   const done=t>a+span*0.9,k=$(id+'k'+i);k.innerHTML=done?(bad?I.cross(34,'#fff'):tick(34,'#05231d')):'';k.style.background=done?(bad?RED:TEAL):'transparent';
   if(done)MO.set(k,{s:1+0.3*Math.sin(Math.PI*MO.prog(t,a+span*0.9,a+span*0.9+0.25))});
   const hl=bad&&t>a+span*0.9;$(id+'b'+i).style.outline=hl?`5px solid ${RED}`:'none';$(id+'a'+i).style.outline=hl?`5px solid ${RED}`:'none';if(hl)MO.set($(id+'b'+i),{x:Math.sin(t*30)*5*(1-MO.prog(t,E+0.3,E+0.9))})});
  MO.set($(id+'sp'),{s:MO.ease('outBackBig')(MO.prog(t,ST-0.2,ST+0.15)),o:t>ST-0.2?1:0,y:MO.wob(t,7,4,0.6)});
  MO.ring(g,t,E,805,1000,{r1:400,width:12,color:'255,90,78'});K.flash(g,t,ST,0.15,'255,230,225');MO.burst(g,t,ST+0.1,540,1245,{n:24,seed:4,colors:[RED,'#fff',GOLD],speed:[300,800],life:1})},
 sfx:sc=>[[0.9,'tick'],[at(sc,'对不上',4.4),'pop'],[at(sc,'停下来',5.6),'ding']]},

/* 5 结尾 */
cta:{bg:'#071a1b',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:1030});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:118px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:640px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:670px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#5fe6cc,#16927d)">${I.check(110,'#fff')}</div>`+cb.html)},
 init:(sc,id,H)=>{sc._H=H;split(id,'tt')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:63});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=at(sc,'关注',2.2,H),S=at(sc,'私信',4.4,H)-0.3;const p=sc._cb.anim(t,{show:1.3,follow:F,type:at(sc,'评论',2.8,H)+0.2,send:S});
  MO.burst(g,t,OPEN,540,780,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,780,{r1:700,width:14,color:'63,209,181'});K.flash(g,t,OPEN,0.25,'210,255,240');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.2,'pop'],[3.8,'pop']]},
outro:K.outro(BG),
};
})();
