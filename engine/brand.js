/* 品牌：韬行科技的标志与片尾落版 */
(function(){
window.BRAND={name:'韬行科技',en:'TAOXING TECH',tagline:'AI 电商自动化'};
// 标志：白色圆角徽章 + 一条向右上行进的路径，终点一颗金色火花
window.BRAND_LOGO=id=>`<svg id="${id}" viewBox="0 0 200 200" width="100%" height="100%">
 <rect x="10" y="10" width="180" height="180" rx="48" fill="#fff" stroke="#141210" stroke-width="9"/>
 <path id="${id}p" d="M42 150 L82 108 L112 130 L152 72" fill="none" stroke="var(--sig)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
 ${[[42,150],[82,108],[112,130]].map((c,k)=>`<circle id="${id}n${k}" cx="${c[0]}" cy="${c[1]}" r="13" fill="#141210" stroke="#fff" stroke-width="5" style="transform-origin:${c[0]}px ${c[1]}px"/>`).join('')}
 <g id="${id}s" style="transform-origin:152px 66px"><path d="M152 36 C155 56 162 63 182 66 C162 69 155 76 152 96 C149 76 142 69 122 66 C142 63 149 56 152 36Z" fill="#FFC94D" stroke="#141210" stroke-width="6" stroke-linejoin="round"/></g>
</svg>`;
window.BRAND_OUTRO=H=>({dur:2.2,bg:'paper',
  build:(sc,id)=>`<div class="abs" id="${id}lg" style="left:390px;top:330px;width:300px;height:300px">${BRAND_LOGO(id+'L')}</div>
   <div class="abs h" data-fit id="${id}nm" style="left:70px;right:70px;top:680px;font-size:130px;text-align:center">${BRAND.name}</div>
   <div class="abs k" data-fit id="${id}en" style="left:70px;right:70px;top:850px;text-align:center;opacity:.6">${BRAND.en} · ${BRAND.tagline}</div>`,
  anim:(sc,id,t)=>{const {$,pr,eo,eb,pop,rise}=H;pop($(id+'lg'),t,0.05,0.4);
   $(id+'Lp').style.strokeDashoffset=(1-eo(pr(t,0.15,0.7))).toFixed(3);
   for(let k=0;k<3;k++)$(id+'Ln'+k).style.transform=`scale(${eb(pr(t,0.15+k*0.12,0.45+k*0.12))})`;
   const p=pr(t,0.6,1.0);$(id+'Ls').style.transform=`scale(${eb(p)}) rotate(${(1-eo(p))*-180}deg)`;
   rise($(id+'nm'),t,0.35,0.4,50);rise($(id+'en'),t,0.6,0.4,30);const e=$(id+'en');e.style.opacity=Math.min(0.6,+e.style.opacity)},
  sfx:()=>[[0.6,'ding']]});
})();
