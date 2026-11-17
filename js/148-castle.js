/* ================= THE STAR KINGDOM =================
   The fifth rock, and the last one. It used to be a keep on a slab; the pond asked it to stay
   open, and a place that stays open for long enough grows a kingdom. Now: a bridge gate, a walled
   ward with the old keep at its heart, an inner gate, a town round a star fountain, an orchard
   terrace with a mill, a hedge maze, a meadow of finished lights, sky docks with two airships,
   and out on the last spit of rock, one empty chair facing the drop.

   Everything is drawn from the same functions as the other rocks, so it keeps the same light.
   Hooks the host already calls: LANDE, groundE, keep, keepTower, bannerPole, brazier, kingChair,
   seed1, buildCastle (and window.RB4 for the rope bridge).
   ------------------------------------------------------------------ */

// ---- the rock: five lobes melted together, with a noisy rim that stays straight where the bridge lands
const KBOX={a0:108,a1:174,b0:40,b1:108};
const sdC=(a,b,cx,cy,r)=>Math.hypot(a-cx,b-cy)-r;
const smin=(x,y,k)=>{const h=clamp(.5+.5*(y-x)/k,0,1);return lerp(y,x,h)-k*h*(1-h)};
function kdist(a,b){
 let d=sdRR(a,b,136.2,57,16,9);                    // the upper ward, under the old keep
 d=smin(d,sdRR(a,b,136.5,81,20,11),6);             // the lower town
 d=smin(d,sdC(a,b,160.5,80,8.5),3.5);              // the orchard terrace and its mill
 d=smin(d,sdRR(a,b,117.5,91,7.5,4),3);             // the sky docks
 d=smin(d,sdC(a,b,138.5,100.5,5.2),3);             // the spit, and the chair
 d=smin(d,sdC(a,b,118.5,63,6.5),3);                // the meadow of finished lights
 return d}
const LANDE=(a,b)=>{if(a<KBOX.a0||a>KBOX.a1||b<KBOX.b0||b>KBOX.b1)return 0;
 const k=b<46?dmp(a,136.5):1;return kdist(a,b)+vn(a*.27+83,b*.27)*1.9*k+vn(a*.9,b*.9)*.35*k<0};

// ---- where the streets run: [polyline, half-width in tiles]
const KR=[
 [[[136.5,58.8],[136.5,67.2]],1.15],                 // the court to the star gate
 [[[136.5,67.2],[136.5,99.8]],1.75],                 // the grand avenue
 [[[136.5,99.8],[138.5,103.0]],.95],                 // the walk to the chair
 [[[117.0,78.0],[157.0,78.0]],1.25],                 // market row
 [[[148.5,78.0],[157.5,83.2],[162.5,77.4]],.95],     // orchard lane
 [[[136.5,91.0],[124.0,91.0],[114.0,91.8]],1.15],    // the docks road
 [[[122.0,78.0],[120.6,70.0],[119.8,63.0]],.85],     // up to the meadow
 [[[148.7,75.7],[148.7,78.0]],.85]];                 // into the maze
const roadD=(a,b)=>{let m=9;for(const[p,w]of KR)for(let k=0;k<p.length-1;k++){const d=SEG(a,b,p[k][0],p[k][1],p[k+1][0],p[k+1][1])/w;if(d<m)m=d}return m};
const WARD={a0:124.5,a1:148.5,b0:44.6,b1:66.0};          // the curtain wall of the upper ward
const inWard=(a,b)=>a>WARD.a0&&a<WARD.a1&&b>WARD.b0&&b<WARD.b1;
const SQUARE=[136.5,78.0,5.7];
const MAZE={a0:145.2,b0:68.7,n:7};                        // seven by seven cells of one tile
const inMaze=(a,b)=>a>MAZE.a0-.4&&a<MAZE.a0+MAZE.n+.4&&b>MAZE.b0-.4&&b<MAZE.b0+MAZE.n+.4;
const ORCH={a:161.0,b:79.6,r:7.4};
const inOrch=(a,b)=>Math.hypot(a-ORCH.a,b-ORCH.b)<ORCH.r;
const inDocks=(a,b)=>a<123&&b>83&&b<99;
const inMeadow=(a,b)=>Math.hypot(a-118.5,b-63)<6.2;

// ---- the ground: lawn and laid stone, a paved ring for the court, a straight approach walk to the door,
// the star inlaid in the square, fine cobble in the streets, soil rows in the orchard, moss in the joints
function groundE(fi,fj,x,y,n,dirt){
 const lt=relief(fi,fj);
 const GG=GP.g;const cw2=1.12,ci2=Math.floor(fi/cw2),cj2=Math.floor(fj/cw2),fx2=(fi/cw2)%1,fy2=(fj/cw2)%1,cq2=hh(ci2*11+5,cj2*7+3)*.66+vn(fi*.9,fj*.9)*.34;
 const gi=clamp(Math.floor(cq2*4.8+.1),0,4);const cell2=(fx2<.085||fy2<.085)?.62:(fx2>.915||fy2>.915)?1.09:.9+cq2*.28;
 const PL=PP({m:['#6e685c','#87816f','#a49d86','#bcb49c','#d0c8ae']}).m;
 const e=EDE(fi,fj);
 const dc=Math.hypot(fi-136.5,fj-55.4),rd=3.7+(vn(fi*2,fj*2)-.5)*.35,ring=rd-.45;
 const inWalk=Math.abs(fi-136.0)<1.02&&fj>44.2&&fj<53.3;
 // the old court: big flat slabs under the keep, and the straight walk from the bridge door
 if(dc<rd||inWalk){
  const gxi=Math.floor(fi*1.35),gyi=Math.floor(fj*1.35),fx=(fi*1.35)%1,fy=(fj*1.35)%1;
  if(dc>=ring&&dc<rd)return[126,122,110];
  const t=(hh(gxi,gyi)>.62?1:0)+(fy<.5?1:0);
  const sc=[[166,160,144],[160,154,138],[170,164,148],[154,148,132]];
  const kk=lt*.94;
  if(fx<.09||fy<.09)return[126,122,110];
  return[sc[t][0]*kk,sc[t][1]*kk,sc[t][2]*kk]}
 // the town square: a star of pale slabs in a ring of dark, laid round the fountain
 const sq=Math.hypot(fi-SQUARE[0],fj-SQUARE[1]);
 if(sq<SQUARE[2]){
  const an=Math.atan2(fj-SQUARE[1],fi-SQUARE[0]),pts=8,sr=(Math.cos(an*pts/2)*.5+.5)*3.4+1.2;
  const gx=Math.floor(fi*1.5),gy=Math.floor(fj*1.5),jt=(fi*1.5)%1<.08||(fj*1.5)%1<.08;
  if(sq>SQUARE[2]-.55)return[118*lt,114*lt,104*lt];
  if(sq>SQUARE[2]-1.05)return[94*lt,102*lt,128*lt];
  if(sq<sr&&sq>1.55)return jt?[150*lt,140*lt,112*lt]:[(226+hh(gx,gy)*16)*lt,(206+hh(gx,gy)*14)*lt,(150+hh(gx+1,gy)*12)*lt];
  if(jt)return[120*lt,116*lt,106*lt];
  const v=.86+hh(gx,gy)*.26;return[178*v*lt,172*v*lt,158*v*lt]}
 // the streets: fine setts with a pale kerb and a dust lane
 const rdd=roadD(fi,fj);
 if(rdd<1){
  const g=2.3,gx=fi*g,gy=fj*g,ix=Math.floor(gx),iy=Math.floor(gy),off=(iy&1)?.5:0,u=((gx-off)%1+1)%1,fy=gy-iy;
  if(rdd>.82)return[(158+hh(ix,iy)*26)*lt,(152+hh(ix,iy)*24)*lt,(138+hh(ix,iy)*22)*lt];     // kerb
  if(u<.1||fy<.1)return[92*lt,88*lt,80*lt];
  const h=hh(ix*3+(iy&1)*7,iy*5+11);let v=.72+h*.5;
  let k=[(142)*v,(136)*v,(124)*v];if((ix+iy)&1)k=[k[0]*.92,k[1]*.92,k[2]*.93];
  if(rdd<.14)k=mixc(k,[112,108,98],.5);
  return[k[0]*lt,k[1]*lt,k[2]*lt]}
 // the rim: bare stone, weathered, with moss in the cracks
 if(e<1.1){
  let k=PL[clamp(Math.floor(n*3.6+(vn(fi*.6,fj*.6)-.5)*1.7),0,4)];k=[k[0]*lt,k[1]*lt,k[2]*lt];
  if(e<.55)k=mixc(k,[88,88,76],.42);
  if(vn(fi*.5,fj*.5)>.58)k=mixc(k,[110,124,88],.45);
  return k}
 // the meadow of finished lights: long pale grass, and flowers that are only there at night
 if(inMeadow(fi,fj)){
  let k=GG[clamp(gi+(vn(fi*.8,fj*.8)>.5?0:-1),0,4)];k=[k[0]*lt*.96,k[1]*lt*.98,k[2]*lt*1.04];
  if(hh(x,y)>.968)k=hh(x*3,y)>.5?[236,244,255]:[186,214,255];
  return k}
 // the maze: dark lawn, a tight mown path between the hedge lines
 if(inMaze(fi,fj)){
  let k=GG[clamp(gi-1,0,4)];k=[k[0]*lt*.86,k[1]*lt*.9,k[2]*lt*.86];
  if(hh(x,y)>.985)k=[238,226,120];return k}
 // the orchard: soil rows under the trees, long grass between
 if(inOrch(fi,fj)){
  const row=Math.abs((fi*.62)%1);
  if(row<.12)return[(104+hh(x,y)*16)*lt,(78+hh(x,y)*12)*lt,(48+hh(x,y)*8)*lt];
  let k=GG[clamp(gi+1,0,4)];k=[k[0]*lt,k[1]*lt,k[2]*lt];
  if(hh(x,y)>.972)k=[255,246,228];else if(hh(x,y)<.012)k=[238,120,150];
  return k}
 // the sky docks: boarded yard, rope coils and tar stains
 if(inDocks(fi,fj)){
  const pl=Math.floor(fj*2.4),q=hh(pl,Math.floor(fi*.7));
  let k=[(132+q*34)*lt,(98+q*26)*lt,(62+q*18)*lt];if((fj*2.4)%1<.1)k=[70*lt,50*lt,34*lt];
  if(vn(fi*1.1,fj*1.1)>.74)k=mixc(k,[46,40,34],.4);return k}
 // the lawns: clipped grass, flower beds in the town, wild verge in the ward
 let k=GG[gi];k=[k[0]*lt*cell2,k[1]*lt*cell2,k[2]*lt*cell2];
 const bed=vn(fi*.45+11,fj*.45+3);
 if(bed>.7&&hh(x,y)>.93){const pal=[[236,84,92],[255,208,74],[246,246,236],[170,128,255],[255,150,60]];k=pal[Math.floor(hh(x*2,y*3)*5)]}
 else if(hh(x,y)>.985&&vn(fi*1.7,fj*1.7)>.55)k=mixc(k,[234,228,206],.7);
 if(e<2.6)k=mixc(k,[96,110,80],(2.6-e)/2.6*.3);
 return k}

// ================= the stone and the timber =================
const KST=[[72,70,62],[106,104,90],[144,140,126],[178,176,158],[212,210,194]];
const WOOD=[[92,60,38],[124,84,52],[156,110,68],[188,140,88]];
// ashlar courses with offset joints, and a few darker blocks
const ash=(w,h,k,sd)=>(s,t)=>{const rows=h/4.4,r=Math.floor(t*rows),off=(r&1)*.5,u=s*w/6.4+off,cc=Math.floor(u),f=u-cc,q=hh(cc+sd,r+3);
 let m=k*(.88+q*.24);if((t*rows)%1<.16||f<.07)m*=.66;if(q>.9)m*=.86;return[150*m,146*m,132*m]};
const KTILE={blue:{m:[58,68,92],l:[84,96,124],d:[36,42,60],h:[142,154,178],f:[22,26,38]},
 red:{m:[150,62,44],l:[190,88,60],d:[104,38,30],h:[226,140,100],f:[70,26,20]},
 moss:{m:[70,98,76],l:[98,130,100],d:[44,68,52],h:[150,184,150],f:[28,44,34]},
 ochre:{m:[176,128,62],l:[212,164,84],d:[126,88,40],h:[244,206,130],f:[84,58,28]}};
const KBAN=(x,y,w,h,g)=>{g.fillStyle=rgb([114,32,26]);g.fillRect(x,y,w,h);g.fillStyle=rgb([146,44,32]);g.fillRect(x,y,2,h);
 g.fillStyle=rgb([114,32,26]);for(let v=0;v<w>>1;v++)g.fillRect(x+v*2,y+h,w-v*4,1);
 g.fillStyle=rgb([228,182,72]);g.fillRect(x+(w>>1)-1,y+3,2,2);g.fillRect(x+(w>>1)-2,y+4,4,1);g.fillRect(x+(w>>1)-1,y+5,2,2)};

// ---- one two-tile length of curtain wall, with a walkway and merlons. axis 0 runs along i, 1 along j
// ---- one two-tile length of dobei: white plaster, a sama loophole, and a curved dark tile cap with lifted ends. axis 0 runs along i, 1 along j
function wallSeg(axis){const key='kw'+axis;if(SPR[key])return SPR[key];
 const c=mk(52,66),g=c.getContext('2d'),o=[26,52],L=16,Tn=4,H=26;
 const slit=(f)=>(s,t)=>{const u=(s*32)%16;if(Math.abs(u-8)<1.1&&t>.33&&t<.56)return[16,16,20];return f(s,t)};
 const i0=axis?-Tn:-L,i1=axis?Tn:L,j0=axis?-L:-Tn,j1=axis?L:Tn;
 const pl=(s,t)=>{const v=(1-t)*H,q=hh((s*40)>>1,v>>1);let m=.94+q*.09;if(t>.9)m*=.6;return[246*m,246*m,240*m]};
 const pls=(s,t)=>{const v=(1-t)*H,q=hh((s*10)>>1,v>>1);let m=.7*(.94+q*.09);if(t>.9)m*=.6;return[246*m,246*m,240*m]};
 const fl=slit(pl),fr=slit(pls);
 ibox(g,o,i0,i1,j0,j1,0,H,[196,192,174],[150,146,132],[108,104,94],null,axis?pls:fl,axis?fl:pls);
 // the tiled cap: dark curved rows, a pale ridge line, and the ends kicked up
 const cap=(iA,iB,jA,jB)=>ibox(g,o,iA,iB,jA,jB,H,H+6,[30,34,50],[54,62,88],[18,20,32],null,(s,t)=>{const u=s*36,k=(((u>>2)%5)+5)%5<1?.62:1;const q=hh(u>>1,2);return[(52+q*12)*k,(60+q*12)*k,(88+q*14)*k]},(s,t)=>{const u=s*9,k=(((u>>1)%5)+5)%5<1?.6:.78;return[44*k,50*k,72*k]});
 cap(i0-1,i1+1,j0-1,j1+1);
 const capTip=(ii,jj)=>{const[X,Y]=IP(o,ii,jj,H+6);g.fillStyle=rgb([150,160,190]);g.fillRect(Math.round(X)-1,Math.round(Y)-4,3,4);g.fillStyle=rgb([178,188,212]);g.fillRect(Math.round(X)-1,Math.round(Y)-4,3,1)};
 if(axis){capTip(0,-L-1);capTip(0,L+1)}else{capTip(-L-1,0);capTip(L+1,0)}
 return SPR[key]={c,ox:o[0],oy:o[1],sh:[0,2,24,5],sol:[-20,-6,40,12],hgt:33}}

// ---- a round tower: dark ishigaki drum, white plaster band under the eaves, dark tiled cone, shachihoko on the finial
function roundTower(kind){const key='krt'+kind;if(SPR[key])return SPR[key];
 const tall=kind==2,R=tall?10:14,Hh=tall?58:40,c=mk(54,tall?136:118),x=c.getContext('2d'),cx=27,by=tall?126:108;
 // the drum: dark bulging boulders in mortar, not cut stone
 cyl(x,cx,by,R,5,Hh,[[58,56,50],[78,76,68],[96,94,84]],[186,182,170],(dx,v)=>{if(v%8==0)return[38,36,32];if(hh(dx>>1,v)>.9)return[38,36,32];
  if((v==Hh-14||v==Hh-30)&&Math.abs(dx)<1)return[26,22,20];return null});
 // the white plaster band the eaves rest on
 cyl(x,cx,by-Hh,R+2,4,9,[[214,214,208],[246,246,240],[238,238,232]],[255,255,248],null);
 x.fillStyle='#191512';x.fillRect(cx-1,by-Hh+3,2,5);x.fillStyle='#ffdca0';x.fillRect(cx,by-Hh+5,1,2);
 // the tiled cone: concave profile, vertical seams, upturned rim
 const hgt=tall?27:20,rr=R+4;
 for(let v=0;v<=hgt;v++){const q=Math.pow(1-v/(hgt+1),.8),hw=Math.max(1,Math.round(rr*q));
  for(let dx=-hw;dx<=hw;dx++){const sh=(dx<0?.7:dx>3?.88:1.05)*(1-.05*v),seam=(((dx+v*2)%6)+6)%6<1;
   const base=seam?[22,25,38]:[44,52,74];x.fillStyle=rgb(base.map(q2=>Math.min(255,Math.round(q2*sh))));x.fillRect(cx+dx,by-Hh-9-v,1,1)}}
 for(const sd of[-1,1])for(let k=0;k<4;k++){x.fillStyle=rgb(k<2?[178,188,212]:[70,80,110]);x.fillRect(cx+sd*(rr+1+k),by-Hh-9-k,2,1)}
 // the finial: two gold horns facing each other, and a flag for the watch on kind 0
 x.fillStyle=rgb([228,182,72]);x.fillRect(cx-1,by-Hh-9-hgt-7,2,8);x.fillRect(cx-3,by-Hh-9-hgt-9,6,2);x.fillRect(cx-2,by-Hh-9-hgt-11,4,2);
 if(kind==0){x.fillStyle=rgb([40,36,32]);x.fillRect(cx,by-Hh-9-hgt-26,1,16);KBAN(cx+1,by-Hh-9-hgt-24,9,7,x)}
 return SPR[key]={c,ox:cx,oy:by,sh:[0,2,R+4,7],sol:[-R-2,2,2*R+4,10],gl:[[cx,by-Hh+16,14]],hgt:Hh+30}}

// ---- the gatehouse: a long wall with a round arch, a portcullis, banners, and a square tower at each end
function gateHouse(pal){const key='kgh'+pal;if(SPR[key])return SPR[key];
 const c=mk(124,118),g=c.getContext('2d'),o=[62,92],H=32,TH=52,W=6;
 const P=KTILE[pal];
 const arch=(s,t)=>{const u=s*60-30,v=(1-t)*H;
  if(v<4&&Math.abs(u)<14)return[40,36,32];
  const ar=Math.abs(u)<14&&(v<18||(v-18)*(v-18)+u*u<196);
  if(ar){if(v>=14&&v<18&&Math.abs(u)<13)return[34,30,26];
   const lit=v<8?1:.35;
   if(Math.abs(((u+14)%4))<.8||Math.abs(((v)%5))<.7)return[78,64,52];
   return[(70+170*lit*(.4+.6*Math.exp(-u*u/90)))|0,(52+120*lit*.5)|0,(36+60*lit*.3)|0]}
  return null};
 const faceL=(s,t,X,Y)=>{const u=s*60-30,v=(1-t)*H;
  const a=arch(s,t);if(a)return a;
  if(Math.abs(Math.abs(u)-20)<3.2&&v>6&&v<27)return[(114)|0,32,26];             // banners
  if(v>H-3)return[16,16,20];
  const q=hh((u>>2)+3,v>>1);let m=.95+q*.09;if(t>.88)m*=.6;return[246*m,246*m,240*m]};
 ibox(g,o,-30,30,-6,6,0,H,[246,246,240],[208,208,202],[160,160,154],null,faceL,(s,t)=>{const q=hh((s*20)>>1,((1-t)*H)>>1);let m=.68*(.95+q*.09);if(t>.88)m*=.6;return[246*m,246*m,240*m]});
 // one long dark tile roof over the whole lintel, its ends kicked up, a navy disc over the arch
 hipRoof(g,o,H,17,3,8,4,KTILE.blue,11);
 const[hxd,hyd]=IP(o,0,6,H+8);g.fillStyle=rgb([26,40,72]);g.fillRect(Math.round(hxd)-3,Math.round(hyd)-14,6,5);g.fillStyle=rgb([228,182,72]);g.fillRect(Math.round(hxd)-1,Math.round(hyd)-12,2,2);
 for(const sd of[-1,1]){const iA=sd<0?-46:30,iB=sd<0?-30:46,ic=(iA+iB)/2,oc=[o[0]+ic,o[1]+ic/2];
  ibox(g,o,iA,iB,-8,8,0,TH,[246,246,240],[208,208,202],[160,160,154],null,(s,t)=>{const v=(1-t)*TH;if(Math.abs(s-.5)<.07&&v>22&&v<34)return[28,24,22];if(Math.abs(s-.5)<.05&&v>22&&v<34)return[255,220,150];const q=hh((s*16)>>1,v>>1);let m=.95+q*.09;if(t>.9)m*=.6;return[246*m,246*m,240*m]},(s,t)=>{const v=(1-t)*TH;if(Math.abs(s-.5)<.1&&v>26&&v<40)return[28,24,22];const q=hh((s*16)>>1,v>>1);let m=.68*(.95+q*.09);if(t>.9)m*=.6;return[246*m,246*m,240*m]});
  hipRoof(g,oc,TH,12,4,13,3,P,sd+3)}
 // portcullis lamp and a pair of crest stars over the arch
 px(g,o[0]-1+0,o[1]+3-(18)-0,rgb([236,186,84]),2,2);
 return SPR[key]={c,ox:o[0],oy:o[1],sh:[0,4,56,9],sol:[-54,-8,36,16],sol2:[18,-8,36,16],hgt:TH+30,
  gl:[[o[0],o[1]-12,28],[o[0]-38,o[1]-27-8,16],[o[0]+38,o[1]-27-8,16]]}}

// ================= roofs, houses and halls =================
// a gable roof: ridge along i, two slopes, a closed gable end on the +i face, fascia and a lifted eave
function gableRoof(g,o,i0,i1,j0,j1,z,rh,pal,seed,ov){
 ov=ov==null?3:ov;const jm=(j0+j1)/2,d=(j1-j0)/2+ov,C=[pal.m,pal.l,pal.d];
 const Ls=i1-i0+ov*2;
 // front slope (faces +j)
 para(g,IP(o,i0-ov,j1+ov,z-1),[Ls,Ls/2],[d,-d/2-rh],(s,t,X,Y)=>{const row=Math.floor(t*8+s*.3),ft=t*8-row,col=Math.floor(s*Ls/5+(row&1)*.5),fs=s*Ls/5+(row&1)*.5-col;
  let k=C[((hh(col+seed,row)*3)|0)%3].map(v=>v*1.02);if(ft<.2)k=k.map(v=>v*.62);else if(ft>.84)k=k.map(v=>Math.min(255,v*1.18));if(fs<.1)k=k.map(v=>v*.8);if(t>.93)k=pal.f;if(t<.04)k=pal.h;return k});
 // gable end on the +i face
 for(let j=j0-ov;j<=j1+ov;j++){const hgt=rh*(1-Math.abs(j-jm)/d);if(hgt<=0)continue;const X=Math.round(o[0]+i1+ov*.0-j),Y0=Math.round(o[1]+(i1+j)/2-z);
  for(let q=0;q<hgt;q++)px(g,X,Y0-q-1,rgb(q>hgt-2?pal.f:[222,212,188].map(v=>v*.72)))}
 // the back-left fascia line and ridge cap
 for(let k=0;k<Ls;k++){px(g,Math.round(o[0]+(i0-ov+k)-jm),Math.round(o[1]+((i0-ov+k)+jm)/2-z-rh-1),rgb(pal.h))}
 // eave thickness along the front
 for(let k=0;k<Ls;k++){const X=Math.round(o[0]+(i0-ov+k)-(j1+ov)),Y=Math.round(o[1]+((i0-ov+k)+(j1+ov))/2-z+1);px(g,X,Y,rgb(pal.f),1,2);if(k%3==0)px(g,X,Y+2,rgb([190,150,96]))}}
// windows: arched or square, warm glass, shutters, a sill
function kWin(g,X,Y,w,h,lit,shut,arch,k){
 k=k||1;g.fillStyle=rgb([52,38,28].map(v=>v*k));g.fillRect(X-1,Y-1,w+2,h+2);
 g.fillStyle=rgb(lit?[255,218,134].map(v=>v*k):[96,120,140].map(v=>v*k));g.fillRect(X,Y,w,h);
 if(lit){g.fillStyle=rgb([255,240,186].map(v=>v*k));g.fillRect(X+1,Y+1,w-2,Math.max(1,h>>1))}
 g.fillStyle=rgb([60,44,32].map(v=>v*k));g.fillRect(X+(w>>1),Y,1,h);g.fillRect(X,Y+(h>>1),w,1);
 if(arch){g.fillStyle=rgb([52,38,28].map(v=>v*k));g.fillRect(X-1,Y-1,1,1);g.fillRect(X+w,Y-1,1,1)}
 if(shut){g.fillStyle=rgb(shut.map(v=>v*k));g.fillRect(X-3,Y,2,h);g.fillRect(X+w+1,Y,2,h)}
 g.fillStyle=rgb([176,170,152].map(v=>v*k));g.fillRect(X-2,Y+h+1,w+4,1)}

// a house in true 3D: stone footing, timber and plaster, shuttered windows, a roof of its own colour
const HK=[ // hw, height, roof palette, roof kind, shutters, plaster
 [9,20,'blue','hip',[70,104,150],[238,228,204]],
 [11,22,'red','gable',[60,110,76],[240,222,190]],
 [8,30,'moss','hip',[150,70,56],[228,226,206]],
 [10,22,'ochre','gable',[70,104,150],[236,214,176]],
 [12,26,'red','gable',[56,86,60],[232,220,196]],
 [9,34,'blue','hip',[176,84,58],[240,232,214]],
 [10,20,'moss','gable',[150,70,56],[238,226,200]]];
function house(kind,seed){seed=seed|0;const key='khs'+kind+'_'+seed;if(SPR[key])return SPR[key];
 const D=HK[kind%HK.length],hw=D[0],H=D[1],P=KTILE[D[2]],gab=D[3]=='gable',sh=D[4],pl=D[5],hd=gab?hw-3:hw;
 const c=mk(96,134),g=c.getContext('2d'),o=[48,108],gl=[];
 const rows=Math.max(1,Math.floor((H-8)/12));
 const face=(W,kk,lit)=>(s,t)=>{const u=s*W,v=(1-t)*H;
  if(v<6){const q=hh(Math.floor(u/4),Math.floor(v/3)+seed);return KST[2].map(m=>m*kk*(v>5.2||(u%4)<.6?.7:.9+q*.2))}
  if(u<1.6||u>W-1.6)return WOOD[0].map(m=>m*kk);
  if(Math.abs(v-6.5)<1)return WOOD[0].map(m=>m*kk);
  for(let r=0;r<rows;r++){const vy=8+r*11,ww=gab&&W>30?[.28,.68]:[.5];for(const wf of ww){const wx=wf*W;if(Math.abs(u-wx)<3&&v>=vy+1&&v<vy+9)return null}}
  if(Math.abs((u+W/2)%(W/2)-W/4)<.7&&v>6)return WOOD[1].map(m=>m*kk);
  if(v>H-3.5)return WOOD[0].map(m=>m*kk);
  const q=hh(Math.floor(u),Math.floor(v)+seed*3);return pl.map(m=>m*kk*(.94+q*.07))};
 // the faces return null where a window goes: paint plaster first, then the windows on top
 const body=(W,kk)=>{const f=face(W,kk);return(s,t,X,Y)=>f(s,t,X,Y)||pl.map(m=>m*kk*.9)};
 const W1=gab?2*(hw+0):2*hw,W2=2*hd;
 const iw=gab?hw:hw,iL=-iw,iR=iw;
 ibox(g,o,iL,iR,-hd,hd,0,H,[206,200,182],pl.map(v=>v*.98),pl.map(v=>v*.74),null,body(2*iw,1),body(2*hd,.74));
 // windows + door on the long (left) face, windows on the right face
 const Pl=(i,j,z)=>IP(o,i,j,z);
 for(let r=0;r<rows;r++){const vy=8+r*11,zc=H-vy-9;
  const ww=gab&&2*iw>30?[.28,.68]:[.5];
  for(const wf of ww){const u=wf*2*iw+iL,[X,Y]=Pl(u,hd,H-vy);const lit=hh(seed+r,wf*9)>.25;kWin(g,Math.round(X)-2,Math.round(Y)+0,5,8,lit,sh,r==0&&0);if(lit)gl.push([Math.round(X),Math.round(Y)+4,16])}
  const[X2,Y2]=Pl(iR,hd-(hd*.5),H-vy);if(r<rows)kWin(g,Math.round(X2)-2,Math.round(Y2)-0,5,8,hh(seed+r,3)>.3,sh,0,.76)}
 // the door, on the long face, near one end
 {const u=iL+(gab?.5:.5)*2*iw+(gab?0:0),[X,Y]=Pl(gab?iL+iw*1.0:0,hd,0);g.fillStyle=rgb([46,30,20]);g.fillRect(Math.round(X)-3,Math.round(Y)-11,7,11);g.fillStyle=rgb(WOOD[1]);g.fillRect(Math.round(X)-2,Math.round(Y)-10,5,10);g.fillStyle=rgb([228,186,92]);g.fillRect(Math.round(X)+1,Math.round(Y)-5,1,1);g.fillStyle=rgb(KST[3]);g.fillRect(Math.round(X)-4,Math.round(Y)-12,9,1)}
 if(gab)gableRoof(g,o,iL,iR,-hd,hd,H,12+((hw*.3)|0),P,seed,3);
 else hipRoof(g,o,H,hw+4,hw*.34+2,14,3,P,seed);
 // a chimney, with a thread of smoke
 {const ci=gab?iR*.4:hw*.2,cj=-hd*.4;ibox(g,o,ci,ci+4,cj,cj+4,H+4,H+22,[170,164,150],[136,130,118],[100,96,88],null,ash(4,18,1,3),ash(4,18,.7,4));
  const[X,Y]=IP(o,ci+2,cj+2,H+23);px(g,Math.round(X)-2,Math.round(Y),rgb([60,54,48]),5,1);for(let k=0;k<5;k++)px(g,Math.round(X)+(k&1),Math.round(Y)-3-k*3,rgb([226,226,226].map(v=>v-k*14)),2,2)}
 return SPR[key]={c,ox:o[0],oy:o[1],sh:[2,3,hw*1.6,hw*.8],sol:[-hw-4,-4,2*hw+8,hw+8],gl,hgt:H+26}}

// ================= the great buildings =================
function chapel(){if(SPR.kch)return SPR.kch;
 const c=mk(130,170),g=c.getContext('2d'),o=[52,136],H=28,TH=58;
 const stain=(s,t)=>{const u=s*40,v=(1-t)*H;for(let k=0;k<3;k++){const cx=8+k*12;if(Math.abs(u-cx)<3.4&&v>8&&v<22&&(v<17||(v-17)*(v-17)+(u-cx)*(u-cx)<12)){
   const cols=[[90,140,220],[220,90,110],[240,200,80]];return cols[(k+((v/4)|0))%3].map(q=>q*(.8+.3*Math.sin(v+k)))}}return null};
 const nave=(s,t,X,Y)=>stain(s,t)||(Math.abs((s*40)%12-6)<.6&&(1-t)*H<8?[110,106,96]:ash(40,H,1,5)(s,t));
 ibox(g,o,-24,16,-10,10,0,H,[200,196,178],[150,146,132],[108,104,94],null,nave,ash(20,H,.72,6));
 gableRoof(g,o,-24,16,-10,10,H,13,KTILE.blue,4,3);
 // buttresses
 for(const i of[-18,-6,6])ibox(g,o,i,i+3,10,14,0,18,[190,186,168],[140,136,122],[100,96,88],null,ash(4,18,1,i),ash(4,18,.7,i));
 // the bell tower at the front, with a rose window, and a spire
 ibox(g,o,16,36,-9,9,0,TH,[206,202,184],[156,152,138],[112,108,98],null,(s,t)=>{const v=(1-t)*TH;if(v>16&&v<24&&Math.abs(s-.5)<.12)return[26,22,20];if(v>36&&v<50&&Math.abs(s-.5)<.18)return v<42?[26,22,20]:[40,34,30];return ash(20,TH,1,9)(s,t)},
  (s,t)=>{const u=(s-.5)*18,v=(1-t)*TH;const rr=Math.hypot(u,v-34);if(rr<7){if(rr>5.6)return[220,200,150];const an=Math.atan2(v-34,u);return[[230,90,100],[250,210,90],[100,150,230]][Math.floor((an+3.2)/1.05)%3].map(q=>q*(1-rr*.03))}
   if(v>8&&v<20&&Math.abs(u)<3)return[30,26,24];return ash(18,TH,.72,11)(s,t)});
 const oc=[o[0]+26,o[1]+13];hipRoof(g,oc,TH,9,3,36,2,KTILE.blue,5);
 const top=IP(oc,0,0,TH+36);px(g,top[0]-1,top[1]-9,rgb([222,182,92]),2,9);px(g,top[0]-3,top[1]-6,rgb([222,182,92]),6,2);
 return SPR.kch={c,ox:o[0],oy:o[1],sh:[6,4,50,12],sol:[-34,-8,86,26],hgt:TH+48,gl:[[o[0]-10,o[1]-14,22],[o[0]+26-16+16,o[1]+14-30,20]]}}

function library(){if(SPR.klb)return SPR.klb;
 const c=mk(76,170),g=c.getContext('2d'),o=[38,142],H=74;
 ibox(g,o,-11,11,-11,11,0,H,[206,202,184],[156,152,138],[112,108,98],null,(s,t)=>{const u=s*22,v=(1-t)*H;
  for(const wy of[12,30,48]){for(const wx of[5,13]){if(Math.abs(u-wx)<2.2&&v>wy&&v<wy+10)return v<wy+3?[255,236,170]:[255,206,110]}}
  const rr=Math.hypot(u-11,v-64);if(rr<7.5){if(rr>6)return[200,170,90];if(Math.abs(u-11)<.7&&v>64&&v<70||Math.abs(v-64)<.7&&u>11&&u<16)return[40,30,24];return[246,238,214]}
  return ash(22,H,1,2)(s,t)},(s,t)=>{const v=(1-t)*H;if(Math.abs(s-.5)<.13&&v>10&&v<24)return[40,30,24];return ash(22,H,.72,3)(s,t)});
 // a verdigris dome, a brass ring, a gilt finial
 const dc=IP(o,0,0,H);const R=15;for(let dx=-R;dx<=R;dx++){const h=Math.sqrt(R*R-dx*dx)*.95,t=(dx+R)/(2*R);for(let q=0;q<h;q++){const sh=(t<.3?1.1:t<.65?.92:.66)*(1-q/h*.1);px(g,Math.round(dc[0])+dx,Math.round(dc[1])-q-1,rgb([110,168,142].map(v=>v*sh)))}}
 for(let k=-R;k<=R;k++)px(g,Math.round(dc[0])+k,Math.round(dc[1]),rgb([196,150,70]));
 px(g,Math.round(dc[0])-1,Math.round(dc[1])-R-9,rgb([222,182,92]),2,9);disc(g,Math.round(dc[0]),Math.round(dc[1])-R-11,2,2,rgb([255,236,170]));
 return SPR.klb={c,ox:o[0],oy:o[1],sh:[2,3,18,6],sol:[-14,-2,28,18],hgt:H+34,gl:[[o[0]-12,o[1]-70+10,18],[o[0]-4,o[1]-70+30,18],[o[0]-9,o[1]-40,20]]}}

function smithy(){if(SPR.ksm)return SPR.ksm;
 const c=mk(96,110),g=c.getContext('2d'),o=[48,86],H=18;
 ibox(g,o,-14,14,-9,9,0,H,[190,186,168],[146,142,128],[106,102,92],null,(s,t)=>{const u=s*28,v=(1-t)*H;
  if(u>6&&u<22&&v>0&&v<14){const gl=Math.exp(-((u-14)*(u-14)+(v-3)*(v-3))/40);return[(40+215*gl)|0,(30+120*gl)|0,(24+30*gl)|0]}
  return ash(28,H,1,3)(s,t)},ash(18,H,.72,4));
 gableRoof(g,o,-14,14,-9,9,H,9,KTILE.red,6,4);
 ibox(g,o,6,11,-8,-3,H,H+26,[150,146,132],[118,114,104],[86,82,74],null,ash(5,26,1,5),ash(5,26,.7,6));
 const[X,Y]=IP(o,0,9,2);px(g,Math.round(X)-4,Math.round(Y)-3,rgb([40,36,40]),9,3);px(g,Math.round(X)-3,Math.round(Y)-5,rgb([70,66,72]),7,2);   // the anvil
 return SPR.ksm={c,ox:o[0],oy:o[1],sh:[2,3,22,8],sol:[-18,-4,38,16],hgt:H+34,gl:[[o[0]-2,o[1]-6,30]]}}

// ---- market stall: a counter, goods, a striped awning
function kstall(kind){const key='kst'+kind;if(SPR[key])return SPR[key];
 const A=[[[204,60,52],[246,238,222]],[[60,100,170],[246,238,222]],[[230,180,60],[246,238,222]],[[70,140,84],[246,238,222]]][kind%4];
 const c=mk(60,64),g=c.getContext('2d'),o=[30,48];
 ibox(g,o,-9,9,-4,4,0,9,[170,128,80],[148,104,62],[104,72,44],null,(s,t)=>(Math.abs((s*18)%6-3)<.4?[96,66,40]:null),null);
 // goods on the counter
 const cols=[[[220,60,50],[250,200,60],[120,170,60]],[[230,230,240],[90,120,190],[200,80,120]],[[214,160,90],[240,200,130],[170,110,60]],[[90,150,70],[130,190,90],[200,90,160]]][kind%4];
 for(let k=0;k<9;k++){const[X,Y]=IP(o,-7+k*1.8,1+(k%2)*1.4,9);px(g,Math.round(X),Math.round(Y)-2,rgb(cols[k%3]),2,2);px(g,Math.round(X),Math.round(Y)-2,rgb([255,255,255].map((v,q)=>(cols[k%3][q]+v)/2)),1,1)}
 for(const[i,j]of[[-9,-4],[9,-4],[-9,4],[9,4]]){const[X,Y]=IP(o,i,j,0);px(g,Math.round(X),Math.round(Y)-24,rgb(WOOD[1]),1,24)}
 para(g,IP(o,-10,5,24),[20,10],[ -9, -4.5-5],(s,t)=>Math.floor(s*10)%2?rgb(A[0]):rgb(A[1]));
 para(g,IP(o,-10,5,24),[20,10],[0,3],(s,t)=>Math.floor(s*10)%2?rgb(A[0].map(v=>v*.7)):rgb(A[1].map(v=>v*.8)));
 return SPR[key]={c,ox:o[0],oy:o[1],sh:[0,2,13,5],sol:[-12,-2,24,10],hgt:30}}

function fountain(){if(SPR.kfn)return SPR.kfn;
 const c=mk(84,92),g=c.getContext('2d'),cx=42,by=76;
 cyl(g,cx,by,30,14,9,[KST[3],KST[4],KST[2]],[70,126,150],(dx,v)=>v%4==0?KST[2]:null);
 disc(g,cx,by-9,26,11,rgb([54,108,134]));disc(g,cx,by-9,22,9,rgb([70,134,160]));
 for(let k=0;k<26;k++)px(g,cx-20+((hh(k,3)*40)|0),by-9-7+((hh(3,k)*13)|0),rgb([200,236,246]),2,1);
 cyl(g,cx,by-9,6,3,22,[KST[3],KST[4],KST[2]],[222,220,206],null);
 cyl(g,cx,by-31,14,6,5,[KST[3],KST[4],KST[2]],[80,146,170],null);
 cyl(g,cx,by-36,4,2,18,[KST[3],KST[4],KST[2]],[222,220,206],null);
 for(const sd of[-1,1])for(let q=0;q<14;q++){const t=q/13;px(g,Math.round(cx+sd*(2+t*13)),Math.round(by-52+Math.sin(t*3.14)*-6+t*t*26),rgb([190,232,246]),1,1)}
 // a gold star, the first one anyone made
 const sy=by-60;g.fillStyle=rgb([240,196,84]);g.fillRect(cx-1,sy-7,2,14);g.fillRect(cx-7,sy-1,14,2);g.fillRect(cx-4,sy-4,8,8);g.fillStyle=rgb([255,240,170]);g.fillRect(cx-1,sy-2,2,3);
 return SPR.kfn={c,ox:cx,oy:by,sh:[0,3,32,12],sol:[-30,-8,60,22],hgt:70,gl:[[cx,by-60,22]]}}

function lanternBearer(){if(SPR.klt)return SPR.klt;
 const c=mk(34,70),g=c.getContext('2d'),o=[17,60];
 ibox(g,o,-7,7,-7,7,0,10,[196,192,176],[150,146,132],[108,104,94],null,ash(14,10,1,1),ash(14,10,.7,2));
 g.fillStyle=rgb([120,118,108]);g.fillRect(14,24,6,22);g.fillRect(12,28,10,16);g.fillStyle=rgb([150,148,136]);g.fillRect(14,24,2,22);
 g.fillStyle=rgb([196,190,176]);g.fillRect(14,16,6,7);g.fillStyle=rgb([100,98,90]);g.fillRect(13,14,8,3);
 g.fillStyle=rgb([60,50,40]);g.fillRect(21,28,1,14);g.fillStyle=rgb([236,186,84]);g.fillRect(20,40,4,5);g.fillStyle=rgb([255,236,170]);g.fillRect(21,41,2,3);
 return SPR.klt={c,ox:17,oy:60,sh:[0,2,8,3],sol:[-8,-2,16,8],hgt:50,gl:[[22,43,22]]}}

// ---- the mill: a stone tower, a thatch cap, and four sails that turn
function mill(){if(SPR.kml)return SPR.kml;
 const c=mk(70,112),g=c.getContext('2d'),cx=35,by=102;
 for(let k=0;k<4;k++){const rx=20-k*2.2;cyl(g,cx,by-k*14,Math.round(rx),Math.round(rx*.46),15,[[186,180,164],[220,212,194],[146,140,126]].map(q=>q.map(v=>v*(1-k*.03))),[226,218,200],(dx,v)=>(v%5==0||hh(dx>>1,v+k*9)>.9)?[150,144,130]:null)}
 g.fillStyle='#2a1c14';g.fillRect(cx-4,by-14,8,13);g.fillStyle=rgb(WOOD[1]);g.fillRect(cx-3,by-13,6,12);
 g.fillStyle='#241c14';g.fillRect(cx-3,by-36,6,8);g.fillStyle='#ffd88a';g.fillRect(cx-2,by-35,4,6);
 for(let v=0;v<=16;v++){const hw=Math.round(15*(1-v/20));for(let dx=-hw;dx<=hw;dx++){const sh=(dx<0?.74:dx>3?.86:1.05);g.fillStyle=rgb(((v+dx)%4?[176,138,70]:[140,106,52]).map(q=>q*sh*(1-v*.02)));g.fillRect(cx+dx,by-58-v,1,1)}}
 g.fillStyle=rgb(WOOD[0]);g.fillRect(cx-2,by-58-16-5,4,6);
 return SPR.kml={c,ox:cx,oy:by,sh:[2,3,24,9],sol:[-20,-2,40,14],hgt:92,hub:[cx,by-50]}}
function millSails(a,b){const[X,Y]=PF(a,b),sp=mill();
 objs.push({d:a+b+.07,x:Math.round(X),y:Math.round(Y),ph:0,t:0,sp:null,draw:c=>{const hx_=Math.round(X)-sp.ox+sp.hub[0]+6,hy=Math.round(Y)-sp.oy+sp.hub[1]+4,an=(typeof T!=='undefined'?T:0)*.5;
  for(let k=0;k<4;k++){const th=an+k*Math.PI/2,ca=Math.cos(th),sa=Math.sin(th);
   const P=(r,w)=>[Math.round(hx_+ca*r-sa*w),Math.round(hy+sa*r+ca*w)];
   let p0=P(5,0),p1=P(40,0);ln(c,p0[0],p0[1],p1[0],p1[1],'#5a3e24');ln(c,p0[0]+1,p0[1],p1[0]+1,p1[1],'#7a5632');
   for(const[r0,r1]of[[10,40]]){const q0=P(r0,5),q1=P(r1,5),q2=P(r1,-1),q3=P(r0,-1);ln(c,q0[0],q0[1],q1[0],q1[1],'#c9b48a');ln(c,q1[0],q1[1],q2[0],q2[1],'#c9b48a');ln(c,q2[0],q2[1],q3[0],q3[1],'#c9b48a');ln(c,q3[0],q3[1],q0[0],q0[1],'#c9b48a');
    for(let r=12;r<40;r+=4){const s0=P(r,5),s1=P(r,-1);ln(c,s0[0],s0[1],s1[0],s1[1],'#e8dcc0')}}}
  disc(c,hx_,hy,3,3,'#3a2818');px(c,hx_-1,hy-1,'#c8a468',2,2)}})}

// ---- the hedge maze: one tile of clipped green, with a lighter top
function hedge(axis){const key='khg'+axis;if(SPR[key])return SPR[key];
 const c=mk(34,34),g=c.getContext('2d'),o=[17,26],H=14,L=8,Tn=3;
 const leaf=(k)=>(s,t,X,Y)=>{const n=vn(X*.5,Y*.5+axis),q=hh(X,Y);let col=GP.g[clamp(Math.floor(n*3.4+q*1.2+(1-t)*.6),0,4)];if(q>.93)col=[236,246,200];return col.map(v=>v*k)};
 const i0=axis?-Tn:-L,i1=axis?Tn:L,j0=axis?-L:-Tn,j1=axis?L:Tn;
 ibox(g,o,i0,i1,j0,j1,0,H,GP.g[4],GP.g[2],GP.g[1],leaf(1.15),leaf(1),leaf(.7));
 return SPR[key]={c,ox:o[0],oy:o[1],sh:[0,1,10,3],sol:[-10,-3,20,7],hgt:16}}
function topiary(kind){const key='ktp'+kind;if(SPR[key])return SPR[key];const c=mk(26,50),g=c.getContext('2d');
 px(g,11,40,rgb([120,80,52]),4,8);
 for(let y=0;y<34;y++){const t=y/34,hw=kind?Math.round(11*Math.sin(Math.min(1,t*1.1+.05)*1.57)):Math.round(11*(1-t));for(let dx=-hw;dx<=hw;dx++){const q=hh(dx+kind*5,y),n=clamp(Math.floor((dx<0?2.2:1.2)+q*1.6+(1-t)*.8),0,4);px(g,13+dx,40-y-1,rgb(GP.g[n]))}}
 if(!kind){g.fillStyle=rgb([240,196,84]);g.fillRect(12,4,2,3)}
 return SPR[key]={c,ox:13,oy:46,sh:[1,1,9,3],sol:[-6,0,12,6],hgt:40}}
function starStone(seed){const key='kss'+seed;if(SPR[key])return SPR[key];const c=mk(20,44),g=c.getContext('2d');
 const w=7+(seed%3);for(let y=0;y<34;y++)for(let x=0;x<w;x++){const e=x<1||x>w-2||y<1,t=x/w;px(g,10-(w>>1)+x,38-y,rgb((e?KST[1]:t<.4?KST[3]:KST[2]).map(v=>v*(.92+hh(x,y+seed)*.12))))}
 g.fillStyle=rgb([196,226,255]);const sx=10,sy=18;g.fillRect(sx-1,sy-3,2,7);g.fillRect(sx-3,sy,6,1);
 for(let k=0;k<6;k++)px(g,3+((hh(k,seed)*14)|0),8+((hh(seed,k)*26)|0),rgb([120,150,110]),1,1);
 return SPR[key]={c,ox:10,oy:38,sh:[1,1,6,2],gl:[[10,18,14]],sol:[-4,0,8,5],hgt:38}}

// ================= the sky docks =================
function airship(kind){const key='kas'+kind;if(SPR[key])return SPR[key];
 const A=kind?[[60,100,170],[246,238,222]]:[[204,60,52],[246,238,222]],c=mk(124,96),g=c.getContext('2d'),cx=60,cy=34;
 // the envelope: a long ellipse with stripes, shaded from the left
 for(let x=-52;x<=52;x++){const h=Math.round(24*Math.sqrt(1-x*x/2704)),t=(x+52)/104;for(let y=-h;y<=h;y++){const sh=1.14-.5*((y+h)/(2*h))-(t>.7?.14:0),st=Math.floor((x+52)/9)%2;
   px(g,cx+x,cy+y,rgb((st?A[1]:A[0]).map(v=>Math.min(255,v*sh))))}}
 for(let x=-52;x<=52;x+=9)for(let y=-22;y<=22;y++){const h=Math.round(24*Math.sqrt(1-x*x/2704));if(Math.abs(y)<=h&&hh(x,y)>.35)px(g,cx+x,cy+y,rgb([40,30,30]),1,1)}
 px(g,cx-52,cy-1,rgb([222,182,92]),3,3);
 // tail fins and the gondola, with rigging
 g.fillStyle=rgb(A[0].map(v=>v*.8));g.beginPath();g.moveTo(cx+40,cy-14);g.lineTo(cx+60,cy-26);g.lineTo(cx+54,cy);g.fill();g.beginPath();g.moveTo(cx+40,cy+14);g.lineTo(cx+60,cy+24);g.lineTo(cx+54,cy);g.fill();
 for(const x of[-30,-14,6,22])ln(g,cx+x,cy+20,cx+x*.5,cy+36,rgb([60,46,36]));
 g.fillStyle=rgb([104,70,42]);g.fillRect(cx-22,cy+36,44,12);g.fillStyle=rgb([156,110,66]);g.fillRect(cx-22,cy+36,44,3);g.fillStyle=rgb([70,48,30]);g.fillRect(cx-22,cy+46,44,2);
 for(let k=0;k<5;k++){g.fillStyle=rgb([255,214,128]);g.fillRect(cx-17+k*8,cy+40,4,4)}
 g.fillStyle=rgb([60,46,36]);g.fillRect(cx+22,cy+38,5,2);
 g.fillStyle=rgb([222,182,92]);g.fillRect(cx-1,cy-31,1,8);g.fillStyle=rgb([114,32,26]);g.fillRect(cx,cy-31,7,4);
 return SPR[key]={c,ox:cx,oy:cy+48,gl:[[cx-6,cy+42,20]],hgt:90}}
function airshipLive(a,b,alt,kind,ph){const[X,Y]=PF(a,b),sp=airship(kind);
 objs.push({d:a+b+.3,x:Math.round(X),y:Math.round(Y),ph:0,t:0,sp:null,draw:c=>{const t=(typeof T!=='undefined'?T:0),bob=Math.round(Math.sin(t*.8+ph)*3),sw=Math.round(Math.sin(t*.5+ph*2)*1.5),px_=Math.round(X)-sp.ox+sw,py=Math.round(Y)-sp.oy-alt+bob;
  c.drawImage(sp.c,px_,py);
  const ax=px_+sp.ox+(kind?-10:-6),ay=py+sp.oy-6,sa=t*14;for(let k=0;k<2;k++){const s=Math.sin(sa+k*1.57)*7;ln(c,ax+54,ay-8-s,ax+54,ay-8+s,'#2a1c14')}
  GLW.push([px_+sp.gl[0][0],py+sp.gl[0][1],sp.gl[0][2]]);
  ln(c,Math.round(X)-4,Math.round(Y)-2,px_+sp.ox-14,py+sp.oy-2,'#4a3626')}})}
function dockPier(len){const key='kdp'+len;if(SPR[key])return SPR[key];
 const Wt=.9,e1=[-len*16,len*8],e2=[Wt*16,Wt*8],c=mk(len*16+30,len*8+40),x=c.getContext('2d'),p0=[len*16+8,16];
 const at=(s,t)=>[Math.round(p0[0]+s*e1[0]+t*e2[0]),Math.round(p0[1]+s*e1[1]+t*e2[1])];
 for(let k=0;k<=len;k++)for(const t of[.05,.95]){const[X,Y]=at(k/len,t);px(x,X-1,Y+3,rgb([46,32,22]),3,12);px(x,X,Y+3,rgb([76,54,36]),1,12)}
 para(x,[p0[0],p0[1]+4],e1,e2,()=>rgb([52,34,22]));para(x,[p0[0],p0[1]+2],e1,e2,()=>rgb([86,60,38]));
 para(x,p0,e1,e2,(s,t)=>{const m=s*len*6,q=hh(Math.floor(m),5);let k=q>.6?[198,152,96]:q>.3?[176,130,80]:[154,112,66];if(m%1<.14)k=[98,68,42];return rgb(k)});
 for(let k=0;k<=len;k+=2)for(const t of[.04,.96]){const[X,Y]=at(k/len,t);px(x,X-1,Y-8,rgb([84,56,36]),2,9)}
 return SPR[key]={c,ox:p0[0],oy:p0[1],sh:[-len*8,len*4,len*8,5],hgt:20}}
function chairDais(){if(SPR.kcd)return SPR.kcd;const c=mk(70,40),g=c.getContext('2d');
 disc(g,35,26,30,12,rgb(KST[1]));disc(g,35,24,29,11,rgb(KST[3]));disc(g,35,23,22,8,rgb(KST[2]));disc(g,35,22,15,5,rgb(KST[4]));
 g.fillStyle=rgb([228,182,72]);g.fillRect(34,20,2,5);g.fillRect(31,22,8,1);
 return SPR.kcd={c,ox:35,oy:24}}

// ================= the keep: ishigaki drum, three white tiers, dark tile roofs, shachihoko on the ridge =================
// head-on, the way the painted scrolls show it: a hill of dark stone, white plaster above, roofs that lift at the corners
function keep(){
 if(SPR.keep)return SPR.keep;
 const c=mk(236,284),x=c.getContext('2d'),cx=118,by=276;
 const STN=[[56,54,48],[74,72,64],[92,90,80],[112,110,98],[136,134,120]];
 // a head-on Japanese hip roof: concave profile, seams, upturned eave tips, fascia with rafters, ridge cap
 const jroof=(cx2,y,rh,hw,sd)=>{
  const m=[46,54,78],hi=[178,188,212];
  for(let v=0;v<rh;v++){
   const t=v/rh,q=Math.pow(t,.68),w=Math.round(hw*(.24+.76*q));
   for(let X=cx2-w;X<=cx2+w;X++){
    const nd=(X-cx2)/hw,hhval=hh(X>>1,v+sd*31);
    let k=(X<cx2?1.06:.72)*(.9+hhval*.2);
    if(v%4===3)k*=.7;
    if((((X+((v/4|0)*2))%5)+5)%5===0)k*=.6;
    let col=[m[0]*k,m[1]*k,m[2]*k];
    if(v===0)col=[hi[0]*.85,hi[1]*.85,hi[2]*.9];
    if(Math.abs(nd)>.93)col=[hi[0]*(X<cx2?.8:.6),hi[1]*(X<cx2?.8:.6),hi[2]*(X<cx2?.8:.6)];
    x.fillStyle=rgb(col);x.fillRect(X,y+v,1,1)}
   if(v===rh-1){for(let X=cx2-w;X<=cx2+w;X++){x.fillStyle=rgb([13,15,22]);x.fillRect(X,y+rh,1,2);if(X%3===0){x.fillStyle=rgb([190,150,96]);x.fillRect(X,y+rh+1,1,1)}}}
  }
  for(const sd2 of[-1,1])for(let k=0;k<5;k++){const X=cx2+sd2*(hw+1+k),Y=y+rh-2-k;x.fillStyle=rgb(k<2?hi:[52,60,86]);x.fillRect(X,Y,2,1)}
  const rw=Math.round(hw*.3);x.fillStyle=rgb(hi);for(let X=cx2-rw;X<=cx2+rw;X++)x.fillRect(X,y-2,1,2)};
 // the chidori gable: white face, dark bargeboards, one navy disc with a gold heart
 const hafu=(cx2,baseY,w,h)=>{
  for(let v=0;v<h;v++){const t=v/h,w2=Math.max(1,Math.round(w*(1-t)));
   for(let X=cx2-w2;X<=cx2+w2;X++){const edge=Math.abs(X-cx2)>=w2-2;x.fillStyle=rgb(edge?[34,36,46]:[242,242,236]);x.fillRect(X,baseY-v,1,1)}}
  x.fillStyle=rgb([26,40,72]);x.fillRect(cx2-3,baseY-h+2,7,5);x.fillRect(cx2-2,baseY-h+1,5,1);x.fillRect(cx2-2,baseY-h+7,5,1);
  x.fillStyle=rgb([228,182,72]);x.fillRect(cx2-1,baseY-h+4,2,2)};
 const post=(X,Y0,h)=>{x.fillStyle=rgb([36,30,24]);x.fillRect(X,Y0,3,h)};
 const slatWin=(X,Y,lit,w,h)=>{w=w||8;h=h||12;
  x.fillStyle=rgb(lit?[255,216,128]:[18,20,28]);x.fillRect(X,Y,w,h);
  x.fillStyle=rgb(lit?[140,96,48]:[58,60,74]);for(let u=2;u<w-1;u+=2)x.fillRect(X+u,Y,1,h);
  x.fillStyle=rgb([208,204,190]);x.fillRect(X-1,Y-1,w+2,1);x.fillRect(X-1,Y+h+1,w+2,1)};
 // the dais: three round steps out of the court
 cyl(x,cx,by,98,11,7,[STN[0],STN[1],STN[0]],[STN[1]],null);
 cyl(x,cx,by-7,84,10,8,[STN[1],STN[2],STN[1]],[STN[3]],null);
 cyl(x,cx,by-15,70,9,8,[STN[2],STN[3],STN[2]],[STN[4]],null);
 // the drum: ishigaki, big sloped boulders in dark mortar, the hill of stone the castle grew from
 const ish=(dx,v)=>{const r=Math.floor(v/6),u=Math.floor((dx+(r&1)*6)/7),q=hh(u+3,r+7);
  let m=.82+q*.4;if(v%6===0)m*=.5;if((((dx+(r&1)*6)%7)+7)%7===0)m*=.5;return[Math.round(113*m),Math.round(110*m),Math.round(99*m)]};
 cyl(x,cx,by-23,66,16,54,[STN[1],STN[2],STN[0]],[148,146,136],ish);
 // the great gate arch in the stone, warm from the inside
 x.fillStyle='#191512';x.fillRect(cx-22,by-64,44,41);
 x.fillStyle='#3a2c20';x.fillRect(cx-21,by-63,42,40);
 x.fillStyle='#4a3a30';for(let k=-16;k<=16;k+=6)x.fillRect(cx+k,by-63,2,40);
 x.fillStyle='#241c14';x.fillRect(cx-21,by-25,42,2);
 x.fillStyle='#ffd88a';x.fillRect(cx-13,by-30,26,9);x.fillStyle='#ffdca0';x.fillRect(cx-8,by-29,18,7);
 for(const sx of[-46,39]){x.fillStyle='#191512';x.fillRect(cx+sx,by-47,7,14);x.fillStyle='#ffdca0';x.fillRect(cx+sx+2,by-43,3,6)}
 // ===== tier one: white plaster, dark posts, slat windows, the red star banners
 const T1Y=by-88,T1H=34;
 x.fillStyle=rgb([246,246,240]);x.fillRect(cx-52,T1Y-T1H,104,T1H);
 x.fillStyle=rgb([214,214,208]);x.fillRect(cx+49,T1Y-T1H,3,T1H);
 for(let v=0;v<T1H;v++){x.fillStyle=rgb([246,246,240].map(q=>q*(1-(v/T1H)*.06)));x.fillRect(cx-52,T1Y-T1H+v,3,1)}
 post(cx-52,T1Y-T1H,T1H);post(cx+49,T1Y-T1H,T1H);
 slatWin(cx-31,T1Y-T1H+11,1,8,13);slatWin(cx+23,T1Y-T1H+11,1,8,13);slatWin(cx-4,T1Y-T1H+13,0,8,11);
 for(const bx of[cx-46,cx+32]) KBAN(bx,T1Y-T1H+4,15,30,x);
 jroof(cx,T1Y-T1H-17,17,64,3);
 hafu(cx,T1Y-T1H-14,14,13);
 // ===== tier two: smaller white tier, one dark window, one round window
 const T2Y=T1Y-T1H-15,T2H=29;
 x.fillStyle=rgb([246,246,240]);x.fillRect(cx-38,T2Y-T2H,76,T2H);
 x.fillStyle=rgb([214,214,208]);x.fillRect(cx+35,T2Y-T2H,3,T2H);
 post(cx-38,T2Y-T2H,T2H);post(cx+35,T2Y-T2H,T2H);
 slatWin(cx-13,T2Y-T2H+9,0,9,13);
 x.fillStyle=rgb([18,20,28]);x.fillRect(cx+8,T2Y-T2H+9,7,7);x.fillStyle=rgb([58,60,74]);x.fillRect(cx+9,T2Y-T2H+10,1,5);x.fillRect(cx+13,T2Y-T2H+10,1,5);
 jroof(cx,T2Y-T2H-15,15,50,5);
 hafu(cx,T2Y-T2H-12,11,11);
 // ===== tier three: the smallest, with the golden ridge
 const T3Y=T2Y-T2H-13,T3H=26;
 x.fillStyle=rgb([246,246,240]);x.fillRect(cx-26,T3Y-T3H,52,T3H);
 x.fillStyle=rgb([214,214,208]);x.fillRect(cx+23,T3Y-T3H,3,T3H);
 post(cx-26,T3Y-T3H,T3H);post(cx+23,T3Y-T3H,T3H);
 slatWin(cx-4,T3Y-T3H+8,1,8,11);
 jroof(cx,T3Y-T3H-12,12,35,7);
 // the ridge: two shachihoko horns and the star of the house between them
 for(const sd2 of[-1,1]){const bx2=cx+sd2*11;
  x.fillStyle=rgb([228,182,72]);x.fillRect(bx2-1,T3Y-T3H-15,3,5);x.fillRect(bx2+(sd2>0?1:-2),T3Y-T3H-18,2,3);x.fillRect(bx2+(sd2>0?2:-3),T3Y-T3H-20,1,2);
  x.fillStyle=rgb([255,240,170]);x.fillRect(bx2,T3Y-T3H-16,1,1)}
 x.fillStyle=rgb([228,182,72]);x.fillRect(cx-1,T3Y-T3H-22,2,7);x.fillRect(cx-3,T3Y-T3H-20,6,2);x.fillRect(cx-1,T3Y-T3H-24,2,2);
 // fallen stones at the foot, because a castle this old is honest about it
 x.fillStyle=rgb([88,86,76]);x.fillRect(cx-98,by-8,12,6);x.fillRect(cx+82,by-8,12,5);
 x.fillStyle=rgb([128,124,110]);x.fillRect(cx-98,by-9,12,1);x.fillRect(cx+84,by-9,9,1);
 const sp={c,ox:cx,oy:by,sh:[-86,0,172,16],sol:[-82,-2,164,17],gl:[[cx-27,T1Y-22,20],[cx+27,T1Y-22,20],[cx,T3Y-T3H-16,22]],hgt:212};
 SPR.keep=sp;return sp}

// ---- the outer towers: shorter than the keep, tall enough to be remembered
function keepTower(){
 if(SPR.tower)return SPR.tower;
 const c=mk(54,116),x=c.getContext('2d'),cx=27,by=110;
 const STN=[[56,54,48],[74,72,64],[92,90,80],[112,110,98],[136,134,120]];
 // the lower drum: ashlar courses, one slit window, half a door's worth of shadow
 cyl(x,cx,by,19,9,46,[[58,56,50],[78,76,68],[96,94,84]],[186,182,170],(dx,v)=>{
   if(v%7==0)return[38,36,32];
   if(hh(dx>>1,v)>.9)return[38,36,32];
   return null});
 x.fillStyle='#191512';x.fillRect(cx-5,by-36,10,8);x.fillStyle='#ffdca0';x.fillRect(cx-3,by-34,6,4);
 // the corbelled crown and the upper drum with a corbelled crown of its own
 cyl(x,cx,by-46,24,4,8,[[214,214,208],[246,246,240],[238,238,232]],[255,255,248],null);
 for(let u=cx-22;u<cx+22;u+=9){x.fillStyle=rgb(STN[3]);x.fillRect(u,by-59,5,8);x.fillStyle=rgb([158,154,140]);x.fillRect(u,by-60,5,1)}
 cyl(x,cx,by-60,15,6,20,[[214,214,208],[244,244,238],[236,236,230]],[252,252,246],(dx,v)=>v%7==0?[196,196,190]:null);
 for(let u=cx-14;u<cx+14;u+=8){x.fillStyle=rgb(STN[2]);x.fillRect(u,by-74,4,5)}
 // the cap roof: dark curved tiles, upturned rim, and a gilt finial nobody has ever rung
 for(let v=0;v<=20;v++){const q=Math.pow(1-v/21,.85),hw=Math.max(1,Math.round(15*q));
   for(let dx=-hw;dx<=hw;dx++){const sh=(dx<0?.7:dx>5?.84:1.05)*(1-.05*v),seam=(((dx+v*2)%6)+6)%6<1;
     const base=seam?[22,25,38]:[44,52,74];x.fillStyle=rgb(base.map(q2=>Math.min(255,Math.round(q2*sh))));x.fillRect(cx+dx,by-79-v,1,1)}}
 for(const sd of[-1,1])for(let k=0;k<3;k++){x.fillStyle=rgb(k<2?[178,188,212]:[70,80,110]);x.fillRect(cx+sd*(15+1+k),by-79-k,2,1)}
 x.fillStyle=rgb([228,182,72]);x.fillRect(cx-1,by-103,2,8);x.fillRect(cx-4,by-105,8,2);x.fillRect(cx-2,by-107,4,2);x.fillRect(cx-1,by-109,2,2);
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

// the four kingdom rooms' door anchors, matching the buildings placed below
const KINGDOM={tavern:[142.0,87.0],library:[127.6,71.6],smithy:[129.4,89.2],chapel:[149.0,83.8]};
// ================= put up the kingdom =================
function buildCastle(){
 const wall=(a,b,ax)=>put(a,b,wallSeg(ax),0,.04);
 // the curtain walls are continuous, not segmented: circle colliders along their runs,
 // leaving only the two gate arches open, the way real curtain walls have no doorways
 const wallLine=(a0,b0,a1,b1,r)=>{const n=Math.ceil(Math.hypot(a1-a0,b1-b0)*16/(r*1.4));
  for(let k=0;k<=n;k++){const t=k/n;addSolid(a0+(a1-a0)*t,b0+(b1-b0)*t,{c:[0,0,r]},{sol:1})}};
 wallLine(WARD.a0,WARD.b0,134.9,WARD.b0,7);wallLine(138.1,WARD.b0,WARD.a1,WARD.b0,7);
 wallLine(WARD.a0,WARD.b1,134.9,WARD.b1,7);wallLine(138.1,WARD.b1,WARD.a1,WARD.b1,7);
 wallLine(WARD.a0,WARD.b0,WARD.a0,WARD.b1,7);wallLine(WARD.a1,WARD.b0,WARD.a1,WARD.b1,7);
 // the rope bridge over from the observatory rock, running south to north
 const B4={a0:136.5,b0:33.6,b1:43.4,sag:7,v:1};
 window.RB4=B4;
 objs.push({d:B4.a0+B4.b0+.02,x:Math.round(PF(B4.a0,(B4.b0+B4.b1)/2)[0]),y:Math.round(PF(B4.a0,(B4.b0+B4.b1)/2)[1]),ph:0,t:0,sp:null,
  draw:c=>ropeSegB(c,B4.b0,B4.b1,B4)});
 // ---------- the walls of the upper ward, with a gate at either end of the avenue
 const W=WARD;
 for(const a of[126.5,128.5,130.5,132.6,140.4,142.4,144.4,146.4]){wall(a,W.b0,0);wall(a,W.b1,0)}
 for(let b=46.6;b<65;b+=2){wall(W.a0,b,1);wall(W.a1,b,1)}
 put(136.5,W.b0+.2,gateHouse('blue'),3,.05);
 put(136.5,W.b1+.2,gateHouse('red'),3,.05);
 put(W.a0,W.b0,roundTower(1),3,.05);put(W.a1,W.b0,roundTower(1),3,.05);
 put(W.a0,W.b1,roundTower(2),3,.05);put(W.a1,W.b1,roundTower(2),3,.05);
 // the old pair of coals at the bridge mouth, outside the gate
 put(134.4,43.2,brazier(),2,.05);put(138.6,43.2,brazier(),2,.05);
 // ---------- inside the ward: the keep, the court, the towers that were always here
 put(131.4,50.4,lamp(),0,.05);put(141.6,50.5,lamp(),0,.05);
 put(128.6,51.2,bannerPole(),0,.05);put(144.3,51.3,bannerPole(),0,.05);
 put(126.8,57.4,keepTower(),3,.05);put(144.2,57.6,keepTower(),3,.05);
 put(136.5,53.3,keep(),3,.05);
 put(131.6,59.2,brazier(),2,.05);put(141.4,59.3,brazier(),2,.05);
 put(131.8,58.5,bench(0,0),0);
 // the formal garden to the east of the court: clipped hedges, topiary, a sundial of stars
 for(let k=0;k<4;k++){put(143.5+k*1.0,47.2,hedge(0),0);put(143.5+k*1.0,51.0,hedge(0),0)}
 put(142.6,49.1,hedge(1),0);put(147.2,49.1,hedge(1),0);
 put(144.4,49.1,topiary(0),0);put(145.6,49.1,topiary(1),0);put(146.4,48.5,starStone(3),0);
 put(144.0,52.6,bench(1),0);
 // the armoury to the west: two houses with their roofs lit, a rack of banners
 put(127.4,48.6,house(5,2),3);put(127.6,52.6,house(2,3),3);
 for(const[a,b]of[[129.4,45.8],[129.4,63.6],[146.6,63.6],[146.6,46.2]])put(a,b,lamp(),0);
 // the training yard south of the court
 put(133.2,62.6,bannerPole(),0);put(139.8,62.6,bannerPole(),0);put(130.6,63.4,crates(),0);put(142.6,63.2,barrel(),0);
 for(const[a,b]of[[129.0,57.0],[128.8,60.4],[144.0,61.0]])put(a,b,bush('g',seed1(a|0,b|0),false),0);
 // ---------- the grand avenue and the town square
 put(SQUARE[0],SQUARE[1],fountain(),3,.05);
 for(let b=70;b<100;b+=5){put(134.2,b,lamp(),0);put(138.8,b,lamp(),0)}
 for(let b=71;b<97;b+=8){put(133.6,b,bannerPole(),0);put(139.4,b,bannerPole(),0)}
 put(133.8,68.4,lanternBearer(),3);put(139.2,68.4,lanternBearer(),3);
 // the market: stalls on both sides of the square, bunting strung between them
 [[130.6,75.2,0],[130.6,80.8,1],[142.4,75.2,2],[142.4,80.8,3],[133.2,73.4,1],[139.8,73.4,0]].forEach(([a,b,k])=>put(a,b,kstall(k),0));
 put(128.0,73.6,pole(),0);put(145.0,73.6,pole(),0);put(128.0,82.4,pole(),0);put(145.0,82.4,pole(),0);
 lanternString(128.0,73.6,145.0,73.6,6,6,52);lanternString(128.0,82.4,145.0,82.4,6,6,52);
 put(133.6,79.6,crates(),0);put(139.6,76.4,barrel(),0);put(130.0,78.6,hay(),0);put(143.4,78.4,wellS(),0);
 // ---------- the west side of the avenue: the library, houses, the smithy
 put(127.6,71.6,library(),3,.05);
 [[123.0,73.2,0,1],[121.2,81.8,1,2],[125.6,82.8,3,3],[130.6,86.6,2,4],[122.0,86.6,6,5],[130.8,95.2,5,6],[125.4,95.6,0,7]].forEach(([a,b,k,s])=>put(a,b,house(k,s),3));
 put(129.4,89.2,smithy(),3,.05);put(126.8,87.4,woodpile(),0);put(131.8,91.8,barrel(),0);
 // ---------- the east side: the chapel, the inn, the barracks, houses
 put(149.0,83.8,chapel(),3,.05);
 put(142.0,87.0,house(4,8),3);put(141.8,95.0,house(1,9),3);put(150.6,93.8,house(3,10),3);put(145.8,92.0,house(6,11),3);
 [[132.2,98.6,0,14],[143.8,99.4,2,15],[149.4,98.2,5,16],[133.0,83.4,2,17]].forEach(([a,b,k,sd])=>put(a,b,house(k,sd),3));
 put(147.8,77.0,signpost(),0);put(135.2,88.6,signpost(),0);
 // ---------- the Moon Maze: seven by seven cells, one way in, a quiet bench at the heart
 const M=MAZE,n=M.n,vw=[],hw=[],seen=new Set();
 for(let r=0;r<n;r++){vw.push(Array(n+1).fill(1));hw.push(Array(n+1).fill(1))}
 hw.push(Array(n+1).fill(1));
 const carve=(r,c,k)=>{seen.add(r*n+c);const dirs=[[0,1],[1,0],[0,-1],[-1,0]].map((d,q)=>[d,hh(r*7+c,k+q*13)]).sort((x,y)=>x[1]-y[1]).map(x=>x[0]);
  for(const[dr,dc]of dirs){const rr=r+dr,cc=c+dc;if(rr<0||cc<0||rr>=n||cc>=n||seen.has(rr*n+cc))continue;
   if(dc==1)vw[r][c+1]=0;else if(dc==-1)vw[r][c]=0;else if(dr==1)hw[r+1][c]=0;else hw[r][c]=0;carve(rr,cc,k+1)}};
 carve(3,3,5);hw[n][1]=0;
 for(let r=0;r<n;r++)for(let c=0;c<=n;c++)if(vw[r][c])put(M.a0+c,M.b0+r+.5,hedge(1),0);
 for(let r=0;r<=n;r++)for(let c=0;c<n;c++)if(hw[r][c])put(M.a0+c+.5,M.b0+r,hedge(0),0);
 put(M.a0+3.5,M.b0+3.5,fountain(),3);
 // ---------- the orchard terrace: rows of apple and cherry, hives, hay, a farmhouse, the mill
 for(let fi=155.2;fi<167;fi+=1.9)for(let fj=72.5;fj<88;fj+=1.9){const a=fi+(hh(fi*7,fj)-.5)*.3,b=fj+(hh(fj*5,fi)-.5)*.3;
  if(!inOrch(a,b)||Math.hypot(a-158.6,b-74.0)<4||Math.hypot(a-163.6,b-84.6)<3.4||roadD(a,b)<1.4||WD(a,b)>-.6||EDE(a,b)<1.2)continue;
  put(a,b,oak('g',8,seed1(a|0,b|0),hh(a,b)>.55?'cherry':undefined),1)}
 put(158.6,74.0,mill(),3,.05);millSails(158.6,74.0);
 put(163.6,84.6,house(1,12),3);put(165.4,81.4,hive(),0);put(166.0,82.6,hive(),0);put(160.4,87.2,hay(),0);put(162.2,88.0,hay(),0);put(166.6,77.8,scarecrow(),0);
 // ---------- the meadow of finished lights: a ring of star stones, and long grass between them
 for(let q=0;q<9;q++){const an=q/9*6.283+.3;put(118.5+Math.cos(an)*3.6,63+Math.sin(an)*3.0,starStone(q%4),0)}
 put(118.5,63,starStone(2),0);
 for(const[a,b]of[[114.6,66.4],[122.4,59.6],[121.4,67.2],[115.4,59.4]])put(a,b,pine('g',8,seed1(a|0,b|0)),1);
 // ---------- the sky docks: piers out over the drop, and two airships riding at their moorings
 put(113.0,87.5,dockPier(7),0);put(113.0,94.5,dockPier(8),0);
 airshipLive(103.6,87.4,34,0,0);airshipLive(102.4,98.2,40,1,2.4);
 put(115.2,86.0,crates(),0);put(116.0,89.4,barrel(),0);put(115.0,96.8,crates(),0);put(117.8,92.6,woodpile(),0);put(119.4,85.2,house(6,13),3);
 for(const[a,b]of[[114.2,84.6],[114.2,98.4]])put(a,b,lamp(),0);
 // ---------- the spit: a dais, a lantern either side, and one empty chair facing the drop
 put(138.5,102.0,chairDais(),0);put(138.5,102.1,kingChair(),2,.05);
 put(136.4,100.6,lamp(),0);put(140.6,100.6,lamp(),0);
 // ---------- broken stone and old pines at the rim, the way a place this old settles
 for(let i=110;i<175;i++)for(let j=41;j<108;j++){
  const fi=i+hh(i*7,j*5)-.5,fj=j+hh(j*11,i*3)-.5;
  if(!LANDE(fi,fj)||WD(fi,fj)>-.6||roadD(fi,fj)<1.5||inWard(fi,fj)||inMaze(fi,fj)||inOrch(fi,fj)||inDocks(fi,fj)||inMeadow(fi,fj))continue;
  const e=EDE(fi,fj),q=hh(i*5,j*7);
  if(e<2.6&&q>.86)put(fi,fj,pine('g',7+((q*6)|0),seed1(i,j)),1);
  else if(q>.965)put(fi,fj,bush('g',seed1(i,j),false),0);
  else if(q<.012)put(fi,fj,RS(2,2,RK,seed1(i,j)),0)}
 objs.sort((a,b)=>a.d-b.d);
}
