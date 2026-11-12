// Dock: collapsible on small screens
$('tg').onclick=()=>{const o=$('panel').classList.toggle('open');$('tg').setAttribute('aria-expanded',o)};

// Nav highlights the section in view
{const links=[...document.querySelectorAll('nav a')];let cs='';
 if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.removeAttribute('aria-current'));const a=links.find(a=>a.hash==='#'+e.target.id);a&&a.setAttribute('aria-current','true');if(cs!==e.target.id){cs=e.target.id;say(LINES[cs]||'')}}}),{rootMargin:'-45% 0px -50% 0px'});
 document.querySelectorAll('main section').forEach(s=>io.observe(s))}}

// Optional ambient sound: real field recordings, hot-linked, nothing plays until you ask.
// Mixkit Sound Effects Free Licence - free for commercial and non-commercial use, no attribution
// required. Each layer is fetched only when it is first needed.
const AMB=[
 {id:'wind',  url:'https://assets.mixkit.co/active_storage/sfx/2427/2427-preview.mp3', g:.26, loop:1, day:1, night:.75, rain:.6, near:0},
 {id:'birds', url:'https://assets.mixkit.co/active_storage/sfx/1212/1212-preview.mp3', g:.34, loop:0, every:[6,19],  day:1, night:0, rain:0, near:0},
 {id:'tweet', url:'https://assets.mixkit.co/active_storage/sfx/17/17-preview.mp3',    g:.30, loop:0, every:[13,37], day:1, night:0, rain:0, near:0},
 {id:'leaf',  url:'https://assets.mixkit.co/active_storage/sfx/2430/2430-preview.mp3', g:.26, loop:0, every:[9,25],  day:1, night:.3, rain:0, near:0},
 {id:'water', url:'https://assets.mixkit.co/active_storage/sfx/3126/3126-preview.mp3', g:.24, loop:1, day:1, night:1, rain:1, near:1},
 {id:'rain',  url:'https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3', g:.30, loop:1, day:0, night:0, rain:1, near:0},
 {id:'crick', url:'https://assets.mixkit.co/active_storage/sfx/1788/1788-preview.mp3', g:.26, loop:1, day:0, night:1, rain:0, near:0},
 {id:'bug',   url:'https://assets.mixkit.co/active_storage/sfx/39/39-preview.mp3',    g:.20, loop:1, day:0, night:1, rain:0, near:0},
 {id:'storm', url:'https://assets.mixkit.co/active_storage/sfx/2395/2395-preview.mp3', g:.55, loop:0, day:1, night:1, rain:1, near:0}];
const SND={on:false,vol:.45,layers:{},next:{},fail:0};
function ambEl(a){let e=SND.layers[a.id];
 if(!e){e=new Audio();e.src=a.url;e.loop=!!a.loop;e.preload='none';e.volume=0;
  e.addEventListener('error',()=>{a.bad=1;SND.fail++});
  SND.layers[a.id]=e}
 return e}
function ambPlay(a){const e=ambEl(a);if(e.paused){if(e.readyState>1&&e.duration)e.currentTime=Math.random()*e.duration*.85;
  e.play().catch(()=>{})}}
function ambStop(a){const e=SND.layers[a.id];if(e&&!e.paused)e.pause()}
function sndWeight(a){
 const n=cur.night,rain=cur.rain;
 let w=n>.5?(a.night||0):(a.day||0);
 if(rain>.12)w=Math.max(w,(a.rain||0)*Math.min(1,rain*1.4));
 if(a.near){const cam=CAMT||POND,d=Math.hypot(cam[0]-POND[0],cam[1]-POND[1]);
  w*=clamp(1.25-d/15,0,1)}
 return w}
function sndUpdate(){
 if(!SND.on)return;
 for(const a of AMB){
  if(a.bad)continue;
  const w=sndWeight(a);
  if(a.loop){
   if(w>.02){const e=ambEl(a);e.volume=clamp(a.g*w*SND.vol,0,1);if(e.paused)ambPlay(a)}
   else{const e=SND.layers[a.id];if(e&&!e.paused){e.pause()}}
   continue}
  if(!a.every)continue;
  const t=performance.now();
  if(!SND.next[a.id])SND.next[a.id]=t+a.every[0]*1000+Math.random()*a.every[1]*1000;
  if(t>SND.next[a.id]){SND.next[a.id]=t+a.every[0]*1000+Math.random()*a.every[1]*1000;
   if(w>.25){const e=ambEl(a);e.volume=clamp(a.g*w*SND.vol,0,1);e.currentTime=0;e.play().catch(()=>{})}}
 }}
function thunder(){if(!SND.on)return;const a=AMB.find(x=>x.id==='storm');if(!a||a.bad)return;
 const e=ambEl(a);e.volume=clamp(.55*SND.vol,0,1);e.currentTime=0;e.play().catch(()=>{})}
$('snd').onclick=()=>{const b=$('snd');SND.on=!SND.on;b.setAttribute('aria-pressed',SND.on);b.textContent=SND.on?'Sound on':'Sound off';
 if(!SND.on){for(const a of AMB)if(SND.layers[a.id])SND.layers[a.id].pause();return}
 sndUpdate()};
const volEl=$('vol');
if(volEl)volEl.oninput=()=>{SND.vol=volEl.value/100;if(SND.on)sndUpdate()};
document.addEventListener('visibilitychange',()=>{if(SND.on&&SND.ctx)document.hidden?SND.ctx.suspend():SND.ctx.resume()});
