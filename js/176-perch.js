/* ================= SITTING =================
   The benches were always meant for sitting. Stand close to one, the hint offers
   it, and the village goes on without you for a while. Any step and you are
   back on your feet.
   ------------------------------------------------------------------ */
let SIT=null;
const SITL=['Nine minutes of nothing. The koi patrol their kingdom regardless.',
 'The lantern light reaches the far bank and gives up. You stay a little longer.',
 'Somewhere behind you, the mountain. Straight ahead, water doing its patient work.',
 'The maples approve of sitting. They have never approved of anyone rushing.',
 'A dragonfly reads the water like a letter and files it under unfinished.',
 'You stop being a visitor and start being furniture. The village accepts you.'];
function perchNear(){
 if(MODE!=='explore'||!PL||SIT)return null;
 let best=null,bd=1e9;
 for(const o of objs){const sp=o.sp;if(!sp||!sp.bench)continue;
  const dx=16*((PL.P.a-o.a)-(PL.P.b-o.b)),dy=8*((PL.P.a-o.a)+(PL.P.b-o.b));
  const d=Math.hypot(dx,dy);
  if(d<17&&d<bd){bd=d;best=o}}
 return best}
function sitPose(sp){return sp.baxis?(sp.brev?[1,0]:[-1,0]):(sp.brev?[0,1]:[0,-1])}
function perchUse(){
 if(SIT){standUp();return}
 const o=perchNear();if(!o)return;
 const sp=o.sp,[fx,fz]=sitPose(sp);
 SIT={o,a:o.a,b:o.b,fx,fz};
 PL.P.sit=1;PL.P.vx=fx;PL.P.vy=fz;PL.P.anim=0;GOAL=null;
 const it=PEOPLE.find(r=>r.P===PL.P);if(it)it.d=SIT.a+SIT.b+.02;
 note('You sit',SITL[(Math.random()*SITL.length)|0],5200)}
function standUp(){
 if(!SIT)return;
 SIT=null;
 if(PL){PL.P.sit=0;const it=PEOPLE.find(r=>r.P===PL.P);if(it)it.d=PL.P.a+PL.P.b}}
