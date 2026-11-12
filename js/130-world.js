/* ================= SCENE: world build ================= */
const SH=[];
function put(fi,fj,sp,t,dd){const[X,Y]=PF(fi,fj),o={d:fi+fj+(dd||0),x:Math.round(X),y:Math.round(Y),sp,ph:hh(fi,fj)*6,t:t||0};objs.push(o);if(sp.sh)SH.push([o.x+sp.sh[0],o.y+sp.sh[1],sp.sh[2],sp.sh[3]]);if(sp.sol!==undefined)addSolid(fi,fj,sp.sol,sp);return o}
/* ================= SKY ISLANDS: rock undersides, waterfalls, ground ================= */
let FALLS=[];
const relief=(a,b)=>{const r=(p,q)=>vn(p*.2,q*.2)*.62+vn(p*.5+3,q*.5)*.28+vn(p*1.4,q*1.4+8)*.1;return 1+clamp((r(a-.16,b-.16)-r(a+.16,b+.16))*4.2,-.2,.2)+(vn(a*.07,b*.07)-.5)*.16};
const RCT=[[142,148,140],[118,126,122],[152,146,130],[106,114,116]];
function rockCol(x,v,s,D,k){
 const n=vn(x*.12,v*.08)*.5+vn(x*.37,v*.23)*.3+hh(x,v)*.2;let col;
 if(v<1)col=hh(x,5)>.6?[100,156,64]:[70,126,48];
 else if(v<3)col=[116,82,46];
 else if(v<7){col=hh(x>>1,v)>.5?[124,90,52]:[104,74,42];if(hh(x,v*3)>.88)col=[66,92,42]}
 else{const o=Math.floor(vn(x*.035,k*3)*9),band=Math.floor((v+o)/10),T0=RCT[band&3];col=T0.map(q=>q*(.8+n*.38));
  if((v+o)%10==0)col=col.map(q=>q*1.14);
  if(vn(x*.07,v*.45+k)>.8&&hh(x,v)>.25)col=col.map(q=>q*.68);
  if(v<30&&vn(x*.16,v*.35+k*7)>.64+v*.007)col=mixc(col,k==2?[96,140,78]:[84,134,60],.6);
  if(v>D*.72)col=mixc(col,[188,204,214],clamp((v-D*.72)/(D*.28),0,1)*.5)}
 const sh=.56+.44*s;return col.map(q=>q*sh*(1-.28*clamp(v/D,0,1)))}
// Every land pixel was tagged in LM (1 = village isle, 2 = sakura isle). Below the lowest tagged pixel of each
// column we hang the rock: a lit left face, a shaded right face, and a deep tapering underside.
function drawCliffs(c){
 YB=[null,new Int16Array(Wd).fill(-1),new Int16Array(Wd).fill(-1),new Int16Array(Wd).fill(-1),new Int16Array(Wd).fill(-1)];
 const mn=[0,1e9,1e9,1e9,1e9],mx=[0,-1,-1,-1,-1];
 for(let x=0;x<Wd;x++){let f1=0,f2=0,f3=0,f4=0;for(let y=Ht-1;y>=0&&!(f1&&f2&&f3&&f4);y--){const m=LM[y*Wd+x];
  if(m==1&&!f1){YB[1][x]=y;f1=1;mn[1]=Math.min(mn[1],x);mx[1]=Math.max(mx[1],x)}
  else if(m==2&&!f2){YB[2][x]=y;f2=1;mn[2]=Math.min(mn[2],x);mx[2]=Math.max(mx[2],x)}
   else if(m==3&&!f3){YB[3][x]=y;f3=1;mn[3]=Math.min(mn[3],x);mx[3]=Math.max(mx[3],x)}
   else if(m==4&&!f4){YB[4][x]=y;f4=1;mn[4]=Math.min(mn[4],x);mx[4]=Math.max(mx[4],x)}}}
 for(let k=1;k<=4;k++){const Y=YB[k],xc=(mn[k]+mx[k])/2,hw=(mx[k]-mn[k])/2,ds=k==1?1:k==2?.84:k==3?.78:.8;
  for(let x=mn[k];x<=mx[k];x++){const yb=Y[x];if(yb<0)continue;
   const ya=Y[Math.min(mx[k],x+5)],ypv=Y[Math.max(mn[k],x-5)],slope=(ya<0||ypv<0)?0:ya-ypv,bin=slope>0?1:slope<0?0:(x<xc?1:0);
   const tt=clamp(1-Math.abs(x-xc)/hw,0,1),D=Math.round((14+112*Math.pow(tt,1.15))*ds*(.88+.24*vn(x*.025,k*5+1))+(hh(x>>2,k+3)>.93?hh(x>>3,k)*18:0));
   for(let v=0;v<=D;v++){const y=yb+1+v;if(y>=Ht)break;if(LM[y*Wd+x])continue;
    const w=sm(10,56,v),smooth=clamp(.5+(xc-x)/(hw*.6),0,1),s=lerp(bin,smooth,w);
    c.globalAlpha=clamp((D-v)/16,0,1);c.fillStyle=rgb(rockCol(x,v,s,D,k));c.fillRect(x,y,1,1)}
   // hanging vines, with the odd blossom on the sakura isle
   if(hh(x,9+k)>.972){const L=5+Math.floor(hh(x,3)*22);for(let v=0;v<L;v++){c.globalAlpha=1;c.fillStyle=v%3==0?'#5ab04a':'#3b8a35';c.fillRect(x,yb+2+v,1,1);if(v>2&&hh(v,x)>.7)c.fillRect(x+1,yb+2+v,1,1);if(k==2&&v>4&&hh(v,x+3)>.85){c.fillStyle='#ffb8cf';c.fillRect(x-1,yb+2+v,2,1)}}}}}
 c.globalAlpha=1;
 const jA=POND[1]+(63.5-31.4)*.075,jB=POND2[1]+(120-PX2)*.05;
 FALLS=[{isl:1,x0:Math.round(OX+(63.5-jA-1.3)*16),x1:Math.round(OX+(63.5-jA+1.3)*16),len:122},
        {isl:2,x0:Math.round(OX+(120-jB-1.2)*16),x1:Math.round(OX+(120-jB+1.2)*16),len:100}];
}
function fall(){const c=c2;
 for(const F of FALLS){const w=F.x1-F.x0;
  for(let x=F.x0;x<=F.x1;x++){const y0=YB[F.isl][x];if(y0<0)continue;const ex=Math.min(x-F.x0,F.x1-x)<2?.6:1;
   for(let v=-1;v<F.len;v++){const al=(v<26?1:clamp(1-(v-26)/(F.len-26),0,1))*.92*ex;if(al<=.02)continue;
    const col=(v<2)?'#ffffff':(((v+T*38+x*2.3)|0)%9<3?'#eef9ff':(((v+T*38)|0)%5<2?'#a9dcec':'#6fb7d3'));
    c.globalAlpha=al;c.fillStyle=col;c.fillRect(x,y0+v,1,1)}}
  const ym=YB[F.isl][Math.round((F.x0+F.x1)/2)];
  if(ym>=0)for(let q=0;q<9;q++){const ph=(T*.33+q/9)%1,X=F.x0+hh(q,F.isl+9)*w+Math.sin(T*.8+q)*3,Y=ym+F.len*.5+ph*F.len*.5;
   c.globalAlpha=.3*(1-ph);disc(c,Math.round(X),Math.round(Y),3+Math.round(ph*7),2+Math.round(ph*4),'#eef8fc')}
  }c.globalAlpha=1}
// ---- ground of the sakura isle: cool moss, pale gravel, a raked sand garden, drifts of petals ----
const MB=PP({m:['#1d4a3a','#285c45','#347358','#468a62','#62a672']}).m;
const GRV=[[176,168,152],[190,182,166],[160,154,140]];
function groundB(fi,fj,x,y,n,isDirt){
 const dz=Math.hypot(fi-88.2,fj-29.2);
 if(dz<2.7+(vn(fi*2,fj*2)-.5)*.3){const rr=Math.sin(dz*9.5+Math.sin(fj*2.1)*.7);return rr>.35?[226,218,200]:rr<-.4?[130,124,112]:GRV[Math.floor(n*2.7)%3]}
 if(isDirt){let k=GRV[Math.floor(n*2.7)%3];if(hh(x,y)>.93)k=[214,206,190];if(hh(x,y*3)<.05)k=[118,112,100];return k}
 const gi=clamp(Math.floor(n*4.4+(vn(fi*.55,fj*.55)-.5)*1.5),0,4);let k=MB[gi];const lt=relief(fi,fj);k=[k[0]*lt,k[1]*lt,k[2]*lt];
 const gr=Math.max(0,1-Math.hypot(fi-113,fj-33)/11)+Math.max(0,1-Math.hypot(fi-94,fj-24)/6);
 if(hh(x,y)>.93-gr*.16&&vn(fi*1.7,fj*1.7)>.4)k=mixc(k,hh(x+1,y)>.5?[255,214,226]:[246,160,190],.72);
 return k}
// ---- ground of the observatory rock: cold lichen, weathered stone, a paved disc under the dome ----
const MC=PP({m:['#263a34','#334c42','#40604f','#517a5f','#6b9877']}).m;
function groundC(fi,fj,x,y,n,isDirt){
 const gi=clamp(Math.floor(n*4.2+(vn(fi*.55,fj*.55)-.5)*1.4),0,4);
 const lt=relief(fi,fj);let k=MC[gi];k=[k[0]*lt,k[1]*lt,k[2]*lt];
  const dz=Math.hypot(fi-133.4,fj-26.2),rd=4.7+(vn(fi*2,fj*2)-.5)*.45;
 if(dz<rd){
  if(dz>rd-.4)return [126,122,110];
  const gx=fi*1.12,gy=fj*1.12,gxi=Math.floor(gx),gyi=Math.floor(gy),fx=gx-gxi,fy=gy-gyi;
  const grout=fx<.045||fy<.045;
  const t=(hh(gxi,gyi)>.6?1:0)+(fx<.5?1:0);
  const pc=[[166,160,144],[158,152,136],[162,156,140],[154,148,132]];
  if(grout)return [140,136,124];
  return pc[t]}
 if(isDirt){const g2=Math.floor(n*3);return [[150,146,132],[136,132,120],[166,162,148]][g2]}
 if(hh(x,y)>.955&&vn(fi*1.7,fj*1.7)>.45)k=mixc(k,[186,196,168],.6);
 return k}
// ---- a second pass of small things on the village isle: blade clumps, clover, pebbles, twigs, toadstools ----
function moreDetailA(c,dirt){
 for(let i=0;i<VN;i++)for(let j=0;j<VN;j++)for(let s=0;s<16;s++){
  const fi=i+hh(i*29+s,j+91)-.5,fj=j+hh(j*17+s,i+57)-.5;
  if(!LANDA(fi,fj)||WD(fi,fj)>-.7||dirt(fi,fj)||ZONE(fi,fj)=='field')continue;
  const[X0,Y0]=PF(fi,fj),X=Math.round(X0),Y=Math.round(Y0),r=RG(fi,fj),q=hh(s*7+i,j*3+11),pal=GP[r];
  if(r=='s'){if(q<.45){px(c,X-1,Y,'#ffffff',3,1);px(c,X,Y+1,'#cfe4ee',2,1);px(c,X+2,Y-1,'#f4fafc',1,1)}continue}
  if(q<.46){for(let m=-2;m<=2;m++){const h=2+((hh(m+i*3,j+s)*3)|0);px(c,X+m,Y-h,rgb(pal[3+((m+s)&1)]),1,h)}px(c,X-1,Y,rgb(pal[0]),3,1);px(c,X,Y-4,rgb(pal[4]),1,1)}
  else if(q<.58){px(c,X,Y,rgb(pal[0]),1,2);for(const[dx,dy]of[[-1,-1],[1,-1],[0,-2],[0,0]])px(c,X+dx,Y+dy,rgb(pal[4]),1,1);if(hh(s,i+j)>.7)px(c,X,Y-1,'#fff6c8',1,1)}
  else if(q<.66){px(c,X,Y+1,'#7d868a',3,1);px(c,X,Y,'#aab4b6',2,1);px(c,X+1,Y-1,'#d2d8d8',1,1)}
  else if(q<.7){ln(c,X-3,Y,X+2,Y+1,'#5a3e24');px(c,X-3,Y,'#8a6238',1,1)}
  else if(q<.715&&r=='g'){px(c,X,Y-2,'#efe6cc',1,3);px(c,X-2,Y-4,'#d6382e',5,2);px(c,X-1,Y-5,'#d6382e',3,1);px(c,X-1,Y-4,'#fff',1,1);px(c,X+1,Y-3,'#fff',1,1)}
 }}
