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
const X0=-88,Z0=-100,X1=272,Z1=212,Y0=-46,Y1=48;
const SX=X1-X0+1,SY=Y1-Y0+1,SZ=Z1-Z0+1,SXZ=SX*SZ;
const VOX=new Uint8Array(SX*SY*SZ);
const VI=(x,y,z)=>(y-Y0)*SXZ+(z-Z0)*SX+(x-X0);
const CI=(a,b)=>(b-Z0)*SX+(a-X0);
const HT=new Int16Array(SX*SZ),KEY=new Uint8Array(SX*SZ),BIO=new Uint8Array(SX*SZ),LAKE=new Uint8Array(SX*SZ),BED=new Int8Array(SX*SZ),RES=new Uint8Array(SX*SZ),OCC=new Uint8Array(SX*SZ),DST=new Float32Array(SX*SZ),TRM=new Uint8Array(SX*SZ);
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

// ============================================================
//  THE OUTER ARCHIPELAGO
//  The 2D map is the story. This is the country it sits in: nine
//  unpeopled rocks a bridge-walk apart, so the horizon is land
//  instead of haze.
// ============================================================
const OUTER=[
 {x:-52,z:-46,rx:34,rz:26,bio:1,hill:9 ,top:1,sd:3.1 ,kind:'lighthouse'},
 {x: 52,z:-70,rx:30,rz:22,bio:3,hill:13,top:2,sd:7.7 ,kind:'stonecircle'},
 {x:176,z:-56,rx:36,rz:28,bio:2,hill:7 ,top:0,sd:11.2,kind:'hamlet'},
 {x:238,z: 40,rx:30,rz:34,bio:1,hill:11,top:1,sd:15.5,kind:'tower'},
 {x:232,z:152,rx:34,rz:26,bio:4,hill:6 ,top:0,sd:19.3,kind:'grove'},
 {x:118,z:184,rx:38,rz:24,bio:1,hill:9 ,top:1,sd:23.1,kind:'ruin'},
 {x:-16,z:182,rx:32,rz:26,bio:5,hill:10,top:1,sd:27.4,kind:'windmill'},
 {x:-58,z: 96,rx:28,rz:30,bio:2,hill:8 ,top:0,sd:31.8,kind:'torii'},
 {x: 84,z:-80,rx:26,rz:18,bio:3,hill:12,top:3,sd:35.2,kind:'ice'}
];
// how far inside an outer island a cell is: <1 is land, >=1 is sea
function outerF(a,b,o){
 const dx=(a+.5-o.x)/o.rx,dz=(b+.5-o.z)/o.rz,d=Math.sqrt(dx*dx+dz*dz);
 if(d>1.7)return 9;
 const an=Math.atan2(dz,dx);
 const w=1+Math.sin(an*3+o.sd)*.10+Math.sin(an*5+o.sd*2.1)*.07+(vnz(a*.09+o.sd*3,b*.09+o.sd)-.5)*.26;
 return d/w}
function outerLandPass(){
 for(const o of OUTER){
  const a0=Math.max(X0,Math.floor(o.x-o.rx-2)),a1=Math.min(X1,Math.ceil(o.x+o.rx+2));
  const b0=Math.max(Z0,Math.floor(o.z-o.rz-2)),b1=Math.min(Z1,Math.ceil(o.z+o.rz+2));
  for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++){
   const ci=CI(a,b);if(KEY[ci])continue;
   const f=outerF(a,b,o);if(f>=1)continue;
   const dist=Math.max(.6,(1-f)*o.rx*.95);
   KEY[ci]=7;BIO[ci]=o.bio;DST[ci]=dist;LAKE[ci]=0;
   const rim=clamp((1-f)/.13,0,1);
   let h=o.top+Math.round(o.hill*(1-f*f*1.02)+(vnz(a*.07+o.sd,b*.07+o.sd)-.5)*3.2-(1-rim)*6);
   HT[ci]=h;
   let top=TOPB[o.bio];
   if(f>.90)top=BL.SAND;
   else if(f>.84&&h2(a*5,b*9)>.5)top=BL.GRAVEL;
   if(o.bio===3&&h2(a*3,b*7)>.72)top=BL.SNOW;
   const depth=4+15*sm(0,15,dist)+(vnz(a*.35,b*.35)-.5)*5*sm(0,10,dist);
   const dBot=Math.max(Y0+1,h-Math.round(depth));
   for(let y=dBot;y<=h;y++){
    const dd=h-y;let id;
    if(dd===0)id=top;else if(dd<=2)id=BL.EARTH;
    else{const band=Math.floor((y+(vnz(a*.03,b*.03)*6|0))/4),m=((band%3)+3)%3;id=m===0?BL.ROCK_A:m===1?BL.ROCK_B:BL.ROCK_C;
     if(dd<13&&vnz(a*.2+y*.3,b*.2)>.62)id=BL.ROCK_MOSS;else if(h2(a*3+y,b*7)>.94)id=BL.ROCK_B}
    VOX[VI(a,y,b)]=id}}}
 // the same hanging vines on the new rims
 for(const o of OUTER){
  const a0=Math.max(X0+1,Math.floor(o.x-o.rx-2)),a1=Math.min(X1-1,Math.ceil(o.x+o.rx+2));
  const b0=Math.max(Z0+1,Math.floor(o.z-o.rz-2)),b1=Math.min(Z1-1,Math.ceil(o.z+o.rz+2));
  for(let a=a0;a<=a1;a++)for(let b=b0;b<=b1;b++){const ci=CI(a,b);
   if(KEY[ci]!==7||BIO[ci]===3)continue;
   if(h2(a*13+1,b*7+5)<.972)continue;
   for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){if(KEY[CI(a+dx,b+dz)])continue;
    const L=2+Math.floor(h2(a,b*3)*3),y0=HT[ci]-1;
    for(let k=0;k<L;k++)putIfEmpty(a+dx,y0-k,b+dz,BL.VINE);break}}}
}
// ---------- a landmark on each rock, and long bridges back to the map ----------
function bridgeDeck(x0,z0,y0,x1,z1,y1){
 const L=Math.hypot(x1-x0,z1-z0);if(!(L>4&&L<170))return;
 const N=Math.ceil(L*1.9),sag=clamp(L*.06,2,8);
 const alongB=Math.abs(z1-z0)>Math.abs(x1-x0);
 const cx=(x0+x1)*.5,cz=(z0+z1)*.5;
 for(let k=0;k<=N;k++){
  const t=k/N,A=lerp(x0,x1,t),B=lerp(z0,z1,t),Y=Math.round(lerp(y0,y1,t)-sag*Math.sin(t*3.14159));
  for(let w=-1;w<=1;w++)setV(Math.round(A+(alongB?w:0)),Y,Math.round(B+(alongB?0:w)),BL.PLANK);
  // a continuous hand rope on both sides, hung from a post every six planks
  for(const w of[-2,2]){
   const x=Math.round(A+(alongB?w:0)),z=Math.round(B+(alongB?0:w));
   setV(x,Y+2,z,BL.WOOD);
   if(k%6===0){setV(x,Y+1,z,BL.WOOD);setV(x,Y,z,BL.WOOD);setV(x,Y-1,z,BL.WOOD)}
   if(k%6===3)setV(x,Y+1,z,BL.WOOD)}
  // a stone pier every long stretch, so the span reads as a viaduct and not a plank
  if(k>6&&k<N-6&&k%22===11)for(let w=-1;w<=1;w++)for(let dy=-1;dy>-30;dy--){
   const x=Math.round(A+(alongB?w:0)),z=Math.round(B+(alongB?0:w));
   setV(x,Y+dy,z,(dy%6===0)?BL.ROCK_B:BL.ROCK_A)}
 }
}
function lighthouseO(ax,az,y){
 for(let k=0;k<18;k++){
  const r=(k<13)?(3.7-k*.14):2.1;
  for(let a=-4;a<=4;a++)for(let b=-4;b<=4;b++){
   if(Math.hypot(a,b)>r)continue;
   setV(ax+a,y+k,az+b,(k%5===0)?BL.WALL_TIMBER:BL.WALL_WHITE)}
  if(k>=13&&k<=16)for(const[a,b]of[[0,-2],[0,2],[-2,0],[2,0]])setV(ax+a,y+k,az+b,BL.WINDOW)}
 box(ax-3,az-3,ax+3,az+3,y+18,y+18,BL.ROOF_DARK);
 setV(ax,y+19,az,BL.GOLD);
 lightAt(ax+.5,y+15,az+.5,34,8,1);
 reserve(ax-5,az-5,ax+5,az+5);
 box(ax-5,az+7,ax-5,az+7,y,y,BL.PAVER);
 house3(ax+8,az+4,'slate',61);
}
function ruinO(ax,az,y){
 for(let i=-2;i<=2;i++){
  const a=ax+i*4,hgt=3+((i*7+91)%3);
  for(let k=0;k<hgt;k++)for(let da=-1;da<=1;da++)for(let db=-1;db<=1;db++){
   if(Math.abs(da)===1&&Math.abs(db)===1)continue;
   setV(a+da,y+k,az-3+db,(k%2)?BL.ROCK_A:BL.ROCK_B)}
  if(i<2)for(let d=0;d<4;d++)setV(a+d,y+hgt,az-3,BL.ROCK_A)}
 for(let k=0;k<16;k++){const a=ax+Math.round((h2(ax+k,az)-.5)*18),b=az+Math.round((h2(az+k,ax+7)-.5)*10);
  const t=colTop(a,b);if(t!==null)setV(a,t+1,b,(k%3)?BL.ROCK_A:BL.ROCK_MOSS)}
 box(ax-2,az+3,ax+2,az+3,y,y+1,BL.PAVER);
 setV(ax,y+2,az+3,BL.GOLD);
 lightAt(ax+.5,y+3,az+3.5,8,2,0);
 reserve(ax-8,az-6,ax+8,az+6);
}
function toriiO(ax,az,y){
 const H=9,W=6;
 for(const sx of[-W,W])for(let k=0;k<H;k++){setV(ax+sx,y+k,az,BL.TORII);setV(ax+sx,y+k,az+1,BL.TORII)}
 for(let a=ax-W-1;a<=ax+W+1;a++){setV(a,y+H,az,BL.TORII);setV(a,y+H,az+1,BL.TORII_DARK)}
 for(let a=ax-W+1;a<=ax+W-1;a++)setV(a,y+H-2,az,BL.TORII_DARK);
 setV(ax-W,y+H+1,az,BL.ROOF_DARK);setV(ax+W,y+H+1,az,BL.ROOF_DARK);
 lightAt(ax+.5,y+H-2,az+.5,16,4,0);
 reserve(ax-9,az-5,ax+9,az+5);
}
function towerO(ax,az,y){
 const R=3,H=20;
 box(ax-R,az-R,ax+R,az+R,y,y,BL.PAVER);
 for(let k=1;k<=H;k++)for(let a=-R;a<=R;a++)for(let b=-R;b<=R;b++){
  if(Math.abs(a)!==R&&Math.abs(b)!==R)continue;
  setV(ax+a,y+k,az+b,(k%7===0)?BL.ROCK_B:BL.ROCK_A)}
 for(const[a,b]of[[0,-R],[0,R],[-R,0],[R,0]])for(const kk of[5,10,15])setV(ax+a,y+kk,az+b,BL.WINDOW);
 box(ax-R,az-R,ax+R,az+R,y+H+1,y+H+1,BL.PAVER);
 for(let a=-R;a<=R;a+=2)for(let b=-R;b<=R;b+=2)setV(ax+a,y+H+2,az+b,BL.ROCK_A);
 lightAt(ax+.5,y+H,az+.5,34,8,1);
 reserve(ax-6,az-6,ax+6,az+6);
}
function circleO(ax,az,y){
 for(let i=0;i<11;i++){const an=i/11*6.283,r=9;
  const a=Math.round(ax+Math.cos(an)*r),b=Math.round(az+Math.sin(an)*r);
  const t=colTop(a,b);if(t===null)continue;
  const hgt=2+((i*5)%3);
  for(let k=1;k<=hgt;k++)setV(a,t+k,b,(k===1)?BL.ROCK_MOSS:BL.ROCK_A)}
 box(ax-1,az-1,ax+1,az+1,y,y,BL.PAVER);
 setV(ax,y+1,az,BL.GOLD);
 lightAt(ax+.5,y+2,az+.5,12,3,0);
 reserve(ax-11,az-11,ax+11,az+11);
}
function groveO(ax,az,y){
 reserve(ax-15,az-15,ax+15,az+15);
 for(let i=0;i<18;i++){const an=i/18*6.283,r=7+h2(i*7,3)*5;
  const a=Math.round(ax+Math.cos(an)*r),b=Math.round(az+Math.sin(an)*r);
  const t=colTop(a,b);if(t===null)continue;
  sakura(a,b,t,.9+h2(i,9)*.5)}
 box(ax-2,az-2,ax+2,az+2,y,y+1,BL.PAVER);
 for(const sx of[-1,1])for(const sz of[-1,1])setV(ax+sx,y+2,az+sz,BL.TORII);
 for(let a=ax-3;a<=ax+3;a++)setV(a,y+5,az,BL.ROOF_RED);
 setV(ax,y+3,az,BL.LANTERN);
 lightAt(ax+.5,y+4,az+.5,14,4,0);
}
function outerBridges(){
 const want=['ruin','tower','torii'];
 for(const o of OUTER){
  if(want.indexOf(o.kind)<0)continue;
  let best=null,bd=1e9;
  for(let a=Math.round(o.x-o.rx);a<=Math.round(o.x+o.rx);a++)
   for(let b=Math.round(o.z-o.rz);b<=Math.round(o.z+o.rz);b++){
    if(!inb(a,b))continue;if(KEY[CI(a,b)]!==7)continue;
    const d=Math.hypot(a-88,b-53);if(d<bd){bd=d;best=[a,b]}}
  if(!best)continue;
  const dx0=88-best[0],dz0=53-best[1],L=Math.hypot(dx0,dz0);if(L<1)continue;
  const dx=dx0/L,dz=dz0/L;let mb=null;
  for(let t=1;t<170;t+=.6){const a=Math.round(best[0]+dx*t),b=Math.round(best[1]+dz*t);
   if(!inb(a,b))break;
   if(LAND(a,b)){mb=[a,b];break}}
  if(!mb)continue;
  const y0=colTop(best[0],best[1]),y1=colTop(mb[0],mb[1]);
  if(y0===null||y1===null)continue;
  bridgeDeck(best[0]+.5,best[1]+.5,y0+1,mb[0]+.5,mb[1]+.5,y1+1)}
}
function outerBuilds(){
 for(const o of OUTER){
  const ax=Math.round(o.x),az=Math.round(o.z);
  const st=siteTop(ax-3,az-3,ax+3,az+3);if(!st)continue;
  const y=st.hi+1;
  if(o.kind==='lighthouse')lighthouseO(ax,az,y);
  else if(o.kind==='ruin')ruinO(ax,az,y);
  else if(o.kind==='torii')toriiO(ax,az,y);
  else if(o.kind==='tower')towerO(ax,az,y);
  else if(o.kind==='stonecircle')circleO(ax,az,y);
  else if(o.kind==='grove')groveO(ax,az,y);
  else if(o.kind==='hamlet'){
   reserve(ax-12,az-12,ax+14,az+14);
   house3(ax-4,az+2,'slate',41);house3(ax+4,az-3,'ochre',43);
   windmill3(ax+9,az+5);well3(ax,az+7);
   fenceLine(ax-9,az+8,ax+9,az+8)}
  else if(o.kind==='windmill'){
   reserve(ax-10,az-10,ax+10,az+10);
   windmill3(ax,az);fenceLine(ax-7,az+6,ax+7,az+6);house3(ax-8,az-4,'ochre',47)}
 }
 outerBridges();
}

function buildVoxels(){
 VOX.fill(0);HT.fill(-999);KEY.fill(0);BIO.fill(0);LAKE.fill(0);BED.fill(0);RES.fill(0);OCC.fill(0);TRM.fill(0);
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
 // pass: the three raised earthworks of the village, exactly where the 2D map puts them
 const TERRA=[{a:25.35,b:4.15,rx:5.7,ry:4.0},{a:34.4,b:10.8,rx:2.7,ry:2.15},{a:8.6,b:4.4,rx:3.7,ry:2.9}];
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){const ci=CI(a,b);if(KEY[ci]!==1||LAKE[ci])continue;
  for(const T of TERRA){const ex=(a+.5-T.a)/T.rx,ey=(b+.5-T.b)/T.ry,q=ex*ex+ey*ey;if(q>=1)continue;
   const v=Math.sqrt(q);HT[ci]+=4;if(v>.78)TRM[ci]=1;else if(v>.66)TRM[ci]=2;break}}
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
   if(bio===3&&PATHf&&PATHf(a+.5,b+.5)<.5)top=BL.COBBLE
   if(TRM[ci]===1)top=(a+b)&1?BL.ROCK_A:BL.PAVER;else if(TRM[ci]===2)top=BL.GRAVEL}
  for(let y=dBot;y<=h;y++){const dd=h-y;let id;
   if(dd===0)id=top;else if(dd<=2)id=BL.EARTH;
   else{const band=Math.floor((y+(vnz(a*.03,b*.03)*6|0))/4),m=((band%3)+3)%3;id=m===0?BL.ROCK_A:m===1?BL.ROCK_B:BL.ROCK_C;
    if(dd<11&&vnz(a*.2+y*.3,b*.2)>.66)id=BL.ROCK_MOSS;else if(h2(a*3+y,b*7)>.94)id=BL.ROCK_B}
   VOX[VI(a,y,b)]=id}}
 // hanging vines on the outer rim
 for(let a=X0+1;a<X1;a++)for(let b=Z0+1;b<Z1;b++){const ci=CI(a,b);if(!KEY[ci]||LAKE[ci]||BIO[ci]===3||BIO[ci]===5)continue;
  if(h2(a*13+1,b*7+5)<.972)continue;
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){if(LAND(a+dx,b+dz))continue;
   const L=2+Math.floor(h2(a,b*3)*3),y0=HT[ci]-1;for(let k=0;k<L;k++)putIfEmpty(a+dx,y0-k,b+dz,BL.VINE);break}}
 outerLandPass()}
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
 roads2d();
 keep();wardWalls();marketSquare();teahouse();dome();rakeGarden();
 bridges();moonMaze();skyDocks();pagodaShrine();orchardRows();meadowLights();
 const town=[[22,4],[28,4],[23,11],[30,11],[23,15],[30,15],[18,26],[10,22],[17,30],[9,29],[12,35]];
 town.forEach(([a,b],i)=>cottage(a,b,i));
 for(const[a,b]of[[25,8],[27,8],[25,11],[28,12],[25,16],[27,16],[24,6],[29,6],[20,20],[14,25],[20,32]])lampPost(a,b);
 toriiGate(104,35,false);toriiGate(25,19,true);
 for(const[a,b]of[[101,33],[101,37],[107,33],[107,37],[95,28],[85,33],[110,30],[116,37],[88,34],[96,36]])stoneLantern(a,b);
 boatSpot(25,25);boatSpot(28,23);boatSpot(113,33)
 villageExtras();castleTown();outerBuilds()}

// ---------- the village's outbuildings, at the 2D map's coordinates ----------
function villageExtras(){
 house3(14.2,11.8,'ochre',3);house3(11.8,7.6,'ochre',5);house3(36.9,20.6,'slate',7,true);
 barn3(19.8,9.5);coop3(16.6,12.0);coop3(17.9,13.0);
 windmill3(8.6,4.4);boathouse3(19.4,21.8);
 shrine3(34.4,10.8);hermit3(51.0,15.6);lookout3(35.6,40.2);lookout3(18.6,36.6);
 well3(26.5,12.6);
 stall3(24.3,12.5,BL.AWN_R,BL.AWN_W);stall3(28.5,12.6,BL.AWN_W,BL.AWN_R);stall3(28.2,15.3,BL.AWN_R,BL.AWN_W);
 const props=[[16.5,10.6,'barrel'],[16.9,10.9,'barrel'],[16.2,10.1,'crates'],[17.2,9.4,'hay'],[17.6,9.0,'hay'],
  [9.3,10.0,'log'],[11.0,11.5,'log'],[10.0,10.5,'camp'],[9.6,14.6,'hive'],[10.2,14.8,'hive'],[14.55,16.9,'scare'],
  [15.8,13.9,'sign'],[17.2,17.9,'bench'],[14.1,13.2,'pot'],[12.9,13.2,'pot'],[18.3,10.2,'wood'],[12.6,8.9,'barrel'],
  [9.2,6.2,'hay'],[9.9,6.0,'hay'],[7.0,8.4,'wood'],[13.6,9.9,'bench'],[17.4,10.9,'crates'],[15.0,10.9,'pot'],
  [24.6,20.4,'log'],[25.4,19.4,'barrel'],[26.0,19.0,'lamp'],[28.8,19.4,'lamp'],[31.0,27.6,'lamp'],[34.8,21.1,'lamp'],
  [38.7,21.2,'lamp'],[42.0,21.35,'lamp'],[47.0,21.85,'lamp'],[33.9,22.5,'barrel'],[36.0,21.6,'crates'],[32.6,21.4,'crates'],
  [30.6,20.4,'bench'],[34.9,10.1,'pot'],[32.0,12.4,'pot'],[35.2,39.0,'bench'],[30.2,32.4,'barrel'],[29.0,33.6,'hay'],
  [31.6,34.4,'hay'],[22.0,26.4,'bench'],[24.0,28.6,'lamp'],[28.4,30.2,'bench'],[26.8,30.8,'lamp'],[20.0,23.4,'log'],
  [24.3,12.5,'pot'],[22.6,12.8,'bench'],[30.4,13.4,'bench'],[21.6,6.4,'wood'],[30.4,4.8,'hay'],[22.6,16.4,'crates'],
  [29.6,17.0,'barrel'],[12.0,31.2,'log'],[14.8,32.0,'log'],[12.4,32.8,'bench'],[15.2,26.8,'wood'],[11.6,24.8,'crates'],
  [7.8,26.2,'barrel'],[13.2,36.6,'hay'],[10.2,26.0,'pot'],[14.6,24.6,'barrel'],[18.2,31.8,'crates'],[8.2,31.0,'wood'],
  [25.5,15.6,'lamp'],[27.4,15.8,'lamp'],[24.0,6.0,'lamp'],[29.4,6.2,'lamp']];
 props.forEach(([a,b,k],i)=>prop3(a,b,k,i));
 fenceLine(10.1,13.1,14.5,13.1);fenceLine(10.1,17.5,14.5,17.5);
 fenceLine(10.1,13.1,10.1,17.5);fenceLine(14.9,13.1,14.9,17.5);
 for(let k=0;k<5;k++)prop3(14.5,Math.round(13.6+k*0.7),'pot',k)}
// ---------- the castle town: the armoury, the avenue, the square, the west and east rows ----------
function castleTown(){
 const SQ=G('SQUARE')||[136.5,78,5.7];
 house3(127.4,48.6,'slate',2);house3(127.6,52.6,'teal',4);
 [[123.0,73.2,'ochre',1,1],[121.2,81.8,'blue',2,0],[125.6,82.8,'slate',3,1],[130.6,86.6,'plum',4,0],
  [122.0,86.6,'moss',5,1],[130.8,95.2,'teal',6,0],[125.4,95.6,'red',7,1]].forEach(([a,b,p2,sd,bg])=>house3(a,b,p2,sd,bg));
 library3(127.6,71.6);smithy3(129.4,89.2);chapel3(149.0,83.8);
 [[142.0,87.0,'ochre',8,1],[141.8,95.0,'blue',9,0],[150.6,93.8,'slate',10,1],[145.8,92.0,'moss',11,0],
  [132.2,98.6,'teal',12,0],[143.8,99.4,'plum',13,1],[149.4,98.2,'moss',14,0],[133.0,83.4,'ochre',15,0],
  [119.4,85.2,'blue',16,1],[163.6,84.6,'teal',17,1]].forEach(([a,b,p2,sd,bg])=>house3(a,b,p2,sd,bg));
 windmill3(158.6,74.0);
 fountain3(Math.round(SQ[0]),Math.round(SQ[1]));
 [[130.6,75.2],[130.6,80.8],[142.4,75.2],[142.4,80.8],[133.2,73.4],[139.8,73.4]].forEach(([a,b],i)=>stall3(a,b,(i&1)?BL.AWN_W:BL.AWN_R,(i&1)?BL.AWN_R:BL.AWN_W));
 for(let b=70;b<100;b+=5){lampPost(134,Math.round(b));lampPost(139,Math.round(b))}
 for(let b=71;b<97;b+=8){bannerPole(133,Math.round(b));bannerPole(139,Math.round(b))}
 for(let b=70;b<100;b+=10){prop3(143,Math.round(b),'pot',b);prop3(129,Math.round(b),'barrel',b)}
 well3(143.4,78.4);
 prop3(133.6,79.6,'crates',1);prop3(139.6,76.4,'barrel',2);prop3(130.0,78.6,'hay',3);
 prop3(126.8,87.4,'wood',4);prop3(131.8,91.8,'barrel',5);
 prop3(115.2,86.0,'crates',6);prop3(116.0,89.4,'barrel',7);prop3(115.0,96.8,'crates',8);prop3(117.8,92.6,'wood',9);
 prop3(165.4,81.4,'hive',10);prop3(166.0,82.6,'hive',11);prop3(160.4,87.2,'hay',12);prop3(162.2,88.0,'hay',13);
 prop3(166.6,77.8,'scare',14);prop3(147.8,77.0,'sign',15);prop3(135.2,88.6,'sign',16);
 prop3(130.6,63.4,'crates',17);prop3(142.6,63.2,'barrel',18);prop3(131.8,58.5,'bench',19);
 for(const[a,b]of[[129.0,57.0],[128.8,60.4],[144.0,61.0],[133.2,62.6],[139.8,62.6]])prop3(a,b,'pot',a|0);
 throne3(138.5,102)}
// ---------- the 2D world's road network, in stone under our feet ----------
function roads2d(){
 const PD=G('pathD'),RD=G('roadD');
 if(!PD&&!RD)return;
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){
  const t=colTop(a,b);if(t===null||RES[CI(a,b)]||LAKE[CI(a,b)])continue;
  const id=VOX[VI(a,t,b)];if(id===BL.WALL_WHITE||id===BL.ROOF_DARK||id===BL.GOLD)continue;
  const d=Math.min(PD?PD(a,b):9,RD?RD(a,b):9);
  if(d<.58){setV(a,t,b,d<.18?BL.PAVER:BL.COBBLE);RES[CI(a,b)]=1}}}
// ---------- landmarks from the 2D map: rope bridges, the moon maze, the sky docks, orchard, pagoda ----------
function ropeBridge(p,alongB){
 if(!p)return;const A0=p.a0,A1=(alongB?p.a0:p.a1),B0=(alongB?p.b0:p.b),B1=(alongB?p.b1:p.b);
 const t0=colTop(Math.round(A0),Math.round(B0)),t1=colTop(Math.round(A1),Math.round(B1));
 const y0=(t0===null?0:t0)+1,y1=(t1===null?0:t1)+1,sag=clamp((p.sag||6)/6,1,2.6);
 const N=Math.ceil(Math.hypot(A1-A0,B1-B0)*1.8);
 const putAt=(x,y,z,id)=>setV(Math.round(x),Math.round(y),Math.round(z),id);
 for(let k=0;k<=N;k++){const t=k/N,A=lerp(A0,A1,t),B=lerp(B0,B1,t),Y=Math.round(lerp(y0,y1,t)-sag*Math.sin(t*3.14159));
  for(let w=-1;w<=1;w++)putAt(A+(alongB?w:0),Y,B+(alongB?0:w),BL.PLANK);          // a three-plank-wide deck
  if(k%4===0)for(const w of[-2,2]){                                                   // rail posts on both sides
   const x=A+(alongB?w:0),z=B+(alongB?0:w);
   putAt(x,Y+1,z,BL.WOOD);putAt(x,Y+2,z,BL.WOOD)}
  if(k%5===1)for(const w of[-2,2]){                                                   // the rope strands between them
   putAt(A+(alongB?w:0),Y+2,B+(alongB?0:w),BL.WOOD)}
  if(k%9===0){                                                                         // a support pillar into the cloud
   putAt(A,Y-1,B,BL.WOOD);putAt(A,Y-2,B,BL.WOOD);
   for(let d=3;d<=7;d++)putAt(A,Y-d,B,d%2?BL.ROCK_A:BL.ROCK_B)}}
}
function bridges(){
 const GG=n=>G(n);
 ropeBridge(GG('RB'),false);ropeBridge(GG('RB2'),false);
 ropeBridge(GG('RB3'),true);ropeBridge(GG('RB4'),true)}
function moonMaze(){
 const M=G('MAZE')||{a0:145.2,b0:68.7,n:7},n=M.n,vw=[],hw=[],seen=new Set();
 for(let r=0;r<n;r++){vw.push(Array(n+1).fill(1));hw.push(Array(n+1).fill(1))}
 hw.push(Array(n+1).fill(1));
 const carve=(r,c,k)=>{seen.add(r*n+c);const dirs=[[0,1],[1,0],[0,-1],[-1,0]].map((d,q)=>[d,h2(r*7+c,k+q*13)]).sort((x,y)=>x[1]-y[1]).map(x=>x[0]);
  for(const[dr,dc]of dirs){const rr=r+dr,cc=c+dc;if(rr<0||cc<0||rr>=n||cc>=n||seen.has(rr*n+cc))continue;
   if(dc===1)vw[r][c+1]=0;else if(dc===-1)vw[r][c]=0;else if(dr===1)hw[r+1][c]=0;else hw[r][c]=0;carve(rr,cc,k+1)}};
 carve(3,3,5);hw[n][1]=0;
 for(let r=0;r<n;r++)for(let c=0;c<=n;c++)if(vw[r][c])hedgeLine(M.a0+c,M.b0+r+.5,true);
 for(let r=0;r<=n;r++)for(let c=0;c<n;c++)if(hw[r][c])hedgeLine(M.a0+c+.5,M.b0+r,false)}
function hedgeLine(a,b,alongB){
 const t=colTop(Math.round(a),Math.round(b));if(t===null)return;
 for(let k=0;k<2;k++)for(let d=-1;d<=1;d++){
  const x=Math.round(a+(alongB?d:0)),z=Math.round(b+(alongB?0:d));
  if(!inb(x,z))continue;const q=colTop(x,z);if(q===null)continue;
  setV(x,q+1+k,z,(k||h2(x*3,z*7)>.7)?BL.LEAF_G:BL.LEAF_G2)}
 RES[CI(Math.round(a),Math.round(b))]=1}
function skyDocks(){
 // two long piers reaching off the harbour rock, with mooring posts
 for(const b of[87.5,94.5])for(let a=118;a>=108;a--){const x=Math.round(a),z=Math.round(b);
  if(!inb(x,z))continue;const t=colTop(x,z),y=t===null?-2:t+1;
  setV(x,y,z,BL.PLANK);if((x&1)===0){setV(x,y+1,z,BL.WOOD);setV(x,y+2,z,BL.WOOD)}}
 for(const[x,z]of[[113,87],[113,95],[110,88],[110,94]]){const t=colTop(x,z);if(t===null)continue;setV(x,t+1,z,BL.LANTERN);lightAt(x+.5,t+1.5,z+.5,10,3,0)}
 reserve(107,84,120,99)}
function pagodaShrine(){
 const ax=111,az=17,st=siteTop(ax-3,az-3,ax+3,az+3);if(!st)return;
 const y=st.hi+1;reserve(ax-4,az-4,ax+4,az+4);
 box(ax-3,az-3,ax+3,az+3,st.lo,y-1,BL.ROCK_A);
 for(const[r,dy]of[[3,1],[2,6],[1,11]]){
  box(ax-r,az-r,ax+r,az+r,y+dy,y+dy+3,r===3?BL.WALL_WHITE:BL.SHOJI);
  for(const sx of[-r,r])for(const sz of[-r,r])setV(ax+sx,y+dy+1,az+sz,BL.WALL_TIMBER);
  hipRoof(ax,az,y+dy+4,r+1,BL.ROOF_DARK,true)}
 setV(ax,y+17,az,BL.GOLD);lightAt(ax+.5,y+15,az+.5,12,3,1)}
function orchardRows(){
 const O=G('ORCH')||{a:161,b:79.6,r:7.4};
 for(let a=Math.round(O.a-6);a<=O.a+6;a+=3)for(let b=Math.round(O.b-6);b<=O.b+6;b+=3){
  if(Math.hypot(a-O.a,b-O.b)>O.r||!inb(a,b)||RES[CI(a,b)])continue;
  const t=colTop(a,b);if(t===null)continue;
  const VOXid=VOX[VI(a,t,b)];if(VOXid===BL.COBBLE||VOXid===BL.PAVER||VOXid===BL.FARM||VOXid===BL.SAND)continue;
  oak(a,b,t,.4,BL.LEAF_G,BL.LEAF_G2,null);
  for(let k=0;k<3;k++){const dx=Math.round((h2(a+k,b*3)-.5)*7),dz=Math.round((h2(a*3,b+k)-.5)*7);
   putIfEmpty(a+dx,t+4+((k&1)?1:0),b+dz,BL.GOLD)}
  RES[CI(a,b)]=1}}
function meadowLights(){
 const IN=G('inMeadow');
 for(let a=113;a<=124;a++)for(let b=58;b<=69;b++){
  if(IN&&!IN(a,b)||!inb(a,b)||RES[CI(a,b)])continue;
  if(h2(a*7,b*11)<.86)continue;const t=colTop(a,b);if(t===null)continue;
  setV(a,t+1,b,BL.LANTERN);lightAt(a+.5,t+1.5,b+.5,9,2.4,0);RES[CI(a,b)]=1}}

// ---------- the town kit: houses and outbuildings, placed from the 2D map's own coordinates ----------
const HPAL={ochre:[BL.WALL_OCHRE,BL.ROOF_RED],blue:[BL.WALL_BLUE,BL.ROOF_BLUE],teal:[BL.WALL_TIMBER_B,BL.ROOF_MOSS],
 plum:[BL.WALL_RED,BL.ROOF_MAROON],slate:[BL.WALL_TIMBER_C,BL.ROOF_DARK],moss:[BL.WALL_TIMBER,BL.ROOF_MOSS],
 red:[BL.WALL_RED,BL.ROOF_RED],white:[BL.WALL_WHITE,BL.ROOF_DARK],timber:[BL.WALL_TIMBER,BL.ROOF_DARK]};
function house3(ax,az,pal,seed,big){
 const R=big?3:2,st=siteTop(ax-R,az-R,ax+R,az+R);if(!st)return;
 const y=st.hi+1,hp=HPAL[pal]||HPAL.white,wall=hp[0],rf=hp[1];
 reserve(ax-R-1,az-R-1,ax+R+1,az+R+1);
 box(ax-R,az-R,ax+R,az+R,st.lo,y,BL.ROCK_A);
 box(ax-R,az-R,ax+R,az+R,st.lo,y,BL.ROCK_A);box(ax-R,az-R,ax+R,az+R,y+1,y+3,wall);
 box(ax-R,az+R,ax+R,az+R,y+1,y+1,BL.ROCK_B);
 for(const sx of[-R,R])for(const sz of[-R,R])box(ax+sx,az+sz,ax+sx,az+sz,y+1,y+3,BL.WOOD);
 box(ax-1,az+R,ax+1,az+R,y+1,y+2,BL.DOOR);setV(ax,y+3,az+R,BL.WOOD);
 setV(ax-1,st.hi,az+R+1,BL.PAVER);setV(ax+1,st.hi,az+R+1,BL.PAVER);
 for(const sx of[-R,R])setV(ax+sx,y+2,az,BL.WINDOW);
 setV(ax-R+1,y+2,az+R,BL.WINDOW);setV(ax+R-1,y+2,az+R,BL.WINDOW);
 box(ax-R-1,az-R-1,ax+R+1,az+R+1,y+4,y+4,BL.PLANK);
 box(ax-R,az-R,ax+R,az+R,y+5,y+7,wall);
 for(const sx of[-R,R])for(const sz of[-R,R])box(ax+sx,az+sz,ax+sx,az+sz,y+5,y+7,BL.WOOD);
 for(const sx of[-R,R]){setV(ax+sx,y+6,az-1,BL.WINDOW);setV(ax+sx,y+6,az+1,BL.WINDOW)}
 setV(ax-1,y+6,az+R,BL.WINDOW);setV(ax+1,y+6,az+R,BL.WINDOW);
 setV(ax-1,y+6,az-R,BL.WINDOW);setV(ax+1,y+6,az-R,BL.WINDOW);
 hipRoof(ax,az,y+8,R+1,rf,true);
 for(let k=0;k<4;k++)setV(ax-R+1,y+8+k,az-R+1,BL.BRICK);
 setV(ax-R+1,y+12,az-R+1,BL.ROCK_B);SMOKES.push([ax-R+1.5,y+12.6,az-R+1.5]);
 setV(ax+R,y+4,az+R,BL.LANTERN);lightAt(ax+R+.5,y+4.5,az+R+.5,8,2.2,0);
 for(const df of[-1,1]){const q=colTop(ax+df,az+R+1);if(q!==null)setV(ax+df,q,az+R+1,BL.PAVER)}}
function barn3(ax,az){
 const st=siteTop(ax-3,az-3,ax+3,az+3);if(!st)return;const y=st.hi+1;reserve(ax-4,az-4,ax+4,az+4);
 box(ax-3,az-2,ax+3,az+2,st.lo,y,BL.ROCK_A);box(ax-3,az-2,ax+3,az+2,y+1,y+4,BL.WALL_RED);
 for(const sx of[-3,3])for(const sz of[-2,2])box(ax+sx,az+sz,ax+sx,az+sz,y+1,y+4,BL.WOOD);
 box(ax-1,az+2,ax+1,az+2,y+1,y+3,BL.DOOR);setV(ax,y+4,az+2,BL.WOOD);
 box(ax-2,az+2,ax+2,az+2,y+4,y+4,BL.PLANK);
 for(let k=0;k<3;k++)box(ax-4+k,az-3+k,ax+4-k,az+3-k,y+5+k,y+5+k,k===2?BL.BRICK:BL.ROOF_DARK);
 setV(ax+2,y+3,az-2,BL.WINDOW);setV(ax-2,y+3,az-2,BL.WINDOW);
 SMOKES.push([ax+.5,y+9,az+.5]);lightAt(ax+.5,y+3.5,az+3.4,7,0)}
function coop3(ax,az){
 const t=colTop(ax,az);if(t===null)return;reserve(ax-2,az-2,ax+2,az+2);
 box(ax-1,az-1,ax+1,az+1,t+1,t+2,BL.WALL_OCHRE);
 for(const sx of[-1,1])for(const sz of[-1,1])setV(ax+sx,t+1,az+sz,BL.WOOD);
 setV(ax,t+1,az+1,BL.DOOR);box(ax-2,az-2,ax+2,az+2,t+3,t+3,BL.ROOF_RED);
 setV(ax-2,t+1,az-2,BL.WOOD);setV(ax+2,t+1,az+2,BL.WOOD);setV(ax-2,t+2,az-2,BL.WOOD);setV(ax+2,t+2,az+2,BL.WOOD);
 for(const[dx,dz]of[[1,2],[2,1]])for(let y=t+1;y<=t+3;y++)setV(ax+dx,y,az+dz,BL.WOOD)}
const MILLS=[];
function windmill3(ax,az){
 const st=siteTop(ax-2,az-2,ax+2,az+2);if(!st)return;const y=st.hi+1;reserve(ax-3,az-3,ax+3,az+3);
 box(ax-2,az-2,ax+2,az+2,st.lo,y+1,BL.ROCK_A);
 for(let k=0;k<7;k++){const r=k<4?2:1;box(ax-r,az-r,ax+r,az+r,y+2+k,y+2+k,k%2?BL.WALL_WHITE:BL.WALL_TIMBER_C)}
 setV(ax,y+3,az+2,BL.DOOR);setV(ax+1,y+5,az+2,BL.WINDOW);setV(ax-1,y+6,az+2,BL.WINDOW);
 hipRoof(ax,az,y+9,3,BL.ROOF_DARK,true);
 const g=new THREE.Group(),hub=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),mat(0x6b4a30));g.add(hub);
 for(let k=0;k<4;k++){const bl=new THREE.Mesh(new THREE.BoxGeometry(1.1,8.4,.28),mat(k%2?0xd8cfb8:0xb9a98a));
  bl.position.y=4.2;const h=new THREE.Group();h.add(bl);h.rotation.z=k*Math.PI/2;g.add(h)}
 g.position.set(ax+.5,y+8.5,az+2.6);g.scale.setScalar(.72);scene.add(g);MILLS.push(g)}
function boathouse3(ax,az){
 let st=siteTop(ax-2,az-2,ax+2,az+2);if(!st){const q=colTop(ax,az);if(q===null)return;st={hi:q,lo:q}}
 const y=st.hi+1;reserve(ax-3,az-3,ax+3,az+3);
 box(ax-2,az-2,ax+2,az+2,st.lo,y,BL.PLANK);
 for(const sx of[-2,2])for(const sz of[-2,2])box(ax+sx,az+sz,ax+sx,az+sz,y+1,y+3,BL.WOOD);
 box(ax-2,az-2,ax+2,az-2,y+1,y+3,BL.WALL_TIMBER_B);box(ax-2,az-2,ax-2,az+2,y+1,y+3,BL.WALL_TIMBER_B);
 box(ax+2,az-2,ax+2,az+2,y+1,y+3,BL.WALL_TIMBER_B);
 box(ax-2,az-2,ax+2,az+2,y+4,y+4,BL.PLANK);
 for(let k=0;k<3;k++)box(ax-3+k,az-3+k,ax+3-k,az+3-k,y+5+k,y+5+k,BL.ROOF_DARK);
 SMOKES.push([ax+.5,y+9,az+.5])}
function shrine3(ax,az){
 const t=colTop(ax,az);if(t===null)return;reserve(ax-3,az-3,ax+3,az+3);
 box(ax-2,az-2,ax+2,az+2,t+1,t+1,BL.ROCK_A);box(ax-1,az-1,ax+1,az+1,t+2,t+3,BL.WALL_WHITE);
 for(const sx of[-1,1])for(const sz of[-1,1])setV(ax+sx,t+2,az+sz,BL.WOOD);
 setV(ax,t+2,az+1,BL.SHOJI);hiRoof(ax,az,t+4,2);
 setV(ax,t+5,az,BL.GOLD);toriiGate(ax,az+3,false);lightAt(ax+.5,t+3,az+.5,7,2.2,0)}
function hiRoof(cx,cz,y,r){
 for(let k=0;k<2;k++){const rr=r-k;box(cx-rr,cz-rr,cx+rr,cz+rr,y+k,y+k,y+k===y?BL.ROOF_DARK:BL.ROOF_DARK)}
 for(const sx of[-1,1])for(const sz of[-1,1])setV(cx+sx*(r),y+1,cz+sz*(r),BL.ROOF_DARK)}
function hermit3(ax,az){
 const t=colTop(ax,az);if(t===null)return;reserve(ax-2,az-2,ax+2,az+2);
 box(ax-1,az-1,ax+1,az+1,t+1,t+2,BL.WALL_TIMBER);setV(ax,t+1,az+1,BL.DOOR);
 hipRoof(ax,az,t+3,2,BL.ROOF_MOSS,false);
 setV(ax,t+1,az-2,BL.FIRE);lightAt(ax+.5,t+1.5,az-2.5,8,2.6,2);SMOKES.push([ax+.5,t+4.5,az+.5])}
function lookout3(ax,az){
 const t=colTop(ax,az);if(t===null)return;reserve(ax-2,az-2,ax+2,az+2);
 box(ax-1,az-1,ax+1,az+1,t+1,t+2,BL.ROCK_A);
 for(const sx of[-1,1])for(const sz of[-1,1])box(ax+sx,az+sz,ax+sx,az+sz,t+3,t+8,BL.WOOD);
 box(ax-1,az-1,ax+1,az+1,t+9,t+9,BL.PLANK);box(ax-1,az-1,ax+1,az+1,t+10,t+10,BL.PLANK);
 for(const sx of[-1,1])for(const sz of[-1,1])setV(ax+sx,t+11,az+sz,BL.WOOD);
 hipRoof(ax,az,t+12,2,BL.ROOF_DARK,false);
 box(ax-1,az-1,ax+1,az+1,t+3,t+3,BL.PLANK);setV(ax,t+11,az,BL.LANTERN);lightAt(ax+.5,t+10.5,az+.5,10,2.6,0)}
function well3(ax,az){
 const t=colTop(ax,az);if(t===null)return;reserve(ax-2,az-2,ax+2,az+2);
 for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){if(dx&&dz)continue;setV(ax+dx,t+1,az+dz,BL.ROCK_A);setV(ax+dx,t+2,az+dz,BL.ROCK_B)}
 setV(ax,t+1,az,BL.AQUA);setV(ax,t+2,az,BL.AQUA);
 for(const sx of[-1,1]){setV(ax+sx,t+3,az,BL.WOOD);setV(ax+sx,t+4,az,BL.WOOD)}
 for(let k=-1;k<=1;k++)setV(ax+k,t+5,az,BL.ROOF_DARK);
 lightAt(ax+.5,t+2.5,az+.5,7,0)}
function stall3(ax,az,idA,idB){
 const t=colTop(ax,az);if(t===null)return;reserve(ax-2,az-2,ax+2,az+2);
 for(const sx of[-1,1])for(const sz of[-1,1]){setV(ax+sx,t+1,az+sz,BL.WOOD);setV(ax+sx,t+2,az+sz,BL.WOOD)}
 box(ax-1,az,ax+1,az,t+1,t+1,BL.PLANK);
 for(let k=-2;k<=2;k++)for(let zz=-1;zz<=1;zz++)setV(ax+k,t+3,az+zz,(k&1)?idB:idA);
 setV(ax+1,t+2,az+1,BL.CROP_O);setV(ax-1,t+2,az,BL.CROP_G);setV(ax,t+2,az-1,BL.CROP_Y);
 setV(ax,t+2,az+2,BL.LANTERN);lightAt(ax+.5,t+2.5,az+2.5,8,2.4,0)}
function fountain3(ax,az){
 const t=colTop(ax,az);if(t===null)return;reserve(ax-3,az-3,ax+3,az+3);
 for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const d=Math.hypot(dx,dz);
  if(d>2.6)continue;if(d>1.6){setV(ax+dx,t+1,az+dz,BL.ROCK_A);setV(ax+dx,t+2,az+dz,BL.ROCK_B)}else setV(ax+dx,t+1,az+dz,BL.AQUA)}
 setV(ax,t+2,az,BL.ROCK_B);setV(ax,t+3,az,BL.ROCK_B);setV(ax,t+4,az,BL.AQUA);setV(ax,t+5,az,BL.AQUA);
 lightAt(ax+.5,t+3.5,az+.5,9,0,0);for(const o of[-1,1]){setV(ax+o*2,t+1,az,BL.LANTERN)}}
function chapel3(ax,az){
 const st=siteTop(ax-3,az-3,ax+3,az+3);if(!st)return;const y=st.hi+1;reserve(ax-4,az-4,ax+4,az+4);
 box(ax-3,az-2,ax+3,az+2,st.lo,y,BL.ROCK_A);box(ax-3,az-2,ax+3,az+2,y+1,y+4,BL.WALL_WHITE);
 for(const sx of[-3,3])for(const sz of[-2,2])box(ax+sx,az+sz,ax+sx,az+sz,y+1,y+4,BL.WOOD);
 box(ax-1,az+2,ax+1,az+2,y+1,y+3,BL.DOOR);
 for(const sx of[-2,2]){setV(ax+sx,y+2,az+2,BL.WINDOW);setV(ax+sx,y+3,az-2,BL.WINDOW)}
 for(let k=0;k<3;k++)box(ax-4+k,az-3+k,ax+4-k,az+3-k,y+5+k,y+5+k,BL.ROOF_DARK);
 box(ax+2,az-1,ax+3,az,y+5,y+8,BL.WALL_WHITE);hipRoof(ax+2,az,y+9,1,BL.ROOF_DARK,false);
 setV(ax+2,y+7,az,BL.GOLD);setV(ax+2,y+10,az,BL.COPPER);
 lightAt(ax+.5,y+3.5,az+3.2,8,2.2,0)}
function smithy3(ax,az){
 const st=siteTop(ax-2,az-2,ax+2,az+2);if(!st)return;const y=st.hi+1;reserve(ax-3,az-3,ax+3,az+3);
 box(ax-2,az-2,ax+2,az+2,st.lo,y,BL.ROCK_A);box(ax-2,az-2,ax+2,az+2,y+1,y+3,BL.WALL_TIMBER_C);
 for(const sx of[-2,2])for(const sz of[-2,2])box(ax+sx,az+sz,ax+sx,az+sz,y+1,y+3,BL.WOOD);
 box(ax-1,az+2,ax+1,az+2,y+1,y+3,BL.DOOR);
 box(ax-2,az-2,ax+2,az+2,y+4,y+4,BL.PLANK);
 for(let k=0;k<3;k++)box(ax-3+k,az-3+k,ax+3-k,az+3-k,y+5+k,y+5+k,BL.ROOF_DARK);
 setV(ax-1,y+1,az,BL.FIRE);setV(ax-1,y+2,az,BL.FIRE);
 lightAt(ax-.5,y+2,az+.5,10,3.2,2);setV(ax+1,y+1,az,BL.BRICK);setV(ax+1,y+2,az,BL.ROCK_B);
 SMOKES.push([ax-.5,y+8.5,az+.5])}
function library3(ax,az){
 house3(ax,az,'slate',6,true);
 const st=siteTop(ax-3,az-3,ax+3,az+3);if(!st)return;const y=st.hi+1;
 setV(ax-2,y+3,az+4,BL.LANTERN);setV(ax+2,y+3,az+4,BL.LANTERN);lightAt(ax+.5,y+3.5,az+4.5,9,2.4,0)}
function throne3(ax,az){
 const t=colTop(ax,az);if(t===null)return;reserve(ax-3,az-3,ax+3,az+3);
 for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)setV(ax+dx,t+1,az+dz,BL.PAVER);
 box(ax-1,az-1,ax+1,az-1,t+2,t+4,BL.GOLD);box(ax-1,az,t+2,t+2,BL.GOLD);
 setV(ax-1,t+3,az,BL.GOLD);setV(ax+1,t+3,az,BL.GOLD);
 for(const sx of[-2,2]){setV(ax+sx,t+1,az+2,BL.LANTERN);lightAt(ax+sx+.5,t+1.5,az+2.5,9,2.6,0)}}
function bannerPole(ax,az){
 const t=colTop(ax,az);if(t===null)return;
 for(let y=t+1;y<=t+7;y++)setV(ax,y,az,BL.WOOD);
 for(let y=t+4;y<=t+7;y++)for(let k=1;k<=2;k++)setV(ax,y,az+k,y===t+7?BL.TORII_DARK:BL.WALL_RED);
 setV(ax,t+8,az,BL.GOLD);RES[CI(ax,az)]=1}
function prop3(ax,az,kind,seed){
 const t=colTop(ax,az);if(t===null||RES[CI(ax,az)])return;const y=t+1;
 if(kind==='lamp'){lampPost(ax,az);return}
 if(kind==='camp'){setV(ax,y,az,BL.WOOD);setV(ax+1,y,az,BL.WOOD);setV(ax,y,az+1,BL.WOOD);setV(ax+1,y,az+1,BL.FIRE);lightAt(ax+1,t+2,az+1.5,12,3.4,2);dput('log',ax+.4,y,az-.8,.8,0);RES[CI(ax,az)]=1;return}
 if(kind==='cat'){setV(ax,y,az,BL.SKIN);setV(ax,y+1,az,BL.HAIR);RES[CI(ax,az)]=1;return}
 const map={barrel:'barrel',crates:'crate',hay:'hay',log:'log',hive:'hive',pot:'pot',bench:'bench',
  wood:'woodpile',scare:'scarecrow',sign:'sign',stump:'stump',rock:'rock',bucket:'bucket',sack:'sack'};
 const k=map[kind]||'crate';
 dput(k,ax+.5,y,az+.5,.85+h2(ax*5+1,az*3)*.3,h2(ax*7+2,az*11+5)*6.283);
 RES[CI(ax,az)]=1}

function fenceLine(a0,b0,a1,b1){
 const n=Math.ceil(Math.hypot(a1-a0,b1-b0)*2.2);
 for(let k=0;k<=n;k++){const t=k/n,a=Math.round(a0+(a1-a0)*t),b=Math.round(b0+(b1-b0)*t);
  const q=colTop(a,b);if(q===null)continue;
  setV(a,q+1,b,BL.WOOD);setV(a,q+2,b,BL.WOOD);
  if(k%2===1){setV(a,q+1,b,BL.WOOD);setV(a,q+2,b,BL.PLANK)}}}


// ============================================================
//  ROUNDED GEOMETRY KIT
//  The terrain stays honest voxel; everything that grows or was made by hand is
//  real geometry - low-poly spheres, lathes and tubes with baked vertex colour.
// ============================================================
let V3T=null,QT=null,ET=null,MID=null;
function kitInit(){if(MID)return;V3T=new THREE.Vector3();QT=new THREE.Quaternion();ET=new THREE.Euler();MID=new THREE.Matrix4()}
function M4(x,y,z,rx,ry,rz,sx,sy,sz){
 const m=new THREE.Matrix4();QT.setFromEuler(ET.set(rx||0,ry||0,rz||0));
 m.compose(V3T.set(x||0,y||0,z||0),QT,V3T.clone().set(sx===undefined?1:sx,sy===undefined?(sx===undefined?1:sx):sy,sz===undefined?(sx===undefined?1:sx):sz));
 return m}
const M4P=(x,y,z)=>new THREE.Matrix4().makeTranslation(x||0,y||0,z||0);
const SRGB=v=>Math.pow(Math.max(0,v),2.2);
function paintGrad(g,lo,hi,dirPower){
 const p=g.attributes.position,n=g.attributes.normal,c=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){const t=clamp(Math.pow(Math.max(0,n.getY(i)*.5+.5),dirPower||1),0,1);
  c[i*3]=SRGB(lo[0]+(hi[0]-lo[0])*t);c[i*3+1]=SRGB(lo[1]+(hi[1]-lo[1])*t);c[i*3+2]=SRGB(lo[2]+(hi[2]-lo[2])*t)}
 g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return g}
function paintSolid(g,c){
 const p=g.attributes.position,col=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){col[i*3]=SRGB(c[0]);col[i*3+1]=SRGB(c[1]);col[i*3+2]=SRGB(c[2])}
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g}
function paintBark(g,base,dark){
 const p=g.attributes.position,n=g.attributes.normal,col=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){
  const q=h2(Math.round(p.getX(i)*40),Math.round(p.getZ(i)*40+p.getY(i)*7));
  const t=q<.35?dark:base;const sh=.86+q*.28;
  col[i*3]=SRGB(t[0]*sh);col[i*3+1]=SRGB(t[1]*sh);col[i*3+2]=SRGB(t[2]*sh)}
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g}
function gSph(r,det,seed,bump,squash){
 const g=new THREE.IcosahedronGeometry(r,det===undefined?1:det),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  const k=1+(h2(Math.round(x*29+seed*37)+i*0,Math.round(y*31+z*23+seed*11))-.5)*bump;
  p.setXYZ(i,x*k,y*k*(squash||1),z*k)}
 g.computeVertexNormals();return g}
function gCyl(rt,rb,h,seg,seed){
 const g=new THREE.CylinderGeometry(rt,rb,h,seg===undefined?8:seg,1,false);
 const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);
  const k=1+(h2(Math.round(x*40+seed*7),Math.round(z*40+seed*13))-.5)*.06;p.setXYZ(i,x*k,p.getY(i),z*k)}
 g.computeVertexNormals();return g}
function gCone(r,h,seg,y0,seed){
 const g=new THREE.ConeGeometry(r,h,seg===undefined?9:seg,2,true);
 const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i);
  const k=1+(h2(Math.round(x*40+seed*5),Math.round(z*40+y*9+seed*17))-.5)*.14;p.setXYZ(i,x*k,y+k*.06,z*k)}
 g.computeVertexNormals();if(y0)g.translate(0,y0,0);return g}
function gTube(pts,r,seg,closed){
 const curve=new THREE.CatmullRomCurve3(pts.map(q=>new THREE.Vector3(q[0],q[1],q[2])),!!closed);
 const g=new THREE.TubeGeometry(curve,Math.max(6,pts.length*3),r,seg===undefined?5:seg,!!closed);
 return g}
// bake: [ {g, m, c} ] -> one flat BufferGeometry with position / normal / color
function bake(list){
 const P=[],N=[],C=[],nm=new THREE.Matrix3(),v=new THREE.Vector3();
 for(const it of list){
  if(!it||!it.g)continue;
  let g=it.g;if(g.index)g=g.toNonIndexed();
  const m=it.m||MID,c=it.c||[1,1,1];
  nm.getNormalMatrix(m);
  const p=g.attributes.position,nr=g.attributes.normal,ca=g.attributes.color;
  for(let i=0;i<p.count;i++){
   v.fromBufferAttribute(p,i).applyMatrix4(m);P.push(v.x,v.y,v.z);
   v.fromBufferAttribute(nr,i).applyMatrix3(nm).normalize();N.push(v.x,v.y,v.z);
   if(ca)C.push(ca.getX(i)*c[0],ca.getY(i)*c[1],ca.getZ(i)*c[2]);
   else C.push(c[0],c[1],c[2])}}
 const out=new THREE.BufferGeometry();
 out.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
 out.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
 out.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
 out.computeBoundingSphere();return out}

// ============================================================
//  TREES - grown, not stacked
// ============================================================
const TREES=[];
const TRUNK_D=[.30,.22,.16],TRUNK_L=[.52,.38,.26];
function oak(ax,az,top,s,A,B,list){
 const t=top+1;TREES.push({x:ax+.5,z:az+.5,y:t,k:'oak',s:.85+h2(ax*7,az*11)*.45,r:h2(ax*13,az*5)*6.283});
 if(list)list.push([ax+.5,t+8,az+.5])}
function maple(ax,az,top,s){
 TREES.push({x:ax+.5,z:az+.5,y:top+1,k:'maple',s:.85+h2(ax*3,az*17)*.45,r:h2(ax*11,az*7)*6.283});
 MAPLES.push([ax+.5,top+7,az+.5])}
function sakura(ax,az,top,s){
 TREES.push({x:ax+.5,z:az+.5,y:top+1,k:'sakura',s:.9+h2(ax*5,az*19)*.4,r:h2(ax*17,az*3)*6.283});
 SAKURA.push([ax+.5,top+7,az+.5])}
function pine(ax,az,top,s,snowy){
 TREES.push({x:ax+.5,z:az+.5,y:top+1,k:snowy?'pineS':'pine',s:.8+h2(ax*23,az*13)*.5,r:h2(ax*29,az*7)*6.283});
 if(snowy)SNOWC.push([ax,az])}

const TGEO={};
function paintLeaf(g,lo,hi,seed,pow){
 // gradient by face normal, plus a per-facet dither so the canopy reads as leaf
 // clumps instead of one smooth plastic ball
 const p=g.attributes.position,n=g.attributes.normal,c=new Float32Array(p.count*3);
 const k=pow===undefined?1.05:pow;
 for(let i=0;i<p.count;i++){
  const t=clamp(Math.pow(Math.max(0,n.getY(i)*.5+.5),k),0,1);
  const f=(i/3)|0;
  const d=1+(h2(f*13+seed*7,f*29+seed*3)-.5)*.38;
  c[i*3]=SRGB(clamp((lo[0]+(hi[0]-lo[0])*t)*d,0,1));
  c[i*3+1]=SRGB(clamp((lo[1]+(hi[1]-lo[1])*t)*d,0,1));
  c[i*3+2]=SRGB(clamp((lo[2]+(hi[2]-lo[2])*t)*d,0,1))}
 g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return g}
function bark(g){return paintBark(g,[.36,.26,.18],[.17,.115,.075])}
function limb(a,ln,r,baseY,r0,seed,tilt){
 const g=gCyl(.075,r*.55,ln,5,seed);bark(g);
 return {g:g,m:M4(Math.cos(a)*ln*.34,baseY,Math.sin(a)*ln*.34,Math.sin(a)*tilt,0,-Math.cos(a)*tilt,1,1,1),c:[1,1,1]}}

// a crown is a shell of many small clumps, each one a slightly different tone,
// which is what makes the silhouette read as foliage instead of a ball
function clumpCrown(parts,seed,cx,cy,cz,R,lo,hi,n,clumpR,pow){
 for(let i=0;i<n;i++){
  const t=(i+.5)/n,ph=i*2.399963+seed*1.7;
  const yy=1-2*t, rr=Math.sqrt(Math.max(0,1-yy*yy));
  const k=.60+h2(seed*7+i*13,seed*3+i*29)*.42;
  const px=cx+Math.cos(ph)*rr*R*k, py=cy+yy*R*.80*k, pz=cz+Math.sin(ph)*rr*R*k;
  const cr=clumpR*(.70+h2(seed*11+i*5,seed*17+i*23)*.58);
  const up=clamp((py-cy)/(R*1.7)+.5,0,1),q=Math.pow(up,pow===undefined?1.05:pow);
  const g=gSph(1,i%4===0?1:0,seed*3+i+1,.24,.86+((i%3)-1)*.05);
  paintLeaf(g,[lo[0]+(hi[0]-lo[0])*q*.55,lo[1]+(hi[1]-lo[1])*q*.55,lo[2]+(hi[2]-lo[2])*q*.55],
             [lo[0]+(hi[0]-lo[0])*(.55+q*.45),lo[1]+(hi[1]-lo[1])*(.55+q*.45),lo[2]+(hi[2]-lo[2])*(.55+q*.45)],seed+i);
  parts.push({g:g,m:M4(px,py,pz,0,seed+i,0,cr,cr*.88,cr)})}}

// little flower / fruit dots sitting on the outside of the crown
function crownDots(parts,seed,cx,cy,cz,R,cA,cB,n){
 for(let i=0;i<n;i++){
  const ph=i*2.399963+seed*2.1, yy=.72-1.44*((i+.5)/n), rr=Math.sqrt(Math.max(0,1-yy*yy));
  const g=gSph(.11,0,seed*9+i,.30,1);
  paintSolid(g,i%3===0?cA:cB);
  parts.push({g:g,m:M4(cx+Math.cos(ph)*rr*R*1.02,cy+yy*R*.86,cz+Math.sin(ph)*rr*R*1.02,0,0,0,1,1,1)})}}

function oakGeo(v){
 const parts=[],seed=v*7+1;
 const H=5.0+v*.7+((v*13)%3)*.4,r0=.30+v*.05;
 const tr=gCyl(r0*.62,r0*1.15,H+1.0,8,seed);bark(tr);
 parts.push({g:tr,m:M4(0,(H+1.0)/2,0),c:[1,1,1]});
 for(let k=0;k<3;k++)parts.push(limb(seed*.8+k*2.1,1.9+k*.18,.34,H*.7,0,seed+k*3,.62+k*.06));
 const base=[[.145,.275,.125],[.175,.330,.150],[.200,.365,.170]][v%3];
 const R=1.95+v*.13, cy=H+1.45;
 clumpCrown(parts,seed,0,cy,0,R,[base[0]*.55,base[1]*.55,base[2]*.62],[base[0]*1.85,base[1]*1.72,base[2]*1.34],10,1.02*R/1.9);
 // a skirt of lower clumps so the crown overhangs the trunk
 for(let k=0;k<4;k++){const a=seed*1.4+k*1.571,rr=R*(.72+h2(seed+k,7)*.22);
  const g=gSph(1,0,seed*5+k+30,.26,.84);
  paintLeaf(g,[base[0]*.42,base[1]*.44,base[2]*.50],[base[0]*.95,base[1]*.98,base[2]*.80],seed+k);
  parts.push({g:g,m:M4(Math.cos(a)*rr,cy-R*.42,Math.sin(a)*rr,0,a,0,R*.62,R*.50,R*.62)})}
 crownDots(parts,seed,0,cy,0,R,[.93,.90,.80],[.86,.72,.90],6);
 return bake(parts)}

function mapleGeo(v){
 const parts=[],seed=v*5+2;
 const H=4.6+v*.6,r0=.28+v*.04;
 const tr=gCyl(r0*.65,r0*1.15,H+1,8,seed);bark(tr);
 parts.push({g:tr,m:M4(0,(H+1)/2,0),c:[1,1,1]});
 for(let k=0;k<3;k++)parts.push(limb(seed*1.3+k*2.1,1.6+k*.14,.30,H*.66,0,seed+k*5,.70));
 const lo=[[.46,.11,.06],[.52,.15,.07],[.46,.22,.07]][v%3];
 const hi=[[.82,.38,.10],[.86,.50,.11],[.80,.60,.12]][v%3];
 const R=1.85+v*.11, cy=H+1.20;
 clumpCrown(parts,seed*2,0,cy,0,R,lo,hi,11,.92*R/1.85,1.0);
 for(let k=0;k<3;k++){const a=seed*2.2+k*2.094,rr=R*(.70+h2(seed+k*3,11)*.20);
  const g=gSph(1,0,seed*6+k+40,.26,.84);
  paintLeaf(g,[lo[0]*.80,lo[1]*.80,lo[2]*.80],[hi[0]*.92,hi[1]*.92,hi[2]*.92],seed+k);
  parts.push({g:g,m:M4(Math.cos(a)*rr,cy-R*.44,Math.sin(a)*rr,0,a,0,R*.58,R*.46,R*.58)})}
 return bake(parts)}

function sakuraGeo(v){
 const parts=[],seed=v*3+4;
 const H=4.2+v*.55,r0=.27;
 const tr=gCyl(r0*.62,r0*1.1,H+1,8,seed);bark(tr);
 parts.push({g:tr,m:M4(0,(H+1)/2,0),c:[1,1,1]});
 for(let k=0;k<4;k++)parts.push(limb(seed*2+k*1.57,1.5+k*.12,.26,H*.60,0,seed+k*7,.95));
 const R=2.15+v*.12, cy=H+1.05;
 clumpCrown(parts,seed*3,0,cy,0,R,[.78,.50,.60],[1,.93,.96],12,1.02*R/2.15,1.0);
 for(let k=0;k<5;k++){const a=seed*3.1+k*1.257,rr=R*(.76+h2(seed+k*5,13)*.20);
  const g=gSph(1,0,seed*7+k+50,.24,.80);
  paintLeaf(g,[.84,.56,.66],[1,.95,.97],seed+k);
  parts.push({g:g,m:M4(Math.cos(a)*rr,cy-R*.40,Math.sin(a)*rr,0,a,0,R*.56,R*.42,R*.56)})}
 return bake(parts)}

function pineGeo(v,snow){
 const parts=[],seed=v*9+3;
 const H=8.2+v*1.3,trunkH=H*.56;
 const tr=gCyl(.18,.44,trunkH+1.4,8,seed);bark(tr);
 parts.push({g:tr,m:M4(0,(trunkH+1.4)/2,0),c:[1,1,1]});
 const tiers=8,span=H-trunkH*.55;
 for(let k=0;k<tiers;k++){
  const f=k/(tiers-1);
  const jit=1+(h2(seed*3+k*7,seed+k)-.5)*.18;
  const rr=(1-f*.84)*2.10*jit,rH=1.55-f*.30,y=trunkH*.50+f*span;
  const g=gCone(rr,rH,11,y,seed+k*5);
  const dark=[[.075,.190,.115],[.090,.220,.135],[.105,.250,.150]][v%3];
  if(snow)paintSnow(g,dark,[.94,.97,1],y-rH*.5,y+rH*.5);
  else paintLeaf(g,[dark[0],dark[1],dark[2]],[dark[0]*1.62,dark[1]*1.50,dark[2]*1.34],seed+k,.75);
  parts.push({g:g,c:[1,1,1]})}
 return bake(parts)}

function paintSnow(g,dark,white,y0,y1){
 const p=g.attributes.position,c=new Float32Array(p.count*3),span=Math.max(.01,y1-y0);
 for(let i=0;i<p.count;i++){const t=clamp((p.getY(i)-y0)/span*1.6-.62,0,1)*(h2(Math.round(p.getX(i)*30),Math.round(p.getZ(i)*30))>.28?1:.45);
  c[i*3]=SRGB(dark[0]+(white[0]-dark[0])*t);c[i*3+1]=SRGB(dark[1]+(white[1]-dark[1])*t);c[i*3+2]=SRGB(dark[2]+(white[2]-dark[2])*t)}
 g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return g}
function buildTrees(root){
 const byKey={};
 for(const t of TREES){
  const v=Math.floor(h2(t.x*5+1,t.z*7+3)*3);
  const key=t.k+v;const b=byKey[key]||(byKey[key]=[]);b.push(t)}
 const matl=new THREE.MeshLambertMaterial({vertexColors:true});patchLit(matl,1);matl.name='tree';
 for(const key in byKey){
  const list=byKey[key];
  const k=key.replace(/[0-9]/g,''),v=+key.replace(/\D/g,'')||0;
  if(!TGEO[key]){
   if(k==='oak')TGEO[key]=oakGeo(v);
   else if(k==='maple')TGEO[key]=mapleGeo(v);
   else if(k==='sakura')TGEO[key]=sakuraGeo(v);
   else TGEO[key]=pineGeo(v,key.indexOf('pineS')===0)}
  const im=new THREE.InstancedMesh(TGEO[key],matl,list.length);
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),sv=new THREE.Vector3(),pv=new THREE.Vector3();
  list.forEach((t,i)=>{q.setFromEuler(e.set(0,t.r,0));pv.set(t.x,t.y,t.z);sv.set(t.s,t.s*(.92+h2(t.x,t.z)*.2),t.s);m.compose(pv,q,sv);im.setMatrixAt(i,m)});
  im.instanceMatrix.needsUpdate=true;im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;
  im.name='tree_'+key;root.add(im)}
 return TREES.length}

function plantTrees(){
 const ZF=G('ZONE'),EDAF=G('EDA'),PD=G('pathD'),RD=G('roadD');let n=0;
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){
  const ci=CI(a,b);if(!KEY[ci]||LAKE[ci]||RES[ci])continue;
  const bio=BIO[ci],K=KEY[ci],outer=K===7;
  // the walked lanes stay clear - a tree never grows across a path
  const pd=PD?PD(a+.5,b+.5):9,rd=RD?RD(a+.5,b+.5):9;
  if(pd<2.7||rd<2.1)continue;
  if(K===1&&Math.hypot(a-22,b-18)<9)continue;
  let d=bio===3?.5:bio===2?.44:bio===4?.24:bio===5?.2:.4;
  if(outer)d=.155;
  if(K===1&&ZF){const z=ZF(a+.5,b+.5);
   if(z==='field'||z==='orchard'||z==='river')continue;
   if(z==='town')d=.02;else if(z==='woods')d=Math.min(.8,d+.26);else if(z==='meadow')d*=.2;else if(z==='clearing')d*=.3}
  if(EDAF&&(K===1||K===2||K===4))d*=clamp(.3+EDAF(a+.5,b+.5)/8,0,1);
  if(K===1&&Math.hypot(a-14.6,b-12.6)<7.5)d*=.45;
  if(K===1&&TRM[ci])d*=.3;
  if(K===5){const EDE=G('EDE'),RD=G('roadD');
   const e=EDE?EDE(a+.5,b+.5):9;d=e<2.8?.46:.1;
   if(RD&&RD(a+.5,b+.5)<4)d*=.12}
  if(K===1)d*=.60;
  if(d<.015)continue;
  for(let q=0;q<((K===1||K===7)?1:2);q++){
  if(h2(a*13+q*7+5,b*17+q*3+3)>d)continue;
  const ax=a+Math.round((h2(a*3+q,b*5+q*5)-.5)*1.6),az=b+Math.round((h2(a*7+q*3,b*3+q)-.5)*1.6);
  if(!inb(ax,az))continue;const c2=CI(ax,az);
  if(!KEY[c2]||LAKE[c2]||RES[c2])continue;
  const top=colTop(ax,az);if(top===null)continue;
  const idv=VOX[VI(ax,top,az)];
  if(idv===BL.COBBLE||idv===BL.FARM||idv===BL.SAND||idv===BL.PAVER||idv===BL.GRAVEL||idv===BL.PLANK)continue;
  let near=false;
  for(let dx=-1;dx<=1&&!near;dx++)for(let dz=-1;dz<=1;dz++)if((dx||dz)&&inb(ax+dx,az+dz)&&OCC[CI(ax+dx,az+dz)]){near=true;break}
  if(near)continue;
  let nearR=false;
  for(let dx=-2;dx<=2&&!nearR;dx++)for(let dz=-2;dz<=2;dz++){const x2=ax+dx,z2=az+dz;if(inb(x2,z2)&&RES[CI(x2,z2)]){nearR=true;break}}
  if(nearR)continue;
  if(!outer&&!(LAND(ax+1,az)&&LAND(ax-1,az)&&LAND(ax,az+1)&&LAND(ax,az-1)))continue;
  if(outer&&!(KEY[CI(ax+1,az)]&&KEY[CI(ax-1,az)]&&KEY[CI(ax,az+1)]&&KEY[CI(ax,az-1)]))continue;
  const sz=h2(ax*7,az*13),r=h2(ax+5,az*3+1),b2=BIO[c2];
  if(b2===3)pine(ax,az,top,sz,true);
  else if(b2===5)r<.7?pine(ax,az,top,sz,false):oak(ax,az,top,sz,BL.LEAF_G,BL.LEAF_G2);
  else if(b2===4)r<.72?sakura(ax,az,top,sz):oak(ax,az,top,sz,BL.LEAF_G,BL.LEAF_G2);
  else if(b2===2)r<.8?maple(ax,az,top,sz):pine(ax,az,top,sz,false);
  else if(K===5)r<.34?maple(ax,az,top,sz):oak(ax,az,top,sz,BL.LEAF_G,BL.LEAF_G2);
  else r<.12?sakura(ax,az,top,sz):r<.26?maple(ax,az,top,sz):oak(ax,az,top,sz,BL.LEAF_G,BL.LEAF_G2);
  OCC[c2]=1;n++}}
 return n}
// ---------- undergrowth: the ground cover that makes a wood read as a wood ----------
function understory(){
 let n=0;
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){
  const ci=CI(a,b);if(!KEY[ci]||LAKE[ci]||RES[ci])continue;
  if(h2(a*29+7,b*31+11)>.28)continue;
  const t=colTop(a,b);if(t===null)continue;
  const id=VOX[VI(a,t,b)];
  if(id===BL.COBBLE||id===BL.PAVER||id===BL.FARM||id===BL.SAND||id===BL.GRAVEL||id===BL.PLANK||id===BL.EARTH)continue;
  const bio=BIO[ci],r=h2(a*11+3,b*13+5);n++;
  if(bio===3){if(r<.5)setV(a,t+1,b,BL.LEAF_DARK);else setV(a,t+1,b,BL.ROCK_A)}
  else if(r<.30){setV(a,t+1,b,BL.LEAF_DARK);if(r<.12)setV(a,t+2,b,BL.LEAF_G)}
  else if(r<.52)setV(a,t+1,b,bio===2?BL.CROP_Y:BL.CROP_G);
  else if(r<.64)setV(a,t+1,b,bio===2?BL.CROP_O:BL.CROP_Y);
  else if(r<.74)setV(a,t+1,b,BL.ROCK_A);
  else if(r<.80){setV(a,t+1,b,BL.WOOD);setV(a,t+2,b,BL.WOOD)}
  else if(r<.90){setV(a,t+1,b,BL.CROP_G);setV(a,t+2,b,r<.85?BL.LEAF_G2:BL.CROP_O)}
  else setV(a,t+1,b,BL.LEAF_DARK)}
 return n}
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
 snow:`float t=fract(aS.x+uTime*aS.y*.03);p.y-=t*30.;p.x+=sin(uTime*.5+aS.x*60.)*2.+t*6.;p.z+=cos(uTime*.4+aS.w*50.)*2.;sz=.28+aS.w*.18;
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
 if(snowCells.length>40){const d=[];for(let i=0;i<300;i++){const c=snowCells[(R()*snowCells.length)|0];d.push([c[0]+R(),28,c[1]+R(),...rnd4()])}out.push(psys('snow','soft',d,false))}
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
 for(let i=0;i<9;i++){const a=R()*6.28,r=170+R()*150,s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false,opacity:.22+R()*.2,fog:false}));
  s.scale.set(90+R()*80,40+R()*22,1);s.position.set(86+Math.cos(a)*r,-92+R()*20,46+Math.sin(a)*r);s.userData.sp=2+R()*4;root.add(s);sprites.push(s)}}
function spritesStep(dt){for(const s of sprites){s.position.x+=s.userData.sp*dt;if(s.position.x>86+300)s.position.x-=600}}


// ============================================================
//  THE PROP KIT - barrels, drums, tyres, carts, pots, rocks, bushes.
//  Nothing here is a cube: lathes, tori and low-poly spheres, one instanced mesh per kind.
// ============================================================
const DP={};
function dput(kind,x,y,z,s,rot){
 (DP[kind]||(DP[kind]=[])).push([x,y,z,s===undefined?.9:s,rot||0])}
const LATHE=(pts,seg)=>new THREE.LatheGeometry(pts.map(q=>new THREE.Vector2(q[0],q[1])),seg||12);
const DISC=(r,seg)=>{const g=new THREE.CircleGeometry(r,seg||12);g.rotateX(-Math.PI/2);return g};
const RING=(r,tube,seg)=>new THREE.TorusGeometry(r,tube,4,seg||14);
const HOOPS=[[.42,.30],[.42,.62]];

function propGeo(k){
 const P=[];
 if(k==='barrel'){
  P.push({g:LATHE([[.30,0],[.38,.10],[.44,.34],[.43,.62],[.36,.86],[.31,.92]],12),c:[.46,.28,.15]});
  for(const[q,t]of HOOPS)P.push({g:RING(.445,.026,12),m:M4(0,t,0,Math.PI/2,0,0),c:[.26,.27,.30]});
  P.push({g:DISC(.30,12),m:M4P(0,.915,0),c:[.38,.24,.13]});
  P.push({g:new THREE.CylinderGeometry(.05,.05,.03,6),m:M4P(.13,.93,0),c:[.34,.34,.38]});
  return bake(P)}
 if(k==='drum'){
  P.push({g:new THREE.CylinderGeometry(.34,.34,.92,14),m:M4P(0,.46,0),c:[.34,.36,.40]});
  P.push({g:RING(.345,.022,14),m:M4(0,.20,0,Math.PI/2,0,0),c:[.24,.25,.28]});
  P.push({g:RING(.345,.022,14),m:M4(0,.72,0,Math.PI/2,0,0),c:[.24,.25,.28]});
  P.push({g:DISC(.34,14),m:M4P(0,.925,0),c:[.28,.30,.34]});
  P.push({g:RING(.10,.03,10),m:M4(0,.93,0,Math.PI/2,0,0),c:[.22,.23,.26]});
  return bake(P)}
 if(k==='tyre'){
  P.push({g:RING(.42,.16,16),m:M4(0,.17,0,Math.PI/2,0,0),c:[.13,.13,.14]});
  P.push({g:RING(.42,.05,16),m:M4(0,.17,0,Math.PI/2,0,0),c:[.20,.20,.21]});
  return bake(P)}
 if(k==='crate'){
  P.push({g:new THREE.BoxGeometry(.82,.72,.82),m:M4P(0,.36,0),c:[.56,.38,.20]});
  for(const yy of[.08,.64])for(const zz of[-.42,.42])P.push({g:new THREE.BoxGeometry(.88,.09,.06),m:M4P(0,yy,zz),c:[.42,.28,.15]});
  for(const yy of[.08,.64])for(const xx of[-.42,.42])P.push({g:new THREE.BoxGeometry(.06,.09,.88),m:M4P(xx,yy,0),c:[.42,.28,.15]});
  for(const xx of[-.42,.42])for(const zz of[-.42,.42])P.push({g:new THREE.BoxGeometry(.08,.72,.08),m:M4P(xx,.36,zz),c:[.46,.31,.17]});
  return bake(P)}
 if(k==='sack'){
  const g=gSph(.42,1,7,.16,.86);paintGrad(g,[.62,.52,.34],[.86,.76,.56],.8);
  P.push({g:g,m:M4P(0,.40,0)});
  P.push({g:new THREE.CylinderGeometry(.07,.13,.16,7),m:M4P(0,.80,0),c:[.42,.33,.22]});
  return bake(P)}
 if(k==='pot'){
  P.push({g:LATHE([[.10,0],[.24,.06],[.31,.24],[.28,.46],[.17,.58],[.15,.62]],12),c:[.52,.30,.22]});
  P.push({g:RING(.175,.028,12),m:M4(0,.60,0,Math.PI/2,0,0),c:[.42,.24,.18]});
  return bake(P)}
 if(k==='bucket'){
  P.push({g:new THREE.CylinderGeometry(.28,.22,.52,12,1,true),m:M4P(0,.26,0),c:[.50,.34,.19]});
  P.push({g:DISC(.22,12),m:M4P(0,.03,0),c:[.40,.27,.15]});
  P.push({g:RING(.275,.028,12),m:M4(0,.50,0,Math.PI/2,0,0),c:[.30,.31,.34]});
  P.push({g:new THREE.TorusGeometry(.27,.018,4,10,Math.PI),m:M4P(0,.50,0),c:[.34,.35,.38]});
  return bake(P)}
 if(k==='log'){
  P.push({g:new THREE.CylinderGeometry(.34,.36,2.1,10),m:M4(0,.36,0,0,0,Math.PI/2),c:[.40,.27,.16]});
  for(const xx of[-1.02,1.02])P.push({g:DISC(.35,10),m:M4(xx,.36,0,0,0,Math.PI/2),c:[.62,.50,.32]});
  return bake(P)}
 if(k==='stump'){
  P.push({g:new THREE.CylinderGeometry(.40,.50,.55,9),m:M4P(0,.27,0),c:[.38,.26,.15]});
  P.push({g:DISC(.40,9),m:M4P(0,.56,0),c:[.64,.52,.34]});
  P.push({g:RING(.40,.05,9),m:M4(0,.55,0,Math.PI/2,0,0),c:[.40,.28,.17]});
  return bake(P)}
 if(k==='wheel'){
  P.push({g:RING(.46,.07,14),m:M4(0,.46,0,0,0,0),c:[.42,.29,.16]});
  for(let i=0;i<4;i++)P.push({g:new THREE.BoxGeometry(.10,.86,.06),m:M4(0,.46,0,0,0,i*Math.PI/4),c:[.46,.32,.18]});
  P.push({g:new THREE.CylinderGeometry(.11,.11,.14,8),m:M4(0,.46,0,Math.PI/2,0,0),c:[.30,.30,.33]});
  return bake(P)}
 if(k==='cart'){
  P.push({g:new THREE.BoxGeometry(1.7,.16,1.0),m:M4P(0,.62,0),c:[.50,.34,.19]});
  for(const zz of[-.46,.46])P.push({g:new THREE.BoxGeometry(1.7,.34,.10),m:M4P(0,.80,zz),c:[.44,.30,.17]});
  for(const zz of[-.46,.46])P.push({g:new THREE.BoxGeometry(1.7,.10,.10),m:M4P(0,.36,zz),c:[.40,.28,.16]});
  for(const xx of[-.78,.78])for(const zz of[-.46,.46])P.push({g:new THREE.BoxGeometry(.10,.34,.10),m:M4P(xx,.44,zz),c:[.40,.28,.16]});
  for(const zz of[-.60,.60]){
   P.push({g:RING(.42,.07,14),m:M4(-.10,.44,zz,0,0,0),c:[.38,.26,.15]});
   for(let i=0;i<4;i++)P.push({g:new THREE.BoxGeometry(.09,.78,.05),m:M4(-.10,.44,zz,0,0,i*Math.PI/4),c:[.42,.29,.16]})}
  P.push({g:new THREE.CylinderGeometry(.05,.05,1.5,6),m:M4(1.35,.42,0,0,0,.13),c:[.44,.31,.18]});
  return bake(P)}
 if(k==='hay'){
  P.push({g:new THREE.CylinderGeometry(.55,.55,1.0,12),m:M4(0,.55,0,0,0,Math.PI/2),c:[.80,.68,.34]});
  for(const xx of[-.55,-.10,.34])P.push({g:RING(.56,.025,12),m:M4(xx,.55,0,0,Math.PI/2,0),c:[.52,.42,.22]});
  for(const xx of[-.50,.50])P.push({g:DISC(.55,12),m:M4(xx,.55,0,0,0,Math.PI/2),c:[.86,.76,.44]});
  return bake(P)}
 if(k==='hive'){
  for(let i=0;i<4;i++)P.push({g:RING(.30-i*.03,.09,12),m:M4(0,.16+i*.17,0,Math.PI/2,0,0),c:[.76,.60,.24]});
  P.push({g:new THREE.ConeGeometry(.20,.22,10),m:M4P(0,.86,0),c:[.62,.48,.20]});
  P.push({g:DISC(.06,6),m:M4P(0,.97,0),c:[.24,.20,.12]});
  return bake(P)}
 if(k==='bench'){
  P.push({g:new THREE.BoxGeometry(1.5,.10,.42),m:M4P(0,.44,0),c:[.52,.36,.20]});
  P.push({g:new THREE.BoxGeometry(1.5,.10,.10),m:M4(0,.62,-.18,-.22,0,0),c:[.52,.36,.20]});
  for(const xx of[-.58,.58])for(const zz of[-.16,.16])P.push({g:new THREE.BoxGeometry(.10,.44,.10),m:M4P(xx,.22,zz),c:[.34,.24,.14]});
  return bake(P)}
 if(k==='sign'){
  P.push({g:new THREE.CylinderGeometry(.06,.07,1.3,6),m:M4P(0,.65,0),c:[.38,.27,.16]});
  P.push({g:new THREE.BoxGeometry(.9,.42,.07),m:M4(0,1.16,0,0,0,0),c:[.62,.46,.26]});
  P.push({g:new THREE.BoxGeometry(.86,.05,.09),m:M4P(0,1.20,0),c:[.34,.26,.15]});
  return bake(P)}
 if(k==='scarecrow'){
  P.push({g:new THREE.CylinderGeometry(.06,.07,1.9,6),m:M4P(0,.95,0),c:[.40,.29,.17]});
  P.push({g:new THREE.CylinderGeometry(.05,.05,1.3,6),m:M4(0,1.45,0,0,0,Math.PI/2),c:[.40,.29,.17]});
  P.push({g:LATHE([[.16,0],[.28,.14],[.26,.42],[.18,.56]],10),m:M4P(0,1.10,0),c:[.52,.34,.20]});
  P.push({g:gSph(.20,1,3,.10,.9),m:M4P(0,1.66,0),c:[.82,.68,.44]});
  P.push({g:new THREE.ConeGeometry(.42,.22,10),m:M4P(0,1.86,0),c:[.74,.62,.30]});
  return bake(P)}
 if(k==='rock'){
  const g=gSph(.62,1,11,.34,.72);paintGrad(g,[.30,.31,.33],[.52,.53,.53],.9);
  P.push({g:g,m:M4P(0,.32,0)});
  return bake(P)}
 if(k==='bush'){
  const c1=gSph(.55,1,13,.35,.86);paintGrad(c1,[.10,.22,.10],[.30,.50,.22],1.1);
  P.push({g:c1,m:M4P(0,.44,0)});
  const c2=gSph(.40,1,17,.36,.9);paintGrad(c2,[.10,.22,.10],[.32,.52,.24],1.1);
  P.push({g:c2,m:M4P(.42,.32,.12,0,1.1,0)});
  const c3=gSph(.34,1,19,.36,.9);paintGrad(c3,[.10,.22,.10],[.28,.48,.22],1.1);
  P.push({g:c3,m:M4P(-.36,.30,-.16,0,2.2,0)});
  return bake(P)}
 if(k==='fern'){
  for(let i=0;i<5;i++){const a=i*1.2566;
   P.push({g:new THREE.ConeGeometry(.10,.85,4,1,true),m:M4(Math.cos(a)*.18,.40,Math.sin(a)*.18,Math.sin(a)*.5,0,Math.cos(a)*.5),c:[.20,.40,.16]})}
  return bake(P)}
 if(k==='mushroom'){
  P.push({g:new THREE.CylinderGeometry(.05,.07,.22,6),m:M4P(0,.11,0),c:[.86,.82,.70]});
  P.push({g:gSph(.17,1,23,.12,.60),m:M4P(0,.24,0),c:[.78,.28,.20]});
  return bake(P)}
 if(k==='lantern'){
  P.push({g:LATHE([[.16,0],[.22,.06],[.24,.30],[.20,.44],[.20,.50]],10),c:[.86,.72,.44]});
  P.push({g:new THREE.ConeGeometry(.26,.12,8),m:M4P(0,.56,0),c:[.30,.24,.20]});
  P.push({g:new THREE.CylinderGeometry(.03,.03,1.9,5),m:M4P(0,-.95,0),c:[.34,.26,.18]});
  return bake(P)}
 if(k==='stoneLantern'){
  P.push({g:new THREE.CylinderGeometry(.30,.36,.18,8),m:M4P(0,.09,0),c:[.48,.47,.44]});
  P.push({g:new THREE.CylinderGeometry(.13,.16,.60,8),m:M4P(0,.48,0),c:[.52,.51,.48]});
  P.push({g:new THREE.BoxGeometry(.44,.10,.44),m:M4P(0,.83,0),c:[.54,.53,.50]});
  P.push({g:new THREE.CylinderGeometry(.26,.26,.30,8),m:M4P(0,1.03,0),c:[.86,.74,.42]});
  P.push({g:new THREE.ConeGeometry(.42,.22,8),m:M4P(0,1.29,0),c:[.46,.46,.44]});
  P.push({g:gSph(.08,0,31,.1,1),m:M4P(0,1.44,0),c:[.52,.51,.48]});
  return bake(P)}
 if(k==='umbrella'){
  P.push({g:new THREE.CylinderGeometry(.04,.04,1.7,6),m:M4P(0,.85,0),c:[.36,.27,.16]});
  P.push({g:new THREE.ConeGeometry(1.05,.42,12,1,true),m:M4P(0,1.72,0),c:[.78,.28,.24]});
  P.push({g:RING(1.02,.03,12),m:M4(0,1.53,0,Math.PI/2,0,0),c:[.60,.22,.20]});
  return bake(P)}
 if(k==='ropeCoil'){
  for(let i=0;i<3;i++)P.push({g:RING(.26-i*.02,.055,12),m:M4(0,.09+i*.10,0,Math.PI/2,0,0),c:[.56,.48,.32]});
  return bake(P)}
 if(k==='buoy'){
  P.push({g:gSph(.26,1,29,.2,.9),m:M4P(0,.24,0),c:[.72,.24,.20]});
  P.push({g:new THREE.CylinderGeometry(.05,.05,.30,6),m:M4P(0,.50,0),c:[.34,.32,.28]});
  P.push({g:RING(.10,.02,8),m:M4(0,.66,0,Math.PI/2,0,0),c:[.40,.38,.32]});
  return bake(P)}
 if(k==='netRoll'){
  P.push({g:new THREE.CylinderGeometry(.20,.20,1.5,10),m:M4(0,.20,0,0,0,Math.PI/2),c:[.46,.42,.32]});
  for(let i=0;i<5;i++)P.push({g:RING(.21,.03,10),m:M4(-.6+i*.3,.20,0,0,Math.PI/2,0),c:[.54,.50,.38]});
  return bake(P)}
 if(k==='fishRack'){
  for(const xx of[-.8,.8])P.push({g:new THREE.CylinderGeometry(.05,.06,1.9,6),m:M4P(xx,.95,0),c:[.40,.29,.17]});
  P.push({g:new THREE.CylinderGeometry(.05,.05,1.8,6),m:M4(0,1.8,0,0,0,Math.PI/2),c:[.40,.29,.17]});
  for(let i=0;i<4;i++){const xx=-.55+i*.37;
   P.push({g:gSph(.13,1,37+i,.2,.42),m:M4(xx,1.55,0,0,0,0),c:[.72,.66,.56]})}
  return bake(P)}
 if(k==='weaponRack'){
  P.push({g:new THREE.BoxGeometry(1.5,.12,.30),m:M4P(0,.92,0),c:[.42,.30,.18]});
  for(const xx of[-.70,.70])P.push({g:new THREE.BoxGeometry(.12,.95,.28),m:M4P(xx,.47,0),c:[.40,.28,.17]});
  for(let i=0;i<5;i++){const xx=-.56+i*.28;
   P.push({g:new THREE.CylinderGeometry(.035,.035,1.7,5),m:M4(xx,.90,0,0,0,.08),c:[.46,.33,.20]});
   P.push({g:new THREE.ConeGeometry(.07,.24,5),m:M4(xx,1.76,0,0,0,.08),c:[.62,.64,.66]})}
  return bake(P)}
 if(k==='cannon'){
  const prof=[[.10,0],[.16,.05],[.17,.30],[.13,.52],[.15,.60]];
  P.push({g:LATHE(prof,10),m:M4(0,.55,0,0,0,Math.PI/2-.12),c:[.22,.23,.25]});
  for(const q of[-.28,.02])P.push({g:RING(.17,.03,10),m:M4(q,.66,0,0,0,Math.PI/2-.12),c:[.30,.31,.33]});
  P.push({g:new THREE.BoxGeometry(.72,.20,.46),m:M4P(-.10,.28,0),c:[.42,.30,.17]});
  for(const zz of[-.26,.26])P.push({g:RING(.22,.06,12),m:M4(-.10,.24,zz,0,0,0),c:[.34,.24,.14]});
  return bake(P)}
 if(k==='woodpile'){
  for(let i=0;i<3;i++)for(let j=0;j<2;j++)
   P.push({g:new THREE.CylinderGeometry(.11,.11,1.0,7),m:M4(-.33+j*.22,.13+i*.22,0,Math.PI/2,0,0),c:i%2?[.44,.30,.18]:[.38,.26,.15]});
  return bake(P)}
 if(k==='planter'){
  const wood=[.48,.33,.18],soil=[.20,.145,.10];
  for(const zz of[-.50,.50])P.push({g:new THREE.BoxGeometry(1.50,.30,.12),m:M4P(0,.22,zz),c:wood});
  for(const xx of[-.69,.69])P.push({g:new THREE.BoxGeometry(.12,.30,.90),m:M4P(xx,.22,0),c:wood});
  P.push({g:new THREE.BoxGeometry(1.34,.08,.78),m:M4P(0,.26,0),c:soil});
  P.push({g:new THREE.BoxGeometry(1.40,.07,.84),m:M4P(0,.33,0),c:[.26,.19,.12]});
  for(let r=0;r<2;r++)for(let q=0;q<3;q++){
   const cx=-.44+q*.44,cz=-.22+r*.44;
   P.push({g:gSph(.13,1,70+r*3+q,.24,.9),m:M4P(cx,.42,cz),c:[.24,.44,.20]});
   P.push({g:gSph(.07,0,80+r*3+q,.2,.9),m:M4P(cx+.05,.50,cz-.03),c:[.30,.52,.24]})}
  return bake(P)}
 if(k==='posyA'||k==='posyB'||k==='posyC'){
  const pal=k==='posyA'?[[.90,.90,.86],[.68,.60,.86],[.95,.95,.90]]
   :k==='posyB'?[[.52,.62,.88],[.66,.76,.95],[.44,.54,.80]]
   :[[.86,.42,.52],[.94,.78,.36],[.88,.52,.62]];
  for(let i=0;i<7;i++){
   const an=i*2.399+1.1,rr=.05+i*.028,h=.16+((i*37)%5)*.05;
   P.push({g:new THREE.CylinderGeometry(.010,.014,h,4),m:M4P(Math.cos(an)*rr,h*.5,Math.sin(an)*rr),c:[.24,.38,.18]});
   P.push({g:gSph(.042+i*.004,0,90+i,.22,.85),m:M4P(Math.cos(an)*rr,h+ .03,Math.sin(an)*rr),c:pal[i%3]})}
  return bake(P)}
 if(k==='waterBarrel'){
  P.push({g:LATHE([[.34,0],[.42,.14],[.46,.40],[.42,.66],[.34,.74]],12),c:[.40,.26,.15]});
  for(const t of[.16,.60])P.push({g:RING(.45,.03,12),m:M4(0,t,0,Math.PI/2,0,0),c:[.28,.29,.32]});
  P.push({g:DISC(.34,12),m:M4P(0,.74,0),c:[.10,.24,.30]});
  return bake(P)}
 // fallback: a crate
 P.push({g:new THREE.BoxGeometry(.8,.7,.8),m:M4P(0,.35,0),c:[.52,.36,.20]});
 return bake(P)}

let PROP_MAT=null;const PROP_GEO={};
function buildProps(root){
 if(!PROP_MAT){PROP_MAT=new THREE.MeshLambertMaterial({vertexColors:true});PROP_MAT.name='prop'}
 let total=0;
 for(const k in DP){
  const arr=DP[k];if(!arr.length)continue;
  if(!PROP_GEO[k])PROP_GEO[k]=propGeo(k);
  const im=new THREE.InstancedMesh(PROP_GEO[k],PROP_MAT,arr.length);
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),sv=new THREE.Vector3(),pv=new THREE.Vector3();
  arr.forEach((o,i)=>{q.setFromEuler(e.set(0,o[4],0));pv.set(o[0],o[1],o[2]);sv.set(o[3],o[3],o[3]);m.compose(pv,q,sv);im.setMatrixAt(i,m)});
  im.instanceMatrix.needsUpdate=true;im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;
  im.name='prop_'+k;root.add(im);total+=arr.length}
 return total}

// ---------- scatter: the clutter that makes a place feel lived in ----------
function nearRes(a,b,r){for(let x=a-r;x<=a+r;x++)for(let z=b-r;z<=b+r;z++)if(inb(x,z)&&RES[CI(x,z)])return true;return false}
function detailScatter(){
 const ZF=G('ZONE');
 // ---- the village: yards, the plaza, the mill, the boathouse
 const yard=[[15.4,10.6,'barrel'],[15.1,11.4,'barrel'],[13.4,13.6,'sack'],[13.0,14.2,'sack'],[12.4,13.0,'crate'],
  [18.6,10.2,'bucket'],[19.2,11.0,'hay'],[18.4,8.8,'hay'],[11.2,9.2,'log'],[10.6,8.4,'stump'],[10.0,10.6,'woodpile'],
  [17.4,12.6,'crate'],[18.2,13.4,'barrel'],[20.6,8.6,'sack'],[21.2,9.4,'crate'],
  [9.6,6.6,'hay'],[9.0,6.0,'barrel'],[8.0,7.6,'waterBarrel'],[7.6,8.6,'woodpile'],
  [23.0,20.0,'netRoll'],[23.8,20.8,'buoy'],[22.4,21.4,'crate'],[24.6,19.2,'ropeCoil'],
  [30.0,20.4,'barrel'],[31.4,20.6,'crate'],[33.0,21.0,'sack'],[34.4,21.6,'barrel'],
  [26.2,15.2,'barrel'],[27.8,14.6,'crate'],[26.8,13.2,'pot'],[28.8,13.0,'pot'],[24.8,13.6,'pot'],
  [22.4,6.6,'woodpile'],[30.2,5.0,'hay'],[22.0,16.8,'crate'],
  [12.6,22.6,'log'],[12.0,23.4,'stump'],[10.2,24.2,'barrel'],[9.4,23.2,'sack'],
  [17.2,27.0,'log'],[16.4,27.8,'stump'],[15.4,29.2,'barrel'],
  [20.4,32.0,'hay'],[19.6,33.0,'sack'],[14.0,32.4,'barrel'],
  [36.0,22.4,'barrel'],[35.2,23.2,'crate'],[37.4,21.4,'bucket'],
  [30.6,26.4,'rock'],[26.0,26.0,'bush'],[15.0,20.0,'bush'],[12.0,19.0,'bush']];
 // ---- the castle town, the ward and the training yard
 const town=[[128.4,49.4,'barrel'],[129.0,50.2,'crate'],[130.2,52.0,'barrel'],
  [131.0,74.4,'crate'],[130.2,76.2,'barrel'],[141.2,74.6,'crate'],[142.2,76.4,'barrel'],
  [131.2,80.2,'barrel'],[130.4,81.6,'crate'],[141.6,80.2,'barrel'],[142.4,81.4,'crate'],
  [132.6,88.4,'barrel'],[131.8,89.6,'crate'],[128.2,90.2,'sack'],[127.6,91.4,'barrel'],
  [146.4,46.6,'barrel'],[147.2,47.4,'crate'],[143.6,52.4,'barrel'],[144.2,53.4,'sack'],
  [130.0,57.4,'weaponRack'],[143.4,57.6,'weaponRack'],[131.4,64.2,'cannon'],[142.2,64.0,'cannon'],
  [134.6,63.2,'barrel'],[139.4,63.4,'barrel'],[125.4,84.6,'crate'],[124.6,85.6,'barrel'],
  [150.6,84.4,'crate'],[151.4,85.4,'sack'],[149.2,90.6,'barrel'],[120.4,88.2,'crate'],
  [136.2,96.4,'barrel'],[137.4,96.8,'crate'],[135.0,98.2,'sack'],
  [132.4,101.2,'stoneLantern'],[141.2,101.4,'stoneLantern'],
  [148.2,78.4,'ropeCoil'],[128.8,78.6,'ropeCoil']];
 for(const[a,b,k]of yard.concat(town)){
  const t=colTop(Math.round(a),Math.round(b));if(t===null)continue;
  dput(k,a,t+1,b,.85+h2(a*7,b*3)*.35,h2(a*3,b*11)*6.283)}
 // ---- kitchen gardens beside the houses, and posies in the meadow grass
 const beds=[[13.9,11.2,'planter'],[14.6,15.4,'planter'],[9.8,9.0,'planter'],[19.4,7.2,'planter'],
  [21.6,11.8,'planter'],[26.9,12.0,'planter'],[11.4,21.0,'planter'],[16.0,26.2,'planter'],
  [129.6,52.6,'planter'],[143.8,52.2,'planter'],[133.0,74.0,'planter'],[140.4,73.6,'planter'],
  [127.4,86.6,'planter'],[148.8,86.0,'planter'],[135.4,95.4,'planter']];
 for(const[a,b,k]of beds){
  const t=colTop(Math.round(a),Math.round(b));if(t===null)continue;
  dput(k,a,t+1,b,1.0,h2(a*5,b*7)*6.283)}
 // ---- woodland clutter: stumps, logs, mushrooms, boulders, bushes
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){
  const ci=CI(a,b);if(!KEY[ci]||LAKE[ci]||RES[ci])continue;
  const t=colTop(a,b);if(t===null)continue;
  const idv=VOX[VI(a,t,b)];
  if(idv===BL.COBBLE||idv===BL.PAVER||idv===BL.SAND||idv===BL.GRAVEL||idv===BL.PLANK)continue;
  const bio=BIO[ci],r=h2(a*31,b*37+5);
  const zf=(KEY[ci]===7)?'forest':(ZF?ZF(a+.5,b+.5):'forest');
  const townish=(zf==='town');
  let d=bio===3?.16:bio===2?.14:bio===4?.10:.13;
  if(KEY[ci]===7)d*=.42;
  if(townish)d*=.35;
  if(h2(a*7+3,b*11+9)>d)continue;
  const x=a+.5+(h2(a*5,b*3)-.5)*.6,z=b+.5+(h2(a*3,b*7)-.5)*.6;
  const rot=h2(a*11,b*13)*6.283;
  if(bio===3){if(r<.42)dput('rock',x,t+1,z,.8+h2(a,b)*.9,rot);else if(r<.7)dput('stump',x,t+1,z,.8+h2(a,b)*.4,rot);continue}
  if(r<.16)dput('bush',x,t+1,z,.8+h2(a,b)*.6,rot);
  else if(r<.28)dput('bush',x,t+1,z,.55+h2(a,b)*.3,rot+1.7);
  else if(r<.40)dput('rock',x,t+1,z,.7+h2(a,b)*.8,rot);
  else if(r<.50)dput('stump',x,t+1,z,.8+h2(a,b)*.4,rot);
  else if(r<.58)dput('log',x,t+1,z,.8+h2(a,b)*.3,rot);
  else if(r<.66)dput('fern',x,t+1,z,.8+h2(a,b)*.5,rot);
  else if(r<.74)dput('mushroom',x,t+1,z,.7+h2(a,b)*.6,rot);
  else if(r<.80)dput(h2(a*3,b*19)<.5?'posyA':(h2(a*11,b*2)<.5?'posyB':'posyC'),x,t+1,z,.8+h2(a,b)*.7,rot);
  else if(r<.86)dput('pot',x,t+1,z,.7,rot);
  RES[CI(a,b)]=1}
}

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
 kitInit();
 buildVoxels();buildStructures();const nt=plantTrees();populate();detailScatter();
 const B=greedyMesh(),root=new THREE.Group();scene.add(root);WROOT=root;let faces=0;
 for(const k in B){const m=B[k];if(!m.i.n)continue;const mesh=new THREE.Mesh(geoFrom(m),getMat(k));mesh.name=k;mesh.castShadow=k!=='fire';mesh.receiveShadow=true;root.add(mesh);faces+=m.i.n/6}
 const w=waterBuild();if(w)root.add(w);
 const nTree=buildTrees(root);
 const nProp=buildProps(root);
 const nVil=buildVillagers(root);
 const nCri=spawnCritters(root);
 const nSky=skyIslets(root);
 buildDecor().forEach(o=>root.add(o));
 buildPonds();buildKoi(root);buildLilies(root);buildBoats(root);buildBirds(root);buildFalls(root);buildFx().forEach(o=>root.add(o));
 understory();
 airships();AV=buildAvatar();
 LIGHTS.slice(0,64).forEach((l,i)=>U.uL.value[i].set(l[0],l[1],l[2],l[3]));
 skyMat=null;skyMesh=skyMeshBuild();scene.add(skyMesh);seaMesh=seaBuild();scene.add(seaMesh);buildCloudPuffs(scene);
 hemi=new THREE.HemisphereLight(0xffffff,0x444444,1);scene.add(hemi);amb=new THREE.AmbientLight(0xffffff,.3);scene.add(amb);
 sunL=new THREE.DirectionalLight(0xffffff,3);sunL.castShadow=true;const mob=/Mobi|Android/i.test(navigator.userAgent),ms=renderer.capabilities.maxTextureSize;
 sunL.shadow.mapSize.set(mob||ms<4096?2048:4096,mob||ms<4096?2048:4096);const sc=sunL.shadow.camera;sc.left=-132;sc.right=132;sc.top=132;sc.bottom=-132;sc.near=10;sc.far=560;
 sunL.shadow.bias=-.0004;sunL.shadow.normalBias=.85;sunL.target.position.set(86,-4,46);scene.add(sunL,sunL.target);
 sunDir=new THREE.Vector3();PC=PRESETS.map(mkPhase);CUR=mkPhase(PRESETS[0]);setPhase(0,false);stepTime(0,true);
 camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,2,4000);
 az=tAz=.86;el=tEl=.70;rad=340;tRad=236;cx=tcx=90;cz=tcz=58;camUpdate(0);
 console.info('voxel world: '+Math.round(performance.now()-t0)+' ms, '+faces+' quads, '+nt+' trees ('+nTree+' grown), '+nProp+' props, '+nVil+' people, '+nCri+' animals, '+nSky+' sky islets, '+OUTER.length+' outer isles, '+LIGHTS.length+' lamps, '+KOI.length+' koi. '+BIOME_REPORT)}



// ============================================================
//  ANIMALS - sheep that graze and amble, hens that peck and hop.
// ============================================================
const CRIT=[];
function sheepMake(){
 const P=[],W=L3(0xece4d4),D=L3(0x3a3129),PK=L3(0xc79a90);
 const body=gSph(.52,1,21,.30,.80);
 P.push({g:body,m:M4(0,.78,0,0,0,0,1,.92,1.42),c:W});
 for(let i=0;i<5;i++){const a=i*1.2566;
  P.push({g:gSph(.24,0,40+i,.28,1),m:M4(Math.cos(a)*.36,.92,Math.sin(a)*.62),c:W})}
 P.push({g:gSph(.10,0,37,.2,1.3),m:M4(0,.84,-.68),c:W});
 if(!FIGMAT)FIGMAT=new THREE.MeshLambertMaterial({vertexColors:true});
 const g=new THREE.Group();
 g.add(new THREE.Mesh(bake(P),FIGMAT));
 const HP=[{g:gSph(.22,1,23,.12,1.05),m:M4(0,0,.10,0,0,0,1,.95,1.25),c:D}];
 for(const sx of[-1,1])HP.push({g:gSph(.10,0,31,.2,.5),m:M4(sx*.19,.12,.08,0,0,0,1,.6,1.4),c:D});
 HP.push({g:gSph(.11,0,33,.15,1),m:M4(0,-.06,.24),c:PK});
 const headPivot=new THREE.Group();headPivot.position.set(0,.92,.60);
 const headMesh=new THREE.Mesh(bake(HP),FIGMAT);headPivot.add(headMesh);g.add(headPivot);
 const legs=[];
 for(const sx of[-1,1])for(const sz of[-1,1]){
  const pv=new THREE.Group();pv.position.set(sx*.20,.56,sz*.32);
  pv.add(new THREE.Mesh(bake([{g:new THREE.CylinderGeometry(.065,.055,.56,5),m:M4P(0,-.28,0),c:D}]),FIGMAT));
  g.add(pv);legs.push(pv)}
 g.userData={head:headPivot,legs,body:g.children[0]};
 g.scale.setScalar(1.5);return g}

function henMake(col){
 const C=L3(col),BK=L3(0xe0a33a),RD=L3(0xc23a2a);
 const P=[{g:gSph(.26,1,47,.16,.95),m:M4(0,.34,0,0,0,0,1,.92,1.25),c:C},
  {g:new THREE.ConeGeometry(.10,.26,5),m:M4(0,.42,-.28,-1.0,0,0),c:C},
  {g:new THREE.ConeGeometry(.045,.10,5),m:M4(0,.55,.28,Math.PI/2,0,0),c:BK}];
 for(const sx of[-1,1])P.push({g:new THREE.CylinderGeometry(.018,.018,.20,4),m:M4P(sx*.07,.10,0),c:BK});
 const g=new THREE.Group();
 g.add(new THREE.Mesh(bake(P),FIGMAT));
 const H=[{g:gSph(.13,0,51,.1,1),m:M4P(0,.56,.16),c:C},{g:gSph(.055,0,53,.2,1.4),m:M4P(0,.66,.14),c:RD}];
 const head=new THREE.Mesh(bake(H),FIGMAT);g.add(head);
 g.userData={head,body:g.children[0],tail:null};
 g.scale.setScalar(1.45);return g}

// does this spot look like open grass?
function grassy(a,b){if(!inb(a,b))return false;const t=colTop(a,b);if(t===null)return false;
 const v=VOX[VI(a,t,b)];if(v!==BL.GRASS&&v!==BL.GRASS_DRY&&v!==BL.MOSS&&v!==BL.PETAL)return false;
 if(VOX[VI(a,t+1,b)])return false;if(RES[CI(a,b)])return false;return true}

function spawnCritters(root){
 const ZF=G('ZONE');let nSheep=0,nHen=0;
 const cand=[];
 for(let a=X0;a<=X1;a++)for(let b=Z0;b<=Z1;b++){
  const ci=CI(a,b);if(!KEY[ci]||LAKE[ci]||RES[ci])continue;
  if(!grassy(a,b))continue;
  const zf=(KEY[ci]===7)?'meadow':(ZF?ZF(a+.5,b+.5):'');
  cand.push([a+.5,b+.5,zf])}
 let sd=987654321;const rnd=()=>{sd=(sd*1103515245+12345)&0x7fffffff;return sd/0x7fffffff};
 for(let i=cand.length-1;i>0;i--){const j=(rnd()*(i+1))|0;const t=cand[i];cand[i]=cand[j];cand[j]=t}
 const HEN=[0xf2ece0,0xd8a24a,0xc0703a];
 for(const c of cand){
  if(nSheep>=11&&nHen>=12)break;
  const[a,b,zf]=c;
  if(nSheep<11&&(zf==='meadow'||zf==='orchard'||zf==='forest')){
   const g=sheepMake();root.add(g);
   CRIT.push({g,k:'sheep',a,b,spd:.5+rnd()*.35,ph:rnd()*6.28,pause:rnd()*3,tx:a,tz:b});
   nSheep++;continue}
  if(nHen<12&&(zf==='town'||zf==='meadow')){
   const g=henMake(HEN[nHen%3]);root.add(g);
   CRIT.push({g,k:'hen',a,b,spd:.8+rnd()*.5,ph:rnd()*6.28,pause:rnd()*2,tx:a,tz:b});
   nHen++}}
 return nSheep+nHen}

function critterStep(dt){
 for(const c of CRIT){
  const ud=c.g.userData;
  if(c.pause>0){
   c.pause-=dt;
   if(c.k==='sheep'){ud.head.rotation.x=Math.max(0,Math.sin(c.pause*2.1))*.85}
   else{const pk=Math.max(0,Math.sin(c.pause*7));
    ud.body.rotation.x=pk*.30;ud.head.rotation.x=-pk*1.15}
   continue}
  const dx=c.tx-c.a,dz=c.tz-c.b,d=Math.hypot(dx,dz);
  if(d<.18){
   c.pause=(c.k==='sheep'?1.6:1.0)+Math.random()*2.4;
   for(let k=0;k<6;k++){
    const na=c.a+(Math.random()-.5)*7,nb=c.b+(Math.random()-.5)*7;
    if(grassy(Math.round(na),Math.round(nb))){c.tx=na;c.tz=nb;break}}}
  else{
   const st=Math.min(d,c.spd*dt);
   c.a+=dx/d*st;c.b+=dz/d*st;
   c.ph+=dt*(c.k==='sheep'?4.5:9);
   c.g.rotation.y=Math.atan2(dx,dz);
   if(c.k==='sheep'){
    const sw=Math.sin(c.ph)*.34;
    ud.legs[0].rotation.x=sw;ud.legs[3].rotation.x=sw;
    ud.legs[1].rotation.x=-sw;ud.legs[2].rotation.x=-sw;
    c.g.position.y=Math.abs(Math.sin(c.ph))*.05;ud.head.rotation.x=.06}
   else{
    const hop=Math.max(0,Math.sin(c.ph));
    c.g.position.y=hop*.09+hop*.02;ud.body.rotation.x=.16+Math.sin(c.ph*2)*.1;
    ud.head.rotation.x=-.55*hop}}
  const t=colTop(Math.round(c.a),Math.round(c.b));
  if(t!==null){c.g.position.x=c.a;c.g.position.y=t+1+c.g.position.y;c.g.position.z=c.b}}
 }

// ============================================================
//  VILLAGERS - the same ten people who walk the 2D lanes, but here they are
//  solid little figures with swinging arms, a bob in their step and a hat.
// ============================================================
let VIL=null;
function BLK3(a,b){const F=G('blocked');return !!(F&&F(a,b))}
const VMAT={};
function vm(c){return VMAT[c]||(VMAT[c]=new THREE.MeshLambertMaterial({color:c}))}
let FIGMAT=null;
const L3=hex=>[SRGB(((hex>>16)&255)/255),SRGB(((hex>>8)&255)/255),SRGB((hex&255)/255)];

const rgbH=p=>'#'+[0,1,2].map(i=>('0'+clamp(p[i],0,255).toString(16)).slice(-2)).join('');
function makeVillager(pal,hat,scale){
 if(!FIGMAT)FIGMAT=new THREE.MeshLambertMaterial({vertexColors:true});
 const T=L3(new THREE.Color(rgbH(pal[0])).getHex()),
  TR=L3(new THREE.Color(rgbH(pal[1])).getHex()),
  HA=L3(new THREE.Color(rgbH(pal[2])).getHex()),
  SK=L3(new THREE.Color(rgbH(pal[3]||[226,182,144])).getHex()),
  AC=L3(pal[4]?new THREE.Color(rgbH(pal[4])).getHex():new THREE.Color(rgbH(pal[2])).getHex()),
  EY=L3(0x241c18);
 const P=[];
 P.push({g:new THREE.LatheGeometry([[.02,0],[.34,.05],[.40,.45],[.42,1.05],[.38,1.45],[.26,1.66],[.02,1.70]]
  .map(q=>new THREE.Vector2(q[0],q[1])),9),m:M4P(0,1.02,0),c:T});
 P.push({g:new THREE.CylinderGeometry(.43,.43,.16,9),m:M4P(0,1.16,0),c:AC});
 P.push({g:new THREE.CylinderGeometry(.13,.15,.22,7),m:M4P(0,2.80,0),c:SK});
 P.push({g:gSph(.40,1,7,.10,1.0),m:M4P(0,3.12,0),c:SK});
 P.push({g:gSph(.43,1,11,.12,1.0),m:M4(0,3.26,-.05,0,0,0,1,.82,.98),c:HA});
 for(const ex of[-.15,.15])P.push({g:new THREE.SphereGeometry(.055,5,4),m:M4P(ex,3.14,.36),c:EY});
 if(hat===1){
  P.push({g:new THREE.ConeGeometry(.72,.34,10),m:M4P(0,3.52,0),c:L3(0xd8bc7a)});
  P.push({g:new THREE.CylinderGeometry(.74,.74,.05,10),m:M4P(0,3.36,0),c:L3(0xc8ac6c)})}
 else if(hat===2)P.push({g:gSph(.44,1,13,.08,.7),m:M4P(0,3.30,0),c:AC});
 if(hat===1)P.push({g:new THREE.CylinderGeometry(.30,.24,.36,8),m:M4P(0,1.35,.40),c:L3(0x9c7a42)});
 const g=new THREE.Group();
 g.add(new THREE.Mesh(bake(P),FIGMAT));
 const legG=bake([{g:new THREE.CylinderGeometry(.17*.86,.17,.94,6),m:M4P(0,-.47,0),c:TR},
  {g:new THREE.BoxGeometry(.37,.20,.51),m:M4P(0,-1.00,.06),c:L3(0x33291f)}]);
 const armG=bake([{g:new THREE.CylinderGeometry(.125*.86,.125,.86,6),m:M4P(0,-.43,0),c:T},
  {g:gSph(.15,0,17,.1,1),m:M4P(0,-.90,0),c:SK}]);
 const mk=(geo,x,y)=>{const pv=new THREE.Group();pv.position.set(x,y,0);pv.add(new THREE.Mesh(geo,FIGMAT));g.add(pv);return pv};
 const lL=mk(legG,-.20,1.06),lR=mk(legG,.20,1.06),aL=mk(armG,-.50,2.46),aR=mk(armG,.50,2.46);
 g.scale.setScalar(scale||1.15);
 g.userData={lL,lR,aL,aR,torso:g.children[0],head:g.children[0]};
 return g}

function nudgeWalk(a,b){
 if(walkable3(a,b))return[a,b];
 for(let r=1;r<14;r++)for(let k=0;k<20;k++){
  const an=k/20*6.283,na=a+Math.cos(an)*r*.9,nb=b+Math.sin(an)*r*.9;
  if(walkable3(na,nb))return[na,nb]}
 return null}

function buildVillagers(root){
 const C=G('CAST')||[],CHR=G('CH')||[];
 VIL=[];let n=0;
 for(let i=0;i<C.length;i++){
  const q=C[i];if(!q.route||!q.route.length)continue;
  const g=makeVillager(q.pal,i%3,1.16+(i%4)*.05);
  const s0=q.seg||0;
  const P=nudgeWalk(q.route[s0][0],q.route[s0][1]);
  if(!P){g.traverse(o=>{if(o.isMesh)o.visible=false});continue}
  VIL.push({g,route:q.route,seg:s0,a:P[0],b:P[1],spd:q.spd||1,
   wait:0,mv:1,phase:i*1.7,hx:1,hz:0});
  root.add(g);n++}
 for(let i=0;i<CHR.length;i++){
  const q=CHR[i];if(!q.at)continue;
  const g=makeVillager(q.pal,(i+1)%3,1.12);
  const P=nudgeWalk(q.at[0],q.at[1]);
  if(!P){g.traverse(o=>{if(o.isMesh)o.visible=false});continue}
  VIL.push({g,route:[P,P],seg:0,a:P[0],b:P[1],spd:0,wait:1e9,mv:0,phase:i*2.3,hx:0,hz:1});
  root.add(g);n++}
 return n}

function villagerStep(dt){
 if(!VIL)return;
 for(const v of VIL){
  const r=v.route;
  if(v.spd>0){
   if(v.wait>0){v.wait-=dt;v.mv=Math.max(0,v.mv-dt*4)}
   else{
    const tg=r[(v.seg+1)%r.length],dx=tg[0]-v.a,dz=tg[1]-v.b,d=Math.hypot(dx,dz)||1e-4;
    v.mv=Math.min(1,v.mv+dt*3);
    const st=v.spd*dt*v.mv;
    if(d<=st){v.a=tg[0];v.b=tg[1];v.seg=(v.seg+1)%r.length;if(Math.random()<.22)v.wait=.7+Math.random()*1.7}
    else{v.a+=dx/d*st;v.b+=dz/d*st;v.hx=dx/d;v.hz=dz/d}
    v.phase+=dt*7.2*v.mv}}
  const t=colTop(Math.round(v.a),Math.round(v.b));
  if(t!==null&&!BLK3(v.a,v.b))v.g.position.set(v.a,t+1,v.b);
  if(Math.abs(v.hx)+Math.abs(v.hz)>.01)v.g.rotation.y=Math.atan2(v.hx,v.hz);
  const sw=Math.sin(v.phase)*.62*v.mv,ud=v.g.userData;
  ud.lL.rotation.x=sw;ud.lR.rotation.x=-sw;
  ud.aL.rotation.x=-sw*.8;ud.aR.rotation.x=sw*.8;
  ud.torso.rotation.z=Math.sin(v.phase*2)*.030*v.mv;
  v.g.position.y+=(Math.abs(Math.sin(v.phase))*.055-.03)*v.mv}}



// ============================================================
//  SKY ISLETS - the little floating rocks with a tree on top that drift
//  around the main rocks in the 2D map.
// ============================================================
function isletGeo(rTop,seed){
 const P=[];
 // the rock: a cone pointing down, weathered into facets
 const rock=gCone(rTop*1.02,rTop*2.5,9,0,seed);
 rock.rotateX(Math.PI);rock.translate(0,-rTop*1.25,0);
 paintGrad(rock,[.26,.20,.15],[.50,.40,.30],1.0);
 P.push({g:rock});
 // the crown of soil and grass
 P.push({g:new THREE.CylinderGeometry(rTop*1.06,rTop,.34,9),m:M4P(0,.17,0),c:[.30,.22,.15]});
 P.push({g:new THREE.CylinderGeometry(rTop*1.02,rTop*1.02,.16,9),m:M4P(0,.38,0),c:[.24,.42,.18]});
 return bake(P)}

function skyIslets(root){
 const ZF=G('ZONE');const spots=[];
 for(let a=X0;a<=X1;a+=3)for(let b=Z0;b<=Z1;b+=3){
  if(!LAND(a,b))continue;
  // a rim cell: land here, water a little way out
  let out=null;
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]])if(!LAND(a+dx*5,b+dz*5)){out=[dx,dz];break}
  if(!out)continue;
  if(h2(a*13+7,b*17+3)>.28)continue;
  spots.push([a,b,out])}
 let sd=24680;const rnd=()=>{sd=(sd*1103515245+12345)&0x7fffffff;return sd/0x7fffffff};
 for(let i=spots.length-1;i>0;i--){const j=(rnd()*(i+1))|0;const t=spots[i];spots[i]=spots[j];spots[j]=t}
 let n=0;
 for(const[a,b,o]of spots){
  if(n>=11)break;
  const dist=16+rnd()*26,lat=(rnd()-.5)*24;
  const x=a+.5+o[0]*dist+o[1]*lat, z=b+.5+o[1]*dist+o[0]*lat;
  const y=-10+rnd()*26, r=2.0+rnd()*2.1;
  const g=new THREE.Group();
  g.add(new THREE.Mesh(isletGeo(r,(n*7+3)|0),FIGMAT));
  // a little tree or a torii and a lamp on top
  const v=n%4;
  if(v===0||v===1){
   const tr=new THREE.Mesh(TGEO.oak0||oakGeo(0),FIGMAT);
   const sc=.42+rnd()*.18;tr.scale.setScalar(sc);tr.position.y=.34;g.add(tr)}
  else if(v===2){
   const s2=.5+rnd()*.2;
   for(const xx of[-.55,.55]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.07,.08,1.5,6),vm(0xb43a2c));
    post.position.set(xx*s2,.9*s2,0);g.add(post)}
   const beam=new THREE.Mesh(new THREE.BoxGeometry(1.6*s2,.18*s2,.22),vm(0xb43a2c));
   beam.position.y=1.7*s2;g.add(beam)}
  else{
   const sph=gSph(r*.7,1,3+n,.28,.5);
   g.add(new THREE.Mesh(bake([{g:sph,m:M4P(0,.34,0),c:L3(0x4a7a3a)}]),FIGMAT))}
  g.position.set(x,y,z);
  g.rotation.y=rnd()*6.283;
  g.userData.bob=rnd()*6.283;
  ISLETS.push(g);root.add(g);n++}
 return n}
const ISLETS=[];
function isletStep(dt){
 for(const g of ISLETS){
  g.userData.bob+=dt*.35;
  g.position.y+=Math.sin(g.userData.bob)*.0025;
  g.rotation.y+=dt*.012}}

// ---------- the player: an articulated voxel avatar that walks the same world ----------
let AV=null,PLAYMODE=false,AVKEYS={},AVSHIP=[],WROOT=null;
function mat(c){return new THREE.MeshLambertMaterial({color:c})}
function buildAvatar(){
 const g=new THREE.Group();
 const skin=mat(0xe0ad86),hair=mat(0x4a2f22),shirt=mat(0x2c7f8c),trim=mat(0x1d5a68),
  pants=mat(0x4a4038),boot=mat(0x2b211a),scarf=mat(0xc0432f),steel=mat(0xc4ccd4),gold=mat(0xe4b44c),eye=mat(0x201a18);
 const B=(w,h,d,m,x,y,z)=>{const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);q.position.set(x,y,z);q.castShadow=true;g.add(q);return q};
 // boots, legs, belt and tunic
 B(.56,.42,.78,boot,-.38,.22,.14);B(.56,.42,.78,boot,.38,.22,.14);
 const lL=B(.52,1.3,.6,pants,-.38,1.05,0),lR=B(.52,1.3,.6,pants,.38,1.05,0);
 B(1.5,.26,1.02,trim,0,1.88,0);B(.34,.34,.16,gold,0,1.88,.54);
 B(1.46,1.5,1.0,shirt,0,2.75,0);B(1.5,.18,1.04,trim,0,2.17,0);
 B(.56,.62,.16,gold,0,2.85,.54);B(.14,.3,.17,gold,0,2.9,.63);
 // arms, hands, a sword at the hip
 const aL=B(.42,1.35,.5,shirt,-.95,2.85,0),aR=B(.42,1.35,.5,shirt,.95,2.85,0);
 B(.4,.36,.48,skin,-.95,2.02,0);B(.4,.36,.48,skin,.95,2.02,0);
 B(.16,1.65,.12,steel,1.18,2.05,.28);B(.42,.14,.18,gold,1.18,1.25,.28);B(.16,.4,.16,boot,1.18,1.02,.28);
 // head, hair, eyes and a red scarf with a cape
 const head=B(1.28,1.28,1.22,skin,0,4.12,0);
 B(1.36,.34,1.3,hair,0,4.82,-.03);B(.22,.34,1.3,hair,-.6,4.45,0);B(.22,.34,1.3,hair,.6,4.45,0);
 B(.18,.18,.12,eye,-.3,4.16,.63);B(.18,.18,.12,eye,.3,4.16,.63);
 B(1.6,.4,1.12,scarf,0,3.38,0);
 const cape=B(1.5,1.55,.18,scarf,0,2.6,-.62);cape.rotation.x=-.09;
 g.userData={aL,aR,lL,lR,head,cape};g.visible=false;scene.add(g);return g}// the surface the character stands on: solid ground, or a bridge plank
function surfaceY(x,z){
 const t=colTop(x,z);if(t!==null)return[t,false];
 for(let k=-10;k<=8;k++)if(VOX[VI(x,k,z)]===BL.PLANK)return[k,true];
 return[null,false]}
function walkable3(a,b){
 const x=Math.round(a),z=Math.round(b);if(!inb(x,z))return false;
 const S=surfaceY(x,z),t=S[0],bridge=S[1];if(t===null)return false;
 // a step up is one block; a drop of more than two is a cliff, not a step
 const U=AV&&AV.user;
 if(U){const h=surfaceY(Math.round(U.a),Math.round(U.b))[0];
  if(h!==null&&!bridge&&(t-h>1||h-t>2))return false}
 // nothing solid where the character's body would be (props are not voxels)
 for(let y=t+1;y<=t+3;y++){const id=VOX[VI(x,y,z)];
  if(id&&id!==BL.FIRE&&id!==BL.WATER&&id!==BL.PLANK)return false}
 const WDf=G('WD');if(!bridge&&WDf&&WDf(a,b)>.3)return false;
 // 2D sprite solids are decorative here: pebbles, flowers and stumps never block walking
 return true}
function avatarSpawn(){
 const P=G('PL')&&G('PL').P;let a=P?P.a:31.5,b=P?P.b:31.5;
 if(!walkable3(a,b)){outer:for(let r=1;r<45;r++)for(let k=0;k<24;k++){
   const an=k/24*6.283,na=a+Math.cos(an)*r*.8,nb=b+Math.sin(an)*r*.8;
   if(walkable3(na,nb)){a=na;b=nb;break outer}}}
 if(!walkable3(a,b)){a=26.5;b=13.4}
 return{a,b,goal:null,walk:0,dir:0,g:AV,gx:a,gz:b}}
function enterPlay(){
 if(!AV)AV=buildAvatar();
 const PP=G('PL')&&G('PL').P;
 if(!AV.user||G('MODE')==='start'||(PP&&Math.hypot(PP.a-AV.user.a,PP.b-AV.user.b)>3))AV.user=avatarSpawn();
 if(AV.user){AV.a=AV.user.a;AV.b=AV.user.b;AV.goal=null}
 AV.visible=true;PLAYMODE=true;lastInput=performance.now();
 tRad=21;tEl=.24;tcx=AV.a;tcz=AV.b;AV.scale.setScalar(.78);
 AV.user.dir=-az-Math.PI/2;AV.rotation.y=AV.user.dir;
 try{(0,eval)('GOAL=null;SPECTATE=0;if(typeof KEYS!=="undefined")for(const k in KEYS)KEYS[k]=0')}catch(e){}}
function avatarStep(dt){
 if(!AV||!PLAYMODE)return;
 const U=AV.user,f=(AVKEYS.w?1:0)-(AVKEYS.s?1:0),r=(AVKEYS.d?1:0)-(AVKEYS.a?1:0);
 let dx=0,dz=0;
 if(f||r){U.goal=null;const fw=[-Math.cos(az),-Math.sin(az)],rt=[-fw[1],fw[0]];
  dx=fw[0]*f+rt[0]*r;dz=fw[1]*f+rt[1]*r}
 else if(U.goal){dx=U.goal[0]-U.a;dz=U.goal[1]-U.b;
  if(Math.hypot(dx,dz)<.35)U.goal=null}
 const L=Math.hypot(dx,dz);
 if(L>.001){dx/=L;dz/=L;const spd=4.6*dt,nx=U.a+dx*spd,nz=U.b+dz*spd;
  if(walkable3(nx,U.b))U.a=nx;if(walkable3(U.a,nz))U.b=nz;
  U.walk+=dt*10;U.dir=Math.atan2(dx,dz)}
 const S=surfaceY(Math.round(U.a),Math.round(U.b));
 const target=(S[0]===null?-1:S[0])+.12;
 if(U.gy===undefined){U.gy=target;U.lastY=target;U.stepT=1;U.stepImp=0}
 const rise=target-U.lastY;
 if(Math.abs(rise)>.3){U.stepT=0;U.stepImp=rise>0?.42:-.22}
 U.lastY=target;
 U.gy+=(target-U.gy)*Math.min(1,dt*11);
 if(U.stepT<1){U.stepT=Math.min(1,U.stepT+dt*4.4);U.stepImp*=Math.exp(-dt*6)}
 let hop=0;
 if(U.stepT<1)hop=Math.sin(U.stepT*Math.PI)*U.stepImp;
 // a small jump, with gravity and a landing squash
 if(AVKEYS[' ']&&!U.jump&&L<=.001){U.jump=1;U.jt=0}
 if(U.jump){U.jt+=dt;const p=U.jt/.52;
  if(p>=1){U.jump=0;U.jt=0}else hop+=Math.sin(p*Math.PI)*1.7}
 AV.position.set(U.a,U.gy+hop,U.b);
 AV.rotation.x=hop*.045;
 AV.rotation.y+=Math.atan2(Math.sin(U.dir-AV.rotation.y),Math.cos(U.dir-AV.rotation.y))*Math.min(1,dt*10);
 const sw=L>.001?Math.sin(U.walk)*.62:0;
 AV.userData.lL.rotation.x=sw;AV.userData.lR.rotation.x=-sw;
 AV.userData.aL.rotation.x=-sw*.75;AV.userData.aR.rotation.x=sw*.75;
 AV.userData.head.position.y=4.12+(L>.001?Math.abs(Math.sin(U.walk))*.07:Math.sin(T*1.7)*.03);
 AV.userData.cape.rotation.x=-.09+(L>.001?Math.sin(U.walk*.5)*.16:Math.sin(T*1.5)*.05);
 tcx=U.a;tcz=U.b;
 if((U.goal||f||r)&&L>.001&&performance.now()-lastInput>1200){
  const want=-U.dir-Math.PI/2;
  tAz+=Math.atan2(Math.sin(want-tAz),Math.cos(want-tAz))*Math.min(1,dt*1.4)}
 try{const P=G('PL')&&G('PL').P;if(P){P.a=U.a;P.b=U.b;P.hid=0;P.mvg=L>.001?1:0;
   const CF=G('CF');if(CF&&CF.length===2){CF[0]=U.a;CF[1]=U.b}}}catch(e){}}
function airships(){
 const build=(x,y,z,c1,c2)=>{
  const cells=[],putCell=(a,b,c,col)=>cells.push([a,b,c,col]);
  const A=new THREE.Color(c1),B=new THREE.Color(c2);
  for(let dx=-6;dx<=6;dx++)for(let dy=-2;dy<=2;dy++)for(let dz=-2;dz<=2;dz++){
   if((dx*dx)/42+(dy*dy)/7+(dz*dz)/6<=1)putCell(dx,dy,dz,((dx+dy*2)%7===0)?B:A)}
  for(let dx=-2;dx<=2;dx++){putCell(dx,-4,0,new THREE.Color(0x6b4a30));putCell(dx,-5,0,new THREE.Color(0x4a3222))}
  putCell(-2,-3,0,new THREE.Color(0x2b241d));putCell(2,-3,0,new THREE.Color(0x2b241d));
  const inst=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial(),cells.length);
  const d=new THREE.Object3D();
  cells.forEach((q,i)=>{d.position.set(q[0],q[1],q[2]);d.updateMatrix();inst.setMatrixAt(i,d.matrix);inst.setColorAt(i,q[3])});
  inst.castShadow=true;inst.instanceMatrix.needsUpdate=true;
  const g=new THREE.Group();g.add(inst);g.position.set(x,y,z);scene.add(g);return g};
 AVSHIP=[build(103.6,32,87.4,0xd8a94c,0xb08038),build(102.4,38,98.2,0xb4664e,0x8b4a38)]}
function airshipStep(dt){
 for(let i=0;i<AVSHIP.length;i++){const g=AVSHIP[i];g.position.y=(i?38:32)+Math.sin(T*.45+i*2)*1.3;g.rotation.y=Math.sin(T*.16+i)*.14}}
// ---------- camera: orbit, pan, pinch, damping, idle drift ----------
function camUpdate(dt){const k=dt?1-Math.exp(-dt*9):1;az+=(tAz-az)*k;el+=(tEl-el)*k;rad+=(tRad-rad)*k;cx+=(tcx-cx)*k;cz+=(tcz-cz)*k;
 const hy=PLAYMODE?3.5:0,ce=Math.cos(el);
 camera.position.set(cx+rad*ce*Math.cos(az),hy+rad*Math.sin(el),cz+rad*ce*Math.sin(az));camera.lookAt(cx,hy,cz)}
function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
let last=0,ema=.016,frames=0,pr=1;
function update(dt){T+=dt;U.uTime.value=T;
 if(!PLAYMODE&&performance.now()-lastInput>6000)tAz+=dt*.012;
 camUpdate(dt);stepTime(dt);koiStep(dt);birdStep();boatStep();spritesStep(dt);avatarStep(dt);villagerStep(dt);critterStep(dt);isletStep(dt);airshipStep(dt);
 for(const g of MILLS)g.rotation.z+=dt*.7;
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
 cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ps.set(e.pointerId,{x:e.clientX,y:e.clientY});lastInput=performance.now();if(ps.size===2)pinch=pd();
  if(PLAYMODE&&ps.size===1&&AV&&WROOT){const rc=new THREE.Raycaster();rc.setFromCamera({x:(e.clientX/innerWidth)*2-1,y:-(e.clientY/innerHeight)*2+1},camera);
   const hits=rc.intersectObjects(WROOT.children,true);
   const hit=hits.find(h=>!/^(prop_|tree_)/.test(h.object.name))||hits[0];
  if(hit&&walkable3(hit.point.x,hit.point.z))AV.user.goal=[hit.point.x,hit.point.z]}});
 cv.addEventListener('pointermove',e=>{const p=ps.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;lastInput=performance.now();
  if(ps.size===2){const d=pd();if(pinch>0)tRad=clamp(tRad*pinch/d,PLAYMODE?10:30,PLAYMODE?80:260);pinch=d;return}
  if((e.buttons&6)||e.shiftKey){const s=rad*.0017;tcx=clamp(tcx-Math.sin(tAz)*dx*s-Math.cos(tAz)*dy*s,-10,190);tcz=clamp(tcz+Math.cos(tAz)*dx*s-Math.sin(tAz)*dy*s,-14,120)}
  else{tAz-=dx*.008;tEl=clamp(tEl+dy*.006,.12,1.3)}});
 const up=e=>{ps.delete(e.pointerId);pinch=0};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',e=>{e.preventDefault();lastInput=performance.now();tRad=clamp(tRad*Math.exp(e.deltaY*.0011),PLAYMODE?10:30,PLAYMODE?80:260)},{passive:false});
 cv.addEventListener('dblclick',()=>{tAz=az+Math.atan2(Math.sin(Math.PI/4-az),Math.cos(Math.PI/4-az));tEl=.55;tRad=200;tcx=104;tcz=56;lastInput=performance.now()})}

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
   if(G('MODE')==='explore')enterPlay();else PLAYMODE=false;
   lblTxt.innerHTML='VOXEL WORLD · drag orbit · right-drag pan · wheel zoom · <b>N</b> time of day · <b>V</b> returns';
   todBtn=document.createElement('button');todBtn.style.cssText='pointer-events:auto;cursor:pointer;background:rgba(244,236,216,.14);color:#f4ecd8;border:1px solid rgba(244,236,216,.4);border-radius:4px;font:12px Georgia,serif;padding:2px 9px';
   todBtn.textContent=PRESETS[PHASE].n+' \u25B8';todBtn.addEventListener('click',()=>setPhase(PHASE+1));b.appendChild(todBtn);
   window.addEventListener('resize',resize);last=0;tick();
  }catch(err){fail(err)}};
 if(window.THREE){start();return}
 const sc=document.createElement('script');sc.src='js/three.min.js';sc.onload=start;
 sc.onerror=()=>{lblTxt.textContent='could not load js/three.min.js';loading=false;if(overlay)overlay.remove();if(vig)vig.remove();if(lbl)lbl.remove();overlay=null;lbl=null;vig=null};
 document.body.appendChild(sc)}
function hide(){cancelAnimationFrame(raf);raf=0;PLAYMODE=false;AVKEYS={};if(AV)AV.visible=false;if(overlay)overlay.style.display='none';if(vig)vig.style.display='none';if(lbl)lbl.style.display='none'}
window.__voxAvatar=function(){return AV&&AV.user?{a:+AV.user.a.toFixed(2),b:+AV.user.b.toFixed(2),visible:AV.visible,playing:PLAYMODE,goal:AV.user.goal}:null};
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
if(sgo)sgo.addEventListener('click',()=>setTimeout(()=>{setChoice(viewChoice,viewChoice==='2d');if(viewChoice==='3d'&&built)enterPlay()},0));
// movement keys: captured before the 2D game sees them while the 3D view is active
addEventListener('keydown',e=>{
 if(!PLAYMODE||!(overlay&&overlay.style.display!=='none'))return;
 if(e.target&&e.target.closest&&e.target.closest('input,textarea,select'))return;
 const k=e.key.toLowerCase();
 if(k==='escape'&&overlay&&overlay.style.display!=='none'){e.preventDefault();e.stopImmediatePropagation();window.__voxel();return}
 if(k.length===1&&'wasd'.indexOf(k)>=0||k===' '||k.indexOf('arrow')===0){AVKEYS[k]=1;e.preventDefault();e.stopImmediatePropagation()}
},true);
addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(AVKEYS[k]!==undefined)AVKEYS[k]=0},true);
window.__voxel=function(){
 const on=!!(overlay&&overlay.style.display!=='none');
 try{(0,eval)('SPECTATE=0')}catch(e){}
 viewChoice=on?'2d':'3d';
 try{localStorage.setItem('koi.view',viewChoice)}catch(e){}
 if(on)hide();else{show();if(built&&G('MODE')==='explore')enterPlay()}syncChoice()};
window.addEventListener('keydown',e=>{
 const t=e.target;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;
 const on=overlay&&overlay.style.display!=='none';
 if(e.code==='KeyV'&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();window.__voxel()}
 else if(e.code==='Escape'&&on)hide();
 else if(e.code==='KeyN'&&on&&built&&!e.ctrlKey&&!e.altKey&&!e.metaKey)setPhase(PHASE+1)});
})();
