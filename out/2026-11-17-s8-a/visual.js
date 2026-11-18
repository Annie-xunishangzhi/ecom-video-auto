/* 2026-11-17-s8-a 数据复盘 · 专属画面。色调：深海蓝 + 企鹅橙。
   主线：五个后台挨个导表、太阳落山 → 两个平台的数对不上 → 五张表汇成一张 → 三个功能藏一个 → 人工时间都花在哪 → 一张表、口径对齐、直接看结论。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I}=K;
const BG={seed:8,hue:[60,140,255],hue2:[255,77,26],hue3:[120,200,255],base:['#0f1a36','#0a1226','#050912']};
const css=`
.d-win{position:absolute;width:560px;height:340px;border-radius:26px;background:#101a33;border:2px solid #2b3a63;box-shadow:0 30px 60px rgba(0,0,0,.55);overflow:hidden}
.d-win .bar{height:52px;background:#1a2647;color:#b9c6ea;font-size:26px;font-weight:800;display:flex;align-items:center;padding:0 20px;gap:10px;white-space:nowrap}
.d-win .bar i{width:14px;height:14px;border-radius:50%;background:#3b4b7a;display:block}
.d-win .ln{position:absolute;left:24px;height:16px;border-radius:8px;background:rgba(255,255,255,.12)}
.d-exp{position:absolute;right:20px;bottom:20px;padding:10px 22px;border-radius:14px;background:#2d6cdf;color:#fff;font-size:26px;font-weight:900}
.d-xls{position:absolute;width:110px;height:130px;border-radius:14px;background:#fff;display:flex;align-items:flex-end;justify-content:center;padding-bottom:12px;font-size:22px;font-weight:900;color:#1f7a55;box-shadow:0 10px 20px rgba(0,0,0,.4)}
.d-xls:before{content:"";position:absolute;left:14px;right:14px;top:14px;height:60px;border-radius:6px;background:repeating-linear-gradient(180deg,#cfe8dc 0 10px,#fff 10px 16px)}
.d-task{position:absolute;padding:14px 26px;border-radius:18px;font-size:40px;font-weight:900;color:#fff;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.2);white-space:nowrap}
.d-num{position:absolute;top:470px;width:430px;height:620px;border-radius:44px;padding:36px;display:flex;flex-direction:column;gap:18px}
.d-num .p{font-size:34px;font-weight:800;color:#9fb0dc}.d-num .f{font-size:58px;font-weight:900;color:#fff;white-space:nowrap}
.d-bar{width:100%;border-radius:18px;transform-origin:50% 100%}
.d-ne{position:absolute;left:470px;top:680px;width:140px;font-size:180px;font-weight:900;color:${ACC};text-align:center;line-height:1;text-shadow:0 0 50px rgba(255,77,26,.8)}
.d-why{position:absolute;padding:14px 28px;border-radius:999px;font-size:36px;font-weight:800;color:${GOLD};background:rgba(255,201,77,.15);border:2px solid rgba(255,201,77,.5);white-space:nowrap}
.d-card{position:absolute;left:70px;width:940px;height:230px;border-radius:44px;display:flex;align-items:center;gap:30px;padding:0 44px;font-size:62px;font-weight:900;color:#fff;white-space:nowrap}
.d-card .no{flex:none;width:110px;height:110px;border-radius:30px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.12)}
.d-tbl{position:absolute;left:70px;width:940px;border-radius:36px;overflow:hidden}
.d-tr{display:flex;height:84px;border-bottom:1px solid rgba(255,255,255,.08)}
.d-td{flex:1;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:#d6def5;border-right:1px solid rgba(255,255,255,.08);white-space:nowrap}
.d-td i{display:block;height:16px;border-radius:8px;background:rgba(255,255,255,.22)}
.d-pt{display:flex;align-items:center;gap:20px;height:96px;font-size:44px;font-weight:800;color:#fff;white-space:nowrap}
.d-ar{flex:none;width:64px;height:64px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
const winHTML=(id,k,title,x,y,w=560,h=340,exp=true)=>`<div class="d-win" id="${id}w${k}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div class="bar"><i></i><i></i><i></i><span style="margin-left:8px">${title}</span></div>${[0,1,2,3,4].map(r=>`<div class="ln" style="top:${80+r*44}px;width:${40+((r*37+k*19)%45)}%"></div>`).join('')}${exp?`<div class="d-exp" id="${id}x${k}">导出 ↓</div>`:''}</div>`;

window.VISUALS={
/* 0 钩子：五个后台挨个导表，窗外太阳一路落下 */
afternoon:{bg:'#0a1226',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="position:absolute;left:-60px;top:-60px;width:1200px;height:2040px;object-fit:cover;opacity:.45">
  <div id="${id}sky" style="position:absolute;inset:0"></div>`+K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:170px;font-size:124px">${H.fmt(sc.head)}</div>
  <div class="v-a" id="${id}sun" style="left:820px;top:300px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,#fff6c9,#ffb347 55%,rgba(255,120,40,0) 72%)"></div>
  ${sc.wins.map((w,k)=>winHTML(id,k,H.fmt(w),70+k*60,380+k*90)).join('')}
  ${sc.tasks.map((x,i)=>`<div class="d-task" id="${id}t${i}" style="left:${70+i*250}px;top:1010px">${H.fmt(x)}</div>`).join('')}
  <div class="v-a v-t v-acc" id="${id}end" style="left:70px;top:1150px;font-size:96px">${H.fmt(sc.end)}</div>
  <div class="v-a" id="${id}nt" style="left:70px;top:1300px"><span class="v-pill dim" style="font-size:30px;padding:8px 20px">${H.fmt(sc.note)}</span></div>
  ${Array.from({length:5},(_,k)=>`<div class="d-xls" id="${id}f${k}">.xlsx</div>`).join('')}`),
 init:(sc,id)=>split(id,'hd','end'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,grid:false,dust:16},{seed:4,push:0.03});
  const D=H.dur;const ev=MO.prog(t,0,D);$(id+'sky').style.background=`linear-gradient(180deg,rgba(${Math.round(MO.lerp(30,120,ev))},${Math.round(MO.lerp(60,40,ev))},${Math.round(MO.lerp(120,60,ev))},.55),rgba(5,9,18,.95) 70%)`;
  MO.set($(id+'img'),{s:1.05+0.08*ev});MO.set($(id+'sun'),{y:ev*520,s:1+0.4*ev,o:1-0.6*MO.prog(ev,0.7,1)});
  K.title($(id+'hd')._chars,t,0.05,'rise');
  const exp=[0.6,1.0,1.4,1.75,2.1].map((a,k)=>a+(H.at(sc,'挨个')??0.8)-0.8);
  sc.wins.forEach((_,k)=>{const a=0.15+k*0.12;MO.set($(id+'w'+k),{y:200*(1-MO.tw(t,a,0.5,'outBack')),o:MO.tw(t,a,0.2),r:MO.wob(t,k,0.8,0.4)});
   const e=exp[k];const pr=MO.prog(t,e-0.1,e)-MO.prog(t,e,e+0.15);MO.set($(id+'x'+k),{s:1-0.15*pr});$(id+'x'+k).style.background=t>e?'#1f7a55':'#2d6cdf';$(id+'x'+k).textContent=t>e?'已导出 ✓':'导出 ↓';
   // 文件飞到下面堆成一摞
   const u=MO.prog(t,e,e+0.6);MO.set($(id+'f'+k),{x:MO.lerp(70+k*60+420,780+k*14,MO.E.inOutC(u)),y:MO.lerp(380+k*90+260,1180-k*16,MO.E.inOutC(u))-Math.sin(u*Math.PI)*160,r:MO.lerp(0,-8+k*4,u),s:0.7+0.3*u,o:u>0?1:0})});
  const tk=[H.at(sc,'导表')??0.9,H.at(sc,'对数')??2.4,H.at(sc,'写报告')??2.9];
  sc.tasks.forEach((_,i)=>{const p=MO.spring(t-tk[i],1.5,6);MO.set($(id+'t'+i),{s:Math.max(0,p),o:Math.min(1,Math.max(0,p)),y:MO.wob(t,i+7,6,0.6)})});
  const E=H.at(sc,'一个下午')??3.5;K.title($(id+'end')._chars,t,E,'punch');MO.set($(id+'nt'),{o:MO.tw(t,E+0.4,0.3)});
  MO.ring(g,t,E+0.2,350,1210,{r1:420,width:10})},
 sfx:()=>[[0.8,'tick'],[1.2,'tick'],[1.6,'tick'],[2.0,'tick'],[2.3,'tick'],[3.5,'ding']]},

/* 1 两个平台同一个指标，名字不同、高度不同 —— ≠ */
mismatch:{bg:'#0a1226',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:140px">${H.fmt(sc.head)}</div>
  ${[sc.a,sc.b].map((p,i)=>`<div class="d-num v-glass" id="${id}n${i}" style="left:${i?580:70}px"><div class="p">${H.fmt(p[0])}</div><div class="f">${H.fmt(p[1])}</div><div style="flex:1;display:flex;align-items:flex-end;gap:16px">${[0,1,2].map(k=>`<div class="d-bar" id="${id}b${i}${k}" style="height:${[60,80,70][k]+(i?-10*k:8*k)}%;background:${i?'linear-gradient(180deg,#5b8def,#2d4fa8)':'linear-gradient(180deg,#ff8a5c,#d23c10)'}"></div>`).join('')}</div></div>`).join('')}
  <div class="d-ne" id="${id}ne">≠</div>
  ${sc.why.map((w,i)=>`<div class="d-why" id="${id}w${i}">${H.fmt(w)}</div>`).join('')}`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:14,beats:[H.at(sc,'头疼')??0.6,H.at(sc,'每个平台')??1.2,H.at(sc,'口径')??1.8,H.at(sc,'对不上')??2.2]});
  [0,1].forEach(i=>{const p=MO.spring(t-0.1-i*0.2,1.3,6);MO.set($(id+'n'+i),{x:(i?1:-1)*600*(1-Math.min(1,p)),y:MO.wob(t,i+2,8,0.5),r:(i?2:-2)+MO.wob(t,i+4,1.2,0.5)});
   // 两边的柱子此起彼伏地跳（数字一直在变、却总对不上）
   [0,1,2].forEach(k=>MO.set($(id+'b'+i+k),{sy:MO.tw(t,0.5+k*0.1+i*0.15,0.5,'outBack')*(1+0.22*Math.sin(t*4.5+k*1.7+i*2.1))}))});
  const NE=H.at(sc,'对不上')??2.2;K.title($(id+'hd')._chars,t,NE-0.3,'punch');
  const np=MO.prog(t,NE-0.2,NE+0.15);MO.set($(id+'ne'),{s:MO.lerp(3,1,MO.E.outBackBig(np))*(1+0.06*Math.sin(t*8)),o:np>0?1:0,r:Math.sin(t*6)*5});
  sc.why.forEach((_,i)=>{const a=NE+0.4+i*0.35;const p=MO.prog(t,a,a+0.3);MO.set($(id+'w'+i),{x:[110,520][i],y:[1150,1260][i]+MO.wob(t,i+9,8,0.6),s:MO.ease('outBackBig')(p),o:p>0?1:0})});
  MO.ring(g,t,NE,540,770,{r1:500,width:12});MO.ring(g,t,NE+0.12,540,770,{r1:700,width:6})},
 sfx:()=>[[0.1,'pop'],[0.3,'pop'],[2.2,'ding']]},

/* 2 实录槽位（示意）：五张表从四面飞进来，汇成一张，再出结果卡 */
merge:{bg:'#0a1226',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" style="left:70px;top:175px"><span class="v-pill dim" id="${id}ln" style="font-size:38px">${H.fmt(sc.line)}</span></div>
  ${sc.sheets.map((s,k)=>`<div class="d-xls" id="${id}s${k}" style="width:150px;height:170px;font-size:26px">${H.fmt(s)}</div>`).join('')}
  <div class="v-a v-solid" id="${id}tb" style="left:70px;top:420px;width:940px;height:620px;overflow:hidden;padding:30px">
   <div style="display:flex;align-items:center;gap:16px;font-size:44px;font-weight:900;color:#fff;margin-bottom:16px">${I.table(56,'#fff','#2d6cdf')}${H.fmt(sc.result)}</div>
   ${Array.from({length:6},(_,r)=>`<div class="d-tr" id="${id}r${r}">${[0,1,2,3].map(c=>`<div class="d-td"><i style="width:${40+((r*31+c*17)%50)}%"></i></div>`).join('')}</div>`).join('')}
   <div class="v-shi" style="top:auto;bottom:24px">示意</div></div>
  <div class="v-a v-glass" id="${id}res" style="left:170px;top:1090px;width:740px;height:220px;border-radius:40px;display:flex;align-items:center;gap:30px;padding:0 40px;border-color:rgba(91,214,155,.6)">
   <div class="d-ar" style="background:rgba(91,214,155,.2);color:${MINT}">↑</div><div class="d-ar" style="background:rgba(255,77,26,.2);color:${ACC}">↓</div><span style="font-size:54px;font-weight:900;color:#fff;white-space:nowrap">${H.fmt(sc.look)}</span></div>`),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:24});const IN=0.3,LOOK=H.at(sc,'你只管')??2.6;
  MO.set($(id+'ln'),{o:MO.tw(t,0.1,0.3)});
  const from=[[-200,300],[1100,400],[-200,1200],[1100,1300],[440,2000]];
  sc.sheets.forEach((_,k)=>{const u=MO.prog(t,IN+k*0.18,IN+0.75+k*0.18);const tx=465,ty=650;
   MO.set($(id+'s'+k),{x:MO.lerp(from[k][0],tx,MO.E.inOutC(u)),y:MO.lerp(from[k][1],ty,MO.E.inOutC(u)),r:(1-u)*(k%2?20:-20)+MO.wob(t,k,4,0.6)*(1-u),s:1-0.6*MO.prog(u,0.7,1),o:u<1?1:0})});
  const M0=IN+0.75+4*0.18;MO.set($(id+'tb'),{s:0.6+0.4*MO.E.outBack(MO.prog(t,M0-0.2,M0+0.3)),o:MO.tw(t,M0-0.2,0.2)});
  for(let r=0;r<6;r++){const a=M0+r*0.12;MO.set($(id+'r'+r),{x:-60*(1-MO.tw(t,a,0.3,'outBack')),o:MO.tw(t,a,0.2)});$(id+'r'+r).style.background=Math.floor(t*2.5)%6===r&&t>M0+0.8?'rgba(91,140,255,.15)':''}
  MO.set($(id+'res'),{y:120*(1-MO.tw(t,LOOK-0.1,0.5,'outBack')),o:MO.tw(t,LOOK-0.1,0.2),s:1+0.02*Math.sin(t*4)});
  MO.ring(g,t,M0,540,730,{r1:650,width:14,color:'90,140,255'});K.flash(g,t,M0,0.2);MO.burst(g,t,LOOK,540,1200,{n:26,seed:5,colors:[MINT,'#fff',GOLD],speed:[300,800],life:1.0})},
 sfx:()=>[[0.4,'tick'],[0.6,'tick'],[0.8,'tick'],[1.0,'tick'],[1.2,'tick'],[1.8,'pop'],[2.6,'ding']]},

/* 3 中段悬念：三个功能，中间那个上锁 */
three:{bg:'#0a1226',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:130px">${H.fmt(sc.head)}</div>
  ${sc.cards.map((c,i)=>{const lock=c==='？';return `<div class="d-card ${lock?'':'v-glass'}" id="${id}c${i}" style="top:${430+i*260}px;${lock?`background:linear-gradient(150deg,#26305a,#121933);border:4px solid rgba(255,201,77,.75);box-shadow:0 0 70px rgba(255,77,26,.45)`:''}">
   <div class="no" style="${lock?`background:${GOLD}`:''}">${lock?I.lock(70,'#111'):[I.chart(70),'',I.list(70)][i]}</div><span id="${id}x${i}" style="${lock?'font-size:140px;text-shadow:0 0 40px rgba(255,201,77,.9)':''}">${H.fmt(c)}</span>${lock?`<div id="${id}sh" style="position:absolute;inset:0;border-radius:44px"></div>`:''}</div>`}).join('')}
  <div class="v-a" id="${id}lt" style="left:70px;top:1220px"><span class="v-pill dim" style="font-size:40px">${H.fmt(sc.later)} <b id="${id}ar" style="display:inline-block;color:${ACC}">→</b></span></div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,hue:[255,170,40]},{seed:34,push:0.07});
  K.title($(id+'hd')._chars,t,0.05,'drop');const SAVE=H.at(sc,'最省')??1.4;
  [0.3,SAVE,0.55].forEach((a,i)=>{const p=MO.spring(t-a,1.3,6);MO.set($(id+'c'+i),{x:(i%2?1:-1)*700*(1-Math.min(1,p)),y:MO.wob(t,i+5,6,0.5),s:i===1?1+0.04*Math.sin(t*5):1,ry:i===1?MO.wob(t,9,8,0.4):0})});
  MO.set($(id+'x1'),{s:1+0.12*Math.sin(t*6)});MO.sheen($(id+'sh'),(t*0.9)%1.3/1.3*1.3,{w:12,color:'rgba(255,255,255,.3)'});
  const L=H.at(sc,'看到最后')??2.6;MO.set($(id+'lt'),{x:-500*(1-MO.tw(t,L-0.1,0.4,'outBack')),o:MO.tw(t,L-0.1,0.2)});MO.set($(id+'ar'),{x:Math.abs(Math.sin(t*5))*16});
  MO.ring(g,t,SAVE+0.2,540,820,{r1:600,color:'255,201,77'});MO.dust(g,t,{n:22,seed:77,color:'255,201,77',size:[3,7],alpha:[.3,.9],speed:-70,drift:60})},
 sfx:()=>[[0.3,'tick'],[0.55,'tick'],[1.4,'pop']]},

/* 4 人工复盘的时间去哪了：环形图三段长出来（示意比例） */
pie:{bg:'#0a1226',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:175px;font-size:118px">${H.fmt(sc.head)}</div>
  <canvas class="v-a" id="${id}pc" width="760" height="760" style="left:160px;top:380px"></canvas>
  <div class="v-a" id="${id}ck" style="left:430px;top:650px;width:220px;height:220px">${I.clock(220,'#fff')}</div>
  ${sc.parts.map((p,i)=>`<div class="v-a v-pill" id="${id}l${i}" style="font-size:48px;background:${['rgba(255,77,26,.25)','rgba(91,141,239,.3)','rgba(255,201,77,.25)'][i]};color:#fff;border:3px solid ${[ACC,'#5b8def',GOLD][i]}">${H.fmt(p[0])}</div>`).join('')}
  <div class="v-a" id="${id}nt" style="left:70px;top:1330px"><span class="v-pill dim" style="font-size:30px;padding:8px 20px">${H.fmt(sc.note)}</span></div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$;const at=[H.at(sc,'导表')??1.2,H.at(sc,'对口径')??1.8,H.at(sc,'写报告')??2.5];const g=K.frame(id,t,H,BG,{seed:44,beats:[0.5,H.at(sc,'时间都花')??0.9,...at,at[2]+0.9,at[2]+1.8]});K.title($(id+'hd')._chars,t,0.05,'rise');
  const c=$(id+'pc'),pg=MO.canvas(c);const cx=380,cy=380,R=330,w=110;const cols=[ACC,'#5b8def',GOLD];
  let a0=-Math.PI/2;
  pg.lineWidth=w;pg.strokeStyle='rgba(255,255,255,.07)';pg.beginPath();pg.arc(cx,cy,R-w/2,0,7);pg.stroke();
  sc.parts.forEach((p,i)=>{const grow=MO.tw(t,at[i]-0.2,0.6,'outC');const sweep=p[1]*Math.PI*2*grow;pg.strokeStyle=cols[i];pg.lineCap='butt';pg.beginPath();pg.arc(cx,cy,R-w/2+(Math.sin(t*3+i)*4),a0,a0+sweep);pg.stroke();
   const mid=a0+p[1]*Math.PI;const lx=160+cx+Math.cos(mid)*(R+60)-90,ly=380+cy+Math.sin(mid)*(R+40)-40;MO.set($(id+'l'+i),{x:lx,y:ly+MO.wob(t,i,6,0.6),s:MO.ease('outBackBig')(MO.prog(t,at[i]+0.2,at[i]+0.5)),o:t>at[i]+0.2?1:0});a0+=p[1]*Math.PI*2});
  MO.set($(id+'ck'),{r:t*60,s:0.8+0.05*Math.sin(t*4)});MO.set($(id+'nt'),{o:MO.tw(t,0.6,0.3)});
  // 环形图整体先转进来，每长出一段打一个冲击环
  MO.set($(id+'pc'),{r:-90*(1-MO.tw(t,0.1,0.8,'outBack')),s:0.6+0.4*MO.tw(t,0.1,0.8,'outBack')});at.forEach((a,i)=>MO.ring(g,t,a,540,760,{r1:520,width:10,color:['255,77,26','91,141,239','255,201,77'][i]}))},
 sfx:()=>[[1.2,'tick'],[1.8,'tick'],[2.5,'tick']]},

/* 5 揭晓：三个平台的列飞进一张表，表头"口径已对齐"，再弹出结论卡 */
onetable:{bg:'#0a1226',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:170px;font-size:140px">${H.fmt(sc.head)}</div>
  <div class="v-a v-ctr" id="${id}sub" style="top:340px"><span class="v-pill dim" style="font-size:34px">${H.fmt(sc.sub)}</span></div>
  <div class="d-tbl v-solid" id="${id}tb" style="top:430px;height:560px">
   <div class="d-tr" style="height:100px;background:#1d2a52">${sc.cols.map((c,i)=>`<div class="d-td" id="${id}h${i}" style="font-size:36px;color:#fff">${H.fmt(c)}</div>`).join('')}</div>
   <div class="d-tr" id="${id}al" style="height:76px;background:rgba(91,214,155,.18)"><div class="d-td" style="color:${MINT};font-size:34px">${I.check(36,MINT)} ${H.fmt(sc.field)} · ${H.fmt(sc.aligned)}</div></div>
   ${Array.from({length:4},(_,r)=>`<div class="d-tr">${sc.cols.map((_,c)=>`<div class="d-td"><i id="${id}v${r}${c}" style="width:${40+((r*29+c*13)%45)}%"></i></div>`).join('')}</div>`).join('')}</div>
  ${sc.cols.map((c,i)=>`<div class="v-a v-glass" id="${id}p${i}" style="width:280px;height:420px;border-radius:30px;display:flex;flex-direction:column;align-items:center;padding-top:30px;font-size:40px;font-weight:900;color:#fff">${H.fmt(c)}</div>`).join('')}
  <div class="v-a v-glass" id="${id}cc" style="left:70px;top:1020px;width:940px;height:420px;border-radius:44px;padding:30px 40px;border-color:rgba(255,201,77,.6)">
   <div style="font-size:48px;font-weight:900;color:${GOLD};margin-bottom:6px">${H.fmt(sc.conclusion)}</div>
   ${sc.points.map((p,i)=>`<div class="d-pt" id="${id}q${i}"><div class="d-ar" style="background:${['rgba(91,214,155,.2)','rgba(255,77,26,.2)','rgba(255,201,77,.2)'][i]};color:${[MINT,ACC,GOLD][i]}">${['↑','↓','→'][i]}</div>${H.fmt(p)}</div>`).join('')}</div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$;const PUT=H.at(sc,'自动放进')??1.6,AL=H.at(sc,'口径先对齐')??3.4,CON=H.at(sc,'直接看结论')??4.6;
  const g=K.frame(id,t,H,{...BG,hue:[91,214,155]},{seed:54,beats:[0.5,H.at(sc,'这个')??0.9,H.at(sc,'多个平台')??1.3,PUT,PUT+0.6,AL,CON]});
  K.title($(id+'hd')._chars,t,0.1,'punch');MO.set($(id+'sub'),{o:MO.tw(t,0.5,0.3)});
  // 三块平台卡先散着，"放进"时飞进表格对应的列
  sc.cols.forEach((_,i)=>{const u=MO.tw(t,PUT+i*0.15,0.5,'inOutC');const x0=[70,400,730][i],y0=540+(i%2)*60;const x1=70+i*313+16,y1=430;
   MO.set($(id+'p'+i),{x:MO.lerp(x0,x1,u),y:MO.lerp(y0,y1,u)+MO.wob(t,i,10,0.6)*(1-u),r:MO.lerp([-6,4,-3][i],0,u),s:MO.lerp(1,0.6,u),o:(MO.tw(t,0.2+i*0.12,0.25))*(1-MO.prog(u,0.85,1))})});
  const tin=MO.tw(t,PUT+0.5,0.4,'outBack');MO.set($(id+'tb'),{s:0.8+0.2*tin,o:MO.tw(t,PUT+0.45,0.2)});
  MO.set($(id+'al'),{sx:MO.tw(t,AL,0.4,'outBack'),o:MO.tw(t,AL,0.15)});
  for(let r=0;r<4;r++)for(let c=0;c<3;c++){const el=$(id+'v'+r+c);const al=t>AL+0.2+r*0.06;el.style.background=al?'rgba(91,214,155,.45)':'rgba(255,255,255,.22)';el.style.transform=`translateX(${al?0:Math.sin(t*6+r+c)*14}px)`}
  MO.set($(id+'cc'),{y:200*(1-MO.tw(t,CON-0.1,0.5,'outBack')),o:MO.tw(t,CON-0.1,0.2)});
  sc.points.forEach((_,i)=>MO.set($(id+'q'+i),{x:-60*(1-MO.tw(t,CON+0.3+i*0.2,0.35,'outBack')),o:MO.tw(t,CON+0.3+i*0.2,0.2)}));
  MO.ring(g,t,AL,540,560,{r1:600,color:'91,214,155'});K.flash(g,t,PUT+0.5,0.2);MO.burst(g,t,CON,540,1100,{n:36,seed:3,colors:[MINT,GOLD,'#fff'],speed:[400,1000],life:1.2})},
 sfx:()=>[[1.6,'pop'],[3.4,'ding'],[4.6,'pop']]},

cta:{bg:'#0a1226',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:960});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:150px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:530px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:560px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#6aa0ff,#2d4fa8)">${I.chart(120)}</div>`+cb.html)},
 init:(sc,id)=>split(id,'tt'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:64});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=H.at(sc,'关注')??2.2,S=(H.at(sc,'上线第一')??3.8)-0.3;const p=sc._cb.anim(t,{show:1.3,follow:F,type:(H.at(sc,'评论')??2.8)+0.2,send:S});
  MO.burst(g,t,OPEN,540,640,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,640,{r1:700,width:14,color:'90,140,255'});K.flash(g,t,OPEN,0.25,'160,190,255');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.2,'pop'],[3.5,'pop']]},
outro:K.outro(BG),
};
})();
