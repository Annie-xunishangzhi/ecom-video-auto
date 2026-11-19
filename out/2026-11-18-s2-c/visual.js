/* 2026-11-18-s2-c 商品资料维护 · 自动标出异常价格和库存。色调：暖棕琥珀（白天的价目单）+ 退款红。
   主线：同一款写了两个价、库存有负数：手动一格格翻 vs 工具直接标出 → 实录：载入、开始、出结果 → 需修正一行行定位 →
   三步（第三步最关键）→ 实录：十行不到一秒 → 揭晓：下载报告、照清单改、再传一次复查直到全部通过 → 关注领取。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I,AVC}=K;
const RED='#FF5A4E',SAND='#f3d9a8';
const BG={seed:74,hue:[255,180,90],hue2:[255,90,60],hue3:[255,220,160],base:['#2b2016','#1a130c','#0b0805']};
const css=`
.e-tb{position:absolute;left:60px;top:430px;width:960px;border-radius:34px;background:#fffaf0;color:#2b2016;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.5)}
.e-th,.e-tr{display:flex;align-items:center;height:116px;padding:0 24px;font-size:34px;font-weight:900;white-space:nowrap;border-bottom:2px solid #efe2c8}
.e-th{height:78px;background:#f3e3c2;font-size:28px;color:#7a5a2c}
.e-th span,.e-tr span{flex:none}
.e-n{width:470px}.e-p{width:200px;text-align:right;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace}.e-s{width:200px;text-align:right;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace}
.e-cell{position:relative;padding:4px 10px;border-radius:12px}
.e-mag{position:absolute;width:170px;height:170px;border-radius:50%;border:12px solid #2b2016;box-shadow:0 0 0 6px rgba(255,255,255,.6),inset 0 0 40px rgba(255,201,77,.25)}
.e-flag{position:absolute;padding:10px 22px;border-radius:18px;background:${RED};color:#fff;font-size:34px;font-weight:900;white-space:nowrap;box-shadow:0 14px 30px rgba(255,90,78,.45)}
.e-tabs{position:absolute;left:70px;top:420px;display:flex;gap:16px}
.e-tab{padding:16px 34px;border-radius:24px;font-size:40px;font-weight:900;white-space:nowrap;background:rgba(255,255,255,.08);color:#e9d8b8;border:3px solid rgba(255,255,255,.14)}
.e-row{position:absolute;left:70px;width:940px;height:150px;border-radius:30px;background:rgba(255,250,240,.08);border:3px solid rgba(255,255,255,.12);display:flex;align-items:center;gap:22px;padding:0 30px;color:#fff;font-size:38px;font-weight:900;white-space:nowrap}
.e-row .why{color:#e9d8b8;font-size:30px;margin-left:auto}
.e-st{padding:8px 20px;border-radius:14px;font-size:30px;font-weight:900;flex:none}
.e-arrow{position:absolute;left:10px;width:60px;height:60px}
.e-step{position:absolute;left:70px;width:940px;height:250px;border-radius:40px;background:rgba(255,250,240,.07);border:3px solid rgba(255,255,255,.14);display:flex;align-items:center;gap:30px;padding:0 40px;color:#fff;font-size:54px;font-weight:900;white-space:nowrap}
.e-step .n{width:110px;height:110px;border-radius:50%;background:${GOLD};color:#2b2016;display:flex;align-items:center;justify-content:center;font-size:56px;flex:none}
.e-step .slot{margin-left:auto;width:210px;height:150px;border-radius:28px;border:4px dashed rgba(255,255,255,.3);position:relative}
.e-file{position:absolute;width:110px;height:136px;border-radius:16px;background:#fffaf0;display:flex;align-items:center;justify-content:center}
.e-go{position:absolute;right:40px;top:50px;width:220px;height:150px;border-radius:30px;background:${ACC};color:#fff;font-size:44px;font-weight:900;display:flex;align-items:center;justify-content:center}
.e-xl{position:absolute;left:390px;top:440px;width:300px;height:360px;border-radius:30px;background:linear-gradient(160deg,#2fb98a,#17795a);display:flex;align-items:center;justify-content:center;box-shadow:0 30px 60px rgba(0,0,0,.5)}
.e-sheet{position:absolute;left:0;top:0;padding:14px 26px;border-radius:18px;background:#fffaf0;color:#2b2016;font-size:34px;font-weight:900;white-space:nowrap;box-shadow:0 12px 26px rgba(0,0,0,.4)}
.e-fix{position:absolute;left:70px;width:600px;height:96px;border-radius:24px;background:rgba(255,255,255,.07);display:flex;align-items:center;gap:18px;padding:0 26px;font-size:36px;font-weight:900;color:#fff;white-space:nowrap}
.e-loop{position:absolute;left:720px;top:1000px;width:280px;height:280px}
.e-pass{position:absolute;left:180px;top:800px;width:720px;height:170px;border-radius:34px;border:14px solid ${MINT};color:${MINT};font-size:96px;font-weight:900;display:flex;align-items:center;justify-content:center;background:rgba(10,40,30,.6);white-space:nowrap}
.e-wm{position:absolute;font-size:240px;font-weight:900;color:rgba(255,201,77,.12);line-height:1;font-family:"DejaVu Sans Mono",monospace}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
const at=(sc,w,d,H)=>{H=H||sc._H;return H?(H.at(sc,w)??d):d};
const stS=(st,sc)=>st===sc.tabs[0]?`background:rgba(91,214,155,.22);color:${MINT}`:st===sc.tabs[1]?`background:rgba(255,90,78,.25);color:#ffb3aa`:`background:rgba(255,201,77,.22);color:${GOLD}`;
// 实录镜头：源矩形推拉（frac 为 [时刻, 缩放倍数, 中心x比例, 中心y比例]）
function camera(c,im,t,keys){const cg=c.getContext('2d');cg.fillStyle='#f6f4ef';cg.fillRect(0,0,c.width,c.height);if(!im)return cg;
 const W=im.width,Hh=im.height,z0=Math.max(1,W*c.height/c.width/Hh)*1.01,MO=M();
 const z=MO.kf(t,keys.map(k=>[k[0],z0*k[1],'inOutC'])),vx=MO.kf(t,keys.map(k=>[k[0],W*k[2],'inOutC'])),vy=MO.kf(t,keys.map(k=>[k[0],Hh*k[3],'inOutC']));
 const vw=W/z,vh=vw*c.height/c.width,sx=Math.min(Math.max(vx-vw/2,0),Math.max(0,W-vw)),sy=Math.min(Math.max(vy-vh/2,0),Math.max(0,Hh-vh));cg.drawImage(im,sx,sy,vw,vh,0,0,c.width,c.height);
 const sp=((t*0.7)%1)*(c.width+400)-200,gr=cg.createLinearGradient(sp-120,0,sp+120,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.5,'rgba(255,255,255,.3)');gr.addColorStop(1,'rgba(255,255,255,0)');cg.fillStyle=gr;cg.fillRect(0,0,c.width,c.height);return cg}
const realScene=(seed,words)=>({bg:'#1a130c',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}ln" style="left:70px;top:180px"><span class="v-pill" style="background:rgba(91,214,155,.18);color:${MINT};border:3px solid ${MINT};font-size:40px">${H.fmt(sc.line)}</span></div>
  ${K.win(id,H.fmt(sc.win),{x:50,y:310,w:980,h:760})}
  <div class="v-a v-shi" id="${id}shi" style="right:84px;top:390px">示意</div>`),
 init:(sc,id,H)=>{sc._H=H;H.$(id+'body').innerHTML=`<canvas id="${id}cv" width="980" height="696" style="position:absolute;inset:0"></canvas>`;if(H.frame(sc,0))H.$(id+'shi').style.display='none'},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const B=words.map((w,i)=>at(sc,w,0.8+i*1.1,H));
  const g=K.frame(id,t,H,BG,{seed,beats:B});MO.set($(id+'ln'),{s:MO.ease('outBack')(MO.prog(t,0.05,0.4)),o:MO.tw(t,0.05,0.2)});
  MO.set($(id+'win'),{y:160*(1-MO.tw(t,0.05,0.55,'outBack')),r:MO.wob(t,3,0.4,0.3)});
  const keys=[[0,1,0.5,0.5]];B.forEach((b,i)=>{keys.push([b,1+0.04*i,keys.at(-1)[2],keys.at(-1)[3]]);keys.push([b+0.5,[1.5,1.25,1.6][i%3],[0.45,0.55,0.5][i%3],[0.4,0.6,0.55][i%3]])});keys.push([D,keys.at(-1)[1]*1.06,keys.at(-1)[2],keys.at(-1)[3]+0.03]);
  const cg=camera($(id+'cv'),H.frame(sc,t),t,keys);if(!H.frame(sc,t))for(let k=0;k<6;k++){cg.fillStyle='rgba(0,0,0,.08)';cg.fillRect(50,50+k*100,MO.lerp(120,800,MO.prog(t,0.3+k*0.2,0.9+k*0.2)),40)}
  B.forEach(b=>MO.ring(g,t,b+0.3,540,690,{r1:520,width:8,color:'255,201,77'}))},
 sfx:sc=>words.map((w,i)=>[at(sc,w,0.8+i*1.1),'tick'])});

window.VISUALS={
/* 0 钩子：表格里同款两个价、库存负数；放大镜一格格找 vs 工具直接标出来 */
flags:{bg:'#1a130c',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="display:none">`+K.layers(id,`
  <div class="v-a" style="left:0;top:0;width:1080px;height:1920px;background:linear-gradient(180deg,rgba(26,19,12,.55),rgba(26,19,12,.2) 40%,rgba(26,19,12,.9))"></div>
  <div class="v-a" id="${id}la" style="left:70px;top:180px"><span class="v-pill hot" style="font-size:44px">${H.fmt(sc.left.label)} · ${H.fmt(sc.left.value)}</span></div>
  <div class="v-a" id="${id}ra" style="left:70px;top:290px"><span class="v-pill" style="background:rgba(91,214,155,.2);color:${MINT};border:3px solid ${MINT};font-size:44px">${H.fmt(sc.right.label)} · ${H.fmt(sc.right.value)}</span></div>
  <div class="e-tb" id="${id}tb"><div class="e-th"><span class="e-n"></span><span class="e-p">${I.chart(30,'#7a5a2c')}</span><span class="e-s">${I.bag(30,'#7a5a2c')}</span></div>${sc.cells.map((c,i)=>`<div class="e-tr" id="${id}r${i}"><span class="e-n">${H.fmt(c[0])}</span><span class="e-p"><span class="e-cell" id="${id}p${i}">${H.fmt(c[1])}</span></span><span class="e-s"><span class="e-cell" id="${id}s${i}">${H.fmt(c[2])}</span></span></div>`).join('')}
   <div class="e-mag" id="${id}mg" style="left:0;top:0"></div></div>
  <svg class="v-a" id="${id}br" width="60" height="260" viewBox="0 0 60 260" style="left:1000px;top:495px"><path d="M6 6 Q50 6 50 60 L50 100 Q50 130 58 130 Q50 130 50 160 L50 200 Q50 254 6 254" stroke="${RED}" stroke-width="8" fill="none" stroke-linecap="round"/></svg>
  <div class="e-flag" id="${id}fp" style="left:600px;top:1000px">${I.warn(32,'#fff')} ${H.fmt(sc.price)}</div>
  <div class="e-flag" id="${id}fs" style="left:600px;top:1100px">${I.warn(32,'#fff')} ${H.fmt(sc.stock)}</div>`),
 init:(sc,id,H)=>{sc._H=H},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const P2=at(sc,'两个价',1.4,H),NG=at(sc,'负数',3.0,H),MAN=at(sc,'一格格',4.6,H),AU=at(sc,'交给它',5.8,H),SH=at(sc,'直接标',6.8,H);
  const g=K.frame(id,t,H,{...BG,img:$(id+'img'),imgAlpha:0.75,grid:false,dust:12},{seed:4,push:0.04,beats:[P2,NG,MAN,AU,SH]});
  MO.set($(id+'la'),{x:-500*(1-MO.tw(t,0.05,0.45,'outBack')),o:MO.tw(t,0.05,0.2)*(1-0.5*MO.tw(t,AU,0.3))});MO.set($(id+'tb'),{y:200*(1-MO.tw(t,0.1,0.5,'outBack')),o:MO.tw(t,0.1,0.2),r:MO.wob(t,4,0.4,0.4)});
  sc.cells.forEach((_,i)=>MO.set($(id+'r'+i),{x:-60*(1-MO.tw(t,0.3+i*0.12,0.3,'outBack')),o:MO.tw(t,0.3+i*0.12,0.2)}));
  // 手动：放大镜一格格慢慢挪（说到"两个价""负数"时停在那里，但没标）
  const path=[[0,[300,90]],[P2,[620,160]],[P2+0.6,[620,280]],[NG,[840,400]],[MAN,[300,520]],[AU,[620,90]]];
  let mx=path[0][1][0],my=path[0][1][1];for(let k=0;k<path.length-1;k++){const [a,p]=path[k],[b,q]=path[k+1];if(t>=a){const u=MO.E.inOutC(MO.prog(t,a,b));mx=MO.lerp(p[0],q[0],u);my=MO.lerp(p[1],q[1],u)}}
  MO.set($(id+'mg'),{x:mx-85,y:my-85+Math.sin(t*4)*6,s:MO.ease('outBack')(MO.prog(t,0.5,0.8)),o:t>0.5?(1-MO.prog(t,AU,AU+0.3)):0});
  // 工具：直接标出来
  MO.set($(id+'ra'),{x:-500*(1-MO.tw(t,AU,0.45,'outBack')),o:MO.tw(t,AU,0.2)});
  const on=t>SH-0.2,hit=(el,k)=>{el.style.background=on?'rgba(255,90,78,.2)':'transparent';el.style.outline=on?`5px solid ${RED}`:'none';el.style.color=on?RED:'';if(on)MO.set(el,{s:1+0.15*Math.sin(Math.PI*MO.prog(t,SH-0.2+k*0.1,SH+0.15+k*0.1))})};
  hit($(id+'p0'),0);hit($(id+'p1'),1);hit($(id+'s2'),2);
  MO.set($(id+'br'),{o:on?1:0,s:MO.ease('outBack')(MO.prog(t,SH-0.2,SH+0.1))});
  MO.set($(id+'fp'),{x:300*(1-MO.tw(t,SH-0.1,0.4,'outBack')),o:MO.tw(t,SH-0.1,0.2)});MO.set($(id+'fs'),{x:300*(1-MO.tw(t,SH+0.1,0.4,'outBack')),o:MO.tw(t,SH+0.1,0.2)});
  MO.ring(g,t,SH,800,620,{r1:380,width:12,color:'255,90,78'});MO.burst(g,t,SH,800,620,{n:24,seed:3,colors:[RED,'#fff',GOLD],speed:[300,800],life:1})},
 sfx:sc=>[[at(sc,'两个价',1.4),'tick'],[at(sc,'负数',3.0),'tick'],[at(sc,'交给它',5.8),'pop'],[at(sc,'直接标',6.8),'ding']]},

real:realScene(14,['载入','点开始','结果']),

/* 2 需修正一行行定位：标签页随配音切换，箭头跳到出问题的那行 */
fixme:{bg:'#1a130c',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:180px;font-size:118px">${H.fmt(sc.head)}</div>
  <div class="e-tabs" id="${id}tbs">${sc.tabs.map((x,i)=>`<div class="e-tab" id="${id}t${i}">${H.fmt(x)}</div>`).join('')}</div>
  ${sc.rows.map((r,i)=>`<div class="e-row" id="${id}r${i}" style="top:${560+i*176}px"><span class="e-st" style="${stS(r[1],sc)}">${H.fmt(r[1])}</span>${H.fmt(r[0])}<span class="why">${H.fmt(r[2])}</span></div>`).join('')}
  <svg class="e-arrow" id="${id}ar" viewBox="0 0 24 24" style="top:0"><path d="M4 12h12M11 6l6 6-6 6" stroke="${GOLD}" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const PR=at(sc,'价格',0.4,H),ST=at(sc,'库存',1.6,H),NF=at(sc,'需修正',3.0,H),LO=at(sc,'一行行',4.0,H);
  const g=K.frame(id,t,H,BG,{seed:24,beats:[PR,ST,NF,LO]});K.title($(id+'hd')._chars,t,LO-0.2,'drop');
  MO.set($(id+'tbs'),{y:-200*(1-MO.tw(t,0.05,0.45,'outBack')),o:MO.tw(t,0.05,0.2)});
  const tab=t<NF?0:1;sc.tabs.forEach((_,i)=>{const el=$(id+'t'+i);const on=i===tab;el.style.background=on?(i===1?RED:'rgba(91,214,155,.3)'):'rgba(255,255,255,.08)';el.style.color=on?'#fff':'#e9d8b8';MO.set(el,{s:on?1.06:1})});
  sc.rows.forEach((r,i)=>{const show=tab===0||r[1]===sc.tabs[1];const a=0.2+i*0.12;const el=$(id+'r'+i);MO.set(el,{x:-200*(1-MO.tw(t,a,0.4,'outBack'))+(show?0:60*MO.prog(t,NF,NF+0.3)),o:MO.tw(t,a,0.2)*(show?1:1-0.75*MO.prog(t,NF,NF+0.3))})});
  // 定位箭头：在价格、库存两行之间跳
  const tgt=[sc.rows.findIndex(r=>/价/.test(r[2])),sc.rows.findIndex(r=>/库存/.test(r[2]))];const cur=t<ST?tgt[0]:t<LO?tgt[1]:(Math.floor((t-LO)*1.4)%2?tgt[1]:tgt[0]);
  MO.set($(id+'ar'),{y:560+cur*176+45+Math.sin(t*10)*4,x:Math.sin(t*8)*6,o:t>PR?1:0});[tgt[0],tgt[1]].forEach(i=>{$(id+'r'+i).style.borderColor=cur===i&&t>PR?GOLD:'rgba(255,255,255,.12)'});
  MO.ring(g,t,PR,540,560+tgt[0]*176+75,{r1:300,width:8,color:'255,201,77'});MO.ring(g,t,ST,540,560+tgt[1]*176+75,{r1:300,width:8,color:'255,201,77'});MO.ring(g,t,NF,370,460,{r1:300,width:10,color:'255,90,78'})},
 sfx:sc=>[[at(sc,'价格',0.4),'tick'],[at(sc,'库存',1.6),'tick'],[at(sc,'需修正',3.0),'pop']]},

/* 3 中段悬念：三步——文件飞进上传框、按下开始、第三步上锁 */
steps3:{bg:'#1a130c',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:136px">${H.fmt(sc.head)}</div>
  ${sc.items.map((it,i)=>`<div class="e-step" id="${id}s${i}" style="top:${420+i*290}px"><span class="n">${i===2?I.lock(56,'#2b2016'):i+1}</span>${H.fmt(it)}${i===0?`<div class="slot" id="${id}sl"><div class="e-file" id="${id}fl">${I.table(70,'#2fb98a')}</div></div>`:i===1?`<div class="e-go" id="${id}go">${I.search(56,'#fff')}</div>`:''}</div>`).join('')}`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const S1=at(sc,'第一步',1.2,H),S2=at(sc,'第二步',2.8,H),S3=at(sc,'第三步',4.4,H);
  const g=K.frame(id,t,H,BG,{seed:34,beats:[S1,S2,S3]});K.title($(id+'hd')._chars,t,0.05,'punch');
  [S1,S2,S3].forEach((a,i)=>{const el=$(id+'s'+i);MO.set(el,{x:-900*(1-MO.tw(t,Math.min(a-0.3,0.3+i*0.25),0.5,'outBack')),o:MO.tw(t,Math.min(a-0.3,0.3+i*0.25),0.2)});const on=t>a&&t<([S2,S3,D+9][i]);el.style.borderColor=on?GOLD:'rgba(255,255,255,.14)';el.style.background=on?'rgba(255,201,77,.12)':'rgba(255,250,240,.07)'});
  const fu=MO.E.inOutC(MO.prog(t,S1,S1+0.6));MO.set($(id+'fl'),{x:MO.lerp(-600,50,fu),y:MO.lerp(-200,7,fu)-Math.sin(Math.PI*fu)*80,r:(1-fu)*-30,o:t>S1?1:0});
  const pr=Math.sin(Math.PI*MO.prog(t,S2+0.3,S2+0.55));MO.set($(id+'go'),{s:1-0.1*pr});
  MO.set($(id+'s2'),{y:MO.wob(t,9,4,0.8),s:t>S3?1+0.02*Math.sin(t*5):1});$(id+'s2').style.boxShadow=t>S3?`0 0 ${(40+20*Math.sin(t*5)).toFixed(0)}px rgba(255,201,77,.5)`:'';
  MO.ring(g,t,S2+0.45,870,835,{r1:260,width:8,color:'255,77,26'});MO.ring(g,t,S3,180,1125,{r1:360,width:10,color:'255,201,77'});MO.dust(g,t,{n:18,seed:81,color:'255,201,77',size:[3,7],alpha:[.3,.85],speed:-60,drift:50})},
 sfx:sc=>[[at(sc,'第一步',1.2),'pop'],[at(sc,'第二步',2.8)+0.4,'tick'],[at(sc,'第三步',4.4),'ding']]},

result:realScene(44,['十行','不到','统计','问题']),

/* 5 揭晓：报告五张表展开，问题清单一行行改绿，再传一次，盖上"全部通过" */
report:{bg:'#1a130c',
 build:(sc,id,H)=>K.layers(id,`
  <div class="e-wm" id="${id}wm" style="left:720px;top:160px">${H.fmt(sc.num)}</div>
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:180px;font-size:120px">${H.fmt(sc.head)}</div>
  <div class="e-xl" id="${id}xl">${I.table(170,'#fff')}</div>
  ${sc.sheets.map((s,i)=>`<div class="e-sheet" id="${id}h${i}">${H.fmt(s)}</div>`).join('')}
  ${[0,1,2].map(k=>`<div class="e-fix" id="${id}f${k}" style="top:${1000+k*116}px"><span id="${id}fi${k}">${I.cross(40,RED)}</span><span id="${id}ft${k}">${H.fmt(sc.fix)}</span></div>`).join('')}
  <svg class="e-loop" id="${id}lp" viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5l2-2v6h-6l2-2a5 5 0 0 0-9 3zM20 12a8 8 0 0 1-14 5l-2 2v-6h6l-2 2a5 5 0 0 0 9-3z" fill="${GOLD}"/></svg>
  <div class="v-a" id="${id}ag" style="left:690px;top:1290px"><span class="v-pill" style="background:rgba(255,201,77,.2);color:${GOLD};border:3px solid ${GOLD};font-size:36px">${H.fmt(sc.again)}</span></div>
  <div class="e-pass" id="${id}ps">${I.check(80,MINT)} ${H.fmt(sc.pass)}</div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const DL=at(sc,'下载',0.9,H),FX=at(sc,'改完',2.6,H),AG=at(sc,'再传',3.6,H),PS=at(sc,'全部通过',D-1.2,H);
  const g=K.frame(id,t,H,{...BG,hue:[91,214,155]},{seed:54,beats:[DL,DL+0.7,FX,AG,PS]});K.title($(id+'hd')._chars,t,0.05,'punch');
  MO.set($(id+'wm'),{o:MO.tw(t,0.3,0.4),y:MO.wob(t,3,10,0.4)});MO.set($(id+'xl'),{s:MO.ease('outBackBig')(MO.prog(t,0.2,0.6))*(1-0.35*MO.tw(t,DL+0.4,0.5)),y:-120*MO.tw(t,DL+0.4,0.5),r:MO.wob(t,4,3,0.5)});
  // 五张表从文件里展开成扇形
  sc.sheets.forEach((_,i)=>{const u=MO.tw(t,DL+0.2+i*0.12,0.5,'outBack');const ang=(i-2)*0.42;const x=540+Math.sin(ang)*380-110,y=640-Math.cos(ang)*200+Math.abs(i-2)*50;
   const el=$(id+'h'+i);const hot=i===1&&t>FX-0.6;   // 高亮放大要写在同一次 MO.set 里，分两次会把位置清零
   MO.set(el,{x:MO.lerp(440,x,u),y:MO.lerp(560,y,u)+MO.wob(t,i+5,5,0.6),r:ang*28*u,s:(0.6+0.4*u)*(hot?1.15+0.04*Math.sin(t*6):1),o:t>DL+0.2+i*0.12?1:0});el.style.background=hot?GOLD:'#fffaf0';el.style.zIndex=hot?5:1});
  // 照清单改：红叉一行行变绿勾
  [0,1,2].forEach(k=>{const a=FX-0.5+k*0.3;MO.set($(id+'f'+k),{x:-700*(1-MO.tw(t,FX-0.8+k*0.1,0.45,'outBack')),o:MO.tw(t,FX-0.8+k*0.1,0.2)});const ok=t>a+0.4;$(id+'fi'+k).innerHTML=ok?I.check(40,MINT):I.cross(40,RED);$(id+'f'+k).style.background=ok?'rgba(91,214,155,.16)':'rgba(255,90,78,.14)';if(ok)MO.set($(id+'fi'+k),{s:1+0.3*Math.sin(Math.PI*MO.prog(t,a+0.4,a+0.65))})});
  MO.set($(id+'lp'),{r:t*200*(t>AG?1:0.2),s:MO.ease('outBack')(MO.prog(t,AG-0.2,AG+0.2)),o:t>AG-0.2?1:0});MO.set($(id+'ag'),{o:MO.tw(t,AG,0.3)});
  const pg=MO.prog(t,PS-0.1,PS+0.15);MO.set($(id+'ps'),{s:MO.lerp(2.4,1,MO.E.inQ(pg)),r:-6,o:t>PS-0.1?1:0,blur:(1-pg)*6});
  MO.ring(g,t,AG,860,1140,{r1:300,width:8,color:'255,201,77'});K.flash(g,t,PS+0.15,0.15,'225,255,240');MO.burst(g,t,PS+0.15,540,885,{n:40,seed:7,colors:[MINT,'#fff',GOLD],speed:[300,1000],life:1.2})},
 sfx:sc=>[[at(sc,'下载',0.9),'pop'],[at(sc,'改完',2.6),'tick'],[at(sc,'再传',3.6),'tick'],[at(sc,'全部通过',5.6),'ding']]},

/* 6 结尾 */
cta:{bg:'#1a130c',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:1030});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:118px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:640px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:670px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#4fd7a6,#17795a)">${I.table(110,'#fff')}</div>`+cb.html)},
 init:(sc,id,H)=>{sc._H=H;split(id,'tt')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:64});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=at(sc,'关注',2.4,H),S=at(sc,'私信',4.6,H)-0.3;const p=sc._cb.anim(t,{show:1.3,follow:F,type:at(sc,'评论',3.0,H)+0.2,send:S});
  MO.burst(g,t,OPEN,540,780,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,780,{r1:700,width:14,color:'255,201,77'});K.flash(g,t,OPEN,0.2,'255,245,225');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.4,'pop'],[4.0,'pop']]},
outro:K.outro(BG),
};
})();
