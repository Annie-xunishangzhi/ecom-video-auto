/* 2026-11-17-s5-a 营销推广 · 专属画面。色调：暮紫 + 企鹅橙。
   主线：日历上的截止日一个个逼近 → 靠记、靠猜、说不清 → 杂活被吸进一张清单 → 路上有个坑 → 活动清单和关键词测算 → 各平台口径对齐。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I}=K;
const BG={seed:5,hue:[170,90,255],hue2:[255,77,26],hue3:[255,140,200],base:['#1d1436','#130d24','#08060f']};
const css=`
.c-cal{position:absolute;left:70px;top:390px;width:940px;height:700px;border-radius:40px;padding:26px}
.c-d{position:absolute;width:118px;height:104px;border-radius:16px;background:rgba(255,255,255,.06);font-size:26px;font-weight:800;color:#b9b0d6;padding:8px 12px}
.c-ev{position:absolute;padding:14px 22px;border-radius:18px;font-size:34px;font-weight:900;color:#fff;white-space:nowrap;box-shadow:0 16px 30px rgba(0,0,0,.45)}
.c-ev small{display:block;font-size:24px;font-weight:700;opacity:.85}
.c-beat{position:absolute;left:70px;width:940px;height:330px;border-radius:44px;display:flex;align-items:center;gap:40px;padding:0 50px;overflow:hidden}
.c-beat .t{font-size:84px;font-weight:900;color:#fff;white-space:nowrap}.c-beat .t b{color:${ACC}}
.c-die{width:150px;height:150px;border-radius:30px;background:#fff;position:relative;flex:none;box-shadow:0 20px 40px rgba(0,0,0,.4)}
.c-die i{position:absolute;width:28px;height:28px;border-radius:50%;background:#1d1436}
.c-task{position:absolute;padding:18px 30px;border-radius:22px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.2);color:#fff;font-size:40px;font-weight:800;white-space:nowrap}
.c-check{position:absolute;left:150px;width:780px;height:640px;border-radius:44px;padding:40px}
.c-cr{display:flex;align-items:center;gap:22px;height:82px;font-size:42px;font-weight:800;color:#fff;white-space:nowrap}
.c-cb{flex:none;width:56px;height:56px;border-radius:14px;border:4px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center}
.c-sign{position:absolute;width:300px;height:300px;transform-origin:50% 0}
.c-col{position:absolute;top:640px;width:280px;height:560px;border-radius:34px;padding:26px;display:flex;flex-direction:column;gap:18px}
.c-col .p{font-size:32px;font-weight:800;color:#b9b0d6}.c-col .f{font-size:52px;font-weight:900;color:#fff;white-space:nowrap}
.c-col i{display:block;height:22px;border-radius:11px;background:rgba(255,255,255,.18)}
.c-rule{position:absolute;padding:12px 24px;border-radius:999px;background:rgba(255,201,77,.18);color:${GOLD};font-size:32px;font-weight:800;border:2px solid rgba(255,201,77,.5);white-space:nowrap}
.c-kw{display:flex;align-items:center;gap:18px;height:70px;font-size:32px;color:#fff;font-weight:800;white-space:nowrap}
.c-kw .tr{flex:1;height:26px;border-radius:13px;background:rgba(255,255,255,.1);overflow:hidden}.c-kw .fl{height:100%;border-radius:13px;background:linear-gradient(90deg,#9a6bff,${ACC});transform-origin:left}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));

window.VISUALS={
/* 0 钩子：月历上的截止日一个个逼近，最后"明天截止"响铃 */
deadline:{bg:'#130d24',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="position:absolute;left:-60px;top:-60px;width:1200px;height:2040px;object-fit:cover;opacity:.5">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(19,13,36,.8),rgba(19,13,36,.5) 40%,rgba(19,13,36,.95))"></div>`+K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:120px">${H.fmt(sc.head)}</div>
  <div class="c-cal v-glass" id="${id}cal">${Array.from({length:35},(_,k)=>`<div class="c-d" id="${id}d${k}" style="left:${26+(k%7)*128}px;top:${26+Math.floor(k/7)*128}px">${k+1<=30?k+1:''}</div>`).join('')}
   ${sc.events.map((e,i)=>`<div class="c-ev" id="${id}e${i}" style="background:${['#6b4bd6','#b0458f',ACC][i]}">${H.fmt(e[0])}<small>${H.fmt(e[1])}</small></div>`).join('')}</div>
  <div class="v-a" id="${id}clk" style="left:90px;top:1130px;width:220px;height:220px">${I.clock(220,'#fff')}</div>
  <div class="v-a v-stamp" id="${id}stp" style="left:300px;top:1170px;font-size:80px;background:rgba(19,13,36,.85)">${H.fmt(sc.alarm)}</div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,dust:20,grid:false},{seed:3});
  MO.set($(id+'img'),{s:1.05+0.1*MO.prog(t,0,H.dur),x:MO.wob(t,1,16,0.3)});
  K.title($(id+'hd')._chars,t,0.1,'rise');MO.set($(id+'cal'),{y:200*(1-MO.tw(t,0.1,0.6,'outBack')),rx:12*(1-MO.tw(t,0,0.8))});
  // 日子一格格划过去（今天在往后走）
  const today=Math.floor(MO.lerp(8,26,MO.E.inQ(MO.prog(t,0.5,H.dur*0.75))));
  for(let k=0;k<35;k++){const el=$(id+'d'+k);el.style.background=k<today?'rgba(255,255,255,.02)':k===today?'rgba(255,77,26,.45)':'rgba(255,255,255,.06)';el.style.color=k<today?'#5b537a':'#b9b0d6'}
  const pos=[[19,0.6],[23,1.0],[today+1,1.4]];
  sc.events.forEach((e,i)=>{const k=pos[i][0];const a=pos[i][1];const p=MO.spring(t-a,1.5,6);const x=26+(k%7)*128-10,y=26+Math.floor(k/7)*128+30;
   const urgent=i===2&&t>2.6;MO.set($(id+'e'+i),{x:x-(i===2?60:20),y:y-(1-Math.min(1,p))*80,s:Math.max(0,p)*(urgent?1.15+0.06*Math.sin(t*20):1),r:urgent?Math.sin(t*30)*4:MO.wob(t,i,2,0.6),o:Math.min(1,Math.max(0,p))})});
  const R=H.at(sc,'截止前一天')??2.6;
  MO.set($(id+'clk'),{s:MO.ease('outBack')(MO.prog(t,R-0.4,R)),r:t>R?Math.sin(t*40)*10:0,y:t>R?Math.abs(Math.sin(t*20))*-8:0});
  const sp=MO.prog(t,R,R+0.3);MO.set($(id+'stp'),{s:MO.lerp(2.4,1,MO.E.outBackBig(sp)),r:-8+MO.wob(t,4,1.5,0.8),o:sp>0?1:0});
  MO.ring(g,t,R,200,1240,{r1:300,width:10});MO.ring(g,t,R+0.15,200,1240,{r1:420,width:6})},
 sfx:()=>[[0.6,'tick'],[1.0,'tick'],[1.4,'tick'],[2.6,'ding']]},

/* 1 靠记、靠猜、说不清：三拍 */
guess:{bg:'#130d24',
 build:(sc,id,H)=>K.layers(id,`
  <div class="c-beat v-glass" id="${id}b0" style="top:200px"><div style="position:relative;width:180px;height:180px;flex:none">${[0,1,2].map(k=>`<div class="v-a" id="${id}n${k}" style="left:${k*20}px;top:${k*16}px;width:130px;height:130px;border-radius:10px;background:${['#FFE58A','#FFC2D6','#B9F0D0'][k]};box-shadow:0 10px 20px rgba(0,0,0,.4)"></div>`).join('')}</div><div class="t">${H.fmt(sc.beats[0][0])}<b>${H.fmt(sc.beats[0][1])}</b></div></div>
  <div class="c-beat v-glass" id="${id}b1" style="top:570px"><div class="c-die" id="${id}die"></div><div class="t">${H.fmt(sc.beats[1][0])}<b>${H.fmt(sc.beats[1][1])}</b></div></div>
  <div class="c-beat v-glass" id="${id}b2" style="top:940px"><canvas id="${id}cv" width="200" height="220" style="flex:none"></canvas><div class="t">${H.fmt(sc.beats[2][0])}<b>${H.fmt(sc.beats[2][1])}</b></div><div class="v-q" id="${id}q" style="font-size:180px;margin-left:auto">?</div></div>`),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:13});
  const at=[H.at(sc,'报名')??0.2,H.at(sc,'选词')??1.2,H.at(sc,'钱花')??2.2];
  at.forEach((a,i)=>{const p=MO.spring(t-a+0.1,1.4,6);MO.set($(id+'b'+i),{x:(i%2?1:-1)*800*(1-Math.min(1,p)),r:(i%2?1:-1)*3*(1-Math.min(1,p)),y:MO.wob(t,i+2,6,0.5)})});
  // 便利贴：贴上又掉
  [0,1,2].forEach(k=>{const u=(t*0.8+k*0.33)%1;MO.set($(id+'n'+k),{y:u>0.7?(u-0.7)*400:0,r:-6+k*6+(u>0.7?(u-0.7)*60:0),o:u>0.9?1-(u-0.9)*10:1})});
  // 骰子：一直在翻，点数跳
  const die=$(id+'die');const f=1+Math.floor(t*6)%6;const P={1:[[61,61]],2:[[30,30],[92,92]],3:[[30,30],[61,61],[92,92]],4:[[30,30],[92,30],[30,92],[92,92]],5:[[30,30],[92,30],[61,61],[30,92],[92,92]],6:[[30,26],[92,26],[30,61],[92,61],[30,96],[92,96]]}[f];
  die.innerHTML=P.map(([x,y])=>`<i style="left:${x-14}px;top:${y-14}px"></i>`).join('');MO.set(die,{r:t*220%360,s:1+0.06*Math.sin(t*12),y:-Math.abs(Math.sin(t*6))*30});
  // 钱币飞进雾里
  const c=$(id+'cv'),cg=MO.canvas(c);for(let k=0;k<8;k++){const u=((t*0.9+k/8)%1);const x=20+u*170,y=180-Math.sin(u*Math.PI)*150;cg.globalAlpha=1-u;cg.fillStyle=GOLD;cg.beginPath();cg.ellipse(x,y,18*(1-u*0.5),18,0,0,7);cg.fill();cg.globalAlpha=1}
  const fog=cg.createRadialGradient(180,60,10,180,60,90);fog.addColorStop(0,'rgba(200,190,230,.6)');fog.addColorStop(1,'rgba(200,190,230,0)');cg.fillStyle=fog;cg.fillRect(80,0,120,160);
  MO.set($(id+'q'),{s:1+0.1*Math.sin(t*6),r:Math.sin(t*3)*10,o:MO.tw(t,at[2]+0.3,0.3)})},
 sfx:()=>[[0.2,'pop'],[1.2,'pop'],[2.2,'pop']]},

/* 2 一圈杂活绕着转，被吸进一张整齐的清单 */
sort:{bg:'#130d24',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}a" style="top:170px;font-size:110px">${H.fmt(sc.head)}</div>
  <div class="v-a v-t v-ctr" id="${id}b" style="top:300px;font-size:110px">${H.fmt(sc.head2)}</div>
  <div class="c-check v-solid" id="${id}ck" style="top:560px"><div style="display:flex;align-items:center;gap:20px;margin-bottom:16px"><div class="v-ic" style="width:80px;height:80px;border-radius:24px">${I.list(56)}</div><span class="v-t" style="font-size:52px;letter-spacing:0">推广待办</span><span class="v-pill dim" style="margin-left:auto;font-size:26px;padding:8px 18px">${H.fmt(sc.note)}</span></div>
   ${sc.tasks.map((x,i)=>`<div class="c-cr" id="${id}r${i}"><div class="c-cb" id="${id}cb${i}"></div>${H.fmt(x)}</div>`).join('')}</div>
  ${sc.tasks.map((x,i)=>`<div class="c-task" id="${id}t${i}">${H.fmt(x)}</div>`).join('')}`),
 init:(sc,id)=>split(id,'a','b'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:23});const SUCK=H.at(sc,'交给')??1.4;
  K.title($(id+'a')._chars,t,0.1,'rise');K.title($(id+'b')._chars,t,SUCK,'punch');
  const n=sc.tasks.length;const cin=MO.tw(t,SUCK+0.3,0.5,'outBack');MO.set($(id+'ck'),{s:0.7+0.3*cin,o:MO.tw(t,SUCK+0.2,0.2),y:MO.wob(t,4,6,0.5)});
  sc.tasks.forEach((_,i)=>{const ang=i/n*Math.PI*2+t*1.4;const rx=360,ry=380;const ox=540+Math.cos(ang)*rx-110,oy=900+Math.sin(ang)*ry-40;
   const q=MO.tw(t,SUCK+0.2+i*0.07,0.45,'inOutC');const tx=150+40+80,ty=560+40+96+i*82;
   MO.set($(id+'t'+i),{x:MO.lerp(ox,tx,q),y:MO.lerp(oy,ty,q),r:(1-q)*Math.sin(ang)*14,s:MO.tw(t,0.1+i*0.08,0.3,'outBack')*(1-0.2*q),o:(1-MO.prog(q,0.85,1))});
   const a=SUCK+0.6+i*0.12;MO.set($(id+'r'+i),{x:-60*(1-MO.tw(t,a,0.3,'outBack')),o:MO.tw(t,a,0.2)});
   const cb=$(id+'cb'+i);const ok=t>a+0.25+i*0.05;cb.innerHTML=ok?I.check(40,'#fff'):'';cb.style.background=ok?MINT:'transparent';cb.style.borderColor=ok?MINT:'rgba(255,255,255,.5)';MO.set(cb,{s:ok?MO.ease('outBackBig')(MO.prog(t,a+0.25+i*0.05,a+0.5+i*0.05)):1})});
  MO.ring(g,t,SUCK+0.3,540,880,{r1:650,width:14,color:'170,120,255'});K.flash(g,t,SUCK+0.3,0.2)},
 sfx:()=>[[1.4,'pop'],[2.2,'ding']]},

/* 3 中段悬念：路上有个坑，小标记走过去掉了下去 */
pit:{bg:'#130d24',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}a" style="top:175px;font-size:120px">${H.fmt(sc.head)}</div>
  <div class="v-a v-t v-ctr v-acc" id="${id}b" style="top:310px;font-size:150px">${H.fmt(sc.head2)}</div>
  <canvas class="v-a" id="${id}road" width="1080" height="820" style="left:0;top:520px"></canvas>
  <div class="c-sign" id="${id}sg" style="left:640px;top:520px"><div style="position:absolute;left:146px;top:0;width:8px;height:120px;background:#aaa"></div><div style="position:absolute;left:30px;top:110px;width:240px;height:210px">${I.warn(240)}</div><div class="v-pill" style="position:absolute;left:60px;top:300px;background:${GOLD};color:#111;font-size:40px">${H.fmt(sc.sign)}</div></div>`),
 init:(sc,id)=>split(id,'a','b'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,hue:[255,170,40]},{seed:33,push:0.07,beats:[H.at(sc,'坑')??1.0,H.at(sc,'最容易')??1.6,H.at(sc,'很多人')??2.4,H.at(sc,'栽')??3.0,(H.at(sc,'栽')??3.0)+1.0]});
  K.title($(id+'a')._chars,t,0.1,'rise');K.title($(id+'b')._chars,t,0.6,'punch');if(t>1.4)MO.textWave($(id+'b')._chars,t,{amp:7,from:1.4});
  // 透视道路 + 发光的坑
  const c=$(id+'road'),r=MO.canvas(c);const vp=[540,40];r.fillStyle='rgba(255,255,255,.05)';r.beginPath();r.moveTo(vp[0]-40,vp[1]);r.lineTo(vp[0]+40,vp[1]);r.lineTo(1000,820);r.lineTo(80,820);r.fill();
  for(let k=0;k<10;k++){const u=((k/10+t*0.35)%1);const y=vp[1]+Math.pow(u,2)*780;const w=8+u*20;r.fillStyle=`rgba(255,201,77,${(0.25+0.6*u).toFixed(2)})`;r.fillRect(540-w/2,y,w,10+u*40)}
  const hx=470,hy=560;const open=MO.tw(t,0.3,0.6,'outBack');MO.glow(r,hx,hy,260*open,'rgba(255,77,26,0.55)');
  r.save();r.translate(hx,hy);r.scale(1,0.38);r.fillStyle='#05030a';r.beginPath();r.arc(0,0,170*open,0,7);r.fill();r.strokeStyle=ACC;r.lineWidth=10;r.stroke();r.restore();
  // 小标记一路走向坑，在"栽在这里"掉下去
  const F=H.at(sc,'栽')??2.6;const u=MO.prog(t,0.6,F);const mx=MO.lerp(540,hx,u),my=MO.lerp(100,hy-40,MO.E.inQ(u));const fall=Math.max(0,t-F);
  if(fall<0.6){r.save();r.globalAlpha=1-fall/0.6;r.fillStyle='#fff';r.beginPath();r.arc(mx,my+fall*fall*900+Math.abs(Math.sin(t*10))*-10*(fall?0:1),26*(1-fall),0,7);r.fill();r.restore()}
  MO.burst(r,t,F+0.1,hx,hy,{n:30,seed:9,colors:[ACC,GOLD,'#fff'],speed:[200,700],life:1.0,gravity:600});
  MO.set($(id+'sg'),{r:Math.sin(t*2.5)*8,s:MO.ease('outBack')(MO.prog(t,0.4,0.9))});
  MO.dust(g,t,{n:20,seed:71,color:'255,201,77',size:[3,6],alpha:[.3,.8],speed:-60,drift:50})},
 sfx:()=>[[0.6,'pop'],[2.7,'pop']]},

/* 4 实录槽位（示意）：活动按截止时间自动排好，关键词逐个测算 */
board:{bg:'#130d24',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" style="left:70px;top:175px"><span class="v-pill dim" id="${id}ln" style="font-size:38px">${H.fmt(sc.line)}</span></div>
  ${K.win(id,H.fmt(sc.win),{x:60,y:290,w:960,h:1080})}
  <div class="v-a v-shi" style="right:84px;top:370px">示意</div>`),
 init:(sc,id,H)=>{H.$(id+'body').innerHTML=`<canvas id="${id}cv" width="960" height="1016" style="position:absolute;inset:0;display:none"></canvas><div id="${id}sim" style="padding:36px">
   <div style="font-size:40px;font-weight:900;color:#fff;margin-bottom:18px">活动清单</div>
   <div style="position:relative;height:330px">${sc.events.map((e,i)=>`<div class="v-row" id="${id}e${i}" style="position:absolute;left:0;right:0;top:0;height:92px"><div class="v-av" style="background:${['#6b4bd6','#b0458f',ACC][i]};width:60px;height:60px">${i+1}</div>${H.fmt(e[0])}<span class="v-tag ${i===2?'bad':'warn'}">${H.fmt(e[1])}截止</span></div>`).join('')}</div>
   <div style="font-size:40px;font-weight:900;color:#fff;margin:26px 0 14px">${H.fmt(sc.kw_title)}</div>
   ${sc.kws.map((k,i)=>`<div class="c-kw" style="height:96px;font-size:38px"><span style="width:280px">${H.fmt(k)}</span><div class="tr" style="height:40px;border-radius:20px"><div class="fl" id="${id}k${i}" style="box-shadow:0 0 30px rgba(255,77,26,.7)"></div></div><span id="${id}s${i}" style="width:150px;color:#b9b0d6;font-size:32px"></span></div>`).join('')}
   <div id="${id}toast" style="position:absolute;left:36px;right:36px;bottom:36px;height:110px;border-radius:30px;background:${MINT};color:#06231a;display:flex;align-items:center;justify-content:center;gap:16px;font-size:44px;font-weight:900">${I.check(44,'#06231a')} 清单已更新</div></div>`;
  if(H.frame(sc,0)){H.$(id+'cv').style.display='block';H.$(id+'sim').style.display='none'}},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:43,beats:[0.9,1.6,H.at(sc,'关键词')??2.0,(H.at(sc,'关键词')??2.0)+0.9,H.at(sc,'这两件')??3.2]});
  MO.set($(id+'win'),{y:200*(1-MO.tw(t,0,0.6,'outBack')),r:MO.wob(t,2,0.4,0.3)});MO.set($(id+'ln'),{o:MO.tw(t,0.2,0.3)});
  const im=H.frame(sc,t);if(im){const c=$(id+'cv');H.drawFrame(c.getContext('2d'),im,0,0,c.width,c.height);return}
  // 先乱序，再按截止时间排好（明天的排第一）
  const SORT=0.9;const ord0=[1,2,0],ord1=[2,1,0];
  sc.events.forEach((_,i)=>{const s=MO.tw(t,SORT+i*0.1,0.5,'inOutC');const y=MO.lerp(ord0[i],ord1[i],s)*106;const el=$(id+'e'+i);MO.set(el,{y,x:-40*(1-MO.tw(t,0.3+i*0.1,0.3,'outBack')),o:MO.tw(t,0.3+i*0.1,0.2),s:1+0.06*Math.sin(Math.PI*MO.prog(t,SORT+i*0.1,SORT+0.5+i*0.1))});
   const hl=MO.prog(t,SORT+0.5+i*0.15,SORT+0.9+i*0.15);el.style.background=hl>0&&hl<1?`rgba(255,201,77,${(0.55*Math.sin(hl*Math.PI)).toFixed(3)})`:'';MO.sheen(el,hl,{w:25,color:'rgba(255,255,255,.35)'})});
  const KW=H.at(sc,'关键词')??2.0;const vals=[0.82,0.64,0.47];
  sc.kws.forEach((_,i)=>{const a=KW+i*0.3;const run=t>a&&t<a+0.9;const v=run?0.2+0.6*Math.abs(Math.sin(t*9+i)):MO.tw(t,a+0.9,0.3)*vals[i];$(id+'k'+i).style.transform=`scaleX(${(t<a?0:v).toFixed(3)})`;
   $(id+'s'+i).textContent=t<a?'':run?'测算中…':['优先投','可以试','先观察'][i]});
  const TO=KW+1.6;MO.set($(id+'toast'),{y:160*(1-MO.tw(t,TO,0.4,'outBack')),o:MO.tw(t,TO,0.15),s:1+0.04*Math.sin(MO.prog(t,TO+0.3,TO+0.6)*Math.PI)});
  MO.ring(g,t,SORT+0.5,540,520,{r1:400,width:8,color:'170,120,255'})},
 sfx:()=>[[0.9,'tick'],[2.0,'tick'],[2.3,'tick'],[2.6,'tick']]},

/* 5 揭晓：三个平台的同一个指标名字不同、口径不同 → 对齐成一列 */
align:{bg:'#130d24',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:175px;font-size:140px">${H.fmt(sc.head)}</div>
  <div class="v-a v-ctr" id="${id}sub" style="top:345px"><span class="v-pill dim" style="font-size:36px">${H.fmt(sc.sub)}</span></div>
  ${sc.rules.map((r,i)=>`<div class="c-rule" id="${id}r${i}">${H.fmt(r)}？</div>`).join('')}
  ${sc.platforms.map((p,i)=>`<div class="c-col v-glass" id="${id}c${i}" style="left:${70+i*320}px"><div class="p">${H.fmt(p[0])}</div><div class="f" id="${id}f${i}">${H.fmt(p[1])}</div>${Array.from({length:6},(_,k)=>`<i style="width:${50+((k*37+i*23)%45)}%"></i>`).join('')}</div>`).join('')}
  <div class="v-a" id="${id}bar" style="left:70px;width:940px;top:640px;height:96px;border-radius:30px;background:${MINT};display:flex;align-items:center;justify-content:center;gap:16px;font-size:52px;font-weight:900;color:#06231a;transform-origin:50% 50%">${I.check(50,'#06231a')}${H.fmt(sc.unified)}</div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const AL=H.at(sc,'先对齐')??4.2,MIS=H.at(sc,'口径')??1.5;const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:53,beats:[H.at(sc,'各平台')??0.9,MIS,H.at(sc,'不统一')??2.2,H.at(sc,'自动化之前')??3.2,AL]});
  K.title($(id+'hd')._chars,t,AL-0.3,'punch');MO.set($(id+'sub'),{o:MO.tw(t,AL+0.2,0.3)});
  const al=MO.tw(t,AL,0.6,'outBack');
  sc.platforms.forEach((_,i)=>{const mis=[[-40,-6],[90,5],[30,-3]][i];const p=MO.spring(t-0.2-i*0.15,1.3,6);
   MO.set($(id+'c'+i),{y:MO.lerp(mis[0],0,al)+300*(1-Math.min(1,p))+MO.wob(t,i,10,0.6)*(1-al),r:MO.lerp(mis[1],0,al)+MO.wob(t,i+5,2,0.6)*(1-al),o:Math.min(1,Math.max(0,p))});
   $(id+'f'+i).textContent=al>0.5?sc.unified.replace(/^统一：/,''):sc.platforms[i][1];$(id+'c'+i).style.borderColor=al>0.5?'rgba(91,214,155,.7)':'rgba(255,255,255,.16)';
   if(t>MIS&&t<AL)MO.set($(id+'f'+i),{x:Math.sin(t*14+i)*4});
   // 每说一条口径问题，对应那一栏猛地一跳、红框闪一下
   const j=MIS+0.3+i*0.35;const jp=Math.sin(Math.PI*MO.prog(t,j,j+0.35));if(jp>0&&t<AL){const el=$(id+'c'+i);el.style.borderColor=`rgba(255,77,26,${(0.4+0.6*jp).toFixed(2)})`;el.style.boxShadow=`0 0 ${(60*jp).toFixed(0)}px rgba(255,77,26,.7),0 40px 80px rgba(0,0,0,.45)`;MO.set(el,{y:mis[0]-90*jp+MO.wob(t,i,10,0.6),r:mis[1]*(1+jp),o:1})}else if(t<AL)$(id+'c'+i).style.boxShadow=''});
  sc.rules.forEach((_,i)=>{const a=MIS+0.3+i*0.35;const p=MO.prog(t,a,a+0.3);MO.set($(id+'r'+i),{x:[90,560,300][i],y:[480,500,1240][i]+MO.wob(t,i+9,8,0.6),s:MO.ease('outBackBig')(p)*(1-MO.tw(t,AL,0.3,'inBack')),o:p>0?1:0,r:MO.wob(t,i+11,4,0.5)})});
  MO.set($(id+'bar'),{sx:MO.tw(t,AL+0.3,0.5,'outBack'),o:MO.tw(t,AL+0.3,0.2),y:-150*(1-MO.tw(t,AL+0.3,0.5))*0});
  MO.ring(g,t,AL+0.3,540,690,{r1:700,width:14,color:'91,214,155'});MO.burst(g,t,AL+0.5,540,690,{n:40,seed:7,colors:[MINT,'#fff',GOLD],speed:[400,1100],life:1.2})},
 sfx:()=>[[1.8,'tick'],[2.15,'tick'],[2.5,'tick'],[4.2,'ding']]},

cta:{bg:'#130d24',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:960});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:150px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:530px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:560px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#a07bff,#6b4bd6)">${I.chart(120)}</div>`+cb.html)},
 init:(sc,id)=>split(id,'tt'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:63});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=H.at(sc,'关注')??2.4,S=(H.at(sc,'上线第一')??4.0)-0.3;const p=sc._cb.anim(t,{show:1.4,follow:F,type:(H.at(sc,'评论')??3.0)+0.2,send:S});
  MO.burst(g,t,OPEN,540,640,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,640,{r1:700,width:14,color:'170,120,255'});K.flash(g,t,OPEN,0.25,'200,170,255');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.4,'pop'],[3.7,'pop']]},
outro:K.outro(BG),
};
})();
