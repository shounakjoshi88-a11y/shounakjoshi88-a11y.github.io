/* ================= THE POND: v4's water, rendered for real ================= */
const GL={ok:false,gl:null,U:{},q:.85,rp:new Float32Array(24),acc:.016,ticks:0};
function initGL(){
  const c=$('gl'),gl=c.getContext('webgl',{alpha:true,antialias:false,depth:false,stencil:false,powerPreference:'high-performance',premultipliedAlpha:false,preserveDrawingBuffer:CAP});
  if(!gl)return false;
  const sh=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);
    if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(o));return null}return o};
  const v=sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'),
        f=sh(gl.FRAGMENT_SHADER,$('fs').textContent);
  if(!v||!f)return false;
  const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.error(gl.getProgramInfoLog(p));return false}
  gl.useProgram(p);
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const a=gl.getAttribLocation(p,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  ['R','T','N','D','RN','ST','FL','SH','RP','CAM','ORG','MAP','LT','NL'].forEach(k=>GL.U[k]=gl.getUniformLocation(p,k));
  GL.gl=gl;GL.ok=true;
  gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  return true}
function sizeGL(){
  const c=$('gl'),d=Math.min(devicePixelRatio||1,1.5)*GL.q;
  if(c.width===0)return;
  c.width=Math.max(1,Math.round(innerWidth*d));c.height=Math.max(1,Math.round(innerHeight*d));
  if(GL.gl)GL.gl.viewport(0,0,c.width,c.height);
  const f=$('fx2');f.width=Math.max(1,VW);f.height=Math.max(1,VH)}
function drawGL(){
  const gl=GL.gl,c=$('gl'),rp=GL.rp;
  gl.uniform2f(GL.U.R,c.width,c.height);
  gl.uniform1f(GL.U.T,T);gl.uniform1f(GL.U.N,cur.night);gl.uniform1f(GL.U.D,cur.warm);
  gl.uniform1f(GL.U.RN,cur.rain);gl.uniform1f(GL.U.ST,cur.storm);gl.uniform1f(GL.U.FL,flash);gl.uniform1f(GL.U.SH,startle);
  gl.uniform4f(GL.U.CAM,Z,TX,TY,0);gl.uniform2f(GL.U.ORG,OX,OY);
  gl.uniform4f(GL.U.MAP,VW/c.width,VH/c.height,TX,TY);
  rps=rps.filter(r=>T-r.t<6).slice(-12);const PB=CAMT[0]>70,live=rps.filter(r=>{const fi=((r.x-OX)/16+(r.y-OY)/8)/2;return(fi>80)==PB}).slice(-8);
  for(let i=0;i<8;i++){const r=live[i];
    if(r&&T-r.t<6){const fi=((r.x-OX)/16+(r.y-OY)/8)/2,fj=((r.y-OY)/8-(r.x-OX)/16)/2;
      rp[i*3]=PB?(fi-104)/4.6:(fi-26.5)/6;rp[i*3+1]=PB?(fj-31.5)/4.6:(fj-24.5)/6;rp[i*3+2]=r.t;}
    else{rp[i*3]=0;rp[i*3+1]=0;rp[i*3+2]=-99}}
  gl.uniform3fv(GL.U.RP,rp);
  const LT=GL.lt||(GL.lt=new Float32Array(36));LT.fill(0);
  GLW.map(q=>{const AP=PB?POND2:POND;return[q,Math.hypot(((q[0]-OX)/16+(q[1]-OY)/8)/2-AP[0],((q[1]-OY)/8-(q[0]-OX)/16)/2-AP[1])]}).filter(q=>q[1]<13).sort((a,b)=>a[1]-b[1]).slice(0,12).forEach(([q],i)=>{LT[i*3]=q[0];LT[i*3+1]=q[1];LT[i*3+2]=q[2]});
  gl.uniform3fv(GL.U.LT,LT);gl.uniform1f(GL.U.NL,cur.night*(1-cur.rain*.5));
  gl.drawArrays(gl.TRIANGLES,0,3)}

/* ---- the things that float on top of the water ---- */
const SURF={ctx:null,pier:null,boat:null,spray:null};
function initSurf(){SURF.ctx=$('fx2').getContext('2d')}
function drawSurf(){
  const ctx=SURF.ctx;if(!ctx)return;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,SURF.ctx.canvas.width,SURF.ctx.canvas.height);
  ctx.setTransform(Z,0,0,Z,TX,TY);
  const c=ctx;
  // the jetty reaching over the water
  if(SURF.pier){const o=SURF.pier;c.drawImage(o.sp.c,o.x-o.sp.ox,o.y-o.sp.oy);if(o.sp.gl)for(const q of o.sp.gl)GLW.push([o.x-o.sp.ox+q[0],o.y-o.sp.oy+q[1],q[2]])}
  // the spray where the mill wheel bites the water
  if(SURF.spray){const o=SURF.spray;
   for(let q=0;q<5;q++){const ph=(T*1.6+q*.37)%1;
    c.fillStyle=`rgba(236,248,252,${(1-ph)*.8})`;
    c.fillRect(Math.round(o.x-8+q*4+Math.sin(T*3+q)*2),Math.round(o.y-4-ph*11),2,2)}}
  if(SURF.boat){const o=SURF.boat;const bob=Math.round(Math.sin(T*1.1)*1.4);c.drawImage(o.sp.c,o.x-o.sp.ox,o.y-o.sp.oy+bob)}
  const dt=Math.min(.05,Math.max(0,T-DKT));DKT=T;
  ringsPx(c);duckStep(dt);for(const d of DK)drawDuck(c,d);koiLeap(c);dropletsPx(c)}
const DK=[],SPL=[];let DKT=0;
const ISLC=ISL;
const t2w=(x,y)=>[((x-OX)/16+(y-OY)/8)/2,((y-OY)/8-(x-OX)/16)/2];
function splashAt(x,y,n){for(let k=0;k<n;k++)SPL.push({x,y,vx:(Math.random()-.5)*28,vy:-(14+Math.random()*28),t:T+Math.random()*.05})}
// crisp pixel rings that ride exactly on the shader's wave crests (tile circles are 2:1 ellipses on screen)
function ringsPx(c){
  for(const r of rps){const t=T-r.t;if(t<0||t>3.2)continue;
    for(let k=0;k<3;k++){const tt=t-k*.2;if(tt<=0)continue;const R=tt*1.8,rx=R*22.6,ry=R*11.3,al=Math.min(1,tt*8)*Math.max(0,1-tt/2.8)*[.9,.5,.28][k];if(al<.03)continue;
      const n=Math.max(28,Math.round(R*115));
      for(let pass=0;pass<2;pass++){c.fillStyle=pass?`rgba(150,208,224,${al*.55})`:`rgba(244,253,255,${al})`;
        for(let i=0;i<n;i++){const an=i/n*6.2832,lit=Math.sin(an+.6)>.15;if(lit==!!pass)continue;
          const X=Math.round(r.x+Math.cos(an)*rx),Y=Math.round(r.y+Math.sin(an)*ry);
          if(X<0||Y<0||X>=Wd||Y>=Ht||!wm[Y*Wd+X])continue;c.fillRect(X,Y,1,1)}}}}}
function dropletsPx(c){for(let i=SPL.length-1;i>=0;i--){const q=SPL[i],age=T-q.t;if(age>.7){SPL.splice(i,1);continue}if(age<0)continue;
  c.fillStyle=`rgba(238,250,255,${1-age/.7})`;c.fillRect((q.x+q.vx*age)|0,(q.y+q.vy*age+80*age*age)|0,1,1)}}
// --- ducks: real little agents. They wander, pause, preen, dabble; a close click scares them off, a far one makes them curious
function duckOK(a,b){return Math.hypot(a-POND[0],b-POND[1])<4.3&&Math.hypot(a-ISLC[0],b-ISLC[1])>IR+.95}
function duckPick(d){for(let k=0;k<14;k++){const an=Math.random()*6.283,r=Math.sqrt(Math.random())*4.2,a=POND[0]+Math.cos(an)*r,b=POND[1]+Math.sin(an)*r;if(duckOK(a,b)){d.ta=a;d.tb=b;return}}d.ta=POND[0]+1.5;d.tb=POND[1]+1}
function duckInit(){for(let q=0;q<4;q++){const an=q*1.7+.4,r=1.6+q*.45,d={a:POND[0]+Math.cos(an)*r,b:POND[1]+Math.sin(an)*r*.8,vx:0,vy:0,ta:0,tb:0,mode:'swim',mt:0,face:q%2?1:-1,wait:Math.random()*2,ph:Math.random()*6,cur:0};duckPick(d);DK.push(d)}}
function duckReact(x,y){const[fi,fj]=t2w(x,y);
  for(const d of DK){const dx=d.a-fi,dy=d.b-fj,dist=Math.hypot(dx,dy)||.01;
    if(dist<2.6){d.mode='flee';d.mt=.9+Math.random()*.5;d.vx=dx/dist*3.4;d.vy=dy/dist*3.4;d.wait=0;d.cur=0;const[X,Y]=PF(d.a,d.b);splashAt(X,Y,8);rps.push({x:X,y:Y,t:T+.05})}
    else if(dist<7.5&&d.mode!=='flee'&&Math.random()<.75&&duckOK(fi,fj)){d.ta=fi;d.tb=fj;d.cur=1;d.wait=Math.random()*.5;d.mode='swim'}}}
function duckStep(dt){if(!DK.length&&wm)duckInit();
  for(const d of DK){d.mt-=dt;
    if(d.mode==='flee'){const k=Math.pow(.2,dt);d.vx*=k;d.vy*=k;if(Math.random()<dt*16){const[X,Y]=PF(d.a,d.b);splashAt(X,Y,1)}if(d.mt<=0){d.mode='swim';duckPick(d);d.wait=.7}}
    else if(d.mode==='dab'){d.vx*=.9;d.vy*=.9;if(d.mt<=0){d.mode='swim';duckPick(d);d.wait=.4}}
    else if(d.wait>0){d.wait-=dt;d.vx*=.92;d.vy*=.92}
    else{const dx=d.ta-d.a,dy=d.tb-d.b,dist=Math.hypot(dx,dy);
      if(dist<.3){const[X,Y]=PF(d.a,d.b);if(d.cur||Math.random()<.35){d.mode='dab';d.mt=1.3;rps.push({x:X,y:Y,t:T})}else{d.wait=1+Math.random()*3}d.cur=0;if(d.mode!=='dab')duckPick(d)}
      else{const s=d.cur?1:.42,k=Math.min(1,dt*2.2);d.vx+=(dx/dist*s-d.vx)*k;d.vy+=(dy/dist*s-d.vy)*k}}
    d.a+=d.vx*dt;d.b+=d.vy*dt;
    const ex=d.a-ISLC[0],ey=d.b-ISLC[1],ed=Math.hypot(ex,ey);if(ed<IR+.6){d.a=ISLC[0]+ex/ed*(IR+.6);d.b=ISLC[1]+ey/ed*(IR+.6)}
    const cx=d.a-POND[0],cy=d.b-POND[1],cd=Math.hypot(cx,cy);if(cd>4.6){d.a=POND[0]+cx/cd*4.6;d.b=POND[1]+cy/cd*4.6}
    for(const o of DK)if(o!==d){const ox=d.a-o.a,oy=d.b-o.b,od=Math.hypot(ox,oy);if(od<.7&&od>.001){d.a+=ox/od*dt*.6;d.b+=oy/od*dt*.6}}
    const sx=d.vx-d.vy;if(Math.abs(sx)>.07)d.face=sx>0?1:-1}}
function drawDuck(c,d){
  const[X0,Y0]=PF(d.a,d.b),X=Math.round(X0),Y=Math.round(Y0),f=d.face,sp=Math.hypot(d.vx,d.vy),fl=d.mode==='flee',dab=d.mode==='dab',
    bob=Math.round(Math.sin(T*2.2+d.ph)*.6+.3),up=fl?2:0,preen=d.wait>0&&d.mode==='swim'&&((T*.6+d.ph)%5)<1;
  if(sp>.12&&!fl){c.fillStyle='rgba(235,250,255,.4)';for(let i=2;i<=10;i++){if(i==6)c.fillStyle='rgba(235,250,255,.18)';c.fillRect(X-f*(3+i),Y+1-(i>>1),1,1);c.fillRect(X-f*(3+i),Y+1+(i>>1),1,1)}}
  c.fillStyle='rgba(225,250,255,.32)';c.fillRect(X-6,Y+1,12,1);c.fillRect(X-4,Y+2,8,1);
  if(fl){const w=Math.sin(T*26+d.ph)>0?-6:-2;c.fillStyle='#efe8d6';c.fillRect(X-7,Y-3+w-up,5,3);c.fillRect(X+2,Y-3-w-up-4,5,3)}
  disc(c,X,Y-1+bob-up,5,2,'#ece6d2');disc(c,X,Y+bob-up,5,1,'#c9c1a8');
  px(c,X-f*5,Y-3+bob-up-(dab?3:0),'#ece6d2',2,2);px(c,X-1,Y-2+bob-up,'#a98f62',3,1);
  let hx=X+f*3,hy=Y-5+bob-up;if(dab){hx=X+f*5;hy=Y-1+bob}else if(preen){hx=X-f*2;hy=Y-4+bob}else if(fl){hy-=1}
  if(!dab)px(c,X+f*3,Y-3+bob-up,'#2a7a4a',2,2);
  disc(c,hx,hy,2,2,'#2a7a4a');px(c,hx+(preen?-f:f)*2,hy,'#f0a030',2,1);px(c,hx+f,hy-1,'#10201a')}
// a koi now and then leaps clear of the water
const KJ={t:0,nx:5,a:0,b:0,sd:1,land:1};
function koiLeap(c){
  if(T>KJ.nx&&wm){for(let k=0;k<10;k++){const an=Math.random()*6.283,r=1.2+Math.random()*3,a=POND[0]+Math.cos(an)*r,b=POND[1]+Math.sin(an)*r;if(duckOK(a,b)){KJ.a=a;KJ.b=b;break}}
    KJ.t=T;KJ.nx=T+8+Math.random()*10;KJ.sd=Math.random()<.5?1:-1;KJ.land=0;const[X,Y]=PF(KJ.a,KJ.b);rps.push({x:X,y:Y,t:T});splashAt(X,Y,6)}
  const age=T-KJ.t,D=.8;if(age<0||age>D+.05)return;const[X,Y]=PF(KJ.a,KJ.b),u=Math.min(1,age/D);
  if(u>=1&&!KJ.land){KJ.land=1;const e=PF(KJ.a,KJ.b),lx=e[0]+KJ.sd*26,ly=e[1];rps.push({x:lx,y:ly,t:T});splashAt(lx,ly,8)}
  if(u>=1)return;
  const hx=X+KJ.sd*u*26,hy=Y-Math.sin(u*Math.PI)*22,vx=KJ.sd*26,vy=-Math.cos(u*Math.PI)*22*Math.PI,vl=Math.hypot(vx,vy);
  for(let i=0;i<7;i++){const x=Math.round(hx-vx/vl*i*1.5),y=Math.round(hy-vy/vl*i*1.5);c.fillStyle=i==0?'#ff7a2a':i==2||i==3?'#fff1e0':i==6?'#ffb070':'#ff7a2a';c.fillRect(x,y,2,2)}
  if(Math.random()<.5)splashAt(hx,hy,1)}
