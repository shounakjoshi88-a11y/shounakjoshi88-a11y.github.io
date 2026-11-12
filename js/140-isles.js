/* ================= THE SAKURA ISLE ================= */
function stoneLantern(){const key='sl';if(SPR[key])return SPR[key];
 const c=mk(20,42),x=c.getContext('2d'),S=[[176,172,164],[148,144,136],[116,112,106],[84,82,78]],R=(X,Y,w,h,col)=>px(x,X,Y,rgb(col),w,h);
 R(5,37,10,3,S[2]);R(5,37,10,1,S[0]);R(8,26,4,11,S[1]);R(8,26,1,11,S[0]);R(11,26,1,11,S[3]);
 R(3,23,14,3,S[1]);R(3,23,14,1,S[0]);R(3,25,14,1,S[3]);R(5,14,10,9,S[2]);R(5,14,10,1,S[1]);
 R(7,16,6,6,[255,206,110]);R(8,17,4,4,[255,238,176]);R(7,16,6,1,[120,76,34]);R(9,16,1,6,[150,98,44]);
 R(2,11,16,4,S[1]);R(2,11,16,1,S[0]);R(3,14,14,1,S[3]);R(5,8,10,3,S[1]);R(5,8,10,1,S[0]);disc(x,10,6,3,3,rgb(S[1]));R(9,2,2,3,S[0]);
 for(let k=0;k<26;k++)px(x,3+((hh(k,4)*14)|0),8+((hh(4,k)*30)|0),rgb(hh(k,1)>.5?S[3]:S[0]));
 for(let k=0;k<8;k++)px(x,4+k*2,37+(k&1),rgb([78,128,62]),2,1);
 return SPR[key]={c,ox:10,oy:39,sh:[0,1,9,3],gl:[[10,19,34]]}}
function torii(axis){const key='tor'+axis;if(SPR[key])return SPR[key];
 const c=mk(96,84),x=c.getContext('2d'),H=46,d=axis?[32,16]:[-32,16],A=axis?[24,52]:[72,52],B=[A[0]+d[0],A[1]+d[1]];
 const pillar=P=>{for(let X=-2;X<=2;X++)for(let Y=-H;Y<=0;Y++){px(x,P[0]+X,P[1]+Y,rgb(X<-1?[216,66,48]:X<1?[190,50,38]:[130,32,26]));}
  px(x,P[0]-3,P[1]-4,rgb([30,24,24]),7,5);px(x,P[0]-3,P[1]-4,rgb([60,50,48]),1,5)};
 pillar(axis?A:B);pillar(axis?B:A);
 const nu=A[1]+0,beam=(off,th,cols,t0,t1,curve)=>{for(let q=0;q<=90;q++){const t=lerp(t0,t1,q/90),X=Math.round(A[0]+d[0]*t),Y=Math.round(A[1]+d[1]*t-H+off-curve*Math.pow(Math.abs(t-.5)*2,2));for(let k=0;k<th;k++)px(x,X,Y+k,rgb(cols[Math.min(k,cols.length-1)]))}};
 beam(11,3,[[210,60,44],[184,48,36],[130,32,26]],0,1,0);                 // nuki
 beam(-4,2,[[44,36,38],[30,24,26]],-.26,1.26,4.2);                        // kasagi cap
 beam(-2,4,[[206,58,42],[188,50,38],[170,44,34],[130,32,26]],-.22,1.22,3.4);
 px(x,Math.round(A[0]+d[0]*.5)-1,Math.round(A[1]+d[1]*.5)-H,rgb([180,48,36]),3,12);
 return SPR[key]={c,ox:Math.round((A[0]+B[0])/2),oy:Math.round((A[1]+B[1])/2)+1,sh:[0,3,30,9],gl:[]}}
function pole(){if(SPR.pole)return SPR.pole;const c=mk(10,62),x=c.getContext('2d');px(x,4,5,'#5a3e24',3,56);px(x,4,5,'#8a6238',1,56);px(x,2,3,'#3a2818',7,3);px(x,3,59,'#3a2818',5,2);return SPR.pole={c,ox:5,oy:59,sh:[0,1,4,2]}}
// ---- true-3D building blocks in the village's 2:1 projection: i runs down-right, j down-left, z up ----
const IP=(o,i,j,z)=>[o[0]+i-j,o[1]+(i+j)/2-z];
function ibox(g,o,i0,i1,j0,j1,z0,z1,cT,cL,cR,fT,fL,fR){
 const ec=(f,d)=>(s,t,X,Y)=>{const r=f&&f(s,t,X,Y);return rgb(r||d)};
 para(g,IP(o,i0,j1,z1),[i1-i0,(i1-i0)/2],[0,z1-z0],ec(fL,cL));
 para(g,IP(o,i1,j1,z1),[j1-j0,-(j1-j0)/2],[0,z1-z0],ec(fR,cR));
 para(g,IP(o,i0,j0,z1),[i1-i0,(i1-i0)/2],[-(j1-j0),(j1-j0)/2],ec(fT,cT))}
// round pillar: lit from the left, rim-dark on the right, with an elliptical cap
function ipil(g,o,i,j,z0,z1,r,pal,hi){const c=IP(o,i,j,0);
 for(let dx=-r;dx<=r;dx++){const t=(dx+r)/(2*r),e=Math.sqrt(Math.max(0,1-(dx/r)*(dx/r))),yb=Math.round(c[1]-z0+r*.5*e),yt=Math.round(c[1]-z1);
  const col=t<.16?pal[3]:t<.34?pal[0]:t<.66?pal[1]:pal[2];
  for(let y=yt;y<=yb;y++){let k=1;if(hi)k=hi(t,y-yt);px(g,Math.round(c[0])+dx,y,rgb(col.map(v=>v*k)))}}
 disc(g,Math.round(c[0]),Math.round(c[1]-z1),r,Math.max(1,Math.round(r*.5)),rgb(pal[0].map(v=>v*.78)));disc(g,Math.round(c[0])-1,Math.round(c[1]-z1),r-1,Math.max(1,Math.round(r*.5)-1),rgb(pal[0]))}
// a hip roof as two visible slopes with a lifted eave, thick fascia and rafter ends
function hipRoof(g,o,z,E,T,rh,lift,pal,seed){
 const[cx,cy]=IP(o,0,0,z),C=[pal.m,pal.l,pal.d];
 const slope=(sd)=>{
  const x0=sd<0?-2*E:0,x1=sd<0?0:2*E,W=x1-x0;
  for(let x=Math.ceil(x0);x<=Math.floor(x1);x++){
   const s=(x-x0)/W,q=Math.abs(2*s-1),ly=Math.round(lift*q*q*q),
    e=sd<0?E*s:E*(1-s),
    yb=Math.round(e-ly),
    inner=sd<0?(x<-2*T?lerp(0,-rh,(x+2*E)/(2*E-2*T)):lerp(-rh,T-rh,(x+2*T)/(2*T))):(x<=2*T?lerp(T-rh,-rh,x/(2*T)):lerp(-rh,0,(x-2*T)/(2*E-2*T))),
    yt=Math.round(inner);
   for(let y=yt;y<=yb;y++){
    const t=(y-yt)/Math.max(1,yb-yt),row=Math.floor(t*6.5+(sd<0?s*.4:0)),ft=t*6.5-row,col=Math.floor((s*E*.55)+(row&1)*.5),fs=s*E*.55+(row&1)*.5-col;
    let k=sd<0?1.08:.74;let c0=C[((hh(col+seed,row)*3)|0)%3].map(v=>v*k);
    if(ft<.2)c0=c0.map(v=>v*.62);else if(ft>.82)c0=c0.map(v=>Math.min(255,v*1.18));
    if(fs<.1)c0=c0.map(v=>v*.78);
    if(y<=yt+1)c0=pal.h.map(v=>v*(sd<0?1:.8));
    px(g,cx+x,cy+y,rgb(c0))}
   // fascia: the thickness of the eave, with a row of rafter ends beneath it
   for(let f=1;f<=3;f++)px(g,cx+x,cy+yb+f,rgb(pal.f.map(v=>v*(sd<0?1:.72)*(f==3?.55:1))));
   if(x%3==0)px(g,cx+x,cy+yb+2,rgb([190,150,96].map(v=>v*(sd<0?1:.7))))}};
 slope(-1);slope(1);
 // the ridge cap
 for(let k=-2*T;k<=2*T;k++){const yy=Math.round(T-rh-Math.abs(k)/2+T*0);px(g,cx+k,cy-rh+Math.round(Math.abs(k)/2)-1,rgb(pal.h))}
 // corner tips: gold bells on the three visible corners
 for(const[kx,ky]of[[-2*E,-lift],[0,E-lift],[2*E,-lift]]){px(g,cx+kx-1,cy+ky-3,rgb(pal.h),3,2);px(g,cx+kx,cy+ky+3,rgb([96,84,70]),1,2);px(g,cx+kx-1,cy+ky+5,rgb([236,196,104]),3,2);px(g,cx+kx,cy+ky+5,rgb([255,232,160]),1,1)}}


function pagoda(){
 if(SPR.pag)return SPR.pag;
 const W=156,H=292,o=[78,244],c=mk(W,H),g=c.getContext('2d');
 const RED=[190,78,56],WALL=[240,230,206],TIMB=[130,88,56],INK=[52,34,26],GOLD=[236,196,106],GOLDL=[255,236,176];
 const TILE={m:[58,68,92],l:[84,96,124],d:[36,42,60],h:[142,154,178],f:[22,26,38]};
 const stone=(sh)=>(s,t,X,Y)=>{const r=Math.floor(t*4),off=(r&1)*.5,cc=Math.floor(s*9+off),f=s*9+off-cc,q=hh(cc,r+3);let k=sh*(.9+q*.2);if(t*4-r<.12||f<.06)k*=.72;return [172*k,160*k,138*k]};
 // two-course stone terrace
 ibox(g,o,-36,36,-36,36,0,7,[196,184,160],[150,140,118],[104,96,80],null,stone(1),stone(.72));
 ibox(g,o,-31,31,-31,31,7,13,[206,194,170],[164,152,128],[112,104,86],null,stone(1.05),stone(.74));
 // steps down the +j and +i faces
 for(let k=0;k<4;k++){ibox(g,o,-8,8,31+k*2,33+k*2,0,13-k*3-1,[218,208,184],[176,166,142],[120,112,94]);ibox(g,o,31+k*2,33+k*2,-8,8,0,13-k*3-1,[218,208,184],[176,166,142],[120,112,94])}
 const gl=[];
 let z=13;
 const spec=[[15,26,8,6.4],[13.4,24,7.4,6.2],[12,23,6.8,6],[10.6,22,6.4,5.8],[9.2,21,6,5.6]];
 spec.forEach(([hw,h,ov,rh],n)=>{
  const wallF=(kk)=>(s,t,X,Y)=>{const Wd2=hw*2,u=s*Wd2,v=t*h;
   let col;
   if(v<4.5)col=(Math.floor(u/3)%2?[92,60,38]:[142,98,62]);
   else if(v>h-3)col=[110,72,44];
   else if(u<2.2||u>Wd2-2.2||Math.abs(u-Wd2/2)<1.1)col=[RED[0]*.92,RED[1]*.92,RED[2]*.92];
   else{const wx=u>Wd2*.3&&u<Wd2*.7&&v>h*.3&&v<h*.74;
    if(wx){const lx=(u-Wd2*.3)/(Wd2*.4),ly=(v-h*.3)/(h*.44);col=(Math.abs(lx*4-Math.round(lx*4))<.1||Math.abs(ly*3-Math.round(ly*3))<.1)?[120,82,52]:[250,204,118].map((q,ci)=>q*(1-ly*.3)*(ci==2?.8:1))}
    else{const q=hh(Math.floor(u),Math.floor(v));col=WALL.map(m=>m*(.96+q*.06))}}
   return col.map(v2=>v2*kk)};
  // gallery slab and rail
  ibox(g,o,-hw-4,hw+4,-hw-4,hw+4,z,z+2,[150,104,66],[120,82,52],[84,56,36]);
  ibox(g,o,-hw,hw,-hw,hw,z+2,z+h,RED.map(v=>v*1.1),[236,226,200],[168,158,138],null,wallF(1),wallF(.7));
  const railF=(kk)=>(s2,t)=>{const u=s2*(hw+4)*2;return (t<.22||Math.floor(u)%4==0)?rgb([132*kk,88*kk,56*kk]):null};
  para(g,IP(o,-hw-4,hw+4,z+7),[2*(hw+4),(hw+4)],[0,5],railF(1));
  para(g,IP(o,hw+4,hw+4,z+7),[2*(hw+4),-(hw+4)],[0,5],railF(.72));
  // soft shadow the eave throws on the wall below it
  gl.push([o[0]-(hw)*.2,o[1]+hw*.5*0-(z+h*.5)+ (hw)*.5,Math.round(14+n)]);
  hipRoof(g,o,z+h,hw+ov,hw*.34+2,rh*1.15,Math.round(4+ov*.3),TILE,n*3+1);
  z=z+h+Math.round(rh*1.15)-2});
 // spire: mast, nine rings, jewel
 const top=IP(o,0,0,z);
 px(g,top[0]-1,top[1]-34,rgb([96,80,52]),3,38);px(g,top[0]-1,top[1]-34,rgb(GOLD),1,38);
 for(let k=0;k<9;k++){const yy=top[1]-4-k*3.6,w2=13-k;px(g,top[0]-(w2>>1),Math.round(yy),rgb(GOLD),w2,2);px(g,top[0]-(w2>>1)+1,Math.round(yy)+1,rgb([176,134,56]),w2-2,1);px(g,top[0]-(w2>>1),Math.round(yy),rgb(GOLDL),Math.max(1,w2>>2),1)}
 disc(g,top[0],top[1]-40,4,4,rgb(GOLD));disc(g,top[0]-1,top[1]-41,2,2,rgb(GOLDL));px(g,top[0]-1,top[1]-44,rgb([255,248,220]),2,2);
 // wind bell swinging off the lowest roof corner is drawn live (see sprites)
 // lit windows
 return SPR.pag={c,ox:o[0],oy:o[1]+34,sh:[-46,-14,92,12],gl:[[o[0],o[1]-40,28],[o[0],o[1]-72,22],[o[0],o[1]-104,17]]}}

function hermit(){if(SPR.her)return SPR.her;
 const c=mk(80,96),g=c.getContext('2d'),o=[40,76],TL={m:[70,98,60],l:[96,128,76],d:[48,70,44],h:[130,160,100],f:[34,48,32]};
 const pl=k=>(s,t)=>(Math.floor(s*12)%2?[138,102,66]:[152,114,78]).map(q=>q*k);
 const wL=(s,t)=>{if(s>.28&&s<.72&&t>.28&&t<.62){const x=(s-.28)/.44,y=(t-.28)/.34;return(Math.abs(x-.5)<.05||Math.abs(y-.5)<.06)?[96,64,40]:[255,214,128]}return pl(1)(s,t)};
 const wR=(s,t)=>{if(s>.36&&s<.66&&t>.34)return(s>.58&&s<.62&&t>.6&&t<.66)?[240,200,120]:[66,42,26];return pl(.78)(s,t)};
 ibox(g,o,-12,12,-12,12,0,3,[134,128,112],[108,102,88],[80,76,66]);
 ibox(g,o,-10,10,-10,10,3,20,[150,112,76],[150,112,76],[112,80,52],null,wL,wR);
 ibox(g,o,3,7,-8,-4,18,36,[116,112,102],[98,94,86],[72,68,62]);
 hipRoof(g,o,20,16,5,10,3,TL,3);
 for(const[x,y]of[[22,60],[26,66],[30,70],[52,64],[56,58],[34,64]])px(g,x,y,rgb([88,132,70]),3,2);
 return SPR.her={c,ox:40,oy:82,gl:[[o[0]-7,o[1]-10,20]],sh:[-16,2,32,10]}}
function teahouse(){if(SPR.tea)return SPR.tea;
 const a=40,wh=20,H=18;
 const wall=(face,u,v,tot)=>{const k=face==0?1:.66;
  if(v<3)return(((u>>2)&1)?[150,112,74]:[170,130,88]).map(q=>q*k);if(v==3)return[88,60,38].map(q=>q*k);
  const SH=face==1?[[5,10],[17,10],[29,8]]:[[8,10],[22,10]];
  for(const[u0,w]of SH)if(u>=u0&&u<u0+w&&v>=6&&v<wh-3){const uu=u-u0,vv=v-6;if(uu%5==0||vv%5==0||uu==w-1)return[104,70,44].map(q=>q*k);return[252,240,208].map(q=>q*(face?.9:1))}
  if(face==0&&v>=wh){const du=Math.abs(u-a/2),hv=v-wh,ex=du*du+(hv-6.5)*(hv-6.5);if(du<4&&hv>2&&hv<11&&ex<11)return ex<6.5?[255,226,150]:[96,66,40];if(du<1.2)return[92,60,36].map(q=>q*k);return[236,224,196].map(q=>q*k)}
  if(u<2||u>=a-2||(v>=wh-3&&v<wh))return[92,60,36].map(q=>q*k);
  return(((u%12)<1)?[120,84,52]:[238,228,200]).map(q=>q*k)};
 return SPR.tea=box({a,wh,H,wall,roof:[[74,98,92],[92,118,108],[116,142,130]],rowH:3,colW:5,moss:1,trim:[230,214,176],sh:[18,6,46,18],top:36,bot:14,
  glow:[{face:1,u:5,v:6,w:10,h:11,r:18},{face:1,u:17,v:6,w:10,h:11,r:18},{face:0,u:8,v:6,w:10,h:11,r:18},{face:0,u:18,v:wh+4,w:4,h:4,r:14}]})}
function bamboo(seed){const key='bam'+seed;if(SPR[key])return SPR[key];
 const c=mk(40,100),x=c.getContext('2d');
 for(let s=0;s<6;s++){const bx=7+s*5+((hh(s,seed)*3)|0),top=6+((hh(seed,s+2)*26)|0),lean=(hh(s,seed+4)-.5)*7,seg=10+(s&1)*2;
  for(let y=96;y>top;y--){const t=(96-y)/(96-top),X=Math.round(bx+lean*t*t),node=(96-y)%seg<1;
   px(x,X,y,node?'#4a7a3a':(s&1)?'#7cb264':'#68a052',2,1);px(x,X+2,y,'#3e6a34',1,1);if(!node&&(y+s)%3==0)px(x,X,y,'#9ccc7c',1,1);
   if(node&&t>.25)for(let q=0;q<3;q++){const dir=q%2?1:-1,L=5+q;ln(x,X,y,X+dir*L,y-2-q,'#5f9a4c');ln(x,X+dir*L,y-2-q,X+dir*(L+3),y-1-q,'#86bf6a')}}}
 return SPR[key]={c,ox:20,oy:96,sh:[0,1,10,3]}}
function postbox(){if(SPR.pb)return SPR.pb;const c=mk(16,30),x=c.getContext('2d');
 cyl(x,8,24,5,2,18,[[232,74,58],[196,52,42],[142,34,30]],[240,96,74]);px(x,5,10,'#1a1412',6,1);px(x,7,14,rgb([250,236,200]),3,3);px(x,8,13,rgb([250,236,200]),1,5);px(x,3,24,rgb([60,40,32]),10,2);
 return SPR.pb={c,ox:8,oy:24,sh:[0,1,6,2]}}
// a floating rock with a tree or a shrine on it, drifting in the gap between the isles
function rockIslet(seed,kind){const key='isl'+seed+kind;if(SPR[key])return SPR[key];
 const c=mk(120,150),x=c.getContext('2d'),cx=60,top=76,R=34,ah=17;
 for(let dx=-R;dx<=R;dx++){const t=1-Math.abs(dx)/R,D=Math.round(8+46*Math.pow(t,1.2)+hh(dx+seed,3)*5),yb=top+Math.round(ah*Math.sqrt(Math.max(0,1-dx*dx/(R*R))));
  for(let v=0;v<D;v++){x.globalAlpha=clamp((D-v)/10,0,1);x.fillStyle=rgb(rockCol(dx+400+seed*17,v,dx<0?.9:.2,D,1));x.fillRect(cx+dx,yb+v,1,1)}}
 x.globalAlpha=1;
 for(let r=-ah;r<=ah;r++){const hw=Math.round(R*Math.sqrt(1-r*r/(ah*ah)));for(let dx=-hw;dx<=hw;dx++){const n=vn((cx+dx)*.2+seed,(top+r)*.3),g=GP.g[clamp(Math.floor(n*4.2+hh(dx,r)*.5),0,4)],ed=hw-Math.abs(dx)<2||r>ah-3;x.fillStyle=rgb(ed?mixc(g,[30,70,30],.35):g);x.fillRect(cx+dx,top+r,1,1)}}
 for(let k=0;k<24;k++){const fx_=cx-24+((hh(k,seed)*48)|0),fy_=top-6+((hh(seed,k)*14)|0),fc=['#ffd0e0','#ffffff','#ffd24a','#ff8fb8'][k&3];px(x,fx_,fy_,fc,2,1);px(x,fx_,fy_+1,'#3f9a3d',1,1)}
 if(kind==0){const o=oak('g',10,seed%4,'cherry');x.drawImage(o.c,cx-o.ox,top+2-o.oy)}
 else if(kind==1){const o=oak('a',9,seed%4);x.drawImage(o.c,cx-o.ox+8,top+4-o.oy);const o2=oak('g',7,1);x.drawImage(o2.c,cx-o2.ox-14,top+6-o2.oy)}
 else if(kind==2){const o=shrine();x.drawImage(o.c,cx-o.ox,top+8-o.oy)}
 else{const o=pine('g',10,seed%4);x.drawImage(o.c,cx-o.ox-8,top+3-o.oy);const l=stoneLantern();x.drawImage(l.c,cx-l.ox+12,top+8-l.oy)}
 return SPR[key]={c,ox:cx,oy:top+4}}
// ---- the observatory: a stone drum under a copper dome, with a barrel through the slit ----
function observatory(){if(SPR.obs)return SPR.obs;
 const W=120,H=156,c=mk(W,H),x=c.getContext('2d'),cx=60,by=134;
 const ST=[[214,206,188],[174,166,150],[124,118,106]],DOME=[[144,190,164],[102,150,128],[62,108,90],[36,70,60]];
 cyl(x,cx,by,36,18,10,ST,[208,200,182]);
 cyl(x,cx,by-10,26,14,44,[[206,198,180],[168,160,144],[116,110,98]],[200,192,174],
  (dx,v)=>{ // three courses of ashlar and two warm windows
   if(v%11==0)return [138,132,118];
   const win=(v>14&&v<25&&Math.abs(dx+9)<3)||(v>18&&v<29&&Math.abs(dx-13)<3);
   if(win&&dx>=-26&&dx<=26)return [252,204,120];
   if(hh(dx>>1,v>>2)>.82)return [152,146,132];
   return null});
 cyl(x,cx,by-54,29,15,4,[[202,194,176],[164,156,140],[120,114,102]],[210,202,184]);
 // the dome, with meridian ribs and one open slit
 const RR=29,RH=27,top=by-58;
 for(let yy=0;yy<=RH;yy++){const hw=Math.round(RR*Math.sqrt(Math.max(0,1-(yy/RH)*(yy/RH))));
  for(let dx=-hw;dx<=hw;dx++){
   const t=(dx+hw)/(2*hw+.001),rib=Math.abs((((dx+RR+4)%9)+9)%9-4)<.6;
   let col=yy<1?[182,220,198]:yy<3?[96,142,120]:t<.3?DOME[0]:t<.62?DOME[1]:DOME[2];
   const sh=(t<.3?1.1:t<.62?.94:.74)*(1-.12*(yy/RH));
   col=col.map(v=>v*sh);
   if(rib&&yy>3)col=col.map(v=>v*.86);
   if(yy<4&&t>.25)col=col.map(v=>Math.min(255,v*1.25));
   // the shutter runs up the right shoulder and stands open a crack
   const slit=dx>=6&&dx<=10;
   if(slit)col=[26,38,40];
   else if(dx==5)col=[204,238,218];
   else if(dx==11)col=[70,116,98];
   px(x,cx+dx,top-yy,rgb(col))}}
 px(x,cx-6,top-RH-2,'#8a8270',13,2);px(x,cx-1,top-RH-4,'#c8a45c',3,4);
 // finial
 px(x,cx-1,top-RH-4,'#6a5230',3,4);px(x,cx,top-RH-5,'#d8b872',2,2);
 // door, steps and a lamp
 px(x,cx-15,by-30,'#2a2018',12,20);px(x,cx-14,by-29,'#3a2c20',10,19);
 px(x,cx-9,by-14,'#e8c86a',2,3);px(x,cx-18,by-9,'#8a8270',18,3);px(x,cx-20,by-6,'#9a9280',22,3);
 // guy wires to the plinth
 for(const[X0,Y0]of[[-27,-64],[27,-64]])ln(x,cx+X0*.55,top+8,cx+X0,by-12,'rgba(210,220,214,.5)');
 return SPR.obs={c,ox:cx,oy:by,sh:[-32,2,64,12],gl:[[cx-9,by-24,22],[cx+13,by-20,22],[cx+27,top-RH*.9,14]]}}
// ---- a radio dish on a yoke, aimed at nothing in particular ----
function dish(){if(SPR.dish)return SPR.dish;
 const W=98,H=92,c=mk(W,H),x=c.getContext('2d'),cx=48,cy=40,R=27,r2=14;
 // concrete foot and the yoke
 px(x,cx-11,80,'#8e8a7c',22,5);px(x,cx-9,76,'#a29e90',18,4);
 px(x,cx-4,58,'#4a5258',8,20);px(x,cx-5,57,'#626c72',10,3);
 thick(x,cx,58,cx-11,44,'#3a4248',3);thick(x,cx,58,cx+11,44,'#3a4248',3);
 // a bowl, not a puddle: the inside darkens away from the light
 for(let v=-r2;v<=r2;v++)for(let u=-R;u<=R;u++){
  const q=(u*u)/(R*R)+(v*v)/(r2*r2);if(q>1)continue;
  const X=Math.round(cx+u+v*.5),Y=Math.round(cy+v*.92);
  const lit=clamp(.5-(u/R)*.42-(v/r2)*.36,0,1);
  const sh=.44+lit*.72+(1-q)*.12;
  x.fillStyle=rgb([196,204,196].map(z=>Math.min(255,z*sh)));x.fillRect(X,Y,1,1)}
 for(let v=-r2;v<=r2;v++)for(let u=-R;u<=R;u++){
  const q=(u*u)/(R*R)+(v*v)/(r2*r2);if(q>1)continue;
  if(q>.72){const X=Math.round(cx+u+v*.5),Y=Math.round(cy+v*.92);
   const lit2=clamp(.5-(u/R)*.42-(v/r2)*.36,0,1);
   x.fillStyle=rgb([216,222,214].map(z=>z*(.7+lit2*.42)));x.fillRect(X,Y,1,1)}}
 // raking rim and the ribs
 for(let a=0;a<72;a++){const an=a/72*6.283,u=Math.cos(an)*R,v=Math.sin(an)*r2;
  const X=Math.round(cx+u+v*.5),Y=Math.round(cy+v*.92);
  px(x,X,Y,(Y<cy+3)?'#f2f6ee':'#7e8884')}
 for(const k of[.38,.7])for(let a=0;a<48;a++){const an=a/48*6.283,u=Math.cos(an)*R*k,v=Math.sin(an)*r2*k;
  px(x,Math.round(cx+u+v*.55),Math.round(cy+v*.88-u*.1),'#b8c0b8')}
 const fx=cx+9,fy=cy-15;
 thick(x,cx-R*.8,cy-1,fx,fy,'#5a6268',1);thick(x,cx+R*.8,cy+3,fx,fy,'#5a6268',1);thick(x,cx,cy+r2*.9,fx,fy,'#5a6268',1);
 px(x,fx-2,fy-2,'#626c72',5,5);px(x,fx-1,fy-1,'#d8b872',3,3);
 // one red telltale and a cable down the yoke
 px(x,cx+3,62,'#c8402c',2,2);ln(x,cx,66,cx-6,78,'#2a3036');
 return SPR.dish={c,ox:cx,oy:80,sh:[-18,2,36,7],gl:[[fx,fy,14]]}}
// ---- a lattice mast with one red lamp ----
function signalMast(){if(SPR.mast)return SPR.mast;
 const c=mk(30,70),x=c.getContext('2d'),cx=15,by=64;
 px(x,cx-1,17,'#4a5258',2,46);
 for(let y=21;y<58;y+=5){const hw=8-Math.round((y-21)/37*5);
  px(x,cx-hw,y,'#3a4248',hw*2,1);
  for(let s2=0;s2<5;s2++){const y2=y+s2,wd=hw-Math.round(s2*hw/5);px(x,cx-wd,y2,'#565f66',1,1);px(x,cx+wd,y2,'#565f66',1,1)}}
 for(const dx of[-8,-5,5,8])px(x,cx+dx,by-11,'#3a4248',2,11);
 px(x,cx-9,by-2,'#8a8676',19,3);
 px(x,cx-3,13,'#8a2c22',7,7);px(x,cx-2,14,'#ff5a3c',5,5);px(x,cx-1,15,'#ffd0b0',2,3);
 // a small yagi and a horn
 px(x,cx+2,33,'#5a6268',8,1);px(x,cx+6,30,'#5a6268',1,8);
 px(x,cx-10,44,'#626c72',6,4);px(x,cx-11,45,'#9aa4aa',1,2);
 ln(x,cx-4,56,cx-14,62,'rgba(210,220,214,.35)');ln(x,cx+4,56,cx+16,62,'rgba(210,220,214,.35)');
 return SPR.mast={c,ox:cx,oy:by,sh:[-8,1,16,3],gl:[[cx,15,22]]}}
function standingStone(sd){const key='ss'+sd;if(SPR[key])return SPR[key];
 const c=mk(18,44),x=c.getContext('2d'),h=26+sd*3,ww=5+((sd+1)%2);
 for(let y=0;y<h;y++){const t=y/h,w=Math.round(ww*(1-t*.32)+Math.sin(t*3+sd)*.5);
  for(let dx=-w;dx<=w;dx++){const q=(dx+w)/(2*w+.001);
   let col=q<.24?[180,176,162]:q<.7?[144,140,128]:[102,100,92];
   if(hh(dx+sd,y*3)>.87)col=[96,124,86];px(x,9+dx,42-y,rgb(col))}}
 // a carved mark facing the dome
 px(x,8,42-h+6,'#6e6a5c',3,1);px(x,9,42-h+7,'#6e6a5c',1,3);
 return SPR[key]={c,ox:9,oy:42,sh:[-6,1,12,3]}}
function tripod(){if(SPR.tri)return SPR.tri;
 const c=mk(52,54),x=c.getContext('2d'),bx=22,by=49,hy=22;
 thick(x,bx,hy+6,7,by,'#4a3a28',2);thick(x,bx,hy+6,38,by,'#4a3a28',2);thick(x,bx,hy+6,bx+2,by+2,'#5a4630',2);
 px(x,bx-5,hy,'#2e3438',11,5);px(x,bx-4,hy-1,'#4a5258',9,4);
 // the tube, brass rings, and the finder on top
 thick(x,bx-3,hy-3,bx+22,hy-17,'#33261e',7);
 thick(x,bx-2,hy-3,bx+22,hy-17,'#8a6a3a',5);
 thick(x,bx-1,hy-3,bx+22,hy-17,'#c8a45c',2);
 px(x,bx+19,hy-20,'#33261e',5,7);px(x,bx+21,hy-19,'#c8a45c',3,5);px(x,bx+22,hy-18,'#f6ecc0',1,3);
 thick(x,bx-1,hy-6,bx+6,hy-12,'#3a4248',2);
 // counterweight on the other side of the pier
 px(x,bx-13,hy-1,'#3a4248',6,5);px(x,bx-12,hy,'#626c72',4,3);
 ln(x,bx-8,hy+2,bx-2,hy+2,'#3a4248');
 return SPR.tri={c,ox:bx,oy:by,sh:[-8,1,16,3]}}
function drawCrane(c,X,Y,ph){
 const t=(T*.55+ph)%11,fish=t>8.2&&t<9.6,preen=t>4&&t<5.2;
 c.fillStyle='rgba(230,248,255,.35)';c.fillRect(X-5,Y,10,1);c.fillRect(X-3,Y+1,6,1);
 px(c,X-1,Y-12,'#3a3028',1,12);px(c,X+1,Y-12,'#3a3028',1,12);
 disc(c,X,Y-17,6,4,'#f6f4ee');disc(c,X-1,Y-16,5,3,'#e4e2da');px(c,X-7,Y-17,'#2a2624',4,2);px(c,X-9,Y-16,'#2a2624',3,2);
 let hx=X+5+Math.round(Math.sin(T*.7+ph)*.6),hy=Y-29;
 if(fish){const k=Math.sin((t-8.2)/1.4*Math.PI);hx=X+8+Math.round(k*3);hy=Y-29+Math.round(k*25)}else if(preen){hx=X-3;hy=Y-24}
 for(let q=0;q<=14;q++){const u=q/14;px(c,Math.round(lerp(X+4,hx,u)+Math.sin(u*Math.PI)*(fish?2:-2)),Math.round(lerp(Y-19,hy,u)),'#f6f4ee',2,2)}
 disc(c,hx,hy,2,2,'#f6f4ee');px(c,hx-1,hy-2,'#d83a2a',3,1);px(c,hx+2,hy,'#e8c850',4,1);px(c,hx,hy,'#1a1614',1,1);
 if(fish&&t>8.9&&t<9.1)splashAt(X+10,Y+2,3)}
function lanternString(a0,b0,a1,b1,n,sag,hgt){
 const[X0,Y0]=PF(a0,b0),[X1,Y1]=PF(a1,b1);
 objs.push({d:Math.max(a0+b0,a1+b1)+.12,x:Math.round((X0+X1)/2),y:Math.round((Y0+Y1)/2),ph:0,t:0,sp:null,draw:c=>{
  const Pt=t=>[lerp(X0,X1,t),lerp(Y0,Y1,t)-hgt+Math.sin(t*Math.PI)*sag+Math.sin(T*1.3+t*5)*.6];let prev=null;
  for(let q=0;q<=n*8;q++){const[X,Y]=Pt(q/(n*8)),cur_=[Math.round(X),Math.round(Y)];if(prev)ln(c,prev[0],prev[1],cur_[0],cur_[1],'#2a1c14');prev=cur_}
  for(let q=1;q<=n;q++){const[X0_,Y0_]=Pt(q/(n+1)),X=Math.round(X0_),Y=Math.round(Y0_),fl=.88+.12*Math.sin(T*5+q*2.1);
   px(c,X-2,Y,'#2a1c14',5,1);px(c,X-3,Y+1,rgb([236*fl,70*fl,48*fl]),7,5);px(c,X-2,Y+1,rgb([255*fl,150*fl,90*fl]),2,4);px(c,X-1,Y+2,rgb([255,226,150]),3,2);px(c,X-2,Y+6,'#2a1c14',5,1);
   GLW.push([X,Y+3,26])}}})}
// ---- the rope bridge: planks, rails and lanterns that sway, hung between the two isles ----
let _RB=null;
function buildBridge(){_RB=RB;
 for(let k=0;k<Math.ceil(RB.a1-RB.a0);k++){const s0=RB.a0+k,s1=Math.min(RB.a1,s0+1),[xm,ym]=PF((s0+s1)/2,RB.b);
  objs.push({d:(s0+s1)/2+RB.b+.02,x:Math.round(xm),y:Math.round(ym+8),ph:0,t:0,sp:null,draw:c=>ropeSeg(c,s0,s1,k==0,s1>=RB.a1,RB)})}
   // a lamp and a sign where the path meets the bridge on the village side, lamps on the sakura side
  put(61.0,18.4,lamp(),3);put(61.0,20.7,lamp(),3);put(59.6,21.6,signpost(),0);
  put(85.2,18.2,stoneLantern(),3);put(85.2,20.9,stoneLantern(),3);
  // the short east crossing, over the gap to the observatory rock
  _RB=RB2;
  for(let k=0;k<Math.ceil(RB2.a1-RB2.a0);k++){const s0=RB2.a0+k,s1=Math.min(RB2.a1,s0+1),[xm,ym]=PF((s0+s1)/2,RB2.b);
   objs.push({d:(s0+s1)/2+RB2.b+.02,x:Math.round(xm),y:Math.round(ym+8),ph:0,t:0,sp:null,draw:c=>ropeSeg(c,s0,s1,k==0,s1>=RB2.a1,RB2)})}
  _RB=null;
  put(118.0,28.3,stoneLantern(),3);put(124.2,28.0,stoneLantern(),3);put(118.0,31.7,stoneLantern(),3)}
function ropeSeg(c,s0,s1,first,last,B){
 const RB=B||_RB;
 const b=RB.b,P=(a,db)=>{const t=ropeT(a,RB),L=-RB.sag*4*t*(1-t),[x,y]=PF(a,b+db);return[x,y-L+Math.sin(T*1.1+a*.35)*.7]};
 const posts=[];for(let a=RB.a0;a<=RB.a1+.01;a+=2)if(a>=s0-1e-6&&(a<s1-1e-6||(last&&a<=s1+1e-6)))posts.push(a);
 const rail=(db,front)=>{c.fillStyle='#8a6a44';
  for(let a=s0;a<=s1+.001;a+=.1){const[x,y]=P(a,db);c.fillRect(Math.round(x),Math.round(y)-11,1,1);if(front)c.fillRect(Math.round(x),Math.round(y)-12,1,1)}
  for(const a of posts){const[x,y]=P(a,db);c.fillStyle='#4d3120';c.fillRect(Math.round(x)-1,Math.round(y)-13,3,14);c.fillStyle='#c18b56';c.fillRect(Math.round(x)-1,Math.round(y)-14,3,2);
   if(front&&Math.round((a-RB.a0)/2)%2==0){const f=.88+.12*Math.sin(T*5+a);c.fillStyle='#2a1c14';c.fillRect(Math.round(x),Math.round(y)-11,1,5);c.fillStyle=rgb([240*f,80*f,52*f]);c.fillRect(Math.round(x)-2,Math.round(y)-6,5,5);c.fillStyle='#ffe2a0';c.fillRect(Math.round(x)-1,Math.round(y)-5,3,3);GLW.push([x,y-3,24])}}};
 rail(-.62,false);
 for(let a=s0;a<s1+.001;a+=.06){const[x,y]=P(a,0),pi=Math.floor((a-RB.a0)/.2),seam=((a-RB.a0)%.2)<.06;
  for(let k=0;k<23;k++){c.fillStyle=(k<2||k>20)?'#5e3d21':seam?'#6e4526':['#b07a45','#a56f3c','#bb8650'][pi%3];c.fillRect(Math.round(x+11-k),Math.round(y-5.5+k*.5),1,3)}
  c.fillStyle='#3a2616';c.fillRect(Math.round(x+10),Math.round(y+3),2,2)}
 rail(.62,true)}
// ---- the sakura isle itself ----
const RESB=[[97.5,39.0,3.4],[108.5,22.6,2.6],[111,17,5.8],[91.5,33,4.6],[93.8,25.6,3.8],[99.4,24.6,1.3],[88.2,29.2,3.4],[104,31.5,6.2],[85.8,19.6,2],[104.3,40.2,2.2],[104,26.2,1.8]];
const ZB=(a,b)=>{if(Math.hypot(a-113,b-33)<8.5)return'sakura';if(a<97&&b<15.5)return'bamboo';if(a>110&&b>39)return'bamboo';if(Math.hypot(a-95,b-24.5)<4.4||Math.hypot(a-88.2,b-29.2)<3.4)return'plaza';return'grove'};
const okpB=(a,b)=>{if(!LANDB(a,b)||!landIn(a,b,1.3)||WD(a,b)>-1.15||pathD(a,b)<.75)return 0;for(const r of RESB)if(Math.hypot(a-r[0],b-r[1])<r[2])return 0;if(a<87.5&&Math.abs(b-19.5)<2)return 0;return 1};
function buildB(c){
 const FLB=[['#ffd0e0','#fff'],['#ffffff','#ffd24a'],['#c79bff','#fff'],['#ff9ec0','#fff6c8']];
 // ground detail: grass tufts, flower clumps, pebbles, loose petals
 for(let i=80;i<122;i++)for(let j=5;j<48;j++)for(let s=0;s<24;s++){
  const fi=i+hh(i*13+s,j+4)-.5,fj=j+hh(j*7+s,i+3)-.5;if(!LANDB(fi,fj)||WD(fi,fj)>-.6||fieldAt(fi,fj)<.45)continue;
  const[X0,Y0]=PF(fi,fj),X=Math.round(X0),Y=Math.round(Y0),q=hh(s+i*3,j*5),pal=MB;
  if(q>.972){const fc=FLB[(hh(i,j+s)*4)|0];for(let m=0;m<5;m++){const fx_=X+Math.round((hh(m,i+s)-.5)*12),fy_=Y+Math.round((hh(m,j+s*3)-.5)*6);px(c,fx_,fy_+1,rgb(pal[1]),1,2);px(c,fx_,fy_,fc[0],2,1);px(c,fx_,fy_-1,fc[0],1,1);px(c,fx_+1,fy_-1,fc[1],1,1)}}
  else if(q>.94){px(c,X,Y+1,'#8c9694',3,1);px(c,X,Y,'#b8c2c0',2,1);px(c,X+1,Y-1,'#dde4e2',1,1)}
  else if(q>.9){px(c,X,Y,'#ffc4d6',2,1);px(c,X+3,Y+1,'#ffe6ee',1,1);px(c,X-2,Y+2,'#ffb0c8',1,1)}
  else if(q>.46){for(let m=-2;m<=2;m++){const h=2+((hh(m+i*3,j+s)*3)|0);px(c,X+m,Y-h,rgb(pal[3+((m+s)&1)]),1,h)}px(c,X-1,Y,rgb(pal[0]),3,1);px(c,X,Y-4,rgb(pal[4]),1,1)}}
 // stepping stones on the gravel paths
 for(const p of PATHS.slice(7))for(let k=0;k<p.length-1;k++){const L=Math.hypot(p[k+1][0]-p[k][0],p[k+1][1]-p[k][1]),n=Math.floor(L/.5);
  for(let m=0;m<=n;m++){const t=m/Math.max(1,n),fi=lerp(p[k][0],p[k+1][0],t)+(hh(m,k+1)-.5)*.14,fj=lerp(p[k][1],p[k+1][1],t)+(hh(k+2,m)-.5)*.14;if(!LANDB(fi,fj))continue;
   const[X,Y]=PF(fi,fj);c.fillStyle='rgba(30,22,12,.3)';c.fillRect(Math.round(X)-5,Math.round(Y)+1,10,3);bl(c,Math.round(X),Math.round(Y),4+(m%2),2,ST,m+k*9)}}
 // trees and undergrowth, art directed by zone
 for(let i=82;i<121;i++)for(let j=6;j<46;j++)for(let s=0;s<3;s++){const fi=i+hh(i*13+s,j)-.5,fj=j+hh(j*7+s,i+3)-.5;if(!okpB(fi,fj))continue;
  const zb=ZB(fi,fj),e=EDB(fi,fj),k=hh(i*9,j*4+s),seed=(i*7+j*3+s)%4,r=hh(i*5+s,j*11);
  let p=zb=='sakura'?.3:zb=='bamboo'?.42:zb=='plaza'?0:.08+.17*sm(8,1,e)+.14*(vn(fi*.3,fj*.3)-.5);if(hh(i*3+s,j*5+1)>p)continue;
  if(zb=='bamboo'){put(fi,fj,bamboo(seed),4);continue}
  if(zb=='sakura')put(fi,fj,r<.78?oak('g',Math.round((9+Math.floor(k*6))/2)*2,seed,'cherry'):oak('a',Math.round((9+Math.floor(k*4))/2)*2,seed),1);
  else if(r<.3)put(fi,fj,oak('g',Math.round((9+Math.floor(k*5))/2)*2,seed,'cherry'),1);
  else if(r<.64)put(fi,fj,oak('a',Math.round((9+Math.floor(k*(e<4?8:5)))/2)*2,seed),1);
  else if(r<.8)put(fi,fj,pine('g',Math.round((8+Math.floor(k*3))/2)*2,seed),1);
  else put(fi,fj,bush('g',seed,hh(i,j)>.6),0)}
 for(let i=82;i<121;i++)for(let j=6;j<46;j++)for(let s=0;s<2;s++){const fi=i+hh(i*5+s,j*2)-.5,fj=j+hh(j*3+s,i+9)-.5;if(!okpB(fi,fj))continue;const p=hh(i*5+s,j*3+7),seed=(i+j*3+s)%5;
  if(p<.12)put(fi,fj,fern('g',seed),4);else if(p<.2)put(fi,fj,RS(3+Math.floor(hh(i,j+s)*5),2+Math.floor(hh(j,i+s)*2),RK,i+j),0);else if(p<.23)put(fi,fj,stump(seed%3),0)}
 put(96.4,38.6,deer(0),0);put(99.2,39.6,deer(1),0);put(98.0,40.8,deer(2),0);put(108.0,23.2,deer(1),0);put(109.6,24.0,deer(2),0);
 // the landmarks
 put(93.8,25.6,oak('g',18,2,'cherry'),1,.05);put(111,17,pagoda(),2,.05);put(91.5,33,teahouse(),2,.05);
 put(85.8,19.6,torii(0),2,.05);put(104.3,40.2,torii(1),2,.05);
 put(99.4,24.6,postbox(),0);put(98.4,22.6,bench(0),0);put(100.4,27.2,bench(1),0);put(96.4,30.6,bench(0),0);
 for(const[a,b]of[[88.6,18.2],[88.6,21.0],[92.6,19.0],[93.2,22.4],[97.4,22.4],[99.2,28.4],[108.8,35.4],[104.8,25.6],[103.2,37.8],[105.8,38.2],[108.4,21.8],[106.2,23.4],[100.0,34.8],[112.6,19.6],[110.2,13.2],[90.2,35.0],[87.0,31.8]])put(a,b,stoneLantern(),3);
 // rocks and reeds round the little pond
 for(let q=0;q<44;q++){const an=q/44*6.283;if(Math.abs(Math.cos(an))<.22)continue;let rr=6;while(rr>2&&WD(POND2[0]+Math.cos(an)*rr,POND2[1]+Math.sin(an)*rr)<=0)rr-=.1;
  const fi=POND2[0]+Math.cos(an)*(rr+.25),fj=POND2[1]+Math.sin(an)*(rr+.25);if(!LANDB(fi,fj))continue;
  if(hh(q,3)>.35)put(fi,fj,RS(3+Math.floor(hh(q,8)*4),2+Math.floor(hh(q,9)*2),RK,q),0);
  if(hh(q,4)>.45)put(POND2[0]+Math.cos(an+.08)*(rr+.05),POND2[1]+Math.sin(an+.08)*(rr+.05),reed(q%4),4)}
 // two cranes standing in the shallows
 for(const[a,b,ph]of[[101.1,34.3,0],[107.9,29.2,5]]){const[X,Y]=PF(a,b),px_=Math.round(X),py=Math.round(Y);objs.push({d:a+b+.02,x:px_,y:py,ph:0,t:0,sp:null,draw:cc=>drawCrane(cc,px_,py,ph)})}
 // string lanterns across the plaza
 for(const[a,b]of[[91.2,21.8],[97.6,27.6],[100.0,21.2],[96.0,19.8]])put(a,b,pole(),0);
 lanternString(91.2,21.8,96.0,19.8,3,7,52);lanternString(96.0,19.8,100.0,21.2,3,6,52);lanternString(91.2,21.8,97.6,27.6,4,9,52);lanternString(100.0,21.2,97.6,27.6,3,7,52);
 // small floating rocks drifting in the gap
 for(const[a,b,sd,kd]of[[69,8,1,0],[72,31,2,1],[66,40,3,2],[77,45,4,3],[90,2,5,0],[58,50,6,1]]){const sp=rockIslet(sd,kd),[X,Y]=PF(a,b),px_=Math.round(X),py=Math.round(Y);
  objs.push({d:a+b-12,x:px_,y:py,ph:0,t:0,sp:null,draw:cc=>{cc.drawImage(sp.c,px_-sp.ox,py-sp.oy+Math.round(Math.sin(T*.7+sd*1.9)*3));
   if(kd==2)GLW.push([px_-14,py-30,20])}})}
}
// ---- the observatory rock: cold stone, lichen, one copper dome, one dish ----
const plazaAt=(a,b)=>Math.hypot(a-133.4,b-26.2)<4.85;
const RESC=[[133.4,25.2,7.6],[139.0,31.0,3.4],[136.4,31.4,2.4],[128.6,32.8,3.2],[124.6,29.4,2.2],[129.8,23.4,2.2],[137.8,33.2,1.8],[143.0,25.6,2.6]];
const okpC=(a,b)=>{if(!LANDC(a,b)||!landIn(a,b,1.3)||WD(a,b)>-1.15)return 0;
 for(const r of RESC)if(Math.hypot(a-r[0],b-r[1])<r[2])return 0;return 1};
function buildC(c){
 // lichen, gravel and tiny alpine flowers
 for(let i=118;i<150;i++)for(let j=10;j<46;j++)for(let s=0;s<8;s++){
  const fi=i+hh(i*19+s,j+5)-.5,fj=j+hh(j*13+s,i+9)-.5;
  if(!LANDC(fi,fj)||WD(fi,fj)>-.6||plazaAt(fi,fj))continue;
  const[X0,Y0]=PF(fi,fj),X=Math.round(X0),Y=Math.round(Y0),q=hh(s+i*3,j*7);
  if(q>.976){px(c,X,Y,'#f0f4e8',1,2);px(c,X,Y-1,'#c8d0b0',2,1);px(c,X+1,Y-2,'#e8eefc',1,1)}
  else if(q>.94){px(c,X,Y+1,'#7d8680',3,1);px(c,X,Y,'#aab4ac',2,1);px(c,X+1,Y-1,'#ccd4cc',1,1)}
  else if(q>.88){px(c,X,Y,'#8aa07a',2,1);px(c,X+3,Y+1,'#6d8460',1,1)}
  else if(q>.5){for(let m=-2;m<=2;m++){const hg=2+((hh(m+i,j+s)*3)|0);px(c,X+m,Y-hg,rgb(MC[3+((m+s)&1)]),1,hg)}px(c,X-1,Y,rgb(MC[0]),3,1)}
 }
 // pines, birch, low scrub
 for(let i=119;i<149;i++)for(let j=11;j<45;j++)for(let s=0;s<2;s++){
  const fi=i+hh(i*11+s,j*3)-.5,fj=j+hh(j*7+s,i+13)-.5;if(!okpC(fi,fj))continue;
  const e=EDC(fi,fj),k=hh(i*7,j*5+s),seed=(i*3+j*5+s)%4,r=hh(i*5+s,j*9);
  const p=.09+.34*sm(9,1,e)+.14*(vn(fi*.3,fj*.3)-.5);
  if(hh(i*3+s,j*5+1)>p)continue;
  if(r<.52)put(fi,fj,pine('s',Math.round((8+Math.floor(k*5))/2)*2,seed),1);
  else if(r<.68)put(fi,fj,pine('g',Math.round((8+Math.floor(k*4))/2)*2,seed),1);
  else if(r<.84)put(fi,fj,oak('g',Math.round((9+Math.floor(k*4))/2)*2,seed,'birch'),1);
  else put(fi,fj,bush('g',seed,hh(i,j)>.5),0);
 }
 for(let i=119;i<149;i++)for(let j=11;j<45;j++)for(let s=0;s<2;s++){
  const fi=i+hh(i*5+s,j*2)-.5,fj=j+hh(j*3+s,i+9)-.5;if(!okpC(fi,fj))continue;
  const p=hh(i*5+s,j*3+7),seed=(i+j*3+s)%5;
  if(p<.2)put(fi,fj,fern('g',seed),4);
  else if(p<.3)put(fi,fj,RS(3+Math.floor(hh(i,j+s)*4),2+Math.floor(hh(j,i+s)*2),RK,i+j),0);
 }
 // the observatory, the dish, the mast
 put(133.4,25.2,observatory(),2,.06);
 put(139.0,31.0,dish(),2,.06);
 put(136.4,31.4,signalMast(),2,.06);
 put(129.8,23.4,tripod(),0);
 // a ring of standing stones round the back of the rock
 for(let q=0;q<7;q++){const an=q/7*6.283;put(128.6+Math.cos(an)*2.8,32.8+Math.sin(an)*2.2,standingStone(q%3),0)}
 put(131.6,34.2,bench(1),0);put(127.6,27.0,bench(0),0);
 put(124.7,29.0,signpost(),0);
 for(const[a,b]of[[127.0,30.6],[131.6,22.9],[136.0,24.8],[138.2,34.0],[127.6,23.2],[124.6,28.4],[124.6,31.6]])put(a,b,stoneLantern(),3);
 put(131.0,31.2,crates(),0);put(134.6,30.4,barrel(),0);
}
// ---- camera: down the village lane, then across the rope bridge to the sakura isle ----
const KS=[[8.6,6.4],[15.6,9.6],[14.6,12.8],[14.9,16.8],[21.6,20.2],[26.5,24.5],[33.6,24.6]];
const KB=[[33.6,24.6],[41,22.0],[51.4,19.0],[60,20.2],[70,19.5],[80,19.6],[88.5,20.8],[100.4,23.8]];
// the last leg: over the short stair, across the rock, up to the dome. f is written in so the
// camera is standing with each villager exactly when their chapter arrives.
const KC=[[7.00,100.4,23.8],[7.45,108.5,29.6],[7.80,117.0,30.6],[8.00,129.8,25.4],[8.45,133.2,26.8],[9.00,136.2,29.0],[9.45,122.0,42.0],[10.00,97.2,58.6]];
const crp=(p0,p1,p2,p3,t)=>{const t2=t*t,t3=t2*t;return .5*(2*p1+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3)};
let CAMT=[8.6,6.4];
function camAt(f){
 if(f<=6){const k=Math.min(5,Math.floor(f)),u=sm(0,1,f-k);return[lerp(KS[k][0],KS[k+1][0],u),lerp(KS[k][1],KS[k+1][1],u)]}
  if(f<=7){const u=sm(0,1,clamp((f-6)/.7,0,1)),s=u*(KB.length-1),k=Math.min(KB.length-2,Math.floor(s)),t=s-k,P=i=>KB[clamp(i,0,KB.length-1)];
  return[crp(P(k-1)[0],P(k)[0],P(k+1)[0],P(k+2)[0],t),crp(P(k-1)[1],P(k)[1],P(k+1)[1],P(k+2)[1],t)]}
 let i2=0;while(i2<KC.length-2&&f>KC[i2+1][0])i2++;
 const A=KC[Math.max(0,i2-1)],Bq=KC[i2],Cq=KC[Math.min(KC.length-1,i2+1)],Dq=KC[Math.min(KC.length-1,i2+2)];
 const t2=clamp((f-Bq[0])/Math.max(1e-4,Cq[0]-Bq[0]),0,1);
 return[crp(A[1],Bq[1],Cq[1],Dq[1],t2),crp(A[2],Bq[2],Cq[2],Dq[2],t2)]}
// ---- the two arched bridges (a plain one over the stream, a red one over the sakura pond) ----
const APAL=[{plank:['#b07a45','#a56f3c','#bb8650'],edge:'#5e3d21',seam:'#6e4526',post:'#3d2817',rail:'#4d3120',cap:'#c18b56',rope:'#8a5a33',cross:'#4a2f19'},
 {plank:['#b8402e','#a83626','#c44c36'],edge:'#6a1c14',seam:'#7a2218',post:'#5a1812',rail:'#b83a28',cap:'#e8c458',rope:'#d8c090',cross:'#4a1410'}];
function drawArch(c,A){const P=APAL[A.pal],i=A.i,L0=A.j0,L1=A.j1,lift=jj=>Math.round(Math.sin(Math.PI*(jj-L0)/(L1-L0))*A.h);
 c.fillStyle='rgba(6,26,36,.14)';for(let jj=L0+.2;jj<L1-.1;jj+=.4){const[x,y]=PF(i,jj);c.fillRect(x-10,y+6,21,2)}
 const n=Math.max(3,Math.round((L1-L0)/1.3));for(let q=1;q<n;q++){const jj=L0+(L1-L0)*q/n,[x,y]=PF(i,jj),L=lift(jj);c.fillStyle=P.post;c.fillRect(Math.round(x+9),Math.round(y+4-L),2,9);c.fillRect(Math.round(x-12),Math.round(y-6-L),2,8)}
 for(let jj=L0;jj<L1;jj+=.08){const[x,y]=PF(i,jj),L=lift(jj),pi=Math.floor((jj-L0)/.26),seam=((jj-L0)%.26)<.08;
  for(let k=0;k<23;k++){c.fillStyle=(k<2||k>20)?P.edge:seam?P.seam:P.plank[pi%3];c.fillRect(Math.round(x-11+k),Math.round(y-5.5+k*.5-L),1,3)}
  c.fillStyle=P.cross;c.fillRect(Math.round(x+10),Math.round(y-L+1),2,3)}}
function archRails(A){const P=APAL[A.pal];for(let jj=A.j0;jj<A.j1-.05;jj+=.85)for(const di of[-.78,.78]){const[x,y]=PF(A.i+di,jj);
 objs.push({d:A.i+di+jj+.02,x:Math.round(x),y:Math.round(y),ph:0,t:0,sp:null,draw:c=>{
  const L=Math.round(archLift(A.i,jj)),X=Math.round(x),Y=Math.round(y)-L;c.fillStyle=P.rail;c.fillRect(X,Y-9,2,10);c.fillStyle=P.cap;c.fillRect(X,Y-10,2,2);
  const[x2,y2]=PF(A.i+di,jj+.85),L2=Math.round(archLift(A.i,jj+.85)),Y2=Math.round(y2)-L2;if(jj+.85<A.j1){c.fillStyle=P.rope;for(let k=2;k<16;k++){const u=k/16;c.fillRect(Math.round(X+(Math.round(x2)-X)*u),Math.round(Y-8+(Y2-Y)*u),1,1)}}}})}}
const bridgeLift=(a,b)=>archLift(a,b)+ropeLift(a,b);
function bridgeRails(){for(const A of ARCH)archRails(A)}

// ================= THE EXPANDED VILLAGE (first island) =================
const PALS={ochre:[[176,150,88],[202,176,116],[228,204,148]],slate:[[92,84,74],[118,108,96],[148,136,122]],teal:[[44,92,88],[66,124,114],[92,154,140]],plum:[[92,44,66],[128,62,88],[164,86,112]],blue:[[50,70,110],[72,96,144],[98,126,178]],moss:[[70,92,52],[96,124,70],[126,156,92]],red:[[112,40,28],[160,58,36],[198,82,46]]};
function rimLight(c){const w=c.width,h=c.height,x=c.getContext('2d'),id=x.getImageData(0,0,w,h),d=id.data,o=new Uint8ClampedArray(d);
 const A=(X,Y)=>X<0||Y<0||X>=w||Y>=h?0:d[(Y*w+X)*4+3];
 for(let y=0;y<h;y++)for(let X=0;X<w;X++){const i=(y*w+X)*4;if(d[i+3]<200)continue;
  const up=A(X,y-1)<60,ur=A(X+1,y-1)<60,dn=A(X,y+1)<60,lf=A(X-1,y)<60;
  if(up||ur){o[i]=d[i]*1.16+12;o[i+1]=d[i+1]*1.14+9;o[i+2]=d[i+2]*1.04+2}
  else if(dn||lf){o[i]=d[i]*.7;o[i+1]=d[i+1]*.72;o[i+2]=d[i+2]*.78}}
 x.putImageData(new ImageData(o,w,h),0,0)}
function buildTown(){
 const H=(a,b,p)=>put(a,b,cottage(PALS[p]),2,.05);
 // north quarter: a market street running from the farm lane down to the pond road
 H(22.4,3.8,'ochre');H(28.2,3.6,'blue');H(23.2,10.8,'teal');H(29.6,11.0,'plum');H(23.0,15.0,'slate');H(30.2,15.2,'moss');
 put(26.5,12.6,wellS(),0);
 put(24.6,13.0,stall([212,120,48],[240,232,214]),1);put(28.5,13.6,stall([176,60,96],[240,232,214]),1);put(27.8,10.2,stall([60,120,132],[240,232,214]),1);
 for(const[a,b,f,t]of[[25.0,12.1,crates,0],[28.0,12.0,barrel,0],[24.4,9.8,flowerPot,0],[28.6,9.1,flowerPot,0],[25.6,14.5,barrel,0],[27.4,14.6,hay,0],[22.6,12.8,()=>bench(0),0],[30.4,13.4,()=>bench(1),0],[21.6,6.4,woodpile,0],[30.4,4.8,hay,0],[22.6,16.4,crates,0],[29.6,17.0,barrel,0],[27.2,2.4,laundry,4]])put(a,b,f(),t);
 for(const[a,b]of[[25.4,7.6],[27.2,7.6],[25.4,10.8],[27.6,11.6],[25.5,15.6],[27.4,15.8],[24.0,6.0],[29.4,6.2]])put(a,b,lamp(),3);
 put(27.2,13.8,dog(2),0);put(24.9,11.2,cat(),0);put(26.0,9.2,cat(),0);
 // south-west quarter: a snowed-in hamlet round a campfire
 H(17.6,26.0,'red');H(9.6,22.4,'blue');H(16.8,30.4,'plum');H(9.0,28.8,'ochre');H(11.8,35.2,'teal');
 put(18.6,36.6,lookout(),2,.05);put(13.4,31.8,campfire(),5);
 for(const[a,b,f,t]of[[12.0,31.2,()=>logS(1),0],[14.8,32.0,()=>logS(2),0],[12.4,32.8,()=>bench(0),0],[15.2,26.8,woodpile,0],[11.6,24.8,crates,0],[7.8,26.2,barrel,0],[13.2,36.6,hay,0],[19.2,28.0,laundry,4],[10.2,26.0,flowerPot,0],[14.6,24.6,barrel,0],[18.2,31.8,crates,0],[8.2,31.0,woodpile,0]])put(a,b,f(),t);
 for(const[a,b]of[[14.0,20.4],[12.4,23.0],[14.2,26.0],[11.8,29.0],[14.6,31.0],[12.2,33.6],[15.6,34.4],[16.4,22.6]])put(a,b,lamp(),3);
 put(13.8,28.4,dog(1),0);put(15.4,22.6,cat(),0);
}

function build(){
 bakeField();
 stc=mk(Wd,Ht);const c=stc.getContext('2d'),id=c.createImageData(Wd,Ht),d=id.data,SA=[[196,178,128],[178,160,112],[207,190,142]],DI=[[109,90,60],[125,104,69],[142,120,80]];
 wm=new Uint8Array(Wd*Ht);LM=new Uint8Array(Wd*Ht);let x0=1e9,y0=1e9,x1=0,y1=0;
  const yard=(a,b)=>{for(const[y0,y1,r]of YARDS)if(Math.hypot(a-y0,b-y1)<r+(vn(a*2,b*2)-.5)*.8)return 1;return 0};
 const dirt=(a,b)=>fieldAt(a,b)<.4+(vn(a*5,b*5)-.5)*.3;
 for(let y=0;y<Ht;y++)for(let x=0;x<Wd;x++){const fi=((x-OX)/16+(y-OY)/8)/2,fj=((y-OY)/8-(x-OX)/16)/2;const isl=LANDA(fi,fj)?1:LANDB(fi,fj)?2:LANDC(fi,fj)?3:LANDD(fi,fj)?4:0;if(!isl)continue;LM[y*Wd+x]=isl;
  const w=WD(fi,fj),o=(y*Wd+x)*4;let k,al=255;
  if(w>0){
     wm[y*Wd+x]=clamp(Math.round(w/3*255),1,255);
     if(GL.ok){k=[0,0,0];al=0}
     else{const dep=clamp(w/3.4,0,1),fn=vn(fi*4.6,fj*4.6)*.6+hh(x,y)*.4;
      k=mixc([216,198,160],[150,138,106],clamp(dep*1.7,0,1));
      k=mixc(k,[44,66,58],clamp((dep-.5)*2.1,0,1));
      if(fn>.88)k=mixc(k,[200,192,172],.5);
      else if(fn<.09)k=mixc(k,[84,88,74],.42);
      if(vn(fi*3.4+4,fj*3.4)>.66&&dep>.22)k=mixc(k,[48,104,62],.5)}
     if(x<x0)x0=x;if(y<y0)y0=y;if(x>x1)x1=x;if(y>y1)y1=y}
  else{const n=vn(fi*2.6,fj*2.6)*.55+vn(fi*8,fj*8)*.25+hh(x,y)*.28;
   if(w>-.5)k=SA[Math.floor(n*2.7)%3];
   else if(w>-.95)k=mixc(SA[Math.floor(n*2.7)%3],[94,82,60],.42);
   else if(isl==2)k=groundB(fi,fj,x,y,n,dirt(fi,fj));
    else if(isl==3)k=groundC(fi,fj,x,y,n,dirt(fi,fj));
    else if(isl==4)k=groundD(fi,fj,x,y,n,dirt(fi,fj));
    else if(dirt(fi,fj)){const pk=Math.floor(n*2.7)%3;k=DI[pk];if(hh(x,y)>.93)k=[154,132,92]}
   else{const rg=RG(fi,fj),zone=ZONE(fi,fj),gi=clamp(Math.floor(n*4.4+(vn(fi*.55,fj*.55)-.5)*1.5),0,4);
     if(zone==='field'){const row=Math.floor(fj*2.4),ck=Math.floor(hh(row,Math.floor(fi*3.2))*3);
      let col=[[226,198,120],[208,180,104],[240,216,142]][ck%3];
      if(hh(Math.floor(fi*3.2),row)>.86)col=mixc(col,[150,124,64],.35);
      if(Math.abs((fi*2)%1)<.13)col=mixc(col,[164,138,70],.45);
      k=col}
     else if(zone==='river'){k=GP[rg][gi];if(hh(x,y)>.93)k=mixc(k,[174,166,148],.5)}
     else{const lt=relief(fi,fj),g0=GP[rg][gi];k=[g0[0]*lt,g0[1]*lt,g0[2]*lt]}}}
  d[o]=k[0];d[o+1]=k[1];d[o+2]=k[2];d[o+3]=al}c.putImageData(id,0,0);wb=[x0,y0,x1-x0+1,y1-y0+1];wc=mk(wb[2],wb[3]);wi=wc.getContext('2d').createImageData(wb[2],wb[3]);
 // keep a copy of the pond floor so the water can bend light through it
 FLD=wc.getContext('2d').createImageData(wb[2],wb[3]);FLD.data.set(c.getImageData(wb[0],wb[1],wb[2],wb[3]).data);
 drawCliffs(c);
// ---- ground details ----
 const FL=[['#e8453c','#fff6c8'],['#ffd24a','#fff6c8'],['#ffffff','#ffd24a'],['#ff8fb8','#fff6c8'],['#8e7bff','#ffffff'],['#ff9a3c','#fff6c8']],LF=['#c2491f','#e2862b','#f1b445','#8a3217'];
 for(let i=0;i<VN;i++)for(let j=0;j<VN;j++)for(let s=0;s<16;s++){
  const fi=i+hh(i*13+s,j)-.5,fj=j+hh(j*7+s,i+3)-.5;if(!LANDA(fi,fj)||WD(fi,fj)>-.6||dirt(fi,fj))continue;
  const[X0,Y0]=PF(fi,fj),X=Math.round(X0),Y=Math.round(Y0),r=RG(fi,fj),q=hh(s+i,j*5),pal=GP[r];
  if(q>.962&&r!='s'){const fc=FL[Math.floor(hh(i,j+s)*6)];for(let m=0;m<6;m++){const fx_=X+Math.round((hh(m,i+s)-.5)*14),fy_=Y+Math.round((hh(m,j+s*3)-.5)*7);px(c,fx_,fy_+1,rgb(pal[0]),1,2);px(c,fx_,fy_,fc[0],2,1);px(c,fx_,fy_-1,fc[0],1,1);px(c,fx_+1,fy_-1,fc[1],1,1)}}
  else if(q>.93){px(c,X,Y,'#7d868a',2,1);px(c,X,Y-1,'#aab4b6',1,1);px(c,X+3,Y+1,'#656e72',2,1)}
  else if(q<.028&&r=='g'){px(c,X,Y,'#e9e1c8',1,3);px(c,X-1,Y-2,'#c8342c',3,2);px(c,X,Y-2,'#fff',1,1)}
  else if(r=='a'&&q<.4){px(c,X,Y,LF[Math.floor(hh(X,Y)*4)],2,1);px(c,X+3,Y+1,LF[Math.floor(hh(Y,X)*4)],1,1)}
  else if(r=='s'&&q<.34){px(c,X-2,Y,'#ffffff',5,1);px(c,X-1,Y+1,'#cfe4ee',3,1)}
  else if(q>.62){const a=pal[4],b=pal[1];px(c,X,Y,rgb(b),1,2);px(c,X-1,Y-1,rgb(a),1,2);px(c,X+1,Y-1,rgb(a),1,2);px(c,X,Y-2,rgb(a),1,1)}
  else if(q>.3){px(c,X,Y-1,rgb(q>.5?pal[4]:pal[0]),1,2)}}
 moreDetailA(c,dirt);
 // stepping stones
 const stones=p=>{for(let k=0;k<p.length-1;k++){const L=Math.hypot(p[k+1][0]-p[k][0],p[k+1][1]-p[k][1]),n=Math.floor(L/.48);for(let m=0;m<=n;m++){const t=m/Math.max(1,n),fi=lerp(p[k][0],p[k+1][0],t)+(hh(m,k+1)-.5)*.16,fj=lerp(p[k][1],p[k+1][1],t)+(hh(k+2,m)-.5)*.16,[X,Y]=PF(fi,fj);c.fillStyle='rgba(30,22,12,.38)';c.fillRect(Math.round(X)-5,Math.round(Y)+1,10,3);bl(c,Math.round(X),Math.round(Y),4+(m%2),2,ST,m+k*9)}}};
 stones(PATHS[0]);stones(PATHS[1]);stones(PATHS[2]);
 for(let k=8;k>=0;k--){const[X,Y0]=PF(11.4-k*.42,9.1),Y=(Y0-k*2.4)|0;for(let dy=-5;dy<5;dy++){const w=Math.round(10*(1-Math.abs(dy+.5)/5));c.fillStyle=dy>2?'#857d6c':k%2?'#b5ae9d':'#c2bba9';c.fillRect(X-w,Y+dy,w*2,1)}}
// ---- garden ----
 const BEDS=[[10.5,13.7,'cab'],[12.5,13.7,'car'],[10.5,14.95,'tom'],[12.5,14.95,'let'],[10.5,16.2,'pum'],[12.5,16.2,'cor']],BI=1.7,BJ=1.0,plants=[];
 for(const[i0,j0,ty]of BEDS){const cs=[PF(i0,j0),PF(i0+BI,j0),PF(i0,j0+BJ),PF(i0+BI,j0+BJ)],xa=Math.floor(Math.min(...cs.map(q=>q[0])))-1,xb=Math.ceil(Math.max(...cs.map(q=>q[0])))+1,ya=Math.floor(Math.min(...cs.map(q=>q[1])))-1,yb=Math.ceil(Math.max(...cs.map(q=>q[1])))+5;
  for(let pass=0;pass<2;pass++){const dy=pass==0?3:0;for(let y=ya;y<yb;y++)for(let x=xa;x<xb;x++){const yy=y-dy,fi=((x-OX)/16+(yy-OY)/8)/2,fj=((yy-OY)/8-(x-OX)/16)/2;if(fi<i0||fi>i0+BI||fj<j0||fj>j0+BJ)continue;
    if(pass==0){c.fillStyle='#4e361f';c.fillRect(x,y,1,1);continue}
    const ei=Math.min(fi-i0,i0+BI-fi),ej=Math.min(fj-j0,j0+BJ-fj);
    if(Math.min(ei,ej)<.07){const pl=Math.floor((ei<ej?fj*7:fi*7));c.fillStyle=(pl&1)?'#a87a46':'#c0925a';c.fillRect(x,y,1,1);continue}
    const rowf=(fi-i0-.07)*5.5,row=Math.floor(rowf),fr=rowf-row;let k=(row&1)?[84,58,36]:[108,76,46];if(fr<.22)k=[132,96,60];if(hh(x,y)>.92)k=[140,102,66];c.fillStyle=rgb(k);c.fillRect(x,y,1,1)}}
  const tall=ty=='tom'||ty=='cor',rowsI=tall?[1,5]:[1,3,5,7],stepJ=tall?.5:.3;
  for(const r of rowsI)for(let q=0;q*stepJ+.15<BJ;q++){const fi=i0+.07+(r+.5)/5.5,fj=j0+.15+q*stepJ+(hh(r,q)-.5)*.06;plants.push([fi,fj,ty])}}
 plants.sort((a,b)=>a[0]+a[1]-b[0]-b[1]);
 const CAB=[[40,90,60],[70,130,80],[110,170,110],[150,205,140],[190,230,170]],LET=[[60,120,40],[100,170,56],[140,206,80],[176,230,110],[210,246,150]];
 for(const[fi,fj,ty]of plants){const[X0,Y0]=PF(fi,fj),X=Math.round(X0),Y=Math.round(Y0),sd=Math.floor(fi*9+fj*5);
  if(ty=='cab'){c.fillStyle='rgba(20,14,8,.4)';c.fillRect(X-4,Y+1,9,2);bl(c,X,Y-1,4,3,CAB,sd);px(c,X-1,Y-3,rgb(CAB[4]),2,1)}
  else if(ty=='let'){c.fillStyle='rgba(20,14,8,.35)';c.fillRect(X-3,Y+1,7,2);bl(c,X,Y-1,3,2,LET,sd);px(c,X-3,Y,rgb(LET[3]));px(c,X+3,Y-1,rgb(LET[3]))}
  else if(ty=='car'){ln(c,X,Y,X-3,Y-4,'#3f9a3d');ln(c,X,Y,X,Y-5,'#5ab04a');ln(c,X,Y,X+3,Y-4,'#3f9a3d');ln(c,X+1,Y,X+2,Y-3,'#78c458');px(c,X,Y,'#f08a24',2,1);px(c,X,Y+1,'#d96a14',2,1)}
}
// ---- placements ----
 const dens=(fi,fj)=>{const z=ZONE(fi,fj);if(z=='field'||z=='orchard'||z=='river')return 0;
  const dc=Math.hypot(fi-14.6,fj-12.6),edge=EDA(fi,fj);
  let d=clamp(.16+.5*sm(3,8.5,dc)+.4*(vn(fi*.3,fj*.3)-.5)+.3*sm(7,1,edge),0,.92);
  if(z=='meadow')d*=.22;if(z=='clearing')d*=.3;if(z=='woods')d=clamp(d+.3,0,.95);if(z=='town')d*=.14;return d*.68};
 for(let i=0;i<VN;i++)for(let j=0;j<VN;j++)for(let s=0;s<3;s++){const fi=i+hh(i*13+s,j)-.5,fj=j+hh(j*7+s,i+3)-.5;if(!okp(fi,fj)||hh(i*3+s,j*5+1)>dens(fi,fj))continue;
  const rg=RG(fi,fj),dc=Math.hypot(fi-14.6,fj-12.6),e=EDA(fi,fj),k=hh(i*9,j*4+s),seed=(i*7+j*3+s)%4,zn=ZONE(fi,fj);let sp;
  if(zn=='woods'||rg=='s'||(rg=='g'&&hh(i,j*7)<.26&&dc>5))sp=pine(rg,Math.round((9+Math.floor(k*7)+(e<4?2:0))/2)*2,seed);
  else if(rg=='g'&&hh(i*4+1,j*3+s)<.07)sp=oak('g',Math.round((10+Math.floor(k*4))/2)*2,seed,'cherry');
  else if(rg=='g'&&hh(i*2,j+s)<.1)sp=oak('g',Math.round((9+Math.floor(k*4))/2)*2,seed,'birch');
  else sp=oak(rg,Math.round((10+Math.floor(k*(e<4?10:7)))/2)*2,seed);
  put(fi,fj,sp,1)}
 for(let i=0;i<VN;i++)for(let j=0;j<VN;j++)for(let s=0;s<2;s++){const fi=i+hh(i*5+s,j*2)-.5,fj=j+hh(j*3+s,i+9)-.5;if(!okp(fi,fj)||ZONE(fi,fj)=='field')continue;const p=hh(i*5+s,j*3+7),rg=RG(fi,fj),seed=(i+j*3+s)%5;
  if(p<.14)put(fi,fj,bush(rg,seed,hh(i,j)>.6),0);else if(p<.24&&rg!='s')put(fi,fj,fern(rg,seed),4);else if(p<.265)put(fi,fj,stump(seed%3),0);else if(p<.285)put(fi,fj,logS(seed%3),0);else if(p<.32)put(fi,fj,RS(3+Math.floor(hh(i,j+s)*5),2+Math.floor(hh(j,i+s)*2),RK,i+j),0)}
  // the orchard: rows, not scatter
  for(let r=0;r<7;r++)for(let c=0;c<9;c++){const fi=25.4+c*1.75,fj=33.2+r*1.45;
    if(!okp(fi,fj))continue;
    put(fi,fj,oak(RG(fi,fj),Math.round((7+Math.floor(hh(r,c)*3))/2)*2,(r*3+c)%4),1)}
  // the wheat field: rows of straw
  for(let r=0;r<24;r++)for(let cc=0;cc<34;cc++){const fi=3.8+cc*.28,fj=1.6+r*.3;
    if(ZONE(fi,fj)!='field')continue;
    const[X0,Y0]=PF(fi,fj),X=Math.round(X0),Y=Math.round(Y0);
    if(hh(cc,r)>.45)continue;
    px(c,X,Y,'#d8b25e',1,3);px(c,X,Y+3,'#a8853c',1,1)}
// pond: rocks + reeds
 for(let a=0;a<46;a++){const an=a/46*6.283;let rr=6.5;while(rr>2.2&&WD(POND[0]+Math.cos(an)*rr,POND[1]+Math.sin(an)*rr)<=0)rr-=.1;
  const fi=POND[0]+Math.cos(an)*(rr+.25),fj=POND[1]+Math.sin(an)*(rr+.25);
  if(Math.hypot(fi-27.4,fj-23.3)<1.8)continue;
  if(hh(a,3)>.35)put(fi,fj,RS(3+Math.floor(hh(a,8)*4),2+Math.floor(hh(a,9)*2),RK,a),0);
  if(hh(a,4)>.5){const ri=POND[0]+Math.cos(an+.08)*(rr+.05),rj=POND[1]+Math.sin(an+.08)*(rr+.05);put(ri,rj,reed(a%4),4)}}// buildings
 put(14.2,11.8,cottage(),2,.05);put(19.8,9.5,barn(),2,.05);put(16.6,12.0,coop(),0,.05);put(17.9,13.0,coop(),0,.05);
 put(11.8,7.6,cottage([[176,150,88],[202,176,116],[228,204,148]]),2,.05);
 put(36.9,20.6,cottage([[92,84,74],[118,108,96],[148,136,122]]),2,.05);
 put(8.6,4.4,windmill(),2,.05);
 put(19.4,21.8,boathouse(),2,.05);
 put(24.0,22.0,oak('g',8,1,'cherry'),1);put(24.3,21.6,RS(4,2,RK,7),0);
 put(34.4,10.8,shrine(),2,.05);put(51.0,15.6,hermit(),2,.05);{const[hx,hy]=PF(51,15.6);objs.push({d:51+15.6+.2,x:hx,y:hy,ph:0,t:0,sp:null,draw:c=>{for(let k=0;k<5;k++){const t=(T*.22+k/5)%1;c.fillStyle='rgba(214,208,196,'+((1-t)*.55).toFixed(2)+')';const s=(2+t*3)|0;c.fillRect((hx+11+Math.sin(T*.8+k*2)*2+t*7)|0,(hy-43-t*24)|0,s,s)}}})}put(52.5,17.0,woodpile(),0);put(49.9,17.4,stoneLantern(),3);put(52.6,14.4,stump(1),0);
 put(35.6,40.2,lookout(),2,.05);
 put(14.9,9.6,stall([196,72,52],[240,232,214]),1);put(16.9,10.4,stall([86,120,72],[240,232,214]),1);put(13.4,8.2,stall([72,96,124],[240,232,214]),1);
  WHEEL=put(35.3,22.9,millWheel(),1);SURF.spray={x:PF(35.3,22.9)[0]-26,y:PF(35.3,22.9)[1]+25};
 // props
 const PR=[[16.5,10.6,barrel,0],[16.9,10.9,barrel,0],[16.2,10.1,crates,0],[17.2,9.4,hay,0],[17.6,9.0,hay,0],[10.0,12.3,wellS,0],[15.5,13.6,lamp,3],[18.2,11.4,lamp,3],[12.4,13.3,pumpkinS,0],
  [9.3,10.0,()=>logS(1),0],[11.0,11.5,()=>logS(2),0],[10.0,10.5,campfire,5],[9.6,14.6,hive,0],[10.2,14.8,hive,0],[14.55,16.9,scarecrow,0],[15.8,13.9,signpost,0],[13.0,18.4,laundry,4],[16.55,12.55,cat,0],[17.2,17.9,()=>bench(0),0],[26.2,17.7,pier,0],[14.1,13.2,flowerPot,0],[12.9,13.2,flowerPot,0],[16.0,13.0,flowerPot,0],[18.3,10.2,woodpile,0],
  [12.6,8.9,barrel,0],[11.0,8.6,churn,0],[11.6,8.9,churn,0],[13.9,8.9,crates,0],[9.2,6.2,hay,0],[9.9,6.0,hay,0],[7.0,8.4,woodpile,0],[13.6,9.9,()=>bench(0),0],[17.4,10.9,crates,0],[15.0,10.9,flowerPot,0],
  [24.6,20.4,()=>logS(2),0],[25.4,19.4,barrel,0],[21.2,23.0,boat,0],[26.0,19.0,lamp,3],[28.8,19.4,lamp,3],[31.0,27.6,lamp,3],[33.4,22.6,lamp,3],[37.0,22.4,lamp,3],[42.0,22.9,lamp,3],[47.0,23.4,lamp,3],
  [33.9,22.5,barrel,0],[36.0,21.6,crates,0],[32.6,21.4,churn,0],[30.6,20.4,()=>bench(0),0],[34.9,10.1,birdhouse,0],[32.0,12.4,birdhouse,0],[35.2,39.0,()=>bench(0),0],[33.0,38.6,churn,0],
  [30.2,32.4,barrel,0],[29.0,33.6,hay,0],[31.6,34.4,hay,0],[22.0,26.4,()=>bench(1),0],[24.0,28.6,lamp,3],[28.4,30.2,()=>bench(0,1),0],[26.8,30.8,lamp,3],[20.0,23.4,()=>logS(1),0]];
 for(const[a0,b0,f,t]of PR){let a=a0,b=b0;
  // nothing but the boat and the jetty may stand in the pond: lamps, barrels and logs move up onto the bank
  if(f!==boat&&f!==pier){const dx=a-POND[0],dy=b-POND[1],L=Math.hypot(dx,dy);
   if(L<7.1&&WD(a,b)>-.7){let r=7.4;for(let q=0;q<6&&WD(POND[0]+dx/L*r,POND[1]+dy/L*r)>-.8;q++)r+=.2;a=POND[0]+dx/L*r;b=POND[1]+dy/L*r}}
  const o=put(a,b,f(),t);
  if(a0==26.2&&b0==17.7){o.surf=1;SURF.pier=o}
  if(a0==21.2&&b0==23.0){o.surf=1;SURF.boat=o}}
 // animals
 const FLOCK=[[31.0,30.2],[31.8,30.6],[32.6,30.0],[33.2,30.9],[30.4,31.2],[29.6,31.6],[32.0,32.0],[33.6,31.4]];
 for(let k=0;k<FLOCK.length;k++)put(FLOCK[k][0],FLOCK[k][1],sheep(k%4),0);
 for(let k=0;k<5;k++)put(6.6+k*1.3,9.4+(k%2)*.6,sheep((k+1)%4),0);
 put(12.4,9.2,dog(0),0);put(28.0,30.0,dog(3),0);put(17.6,14.6,dog(2),0);
 put(10.4,11.0,cart(),0);put(32.6,22.0,cart(),0);
 // garden crops that stand tall + pumpkins
 for(const[fi,fj,ty]of plants){if(ty=='tom')put(fi,fj,tomato(Math.floor(fi*5)%3),4);else if(ty=='cor')put(fi,fj,corn(Math.floor(fj*7)%3),4);else if(ty=='pum'&&hh(fi*3,fj)>.3)put(fi,fj,pumpkinS(),0)}
 for(let k=0;k<5;k++)put(14.5,13.6+k*.7,sunflower(k%3),4);
 // fences
 const f0=fenceSeg(0),f1=fenceSeg(1);
 for(let k=0;k<=9;k++){const fi=10.1+k*.5;if(!(fi>=13.2&&fi<=14.5))put(fi,13.1,f0,0);put(fi,17.5,f0,0)}
 for(let k=0;k<=8;k++){put(10.1,13.1+k*.55,f1,0);if(k!=3&&k!=4)put(14.9,13.1+k*.55,f1,0)}
 // stray flower tufts near house walls
 for(let k=0;k<26;k++){const fi=12.8+hh(k,1)*2.9,fj=13.05+hh(k,2)*.5,[X,Y]=PF(fi,fj),fc=FL[k%6];px(c,Math.round(X),Math.round(Y)+1,'#3f9a3d',1,2);px(c,Math.round(X),Math.round(Y),fc[0],2,2);px(c,Math.round(X),Math.round(Y),fc[1],1,1)}
 // snow / leaves seeds
 for(let k=0;k<700&&(FLAKES.length<110||LEAVES.length<100);k++){const fi=hh(k,11)*VN,fj=hh(k,12)*VN;if(WD(fi,fj)>-1||!LANDA(fi,fj))continue;const r=RG(fi,fj),[X,Y]=PF(fi,fj);if(r=='s'&&FLAKES.length<110)FLAKES.push([X,Y,k]);else if(r=='a'&&LEAVES.length<100)LEAVES.push([X,Y,k])}
 buildTown();buildB(c);buildC(c);
// cast shadows baked last so they darken everything under them
 for(const s of SH)shadowE(c,Math.round(s[0]),Math.round(s[1]),Math.round(s[2]),Math.round(s[3]),.4);
 // soft contact shadows under houses
 bridgeRails();buildBridge();objs.sort((a,b)=>a.d-b.d)}
// drifting cloud shadows
function bakeCloud(){const w=128,h=64;CLOUD=mk(w,h);const x=CLOUD.getContext('2d'),id=x.createImageData(w,h),d=id.data,T2=Math.PI*2;
 for(let Y=0;Y<h;Y++)for(let X=0;X<w;X++){const u=X/w,v=Y/h,n=(Math.sin(T2*(2*u+v+.3))+Math.sin(T2*(3*u-2*v+.7))+Math.sin(T2*(u+3*v+.1))+Math.sin(T2*(5*u-v)))/4,a=sm(.05,.7,n);const o=(Y*w+X)*4;d[o]=8;d[o+1]=26;d[o+2]=34;d[o+3]=Math.round(a*75)}x.putImageData(id,0,0)}
