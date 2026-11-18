/* ================= THE VOXEL WORLD · v2 "golden hour" =================
   The islands as real voxel columns derived from the game's own land functions.
   Real WebGL (three.js r150, vendored, no bundler), lazy-loaded on the first 3D use.
   v2: linear/sRGB colour pipeline, correct greedy mesher with baked ambient occlusion and
   vertex tint, time-of-day (N key / HUD button), sky dome + lit cloud sea, animated water,
   emissive windows + per-pixel lamp pools, Tudor cottages, varied trees, swaying plants,
   petals / leaves / snow / fireflies / chimney smoke, koi, birds, orbit + pan + pinch camera.
   Reads from the 2D game (never writes): LAND, LANDA..LANDE, WD, vn, hh, CH, CAST, PL and, if present,
   RG, ZONE, pathD, POND, POND2, PX2.  The 2D game keeps running behind it; V toggles views.
   ------------------------------------------------------------------ */
(function(){
'use strict';
let TGT=null,THREE=null;
let built=false,loading=false,overlay=null,lbl=null,lblTxt=null,todBtn=null,vig=null,renderer=null,scene=null,camera=null,raf=0;
let az=Math.PI/4,el=.55,rad=174,tAz=az,tEl=el,tRad=rad,cx=104,cz=56,tcx=cx,tcz=cz,lastInput=0,T=0;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t,sm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const h2=(a,b)=>{let h=Math.imul(a|0,374761393)+Math.imul(b|0,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
function vnz(x,y){const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
 const a=h2(xi,yi),b=h2(xi+1,yi),c=h2(xi,yi+1),d=h2(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const G=n=>{try{return typeof window[n]!=='undefined'?window[n]:(0,eval)(n)}catch(e){return undefined}};

// ---------- procedural 16x16 block textures (noise in code, not painted files) ----------
let ANISO=4;
const rc=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w||1,h||1)};
const tint=(g,base,spread,seed)=>{g.fillStyle=base;g.fillRect(0,0,16,16);for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=(h2(x+11+(seed|0)*7,y*3+7)-.5)*spread;g.fillStyle=d>0?'rgba(255,255,255,'+d.toFixed(3)+')':'rgba(0,0,0,'+(-d).toFixed(3)+')';g.fillRect(x,y,1,1)}};
const speck=(g,w)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const q=h2(x+w*3,y*5+w*2);if(q>.8){g.fillStyle=q>.92?'rgba(255,255,255,.2)':'rgba(0,0,0,.22)';g.fillRect(x,y,1,1)}}};
const clumps=(g,cols,n,seed)=>{for(let i=0;i<n;i++){const x=h2(i,seed)*15|0,y=h2(i+9,seed*3)*15|0;rc(g,cols[i%cols.length],x,y,1+(h2(i,seed+5)*2|0),1)}};
const fringe=(g,top,earth,depth)=>{tint(g,earth,.4,3);speck(g,23);for(let x=0;x<16;x++){const d=depth+(h2(x,3)>.5?1:0)+(h2(x,8)>.82?2:0);rc(g,top,x,0,1,d);if(h2(x,5)>.5)rc(g,'rgba(255,255,255,.18)',x,0,1,1)}};
const leaf=(base,hi,lo,seed)=>g=>{tint(g,base,.4,seed);speck(g,seed);g.fillStyle=hi;for(let i=0;i<11;i++)g.fillRect(h2(i,seed+3)*15|0,h2(i+7,seed*2)*15|0,2,1);g.fillStyle=lo;for(let i=0;i<9;i++)g.fillRect(h2(i+13,seed)*15|0,h2(i+21,seed+9)*15|0,1,2)};
const timber=(base,seed)=>g=>{tint(g,base,.14,seed);speck(g,seed);const d='#4b3322';rc(g,d,0,0,2,16);rc(g,d,0,0,16,2);for(let i=3;i<14;i++)rc(g,'rgba(75,51,34,.85)',i,16-i,1,1);rc(g,'rgba(255,240,210,.16)',2,2,12,1)};
const roof=(base,seed)=>g=>{tint(g,base,.22,seed);for(let y=0;y<16;y+=4){rc(g,'rgba(255,255,255,.14)',0,y,16,1);rc(g,'rgba(8,10,18,.5)',0,y+3,16,1);for(let x=(y/4&1?3:7);x<16;x+=8)rc(g,'rgba(8,10,18,.32)',x,y,1,3)}};
const plain=(base,seed)=>g=>{tint(g,base,.22,seed);speck(g,seed);rc(g,'rgba(60,45,30,.22)',0,0,1,16);rc(g,'rgba(60,45,30,.22)',15,0,1,16)};
const cloth=(base,seed)=>g=>{tint(g,base,.3,seed);speck(g,seed);rc(g,'rgba(255,255,255,.1)',2,2,3,2)};
const TEXP={
 grassTop:g=>{tint(g,'#5f9d41',.34,1);clumps(g,['#86c95a','#3f7a30','#74b44c'],26,3)},
 grassDry:g=>{tint(g,'#a48a38',.38,2);clumps(g,['#d2a843','#8b5a26','#c0762c'],26,5)},
 snowTop:g=>{tint(g,'#eef3fb',.14,3);clumps(g,['#cfdcee','#ffffff','#bccce2'],20,7)},
 petalTop:g=>{tint(g,'#3f7458',.34,4);clumps(g,['#5c9a72','#2c5c45'],18,9);clumps(g,['#ffb7cf','#f58aab','#ffd9e5'],9,11)},
 mossTop:g=>{tint(g,'#5b7a58',.34,5);clumps(g,['#7da06e','#3f5a41','#8fb27c'],24,13)},
 gravel:g=>{tint(g,'#8f877a',.44,6);clumps(g,['#b2a998','#5f594f','#a39a89'],24,15)},
 dirtTop:g=>{tint(g,'#6e4d2f',.4,7);clumps(g,['#8a6540','#4d341f','#7b5836'],20,17)},
 sandRake:g=>{tint(g,'#dccfae',.14,8);for(let y=1;y<16;y+=4){rc(g,'rgba(120,100,70,.35)',0,y,16,1);rc(g,'rgba(255,250,230,.35)',0,y+1,16,1)}},
 sand:g=>{tint(g,'#cfc09c',.2,9);clumps(g,['#b9a982','#e5d9ba'],14,19)},
 cobble:g=>{g.fillStyle='#4a453d';g.fillRect(0,0,16,16);const st=['#8e887b','#9d9789','#7d776b','#a8a294'];for(let r=0;r<4;r++){const off=(r&1)?4:0;for(let c=-1;c<3;c++){const x0=Math.max(0,c*8+off),x1=Math.min(16,c*8+off+7);if(x1<=x0)continue;g.fillStyle=st[(h2(c+r*5,r)*4)|0];g.fillRect(x0,r*4,x1-x0,3);g.fillStyle='rgba(255,255,255,.14)';g.fillRect(x0,r*4,x1-x0,1)}}},
 paver:g=>{tint(g,'#a39d8b',.2,10);rc(g,'rgba(40,36,30,.45)',0,0,16,1);rc(g,'rgba(40,36,30,.45)',0,0,1,16);rc(g,'rgba(40,36,30,.3)',0,8,16,1);rc(g,'rgba(40,36,30,.3)',8,0,1,16)},
 farm:g=>{tint(g,'#5b3e27',.3,11);for(let y=0;y<16;y+=4){rc(g,'#3e2918',0,y,16,1);rc(g,'rgba(255,220,170,.16)',0,y+1,16,1)}},
 sideDirt:g=>fringe(g,'#4f8a3a','#6e4d2f',3),
 sideDry:g=>fringe(g,'#9a7a30','#6e4d2f',3),
 sideSnow:g=>fringe(g,'#f2f6fc','#6e4d2f',4),
 mossSide:g=>{tint(g,'#5f615a',.34,12);speck(g,29);for(let x=0;x<16;x++)rc(g,'#5b7a58',x,0,1,3+(h2(x,4)>.5?1:0))},
 stoneA:g=>{tint(g,'#78756c',.3,13);rc(g,'rgba(28,28,27,.4)',0,7,16,1);rc(g,'rgba(28,28,27,.3)',11,0,1,7);rc(g,'rgba(28,28,27,.3)',4,8,1,8)},
 stoneB:g=>{tint(g,'#54524d',.3,14);rc(g,'rgba(22,22,22,.42)',0,6,16,1);rc(g,'rgba(22,22,22,.3)',5,0,1,6);rc(g,'rgba(22,22,22,.3)',12,7,1,9)},
 stoneC:g=>{tint(g,'#85715b',.3,15);rc(g,'rgba(30,20,12,.4)',0,5,16,1);rc(g,'rgba(30,20,12,.3)',8,6,1,10);rc(g,'rgba(255,230,190,.1)',0,10,16,1)},
 brick:g=>{tint(g,'#9a4a38',.3,16);for(let y=3;y<16;y+=4)rc(g,'#c4b9a6',0,y,16,1);for(let r=0;r<4;r++)rc(g,'#c4b9a6',(r&1)?3:7,r*4,1,3);rc(g,'#c4b9a6',(0)?3:11,4,1,3)},
 wood:g=>{tint(g,'#6b4a2e',.34,17);for(const x of[3,9,13])rc(g,'rgba(40,24,12,.5)',x,0,1,16);for(const x of[6,11])rc(g,'rgba(255,225,180,.14)',x,0,1,16)},
 logTop:g=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const r=Math.hypot(x-7.5,y-7.5);g.fillStyle=r>6.6?'#5a3d24':(Math.floor(r*.95)%2?'#b48a52':'#9a7140');g.fillRect(x,y,1,1)}},
 leafGreen:leaf('#2f7a3c','#52a851','#1b4a2a',37),leafGreen2:leaf('#4d9a3e','#8bc653','#2c6a30',38),
 leafPink:leaf('#e486a6','#ffb6cc','#b25c80',41),leafPink2:leaf('#f6b4c8','#ffe3ec','#d98aa8',42),
 leafOrange:leaf('#d98a22','#f2b04a','#9a5a14',43),leafRed:leaf('#b8402a','#e0663c','#7a2a1c',44),
 leafYellow:leaf('#dcb62e','#f4de6a','#a8841c',45),leafDark:leaf('#1f4a30','#2f6a44','#123020',47),
 vine:leaf('#2f7a38','#5ab04a','#1b4a24',48),
 wallWhite:plain('#e6e0cc',53),wallRed:plain('#a03e32',57),wallBlue:plain('#4a6688',59),wallOchre:plain('#b08a46',61),
 wallTimber:timber('#e9e1c8',5),wallTimberB:timber('#d9b878',6),wallTimberC:timber('#c3d0bd',7),
 roofDark:roof('#363d4f',63),roofBlue:roof('#46607a',67),roofRed:roof('#9a4636',71),roofMoss:roof('#4e6a4a',73),roofMaroon:roof('#6e2d3c',75),
 window:g=>{rc(g,'#2a1e14',0,0,16,16);rc(g,'#f3b95e',2,3,12,10);rc(g,'#ffe3a0',3,4,10,4);rc(g,'#2a1e14',7,3,2,10);rc(g,'#2a1e14',2,8,12,1)},
 door:g=>{tint(g,'#5c3a22',.3,18);for(const x of[4,8,12])rc(g,'rgba(20,10,4,.5)',x,0,1,16);rc(g,'#2a1a10',0,0,16,2);rc(g,'#d9b24a',11,8,2,2)},
 shutter:g=>{tint(g,'#3f6f4c',.2,19);for(let y=2;y<16;y+=3)rc(g,'rgba(0,0,0,.35)',0,y,16,1)},
 gold:g=>{tint(g,'#d6ad4a',.28,20);speck(g,79)},
 torii:g=>{tint(g,'#c8341f',.16,21);rc(g,'rgba(255,200,170,.3)',2,0,2,16)},
 toriiDark:g=>{tint(g,'#27211f',.16,22)},
 lantern:g=>{rc(g,'#3a2412',0,0,16,16);rc(g,'#ffb347',2,2,12,12);rc(g,'#ffe0a0',4,4,8,8);rc(g,'#3a2412',0,7,16,1)},
 shoji:g=>{rc(g,'#efe6cd',0,0,16,16);for(const x of[0,5,10])rc(g,'#6b4a2c',x,0,1,16);for(const y of[0,5,10])rc(g,'#6b4a2c',0,y,16,1);speck(g,25)},
 fire:g=>{rc(g,'#ff7a24',0,0,16,16);rc(g,'#ffd27a',4,2,8,12);rc(g,'#fff0b8',6,5,4,7)},
 plank:g=>{tint(g,'#8a6238',.35,23);for(let y=4;y<16;y+=5)rc(g,'rgba(52,34,18,.5)',0,y,16,1);speck(g,127)},
 awnRed:g=>{tint(g,'#cf3a2e',.2,24);rc(g,'rgba(0,0,0,.2)',0,15,16,1)},
 awnWhite:g=>{tint(g,'#f1e8d6',.14,25);rc(g,'rgba(0,0,0,.15)',0,15,16,1)},
 cloth0:cloth('#9a3a32',83),cloth1:cloth('#3d5b82',89),cloth2:cloth('#3e7042',97),cloth3:cloth('#a8813e',101),cloth4:cloth('#6e4268',103),cloth5:cloth('#2f6e6a',107),
 skin:g=>{tint(g,'#d6a078',.2,26);speck(g,109)},hair:g=>{tint(g,'#3a2a20',.25,27);speck(g,113)},
 copper:g=>{tint(g,'#4d9b8a',.24,28);rc(g,'rgba(0,0,0,.25)',0,7,16,1);rc(g,'rgba(0,0,0,.2)',7,0,1,16)},
 dome:g=>{tint(g,'#f2eee2',.12,29);rc(g,'rgba(0,0,0,.14)',0,0,16,1);rc(g,'rgba(0,0,0,.1)',8,0,1,16)},
 aqua:g=>{tint(g,'#52bccb',.2,30);rc(g,'rgba(255,255,255,.3)',2,4,6,1);rc(g,'rgba(255,255,255,.25)',8,11,6,1)},
 cropG:g=>{tint(g,'#4f9a3a',.4,31);clumps(g,['#7fc455','#2f6a2a'],18,33)},
 cropY:g=>{tint(g,'#d8b648',.34,32);for(let x=1;x<16;x+=3)rc(g,'rgba(120,80,20,.4)',x,0,1,16)},
 cropO:g=>{tint(g,'#e0782a',.3,34);for(let x=2;x<16;x+=5)rc(g,'rgba(120,40,10,.35)',x,0,1,16);rc(g,'#4f7a2a',6,0,3,2)},
 sunflower:g=>{rc(g,'#4f8a2e',0,0,16,16);rc(g,'#f0c020',2,2,12,12);rc(g,'#6a3e18',5,5,6,6);speck(g,35)}
};
const EMP={window:g=>{rc(g,'#000',0,0,16,16);rc(g,'#ffb850',3,4,10,8);rc(g,'#000',7,4,2,8)},
 lantern:g=>{rc(g,'#000',0,0,16,16);rc(g,'#ffb347',2,2,12,12);rc(g,'#fff0c0',4,4,8,8)},
 shoji:g=>{rc(g,'#000',0,0,16,16);rc(g,'#6a4a22',1,1,14,14)}};
const TCACHE={};
function tex(key,em){const ck=key+(em?'~':'');if(TCACHE[ck])return TCACHE[ck];
 const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');(em?EMP[key]:TEXP[key])(g);
 const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;t.generateMipmaps=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=ANISO;
 if(THREE.sRGBEncoding!==undefined)t.encoding=THREE.sRGBEncoding;t.colorSpace=THREE.SRGBColorSpace;return TCACHE[ck]=t}

// ---------- block table: id -> top / side / bottom texture ----------
const BL={},BD=[null];
function def(name,t,s,b,tn,noAO){BL[name]=BD.length;BD.push({t,s:s||t,b:b||s||t,tn:tn||0,noAO:!!noAO})}
def('GRASS','grassTop','sideDirt','dirtTop',1);def('GRASS_DRY','grassDry','sideDry','dirtTop',1);def('SNOW','snowTop','sideSnow','dirtTop',4);
def('PETAL','petalTop','sideDirt','dirtTop',1);def('MOSS','mossTop','mossSide','stoneB',1);def('GRAVEL','gravel','gravel','gravel',0);
def('DIRT','dirtTop','dirtTop','dirtTop',3);def('SAND','sandRake','sand','sand',0);def('COBBLE','cobble','stoneA','stoneB',0);
def('PAVER','paver','stoneA','stoneB',0);def('FARM','farm','dirtTop','dirtTop',0);def('EARTH','dirtTop','dirtTop','dirtTop',3);
def('ROCK_A','stoneA',0,0,3);def('ROCK_B','stoneB',0,0,3);def('ROCK_C','stoneC',0,0,3);def('ROCK_MOSS','mossTop','mossSide','stoneB',3);
def('BRICK','brick',0,0,0);def('WOOD','logTop','wood','logTop',0);def('VINE','vine',0,0,2);
def('LEAF_G','leafGreen',0,0,2);def('LEAF_G2','leafGreen2',0,0,2);def('LEAF_PINK','leafPink',0,0,2);def('LEAF_PINK2','leafPink2',0,0,2);
def('LEAF_ORANGE','leafOrange',0,0,2);def('LEAF_RED','leafRed',0,0,2);def('LEAF_YELLOW','leafYellow',0,0,2);def('LEAF_DARK','leafDark',0,0,2);
def('WALL_WHITE','wallWhite');def('WALL_TIMBER','wallTimber');def('WALL_TIMBER_B','wallTimberB');def('WALL_TIMBER_C','wallTimberC');
def('WALL_RED','wallRed');def('WALL_BLUE','wallBlue');def('WALL_OCHRE','wallOchre');
def('ROOF_DARK','roofDark',0,0,5);def('ROOF_BLUE','roofBlue',0,0,5);def('ROOF_RED','roofRed',0,0,5);def('ROOF_MOSS','roofMoss',0,0,5);def('ROOF_MAROON','roofMaroon',0,0,5);
def('WINDOW','window');def('DOOR','door');def('SHUTTER','shutter');def('GOLD','gold');def('TORII','torii');def('TORII_DARK','toriiDark');
def('LANTERN','lantern',0,0,0,true);def('SHOJI','shoji');def('FIRE','fire',0,0,0,true);def('PLANK','plank');def('AWN_R','awnRed');def('AWN_W','awnWhite');
for(let i=0;i<6;i++)def('CLOTH'+i,'cloth'+i);
def('SKIN','skin');def('HAIR','hair');def('COPPER','copper');def('DOME','dome');def('AQUA','aqua',0,0,0,true);
def('CROP_G','cropG');def('CROP_Y','cropY');def('CROP_O','cropO');def('SUNFLOWER','sunflower');
const NB=BL;

// ---------- the voxel volume ----------
const X0=-8,Z0=-10,X1=184,Z1=116,Y0=-46,Y1=48;
const SX=X1-X0+1,SY=Y1-Y0+1,SZ=Z1-Z0+1,SXZ=SX*SZ;
const VOX=new Uint8Array(SX*SY*SZ);
const VI=(x,y,z)=>(y-Y0)*SXZ+(z-Z0)*SX+(x-X0);
const CI=(a,b)=>(b-Z0)*SX+(a-X0);
const HT=new Int16Array(SX*SZ),KEY=new Uint8Array(SX*SZ),BIO=new Uint8Array(SX*SZ),LAKE=new Uint8Array(SX*SZ),BED=new Int8Array(SX*SZ),RES=new Uint8Array(SX*SZ),OCC=new Uint8Array(SX*SZ),DST=new Float32Array(SX*SZ);
const inb=(a,b)=>a>=X0&&a<=X1&&b>=Z0&&b<=Z1;
const WSY=-1.12;                       // water surface plane
const LIGHTS=[],GLOWS=[],SMOKES=[],SAKURA=[],MAPLES=[],BOATS=[],PLANTS=[],SNOWC=[];
function setV(x,y,z,id){if(x<X0||x>X1||y<Y0||y>Y1||z<Z0||z>Z1)return;VOX[VI(x,y,z)]=id}
function putIfEmpty(x,y,z,id){if(x<X0||x>X1||y<Y0||y>Y1||z<Z0||z>Z1)return;const i=VI(x,y,z);if(!VOX[i])VOX[i]=id}
function colTop(a,b){if(!inb(a,b))return null;const h=HT[CI(a,b)];return h===-999?null:h}
function islandKey(a,b){
 if(typeof LANDE!=='undefined'&&LANDE(a,b))return 5;
 if(typeof LANDC!=='undefined'&&LANDC(a,b))return 3;
 if(typeof LANDD!=='undefined'&&LANDD(a,b))return 4;
 if(typeof LANDB!=='undefined'&&LANDB(a,b))return 2;
 if(typeof LANDA!=='undefined'&&LANDA(a,b))return 1;
 return 0}
const DS={1:1,2:.84,3:.78,4:.8,5:.68},CEN={1:0,2:75,3:106,4:40,5:71},HW={1:46,2:34,3:19,4:20,5:48};
const TOPB=[0,BL.GRASS,BL.GRASS_DRY,BL.SNOW,BL.PETAL,BL.MOSS];
let BIOME_REPORT='';
function buildVoxels(){
 VOX.fill(0);HT.fill(-999);KEY.fill(0);BIO.fill(0);LAKE.fill(0);BED.fill(0);RES.fill(0);OCC.fill(0);
 const RGf=typeof RG==='function'?RG:null,ZONEf=typeof ZONE==='function'?ZONE:null,PATHf=typeof pathD==='function'?pathD:null;
 const rgc={};let land1=0,odd=0;
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){const ci=CI(a,b);
  if(!LAND(a,b)){DST[ci]=0;continue}
  DST[ci]=1e3;const key=islandKey(a,b);KEY[ci]=key;
  if(RGf&&key===1){const r=RGf(a,b);rgc[r]=(rgc[r]||0)+1;land1++;if(r!=='g'&&r!=='s')odd++}}
 const useDry=!!RGf&&land1>0&&odd/land1<.5;
 BIOME_REPORT=RGf?('RG values on the village isle: '+JSON.stringify(rgc)+(useDry?' (non-g/non-s treated as autumn)':' (autumn disabled)')):'RG not available';
 // chamfer distance to the island rim: drives the bowl-shaped underside
 for(let b=Z0;b<=Z1;b++)for(let a=X0;a<=X1;a++){const ci=CI(a,b);if(!DST[ci])continue;let d=DST[ci];
  if(a>X0)d=Math.min(d,DST[ci-1]+1);if(b>Z0){d=Math.min(d,DST[ci-SX]+1);if(a>X0)d=Math.min(d,DST[ci-SX-1]+1.41);if(a<X1)d=Math.min(d,DST[ci-SX+1]+1.41)}DST[ci]=d}
 for(let b=Z1;b>=Z0;b--)for(let a=X1;a>=X0;a--){const ci=CI(a,b);if(!DST[ci])continue;let d=DST[ci];
  if(a<X1)d=Math.min(d,DST[ci+1]+1);if(b<Z1){d=Math.min(d,DST[ci+SX]+1);if(a<X1)d=Math.min(d,DST[ci+SX+1]+1.41);if(a>X0)d=Math.min(d,DST[ci+SX-1]+1.41)}DST[ci]=d}
 // pass: heights, lakes, biomes
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){const ci=CI(a,b);const key=KEY[ci];if(!key)continue;
  const w=WD(a,b);
  if(w>.3){LAKE[ci]=1;BED[ci]=1+clamp(Math.floor((w-.3)*2.5),0,3);continue}
  let h=Math.round(vnz(a*.045+key*7,b*.045)*3.2+vnz(a*.16,b*.16+3)*1.3-2.2);
  if(w>-.2)h=Math.min(h,-2);else if(w>-.7)h=Math.min(h,-1);
  HT[ci]=h;
  let bio=key===2?4:key===3?5:1;
  if(RGf&&(key===1||key===4||key===5)){const r=RGf(a,b);if(r==='s')bio=3;else if(useDry&&r!=='g'&&key===1)bio=2}
  BIO[ci]=bio}
 // pass: fill columns
 const gx=88.2,gz=29.2,tx=91.7,tz=32.5;
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){const ci=CI(a,b);const key=KEY[ci];if(!key)continue;
  const lake=LAKE[ci]===1,h=lake?(-2-BED[ci]):HT[ci],bio=BIO[ci];
  const dist=DST[ci],u=a-b,tt=clamp(1-Math.abs(u-CEN[key])/HW[key],0,1);
  const Dmax=(12+26*Math.pow(tt,1.1))*DS[key];
  let depth=3+Dmax*sm(0,20,dist)+(vnz(a*.35,b*.35)-.5)*6*sm(0,12,dist)+h2(a*7+3,b*11+7)*1.6;
  let dBot=Math.max(Y0+1,h-Math.round(depth));if(lake)dBot=Math.min(dBot,h-2);
  let top=lake?BL.GRAVEL:TOPB[bio];
  if(!lake){
   const rim=!(LAND(a+1,b)&&LAND(a-1,b)&&LAND(a,b+1)&&LAND(a,b-1));
   if(rim&&bio!==3&&h2(a*5,b*9)>.45)top=BL.DIRT;
   if(key===2&&Math.hypot(a+.5-gx,b+.5-gz)<2.7+(vnz(a*2,b*2)-.5)*.3)top=BL.SAND;
   else if(key===2&&Math.hypot(a+.5-tx,b+.5-tz)<2.45)top=BL.GRAVEL;
   if(key===3&&Math.hypot(a+.5-133.4,b+.5-26.2)<4.7+(vnz(a*2,b*2)-.5)*.4)top=BL.PAVER;
   if(PATHf&&PATHf(a+.5,b+.5)<.66&&bio!==3)top=BL.COBBLE;
   if(ZONEf&&bio!==3&&ZONEf(a+.5,b+.5)==='field')top=BL.FARM;
   if(bio===3&&PATHf&&PATHf(a+.5,b+.5)<.5)top=BL.COBBLE}
  for(let y=dBot;y<=h;y++){const dd=h-y;let id;
   if(dd===0)id=top;else if(dd<=2)id=BL.EARTH;
   else{const band=Math.floor((y+(vnz(a*.03,b*.03)*6|0))/4),m=((band%3)+3)%3;id=m===0?BL.ROCK_A:m===1?BL.ROCK_B:BL.ROCK_C;
    if(dd<11&&vnz(a*.2+y*.3,b*.2)>.66)id=BL.ROCK_MOSS;else if(h2(a*3+y,b*7)>.94)id=BL.ROCK_B}
   VOX[VI(a,y,b)]=id}}
 // hanging vines on the outer rim
 for(let a=X0+1;a<X1;a++)for(let b=Z0+1;b<Z1;b++){const ci=CI(a,b);if(!KEY[ci]||LAKE[ci]||BIO[ci]===3||BIO[ci]===5)continue;
  if(h2(a*13+1,b*7+5)<.9)continue;
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){if(LAND(a+dx,b+dz))continue;
   const L=3+Math.floor(h2(a,b*3)*9),y0=HT[ci];for(let k=0;k<L;k++)putIfEmpty(a+dx,y0-k,b+dz,BL.VINE);break}}}
// ---------- structures ----------
function reserve(a0,b0,a1,b1){for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++)if(inb(a,b))RES[CI(a,b)]=1}
function box(a0,b0,a1,b1,y0,y1,id){for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++)for(let y=y0;y<=y1;y++)setV(a,y,b,id)}
function siteTop(a0,b0,a1,b1){let hi=-99,lo=99;for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++){const t=colTop(a,b);if(t===null)return null;hi=Math.max(hi,t);lo=Math.min(lo,t)}return{hi,lo}}
function lightAt(x,y,z,r,gs,kind){LIGHTS.push([x,y,z,r]);if(gs)GLOWS.push([x,y,z,gs,kind||0])}
function hipRoof(cx,cz,y,r,id,kick){
 for(let k=0;k<3;k++){const rr=r-k;box(cx-rr,cz-rr,cx+rr,cz+rr,y+k,y+k,id)}
 if(kick)for(const sx of[-1,1])for(const sz of[-1,1]){setV(cx+sx*(r+1),y,cz+sz*r,id);setV(cx+sx*r,y,cz+sz*(r+1),id);setV(cx+sx*(r+1),y+1,cz+sz*(r+1),id)}}
function cottage(ax,az,seed){
 const st=siteTop(ax-2,az-2,ax+2,az+2);if(!st)return;const hi=st.hi;
 const alongX=(seed&1)===0,S=(i,j)=>alongX?[ax+i,az+j]:[ax+j,az+i];
 const P=(i,j,y,id)=>{const q=S(i,j);setV(q[0],y,q[1],id)};
 const wall=[BL.WALL_TIMBER,BL.WALL_TIMBER,BL.WALL_TIMBER_B,BL.WALL_TIMBER_C][seed%4];
 const rf=[BL.ROOF_RED,BL.ROOF_BLUE,BL.ROOF_DARK,BL.ROOF_MOSS,BL.ROOF_MAROON][(seed*3+1)%5];
 reserve(ax-4,az-4,ax+4,az+4);
 box(ax-2,az-2,ax+2,az+2,st.lo,hi,BL.ROCK_A);
 for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){const per=Math.abs(i)===2||Math.abs(j)===2;P(i,j,hi+1,per?BL.ROCK_A:wall);P(i,j,hi+2,wall);P(i,j,hi+3,wall)}
 for(const i of[-2,2])for(const j of[-2,2])for(let y=hi+2;y<=hi+3;y++)P(i,j,y,BL.WOOD);
 P(0,2,hi+1,BL.DOOR);P(0,2,hi+2,BL.DOOR);P(0,3,hi+1,BL.ROCK_A);
 for(const i of[-1,1]){P(i,2,hi+2,BL.WINDOW);P(i,-2,hi+2,BL.WINDOW)}
 for(const i of[-2,2])P(i,0,hi+2,BL.WINDOW);
 for(let L=0;L<4;L++)for(let j=-(3-L);j<=3-L;j++)for(let i=-3;i<=3;i++){const ai=Math.abs(i);
  if(ai===3){if(Math.abs(j)===3-L)P(i,j,hi+4+L,rf);continue}
  if(ai===2&&Math.abs(j)<3-L){P(i,j,hi+4+L,wall);continue}
  P(i,j,hi+4+L,rf)}
 for(const i of[-2,2])P(i,0,hi+4,BL.WINDOW);
 for(let y=hi+4;y<=hi+8;y++)P(-1,1,y,BL.BRICK);P(-1,1,hi+9,BL.ROCK_B);
 P(1,3,hi+3,BL.LANTERN);
 {const c=S(-1,1);SMOKES.push([c[0]+.5,hi+9.8,c[1]+.5])}
 {const q=S(0,3.2);lightAt(q[0]+.5,hi+2.6,q[1]+.5,8.5,0)}
 {const q=S(1,3);GLOWS.push([q[0]+.5,hi+3.5,q[1]+.5,2.4,0])}
 for(const[i,j,dj]of[[-1,2,.9],[1,2,.9],[-1,-2,-.9],[1,-2,-.9]]){const q=S(i,j+dj);GLOWS.push([q[0]+.5,hi+2.5,q[1]+.5,2.2,1])}
}
function keep(){
 const ax=137,az=53,st=siteTop(ax-6,az-6,ax+6,az+6);if(!st)return;const y=st.hi+1;reserve(ax-8,az-8,ax+8,az+8);
 box(ax-6,az-5,ax+6,az+5,st.lo,y,BL.ROCK_A);box(ax-5,az-4,ax+5,az+4,y+1,y+6,BL.ROCK_B);
 box(ax-4,az-4,ax+4,az+4,y+7,y+11,BL.WALL_WHITE);
 for(const sx of[-4,4])for(const sz of[-4,4])box(ax+sx,az+sz,ax+sx,az+sz,y+7,y+11,BL.WOOD);
 box(ax-1,az-4,ax+1,az-4,y+8,y+9,BL.WINDOW);box(ax-1,az+4,ax+1,az+4,y+8,y+9,BL.WINDOW);box(ax+4,az-1,ax+4,az+1,y+8,y+9,BL.WINDOW);box(ax-4,az-1,ax-4,az+1,y+8,y+9,BL.WINDOW);
 box(ax-2,az-2,ax+2,az+2,y+12,y+12,BL.ROOF_DARK);hipRoof(ax,az,y+13,5,BL.ROOF_DARK,true);
 box(ax-3,az-3,ax+3,az+3,y+17,y+21,BL.WALL_WHITE);for(const sx of[-3,3])for(const sz of[-3,3])box(ax+sx,az+sz,ax+sx,az+sz,y+17,y+21,BL.WOOD);
 for(const o of[-1,1]){setV(ax+o,y+19,az-3,BL.WINDOW);setV(ax+o,y+19,az+3,BL.WINDOW);setV(ax+3,y+19,az+o,BL.WINDOW);setV(ax-3,y+19,az+o,BL.WINDOW)}
 hipRoof(ax,az,y+22,4,BL.ROOF_DARK,true);
 box(ax-2,az-2,ax+2,az+2,y+26,y+29,BL.WALL_WHITE);setV(ax,y+28,az-2,BL.WINDOW);setV(ax,y+28,az+2,BL.WINDOW);setV(ax+2,y+28,az,BL.WINDOW);setV(ax-2,y+28,az,BL.WINDOW);
 hipRoof(ax,az,y+30,3,BL.ROOF_DARK,true);
 box(ax-1,az-1,ax+1,az+1,y+34,y+34,BL.GOLD);setV(ax,y+35,az,BL.GOLD);setV(ax,y+36,az,BL.GOLD);
 for(const sx of[-1,1]){setV(ax+sx*4,y+31,az,BL.GOLD);setV(ax,y+31,az+sx*4,BL.GOLD)}
 for(const[dx,dy,dz]of[[0,9,-5],[0,9,5],[5,9,0],[-5,9,0],[0,19,-4],[4,19,0]])lightAt(ax+dx+.5,y+dy+.5,az+dz+.5,9,2.8,1);
 lightAt(ax+.5,y+28,az+.5,14,0)}
function wardWalls(){
 const b0=47,b1=65,west=127,east=146;reserve(west-1,b0-1,east+1,b1+1);
 for(let b=b0;b<=b1;b++)for(const a of[west,east]){const t=colTop(a,b);if(t===null)continue;setV(a,t+1,b,BL.WALL_WHITE);setV(a,t+2,b,BL.ROOF_DARK)}
 for(let a=west;a<=east;a++){if(a>=134&&a<=139)continue;for(const b of[b0,b1]){const t=colTop(a,b);if(t===null)continue;setV(a,t+1,b,BL.WALL_WHITE);setV(a,t+2,b,BL.ROOF_DARK)}}
 for(const[a,b]of[[west,b0],[east,b0],[west,b1],[east,b1],[west,56],[east,56]]){const t=colTop(a,b);if(t===null)continue;
  box(a-1,b-1,a+1,b+1,t+1,t+3,BL.ROCK_B);box(a-1,b-1,a+1,b+1,t+4,t+6,BL.WALL_WHITE);setV(a,t+5,b-1,BL.WINDOW);setV(a,t+5,b+1,BL.WINDOW);hipRoof(a,b,t+7,2,BL.ROOF_DARK,false);lightAt(a+.5,t+5.5,b+.5,6,1.8,1)}
 for(const a of[134,139]){const t=colTop(a,43);if(t===null)continue;setV(a,t+1,43,BL.ROCK_B);setV(a,t+2,43,BL.FIRE);lightAt(a+.5,t+3,43.5,11,3.4,2)}}
function marketSquare(){
 const a=26,b=13,t=colTop(a,b);if(t===null)return;reserve(a-4,b-4,a+4,b+5);
 for(let x=a-2;x<=a+2;x++)for(let z=b-2;z<=b+2;z++){const q=colTop(x,z);if(q===null)continue;
  if(Math.abs(x-a)===2||Math.abs(z-b)===2){setV(x,q+1,z,BL.ROCK_A)}else{setV(x,q,z,BL.ROCK_B);setV(x,q+1,z,BL.AQUA)}}
 setV(a,t+2,b,BL.ROCK_A);setV(a,t+3,b,BL.ROCK_A);setV(a,t+4,b,BL.AQUA);
 for(const[x,z,id,id2]of[[22,10,BL.AWN_R,BL.AWN_W],[30,13,BL.AWN_W,BL.AWN_R],[26,17,BL.AWN_R,BL.AWN_W]]){
  const q=colTop(x,z);if(q===null)continue;
  for(const sx of[-1,1])for(const sz of[-1,1]){setV(x+sx,q+1,z+sz,BL.WOOD);setV(x+sx,q+2,z+sz,BL.WOOD)}
  box(x-1,z,x+1,z,q+1,q+1,BL.PLANK);
  for(let k=-2;k<=2;k++)for(let zz=-1;zz<=1;zz++)setV(x+k,q+3,z+zz,(k&1)?id2:id);
  setV(x+1,q+2,z+1,BL.CROP_O);setV(x-1,q+2,z,BL.CROP_G);setV(x,q+2,z,BL.CROP_Y);
  setV(x,q+2,z+2,BL.LANTERN);lightAt(x+.5,q+2.5,z+2.5,8,2.4,0)}}
function toriiGate(a,b,alongX){
 const t=colTop(a,b);if(t===null)return;
 const P=(i,y,id)=>alongX?setV(a+i,y,b,id):setV(a,y,b+i,id);
 for(const s of[-2,2]){for(let y=t+1;y<=t+6;y++)P(s,y,y<=t+2?BL.TORII_DARK:BL.TORII);}
 for(let i=-2;i<=2;i++){P(i,t+5,BL.TORII)}
 for(let i=-4;i<=4;i++){P(i,t+7,BL.TORII_DARK);if(Math.abs(i)>=3)P(i,t+8,BL.TORII_DARK);P(i,t+7,BL.TORII_DARK)}
 for(let i=-3;i<=3;i++)P(i,t+8,BL.TORII);
 reserve(a-4,b-4,a+4,b+4)}
function stoneLantern(a,b){
 const t=colTop(a,b);if(t===null)return;
 setV(a,t+1,b,BL.ROCK_A);setV(a,t+2,b,BL.ROCK_B);setV(a,t+3,b,BL.ROCK_B);setV(a,t+4,b,BL.LANTERN);
 box(a-1,b-1,a+1,b+1,t+5,t+5,BL.ROCK_A);setV(a,t+6,b,BL.ROCK_B);lightAt(a+.5,t+4.5,b+.5,7.5,2.4,0);RES[CI(a,b)]=1}
function lampPost(a,b){
 const t=colTop(a,b);if(t===null)return;
 for(let y=t+1;y<=t+3;y++)setV(a,y,b,BL.WOOD);setV(a,t+4,b,BL.LANTERN);setV(a,t+5,b,BL.ROCK_B);setV(a-1,t+4,b,BL.PLANK);setV(a+1,t+4,b,BL.PLANK);
 lightAt(a+.5,t+4.5,b+.5,10,3,0);RES[CI(a,b)]=1}
function teahouse(){
 const ax=92,az=33,st=siteTop(ax-2,az-2,ax+2,az+2);if(!st)return;const y=st.hi+1;reserve(ax-4,az-4,ax+4,az+4);
 box(ax-2,az-2,ax+2,az+2,st.lo,st.hi,BL.ROCK_A);box(ax-2,az-2,ax+2,az+2,y,y,BL.PLANK);
 for(const sx of[-2,2])for(const sz of[-2,2])for(let k=1;k<=4;k++)setV(ax+sx,y+k,az+sz,BL.WOOD);
 for(let k=1;k<=3;k++){for(let i=-1;i<=1;i++){setV(ax+i,y+k,az-2,BL.SHOJI);setV(ax-2,y+k,az+i,BL.SHOJI);setV(ax+2,y+k,az+i,BL.SHOJI)}}
 hipRoof(ax,az,y+5,3,BL.ROOF_DARK,true);setV(ax,y+8,az,BL.GOLD);
 setV(ax,y+4,az,BL.LANTERN);lightAt(ax+.5,y+3.5,az+.5,9,2.8,0);lightAt(ax+.5,y+2.5,az+3.5,8,0)}
function dome(){
 const ax=133,az=26,t=colTop(ax,az);if(t===null)return;reserve(ax-5,az-5,ax+5,az+5);
 for(let dx=-5;dx<=5;dx++)for(let dz=-5;dz<=5;dz++){const d=Math.hypot(dx,dz);if(d<=4.4)putIfEmpty(ax+dx,t+1,az+dz,BL.ROCK_A)}
 for(let dx=-4;dx<=4;dx++)for(let dy=0;dy<=4;dy++)for(let dz=-4;dz<=4;dz++){const d=Math.sqrt(dx*dx+dy*dy+dz*dz);if(d<=3.9){const y=t+2+dy;setV(ax+dx,y,az+dz,d>3.2&&dy>0&&dy<4&&(Math.abs(dx)<1||Math.abs(dz)<1)&&0?BL.COPPER:BL.DOME)}}
 for(let dy=0;dy<=3;dy++){setV(ax+3,t+3+dy,az,BL.WINDOW);setV(ax+3,t+3+dy,az+1,BL.WINDOW);setV(ax+3,t+3+dy,az-1,BL.WINDOW)}
 for(let dx=-3;dx<=3;dx++)for(let dz=-3;dz<=3;dz++)if(Math.abs(Math.hypot(dx,dz)-3.5)<.6)putIfEmpty(ax+dx,t+2,az+dz,BL.COPPER);
 setV(ax,t+6,az,BL.COPPER);setV(ax,t+7,az,BL.GOLD);lightAt(ax+4.2,t+5,az+.5,9,2.6,1)}
function rakeGarden(){
 const a=88,b=29,t=colTop(a,b);if(t===null)return;reserve(a-4,b-4,a+4,b+4);
 for(const[dx,dz,h]of[[-1,0,2],[1,1,1],[0,-1,1],[1,-1,1]]){const q=colTop(a+dx,b+dz);if(q===null)continue;for(let k=1;k<=h;k++)setV(a+dx,q+k,b+dz,(dx+dz)&1?BL.ROCK_B:BL.ROCK_A)}}
const CLOTH=['CLOTH0','CLOTH1','CLOTH2','CLOTH3','CLOTH4','CLOTH5'];
function voxelPerson(a,b,seed){const top=colTop(a,b);if(top===null)return;const y=top+1,c=BL[CLOTH[Math.floor(h2(seed,7)*6)]];
 setV(a,y,b,BL.HAIR);setV(a+1,y,b,BL.HAIR);box(a,b,a+1,b,y+1,y+2,c);setV(a,y+3,b,BL.SKIN);setV(a,y+4,b,BL.HAIR)}
function boatSpot(a,b){if(!inb(a,b)||!LAKE[CI(a,b)])return;BOATS.push([a+.5,b+.5,h2(a,b)*6.28])}
function fields(){
 const ZONEf=typeof ZONE==='function'?ZONE:null;if(!ZONEf)return;
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){const t=colTop(a,b);if(t===null||VOX[VI(a,t,b)]!==BL.FARM||RES[CI(a,b)])continue;
  const row=Math.floor(a/2),q=h2(Math.floor(b/6),row>>1);
  if(a&1)continue;
  if(h2(a*3,b*7)>.93)for(let k=1;k<=3;k++)setV(a,t+k,b,k===3?BL.SUNFLOWER:BL.WOOD);
  else setV(a,t+1,b,q<.4?BL.CROP_G:q<.7?BL.CROP_Y:BL.CROP_O)}}
function buildStructures(){
 keep();wardWalls();marketSquare();teahouse();dome();rakeGarden();
 const town=[[22,4],[28,4],[23,11],[30,11],[23,15],[30,15],[18,26],[10,22],[17,30],[9,29],[12,35]];
 town.forEach(([a,b],i)=>cottage(a,b,i));
 for(const[a,b]of[[25,8],[27,8],[25,11],[28,12],[25,16],[27,16],[24,6],[29,6],[20,20],[14,25],[20,32]])lampPost(a,b);
 toriiGate(104,35,false);toriiGate(25,19,true);
 for(const[a,b]of[[101,33],[101,37],[107,33],[107,37],[95,28],[85,33],[110,30],[116,37],[88,34],[96,36]])stoneLantern(a,b);
 boatSpot(25,25);boatSpot(28,23);boatSpot(113,33)}
// ---------- trees: rounded canopies on chunky trunks, species by biome ----------
function blob(cx,cy,cz,rx,ry,rz,pick,seed){
 for(let dx=-Math.ceil(rx);dx<=Math.ceil(rx);dx++)for(let dy=-Math.ceil(ry);dy<=Math.ceil(ry);dy++)for(let dz=-Math.ceil(rz);dz<=Math.ceil(rz);dz++){
  const d=Math.sqrt((dx/rx)*(dx/rx)+(dy/ry)*(dy/ry)+(dz/rz)*(dz/rz));
  if(d<1+(h2(cx+dx*3+seed,cy*7+dz*5)-.5)*.42)putIfEmpty(cx+dx,cy+dy,cz+dz,pick(dy/ry,h2(cx+dx*5+seed,dz*3+dy*7)))}}
function trunk(ax,az,y0,y1){for(let y=y0;y<=y1;y++)setV(ax,y,az,BL.WOOD)}
function oak(ax,az,top,s,A,B,list){
 const h=3+(s*3|0),R=2.5+s*1.4,cy=top+h+2;trunk(ax,az,top+1,top+h+1);
 const pk=(t,r)=>r<.18+(t+1)*.3?B:A;
 blob(ax,cy,az,R,R*.78,R,pk,1);blob(ax+2,cy-1,az+1,R*.7,R*.6,R*.7,pk,2);blob(ax-2,cy-1,az-1,R*.7,R*.6,R*.7,pk,3);blob(ax,cy+2,az,R*.62,R*.6,R*.62,pk,4);
 if(list)list.push([ax+.5,cy+1,az+.5])}
function sakura(ax,az,top,s){
 const h=4+(s*2|0),lx=Math.round((s-.5)*2),lz=Math.round((h2(ax,az)-.5)*2);
 trunk(ax,az,top+1,top+2);for(let y=top+3;y<=top+h;y++)setV(ax+(y>top+3?lx:0),y,az+(y>top+3?lz:0),BL.WOOD);
 const cx=ax+lx,cz=az+lz,cy=top+h+2;
 const pk=(t,r)=>r<.3+(t+1)*.28?BL.LEAF_PINK2:BL.LEAF_PINK;
 blob(cx,cy,cz,4,2.9,4,pk,1);for(const[dx,dz]of[[3,1],[-3,-1],[1,-3],[-1,3]])blob(cx+dx,cy-1,cz+dz,2.6,2,2.6,pk,5+dx);blob(cx,cy+2,cz,2.4,1.6,2.4,pk,9);
 for(let i=0;i<8;i++){const dx=Math.round((h2(cx+i,cz)-.5)*7),dz=Math.round((h2(cx,cz+i)-.5)*7);if(Math.hypot(dx,dz)>2.5)putIfEmpty(cx+dx,cy-3,cz+dz,BL.LEAF_PINK)}
 SAKURA.push([cx+.5,cy+2,cz+.5])}
function maple(ax,az,top,s){
 const h=3+(s*2|0),R=2.4+s*1.2,cy=top+h+2;trunk(ax,az,top+1,top+h+1);
 const pk=(t,r)=>{const q=vnz(ax*.7+r*3,az*.7+t*2);return q<.35?BL.LEAF_RED:q<.72?BL.LEAF_ORANGE:BL.LEAF_YELLOW};
 blob(ax,cy,az,R,R*.8,R,pk,1);blob(ax+2,cy-1,az-1,R*.65,R*.6,R*.65,pk,2);blob(ax-2,cy-1,az+1,R*.65,R*.6,R*.65,pk,3);blob(ax,cy+2,az,R*.6,R*.6,R*.6,pk,4);
 MAPLES.push([ax+.5,cy+1,az+.5])}
function pine(ax,az,top,s,snowy){
 const H=7+(s*5|0),cells=[];trunk(ax,az,top+1,top+3);
 for(let k=0;k<H;k++){const y=top+3+k,r=Math.max(0,Math.round(3.4*(1-k/H)*(k%3===2?.55:1)));
  for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)if(dx*dx+dz*dz<=r*r+.5){putIfEmpty(ax+dx,y,az+dz,h2(ax+dx*3,az+dz+y)>.86?BL.LEAF_G:BL.LEAF_DARK);if(r>=1)cells.push([ax+dx,y,az+dz])}}
 putIfEmpty(ax,top+3+H,az,BL.LEAF_DARK);
 if(snowy){for(const[x,y,z]of cells){if(!VOX[VI(x,y+1,z)]&&h2(x*7+y,z*3)>.3)setV(x,y+1,z,BL.SNOW)}putIfEmpty(ax,top+4+H,az,BL.SNOW);SNOWC.push([ax,az])}}
function plantTrees(){
 const spots=[];
 for(let a=X0;a<=X1;a+=2)for(let b=Z0;b<=Z1;b+=2){
  const ax=a+Math.round((h2(a,b*3+11)-.5)*1.6),az=b+Math.round((h2(a*5+1,b+7)-.5)*1.6);
  if(!inb(ax,az))continue;const ci=CI(ax,az);const key=KEY[ci];if(!key||LAKE[ci]||RES[ci])continue;
  const top=colTop(ax,az);if(top===null)continue;const bio=BIO[ci];
  const idv=VOX[VI(ax,top,az)];if(idv===BL.COBBLE||idv===BL.FARM||idv===BL.SAND||idv===BL.PAVER||idv===BL.GRAVEL)continue;
  const cl=vnz(a*.07+key*3,b*.07);
  let dens=bio===3?.42:bio===2?.3:bio===4?.17:bio===5?.2:.13;
  if(key===1&&ax>4&&ax<38&&az>0&&az<40)dens*=.3;
  if(h2(a*13+7,b*17+3)>dens*(.35+cl*1.3))continue;
  let near=false;for(let dx=-3;dx<=3&&!near;dx++)for(let dz=-3;dz<=3;dz++)if(inb(ax+dx,az+dz)&&OCC[CI(ax+dx,az+dz)]){near=true;break}
  if(near)continue;
  if(!(LAND(ax+1,az)&&LAND(ax-1,az)&&LAND(ax,az+1)&&LAND(ax,az-1)))continue;
  const s=h2(ax*7,az*13),r=h2(ax+5,az*3+1);
  if(bio===3)pine(ax,az,top,s,true);
  else if(bio===5)r<.7?pine(ax,az,top,s,false):oak(ax,az,top,s,BL.LEAF_G,BL.LEAF_G2);
  else if(bio===4)r<.72?sakura(ax,az,top,s):oak(ax,az,top,s,BL.LEAF_G,BL.LEAF_G2);
  else if(bio===2)r<.8?maple(ax,az,top,s):pine(ax,az,top,s,false);
  else if(key===5)r<.3?maple(ax,az,top,s):oak(ax,az,top,s,BL.LEAF_G,BL.LEAF_G2);
  else r<.1?sakura(ax,az,top,s):r<.2?maple(ax,az,top,s):oak(ax,az,top,s,BL.LEAF_G,BL.LEAF_G2);
  OCC[ci]=1;spots.push(ax)}
 return spots.length}
function populate(){
 fields();
 try{
  if(typeof CH!=='undefined')for(const ch of CH)if(ch&&ch.at)voxelPerson(Math.round(ch.at[0]),Math.round(ch.at[1]),h2(Math.round(ch.at[0]*7),Math.round(ch.at[1]*3))*1000);
  if(typeof CAST!=='undefined')for(const q of CAST)if(q&&q.a!==undefined)voxelPerson(Math.round(q.a),Math.round(q.b),h2(Math.round(q.a*11),Math.round(q.b*5))*1000);
  if(typeof PL!=='undefined'&&PL&&PL.P)voxelPerson(Math.round(PL.P.a),Math.round(PL.P.b),7);
 }catch(e){}}

// ---------- greedy mesher: correct face planes, baked AO, vertex tint ----------
const fb=()=>({a:new Float32Array(1<<15),n:0}),ib=()=>({a:new Uint32Array(1<<15),n:0});
function fp(b,v){if(b.n>=b.a.length){const c=new b.a.constructor(b.a.length*2);c.set(b.a);b.a=c}b.a[b.n++]=v}
const TC=[1,1,1],AOF=[.4,.62,.82,1];
function tintFor(id,x,y,z){const k=BD[id].tn;let r=1,g=1,b=1;
 if(k===1){const n=vnz(x*.09,z*.09)-.5,m=vnz(x*.31+9,z*.31)-.5;r=1+n*.36+m*.1;g=1+n*.1+m*.14;b=1-n*.4}
 else if(k===2){const n=vnz(x*.2+y*.1,z*.2)-.5;r=1+n*.32;g=1+n*.1;b=1-n*.28}
 else if(k===3){const d=clamp((-y-2)/36,0,1),m=1-.5*d,n=(vnz(x*.15,z*.15+y*.2)-.5)*.2;r=m*(1-.05*d)+n;g=m+n;b=m*(1+.12*d)+n}
 else if(k===4){const n=vnz(x*.2,z*.2)-.5;r=.98+n*.04;g=1+n*.02;b=1.03+n*.05}
 else if(k===5){const n=vnz(x*.4+y*.2,z*.4)-.5;r=g=b=1+n*.2}
 else{const n=(vnz(x*.5,z*.5+y*.3)-.5)*.1;r=g=b=1+n}
 TC[0]=r;TC[1]=g;TC[2]=b}
function greedyMesh(){
 const B={},get=k=>B[k]||(B[k]={p:fb(),n:fb(),u:fb(),c:fb(),i:ib(),v:0});
 const LO=[X0,Y0,Z0],HI=[X1,Y1,Z1],N=[SX,SY,SZ],ST=[1,SXZ,SX],AX=[[0,2,1],[1,0,2],[2,0,1]];
 const sol=(x,y,z)=>{if(x<X0||x>X1||y<Y0||y>Y1||z<Z0||z>Z1)return 0;const id=VOX[VI(x,y,z)];return id&&!BD[id].noAO?1:0};
 const q=[0,0,0],r=[0,0,0],cc=[0,0,0],nr=[0,0,0];
 for(let w=0;w<3;w++){const wa=AX[w][0],ua=AX[w][1],va=AX[w][2],nu=N[ua],nv=N[va],row=new Int32Array(nu),cyc=((va-ua+3)%3)===1;
  const solq=(du,dv)=>{r[0]=q[0];r[1]=q[1];r[2]=q[2];r[ua]+=du;r[va]+=dv;return sol(r[0],r[1],r[2])};
  for(const sgn of[1,-1]){const o=w===1?(sgn>0?0:1):(w===0?2:3),flip=((cyc?1:-1)*sgn)<0;
   for(let s=LO[wa];s<=HI[wa];s++){const nin=(s+sgn)>=LO[wa]&&(s+sgn)<=HI[wa];
    for(let vv=0;vv<nv;vv++){let any=0;const base=(s-LO[wa])*ST[wa]+vv*ST[va];
     for(let uu=0;uu<nu;uu++){const idx=base+uu*ST[ua],id=VOX[idx];let key=0;
      if(id&&!(nin&&VOX[idx+sgn*ST[wa]])){
       q[wa]=s+sgn;q[ua]=LO[ua]+uu;q[va]=LO[va]+vv;let ao=0;
       if(BD[id].noAO)ao=255;else for(let c=0;c<4;c++){const du=(c===1||c===2)?1:-1,dv=c>=2?1:-1,s1=solq(du,0),s2=solq(0,dv),sc=solq(du,dv);ao|=((s1&&s2)?0:3-(s1+s2+sc))<<(2*c)}
       key=(id*4+o)|(ao<<10);any=1}
      row[uu]=key}
     if(!any)continue;
     let uu=0;
     while(uu<nu){const key=row[uu];if(!key){uu++;continue}
      const aoo=key>>10,a=[aoo&3,(aoo>>2)&3,(aoo>>4)&3,(aoo>>6)&3];let ww=1;
      if(a[0]===a[1]&&a[3]===a[2])while(uu+ww<nu&&ww<6&&row[uu+ww]===key)ww++;
      const fid=key&1023,id=fid>>2,oo=fid&3,bd=BD[id],mk=oo===0?bd.t:oo===1?bd.b:bd.s,m=get(mk);
      const plane=s+(sgn>0?1:0),u0=LO[ua]+uu,v0=LO[va]+vv;nr[0]=nr[1]=nr[2]=0;nr[wa]=sgn;
      const CU=[u0,u0+ww,u0+ww,u0],CV=[v0,v0,v0+1,v0+1];
      for(let c=0;c<4;c++){cc[wa]=plane;cc[ua]=CU[c];cc[va]=CV[c];
       fp(m.p,cc[0]);fp(m.p,cc[1]);fp(m.p,cc[2]);fp(m.n,nr[0]);fp(m.n,nr[1]);fp(m.n,nr[2]);
       fp(m.u,c===1||c===2?ww:0);fp(m.u,c>=2?1:0);
       tintFor(id,cc[0],cc[1],cc[2]);const f=AOF[a[c]]*(id===BL.FIRE?1.5:1);fp(m.c,TC[0]*f);fp(m.c,TC[1]*f);fp(m.c,TC[2]*f)}
      const v=m.v;
      if(a[0]+a[2]>a[1]+a[3]){if(!flip){fp(m.i,v);fp(m.i,v+1);fp(m.i,v+3);fp(m.i,v+1);fp(m.i,v+2);fp(m.i,v+3)}else{fp(m.i,v);fp(m.i,v+3);fp(m.i,v+1);fp(m.i,v+1);fp(m.i,v+3);fp(m.i,v+2)}}
      else{if(!flip){fp(m.i,v);fp(m.i,v+1);fp(m.i,v+2);fp(m.i,v);fp(m.i,v+2);fp(m.i,v+3)}else{fp(m.i,v);fp(m.i,v+2);fp(m.i,v+1);fp(m.i,v);fp(m.i,v+3);fp(m.i,v+2)}}
      m.v+=4;uu+=ww}}}}}
 return B}
function geoFrom(m){const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(m.p.a.slice(0,m.p.n),3));g.setAttribute('normal',new THREE.BufferAttribute(m.n.a.slice(0,m.n.n),3));
 g.setAttribute('uv',new THREE.BufferAttribute(m.u.a.slice(0,m.u.n),2));g.setAttribute('color',new THREE.BufferAttribute(m.c.a.slice(0,m.c.n),3));
 g.setIndex(new THREE.BufferAttribute(m.i.a.slice(0,m.i.n),1));g.computeBoundingSphere();return g}

// ---------- shared uniforms, lit materials (lamp pools + sway patched into three's Lambert) ----------
let U=null;
const LAMP=`if(uNight>.02){vec3 la=vec3(0.);vec3 nn=normalize(vWN);
 for(int i=0;i<64;i++){vec4 Lq=uL[i];if(Lq.w<=0.)break;vec3 d=Lq.xyz-vWP;float dist=length(d);if(dist<Lq.w){float a=1.-dist/Lq.w;a*=a;float nl=clamp(dot(nn,d/max(dist,.001)),0.,1.)*.7+.3;la+=a*nl*(1.+.07*sin(uTime*7.+float(i)*3.1));}}
 totalEmissiveRadiance+=diffuseColor.rgb*uWarm*la*uNight*1.7;}`;
function patchLit(m,kind){
 m.onBeforeCompile=sh=>{sh.uniforms.uTime=U.uTime;sh.uniforms.uNight=U.uNight;sh.uniforms.uWarm=U.uWarm;sh.uniforms.uL=U.uL;
  let sway='';
  if(kind===1)sway='transformed.x+=sin(uTime*1.3+position.y*.45+position.z*.31)*.09;transformed.z+=cos(uTime*1.1+position.x*.37+position.y*.4)*.09;transformed.y+=sin(uTime*1.7+position.x*.5+position.z*.5)*.04;';
  else if(kind===2)sway='float hh_=uv.y;transformed.x+=sin(uTime*1.9+instanceMatrix[3].x*.6+instanceMatrix[3].z*.4)*.16*hh_*hh_;transformed.z+=cos(uTime*1.6+instanceMatrix[3].z*.5)*.1*hh_*hh_;';
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;uniform float uTime;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\n'+sway+'\nvec4 wpp_=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nwpp_=instanceMatrix*wpp_;\n#endif\nvWP=wpp_.xyz;vWN=normal;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;uniform float uTime,uNight;uniform vec3 uWarm;uniform vec4 uL[64];')
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n'+LAMP)};
 m.customProgramCacheKey=()=>'vx'+kind}
const MATS={};
function getMat(k){if(MATS[k])return MATS[k];let m;
 if(k==='fire'){m=new THREE.MeshBasicMaterial({map:tex(k),vertexColors:true})}
 else{m=new THREE.MeshLambertMaterial({map:tex(k),vertexColors:true});
  if(EMP[k]){m.emissive=new THREE.Color(0xffffff);m.emissiveMap=tex(k,1);m.emissiveIntensity=.4}
  patchLit(m,/^leaf|^vine/.test(k)?1:0)}
 m.shadowSide=THREE.FrontSide;
 m.name=k;return MATS[k]=m}
const TAIL=()=>'\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n';
const NOISE=`float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec2(17.,9.);a*=.5;}return s;}`;

// ---------- time of day ----------
const PRESETS=[
 {n:'Golden hour',az:2.5,el:.36,sun:'#ffb25a',si:3.5,hs:'#ffd5a6',hg:'#7a5560',hi:1.0,am:'#a07a86',ai:.3,top:'#35589a',mid:'#e8977a',hor:'#ffc58a',low:'#6a5f92',cl:'#ffc880',cs:'#a08fb4',night:0,exp:1.0,sh:'#35a0a8',dp:'#154c66'},
 {n:'Dusk',az:2.75,el:.07,sun:'#ff7b5c',si:1.7,hs:'#9b86cc',hg:'#4a3858',hi:.85,am:'#6b5a90',ai:.4,top:'#1c2a5c',mid:'#7a4f86',hor:'#f0855f',low:'#2f2a55',cl:'#ff9a78',cs:'#6a5a90',night:.62,exp:1.08,sh:'#2a6e88',dp:'#10304e'},
 {n:'Night',az:.7,el:.75,sun:'#9fb8ff',si:.5,hs:'#4a64a8',hg:'#141a30',hi:.42,am:'#27366a',ai:.28,top:'#050a1c',mid:'#0c1838',hor:'#1c2c58',low:'#070b1c',cl:'#4a5c92',cs:'#141c38',night:1,exp:1.1,sh:'#1c4a72',dp:'#081c36'},
 {n:'Dawn',az:.4,el:.13,sun:'#ffa27a',si:2.1,hs:'#ffcfc2',hg:'#6a5a78',hi:.9,am:'#9a8aa6',ai:.35,top:'#5c7cb8',mid:'#f0a8a0',hor:'#ffd2a8',low:'#7a7098',cl:'#ffd8c8',cs:'#8a7aa0',night:.2,exp:1.0,sh:'#3aa6b0',dp:'#17506a'},
 {n:'Midday',az:1.2,el:.95,sun:'#fff1d6',si:2.9,hs:'#bfe0ff',hg:'#8c8a6a',hi:.85,am:'#9ab4d8',ai:.3,top:'#2f78d8',mid:'#7fb8ec',hor:'#cfe6f6',low:'#7fa4cc',cl:'#ffffff',cs:'#a9bdd6',night:0,exp:.9,sh:'#3ab0b8',dp:'#176085'}];
const CK=['sun','hs','hg','am','top','mid','hor','low','cl','cs','sh','dp'],NK=['az','el','si','hi','ai','night','exp'];
let PC=null,CUR=null,PHASE=0,sunL=null,hemi=null,amb=null,skyMesh=null,seaMesh=null,sprites=[],waterMat=null,seaMat=null,skyMat=null,dayHud=null,sunDir=null;
function mkPhase(p){const o={};for(const k of CK)o[k]=new THREE.Color(p[k]);for(const k of NK)o[k]=p[k];return o}
function stepTime(dt,snap){const t=PRESETS[PHASE],k=snap?1:1-Math.exp(-dt*1.4);
 for(const c of CK)CUR[c].lerp(PC[PHASE][c],k);for(const n of NK)CUR[n]+=(t[n]-CUR[n])*k;
 const ce=Math.cos(CUR.el);sunDir.set(ce*Math.cos(CUR.az),Math.sin(CUR.el),ce*Math.sin(CUR.az)).normalize();
 sunL.position.set(86+sunDir.x*220,-5+sunDir.y*220,46+sunDir.z*220);sunL.color.copy(CUR.sun);sunL.intensity=CUR.si;
 hemi.color.copy(CUR.hs);hemi.groundColor.copy(CUR.hg);hemi.intensity=CUR.hi;amb.color.copy(CUR.am);amb.intensity=CUR.ai;
 renderer.toneMappingExposure=CUR.exp;U.uNight.value=CUR.night;
 U.uWarm.value.set(1,.62,.28);
 const m=MATS;if(m.window){m.window.emissiveIntensity=.35+2.2*CUR.night}if(m.lantern)m.lantern.emissiveIntensity=.5+2.4*CUR.night;if(m.shoji)m.shoji.emissiveIntensity=.12+.9*CUR.night;
 const su=U.sky;su.uTop.value.copy(CUR.top);su.uMid.value.copy(CUR.mid);su.uHor.value.copy(CUR.hor);su.uLow.value.copy(CUR.low);su.uSun.value.copy(sunDir);su.uSunCol.value.copy(CUR.sun);
 su.uMoon.value.set(-sunDir.x,Math.abs(sunDir.y)*.6+.4,-sunDir.z).normalize();su.uCL.value.copy(CUR.cl);su.uCS.value.copy(CUR.cs);
 const w=U.water;w.uSky.value.copy(CUR.top);w.uHorz.value.copy(CUR.hor);w.uSun.value.copy(sunDir);w.uSunCol.value.copy(CUR.sun);w.uShallow.value.copy(CUR.sh);w.uDeep.value.copy(CUR.dp);
 const s=U.sea;s.uLit.value.copy(CUR.cl);s.uSh.value.copy(CUR.cs);s.uHor.value.copy(CUR.hor);s.uSd.value.set(-sunDir.x,-sunDir.z).normalize();
 for(const sp of sprites)sp.material.color.copy(CUR.cl).lerp(CUR.cs,.18+.4*CUR.night);
 if(dayHud)dayHud.value=CUR.night}
function setPhase(i,snap){PHASE=((i%PRESETS.length)+PRESETS.length)%PRESETS.length;if(todBtn)todBtn.textContent=PRESETS[PHASE].n+' \u25B8';if(snap&&CUR)stepTime(0,true)}

// ---------- sky dome, cloud sea, water ----------
function skyMeshBuild(){
 const m=new THREE.ShaderMaterial({uniforms:Object.assign({uTime:U.uTime,uNight:U.uNight},U.sky),side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vD;void main(){vD=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p;gl_Position.z=gl_Position.w*.99999;}',
  fragmentShader:`uniform vec3 uTop,uMid,uHor,uLow,uSun,uSunCol,uMoon,uCL,uCS;uniform float uNight,uTime;varying vec3 vD;${NOISE}
void main(){vec3 d=normalize(vD);float y=d.y;vec3 c=mix(uHor,uMid,smoothstep(0.,.18,y));c=mix(c,uTop,smoothstep(.12,.7,y));c=mix(uLow,c,smoothstep(-.35,0.,y));
 float sd=max(dot(d,uSun),0.);c+=uSunCol*(pow(sd,6.)*.22+pow(sd,48.)*.4+pow(sd,900.)*7.)*(1.-uNight*.75);
 float md=max(dot(d,uMoon),0.);c+=vec3(.75,.85,1.)*(pow(md,700.)*5.+pow(md,24.)*.06)*uNight;
 if(y>0.){vec2 p=d.xz/(y+.12)*.9+vec2(uTime*.006,0.);float n=fbm(p*1.3);float cl=smoothstep(.5,.85,n)*smoothstep(0.,.25,y);
  vec3 cc=mix(uCS,uCL,clamp(.4+(n-fbm(p*1.3+uSun.xz*.25))*3.+pow(sd,3.)*.5,0.,1.));c=mix(c,cc,cl*.85);}
 if(uNight>.01&&y>0.){vec2 sp=d.xz/(y+.35)*90.;vec2 gi=floor(sp);float h=hash(gi);float st=step(.985,h)*smoothstep(0.,.2,y);float tw=.6+.4*sin(uTime*3.+h*60.);c+=vec3(.85,.9,1.)*st*tw*uNight*.9*(1.-length(fract(sp)-.5)*1.6);}
 gl_FragColor=vec4(c,1.);${TAIL()}}`});
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(900,32,16),m);mesh.frustumCulled=false;mesh.renderOrder=-10;return mesh}
function seaBuild(){
 const isl=[];for(let k=1;k<=5;k++){let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++)if(KEY[CI(a,b)]===k){a0=Math.min(a0,a);a1=Math.max(a1,a);b0=Math.min(b0,b);b1=Math.max(b1,b)}
  isl.push(a1<a0?new THREE.Vector4(0,0,1e-3,1e-3):new THREE.Vector4((a0+a1)/2,(b0+b1)/2,(a1-a0)/2*1.15+4,(b1-b0)/2*1.15+4))}
 U.sea.uIsl.value=isl;
 const m=new THREE.ShaderMaterial({uniforms:Object.assign({uTime:U.uTime},U.sea),transparent:true,depthWrite:false,
  vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:`uniform vec3 uLit,uSh,uHor;uniform vec2 uSd;uniform float uTime;uniform vec4 uIsl[5];varying vec3 vW;${NOISE}
void main(){vec2 p=vW.xz*.011+vec2(uTime*.012,uTime*.006);float n=fbm(p),n2=fbm(p+uSd*.35);float shade=clamp(.55+(n-n2)*1.8,0.,1.);
 vec3 col=mix(uSh,uLit,shade);col*=.9+.2*fbm(vW.xz*.04+uTime*.02);
 float sh=0.;for(int i=0;i<5;i++){vec4 I=uIsl[i];float d=length((vW.xz-I.xy+uSd*14.)/I.zw);sh=max(sh,1.-smoothstep(.5,1.1,d));}
 col=mix(col,uSh*.55,sh*.5);float r=length(vW.xz-vec2(86.,46.));float far=smoothstep(380.,1300.,r);col=mix(col,uHor,far);
 float a=max(smoothstep(.2,.5,n),far);gl_FragColor=vec4(col,a);${TAIL()}}`});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3200,3200),m);mesh.rotation.x=-Math.PI/2;mesh.position.set(86,-54,46);mesh.renderOrder=-5;return mesh}
function waterBuild(){
 const P=[],D=[],I=[];let v=0;
 for(let b=Z0;b<=Z1;b++){let a=X0;while(a<=X1){const ci=CI(a,b);if(!LAKE[ci]){a++;continue}const d=BED[ci];let e=a+1;while(e<=X1&&LAKE[CI(e,b)]&&BED[CI(e,b)]===d&&e-a<12)e++;
  P.push(a,WSY,b,e,WSY,b,e,WSY,b+1,a,WSY,b+1);D.push(d,d,d,d);I.push(v,v+2,v+1,v,v+3,v+2);v+=4;a=e}}
 if(!v)return null;
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aD',new THREE.Float32BufferAttribute(D,1));g.setIndex(I);
 const m=new THREE.ShaderMaterial({uniforms:Object.assign({uTime:U.uTime,uNight:U.uNight,uCam:{value:new THREE.Vector3()}},U.water),transparent:true,depthWrite:false,
  vertexShader:'attribute float aD;varying vec3 vW;varying float vD;void main(){vW=position;vD=aD;gl_Position=projectionMatrix*viewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform float uTime,uNight;uniform vec3 uCam,uSky,uHorz,uSun,uSunCol,uShallow,uDeep;varying vec3 vW;varying float vD;${NOISE}
float wave(vec2 p,float t){return sin(p.x*1.7+t*1.1+sin(p.y*.9+t*.7))*.5+sin(p.y*2.3-t*1.3+p.x*.6)*.35+noise(p*3.+t*.4)*.6+noise(p*7.-t*.6)*.25;}
void main(){vec2 p=vW.xz*.9;float e=.08,t=uTime;float h0=wave(p,t);vec3 N=normalize(vec3((h0-wave(p+vec2(e,0.),t))/e*.12,1.,(h0-wave(p+vec2(0.,e),t))/e*.12));
 vec3 V=normalize(uCam-vW);float f=pow(1.-max(dot(N,V),0.),4.);vec3 R=reflect(-V,N);vec3 sky=mix(uHorz,uSky,clamp(R.y*1.3,0.,1.));
 float g=pow(max(dot(R,uSun),0.),140.);float depth=clamp(vD/4.,0.,1.);vec3 base=mix(uShallow,uDeep,depth);
 base+=uShallow*.1*noise(vW.xz*2.+t*.5)*noise(vW.xz*3.1-t*.4);
 vec3 col=mix(base,sky,.2+.6*f)+uSunCol*g*2.4*(1.-uNight*.4);
 float al=mix(.5,.92,clamp(depth*.8+f,0.,1.));float foam=smoothstep(1.3,.7,vD)*(.5+.5*noise(vW.xz*4.+t*.8))*.3;col=mix(col,vec3(.9,.97,1.),foam);al=max(al,foam);
 gl_FragColor=vec4(col,al);${TAIL()}}`});
 waterMat=m;const mesh=new THREE.Mesh(g,m);mesh.renderOrder=2;mesh.name='water';return mesh}

// ---------- swaying plants: crossed quads, instanced ----------
const flowerT=c=>g=>{rc(g,'#3f7a30',7,7,2,9);rc(g,'#4f9a3a',4,11,3,2);rc(g,'#4f9a3a',9,10,3,2);rc(g,c,5,3,6,4);rc(g,c,6,2,4,6);rc(g,'#ffe9a0',7,4,2,2)};
const PT={
 tuft:g=>{const c=['#4f9a3a','#7bc450','#3a7a2c'];for(let i=0;i<7;i++){const x=1+i*2,h=5+((h2(i,3)*9)|0);rc(g,c[i%3],x,16-h,1,h);if(h>9)rc(g,c[(i+1)%3],x+(i&1?1:-1),16-h-1,1,2)}},
 tuftDry:g=>{const c=['#b99a3c','#d8b84c','#8a6a28'];for(let i=0;i<7;i++){const x=1+i*2,h=5+((h2(i,5)*9)|0);rc(g,c[i%3],x,16-h,1,h)}},
 fR:flowerT('#e8402e'),fY:flowerT('#f4cf3a'),fP:flowerT('#f28bb2'),fW:flowerT('#f6f2e6'),fV:flowerT('#8a6ad8'),
 reed:g=>{for(const x of[3,7,11]){rc(g,'#5f8a3a',x,2,1,14);rc(g,'#4a7a2c',x+1,6,1,10)}rc(g,'#6a4426',7,0,1,4);rc(g,'#6a4426',3,2,1,3);rc(g,'#6a4426',11,1,1,3)}};
function buildDecor(){
 const K={tuft:[],tuftDry:[],fR:[],fY:[],fP:[],fW:[],fV:[],reed:[]},fk=['fR','fY','fP','fW','fV'];
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){const ci=CI(a,b),t=HT[ci];if(t===-999||RES[ci])continue;
  const idv=VOX[VI(a,t,b)];if(idv!==BL.GRASS&&idv!==BL.GRASS_DRY&&idv!==BL.PETAL&&idv!==BL.MOSS&&idv!==BL.DIRT)continue;if(VOX[VI(a,t+1,b)])continue;
  const r1=h2(a*3+1,b*5),r2=h2(a*7,b*3+2),r3=h2(a*11+4,b*13+1),near=LAKE[ci+1]||LAKE[ci-1]||LAKE[ci+SX]||LAKE[ci-SX];
  const x=a+.5+(r2-.5)*.8,z=b+.5+(r3-.5)*.8,s=.8+r1*.5;
  if(near){if(r1<.55)K.reed.push([x,t+1,z,s]);continue}
  const cl=vnz(a*.13,b*.13);
  if(idv===BL.DIRT)continue;
  if(cl>.56&&r1<.3&&BIO[ci]!==2)K[fk[Math.floor(r2*5)]].push([x,t+1,z,.75+r3*.3]);
  else if(r1<(idv===BL.GRASS_DRY?.5:idv===BL.MOSS?.22:.4))K[idv===BL.GRASS_DRY?'tuftDry':'tuft'].push([x,t+1,z,s])}
 const out=[],tm=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),sc=new THREE.Vector3(),ax=new THREE.Vector3(0,1,0);
 const geo=new THREE.BufferGeometry(),P=[],Nn=[],Uv=[],I=[];
 for(let k=0;k<2;k++){const c=Math.cos(k*Math.PI/2)*.5,s=Math.sin(k*Math.PI/2)*.5,v=P.length/3;P.push(-c,0,s,c,0,-s,c,1,-s,-c,1,s);for(let i=0;i<4;i++)Nn.push(0,1,0);Uv.push(0,0,1,0,1,1,0,1);I.push(v,v+1,v+2,v,v+2,v+3)}
 geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(Uv,2));geo.setIndex(I);
 for(const k in K){const arr=K[k];if(!arr.length)continue;
  const c=document.createElement('canvas');c.width=c.height=16;PT[k](c.getContext('2d'));
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;if(THREE.sRGBEncoding!==undefined)t.encoding=THREE.sRGBEncoding;t.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.MeshLambertMaterial({map:t,alphaTest:.5,side:THREE.DoubleSide});m.name='plant_'+k;patchLit(m,2);
  const im=new THREE.InstancedMesh(geo,m,arr.length);im.name='plant_'+k;
  arr.forEach((e,i)=>{q.setFromAxisAngle(ax,h2(i,k.length)*6.28);const hs=k==='reed'?2.4:1;p.set(e[0],e[1],e[2]);sc.set(e[3],e[3]*hs,e[3]);tm.compose(p,q,sc);im.setMatrixAt(i,tm)});
  im.instanceMatrix.needsUpdate=true;im.receiveShadow=true;im.frustumCulled=false;out.push(im)}
 return out}

// ---------- GPU particle systems: petals, leaves, snow, fireflies, smoke, lanterns, light glows ----------
const PV=`attribute vec4 aS;uniform float uTime,uNight,uScale;varying vec4 vC;varying float vR;
void main(){vec3 p=position;float sz=1.;vec4 col=vec4(1.);float rot=aS.z*6.28;
BODY
vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(sz*uScale/-mv.z,1.,160.);vC=col;vR=rot;}`;
const SHAPES={
 soft:'float r=length(c)*2.;float a=smoothstep(1.,.2,r);gl_FragColor=vec4(vC.rgb,vC.a*a);',
 glow:'float r=length(c)*2.;float a=exp(-r*r*5.)+exp(-r*r*40.)*.6;gl_FragColor=vec4(vC.rgb*a,vC.a);if(r>1.)discard;',
 petal:'float cs=cos(vR),sn=sin(vR);vec2 q=vec2(c.x*cs-c.y*sn,c.x*sn+c.y*cs);float e=q.x*q.x/.2+q.y*q.y/.045;if(e>1.)discard;gl_FragColor=vec4(vC.rgb*(.85+.3*q.x),vC.a);'};
const BODIES={
 petal:`float t=fract(aS.x+uTime*aS.y*.02);p.y-=t*30.;p.x+=t*(14.+aS.z*6.)+sin(uTime*.9+aS.x*40.)*1.8;p.z+=t*(5.-aS.w*6.)+cos(uTime*.8+aS.x*31.)*1.8;
 sz=.75*(.6+aS.w*.8);rot=aS.z*6.28+uTime*(.6+aS.w*1.5);float f=smoothstep(0.,.08,t)*(1.-smoothstep(.85,1.,t));
 vec3 pc=mix(vec3(1.,.66,.78),vec3(1.,.9,.94),aS.z);col=vec4(pow(pc,vec3(2.2))*(1.-uNight*.6),.95*f);`,
 leaf:`float t=fract(aS.x+uTime*aS.y*.025);p.y-=t*34.;p.x+=t*(16.+aS.z*6.)+sin(uTime*1.1+aS.x*40.)*2.2;p.z+=t*(4.-aS.w*6.)+cos(uTime*.9+aS.x*31.)*2.;
 sz=.95*(.6+aS.w*.8);rot=aS.z*6.28+uTime*(1.+aS.w*2.);float f=smoothstep(0.,.08,t)*(1.-smoothstep(.85,1.,t));
 vec3 pc=aS.z<.33?vec3(.86,.3,.16):aS.z<.66?vec3(.92,.58,.14):vec3(.95,.78,.22);col=vec4(pow(pc,vec3(2.2))*(1.-uNight*.6),.95*f);`,
 snow:`float t=fract(aS.x+uTime*aS.y*.03);p.y-=t*42.;p.x+=sin(uTime*.5+aS.x*60.)*2.+t*7.;p.z+=cos(uTime*.4+aS.w*50.)*2.;sz=.4+aS.w*.3;
 col=vec4(pow(vec3(.96,.98,1.)*(1.-uNight*.35),vec3(2.2)),.9*smoothstep(0.,.05,t)*(1.-smoothstep(.9,1.,t)));`,
 fire:`p+=vec3(sin(uTime*aS.y*.6+aS.x*20.)*1.3,sin(uTime*aS.y*.9+aS.z*17.)*.6,cos(uTime*aS.y*.5+aS.x*9.)*1.3);
 float pulse=smoothstep(.2,1.,sin(uTime*(.8+aS.w*1.2)+aS.x*50.)*.5+.5);sz=.55+uNight*.5;col=vec4(pow(vec3(.75,1.,.35),vec3(2.2)),pulse*(.1+uNight*.9));`,
 smoke:`float t=fract(aS.x+uTime*.1);p.y+=t*9.;p.x+=t*t*6.+sin(uTime*.8+aS.z*9.)*.5*t;p.z+=t*2.;sz=.9+t*3.2;
 float f=smoothstep(0.,.1,t)*(1.-t);col=vec4(pow(mix(vec3(.82,.82,.84),vec3(.5,.5,.58),uNight),vec3(2.2)),f*.5);`,
 mist:`float t=fract(aS.x+uTime*.15);p.y+=t*6.;p.x+=(aS.z-.5)*t*10.;p.z+=(aS.w-.5)*t*10.;sz=3.+t*7.;
 col=vec4(pow(vec3(.92,.97,1.)*(1.-uNight*.55),vec3(2.2)),(1.-t)*smoothstep(0.,.1,t)*.16);`,
 lantern:`float t=fract(aS.x+uTime*.012*(.7+aS.y*.6));p.y+=t*70.;p.x+=sin(uTime*.3+aS.z*10.)*3.+t*14.;p.z+=cos(uTime*.25+aS.w*10.)*3.;sz=1.9;
 col=vec4(pow(vec3(1.,.62,.25),vec3(2.2)),smoothstep(0.,.1,t)*(1.-smoothstep(.8,1.,t))*(.25+.75*uNight)*.9);`,
 glow:`float k=aS.y;float fl=1.+.12*sin(uTime*(6.+aS.z*5.)+aS.z*20.)+.06*sin(uTime*13.+aS.z*7.);sz=aS.x*(1.+uNight*.5);
 float a=k<.5?(.1+.9*uNight):k<1.5?(.03+.95*uNight):(.45+.55*uNight)*fl;vec3 c=k<.5?vec3(1.,.72,.38):k<1.5?vec3(1.,.8,.45):vec3(1.,.5,.2);
 col=vec4(pow(c,vec3(2.2)),a*.6*fl);`};
function psys(kind,shape,data,add){
 const n=data.length,pos=new Float32Array(n*3),sd=new Float32Array(n*4);
 data.forEach((d,i)=>{pos.set(d.slice(0,3),i*3);sd.set(d.slice(3,7),i*4)});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aS',new THREE.BufferAttribute(sd,4));
 const m=new THREE.ShaderMaterial({uniforms:{uTime:U.uTime,uNight:U.uNight,uScale:U.uScale},vertexShader:PV.replace('BODY',BODIES[kind]),
  fragmentShader:`varying vec4 vC;varying float vR;void main(){vec2 c=gl_PointCoord-.5;${SHAPES[shape]}\n#include <encodings_fragment>\n}`,
  transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,toneMapped:false});
 const pts=new THREE.Points(g,m);pts.frustumCulled=false;pts.name='fx_'+kind;pts.renderOrder=3;return pts}
const R=Math.random;
function buildFx(){
 const out=[],rnd4=()=>[R(),.6+R()*.8,R(),R()];
 if(SAKURA.length){const d=[];for(let i=0;i<700;i++){const s=SAKURA[(R()*SAKURA.length)|0];d.push([s[0]+(R()-.5)*8,s[1]+R()*2,s[2]+(R()-.5)*8,...rnd4()])}out.push(psys('petal','petal',d,false))}
 if(MAPLES.length){const d=[];for(let i=0;i<450;i++){const s=MAPLES[(R()*MAPLES.length)|0];d.push([s[0]+(R()-.5)*7,s[1]+R()*2,s[2]+(R()-.5)*7,...rnd4()])}out.push(psys('leaf','petal',d,false))}
 const snowCells=[],landCells=[],lakeNear=[];
 for(let a=X0;a<=X1;a+=1)for(let b=Z0;b<=Z1;b+=1){const ci=CI(a,b);if(HT[ci]===-999)continue;if(BIO[ci]===3)snowCells.push([a,b]);else if(BIO[ci]===1||BIO[ci]===4)landCells.push([a,b]);
  if(BIO[ci]!==3&&(LAKE[ci+2]||LAKE[ci-2]||LAKE[ci+2*SX]||LAKE[ci-2*SX]))lakeNear.push([a,b])}
 if(snowCells.length>40){const d=[];for(let i=0;i<1500;i++){const c=snowCells[(R()*snowCells.length)|0];d.push([c[0]+R(),36,c[1]+R(),...rnd4()])}out.push(psys('snow','soft',d,false))}
 {const d=[],src=lakeNear.length>20?lakeNear:landCells;if(src.length){for(let i=0;i<170;i++){const c=src[(R()*src.length)|0],t=HT[CI(c[0],c[1])];d.push([c[0]+R(),t+1.6+R()*2.6,c[1]+R(),...rnd4()])}out.push(psys('fire','glow',d,true))}}
 if(SMOKES.length){const d=[];for(const s of SMOKES)for(let i=0;i<9;i++)d.push([s[0],s[1],s[2],i/9+R()*.05,0,R(),R()]);out.push(psys('smoke','soft',d,false))}
 {const cells=[];for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++)if(KEY[CI(a,b)]===2&&HT[CI(a,b)]!==-999)cells.push([a,b]);
  if(cells.length){const d=[];for(let i=0;i<16;i++){const c=cells[(R()*cells.length)|0];d.push([c[0],HT[CI(c[0],c[1])]+3,c[1],R(),R(),R(),R()])}out.push(psys('lantern','glow',d,true))}}
 if(GLOWS.length)out.push(psys('glow','glow',GLOWS.map(g=>[g[0],g[1],g[2],g[3],g[4],R(),0]),true));
 return out}

// ---------- living things: koi, lily pads, boats, birds, waterfalls, cloud puffs ----------
let KOI=[],BIRDS=[],BOATM=[],PONDS=[];
const BM={};const bmat=c=>BM[c]||(BM[c]=new THREE.MeshLambertMaterial({color:c}));
function buildPonds(){
 const seen=new Uint8Array(SX*SZ);PONDS=[];
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){const ci=CI(a,b);if(!LAKE[ci]||seen[ci])continue;
  const st=[ci],cells=[];seen[ci]=1;while(st.length){const c=st.pop();cells.push(c);for(const n of[c+1,c-1,c+SX,c-SX])if(n>=0&&n<SX*SZ&&LAKE[n]&&!seen[n]){seen[n]=1;st.push(n)}}
  if(cells.length<10)continue;const inner=cells.filter(c=>LAKE[c+1]&&LAKE[c-1]&&LAKE[c+SX]&&LAKE[c-SX]);PONDS.push({cells,inner:inner.length>4?inner:cells})}}
const cellXZ=c=>[(c%SX)+X0+.5,Math.floor(c/SX)+Z0+.5];
const lakeAt=(x,z)=>{const a=Math.floor(x),b=Math.floor(z);return inb(a,b)&&LAKE[CI(a,b)]===1};
function buildKoi(root){
 const pal=[['#f4efe4','#e8482c','#f4efe4'],['#ff7a2a','#ff8c3a','#ffb060'],['#f4efe4','#f4efe4','#e8482c'],['#e8c040','#f0cf58','#f6dc80'],['#2a2a30','#f4efe4','#e8482c'],['#e8482c','#f4efe4','#e8482c']];
 const bx=new THREE.BoxGeometry(1,1,1);const part=(c,sx,sy,sz,x,y,z)=>{const m=new THREE.Mesh(bx,bmat(c));m.scale.set(sx,sy,sz);m.position.set(x,y,z);return m};
 PONDS.forEach((pd,pi)=>{const n=clamp(Math.round(pd.cells.length/26),1,12);
  for(let i=0;i<n;i++){const c=pal[(R()*pal.length)|0],g=new THREE.Group(),tail=new THREE.Group();
   g.add(part(c[0],.65,.5,.5,.8,0,0));g.add(part(c[1],1.1,.58,.6,0,0,0));tail.position.set(-.55,0,0);tail.add(part(c[2],.7,.36,.3,-.35,0,0));tail.add(part(c[2],.4,.08,.75,-.8,0,0));g.add(tail);
   g.add(part(c[1],.35,.08,.5,.2,-.12,.4));g.add(part(c[1],.35,.08,.5,.2,-.12,-.4));
   const xz=cellXZ(pd.inner[(R()*pd.inner.length)|0]);g.position.set(xz[0],WSY-1.1,xz[1]);const s=1+R()*.5;g.scale.setScalar(s);root.add(g);
   KOI.push({g,tail,pd,ang:R()*6.28,spd:.5+R()*.7,wp:xz.slice(),ph:R()*6,y:WSY-.9-R()*.9})}})}
function koiStep(dt){for(const k of KOI){const p=k.g.position;let dx=k.wp[0]-p.x,dz=k.wp[1]-p.z;
  if(dx*dx+dz*dz<2.5||(k.t=(k.t||0)+dt)>12){k.wp=cellXZ(k.pd.inner[(R()*k.pd.inner.length)|0]);k.t=0}
  let d=Math.atan2(dz,dx)-k.ang;d=Math.atan2(Math.sin(d),Math.cos(d));k.ang+=clamp(d,-1.6*dt,1.6*dt);
  const lx=p.x+Math.cos(k.ang)*1.6,lz=p.z+Math.sin(k.ang)*1.6;
  if(!lakeAt(lx,lz)){k.ang+=2.5*dt;k.wp=cellXZ(k.pd.inner[(R()*k.pd.inner.length)|0])}
  else{p.x+=Math.cos(k.ang)*k.spd*dt;p.z+=Math.sin(k.ang)*k.spd*dt}
  p.y=k.y+Math.sin(T*.8+k.ph)*.08;k.g.rotation.y=-k.ang;k.tail.rotation.y=Math.sin(T*(4+k.spd*3)+k.ph)*.55}}
function buildLilies(root){
 const pads=[],lot=[];for(const pd of PONDS)for(const c of pd.inner)if(h2(c,17)<.13){const xz=cellXZ(c);pads.push([xz[0]+(h2(c,3)-.5)*.6,xz[1]+(h2(c,5)-.5)*.6,.55+h2(c,7)*.4]);if(h2(c,9)<.3)lot.push(pads[pads.length-1])}
 if(!pads.length)return;
 const g=new THREE.CircleGeometry(.6,9);g.rotateX(-Math.PI/2);const im=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:'#4f9a3a',side:THREE.DoubleSide}),pads.length);
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),ax=new THREE.Vector3(0,1,0),c=new THREE.Color();
 pads.forEach((p,i)=>{q.setFromAxisAngle(ax,R()*6.28);m4.compose(new THREE.Vector3(p[0],WSY+.04,p[1]),q,new THREE.Vector3(p[2],1,p[2]));im.setMatrixAt(i,m4);im.setColorAt(i,c.set(R()<.5?'#4f9a3a':'#3f8a3a').offsetHSL(0,0,(R()-.5)*.08))});
 im.receiveShadow=true;im.name='lilypads';root.add(im);
 if(lot.length){const cg=new THREE.ConeGeometry(.28,.4,6);const lm=new THREE.InstancedMesh(cg,new THREE.MeshLambertMaterial({color:'#f79bbd'}),lot.length);
  lot.forEach((p,i)=>{m4.compose(new THREE.Vector3(p[0],WSY+.25,p[1]),new THREE.Quaternion(),new THREE.Vector3(1,1,1));lm.setMatrixAt(i,m4)});lm.name='lotus';root.add(lm)}}
function buildBoats(root){
 for(const b of BOATS){const g=new THREE.Group(),w='#8a6238';
  const hull=new THREE.Mesh(new THREE.BoxGeometry(2.8,.5,1.2),bmat(w));g.add(hull);const bow=new THREE.Mesh(new THREE.BoxGeometry(.8,.45,.7),bmat('#74512e'));bow.position.set(1.7,.1,0);g.add(bow);
  const st=new THREE.Mesh(new THREE.BoxGeometry(.5,.35,1.2),bmat('#a37a46'));st.position.set(-.2,.4,0);g.add(st);
  const lan=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.3),new THREE.MeshBasicMaterial({color:'#ffc66a'}));lan.position.set(1.7,.7,0);g.add(lan);
  g.position.set(b[0],WSY+.1,b[1]);g.rotation.y=b[2];g.userData.b=b;root.add(g);BOATM.push(g)}}
function boatStep(){BOATM.forEach((g,i)=>{const b=g.userData.b;g.position.y=WSY+.12+Math.sin(T*1.1+i*2)*.07;g.rotation.z=Math.sin(T*.9+i)*.04;g.rotation.y=b[2]+Math.sin(T*.12+i)*.35;g.position.x=b[0]+Math.sin(T*.18+i)*.5;g.position.z=b[1]+Math.cos(T*.15+i)*.4})}
function buildBirds(root){
 for(let i=0;i<10;i++){const g=new THREE.Group(),m=new THREE.MeshLambertMaterial({color:i%3?'#f4f2ee':'#9aa0a8',side:THREE.DoubleSide});
  const body=new THREE.Mesh(new THREE.BoxGeometry(.7,.22,.22),m);const wl=new THREE.Group(),wr=new THREE.Group();
  const wg=new THREE.PlaneGeometry(.45,1.2);wg.rotateX(-Math.PI/2);wg.translate(0,0,-.6);const a=new THREE.Mesh(wg,m);wl.add(a);const wg2=wg.clone();wg2.translate(0,0,1.2);const b=new THREE.Mesh(wg2,m);wr.add(b);
  g.add(body,wl,wr);root.add(g);BIRDS.push({g,wl,wr,R:35+R()*95,h:16+R()*30,w:(R()<.5?-1:1)*(.05+R()*.1),ph:R()*6.28,c:[86+(R()-.5)*30,46+(R()-.5)*20]})}}
function birdStep(){for(const b of BIRDS){const a=b.ph+T*b.w;b.g.position.set(b.c[0]+Math.cos(a)*b.R,b.h+Math.sin(T*.5+b.ph)*2,b.c[1]+Math.sin(a)*b.R);
  b.g.rotation.y=-a-(b.w>0?Math.PI/2:-Math.PI/2);b.g.rotation.x=(b.w>0?-.18:.18);const f=Math.sin(T*8+b.ph*3)*.7;b.wl.rotation.x=f;b.wr.rotation.x=-f}}
function buildFalls(root){
 try{
  const spots=[];
  if(typeof POND!=='undefined'&&POND)spots.push([63.5,POND[1]+(63.5-31.4)*.075]);
  if(typeof POND2!=='undefined'&&POND2&&typeof PX2!=='undefined')spots.push([120,POND2[1]+(120-PX2)*.05]);
  const mist=[];
  for(const s of spots){const fa=Math.floor(s[0]),fb2=Math.floor(s[1]);let best=null;
   for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){let k=0;while(k<10&&LAND(fa+dx*k,fb2+dz*k))k++;if(k<10&&(!best||k<best[0]))best=[k,dx,dz]}
   if(!best)continue;const x=fa+.5+best[1]*(best[0]-.2),z=fb2+.5+best[2]*(best[0]-.2),H=WSY+54;
   const mt=new THREE.ShaderMaterial({uniforms:{uTime:U.uTime,uNight:U.uNight},transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform float uTime,uNight;varying vec2 vUv;${NOISE}
void main(){float x=vUv.x;float edge=smoothstep(0.,.2,x)*smoothstep(1.,.8,x);float s=noise(vec2(x*9.,vUv.y*26.+uTime*7.));float s2=noise(vec2(x*17.+3.,vUv.y*40.+uTime*10.));
 float a=(.4+.6*s)*(.6+.4*s2)*edge*smoothstep(0.,.3,vUv.y)*.85;vec3 c=mix(vec3(.55,.8,.9),vec3(1.),s*s2)*(1.-uNight*.5);gl_FragColor=vec4(pow(c,vec3(2.2)),a);\n#include <encodings_fragment>\n}`});
   for(let k=0;k<2;k++){const m=new THREE.Mesh(new THREE.PlaneGeometry(2.8,H),mt);m.position.set(x,WSY-H/2,z);m.rotation.y=k*Math.PI/2+Math.atan2(best[1],best[2]);m.renderOrder=4;m.name='waterfall';root.add(m)}
   for(let i=0;i<16;i++)mist.push([x,-50,z,R(),0,R(),R()])}
  if(mist.length)root.add(psys('mist','soft',mist,false))
 }catch(e){console.warn('waterfalls skipped',e)}}
function buildCloudPuffs(root){
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
 for(let i=0;i<22;i++){const x=30+R()*68,y=48+R()*34,r=16+R()*20,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)}
 const t=new THREE.CanvasTexture(c);if(THREE.sRGBEncoding!==undefined)t.encoding=THREE.sRGBEncoding;
 for(let i=0;i<14;i++){const a=R()*6.28,r=120+R()*130,s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,opacity:.5+R()*.35,fog:false}));
  s.scale.set(70+R()*70,34+R()*20,1);s.position.set(86+Math.cos(a)*r,-30+R()*60,46+Math.sin(a)*r);s.userData.sp=3+R()*5;root.add(s);sprites.push(s)}}
function spritesStep(dt){for(const s of sprites){s.position.x+=s.userData.sp*dt;if(s.position.x>86+300)s.position.x-=600}}

// ---------- scene assembly ----------
function initU(){const C=()=>({value:new THREE.Color()}),V3=()=>({value:new THREE.Vector3()});
 U={uTime:{value:0},uNight:{value:0},uWarm:{value:new THREE.Vector3(1,.62,.28)},uScale:{value:600},uL:{value:Array.from({length:64},()=>new THREE.Vector4())},
  sky:{uTop:C(),uMid:C(),uHor:C(),uLow:C(),uSun:V3(),uSunCol:C(),uMoon:V3(),uCL:C(),uCS:C()},
  water:{uSky:C(),uHorz:C(),uSun:V3(),uSunCol:C(),uShallow:C(),uDeep:C()},
  sea:{uLit:C(),uSh:C(),uHor:C(),uSd:{value:new THREE.Vector2()},uIsl:{value:[]}}}}
function buildScene(){
 if(THREE.ColorManagement)THREE.ColorManagement.enabled=true;
 ANISO=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 TGT=new THREE.Vector3(104,0,56);
 LIGHTS.length=GLOWS.length=SMOKES.length=SAKURA.length=MAPLES.length=BOATS.length=SNOWC.length=0;KOI=[];BIRDS=[];BOATM=[];sprites=[];
 initU();scene=new THREE.Scene();
 const t0=performance.now();
 buildVoxels();buildStructures();const nt=plantTrees();populate();
 const B=greedyMesh(),root=new THREE.Group();scene.add(root);let faces=0;
 for(const k in B){const m=B[k];if(!m.i.n)continue;const mesh=new THREE.Mesh(geoFrom(m),getMat(k));mesh.name=k;mesh.castShadow=k!=='fire';mesh.receiveShadow=true;root.add(mesh);faces+=m.i.n/6}
 const w=waterBuild();if(w)root.add(w);
 buildDecor().forEach(o=>root.add(o));
 buildPonds();buildKoi(root);buildLilies(root);buildBoats(root);buildBirds(root);buildFalls(root);buildFx().forEach(o=>root.add(o));
 LIGHTS.slice(0,64).forEach((l,i)=>U.uL.value[i].set(l[0],l[1],l[2],l[3]));
 skyMat=null;skyMesh=skyMeshBuild();scene.add(skyMesh);seaMesh=seaBuild();scene.add(seaMesh);buildCloudPuffs(scene);
 hemi=new THREE.HemisphereLight(0xffffff,0x444444,1);scene.add(hemi);amb=new THREE.AmbientLight(0xffffff,.3);scene.add(amb);
 sunL=new THREE.DirectionalLight(0xffffff,3);sunL.castShadow=true;const mob=/Mobi|Android/i.test(navigator.userAgent),ms=renderer.capabilities.maxTextureSize;
 sunL.shadow.mapSize.set(mob||ms<4096?2048:4096,mob||ms<4096?2048:4096);const sc=sunL.shadow.camera;sc.left=-132;sc.right=132;sc.top=132;sc.bottom=-132;sc.near=10;sc.far=560;
 sunL.shadow.bias=-.0004;sunL.shadow.normalBias=.85;sunL.target.position.set(86,-4,46);scene.add(sunL,sunL.target);
 sunDir=new THREE.Vector3();PC=PRESETS.map(mkPhase);CUR=mkPhase(PRESETS[0]);setPhase(0,false);stepTime(0,true);
 camera=new THREE.PerspectiveCamera(24,innerWidth/innerHeight,2,4000);
 az=tAz=Math.PI/4;el=tEl=.55;rad=250;tRad=174;cx=tcx=104;cz=tcz=56;camUpdate(0);
 console.info('voxel world: '+Math.round(performance.now()-t0)+' ms, '+faces+' quads, '+nt+' trees, '+LIGHTS.length+' lamps, '+KOI.length+' koi. '+BIOME_REPORT)}

// ---------- camera: orbit, pan, pinch, damping, idle drift ----------
function camUpdate(dt){const k=dt?1-Math.exp(-dt*9):1;az+=(tAz-az)*k;el+=(tEl-el)*k;rad+=(tRad-rad)*k;cx+=(tcx-cx)*k;cz+=(tcz-cz)*k;
 const ce=Math.cos(el);camera.position.set(cx+rad*ce*Math.cos(az),rad*Math.sin(el),cz+rad*ce*Math.sin(az));camera.lookAt(cx,0,cz)}
function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
let last=0,ema=.016,frames=0,pr=1;
function update(dt){T+=dt;U.uTime.value=T;
 if(performance.now()-lastInput>6000)tAz+=dt*.012;
 camUpdate(dt);stepTime(dt);koiStep(dt);birdStep();boatStep();spritesStep(dt);
 if(waterMat)waterMat.uniforms.uCam.value.copy(camera.position);
 skyMesh.position.copy(camera.position);U.uScale.value=renderer.domElement.height*.5*camera.projectionMatrix.elements[5]}
function tick(){raf=requestAnimationFrame(tick);const now=performance.now();const dt=last?Math.min(.05,(now-last)/1000):.016;last=now;
 ema=ema*.96+dt*.04;frames++;
 if(frames>150&&ema>.038&&pr>1){pr=Math.max(1,pr-.25);renderer.setPixelRatio(pr);renderer.setSize(innerWidth,innerHeight);ema=.02;frames=0}
 update(dt);renderer.render(scene,camera)}
function bindPointer(cv){
 const ps=new Map();let pinch=0;cv.style.touchAction='none';
 const pd=()=>{const a=[...ps.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ps.set(e.pointerId,{x:e.clientX,y:e.clientY});lastInput=performance.now();if(ps.size===2)pinch=pd()});
 cv.addEventListener('pointermove',e=>{const p=ps.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;lastInput=performance.now();
  if(ps.size===2){const d=pd();if(pinch>0)tRad=clamp(tRad*pinch/d,30,260);pinch=d;return}
  if((e.buttons&6)||e.shiftKey){const s=rad*.0017;tcx=clamp(tcx-Math.sin(tAz)*dx*s-Math.cos(tAz)*dy*s,-10,190);tcz=clamp(tcz+Math.cos(tAz)*dx*s-Math.sin(tAz)*dy*s,-14,120)}
  else{tAz-=dx*.008;tEl=clamp(tEl+dy*.006,.12,1.3)}});
 const up=e=>{ps.delete(e.pointerId);pinch=0};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',e=>{e.preventDefault();lastInput=performance.now();tRad=clamp(tRad*Math.exp(e.deltaY*.0011),30,260)},{passive:false});
 cv.addEventListener('dblclick',()=>{tAz=az+Math.atan2(Math.sin(Math.PI/4-az),Math.cos(Math.PI/4-az));tEl=.55;tRad=174;tcx=104;tcz=56;lastInput=performance.now()})}

// ---------- show / hide / start-screen wiring (unchanged behaviour) ----------
function show(){
 if(built){overlay.style.display='block';if(vig)vig.style.display='block';if(lbl)lbl.style.display='block';resize();last=0;if(!raf)tick();return}
 if(loading)return;loading=true;
 const cv=document.createElement('canvas');cv.id='voxel3d';cv.style.cssText='position:fixed;inset:0;z-index:10;display:block;background:#1d2440';
 const b=document.createElement('div');
 b.style.cssText='position:fixed;left:12px;bottom:12px;z-index:11;color:#f4ecd8;background:rgba(20,18,16,.72);border:1px solid rgba(244,236,216,.35);border-radius:6px;padding:7px 11px;font:12px/1.5 Georgia,serif;pointer-events:none;letter-spacing:.04em;display:flex;gap:10px;align-items:center';
 lblTxt=document.createElement('span');lblTxt.innerHTML='building the voxel world&hellip;';b.appendChild(lblTxt);
 vig=document.createElement('div');vig.style.cssText='position:fixed;inset:0;z-index:10;pointer-events:none;background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 58%,rgba(8,10,22,.38) 100%)';
 document.body.appendChild(cv);document.body.appendChild(vig);document.body.appendChild(b);overlay=cv;lbl=b;
 const fail=msg=>{console.error('voxel world:',msg);lblTxt.textContent='voxel world failed to build — see console';loading=false;
  if(renderer){try{renderer.dispose()}catch(e){}renderer=null}if(overlay)overlay.remove();if(vig)vig.remove();if(lbl)lbl.remove();overlay=null;lbl=null;vig=null;built=false};
 const start=()=>{
  try{
   THREE=window.THREE;
   renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
   pr=Math.min(2,devicePixelRatio||1);renderer.setPixelRatio(pr);
   renderer.outputEncoding=THREE.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
   renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
   renderer.setSize(innerWidth,innerHeight);
   buildScene();bindPointer(cv);built=true;loading=false;
   lblTxt.innerHTML='VOXEL WORLD · drag orbit · right-drag pan · wheel zoom · <b>N</b> time of day · <b>V</b> returns';
   todBtn=document.createElement('button');todBtn.style.cssText='pointer-events:auto;cursor:pointer;background:rgba(244,236,216,.14);color:#f4ecd8;border:1px solid rgba(244,236,216,.4);border-radius:4px;font:12px Georgia,serif;padding:2px 9px';
   todBtn.textContent=PRESETS[PHASE].n+' \u25B8';todBtn.addEventListener('click',()=>setPhase(PHASE+1));b.appendChild(todBtn);
   window.addEventListener('resize',resize);last=0;tick();
  }catch(err){fail(err)}};
 if(window.THREE){start();return}
 const sc=document.createElement('script');sc.src='js/three.min.js';sc.onload=start;
 sc.onerror=()=>{lblTxt.textContent='could not load js/three.min.js';loading=false;if(overlay)overlay.remove();if(vig)vig.remove();if(lbl)lbl.remove();overlay=null;lbl=null;vig=null};
 document.body.appendChild(sc)}
function hide(){cancelAnimationFrame(raf);raf=0;if(overlay)overlay.style.display='none';if(vig)vig.style.display='none';if(lbl)lbl.style.display='none'}
window.__voxDebug=function(){if(!scene)return null;const out=[];scene.traverse(o=>{if(o.isMesh||o.isPoints){const m=o.material;out.push({n:o.name||'-',mat:m.name||'anon',transparent:!!m.transparent,opacity:+(m.opacity??1).toFixed(2),depthWrite:m.depthWrite,depthTest:m.depthTest,side:m.side,faces:o.geometry.index?o.geometry.index.count/3:(o.geometry.attributes.position.count/3),col:m.color?m.color.getHexString():null})}});return out};
window.__voxInternals=()=>({scene,renderer,sunL,camera});
window.__voxPause=function(){cancelAnimationFrame(raf);raf=0};
window.__voxShot=function(sec){const n=Math.max(1,Math.round((sec||0)*10));for(let i=0;i<n;i++)update(.1);renderer.render(scene,camera);return renderer.domElement.toDataURL('image/png')};
window.__voxSet=function(o){o=o||{};if(o.phase!==undefined)setPhase(o.phase,!!o.snap);if(o.az!==undefined)tAz=az=o.az;if(o.el!==undefined)tEl=el=o.el;if(o.rad!==undefined)tRad=rad=o.rad;if(o.x!==undefined)tcx=cx=o.x;if(o.z!==undefined)tcz=cz=o.z;lastInput=performance.now()+1e7};
// ---------- start-screen choice: keep both worlds, let the player pick ----------
let viewChoice='2d';
try{viewChoice=localStorage.getItem('koi.view')==='3d'?'3d':'2d'}catch(e){}
const b2=document.getElementById('view2d'),b3=document.getElementById('view3d');
function syncChoice(){
 if(b2)b2.setAttribute('aria-pressed',viewChoice==='2d'?'true':'false');
 if(b3)b3.setAttribute('aria-pressed',viewChoice==='3d'?'true':'false')}
function setChoice(v,preview){
 viewChoice=v;
 try{localStorage.setItem('koi.view',v)}catch(e){}
 syncChoice();
 const on=!!(overlay&&overlay.style.display!=='none');
 if(v==='3d'){if(!on&&preview!==false)show()}else if(on)hide()}
if(b2)b2.addEventListener('click',()=>setChoice('2d',true));
if(b3)b3.addEventListener('click',()=>setChoice('3d',true));
syncChoice();
const sgo=document.getElementById('sgo');
if(sgo)sgo.addEventListener('click',()=>setTimeout(()=>setChoice(viewChoice,viewChoice==='2d'),0));
window.__voxel=function(){
 const on=!!(overlay&&overlay.style.display!=='none');
 viewChoice=on?'2d':'3d';
 try{localStorage.setItem('koi.view',viewChoice)}catch(e){}
 if(on)hide();else show();syncChoice()};
window.addEventListener('keydown',e=>{
 const t=e.target;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;
 const on=overlay&&overlay.style.display!=='none';
 if(e.code==='KeyV'&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();window.__voxel()}
 else if(e.code==='Escape'&&on)hide();
 else if(e.code==='KeyN'&&on&&built&&!e.ctrlKey&&!e.altKey&&!e.metaKey)setPhase(PHASE+1)});
})();
