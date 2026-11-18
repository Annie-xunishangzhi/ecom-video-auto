/* 2026-11-17-s1-a 选品控价 · 专属画面。色调：夜色 + 警示红 + 冷青（行情盘）。
   主线：竞品价格曲线偷偷往下走，你第二天才看到 → 靠感觉、靠手翻，越晚丢单越多 → 竞品比价面板 → 控价有个坑 → 异常一来马上提醒 → 坑：自动跟价越跟越低；提醒交给它，改不改价你来定。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I}=K;
const BG={seed:1,hue:[255,60,80],hue2:[40,200,255],hue3:[255,180,80],base:['#1d1220','#120b16','#07050a']};
const CY='#38d0ff';
const css=`
.g-chart{position:absolute;left:70px;width:940px;border-radius:40px;overflow:hidden}
.g-tag{position:absolute;padding:12px 24px;border-radius:16px;font-size:36px;font-weight:900;color:#fff;white-space:nowrap;box-shadow:0 14px 30px rgba(0,0,0,.45)}
.g-beat{position:absolute;left:70px;width:940px;height:300px;border-radius:44px;display:flex;align-items:center;gap:36px;padding:0 50px;overflow:hidden}
.g-beat .t{font-size:84px;font-weight:900;color:#fff;white-space:nowrap}.g-beat .t b{color:${ACC}}
.g-order{position:absolute;width:150px;height:110px;border-radius:20px;background:linear-gradient(150deg,#ffcf6b,#ff9d3d);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#3a1d00;box-shadow:0 12px 24px rgba(0,0,0,.4)}
.g-rv{display:flex;align-items:center;gap:20px;height:120px;padding:0 30px;border-radius:28px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.1);font-size:42px;font-weight:900;color:#fff;white-space:nowrap}
.g-rv .bar{flex:1;height:28px;border-radius:14px;background:rgba(255,255,255,.1);overflow:hidden}.g-rv .bar i{display:block;height:100%;border-radius:14px;transform-origin:left}
.g-rv .p{width:150px;text-align:right;font-family:"DejaVu Sans Mono",monospace;font-size:40px}
.g-noti{position:absolute;left:70px;width:940px;height:200px;border-radius:40px;background:rgba(30,20,34,.95);border:4px solid ${ACC};box-shadow:0 30px 80px rgba(255,60,80,.45);display:flex;align-items:center;gap:30px;padding:0 36px}
.g-noti .tx{display:flex;flex-direction:column;gap:6px;font-size:52px;font-weight:900;color:#fff;white-space:nowrap}.g-noti .tx small{font-size:36px;color:#ffb3b3;font-weight:700}
.g-half{position:absolute;left:70px;width:940px;height:300px;border-radius:44px;display:flex;align-items:center;gap:30px;padding:0 50px;font-size:72px;font-weight:900;color:#fff;white-space:nowrap}
.g-half b{color:${GOLD}}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
/* 画一条价格曲线：pts 0..1 的序列，画到进度 p */
function line(g,pts,p,{x=0,y=0,w=940,h=500,color=CY,width=8,glow=true}={}){const n=pts.length-1;const last=Math.max(1,p*n);g.save();g.lineWidth=width;g.strokeStyle=color;g.lineJoin='round';g.lineCap='round';
 if(glow){g.shadowColor=color;g.shadowBlur=20}g.beginPath();for(let i=0;i<=Math.floor(last);i++){const px=x+i/n*w,py=y+h-(pts[i])*h;i?g.lineTo(px,py):g.moveTo(px,py)}
 const f=last%1,i0=Math.floor(last);if(i0<n&&f>0){const px=x+(i0+f)/n*w,py=y+h-(pts[i0]+(pts[i0+1]-pts[i0])*f)*h;g.lineTo(px,py)}g.stroke();g.restore();
 const fx=x+Math.min(last,n)/n*w,i1=Math.min(n,Math.floor(last)),fy=y+h-(pts[i1]+(i1<n?(pts[i1+1]-pts[i1])*(last%1):0))*h;return [fx,fy]}

window.VISUALS={
/* 0 钩子：竞品价格曲线夜里悄悄往下掉，你的价格没动；第二天才发现 */
drop:{bg:'#120b16',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="position:absolute;left:-60px;top:-60px;width:1200px;height:2040px;object-fit:cover;opacity:.4">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,11,22,.8),rgba(18,11,22,.5) 40%,rgba(18,11,22,.95))"></div>`+K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:170px;font-size:128px">${H.fmt(sc.head)}</div>
  <canvas class="v-a" id="${id}cv" width="940" height="640" style="left:70px;top:420px"></canvas>
  <div class="g-tag" id="${id}you" style="background:#3b4a6b">你的店</div><div class="g-tag" id="${id}riv" style="background:${ACC}">竞品</div>
  <div class="v-a" id="${id}mn" style="left:70px;top:1110px;display:flex;gap:24px;align-items:center"><span class="v-pill dim" id="${id}day" style="font-size:40px">夜里</span></div>
  <div class="v-a v-stamp" id="${id}stp" style="left:70px;top:1180px;font-size:84px;background:rgba(18,11,22,.85)">${H.fmt(sc.found)}</div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,dust:16,grid:false},{seed:2,push:0.03,beats:[0.4,H.at(sc,'偷偷')??0.6,H.at(sc,'降价')??1.0,H.at(sc,'一个个')??1.6,H.at(sc,'去翻')??2.1,H.at(sc,'第二天')??2.6]});
  MO.set($(id+'img'),{s:1.05+0.1*MO.prog(t,0,H.dur)});K.title($(id+'hd')._chars,t,0.05,'punch');
  const c=MO.canvas($(id+'cv'));c.strokeStyle='rgba(255,255,255,.06)';c.lineWidth=2;for(let k=1;k<6;k++){c.beginPath();c.moveTo(0,k*106);c.lineTo(940,k*106);c.stroke()}
  const p=MO.prog(t,0.3,(H.at(sc,'第二天')??2.6));
  const riv=[0.72,0.73,0.71,0.72,0.66,0.6,0.52,0.45,0.4,0.36];const you=[0.7,0.7,0.7,0.7,0.7,0.7,0.7,0.7,0.7,0.7];
  const [yx,yy]=line(c,you,p,{color:'#7d8db8',h:560,y:40,width:6,glow:false});const [rx,ry]=line(c,riv,p,{color:ACC,h:560,y:40});
  MO.glow(c,rx,ry,60+40*Math.abs(Math.sin(t*6)),'rgba(255,60,80,.8)');
  MO.set($(id+'you'),{x:70+Math.min(yx,800),y:420+yy-80,o:MO.tw(t,0.4,0.2)});MO.set($(id+'riv'),{x:70+Math.min(rx,820),y:420+ry+20,o:MO.tw(t,0.4,0.2),s:1+0.06*Math.sin(t*8)*MO.prog(p,0.5,1)});
  const N=H.at(sc,'第二天')??2.6;$(id+'day').textContent=t<N?'夜里 · 你在睡觉':'第二天 早上';MO.set($(id+'mn'),{o:MO.tw(t,0.6,0.3)});
  const sp=MO.prog(t,N,N+0.3);MO.set($(id+'stp'),{s:MO.lerp(2.4,1,MO.E.outBackBig(sp)),r:-8+MO.wob(t,4,1.5,0.8),o:sp>0?1:0});
  MO.ring(g,t,N,560,1240,{r1:420,width:10})},
 sfx:()=>[[0.1,'pop'],[2.6,'ding']]},

/* 1 靠感觉、靠手翻；发现越晚，订单一张张飞走 */
lose:{bg:'#120b16',
 build:(sc,id,H)=>K.layers(id,`
  ${sc.beats.map((b,i)=>`<div class="g-beat v-glass" id="${id}b${i}" style="top:${190+i*330}px"><div style="flex:none;width:150px;height:150px;display:flex;align-items:center;justify-content:center" id="${id}ic${i}">${i?I.search(140):I.spark(130,'#c9a7ff')}</div><div class="t">${H.fmt(b[0])}<b>${H.fmt(b[1])}</b></div></div>`).join('')}
  ${Array.from({length:8},(_,k)=>`<div class="g-order" id="${id}o${k}">订单</div>`).join('')}
  <div class="v-a v-t" id="${id}a" style="left:70px;top:1000px;font-size:100px">${H.fmt(sc.head)}</div>
  <div class="v-a v-t" id="${id}b" style="left:70px;top:1130px;font-size:140px">${H.fmt(sc.head2)}</div>`),
 init:(sc,id)=>split(id,'a','b'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:12});const at=[H.at(sc,'选品')??0.1,H.at(sc,'比价')??1.0];
  at.forEach((a,i)=>{const p=MO.spring(t-a,1.4,6);MO.set($(id+'b'+i),{x:(i?1:-1)*800*(1-Math.min(1,p)),y:MO.wob(t,i+2,6,0.5),o:1-0.5*MO.tw(t,(H.at(sc,'乱价')??2.0),0.4)})});
  MO.set($(id+'ic0'),{r:Math.sin(t*3)*20,s:1+0.1*Math.sin(t*5)});MO.set($(id+'ic1'),{x:Math.sin(t*6)*30,y:Math.cos(t*5)*10});
  const L=H.at(sc,'发现得越晚')??2.2,O=H.at(sc,'丢的单')??3.4;K.title($(id+'a')._chars,t,L-0.1,'slide');K.title($(id+'b')._chars,t,O-0.2,'punch');
  for(let k=0;k<8;k++){const a=O-0.4+k*0.12;const u=MO.prog(t,a,a+1.1);const x0=120+(k%4)*220,y0=1350+Math.floor(k/4)*130;
   MO.set($(id+'o'+k),{x:x0+u*(k%2?500:-500),y:y0-u*u*900,r:u*(k%2?50:-50),s:1-0.4*u,o:(t>O-0.8?MO.tw(t,O-0.8+k*0.05,0.2):0)*(1-MO.prog(u,0.7,1))})}
  MO.ring(g,t,O,540,1200,{r1:500,width:10})},
 sfx:()=>[[0.1,'pop'],[1.0,'pop'],[3.3,'pop']]},

/* 2 实录槽位（示意）：行业数据汇总，竞品价格自动对比 */
compare:{bg:'#120b16',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" style="left:70px;top:175px"><span class="v-pill dim" id="${id}ln" style="font-size:38px">${H.fmt(sc.line)}</span></div>
  ${K.win(id,H.fmt(sc.win),{x:60,y:290,w:960,h:1100})}
  <div class="v-a v-shi" style="right:84px;top:370px">示意</div>`),
 init:(sc,id,H)=>{H.$(id+'body').innerHTML=`<canvas id="${id}cv" width="960" height="1036" style="position:absolute;inset:0;display:none"></canvas><div id="${id}sim" style="padding:30px">
  <canvas id="${id}tr" width="900" height="380" style="display:block;border-radius:24px;background:rgba(255,255,255,.04)"></canvas>
  <div style="font-size:38px;font-weight:900;color:#fff;margin:26px 0 14px">竞品价格对比</div>
  <div style="display:flex;flex-direction:column;gap:16px">${[sc.you,...sc.rivals].map((r,i)=>`<div class="g-rv" id="${id}r${i}"><span style="width:180px">${H.fmt(r)}</span><div class="bar"><i id="${id}b${i}" style="background:${i?'linear-gradient(90deg,#ff7a8a,'+ACC+')':'linear-gradient(90deg,#7dd3fc,'+CY+')'}"></i></div><span class="p" id="${id}p${i}" style="color:${i?'#ffb3b3':CY}"></span></div>`).join('')}</div></div>`;
  if(H.frame(sc,0)){H.$(id+'cv').style.display='block';H.$(id+'sim').style.display='none'}},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:22});
  MO.set($(id+'win'),{y:200*(1-MO.tw(t,0,0.6,'outBack')),r:MO.wob(t,2,0.4,0.3)});MO.set($(id+'ln'),{o:MO.tw(t,0.2,0.3)});
  const im=H.frame(sc,t);if(im){const c=$(id+'cv');H.drawFrame(c.getContext('2d'),im,0,0,c.width,c.height);return}
  const A=H.at(sc,'行业数据')??0.3,C=H.at(sc,'竞品价格')??1.8;
  const tr=MO.canvas($(id+'tr'));const p=MO.prog(t,A,A+1.4);
  [[0.3,0.4,0.38,0.5,0.55,0.52,0.62,0.7,0.68,0.78],[0.2,0.25,0.3,0.28,0.35,0.42,0.4,0.48,0.5,0.56],[0.5,0.48,0.52,0.6,0.58,0.62,0.66,0.64,0.7,0.72]].forEach((pts,k)=>line(tr,pts,p,{x:20,y:20,w:860,h:340,color:[CY,'#c9a7ff',GOLD][k],width:6}));
  const vals=[0.62,0.7,0.48,0.66];
  [sc.you,...sc.rivals].forEach((_,i)=>{const a=C+i*0.18;const v=MO.tw(t,a,0.5,'outC')*vals[i]*(1+0.03*Math.sin(t*4+i));$(id+'b'+i).style.transform=`scaleX(${v.toFixed(3)})`;
   MO.set($(id+'r'+i),{x:-60*(1-MO.tw(t,a-0.1,0.3,'outBack')),o:MO.tw(t,a-0.1,0.2)});
   const low=i===2&&t>a+0.6;$(id+'p'+i).textContent=t>a+0.3?(i===0?'基准':(vals[i]<vals[0]?'↓ 更低':'↑ 更高')):'';$(id+'r'+i).style.borderColor=low?ACC:'rgba(255,255,255,.1)'});
  MO.ring(g,t,C+0.9,540,1180,{r1:400,width:8})},
 sfx:()=>[[0.3,'tick'],[1.8,'tick'],[2.0,'tick'],[2.2,'tick']]},

/* 3 中段悬念：价格自动走，前面有个坑 */
pit:{bg:'#120b16',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}a" style="top:175px;font-size:120px">${H.fmt(sc.head)}</div>
  <div class="v-a v-t v-ctr" id="${id}b" style="top:310px;font-size:130px">${H.fmt(sc.head2)}</div>
  <canvas class="v-a" id="${id}cv" width="1080" height="820" style="left:0;top:500px"></canvas>
  <div class="v-a" id="${id}wn" style="left:740px;top:560px;width:220px;height:200px">${I.warn(220)}</div>`),
 init:(sc,id)=>split(id,'a','b'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,hue:[255,170,40]},{seed:32,push:0.07,beats:[H.at(sc,'不过')??0.2,H.at(sc,'自动控价')??0.8,H.at(sc,'有一个坑')??1.5,H.at(sc,'很多人')??2.2,H.at(sc,'第一次')??2.8,H.at(sc,'都会踩')??3.4]});
  K.title($(id+'a')._chars,t,0.1,'rise');K.title($(id+'b')._chars,t,(H.at(sc,'第一次')??1.8)-0.2,'punch');if(t>2.4)MO.textWave($(id+'b')._chars,t,{amp:6,from:2.4});
  const c=MO.canvas($(id+'cv'));// 台阶一样往下走的价格线，尽头是一个发光的坑
  const pts=[0.8,0.8,0.74,0.74,0.66,0.66,0.56,0.56,0.44,0.44,0.3,0.3];const p=MO.prog(t,0.4,H.dur-0.4);const [ex,ey]=line(c,pts,p,{x:80,y:60,w:760,h:560,color:CY});
  const hx=880,hy=680;MO.glow(c,hx,hy,220,'rgba(255,60,80,.6)');c.save();c.translate(hx,hy);c.scale(1,0.4);c.fillStyle='#05030a';c.beginPath();c.arc(0,0,130*MO.tw(t,0.2,0.5,'outBack'),0,7);c.fill();c.strokeStyle=ACC;c.lineWidth=10;c.stroke();c.restore();
  MO.glow(c,ex,ey,50,'rgba(56,208,255,.9)');for(let k=1;k<6;k++){const tk=0.4+(2*k/11)*(H.dur-0.8);MO.ring(g,t,tk,80+760*(2*k/11),500+60+560*(1-pts[2*k]),{r1:160,width:6,color:'56,208,255',life:0.6})}
  MO.set($(id+'wn'),{r:Math.sin(t*3)*8,s:MO.ease('outBack')(MO.prog(t,0.4,0.8))*(1+0.05*Math.sin(t*6))});
  MO.dust(g,t,{n:22,seed:71,color:'255,201,77',size:[3,6],alpha:[.3,.8],speed:-60,drift:50})},
 sfx:()=>[[0.4,'pop'],[1.8,'pop']]},

/* 4 价格一异常，通知马上弹出来 */
alert:{bg:'#120b16',
 build:(sc,id,H)=>K.layers(id,`
  <canvas class="v-a" id="${id}cv" width="940" height="520" style="left:70px;top:200px"></canvas>
  <div class="g-noti" id="${id}nt" style="top:820px"><div class="v-ic" style="width:120px;height:120px;border-radius:32px;flex:none" id="${id}bl">${I.bell(80)}</div><div class="tx">${H.fmt(sc.alert)}<small>${H.fmt(sc.msg)}</small></div><span class="v-pill light" style="margin-left:auto;font-size:36px">${H.fmt(sc.act)}</span></div>
  <div class="v-a v-ctr" id="${id}nb" style="top:1100px"><span class="v-pill dim" style="font-size:34px">开发中 · 功能示意</span></div>`),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:42});
  const c=MO.canvas($(id+'cv'));const pts=[0.6,0.62,0.61,0.63,0.62,0.6,0.62,0.61,0.3,0.28];const N=H.at(sc,'异常')??0.6;
  const p=MO.prog(t,0.05,N+0.4);const [x,y]=line(c,pts,p,{x:20,y:20,w:900,h:480,color:p>0.85?ACC:CY});if(p>0.85){MO.glow(c,x,y,80,'rgba(255,60,80,.9)')}
  const a=N+0.35;const pp=MO.spring(t-a,1.4,6);MO.set($(id+'nt'),{y:-300*(1-Math.min(1,Math.max(0,pp))),s:Math.max(0,Math.min(1.08,pp)),o:t>a?1:0,x:t>a&&t<a+0.5?Math.sin(t*40)*6:0});
  MO.set($(id+'bl'),{r:Math.sin(t*18)*14*Math.max(0,1-(t-a)/1.2)+Math.sin(t*3)*3});MO.set($(id+'nb'),{o:MO.tw(t,a+0.5,0.3)});
  MO.ring(g,t,a,540,920,{r1:600,width:14});K.flash(g,t,a,0.2,'255,120,120');MO.ring(g,t,a+0.4,540,920,{r1:500,width:6})},
 sfx:()=>[[1.0,'ding']]},

/* 5 揭晓：自动跟价越跟越低（亏），→ 提醒交给它，改不改价你来定 */
decide:{bg:'#120b16',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-ctr" id="${id}tr" style="top:180px"><span class="v-pill hot" style="font-size:46px">${H.fmt(sc.trap)} · ${H.fmt(sc.spiral)}</span></div>
  <canvas class="v-a" id="${id}cv" width="940" height="560" style="left:70px;top:290px"></canvas>
  <div class="v-a v-stamp" id="${id}stp" style="left:560px;top:620px;font-size:84px;background:rgba(18,11,22,.85)">${H.fmt(sc.loss)}</div>
  ${sc.split.map((s,i)=>`<div class="g-half" id="${id}h${i}" style="top:${900+i*320}px;${i?`background:linear-gradient(150deg,rgba(255,201,77,.25),rgba(255,201,77,.06));border:4px solid rgba(255,201,77,.7)`:`background:linear-gradient(150deg,rgba(56,208,255,.22),rgba(56,208,255,.05));border:3px solid rgba(56,208,255,.5)`}"><div style="flex:none">${i?I.hand(130):I.bell(110,CY)}</div>${H.fmt(s[0])}<b style="margin-left:auto;color:${i?GOLD:CY}">${H.fmt(s[1])}</b></div>`).join('')}`),
 anim:(sc,id,t,H)=>{const T1=H.at(sc,'自动跟价')??0.6,LOSS=H.at(sc,'容易亏')??2.2,REM=H.at(sc,'提醒交给')??3.0,YOU=H.at(sc,'改不改价')??4.0;
  const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:52,beats:[0.3,H.at(sc,'这个坑')??0.2,T1,H.at(sc,'一乱改')??1.6,LOSS,REM,YOU]});
  MO.set($(id+'tr'),{s:MO.ease('outBackBig')(MO.prog(t,T1-0.2,T1+0.1)),o:MO.tw(t,T1-0.2,0.1)*(1-0.4*MO.tw(t,REM,0.3))});
  // 两条价格互相跟，螺旋往下
  const c=MO.canvas($(id+'cv'));const p=MO.prog(t,T1,LOSS+0.3);const a=[],b=[];for(let k=0;k<12;k++){a.push(0.85-k*0.07+(k%2?0.03:0));b.push(0.82-k*0.07-(k%2?0:0.03))}
  c.globalAlpha=1-0.6*MO.tw(t,REM,0.4);line(c,a,p,{x:20,y:20,w:900,h:520,color:CY});line(c,b,p,{x:20,y:20,w:900,h:520,color:ACC});c.globalAlpha=1;
  const sp=MO.prog(t,LOSS,LOSS+0.3);MO.set($(id+'stp'),{s:MO.lerp(2.4,1,MO.E.outBackBig(sp)),r:-8+MO.wob(t,4,1.5,0.8),o:sp>0?1-0.5*MO.tw(t,REM,0.3):0});
  [REM,YOU].forEach((a0,i)=>{const pp=MO.spring(t-a0,1.4,6);MO.set($(id+'h'+i),{x:(i?1:-1)*800*(1-Math.min(1,pp)),y:MO.wob(t,i+3,6,0.5),s:i&&t>YOU+0.6?1+0.03*Math.sin(t*5):1})});
  MO.ring(g,t,LOSS,740,690,{r1:400,width:12});MO.burst(g,t,YOU+0.3,540,1380,{n:36,seed:7,colors:[GOLD,'#fff',CY],speed:[400,1000],life:1.2})},
 sfx:()=>[[0.6,'tick'],[2.2,'pop'],[3.0,'pop'],[4.0,'ding']]},

cta:{bg:'#120b16',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:960});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:150px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:530px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:560px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#6be0ff,#1a7fa8)">${I.chart(120)}</div>`+cb.html)},
 init:(sc,id)=>split(id,'tt'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:62});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=H.at(sc,'关注')??2.4,S=(H.at(sc,'上线第一')??4.0)-0.3;const p=sc._cb.anim(t,{show:1.4,follow:F,type:(H.at(sc,'评论')??3.0)+0.2,send:S});
  MO.burst(g,t,OPEN,540,640,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,640,{r1:700,width:14,color:'56,208,255'});K.flash(g,t,OPEN,0.25,'180,230,255');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.4,'pop'],[3.7,'pop']]},
outro:K.outro(BG),
};
})();
