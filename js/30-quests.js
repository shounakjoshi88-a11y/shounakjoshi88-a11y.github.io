// ---- the passport: what you carry between visits ----
const PASS={chapters:[],quests:[],caught:[],journal:0,signal:0};
try{const p=JSON.parse(localStorage.koiPass||'{}');for(const k in PASS)if(p[k]!=null)PASS[k]=p[k]}catch(e){}
const savePass=()=>{try{localStorage.koiPass=JSON.stringify(PASS)}catch(e){}};
const hasSecret=id=>SEC.some(s=>s.id===id&&s.f);
const nf=()=>SEC.filter(s=>s.f).length,updCount=()=>{$('sec').textContent='Secrets '+nf()+'/'+SEC.length;const c=$('pcount');if(c)c.textContent=nf()+'/'+SEC.length+(PASS.journal?' \u2713':'')};
function found(s){if(!s.f){s.f=1;s.el.classList.add('f');try{localStorage.koiFound=JSON.stringify(SEC.filter(q=>q.f).map(q=>q.id))}catch(e){}updCount();checkProgress();
  if(nf()==SEC.length)setTimeout(()=>note('Every secret found','The pond has heard you. Make a wish that mentions Shounak.',9000),9500)}
 const x=Array.isArray(s.x)?s.x[(s.n=s.n||0)%s.x.length]:s.x;if(Array.isArray(s.x))s.n++;note(s.t+(Array.isArray(s.x)?' · '+(((s.n-1)%s.x.length)+1)+'/'+s.x.length:''),x,9000)}
SEC.forEach(s=>{if(s.noGlint)return;const b=document.createElement('button');b.className='sx';b.type='button';b.setAttribute('aria-label','A faint glint: a hidden detail');b.onclick=()=>found(s);document.body.appendChild(b);s.el=b;if(s.id==='signal')b.onclick=()=>openSig();if(FOUND.includes(s.id)){s.f=1;b.classList.add('f')}});updCount();

// ---- the quests the villagers hand out ----
const QUESTS=[
 {id:'village',from:'Teru',t:'The four village glints',need:['shrine','cart','mill','boat'],
  x:'Teru counts them off like a farmer counts sheep: the shrine, the cart, the mill, the boat. Four, and the village has told you its whole story. She thanks you for listening to it.'},
 {id:'koi',from:'Sen',t:'Three koi',need:3,
  x:'Three fish, and Sen will admit the pond has been talking to you all along. The koi nod. They have been saying the same thing.'},
 {id:'far',from:'Kiri',t:'The two far ends',need:['lookout','falls'],
    x:'The lookout and the falls are the two ends of the road. Kiri says most people walk one of them and call it a journey.'},
 {id:'sky',from:'Nao',t:'The sky ledger',need:['telescope','signal'],
  x:'Two glints, and Nao closes the ledger. The sky is not a place you finish, he says. It is a place you keep looking at, which is the same thing he says about the problem.'}];
const questDone=q=>Array.isArray(q.need)?q.need.every(hasSecret):PASS.caught.length>=q.need;
const questProg=q=>Array.isArray(q.need)?q.need.filter(hasSecret).length+'/'+q.need.length:PASS.caught.length+'/'+q.need;

// ---- rewards, and the journal the pond keeps for you ----
function checkProgress(){
 let changed=false;
 for(const q of QUESTS){
  if(PASS.quests.includes(q.id)||!questDone(q))continue;
  PASS.quests.push(q.id);changed=true;
  const c=CH.find(c=>c.name===q.from);
  if(c){c.pages=c.pages.concat([q.x]);c.text=c.pages.join(' ')}
  setTimeout(()=>note('Quest done: '+q.t,q.x,9000),700);
 }
  const j=$('journal'),jn=$('jnav');
 if(nf()===SEC.length&&!PASS.journal){
  PASS.journal=1;changed=true;
  setTimeout(()=>note('The pond opens its journal','Every glint found. There was a page it was keeping for you.',9000),1200);
 }
 // a visitor who already earned it keeps it, whatever this session did
 if(PASS.journal){if(j)j.hidden=false;if(jn)jn.hidden=false}
 if(changed)savePass();
}
