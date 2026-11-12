// ---- the receiver: a seven turn cipher, keyed off the dish ----
const SIGC='AOL WVUK DHZ OBTTPUN MPYZA',SIGP='THE POND WAS HUMMING FIRST',SIGK=7;
let SIGD=0,SIGDONE=hasSecret('signal');
const caesar=t=>t.replace(/[A-Z]/g,ch=>String.fromCharCode(65+((ch.charCodeAt(0)-65-SIGD)%26+26)%26));
function drawSig(){
 const d=$('sdial');SIGD=d?+d.value:0;
 $('skey').textContent=String(SIGD).padStart(2,'0');
 const out=caesar(SIGC);$('sout').textContent=out;
 const ok=SIGD===SIGK;$('sout').classList.toggle('ok',ok);
 $('smsg').textContent=ok?'It lines up. The pond has been humming since before you arrived.'
   :SIGD===0?'Turn the dial until the pond speaks.':out.split(' ').length>1&&/[AEIOU]/.test(out)?'Nearly. The gaps are already in the right places.':'Turn the dial until the pond speaks.';
 if(ok&&!SIGDONE){SIGDONE=true;setTimeout(()=>{const sec=SEC.find(q=>q.id==='signal');if(sec)found(sec);setTimeout(()=>{$('sig').hidden=true},2600)},700)}
}
function openSig(){
 $('sig').hidden=false;
 const d=$('sdial');if(d)d.value=SIGDONE?SIGK:0;
 drawSig();if(d)d.focus();
}
$('sclose').onclick=()=>{$('sig').hidden=true};
$('sig').addEventListener('click',e=>{if(e.target===$('sig'))$('sig').hidden=true});
$('sdial').addEventListener('input',drawSig);


function secretTick(){for(const s of SEC){if(s.noGlint)continue;const[X,Y]=PF(s.at[0],s.at[1]),sx=(TX+X*Z)*WS,sy=(TY+(Y-16)*Z)*WS,on=sx>10&&sx<innerWidth-10&&sy>60&&sy<innerHeight-60;s.el.style.transform='translate('+sx+'px,'+sy+'px)';s.el.style.opacity=on?1:0;s.el.style.pointerEvents=on?'auto':'none'}}
seasonSet(1);skyTick();Object.assign(cur,tgt)
