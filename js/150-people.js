/* ================= SCENE: the people ================= */
const PEOPLE=[];
const CAST=[
 {pal:[[196,72,58],[58,62,92],[92,54,32],[228,182,144],null],spd:.95,seg:0,
  route:[[21.55,19.55],[26.5,17.5],[31.45,19.55],[33.5,22.5],[33.5,26.5],[31.45,29.45],[26.5,31.5],[21.55,29.45],[19.5,24.5],[21.55,19.55]]},
 {pal:[[78,118,148],[62,58,66],[214,206,186],[222,178,140],[176,128,74]],spd:1.05,seg:3,
  route:[[3.5,9.2],[8.2,11.4],[13.0,12.9],[17.2,14.0],[19.2,15.4],[20.6,17.2],[21.55,19.55],[19.2,19.8],[17.0,19.6],[15.4,18.4],[14.9,16.6],[15.1,15.0],[15.2,13.4],[13.0,12.9],[10.8,12.2],[5.6,10.2],[3.5,9.2]]},
 {pal:[[222,196,84],[92,86,70],[142,84,40],[236,196,152],[124,88,52]],spd:1.4,seg:0,
  route:[[15.2,13.4],[15.1,15.0],[14.9,16.6],[15.4,18.4],[17.0,19.6],[19.2,19.8],[21.55,19.55],[21.55,17.5],[26.5,17.5],[31.45,19.55],[33.5,22.5],[33.5,26.5],[31.45,29.45],[26.5,31.5],[21.55,29.45],[19.5,24.5],[21.55,19.55]]},
 {pal:[[120,104,84],[70,74,88],[238,232,220],[214,166,126],[178,152,112]],spd:.8,seg:0,
  route:[[26.5,31.5],[27.8,33.4],[29.6,35.0],[31.8,36.4],[34.0,37.6],[35.6,39.6],[34.0,37.6],[31.8,36.4],[29.6,35.0],[27.8,33.4],[26.5,31.5]]},
 {pal:[[142,158,120],[64,66,60],[198,186,150],[220,172,132],null],spd:.9,seg:0,
  route:[[17.4,9.4],[19.2,8.6],[21.2,7.6],[23.6,6.8],[26.2,6.4],[28.8,6.8],[31.0,7.8],[32.6,9.2],[31.0,7.8],[28.8,6.8],[26.2,6.4],[23.6,6.8],[21.2,7.6],[19.2,8.6],[17.4,9.4]]},
 {pal:[[206,96,72],[74,62,56],[60,48,40],[224,184,148],[92,64,44]],spd:1.15,seg:0,
  route:[[3.5,9.2],[6.0,10.4],[8.6,11.6],[11.0,12.4],[13.0,12.9],[11.0,12.4],[8.6,11.6],[6.0,10.4],[3.5,9.2]]},
 {pal:[[176,132,88],[62,66,72],[122,88,52],[214,168,132],[120,88,52]],spd:.9,seg:0,
  route:[[33.5,26.5],[33.5,22.5],[36.8,22.3],[39.8,22.5],[42.8,22.8],[45.8,23.1],[48.8,23.4],[50.8,23.7],[48.8,23.4],[45.8,23.1],[42.8,22.8],[39.8,22.5],[36.8,22.3],[34.4,22.6],[33.5,24.5],[33.5,26.5]]}
];
function initPeople(){
  for(const q of CAST){const s=q.seg||0,P={pal:q.pal,route:q.route,spd:q.spd,seg:s,a:q.route[s][0],b:q.route[s][1],anim:0,vx:1,vy:0,wait:0,cd:0,mv:1,talk:0};
    P.spr={front:[villager(q.pal,0,'front'),villager(q.pal,1,'front')],back:[villager(q.pal,0,'back'),villager(q.pal,1,'back')],side:[villager(q.pal,0,'side'),villager(q.pal,1,'side')]};
    PEOPLE.push({d:P.a+P.b,P})}
  for(const ch of CH){const P={pal:ch.pal,route:[ch.at,ch.at],spd:0,seg:0,a:ch.at[0],b:ch.at[1],anim:0,vx:.7,vy:.7,wait:1e9,cd:1e9,mv:0,talk:0};
    P.spr={front:[villager(ch.pal,0,'front'),villager(ch.pal,1,'front')],back:[villager(ch.pal,0,'back'),villager(ch.pal,1,'back')],side:[villager(ch.pal,0,'side'),villager(ch.pal,1,'side')]};
    PEOPLE.push({d:P.a+P.b,P})}
}
function stepPeople(dt){
  for(const it of PEOPLE){const P=it.P,r=P.route;P.cd=Math.max(0,(P.cd||0)-dt);
    if(P.spd>0){if(ACT==='sleep'){if(P.seg===0&&Math.hypot(P.a-r[0][0],P.b-r[0][1])<.3){P.hid=1;P.wait=1;P.mv=0;it.d=P.a+P.b;continue}}else if(P.hid){P.hid=0;P.wait=0}}
    if(P.wait>0){P.wait-=dt;P.talk=Math.max(0,(P.talk||0)-dt);P.mv=Math.max(0,(P.mv||0)-dt*6)}
    else{const tg=r[(P.seg+1)%r.length],dx=tg[0]-P.a,dy=tg[1]-P.b,d=Math.hypot(dx,dy);P.mv=Math.min(1,(P.mv||0)+dt*3);
      const st=P.spd*SPDM*dt*P.mv*(bridgeLift(P.a,P.b)>0?.85:1);
      if(d<=st){P.a=tg[0];P.b=tg[1];P.seg=(P.seg+1)%r.length;{const so=ACT==='lunch'||ACT==='evening';if(Math.random()<(so?.65:.2)){P.wait=(so?3:1)+Math.random()*2.5;P.mv=0}}}
      else{P.a+=dx/d*st;P.b+=dy/d*st;const k=Math.min(1,dt*8);P.vx+=(dx/d-P.vx)*k;P.vy+=(dy/d-P.vy)*k;const l=Math.hypot(P.vx,P.vy)||1;P.vx/=l;P.vy/=l}
      P.anim+=dt*P.spd*3.6*Math.max(.3,P.mv)}
    it.d=P.a+P.b}
  for(let i=0;i<PEOPLE.length;i++)for(let j=i+1;j<PEOPLE.length;j++){const A=PEOPLE[i].P,B=PEOPLE[j].P;if(A.wait>0||B.wait>0||A.cd>0||B.cd>0||A.hid||B.hid)continue;
    const dx=B.a-A.a,dy=B.b-A.b,d=Math.hypot(dx,dy);if(d<1.1){A.wait=B.wait=A.talk=B.talk=2+Math.random()*1.5;A.cd=B.cd=14;A.mv=B.mv=0;A.vx=dx/(d||1);A.vy=dy/(d||1);B.vx=-A.vx;B.vy=-A.vy}}
  PEOPLE.sort((x,y)=>x.d-y.d)}
function drawPerson(ctx,P){if(P.hid)return;
  const[X,Y0]=PF(P.a,P.b),Y=Y0-bridgeLift(P.a,P.b),sx=P.vx-P.vy,sy=P.vx+P.vy,idle=P.wait>0;
  let pose=Math.abs(sy)>Math.abs(sx)*1.1?(sy>0?'front':'back'):'side';
  const sp=P.spr[pose][idle?0:(P.anim|0)%2],flip=pose==='side'&&sx<0,
    bob=idle?(Math.sin(T*1.7+P.anim)>.93?-1:0):-(Math.abs(Math.sin(P.anim*Math.PI))>.7?1:0);
  const px_=Math.round(X)-sp.ox,py=Math.round(Y)-sp.oy;
  ctx.fillStyle='rgba(12,28,20,.28)';
  ctx.beginPath();ctx.ellipse(px_+sp.ox,py+sp.oy-1,4.5,1.8,0,0,6.283);ctx.fill();
  if(flip){ctx.save();ctx.translate(px_+sp.ox*2,0);ctx.scale(-1,1);ctx.drawImage(sp.c,-sp.ox,py+bob);ctx.restore()}
  else ctx.drawImage(sp.c,px_,py+bob);
  if(P.talk>0){const bx=Math.round(X)-4,by=py-5,n=(T*2.5|0)%4;ctx.fillStyle='rgba(255,252,240,.92)';ctx.fillRect(bx,by,9,5);ctx.fillRect(bx+3,by+5,2,1);ctx.fillStyle='#2a2018';for(let k=0;k<Math.min(3,n);k++)ctx.fillRect(bx+2+k*3,by+2,1,1)}}
