/* ================= LIGHT =================
   A real lighting pass, not a tint.

   There is exactly one sun. Its position comes from the clock in 10-sky.js, and
   everything else is derived from it: the colour of the daylight, how long the
   shadows are, which way they fall, how bright the ambient sky is, and how much
   warm light the ground throws back up into the shade.

   Shadows are cast per occluder. Every building and every tree is reduced to a
   footprint and a height, and its shadow is the footprint swept along the sun
   vector across the ground plane - so a cottage throws a long shadow one way at
   dawn, a short one at noon, and a long one the other way at dusk. Nothing is
   painted in, and the penumbra widens toward the tip of the shadow the way a
   real one does as the occluder-to-ground distance grows.

   Light is accumulated in a radiance buffer: ambient sky, direct sun, every lamp,
   window, lantern and fire, then diffused twice. The diffusion is the interesting
   part. Light that lands on a surface is blurred and added back to the surfaces
   around it, which is a one-and-a-half bounce diffuse global illumination
   approximation. A sunlit wall spills into the alley beside it. A lit path lifts
   the eaves above it. Shade is not black, it is full of bounced light, which is
   the whole reason the eye reads it as shade.

   The buffer is then multiplied onto the scene, but only onto the pixels the scene
   actually occupies, so the sky and the cloud sea are never touched.
   ------------------------------------------------------------------ */

const LGT={on:true,LS:4,k:.5,ow:0,oh:0,vw:0,vh:0,occ:[],src:[],mask:null,maskc:null,mbuf:null,
 ao:null,aoc:null,sil:null,silc:null,lk:null,lkc:null,lq:null,lqc:null,tmp:null,tmpc:null,
 resp:null,rw:0,rh:0,lw:null,lwc:null,ref:1,
 glow:null,lastAng:-99,built:0,cost:0,tm:{},
 sun:{ang:0,day:1,night:0,el:1.4,dx:.9,dy:-.45,col:[255,244,222],i:.6,amb:[156,170,196],ambI:.78,
  isDay:1,sx:.86,sy:.05,vis:1}};

// ---------------------------------------------------------------- canvases
function lgtCanvas(key,w,h){
 let c=LGT[key];
 if(!c){c=mk(w,h);LGT[key]=c}
 else if(c.width!==w||c.height!==h){c.width=w;c.height=h}
 return c}

// The whole buffer runs at half the frame's resolution: light is low frequency,
// the pixel art is not, so half res costs nothing the eye can see and a quarter
// of the fill.
function lgtPrep(){
 const k=LGT.k,w=LGT.vw=Math.max(8,Math.round(VW*k)),h=LGT.vh=Math.max(8,Math.round(VH*k));
 lgtCanvas('lk',w,h);lgtCanvas('tmp',w,h);
 if(!LGT.lkc)LGT.lkc=LGT.lk.getContext('2d');
 if(!LGT.tmpc)LGT.tmpc=LGT.tmp.getContext('2d');

 // the bounce buffers are a sixth of the light buffer, which is what makes the
 // blurring cheap: a few hundred pixels of blur per bounce instead of 90,000
 const qw=Math.max(6,Math.round(w/6)),qh=Math.max(6,Math.round(h/6));
 lgtCanvas('lq',qw,qh);
 if(!LGT.lqc)LGT.lqc=LGT.lq.getContext('2d');
 // the water needs to sample this light, so keep one unmasked copy of it at a
 // quarter of the frame; the shader reads it straight out of the texture unit
 const lw=Math.max(16,Math.round(w/2)),lh=Math.max(16,Math.round(h/2));
 lgtCanvas('lw',lw,lh);
 if(!LGT.lwc)LGT.lwc=LGT.lw.getContext('2d')}

// ---------------------------------------------------------------- the sun
// The clock hands the sun its angle. Everything in this file is downstream of it.
function lgtSun(){
 const hh0=(typeof W==='object'&&W&&typeof W.h==='number')?W.h:12;
 const ang=(hh0-6)/12*Math.PI, sy=Math.sin(ang);
 const day=clamp(sy,0,1), night=clamp(-sy,0,1), isDay=day>0.015?1:0;
 const s=LGT.sun;
 // the direction the light comes from, in island coordinates: a runs east, b runs north
 const ua=(isDay?1:-1)*Math.cos(ang);
 const ub=(isDay?1:-1)*(-(.32+.46*Math.abs(sy)));
 // into world pixels: +a is right-and-down, -b is right-and-up
 const dx=ua*16-ub*16, dy=ua*8+ub*8;
 const dl=Math.hypot(dx,dy)||1;
 s.dx=dx/dl; s.dy=dy/dl;              // toward the light
 s.ang=ang; s.day=day; s.night=night; s.isDay=isDay;
 // the elevation as a tangent, so shadow length is simply height / el
 s.el=isDay?(1.10+.90*day):(.95+.55*night);
 // ---- the direct light: a low sun is red and weak, a high one is white and strong
 const sunC=isDay?mixc([255,148,92],[255,248,236],sm(0,.55,day)):[150,178,255];
 s.col=sunC;
 s.i=isDay?(.26+.16*day):(.10+.05*night);
 // ---- the sky it sits in: the ambient everything in shadow is lit by.
 // At noon this is a big cool dome; at the ends of the day it is warm and dim;
 // at night it is a small cold dome and the lamps have to do the rest. The
 // afterglow outlasts the sun, so the ground keeps its colour while the sky burns.
 const tw=isDay?0:clamp(cur.warm,0,1);
 const ambC=isDay?mixc([205,152,130],[168,176,190],sm(0,.75,day))
                  :mixc([64,80,124],[198,142,118],tw*.88);
 s.amb=ambC;
 s.ambI=isDay?(.90+.02*day):Math.max(.40,(.90+.08*night)*(1-tw*.22));
 // ---- where it hangs in the screen, so the visible disc agrees with the shadows
 s.sx=clamp(.5+.44*s.dx,.05,.95);
 s.sy=isDay?clamp(.185-.155*clamp((s.el-.46)/.74,0,1),.015,.2)
            :clamp(.02+.11*(1-clamp(night,0,1)),.015,.16);
 // storms eat the sun and leave the ambient
 const st=cur.storm;
 s.i*=(1-st*.80); s.ambI*=(1-st*.16); s.amb=mixc(s.amb,[92,104,124],st*.55);
 return s}

// ---------------------------------------------------------------- what casts
// Every object tall enough to matter becomes an occluder: a footprint, a height.
function buildLight(){
 const LS=LGT.LS;
 LGT.ow=Math.ceil(Wd/LS); LGT.oh=Math.ceil(Ht/LS);
 const ow=LGT.ow,oh=LGT.oh;
 LGT.mbuf=new Uint8ClampedArray(ow*oh*4);LGT.mbuf.fill(255);
 LGT.mask=lgtCanvas('mc',ow,oh);LGT.maskc=LGT.mask.getContext('2d');
 // occluders, and the two kinds of light the world already knows about
 const occ=[],src=[];
 for(const o of objs){
  const sp=o.sp; if(!sp)continue;
  if(sp.gl)for(const g of sp.gl){
   if(!g[2])continue;
   src.push({x:o.x,y:o.y,r:g[2],gx:o.x-sp.ox+g[0],gy:o.y-sp.oy+g[1],k:0})}
  if(sp.fire)src.push({x:o.x,y:o.y,r:44,gx:o.x,gy:o.y-7,k:1});
  if(!sp.c)continue;
  const rx=clamp(sp.a!==undefined?sp.a:sp.c.width*.165,4,36);
  const hgt=clamp(sp.hgt!==undefined?sp.hgt:(sp.oy||0)*.50,13,96);
  // ground clutter is not worth a shadow; only things with real mass are
  if(rx<11||hgt<30)continue;
  occ.push({x:o.x,y:o.y,r:rx,h:hgt})}
 LGT.occ=occ;LGT.src=src;
 // ambient occlusion from the same geometry: how much sky each patch of ground can see
 const H=new Float32Array(ow*oh);
 for(const o of occ){
  const cx=o.x/LS,cy=o.y/LS,rx=o.r/LS*1.5,ry=o.r/LS*1.2;
  const i0=Math.max(0,Math.floor(cx-rx)),i1=Math.min(ow-1,Math.ceil(cx+rx));
  const j0=Math.max(0,Math.floor(cy-ry)),j1=Math.min(oh-1,Math.ceil(cy+ry));
  const rt=Math.min(1,o.h/90);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){
   const nx=(i+.5-cx)/Math.max(1,rx),ny=(j+.5-cy)/Math.max(1,ry);
   const d=1-(nx*nx+ny*ny);
   if(d<=0)continue;
   const v=rt*d*1.6;const k=j*ow+i;
   if(v>H[k])H[k]=Math.min(1,v)}}
 // blur the occupancy so the occlusion sits under things instead of on them
 let A=H,B=new Float32Array(ow*oh);
 for(let pass=0;pass<2;pass++){
  for(let j=0;j<oh;j++){const jm=j>0?j-1:j,jp=j<oh-1?j+1:j;
   for(let i=0;i<ow;i++){const im=i>0?i-1:i,ip=i<ow-1?i+1:i;
    B[j*ow+i]=(A[j*ow+im]+A[j*ow+i]+A[j*ow+ip]
             +A[jm*ow+im]+A[jm*ow+i]+A[jm*ow+ip]
             +A[jp*ow+im]+A[jp*ow+i]+A[jp*ow+ip])/9}}
  const t=A;A=B;B=t}
 LGT.ao=lgtCanvas('aoc_c',ow,oh);LGT.aoc=LGT.ao.getContext('2d');
 const id=LGT.aoc.createImageData(ow,oh),d=id.data;
 for(let k=0;k<ow*oh;k++){
  const v=clamp(A[k],0,1), g=Math.round(255*(1-.26*v));
  d[k*4]=g;d[k*4+1]=g;d[k*4+2]=g;d[k*4+3]=255}
 LGT.aoc.putImageData(id,0,0);
 // one pre-rendered pool of light, drawn for every lamp
 const gs=lgtCanvas('glow',128,128),gc=gs.getContext('2d');
 const gr=gc.createRadialGradient(64,64,0,64,64,64);
 gr.addColorStop(0,'rgba(255,240,208,1)');gr.addColorStop(.30,'rgba(255,212,146,.52)');
 gr.addColorStop(.62,'rgba(255,172,100,.15)');gr.addColorStop(1,'rgba(255,152,82,0)');
 gc.fillStyle=gr;gc.fillRect(0,0,128,128);
 // the shape of the land itself, which never changes: that is what keeps the
 // sky out of the multiply without copying the frame every tick
 LGT.sil=lgtCanvas('sil',ow,oh);
 const silc=LGT.sil.getContext('2d');
 silc.setTransform(1,0,0,1,0,0);silc.clearRect(0,0,ow,oh);
 silc.imageSmoothingEnabled=true;
 if(stc)silc.drawImage(stc,0,0,ow,oh);
 bakeResp();
 LGT.built=1;LGT.lastAng=-99}

// ---------------------------------------------------------------- which way a surface faces
/* A flat tint cannot tell a wall that faces the morning from the one behind it. So the
   surfaces are baked once into a height field - the land as a low plateau, every object as
   a bump of its own height - and the slope of that field is the surface normal. Eight
   responses, one per sun azimuth, are painted from it; each frame the two nearest are
   cross-faded and multiplied into the direct light, so as the sun crosses the sky the
   lit faces of every cottage change sides. Flat ground stays at full sun; a wall turned
   away from it drops to the ambient, which is what makes geometry read at all. */
function bakeResp(){
 lgtSun();
 const LS=LGT.LS,ow=LGT.ow,oh=LGT.oh;
 const cw=LGT.rw=Math.max(8,Math.ceil(ow/2)),ch=LGT.rh=Math.max(8,Math.ceil(oh/2));
 const n=cw*ch,H=new Float32Array(n);
 const sc=1/(LS*2);
 // the island itself, as a low plateau, so the coast is a slope the sun grazes
 if(stc){
  const cv=lgtCanvas('cov',cw,ch),cc=cv.getContext('2d');
  cc.setTransform(1,0,0,1,0,0);cc.globalCompositeOperation='source-over';cc.globalAlpha=1;
  cc.clearRect(0,0,cw,ch);cc.imageSmoothingEnabled=true;
  cc.drawImage(stc,0,0,cw,ch);
  const id=cc.getImageData(0,0,cw,ch),d=id.data;
  for(let k=0;k<n;k++)H[k]=d[k*4+3]/255*.20}
 // every object that stands up, as a smooth dome. A sprite's own alpha is holes and
 // dither; a dome has one honest normal, and that is the thing that should turn to
 // face the sun as it crosses.
 for(const o of LGT.occ){
  const cx=o.x*sc,cy=(o.y-o.h*.40)*sc,rx=Math.max(1.6,o.r*sc*1.55),ry=Math.max(1.4,o.r*sc*1.30);
  const hv=.22+.62*clamp(o.h/96,0,1);
  const i0=Math.max(0,Math.floor(cx-rx)),i1=Math.min(cw-1,Math.ceil(cx+rx));
  const j0=Math.max(0,Math.floor(cy-ry)),j1=Math.min(ch-1,Math.ceil(cy+ry));
  for(let j=j0;j<=j1;j++){
   const ny=(j+.5-cy)/ry,ny2=ny*ny;if(ny2>=1)continue;
   for(let i=i0;i<=i1;i++){
    const nx=(i+.5-cx)/rx,d2=nx*nx+ny2;if(d2>=1)continue;
    const v=.20*(1-d2)+hv*Math.sqrt(1-d2),k=j*cw+i;
    if(v>H[k])H[k]=v}}}
 // soften once more so dome rims are not stair-stepped at this resolution
 const B=new Float32Array(n);
 for(let j=0;j<ch;j++){const jm=j>0?j-1:j,jp=j<ch-1?j+1:j;
  for(let i=0;i<cw;i++){const im=i>0?i-1:i,ip=i<cw-1?i+1:i;
   B[j*cw+i]=((H[j*cw+im]+2*H[j*cw+i]+H[j*cw+ip])
            +2*(H[jm*cw+im]+2*H[jm*cw+i]+H[jm*cw+ip])
            +(H[jp*cw+im]+2*H[jp*cw+i]+H[jp*cw+ip]))/16}}
 // eight suns, one per azimuth; the elevation decides how much a face can catch
 const K=5.0,az=8,Lz=clamp(LGT.sun.el*.62,.42,.98);
 const resp=LGT.resp=LGT.resp||[];
 for(let a=0;a<az;a++){
  const th=a/az*Math.PI*2,Lx=Math.cos(th),Ly=Math.sin(th);
  const o=lgtCanvas('rsp'+a,cw,ch),oc=o.getContext('2d');
  const out=oc.createImageData(cw,ch),od=out.data;
  for(let j=0;j<ch;j++){const jm=j>0?j-1:j,jp=j<ch-1?j+1:j;
   for(let i=0;i<cw;i++){const im=i>0?i-1:i,ip=i<cw-1?i+1:i;
    const gx=((B[j*cw+ip]+2*B[jp*cw+ip]+B[jm*cw+ip])-(B[j*cw+im]+2*B[jp*cw+im]+B[jm*cw+im]))*.125;
    const gy=((B[jp*cw+im]+2*B[jp*cw+i]+B[jp*cw+ip])-(B[jm*cw+im]+2*B[jm*cw+i]+B[jm*cw+ip]))*.125;
    const sx=-gx*K,sy=-gy*K,il=1/Math.sqrt(1+sx*sx+sy*sy);
    let v=(sx*Lx+sy*Ly)*il/Lz+il;
    v=.16+.84*clamp(v,0,1);
    const g=Math.round(255*v),k=(j*cw+i)*4;
    od[k]=od[k+1]=od[k+2]=g;od[k+3]=255}}
  oc.putImageData(out,0,0);resp[a]=o}}

// ---------------------------------------------------------------- casting
// The mask holds the sky's view: alpha 255 means the patch is open to the sun.
// Every occluder then wipes its shadow out of it, so what is left is where the
// sun actually reaches.
function lgtCast(){
 const s=LGT.sun,ow=LGT.ow,oh=LGT.oh,LS=LGT.LS,mb=LGT.mbuf;
 mb.fill(255);                        // start with the whole world in the open
 const sx=-s.dx,sy=-s.dy;             // the shadow runs away from the light
 const el=Math.max(.3,s.el),occ=LGT.occ;
 // nothing outside the frame can be seen, so nothing outside it needs casting
 const vl=-TX/Z-90,vr=(VW-TX)/Z+90,vt=-TY/Z-150,vb=(VH-TY)/Z+90;
 for(let n=0;n<occ.length;n++){
  const o=occ[n],r=o.r,L=Math.min(340,o.h/el);
  if(o.x+r<vl||o.x-r>vr+L||o.y+r<vt||o.y-r>vb+L)continue;
  const ex=o.x+sx*L,ey=o.y+sy*L;
  const bx0=Math.min(o.x,ex)-r,bx1=Math.max(o.x,ex)+r;
  const by0=Math.min(o.y,ey)-r,by1=Math.max(o.y,ey)+r;
  const i0=Math.max(0,(bx0/LS)|0),i1=Math.min(ow-1,(bx1/LS|0)+1);
  const j0=Math.max(0,(by0/LS)|0),j1=Math.min(oh-1,(by1/LS|0)+1);
  if(i1<i0||j1<j0)continue;
  const rr=r*r;
  for(let j=j0;j<=j1;j++){
   const Y=(j+.5)*LS-o.y;
   let X=i0*LS+LS*.5-o.x;
   for(let ii=i0;ii<=i1;ii++,X+=LS){
    // distance to the capsule: the footprint swept from the object to its shadow tip
    let u=X*sx+Y*sy;
    if(u<0)u=0;else if(u>L)u-=L;else u=0;
    const v=X*sy-Y*sx, d2=u*u+v*v;
    if(d2>=rr)continue;
    const d=Math.sqrt(d2),a=(r-d)/(1.5+u*.055);
    if(a<=0)continue;
    const k=(j*ow+ii)*4, na=255-Math.min(1,a)*255;
    if(na<mb[k+3])mb[k+3]=na}}}
 LGT.maskc.putImageData(new ImageData(mb,ow,oh),0,0)}

// ---------------------------------------------------------------- the frame
function lightPass(ctx){
 if(!LGT.on||!LGT.built)return;
 const t0=performance.now(),tm=LGT.tm;
 lgtPrep();
 const s=lgtSun();
 // rebuild the shadows only when the sun has actually moved
 if(Math.abs(s.ang-LGT.lastAng)>.040){const c0=performance.now();lgtCast();LGT.lastAng=s.ang;tm.cast=performance.now()-c0}
 // the things floating on the water live on their own layer, which the pass cannot
 // reach; give them the same shade, or the jetty glows at midnight
 if(typeof SURF==='object'&&SURF&&SURF.ctx){
  const sc2=SURF.ctx,cw=sc2.canvas.width,ch=sc2.canvas.height;
  const sh=(s.amb[0]+s.amb[1]+s.amb[2])/3*s.ambI/245;
  sc2.setTransform(1,0,0,1,0,0);
  sc2.globalCompositeOperation='source-atop';
  sc2.fillStyle=`rgba(0,0,0,${clamp(1-sh,0,.92).toFixed(3)})`;
  sc2.fillRect(0,0,cw,ch);
  sc2.globalCompositeOperation='source-over'}
 const k=LGT.k,w=LGT.vw,h=LGT.vh;
 const L=clamp(cur.night,0,1);
 const lk=LGT.lk,lkc=LGT.lkc,q=LGT.lq,qc=LGT.lqc,tm2=LGT.tmp,tc=LGT.tmpc;
 // 1. the ambient sky, flat, before anything is occluded
 lkc.setTransform(1,0,0,1,0,0);lkc.globalAlpha=1;
 lkc.globalCompositeOperation='source-over';
 const amb=s.ambI,ac=s.amb;
 lkc.fillStyle=`rgb(${Math.min(255,Math.round(ac[0]*amb))},${Math.min(255,Math.round(ac[1]*amb))},${Math.min(255,Math.round(ac[2]*amb))})`;
 lkc.fillRect(0,0,w,h);
 // 2. occlusion: the sky each patch of ground can actually see
 lkc.setTransform(Z*k,0,0,Z*k,TX*k,TY*k);
 lkc.imageSmoothingEnabled=true;
 lkc.globalCompositeOperation='multiply';
 lkc.drawImage(LGT.ao,0,0,LGT.ow*LGT.LS,LGT.oh*LGT.LS);
 // 3. the sun itself: shaped by how each surface faces it, then clipped to the
 //    places the shadow mask says the light still reaches
 tc.setTransform(1,0,0,1,0,0);tc.globalCompositeOperation='source-over';tc.globalAlpha=1;
 tc.clearRect(0,0,w,h);
 tc.fillStyle=`rgb(${Math.round(s.col[0]*s.i)},${Math.round(s.col[1]*s.i)},${Math.round(s.col[2]*s.i)})`;
 tc.fillRect(0,0,w,h);
 const rw=LGT.rw,rh=LGT.rh;
 if(LGT.resp&&LGT.resp.length&&rw){
  // the sun's azimuth picks two of the eight baked responses and fades between them
  const az=LGT.resp.length;
  const th=((Math.atan2(s.dy,s.dx)/6.283185+1)%1)*az;
  const a0=Math.floor(th)%az,a1=(a0+1)%az,fr=th-Math.floor(th);
  const ww=rw*LGT.LS*2,wh=rh*LGT.LS*2;
  tc.globalCompositeOperation='multiply';tc.imageSmoothingEnabled=true;
  tc.setTransform(Z*k,0,0,Z*k,TX*k,TY*k);
  tc.drawImage(LGT.resp[a0],0,0,ww,wh);
  if(fr>.01){tc.globalAlpha=fr;tc.drawImage(LGT.resp[a1],0,0,ww,wh);tc.globalAlpha=1}
  tc.setTransform(1,0,0,1,0,0);
  tc.globalCompositeOperation='destination-in';tc.imageSmoothingEnabled=false;
  tc.setTransform(Z*k,0,0,Z*k,TX*k,TY*k);
  tc.drawImage(LGT.mask,0,0,LGT.ow*LGT.LS,LGT.oh*LGT.LS);
  tc.setTransform(1,0,0,1,0,0)}
 else{
  tc.globalCompositeOperation='destination-in';tc.imageSmoothingEnabled=false;
  tc.setTransform(Z*k,0,0,Z*k,TX*k,TY*k);
  tc.drawImage(LGT.mask,0,0,LGT.ow*LGT.LS,LGT.oh*LGT.LS);
  tc.setTransform(1,0,0,1,0,0)}
 lkc.globalCompositeOperation='lighter';
 lkc.setTransform(1,0,0,1,0,0);
 lkc.drawImage(tm2,0,0);
 tm.prep=performance.now()-t0;
 // 4. every lamp, window, lantern and fire, as a pool on the ground
 const t1=performance.now();
 lkc.setTransform(Z*k,0,0,Z*k,TX*k,TY*k);
 const near=[],emis=L>.04?clamp((L-.04)*1.30,0,1):0;
 const l=-TX/Z,vr=(VW-TX)/Z,tp=-TY/Z,bt=(VH-TY)/Z;
 for(let n=0;n<LGT.src.length;n++){
  const S=LGT.src[n];
  if(S.x<l-160||S.x>vr+160||S.y<tp-200||S.y>bt+160)continue;
  near.push(S);
  if(emis<=0)continue;
  const rr=S.r*(1+.25*L);
  lkc.globalAlpha=clamp(emis*(S.k?1.15:1)*.55,0,1);
  lkc.drawImage(LGT.glow,S.x-rr,S.y-rr*.72,rr*2,rr*1.44)}
 lkc.globalAlpha=1;
 tm.lamp=performance.now()-t1;
 // 5. the bounce. light that landed somewhere is thrown back at everything near it.
 const t2=performance.now();
 qc.setTransform(1,0,0,1,0,0);qc.globalCompositeOperation='source-over';qc.globalAlpha=1;
 qc.imageSmoothingEnabled=true;qc.drawImage(lk,0,0,q.width,q.height);
 lkc.globalCompositeOperation='lighter';lkc.setTransform(1,0,0,1,0,0);
 lkc.globalAlpha=.05;lkc.drawImage(q,0,0,w,h);
 qc.globalAlpha=.55;qc.drawImage(q,0,0,q.width,q.height);qc.globalAlpha=1;
 lkc.globalAlpha=.022;lkc.drawImage(q,0,0,w,h);
 lkc.globalCompositeOperation='source-over';
 lkc.globalAlpha=1;
 tm.bounce=performance.now()-t2;
 // 5b. keep the unmasked buffer for the water, and remember how bright "open sky"
 //     is right now, so the pond can tell sun from shade from lamplight
 const t2b=performance.now();
 if(LGT.lwc){
  const lwv=LGT.lw,LW=LGT.lwc;
  LW.setTransform(1,0,0,1,0,0);LW.globalCompositeOperation='source-over';LW.globalAlpha=1;
  LW.drawImage(lk,0,0,lwv.width,lwv.height);
  LGT.ref=Math.max(.05,(ac[0]+ac[1]+ac[2])/3*amb/255+s.i*.55)}
 tm.water=performance.now()-t2b;
 // 6. multiply it onto the scene, but only where the scene is: the sky is not ours
 const t3=performance.now();
 lkc.globalAlpha=1;
 lkc.globalCompositeOperation='destination-in';
 lkc.setTransform(Z*k,0,0,Z*k,TX*k,TY*k);
 lkc.drawImage(LGT.sil,0,0,LGT.ow*LGT.LS,LGT.oh*LGT.LS);
 ctx.setTransform(1,0,0,1,0,0);
 ctx.globalCompositeOperation='multiply';
 ctx.imageSmoothingEnabled=true;
 ctx.drawImage(lk,0,0,VW,VH);
 ctx.globalCompositeOperation='source-over';
 ctx.imageSmoothingEnabled=false;
 tm.mul=performance.now()-t3;
 // 7. and the light that is brighter than the thing under it: the pool itself
 if(L>.05&&near.length){
  const t4=performance.now();
  ctx.setTransform(Z,0,0,Z,TX,TY);
  ctx.globalCompositeOperation='lighter';
  const cx=(VW*.5-TX)/Z,cy=(VH*.55-TY)/Z;
  near.sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy));
  const N=Math.min(near.length,22);
  for(let n=0;n<N;n++){
   const S=near[n],rr=S.r*(1+.25*L);
   ctx.globalAlpha=clamp((.06+.16*L)*(S.k?1.25:1),0,.3);
   ctx.drawImage(LGT.glow,S.gx-rr,S.gy-rr*.8,rr*2,rr*1.6)}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  tm.pool=performance.now()-t4}
 ctx.setTransform(1,0,0,1,0,0);
 LGT.cost=performance.now()-t0}

// ---------------------------------------------------------------- what the sun looks like from here
// The HUD reads this, the sky shader reads it, and the smoke test reads it, so
// there is exactly one answer for where the light is.
function sunNow(){const s=LGT.sun;return{h:+((typeof W==='object'&&W)?W.h:12).toFixed(2),
 day:+s.day.toFixed(3),night:+s.night.toFixed(3),el:+s.el.toFixed(3),
 dx:+s.dx.toFixed(3),dy:+s.dy.toFixed(3),i:+s.i.toFixed(3),sx:+s.sx.toFixed(3),sy:+s.sy.toFixed(3),
 col:s.col.map(Math.round)}}
