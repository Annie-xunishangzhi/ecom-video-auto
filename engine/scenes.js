/* 效果类场景：讲"省了多少时间"，不讲操作步骤。所有内容放在 .col 里（由引擎限定在安全区内），文字节点带 data-fit 自动缩字。 */
(function(){
window.EXTRA_TYPES=H=>{
const {$,cl,pr,eo,eb,rise,pop,fmt,C,TYPES}=H;
const col=(id,inner,align)=>`<div class="col" id="${id}col" style="justify-content:${align||'center'}">${inner}</div>`;
const T=(cls,id,txt,style)=>`<div class="${cls}" data-fit id="${id}"${style?` style="${style}"`:''}>${fmt(txt)}</div>`;
const clock=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;const p=n=>String(n).padStart(2,'0');return h?`${h}:${p(m)}:${p(x)}`:`${p(m)}:${p(x)}`};
const pad4=i=>String(i).padStart(4,'0');
return {
 hookContrast:{dur:4.5,bg:'ink',
  build:(sc,id)=>{const card=(k,o,cls)=>`<div class="vcard ${cls}" id="${id}${k}">${T('vl',id+k+'l',o.label)}${T('vv',id+k+'v',o.value)}${T('vn',id+k+'n',o.note||'')}</div>`;
   return col(id,`${T('h big',id+'a',sc.line)}<div class="vs">${card('L',sc.left||{},'old')}${card('R',sc.right||{},'new')}</div>`)},
  anim:(sc,id,t)=>{rise($(id+'a'),t,0.1,0.45,60);rise($(id+'L'),t,0.55,0.4,50);pop($(id+'R'),t,1.5,0.45);
   $(id+'L').style.opacity=Math.min(+$(id+'L').style.opacity,1-0.45*pr(t,1.7,2.1))},
  sfx:()=>[[1.5,'pop']]},
 counter:{dur:4.5,bg:'paper',
  end:sc=>Math.max(1.6,(sc._dur||4.5)*0.55),
  build:(sc,id)=>col(id,`${T('h mid',id+'t',sc.title)}<div class="bignum" data-fit id="${id}n">0</div>${T('unit',id+'u',sc.unit||'')}${T('h cap',id+'c',sc.caption||'')}`),
  anim:(sc,id,t)=>{const e=TYPES.counter.end(sc);rise($(id+'t'),t,0.1,0.4,40);const p=eo(pr(t,0.4,e));
   $(id+'n').textContent=Math.round((sc.from||0)+((sc.to||0)-(sc.from||0))*p).toLocaleString('en-US');
   $(id+'n').style.transform=`scale(${1+0.06*Math.sin(pr(t,e,e+0.3)*Math.PI)})`;rise($(id+'u'),t,0.4,0.4,20);rise($(id+'c'),t,e+0.15,0.4,40)},
  sfx:sc=>[[TYPES.counter.end(sc),'ding']]},
 timer:{dur:4.5,bg:'ink',
  end:sc=>Math.max(1.6,(sc._dur||4.5)*0.55),
  build:(sc,id)=>col(id,`${T('h mid',id+'t',sc.title)}<div class="bignum mono" data-fit id="${id}n">${clock(sc.seconds||0)}</div>${T('h cap',id+'c',sc.caption||'')}`),
  anim:(sc,id,t)=>{const e=TYPES.timer.end(sc);rise($(id+'t'),t,0.1,0.4,40);
   $(id+'n').textContent=clock((sc.seconds||0)*eo(pr(t,0.4,e)));$(id+'n').style.color=t>=e?'var(--sig)':'';rise($(id+'c'),t,e+0.15,0.4,40)},
  sfx:sc=>[[TYPES.timer.end(sc),'ding']]},
 bars:{dur:5,bg:'paper',
  build:(sc,id)=>{const items=(sc.items||[]).slice(0,4);
   return col(id,`${T('h mid',id+'t',sc.title)}${items.map((it,i)=>`<div class="brow" id="${id}r${i}">${T('bl',id+'l'+i,it[0])}<div class="btrack"><div class="bfill${i===items.length-1?' hot':''}" id="${id}f${i}"></div></div>${T('bn',id+'n'+i,`${it[1]} ${it[2]||''}`)}</div>`).join('')}`)},
  anim:(sc,id,t)=>{rise($(id+'t'),t,0.1,0.4,40);const items=(sc.items||[]).slice(0,4);const max=Math.max(1,...items.map(i=>+i[1]||0));
   items.forEach((it,i)=>{const a=0.5+i*0.5;rise($(id+'r'+i),t,a,0.35,40);$(id+'f'+i).style.width=(Math.max(3,(+it[1]||0)/max*100)*eo(pr(t,a+0.1,a+0.8))).toFixed(1)+'%'})},
  sfx:sc=>(sc.items||[]).slice(0,4).map((_,i)=>[0.5+i*0.5+0.8,'tick'])},
 photo:{dur:4,bg:'ink',
  build:(sc,id)=>`${sc.image?`<img class="pbg" id="${id}img" src="../assets/images/${sc.image}">`:`<div class="pbg none" id="${id}img"></div>`}<div class="pshade"></div>`+
   col(id,`${T('h big',id+'a',sc.line1,'color:#fff')}${T('h big',id+'b',sc.line2||'','color:var(--sig)')}`,'flex-end'),
  anim:(sc,id,t)=>{$(id+'img').style.transform=`scale(${1.04+0.05*pr(t,0,sc._dur||4)})`;rise($(id+'a'),t,0.25,0.45,60);rise($(id+'b'),t,0.9,0.45,60)}},
 steps:{dur:5,bg:'paper',
  build:(sc,id)=>{const n=(sc.items||[]).length;
   return col(id,`${T('h mid',id+'t',sc.title)}${(sc.items||[]).map((it,i)=>{const hid=sc.hide_last&&i===n-1;
    return `<div class="srow${hid?' hid':''}" id="${id}r${i}"><div class="sno">${i+1}</div><div class="stx" data-fit id="${id}x${i}">${hid?'？':fmt(it)}</div></div>`}).join('')}`)},
  anim:(sc,id,t)=>{rise($(id+'t'),t,0.1,0.4,40);(sc.items||[]).forEach((it,i,arr)=>{const a=0.6+i*0.6;rise($(id+'r'+i),t,a,0.35,50);
    if(sc.hide_last&&i===arr.length-1)$(id+'x'+i).style.transform=`scale(${1+0.12*Math.abs(Math.sin((t-a)*3))*pr(t,a,a+0.3)})`})},
  sfx:sc=>(sc.items||[]).map((_,i)=>[0.6+i*0.6,'tick'])},
 reveal:{dur:4.5,bg:'accent',
  build:(sc,id)=>col(id,`<div class="num" data-fit id="${id}n">${sc.num||''}</div>${T('h mid',id+'t',sc.title)}${T('h cap',id+'l',sc.line||'','color:var(--paper)')}`),
  anim:(sc,id,t)=>{pop($(id+'n'),t,0.1,0.5);rise($(id+'t'),t,0.5,0.45,60);rise($(id+'l'),t,1.1,0.45,40)},
  sfx:()=>[[0.15,'ding']]},
 statement:{dur:4,bg:'accent',
  build:(sc,id)=>col(id,`${T('k',id+'k',sc.kicker||'')}${T('h huge',id+'a',sc.line1)}<div class="sbar" id="${id}bar"></div>${T('h huge',id+'b',sc.line2||'','color:var(--paper)')}`),
  anim:(sc,id,t)=>{rise($(id+'k'),t,0.05,0.4,30);rise($(id+'a'),t,0.15,0.5,100);$(id+'bar').style.transform=`scaleX(${eo(pr(t,0.9,1.5))})`;rise($(id+'b'),t,1.4,0.5,100)}},
 cta:{dur:4.5,bg:'accent',
  build:(sc,id)=>col(id,`${T('k',id+'k',sc.kicker||'')}${T('h big',id+'t',sc.title)}${sc.keyword?`<div class="pill" data-fit id="${id}p">评论区发「${fmt(sc.keyword)}」</div>`:`<div id="${id}p"></div>`}${T('cfoot',id+'f',sc.foot||'')}`),
  anim:(sc,id,t)=>{rise($(id+'k'),t,0.05,0.4,30);rise($(id+'t'),t,0.15,0.5,80);pop($(id+'p'),t,0.9,0.45);rise($(id+'f'),t,1.4,0.45,30)},
  sfx:sc=>sc.keyword?[[0.9,'pop']]:[]},
 footage:{dur:4,bg:'ink',
  build:(sc,id)=>{const real=!!(sc.frames&&sc.n>0);
   const inner=real?`<canvas id="${id}cv" width="940" height="529"></canvas>${sc.timer?`<div class="fchip" id="${id}tm">00:00</div>`:''}<div class="ftag">实录 · ${sc.speed||1} 倍速</div>`
    :`<div class="fskel">${Array.from({length:5},(_,i)=>`<div class="frow"><i></i><b id="${id}k${i}"></b><em id="${id}c${i}">✓</em></div>`).join('')}</div><div class="fmark">示意</div>`;
   return col(id,`${T('h mid',id+'a',sc.line||'')}<div class="fcard" id="${id}card">${inner}</div>`)},
  load:async(sc)=>{if(!(sc.frames&&sc.n>0))return;sc._imgs=await Promise.all(Array.from({length:sc.n},(_,i)=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error('实录帧加载失败：'+sc.frames+'/'+pad4(i)+'.jpg'));im.src=sc.frames+'/'+pad4(i)+'.jpg'})))},
  anim:(sc,id,t)=>{rise($(id+'a'),t,0.1,0.4,40);pop($(id+'card'),t,0.2,0.45);
   if(sc.frames&&sc.n>0){const cv=$(id+'cv');const im=sc._imgs&&sc._imgs[Math.min(sc.n-1,Math.max(0,Math.floor(t*30)))];
    if(im){const g=cv.getContext('2d');const k=Math.max(cv.width/im.width,cv.height/im.height);const w=im.width*k,h=im.height*k;g.drawImage(im,(cv.width-w)/2,(cv.height-h)/2,w,h)}
    const tm=$(id+'tm');if(tm)tm.textContent=clock(Math.min(t,sc.n/30)*(sc.speed||1))}
   else for(let i=0;i<5;i++){const a=0.6+i*0.55;$(id+'k'+i).style.width=(eo(pr(t,a,a+0.4))*100)+'%';$(id+'c'+i).style.opacity=pr(t,a+0.4,a+0.5)}}},
 outro:window.BRAND_OUTRO?window.BRAND_OUTRO(H):undefined,
};
};
})();
