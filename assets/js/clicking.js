
(function(){
  let wildWestScore = 0;
  let wildWestTime = 10.0;
  let wildWestRunning = false;
  let wildWestInterval = null;
  let wildWestRewardShown = false;

  function updateWildWestUI(){
    const score = document.getElementById("clickScore");
    const timer = document.getElementById("clickTimer");
    if(score) score.textContent = wildWestScore + "/50";
    if(timer) timer.textContent = wildWestTime.toFixed(1);
  }

  function finishWildWestRound(){
    clearInterval(wildWestInterval);
    wildWestInterval = null;
    wildWestRunning = false;

    const result = document.getElementById("clickResult");
    if(result){
      let line = "ROUND OVER. " + wildWestScore + " CLICKS.";
      if(wildWestScore >= 100) line += " THAT WAS ABSURD.";
      else if(wildWestScore >= 70) line += " VERY FAST.";
      else if(wildWestScore >= 50) line += " RESPECTABLE COWBOY BEHAVIOUR.";
      else if(wildWestScore >= 30) line += " YOU CAN DO BETTER.";
      else line += " THE WILD WEST REMAINS UNIMPRESSED.";
      result.textContent = line + " CLICK AGAIN TO RETRY.";
    }

    setTimeout(()=>{
      wildWestScore = 0;
      wildWestTime = 10.0;
      updateWildWestUI();
    }, 900);
  }

  window.registerWildWestClick = function(){
    const result = document.getElementById("clickResult");

    if(!wildWestRunning){
      wildWestScore = 0;
      wildWestTime = 10.0;
      wildWestRunning = true;
      wildWestRewardShown = false;
      if(result) result.textContent = "GO.";

      wildWestInterval = setInterval(()=>{
        wildWestTime = Math.max(0, wildWestTime - 0.1);
        updateWildWestUI();

        if(wildWestTime <= 0){
          finishWildWestRound();
        }
      }, 100);
    }

    wildWestScore++;
    updateWildWestUI();

    if(wildWestScore >= 50 && !wildWestRewardShown){
      wildWestRewardShown = true;
      const reward = document.getElementById("clickReward");
      if(reward) reward.classList.add("show");
    }
  };
})();
