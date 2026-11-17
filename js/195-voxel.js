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
let az=Math.PI/4, el=.52, rad=132;
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
 TEX.mossSide=blockTex(g=>{g.fillStyle='#5d7260';g.fillRect(0,0,16,3);g.fillStyle='#4a5c52';g.fillRect(0,3,16,2);g.fillStyle='#5f615a';g.fillRect(0,5,16,11);speck(g,29)})}
function buildMaterials(){
 const M=(t,n)=>{const m=new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide});m.name=n;return m};
 return {grassTop:M(TEX.grassTop,'grassTop'),mossTop:M(TEX.mossTop,'mossTop'),gravel:M(TEX.gravel,'gravel'),dirtTop:M(TEX.dirt,'dirtTop'),
  sideDirt:M(TEX.grassSide,'sideDirt'),mossSide:M(TEX.mossSide,'mossSide'),stoneA:M(TEX.stoneA,'stoneA'),stoneB:M(TEX.stoneB,'stoneB'),
  water:(()=>{const m=new THREE.MeshLambertMaterial({color:0x2b7a8c,transparent:true,opacity:.84,side:THREE.DoubleSide});m.name='water';return m})()}}

// ---------- the voxel volume ----------
const X0=-8,Z0=-10,X1=184,Z1=116,Y0=-46,Y1=4;
const SX=X1-X0+1,SY=Y1-Y0+1,SZ=Z1-Z0+1;
const VOX=new Int8Array(SX*SY*SZ);
const VI=(x,y,z)=>(y-Y0)*SX*SZ+(z-Z0)*SX+(x-X0);
const TOP_GRASS=1,TOP_MOSS=2,TOP_GRAVEL=3,TOP_DIRT=4,SIDE_DIRT=5,SIDE_STONEA=6,SIDE_STONEB=7,SIDE_MOSS=8,TOP_WATER=9;
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
// ---------- greedy meshing ----------
function faceId(id,axis,up){return id*10+(axis===1?(up?1:6):(axis===0?2:3))}
function faceMatKey(f){const id=(f/10)|0,o=f%10;
 if(id===TOP_WATER)return 'water';
 if(o===1){if(id===TOP_GRASS||id===TOP_DIRT)return 'grassTop';if(id===TOP_MOSS)return 'mossTop';return 'gravel'}
 if(o===6)return 'stoneB';
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
   const mask=new Int8Array(R*C);
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
 TGT=new THREE.Vector3(86,0,46);
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
 for(const{geo,mat}of greedyMesh()){
  const mesh=new THREE.Mesh(geo,MATS[mat]);mesh.receiveShadow=true;scene.add(mesh);if(mat==='water')waterMat=mesh.material}
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
