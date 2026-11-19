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
TEXP.plank2=g=>{tint(g,'#a9794a',.3,41);for(let y=3;y<16;y+=4)rc(g,'rgba(40,24,10,.55)',0,y,16,1);rc(g,'rgba(40,24,10,.3)',7,0,1,16);speck(g,131)};
TEXP.plank3=g=>{tint(g,'#5a3b22',.3,42);for(let y=3;y<16;y+=5)rc(g,'rgba(20,10,4,.5)',0,y,16,1);speck(g,133)};
TEXP.rope=g=>{tint(g,'#c9a96a',.25,43);for(let i=0;i<16;i+=3)rc(g,'rgba(70,45,20,.55)',i,0,1,16);for(let y=0;y<16;y+=4)rc(g,'rgba(70,45,20,.4)',0,y,16,1)};
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
def('PLANK2','plank2');def('PLANK3','plank3');def('ROPE','rope',0,0,0);
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
  }}
function buildStructures(){buildBridges()}
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
// ---------- fine-voxel trees: half-block cells, rounded lobed canopies ----------
// Trees no longer live in the 1-block grid. Each one is sculpted in a local grid of 0.5-block cells,
// then only its exposed faces are emitted into two shared meshes (leaves sway, wood does not).
const FGX=44,FGY=76,FGZ=44,FC=22,FS=.5,FMAXQ=620000;
const FGRID=new Uint8Array(FGX*FGY*FGZ);
let FB=null,FP=null,FQ=0,FSPEC=[];
const FV=[.84,.93,1.02,1.12];
let FBND={i0:1e9,i1:-1,j0:1e9,j1:-1,k0:1e9,k1:-1};
function fresetB(){FBND={i0:1e9,i1:-1,j0:1e9,j1:-1,k0:1e9,k1:-1}}
function resetFine(){FB={leaf:{p:fb(),n:fb(),c:fb(),i:ib(),v:0},wood:{p:fb(),n:fb(),c:fb(),i:ib(),v:0}};FQ=0;fresetB()}
function initFinePal(){
 const L=a=>a.map(h=>{const c=new THREE.Color(h);return[c.r,c.g,c.b]});
 FP={oak:L(['#1b4a2c','#2c6a38','#3f8a45','#5fa957','#8cc96e']),
  sak:L(['#c25a82','#e07fa0','#f19bb8','#f9c2d4','#ffe6ee']),
  maple:L(['#8e2a1c','#b8402a','#d9701f','#eba02e','#f6cf55']),
  pine:L(['#0f2e22','#17422e','#215a3a','#2f7448','#4a9460']),
  wood:L(['#35241a','#493221','#5e432b','#74553a'])};
 FSPEC=L(['#ffffff','#e23a3a','#f5d04a','#ffeef3','#f2f6ff'])}
function fset(i,j,k,c){if(i<0||i>=FGX||j<0||j>=FGY||k<0||k>=FGZ)return;FGRID[(j*FGZ+k)*FGX+i]=c;const B=FBND;
 if(i<B.i0)B.i0=i;if(i>B.i1)B.i1=i;if(j<B.j0)B.j0=j;if(j>B.j1)B.j1=j;if(k<B.k0)B.k0=k;if(k>B.k1)B.k1=k}
function fcol(code,pal){
 if(code>=50)return FSPEC[code-50];if(code>=30)return FP.wood[code-30];
 const t=(code-1)>>2,m=FV[(code-1)&3],c=pal[t];return[c[0]*m,c[1]*m,c[2]*m]}
function fAdd(B,x,y,z,e1,e2,n,col,sh){
 const v=B.v,s=FS,ax=x+e1[0]*s,ay=y+e1[1]*s,az=z+e1[2]*s;
 const q=[x,y,z,ax,ay,az,ax+e2[0]*s,ay+e2[1]*s,az+e2[2]*s,x+e2[0]*s,y+e2[1]*s,z+e2[2]*s];
 for(let c=0;c<4;c++){fp(B.p,q[c*3]);fp(B.p,q[c*3+1]);fp(B.p,q[c*3+2]);fp(B.n,n[0]);fp(B.n,n[1]);fp(B.n,n[2]);fp(B.c,col[0]*sh);fp(B.c,col[1]*sh);fp(B.c,col[2]*sh)}
 fp(B.i,v);fp(B.i,v+1);fp(B.i,v+2);fp(B.i,v);fp(B.i,v+2);fp(B.i,v+3);B.v+=4;FQ++}
const X1_=[1,0,0],Y1_=[0,1,0],Z1_=[0,0,1];
function fEmit(pal,wx,wy,wz){
 const b=FBND;if(b.i1<0)return;const G=FGRID,SY=FGX*FGZ;
 for(let j=b.j0;j<=b.j1;j++)for(let k=b.k0;k<=b.k1;k++)for(let i=b.i0;i<=b.i1;i++){
  const idx=(j*FGZ+k)*FGX+i,c=G[idx];if(!c)continue;
  const B=(c>=30&&c<50)?FB.wood:FB.leaf,col=fcol(c,pal),x=wx+i*FS,y=wy+j*FS,z=wz+k*FS;
  if(i+1>=FGX||!G[idx+1])fAdd(B,x+FS,y,z,Y1_,Z1_,X1_,col,.96);
  if(i===0||!G[idx-1])fAdd(B,x,y,z,Z1_,Y1_,[-1,0,0],col,.96);
  if(j+1>=FGY||!G[idx+SY])fAdd(B,x,y+FS,z,Z1_,X1_,Y1_,col,1.1);
  if(j===0||!G[idx-SY])fAdd(B,x,y,z,X1_,Z1_,[0,-1,0],col,.68);
  if(k+1>=FGZ||!G[idx+FGX])fAdd(B,x,y,z+FS,X1_,Y1_,Z1_,col,.9);
  if(k===0||!G[idx-FGX])fAdd(B,x,y,z,Y1_,X1_,[0,0,-1],col,.9)}
 for(let j=b.j0;j<=b.j1;j++)for(let k=b.k0;k<=b.k1;k++)for(let i=b.i0;i<=b.i1;i++)G[(j*FGZ+k)*FGX+i]=0;
 fresetB()}
function fTrunk(Tj,r0,lean,sd){
 for(let j=0;j<=Tj;j++){const r=r0+(j<2?.8:j<4?.3:0)-.3*j/Math.max(1,Tj),lx=lean*j/Math.max(1,Tj),E=Math.ceil(r+Math.abs(lx))+1;
  for(let k=FC-E;k<=FC+E;k++)for(let i=FC-E;i<=FC+E;i++){const u=i+.5-FC-lx,w=k+.5-FC;if(Math.hypot(u,w)>r)continue;
   fset(i,j,k,30+clamp(((h2(i*7+j,k*3+sd)*2+(u<0?1.3:0))|0),0,3))}}}
function fFill(bl,cy,Rh,sd,kind){
 const E=Math.ceil(Rh*1.45);
 for(let j=Math.max(0,Math.floor(cy-Rh*1.1));j<=Math.min(FGY-1,Math.ceil(cy+Rh*1.2));j++)for(let k=FC-E;k<=FC+E;k++)for(let i=FC-E;i<=FC+E;i++){
  const u=i+.5-FC,w=k+.5-FC,v=j+.5-cy,bump=1+(h2(i*3+sd,j*5+k)-.5)*.2;let ins=false;
  for(let q=0;q<bl.length;q++){const b=bl[q],du=u-b[0],dv=(v-b[1])/b[4],dw=w-b[2];if(du*du+dv*dv+dw*dw<b[3]*b[3]*bump){ins=true;break}}
  if(!ins)continue;
  const hv=clamp((v/Rh+1.1)/2.2,0,1),n=vnz(i*.4+k*.17+sd,j*.45+k*.3),val=hv*.5+n*.6+(h2(i*13+sd,j*7+k*3)-.5)*.3;
  let code=1+clamp(Math.floor(val*4.3),0,4)*4+((h2(i*5+sd,k*9+j)*4)|0);
  const sp=h2(i*17+sd,j*11+k*5);
  if(kind==='oak'&&sp>.994)code=51;else if(kind==='sak'&&sp>.93)code=53;
  fset(i,j,k,code)}}
function treeParams(kind,s){
 if(kind==='pine'||kind==='pineS'){const Rb=6+((s*3)|0);return{Rb,H:18+((s*14)|0),rr:Math.ceil(Rb*.5)+1}}
 const Rh=kind==='sak'?8+((s*3)|0):kind==='maple'?7+((s*3)|0):8+((s*4)|0);return{Rh,rr:Math.ceil(Rh*.52)+1}}
function fOak(kind,ax,az,top,s,P){
 const sd=(ax*7+az*13)&255,rnd=q=>h2(sd+q*17,ax*3+az*5+q),Rh=P.Rh;
 const Th=Math.round(4+Rh*.45+rnd(1)*2),cy=Th+Math.round(Rh*.55);
 fTrunk(cy,1.15+Rh*.05,(rnd(2)-.5)*3,sd);
 for(let q=0;q<3;q++){const an=rnd(q+200)*6.283,L=Math.round(Rh*.55);for(let t=0;t<=L;t++){const f=t/L;
  fset(Math.round(FC+Math.cos(an)*f*Rh*.5-.5),Math.round(Th+f*Rh*.5),Math.round(FC+Math.sin(an)*f*Rh*.5-.5),31+(t&1))}}
 const sak=kind==='sak',bl=[[0,0,0,Rh*.74,sak?.74:.85]],n=(sak?10:7)+((s*3)|0);
 for(let q=0;q<n;q++){const an=q/n*6.283+rnd(q)*.6,d=Rh*(.42+.26*rnd(q+40)),r=Rh*(.34+.14*rnd(q+80));
  bl.push([Math.cos(an)*d,(rnd(q+20)-.4)*Rh*.35,Math.sin(an)*d,r,sak?.8:.88])}
 for(let q=0;q<3;q++){const an=rnd(q+120)*6.283;bl.push([Math.cos(an)*Rh*.25,Rh*(.4+.12*rnd(q+130)),Math.sin(an)*Rh*.25,Rh*.36,.9])}
 for(let q=0;q<9;q++){const an=rnd(q+150)*6.283,d=Rh*(.7+.18*rnd(q+160));bl.push([Math.cos(an)*d,(rnd(q+170)-.55)*Rh*.5,Math.sin(an)*d,Rh*(.15+.1*rnd(q+180)),1])}
 fFill(bl,cy,Rh,sd,kind);
 const tp=top+1+cy*FS+1.5;
 if(kind==='sak')SAKURA.push([ax+.5,tp,az+.5]);else if(kind==='maple')MAPLES.push([ax+.5,tp,az+.5])}
function fPine(ax,az,top,s,snowy,P){
 const sd=(ax*7+az*13)&255,Rb=P.Rb,H=P.H,j0=3;
 fTrunk(Math.round(H*.8),1.25,0,sd);
 for(let j=j0;j<=H;j++){const f=(j-j0)/(H-j0),tier=(j-j0)%5,r=Rb*(1-f*.95)*(.6+.4*(1-tier/5))+(h2(j,sd)-.5)*.6;if(r<.4)continue;
  const E=Math.ceil(r)+2;
  for(let k=FC-E;k<=FC+E;k++)for(let i=FC-E;i<=FC+E;i++){const u=i+.5-FC,w=k+.5-FC,d=Math.hypot(u,w),an=Math.atan2(w,u),lim=r*(1+.14*Math.sin(an*5+j*1.7+sd));if(d>lim)continue;
   const n=vnz(i*.5+k*.2+sd,j*.5+k*.3),val=.22+f*.25+n*.6+(d/lim)*.16;
   fset(i,j,k,1+clamp(Math.floor(val*4.5),0,4)*4+((h2(i*5+sd,k*9+j)*4)|0))}}
 for(let t=0;t<4;t++){const c=t<2?[[FC-1,FC-1],[FC,FC-1],[FC-1,FC],[FC,FC]]:[[FC,FC]];for(const q of c)fset(q[0],H+t,q[1],1+4*4+((t+sd)&3))}
 if(snowy){const b=FBND;for(let j=b.j0;j<=Math.min(b.j1,FGY-2);j++)for(let k=b.k0;k<=b.k1;k++)for(let i=b.i0;i<=b.i1;i++){
  const idx=(j*FGZ+k)*FGX+i,c=FGRID[idx];if(c&&c<30&&!FGRID[idx+FGX*FGZ]&&h2(i*3+sd,k*5+j)>.25)FGRID[idx]=54}}}
function fineTree(kind,ax,az,top,s,P){
 fresetB();let pal;
 if(kind==='pine'||kind==='pineS'){fPine(ax,az,top,s,kind==='pineS',P);pal=FP.pine}
 else{fOak(kind,ax,az,top,s,P);pal=kind==='sak'?FP.sak:kind==='maple'?FP.maple:FP.oak}
 fEmit(pal,ax+.5-FC*FS,top+1-FS,az+.5-FC*FS)}
function geoFine(m){const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(m.p.a.slice(0,m.p.n),3));g.setAttribute('normal',new THREE.BufferAttribute(m.n.a.slice(0,m.n.n),3));
 g.setAttribute('color',new THREE.BufferAttribute(m.c.a.slice(0,m.c.n),3));g.setIndex(new THREE.BufferAttribute(m.i.a.slice(0,m.i.n),1));g.computeBoundingSphere();return g}
function buildFineMeshes(root){
 for(const[k,B,sway]of[['leaf',FB.leaf,1],['wood',FB.wood,0]]){if(!B.i.n)continue;
  const m=new THREE.MeshLambertMaterial({vertexColors:true});m.shadowSide=THREE.FrontSide;m.name='fine_'+k;patchLit(m,sway);
  const mesh=new THREE.Mesh(geoFine(B),m);mesh.name='fineTrees_'+k;mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh)}}

// ---------- bridges: plank deck, curb rope, posts with lanterns, beams underneath ----------
const BRIDGES=[
 {ax:'a',s0:62.3,s1:83.7,f:19.5,w:1,sag:3,pal:0},   // the long rope bridge between the village and the sakura isle
 {ax:'a',s0:118.4,s1:124.0,f:30,w:1,sag:1,pal:0},    // the short crossing to the observatory rock
 {ax:'b',s0:22.5,s1:26.5,f:33.5,w:1,arch:3,pal:0},   // plank arch over the village stream
 {ax:'b',s0:27.0,s1:36.0,f:104,w:1,arch:4,pal:1},
 {ax:'b',s0:43.4,s1:53.0,f:104.3,w:1,sag:1,pal:0},
 {ax:'b',s0:33.6,s1:43.4,f:136.5,w:1,sag:2,pal:0}];   // red arch over the sakura pond
function bTop(ax,f,c,st){let a=c;for(let q=0;q<10;q++,a+=st){const t=ax==='a'?colTop(a,f):colTop(f,a);if(t!==null)return t}return 0}
function buildBridge(d){
 const ax=d.ax,cf=Math.floor(d.f),w=d.w,s0=d.s0,s1=d.s1,L=s1-s0,c0=Math.floor(s0),c1=Math.ceil(s1)-1;
 const yA=bTop(ax,cf,c0,-1),yB=bTop(ax,cf,c1,1),red=d.pal===1,RAIL=red?BL.TORII:BL.ROPE,POST=red?BL.TORII:BL.WOOD;
 const P=(c,k)=>ax==='a'?[c,cf+k]:[cf+k,c];
 if(ax==='a')reserve(c0-2,cf-w-3,c1+2,cf+w+3);else reserve(cf-w-3,c0-2,cf+w+3,c1+2);
 let lamp=0;
 for(let c=c0;c<=c1;c++){
  const t=clamp((c+.5-s0)/L,0,1),y=Math.round(lerp(yA,yB,t))-Math.round((d.sag||0)*4*t*(1-t))+Math.round((d.arch||0)*Math.sin(Math.PI*t));
  const post=((c-c0)%3===0)||c===c1;
  for(let k=-w;k<=w;k++){const q=P(c,k),a=q[0],b=q[1],edge=Math.abs(k)===w;
   setV(a,y,b,edge?BL.PLANK3:((c&1)?BL.PLANK:BL.PLANK2));
   if(edge||k===0||((c-c0)%4===0))putIfEmpty(a,y-1,b,BL.PLANK3);
   if(!edge)continue;
   if(post){for(let h=1;h<=3;h++)setV(a,y+h,b,POST);
    const lc=lamp++;
    if(lc%2===0){setV(a,y+4,b,BL.LANTERN);if(lc%4===0)lightAt(a+.5,y+4.5,b+.5,10,2.6,0);else GLOWS.push([a+.5,y+4.5,b+.5,2.4,0])}
    else setV(a,y+4,b,BL.PLANK3)}
   else{setV(a,y+1,b,RAIL);setV(a,y+3,b,RAIL)}}}}
function buildBridges(){for(const d of BRIDGES)buildBridge(d)}

function plantTrees(){
 if(!FP)initFinePal();resetFine();
 const placed=[],STEP=2;let count=0;
 const road=(x,z)=>{const t=colTop(x,z);if(t===null)return false;const id=VOX[VI(x,t,z)];return id===BL.COBBLE||id===BL.FARM||id===BL.SAND||id===BL.PAVER||id===BL.GRAVEL};
 for(let a=X0;a<=X1;a+=STEP)for(let b=Z0;b<=Z1;b+=STEP){
  if(FQ>FMAXQ)break;
  const ax=a+Math.round((h2(a,b*3+11)-.5)*STEP*.9),az=b+Math.round((h2(a*5+1,b+7)-.5)*STEP*.9);
  if(!inb(ax,az))continue;const ci=CI(ax,az),key=KEY[ci];if(!key||LAKE[ci]||RES[ci])continue;
  const top=colTop(ax,az);if(top===null)continue;
  if(road(ax,az)||road(ax+2,az)||road(ax-2,az)||road(ax,az+2)||road(ax,az-2))continue;
  if(!(LAND(ax+2,az)&&LAND(ax-2,az)&&LAND(ax,az+2)&&LAND(ax,az-2)))continue;
  let bad=false;
  for(let dx=-2;dx<=2&&!bad;dx++)for(let dz=-2;dz<=2;dz++){const q=ax+dx,r=az+dz;if(inb(q,r)&&(RES[CI(q,r)]||(Math.abs(dx)<=1&&Math.abs(dz)<=1&&LAKE[CI(q,r)]))){bad=true;break}}
  if(bad)continue;
  const bio=BIO[ci],cl=vnz(a*.045+key*3,b*.045+2);
  let dens=bio===3?.55:bio===2?.42:bio===4?.34:bio===5?.3:.26;
  if(key===1&&ax>4&&ax<38&&az>0&&az<40)dens*=.4;
  dens*=(.2+1.5*sm(.25,.65,cl))*5;
  if(h2(a*13+7,b*17+3)>dens)continue;
  const s=h2(ax*7,az*13),r=h2(ax+5,az*3+1);
  let kind;
  if(bio===3)kind=r<.85?'pineS':'oak';
  else if(bio===5)kind=r<.7?'pine':'oak';
  else if(bio===4)kind=r<.72?'sak':'oak';
  else if(bio===2)kind=r<.8?'maple':'pine';
  else if(key===5)kind=r<.3?'maple':'oak';
  else kind=r<.1?'sak':r<.2?'maple':'oak';
  const pine=kind==='pine'||kind==='pineS',md=(pine?4.2:5.6)+h2(ax*3,az*5)*2.4;
  let close=false;for(const q of placed){const d=Math.hypot(q[0]-ax,q[1]-az);if(d<(q[2]+md)*.5){close=true;break}}
  if(close)continue;
  placed.push([ax,az,md]);
  fineTree(kind,ax,az,top,s,treeParams(kind,s));count++}
 return count}
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
      if(a[0]===a[1]&&a[3]===a[2]&&!(DSP&&(wa!==1||BD[(key&1023)>>2].tn===3)))while(uu+ww<nu&&ww<6&&row[uu+ww]===key)ww++;
      const fid=key&1023,id=fid>>2,oo=fid&3,bd=BD[id],mk=oo===0?bd.t:oo===1?bd.b:bd.s,m=get(mk);
      const plane=s+(sgn>0?1:0),u0=LO[ua]+uu,v0=LO[va]+vv;nr[0]=nr[1]=nr[2]=0;nr[wa]=sgn;
      const CU=[u0,u0+ww,u0+ww,u0],CV=[v0,v0,v0+1,v0+1];let dd=false;
      for(let c=0;c<4;c++){cc[wa]=plane;cc[ua]=CU[c];cc[va]=CV[c];const Pq=PPV[c];Pq[0]=cc[0];Pq[1]=cc[1];Pq[2]=cc[2];if(DSP&&dspV(cc[0],cc[1],cc[2],DO)){Pq[0]+=DO[0];Pq[1]+=DO[1];Pq[2]+=DO[2];dd=true}}
      let n0=nr[0],n1=nr[1],n2=nr[2];
      if(dd){const ex=PPV[2][0]-PPV[0][0],ey=PPV[2][1]-PPV[0][1],ez=PPV[2][2]-PPV[0][2],fx=PPV[3][0]-PPV[1][0],fy=PPV[3][1]-PPV[1][1],fz=PPV[3][2]-PPV[1][2];let X=ey*fz-ez*fy,Y=ez*fx-ex*fz,Z=ex*fy-ey*fx;const l=Math.hypot(X,Y,Z)||1;X/=l;Y/=l;Z/=l;if(X*nr[0]+Y*nr[1]+Z*nr[2]<0){X=-X;Y=-Y;Z=-Z}n0=X;n1=Y;n2=Z}
      for(let c=0;c<4;c++){cc[wa]=plane;cc[ua]=CU[c];cc[va]=CV[c];
       fp(m.p,PPV[c][0]);fp(m.p,PPV[c][1]);fp(m.p,PPV[c][2]);fp(m.n,n0);fp(m.n,n1);fp(m.n,n2);
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
 if(GLOWM)GLOWM.color.setScalar(.5+1.5*CUR.night);if(dayHud)dayHud.value=CUR.night}
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

// ================= v3 SCULPT KIT =================
// Props, buildings and creatures are no longer made of 1-block cubes. Each one is sculpted in a scratch grid of
// 1/4, 1/8 or 1/2-block cells out of spheres, cylinders, capsules, tori, curved roofs and rounded boxes, then
// only its exposed faces are emitted, with baked ambient occlusion and smoothed normals so the silhouettes read round.
const MPD={
 plaster:'#ece4cc',plaster2:'#dccfa6',sage:'#c4d2bd',rose:'#dcbcb2',sun:'#ecc77a',terra:'#b6523f',blueW:'#5d7ea6',
 stone:'#8a867b',stoneL:'#a6a295',stoneD:'#615e57',stoneW:'#a99f88',slab:'#b8b2a0',brick:'#9c4c3a',brickD:'#74382c',
 white:'#f2eee2',marble:'#ebe7dc',granite:'#6c6d76',
 oak:'#8c6439',oakL:'#b78d55',oakD:'#5b3e25',timber:'#4a3322',pineW:'#a97a4b',dark:'#2c2019',bamboo:'#93b04c',bambooD:'#6d8c3a',rope:'#c9a96a',
 rA:'#9a4636',rAL:'#bc5f44',rB:'#4a647f',rBL:'#6081a0',rC:'#527050',rCL:'#6c8f64',rD:'#6e2d3c',rDL:'#8c4458',rE:'#3a3f4c',rEL:'#585e70',rF:'#b0823a',rFL:'#cfa254',thatch:'#cdae5e',thatchD:'#a98a40',
 copper:'#4f9d8c',copperD:'#3a7a6c',gold:'#d8b04c',goldL:'#f6dc86',
 leaf:'#3f8a45',leafL:'#62ae58',leafD:'#1d4d2e',hedge:'#2f6d3a',hedgeL:'#47904a',pink:'#f2a0bc',pinkD:'#c85f86',pinkL:'#ffe0ea',orange:'#dc7420',redL:'#bb4128',yellow:'#ebc643',
 red:'#c4382b',redD:'#8c281f',blue:'#3f5f8a',green:'#3f7343',ochre:'#caa03e',purple:'#6f456a',teal:'#33716d',black:'#242027',cream:'#f0e4c2',tang:'#e27c2a',pumpkin:'#e5801c',sunY:'#f2c322',brown:'#6a4528',
 iron:'#484b52',ironL:'#6d717a',brass:'#cba24c',steel:'#a1a9b3',rust:'#8f4c2c',rubber:'#2b2b30',
 skin:'#dba67e',skinD:'#bb815d',hair:'#3a2a20',hairB:'#a9792f',hairG:'#cbc3b6',hairR:'#8f3b21',
 wool:'#f1ede0',woolD:'#c8c3b2',fur:'#c69b5b',furD:'#8d6a3a',furW:'#eae4d4',deer:'#a9784b',deerL:'#dcbb92',
 aqua:'#58c0cf',waterL:'#bfeaf2',paper:'#f0e7cf',moss:'#5f7f5b',soil:'#6f4e30',soilD:'#4c351f',sand:'#dccfae',cloth:'#c8c2b4',
 cstone:'#8c9099',cstoneL:'#aab0b9',cstoneD:'#686c76',vermil:'#c8341f',vermilD:'#8f2416',lacquer:'#27211f',sky:'#8fc4ea',shade:'#13100e'
};
const GD={gWin:'#ffb64e',gWin2:'#ffdc98',gLamp:'#ffb347',gFire:'#ff8226',gFireL:'#ffd27a',gStar:'#fff2c0',gBlue:'#8fd0ff',gRed:'#ff5a3a',gGreen:'#7dffb0'};
const K={},MPN=Object.keys(MPD),GDN=Object.keys(GD);MPN.forEach((n,i)=>K[n]=i+1);GDN.forEach((n,i)=>K[n]=128+i);
let MPC=null;
function initMP(){MPC=new Array(256);MPN.forEach((n,i)=>{const c=new THREE.Color(MPD[n]);MPC[i+1]=[c.r,c.g,c.b]});GDN.forEach((n,i)=>{const c=new THREE.Color(GD[n]);MPC[128+i]=[c.r,c.g,c.b]})}
const SN=232,SGD=new Uint8Array(SN*SN*SN),SCX=SN>>1,SCY=36,SCZ=SN>>1;
let sRes=.25,sInv=4,sRot=0,sSm=.6,sSeed=1,sBB=[1e9,-1,1e9,-1,1e9,-1];
const n3=(x,y,z)=>vnz(x+y*.53+sSeed*3.1,z-y*.41+sSeed*1.7);
function sBegin(res,rot,sm,seed){sRes=res;sInv=1/res;sRot=rot|0;sSm=sm===undefined?.55:sm;sSeed=seed|0;sBB=[1e9,-1,1e9,-1,1e9,-1]}
const idf=id=>typeof id==='function'?id:()=>id;
function sFill(x0,y0,z0,x1,y1,z1,f){
 if(typeof f!=='function'){const v=f;f=()=>v}
 const R=sRot;let gx0=1e9,gx1=-1e9,gz0=1e9,gz1=-1e9;
 for(const q of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]]){const x=q[0],z=q[1],a=R===0?x:R===1?-z:R===2?-x:z,b=R===0?z:R===1?x:R===2?-z:-x;gx0=Math.min(gx0,a);gx1=Math.max(gx1,a);gz0=Math.min(gz0,b);gz1=Math.max(gz1,b)}
 const i0=Math.max(2,Math.floor(gx0*sInv)+SCX),i1=Math.min(SN-3,Math.ceil(gx1*sInv)+SCX),k0=Math.max(2,Math.floor(gz0*sInv)+SCZ),k1=Math.min(SN-3,Math.ceil(gz1*sInv)+SCZ),j0=Math.max(2,Math.floor(y0*sInv)+SCY),j1=Math.min(SN-3,Math.ceil(y1*sInv)+SCY);
 const B=sBB;
 for(let j=j0;j<=j1;j++){const ly=(j-SCY+.5)*sRes;for(let k=k0;k<=k1;k++){const gz=(k-SCZ+.5)*sRes,row=(j*SN+k)*SN;for(let i=i0;i<=i1;i++){const gx=(i-SCX+.5)*sRes;
  const lx=R===0?gx:R===1?gz:R===2?-gx:-gz,lz=R===0?gz:R===1?-gx:R===2?-gz:gx;
  const id=f(lx,ly,lz);if(id){SGD[row+i]=id<0?0:id;if(i<B[0])B[0]=i;if(i>B[1])B[1]=i;if(j<B[2])B[2]=j;if(j>B[3])B[3]=j;if(k<B[4])B[4]=k;if(k>B[5])B[5]=k}}}}}
function sBox(x0,y0,z0,x1,y1,z1,id,rad,rough){const f=idf(id),cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2,hx=(x1-x0)/2,hy=(y1-y0)/2,hz=(z1-z0)/2,r=rad||0,rg=rough||0;
 sFill(x0,y0,z0,x1,y1,z1,(x,y,z)=>{if(r){const dx=Math.max(Math.abs(x-cx)-(hx-r),0),dy=Math.max(Math.abs(y-cy)-(hy-r),0),dz=Math.max(Math.abs(z-cz)-(hz-r),0);let d=Math.sqrt(dx*dx+dy*dy+dz*dz);if(rg)d+=(n3(x*3,y*3,z*3)-.5)*rg;if(d>r)return 0}
  else if(rg&&((n3(x*3,y*3,z*3)-.5)*rg>Math.min(hx-Math.abs(x-cx),hy-Math.abs(y-cy),hz-Math.abs(z-cz))))return 0;return f(x,y,z,0)})}
function sEll(cx,cy,cz,rx,ry,rz,id,rough){const f=idf(id),r=rough||0;
 sFill(cx-rx,cy-ry,cz-rz,cx+rx,cy+ry,cz+rz,(x,y,z)=>{const a=(x-cx)/rx,b=(y-cy)/ry,c=(z-cz)/rz;let d=a*a+b*b+c*c;if(r)d+=(n3(x*3.3,y*3.3,z*3.3)-.5)*r;return d<=1?f(x,y,z,Math.sqrt(d)):0})}
function sCyl(cx,cz,y0,y1,r0,r1,id,o){o=o||{};const f=idf(id),rr=Math.max(r0,r1)*(1+(o.bulge||0));
 sFill(cx-rr,y0,cz-rr,cx+rr,y1,cz+rr,(x,y,z)=>{const t=(y-y0)/(y1-y0||1),r=(r0+(r1-r0)*t)*(1+(o.bulge||0)*Math.sin(Math.PI*t)),d=Math.hypot(x-cx,z-cz);if(d>r)return 0;if(o.hole&&d<r*o.hole)return 0;return f(x,y,z,d/r)})}
function sCap(x0,y0,z0,x1,y1,z1,r0,r1,id){const f=idf(id),dx=x1-x0,dy=y1-y0,dz=z1-z0,L2=dx*dx+dy*dy+dz*dz||1,rm=Math.max(r0,r1);
 sFill(Math.min(x0,x1)-rm,Math.min(y0,y1)-rm,Math.min(z0,z1)-rm,Math.max(x0,x1)+rm,Math.max(y0,y1)+rm,Math.max(z0,z1)+rm,(x,y,z)=>{let t=((x-x0)*dx+(y-y0)*dy+(z-z0)*dz)/L2;t=t<0?0:t>1?1:t;const px=x0+dx*t-x,py=y0+dy*t-y,pz=z0+dz*t-z,r=r0+(r1-r0)*t;return px*px+py*py+pz*pz<=r*r?f(x,y,z,t):0})}
function sTor(cx,cy,cz,R,r,ax,id){const f=idf(id),m=R+r;
 sFill(cx-m,cy-m,cz-m,cx+m,cy+m,cz+m,(x,y,z)=>{const a=x-cx,b=y-cy,c=z-cz;let q,h;if(ax==='y'){q=Math.hypot(a,c);h=b}else if(ax==='x'){q=Math.hypot(b,c);h=a}else{q=Math.hypot(a,b);h=c}
  const d=Math.hypot(q-R,h);return d<=r?f(x,y,z,d/r):0})}
// a gable roof sheet, ridge along local x. eave line z0..z1 at y0, ridge h above. ov: overhang, th: thickness, cur: eave kick
function sGable(x0,x1,z0,z1,y0,h,id,o){o=o||{};const ov=o.ov===undefined?.35:o.ov,th=o.th||.3,zc=(z0+z1)/2,hw=(z1-z0)/2+ov,cur=o.cur||0,f=idf(id),ovx=o.ovx===undefined?ov:o.ovx;
 sFill(x0-ovx,y0-.6,z0-ov,x1+ovx,y0+h+cur+.8,z1+ov,(x,y,z)=>{const u=Math.abs(z-zc)/hw;if(u>1)return 0;const top=y0+h*(1-u)+cur*u*u*u;if(y>top||y<top-th)return 0;return f(x,y,z,u)})}
// a pyramid / hip roof sheet; cur>1 gives the concave swept eaves of a temple roof
function sPyr(cx,cz,y0,rx,rz,h,id,o){o=o||{};const f=idf(id),th=o.th||.32,k=o.cur||1,lift=o.lift||0,sq=o.round?0:1;
 sFill(cx-rx,y0-.2,cz-rz,cx+rx,y0+h+lift+.3,cz+rz,(x,y,z)=>{const a=Math.abs(x-cx)/rx,b=Math.abs(z-cz)/rz,s=sq?Math.max(a,b):Math.hypot(a,b);if(s>1)return 0;const top=y0+lift*s*s+h*Math.pow(1-s,k);if(y>top||y<top-th)return 0;return f(x,y,z,s)})}
function sSet(x,y,z,id){sFill(x-sRes*.5,y-sRes*.5,z-sRes*.5,x+sRes*.5,y+sRes*.5,z+sRes*.5,()=>id)}
const hsh=(a,b)=>h2(a|0,b|0);
// ---------- emit: exposed faces, baked AO + smoothed normals ----------
function mkB(){const s=()=>({p:fb(),n:fb(),c:fb(),i:ib(),v:0});return{solid:s(),glow:s(),sway:s()}}
function sFlush(B,wx,wy,wz,sw,keep){
 const b=sBB;if(b[1]<0)return 0;let q=0;const R=sRes,S=SGD;
 const oc=(i,j,k)=>S[(j*SN+k)*SN+i]?1:0;
 const FD=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],LT=[.97,.97,1.05,.7,.92,.92];
 for(let j=b[2];j<=b[3];j++)for(let k=b[4];k<=b[5];k++)for(let i=b[0];i<=b[1];i++){
  const id=S[(j*SN+k)*SN+i];if(!id)continue;
  const T=id>=128?B.glow:(sw?B.sway:B.solid),pc=MPC[id]||MPC[1];
  const nz=id>=128?1:.88+.24*hsh(i*7+j*13+sSeed,k*5+j*3+sSeed*3);
  for(let f=0;f<6;f++){const d=FD[f],ni=i+d[0],nj=j+d[1],nk=k+d[2];if(S[(nj*SN+nk)*SN+ni])continue;
   let ao=1;
   if(id<128){let cnt=0;const t1=d[0]?[0,1,0]:[1,0,0],t2=d[2]?[0,1,0]:[0,0,1];
    for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){if(!a&&!c)continue;
     if(S[((nj+a*t1[1]+c*t2[1])*SN+(nk+a*t1[2]+c*t2[2]))*SN+(ni+a*t1[0]+c*t2[0])])cnt++}
    ao=1-.085*cnt}
   // normal: face normal blended with the gradient of the local occupancy, so edges and curves shade round
   let nx=d[0],ny=d[1],nzz=d[2];
   if(sSm>0&&id<128){let gx=0,gy=0,gz=0;
    for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){
     gx+=oc(i-1,j+a,k+c)+oc(i-2,j+a,k+c)-oc(i+1,j+a,k+c)-oc(i+2,j+a,k+c);
     gy+=oc(i+a,j-1,k+c)+oc(i+a,j-2,k+c)-oc(i+a,j+1,k+c)-oc(i+a,j+2,k+c);
     gz+=oc(i+a,j+c,k-1)+oc(i+a,j+c,k-2)-oc(i+a,j+c,k+1)-oc(i+a,j+c,k+2)}
    const m=sSm*1.5/18;nx+=gx*m;ny+=gy*m;nzz+=gz*m;const l=Math.hypot(nx,ny,nzz)||1;nx/=l;ny/=l;nzz/=l}
   const lt=id>=128?1:LT[f]*ao*nz;
   const x=wx+(i-SCX)*R,y=wy+(j-SCY)*R,z=wz+(k-SCZ)*R;
   if(f===0)qAdd(T,x+R,y,z,0,1,0,0,0,1,R,nx,ny,nzz,pc,lt);
   else if(f===1)qAdd(T,x,y,z,0,0,1,0,1,0,R,nx,ny,nzz,pc,lt);
   else if(f===2)qAdd(T,x,y+R,z,0,0,1,1,0,0,R,nx,ny,nzz,pc,lt);
   else if(f===3)qAdd(T,x,y,z,1,0,0,0,0,1,R,nx,ny,nzz,pc,lt);
   else if(f===4)qAdd(T,x,y,z+R,1,0,0,0,1,0,R,nx,ny,nzz,pc,lt);
   else qAdd(T,x,y,z,0,1,0,1,0,0,R,nx,ny,nzz,pc,lt);
   q++}}
 if(!keep)sClear();
 return q}
function sClear(){const b=sBB;if(b[1]<0)return;for(let j=b[2];j<=b[3];j++)for(let k=b[4];k<=b[5];k++){const r=(j*SN+k)*SN;SGD.fill(0,r+b[0],r+b[1]+1)}sBB=[1e9,-1,1e9,-1,1e9,-1]}
function qAdd(S,x,y,z,e1x,e1y,e1z,e2x,e2y,e2z,s,nx,ny,nz,col,lt){
 const v=S.v,P=[x,y,z,x+e1x*s,y+e1y*s,z+e1z*s,x+(e1x+e2x)*s,y+(e1y+e2y)*s,z+(e1z+e2z)*s,x+e2x*s,y+e2y*s,z+e2z*s];
 const r=col[0]*lt,g=col[1]*lt,b=col[2]*lt;
 for(let c=0;c<4;c++){fp(S.p,P[c*3]);fp(S.p,P[c*3+1]);fp(S.p,P[c*3+2]);fp(S.n,nx);fp(S.n,ny);fp(S.n,nz);fp(S.c,r);fp(S.c,g);fp(S.c,b)}
 fp(S.i,v);fp(S.i,v+1);fp(S.i,v+2);fp(S.i,v);fp(S.i,v+2);fp(S.i,v+3);S.v+=4;QCOUNT++}
let QCOUNT=0;

// ================= v3 PROPS =================
let PB=null;
const rr_=(s,i)=>h2((s|0)*131+i*17,i*7+(s|0));
let GYF=null;
function gY(fi,fj){if(GYF&&GYF(fi,fj)!==null)return GYF(fi,fj);const t=colTop(Math.floor(fi+.5),Math.floor(fj+.5));return t===null?null:t+1}
function rsv(fi,fj,r,r2){r2=r2===undefined?r:r2;reserve(Math.floor(fi+.5-r),Math.floor(fj+.5-r2),Math.ceil(fi+.5+r),Math.ceil(fj+.5+r2))}
// place a sculpted object: res = cell size in blocks, fn builds it in local coords (y=0 is the ground)
function mk3(fi,fj,res,fn,o){o=o||{};const g=o.y!==undefined?o.y:gY(fi,fj);if(g===null)return false;
 sBegin(res,o.rot||0,o.sm,o.seed!==undefined?o.seed:((fi*7.3+fj*13.1)|0));fn(sSeed);
 sFlush(o.B||PB,fi+.5+(o.dx||0),g+(o.dy||0),fj+.5+(o.dz||0),!!o.sw);if(o.rs)rsv(fi,fj,o.rs,o.rs2);return true}
const PR={};
const pickc=(s,i,a)=>a[Math.floor(rr_(s,i)*a.length)%a.length];
// ---- the little things: drums, tyres, crates, bales, logs ----
PR.barrel=s=>{const hp=y=>Math.abs(y-.17)<.06||Math.abs(y-.5)<.06||Math.abs(y-.83)<.06;
 sCyl(0,0,0,1,.42,.42,(x,y,z)=>y>.97?K.oakL:hp(y)?K.iron:(Math.floor((Math.atan2(z,x)+3.2)*5.2)%2?K.oak:K.oakL),{bulge:.13});
 if(s%3===0)sCyl(0,0,.99,1.01,.3,.3,K.oakD)};
PR.drum=s=>{ // an oil drum with ridges
 const c=pickc(s,1,[K.blue,K.red,K.green,K.iron]);sCyl(0,0,0,1.05,.4,.4,(x,y,z)=>(Math.abs(y-.3)<.05||Math.abs(y-.7)<.05)?K.ironL:y>1?K.ironL:c)};
PR.tyres=s=>{const R=.38,r=.17;for(let q=0;q<3;q++)sTor(q===1?.03:0,r+q*r*2-.02*q,q===1?-.02:0,R,r,'y',(x,y,z,d)=>d>.78?K.black:K.rubber);
 sTor(1.05,R+r,.2,R,r,'z',(x,y,z,d)=>d>.78?K.black:K.rubber);sCap(1.05,R+r,.1,1.05,R+r,.3,.2,.2,K.ironL)};
PR.crate=s=>{const e=.44;sBox(-e,0,-e,e,.88,e,(x,y,z)=>{const ex=Math.abs(x)>.36,ez=Math.abs(z)>.36,ey=y<.08||y>.8;return((ex&&ez)||(ex&&ey)||(ez&&ey))?K.oakD:(Math.floor(y*9)%3===0?K.oak:K.oakL)},.03);
 if(s%2)sBox(-.4,.88,-.4,.4,1.7,.4,(x,y,z)=>(Math.abs(x)>.32&&Math.abs(z)>.32)||y>1.62||y<.96?K.oakD:K.oakL,.03)};
PR.bale=s=>{sCap(-.5,.55,0,.5,.55,0,.55,.55,(x,y,z,t)=>(t<.05||t>.95)?K.thatchD:(Math.abs(Math.hypot(y-.55,z)-.3)<.04?K.thatchD:K.thatch))};
PR.hay=s=>{sBox(-.62,0,-.36,.62,.72,.36,(x,y,z)=>(Math.abs(x+.22)<.045||Math.abs(x-.22)<.045)?K.rope:(hsh(Math.floor(x*9),Math.floor(y*9)+s)>.6?K.thatchD:K.thatch),.08,.1)};
PR.haystack=s=>{sCyl(0,0,0,.9,1.15,1.05,K.thatchD);sEll(0,.9,0,1.05,1.3,1.05,(x,y,z)=>hsh(Math.floor(x*7),Math.floor(y*7))>.55?K.thatch:K.thatchD,.25)};
PR.woodpile=s=>{const n=4;for(let r=0;r<3;r++)for(let c=0;c<n-(r&1);c++){const x=(c-(n-1-(r&1))/2)*.36,y=.17+r*.3;
  sCap(x,y,-.55,x,y,.55,.17,.17,(X,Y,Z,t)=>(t<.05||t>.95)?(Math.abs(Math.hypot(X-x,Y-y)-.09)<.03?K.oakD:K.oakL):(hsh(c*5+r,Math.floor(Z*6))>.5?K.oakD:K.brown))}};
PR.logS=s=>{const L=1.2+rr_(s,1)*.8;sCap(-L/2,.3,0,L/2,.3,.15,.3,.3,(x,y,z,t)=>(t<.04||t>.96)?(Math.abs(Math.hypot(y-.3,z)-.15)<.04?K.oakD:K.oakL):(hsh(Math.floor(x*5),Math.floor(y*8))>.6?K.oakD:K.brown))};
PR.stump=s=>{sCyl(0,0,0,.5,.42,.36,(x,y,z)=>y>.46?(Math.abs(Math.hypot(x,z)-.22)<.04?K.oakD:K.oakL):K.brown,{});sCap(.3,0,.1,.55,.05,.3,.12,.05,K.brown)};
PR.mushroom=s=>{const c=pickc(s,2,[K.red,K.tang,K.rose]);sCyl(0,0,0,.32,.09,.07,K.paper);sEll(0,.34,0,.26,.16,.26,(x,y,z)=>hsh(Math.floor(x*14),Math.floor(z*14))>.8?K.white:c)};
PR.rock=s=>{const W=.45+rr_(s,3)*.5,H=W*(.55+rr_(s,4)*.3);sEll(0,H*.45,0,W,H,W*(.8+rr_(s,5)*.3),(x,y,z)=>y>H*1.05&&hsh(Math.floor(x*5),Math.floor(z*5))>.45?K.moss:(hsh(Math.floor(y*6),s)>.7?K.stoneD:K.stone),.35)};
PR.boulder=s=>{const W=1+rr_(s,3)*1.1,H=W*.7;sEll(0,H*.4,0,W,H,W*.85,(x,y,z)=>(y>H*.75&&n3(x*2,y,z*2)>.45)?K.moss:(hsh(Math.floor(y*5+x*3),Math.floor(z*5))>.7?K.stoneD:hsh(Math.floor(x*4),Math.floor(y*4))>.6?K.stoneL:K.stone),.4)};
PR.cairn=s=>{let y=0;for(let q=0;q<4;q++){const r=.45-q*.07;sEll((q&1?.04:-.04),y+r*.5,0,r,r*.55,r*.9,q%2?K.stoneL:K.stone,.12);y+=r*.9}};
// ---- plants ----
PR.pumpkin=s=>{sEll(0,.28,0,.42,.28,.42,(x,y,z)=>Math.abs(Math.sin(Math.atan2(z,x)*5))<.18?K.tang:K.pumpkin);sCap(0,.5,0,.05,.68,.02,.06,.05,K.leafD)};
PR.sunflower=s=>{const h=1.5+rr_(s,1)*.5;sCap(0,0,0,0,h,0,.06,.05,K.leaf);sEll(.2,h*.5,0,.22,.07,.1,K.leafL);sEll(-.2,h*.35,0,.22,.07,.1,K.leafL);
 sEll(0,h+.02,.05,.34,.34,.1,(x,y,z)=>Math.hypot(x,y-h)>.22?K.sunY:K.brown);sEll(0,h,.1,.2,.2,.06,(x,y,z)=>hsh(Math.floor(x*14),Math.floor(y*14))>.5?K.soilD:K.brown)};
PR.corn=s=>{const h=1.5+rr_(s,1)*.4;sCap(0,0,0,0,h,0,.07,.05,K.leaf);for(let q=0;q<4;q++){const a=q*1.6+s,l=.55;sCap(0,.5+q*.25,0,Math.cos(a)*l,.7+q*.25,Math.sin(a)*l,.06,.02,K.leafL)}
 sEll(.1,h*.6,0,.07,.2,.07,K.sunY);sEll(0,h+.05,0,.1,.12,.1,K.ochre)};
PR.tomato=s=>{sEll(0,.4,0,.34,.4,.34,(x,y,z)=>hsh(Math.floor(x*9),Math.floor(y*9)+s)>.82?K.red:K.leaf,.2);sCap(.38,0,0,.38,.95,0,.04,.04,K.oakD)};
PR.cabbage=s=>{sEll(0,.22,0,.3,.22,.3,(x,y,z,d)=>d>.8?K.leafL:K.sage,.15)};
PR.flower=s=>{const c=pickc(s,3,[K.red,K.sunY,K.pink,K.white,K.purple]);sCap(0,0,0,0,.4,0,.03,.03,K.leaf);sEll(0,.46,0,.13,.08,.13,c);sEll(0,.5,0,.05,.04,.05,K.sunY)};
PR.pot=s=>{const c=pickc(s,4,[K.terra,K.oak,K.stoneW]);sCyl(0,0,0,.4,.22,.3,c);sEll(0,.46,0,.34,.22,.34,(x,y,z)=>hsh(Math.floor(x*10),Math.floor(z*10))>.8?pickc(s,5,[K.red,K.sunY,K.pink]):K.leaf,.2)};
PR.reed=s=>{for(let q=0;q<5;q++){const a=q*1.3+s,l=.12;sCap(Math.cos(a)*l,0,Math.sin(a)*l,Math.cos(a)*(l+.1),1.2+rr_(s,q)*.8,Math.sin(a)*(l+.1),.06,.03,K.bambooD)}sCap(.1,1.5,0,.12,1.95,0,.1,.08,K.brown)};
PR.bush=s=>{const R=.7+rr_(s,1)*.35,sl=s%3;sEll(0,R*.55,0,R,R*.7,R,(x,y,z)=>n3(x*5,y*5,z*5)>.62?K.leafL:n3(x*3,y*3,z*3)<.3?K.leafD:K.leaf,.35);
 sEll(R*.5,R*.4,R*.3,R*.6,R*.5,R*.6,(x,y,z)=>n3(x*5,y*5,z*5)>.6?K.leafL:K.hedge,.3);if(sl===0)for(let q=0;q<7;q++)sEll((rr_(s,q+9)-.5)*R*1.5,R*.5+rr_(s,q+20)*R*.6,(rr_(s,q+30)-.5)*R*1.5,.1,.1,.1,K.pink)};
PR.fern=s=>{for(let q=0;q<6;q++){const a=q*1.05+s,l=.55;sCap(0,.05,0,Math.cos(a)*l,.35,Math.sin(a)*l,.07,.03,K.leafL)}};
// ---- things people made ----
PR.lamp=s=>{sCyl(0,0,0,.3,.24,.16,K.ironL);sCap(0,0,0,0,2.5,0,.09,.07,K.iron);sCap(0,2.3,0,.28,2.55,0,.06,.05,K.iron);
 sBox(-.2,2.55,-.2,.2,3,.2,(x,y,z)=>(Math.abs(x)>.14&&Math.abs(z)>.14)?K.iron:K.gLamp,.04);sPyr(0,0,3,.3,.3,.32,K.iron,{cur:1});sEll(0,3.35,0,.07,.07,.07,K.brass)};
PR.bench=s=>{const c=K.oakL;sBox(-.75,.4,-.24,.75,.5,.24,(x,y,z)=>Math.floor((z+.25)*7)%3===0?K.oak:c,.03);
 for(const x of[-.6,.6]){sBox(x-.05,0,-.2,x+.05,.42,.2,K.oakD);sBox(x-.05,.45,-.22,x+.05,1.05,-.16,K.oakD)}
 sBox(-.72,.7,-.22,.72,1,-.16,(x,y,z)=>Math.floor((y+.1)*7)%2?K.oak:c,.02)};
PR.signpost=s=>{sCap(0,0,0,0,2.2,0,.1,.09,K.oakD);for(let q=0;q<2;q++){const a=(q?1:-1)*(.5+rr_(s,q)*.6),y=1.95-q*.5;
 sBox(-.05,y-.17,-.03,.9,y+.17,.03,K.oakL,.03);sPyr(.95,0,y-.17,.12,.17,.0,K.oakL)}};
PR.mailbox=s=>{sCap(0,0,0,0,1.2,0,.07,.07,K.oakD);sBox(-.3,1.2,-.2,.3,1.55,.2,K.red,.12);sBox(.28,1.5,-.03,.3,1.8,.15,K.sunY)};
PR.scarecrow=s=>{sCap(0,0,0,0,2.1,0,.07,.07,K.oakD);sCap(-.8,1.65,0,.8,1.65,0,.06,.06,K.oakD);
 sEll(0,1.4,0,.3,.4,.2,(x,y,z)=>Math.floor(y*8)%3===0?K.ochre:K.blue,.1);sEll(0,2.0,0,.2,.2,.2,K.sand);sEll(0,2.2,0,.38,.05,.38,K.thatch);sCyl(0,0,2.2,2.5,.2,.1,K.thatchD);
 for(const x of[-.9,.9])for(let q=0;q<3;q++)sCap(x,1.62,0,x+(x>0?.2:-.2),1.45-q*.1,(q-1)*.1,.04,.02,K.thatch)};
PR.hive=s=>{for(let q=0;q<5;q++){const r=.4*Math.sin(.3+q*.6)+.1;sCyl(0,0,.42+q*.15,.57+q*.15,r+.06,r,Math.floor(q%2)?K.thatchD:K.thatch)}
 sEll(0,1.1,0,.08,.05,.08,K.thatchD);sBox(-.3,.1,-.3,.3,.42,.3,K.oakL);for(const[x,z]of[[-.28,-.28],[.28,.28],[-.28,.28],[.28,-.28]])sBox(x-.03,0,z-.03,x+.03,.1,z+.03,K.oakD)};
PR.flowerbox=s=>{sBox(-.4,0,-.12,.4,.22,.12,K.oakD,.02);sEll(0,.3,0,.4,.14,.14,(x,y,z)=>hsh(Math.floor(x*10),Math.floor(y*10)+s)>.6?pickc(s,Math.floor((x+1)*4),[K.red,K.pink,K.sunY,K.white]):K.leaf,.2)};
PR.fenceSeg=null; // see fence()
PR.campfire=s=>{for(let q=0;q<7;q++){const a=q*.9;sEll(Math.cos(a)*.62,.12,Math.sin(a)*.62,.18,.14,.16,q%2?K.stone:K.stoneD,.1)}
 for(let q=0;q<3;q++){const a=q*2.1;sCap(Math.cos(a)*.5,.14,Math.sin(a)*.5,-Math.cos(a)*.15,.38,-Math.sin(a)*.15,.09,.07,K.oakD)}
 sEll(0,.34,0,.2,.28,.2,(x,y,z)=>y>.4?K.gFireL:K.gFire);sEll(0,.62,0,.09,.22,.09,K.gFireL)};
PR.cart=s=>{sBox(-.8,.55,-.5,.8,.62,.5,K.oakL,.02);for(const z of[-.5,.5])sBox(-.8,.62,z-.04,.8,1.05,z+.04,(x,y,zz)=>Math.floor(x*5)%2?K.oak:K.oakL);sBox(-.8,.62,-.5,-.72,1.05,.5,K.oak);
 for(const z of[-.58,.58]){sTor(0,.42,z,.38,.05,'z',K.oakD);sCap(0,.42,z,0,.42,z+(z>0?-.1:.1),.07,.07,K.iron);for(let q=0;q<4;q++){const a=q*Math.PI/4;sCap(Math.cos(a)*.36,.42+Math.sin(a)*.36,z,-Math.cos(a)*.36,.42-Math.sin(a)*.36,z,.025,.025,K.oakD)}}
 sCap(.7,.7,-.35,1.7,.35,-.45,.05,.05,K.oakD);sCap(.7,.7,.35,1.7,.35,.45,.05,.05,K.oakD);
 sEll(-.1,1.15,0,.5,.3,.4,K.thatch,.2)};
PR.laundry=s=>{sCap(-1.1,0,0,-1.1,2.2,0,.07,.07,K.oakD);sCap(1.1,0,0,1.1,2.2,0,.07,.07,K.oakD);sCap(-1.1,2.1,0,1.1,2.05,0,.025,.025,K.rope);
 const C=[K.red,K.blue,K.white,K.sunY,K.teal,K.cream];for(let q=0;q<4;q++){const x=-.7+q*.46,l=.5+rr_(s,q)*.3;sBox(x-.17,2.05-l,-.02,x+.17,2.07,.02,pickc(s,q+4,C))}};
PR.chair=s=>{sBox(-.3,.4,-.3,.3,.48,.3,K.oakL,.02);for(const[x,z]of[[-.27,-.27],[.27,-.27],[-.27,.27],[.27,.27]])sBox(x-.03,0,z-.03,x+.03,.42,z+.03,K.oakD);sBox(-.3,.48,-.3,.3,1.1,-.25,K.oak)};
PR.basin=s=>{sCyl(0,0,0,.5,.4,.3,K.stone,{});sCyl(0,0,.42,.52,.3,.3,K.stoneD);sCyl(0,0,.45,.5,.26,.26,K.aqua);sCap(.1,.55,0,.5,.9,0,.04,.04,K.bamboo)};
PR.picnic=s=>{sBox(-1.1,0,-.9,1.1,.05,.9,(x,y,z)=>((Math.floor(x*3.2)+Math.floor(z*3.2))&1)?K.red:K.white,.01);
 sCyl(-.4,.2,.05,.4,.28,.3,K.oakL);sEll(-.4,.45,.2,.2,.1,.2,K.cream);sCyl(.5,-.2,.05,.4,.1,.1,K.white);sEll(.2,.12,.3,.12,.12,.12,K.red);sEll(.45,.1,.35,.1,.1,.1,K.tang)};
PR.postbox=s=>{sCap(0,0,0,0,1.3,0,.1,.1,K.oakD);sCyl(0,0,1.3,1.9,.32,.32,(x,y,z)=>y>1.8?K.red:K.red,{});sBox(-.15,1.4,.28,.15,1.62,.36,K.black)};
PR.stoneLantern=s=>{sCyl(0,0,0,.2,.42,.34,K.stoneL);sCyl(0,0,.2,1.0,.14,.12,K.stone);sCyl(0,0,1.0,1.12,.38,.38,K.stoneL);
 sBox(-.24,1.12,-.24,.24,1.6,.24,(x,y,z)=>(Math.abs(x)>.17&&Math.abs(z)>.17)?K.stoneD:K.gLamp,.03);sPyr(0,0,1.6,.58,.58,.45,K.stone,{cur:1.8,lift:.12});sEll(0,2.12,0,.1,.1,.1,K.stoneL)};
PR.bamboo=s=>{const n=3+(s%3);for(let q=0;q<n;q++){const x=(rr_(s,q)-.5)*.8,z=(rr_(s,q+9)-.5)*.8,h=3.5+rr_(s,q+20)*3;
  sCap(x,0,z,x+.1,h,z+.05,.1,.07,(X,Y)=>Math.abs(((Y*2.2)%1)-.5)>.46?K.bambooD:K.bamboo)}};
PR.standing=s=>{const h=1.5+rr_(s,1)*1.3;sEll(0,h*.45,0,.42,h*.55,.3,(x,y,z)=>y>h*.8&&n3(x*3,y,z*3)>.5?K.moss:hsh(Math.floor(y*6),s)>.7?K.stoneD:K.stone,.3)};
PR.starStone=s=>{sEll(0,.95,0,.45,1,.28,K.stoneD,.2);sEll(0,1.0,.24,.2,.24,.06,K.gStar)};
PR.hedgeSeg=s=>{sBox(-.62,0,-.38,.62,.95,.38,(x,y,z)=>n3(x*6,y*6,z*6)>.6?K.hedgeL:K.hedge,.25,.25)};
PR.hedgeV=s=>{sBox(-.38,0,-.62,.38,.95,.62,(x,y,z)=>n3(x*6,y*6,z*6)>.6?K.hedgeL:K.hedge,.25,.25)};
PR.topiary=s=>{sCyl(0,0,0,.35,.14,.12,K.oakD);sEll(0,.85,0,.5,.5,.5,(x,y,z)=>n3(x*7,y*7,z*7)>.6?K.hedgeL:K.hedge,.12);sEll(0,1.5,0,.34,.32,.34,(x,y,z)=>n3(x*7,y*7,z*7)>.6?K.hedgeL:K.hedge,.12);sEll(0,1.95,0,.2,.2,.2,K.hedgeL)};
PR.topiary2=s=>{sCyl(0,0,0,.3,.16,.14,K.oakD);sCyl(0,0,.3,1.9,.62,.04,(x,y,z)=>n3(x*7,y*7,z*7)>.6?K.hedgeL:K.hedge)};
PR.brazier=s=>{for(let q=0;q<3;q++){const a=q*2.09+.5;sCap(Math.cos(a)*.35,0,Math.sin(a)*.35,Math.cos(a)*.12,.8,Math.sin(a)*.12,.06,.05,K.iron)}
 sCyl(0,0,.8,1.05,.2,.42,K.iron,{hole:.82});sEll(0,1.02,0,.34,.22,.34,(x,y,z)=>y>1.08?K.gFireL:K.gFire);sEll(0,1.28,0,.16,.3,.16,K.gFireL)};
PR.bannerPole=s=>{const c=[K.red,K.blue,K.green,K.purple][s%4];sCap(0,0,0,0,3.8,0,.08,.07,K.oakD);sEll(0,3.9,0,.1,.1,.1,K.gold);sCap(0,3.6,0,.9,3.6,0,.04,.04,K.oakD);
 sBox(.05,2.3,-.03,.88,3.55,.03,(x,y,z)=>Math.abs(x-.46)<.07&&y>2.7&&y<3.2?K.gold:c,0)};
PR.postlantern=s=>{sCap(0,0,0,0,2.4,0,.07,.07,K.oakD);sBox(-.2,2.4,-.2,.2,2.85,.2,(x,y,z)=>y>2.78||y<2.46?K.oakD:K.gLamp,.1)};
PR.dish=s=>{sCyl(0,0,0,.5,.35,.2,K.stoneL);sCap(0,.5,0,0,1.7,0,.12,.1,K.ironL);
 // dish as a shallow bowl tilted at the sky
 sFill(-1.4,1.4,-1.4,1.4,2.7,1.4,(x,y,z)=>{const ty=y-1.75-x*.4,r=Math.hypot(x,z);const d=ty-.25*r*r*.8;return(r<1.4&&d>-.12&&d<.05)?K.white:0});sCap(0,1.8,0,.6,2.55,0,.05,.05,K.ironL);sEll(.6,2.6,0,.1,.1,.1,K.gRed)};
PR.mast=s=>{const H=7;for(const[x,z]of[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])sCap(x,0,z,x*.3,H,z*.3,.06,.04,K.ironL);
 for(let q=0;q<9;q++){const y=.5+q*.75,w=.5-q*.04;sCap(-w,y,-w,w,y+.6,-w,.025,.025,K.iron);sCap(w,y,-w,w,y+.6,w,.025,.025,K.iron);sCap(w,y,w,-w,y+.6,w,.025,.025,K.iron);sCap(-w,y,w,-w,y+.6,-w,.025,.025,K.iron)}
 sEll(0,H+.15,0,.14,.14,.14,K.gRed)};
PR.tripod=s=>{for(let q=0;q<3;q++){const a=q*2.09;sCap(Math.cos(a)*.6,0,Math.sin(a)*.6,0,1.2,0,.05,.04,K.oakD)}sCap(0,1.2,0,.5,1.7,.1,.12,.1,K.brass);sCyl(.5,.1,1.66,1.74,.14,.14,K.brass)};
PR.orrery=s=>{sCyl(0,0,0,.5,.6,.45,K.stoneL);sCap(0,.4,0,0,1.5,0,.06,.06,K.brass);sEll(0,1.5,0,.2,.2,.2,K.gold);
 for(const[r,y]of[[.7,1.5],[1.1,1.55],[1.5,1.6]])sTor(0,y,0,r,.03,'y',K.brass)};
PR.beacon=s=>{sEll(0,.2,0,.5,.2,.5,K.stone);sCyl(0,0,.2,.8,.14,.14,K.ironL);sEll(0,1,0,.22,.24,.22,K.gGreen)};
PR.crateStack=s=>{PR.crate(s)};
PR.basket=s=>{sCyl(0,0,0,.4,.2,.3,(x,y,z)=>Math.floor((y+Math.atan2(z,x))*5)%2?K.oakL:K.thatch,{hole:.8});sEll(0,.32,0,.28,.1,.28,pickc(s,1,[K.red,K.tang,K.leaf]))};
PR.well=s=>{sCyl(0,0,0,.95,.95,.95,(x,y,z)=>y>.85?K.stoneL:(hsh(Math.floor(Math.atan2(z,x)*6),Math.floor(y*5))>.5?K.stone:K.stoneW),{hole:.68});sCyl(0,0,.3,.6,.62,.62,K.aqua);
 for(const x of[-.85,.85])sCap(x,.9,0,x,2.5,0,.09,.08,K.oakD);sCap(-.85,2.2,0,.85,2.2,0,.07,.07,K.oakD);sGable(-1.1,1.1,-.7,.7,2.4,.75,K.rA,{ov:.2});sCap(0,2.1,0,0,1.5,0,.03,.03,K.rope);sCyl(0,0,1.2,1.5,.2,.18,K.oak,{hole:.7})};

// ================= v3 BUILDINGS: the village =================
const ANI=[],SMOKE3=[];
const ROOFS={red:[K.rA,K.rAL,K.brickD],blue:[K.rB,K.rBL,K.rE],moss:[K.rC,K.rCL,K.leafD],plum:[K.rD,K.rDL,K.rE],slate:[K.rE,K.rEL,K.black],ochre:[K.rF,K.rFL,K.oakD],thatch:[K.thatch,K.thatchD,K.thatchD]};
const WALLS={cream:K.plaster,sand:K.plaster2,sage:K.sage,rose:K.rose,sun:K.sun,white:K.white,stone:K.stoneW,blue:K.blueW};
const rtile=R=>(x,y,z,u)=>{const row=Math.floor(Math.abs(z)/.3),col=Math.floor((x+(row&1)*.22)/.44),q=hsh(col*7+row,row*3+3),fr=(Math.abs(z)/.3)%1;return fr>.82?R[2]:q>.72?R[1]:R[0]};
const rotXZ=(r,x,z)=>r===0?[x,z]:r===1?[-z,x]:r===2?[-x,-z]:[z,-x];
function lightW(fi,fj,rot,lx,ly,lz,rad,gs,kind){const g=gY(fi,fj);if(g===null)return;const q=rotXZ(rot,lx,lz);lightAt(fi+.5+q[0],g+ly,fj+.5+q[1],rad,gs,kind||0)}
// the Tudor cottage: stone plinth, timber frame in plaster, glowing leaded windows, a swept gable roof with a chimney
function houseS(s,o){o=o||{};const w=o.w||6,d=o.d||5,h=o.h||3.1,fl=o.fl||1,rh=o.rh||2.5,wc=o.wall||K.plaster,R=o.roof||ROOFS.red,tm=o.trim||K.timber,H=h*fl,y0=.35;
 sBox(-w/2-.12,0,-d/2-.12,w/2+.12,y0+.1,d/2+.12,(x,y,z)=>hsh(Math.floor(x*3.2)+Math.floor(y*3.2)*7,Math.floor(z*3.2))>.5?K.stoneW:K.stone,.05,.08);
 // plaster walls with the timber frame laid on
 sBox(-w/2,y0,-d/2,w/2,y0+H,d/2,(x,y,z)=>{
  const xf=Math.abs(x)>w/2-.2,zf=Math.abs(z)>d/2-.2;if(!xf&&!zf)return wc;
  const u=zf?x:z,v=y-y0,pw=1.5,ph=h,pu=(((u+w)%pw)+pw)%pw/pw,pv=(v%ph)/ph;
  const post=Math.abs(pu*pw)<.11||Math.abs(pu*pw-pw)<.11||(Math.abs(x)>w/2-.18&&Math.abs(z)>d/2-.18);
  const beam=v<.13||Math.abs(v-H)<.13||(fl>1&&Math.abs(v-h)<.13);
  const br=(Math.floor((u+w)/pw)&1)?Math.abs(pu-(1-pv))<.06:Math.abs(pu-pv)<.06;
  if(post||beam||br)return tm;return hsh(Math.floor(x*4),Math.floor(y*4)+Math.floor(z*4))>.9?K.plaster2:wc},.04);
 // gable end plates up into the roof
 const zr=d/2+.0;
 sBox(-w/2,y0+H,-d/2,w/2,y0+H+rh,d/2,(x,y,z)=>{if(Math.abs(x)<w/2-.25)return 0;const t=y0+H+rh*(1-Math.abs(z)/(d/2+.35))-.36;if(y>t)return 0;
  if(Math.abs(z)<.12||Math.abs(Math.abs(z)-(y-y0-H)*d/(2*rh)*.0)<0)return tm;return hsh(Math.floor(y*4),Math.floor(z*4))>.8?K.plaster2:wc});
 // door on +z with a stone arch and a lantern
 const dx=o.dx||0;
 sFill(dx-.55,y0,d/2-.14,dx+.55,y0+2.5,d/2+.02,(x,y,z)=>{const a=x-dx,top=y0+2.1,ar=y>top?Math.hypot(a,(y-top)*1.15):Math.abs(a);return ar<.55?-1:0});
 sFill(dx-.5,y0,d/2-.4,dx+.5,y0+2.4,d/2-.14,(x,y,z)=>{const a=x-dx,top=y0+2.0,ar=y>top?Math.hypot(a,(y-top)*1.15):Math.abs(a);if(ar>.5)return 0;return Math.abs(x-dx-.34)<.07&&Math.abs(y-y0-1.1)<.07?K.brass:(Math.floor((x-dx+1)*4)%2?K.oakD:K.oak)});
 sFill(dx-.78,y0-.1,d/2-.14,dx+.78,y0+2.7,d/2+.12,(x,y,z)=>{const a=x-dx,top=y0+2.1,ar=y>top?Math.hypot(a,(y-top)*1.15):Math.abs(a);return(ar>=.55&&ar<.78&&z>d/2-.14)?K.stoneL:0});
 sBox(dx-.9,0,d/2+.0,dx+.9,y0+.12,d/2+.7,(x,y,z)=>hsh(Math.floor(x*4),Math.floor(z*4))>.5?K.slab:K.stoneL,.04);
 sBox(dx+.8,y0+1.9,d/2+.02,dx+1.05,y0+2.3,d/2+.28,K.gLamp,.04);
 // windows, shutters and flower boxes
 const win=(x,y,z,face,sh)=>{const ww=.5,hh=.55,fx=face==='z'?x:0;
  if(face==='z'){sFill(x-ww-.04,y-hh-.04,z-.13,x+ww+.04,y+hh+.04,z+.02,(X,Y,Z)=>{const ax=Math.abs(X-x),ay=Math.abs(Y-y);if(ax>ww||ay>hh)return K.oakD;return(ax<.06||ay<.05)?K.oakL:K.gWin});
   if(sh){sBox(x-ww-.5,y-hh,z-.1,x-ww-.06,y+hh,z+.1,(X,Y)=>Math.floor((Y+1)*5)%2?K.green:K.leafD,.02);sBox(x+ww+.06,y-hh,z-.1,x+ww+.5,y+hh,z+.1,(X,Y)=>Math.floor((Y+1)*5)%2?K.green:K.leafD,.02)}
   if(o.boxes)sBox(x-ww,y-hh-.34,z+.0,x+ww,y-hh-.08,z+.3,(X,Y,Z)=>Y>y-hh-.2&&hsh(Math.floor(X*8),Math.floor(Z*8))>.4?pickc(s,Math.floor(X*3),[K.red,K.pink,K.sunY,K.white]):K.oakD,.03)}
  else{sFill(x-.13,y-hh-.04,z-ww-.04,x+.02,y+hh+.04,z+ww+.04,(X,Y,Z)=>{const az=Math.abs(Z-z),ay=Math.abs(Y-y);if(az>ww||ay>hh)return K.oakD;return(az<.06||ay<.05)?K.oakL:K.gWin});
   if(sh){sBox(x-.1,y-hh,z-ww-.5,x+.1,y+hh,z-ww-.06,(X,Y)=>Math.floor((Y+1)*5)%2?K.green:K.leafD,.02);sBox(x-.1,y-hh,z+ww+.06,x+.1,y+hh,z+ww+.5,(X,Y)=>Math.floor((Y+1)*5)%2?K.green:K.leafD,.02)}}};
 const sx=w/2-.0,sh=o.shut!==false;
 win(dx>0?-w/4-.4:w/4+.4,y0+1.5,d/2,'z',sh);if(w>=5.5)win(dx>0?-w/2+1:w/2-1,y0+1.5,d/2,'z',sh);win(-w/4,y0+1.5,-d/2+.13,'z',sh);win(w/4,y0+1.5,-d/2+.13,'z',sh);
 win(w/2-.13+.15,y0+1.5,0,'x',sh);win(-w/2-.02,y0+1.5,0,'x',sh);
 if(fl>1){win(-w/4,y0+h+1.5,d/2,'z',sh);win(w/4,y0+h+1.5,d/2,'z',sh);win(0,y0+h+1.5,-d/2+.13,'z',sh)}
 // roof
 sGable(-w/2,w/2,-d/2,d/2,y0+H,rh,rtile(R),{ov:.5,ovx:.38,th:.34,cur:.35});
 sCap(-w/2-.4,y0+H+rh+.05,0,w/2+.4,y0+H+rh+.05,0,.14,.14,R[2]);
 // round attic window in the gable
 sFill(-w/2-.02,y0+H+.5,-.4,-w/2+.3,y0+H+1.3,.4,(x,y,z)=>Math.hypot(z,(y-y0-H-.9)*1.1)<.38?(Math.hypot(z,(y-y0-H-.9))<.28?K.gWin2:K.oakL):0);
 // chimney
 const cxp=o.cx!==undefined?o.cx:w*.27,czp=-d*.16;
 sBox(cxp-.4,y0+H-.3,czp-.4,cxp+.4,y0+H+rh+.9,czp+.4,(x,y,z)=>hsh(Math.floor(x*4)+Math.floor(y*3.5),Math.floor(z*4)+Math.floor(y*3.5))>.5?K.brick:K.brickD,.04);
 sBox(cxp-.5,y0+H+rh+.9,czp-.5,cxp+.5,y0+H+rh+1.1,czp+.5,K.stoneL,.03);sBox(cxp-.22,y0+H+rh+1.1,czp-.22,cxp+.22,y0+H+rh+1.15,czp+.22,K.shade);
 return{cx:cxp,cz:czp,top:y0+H+rh+1.2}}
function putHouse(fi,fj,o,rot){const s=(fi*3+fj*7)|0;o=o||{};
 const ok=mk3(fi,fj,.25,sd=>{const r=houseS(sd,o);o._r=r},{rot:rot||0,seed:s,rs:Math.max(o.w||6,o.d||5)/2+1.3,rs2:Math.max(o.w||6,o.d||5)/2+1.3});if(!ok)return;
 const g=gY(fi,fj),r=o._r,q=rotXZ(rot||0,r.cx,r.cz);SMOKES.push([fi+.5+q[0],g+r.top+.3,fj+.5+q[1]]);
 const dxx=o.dx||0,dd=(o.d||5)/2+.5,lq=rotXZ(rot||0,dxx+.95,dd);lightAt(fi+.5+lq[0],g+2.3,fj+.5+lq[1],9,2.2,0);
 for(const wl of[[-1.8,1.9,2.6]]){const c=rotXZ(rot||0,wl[0],dd);GLOWS.push([fi+.5+c[0],g+2,fj+.5+c[1],2.4,1])}}
function putSc(fi,fj,res,fn,o){o=o||{};const ok=mk3(fi,fj,res,fn,o);return ok}
function ani(fi,fj,y,res,build,step,o){o=o||{};sBegin(res,0,.5,(fi*5+fj)|0);build();const B=mkB();sFlush(B,0,0,0,!!o.sw);ANI.push({B,x:fi+.5,y,z:fj+.5,step,rot:o.rot||0,g:null,beam:!!o.beam})}
// a red barn: gambrel roof, white X doors, hayloft
function barnS(s){const w=8,d=6,h=3.6,y0=.3;
 sBox(-w/2-.1,0,-d/2-.1,w/2+.1,y0+.1,d/2+.1,K.stone,.05,.08);
 sBox(-w/2,y0,-d/2,w/2,y0+h,d/2,(x,y,z)=>{const xf=Math.abs(x)>w/2-.2,zf=Math.abs(z)>d/2-.2;if(Math.abs(x)>w/2-.25&&Math.abs(z)>d/2-.25)return K.white;return Math.floor((xf?z:x)*4)%4===0?K.redD:K.red},.04);
 // gambrel roof, ridge along x
 const prof=u=>u<.55?(1-u/.55*.5):(.5-(u-.55)/.45*.5);
 sFill(-w/2-.4,y0+h-.3,-d/2-.5,w/2+.4,y0+h+4,d/2+.5,(x,y,z)=>{const u=Math.abs(z)/(d/2+.5);if(u>1)return 0;const top=y0+h+2.6*prof(u)*1.0+ (u<.55?0:0);if(y>top||y<top-.34)return 0;return(Math.abs(x)%.6<.05)?K.rE:(hsh(Math.floor(x*3),Math.floor(Math.abs(z)*3))>.7?K.rEL:K.rE)});
 sBox(-w/2,y0+h,-d/2,w/2,y0+h+2.8,d/2,(x,y,z)=>{if(Math.abs(x)<w/2-.25)return 0;const u=Math.abs(z)/(d/2+.5),t=y0+h+2.6*prof(u)-.36;if(y>t)return 0;return K.red});
 // big doors with white X
 sFill(-1.6,y0,d/2-.16,1.6,y0+3.1,d/2+.02,(x,y,z)=>{const ax=Math.abs(x),v=y-y0;if(ax>1.6)return 0;const edge=ax>1.45||v<.12||v>2.98||ax<.07,xx=Math.abs(Math.abs(x)/1.55*3-v)<.13||Math.abs(Math.abs(x)/1.55*3-(3-v))<.13;return(edge||xx)?K.white:K.redD});
 sFill(-.6,y0+h+.5,d/2-.16,.6,y0+h+1.7,d/2+.02,(x,y,z)=>(Math.abs(x)>.5||Math.abs(y-y0-h-1.1)>.5)?K.white:K.oakD);
 sBox(-.3,y0+h+2.55,-.3,.3,y0+h+2.8,.3,K.gold);sCap(0,y0+h+2.8,0,0,y0+h+3.6,0,.06,.06,K.iron);sBox(0,y0+h+3.2,-.02,.6,y0+h+3.5,.02,K.red);
 sFill(w/2-.16,y0+1.6,-.5,w/2+.02,y0+2.4,.5,(x,y,z)=>Math.abs(z)>.4||Math.abs(y-y0-2)>.35?K.white:K.gWin)}
function coopS(s){const w=2.4,d=1.8;sBox(-w/2,.45,-d/2,w/2,1.6,d/2,(x,y,z)=>Math.floor(x*4)%2?K.oakL:K.oak,.03);
 for(const[x,z]of[[-1.1,-.8],[1.1,-.8],[-1.1,.8],[1.1,.8]])sBox(x-.07,0,z-.07,x+.07,.5,z+.07,K.oakD);
 sGable(-w/2,w/2,-d/2,d/2,1.6,.8,K.rA,{ov:.2});sBox(-.25,.5,d/2-.05,.25,1.2,d/2+.05,K.shade);sBox(.4,0,d/2,.9,.5,d/2+.9,K.oak);
 sCap(.65,.1,d/2+.2,.65,.1,d/2+.9,.05,.05,K.oakD)}
function windmillS(s){const H=7.5;sCyl(0,0,0,.4,2.7,2.7,K.stone,{});
 sCyl(0,0,.4,H,2.5,1.5,(x,y,z)=>(Math.abs(y-3.6)<.1||Math.abs(y-6)<.08)?K.stoneD:(hsh(Math.floor(Math.atan2(z,x)*5),Math.floor(y*3.5))>.5?K.plaster:K.plaster2));
 sFill(-.55,.4,2.0,.55,2.2,2.7,(x,y,z)=>{const a=Math.abs(x);return(y>1.6?Math.hypot(x,(y-1.6)*1.1)<.55:a<.55)&&Math.hypot(x,z)>1.4?K.oakD:0});
 for(const[y,a]of[[3.3,0],[5,1.5],[4.3,3.2]]){const ox=Math.sin(a)*1.9,oz=Math.cos(a)*1.9,r=Math.hypot(ox,oz);sFill(ox-.3,y-.4,oz-.3,ox+.3,y+.4,oz+.3,(x,yy,z)=>Math.hypot(x,z)>1.3?K.gWin:0)}
 sCyl(0,0,H,H+.2,1.9,1.9,K.oakD);sEll(0,H+.2,0,1.7,1.5,1.7,(x,y,z)=>y>H+1.6?K.rE:Math.floor((y-H)*4)%2?K.rEL:K.rE,.1);
 sCap(0,H+.9,1.5,0,H+.9,2.6,.3,.3,K.oakD)}
function windmillSails(){sBegin(.2,0,.5,5);sSet(0,0,0,K.brass);sEll(0,0,.1,.35,.35,.5,K.oakD);
 for(let q=0;q<4;q++){const a=q*Math.PI/2+.4,c=Math.cos(a),n=Math.sin(a);sCap(0,0,0,c*5.2,n*5.2,0,.16,.12,K.oakD);
  for(let t=1.2;t<5;t+=.5){sCap(c*t-n*.7,n*t+c*.7,.0,c*t+n*.1,n*t-c*.1,0,.05,.05,K.oakL)}
  sBox(Math.min(c*1.4,c*5)-.0,0,0,0,0,0,0);sFill(-6,-6,-.1,6,6,.12,(x,y,z)=>{const t=x*c+y*n,s=-x*n+y*c;return(t>1.4&&t<5&&s>-.02&&s<.95&&((Math.floor(t*3)%2)||s<.12))?K.paper:0})}}
function boathouseS(s){const w=5,d=4;for(const[x,z]of[[-2.3,-1.8],[2.3,-1.8],[-2.3,1.8],[2.3,1.8]])sCap(x,-3,z,x,1,z,.14,.14,K.oakD);
 sBox(-w/2-.3,.9,-d/2-.3,w/2+.3,1.1,d/2+.3,(x,y,z)=>Math.floor(z*4)%2?K.oak:K.oakL);
 sBox(-w/2,1.1,-d/2,w/2,3.3,d/2,(x,y,z)=>(Math.abs(x)>w/2-.2&&Math.abs(z)>d/2-.2)?K.oakD:(Math.floor(x*4+z*4)%2?K.pineW:K.oakL),.03);
 sGable(-w/2,w/2,-d/2,d/2,3.3,1.9,rtile(ROOFS.moss),{ov:.5});sFill(-.7,1.1,d/2-.15,.7,2.9,d/2+.05,K.shade);
 sFill(w/2-.15,1.9,-.5,w/2+.02,2.7,.5,K.gWin);sFill(-1.8,1.9,d/2-.14,-.9,2.7,d/2+.02,K.gWin)}
function lookoutS(s){const H=7.5;for(const[x,z]of[[-1,-1],[1,-1],[-1,1],[1,1]]){sCap(x,0,z,x*.7,H,z*.7,.12,.1,K.oakD)}
 for(let y=1;y<H;y+=1.6){const w=1-y/H*.3;sCap(-w,y,-w,w,y+1.6,-w,.05,.05,K.oak);sCap(w,y,w,-w,y+1.6,w,.05,.05,K.oak);sCap(-w,y,w,-w,y+1.6,-w,.05,.05,K.oak);sCap(w,y,-w,w,y+1.6,w,.05,.05,K.oak);sBox(-w,y,-w,w,y+.1,w,K.oakL)}
 sBox(-1.4,H,-1.4,1.4,H+.15,1.4,K.oakL);for(const[x,z]of[[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3]])sCap(x,H,z,x,H+1.1,z,.07,.07,K.oakD);
 sPyr(0,0,H+1.1,1.9,1.9,1.3,K.rA,{cur:1.3});sCap(0,H+.15,0,0,H+.9,0,.06,.06,K.gLamp);sEll(0,H+.5,0,.2,.25,.2,K.gLamp)}
function shrineS(s){sBox(-1.2,0,-1.2,1.2,.4,1.2,K.stoneL,.05);for(const[x,z]of[[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]])sCyl(x,z,.4,2.3,.12,.11,K.vermil);
 sBox(-.9,.4,-.9,.9,2.1,.9,(x,y,z)=>Math.abs(z)>.75&&Math.abs(x)<.5&&y<1.6?K.gLamp:K.paper,.02);sPyr(0,0,2.3,1.7,1.7,1.2,rtile([K.rE,K.rEL,K.black]),{cur:1.7,lift:.25});sEll(0,3.6,0,.13,.17,.13,K.gold)}
function hutS(s){sCyl(0,0,0,1.8,1.9,1.8,(x,y,z)=>hsh(Math.floor(Math.atan2(z,x)*6),Math.floor(y*4))>.5?K.plaster2:K.sand);sCyl(0,0,1.8,3.8,2.35,.05,(x,y,z)=>hsh(Math.floor(x*3),Math.floor(y*3))>.5?K.thatch:K.thatchD,{});
 sFill(-.5,0,1.5,.5,1.7,2.1,(x,y,z)=>(y>1.1?Math.hypot(x,y-1.1)<.5:Math.abs(x)<.5)?K.oakD:0);sEll(1.1,1.2,1.1,.3,.3,.3,K.gWin);sBox(-1.4,2.2,-1.4,-.9,3.8,-.9,K.stone,.05);sBox(-1.5,3.8,-1.5,-.8,3.95,-.8,K.stoneL)}
function stallS(s){const c=[[K.red,K.white],[K.blue,K.white],[K.green,K.cream],[K.ochre,K.white]][s%4];
 for(const[x,z]of[[-1,-.7],[1,-.7],[-1,.7],[1,.7]])sCap(x,0,z,x,2.4,z,.07,.07,K.oakD);
 sBox(-1.15,.7,-.2,1.15,1.0,.75,K.oakL,.03);sBox(-1.1,0,.55,1.1,.7,.75,K.oak);
 sFill(-1.3,1.9,-.95,1.3,2.9,.95,(x,y,z)=>{const t=2.65+z*.45-Math.abs(x)*0+(.0);const top=2.55+ -z*.3;if(y>top+.12||y<top-.12)return 0;return Math.floor((x+2)*2.2)%2?c[0]:c[1]});
 for(let q=0;q<5;q++)sEll(-.8+q*.4,1.12,.2,.17,.14,.17,pickc(s,q,[K.red,K.tang,K.sunY,K.leafL,K.pinkD]));sEll(-.5,.8,.3,.25,.1,.2,K.cream)}
function wheelS(){sBegin(.1,0,.5,3);sTor(0,0,0,1.5,.12,'z',K.oakD);sTor(0,0,0,.9,.08,'z',K.oakD);sCap(0,0,-.5,0,0,.5,.2,.2,K.iron);
 for(let q=0;q<8;q++){const a=q*Math.PI/4,c=Math.cos(a),n=Math.sin(a);sCap(c*.2,n*.2,0,c*1.5,n*1.5,0,.07,.06,K.oakD);sBox(Math.min(c*1.4,c*1.7)-.06,Math.min(n*1.4,n*1.7)-.06,-.4,Math.max(c*1.4,c*1.7)+.06,Math.max(n*1.4,n*1.7)+.06,.4,K.oakL)}}
function rowboatS(s){const c=pickc(s,1,[K.blue,K.red,K.teal,K.ochre]);
 sFill(-1.5,0,-.6,1.5,.7,.6,(x,y,z)=>{const t=x/1.5,wd=.6*(1-Math.pow(Math.abs(t),2.4))*(1-.15*(1-y/.7)),ky=.18*(1-Math.abs(t))+(Math.abs(t)>.7?(Math.abs(t)-.7)*.9:0);if(Math.abs(z)>wd||y<ky||y>ky+.45)return 0;if(Math.abs(z)>wd-.1&&y>ky+.1)return(y>ky+.38?K.oakL:c);if(y<ky+.1)return K.oak;return Math.abs(z)<wd-.1&&y<ky+.14?K.oakD:0});
 sBox(-.1,.28,-.5,.1,.36,.5,K.oakL);sCap(-.2,.5,-.55,-1.0,.2,-1.3,.04,.04,K.oakD);sCap(-.2,.5,.55,-1.0,.2,1.3,.04,.04,K.oakD)}
function pierS(L){sBox(-.6,.25,0,.6,.4,L,(x,y,z)=>Math.floor(z*4)%2?K.oakL:K.oak);for(let z=.3;z<L;z+=1.4)for(const x of[-.5,.5])sCap(x,-4,z,x,.7,z,.09,.09,K.oakD)}

// ================= v3 BUILDINGS: sakura isle, observatory rock, harbour =================
const JR=rtile([K.rE,K.rEL,K.black]);
function pagodaS(s){const T=5;let y=0;sBox(-3.6,0,-3.6,3.6,.8,3.6,(x,yy,z)=>hsh(Math.floor(x*2.5),Math.floor(z*2.5)+Math.floor(yy*4))>.5?K.stone:K.stoneD,.06,.1);y=.8;
 for(let t=0;t<T;t++){const r=2.3-t*.28,hh=1.9-t*.1;
  sCyl(0,0,y,y+hh,r,r,(x,yy,z)=>{const a=Math.atan2(z,x);const post=Math.abs(((a*8/Math.PI/2)%1+1)%1-.5)>.44;if(post||yy<y+.15||yy>y+hh-.12)return K.vermil;const win=Math.abs(((a*4/Math.PI/2)%1+1)%1-.5)<.17&&yy>y+.5&&yy<y+hh-.5;return win?K.gWin:K.paper},{});
  sPyr(0,0,y+hh-.05,r+1.35,r+1.35,.95+.0,JR,{cur:1.9,lift:.45,round:0,th:.3});
  sBox(-r-.5,y+hh-.2,-r-.5,r+.5,y+hh-.05,r+.5,K.lacquer,.03);y+=hh+.55}
 sCap(0,y-.4,0,0,y+2.6,0,.1,.08,K.gold);for(let q=0;q<5;q++)sTor(0,y+q*.4,0,.28-q*.03,.05,'y',K.gold);sEll(0,y+2.7,0,.16,.2,.16,K.goldL)}
function teahouseS(s){const w=6,d=5;sBox(-w/2-.2,0,-d/2-.2,w/2+.2,.7,d/2+.2,(x,y,z)=>Math.floor(z*3)%2?K.oakL:K.oak,.04);
 for(const[x,z]of[[-2.6,-2],[2.6,-2],[-2.6,2],[2.6,2],[0,-2],[0,2]])sCyl(x,z,.7,3.2,.16,.15,K.vermilD);
 sBox(-2.6,.7,-2,2.6,3.2,2,(x,y,z)=>{if(Math.abs(x)<2.45&&Math.abs(z)<1.85)return 0;if(y<1.2)return K.oakD;const g=Math.floor(x*2.2+z*2.2)%2===0&&y>1.2&&y<2.9&&Math.abs(Math.abs(x)-2.6)<.3||Math.abs(Math.abs(z)-2)<.3;return(y>1.2&&y<2.9)?(g?K.gWin2:K.paper):K.oakD},.02);
 sFill(-.7,.7,d/2-.4,.7,2.7,d/2,(x,y,z)=>K.gWin);
 sPyr(0,0,3.2,w/2+1.5,d/2+1.5,2.0,JR,{cur:1.6,lift:.5,th:.34});sBox(-.35,5.3,-.35,.35,5.75,.35,K.gold,.1);
 for(const x of[-2.2,2.2])sCap(x,3.1,d/2+.6,x,2.4,d/2+.6,.03,.03,K.rope),sEll(x,2.15,d/2+.6,.3,.34,.3,K.gLamp)}
function toriiS(s){const W=2.6,H=4.4;for(const x of[-W,W]){sCyl(x,0,0,H,.3,.24,K.vermil);sCyl(x,0,0,.5,.36,.36,K.lacquer)}
 sCap(-W-.4,H-.9,0,W+.4,H-.9,0,.16,.16,K.vermil);
 for(let t=-1;t<=1;t+=.04){const x=t*(W+1.5),y=H+.2+t*t*.7;sCap(x,y,0,x+.1,y,0,.28,.28,K.lacquer);sCap(x,y-.2,0,x+.1,y-.2,0,.2,.16,K.vermil)}
 sBox(-.5,H-.9,-.05,.5,H-.2,.05,K.lacquer)}
function observatoryS(s){sCyl(0,0,0,.5,3.9,3.9,K.stoneL);sCyl(0,0,.5,4.2,3.5,3.3,(x,y,z)=>hsh(Math.floor(Math.atan2(z,x)*7),Math.floor(y*3))>.5?K.slab:K.stoneW);
 sFill(-.7,.5,2.8,.7,2.7,3.6,(x,y,z)=>y>2?(Math.hypot(x,y-2)<.7?K.oakD:0):Math.abs(x)<.7?K.oakD:0);
 for(let q=0;q<3;q++){const a=q*2.1+.8;sFill(Math.cos(a)*3.4-.35,2.4,Math.sin(a)*3.4-.35,Math.cos(a)*3.4+.35,3.5,Math.sin(a)*3.4+.35,(x,y,z)=>Math.hypot(x,z)>3.2?K.gBlue:0)}
 sTor(0,4.2,0,3.45,.18,'y',K.brass);
 // the dome: half a sphere, with the slit open to the sky
 sEll(0,4.2,0,3.3,3.0,3.3,(x,y,z)=>{if(y<4.2)return 0;if(Math.abs(z)<.55&&x>-.2&&y>4.4)return K.gStar;return(Math.floor(Math.atan2(z,x)*8)%2===0)?K.copper:K.copperD});
 sTor(0,4.2,0,3.3,.1,'y',K.brass);sCap(-.2,5.9,0,3.5,7.8,0,.22,.3,K.brass);sCap(2.6,7.2,0,4,8.3,0,.3,.34,K.goldL);sEll(0,7.1,0,.2,.2,.2,K.gold)}
function lighthouseS(s){sCyl(0,0,0,.6,3.3,3.0,K.stone);
 sCyl(0,0,.6,12.5,2.8,1.7,(x,y,z)=>{const b=Math.floor((y-.6)/1.8)%2;return(y>10.4?K.white:b?K.redL:K.white)});
 sCyl(0,0,12.5,12.8,2.5,2.5,K.lacquer);for(let q=0;q<10;q++){const a=q*.628;sCap(Math.cos(a)*2.3,12.8,Math.sin(a)*2.3,Math.cos(a)*2.3,13.7,Math.sin(a)*2.3,.06,.06,K.iron)}sTor(0,13.7,0,2.3,.07,'y',K.iron);
 sCyl(0,0,12.8,15.2,1.5,1.5,(x,y,z)=>Math.abs(Math.hypot(x,z)-1.5)<.35||true?K.gWin2:0,{hole:.5});sCyl(0,0,12.8,13,1.7,1.7,K.iron);sEll(0,14,0,.7,.9,.7,K.gStar);
 for(let q=0;q<8;q++){const a=q*.785;sCap(Math.cos(a)*1.45,12.9,Math.sin(a)*1.45,Math.cos(a)*1.45,15.1,Math.sin(a)*1.45,.07,.07,K.iron)}
 sPyr(0,0,15.1,1.9,1.9,1.5,K.rA,{cur:1.4,round:1,th:.5});sCap(0,16.5,0,0,17.5,0,.06,.06,K.iron);
 sFill(-.7,.6,2.5,.7,2.8,3.4,(x,y,z)=>(y>2?Math.hypot(x,y-2)<.7:Math.abs(x)<.7)&&Math.hypot(x,z)>2.2?K.oakD:0)}
function beamS(){sBegin(.25,0,0,3);sFill(0,-.5,-.6,16,.5,.6,(x,y,z)=>{const t=x/16;return Math.hypot(y/(.2+t*.5),z/(.2+t*.9))<1?K.gStar:0})}
function shackS(s){sBox(-2.2,0,-1.6,2.2,2.4,1.6,(x,y,z)=>Math.floor((Math.abs(z)>1.4?x:z)*4)%2?K.steel:K.ironL,.03);
 sGable(-2.2,2.2,-1.6,1.6,2.4,.9,(x,y,z)=>Math.floor(x*4)%2?K.rust:K.iron,{ov:.3,cur:.1});sFill(-.55,0,1.45,.55,1.9,1.62,K.oakD);sFill(1,1.1,1.45,1.8,1.8,1.62,K.gWin);sCap(1.6,2.4,-.7,1.6,3.8,-.7,.13,.13,K.iron)}
function hullS(s){sFill(-2.4,.6,-.9,2.4,2.2,.9,(x,y,z)=>{const t=x/2.4,wd=.9*(1-Math.pow(Math.abs(t),2)),ky=.7+Math.abs(t)*Math.abs(t)*.7;const rib=Math.abs(((x*2)%1+1)%1-.5)<.1;if(Math.abs(z)>wd||y<ky)return 0;if(Math.abs(Math.abs(z)-wd)<.12&&y<ky+.7+(s&1?0:.6))return rib?K.oakD:(x<0.4*(s%3-1)+.5?K.pineW:0);return 0});
 sCap(-2.4,1.5,0,2.4,1.5,0,.07,.07,K.oakD);sCap(-1.6,.7,0,1.6,.7,0,.1,.1,K.oakL);
 for(const x of[-1.5,1.5])sBox(x-.2,0,-.8,x+.2,.7,.8,K.oakD,.04)}
function craneS(s){sBox(-.9,0,-.9,.9,.4,.9,K.iron,.05);sCyl(0,0,.4,5.8,.4,.32,K.ironL);
 sCap(-1.6,5.8,0,4.6,6.5,0,.2,.14,K.rust);sCap(-1.3,5.8,0,-1.8,5,0,.15,.15,K.iron);sBox(-2.1,4.4,-.4,-1.4,5.2,.4,K.steel,.06);sCap(0,5.8,0,3.8,6.4,0,.05,.05,K.ironL)}
function hookS(){sBegin(.1,0,.4,2);sCap(0,0,0,0,-2.5,0,.04,.04,K.rope);sBox(-.2,-3,-.15,.2,-2.5,.15,K.iron,.06);sCap(0,-3.2,0,0,-3.6,.0,.07,.07,K.iron)}
function jettyS(L){sBox(-1,.5,0,1,.7,L,(x,y,z)=>Math.floor(z*3.5)%2?K.oakL:K.oak);for(let z=.4;z<L;z+=1.8)for(const x of[-.9,.9])sCap(x,-5,z,x,1.2,z,.11,.11,K.oakD);sCap(0,.7,L,0,2.4,L,.09,.09,K.oakD);sEll(0,2.65,L,.28,.34,.28,K.gLamp)}

// ================= v3 BUILDINGS: the castle kingdom =================
const stoneFn=(x,y,z)=>hsh(Math.floor(x*3)+Math.floor(y*2.5)*5,Math.floor(z*3)+Math.floor(y*2.5))>.55?K.cstoneL:(hsh(Math.floor(x*2),Math.floor(y*2)+Math.floor(z*2))>.8?K.cstoneD:K.cstone);
const ringStone=(x,y,z)=>hsh(Math.floor(Math.atan2(z,x)*8),Math.floor(y*2.5))>.55?K.cstoneL:K.cstone;
function crenel(cx,cz,r,y,col){const n=Math.max(8,Math.round(r*4));for(let q=0;q<n;q++){if(q&1)continue;const a=q/n*6.283;sBox(cx+Math.cos(a)*r-.28,y,cz+Math.sin(a)*r-.28,cx+Math.cos(a)*r+.28,y+.7,cz+Math.sin(a)*r+.28,col||K.cstoneL,.04)}}
function roundTowerS(s,o){o=o||{};const r=o.r||2.4,H=o.h||9;sCyl(0,0,0,H,r+.25,r,ringStone,{});sTor(0,H,0,r+.3,.2,'y',K.stoneD);sCyl(0,0,H,H+.35,r+.7,r+.7,K.stoneL);
 for(let q=0;q<3;q++){const y=2.6+q*2.5,a=q*2.1+.6;sFill(Math.cos(a)*r-.2,y,Math.sin(a)*r-.2,Math.cos(a)*r+.2,y+.7,Math.sin(a)*r+.2,(x,yy,z)=>Math.hypot(x,z)>r-.15?K.shade:0)}
 if(o.cone){sCyl(0,0,H+.35,H+.4+o.cone,r+.9,.05,(x,y,z)=>Math.floor((y*3+Math.atan2(z,x)*2))%2?K.rB:K.rBL,{});sCap(0,H+o.cone,0,0,H+o.cone+1.4,0,.05,.05,K.iron);sBox(0,H+o.cone+.8,-.02,.9,H+o.cone+1.35,.02,K.red)}
 else crenel(0,0,r+.55,H+.35)}
function wallS(L,o){o=o||{};const H=o.h||6,T=1.1;// along local x from 0..L
 sBox(0,0,-T,L,H,T,(x,y,z)=>stoneFn(x,y,z),.05);sBox(0,H,-T-.1,L,H+.35,T+.1,K.stoneL);
 for(let x=.2;x<L-.3;x+=1.2){sBox(x,H+.35,-T-.1,x+.7,H+1.05,-T+.35,K.stoneL,.04);sBox(x,H+.35,T-.35,x+.7,H+1.05,T+.1,K.cstoneL,.04)}
 if(o.buttress)for(let x=1;x<L;x+=4)sBox(x,0,T,x+.8,H*.7,T+.6,K.stone,.1)}
function gateS(s){const w=8,d=4,H=9;sBox(-w/2,0,-d/2,w/2,H,d/2,stoneFn,.05);
 sFill(-1.5,0,-d/2-.1,1.5,5,d/2+.1,(x,y,z)=>(y>3.5?Math.hypot(x,(y-3.5)*1.0)<1.5:Math.abs(x)<1.5)?-1:0);
 for(let q=0;q<5;q++){const x=-1.2+q*.6;sCap(x,1,0,x,4.6,0,.05,.05,K.iron)}for(let q=0;q<5;q++)sCap(-1.4,1+q*.7,0,1.4,1+q*.7,0,.04,.04,K.iron);
 for(const x of[-w/2,w/2])sCyl(x,-d/2,0,H+1,1.5,1.35,ringStone);for(const x of[-w/2,w/2])sCyl(x,d/2,0,H+1,1.5,1.35,ringStone);
 for(const x of[-w/2,w/2]){for(const z of[-d/2,d/2])sPyr(x,z,H+1,2.0,2.0,2.8,(X,Y,Z)=>Math.floor(Y*3)%2?K.rB:K.rBL,{cur:1.1,round:1});}
 sBox(-w/2+.5,H,-d/2,w/2-.5,H+.4,d/2,K.stoneL);crenel(0,0,0,0);
 for(const x of[-2.4,2.4])sFill(x-.3,H-3,d/2-.14,x+.3,H-1.8,d/2+.02,K.gWin);sBox(-.6,H-4,d/2,.6,H-2.6,d/2+.1,K.red,.05)}
function keepS(s){let y=0;sCyl(0,0,0,3.4,8.6,7.2,(x,yy,z)=>hsh(Math.floor(Math.atan2(z,x)*10),Math.floor(yy*2))>.5?K.stoneD:K.stone,{});sCyl(0,0,3.4,3.6,7.1,7.1,K.stoneL);y=3.6;
 const T=[[6,4.2,7.2],[4.6,3.8,5.6],[3.3,3.4,4.2]];T.forEach((t,i)=>{const[r,h,ov]=t;
  sBox(-r,y,-r,r,y+h,r,(x,yy,z)=>{const zf=Math.abs(z)>r-.2,xf=Math.abs(x)>r-.2;if(!xf&&!zf)return K.plaster;const u=zf?x:z;
   const win=Math.abs(((u/2+50)%1)-.5)<.17&&yy>y+1.2&&yy<y+h-1;if(win)return K.gWin;if(yy<y+.5)return K.lacquer;return(Math.abs(((u/2+50)%1)-.5)>.45)?K.lacquer:K.white},.05);
  sPyr(0,0,y+h-.1,ov,ov,2.3-i*.2,JR,{cur:1.9,lift:.8,th:.36});y+=h+1.7-i*.1});
 sCap(0,y-.4,0,0,y+1.8,0,.1,.08,K.gold);sEll(0,y+1.9,0,.2,.3,.2,K.goldL);
 for(const sx of[-1,1])sCap(sx*3.6,y-1.8,0,sx*3.9,y-.5,0,.2,.1,K.gold);
 sFill(-1,.0,6.2,1,3.2,7.6,(x,yy,z)=>(yy>2.4?Math.hypot(x,(yy-2.4)*1.2)<1:Math.abs(x)<1)&&Math.hypot(x,z)>5.4?K.oakD:0)}
function chapelS(s){const w=4.4,d=8;sBox(-w/2,0,-d/2,w/2,3.6,d/2,(x,y,z)=>(Math.abs(x)>w/2-.2&&Math.abs(((z+9)%2))<.35)?K.stoneD:stoneFn(x,y,z),.05);
 sGable(-d/2,d/2,-w/2,w/2,3.6,2.6,rtile([K.rB,K.rBL,K.rE]),{ov:.4});
 for(let q=0;q<3;q++){const z=-2.4+q*2.4;sFill(w/2-.15,.8,z-.4,w/2+.02,3,z+.4,(x,y,zz)=>Math.hypot(zz-z,Math.max(0,y-2.4))<.4+0&&y>.8?([K.gBlue,K.gRed,K.gGreen][q%3]):0)}
 sBox(-1.4,0,d/2,1.4,7.8,d/2+2.8,stoneFn,.05);sPyr(0,d/2+1.4,7.8,1.9,1.9,3.8,(x,y,z)=>Math.floor(y*3)%2?K.copper:K.copperD,{cur:1.4});sCap(0,d/2+1.4,11.6,0,d/2+1.4,12.8,.06,.06,K.gold);
 sFill(-.6,5.2,d/2+2.8-.1,.6,6.8,d/2+2.8+.02,(x,y,z)=>Math.hypot(x,Math.max(0,y-6))<.6?K.gWin2:0);sFill(-.8,0,d/2+2.8-.1,.8,2.6,d/2+2.8+.02,(x,y,z)=>(y>1.8?Math.hypot(x,y-1.8)<.8:Math.abs(x)<.8)?K.oakD:0)}
function libraryS(s){sBox(-3.5,0,-3,3.5,4.2,3,stoneFn,.06);for(let q=0;q<4;q++){const x=-2.4+q*1.6;sFill(x-.4,.9,2.86,x+.4,3.5,3.02,(X,Y)=>(Y>2.8?Math.hypot(X-x,Y-2.8)<.4:true)?K.gWin2:0)}
 sGable(-3.5,3.5,-3,3,4.2,2.2,rtile(ROOFS.moss),{ov:.5});sEll(0,6.8,0,1.7,1.2,1.7,(x,y,z)=>y<6.4?0:(Math.floor(Math.atan2(z,x)*6)%2?K.copper:K.copperD));sCyl(0,0,4.2,6.6,1.5,1.5,K.stoneL,{});sCap(0,7.8,0,0,8.7,0,.05,.05,K.gold)}
function smithyS(s){sBox(-2.6,0,-2,2.6,3,2,stoneFn,.05);sGable(-2.6,2.6,-2,2,3,1.7,rtile(ROOFS.slate),{ov:.5});sBox(1.4,2.4,-1.8,2.3,6.4,-1,stoneFn,.05);sBox(1.3,6.4,-1.9,2.4,6.6,-.9,K.stoneL);
 sFill(-1.2,.2,1.8,1.2,2.4,2.04,(x,y,z)=>Math.abs(y-1.3)<.9?K.gFire:K.lacquer);sBox(-2.2,0,1.9,-1.5,.8,2.5,K.iron,.08);sBox(-2.4,.8,1.8,-1.3,1,2.6,K.ironL,.06)}
function fountainS(s){sCyl(0,0,0,.7,3.6,3.6,K.stoneL);sCyl(0,0,.7,.9,3.1,3.1,K.aqua);sCyl(0,0,.9,1.8,.45,.35,K.stone);sCyl(0,0,1.8,2,1.6,1.6,K.stoneL);sCyl(0,0,2,2.14,1.35,1.35,K.aqua);sCyl(0,0,2.1,3.1,.18,.1,K.waterL);sEll(0,3.2,0,.35,.3,.35,K.waterL);
 for(let q=0;q<8;q++){const a=q*.785;sCap(Math.cos(a)*.3,3.2,Math.sin(a)*.3,Math.cos(a)*1.3,2.15,Math.sin(a)*1.3,.05,.05,K.waterL)}}
function statueS(s){sBox(-.45,0,-.45,.45,.8,.45,K.stoneL,.05);sEll(0,1.7,0,.32,.62,.24,K.stoneW);sEll(0,2.45,0,.22,.24,.22,K.stoneW);sCap(.25,1.9,0,.5,2.6,0,.09,.07,K.stoneW);sEll(.52,2.75,0,.18,.22,.18,K.gLamp)}
function airshipS(s){const L=8,c=[K.red,K.blue,K.green][s%3];
 sEll(0,5.8,0,L,2.9,2.9,(x,y,z)=>Math.floor((Math.atan2(z,y-5.8)*5+x*0))%2?c:K.cream,.0);sTor(0,5.8,0,2.9,.1,'x',K.brass);
 sBox(-2,1.6,-1.1,2.6,2.9,1.1,(x,y,z)=>y>2.5?K.oakL:K.oak,.3);for(const sx of[-1.6,0,1.6])sCap(sx,2.8,0,sx*1.2,4.1,0,.04,.04,K.rope);
 for(const z of[-1.0,1.0])for(const x of[-1.6,0,1.6,2.4])sCap(x,2.7,z,x*1.4,4.2,z*2.2,.03,.03,K.rope);sBox(-6.5,5.3,-.1,-8.3,7.8,.1,K.rD);sBox(-6.5,5.8,-2,-8,6,2,K.rD,.05);sBox(-6.5,4,-.1,-8.3,5.8,.1,K.rD)}
function propS(){sBegin(.1,0,.4,4);sEll(0,0,0,.2,.2,.3,K.brass);for(let q=0;q<3;q++){const a=q*2.09;sCap(0,0,0,Math.cos(a)*1.2,Math.sin(a)*1.2,0,.12,.06,K.oakL)}}
function daisS(s){sCyl(0,0,0,.3,3.4,3.4,K.stoneL);sCyl(0,0,.3,.6,2.8,2.8,K.stone);
 sBox(-.5,.6,-.4,.5,1.2,.4,K.red,.1);sBox(-.5,.6,.4,.5,2.7,.6,(x,y,z)=>(y>2.1?K.goldL:K.oakD),.1);sBox(-.55,1.2,-.5,-.4,1.9,.5,K.oakD);sBox(.4,1.2,-.5,.55,1.9,.5,K.oakD);sEll(0,2.65,.5,.35,.35,.1,K.gold)}
function dockS(L){sBox(-1.2,.2,0,1.2,.4,L,(x,y,z)=>Math.floor(z*3)%2?K.oakL:K.oak);for(let z=.4;z<L;z+=1.7)for(const x of[-1.1,1.1])sCap(x,-5,z,x,1.2,z,.12,.12,K.oakD);for(let z=.4;z<L;z+=1.7)for(const x of[-1.1,1.1])sBox(x-.08,.4,z-.08,x+.08,1,z+.08,K.oakD)}
function millS(s){sCyl(0,0,0,.5,2.8,2.8,K.stone);sCyl(0,0,.5,6.2,2.5,1.7,(x,y,z)=>hsh(Math.floor(Math.atan2(z,x)*6),Math.floor(y*3))>.5?K.white:K.plaster2);
 sFill(-.5,.5,1.9,.5,2.3,2.6,(x,y,z)=>(y>1.7?Math.hypot(x,y-1.7)<.5:Math.abs(x)<.5)&&Math.hypot(x,z)>1.7?K.oakD:0);sCyl(0,0,6.2,6.4,2,2,K.oakD);sCyl(0,0,6.4,8.4,1.9,.05,(x,y,z)=>Math.floor(y*3)%2?K.rA:K.rAL);sCap(0,7,1.5,0,7,2.6,.3,.3,K.oakD)}

// ================= v3 PLACEMENT: every isle =================
function siteOK(fi,fj,r){const a=Math.floor(fi+.5),b=Math.floor(fj+.5);for(const[x,z]of[[-r,-r],[r,-r],[-r,r],[r,r],[0,0],[r,0],[-r,0],[0,r],[0,-r]]){const t=colTop(a+Math.round(x),b+Math.round(z));if(t===null)return false}return true}
// level a patch so a building doesn't hang off a slope: raise low columns, shave high ones
function flat(fi,fj,rx,rz,minTop){rz=rz===undefined?rx:rz;const ca=Math.floor(fi+.5),cb=Math.floor(fj+.5),a0=Math.floor(fi+.5-rx),a1=Math.floor(fi+.5+rx),b0=Math.floor(fj+.5-rz),b1=Math.floor(fj+.5+rz);
 const tc=colTop(ca,cb);if(tc===null)return;const topId=VOX[VI(ca,tc,cb)],tg=minTop!==undefined?minTop:tc;
 for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++){const t=colTop(a,b);if(t===null)continue;
  if(t<tg){for(let y=t+1;y<=tg;y++)setV(a,y,b,y===tg?topId:BL.EARTH);HT[CI(a,b)]=tg}
  else if(t>tg){for(let y=tg+1;y<=t;y++)setV(a,y,b,0);setV(a,tg,b,topId);HT[CI(a,b)]=tg}}}
function P3(fi,fj,res,fn,o){if(typeof fn!=='function'){console.error('voxel ERR badfn '+fi+','+fj);return false}o=o||{};if(o.flat)flat(fi,fj,o.flat[0],o.flat[1]);return mk3(fi,fj,res,fn,o)}
function lamp3(fi,fj,col){const g=gY(fi,fj);if(g===null)return;if(!mk3(fi,fj,.125,PR.lamp,{rs:.6}))return;lightAt(fi+.5,g+3.1,fj+.5,11,3,0)}
function fence3(a0,b0,a1,b1){const L=Math.hypot(a1-a0,b1-b0),n=Math.max(1,Math.round(L/1.2)),dx=(a1-a0),dz=(b1-b0);
 const g=gY(a0,b0);if(g===null)return;sBegin(.125,0,.3,3);
 for(let q=0;q<=n;q++){const x=dx*q/n,z=dz*q/n;sCap(x,0,z,x,1,z,.08,.07,K.oakD);sEll(x,1.05,z,.1,.07,.1,K.oakL)}
 for(const y of[.38,.78])sCap(0,y,0,dx,y,dz,.05,.05,K.oakL);sFlush(PB,a0+.5,g,b0+.5,false)}
function fenceLoop(pts){for(let q=0;q<pts.length-1;q++)fence3(pts[q][0],pts[q][1],pts[q+1][0],pts[q+1][1])}
function scatter(name,list,res,o){for(const p of list)mk3(p[0],p[1],res||.125,PR[name],Object.assign({seed:(p[0]*7+p[1]*3)|0,rs:.5},o||{}))}
const HSTY=[['cream','red'],['sand','blue'],['sage','plum'],['rose','moss'],['sun','red'],['white','slate'],['cream','ochre'],['sage','red']];
function house3(fi,fj,i,o){o=Object.assign({},o||{});const st=HSTY[((i|0)+Math.floor(fi*.37))%HSTY.length];o.wall=o.wall||WALLS[st[0]];o.roof=o.roof||ROOFS[st[1]];if(o.fl===undefined&&(i%3===1))o.fl=2;if(o.boxes===undefined)o.boxes=(i%2);
 if(!siteOK(fi,fj,(o.w||6)/2))return false;flat(fi,fj,(o.w||6)/2+.5,(o.d||5)/2+.5);putHouse(fi,fj,o,(o.rot|0)%4);return true}
function village(){
 // ---- the village isle ----
 [[22.4,3.8,0],[28.2,3.6,0],[23.2,10.8,1],[29.6,11.0,3],[23.0,15.0,0],[30.2,15.2,2],[17.6,26.0,1],[9.6,22.4,0],[16.8,30.4,2],[9.0,28.8,3],[11.8,35.2,0],[14.2,11.8,1],[11.8,7.6,0],[36.9,20.6,2]].forEach((p,i)=>house3(p[0],p[1],i,{rot:p[2]}));
 if(siteOK(19.8,9.5,4)){flat(19.8,9.5,4.4,3.4);P3(19.8,9.5,.25,barnS,{rs:5.5,rs2:4.5,seed:3})}
 for(const p of[[16.6,12],[17.9,13.2]])P3(p[0],p[1],.125,coopS,{rs:1.8,flat:[1.5,1.5]});
 if(siteOK(8.6,4.4,3)){flat(8.6,4.4,3.2);P3(8.6,4.4,.2,windmillS,{rs:4});const g=gY(8.6,4.4);if(g!==null)ani(8.6,4.4,g+7.9,.2,windmillSails,(m,t)=>{m.g.rotation.z=t*.5;m.g.position.z=m.z0+2.3},{});}
 P3(19.4,21.8,.25,boathouseS,{rs:4,y:undefined,rot:1});
 for(const p of[[14.9,9.6],[16.9,10.4],[13.4,8.2],[24.3,12.5],[28.5,12.6],[28.2,15.3]])P3(p[0],p[1],.125,stallS,{rs:1.8,rot:p[0]>20?1:0,flat:[1.6,1.2]});
 P3(26.5,12.6,.125,PR.well,{rs:1.4,flat:[1.2,1.2]});
 for(const p of[[18.6,36.6],[35.6,40.2]])P3(p[0],p[1],.2,lookoutS,{rs:2.4,flat:[1.8,1.8]});
 P3(34.4,10.8,.2,shrineS,{rs:2.4,flat:[1.6,1.6]});P3(51,15.6,.2,hutS,{rs:3,flat:[2.3,2.3]});
 // water mill wheel beside the mill house, spinning
 {const g=gY(35.3,22.9);if(g!==null)ani(35.3,22.9,g+1.7,.1,wheelS,(m,t)=>{m.g.rotation.x=t*.9},{rot:1})}
 // camp, lamps, benches, washing lines, carts, bales
 P3(13.4,31.8,.125,PR.campfire,{rs:1.4});{const g=gY(13.4,31.8);if(g!==null)lightAt(14.05,g+1,32.3,9,3.4,2)}
 for(const p of[[12.3,32.6,0],[14.6,30.9,1]])P3(p[0],p[1],.125,PR.bench,{rot:p[2]?1:0,rs:1});
 for(const p of[[25,8],[27,8],[25,11],[28,12],[25,16],[27,16],[24,6],[29,6],[20,20],[14,25],[20,32],[26,18],[31,19],[17,14],[12,16],[34,26],[38,36],[22,34]])lamp3(p[0],p[1]);
 scatter('bench',[[24.1,13.4],[29.4,13.9],[21,19.4],[30.8,32]],.125,{rot:1});
 scatter('laundry',[[12,25.8],[13.9,38.4]],.125,{rs:2});
 P3(15.2,23.5,.125,PR.cart,{rs:1.6,rot:1});P3(12.5,13,.125,PR.cart,{rs:1.6});
 scatter('hay',[[13.4,12.4],[19.6,14.2],[11.6,15.2],[26,28.8],[37.2,27.6]]);scatter('haystack',[[15.2,15],[10.4,16.8],[33.5,29]],.125,{rs:1.5});
 scatter('barrel',[[14.2,10.4],[22.1,12.1],[30.3,12.6],[25.6,19.4],[20.9,23.6],[28.4,10.7],[12.2,36.4],[18.4,34]]);
 scatter('crate',[[14.4,7.6],[17.6,8.4],[22.8,8.2],[27.6,17.4],[10.2,26],[29.2,35.2]]);
 scatter('woodpile',[[10.2,9.2],[26.5,3],[19.2,28],[52.4,17.8],[33.1,14.4]],.125,{rs:1.2,rot:1});scatter('tyres',[[29.6,18.1],[21.4,11],[34.2,32.4]],.125,{rs:1.4});
 scatter('signpost',[[19.6,15.6],[24.4,20],[33.5,24.5],[16.7,22.6]]);scatter('postbox',[[24.8,13.6],[21.3,5.4]]);
 for(const p of[[31.5,5],[24.2,21.5],[10.8,14.5],[32.5,34],[15,30],[20.5,26.2],[11.6,30.2]])P3(p[0],p[1],.125,PR.pot,{rs:.5,seed:p[0]|0});
 // the pond: a pier, rowboats, lilies and ducks come from the water pass
 {const g=gY(26.5,17);if(g!==null){sBegin(.2,0,.3,3);pierS(6);sFlush(PB,27,-.6,17.7,false)}}
 for(const p of[[25,23.6,1.2],[29,26,.4]]){sBegin(.125,0,.4,2);rowboatS(2);sFlush(PB,p[0],WSY-.35,p[1],false)}
 // farm
 fenceLoop([[10.1,13.1],[14.6,13.1],[14.6,17.5],[10.1,17.5],[10.1,13.1]]);
 for(const p of[[11.2,15],[12.8,14.4],[13.4,16.2]])P3(p[0],p[1],.125,PR.sunflower,{rs:.4});
 P3(12,15.6,.125,PR.scarecrow,{rs:1});scatter('hive',[[53,12.4],[54,14.2],[52.5,19.2]]);
 scatter('pumpkin',[[11.4,16.8],[13.8,14],[12.2,12.4],[34.6,13],[35.4,12.1],[20.6,14.5]]);
 scatter('rock',[[15.6,34],[9.4,33],[34.2,38],[28,40],[48,19],[52.4,12.2],[7,17],[40.5,27],[18.4,2.2]]);
 scatter('mushroom',[[16.4,36],[34.8,36.4],[13,3.4],[30,33],[48.6,13.8]]);scatter('stump',[[9.8,5.6],[39.8,19],[44,24],[13.6,38.2],[50,21]],.125,{rs:.8});
 scatter('logS',[[10.6,8.6],[43.3,25],[50.4,13]],.125,{rs:1});scatter('bush',[[20.4,19],[24.6,26.8],[31.6,28.4],[12.6,20.6],[34,16.6],[18.2,5.6],[40,34]],.125,{rs:1.2});
 scatter('flowerbox',[[24.2,4.4],[29.8,4.4],[24.5,11.8]])}
function sakuraIsle(){
 {const fi=111,fj=17;if(siteOK(fi,fj,3.6)){flat(fi,fj,4,4);P3(fi,fj,.25,pagodaS,{rs:5,seed:5})}}
 P3(91.5,33,.25,teahouseS,{rs:4.5,rs2:4,flat:[3.8,3.2]});
 P3(85.8,19.6,.2,toriiS,{rs:3.6,rs2:1,rot:0});P3(104.3,40.2,.2,toriiS,{rs:3.6,rs2:1,rot:0});
 P3(97.6,29.9,.125,PR.picnic,{rs:2});
 for(const p of[[101,33],[101,37],[107,33],[107,37],[95,28],[85,33],[110,30],[116,37],[88,34],[96,36],[92,22],[100,20],[108,22],[114,26],[90,27]]){if(mk3(p[0],p[1],.125,PR.stoneLantern,{rs:.6})){const g=gY(p[0],p[1]);lightAt(p[0]+.5,g+1.4,p[1]+.5,10,2.4,1)}}
 scatter('basin',[[93,35.6],[89.6,30.8]]);scatter('cairn',[[97.4,31.6],[84.6,26],[106,27.4],[112,34]]);
 scatter('rock',[[86,36],[94.4,18.6],[103,22.6],[115.8,31.8],[88.2,23],[108.6,35.6],[99,41.8]]);
 scatter('bamboo',[[116,22],[117,24],[116.6,19.4],[115.2,26],[84.6,24],[83.8,28],[118,28.6]],.125,{rs:1});
 scatter('bench',[[96,32.2],[98.8,34.4],[100.6,23]],.125,{rs:1,rot:1});scatter('postbox',[[103,21.8]])}
function observatoryRock(){
 {const fi=133.4,fj=25.2;flat(fi,fj,4.6);P3(fi,fj,.2,observatoryS,{rs:5.4,seed:2})}
 P3(139,31,.125,PR.dish,{rs:2.2,flat:[1.6,1.6]});P3(136.4,31.4,.125,PR.mast,{rs:1.2});P3(129.8,23.4,.125,PR.tripod,{rs:1.2});
 P3(130.4,29,.125,PR.orrery,{rs:2});{const g=gY(130.4,29);if(g!==null)ani(130.4,29,g+1.55,.1,()=>{sBegin(.1,0,.4,2);sEll(1.1,0,0,.12,.12,.12,K.aqua);sEll(-1.5,0,0,.16,.16,.16,K.tang);sEll(0,0,.7,.1,.1,.1,K.red)},(m,t)=>{m.g.rotation.y=t*.6})}
 for(let q=0;q<7;q++){const a=q/7*6.283;mk3(129.7+Math.cos(a)*3,34.7+Math.sin(a)*3,.125,PR.standing,{seed:q+4,rs:.8})}
 scatter('bench',[[135.2,35.6],[127.6,27]],.125,{rs:1});scatter('signpost',[[124.7,29]]);scatter('crate',[[137.5,22.2],[138.4,23.4]]);scatter('barrel',[[138.6,28.2],[126.4,24]]);
 for(const p of[[127,31],[140,26],[132,36],[126,22],[137,35]]){if(mk3(p[0],p[1],.125,PR.stoneLantern,{rs:.6})){const g=gY(p[0],p[1]);lightAt(p[0]+.5,g+1.4,p[1]+.5,10,2.4,1)}}
 scatter('rock',[[125,26],[141,28],[128,36],[139,36.4],[123.6,31]]);scatter('mushroom',[[126,33],[140,24]])}
function harbour(){
 P3(95,58.6,.25,lighthouseS,{rs:3.8,flat:[3,3],seed:1});
 {const g=gY(95,58.6);if(g!==null){lightAt(95.5,g+14,59.1,30,4,3);ani(95,58.6,g+14,.25,beamS,(m,t)=>{m.g.rotation.y=t*.7;m.g.visible=CUR.night>.12},{rot:0,beam:true})}}
 P3(92.2,55.4,.2,shackS,{rs:3,flat:[2.3,1.8]});
 P3(97.4,60.2,.2,hullS,{rs:3,seed:1,rot:1});P3(93,60.4,.2,hullS,{rs:3,seed:2});
 {P3(99.6,57,.2,craneS,{rs:2.4});const g=gY(99.6,57);if(g!==null)ani(99.6,57,g+6.4,.1,hookS,(m,t)=>{m.g.position.x=m.x0+2.5+Math.sin(t*.4)*.9;m.g.position.y=m.y0-Math.sin(t*.7)*.3},{})}
 scatter('crate',[[93.6,59.2],[91.4,53.6]]);scatter('barrel',[[98.6,60.6],[96,61.4],[94.6,52.8]]);scatter('postbox',[[90.6,56]]);scatter('woodpile',[[93.2,58]],.125,{rs:1.2});scatter('reed',[[99.2,54.6]]);
 lamp3(97,54);lamp3(103.4,52.6);
 {const g=gY(95.6,64.5);if(g!==null){sBegin(.25,0,.4,4);jettyS(7);sFlush(PB,96.1,g-.3,65.3,false)}}
 scatter('rock',[[88.4,52],[100.2,63.6],[104,49.4],[89.4,60.8]]);scatter('bush',[[96.4,52],[91.6,58.2],[101.8,57.6]],.125,{rs:1})}

function castle(){
 // ---- the ward: curtain walls, corner towers, two gatehouses, the keep ----
 const west=127,east=146,b0=47,b1=65;reserve(west-2,b0-2,east+2,b1+2);
 for(const[a,b,rot,L,gap]of[[west,b0,0,19,1],[west,b1,0,19,1],[west,b0,1,18,0],[east,b0,1,18,0]]){
  const segs=gap?[[0,7.5],[12,19]]:[[0,18]];
  for(const sg of segs){const aa=rot?a:a+sg[0],bb=rot?b+sg[0]:b;const g=gY(aa,bb);if(g===null)continue;sBegin(.25,rot?1:0,.3,5);wallS(sg[1]-sg[0],{h:5.6});sFlush(PB,aa+.5,g-.2,bb+.5,false)}}
 for(const p of[[west,b0],[east,b0],[west,b1],[east,b1],[west,56],[east,56]]){P3(p[0],p[1],.25,roundTowerS,{rs:3.4,seed:p[0]+p[1],flat:[2.8,2.8]});const g=gY(p[0],p[1]);if(g!==null)lightAt(p[0]+.5,g+7.5,p[1]+.5,9,1.8,1)}
 P3(137,b0,.25,gateS,{rs:5,rs2:3,rot:0});P3(137,b1,.25,gateS,{rs:5,rs2:3,rot:2});
 {const fi=136.5,fj=53.3;flat(fi,fj,8,8);P3(fi,fj,.25,keepS,{rs:9,seed:7});const g=gY(fi,fj);if(g!==null){lightAt(fi+.5,g+9,fj+.5,16,3.4,2);lightAt(fi+.5,g+14,fj+.5,14,3,2)}}
 for(const p of[[126.8,57.4],[144.2,57.6]])P3(p[0],p[1],.25,roundTowerS,{rs:3,seed:3,flat:[2.6,2.6],y:undefined});
 for(const p of[[134,43],[139,43]]){P3(p[0],p[1],.125,PR.brazier,{rs:.8});const g=gY(p[0],p[1]);if(g!==null)lightAt(p[0]+.5,g+1.4,p[1]+.5,13,3.6,2)}
 for(const p of[[127.4,48.6],[127.6,52.6]])house3(p[0]+2.4,p[1],4,{wall:K.stoneW,roof:ROOFS.slate,w:5,d:4,rot:1});
 for(const p of[[131,50],[142,50],[131,61],[142,61],[136.5,45]])P3(p[0],p[1],.125,PR.bannerPole,{rs:.6,seed:p[0]|0,sw:true});
 scatter('bench',[[132,56],[141,56],[136.5,62]],.125,{rs:1});
 for(const p of[[133,47.6],[140,47.6],[133,64],[140,64],[130,58],[143,58]])lamp3(p[0],p[1]);
 // ---- the town: avenue, square, fountain, stalls, houses ----
 {flat(136.5,78,5);P3(136.5,78,.2,fountainS,{rs:4.2,seed:2});const g=gY(136.5,78);if(g!==null)lightAt(136.5,g+3.5,78.5,12,2.2,1)}
 for(let q=0;q<4;q++){const a=q*1.571+.78;P3(136.5+Math.cos(a)*5.1,78+Math.sin(a)*5.1,.125,statueS,{rs:.7,rot:q})}
 for(const[p,i]of[[[130.5,75.6],0],[[142.5,75.8],1],[[130.4,80.8],2],[[142.6,81],3],[[133,84],0],[[140,84],2]])P3(p[0],p[1],.125,stallS,{seed:i,rs:1.8,rot:p[0]<136?1:3,flat:[1.6,1.2]});
 for(let b=68;b<100;b+=4){lamp3(133.2,b);lamp3(139.8,b)}
 P3(127.6,71.6,.25,libraryS,{rs:4.2,rs2:3.8,flat:[4,3.4],rot:1});P3(129.4,89.2,.25,smithyS,{rs:3.6,rs2:3,flat:[3,2.6],rot:1});
 {const g=gY(129.4,89.2);if(g!==null)lightAt(131.6,g+1.4,89.7,9,3,2)}
 P3(149,83.8,.25,chapelS,{rs:4,rs2:7,flat:[3,6],rot:3,seed:9});
 [[121.5,76,1],[122,82,1],[121,89,1],[125.2,81.6,1],[125,95,0],[131,97,0],[121,98,0],[143.6,90,3],[150.6,91,3],[144,96,3],[151.2,98,3],[156,92,3],[147,100,2],[119.4,85.2,1],[153,76,3],[155.2,84,3]].forEach((p,i)=>house3(p[0],p[1],i+1,{rot:p[2],roof:i%2?ROOFS.slate:ROOFS.ochre,wall:i%3?K.plaster2:K.stoneW,fl:i%2?2:1,w:5+(i%2),d:5}));
 // hedge maze
 {const A=145.2,B=68.7,n=7;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const edge=i===0||j===0||i===n-1||j===n-1,w=edge||(i%2===0&&j%2===0)||(i%2===0&&h2(i*5,j*3)>.45)||(j%2===0&&h2(i*3,j*7)>.45);const gate=(i===3&&j===0)||(i===3&&j===n-1);if(!w||gate)continue;mk3(A-3+i*1.0,B-3+j*1.0,.125,PR.topiary2&&(i%2===0&&j%2===0&&!edge)?PR.topiary:(i%2?PR.hedgeV:PR.hedgeSeg),{seed:i*7+j,rs:.1})}
  P3(A,B,.2,fountainS,{rs:1,seed:1});reserve(Math.floor(A-4),Math.floor(B-4),Math.ceil(A+4),Math.ceil(B+4))}
 // formal garden before the keep
 for(const p of[[131.5,69],[141.5,69]]){P3(p[0],p[1],.125,PR.topiary,{rs:.8});}
 P3(136.5,68,.125,PR.starStone,{rs:1});
 // the orchard, mill and farm
 {if(siteOK(158.6,74,3)){flat(158.6,74,3.2);P3(158.6,74,.2,millS,{rs:4});const g=gY(158.6,74);if(g!==null)ani(158.6,74,g+7,.2,windmillSails,(m,t)=>{m.g.rotation.z=t*.45;m.g.position.z=m.z0+2.2})}
  house3(163.6,84.6,2,{wall:K.plaster,roof:ROOFS.thatch,w:7,d:5});scatter('hive',[[160,80],[161.2,81.4]]);scatter('hay',[[160.4,88],[166,80.6]]);scatter('scarecrow',[[158,82]]);
  for(let a=152;a<=164;a+=3)for(let b=62;b<=70;b+=3)if(h2(a,b)>.15)mk3(a+h2(a,b),b+h2(b,a),.25,sd=>{sCyl(0,0,0,1.4,.2,.14,K.oakD);sEll(0,2.1,0,1.2,1.0,1.2,(x,y,z)=>hsh(Math.floor(x*5)+Math.floor(y*5),Math.floor(z*5))>.8?K.red:n3(x*4,y*4,z*4)>.55?K.leafL:K.leaf,.3);sEll(.5,2.8,.3,.8,.7,.8,K.leaf,.3)},{rs:1.6,seed:a+b})}
 // the star stones, the sky docks, airships and the chair at the end of the world
 for(let q=0;q<9;q++){const a=q/9*6.283;P3(118.5+Math.cos(a)*4.3,63+Math.sin(a)*4.3,.125,PR.starStone,{rs:.9,seed:q})}
 for(const p of[[113,87.5,1.7],[113,94.5,1.7]]){const g=gY(p[0]+1.2,p[1]);if(g!==null){sBegin(.25,3,.4,4);dockS(9);sFlush(PB,p[0]+.5,g-.7,p[1]+.5,false);rsv(p[0]+2,p[1],3,2)}}
 [[103.6,87.4,5.5,0],[102.4,98.2,7,1]].forEach((p,i)=>{const g=gY(113,p[0]>103?87.5:94.5);const y=(g===null?4:g)+p[2];ani(p[0],p[1],y,.25,()=>{airshipS(i);},(m,t)=>{m.g.position.y=m.y0+Math.sin(t*.8+i*2)*.35;m.g.rotation.z=Math.sin(t*.6+i)*.02},{})})
 {P3(138.5,102,.2,daisS,{rs:3.4,rot:2,flat:[3,3]});for(const dx of[-3.6,3.6]){P3(138.5+dx,101,.125,PR.brazier,{rs:.7});const g=gY(138.5+dx,101);if(g!==null)lightAt(139+dx,g+1.4,101.5,12,3.4,2)}}
 scatter('barrel',[[132.4,76.4],[141,77],[130,89],[128,91.4],[127,72.8]]);scatter('crate',[[130,77.6],[143,82.6],[132,86]]);scatter('woodpile',[[127.2,91.6],[150.4,86]],.125,{rs:1.2});scatter('bush',[[124,70],[148,72],[152,66],[121,92],[154,96],[126,100]],.125,{rs:1.2});
 scatter('signpost',[[135,70],[138,86]]);scatter('pot',[[131,73],[142,73],[135.5,81.8],[137.5,81.8]]);scatter('boulder',[[117,60],[119,70],[156,100],[165,76],[168,92]],.125,{rs:1.6});scatter('rock',[[122,60],[160,66],[148,104],[122,103]])}
// small sky rocks floating in the gaps
function islets(){
 [[70,9,2.6],[72,32,3.2],[66,41,2.2],[77,47,3],[90,3,2.4],[60,52,2.8],[118,10,2.4],[124,44,2.2],[152,38,2.6],[100,80,2.8]].forEach((p,i)=>{
  const y0=-2+(i%3)*2.2;sBegin(.25,0,.5,i+11);const R=p[2];
  sEll(0,0,0,R,R*.55,R,(x,y,z)=>y>.3&&n3(x*2,y,z*2)>.2?K.leafL:y>-.1?K.soil:(hsh(Math.floor(x*3),Math.floor(y*3))>.6?K.stoneD:K.stone),.5);
  sCyl(0,0,-R*.5,-R*2.4,R*.7,.2,(x,y,z)=>hsh(Math.floor(x*3)+Math.floor(y*2.5),Math.floor(z*3))>.55?K.stoneD:K.stone,{});
  sFlush(PB,p[0]+.5,y0,p[1]+.5,false);
  if(i%2===0){sBegin(.125,0,.4,i+2);PR.bush(i);sFlush(PB,p[0]+.5,y0+R*.4,p[1]+.5,false)}
  if(i%3===0){sBegin(.125,0,.4,i+2);PR.stoneLantern(i);sFlush(PB,p[0]+1+.5,y0+R*.4,p[1]+.5,false);lightAt(p[0]+1.5,y0+R*.4+1.4,p[1]+.5,9,2,1)}})}

// ================= v3 TERRAIN ROUNDING + LIGHT SELECTION =================
const DSP=true,DO=[0,0,0],PPV=[[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
// rock below the turf rim is displaced by a smooth noise field that depends only on position, so shared corners stay welded
function dspV(x,y,z,o){let mh=1e9;
 for(let dx=-1;dx<=0;dx++)for(let dz=-1;dz<=0;dz++){const a=x+dx,b=z+dz;if(a<X0||a>X1||b<Z0||b>Z1)continue;const h=HT[CI(a,b)];if(h===-999)continue;if(h+1<mh)mh=h+1}
 if(mh>=1e9)return false;const d=mh-y;if(d<=.01)return false;
 const k=Math.min(1,d/3.2),amp=.5*k*k*(3-2*k);
 o[0]=(vnz(x*.43+y*.27+3.1,z*.43-y*.19)-.5)*2*amp;o[1]=(vnz(x*.37-y*.31+17,z*.41+y*.23)-.5)*1.5*amp;o[2]=(vnz(x*.4+y*.21+29,z*.39+y*.33+9)-.5)*2*amp;return true}
let LSEL=0;
function lightSelect(){const L=U.uL.value,arr=[];for(const l of LIGHTS){const dx=l[0]-cx,dz=l[2]-cz;arr.push([dx*dx+dz*dz,l])}arr.sort((a,b)=>a[0]-b[0]);
 for(let i=0;i<64;i++){const e=arr[i];if(e)L[i].set(e[1][0],e[1][1],e[1][2],e[1][3]);else L[i].set(0,0,0,0)}}
// small growth between the trees: ferns, bushes, flower tufts, mushrooms, boulders, snow-capped stones
function understory(){let n=0;const cap=3200,road=id=>id===BL.COBBLE||id===BL.FARM||id===BL.SAND||id===BL.PAVER||id===BL.GRAVEL||id===BL.DIRT;
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){if(n>=cap)return;const ci=CI(a,b),t=colTop(a,b);if(t===null||!KEY[ci]||LAKE[ci]||RES[ci])continue;if(road(VOX[VI(a,t,b)]))continue;
  const q=h2(a*19+3,b*23+1);if(q>.17)continue;const bio=BIO[ci],r=h2(a*5+9,b*11+4),fa=a+h2(a,b*3)*.8,fb=b+h2(b,a*7)*.8;
  let nm;if(bio===3)nm=r<.5?'rock':r<.8?'stump':'bush';else if(bio===4)nm=r<.4?'bush':r<.65?'flower':r<.85?'rock':'mushroom';else if(bio===5)nm=r<.5?'fern':r<.75?'rock':r<.9?'mushroom':'boulder';else if(bio===2)nm=r<.35?'bush':r<.6?'fern':r<.8?'mushroom':r<.9?'logS':'rock';else nm=r<.34?'bush':r<.55?'fern':r<.75?'flower':r<.86?'mushroom':r<.93?'rock':'logS';
  if(mk3(fa,fb,.125,PR[nm],{seed:a*7+b,rs:.2}))n++}}

// ================= v3 LIFE: people, sheep, deer, ducks, cranes, castle ground, crops =================
const DYN=[112,113,114,115,116,117,118];
function dynCol(i,c){const k=new THREE.Color(c[0]/255,c[1]/255,c[2]/255);k.convertSRGBToLinear&&0;MPC[DYN[i]]=[k.r,k.g,k.b]}
function geoOf(fn,res,sm){sBegin(res,0,sm===undefined?.4:sm,3);fn();const B=mkB();sFlush(B,0,0,0,false);return B}
const PGEO={};
function personGeos(pal){const key=JSON.stringify(pal);if(PGEO[key])return PGEO[key];
 const[sh,pa,ha,sk,ht]=pal;dynCol(0,sh);dynCol(1,pa);dynCol(2,ha);dynCol(3,sk);if(ht)dynCol(4,ht);const S=DYN[0],P=DYN[1],H=DYN[2],K_=DYN[3],HT_=DYN[4];
 const body=geoOf(()=>{sBox(-.21,.78,-.13,.21,1.42,.13,S,.09);sBox(-.2,.66,-.12,.2,.84,.12,P,.06);sEll(0,1.64,0,.17,.2,.17,K_);sEll(0,1.72,-.03,.18,.15,.18,H);sEll(0,1.6,.15,.04,.04,.03,K_);
  if(ht){sCyl(0,0,1.8,1.9,.3,.3,HT_);sCyl(0,0,1.88,2.08,.17,.13,HT_)}},.07);
 const leg=geoOf(()=>{sCap(0,0,0,0,-.7,0,.085,.075,P);sBox(-.08,-.78,-.06,.08,-.68,.17,K.black,.03)},.07);
 const arm=geoOf(()=>{sCap(0,0,0,0,-.5,0,.07,.06,S);sEll(0,-.56,0,.06,.06,.06,K_)},.07);
 return PGEO[key]={body,leg,arm}}
function meshOf(B,mats,g,beam){for(const k of['solid','sway','glow']){const S=B[k];if(!S.i.n)continue;const m=new THREE.Mesh(geoFine(S),mats[k]);m.castShadow=k==='solid';g.add(m)}return g}
const PEOPLE3=[];let MATS3=null;
function mkPerson(pal,route,spd,seg,idle,root){const gs=personGeos(pal),g=new THREE.Group(),body=new THREE.Group();meshOf(gs.body,MATS3,body);g.add(body);
 const mk=(geo,x,y)=>{const p=new THREE.Group();meshOf(geo,MATS3,p);p.position.set(x,y,0);g.add(p);return p};
 const L=mk(gs.leg,-.1,.84),R=mk(gs.leg,.1,.84),AL=mk(gs.arm,-.27,1.38),AR=mk(gs.arm,.27,1.38);root.add(g);
 const P={g,body,L,R,AL,AR,route,spd,seg:seg||0,a:route[seg||0][0],b:route[seg||0][1],wait:Math.random()*2,ph:Math.random()*6,idle:!!idle,y:0,ang:0};
 PEOPLE3.push(P);return P}
function stepPeople3(dt,t){for(const P of PEOPLE3){
  let mv=0;
  if(P.live){const q=P.live();if(q){const d=Math.hypot(q[0]-P.a,q[1]-P.b);if(d>.02){P.ang=Math.atan2(q[0]-P.a,q[1]-P.b);mv=Math.min(1,d*8)}P.a=q[0];P.b=q[1]}}
  else if(!P.idle){
   if(P.wait>0)P.wait-=dt;else{const r=P.route,tg=r[(P.seg+1)%r.length],dx=tg[0]-P.a,dy=tg[1]-P.b,d=Math.hypot(dx,dy),st=P.spd*1.5*dt;
    if(d<=st){P.a=tg[0];P.b=tg[1];P.seg=(P.seg+1)%r.length;if(Math.random()<.25)P.wait=1.5+Math.random()*3}else{P.a+=dx/d*st;P.b+=dy/d*st;const ta=Math.atan2(dx,dy);let da=ta-P.ang;da=Math.atan2(Math.sin(da),Math.cos(da));P.ang+=da*Math.min(1,dt*8);mv=1}}}
  const g=gY(P.a,P.b);if(g!==null)P.y+=(g-P.y)*Math.min(1,dt*12);else if(!P.y)P.y=0;
  P.ph+=dt*(mv?9*(P.spd||1):1.5);const sw=mv?Math.sin(P.ph)*.7:0;
  P.L.rotation.x=sw;P.R.rotation.x=-sw;P.AL.rotation.x=-sw*.8;P.AR.rotation.x=sw*.8;if(!mv){P.AR.rotation.x=Math.sin(P.ph*.7)*.05;P.body.position.y=Math.sin(P.ph)*.01}else P.body.position.y=Math.abs(Math.sin(P.ph))*.06;
  P.g.position.set(P.a+.5,P.y+(P.lift||0),P.b+.5);P.g.rotation.y=P.ang}}
// ---- animals ----
const CR=[];
function critGeo(kind,variant){return geoOf(()=>{
 if(kind==='sheep'){sEll(0,.58,0,.52,.4,.36,(x,y,z)=>hsh(Math.floor(x*9),Math.floor(y*9)+Math.floor(z*9))>.7?K.woolD:K.wool,.45);sEll(.5,.66,0,.2,.2,.17,K.iron);sEll(.62,.7,0,.06,.05,.1,K.black);for(const[x,z]of[[-.3,-.17],[-.3,.17],[.3,-.17],[.3,.17]])sCap(x,.22,z,x,0,z,.06,.06,K.iron)}
 else if(kind==='deer'){sEll(0,.95,0,.62,.3,.25,K.deer,.1);sEll(.1,.9,0,.4,.18,.2,K.deerL);sCap(.5,1.05,0,.78,1.5,0,.12,.09,K.deer);sEll(.86,1.55,0,.2,.14,.12,K.deer);sCap(.84,1.65,.05,.8,1.95,.2,.025,.02,K.oakL);sCap(.84,1.65,-.05,.8,1.95,-.2,.025,.02,K.oakL);sEll(-.62,1.0,0,.08,.07,.07,K.furW);for(const[x,z]of[[-.4,-.13],[-.4,.13],[.4,-.13],[.4,.13]])sCap(x,.9,z,x,0,z,.05,.035,K.furD)}
 else if(kind==='duck'){sEll(0,.14,0,.32,.16,.2,K.furW);sEll(.3,.38,0,.1,.2,.1,K.leaf);sEll(.34,.52,0,.12,.1,.1,K.leaf);sEll(.46,.5,0,.1,.03,.06,K.orange);sEll(-.3,.2,0,.12,.06,.1,K.furW)}
 else if(kind==='crane'){sEll(0,1.3,0,.45,.28,.2,K.white);sCap(.35,1.4,0,.5,2.1,0,.05,.04,K.white);sEll(.55,2.15,0,.1,.08,.07,K.white);sEll(.55,2.17,0,.04,.02,.03,K.red);sCap(.62,2.14,0,.95,2.1,0,.025,.015,K.sunY);sCap(-.05,1.1,-.06,-.05,0,-.06,.025,.02,K.black);sCap(.05,1.1,.06,.05,0,.06,.025,.02,K.black);sEll(-.45,1.3,0,.25,.1,.12,K.black)}
 else if(kind==='dog'){sEll(0,.5,0,.4,.2,.17,K.fur);sEll(.42,.62,0,.17,.15,.13,K.fur);sEll(.58,.58,0,.1,.06,.07,K.furD);sCap(-.38,.55,0,-.62,.8,0,.05,.03,K.fur);for(const[x,z]of[[-.28,-.1],[-.28,.1],[.28,-.1],[.28,.1]])sCap(x,.35,z,x,0,z,.045,.04,K.furD)}
 else {sEll(0,.28,0,.26,.13,.1,K.tang);sEll(.28,.34,0,.1,.1,.09,K.tang);sCap(-.24,.3,0,-.5,.5,0,.035,.03,K.tang)}
 },kind==='duck'||kind==='cat'?.06:.08)}
function critter(kind,fi,fj,rad,o){o=o||{};const g=new THREE.Group();meshOf(critGeo(kind),MATS3,g);const c={g,kind,a:fi,b:fj,ca:fi,cb:fj,rad,ang:Math.random()*6,tx:fi,tz:fj,wait:Math.random()*3,sp:o.sp||.6,water:!!o.water,ph:Math.random()*6,y:0,sc:o.sc||1};g.scale.setScalar(c.sc);CR.push(c);return c}
function stepCrit(dt,t){for(const c of CR){c.ph+=dt;
  if(c.static){}
  else if(c.wait>0){c.wait-=dt}else{let dx=c.tx-c.a,dz=c.tz-c.b,d=Math.hypot(dx,dz);if(d<.15){c.wait=1+Math.random()*4;const an=Math.random()*6.283,r=Math.sqrt(Math.random())*c.rad;c.tx=c.ca+Math.cos(an)*r;c.tz=c.cb+Math.sin(an)*r}
   else{const st=c.sp*dt;c.a+=dx/d*st;c.b+=dz/d*st;const ta=Math.atan2(dz,dx);let da=ta-c.ang;da=Math.atan2(Math.sin(da),Math.cos(da));c.ang+=da*Math.min(1,dt*5)}}
  const g=gY(c.a,c.b);if(c.water){c.y=WSY+.05+Math.sin(c.ph*1.7)*.03}else if(g!==null)c.y+=(g-c.y)*Math.min(1,dt*10);
  const hop=(!c.water&&!c.static&&c.wait<=0)?Math.abs(Math.sin(c.ph*6))*.06:0;
  c.g.position.set(c.a+.5,c.y+hop,c.b+.5);c.g.rotation.y=-c.ang;if(c.kind==='crane'||c.kind==='duck')c.g.rotation.z=Math.sin(c.ph*.8)*.03}}
function lifeInit(root){
 MATS3=MATS3||{};
 for(const c of CR)root.remove(c.g);
 // people: the 2.5D cast walks the same routes
 if(typeof CAST!=='undefined')for(const q of CAST){if(!q.route||!q.pal)continue;const p=q.pal.map(x=>x||null);mkPerson([p[0],p[1],p[2],p[3],p[4]],q.route,q.spd||1,q.seg||0,false,root)}
 if(typeof CH!=='undefined'&&CH&&CH.length)for(const ch of CH){if(!ch.at||!ch.pal)continue;const P=mkPerson(ch.pal,[ch.at,ch.at],0,0,true,root)}
 if(typeof PL!=='undefined'&&PL&&PL.P){const P=mkPerson(PL.P.pal||[[220,200,60],[60,70,100],[60,40,30],[225,180,140],null],[[0,0],[0,0]],1,0,false,root);P.live=()=>PL.P&&PL.P.a!==undefined?[PL.P.a,PL.P.b]:null}
 // animals
 const add=(k,a,b,r,o)=>{if(gY(a,b)===null&&!(o&&o.water))return;const c=critter(k,a,b,r,o);root.add(c.g);return c};
 for(const p of[[11.5,15.2],[13.2,14.6],[12.4,16.4],[13.8,16.2]])add('sheep',p[0],p[1],1.6,{sp:.35});
 for(const p of[[8,19],[9.4,18]])add('sheep',p[0],p[1],2.5,{sp:.35});
 add('dog',15.4,16.5,5,{sp:1.1});add('dog',27.6,17.6,6,{sp:1.2});add('cat',21.4,6.2,3,{sp:.7});add('cat',31.4,16.6,3,{sp:.7});
 for(const p of[[96.4,38.6],[99.2,39.6],[98,40.8],[108,23.2],[109.6,24]])add('deer',p[0],p[1],2.6,{sp:.4});
 for(const p of[[101.1,34.3],[107.9,29.2]])add('crane',p[0],p[1],0,{static:1});
 if(typeof POND!=='undefined')for(let q=0;q<4;q++){const an=q*1.7+.4;add('duck',POND[0]+Math.cos(an)*1.8,POND[1]+Math.sin(an)*1.8,2.6,{water:1,sp:.55})}
 for(const p of[[130,70],[142,86],[124,90]])add('dog',p[0],p[1],5,{sp:1});
 for(const p of[[152,70],[158,80],[162,88]])add('sheep',p[0],p[1],3,{sp:.35});
 for(const p of[[150,70],[120,70]])add('deer',p[0],p[1],3,{sp:.4});
 // walking castle folk and harbour hands
 const FOLK=[[[200,170,60],[70,60,90],[60,40,30],[225,180,140],[120,40,40]],[[90,120,170],[80,70,60],[170,130,70],[220,176,140],null],[[170,70,70],[60,64,80],[40,30,26],[200,150,118],null],[[210,200,170],[90,80,70],[110,70,40],[230,190,150],[140,110,60]]];
 const walk=(pts,i)=>{const pal=FOLK[i%FOLK.length];mkPerson(pal,pts,.8+.1*(i%3),0,false,root)};
 walk([[136.5,70],[136.5,76],[133,79],[136.5,84],[137,95],[136.5,84],[140,80],[136.5,70]],0);walk([[134,66],[134,72],[130,76],[126,80],[130,84],[136,86],[134,72],[134,66]],1);walk([[139,66],[139,74],[143,78],[147,82],[143,86],[139,80],[139,66]],2);
 walk([[136.5,48],[136.5,52],[133,57],[136.5,62],[140,57],[136.5,52],[136.5,48]],3);walk([[92,56],[95,57],[98,59],[96,62],[92,60],[92,56]],1);walk([[130.5,28],[133,31],[136,29],[133,28],[130.5,28]],2)}
function castleGround(){for(let a=108;a<=174;a++)for(let b=40;b<=108;b++){const t=colTop(a,b);if(t===null||KEY[CI(a,b)]!==5||RES[CI(a,b)])continue;const fa=a+.5,fb=b+.5;let id=0;
  if(Math.hypot(fa-136.5,fb-78)<6.4)id=((a+b)&1)?BL.PAVER:BL.COBBLE;else if(Math.abs(fa-136.5)<2.7&&fb>66&&fb<102)id=BL.COBBLE;else if(Math.hypot(fa-136.5,fb-55)<10&&fb>44&&fb<66)id=BL.PAVER;
  else if(fa>148&&fa<166&&fb>60&&fb<72&&((a>>1)&1))id=BL.FARM;if(id)setV(a,t,b,id)}}
function crops(){let n=0;const names=['sunflower','corn','tomato','cabbage','corn','pumpkin'];
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){if(n>520)return;const t=colTop(a,b);if(t===null||VOX[VI(a,t,b)]!==BL.FARM||(a&1)||(b&1))continue;const q=h2(Math.floor(b/6),Math.floor(a/6));
  if(mk3(a+.3,b+.3,.125,PR[names[Math.floor(q*names.length)]],{seed:a*3+b,rs:0}))n++}}

// ================= v3 CORE =================
function buildWorldPlus(){
 PB=mkB();ANI.length=0;ANIM.length=0;QCOUNT=0;castleGround();
 for(const f of[village,sakuraIsle,observatoryRock,harbour,castle,islets]){try{f()}catch(e){console.error('voxel ERR '+f.name+': '+e.stack.split('\n').slice(0,3).join(' | '));sClear()}}
}
let GLOWM=null,BEAMM=null,ANIM=[];
function buildPlusMeshes(root){
 const mk=(sw)=>{const a=new THREE.MeshLambertMaterial({vertexColors:true});a.shadowSide=THREE.FrontSide;patchLit(a,sw?1:0);return a};
 const mats={solid:mk(0),sway:mk(1),glow:new THREE.MeshBasicMaterial({vertexColors:true})};GLOWM=mats.glow;MATS3=mats;PEOPLE3.length=0;CR.length=0;
 for(const k of['solid','sway','glow']){const S=PB[k];if(!S.i.n)continue;const m=new THREE.Mesh(geoFine(S),mats[k]);m.name='sculpt_'+k;m.castShadow=k!=='glow';m.receiveShadow=k!=='glow';root.add(m)}
 BEAMM=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending});
 for(const it of ANI){const g=new THREE.Group();for(const k of['solid','sway','glow']){const S=it.B[k];if(!S.i.n)continue;const m=new THREE.Mesh(geoFine(S),k==='glow'&&it.beam?BEAMM:mats[k]);m.castShadow=k==='solid';g.add(m)}
  g.position.set(it.x,it.y,it.z);g.rotation.y=-it.rot*Math.PI/2;it.g=g;it.x0=it.x;it.y0=it.y;it.z0=it.z;root.add(g);ANIM.push(it)}
MATS3=mats;lifeInit(root);console.info('voxel sculpt: '+QCOUNT+' quads, '+ANI.length+' animated parts')}
function plusStep(dt){const t=T3.t+=dt;LSEL+=dt;if(LSEL>.45){LSEL=0;lightSelect()}stepPeople3(dt,t);stepCrit(dt,t);for(const m of ANIM){try{m.step(m,t)}catch(e){}}}
const T3={t:0};


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
 buildVoxels();initMP();buildStructures();buildWorldPlus();const nt=plantTrees();understory();populate();crops();
 const B=greedyMesh(),root=new THREE.Group();scene.add(root);let faces=0;
 for(const k in B){const m=B[k];if(!m.i.n)continue;const mesh=new THREE.Mesh(geoFrom(m),getMat(k));mesh.name=k;mesh.castShadow=k!=='fire';mesh.receiveShadow=true;root.add(mesh);faces+=m.i.n/6}
 buildFineMeshes(root);buildPlusMeshes(root);
 const w=waterBuild();if(w)root.add(w);
 buildDecor().forEach(o=>root.add(o));
 buildPonds();buildKoi(root);buildLilies(root);buildBoats(root);buildBirds(root);buildFalls(root);buildFx().forEach(o=>root.add(o));
 lightSelect();
 skyMat=null;skyMesh=skyMeshBuild();scene.add(skyMesh);seaMesh=seaBuild();scene.add(seaMesh);buildCloudPuffs(scene);
 hemi=new THREE.HemisphereLight(0xffffff,0x444444,1);scene.add(hemi);amb=new THREE.AmbientLight(0xffffff,.3);scene.add(amb);
 sunL=new THREE.DirectionalLight(0xffffff,3);sunL.castShadow=true;const mob=/Mobi|Android/i.test(navigator.userAgent),ms=renderer.capabilities.maxTextureSize;
 sunL.shadow.mapSize.set(mob||ms<4096?2048:4096,mob||ms<4096?2048:4096);const sc=sunL.shadow.camera;sc.left=-132;sc.right=132;sc.top=132;sc.bottom=-132;sc.near=10;sc.far=560;
 sunL.shadow.bias=-.0004;sunL.shadow.normalBias=.85;sunL.target.position.set(86,-4,46);scene.add(sunL,sunL.target);
 sunDir=new THREE.Vector3();PC=PRESETS.map(mkPhase);CUR=mkPhase(PRESETS[0]);setPhase(0,false);stepTime(0,true);
 camera=new THREE.PerspectiveCamera(24,innerWidth/innerHeight,2,4000);
 az=tAz=Math.PI/4;el=tEl=.55;rad=250;tRad=174;cx=tcx=104;cz=tcz=56;camUpdate(0);
 console.info('voxel world: '+Math.round(performance.now()-t0)+' ms, '+faces+' quads, '+nt+' fine trees ('+FQ+' quads), '+LIGHTS.length+' lamps, '+KOI.length+' koi. '+BIOME_REPORT)}

// ---------- camera: orbit, pan, pinch, damping, idle drift ----------
function camUpdate(dt){const k=dt?1-Math.exp(-dt*9):1;az+=(tAz-az)*k;el+=(tEl-el)*k;rad+=(tRad-rad)*k;cx+=(tcx-cx)*k;cz+=(tcz-cz)*k;
 const ce=Math.cos(el);camera.position.set(cx+rad*ce*Math.cos(az),rad*Math.sin(el),cz+rad*ce*Math.sin(az));camera.lookAt(cx,0,cz)}
function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
let last=0,ema=.016,frames=0,pr=1;
function update(dt){T+=dt;U.uTime.value=T;
 if(performance.now()-lastInput>6000)tAz+=dt*.012;
 camUpdate(dt);stepTime(dt);plusStep(dt);koiStep(dt);birdStep();boatStep();spritesStep(dt);
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
  if(ps.size===2){const d=pd();if(pinch>0)tRad=clamp(tRad*pinch/d,30,340);pinch=d;return}
  if((e.buttons&6)||e.shiftKey){const s=rad*.0017;tcx=clamp(tcx-Math.sin(tAz)*dx*s-Math.cos(tAz)*dy*s,-10,190);tcz=clamp(tcz+Math.cos(tAz)*dx*s-Math.sin(tAz)*dy*s,-14,120)}
  else{tAz-=dx*.008;tEl=clamp(tEl+dy*.006,.12,1.3)}});
 const up=e=>{ps.delete(e.pointerId);pinch=0};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',e=>{e.preventDefault();lastInput=performance.now();tRad=clamp(tRad*Math.exp(e.deltaY*.0011),30,340)},{passive:false});
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
// a remembered 3D choice has to actually build, or the button says 3D over a 2D backdrop
if(viewChoice==='3d')setTimeout(show,0);
const sgo=document.getElementById('sgo');
if(sgo)sgo.addEventListener('click',()=>setTimeout(()=>setChoice(viewChoice,true),0));
window.__voxel=function(){if(overlay&&overlay.style.display!=='none')hide();else show();syncChoice()};
window.addEventListener('keydown',e=>{
 const t=e.target;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;
 const on=overlay&&overlay.style.display!=='none';
 if(e.code==='KeyV'&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();window.__voxel()}
 else if(e.code==='Escape'&&on)hide();
 else if(e.code==='KeyN'&&on&&built&&!e.ctrlKey&&!e.altKey&&!e.metaKey)setPhase(PHASE+1)});
})();
