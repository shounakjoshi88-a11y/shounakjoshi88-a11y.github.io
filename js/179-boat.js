/* ================= THE OLD FISHER'S RIDDLE, AND THE BOAT =================
   Sen does not give his rowboat away. He asks six questions about water, scratched into a barnacled
   strongbox on the pier, and the pond decides the rest. Four right and the boat is yours.
   v2: a pool of fourteen riddles (six drawn each time, answers shuffled, each with a reason),
       a properly built clinker hull with thwarts, a painted koi and a bow lantern,
       and six messages in bottles drifting on the pond for whoever has oars.
   ------------------------------------------------------------------ */
const QUIZ=[
 {q:'What makes the waves?',a:['The pull of the moon','Wind over water','The turning of the world'],ok:1,why:'Wind drags the surface and the surface piles up. The tides are the moon’s doing, but not the waves.'},
 {q:'Why does a great steel ship float?',a:['Because it pushes aside more water than it weighs','Because steel is hollow','Because the sea is proud of her'],ok:0,why:'A hull displaces its own weight in water, and the water pushes back.'},
 {q:'What powers the whole cycle of water?',a:['The wind','The moon','The sun'],ok:2,why:'The sun lifts the water, the sky carries it, and the rain brings it home.'},
 {q:'Where does the village pond get its water?',a:['The mountain spring, by way of rain','From the sea, uphill, by canal','From the wells of the sky'],ok:0,why:'Rain falls on the mountain, runs down as a spring, and the pond collects it.'},
 {q:'What is the pond’s oldest rule?',a:['Never fish alone','Be still, and they come to you','Count the koi aloud'],ok:1,why:'Fish come to patience, not to noise. Sen has been saying this for forty years.'},
 {q:'How does every journey on this water begin?',a:['With a map','With a full net','With pushing off from shore'],ok:2,why:'No map ever moved a boat. The first push does.'},
 {q:'Why is the sea salty?',a:['Rivers carry dissolved minerals down to it','Fishermen spill their lunches','The sun cooks it in'],ok:0,why:'Rain wears the rock, rivers carry the salt down, and when the water rises again the salt stays behind.'},
 {q:'Where is a pond deepest?',a:['At the edges','Usually near the middle','Exactly the same everywhere'],ok:1,why:'The bowl of the pond slopes down from the banks. Koi know this and sleep in the middle.'},
 {q:'What happens to a pond that freezes?',a:['It freezes solid from the bottom up','Ice forms on top and the fish live below','The fish all migrate'],ok:1,why:'Ice floats, and it keeps the cold off the water beneath. A frozen lid is a blanket.'},
 {q:'Why do ripples spread in rings?',a:['The wave moves outward equally in every direction','The pond is round','The fish arrange them'],ok:0,why:'A disturbance travels outward at the same speed all round, so it draws a circle.'},
 {q:'What does a koi do when it hears a loud noise?',a:['Dives and circles back to see who you are','Leaps onto the bank','Nothing, koi are deaf'],ok:0,why:'They feel it through the water, scatter, and then curiosity wins.'},
 {q:'Which way does a river always flow?',a:['Toward the sea','Toward the sun','Away from the rain'],ok:0,why:'Downhill. Water spends its whole life finding the lowest place it can.'},
 {q:'What is the best time to row?',a:['At noon, when it is hottest','At dawn, when the water is flat','Only in a storm'],ok:1,why:'Dawn water is still. You can hear the oars, and the fish have not yet decided about you.'},
 {q:'What do you do with a boat you were lent?',a:['Return it better than you found it','Keep it a month','Paint it red'],ok:0,why:'It is the only rule on the pier that Sen never repeats, because nobody ever breaks it.'}];
const QUIZBOX=[26.85,16.35],BOAT_SPOT=[21.2,23.0];
let QSET=[],QUIZ_I=0,QUIZ_GOOD=0,BOATMODE=0,QUIZ_LOCK=0;
const qShuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a};

function quizNear(){if(MODE!=='explore'||!PL)return false;
 return Math.hypot(PL.P.a-QUIZBOX[0],PL.P.b-QUIZBOX[1])<.95}
function boatWater(a,b){
 if(Math.hypot(a-POND[0],b-POND[1])<PR-.35&&Math.hypot(a-ISL[0],b-ISL[1])>IR+.2)return 1;
 if(typeof pondR2==='function'&&Math.hypot(a-POND2[0],b-POND2[1])<pondR2(a,b)-.35)return 1;
 return 0}
function boatBoardNear(){if(MODE!=='explore'||!PL||BOATMODE)return false;
 return PASS.boatLicense&&Math.hypot(PL.P.a-BOAT_SPOT[0],PL.P.b-BOAT_SPOT[1])<1.2}

function quizOpen(){
 if(PASS.boatLicense){
  note('The riddle-box','The lid hangs open and the bowl inside is dry. Sen taps it once with one finger and says nothing, which is Sen for good work.',6000);
  return}
 QSET=qShuffle(QUIZ).slice(0,6);QUIZ_I=0;QUIZ_GOOD=0;QUIZ_LOCK=0;
 renderQuiz();
 $('quiz').hidden=false}
function renderQuiz(){
 const Q=QSET[QUIZ_I],order=qShuffle([0,1,2]);
 const dots=QSET.map((_,i)=>i<QUIZ_I?'●':i===QUIZ_I?'◉':'○').join(' ');
 $('qq').textContent=(QUIZ_I+1)+' of '+QSET.length+' — '+Q.q;
 $('qopts').innerHTML=order.map(k=>'<button type="button" class="qopt" data-k="'+k+'">'+Q.a[k]+'</button>').join('');
 $('qmsg').textContent=dots+'   Four right and the boat is yours.'}
function quizAnswer(k){
 if(QUIZ_LOCK)return;
 const Q=QSET[QUIZ_I],right=k===Q.ok;
 if(right)QUIZ_GOOD++;
 QUIZ_LOCK=1;
 for(const b of $('qopts').children){const bk=+b.dataset.k;b.disabled=true;if(bk===Q.ok)b.style.outline='2px solid #7ac47a';else if(bk===k)b.style.outline='2px solid #d86a5a'}
 $('qmsg').textContent=(right?'Right. ':'Not quite. ')+Q.why;
 setTimeout(()=>{QUIZ_LOCK=0;QUIZ_I++;if(QUIZ_I<QSET.length)renderQuiz();else quizFinish()},right?1500:2200)}
function quizFinish(){
 const won=QUIZ_GOOD>=4;
 if(won){
  PASS.boatLicense=1;savePass();
  if(typeof sfx==='function')sfx('win');
  $('qq').textContent='The box clicks open.';
  $('qopts').innerHTML='<p class="qwin">Six questions, '+QUIZ_GOOD+' right. Inside: a brass boat token, warm as a held coal, and a slip of paper that says only: The oars were always yours.</p>';
  $('qmsg').textContent='The pulled-up rowboat by the pond is yours now. Walk to it and take the oars. Six bottles are drifting out there somewhere.';
  note('The old fisher nods','“The pond decides who it feeds and who it carries,” Sen says. “It has decided you.”',9000)
 }else{
  $('qq').textContent='The box stays shut.';
  $('qopts').innerHTML='<p class="qlose">'+QUIZ_GOOD+' of 6. The lid does not so much as shiver. Sen studies you for a long moment, then slides the box an inch further across the planks. “Again,” he says, which is Sen for come back when the pond is in you.</p>';
  $('qmsg').textContent='Close and try again. The questions change, and the box is patient.'}}
$('qopts').addEventListener('click',e=>{const b=e.target.closest('.qopt');if(b)quizAnswer(+b.dataset.k)});
$('qclose').onclick=()=>{$('quiz').hidden=true};

function boatExit(){
 BOATMODE=0;PL.P.hid=0;
 const q=nearWalk(PL.P.a,PL.P.b);PL.P.a=q[0];PL.P.b=q[1];
 const it=PEOPLE.find(r=>r.P===PL.P);if(it)it.d=PL.P.a+PL.P.b;
 note('Back on land','Your boots find the grass. The boat goes home to its mooring at the boathouse.',4200)}
function boatUse(){
 if(BOATMODE){boatExit();return}
 PL.P.a=BOAT_SPOT[0];PL.P.b=BOAT_SPOT[1];GOAL=null;WAKET=0;BOATMODE=1;PL.P.hid=1;
 const it=PEOPLE.find(r=>r.P===PL.P);if(it)it.d=BOAT_SPOT[0]+BOAT_SPOT[1]+.02;
 CF=[PL.P.a,PL.P.b];
 const left=BOTTLES.filter(b=>!(PASS.bottles||[]).includes(b.id)).length;
 note('You push off','The hull slides from the grass into the water with a sound like a long held breath. Tap the water or hold WASD to row.'+(left?' '+left+' bottle'+(left===1?'':'s')+' still drifting.':''),5600)}

// ---- the hull: clinker strakes, a painted sheer, thwarts, a koi on the bow, and a lantern ----
function boatArt(oars,key){
 if(SPR[key])return SPR[key];
 const c=mk(54,36),x=c.getContext('2d'),X0=6,L=42,STR=[[48,126,136],[170,122,72],[142,98,56]];
 const top=i=>19-i*.04-3.4*Math.pow(2*i/L-1,2),bot=i=>top(i)+9*(1-Math.pow(Math.abs(2*i/L-1),2.1));
 for(let i=0;i<=L;i++){
  const t0=Math.round(top(i)),b0=Math.round(bot(i)),h=Math.max(1,bot(i)-top(i));
  for(let y=t0-3;y<t0;y++)px(x,X0+i,y,rgb(y===t0-3?[64,42,24]:[96,66,38]));
  for(let y=t0;y<b0;y++){const f=(y-top(i))/h,r=Math.max(0,Math.min(2,Math.floor(f*3)));let col=STR[r].slice();
   if(f*3-r<.3&&r>0)col=col.map(q=>q*.68);
   if(i%7===0)col=col.map(q=>q*.82);
   col=col.map(q=>q*(1.06-.16*f));px(x,X0+i,y,rgb(col))}
  px(x,X0+i,t0-1,rgb([206,160,98]));px(x,X0+i,t0,rgb([232,196,134]),1,1)}
 // stem post and transom
 px(x,X0+L,Math.round(top(L))-6,rgb([120,82,46]),2,7);px(x,X0+L,Math.round(top(L))-6,rgb([196,150,92]),1,7);
 px(x,X0-1,Math.round(top(0))-4,rgb([96,64,36]),2,8);
 // thwarts, with a coil of rope on the middle one
 for(const i of[12,23,32]){const y=Math.round(top(i))-4;px(x,X0+i,y,rgb([150,106,62]),5,3);px(x,X0+i,y,rgb([208,164,104]),5,1);px(x,X0+i+1,y+3,rgb([70,46,26]),3,1)}
 for(let k=0;k<4;k++)px(x,X0+23+k,Math.round(top(23))-6+(k&1),rgb([206,184,128]),1,2);
 // a red koi painted on the bow strake
 const fy=Math.round(top(34))+2;px(x,X0+32,fy,rgb([214,64,44]),5,2);px(x,X0+31,fy-1,rgb([226,96,60]),2,1);px(x,X0+37,fy,rgb([232,120,72]),1,2);px(x,X0+34,fy,rgb([255,236,210]));
 // the stern lantern on a short pole
 const lx=X0+2,ly=Math.round(top(2))-12;px(x,lx,ly+4,rgb([84,56,34]),1,9);px(x,lx-2,ly,rgb([36,28,22]),5,1);px(x,lx-2,ly+1,rgb([240,190,90]),5,3);px(x,lx-1,ly+2,rgb([255,232,160]),3,1);px(x,lx-2,ly+4,rgb([36,28,22]),5,1);
 if(oars){
  for(const[sx,sy,ex,ey]of[[X0+17,15,2,8],[X0+28,16,50,10]]){x.strokeStyle='#5a381e';x.lineWidth=2;x.beginPath();x.moveTo(sx,sy);x.lineTo(ex,ey);x.stroke();
   x.strokeStyle='#a87a46';x.lineWidth=1;x.beginPath();x.moveTo(sx,sy-1);x.lineTo(ex,ey-1);x.stroke();px(x,ex-2,ey-1,rgb([170,124,74]),5,3);px(x,ex-2,ey-1,rgb([210,168,110]),5,1)}
  px(x,X0+16,13,rgb([60,40,24]),2,3);px(x,X0+27,14,rgb([60,40,24]),2,3)}
 return SPR[key]={c,ox:oars?26:27,oy:oars?23:21,sh:oars?[11,5,18,3]:[11,4,19,4],gl:[[lx+1,ly+3,22]]}}
function boat(){return boatArt(0,'bt2')}
function rowboat(){return boatArt(1,'rbt2')}

// ---- six messages in bottles, drifting on the pond for whoever has oars ----
const BOTTLES=[
 {id:0,t:'The first bottle',s:'A boy asked how a machine knew what it knew. Nobody could tell him, so he started building one to find out.'},
 {id:1,t:'The second bottle',s:'Flux: fifty four days, zero rupees, and one assistant that still turns the wheel without being pushed.'},
 {id:2,t:'The third bottle',s:'StellarForge: a thousand people reach for one seat, and the counter stays honest.'},
 {id:3,t:'The fourth bottle',s:'A blurry timetable, read honestly, becomes real classes. The trick is knowing what is noise.'},
 {id:4,t:'The fifth bottle',s:'NEROUTE: the roads of the north east wind slower than any map admits. This is a plan for them.'},
 {id:5,t:'The sixth bottle',s:'The long road is security, one certificate at a time. Nobody here is in a hurry. Pull in the net and come ashore.'}];
function bottleArt(){if(SPR.bottle)return SPR.bottle;const c=mk(12,18),x=c.getContext('2d');
 px(x,4,2,rgb([150,104,60]),3,2);px(x,3,4,rgb([176,222,214]),5,2);px(x,2,6,rgb([150,206,200]),7,10);px(x,3,7,rgb([214,242,236]),2,7);
 px(x,4,9,rgb([232,214,170]),4,5);px(x,5,10,rgb([150,110,70]),2,1);px(x,5,12,rgb([150,110,70]),2,1);px(x,2,15,rgb([108,170,170]),7,1);
 return SPR.bottle={c,ox:6,oy:15,sh:[1,1,5,2],gl:[[6,9,10]]}}
function buildBoatExtras(){
 const got=PASS.bottles||[],spots=[];
 for(let k=0;k<400&&spots.length<BOTTLES.length;k++){
  const an=k*2.399,r=PR*(.3+.55*((k*.137)%1)),a=POND[0]+Math.cos(an)*r,b=POND[1]+Math.sin(an)*r;
  if(boatWater(a,b)&&Math.hypot(a-ISL[0],b-ISL[1])>IR+1.2&&spots.every(p=>Math.hypot(a-p[0],b-p[1])>3.2))spots.push([a,b])}
 BOTTLES.forEach((B,i)=>{if(got.includes(B.id)||!spots[i])return;B.at=spots[i];B.o=put(spots[i][0],spots[i][1],bottleArt(),0)});
 objs.sort((a,b)=>a.d-b.d)}
setInterval(()=>{
 const t=performance.now()/1000;
 for(const B of BOTTLES){if(!B.o||B.got)continue;B.o.y=Math.round(PF(B.at[0],B.at[1])[1]+Math.sin(t*1.3+B.id*2)*1.6);
  if(BOATMODE&&PL&&Math.hypot(PL.P.a-B.at[0],PL.P.b-B.at[1])<.95){
   B.got=1;const i=objs.indexOf(B.o);if(i>=0)objs.splice(i,1);
   PASS.bottles=(PASS.bottles||[]).concat(B.id);savePass();
   if(typeof sfx==='function')sfx('bottle');
   const n=PASS.bottles.length;
   note(B.t+' ('+n+' of '+BOTTLES.length+')',B.s+(n===BOTTLES.length?' That is all six. The pond sends a coin back, and the koi circle your boat twice.':''),8000)}}},120);
