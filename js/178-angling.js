/* ================= ANGLING AT THE PIER =================
   The jetty reaches out over the pond. Stand on it and you can put a line in the water.
   Most of what comes up is ordinary. Once in a while it is not.
   ------------------------------------------------------------------ */
const PIER=[26.2,17.7];
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
 {n:'The golden koi',w:.07,x:'One in the pond, and it only rises for people who have listened to the villagers first. It stays for a second, decides you are worth it, and tells you something.',
  secret:'golden'}];

function rollFish(){
 let tot=0;for(const f of FISHES)tot+=f.w;
 let r=Math.random()*tot;
 for(const f of FISHES){r-=f.w;if(r<=0)return f}
 return FISHES[0]}

function anglingNear(){
 if(MODE!=='explore'||!PL)return false;
 return Math.hypot(PL.P.a-PIER[0],PL.P.b-PIER[1])<.9}

function anglingUse(){
 if(MODE!=='explore'||!PL)return;
 if(!anglingNear())return;
 fishStart(innerWidth/2,innerHeight-190);
 const m=$('fmsg');if(m)m.textContent='The line goes out over the lily pads. Wait, then reel.';
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
