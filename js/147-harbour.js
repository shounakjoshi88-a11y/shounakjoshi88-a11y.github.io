/* ================= THE HARBOUR =================
   A low rock off the south of the sakura isle, where the things that were finished
   get a hull and a name, and then leave. Everything Shounak builds ends up here
   first, and then it ends up somewhere he has never been.
   ------------------------------------------------------------------ */
// the rock itself: a squat round island with a hard edge and a gravel shore
const LANDD=(a,b)=>{if(a<86||a>104||b<49||b>67)return 0;
 const k=a>100?dmp(b,57):1;return sdRR(a,b,95,58,8,4)+vn(a*.28+51,b*.28)*1.3*k<0};
const EDD=(a,b)=>-sdRR(a,b,95,58,8,4);
// the ground: wet gravel, dry gravel, and a little scrub in the middle
function groundD(fi,fj,x,y,n,dirt){
 const g=[168,158,138],wet=[122,118,104],scrub=[96,116,74];
 let k=g;
 if(n>.62)k=wet;else if(n<.24)k=[186,176,152];
 if(fi>92&&fi<99&&fj>54&&fj<61&&n>.5)k=mixc(k,scrub,.5);
 if(n>.9)k=mixc(k,[206,198,176],.5);
 return k}
// the light on the rock: tall, cold, and lit from the inside
function lighthouse(){
 if(SPR.lh)return SPR.lh;
 const W=34,H=62,c=mk(W,H),x=c.getContext('2d'),cx=17,by=58;
 const ST=[[236,232,222],[198,192,180],[142,138,128],[96,94,88]];
 for(let v=0;v<40;v++){const w=13-v*.14;
  for(let dx=-w;dx<=w;dx++){const k=dx<0?.74:dx>3?.82:1;
   x.fillStyle=rgb(ST[0].map(q=>q*k));x.fillRect(Math.round(cx+dx),by-v-6,1,1)}}
 x.fillStyle='#8a3a2a';for(let v=18;v<40;v+=7)x.fillRect(Math.round(cx-13+v*.13),by-v-6,Math.round(26-v*.26),2);
 x.fillStyle='#3a4048';x.fillRect(cx-12,by-46,24,5);x.fillRect(cx-12,by-16,24,4);
 x.fillStyle='#2a3038';x.fillRect(cx-9,by-42,18,7);
 x.fillStyle='#ffd88a';x.fillRect(cx-6,by-40,12,4);
 x.fillStyle='#fff6d0';x.fillRect(cx-3,by-39,6,2);
 x.fillStyle='#3a4048';x.fillRect(cx-10,by-47,20,2);
 x.fillStyle='#8a3a2a';x.fillRect(cx-9,by-52,18,2);
 const sp={c,ox:cx,oy:by,sh:[-6,0,12,3]};
 SPR.lh=sp;return sp}
// the yard: a corrugated shack where the hulls are built
function yardShack(){
 if(SPR.shk)return SPR.shk;
 const c=mk(30,26),x=c.getContext('2d');
 x.fillStyle='#5a6a6e';x.fillRect(3,10,24,14);
 x.fillStyle='#46565a';x.fillRect(3,10,24,2);
 x.fillStyle='#7a8a8e';for(let i=0;i<5;i++)x.fillRect(5+i*5,12,2,12);
 x.fillStyle='#3a2a1c';x.fillRect(12,16,8,8);
 x.fillStyle='#c9b06a';x.fillRect(15,19,2,2);
 x.fillStyle='#8a5a34';x.fillRect(2,6,26,4);x.fillStyle='#6a4024';x.fillRect(2,6,26,2);
 x.fillStyle='#3a4048';x.fillRect(24,2,4,4);
 const sp={c,ox:15,oy:24,sh:[-8,0,16,4]};
 SPR.shk=sp;return sp}
// a hull on the stands, waiting for a name
function hullStand(){
 if(SPR.hul)return SPR.hul;
 const c=mk(40,22),x=c.getContext('2d');
 x.fillStyle='#8a5a34';x.fillRect(3,10,34,6);
 x.fillStyle='#6a4024';x.fillRect(3,14,34,2);
 x.fillStyle='#a8703c';x.fillRect(5,5,30,6);
 x.fillStyle='#c08a4c';x.fillRect(7,3,26,3);
 x.fillStyle='#8a5a34';x.fillRect(18,6,5,4);
 x.fillStyle='#4a3a2a';x.fillRect(6,16,3,4);x.fillRect(31,16,3,4);
 const sp={c,ox:20,oy:20,sh:[-10,0,20,4]};
 SPR.hul=sp;return sp}
// the crane that lifts them onto the sea
function crane(){
 if(SPR.crn)return SPR.crn;
 const c=mk(40,46),x=c.getContext('2d');
 x.fillStyle='#6a6a70';x.fillRect(8,18,4,26);x.fillStyle='#55555c';x.fillRect(8,18,2,26);
 x.fillStyle='#6a6a70';x.fillRect(8,16,26,3);
 x.fillStyle='#4a4a52';x.fillRect(28,18,3,12);
 x.fillStyle='#8a8a92';x.fillRect(26,30,8,3);
 x.fillStyle='#6a6a70';x.fillRect(6,42,28,3);
 x.fillStyle='#c9b06a';x.fillRect(10,12,4,4);
 const sp={c,ox:20,oy:44,sh:[-12,0,24,3]};
 SPR.crn=sp;return sp}

// the new rock
function buildHarbour(){
 // the rope bridge over from the sakura isle, running north to south
 const B3={a0:95,b0:43.4,b1:51.6,sag:3,v:1};
 RB3=B3;
 objs.push({d:B3.a0+B3.b0+.02,x:Math.round(PF(B3.a0,(B3.b0+B3.b1)/2)[0]),y:Math.round(PF(B3.a0,(B3.b0+B3.b1)/2)[1]),ph:0,t:0,sp:null,draw:c=>ropeSegB(c,B3.b0,B3.b1,B3)})
 // the ground of the rock: gravel, a scrubby middle, and a few wind-bent pines
 for(let i=87;i<104;i++)for(let j=50;j<67;j++){
  const fi=i+hh(i*7,j*3)-.5,fj=j+hh(j*11,i*5)-.5;
  if(!LANDD(fi,fj)||WD(fi,fj)>-.6)continue;
  const q=hh(i*3,j*7);
  if(q>.86)put(fi,fj,pine('g',10,seed1(i,j)),1);
  else if(q>.78)put(fi,fj,RS(3,3,RK,seed1(i,j)),0);
  else if(q>.7)put(fi,fj,bush('g',seed1(i,j),false),0)}
 // the buildings and the yard
 put(95.0,58.6,lighthouse(),2,.05);
 put(92.2,55.4,yardShack(),2,.05);
 put(97.4,60.2,hullStand(),1,.05);
 put(99.6,57.0,crane(),2,.05);
 put(93.0,60.4,hullStand(),1,.05);
 for(const[a,b,f]of[[93.6,59.2,crates],[98.6,60.6,barrel],[91.4,53.6,crates],[96.0,61.4,barrel],[94.6,52.8,barrel]])
  put(a,b,f(),0);
 put(90.6,56.0,postbox(),0);
 put(97.0,54.0,lamp(),3);
 put(93.2,58.0,woodpile(),0);
 put(99.2,54.6,reed(1),0);
 // the jetty out over the cloud sea
 put(95.6,65.0,harbourJetty(),1);
}
function seed1(i,j){return (i*13+j*7)%4}
// a rope bridge that runs north to south: the planks cross it, the ropes follow it
function ropeSegB(c,s0,s1,B){
 const a=B.a0;
 const P=(b,db)=>{const[x,y]=PF(a,b+db);const t=clamp((b-B.b0)/(B.b1-B.b0),0,1),L=-B.sag*4*t*(1-t);
  return[x,y-L+Math.sin(T*1.1+b*.35)*.7]};
 for(let b=s0;b<=s1+.001;b+=.5){const[x,y]=P(b,0);
  c.fillStyle='#8a6a44';c.fillRect(Math.round(x)-11,Math.round(y)-12,23,3);
  c.fillStyle='#5a4024';c.fillRect(Math.round(x)-11,Math.round(y)-9,23,1);
  c.fillStyle='#a88a5c';c.fillRect(Math.round(x)-11,Math.round(y)-12,23,1)}
 for(const side of[-1,1]){
  for(let b=s0;b<=s1+.001;b+=.06){const[x,y]=P(b,side*.55);c.fillStyle='#8a6a44';c.fillRect(Math.round(x),Math.round(y)-13,1,1)}
  for(let b=s0;b<=s1+.001;b+=2){const[x,y]=P(b,side*.55);
   c.fillStyle='#4d3120';c.fillRect(Math.round(x)-1,Math.round(y)-15,3,16);
   c.fillStyle='#c18b56';c.fillRect(Math.round(x)-1,Math.round(y)-16,3,2);c.fillStyle='#4d3120';c.fillRect(Math.round(x),Math.round(y)-14,1,14)}}}
// the little jetty on the harbour side
function harbourJetty(){
 if(SPR.hjt)return SPR.hjt;
 const c=mk(44,26),x=c.getContext('2d');
 x.fillStyle='#8a6a42';x.fillRect(2,6,40,4);x.fillStyle='#6a4e2e';x.fillRect(2,9,40,2);
 x.fillStyle='#5a4024';x.fillRect(4,10,3,14);x.fillRect(37,10,3,14);
 x.fillStyle='#a88a5c';x.fillRect(2,5,40,1);
 const sp={c,ox:22,oy:24,sh:[-6,0,12,3]};
 SPR.hjt=sp;return sp}
