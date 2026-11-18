/* 动效基础库 window.MO —— 所有函数都是"时间 t 的纯函数"：同一个 t 永远画出同一帧。
   渲染是逐帧 seek(t) 截图，所以不能用 CSS animation / transition / requestAnimationFrame / Math.random。
   随机一律用 MO.rng(seed) 或 MO.hash(i, seed)；持续微动用 MO.noise / MO.wob。 */
(function(){
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const lerp=(a,b,p)=>a+(b-a)*p;
const prog=(t,a,b)=>b===a?(t>=a?1:0):cl((t-a)/(b-a));

/* ---------- 缓动 ---------- */
const E={
 lin:x=>x,
 inQ:x=>x*x, outQ:x=>1-(1-x)*(1-x), inOutQ:x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2,
 inC:x=>x*x*x, outC:x=>1-Math.pow(1-x,3), inOutC:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,
 outQuint:x=>1-Math.pow(1-x,5), inOutQuint:x=>x<.5?16*Math.pow(x,5):1-Math.pow(-2*x+2,5)/2,
 inE:x=>x===0?0:Math.pow(2,10*x-10), outE:x=>x===1?1:1-Math.pow(2,-10*x),
 inOutE:x=>x===0?0:x===1?1:x<.5?Math.pow(2,20*x-10)/2:(2-Math.pow(2,-20*x+10))/2,
 inOutSine:x=>-(Math.cos(Math.PI*x)-1)/2,
 outBack:x=>{const c=1.7,c3=c+1;return 1+c3*Math.pow(x-1,3)+c*Math.pow(x-1,2)},
 outBackBig:x=>{const c=3,c3=c+1;return 1+c3*Math.pow(x-1,3)+c*Math.pow(x-1,2)},
 inBack:x=>{const c=1.7;return (c+1)*x*x*x-c*x*x},
 outElastic:x=>x===0?0:x===1?1:Math.pow(2,-10*x)*Math.sin((x*10-.75)*(2*Math.PI)/3)+1,
};
/* 端点钉死：浮点误差会让 outBack(0) 得到 -2e-16，画布半径为负会直接报错 */
for(const k in E){const f=E[k];E[k]=x=>x<=0?0:x>=1?1:f(x)}
const ease=e=>typeof e==='function'?e:(E[e]||E.outC);
/* 弹簧：u 为开始后的秒数，返回 0→1 带回弹，f 频率（次/秒），d 阻尼 */
const spring=(u,f=1.6,d=5.5)=>u<=0?0:1-Math.exp(-d*u)*Math.cos(2*Math.PI*f*u);

/* 关键帧：keys = [[t, 值, 缓动名?], ...]，值可以是数字或数组。缓动作用在"到达这一帧"的那段 */
function kf(t,keys){
 if(!keys.length)return 0;if(t<=keys[0][0])return keys[0][1];
 for(let i=1;i<keys.length;i++){const [t1,v1,e]=keys[i];if(t<=t1){const [t0,v0]=keys[i-1];const p=ease(e||'inOutC')(prog(t,t0,t1));
  return Array.isArray(v0)?v0.map((a,k)=>lerp(a,v1[k],p)):lerp(v0,v1,p)}}
 return keys.at(-1)[1];
}
/* 区间进度 + 缓动：从 a 开始、持续 d 秒 */
const tw=(t,a,d,e='outC')=>ease(e)(prog(t,a,a+d));

/* ---------- 确定性随机与噪声 ---------- */
function rng(seed){let s=(seed>>>0)||1;return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const hash=(i,seed=0)=>{let h=Math.imul((i|0)^0x9E3779B9,0x85EBCA6B)^Math.imul(seed|0,0xC2B2AE35);h^=h>>>13;h=Math.imul(h,0x27D4EB2F);h^=h>>>16;return(h>>>0)/4294967296};
const noise=(x,seed=0)=>{const i=Math.floor(x),f=x-i;const u=f*f*(3-2*f);return(lerp(hash(i,seed),hash(i+1,seed),u))*2-1};
/* 持续漂移：返回 [-amp, amp] 的平滑值；两层噪声叠加更自然 */
const wob=(t,seed=0,amp=1,freq=0.4)=>amp*(0.7*noise(t*freq,seed)+0.3*noise(t*freq*2.7,seed+77));

/* ---------- DOM ---------- */
/* 一次性组合 transform：x y z（px）、s/sx/sy 缩放、r 旋转、rx ry 3D 旋转（deg）、o 透明度、blur（px） */
function set(el,o){if(!el)return el;const tf=[];
 if(o.x||o.y||o.z)tf.push(`translate3d(${(o.x||0).toFixed(2)}px,${(o.y||0).toFixed(2)}px,${(o.z||0).toFixed(2)}px)`);
 if(o.rx)tf.push(`rotateX(${o.rx.toFixed(2)}deg)`);if(o.ry)tf.push(`rotateY(${o.ry.toFixed(2)}deg)`);if(o.r)tf.push(`rotate(${o.r.toFixed(2)}deg)`);
 const s=o.s??1;const sx=(o.sx??1)*s,sy=(o.sy??1)*s;if(sx!==1||sy!==1)tf.push(`scale(${sx.toFixed(4)},${sy.toFixed(4)})`);
 el.style.transform=tf.join(' ');if(o.o!==undefined)el.style.opacity=cl(o.o).toFixed(3);
 if(o.blur!==undefined)el.style.filter=o.blur>0.05?`blur(${o.blur.toFixed(2)}px)`:'';
 if(o.clip!==undefined)el.style.clipPath=o.clip;return el}
const $=id=>document.getElementById(id);
const all=(sel,root=document)=>[...root.querySelectorAll(sel)];

/* 把元素里的文字拆成逐字 span（保留 {s:..} 等已有的 span 样式），返回字数组。只在 build 之后调一次 */
function split(el){if(!el)return[];if(el._chars)return el._chars;const out=[];
 const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const frag=document.createDocumentFragment();
   [...c.textContent].forEach(ch=>{if(ch===' '){frag.appendChild(document.createTextNode(' '));return}
    const s=document.createElement('span');s.className='ch';s.textContent=ch;s.style.display='inline-block';s.style.willChange='transform';frag.appendChild(s);out.push(s)});
   c.replaceWith(frag)}else if(c.nodeType===1&&c.tagName!=='BR')walk(c)})};
 walk(el);el._chars=out;return out}
/* 逐字入场。from: 起始状态 {y, x, s, r, rx, blur, o}；stagger 每字间隔；dur 每字时长 */
function textIn(chars,t,start,{stagger=0.035,dur=0.5,from={y:70,blur:10,o:0},e='outBack'}={}){
 chars.forEach((c,i)=>{const p=ease(e)(prog(t,start+i*stagger,start+i*stagger+dur));const q=prog(t,start+i*stagger,start+i*stagger+dur*0.6);
  set(c,{x:(from.x||0)*(1-p),y:(from.y||0)*(1-p),s:lerp(from.s??1,1,p),r:(from.r||0)*(1-p),rx:(from.rx||0)*(1-p),
   o:lerp(from.o??0,1,q),blur:(from.blur||0)*(1-q)})})}
/* 逐字出场 */
function textOut(chars,t,start,{stagger=0.02,dur=0.35,to={y:-50,blur:8,o:0},e='inC'}={}){
 chars.forEach((c,i)=>{const p=ease(e)(prog(t,start+i*stagger,start+i*stagger+dur));if(p<=0)return;
  set(c,{x:(to.x||0)*p,y:(to.y||0)*p,s:lerp(1,to.s??1,p),r:(to.r||0)*p,o:lerp(1,to.o??0,p),blur:(to.blur||0)*p})})}
/* 逐字持续微动（波浪），叠加在已入场的字上 */
function textWave(chars,t,{amp=6,speed=2.2,phase=0.45,from=0}={}){chars.forEach((c,i)=>{if(t<from)return;
 const y=Math.sin(t*speed*Math.PI-i*phase)*amp*Math.min(1,(t-from)/0.4);c.style.transform+=` translateY(${y.toFixed(2)}px)`})}
/* 一组元素错峰执行 fn(el, 本地进度 p, 序号) */
function stagger(list,t,start,step,dur,fn,e='outC'){list.forEach((el,i)=>fn(el,ease(e)(prog(t,start+i*step,start+i*step+dur)),i))}
/* 数字滚动 */
const count=(t,a,d,from,to,{e='outQuint',fmt=v=>Math.round(v).toLocaleString('en-US')}={})=>fmt(lerp(from,to,ease(e)(prog(t,a,a+d))));
/* 打字：按每秒 cps 字吐出 */
const typed=(str,t,a,cps=14)=>{const s=[...String(str)];return s.slice(0,cl(Math.floor((t-a)*cps),0,s.length)).join('')};
/* 高光扫过：给元素设一层移动的线性渐变（作 background-image），p 0→1 */
const sheen=(el,p,{w=30,color='rgba(255,255,255,.55)',angle=110}={})=>{if(!el)return;const c=lerp(-w,100+w,p);
 el.style.backgroundImage=`linear-gradient(${angle}deg,transparent ${c-w}%,${color} ${c}%,transparent ${c+w}%)`};

/* ---------- Canvas ---------- */
function canvas(el){if(!el)return null;const g=el.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,el.width,el.height);return g}
function glow(g,x,y,r,color,a=1){r=Math.max(0.01,r);const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,color);gr.addColorStop(1,'rgba(0,0,0,0)');
 g.save();g.globalAlpha=a;g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);g.restore()}
/* 漂浮粒子（尘埃、光点）：持续运动，永不静止 */
function dust(g,t,{n=60,seed=1,w=1080,h=1920,color='255,255,255',size=[1.5,5],alpha=[.15,.6],speed=30,drift=40,twinkle=true}={}){
 for(let i=0;i<n;i++){const r=k=>hash(i*7+k,seed);const sz=lerp(size[0],size[1],r(1));const sp=speed*(0.4+r(2));
  const x=(r(3)*w+wob(t,i+seed*31,drift,0.15))%w;const y=((r(4)*h-t*sp)%h+h)%h;
  const a=lerp(alpha[0],alpha[1],r(5))*(twinkle?0.6+0.4*Math.sin(t*(1+r(6)*3)+i):1);
  g.fillStyle=`rgba(${color},${a.toFixed(3)})`;g.beginPath();g.arc(x,y,sz,0,7);g.fill()}}
/* 爆开：t0 时刻从 (x,y) 炸出彩片/火花，life 秒内飞散下落 */
function burst(g,t,t0,x,y,{n=40,seed=3,colors=['#FF4D1A','#FFC94D','#ffffff','#5BD69B'],speed=[400,1100],life=1.4,gravity=900,size=[8,18],shape='rect'}={}){
 const u=t-t0;if(u<0||u>life)return;
 for(let i=0;i<n;i++){const r=k=>hash(i*11+k,seed);const a=r(1)*Math.PI*2;const v=lerp(speed[0],speed[1],r(2));
  const px=x+Math.cos(a)*v*u*(1-u/(life*2.2));const py=y+Math.sin(a)*v*u*(1-u/(life*2.2))+0.5*gravity*u*u;
  const s=lerp(size[0],size[1],r(3))*(1-0.5*u/life);g.save();g.globalAlpha=cl(1-Math.pow(u/life,2));g.translate(px,py);g.rotate(u*(r(4)*12-6));
  g.fillStyle=colors[i%colors.length];if(shape==='rect')g.fillRect(-s/2,-s/4,s,s/2);else{g.beginPath();g.arc(0,0,s/2,0,7);g.fill()}g.restore()}}
/* 冲击环：t0 时刻起一圈扩散的圆环 */
function ring(g,t,t0,x,y,{r0=20,r1=420,life=0.8,width=10,color='255,77,26'}={}){const u=prog(t,t0,t0+life);if(u<=0||u>=1)return;
 const r=Math.max(0.01,lerp(r0,r1,E.outC(u)));g.save();g.strokeStyle=`rgba(${color},${(1-u).toFixed(3)})`;g.lineWidth=width*(1-u)+1;g.beginPath();g.arc(x,y,r,0,7);g.stroke();g.restore()}
/* 流线：一束光线从 a 流向 b（数据流动感） */
function stream(g,t,ax,ay,bx,by,{n=14,seed=5,color='255,77,26',speed=0.7,size=6,bend=120}={}){
 const mx=(ax+bx)/2+bend,my=(ay+by)/2;for(let i=0;i<n;i++){const p=((t*speed+hash(i,seed))%1);const q=1-p;
  const x=q*q*ax+2*q*p*mx+p*p*bx,y=q*q*ay+2*q*p*my+p*p*by;g.fillStyle=`rgba(${color},${(Math.sin(p*Math.PI)).toFixed(3)})`;
  g.beginPath();g.arc(x,y,size*(0.5+0.5*Math.sin(p*Math.PI)),0,7);g.fill()}}

/* ---------- 镜头 ---------- */
/* 给整个舞台加"手持感"：缓慢推近 + 轻微漂移 + 轻微旋转。push 为整场推近比例 */
function camera(el,t,dur,{push=0.06,drift=10,rot=0.4,seed=9,from=1}={}){const p=E.inOutSine(prog(t,0,dur));
 set(el,{x:wob(t,seed,drift,0.25),y:wob(t,seed+5,drift,0.22),r:wob(t,seed+9,rot,0.2),s:from+push*p})}

window.MO={cl,lerp,prog,E,ease,spring,kf,tw,rng,hash,noise,wob,set,$,all,split,textIn,textOut,textWave,stagger,count,typed,sheen,
 canvas,glow,dust,burst,ring,stream,camera};
})();
