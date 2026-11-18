/* 画面套件 window.KIT：各条视频 visual.js 共用的样式、背景、进场、图标、外框。
   只放"每条都会用到"的东西；故事和构图仍由每条视频自己写。所有函数都是 t 的纯函数。 */
(function(){
const ACC='#FF4D1A',GOLD='#FFC94D',MINT='#5BD69B',PAPER='#F4EFE6';
const css=`
.v-bg,.v-fx{position:absolute;inset:0;width:1080px;height:1920px;pointer-events:none}
.v-fx{z-index:30}
.v-st{position:absolute;inset:0;transform-origin:50% 42%;perspective:1600px}
.v-a{position:absolute}
.v-t{font-weight:900;letter-spacing:-2px;line-height:1.05;color:#fff;white-space:nowrap}
.v-t .s,.v-acc{color:${ACC}}
.v-ctr{left:0;right:0;text-align:center}
.v-glass{background:linear-gradient(160deg,rgba(255,255,255,.13),rgba(255,255,255,.04));border:2px solid rgba(255,255,255,.16);border-radius:40px;box-shadow:0 40px 80px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.25);backdrop-filter:blur(18px)}
.v-solid{background:linear-gradient(160deg,rgba(40,46,74,.97),rgba(18,21,36,.97));border:2px solid rgba(255,255,255,.14);border-radius:40px;box-shadow:0 40px 80px rgba(0,0,0,.5)}
.v-pill{display:inline-flex;align-items:center;gap:14px;border-radius:999px;padding:14px 32px;font-weight:800;font-size:38px;white-space:nowrap}
.v-pill.dim{background:rgba(255,255,255,.1);color:#e6e8f5;border:2px solid rgba(255,255,255,.22)}
.v-pill.hot{background:rgba(255,77,26,.16);color:#FF9F7E;border:3px solid rgba(255,77,26,.6)}
.v-pill.light{background:#fff;color:#111}
.v-row{display:flex;align-items:center;gap:24px;height:96px;padding:0 30px;border-radius:26px;font-size:42px;font-weight:800;color:#fff;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.08);white-space:nowrap}
.v-av{flex:none;width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:900;color:#fff}
.v-tag{margin-left:auto;font-size:30px;font-weight:700;padding:8px 20px;border-radius:999px;background:rgba(255,77,26,.18);color:#FFB49A;white-space:nowrap}
.v-tag.ok{background:rgba(91,214,155,.18);color:${MINT}}.v-tag.warn{background:rgba(255,201,77,.18);color:${GOLD}}.v-tag.bad{background:rgba(255,77,26,.25);color:#FF8A66}
.v-ok{flex:none;width:58px;height:58px;border-radius:50%;background:${MINT};display:flex;align-items:center;justify-content:center}
.v-ic{border-radius:64px;background:linear-gradient(145deg,#FF7A45,#FF4D1A 55%,#C9300B);box-shadow:0 40px 90px rgba(255,77,26,.55),inset 0 4px 0 rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center}
.v-btn{height:130px;border-radius:65px;display:flex;align-items:center;justify-content:center;gap:18px;font-size:54px;font-weight:900;color:#fff;background:${ACC};box-shadow:0 24px 50px rgba(255,77,26,.5);white-space:nowrap}
.v-shi{position:absolute;right:30px;top:24px;padding:8px 22px;border-radius:14px;background:#fff;color:#111;font-size:34px;font-weight:900;border:4px solid #111;z-index:5}
.v-win{border-radius:30px;overflow:hidden;background:#0d1020;border:3px solid #2a3050;box-shadow:0 50px 100px rgba(0,0,0,.6)}
.v-win>.bar{height:64px;background:#1a1f36;display:flex;align-items:center;gap:12px;padding:0 24px;color:#c9cde3;font-size:28px;font-weight:700;white-space:nowrap}
.v-win>.bar i{width:18px;height:18px;border-radius:50%;display:block;flex:none}
.v-phone{border-radius:84px;background:#0b0d16;border:14px solid #22263a;box-shadow:0 60px 120px rgba(0,0,0,.6),0 0 0 3px #3a3f58;overflow:hidden}
.v-q{font-weight:900;color:#fff;line-height:1;text-shadow:0 0 80px rgba(255,77,26,.9),0 0 30px rgba(255,201,77,.8)}
.v-stamp{position:absolute;font-weight:900;color:${ACC};border:12px solid ${ACC};border-radius:30px;padding:0 34px;letter-spacing:6px;white-space:nowrap}
.v-cell{position:absolute;display:flex;align-items:center;padding:0 16px;font-size:28px;font-weight:700;color:#d8dcef;white-space:nowrap;overflow:hidden;border-right:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}
.v-input{height:130px;border-radius:65px;background:rgba(255,255,255,.95);display:flex;align-items:center;padding:0 40px;font-size:48px;font-weight:800;color:#111;gap:6px;box-shadow:0 20px 40px rgba(0,0,0,.35);white-space:nowrap}
.v-car{display:inline-block;width:5px;height:56px;background:${ACC}}
`;
document.head.insertAdjacentHTML('beforeend',`<style>${css}</style>`);
const M=()=>window.MO;

/* 两张全屏画布：背景 bg（垫底）和特效 fx（盖在最上面） */
const layers=(id,inner)=>`<canvas class="v-bg" id="${id}bg" width="1080" height="1920"></canvas><div class="v-st" id="${id}st">${inner}</div><canvas class="v-fx" id="${id}fx" width="1080" height="1920"></canvas>`;
/* 动态背景：深色渐变 + 两三团漂移光斑 + 缓移网格 + 尘埃 + 暗角。按全片时间 T 漂移，切场景不跳。
   每条视频用自己的 hue / hue2 / base 换一套气质 */
function bg(g,T,{seed=1,hue=[255,77,26],hue2=[91,120,255],hue3=[255,201,77],base=['#141a33','#0c1020','#07080f'],grid=true,dust=46,img=null,imgAlpha=0.35}={}){const MO=M();
 const lg=g.createLinearGradient(0,0,0,1920);lg.addColorStop(0,base[0]);lg.addColorStop(0.55,base[1]);lg.addColorStop(1,base[2]);g.fillStyle=lg;g.fillRect(0,0,1080,1920);
 if(img&&img.complete&&img.naturalWidth){const s=1.15+0.05*Math.sin(T*0.1);const w=1080*s,h=1920*s;g.save();g.globalAlpha=imgAlpha;g.drawImage(img,(1080-w)/2+MO.wob(T,seed+90,30,0.05),(1920-h)/2+MO.wob(T,seed+91,30,0.05),w,h);g.restore()}
 MO.glow(g,540+MO.wob(T,seed,320,0.08),620+MO.wob(T,seed+3,260,0.07),900,`rgba(${hue},0.32)`);
 MO.glow(g,300+MO.wob(T,seed+7,260,0.09),1400+MO.wob(T,seed+9,220,0.08),800,`rgba(${hue2},0.26)`);
 MO.glow(g,900+MO.wob(T,seed+11,200,0.1),300+MO.wob(T,seed+13,180,0.09),600,`rgba(${hue3},0.14)`);
 if(grid){g.save();g.strokeStyle='rgba(255,255,255,0.045)';g.lineWidth=2;const off=(T*18)%90;
  for(let x=-90+off;x<1170;x+=90){g.beginPath();g.moveTo(x,0);g.lineTo(x,1920);g.stroke()}
  for(let y=-90+off;y<2010;y+=90){g.beginPath();g.moveTo(0,y);g.lineTo(1080,y);g.stroke()}g.restore()}
 if(dust)MO.dust(g,T,{n:dust,seed:seed+40,speed:26,size:[1.5,4.5],alpha:[.12,.5]});
 const vg=g.createRadialGradient(540,860,500,540,860,1300);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.55)');g.fillStyle=vg;g.fillRect(0,0,1080,1920)}
/* 场景进出：推进+去模糊入场（0.42 秒），结尾 0.28 秒轻微后撤，全程手持感漂移。3D 翻转要等入场结束再开始 */
/* beats：镜头"顿一下"的时间点（秒）。每个点做一次 0.35 秒的轻推近再回位，用在配音重音上，也保证每 1–2 秒有明显的新动作 */
function stage(el,t,dur,{push=0.05,seed=1,beats=[],beat=0.06}={}){const MO=M();const a=MO.tw(t,0,0.42,'outE');const z=MO.tw(t,dur-0.28,0.28,'inQ');
 const bk=beats.reduce((s,b)=>s*(1+beat*Math.sin(Math.PI*MO.prog(t,b,b+0.35))),1);
 MO.set(el,{s:(1.16-0.16*a)*(1+push*MO.E.inOutSine(MO.prog(t,0,dur)))*(1-0.05*z)*bk,x:MO.wob(t,seed,8,0.25),y:MO.wob(t,seed+4,8,0.22),r:MO.wob(t,seed+8,0.35,0.2),
  blur:16*(1-a)+7*z,o:Math.min(1,a*1.6)})}
/* 一帧闪白 */
const flash=(g,t,t0,life=0.3,c='255,255,255')=>{const u=M().prog(t,t0,t0+life);if(u>0&&u<1){g.fillStyle=`rgba(${c},${(0.55*(1-u)).toFixed(3)})`;g.fillRect(0,0,1080,1920)}};
/* 一个场景的标准开头：画背景、做进出、返回清空的 fx 画布 */
function frame(id,t,H,bgOpts={},stageOpts={}){const MO=M();if(!H||typeof H.$!=='function')throw new Error('KIT.frame 的第三个参数要传 H（写成 K.frame(id,t,H,背景参数,进场参数)）');bg(MO.canvas(H.$(id+'bg')),H.T,bgOpts);stage(H.$(id+'st'),t,H.dur,stageOpts);return MO.canvas(H.$(id+'fx'))}
/* 一行文字逐字进场的常用组合 */
function title(chars,t,start,kind='drop'){const MO=M();const P={drop:{from:{y:-90,s:1.5,blur:12,o:0},e:'outBackBig',stagger:0.06},
 rise:{from:{y:90,rx:-80,blur:10,o:0},e:'outBack',stagger:0.06},punch:{from:{s:2.6,blur:18,o:0},e:'outBackBig',stagger:0.08},
 slide:{from:{x:-80,blur:12,o:0},e:'outC',stagger:0.05}}[kind];MO.textIn(chars,t,start,{stagger:P.stagger,dur:0.5,from:P.from,e:P.e})}

/* 图标（内联 SVG，不用 emoji） */
const I={
 list:(w,c='#FF4D1A')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><rect x="10" y="10" width="44" height="44" rx="10" fill="#fff"/><path d="M20 24h24M20 33h24M20 42h14" stroke="${c}" stroke-width="5" stroke-linecap="round"/></svg>`,
 check:(w,c='#0C1020')=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" stroke="${c}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 cross:(w,c='#fff')=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="${c}" stroke-width="3.6" stroke-linecap="round"/></svg>`,
 bell:(w,c='#fff')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><path d="M32 8c-9 0-15 7-15 16v10l-5 8h40l-5-8V24c0-9-6-16-15-16z" fill="${c}"/><circle cx="32" cy="50" r="6" fill="${c}"/></svg>`,
 bag:(w,c='#fff')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><path d="M13 22h38l-3 34H16z" fill="${c}"/><path d="M24 24v-6a8 8 0 0 1 16 0v6" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
 chart:(w,c='#fff',c2='#FFC94D')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><rect x="10" y="38" width="10" height="16" rx="3" fill="${c}"/><rect x="27" y="28" width="10" height="26" rx="3" fill="${c}"/><rect x="44" y="18" width="10" height="36" rx="3" fill="${c}"/><path d="M10 26l14-10 10 6 18-12" stroke="${c2}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 table:(w,c='#fff',c2='#FF4D1A')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><rect x="8" y="12" width="48" height="40" rx="6" fill="${c}"/><rect x="8" y="12" width="48" height="10" rx="5" fill="${c2}"/><path d="M8 32h48M8 42h48M24 22v30M40 22v30" stroke="#c9cbd6" stroke-width="2.5"/></svg>`,
 clock:(w,c='#fff')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="${c}" stroke-width="5"/><path d="M32 18v15l10 6" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`,
 search:(w,c='#fff')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><circle cx="28" cy="28" r="16" fill="none" stroke="${c}" stroke-width="6"/><path d="M40 40l14 14" stroke="${c}" stroke-width="7" stroke-linecap="round"/></svg>`,
 folder:(w,c='#F5B54A')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><path d="M6 16a4 4 0 0 1 4-4h14l6 6h24a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="${c}"/></svg>`,
 warn:(w,c='#FFC94D')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><path d="M32 6l28 50H4z" fill="${c}"/><path d="M32 24v16" stroke="#111" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="48" r="3.5" fill="#111"/></svg>`,
 chat:(w,c='#fff')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><path d="M10 14h44a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H26l-12 10V46h-4a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" fill="${c}"/></svg>`,
 image:(w,c='#fff',c2='#FF4D1A')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><rect x="8" y="12" width="48" height="40" rx="6" fill="${c}"/><circle cx="22" cy="26" r="5" fill="${c2}"/><path d="M12 48l14-14 10 10 8-8 12 12" fill="${c2}"/></svg>`,
 lock:(w,c='#FFC94D')=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="${c}"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="${c}" stroke-width="2.4" fill="none"/></svg>`,
 hand:(w)=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10l4.6.9a2 2 0 0 1 1.6 2.3l-.9 5A3 3 0 0 1 14.4 21H11a3 3 0 0 1-2.4-1.2L5.2 15a1.5 1.5 0 0 1 2.3-1.9L9 14.5" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
 gift:(w,c='#FF4D1A')=>`<svg width="${w}" height="${w}" viewBox="0 0 64 64"><rect x="8" y="24" width="48" height="32" rx="5" fill="${c}"/><rect x="5" y="16" width="54" height="12" rx="4" fill="#FF7A45"/><rect x="28" y="16" width="8" height="40" fill="#FFC94D"/></svg>`,
 spark:(w,c='#FFC94D')=>`<svg width="${w}" height="${w}" viewBox="0 0 40 40"><path d="M20 0C22 14 26 18 40 20 26 22 22 26 20 40 18 26 14 22 0 20 14 18 18 14 20 0z" fill="${c}"/></svg>`,
};
/* 浏览器窗口外框：返回 HTML，内容区 id 为 id+'body' */
const win=(id,title,{w=900,h=600,x=90,y=500}={})=>`<div class="v-a v-win" id="${id}win" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><span style="margin-left:16px">${title}</span></div><div id="${id}body" style="position:relative;height:${h-64}px;overflow:hidden"></div></div>`;
/* 结尾转化场景的常用块：关注按钮 + 评论框打字 + 发送气泡 + 手指，返回 {html, anim(t,H,{follow,type,send})} */
function ctaBlock(id,sc,H,{y=950,x=70,w=560}={}){
 const html=`<div class="v-a v-btn" id="${id}fo" style="left:${x}px;top:${y}px;width:${w}px"><span id="${id}foi">＋</span><span id="${id}fot">${H.fmt(sc.follow||'关注我')}</span></div>
  <div class="v-a v-input" id="${id}in" style="left:${x}px;top:${y+180}px;width:${w}px"><span style="color:#888;font-size:38px;margin-right:10px">评论区发</span><span id="${id}ty"></span><span class="v-car" id="${id}car"></span></div>
  <div class="v-a v-pill light" id="${id}sent" style="left:${x+20}px;top:${y+180}px;font-size:52px;box-shadow:0 20px 40px rgba(0,0,0,.35);opacity:0">${I.chat(48,'#FF4D1A')} 「${H.fmt(sc.keyword)}」</div>
  <div class="v-a" id="${id}hand" style="left:0;top:0;opacity:0">${I.hand(110)}</div>`;
 const anim=(t,{show=1.3,follow=2.0,type=2.7,send=3.6}={})=>{const MO=M(),$=H.$;const fo=$(id+'fo');
  const press=MO.prog(t,follow-0.12,follow)-MO.prog(t,follow,follow+0.18);const done=t>follow;
  MO.set(fo,{x:-500*(1-MO.tw(t,show,0.5,'outBack')),s:1-0.08*press+(done?0:0.03*Math.sin(t*7)),o:MO.tw(t,show,0.2)});
  fo.style.background=done?'#2a2f45':'#FF4D1A';$(id+'fot').textContent=done?(sc.followed||'已关注'):(sc.follow||'关注我');$(id+'foi').textContent=done?'✓':'＋';
  MO.set($(id+'in'),{x:-500*(1-MO.tw(t,show+0.4,0.5,'outBack')),o:MO.tw(t,show+0.4,0.2)*(1-MO.tw(t,send,0.15))});
  $(id+'ty').textContent=MO.typed(sc.keyword||'',t,type,5);$(id+'car').style.opacity=(Math.floor(t*3)%2||t<type)?1:0;
  const se=MO.tw(t,send,0.7,'outC');MO.set($(id+'sent'),{y:-se*24+MO.wob(t,11,6,0.6)*(se>=1?1:0),s:MO.lerp(0.8,1.12,MO.E.outBack(se)),o:t>send?1:0});
  const fx_=x+w*0.5+50,fy=y+70,ix=x+w*0.55,iy=y+250;
  const hx=MO.kf(t,[[show,900],[follow-0.15,fx_,'inOutC'],[follow+0.4,fx_],[type-0.2,ix,'inOutC'],[send-0.15,ix+20],[send+0.4,1000,'inC']]);
  const hy=MO.kf(t,[[show,y+400],[follow-0.15,fy,'inOutC'],[follow+0.4,fy],[type-0.2,iy,'inOutC'],[send-0.15,iy],[send+0.4,y+600,'inC']]);
  MO.set($(id+'hand'),{x:hx,y:hy,s:1-0.15*press,o:MO.tw(t,show,0.2)*(1-MO.tw(t,send+0.2,0.2))});
  return {fx:x+w*0.4,fy:y+65,sx:x+w*0.4,sy:y+250}};
 return {html,anim}}

/* 统一落版：韬行科技标志 + 名字，背景沿用本片 bg 参数（企鹅由引擎画在下方） */
const outro=(bgOpts={})=>({dur:2.4,bg:'#0b0f22',
 build:(sc,id,H)=>layers(id,`<div class="v-a" id="${id}lg" style="left:390px;top:300px;width:300px;height:300px">${H.BRAND_LOGO(id+'L')}</div>
  <div class="v-a v-t v-ctr" id="${id}nm" style="top:650px;font-size:130px">${H.BRAND.name}</div>
  <div class="v-a v-ctr" id="${id}en" style="top:820px;color:#aab0c8;font-size:34px;font-weight:700;letter-spacing:4px">${H.BRAND.en} · ${H.BRAND.tagline}</div>`),
 init:(sc,id)=>M().split(document.getElementById(id+'nm')),
 anim:(sc,id,t,H)=>{const MO=M(),$=H.$;bg(MO.canvas($(id+'bg')),H.T,{...bgOpts,grid:false});
  MO.set($(id+'st'),{s:1.08-0.08*MO.tw(t,0,0.5,'outE')+0.03*MO.prog(t,0,H.dur),blur:10*(1-MO.tw(t,0,0.35)),o:MO.tw(t,0,0.25)});
  const lp=MO.spring(t-0.05,1.2,6);MO.set($(id+'lg'),{s:Math.max(0,lp),r:(1-Math.min(1,lp))*-40+MO.wob(t,2,3,0.6),y:MO.wob(t,3,8,0.6)});
  $(id+'Lp').style.strokeDashoffset=(1-MO.tw(t,0.2,0.6,'outC')).toFixed(3);
  for(let k=0;k<3;k++)$(id+'Ln'+k).style.transform=`scale(${MO.ease('outBack')(MO.prog(t,0.2+k*0.12,0.5+k*0.12)).toFixed(3)})`;
  const sp=MO.prog(t,0.65,1.05);$(id+'Ls').style.transform=`scale(${(MO.E.outBack(sp)*(1+0.12*Math.sin(t*6)*(sp>=1?1:0))).toFixed(3)}) rotate(${((1-MO.E.outC(sp))*-180+t*30).toFixed(1)}deg)`;
  MO.textIn($(id+'nm')._chars,t,0.4,{stagger:0.08,dur:0.45,from:{y:70,blur:10,o:0}});if(t>1.2)MO.textWave($(id+'nm')._chars,t,{amp:5,from:1.2});
  MO.set($(id+'en'),{o:MO.tw(t,0.8,0.4)*0.9,y:20*(1-MO.tw(t,0.8,0.4))});
  const g=MO.canvas($(id+'fx'));MO.ring(g,t,0.7,540,450,{r1:520,color:'255,201,77'});MO.ring(g,t,1.4,540,450,{r1:520,width:6});MO.glow(g,540,450,300+20*Math.sin(t*4),'rgba(255,77,26,0.25)')},
 sfx:()=>[[0.7,'ding']]});

window.KIT={outro,ACC,GOLD,MINT,PAPER,AVC:['#FF7A45','#5B8DEF','#B06CF2','#2FB98A','#F2B53A'],layers,bg,stage,flash,frame,title,I,win,ctaBlock};
})();
