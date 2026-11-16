const M={pos:'bottomRight',pose:'base'};
const BASE={
  hookContrast:{type:'hookContrast',line:'一千个商品要上架',left:{label:'人工上架',value:'好几天',note:'估算'},right:{label:'自动上架',value:'十分钟',note:'实录'}},
  counter:{type:'counter',title:'已自动填写',from:0,to:1000,unit:'个商品',caption:'一项都不用手填'},
  timer:{type:'timer',title:'自动上架用时',seconds:600,caption:'全程不用盯'},
  bars:{type:'bars',title:'同样一千个商品',items:[['人工',72,'小时（估算）'],['自动化',1,'小时内']]},
  photo:{type:'photo',image:null,line1:'凌晨两点',line2:'还在填表格'},
  steps:{type:'steps',title:'用上它只要三步',items:['准备商品资料','让助手连上后台','提交前亲自确认'],hide_last:true},
  reveal:{type:'reveal',num:'03',title:'提交前，停下给你看',line:'你点头，它才提交'},
  statement:{type:'statement',kicker:'拼多多发布助手',line1:'按资料{b}自动填',line2:'填一项{b}核一项'},
  cta:{type:'cta',kicker:'免费领取',title:'关注{b}{s:评论「上架」}',foot:'私信发你',mascot:{pos:'cta',pose:'wave',wave:true}},
  footage:{type:'footage',slot:'hook',line:'看它自己填',timer:false,frames:null,n:0},
};
export const TYPES=Object.keys(BASE);
export function fixture(type, over={}, theme='paper'){
  return {theme, mascot:{dir:'../assets/mascot',poses:['base','talk','blink','phone','point','cheer','shock','clip','wave']},
          scenes:[{...BASE[type],...over}]};
}
