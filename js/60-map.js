// ---- the passport opens and closes ----
const openPass=()=>{buildPass();const p=$('pass');if(p)p.hidden=false};
$('pbtn').onclick=openPass;
$('pclose').onclick=()=>{$('pass').hidden=true};
$('pass').addEventListener('click',e=>{if(e.target===$('pass'))$('pass').hidden=true});
$('freel').onclick=fishReel;
$('fclose').onclick=closeFish;
$('ftrack').onclick=fishReel;
addEventListener('keydown',e=>{if(e.key==='Escape'){const p=$('pass');if(p)p.hidden=true;$('map').hidden=true;$('sig').hidden=true;closeFish()}});
setTimeout(checkProgress,80);

// ---- the sky map: three rocks, and the way back to each ----
const ISLES=[
 {n:'The village',i:'farm, market, the koi pond',ch:[0,1,2,3,4],start:0},
 {n:'The sakura isle',i:'rope bridge, pagoda, teahouse',ch:[5,6,7],start:5},
 {n:'The observatory rock',i:'dome, dish, standing stones',ch:[8,9],start:8}];
const scrollP=()=>window.__p!=null?window.__p:clamp(scrollY/Math.max(1,document.body.scrollHeight-innerHeight),0,1);
const chapNow=()=>MODE==='explore'?(NEAR>=0?NEAR:nearestChapter()):clamp(Math.round(scrollP()*(CH.length-1)),0,CH.length-1);
const islOf=s=>s.at[0]<60?0:s.at[0]<120?1:2;
function goChapter(k){
 $('map').hidden=true;
 if(MODE==='explore')leaveX(1);
 const max=document.body.scrollHeight-innerHeight,p=k/(CH.length-1);
 requestAnimationFrame(()=>scrollTo({top:Math.max(0,p*max),behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'}));
}
function buildMap(){
 const g=$('mgrid');if(!g)return;const k=chapNow();g.innerHTML='';
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
