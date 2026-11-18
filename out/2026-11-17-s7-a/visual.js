/* 2026-11-17-s7-a 私域回访 · 这条视频专属的画面代码。
   每个场景 = {bg, build(sc,id,H) → HTML, anim(sc,id,t,H)}，t 是场景内秒数，H.dur 是场景时长。
   文字全部取自 script.json 的场景字段（剧本检查会扫到）。 */
(function(){
const ACC='#FF4D1A',GOLD='#FFC94D',MINT='#5BD69B',INK='#0C1020',PAPER='#F4EFE6';
const css=`
.v-bg,.v-fx{position:absolute;inset:0;width:1080px;height:1920px;pointer-events:none}
.v-fx{z-index:30}
.v-st{position:absolute;inset:0;transform-origin:50% 42%;perspective:1600px}
.v-a{position:absolute}
.v-t{font-weight:900;letter-spacing:-2px;line-height:1.05;color:#fff;white-space:nowrap}
.v-t .s,.v-acc{color:${ACC}}
.v-glass{background:linear-gradient(160deg,rgba(255,255,255,.13),rgba(255,255,255,.04));border:2px solid rgba(255,255,255,.16);border-radius:40px;box-shadow:0 40px 80px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.25);backdrop-filter:blur(18px)}
.v-pill{display:inline-flex;align-items:center;gap:14px;border-radius:999px;padding:14px 32px;font-weight:800;font-size:38px;white-space:nowrap}
.v-scrap{position:absolute;left:0;top:0;padding:22px 30px;border-radius:22px;font-size:40px;font-weight:700;white-space:nowrap;color:#2a2520;background:#FFF6D9;box-shadow:0 18px 30px rgba(0,0,0,.35)}
.v-scrap.b{background:#fff;border-radius:30px 30px 30px 6px}.v-scrap.g{background:#E7F7EE}.v-scrap.p{background:#FFE3D6}
.v-row{display:flex;align-items:center;gap:26px;height:96px;padding:0 34px;border-radius:26px;font-size:44px;font-weight:800;color:#fff;position:relative;overflow:hidden}
.v-av{flex:none;width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;color:#fff}
.v-tag{margin-left:auto;font-size:32px;font-weight:700;padding:8px 22px;border-radius:999px;background:rgba(255,77,26,.18);color:#FFB49A;white-space:nowrap}
.v-ok{flex:none;width:58px;height:58px;border-radius:50%;background:${MINT};display:flex;align-items:center;justify-content:center}
.v-chip{position:absolute;left:90px;width:900px;height:132px;display:flex;align-items:center;gap:28px;padding:0 34px;border-radius:34px;background:rgba(22,24,34,.82);border:2px solid rgba(255,255,255,.14);box-shadow:0 24px 50px rgba(0,0,0,.5);backdrop-filter:blur(14px);color:#fff}
.v-chip .k{flex:none;font-size:30px;font-weight:800;padding:8px 18px;border-radius:14px;background:rgba(255,255,255,.12);color:#cfd3e6}
.v-chip .x{font-size:42px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v-chip.hot{border:4px solid ${ACC};background:rgba(60,20,10,.9)}.v-chip.hot .k{background:${ACC};color:#fff}
.v-stamp{position:absolute;font-size:120px;font-weight:900;color:${ACC};border:12px solid ${ACC};border-radius:30px;padding:0 34px;letter-spacing:6px;transform-origin:50% 50%}
.v-ic{border-radius:64px;background:linear-gradient(145deg,#FF7A45,#FF4D1A 55%,#C9300B);box-shadow:0 40px 90px rgba(255,77,26,.55),inset 0 4px 0 rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center}
.v-feat{width:430px;height:400px;padding:38px;display:flex;flex-direction:column;gap:16px}
.v-feat .h{font-size:60px;font-weight:900;color:#fff;line-height:1.1}.v-feat .h b{color:${ACC}}
.v-mini{position:relative;flex:1;border-radius:22px;background:rgba(0,0,0,.25);overflow:hidden}
.v-bar{position:absolute;left:22px;height:30px;border-radius:15px}
.v-q{font-size:420px;font-weight:900;color:#fff;line-height:1;text-shadow:0 0 80px rgba(255,77,26,.9),0 0 30px rgba(255,201,77,.8)}
.v-phone{width:600px;height:1000px;border-radius:84px;background:#0b0d16;border:14px solid #22263a;box-shadow:0 60px 120px rgba(0,0,0,.6),0 0 0 3px #3a3f58;overflow:hidden}
.v-msg{position:absolute;left:28px;right:28px;padding:22px 26px;border-radius:26px 26px 26px 8px;background:#1f2333;color:#e9ebf5;font-size:32px;font-weight:600;white-space:nowrap}
.v-lrow{position:absolute;left:28px;right:28px;height:120px;border-radius:26px;background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.1);display:flex;align-items:center;gap:18px;padding:0 22px;color:#fff;font-size:38px;font-weight:800}
.v-lrow i{font-style:normal;font-size:26px;font-weight:700;padding:6px 14px;border-radius:12px;background:rgba(91,214,155,.18);color:${MINT};white-space:nowrap}
.v-file{position:absolute;width:290px;height:150px;border-radius:24px;background:${PAPER};color:#1c1a17;box-shadow:0 18px 40px rgba(0,0,0,.4);padding:22px 26px;font-size:40px;font-weight:900}
.v-file small{display:block;font-size:24px;color:#8a8378;font-weight:700;margin-top:8px}
.v-shi{position:absolute;right:46px;top:34px;padding:8px 22px;border-radius:14px;background:#fff;color:#111;font-size:34px;font-weight:900;border:4px solid #111;z-index:5}
.v-note{position:absolute;right:20px;top:20px;padding:6px 18px;border-radius:12px;background:#fff;color:#111;font-size:28px;font-weight:900;border:3px solid #111}
.v-rem{display:flex;align-items:center;gap:22px;height:118px;padding:0 30px;border-radius:30px;background:rgba(255,255,255,.08);border:2px solid rgba(255,255,255,.12);color:#fff;font-size:42px;font-weight:800}
.v-rem small{font-size:30px;color:#aab0c8;font-weight:600}
.v-st2{margin-left:auto;font-size:30px;font-weight:800;padding:8px 20px;border-radius:999px;white-space:nowrap}
.v-btn{height:130px;border-radius:65px;display:flex;align-items:center;justify-content:center;gap:18px;font-size:54px;font-weight:900;color:#fff;background:${ACC};box-shadow:0 24px 50px rgba(255,77,26,.5)}
.v-goal{width:400px;height:330px;border-radius:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;font-size:72px;font-weight:900;color:#fff}
.v-box{position:absolute;border-radius:28px}
.v-input{height:130px;border-radius:65px;background:rgba(255,255,255,.95);display:flex;align-items:center;padding:0 40px;font-size:48px;font-weight:800;color:#111;gap:6px;box-shadow:0 20px 40px rgba(0,0,0,.35)}
.v-car{display:inline-block;width:5px;height:56px;background:${ACC}}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);

const M=()=>window.MO;
const ck=(w=34,c='#0C1020')=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" stroke="${c}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const bell=(w=150,c='#fff')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><path d="M32 8c-9 0-15 7-15 16v10l-5 8h40l-5-8V24c0-9-6-16-15-16z" fill="${c}"/><circle cx="32" cy="50" r="6" fill="${c}"/></svg>`;
const listIc=(w=170)=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><rect x="10" y="10" width="44" height="44" rx="10" fill="#fff"/><path d="M20 24h24M20 33h24M20 42h14" stroke="#FF4D1A" stroke-width="5" stroke-linecap="round"/><circle cx="48" cy="46" r="10" fill="#0C1020"/><path d="M43.5 46l3 3 5.5-6" stroke="#5BD69B" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`;
const bagIc=`<svg width="130" height="130" viewBox="0 0 64 64"><path d="M13 22h38l-3 34H16z" fill="#fff"/><path d="M24 24v-6a8 8 0 0 1 16 0v6" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="25" cy="30" r="3" fill="${ACC}"/><circle cx="39" cy="30" r="3" fill="${ACC}"/></svg>`;
const chartIc=`<svg width="130" height="130" viewBox="0 0 64 64"><rect x="10" y="38" width="10" height="16" rx="3" fill="#fff"/><rect x="27" y="28" width="10" height="26" rx="3" fill="#fff"/><rect x="44" y="18" width="10" height="36" rx="3" fill="#fff"/><path d="M10 26l14-10 10 6 18-12" stroke="${GOLD}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const AVC=['#FF7A45','#5B8DEF','#B06CF2','#2FB98A','#F2B53A'];

/* 共用：动态背景（深色渐变 + 漂移光斑 + 细网格 + 尘埃），整片一致，场景之间看起来是同一个空间 */
function bg(g,t,T,{seed=1,hue=[255,77,26],hue2=[91,120,255],grid=true,dust=46}={}){const MO=M();
 const lg=g.createLinearGradient(0,0,0,1920);lg.addColorStop(0,'#141a33');lg.addColorStop(0.55,'#0c1020');lg.addColorStop(1,'#07080f');g.fillStyle=lg;g.fillRect(0,0,1080,1920);
 const tt=T; /* 光斑按全片时间漂移，切场景时不会跳 */
 MO.glow(g,540+MO.wob(tt,seed,320,0.08),620+MO.wob(tt,seed+3,260,0.07),900,`rgba(${hue},0.32)`);
 MO.glow(g,300+MO.wob(tt,seed+7,260,0.09),1400+MO.wob(tt,seed+9,220,0.08),800,`rgba(${hue2},0.26)`);
 MO.glow(g,900+MO.wob(tt,seed+11,200,0.1),300+MO.wob(tt,seed+13,180,0.09),600,'rgba(255,201,77,0.14)');
 if(grid){g.save();g.strokeStyle='rgba(255,255,255,0.045)';g.lineWidth=2;const off=(tt*18)%90;
  for(let x=-90+off;x<1170;x+=90){g.beginPath();g.moveTo(x,0);g.lineTo(x,1920);g.stroke()}
  for(let y=-90+off;y<2010;y+=90){g.beginPath();g.moveTo(0,y);g.lineTo(1080,y);g.stroke()}g.restore()}
 MO.dust(g,tt,{n:dust,seed:seed+40,speed:26,size:[1.5,4.5],alpha:[.12,.5]});
 const vg=g.createRadialGradient(540,860,500,540,860,1300);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.55)');g.fillStyle=vg;g.fillRect(0,0,1080,1920)}
/* 共用：场景进出（推进模糊入场 + 结尾轻微后撤），配合硬切形成"穿过去"的感觉 */
function stage(el,t,dur,{push=0.05,seed=1}={}){const MO=M();const a=MO.tw(t,0,0.42,'outE');const z=MO.tw(t,dur-0.28,0.28,'inQ');
 MO.set(el,{s:(1.16-0.16*a)*(1+push*MO.E.inOutSine(MO.prog(t,0,dur)))*(1-0.05*z),x:MO.wob(t,seed,8,0.25),y:MO.wob(t,seed+4,8,0.22),r:MO.wob(t,seed+8,0.35,0.2),
  blur:16*(1-a)+7*z,o:Math.min(1,a*1.6)})}
const flash=(g,t,t0,life=0.3,c='255,255,255')=>{const u=M().prog(t,t0,t0+life);if(u>0&&u<1){g.fillStyle=`rgba(${c},${(0.55*(1-u)).toFixed(3)})`;g.fillRect(0,0,1080,1920)}};
const fx=(id)=>M().canvas(document.getElementById(id+'fx'));
const B=(id)=>`<canvas class="v-bg" id="${id}bg" width="1080" height="1920"></canvas>`;
const FX=(id)=>`<canvas class="v-fx" id="${id}fx" width="1080" height="1920"></canvas>`;

window.VISUALS={
/* ---------------- 1 钩子：一堆零散记录 → 吸进一张回访名单 ---------------- */
hook:{bg:INK,
 build:(sc,id,H)=>{const sp=[[60,500,-8],[540,470,6],[120,680,5],[600,720,-5],[70,900,-4],[560,960,7],[180,1120,6],[600,1190,-6],[280,1330,-3]];
  return B(id)+`<div class="v-st" id="${id}st">
  <div class="v-a v-t" id="${id}ask" style="left:0;right:0;top:180px;text-align:center;font-size:150px">${H.fmt(sc.ask)}</div>
  <div class="v-a" id="${id}old" style="left:0;right:0;top:370px;text-align:center"><span class="v-pill" style="background:rgba(255,77,26,.16);color:#FF9F7E;border:3px solid rgba(255,77,26,.6)">${H.fmt(sc.old)}</span></div>
  ${sc.scraps.map((x,i)=>`<div class="v-scrap ${['','b','g','p'][i%4]}" id="${id}sp${i}" data-x="${sp[i%9][0]}" data-y="${sp[i%9][1]}" data-r="${sp[i%9][2]}">${H.fmt(x)}</div>`).join('')}
  <div class="v-a v-glass" id="${id}card" style="left:90px;top:520px;width:900px;height:690px;padding:34px 34px">
   <div style="display:flex;align-items:center;gap:20px;height:80px;margin-bottom:14px"><div style="width:62px;height:62px">${listIc(62)}</div><div class="v-t" style="font-size:52px;letter-spacing:0">${H.fmt(sc.card)}</div><div class="v-note" style="position:static;margin-left:auto">${H.fmt(sc.note)}</div></div>
   <div id="${id}rows" style="display:flex;flex-direction:column;gap:10px">${sc.rows.map((r,i)=>`<div class="v-row" id="${id}r${i}" style="background:rgba(255,255,255,.06)"><div class="v-av" style="background:${AVC[i%5]}">${r[0]}</div>${r[1]}<span class="v-tag">${r[2]}</span><div class="v-ok" id="${id}ok${i}">${ck()}</div></div>`).join('')}</div>
   <div id="${id}scan" style="position:absolute;left:24px;right:24px;top:0;height:104px;border-radius:26px;border:3px solid rgba(255,77,26,.85);box-shadow:0 0 40px rgba(255,77,26,.5);pointer-events:none"></div>
  </div>
  <div class="v-a v-t" id="${id}t1" style="left:0;right:0;top:170px;text-align:center;font-size:132px">${H.fmt(sc.line1)}</div>
  <div class="v-a v-t v-acc" id="${id}t2" style="left:0;right:0;top:320px;text-align:center;font-size:132px">${H.fmt(sc.line2)}</div>
  <div class="v-a" id="${id}ul" style="left:300px;width:480px;top:470px;height:16px;border-radius:8px;background:${ACC};transform-origin:left"></div>
 </div>`+FX(id)},
 init:(sc,id)=>{['ask','t1','t2'].forEach(k=>M().split(document.getElementById(id+k)))},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$;bg(MO.canvas($(id+'bg')),t,H.T,{seed:1});stage($(id+'st'),t,H.dur,{seed:2});
  const SUCK=2.05;
  // 问句：一上来就砸进画面
  const ask=$(id+'ask')._chars;MO.textIn(ask,t,0.0,{stagger:0.05,dur:0.45,from:{y:-120,s:1.6,blur:14,o:0},e:'outBack'});
  if(t>0.5)MO.textWave(ask,t,{amp:7,from:0.5});MO.textOut(ask,t,SUCK-0.15,{stagger:0.03,to:{y:-80,s:0.6,blur:10,o:0}});
  const old=$(id+'old');MO.set(old,{y:40*(1-MO.tw(t,0.45,0.4,'outBack'))+(-60*MO.tw(t,SUCK-0.2,0.3,'inC')),o:MO.tw(t,0.45,0.25)*(1-MO.tw(t,SUCK-0.2,0.25)),
   r:Math.sin(t*9)*1.2*(t<SUCK?1:0)});
  // 零散记录：从四周飞进来乱飘，随后沿曲线吸进名单卡
  const card=$(id+'card');const cin=MO.tw(t,SUCK+0.15,0.55,'outBack');
  sc.scraps.forEach((_,i)=>{const el=$(id+'sp'+i);const x0=+el.dataset.x,y0=+el.dataset.y,r0=+el.dataset.r;
   const a=0.12+i*0.11;const p=MO.tw(t,a,0.5,'outBack');const side=i%2?1:-1;
   let x=x0+side*700*(1-p)+MO.wob(t,i*3+1,26,0.6),y=y0+MO.wob(t,i*3+2,22,0.55),r=r0+MO.wob(t,i*3+3,5,0.5)+side*30*(1-p),s=1;
   // 慌乱抖动
   x+=Math.sin(t*23+i)*3;
   const q=MO.tw(t,SUCK+i*0.045,0.5,'inOutC');const tx=540-180,ty=650+(i%5)*106;   // 目标：名单行
   if(q>0){x=MO.lerp(x,tx-20+i*8,q)+Math.sin(q*Math.PI)*side*220;y=MO.lerp(y,ty,q);r=MO.lerp(r,0,q);s=MO.lerp(1,0.25,q)}
   MO.set(el,{x,y,r,s,o:Math.min(p*2,1)*(1-MO.prog(q,0.75,1)),blur:q>0.6?(q-0.6)*20:0})});
  MO.set(card,{y:180*(1-cin),s:0.86+0.14*cin,o:MO.tw(t,SUCK+0.15,0.25),rx:12*(1-cin)});
  sc.rows.forEach((_,i)=>{const a=SUCK+0.45+i*0.12;const p=MO.tw(t,a,0.45,'outBack');const r=$(id+'r'+i);
   MO.set(r,{x:-120*(1-p),o:MO.tw(t,a,0.2)});const ok=$(id+'ok'+i);MO.set(ok,{s:MO.ease('outBackBig')(MO.prog(t,a+0.3,a+0.6)),r:(1-MO.tw(t,a+0.3,0.3))*-90});
   r.style.background=`rgba(255,255,255,${(0.06+0.08*Math.max(0,Math.sin(t*2.4-i*0.7))).toFixed(3)})`});
  // 扫描框沿名单上下巡检，持续不停
  const sc0=$(id+'scan');const lap=Math.max(0,t-SUCK-1.1);const k=(Math.sin(lap*2.1-Math.PI/2)+1)/2;
  MO.set(sc0,{y:124+k*4*106,o:MO.tw(t,SUCK+1.1,0.3)});
  // 标题：问句消失后，名单标题落位 + 下划线
  MO.textIn($(id+'t1')._chars,t,SUCK+0.25,{stagger:0.06,dur:0.5,from:{y:90,rx:-80,blur:10,o:0}});
  MO.textIn($(id+'t2')._chars,t,SUCK+0.55,{stagger:0.06,dur:0.55,from:{y:0,s:2.2,blur:16,o:0},e:'outBackBig'});
  if(t>SUCK+1.3)MO.textWave($(id+'t2')._chars,t,{amp:5,from:SUCK+1.3});
  $(id+'ul').style.transform=`scaleX(${MO.tw(t,SUCK+0.9,0.5,'outE').toFixed(3)})`;
  const g=fx(id);MO.ring(g,t,SUCK+0.4,540,880,{r1:700,width:14});MO.burst(g,t,SUCK+0.95,540,400,{n:36,seed:5,speed:[300,900],life:1.2});flash(g,t,SUCK+0.15,0.25)},
 sfx:()=>[[0.1,'pop'],[2.2,'pop'],[3.0,'ding']]},

/* ---------------- 2 事情一多：通知越堆越多，回访那条被挤掉 ---------------- */
busy:{bg:INK,
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="position:absolute;left:-60px;top:-60px;width:1200px;height:2040px;object-fit:cover;transform-origin:60% 40%">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,10,20,.55),rgba(8,10,20,.35) 40%,rgba(8,10,20,.92) 78%)"></div>
  <div class="v-st" id="${id}st">
  ${sc.chips.map((c,i)=>`<div class="v-chip" id="${id}c${i}"><span class="k">${H.fmt(c[0])}</span><span class="x">${H.fmt(c[1])}</span></div>`).join('')}
  <div class="v-chip hot" id="${id}lost"><span class="k">${H.fmt(sc.lost[0])}</span><span class="x">${H.fmt(sc.lost[1])}</span></div>
  <div class="v-stamp" id="${id}stamp" style="left:640px;top:250px">${H.fmt(sc.stamp)}</div>
  <div class="v-a v-t" id="${id}a" style="left:80px;top:1150px;font-size:116px">${H.fmt(sc.line1)}</div>
  <div class="v-a v-t v-acc" id="${id}b" style="left:80px;top:1285px;font-size:140px">${H.fmt(sc.line2)}</div>
 </div>`+FX(id),
 init:(sc,id)=>{['a','b'].forEach(k=>M().split(document.getElementById(id+k)))},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$;const D=H.dur;
  MO.set($(id+'img'),{s:1.06+0.12*MO.prog(t,0,D),x:-30*MO.prog(t,0,D)+MO.wob(t,3,10,0.3),y:20*MO.prog(t,0,D)});
  stage($(id+'st'),t,D,{push:0.03,seed:6});
  // 通知一条条从顶部压下来，越来越快；每来一条，下面的都被往下推
  const at=[0.25,0.75,1.15,1.5,1.8,2.05];const LOST=1.6,DROP=3.55;
  const arrivals=[...at.map((a,i)=>({a,el:$(id+'c'+i)})),{a:LOST,el:$(id+'lost'),lost:true}].sort((x,y)=>x.a-y.a);
  arrivals.forEach((it,k)=>{const after=arrivals.filter((o,j)=>j>k&&t>=o.a).length;   // 在它之后到的条数 = 它被往下推了几格
   const p=MO.spring(t-it.a,1.4,7);let y=170+after*138 - 170*(1-Math.min(1,p));let x=MO.wob(t,k*5,6,0.5),r=0,o=MO.tw(t,it.a,0.15);
   if(it.lost){ // 被挤掉：先抖，再翻滚着掉出画面
    const sh=MO.prog(t,DROP-0.6,DROP);x+=Math.sin(t*50)*14*sh;const d=Math.max(0,t-DROP);x+=d*420;y+=d*d*1600;r=d*70;
    it.el.style.boxShadow=`0 0 ${(40*sh).toFixed(0)}px rgba(255,77,26,.8),0 24px 50px rgba(0,0,0,.5)`}
   MO.set(it.el,{x,y,r,o,s:1+0.04*Math.max(0,1-(t-it.a)*4)})});
  const st=$(id+'stamp');const sp=MO.prog(t,DROP+0.15,DROP+0.45);MO.set(st,{s:MO.lerp(2.6,1,MO.E.outBackBig(sp)),r:-14+MO.wob(t,8,2,0.8),o:sp>0?1:0});
  MO.textIn($(id+'a')._chars,t,2.6,{stagger:0.06,dur:0.45,from:{x:-80,blur:12,o:0}});
  const b=$(id+'b')._chars;MO.textIn(b,t,DROP-0.1,{stagger:0.07,dur:0.5,from:{y:120,s:1.4,blur:14,o:0},e:'outBackBig'});
  // "漏"字发抖
  if(t>DROP+0.3)b.forEach((c,i)=>{if(i===3)c.style.transform+=` rotate(${(Math.sin(t*30)*6).toFixed(2)}deg) translateY(${(Math.abs(Math.sin(t*12))*-10).toFixed(1)}px)`});
  const g=fx(id);MO.burst(g,t,DROP+0.15,820,330,{n:26,seed:9,colors:[ACC,'#fff'],speed:[300,800],life:1.0});MO.ring(g,t,DROP+0.15,820,330,{r1:380})},
 sfx:()=>[[0.25,'tick'],[0.75,'tick'],[1.15,'tick'],[1.5,'tick'],[1.8,'tick'],[2.05,'tick'],[3.7,'pop']]},

/* ---------------- 3 回访助手：中心核心 + 两路数据流 ---------------- */
core:{bg:INK,
 build:(sc,id,H)=>B(id)+`<div class="v-st" id="${id}st">
  <div class="v-a v-t" id="${id}hd" style="left:0;right:0;top:175px;text-align:center;font-size:128px">${H.fmt(sc.head)}</div>
  <div class="v-a" id="${id}rays" style="left:240px;top:400px;width:600px;height:600px;border-radius:50%;background:conic-gradient(from 0deg,rgba(255,77,26,0),rgba(255,77,26,.35),rgba(255,77,26,0) 25%,rgba(255,201,77,.25) 50%,rgba(255,77,26,0) 75%);filter:blur(20px)"></div>
  <svg class="v-a" id="${id}orb" style="left:290px;top:450px" width="500" height="500" viewBox="0 0 500 500"><circle cx="250" cy="250" r="230" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3" stroke-dasharray="10 18"/><circle cx="250" cy="250" r="200" fill="none" stroke="${ACC}" stroke-width="5" stroke-dasharray="120 60 30 60" stroke-linecap="round"/></svg>
  <div class="v-a v-ic" id="${id}ic" style="left:400px;top:560px;width:280px;height:280px">${listIc(190)}</div>
  <div class="v-a" id="${id}lb" style="left:0;right:0;top:880px;text-align:center"><span class="v-pill" style="background:#fff;color:#111;font-size:44px">${H.fmt(sc.app)}<span style="background:${ACC};color:#fff;border-radius:999px;padding:4px 16px;font-size:30px">${H.fmt(sc.badge)}</span></span></div>
  <div class="v-a v-glass v-feat" id="${id}f1" style="left:70px;top:1010px"><div class="h">${H.fmt(sc.f1[0])}<br><b>${H.fmt(sc.f1[1])}</b></div><div class="v-mini" id="${id}m1">${[0,1,2,3].map(k=>`<div class="v-bar" id="${id}b${k}" style="width:${[300,220,260,180][k]}px;background:${k===0?ACC:'rgba(255,255,255,.35)'}"></div>`).join('')}</div></div>
  <div class="v-a v-glass v-feat" id="${id}f2" style="left:580px;top:1010px"><div class="h">${H.fmt(sc.f2[0])}<br><b>${H.fmt(sc.f2[1])}</b></div><div class="v-mini" id="${id}m2">
   <div class="v-box" style="left:110px;top:70px;width:200px;height:110px;background:#E9A23B"></div>
   ${[0,1,2].map(k=>`<div class="v-box" id="${id}d${k}" style="left:135px;top:0;width:150px;height:90px;background:${PAPER};box-shadow:0 6px 12px rgba(0,0,0,.3)"></div>`).join('')}
   <div class="v-box" style="left:100px;top:110px;width:220px;height:90px;background:#F5B54A"></div></div></div>
 </div>`+FX(id),
 init:(sc,id)=>M().split(document.getElementById(id+'hd')),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$;bg(MO.canvas($(id+'bg')),t,H.T,{seed:1});stage($(id+'st'),t,H.dur,{seed:11});
  const ip=MO.spring(t-0.15,1.3,5);MO.set($(id+'ic'),{s:Math.max(0,ip),r:(1-Math.min(1,ip))*-30+MO.wob(t,4,3,0.5),y:MO.wob(t,5,10,0.6)});
  MO.set($(id+'orb'),{r:t*40,s:MO.tw(t,0.25,0.6,'outBack')});MO.set($(id+'rays'),{r:-t*25,s:0.8+0.2*MO.tw(t,0.2,0.6)+0.05*Math.sin(t*3),o:MO.tw(t,0.2,0.5)});
  MO.set($(id+'lb'),{y:40*(1-MO.tw(t,0.55,0.4,'outBack')),o:MO.tw(t,0.55,0.2)});
  const F1=1.35,F2=2.35;
  [[F1,'f1',-1],[F2,'f2',1]].forEach(([a,k,s])=>{const p=MO.tw(t,a,0.6,'outBack');MO.set($(id+k),{x:s*500*(1-p),ry:s*-50*(1-p),y:MO.wob(t,a*10,8,0.5),o:MO.tw(t,a,0.2)})});
  // 名单整理：四条乱序条持续重排（冒泡排序的样子）
  const order=[[2,0,3,1],[0,2,1,3],[0,1,2,3]];const ph=Math.max(0,t-F1-0.3);const st=Math.min(2,Math.floor(ph/0.55));const sp=MO.E.inOutC(MO.prog(ph-st*0.55,0,0.4));
  [0,1,2,3].forEach(k=>{const a=order[Math.max(0,st-1)][k]??k,b=order[st][k];const from=st===0?order[0][k]:a;const y=22+MO.lerp(from,b,st===0?1:sp)*46;
   MO.set($(id+'b'+k),{y,x:Math.sin(t*3+k)*4})});
  // 信息归档：卡片一张张落进文件夹，循环
  [0,1,2].forEach(k=>{const u=((t-F2-0.2-k*0.35)%1.05+1.05)%1.05;const live=t>F2+0.2+k*0.35;const y=MO.lerp(-100,90,MO.E.inC(Math.min(1,u/0.7)));
   MO.set($(id+'d'+k),{y,r:(k-1)*6*(1-u),o:live?1-MO.prog(u,0.75,1):0})});
  MO.textIn($(id+'hd')._chars,t,3.1,{stagger:0.07,dur:0.5,from:{y:-90,s:1.5,blur:12,o:0},e:'outBackBig'});
  const g=fx(id);MO.ring(g,t,0.2,540,700,{r1:560});MO.stream(g,t,470,820,290,1080,{seed:3,bend:-120,speed:0.9});MO.stream(g,t,610,820,790,1080,{seed:7,bend:120,speed:0.9,color:'255,201,77'});
  MO.burst(g,t,3.25,540,250,{n:30,seed:13,speed:[300,800],life:1.1})},
 sfx:()=>[[0.2,'pop'],[1.35,'tick'],[2.35,'tick'],[3.1,'ding']]},

/* ---------------- 4 中段悬念：上锁的神秘卡 ---------------- */
tease:{bg:INK,
 build:(sc,id,H)=>B(id)+`<div class="v-st" id="${id}st">
  <div class="v-a v-t" id="${id}a" style="left:0;right:0;top:175px;text-align:center;font-size:110px">${H.fmt(sc.line1)}</div>
  <div class="v-a v-t v-acc" id="${id}b" style="left:0;right:0;top:300px;text-align:center;font-size:170px">${H.fmt(sc.line2)}</div>
  <div class="v-a" id="${id}rays" style="left:90px;top:440px;width:900px;height:900px;border-radius:50%;background:repeating-conic-gradient(rgba(255,201,77,.22) 0 8deg,rgba(255,201,77,0) 8deg 22deg);-webkit-mask:radial-gradient(circle,#000 20%,transparent 68%)"></div>
  <div class="v-a" id="${id}card" style="left:280px;top:540px;width:520px;height:660px;border-radius:52px;background:linear-gradient(150deg,#2a2f4a,#141829);border:4px solid rgba(255,201,77,.6);box-shadow:0 0 90px rgba(255,77,26,.45),0 50px 90px rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;overflow:hidden">
   <div class="v-q" id="${id}q">?</div><div id="${id}sh" style="position:absolute;inset:0"></div>
   <svg style="position:absolute;bottom:40px" width="90" height="90" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="${GOLD}"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="${GOLD}" stroke-width="2.4" fill="none"/></svg></div>
  <div class="v-a" id="${id}lt" style="left:80px;top:1270px"><span class="v-pill" style="background:rgba(255,255,255,.1);color:#fff;border:2px solid rgba(255,255,255,.25)">${H.fmt(sc.later)} <b id="${id}ar" style="display:inline-block;color:${ACC}">→</b></span></div>
 </div>`+FX(id),
 init:(sc,id)=>{['a','b'].forEach(k=>M().split(document.getElementById(id+k)))},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$;bg(MO.canvas($(id+'bg')),t,H.T,{seed:1,hue:[255,140,40]});stage($(id+'st'),t,H.dur,{push:0.07,seed:21});
  MO.textIn($(id+'a')._chars,t,0.1,{stagger:0.06,dur:0.4,from:{y:60,blur:10,o:0}});
  const b=$(id+'b')._chars;MO.textIn(b,t,0.55,{stagger:0.09,dur:0.55,from:{s:3,blur:20,o:0},e:'outBackBig'});if(t>1.3)MO.textWave(b,t,{amp:8,from:1.3,speed:3});
  const cp=MO.spring(t-0.3,1.2,5);MO.set($(id+'card'),{s:Math.max(0,cp),ry:MO.wob(t,6,22,0.45)+(1-Math.min(1,cp))*120,rx:MO.wob(t,8,8,0.4),y:MO.wob(t,9,14,0.5)});
  MO.set($(id+'q'),{s:1+0.08*Math.sin(t*6),r:Math.sin(t*2.5)*6});MO.sheen($(id+'sh'),(t*0.8)%1.4/1.4*1.3,{w:12,color:'rgba(255,255,255,.35)'});
  MO.set($(id+'rays'),{r:t*30,s:0.9+0.1*Math.sin(t*2),o:MO.tw(t,0.3,0.5)*0.9});
  MO.set($(id+'lt'),{x:-60*(1-MO.tw(t,1.2,0.4,'outBack')),o:MO.tw(t,1.2,0.25)});MO.set($(id+'ar'),{x:Math.abs(Math.sin(t*5))*16});
  const g=fx(id);MO.dust(g,t,{n:26,seed:77,color:'255,201,77',size:[3,7],alpha:[.3,.9],speed:-60,drift:60,w:1080,h:1920});MO.ring(g,t,0.35,540,870,{r1:600,color:'255,201,77'})},
 sfx:()=>[[0.55,'pop']]},

/* ---------------- 5 实录槽位（示意）：手机里零散消息 → 结构化名单，右侧资料归档 ---------------- */
phone:{bg:INK,
 build:(sc,id,H)=>B(id)+`<div class="v-st" id="${id}st">
  <div class="v-a" id="${id}ln" style="left:70px;top:170px"><span class="v-pill" style="background:rgba(255,255,255,.1);color:#fff;border:2px solid rgba(255,255,255,.2);font-size:40px">${H.fmt(sc.line)}</span></div>
  <div class="v-a v-phone" id="${id}ph" style="left:60px;top:270px">
   <div style="position:absolute;left:0;right:0;top:0;height:150px;background:linear-gradient(180deg,#1b1f31,#12152200);padding:60px 36px 0;color:#fff;font-size:44px;font-weight:900">${H.fmt(sc.app)}</div>
   <div class="v-shi">示意</div>
   ${sc.msgs.map((m,i)=>`<div class="v-msg" id="${id}m${i}">${H.fmt(m)}</div>`).join('')}
   <div style="position:absolute;left:28px;right:28px;bottom:40px;height:150px;border-radius:26px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);padding:24px 26px">
    <div id="${id}pt" style="color:#fff;font-size:34px;font-weight:800">${H.fmt(sc.progress[0])}</div>
    <div style="margin-top:20px;height:22px;border-radius:11px;background:rgba(255,255,255,.12);overflow:hidden"><div id="${id}pf" style="height:100%;width:100%;border-radius:11px;background:linear-gradient(90deg,${MINT},#9BF0C6);transform-origin:left"></div></div></div>
   ${sc.rows.map((r,i)=>`<div class="v-lrow" id="${id}r${i}"><div class="v-av" style="width:66px;height:66px;background:${AVC[i]}">${r[0][0]}</div>${H.fmt(r[0])}<span style="margin-left:auto;display:flex;gap:10px"><i id="${id}ta${i}">${H.fmt(r[1])}</i><i id="${id}tb${i}">${H.fmt(r[2])}</i></span></div>`).join('')}
  </div>
  <div class="v-a" id="${id}ar" style="left:690px;top:520px;width:330px;color:#fff;font-size:44px;font-weight:900;text-align:center">${H.fmt(sc.archive)}</div>
  <div class="v-a" id="${id}fd" style="left:705px;top:1010px;width:300px;height:220px;border-radius:30px;background:linear-gradient(180deg,#F5B54A,#E39A2E);box-shadow:0 30px 60px rgba(0,0,0,.45)"></div>
  ${sc.files.map((f,i)=>`<div class="v-file" id="${id}f${i}" style="left:710px;top:600px">${H.fmt(f)}<small>资料已归档 ✓</small></div>`).join('')}
  <div class="v-a" style="left:690px;top:1080px;width:330px;height:170px;border-radius:30px;background:linear-gradient(180deg,#FFC45E,#F0A33A);box-shadow:inset 0 3px 0 rgba(255,255,255,.4)"></div>
 </div>`+FX(id),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$;bg(MO.canvas($(id+'bg')),t,H.T,{seed:1,hue2:[60,200,140]});stage($(id+'st'),t,H.dur,{push:0.04,seed:31});
  MO.set($(id+'ph'),{y:200*(1-MO.tw(t,0,0.6,'outBack'))+MO.wob(t,3,8,0.4),ry:8*(1-MO.tw(t,0,0.8))+MO.wob(t,4,3,0.3),r:MO.wob(t,5,0.8,0.3)});
  MO.set($(id+'ln'),{x:-40*(1-MO.tw(t,0.2,0.4,'outBack')),o:MO.tw(t,0.2,0.2)});
  // 消息一条条进来，随后"折叠"成结构化名单行
  sc.msgs.forEach((_,i)=>{const a=0.3+i*0.35;const fold=1.55+i*0.3;const p=MO.tw(t,a,0.35,'outBack');const q=MO.tw(t,fold,0.35,'inC');
   MO.set($(id+'m'+i),{x:-40*(1-p),y:190+i*120,o:Math.min(1,p*2)*(1-q),s:1-0.3*q,blur:q*8})});
  sc.rows.forEach((_,i)=>{const fold=1.55+i*0.3;const p=MO.tw(t,fold+0.2,0.45,'outBack');MO.set($(id+'r'+i),{y:190+i*140+30*(1-p),o:MO.tw(t,fold+0.2,0.2),s:0.9+0.1*p});
   MO.set($(id+'ta'+i),{s:MO.ease('outBackBig')(MO.prog(t,fold+0.55,fold+0.85))});MO.set($(id+'tb'+i),{s:MO.ease('outBackBig')(MO.prog(t,fold+0.7,fold+1.0))})});
  const pp=MO.tw(t,0.4,2.6,'inOutQ');$(id+'pf').style.transform=`scaleX(${pp.toFixed(3)})`;MO.sheen($(id+'pf'),(t*1.2)%1,{w:18,color:'rgba(255,255,255,.7)'});
  const done=t>3.05;$(id+'pt').textContent=done?sc.progress[1]+' ✓':sc.progress[0];$(id+'pt').style.color=done?MINT:'#fff';MO.set($(id+'pt'),{s:1+0.1*Math.sin(MO.prog(t,3.05,3.35)*Math.PI)});
  // 右侧：资料卡依次飞进文件夹
  MO.set($(id+'ar'),{y:MO.wob(t,6,6,0.5),o:MO.tw(t,0.5,0.3)});MO.set($(id+'fd'),{o:MO.tw(t,0.4,0.3)});
  sc.files.forEach((_,i)=>{const a=1.9+i*0.45;const u=MO.prog(t,a,a+0.75);const x=MO.lerp(-320,0,MO.E.outC(Math.min(1,u*1.6)));const y=MO.kf(u,[[0,140+i*140],[0.55,40,'outC'],[1,400,'inC']]);
   MO.set($(id+'f'+i),{x,y,r:MO.lerp(-14,0,u)+MO.wob(t,i,2,0.6),o:u>0?(u<0.95?1:1-MO.prog(u,0.95,1)):0,s:1-0.25*MO.prog(u,0.6,1)})});
  const g=fx(id);MO.stream(g,t,560,700,760,640,{seed:5,bend:-60,speed:1.1,color:'91,214,155',n:12});
  [0,1,2].forEach(i=>MO.ring(g,t,1.9+i*0.45+0.7,855,1100,{r1:220,width:8,color:'255,201,77',life:0.6}))},
 sfx:()=>[[0.3,'tick'],[0.65,'tick'],[1.0,'tick'],[2.6,'pop'],[3.05,'pop'],[3.5,'pop']]},

/* ---------------- 6 揭晓：神秘卡翻开 → 到期提醒 → 省下的时间流向选品、运营 ---------------- */
reveal:{bg:INK,
 build:(sc,id,H)=>B(id)+`<div class="v-st" id="${id}st">
  <div class="v-a v-t" id="${id}h1" style="left:0;right:0;top:170px;text-align:center;font-size:110px">${H.fmt(sc.head1)}<span class="v-acc">${H.fmt(sc.head2)}</span></div>
  <div class="v-a" id="${id}sub" style="left:0;right:0;top:310px;text-align:center"><span class="v-pill" style="background:rgba(255,255,255,.1);color:#d9dcef;font-size:34px">${H.fmt(sc.sub)}</span></div>
  <div class="v-a" id="${id}flip" style="left:110px;top:420px;width:860px;height:900px;transform-style:preserve-3d">
   <div id="${id}back" style="position:absolute;inset:0;border-radius:56px;background:linear-gradient(150deg,#2a2f4a,#141829);border:4px solid rgba(255,201,77,.6);display:flex;align-items:center;justify-content:center;backface-visibility:hidden"><div class="v-q" style="font-size:380px">?</div></div>
   <div id="${id}front" class="v-glass" style="position:absolute;inset:0;padding:44px;backface-visibility:hidden;transform:rotateY(180deg);display:flex;flex-direction:column;gap:22px;background:linear-gradient(160deg,rgba(40,46,74,.96),rgba(18,21,36,.96))">
    <div style="display:flex;align-items:center;gap:26px;height:150px"><div class="v-ic" id="${id}bell" style="width:130px;height:130px;border-radius:36px;transform-origin:50% 15%">${bell(84)}</div><div class="v-t" style="font-size:66px;letter-spacing:0">${H.fmt(sc.bell)}</div></div>
    ${sc.items.map((it,i)=>`<div class="v-rem" id="${id}it${i}"><div class="v-av" style="background:${AVC[i]}">${it[0][0]}</div><div>${H.fmt(it[0])}<br><small>${H.fmt(it[1])}</small></div><span class="v-st2" id="${id}s${i}" style="background:rgba(255,201,77,.18);color:${GOLD}">${H.fmt(sc.pending)}</span></div>`).join('')}
    <div class="v-btn" id="${id}btn" style="margin-top:auto">${ck(54,'#fff')}<span id="${id}bt">${H.fmt(sc.button)}</span></div>
   </div></div>
  <div class="v-a v-t" id="${id}sv" style="left:0;right:0;top:170px;text-align:center;font-size:150px">${H.fmt(sc.save)}</div>
  <svg class="v-a" id="${id}clk" style="left:340px;top:390px" width="400" height="400" viewBox="0 0 200 200"><circle cx="100" cy="100" r="88" fill="rgba(255,255,255,.08)" stroke="#fff" stroke-width="8"/>${Array.from({length:12},(_,k)=>`<line x1="100" y1="22" x2="100" y2="34" stroke="rgba(255,255,255,.6)" stroke-width="5" stroke-linecap="round" transform="rotate(${k*30} 100 100)"/>`).join('')}<line id="${id}hh" x1="100" y1="100" x2="100" y2="58" stroke="#fff" stroke-width="10" stroke-linecap="round"/><line id="${id}mh" x1="100" y1="100" x2="100" y2="34" stroke="${ACC}" stroke-width="7" stroke-linecap="round"/><circle cx="100" cy="100" r="9" fill="${ACC}"/></svg>
  ${sc.goals.map((x,i)=>`<div class="v-a v-goal v-glass" id="${id}g${i}" style="left:${i?590:90}px;top:950px;background:${i?'linear-gradient(160deg,rgba(91,141,239,.45),rgba(30,40,80,.6))':'linear-gradient(160deg,rgba(255,77,26,.5),rgba(80,25,10,.6))'}"><div style="width:130px;height:130px">${i?chartIc:bagIc}</div>${H.fmt(x)}</div>`).join('')}
 </div>`+FX(id),
 init:(sc,id)=>{['h1','sv'].forEach(k=>M().split(document.getElementById(id+k)))},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$;bg(MO.canvas($(id+'bg')),t,H.T,{seed:1});stage($(id+'st'),t,H.dur,{push:0.03,seed:41});
  const FLIP=0.42,PRESS=2.75,B2=3.55;   // B2：第二拍"省下时间"
  const fp=MO.tw(t,FLIP,0.75,'inOutC');const out=MO.tw(t,B2-0.35,0.5,'inBack');
  MO.set($(id+'flip'),{ry:180*fp+MO.wob(t,3,4,0.4)*(fp>=1?1:0),s:(1+0.08*Math.sin(fp*Math.PI))*(1-0.75*out),y:-560*out+MO.wob(t,4,8,0.5),o:1-MO.prog(out,0.6,1)});
  MO.set($(id+'bell'),{r:Math.sin(t*16)*16*Math.max(0,1-Math.abs(t-1.3)/0.9)+Math.sin(t*3)*3});
  sc.items.forEach((_,i)=>{const a=1.0+i*0.28;const p=MO.tw(t,a,0.45,'outBack');MO.set($(id+'it'+i),{x:160*(1-p),o:MO.tw(t,a,0.2)});
   const dn=t>PRESS+0.12+i*0.1;const s=$(id+'s'+i);s.textContent=dn?sc.done:sc.pending;s.style.background=dn?'rgba(91,214,155,.2)':'rgba(255,201,77,.18)';s.style.color=dn?MINT:GOLD;
   MO.set(s,{s:1+0.25*Math.sin(MO.prog(t,PRESS+0.12+i*0.1,PRESS+0.4+i*0.1)*Math.PI)})});
  const press=MO.prog(t,PRESS-0.15,PRESS)-MO.prog(t,PRESS,PRESS+0.2);MO.set($(id+'btn'),{s:1-0.07*press+0.02*Math.sin(t*5)*(t<PRESS?1:0),o:MO.tw(t,1.9,0.3)});
  const h1=$(id+'h1')._chars;MO.textIn(h1,t,0.9,{stagger:0.06,dur:0.45,from:{y:-70,blur:10,o:0}});MO.textOut(h1,t,B2-0.4,{stagger:0.02});
  MO.set($(id+'sub'),{o:MO.tw(t,1.5,0.3)*(1-MO.tw(t,B2-0.4,0.3)),y:20*(1-MO.tw(t,1.5,0.4))});
  // 第二拍：时钟飞转，时间流向两块目标
  const sv=$(id+'sv')._chars;MO.textIn(sv,t,B2,{stagger:0.07,dur:0.5,from:{s:2.4,blur:16,o:0},e:'outBackBig'});if(t>B2+0.8)MO.textWave(sv,t,{amp:6,from:B2+0.8});
  const cp=MO.spring(t-B2-0.1,1.3,6);MO.set($(id+'clk'),{s:Math.max(0,cp)*(1+0.03*Math.sin(t*4)),r:MO.wob(t,7,3,0.5)});
  const spin=Math.max(0,t-B2-0.1);$(id+'mh').setAttribute('transform',`rotate(${(spin*spin*260+spin*400)%360} 100 100)`);$(id+'hh').setAttribute('transform',`rotate(${(spin*spin*22+spin*35)%360} 100 100)`);
  sc.goals.forEach((_,i)=>{const a=B2+0.9+i*0.3;const p=MO.spring(t-a,1.2,6);MO.set($(id+'g'+i),{s:Math.max(0,p),y:MO.wob(t,i+20,10,0.6)+60*(1-Math.min(1,p)),r:(i?4:-4)*(1-Math.min(1,p))+MO.wob(t,i+30,1.5,0.5)})});
  const g=fx(id);flash(g,t,FLIP+0.38,0.3);MO.ring(g,t,FLIP+0.38,540,870,{r1:800,width:16,color:'255,201,77'});MO.burst(g,t,FLIP+0.4,540,870,{n:50,seed:21,speed:[500,1300],life:1.4});
  MO.burst(g,t,PRESS,540,1220,{n:28,seed:31,colors:[MINT,'#fff',GOLD],speed:[300,800],life:1.0});
  if(t>B2+1.0){MO.stream(g,t,480,640,290,1000,{seed:9,bend:-80,speed:1.2,n:16});MO.stream(g,t,600,640,790,1000,{seed:12,bend:80,speed:1.2,n:16,color:'91,141,239'})}},
 sfx:()=>[[0.6,'ding'],[1.0,'tick'],[1.28,'tick'],[1.56,'tick'],[2.75,'ding'],[3.6,'pop'],[4.45,'pop'],[4.75,'pop']]},

/* ---------------- 7 转化：礼盒打开 → 关注 → 评论区打字发关键词 ---------------- */
cta:{bg:INK,
 build:(sc,id,H)=>B(id)+`<div class="v-st" id="${id}st">
  <div class="v-a v-t" id="${id}tt" style="left:0;right:0;top:175px;text-align:center;font-size:140px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:340px;top:480px;width:400px;height:400px">
   <div class="v-a v-ic" id="${id}app" style="left:90px;top:40px;width:220px;height:220px;border-radius:56px">${listIc(150)}</div>
   <div class="v-box" style="left:20px;top:170px;width:360px;height:230px;background:linear-gradient(180deg,${ACC},#C9300B)"></div>
   <div class="v-box" style="left:175px;top:170px;width:50px;height:230px;border-radius:0;background:${GOLD}"></div>
   <div class="v-box" id="${id}lid" style="left:0;top:120px;width:400px;height:80px;border-radius:20px;background:linear-gradient(180deg,#FF7A45,${ACC});transform-origin:20% 100%"><div style="position:absolute;left:175px;top:0;width:50px;height:80px;background:${GOLD}"></div></div>
  </div>
  <div class="v-a v-btn" id="${id}fo" style="left:70px;top:950px;width:560px">＋ <span id="${id}fot">${H.fmt(sc.follow)}</span></div>
  <div class="v-a v-input" id="${id}in" style="left:70px;top:1130px;width:560px"><span style="color:#888;font-size:38px;margin-right:10px">${H.fmt(sc.comment_hint)}</span><span id="${id}ty"></span><span class="v-car" id="${id}car"></span></div>
  <div class="v-a v-pill" id="${id}sent" style="left:90px;top:1130px;background:#fff;color:#111;font-size:52px;box-shadow:0 20px 40px rgba(0,0,0,.35)">💬 「${H.fmt(sc.keyword)}」</div>
  <svg class="v-a" id="${id}hand" style="left:0;top:0" width="110" height="110" viewBox="0 0 24 24"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10l4.6.9a2 2 0 0 1 1.6 2.3l-.9 5A3 3 0 0 1 14.4 21H11a3 3 0 0 1-2.4-1.2L5.2 15a1.5 1.5 0 0 1 2.3-1.9L9 14.5" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>
 </div>`+FX(id),
 init:(sc,id)=>M().split(document.getElementById(id+'tt')),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$;bg(MO.canvas($(id+'bg')),t,H.T,{seed:1});stage($(id+'st'),t,H.dur,{push:0.04,seed:51});
  const OPEN=0.75,FOL=2.0,TYP=2.75,SEND=3.6;
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp),y:MO.wob(t,3,10,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:0),r:t<OPEN?Math.sin(t*20)*4:MO.wob(t,4,2,0.4)});
  const lo=MO.tw(t,OPEN,0.5,'outC');MO.set($(id+'lid'),{y:-220*lo+MO.lerp(0,520,MO.E.inQ(MO.prog(t,OPEN+0.2,OPEN+1.2))),x:180*lo,r:-50*lo-80*MO.prog(t,OPEN+0.2,OPEN+1.2),o:1-MO.prog(t,OPEN+0.9,OPEN+1.2)});
  const ap=MO.spring(t-OPEN-0.1,1.1,5);MO.set($(id+'app'),{y:-120*Math.max(0,ap)+MO.wob(t,8,8,0.6),s:0.5+0.5*Math.max(0,Math.min(1.2,ap)),r:MO.wob(t,9,6,0.5)});
  const tt=$(id+'tt')._chars;MO.textIn(tt,t,0.9,{stagger:0.07,dur:0.5,from:{y:100,s:1.4,blur:14,o:0},e:'outBackBig'});if(t>1.7)MO.textWave(tt,t,{amp:6,from:1.7});
  // 关注按钮：出现 → 手指点 → 变成已关注
  const fo=$(id+'fo');const press=MO.prog(t,FOL-0.12,FOL)-MO.prog(t,FOL,FOL+0.18);const done=t>FOL;
  MO.set(fo,{x:-500*(1-MO.tw(t,1.35,0.5,'outBack')),s:1-0.08*press+(done?0:0.03*Math.sin(t*7)),o:MO.tw(t,1.35,0.2)});
  fo.style.background=done?'#2a2f45':ACC;$(id+'fot').textContent=done?sc.followed:sc.follow;fo.firstChild.textContent=done?'✓ ':'＋ ';
  // 评论框打字
  const inp=$(id+'in');MO.set(inp,{x:-500*(1-MO.tw(t,2.3,0.5,'outBack')),o:MO.tw(t,2.3,0.2)*(1-MO.tw(t,SEND,0.15)),s:1-0.04*(MO.prog(t,SEND-0.1,SEND))});
  $(id+'ty').textContent=MO.typed(sc.keyword,t,TYP,5);$(id+'car').style.opacity=(Math.floor(t*3)%2||t<TYP)?1:0;
  const se=MO.tw(t,SEND,0.7,'outC');MO.set($(id+'sent'),{y:-se*24+MO.wob(t,11,6,0.6)*(se>=1?1:0),s:MO.lerp(0.8,1.15,MO.E.outBack(se)),o:t>SEND?1:0});
  // 手指：飞到关注按钮点一下，再到评论框
  const hx=MO.kf(t,[[1.4,900],[FOL-0.15,520,'inOutC'],[FOL+0.4,520],[TYP-0.2,560,'inOutC'],[SEND-0.15,580],[SEND+0.4,1000,'inC']]);
  const hy=MO.kf(t,[[1.4,1350],[FOL-0.15,1030,'inOutC'],[FOL+0.4,1030],[TYP-0.2,1210,'inOutC'],[SEND-0.15,1210],[SEND+0.4,1550,'inC']]);
  MO.set($(id+'hand'),{x:hx,y:hy,s:1-0.15*press-0.15*(MO.prog(t,SEND-0.2,SEND-0.05)-MO.prog(t,SEND-0.05,SEND+0.1)),o:MO.tw(t,1.4,0.2)*(1-MO.tw(t,SEND+0.2,0.2))});
  const g=fx(id);MO.burst(g,t,OPEN,540,640,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,640,{r1:700,width:14,color:'255,201,77'});flash(g,t,OPEN,0.25,'255,201,77');
  MO.ring(g,t,FOL,350,1015,{r1:300,width:8});MO.burst(g,t,SEND,350,1100,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.75,'ding'],[2.0,'pop'],[2.75,'tick'],[2.95,'tick'],[3.6,'pop']]},

/* ---------------- 落版：韬行科技 ---------------- */
outro:{dur:2.4,bg:INK,
 build:(sc,id,H)=>B(id)+`<div class="v-st" id="${id}st">
  <div class="v-a" id="${id}lg" style="left:390px;top:300px;width:300px;height:300px">${H.BRAND_LOGO(id+'L')}</div>
  <div class="v-a v-t" id="${id}nm" style="left:0;right:0;top:650px;text-align:center;font-size:130px">${H.BRAND.name}</div>
  <div class="v-a" id="${id}en" style="left:0;right:0;top:820px;text-align:center;color:#aab0c8;font-size:34px;font-weight:700;letter-spacing:4px">${H.BRAND.en} · ${H.BRAND.tagline}</div>
 </div>`+FX(id),
 init:(sc,id)=>M().split(document.getElementById(id+'nm')),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$;bg(MO.canvas($(id+'bg')),t,H.T,{seed:1,grid:false});
  MO.set($(id+'st'),{s:1.08-0.08*MO.tw(t,0,0.5,'outE')+0.03*MO.prog(t,0,H.dur),blur:10*(1-MO.tw(t,0,0.35)),o:MO.tw(t,0,0.25)});
  const lp=MO.spring(t-0.05,1.2,6);MO.set($(id+'lg'),{s:Math.max(0,lp),r:(1-Math.min(1,lp))*-40+MO.wob(t,2,3,0.6),y:MO.wob(t,3,8,0.6)});
  $(id+'Lp').style.strokeDashoffset=(1-MO.tw(t,0.2,0.6,'outC')).toFixed(3);
  for(let k=0;k<3;k++)$(id+'Ln'+k).style.transform=`scale(${MO.ease('outBack')(MO.prog(t,0.2+k*0.12,0.5+k*0.12)).toFixed(3)})`;
  const sp=MO.prog(t,0.65,1.05);$(id+'Ls').style.transform=`scale(${(MO.E.outBack(sp)*(1+0.12*Math.sin(t*6)*(sp>=1?1:0))).toFixed(3)}) rotate(${((1-MO.E.outC(sp))*-180+t*30).toFixed(1)}deg)`;
  MO.textIn($(id+'nm')._chars,t,0.4,{stagger:0.08,dur:0.45,from:{y:70,blur:10,o:0}});if(t>1.2)MO.textWave($(id+'nm')._chars,t,{amp:5,from:1.2});
  MO.set($(id+'en'),{o:MO.tw(t,0.8,0.4)*0.9,y:20*(1-MO.tw(t,0.8,0.4))});
  const g=fx(id);MO.ring(g,t,0.7,540,450,{r1:520,color:'255,201,77'});MO.ring(g,t,1.4,540,450,{r1:520,width:6});MO.glow(g,540,450,300+20*Math.sin(t*4),'rgba(255,77,26,0.25)')},
 sfx:()=>[[0.7,'ding']]},
};
})();
