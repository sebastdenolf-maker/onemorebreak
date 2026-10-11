
(function(){
  const bobLines = [
    "LET BOB ROSS DO HIS MAGIC.",
    "LET HIM TAKE YOU SOMEWHERE YOU DON'T NEED TO BE."
  ];
  let bobRun = 0;
  let rewardShown = false;

  window.openBobRoss = function(){
    const stage = document.getElementById("bobExperience");
    const intro = document.getElementById("bobIntro");
    const line = document.getElementById("bobLine");
    const video = document.getElementById("bobVideo");
    const reward = document.getElementById("bobSongLink");
    if(!stage || !intro || !line || !video || !reward) return;

    bobRun++;
    const run = bobRun;
    rewardShown = false;
    stage.classList.add("active");
    stage.classList.remove("ready");
    stage.setAttribute("aria-hidden","false");
    intro.classList.remove("hide");
    line.classList.remove("show");
    line.textContent = "";
    reward.classList.remove("show");
    video.pause();
    video.currentTime = 0;

    let i = 0;
    function next(){
      if(run !== bobRun) return;
      line.classList.remove("show");
      setTimeout(()=>{
        if(run !== bobRun) return;
        line.textContent = bobLines[i];
        line.classList.add("show");
        setTimeout(()=>{
          if(run !== bobRun) return;
          line.classList.remove("show");
          setTimeout(()=>{
            if(run !== bobRun) return;
            i++;
            if(i < bobLines.length){
              next();
            }else{
              intro.classList.add("hide");
              stage.classList.add("ready");
              video.currentTime = 0;
              const p = video.play();
              if(p && p.catch) p.catch(()=>{});
              if(typeof window.startBobEncouragement === "function"){
                window.startBobEncouragement();
              }
            }
          },700);
        },2400);
      },450);
    }
    next();
  };

  window.closeBobRoss = function(){
    bobRun++;
    const stage = document.getElementById("bobExperience");
    const video = document.getElementById("bobVideo");
    const reward = document.getElementById("bobSongLink");
    if(video) video.pause();
    if(typeof window.stopBobEncouragement === "function"){
      window.stopBobEncouragement();
    }
    if(reward) reward.classList.remove("show");
    if(stage){
      stage.classList.remove("active","ready");
      stage.setAttribute("aria-hidden","true");
    }
  };

  const bobVideo = document.getElementById("bobVideo");
  const bobReward = document.getElementById("bobSongLink");
  if(bobVideo && bobReward){
    bobVideo.addEventListener("timeupdate", ()=>{
      if(bobVideo.currentTime >= 30 && !rewardShown){
        rewardShown = true;
        bobReward.classList.add("show");
      }
    });
  }
})();
