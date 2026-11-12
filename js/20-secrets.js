// ---- secrets: faint glints in the scenery ----
const SEC=[
 {id:'shrine',at:[34.6,11.6],t:'Shrine offering',x:'Five Sekiro clears and two Ghost of Tsushima runs. He likes a hard fight he can learn his way through.'},
 {id:'cart',at:[32.6,22.0],t:'The jugaad cart',x:'Flux took about fifty four days and cost nothing. When the budget is zero, the cart still rolls.'},
 {id:'mill',at:[8.6,5.6],t:'Windmill ledger',x:'Fifty four P versus NP experiments are stacked up here. Unsolved. Not abandoned.'},
 {id:'boat',at:[21.2,23.0],r:6.4,t:'A nebula in the boat',x:'He once sketched a purple nebula shader pack, planets visible even in daylight. It lives in a notebook now.'},
 {id:'lookout',at:[35.6,40.2],t:'The lookout',x:'Philosophy, cosmology, and whether today’s models are real AI. The arguments happen up here, mostly with himself.'},
 {id:'falls',at:[62.2,25.6],r:2.6,t:'Where the stream ends',x:'The brook drops into the cloud sea. Old experiments go over the edge to keep running somewhere you cannot see.'},
 {id:'islet',at:[26.5,24.5],r:6.4,t:'The wishing islet',x:'The pond only grants wishes to visitors who heard the villagers out. You have, so far, heard something.'},
 {id:'hermit',at:[51.0,15.4],t:'The hermit’s house',x:['Day 1. The sky-sea was empty. I had a question and no map, so I stacked a stone on a cloud and called it a village.','Day 54. The mill turns without me now. The ticket counter holds. A thing finished is a thing that can leave.','The boy from the farm kept asking why. Every why became an island. The farm came first: taking things apart to see how they ran.','The koi was the first thing he wrote that surprised him. I named it Mizu. It still answers when someone drops a coin.','My rule: build with what you have, check what you built, and never trust a thing you have not broken once. Jugaad, with tests.','If you found this house, you listened. Leave a wish in the pond, then walk to the sakura isle. The postmaster never closes the door.']},
 {id:'pagoda',at:[111,15.2],t:'Pagoda of finished things',x:'Five floors for five shipped ideas. The lanterns below are the ones still being built.'},
 {id:'telescope',at:[135.4,21.4],t:'The long telescope',x:['He ground the mirror by hand and wrote the mount from scratch. The first thing he pointed it at was the moon, because it was close enough to check.','Fifty four nights of notes are stacked under the eyepiece. Not one of them says solved.']},
 {id:'signal',at:[140.9,31.4],t:'A signal from the cloud sea',x:'The dish picks up something repeating every seven turns. It is not a message from anyone. It is the pond, humming.'},
 {id:'light',at:[95.0,58.6],t:'The light on the rock',x:'The light is not for ships, because there are no ships. It is so that anything leaving at night can see the edge of the island from the outside, and know there is a shore.'},
 {id:'hulls',at:[97.4,60.2],t:'Five hulls on the stands',x:'Each one is a thing that was finished here and is now somewhere else, doing its job to somebody Shounak has never met and will never thank.'},
 {id:'golden',at:[26.2,17.7],noGlint:1,t:'The golden koi',x:'The pond keeps one that is not really a fish. It rises for people who have listened to every villager, and it gives up the only secret it owns.'}];
let FOUND=[];try{FOUND=JSON.parse(localStorage.koiFound||'[]')}catch(e){}
