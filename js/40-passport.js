// ---- the stamps in the passport ----
const STAMPC=[[122,60,40],[60,92,110],[92,118,58],[130,96,44],[72,72,104],[140,60,80],[60,120,96],[140,120,60],[92,80,120]];
function stampArt(i){
 const c=mk(22,22),x=c.getContext('2d'),pal=STAMPC[i%STAMPC.length];
 x.fillStyle=rgb(pal);x.fillRect(0,0,22,22);
 x.fillStyle=rgb(pal.map(v=>v*.55));
 for(let k=0;k<5;k++){x.fillRect(k*5,0,2,2);x.fillRect(k*5,20,2,2);x.fillRect(0,k*5,2,2);x.fillRect(20,k*5,2,2)}
 x.fillStyle=rgb(pal.map(v=>Math.min(255,v*1.55)));
 const m=i%4;
 for(let k=0;k<8;k++){const a=k/8*6.283+m*.4;x.fillRect(Math.round(11+Math.cos(a)*6),Math.round(11+Math.sin(a)*6),2,2)}
 x.fillStyle='rgba(255,248,220,.35)';x.fillRect(4,4,14,1);x.fillRect(4,4,1,14);
 x.fillStyle=rgb(pal.map(v=>v*.35));x.fillRect(9,9,4,4);
 return c}
function buildPass(){
 const g=$('pgrid');if(!g)return;g.innerHTML='';
 SEC.forEach((s,i)=>{
  const b=document.createElement('button');b.className='pst'+(s.f?' got':'');b.type='button';b.title=s.t;
  b.appendChild(stampArt(i));
  const lab=document.createElement('i');lab.textContent=s.f?s.t:'?';b.appendChild(lab);
  b.onclick=()=>{if(s.f)note(s.t,Array.isArray(s.x)?s.x[0]:s.x,8000);
   else note('Not found yet','A faint glint is hiding near one of the places on this island.',4200)};
  g.appendChild(b)});
 const g2=$('pgrid2');if(g2){g2.innerHTML='';
  CH.forEach((c,i)=>{const got=PASS.chapters.includes(c.name);
   const b=document.createElement('button');b.className='pst'+(got?' got':'');b.type='button';b.title=c.name+' '+c.role;
   b.appendChild(stampArt(i+3));
   const lab=document.createElement('i');lab.textContent=got?c.name.split('')[0]:'?';b.appendChild(lab);
   b.onclick=()=>note(c.name+' · '+c.role,got?c.pages[c.pages.length-1]:'You have not finished this conversation yet.',6000);
   g2.appendChild(b)})}
 const q=$('pquest');if(q){q.innerHTML='';
  for(const qq of QUESTS){const li=document.createElement('li');
   if(questDone(qq))li.className='done';
   li.innerHTML='<b>'+qq.t+'</b><span>'+(questDone(qq)?'Done. '+qq.from+' has something to say.':qq.from+' asked for it. '+questProg(qq)+' so far.')+'</span>';
   q.appendChild(li)}}
 const pn=$('pnote');if(pn)pn.textContent=(PASS.journal?'The journal is open. It was the last thing the pond had for you.'
  :nf()+' of '+SEC.length+' glints found. Find them all and the pond opens its journal.')
  +(PASS.caught.length?' You have caught '+PASS.caught.length+' koi.':'');
}
