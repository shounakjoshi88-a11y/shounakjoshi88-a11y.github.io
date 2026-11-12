/* ================= THE ROOMS BEHIND THE DOORS =================
   Some of the houses open. You walk up, you knock, and you go in: a room with a floor,
   a window onto the sky sea, the person who lives there and one thing worth taking.
   A few doors stay shut until the pond has told you enough to be let in.
   ------------------------------------------------------------------ */
const ROOMS={
 mill:{name:'The mill room',owner:'Teru',wall:'#6d5a3a',floor:'#8a7350',accent:'#c9a25a',
  lines:['The wheel turns because you turn it. Everything else here was built the same way, one afternoon at a time.',
   'Fifty four attempts at P versus NP are stacked in that corner. Most of them ended in no. I still start the next one.',
   'Take the first page if you like. It is the day the sky-sea was empty and a boy stacked a stone on a cloud and called it a village.'],
  item:['The first page','Day one. The sky-sea was empty, and he stacked a stone on a cloud because a question would not leave him alone.'],
  furn:[['grind',78,126],['shelf',196,92],['crate',44,150],['hay',250,140]],
  ox:196,oy:126,ix:78,iy:112},
 workshop:{name:"The miller's workshop",owner:'Mira',wall:'#4a5a63',floor:'#7a6a54',accent:'#9fc6b2',
  lines:['Twenty one tools, and behind every one of them a plan, an execute, a verify and a retry. That is the whole shape of Flux.',
   'The vector memory re-injects itself, so one bad extraction can poison every later answer. He caught that himself, which is the part worth knowing.',
   'The dream was always an Indian answer to Claude and Perplexity, where the platform is the product and the model is a plug.'],
  item:['A plan for a verifier','A sheet of paper with one sentence on it: the thing that says no is the thing that matters.'],
  lock:{need:['cart']},lockMsg:'Mira keeps her door shut. "Not until you have seen the jugaad cart. Then we can talk about the mill."',
  furn:[['desk',84,124],['books',210,96],['crate',36,152],['lamp',252,112]],
  ox:96,oy:124,ix:84,iy:112},
 barn:{name:'The tool barn',owner:'Mira',wall:'#5a4a32',floor:'#7d6a4e',accent:'#d0a860',
  lines:['Everything in here cost nothing. That was not a virtue, it was a budget of exactly zero.',
   'A jugaad cart, a hand drill, and a soldering iron with a wooden handle he turned out of a fence post.',
   'The rule he lives by: build with what you have, check what you built, and never trust a thing you have not broken once.'],
  item:['A hand drill with a fence post handle','The bit is slightly off-centre. It still drills straight, which he says is the point.'],
  furn:[['crates',96,132],['hay',210,142],['barrel',44,152],['lamp',252,104]],
  ox:150,oy:112,ix:96,iy:120},
 desk:{name:"The student's desk",owner:'Pip',wall:'#4a5a63',floor:'#7a6a54',accent:'#9fc6b2',
  lines:['I photograph the timetable before class so I never have to look at it again.',
   'On-device OCR reads it back even when it is blurry or sideways. The noise never becomes a lecture.',
   'It is a small app and I use it every single day. That is the whole review.'],
  item:['A photographed timetable','Somebody handed me a crooked photo of a timetable and expected a human to read it. Now the phone does it badly, and then I do it properly.'],
  furn:[['desk',84,124],['books',210,96],['crate',36,152],['lamp',252,112]],
  ox:96,oy:104,ix:84,iy:112},
 office:{name:'The ticket office',owner:'Oro',wall:'#5a4638',floor:'#7d6a58',accent:'#e0b070',
  lines:['A thousand people reach for the last seat. Exactly one of them gets it, and it is never luck.',
   'Serialisable transactions, row locking, and one live counter that everybody trusts. The boring parts are the whole thing.',
   'The Android build ships too. People hold the ticket in the same hand they hold the keys.'],
  item:['A counter with one seat left','It is not a metaphor. It is a row, a lock, and a counter that would not let two people have the same seat.'],
  furn:[['counter',120,120],['letters',60,132],['shelf',246,98],['barrel',40,152]],
  ox:140,oy:110,ix:120,iy:108},
 sen:{name:"Sen's cottage",owner:'Sen',wall:'#4c5f52',floor:'#6f6a52',accent:'#8fc4a8',
  lines:['Three fish in this pond and every one of them is a liar about the weather.',
   'Between the rows I fish, and between the arguments I am a second year at Ramdeobaba, and I run a collective across eight colleges.',
   'Sekiro five times. Not because it is easy. Because it is the only fight that ever asked me a question I could not answer.'],
  item:['A net with one repair in it','The repair is better than the original. He is unreasonably pleased about that.'],
  furn:[['nets',64,118],['barrel',120,142],['crates',210,150],['shelf',250,96]],
  ox:70,oy:112,ix:120,iy:130},
 bridge:{name:"The bridge keeper's room",owner:'Kiri',wall:'#3f4a58',floor:'#6b6252',accent:'#a8bcd8',
  lines:['I keep the light on the bridge and I keep the ledger of who crossed it.',
   'Security is the long road. SC-900 is done, the network work is going, JNCIA is next after that.',
   'The village told you its story? Then you can come in. I do not let strangers into the lantern room.'],
  item:['A page from the night ledger','Every night: who crossed, who waited, and what was still humming when the lamp went out.'],
  lock:{quest:'village'},lockMsg:'Kiri has the door barred. "Not until the village has told you its whole story."',
  furn:[['shelf',64,100],['counter',150,126],['lamp',240,104],['crate',46,150]],
  ox:62,oy:128,ix:150,iy:114},
 hermit:{name:"The hermit's house",owner:'The hermit',wall:'#4a4a38',floor:'#6a6248',accent:'#b8c49a',
  lines:['The ledger is not a diary. It is a list of things that were finished, so that nothing gets lost.',
   'A thing finished is a thing that can leave. That is why the mill turns without him now, and the ticket counter holds.',
   'Day one, the sky-sea was empty. Day fifty four, he is still asking. I keep the dates so somebody can see the distance.'],
  item:['The ledger','Nine pages. Five of them are ideas that were finished. Four are ideas he is still carrying.'],
  lock:{need:['hermit']},lockMsg:'The hermit keeps the ledger. You have to find his house first.',
  furn:[['shelf',70,104],['desk',210,126],['lamp',246,100],['crate',42,152]],
  ox:70,oy:126,ix:210,iy:114},
 lookout:{name:'The lookout hut',owner:'Kiri',wall:'#3f4a58',floor:'#6b6252',accent:'#a8bcd8',
  lines:['From up here you can see the whole sky sea, and the whole argument about whether today is really the day.',
   'Philosophy, cosmology, and whether the models are real AI. It happens up here, mostly with himself.',
   'He argued with a university professor about it once, politely, for three hours, and then wrote it all down.'],
  item:['A page of notes on the sky','Half the page is a definition. The other half is a question he has not closed yet.'],
  furn:[['scope',120,116],['desk',220,132],['books',52,100],['crate',262,152]],
  ox:78,oy:120,ix:220,iy:120},
 shrine:{name:'The shrine room',owner:'The shrine',wall:'#5a4438',floor:'#6f6152',accent:'#e8c07a',
  lines:['Five Sekiro clears and two Ghost of Tsushima runs. He likes a hard fight he can learn his way through.',
   'There is no priest here. There is a bell, an offering bowl, and the count of how many times he came up here to think.'],
  item:['An offering of five coins','Somebody put five coins down and then one more, and did not take the sixth back.'],
  furn:[['counter',120,120],['lamp',240,104],['books',52,100],['rug',160,146]],
  ox:150,oy:118,ix:120,iy:108},
 post:{name:'The post office',owner:'Juno',wall:'#5a4038',floor:'#7d6a58',accent:'#e0b070',
  lines:['Last stop on the road, and the door is never locked. That is the whole policy.',
   'Inside there are letters from people who want to build something with him, and a few who want to tell him he is doing it wrong.',
   'He reads all of them. He even answers the wrong ones. Send one and it will land here.'],
  item:['A letter with a return address','shounakjoshi88@gmail.com, written on the back in a hurry: if you got this far, you were meant to.'],
  furn:[['counter',120,120],['letters',60,132],['shelf',246,98],['barrel',40,152]],
  ox:140,oy:110,ix:120,iy:108},
 pagoda:{name:'The pagoda of finished things',owner:'Juno',wall:'#5a4038',floor:'#7d6a58',accent:'#e0b070',
  lines:['Five floors for five shipped ideas. The lanterns below are the ones still being built.',
   'The top floor is empty on purpose. It is for the next thing, and it has been empty for months, and that is fine.',
   'Every lantern on the ground floor has a name on it. Nobody is supposed to read them out loud.'],
  item:['A lantern with a name on it','Flux. The paper is already yellowing at the corners.'],
  furn:[['counter',120,120],['letters',60,132],['shelf',246,98],['lamp',252,112]],
  ox:140,oy:110,ix:120,iy:108},
 dome:{name:'The observatory',owner:'Nao',wall:'#3c4a52',floor:'#5f6a72',accent:'#bcd0e0',
  lines:['He ground the mirror by hand and wrote the mount from scratch, because he wanted to see the thing rather than configure somebody else view of it.',
   'Fifty four nights of notes are stacked under the eyepiece. Not one of them says solved.',
   'The shutter is down because the sky is not finished. You cannot rush a thing that only shows up when you are not looking.'],
  item:['Experiment fifty five','A blank page with the date on it. The hundredth one is still out there somewhere.'],
  lock:{quest:'sky'},lockMsg:'The dome is shuttered. Nao opens it when the sky has told you something first.',
  furn:[['scope',120,116],['desk',220,132],['books',52,100],['crate',262,152]],
  ox:78,oy:120,ix:220,iy:120},
 boathouse:{name:'The boathouse',owner:'Sen',wall:'#4c5f52',floor:'#6f6a52',accent:'#8fc4a8',
  lines:['Three koi in this pond and every one of them is a liar about the weather.',
   'You have to stand still and let the line go slack. That is the whole trick and nobody tells you.',
   'There is a golden one, once in a while. It only comes for people who have listened to the villagers first.'],
  item:['A koi scale','Hard, orange, and warm. Mizu says it is lucky, which is the koi version of saying nothing.'],
  lock:{fish:2},lockMsg:'The door is shut against the weather. Sen says come back when you have caught something.',
  furn:[['nets',64,118],['barrel',120,142],['crates',210,150],['shelf',250,96]],
  ox:70,oy:112,ix:120,iy:130},
 north1:{name:'The northern cottage',item:['A cup gone cold','Two hours cold, by the look of it. Somebody was here and thought they would be back.']},
 north2:{name:'The east cottage',item:['A chair pulled out','The other cup has been washed. This one has not, and the chair is still pulled out.']},
 market1:{name:'The market cottage',item:['A price list','Most of it is in pencil, and most of the pencil has been rubbed out and written again.']},
 market2:{name:'The orchard cottage',item:['A jar of something','Unlabelled. It smells of apples and of a stove that has been on all night.']},
 east1:{name:'The far cottage',item:['A map with a corner torn off','The torn corner is the part where the observatory should be.']},
 south1:{name:'The snow cottage',item:['A pair of wet boots','Left by the door, still damp, facing the wrong way for the road.']},
 south2:{name:'The southern cottage',item:['A book left face down','Face down, on the page about P versus NP. It is the page somebody keeps rereading.']},
 south3:{name:'The west cottage',item:['A list of things to fix','Nine items. The last three have been crossed out and written again underneath.']},
 south4:{name:'The last cottage',item:['A bell on the table','A hand bell, for calling somebody in from the field. The clapper has been taken out.']}};

// the houses with nobody in them still get a name, a look and one thing left on the table
const HOMEKIT={wall:'#5a4a3a',floor:'#7a6a54',accent:'#c9a25a',ox:120,oy:116,ix:100,iy:112,
 furn:[['table',90,126],['bed',230,120],['crate',40,152],['shelf',250,96],['lamp',262,104]]};
for(const k in ROOMS)if(!ROOMS[k].furn)ROOMS[k]=Object.assign({},HOMEKIT,ROOMS[k]);

// the doors: where they are, which room is behind them, and what keeps them shut
const DOORS=[
 {id:'mill',house:[8.6,4.4],off:[0,1.15],room:'mill'},
 {id:'workshop',house:[11.8,7.6],off:[-0.41,1.5],room:'workshop'},
 {id:'desk',house:[14.2,11.8],off:[-0.41,1.5],room:'desk'},
 {id:'barn',house:[19.8,9.5],off:[-0.41,1.5],room:'barn'},
 {id:'north1',house:[22.4,3.8],off:[-0.41,1.5],room:'north1'},
 {id:'north2',house:[28.2,3.6],off:[-0.41,1.5],room:'north2'},
 {id:'market1',house:[23.2,10.8],off:[-0.41,1.5],room:'market1'},
 {id:'market2',house:[29.6,11.0],off:[-0.41,1.5],room:'market2'},
 {id:'office',house:[23.0,15.0],off:[-0.41,1.5],room:'office'},
 {id:'east1',house:[30.2,15.2],off:[-0.41,1.5],room:'east1'},
 {id:'sen',house:[17.6,26.0],off:[-0.41,1.5],room:'sen'},
 {id:'south1',house:[9.6,22.4],off:[-0.41,1.5],room:'south1'},
 {id:'south2',house:[16.8,30.4],off:[-0.41,1.5],room:'south2'},
 {id:'south3',house:[9.0,28.8],off:[-0.41,1.5],room:'south3'},
 {id:'south4',house:[11.8,35.2],off:[-0.41,1.5],room:'south4'},
 {id:'bridge',house:[34.9,21.4],off:[-0.41,1.5],room:'bridge'},
 {id:'boathouse',house:[19.4,21.8],off:[0,1.35],room:'boathouse'},
 {id:'shrine',house:[34.4,10.8],off:[0,1.2],room:'shrine'},
 {id:'lookout',house:[35.6,40.2],off:[0,1.3],room:'lookout'},
 {id:'hermit',house:[51.0,15.6],off:[0,1.2],room:'hermit'},
 {id:'post',house:[91.5,33],off:[-0.41,1.5],room:'post'},
 {id:'pagoda',house:[111,17],off:[0,1.4],room:'pagoda'},
 {id:'dome',house:[133.0,27.0],off:[0,1.5],room:'dome'}];

let ROOM=null,RMX=0,RMY=0,RMTX=0,RMTY=0,RMGOAL=null,RMTAKE=0;
const RCTX=document.getElementById('rmcv').getContext('2d');
const RMW=320,RMH=180;

// ---- the small things inside a room: the same idea, in a smaller space
const THPOS=[[172,92],[58,140],[246,140]];
let RMREAD={};
function rmThings(){return (typeof ROOMTHINGS!=='undefined'&&ROOMTHINGS[ROOM])||[]}

// ---- the little furniture of a room
function furnDraw(g,k,x,y){
 const px=(w,h,col)=>{g.fillStyle=col};
 switch(k){
  case 'table': px(0,0,'#5b452c');g.fillRect(x-24,y-4,48,5);g.fillRect(x-22,y+1,3,9);g.fillRect(x+19,y+1,3,9);g.fillStyle='#8a6a42';g.fillRect(x-24,y-4,48,2);break;
  case 'desk': px(0,0,'#5b452c');g.fillRect(x-22,y-4,44,5);g.fillRect(x-20,y+1,3,9);g.fillRect(x+17,y+1,3,9);
   g.fillStyle='#efe6cc';g.fillRect(x-12,y-9,16,11);g.fillStyle='#cfc4a4';g.fillRect(x-12,y-9,16,1);break;
  case 'shelf': px(0,0,'#4a3524');g.fillRect(x-18,y-38,36,38);g.fillStyle='#33241a';g.fillRect(x-15,y-35,30,32);
   for(let i=0;i<3;i++){g.fillStyle=['#8a4a3a','#3a5a6a','#6a6a3a'][i];g.fillRect(x-13,y-33+i*10,7,8);g.fillStyle=['#a06a4a','#4a6a7a','#8a8a5a'][i];g.fillRect(x-4,y-33+i*10,6,8);g.fillStyle=['#7a5a3a','#3a4a5a','#5a5a4a'][i];g.fillRect(x+4,y-33+i*10,6,8)}
   g.fillStyle='#4a3524';g.fillRect(x-18,y-20,36,2);break;
  case 'books': px(0,0,'#4a3524');g.fillRect(x-16,y-30,32,30);g.fillStyle='#33241a';g.fillRect(x-13,y-27,26,24);
   for(let i=0;i<4;i++){g.fillStyle=['#8a4a3a','#3a5a6a','#6a6a3a','#7a5a3a'][i];g.fillRect(x-11+i*6,y-25,5,20)}break;
  case 'counter': px(0,0,'#4e3a26');g.fillRect(x-26,y-2,52,6);g.fillStyle='#6b5136';g.fillRect(x-26,y-2,52,2);g.fillStyle='#3a2a1c';g.fillRect(x-24,y+4,48,8);break;
  case 'letters': px(0,0,'#e8dfc4');g.fillRect(x-14,y-6,28,9);g.fillStyle='#c8bb9a';g.fillRect(x-14,y-6,28,1);g.fillStyle='#a03a2a';g.fillRect(x-12,y-3,3,3);break;
  case 'bed': px(0,0,'#6b4a3a');g.fillRect(x-26,y-10,52,20);g.fillStyle='#c8b894';g.fillRect(x-24,y-8,48,16);g.fillStyle='#e6dcc0';g.fillRect(x-20,y-6,14,12);break;
  case 'stove': px(0,0,'#4a4a4a');g.fillRect(x-12,y-20,24,24);g.fillStyle='#2a2a2a';g.fillRect(x-7,y-14,14,10);g.fillStyle='#ff9a3c';g.fillRect(x-5,y-10,10,3);break;
  case 'grind': px(0,0,'#6a6a66');g.beginPath();g.arc(x,y-8,11,0,6.283);g.fill();g.fillStyle='#8a8a84';g.beginPath();g.arc(x-2,y-10,8,0,6.283);g.fill();
   g.fillStyle='#4a3524';g.fillRect(x-3,y-4,6,12);break;
  case 'nets': px(0,0,'#6a5a3a');g.fillRect(x-18,y-16,36,3);g.fillRect(x-14,y-6,28,3);g.fillStyle='#9a8a64';
   for(let i=0;i<7;i++)g.fillRect(x-18+i*5,y-13,1,10);for(let i=0;i<5;i++)g.fillRect(x-14+i*7,y-3,1,6);break;
  case 'scope': px(0,0,'#6a5a3a');g.fillRect(x-2,y-16,4,22);g.fillRect(x-12,y+4,24,4);
   g.fillStyle='#3a4a58';g.fillRect(x-16,y-28,30,9);g.fillStyle='#8aa0b0';g.fillRect(x-16,y-28,30,2);break;
  case 'crate': px(0,0,'#7a5a34');g.fillRect(x-12,y-12,24,14);g.fillStyle='#5b4527';g.fillRect(x-12,y-5,24,2);g.fillRect(x-4,y-12,2,14);break;
  case 'barrel': px(0,0,'#6a4a2a');g.fillRect(x-9,y-16,18,18);g.fillStyle='#8a6a3a';g.fillRect(x-9,y-16,18,2);g.fillRect(x-9,y-7,18,2);break;
  case 'hay': px(0,0,'#c8a44a');g.fillRect(x-16,y-10,32,12);g.fillStyle='#a8883a';g.fillRect(x-16,y-4,32,2);break;
  case 'lamp': px(0,0,'#4a4a4a');g.fillRect(x-2,y-16,3,18);g.fillStyle='#ffd27a';g.fillRect(x-6,y-24,11,9);g.fillStyle='#fff0c0';g.fillRect(x-4,y-22,7,5);break;
  case 'rug': px(0,0,'#7a3a3a');g.fillRect(x-30,y-8,60,16);g.fillStyle='#a05440';g.fillRect(x-26,y-6,52,12);break}}

// ---- a person standing in a room
function rmPerson(g,sp,x,y){
 g.fillStyle='rgba(10,20,16,.32)';g.beginPath();g.ellipse(x,y-1,4.5,1.8,0,0,6.283);g.fill();
 if(sp&&sp.c)g.drawImage(sp.c,Math.round(x-sp.ox),Math.round(y-sp.oy))}

// ---- the room state
function roomOpen(id){
 const R=ROOMS[id];if(!R)return;
 ROOM=id;MODE='room';RMTX=RMTY=0;RMTAKE=PASS.rooms&&PASS.rooms[id]?1:0;
 const sp=villager(CH.find(c=>c.name===R.owner).pal,0,'front');
 ROOMSP={owner:sp};
 $('rmname').textContent=R.name;
 $('rmcv').style.width='100%';
 $('rmcard').innerHTML='';$('rmhint').textContent='';
 $('room').hidden=false;
 const p=PL.P;RMX=160;RMY=158;
}
function roomShut(){
 ROOM=null;MODE='explore';$('room').hidden=true;
 const d=DOORS.find(x=>x.id===lastDoor);
 if(d)note(Rooms_[d.room].name,'You step back out into the village.');
}
const Rooms_=ROOMS;
function roomTick(dt){
 if(!ROOM)return;
 const R=ROOMS[ROOM];
 // walking
 let dx=0,dy=0;
 if(RKEYS.w||RKEYS.arrowup)dy-=1;
 if(RKEYS.s||RKEYS.arrowdown)dy+=1;
 if(RKEYS.a||RKEYS.arrowleft)dx-=1;
 if(RKEYS.d||RKEYS.arrowright)dx+=1;
 if(dx||dy)RMGOAL=null;
 else if(RMGOAL){dx=RMGOAL[0]-RMX;dy=RMGOAL[1]-RMY;if(Math.hypot(dx,dy)<3){RMGOAL=null;dx=dy=0}}
 const L=Math.hypot(dx,dy);
 if(L>0){dx/=L;dy/=L;RMX=Math.max(14,Math.min(RMW-14,RMX+dx*62*dt));RMY=Math.max(64,Math.min(RMH-12,RMY+dy*62*dt))}
 // the owner, and the one thing worth taking
 const ox=R.ox||120,oy=R.oy||110,ix=R.ix||100,iy=R.iy||112;
 if(!RMTAKE&&Math.hypot(RMX-ix,RMY-iy)<16){
  RMTAKE=1;PASS.rooms=PASS.rooms||{};PASS.rooms[ROOM]=1;savePass();
  $('rmcard').innerHTML='<span class="who">You take it</span>'+R.item[1];
  $('rmhint').textContent='The owner watches you put it away.';
  checkProgress();
 }else if(R.owner&&!RMTALK&&Math.hypot(RMX-ox,RMY-oy)<24){
  RMTALK=1;$('rmcard').innerHTML='<span class="who">'+R.owner+'</span>'+R.lines[0];
  $('rmhint').textContent='Tap the card to keep listening.';
 }else if(RMTALK&&RMGOAL===null&&Math.hypot(RMX-ox,RMY-oy)>40&&R.owner){
  RMTALK=0;$('rmcard').innerHTML='';
 }
 // the door out
 if(Math.hypot(RMX-30,RMY-166)<16){roomShut();return}
 roomDraw(ox,oy,ix,iy);
}
let RMTALK=0;
function roomDraw(ox,oy,ix,iy){
 const g=RCTX,R=ROOMS[ROOM];
 g.clearRect(0,0,RMW,RMH);
 // the wall and the floor
 g.fillStyle=R.wall;g.fillRect(0,0,RMW,46);
 g.fillStyle='rgba(0,0,0,.16)';g.fillRect(0,40,RMW,6);
 g.fillStyle=R.floor;g.fillRect(0,46,RMW,RMH-46);
 g.fillStyle='rgba(0,0,0,.1)';
 for(let y=46;y<RMH;y+=8)g.fillRect(0,y,RMW,1);
 g.fillStyle='rgba(255,255,255,.05)';g.fillRect(0,46,RMW,4);
 // a window with the sky sea outside
 g.fillStyle='#3a2c1e';g.fillRect(196,10,44,28);
 g.fillStyle='#7fa8c8';g.fillRect(199,13,38,22);
 g.fillStyle='#cfe2ee';g.fillRect(199,13,38,6);
 g.fillStyle='#2a3a44';g.fillRect(199,25,38,10);
 g.fillStyle='#3a2c1e';g.fillRect(216,10,3,28);g.fillRect(196,22,44,3);
 // a picture on the wall, and the skirting board
 g.fillStyle='#3a2c1e';g.fillRect(54,12,26,20);
 g.fillStyle='#6d8a86';g.fillRect(57,15,20,14);
 g.fillStyle='#c9b083';g.fillRect(59,24,10,4);g.fillRect(70,18,4,10);
 g.fillStyle='rgba(0,0,0,.22)';g.fillRect(0,40,RMW,6);
 g.fillStyle='rgba(0,0,0,.16)';g.fillRect(0,46,RMW,2);
 // the lamp light falls on the wall and pools on the floor
 let lg=g.createRadialGradient(250,26,2,250,26,150);
 lg.addColorStop(0,'rgba(255,214,140,.20)');lg.addColorStop(1,'rgba(255,214,140,0)');
 g.fillStyle=lg;g.fillRect(0,0,RMW,RMH);
 // the furniture
 for(const f of R.furn)furnDraw(g,f[0],f[1],f[2]);
 // the rug under the middle
 furnDraw(g,'rug',160,140);
 // the owner and the player
 rmPerson(g,ROOMSP.owner,ox,oy);
 const P=PL.P,pose=Math.abs(P.vx)>.1?'side':'front';
 rmPerson(g,P.spr[pose][P.mvg?(P.anim|0)%2:0],RMX,RMY);
 // the small things, waiting to be looked at
 const list=rmThings();
 for(let i=0;i<list.length;i++){const p=THPOS[i%THPOS.length];
  if(RMREAD[ROOM+i])continue;
  const ig=g.createRadialGradient(p[0],p[1]-3,1,p[0],p[1]-3,9);
  ig.addColorStop(0,'rgba(255,240,200,.5)');ig.addColorStop(1,'rgba(255,240,200,0)');
  g.fillStyle=ig;g.fillRect(p[0]-9,p[1]-12,18,18);
  g.fillStyle='#fff2c0';g.fillRect(p[0]-1,p[1]-5,2,2)}
 // the thing worth taking
 if(!RMTAKE){const ig=g.createRadialGradient(ix,iy-7,1,ix,iy-7,14);
   ig.addColorStop(0,'rgba(255,233,168,.55)');ig.addColorStop(1,'rgba(255,233,168,0)');
   g.fillStyle=ig;g.fillRect(ix-14,iy-21,28,28);
   g.fillStyle='#fff2c0';g.fillRect(ix-3,iy-10,6,5);g.fillStyle='#c9a25a';g.fillRect(ix-3,iy-5,6,2)}
 // the door out
 g.fillStyle='#4a3524';g.fillRect(18,150,24,30);g.fillStyle='#6a4a2a';g.fillRect(18,150,24,3);
 g.fillStyle='#e8c87a';g.fillRect(37,166,2,2);
 g.fillStyle='rgba(255,240,200,.75)';g.font='700 8px monospace';g.textAlign='left';g.fillText('OUT',20,146);
}

// ---- the doors in the world
let lastDoor=null,DOORAT=null;
function doorList(){
 DOORAT=DOORS.map(d=>{const p=nearWalk(d.house[0]+d.off[0],d.house[1]+d.off[1]);return {d,a:p[0],b:p[1]}});
}
function doorLock(d){
 const R=ROOMS[d.room],L=d.lock||R.lock,msg=d.lockMsg||R.lockMsg;
 if(L&&L.quest&&!PASS.quests.includes(L.quest))return msg||'Not yet.';
 if(L&&L.need&&!L.need.every(hasSecret))return msg||'Not yet.';
 if(L&&L.fish&&PASS.caught.length<L.fish)return msg||'Not yet.';
 return null}
function doorNear(){
 if(MODE!=='explore'||!PL||!DOORAT)return null;
 for(const e of DOORAT){if(Math.hypot(PL.P.a-e.a,PL.P.b-e.b)<.95)return e}
 return null}
function doorUse(e){
 if(!e)return;
 const lock=doorLock(e.d);
 if(lock){note('The door is shut',lock,5200);return}
 lastDoor=e.d.id;roomOpen(e.d.room)}

// ---- the hint that sits under the player
const RKEYS={};
addEventListener('keydown',e=>{
 if(MODE!=='room')return;
 const k=e.key.toLowerCase();
 if(k==='escape'){roomShut();return}
 if(k.startsWith('arrow'))e.preventDefault();
 RKEYS[k]=1});
addEventListener('keyup',e=>{RKEYS[e.key.toLowerCase()]=0});
addEventListener('blur',()=>{for(const k in RKEYS)RKEYS[k]=0});
$('rmcv').addEventListener('pointerdown',e=>{
 const r=$('rmcv').getBoundingClientRect();
 const mx=(e.clientX-r.left)/r.width*RMW,my=(e.clientY-r.top)/r.height*RMH;
 const list=rmThings();
 for(let i=0;i<list.length;i++){
  if(RMREAD[ROOM+i])continue;
  const p=THPOS[i%THPOS.length];
  if(Math.hypot(mx-p[0],my-p[1])<15){
   RMREAD[ROOM+i]=1;
   $('rmcard').innerHTML='<span class="who">'+list[i][0]+'</span>'+list[i][1];
   $('rmhint').textContent='Tap the card to keep looking.';
   return}}
 RMGOAL=[mx,my];
});
$('rmcard').addEventListener('click',()=>{
 if(!ROOM)return;
 const R=ROOMS[ROOM];
 if(RMTALK&&R.lines&&RMTALK<R.lines.length){RMTALK++;$('rmcard').innerHTML='<span class="who">'+R.owner+'</span>'+R.lines[RMTALK-1];$('rmhint').textContent=RMTALK<R.lines.length?'Tap to keep listening.':'That is all there is to say.'}
});
$('rmclose').onclick=roomShut;
$('hint').onclick=()=>{
 if(MODE==='room')return;
 const e=doorNear();
 if(e){doorUse(e);return}
 const th=typeof thingNear==='function'?thingNear():null;
 if(th){thingUse(th);return}
 if(typeof anglingUse==='function')anglingUse();
};
