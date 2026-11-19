/* 2026-11-18-s2-b 商品资料维护 · 自动找出缺项和重复编码。色调：暮紫 + 企鹅橙（傍晚对表格对到眼花）。
   主线：实测十行不到一秒查完 → 平时几千行靠眼睛对、越看越花 → 交给它：缺项、重复一次标出来 → 实录（有个坑最隐蔽）→
   它查五样 → 揭晓：编码前面的零被表格吃掉、两个编码撞成一个；它原样保留、提醒核对 → 关注领取。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I,AVC}=K;
const RED='#FF5A6E',VIO='#a98bff';
const BG={seed:52,hue:[150,110,255],hue2:[255,120,60],hue3:[255,170,200],base:['#1d1336','#110b22','#070410']};
const css=`
.c-tb{position:absolute;left:60px;width:960px;border-radius:32px;background:rgba(20,14,40,.9);border:2px solid rgba(255,255,255,.12);overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.5)}
.c-tr{display:flex;align-items:center;gap:14px;height:70px;padding:0 24px;border-bottom:2px solid rgba(255,255,255,.06);font-size:30px;font-weight:800;color:#e9e2ff;white-space:nowrap}
.c-tr i{display:block;height:20px;border-radius:10px;background:rgba(233,226,255,.25)}
.c-tg{margin-left:auto;padding:6px 16px;border-radius:12px;font-size:26px;font-weight:900;flex:none}
.c-num{position:absolute;left:0;right:0;text-align:center;font-size:300px;font-weight:900;color:#fff;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace;line-height:1;text-shadow:0 20px 60px rgba(169,139,255,.6)}
.c-unit{font-size:110px;color:${VIO}}
.c-beam{position:absolute;left:60px;width:960px;height:12px;border-radius:6px;background:${GOLD};box-shadow:0 0 40px 12px rgba(255,201,77,.6)}
.c-grid{position:absolute;left:60px;top:430px;width:960px;height:900px;overflow:hidden;border-radius:30px;background:rgba(15,10,30,.72);border:2px solid rgba(255,255,255,.1)}
.c-gh{display:flex;height:74px;background:rgba(169,139,255,.2);font-size:30px;font-weight:900;color:#fff;align-items:center;white-space:nowrap}
.c-gh span,.c-gr span{flex:1;padding:0 16px}
.c-gr{position:absolute;left:0;right:0;display:flex;height:56px;align-items:center;border-bottom:2px solid rgba(255,255,255,.05)}
.c-gr span i{display:block;height:16px;border-radius:8px;background:rgba(233,226,255,.22)}
.c-row{position:absolute;left:60px;width:960px;height:128px;border-radius:28px;background:rgba(255,255,255,.07);border:3px solid rgba(255,255,255,.12);display:flex;align-items:center;gap:22px;padding:0 28px;font-size:38px;font-weight:900;color:#fff;white-space:nowrap}
.c-row .sku{font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace;color:#d8ccff;width:180px}
.c-row .sp{color:#b9addb;font-size:32px}
.c-card{position:absolute;width:300px;height:220px;border-radius:32px;background:linear-gradient(160deg,rgba(169,139,255,.28),rgba(60,40,110,.4));border:3px solid rgba(255,255,255,.18);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;color:#fff;font-size:40px;font-weight:900;white-space:nowrap;box-shadow:0 20px 40px rgba(0,0,0,.35)}
.c-code{position:absolute;left:0;right:0;text-align:center;font-size:190px;font-weight:900;color:#fff;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace;white-space:nowrap;line-height:1}
.c-code span{display:inline-block}
.c-z{color:${GOLD}}
.c-shield{position:absolute;left:390px;width:300px;height:300px}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
const at=(sc,w,d,H)=>{H=H||sc._H;return H?(H.at(sc,w)??d):d};
const tagS=(kind)=>({ok:`background:rgba(91,214,155,.22);color:${MINT}`,bad:`background:rgba(255,90,110,.25);color:#ffb3bd`,warn:`background:rgba(255,201,77,.22);color:${GOLD}`})[kind];

window.VISUALS={
/* 0 钩子：十行资料一扫而过，计数跳到 10，"不到 1 秒查完" */
count:{bg:'#110b22',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-ctr" id="${id}tt" style="top:180px"><span class="v-pill" style="background:rgba(91,214,155,.2);color:${MINT};border:3px solid ${MINT};font-size:46px">${I.check(40,MINT)} ${H.fmt(sc.title)}</span></div>
  <div class="c-num" id="${id}n" style="top:300px"><span id="${id}nv">0</span><span class="c-unit">${H.fmt(sc.unit)}</span></div>
  <div class="c-tb" id="${id}tb" style="top:660px">${Array.from({length:10},(_,k)=>`<div class="c-tr" id="${id}r${k}"><i style="width:${180+(k*53)%160}px"></i><i style="width:${90+(k*37)%80}px"></i><i style="width:${60+(k*29)%70}px"></i><span class="c-tg" id="${id}g${k}"></span></div>`).join('')}</div>
  <div class="c-beam" id="${id}bm" style="top:660px"></div>
  <div class="v-a v-ctr" id="${id}cp" style="top:1390px"><span class="v-pill" style="font-size:48px;background:${GOLD};color:#2a1a00">${I.clock(44,'#2a1a00')} ${H.fmt(sc.caption)}</span></div>`),
 init:(sc,id,H)=>{sc._H=H},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const S=at(sc,'它不到',1.4,H),E=at(sc,'查完了',2.6,H);
  const g=K.frame(id,t,H,BG,{seed:2,push:0.05,beats:[S,E]});
  MO.set($(id+'tt'),{s:MO.ease('outBack')(MO.prog(t,0.05,0.4)),o:MO.tw(t,0.05,0.2)});MO.set($(id+'tb'),{y:200*(1-MO.tw(t,0.1,0.5,'outBack')),o:MO.tw(t,0.1,0.2)});
  for(let k=0;k<10;k++)MO.set($(id+'r'+k),{x:-80*(1-MO.tw(t,0.2+k*0.05,0.3,'outBack')),o:MO.tw(t,0.2+k*0.05,0.15)});
  // 扫描光：从上到下一扫（不到 1 秒），扫过的行打上结果
  const p=MO.prog(t,S,S+0.94);MO.set($(id+'bm'),{y:p*700,o:t>S&&p<1?1:0});
  for(let k=0;k<10;k++){const done=p*10>k+0.5;const el=$(id+'g'+k);const bad=k===3||k===7;el.textContent=done?(bad?'!':'✓'):'';el.style.cssText+=';'+tagS(bad?'bad':'ok');MO.set(el,{s:done?MO.ease('outBackBig')(MO.prog(t,S+k*0.094,S+k*0.094+0.2)):0})}
  const n=Math.round(10*p);$(id+'nv').textContent=String(n);MO.set($(id+'n'),{s:(1+0.08*Math.sin(Math.PI*MO.prog(t,S+0.94,S+1.3)))*MO.ease('outBack')(MO.prog(t,0.1,0.5))});
  MO.set($(id+'cp'),{s:MO.ease('outBackBig')(MO.prog(t,E-0.2,E+0.15)),o:t>E-0.2?1:0,y:MO.wob(t,6,5,0.7)});
  MO.ring(g,t,S+0.94,540,450,{r1:520,width:14,color:'169,139,255'});MO.burst(g,t,S+0.94,540,450,{n:30,seed:5,colors:[VIO,'#fff',GOLD],speed:[300,900],life:1.1})},
 sfx:sc=>[[at(sc,'它不到',1.4),'tick'],[at(sc,'它不到',1.4)+0.94,'ding']]},

/* 1 痛点：配图背景，表格一直往上滚、越看越糊 */
eyes:{bg:'#110b22',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="display:none">`+K.layers(id,`
  <div class="v-a" style="left:0;top:0;width:1080px;height:1920px;background:linear-gradient(180deg,rgba(17,11,34,.6),rgba(17,11,34,.3) 40%,rgba(17,11,34,.92))"></div>
  <div class="c-grid" id="${id}gd"><div class="c-gh">${sc.cols.map(c=>`<span>${H.fmt(c)}</span>`).join('')}</div><div id="${id}rows" style="position:absolute;left:0;right:0;top:74px;bottom:0">${Array.from({length:18},(_,k)=>`<div class="c-gr" id="${id}g${k}">${sc.cols.map((_,j)=>`<span><i style="width:${40+((k*7+j*13)%50)}%"></i></span>`).join('')}</div>`).join('')}</div></div>
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:1180px;font-size:140px">${H.fmt(sc.head)}</div>
  <div class="v-a" id="${id}sb" style="left:76px;top:1350px"><span class="v-pill dim" style="font-size:32px">${H.fmt(sc.sub)}</span></div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const Y=at(sc,'一行行',1.8,H),Q=at(sc,'缺了哪项',3.2,H),HD=at(sc,'眼花',5.4,H);
  const g=K.frame(id,t,H,{...BG,img:$(id+'img'),imgAlpha:0.75,grid:false,dust:12},{seed:12,push:0.05,beats:[Y,Q,HD]});
  MO.set($(id+'gd'),{y:180*(1-MO.tw(t,0.05,0.5,'outBack')),o:MO.tw(t,0.05,0.2),r:MO.wob(t,5,0.6,0.4)});
  // 越滚越快，越看越糊
  const sp=Math.max(0,t-0.4);const off=sp*sp*60+sp*90;const blur=Math.min(6,MO.prog(t,Q,HD)*6);
  for(let k=0;k<18;k++){const y=((k*56-off)%1008+1008)%1008-56;const el=$(id+'g'+k);MO.set(el,{y,x:Math.sin(t*3+k)*3*MO.prog(t,Q,HD),blur});
   const hi=Math.floor(off/56+3)%18===k;el.style.background=hi?'rgba(255,201,77,.18)':'transparent'}
  K.title($(id+'hd')._chars,t,HD-0.15,'punch');if(t>HD+0.6)MO.textWave($(id+'hd')._chars,t,{amp:8,from:HD+0.6});MO.set($(id+'sb'),{o:MO.tw(t,0.6,0.3)});
  MO.ring(g,t,HD,400,1260,{r1:460,width:10,color:'255,90,110'})},
 sfx:sc=>[[at(sc,'一行行',1.8),'tick'],[at(sc,'缺了哪项',3.2),'tick'],[at(sc,'眼花',5.4),'pop']]},

/* 2 交给它：扫一遍，缺项、重复一次标出来 */
mark:{bg:'#110b22',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:128px">${H.fmt(sc.head)}</div>
  ${sc.rows.map((r,i)=>`<div class="c-row" id="${id}r${i}" style="top:${440+i*160}px">${H.fmt(r[0])}<span class="sku" id="${id}k${i}" style="margin-left:auto">${r[1]?H.fmt(r[1]):'—'}</span><span class="sp">${H.fmt(r[2])}</span><span class="c-tg" id="${id}t${i}"></span></div>`).join('')}
  <canvas class="v-a" id="${id}ln" width="1080" height="900" style="left:0;top:400px"></canvas>
  <div class="c-beam" id="${id}bm" style="top:440px"></div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const M1=at(sc,'必填项',0.8,H),M2=at(sc,'编码',2.0,H),A=at(sc,'一次',3.2,H);
  const g=K.frame(id,t,H,BG,{seed:22,beats:[M1,M2,A]});K.title($(id+'hd')._chars,t,A-0.15,'drop');
  sc.rows.forEach((_,i)=>MO.set($(id+'r'+i),{x:-200*(1-MO.tw(t,0.1+i*0.12,0.45,'outBack')),o:MO.tw(t,0.1+i*0.12,0.2)}));
  const p=MO.prog(t,0.6,A);MO.set($(id+'bm'),{y:p*640,o:t>0.6&&p<1?1:0});
  const kind=sc.rows.map((r,i)=>!r[1]?'miss':sc.rows.some((x,j)=>j!==i&&x[1]&&x[1]===r[1])?'dup':'ok');
  sc.rows.forEach((r,i)=>{const when=kind[i]==='miss'?M1+0.3:kind[i]==='dup'?M2+0.3:A;const on=t>when;const el=$(id+'t'+i);
   el.textContent=on?H.plain(sc[kind[i]]):'';el.style.cssText+=';'+tagS(kind[i]==='ok'?'ok':kind[i]==='miss'?'bad':'warn');MO.set(el,{s:on?MO.ease('outBackBig')(MO.prog(t,when,when+0.3)):0});
   $(id+'r'+i).style.borderColor=on&&kind[i]!=='ok'?(kind[i]==='miss'?RED:GOLD):'rgba(255,255,255,.12)';
   if(on&&kind[i]!=='ok')MO.set($(id+'r'+i),{x:Math.sin(t*30)*5*(1-MO.prog(t,when+0.2,when+0.7))})});
  // 重复的两行之间连一条线
  const lg=MO.canvas($(id+'ln'));const dup=kind.map((k,i)=>k==='dup'?i:-1).filter(i=>i>=0);
  if(dup.length>1&&t>M2+0.3){const u=MO.prog(t,M2+0.3,M2+0.8);lg.strokeStyle=GOLD;lg.lineWidth=8;lg.setLineDash([18,12]);lg.lineDashOffset=-t*60;lg.beginPath();const y0=40+dup[0]*160+64,y1=40+dup[1]*160+64;lg.moveTo(1000,y0);lg.quadraticCurveTo(1060,(y0+y1)/2,1000,MO.lerp(y0,y1,u));lg.stroke()}
  MO.ring(g,t,M1+0.3,540,440+sc.rows.findIndex((r)=>!r[1])*160+64,{r1:300,width:8,color:'255,90,110'});MO.ring(g,t,M2+0.3,700,440+(dup[0]||0)*160+140,{r1:360,width:8,color:'255,201,77'})},
 sfx:sc=>[[at(sc,'必填项',0.8)+0.3,'tick'],[at(sc,'编码',2.0)+0.3,'tick'],[at(sc,'一次',3.2),'pop']]},

/* 3 实录 + 中段悬念：真实工具界面，镜头推拉；最后弹出"有个坑最隐蔽" */
real:{bg:'#110b22',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}ln" style="left:70px;top:180px"><span class="v-pill" style="background:rgba(91,214,155,.18);color:${MINT};border:3px solid ${MINT};font-size:38px">${H.fmt(sc.line)}</span></div>
  ${K.win(id,H.fmt(sc.win),{x:50,y:300,w:980,h:700})}
  <div class="v-a v-shi" id="${id}shi" style="right:84px;top:380px">示意</div>
  <div class="v-a" id="${id}tp" style="left:70px;top:1080px"><span class="v-pill" style="background:linear-gradient(150deg,#2c2050,#140d27);border:3px solid rgba(255,201,77,.75);color:#fff;font-size:50px">${I.lock(46)} ${H.fmt(sc.trap)}</span></div>`),
 init:(sc,id,H)=>{sc._H=H;H.$(id+'body').innerHTML=`<canvas id="${id}cv" width="980" height="636" style="position:absolute;inset:0"></canvas>`;if(H.frame(sc,0))H.$(id+'shi').style.display='none'},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const B1=at(sc,'点开始',0.9,H),B2=at(sc,'标出来',2.2,H),TP=at(sc,'有个坑',3.6,H);
  const g=K.frame(id,t,H,BG,{seed:32,beats:[B1,B2,TP]});MO.set($(id+'ln'),{o:MO.tw(t,0.1,0.3)});
  MO.set($(id+'win'),{y:160*(1-MO.tw(t,0.05,0.55,'outBack')),r:MO.wob(t,3,0.4,0.3),s:1-0.04*MO.tw(t,TP,0.4)});
  const c=$(id+'cv'),cg=c.getContext('2d');cg.fillStyle='#f4f4f6';cg.fillRect(0,0,c.width,c.height);const im=H.frame(sc,t);
  if(im){const W=im.width,Hh=im.height,z0=Math.max(1,W*c.height/c.width/Hh)*1.01;
   const z=MO.kf(t,[[0,z0],[B1,z0*1.05],[B1+0.5,z0*1.5,'outBack'],[B2,z0*1.55],[B2+0.5,z0*1.25,'inOutC'],[D,z0*1.35]]);
   const vx=MO.kf(t,[[0,W/2],[B1+0.5,W*0.45,'inOutC'],[B2+0.5,W*0.5,'inOutC'],[D,W*0.52]]),vy=MO.kf(t,[[0,Hh/2],[B1+0.5,Hh*0.4,'inOutC'],[B2+0.5,Hh*0.58,'inOutC'],[D,Hh*0.62]]);
   const vw=W/z,vh=vw*c.height/c.width,sx=Math.min(Math.max(vx-vw/2,0),Math.max(0,W-vw)),sy=Math.min(Math.max(vy-vh/2,0),Math.max(0,Hh-vh));cg.drawImage(im,sx,sy,vw,vh,0,0,c.width,c.height)}
  else{for(let k=0;k<6;k++){cg.fillStyle='rgba(0,0,0,.08)';cg.fillRect(50,50+k*90,MO.lerp(120,800,MO.prog(t,0.3+k*0.2,0.9+k*0.2)),40)}}
  const sp=((t*0.7)%1)*(c.width+400)-200,gr=cg.createLinearGradient(sp-120,0,sp+120,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.5,'rgba(255,255,255,.3)');gr.addColorStop(1,'rgba(255,255,255,0)');cg.fillStyle=gr;cg.fillRect(0,0,c.width,c.height);
  MO.set($(id+'tp'),{x:-800*(1-MO.tw(t,TP-0.1,0.5,'outBack')),o:MO.tw(t,TP-0.1,0.2),s:1+0.03*Math.sin(t*5)});
  MO.ring(g,t,B2,540,650,{r1:520,width:10,color:'91,214,155'});MO.ring(g,t,TP,400,1130,{r1:420,width:10,color:'255,201,77'});MO.dust(g,t,{n:16,seed:61,color:'255,201,77',size:[3,7],alpha:[.3,.85],speed:-60,drift:50})},
 sfx:sc=>[[at(sc,'点开始',0.9),'tick'],[at(sc,'标出来',2.2),'ding'],[at(sc,'有个坑',3.6),'pop']]},

/* 4 它查五样：五张卡片随配音一张张飞进来 */
five:{bg:'#110b22',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:128px">${H.fmt(sc.head)}</div>
  ${sc.items.map((it,i)=>`<div class="c-card" id="${id}c${i}"><div style="width:90px;height:90px;border-radius:26px;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center">${[I.list,I.table,I.chart,I.warn,I.bag][i](58,i===3?GOLD:'#fff')}</div>${H.fmt(it)}</div>`).join('')}`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const A=sc.items.map((w,i)=>at(sc,w,1.4+i*0.9,H));
  const g=K.frame(id,t,H,BG,{seed:42,beats:A});K.title($(id+'hd')._chars,t,0.05,'drop');
  const POS=[[70,460],[390,460],[710,460],[230,730],[550,730]];
  sc.items.forEach((_,i)=>{const a=A[i]-0.15;const u=MO.spring(t-a,1.4,6);const [x,y]=POS[i];const lit=t>a&&t<(A[i+1]??D+9)-0.15;
   // 开场先叠成一摞落下（摇一摇），念到哪项，哪张飞到自己的位置
   const d=MO.spring(t-0.2-i*0.08,1.6,7),dk=Math.min(1,Math.max(0,d)),fly=Math.min(1,Math.max(0,u));const dx=390+i*8+Math.sin(t*3+i)*10,dy=MO.lerp(-300,980-i*16,dk)+MO.wob(t,i+9,8,0.8);
   MO.set($(id+'c'+i),{x:t>a?MO.lerp(dx,x,fly):dx,y:(t>a?MO.lerp(dy,y,fly):dy)+MO.wob(t,i+3,6,0.6)*fly,s:(t>a?MO.lerp(0.85,1,fly):0.85)*(lit?1.07:1),r:t>a?(1-fly)*(i%2?12:-12):(i-2)*5+Math.sin(t*4+i)*3,o:dk>0?1:0});$(id+'c'+i).style.zIndex=t>a?20+i:10-i;
   $(id+'c'+i).style.borderColor=lit?GOLD:'rgba(255,255,255,.18)';$(id+'c'+i).style.boxShadow=lit?'0 0 50px rgba(255,201,77,.5)':''});
  A.forEach((a,i)=>MO.ring(g,t,a,POS[i][0]+150,POS[i][1]+110,{r1:240,width:6,color:'169,139,255'}))},
 sfx:sc=>sc.items.map((w,i)=>[at(sc,w,1.4+i*0.9)-0.1,'tick'])},

/* 5 揭晓：000087 前面的零被吃掉，和另一个 87 撞上；零飞回来、盾牌护住 */
zero:{bg:'#110b22',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:120px">${H.fmt(sc.head)}</div>
  <div class="v-a" id="${id}cell" style="left:150px;top:430px;width:780px;height:270px;border-radius:30px;border:6px solid ${VIO};background:rgba(169,139,255,.08)"><span class="v-pill dim" style="position:absolute;left:24px;top:-34px;font-size:30px">${H.fmt(sc.col)}</span></div>
  <div class="c-code" id="${id}A" style="top:470px">${String(sc.a).split('').map((ch,i)=>`<span id="${id}a${i}" class="${i<String(sc.a).length-String(sc.b).length?'c-z':''}">${ch}</span>`).join('')}</div>
  <div class="c-code" id="${id}B" style="top:740px;color:#ffb3bd">${H.fmt(sc.b)}</div>
  <div class="v-a v-ctr" id="${id}e1" style="top:690px"><span class="v-pill hot" style="font-size:40px">${H.fmt(sc.eaten)}</span></div>
  <div class="v-a v-ctr" id="${id}e2" style="top:960px"><span class="v-pill" style="background:rgba(255,90,110,.25);color:#ffb3bd;border:3px solid ${RED};font-size:44px">${I.warn(40,RED)} ${H.fmt(sc.clash)}</span></div>
  <div class="c-shield" id="${id}sh" style="top:380px"><svg width="300" height="300" viewBox="0 0 64 64"><path d="M32 4l24 9v17c0 15-10 26-24 30C18 56 8 45 8 30V13z" fill="rgba(91,214,155,.18)" stroke="${MINT}" stroke-width="3"/></svg></div>
  <div class="v-a" id="${id}k1" style="left:120px;top:1100px"><span class="v-pill" style="background:rgba(91,214,155,.2);color:${MINT};border:3px solid ${MINT};font-size:46px">${I.check(42,MINT)} ${H.fmt(sc.keep)}</span></div>
  <div class="v-a" id="${id}k2" style="left:540px;top:1100px"><span class="v-pill" style="background:rgba(255,201,77,.18);color:${GOLD};border:3px solid ${GOLD};font-size:46px">${I.bell(42,GOLD)} ${H.fmt(sc.warn)}</span></div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const EAT=at(sc,'吃掉',2.4,H),CL=at(sc,'撞成',4.0,H),KP=at(sc,'原样保留',5.6,H),WN=at(sc,'提醒',6.6,H);
  const g=K.frame(id,t,H,{...BG,hue:[255,170,60]},{seed:52,beats:[EAT,CL,KP,WN]});K.title($(id+'hd')._chars,t,0.05,'punch');
  const A=String(sc.a),nz=A.length-String(sc.b).length;MO.set($(id+'A'),{s:1+0.04*Math.sin(Math.PI*MO.prog(t,1.3,1.6))});
  // 开场：编码一位位打出来，表格格子落下来框住它
  const CE=Math.min(1.3,EAT-0.9);MO.set($(id+'cell'),{y:-500*(1-MO.tw(t,CE,0.45,'outBack')),o:MO.tw(t,CE,0.2)*(1-0.5*MO.prog(t,EAT,EAT+0.4)),s:1+0.02*Math.sin(t*4)});
  // 零被吃掉（飞走），保留时飞回来
  for(let i=0;i<A.length;i++){const el=$(id+'a'+i);const tin=MO.ease('outBackBig')(MO.prog(t,0.2+i*0.14,0.45+i*0.14));if(i>=nz){MO.set(el,{s:tin,o:t>0.2+i*0.14?1:0,x:-nz*112*MO.E.inOutC(MO.prog(t,EAT+0.3,EAT+0.7))*(1-MO.E.inOutC(MO.prog(t,KP,KP+0.5))),y:t>CL&&t<KP?Math.sin(t*40)*5:0});el.style.color=t>CL&&t<KP?'#ffb3bd':'#fff';continue}
   const out=MO.prog(t,EAT,EAT+0.45),back=MO.prog(t,KP,KP+0.5);MO.set(el,{x:(1-back)*out*(-300-i*120),y:(1-back)*(out*-260+Math.sin(Math.PI*out)*-80),r:(1-back)*out*(-90-i*40),o:(back>0?back:1-out)*(t>0.2+i*0.14?1:0),s:MO.ease('outBackBig')(MO.prog(t,0.2+i*0.14,0.45+i*0.14))})}
  MO.set($(id+'e1'),{s:MO.ease('outBackBig')(MO.prog(t,EAT+0.2,EAT+0.5)),o:t>EAT+0.2?1-MO.prog(t,CL-0.6,CL-0.35):0});
  // 另一个 87 撞上来
  const bu=MO.tw(t,CL-0.4,0.4,'inQ');MO.set($(id+'B'),{x:MO.lerp(900,0,bu)+(t>CL&&t<KP?Math.sin(t*40)*8:0),y:-MO.lerp(0,90,MO.prog(t,CL,CL+0.2))*(1-MO.prog(t,KP,KP+0.4))+MO.prog(t,KP,KP+0.4)*140,o:t>CL-0.4?(1-0.6*MO.prog(t,KP,KP+0.4)):0,s:1-0.4*MO.prog(t,KP,KP+0.4)});
  MO.set($(id+'e2'),{s:MO.ease('outBackBig')(MO.prog(t,CL,CL+0.3)),o:t>CL&&t<KP+0.3?1:0});
  MO.set($(id+'sh'),{s:MO.ease('outBackBig')(MO.prog(t,KP,KP+0.4))*(1+0.03*Math.sin(t*4)),o:t>KP?0.95:0});
  MO.set($(id+'k1'),{x:-500*(1-MO.tw(t,KP+0.2,0.45,'outBack')),o:MO.tw(t,KP+0.2,0.2)});MO.set($(id+'k2'),{x:500*(1-MO.tw(t,WN-0.1,0.45,'outBack')),o:MO.tw(t,WN-0.1,0.2),r:t>WN?Math.sin(t*16)*3*(1-MO.prog(t,WN+0.3,WN+1)):0});
  K.flash(g,t,CL,0.15,'255,225,230');MO.ring(g,t,CL,540,820,{r1:520,width:14,color:'255,90,110'});MO.ring(g,t,KP+0.2,540,560,{r1:520,width:12,color:'91,214,155'});MO.burst(g,t,KP+0.3,540,560,{n:30,seed:9,colors:[MINT,'#fff',GOLD],speed:[300,900],life:1.1})},
 sfx:sc=>[[at(sc,'吃掉',2.4),'pop'],[at(sc,'撞成',4.0),'pop'],[at(sc,'原样保留',5.6),'ding'],[at(sc,'提醒',6.6),'tick']]},

/* 6 结尾 */
cta:{bg:'#110b22',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:1030});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:118px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:640px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:670px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#b79cff,#6a45d8)">${I.table(110,'#fff')}</div>`+cb.html)},
 init:(sc,id,H)=>{sc._H=H;split(id,'tt')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:62});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=at(sc,'关注',2.4,H),S=at(sc,'私信',4.6,H)-0.3;const p=sc._cb.anim(t,{show:1.3,follow:F,type:at(sc,'评论',3.0,H)+0.2,send:S});
  MO.burst(g,t,OPEN,540,780,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,780,{r1:700,width:14,color:'169,139,255'});K.flash(g,t,OPEN,0.2,'235,225,255');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.4,'pop'],[4.0,'pop']]},
outro:K.outro(BG),
};
})();
