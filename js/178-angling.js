/* ================= ANGLING =================
   The pier at the village pond - shore, steps, or out on the deck over the water - and the rim of the sakura pond where the lotus
   stand. Stand near the water and you can put a line in. Most of what comes up
   is ordinary. Once in a while it is not.
   ------------------------------------------------------------------ */
const PIER=[26.2,17.7];
const PONDA=[26.5,24.5],PRA=5.9,POND2L=[104,31.5];
let ANG_LOC='village';
const FISHES=[
 {n:'A koi the colour of a spent test',w:1,x:'Flux cost nothing and took fifty four days. It still passes. So does this fish.'},
 {n:'A koi with a scholar marking',w:1,x:'Fifty four attempts at P versus NP. Most of them ended in no. He starts the next one anyway.'},
 {n:'A koi that will not be caught',w:1,x:'Stellar Forge sells the last seat to exactly one person. The counter never lies. Neither does this fish.'},
 {n:'A koi wearing a red bib',w:1,x:'Payflow is a Java payment gateway. It moves money and it does not lose it.'},
 {n:'A koi with old scars',w:1,x:'Raksha and NeRoute came out of hackathons: crowd safety, and logistics for the North East. It was his first real thing.'},
 {n:'A silver dace, quick as a failed build',w:1,x:'Some things only run once. This one got away twice and came back to be caught.'},
 {n:'A carp with a plan in its mouth',w:.22,x:'The plan is not finished. That is why the pond lets it go again every single time.'},
 {n:'A koi the colour of a nebula',w:.2,x:'He once wrote a purple nebula shader pack, so that planets would show even in daylight. It is still in the notebook.'},
 {n:'A koi with a golden fleck in its eye',w:.14,x:'Not the golden one. But it knows somebody who is.'},
 {n:'A koi in a milkmaid’s cap',w:.26,loc:'village',x:'Village fish, village cap. Sen has watched this pond his whole life and rates it better than church.'},
 {n:'A koi the colour of a stall lantern',w:.24,loc:'sakura',x:'Juno sells plums under light like this. The fish has strong opinions about the candle stubs and the foot traffic.'},
 {n:'The golden koi',w:.07,x:'One in the pond, and it only rises for people who have listened to the villagers first. It stays for a second, decides you are worth it, and tells you something.',
  secret:'golden'}];

function rollFish(loc){
 const heard=(typeof PASS!=='undefined'&&PASS.chapters)?PASS.chapters.length:0;
 const heardAll=typeof CH!=='undefined'&&heard>=CH.length;
 const pool=FISHES.filter(f=>(!f.loc||f.loc===loc)&&(f.secret!=='golden'||heardAll));
 let tot=0;for(const f of pool)tot+=f.w;
 let r=Math.random()*tot;
 for(const f of pool){r-=f.w;if(r<=0)return f}
 return pool[0]}

function nearWaterline(){
 const d1=Math.hypot(PL.P.a-PONDA[0],PL.P.b-PONDA[1]);
 if(d1>PRA-1.4&&d1<PRA+1.5)return'village';
 const r=pondR2(PL.P.a,PL.P.b),d2=Math.hypot(PL.P.a-POND2L[0],PL.P.b-POND2L[1]);
 if(d2>r-1.35&&d2<r+1.5)return'sakura';
 if(typeof archLift==='function'&&archLift(PL.P.a,PL.P.b)>.05)return'sakura';
 return null}

function anglingNear(){
 if(MODE!=='explore'||!PL)return false;
 if(Math.hypot(PL.P.a-PIER[0],PL.P.b-PIER[1])<.9){ANG_LOC='village';return true}
 if(Math.abs(PL.P.a-26.2)<=.5&&PL.P.b>=17.4&&PL.P.b<=22.3){ANG_LOC='village';return true}
 const w=nearWaterline();
 if(w){ANG_LOC=w;return true}
 return false}

function anglingUse(){
 if(MODE!=='explore'||!PL)return;
 if(!anglingNear())return;
 fishStart(innerWidth/2,innerHeight-190);
 const m=$('fmsg');if(m)m.textContent=ANG_LOC==='sakura'?'The line settles among the lotus. Wait, then reel.':'The line drops into still water. Wait, then reel.';
 const n=$('fish').firstElementChild;if(n)n.querySelector('.fh').textContent='Cast a line';
}

// the catch: whatever comes up goes in the passport, and once in a while it is the golden one
function fishCaught(f){
 PASS.caught.push(f.n);savePass();
 const m=$('fmsg');if(m)m.textContent=f.x;
 note('Caught: '+f.n,f.x,9000);
 if(f.secret){
  const sec=SEC.find(q=>q.id===f.secret);
  if(sec&&!sec.f){sec.f=1;try{localStorage.koiFound=JSON.stringify(SEC.filter(q=>q.f).map(q=>q.id))}catch(e){}
   updCount();checkProgress();
   note('The golden koi',sec.x,12000);
   setTimeout(()=>note('A secret from the water','The pond has given up one of its own for you.',7000),9500)}
 }
 checkProgress();
 if(PASS.caught.length>=3)setTimeout(()=>closeFish(),4600);
}
