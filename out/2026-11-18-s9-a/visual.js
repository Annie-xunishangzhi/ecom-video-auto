/* 2026-11-18-s9-a 售后与退款 · 专属画面。色调：深夜台灯的暖琥珀 + 退款红（大促后的售后工位）。
   主线：退款单从天上砸下来堆成山 → 一单单看原因翻聊天查物流 → 倒计时归零被判责扣分 →
   交给它：扫描读原因、飞进四个分组箱（第三步上锁）→ 疑点单被单独挑出来，贴上证据等你拍板 → 关注领取。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I,AVC}=K;
const RED='#FF5A4E';
const BG={seed:9,hue:[255,150,60],hue2:[255,77,26],hue3:[255,201,77],base:['#2a160f','#160b08','#090403']};
const css=`
.r-card{position:absolute;left:0;top:0;width:420px;height:118px;border-radius:24px;background:#fffaf2;color:#2a160f;display:flex;align-items:center;gap:16px;padding:0 22px;font-size:34px;font-weight:800;white-space:nowrap;box-shadow:0 18px 34px rgba(0,0,0,.45)}
.r-card .tg{padding:6px 14px;border-radius:12px;background:${RED};color:#fff;font-size:26px;font-weight:900;flex:none}
.r-card .ic{width:58px;height:58px;border-radius:16px;background:#f3e3cf;display:flex;align-items:center;justify-content:center;flex:none}
.r-badge{position:absolute;min-width:260px;height:160px;border-radius:80px;background:${RED};color:#fff;font-size:104px;font-weight:900;display:flex;align-items:center;justify-content:center;padding:0 40px;box-shadow:0 22px 70px rgba(255,90,78,.65);font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace}
.r-big{position:absolute;left:70px;width:940px;border-radius:40px;background:#fffaf2;color:#2a160f;padding:34px 40px;box-shadow:0 30px 60px rgba(0,0,0,.5)}
.r-big .h{display:flex;align-items:center;gap:20px;font-size:50px;font-weight:900;white-space:nowrap}
.r-big .h .tg{margin-left:auto;padding:8px 20px;border-radius:14px;background:${RED};color:#fff;font-size:32px}
.r-ln{height:22px;border-radius:11px;background:#eadcc8;margin-top:22px}
.r-chk{position:absolute;width:440px;height:150px;border-radius:30px;background:rgba(255,255,255,.07);border:3px solid rgba(255,255,255,.14);display:flex;align-items:center;gap:22px;padding:0 30px;font-size:52px;font-weight:900;color:#fff;white-space:nowrap}
.r-chk .bx{width:70px;height:70px;border-radius:20px;border:5px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;flex:none}
.r-q{position:absolute;left:0;top:0;width:150px;height:44px;border-radius:12px;background:rgba(255,250,242,.16);border:2px solid rgba(255,250,242,.22)}
.r-clock{position:absolute;left:140px;top:420px;width:800px;height:800px}
.r-digits{position:absolute;left:0;right:0;top:700px;text-align:center;font-size:150px;font-weight:900;color:#fff;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace;letter-spacing:4px}
.r-stamp{position:absolute;left:290px;top:600px;width:500px;height:250px;border-radius:30px;border:16px solid ${RED};color:${RED};font-size:150px;font-weight:900;display:flex;align-items:center;justify-content:center;letter-spacing:20px;background:rgba(40,8,6,.55)}
.r-meter{position:absolute;left:170px;top:1250px;width:740px;height:150px;border-radius:30px;background:rgba(255,255,255,.07);border:3px solid rgba(255,255,255,.14);padding:22px 30px;color:#fff;font-size:40px;font-weight:900}
.r-meter .bar{margin-top:16px;height:30px;border-radius:15px;background:rgba(255,255,255,.12);overflow:hidden}
.r-meter .bar i{display:block;height:100%;border-radius:15px;background:linear-gradient(90deg,${GOLD},${MINT})}
.r-step{position:absolute;left:70px;height:96px;border-radius:30px;display:flex;align-items:center;gap:18px;padding:0 30px;font-size:42px;font-weight:900;color:#fff;background:rgba(255,255,255,.08);border:3px solid rgba(255,255,255,.16);white-space:nowrap}
.r-step .n{width:60px;height:60px;border-radius:50%;background:${GOLD};color:#2a160f;display:flex;align-items:center;justify-content:center;font-size:34px;flex:none}
.r-scan{position:absolute;left:70px;top:610px;width:940px;height:300px;border-radius:36px;background:rgba(255,201,77,.05);border:3px dashed rgba(255,201,77,.4)}
.r-beam{position:absolute;left:470px;top:600px;width:14px;height:320px;border-radius:7px;background:${GOLD};box-shadow:0 0 40px 12px rgba(255,201,77,.6)}
.r-bin{position:absolute;top:960px;width:218px;height:190px;border-radius:30px;background:rgba(255,255,255,.07);border:3px solid rgba(255,255,255,.16);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:20px;color:#fff;font-size:34px;font-weight:900;white-space:nowrap}
.r-bin b{font-size:60px;color:${GOLD};font-family:"DejaVu Sans Mono",monospace;line-height:1}
.r-mini{position:absolute;width:290px;height:150px;border-radius:24px;background:#fffaf2;color:#2a160f;padding:20px 22px;box-shadow:0 14px 28px rgba(0,0,0,.4)}
.r-mini .t{display:flex;align-items:center;gap:10px;font-size:28px;font-weight:900;white-space:nowrap}
.r-mini .ok{margin-left:auto;width:40px;height:40px;border-radius:50%;background:${MINT};display:flex;align-items:center;justify-content:center}
.r-mini i{display:block;height:16px;border-radius:8px;background:#eadcc8;margin-top:16px}
.r-proof{position:absolute;left:0;top:0;height:92px;border-radius:24px;display:flex;align-items:center;gap:14px;padding:0 28px;background:rgba(255,201,77,.16);border:3px solid ${GOLD};color:#fff;font-size:40px;font-weight:900;white-space:nowrap}
.r-num{position:absolute;font-size:200px;font-weight:900;color:rgba(255,201,77,.16);font-family:"DejaVu Sans Mono",monospace;line-height:1}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
const at=(sc,w,d,H)=>{H=H||sc._H;return H?(H.at(sc,w)??d):d};   // 音效表只拿到 sc：init 里把 H 存到 sc._H
const note=(id,k,txt,H,pos)=>`<div class="v-a" id="${id}${k}" style="${pos}"><span class="v-pill dim" style="font-size:30px;padding:8px 20px">${H.fmt(txt)}</span></div>`;

window.VISUALS={
/* 0 钩子：退款单从天上砸下来越堆越高，角标冲到 200+ */
flood:{bg:'#160b08',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="display:none">`+K.layers(id,`
  <div class="v-a" style="left:0;top:0;width:1080px;height:1920px;background:linear-gradient(180deg,rgba(22,11,8,.55),rgba(22,11,8,.1) 40%,rgba(22,11,8,.85))"></div>
  <div class="v-a" id="${id}kk" style="left:70px;top:180px"><span class="v-pill hot" style="font-size:46px">${H.fmt(sc.kicker)}</span></div>
  ${Array.from({length:22},(_,k)=>`<div class="r-card" id="${id}c${k}"><div class="ic">${I.bag(40,'#FF5A4E')}</div>${H.fmt(sc.cards[k%sc.cards.length])}<span class="tg" style="margin-left:auto">${H.fmt(sc.tag)}</span></div>`).join('')}
  <div class="r-badge" id="${id}bd" style="left:690px;top:160px;z-index:50">0</div>
  ${note(id,'nt',sc.note,H,'left:770px;top:340px')}
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:1260px;font-size:118px;z-index:40">${H.fmt(sc.head)}</div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;
  const N2=at(sc,'两百多',2.0,H),Q=at(sc,'你还在',3.4,H);
  const g=K.frame(id,t,H,{...BG,dust:20,grid:false,img:$(id+'img'),imgAlpha:0.7},{seed:2,push:0.04,beats:[N2,Q]});
  MO.set($(id+'kk'),{x:-400*(1-MO.tw(t,0.05,0.45,'outBack')),o:MO.tw(t,0.05,0.2)});
  // 卡片一张张砸下来，落成一座山（越落越快）
  for(let k=0;k<22;k++){const a=0.25+Math.pow(k/22,0.8)*(D-1.2);const row=Math.floor(k/3),col=k%3;
   const tx=70+col*250+(MO.hash(k,3)-0.5)*90,ty=1140-row*62-(col===1?30:0)+(MO.hash(k,5)-0.5)*24,tr=(MO.hash(k,7)-0.5)*26;
   const u=MO.tw(t,a,0.45,'outBack');const land=MO.prog(t,a+0.35,a+0.55);
   MO.set($(id+'c'+k),{x:tx+MO.wob(t,k,4,0.6),y:MO.lerp(-260,ty,u)+6*Math.sin(Math.PI*land),r:tr+(1-u)*40*(k%2?1:-1),s:0.82,o:t>a?1:0});$(id+'c'+k).style.zIndex=k}
  // 角标：数字越滚越快，冲到 200+
  const n=Math.round(MO.lerp(0,230,MO.E.inQ(MO.prog(t,0.3,N2+0.4))));const bd=$(id+'bd');bd.textContent=n>=200?sc.badge:String(n);
  MO.set(bd,{s:MO.ease('outBack')(MO.prog(t,0.2,0.5))*(1+0.07*Math.sin(t*16)*(n>=200?1:0.3)),r:n>=200?Math.sin(t*22)*4:0});
  MO.set($(id+'nt'),{o:MO.tw(t,N2+0.3,0.3)});
  K.title($(id+'hd')._chars,t,Q-0.15,'punch');if(t>Q+0.7)MO.textWave($(id+'hd')._chars,t,{amp:6,from:Q+0.7});
  MO.ring(g,t,N2+0.4,820,240,{r1:380,width:12});MO.burst(g,t,N2+0.4,820,240,{n:26,seed:3,colors:[RED,'#fff',GOLD],speed:[300,800],life:1.0});
  MO.ring(g,t,Q,540,1330,{r1:520,width:10,color:'255,201,77'})},
 sfx:(sc,H)=>[[0.3,'pop'],[1.0,'tick'],[1.5,'tick'],[at(sc,'两百多',2.0,H)+0.4,'ding'],[at(sc,'你还在',3.4,H),'pop']]},

/* 1 一单单磨：看原因、翻聊天、查物流、退不退，四项轮着亮；后面排队的单子越来越多 */
grind:{bg:'#160b08',
 build:(sc,id,H)=>K.layers(id,`
  ${Array.from({length:10},(_,k)=>`<div class="r-q" id="${id}q${k}"></div>`).join('')}
  <div class="r-big" id="${id}od" style="top:300px"><div class="h">${I.bag(56,'#FF5A4E')}${H.fmt(sc.order)}<span class="tg">${H.fmt(sc.status)}</span></div><div class="r-ln" style="width:80%"></div><div class="r-ln" style="width:55%"></div></div>
  ${sc.checks.map((c,i)=>`<div class="r-chk" id="${id}k${i}" style="left:${70+(i%2)*500}px;top:${650+Math.floor(i/2)*190}px"><div class="bx" id="${id}b${i}"></div>${H.fmt(c)}</div>`).join('')}
  <svg class="v-a" id="${id}sw" width="220" height="220" viewBox="0 0 220 220" style="left:820px;top:1060px"><circle cx="110" cy="120" r="88" fill="rgba(255,255,255,.08)" stroke="#fff" stroke-width="10"/><rect x="94" y="10" width="32" height="22" rx="6" fill="#fff"/><line id="${id}hand" x1="110" y1="120" x2="110" y2="52" stroke="${GOLD}" stroke-width="10" stroke-linecap="round"/></svg>
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:1095px;font-size:112px">${H.fmt(sc.head)}</div>
  ${note(id,'nt',sc.note,H,'left:76px;top:1250px')}`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;
  const C=[at(sc,'看原因',0.5,H),at(sc,'翻聊天',1.3,H),at(sc,'查物流',2.1,H),at(sc,'退不退',3.0,H)],HD=at(sc,'一单就要',3.9,H);
  const g=K.frame(id,t,H,BG,{seed:12,beats:[...C,HD]});
  MO.set($(id+'od'),{y:-160*(1-MO.tw(t,0.05,0.5,'outBack')),o:MO.tw(t,0.05,0.2),r:MO.wob(t,4,0.6,0.4)});
  // 四项检查：说到哪项，哪项亮起、打勾
  sc.checks.forEach((_,i)=>{const a=C[i];const on=t>a&&t<(C[i+1]??HD)+0.2;const done=t>a+0.45;const el=$(id+'k'+i);
   MO.set(el,{s:MO.ease('outBack')(MO.prog(t,a-0.35,a))*(on?1.05+0.02*Math.sin(t*9):1),o:MO.tw(t,a-0.35,0.2)});
   el.style.borderColor=on?GOLD:done?'rgba(91,214,155,.55)':'rgba(255,255,255,.14)';el.style.background=on?'rgba(255,201,77,.16)':'rgba(255,255,255,.07)';
   $(id+'b'+i).innerHTML=done?I.check(52,MINT):'';$(id+'b'+i).style.borderColor=done?MINT:'rgba(255,255,255,.35)'});
  // 后面排队的单子：从上方一张张挤进来，越积越多
  for(let k=0;k<10;k++){const a=0.4+k*(D-1)/10;const u=MO.tw(t,a,0.4,'outBack');MO.set($(id+'q'+k),{x:70+(k%5)*190,y:MO.lerp(-80,190+Math.floor(k/5)*56,u)+MO.wob(t,k+20,3,0.8),o:t>a?1:0})}
  // 秒表一直转，说到"一单就要"时转快
  const ang=t*140+Math.max(0,t-HD)*900;$(id+'hand').setAttribute('transform',`rotate(${ang.toFixed(1)} 110 120)`);
  MO.set($(id+'sw'),{s:MO.ease('outBack')(MO.prog(t,HD-0.3,HD+0.1)),o:t>HD-0.3?1:0,r:Math.sin(t*12)*3*(t>HD?1:0)});
  K.title($(id+'hd')._chars,t,HD-0.1,'punch');MO.set($(id+'nt'),{o:MO.tw(t,HD+0.4,0.3)});
  C.forEach((a,i)=>MO.ring(g,t,a+0.45,320+(i%2)*500,725+Math.floor(i/2)*190,{r1:200,width:6,color:'91,214,155'}));MO.ring(g,t,HD,900,1170,{r1:300,width:10,color:'255,201,77'})},
 sfx:(sc,H)=>[[0.5,'tick'],[1.3,'tick'],[2.1,'tick'],[3.0,'tick'],[at(sc,'一单就要',3.9,H),'pop']]},

/* 2 坑：倒计时归零，"判责"印章砸下来，店铺分往下掉 */
deadline:{bg:'#120706',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:170px;font-size:130px">${H.fmt(sc.head)}</div>
  <div class="v-a v-ctr" id="${id}lb" style="top:345px"><span class="v-pill dim" style="font-size:40px">${I.clock(40)} ${H.fmt(sc.label)}</span></div>
  <canvas class="r-clock" id="${id}ck" width="800" height="800"></canvas>
  <div class="r-digits" id="${id}dg">${H.fmt(sc.from)}</div>
  <div class="r-stamp" id="${id}sp">${H.fmt(sc.stamp)}</div>
  <div class="r-meter" id="${id}mt">${H.fmt(sc.score)} <span id="${id}ar" style="color:${RED}">▼</span><div class="bar"><i id="${id}fill"></i></div></div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;
  const Z=at(sc,'判你',2.6,H),S=at(sc,'扣分',3.8,H),SL=at(sc,'超过',1.0,H);
  const g=K.frame(id,t,H,{...BG,hue:[255,70,60],base:['#2a0d0a','#150605','#080202']},{seed:22,beats:[SL,Z,S]});
  K.title($(id+'hd')._chars,t,0.05,'drop');MO.set($(id+'lb'),{o:MO.tw(t,0.4,0.3)});
  // 倒计时：从剧本给的时刻数到零，说到"判你"时正好归零
  const m=/(\d+):(\d+):(\d+)/.exec(sc.from||'00:00:09')||[0,0,0,9];const T0=(+m[1])*3600+(+m[2])*60+(+m[3]);
  const left=Math.max(0,Math.ceil(T0*(1-MO.prog(t,0.2,Z))));const hh=String(Math.floor(left/3600)).padStart(2,'0'),mm=String(Math.floor(left/60)%60).padStart(2,'0'),ss=String(left%60).padStart(2,'0');
  const dg=$(id+'dg');dg.textContent=`${hh}:${mm}:${ss}`;const hot=left<=3;dg.style.color=hot?RED:'#fff';
  MO.set(dg,{s:1+0.06*Math.max(0,Math.sin((t%1)*Math.PI))*(hot?2:1),x:hot&&t<Z?Math.sin(t*50)*6:0,o:1-0.6*MO.tw(t,Z,0.3)});
  // 进度环：一圈圈漏光
  const cg=MO.canvas($(id+'ck'));const p=1-MO.prog(t,0.2,Z);cg.lineCap='round';
  cg.strokeStyle='rgba(255,255,255,.1)';cg.lineWidth=40;cg.beginPath();cg.arc(400,400,330,0,Math.PI*2);cg.stroke();
  cg.strokeStyle=p<0.35?RED:GOLD;cg.shadowColor=cg.strokeStyle;cg.shadowBlur=30;cg.beginPath();cg.arc(400,400,330,-Math.PI/2,-Math.PI/2+Math.PI*2*p);cg.stroke();cg.shadowBlur=0;
  for(let k=0;k<60;k++){const a=k/60*Math.PI*2-Math.PI/2;const r1=k%5?285:270;cg.strokeStyle=`rgba(255,255,255,${k/60<p?0.5:0.12})`;cg.lineWidth=k%5?4:8;cg.beginPath();cg.moveTo(400+Math.cos(a)*r1,400+Math.sin(a)*r1);cg.lineTo(400+Math.cos(a)*300,400+Math.sin(a)*300);cg.stroke()}
  MO.set($(id+'ck'),{s:1+0.03*Math.sin(t*6)*(hot?2:1),r:t<Z?0:Math.sin(t*30)*2*MO.prog(t,Z,Z+0.5)*(1-MO.prog(t,Z+0.5,Z+1))});
  // 印章砸下
  const sp=MO.prog(t,Z,Z+0.22);MO.set($(id+'sp'),{s:MO.lerp(3,1,MO.E.inQ(sp)),r:-12,o:t>Z?1:0,blur:(1-sp)*8});
  // 店铺分往下掉
  const dn=MO.tw(t,S-0.2,0.8,'outC');$(id+'fill').style.width=(MO.lerp(88,46,dn)).toFixed(1)+'%';$(id+'fill').style.background=dn>0.5?`linear-gradient(90deg,${RED},#ff9a6b)`:'';
  MO.set($(id+'mt'),{y:200*(1-MO.tw(t,S-0.6,0.4,'outBack')),o:MO.tw(t,S-0.6,0.2),x:dn>0&&dn<1?Math.sin(t*40)*5:0});MO.set($(id+'ar'),{y:Math.abs(Math.sin(t*8))*10,o:t>S-0.2?1:0});
  K.flash(g,t,Z,0.18,'255,220,210');MO.ring(g,t,Z+0.2,540,725,{r1:620,width:16,color:'255,90,78'});MO.burst(g,t,Z+0.2,540,725,{n:30,seed:9,colors:[RED,'#fff'],speed:[400,1000],life:0.9})},
 sfx:(sc,H)=>[[0.3,'tick'],[1.3,'tick'],[2.0,'tick'],[at(sc,'判你',2.6,H),'pop'],[at(sc,'扣分',3.8,H),'tick']]},

/* 3 中段悬念：退款单穿过扫描光，读出原因，飞进四个分组箱；第三步上锁 */
sort:{bg:'#160b08',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:170px;font-size:118px">${H.fmt(sc.head)}</div>
  ${sc.items.map((s,i)=>`<div class="r-step" id="${id}s${i}" style="top:${330+i*0}px"><span class="n">${i===2?I.lock(36,'#2a160f'):i+1}</span>${H.fmt(s)}</div>`).join('')}
  <div class="r-scan" id="${id}sc"></div><div class="r-beam" id="${id}bm"></div>
  ${Array.from({length:8},(_,k)=>`<div class="r-card" id="${id}c${k}" style="width:330px;font-size:30px;height:100px"><span id="${id}r${k}">${H.fmt(sc.pending)}</span><span class="tg" id="${id}g${k}" style="margin-left:auto">${H.fmt(sc.wait)}</span></div>`).join('')}
  ${sc.bins.map((b,i)=>`<div class="r-bin" id="${id}b${i}" style="left:${70+i*240}px"><b id="${id}n${i}">0</b>${H.fmt(b)}</div>`).join('')}
  ${note(id,'nt',sc.note,H,'left:70px;top:1190px')}`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;
  const A1=at(sc,'先自动',2.2,H),A2=at(sc,'再按',4.6,H),A3=at(sc,'第三步',6.2,H);
  const g=K.frame(id,t,H,BG,{seed:32,beats:[A1,A2,A3]});
  K.title($(id+'hd')._chars,t,0.05,'drop');
  // 三步：一次只亮当前这一步，换步时上一步缩到左上角
  const W=[0,A1,A2,A3];sc.items.forEach((_,i)=>{const a=W[i+1]-0.2,nx=W[i+2]??(D+9);const u=MO.tw(t,a,0.4,'outBack'),v=MO.tw(t,nx-0.2,0.35,'inOutC');
   const el=$(id+'s'+i);MO.set(el,{x:MO.lerp(-700,0,u)+v*(i*0),y:-v*150+(i===2?MO.wob(t,5,4,0.8):0),s:1-0.3*v,o:MO.tw(t,a,0.2)*(1-v)});
   el.style.borderColor=i===2?GOLD:'rgba(255,255,255,.16)';if(i===2)el.style.boxShadow=`0 0 ${(30+20*Math.sin(t*5)).toFixed(0)}px rgba(255,201,77,.55)`});
  MO.set($(id+'sc'),{o:MO.tw(t,0.3,0.4),s:0.96+0.04*MO.tw(t,0.3,0.5,'outBack')});
  MO.set($(id+'bm'),{x:Math.sin(t*2.2)*12,o:MO.tw(t,A1-0.3,0.3)*(0.7+0.3*Math.sin(t*9))});
  // 卡片：从左边流进来，穿过扫描光读出原因，再落进对应的箱子
  const counts=[0,0,0,0];const st=0.5,gap=Math.max(0.55,(D-st-1.8)/8);
  for(let k=0;k<8;k++){const a=st+k*gap,bin=[0,1,0,2,3,0,1,2][k];const pIn=MO.prog(t,a,a+0.8),pOut=MO.prog(t,a+1.1,a+1.7);
   const x=MO.lerp(-380,300,MO.E.outC(pIn)),y=700+MO.wob(t,k+40,6,0.9);const bx=70+bin*240-56,by=990;
   const read=t>a+0.75;$(id+'r'+k).textContent=H.plain(read?sc.reasons[k%sc.reasons.length]:sc.pending);$(id+'g'+k).textContent=H.plain(read?sc.bins[bin]:sc.wait);$(id+'g'+k).style.background=read?(bin===3?RED:'#3c8c63'):'#9a8a78';
   MO.set($(id+'c'+k),{x:pOut>0?MO.lerp(x,bx,MO.E.inOutC(pOut)):x,y:pOut>0?MO.lerp(y,by,MO.E.inQ(pOut))-Math.sin(Math.PI*pOut)*160:y,s:1-0.5*pOut,r:pOut*12,o:(t>a?1:0)*(1-MO.prog(t,a+1.6,a+1.75))});
   if(t>a+1.7)counts[bin]++}
  sc.bins.forEach((_,i)=>{const el=$(id+'b'+i);MO.set(el,{y:160*(1-MO.tw(t,0.5+i*0.12,0.45,'outBack')),o:MO.tw(t,0.5+i*0.12,0.2)});$(id+'n'+i).textContent=String(counts[i]);
   const hit=[0,1,2,3,4,5,6,7].some(k=>{const a=st+k*gap+1.7;return [0,1,0,2,3,0,1,2][k]===i&&t>a&&t<a+0.35});el.style.borderColor=hit?GOLD:'rgba(255,255,255,.16)';MO.set($(id+'n'+i),{s:hit?1.3:1})});
  MO.set($(id+'nt'),{o:MO.tw(t,1.0,0.3)});
  MO.ring(g,t,A3,300,380,{r1:380,width:10,color:'255,201,77'});MO.dust(g,t,{n:20,seed:71,color:'255,201,77',size:[3,7],alpha:[.3,.85],speed:-60,drift:50})},
 sfx:(sc,H)=>[[at(sc,'先自动',2.2,H),'pop'],[at(sc,'再按',4.6,H),'pop'],[at(sc,'第三步',6.2,H),'ding']]},

/* 4 揭晓：一堆单子里有一张亮红，被单独挑出来放大，贴上三条证据，弹出"你来拍板" */
flag:{bg:'#160b08',
 build:(sc,id,H)=>K.layers(id,`
  <div class="r-num" id="${id}num" style="left:800px;top:1120px">${H.fmt(sc.num)}</div>
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:170px;font-size:124px">${H.fmt(sc.head)}</div>
  ${Array.from({length:9},(_,k)=>`<div class="r-mini" id="${id}m${k}"><div class="t">${I.bag(30,'#FF5A4E')}${H.fmt(sc.mini)}<span class="ok" id="${id}o${k}">${I.check(26,'#fff')}</span></div><i style="width:80%"></i><i style="width:50%"></i></div>`).join('')}
  <div class="r-big" id="${id}fc" style="top:420px;border:6px solid ${RED}"><div class="h">${I.warn(56,RED)}${H.fmt(sc.flag)}</div><div class="r-ln" style="width:72%"></div></div>
  ${sc.proofs.map((p,i)=>`<div class="r-proof" id="${id}p${i}">${[I.chat(46,'#fff'),I.search(46,'#fff'),I.list(46,'#FF5A4E')][i]}${H.fmt(p)}</div>`).join('')}
  <div class="v-a v-btn" id="${id}dc" style="left:70px;top:1150px;width:560px">${I.hand(60)} ${H.fmt(sc.decide)}</div>
  ${note(id,'nt',sc.note,H,'left:70px;top:1330px')}`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;
  const F=at(sc,'有疑点',0.8,H),A=at(sc,'附上',2.6,H),C=at(sc,'聊天',2.9,H),L=at(sc,'物流',3.5,H),P=at(sc,'等你拍板',4.6,H);
  const g=K.frame(id,t,H,{...BG,hue:[255,90,70]},{seed:42,beats:[F,F+0.6,A,L,P]});
  K.title($(id+'hd')._chars,t,0.05,'punch');if(t>1.2)MO.textWave($(id+'hd')._chars,t,{amp:5,from:1.2});
  MO.set($(id+'num'),{s:MO.ease('outBack')(MO.prog(t,0.1,0.5)),y:MO.wob(t,8,10,0.4)});
  // 九张已分好组的单子；疑点那张（中间）亮红，被抽出来
  const pick=MO.tw(t,F+0.3,0.6,'inOutC');
  for(let k=0;k<9;k++){const row=Math.floor(k/3),col=k%3;const x=70+col*325,y=440+row*180;const el=$(id+'m'+k);
   const u=MO.tw(t,0.15+k*0.06,0.4,'outBack');
   if(k===4){const glow=t>F?1:0;el.style.boxShadow=glow?`0 0 ${(40+20*Math.sin(t*10)).toFixed(0)}px rgba(255,90,78,.9)`:'';el.style.outline=glow?`6px solid ${RED}`:'none';$(id+'o'+k).style.background=glow?RED:MINT;
    MO.set(el,{x,y:MO.lerp(-200,y,u),o:MO.tw(t,0.15+k*0.06,0.2)*(1-MO.prog(t,F+0.5,F+0.8)),s:1+0.08*glow*Math.sin(t*10)});continue}
   MO.set(el,{x:x+pick*(col-1)*40,y:MO.lerp(-200,y,u)+pick*(row===0?-30:row===2?320:0),o:MO.tw(t,0.15+k*0.06,0.2)*(1-0.7*pick),s:1-0.1*pick,blur:pick*3})}
  // 放大后的疑点单
  const big=MO.tw(t,F+0.5,0.5,'outBack');MO.set($(id+'fc'),{s:MO.lerp(0.32,1,big),y:MO.lerp(180,0,big),o:t>F+0.5?1:0,r:MO.wob(t,4,0.6,0.4)});
  // 三条证据依次贴到疑点单下面
  const PA=[C,L,Math.max(L+0.6,(L+P)/2)];sc.proofs.forEach((_,i)=>{const a=PA[i]-0.15;const u=MO.tw(t,a,0.45,'outBack');const tx=70+i*[0,315,0][i]+(i===2?0:0),ty=[680,680,800][i];
   const fx=[70,385,70][i],fy=ty;MO.set($(id+'p'+i),{x:MO.lerp(i%2?1100:-500,fx,u),y:fy+MO.wob(t,i+30,4,0.7),o:MO.tw(t,a,0.2),r:(1-u)*(i%2?14:-14)})});
  // "你来拍板"按钮 + 手指点一下
  const pu=MO.ease('outBackBig')(MO.prog(t,P-0.25,P+0.15));const tap=Math.sin(Math.PI*MO.prog(t,P+0.5,P+0.8));MO.set($(id+'dc'),{s:pu*(1-0.08*tap),o:t>P-0.25?1:0});
  MO.set($(id+'nt'),{o:MO.tw(t,F+0.9,0.3)});
  MO.ring(g,t,F,540,800,{r1:420,width:10,color:'255,90,78'});PA.forEach(a=>MO.ring(g,t,a+0.3,400,740,{r1:260,width:6,color:'255,201,77'}));
  MO.burst(g,t,P+0.6,350,1210,{n:30,seed:12,colors:[GOLD,'#fff',MINT],speed:[300,900],life:1.1})},
 sfx:(sc,H)=>[[at(sc,'有疑点',0.8,H),'pop'],[at(sc,'聊天',2.9,H),'tick'],[at(sc,'物流',3.5,H),'tick'],[at(sc,'等你拍板',4.6,H),'ding']]},

/* 5 结尾：礼盒弹开，退款预审助手跳出来；关注 + 评论区发关键词 */
cta:{bg:'#160b08',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:960});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:150px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:530px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:560px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#ffb347,#e2552f)">${I.list(110,'#e2552f')}</div>`+cb.html)},
 init:(sc,id,H)=>{sc._H=H;split(id,'tt')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:62});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=at(sc,'关注',2.4,H),S=at(sc,'上线第一',4.2,H)-0.3;const p=sc._cb.anim(t,{show:1.3,follow:F,type:at(sc,'评论',3.0,H)+0.2,send:S});
  MO.burst(g,t,OPEN,540,640,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,640,{r1:700,width:14,color:'255,201,77'});K.flash(g,t,OPEN,0.25,'255,235,200');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.4,'pop'],[3.8,'pop']]},
outro:K.outro(BG),
};
})();
