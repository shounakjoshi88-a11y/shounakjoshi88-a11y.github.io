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
 if(SND.fail>=AMB.length){const b=$('snd');if(b&&!b._dead){b._dead=1;b.textContent='Sound unavailable'}return}
 for(const a of AMB){
  if(a.bad)continue;
  const w=sndWeight(a);
  if(a.loop){
   if(w>.02){const e=ambEl(a),tv=clamp(a.g*w*SND.vol,0,1);e.volume=e.paused?tv*.2:clamp(e.volume+(tv-e.volume)*.15,0,1);if(e.paused)ambPlay(a)}
   else{const e=SND.layers[a.id];if(e&&!e.paused){e.volume=Math.max(0,e.volume-.04);if(e.volume<.01)e.pause()}}
   continue}
  if(!a.every)continue;
  const t=performance.now();
  if(!SND.next[a.id])SND.next[a.id]=t+a.every[0]*1000+Math.random()*a.every[1]*1000;
  if(t>SND.next[a.id]){SND.next[a.id]=t+a.every[0]*1000+Math.random()*a.every[1]*1000;
   if(w>.25){const e=ambEl(a);e.volume=clamp(a.g*w*SND.vol,0,1);e.currentTime=0;e.play().catch(()=>{})}}
 }}
function thunder(){if(!SND.on)return;const a=AMB.find(x=>x.id==='storm');if(!a||a.bad)return;
 const e=ambEl(a);e.volume=clamp(.55*SND.vol,0,1);e.currentTime=0;e.play().catch(()=>{});try{sfx('thunder')}catch(e){}}
$('snd').onclick=()=>{const b=$('snd');SND.on=!SND.on;b.setAttribute('aria-pressed',SND.on);b.textContent=SND.on?'Sound on':'Sound off';
 if(!SND.on){for(const a of AMB)if(SND.layers[a.id])SND.layers[a.id].pause();return}
 sndUpdate()};
const volEl=$('vol');
if(volEl)volEl.oninput=()=>{SND.vol=volEl.value/100;if(SND.on)sndUpdate()};
document.addEventListener('visibilitychange',()=>{if(!SND.on)return;if(document.hidden){for(const a of AMB){const e=SND.layers[a.id];if(e&&!e.paused)e.pause()}}else sndUpdate()});

// remember the volume between visits
try{const v=localStorage.getItem('koi-vol');if(v!=null&&volEl){volEl.value=v;SND.vol=v/100}}catch(e){}
if(volEl)volEl.addEventListener('change',()=>{try{localStorage.setItem('koi-vol',volEl.value)}catch(e){}});

/* ================= v3: A SYNTHESIZED SOUNDSCAPE (Web Audio) =================
   Everything below is generated in the browser, so it works even when the hot-linked recordings do not.
   - generative music: koto-style plucks, a slow pad and the odd shakuhachi breath, in a scale that changes with
     day, night and rain
   - living beds: wind, water, rain, crickets, the mill wheel and the observatory hum, mixed by where the camera is
   - place sounds: wind chimes on the sakura isle, gulls and a buoy bell at the harbour, a bell tolling at the keep
   - effects: coin, glint, doors, quiz answers, footsteps, oars
   ------------------------------------------------------------------ */
const AE={ctx:null,music:true,next:0,beat:0,deg:0,ci:0,rs:0,nx:{},pos:null,lastStep:0,lastOar:0,hk:0,B:{}};
const AHK=[];const aeHook=(n,f)=>AHK.push([n,f,0]);
const AROOT=146.83,aeHz=s=>AROOT*Math.pow(2,s/12);
function aeOut(node,bus,pan){const c=AE.ctx;if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;node.connect(p);p.connect(bus)}else node.connect(bus)}
function aeInit(){
 if(AE.ctx)return AE.ctx;const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
 const c=AE.ctx=new C();SND.ctx=c;
 AE.m=c.createGain();AE.m.gain.value=0;const comp=c.createDynamicsCompressor();AE.m.connect(comp);comp.connect(c.destination);
 const len=c.sampleRate*3,ir=c.createBuffer(2,len,c.sampleRate);
 for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6)}
 AE.rev=c.createConvolver();AE.rev.buffer=ir;const rg=c.createGain();rg.gain.value=.55;AE.rev.connect(rg);rg.connect(AE.m);
 AE.bus={};for(const[k,v,r]of[['music',.55,.55],['amb',.8,.12],['sfx',.9,.25]]){const g=c.createGain();g.gain.value=v;g.connect(AE.m);const s=c.createGain();s.gain.value=r;g.connect(s);s.connect(AE.rev);AE.bus[k]=g}
 const mkb=(brown)=>{const b=c.createBuffer(1,c.sampleRate*4,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;if(brown){l=(l+.02*w)/1.02;d[i]=l*3.5}else d[i]=w}return b};
 AE.white=mkb(0);AE.brown=mkb(1);
 const bed=(buf,type,f,q)=>{const s=c.createBufferSource();s.buffer=buf;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q||1;const g=c.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(AE.bus.amb);s.start();return{g,f:fl}};
 AE.B.wind=bed(AE.brown,'bandpass',420,.5);AE.B.water=bed(AE.white,'bandpass',950,1.4);AE.B.rain=bed(AE.white,'highpass',2200,.5);AE.B.mill=bed(AE.brown,'lowpass',240,1);
 const lap=c.createOscillator(),lg=c.createGain();lap.frequency.value=.33;lg.gain.value=.06;lap.connect(lg);lg.connect(AE.B.water.g.gain);lap.start();
 // crickets: two detuned tones, chopped fast, then in slow groups
 const ck=c.createGain();ck.gain.value=0;ck.connect(AE.bus.amb);AE.B.crick={g:ck};
 for(const[fr,rt]of[[4300,6.6],[4650,7.4]]){const o=c.createOscillator(),a=c.createGain(),l=c.createOscillator(),lgn=c.createGain(),ch=c.createGain(),sl=c.createOscillator(),sg=c.createGain();
  o.frequency.value=fr;a.gain.value=.5;l.type='square';l.frequency.value=rt;lgn.gain.value=.5;l.connect(lgn);lgn.connect(a.gain);
  ch.gain.value=.5;sl.frequency.value=.22+Math.random()*.1;sg.gain.value=.5;sl.connect(sg);sg.connect(ch.gain);
  o.connect(a);a.connect(ch);ch.connect(ck);o.start();l.start();sl.start()}
 const hum=c.createOscillator(),hg=c.createGain();hum.frequency.value=58;hg.gain.value=0;hum.connect(hg);hg.connect(AE.bus.amb);hum.start();AE.B.hum={g:hg};
 AE.tk=setInterval(aeTick,200);AE.st=setInterval(aeSteps,90);
 return c}
function aeNoise(dur,t,o){const c=AE.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
 s.buffer=AE.white;s.loop=true;f.type=o.type||'bandpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+dur);f.Q.value=o.q||1;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.v||.3,t+(o.a||.01));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 s.connect(f);f.connect(g);aeOut(g,AE.bus[o.bus||'sfx'],o.pan);s.start(t);s.stop(t+dur+.05)}
function aeTone(f,t,o){const c=AE.ctx,os=c.createOscillator(),g=c.createGain(),d=o.d||.4;
 os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(o.v||.2,t+(o.a||.005));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 os.connect(g);aeOut(g,AE.bus[o.bus||'sfx'],o.pan);os.start(t);os.stop(t+d+.05)}
const aeBell=(f,t,v,d,bus)=>{for(const[m,a,k]of[[1,1,1],[2.76,.5,.6],[5.4,.25,.35],[8.93,.12,.2]])aeTone(f*m,t,{v:v*a,d:(d||2.2)*k,bus})};
function aePluck(f,t,v){const c=AE.ctx,o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),g2=c.createGain(),lp=c.createBiquadFilter();
 o.type='triangle';o.frequency.value=f;o2.type='sine';o2.frequency.value=f*2.003;g2.gain.value=.3;
 lp.type='lowpass';lp.frequency.setValueAtTime(f*9,t);lp.frequency.exponentialRampToValueAtTime(f*1.4,t+.7);
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0008,t+2);
 o.connect(lp);o2.connect(g2);g2.connect(lp);lp.connect(g);g.connect(AE.bus.music);o.start(t);o2.start(t);o.stop(t+2.1);o2.stop(t+2.1)}
function aePad(t,r,sc){const c=AE.ctx,lp=c.createBiquadFilter(),g=c.createGain();lp.type='lowpass';lp.frequency.value=650;
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05,t+3);g.gain.linearRampToValueAtTime(.0001,t+9);lp.connect(g);g.connect(AE.bus.music);
 for(const[m,dt]of[[.5,0],[.5*1.4983,4],[1,-3]]){const o=c.createOscillator();o.type='triangle';o.frequency.value=aeHz(r)*m;o.detune.value=dt;o.connect(lp);o.start(t);o.stop(t+9.2)}}
function aeShaku(t){const c=AE.ctx,f=aeHz([0,2,5,7,9][(Math.random()*5)|0]+12),o=c.createOscillator(),v=c.createOscillator(),vg=c.createGain(),g=c.createGain();
 o.frequency.value=f;v.frequency.value=5;vg.gain.value=f*.012;v.connect(vg);vg.connect(o.frequency);
 g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.07,t+.9);g.gain.linearRampToValueAtTime(.05,t+2.6);g.gain.linearRampToValueAtTime(.0001,t+4.2);
 o.connect(g);g.connect(AE.bus.music);o.start(t);v.start(t);o.stop(t+4.3);v.stop(t+4.3);aeNoise(4,t,{type:'bandpass',f:f*2,q:3,v:.03,a:.9,bus:'music'})}
function aeMusic(t){
 if(!AE.music)return;const n=cur.night,rain=cur.rain||0,sc=n>.5?[0,1,5,7,8]:rain>.3?[0,2,3,7,8]:[0,2,5,7,9],beat=n>.5?.62:rain>.3?.55:.42,dens=n>.5?.38:rain>.3?.5:.6;
 while(AE.next<t+.5){
  if(AE.next<t)AE.next=t+.05;
  if(AE.beat%16===0){AE.rs=[0,sc[3],sc[2],sc[1]][AE.ci++%4];aePad(AE.next,AE.rs,sc)}
  AE.beat++;
  if(Math.random()<dens){
   AE.deg=Math.max(-3,Math.min(9,AE.deg+[-2,-1,-1,0,1,1,2][(Math.random()*7)|0]));
   const oct=Math.floor(AE.deg/5),idx=((AE.deg%5)+5)%5,semi=sc[idx]+12*oct+AE.rs+12;
   aePluck(aeHz(semi),AE.next,.06+Math.random()*.05);
   if(Math.random()<.14)aePluck(aeHz(semi+(sc[(idx+2)%5]-sc[idx]+12)%12),AE.next+beat*.5,.04)}
  AE.next+=beat*(Math.random()<.18?2:1)}}
function aeZones(){
 const cam=(typeof CAMT!=='undefined'&&CAMT)||POND,z=(s,R)=>clamp(1.3-Math.hypot(cam[0]-s[0],cam[1]-s[1])/R,0,1);
 return{pond:z(POND,15),mill:z([35.3,22.9],9),sak:z([101,26],14),obs:z([133,27],14),har:z([95,58],15),keep:z([136.5,53.3],16)}}
const aeSet=(g,v)=>g.gain.setTargetAtTime(Math.max(0,v),AE.ctx.currentTime,.6);
const aeDue=(k,lo,hi)=>{const t=performance.now();if(!AE.nx[k])AE.nx[k]=t+(lo+Math.random()*(hi-lo))*1000;if(t<AE.nx[k])return 0;AE.nx[k]=t+(lo+Math.random()*(hi-lo))*1000;return 1};
function aeTick(){
 const c=AE.ctx;if(!c||!SND.on||c.state!=='running')return;
 if(AE.hk<80){AE.hk++;for(const h of AHK){const n=h[0];if(h[2]||typeof window[n]!=='function')continue;const o=window[n],f=h[1];try{window[n]=function(){try{f.apply(this,arguments)}catch(e){}return o.apply(this,arguments)};h[2]=1}catch(e){h[2]=1}}}
 const t=c.currentTime,n=cur.night,rain=cur.rain||0,Z=aeZones(),room=MODE==='room',ro=room?.3:1,B=AE.B,hi=Math.max(Z.sak,Z.obs,Z.keep,Z.har*.7);
 aeSet(B.wind.g,(.06+.3*hi+.12*rain)*ro);B.wind.f.frequency.setTargetAtTime(380+260*Math.sin(t*.27)+120*Math.sin(t*.9),t,.5);
 aeSet(B.water.g,(Z.pond*.3+Z.har*.28)*ro);
 aeSet(B.rain.g,Math.min(1,rain*1.2)*.16*(room?.35:1));B.rain.f.frequency.setTargetAtTime(room?900:2200,t,.4);
 aeSet(B.mill.g,Z.mill*.22*ro);aeSet(B.crick.g,n>.5?(1-rain)*.05*(1-Z.keep*.6)*ro:0);aeSet(B.hum.g,Z.obs*(n>.4?.05:.02)*ro);
 AE.bus.music.gain.setTargetAtTime(.55*(room?.55:1)*(1-.35*rain)*(AE.music?1:0),t,.8);
 if(!room){
  if(Z.mill>.25&&aeDue('mill',1.1,1.1))aeNoise(.12,t,{type:'lowpass',f:260,v:.1,bus:'amb'});
  if(n<.4&&rain<.2&&Z.pond+Z.sak>.3&&aeDue('bird',5,14)){const f=2400+Math.random()*1400;for(let k=0;k<3;k++)aeTone(f,t+k*.11,{f2:f*1.3,d:.09,v:.04*(Z.pond+Z.sak),bus:'amb',pan:Math.random()-.5})}
  if(Z.sak>.3&&aeDue('chime',3,9)){const sc=[0,2,5,7,9];for(let k=0;k<2+((Math.random()*3)|0);k++)aeBell(aeHz(sc[(Math.random()*5)|0]+36),t+k*.35,.035*Z.sak,2.4,'amb')}
  if(Z.har>.3&&n<.5&&aeDue('gull',9,20)){const f=1500+Math.random()*300;aeTone(f,t,{f2:f*.7,d:.4,v:.04*Z.har,type:'sawtooth',bus:'amb',pan:Math.random()-.5});aeTone(f*1.05,t+.45,{f2:f*.6,d:.35,v:.03*Z.har,type:'sawtooth',bus:'amb'})}
  if(Z.har>.35&&aeDue('buoy',8,8))aeBell(330,t,.03*Z.har,2.5,'amb');
  if(Z.keep>.3&&aeDue('toll',48,64))aeBell(110,t,.12*Z.keep,6,'sfx');
  if(Z.obs>.4&&aeDue('sig',22,26))for(let k=0;k<7;k++)aeTone(660,t+k*.25,{d:.12,v:.035*Z.obs,bus:'amb'})}
 if(n>.4&&!room&&aeDue('shaku',55,100))aeShaku(t+.2);
 aeMusic(t)}
function aeSteps(){
 const c=AE.ctx;if(!c||!SND.on||c.state!=='running')return;
 const now=performance.now(),P=typeof PL!=='undefined'&&PL&&PL.P;if(!P)return;
 if(MODE==='room'){if(P.mvg&&now-AE.lastStep>300){AE.lastStep=now;aeNoise(.09,c.currentTime,{type:'lowpass',f:420,v:.2})}return}
 if(MODE!=='explore')return;
 const p=AE.pos,moved=p?Math.hypot(P.a-p[0],P.b-p[1]):0;AE.pos=[P.a,P.b];
 if(moved<.003)return;
 if(typeof BOATMODE!=='undefined'&&BOATMODE){if(now-AE.lastOar>900){AE.lastOar=now;AE.oar=-(AE.oar||1);const t=c.currentTime;aeNoise(.5,t,{f:700,f2:260,q:.7,v:.11,pan:AE.oar*.4});aeTone(180,t,{d:.07,v:.08,pan:AE.oar*.4});aeNoise(.9,t+.1,{type:'highpass',f:3500,v:.025})}return}
 if(now-AE.lastStep>290){AE.lastStep=now;const z=aeZones().keep>.5,t=c.currentTime;
  aeNoise(z?.05:.08,t,{type:z?'highpass':'lowpass',f:z?2600:900,v:z?.07:.05});if(z)aeTone(180+Math.random()*40,t,{d:.05,v:.05})}}
function sfx(name){
 const c=AE.ctx;if(!c||!SND.on||c.state!=='running')return;const t=c.currentTime;
 switch(name){
  case'coin':aeBell(1568,t,.12,1.2);aeNoise(.35,t+.05,{f:900,f2:300,v:.1});break;
  case'glint':[0,4,7,12,16].forEach((s,i)=>aeBell(aeHz(s+36),t+i*.09,.07,1.8));break;
  case'door':aeNoise(.15,t,{type:'lowpass',f:300,v:.3});aeTone(140,t+.02,{f2:70,d:.25,v:.12,type:'sawtooth'});break;
  case'right':aeBell(880,t,.1,1);aeBell(1109,t+.12,.1,1.4);break;
  case'wrong':aeTone(220,t,{f2:160,d:.4,v:.12,type:'triangle'});aeTone(165,t+.18,{f2:110,d:.5,v:.12,type:'triangle'});break;
  case'win':[0,4,7,12,16,19].forEach((s,i)=>aeBell(aeHz(s+36),t+i*.12,.08,2.4));break;
  case'push':aeNoise(.9,t,{f:500,f2:150,q:.5,v:.18});aeTone(120,t+.05,{d:.15,v:.12});break;
  case'splash':aeNoise(.45,t,{f:1400,f2:400,v:.18});break;
  case'page':aeNoise(.18,t,{f:3000,f2:1200,v:.08});break;
  case'bottle':aeTone(520,t,{f2:300,d:.12,v:.14});aeBell(1244,t+.1,.08,1.6);aeNoise(.3,t,{f:1200,f2:500,v:.1});break;
  case'toll':aeBell(110,t,.18,7);aeBell(165,t+.02,.05,5);break;
  case'thunder':for(let k=0;k<4;k++)aeNoise(2.2+k*.5,t+k*.45,{type:'lowpass',f:160-k*20,v:.35-k*.05});aeNoise(.25,t,{f:2000,f2:300,v:.2});break;
 }}
// the world's own events
aeHook('found',()=>sfx('glint'));
aeHook('roomOpen',()=>sfx('door'));aeHook('roomShut',()=>sfx('door'));
aeHook('fishReel',()=>sfx('splash'));
aeHook('boatUse',()=>sfx(typeof BOATMODE!=='undefined'&&BOATMODE?'splash':'push'));
aeHook('quizAnswer',k=>{const Q=typeof QSET!=='undefined'?QSET[QUIZ_I]:QUIZ[QUIZ_I];if(Q)sfx(k===Q.ok?'right':'wrong');setTimeout(()=>{if(PASS.boatLicense&&!AE.lic){AE.lic=1;sfx('win')}},80)});
for(const[id,s]of[['toss','coin'],['pbtn','page'],['mapbtn','page']]){const e=$(id);if(e)e.addEventListener('click',()=>sfx(s))}
// switch the engine with the Sound button, and give music its own toggle
{const sb=$('snd');
 sb.addEventListener('click',()=>{
  if(SND.on){const c=aeInit();if(!c)return;c.resume();AE.m.gain.setTargetAtTime(SND.vol*1.4,c.currentTime,.3);AE.next=0}
  else if(AE.ctx){AE.m.gain.setTargetAtTime(0,AE.ctx.currentTime,.15);setTimeout(()=>{if(!SND.on)AE.ctx.suspend()},500)}});
 const mb=document.createElement('button');mb.type='button';mb.className=sb.className;
 let on=true;try{on=localStorage.getItem('koi-music')!=='0'}catch(e){}
 AE.music=on;const lab=()=>{mb.textContent=AE.music?'Music on':'Music off';mb.setAttribute('aria-pressed',AE.music)};lab();
 mb.onclick=()=>{AE.music=!AE.music;lab();try{localStorage.setItem('koi-music',AE.music?'1':'0')}catch(e){}};
 sb.insertAdjacentElement('afterend',mb)}
if(volEl)volEl.addEventListener('input',()=>{if(AE.ctx&&SND.on)AE.m.gain.setTargetAtTime(SND.vol*1.4,AE.ctx.currentTime,.1)});
document.addEventListener('visibilitychange',()=>{if(!AE.ctx||!SND.on)return;document.hidden?AE.ctx.suspend():AE.ctx.resume()});
