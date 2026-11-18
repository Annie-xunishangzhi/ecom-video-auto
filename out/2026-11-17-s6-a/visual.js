/* 2026-11-17-s6-a 客服对接 · 专属画面。色调：青绿 + 企鹅橙（清晨、客服工作台）。
   主线：九点一开机消息就 99+ → 以前来回切后台，以后订单库存自动同步 → 一天下来最怕漏回售后 → 怎么做到不漏 → 三个模块 → 售后一张清单，回没回一眼看清。 */
(function(){
const K=window.KIT,M=()=>window.MO,{ACC,GOLD,MINT,I,AVC}=K;
const BG={seed:6,hue:[30,200,190],hue2:[255,77,26],hue3:[150,240,220],base:['#0d2a2c','#08191b','#040b0c']};
const css=`
.f-msg{position:absolute;left:70px;width:940px;height:108px;border-radius:28px;background:rgba(16,40,42,.92);border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;gap:22px;padding:0 26px;color:#e6f4f2;font-size:36px;font-weight:700;white-space:nowrap;box-shadow:0 16px 30px rgba(0,0,0,.4)}
.f-msg .dot{margin-left:auto;width:22px;height:22px;border-radius:50%;background:${ACC};flex:none}
.f-badge{position:absolute;min-width:200px;height:150px;border-radius:75px;background:${ACC};color:#fff;font-size:96px;font-weight:900;display:flex;align-items:center;justify-content:center;padding:0 36px;box-shadow:0 20px 60px rgba(255,77,26,.6);font-family:"DejaVu Sans Mono","Noto Sans CJK SC",monospace}
.f-clock{position:absolute;padding:10px 30px;border-radius:24px;background:rgba(0,0,0,.45);color:#fff;font-size:88px;font-weight:900;font-family:"DejaVu Sans Mono",monospace;border:3px solid rgba(255,255,255,.2)}
.f-tabs{display:flex;gap:8px;padding:14px 20px 0}
.f-tab{padding:12px 26px;border-radius:16px 16px 0 0;font-size:30px;font-weight:800;color:#9cc;background:rgba(255,255,255,.05);white-space:nowrap}
.f-tab.on{background:#183c3e;color:#fff}
.f-pane{position:absolute;left:20px;right:20px;top:80px;bottom:20px;border-radius:0 18px 18px 18px;background:#183c3e;padding:24px}
.f-pane i{display:block;height:20px;border-radius:10px;background:rgba(255,255,255,.14);margin:16px 0}
.f-side{position:absolute;width:420px;border-radius:30px;padding:26px}
.f-kv{display:flex;align-items:center;gap:14px;height:74px;font-size:34px;font-weight:800;color:#fff;white-space:nowrap}
.f-kv span{color:#9cc;width:90px}
.f-job{position:absolute;padding:20px 36px;border-radius:24px;font-size:48px;font-weight:900;color:#fff;background:rgba(255,255,255,.1);border:3px solid rgba(255,255,255,.2);white-space:nowrap}
.f-mod{position:absolute;left:30px;right:30px;height:260px;border-radius:30px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);padding:24px 28px}
.f-mod .h{display:flex;align-items:center;gap:16px;font-size:40px;font-weight:900;color:#fff;white-space:nowrap}
.f-mod .h b{color:${MINT};font-size:30px;margin-left:auto}
.f-spin{width:44px;height:44px;border-radius:50%;border:6px solid rgba(91,214,155,.25);border-top-color:${MINT}}
.f-li{display:flex;align-items:center;gap:22px;height:132px;padding:0 34px;border-radius:30px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.1);font-size:46px;font-weight:900;color:#fff;white-space:nowrap}
.f-st{margin-left:auto;padding:10px 26px;border-radius:999px;font-size:36px;font-weight:900}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const split=(id,...ks)=>ks.forEach(k=>M().split(document.getElementById(id+k)));
const MSGS=['在吗？鞋子什么时候发货','尺码偏大还是偏小？','我的快递到哪了','能便宜点吗','想换个颜色','少发了一个配件','发票怎么开','还有 39 码吗','什么时候能到','可以退吗','怎么还没发货','包装压坏了'];

window.VISUALS={
/* 0 钩子：九点整，消息像瀑布一样涌进来，角标冲到 99+ */
morning:{bg:'#08191b',
 build:(sc,id,H)=>`<img id="${id}img" src="${H.img(sc.image)}" style="position:absolute;left:-60px;top:-60px;width:1200px;height:2040px;object-fit:cover;opacity:.5">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,25,27,.75),rgba(8,25,27,.55) 40%,rgba(8,25,27,.95))"></div>`+K.layers(id,`
  <div class="f-clock" id="${id}ck" style="left:70px;top:170px">${H.fmt(sc.time)}</div>
  <div class="v-a" id="${id}lst" style="left:0;top:0;width:1080px;height:1920px;overflow:hidden;-webkit-mask:linear-gradient(180deg,transparent 330px,#000 420px,#000 1080px,transparent 1150px)">${Array.from({length:16},(_,k)=>`<div class="f-msg" id="${id}m${k}"><div class="v-av" style="background:${AVC[k%5]};width:64px;height:64px;font-size:28px">客</div>${MSGS[k%MSGS.length]}<div class="dot"></div></div>`).join('')}</div>
  <div class="f-badge" id="${id}bd" style="left:740px;top:160px">0</div>
  <div class="v-a v-t" id="${id}a" style="left:70px;top:1140px;font-size:100px">${H.fmt(sc.head)}</div>
  <div class="v-a v-t" id="${id}b" style="left:70px;top:1260px;font-size:140px">${H.fmt(sc.head2)}</div>`),
 init:(sc,id)=>split(id,'a','b'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,dust:16,grid:false},{seed:2,push:0.03});
  MO.set($(id+'img'),{s:1.05+0.1*MO.prog(t,0,H.dur)});
  MO.set($(id+'ck'),{s:MO.ease('outBack')(MO.prog(t,0.05,0.4)),r:MO.wob(t,1,1.5,0.6)});
  // 消息从下往上涌：速度越来越快
  const flow=Math.max(0,t-0.5);const pos=flow*flow*260+flow*120;
  for(let k=0;k<16;k++){const y=1100+k*124-pos;MO.set($(id+'m'+k),{y,x:Math.sin(t*2+k)*6,o:y<1130?1:0})}
  const N=Math.round(MO.lerp(0,120,MO.E.inQ(MO.prog(t,0.6,(H.at(sc,'九十九')??2.4)+0.3))));const bd=$(id+'bd');bd.textContent=N>=99?sc.badge:String(N);
  MO.set(bd,{s:MO.ease('outBack')(MO.prog(t,0.5,0.8))*(1+0.08*Math.sin(t*14)*(N>=99?1:0.3)),r:N>=99?Math.sin(t*20)*4:0});
  const B=H.at(sc,'消息已经')??1.8;K.title($(id+'a')._chars,t,B-0.1,'slide');K.title($(id+'b')._chars,t,(H.at(sc,'九十九')??2.3)-0.1,'punch');
  MO.ring(g,t,(H.at(sc,'九十九')??2.3)+0.2,840,235,{r1:360,width:12});MO.burst(g,t,(H.at(sc,'九十九')??2.3)+0.2,840,235,{n:24,seed:3,colors:[ACC,'#fff',GOLD],speed:[300,800],life:1.0})},
 sfx:()=>[[0.1,'pop'],[1.0,'tick'],[1.4,'tick'],[1.7,'tick'],[2.4,'ding']]},

/* 1 以前：三个标签页来回切；以后：聊天旁边订单库存自动同步 */
sync:{bg:'#08191b',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" id="${id}l1" style="left:70px;top:180px"><span class="v-pill hot" style="font-size:44px">${H.fmt(sc.before)}</span></div>
  <div class="v-a v-win" id="${id}w" style="left:70px;top:290px;width:940px;height:520px"><div class="f-tabs">${sc.tabs.map((x,i)=>`<div class="f-tab" id="${id}t${i}">${H.fmt(x)}</div>`).join('')}</div>
   <div class="f-pane" id="${id}pn">${[0,1,2,3,4,5].map(k=>`<i style="width:${40+(k*29)%50}%"></i>`).join('')}</div>
   <div class="v-a" id="${id}cur" style="left:0;top:0">${I.hand(80)}</div></div>
  <div class="v-a" id="${id}l2" style="left:70px;top:880px"><span class="v-pill" style="background:rgba(91,214,155,.2);color:${MINT};border:3px solid ${MINT};font-size:44px">${H.fmt(sc.after)}</span><span class="v-pill dim" style="margin-left:16px;font-size:28px;padding:8px 18px">${H.fmt(sc.note)}</span></div>
  <div class="v-a v-glass" id="${id}chat" style="left:70px;top:990px;width:480px;height:420px;border-radius:30px;padding:24px">
   <div style="display:flex;gap:12px;align-items:center"><div class="v-av" style="background:${AVC[1]};width:60px;height:60px">客</div><div style="background:#183c3e;color:#e6f4f2;border-radius:20px;padding:14px 20px;font-size:30px;font-weight:700">我的鞋发了吗？</div></div>
   <div id="${id}rep" style="margin-top:22px;margin-left:auto;width:fit-content;background:${MINT};color:#06231a;border-radius:20px;padding:14px 20px;font-size:30px;font-weight:800">已发货，明天到 ✓</div></div>
  <div class="f-side v-solid" id="${id}sd" style="left:590px;top:990px;height:420px">
   <div style="display:flex;align-items:center;gap:12px;font-size:32px;font-weight:900;color:#fff;margin-bottom:8px"><div class="f-spin" id="${id}sp"></div>自动同步</div>
   ${sc.order.map((kv,i)=>`<div class="f-kv" id="${id}k${i}"><span>${H.fmt(kv[0])}</span>${H.fmt(kv[1])}</div>`).join('')}</div>`),
 anim:(sc,id,t,H)=>{const AF=H.at(sc,'以后')??3.0;const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:12,beats:[H.at(sc,'每条')??0.6,H.at(sc,'切到')??1.2,H.at(sc,'查订单')??1.9,AF,H.at(sc,'自动同步')??3.8,H.at(sc,'打开就')??4.8]});
  MO.set($(id+'l1'),{o:MO.tw(t,0.05,0.3)});MO.set($(id+'w'),{y:100*(1-MO.tw(t,0.05,0.5,'outBack')),o:(1-0.5*MO.tw(t,AF,0.4)),s:1-0.04*MO.tw(t,AF,0.4)});
  // 来回切：聊天 → 订单后台 → 库存表 → 聊天……越切越急
  const sw=Math.floor(Math.pow(Math.max(0,t-0.4),1.3)*2.2)%3;sc.tabs.forEach((_,i)=>$(id+'t'+i).classList.toggle('on',i===sw));
  const pn=$(id+'pn');pn.style.background=['#183c3e','#1d2c55','#4a3412'][sw];pn.innerHTML=(pn.dataset.sw===String(sw))?pn.innerHTML:([0,1,2,3,4,5].map(k=>`<i style="width:${40+((k+sw*3)*29)%50}%"></i>`).join(''));pn.dataset.sw=sw;
  MO.set(pn,{x:Math.sin(t*20)*3*(t<AF?1:0)});
  const cx=[60,230,430][sw]+30,cy=30;MO.set($(id+'cur'),{x:cx+Math.sin(t*9)*6,y:cy+Math.cos(t*7)*4,o:t<AF?1:0.3});
  const ap=MO.tw(t,AF-0.1,0.5,'outBack');MO.set($(id+'l2'),{x:-400*(1-ap),o:MO.tw(t,AF-0.1,0.2)});
  MO.set($(id+'chat'),{y:200*(1-MO.tw(t,AF+0.1,0.5,'outBack')),o:MO.tw(t,AF+0.1,0.2)});MO.set($(id+'sd'),{x:400*(1-MO.tw(t,AF+0.3,0.5,'outBack')),o:MO.tw(t,AF+0.3,0.2)});
  const synced=t>AF+1.4;MO.set($(id+'sp'),{r:t*360});$(id+'sp').style.borderTopColor=synced?MINT:MINT;$(id+'sp').style.borderColor=synced?MINT:'';
  sc.order.forEach((_,i)=>MO.set($(id+'k'+i),{x:40*(1-MO.tw(t,AF+0.6+i*0.25,0.3,'outBack')),o:MO.tw(t,AF+0.6+i*0.25,0.2)}));
  MO.set($(id+'rep'),{s:MO.ease('outBackBig')(MO.prog(t,AF+1.5,AF+1.8)),o:t>AF+1.5?1:0});
  if(t>AF+0.5)MO.stream(g,t,590,1200,540,1200,{n:8,seed:3,bend:-40,speed:1.5,color:'91,214,155'});MO.ring(g,t,AF+1.5,320,1100,{r1:300,width:8,color:'91,214,155'})},
 sfx:()=>[[0.6,'tick'],[1.1,'tick'],[1.5,'tick'],[3.0,'pop'],[4.5,'ding']]},

/* 2 一天的活在转，一条售后被压到最底下没人回 */
miss:{bg:'#08191b',
 build:(sc,id,H)=>K.layers(id,`
  <canvas class="v-a" id="${id}day" width="940" height="120" style="left:70px;top:180px"></canvas>
  ${sc.jobs.map((j,i)=>`<div class="f-job" id="${id}j${i}">${H.fmt(j)}</div>`).join('')}
  <div class="f-msg" id="${id}lost" style="border:4px solid ${ACC};background:rgba(60,20,10,.92)"><div class="v-av" style="background:${ACC};width:64px;height:64px;font-size:28px">售</div>${H.fmt(sc.lost)}<span class="v-tag bad" style="margin-left:auto" id="${id}un">未回</span></div>
  ${[0,1,2,3,4].map(k=>`<div class="f-msg" id="${id}c${k}"><div class="v-av" style="background:${AVC[k]};width:64px;height:64px;font-size:28px">客</div>${MSGS[(k+3)%MSGS.length]}<div class="dot"></div></div>`).join('')}
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:1250px;font-size:116px">${H.fmt(sc.head)}</div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const D=H.dur;const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:22,beats:[0.3,H.at(sc,'查订单')??0.2,H.at(sc,'对库存')??0.8,H.at(sc,'记售后')??1.4,H.at(sc,'一天下来')??2.2,H.at(sc,'最怕')??3.0]});
  // 一天的进度条：太阳走到月亮
  const dg=MO.canvas($(id+'day'));const p=MO.prog(t,0.2,D*0.7);dg.fillStyle='rgba(255,255,255,.1)';dg.beginPath();dg.roundRect(0,44,940,32,16);dg.fill();
  const gr=dg.createLinearGradient(0,0,940,0);gr.addColorStop(0,'#ffd36b');gr.addColorStop(1,'#5b6bff');dg.fillStyle=gr;dg.beginPath();dg.roundRect(0,44,940*p,32,16);dg.fill();
  MO.glow(dg,940*p,60,60,p<0.7?'rgba(255,210,100,1)':'rgba(170,180,255,1)');dg.fillStyle='#fff';dg.font='bold 30px sans-serif';dg.fillText('09:00',0,30);dg.fillText('21:00',860,30);
  // 三件事轮着转
  const at=[H.at(sc,'查订单')??0.2,H.at(sc,'对库存')??0.8,H.at(sc,'记售后')??1.4];
  sc.jobs.forEach((_,i)=>{const ang=(t*1.6+i*2.094);const pIn=MO.spring(t-at[i],1.5,6);MO.set($(id+'j'+i),{x:400+Math.cos(ang)*300-120,y:520+Math.sin(ang)*130-50,s:Math.max(0,Math.min(1.1,pIn))*(0.8+0.2*(Math.sin(ang)+1)/2),o:Math.min(1,Math.max(0,pIn))*(1-0.6*MO.tw(t,D*0.55,0.4))})});
  // 售后那条先出现，然后被新消息一层层压下去
  const L=at[2];const sink=MO.prog(t,L+0.6,D-0.3);MO.set($(id+'lost'),{y:740+sink*360,o:MO.tw(t,L,0.3)*(1-0.55*sink),s:1-0.08*sink});
  $(id+'un').style.opacity=t>L+0.6?(0.5+0.5*Math.sin(t*8)).toFixed(2):'1';
  for(let k=0;k<5;k++){const a=L+0.7+k*0.35;const u=MO.tw(t,a,0.35,'outBack');MO.set($(id+'c'+k),{y:740+(4-k)*72*0+MO.lerp(-150,0,u)+k*0,o:MO.tw(t,a,0.2),x:Math.sin(t*2+k)*4,s:1-0.02*(4-k)});$(id+'c'+k).style.zIndex=10+k}
  const HD=H.at(sc,'最怕')??3.4;K.title($(id+'hd')._chars,t,HD-0.1,'punch');MO.ring(g,t,HD+0.4,540,1100,{r1:420,width:10})},
 sfx:()=>[[0.2,'tick'],[0.8,'tick'],[1.4,'tick'],[3.4,'pop']]},

/* 3 中段悬念：放大镜扫过消息列表，"关键在一个地方" */
key:{bg:'#08191b',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:180px;font-size:130px">${H.fmt(sc.head)}</div>
  <div class="v-a" id="${id}ls" style="left:70px;top:420px;width:940px;height:760px;overflow:hidden;border-radius:36px">${Array.from({length:10},(_,k)=>`<div class="f-msg" id="${id}m${k}" style="left:0;width:940px"><div class="v-av" style="background:${AVC[k%5]};width:64px;height:64px;font-size:28px">客</div>${MSGS[(k+5)%MSGS.length]}</div>`).join('')}</div>
  <div class="v-a" id="${id}lens" style="left:0;top:0;width:300px;height:300px;border-radius:50%;border:14px solid #fff;box-shadow:0 0 0 6px rgba(0,0,0,.3),0 0 60px rgba(91,214,155,.6),inset 0 0 60px rgba(91,214,155,.35)"></div>
  <div class="v-a" id="${id}kp" style="left:70px;top:1230px"><span class="v-pill" style="background:linear-gradient(150deg,#1d3d3f,#0d2224);border:3px solid rgba(255,201,77,.7);color:#fff;font-size:44px">${I.lock(42)} ${H.fmt(sc.key)}</span></div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,hue:[255,170,40]},{seed:32,push:0.07});
  K.title($(id+'hd')._chars,t,0.1,'punch');if(t>1.0)MO.textWave($(id+'hd')._chars,t,{amp:6,from:1.0});
  for(let k=0;k<10;k++){const y=((k*118-t*90)%1180+1180)%1180-120;MO.set($(id+'m'+k),{y})}
  const lx=MO.lerp(120,640,(Math.sin(t*1.6)+1)/2),ly=MO.lerp(480,900,(Math.sin(t*1.1+1)+1)/2);MO.set($(id+'lens'),{x:lx,y:ly,s:MO.ease('outBack')(MO.prog(t,0.3,0.7)),r:t*20});
  const K_=H.at(sc,'关键')??2.2;MO.set($(id+'kp'),{x:-600*(1-MO.tw(t,K_-0.1,0.5,'outBack')),o:MO.tw(t,K_-0.1,0.2),s:1+0.03*Math.sin(t*5)});
  MO.ring(g,t,K_,330,1280,{r1:360,color:'255,201,77'});MO.dust(g,t,{n:22,seed:77,color:'255,201,77',size:[3,7],alpha:[.3,.9],speed:-70,drift:60})},
 sfx:()=>[[0.1,'pop'],[2.2,'pop']]},

/* 4 实录槽位（示意）：客服工作台三个模块依次点亮 */
panel:{bg:'#08191b',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a" style="left:70px;top:175px"><span class="v-pill dim" id="${id}ln" style="font-size:38px">${H.fmt(sc.line)}</span></div>
  ${K.win(id,H.fmt(sc.win),{x:60,y:290,w:960,h:1100})}
  <div class="v-a v-shi" style="right:84px;top:370px">示意</div>`),
 init:(sc,id,H)=>{H.$(id+'body').innerHTML=`<canvas id="${id}cv" width="960" height="1036" style="position:absolute;inset:0;display:none"></canvas><div id="${id}sim">${sc.mods.map((m,i)=>`<div class="f-mod" id="${id}m${i}" style="top:${40+i*320}px"><div class="h"><div class="f-spin" id="${id}s${i}"></div>${H.fmt(m[0])}<b id="${id}b${i}">${H.fmt(m[1])}</b></div><div id="${id}x${i}" style="position:relative;height:150px;margin-top:20px"></div></div>`).join('')}</div>`;
  const $=H.$;$(id+'x0').innerHTML=`<div style="display:flex;gap:16px">${['订单','库存','物流'].map(k=>`<div class="v-tag ok" style="margin:0;font-size:30px">${k}</div>`).join('')}</div><svg id="${id}ar" style="position:absolute;right:20px;top:20px" width="100" height="100" viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5l2-2v6h-6l2-2a5 5 0 0 0-9 3zM20 12a8 8 0 0 1-14 5l-2 2v-6h6l-2 2a5 5 0 0 0 9-3z" fill="${MINT}"/></svg>`;
  $(id+'x1').innerHTML=['什么时候发货','尺码怎么选','怎么退换'].map((q,k)=>`<div class="v-tag warn" id="${id}q${k}" style="position:absolute;margin:0;font-size:30px">${q}</div>`).join('');
  $(id+'x2').innerHTML=Array.from({length:4},(_,k)=>`<div id="${id}r${k}" style="position:absolute;left:0;top:${k*36}px;height:26px;border-radius:13px;background:rgba(255,77,26,.35)"></div>`).join('');
  if(H.frame(sc,0)){$(id+'cv').style.display='block';$(id+'sim').style.display='none'}},
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:42});
  MO.set($(id+'win'),{y:200*(1-MO.tw(t,0,0.6,'outBack')),r:MO.wob(t,2,0.4,0.3)});MO.set($(id+'ln'),{o:MO.tw(t,0.2,0.3)});
  const im=H.frame(sc,t);if(im){const c=$(id+'cv');H.drawFrame(c.getContext('2d'),im,0,0,c.width,c.height);return}
  const at=[H.at(sc,'订单库存')??0.3,H.at(sc,'常见问题')??1.5,H.at(sc,'售后信息')??2.8];
  sc.mods.forEach((_,i)=>{const a=at[i];const on=t>a;MO.set($(id+'m'+i),{x:-80*(1-MO.tw(t,a-0.1,0.4,'outBack')),o:0.35+0.65*MO.tw(t,a-0.1,0.3)});$(id+'m'+i).style.borderColor=on?'rgba(91,214,155,.6)':'rgba(255,255,255,.1)';
   const done=t>a+0.9;const sp=$(id+'s'+i);MO.set(sp,{r:t*400});sp.style.border=done?`6px solid ${MINT}`:'';MO.set($(id+'b'+i),{o:done?1:0.3,s:done?1+0.1*Math.sin(MO.prog(t,a+0.9,a+1.2)*Math.PI):1})});
  MO.set($(id+'ar'),{r:t*120});
  [0,1,2].forEach(k=>{const s=MO.tw(t,at[1]+0.3,0.6,'inOutC');MO.set($(id+'q'+k),{x:MO.lerp([300,20,560][k],k*290,s),y:MO.lerp([60,10,90][k],20,s),r:(1-s)*[-8,6,4][k]})});
  for(let k=0;k<4;k++){const p=MO.tw(t,at[2]+0.3+k*0.2,0.4,'outBack');$(id+'r'+k).style.width=(p*[640,520,700,450][k]).toFixed(0)+'px'}
  at.forEach(a=>MO.ring(g,t,a+0.9,540,600,{r1:500,width:8,color:'91,214,155'}))},
 sfx:()=>[[1.2,'tick'],[2.4,'tick'],[3.7,'ding']]},

/* 5 揭晓：售后一张清单，"没回"的高亮跳出来，一眼看清 */
ledger:{bg:'#08191b',
 build:(sc,id,H)=>K.layers(id,`
  <div class="v-a v-t v-ctr" id="${id}hd" style="top:175px;font-size:130px">${H.fmt(sc.head)}</div>
  <div class="v-a v-ctr" id="${id}sub" style="top:340px"><span class="v-pill dim" style="font-size:36px">${H.fmt(sc.sub)}</span></div>
  <div class="v-a v-solid" id="${id}tb" style="left:70px;top:430px;width:940px;padding:30px;display:flex;flex-direction:column;gap:18px">
   ${sc.items.map((it,i)=>`<div class="f-li" id="${id}i${i}"><div class="v-av" style="background:${AVC[i]}">${i+1}</div>${H.fmt(it[0])}<span class="f-st" id="${id}s${i}" style="${it[1]===sc.done?`background:rgba(91,214,155,.2);color:${MINT}`:`background:rgba(255,77,26,.25);color:#FF9F7E`}">${H.fmt(it[1])}</span></div>`).join('')}</div>
  <div class="v-a" id="${id}eye" style="left:410px;top:1150px;width:260px;height:180px"><svg width="260" height="180" viewBox="0 0 64 44"><path d="M2 22S14 4 32 4s30 18 30 18-12 18-30 18S2 22 2 22z" fill="#fff"/><circle id="${id}pu" cx="32" cy="22" r="10" fill="#0d2a2c"/><circle cx="35" cy="19" r="3" fill="#fff"/></svg></div>`),
 init:(sc,id)=>split(id,'hd'),
 anim:(sc,id,t,H)=>{const L=H.at(sc,'一张清单')??1.4,A=H.at(sc,'哪条回了')??2.6,B=H.at(sc,'哪条没回')??3.4,E=H.at(sc,'一眼看清')??4.3;
  const MO=M(),$=H.$,g=K.frame(id,t,H,{...BG,hue:[91,214,155]},{seed:52,beats:[0.3,H.at(sc,'售后自动')??0.8,L,L+0.6,A,B,E]});
  K.title($(id+'hd')._chars,t,0.1,'punch');MO.set($(id+'sub'),{o:MO.tw(t,0.6,0.3)});
  const TB=Math.min(L-0.4,0.6);MO.set($(id+'tb'),{y:200*(1-MO.tw(t,TB,0.5,'outBack')),o:MO.tw(t,TB,0.2)});
  sc.items.forEach((it,i)=>{const done=it[1]===sc.done;MO.set($(id+'i'+i),{x:-300*(1-MO.tw(t,TB+0.3+i*0.25,0.4,'outBack')),o:MO.tw(t,TB+0.3+i*0.25,0.2)});
   const hi=done?(t>A&&t<B+0.2):(t>B);const el=$(id+'i'+i);el.style.borderColor=hi?(done?'rgba(91,214,155,.8)':ACC):'rgba(255,255,255,.1)';el.style.background=hi&&!done?'rgba(255,77,26,.18)':hi?'rgba(91,214,155,.1)':'rgba(255,255,255,.06)';
   MO.set($(id+'s'+i),{s:hi?1+0.1*Math.sin(t*8):1});if(!done&&t>B)MO.set(el,{x:Math.sin(t*20)*4*MO.prog(t,B,B+0.2)*(1-MO.prog(t,B+0.4,B+0.8))})});
  MO.set($(id+'eye'),{s:MO.ease('outBackBig')(MO.prog(t,E-0.2,E+0.2)),o:t>E-0.2?1:0});$(id+'pu').setAttribute('cx',String(32+Math.sin(t*3)*8));
  MO.ring(g,t,B,540,800,{r1:600,width:10});MO.burst(g,t,E,540,1240,{n:30,seed:8,colors:[MINT,'#fff',GOLD],speed:[300,900],life:1.1})},
 sfx:()=>[[1.4,'pop'],[2.6,'tick'],[3.4,'tick'],[4.3,'ding']]},

cta:{bg:'#08191b',
 build:(sc,id,H)=>{const cb=K.ctaBlock(id,sc,H,{y:960});sc._cb=cb;return K.layers(id,`
  <div class="v-a v-ctr" id="${id}kk" style="top:180px"><span class="v-pill dim" style="font-size:44px">${H.fmt(sc.kicker)}</span></div>
  <div class="v-a v-t v-ctr" id="${id}tt" style="top:280px;font-size:150px">${H.fmt(sc.title)}</div>
  <div class="v-a" id="${id}gift" style="left:390px;top:530px;width:300px;height:300px">${I.gift(300)}</div>
  <div class="v-a v-ic" id="${id}app" style="left:450px;top:560px;width:180px;height:180px;border-radius:48px;background:linear-gradient(145deg,#4be3c5,#1a8f80)">${I.chat(110)}</div>`+cb.html)},
 init:(sc,id)=>split(id,'tt'),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$,g=K.frame(id,t,H,BG,{seed:62});const OPEN=0.6;
  MO.set($(id+'kk'),{o:MO.tw(t,0.05,0.3)});K.title($(id+'tt')._chars,t,0.2,'punch');if(t>1.0)MO.textWave($(id+'tt')._chars,t,{amp:7,from:1.0});
  const gp=MO.spring(t-0.05,1.4,6);MO.set($(id+'gift'),{s:Math.max(0,gp)*(1-0.15*MO.tw(t,OPEN,0.3)),y:MO.wob(t,3,8,0.5)+(t<OPEN?Math.abs(Math.sin(t*14))*-12:60*MO.tw(t,OPEN,0.4)),o:1-0.3*MO.tw(t,OPEN,0.4)});
  const ap=MO.spring(t-OPEN,1.1,5);MO.set($(id+'app'),{y:-80*Math.max(0,Math.min(1.2,ap))+MO.wob(t,8,8,0.6),s:0.3+0.7*Math.max(0,Math.min(1.15,ap)),o:t>OPEN?1:0,r:MO.wob(t,9,6,0.5)});
  const F=H.at(sc,'关注')??2.2,S=(H.at(sc,'上线第一')??3.8)-0.3;const p=sc._cb.anim(t,{show:1.3,follow:F,type:(H.at(sc,'评论')??2.8)+0.2,send:S});
  MO.burst(g,t,OPEN,540,640,{n:70,seed:41,speed:[600,1500],life:1.6,gravity:1300});MO.ring(g,t,OPEN,540,640,{r1:700,width:14,color:'91,214,155'});K.flash(g,t,OPEN,0.25,'180,255,230');
  MO.ring(g,t,F,p.fx,p.fy,{r1:300,width:8});MO.burst(g,t,S,p.sx,p.sy,{n:24,seed:44,colors:['#ff5d7a','#fff',GOLD],shape:'circle',speed:[200,600],life:1.0,gravity:-200})},
 sfx:()=>[[0.6,'ding'],[2.2,'pop'],[3.5,'pop']]},
outro:K.outro(BG),
};
})();
