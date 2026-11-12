for(const n of['oak','pine','bush','cottage','barn','windmill','boathouse','stall','coop','wellS','teahouse','pagoda','fern','lookout','shrine','observatory','dish','signalMast','standingStone','tripod',
 'bamboo','reed','corn','sunflower','tomato','pumpkinS','stump','logS','woodpile','hermit','torii','bench','cart','crates','barrel','millWheel','pole','lamp','postbox','signpost','stoneLantern','RS']){
 const f=window[n];if(typeof f!=='function')continue;window[n]=function(){const r=f.apply(this,arguments);if(r&&r.c&&!r._rim){r._rim=1;try{rimLight(r.c)}catch(e){}
  if(r.sol===undefined&&SOLSPEC[n]!==undefined)r.sol=SOLSPEC[n]}return r}}
setMode('start');
setTimeout(()=>{const g=$('sgo');if(g)g.focus({preventScroll:true})},1200);
window.__m=()=>MODE;window.__pl=()=>PL&&{a:PL.P.a,b:PL.P.b};window.__near=()=>NEAR;window.__tp=(a,b)=>{if(!PL)return;PL.P.a=a;PL.P.b=b;CF=[a,b];GOAL=null};
requestAnimationFrame(()=>{initGL();initSurf();build();bakeCloud();initPeople();doorList();const b=$('boot');if(b){b.classList.add('done');setTimeout(()=>b.remove(),700)}setTimeout(()=>ripple(innerWidth*.5,innerHeight*.5,2),700)});
