/* ================= THE STORYBOOK =================
   The village is not a gallery of Shounak's work. It is a place with a history, and
   the history is carried by the small things: a bin, a post box, one boot by a door,
   a stopwatch nobody wound. Walk up to one and it tells you a piece.
   Every one of these is a real place in the world with a real position in it.
   ------------------------------------------------------------------ */
const LORE={
 title:'The Koi Pond',
 chapters:[
  {n:'The farm',t:'where it started',s:'A boy took things apart to see how they ran. Every island here is one of those questions, built until somebody could walk through it.'},
  {n:'The village',t:'the work',s:'Twenty one tools, a ticket counter, a ticket that only one person can win. The village is what happens when a question gets a street.'},
  {n:'The sakura isle',t:'what is finished',s:'Five floors for five shipped ideas, and an empty top floor kept for the next one. The lanterns below are the ones still being built.'},
  {n:'The observatory',t:'what is unsolved',s:'Fifty four nights of notes and not one of them says solved. The mirror was ground by hand, because seeing it was the point.'},
  {n:'The harbour',t:'what goes out',s:'A boatyard, a light on the rock, and a fleet of things that were built to leave. The pond is the last stop before the sea.'}],
 ending:'The pond keeps the things that were finished and lets the rest out. Somebody has to go and check that the boats are tied up, and then the whole sky sea is yours to walk.'};

// ---------------------------------------------------------------- the small things
// t: what it is called. s: the one thing it has to say.
const THINGS=[
 {id:'bin',at:[22.2,12.4],t:'The bin by the market',s:'Somebody threw away a printout with a stack trace on it. The stack trace is the interesting part, so it was not the printout that was rubbish.'},
 {id:'postbox',at:[24.6,16.1],t:'The post box',s:'Four letters in it and none of them are for him. That is how a post box is supposed to work.'},
 {id:'bicycle',at:[27.0,16.3],t:'A bicycle with a basket',s:'There is a laptop in the basket with the lid open, and it is still warm. Whoever rode here is inside, typing with one hand.'},
 {id:'boot',at:[19.0,21.0],t:'One boot by the door',s:'A single boot, size small. The other one is not in the world. It is in a repository, probably, being version controlled.'},
 {id:'poster',at:[28.4,14.5],t:'The poster on the stall',s:'A hand-drawn poster for a study group. Eleven names, and one of them has crossed his own name out and written it again smaller.'},
 {id:'donation',at:[30.9,13.8],t:'The donation box',s:'For a local hackathon. Inside: forty rupees, a bus ticket, and a rubber duck with a hat on. The duck is the most valuable thing in there.'},
 {id:'bucket',at:[13.7,12.4],t:'A bucket by the well',s:'The water in it is not for drinking. It is for washing the pigment off your hands, which is what you do after a day of painting a building that does not exist yet.'},
 {id:'radio',at:[15.2,11.0],t:'A radio on a windowsill',s:'It is tuned to a station that stopped broadcasting in March. He leaves it on anyway, for the shape of the room it makes.'},
 {id:'kite',at:[20.4,19.7],t:'A kite in the tree',s:'Someone flew it off the cliff and lost it on the way down. The string is still tied to the branch, so the kite is technically still flying.'},
 {id:'clock',at:[18.1,18.6],t:'The clock by the road',s:'It stopped at 3:40 and nobody has wound it since. The village decided the time is fine like this, and the villagers are late for everything consistently.'},
 {id:'camera',at:[12.4,16.6],t:'A camera on a wall',s:'The last photo on it is the whole village from the bridge, taken before the observatory was built. He keeps it as evidence that the sky used to be empty.'},
 {id:'trolley',at:[10.3,14.3],t:'A shopping trolley',s:'It holds two wheels, a boot, and the parts for a thing nobody has assembled yet. The parts are in the right order, which is the impressive part.'},
 {id:'tyres',at:[18.4,10.3],t:'A stack of tyres',s:'For a tractor that has not been started in a year. The tractor is fine. It just has other things to be doing.'},
 {id:'books',at:[25.5,7.4],t:'Books on a bench',s:'Four of them are the same book. It is the one about time travel, and the fourth one is the copy he gives away when somebody asks about it.'},
 {id:'chair',at:[27.6,12.2],t:'A chair in the road',s:'Placed facing the sunset, which here means facing the far edge of the island and a long drop into the cloud sea. Somebody puts it back every morning.'},
 {id:'chalk',at:[23.0,13.4],t:'Chalk on the cobbles',s:'A game of hopscotch, drawn and then rained on four times. It has been redrawn every morning since. Nobody will admit to doing it.'},
 {id:'crate',at:[20.8,18.4],t:'A crate of oranges',s:'Two crates of oranges and one crate of nothing. The third crate was for the project, and the project turned into the other two.'},
 {id:'lamp',at:[24.2,11.0],t:'The lamp by the market',s:'Repainted four times. Under all four coats of paint there is still the same name on the base, and it is not his.'},
 {id:'boat',at:[24.2,19.6],t:'A boat, pulled up',s:'The oars are inside and the hull is up on the grass. It has been in that position since the sakura isle was built, because a boat in the water cannot be photographed properly.'},
 {id:'cat',at:[11.6,12.2],t:'The cat',s:'It lives by the well and by the bins, and it has been fed by every house in the village. It does not have a name because it does not answer to the ones it has.'},
 {id:'lamppost',at:[16.6,20.6],t:'A lamp with a sticker on it',s:'The sticker says FREE ADVICE. Underneath, in pencil, somebody has written: it is never free, but it is always worth it.'},
 {id:'swing',at:[29.9,17.1],t:'A swing on a tree',s:'Tied with a bootlace. It is the correct length for somebody who used to be eight, which is the age Wren still is.'},
 {id:'map',at:[34.3,22.2],t:'A map nailed to a post',s:'A hand-drawn map of the cloud sea. The uncharted part is crossed out and marked "later", and later is written in a different pen.'},
 {id:'lantern',at:[111.6,17.7],t:'A lantern on the pagoda floor',s:'The one that is still lit. The paper on it says Flux, and the paper is already yellowing at the corners.'},
 {id:'torii',at:[85.7,19.3],t:'The gate on the bridge',s:'You pass under it going east and back under it going west, and it counts you both times. The ledger says it has counted him four hundred times.'},
 {id:'cloth',at:[131.2,25.4],t:'A lens cloth',s:'Left on the rail at the dome, still folded. The mirror is polished every Sunday. Sunday is the only day the sky is not a problem.'},
 {id:'rope',at:[66.8,19.5],t:'A coil of rope on the bridge',s:'Three metres of it, for a job that needed one. The extra two are for the next time, and the next time has been a while coming.'},
 {id:'crane',at:[99.6,57.0],t:'The crane at the yard',s:'It lifts a hull onto the sea twice a year, and it has been used for eleven years, and it has never once been used to lift anything back.'},
 {id:'hull',at:[97.4,60.2],t:'A hull on the stands',s:'There is a name painted on the side in white, and the name is not his. It is the name of the thing it carries, so that whoever receives it knows what they have been sent.'},
 {id:'light',at:[95.0,58.6],t:'The light on the rock',s:'The keeper is a machine and the fuel is a decision. Every evening somebody chooses to light it, for boats that have not been built yet.'},
 {id:'mailbag',at:[99.6,25.6],t:'The postman\'s bag',s:'Juno carries it himself, because the bag weighs almost nothing and the walk is long. There is one letter in it that is not for anybody in this village.'}];

// the same idea, indoors
const ROOMTHINGS={
 mill:[['The whetstone','Sharpened so many times it has become a shape. The groove is his thumb.'],
   ['A jar of nails','Forty one nails, all the same size. Building things out of what is to hand is a policy, not a preference.']],
 workshop:[['A mug with a spoon','The spoon is bent. He bent it on purpose, to reach the bottom of the mug without lifting it, and then he kept bending it.']],
 desk:[['A timetable on the wall','Pinned at an angle, because it was photographed at an angle. The angle is the bug he is proudest of.']],
 barn:[['A saw with no teeth','The teeth were ground off by using it as a screwdriver. It still cuts screws, badly, and he will not replace it.']],
 office:[['A counter, and a list','The list is the seating plan. The last row is crossed out, which means one seat is gone.']],
 sen:[['A tin of hooks','Somebody keeps giving him hooks. He does not fish with them. He keeps them because giving is the point.']],
 bridge:[['A tin of sweets','For whoever is on the bridge at three in the morning. There is always somebody on the bridge at three in the morning.']],
 hermit:[['A ledger on the shelf','Nine pages. Five of them are ideas that were finished. Four are ideas he is still carrying.']],
 lookout:[['A paper plane','It did not fly. It is kept anyway, at the exact angle it left his hand.']],
 shrine:[['An offering of five coins','Somebody put five coins down and then one more, and did not take the sixth back.']],
 post:[['A stack of letters','Nine of them are addressed to the same house, and the postman knows all nine people by name.']],
 pagoda:[['An empty floor','The top floor has been empty for months. It is for the next thing, and that is the most hopeful room in the village.']],
 dome:[['A log book','Fifty four nights of it. Every entry ends with the same word: again.']],
 boathouse:[['A net with one repair in it','The repair is better than the original. He is unreasonably pleased about that.']]};

// ---------------------------------------------------------------- the little props that carry them
function propBin(){
 const c=mk(14,18),x=c.getContext('2d');
 x.fillStyle='#3f5a4a';x.fillRect(1,4,12,13);x.fillStyle='#2f4438';x.fillRect(1,4,12,2);x.fillRect(3,6,2,11);x.fillRect(9,6,2,11);
 x.fillStyle='#54705c';x.fillRect(2,3,10,2);x.fillStyle='#1e2c26';x.fillRect(4,7,6,4);x.fillStyle='#c9b06a';x.fillRect(6,8,2,2);
 return{c,ox:7,oy:17}}
function propBike(){
 const c=mk(22,16),x=c.getContext('2d');
 x.fillStyle='#2a2a2e';x.beginPath();x.arc(4,10,4,0,6.283);x.stroke();x.beginPath();x.arc(17,10,4,0,6.283);x.stroke();
 x.fillStyle='#c04a3a';x.fillRect(5,4,11,2);x.fillRect(9,2,2,6);x.fillStyle='#e8e2d0';x.fillRect(12,6,6,4);
 x.fillStyle='#8a8a92';x.fillRect(6,9,9,1);x.fillStyle='#2a2a2e';x.fillRect(15,3,1,6);
 return{c,ox:11,oy:14}}
function propPost(){
 const c=mk(14,22),x=c.getContext('2d');
 x.fillStyle='#8a3a2a';x.fillRect(2,6,10,14);x.fillStyle='#6e2c20';x.fillRect(2,6,10,2);x.fillRect(9,8,3,12);
 x.fillStyle='#3a2a24';x.fillRect(4,9,6,2);x.fillStyle='#c9b06a';x.fillRect(6,11,2,1);
 x.fillStyle='#5a4438';x.fillRect(6,0,2,7);
 return{c,ox:7,oy:20}}
function propPoster(){
 const c=mk(16,18),x=c.getContext('2d');
 x.fillStyle='#d8cdb0';x.fillRect(1,1,14,16);x.fillStyle='#b0a488';x.fillRect(1,1,14,1);
 x.fillStyle='#8a4a3a';x.fillRect(3,4,10,3);
 x.fillStyle='#4a4038';for(let i=0;i<4;i++)x.fillRect(3,9+i*2,8-i,1);
 x.fillStyle='#3a5a7a';x.fillRect(9,12,4,1);
 return{c,ox:8,oy:17}}
function propDonation(){
 const c=mk(14,16),x=c.getContext('2d');
 x.fillStyle='#4a6a8a';x.fillRect(1,3,12,12);x.fillStyle='#37536d';x.fillRect(1,3,12,2);
 x.fillStyle='#e8c87a';x.fillRect(3,7,8,4);x.fillStyle='#3a3020';x.fillRect(5,9,4,1);
 x.fillStyle='#c04a3a';x.fillRect(6,1,2,3);
 return{c,ox:7,oy:15}}
function propBucket(){
 const c=mk(12,14),x=c.getContext('2d');
 x.fillStyle='#6a7a82';x.fillRect(2,4,8,9);x.fillStyle='#54646c';x.fillRect(2,4,8,1);
 x.fillStyle='#8a9aa2';x.fillRect(1,3,10,2);x.fillStyle='#3f5a6a';x.fillRect(3,6,6,1);
 x.fillStyle='#9aa8ae';x.fillRect(5,0,2,5);
 return{c,ox:6,oy:13}}
function propRadio(){
 const c=mk(14,12),x=c.getContext('2d');
 x.fillStyle='#7a5a34';x.fillRect(1,2,12,9);x.fillStyle='#5a4024';x.fillRect(1,9,12,2);
 x.fillStyle='#2a3a30';x.fillRect(3,4,5,4);x.fillStyle='#c9b06a';x.fillRect(10,4,2,2);x.fillRect(10,8,2,1);
 x.fillStyle='#9aa8ae';x.fillRect(6,0,1,3);
 return{c,ox:7,oy:11}}
function propKite(){
 const c=mk(12,16),x=c.getContext('2d');
 x.fillStyle='#d8503a';x.fillRect(3,1,6,6);x.fillStyle='#f0d060';x.fillRect(3,4,6,2);x.fillStyle='#3a7ab0';x.fillRect(5,1,2,6);
 x.fillStyle='#e8e2d0';x.fillRect(5,7,2,1);x.fillRect(4,9,1,1);x.fillRect(6,11,1,1);x.fillRect(5,13,1,1);
 return{c,ox:6,oy:14}}
function propClock(){
 const c=mk(12,12),x=c.getContext('2d');
 x.fillStyle='#c8b48c';x.fillRect(1,1,10,10);x.fillStyle='#8a7a58';x.fillRect(1,1,10,1);x.fillRect(1,10,10,1);
 x.fillStyle='#3a3028';x.fillRect(5,5,1,3);x.fillRect(6,4,3,1);
 return{c,ox:6,oy:11}}
function propCamera(){
 const c=mk(14,10),x=c.getContext('2d');
 x.fillStyle='#3a3a40';x.fillRect(1,2,12,7);x.fillStyle='#54545c';x.fillRect(1,2,12,1);
 x.fillStyle='#8a9aa8';x.fillRect(5,3,4,4);x.fillStyle='#2a2a30';x.fillRect(6,4,2,2);
 x.fillStyle='#c9b06a';x.fillRect(2,3,2,1);
 return{c,ox:7,oy:9}}
function propTyres(){
 const c=mk(16,14),x=c.getContext('2d');
 x.fillStyle='#22222a';for(let i=0;i<3;i++){x.beginPath();x.ellipse(8,10-i*4,6,2.2,0,0,6.283);x.fill()}
 x.fillStyle='#33333c';for(let i=0;i<3;i++){x.beginPath();x.ellipse(8,9-i*4,3,1.1,0,0,6.283);x.fill()}
 return{c,ox:8,oy:12}}
function propMailbag(){
 const c=mk(12,14),x=c.getContext('2d');
 x.fillStyle='#7a5a34';x.fillRect(2,3,8,10);x.fillStyle='#5c4326';x.fillRect(2,3,8,2);
 x.fillStyle='#3a3028';x.fillRect(5,6,2,5);x.fillStyle='#9aa8ae';x.fillRect(4,1,4,3);
 return{c,ox:6,oy:13}}

// which sprite goes with which thing
const THINGART={bin:propBin,bicycle:propBike,postbox:propPost,poster:propPoster,donation:propDonation,
 bucket:propBucket,radio:propRadio,kite:propKite,clock:propClock,camera:propCamera,tyres:propTyres,mailbag:propMailbag};

// ---------------------------------------------------------------- putting them in the world
function buildThings(){
 for(const th of THINGS){
  const art=THINGART[th.id];
  if(art){const sp=art();sp.sol=3;put(th.at[0],th.at[1],sp,0,.01);th.x=th.at[0];th.y=th.at[1]}
 }
}

// ---------------------------------------------------------------- finding one
function thingNear(){
 if(MODE!=='explore'||!PL)return null;
 for(const th of THINGS){
  const dx=16*((PL.P.a-th.at[0])-(PL.P.b-th.at[1])),dy=8*((PL.P.a-th.at[0])+(PL.P.b-th.at[1]));
  if(Math.hypot(dx,dy)<17)return th}
 return null}
function thingUse(th){
 if(!th)return;
 note(th.t,th.s,9000)}
