// ---- the passport opens and closes ----
const openPass=()=>{buildPass();const p=$('pass');if(p)p.hidden=false};
$('pbtn').onclick=openPass;
$('pclose').onclick=()=>{$('pass').hidden=true};
$('pass').addEventListener('click',e=>{if(e.target===$('pass'))$('pass').hidden=true});
$('freel').onclick=fishReel;
$('fclose').onclick=closeFish;
$('ftrack').onclick=fishReel;
addEventListener('keydown',e=>{if(e.key==='Escape'){const p=$('pass');if(p)p.hidden=true;$('map').hidden=true;$('sig').hidden=true;closeFish();if(typeof standUp==='function')standUp();const q=$('quiz');if(q)q.hidden=true}});
setTimeout(checkProgress,80);
// M opens and closes the sky map from anywhere that is not a text box
addEventListener('keydown',e=>{if(e.key!=='m'&&e.key!=='M')return;if(e.ctrlKey||e.metaKey||e.altKey)return;
 const t=e.target&&e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||(e.target&&e.target.isContentEditable))return;
 const m=$('map');if(!m)return;if(m.hidden){buildMap();m.hidden=false}else m.hidden=true});

// ---- the sky map: three rocks, and the way back to each ----
const ISLESL=[[31.5,31.5],[101,26],[133,27],[95,58],[136.5,72]];
const ISLES=[
 {n:'The village',i:'farm, market, the koi pond',ch:[0,1,2,3,4],start:0},
 {n:'The sakura isle',i:'rope bridge, pagoda, teahouse',ch:[5,6,7],start:5},
 {n:'The observatory rock',i:'dome, dish, standing stones',ch:[8,9],start:8},
 {n:'The harbour',i:'boatyard, lighthouse, the hulls',ch:[10],start:10},
 {n:'The star kingdom',i:'gate, market, chapel, sky docks, one empty chair',ch:[11,12],start:11}];
const scrollP=()=>window.__p!=null?window.__p:clamp(scrollY/Math.max(1,document.body.scrollHeight-innerHeight),0,1);
const chapNow=()=>MODE==='explore'?(NEAR>=0?NEAR:nearestChapter()):clamp(Math.round(scrollP()*(CH.length-1)),0,CH.length-1);
const islOf=s=>{let best=0,bd=1e9;ISLESL.forEach((c,ix)=>{const d=Math.hypot(s.at[0]-c[0],s.at[1]-c[1]);if(d<bd){bd=d;best=ix}});return best};
function goChapter(k){
 $('map').hidden=true;
 if(MODE==='explore')leaveX(1);
 const max=document.body.scrollHeight-innerHeight,p=k/(CH.length-1);
 requestAnimationFrame(()=>scrollTo({top:Math.max(0,p*max),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'}));
}
function buildMap(){
 const g=$('mgrid');if(!g)return;const k=chapNow();g.innerHTML='';
 if(!buildMap._chart&&typeof bakeChartBig==='function'){try{bakeChartBig()}catch(e){}buildMap._chart=1}
 ISLES.forEach((I,ix)=>{
  const b=document.createElement('button');b.type='button';b.className='mcard'+(I.ch.includes(k)?' here':'');
  const got=I.ch.filter(c=>PASS.chapters.includes(CH[c].name)).length;
  const gl=SEC.filter(s=>s.f&&islOf(s)===ix).length;
  const here=I.ch.includes(k)?'<span class="mhere">you are here</span>':'';
  b.innerHTML='<span class="mnum">0'+(ix+1)+'</span><b>'+I.n+'</b><i>'+I.i+'</i>'
   +'<span class="mdots">'+I.ch.map(c=>'<span class="'+(PASS.chapters.includes(CH[c].name)?'on':'')+'"></span>').join('')+'</span>'
   +'<span class="mmeta">'+gl+' glint'+(gl===1?'':'s')+', '+got+' of '+I.ch.length+' chapters</span>'+here;
  b.onclick=()=>goChapter(I.start);
  g.appendChild(b)});
 const f=$('mfoot');if(f)f.textContent=nf()+' of '+SEC.length+' glints found, '+PASS.chapters.length+' of '+CH.length+' chapters heard.';
}
$('mapbtn').onclick=()=>{buildMap();$('map').hidden=false};
$('mclose').onclick=()=>{$('map').hidden=true};
$('map').addEventListener('click',e=>{if(e.target===$('map'))$('map').hidden=true});
