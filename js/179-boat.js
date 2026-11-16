/* ================= THE OLD FISHER'S RIDDLE =================
   Sen does not give his rowboat away. He asks six questions about water,
   scratched into a barnacled strongbox on the pier, and the pond decides
   the rest. Four right and the boat is yours.
   ------------------------------------------------------------------ */
const QUIZ=[
 {q:'What makes the waves?',a:['The pull of the moon','Wind over water','The turning of the world'],ok:1},
 {q:'Why does a great steel ship float?',a:['Because it pushes aside more water than it weighs','Because steel is hollow','Because the sea is proud of her'],ok:0},
 {q:'What powers the whole cycle of water?',a:['The wind','The moon','The sun'],ok:2},
 {q:'Where does the village pond get its water?',a:['The mountain spring, by way of rain','From the sea, uphill, by canal','From the wells of the sky'],ok:0},
 {q:'What is the pond’s oldest rule?',a:['Never fish alone','Be still, and they come to you','Count the koi aloud'],ok:1},
 {q:'How does every journey on this water begin?',a:['With a map','With a full net','With pushing off from shore'],ok:2}];
const QUIZBOX=[26.85,16.35],BOAT_SPOT=[21.2,23.0];
let QUIZ_I=0,QUIZ_GOOD=0,BOATMODE=0;

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
 QUIZ_I=0;QUIZ_GOOD=0;
 renderQuiz();
 $('quiz').hidden=false}
function renderQuiz(){
 const Q=QUIZ[QUIZ_I];
 $('qq').textContent=(QUIZ_I+1)+' of '+QUIZ.length+' — '+Q.q;
 $('qopts').innerHTML=Q.a.map((t,k)=>'<button type="button" class="qopt" data-k="'+k+'">'+t+'</button>').join('');
 $('qmsg').textContent='Sen counts the water in his head. Four right and the boat is yours.'}
function quizAnswer(k){
 const Q=QUIZ[QUIZ_I];
 if(k===Q.ok)QUIZ_GOOD++;
 QUIZ_I++;
 if(QUIZ_I<QUIZ.length){renderQuiz();return}
 const won=QUIZ_GOOD>=4;
 if(won){
  PASS.boatLicense=1;savePass();
  $('qq').textContent='The box clicks open.';
  $('qopts').innerHTML='<p class="qwin">Six questions, '+QUIZ_GOOD+' right. Inside: a brass boat token, warm as a held coal, and a slip of paper that says only: The oars were always yours.</p>';
  $('qmsg').textContent='The pulled-up rowboat by the pond is yours now. Walk to it and take the oars.';
  note('The old fisher nods','“The pond decides who it feeds and who it carries,” Sen says. “It has decided you.”',9000)
 }else{
  $('qq').textContent='The box stays shut.';
  $('qopts').innerHTML='<p class="qlose">'+QUIZ_GOOD+' of 6. The lid does not so much as shiver. Sen studies you for a long moment, then slides the box an inch further across the planks. “Again,” he says, which is Sen for come back when the pond is in you.</p>';
  $('qmsg').textContent='Close and try again — the box is patient.'}}
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
 note('You push off','The hull slides from the grass into the water with a sound like a long held breath. Tap the water or hold WASD to row.',5200)}
