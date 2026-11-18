/* 竖屏科普视频引擎：读取 window.CONTENT，按场景类型搭建画面，seek(t) 逐帧确定性渲染。
   内容全部在 content*.js 中修改；本文件一般不用动。 */
(function(){
const C=window.CONTENT;
const W=1080;
const $=id=>document.getElementById(id);
const cl=x=>Math.max(0,Math.min(1,x));
const pr=(t,a,b)=>cl((t-a)/(b-a));
const eo=x=>1-Math.pow(1-x,3);
const eb=x=>{const c=1.6;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
function rise(el,t,a,d=0.5,dist=80){if(!el)return;const p=eo(pr(t,a,a+d));el.style.opacity=p;el.style.transform=`translateY(${(1-p)*dist}px)`}
function pop(el,t,a,d=0.45){if(!el)return;const p=pr(t,a,a+d);el.style.opacity=cl(p*3);el.style.transform=`scale(${0.6+0.4*eb(p)})`}
// 行内标记：{g:绿} {s:强调色} {m:灰} {b:换行}
const fmt=s=>String(s??'').replace(/\{([gsm]):([^}]*)\}/g,'<span class="$1">$2</span>').replace(/\{b\}/g,'<br>');
const plain=s=>String(s??'').replace(/\{[gsm]:([^}]*)\}/g,'$1').replace(/\{b\}/g,'');
const ck='<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" stroke="currentColor" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="DO"/></svg>';
const VO=window.VO||{};
const TH=(window.THEMES||{})[C.theme]||{};
const P=Object.assign({},TH,C.palette||{});
const FLIP=!!P.flip;const bgOf=b=>FLIP?(b==='paper'?'ink':b==='ink'?'paper':b):b;
const BGS={paper:'var(--paper)',ink:'var(--ink)',accent:'var(--sig)'};
const FG={paper:'var(--ink)',ink:'var(--paper)',accent:'var(--ink)'};
const root=document.documentElement.style;
if(P.paper)root.setProperty('--paper',P.paper);if(P.ink)root.setProperty('--ink',P.ink);if(P.accent)root.setProperty('--sig',P.accent);
if(P.ok)root.setProperty('--ok',P.ok);if(P.font)root.setProperty('--font',P.font);

/* ---------- 场景类型 ---------- */
const SLOTS=[[90,250],[560,210],[300,380],[720,360],[80,520],[360,540],[760,520],[120,690],[470,700],[800,680],[140,860],[560,860],[260,1020],[820,1010]];
const TYPES={
 hook:{dur:4.5,bg:'ink',
  build:(sc,id)=>`${(sc.tags||[]).slice(0,14).map((g,i)=>{const hot=g.startsWith('*');return `<div class="tag${hot?' hot':''}" id="${id}tg${i}" style="left:${SLOTS[i][0]}px;top:${SLOTS[i][1]}px">${hot?g.slice(1):g}</div>`}).join('')}
   <div class="abs" style="left:70px;top:1180px;right:70px"><div class="h" id="${id}a" style="font-size:${sc.size||132}px">${fmt(sc.line1)}</div><div class="h" id="${id}b" style="font-size:${sc.size||132}px;color:var(--sig)">${fmt(sc.line2)}</div></div>`,
  anim:(sc,id,t)=>{(sc.tags||[]).slice(0,14).forEach((g,i)=>{const a=0.15+i*0.17;const el=$(id+'tg'+i);pop(el,t,a,0.4);el.style.transform+=` translateY(${Math.sin(t*1.3+i)*6}px) rotate(${(i%2?1:-1)*pr(t,a,a+0.4)*2}deg)`});
   rise($(id+'a'),t,0.3,0.5);rise($(id+'b'),t,1.2,0.5)}},
 table:{dur:5.5,bg:'paper',
  build:(sc,id)=>{const cols=sc.columns||[];const g=`grid-template-columns:1.4fr ${'1fr '.repeat(Math.max(0,cols.length-1))}`;
   return `<div class="abs k" style="left:70px;top:250px;color:var(--mut)">${fmt(sc.kicker)}</div>
   <div class="abs h" style="left:70px;top:310px;font-size:110px">${fmt(sc.title)}</div>
   <div class="tbl" id="${id}tbl" style="top:640px"><div class="tr th" style="${g}">${cols.map(c=>`<div>${c}</div>`).join('')}</div>
   ${(sc.rows||[]).map((r,ri)=>`<div class="tr" style="${g}${ri===sc.rows.length-1?';border:none':''}">${r.map((c,ci)=>`<div id="${id}c${ri}_${ci}">${c}</div>`).join('')}</div>`).join('')}</div>
   <div class="loop" id="${id}loop" style="top:1330px">${(sc.loop||[]).map(x=>`<div class="step">${x}</div>`).join('')}</div>
   <div class="abs h" id="${id}cap" style="left:70px;top:1480px;font-size:76px">${fmt(sc.caption)}</div>`},
  anim:(sc,id,t)=>{rise($(id+'tbl'),t,0.1,0.5,60);const E=sc.error||{};const at=E.at??3.0;
   [...($(id+'loop')||{children:[]}).children].forEach((s,i,arr)=>s.classList.toggle('on',t<at&&t>0.5&&i===Math.floor(Math.max(0,t-0.5)/0.45)%arr.length));
   if(E.row!==undefined){const bad=$(id+'c'+E.row+'_'+E.col);const orig=sc.rows[E.row][E.col];
    if(t>at){bad.textContent=E.to;bad.className='cell-bad';bad.parentElement.style.background=`rgba(255,77,26,${0.16*pr(t,at,at+0.3)})`;bad.style.transform=`translateX(${Math.sin(t*60)*8*(1-pr(t,at,at+0.5))}px)`}
    else{bad.textContent=orig;bad.className='';bad.parentElement.style.background='';bad.style.transform=''}}
   rise($(id+'cap'),t,at+0.2,0.45)},
  sfx:(sc)=>[[(sc.error?.at??3.0),'ding']]},
 statement:{dur:4,bg:'accent',
  build:(sc,id)=>`<div class="abs k" id="${id}k" style="left:70px;top:520px">${fmt(sc.kicker)}</div>
   <div class="abs h" id="${id}a" style="left:70px;top:620px;font-size:${sc.size||168}px">${fmt(sc.line1)}</div>
   <div class="abs" id="${id}bar" style="left:70px;top:1060px;height:14px;background:var(--ink);width:560px;transform-origin:left"></div>
   <div class="abs h" id="${id}b" style="left:70px;top:1130px;font-size:${sc.size||168}px;color:var(--paper)">${fmt(sc.line2)}</div>`,
  anim:(sc,id,t)=>{rise($(id+'k'),t,0.05,0.4,30);rise($(id+'a'),t,0.15,0.5,120);$(id+'bar').style.transform=`scaleX(${eo(pr(t,0.9,1.5))})`;rise($(id+'b'),t,1.4,0.5,120)}},
 terminal:{dur:6,bg:'ink',
  times:sc=>{let at=0.8;return (sc.lines||[]).map(l=>{const a=at;at+=plain(l).startsWith('$')?0.9:0.55;return a})},
  build:(sc,id)=>`<div class="abs num s" style="left:62px;top:220px" id="${id}n">${sc.num||''}</div>
   <div class="abs h" style="left:70px;top:460px;font-size:96px" id="${id}t">${fmt(sc.title)}</div>
   <div class="term mono" id="${id}term"><div class="dots"><i></i><i></i><i></i></div><div id="${id}lines"></div></div>
   ${sc.badge?`<div class="badge" id="${id}badge"><svg width="60" height="60" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5" stroke="#141210" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>${fmt(sc.badge)}</div>`:''}
   <div class="foot" id="${id}foot" style="top:1540px;color:#9C9282;text-align:center">${fmt(sc.foot)}</div>`,
  anim:(sc,id,t)=>{rise($(id+'n'),t,0.05,0.4,40);rise($(id+'t'),t,0.2,0.45,40);rise($(id+'term'),t,0.35,0.5,60);
   const ts=TYPES.terminal.times(sc);
   $(id+'lines').innerHTML=(sc.lines||[]).map((l,i)=>{if(t<ts[i])return '';const p0=plain(l);
    if(p0.startsWith('$')){const n=Math.floor(pr(t,ts[i],ts[i]+0.6)*p0.length);if(n<p0.length)return '<div>'+p0.slice(0,n)+'<span class="car" style="height:38px"></span></div>';
     return '<div><span class="m">$</span>'+fmt(l.replace(/^\s*\$/,''))+'</div>'}
    return '<div>'+fmt(l)+'</div>'}).join('');
   const bt=(ts.at(-1)||0.8)+0.7;pop($(id+'badge'),t,bt,0.45);rise($(id+'foot'),t,bt+0.3,0.4,20)},
  sfx:sc=>{const ts=TYPES.terminal.times(sc);return sc.badge?[[(ts.at(-1)||0.8)+0.7,'ding']]:[]}},
 form:{dur:7,bg:'paper',
  build:(sc,id)=>`<div class="abs num" style="left:62px;top:220px;color:var(--sig)" id="${id}n">${sc.num||''}</div>
   <div class="abs h" style="left:70px;top:460px;font-size:96px" id="${id}t">${fmt(sc.title)}</div>
   <div class="form" id="${id}form" style="top:630px">${(sc.fields||[]).map((f,i)=>`<div class="fr"><div class="fl">${f[0]}</div><div class="fv" id="${id}fv${i}"></div><div class="rb" id="${id}rb${i}">${sc.readback||'读回 ✓'}</div></div>`).join('')}</div>
   <div class="note" id="${id}note" style="top:${630+80+(sc.fields||[]).length*118+30}px">${fmt(sc.note)}</div>`,
  anim:(sc,id,t)=>{rise($(id+'n'),t,0.05,0.4,40);rise($(id+'t'),t,0.2,0.45,40);rise($(id+'form'),t,0.35,0.5,60);
   (sc.fields||[]).forEach((f,i)=>{const a=0.9+i*0.85,d=0.5;const v=String(f[1]);const n=Math.round(pr(t,a,a+d)*v.length);
    $(id+'fv'+i).innerHTML=v.slice(0,n)+(t>=a&&t<a+d+0.2?'<span class="car"></span>':'');pop($(id+'rb'+i),t,a+d+0.15,0.35)});
   rise($(id+'note'),t,1.0,0.4,20)},
  sfx:sc=>(sc.fields||[]).map((f,i)=>[0.9+i*0.85+0.65,'tick'])},
 checklist:{dur:6,bg:'paper',
  press:sc=>0.5+(sc.items||[]).length*0.55+1.3,
  build:(sc,id)=>`<div class="abs num" style="left:62px;top:220px;color:var(--sig)" id="${id}n">${sc.num||''}</div>
   <div class="abs h" style="left:70px;top:460px;font-size:96px" id="${id}t">${fmt(sc.title)}</div>
   ${(sc.items||[]).map((c,i)=>`<div class="ck" id="${id}ck${i}" style="top:${660+i*140}px"><div class="box" id="${id}bx${i}"></div>${c[0]}<small>${c[1]||''}</small></div>`).join('')}
   ${sc.button?`<div class="btn" id="${id}btn" style="top:${Math.max(1420,660+(sc.items||[]).length*140+60)}px">${fmt(sc.button)}</div>`:''}`,
  anim:(sc,id,t)=>{rise($(id+'n'),t,0.05,0.4,40);rise($(id+'t'),t,0.2,0.45,40);
   (sc.items||[]).forEach((c,i)=>{const a=0.5+i*0.55;rise($(id+'ck'+i),t,a,0.35,40);const p=eo(pr(t,a+0.25,a+0.55));const b=$(id+'bx'+i);
    b.innerHTML=ck.replace('DO',(1-p).toFixed(3));b.style.background=p>0.05?'var(--ok)':'transparent';b.style.borderColor=p>0.05?'var(--ok)':'var(--ink)';b.style.color='#fff'});
   const bt=$(id+'btn');if(!bt)return;const pa=TYPES.checklist.press(sc);pop(bt,t,pa-1.2,0.4);
   const press=pr(t,pa-0.2,pa-0.05)-pr(t,pa,pa+0.15);bt.style.transform+=` scale(${1-press*0.05})`;
   const done=t>pa&&sc.buttonDone;bt.style.background=done?'var(--sig)':'var(--ink)';bt.innerHTML=fmt(done?sc.buttonDone:sc.button)},
  sfx:sc=>[...(sc.items||[]).map((c,i)=>[0.5+i*0.55+0.25,'tick']),...(sc.button?[[TYPES.checklist.press(sc),'ding']]:[])]},
 status:{dur:5.5,bg:'ink',
  build:(sc,id)=>`<div class="abs h" id="${id}t" style="left:70px;top:300px;font-size:${sc.size||150}px">${fmt(sc.title)}</div>
   ${(sc.states||[]).map((s,i)=>`<div class="st" id="${id}st${i}" style="top:${620+i*165}px"><div class="dot"></div>${s[0]}<em>${s[1]||''}</em></div>`).join('')}
   <div class="abs h" id="${id}cap" style="left:70px;right:70px;top:${620+(sc.states||[]).length*165+40}px;font-size:60px;line-height:1.35">${fmt(sc.caption)}</div>`,
  anim:(sc,id,t)=>{rise($(id+'t'),t,0.1,0.5,60);const n=(sc.states||[]).length;const hl=t<1.0?-1:Math.min(n-1,Math.floor((t-1.0)/0.75));
   (sc.states||[]).forEach((s,i)=>{const el=$(id+'st'+i);rise(el,t,0.4+i*0.12,0.4,40);const on=i===hl;
    el.style.borderColor=on?'var(--sig)':(i<hl?'#5A5247':'#3A342D');el.style.color=on?'var(--paper)':(i<hl?'#A99E8C':'#6E665A');
    el.style.background=on?'#2A1A12':'transparent';el.querySelector('.dot').style.background=on?'var(--sig)':(i<hl?'#A99E8C':'#3A342D')});
   rise($(id+'cap'),t,1.0+n*0.75+0.2,0.45,40)}},
 cta:{dur:4.5,bg:'accent',
  build:(sc,id)=>`<div class="abs k" id="${id}k" style="left:70px;top:330px">${fmt(sc.kicker)}</div>
   <div class="abs h" id="${id}t" style="left:70px;top:420px;font-size:${sc.size||130}px">${fmt(sc.title)}</div>
   ${(sc.files||[]).map((f,i)=>`<div class="file" id="${id}f${i}" style="top:${880+i*200}px"><b>${f[0]}</b>${f[1]}<span>${f[2]||''}</span></div>`).join('')}
   <div class="foot" id="${id}foot" style="top:${880+(sc.files||[]).length*200+100}px;right:460px;font-weight:700">${fmt(sc.foot)}</div>`,
  anim:(sc,id,t)=>{rise($(id+'k'),t,0.05,0.4,30);rise($(id+'t'),t,0.15,0.5,80);
   (sc.files||[]).forEach((f,i)=>{const el=$(id+'f'+i);const p=eo(pr(t,0.7+i*0.25,1.2+i*0.25));el.style.opacity=p;el.style.transform=`translateX(${(1-p)*-500}px) rotate(${(1-p)*-6}deg)`});
   rise($(id+'foot'),t,1.8,0.45,30)}},
};

/* ---------- 搭建 ---------- */
Object.assign(TYPES,(window.EXTRA_TYPES?window.EXTRA_TYPES({$,cl,pr,eo,eb,rise,pop,fmt,plain,W,C,TYPES}):{}));
for(const k in TYPES)if(!TYPES[k])delete TYPES[k];
/* 交给画面代码的工具：MO 动效库、fmt 行内标记、安全区（关键内容放在 top–bottom 之间，bottom 以下是字幕条和平台界面） */
const HX={$,cl,pr,eo,eb,rise,pop,fmt,plain,W,H:1920,SAFE:{top:150,bottom:1460,left:60,right:1020},C,MO:window.MO,BRAND:window.BRAND,BRAND_LOGO:window.BRAND_LOGO,img:f=>'../assets/images/'+f,
 /* 配音对齐：这个词在本场景里大约第几秒开始说（按字数比例估算，和字幕同一算法；找不到返回 null） */
 at:(sc,word)=>{const v=String(sc.vo||'');const k=v.indexOf(word);if(k<0||!sc._vo)return null;const sp=x=>x.replace(/[，。！？、；：,.!?;:\s「」“”"]/g,'').length;
  return +(sc._lead+sc._vo*sp(v.slice(0,k))/Math.max(1,sp(v))).toFixed(3)},
 /* 实录帧：footage 场景有素材包时，返回 t 时刻那一帧（Image，按 30 帧/秒，播完停在最后一帧）；没有实录返回 null，画面要显示"示意"占位 */
 frame:(sc,t)=>sc._imgs&&sc.n>0?sc._imgs[Math.min(sc.n-1,Math.max(0,Math.floor(t*30)))]:null,
 /* 把一帧按 cover 方式画进 canvas 的 (x,y,w,h) */
 drawFrame:(g,im,x,y,w,h)=>{if(!im)return;const k=Math.max(w/im.width,h/im.height);const dw=im.width*k,dh=im.height*k;g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,dw,dh);g.restore()}};
const VIS=window.VISUALS||{};
const SC=C.scenes.slice();if(C.outro&&(VIS.outro||TYPES.outro))SC.push({type:'outro',visual:VIS.outro?'outro':undefined,mascot:C.outroMascot===false?undefined:{pos:'big',pose:'wave',wave:true,in:0.45}});const T=[0];
/* 场景的画面：剧本里写了 visual 就用这条视频自己的画面代码（out/<编号>/visual.js），否则用兜底场景库 */
const TY=sc=>sc._ty;
SC.forEach((sc,i)=>{if(sc.visual&&!VIS[sc.visual])throw new Error('画面代码里没有场景 '+sc.visual+'（检查 visual.js 的 window.VISUALS）');
 sc._ty=sc.visual?VIS[sc.visual]:TYPES[sc.type];sc._custom=!!sc.visual;const ty=sc._ty;if(!ty)throw new Error('未知场景类型 '+sc.type);sc._vo=(sc.v&&VO[sc.v])?+VO[sc.v]:0;sc._lead=sc.lead??0.15;sc._tail=sc.tail??0.4;sc._dur=sc._vo?Math.max(sc.dur||0,2.0,sc._lead+sc._vo+sc._tail):(sc.dur||ty.dur);/* 有配音时按配音长度走，避免画面停住没人说话 */sc._bg=bgOf(sc.bg||ty.bg);T.push(T[i]+sc._dur)});
document.body.insertAdjacentHTML('afterbegin',SC.map((sc,i)=>`<div class="sc${sc._bg==='accent'?' acc':''}" id="sc${i}" style="background:${BGS[sc._bg]||sc._bg};--scbg:${BGS[sc._bg]||sc._bg};color:${FG[sc._bg]||'var(--ink)'}">${TY(sc).build(sc,'s'+i+'_',HX)}</div>`).join(''));
SC.forEach((sc,i)=>{if(TY(sc).init)TY(sc).init(sc,'s'+i+'_',HX)});
{const seen=new Set,dup=new Set;document.querySelectorAll('[id]').forEach(e=>{if(seen.has(e.id))dup.add(e.id);seen.add(e.id)});
 if(dup.size)throw new Error('画面里有重复的元素 id（会互相覆盖动画）：'+[...dup].slice(0,8).join('、'))}

/* ---------- 吉祥物 ---------- */
const M=C.mascot||null;
const PRESET=C.legacyLayout?{topRight:{S:360,x:700,f:450,bub:[745,95,'r']},bottomRight:{S:440,x:650,f:1900,bub:[700,1600,'r']},
 big:{S:640,x:470,f:1890,bub:[620,1235,'b']},cta:{S:480,x:620,f:1965,bub:[680,1455,'r']}}
 :{topRight:{S:300,x:740,f:450,bub:[760,190,'r']},bottomRight:{S:360,x:680,f:1440,bub:[700,1180,'r']},
 big:{S:520,x:520,f:1440,bub:[600,880,'b']},cta:{S:400,x:650,f:1440,bub:[690,1150,'r']}};
const MP={};
if(M){SC.forEach((sc,i)=>{const m=sc.mascot;if(!m)return;const pre=PRESET[m.pos||'bottomRight'];const b=m.bubble||pre.bub;
 const say=(m.say||[]);MP[i]={...pre,...m,S:m.S||pre.S,x:m.x??pre.x,f:m.f??pre.f,in:m.in??0.35,pz:m.pose?(typeof m.pose==='string'?[[0,m.pose]]:m.pose):[[0,'base']],
  bub:say.map((q,k)=>[q[0],k+1<say.length?say[k+1][0]-0.05:99,q[1],b[0],b[1],b[2]])}})}
const FEET=M?.feet??0.89;
document.body.insertAdjacentHTML('beforeend',M?`<div class="mascot" id="mascot">${(M.poses||[]).map(p=>`<img src="${M.dir||'peng'}/${p}.png" data-p="${p}">`).join('')}
<svg id="mSweat" viewBox="0 0 40 60" style="position:absolute;left:80%;top:18%;width:9%;"><path d="M20 2C12 20 4 30 4 40a16 16 0 0 0 32 0C36 30 28 20 20 2z" fill="#7EC8F2" stroke="#141210" stroke-width="3"/><path d="M12 40a8 8 0 0 0 6 9" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>
<div id="mBang" style="position:absolute;left:78%;top:-4%;font:900 1px/1 sans-serif;color:var(--sig);">!</div><div id="mSpark"></div></div>
<div class="bub" id="bub"><span id="bubT"></span></div>`:'');
document.body.insertAdjacentHTML('beforeend','<div class="wipe" id="wipe"></div>');
const star=c=>`<svg viewBox="0 0 40 40"><path d="M20 0C22 14 26 18 40 20 26 22 22 26 20 40 18 26 14 22 0 20 14 18 18 14 20 0z" fill="${c}" stroke="#141210" stroke-width="2.5"/></svg>`;
if(M)$('mSpark').innerHTML=[[-6,8,'#FFD23F'],[92,2,'#fff'],[100,30,'#FFD23F'],[-12,32,'#fff']].map(p=>`<div class="spk" style="left:${p[0]}%;top:${p[1]}%">${star(p[2])}</div>`).join('');
function hop(lt,h0,H=70){const u=lt-h0;if(u<0||u>0.6)return{y:0,sx:1,sy:1};
 if(u<0.08){const p=u/0.08;return{y:0,sx:1+0.08*p,sy:1-0.1*p}}
 if(u<0.42){const p=(u-0.08)/0.34;return{y:-H*4*p*(1-p),sx:1-0.04*(1-p),sy:1+0.07*(1-p)}}
 const p=(u-0.42)/0.18;const k=Math.sin(p*Math.PI)*(1-p);return{y:0,sx:1+0.07*k,sy:1-0.09*k}}
function mascot(i,lt){
 if(!M)return;const el=$('mascot'),m=MP[i],bub=$('bub');
 if(!m||lt<m.in){el.style.display='none';bub.style.display='none';return}
 let mx=m.x,mf=m.f,mS=m.S;if(m.move&&window.MO){const v=MO.kf(lt,m.move.map(k=>[k[0],[k[1],k[2],k[3]??m.S],k[4]||'inOutC']));mx=v[0];mf=v[1];mS=v[2]}
 el.style.display='block';el.style.width=el.style.height=mS+'px';el.style.left=mx+'px';el.style.top=(mf-FEET*mS)+'px';
 const tt=lt-m.in;const p=pr(tt,0,0.5);const e=eb(p);
 let cur=m.pz[0];m.pz.forEach(q=>{if(lt>=q[0])cur=q});let pose=cur[1];const since=cur[0]>0?lt-cur[0]:99;
 let y=(1-e)*m.S*0.5,x=0,rot=(1-e)*-8;let sx=1+0.10*Math.sin(p*Math.PI)*(1-p),sy=1-0.10*Math.sin(p*Math.PI)*(1-p);
 if(since<0.3){const k=Math.sin(since/0.3*Math.PI)*(1-since/0.3);sx*=1+0.10*k;sy*=1-0.10*k}
 rot+=Math.sin(tt*2.2*Math.PI)*2.6;y-=Math.abs(Math.sin(tt*2.2*Math.PI))*7;const br=Math.sin(tt*2.2*Math.PI*2);sy*=1+br*0.018;sx*=1-br*0.014;
 if(m.wave)rot+=Math.sin(tt*5)*2.5;
 if(m.startle!==undefined){const h=hop(lt,m.startle,55);y+=h.y;sx*=h.sx;sy*=h.sy;x+=Math.sin(lt*55)*7*(pr(lt,m.startle+0.45,m.startle+0.5)-pr(lt,m.startle+0.5,m.startle+1.0))}
 (m.hop||[]).forEach(h0=>{const h=hop(lt,h0,m.f<600?40:70);y+=h.y;sx*=h.sx;sy*=h.sy});
 if(m.nod){const sc=SC[i];const n=(sc.fields||sc.items||[1,2,3,4,5,6]).length;for(let k=0;k<n;k++){const a=0.9+k*0.85+0.6;const q=pr(lt,a,a+0.3);y+=Math.sin(q*Math.PI)*7;sy*=1-Math.sin(q*Math.PI)*0.04;sx*=1+Math.sin(q*Math.PI)*0.03}}
 el.style.opacity=cl(p*4);el.style.transform=`translate(${x}px,${y}px) rotate(${rot}deg) scale(${sx},${sy})`;
 const cb=m.bub.find(q=>lt>=q[0]&&lt<q[1]);const has=n=>(M.poses||[]).includes(n);
 if(pose==='base'){const talking=cb&&lt<cb[0]+cb[2].length*0.05+0.35;
  if(talking&&has('talk'))pose=Math.floor((lt-cb[0])/0.11)%2?'talk':'base';
  else if(has('blink')){const bt=(tt+i*0.7)%2.8;if(bt>2.15&&bt<2.29)pose='blink'}}
 el.querySelectorAll('img').forEach(im=>im.style.display=im.dataset.p===pose?'block':'none');
 const sw=$('mSweat');if(m.startle!==undefined&&lt>m.startle+0.35){sw.style.display='block';const q=((lt-m.startle-0.35)%1.4)/1.4;sw.style.transform=`translateY(${q*40}px)`;sw.style.opacity=q<0.8?1:(1-q)/0.2}else sw.style.display='none';
 const bg=$('mBang');if(m.startle!==undefined&&lt>m.startle&&lt<m.startle+1.6){bg.style.display='block';const q=pr(lt,m.startle,m.startle+0.25);bg.style.fontSize=(m.S*0.22)+'px';bg.style.transform=`scale(${eb(q)}) rotate(12deg)`;bg.style.opacity=1-pr(lt,m.startle+1.3,m.startle+1.6)}else bg.style.display='none';
 const sp=$('mSpark');if(m.spark!==undefined&&lt>m.spark&&lt<m.spark+1.6){sp.style.display='block';[...sp.children].forEach((c,k)=>{const q=pr(lt,m.spark+k*0.08,m.spark+k*0.08+0.35);const f=1-pr(lt,m.spark+1.1,m.spark+1.6);c.style.transform=`scale(${eb(q)*f}) rotate(${(lt-m.spark)*120}deg)`})}else sp.style.display='none';
 if(cb){bub.style.display='block';bub.className='bub '+cb[5];bub.style.top=cb[4]+'px';
  if(cb[5]==='r'){bub.style.left='auto';bub.style.right=(W-cb[3])+'px'}else{bub.style.right='auto';bub.style.left=cb[3]+'px'}
  const q=pr(lt,cb[0],cb[0]+0.3);bub.style.opacity=cl(q*3);bub.style.transform=`scale(${0.5+0.5*eb(q)}) translateY(${Math.sin(lt*2.4)*3}px)`;
  const n=Math.ceil(pr(lt,cb[0]+0.05,cb[0]+0.05+cb[2].length*0.05)*cb[2].length);$('bubT').innerHTML=cb[2].slice(0,n)+'<span style="visibility:hidden">'+cb[2].slice(n)+'</span>'}
 else bub.style.display='none';
}

/* ---------- 时间轴 ---------- */
function seek(t){
 let i=T.findIndex((b,k)=>k<SC.length&&t>=b&&t<T[k+1]);if(i<0)i=SC.length-1;
 SC.forEach((sc,k)=>$('sc'+k).style.display=k===i?'block':'none');
 const lt=t-T[i];const el=$('sc'+i);
 TY(SC[i]).anim(SC[i],'s'+i+'_',lt,Object.assign(HX,{dur:SC[i]._dur,T:t,i}));
 if(!SC[i]._custom&&window.MO&&SC[i].type!=='outro')MO.camera(el,lt,SC[i]._dur,{push:0.05,drift:7,rot:0.3,seed:i*13+1}); /* 兜底场景也不许整段不动 */
 mascot(i,lt);
 const w=$('wipe');
 if(i>0&&lt<0.35){const p=eo(lt/0.35);w.style.display='block';const bg=BGS[SC[i-1]._bg]||SC[i-1]._bg;const tr=(window.TRANSITIONS||{})[SC[i].tr||P.transition];
  if(SC[i].tr==='none'||(SC[i]._custom&&!SC[i].tr))w.style.display='none'; /* 自写画面自己管入场，不叠引擎的色块转场 */else if(tr)tr(w,p,bg,lt);else{w.style.background=bg;w.style.transform=`translateY(${-p*100}%)`}}else w.style.display='none';
 caption(t);
 document.body.style.opacity=1-pr(t,T.at(-1)-0.6,T.at(-1));
}
// 给配乐用的时间线：转场点 + 音效点
const sfx=[];SC.forEach((sc,i)=>{(TY(sc).sfx?.(sc)||[]).forEach(([a,k])=>sfx.push([+(T[i]+a).toFixed(3),k]));const m=MP[i];if(m){(m.hop||[]).forEach(h=>sfx.push([T[i]+h,'pop']));if(m.startle!==undefined)sfx.push([T[i]+m.startle,'pop'])}});
// 字幕：按标点把配音文本切成短句，按字数分配时长
const CAPS=[];const voice=[];const footage=[];
SC.forEach((sc,i)=>{if(sc.type==='footage')footage.push({scene:i,slot:sc.slot||null,at:+T[i].toFixed(3),dur:+sc._dur.toFixed(3)});
 if(!sc._vo)return;voice.push({id:sc.v,at:+(T[i]+sc._lead).toFixed(3)});
 const parts=String(sc.cap||sc.vo||'').split(/[，。！？、；：,.!?;:\s]+/).filter(Boolean);const n=parts.reduce((a,b)=>a+b.length,0)||1;let at=T[i]+sc._lead;
 parts.forEach(x=>{const d=sc._vo*x.length/n;CAPS.push([+at.toFixed(3),+(at+d).toFixed(3),x]);at+=d})});
if(C.captions!==false&&!C.legacyLayout)document.body.insertAdjacentHTML('beforeend','<div id="cap"><span id="capT"></span></div>');
function caption(t){const el=$('cap');if(!el)return;const c=CAPS.find(c=>t>=c[0]&&t<c[1]);
 if(!c){el.style.display='none';return}el.style.display='flex';const s=$('capT');s.textContent=c[2];s.style.fontSize=Math.min(48,900/c[2].length)+'px';
 const q=pr(t,c[0],c[0]+0.18);s.style.transform=`translateY(${(1-eo(q))*14}px) scale(${0.92+0.08*eb(q)})`;s.style.opacity=Math.min(1,q*2.5)}
// .col 的上下边界：避开吉祥物
SC.forEach((sc,i)=>{const c=$('s'+i+'_col');if(!c)return;const m=MP[i];let top=190,bottom=1440;
 if(m){const mt=m.f-FEET*m.S;if(mt<700)top=Math.max(top,m.f+20);else bottom=Math.min(bottom,mt-20)}
 c.style.top=top+'px';c.style.height=(bottom-top)+'px'});
// 自动缩字：先缩小字号（最多到 60%），还放不下就换行；整列仍超高则整体缩小
function fitAll(){document.querySelectorAll('.sc').forEach(sc=>{const d=sc.style.display;sc.style.display='block';
 sc.querySelectorAll('[data-fit]').forEach(el=>{const op=el.style.transform;el.style.transform='none';if(!el.dataset.fs)el.dataset.fs=parseFloat(getComputedStyle(el).fontSize);el.style.fontSize=el.dataset.fs+'px';el.style.whiteSpace='nowrap';let fs=+el.dataset.fs;const min=fs*0.6;
  while(el.scrollWidth>el.clientWidth+1&&fs>min){fs*=0.95;el.style.fontSize=fs+'px'}
  if(el.scrollWidth>el.clientWidth+1){el.style.whiteSpace='normal';el.style.wordBreak='break-all'}el.style.transform=op});
 const c=sc.querySelector('.col');if(c){c.style.zoom='';let z=1;while(c.scrollHeight>c.clientHeight+1&&z>0.4){z-=0.04;c.style.zoom=z;c.style.width=(940/z)+'px'}}
 sc.style.display=d})}
fitAll();
window.ready=async()=>{await document.fonts.ready;
 await Promise.all([...document.images].map(im=>im.complete?(im.naturalWidth?null:Promise.reject(new Error('图片加载失败：'+im.getAttribute('src')))):new Promise((res,rej)=>{im.onload=res;im.onerror=()=>rej(new Error('图片加载失败：'+im.getAttribute('src')))})));
 await Promise.all(SC.map(sc=>TY(sc).load?TY(sc).load(sc):(sc.frames&&sc.n>0&&TYPES.footage?TYPES.footage.load(sc):null)));fitAll();seek(0)};
window.TIMELINE={dur:T.at(-1),cuts:T.slice(1,-1),sfx,bpm:C.bpm||120,voice,captions:CAPS,footage};
window.seek=seek;window.T=T;
})();
