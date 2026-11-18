/* 2026-11-17-s2-a 商品资料检查 · 专属画面。色调：墨绿 + 企鹅橙（表格、检查的冷静感）。
   主线：几千行表格滚个不停、红格乱闪 → 错误一路蔓延到全店 → 表格丢进扫描框逐行标出 → 实录 → 人眼会漏 vs 规则不漏 → 先统一格式。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I}=K;
const BG={seed:2,hue:[40,200,140],hue2:[255,77,26],hue3:[120,230,200],base:['#0f2420','#0a1714','#050c0a']};
const css=`
.b-grid{position:absolute;left:0;top:0;width:1400px;transform-origin:50% 0}
.b-row{position:absolute;left:0;height:64px;width:1400px;display:flex}
.b-c{flex:none;height:64px;border-right:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;padding:0 14px;font-size:24px;color:#9fbab0;font-weight:600;overflow:hidden;white-space:nowrap}
.b-c.no{width:110px;color:#5f8075;font-family:"DejaVu Sans Mono",monospace;justify-content:flex-end}
.b-c.bad{background:rgba(255,77,26,.55);color:#fff}
.b-err{display:flex;align-items:center;gap:24px;height:150px;padding:0 36px;border-radius:36px;background:rgba(20,28,26,.88);border:3px solid rgba(255,77,26,.7);box-shadow:0 30px 60px rgba(0,0,0,.5);color:#fff;font-size:56px;font-weight:900;white-space:nowrap}
.b-err small{font-size:32px;color:#ffb49a;font-weight:700;margin-left:auto;font-family:"DejaVu Sans Mono",monospace}
.b-x{flex:none;width:84px;height:84px;border-radius:50%;background:${ACC};display:flex;align-items:center;justify-content:center}
.b-shop{position:absolute;width:118px;height:150px;border-radius:18px;background:#22332e;border:2px solid rgba(255,255,255,.12)}
.b-shop.bad{background:#5a1f12;border-color:${ACC}}
.b-trow{position:absolute;left:30px;right:30px;height:74px;border-radius:16px;display:flex;align-items:center;gap:14px;padding:0 20px;background:rgba(255,255,255,.05);font-size:28px;color:#cfe2da;font-weight:700;white-space:nowrap}
.b-trow i{flex:none;height:18px;border-radius:9px;background:rgba(255,255,255,.2);display:block}
.b-lane{position:absolute;left:70px;width:940px;height:540px;border-radius:44px;padding:32px 36px;overflow:hidden}
.b-lane .h{font-size:54px;font-weight:900;color:#fff;display:flex;align-items:center;gap:18px;white-space:nowrap}
.b-lane .n{font-size:30px;color:#a9c2b9;font-weight:700;margin-left:auto}
.b-lr{position:absolute;left:36px;right:36px;height:56px;border-radius:14px;background:rgba(255,255,255,.06);display:flex;align-items:center;gap:14px;padding:0 18px}
.b-lr i{display:block;height:16px;border-radius:8px;background:rgba(255,255,255,.22)}
.b-mk{margin-left:auto;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff}
.b-norm{position:absolute;left:70px;width:940px;height:240px;border-radius:40px;padding:26px 34px}
.b-norm .lb{font-size:36px;font-weight:800;color:#a9c2b9}
.b-mess{position:absolute;padding:14px 26px;border-radius:18px;font-size:44px;font-weight:800;white-space:nowrap;background:rgba(255,77,26,.18);color:#FFB49A;border:2px dashed rgba(255,77,26,.6)}
.b-clean{position:absolute;padding:16px 34px;border-radius:20px;font-size:64px;font-weight:900;white-space:nowrap;background:${MINT};color:#06231a;font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
const W5=[110,180,360,200,180,180,190];

window.VISUALS={
/* 0 钩子：几千行表格在脚下飞速滚动，红格乱闪 */
sheet:{bg:'#0a1714',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}gw" style="left:-160px;top:430px;width:1400px;height:1700px;overflow:hidden">
   <div class="b-grid" id="${id}grid">${Array.from({length:28},(_,r)=>`<div class="b-row" style="top:${r*64}px">${W5.map((w,c)=>`<div class="b-c${c===0?' no':''}" id="${id}c${r}_${c}" style="width:${w}px">${c===0?'':''}</div>`).join('')}</div>`).join('')}</div></div>
  <div class="v-a" style="left:0;right:0;top:400px;height:200px;background:linear-gradient(180deg,#0a1714,rgba(10,23,20,0))"></div>
  <div class="v-a v-t v-ctr" id="${id}a" style="top:170px;font-size:124px">${H.fmt(sc.head)}</div>
  <div class="v-a v-t v-ctr v-acc" id="${id}b" style="top:310px;font-size:150px">${H.fmt(sc.ask)}</div>
  <div class="v-a v-ctr" id="${id}cnt" style="top:1250px;text-align:center"><span class="v-pill dim" style="font-size:44px">${I.table(52,'#fff',ACC)} 第 <b id="${id}row" style="font-family:'DejaVu Sans Mono',monospace;color:#fff;min-width:150px;display:inline-block;text-align:right">0</b> 行 · <span id="${id}eq" style="color:#FF9F7E">错误 ?</span> · ${H.fmt(sc.note)}</span></div>`),
 init:(sc,id)=>split(id,'a','b'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,dust:24});
  // 透视表格：越滚越快，行号飞涨
  const v=MO.lerp(300,2600,MO.E.inQ(MO.prog(t,0,H.dur)));const off=(t*v)%64;const base=Math.floor(t*v/64);
  MO.set($(id+'grid'),{rx:46,y:-off,s:1.0+0.05*Math.sin(t*0.6)});
  for(let r=0;r<28;r++)for(let c=0;c<7;c++){const el=$(id+'c'+r+'_'+c);const row=base+r;
   if(c===0){el.textContent=row+1;continue}
   const bad=MO.hash(row*7+c,11)>0.94;el.classList.toggle('bad',bad);
   el.innerHTML=`<i style="display:block;height:14px;border-radius:7px;width:${Math.round(30+MO.hash(row*7+c,3)*60)}%;background:${bad?'rgba(255,255,255,.7)':'rgba(255,255,255,.16)'}"></i>`}
  MO.set($(id+'gw'),{o:MO.tw(t,0,0.4)});
  K.title($(id+'a')._chars,t,0.1,'rise');K.title($(id+'b')._chars,t,(H.at(sc,'藏着')??1.2)-0.1,'punch');if(t>2.2)MO.textWave($(id+'b')._chars,t,{amp:6,from:2.2});
  $(id+'row').textContent=Math.min(base+12,3000+(base%600)).toLocaleString('en-US');$(id+'eq').textContent='错误 '+'?'.repeat(1+Math.floor(t*3)%3);
  MO.set($(id+'cnt'),{y:60*(1-MO.tw(t,0.5,0.5,'outBack')),o:MO.tw(t,0.5,0.25)});
  const k=H.at(sc,'数过')??2.8;MO.ring(g,t,k,540,1290,{r1:420,width:10});MO.burst(g,t,k,540,1290,{n:22,seed:4,colors:[ACC,'#fff'],speed:[200,700],life:0.9})},
 sfx:()=>[[0.1,'pop'],[1.2,'pop']]},

/* 1 三种错误砸下来，然后全店跟着变红 */
errors:{bg:'#0a1714',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="position:absolute;left:-60px;top:-60px;width:1200px;height:2040px;object-fit:cover">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,16,13,.7),rgba(6,16,13,.55) 40%,rgba(6,16,13,.95))"></div>`+K.layers(id,`
  ${sc.chips.map((c,i)=>`<div class="v-a b-err" id="${id}e${i}" style="left:70px;width:940px;top:${180+i*180}px"><div class="b-x">${I.cross(48)}</div>${H.fmt(c[0])}<small>${H.fmt(c[1])}</small></div>`).join('')}
  <div class="v-a" id="${id}shop" style="left:70px;top:740px;width:940px;height:400px">${Array.from({length:21},(_,k)=>`<div class="b-shop" id="${id}s${k}" style="left:${(k%7)*137}px;top:${Math.floor(k/7)*168}px"></div>`).join('')}</div>
  <div class="v-a v-t" id="${id}a" style="left:70px;top:1170px;font-size:100px">${H.fmt(sc.line1)}</div>
  <div class="v-a v-t v-acc" id="${id}b" style="left:70px;top:1290px;font-size:130px">${H.fmt(sc.line2)}</div>`),
 init:(sc,id)=>split(id,'a','b'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.canvas?null:null;const fx=K.frame(id,t,H,{...BG,dust:0,grid:false},{seed:8,push:0.03,beats:[(H.at(sc,'编码')??1.6)+0.7,H.at(sc,'上架之后')??2.4,(H.at(sc,'才发现')??3.0)+0.3,H.at(sc,'全店')??3.5]});
  $(id+'bg').style.display='none';
  MO.set($(id+'img'),{s:1.06+0.1*MO.prog(t,0,H.dur),y:-20*MO.prog(t,0,H.dur)});
  const at=[H.at(sc,'缺规格')??0.2,H.at(sc,'价格')??0.9,H.at(sc,'编码')??1.6];
  at.forEach((a,i)=>{const p=MO.prog(t,a-0.05,a+0.3);MO.set($(id+'e'+i),{s:MO.lerp(1.6,1,MO.E.outBackBig(p)),o:p>0?1:0,r:(i%2?2:-2)*(1-MO.E.outC(p))+MO.wob(t,i,0.6,0.6),x:Math.sin(t*40)*6*MO.prog(t,a+0.25,a+0.3)*(1-MO.prog(t,a+0.3,a+0.6))});
   MO.ring(fx,t,a+0.2,130,180+i*180+75,{r1:200,width:8})});
  const SPREAD=H.at(sc,'全店')??3.5,LATE=H.at(sc,'上架之后')??2.4;
  // 店铺商品格：三条错误砸完就一格格冒出来（不留空档），说到"全店"时从中间一圈圈翻红
  const POP=at[2]+0.45;MO.set($(id+'shop'),{o:1,y:0});
  for(let k=0;k<21;k++){const c=k%7,r=Math.floor(k/7);const d=Math.hypot(c-3,r-1);const a=SPREAD-0.3+d*0.12;const p=MO.prog(t,a,a+0.3);const el=$(id+'s'+k);
   const pin=MO.tw(t,POP+((k*7)%21)*Math.max(0.05,(SPREAD-0.4-POP)/21),0.3,'outBack');
   el.classList.toggle('bad',p>0.5);MO.set(el,{ry:p<1?180*p:0,s:pin*(1+0.08*Math.sin(p*Math.PI)),o:MO.tw(t,POP+((k*7)%21)*Math.max(0.05,(SPREAD-0.4-POP)/21),0.15)})}
  // 三条错误卡持续轻微抖动、红光呼吸
  sc.chips.forEach((_,i)=>{if(t>at[i]+0.6)$(id+'e'+i).style.boxShadow=`0 0 ${(20+18*Math.sin(t*4+i)).toFixed(0)}px rgba(255,77,26,.55),0 30px 60px rgba(0,0,0,.5)`});
  K.title($(id+'a')._chars,t,LATE,'slide');K.title($(id+'b')._chars,t,SPREAD-0.1,'punch');
  MO.ring(fx,t,SPREAD,540,940,{r1:700,width:14})},
 sfx:sc=>[[0.3,'pop'],[1.0,'pop'],[1.7,'pop'],[3.5,'ding']]},

/* 2 表格丢进扫描框，扫描线逐行走，标出问题 */
scan:{bg:'#0a1714',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:175px;font-size:112px">${H.fmt(sc.head)}</div>
  <div class="v-a v-solid" id="${id}tb" style="left:70px;top:420px;width:940px;height:900px;overflow:hidden">
   ${Array.from({length:10},(_,r)=>`<div class="b-trow" id="${id}r${r}" style="top:${30+r*86}px"><i style="width:60px"></i><i style="width:${200+(r*37)%140}px"></i><i style="width:${90+(r*53)%80}px"></i><i style="width:70px"></i><span class="v-tag" id="${id}g${r}" style="opacity:0"></span></div>`).join('')}
   <div id="${id}beam" style="position:absolute;left:0;right:0;height:120px;background:linear-gradient(180deg,rgba(91,214,155,0),rgba(91,214,155,.35),rgba(91,214,155,0));border-bottom:4px solid ${MINT};box-shadow:0 0 40px rgba(91,214,155,.7)"></div>
   <div class="v-shi" style="right:24px;top:auto;bottom:24px">示意</div></div>
  <div class="v-a" id="${id}file" style="left:0;top:0;width:220px;height:260px;border-radius:24px;background:#fff;box-shadow:0 30px 60px rgba(0,0,0,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">${I.table(130,'#1f7a55','#1f7a55')}<b style="font-size:28px;color:#111">${H.fmt(sc.file)}</b></div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:18});
  // 文件沿抛物线丢进来
  const u=MO.prog(t,0.1,0.75);const fx=MO.lerp(900,430,u),fy=MO.lerp(1500,700,u)-Math.sin(u*Math.PI)*500;
  MO.set($(id+'file'),{x:fx,y:fy,r:-30+u*400,s:1-0.5*MO.E.inQ(u),o:u<1?1:0});
  const LAND=0.75;MO.set($(id+'tb'),{s:0.9+0.1*MO.E.outBack(MO.prog(t,LAND,LAND+0.4)),o:MO.tw(t,LAND-0.05,0.2)});
  const sweep=MO.prog(t,LAND+0.3,H.dur-0.2);const by=30+sweep*860;MO.set($(id+'beam'),{y:by-90,o:t>LAND+0.3?1:0});
  const flags={2:0,4:1,7:2,9:0};
  for(let r=0;r<10;r++){const y=30+r*86;const passed=by>y+40;const el=$(id+'r'+r);const f=flags[r];
   el.style.background=passed?(f!==undefined?'rgba(255,77,26,.18)':'rgba(91,214,155,.08)'):'rgba(255,255,255,.05)';
   const tg=$(id+'g'+r);if(f!==undefined){const fl=sc.flags[f];tg.textContent=fl[0];tg.className='v-tag '+fl[1];MO.set(tg,{s:passed?MO.ease('outBackBig')(Math.min(1,(by-y-40)/120)):0,o:passed?1:0})}
   else{tg.textContent='✓';tg.className='v-tag ok';MO.set(tg,{o:passed?1:0,s:passed?1:0})}}
  K.title($(id+'hd')._chars,t,0.15,'drop');MO.ring(g,t,LAND,540,870,{r1:600,width:12,color:'91,214,155'});K.flash(g,t,LAND,0.2,'91,214,155')},
 sfx:()=>[[0.75,'pop'],[1.8,'tick'],[2.5,'tick'],[3.3,'tick']]},

/* 3 实录：真实检查结果，镜头在画面上推移，高亮关键区域 */
real:{bg:'#0a1714',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:170px;font-size:124px">${H.fmt(sc.head)}</div>
  ${K.win(id,H.fmt(sc.win),{x:50,y:400,w:980,h:720})}
  <div class="v-a" id="${id}key" style="left:70px;top:1160px"><span class="v-pill" style="background:linear-gradient(150deg,#2a2f4a,#141829);border:3px solid rgba(255,201,77,.7);color:#fff;font-size:46px">${I.lock(44)} ${H.fmt(sc.key)}</span></div>`),
 init:(sc,id,H)=>{H.$(id+'body').innerHTML=`<canvas id="${id}cv" width="980" height="656" style="position:absolute;inset:0"></canvas><div class="v-shi" id="${id}shi" style="display:none">示意</div><div id="${id}hl" style="position:absolute;border:5px solid ${ACC};border-radius:14px;box-shadow:0 0 30px rgba(255,77,26,.7)"></div><div class="v-tag ok" id="${id}tg" style="position:absolute;font-size:28px">实录</div>`;split(id,'hd')},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:28});
  K.title($(id+'hd')._chars,t,0.1,'punch');MO.set($(id+'win'),{y:200*(1-MO.tw(t,0.05,0.6,'outBack')),r:MO.wob(t,2,0.4,0.3)});
  const c=$(id+'cv'),cg=c.getContext('2d');const im=H.frame(sc,t);cg.fillStyle='#f4f4f0';cg.fillRect(0,0,c.width,c.height);
  // 镜头：先推到统计数字，再沿表格往下摇
  const z=MO.kf(t,[[0,1.0],[0.8,1.9,'inOutC'],[2.2,1.9],[3.2,1.35,'inOutC'],[H.dur,1.45]]);const cx=MO.kf(t,[[0,470],[0.8,470],[2.2,520,'inOutC'],[3.2,470,'inOutC']]);const cy=MO.kf(t,[[0,264],[0.8,255],[2.2,255],[3.2,420,'inOutC'],[H.dur,440]]);
  if(im){const sw=c.width/z,sh=c.height/z;cg.drawImage(im,cx-sw/2,cy-sh/2,sw,sh,0,0,c.width,c.height)}else{$(id+'shi').style.display='block'}
  // 高亮框：框住统计行（在原画面 x70–870, y220–290）
  const toScr=(x,y)=>[(x-cx)*z+c.width/2,(y-cy)*z+c.height/2];const [x0,y0]=toScr(66,216),[x1,y1]=toScr(874,294);
  MO.set($(id+'hl'),{o:MO.tw(t,0.9,0.2)*(1-MO.tw(t,2.3,0.2))});Object.assign($(id+'hl').style,{left:x0+'px',top:y0+'px',width:(x1-x0)+'px',height:(y1-y0)+'px'});
  const tg=$(id+'tg');Object.assign(tg.style,{left:'24px',top:'24px'});
  const k=H.at(sc,'关键')??2.6;MO.set($(id+'key'),{x:-500*(1-MO.tw(t,k-0.1,0.5,'outBack')),o:MO.tw(t,k-0.1,0.2),s:1+0.03*Math.sin(t*5)});
  MO.ring(g,t,1.0,540,700,{r1:500,width:10});MO.ring(g,t,k,330,1200,{r1:300,color:'255,201,77'})},
 sfx:()=>[[1.0,'tick'],[2.6,'pop']]},

/* 4 人眼会漏 vs 规则一行不漏 */
eyes:{bg:'#0a1714',
 build:(sc,id,H)=>{const lane=(k,o,top,hot)=>`<div class="v-a b-lane ${hot?'':'v-glass'}" id="${id}${k}" style="top:${top}px;${hot?`background:linear-gradient(160deg,rgba(91,214,155,.24),rgba(91,214,155,.05));border:3px solid rgba(91,214,155,.6);box-shadow:0 40px 80px rgba(0,0,0,.45)`:''}">
   <div class="h">${hot?I.search(60,MINT):`<svg width="64" height="64" viewBox="0 0 64 64"><path d="M4 32s10-18 28-18 28 18 28 18-10 18-28 18S4 32 4 32z" fill="#fff"/><circle cx="32" cy="32" r="10" fill="#0a1714"/><rect id="${id}lid" x="0" y="0" width="64" height="0" fill="#24312d"/></svg>`}${H.fmt(o.label)}<span class="n">${H.fmt(o.note)}</span></div>
   ${Array.from({length:6},(_,r)=>`<div class="b-lr" id="${id}${k}r${r}" style="top:${120+r*66}px"><i style="width:${120+(r*41)%120}px"></i><i style="width:${80+(r*29)%90}px"></i><div class="b-mk" id="${id}${k}m${r}"></div></div>`).join('')}
   <div id="${id}${k}cur" style="position:absolute;left:20px;right:20px;height:64px;border-radius:16px;border:4px solid ${hot?MINT:'rgba(255,255,255,.6)'}"></div></div>`;
  return K.layers(id,lane('A',sc.manual,190,false)+lane('B',sc.auto,780,true))},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:38});const SW=H.at(sc,'它按规则')??2.7;
  MO.set($(id+'A'),{x:-600*(1-MO.tw(t,0.05,0.5,'outBack')),o:1-0.4*MO.tw(t,SW+0.3,0.4)});MO.set($(id+'B'),{x:600*(1-MO.tw(t,SW-0.2,0.5,'outBack')),o:MO.tw(t,SW-0.2,0.2)});
  // 人眼：光标飘忽、越来越慢，第 3、5 行跳过（漏）
  const ea=MO.prog(t,0.4,SW+0.4);const er=Math.min(5.99,ea*7);const ri=Math.floor(er);MO.set($(id+'Acur'),{y:120+(er<2?er:er<4?er+1:er+1.4)*66*0.86+MO.wob(t,3,12,1.2),o:t>0.4?1:0});
  const lid=$(id+'lid');const bl=(t*0.9)%1;lid.setAttribute('height',bl>0.85?String(64*Math.sin((bl-0.85)/0.15*Math.PI)):'0');
  for(let r=0;r<6;r++){const m=$(id+'Am'+r);const seen=er>r+0.6;const miss=r===2||r===4;m.textContent=seen?(miss?'漏':'✓'):'';m.style.background=seen?(miss?ACC:'rgba(255,255,255,.25)'):'transparent';MO.set(m,{s:seen?1:0});
   $(id+'Ar'+r).style.background=seen&&miss?'rgba(255,77,26,.22)':'rgba(255,255,255,.06)'}
  // 规则：一行一行稳稳往下，全部打勾
  const rr=Math.min(5.99,MO.prog(t,SW+0.3,H.dur-0.3)*6);MO.set($(id+'Bcur'),{y:120+Math.floor(rr)*66-4+MO.E.outBack(rr%1)*0,o:t>SW+0.3?1:0});
  for(let r=0;r<6;r++){const m=$(id+'Bm'+r);const ok=rr>=r+0.5||(rr>5.9);m.innerHTML=ok?I.check(26,'#06231a'):'';m.style.background=ok?MINT:'transparent';MO.set(m,{s:ok?MO.ease('outBackBig')(Math.min(1,(rr-r-0.5)*3+(rr>5.9?1:0))):0});
   $(id+'Br'+r).style.background=ok?'rgba(91,214,155,.12)':'rgba(255,255,255,.06)'}
  MO.ring(g,t,SW+0.1,540,1050,{r1:600,color:'91,214,155'})},
 sfx:()=>[[1.2,'tick'],[2.0,'tick'],[3.0,'pop']]},

/* 5 揭晓：同一个值的三种写法塌缩成一种统一格式，然后一路打勾 */
normalize:{bg:'#0a1714',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:175px;font-size:140px">${H.fmt(sc.head)}</div>
  <div class="v-a v-ctr" id="${id}sub" style="top:345px"><span class="v-pill dim" style="font-size:42px">${H.fmt(sc.sub)}</span></div>
  ${sc.labels.map((lb,i)=>`<div class="v-a v-glass b-norm" id="${id}n${i}" style="top:${470+i*270}px"><div class="lb">${H.fmt(lb)}</div>
   ${sc.messy[i].map((m,k)=>`<div class="b-mess" id="${id}m${i}_${k}">${H.fmt(m)}</div>`).join('')}
   <div class="b-clean" id="${id}c${i}" style="left:34px;top:90px">${H.fmt(sc.clean[i])}</div>
   <div class="v-ok" id="${id}k${i}" style="position:absolute;right:34px;top:96px;width:96px;height:96px">${I.check(60)}</div></div>`).join('')}`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,hue:[91,214,155]},{seed:48});
  const UNI=H.at(sc,'统一格式')??1.6,CHK=H.at(sc,'再检查')??2.4;
  K.title($(id+'hd')._chars,t,UNI-0.25,'punch');if(t>UNI+0.6)MO.textWave($(id+'hd')._chars,t,{amp:6,from:UNI+0.6});
  MO.set($(id+'sub'),{o:MO.tw(t,CHK-0.1,0.3),y:30*(1-MO.tw(t,CHK-0.1,0.4))});
  sc.labels.forEach((_,i)=>{MO.set($(id+'n'+i),{x:(i%2?1:-1)*700*(1-MO.tw(t,0.1+i*0.15,0.5,'outBack')),y:MO.wob(t,i+3,6,0.5)});
   const col=MO.prog(t,UNI+i*0.15,UNI+0.45+i*0.15);
   sc.messy[i].forEach((_,k)=>{const x0=34+k*290,y0=90;const jit=(1-col)*(Math.sin(t*7+k*2+i)*6);
    MO.set($(id+'m'+i+'_'+k),{x:MO.lerp(x0,34,MO.E.inC(col))+jit,y:MO.lerp(y0,90,col)+(1-col)*Math.cos(t*5+k)*5,r:(1-col)*((k-1)*4),s:1-0.3*col,o:(col<0.95?1:0)*MO.tw(t,0.3+i*0.15+k*0.08,0.2)})});
   const cp=MO.prog(t,UNI+0.4+i*0.15,UNI+0.75+i*0.15);MO.set($(id+'c'+i),{s:MO.ease('outBackBig')(cp),o:cp>0?1:0});
   const kp=MO.prog(t,CHK+0.2+i*0.25,CHK+0.5+i*0.25);MO.set($(id+'k'+i),{s:MO.ease('outBackBig')(kp),r:(1-kp)*-90});
   MO.ring(g,t,UNI+0.45+i*0.15,240,470+i*270+140,{r1:260,width:8,color:'91,214,155'})});
  MO.burst(g,t,CHK+0.9,540,830,{n:44,seed:12,colors:[MINT,'#fff',GOLD],speed:[400,1100],life:1.3})},
 sfx:()=>[[1.6,'pop'],[2.6,'tick'],[2.85,'tick'],[3.1,'ding']]},

cta:{bg:'#0a1714',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:960});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:170px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:530px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:560px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#4be3a0,#1f9e64)">${I.table(120,'#fff','#0a5a3a')}</div>`+cb.html)},
 init:(sc,id)=>split(id,'tt'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:58});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=H.at(sc,'关注')??2.0,S=H.at(sc,'两个字')??3.6;const p=sc._cb.anim(t,{show:1.2,follow:F,type:(H.at(sc,'评论')??2.6)+0.2,send:S});
  MO.burst(g,t,OPEN,540,640,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,640,{r1:700,width:14,color:'91,214,155'});K.flash(g,t,OPEN,0.25,'91,214,155');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.0,'pop'],[3.6,'pop']]},
outro:K.outro(BG),
};
})();
