/* ================= THE CHART OF THE CLOUD SEA =================
   A hand-drawn chart of the whole world. Painted once from the same land functions the
   ground is baked from, so the coastlines match the rocks you actually walked around.

   The elevation is the chart's whole business: every island sits a little higher than
   the sea under it, with the rock drawn falling away beneath its south edge, exactly
   the way this world draws a cliff face it has no intention of admitting to.
   ------------------------------------------------------------------ */
// the chart fits itself to the world: it finds the land, pads it, and matches the frame's aspect,
// so a bigger kingdom (or a different canvas) never stretches or crops the coastlines
let CHM={FX:180,FY:20,FW:3140,FH:1700};
function fitChart(W,H){
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
 for(let a=-6;a<=180;a+=2)for(let b=-6;b<=112;b+=2){if(!LAND(a,b))continue;const[X,Y]=PF(a,b);if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y}
 if(x1<x0)return;
 x0-=90;x1+=90;y0-=150;y1+=150;                      // room for the cliffs, the names and the sea
 let fw=x1-x0,fh=y1-y0;const asp=W/Math.max(1,H-56);
 if(fw/fh>asp){const nh=fw/asp;y0-=(nh-fh)/2;fh=nh}else{const nw=fh*asp;x0-=(nw-fw)/2;fw=nw}
 CHM={FX:x0,FY:y0,FW:fw,FH:fh}}
const CH_G=[[146,186,116],[126,166,104],[184,214,132]];
const chTile=(x,y,W,H)=>{const wx=CHM.FX+x/W*CHM.FW,wy=CHM.FY+y/(H-56)*CHM.FH;
 const a=((wx-OX)/16+(wy-OY)/8)/2,b=((wy-OY)/8-(wx-OX)/16)/2;return[a,b]};
const chXY=(g,a,b)=>{const[X0,Y0]=PF(a,b);return[(X0-CHM.FX)/CHM.FW*g.canvas.width,(Y0-CHM.FY)/CHM.FH*(g.canvas.height-56)]};
const chAlt=(a,b)=>clamp(relief(a,b)-.82,0,.6);

function paintChart(g){
 const W=g.canvas.width,H=g.canvas.height;fitChart(W,H);
 // the paper: parchment, with the long pale streaks an old sea gets from being dragged north
 for(let y=0;y<H;y++){
  for(let x=0;x<W;x++){
   const n1=vn(x*.055+3,y*.075+9)*.62+vn(x*.17+40,y*.13+21)*.38;
   const edge=Math.hypot(x/W-.5,y/H-.5)*.9;
   const k=clamp(.52+(n1-.5)*.42-edge*.34,0,1);
   const m=mixc([204,184,138],[172,152,114],1-k);
   const c=mixc(m,[148,130,98],k*.58);
   g.fillStyle=rgb([Math.round(c[0]),Math.round(c[1]),Math.round(c[2])]);
   g.fillRect(x,y,1,1)}}
 // the open sea, as a wash of cool grey-blue over the paper, thinner near the edges
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const n=vn(x*.028+17,y*.021+5)*.6+vn(x*.09+31,y*.07+12)*.4;
  if(n<.40)continue;
  g.fillStyle='rgba(74,110,118,'+Math.min(.58,(n-.40)*1.9).toFixed(3)+')';g.fillRect(x,y,1,1)}
 // the rivers and the harbour mouths stay silver, because old charts always kept them so
 g.fillStyle='rgba(226,238,238,.30)';
 for(let k=0;k<170;k++){const x=(hh(k,5)*W)|0,y=(hh(k,9)*H)|0;g.fillRect(x,y,1,1)}
 // the little wave marks the sailors drew in the shallows
 g.strokeStyle='rgba(214,230,233,.55)';g.lineWidth=1;
 for(let k=0;k<470;k++){
  const x=(hh(k,3)*W)|0,y=(hh(k,7)*H)|0,wd=4+((hh(k,13)*8)|0);
  g.globalAlpha=.55;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+wd/2,y-2,x+wd,y);g.stroke();g.globalAlpha=1}
 // rhumb lines: the faint web of bearings every old chart carries, fanning out from two roses
 g.strokeStyle='rgba(44,36,24,.13)';g.lineWidth=1;
 for(const[rx,ry]of[[.22,.78],[.78,.2]])for(let k=0;k<16;k++){const an=k/16*6.2832;g.beginPath();g.moveTo(rx*W,ry*(H-56));g.lineTo(rx*W+Math.cos(an)*W*1.4,ry*(H-56)+Math.sin(an)*W*1.4);g.stroke()}
 // a sea creature, drawn the way sailors drew what they were afraid of
 {const kx=W*.9,ky=(H-56)*.82;g.strokeStyle='rgba(30,40,40,.55)';g.lineWidth=1.4;
  for(let t=0;t<5;t++){g.beginPath();g.moveTo(kx,ky);g.bezierCurveTo(kx-8-t*5,ky-14+t*4,kx-22-t*7,ky+10-t*3,kx-30-t*9,ky-4+t*6);g.stroke()}
  g.fillStyle='rgba(30,40,40,.5)';g.beginPath();g.ellipse(kx,ky,9,6,.3,0,6.283);g.fill();g.fillStyle='#e8dcbc';g.fillRect(kx-4,ky-2,2,2);g.fillRect(kx+1,ky-2,2,2)}
 // cloud swirls: big pale throws laid beneath the isles
 g.globalAlpha=.5;g.fillStyle='#e8e2cc';
 for(const[cx,cy,rx,ry]of[[230,168,150,24],[505,228,150,20],[610,322,150,24],[330,390,190,22],[90,248,140,18],[744,132,122,16]]){
  g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,6.283);g.fill()}
 g.globalAlpha=1;
 // the islands, painted from the world itself, with relief so the high moss catches the light
 const id=g.createImageData(W,H),d=id.data;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const[a,b]=chTile(x,y,W,H);
  if(!LAND(a,b))continue;
  const w=WD(a,b), e=chAlt(a,b);
  let col=mixc(CH_G[0],CH_G[2],clamp(e*1.5,0,1));
  if(w>-.5)col=mixc(col,[96,112,76],clamp((.5+w)*.7,0,1));
  else if(w>-1.4)col=mixc(col,[72,92,60],((w+1.4)/.9)*.5);
  if(vn(a*.9+3,b*.9)>.82)col=mixc(col,[232,226,200],.42);
  const o=(y*W+x)*4, sh=clamp(.82+vn(a*.8+99,b*.8+99)*.45,0,1.28);
  d[o]=Math.min(255,col[0]*sh);d[o+1]=Math.min(255,col[1]*sh);d[o+2]=Math.min(255,col[2]*sh);d[o+3]=255}
 {const tc=mk(W,H);tc.getContext('2d').putImageData(id,0,0);g.drawImage(tc,0,0)}   // composite, so the parchment and the sea wash survive under the islands
 // the coastline: a dark ink rule where the rocks fall off to sea
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const[a,b]=chTile(x,y,W,H);
  if(!LAND(a,b))continue;
  if([[1,0],[0,1],[-1,0],[0,-1]].some(([dx,dy])=>{
   const[a2,b2]=chTile(x+dx,y+dy,W,H);return !LAND(a2,b2)})){g.globalAlpha=1;g.fillStyle='#2c2418';g.fillRect(x,y,1,1)}}
 // the rock of the cliffs below each island's south edge, drawn as a long half-alpha shadow on the sea
 for(let x=0;x<W;x++){
  let yb=-1;
  for(let y=H-1;y>=0;y--){const[a,b]=chTile(x,y,W,H);if(LAND(a,b)){yb=y;break}}
  if(yb<0)continue;
  const depth=3+((hh(x,7)*5)|0);
  for(let v=1;v<=depth;v++){
   g.fillStyle='rgba(46,40,30,'+clamp(.34-v*.065,0,.4).toFixed(3)+')';
   g.fillRect(x,yb+v,1,1)}}
 // the airship road: a dotted arc from the sky docks over to the harbour, with a tiny balloon on it
 {const[ax,ay]=chXY(g,112,90),[bx,by]=chXY(g,98,66);g.fillStyle='#e8dcbc';
  for(let i=0;i<=40;i++){const t=i/40,X=lerp(ax,bx,t),Y=lerp(ay,by,t)-Math.sin(t*Math.PI)*18;if(i%3<2)g.fillRect(Math.round(X),Math.round(Y),1,1)}
  const mx=(ax+bx)/2,my=(ay+by)/2-18;g.fillStyle='#c44a3a';g.beginPath();g.ellipse(mx,my-3,5,3,0,0,6.283);g.fill();g.fillStyle='#2c2418';g.fillRect(Math.round(mx)-2,Math.round(my),4,2)}
 // the bridges: a dashed line over each gap
 g.fillStyle='#e8dcbc';
 const dashes=[[RB,'h'],[RB2,'h'],[RB3,'v'],[RB4,'v']];
 for(const[R,kind]of dashes){
  for(let i=0;i<=34;i++){
   const t=i/34;
   const a=kind==='h'?lerp(R.a0,R.a1,t):R.a0;
   const b=kind==='h'?R.b:lerp(R.b0,R.b1,t);
   const[X,Y]=chXY(g,a,b);
   const lift=-R.sag*4*t*(1-t)*.72;
   if(i%4<2)g.fillRect(Math.round(X),Math.round(Y+lift),2,1)}}
}
function bakeChartMM(){const c=mk(MMW,MMH),g=c.getContext('2d');paintChart(g);return c}
function bakeChartBig(){
 const c=$('mchart');if(!c)return;
 const g=c.getContext('2d');
 paintChart(g);
 const W=c.width,H=c.height;
 // the frame: double rule with corner flourishes
 g.strokeStyle='#2c2418';g.lineWidth=3;g.strokeRect(3.5,3.5,W-7,H-7);
 g.strokeStyle='#e8c86a';g.lineWidth=1;g.strokeRect(10.5,10.5,W-21,H-21);
 g.fillStyle='#2c2418';
 for(const[sx,sy]of[[8,8],[W-8,8],[8,H-8],[W-8,H-8]]){
  for(let q=-7;q<=7;q++){g.fillRect(sx+(q<0?q:0)-1,sy,Math.abs(q)+2,2);g.fillRect(sx,sy+q-1,2,Math.abs(q)+2)}}
 // the five names, set the way an old chart sets them
 const J=(a,b,t,size)=>{const[X,Y]=chXY(g,a,b);
  g.font='700 '+(size||10)+'px Georgia,"Times New Roman",serif';g.textAlign='center';
  g.lineWidth=2.2;g.strokeStyle='rgba(44,36,22,.85)';g.fillStyle='#f2e6c0';
  g.strokeText(t,X,Y);g.fillText(t,X,Y)};
 J(25.0,36.0,'T H E   V I L L A G E',10);
 J(100.7,29.6,'S A K U R A   I S L E',9);
 J(133.3,17.2,'T H E   O B S E R V A T O R Y',8);
 J(94.5,66.8,'T H E   H A R B O U R',9);
 J(136.5,66.2,'T H E   S T A R   K I N G D O M',9);
 J(136.5,52.0,'the keep',6);J(136.5,78.0,'market square',6);J(149.0,88.0,'chapel of the quiet star',6);
 J(114.0,100.0,'sky docks',6);J(147.6,72.4,'the moon maze',6);J(158.6,70.0,'the mill',6);
 J(117.8,57.2,'the meadow of finished lights',6);J(138.5,107.0,'the empty chair',6);
 // the tiny gold star above the keep
 const[KX,KY]=chXY(g,136.5,53.5);
 g.fillStyle='#e8c86a';g.fillRect(KX-1,KY-17,3,3);
 // the compass rose, upper right
 const cx=W-44,cy=46,R=17;
 g.save();g.translate(cx,cy);
 g.fillStyle='#2c2418';g.beginPath();g.arc(0,0,R,0,6.283);g.fill();
 g.fillStyle='#e8c86a';g.beginPath();g.arc(0,0,R-3,0,6.283);g.fill();
 g.fillStyle='#2c2418';g.beginPath();g.arc(0,0,R-6,0,6.283);g.fill();
 for(let k=0;k<8;k++){const an=k*Math.PI/4,L=k%2?6:15;
  g.fillStyle=k%2?'#e8c86a':'#f2e6c0';
  g.beginPath();g.moveTo(Math.cos(an)*2.6,Math.sin(an)*2.6);
  g.lineTo(Math.cos(an-.18)*L,Math.sin(an-.18)*L);g.lineTo(Math.cos(an+.18)*L,Math.sin(an+.18)*L);g.fill()}
 g.fillStyle='#e8c86a';g.beginPath();g.arc(0,0,2.4,0,6.283);g.fill();
 g.font='700 9px Georgia,serif';g.fillStyle='#f2e6c0';g.textAlign='center';g.fillText('N',0,-R-3);g.restore();
 // the title along the bottom and the fine print under it
 g.font='700 14px Georgia,"Times New Roman",serif';g.textAlign='center';g.fillStyle='#2c2418';
 g.fillText('T H E   C L O U D   S E A',W/2,H-24);
 g.font='italic 8px Georgia,serif';g.fillStyle='#3a2f1e';
 g.fillText('measured on foot · the rocks stand above the cloud, and the chart does not · the kingdom opens for those who finish',W/2,H-10);
}
