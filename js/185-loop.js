/* the animation loop
   this file is one piece of the village; they load in the order listed in index.html */


let fT=0,fN=0;
function frame(ms){
 const t=ms/1000,dt=Math.min(t-last,.1);last=t;T=calm?T+dt*.3:t;
 for(const k in cur)cur[k]+=(tgt[k]-cur[k])*Math.min(dt*2,1);
  startle*=Math.pow(.35,dt);
  if(stc)stepPeople(dt);
 for(let f=0;f<4;f++)KA[f]+=dt*(.35+.07*f)*(1+startle*4)*(calm?.3:1);
 flash*=.9;
 if(cur.storm>.5&&T>nextBolt){nextBolt=T+3+Math.random()*6;ripple(Math.random()*innerWidth,Math.random()*innerHeight,1.5);if(!calm){flash=.6;thunder()}}
 // Adaptive resolution: if the device can't hold ~30fps, render fewer, bigger pixels.
 if(dt<.1){fT+=dt;fN++}
 if(fN>=90){if(fT/fN>.034&&WS<4&&!window.__hq){WS++;rz()}fT=0;fN=0}
 fx();sndUpdate();
 if(GL.ok){GL.acc=GL.acc*.9+dt*.1;GL.ticks++;
  if(dt>.15&&GL.q>.26&&!window.__hq){GL.q=Math.max(.26,GL.q*.6);sizeGL();GL.acc=.016;GL.ticks=0}
  else if(GL.ticks>=14){const want=GL.acc>.033?.32:GL.acc<.016?.92:GL.q;
   if(Math.abs(want-GL.q)>.06){GL.q=want;sizeGL()}
   GL.acc=.016;GL.ticks=0}}
 requestAnimationFrame(frame)}
requestAnimationFrame(frame);
