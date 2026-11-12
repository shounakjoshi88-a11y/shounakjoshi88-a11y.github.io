// The capture harness only runs when a visitor explicitly asks for it, so the
// ordinary page never pays for it.
const CAP=/[?&]shot=1/.test(location.search);
let T=0,last=0,lx=0,ly=0,flash=0,nextBolt=4,startle=0;
const KA=[0,1.6,3.2,4.8,6.1,7.4];
const tgt={night:0,warm:0,rain:0,storm:0},cur={night:0,warm:0,rain:0,storm:0};
const TOD={day:[0,0],dusk:[.45,1],night:[1,0]},WX={clear:[0,0],rain:[.7,0],storm:[1,1]};
const $=id=>document.getElementById(id);

// Shelf of smaller work — every link is a real repository.
const GH='https://github.com/shounakjoshi88-a11y/';
const MORE=[
 ['AI Wire','Eighty keyless public sources, ranked and rebuilt on a schedule with no server and no database. Every card’s artwork is taken from the item, never generated.','ai-news','https://ai-news-seven-tan.vercel.app/'],
 ['Weight forensics','What can you recover from an LLM’s weights alone? Architecture, tokenizer lineage, quantization recipe and fine-tune provenance, with a live 3D neuron viewer.','llm-weight-forensics'],
 ['ACM RBU site','The student chapter site for Ramdeobaba University, with a glyph-matrix hero animation.','acm-rbu-site'],
 ['Sixty logins','A personal challenge to write sixty unique login screens with nothing but HTML, CSS and JavaScript.','60-login-page-challenge'],
 ['Voxelcraft','A Minecraft-faithful voxel sandbox built from scratch in Godot 4.','voxelcraft'],
 ['gcp-arcade','Idempotent, Cloud Shell ready automation for Google Cloud Skills Boost challenge labs.','gcp-arcade'],
 ['PayFlow','A simplified UPI-style payment gateway in Java, built to learn constructors and validation properly.','payflow-java'],
 ['one-a-day','One problem a day.','one-a-day'],
 ['garden','A daily engineering rhythm.','garden']
];


// Mizu, the koi that lives in the pond and talks back.
const LINES0={top:'Psst. Down here. I’m <b>Mizu</b>. I live in the pond at the end of the lane. Scroll when you are ready.',
 work:'Five things Shounak built that still stand when somebody else runs them. Start with <b>Flux</b> — twenty-one tools and a verifier that says no.',
 shelf:'Smaller ripples. A news wire, a weight-forensics lab, the ACM site. All real code, all in his GitHub.',
 about:'That’s the person behind the commits: second year, a collective across eight colleges, and a soft spot for race conditions.',
 wish:''};
const LINES={top:'Psst. I’m <b>Mizu</b>, from the pond. Scroll down the lane and the villagers will tell you about Shounak.',
 work:'Follow the lane. Every villager has a story.',s2:'Tap a link in the bubble to see the real code.',s3:'Keep going. The shelf is round the corner.',
 shelf:'Smaller ripples, all real repositories.',about:'My pond is just ahead. Drag across the water, the koi notice.',s6:'Keep walking east. There is a rope bridge ahead.',
 wish:''};
const TIPS=['Drag across the water. The koi notice.','Faint glints hide secrets. Try the forest past the mill.','The sky and the seasons change on their own. Stay a while.','Walk down the lane past the farm. The windmill turns.','Click me and I will jump.'];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;let typer=null,tipI=0;
function say(html){clearInterval(typer);const el=$('say');$('mizu').classList.add('hop');setTimeout(()=>$('mizu').classList.remove('hop'),450);
  const tmp=document.createElement('div');tmp.innerHTML=html;const txt=tmp.textContent;
  if(reduce||txt.length<30){el.innerHTML='<span class="who">Mizu</span>'+html;return}
  el.innerHTML='<span class="who">Mizu</span>';let i=0;
  typer=setInterval(()=>{i+=2;if(i>=txt.length){el.innerHTML='<span class="who">Mizu</span>'+html;clearInterval(typer)}else el.innerHTML='<span class="who">Mizu</span>'+txt.slice(0,i)},26)}
let MZ=null;
function splash(){for(let k=0;k<4;k++){const[px_,py]=PF(POND[0]+(Math.random()-.5)*5,POND[1]+(Math.random()-.5)*4);rps.push({x:px_,y:py,t:T+k*.18})}}
{const _s=say,SAY=$('say'),seen={};say=function(h){if(!h)return;if(Object.values(LINES).includes(h)){if(seen[h])return;seen[h]=1}SAY.classList.remove('gone');_s(h);clearTimeout(say.t);say.t=setTimeout(()=>SAY.classList.add('gone'),h.length>90?9000:6000)}}
$('mz').onclick=()=>{say(TIPS[tipI++%TIPS.length]);splash()};
function setGroup(group,k){document.querySelectorAll('#'+group+' button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===k))}
// The sky starts in the visitor's own local time of day.
