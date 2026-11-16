/* 主题包与转场。强调色固定为企鹅橙 #FF4D1A，换主题也认得出是同一个账号。 */
(function(){
const SANS='"Noto Sans CJK SC","Source Han Sans SC","Microsoft YaHei","PingFang SC",sans-serif';
const SERIF='"Noto Serif CJK SC","Source Han Serif SC","Songti SC","SimSun",serif';
window.THEMES={
  paper:{paper:'#F3EFE6',ink:'#141210',accent:'#FF4D1A',ok:'#17865A',font:SANS, flip:false,transition:'wipeUp'},
  ink:  {paper:'#E8ECF1',ink:'#0F1720',accent:'#FF4D1A',ok:'#1E9E6A',font:SANS, flip:true, transition:'slideLeft'},
  mint: {paper:'#E4F2EA',ink:'#0E2A22',accent:'#FF4D1A',ok:'#0F7A55',font:SERIF,flip:false,transition:'zoom'},
  dusk: {paper:'#F2EAF6',ink:'#231533',accent:'#FF4D1A',ok:'#2E9C77',font:SANS, flip:true, transition:'flash'},
};
// 转场：w 是盖在新场景上的一层，颜色取上一个场景的底色；p 从 0 到 1
window.TRANSITIONS={
  wipeUp:(w,p,bg)=>{w.style.background=bg;w.style.opacity=1;w.style.transform=`translateY(${-p*100}%)`},
  slideLeft:(w,p,bg)=>{w.style.background=bg;w.style.opacity=1;w.style.transform=`translateX(${-p*100}%) skewX(${-(1-p)*6}deg)`},
  zoom:(w,p,bg)=>{w.style.background=bg;w.style.opacity=1-p;w.style.transform=`scale(${1+p*0.35})`},
  flash:(w,p,bg)=>{w.style.background='#fff';w.style.opacity=(1-p)*0.9;w.style.transform='none'},
};
})();
