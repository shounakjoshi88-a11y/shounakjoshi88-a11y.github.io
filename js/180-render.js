/* ================= SCENE: runtime ================= */
const WSTEP=4;let WFLD=null,WGW=0,WGH=0,FLD=null,SKYC=[120,180,220],WVIS=[0,0,0,0];
// --- noise for the water surface, the same family the village uses
const nz2=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);
  return lerp(lerp(hh(i,j),hh(i+1,j),ux),lerp(hh(i,j+1),hh(i+1,j+1),ux),uy)};
const fbm2=(x,y)=>{let a=.5,sum=0;for(let i=0;i<4;i++){sum+=a*nz2(x,y);x=x*2.03+1.7;y=y*2.03+9.2;a*=.5}return sum};
// --- the height of the water surface at a world pixel: two noise layers plus every live ripple
function surf(X,Y){
  const px=(X-(POND[0]*16+832))/95,py=(Y-(POND[1]*8+110))/62;
  let h=(fbm2(px*5+T*.014,py*5+T*.011)*.6+fbm2(px*13-T*.02,py*13+T*.014)*.25)*9;
  for(const r of rps){const t=T-r.t;if(t<0||t>5)continue;
    const e=Math.hypot(X-r.x,(Y-r.y)*2)-t*34;
    h+=Math.sin(e*.32)*Math.exp(-e*e/90)*Math.exp(-t*.42)*5}
  return h}
// Water: a real surface. The floor shows through and bends, light focuses on the ripples,
// the sky reflects at grazing angles, and the shore foams.
function water(){
  const[x0,y0,w,h]=wb,d=wi.data,fl=FLD.data;
  const fl32=new Uint32Array(FLD.data.buffer),d32=new Uint32Array(wi.data.buffer);
  rps=rps.filter(r=>T-r.t<6).slice(-10);
  const gw=(w/WSTEP|0)+2,gh=(h/WSTEP|0)+2;
  if(!WFLD||WGW!==gw||WGH!==gh){WGW=gw;WGH=gh;WFLD=new Float32Array(gw*gh*4)}
  for(let gy=0;gy<gh;gy++)for(let gx=0;gx<gw;gx++){
    const X=x0+gx*WSTEP,Y=y0+gy*WSTEP;
    WFLD[(gy*gw+gx)*4]=surf(X,Y)}
  for(let gy=0;gy<gh;gy++)for(let gx=0;gx<gw;gx++){
    const i=gy*gw+gx,xm=gx>0?gx-1:0,xp=gx<gw-1?gx+1:gx-1,ym=gy>0?gy-1:0,yp=gy<gh-1?gy+1:gy-1;
    const c=WFLD[i*4],hl=WFLD[(gy*gw+xm)*4],hr=WFLD[(gy*gw+xp)*4],hu=WFLD[(ym*gw+gx)*4],hd=WFLD[(yp*gw+gx)*4];
    WFLD[i*4+1]=(hr-hl)/(2*WSTEP);
    WFLD[i*4+2]=(hd-hu)/(2*WSTEP);
    // light gathers where the surface bends: that is the caustic
    const lap=(hl+hr+hu+hd-4*c)/(WSTEP*WSTEP);
    WFLD[i*4+3]=clamp(-lap*.0016,0,1)};
  const night=cur.night,storm=cur.storm;
  const vx0=clamp(Math.round(WVIS[0]-x0),0,w-1),vx1=clamp(Math.round(WVIS[1]-x0),0,w-1);
  const vy0=clamp(Math.round(WVIS[2]-y0),0,h-1),vy1=clamp(Math.round(WVIS[3]-y0),0,h-1);
  for(let y=vy0;y<=vy1;y++){const gy=(y/WSTEP)|0;
    for(let x=vx0;x<=vx1;x++){
      const X=x+x0,Y=y+y0,dep=wm[Y*Wd+X];
      if(!dep)continue;
      const gx=(x/WSTEP)|0,i=(gy*gw+gx)*4,hx=WFLD[i+1],hy=WFLD[i+2],cau=WFLD[i+3];
      let nx=-hx*.9,ny=-hy*.9,nz=1;const nl=Math.sqrt(nx*nx+ny*ny+1);nx/=nl;ny/=nl;nz/=nl;
      const dp=dep/255;
      // refraction: the floor bends through the surface
      const amp=(.5+dp)*2.6;
      const sx=clamp(Math.round(X+nx*amp)-x0,0,w-1),sy=clamp(Math.round(Y+ny*amp*1.5)-y0,0,h-1);
      const fv=fl32[(sy*w+sx)<<2];
      let R=fv&255,G=(fv>>8)&255,B=(fv>>16)&255;
      const deep=clamp((dp-.05)*1.5,0,1);
      R=lerp(R,16,deep*.7);G=lerp(G,74,deep*.7);B=lerp(B,88,deep*.66);
      const sh2=clamp(.32-dp,0,.32);
      R=lerp(R,88,sh2);G=lerp(G,152,sh2);B=lerp(B,122,sh2);
      // caustics
      const cs=clamp(cau*(1-dp*.55),0,1);
      R=lerp(R,255,cs*.6);G=lerp(G,252,cs*.6);B=lerp(B,224,cs*.52);
      // fresnel: the sky lies on the water at grazing angles
      const fr=clamp(.04+.62*Math.pow(1-nz,2.2),0,.85)*(1-storm*.5);
      R=lerp(R,SKYC[0],fr*.72);G=lerp(G,SKYC[1],fr*.72);B=lerp(B,SKYC[2],fr*.72);
      // the sun caught on the ripples
      const sp=Math.pow(Math.max(0,nx*-.34+ny*-.42+nz*.84),160)*(1-night*.75)*(1-storm*.7);
      R=clamp(R+sp*230,0,255);G=clamp(G+sp*225,0,255);B=clamp(B+sp*190,0,255);
      // stars on the water at night
      if(night>.2&&hh((X*2)|0,(Y*2)|0)>.996){R=clamp(R+90*night,0,255);G=clamp(G+100*night,0,255);B=clamp(B+120*night,0,255)}
      // foam where the water meets the shore
      const edge=1-clamp(dp*9,0,1);
      if(edge>0){const lap=Math.sin(T*1.7+X*.22+Y*.18)*.5+.5,f=edge*edge*lap;
        R=lerp(R,244,f*.92);G=lerp(G,249,f*.92);B=lerp(B,246,f*.92)}
      R=lerp(R,R*.34+6,night*.5);G=lerp(G,G*.4+12,night*.5);B=lerp(B,B*.55+26,night*.45);
      const o=(y*w+x)<<2;d32[o>>2]=(255<<24)|((B|0)<<16)|((G|0)<<8)|(R|0)}}
  for(const r of rps){const t=T-r.t;if(t<0)continue;
    const rad=t*36+26,bx0=clamp(Math.round(r.x-rad-x0),0,w-1),bx1=clamp(Math.round(r.x+rad-x0),0,w-1);
    const by0=clamp(Math.round(r.y-rad*.5-y0),0,h-1),by1=clamp(Math.round(r.y+rad*.5-y0),0,h-1);
    for(let y=Math.max(by0,vy0);y<=Math.min(by1,vy1);y++)for(let x=Math.max(bx0,vx0);x<=Math.min(bx1,vx1);x++){
      const X=x+x0,Y=y+y0;if(!wm[Y*Wd+X])continue;
      const e=Math.hypot(X-r.x,(Y-r.y)*2)-rad,f=Math.sin(e*.55)*Math.exp(-e*e/70)*Math.exp(-t*.5),o=(y*w+x)<<2;
      const v=d32[o>>2];
      d32[o>>2]=(255<<24)|(clamp(((v>>16)&255)+f*70,0,255)<<16)|(clamp(((v>>8)&255)+f*80,0,255)<<8)|clamp((v&255)+f*75,0,255)}}
  wc.getContext('2d').putImageData(wi,0,0);c2.drawImage(wc,wb[0],wb[1])}
function life(){const c=c2;
 // When there is no WebGL the pond falls back to the painted water, so the fish live here too.
 if(!GL.ok){
  const K=(a,f)=>PF(POND[0]+Math.cos(a)*3.1*(1+.1*f),POND[1]+Math.sin(a*1.1)*2.3);
  for(let f=0;f<6;f++){const a=KA[f];for(let s=0;s<4;s++){const[x,y]=K(a-s*.1,f);c.fillStyle='rgba(5,30,45,.35)';c.fillRect((x|0)+2,(y|0)+3,3-(s>>1),2);c.fillStyle=s==1?'#fff1e0':'#ff7a2a';c.fillRect(x|0,y|0,s==0?3:s==3?1:2,2)}}
  {const a=T*.32,[mx,my]=PF(POND[0]+Math.cos(a)*3.6,POND[1]+Math.sin(a)*1.1);
   c.fillStyle='rgba(6,34,48,.3)';c.fillRect((mx|0)-7,(my|0)+3,14,3);
   c.fillStyle='#fff3e4';c.fillRect((mx|0)-6,(my|0)-3,11,5);c.fillStyle='#ff7a2a';c.fillRect((mx|0)-2,(my|0)-4,5,7);
   c.fillStyle='#ff7a2a';c.fillRect((mx|0)+5,(my|0)-2,3,3);c.fillStyle='#fff3e4';c.fillRect((mx|0)+2,(my|0)-3,2,5);
   c.fillStyle='#2a1a12';c.fillRect((mx|0)+4,(my|0)-2,1,1);
   MZ=[POND[0]+Math.cos(a)*3.6,POND[1]+Math.sin(a)*1.1]}
  [[24.2,21.8],[28.6,22.4],[27.6,25.2],[23.6,24.6],[25.8,21.4],[28.9,24.0],[23.0,22.6],[29.4,26.2],[26.0,27.4]].forEach(([i,j],q)=>{
   const[x,y]=PF(i,j),b=Math.round(Math.sin(T*.8+q)*.6);
   for(let dy=-2;dy<=2;dy++){const w=Math.round(5*Math.sqrt(1-dy*dy/7));c.fillStyle=dy<0?'#69c455':'#3f9a3d';c.fillRect(x-w,y+dy+b,w*2,1)}
   if(q%3==0){c.fillStyle='#ff9ec0';c.fillRect(x-1,y-2+b,3,2);c.fillStyle='#fff3a0';c.fillRect(x,y-1+b,1,1)}});
  const[bx0,by]=PF(26.4,18.9),bo=Math.sin(T*1.1)*.8;
  for(let k=-11;k<=11;k++){const y=Math.floor(by+bo+Math.floor(k*.5)-(Math.abs(k)>8?1:0));c.fillStyle='#c28a52';c.fillRect(bx0+k,y,1,1);c.fillStyle='#8a5a30';c.fillRect(bx0+k,y+1,1,2)}
  c.fillStyle='#d9b27a';c.fillRect(bx0-2,Math.floor(by+bo)-1,4,1);
 }}

function sprites(l,r,t,b){const c=c2,n=cur.night;extraLife(c,l,r,t,b,n);
 // chickens
 for(let q=0;q<4;q++){const fi=16.9+Math.sin(T*.31+q*1.9)*.55+Math.sin(T*.7+q)*.1,fj=13.4+Math.cos(T*.27+q*2.7)*.5,[X0,Y0]=PF(fi,fj),X=Math.round(X0),Y=Math.round(Y0),dr=Math.cos(T*.31+q*1.9)>0?1:-1,pk=Math.max(0,Math.sin(T*3+q*2))>.7?1:0,wh=q%2,
   C=wh?[[252,248,240],[230,224,212],[200,192,180]]:[[206,120,66],[170,88,46],[130,62,32]],st=Math.sin(T*6+q)>.6?1:0;
  c.fillStyle='rgba(10,20,10,.3)';c.fillRect(X-4,Y,9,2);px(c,X-1,Y-3+st,'#d9902a',1,4);px(c,X+1,Y-3,'#d9902a',1,4);px(c,X-2,Y,'#c27a1c',2,1);px(c,X,Y,'#c27a1c',2,1);
  disc(c,X,Y-5,4,3,rgb(C[0]));disc(c,X,Y-4,4,2,rgb(C[1]));px(c,X-1,Y-6,rgb(C[2]),3,2);px(c,X-dr*4,Y-9,rgb(C[2]),2,3);px(c,X-dr*5,Y-10,rgb(C[1]),1,3);px(c,X-dr*3,Y-8,rgb(C[0]),1,2);
  const hx=X+dr*4,hy=Y-8+pk*3;px(c,hx-dr*(pk?0:1),hy+(pk?-2:2),rgb(C[0]),2,3);disc(c,hx,hy,2,2,rgb(C[0]));px(c,hx,hy-3,'#d6342a',2,2);px(c,hx+dr*2,hy,'#f0a030',2,1);px(c,hx+dr*2-(dr>0?0:1),hy+1,'#d6342a',1,2);px(c,hx,hy,'#1a1412',1,1)}
 // butterflies (daytime)
 if(n<.6)for(let q=0;q<6;q++){const[X0,Y0]=PF(13.6+(q%3)*1.4,14.6+Math.floor(q/3)*2.2),X=Math.round(X0+Math.sin(T*.7+q*2)*40+Math.sin(T*2.3+q)*6),Y=Math.round(Y0-18+Math.cos(T*.9+q*3)*16),w=Math.sin(T*18+q*5)>0?2:1,col=['#ffd24a','#ffffff','#ff8fb8','#8ec8ff','#ff9a3c','#ffffff'][q];c.globalAlpha=1-n;px(c,X-w,Y,col,w,2);px(c,X+1,Y,col,w,2);px(c,X,Y,'#2a2018',1,2);c.globalAlpha=1}
 // birds: a loose flock drifting across the whole sky, wings beating out of step
 if(n<.5&&cur.storm<.5)for(let q=0;q<10;q++){const X=((T*(9+q%3*2)+q*310)%3500)-200,Y=70+(q%5)*95+Math.sin(T*.4+q)*10,ph=T*(8+q%3)+q,fl=Math.sin(ph),big=q%4==0?1:0;if(X<l||X>r||Y<t||Y>b)continue;
  c.fillStyle=q%3?'rgba(26,30,36,.82)':'rgba(250,250,246,.95)';const w=2+big,u=fl>.3?-2:fl<-.3?2:0;c.fillRect(X,Y,2,1+big);for(let k=1;k<=w+1;k++){c.fillRect(X-k*2,Y+u*(k>1?1:.5)+(k>2?u:0),2,1);c.fillRect(X+k*2,Y+u*(k>1?1:.5)+(k>2?u:0),2,1)}}
 // leaves & snow
 for(const[bx,by,k]of LEAVES){const p=(T*.1+hh(k,1))%1,X=bx+p*30+Math.sin(T*1.4+k)*5,Y=by-40+p*70;if(X<l||X>r||Y<t||Y>b)continue;if(hh(k,5)>SE.leaf||(W.s==1&&cur.night<.25))continue;c.fillStyle=LCOL[W.s][k%3];c.fillRect(X|0,Y|0,2,1);c.fillRect((X|0)+1,(Y|0)+1,1,1)}
 for(const[bx,by,k]of FLAKES){const p=(T*.07+hh(k,2))%1,X=bx+Math.sin(T*.9+k)*6+p*8,Y=by-50+p*80;if(X<l||X>r||Y<t||Y>b||hh(k,6)>SE.snow)continue;c.fillStyle='rgba(255,255,255,.9)';c.fillRect(X|0,Y|0,1,1);if(k%4==0)c.fillRect((X|0)+1,Y|0,1,1)}}
let SCR=null;
function rz(){VW=Math.ceil(innerWidth/WS);VH=Math.ceil(innerHeight/WS);fx2.width=VW;fx2.height=VH;c2.imageSmoothingEnabled=false;Z=clamp(Math.round((innerWidth<900?1.5:1)/WS*4)/4,.75,3);ZBASE=Z;if(!SCR)SCR=mk(64,64);SCR.width=VW;SCR.height=VH;if(window.__z)Z=window.__z;sizeGL()}
function ripple(x,y,s,dl){if(!wm)return;if(s>2){const PO=CAMT[0]>70?POND2:POND,[px_,py]=PF(PO[0],PO[1]),a=Math.random()*6.28;rps.push({x:px_+Math.cos(a)*22,y:py+Math.sin(a)*11,t:T+(dl||0)});startle=1;return}const wx=(x/WS-TX)/Z,wy=(y/WS-TY)/Z;if(wx>0&&wy>0&&wx<Wd&&wy<Ht&&wm[(wy|0)*Wd+(wx|0)]){rps.push({x:wx,y:wy,t:T});if(s>1.5){startle=Math.min(1,startle+.7);splashAt(wx,wy,12);duckReact(wx,wy)}}}
function fx(){const ctx=c2,p=window.__p!=null?window.__p:clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight),0,1),f=p*(CH.length-1),n=cur.night,w=cur.warm;
  const expl=MODE==='explore',starty=MODE==='start';
  let ci,cj;
  if(expl&&PL){playerTick();ci=CF[0];cj=CF[1]}
  else if(starty){const sc=startCam();ci=sc[0];cj=sc[1]}
  else{[ci,cj]=window.__cam||camAt(f)}
  const zt=zTarget();Z+=(zt-Z)*.16;if(Math.abs(zt-Z)<.002)Z=zt;
  let[cx,cy]=PF(ci,cj);
  if(expl){const hw=VW/(2*Z),vh=VH/Z;cx=hw*2>=Wd?Wd/2:clamp(cx,hw,Wd-hw);cy=vh>=Ht?Ht/2:clamp(cy,vh*.60,Ht-vh*.40)}
  CAMT=[((cx-OX)/16+(cy-OY)/8)/2,((cy-OY)/8-(cx-OX)/16)/2];GLW=[];
  const pmx=starty?0:(expl?PM.x*7:PM.x),pmy=starty?0:(expl?PM.y*5:PM.y);
  TX=Math.round(VW*(!expl&&!starty&&innerWidth>innerHeight*1.1?lerp(.66,.5,Math.min(1,f/(CH.length-1))):.5)-cx*Z-pmx*12);TY=Math.round(VH*(expl?.60:.56)-cy*Z-pmy*8);bubbleTick(f);
 ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.clearRect(0,0,VW,VH);
 if(!GL.ok){ctx.setTransform(1,0,0,1,0,0);const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,`rgb(${lerp(30,4,n)+w*55|0},${lerp(62,8,n)+w*8|0},${lerp(78,20,n)|0})`);g.addColorStop(1,`rgb(${lerp(58,10,n)+w*60|0},${lerp(96,16,n)+w*10|0},${lerp(98,30,n)|0})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);}
if(!GL.ok)for(let i=0;i<80;i++){ctx.fillStyle=`rgba(230,240,255,${n*(.5+.5*Math.sin(T*2+i))})`;ctx.fillRect(hh(i,5)*VW|0,hh(i,6)*VH|0,1,1)}
if(!GL.ok)for(let q=0;q<7;q++){const X=((hh(q,1)*VW*1.4+T*(1.2+q*.35))%(VW*1.4+160))-80,Y=hh(q,2)*VH,col=`rgba(${lerp(226,70,n)|0},${lerp(238,90,n)|0},${lerp(246,130,n)|0},.09)`;for(let b=0;b<5;b++)disc(ctx,X+b*16,Y+(b%2)*3,24+(b%3)*7,5+(b%2)*2,col)}
 if(cur.rain>.05&&Math.random()<cur.rain*.25){const AP=CAMT[0]>70?POND2:POND,[px_,py]=PF(AP[0]+(Math.random()-.5)*5,AP[1]+(Math.random()-.5)*4);if(wm[(py|0)*Wd+(px_|0)])rps.push({x:px_,y:py,t:T})}
  const l=-TX/Z-70,r=(VW-TX)/Z+70,t=-TY/Z-110,b=(VH-TY)/Z+70;
  SKYC[0]=lerp(124,18,n)+w*92;SKYC[1]=lerp(178,34,n)+w*36;SKYC[2]=lerp(216,74,n)-w*58;
  WVIS[0]=l;WVIS[1]=r;WVIS[2]=t;WVIS[3]=b;
  ctx.setTransform(Z,0,0,Z,TX,TY);if(stc)ctx.drawImage(stc,0,0);if(wc&&!GL.ok)water();fall();for(const A of ARCH)drawArch(ctx,A);life();
  let pi=0;
  for(const o of objs){while(pi<PEOPLE.length&&PEOPLE[pi].d<o.d){if(!PL||PEOPLE[pi].P!==PL.P)drawPerson(ctx,PEOPLE[pi].P);pi++}
   if(o.surf)continue;if(o.x<l||o.x>r||o.y<t||o.y>b)continue;if(o.draw){o.draw(ctx);continue}const sp=o.sp,sw=o.t==1?Math.round(Math.sin(T*1.2+o.ph)*(.8+cur.storm*1.5)):o.t==4?Math.round(Math.sin(T*1.5+o.ph)*(.5+cur.storm*1.2)):0;
   ctx.drawImage(sp.c,o.x-sp.ox+sw,o.y-sp.oy);
   if(sp.sails){const fr=sp.sails[((T*1.6)|0)%sp.sails.length];ctx.drawImage(fr,o.x-sp.ox+sp.sailAt[0]-26,o.y-sp.oy+sp.sailAt[1]-26)}
   if(sp.fr){const fr=sp.fr[((T*(o.rate||sp.frRate||1.1))|0)%sp.fr.length];ctx.drawImage(fr,o.x-sp.ox,o.y-sp.oy)}
   if(sp.gl)for(const q of sp.gl)GLW.push([o.x-sp.ox+q[0],o.y-sp.oy+q[1],q[2]]);
  if(sp.ch)for(let s=0;s<6;s++){ctx.fillStyle=`rgba(225,225,225,${.55-s*.09})`;ctx.fillRect(Math.round(o.x-sp.ox+sp.ch[0]+Math.sin(T*.8+s)*2+s*.7),Math.round(o.y-sp.oy+sp.ch[1]-s*4-((T*6)%4)),2,2)}
  if(sp.fire){for(let q=0;q<5;q++){const h=5+Math.round(Math.sin(T*9+q*1.7)*2+2),X=o.x-4+q*2;ctx.fillStyle=q==2?'#fff2a0':q%2?'#ffb030':'#ff6a1d';ctx.fillRect(X,o.y-5-h,2,h)}for(let q=0;q<3;q++){ctx.fillStyle='rgba(255,170,60,.85)';ctx.fillRect(o.x-3+Math.round(Math.sin(T*2+q*2)*5),o.y-14-((T*14+q*9)%18)|0,1,1)}GLW.push([o.x,o.y-6,40])}}
  while(pi<PEOPLE.length){if(!PL||PEOPLE[pi].P!==PL.P)drawPerson(ctx,PEOPLE[pi].P);pi++}
  if(PL&&!PL.P.hid)drawPerson(ctx,PL.P);
  sprites(l,r,t,b);
  if(GL.ok)drawGL();
  drawSurf();
  if(expl&&GOAL){ctx.setTransform(Z,0,0,Z,TX,TY);const[gx,gy]=PF(GOAL[0],GOAL[1]),pu=(T*1.5)%1,s=Math.round(2+pu*5);
   ctx.globalAlpha=(1-pu)*.8;ctx.fillStyle='#ffe3a0';
   ctx.fillRect(Math.round(gx)-s,Math.round(gy)-s,s*2,1);ctx.fillRect(Math.round(gx)-s,Math.round(gy)+s,s*2,1);
   ctx.fillRect(Math.round(gx)-s,Math.round(gy)-s,1,s*2);ctx.fillRect(Math.round(gx)+s,Math.round(gy)-s,1,s*2);ctx.globalAlpha=1}
 // drifting cloud shadows (the shader draws its own when there is one)
 if(!GL.ok){const sc2=SCR.getContext('2d');sc2.setTransform(1,0,0,1,0,0);sc2.clearRect(0,0,VW,VH);
  sc2.setTransform(Z,0,0,Z,TX,TY);sc2.imageSmoothingEnabled=true;sc2.globalAlpha=(1-n*.85)*(1-cur.storm*.5);
  const off=(T*5)%768;for(let X=-768+off;X<Wd;X+=768)for(let Y=0;Y<Ht;Y+=384)if(X+768>l&&X<r&&Y+384>t&&Y<b)sc2.drawImage(CLOUD,X,Y,768,384);
  sc2.globalAlpha=1;sc2.imageSmoothingEnabled=false;sc2.setTransform(1,0,0,1,0,0);
  ctx.globalCompositeOperation='source-atop';ctx.drawImage(SCR,0,0);ctx.globalCompositeOperation='source-over'}
 ctx.setTransform(1,0,0,1,0,0);
 {const st=1-.35*cur.storm;
  // night falls as a cool veil over the land, so the warm lamps read as lights rather than haze
  const vn=clamp(n*.9+w*.16,0,1);
  if(vn>.01){ctx.globalCompositeOperation='source-atop';
   ctx.fillStyle=`rgba(${Math.round(lerp(38,15,vn))},${Math.round(lerp(50,23,vn))},${Math.round(lerp(86,52,vn))},${(vn*.6*st).toFixed(3)})`;ctx.fillRect(0,0,VW,VH);
   ctx.globalCompositeOperation='source-over'}}
 {const dk=(1-n)*(1-cur.storm*.7),sx=VW*.76,sy=VH*(.035+.135*cur.warm)-VH*.02;
  ctx.globalCompositeOperation='source-atop';
  let g=ctx.createRadialGradient(sx,sy,0,sx,sy,VW*1.2);g.addColorStop(0,`rgba(255,232,170,${.22*dk})`);g.addColorStop(.55,`rgba(255,226,160,${.07*dk})`);g.addColorStop(1,'rgba(255,226,160,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  g=ctx.createLinearGradient(VW*.9,0,VW*.05,VH);g.addColorStop(0,'rgba(20,40,80,0)');g.addColorStop(.5,`rgba(20,40,80,${.05*dk+.02})`);g.addColorStop(1,`rgba(18,32,70,${.24*dk+.06})`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  g=ctx.createLinearGradient(0,0,0,VH*.6);g.addColorStop(0,`rgba(196,220,240,${.16*dk+.04})`);g.addColorStop(1,'rgba(196,220,240,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  ctx.globalCompositeOperation='source-over';
  if(dk>.05){ctx.globalCompositeOperation='lighter';for(let q=0;q<6;q++){const x0=sx+(q-2.5)*VW*.022,wd_=VW*(.012+.008*((q*37)%3)),a=.06*dk*(.6+.4*Math.sin(T*.3+q*1.7)),Ls=VH*(.2+.17*q)*(q%2?1:-.35)-VH*.1,gr=ctx.createLinearGradient(x0,sy,x0+Ls,VH);gr.addColorStop(0,`rgba(255,240,200,${a})`);gr.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(x0,sy);ctx.lineTo(x0+wd_,sy);ctx.lineTo(x0+wd_+Ls*1.5-VH*.25,VH);ctx.lineTo(x0+Ls*.5-VH*.45,VH);ctx.closePath();ctx.fill()}ctx.globalCompositeOperation='source-over'}
  g=ctx.createRadialGradient(VW/2,VH*.5,Math.min(VW,VH)*.45,VW/2,VH*.5,Math.max(VW,VH)*.8);g.addColorStop(0,'rgba(8,16,28,0)');g.addColorStop(1,'rgba(8,16,28,.32)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH)}
 if(n>.15){ctx.setTransform(Z,0,0,Z,TX,TY);ctx.globalCompositeOperation='lighter';for(const[gx,gy,rr0]of GLW){const rr=rr0*.6,gd=ctx.createRadialGradient(gx,gy,0,gx,gy,rr);gd.addColorStop(0,`rgba(255,172,72,${.12*n})`);gd.addColorStop(.45,`rgba(255,164,64,${.035*n})`);gd.addColorStop(1,'rgba(255,164,64,0)');ctx.fillStyle=gd;ctx.fillRect(gx-rr,gy-rr,rr*2,rr*2)}
  for(let q=0;q<150;q++){ctx.fillStyle=`rgba(206,242,118,${n*(.07+.17*Math.max(0,Math.sin(T*2+q*3)))})`;{const X=l+hh(q,1)*(r-l)+Math.sin(T*.5+q)*6,Y=t+hh(q,2)*(b-t)+Math.cos(T*.4+q*2)*6;if(LM[(Y|0)*Wd+(X|0)])ctx.fillRect(X,Y,2,2)}}ctx.globalCompositeOperation='source-over'}
 ctx.setTransform(1,0,0,1,0,0);const rn=Math.floor(cur.rain*130);ctx.fillStyle='rgba(190,220,255,.55)';for(let i=0;i<rn;i++){const sp=70+hh(i,3)*40,yy=(hh(i,2)*VH+T*sp)%VH;ctx.fillRect((((hh(i,1)*VW-yy*.2)%VW)+VW)%VW|0,yy|0,1,3)}
 if(flash>.02){ctx.fillStyle=`rgba(210,225,255,${flash*.5})`;ctx.fillRect(0,0,VW,VH)}
}

{const qp=new URLSearchParams(location.search);
 const sp=qp.get('p');if(sp!=null)window.__p=parseFloat(sp);if(qp.get('hq'))window.__hq=1;if(qp.get('cam'))window.__cam=qp.get('cam').split(',').map(Number);if(qp.get('z'))window.__z=parseFloat(qp.get('z'));
 const sn=qp.get('n');if(sn!=null){const v=parseFloat(sn);cur.night=v;tgt.night=v;cur.warm=0;tgt.warm=0}
 if(CAP)setTimeout(()=>{const t=document.createElement('canvas');t.width=fx2.width;t.height=fx2.height;
  const c=t.getContext('2d');c.imageSmoothingEnabled=false;
  c.fillStyle='#000';c.fillRect(0,0,t.width,t.height);
  c.drawImage($('gl'),0,0,t.width,t.height);c.drawImage(fx2,0,0);c.drawImage($('fx2'),0,0);
  const d=document.createElement('div');d.id='shotdata';d.textContent=t.toDataURL('image/png');document.body.appendChild(d);},9000);}
addEventListener('pointermove',e=>{PM.x=e.clientX/innerWidth-.5;PM.y=e.clientY/innerHeight-.5},{passive:true});addEventListener('resize',rz);rz();
addEventListener('error',e=>{const b=document.getElementById('boot');
 if(b){b.classList.remove('done');b.innerHTML='<span>the village failed to load</span><span style="text-transform:none;max-width:90ch;text-align:center;line-height:1.5">'+(e.error&&e.error.stack?String(e.error.stack).replace(/</g,'&lt;'):e.message)+'</span>'}});
