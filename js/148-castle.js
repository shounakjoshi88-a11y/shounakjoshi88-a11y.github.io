/* ================= THE STAR KEEP =================
   The fifth rock, and the last one. A castle cut from a single stone, sitting in the
   cloud sea south of the observatory, where every light on the horizon finished being
   something before it got here. The pond asked it to stay open. Keeping promises is
   the price of the keeping.

   A rope bridge drops off the south edge of the observatory rock. Two towers stand
   either side of a courtyard of pale flagstone. Behind them the keep carries the
   dining lights: up the drum and into a room with one empty chair at the end.
   ------------------------------------------------------------------ */

// the rock itself: a squat castle islet, wider than it is tall, cut off from the rock it grew on
const LANDE=(a,b)=>{if(a<113||a>158||b<41||b>64)return 0;if(a+b>205)return 0;
 const k=b>59?dmp(a,136):1;return sdRR(a,b,135.5,52.2,19,10)+vn(a*.27+83,b*.27)*1.5*k<0};

// the ground: weathered flagstone, a paved ring for the court, a straight approach walk to the door,
// castle moss in the joints, and pale pebbles in the corners
function groundE(fi,fj,x,y,n,dirt){
 const gi=clamp(Math.floor(n*3.6+(vn(fi*.6,fj*.6)-.5)*1.7),0,4);
 const PL=PP({m:['#6e685c','#87816f','#a49d86','#bcb49c','#d0c8ae']}).m;
 const lt=relief(fi,fj);let k=PL[gi];k=[k[0]*lt,k[1]*lt,k[2]*lt];
 const mo=vn(fi*.3+3,fj*.3+7);          // old parchment patches, long dry
 if(mo>.7)k=mixc(k,[130,120,100],.5);else if(mo<.3)k=mixc(k,[96,94,80],.45);
 const e=EDE(fi,fj);   // the shadow the walls throw, and the sea on the drop
 if(e<.55)k=mixc(k,[88,88,76],.42);
 // the court: a ring of big flat slabs under the keep, and a straight walk from the bridge door
 const dc=Math.hypot(fi-136.5,fj-55.4),rd=3.7+(vn(fi*2,fj*2)-.5)*.35,ring=rd-.45;
 const inWalk=Math.abs(fi-136.0)<1.02&&fj>44.2&&fj<53.3;
 if(dc<rd||inWalk){
  const gxi=Math.floor(fi*1.35),gyi=Math.floor(fj*1.35),fx=(fi*1.35)%1,fy=(fj*1.35)%1;
  const grout=fx<.09||fy<.09;
  if(dc>=ring&&dc<rd)return[126,122,110];
  const t=(hh(gxi,gyi)>.62?1:0)+(fy<.5?1:0);
  const sc=[[166,160,144],[160,154,138],[170,164,148],[154,148,132]];
  const kk=lt*.94;
  if(grout)return[126,122,110];
  return[sc[t][0]*kk,sc[t][1]*kk,sc[t][2]*kk]}
 if(hh(x,y)>.955&&vn(fi*1.7,fj*1.7)>.5)k=mixc(k,[234,228,206],.7);
 if(vn(fi*.5,fj*.5)>.62&&vn(fi*.5+7,fj*.5)>.5)k=mixc(k,[110,124,88],.42);
 return k}

// ---- the keep: dais, drum, ashlar body, bell chamber, one empty finial
function keep(){
 if(SPR.keep)return SPR.keep;
 const c=mk(190,180),x=c.getContext('2d'),cx=95,by=172;
 const STN=[[72,70,62],[106,104,90],[144,140,126],[178,176,158],[212,210,194]];
 // the dais, three steps out, so the whole thing reads as built and not grown
 x.fillStyle=rgb(STN[0]);x.fillRect(cx-84,by-2,168,5);
 x.fillStyle=rgb(STN[4]);x.fillRect(cx-84,by-4,168,2);
 x.fillStyle=rgb(STN[1]);x.fillRect(cx-71,by-11,142,7);
 x.fillStyle=rgb(STN[4]);x.fillRect(cx-71,by-13,142,2);
 x.fillStyle=rgb(STN[2]);x.fillRect(cx-58,by-22,116,9);
 x.fillStyle=rgb(STN[4]);x.fillRect(cx-58,by-24,116,2);
 // the drum: ashlar courses, a tall portcullis arch with an aisle of light inside
 cyl(x,cx,by-27,56,16,30,[STN[2],STN[3],STN[1]],[222,220,206],(dx,v)=>{
   if(v%9==0)return STN[1];
   if(hh(dx>>1,v)>.9)return STN[1];
   return null});
 x.fillStyle='#191512';x.fillRect(cx-17,by-67,34,26);
 x.fillStyle='#3a2c20';x.fillRect(cx-16,by-66,32,25);
 x.fillStyle='#4a3a30';for(let k=-13;k<=13;k+=5)x.fillRect(cx+k,by-66,2,25);
 x.fillStyle='#241c14';x.fillRect(cx-16,by-43,32,2);
 x.fillStyle='#ffd88a';x.fillRect(cx-10,by-47,20,6);x.fillStyle='#ffdca0';x.fillRect(cx-6,by-46,12,5);
 for(const sx of[-34,28]){x.fillStyle='#191512';x.fillRect(cx+sx,by-60,6,12);x.fillStyle='#ffdca0';x.fillRect(cx+sx+2,by-56,2,5)}
 // tier two, the great hall: a squared tower with a corbelled mouth and two windows
 const bx0=cx-48,by0=by-92,bh=66;
 x.fillStyle=rgb(STN[3]);x.fillRect(bx0,by0,96,bh);
 x.fillStyle=rgb(STN[4]);x.fillRect(bx0,by0,96,8);
 x.fillStyle=rgb(STN[1]);x.fillRect(bx0,by0+bh-8,96,8);
 for(let v=12;v<bh-9;v+=11){x.fillStyle=rgb(STN[1]);x.fillRect(bx0,by0+v,96,1);
  const off=((v/11)|0)%2?7:0;
  for(let u=-8;u<96;u+=13){if(u+off>=0&&u+off<96)x.fillRect(bx0+u+off,by0+v,1,11)}}
 for(let u=bx0;u<bx0+96;u+=12){x.fillStyle=rgb(STN[4]);x.fillRect(u,by0-9,7,9);x.fillStyle=rgb([156,152,138]);x.fillRect(u,by0-10,7,1)}
 // two tall windows either side of the portcullis
 for(const wx of[16,58]){
  x.fillStyle='#191512';x.fillRect(wx,by0+16,13,28);
  x.fillStyle='#3a2c20';x.fillRect(wx+1,by0+17,11,27);
  x.fillStyle='#ffd88a';x.fillRect(wx+4,by0+20,5,17);
  x.fillStyle='#ffdca0';x.fillRect(wx+5,by0+21,3,11);
  x.fillStyle='#191512';x.fillRect(wx+4,by0+32,5,1)}
 // two banners hung off the front: dark red, a gold star, the tail notched
 for(const bx of[cx-31,cx+17]){
  x.fillStyle=rgb([114,32,26]);x.fillRect(bx,by0+15,17,46);
  x.fillStyle=rgb([146,44,32]);x.fillRect(bx,by0+15,3,46);
  for(let v=0;v<5;v++)x.fillStyle=rgb([114,32,26]),x.fillRect(bx+v*2,by0+61,17-v*4,2);
  x.fillStyle=rgb([228,182,72]);
  [[6,17],[5,19],[7,19],[4,21],[8,21],[6,23]].forEach(([dx,dy])=>x.fillRect(bx+dx,by0+dy,2,2));
 }
 // the bell chamber: three open arches, one bell, and a finial nobody rings
 const tx0=cx-22,ty0=by0-40;
 x.fillStyle=rgb(STN[2]);x.fillRect(tx0,ty0,44,34);
 x.fillStyle=rgb(STN[4]);x.fillRect(tx0,ty0-4,44,4);
 for(let u=tx0;u<tx0+44;u+=9){x.fillStyle=rgb(STN[3]);x.fillRect(u,ty0-10,5,6)}
 for(let k=0;k<3;k++){const ax=tx0+5+k*14;
  x.fillStyle='#141110';x.fillRect(ax,ty0+7,10,19);x.fillStyle='#241c14';x.fillRect(ax+1,ty0+8,8,18);
  if(k===1){x.fillStyle=rgb([222,182,92]);x.fillRect(ax+1,ty0+19,8,3);x.fillStyle='#c9a25a';x.fillRect(ax+2,ty0+10,6,9)}}
 x.fillStyle=rgb([74,56,36]);x.fillRect(cx-2,ty0-24,4,14);
 x.fillStyle=rgb([228,182,72]);x.fillRect(cx-5,ty0-28,10,2);x.fillRect(cx-2,ty0-31,4,9);
 // the ring of fallen stones at the foot, because a castle this old is honest about it
 x.fillStyle=rgb([106,104,90]);x.fillRect(cx-82,by-8,10,5);x.fillRect(cx+66,by-7,11,4);
 x.fillStyle=rgb([144,140,126]);x.fillRect(cx-82,by-9,10,1);x.fillRect(cx+68,by-8,6,1);
 const sp={c,ox:cx,oy:by,sh:[-60,0,120,16],sol:[-60,0,120,15],gl:[[cx-34,by0+19,24],[cx+36,by0+19,24],[cx,by-50,30]],hgt:138};
 SPR.keep=sp;return sp}

// ---- the outer towers: shorter than the keep, tall enough to be remembered
function keepTower(){
 if(SPR.tower)return SPR.tower;
 const c=mk(54,116),x=c.getContext('2d'),cx=27,by=110;
 const STN=[[64,62,54],[98,96,84],[136,132,120],[174,170,154],[210,208,192]];
 // the lower drum: ashlar courses, one slit window, half a door's worth of shadow
 cyl(x,cx,by,19,9,46,[STN[1],STN[2],STN[0]],[206,204,190],(dx,v)=>{
   if(v%11==0)return STN[0];
   if(hh(dx>>1,v)>.9)return STN[0];
   return null});
 x.fillStyle='#191512';x.fillRect(cx-5,by-36,10,8);x.fillStyle='#ffdca0';x.fillRect(cx-3,by-34,6,4);
 // the corbelled crown and the upper drum with a corbelled crown of its own
 cyl(x,cx,by-46,24,4,8,[STN[2],STN[3],STN[1]],[222,220,206],null);
 for(let u=cx-22;u<cx+22;u+=9){x.fillStyle=rgb(STN[3]);x.fillRect(u,by-59,5,8);x.fillStyle=rgb([158,154,140]);x.fillRect(u,by-60,5,1)}
 cyl(x,cx,by-60,15,6,20,[STN[1],STN[2],STN[0]],[210,208,194],(dx,v)=>v%7==0?STN[0]:null);
 for(let u=cx-14;u<cx+14;u+=8){x.fillStyle=rgb(STN[2]);x.fillRect(u,by-74,4,5)}
 // the cap roof: a dark cone and a gilt finial nobody has ever rung
 for(let v=0;v<=20;v++){const hw=Math.round(15*(1-v/21));
   for(let dx=-hw;dx<=hw;dx++){const sh=(dx<0?.7:dx>5?.84:1)*(1-.055*v);
     x.fillStyle=rgb([166,64,44].map(q=>Math.min(255,q*sh)));x.fillRect(cx+dx,by-79-v,1,1)}}
 x.fillStyle=rgb([222,182,92]);x.fillRect(cx-1,by-103,2,7);x.fillRect(cx-4,by-105,8,2);x.fillRect(cx-2,by-107,4,2);
 const sp={c,ox:cx,oy:by,sh:[-17,2,34,9],sol:[-17,2,34,11],gl:[[cx,by-46,16]],hgt:76};
 SPR.tower=sp;return sp}

// ---- a banner pole for the walk from the bridge, dark red, one gold star
function bannerPole(){
 if(SPR.bnr)return SPR.bnr;
 const c=mk(18,72),x=c.getContext('2d');
 x.fillStyle='#3a3a3e';x.fillRect(7,8,4,62);x.fillStyle='#55555c';x.fillRect(8,8,2,62);
 x.fillStyle='#22221a';x.fillRect(5,66,10,4);
 x.fillStyle=rgb([114,32,26]);x.fillRect(9,9,7,36);x.fillStyle=rgb([146,44,32]);x.fillRect(9,9,2,36);
 x.fillStyle=rgb([114,32,26]);x.fillRect(9,45,7,1);x.fillRect(9,47,6,1);x.fillRect(9,49,5,1);x.fillRect(9,51,4,1);x.fillRect(9,53,3,1);x.fillRect(9,55,2,1);
 x.fillStyle=rgb([228,182,72]);x.fillRect(11,13,3,1);x.fillRect(12,12,1,3);x.fillRect(10,14,5,1);
 const sp={c,ox:9,oy:70,sh:[1,1,8,2],hgt:58};
 SPR.bnr=sp;return sp}

// ---- a brazier: five hot coals, one patient flame
function brazier(){
 if(SPR.brz)return SPR.brz;
 const c=mk(22,22),x=c.getContext('2d');
 x.fillStyle='#4a4a52';x.fillRect(9,11,4,10);
 x.fillStyle='#38383e';x.fillRect(2,11,18,5);
 x.fillStyle='#55555c';x.fillRect(1,11,20,2);
 x.fillStyle='#ff9a3c';x.fillRect(5,12,12,2);x.fillStyle='#ffd27a';x.fillRect(7,12,8,1);
 x.fillStyle='#ff6a20';x.fillRect(8,13,6,2);x.fillStyle='#ffe2a0';x.fillRect(9,13,4,1);
 for(let k=0;k<6;k++){const t=1-k/6,hw=Math.round(4*t+.6);
  x.fillStyle=['#ffe2a0','#ffd27a','#ffb84a','#ff8a30'][k&3];x.fillRect(11-hw,10-k,hw*2,1)}
 const sp={c,ox:11,oy:20,sh:[1,1,9,2],fire:1};
 SPR.brz=sp;return sp}

// ---- the king's chair: one seat at the edge, facing the drop, nothing behind it
function kingChair(){
 if(SPR.kchr)return SPR.kchr;
 const c=mk(26,26),x=c.getContext('2d');
 x.fillStyle='#33241a';x.fillRect(5,2,16,24);
 x.fillStyle='#4a3626';x.fillRect(7,4,12,10);
 x.fillStyle='#6a5040';x.fillRect(8,5,10,8);
 // a star cut out of the panel: the pale sky shows through
 x.fillStyle='#241c14';x.fillRect(11,7,4,6);x.fillRect(9,9,8,2);
 x.fillStyle='#33241a';x.fillRect(3,13,20,4);x.fillStyle='#4a3626';x.fillRect(3,13,20,1);
 x.fillStyle='#6a5040';x.fillRect(4,17,2,9);x.fillRect(20,17,2,9);
 const sp={c,ox:13,oy:25,sh:[2,1,10,2],hgt:24};
 SPR.kchr=sp;return sp}

function seed1(i,j){return (i*13+j*7)%4}

// ---- put up the fifth rock
function buildCastle(){
 // the rope bridge over from the observatory rock, running south to north
 const B4={a0:136.5,b0:33.6,b1:43.4,sag:7,v:1};
 window.RB4=B4;
 objs.push({d:B4.a0+B4.b0+.02,x:Math.round(PF(B4.a0,(B4.b0+B4.b1)/2)[0]),y:Math.round(PF(B4.a0,(B4.b0+B4.b1)/2)[1]),ph:0,t:0,sp:null,
  draw:c=>ropeSegB(c,B4.b0,B4.b1,B4)});
 // the wind: lanterns, a banner at either arm of the walk, a boulder or two, pines at the back
 put(134.2,51.3,lamp(),0,.05);
 put(139.3,51.4,lamp(),0,.05);
 put(132.9,52.2,bannerPole(),0,.05);
 put(139.9,52.3,bannerPole(),0,.05);
 for(let i=115;i<160;i++)for(let j=42;j<64;j++){
  const fi=i+hh(i*7,j*5)-.5,fj=j+hh(j*11,i*3)-.5;
  if(!LANDE(fi,fj)||WD(fi,fj)>-.6)continue;
  const q=hh(i*5,j*7);
  if(q>.90)put(fi,fj,bush('g',seed1(i,j),false),0);
  else if(q>.84)put(fi,fj,RS(2,2,RK,seed1(i,j)),0)}
 put(126.3,52.3,pine('g',9,2),1);
 put(147.7,51.9,pine('g',8,1),1);
 put(151.8,56.3,RS(3,3,RK,2),0);
 put(121.6,58.7,RS(4,4,RK,1),0);
 put(153.4,51.2,pine('g',7,3),1);
 put(118.9,53.6,pine('g',8,2),1);
 // broken slabs and dry pines at the rim, the way a keep that old settles
 put(120.6,48.4,RS(3,2,ST,9),0);put(152.0,47.9,RS(2,2,ST,11),0);put(123.4,61.8,RS(2,2,RK,13),0);
 put(153.2,59.6,RS(3,2,ST,17),0);put(127.2,44.6,pine('g',7,1),1);put(145.4,60.8,pine('g',8,4),1);
 // a pair of coals burning at the bridge mouth, where the path arrives
 put(133.0,45.6,brazier(),2,.05);
 put(140.2,45.7,brazier(),2,.05);
 // the towers, then the keep
 put(126.8,57.4,keepTower(),3,.05);
 put(144.2,57.6,keepTower(),3,.05);
 put(136.5,53.3,keep(),3,.05);
 // the fire in the courtyard
 put(131.6,59.2,brazier(),2,.05);
 put(141.4,59.3,brazier(),2,.05);
 // a bench set to face the keep from across the court
 put(131.8,58.5,bench(0,0),0);
 // the chair at the edge, facing the drop
 put(140.2,62.6,kingChair(),2,.05);
 objs.sort((a,b)=>a.d-b.d);
}
