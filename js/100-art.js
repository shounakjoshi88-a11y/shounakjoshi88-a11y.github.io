/* ================= SCENE: helpers, palettes, sprite makers ================= */
const fx2=document.getElementById('fx'),c2=fx2.getContext('2d'),VN=64,OX=VN*16,OY=110,Wd=3200,Ht=1760,PM={x:0,y:0};
let WS=innerWidth>=700?1:2,VW,VH,Z=1,TX=0,TY=0,stc,wm,wb,wc,wi,objs=[],rps=[],GLW=[],SPR={},CLOUD,FLAKES=[],LEAVES=[],LM=null,YB=null;
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),sm=(a,b,x)=>{x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x)};
const hh=(a,b)=>{let h=Math.imul(a|0,374761393)+Math.imul(b|0,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
const vn=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),f=x-i,g=y-j,u=f*f*(3-2*f),v=g*g*(3-2*g);return lerp(lerp(hh(i,j),hh(i+1,j),u),lerp(hh(i,j+1),hh(i+1,j+1),u),v)};
const PF=(i,j)=>[OX+(i-j)*16,OY+(i+j)*8];
const hx=h=>[1,3,5].map(k=>parseInt(h.slice(k,k+2),16));
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const PP=o=>{const r={};for(const k in o)r[k]=o[k].map(hx);return r};
const rgb=a=>`rgb(${a[0]|0},${a[1]|0},${a[2]|0})`;
const mixc=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
const px=(c,x,y,col,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w||1,h||1)};
const ln=(c,x0,y0,x1,y1,col)=>{c.fillStyle=col;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let k=0;k<=n;k++)c.fillRect(Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),1,1)};
const disc=(c,cx,cy,rx,ry,col)=>{c.fillStyle=col;for(let d=-ry;d<=ry;d++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-d*d/(ry*ry+.01))));c.fillRect(cx-w,cy+d,w*2+1,1)}};
const SEG=(x,y,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,t=clamp(((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(x-ax-t*dx,y-ay-t*dy)};

const GP=PP({g:['#244f26','#2f6230','#3b7a35','#4a9141','#62ad4f'],a:['#5c4a20','#75602a','#8f7430','#a98b38','#c4a447'],s:['#a9bfc8','#c3d6dc','#dbe9ed','#eef6f8','#ffffff']});
const LP=PP({g:['#14321b','#235027','#35792f','#52a043','#82cb63'],a:['#561f10','#8a3217','#c04e1e','#e17a2b','#f6b544'],s:['#5f827d','#8fb0a8','#c2d9d2','#e6f3f0','#ffffff']});
const LH={g:[214,214,104],a:[255,226,128],s:[255,255,255]};
const RK=PP({r:['#363d42','#535c62','#757f85','#98a3a6','#bec8c7']}).r,ST=PP({r:['#8a7f6b','#a39882','#bdb299','#d6ccb3','#ede4cc']}).r;
const WP=['#0e3a52','#14566c','#1d768a','#3a9ba5','#86d0cb'].map(hx);
const BARK=[[44,30,18],[70,48,28],[98,68,40],[128,92,56]];
const RG=(a,b)=>{const r=a-b+(vn(a*.4,b*.4)-.5)*6;return r>8?'a':r<-8?'s':'g'};
// Water: A has a deep pond + a stream falling off its east edge; B (the sakura isle) has its own pond + stream.
const POND=[26.5,24.5],PR=5.9,ISL=[24.0,22.0],IR=1.15;
const POND2=[104,31.5],PR2=4.2,PX2=106,CUT_A=63.46,CUT_B=119.96;
const pondR2=(a,b)=>{const an=Math.atan2(b-POND2[1],a-POND2[0]);return PR2+.3*Math.sin(3*an+1.2)+.18*Math.sin(5*an+.4)};
const WD=(a,b)=>{
  let d=PR+(vn(a*1.3,b*1.3)-.5)*.26-Math.hypot(a-POND[0],b-POND[1]);
  d=Math.min(d,Math.hypot(a-ISL[0],b-ISL[1])-IR);
  if(a>31.4){const u=a-31.4,m=(Math.sin(u*.30)*.46+Math.sin(u*.83+2.1)*.14)*sm(62,52,a),c=POND[1]+u*.075+m;d=Math.max(d,Math.min((1.45+(vn(a*.8,3)-.5)*.07-Math.abs(b-c))*1.25,(CUT_A-a)*2))}
  if(a<80)return d;
  let e=pondR2(a,b)-Math.hypot(a-POND2[0],b-POND2[1]);
  if(a>PX2){const c=POND2[1]+(a-PX2)*.05;e=Math.max(e,Math.min((1.25-Math.abs(b-c))*1.25,(CUT_B-a)*2))}
  return Math.max(d,e)};
// Two floating islands. Land is a rounded square with a noisy rim; the rim is left straight where the stream
// leaves and where the rope bridge lands, so the waterfall and the bridge always have solid ground to meet.
const sdRR=(a,b,cx,cy,h,rad)=>{const dx=Math.abs(a-cx)-(h-rad),dy=Math.abs(b-cy)-(h-rad);return Math.hypot(Math.max(dx,0),Math.max(dy,0))+Math.min(Math.max(dx,dy),0)-rad};
const dmp=(b,c)=>clamp((Math.abs(b-c)-2)/2.5,0,1);
const LANDA=(a,b)=>{if(a<-4||a>66||b<-4||b>66)return 0;const k=a>50?Math.min(dmp(b,26.9),dmp(b,19.5)):1;return sdRR(a,b,31.5,31.5,32,9)+vn(a*.27+9,b*.27)*2.4*k<0};
const LANDB=(a,b)=>{if(a<78||a>124||b<3||b>49)return 0;const k=a<90?dmp(b,19.5):a>112?dmp(b,32.2):1;return sdRR(a,b,101,26,19,8)+vn(a*.27+40,b*.27)*2.2*k<0};
// the observatory rock: smaller, colder, reached by a stair east of the sakura isle
const LANDS={a0:117,a1:151,b0:9,b1:47};
const LANDC=(a,b)=>{if(a<LANDS.a0||a>LANDS.a1||b<LANDS.b0||b>LANDS.b1)return 0;
 const k=a>144?dmp(b,28.5):1;return sdRR(a,b,133,27,10.5,7)+vn(a*.28+71,b*.28)*1.5*k<0};
const LAND=(a,b)=>LANDA(a,b)||LANDB(a,b)||LANDC(a,b)||LANDD(a,b);
const landIn=(a,b,m)=>LAND(a-m,b)&&LAND(a+m,b)&&LAND(a,b-m)&&LAND(a,b+m);
const EDA=(a,b)=>-sdRR(a,b,31.5,31.5,32,9),EDB=(a,b)=>-sdRR(a,b,101,26,19,8),EDC=(a,b)=>-sdRR(a,b,133,27,10.5,7);
// where the rope bridge hangs between the isles
const RB={a0:62.3,a1:83.7,b:19.5,sag:12};
const RB2={a0:118.4,a1:124.0,b:30,sag:7};
const ropeT=(a,R)=>clamp((a-R.a0)/(R.a1-R.a0),0,1);
const ropeLift=(a,b)=>{const R=RB;
 if(a>=R.a0&&a<=R.a1&&Math.abs(b-R.b)<=1.1)return -R.sag*4*ropeT(a,R)*(1-ropeT(a,R));
 if(typeof RB3!=='undefined'&&RB3){const t=RB3.v?clamp((b-RB3.b0)/(RB3.b1-RB3.b0),0,1):ropeT(a,RB3);
  if(RB3.v?Math.abs(a-RB3.a0)<=1.2&&b>=RB3.b0&&b<=RB3.b1:a>=RB3.a0&&a<=RB3.a1&&Math.abs(b-RB3.b)<=1.1)return -RB3.sag*4*t*(1-t);}
 return 0};
const ARCH=[{i:33.5,j0:22.5,j1:26.5,h:3,pal:0},{i:104,j0:27.0,j1:36.0,h:5,pal:1}];
const archLift=(a,b)=>{for(const A of ARCH)if(Math.abs(a-A.i)<=1.1&&b>=A.j0&&b<=A.j1)return Math.sin(Math.PI*(b-A.j0)/(A.j1-A.j0))*A.h;return 0};

// --- the village, in tiles ---
const PATHS=[
 [[3.5,9.2],[5.6,10.2],[8.2,11.4],[10.8,12.2],[13.0,12.9],[15.2,13.4],[17.2,14.0],[19.2,15.4],[20.6,17.2],[21.55,19.55]],
 [[5.6,10.2],[5.4,8.6],[6.2,7.0],[7.6,5.8],[9.6,5.2],[11.4,5.6],[13.2,6.4],[14.6,7.6],[16.0,8.6],[17.4,9.4]],
 [[17.4,9.4],[19.2,8.6],[21.2,7.6],[23.6,6.8],[26.2,6.4],[28.8,6.8],[31.0,7.8],[32.6,9.2]],
 [[15.2,13.4],[15.1,15.0],[14.9,16.6],[15.4,18.4],[17.0,19.6],[19.2,19.8],[21.55,19.55]],
 [[26.2,6.4],[26.4,9.4],[26.5,12.6],[26.3,15.2],[26.5,17.5]],
 [[15.4,18.4],[14.4,21.0],[13.2,24.0],[12.6,27.2],[13.2,30.4],[14.6,33.4],[16.8,35.8],[18.4,36.2]],
 [[12.4,30.8],[13.4,31.8],[14.6,31.2]],
 [[21.55,19.55],[26.5,17.5],[31.45,19.55],[33.5,24.5],[31.45,29.45],[26.5,31.5],[21.55,29.45],[19.5,24.5],[21.55,19.55]],
 [[33.5,24.5],[34.4,22.6],[36.8,22.3],[39.8,22.5],[42.8,22.8],[45.8,23.1],[48.8,23.4],[51.6,22.4],[54.8,21.4],[58.0,20.5],[61.0,19.8],[63.0,19.5]],
 [[26.5,31.5],[27.8,33.4],[29.6,35.0],[31.8,36.4],[34.0,37.6]],
 [[63.0,19.5],[70,19.5],[78,19.5],[82.4,19.5],[86,19.6],[90,20.2],[93.4,21.6],[96.2,23.6],[98.6,25.4],[102,26.0],[104,26.4]],
 [[104,36.6],[104.4,39.6],[104.2,43]],
 [[96.2,23.6],[96.8,27.6],[97.6,30.6],[96.0,33.6],[93.6,34.2]],
 [[102,26.0],[105.5,23],[108.4,20.2],[110.3,18.4]]
];
const pathD=(a,b)=>{let d=9;for(const p of PATHS)for(let k=0;k<p.length-1;k++)d=Math.min(d,SEG(a,b,p[k][0],p[k][1],p[k+1][0],p[k+1][1]));return d};
const YARDS=[[14.6,12.4,2.5],[19.8,10.4,2.6],[10.0,10.5,1.7],[17.2,13.0,1.9],[11.8,7.6,2.3],[8.6,4.4,2.0],[15.9,9.6,2.2],[24.3,19.3,1.9],[33.0,9.4,1.5],[35.4,37.2,1.5],[34.9,21.4,1.8],[22.4,3.8,1.9],[28.2,3.6,1.9],[23.2,10.8,1.9],[29.6,11.0,1.9],[23.0,15.0,1.9],[30.2,15.2,1.9],[26.5,12.6,2.8],[17.6,26.0,1.9],[9.6,22.4,1.9],[16.8,30.4,1.9],[9.0,28.8,1.9],[11.8,35.2,1.9],[13.4,31.8,2.0],[95,24.5,3.0],[92,33,2.4],[110.5,17.5,3.0]];
// The road network is baked into a coarse field once, then read per pixel.
let FIELD=null,PGW=0,PGH=0;
function bakeField(){
  PGW=Math.ceil(Wd/8)+2;PGH=Math.ceil(Ht/4)+2;FIELD=new Float32Array(PGW*PGH);
  for(let gy=0;gy<PGH;gy++)for(let gx=0;gx<PGW;gx++){
    const x=gx*8,y=gy*4,fi=((x-OX)/16+(y-OY)/8)/2,fj=((y-OY)/8-(x-OX)/16)/2;
    let d=pathD(fi,fj);
    for(const[y0,y1,r]of YARDS){const dd=Math.hypot(fi-y0,fj-y1)-r;if(dd<d)d=dd}
    FIELD[gy*PGW+gx]=d}
}
function fieldAt(fi,fj){
  const x=(fi-fj)*16+OX,y=(fi+fj)*8+OY,gx=x/8,gy=y/4;
  const x0=gx|0,y0=gy|0,fx=gx-x0,fy=gy-y0,i0=y0*PGW+x0,i1=i0+PGW;
  return lerp(lerp(FIELD[i0],FIELD[i0+1],fx),lerp(FIELD[i1],FIELD[i1+1],fx),fy)
}
// What lives where, so the ground and the planting can be art-directed instead of random.
const ZONE=(a,b)=>{
  if(a>20.5&&a<32.5&&b>2&&b<17&&!(a>30&&b>11.5&&b<13.2&&0))return 'town';
  if(a>7.5&&a<20&&b>19.5&&b<37.5)return 'town';
  if(a>3.4&&a<13.4&&b>1.2&&b<8.8)return 'field';
  if(a>24&&a<41.5&&b>32&&b<43)return 'orchard';
  if(a>20&&a<45&&b>29&&b<47)return 'meadow';
  if(a>22&&a<44&&b>0.4&&b<13)return 'woods';
  if(a>31&&a<VN&&b>19&&b<30)return 'river';
  if(a>15.5&&a<22.5&&b>15&&b<21.5)return 'clearing';
  return 'forest'};
const RES=[[51.0,15.6,3.1],[50.3,17.7,1.4],[22.4,3.8,2.7],[28.2,3.6,2.7],[23.2,10.8,2.7],[29.6,11.0,2.7],[23.0,15.0,2.7],[30.2,15.2,2.7],[26.5,12.6,3.2],[17.6,26.0,2.7],[9.6,22.4,2.7],[16.8,30.4,2.7],[9.0,28.8,2.7],[11.8,35.2,2.6],[18.6,36.6,2.4],[13.4,31.8,2.4],[14.2,11.8,3.6],[19.8,9.5,3.6],[16.6,12.0,1.5],[17.9,13.0,1.5],[11.9,12.3,1.3],[10.4,10.9,1.8],[12.0,7.6,3.2],[7.4,6.8,2.4],[15.9,9.4,3.0],[24.2,19.2,2.4],[33.0,9.4,2.2],[35.4,37.2,2.2],[16.7,17.4,1.6]];
const okp=(a,b)=>{if(!landIn(a,b,1.3)||WD(a,b)>-1.05)return 0;for(const r of RES)if(Math.hypot(a-r[0],b-r[1])<r[2])return 0;if(a>10&&a<15&&b>13&&b<17.7)return 0;if(pathD(a,b)<.55)return 0;return 1};

// ---- shaded sphere (5 tone) ----
function bl(c,cx,cy,rx,ry,T5,sd){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const nx=x/rx,ny=y/ry,q=nx*nx+ny*ny;if(q>1)continue;const nz=Math.sqrt(1-q);let t=clamp(Math.floor((-nx*.5-ny*.6+nz*.62+.25)*3.4+(hh(x+sd,y)-.5)),0,4);if(nz<.25)t=0;c.fillStyle=rgb(T5[t]);c.fillRect(cx+x,cy+y,1,1)}}
function RS(rx,ry,T5,sd){const c=mk(rx*2+2,ry*2+2);bl(c.getContext('2d'),rx+1,ry+1,rx,ry,T5,sd);return{c,ox:rx+1,oy:ry+1}}
// dithered ground shadow
function shadowE(c,x,y,rx,ry,a){c.fillStyle=`rgba(4,16,12,${a})`;for(let d=-ry;d<=ry;d++){const w=Math.round(rx*Math.sqrt(1-d*d/(ry*ry+.01))),w2=Math.round(w*.7);c.fillRect(x-w2,y+d,w2*2,1);for(let X=w2;X<w;X++)if(((X+d)&1)==0){c.fillRect(x-X,y+d,1,1);c.fillRect(x+X,y+d,1,1)}}}
// parallelogram raster with local (s,t)
function para(c,p0,e1,e2,fn){const xs=[p0[0],p0[0]+e1[0],p0[0]+e2[0],p0[0]+e1[0]+e2[0]],ys=[p0[1],p0[1]+e1[1],p0[1]+e2[1],p0[1]+e1[1]+e2[1]],det=e1[0]*e2[1]-e1[1]*e2[0];
 for(let y=Math.floor(Math.min(...ys));y<Math.ceil(Math.max(...ys));y++)for(let x=Math.floor(Math.min(...xs));x<Math.ceil(Math.max(...xs));x++){const dx=x+.5-p0[0],dy=y+.5-p0[1],s=(dx*e2[1]-dy*e2[0])/det,t=(e1[0]*dy-e1[1]*dx)/det;if(s<0||s>=1||t<0||t>=1)continue;const col=fn(s,t,x,y);if(col){c.fillStyle=col;c.fillRect(x,y,1,1)}}}
// cylinder (barrel, well, stump)
function cyl(c,cx,by,rx,ry,h,pal,top,fn){for(let dx=-rx;dx<=rx;dx++){const yb=by+Math.round(ry*Math.sqrt(1-dx*dx/(rx*rx+.01))),t=(dx+rx)/(2*rx+.01);for(let v=0;v<h+2;v++){let col=t<.28?pal[0]:t<.7?pal[1]:pal[2];if(fn){const r=fn(dx,v,t);if(r)col=r}px(c,cx+dx,yb-v,rgb(col))}}
 disc(c,cx,by-h,rx,ry,rgb(mixc(top,[0,0,0],.25)));disc(c,cx,by-h,rx-1,Math.max(1,ry-1),rgb(top))}
// iso cube
function cube(c,cx,by,a,h,top,L,R,fL,fR){const ah=a>>1;
 for(let u=0;u<a;u++){const yl=by+Math.floor(u*ah/a),yr=by+ah-Math.floor(u*ah/a);for(let v=0;v<h;v++){px(c,cx-a+u,yl-1-v,rgb((fL&&fL(u,v))||L));px(c,cx+u,yr-1-v,rgb((fR&&fR(u,v))||R))}}
 for(let r=-ah;r<ah;r++){const hw=Math.round(a*(1-Math.abs(r+.5)/ah));c.fillStyle=rgb(top);c.fillRect(cx-hw,by-h+r,hw*2,1)}}

// ---- trees ----
const CHP=[[96,34,62],[160,66,106],[222,124,164],[246,176,200],[255,222,234]];
const leafPal=(rg,v)=>v=='cherry'?CHP:LP[rg].map(c=>v=='birch'?mixc(c,[205,228,112],.32):c);
function drawTrunk(x,ox,oy,len,tw,birch){for(let Y=0;Y<len;Y++)for(let X=-tw;X<=tw;X++){const t=(X+tw)/(2*tw);let col=birch?(t<.4?[236,236,226]:t<.75?[214,214,202]:[172,172,162]):(t<.3?BARK[3]:t<.65?BARK[2]:BARK[1]);
  if(birch){if(hh(X,Y>>1)>.82&&Y%5<2)col=[40,40,42]}else if(hh(X*3,Y>>1)>.78)col=BARK[0];
  px(x,ox+X,oy-Y,rgb(col))}
 for(let k=0;k<4;k++){const w=tw+4-k;px(x,ox-w,oy-k,rgb(birch?[190,190,180]:BARK[1]),1,1);px(x,ox+w,oy-k,rgb(BARK[0]),1,1);px(x,ox-w+1,oy-k,rgb(birch?[214,214,202]:BARK[2]),2*w-1,1)}}
function oak(rg,R,seed,variant){const key='o'+rg+R+seed+(variant||'');if(SPR[key])return SPR[key];
 const W=Math.ceil(R*3.3)+16,Hh=Math.ceil(R*3.9)+20,ox=W>>1,oy=Hh-8,TH=Math.round(R*.9),ccy=oy-TH-Math.round(R*.5),pal=leafPal(rg,variant),birch=variant=='birch',cher=variant=='cherry',hl=cher?[255,240,246]:LH[rg];
 const bs=[[0,0,R*.74]],n=9+(seed%3);
 for(let k=0;k<n;k++){const an=k/n*6.283+hh(seed,k)*.6,d=R*(.5+.34*hh(k,seed+1));bs.push([Math.cos(an)*d*1.15,Math.sin(an)*d*.72-R*.05,R*(.3+.2*hh(seed+2,k))])}
 for(let k=0;k<14;k++){const an=hh(k,seed+5)*6.283,d=R*(.8+.28*hh(seed+7,k));bs.push([Math.cos(an)*d*1.1,Math.sin(an)*d*.7-R*.06,R*(.14+.1*hh(k,seed+9))])}
 bs.push([0,-R*.58,R*.44],[-R*.34,-R*.42,R*.38],[R*.36,-R*.44,R*.36]);
 const c=mk(W,Hh),x=c.getContext('2d');
 drawTrunk(x,ox,oy,TH+Math.round(R*.5),Math.max(2,Math.round(R*.17)),birch);
 // roots, moss and a branch skeleton that shows through the gaps
 for(let k=0;k<5;k++){const sd=k%2?1:-1,w=Math.max(2,Math.round(R*.17))+2+k;px(x,ox+sd*w,oy+1-(k>2?1:0),rgb(birch?[190,190,180]:BARK[1]),2,1)}
 if(!birch)for(let k=0;k<6;k++)px(x,ox-3+Math.floor(hh(k,seed)*7),oy-1-Math.floor(hh(seed,k)*6),rgb(LP.g[1+k%2]));
 const br=(x0,y0,a,L,dp)=>{if(dp>2||L<3)return;let X=x0,Y=y0;for(let q=0;q<L;q++){X+=Math.cos(a);Y+=Math.sin(a)*.9;px(x,Math.round(X),Math.round(Y),rgb(birch?[196,196,184]:dp?BARK[0]:BARK[1]),dp?1:2,1)}br(X,Y,a-.55-hh(dp,seed)*.3,L*.66,dp+1);br(X,Y,a+.5+hh(seed,dp)*.3,L*.62,dp+1)};
 br(ox,oy-TH,-2.2,R*.62,0);br(ox,oy-TH-2,-1.0,R*.6,0);br(ox,oy-TH-R*.3,-1.57,R*.5,0);
 const cc=mk(W,Hh),cx=cc.getContext('2d'),id=cx.createImageData(W,Hh),d=id.data,op=new Uint8Array(W*Hh);
 for(let Y=0;Y<Hh;Y++)for(let X=0;X<W;X++){let best=0,bnx=0,bny=0,bi=0;for(let q=0;q<bs.length;q++){const[bx,by,r]=bs[q],nx=(X-ox-bx)/r,ny=(Y-ccy-by)/r,qq=nx*nx+ny*ny;if(qq<1){const nz=Math.sqrt(1-qq);if(nz>best){best=nz;bnx=nx;bny=ny;bi=q}}}
  if(!best||(best<.16&&hh(X,Y+seed)>.5))continue;
  const dot=-bnx*.5-bny*.62+best*.6;let t=Math.floor((dot+.25)*3.5+(hh((X>>1)+seed,Y>>1)-.5)*1.5+(hh(bi,seed)-.5)*.9);
  if(best<.2)t=0;else if(best<.4&&bny>0)t=Math.max(0,t-1);t=clamp(t,0,4);
  if(t==0&&best>.5&&hh(X*2+seed,Y*3)>.86)continue;
  if((X+Y*2+bi)%5==0&&t>1&&hh(X,Y)>.5)t--;
  let col=pal[t];if(dot>.42&&hh(X*3+seed,Y*5)>.8)col=hl;else if(t<2&&hh(X*5,Y*3+seed)>.93)col=pal[3];
  if(cher&&t>1&&hh(X*7+seed,Y*11)>.88)col=[255,246,250];else if(!cher&&!birch&&rg=='g'&&t>2&&hh(X*9,Y*7+seed)>.985)col=[226,70,56];
  const o=(Y*W+X)*4;d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255;op[Y*W+X]=1}
 const dk=pal[0].map(v=>v*.5);
 for(let Y=0;Y<Hh;Y++)for(let X=0;X<W;X++){if(op[Y*W+X])continue;if((X>0&&op[Y*W+X-1])||(X<W-1&&op[Y*W+X+1])||(Y>0&&op[(Y-1)*W+X])||(Y<Hh-1&&op[(Y+1)*W+X])){const o=(Y*W+X)*4;d[o]=dk[0];d[o+1]=dk[1];d[o+2]=dk[2];d[o+3]=255}}
 cx.putImageData(id,0,0);x.drawImage(cc,0,0);
 // loose leaves drifting off the crown, and a litter of them on the ground
 for(let k=0;k<Math.round(R*2.2);k++){const an=hh(k,seed+21)*6.283,rr=R*(.85+.5*hh(seed+4,k)),X=Math.round(ox+Math.cos(an)*rr*1.15),Y=Math.round(ccy+Math.sin(an)*rr*.72);if(X>0&&Y>0&&X<W-1&&Y<Hh-1&&!op[Y*W+X])px(x,X,Y,rgb(pal[2+k%3]),hh(k,seed)>.7?2:1,1)}
 for(let k=0;k<Math.round(R*(rg=='a'||cher?3:1.2));k++){const X=Math.round(ox+(hh(k,seed+11)-.5)*R*2.3),Y=Math.round(oy+(hh(seed,k+5)-.3)*R*.45);if(X>0&&X<W&&Y<Hh)px(x,X,Y,rgb(rg=='a'||cher?pal[1+k%4]:LP.g[1+k%3]),hh(k,seed)>.6?2:1,1)}
 return SPR[key]={c,ox,oy,R,sh:[R*.4,R*.12,R*1.15,R*.5]}}
function pine(rg,R,seed){const key='p'+rg+R+seed;if(SPR[key])return SPR[key];
 const W=R*2+14,Hh=Math.round(R*3.3)+14,ox=W>>1,oy=Hh-5,n=Math.round(R/2.7)+3,pal=LP[rg],c=mk(W,Hh),x=c.getContext('2d');
 drawTrunk(x,ox,oy,Math.round(R*.7),2,false);
 const cc=mk(W,Hh),cx=cc.getContext('2d'),id=cx.createImageData(W,Hh),d=id.data,op=new Uint8Array(W*Hh),top=oy-Math.round(R*3),step=(Math.round(R*3)-Math.round(R*.55))/n;
 for(let q=n-1;q>=0;q--){const ty=top+q*step*.92,th=step*1.55,hwm=R*(.32+.68*(q+1)/n);
  for(let Y=Math.floor(ty);Y<Math.floor(ty+th);Y++){const f=(Y-ty)/th,hw=f*hwm*(1+.1*Math.sin(Y*.9+seed+q))+.6+(hh(Y,q+seed)-.5)*1.4;
   for(let X=Math.floor(ox-hw);X<=Math.ceil(ox+hw);X++){if(X<0||X>=W||Y<0||Y>=Hh)continue;const s=(X-ox)/(hw+.01);
    let t=Math.floor((-s*.6+(1-f)*.45+.38+(hh(X+seed,Y)-.5)*.5)*3.6);if(f>.86)t=Math.max(0,t-2);else if(f>.7&&hh(X*2,Y*2)>.6)t=Math.max(0,t-1);
    t=clamp(t,0,4);let col=pal[t];if((X*2+Y)%5==0&&t>0&&t<4&&hh(X,Y+seed+q)>.5)col=pal[t+1];else if((X+Y)%7==0&&t>1&&hh(X+q,Y)>.6)col=pal[t-1];if(rg=='s'&&f<.62&&s<.5&&hh(X*3,Y)>.18)col=[240,248,252];else if(rg=='g'&&t==4&&hh(X*3,Y)>.7)col=LH.g;
    const o=(Y*W+X)*4;d[o]=col[0];d[o+1]=col[1];d[o+2]=col[2];d[o+3]=255;op[Y*W+X]=1}}}
 const dk=pal[0].map(v=>v*.5);for(let Y=0;Y<Hh;Y++)for(let X=0;X<W;X++){if(op[Y*W+X])continue;if((X>0&&op[Y*W+X-1])||(X<W-1&&op[Y*W+X+1])||(Y>0&&op[(Y-1)*W+X])||(Y<Hh-1&&op[(Y+1)*W+X])){const o=(Y*W+X)*4;d[o]=dk[0];d[o+1]=dk[1];d[o+2]=dk[2];d[o+3]=255}}
 cx.putImageData(id,0,0);x.drawImage(cc,0,0);
 for(let k=0;k<Math.round(R/3);k++){const cy=Math.round(oy-R*(.7+2*hh(k,seed+3))),cxp=Math.round(ox+(hh(seed,k+8)-.5)*R*.9*(1-(oy-cy)/(R*3.2)));if(op[cy*W+cxp]&&rg!='s'){px(x,cxp,cy,'#6e4a2a',2,3);px(x,cxp,cy,'#9a6c3c',1,1)}}
 for(let k=0;k<R;k++){const X=Math.round(ox+(hh(k,seed+13)-.5)*R*1.7),Y=Math.round(oy+(hh(seed,k+2)-.3)*3);if(X>0&&X<W)px(x,X,Y,rg=='s'?'#f2f8fb':k%3?'#5a3e24':'#8a6238',k%4?1:2,1)}
 return SPR[key]={c,ox,oy,R,sh:[R*.3,R*.1,R*.9,R*.4]}}
function bush(rg,seed,big){const key='b'+rg+seed+(big?1:0);if(SPR[key])return SPR[key];const r=big?9:6,W=r*3+6,Hh=r*2+10,c=mk(W,Hh),x=c.getContext('2d'),pal=LP[rg];
 bl(x,r+3,Hh-r-2,r,Math.round(r*.7),pal,seed);bl(x,r*2+1,Hh-r-1,Math.round(r*.8),Math.round(r*.6),pal,seed+3);bl(x,r+Math.round(r*.7),Hh-r*1.6|0,Math.round(r*.7),Math.round(r*.55),pal,seed+7);
 for(let q=0;q<(big?9:5);q++){x.fillStyle=['#e8453c','#ffd24a','#ff8fb8','#fff','#a84bd8'][Math.floor(hh(seed,q)*5)];x.fillRect(3+Math.floor(hh(q,seed)*(W-8)),Hh-r*1.5-3+Math.floor(hh(seed,q+9)*r*1.3),2,2)}
 return SPR[key]={c,ox:W>>1,oy:Hh-4,sh:[r*.3,2,r*1.3,r*.55]}}
function fern(rg,seed){const key='f'+rg+seed;if(SPR[key])return SPR[key];const c=mk(26,20),x=c.getContext('2d'),pal=LP[rg];
 for(let k=0;k<7;k++){const an=-1.2+k*.4+hh(seed,k)*.2,L=8+hh(k,seed)*5;let X=13,Y=18;for(let s=0;s<L;s++){X+=Math.cos(an)*1;Y+=Math.sin(an)*.8-.55+s*.04;px(x,Math.round(X),Math.round(Y),rgb(pal[s%3==0?4:3]));if(s>2&&s<L-1){px(x,Math.round(X)-1,Math.round(Y)+1,rgb(pal[2]));px(x,Math.round(X)+1,Math.round(Y)+1,rgb(pal[2]))}}}
 return SPR[key]={c,ox:13,oy:18,sway:1}}
function stump(seed){const key='st'+seed;if(SPR[key])return SPR[key];const c=mk(24,22),x=c.getContext('2d');cyl(x,12,15,7,3,7,[BARK[3],BARK[2],BARK[1]],[176,132,84],(dx,v)=>hh(dx*3,v>>1)>.8?BARK[0]:null);
 x.strokeStyle='#8a6238';x.lineWidth=1;disc(x,12,8,4,1,rgb([150,108,64]));px(x,12,8,rgb([110,76,44]),2,1);
 for(let q=0;q<3;q++)px(x,4+q*7,17,rgb([60,120,50]),2,2);return SPR[key]={c,ox:12,oy:15,sh:[2,1,9,3]}}
function logS(seed){const key='lg'+seed;if(SPR[key])return SPR[key];const L=30,c=mk(L+14,24),x=c.getContext('2d');
 for(let k=0;k<L;k++){const X=k,Y=14+(k>>1);for(let v=0;v<7;v++){const t=v/6;px(x,X,Y-v,rgb(t<.2?BARK[3]:t<.6?BARK[2]:t<.85?BARK[1]:BARK[0]));}if(hh(k,seed)>.8)px(x,X,Y-3,rgb(BARK[0]))}
 disc(x,L,14+(L>>1)-3,3,3,rgb([186,142,92]));disc(x,L,14+(L>>1)-3,1,1,rgb([140,100,60]));for(let q=0;q<5;q++)px(x,3+q*5,10+(q*5>>1),rgb([70,130,56]),2,1);
 return SPR[key]={c,ox:2,oy:12,sh:[16,8,16,5]}}
function barrel(){if(SPR.barrel)return SPR.barrel;const c=mk(16,20),x=c.getContext('2d');cyl(x,8,14,6,3,11,[[176,122,70],[140,92,50],[98,62,36]],[196,148,92],(dx,v)=>(v==2||v==8)?[56,58,66]:(Math.abs(dx)%3==2&&v%4)?[92,60,34]:null);return SPR.barrel={c,ox:8,oy:14,sh:[2,1,8,3]}}
function crates(){if(SPR.crates)return SPR.crates;const c=mk(40,36),x=c.getContext('2d'),pl=u=>u%5==4?[96,66,38]:null;
 cube(x,12,32,9,9,[198,152,96],[160,114,66],[120,82,48],(u,v)=>(u%5==4||v==4)?[100,70,40]:null,(u,v)=>(u%5==4||v==4)?[84,58,34]:null);
 cube(x,26,28,8,8,[206,162,104],[168,122,72],[126,88,52],(u,v)=>(u%4==3)?[104,72,42]:null,(u,v)=>(u%4==3)?[88,60,36]:null);
 cube(x,19,22,7,7,[212,168,110],[172,126,76],[130,92,54]);
 return SPR.crates={c,ox:20,oy:32,sh:[4,2,18,6]}}
function hay(){if(SPR.hay)return SPR.hay;const c=mk(30,26),x=c.getContext('2d');
 cube(x,15,20,12,10,[238,208,112],[214,178,78],[176,140,56],(u,v)=>(u%3==0&&hh(u,v)>.4)?[184,148,60]:(u==3||u==8)?[130,92,40]:null,(u,v)=>(u%3==0&&hh(u,v)>.4)?[150,116,44]:(u==3||u==8)?[100,70,34]:null);
 for(let q=0;q<10;q++)px(x,6+Math.floor(hh(q,1)*18),Math.floor(4+hh(q,2)*6),rgb([250,226,140]),2,1);return SPR.hay={c,ox:15,oy:20,sh:[2,1,13,5]}}
function woodpile(){if(SPR.wp)return SPR.wp;const c=mk(46,30),x=c.getContext('2d');px(x,2,12,rgb([60,40,24]),38,16);
 for(let r=0;r<4;r++)for(let k=0;k<(r%2?7:8);k++){const X=5+k*5+(r%2?2:0),Y=24-r*5;disc(x,X,Y,3,3,rgb(BARK[1]));disc(x,X,Y,2,2,rgb([196,150,98]));px(x,X,Y,rgb([150,108,64]));px(x,X-1,Y-1,rgb([166,122,76]))}
 px(x,0,6,rgb([102,68,40]),44,3);px(x,0,5,rgb([140,96,56]),44,1);px(x,2,8,rgb([70,46,28]),2,18);px(x,40,8,rgb([70,46,28]),2,18);return SPR.wp={c,ox:6,oy:28,sh:[18,5,24,5]}}
function fenceSeg(axis){const key='fn'+axis;if(SPR[key])return SPR[key];const c=mk(30,24),x=c.getContext('2d'),X0=axis?14:6,dx=axis?-8:8;
 ln(x,X0,8,X0+dx,12,rgb([176,128,76]));ln(x,X0,9,X0+dx,13,rgb([120,84,48]));ln(x,X0,13,X0+dx,17,rgb([176,128,76]));ln(x,X0,14,X0+dx,18,rgb([120,84,48]));
 px(x,X0-1,4,rgb([204,156,98]),3,1);px(x,X0-1,5,rgb([170,122,72]),3,16);px(x,X0+1,5,rgb([116,80,46]),1,16);px(x,X0,3,rgb([226,180,120]),1,1);
 return SPR[key]={c,ox:X0,oy:20}}
function sunflower(seed){const key='sf'+seed;if(SPR[key])return SPR[key];const c=mk(20,34),x=c.getContext('2d');
 px(x,10,12,rgb([74,128,52]),2,20);px(x,9,22,rgb([58,110,44]),3,1);ln(x,10,22,5,19,rgb([86,150,60]));ln(x,11,26,16,23,rgb([86,150,60]));ln(x,5,19,4,18,rgb([110,176,76]));
 disc(x,10,8,6,6,rgb([244,196,38]));disc(x,10,8,6,6,rgb([250,214,70]));disc(x,10,8,4,4,rgb([90,52,26]));for(let k=0;k<7;k++)px(x,8+Math.floor(hh(k,seed)*5),6+Math.floor(hh(seed,k)*5),rgb([54,30,16]));
 for(let k=0;k<8;k++){const a=k*.785;px(x,Math.round(10+Math.cos(a)*7),Math.round(8+Math.sin(a)*7),rgb([255,222,80]))}return SPR[key]={c,ox:10,oy:32,sway:1}}
function corn(seed){const key='cn'+seed;if(SPR[key])return SPR[key];const c=mk(26,40),x=c.getContext('2d');
 px(x,12,10,rgb([128,170,60]),2,28);for(let k=0;k<5;k++){const y=34-k*6,s=k%2?1:-1;ln(x,13,y,13+s*9,y-5+Math.floor(k/3),rgb([102,164,56]));ln(x,13,y-1,13+s*9,y-6,rgb([138,196,76]))}
 px(x,15,18,rgb([236,206,96]),3,6);px(x,15,18,rgb([250,230,130]),1,6);ln(x,12,8,10,3,rgb([212,176,80]));ln(x,13,8,15,3,rgb([200,160,70]));return SPR[key]={c,ox:13,oy:38,sway:1}}
function tomato(seed){const key='tm'+seed;if(SPR[key])return SPR[key];const c=mk(16,24),x=c.getContext('2d');px(x,7,2,rgb([150,110,64]),2,22);
 for(let k=0;k<4;k++)bl(x,5+(k%2)*5,18-k*4,3,2,[[30,86,36],[48,120,50],[70,150,62],[100,180,84],[140,210,110]],k+seed);
 for(let k=0;k<5;k++)px(x,3+Math.floor(hh(k,seed)*10),8+Math.floor(hh(seed,k)*12),rgb([226,48,38]),2,2);return SPR[key]={c,ox:8,oy:23,sway:1}}
function reed(seed){const key='rd'+seed;if(SPR[key])return SPR[key];const c=mk(24,32),x=c.getContext('2d');
 for(let k=0;k<6;k++){const bx=12+(k-3)*2+Math.floor(hh(k,seed)*2),top=4+Math.floor(hh(seed,k)*10),lean=(k-3)*.7;ln(x,bx,30,bx+lean,top,rgb(k%2?[86,128,56]:[62,104,48]));if(k%2){px(x,Math.round(bx+lean),top,rgb([112,70,40]),2,5);px(x,Math.round(bx+lean),top,rgb([150,98,56]),1,4)}}
 return SPR[key]={c,ox:12,oy:30,sway:1}}
function scarecrow(){if(SPR.sc)return SPR.sc;const c=mk(30,40),x=c.getContext('2d');px(x,14,12,rgb([110,76,44]),2,26);px(x,5,16,rgb([110,76,44]),20,2);
 px(x,10,14,rgb([62,86,138]),10,12);px(x,10,14,rgb([84,112,168]),3,12);px(x,17,17,rgb([52,70,112]),3,8);for(let k=0;k<6;k++){px(x,2+k,18+(k%2),rgb([238,208,112]));px(x,23+k,18+(k%2),rgb([238,208,112]))}
 disc(x,15,10,4,4,rgb([232,200,140]));px(x,13,9,rgb([30,20,14]),1,1);px(x,17,9,rgb([30,20,14]),1,1);px(x,14,12,rgb([140,60,40]),3,1);
 px(x,8,6,rgb([140,100,52]),14,2);px(x,11,1,rgb([120,84,44]),8,6);px(x,11,4,rgb([170,50,40]),8,1);return SPR.sc={c,ox:15,oy:38,sh:[2,1,6,2]}}
function hive(){if(SPR.hive)return SPR.hive;const c=mk(24,30),x=c.getContext('2d');px(x,4,22,rgb([100,70,42]),3,6);px(x,17,22,rgb([100,70,42]),3,6);
 for(let k=0;k<3;k++){px(x,3,12+k*5,rgb([240,232,206]),18,5);px(x,3,12+k*5,rgb([255,250,232]),18,1);px(x,3,16+k*5,rgb([196,184,150]),18,1);px(x,17,12+k*5,rgb([210,200,170]),4,5)}
 px(x,2,8,rgb([196,64,44]),20,4);px(x,2,8,rgb([226,92,60]),20,1);px(x,9,19,rgb([40,30,20]),5,2);return SPR.hive={c,ox:12,oy:28,sh:[2,1,9,3]}}
function wellS(){if(SPR.well)return SPR.well;const c=mk(50,56),x=c.getContext('2d');
 cyl(x,25,44,13,6,10,[[170,164,150],[138,132,118],[98,94,86]],[60,100,118],(dx,v)=>(v%4==0||(dx+v)%7==0)?[84,80,72]:null);disc(x,25,34,10,4,rgb([28,70,92]));disc(x,25,35,7,2,rgb([40,100,120]));
 px(x,10,12,rgb([102,68,40]),3,32);px(x,37,12,rgb([102,68,40]),3,32);px(x,12,12,rgb([140,96,56]),1,32);
 for(let r=0;r<9;r++){const w=18-r*1;px(x,25-w,4+r,rgb(r<4?[150,56,34]:[122,42,28]),w*2,1)}px(x,12,3,rgb([196,84,50]),26,1);
 px(x,24,12,rgb([120,84,50]),2,18);px(x,22,30,rgb([140,96,56]),6,4);px(x,23,30,rgb([180,130,80]),4,1);return SPR.well={c,ox:25,oy:44,sh:[3,1,16,6]}}
function lamp(){if(SPR.lamp)return SPR.lamp;const c=mk(11,36),x=c.getContext('2d');px(x,4,10,rgb([52,40,30]),3,26);px(x,3,34,rgb([40,30,24]),5,2);px(x,1,3,rgb([36,28,22]),9,9);px(x,2,4,rgb([236,186,84]),7,7);px(x,3,5,rgb([255,226,152]),3,3);px(x,0,2,rgb([36,28,22]),11,2);return SPR.lamp={c,ox:5,oy:35,gl:[[5,8,26]]}}
function bench(axis,rev){const key='bn2'+axis+(rev?1:0);if(SPR[key])return SPR[key];const c=mk(46,44),x=c.getContext('2d');
 const L=axis?[-28,14]:[28,14],D=axis?[6,3]:[-6,3],p0=axis?[36,16]:[10,16];
 const P=(s,t)=>[p0[0]+s*L[0]+t*D[0],p0[1]+s*L[1]+t*D[1]];
 const leg=(s,t)=>{const[X,Y]=P(s,t);px(x,Math.round(X)-1,Math.round(Y)+2,rgb([84,58,34]),2,8);px(x,Math.round(X)-1,Math.round(Y)+2,rgb([116,80,46]),1,8)};
 const back=()=>{const t0=rev?1:0,o=[p0[0]+t0*D[0],p0[1]+t0*D[1]-10];
  para(x,o,L,[0,7],(s,t)=>t>.42&&t<.58?null:rgb(t<.42?[176,130,80]:[154,110,66]));
  for(const s of[.03,.97]){const[X,Y]=P(s,t0);px(x,Math.round(X)-1,Math.round(Y)-10,rgb([100,70,42]),2,11)}};
 leg(.07,rev?0:1);leg(.93,rev?0:1);leg(.07,rev?1:0);leg(.93,rev?1:0);
 if(!rev)back();
 para(x,[p0[0],p0[1]+2],L,D,()=>rgb([96,66,40]));
 para(x,p0,L,D,(s,t)=>{const m=t*3;let k=[190,142,88];if(m%1<.16)k=[120,84,50];if(s<.03||s>.97)k=[216,170,112];return rgb(k)});
 if(rev)back();
 for(const s of[.0,1]){const[X,Y]=P(s,.5);px(x,Math.round(X)-1,Math.round(Y)-5,rgb([100,70,42]),2,5);px(x,Math.round(X)-2,Math.round(Y)-6,rgb([190,142,88]),4,1)}
 const cx_=Math.round(p0[0]+L[0]/2+D[0]/2);return SPR[key]={c,ox:cx_,oy:p0[1]+17,sh:[0,1,15,4]}}
function cat(){if(SPR.cat)return SPR.cat;const c=mk(16,12),x=c.getContext('2d'),B=[236,150,70],D=[184,100,40];disc(x,7,8,5,3,rgb(B));disc(x,11,6,3,3,rgb(B));px(x,10,2,rgb(B),2,2);px(x,13,2,rgb(B),2,2);px(x,10,6,rgb([30,24,16]));px(x,13,6,rgb([30,24,16]));px(x,4,6,rgb(D),6,1);px(x,2,9,rgb(D),2,2);return SPR.cat={c,ox:8,oy:11}}
function flowerPot(){if(SPR.pot)return SPR.pot;const c=mk(10,14),x=c.getContext('2d');px(x,2,8,rgb([190,92,52]),6,5);px(x,1,7,rgb([214,112,64]),8,2);for(let k=0;k<5;k++){px(x,1+k*2,4+(k%2)*2,rgb([['#ff8fb8','#ffd24a','#fff','#e8453c','#ff8fb8'][k]]));px(x,2+k*2,6,rgb([60,130,56]))}return SPR.pot={c,ox:5,oy:12}}
function signpost(){if(SPR.sign)return SPR.sign;const c=mk(30,40),x=c.getContext('2d');px(x,13,6,rgb([100,68,40]),3,32);px(x,14,6,rgb([146,102,60]),1,32);
 for(const[y,dir]of[[6,1],[14,-1],[22,1]]){const L=dir>0?13:1;px(x,L,y,rgb([176,128,76]),16,6);px(x,L,y,rgb([212,164,104]),16,1);px(x,L,y+5,rgb([116,80,46]),16,1);px(x,dir>0?L+16:L-2,y+1,rgb([176,128,76]),2,4);for(let k=0;k<3;k++)px(x,L+3+k*4,y+2,rgb([90,60,34]),2,1)}return SPR.sign={c,ox:15,oy:38,sh:[2,1,6,2]}}
function laundry(){if(SPR.lau)return SPR.lau;const c=mk(64,40),x=c.getContext('2d');px(x,2,6,rgb([110,76,44]),3,34);px(x,58,6,rgb([110,76,44]),3,34);ln(x,4,8,59,8,rgb([220,214,196]));
 [[10,[236,236,226]],[26,[200,70,56]],[40,[78,130,200]],[50,[238,196,70]]].forEach(([X,col],k)=>{const w=10;for(let u=0;u<w;u++)for(let v=0;v<12+(k%2)*3;v++)px(x,X+u,9+v+Math.round(Math.sin(u/2+k)*.8),rgb(mixc(col,[0,0,0],v>8?.2:0)))});return SPR.lau={c,ox:4,oy:38,sway:1}}
function campfire(){if(SPR.cf)return SPR.cf;const c=mk(44,28),x=c.getContext('2d');for(let k=0;k<9;k++){const a=k/9*6.283;bl(x,22+Math.round(Math.cos(a)*10),16+Math.round(Math.sin(a)*5),3,2,RK,k)}
 ln(x,14,20,30,12,rgb(BARK[1]));ln(x,14,19,30,11,rgb(BARK[2]));ln(x,15,12,29,21,rgb(BARK[1]));ln(x,15,11,29,20,rgb(BARK[2]));px(x,18,17,rgb([30,18,12]),8,3);return SPR.cf={c,ox:22,oy:17,sh:[0,0,14,5],fire:1}}
function pumpkinS(){if(SPR.pk)return SPR.pk;const c=mk(14,12),x=c.getContext('2d');bl(x,7,7,6,4,[[150,60,14],[200,92,22],[236,128,36],[250,168,60],[255,200,100]],3);px(x,7,2,rgb([70,110,40]),2,3);px(x,5,5,rgb([170,70,16]),1,4);px(x,9,5,rgb([170,70,16]),1,4);return SPR.pk={c,ox:7,oy:10,sh:[1,1,6,2]}}
