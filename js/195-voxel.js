/* ================= THE VOXEL WORLD =================
   Stage A of the rebuild: the islands as real voxel columns, derived from
   the game's own land functions. Real WebGL (three.js, vendored — no bundler),
   lazy-loaded on the first V press so the 2D game loads exactly as before.
   One merged mesh per block type via greedy meshing, a cloud sea below,
   and water where the pond and the stream are.
   The 2D game keeps running behind it; V toggles the views.
   ------------------------------------------------------------------ */
(function(){
'use strict';
let TGT=null;
let built=false, loading=false, overlay=null, lbl=null, renderer=null, scene=null, camera=null, raf=0, waterMat=null, seaTex=null;
let az=Math.PI/4, el=.55, rad=174;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
let THREE=null;

// ---------- procedural 16x16 block textures (noise in code, not painted files) ----------
function blockTex(paint){const c=document.createElement('canvas');c.width=16;c.height=16;const g=c.getContext('2d');paint(g);
 const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t}
const h2=(a,b)=>{let h=Math.imul(a|0,374761393)+Math.imul(b|0,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
const speck=(g,ways)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const q=h2(x+ways*3,y*5+ways*2);if(q>.78){g.fillStyle=q>.9?'rgba(255,255,255,.22)':'rgba(0,0,0,.25)';g.fillRect(x,y,1,1)}}};
const tint=(g,base,spread)=>{g.clearRect(0,0,16,16);g.fillStyle=base;g.fillRect(0,0,16,16);for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=(h2(x+11,y*3+7)-.5)*spread;g.fillStyle=d>0?'rgba(255,255,255,'+d.toFixed(3)+')':'rgba(0,0,0,'+(-d).toFixed(3)+')';g.fillRect(x,y,1,1)}};
const TEX={};
function buildTextures(){
 TEX.grassTop=blockTex(g=>{tint(g,'#56814c',.4);speck(g,5)});
 TEX.mossTop=blockTex(g=>{tint(g,'#5d7260',.4);speck(g,9)});
 TEX.gravel=blockTex(g=>{tint(g,'#8d8574',.5);speck(g,13)});
 TEX.dirt=blockTex(g=>{tint(g,'#6b4c30',.42);speck(g,17)});
 TEX.stoneA=blockTex(g=>{tint(g,'#716f68',.3);g.fillStyle='rgba(28,28,27,.42)';g.fillRect(0,7,16,1);g.fillStyle='rgba(28,28,27,.3)';g.fillRect(11,0,1,7);g.fillRect(4,8,1,8);g.fillStyle='rgba(28,28,27,.3)';if(h2(3,7)>.7)g.fillRect(h2(9,4)*14+1|0,2+(h2(5,5)*3|0),1,2)});
 TEX.stoneB=blockTex(g=>{tint(g,'#4e4d49',.3);g.fillStyle='rgba(22,22,22,.42)';g.fillRect(0,6,16,1);g.fillStyle='rgba(22,22,22,.3)';g.fillRect(5,0,1,6);g.fillRect(12,7,1,9);if(h2(6,2)>.7)g.fillRect((h2(8,8)*14+1)|0,9+(h2(2,6)*4|0),1,3)});
 TEX.grassSide=blockTex(g=>{g.fillStyle='#4d7a45';g.fillRect(0,0,16,4);g.fillStyle='#3c5f36';for(let x=0;x<16;x++)if(h2(x,3)>.4)g.fillRect(x,4+(h2(x,8)*2|0),1,1);g.fillStyle='#6b4c30';g.fillRect(0,5,16,11);speck(g,23)});
 TEX.mossSide=blockTex(g=>{g.fillStyle='#5d7260';g.fillRect(0,0,16,3);g.fillStyle='#4a5c52';g.fillRect(0,3,16,2);g.fillStyle='#5f615a';g.fillRect(0,5,16,11);speck(g,29)});
 TEX.wood=blockTex(g=>{tint(g,'#6b4c30',.38);g.fillStyle='rgba(46,28,14,.5)';for(const x of[3,9,13])g.fillRect(x,0,1,16);g.fillStyle='rgba(255,235,190,.16)';for(const x of[6,11])g.fillRect(x,0,1,16)});
 const leaf=(base,hi,lo,seed)=>blockTex(g=>{tint(g,base,.42);speck(g,seed);g.fillStyle=hi;for(let i=0;i<10;i++){const x=h2(i,seed+3)*15|0,y=h2(i+7,seed*2)*15|0;g.fillRect(x,y,2,1)}g.fillStyle=lo;for(let i=0;i<8;i++){const x=h2(i+13,seed)*15|0,y=h2(i+21,seed+9)*15|0;g.fillRect(x,y,1,2)}});
 TEX.leafGreen=leaf('#28522d','#3a6b40','#19371f',37);
 TEX.leafPink=leaf('#c4788f','#dc9aae','#9a6078',41);
 TEX.leafOrange=leaf('#b96d20','#d48c30','#825017',43);
 TEX.leafDark=leaf('#1e3c22','#2d5230','#101d14',47);
 const wall=(base,seed)=>blockTex(g=>{tint(g,base,.22);speck(g,seed);g.fillStyle='rgba(60,45,30,.25)';g.fillRect(0,0,1,16);g.fillRect(15,0,1,16)});
 TEX.wallWhite=wall('#ded9c8',53);TEX.wallRed=wall('#933d32',57);TEX.wallBlue=wall('#3c5472',59);TEX.wallOchre=wall('#a88242',61);
 const roof=(base,seed)=>blockTex(g=>{tint(g,base,.25);g.fillStyle='rgba(16,18,26,.4)';for(let y=3;y<16;y+=6)g.fillRect(0,y,16,1);g.fillStyle='rgba(255,255,255,.1)';for(let x=2;x<16;x+=5)g.fillRect(x,0,1,3);speck(g,seed)});
 TEX.roofDark=roof('#2f3646',63);TEX.roofBlue=roof('#3d5167',67);TEX.roofRed=roof('#843c30',71);TEX.roofMoss=roof('#455a42',73);
 TEX.window=blockTex(g=>{g.fillStyle='#241c14';g.fillRect(0,0,16,16);g.fillStyle='#e8bd72';g.fillRect(2,3,12,10);g.fillStyle='#ffe0a0';g.fillRect(4,4,6,5);g.fillStyle='#241c14';g.fillRect(7,3,2,10)});
 TEX.gold=blockTex(g=>{tint(g,'#c9a44a',.28);speck(g,79)});
 const cloth=(base,seed)=>blockTex(g=>{tint(g,base,.3);speck(g,seed);g.fillStyle='rgba(255,255,255,.1)';g.fillRect(2,2,3,2)});
 TEX.cloth0=cloth('#9a3a32',83);TEX.cloth1=cloth('#3d5b82',89);TEX.cloth2=cloth('#3e7042',97);
 TEX.cloth3=cloth('#a8813e',101);TEX.cloth4=cloth('#6e4268',103);TEX.cloth5=cloth('#2f6e6a',107);
 TEX.skin=blockTex(g=>{tint(g,'#d6a078',.2);speck(g,109)});
 TEX.hair=blockTex(g=>{tint(g,'#3a2a20',.25);speck(g,113)});
 TEX.fire=blockTex(g=>{g.fillStyle='#ff7a24';g.fillRect(0,0,16,16);g.fillStyle='#ffd27a';g.fillRect(4,2,8,12);g.fillStyle='#fff0b8';g.fillRect(6,5,4,7)});
 TEX.plank=blockTex(g=>{tint(g,'#8a6238',.35);g.fillStyle='rgba(52,34,18,.5)';for(let y=4;y<16;y+=5)g.fillRect(0,y,16,1);speck(g,127)})}
function buildMaterials(){
 const M=(t,n)=>{const m=new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide});m.name=n;return m};
 return {grassTop:M(TEX.grassTop,'grassTop'),mossTop:M(TEX.mossTop,'mossTop'),gravel:M(TEX.gravel,'gravel'),dirtTop:M(TEX.dirt,'dirtTop'),
  sideDirt:M(TEX.grassSide,'sideDirt'),mossSide:M(TEX.mossSide,'mossSide'),stoneA:M(TEX.stoneA,'stoneA'),stoneB:M(TEX.stoneB,'stoneB'),
  water:(()=>{const m=new THREE.MeshLambertMaterial({color:0x2b7a8c,transparent:true,opacity:.84,side:THREE.DoubleSide});m.name='water';return m})(),
  wood:M(TEX.wood,'wood'),leafGreen:M(TEX.leafGreen,'leafGreen'),leafPink:M(TEX.leafPink,'leafPink'),leafOrange:M(TEX.leafOrange,'leafOrange'),leafDark:M(TEX.leafDark,'leafDark'),
  wallWhite:M(TEX.wallWhite,'wallWhite'),wallRed:M(TEX.wallRed,'wallRed'),wallBlue:M(TEX.wallBlue,'wallBlue'),wallOchre:M(TEX.wallOchre,'wallOchre'),
  roofDark:M(TEX.roofDark,'roofDark'),roofBlue:M(TEX.roofBlue,'roofBlue'),roofRed:M(TEX.roofRed,'roofRed'),roofMoss:M(TEX.roofMoss,'roofMoss'),
  window:M(TEX.window,'window'),gold:M(TEX.gold,'gold'),
  cloth0:M(TEX.cloth0,'cloth0'),cloth1:M(TEX.cloth1,'cloth1'),cloth2:M(TEX.cloth2,'cloth2'),
  cloth3:M(TEX.cloth3,'cloth3'),cloth4:M(TEX.cloth4,'cloth4'),cloth5:M(TEX.cloth5,'cloth5'),
  skin:M(TEX.skin,'skin'),hair:M(TEX.hair,'hair'),
  fire:(()=>{const m=new THREE.MeshBasicMaterial({map:TEX.fire,side:THREE.DoubleSide});m.name='fire';return m})(),
  plank:M(TEX.plank,'plank')}}

// ---------- the voxel volume ----------
const X0=-8,Z0=-10,X1=184,Z1=116,Y0=-46,Y1=48;
const SX=X1-X0+1,SY=Y1-Y0+1,SZ=Z1-Z0+1;
const VOX=new Int8Array(SX*SY*SZ);
const VI=(x,y,z)=>(y-Y0)*SX*SZ+(z-Z0)*SX+(x-X0);
const TOP_GRASS=1,TOP_MOSS=2,TOP_GRAVEL=3,TOP_DIRT=4,SIDE_DIRT=5,SIDE_STONEA=6,SIDE_STONEB=7,SIDE_MOSS=8,TOP_WATER=9,WOOD=10,LEAF_GREEN=11,LEAF_PINK=12,LEAF_ORANGE=13,LEAF_DARK=14,WALL_WHITE=15,WALL_RED=16,WALL_BLUE=17,WALL_OCHRE=18,ROOF_DARK=19,ROOF_BLUE=20,ROOF_RED=21,ROOF_MOSS=22,WINDOW=23,GOLD=24,CLOTH0=25,CLOTH1=26,CLOTH2=27,CLOTH3=28,CLOTH4=29,CLOTH5=30,SKIN=31,HAIR=32,FIRE=33,PLANK=34;
function setV(x,y,z,id){if(x<X0||x>X1||y<Y0||y>Y1||z<Z0||z>Z1)return;VOX[VI(x,y,z)]=id}
function islandKey(a,b){
 if(typeof LANDE!=='undefined'&&LANDE(a,b))return 5;
 if(typeof LANDC!=='undefined'&&LANDC(a,b))return 3;
 if(typeof LANDD!=='undefined'&&LANDD(a,b))return 4;
 if(typeof LANDB!=='undefined'&&LANDB(a,b))return 2;
 if(typeof LANDA!=='undefined'&&LANDA(a,b))return 1;
 return 0}
// lens-shaped underside, same shape language as the drawn cliffs, in voxel units
const DS={1:1,2:.84,3:.78,4:.8,5:.68};
function colDepth(a,b){
 const k=islandKey(a,b);if(!k)return 3;
 const u=a-b;
 const c={1:0,2:75,3:106,4:40,5:71}[k];
 const hw={1:46,2:34,3:19,4:20,5:48}[k];
 const tt=clamp(1-Math.abs(u-c)/hw,0,1);
 const d=Math.round((2+11*Math.pow(tt,1.35))*DS[k]+h2(a*7+3,b*11+7)*2.2);
 return Math.max(3,d)}
function buildVoxels(){
 VOX.fill(0);
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){
  if(!LAND(a,b))continue;
  const key=islandKey(a,b);
  const lake=WD(a,b)>0.3;
  const top=key===3?TOP_MOSS:(lake?TOP_GRAVEL:TOP_GRASS);
  const jitter=Math.round(vn(a*.17+3,b*.17)*3-1.5);
  const rim=!(LAND(a+1,b)&&LAND(a-1,b)&&LAND(a,b+1)&&LAND(a,b-1));
  const dTop=(lake?-4:jitter), dBot=-colDepth(a,b);
  if(lake)setV(a,-3,b,TOP_WATER);
  for(let y=dBot;y<=dTop;y++){
   const depthBelowTop=dTop-y;
   if(y===dTop)setV(a,y,b,lake?TOP_GRAVEL:(rim?TOP_DIRT:top));
   else if(depthBelowTop<=2)setV(a,y,b,key===3?SIDE_MOSS:SIDE_DIRT);
   else if(key===3)setV(a,y,b,(y%5<2)?SIDE_STONEA:SIDE_MOSS);
   else setV(a,y,b,(y%5<2)?SIDE_STONEA:SIDE_STONEB)}}}
// ---------- the voxel trees: rounded blob canopies on chunky trunks, species per island ----------
function colTop(a,b){if(!LAND(a,b))return null;if(WD(a,b)>0.3)return null;return Math.round(vn(a*.17+3,b*.17)*3-1.5)}
function puff(cx,cy,cz,r,id,seed){
 for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)for(let dz=-r;dz<=r;dz++){
  const d=Math.sqrt(dx*dx+dy*dy+dz*dz);
  if(d<r+(h2(cx+dx*3,cy*7+dz*5+seed)-.5)*1.25)setV(cx+dx,cy+dy,cz+dz,id)}}
function buildTree(ax,az,top,key,seed){
 const s1=h2(seed*91+3,7);
 if(key===3){ // a pine: chunky diamond tiers, the sakura-isle-observatory conifer
  const h=3+Math.floor(s1*3);
  for(let y=top+1;y<=top+h;y++)setV(ax,y,az,WOOD);
  const base=top+h;
  for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){if(Math.abs(dx)+Math.abs(dz)<=3){setV(ax+dx,base+1,az+dz,LEAF_DARK);setV(ax+dx,base+2,az+dz,LEAF_DARK)}}
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)setV(ax+dx,base+3,az+dz,LEAF_DARK);
  setV(ax,base+4,az,LEAF_DARK);setV(ax,base+5,az,LEAF_DARK);
  return}
 const h=3+Math.floor(s1*2);
 for(let y=top+1;y<=top+h;y++)setV(ax,y,az,WOOD);
 const R=s1>.62?2:1;
 let id=LEAF_GREEN;
 if(key===2)id=s1>.25?LEAF_PINK:LEAF_ORANGE;
 else if(key===5)id=s1>.7?LEAF_ORANGE:LEAF_GREEN;
 puff(ax,top+h+1,az,R+1,id,h2(ax+9,az+5)*997);
 puff(ax,top+h+2,az,R,id,h2(ax+4,az+8)*991)}
function plantTrees(){
 const quota={1:26,2:9,3:7,4:5,5:6}, planted={1:0,2:0,3:0,4:0,5:0}, spots=[];
 for(let a=X0;a<=X1;a+=2)for(let b=Z0;b<=Z1;b+=2){
  const key=islandKey(a,b);if(!key)continue;
  if(planted[key]>=quota[key])continue;
  if(h2(a*13+7,b*17+3)<.42)continue;
  const ax=a+Math.round((h2(a,b*3+11)-.5)*1.5),az=b+Math.round((h2(a*5+1,b+7)-.5)*1.5);
  const top=colTop(ax,az);if(top===null)continue;
  if(spots.some(p=>Math.abs(p[0]-ax)<4&&Math.abs(p[1]-az)<4))continue;
  if(!(LAND(ax+1,az)&&LAND(ax-1,az)&&LAND(ax,az+1)&&LAND(ax,az-1)))continue;
  buildTree(ax,az,top,key,h2(ax,az)*973);
  spots.push([ax,az]);
  planted[key]++}}
// ---------- the built world: cottages at the town's real coordinates, and the three-tier keep ----------
function box(a0,b0,a1,b1,y0,y1,id){
 for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++)for(let y=y0;y<=y1;y++)setV(a,y,b,id)}
function siteTop(a0,b0,a1,b1){
 let hi=-99,lo=99;
 for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++){const t=colTop(a,b);if(t===null)return null;hi=Math.max(hi,t);lo=Math.min(lo,t)}
 return {hi,lo}}
function hipRoof(cx,cz,y,r,id,kick){
 for(let k=0;k<3;k++){const rr=r-k;box(cx-rr,cz-rr,cx+rr,cz+rr,y+k,y+k,id)}
 if(kick)for(const sx of[-1,1])for(const sz of[-1,1]){setV(cx+sx*(r+1),y,cz+sz*r,id);setV(cx+sx*r,y,cz+sz*(r+1),id);setV(cx+sx*(r+1),y+1,cz+sz*(r+1),id)}}
function voxelCottage(ax,az,seed){
 const st=siteTop(ax-2,az-2,ax+2,az+2);if(!st)return;
 const wall=[WALL_WHITE,WALL_RED,WALL_BLUE,WALL_OCHRE][seed%4], roof=[ROOF_DARK,ROOF_BLUE,ROOF_RED,ROOF_MOSS][(seed>>1)%4];
 box(ax-2,az-2,ax+2,az+2,st.lo,st.hi,SIDE_STONEA);            // the footing follows the slope
 box(ax-2,az-2,ax+2,az+2,st.hi+1,st.hi+3,wall);               // walls
 for(const sx of[-2,2])for(const sz of[-2,2])box(ax+sx,az+sz,ax+sx,az+sz,st.hi+1,st.hi+3,WOOD);
 setV(ax,st.hi+2,az-2,WINDOW);setV(ax-1,st.hi+2,az-2,WINDOW);  // two lit windows on the near face
 setV(ax+1,st.hi+2,az-2,WINDOW);
 hipRoof(ax,az,st.hi+4,3,roof,false)}
function voxelKeep(){
 const ax=137,az=53,st=siteTop(ax-6,az-6,ax+6,az+6);if(!st)return;
 const y=st.hi+1;
 box(ax-6,az-5,ax+6,az+5,st.lo,y,SIDE_STONEA);                 // ishigaki: a wide hill of stone
 box(ax-5,az-4,ax+5,az+4,y+1,y+6,SIDE_STONEB);                 // the drum, stepped in
 box(ax-4,az-4,ax+4,az+4,y+7,y+11,WALL_WHITE);                 // tier one: white plaster
 for(const sx of[-4,4])for(const sz of[-4,4])box(ax+sx,az+sz,ax+sx,az+sz,y+7,y+11,WOOD);
 box(ax-1,az-4,ax+1,az-4,y+8,y+9,WINDOW);                      // the great arch's light
 box(ax-2,az-2,ax+2,az+2,y+12,y+12,ROOF_DARK);                 // the eave course
 hipRoof(ax,az,y+13,5,ROOF_DARK,true);                         // first dark tiled roof, corners kicked up
 box(ax-3,az-3,ax+3,az+3,y+17,y+21,WALL_WHITE);                // tier two
 for(const sx of[-3,3])for(const sz of[-3,3])box(ax+sx,az+sz,ax+sx,az+sz,y+17,y+21,WOOD);
 setV(ax-1,y+19,az-3,WINDOW);setV(ax+1,y+19,az-3,WINDOW);
 hipRoof(ax,az,y+22,4,ROOF_DARK,true);
 box(ax-2,az-2,ax+2,az+2,y+26,y+29,WALL_WHITE);                // tier three
 setV(ax,y+28,az-2,WINDOW);
 hipRoof(ax,az,y+30,3,ROOF_DARK,true);
 box(ax-1,az-1,ax+1,az+1,y+34,y+34,GOLD);                      // the gold finial nobody rings
 setV(ax,y+35,az,GOLD)}
function buildStructures(){
 voxelKeep();
 const town=[[22,4],[28,4],[23,11],[30,11],[23,15],[30,15],[18,26],[10,22],[17,30],[9,29],[12,35]];
 town.forEach(([a,b],i)=>voxelCottage(a,b,i))}
// ---------- the living world: people, lamps, boats, torii, the ward and the market square ----------
const CLOTH=[CLOTH0,CLOTH1,CLOTH2,CLOTH3,CLOTH4,CLOTH5];
function voxelPerson(a,b,seed){
 const top=colTop(a,b);if(top===null)return;
 const y=top+1,c=CLOTH[Math.floor(h2(seed,7)*6)];
 setV(a,y,b,HAIR);setV(a+1,y,b,HAIR);                       // feet
 box(a,b,a+1,b,y+1,y+2,c);                                  // torso
 setV(a,y+3,b,SKIN);setV(a,y+4,b,HAIR)}
function lampPost(a,b){
 const top=colTop(a,b);if(top===null)return;
 for(let y=top+1;y<=top+3;y++)setV(a,y,b,WOOD);
 setV(a,top+4,b,FIRE);setV(a-1,top+4,b,PLANK);setV(a+1,top+4,b,PLANK)}
function torii(a,b){
 const top=colTop(a,b);if(top===null)return;
 for(const sx of[-1,1])for(let y=top+1;y<=top+5;y++)setV(a+sx,y,b,WALL_RED);
 box(a-2,b,a+2,b,top+5,top+5,WALL_RED);
 box(a-3,b,a+3,b,top+6,top+6,WALL_RED)}
function boat(a,b){
 const top=colTop(a,b);if(top===null||WD(a,b)<0.2)return;
 const y=-2;
 box(a-2,b-1,a+2,b-1,y,y,PLANK);box(a-2,b+1,a+2,b+1,y,y,PLANK);
 box(a-2,b-1,a-2,b+1,y,y,WOOD);box(a+2,b-1,a+2,b+1,y,y,WOOD);
 setV(a,y,b,WOOD);setV(a+1,y,b,WOOD)}
function wardWalls(){
 const b0=47,b1=65,west=127,east=146;
 for(let b=b0;b<=b1;b++)for(const a of[west,east]){
  const t=colTop(a,b);if(t===null)continue;setV(a,t+1,b,WALL_WHITE);setV(a,t+2,b,ROOF_DARK)}
 for(let a=west;a<=east;a++){
  if(a>=134&&a<=139)continue;                               // the two gate arches stay open
  for(const b of[b0,b1]){const t=colTop(a,b);if(t===null)continue;setV(a,t+1,b,WALL_WHITE);setV(a,t+2,b,ROOF_DARK)}}
 for(const[a,b]of[[west,b0],[east,b0],[west,b1],[east,b1],[west,56],[east,56]]){
  const t=colTop(a,b);if(t===null)continue;
  box(a-1,b-1,a+1,b+1,t+1,t+3,SIDE_STONEB);                // round towers
  box(a-1,b-1,a+1,b+1,t+4,t+6,WALL_WHITE);
  hipRoof(a,b,t+7,2,ROOF_DARK,false)}
 // braziers on the bridge mouth, outside the north gate
 for(const a of[134,139]){const t=colTop(a,43);if(t===null)continue;setV(a,t+1,43,SIDE_STONEB);setV(a,t+2,43,FIRE)}}
function marketSquare(){
 const a=26,b=13,t=colTop(a,b);if(t===null)return;
 for(let x=a-2;x<=a+2;x++)for(let z=b-2;z<=b+2;z++){
  if(Math.abs(x-a)===2||Math.abs(z-b)===2){const q=colTop(x,z);if(q!==null)setV(x,q+1,z,SIDE_STONEA)}
  else{const q=colTop(x,z);if(q!==null)setV(x,q+1,z,TOP_WATER)}}
 for(const[x,z,id]of[[24,12,WALL_RED],[29,13,WALL_BLUE],[26,15,WALL_OCHRE]]){
  const q=colTop(x,z);if(q===null)continue;
  for(const sx of[-1,1])for(const sz of[-1,1])setV(x+sx,q+1,z+sz,WOOD);
  box(x-2,z-2,x+2,z+2,q+3,q+3,id)}}
function populate(){
 wardWalls();marketSquare();
 for(const[a,b]of[[25,8],[27,8],[25,11],[28,12],[25,16],[27,16],[24,6],[29,6]])lampPost(a,b);
 torii(104,35);torii(25,19);
 boat(25,25);boat(28,23);
 // the villagers from the game's own roster, plus anyone currently walking
 try{
  if(typeof CH!=='undefined')for(const ch of CH)if(ch&&ch.at)voxelPerson(Math.round(ch.at[0]),Math.round(ch.at[1]),h2(Math.round(ch.at[0]*7),Math.round(ch.at[1]*3))*1000);
  if(typeof CAST!=='undefined')for(const q of CAST)if(q&&q.a!==undefined)voxelPerson(Math.round(q.a),Math.round(q.b),h2(Math.round(q.a*11),Math.round(q.b*5))*1000);
  if(typeof PL!=='undefined'&&PL&&PL.P)voxelPerson(Math.round(PL.P.a),Math.round(PL.P.b),7);
 }catch(e){}}
// ---------- greedy meshing ----------
function faceId(id,axis,up){return id*4+(axis===1?(up?0:1):(axis===0?2:3))}
function faceMatKey(f){const id=f>>2,o=f&3;
 if(id===TOP_WATER)return 'water';
 if(id===WOOD)return 'wood';
 if(id===LEAF_GREEN)return 'leafGreen';
 if(id===LEAF_PINK)return 'leafPink';
 if(id===LEAF_ORANGE)return 'leafOrange';
 if(id===LEAF_DARK)return 'leafDark';
 if(id===WALL_WHITE)return 'wallWhite';
 if(id===WALL_RED)return 'wallRed';
 if(id===WALL_BLUE)return 'wallBlue';
 if(id===WALL_OCHRE)return 'wallOchre';
 if(id===ROOF_DARK)return 'roofDark';
 if(id===ROOF_BLUE)return 'roofBlue';
 if(id===ROOF_RED)return 'roofRed';
 if(id===ROOF_MOSS)return 'roofMoss';
 if(id===WINDOW)return 'window';
 if(id===GOLD)return 'gold';
 if(id===CLOTH0)return 'cloth0';
 if(id===CLOTH1)return 'cloth1';
 if(id===CLOTH2)return 'cloth2';
 if(id===CLOTH3)return 'cloth3';
 if(id===CLOTH4)return 'cloth4';
 if(id===CLOTH5)return 'cloth5';
 if(id===SKIN)return 'skin';
 if(id===HAIR)return 'hair';
 if(id===FIRE)return 'fire';
 if(id===PLANK)return 'plank';
 if(o===0){if(id===TOP_GRASS||id===TOP_DIRT)return 'grassTop';if(id===TOP_MOSS)return 'mossTop';return 'gravel'}
 if(o===1)return 'stoneB';
 if(id===SIDE_DIRT)return 'sideDirt';
 if(id===SIDE_MOSS)return 'mossSide';
 if(id===SIDE_STONEB)return 'stoneB';
 return 'stoneA'}
function greedyMesh(){
 const buckets={};
 const dirs=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
 for(const[dx,dy,dz]of dirs){
  const axis=dx!==0?0:(dy!==0?1:2);
  const R=(axis===0?SZ:(axis===1?SX:SX)),C=(axis===0?SY:(axis===1?SZ:SY));
  const sliceA=(axis===0?X0:(axis===1?Y0:Z0)),sliceB=(axis===0?X1:(axis===1?Y1:Z1));
  for(let slice=sliceA;slice<=sliceB;slice++){
   const mask=new Uint8Array(R*C);
   for(let u=0;u<R;u++)for(let v=0;v<C;v++){
    let x,y,z;
    if(axis===0){x=slice;y=Y0+v;z=Z0+u}else if(axis===1){x=X0+u;y=slice;z=Z0+v}else{x=X0+u;y=Y0+v;z=slice}
    const id=VOX[VI(x,y,z)];
    const nx=x+dx,ny=y+dy,nz=z+dz;
    if(nx<X0||nx>X1||ny<Y0||ny>Y1||nz<Z0||nz>Z1){if(id)mask[u*C+v]=faceId(id,axis,dy>0||dz>0||dx>0);continue}
    const nid=VOX[VI(nx,ny,nz)];
    if(id&&!nid)mask[u*C+v]=faceId(id,axis,dy>0||dz>0||dx>0)}
   for(let u=0;u<R;u++){let v=0;
    while(v<C){const f=mask[u*C+v];if(!f){v++;continue}
     let w=1;while(u+w<R&&mask[(u+w)*C+v]===f)w++;
     (buckets[f]=buckets[f]||[]).push({axis,dx,dy,dz,u,v,w,slice});
     for(let k=0;k<w;k++)mask[(u+k)*C+v]=0;
     v++}}}}
 const byMat={};
 for(const f of Object.keys(buckets)){const mk=faceMatKey(+f);(byMat[mk]=byMat[mk]||[]).push(...buckets[f])}
 const out=[];
 for(const mat of Object.keys(byMat)){
  const quads=byMat[mat],pos=[],nor=[],uv=[],idx=[];
  let vi=0;
  for(const q of quads){
   const c=faceCorners(q);
   pos.push(c[0][0],c[0][1],c[0][2],c[1][0],c[1][1],c[1][2],c[2][0],c[2][1],c[2][2],c[3][0],c[3][1],c[3][2]);
   for(let k=0;k<4;k++)nor.push(q.dx,q.dy,q.dz);
   uv.push(0,1,q.w,1,q.w,0,0,0);
   idx.push(vi,vi+1,vi+2,vi,vi+2,vi+3);vi+=4}
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);
  out.push({geo:g,mat})}
 return out}
function faceCorners(q){
 if(q.axis===0){const yy=Y0+q.v,zz=Z0+q.u,s=q.slice;return[[s,yy,zz],[s,yy,zz+q.w],[s,yy+1,zz+q.w],[s,yy+1,zz]]}
 if(q.axis===1){const xx=X0+q.u,zz=Z0+q.v,s=q.slice;return[[xx,s,zz],[xx+q.w,s,zz],[xx+q.w,s,zz+1],[xx,s,zz+1]]}
 const xx=X0+q.u,yy=Y0+q.v,s=q.slice;return[[xx,yy,s],[xx+q.w,yy,s],[xx+q.w,yy+1,s],[xx,yy+1,s]]}
// ---------- scene ----------
function buildScene(){
 TGT=new THREE.Vector3(104,0,56);
 buildTextures();
 const MATS=buildMaterials();
 scene=new THREE.Scene();
 scene.background=new THREE.Color(0xb9cdd2);
 camera=new THREE.PerspectiveCamera(24,innerWidth/innerHeight,1,600);
 scene.add(new THREE.HemisphereLight(0xcfe4e8,0x59493a,.82));
 const sun=new THREE.DirectionalLight(0xfff0d2,1.18);
 sun.position.set(140,150,110);
 sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);
 sun.shadow.camera.left=-100;sun.shadow.camera.right=100;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;
 sun.shadow.camera.near=10;sun.shadow.camera.far=400;sun.shadow.bias=-.0002;sun.shadow.normalBias=2.4;
 sun.target.position.set(86,0,46);
 scene.add(sun);scene.add(sun.target);
 scene.add(new THREE.AmbientLight(0x8fa4ac,.3));
 buildVoxels();
 plantTrees();
 buildStructures();
 populate();
 for(const{geo,mat}of greedyMesh()){
  const mesh=new THREE.Mesh(geo,MATS[mat]);mesh.receiveShadow=true;mesh.castShadow=mat!=='water';scene.add(mesh);if(mat==='water')waterMat=mesh.material}
 const sc=document.createElement('canvas');sc.width=sc.height=256;const sg=sc.getContext('2d');
 const grad=sg.createRadialGradient(128,128,16,128,128,128);
 grad.addColorStop(0,'rgba(255,255,255,.98)');grad.addColorStop(.5,'rgba(238,244,247,.88)');grad.addColorStop(1,'rgba(198,212,220,0)');
 sg.fillStyle=grad;sg.fillRect(0,0,256,256);
 for(let i=0;i<380;i++){const q=h2(i,77);sg.fillStyle='rgba(255,255,255,'+(.22+q*.5)+')';sg.beginPath();sg.arc(h2(i,13)*256,h2(i,29)*256,1+q*4,0,7);sg.fill()}
 seaTex=new THREE.CanvasTexture(sc);seaTex.colorSpace=THREE.SRGBColorSpace;
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(760,760),new THREE.MeshBasicMaterial({map:seaTex,transparent:true,depthWrite:false,opacity:.96}));
 sea.rotation.x=-Math.PI/2;sea.position.set(86,-40,46);sea.name='cloudsea';scene.add(sea);
 placeCamera()}
function placeCamera(){
 const ce=Math.cos(el),se=Math.sin(el);
 camera.position.set(TGT.x+rad*ce*Math.cos(az),TGT.y+rad*se,TGT.z+rad*ce*Math.sin(az));
 camera.lookAt(TGT)}
function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
function tick(){
 raf=requestAnimationFrame(tick);
 const sea=scene&&scene.getObjectByName('cloudsea');if(sea)sea.rotation.z+=.0006;
 if(waterMat)waterMat.opacity=.82+Math.sin(performance.now()*.0009)*.035;
 renderer.render(scene,camera)}
// ---------- overlay plumbing ----------
function show(){
 if(built){overlay.style.display='block';if(lbl)lbl.style.display='block';resize();if(!raf)tick();return}
 if(loading)return;
 loading=true;
 const cv=document.createElement('canvas');cv.id='voxel3d';
 cv.style.cssText='position:fixed;inset:0;z-index:9999;display:block;background:#b9cdd2';
 const b=document.createElement('div');
 b.style.cssText='position:fixed;left:12px;bottom:12px;z-index:10000;color:#f4ecd8;background:rgba(20,18,16,.72);border:1px solid rgba(244,236,216,.35);border-radius:6px;padding:7px 11px;font:12px/1.5 Georgia,serif;pointer-events:none;letter-spacing:.04em';
 b.innerHTML='building the voxel world&hellip;';
 document.body.appendChild(cv);document.body.appendChild(b);
 overlay=cv;lbl=b;
 const start=()=>{
  try{
   THREE=window.THREE;
   renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});
   renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
   renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
   renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;
   renderer.setSize(innerWidth,innerHeight);
   buildScene();
   bindPointer(cv);
   built=true;loading=false;
   b.innerHTML='VOXEL WORLD · drag to orbit · wheel to zoom · <b>V</b> returns';
   window.addEventListener('resize',resize);
   tick();
  }catch(err){
   console.error('voxel world failed:',err);
   b.textContent='voxel world failed to build — see console';
   loading=false;
   if(renderer){try{renderer.dispose()}catch(e){}renderer=null}
   if(overlay)overlay.remove();if(lbl)lbl.remove();overlay=null;lbl=null;built=false}};
 if(window.THREE){start();return}
 const sc=document.createElement('script');
 sc.src='js/three.min.js';
 sc.onload=start;
 sc.onerror=()=>{b.textContent='could not load js/three.min.js';loading=false;if(overlay)overlay.remove();if(lbl)lbl.remove();overlay=null;lbl=null};
 document.body.appendChild(sc)}
function hide(){cancelAnimationFrame(raf);raf=0;if(overlay)overlay.style.display='none';if(lbl)lbl.style.display='none'}
function bindPointer(cv){
 let drag=false,lx=0,ly=0;
 cv.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;cv.setPointerCapture(e.pointerId)});
 cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;az-=dx*.008;el=clamp(el+dy*.006,.34,1.05);placeCamera()});
 cv.addEventListener('pointerup',()=>{drag=false});
 cv.addEventListener('pointercancel',()=>{drag=false});
 cv.addEventListener('wheel',e=>{e.preventDefault();rad=clamp(rad*Math.exp(e.deltaY*.0011),42,190);placeCamera()},{passive:false})}
window.__voxDebug=function(){if(!scene)return null;const out=[];scene.traverse(o=>{if(o.isMesh){const m=o.material;out.push({n:o.name||'-',mat:m.name||'anon',transparent:!!m.transparent,opacity:+(m.opacity??1).toFixed(2),depthWrite:m.depthWrite,depthTest:m.depthTest,side:m.side,faces:o.geometry.index?o.geometry.index.count/3:(o.geometry.attributes.position.count/3),col:m.color?m.color.getHexString():null})}});return out};
window.__voxel=function(){if(overlay&&overlay.style.display!=='none')hide();else show()};
window.addEventListener('keydown',e=>{
 const t=e.target;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;
 if(e.code==='KeyV'&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();window.__voxel()}
 else if(e.code==='Escape'&&overlay&&overlay.style.display!=='none')hide()});
})();
