/* 2026-11-18-s4-c 商品上架 · 提交前停下来让你确认。色调：墨蓝 + 企鹅橙（上午的运营工位）。
   主线：十点三款新品等上架，光标一快按了提交 → 手动直接提交出事 vs 助手到提交前一定停（栏杆落下）→
   实录：表单填好，它停在提交按钮前不点 → 三个本事，最安心的是哪个？→ 揭晓：提交前列核对清单，你点头它才提交 → 关注领取。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I,AVC}=K;
const RED='#FF5A4E',SKY='#7fb2ff';
const BG={seed:63,hue:[90,130,255],hue2:[255,77,26],hue3:[150,190,255],base:['#121a3a','#0a1026','#04060f']};
const css=`
.d-clock{position:absolute;left:70px;top:170px;padding:10px 30px;border-radius:26px;background:rgba(0,0,0,.45);border:3px solid rgba(255,255,255,.22);color:#fff;font-size:84px;font-weight:900;font-family:"DejaVu Sans Mono",monospace}
.d-item{position:absolute;width:290px;height:200px;border-radius:30px;background:rgba(14,20,46,.86);border:3px solid rgba(255,255,255,.14);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#fff;font-size:40px;font-weight:900;white-space:nowrap;box-shadow:0 18px 36px rgba(0,0,0,.4)}
.d-big{position:absolute;left:290px;top:880px;width:500px;height:170px;border-radius:44px;background:${RED};color:#fff;font-size:76px;font-weight:900;display:flex;align-items:center;justify-content:center;letter-spacing:12px;box-shadow:0 24px 70px rgba(255,90,78,.6)}
.d-lane{position:absolute;left:60px;width:960px;height:430px;border-radius:36px;background:rgba(255,255,255,.05);border:3px solid rgba(255,255,255,.12)}
.d-lane .hd{position:absolute;left:26px;top:22px}
.d-track{position:absolute;left:60px;right:60px;top:250px;height:16px;border-radius:8px;background:rgba(255,255,255,.12)}
.d-btn{position:absolute;right:50px;top:200px;width:220px;height:110px;border-radius:30px;background:${RED};color:#fff;font-size:46px;font-weight:900;display:flex;align-items:center;justify-content:center}
.d-dot{position:absolute;top:215px;width:84px;height:84px;border-radius:50%;background:${SKY};box-shadow:0 0 40px rgba(127,178,255,.8);display:flex;align-items:center;justify-content:center}
.d-bar{position:absolute;right:300px;top:120px;width:20px;height:240px;border-radius:10px;background:repeating-linear-gradient(180deg,#fff 0 30px,${RED} 30px 60px);transform-origin:50% 100%}
.d-oct{position:absolute;right:330px;top:40px;width:150px;height:150px;background:${RED};clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%);color:#fff;font-size:76px;font-weight:900;display:flex;align-items:center;justify-content:center;border:6px solid #fff}
.d-oops{position:absolute;right:40px;top:330px;padding:10px 24px;border-radius:18px;background:rgba(255,90,78,.25);color:#ffb3aa;border:3px solid ${RED};font-size:36px;font-weight:900;white-space:nowrap}
.d-card{position:absolute;left:0;top:0;width:300px;height:420px}
.d-face{width:300px;height:420px;border-radius:36px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;color:#fff;font-size:44px;font-weight:900;white-space:nowrap;box-sizing:border-box}
.d-face.fr{background:linear-gradient(160deg,#23336e,#121a3a);border:3px solid rgba(127,178,255,.5)}
.d-face.bk{background:linear-gradient(160deg,#ff8a4a,#e2552f);font-size:150px}
.d-list{position:absolute;left:70px;top:430px;width:940px;border-radius:40px;background:#f5f7ff;color:#121a3a;padding:30px 36px;box-shadow:0 30px 70px rgba(0,0,0,.5)}
.d-li{display:flex;align-items:center;gap:22px;height:104px;font-size:44px;font-weight:900;border-bottom:2px solid #e3e8f7;white-space:nowrap}
.d-li:last-child{border-bottom:0}
.d-li .bx{width:64px;height:64px;border-radius:18px;border:5px solid #c4cce6;display:flex;align-items:center;justify-content:center;flex:none}
.d-nod{position:absolute;left:70px;top:1110px;width:520px;height:150px;border-radius:44px;background:${ACC};color:#fff;font-size:62px;font-weight:900;display:flex;align-items:center;justify-content:center;gap:20px;box-shadow:0 24px 60px rgba(255,77,26,.55);white-space:nowrap}
.d-go{position:absolute;left:640px;top:1105px;width:360px;height:160px;border-radius:30px;border:12px solid ${MINT};color:${MINT};font-size:66px;font-weight:900;display:flex;align-items:center;justify-content:center;background:rgba(10,40,30,.6);white-space:nowrap}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
const at=(sc,w,d,H)=>{H=H||sc._H;return H?(H.at(sc,w)??d):d};

window.VISUALS={
/* 0 钩子：三款新品等上架，光标逼近"提交"，一快就按了下去 */
morning:{bg:'#0a1026',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="display:none">`+K.layers(id,`
  <div class="v-a" style="left:0;top:0;width:1080px;height:1920px;background:linear-gradient(180deg,rgba(10,16,38,.55),rgba(10,16,38,.2) 40%,rgba(10,16,38,.9))"></div>
  <div class="d-clock" id="${id}ck">${H.fmt(sc.time)}</div>
  ${sc.items.map((it,i)=>`<div class="d-item" id="${id}i${i}" style="left:${70+i*320}px;top:420px">${I.bag(70,i===1?GOLD:'#fff')}${H.fmt(it)}</div>`).join('')}
  <div class="d-big" id="${id}bt">${H.fmt(sc.btn)}</div>
  <div class="v-a" id="${id}cur" style="left:0;top:0">${I.hand(110)}</div>
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:1180px;font-size:124px">${H.fmt(sc.head)}</div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const S=at(sc,'三款',1.2,H),F=at(sc,'最怕',2.6,H),P=at(sc,'点了提交',4.6,H);
  const g=K.frame(id,t,H,{...BG,img:$(id+'img'),imgAlpha:0.8,grid:false,dust:14},{seed:4,push:0.05,beats:[S,F,P]});
  MO.set($(id+'ck'),{s:MO.ease('outBack')(MO.prog(t,0.05,0.4)),r:MO.wob(t,1,1.5,0.6)});
  sc.items.forEach((_,i)=>MO.set($(id+'i'+i),{y:-400*(1-MO.tw(t,S-0.2+i*0.15,0.5,'outBack')),o:MO.tw(t,S-0.2+i*0.15,0.2),r:MO.wob(t,i+2,2,0.5)}));
  MO.set($(id+'bt'),{s:MO.ease('outBack')(MO.prog(t,F-0.2,F+0.2))*(1+0.04*Math.sin(t*6))*(1-0.1*Math.sin(Math.PI*MO.prog(t,P,P+0.2))),o:t>F-0.2?1:0});
  // 光标：慢慢逼近，越来越快，按下去
  const u=MO.E.inQ(MO.prog(t,F,P));const cx=MO.lerp(900,560,u)+Math.sin(t*5)*8*(1-u),cy=MO.lerp(1500,950,u);MO.set($(id+'cur'),{x:cx,y:cy,s:1-0.2*Math.sin(Math.PI*MO.prog(t,P,P+0.2)),o:t>F?1:0});
  K.title($(id+'hd')._chars,t,P-0.1,'punch');
  K.flash(g,t,P+0.05,0.15,'255,225,220');MO.ring(g,t,P,540,965,{r1:520,width:14,color:'255,90,78'});MO.burst(g,t,P,540,965,{n:26,seed:3,colors:[RED,'#fff',GOLD],speed:[300,900],life:1})},
 sfx:sc=>[[at(sc,'三款',1.2),'pop'],[at(sc,'最怕',2.6),'tick'],[at(sc,'点了提交',4.6),'pop']]},

/* 1 对比：上面手动直接提交出事；下面助手走到提交前，栏杆落下、"停" */
brake:{bg:'#0a1026',
 build:(sc,id,H)=>K.layers(id,`
  <div class="d-lane" id="${id}L1" style="top:220px"><div class="hd"><span class="v-pill hot" style="font-size:40px">${H.fmt(sc.left.label)} · ${H.fmt(sc.left.value)}</span></div><div class="d-track"></div><div class="d-btn">${I.check(40,'#fff')}</div><div class="d-dot" id="${id}d1" style="background:${RED};box-shadow:0 0 40px rgba(255,90,78,.8)">${I.hand(56)}</div><div class="d-oops" id="${id}oo">${I.warn(34,RED)} ${H.fmt(sc.oops)}</div></div>
  <div class="d-lane" id="${id}L2" style="top:720px"><div class="hd"><span class="v-pill" style="background:rgba(127,178,255,.2);color:${SKY};border:3px solid ${SKY};font-size:40px">${H.fmt(sc.right.label)} · ${H.fmt(sc.right.value)}</span></div><div class="d-track"><i id="${id}pf" style="position:absolute;left:0;top:-6px;height:28px;border-radius:14px;background:linear-gradient(90deg,${SKY},#c9dcff);box-shadow:0 0 30px rgba(127,178,255,.7)"></i></div><div class="d-btn" style="opacity:.55">${I.check(40,'#fff')}</div><div class="d-dot" id="${id}d2">${I.list(48,'#0a1026')}</div><div class="d-bar" id="${id}bar"></div><div class="d-oct" id="${id}oct">${H.fmt(sc.stop)}</div></div>`),
 init:(sc,id,H)=>{sc._H=H},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const F1=at(sc,'还能改',1.2,H),O=at(sc,'提交出去',2.4,H),R=at(sc,'发布助手',4.0,H),ST=at(sc,'先停下',D-1.0,H);
  const g=K.frame(id,t,H,BG,{seed:14,beats:[F1,O,R,at(sc,'不一样',R+0.9,H),at(sc,'到了提交',R+1.8,H),ST]});
  MO.set($(id+'L1'),{x:-300*(1-MO.tw(t,0.05,0.5,'outBack')),o:MO.tw(t,0.05,0.2)*(1-0.45*MO.tw(t,R,0.4))});
  const u1=MO.E.inQ(MO.prog(t,0.4,O));MO.set($(id+'d1'),{x:60+u1*620,y:Math.sin(Math.PI*u1*3)*-20,r:u1*30});
  MO.set($(id+'oo'),{s:MO.ease('outBackBig')(MO.prog(t,O,O+0.3)),o:t>O?1:0,x:t>O?Math.sin(t*30)*5*(1-MO.prog(t,O+0.3,O+0.9)):0});
  MO.set($(id+'L2'),{x:300*(1-MO.tw(t,R-0.3,0.5,'outBack')),o:MO.tw(t,R-0.3,0.2)});
  const u2=MO.E.outC(MO.prog(t,R,ST));$(id+'pf').style.width=(u2*470+40).toFixed(0)+'px';$(id+'L2').style.borderColor=`rgba(127,178,255,${(0.25+0.5*Math.abs(Math.sin(t*3))*(t>R?1:0)).toFixed(2)})`;
  [at(sc,'不一样',R+0.9,H),at(sc,'到了提交',R+1.8,H)].forEach(b=>MO.ring(g,t,b,140+u2*470,975,{r1:260,width:8,color:'127,178,255'}));MO.set($(id+'d2'),{x:60+u2*470+(t>ST?Math.sin(t*8)*3:0),y:MO.wob(t,4,4,0.8)});
  const bar=MO.ease('outBounce')(MO.prog(t,ST-0.45,ST));$(id+'bar').style.transform=`rotate(${(-90+90*bar).toFixed(1)}deg)`;
  MO.set($(id+'oct'),{s:MO.ease('outBackBig')(MO.prog(t,ST-0.1,ST+0.25)),o:t>ST-0.1?1:0,r:Math.sin(t*3)*4});
  MO.ring(g,t,O,860,560,{r1:320,width:10,color:'255,90,78'});MO.ring(g,t,ST,680,880,{r1:400,width:12,color:'127,178,255'})},
 sfx:sc=>[[at(sc,'提交出去',2.4),'pop'],[at(sc,'发布助手',4.0),'tick'],[at(sc,'先停下',5.6),'ding']]},

/* 2 实录：表单填好，镜头推向底部的提交按钮；手指悬着，不点 */
real:{bg:'#0a1026',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}ln" style="left:70px;top:180px"><span class="v-pill" style="background:rgba(91,214,155,.18);color:${MINT};border:3px solid ${MINT};font-size:38px">${H.fmt(sc.line)}</span></div>
  ${K.win(id,H.fmt(sc.win),{x:60,y:300,w:960,h:860})}
  <div class="v-a v-shi" id="${id}shi" style="right:84px;top:380px">示意</div>
  <div class="v-a" id="${id}hand" style="left:0;top:0">${I.hand(120)}</div>
  <div class="v-a v-ctr" id="${id}gd" style="top:1220px"><span class="v-pill" style="background:rgba(127,178,255,.2);color:#fff;border:3px solid ${SKY};font-size:48px">${I.lock(44)} ${H.fmt(sc.guard)}</span></div>`),
 init:(sc,id,H)=>{sc._H=H;H.$(id+'body').innerHTML=`<canvas id="${id}cv" width="960" height="796" style="position:absolute;inset:0"></canvas>`;if(H.frame(sc,0))H.$(id+'shi').style.display='none'},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const B1=at(sc,'表单',0.9,H),B2=at(sc,'停在',2.2,H),B3=at(sc,'不点',3.4,H);
  const g=K.frame(id,t,H,BG,{seed:24,beats:[B1,B2,B3]});MO.set($(id+'ln'),{o:MO.tw(t,0.1,0.3)});
  MO.set($(id+'win'),{y:160*(1-MO.tw(t,0.05,0.55,'outBack')),r:MO.wob(t,3,0.4,0.3)});
  const c=$(id+'cv'),cg=c.getContext('2d');cg.fillStyle='#f4f5f8';cg.fillRect(0,0,c.width,c.height);const im=H.frame(sc,t);
  if(im){const W=im.width,Hh=im.height,z0=W*c.height/c.width/Hh*1.01;
   const z=MO.kf(t,[[0,z0],[B1,z0*1.05],[B1+0.5,z0*1.35,'outBack'],[B2,z0*1.4],[B2+0.5,z0*1.95,'outBack'],[D,z0*2.05]]);
   const vx=MO.kf(t,[[0,W/2],[B1+0.5,W*0.55,'inOutC'],[B2+0.5,W*0.62,'inOutC'],[D,W*0.63]]),vy=MO.kf(t,[[0,Hh/2],[B1+0.5,Hh*0.65,'inOutC'],[B2+0.5,Hh*0.9,'inOutC'],[D,Hh*0.92]]);
   const vw=W/z,vh=vw*c.height/c.width,sx=Math.min(Math.max(vx-vw/2,0),W-vw),sy=Math.min(Math.max(vy-vh/2,0),Hh-vh);cg.drawImage(im,sx,sy,vw,vh,0,0,c.width,c.height)}
  else{for(let k=0;k<7;k++){cg.fillStyle='rgba(0,0,0,.08)';cg.fillRect(60,60+k*100,MO.lerp(100,700,MO.prog(t,0.3+k*0.2,0.9+k*0.2)),40)}}
  // 手指：飘到提交按钮上方，左右摇"不点"
  const hu=MO.E.outC(MO.prog(t,B2-0.3,B2+0.4));MO.set($(id+'hand'),{x:MO.lerp(900,560,hu)+(t>B3?Math.sin(t*10)*40*(1-MO.prog(t,B3+0.8,B3+1.4)):0),y:MO.lerp(1300,1000,hu)+Math.sin(t*3)*8,o:t>B2-0.3?1:0,r:t>B3?Math.sin(t*10)*10:0});
  MO.set($(id+'gd'),{s:MO.ease('outBackBig')(MO.prog(t,B3-0.2,B3+0.15)),o:t>B3-0.2?1:0,y:MO.wob(t,6,5,0.6)});
  const sp=((t*0.7)%1)*(c.width+400)-200,gr=cg.createLinearGradient(sp-120,0,sp+120,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.5,'rgba(255,255,255,.3)');gr.addColorStop(1,'rgba(255,255,255,0)');cg.fillStyle=gr;cg.fillRect(0,0,c.width,c.height);
  MO.ring(g,t,B2+0.3,620,1050,{r1:320,width:10,color:'127,178,255'});MO.ring(g,t,B3,540,1270,{r1:420,width:10,color:'255,201,77'})},
 sfx:sc=>[[at(sc,'表单',0.9),'tick'],[at(sc,'停在',2.2),'pop'],[at(sc,'不点',3.4),'ding']]},

/* 3 中段悬念：三个本事一张张亮出，翻面洗牌："最安心的是哪个？" */
three:{bg:'#0a1026',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:136px">${H.fmt(sc.head)}</div>
  ${sc.items.map((it,i)=>`<div class="d-card" id="${id}c${i}"><div class="d-face fr" id="${id}f${i}">${[I.list,I.check,I.lock][i](80,i===2?GOLD:i===0?'#3c63d6':'#fff')}${H.fmt(it)}</div><div class="d-face bk" id="${id}k${i}" style="display:none">?</div></div>`).join('')}
  <div class="v-a v-ctr" id="${id}q" style="top:1060px"><span class="v-pill" style="background:linear-gradient(150deg,#23336e,#121a3a);border:3px solid rgba(255,201,77,.75);color:#fff;font-size:52px">${I.lock(46)} ${H.fmt(sc.q)}</span></div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const A=sc.items.map((w,i)=>at(sc,w,1.0+i*0.9,H)),Q=at(sc,'最让人',D-2.2,H);
  const g=K.frame(id,t,H,{...BG,hue:[255,170,60]},{seed:34,beats:[...A,Q]});K.title($(id+'hd')._chars,t,0.05,'drop');
  sc.items.forEach((_,i)=>{const a=A[i]-0.2;const u=MO.spring(t-a,1.4,6),uu=Math.min(1,Math.max(0,u));const flip=MO.E.inOutC(MO.prog(t,Q-0.2+i*0.08,Q+0.3+i*0.08));
   const sh=MO.prog(t,Q+0.4,D);const ang=sh*Math.PI*2*1.5+i*2.094;const bx=[70,390,710][i];
   const x=flip>=1?MO.lerp(bx,390+Math.cos(ang)*300,Math.min(1,sh*4)):bx,y=470+(flip>=1?Math.sin(ang)*60*Math.min(1,sh*4):0);
   MO.set($(id+'c'+i),{x,y:MO.lerp(1500,y,uu)+MO.wob(t,i+2,6,0.6),s:Math.max(0,Math.min(1.08,u)),o:t>a?1:0});$(id+'c'+i).style.zIndex=10+i;
   // 翻面：横向压扁到 0 再展开，过半时换成问号（不用 3D）
   const back=flip>0.5,sx=Math.abs(Math.cos(Math.PI*flip)).toFixed(3);$(id+'f'+i).style.display=back?'none':'flex';$(id+'k'+i).style.display=back?'flex':'none';
   $(id+(back?'k':'f')+i).style.transform=`scaleX(${sx})`});
  MO.set($(id+'q'),{s:MO.ease('outBackBig')(MO.prog(t,Q+0.2,Q+0.55)),o:t>Q+0.2?1:0,y:MO.wob(t,7,5,0.6)});
  A.forEach((a,i)=>MO.ring(g,t,a,[220,540,860][i],680,{r1:240,width:6,color:'127,178,255'}));MO.dust(g,t,{n:20,seed:71,color:'255,201,77',size:[3,7],alpha:[.3,.85],speed:-60,drift:50})},
 sfx:sc=>[...sc.items.map((w,i)=>[at(sc,w,1.0+i*0.9)-0.1,'tick']),[at(sc,'最让人',4.0),'pop']]},

/* 4 揭晓：核对清单一项项打勾；按下"你点头"，盖上"才提交" */
checklist:{bg:'#0a1026',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:120px">${H.fmt(sc.head)}</div>
  <div class="d-list" id="${id}ls">${sc.list.map((x,i)=>`<div class="d-li" id="${id}l${i}"><div class="bx" id="${id}b${i}"></div>${H.fmt(x)}</div>`).join('')}</div>
  <div class="d-nod" id="${id}nd">${I.hand(70)} ${H.fmt(sc.nod)}</div>
  <div class="d-go" id="${id}go">${H.fmt(sc.go)}</div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const L=at(sc,'它把',1.8,H),N=at(sc,'你点头',D-2.4,H),G=at(sc,'才提交',D-1.2,H);
  const span=Math.max(0.35,(N-L-0.3)/sc.list.length);
  const g=K.frame(id,t,H,{...BG,hue:[91,214,155]},{seed:44,beats:[at(sc,'提交前',0.9,H),...sc.list.map((_,i)=>L+i*span),N,G]});K.title($(id+'hd')._chars,t,N-0.15,'punch');
  MO.set($(id+'ls'),{y:300*(1-MO.tw(t,0.2,0.55,'outBack')),o:MO.tw(t,0.2,0.2),r:MO.wob(t,4,0.5,0.4)});
  sc.list.forEach((_,i)=>{const a0=0.4+i*0.12;MO.set($(id+'l'+i),{x:-80*(1-MO.tw(t,a0,0.35,'outBack')),o:MO.tw(t,a0,0.2)});
   const a=L+i*span,done=t>a;const b=$(id+'b'+i);b.innerHTML=done?I.check(44,'#fff'):'';b.style.background=done?MINT:'transparent';b.style.borderColor=done?MINT:'#c4cce6';
   MO.set(b,{s:done?1+0.3*Math.sin(Math.PI*MO.prog(t,a,a+0.25)):1});const lit=1-MO.prog(t,a,a+span);$(id+'l'+i).style.background=done&&lit>0?`rgba(91,214,155,${(0.55*lit).toFixed(2)})`:'transparent';if(done)MO.set($(id+'l'+i),{x:18*Math.sin(Math.PI*MO.prog(t,a,a+0.3))})});
  const press=Math.sin(Math.PI*MO.prog(t,N+0.3,N+0.55));MO.set($(id+'nd'),{s:MO.ease('outBackBig')(MO.prog(t,N-0.3,N+0.05))*(1-0.08*press),o:t>N-0.3?1:0});
  const gp=MO.prog(t,G-0.1,G+0.15);MO.set($(id+'go'),{s:MO.lerp(2.6,1,MO.E.inQ(gp)),r:-8,o:t>G-0.1?1:0,blur:(1-gp)*6});
  MO.ring(g,t,N+0.4,330,1185,{r1:340,width:10,color:'255,77,26'});MO.burst(g,t,G+0.15,820,1185,{n:34,seed:6,colors:[MINT,'#fff',GOLD],speed:[300,1000],life:1.1})},
 sfx:sc=>[[at(sc,'核对清单',2.6),'tick'],[at(sc,'你点头',4.6),'pop'],[at(sc,'才提交',5.8),'ding']]},

/* 5 结尾 */
cta:{bg:'#0a1026',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:1030});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:118px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:640px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:670px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#8fb8ff,#3c63d6)">${I.lock(110,'#fff')}</div>`+cb.html)},
 init:(sc,id,H)=>{sc._H=H;split(id,'tt')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:64});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=at(sc,'关注',2.2,H),S=at(sc,'私信',4.4,H)-0.3;const p=sc._cb.anim(t,{show:1.3,follow:F,type:at(sc,'评论',2.8,H)+0.2,send:S});
  MO.burst(g,t,OPEN,540,780,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,780,{r1:700,width:14,color:'127,178,255'});K.flash(g,t,OPEN,0.2,'225,235,255');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.2,'pop'],[3.8,'pop']]},
outro:K.outro(BG),
};
})();
