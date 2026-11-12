addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-lx,e.clientY-ly)>(e.buttons?10:22)){lx=e.clientX;ly=e.clientY;ripple(lx,ly,e.buttons?1.2:.6)}},{passive:true});
addEventListener('pointerdown',e=>{
 ripple(e.clientX,e.clientY,1.8);
 if(MODE==='start')return;
 if(WHEEL&&Math.hypot(e.clientX-WCX,e.clientY-WCY)<28*Z*WS){WHEELT=T;note('The mill wheel','The launder is louder now. It will settle in a moment.',4200);return}
 const wx=(e.clientX/WS-TX)/Z,wy=(e.clientY/WS-TY)/Z;
 const fi=((wx-OX)/16+(wy-OY)/8)/2,fj=((wy-OY)/8-(wx-OX)/16)/2;
 if((Math.hypot(fi-POND[0],fj-POND[1])<6.4||Math.hypot(fi-POND2[0],fj-POND2[1])<5.4)&&(MODE!=='explore'||!PL||Math.hypot(PL.P.a-fi,PL.P.b-fj)<7))fishStart(e.clientX,e.clientY);
});

// The villagers tell the story, one per stop on the lane.
const CH=[
 {at:[9.6,5.2],pal:[[104,142,72],[84,70,52],[170,130,70],[226,184,146],[214,184,96]],name:'Teru',role:'the farmer',text:'Ah, a visitor. This whole village is Shounak’s doing. He builds agentic AI systems and full-stack apps that keep working when someone else runs them.',tags:'',links:[]},
 {at:[16.0,8.6],pal:[[196,72,58],[58,62,92],[92,54,32],[228,182,144],null],name:'Mira',role:'the miller',text:'Flux is his big one. Twenty-one tools behind a plan, execute, verify, retry loop. Its vector memory re-injects itself, so one bad extraction can poison every later answer.',tags:'Bun · Express 5 · React 19 · pgvector · E2B sandbox',links:[['Flux on GitHub ↗',GH+'Flux']]},
 {at:[15.2,13.4],pal:[[78,118,148],[62,58,66],[214,206,186],[222,178,140],[176,128,74]],name:'Pip',role:'the student',text:'StudyDesk is the Android app he uses every day. On-device OCR turns a photographed timetable into real classes, even blurry or rotated ones. Noise never becomes a lecture.',tags:'React · Vite · Capacitor · OCR',links:[['StudyDesk on GitHub ↗',GH+'studydesk']]},
 {at:[14.9,16.6],pal:[[222,196,84],[92,86,70],[142,84,40],[236,196,152],[124,88,52]],name:'Oro',role:'the ticket seller',text:'Stellar Forge sells event tickets. The hard part is seat claims that cannot race: serialisable transactions, row locking and one live counter everyone trusts.',tags:'React · Three.js · PostgreSQL · Real-time',links:[['Stellar Forge on GitHub ↗',GH+'stellar-forge']]},
 {at:[21.55,19.55],pal:[[206,96,72],[74,62,56],[60,48,40],[224,184,148],[92,64,44]],name:'Bea',role:'the shopkeeper',text:'Out back is the shelf. de-ai rewrites text with no model at all. Meridian triages clinical cases from real ICD-10 data. Plenty more where those came from.',tags:'',links:[['de-ai',GH+'de-ai'],['Meridian',GH+'meridian'],['AI Wire ↗','https://ai-news-seven-tan.vercel.app/'],['Weight forensics',GH+'llm-weight-forensics'],['ACM RBU site',GH+'acm-rbu-site'],['Voxelcraft',GH+'voxelcraft'],['PayFlow',GH+'payflow-java'],['Sixty logins',GH+'60-login-page-challenge']]},
 {at:[19.8,24.5],pal:[[120,104,84],[70,74,88],[238,232,220],[214,166,126],[178,152,112]],name:'Sen',role:'the old fisher',text:'Second year BTech CSE at Ramdeobaba, Nagpur. He also coordinates Engineering India RBU, a student collective across eight colleges. Mind the koi.',tags:'',links:[]},
 {at:[34.4,22.6],pal:[[142,158,120],[64,66,60],[198,186,150],[220,172,132],null],name:'Kiri',role:'the bridge keeper',text:'He likes agents that plan and verify, real-time apps where race conditions are the real problem, and graphics written from scratch instead of configured.',tags:'TypeScript · Python · C · React · PostgreSQL · Godot · Three.js · Docker',links:[]},
 {at:[98.0,24.9],pal:[[176,132,88],[62,66,72],[122,88,52],[214,168,132],[120,88,52]],name:'Juno',role:'the postmaster',text:'Last stop. He is open to internships, to collaboration, and to being told he is doing something in a stupid way. Send a letter.',tags:'',links:[['GitHub','https://github.com/shounakjoshi88-a11y'],['X','https://x.com/BroIndian39416'],['YouTube','https://www.youtube.com/@Badass069'],['Email','mailto:shounakjoshi88@gmail.com']]},
 {at:[130.4,24.6],pal:[[54,64,98],[40,44,58],[76,64,52],[224,184,146],null],name:'Nao',role:'the astronomer',dock:'right',text:'Nao keeps the long experiment. Fifty four attempts at P versus N, charted like weather. Nothing up here is abandoned, only unsolved.',tags:'',links:[]},
 {at:[97.2,58.6],pal:[[70,104,132],[58,54,50],[46,38,32],[222,184,146],null],name:'Tula',role:'the shipwright',text:'She builds the hulls for everything that leaves the pond. Anything finished gets a hull and a name, and then it goes out and gets used by somebody he will never meet.',tags:'',links:[]},
 {at:[137.8,33.2],pal:[[212,168,84],[70,72,88],[54,44,38],[232,192,150],[178,68,52]],name:'Wren',role:'the question',dock:'right',text:'Wren is eight, and wants to know why the sky is dark at night. Every island you walked through tonight started as one of his questions.',tags:'',links:[]}
];

const STORY={
 Teru:{ch:'Chapter 1 · Roots',p:['Ah, a visitor. Welcome to Shounak’s village. Every island here is a piece of how he got here.','He has loved technology for as long as he can remember. This farm is where it starts: curious, hands dirty, taking things apart.','Today he builds agentic AI systems and full stack apps that keep working when someone else runs them. Walk on.']},
 Mira:{ch:'Chapter 2 · Flux',p:['Flux is his big one. A whole AI assistant platform, built solo in about fifty four days at zero cost.','Twenty one tools behind a plan, execute, verify, retry loop. Its memory feeds itself, so one bad extraction can poison later answers. He caught that.','The dream: an Indian answer to Claude and Perplexity, where the platform is the product and the model is a plug.']},
 Pip:{ch:'Chapter 3 · Daily tools',p:['StudyDesk is the Android app he uses every day. He built it because he needed it.','On-device OCR turns a photographed timetable into real classes, even blurry or rotated ones. Noise never becomes a lecture.','He studies CS at Ramdeobaba in Nagpur, so the first user is always himself.']},
 Oro:{ch:'Chapter 4 · Under pressure',p:['Stellar Forge sells event tickets. Easy, until a thousand people reach for the last seat.','Serialisable transactions, row locking and one live counter everyone trusts. It ships as an Android app too.','He wrote the specs and skill files, directed AI coding agents, and checked every result himself.']},
 Bea:{ch:'Chapter 5 · The shelf',p:['Out back is the shelf: what he builds when a question will not leave him alone.','de-ai rewrites text with no model at all. Meridian triages clinical cases from real ICD-10 data. Payflow is a Java payment gateway.','Raksha and NeRoute came out of hackathons: crowd safety, and logistics for India’s North East.']},
 Sen:{ch:'Chapter 6 · People',p:['He also coordinates Engineering India RBU, a student collective across eight colleges.','Between builds he runs a long experiment: fifty four attempts at P versus NP. Most end in no. He starts the next anyway.','Patience is a skill. He has finished Sekiro five times. Mind the koi.']},
 Kiri:{ch:'Chapter 7 · The path ahead',p:['This bridge points toward security. SC-900 is done, network security is in progress, JNCIA is next.','He likes agents that plan and verify, real-time apps where race conditions are the real problem, and graphics written from scratch.','Cost conscious by habit: a jugaad mind, a local VM lab, nothing paid when free will do.']},
 Juno:{ch:'Chapter 8 · Letters',p:['Last stop, the sakura isle. The pagoda keeps what he has finished. The lanterns keep what he is still building.','He is open to internships, to collaboration, and to being told he is doing something in a stupid way.','Send a letter. Then wander back to the pond and make a wish.']},
 Nao:{ch:'Chapter 9 · The long experiment',p:['Past the postmaster the stair keeps going. Nao keeps the sky the way Shounak keeps a problem: patiently, and in public.','Fifty four attempts at P versus N. Most end in no. The ledger does not call that failure; it calls it forty nine more things you now know.','He built the telescope himself, because he wanted to see the thing rather than configure somebody else’s view of it.']},
 Tula:{ch:'Chapter 11 · The harbour',p:['Five hulls are on the stands and every one of them is a thing that was finished here and then sent somewhere else to be useful.','There is a hospital running Flux in a city he has never visited. Tula built the hull it arrived in. She still gets the post.']},
 Wren:{ch:'Chapter 10 · Why',p:['Why is the sky dark at night? Why does the mill turn? Why does the pond keep the coins?','Every place you walked through tonight was one of these questions, built until it could be walked through.','The boy is still asking. That is the whole method: ask, build, check, and ask again.']}};
for(const c of CH){const s=STORY[c.name];c.ch=s.ch;c.pages=s.p;c.text=s.p.join(' ')}
$('srl').innerHTML=CH.map(c=>`<li>${c.name}, ${c.role}: ${c.text} ${c.tags}</li>`).join('');
const BUB=$('bub');let curCh=-1,bw=300,bh=200,typ2=null;
let pg=0,pgT=null;
const MEM={Teru:'You have been here before. The farm has not changed, but you are looking at it differently.',
 Mira:'You know where the mill is now. That is the whole difference between a visitor and a neighbour.',
 Pip:'Back again? StudyDesk is still on your phone, and it still refuses to turn a blurry timetable into a lecture.',
 Oro:'You have the look of someone who has already lost a seat. Sit down. The counter is honest.',
 Bea:'You came back to the shelf. Most people do not come back to the shelf.',
 Sen:'You found some of them. The pond told me. It tells me things, you know, but it never says how.',
 Kiri:'You have walked the whole road. That is more than most, and it took you the whole evening.',
 Juno:'There is a letter waiting for you. It has been waiting since you started looking.',
 Nao:'You came back up the stair. The sky has not changed, but your questions have.',
 Wren:'You found the observatory. I knew you would. I have been telling everyone.',
  Tula:'You came to the harbour. Most people stop at the pagoda. Take a hull, if you like. Somebody should.'};
function chPages(c){return nf()>0&&MEM[c.name]?[MEM[c.name]].concat(c.pages):c.pages}
function adv(){const c=CH[curCh];if(pg<chPages(c).length-1){pg++;drawPg()}}
function drawPg(){const c=CH[curCh],pages=chPages(c),full=pages[pg],last=pg==pages.length-1;clearInterval(typ2);clearTimeout(pgT);
 if(last&&!PASS.chapters.includes(c.name)){PASS.chapters.push(c.name);savePass()}
 BUB.innerHTML=`<div class="bb"><div class="nm"><b>${c.name}</b> · ${c.role}<span class="chp">${c.ch}</span></div><p class="tx"><span class="on"></span><span class="off">${full}</span></p>${last?(c.tags?`<div class="tgs">${c.tags}</div>`:'')+(c.links.length?`<div class="lk">${c.links.map(l=>`<a href="${l[1]}"${l[1][0]=='h'?' target="_blank" rel="noopener"':''}>${l[0]}</a>`).join('')}</div>`:''):`<button class="nx" type="button">${pg+1}/${c.pages.length} · tap for more</button>`}</div><i class="tail"></i>`;
 const on=BUB.querySelector('.on'),off=BUB.querySelector('.off');
 if(reduce){on.textContent=full;off.textContent=''}else{let i=0;typ2=setInterval(()=>{i+=2;on.textContent=full.slice(0,i);off.textContent=full.slice(i);if(i>=full.length)clearInterval(typ2)},16)}
 if(!last)pgT=setTimeout(adv,5500+full.length*30);
 BUB.classList.remove('pop');void BUB.offsetWidth;BUB.classList.add('pop');bw=BUB.offsetWidth;bh=BUB.offsetHeight}
function setCh(k){curCh=k;pg=0;drawPg()}
BUB.addEventListener('click',e=>{if(!e.target.closest('a'))adv()});
const WISHC=document.querySelector('.wish');
let WHEEL=null,WHEELT=0,WCX=0,WCY=0;
function bubbleTick(f){skyTick();secretTick();
 const expl=MODE==='explore';
 if(MODE==='start'){BUB.style.opacity=0;BUB.style.pointerEvents='none';BUB.style.visibility='hidden';return}
 const k=expl?(NEAR>=0?NEAR:curCh):clamp(Math.round(f),0,CH.length-1);
 if(k<0){BUB.style.opacity=0;BUB.style.pointerEvents='none';BUB.style.visibility='hidden';return}
 if(k!==curCh)setCh(k);
 const c=CH[k],[X,Y]=PF(c.at[0],c.at[1]),a=expl?(NEAR>=0?1:0):clamp(1-(Math.abs(f-k)-.1)/.28,0,1),vw=innerWidth,sx=(TX+X*Z)*WS,sy=(TY+(Y-24)*Z)*WS,half=bw/2,wr=WISHC.getBoundingClientRect(),
 narrow=vw<900, wrOn=wr.top<innerHeight*.9&&wr.bottom>0,
 lo=(!narrow&&wrOn)?wr.right+14+half:0;
 let x,y;
 if(expl&&vw<700){
  // walking on a phone: the villager talks in a card along the bottom, clear of the map
  // and clear of the button column on the right
  x=12+half;y=innerHeight-92;
  BUB.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`;
 }else if(expl){
  // walking on a desktop: the card floats over the villager it belongs to
  x=clamp(sx,Math.max(12+half,0),vw-12-half);
  y=Math.max(sy,bh+70);
  BUB.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`;
 }else if(narrow){
  // on a phone the story is a caption under the nav. If the wish form is up it sits above the
  // card instead of hiding, so the last chapters are still readable.
  const nb=(document.querySelector('nav')||{getBoundingClientRect:()=>({bottom:56})}).getBoundingClientRect().bottom+9;
  x=clamp(sx,Math.max(12+half,0),vw-12-half);
  y=(wrOn&&wr.top<nb+bh+10)?Math.max(nb,wr.top-bh-10):nb;
  BUB.style.transform=`translate(${x}px,${y}px) translate(-50%,0)`;
 }else{
 x=c.dock==='right'?vw-12-half:clamp(sx,Math.max(12+half,lo),vw-12-half);
 y=Math.max(sy,bh+70);
 BUB.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`;
 }
 BUB.style.setProperty('--tx',clamp(sx-x,-half+20,half-20)+'px');
 if(WHEEL){WHEEL.rate=(WHEELT&&T-WHEELT<5)?26:8;WCX=(TX+(WHEEL.x-44)*Z)*WS;WCY=(TY+(WHEEL.y-52)*Z)*WS}
 const on=expl?true:(narrow||(sx>-20&&sx<vw+20&&sy>0&&sy<innerHeight+200));
 BUB.style.opacity=on?a:0;BUB.style.pointerEvents=(a>.6)?'auto':'none';BUB.style.visibility=(a<.02||!on)?'hidden':'visible'}
