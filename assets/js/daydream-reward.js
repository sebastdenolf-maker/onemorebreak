
(function(){
  let daydreamRewardMonitor = null;

  function stopDaydreamRewardMonitor(){
    if(daydreamRewardMonitor){
      clearInterval(daydreamRewardMonitor);
      daydreamRewardMonitor = null;
    }
  }

  window.startDaydreamRewardMonitor = function(){
    stopDaydreamRewardMonitor();

    const video = document.getElementById("daydreamVideo");
    const stage = document.getElementById("daydreamExperience");
    const reward = document.getElementById("daydreamSongLink");

    if(!video || !stage || !reward) return;

    reward.classList.remove("show");

    daydreamRewardMonitor = setInterval(()=>{
      const active = stage.classList.contains("active");
      if(!active){
        stopDaydreamRewardMonitor();
        return;
      }

      if(video.currentTime >= 30){
        reward.classList.add("show");
        stopDaydreamRewardMonitor();
      }
    },250);
  };

  window.stopDaydreamRewardMonitor = stopDaydreamRewardMonitor;
})();
