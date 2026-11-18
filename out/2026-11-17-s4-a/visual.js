/* 2026-11-17-s4-a 商品上架 · 专属画面。共用样式与工具见 engine/kit.js（KIT）、engine/motion.js（MO）。
   色调：深夜蓝 + 企鹅橙。主线：一面望不到头的商品墙 → 人工慢、自动快 → 后台自己点、表单自己填 → 提交前停下等你。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,AVC,I}=K;
const BG={seed:4,hue:[255,110,40],hue2:[70,110,255],base:['#121833','#0b0f22','#06070e']};
const css=`
.a-tile{position:absolute;width:150px;height:190px;border-radius:22px;background:linear-gradient(160deg,#2a3150,#161b30);border:2px solid rgba(255,255,255,.12);overflow:hidden}
.a-tile b{position:absolute;left:14px;right:14px;top:14px;height:96px;border-radius:14px;background:linear-gradient(140deg,#3b4470,#252b48)}
.a-tile i{position:absolute;left:14px;height:14px;border-radius:7px;background:rgba(255,255,255,.18)}
.a-tile.on{border-color:${ACC};box-shadow:0 0 30px rgba(255,77,26,.6)}
.a-big{font-size:300px;font-weight:900;letter-spacing:-10px;color:#fff;line-height:1;font-variant-numeric:tabular-nums;text-shadow:0 20px 60px rgba(0,0,0,.6)}
.a-lane{position:absolute;left:70px;width:940px;height:500px;padding:36px 40px;border-radius:44px}
.a-lane .h{font-size:58px;font-weight:900;color:#fff;display:flex;align-items:center;gap:18px}
.a-lane .n{font-size:32px;font-weight:700;color:#aab0c8;margin-left:auto}
.a-ppl{display:flex;flex-direction:column;gap:30px;margin-top:40px}
.a-p{display:flex;align-items:center;gap:20px;font-size:34px;color:#fff;font-weight:800}
.a-track{flex:1;height:26px;border-radius:13px;background:rgba(255,255,255,.1);overflow:hidden}
.a-fill{height:100%;width:100%;border-radius:13px;transform-origin:left}
.a-menu{position:absolute;left:0;top:0;bottom:0;width:250px;background:#151a2e;padding:24px 0}
.a-mi{height:84px;display:flex;align-items:center;padding:0 30px;font-size:32px;font-weight:700;color:#9aa0bd;white-space:nowrap}
.a-sk{position:absolute;height:26px;border-radius:13px;background:rgba(255,255,255,.1)}
.a-cur{position:absolute;left:0;top:0;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle,#fff 0 22%,${ACC} 30%,rgba(255,77,26,.0) 72%);z-index:9}
.a-field{display:flex;align-items:center;gap:22px;height:140px;padding:0 30px;border-radius:28px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.1);font-size:40px;font-weight:800;color:#fff;white-space:nowrap}
.a-field .l{width:120px;color:#9aa0bd;font-size:34px}
.a-field .v{flex:1;overflow:hidden}
.a-rb{font-size:30px;font-weight:800;color:${MINT};border:3px solid ${MINT};border-radius:999px;padding:4px 18px}
.a-step{display:flex;align-items:center;gap:30px;height:200px;padding:0 44px;border-radius:44px;font-size:64px;font-weight:900;color:#fff}
.a-step .no{flex:none;width:110px;height:110px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:62px;background:#fff;color:#111}
.a-chip{position:absolute;padding:14px 26px;border-radius:18px;background:#F4EFE6;color:#1c1a17;font-size:34px;font-weight:900;white-space:nowrap;box-shadow:0 14px 30px rgba(0,0,0,.4)}
.a-sub{width:640px;height:200px;border-radius:100px;display:flex;align-items:center;justify-content:center;gap:24px;font-size:76px;font-weight:900;color:#fff;background:linear-gradient(180deg,#FF6A35,#E8400F);box-shadow:0 30px 80px rgba(255,77,26,.6),inset 0 4px 0 rgba(255,255,255,.35)}
.a-shield{position:absolute;border-radius:50%;border:8px solid rgba(255,201,77,.9);box-shadow:0 0 60px rgba(255,201,77,.7),inset 0 0 60px rgba(255,201,77,.35)}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));

window.VISUALS={
/* 0 钩子：望不到头的商品墙 + 数字滚到一千 */
wall:{bg:'#0b0f22',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="position:absolute;left:-60px;top:-60px;width:1200px;height:2040px;object-fit:cover;opacity:.55">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,10,24,.75),rgba(8,10,24,.45) 45%,rgba(8,10,24,.95))"></div>`+K.layers(id,`
  <div class="v-a" id="${id}wall" style="left:-160px;top:560px;width:1400px;height:1300px;transform-origin:50% 0">${Array.from({length:8*8},(_,k)=>{const c=k%8,r=Math.floor(k/8);
    return `<div class="a-tile" id="${id}tl${k}" style="left:${c*172}px;top:${r*210}px"><b></b><i style="top:126px;right:30px"></i><i style="top:152px;right:70px"></i></div>`}).join('')}</div>
  <div class="v-a v-t v-ctr" id="${id}a" style="top:170px;font-size:128px">${H.fmt(sc.line1)}</div>
  <div class="v-a v-t v-ctr v-acc" id="${id}b" style="top:315px;font-size:150px">${H.fmt(sc.line2)}</div>
  <div class="v-a v-ctr" id="${id}nb" style="top:640px;text-align:center"><div class="a-big" id="${id}n">0</div>
   <span class="v-pill dim" style="margin-top:14px">${H.fmt(sc.count_label)} · ${H.fmt(sc.note)}</span></div>`),
 init:(sc,id)=>split(id,'a','b'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,dust:30});
  MO.set($(id+'img'),{s:1.05+0.08*MO.prog(t,0,H.dur),x:MO.wob(t,2,14,0.3)});
  // 商品墙：透视倾斜，持续向上滚动，像望不到头
  const scroll=(t*120)%210;MO.set($(id+'wall'),{rx:38,y:-scroll+120*(1-MO.tw(t,0,0.8,'outC')),s:1.0+0.04*Math.sin(t*0.7)});
  for(let k=0;k<64;k++){const el=$(id+'tl'+k);const r=Math.floor(k/8),c=k%8;const a=0.05+(r*0.06+c*0.02);
   el.style.opacity=MO.tw(t,a,0.3).toFixed(3);el.classList.toggle('on',MO.hash(k+Math.floor(t*3)*64,7)>0.93)}
  K.title($(id+'a')._chars,t,0.15,'rise');K.title($(id+'b')._chars,t,1.0,'punch');if(t>1.8)MO.textWave($(id+'b')._chars,t,{amp:6,from:1.8});
  const N=sc.count||1000;const n=$(id+'n');n.textContent=MO.count(t,0.4,2.0,0,N,{e:'outQuint'});
  MO.set($(id+'nb'),{s:(0.6+0.4*MO.E.outBack(MO.prog(t,0.3,0.8)))*(1+0.05*Math.sin(MO.prog(t,2.35,2.7)*Math.PI)),o:MO.tw(t,0.3,0.2),y:MO.wob(t,5,8,0.5)});
  MO.ring(g,t,2.4,540,780,{r1:620,width:14});MO.burst(g,t,2.4,540,760,{n:30,seed:3,speed:[300,900],life:1.1})},
 sfx:()=>[[0.3,'pop'],[1.0,'pop'],[2.4,'ding']]},

/* 1 人工几个人慢慢填 vs 自动化一条直接到头 */
race:{bg:'#0b0f22',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-glass a-lane" id="${id}L" style="top:200px"><div class="h">${I.clock(64)}${H.fmt(sc.left.label)}<span class="n">${H.fmt(sc.left.note)}</span></div>
   <div class="a-ppl">${sc.people.map((p,i)=>`<div class="a-p"><div class="v-av" style="width:64px;height:64px;font-size:28px;background:${AVC[i]}">${p[0]}</div><span style="width:110px">${H.fmt(p)}</span><div class="a-track"><div class="a-fill" id="${id}p${i}" style="background:rgba(255,255,255,.55)"></div></div></div>`).join('')}</div>
   <div class="v-a" id="${id}cal" style="right:40px;top:30px;width:120px;height:130px;border-radius:20px;background:#fff;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,.4)"><div style="height:36px;background:${ACC}"></div><div id="${id}pg" style="position:absolute;left:0;right:0;top:36px;bottom:0;background:#fff;transform-origin:50% 0"></div></div></div>
  <div class="v-a v-glass a-lane" id="${id}R" style="top:760px;border-color:rgba(255,77,26,.6);background:linear-gradient(160deg,rgba(255,77,26,.28),rgba(255,77,26,.06))"><div class="h"><div class="v-ic" style="width:74px;height:74px;border-radius:22px">${I.list(52)}</div>${H.fmt(sc.right.label)}<span class="n" style="color:#FFD2C2">${H.fmt(sc.right.note)}</span></div>
   <div class="a-track" style="height:72px;border-radius:36px;margin-top:110px"><div class="a-fill" id="${id}q" style="background:linear-gradient(90deg,${ACC},${GOLD})"></div></div>
   <div class="v-ok" id="${id}ok" style="position:absolute;right:50px;bottom:56px;width:110px;height:110px">${I.check(70)}</div></div>`),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:12});const SW=H.at(sc,'交给')??2.4;
  MO.set($(id+'L'),{x:-600*(1-MO.tw(t,0.05,0.5,'outBack')),y:MO.wob(t,3,6,0.4)});
  [0.21,0.13,0.17].forEach((v,i)=>{$(id+'p'+i).style.transform=`scaleX(${(v*MO.prog(t,0.4,H.dur)+0.02*Math.abs(Math.sin(t*3+i))).toFixed(3)})`});
  const flip=(t*2.2)%1;MO.set($(id+'pg'),{rx:flip<0.5?flip*180:0,o:flip<0.5?1-flip:1});MO.set($(id+'cal'),{r:Math.sin(t*4)*3});
  const rp=MO.tw(t,SW-0.1,0.5,'outBack');MO.set($(id+'R'),{x:600*(1-rp),o:MO.tw(t,SW-0.1,0.2),y:MO.wob(t,4,6,0.4)});
  const q=MO.tw(t,SW+0.35,0.7,'outE');$(id+'q').style.transform=`scaleX(${q.toFixed(3)})`;MO.sheen($(id+'q'),(t*1.5)%1,{w:14});
  MO.set($(id+'ok'),{s:MO.ease('outBackBig')(MO.prog(t,SW+1.0,SW+1.35)),r:(1-MO.tw(t,SW+1.0,0.35))*-120});
  MO.set($(id+'L'),{x:-600*(1-MO.tw(t,0.05,0.5,'outBack')),y:MO.wob(t,3,6,0.4),s:1-0.04*MO.tw(t,SW,0.4),o:1-0.45*MO.tw(t,SW+0.3,0.4)});
  MO.burst(g,t,SW+1.05,920,1140,{n:30,seed:6,speed:[300,900],life:1.1});MO.ring(g,t,SW+1.05,920,1140,{r1:380});
  MO.stream(g,t,120,1040,900,1040,{n:16,seed:2,bend:-40,speed:1.6,size:7})},
 sfx:sc=>[[0.1,'pop'],[2.4,'pop'],[3.5,'ding']]},

/* 2 后台里光标自己点进"发布新商品" */
nav:{bg:'#0b0f22',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:118px">${H.fmt('全程{s:不用你动手}')}</div>
  ${K.win(id,H.fmt(sc.win),{x:60,y:420,w:960,h:860})}
  <div class="v-a v-shi" id="${id}shi" style="right:84px;top:500px">示意</div>`),
 init:(sc,id,H)=>{const b=H.$(id+'body');b.innerHTML=`<canvas id="${id}cv" width="960" height="796" style="position:absolute;inset:0;display:none"></canvas>
  <div id="${id}sim"><div class="a-menu">${sc.menu.map((m,i)=>`<div class="a-mi" id="${id}m${i}">${H.fmt(m)}</div>`).join('')}</div>
  <div id="${id}page" style="position:absolute;left:250px;right:0;top:0;bottom:0;padding:40px">${Array.from({length:7},(_,k)=>`<div class="a-sk" id="${id}k${k}" style="left:40px;top:${60+k*96}px;width:${[480,360,560,300,520,420,380][k]}px"></div>`).join('')}</div>
  <div class="a-cur" id="${id}cur"></div></div>`;M().split(H.$(id+'hd'));
  if(H.frame(sc,0)){H.$(id+'cv').style.display='block';H.$(id+'sim').style.display='none';H.$(id+'shi').style.display='none'}},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:22,beats:H.frame(sc,0)?[H.at(sc,'后台')??0.9,H.at(sc,'发布页')??1.9]:[]});
  K.title($(id+'hd')._chars,t,0.1,'drop');MO.set($(id+'win'),{y:160*(1-MO.tw(t,0.05,0.6,'outBack')),rx:10*(1-MO.tw(t,0,0.8)),r:MO.wob(t,3,0.5,0.3)});
  const im=H.frame(sc,t);if(im){
   // 实录是一张张截图拼的，画面几乎不动：用源矩形做镜头（全页 → 推近价格表 → 再推 → 往下摇），加逐行扫的高亮框
   const c=$(id+'cv'),cg=c.getContext('2d'),W=im.width,Hh=im.height;
   const b1=H.at(sc,'后台')??0.9,b2=H.at(sc,'发布页')??1.9,b3=H.at(sc,'不用')??2.8;
   const z0=W*c.height/c.width/Hh*1.01;   // 起始缩放：源矩形正好不超过原图高度
   const z=MO.kf(t,[[0,z0],[b1,z0*1.03],[b1+0.5,z0*1.3,'outBack'],[b2,z0*1.33],[b2+0.45,z0*1.65,'outBack'],[H.dur,z0*1.75]]);
   const vx=MO.kf(t,[[0,W/2],[b1,W/2],[b1+0.5,W*0.56,'inOutC'],[b2+0.45,W*0.58,'inOutC'],[H.dur,W*0.6]]);
   const vy=MO.kf(t,[[0,Hh/2],[b1,Hh/2],[b1+0.5,Hh*0.5,'inOutC'],[b2+0.45,Hh*0.56,'inOutC'],[b3,Hh*0.62,'inOutC'],[H.dur,Hh*0.7]]);
   const vw=W/z,vh=vw*c.height/c.width,sx=Math.min(Math.max(vx-vw/2,0),W-vw),sy=Math.min(Math.max(vy-vh/2,0),Hh-vh),k=c.width/vw;
   cg.fillStyle='#f4f4f0';cg.fillRect(0,0,c.width,c.height);cg.drawImage(im,sx,sy,vw,vh,0,0,c.width,c.height);
   // 高亮框：从 b1 起逐行往下扫（原画面坐标），每到一行顿一下
   const row=Math.floor(MO.tw(t,b1+0.3,H.dur-b1-0.3)*6),ry=Hh*(0.42+row*0.055)+Hh*0.012*MO.E.outC((t*2.2)%1);
   const hx=(W*0.36-sx)*k,hy=(ry-sy)*k,hw=W*0.5*k,hh=Hh*0.045*k,ho=MO.tw(t,b1+0.3,0.25);
   cg.save();cg.globalAlpha=ho;cg.strokeStyle=ACC;cg.lineWidth=5;cg.shadowColor='rgba(255,77,26,.8)';cg.shadowBlur=24;cg.strokeRect(hx,hy,hw,hh);
   cg.globalAlpha=ho*0.12;cg.fillStyle=ACC;cg.fillRect(hx,hy,hw,hh);cg.restore();
   // 扫光一遍遍掠过窗口
   const sp=((t*0.8)%1)*(c.width+400)-200,gr=cg.createLinearGradient(sp-120,0,sp+120,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(0.5,'rgba(255,255,255,.28)');gr.addColorStop(1,'rgba(255,255,255,0)');cg.fillStyle=gr;cg.fillRect(0,0,c.width,c.height);
   MO.ring(g,t,b1,540,850,{r1:520,width:8});MO.ring(g,t,b2,540,850,{r1:620,width:8});K.flash(g,t,b2,0.15);
   return}
  const tg=sc.target;const C1=0.9,C2=1.9,LOAD=2.2;
  // 光标：先去"商品管理"，再点"发布新商品"，然后进表单
  const cx=MO.kf(t,[[0.5,700],[C1-0.15,130,'inOutC'],[C2-0.15,130],[C2+0.6,560,'inOutC'],[H.dur,600]]);
  const cy=MO.kf(t,[[0.5,600],[C1-0.15,24+1*84+42,'inOutC'],[C2-0.4,24+tg*84+42,'inOutC'],[C2+0.6,330,'inOutC'],[H.dur,360]]);
  MO.set($(id+'cur'),{x:cx-23,y:cy-23,s:1-0.25*(MO.prog(t,C2-0.1,C2)-MO.prog(t,C2,C2+0.15))+0.08*Math.sin(t*8),o:MO.tw(t,0.4,0.2)});
  sc.menu.forEach((_,i)=>{const on=(t>C1&&t<C2&&i===1)||(t>=C2&&i===tg);const el=$(id+'m'+i);el.style.background=on?'rgba(255,77,26,.22)':'transparent';el.style.color=on?'#fff':'#9aa0bd';el.style.borderLeft=on?`6px solid ${ACC}`:'6px solid transparent'});
  for(let k=0;k<7;k++){const el=$(id+'k'+k);const p=MO.tw(t,LOAD+k*0.08,0.35,'outC');el.style.transform=`scaleX(${(t<LOAD?0.3+0.1*Math.sin(t*4+k):p).toFixed(3)})`;el.style.transformOrigin='left';
   el.style.background=t<LOAD?`rgba(255,255,255,${(0.06+0.05*Math.sin(t*5-k)).toFixed(3)})`:'rgba(255,255,255,.16)'}
  MO.ring(g,t,C1,60+130,420+64+24+84+42,{r1:120,width:6});MO.ring(g,t,C2,60+130,420+64+24+tg*84+42,{r1:160,width:8});K.flash(g,t,LOAD,0.2)},
 sfx:()=>[[0.9,'tick'],[1.9,'tick'],[2.2,'pop']]},

/* 3 资料一项项飞进表单，填一项读回一项 */
fill:{bg:'#0b0f22',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:175px;font-size:120px">${H.fmt(sc.head)}</div>
  <div class="v-a v-solid" id="${id}form" style="left:70px;top:430px;width:940px;padding:36px;display:flex;flex-direction:column;gap:18px">
   ${sc.fields.map((f,i)=>`<div class="a-field" id="${id}f${i}"><span class="l">${H.fmt(f[0])}</span><span class="v" id="${id}v${i}"></span><span class="a-rb" id="${id}r${i}">${H.fmt(sc.readback)}</span></div>`).join('')}</div>
  ${sc.fields.map((f,i)=>`<div class="a-chip" id="${id}c${i}">${H.fmt(f[1])}</div>`).join('')}`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,hue:[91,214,155]},{seed:31});
  MO.set($(id+'form'),{y:200*(1-MO.tw(t,0,0.6,'outBack')),y2:0});
  const n=sc.fields.length;const span=Math.max(2.2,H.dur-1.6);
  sc.fields.forEach((f,i)=>{const a=0.45+i*span/n;const fl=$(id+'c'+i),fy=430+36+i*158+40;
   // 资料卡片从右上角飞进对应格子
   const u=MO.prog(t,a,a+0.45);const x=MO.lerp(1100,330,MO.E.outC(u)),y=MO.lerp(120,fy,MO.E.inOutC(u));
   MO.set(fl,{x,y,s:1-0.3*u,r:(1-u)*12,o:u>0&&u<1?1:0});
   const v=String(f[1]);$(id+'v'+i).textContent=MO.typed(v,t,a+0.4,22);
   const done=a+0.45+v.length/22;MO.set($(id+'r'+i),{s:MO.ease('outBackBig')(MO.prog(t,done,done+0.3)),o:t>done?1:0});
   const cur=t>=a&&t<done+0.3;const el=$(id+'f'+i);el.style.borderColor=cur?ACC:(t>done?'rgba(91,214,155,.5)':'rgba(255,255,255,.1)');el.style.background=cur?'rgba(255,77,26,.12)':(t>done?'rgba(91,214,155,.08)':'rgba(255,255,255,.06)');
   MO.set(el,{x:cur?6*Math.sin(t*20)*MO.prog(t,a+0.4,a+0.5)*(1-MO.prog(t,a+0.5,a+0.7)):0,o:MO.tw(t,0.2+i*0.06,0.25)});
   MO.ring(g,t,done,960,fy+60,{r1:110,width:6,color:'91,214,155',life:0.5})});
  K.title($(id+'hd')._chars,t,0.1,'drop')},
 sfx:sc=>sc.fields.map((_,i)=>[0.9+i*0.6,'tick'])},

/* 4 中段悬念：三步，第三步上锁 */
three:{bg:'#0b0f22',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:120px">${H.fmt(sc.head)}</div>
  ${sc.steps.map((s,i)=>{const lock=i===2;return `<div class="v-a a-step ${lock?'':'v-glass'}" id="${id}s${i}" style="left:70px;width:940px;top:${430+i*240}px;${lock?`background:linear-gradient(150deg,#2a2f4a,#141829);border:4px solid rgba(255,201,77,.7);box-shadow:0 0 70px rgba(255,77,26,.45)`:''}">
   <div class="no" style="${lock?`background:${GOLD}`:''}">${i+1}</div><span id="${id}x${i}" style="${lock?'font-size:110px;color:#fff;text-shadow:0 0 40px rgba(255,201,77,.9)':''}">${H.fmt(s)}</span>${lock?`<span style="margin-left:auto">${I.lock(90)}</span><div id="${id}sh" style="position:absolute;inset:0;border-radius:44px"></div>`:`<span style="margin-left:auto" class="v-ok">${I.check(36)}</span>`}</div>`}).join('')}`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,hue:[255,170,40]},{seed:41,push:0.07});
  K.title($(id+'hd')._chars,t,0.1,'drop');
  const a1=H.at(sc,'前两步')??1.2,a3=H.at(sc,'最后')??2.4;
  [0.35,a1,a3].forEach((a,i)=>{const p=MO.spring(t-a,1.3,6);MO.set($(id+'s'+i),{x:(i%2?1:-1)*700*(1-Math.min(1,p)),y:MO.wob(t,i+5,6,0.5),s:i===2?1+0.03*Math.sin(t*5)*(t>a+0.5?1:0):1,ry:i===2?MO.wob(t,9,8,0.4):0})});
  if(t>a1+0.3)[0,1].forEach(i=>MO.set($(id+'s'+i),{s:1+0.04*Math.sin(MO.prog(t,a1+0.1+i*0.15,a1+0.4+i*0.15)*Math.PI)}));
  MO.set($(id+'x2'),{s:1+0.12*Math.sin(t*6)});MO.sheen($(id+'sh'),(t*0.9)%1.3/1.3*1.3,{w:12,color:'rgba(255,255,255,.3)'});
  MO.ring(g,t,a3+0.2,540,430+480+100,{r1:600,color:'255,201,77'});MO.dust(g,t,{n:24,seed:77,color:'255,201,77',size:[3,7],alpha:[.3,.9],speed:-70,drift:60})},
 sfx:()=>[[0.35,'tick'],[1.3,'tick'],[2.5,'pop']]},

/* 5 第一步资料 → 第二步连上后台 */
connect:{bg:'#0b0f22',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}st1" style="left:70px;top:180px"><span class="v-pill dim" id="${id}b1" style="font-size:44px">${I.folder(48)}第一步 · 准备资料</span></div>
  <div class="v-a" id="${id}st2" style="left:70px;top:280px"><span class="v-pill dim" id="${id}b2" style="font-size:44px">${I.chart(48)}第二步 · 连上后台</span></div>
  <div class="v-a" id="${id}fd" style="left:90px;top:520px;width:300px;height:300px">${I.folder(300)}</div>
  ${sc.files.map((f,i)=>`<div class="a-chip" id="${id}c${i}" style="left:0;top:0">${H.fmt(f)}</div>`).join('')}
  ${K.win(id,H.fmt(sc.win),{x:470,y:430,w:560,h:900})}
  <div class="v-a v-shi" id="${id}shi" style="right:80px;top:510px">示意</div>
  <div class="v-a" id="${id}plug" style="left:395px;top:640px;width:70px;height:70px;border-radius:50%;background:${GOLD};box-shadow:0 0 50px rgba(255,201,77,.9)"></div>`),
 init:(sc,id,H)=>{H.$(id+'body').innerHTML=`<canvas id="${id}cv" width="560" height="836" style="position:absolute;inset:0;display:none"></canvas><div id="${id}sim" style="padding:30px;display:flex;flex-direction:column;gap:20px">${sc.files.map((f,i)=>`<div class="a-field" style="height:100px;font-size:34px" id="${id}f${i}"><span class="l" style="width:90px">${H.fmt(f)}</span><span class="v" id="${id}v${i}"></span></div>`).join('')}</div>`;
  if(H.frame(sc,0)){H.$(id+'cv').style.display='block';H.$(id+'sim').style.display='none';H.$(id+'shi').style.display='none'}},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:51});const S2=H.at(sc,'第二步')??2.2;
  [[id+'st1',0.15],[id+'st2',S2-0.1]].forEach(([e,a])=>MO.set($(e),{x:-300*(1-MO.tw(t,a,0.4,'outBack')),o:MO.tw(t,a,0.2)}));
  $(id+'b1').style.borderColor=t<S2?ACC:'rgba(255,255,255,.22)';$(id+'b2').style.borderColor=t>=S2?ACC:'rgba(255,255,255,.22)';
  MO.set($(id+'fd'),{s:MO.ease('outBack')(MO.prog(t,0.3,0.8)),y:MO.wob(t,3,10,0.5),r:MO.wob(t,4,3,0.4)});
  MO.set($(id+'win'),{x:500*(1-MO.tw(t,S2-0.2,0.6,'outBack')),o:MO.tw(t,S2-0.2,0.2)});
  const pl=MO.tw(t,S2+0.3,0.3,'outBackBig');MO.set($(id+'plug'),{s:pl*(1+0.1*Math.sin(t*8)),o:pl});
  // 资料卡：先从文件夹里冒出来排队，接上后台后一张张飞进表单
  sc.files.forEach((f,i)=>{const pop=MO.spring(t-0.8-i*0.18,1.5,6);const go=MO.prog(t,S2+0.6+i*0.28,S2+1.1+i*0.28);
   const x0=110+(i%2)*150,y0=880+Math.floor(i/2)*90;const x=MO.lerp(x0,560,MO.E.inOutC(go)),y=MO.lerp(y0,430+64+30+i*120,MO.E.inOutC(go))+MO.wob(t,i,8,0.6)*(1-go);
   MO.set($(id+'c'+i),{x,y,s:Math.max(0,pop)*(1-0.3*go),o:go>=1?0:Math.min(1,Math.max(0,pop)),r:MO.wob(t,i+9,4,0.5)*(1-go)});
   if(!H.frame(sc,0)){$(id+'v'+i).textContent=go>=1?'✓ 已填入':'';$(id+'f'+i).style.borderColor=go>=1?'rgba(91,214,155,.6)':'rgba(255,255,255,.1)'}});
  const im=H.frame(sc,t);if(im){const c=$(id+'cv');H.drawFrame(c.getContext('2d'),im,0,0,c.width,c.height)}
  if(t>S2+0.3)MO.stream(g,t,300,680,470,680,{n:10,seed:4,bend:-30,speed:1.4,color:'255,201,77'});MO.ring(g,t,S2+0.3,430,675,{r1:180,color:'255,201,77'})},
 sfx:()=>[[0.3,'pop'],[2.5,'pop']]},

/* 6 揭晓：AI 光标冲向"提交"，被护罩挡住；你按下确认 */
stop:{bg:'#0b0f22',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}kk" style="left:0;right:0;top:180px;text-align:center"><span class="v-pill hot" style="font-size:46px">${H.fmt(sc.step)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:290px;font-size:130px">${H.fmt(sc.wait)}</div>
  <div class="v-a a-shield" id="${id}sh" style="left:170px;top:560px;width:740px;height:740px"></div>
  <div class="v-a a-sub" id="${id}btn" style="left:220px;top:830px"><span id="${id}bt">${H.fmt(sc.button)}</span></div>
  <div class="v-a a-cur" id="${id}cur" style="width:70px;height:70px"></div>
  <div class="v-a v-stamp" id="${id}stp" style="left:330px;top:600px;font-size:110px;background:rgba(10,12,24,.85)">${H.fmt(sc.halt)}</div>
  <div class="v-a" id="${id}hand" style="left:0;top:0">${I.hand(150)}</div>
  <div class="v-a" id="${id}you" style="left:0;right:0;top:1120px;text-align:center"><span class="v-pill light" style="font-size:46px">${I.check(40,'#111')} ${H.fmt(sc.confirm)}</span></div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,hue:[255,180,60]},{seed:61});
  const HALT=1.15,WAIT=H.at(sc,'等你')??2.4,PRESS=WAIT+1.0;
  MO.set($(id+'kk'),{y:-30*(1-MO.tw(t,0.05,0.4,'outBack')),o:MO.tw(t,0.05,0.2)});
  MO.set($(id+'btn'),{s:MO.ease('outBack')(MO.prog(t,0.15,0.6))*(1+0.025*Math.sin(t*6))-0.06*(MO.prog(t,PRESS-0.1,PRESS)-MO.prog(t,PRESS,PRESS+0.2))});
  // AI 光标冲向按钮，在护罩边缘被弹开、抖动
  const cx=MO.kf(t,[[0.3,980],[HALT,700,'inQ'],[HALT+0.25,760,'outBack'],[H.dur,780]]),cy=MO.kf(t,[[0.3,1420],[HALT,1030,'inQ'],[HALT+0.25,1110,'outBack'],[H.dur,1130]]);
  MO.set($(id+'cur'),{x:cx-35+(t>HALT&&t<HALT+0.5?Math.sin(t*60)*8:0),y:cy-35,o:MO.tw(t,0.3,0.15)*(1-0.6*MO.tw(t,WAIT,0.4)),s:1+0.1*Math.sin(t*9)});
  const sh=MO.prog(t,HALT,HALT+0.3);MO.set($(id+'sh'),{s:0.6+0.4*MO.E.outBackBig(sh),o:sh>0?(0.8+0.2*Math.sin(t*5))*(1-MO.tw(t,PRESS+0.2,0.4)):0,r:t*20});
  const sp=MO.prog(t,HALT+0.05,HALT+0.35);MO.set($(id+'stp'),{s:MO.lerp(2.4,1,MO.E.outBackBig(sp)),r:-10+MO.wob(t,3,1.5,0.8),o:sp>0?1-MO.tw(t,PRESS-0.3,0.3):0});
  K.title($(id+'hd')._chars,t,WAIT-0.2,'punch');if(t>WAIT+0.6)MO.textWave($(id+'hd')._chars,t,{amp:5,from:WAIT+0.6});
  // 你的手来按确认
  const hx=MO.kf(t,[[WAIT+0.1,300],[PRESS-0.1,520,'inOutC'],[PRESS+0.5,520],[H.dur,600,'inC']]),hy=MO.kf(t,[[WAIT+0.1,1500],[PRESS-0.1,900,'inOutC'],[PRESS+0.5,900],[H.dur,1500,'inC']]);
  MO.set($(id+'hand'),{x:hx,y:hy,s:1-0.15*(MO.prog(t,PRESS-0.1,PRESS)-MO.prog(t,PRESS,PRESS+0.2)),o:MO.tw(t,WAIT+0.1,0.2)});
  const done=t>PRESS;$(id+'btn').style.background=done?`linear-gradient(180deg,#3fd08e,#1f9e64)`:'';$(id+'bt').textContent=done?'✓ '+sc.button:sc.button;
  MO.set($(id+'you'),{y:40*(1-MO.tw(t,PRESS+0.1,0.4,'outBack')),o:MO.tw(t,PRESS+0.1,0.2)});
  MO.ring(g,t,HALT,700,1030,{r1:300,color:'255,201,77',width:12});K.flash(g,t,HALT,0.25,'255,201,77');
  MO.burst(g,t,PRESS,540,930,{n:50,seed:8,colors:[MINT,'#fff',GOLD],speed:[400,1200],life:1.3});MO.ring(g,t,PRESS,540,930,{r1:600,color:'91,214,155'})},
 sfx:()=>[[1.15,'pop'],[3.4,'ding']]},

/* 7 结尾：礼盒 + 关注 + 评论区发关键词 */
cta:{bg:'#0b0f22',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:960});sc._cb=cb;return K.layers(id,`
  <div class="v-a" id="${id}kk" style="left:0;right:0;top:180px;text-align:center"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:170px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:530px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:560px;width:180px;height:180px;border-radius:48px">${I.list(120)}</div>`+cb.html)},
 init:(sc,id)=>split(id,'tt'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:71});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3),y:-20*(1-MO.tw(t,0.05,0.4))});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),r:t<OPEN?Math.sin(t*20)*4:0,o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const p=sc._cb.anim(t,{show:1.2,follow:H.at(sc,'关注')??1.9,type:(H.at(sc,'评论')??2.6)+0.2,send:(H.at(sc,'两个字')??3.5)});
  MO.burst(g,t,OPEN,540,640,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,640,{r1:700,width:14,color:'255,201,77'});K.flash(g,t,OPEN,0.25,'255,201,77');
  MO.ring(g,t,H.at(sc,'关注')??1.9,p.fx,p.fy,{r1:300,width:8});MO.burst(g,t,H.at(sc,'两个字')??3.5,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[1.9,'pop'],[3.5,'pop']]},
outro:K.outro(BG),
};
})();
