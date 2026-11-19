/* 2026-11-18-s4-d 商品上架 · 一款商品多个规格，价格库存一次填好。色调：清爽青绿 + 企鹅橙。
   主线：实录开场，一长串尺码它一行行填 → 手动一格格敲、几十个格子 → 眼睛一花填串行 → 怎么做到不串行？→
   揭晓：先认准尺码、对号入座，再填价格库存、读回核对 → 关注领取。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I,AVC}=K;
const RED='#FF5A4E',AQ='#4fe0c8';
const BG={seed:85,hue:[79,224,200],hue2:[255,120,60],hue3:[160,255,220],base:['#0b2b2b','#061b1c','#020c0c']};
const css=`
.g-grid{position:absolute;left:70px;top:430px;width:940px;border-radius:32px;background:rgba(6,30,30,.9);border:2px solid rgba(255,255,255,.12);padding:20px 26px}
.g-r{display:flex;align-items:center;gap:18px;height:72px;font-size:32px;font-weight:900;color:#d2f5ee;white-space:nowrap}
.g-r .sz{width:120px;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace}
.g-c{flex:1;height:52px;border-radius:14px;background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.12);position:relative;overflow:hidden}
.g-c i{position:absolute;left:12px;top:15px;height:22px;border-radius:11px;background:rgba(210,245,238,.6)}
.g-num{position:absolute;left:600px;top:170px;width:410px;text-align:right;font-size:170px;font-weight:900;color:#fff;font-family:"DejaVu Sans Mono",monospace;line-height:1}
.g-num small{font-size:70px;color:${AQ}}
.g-tb{position:absolute;left:70px;top:520px;width:940px;border-radius:34px;background:rgba(6,30,30,.9);border:2px solid rgba(255,255,255,.14);padding:26px 30px}
.g-tr{display:flex;align-items:center;height:128px;font-size:52px;font-weight:900;color:#fff;border-bottom:2px solid rgba(255,255,255,.08);font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace;white-space:nowrap}
.g-tr:last-child{border-bottom:0}
.g-tr span{flex:1}
.g-fly{position:absolute;left:0;top:0;padding:10px 26px;border-radius:20px;background:${AQ};color:#03221d;font-size:52px;font-weight:900;font-family:"DejaVu Sans Mono",monospace;box-shadow:0 14px 30px rgba(0,0,0,.4)}
.g-bar{position:absolute;left:70px;width:940px;height:190px;border-radius:36px;background:rgba(255,255,255,.06);border:3px solid rgba(255,255,255,.12);padding:26px 32px}
.g-bar .t{display:flex;align-items:center;gap:16px;font-size:46px;font-weight:900;color:#fff;white-space:nowrap}
.g-bar .t b{margin-left:auto;font-size:38px}
.g-bar .tr{margin-top:22px;height:44px;border-radius:22px;background:rgba(255,255,255,.08);position:relative;overflow:hidden}
.g-bar .tr i{position:absolute;left:0;top:0;bottom:0;border-radius:22px}
.g-col{position:absolute;top:440px;width:440px;border-radius:32px;padding:22px;background:rgba(255,255,255,.06);border:3px solid rgba(255,255,255,.14)}
.g-col .hd{font-size:38px;font-weight:900;color:#bff2e8;margin-bottom:12px;display:flex;gap:12px;align-items:center;white-space:nowrap}
.g-m{display:flex;align-items:center;gap:10px;height:118px;border-radius:22px;background:rgba(255,255,255,.07);margin-bottom:14px;padding:0 18px;font-size:38px;font-weight:900;color:#fff;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace;white-space:nowrap;position:relative}
.g-m .s{width:110px;padding:6px 10px;border-radius:14px;background:rgba(79,224,200,.18);color:${AQ};text-align:center}
.g-m .v{flex:1;text-align:right}
.g-m .ck{position:absolute;right:-26px;top:31px;width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
const at=(sc,w,d,H)=>{H=H||sc._H;return H?(H.at(sc,w)??d):d};

window.VISUALS={
/* 0 钩子（实录）：镜头沿规格表往下摇，"按尺码填"一行行弹出 */
real:{bg:'#061b1c',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}ln" style="left:70px;top:180px"><span class="v-pill" style="background:rgba(91,214,155,.18);color:${MINT};border:3px solid ${MINT};font-size:40px">${H.fmt(sc.line)}</span></div>
  ${K.win(id,H.fmt(sc.win),{x:60,y:300,w:960,h:900})}
  <div class="v-a v-shi" id="${id}shi" style="right:84px;top:380px">示意</div>
  ${[0,1,2,3].map(k=>`<div class="v-a v-tag ok" id="${id}t${k}" style="font-size:32px">${I.check(28,MINT)} ${H.fmt(sc.tag)}</div>`).join('')}`),
 init:(sc,id,H)=>{sc._H=H;H.$(id+'body').innerHTML=`<canvas id="${id}cv" width="960" height="836" style="position:absolute;inset:0"></canvas>`;if(H.frame(sc,0))H.$(id+'shi').style.display='none'},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const B1=at(sc,'一长串',0.9,H),B2=at(sc,'价格',2.4,H),B3=at(sc,'一行行',3.6,H);
  const g=K.frame(id,t,H,BG,{seed:5,beats:[B1,B2,B3]});MO.set($(id+'ln'),{s:MO.ease('outBack')(MO.prog(t,0.05,0.4)),o:MO.tw(t,0.05,0.2)});
  MO.set($(id+'win'),{y:160*(1-MO.tw(t,0.05,0.55,'outBack')),r:MO.wob(t,3,0.4,0.3)});
  const c=$(id+'cv'),cg=c.getContext('2d');cg.fillStyle='#f4f5f2';cg.fillRect(0,0,c.width,c.height);const im=H.frame(sc,t);
  if(im){const W=im.width,Hh=im.height,z0=W*c.height/c.width/Hh*1.01;
   const z=MO.kf(t,[[0,z0],[B1,z0*1.05],[B1+0.5,z0*1.5,'outBack'],[B2,z0*1.55],[B2+0.5,z0*1.8,'outBack'],[D,z0*1.9]]);
   const vx=MO.kf(t,[[0,W/2],[B1+0.5,W*0.58,'inOutC'],[B2+0.5,W*0.62,'inOutC'],[D,W*0.62]]),vy=MO.kf(t,[[0,Hh/2],[B1+0.5,Hh*0.42,'inOutC'],[B2+0.5,Hh*0.55,'inOutC'],[B3+0.5,Hh*0.7,'inOutC'],[D,Hh*0.8]]);
   const vw=W/z,vh=vw*c.height/c.width,sx=Math.min(Math.max(vx-vw/2,0),W-vw),sy=Math.min(Math.max(vy-vh/2,0),Hh-vh);cg.drawImage(im,sx,sy,vw,vh,0,0,c.width,c.height)}
  else{for(let k=0;k<8;k++){cg.fillStyle='rgba(0,0,0,.08)';cg.fillRect(60,50+k*95,MO.lerp(100,800,MO.prog(t,0.3+k*0.25,0.9+k*0.25)),40)}}
  const sp=((t*0.7)%1)*(c.width+400)-200,gr=cg.createLinearGradient(sp-120,0,sp+120,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.5,'rgba(255,255,255,.3)');gr.addColorStop(1,'rgba(255,255,255,0)');cg.fillStyle=gr;cg.fillRect(0,0,c.width,c.height);
  const T=[B1+0.4,B2+0.1,B2+0.9,B3+0.4];T.forEach((a,k)=>MO.set($(id+'t'+k),{x:[640,90,620,120][k],y:[470,680,890,1080][k]+MO.wob(t,k+5,5,0.7),s:MO.ease('outBackBig')(MO.prog(t,a,a+0.3)),o:t>a?1:0}));
  T.forEach((a,k)=>MO.ring(g,t,a,[770,220,750,250][k],[495,705,915,1105][k],{r1:170,width:6,color:'91,214,155'}))},
 sfx:sc=>[[at(sc,'一长串',0.9),'tick'],[at(sc,'价格',2.4),'tick'],[at(sc,'一行行',3.6),'ding']]},

/* 1 手动要敲几十格：光标一格格敲、越敲越快，计数跳到 40 */
cells:{bg:'#061b1c',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}tt" style="left:70px;top:200px"><span class="v-pill hot" style="font-size:46px">${H.fmt(sc.title)}</span></div>
  <div class="v-a" id="${id}nt" style="left:76px;top:310px"><span class="v-pill dim" style="font-size:30px">${H.fmt(sc.note)}</span></div>
  <div class="g-num" id="${id}n"><span id="${id}nv">0</span><small>${H.fmt(sc.unit)}</small></div>
  <div class="g-grid" id="${id}gd">${sc.sizes.map((s,i)=>`<div class="g-r"><span class="sz">${H.fmt(s)}</span><div class="g-c"><i id="${id}a${i}"></i></div><div class="g-c"><i id="${id}b${i}"></i></div></div>`).join('')}</div>`),
 init:(sc,id,H)=>{sc._H=H},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const P=at(sc,'价格',1.6,H),MANY=at(sc,'尺码一多',3.6,H),N=at(sc,'几十个',4.8,H);
  const g=K.frame(id,t,H,BG,{seed:15,beats:[P,MANY,N]});
  MO.set($(id+'tt'),{x:-400*(1-MO.tw(t,0.05,0.45,'outBack')),o:MO.tw(t,0.05,0.2)});MO.set($(id+'nt'),{o:MO.tw(t,N,0.3)});MO.set($(id+'gd'),{y:200*(1-MO.tw(t,0.1,0.5,'outBack')),o:MO.tw(t,0.1,0.2)});
  // 一格格敲：开头慢，"尺码一多"之后越来越快
  const total=sc.sizes.length*2,prog=MO.E.inQ(MO.prog(t,P-0.3,D-0.3))*total;
  for(let k=0;k<total;k++){const el=$(id+(k%2?'b':'a')+Math.floor(k/2));const w=Math.min(1,Math.max(0,prog-k));el.style.width=(w*[160,90][k%2]).toFixed(0)+'px'}
  const cnt=Math.round(MO.lerp(0,sc.to,Math.min(1,prog/total)));$(id+'nv').textContent=String(cnt);MO.set($(id+'n'),{s:1+0.05*Math.sin(t*12)*(t>MANY?1:0.3),r:t>N?Math.sin(t*20)*2:0});
  MO.ring(g,t,MANY,540,800,{r1:500,width:10,color:'79,224,200'});MO.ring(g,t,N,820,250,{r1:300,width:12,color:'255,90,78'})},
 sfx:sc=>[[at(sc,'价格',1.6),'tick'],[at(sc,'尺码一多',3.6),'tick'],[at(sc,'几十个',4.8),'pop']]},

/* 2 痛点：配图背景，39 码的库存飞进了 40 码那行，标红"串行" */
misrow:{bg:'#061b1c',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="display:none">`+K.layers(id,`
  <div class="v-a" style="left:0;top:0;width:1080px;height:1920px;background:linear-gradient(180deg,rgba(6,27,28,.5),rgba(6,27,28,.2) 40%,rgba(6,27,28,.9))"></div>
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:200px;font-size:140px">${H.fmt(sc.head)}</div>
  <div class="g-tb" id="${id}tb">${sc.rows.map((r,i)=>`<div class="g-tr" id="${id}r${i}"><span>${H.fmt(r[0])}</span><span>${H.fmt(r[1])}</span><span id="${id}s${i}">${i===sc.from?'':H.fmt(r[2])}</span></div>`).join('')}</div>
  <div class="g-fly" id="${id}fl">${H.fmt(sc.rows[sc.from][2])}</div>
  <div class="v-a" id="${id}wn" style="left:640px;top:1000px"><span class="v-pill" style="background:${RED};color:#fff;font-size:50px">${I.warn(44,'#fff')} ${H.fmt(sc.warn)}</span></div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const E=at(sc,'眼睛一花',0.9,H),F=at(sc,'库存',2.0,H),IN=at(sc,'填进了',3.0,H),R=at(sc,'那一行',4.2,H);
  const g=K.frame(id,t,H,{...BG,img:$(id+'img'),imgAlpha:0.75,grid:false,dust:12},{seed:25,push:0.05,beats:[0.5,E,F,IN,R]});
  sc.rows.forEach((_,i)=>MO.set($(id+'r'+i),{x:700*(1-MO.tw(t,0.1+i*0.3,0.45,'outBack')),o:MO.tw(t,0.1+i*0.3,0.2)}));
  const pick=t>E-0.2&&t<F;$(id+'r'+sc.from).style.background=pick?`rgba(255,201,77,${(0.25+0.2*Math.sin(t*12)).toFixed(2)})`:'';
  MO.set($(id+'tb'),{o:MO.tw(t,0.05,0.2),r:MO.wob(t,4,0.5,0.4),s:1+0.05*Math.sin(Math.PI*MO.prog(t,E,E+0.6)),blur:Math.max(0,Math.sin(Math.PI*MO.prog(t,E,E+0.6)))*5});
  // 数字从 39 码那行飞出，落进 40 码那行
  const y0=520+26+sc.from*128+30,y1=520+26+sc.into*128+30;const u=MO.E.inOutC(MO.prog(t,F,IN+0.3));
  MO.set($(id+'fl'),{x:700,y:MO.lerp(y0,y1,u)-Math.sin(Math.PI*u)*120,r:Math.sin(Math.PI*u)*12,s:t>IN+0.3?1+0.06*Math.sin(t*14):1,o:t>F-0.2?1:0});
  const wrong=t>IN+0.3;$(id+'fl').style.background=wrong?RED:AQ;$(id+'fl').style.color=wrong?'#fff':'#03221d';$(id+'r'+sc.into).style.background=wrong?'rgba(255,90,78,.22)':'transparent';
  if(wrong)MO.set($(id+'r'+sc.into),{x:Math.sin(t*34)*7*(1-MO.prog(t,IN+0.5,IN+1.2))});$(id+'s'+sc.into).style.opacity=wrong?'0.25':'1';
  K.title($(id+'hd')._chars,t,R-0.2,'punch');MO.set($(id+'wn'),{s:MO.ease('outBackBig')(MO.prog(t,IN+0.3,IN+0.6)),o:t>IN+0.3?1:0});
  K.flash(g,t,IN+0.3,0.12,'255,225,220');MO.ring(g,t,IN+0.3,800,y1,{r1:420,width:12,color:'255,90,78'})},
 sfx:sc=>[[at(sc,'库存',2.0),'tick'],[at(sc,'填进了',3.0)+0.3,'pop']]},

/* 3 中段悬念：两条对比条，"关键一步，最后说"上锁 */
why:{bg:'#061b1c',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:118px">${H.fmt(sc.head)}</div>
  ${sc.items.map((it,i)=>`<div class="g-bar" id="${id}b${i}" style="top:${470+i*240}px"><div class="t">${i?I.check(46,AQ):I.cross(46,RED)}${H.fmt(it[0])}<b style="color:${i?AQ:'#ffb3aa'}">${H.fmt(it[1])}</b></div><div class="tr"><i id="${id}f${i}" style="background:${i?`linear-gradient(90deg,${AQ},#c2fff3)`:`linear-gradient(90deg,${RED},#ff9a6b)`}"></i></div></div>`).join('')}
  <div class="v-a" id="${id}kp" style="left:70px;top:1000px"><span class="v-pill" style="background:linear-gradient(150deg,#123d38,#062220);border:3px solid rgba(255,201,77,.7);color:#fff;font-size:48px">${I.lock(46)} ${H.fmt(sc.key)}</span></div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const KY=at(sc,'关键',2.0,H);
  const g=K.frame(id,t,H,{...BG,hue:[255,180,60]},{seed:35,push:0.06,beats:[0.4,1.0,KY]});
  K.title($(id+'hd')._chars,t,0.05,'punch');if(t>1)MO.textWave($(id+'hd')._chars,t,{amp:6,from:1});
  sc.items.forEach((_,i)=>{const a=0.35+i*0.35;MO.set($(id+'b'+i),{x:-300*(1-MO.tw(t,a,0.45,'outBack')),o:MO.tw(t,a,0.2)});
   const f=$(id+'f'+i);if(i===0){f.style.width=(30+45*MO.prog(t,a,a+1.4)+8*Math.sin(t*7)).toFixed(1)+'%';f.style.opacity=(0.6+0.4*Math.abs(Math.sin(t*5))).toFixed(2)}else f.style.width=(100*MO.E.outC(MO.prog(t,a,a+1.2))).toFixed(1)+'%'});
  MO.set($(id+'kp'),{x:-700*(1-MO.tw(t,KY-0.1,0.5,'outBack')),o:MO.tw(t,KY-0.1,0.2),s:1+0.03*Math.sin(t*5)});
  MO.ring(g,t,KY,380,1050,{r1:380,width:10,color:'255,201,77'});MO.dust(g,t,{n:20,seed:52,color:'255,201,77',size:[3,7],alpha:[.3,.85],speed:-60,drift:50})},
 sfx:sc=>[[0.1,'pop'],[at(sc,'关键',2.0),'pop']]},

/* 4 揭晓：同一个尺码先连线对上，价格库存再飞进对的那一行，读回打勾 */
match:{bg:'#061b1c',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t" id="${id}hd" style="left:70px;top:180px;font-size:124px">${H.fmt(sc.head)}</div>
  <div class="g-col" id="${id}A" style="left:50px"><div class="hd">${I.table(38,AQ)}${H.fmt(sc.src)}</div>${sc.rows.map((r,i)=>`<div class="g-m" id="${id}a${i}"><span class="s">${H.fmt(r[0])}</span><span class="v">${H.fmt(r[1])} · ${H.fmt(r[2])}</span></div>`).join('')}</div>
  <div class="g-col" id="${id}B" style="left:590px"><div class="hd">${I.list(38,AQ)}${H.fmt(sc.page)}</div>${sc.rows.map((r,i)=>`<div class="g-m" id="${id}b${i}"><span class="s">${H.fmt(r[0])}</span><span class="v" id="${id}v${i}"></span><span class="ck" id="${id}k${i}"></span></div>`).join('')}</div>
  <canvas class="v-a" id="${id}ln" width="1080" height="900" style="left:0;top:440px"></canvas>
  <div class="v-a v-ctr" id="${id}ok" style="top:1250px"><span class="v-pill" style="background:rgba(91,214,155,.2);color:${MINT};border:3px solid ${MINT};font-size:48px">${I.check(44,MINT)} ${H.fmt(sc.ok)}</span></div>`),
 init:(sc,id,H)=>{sc._H=H;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,D=H.dur;const SZ=at(sc,'哪个尺码',1.8,H),FL=at(sc,'再填',3.4,H),RB=at(sc,'读回来',D-1.6,H);
  const n=sc.rows.length,span=Math.max(0.3,(RB-FL)/n);
  const g=K.frame(id,t,H,{...BG,hue:[91,214,155]},{seed:45,beats:[0.4,1.2,SZ,...sc.rows.map((_,i)=>FL+i*span),RB]});
  K.title($(id+'hd')._chars,t,0.05,'punch');
  MO.set($(id+'A'),{x:-400*(1-MO.tw(t,0.15,0.5,'outBack')),o:MO.tw(t,0.15,0.2)});MO.set($(id+'B'),{x:400*(1-MO.tw(t,0.3,0.5,'outBack')),o:MO.tw(t,0.3,0.2)});
  // 认准尺码：同一个尺码两边连线（一条条画出来）
  const lg=MO.canvas($(id+'ln'));
  sc.rows.forEach((r,i)=>{const a=SZ-0.6+i*0.25;const u=MO.prog(t,a,a+0.4);const y=72+i*132+59;
   if(u>0){lg.strokeStyle=`rgba(79,224,200,${(0.9-0.5*MO.prog(t,FL+i*span,FL+i*span+0.4)).toFixed(2)})`;lg.lineWidth=6;lg.setLineDash([14,10]);lg.lineDashOffset=-t*50;lg.beginPath();lg.moveTo(200,y);lg.lineTo(MO.lerp(200,680,u),y);lg.stroke()}
   MO.set($(id+'a'+i),{x:-300*(1-MO.tw(t,0.35+i*0.2,0.4,'outBack')),o:MO.tw(t,0.35+i*0.2,0.2)});MO.set($(id+'b'+i),{x:300*(1-MO.tw(t,0.45+i*0.2,0.4,'outBack')),o:MO.tw(t,0.45+i*0.2,0.2)});
   const lit=u>0&&t<FL+i*span+0.3;$(id+'a'+i).style.background=lit?'rgba(79,224,200,.28)':'rgba(255,255,255,.07)';$(id+'b'+i).style.background=u>=1&&t<FL+i*span+0.3?'rgba(79,224,200,.28)':'rgba(255,255,255,.07)';
   $(id+'a'+i).querySelector('.s').style.background=u>0&&u<1?AQ:'rgba(79,224,200,.18)';$(id+'b'+i).querySelector('.s').style.background=u>=1&&t<FL+i*span+0.3?AQ:'rgba(79,224,200,.18)';
   // 价格库存飞过去，填进同一行
   const f=FL+i*span,fu=MO.prog(t,f,f+span*0.7);$(id+'v'+i).textContent=fu>=1?`${H.plain(r[1])} · ${H.plain(r[2])}`:'';
   if(fu>0&&fu<1){lg.setLineDash([]);lg.fillStyle=AQ;const x=MO.lerp(330,820,MO.E.inOutC(fu));lg.beginPath();lg.roundRect(x-80,y-30-Math.sin(Math.PI*fu)*50,160,60,16);lg.fill()}
   const ok=t>RB-0.2+i*0.12;const k=$(id+'k'+i);k.innerHTML=ok?I.check(32,'#03221d'):'';k.style.background=ok?AQ:'transparent';if(ok)MO.set(k,{s:1+0.3*Math.sin(Math.PI*MO.prog(t,RB-0.2+i*0.12,RB+0.05+i*0.12))})});
  MO.set($(id+'ok'),{s:MO.ease('outBackBig')(MO.prog(t,RB,RB+0.35)),o:t>RB?1:0});
  MO.ring(g,t,SZ,540,700,{r1:520,width:10,color:'79,224,200'});MO.burst(g,t,RB+0.4,540,1300,{n:30,seed:8,colors:[MINT,'#fff',GOLD],speed:[300,900],life:1.1})},
 sfx:sc=>[[at(sc,'哪个尺码',1.8),'pop'],[at(sc,'再填',3.4),'tick'],[at(sc,'读回来',5.4),'ding']]},

/* 5 结尾 */
cta:{bg:'#061b1c',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:1030});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:118px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:640px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:670px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#6ff0d8,#14957f)">${I.bag(110,'#fff')}</div>`+cb.html)},
 init:(sc,id,H)=>{sc._H=H;split(id,'tt')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,CM=at(sc,'评论区',3.0,H),KW=at(sc,'规格',3.6,H),g=K.frame(id,t,H,BG,{seed:65,beats:[at(sc,'关注',2.2,H),CM,KW]});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6)-90*Math.sin(Math.PI*MO.prog(t,KW,KW+0.45)),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=at(sc,'关注',2.2,H),S=at(sc,'私信',4.4,H)-0.3;const p=sc._cb.anim(t,{show:1.3,follow:F,type:at(sc,'评论',2.8,H)+0.2,send:S});
  MO.burst(g,t,OPEN,540,780,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,780,{r1:700,width:14,color:'79,224,200'});K.flash(g,t,OPEN,0.2,'215,255,245');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.ring(g,t,KW,540,760,{r1:480,width:10,color:'255,201,77'});MO.burst(g,t,KW+0.2,540,700,{n:30,seed:12,colors:[AQ,'#fff',GOLD],speed:[300,900],life:1});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.2,'pop'],[3.8,'pop']]},
outro:K.outro(BG),
};
})();
