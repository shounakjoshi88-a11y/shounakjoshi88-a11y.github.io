/* ================= THE STAR KEEP =================
   The fifth rock, and the last one. A castle cut from a single stone, sitting in the
   cloud sea south of the observatory, where every light on the horizon finished being
   something before it got here. The pond asked it to stay open. Keeping promises is
   the price of the keeping.

   A rope bridge drops off the south edge of the observatory rock. Two towers stand
   either side of a courtyard of pale flagstone. Behind them the keep carries the
   dining lights: up the drum and into a room with one empty chair at the end.
   ------------------------------------------------------------------ */

// the kingdom's silhouette: one signed-distance field for the whole rock. The old keep drum at the
// heart, an east lobe standing proud for the dry garden, and a south lobe where the ground always
// ends at the drop. Smooth-joined, welted with noise that dies at the king's chair on the lip.
const kdist=(a,b)=>{
 const smin=(p,q,k)=>{const h=clamp(.5+.5*(q-p)/k,0,1);return q+(p-q)*h-k*h*(1-h)};
 const dN=Math.hypot(a-124.5,b-48.5)-5.4;                 // the north-west lobe
 const dSW=Math.hypot(a-119.5,b-59.5)-9.0;                // the west bailey, the yard and the postern
 const dM=Math.hypot(a-134.0,b-52.0)-10.6;                // the drum the kingdom grew from
 const dE=Math.hypot(a-151.5,b-49.0)-9.4;                 // the eastern garden wing
 const dSE=Math.hypot(a-150.5,b-60.0)-7.0;                // the south-east corner, swallowing the postern
 const dS=Math.hypot(a-137.8,b-58.4)-7.8;                 // the southern lobe
 const dLOW=Math.hypot(a-137.5,b-68.5)-10.0;               // the lower town and the avenue
 const dSWT=Math.hypot(a-126.5,b-71.0)-6.2;               // the south-west tip
 const dSET=Math.hypot(a-150.5,b-69.5)-6.8;               // the south-east tip
 const dEW=Math.hypot(a-160.5,b-54.5)-5.8;                // the pagoda terrace
 const dEW2=Math.hypot(a-167.5,b-52.5)-5.2;             // the far east rim, where the pines stand
 const dWN=Math.hypot(a-127.5,b-61.5)-5.2;                // the west postern neck, guaranteed solid
 const dEN=Math.hypot(a-158.5,b-58.5)-5.2;                // the east postern neck, guaranteed solid
 let d=smin(smin(smin(dN,smin(dM,dSW,2.0),2.4),smin(dSE,dS,2.0),2.2),dE,2.6);
 d=smin(d,smin(dLOW,smin(dSET,dSWT,2.2),2.3),2.6);
 d=smin(d,dEW,2.0);d=smin(d,dEW2,2.2);d=smin(smin(d,dWN,2.4),dEN,2.4);
 const dc=Math.hypot(a-140.2,b-73.2);                     // the noise frays out at the balcony's lip
 return d+vn(a*.31+83,b*.31)*.95*clamp((dc-1.4)/3.4,0,1)};
// the rock itself: whatever the field admits, inside the canvas, welded to nothing
const LANDE=(a,b)=>{if(a<96||a>178||b<33.5||b>80.5)return 0;return kdist(a,b)<0};

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
 const inWalk=Math.abs(fi-136.5)<1.15&&fj>43.5&&fj<64.9;
 if(dc<rd||inWalk){
  const gxi=Math.floor(fi*1.35),gyi=Math.floor(fj*1.35),fx=(fi*1.35)%1,fy=(fj*1.35)%1;
  const grout=fx<.09||fy<.09;
  if(dc>=ring&&dc<rd)return[126,122,110];
  const t=(hh(gxi,gyi)>.62?1:0)+(fy<.5?1:0);
  const sc=[[166,160,144],[160,154,138],[170,164,148],[154,148,132]];
  const kk=lt*.94;
  if(grout)return[126,122,110];
  return[sc[t][0]*kk,sc[t][1]*kk,sc[t][2]*kk]}
 // the wall shadows: the curtain bands throw long shade across the ward and the town
 const wN=Math.abs(fj-46.3),wW=Math.abs(fi-126.6),wE=Math.abs(fi-155.0),wS=Math.abs(fj-64.8);
 if(wN<.6&&fi>124&&fi<157)k=mixc(k,[62,60,52],.55);
 if(wW<.6&&fj>45&&fj<58)k=mixc(k,[62,60,52],.5);
 if(wE<.6&&fj>45&&fj<58)k=mixc(k,[62,60,52],.5);
 if(wS<.6&&fi>124&&fi<156)k=mixc(k,[62,60,52],.5);
 // the dry garden gravel: one raked circle inside the wall, one bigger garden beyond the postern
 const dg=Math.hypot(fi-151.0,fj-49.5);
 if(dg<3.1){const rake=Math.sin(dg*2.15+vn(fi*1.4,fj*1.4)*.9)*.5+.5;k=mixc([182,173,143],[143,135,110],rake*.72);if(vn(fi*2.2+5,fj*2.2)>.84)k=mixc(k,[218,210,186],.45)}
 const tg=Math.hypot(fi-159.5,fj-52.0);
 if(tg<5.2){const rake=Math.sin(tg*2.05+vn(fi*1.4+9,fj*1.4)*.9)*.5+.5;k=mixc([176,167,136],[138,130,104],rake*.7);if(vn(fi*2.2+11,fj*2.2)>.82)k=mixc(k,[214,206,182],.45)}
 // the lower town plaza: pale cobbles under the stalls, worn between the lanes
 const pl=Math.hypot(fi-139.6,fj-68.6);
 if(pl<3.7){const gx=Math.floor(fi*1.5),gy=Math.floor(fj*1.5),fx=(fi*1.5)%1,fy=(fj*1.5)%1;
  const grout=fx<.12||fy<.12;const tv=hh(gx,gy);
  k=mixc(k,grout?[118,114,102]:[196+tv*22,190+tv*20,168+tv*14],.78)}
 // the balcony apron: the last slabs before the avenue ends at the drop
 const ba=Math.hypot(fi-140.2,fj-72.4);
 if(ba<2.6)k=mixc(k,[204,198,178],.55);
 // the training yard: packed sand under the targets
 const ty=Math.hypot(fi-121.8,fj-57.3);
 if(ty<3.6&&vn(fi*2.6+3,fj*2.6)>.28)k=mixc(k,[166,152,114],.5);
 // parade sand on the south apron, where the court gives way to the drop
 if(fj>56.5&&fj<61.8&&fi>128.5&&fi<145.5&&vn(fi*2.3+9,fj*2.3)>.3)k=mixc(k,[164,150,112],.4);
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
 const sp={c,ox:cx,oy:by,sh:[-17,2,34,9],sol:[-17,-2,34,15],gl:[[cx,by-46,16]],hgt:76};
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

// ---- a wall piece: a crenellated stone beam. axis +1 runs down-right, -1 runs down-left
function wallPiece(axis){const key=axis>0?'wallA':'wallB';if(SPR[key])return SPR[key];
 const L=118,H=24;
 const c=mk(axis>0?L+26:L+26,L/2+H+26);
 const x=c.getContext('2d');
 const e1=axis>0?[L,L/2]:[-L,L/2],th=axis>0?[12,-6]:[12,6];
 const ax=axis>0?13:13+L, by=H+8;
 const STN=[[64,62,54],[98,96,84],[142,138,122],[184,180,160],[216,212,194]];
 // the south face: ashlar courses, one belt course, waterline dark at the foot
 para(x,[ax,by],e1,[0,-H],(s,t)=>{
  const row=Math.floor(t*5),off=(row&1)?6:0,col=Math.floor(s*13+off),f=s*13+off-col,q=hh(col*3+axis*7,row+11);
  let v=.88+q*.24*(axis>0?1:1);if(t>.92)v*=.62;
  if(row===2)v=.68;                                    // the belt course
  if(f<.07||t*5-row<.09)v*=.6;
  return rgb([STN[2][0]*v,STN[2][1]*v,STN[2][2]*v])});
 // the top walk: a parapet of flat slabs with the merlons poking up
 para(x,[ax,by-H],e1,th,()=>rgb([116,112,100]));
 for(let s2=.02;s2<.99;s2+=.092){const px0=ax+e1[0]*s2,py0=by-H+e1[1]*s2;
  x.fillStyle=rgb(STN[3]);x.fillRect(Math.round(px0)-2,Math.round(py0+th[1]/2)-7,5,7);
  x.fillStyle=rgb(STN[4]);x.fillRect(Math.round(px0)-2,Math.round(py0+th[1]/2)-8,5,1)}
 // the end caps: a slightly taller drum at either end, so the run reads terminated
 for(const u of[0,1]){const px0=Math.round(ax+e1[0]*u),py0=Math.round(by+e1[1]*u-H);
  x.fillStyle=rgb(STN[1]);x.fillRect(px0-3,py0-6,7,H+6);
  x.fillStyle=rgb(STN[3]);x.fillRect(px0-3,py0-7,7,2)}
 const sp={c,ox:Math.round(ax+e1[0]/2),oy:Math.round(by+e1[1]/2),sh:axis>0?[-40,-2,80,10]:[-10,-20,20,44],hgt:H+8};
 SPR[key]=sp;return sp}

// ---- the gatehouse: a lintel with the star crest, hanging lantern and merlons; render only
function gateArch(){if(SPR.garch)return SPR.garch;
 const c=mk(66,42),x=c.getContext('2d'),cx=33,by=38;
 x.fillStyle=rgb([64,62,54]);x.fillRect(2,10,62,15);
 x.fillStyle=rgb([98,96,84]);x.fillRect(2,10,62,3);x.fillStyle=rgb([40,38,34]);x.fillRect(2,22,62,3);
 for(let u=3;u<60;u+=11){x.fillStyle=rgb([142,138,122]);x.fillRect(u,4,7,7);x.fillStyle=rgb([184,180,160]);x.fillRect(u,3,7,1)}
 x.fillStyle=rgb([216,212,194]);x.fillRect(0,11,3,12);x.fillRect(63,11,3,12);
 // the crest: a gold star in a dark escutcheon
 x.fillStyle=rgb([114,32,26]);x.fillRect(cx-7,8,14,9);
 x.fillStyle=rgb([228,182,72]);x.fillRect(cx-1,10,2,5);x.fillRect(cx-3,12,6,1);
 // the lantern hung in the middle, the way the king kept the road lit
 x.fillStyle='#3a2a1c';x.fillRect(cx,22,1,6);
 x.fillStyle=rgb([36,28,22]);x.fillRect(cx-3,27,7,5);x.fillStyle=rgb([255,226,152]);x.fillRect(cx-2,28,5,3);
 const sp={c,ox:cx,oy:by,sh:[-30,0,60,4],hgt:26,gl:[[cx,31,22]]};
 SPR.garch=sp;return sp}

// ---- the gate tower: a squat square bastion with a corbelled cap and one lit slit
function gateTower(){if(SPR.gtow)return SPR.gtow;
 const c=mk(42,64),x=c.getContext('2d'),cx=21,by=58;
 const STN=[[64,62,54],[98,96,84],[142,138,122],[184,180,160],[216,212,194]];
 // the body: ashlar courses on a square plan, seen flat-on
 x.fillStyle=rgb(STN[2]);x.fillRect(3,12,36,46);
 x.fillStyle=rgb(STN[3]);x.fillRect(3,12,36,4);x.fillStyle=rgb(STN[1]);x.fillRect(3,52,36,6);
 for(let v=22;v<52;v+=9){x.fillStyle=rgb(STN[1]);x.fillRect(3,v,36,1);
  const off=((v/9)|0)%2?5:0;for(let u=-4;u<36;u+=10)x.fillRect(3+u+off,v,1,9)}
 // the corbelled crown and merlons
 x.fillStyle=rgb(STN[3]);x.fillRect(0,6,42,7);x.fillStyle=rgb(STN[4]);x.fillRect(0,6,42,2);
 for(let u=0;u<42;u+=9){x.fillStyle=rgb(STN[2]);x.fillRect(u,0,6,6);x.fillStyle=rgb(STN[4]);x.fillRect(u,0,6,1)}
 // one slit, warm from inside
 x.fillStyle='#191512';x.fillRect(cx-3,30,6,10);x.fillStyle=rgb([255,220,150]);x.fillRect(cx-2,32,4,6);
 const sp={c,ox:cx,oy:by,sh:[-18,1,36,8],hgt:44,gl:[[cx,36,14]],sol:{c:[0,0,13]}};
 SPR.gtow=sp;return sp}

// ---- the corner bastion: stockier than the keep's towers, conical cap, one finial
function bastion(){if(SPR.bast)return SPR.bast;
 const c=mk(46,74),x=c.getContext('2d'),cx=23,by=68;
 const STN=[[64,62,54],[98,96,84],[142,138,122],[184,180,160],[216,212,194]];
 cyl(x,cx,by,17,8,30,[STN[1],STN[2],STN[0]],[210,208,194],(dx,v)=>{if(v%10==0)return STN[0];if(hh(dx>>1,v)>.92)return STN[0];return null});
 x.fillStyle='#191512';x.fillRect(cx-4,by-22,8,5);x.fillStyle=rgb([255,220,150]);x.fillRect(cx-3,by-21,6,3);
 cyl(x,cx,by-30,20,4,7,[STN[2],STN[3],STN[1]],[222,220,206],null);
 for(let v=0;v<=14;v++){const hw=Math.round(13*(1-v/15));
  for(let dx=-hw;dx<=hw;dx++){const sh=(dx<0?.7:dx>4?.84:1)*(1-.05*v);
   x.fillStyle=rgb([120,66,44].map(q=>Math.min(255,q*sh)));x.fillRect(cx+dx,by-41-v,1,1)}}
 x.fillStyle=rgb([228,182,72]);x.fillRect(cx-1,by-59,2,6);x.fillRect(cx-3,by-60,6,1);
 const sp={c,ox:cx,oy:by,sh:[-16,1,32,7],hgt:54,sol:{c:[0,0,14]}};
 SPR.bast=sp;return sp}

// ---- the barracks: a long hall on the b-axis, stone below, timber above, one cold door
function longHall(){if(SPR.lhall)return SPR.lhall;
 const c=mk(190,132),x=c.getContext('2d'),by=40,ax=162,L=96,H=16;
 const e1=[-L,L/2];
 const WALL=[[150,128,96],[178,156,120],[206,184,146],[228,208,168]];
 // the front face: whitewash over stone courses, timber posts, one door
 para(x,[ax,by],e1,[0,-H],(s,t)=>{
  const row=Math.floor(t*4);let v=.9+hh(Math.floor(s*15),row+3)*.18;
  if(t>.88)v*=.6;if(row===3)v*=.72;
  if(s>.40&&s<.56&&t>.34)return[40,32,24];              // the door mouth
  if(s>.36&&s<.60&&t>.30&&(Math.abs(s-.42)<.012||Math.abs(s-.54)<.012))v*=.55;
  const u=(s*7)%1;if(u<.05)v*=.62;                       // the timber posts
  return rgb([WALL[1][0]*v,WALL[1][1]*v,WALL[1][2]*v])});
 // the roof: one dark slope facing out over the walk, lit ridge beam, bargeboards
 para(x,[ax,by-H],e1,[26,-22],(s)=>{const v=.42+hh(Math.floor(s*20),7)*.22;return rgb([62*v,44*v,28*v])});
 ln(x,ax+26,by-H-22,ax+26+e1[0],by-H-22+e1[1],rgb([152,116,74]));
 ln(x,ax,by-H,ax+26,by-H-22,rgb([40,28,18]));ln(x,ax+e1[0],by-H+e1[1],ax+26+e1[0],by-H-22+e1[1],rgb([40,28,18]));
 // the gable-end boards at both ends of the ridge
 ln(x,ax+26,by-H-22,ax+30,by-H-26,rgb([216,170,110]));ln(x,ax+26+e1[0],by-H-22+e1[1],ax+30+e1[0],by-H-26+e1[1],rgb([216,170,110]));
 // slit windows, dim straw-coloured from lamps inside
 for(const u of[.16,.68,.88]){const px0=Math.round(ax+e1[0]*u),py0=Math.round(by+e1[1]*u-9);
  x.fillStyle='#191512';x.fillRect(px0-2,py0,5,4);x.fillStyle=rgb([255,220,150]);x.fillRect(px0-1,py0+1,3,2)}
 const sp={c,ox:Math.round(ax+e1[0]/2),oy:Math.round(by+e1[1]/2),sh:[-70,-2,55,13],hgt:30,sol:{c:[0,0,23]}};
 SPR.lhall=sp;return sp}

// ---- the library tower: a slim drum, a deep cone, one gilt star, and four slit windows
function libraryTower(){if(SPR.libt)return SPR.libt;
 const c=mk(44,96),x=c.getContext('2d'),cx=22,by=88;
 const STN=[[70,66,58],[110,104,88],[152,146,128],[196,190,168],[226,222,202]];
 cyl(x,cx,by,13,7,52,[STN[1],STN[2],STN[0]],[214,210,192],(dx,v)=>{if(v%13==0)return STN[0];return null});
 x.fillStyle='#191512';x.fillRect(cx-4,by-16,8,13);x.fillStyle=rgb([214,190,140]);x.fillRect(cx-3,by-14,6,9);  // the book slot
 for(const wy of[-34,-26]){x.fillStyle='#191512';x.fillRect(cx-2,by+wy,4,5);x.fillStyle=rgb([255,220,150]);x.fillRect(cx-1,by+wy+1,2,3)}
 cyl(x,cx,by-52,15,4,7,[STN[2],STN[3],STN[1]],[222,220,206],null);
 for(let v=0;v<=26;v++){const hw=Math.round(14*(1-v/27));
  for(let dx=-hw;dx<=hw;dx++){const sh=(dx<0?.62:dx>4?.8:1)*(1-.055*v);
   x.fillStyle=rgb([44,72,96].map(q=>Math.min(255,q*sh)));x.fillRect(cx+dx,by-59-v,1,1)}}
 x.fillStyle=rgb([228,182,72]);x.fillRect(cx-1,by-90,2,7);x.fillRect(cx-4,by-92,8,2);x.fillRect(cx-2,by-94,4,2);
 const sp={c,ox:cx,oy:by,sh:[-14,1,28,8],hgt:80,sol:{c:[0,0,12]}};
 SPR.libt=sp;return sp}

// ---- the smithy: a low stone box, one black maw, and the glow of the one job not finished
function smithyHut(){if(SPR.smh)return SPR.smh;
 const c=mk(84,58),x=c.getContext('2d'),by=52,ax=6,W=66,H=22;
 const STN=[[70,66,58],[110,104,88],[152,146,128],[196,190,168]];
 // the body: wide, low, one arch of darkness in the middle
 x.fillStyle=rgb(STN[2]);x.fillRect(ax,14,W,38);
 x.fillStyle=rgb(STN[3]);x.fillRect(ax,14,W,3);x.fillStyle=rgb(STN[1]);x.fillRect(ax,47,W,5);
 for(let v=24;v<48;v+=8){x.fillStyle=rgb(STN[1]);x.fillRect(ax,v,W,1);
  const off=((v/8)|0)%2?5:0;for(let u=-4;u<W;u+=9)x.fillRect(ax+u+off,v,1,8)}
 // the maw: a black arch with the coal glow sitting inside it
 x.fillStyle='#0d0a08';x.fillRect(ax+W/2-12,22,24,28);
 x.fillStyle='#1c130c';x.fillRect(ax+W/2-10,24,20,26);
 x.fillStyle=rgb([255,150,60]);x.fillRect(ax+W/2-6,40,12,6);x.fillStyle=rgb([255,214,120]);x.fillRect(ax+W/2-4,42,8,3);
 // the anvil silhouette on the threshold
 x.fillStyle='#0d0a08';x.fillRect(ax+W/2-7,44,14,3);x.fillRect(ax+W/2-2,41,4,3);
 // the chimney and three dots of smoke that never quite leave
 x.fillStyle=rgb(STN[1]);x.fillRect(ax+W-16,0,9,16);x.fillStyle=rgb(STN[3]);x.fillRect(ax+W-17,0,11,2);
 x.fillStyle='#33241a';x.fillRect(ax+W-14,-4,3,3);x.fillRect(ax+W-10,-9,2,2);
 const sp={c,ox:ax+W/2,oy:by,sh:[-30,-1,60,8],hgt:36,sol:{c:[0,0,20]}};
 SPR.smh=sp;return sp}

// ---- the hedge: a clipped cube of dark green, the garden keep's own topiary
function hedge(){if(SPR.hedg)return SPR.hedg;
 const c=mk(40,30),x=c.getContext('2d'),cx=20,by=27;
 const G=[[38,74,44],[56,102,60],[84,136,86],[116,162,116]];
 cyl(x,cx,by,15,5,16,[G[1],G[2],G[0]],[140,178,126],(dx,v)=>{if(v%6==0)return G[0];if(hh(dx>>1,v)>.88)return G[0];return null});
 x.fillStyle=rgb([26,52,32]);x.fillRect(cx-15,by-2,30,3);
 x.fillStyle=rgb(G[3]);x.fillRect(cx-11,by-17,22,2);
 const sp={c,ox:cx,oy:by,sh:[-13,0,26,5],hgt:20,sol:{c:[0,0,13]}};
 SPR.hedg=sp;return sp}

// ---- the flowerbed: one elliptical bed of turned earth and five bright heads
function flowerbed(){if(SPR.flbd)return SPR.flbd;
 const c=mk(34,18),x=c.getContext('2d'),cx=17,cy=12;
 x.fillStyle=rgb([58,42,28]);x.beginPath();x.ellipse(cx,cy,15,6,0,0,6.283);x.fill();
 x.fillStyle=rgb([102,76,48]);x.beginPath();x.ellipse(cx,cy-1,13,4.5,0,0,6.283);x.fill();
 const F=[[214,84,74],[240,196,84],[178,110,196],[238,238,226],[240,140,60]];
 for(let i=0;i<5;i++){const dx=[-10,-5,0,5,10][i],dy=[-2,1,-3,1,-2][i];
  x.fillStyle=rgb([52,84,52]);x.fillRect(cx+dx,cy+dy-2,1,3);
  x.fillStyle=rgb(F[i]);x.fillRect(cx+dx-2,cy+dy-6,5,4);x.fillStyle=rgb([255,240,190]);x.fillRect(cx+dx,cy+dy-5,1,1)}
 const sp={c,ox:cx,oy:cy+5,sh:[-12,0,24,4],hgt:10};
 SPR.flbd=sp;return sp}

// ---- the target: a straw boss with two rings, standing on the yard wall
function target(){if(SPR.tgt2)return SPR.tgt2;
 const c=mk(26,34),x=c.getContext('2d'),cx=13,by=31;
 x.fillStyle=rgb([72,52,32]);x.fillRect(cx-2,by-14,4,14);
 x.fillStyle=rgb([98,74,46]);x.fillRect(cx-8,by-1,16,2);
 x.fillStyle=rgb([176,140,84]);x.beginPath();x.arc(cx,by-18,9,0,6.283);x.fill();
 x.fillStyle=rgb([214,80,56]);x.beginPath();x.arc(cx,by-18,6.4,0,6.283);x.fill();
 x.fillStyle=rgb([238,232,214]);x.beginPath();x.arc(cx,by-18,3.6,0,6.283);x.fill();
 x.fillStyle=rgb([190,60,44]);x.beginPath();x.arc(cx,by-18,1.4,0,6.283);x.fill();
 const sp={c,ox:cx,oy:by,sh:[-7,0,14,3],hgt:22,sol:{c:[0,0,7]}};
 SPR.tgt2=sp;return sp}

// ---- the rack: two uprights and a crossed brace, the yard's armoury outdoors
function rack(){if(SPR.rack)return SPR.rack;
 const c=mk(40,32),x=c.getContext('2d'),by=29;
 x.fillStyle=rgb([82,60,36]);
 x.fillRect(4,6,4,23);x.fillRect(32,6,4,23);
 x.fillRect(2,4,8,3);x.fillRect(30,4,8,3);
 ln(x,6,26,34,8,rgb([104,78,46]));ln(x,34,26,6,8,rgb([104,78,46]));
 x.fillStyle=rgb([150,150,142]);
 x.fillRect(11,10,2,16);x.fillRect(19,12,2,14);x.fillRect(26,10,2,16);
 x.fillStyle=rgb([110,110,104]);
 x.fillRect(10,9,4,2);x.fillRect(18,11,4,2);x.fillRect(25,9,4,2);
 const sp={c,ox:20,oy:by,sh:[-14,0,28,4],hgt:20,sol:{c:[0,0,13]}};
 SPR.rack=sp;return sp}

// ---- the dummy: the yard's teacher, a crossed-post strawman with a pale head
function dummy(){if(SPR.dm)return SPR.dm;
 const c=mk(30,38),x=c.getContext('2d'),cx=15,by=35;
 x.fillStyle=rgb([84,60,36]);x.fillRect(cx-2,by-26,4,26);
 x.fillStyle=rgb([104,78,46]);x.fillRect(cx-12,by-18,24,3);
 x.fillStyle=rgb([72,52,32]);x.fillRect(cx-9,by,18,2);
 x.fillStyle=rgb([176,150,96]);x.beginPath();x.ellipse(cx,by-28,7,6.4,0,0,6.283);x.fill();
 x.fillStyle=rgb([146,120,70]);x.fillRect(cx-7,by-27,14,2);
 x.fillStyle=rgb([52,44,32]);x.fillRect(cx-3,by-30,1,1);x.fillRect(cx+2,by-30,1,1);
 const sp={c,ox:cx,oy:by,sh:[-9,0,18,4],hgt:26,sol:{c:[0,0,9]}};
 SPR.dm=sp;return sp}

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
 // ---- THE WALL RING: the keep ward, enclosed. The flanks end in open posterns, the way
 // in and out for everything that is not a king. Two arches hold the whole thing up.
 put(130.15,46.3,wallPiece(1),1);
 put(142.85,46.3,wallPiece(1),1);
 put(150.6,46.3,wallPiece(1),1);
 put(126.6,49.7,wallPiece(-1),1);
 put(126.6,55.0,wallPiece(-1),1);
 put(155.0,49.7,wallPiece(-1),1);
 put(155.0,55.0,wallPiece(-1),1);
 put(129.9,64.8,wallPiece(1),1);
 put(143.35,64.8,wallPiece(1),1);
 put(150.8,64.8,wallPiece(1),1);
 const wallLine=(a0,b0,a1,b1,r)=>{const n=Math.ceil(Math.hypot(a1-a0,b1-b0)*16/(r*1.4));
  for(let k=0;k<=n;k++){const t=k/n;addSolid(a0+(a1-a0)*t,b0+(b1-b0)*t,{c:[0,0,r]},{sol:1})}};
 wallLine(126.6,46.3,133.6,46.3,7);wallLine(139.4,46.3,155.0,46.3,7);
 wallLine(126.6,46.3,126.6,57.2,7);wallLine(155.0,46.3,155.0,57.2,7);
 wallLine(126.6,64.8,133.6,64.8,7);wallLine(139.4,64.8,155.0,64.8,7);
 // the corner bastions, the postern caps, and the north gatehouse on the bridge walk
 put(126.6,45.7,bastion(),3,.05);put(155.0,45.7,bastion(),3,.05);
 put(126.6,57.4,bastion(),3,.05);put(155.0,57.4,bastion(),3,.05);
 put(126.6,64.8,bastion(),3,.05);put(155.0,64.8,bastion(),3,.05);
 put(133.0,46.3,gateTower(),3,.05);put(140.0,46.3,gateTower(),3,.05);
 put(136.5,46.3,gateArch(),0,.05);
 // the south gate: the town side, open to the lower town and the avenue
 put(133.0,64.8,gateTower(),3,.05);put(140.0,64.8,gateTower(),3,.05);
 put(136.5,64.8,gateArch(),0,.05);
 // the postern lamps, the honest gaps at the flanks
 put(126.4,60.3,lamp(),0,.05);put(155.2,60.3,lamp(),0,.05);
 // ---- THE WARD: the barracks west, the library tower north-east, the smithy south-west
 put(129.9,51.0,longHall(),3,.05);
 put(143.3,49.7,libraryTower(),3,.05);
 put(130.3,58.7,smithyHut(),3,.05);
 put(145.4,54.8,stall([196,72,52],[240,232,214]),1);
 // lamps inside the gate, a banner at either arm of the walk
 put(134.2,51.3,lamp(),0,.05);
 put(139.3,51.4,lamp(),0,.05);
 put(133.6,48.15,lamp(),0,.05);
 put(139.6,48.15,lamp(),0,.05);
 put(132.9,52.2,bannerPole(),0,.05);
 put(139.9,52.3,bannerPole(),0,.05);
 // ---- THE KEEP SHRINE: the yard keeps one, facing the drop
 put(122.6,63.3,shrine(),3,.05);
 // ---- THE WEST BAILEY: the yard, the targets, the rack, and the one who never misses
 put(121.3,55.4,target(),1);
 put(124.8,52.9,target(),1);
 put(119.6,59.6,rack(),1);
 put(124.3,60.9,dummy(),1);
 put(152.2,49.6,RS(2,2,ST,29),0);        // the court stone, inside the walls
 // ---- THE GARDEN TERRACE: beyond the east postern, raked gravel and the pagoda over the drop
 put(156.8,55.0,torii(),1);
 put(163.6,54.6,pagoda(),3,.05);
 put(159.2,58.6,teahouse(),3,.05);
 put(157.5,52.6,stoneLantern(),3);
 put(166.0,57.6,stoneLantern(),3);
 put(153.9,52.3,hedge(),0);
 put(161.6,51.3,hedge(),0);
 put(163.0,51.4,flowerbed(),0);
 put(152.6,56.6,flowerbed(),0);
 put(158.4,49.4,RS(3,3,ST,5),0);        // the garden's great stone
 put(155.0,48.9,cairn(),0);put(166.8,51.5,cairn(),0);
 // ---- THE LOWER TOWN: the plaza, three stalls, the market house, two cottages
 put(136.2,66.4,signpost(),0);
 put(135.6,68.6,stall([196,72,52],[240,232,214]),1);
 put(143.2,66.8,stall([58,92,140],[232,228,214]),1);
 put(141.8,71.5,stall([58,120,72],[244,238,206]),1);
 put(149.3,67.6,cottage([[58,74,104],[84,106,146],[126,152,190]]),3,.05);   // the market house
 put(146.4,69.4,cart(),1);
 put(132.9,70.6,crates(),0);
 put(137.9,72.0,lamp(),0,.05);
 put(142.6,65.7,lamp(),0,.05);
 put(130.4,68.8,cottage(),3,.05);                                          // the west cottage
 put(151.2,70.0,cottage([[60,82,52],[86,112,70],[124,152,104]]),3,.05);     // the east cottage
 // ---- THE BALCONY: the avenue ends here, at the drop, with one chair
 put(133.3,73.1,brazier(),2,.05);
 put(143.5,72.3,brazier(),2,.05);
 put(129.0,73.2,stoneLantern(),3);
 put(145.4,71.4,stoneLantern(),3);
 put(140.2,73.2,kingChair(),2,.05);
 // ---- the wild: broken slabs and dry pines, the way a keep that old settles
 for(let i=115;i<170;i++)for(let j=42;j<79;j++){
  const fi=i+hh(i*7,j*5)-.5,fj=j+hh(j*11,i*3)-.5;
  if(!LANDE(fi,fj)||WD(fi,fj)>-.6)continue;
  if(fi>124.5&&fi<135.5&&fj>46.0&&fj<55.0)continue;   // the barracks and the gate walk
  if(fi>140.5&&fi<146.5&&fj>46.0&&fj<54.0)continue;   // the library tower
  if(fi>150.0&&fi<165.0&&fj>44.0&&fj<60.5)continue;   // the garden terrace
  if(fi>117.0&&fi<127.0&&fj>51.0&&fj<63.0)continue;   // the west bailey yard
  if(fi>130.0&&fi<149.0&&fj>65.0&&fj<74.0)continue;   // the market square and the avenue
  if(fi>128.0&&fi<162.0&&fj>70.5&&fj<77.0)continue;   // the balcony
  if(Math.abs(fj-46.3)<.9||Math.abs(fi-126.6)<.9||Math.abs(fi-155.0)<.9)continue;   // the wall bands
  if(Math.abs(fj-64.8)<.9&&fi>124&&fi<156)continue;   // the south wall
  const q=hh(i*5,j*7);
  if(q>.90)put(fi,fj,bush('g',seed1(i,j),false),0);
  else if(q>.84)put(fi,fj,RS(2,2,RK,seed1(i,j)),0)}
 put(122.0,50.2,pine('g',9,2),1);
 put(151.5,53.0,pine('g',7,1),1);
 put(151.8,56.3,RS(3,3,RK,2),0);
 put(121.6,58.7,RS(4,4,RK,1),0);
 put(151.3,51.0,pine('g',7,3),1);
 put(123.5,55.3,pine('g',8,2),1);
 put(120.6,48.4,RS(3,2,ST,9),0);put(152.0,47.6,RS(2,2,ST,11),0);put(123.4,61.8,RS(2,2,RK,13),0);
 put(151.6,59.2,RS(3,2,ST,17),0);put(127.2,44.6,pine('g',7,1),1);put(144.2,60.9,pine('g',8,4),1);
 put(127.8,69.8,RS(2,2,RK,21),0);put(154.0,70.5,RS(2,2,ST,23),0);
 put(163.5,51.0,pine('g',6,5),1);put(167.0,55.0,pine('g',7,6),1);
 // a pair of coals burning at the bridge mouth, where the path arrives
 put(133.0,45.1,brazier(),2,.05);
 put(140.2,45.1,brazier(),2,.05);
 // the towers, then the keep
 put(126.8,57.4,keepTower(),3,.05);
 put(144.2,57.6,keepTower(),3,.05);
 put(136.5,53.3,keep(),3,.05);
 // the fire in the courtyard
 put(131.6,59.2,brazier(),2,.05);
 put(141.4,59.3,brazier(),2,.05);
 // a bench set to face the keep from across the court
 put(131.8,58.5,bench(0,0),0);
 // the court stone was placed with the garden terrace above; the last word:
 objs.sort((a,b)=>a.d-b.d);
}
