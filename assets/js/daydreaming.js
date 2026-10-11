
(function(){
  let run=0;
  const lines=["YOU DON'T HAVE TO GO ANYWHERE.","JUST KEEP FLOATING."];
  window.openDaydream=function(){
    const stage=document.getElementById('daydreamExperience');
    const overlay=document.getElementById('daydreamOverlay');
    const copy=document.getElementById('daydreamCopy');
    const video=document.getElementById('daydreamVideo');
    const audio=document.getElementById('daydreamAudio');
    if(!stage||!overlay||!copy||!video||!audio) return;
    run++; const id=run;
    stage.classList.add('active'); stage.setAttribute('aria-hidden','false');
    overlay.classList.remove('hide'); copy.classList.remove('show'); copy.textContent='';
    video.currentTime=0; audio.currentTime=0; audio.volume=.65;
    video.pause();
    audio.pause();
    let i=0;
    function next(){
      if(id!==run) return;
      copy.classList.remove('show');
      setTimeout(()=>{
        if(id!==run) return;
        copy.textContent=lines[i]; copy.classList.add('show');
        setTimeout(()=>{
          if(id!==run) return;
          copy.classList.remove('show');
          setTimeout(()=>{
            if(id!==run) return;
            i++;
            if(i<lines.length){next();}
            else{
              overlay.classList.add('hide');
              video.currentTime=0;
              audio.currentTime=0;
              const vp=video.play(); if(vp&&vp.catch) vp.catch(()=>{});
              const ap=audio.play(); if(ap&&ap.catch) ap.catch(()=>{});
              if(typeof window.startDaydreamEncouragement === "function"){
                window.startDaydreamEncouragement();
              }
              if(typeof window.startDaydreamRewardMonitor === "function"){
                window.startDaydreamRewardMonitor();
              }
            }
          },700);
        },2200);
      },400);
    }
    next();
  };
  window.closeDaydream=function(){
    run++;
    const stage=document.getElementById('daydreamExperience');
    const video=document.getElementById('daydreamVideo');
    const audio=document.getElementById('daydreamAudio');
    if(video) video.pause(); if(audio) audio.pause();
    if(stage){stage.classList.remove('active');stage.setAttribute('aria-hidden','true');}
  };
})();
