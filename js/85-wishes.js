// Wishing pond
const sayW=k=>{W.ov={k,u:performance.now()+75000}};
const LEG=['The sky-sea was empty once. A boy with too many questions stacked a stone on a cloud, and the first island began.','The farm came first: taking things apart to see how they run. Every island since is a question that would not leave him alone.','The mill turned his first big idea, Flux, into something that moves without being pushed.','The pond is where wishes go. Mizu the koi was the first thing he wrote that surprised him.','The shelf holds the small obsessions: a text rewriter, a clinic triage tool, a payment flow.','The bridge points to security, the long road. Every road here is a promise to learn the next hard thing.','The windmill grinds an unsolved problem, one experiment a turn. Fifty four turns so far.','The sakura isle is where finished things rest. Its pagoda has an empty top floor on purpose.','The hermit in the forest keeps the ledger of it all, so nothing here is forgotten.','That is the whole legend. The rest is up to the next thing he builds.'];
const WISHES=[
 [/hermit|legend|story|history|origin|journal|island/,()=>LEG[Math.min(LEG.length-1,nf())]+(nf()<LEG.length-1?' (Find more glints to hear more.)':'')],
 [/shounak|thank|hire|intern|job|collab|work/,()=>{startle=1;return nf()==SEC.length?'You listened to every villager and found every secret. The pond sends a coin back. The postmaster has the email, and he is expecting you.':'The koi have read the code and approve. The postmaster has the email. The pond says there are more secrets than you have found.'}],
 [/storm|thunder/,()=>{sayW('storm');return'Thunder rolls over the water.'}],
 [/rain|drizzle|monsoon/,()=>{sayW('rain');return'Rain begins to fall. The villagers hurry home.'}],
 [/spring|summer|autumn|fall|winter|season/,v=>{const m=v.match(/spring|summer|autumn|fall|winter/);if(!m)return'The year turns on its own. Name a season and the pond will hurry it.';W.s=['spring','summer','autumn','winter'].indexOf(m[0]=='fall'?'autumn':m[0]);seasonSet();return'The year turns.'}],
 [/night|dark|moon|star|firefl/,()=>{W.h=21;return'The stars and fireflies come out.'}],
 [/dusk|sunset|evening|golden/,()=>{W.h=18.4;return'The light turns amber.'}],
 [/day|sun|morning|clear|dawn/,()=>{W.h=10;sayW('clear');return'The sky clears.'}],
 [/flux|mill|wheel|assistant/,()=>'The mill wheel creaks. Fifty four days, zero rupees, and it still turns.'],
 [/stellar|ticket|seat|forge/,()=>'Somewhere a thousand people reach for one seat. The counter stays honest.'],
 [/study|pip|ocr|timetable/,()=>'A blurry timetable sharpens into real classes. Noise stays noise.'],
 [/club|engineering india|college/,()=>'Eight colleges, one collective. A faint cheer drifts over from the fisher’s dock.'],
 [/pagoda|sakura|isle|lantern/,()=>'On the sakura isle the pagoda stands. Each floor is something finished. The top floor is empty on purpose.'],
 [/secur|network|cyber|hack/,()=>'The bridge keeper straightens. Security is the road ahead, and he is walking it one certificate at a time.'],
 [/sekiro|game|boss/,()=>'Five clears. The pond approves of anyone who learns the fight instead of dodging it.'],
 [/p ?vs ?np|nebula|cosmos|philosoph/,()=>'The windmill spins out another experiment. Fifty four down.'],
 [/secret|hidden|glint|clue/,()=>'You have found '+nf()+' of '+SEC.length+'. Faint glints hide near the mill, the shrine, the lookout and the falls.'],
   [/observatory|telescope|signal|dish|nao|wren|star|sky|astronom/,()=>'The dish turns a little. Seven turns, then it repeats: the pond is still humming.'],
  [/koi|fish|carp/,()=>{startle=1;return'The koi scatter, then circle back to see who you are.'}]
];
const COIN=['The coin sinks. The koi are curious.','The coin glints once, then is gone.','Somewhere under the lily pads, a koi nods.'];
// ---- the wishes wall: a public topic, so other visitors' wishes float up too ----
const WISH_TOPIC='koi-pond-wishes',WISH_SEEN=new Set();
let WISH_N=0;
function wishShare(text){
 const body=JSON.stringify({w:String(text).slice(0,60),t:Date.now()});
 fetch('https://ntfy.sh/'+WISH_TOPIC,{method:'POST',headers:{'Content-Type':'application/json'},body}).catch(()=>{});
}
function wishFloat(text){
 const l=document.createElement('span');l.className='wl';l.textContent='\u2028 '+String(text).slice(0,28);
 l.style.marginLeft=(Math.random()*120-60)+'px';document.body.appendChild(l);setTimeout(()=>l.remove(),9500);
}
function wishPoll(){
 fetch('https://ntfy.sh/'+WISH_TOPIC+'/json?poll=1',{cache:'no-store'})
  .then(r=>r.text())
  .then(t=>t.split('\n').filter(Boolean).map(l=>{try{return JSON.parse(l)}catch(e){return null}}).filter(m=>m&&m.message))
  .then(list=>{for(const m of list){let o=null;try{o=JSON.parse(m.message)}catch(e){continue}
    if(!o||!o.w)continue;const id=o.t+':'+o.w;
    if(WISH_SEEN.has(id))continue;WISH_SEEN.add(id);WISH_N++;wishFloat(o.w)}
      const wn=$('wcount');
   if(wn)wn.textContent=WISH_N?(WISH_N+' wish'+(WISH_N===1?' is':'es are')+' floating over the pond from other visitors.'):'Wishes from other visitors will float up over the pond.';
  }).catch(()=>{});
}
setTimeout(wishPoll,1400);
setInterval(wishPoll,26000);
function wish(){const i=$('w'),v=i.value.toLowerCase(),m=$('msg');
 const r=innerWidth*.35;for(let k=0;k<3;k++)ripple(innerWidth/2+(Math.random()-.5)*r,innerHeight/2+(Math.random()-.5)*r,2.2,k*.35);
 const hit=WISHES.find(w=>w[0].test(v));
 m.textContent=hit?hit[1](v):COIN[Math.floor(Math.random()*COIN.length)];
   if(v.trim()){wishFloat(v.trim());wishShare(v.trim())}
  i.value=''}
$('toss').onclick=wish;
$('w').addEventListener('keydown',e=>{if(e.key==='Enter')wish()});
