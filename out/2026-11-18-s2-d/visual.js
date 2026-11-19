/* 2026-11-18-s2-d 商品资料维护 · 格式乱、列名不统一也能自动对上（自定义选题）。色调：玫瑰紫 + 暖金。
   主线：三个供应商三份表，列名不同、数字全角带符号 → 交给它：列名自动对上 → 以前手动改格式一份十几分钟 →
   三步（第三步躲开一个大坑）→ 揭晓：坑是把原始资料改丢了；它不动原文件，原始值和改动都有记录 → 关注领取。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I,AVC}=K;
const RED='#FF5A6E',ROSE='#ff8fb8';
const BG={seed:96,hue:[255,120,180],hue2:[255,180,80],hue3:[190,140,255],base:['#2a1230','#180a1d','#09040c']};
const css=`
.h-sheet{position:absolute;left:0;top:0;width:430px;border-radius:26px;background:#fff8fb;color:#2a1230;padding:20px 22px;box-shadow:0 24px 50px rgba(0,0,0,.5)}
.h-sheet .hd{display:flex;gap:12px;margin-bottom:14px}
.h-sheet .hd span{flex:1;padding:10px 12px;border-radius:12px;background:#f3dbe8;font-size:32px;font-weight:900;white-space:nowrap;text-align:center}
.h-sheet .ln{height:20px;border-radius:10px;background:#efdfe8;margin:12px 0}
.h-sheet .v{margin-top:8px;padding:10px 14px;border-radius:12px;background:#fff0c9;font-size:36px;font-weight:900;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace;white-space:pre;text-align:center}
.h-chip{position:absolute;left:0;top:0;width:340px;height:100px;border-radius:26px;display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:900;white-space:nowrap}
.h-raw{background:rgba(255,255,255,.08);border:3px dashed rgba(255,143,184,.6);color:#ffd2e3}
.h-std{background:rgba(91,214,155,.12);border:3px solid rgba(91,214,155,.45);color:#d8ffee}
.h-clock{position:absolute;left:290px;top:420px;width:500px;height:500px}
.h-cell{position:absolute;left:190px;top:1000px;width:700px;height:150px;border-radius:30px;background:#fff8fb;color:#2a1230;font-size:76px;font-weight:900;display:flex;align-items:center;justify-content:center;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace;white-space:pre;box-shadow:0 24px 50px rgba(0,0,0,.45)}
.h-car{display:inline-block;width:6px;height:80px;background:#2a1230;margin-left:4px;vertical-align:middle}
.h-step{position:absolute;left:70px;width:940px;height:230px;border-radius:40px;background:rgba(255,255,255,.07);border:3px solid rgba(255,255,255,.14);display:flex;align-items:center;gap:30px;padding:0 40px;color:#fff;font-size:56px;font-weight:900;white-space:nowrap}
.h-step .n{width:110px;height:110px;border-radius:50%;background:${GOLD};color:#2a1230;display:flex;align-items:center;justify-content:center;font-size:56px;flex:none}
.h-pit{margin-left:auto;width:200px;height:110px;border-radius:50%;background:radial-gradient(ellipse at 50% 40%,#000 0 45%,rgba(0,0,0,.6) 60%,transparent 72%)}
.h-file{position:absolute;left:70px;top:460px;width:400px;height:500px;border-radius:30px;background:#fff8fb;padding:30px;box-shadow:0 30px 60px rgba(0,0,0,.5)}
.h-file .t{display:flex;align-items:center;gap:14px;font-size:44px;font-weight:900;color:#2a1230;white-space:nowrap}
.h-file .ln{height:24px;border-radius:12px;background:#efdfe8;margin:22px 0}
.h-shield{position:absolute;left:30px;top:410px;width:480px;height:600px}
.h-log{position:absolute;left:520px;top:460px;width:500px;border-radius:30px;background:rgba(255,255,255,.07);border:3px solid rgba(255,255,255,.14);padding:24px}
.h-log .hd{display:flex;align-items:center;gap:12px;font-size:40px;font-weight:900;color:#ffd2e3;margin-bottom:14px;white-space:nowrap}
.h-lr{border-radius:20px;background:rgba(255,255,255,.07);padding:14px 18px;margin-bottom:14px;color:#fff;white-space:pre}
.h-lr .k{font-size:28px;color:#ffb8d1;font-weight:900}
.h-lr .d{font-size:32px;font-weight:900;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace;margin-top:4px}
.h-lr s{color:#ff9aaa}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
const at=(sc,w,d,H)=>{H=H||sc._H;return H?(H.at(sc,w)??d):d};

window.VISUALS={
/* 0 钩子：三份表一张张落下，列名各不相同；说到"全角"时三种怪格式一起闪 */
messy:{bg:'#180a1d',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="display:none">`+K.layers(id,`
  <div class="v-a" style="left:0;top:0;width:1080px;height:1920px;background:linear-gradient(180deg,rgba(24,10,29,.55),rgba(24,10,29,.2) 40%,rgba(24,10,29,.9))"></div>
  ${sc.sheets.map((h,i)=>`<div class="h-sheet" id="${id}s${i}"><div class="hd"><span id="${id}a${i}">${H.fmt(h[0])}</span><span id="${id}b${i}">${H.fmt(h[1])}</span></div><div class="ln" style="width:90%"></div><div class="ln" style="width:60%"></div><div class="v" id="${id}v${i}">${H.fmt(sc.vals[i])}</div></div>`).join('')}
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:1200px;font-size:112px">${H.fmt(sc.head)}</div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const S1=at(sc,'售价',2.0,H),S2=at(sc,'价格',3.0,H),FW=at(sc,'全角',4.4,H),RM=at(sc,'人民币',5.6,H);
  const g=K.frame(id,t,H,{...BG,img:$(id+'img'),imgAlpha:0.75,grid:false,dust:12},{seed:6,push:0.05,beats:[0.3,0.9,1.5,S1,S2,FW,RM]});
  const POS=[[60,430,-8],[590,470,7],[320,760,-3]];
  sc.sheets.forEach((_,i)=>{const a=0.2+i*0.6;const u=MO.spring(t-a,1.5,7),uu=Math.min(1,Math.max(0,u));const [x,y,r]=POS[i];
   MO.set($(id+'s'+i),{x,y:MO.lerp(-600,y,uu)+MO.wob(t,i+3,6,0.6),r:r+(1-uu)*20,s:0.95,o:t>a?1:0});
   const hiA=t>S1&&t<S2+0.6,hiB=t>S2&&t<FW;$(id+'b'+i).style.background=(i===0&&hiA)||(i>0&&hiB)?GOLD:'#f3dbe8';
   const hv=t>FW;$(id+'v'+i).style.background=hv?`rgba(255,90,110,${(0.25+0.2*Math.sin(t*10+i)).toFixed(2)})`:'#fff0c9';if(hv)MO.set($(id+'v'+i),{s:1+0.06*Math.sin(t*8+i)})});
  K.title($(id+'hd')._chars,t,RM-0.2,'punch');
  MO.ring(g,t,FW,540,700,{r1:520,width:10,color:'255,90,110'})},
 sfx:sc=>[[0.2,'pop'],[0.8,'pop'],[1.4,'pop'],[at(sc,'全角',4.4),'tick']]},

/* 1 交给它：原列名一个个飞过去，对上标准列名，连线变绿 */
mapcols:{bg:'#180a1d',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:128px">${H.fmt(sc.head)}</div>
  ${sc.raw.map((x,i)=>`<div class="h-chip h-raw" id="${id}r${i}">${H.fmt(x)}</div>`).join('')}
  ${sc.std.map((x,i)=>`<div class="h-chip h-std" id="${id}s${i}">${H.fmt(x)}</div>`).join('')}
  <canvas class="v-a" id="${id}ln" width="1080" height="800" style="left:0;top:420px"></canvas>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const A=at(sc,'认得出',1.6,H),N=sc.raw.length,span=Math.max(0.4,(D-A-0.6)/N);
  const g=K.frame(id,t,H,BG,{seed:16,beats:[0.4,A,...sc.raw.map((_,i)=>A+0.4+i*span)]});K.title($(id+'hd')._chars,t,0.05,'drop');
  const lg=MO.canvas($(id+'ln'));
  sc.raw.forEach((_,i)=>{const y=450+i*150,a=A+0.4+i*span;MO.set($(id+'s'+i),{x:670+300*(1-MO.tw(t,0.2+i*0.1,0.45,'outBack')),y,o:MO.tw(t,0.2+i*0.1,0.2)});
   // 原列名先乱序摆在左边，轮到它时飞到对齐位置
   const sy=450+((i*3+1)%N)*150;const u=MO.E.inOutC(MO.prog(t,a,a+0.5));MO.set($(id+'r'+i),{x:-400*(1-MO.tw(t,0.3+i*0.1,0.45,'outBack'))+70,y:MO.lerp(sy,y,u)+MO.wob(t,i+7,5,0.7)*(1-u),r:(1-u)*((i%2)?5:-5),o:MO.tw(t,0.3+i*0.1,0.2)});
   const done=t>a+0.5;$(id+'r'+i).className='h-chip '+(done?'h-std':'h-raw');$(id+'s'+i).style.borderColor=done?MINT:'rgba(91,214,155,.45)';
   if(done){lg.strokeStyle=MINT;lg.lineWidth=6;lg.beginPath();lg.moveTo(410,y-420+50);lg.lineTo(MO.lerp(410,670,MO.prog(t,a+0.5,a+0.8)),y-420+50);lg.stroke();MO.set($(id+'s'+i),{x:670,y,s:1+0.08*Math.sin(Math.PI*MO.prog(t,a+0.5,a+0.8))})}});
  MO.dust(g,t,{n:16,seed:31,color:'255,201,77',size:[3,7],alpha:[.3,.8],speed:-50,drift:50})},
 sfx:sc=>[[at(sc,'认得出',1.6),'pop'],...sc.raw.map((_,i)=>[at(sc,'认得出',1.6)+0.9+i*0.8,'tick'])]},

/* 2 以前：时钟飞转，一个格子里手动删掉怪格式、重新敲 */
clock:{bg:'#180a1d',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:180px;font-size:120px">${H.fmt(sc.head)}</div>
  <div class="v-a" id="${id}nt" style="left:76px;top:330px"><span class="v-pill dim" style="font-size:30px">${H.fmt(sc.note)}</span></div>
  <canvas class="h-clock" id="${id}ck" width="500" height="500"></canvas>
  <div class="h-cell" id="${id}cl"><span id="${id}tx"></span><span class="h-car" id="${id}car"></span></div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const HD=at(sc,'十几分钟',2.8,H),ER=at(sc,'改错',D-1.0,H);
  const g=K.frame(id,t,H,{...BG,hue:[255,170,90]},{seed:26,beats:[0.4,1.2,HD,ER]});K.title($(id+'hd')._chars,t,HD-0.15,'punch');MO.set($(id+'nt'),{o:MO.tw(t,HD+0.3,0.3)});
  const cg=MO.canvas($(id+'ck'));cg.fillStyle='rgba(255,255,255,.08)';cg.beginPath();cg.arc(250,250,220,0,Math.PI*2);cg.fill();cg.strokeStyle='#fff';cg.lineWidth=12;cg.stroke();
  for(let k=0;k<12;k++){const a=k/12*Math.PI*2;cg.lineWidth=k%3?4:8;cg.beginPath();cg.moveTo(250+Math.cos(a)*180,250+Math.sin(a)*180);cg.lineTo(250+Math.cos(a)*205,250+Math.sin(a)*205);cg.stroke()}
  const sp=t*1.2+Math.max(0,t-HD)*4;cg.lineCap='round';cg.strokeStyle=GOLD;cg.lineWidth=14;cg.beginPath();cg.moveTo(250,250);cg.lineTo(250+Math.cos(sp*6-1.57)*160,250+Math.sin(sp*6-1.57)*160);cg.stroke();
  cg.strokeStyle='#fff';cg.lineWidth=18;cg.beginPath();cg.moveTo(250,250);cg.lineTo(250+Math.cos(sp*0.5-1.57)*110,250+Math.sin(sp*0.5-1.57)*110);cg.stroke();
  MO.set($(id+'ck'),{s:MO.ease('outBack')(MO.prog(t,0.05,0.45)),r:t>HD?Math.sin(t*20)*2:0});
  // 格子：先显示怪格式，逐字删掉，再一位位敲成规范格式，循环
  const A=String(sc.fix[0]),B=String(sc.fix[1]),cyc=Math.max(2.4,(D-0.6)/1.6),ph=((t-0.5)%cyc+cyc)%cyc/cyc;let txt=A;
  if(t>0.5){if(ph<0.4)txt=A.slice(0,Math.round(A.length*(1-ph/0.4)));else if(ph<0.9)txt=B.slice(0,Math.round(B.length*(ph-0.4)/0.5));else txt=B}
  $(id+'tx').textContent=txt;MO.set($(id+'car'),{o:Math.sin(t*12)>0?1:0.15});MO.set($(id+'cl'),{y:200*(1-MO.tw(t,0.2,0.5,'outBack')),o:MO.tw(t,0.2,0.2),x:t>ER?Math.sin(t*30)*6*(1-MO.prog(t,ER+0.3,ER+0.9)):0});
  $(id+'cl').style.background=t>ER?'#ffe0e6':'#fff8fb';
  MO.ring(g,t,HD,540,670,{r1:420,width:12,color:'255,201,77'});MO.ring(g,t,ER,540,1075,{r1:420,width:10,color:'255,90,110'})},
 sfx:sc=>[[0.3,'pop'],[at(sc,'十几分钟',2.8),'tick'],[at(sc,'改错',4.0),'pop']]},

/* 3 中段悬念：三步，第三步"躲开一个大坑"上锁、坑在抖 */
trap:{bg:'#180a1d',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:136px">${H.fmt(sc.head)}</div>
  ${sc.items.map((it,i)=>`<div class="h-step" id="${id}s${i}" style="top:${430+i*270}px"><span class="n">${i===2?I.lock(56,'#2a1230'):i+1}</span>${H.fmt(it)}${i===2?'<div class="h-pit" id="'+id+'pit"></div>':''}</div>`).join('')}`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const S=[at(sc,'认出',1.4,H),at(sc,'统一',2.8,H),at(sc,'第三步',4.2,H)],PT=at(sc,'大坑',5.2,H);
  const g=K.frame(id,t,H,BG,{seed:36,beats:[0.4,...S,PT]});K.title($(id+'hd')._chars,t,0.05,'punch');
  sc.items.forEach((_,i)=>{const a=0.25+i*0.2;const el=$(id+'s'+i);MO.set(el,{x:-1000*(1-MO.tw(t,a,0.5,'outBack')),o:MO.tw(t,a,0.2)*(t<S[i]-0.1?0.45:1),s:t>S[i]&&t<(S[i+1]??D+9)?1.03:1});
   el.style.borderColor=t>S[i]&&t<(S[i+1]??D+9)?GOLD:'rgba(255,255,255,.14)'});
  MO.set($(id+'pit'),{s:1+0.12*Math.sin(t*6)*(t>PT?1.6:1),x:t>PT?Math.sin(t*28)*6:0});$(id+'s2').style.boxShadow=t>S[2]?`0 0 ${(40+24*Math.sin(t*5)).toFixed(0)}px rgba(255,201,77,.5)`:'';
  S.forEach((a,i)=>MO.ring(g,t,a,180,545+i*270,{r1:260,width:8,color:'255,201,77'}));MO.ring(g,t,PT,880,1085,{r1:300,width:10,color:'255,90,110'})},
 sfx:sc=>[[at(sc,'认出',1.4),'tick'],[at(sc,'统一',2.8),'tick'],[at(sc,'第三步',4.2),'pop'],[at(sc,'大坑',5.2),'pop']]},

/* 4 揭晓：原文件被改丢（裂开变红）→ 盾牌罩住原文件；修改记录一行行列出"原来 → 现在" */
keep:{bg:'#180a1d',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:180px;font-size:120px">${H.fmt(sc.head)}</div>
  <div class="h-file" id="${id}fl"><div class="t">${I.folder(56,GOLD)}${H.fmt(sc.file)}</div><div class="ln" style="width:90%"></div><div class="ln" style="width:70%"></div><div class="ln" style="width:85%"></div><div class="ln" style="width:55%"></div><div class="ln" style="width:75%"></div></div>
  <div class="v-a" id="${id}lo" style="left:120px;top:1000px"><span class="v-pill" style="background:${RED};color:#fff;font-size:44px">${I.cross(40,'#fff')} ${H.fmt(sc.lost)}</span></div>
  <svg class="h-shield" id="${id}sh" viewBox="0 0 64 80"><path d="M32 3l27 10v24c0 20-12 34-27 40C17 71 5 57 5 37V13z" fill="rgba(91,214,155,.14)" stroke="${MINT}" stroke-width="2.6"/></svg>
  <div class="h-log" id="${id}lg"><div class="hd">${I.list(40,ROSE)}${H.fmt(sc.logname)}</div>${sc.log.map((r,i)=>`<div class="h-lr" id="${id}r${i}"><div class="k">${H.fmt(r[0])}</div><div class="d"><s>${H.fmt(r[1])}</s> → ${H.fmt(r[2])}</div></div>`).join('')}</div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const LO=at(sc,'原始资料',1.0,H),KP=at(sc,'不动',3.0,H),RC=at(sc,'原始值',4.0,H),LG=at(sc,'记录',D-1.0,H);
  const g=K.frame(id,t,H,{...BG,hue:[91,214,155]},{seed:46,beats:[0.4,LO,KP,RC,LG]});K.title($(id+'hd')._chars,t,KP-0.15,'punch');
  // 先演坏情况：原文件被改得裂开、变红
  const bad=MO.prog(t,LO-0.3,LO+0.2)*(1-MO.prog(t,KP-0.25,KP+0.1));
  MO.set($(id+'fl'),{y:200*(1-MO.tw(t,0.15,0.5,'outBack')),o:MO.tw(t,0.15,0.2),r:-6*bad+MO.wob(t,4,1,0.4),x:Math.sin(t*30)*8*bad,s:1-0.05*bad});
  $(id+'fl').style.background=bad>0.3?'#ffd6dc':'#fff8fb';$(id+'fl').style.outline=bad>0.3?`6px dashed ${RED}`:'none';
  MO.set($(id+'lo'),{s:MO.ease('outBackBig')(MO.prog(t,LO-0.1,LO+0.2)),o:t>LO-0.1&&t<KP?1:0});
  // 再演它的做法：盾牌罩住，记录一行行出来
  MO.set($(id+'sh'),{s:MO.ease('outBackBig')(MO.prog(t,KP-0.1,KP+0.3))*(1+0.02*Math.sin(t*4)),o:t>KP-0.1?1:0});
  MO.set($(id+'lg'),{x:500*(1-MO.tw(t,RC-0.4,0.5,'outBack')),o:MO.tw(t,RC-0.4,0.2)});
  sc.log.forEach((_,i)=>{const a=RC-0.1+i*Math.max(0.3,(LG-RC)/sc.log.length);MO.set($(id+'r'+i),{x:120*(1-MO.tw(t,a,0.4,'outBack')),o:MO.tw(t,a,0.2)});$(id+'r'+i).style.background=t>a&&t<a+0.6?'rgba(255,201,77,.22)':'rgba(255,255,255,.07)'});
  MO.ring(g,t,LO,270,710,{r1:360,width:12,color:'255,90,110'});MO.ring(g,t,KP,270,710,{r1:420,width:12,color:'91,214,155'});MO.burst(g,t,KP+0.2,270,710,{n:28,seed:5,colors:[MINT,'#fff',GOLD],speed:[300,900],life:1.1})},
 sfx:sc=>[[at(sc,'改丢了',1.6),'pop'],[at(sc,'不动',3.0),'ding'],[at(sc,'原始值',4.0),'tick']]},

/* 5 结尾 */
cta:{bg:'#180a1d',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:1030});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:118px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:640px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:670px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#ff9fc3,#c2457b)">${I.table(110,'#fff')}</div>`+cb.html)},
 init:(sc,id,H)=>{sc._H=H;split(id,'tt')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,KW=at(sc,'格式',3.6,H),g=K.frame(id,t,H,BG,{seed:66,beats:[at(sc,'关注',2.4,H),at(sc,'评论区',3.0,H),KW]});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6)-90*Math.sin(Math.PI*MO.prog(t,KW,KW+0.45)),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=at(sc,'关注',2.4,H),S=at(sc,'私信',4.6,H)-0.3;const p=sc._cb.anim(t,{show:1.3,follow:F,type:at(sc,'评论',3.0,H)+0.2,send:S});
  MO.burst(g,t,OPEN,540,780,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,780,{r1:700,width:14,color:'255,143,184'});K.flash(g,t,OPEN,0.2,'255,230,240');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.ring(g,t,KW,540,760,{r1:480,width:10,color:'255,201,77'});MO.burst(g,t,KW+0.2,540,700,{n:30,seed:12,colors:[ROSE,'#fff',GOLD],speed:[300,900],life:1});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.4,'pop'],[4.0,'pop']]},
outro:K.outro(BG),
};
})();
