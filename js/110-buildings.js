/* ================= SCENE: buildings ================= */
function box(o){
 const a=o.a,ah=a>>1,wh=o.wh,H=o.H,ov=o.ov||4,w=2*a+2*ov+14,cy=H+wh+(o.top||30),cx=w>>1,h=cy+ah+(o.bot||14),c=mk(w,h),x=c.getContext('2d'),P=(X,Y,col)=>px(x,X,Y,rgb(col)),gl=[];
 for(let u=0;u<a;u++){const yb=cy+Math.floor(u*ah/a),tot=wh+Math.round(H*(1-Math.abs(u/(a/2)-1)));for(let v=0;v<tot;v++){const col=o.wall(0,u,v,tot);if(col){const ao=(v<6?.7+.05*v:1)*(v>=tot-3?.86:1);P(cx-a+u,yb-1-v,ao<1?col.map(q=>q*ao):col)}}}
 for(let u=0;u<a;u++){const yb=cy+ah-Math.floor(u*ah/a);for(let v=0;v<wh;v++){const col=o.wall(1,u,v,wh);if(col){const ao=(v<6?.68+.053*v:1)*(v>=wh-3?.8:1);P(cx+u,yb-1-v,ao<1?col.map(q=>q*ao):col)}}}
 // glow points from window features
 for(const f of o.glow||[]){const u=f.u+f.w/2,v=f.v+f.h/2;if(f.face==0)gl.push([cx-a+u,cy+Math.floor(u*ah/a)-1-v,f.r||17]);else gl.push([cx+u,cy+ah-Math.floor(u*ah/a)-1-v,f.r||17])}
 // roof slope (parallelogram) with shingles
 const Fp=[cx,cy+ah-wh],M1=[cx-a/2,cy+ah/2-wh-H],p0=[Fp[0],Fp[1]+ov],e1=[a+2*ov,-(a+2*ov)/2],e2=[M1[0]-ov-Fp[0],M1[1]+ov/2-Fp[1]-ov],NR=Math.round(H/o.rowH)+1,NC=Math.round(a/o.colW),RC=o.roof;
 para(x,p0,e1,e2,(s,t)=>{const row=Math.floor(t*NR),ft=t*NR-row,col=Math.floor(s*NC+(row&1)*.5),fs=s*NC+(row&1)*.5-col,q=hh(col+7,row);
  let k=RC[q<.3?0:q<.7?1:2];k=mixc(k,[0,0,0],clamp(.2-t*.12,0,.2));
  if(ft<.22)k=mixc(k,[0,0,0],.45);else if(ft>.8)k=mixc(k,[255,240,210],.1);
  if(fs<.07)k=mixc(k,[0,0,0],.3);
  if(o.moss&&vn(s*6+3,t*6)>.74&&q>.35)k=mixc(k,[70,128,52],.55);
  if(t<.035)k=mixc(k,[0,0,0],.4);return rgb(k)});
 const R0=[M1[0]-ov,M1[1]+ov/2];
 // gable trim + ridge cap
 ln(x,cx-a,cy-wh,Math.round(M1[0]-ov),Math.round(M1[1]+ov/2),rgb(o.trim||[240,224,190]));ln(x,cx-a,cy-wh+1,Math.round(M1[0]-ov),Math.round(M1[1]+ov/2)+1,rgb([86,58,36]));
 ln(x,Math.round(R0[0]),Math.round(R0[1])-1,Math.round(R0[0]+e1[0]),Math.round(R0[1]+e1[1])-1,rgb(mixc(RC[2],[255,240,210],.25)));ln(x,Math.round(R0[0]),Math.round(R0[1]),Math.round(R0[0]+e1[0]),Math.round(R0[1]+e1[1]),rgb(mixc(RC[1],[255,230,190],.12)));
 const res={c,ox:cx,oy:cy,gl,sh:o.sh,a,ah,rf:{p0,e1,e2,M1,R0}};
 if(o.chimney){const s=o.chimney[0],t=o.chimney[1],X=Math.round(p0[0]+s*e1[0]+t*e2[0]),Y=Math.round(p0[1]+s*e1[1]+t*e2[1]),ch=o.chimney[2];
  for(let yy=0;yy<ch;yy++)for(let xx=-5;xx<=5;xx++){const lit=xx<1,br=((yy>>1)+(xx+(((yy>>1)&1)*3)))%4==0||yy%3==2,hv=hh(xx+9,yy);P(X+xx,Y-yy,br?(lit?[104,94,86]:[70,64,60]):(lit?(hv>.6?[168,156,144]:[146,134,122]):(hv>.6?[112,102,94]:[96,86,80])))}
  px(x,X-6,Y-ch,rgb([176,164,152]),13,2);px(x,X-6,Y-ch+2,rgb([88,78,72]),13,1);px(x,X-3,Y-ch-1,rgb([20,16,14]),7,1);res.ch=[X,Y-ch-2]}
 if(o.after)o.after(x,res,cx,cy,a,ah,wh,H);
 return res}
const TIMB=[92,60,36];
function windowPix(f,fu,fv,k,kind){ // returns colour or null; kind 'w'
 const w=f.w,h=f.h;
 if(f.box&&fu>=-1&&fu<=w&&fv>=-3&&fv<=-1)return fv==-1&&fu>=0&&fu<w?[120,80,46].map(q=>q*k):[150,104,60].map(q=>q*k);
 if(fu>=0&&fu<w&&fv>=0&&fv<=1&&f.box){const q=hh(fu,fv+3);return fv==1&&q>.4?(q>.8?[238,72,84]:q>.6?[255,214,80]:[252,252,252]):[64,136,52]}
 if(f.shut&&fv>=0&&fv<h&&((fu>=-3&&fu<=-1)||(fu>=w&&fu<=w+2))){const sl=((fu+3)%(w+3))%3;return(fv%3==0?[44,76,62]:[70,112,90]).map(q=>q*k)}
 if(fu>=0&&fu<w&&fv>=0&&fv<h){if(fu==0||fu==w-1||fv==0||fv==h-1||fu==(w>>1)||fv==(h>>1))return[242,238,224].map(q=>q*(.55+.45*k));
  const g=fv/h;if(fu==1&&fv>=h-4)return[255,248,214];return mixc([255,212,120],[255,160,64],1-g)}
 return null}
function cottage(rc){
 const a=40,wh=26,H=27,F={0:[{u:7,v:9,w:8,h:11,box:1,shut:1},{u:25,v:9,w:8,h:11,box:1,shut:1}],1:[{u:27,v:9,w:8,h:11,box:1,shut:1}]},DOOR={u:8,v:0,w:11,h:18};
 const wall=(face,u,v,tot)=>{const k=face==0?1:.66;let col;
  for(const f of F[face]){const r=windowPix(f,u-f.u,v-f.v,k);if(r)return r}
  if(face==1){const fu=u-DOOR.u,fv=v-DOOR.v;
   if(fu>=-1&&fu<=DOOR.w&&fv>=-2&&fv<=-1)return[170,164,148].map(q=>q*k);
   const hw=(DOOR.w-1)/2,arch=fv>=DOOR.h-4?hw-(fv-(DOOR.h-4))*.85:hw+1;
   if(fv>=0&&fv<DOOR.h+1&&Math.abs(fu-hw)<=arch+.5){if(Math.abs(fu-hw)>=arch-.5||fv==DOOR.h)return[66,44,28].map(q=>q*k);
    if(fu==DOOR.w-3&&fv==8)return[236,196,84];if(fv==3||fv==DOOR.h-6)return[72,48,30].map(q=>q*k);return(fu%3==1?[100,64,38]:[124,82,48]).map(q=>q*k)}
   if(fu>=DOOR.w+2&&fu<=DOOR.w+4&&fv>=11&&fv<=16)return(fu==DOOR.w+3&&fv>=12&&fv<=15)?[255,226,130]:[40,30,24];
   if(fu==DOOR.w+3&&fv==17)return[40,30,24]}
  if(v<5){const row=Math.floor(v/2.5),off=(row&1)*3;if(v==4)return[164,158,142].map(q=>q*k);const mort=(u+off)%6==0||v==2;col=mort?[96,90,80]:hh(Math.floor((u+off)/6),row)>.5?[142,136,122]:[124,118,106];return col.map(q=>q*k)}
  if(v==5)return TIMB.map(q=>q*k*.8);
  if(face==0&&v>=wh){const hv=v-wh,du=Math.abs(u-a/2);
   const gf={u:a/2-4,v:wh+4,w:8,h:9,box:0};const r=windowPix(gf,u-gf.u,v-gf.v,k);if(r)return r;
   if(du<=1.2)return TIMB.map(q=>q*k);if(Math.abs(du-(15-hv))<1.1&&hv<=14)return TIMB.map(q=>q*k)}
  if(u<2||u>=a-2||v>=wh-2&&v<wh||(face==0&&u>=19&&u<=20&&v<wh)||v==wh-3&&0)return(face==0?TIMB:TIMB.map(q=>q*.9)).map(q=>q*k*(u<1?1.15:1));
  const q=hh(u,v);col=[238,226,194];if(q>.93)col=[218,206,176];else if(q<.04)col=[246,238,210];if(vn(u*.15,v*.1)<.3)col=col.map(z=>z*.95);
  const eave=(face==1&&v>=wh-4)?.82:1;return col.map(z=>z*k*eave)};
 const r=box({a,wh,H,wall,roof:rc||[[112,40,28],[160,58,36],[198,82,46]],rowH:3.2,colW:5.5,moss:1,chimney:[.2,.55,24],sh:[18,6,46,18],top:40,bot:18,
  glow:[{face:0,u:7,v:9,w:8,h:11},{face:0,u:25,v:9,w:8,h:11},{face:1,u:27,v:9,w:8,h:11},{face:0,u:a/2-4,v:wh+4,w:8,h:9,r:14},{face:1,u:DOOR.w+2+8,v:11,w:3,h:5,r:22}]});
 return r}
function barn(rc){
 const a=46,wh=32,H=30,DW=24,F=[{u:9,v:14,w:7,h:8},{u:32,v:14,w:7,h:8}];
 const wall=(face,u,v,tot)=>{const k=face==0?1:.64,W=[238,232,214];
  if(face==0){for(const f of F){const fu=u-f.u,fv=v-f.v;if(fu>=-1&&fu<=f.w&&fv>=-1&&fv<=f.h){const e=fu==-1||fu==f.w||fv==-1||fv==f.h||fu==(f.w>>1)||fv==(f.h>>1);return e?W.map(q=>q*k):[34,30,34]}}
   if(v>=wh){const fu=u-(a/2-6),fv=v-(wh+3);if(fu>=-1&&fu<=12&&fv>=-1&&fv<=14){if(fu==-1||fu==12||fv==-1||fv==14||fv==7&&0)return W.map(q=>q*k);if(fv<=3)return hh(fu,fv)>.4?[238,208,112]:[196,160,74];return[40,28,24]}}}
  if(face==1){const fu=u-10,fv=v;if(fu>=-1&&fu<=DW&&fv>=0&&fv<=DW){const lf=fu%12,E=fu==-1||fu==DW||fu==11||fu==12||fv==DW||fv==0;
    if(E)return W.map(q=>q*k);if(Math.abs(lf-fv*11/DW)<.9||Math.abs(11-lf-fv*11/DW)<.9)return W.map(q=>q*k);return(fu%3==0?[104,34,26]:[126,42,32])}}
  if(v<4)return(hh(Math.floor(u/4),v>>1)>.5?[132,126,116]:[110,104,96]).map(q=>q*k);
  if(u<2||u>=a-2||v>=wh-2&&v<wh)return W.map(q=>q*k);
  const q=hh(u,v>>3);let col=u%4==0?[120,38,28]:[162,56,42];if(hh(u>>2,v>>2)>.86)col=col.map(z=>z*.88);if(vn(u*.2,v*.12)<.26)col=col.map(z=>z*.92);return col.map(z=>z*k)};
 return box({a,wh,H,wall,roof:rc||[[70,62,60],[98,88,84],[132,120,112]],rowH:3.4,colW:6,moss:0,trim:[236,230,214],sh:[22,8,56,22],top:44,bot:12,
  after:(x,res)=>{const m=[res.rf.R0[0]+res.rf.e1[0]*.5,res.rf.R0[1]+res.rf.e1[1]*.5];const X=Math.round(m[0]),Y=Math.round(m[1]);px(x,X,Y-14,rgb([40,36,36]),1,14);ln(x,X-5,Y-12,X+5,Y-12,rgb([176,150,70]));px(x,X+5,Y-14,rgb([176,150,70]),3,3);px(x,X-6,Y-11,rgb([176,150,70]),2,2);disc(x,X,Y-15,2,2,rgb([196,60,40]))}})}
function coop(){
 const a=16,wh=11,H=9,wall=(face,u,v,tot)=>{const k=face==0?1:.66;
  if(face==1&&u>=4&&u<=10&&v<9){const hw=3;if(Math.abs(u-7)<=hw&&(v<6||Math.abs(u-7)<hw-(v-6)*1))return Math.abs(u-7)>=hw||v==8?[84,58,34].map(q=>q*k):[44,28,20]}
  if(face==0&&u>=5&&u<=10&&v>=4&&v<=9)return(u==5||u==10||v==4||v==9)?[96,66,40]:[214,176,110].map(q=>q*k);
  if(u<1||u>=a-1||v>=wh-1&&v<wh)return[236,226,200].map(q=>q*k);if(v<2)return[120,114,104].map(q=>q*k);
  let col=u%3==0?[138,96,54]:[186,138,82];if(hh(u,v>>3)>.8)col=col.map(z=>z*.9);return col.map(z=>z*k)};
 return box({a,wh,H,wall,roof:[[132,48,32],[170,62,38],[206,88,48]],rowH:3,colW:4.5,moss:0,sh:[8,3,22,9],top:20,bot:8,ov:3,
  after:(x,res,cx,cy,a,ah)=>{for(let k=0;k<12;k++){const X=cx+8+k,Y=cy+ah-Math.floor(8*ah/a)+2+(k>>1);px(x,X,Y,rgb([186,138,82]),1,2);px(x,X,Y+2,rgb([102,70,42]),1,1);if(k%3==0)px(x,X,Y-1,rgb([130,90,52]))}}})}
function pier(){const Lt=4.4,Wt=.8,e1=[-Lt*16,Lt*8],e2=[Wt*16,Wt*8],c=mk(104,78),x=c.getContext('2d'),p0=[84,22];
 const at=(s,t)=>[Math.round(p0[0]+s*e1[0]+t*e2[0]),Math.round(p0[1]+s*e1[1]+t*e2[1])];
 // piles standing in the water under the deck
 for(const s of[.06,.36,.66,.96])for(const t of[.05,.95]){const[X,Y]=at(s,t);px(x,X-1,Y+3,rgb([46,32,22]),3,11);px(x,X,Y+3,rgb([76,54,36]),1,11)}
 // deck: thickness, then planks laid across the walkway
 para(x,[p0[0],p0[1]+4],e1,e2,()=>rgb([52,34,22]));
 para(x,[p0[0],p0[1]+2],e1,e2,()=>rgb([86,60,38]));
 para(x,p0,e1,e2,(s,t)=>{const m=s*Lt*6,q=hh(Math.floor(m),5);let k=q>.6?[198,152,96]:q>.3?[176,130,80]:[154,112,66];if(m%1<.14)k=[98,68,42];if(t<.07)k=[132,94,58];if(t>.93)k=[116,80,48];return rgb(k)});
 // rail posts and rope along both edges
 for(const t of[.04,.96]){let prev=null;for(const s of[.02,.34,.66,.98]){const[X,Y]=at(s,t);px(x,X-1,Y-8,rgb([84,56,36]),2,9);px(x,X-1,Y-9,rgb([170,124,76]),2,1);if(prev)ln(x,prev[0],prev[1]-7,X,Y-7,rgb([206,176,126]));prev=[X,Y]}}
 // a lantern on the tallest post at the far end
 const[X,Y]=at(.98,.96);px(x,X-1,Y-20,rgb([84,56,36]),2,12);px(x,X-3,Y-22,rgb([36,28,22]),6,1);px(x,X-3,Y-21,rgb([236,186,84]),6,5);px(x,X-2,Y-20,rgb([255,226,152]),4,3);px(x,X-3,Y-16,rgb([36,28,22]),6,1);
 return{c,ox:84,oy:22,gl:[[X,Y-19,30]]}}
