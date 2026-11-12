// ---- a living sky: the clock, the weather and the year run themselves ----
const DAYLEN=200,SEASONS=['Spring','Summer','Autumn','Winter'],SG=['rgba(255,170,205,.20)','rgba(255,214,110,.16)','rgba(255,128,36,.20)','rgba(150,190,255,.30)'],
 SEN=[{leaf:.9,snow:.08},{leaf:.55,snow:0},{leaf:1,snow:.3},{leaf:1,snow:1}],
 LCOL=[['#f4a6c8','#fbd0e0','#e888b0'],['#e8f27a','#e8f27a','#c8e86a'],['#e2862b','#c2491f','#f1b445'],['#ffffff','#eef4ff','#dbe8ff']],
 SNOTE=['Petals drift over the village.','Warm nights, fireflies and monsoon clouds.','The orchard turns copper.','Frost on the pines. Snow settles in.'];
const _d=new Date(),_m=_d.getMonth(),W={h:_d.getHours()+_d.getMinutes()/60,d:0,s:_m>=2&&_m<5?0:_m>=5&&_m<8?1:_m>=8&&_m<11?2:3,wx:'clear',wt:0,ov:null,last:performance.now(),hud:0};
let ACT='work',SPDM=1,SE=SEN[W.s];
const SMS=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
function note(h,t,ms){const f=$('find');f.innerHTML='<b>'+h+'</b>'+t;f.classList.add('on');noteY=scrollY;clearTimeout(note.t);note.t=setTimeout(()=>f.classList.remove('on'),Math.min(ms||6000,7000))}
let noteY=0;addEventListener('scroll',()=>{if(Math.abs(scrollY-noteY)>160)$('find').classList.remove('on')},{passive:true});$('find').onclick=()=>$('find').classList.remove('on');
function seasonSet(q){SE=SEN[W.s];$('season').style.backgroundColor=SG[W.s];if(!q)note(SEASONS[W.s],SNOTE[W.s],6000)}
function skyTick(){const n=performance.now(),dt=Math.min(.25,(n-W.last)/1000);W.last=n;
 W.h+=dt*24/DAYLEN;if(W.h>=24){W.h-=24;if(++W.d%2==0){W.s=(W.s+1)%4;seasonSet()}}
 const h=W.h;tgt.night=Math.max(SMS(17.6,19.8,h),1-SMS(4.8,7.2,h));tgt.warm=Math.max(0,1-Math.abs(h-18.6)/1.6,.8*(1-Math.abs(h-6)/1.3));
 W.wt-=dt;if(W.ov&&n>W.ov.u)W.ov=null;
 if(W.wt<=0){const w=[[.6,.35,.05],[.4,.4,.2],[.75,.22,.03],[.85,.15,0]][W.s],r=Math.random();W.wx=r<w[0]?'clear':r<w[0]+w[1]?'rain':'storm';W.wt=50+Math.random()*60}
 const k=W.ov?W.ov.k:W.wx,v=WX[k];tgt.rain=v[0];tgt.storm=v[1];
 ACT=h>=22.5||h<5.5?'sleep':h>=12&&h<13.2?'lunch':h>=18.5&&h<22.5?'evening':'work';SPDM=cur.rain>.3?1.35:1;
 W.hud-=dt;if(W.hud<=0){W.hud=.5;const hh_=h|0,mm=((h-hh_)*60)|0;$('hudt').textContent=SEASONS[W.s]+' · '+String(hh_).padStart(2,'0')+':'+String(mm).padStart(2,'0')+' · '+k[0].toUpperCase()+k.slice(1)}}
