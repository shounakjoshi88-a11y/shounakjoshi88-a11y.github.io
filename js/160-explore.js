/* ================= WALK IT: explore mode ================= */
// Walk the village yourself. The camera follows you, a villager speaks when you stand near
// them, glints are picked up by walking over them, and the map carries you across the sea.
// The scroll story is still one button away, so nothing that was here is lost.
const LOOKS=[[[54,78,68],[222,204,154],[44,42,50],[228,186,150],[70,48,36]]];
// what the traveller cannot walk through: a number is a circle round the base of a thin
// thing, 0 means a building (use its own footprint), and an array is an explicit footprint.
const SOLSPEC={oak:4,pine:4,bamboo:3,reed:3,corn:3,sunflower:3,tomato:3,pumpkinS:3,stump:4,logS:4,bush:3,
 cottage:0,barn:0,boathouse:0,coop:0,teahouse:0,stall:0,lookout:0,shrine:0,
 windmill:[-10,0,30,9],pagoda:[-16,-4,32,10],observatory:[-16,0,32,10],dish:5,signalMast:4,
 standingStone:4,tripod:4,wellS:[3,1,16,6],hermit:[-16,2,32,10],torii:[0,3,30,9],bench:[0,1,15,4],
 cart:[9,2,19,5],crates:[4,2,18,6],barrel:[2,1,8,3],millWheel:[-10,0,24,8],woodpile:[18,5,24,5],
 pole:3,lamp:3,postbox:4,signpost:3,stoneLantern:4,RS:[-14,0,28,8]};
const SGCS=16,SGRID=new Map();
const sgKey=(i,j)=>i+','+j;
function addSolid(fi,fj,sol,sp){
 const wide=sp.rf||Array.isArray(sol),ex=wide?3:2,rec={fi,fj,sol,sp};
 const i0=Math.floor((fi-ex)/SGCS),i1=Math.floor((fi+ex)/SGCS),j0=Math.floor((fj-ex)/SGCS),j1=Math.floor((fj+ex)/SGCS);
 for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=sgKey(i,j);let a=SGRID.get(k);if(!a){a=[];SGRID.set(k,a)}a.push(rec)}
}
function blocked(a,b){
 const arr=SGRID.get(sgKey(Math.floor(a/SGCS),Math.floor(b/SGCS)));if(!arr)return 0;
 for(const r of arr){
  const da=a-r.fi,db=b-r.fj,dx=16*(da-db),dy=8*(da+db),s=r.sol;
  if(typeof s==='number'){if(dx*dx+dy*dy<s*s)return 1;continue}
  if(s===0){const sp=r.sp;
   if(sp.rf){if(sp.a>0&&Math.abs(dx)/sp.a+Math.abs(dy)/sp.ah<=1)return 1;continue}
   const sh=sp.sh;if(sh){if(dx>=sh[0]-1&&dx<=sh[0]+sh[2]+1&&dy>=sh[1]-1&&dy<=sh[1]+sh[3]+1)return 1}
   continue}
  if(dx>=s[0]-1&&dx<=s[0]+s[2]+1&&dy>=s[1]-1&&dy<=s[1]+s[3]+1)return 1}
 return 0}
const mkSpr=p=>({front:[villager(p,0,'front'),villager(p,1,'front')],back:[villager(p,0,'back'),villager(p,1,'back')],side:[villager(p,0,'side'),villager(p,1,'side')]});
let MODE='start',PL=null,NEAR=-1,GOAL=null,KEYS={},CK=null,PLT=performance.now(),CF=[31.5,31.5],ZBASE=1,mmT=0;
const onBr=(a,b)=>(a>=RB.a0-.2&&a<=RB.a1+.2&&Math.abs(b-RB.b)<.95)||(a>=RB2.a0-.5&&a<=RB2.a1+.5&&Math.abs(b-RB2.b)<.95)||ARCH.some(A=>Math.abs(a-A.i)<=1.2&&b>=A.j0-.45&&b<=A.j1+.45);
const walkable=(a,b)=>{if(a<1||a>150||b<2||b>45)return 0;if(onBr(a,b))return 1;if(!(LANDA(a,b)||LANDB(a,b)||LANDC(a,b))||WD(a,b)>-.2)return 0;if(blocked(a,b))return 0;return 1};
function nearestPath(a,b){let best=null,bd=1e9;
 for(const line of PATHS)for(let i=0;i<line.length-1;i++){const[x1,y1]=line[i],[x2,y2]=line[i+1],dx=x2-x1,dy=y2-y1,L2=dx*dx+dy*dy||1,
  t=Math.max(0,Math.min(1,((a-x1)*dx+(b-y1)*dy)/L2)),x=x1+dx*t,y=y1+dy*t,d=Math.hypot(a-x,b-y);
  if(d<bd){bd=d;best=[x,y]}}
 return best}
let WALKLIST=null;
function walkList(){if(WALKLIST)return WALKLIST;WALKLIST=[];
 for(let a=1;a<151;a+=.5)for(let b=2;b<46;b+=.5)if(walkable(a,b))WALKLIST.push([a,b]);
 return WALKLIST}
function nearWalk(i,j){
 for(let r=0;r<12;r+=.5)for(let t=0;t<(r?16:1);t++){const q=t/16*6.283,a=i+Math.cos(q)*r,b=j+Math.sin(q)*r;if(walkable(a,b))return[a,b]}
 const L=walkList();let best=null,bd=1e9;
 for(const[a,b]of L){const d=(a-i)*(a-i)+(b-j)*(b-j);if(d<bd){bd=d;best=[a,b]}}
 return best||[31.5,30]}
function scr2tile(sx,sy){const X=(sx/WS-TX)/Z,Y=(sy/WS-TY)/Z,u=(X-OX)/16,v=(Y-OY)/8;return[(u+v)/2,(v-u)/2]}
function mkWalker(a,b,look,name,me){const pal=LOOKS[look%LOOKS.length],P={pal,route:[[a,b],[a,b]],spd:0,seg:0,a,b,anim:0,vx:.7,vy:.7,wait:1e9,cd:1e9,mv:0,talk:0,me,rem:!me,name,look,spr:mkSpr(pal),hid:0},it={d:a+b,P};PEOPLE.push(it);return it}
// the title screen drifts from rock to rock, so the archipelago reads as three places
const START_CAM=[[31.5,31.5],[73,19.5],[101,26],[133,27]];
function startCam(){const n=START_CAM.length,per=15,tt=T%(per*n),k=Math.floor(tt/per),u=(tt%per)/per,e=sm(.45,1,u),A=START_CAM[k],B=START_CAM[(k+1)%n];return[lerp(A[0],B[0],e),lerp(A[1],B[1],e)]}
const zTarget=()=>window.__z||(MODE==='start'?(innerWidth<900?.28:Math.min(.46,innerWidth/3500)):MODE==='explore'?(innerWidth<700?.98:1.28):ZBASE);
function nearestChapter(){if(!PL)return 0;let best=0,bd=1e9;CH.forEach((c,k)=>{const d=Math.hypot(PL.P.a-c.at[0],PL.P.b-c.at[1]);if(d<bd){bd=d;best=k}});return best}
function playerTick(){
 const n=performance.now(),dt=Math.min(.09,(n-PLT)/1000);PLT=n;
 if(MODE!=='explore'||!PL)return;
 const P=PL.P;
 let dx=0,dy=0;
 if(KEYS.w||KEYS.arrowup){dx--;dy--}
 if(KEYS.s||KEYS.arrowdown){dx++;dy++}
 if(KEYS.a||KEYS.arrowleft){dx--;dy++}
 if(KEYS.d||KEYS.arrowright){dx++;dy--}
 if(dx||dy)GOAL=null;else if(GOAL){dx=GOAL[0]-P.a;dy=GOAL[1]-P.b;if(Math.hypot(dx,dy)<.12){GOAL=null;dx=dy=0}}
 const L=Math.hypot(dx,dy);P.mvg=0;
 if(L>0){dx/=L;dy/=L;const sp=2.6*dt*(bridgeLift(P.a,P.b)>0?.85:1),na=P.a+dx*sp,nb=P.b+dy*sp;let ok=1;
  if(walkable(na,nb)){P.a=na;P.b=nb}
  else if(walkable(na,P.b))P.a=na;
  else if(walkable(P.a,nb))P.b=nb;
  else{ok=0;GOAL=null}
  if(ok){P.vx=dx;P.vy=dy;P.mvg=1;P.anim+=dt*7}}
 P.wait=P.mvg?0:1e9;
 if(blocked(P.a,P.b)){const q=nearWalk(P.a,P.b);P.a=q[0];P.b=q[1];GOAL=null}
 PL.d=P.a+P.b;
 CF[0]+=(P.a-CF[0])*Math.min(1,dt*6);CF[1]+=(P.b-CF[1])*Math.min(1,dt*6);
 let best=-1,bd=2.6;CH.forEach((c,k)=>{const d=Math.hypot(P.a-c.at[0],P.b-c.at[1]);if(d<bd){bd=d;best=k}});NEAR=best;
 for(const s of SEC){if(s.f||s.noGlint)continue;const r=s.r||1.95;if(Math.hypot(P.a-s.at[0],P.b-s.at[1])>=r)continue;
  if(s.id==='signal'){if(!s.seen){s.seen=1;openSig()}}else found(s)}
 if(++mmT%6===0)drawMM();
 // the hint that tells you what you can do right here
 const dr=typeof doorNear==='function'?doorNear():null;
 const hint=$('hint');
 if(hint){
  if(MODE==='explore'&&dr){hint.hidden=false;hint.textContent=doorLock(dr.d)?'Locked door':'Open the door'}
  else if(MODE==='explore'&&typeof anglingNear==='function'&&anglingNear()){hint.hidden=false;hint.textContent='Cast a line'}
  else hint.hidden=true}
}
// ---- the minimap: three rocks, the glints you found, and where you are standing
const MMW=180,MMH=96,MMX0=180,MMX1=3320,MMY0=20,MMY1=1720;let MMBG=null;
const mmx=(X,Y)=>[(X-MMX0)/(MMX1-MMX0)*MMW,(Y-MMY0)/(MMY1-MMY0)*MMH];
function bakeMM(){const b=mk(MMW,MMH),g=b.getContext('2d');
 for(let Y=0;Y<MMH;Y+=2)for(let X=0;X<MMW;X+=2){const wx=MMX0+X/MMW*(MMX1-MMX0),wy=MMY0+Y/MMH*(MMY1-MMY0),a=((wx-OX)/16+(wy-OY)/8)/2,b2=((wy-OY)/8-(wx-OX)/16)/2;
  if(!LAND(a,b2))continue;g.fillStyle=WD(a,b2)>-.2?'#3f7f78':'#93b170';g.fillRect(X,Y,2,2)}
 return b}
function drawMM(){
 const m=$('mm');if(!m)return;const g=m.getContext('2d');if(!MMBG)MMBG=bakeMM();
 g.clearRect(0,0,MMW,MMH);g.drawImage(MMBG,0,0);
 for(const c of CH){const[X,Y]=PF(c.at[0],c.at[1]),[x,y]=mmx(X,Y);
  if(PASS.chapters.includes(c.name)){g.fillStyle='#ffe3a0';g.fillRect(x-1,y-1,3,3)}
  else{g.fillStyle='#b8a887';g.fillRect(x-1,y-1,2,2)}}
 g.fillStyle='#9bd08a';for(const s of SEC)if(s.f&&!s.noGlint){const[X,Y]=PF(s.at[0],s.at[1]),[x,y]=mmx(X,Y);g.fillRect(x-1,y-1,2,2)}
 if(PL){const[X,Y]=PF(PL.P.a,PL.P.b),[x,y]=mmx(X,Y);
  g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x-3,y-3,7,7);
  g.fillStyle='#ff6b4a';g.fillRect(x-2,y-2,5,5);
  g.fillStyle='#fff4d0';g.fillRect(x-1,y-1,3,3)}
 const vx=-TX/Z,vy=-TY/Z,vw=VW/Z,vh=VH/Z,[ax,ay]=mmx(vx,vy),[bx,by]=mmx(vx+vw,vy+vh);
 g.strokeStyle='rgba(255,244,208,.5)';g.lineWidth=1;g.strokeRect(ax+.5,ay+.5,Math.max(3,bx-ax),Math.max(3,by-ay));
}
$('mm').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();
 if(MODE!=='explore'||!PL)return;
 const r=$('mm').getBoundingClientRect(),mx=(e.clientX-r.left)/r.width*MMW,my=(e.clientY-r.top)/r.height*MMH;
 const wx=MMX0+mx/MMW*(MMX1-MMX0),wy=MMY0+my/MMH*(MMY1-MMY0);
 const a=((wx-OX)/16+(wy-OY)/8)/2,b=((wy-OY)/8-(wx-OX)/16)/2;
 const s=nearWalk(a,b);PL.P.a=s[0];PL.P.b=s[1];GOAL=null;CF=[s[0],s[1]];PL.P.wait=1e9;drawMM();
});
// ---- the modes: start, explore, and the story you can always go back to
function setMode(m){
 MODE=m;
 document.body.classList.toggle('start',m==='start');
 document.body.classList.toggle('exp',m==='explore');
 document.documentElement.classList.toggle('exp',m==='explore');
 const xp=$('xp');xp.textContent=m==='explore'?'Story':'Explore';
 xp.setAttribute('aria-label',m==='explore'?'Leave the walk and read the story':'Walk the village yourself');
 if(m!=='explore'){NEAR=-1;GOAL=null;if(PL)PL.P.hid=1;BUB.style.opacity=0;BUB.style.pointerEvents='none';BUB.style.visibility='hidden'}
 if(m!=='start'){const s=$('start');if(s&&!s.hidden){s.classList.add('gone');setTimeout(()=>{s.hidden=true},760)}}
}
function startX(){
 if(!PL){const sc=MODE==='start'?startCam():[31.5,31.5],pt=nearestPath(sc[0],sc[1])||sc,s=nearWalk(pt[0],pt[1]);PL=mkWalker(s[0],s[1],0,'You',1)}
 PL.P.hid=0;PL.P.wait=1e9;CF=[PL.P.a,PL.P.b];GOAL=null;
 setMode('explore');drawMM();
 note('The village is open','Walk with WASD, the arrow keys, or by tapping the ground. Stand near a villager and they will tell you a piece of Shounak. Every faint glint you walk over is a secret.');
}
function leaveX(silent){
 if(MODE==='explore'){
  const k=nearestChapter();setMode('story');
  if(!silent&&PL){const max=Math.max(1,document.body.scrollHeight-innerHeight),de=document.documentElement;
   de.style.scrollBehavior='auto';scrollTo(0,max*k/(CH.length-1));de.style.scrollBehavior=''}
 }else if(MODE==='start'){setMode('story');scrollTo(0,0)}
}
$('sgo').onclick=startX;
$('sread').onclick=()=>{setMode('story');scrollTo(0,0)};
$('xp').onclick=()=>MODE==='explore'?leaveX():startX();
// ---- walking controls
addEventListener('keydown',e=>{
 if(MODE!=='explore')return;
 if(e.target&&e.target.closest&&e.target.closest('input,textarea,select'))return;
 const k=e.key.toLowerCase();
 if(k==='escape'){leaveX();return}
 if(k==='m'){buildMap();$('map').hidden=false;return}
 if(k.startsWith('arrow')||k===' ')e.preventDefault();
 KEYS[k]=1});
addEventListener('keyup',e=>{KEYS[e.key.toLowerCase()]=0});
addEventListener('blur',()=>{KEYS={}});
const NOTAP='button,a,input,textarea,select,#mm,#bub,#map,#sig,#pass,#fish,.panel,#find,#wish,#walkhud';
addEventListener('pointerdown',e=>{if(MODE!=='explore'||e.button)return;if(e.target.closest&&e.target.closest(NOTAP))return;CK=[e.clientX,e.clientY]},{passive:true});
addEventListener('pointerup',e=>{if(MODE!=='explore'||!CK)return;
 if(Math.hypot(e.clientX-CK[0],e.clientY-CK[1])<10){const f=$('fish');if(!f||f.hidden)GOAL=scr2tile(e.clientX,e.clientY)}
 CK=null});
