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
  furn:[['crate',96,132],['hay',210,142],['barrel',44,152],['lamp',252,104]],
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
 mess:{name:'The mess',owner:'Olen',wall:'#4a4436',floor:'#7d7560',accent:'#e0b070',
  lines:['Forty beds, one kettle, no complaining. The keep feeds people who show up.',
   'I was not in the charge that broke the north gate. I was the one who made breakfast the next morning. That is the job.',
   'Eat. Count to fifty four. If you can still stand, the yard wants you at dawn.'],
  item:['A whetstone with one good edge left','Fifty four edges worn off it, one at a time, all of them counted.'],
  furn:[['counter',120,120],['barrel',60,140],['crate',246,150],['shelf',248,94],['lamp',240,100],['hay',64,150],['rug',160,146]],
  ox:96,oy:118,ix:120,iy:116},
 library:{name:'The library tower',owner:'Nara',wall:'#3c4a52',floor:'#5f6a72',accent:'#bcd0e0',
  lines:['Every finished thing gets a page. The page is how the pond remembers without having to say it out loud.',
   'Fifty four shelves, fifty four questions. The last shelf is for the one that does not exist yet.',
   'Read quietly. The pond hears everything, but it appreciates good manners.'],
  item:['A page with a corner turned down','The corner is turned down on the problem of P versus NP. Nobody has turned it back.'],
  furn:[['books',56,96],['shelf',246,92],['desk',160,120],['lamp',238,102],['crate',250,150],['tome',160,108]],
  ox:96,oy:120,ix:160,iy:114},
 smithy:{name:'The smithy',owner:'Tam',wall:'#4a3830',floor:'#6f5a4c',accent:'#e8963c',
  lines:['I make the hinges. A door that sticks is a promise broken early.',
   'Everything on this rock swings straight because of me. The keep included. Especially the keep.',
   'The coal never fully goes out. Neither does the count of things left to finish.'],
  item:['A horseshoe that never fit','Fifty four of them on the wall, each for a horse that never arrived. He keeps them anyway.'],
  furn:[['stove',110,116],['crate',48,150],['barrel',250,146],['shelf',250,96],['lamp',238,102],['grind',64,138]],
  ox:150,oy:118,ix:110,iy:112},
 market:{name:'The Counting Room',owner:'Lio',wall:'#5a4038',floor:'#7d6a58',accent:'#e0b070',
  lines:['Everything on the stalls below passed through this room first. Nothing leaves the keep uncounted.',
   'The plums ripen early and the apples fall late. The ledger does not care about seasons. The ledger cares about truth.',
   'You are not in the ledger yet. I am still deciding what that means.'],
  item:['A ledger with one page torn out','The torn page is the account of what the king sold to build the keep. Lio has never read it. He does not want to.'],
  furn:[['counter',120,120],['letters',66,130],['shelf',246,96],['barrel',44,152],['lamp',240,102],['rug',160,146]],
  ox:84,oy:118,ix:120,iy:112},
 tea:{name:'The tea house',owner:'Junia',wall:'#4c5f52',floor:'#6f6a52',accent:'#8fc4a8',
  lines:['The garden is raked every morning. Not for beauty. For the discipline of it.',
   'Sit. The tea is from the terrace bushes. The steam is for thinking, not for drinking.',
   'Fifty four cups a day on a good day. Each one is a small finished thing.'],
  item:['A tea cup with a chip in it','The chip was repaired with gold. Junia says the flaw is what makes it precious. She did not say the story was hers.'],
  furn:[['table',150,124],['counter',86,116],['shelf',246,96],['lamp',238,102],['bonsai',246,122],['rug',160,146],['candles',212,122]],
  ox:110,oy:120,ix:150,iy:120},
 keepshrine:{name:'The keep shrine',wall:'#5a4438',floor:'#6f6152',accent:'#e8c07a',
  lines:['No priest lives here. The bell rings for the wind, and the bowl holds whatever the wind brings.',
   'Leave your count at the door. The shrine does not keep ledgers, it keeps quiet.'],
  item:['An offering of river stones','Fifty four stones, each carried up from the stream by hand. The bowl has never been full. It has never been empty either.'],
  furn:[['counter',120,120],['lamp',240,104],['books',52,100],['rug',160,146],['candles',214,112]],
  ox:150,oy:118,ix:120,iy:116},
 southwatch:{name:'The south watch',wall:'#4a4436',floor:'#7d7560',accent:'#a8bcd8',
  lines:['The watch is empty. The keep does not watch the town; the town watches itself.',
   'If you are reading this, the gate is open. It was always open. The latch is for weather, not for people.'],
  item:['A tally board with chalk marks','Fifty four marks, and a column of tally lines for the ones who arrived before you. Yours is already there.'],
  furn:[['counter',118,122],['shelf',246,96],['lamp',238,102],['crate',46,150],['banner',160,54]],
  ox:150,oy:118,ix:118,iy:116},
 gate:{name:'The gatehouse',owner:'Ryle',wall:'#4a4436',floor:'#7d7560',accent:'#e0b070',
  lines:['First door of the keep. She is the last door, and she counts four promises: the village, the fish, the far road, and the sky.',
   'Nobody passes that the pond has not already weighed. I keep the tally so she does not have to wake for the small ones.',
   'When the fourth promise is kept you will not see me move. I will simply not be standing here any more. That is how you will know.'],
  item:['A knotted cord','Two hundred and four knots, one for every name the pond weighed before you. He began splicing yours on at the bridge.'],
  furn:[['rug',160,148],['counter',100,124],['shelf',248,92],['books',246,84],['banner',160,54],['lamp',262,104],['barrel',38,152],['candles',214,126]],
  ox:80,oy:118,ix:112,iy:112},
 keep:{name:'The Tall Hall',owner:'Venna',wall:'#4a4436',floor:'#7d7560',accent:'#e0b070',
  lines:['Sit. The floor is old stone and the sun crosses it on one hour of the day. I do not measure the hour for you.',
   'Two hundred and four names are in the pond itself, written in the pond’s own hand. What it was, and who it was for. The last page stays empty.',
   'The king who built this finished everything he ever started. The pond showed him one more thing to finish, and he did, and then the sky sea was here, and this is what was left.',
   'Everyone who reaches this room is somebody who finished. That is the whole test, and you are past it.'],
  item:['A page from the pond’s tally','Two columns, in the pond’s own writing: what it was, and who it was for. The last line is blank.'],
  furn:[['rug',160,144],['chair',160,126],['desk',230,116],['shelf',56,100],['lamp',252,104],['counter',124,126],['candles',124,112],['banner',160,54],['tome',230,106],['bonsai',62,118]],
  ox:92,oy:118,ix:124,iy:112},
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
 furn:[['rug',150,146],['table',92,128],['bed',232,122],['crate',38,152],['shelf',252,98],['lamp',264,106],['tome',88,118],['bonsai',182,120]]};
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
 {id:'bridge',house:[36.9,20.6],off:[-0.41,1.5],room:'bridge'},
 {id:'boathouse',house:[19.4,21.8],off:[0,1.35],room:'boathouse'},
 {id:'shrine',house:[34.4,10.8],off:[0,1.2],room:'shrine'},
 {id:'lookout',house:[35.6,40.2],off:[0,1.3],room:'lookout'},
 {id:'hermit',house:[51.0,15.6],off:[0,1.2],room:'hermit'},
 {id:'post',house:[91.5,33],off:[-0.41,1.5],room:'post'},
 {id:'pagoda',house:[111,17],off:[0,1.4],room:'pagoda'},
 {id:'dome',house:[133.0,27.0],off:[0,1.5],room:'dome'},
 {id:'gate',house:[136.5,44.8],off:[0,-1.4],room:'gate'},
 {id:'mess',house:[150.6,93.8],off:[0,1.5],room:'mess'},
 {id:'library',house:[143.8,99.4],off:[0,1.5],room:'library'},
 {id:'smithy',house:[145.8,92.0],off:[0,1.5],room:'smithy'},
 {id:'market',house:[133.0,83.4],off:[0,1.5],room:'market'},
 {id:'tea',house:[163.6,84.6],off:[0,1.5],room:'tea'},
 {id:'keepshrine',house:[127.6,52.6],off:[0,1.3],room:'keepshrine'},
 {id:'southwatch',house:[136.5,66.2],off:[0,1.4],room:'southwatch'},
 {id:'starkeep',house:[136.5,53.3],off:[0,1.9],room:'keep',lock:{quests:['village','koi','far','sky']},lockMsg:'The keeper counts four promises: the village, the fish, the far ends of the road, and the sky. Keep them all and the door opens.'}];

let ROOMSP=null;
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
  case 'rug': px(0,0,'#7a3a3a');g.fillRect(x-30,y-8,60,16);g.fillStyle='#a05440';g.fillRect(x-26,y-6,52,12);break;
  // the keep's own company: three candles, two banners, one empty chair
  case 'candles': g.fillStyle='#6a5a2a';g.fillRect(x-9,y-3,18,4);g.fillRect(x-2,y-18,3,16);
   g.fillStyle='#c9b06a';for(const dx of[-8,0,8])g.fillRect(x+dx-1,y-21,2,8);
   g.fillStyle='#ffd27a';for(const dx of[-8,0,8])g.fillRect(x+dx-1,y-24,2,3);break;
  case 'banner': g.fillStyle='#5a1d17';g.fillRect(x-6,y,13,36);g.fillStyle='#7d2b21';g.fillRect(x-6,y,3,36);
   g.fillStyle='#e8c86a';g.fillRect(x-2,y+8,5,1);g.fillRect(x,y+7,1,3);
   g.fillStyle='#5a1d17';g.fillRect(x-6,y+36,11,2);g.fillRect(x-5,y+38,9,2);g.fillRect(x-4,y+40,7,2);g.fillRect(x-3,y+42,5,2);break;
  case 'chair': g.fillStyle='#2e211a';g.fillRect(x-8,y-27,16,27);g.fillStyle='#463326';g.fillRect(x-6,y-25,12,14);
   g.fillStyle='#241c14';g.fillRect(x-2,y-22,4,5);g.fillRect(x-4,y-20,8,2);
   g.fillStyle='#2e211a';g.fillRect(x-11,y,22,4);g.fillRect(x-10,y+4,3,9);g.fillRect(x+7,y+4,3,9);break;
  case 'bonsai': g.fillStyle='#6a4a2a';g.fillRect(x-7,y-3,14,5);
   g.fillStyle='#3a5a34';g.fillRect(x-5,y-8,10,5);g.fillStyle='#4d7345';g.fillRect(x-8,y-13,16,5);g.fillStyle='#638f58';g.fillRect(x-11,y-17,22,4);break;
  case 'tome': g.fillStyle='#3a2e1e';g.fillRect(x-10,y-4,20,4);g.fillStyle='#503c28';g.fillRect(x-9,y-8,18,4);
   g.fillStyle='#27455a';g.fillRect(x-10,y-12,20,4);g.fillStyle='#c9b06a';g.fillRect(x-2,y-11,5,2);break}}

// ---- a person standing in a room
function rmPerson(g,sp,x,y){
 g.fillStyle='rgba(10,20,16,.32)';g.beginPath();g.ellipse(x,y-1,4.5,1.8,0,0,6.283);g.fill();
 if(sp&&sp.c)g.drawImage(sp.c,Math.round(x-sp.ox),Math.round(y-sp.oy))}

// ---- the room state
function roomOpen(id){
 const R=ROOMS[id];if(!R)return;
 ROOM=id;MODE='room';RMTX=RMTY=0;RMTAKE=PASS.rooms&&PASS.rooms[id]?1:0;
 const c=R.owner?CH.find(c=>c.name===R.owner):null;
 const pal=(c&&c.pal)||R.pal||null;
 const sp=pal?villager(pal,0,'front'):null;
 RMTALK=0;RMREAD={};ROOMSP={owner:sp};
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
 if(L&&L.quests&&!L.quests.every(q=>PASS.quests.includes(q)))return msg||'Not yet.';
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
 if(typeof SIT!=='undefined'&&SIT){standUp();return}
 if(typeof BOATMODE!=='undefined'&&BOATMODE){boatUse();return}
 if(typeof quizNear==='function'&&quizNear()){quizOpen();return}
 if(typeof boatBoardNear==='function'&&boatBoardNear()){boatUse();return}
 const e=doorNear();
 if(e){doorUse(e);return}
 const th=typeof thingNear==='function'?thingNear():null;
 if(th){thingUse(th);return}
 if(typeof anglingNear==='function'&&anglingNear()){anglingUse();return}
 if(typeof perchUse==='function')perchUse();
};

/* ================= v3: FURNISHED ROOMS =================
   Every room now has its own wall (plank / stone / plaster), floor (plank / tile / flagstone / tatami),
   window view (meadow, sea, sakura, stars, cloud-sea), wall decor, props and living details: a sleeping cat,
   steam, flames, a clock on real time, drifting clouds. Furniture and people are depth-sorted. */
const rmIx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const rmMx=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const rmRgb=a=>'rgb('+(a[0]|0)+','+(a[1]|0)+','+(a[2]|0)+')';
const rmC=(c,k)=>rmRgb(rmMx(rmIx(c),k<0?[0,0,0]:[255,255,255],Math.abs(k)));
const rmBx=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
const rmDk=(g,x,y,rx,ry,a)=>{g.fillStyle='rgba(8,5,2,'+(a||.3)+')';g.beginPath();g.ellipse(Math.round(x),Math.round(y),rx,ry,0,0,6.283);g.fill()};
const rmNight=()=>(typeof cur!=='undefined'&&cur&&cur.night)||0;

// ---- what you see through a window ----
function winView(g,x,y,w,h,kind,t){
 const st=kind==='stars'?1:rmNight();
 const top=rmMx([128,176,214],[10,14,38],st),bot=rmMx([210,228,238],[38,50,84],st);
 g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
 for(let i=0;i<h;i++)rmBx(g,rmRgb(rmMx(top,bot,i/h)),x,y+i,w,1);
 if(st>.3)for(let k=0;k<16;k++)rmBx(g,'rgba(255,246,214,'+(.5+.5*Math.sin(t*2+k)).toFixed(2)+')',x+hh(k,4)*w,y+hh(k,8)*h*.7,1,1);
 if(kind==='stars'){rmBx(g,'#f2ecc8',x+w-12,y+5,5,5);rmBx(g,'#0a0e26',x+w-10,y+4,5,5);const p=(t*.25)%1;if(p<.3)rmBx(g,'rgba(255,255,255,.8)',x+w*(1-p*3),y+4+p*40,3,1)}
 else{g.fillStyle='rgba(255,255,255,'+(.85-st*.6)+')';
  for(let k=0;k<3;k++){const cx=x+((hh(k,3)*w+t*(1.5+k*.7))%(w+20))-10,cy=y+4+k*5;g.beginPath();g.ellipse(cx,cy,7,2.2,0,0,6.283);g.ellipse(cx+4,cy-1.5,4,2,0,0,6.283);g.fill()}}
 if(kind==='meadow'||kind==='sakura'){
  g.fillStyle=rmRgb(rmMx([86,150,70],[20,40,34],st));g.beginPath();g.ellipse(x+12,y+h+4,22,12,0,0,6.283);g.fill();
  g.fillStyle=rmRgb(rmMx([112,176,86],[26,52,42],st));g.beginPath();g.ellipse(x+w-8,y+h+6,24,11,0,0,6.283);g.fill();
  if(kind==='sakura'){g.fillStyle=rmRgb(rmMx([250,170,200],[90,60,90],st));g.beginPath();g.arc(x+w-12,y+h-14,9,0,6.283);g.arc(x+w-6,y+h-10,7,0,6.283);g.fill();rmBx(g,'#4a331c',x+w-10,y+h-8,2,8);
   for(let k=0;k<4;k++){const p=(t*.12+k/4)%1;rmBx(g,'#ffc8da',x+w-14-p*30,y+h-16+p*18+Math.sin(p*9+k)*2,1,1)}}
  else for(let k=0;k<3;k++){rmBx(g,'#4a331c',x+8+k*9,y+h-8,1,4);rmBx(g,'#3a7a3a',x+6+k*9,y+h-12,5,5)}}
 else if(kind==='sea'){
  rmBx(g,rmRgb(rmMx([58,124,152],[16,34,60],st)),x,y+h*.55,w,h*.45);
  for(let k=0;k<7;k++){const wx=x+((hh(k,2)*w+t*(4+k%3*2))%w);rmBx(g,'rgba(230,246,250,.55)',wx,y+h*.62+k*2.2,4,1)}
  const sx=x+((t*3)%(w+16))-8;rmBx(g,'#e8e0cc',sx,y+h*.55-9,1,9);rmBx(g,'#f2ecd8',sx+1,y+h*.55-8,5,6);rmBx(g,'#4a331c',sx-2,y+h*.55,9,2)}
 else if(kind!=='stars'){
  const ix=x+w-18+Math.sin(t*.3)*2;rmBx(g,rmRgb(rmMx([120,100,76],[30,26,30],st)),ix,y+h-10,14,6);rmBx(g,rmRgb(rmMx([96,150,70],[20,40,30],st)),ix,y+h-12,14,3);rmBx(g,'#3a7a3a',ix+4,y+h-16,4,4)}
 g.restore()}

// ---- wall decor: [kind,x,y,variant]; dyn ones are redrawn each frame ----
const WK={
 window(g,x,y,t,R,D){const w=44,h=28;rmBx(g,'#2a1d12',x-3,y-3,w+6,h+6);winView(g,x,y,w,h,D.view,t);
  rmBx(g,'#3a2a1a',x+w/2-1,y,2,h);rmBx(g,'#3a2a1a',x,y+h/2-1,w,2);rmBx(g,'rgba(255,255,255,.14)',x+2,y+2,8,h-4);
  rmBx(g,'#6a4c30',x-5,y+h+2,w+10,3);rmBx(g,'#9a7a50',x-5,y+h+2,w+10,1);
  rmBx(g,rmC(R.accent,-.25),x-4,y-4,6,h+10);rmBx(g,rmC(R.accent,-.25),x+w-2,y-4,6,h+10);rmBx(g,rmC(R.accent,.1),x-4,y-4,2,h+10);rmBx(g,'#3a2a1a',x-6,y-5,w+12,2)},
 clock(g,x,y,t){const d=new Date(),m=d.getMinutes(),hr=(d.getHours()%12)+m/60,s=Math.sin(t*3)*2;
  rmBx(g,'#c9a25a',x-1+s*.5,y+9,2,6);rmBx(g,'#e8c86a',x-2+s*.5,y+14,4,3);
  g.fillStyle='#2a1d12';g.beginPath();g.arc(x,y,8,0,6.283);g.fill();g.fillStyle='#e8dfc4';g.beginPath();g.arc(x,y,6.5,0,6.283);g.fill();
  for(let i=0;i<12;i++){const a=i*Math.PI/6;rmBx(g,'#4a3a2a',x+Math.sin(a)*5.2,y-Math.cos(a)*5.2,1,1)}
  g.strokeStyle='#2a1d12';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.sin(hr*Math.PI/6)*3.6,y-Math.cos(hr*Math.PI/6)*3.6);g.moveTo(x,y);g.lineTo(x+Math.sin(m*Math.PI/30)*5.4,y-Math.cos(m*Math.PI/30)*5.4);g.stroke()},
 lantern(g,x,y,t){const sw=Math.sin(t*1.2+x)*1.5;rmBx(g,'#2a1d12',x,y,1,6);rmBx(g,'#b03a2a',x-4+sw,y+6,9,11);rmBx(g,'#e04a3a',x-3+sw,y+7,7,9);rmBx(g,'#ffe08a',x-1+sw,y+9,3,5);rmBx(g,'#2a1d12',x-4+sw,y+6,9,1);rmBx(g,'#2a1d12',x-4+sw,y+16,9,1);
  const gr=g.createRadialGradient(x+sw,y+12,1,x+sw,y+12,24);gr.addColorStop(0,'rgba(255,170,90,.30)');gr.addColorStop(1,'rgba(255,170,90,0)');g.fillStyle=gr;g.fillRect(x-24,y-10,50,44)},
 cogs(g,x,y,t){for(const[cx,cy,r,d]of[[x+8,y+8,7,1],[x+20,y+12,5,-1]]){g.fillStyle='#5a5a64';g.beginPath();g.arc(cx,cy,r,0,6.283);g.fill();for(let i=0;i<8;i++){const a=i*Math.PI/4+d*t*.5;g.fillRect(cx+Math.cos(a)*r-1,cy+Math.sin(a)*r-1,3,3)}g.fillStyle='#2a2a30';g.beginPath();g.arc(cx,cy,2,0,6.283);g.fill()}},
 tools(g,x,y){rmBx(g,'#3a2616',x,y,40,26);rmBx(g,'#5a3d22',x+1,y+1,38,24);rmBx(g,'#6a4a2a',x+6,y+4,2,14);rmBx(g,'#8a8a94',x+3,y+3,8,4);rmBx(g,'#a8a8b0',x+16,y+4,14,3);rmBx(g,'#6a4a2a',x+16,y+7,2,14);rmBx(g,'#bcc4c8',x+31,y+5,3,10);rmBx(g,'#c83a2a',x+30,y+15,5,5);rmBx(g,'#6a5a3a',x+20,y+17,10,2)},
 calendar(g,x,y){rmBx(g,'#2a1d12',x+7,y-2,2,3);rmBx(g,'#e8dfc4',x,y,16,20);rmBx(g,'#b03a2a',x,y,16,5);for(let i=0;i<12;i++)rmBx(g,'#8a7a5a',x+2+(i%4)*3,y+8+((i/4)|0)*3,2,2);rmBx(g,'#c83a2a',x+8,y+11,2,2)},
 frame(g,x,y,t,R,D,v){rmBx(g,'#3a2616',x,y,24,18);const p=[['#7fa8c8','#5a9a5a'],['#e8b0c0','#7a4a3a'],['#2a3a5a','#d8c070'],['#3a6a8a','#e86a3a']][(v||0)%4];rmBx(g,p[0],x+2,y+2,20,14);rmBx(g,p[1],x+2,y+10,20,6);rmBx(g,'#fff',x+14,y+4,3,2);rmBx(g,'rgba(255,255,255,.22)',x+2,y+2,20,2)},
 map(g,x,y){rmBx(g,'#3a2616',x-1,y-1,34,24);rmBx(g,'#d8c890',x,y,32,22);g.strokeStyle='#6a5a3a';g.lineWidth=1;g.beginPath();g.moveTo(x+4,y+14);g.quadraticCurveTo(x+10,y+4,x+18,y+10);g.quadraticCurveTo(x+24,y+16,x+28,y+6);g.stroke();rmBx(g,'#b03a2a',x+20,y+8,3,1);rmBx(g,'#b03a2a',x+21,y+7,1,3)},
 jars(g,x,y){rmBx(g,'#4a331c',x,y+12,36,3);for(let i=0;i<3;i++){rmBx(g,'#cfd8d0',x+3+i*11,y+3,8,9);rmBx(g,['#8a3a2a','#3a6a4a','#c8a44a'][i],x+4+i*11,y+6,6,6);rmBx(g,'#6a4a2a',x+3+i*11,y+1,8,2)}},
 fish(g,x,y){rmBx(g,'#5a4426',x,y,30,1);for(let i=0;i<3;i++){const fx=x+3+i*10;rmBx(g,'#8a8a8a',fx,y+1,1,3);rmBx(g,'#a8b4b8',fx-2,y+4,5,10);rmBx(g,'#7a8a90',fx-2,y+11,5,3);rmBx(g,'#e0e8ea',fx-1,y+5,1,6)}},
 oars(g,x,y){g.strokeStyle='#8a6a42';g.lineWidth=2;g.beginPath();g.moveTo(x,y+30);g.lineTo(x+16,y);g.moveTo(x+16,y+30);g.lineTo(x,y);g.stroke();rmBx(g,'#b89860',x+14,y-2,5,8);rmBx(g,'#b89860',x-3,y-2,5,8)},
 chart(g,x,y){rmBx(g,'#1a2640',x,y,34,24);rmBx(g,'#c9a25a',x,y,34,1);rmBx(g,'#c9a25a',x,y+23,34,1);const P=[[4,6],[10,12],[17,8],[22,16],[29,10],[12,19]];g.strokeStyle='rgba(188,208,224,.5)';g.lineWidth=1;g.beginPath();P.forEach((p,i)=>i?g.lineTo(x+p[0],y+p[1]):g.moveTo(x+p[0],y+p[1]));g.stroke();for(const p of P)rmBx(g,'#fff6d0',x+p[0]-1,y+p[1]-1,2,2)},
 scroll(g,x,y){rmBx(g,'#3a2616',x,y,14,2);rmBx(g,'#e8dcb8',x+1,y+2,12,26);rmBx(g,'#3a2616',x,y+28,14,2);rmBx(g,'#1a1208',x+4,y+6,2,10);rmBx(g,'#1a1208',x+7,y+9,3,2);rmBx(g,'#b03a2a',x+8,y+20,3,3)},
 antlers(g,x,y){rmBx(g,'#6a4a2a',x+8,y+8,8,6);g.strokeStyle='#d8c8a0';g.lineWidth=1;for(const s of[-1,1]){g.beginPath();g.moveTo(x+12+s*3,y+8);g.lineTo(x+12+s*8,y+2);g.lineTo(x+12+s*12,y-2);g.moveTo(x+12+s*8,y+2);g.lineTo(x+12+s*7,y-3);g.stroke()}},
 herbs(g,x,y){rmBx(g,'#5a4426',x,y,28,1);for(let i=0;i<4;i++){const hx=x+3+i*7;rmBx(g,'#6a5a2a',hx,y+1,1,4);rmBx(g,['#5a8a4a','#8a9a4a','#7a5a8a','#4a7a5a'][i],hx-2,y+5,5,9);rmBx(g,'#3a5a2a',hx-1,y+12,3,3)}},
 board(g,x,y){rmBx(g,'#3a2616',x,y,34,26);rmBx(g,'#b08a58',x+1,y+1,32,24);for(let i=0;i<5;i++)rmBx(g,['#efe6cc','#e8d49a','#cfe0d0'][i%3],x+3+(i%3)*10,y+3+((i/3)|0)*11,8,9),rmBx(g,'#b03a2a',x+6+(i%3)*10,y+3+((i/3)|0)*11,2,2)},
 pigeon(g,x,y){rmBx(g,'#3a2616',x,y,48,30);for(let r=0;r<3;r++)for(let c=0;c<6;c++){rmBx(g,'#1e150e',x+2+c*7.5,y+2+r*9,6,8);if(hh(c,r+x)>.4)rmBx(g,'#e8dfc4',x+3+c*7.5,y+4+r*9,5,5)}},
 hooks(g,x,y){rmBx(g,'#4a331c',x,y+4,34,3);for(let i=0;i<4;i++)rmBx(g,'#2a1d12',x+3+i*9,y+7,2,3);rmBx(g,'#4a6a5a',x+2,y+7,7,15);rmBx(g,'#8a3a2a',x+20,y+8,10,4)},
 blueprint(g,x,y){rmBx(g,'#2a4a7a',x,y,30,22);g.strokeStyle='rgba(220,236,255,.7)';g.lineWidth=1;g.strokeRect(x+4.5,y+4.5,12,9);g.beginPath();g.moveTo(x+20,y+6);g.lineTo(x+26,y+16);g.moveTo(x+4,y+18);g.lineTo(x+16,y+18);g.stroke()},
 bell(g,x,y){rmBx(g,'#4a331c',x-6,y,12,2);g.fillStyle='#c9a25a';g.beginPath();g.arc(x,y+8,6,3.14,0);g.fill();g.fillRect(x-6,y+8,12,3);rmBx(g,'#8a6a2a',x-1,y+12,2,2);rmBx(g,'#a83a2a',x,y+14,1,10)},
 tapestry(g,x,y){rmBx(g,'#6a1d17',x,y,22,34);rmBx(g,'#8d2b21',x,y,4,34);rmBx(g,'#e8c86a',x+10,y+6,2,6);rmBx(g,'#e8c86a',x+9,y+8,4,1);rmBx(g,'#e8c86a',x+4,y+20,14,1);rmBx(g,'#e8c86a',x+4,y+22,14,1);rmBx(g,'#3a0f0c',x,y+34,22,2)},
 mask(g,x,y){rmBx(g,'#e8dcc0',x,y,12,15);rmBx(g,'#b03a2a',x+1,y+5,3,2);rmBx(g,'#b03a2a',x+8,y+5,3,2);rmBx(g,'#2a1d12',x+4,y+10,4,2);rmBx(g,'#b03a2a',x+4,y+1,4,2)}};
const WDYN={window:1,clock:1,lantern:1,cogs:1};

// ---- floor props: drawn at their feet (x,y), depth-sorted with people ----
const FKS={sack:8,woodpile:13,bucket:6,broom:5,plant:7,cat:10,stool:7,chest:13,basket:9,ladder:8,globe:7,boots:6,lanternf:5,cushion:10,lowtable:17,coil:10,barrelb:10,bench:19,screen:19,incense:6,orrery:10,radio:11,toolbox:9,backpack:7,pot:10,bale:13,buoy:8,armor:8,cot:23};
const FK={
 sack(g,x,y){rmBx(g,'#a8885a',x-7,y-12,14,13);rmBx(g,'#c4a672',x-7,y-12,5,13);rmBx(g,'#8a6c42',x+4,y-12,3,13);rmBx(g,'#8a6c42',x-4,y-14,8,3);rmBx(g,'#5a4426',x-3,y-9,6,1)},
 woodpile(g,x,y){for(let r=0;r<3;r++)for(let i=0;i<4-r;i++){const cx=x-10+i*6+r*3,cy=y-3-r*5;rmBx(g,'#5a3d22',cx-3,cy-3,6,6);rmBx(g,'#c89a62',cx-2,cy-2,4,4);rmBx(g,'#a87a46',cx-1,cy-1,2,2)}},
 bucket(g,x,y){rmBx(g,'#6a4c2e',x-5,y-9,10,9);rmBx(g,'#8a6a44',x-5,y-9,3,9);rmBx(g,'#3a3a40',x-5,y-7,10,1);rmBx(g,'#3a3a40',x-5,y-3,10,1);rmBx(g,'#2a4a5a',x-4,y-9,8,1)},
 broom(g,x,y){g.strokeStyle='#7a5a34';g.lineWidth=2;g.beginPath();g.moveTo(x+4,y-26);g.lineTo(x-1,y-5);g.stroke();rmBx(g,'#c8a44a',x-4,y-6,7,6);rmBx(g,'#a8883a',x-4,y-3,7,1)},
 plant(g,x,y,t){rmBx(g,'#8a4a32',x-6,y-8,12,9);rmBx(g,'#a8603e',x-6,y-8,12,2);const s=Math.sin(t*1.4+x)*1.5;g.fillStyle='#3f7a3a';for(let i=-2;i<=2;i++){g.beginPath();g.ellipse(x+i*4+s*(i?1:0),y-16-(2-Math.abs(i))*3,2.5,6,i*.3,0,6.283);g.fill()}g.fillStyle='#5fa050';g.beginPath();g.ellipse(x+s,y-20,2,5,0,0,6.283);g.fill()},
 cat(g,x,y,t){const c=hh(x,y)>.5?['#c98a4a','#e8b070']:['#5a5a64','#8a8a96'],br=Math.sin(t*1.8)*.7;g.fillStyle=c[0];g.beginPath();g.ellipse(x,y-4,8,4+br,0,0,6.283);g.fill();g.fillStyle=c[1];g.beginPath();g.ellipse(x-1,y-6+br,5,2,0,0,6.283);g.fill();rmBx(g,c[0],x+7,y-6,3,2);rmBx(g,c[0],x-9,y-8,4,4);rmBx(g,c[0],x-9,y-10,1,2);rmBx(g,c[0],x-6,y-10,1,2);rmBx(g,'#1a1208',x-8,y-6,2,1);g.font='7px monospace';g.fillStyle='rgba(255,255,255,.55)';g.fillText('z',x+4,y-12-((t*5)%9))},
 stool(g,x,y){rmBx(g,'#6a4a2a',x-6,y-9,12,3);rmBx(g,'#8a6a42',x-6,y-9,12,1);rmBx(g,'#4a331c',x-5,y-6,2,7);rmBx(g,'#4a331c',x+3,y-6,2,7)},
 chest(g,x,y){rmBx(g,'#5a3d22',x-12,y-12,24,13);rmBx(g,'#7a5530',x-12,y-12,24,5);rmBx(g,'#3a3a40',x-12,y-8,24,1);rmBx(g,'#3a3a40',x-9,y-12,2,13);rmBx(g,'#3a3a40',x+7,y-12,2,13);rmBx(g,'#d8b45a',x-1,y-8,3,3)},
 basket(g,x,y){rmBx(g,'#a88a52',x-8,y-9,16,9);for(let i=0;i<8;i++)rmBx(g,i%2?'#8a6c3a':'#c4a468',x-8+i*2,y-9,2,9);rmBx(g,'#6a5028',x-8,y-9,16,1);rmBx(g,'#c85a3a',x-5,y-12,4,3);rmBx(g,'#d8b04a',x+1,y-12,4,3)},
 ladder(g,x,y){rmBx(g,'#7a5a34',x-6,y-40,2,41);rmBx(g,'#7a5a34',x+4,y-40,2,41);for(let i=0;i<7;i++)rmBx(g,'#a07a48',x-6,y-36+i*6,12,2)},
 globe(g,x,y){rmBx(g,'#4a331c',x-6,y-3,12,3);rmBx(g,'#4a331c',x-1,y-10,2,8);g.fillStyle='#3a6a8a';g.beginPath();g.arc(x,y-17,8,0,6.283);g.fill();g.fillStyle='#5a9a5a';g.fillRect(x-4,y-20,5,4);g.fillRect(x+1,y-15,4,3);g.strokeStyle='#c9a25a';g.lineWidth=1;g.beginPath();g.arc(x,y-17,9,-1.2,1.2);g.stroke()},
 boots(g,x,y){for(const d of[-5,3]){rmBx(g,'#3a2a1a',x+d,y-8,4,8);rmBx(g,'#4a3626',x+d-1,y-2,7,3);rmBx(g,'#6a5236',x+d,y-8,4,1)}},
 lanternf(g,x,y,t){const f=.8+.2*Math.sin(t*9+x);rmBx(g,'#2a2a30',x-4,y-2,8,2);rmBx(g,'#2a2a30',x-4,y-12,8,2);rmBx(g,'#ffd27a',x-3,y-10,6,8);rmBx(g,'#fff0c0',x-1,y-8,2,4);const gr=g.createRadialGradient(x,y-6,1,x,y-6,26);gr.addColorStop(0,'rgba(255,200,110,'+(.32*f).toFixed(2)+')');gr.addColorStop(1,'rgba(255,200,110,0)');g.fillStyle=gr;g.fillRect(x-26,y-32,52,52)},
 cushion(g,x,y,t,R){const a=R.accent;rmBx(g,rmC(a,-.35),x-9,y-5,18,6);rmBx(g,rmC(a,-.1),x-8,y-7,16,5);rmBx(g,rmC(a,.25),x-6,y-7,6,2);rmBx(g,'#e8d8a8',x-1,y-8,2,2)},
 lowtable(g,x,y,t){rmBx(g,'#4a331c',x-16,y-7,32,3);rmBx(g,'#8a6a42',x-16,y-7,32,1);rmBx(g,'#3a2616',x-14,y-4,3,5);rmBx(g,'#3a2616',x+11,y-4,3,5);rmBx(g,'#e8e0cc',x-8,y-11,6,4);rmBx(g,'#2a4a5a',x+2,y-12,6,5);for(let k=0;k<3;k++){const p=(t*.8+k/3)%1;rmBx(g,'rgba(255,255,255,'+(.4*(1-p)).toFixed(2)+')',x+4+Math.sin(p*6+k)*2,y-14-p*10,1,2)}},
 coil(g,x,y){for(let i=0;i<3;i++){g.strokeStyle=i%2?'#b8985a':'#8a6e3a';g.lineWidth=2;g.beginPath();g.ellipse(x,y-3-i*2,9-i,3.5,0,0,6.283);g.stroke()}},
 barrelb(g,x,y){g.fillStyle='#6a4a2a';g.beginPath();g.ellipse(x,y-9,9,11,0,0,6.283);g.fill();rmBx(g,'#8a6a3a',x-9,y-15,3,12);rmBx(g,'#3a3a40',x-9,y-14,18,1);rmBx(g,'#3a3a40',x-9,y-5,18,1);g.fillStyle='#4a331c';g.beginPath();g.ellipse(x,y-19,8,2,0,0,6.283);g.fill()},
 bench(g,x,y){rmBx(g,'#6a4a2a',x-18,y-8,36,4);rmBx(g,'#8a6a42',x-18,y-8,36,1);rmBx(g,'#4a331c',x-16,y-4,3,6);rmBx(g,'#4a331c',x+13,y-4,3,6)},
 screen(g,x,y){for(let i=0;i<3;i++){rmBx(g,'#4a331c',x-18+i*12,y-34,12,35);rmBx(g,'#e8dcb8',x-17+i*12,y-33,10,33);rmBx(g,'#c9b888',x-17+i*12,y-33,10,2)}rmBx(g,'#3a5a3a',x-12,y-26,1,18);rmBx(g,'#3a5a3a',x-10,y-30,1,22);rmBx(g,'#5a7a4a',x-1,y-24,1,16);rmBx(g,'#3a5a3a',x+8,y-28,1,20)},
 incense(g,x,y,t){rmBx(g,'#5a4a3a',x-5,y-4,10,4);rmBx(g,'#8a7a5a',x-5,y-4,10,1);rmBx(g,'#3a2616',x,y-12,1,8);rmBx(g,'#ff8a3a',x,y-13,1,1);for(let k=0;k<6;k++){const p=(t*.5+k/6)%1;rmBx(g,'rgba(230,230,240,'+(.35*(1-p)).toFixed(2)+')',x+Math.sin(p*7+k)*3,y-14-p*22,1,1)}},
 orrery(g,x,y,t,R){rmBx(g,'#4a331c',x-8,y-3,16,3);rmBx(g,'#4a331c',x-1,y-12,2,10);g.strokeStyle=R.accent;g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.ellipse(x,y-18,12-i*3,4+i*3,i*.5+t*.4,0,6.283);g.stroke()}rmBx(g,'#ffd27a',x-1,y-19,3,3);const a=t*.9;rmBx(g,'#8ac0e8',x+Math.cos(a)*11,y-18+Math.sin(a)*4,2,2)},
 radio(g,x,y,t){rmBx(g,'#3a3a40',x-10,y-12,20,12);rmBx(g,'#5a5a64',x-10,y-12,20,2);rmBx(g,'#1a1a20',x-8,y-9,9,6);rmBx(g,'#8a8a94',x+3,y-9,2,2);rmBx(g,'#8a8a94',x+6,y-9,2,2);rmBx(g,((t*2)|0)%2?'#ff4a3a':'#5a1a14',x+5,y-5,2,2);rmBx(g,'#2a2a30',x+8,y-24,1,12)},
 toolbox(g,x,y){rmBx(g,'#a83a2a',x-8,y-7,16,8);rmBx(g,'#c85a3a',x-8,y-7,16,2);rmBx(g,'#2a2a30',x-3,y-9,6,2)},
 backpack(g,x,y){rmBx(g,'#4a6a8a',x-6,y-14,12,14);rmBx(g,'#6a8aaa',x-6,y-14,4,14);rmBx(g,'#2a3a4a',x-5,y-8,10,3);rmBx(g,'#c9a25a',x-1,y-7,2,1)},
 pot(g,x,y,t){rmBx(g,'#3a2a1a',x-8,y-2,2,4);rmBx(g,'#3a2a1a',x+6,y-2,2,4);g.fillStyle='#2a2a30';g.beginPath();g.ellipse(x,y-8,9,7,0,0,6.283);g.fill();rmBx(g,'#4a4a52',x-8,y-12,16,2);const f=.6+.4*Math.sin(t*10);rmBx(g,'rgba(255,150,60,'+(.7*f).toFixed(2)+')',x-5,y-1,10,2);for(let k=0;k<4;k++){const p=(t*.7+k/4)%1;rmBx(g,'rgba(255,255,255,'+(.4*(1-p)).toFixed(2)+')',x-3+k*2+Math.sin(p*5+k)*2,y-14-p*14,2,2)}},
 bale(g,x,y){rmBx(g,'#c8a44a',x-12,y-10,24,11);rmBx(g,'#e0c060',x-12,y-10,24,3);rmBx(g,'#8a6a2a',x-5,y-10,1,11);rmBx(g,'#8a6a2a',x+4,y-10,1,11)},
 buoy(g,x,y){g.fillStyle='#d8dcd0';g.beginPath();g.arc(x,y-8,7,0,6.283);g.fill();g.fillStyle='#c83a2a';for(let i=0;i<4;i++){const a=i*1.571;g.fillRect(x+Math.cos(a)*5-2,y-8+Math.sin(a)*5-2,4,4)}g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.arc(x,y-8,2.5,0,6.283);g.fill()},
 armor(g,x,y){rmBx(g,'#3a3a40',x-1,y-4,2,5);rmBx(g,'#4a4a52',x-6,y-6,12,2);rmBx(g,'#6a6a74',x-6,y-22,12,16);rmBx(g,'#8a8a96',x-6,y-22,4,16);rmBx(g,'#4a4a52',x-3,y-30,6,8);rmBx(g,'#8a8a96',x-3,y-30,2,8);rmBx(g,'#e8c86a',x-1,y-20,2,4);rmBx(g,'#7a5a34',x+9,y-40,2,40);rmBx(g,'#bcc8cc',x+8,y-46,4,6)},
 cot(g,x,y){rmBx(g,'#4a331c',x-22,y-8,44,10);rmBx(g,'#5a7a8a',x-20,y-9,40,8);rmBx(g,'#e6dcc0',x-20,y-10,12,6);rmBx(g,'#3a5a6a',x-6,y-9,26,8)}};

// ---- per-room character ----
const RDEC={
 _:{wall:'plaster',floor:'plank',view:'cloud',w:[['window',100,6],['frame',160,8,0],['clock',210,14]],f:[['plant',300,80],['cat',290,166]]},
 mill:{wall:'plank',floor:'plank',view:'meadow',w:[['tools',30,6],['window',108,6],['calendar',170,10],['clock',208,14],['frame',236,8,0]],f:[['woodpile',300,72],['sack',16,74],['sack',26,80],['sack',20,86],['bucket',150,68],['broom',296,100],['cat',276,164],['plant',306,128]]},
 workshop:{wall:'plank',floor:'plank',view:'cloud',w:[['blueprint',16,8],['cogs',52,10],['window',100,6],['jars',160,12],['clock',208,14],['blueprint',232,10]],f:[['toolbox',20,76],['ladder',304,84],['stool',150,72],['coil',298,150],['plant',20,120],['lanternf',276,164]]},
 barn:{wall:'plank',floor:'stone',view:'meadow',w:[['tools',24,6],['window',100,6],['hooks',160,8],['lantern',214,8],['tools',240,6]],f:[['bale',22,74],['bale',302,74],['sack',296,100],['bucket',20,112],['cat',150,70],['ladder',282,86]]},
 desk:{wall:'plaster',floor:'plank',view:'cloud',w:[['frame',14,8,2],['window',48,6],['board',108,6],['calendar',152,10],['clock',190,14],['frame',216,8,1],['lantern',268,6]],f:[['backpack',24,76],['cushion',298,86],['plant',304,130],['stool',150,70],['boots',64,172]]},
 office:{wall:'plaster',floor:'tile',view:'cloud',w:[['board',16,6],['clock',66,14],['window',92,6],['pigeon',154,8],['frame',212,8,3],['bell',268,6]],f:[['chest',300,76],['plant',20,96],['stool',90,150],['coil',296,130],['lanternf',150,70]]},
 sen:{wall:'plank',floor:'plank',view:'sea',w:[['fish',16,8],['oars',56,6],['window',92,6],['fish',150,8],['lantern',206,6],['map',232,8]],f:[['buoy',22,82],['coil',298,76],['basket',300,120],['boots',64,172],['bucket',150,72],['cat',280,168]]},
 boathouse:{wall:'plank',floor:'stone',view:'sea',w:[['oars',20,6],['oars',46,6],['window',92,6],['fish',148,8],['hooks',196,8],['lantern',250,6]],f:[['buoy',22,76],['buoy',34,82],['barrelb',304,76],['coil',298,110],['basket',20,120],['bucket',150,70]]},
 bridge:{wall:'stone',floor:'stone',view:'cloud',w:[['hooks',16,8],['window',62,6],['board',124,6],['lantern',182,6],['map',212,8],['bell',274,6]],f:[['coil',22,76],['pot',298,78],['stool',270,100],['chest',304,130],['bucket',150,68]]},
 lookout:{wall:'plank',floor:'plank',view:'cloud',w:[['chart',16,6],['window',62,6],['window',124,6],['map',186,8],['lantern',236,6],['clock',280,14]],f:[['lanternf',24,88],['cushion',296,80],['basket',304,120],['stool',150,72],['plant',20,130]]},
 hermit:{wall:'stone',floor:'stone',view:'meadow',w:[['herbs',16,6],['antlers',54,6],['window',100,6],['scroll',160,8],['herbs',190,6],['mask',236,12],['lantern',276,6]],f:[['pot',296,80],['woodpile',20,80],['cat',150,70],['basket',302,126],['boots',64,172],['plant',20,118]]},
 keep:{wall:'stone',floor:'tile',view:'cloud',w:[['tapestry',14,4],['tapestry',44,4],['window',96,6],['frame',166,8,2],['tapestry',230,4],['tapestry',262,4],['lantern',296,6]],f:[['armor',26,100],['armor',296,100],['chest',302,150],['plant',64,172]]},
 shrine:{wall:'plaster',floor:'tatami',view:'sakura',w:[['scroll',20,6],['scroll',44,6],['window',100,6],['lantern',170,6],['lantern',222,6],['mask',270,12]],f:[['incense',150,70],['screen',296,92],['cushion',50,100],['cushion',270,150],['lowtable',84,170]]},
 post:{wall:'plaster',floor:'plank',view:'cloud',w:[['pigeon',12,8],['pigeon',66,8],['window',124,6],['clock',184,14],['board',206,6],['bell',266,6]],f:[['sack',300,80],['sack',290,86],['basket',20,110],['plant',306,130],['stool',100,72],['chest',296,164]]},
 pagoda:{wall:'plank',floor:'tatami',view:'sakura',w:[['scroll',16,6],['lantern',48,6],['window',94,6],['frame',164,8,1],['lantern',210,6],['scroll',248,6]],f:[['incense',24,90],['cushion',56,110],['lowtable',296,92],['screen',298,132],['plant',150,70]]},
 dome:{wall:'plaster',floor:'tile',view:'stars',w:[['chart',12,6],['chart',50,6],['window',94,6],['cogs',154,10],['clock',192,14],['chart',218,6],['blueprint',262,8]],f:[['orrery',296,90],['radio',22,92],['globe',24,126],['cot',280,160],['lanternf',150,70]]},
 gate:{wall:'stone',floor:'stone',view:'cloud',w:[['tapestry',14,4],['tapestry',44,4],['window',96,6],['map',170,8],['tapestry',232,4],['tapestry',264,4],['lantern',296,6]],f:[['armor',24,98],['armor',296,98],['chest',302,150],['toolbox',64,168]]},
 mess:{wall:'plank',floor:'plank',view:'cloud',w:[['calendar',18,10],['window',96,6],['tools',168,6],['lantern',252,6]],f:[['bale',22,74],['woodpile',296,80],['cot',64,152],['bucket',150,70],['cat',284,164],['stool',200,74]]},
 library:{wall:'stone',floor:'tile',view:'cloud',w:[['scroll',16,8],['chart',62,6],['window',102,6],['map',170,8],['scroll',234,8],['lantern',276,6]],f:[['globe',24,124],['backpack',300,88],['lanternf',150,70],['cat',280,168]]},
 smithy:{wall:'stone',floor:'stone',view:'cloud',w:[['tools',16,6],['cogs',64,10],['window',104,6],['hooks',172,8],['tools',226,6],['lantern',280,6]],f:[['toolbox',26,78],['armor',296,96],['barrelb',300,140],['woodpile',20,112],['pot',150,66],['boots',64,170]]},
 market:{wall:'plaster',floor:'plank',view:'cloud',w:[['board',16,6],['pigeon',66,8],['window',104,6],['clock',186,14],['frame',232,8,3],['bell',276,6]],f:[['chest',300,78],['basket',24,110],['stool',150,70],['coil',296,132],['sack',304,96],['plant',24,128]]},
 tea:{wall:'plank',floor:'tatami',view:'meadow',w:[['scroll',18,6],['window',92,6],['lantern',190,6],['herbs',240,6]],f:[['lowtable',150,168],['cushion',84,104],['cushion',212,104],['pot',290,80],['plant',28,128],['incense',150,66],['cat',284,166]]},
 keepshrine:{wall:'plaster',floor:'tatami',view:'sakura',w:[['scroll',20,6],['lantern',60,6],['window',104,6],['mask',168,12],['lantern',232,6],['scroll',258,8]],f:[['incense',150,70],['cushion',52,100],['cushion',262,100],['lowtable',150,168],['screen',296,120]]},
 southwatch:{wall:'stone',floor:'stone',view:'cloud',w:[['hooks',18,8],['window',96,6],['board',168,6],['lantern',252,6],['chart',272,6]],f:[['cot',28,152],['lanternf',150,68],['stool',280,80],['armor',300,100],['bucket',22,110]]}};


// ---- the painted backdrop: walls, floors, rug, door, built once per room ----
const RBG={};
function rmBack(id){
 if(RBG[id])return RBG[id];
 const R=ROOMS[id],D=RDEC[id]||RDEC._,cv=mk(RMW,RMH),g=cv.getContext('2d'),W=R.wall,F=R.floor;
 rmBx(g,W,0,0,RMW,46);
 if(D.wall==='plank'){for(let x=0;x<RMW;x+=10){rmBx(g,rmC(W,-.26),x,0,1,40);rmBx(g,rmC(W,.07),x+1,0,1,40);if(hh(x,3)>.5)rmBx(g,rmC(W,-.12),x+4,(hh(x,9)*30)|0,2,3)}}
 else if(D.wall==='stone'){for(let r=0;r<5;r++)for(let x=-(r%2)*9;x<RMW;x+=18){const k=hh(x+r*77,r)*.16-.08;rmBx(g,rmC(W,k),x+1,r*9,17,8);rmBx(g,rmC(W,k+.07),x+1,r*9,17,1)}}
 else{for(let k=0;k<420;k++)rmBx(g,rmC(W,hh(k,7)*.16-.08),(hh(k,3)*RMW)|0,(hh(k,5)*40)|0,2,1);rmBx(g,rmC(W,.05),0,0,RMW,2)}
 rmBx(g,rmC(W,-.24),0,29,RMW,11);rmBx(g,rmC(W,.14),0,28,RMW,2);for(let x=8;x<RMW;x+=22)rmBx(g,rmC(W,-.34),x,31,1,8);
 rmBx(g,'rgba(0,0,0,.24)',0,40,RMW,6);rmBx(g,rmC(W,-.4),0,38,RMW,2);
 // floors
 rmBx(g,F,0,46,RMW,RMH-46);
 if(D.floor==='plank'){for(let y=46,r=0;y<RMH;y+=9,r++){rmBx(g,rmC(F,(hh(r,1)-.5)*.14),0,y,RMW,8);rmBx(g,'rgba(0,0,0,.2)',0,y+8,RMW,1);for(let x=(hh(r,2)*50)|0;x<RMW;x+=48+((hh(r,x)*30)|0))rmBx(g,'rgba(0,0,0,.2)',x,y,1,8);for(let k=0;k<5;k++)rmBx(g,'rgba(0,0,0,.07)',(hh(r,k+4)*RMW)|0,y+2+(k%3)*2,18,1)}}
 else if(D.floor==='tile'){for(let y=46,r=0;y<RMH;y+=10,r++)for(let x=0,c=0;x<RMW;x+=20,c++){rmBx(g,rmC(F,(r+c)%2?.07:-.07),x,y,19,9);rmBx(g,'rgba(255,255,255,.06)',x,y,19,1)}}
 else if(D.floor==='stone'){for(let y=46,r=0;y<RMH;y+=12,r++)for(let x=-((hh(r,5)*20)|0);x<RMW;x+=26+((hh(r,x)*14)|0)){rmBx(g,rmC(F,(hh(x,r)-.5)*.2),x+1,y+1,24,10);rmBx(g,'rgba(255,255,255,.07)',x+1,y+1,24,1);rmBx(g,'rgba(0,0,0,.16)',x,y,1,12);rmBx(g,'rgba(0,0,0,.16)',x,y+11,26,1)}}
 else{rmBx(g,'rgba(150,150,80,.32)',0,46,RMW,RMH-46);for(let y=46;y<RMH;y+=34)for(let x=0;x<RMW;x+=80){rmBx(g,rmC('#b0aa68',(hh(x,y)-.5)*.14),x+1,y+1,78,32);rmBx(g,'#3a3a24',x,y,80,1);rmBx(g,'#3a3a24',x,y,1,34);rmBx(g,'rgba(60,70,30,.5)',x+2,y+2,76,1)}}
 const sh=g.createLinearGradient(0,46,0,70);sh.addColorStop(0,'rgba(0,0,0,.34)');sh.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=sh;g.fillRect(0,46,RMW,24);
 // the rug
 const rg=R.furn.find(f=>f[0]==='rug')||['rug',160,142],rx=rg[1],ry=rg[2],A=R.accent;
 rmBx(g,'rgba(0,0,0,.22)',rx-47,ry-14,94,34);rmBx(g,rmC(A,-.42),rx-46,ry-16,92,32);rmBx(g,rmC(A,-.12),rx-43,ry-13,86,26);rmBx(g,rmC(A,-.5),rx-39,ry-10,78,20);
 for(let i=-3;i<=3;i++){rmBx(g,rmC(A,.2),rx+i*10-1,ry-1,3,3);rmBx(g,rmC(A,.2),rx+i*10,ry-2,1,5)}
 for(let x=-46;x<46;x+=3){rmBx(g,rmC(A,.15),rx+x,ry-18,1,2);rmBx(g,rmC(A,.15),rx+x,ry+16,1,2)}
 // the door out, with a frame and a lamp over it
 rmBx(g,'#2a1d12',16,146,28,34);rmBx(g,'#4a3524',18,150,24,30);for(let i=0;i<3;i++)rmBx(g,'#3a2a1a',22+i*7,150,1,30);rmBx(g,'#6a4a2a',18,150,24,3);rmBx(g,'#e8c87a',37,166,2,2);rmBx(g,'rgba(255,240,200,.8)',20,142,20,3);
 g.font='700 8px monospace';g.textAlign='left';g.fillStyle='rgba(255,240,200,.75)';g.fillText('OUT',20,146);
 for(const w of D.w)if(!WDYN[w[0]])WK[w[0]](g,w[1],w[2],0,R,D,w[3]);
 return RBG[id]=cv}

roomDraw=function(ox,oy,ix,iy){
 const g=RCTX,R=ROOMS[ROOM],D=RDEC[ROOM]||RDEC._,t=performance.now()/1000,n=rmNight();
 g.clearRect(0,0,RMW,RMH);g.drawImage(rmBack(ROOM),0,0);
 const win=D.w.find(w=>w[0]==='window');
 for(const w of D.w)if(WDYN[w[0]])WK[w[0]](g,w[1],w[2],t,R,D,w[3]);
 if(win){g.fillStyle='rgba('+(n>.4?'150,180,255':'255,236,190')+','+(.05+.04*(1-n)).toFixed(3)+')';g.beginPath();g.moveTo(win[1],win[2]+28);g.lineTo(win[1]+44,win[2]+28);g.lineTo(win[1]+84,RMH-8);g.lineTo(win[1]-16,RMH-8);g.closePath();g.fill()}
 const E=[];
 for(const f of R.furn){if(f[0]==='rug')continue;E.push([f[0]==='banner'?40:f[2],()=>FK[f[0]]?FK[f[0]](g,f[1],f[2],t,R,D):furnDraw(g,f[0],f[1],f[2])])}
 for(const f of D.f)E.push([f[2],()=>{rmDk(g,f[1],f[2]-1,FKS[f[0]]||9,2.5,.3);FK[f[0]](g,f[1],f[2],t,R,D)}]);
 E.push([oy,()=>rmPerson(g,ROOMSP.owner,ox,oy)]);
 const P=PL.P,pose=Math.abs(P.vx)>.1?'side':'front';
 E.push([RMY,()=>rmPerson(g,P.spr[pose][P.mvg?(P.anim|0)%2:0],RMX,RMY)]);
 E.sort((a,b)=>a[0]-b[0]);for(const e of E)e[1]();
 // lamps and candles actually light the room
 g.globalCompositeOperation='lighter';
 for(const f of R.furn)if(f[0]==='lamp'||f[0]==='candles'||f[0]==='stove'){const fl=.85+.15*Math.sin(t*8+f[1]),gr=g.createRadialGradient(f[1],f[2]-16,1,f[1],f[2]-16,46);gr.addColorStop(0,'rgba(255,190,100,'+((.16+.16*n)*fl).toFixed(3)+')');gr.addColorStop(1,'rgba(255,190,100,0)');g.fillStyle=gr;g.fillRect(f[1]-46,f[2]-62,92,92)}
 g.globalCompositeOperation='source-over';
 if(n>.05){g.fillStyle='rgba(14,20,50,'+(.3*n).toFixed(3)+')';g.fillRect(0,0,RMW,RMH)}
 // small things waiting to be looked at, and the thing worth taking
 const list=rmThings();
 for(let i=0;i<list.length;i++){const p=THPOS[i%THPOS.length];if(RMREAD[ROOM+i])continue;
  const ig=g.createRadialGradient(p[0],p[1]-3,1,p[0],p[1]-3,9);ig.addColorStop(0,'rgba(255,240,200,.5)');ig.addColorStop(1,'rgba(255,240,200,0)');
  g.fillStyle=ig;g.fillRect(p[0]-9,p[1]-12,18,18);g.fillStyle='#fff2c0';g.fillRect(p[0]-1,p[1]-5+Math.round(Math.sin(t*3+i)),2,2)}
 if(!RMTAKE){const bob=Math.round(Math.sin(t*2.5)*1.5),ig=g.createRadialGradient(ix,iy-7,1,ix,iy-7,14);ig.addColorStop(0,'rgba(255,233,168,.55)');ig.addColorStop(1,'rgba(255,233,168,0)');
  g.fillStyle=ig;g.fillRect(ix-14,iy-21,28,28);g.fillStyle='#fff2c0';g.fillRect(ix-3,iy-10+bob,6,5);g.fillStyle='#c9a25a';g.fillRect(ix-3,iy-5+bob,6,2)}
 // drifting dust, and a soft vignette
 for(let k=0;k<16;k++){const x=(win?win[1]:190)-8+((k*47+t*(2+k%3))%90)+Math.sin(t*.6+k)*5,y=44+((k*29+t*(3+k%4)*1.3)%(RMH-60));g.fillStyle='rgba(255,244,214,'+(.16+.12*Math.sin(t*1.7+k*2)).toFixed(2)+')';g.fillRect(x|0,y|0,1,1)}
 const v=g.createRadialGradient(RMW/2,RMH/2+10,RMH*.45,RMW/2,RMH/2+10,RMW*.62);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(10,6,2,.4)');g.fillStyle=v;g.fillRect(0,0,RMW,RMH)};

// Enter / Space / E keeps the conversation going
addEventListener('keydown',e=>{
 let md;try{md=MODE}catch(err){return}          // early key press before 160-explore is in
 if(md!=='room'||e.repeat)return;const k=e.key.toLowerCase();
 if(k==='enter'||k===' '||k==='e'){e.preventDefault();$('rmcard').click()}});

/* ================= v4: THE PAINTINGS =================
   Seven original pixel paintings in the manner of old woodblock prints and modern koi art: gold-leaf and red sun,
   ink yin-yang koi, lilies, red carp on black waves, a moon pond, a flying fish, carp under wisteria.
   They are painted from code once, hung wherever each wall has a gap, and you can tap one to read about it. */
const rmDiscP=(g,cx,cy,r,c)=>{g.fillStyle=c;for(let y=-r;y<=r;y++){const w=Math.floor(Math.sqrt(Math.max(0,r*r-y*y)+.25));g.fillRect(Math.round(cx-w),Math.round(cy+y),w*2+1,1)}};
const rmLn=(g,x0,y0,x1,y1,c)=>{g.fillStyle=c;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let k=0;k<=n;k++)g.fillRect(Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),1,1)};
const rmClip=(g,x,y,w,h,fn)=>{g.save();g.beginPath();g.rect(x,y,w,h);g.clip();fn();g.restore()};
const rmGrad=(g,w,h,a,b,n)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=y/h+(n?(hh(x,y)-.5)*n:0);g.fillStyle=rmRgb(rmMx(a,b,Math.max(0,Math.min(1,k))));g.fillRect(x,y,1,1)}};
// seigaiha: the overlapping-wave scale pattern of old prints
function seig(g,x0,y0,w,h,cs,R){for(let row=-1;row*R*.5<h+R;row++)for(let i=-1;i*2*R<w+2*R;i++){const cx=x0+i*2*R+(row&1)*R,cy=y0+row*R*.5+R,st=Math.ceil(R/cs.length);for(let k=0;k<cs.length;k++)rmDiscP(g,cx,cy,R-k*st,cs[k])}}
// a koi along a curved spine: shaded body, patches, scale dither, fan tail, pectoral fins, an eye
function rmKoi(g,x0,y0,x1,y1,bend,wm,p){
 const mx=(x0+x1)/2-(y1-y0)*bend,my=(y0+y1)/2+(x1-x0)*bend,N=64;
 const P=s=>{const u=1-s;return[u*u*x0+2*u*s*mx+s*s*x1,u*u*y0+2*u*s*my+s*s*y1]};
 const[tx,ty]=P(1),[ax,ay]=P(.9),ta=Math.atan2(ty-ay,tx-ax);
 for(let k=-4;k<=4;k++){const a=ta+k*.2;for(let r=0;r<wm*1.8;r++){g.fillStyle=rmRgb((r+k)&1?p.fin:p.finB);g.fillRect(Math.round(tx+Math.cos(a)*r),Math.round(ty+Math.sin(a)*r),1,1)}}
 for(const s0 of[.2,.3]){const[fx,fy]=P(s0),[gx,gy]=P(s0+.04),dx=gx-fx,dy=gy-fy,l=Math.hypot(dx,dy)||1;
  for(const sd of[-1,1])rmLn(g,fx-dy/l*sd*wm*.6,fy+dx/l*sd*wm*.6,fx-dy/l*sd*wm*1.7+dx/l*wm*1.8,fy+dx/l*sd*wm*1.7+dy/l*wm*1.8,rmRgb(p.fin))}
 for(let i=0;i<=N;i++){const s=i/N,[px,py]=P(s),[qx,qy]=P(Math.min(1,s+.02)),dx=qx-px,dy=qy-py,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,
  w=wm*(.35+.65*Math.sin(Math.min(1,s*1.6+.05)*Math.PI*.55+.35))*(1-s*.62);
  for(let o=-w;o<=w;o+=.6){const X=Math.round(px+nx*o),Y=Math.round(py+ny*o),n=vn(X*.3+p.seed,Y*.3+p.seed*.7);
   let c=p.base;if(n>p.t1)c=p.a;else if(n<p.t2)c=p.b;
   const lit=1.12-(o/w+1)*.14,sc=(((X>>1)+(Y>>1))&1)?.93:1;
   g.fillStyle=rmRgb([c[0]*lit*sc,c[1]*lit*sc,c[2]*lit*sc].map(v=>Math.min(255,v)));g.fillRect(X,Y,1,1)}}
 const[hx,hy]=P(.05),[h2x,h2y]=P(.09),hn=Math.hypot(h2x-hx,h2y-hy)||1;
 rmBx(g,'#14100c',hx-(h2y-hy)/hn*wm*.45,hy+(h2x-hx)/hn*wm*.45,1,1)}

const ARTSZ={sun:[26,36],yinyang:[26,36],lilies:[26,36],waves:[26,36],moon:[26,36],hiroshige:[38,24],wisteria:[38,24]};
const ARTINFO={
 sun:['Koi and the Red Sun','Gold leaf, a red sun and one fish that will not sit still. Mizu insisted on this one.'],
 yinyang:['Yin and Yang','Two koi chase each other round a red sun. The ink looks wet. The painter wants you to think so.'],
 lilies:['Among the lilies','Three koi and far too many pads. The painter could not get the green right and signed it anyway.'],
 waves:['Red koi, black waves','The old story: a carp that climbs the wave becomes a dragon at the top. This one is still climbing.'],
 moon:['The moon pond','The same pond, after midnight. The koi do not sleep so much as wait.'],
 hiroshige:['A flying fish','In the manner of the old woodblock prints. The poem in the corner says only that the water was cold.'],
 wisteria:['Carp beneath wisteria','Pale fish under hanging flowers. Everything in this picture is moving slowly, on purpose.']};
const ARTP={
 sun(g,w,h){
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){g.fillStyle=rmRgb(rmMx([170,124,40],[228,180,78],vn(x*.5,y*.5)*.5+hh(x,y)*.5));g.fillRect(x,y,1,1)}
  for(let r=11;r>=2;r-=3)rmDiscP(g,13,13,r,(r/3|0)%2?'#b8241c':'#a21c16');
  for(let k=0;k<12;k++)rmBx(g,'#f0d070',hh(k,1)*w,hh(k,2)*24,2,2);
  rmClip(g,0,26,w,10,()=>seig(g,0,25,w,14,['#1c2c64','#34508c','#1c2c64','#7a9ac4'],5));
  rmKoi(g,19,8,6,31,.55,5.2,{base:[240,234,216],a:[228,120,42],b:[176,40,30],fin:[238,228,208],finB:[214,196,170],seed:3,t1:.58,t2:.3})},
 yinyang(g,w,h){
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){g.fillStyle=rmRgb(rmMx([232,230,224],[196,194,192],vn(x*.4,y*.4)*.8));g.fillRect(x,y,1,1)}
  for(let k=0;k<46;k++)rmBx(g,'#8e8e92',hh(k,3)*w,hh(k,4)*h,1,1);
  rmDiscP(g,13,15,10,'#c8382c');
  for(let x=0;x<w;x++){const top=27+Math.round(Math.sin(x*.55)*1.5);rmBx(g,'#16161a',x,top,1,h-top);rmBx(g,'#d8d6d0',x,top+4+Math.round(Math.sin(x*.55+1)*1.2),1,1);rmBx(g,'#d8d6d0',x,top+7+Math.round(Math.sin(x*.55+2)*1.2),1,1)}
  rmKoi(g,14,25,5,7,-.6,4.6,{base:[26,24,30],a:[66,64,76],b:[12,12,16],fin:[44,44,52],finB:[24,24,30],seed:7,t1:.66,t2:.2});
  rmKoi(g,15,8,21,28,-.55,4.6,{base:[248,246,240],a:[228,224,216],b:[255,255,252],fin:[240,238,232],finB:[214,210,202],seed:9,t1:.7,t2:.25});
  rmLn(g,0,6,13,1,'#3a2418');rmLn(g,6,4,8,10,'#3a2418');rmLn(g,10,2,12,7,'#3a2418');
  for(const[x,y]of[[2,5],[5,3],[8,8],[11,1],[12,6],[3,9]]){rmBx(g,'#d03a4a',x-1,y-1,3,3);rmBx(g,'#f0a0a8',x,y,1,1)}},
 lilies(g,w,h){
  rmGrad(g,w,h,[248,240,178],[196,214,146],.12);
  for(let k=0;k<5;k++)for(let y=2;y<h;y++)rmBx(g,k%2?'#3a6a3a':'#2c5a30',19+k*2+Math.round(Math.sin(y*.18+k)*1.5),y,1,1);
  rmKoi(g,8,6,15,18,.4,3.6,{base:[244,150,60],a:[252,214,160],b:[214,90,40],fin:[248,170,96],finB:[226,120,60],seed:2,t1:.6,t2:.3});
  rmKoi(g,6,27,22,15,-.3,4.6,{base:[200,54,50],a:[244,176,176],b:[140,30,34],fin:[220,96,92],finB:[170,50,50],seed:12,t1:.62,t2:.3});
  rmKoi(g,9,32,24,25,-.25,3.8,{base:[232,110,60],a:[250,210,170],b:[186,60,40],fin:[240,140,90],finB:[200,90,60],seed:5,t1:.6,t2:.3});
  for(const[x,y,r]of[[5,30,5],[14,34,3],[20,28,3],[4,19,3],[12,22,3]]){rmDiscP(g,x,y,r,'#2a6a30');rmDiscP(g,x,y,r-1,'#4a9a4c');rmBx(g,'#a8d890',x-1,y-1,2,1)}
  rmBx(g,'#e88aa0',4,18,3,2);rmBx(g,'#f8c0cc',5,17,1,1)},
 waves(g,w,h){
  rmBx(g,'#141416',0,0,w,h);seig(g,0,-2,w,h+4,['#2c2c32','#4a4a54','#8a8a96','#2c2c32'],5);
  for(let k=0;k<7;k++)rmBx(g,'#e8e8ee',hh(k,2)*(w-3),22+hh(k,5)*13,3,1);
  rmKoi(g,6,8,21,31,-.4,6,{base:[218,56,36],a:[242,106,60],b:[150,30,24],fin:[228,72,46],finB:[172,38,28],seed:11,t1:.62,t2:.3});
  for(const[cx,cy]of[[20,6],[5,25],[21,19]]){for(let i=0;i<5;i++){const a=i*1.2566;rmDiscP(g,cx+Math.cos(a)*2.3,cy+Math.sin(a)*2.3,1,'#e0382a')}rmBx(g,'#f4d06a',cx,cy,1,1)}},
 moon(g,w,h){
  rmGrad(g,w,h,[12,18,50],[34,56,104],0);
  for(let k=0;k<18;k++)rmBx(g,'#fff2c8',hh(k,6)*w,hh(k,7)*18,1,1);
  rmDiscP(g,17,9,9,'rgba(240,220,150,.16)');rmDiscP(g,17,9,6,'#f0d88c');rmDiscP(g,19,8,4,'#f8ebb0');
  rmBx(g,'#0e1c44',0,20,w,16);
  for(let i=0;i<6;i++)rmBx(g,'rgba(240,216,140,'+(.55-i*.08).toFixed(2)+')',13+Math.round(Math.sin(i*1.3)*2)+((i*2)>>1),22+i*2,9-i,1);
  for(let k=0;k<6;k++)rmBx(g,'rgba(180,200,235,.35)',hh(k,8)*(w-8),21+hh(k,9)*14,7,1);
  rmKoi(g,7,29,20,22,.5,3.8,{base:[206,214,228],a:[238,244,252],b:[130,150,186],fin:[196,206,226],finB:[150,168,204],seed:4,t1:.62,t2:.28})},
 hiroshige(g,w,h){
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){let c=rmMx([240,226,192],[224,208,170],vn(x*.3,y*.3));if(y<4)c=rmMx(c,[200,216,214],.4);if(y>18)c=rmMx(c,[188,206,208],.45);g.fillStyle=rmRgb(c);g.fillRect(x,y,1,1)}
  for(let c=0;c<4;c++)for(let r=0;r<5;r++)rmBx(g,'#4a3a2a',26+c*3,2+r*3+((hh(c,r)*2)|0),1,2);
  rmBx(g,'#c03a2a',34,3,3,3);rmBx(g,'#c03a2a',2,20,3,3);
  rmKoi(g,5,9,30,14,.15,3.6,{base:[40,82,128],a:[66,114,154],b:[26,52,92],fin:[50,92,134],finB:[32,62,104],seed:5,t1:.68,t2:.25});
  for(let k=0;k<9;k++)rmLn(g,11,10,20+k,3+(k>>2),'#3a6a9a');
  rmKoi(g,8,20,27,18,-.2,2.7,{base:[166,182,186],a:[192,204,206],b:[128,146,154],fin:[176,190,194],finB:[146,164,170],seed:8,t1:.66,t2:.3});
  rmDiscP(g,31,19,1,'#c43a2a');rmBx(g,'#c43a2a',29,19,5,1);rmBx(g,'#c43a2a',31,17,1,5)},
 wisteria(g,w,h){
  rmGrad(g,w,h,[198,216,202],[148,184,176],.1);
  for(let k=0;k<12;k++)rmBx(g,'rgba(240,250,250,.5)',hh(k,3)*(w-6),hh(k,6)*h,5,1);
  rmKoi(g,8,10,26,15,.25,3.8,{base:[240,238,228],a:[216,198,152],b:[120,120,92],fin:[236,232,220],finB:[200,196,180],seed:6,t1:.62,t2:.26});
  rmKoi(g,27,19,9,20,-.2,3.1,{base:[172,152,102],a:[198,178,122],b:[110,96,70],fin:[160,142,98],finB:[130,114,80],seed:14,t1:.6,t2:.3});
  rmLn(g,20,0,38,2,'#4a3a28');
  for(let k=0;k<6;k++){const cx=22+k*3;for(let j=0;j<9-(k%2)*2;j++)rmBx(g,j%3?'#9a78c8':'#c4a8e4',cx+Math.round(Math.sin(j+k)*1),2+j,2,1);rmBx(g,'#4a8a46',cx-1,1,2,1)}}};
const ARTC={};
function artCanvas(k){if(ARTC[k])return ARTC[k];const[w,h]=ARTSZ[k],c=mk(w,h);ARTP[k](c.getContext('2d'),w,h);return ARTC[k]=c}
WK.art=function(g,x,y,t,R,D,k){const c=artCanvas(k),w=ARTSZ[k][0],h=ARTSZ[k][1];
 rmBx(g,'rgba(0,0,0,.28)',x-1,y+1,w+6,h+6);rmBx(g,'#1e130b',x-3,y-3,w+6,h+6);rmBx(g,rmC(R.accent,-.3),x-2,y-2,w+4,h+4);rmBx(g,'#1e130b',x-1,y-1,w+2,h+2);
 g.drawImage(c,x,y);for(let i=0;i<7;i++)rmBx(g,'rgba(255,255,255,.07)',x+2+i,y+h-3-i*2,2,2);rmBx(g,'rgba(255,255,255,.1)',x,y,w,1);
 rmBx(g,'#e8c86a',x+((w/2)|0)-1,y-6,2,2)};
FK.easel=function(g,x,y,t,R,D){const k=D.easel||'sun',c=artCanvas(k),w=c.width,h=c.height;
 rmLn(g,x-9,y,x-4,y-h-6,'#6a4a2a');rmLn(g,x+9,y,x+4,y-h-6,'#6a4a2a');rmLn(g,x,y-8,x,y-h-9,'#5a3d22');
 rmBx(g,'#3a2616',x-w/2-2,y-h-12,w+4,h+4);g.drawImage(c,x-w/2,y-h-10);rmBx(g,'#4a331c',x-w/2-3,y-14,w+6,2);
 rmBx(g,'#e8d8a8',x+w/2+5,y-6,5,4);rmBx(g,'#c8382c',x+w/2+6,y-7,2,1);rmBx(g,'#2a4a8a',x+w/2+8,y-7,1,1)};
FKS.easel=13;

// ---- the kingdom's rooms: four doors inside the Star Keep's walls ----
Object.assign(FK,{
 anvil(g,x,y){rmBx(g,'#3a2616',x-6,y-3,12,4);rmBx(g,'#2a2a30',x-8,y-7,16,4);rmBx(g,'#4a4a52',x-10,y-10,20,4);rmBx(g,'#7a7a84',x-10,y-10,20,1);rmBx(g,'#4a4a52',x+10,y-9,5,2)},
 forge(g,x,y,t){const f=.75+.25*Math.sin(t*9);rmBx(g,'#4a3a32',x-6,y-40,12,26);rmBx(g,'#5a4a42',x-15,y-18,30,18);rmBx(g,'#3a2a24',x-15,y-18,30,3);rmBx(g,'#1a0e0a',x-10,y-14,20,11);
  rmBx(g,'rgba(255,150,50,'+(.85*f).toFixed(2)+')',x-9,y-7,18,4);rmBx(g,'rgba(255,220,120,'+(.8*f).toFixed(2)+')',x-5,y-8,10,2);
  for(let k=0;k<3;k++){const p=(t*.6+k/3)%1;rmBx(g,'rgba(255,200,100,'+(.7*(1-p)).toFixed(2)+')',x-6+k*5+Math.sin(p*6)*2,y-12-p*26,1,1)}
  const gr=g.createRadialGradient(x,y-8,2,x,y-8,48);gr.addColorStop(0,'rgba(255,140,50,'+(.28*f).toFixed(2)+')');gr.addColorStop(1,'rgba(255,140,50,0)');g.fillStyle=gr;g.fillRect(x-48,y-56,96,96)},
 bar(g,x,y){rmBx(g,'#3a2616',x-30,y-12,60,12);rmBx(g,'#4a331c',x-29,y-11,58,10);rmBx(g,'#8a6a42',x-31,y-15,62,4);rmBx(g,'#a88858',x-31,y-15,62,1);
  for(let i=0;i<4;i++){rmBx(g,'#d8c8a0',x-22+i*9,y-20,4,5);rmBx(g,'#8a6a2a',x-22+i*9,y-19,4,2)}rmBx(g,'#4a4a52',x+22,y-24,2,9);rmBx(g,'#6a4a2a',x+20,y-27,6,3)},
 table(g,x,y,t){rmBx(g,'#4a331c',x-2,y-8,4,9);g.fillStyle='#6a4a2a';g.beginPath();g.ellipse(x,y-10,13,5,0,0,6.283);g.fill();g.fillStyle='#8a6a42';g.beginPath();g.ellipse(x,y-11,13,4.5,0,0,6.283);g.fill();
  rmBx(g,'#efe6cc',x-1,y-17,2,6);rmBx(g,'rgba(255,200,100,'+(.7+.3*Math.sin(t*10+x)).toFixed(2)+')',x-1,y-20,2,3);rmBx(g,'#d8c8a0',x+6,y-14,3,3)},
 bookcase(g,x,y){rmBx(g,'#3a2616',x-15,y-46,30,46);rmBx(g,'#1e150e',x-13,y-44,26,42);
  for(let r=0;r<4;r++){rmBx(g,'#5a3d22',x-14,y-34+r*11,28,2);for(let c=0;c<8;c++){const h=7+((hh(c,r+x)*3)|0);rmBx(g,['#8a3a2a','#3a5a6a','#c8a44a','#4a6a3a','#6a3a6a','#d8c8a0'][(c+r*3)%6],x-12+c*3,y-35+r*11+(8-h),2,h)}}},
 pew(g,x,y){rmBx(g,'#4a331c',x-16,y-4,3,5);rmBx(g,'#4a331c',x+13,y-4,3,5);rmBx(g,'#6a4a2a',x-16,y-9,32,5);rmBx(g,'#8a6a42',x-16,y-9,32,1);rmBx(g,'#5a3d22',x-16,y-18,32,7);rmBx(g,'#7a5a34',x-16,y-18,32,1)},
 altar(g,x,y,t){rmBx(g,'#8a8470',x-16,y-16,32,16);rmBx(g,'#bcb49c',x-16,y-16,32,3);rmBx(g,'#6a1d17',x-13,y-13,26,6);rmBx(g,'#e8c86a',x-1,y-12,2,3);
  for(const dx of[-10,9]){rmBx(g,'#efe6cc',x+dx,y-23,2,7);rmBx(g,'rgba(255,200,100,'+(.7+.3*Math.sin(t*9+dx)).toFixed(2)+')',x+dx,y-26,2,3)}rmBx(g,'#e8c86a',x-2,y-34,4,1);rmBx(g,'#e8c86a',x-1,y-36,2,5)},
 lectern(g,x,y){rmBx(g,'#4a331c',x-2,y-14,4,15);rmBx(g,'#6a4a2a',x-8,y-20,16,6);rmBx(g,'#e8dfc4',x-7,y-23,6,5);rmBx(g,'#e8dfc4',x+1,y-23,6,5);rmBx(g,'#8a7a5a',x-1,y-23,2,5)}});
Object.assign(FKS,{anvil:11,forge:15,bar:30,table:13,bookcase:15,pew:16,altar:16,lectern:8});
const KPAL={tavern:[[178,86,52],[84,60,44],[96,60,36],[226,180,142],[232,196,96]],library:[[84,104,150],[60,64,88],[200,190,170],[230,196,160],[120,150,200]],smithy:[[96,96,104],[60,44,36],[40,32,28],[214,164,126],[220,110,50]],chapel:[[220,214,200],[120,100,150],[210,200,180],[232,196,160],[228,182,72]]};
const KROOM={
 tavern:{name:'The Last Lantern',owner:'Brin',pal:KPAL.tavern,wall:'#6a4a30',floor:'#7a5a3a',accent:'#e8b45a',
  lines:['Everyone who reaches the keep stops here first. The lantern is kept lit for the ones still on the road.','Eight colleges, one collective. The regulars say it began as a group chat and became a habit.','Pull up a stool. The soup is always the same and always right, which is a design principle.'],
  item:['A tavern token','Stamped with a lantern. Good for one bowl of soup and one honest opinion.'],ox:112,oy:96,ix:240,iy:128},
 library:{name:'The archive of unfinished things',owner:'Oriel',pal:KPAL.library,wall:'#4a4e62',floor:'#6a6a76',accent:'#9fb6e0',
  lines:['Every shelf is a project that did not quite end. A library of those is more honest than a library of finished ones.','Fifty four attempts at P versus NP are filed under N, for Not yet. Most of them ended in no, and the next one starts anyway.','The story of the vector memory that poisoned itself is in the third drawer. Read it before you trust any assistant.'],
  item:['A reading list','A short list of things worth learning next, in the order they scare him.'],ox:200,oy:118,ix:100,iy:130},
 smithy:{name:'The star forge',owner:'Gantry',pal:KPAL.smithy,wall:'#4a443e',floor:'#6a645a',accent:'#e8802f',
  lines:['You learn what a thing is by trying to break it. That is the whole of security, and most of smithing.','I forge. He tests. Between us nothing leaves this rock soft.','Security+, CEH, and a lot of quiet nights in a terminal. It is a long road and I like the look of it.'],
  item:['A hammered brass key','Still warm. It fits nothing yet, which is the best kind of key.'],ox:210,oy:122,ix:70,iy:128},
 chapel:{name:'The quiet hall',owner:'Sister Anu',pal:KPAL.chapel,wall:'#8a8470',floor:'#9a9480',accent:'#e8c86a',
  lines:['Keeping promises is the price of the keeping. It is carved over the door, in case you wondered about the chair.','There is one empty seat at the end of the long table. It is not for a king. It is for whoever finishes.','Come back when you have found everything. The bell has been waiting a long time.'],
  item:['A candle stub','Lit once for the village, the fish, the far ends of the road and the sky.'],ox:160,oy:100,ix:60,iy:150}};
for(const k in KROOM)ROOMS[k]=Object.assign({},HOMEKIT,KROOM[k],{furn:[['rug',160,142]]});
Object.assign(RDEC,{
 tavern:{wall:'plank',floor:'plank',view:'cloud',w:[['window',0,6],['lantern',0,6],['jars',0,12],['fish',0,8],['map',0,8]],f:[['bar',100,78],['table',240,112],['table',252,152],['barrelb',20,80],['barrelb',32,86],['cat',150,70],['lanternf',304,90]]},
 library:{wall:'stone',floor:'tile',view:'stars',w:[['window',0,6],['chart',0,6],['scroll',0,8],['clock',0,14],['lantern',0,6]],f:[['bookcase',26,82],['bookcase',58,82],['bookcase',298,86],['lectern',236,112],['globe',270,150],['stool',150,72],['cat',100,166]]},
 smithy:{wall:'stone',floor:'stone',view:'cloud',w:[['tools',0,6],['window',0,6],['tools',0,6],['hooks',0,8],['lantern',0,6]],f:[['forge',270,82],['anvil',200,124],['toolbox',20,92],['bucket',240,130],['woodpile',302,152],['sack',24,126]]},
 chapel:{wall:'plaster',floor:'tile',view:'sakura',w:[['scroll',0,6],['window',0,6],['window',0,6],['lantern',0,6],['lantern',0,6],['scroll',0,6]],f:[['altar',160,78],['pew',90,128],['pew',230,128],['pew',90,160],['pew',230,160],['incense',40,92]]}});

// ---- hang them: frames out, art into every gap the wall has ----
const WBX={window:[-6,56],clock:[-9,18],lantern:[-6,12],bell:[-7,14],calendar:[0,18],tools:[0,42],cogs:[0,30],map:[0,34],jars:[0,38],fish:[0,32],oars:[0,24],chart:[0,36],scroll:[0,16],antlers:[0,28],herbs:[0,30],board:[0,36],pigeon:[0,50],hooks:[0,36],blueprint:[0,32],tapestry:[0,24],mask:[0,14]};
const ARTPREF={gate:['sun','waves','lilies'],mess:['lilies','sun','waves'],library:['yinyang','moon','hiroshige'],smithy:['waves','hiroshige','moon'],market:['lilies','sun','waves'],tea:['wisteria','lilies','moon'],keepshrine:['yinyang','wisteria','moon'],southwatch:['moon','waves','hiroshige'],mill:['sun','hiroshige','lilies'],workshop:['waves','lilies','moon'],barn:['lilies','wisteria','sun'],desk:['yinyang','wisteria','lilies'],office:['sun','waves','lilies'],sen:['hiroshige','wisteria','waves'],boathouse:['hiroshige','waves','moon'],bridge:['moon','waves','sun'],lookout:['moon','sun','wisteria'],hermit:['wisteria','yinyang','moon'],keep:['sun','moon','waves'],shrine:['yinyang','sun','wisteria'],post:['lilies','hiroshige','sun'],pagoda:['yinyang','wisteria','sun'],dome:['moon','hiroshige','waves']};
const ARTHIT={};
const ARTEASEL={desk:['lilies',24,132],pagoda:['yinyang',96,148],hermit:['moon',62,126]};
// least precious decor goes first when a wall is too crowded to also hold paintings
const WDROP=['mask','calendar','board','scroll','clock','herbs','fish','blueprint','tools','hooks','jars','oars','cogs','map','antlers','bell','chart','lantern'];
const wbx=w=>WBX[w[0]]||(w[0]==='art'?[-3,ARTSZ[w[3]][0]+6]:[0,20]);
for(const id in ROOMS){
 const D=RDEC[id]||(RDEC[id]=Object.assign({},RDEC._,{w:RDEC._.w.slice(),f:RDEC._.f.slice()}));
 let items=D.w.filter(w=>w[0]!=='frame').map(w=>w.slice()).sort((a,b)=>a[1]-b[1]);
 const arts=(ARTPREF[id]||['sun','moon','lilies']).slice(0,3).map(k=>['art',0,ARTSZ[k][1]>30?3:9,k]);
 const layout=()=>{const s=items.slice();arts.forEach((a,j)=>s.splice(Math.min(s.length,Math.round((j+1)*(items.length+1)/(arts.length+1))+j),0,a));return s};
 let seq=layout();const sum=()=>seq.reduce((s,w)=>s+wbx(w)[1],0);
 while(RMW-sum()<(seq.length+1)*5){
  const k=WDROP.find(d=>seq.some(w=>w[0]===d));
  if(!k){if(arts.length>2){arts.pop();seq=layout();continue}break}
  const it=seq.find(w=>w[0]===k);seq.splice(seq.indexOf(it),1);items=items.filter(w=>w!==it)}
 const gap=(RMW-sum())/(seq.length+1);let cx=gap;D.w=[];ARTHIT[id]=[];
 for(const w of seq){const b=wbx(w);w[1]=Math.round(cx-b[0]);cx+=b[1]+gap;D.w.push(w);
  if(w[0]==='art'){const[aw,ah]=ARTSZ[w[3]];ARTHIT[id].push([w[1],w[2],aw,ah,w[3]])}}
 if(ARTEASEL[id]){const[k,x,y]=ARTEASEL[id];D.easel=k;D.f.push(['easel',x,y])}}

// tap a painting to read about it
{const cv=$('rmcv');
 const at=e=>{const r=cv.getBoundingClientRect(),mx=(e.clientX-r.left)/r.width*RMW,my=(e.clientY-r.top)/r.height*RMH;return(ARTHIT[ROOM]||[]).find(a=>mx>=a[0]-3&&mx<=a[0]+a[2]+3&&my>=a[1]-3&&my<=a[1]+a[3]+3)};
 cv.addEventListener('pointerdown',e=>{if(!ROOM)return;const h=at(e);if(!h)return;e.stopImmediatePropagation();
  const c=ARTINFO[h[4]];RMGOAL=null;RMTALK=0;$('rmcard').innerHTML='<span class="who">'+c[0]+'</span>'+c[1];$('rmhint').textContent='Painted in the manner of the old koi prints.'},true);
 cv.addEventListener('pointermove',e=>{cv.style.cursor=ROOM&&at(e)?'pointer':''})}

// the doors of the kingdom
if(typeof KINGDOM!=='undefined')for(const id of['tavern','library','smithy','chapel'])DOORS.push({id,house:KINGDOM[id],off:[-0.41,1.5],room:id});
