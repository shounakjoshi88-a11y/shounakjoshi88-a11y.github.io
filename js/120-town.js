/* ================= SCENE: the expanded village ================= */
const STONE=[[162,156,146],[130,124,114],[98,94,86],[66,64,60]];
const PLANK=[[170,132,86],[140,106,64],[108,78,48],[74,54,32]];

// a round tower that tapers as it rises
function coneTower(c,cx,by,r0,r1,h,pal,top){
  for(let v=0;v<h;v++){const t=v/Math.max(1,h-1),r=r0+(r1-r0)*t,y=by-v;
    for(let dx=-Math.ceil(r);dx<=Math.ceil(r);dx++){const q=dx/Math.max(1,r);if(Math.abs(q)>1)continue;
      const w=Math.round(r*Math.sqrt(1-q*q)),sh=clamp(.55-q*.62,.06,1);
      px(c,cx+dx,y,rgb(mixc(pal[1],pal[0],1-sh)),1,1)}}
  disc(c,cx,by-h,Math.max(1,Math.round(r1)),Math.max(1,Math.round(r1*.42)),rgb(top));
  return by-h}

// windmill: stone tower, timber cap, sails that actually turn
function windmill(){
  const c=mk(60,68),x=c.getContext('2d'),cx=30,by=62;
  coneTower(x,cx,by,15,10,40,STONE,[92,86,80]);
  for(let v=0;v<12;v++){const w=Math.round(11*(1-v/13));px(x,cx-w,by-40-v,rgb(v<3?[70,58,48]:PLANK[3]),w*2,1)}
  px(x,cx-2,by-52,rgb([70,58,48]),4,2);
  for(let dx=-17;dx<=17;dx++)px(x,cx+dx,by-27,rgb([92,70,46]));
  for(let dx=-16;dx<=16;dx+=2)px(x,cx+dx,by-28,rgb([146,112,70]));
  for(let dx=-16;dx<=16;dx+=4){px(x,cx+dx,by-33,rgb([92,70,46]),1,6)}
  px(x,cx-3,by-13,rgb([62,42,28]),6,13);
  px(x,cx-3,by-32,rgb([250,222,150]),5,4);
  px(x,cx-2,by-31,rgb([255,244,196]),3,2);
  const sails=[];
  for(let k=0;k<8;k++){const sc=mk(52,52),sx=sc.getContext('2d'),a=k*Math.PI/4;
    for(let b=0;b<4;b++){const ang=a+b*Math.PI/2,cx2=-Math.sin(ang),cy2=Math.cos(ang);
      for(let t=1;t<23;t++){sx.fillStyle='#6b4a2c';sx.fillRect(Math.round(26+Math.cos(ang)*t),Math.round(26+Math.sin(ang)*t),1,1)}
      for(let t=4;t<21;t++){for(let w=0;w<4;w++){sx.fillStyle=w<1?'#cbb489':'#e8d9b8';sx.fillRect(Math.round(26+Math.cos(ang)*t+cx2*w),Math.round(26+Math.sin(ang)*t+cy2*w),1,1)}}}
    sails.push(sc)}
  return{c,ox:cx,oy:by,sh:[7,1,19,7],sails,sailAt:[cx,by-46]}}

// market stall with a striped awning
function stall(c1,c2){
  const c=mk(44,46),x=c.getContext('2d');
  for(const[px_,py]of[[7,36],[37,36],[7,17],[37,17]]){px(x,px_,py,rgb(PLANK[3]),2,19);px(x,px_+1,py,rgb(PLANK[1]),1,19)}
  para(x,[5,15],[34,-1],[0,9],(s,t)=>rgb(t<.5?c1:c2));
  px(x,5,30,rgb(PLANK[1]),34,3);px(x,5,33,rgb(PLANK[3]),34,2);
  for(let k=0;k<7;k++){const gx=(6+hh(k,1)*28)|0,gy=28-((hh(k,2)*5)|0);
    px(x,gx,gy,rgb([[230,124,54],[214,64,48],[244,196,66],[126,176,72],[238,238,228],[168,96,168]][k%6]),3,3)}
  return{c,ox:22,oy:41,sh:[4,1,19,5]}}

// boathouse: planks, a wide door and a slipway
function boathouse(){
  const a=34,wh=22,H=19;
  const wall=(face,u,v,tot)=>{const k=face==0?1:.62;
    if(face==0){const fu=u-9,fv=v-1;if(fu>=-1&&fu<=16&&fv>=-1&&fv<=19){const e=fu==-1||fu==16||fv==-1||fv==19||fu==8||fv==9;return e?[198,198,188].map(q=>q*k):[44,32,24]}}
    if(v<4)return PLANK[3].map(q=>q*k);
    if(u<2||u>=a-2||v>=wh-2&&v<wh)return PLANK[1].map(q=>q*k);
    const pl=Math.floor(u/4),q=hh(pl,v>>2);let col=PLANK[pl%4];
    if(q>.86)col=mixc(col,[0,0,0],.2);if(q<.07)col=mixc(col,[255,236,200],.16);
    return col.map(z=>z*k)};
  return box({a,wh,H,wall,roof:[[76,68,62],[98,90,82],[124,116,106]],rowH:3,colW:5,moss:1,sh:[16,5,40,16],top:34,bot:12,
    after:(x,res)=>{px(x,res.ox-11,res.oy-2,rgb([58,44,32]),22,2)}});
}

// lookout tower at the edge of the orchard
function lookout(){
  const c=mk(50,80),x=c.getContext('2d'),cx=25,by=76;
  ln(x,cx-4,by,cx-14,by-40,rgb(PLANK[3]));ln(x,cx+4,by,cx+14,by-40,rgb(PLANK[3]));
  ln(x,cx-4,by,cx+14,by-40,rgb(PLANK[2]));ln(x,cx+4,by,cx-14,by-40,rgb(PLANK[2]));
  px(x,cx-15,by-42,rgb(PLANK[1]),30,4);px(x,cx-15,by-38,rgb(PLANK[3]),30,2);
  for(let dx=-14;dx<=14;dx+=3)px(x,cx+dx,by-49,rgb(PLANK[2]),1,8);
  ln(x,cx-14,by-49,cx+14,by-49,rgb(PLANK[1]));
  for(let v=0;v<9;v++){const w=Math.round(16*(1-v/10));px(x,cx-w,by-58+v,rgb(v<2?[96,54,40]:[130,68,48]),w*2,1)}
  for(let k=0;k<8;k++)px(x,cx-3,by-3-k*5,rgb(PLANK[2]),6,1);
  px(x,cx-1,by-6,rgb([120,92,60]),2,4);
  return{c,ox:cx,oy:by,sh:[5,1,16,5],gl:[[cx-14,by-44,18],[cx+14,by-44,18]]}}

// a small shrine gate in the north woods
function shrine(){
  const c=mk(44,54),x=c.getContext('2d');
  px(x,7,10,rgb([176,74,54]),4,38);px(x,33,10,rgb([176,74,54]),4,38);
  px(x,2,8,rgb([140,56,42]),40,5);px(x,4,13,rgb([198,88,64]),36,3);
  px(x,13,38,rgb([122,98,70]),18,11);px(x,11,35,rgb([150,122,86]),22,3);
  px(x,19,31,rgb([240,210,124]),6,6);px(x,21,32,rgb([255,238,178]),2,3);
  for(const lx of[1,38]){px(x,lx,25,rgb([216,124,74]),5,7);px(x,lx-1,24,rgb([96,64,44]),7,2);px(x,lx+2,32,rgb([70,52,40]),1,4)}
  return{c,ox:22,oy:49,sh:[4,1,17,4],gl:[[4,29,17],[41,29,17]]}}

// sheep, dog, boat, cart, birdhouse, churn
// ---------- animated animals: body is the static sprite, `fr` holds the moving parts ----------
function flipC(c){const d=mk(c.width,c.height),x=d.getContext('2d');x.translate(c.width,0);x.scale(-1,1);x.drawImage(c,0,0);return d}
function scaleC(c,k){const d=mk(Math.round(c.width*k),Math.round(c.height*k)),x=d.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(c,0,0,d.width,d.height);return d}
const WOOL=[[248,246,238],[228,224,214],[200,194,184],[168,162,154],[130,124,118]];
const TAN=[[226,180,120],[202,154,96],[174,126,74],[142,98,56],[106,72,44]];
const CRM=[[252,246,234],[238,230,216],[222,212,196],[202,192,178],[182,172,158]];
function thick(x,x0,y0,x1,y1,col,w){for(let o=0;o<w;o++)ln(x,x0,y0+o,x1,y1+o,col)}
function sheep(f){const key='shp'+f;if(SPR[key])return SPR[key];
 const mir=f&1,W=36,Hh=28,base=mk(W,Hh),x=base.getContext('2d'),DK=[66,58,54];
 for(const[lx,ly,sd]of[[10,20,1],[15,21,0],[21,20,1],[25,21,0]]){px(x,lx,ly,rgb(sd?[44,38,36]:DK),2,5);px(x,lx,ly+5,'#161210',2,1)}
 for(const[cx,cy,rx,ry,sd]of[[11,16,6,5,1],[17,17,7,5,2],[23,16,6,5,3],[15,12,7,5,4],[21,12,6,4,5],[10,12,4,4,6],[26,13,3,4,7]])bl(x,cx,cy,rx,ry,WOOL,sd);
 bl(x,5,14,2,2,WOOL,9);
 for(let k=0;k<14;k++)px(x,6+((hh(k,f+3)*22)|0),9+((hh(f,k+8)*10)|0),rgb(WOOL[hh(k,2)>.5?4:0]));
 const mkHead=(hx,hy,jaw)=>{const c=mk(W,Hh),h=c.getContext('2d');
  for(let o=-1;o<=1;o++)ln(h,22,13+o,hx-1,hy-1+o,rgb(WOOL[2-(o>0?1:0)]));
  bl(h,hx-1,hy-3,3,2,WOOL,4);disc(h,hx+1,hy,3,3,rgb([78,66,60]));disc(h,hx+1,hy+1,3,2,rgb([62,52,48]));
  px(h,hx+3,hy+1+jaw,rgb([34,28,26]),2,2);px(h,hx,hy-1,rgb([236,230,214]),1,1);px(h,hx+1,hy-1,rgb([20,16,14]),1,1);
  px(h,hx-3,hy-1,rgb([102,86,78]),3,1);px(h,hx-4,hy,rgb([86,72,66]),2,2);return c};
 const P0=mkHead(28,10,0),P1=mkHead(29,16,0),P2=mkHead(30,22,0),P3=mkHead(30,22,1);
 let fr=[P0,P0,P1,P2,P3,P2,P3,P2,P1];const rot=(f>>1)*3;fr=fr.slice(rot).concat(fr.slice(0,rot));
 let c=base;if(mir){c=flipC(base);fr=fr.map(flipC)}
 return SPR[key]={c,ox:mir?W-17:17,oy:25,sh:[2,0,11,3],fr,frRate:1.05+.25*(f>>1)}}
function dog(f){const key='dog'+f;if(SPR[key])return SPR[key];
 const mir=f&1,W=34,Hh=24,base=mk(W,Hh),x=base.getContext('2d');
 for(const[lx,ly,c0]of[[7,15,[142,98,56]],[11,16,[170,120,70]],[19,16,[142,98,56]],[22,15,[170,120,70]]]){px(x,lx,ly,rgb(c0),3,6);px(x,lx,ly+6,rgb([238,226,200]),3,1)}
 bl(x,14,13,9,5,TAN,2);bl(x,20,15,4,3,CRM,1);
 for(let k=0;k<10;k++)px(x,8+((hh(k,5)*14)|0),9+((hh(7,k)*6)|0),rgb(TAN[4]));
 bl(x,24,8,4,4,TAN,5);px(x,28,9,rgb([232,200,150]),3,3);px(x,30,9,rgb([22,16,14]),2,2);px(x,26,7,rgb([20,14,12]),1,1);px(x,27,6,rgb([255,255,255]),1,1);
 px(x,21,4,rgb([98,62,34]),3,6);px(x,22,4,rgb([122,80,46]),1,5);px(x,21,12,rgb([200,50,44]),4,1);px(x,23,13,rgb([240,200,70]),1,1);
 const tails=[[3,8],[2,6],[3,4],[2,6]],mkT=([tx,ty],tg)=>{const c=mk(W,Hh),h=c.getContext('2d');thick(h,6,11,tx,ty,rgb(TAN[1]),2);px(h,tx-1,ty-1,rgb(CRM[0]),2,2);if(tg)px(h,28,12,rgb([236,92,110]),2,3);return c};
 let fr=tails.map((t,i)=>mkT(t,i==1&&((f>>1)&1)));const rot=(f>>1)%4;fr=fr.slice(rot).concat(fr.slice(0,rot));
 let c=base;if(mir){c=flipC(base);fr=fr.map(flipC)}
 return SPR[key]={c,ox:mir?W-17:17,oy:21,sh:[2,0,10,3],fr,frRate:5+(f>>1)}}
function deer(kind){const key='deer'+kind;if(SPR[key])return SPR[key];
 const W=56,Hh=58,stag=kind==0,fawn=kind==2,base=mk(W,Hh),x=base.getContext('2d');
 for(const[lx,ly,dk]of[[11,38,1],[15,38,0],[28,38,1],[32,38,0]]){px(x,lx,ly,rgb(dk?TAN[3]:TAN[2]),2,16);px(x,lx,ly+15,rgb(CRM[0]),2,1);px(x,lx,ly+16,'#2a1c14',2,2)}
 bl(x,22,32,12,6,TAN,3);bl(x,23,36,9,2,CRM,1);px(x,8,28,rgb(CRM[0]),3,4);px(x,7,27,rgb(CRM[1]),2,2);
 if(fawn||kind==1&&0)for(let k=0;k<22;k++){const sx=12+((hh(k,3)*20)|0),sy=26+((hh(4,k)*8)|0);px(x,sx,sy,rgb(CRM[0]),2,1)}
 const pose=(nx,ny,hx,hy,ear)=>{const c=mk(W,Hh),h=c.getContext('2d');
  for(let o=0;o<5;o++)ln(h,28+(o>>1),26+o%2,nx+o-2,ny,rgb(o<2?TAN[0]:o<4?TAN[1]:TAN[3]));
  bl(h,hx,hy,5,4,TAN,4);px(h,hx+4,hy+1,rgb([232,214,184]),4,3);px(h,hx+7,hy+1,rgb([22,16,14]),2,2);px(h,hx+1,hy-2,rgb([22,16,14]),1,1);px(h,hx+2,hy-2,rgb([250,250,250]),1,1);
  const ey=hy-5+(ear?1:0);px(h,hx-4,ey,rgb(TAN[2]),4,3);px(h,hx-3,ey+1,rgb([236,190,170]),2,1);
  if(stag){const dy=hy-5,col=rgb([214,196,160]);ln(h,hx-1,dy,hx-4,dy-10,col);ln(h,hx-4,dy-10,hx-2,dy-15,col);ln(h,hx-3,dy-6,hx+1,dy-9,col);ln(h,hx-4,dy-10,hx-7,dy-13,col);ln(h,hx+1,dy,hx+3,dy-9,col);ln(h,hx+3,dy-9,hx+6,dy-12,col)}
  return c};
 const up=pose(35,16,38,13,0),upE=pose(35,16,38,13,1),gz=pose(37,38,40,41,0),gz2=pose(37,38,41,41,1);
 let fr=[up,up,upE,up,gz,gz,gz2,gz,gz2,gz,up];
 const k=fawn?.5:kind==1?.68:.74;let c=scaleC(base,k);fr=fr.map(q=>scaleC(q,k));
 if(kind==1){c=flipC(c);fr=fr.map(flipC)}
 return SPR[key]={c,ox:Math.round((kind==1?W-22:22)*k),oy:Math.round(54*k),sh:[2,0,Math.round(14*k),4],fr,frRate:.9+.15*kind}}
// petals, pink butterflies, dragonflies and floating lanterns for the sakura isle
function extraLife(c,l,r,t,b,n){
 const dayK=1-n;
 if(r>3300||l<0){}
 // falling petals (wind pushes them toward the pond)
 if(r>1500){for(let k=0;k<190;k++){const fi=96+hh(k,2)*24,fj=8+hh(k,3)*36,[bx,by]=PF(fi,fj),p=(T*(.05+.03*hh(k,4))+hh(k,1))%1,X=bx+p*96+Math.sin(T*.8+k)*9,Y=by-100+p*150;
   if(X<l||X>r||Y<t||Y>b)continue;const sw=Math.sin(T*3+k*2)>0?2:1;c.fillStyle=['#ffc4d6','#ffb0c8','#ffe0ea','#ff9ec0'][k&3];c.fillRect(X|0,Y|0,sw,1);if(k%3==0)c.fillRect((X|0)+1,(Y|0)+1,1,1)}}
 // butterflies, tinted for blossom
 if(n<.6&&r>1500)for(let q=0;q<9;q++){const[X0,Y0]=PF(91+(q%3)*5,18+Math.floor(q/3)*6),X=Math.round(X0+Math.sin(T*.6+q*2)*52+Math.sin(T*2.1+q)*7),Y=Math.round(Y0-18+Math.cos(T*.8+q*3)*18),w=Math.sin(T*17+q*5)>0?3:1,col=['#ffd0e0','#ffffff','#c9a8ff','#ffe8a0','#ff9ec0','#b8e6ff','#ffffff','#ffd0e0','#ffe8a0'][q];
  if(X<l||X>r||Y<t||Y>b)continue;c.globalAlpha=1-n;px(c,X-w,Y-1,col,w,2);px(c,X+1,Y-1,col,w,2);px(c,X-w,Y+1,col,Math.max(1,w-1),1);px(c,X,Y-1,'#3a2a30',1,3);c.globalAlpha=1}
 // dragonflies darting over the sakura pond
 if(n<.7&&r>1500)for(let q=0;q<3;q++){const[X0,Y0]=PF(POND2[0]+Math.sin(q*2.1)*1.5,POND2[1]+Math.cos(q*1.7)),dt=Math.floor(T*.7+q*3),hx=hh(dt,q+4)-.5,hy=hh(q+9,dt)-.5,u=((T*.7+q*3)%1),e=u<.2?u/.2:1,px0=hh(dt-1,q+4)-.5,py0=hh(q+9,dt-1)-.5,
   X=Math.round(X0+lerp(px0,hx,e*e*(3-2*e))*150),Y=Math.round(Y0-14+lerp(py0,hy,e*e*(3-2*e))*60+Math.sin(T*9+q)*1.5);
  if(X<l||X>r||Y<t||Y>b)continue;c.globalAlpha=1-n*.6;c.fillStyle='rgba(20,30,40,.22)';c.fillRect(X-2,Y+14,5,1);px(c,X-3,Y,'#2fb8b0',6,1);px(c,X-4,Y,'#7be0d8',1,1);px(c,X+3,Y,'#1e7a8c',2,1);
  const wv=Math.sin(T*40+q)>0;c.fillStyle='rgba(220,244,250,.8)';c.fillRect(X-2,Y-1-(wv?1:0),3,1);c.fillRect(X-2,Y+1+(wv?1:0),3,1);c.fillRect(X+1,Y-1-(wv?0:1),2,1);c.globalAlpha=1}
 // paper lanterns drifting on the sakura pond
 if(r>1500)for(let q=0;q<8;q++){const an=q*.83+T*.022*(1+(q&1)*.5),rr=1.0+(q%4)*.75,a=POND2[0]+Math.cos(an)*rr,bb=POND2[1]+Math.sin(an)*rr*.85;if(WD(a,bb)<.7)continue;
  const[X0,Y0]=PF(a,bb),X=Math.round(X0),Y=Math.round(Y0+Math.sin(T*1.1+q)*.8);if(X<l||X>r||Y<t||Y>b)continue;
  const fl=.85+.15*Math.sin(T*5+q*2.3);c.fillStyle='rgba(255,150,70,'+(.18+.22*n).toFixed(2)+')';c.fillRect(X-6,Y+2,12,2);c.fillRect(X-4,Y+4,8,1);
  px(c,X-3,Y-5,'#3a2218',6,1);px(c,X-3,Y-4,rgb([255*fl,172*fl,92*fl]),6,4);px(c,X-2,Y-3,rgb([255,236,170]),4,2);px(c,X-3,Y,'#3a2218',6,1);px(c,X-3,Y-4,rgb([255,214,140]),1,3);
  GLW.push([X,Y-2,30])}
 }

function boat(){
  const c=mk(44,30),x=c.getContext('2d');
  para(x,[5,15],[30,-1],[0,7],(s,t)=>rgb(t<.3?[154,106,60]:t<.7?[124,84,46]:[88,58,32]));
  para(x,[5,15],[30,-1],[-5,7],(s,t)=>rgb(t<.3?[120,80,44]:[82,54,30]));
  px(x,5,14,rgb([178,128,74]),30,2);
  px(x,17,4,rgb([150,106,62]),2,13);
  return{c,ox:22,oy:17,sh:[11,3,17,4]}}
function cart(){
  const c=mk(46,32),x=c.getContext('2d');
  cube(x,23,27,20,9,[178,136,88],[142,104,64],[104,72,42]);
  disc(x,10,29,5,5,rgb([92,64,38]));disc(x,10,29,3,3,rgb([198,154,98]));
  disc(x,33,29,4,4,rgb([92,64,38]));
  px(x,6,9,rgb([152,118,68]),2,15);
  return{c,ox:23,oy:29,sh:[9,2,19,5]}}
function birdhouse(){
  const c=mk(18,24),x=c.getContext('2d');
  px(x,8,3,rgb([122,94,56]),2,21);
  px(x,4,7,rgb([178,140,88]),11,9);px(x,3,6,rgb([142,106,62]),13,2);
  px(x,7,9,rgb([44,32,24]),4,4);px(x,5,7,rgb([198,160,106]),8,1);
  return{c,ox:9,oy:22,sh:[1,1,6,2]}}
function churn(){
  const c=mk(14,20),x=c.getContext('2d');
  cyl(x,7,16,4,2,12,[[180,182,176],[138,140,134],[98,100,96]],[198,200,194]);
  px(x,5,4,rgb([152,154,148]),4,2);
  return{c,ox:7,oy:17,sh:[2,1,5,2]}}
// the mill: an overshot wheel fed by a wooden launder, geared into the cottage wall
// the pond's own water model, baked for small sprites: deep teal with a sky-blue fresnel and a hard sun glint
function wcolB(dp,gx,gy,X,Y){let nx=-gx,ny=-gy,nz=1;const nl=Math.hypot(nx,ny,nz);nx/=nl;ny/=nl;nz/=nl;
 const dd=sm(0,.9,dp),nv=.86+.28*hh(X|0,Y|0);let R=lerp(158,18,dd)*nv,G=lerp(148,64,dd)*nv,B=lerp(107,74,dd)*nv;
 const tn=dp*.7;R*=1-.65*tn;G*=1-.22*tn;B*=1-.14*tn;
 const fr=.2+.5*Math.pow(1-nz,2.2);R=lerp(R,124,fr);G=lerp(G,178,fr);B=lerp(B,216,fr);
 const sp=Math.pow(Math.max(0,nx*-.34+ny*-.42+nz*.84),48);R+=sp*230;G+=sp*225;B+=sp*190;
 return rgb([clamp(R,0,255),clamp(G,0,255),clamp(B,0,255)])}
function millWheel(){
  const EX=-22,EY=11,W=140,H=106,cx=48,cy=62,R=18,c=mk(W,H),x=c.getContext('2d'),fr=[],D=[9,-4.5],M=[cx+4.5,cy-2.25],TQ=R+5,G=[cx+22-EX,cy-11-EY],PP=[cx+34-EX,cy-5-EY];
  const outline=src=>{const o=mk(W,H),g=o.getContext('2d');for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1]])g.drawImage(src,dx,dy);g.globalCompositeOperation='source-in';g.fillStyle='#241a10';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';g.drawImage(src,0,0);return o};
  const S=(o,p,q)=>[o[0]+p,o[1]+p*.5-q];
  const dot=(g,X,Y,col,w,h)=>{g.fillStyle=col;g.fillRect(Math.round(X),Math.round(Y),w||1,h||1)};
  const seg=(g,o,p0,q0,p1,q1,col,th)=>{const a=S(o,p0,q0),b=S(o,p1,q1),n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]),1);for(let k=0;k<=n;k++)dot(g,a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n,col,th,th)};
  const line=(g,x0,y0,x1,y1,col,th)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let k=0;k<=n;k++)dot(g,x0+(x1-x0)*k/n,y0+(y1-y0)*k/n,col,th,th)};
  const plane=(g,o,r0,r1,fn)=>{const m=Math.ceil(r1)+1;for(let yy=Math.floor(-m*1.6);yy<=m*1.6;yy++)for(let xx=-m;xx<=m;xx++){const p=xx,q=xx*.5-yy,r=Math.hypot(p,q);if(r<r0||r>r1)continue;const col=fn(r,Math.atan2(q,p),q);if(col)dot(g,o[0]+xx,o[1]+yy,col)}};
  const wheelPlane=(g,o,ph,back)=>{
    plane(g,o,R-2.4,R,(r,a,q)=>Math.cos(6*(a+ph))>.82?'#454c56':q>0?(back?'#7a6a48':'#9c8a62'):(back?'#4f442f':'#6d5f40'));
    plane(g,o,R-3.5,R-2.4,()=>back?'#3a3022':'#5a4c38');
    for(let k=0;k<6;k++){const an=-ph+k*Math.PI/3,c1=Math.cos(an),s1=Math.sin(an);
      seg(g,o,c1*4,s1*4,c1*(R-3),s1*(R-3),back?'#3f3626':'#54492f',2);seg(g,o,c1*4,s1*4+1,c1*(R-3),s1*(R-3)+1,back?'#54492f':'#8a7a56',1)}
    plane(g,o,0,4.5,(r,a,q)=>r>3.5?'#3a4048':r<1?'#14100a':q>0?'#8a7a5a':'#5d5139');
    if(!back)for(let k=0;k<4;k++){const an=-ph+k*Math.PI/2,s=S(o,Math.cos(an)*2.4,Math.sin(an)*2.4);dot(g,s[0],s[1],'#f0d26a')}};
  const IRON={d:'#2f353d',m:'#59616b',l:'#8a94a2',t:'#aab4c2',td:'#4a525c'},BRASS={d:'#7a5f1c',m:'#b8932c',l:'#e0bf55',t:'#f0d26a',td:'#9a7a24'};
  const gear=(g,o,rb,rt,n,ph,pal)=>{for(const[off,dark]of[[[2,-1],1],[[0,0],0]]){
    plane(g,[o[0]+off[0],o[1]+off[1]],0,rt,(r,a,q)=>{
      if(r<1.5)return'#14100a';
      if(r<=rb)return dark?pal.d:r<rb*.45?pal.m:q>0?pal.l:pal.m;
      return Math.cos(n*(a-ph))>.2?(dark?pal.td:pal.t):null})}};
  const blades=(g,ph)=>{for(let i=0;i<12;i++){const an=-ph+i*Math.PI/6,c1=Math.cos(an),s1=Math.sin(an),loaded=c1>-.1&&s1>-.5;
    for(let t=0;t<=1;t+=.08){const o=[cx+D[0]*t,cy+D[1]*t];
      for(let r=R-2.6;r<=R+1.6;r+=.6){const s=S(o,c1*r,s1*r);dot(g,s[0],s[1],r>R+.8?'#e8dcb8':t<.5?'#b8a67c':'#8f7f5c',1,1)}}
    if(loaded){const s=S([cx+D[0]*.5,cy+D[1]*.5],c1*(R-1),s1*(R-1));dot(g,s[0]-1,s[1]-2,wcolB(.5,.2,.1,i,3),4,2);dot(g,s[0],s[1]-2,wcolB(.2,-.5,-.5,i+3,5),2,1)}}};
  const troughPos=(p,d)=>[M[0]+p+d,M[1]+p*.5-TQ-d*.5];
  // ---- static layer: stanchion, gear post, launder floor + back wall + supports ----
  {const o=[cx+12,cy-6];seg(x,o,-1,-3,-10,-24,'#6a4726',3);seg(x,o,1,-3,10,-24,'#6a4726',3);seg(x,o,-1,-3,-10,-24,'#a87848',1);seg(x,o,1,-3,10,-24,'#a87848',1);dot(x,o[0]-3,o[1]-3,'#3d2817',7,5);dot(x,o[0]-3,o[1]-3,'#59606a',7,1);
   line(x,G[0]+1,G[1]+8,G[0]-3,G[1]+36,'#6a4726',3);line(x,G[0]+1,G[1]+14,G[0]+7,G[1]+34,'#8a6238',2);
   for(let p=-26;p<=0;p++)for(let d=-4;d<=4;d++){const[X,Y]=troughPos(p,d);dot(x,X,Y+2,'#8a5e34');dot(x,X,Y+3,'#5e3d21');if(d==4){dot(x,X,Y-1,'#8a5e34',1,3);dot(x,X,Y-2,'#b08650')}}
   {const mx=(M[0]+D[0]+G[0])/2,my=(M[1]+D[1]+G[1])/2;line(x,mx,my+2,mx-2,my+22,'#5a3d24',3);line(x,mx-1,my+2,mx-3,my+22,'#8a6238',1)}
   for(const p of[-24,-13,-3])for(const d of[-3,3]){const[X,Y]=troughPos(p,d),gy=cy+6+p/2-(4.5+d)/2;dot(x,X,Y+3,'#6a4726',2,Math.round(gy-Y-3));dot(x,X,Y+3,'#a87848',1,Math.round(gy-Y-3))}
   for(const p of[-24,-13]){const a=troughPos(p,-3),b=troughPos(p+12,3);line(x,a[0],a[1]+10,b[0],b[1]+14,'#8a5e34',1)}}
  for(let k=0;k<10;k++){const ph=k*Math.PI/60,sc=mk(W,H),g=sc.getContext('2d'),F=[cx,cy],B=[cx+D[0],cy+D[1]];
   // far end: pinion shaft, spur gear + pinion
   line(g,PP[0],PP[1],PP[0]+13,PP[1]-6.5,'#5a3d24',2);dot(g,PP[0]+12,PP[1]-9,'#3d2817',3,5);
   gear(g,G,7.2,9.4,12,-ph,IRON);gear(g,PP,3.2,4.8,6,Math.PI/6+2*ph,BRASS);
   line(g,B[0],B[1],G[0],G[1],'#5a3d24',3);line(g,B[0]+4,B[1]-2,G[0]-3,G[1]+1.5,'#8a6238',1);for(const t of[.45,.8]){const X=B[0]+(G[0]-B[0])*t,Y=B[1]+(G[1]-B[1])*t;dot(g,X-1,Y-2,'#59606a',3,4)}
   wheelPlane(g,B,ph,true);
   line(g,F[0],F[1],B[0],B[1],'#5a3d24',3);
   blades(g,ph);
   wheelPlane(g,F,ph,false);
   // launder water, front wall, and the falling curtain into the buckets
   {const hf=(p,d)=>{const q=p-k,w=((q%10)+10)%10;return Math.sin(q*.6283)*.5+Math.sin(q*1.2566+d*.9)*.28+hh(w|0,d+9)*.5};
   for(let p=-26;p<=0;p++)for(let d=-3;d<=3;d++){const[X,Y]=troughPos(p,d),gx=(hf(p+1,d)-hf(p-1,d))*1.1,gy=(hf(p,d+1)-hf(p,d-1))*.9,e=Math.abs(d)/3;dot(g,X,Y,wcolB(.16+.42*(1-e*e),gx,gy,p,d));if(e==1&&hh(p,k)>.8)dot(g,X,Y,'#e8f6f8')}}
   for(let p=-26;p<=0;p++){const[X,Y]=troughPos(p,-4);dot(g,X,Y-1,'#a87848',1,3);dot(g,X,Y-2,'#dcb77a')}
   for(let d=-3;d<=3;d++){const[X,Y]=troughPos(0,d);for(let j=0;j<7;j++){const q=((j*2+k*2)%6),e=Math.abs(d)/3;dot(g,X+1,Y+2+j,wcolB(.22+.4*(1-e*e),Math.sin((j+k)*.9)*.6,(q<3?.5:-.4),d*3,j+k))}}
   dot(g,M[0]-1,M[1]-R-1,'#e6f6fb',5,1);
   fr.push(outline(sc))}
  return{c:outline(c),ox:cx-EX,oy:cy+6-EY,fr,frRate:8,sh:[-30,19,30,5]}}

// a villager, in three poses and two steps
function villager(p,f,dir){
  // a villager is fifteen pixels tall: half a doorway, a third of a pine
  const c=mk(12,20),x=c.getContext('2d');
  const[sh,pa,ha,sk,hat]=p,st=f?1:0,side=dir=='side',back=dir=='back';
  const lite=mixc(sh,[255,255,255],.26),dark=mixc(sh,[0,0,0],.3),boot=[48,38,30];
  // legs and boots
  const l1=side?4-st:3-st,l2=side?6+st:6+st;
  px(x,l1,12,rgb(pa),2,4);px(x,l2,12,rgb(mixc(pa,[0,0,0],.15)),2,4);
  px(x,l1,16,rgb(boot),2,1);px(x,l2,16,rgb(boot),2,1);
  // torso
  const bx=3,bw=side?5:6;
  px(x,bx,7,rgb(sh),bw,5);
  px(x,bx,7,rgb(lite),bw,1);
  px(x,bx,11,rgb(dark),bw,1);
  px(x,bx+1,6,rgb(dark),bw-2,1);
  if(!side){px(x,bx+2,8,rgb(dark),1,1);px(x,bx+3,10,rgb(dark),1,1)}
  // arms
  px(x,side?2-st:1,7,rgb(sh),2,3);px(x,side?2-st:1,10,rgb(sk),2,1);
  px(x,side?7+st:9,7,rgb(sh),2,3);px(x,side?7+st:9,10,rgb(sk),2,1);
  // head
  const hx=3;
  px(x,hx,2,rgb(sk),5,5);
  px(x,hx-1,1,rgb(ha),7,2);
  px(x,hx-1,3,rgb(ha),1,3);px(x,hx+4,3,rgb(ha),1,3);
  if(back)px(x,hx-1,2,rgb(ha),7,4);
  else if(side){px(x,hx+3,4,rgb([28,20,16]));px(x,hx+4,5,rgb(mixc(sk,[0,0,0],.3)),1,1)}
  else{px(x,hx+1,4,rgb([28,20,16]));px(x,hx+3,4,rgb([28,20,16]))}
  if(hat){px(x,hx-2,1,rgb(hat),9,1);px(x,hx-1,0,rgb(mixc(hat,[0,0,0],.28)),7,1);px(x,hx-1,0,rgb(mixc(hat,[255,255,255],.15)),5,1)}
  return{c,ox:6,oy:17}}
