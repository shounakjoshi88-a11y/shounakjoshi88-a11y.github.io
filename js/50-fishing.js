// ---- fishing at the pond ----
const KOI=[
 ['A koi the colour of a spent test','Flux cost nothing and took fifty four days. It still passes. So does this fish.'],
 ['A koi with a scholar marking','Fifty four attempts at P versus NP. Most of them ended in no. He starts the next one anyway.'],
 ['A koi that will not be caught','Stellar Forge sells the last seat to exactly one person. The counter never lies. Neither does this fish.'],
 ['A koi the colour of a nebula','He once wrote a purple nebula shader pack, so that planets would show even in daylight. It is still in the notebook.'],
 ['A koi wearing a red bib','Payflow is a Java payment gateway. It moves money and it does not lose it.'],
 ['A koi with old scars','Raksha and NeRoute came out of hackathons: crowd safety, and logistics for the North East. It was his first real thing.']];
let FISH=null;
function fishStart(cx,cy){
 if(FISH)return;
  const f={pos:.12,dir:1,zone:.18+Math.random()*.5,zw:.18+Math.random()*.12,tries:0};
 FISH=f;
 const box=$('fish').firstElementChild;if(!box)return;
 $('fish').hidden=false;
 box.style.left=Math.max(10,Math.min(innerWidth-box.offsetWidth-10,cx-box.offsetWidth/2))+'px';
 box.style.top=Math.max(84,Math.min(innerHeight-box.offsetHeight-12,cy-box.offsetHeight-20))+'px';
 $('fzone').style.left=(f.zone*100)+'%';$('fzone').style.width=(f.zw*100)+'%';
 $('ffish').style.left=(f.pos*100)+'%';
 $('fmsg').textContent='Wait for the koi to cross the pale band, then reel.';
 requestAnimationFrame(fishTick);
}
function fishTick(){
 const f=FISH;if(!f)return;
   f.pos+=f.dir*(.011+f.tries*.0035);
 if(f.pos>1){f.pos=1;f.dir=-1}
 if(f.pos<0){f.pos=0;f.dir=1}
  const el=$('ffish');if(el)el.style.left=(f.pos*100)+'%';
 const z=$('fzone');
 if(z)z.classList.toggle('bite',f.pos>=f.zone-.035&&f.pos<=f.zone+f.zw+.035);
 requestAnimationFrame(fishTick);
}
function fishMoveZone(f){
 f.zone=.06+Math.random()*.62;f.zw=.18+Math.random()*.12;
 const z=$('fzone');if(z){z.style.left=(f.zone*100)+'%';z.style.width=(f.zw*100)+'%'}
}
function fishReel(){
 const f=FISH;if(!f)return;
 if(f.lock&&performance.now()<f.lock){const m=$('fmsg');if(m)m.textContent='Too quick. Let it settle.';return}
 if(f.pos>=f.zone-.035&&f.pos<=f.zone+f.zw+.035){
  fishCaught(rollFish());
  f.tries++;fishMoveZone(f);
  }else{
  f.tries++;f.lock=performance.now()+650;
  const m=$('fmsg');if(m)m.textContent='It slips the hook. The pond is not in a hurry.';
  fishMoveZone(f);
 }
}
function closeFish(){FISH=null;const f=$('fish');if(f)f.hidden=true}
