
(function(){

  window.unlockMemberActivities = function(){
    document.querySelectorAll(".member-locked").forEach(btn=>{
      btn.textContent = btn.dataset.memberActivity;
      btn.classList.add("unlocked");

      if(btn.dataset.memberActivity === "DAYDREAMING™"){
        btn.onclick = function(){ window.openDaydream(); };
      }else if(btn.dataset.memberActivity === "BOB ROSS™"){
        btn.onclick = function(){ window.openBobRoss(); };
      }
    });
  };

  let typingSuccesses = 0;
  const phrase = "give me onemorebreak";
  const reactions = {
    1:"AGAIN.",
    2:"THAT WAS COMPLETELY UNNECESSARY.",
    3:"YOU'RE GETTING VERY GOOD AT THIS.",
    4:"ONE MORE AND YOU EARN SOMETHING.",
    5:"REWARD UNLOCKED. EXCELLENT WASTE OF TIME.",
    6:"YOU ALREADY WON. YET HERE YOU ARE.",
    7:"THIS LEVEL OF COMMITMENT IS CONCERNING.",
    8:"OUTSTANDING. ABSOLUTELY NO PROGRESS.",
    9:"YOU COULD STOP. YOU CHOSE NOT TO.",
    10:"DOUBLE DIGITS. REMARKABLE.",
    15:"THIS IS BECOMING A LIFESTYLE.",
    20:"WE MAY NEED TO PROMOTE YOU."
  };

  window.openActivity = function(id){
    const el=document.getElementById(id);
    if(!el) return;
    el.classList.add("active"); el.setAttribute("aria-hidden","false");
    if(id==="typingExperience") setTimeout(()=>document.getElementById("typingInput")?.focus(),100);
    if(id==="timerExperience" && !timerInterval){
      // Paint 00:00/00:20 first. The interval starts only after the
      // Blank Stare screen itself is visible; its first tick happens 1s later.
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          if(document.getElementById("timerExperience")?.classList.contains("active") && !timerInterval){
            toggleWasteTimer();
          }
        });
      });
    }
  };
  window.closeActivity = function(id){
    const el=document.getElementById(id);
    if(el){el.classList.remove("active"); el.setAttribute("aria-hidden","true");}
  };

  const input=document.getElementById("typingInput");
  if(input){
    input.addEventListener("keydown", function(e){
      if(e.key!=="Enter") return;
      e.preventDefault();
      const val=input.value.trim().toLowerCase().replace(/\s+/g," ");
      if(val!==phrase){
        document.getElementById("typingReact").textContent =
          val ? "INCORRECT. EVEN WASTING TIME HAS PROCEDURES." : "YOU HAVE TO TYPE SOMETHING FIRST.";
        input.select();
        return;
      }
      typingSuccesses++;
      document.getElementById("typingCount").textContent=typingSuccesses+"/5";
      document.getElementById("typingReact").textContent =
        reactions[typingSuccesses] || (
          typingSuccesses < 5
            ? "KEEP GOING."
            : typingSuccesses % 10 === 0
              ? "ANOTHER TEN. THIS IS SERIOUS DEDICATION."
              : "EXCELLENT. PLEASE CONTINUE WASTING KEYSTROKES."
        );
      input.value="";
      if(typingSuccesses===5){
        document.getElementById("songReward").classList.add("show");
      }
    });
  }


  let blankStareHasStarted = false;

  let timerSeconds=0, timerInterval=null;
  window.toggleWasteTimer=function(){
    const btn=document.getElementById("wasteTimerBtn");
    if(timerInterval){
      clearInterval(timerInterval); timerInterval=null;
      if(btn) btn.textContent="CONTINUE WASTING TIME";
      document.getElementById("timerReact").textContent="BREAK PAUSED. SUSPICIOUSLY PRODUCTIVE.";
      return;
    }
    if(btn) btn.textContent="PAUSE (WHY?)";
    timerInterval=setInterval(()=>{
      timerSeconds++;
      const m=String(Math.floor(timerSeconds/60)).padStart(2,"0");
      const s=String(timerSeconds%60).padStart(2,"0");
      document.getElementById("wasteTimer").textContent=m+":"+s+"/00:20";
      const r=document.getElementById("timerReact");
      if(timerSeconds===5) r.textContent="STAY.";
      if(timerSeconds===10) r.textContent="YOU'RE DOING NOTHING PERFECTLY.";
      if(timerSeconds===15) r.textContent="DON'T RUIN IT NOW.";
      if(timerSeconds===20){
        r.textContent="REWARD UNLOCKED. TWENTY SECONDS OF NOTHING.";
        document.getElementById("timerReward").classList.add("show");
      }
      if(timerSeconds===25) r.textContent="JUST A LITTLE LONGER.";
      if(timerSeconds===30) r.textContent="SEE? NOTHING NEEDS YOU.";
      if(timerSeconds===35) r.textContent="YOU COULD LEAVE. BUT WHY?";
      if(timerSeconds===40) r.textContent="THE WORLD CAN WAIT.";
      if(timerSeconds===45) r.textContent="YOU'VE ALREADY COME THIS FAR.";
      if(timerSeconds===50) r.textContent="TEN MORE SECONDS. DON'T MOVE.";
      if(timerSeconds===55) r.textContent="ALMOST THERE.";
      if(timerSeconds===60){
        r.textContent="A FULL MINUTE. YOU REALLY DIDN'T HAVE TO. BEAUTIFUL.";
      }
      if(timerSeconds===75) r.textContent="YOU ALREADY EARNED IT. STAY ANYWAY.";
      if(timerSeconds===90) r.textContent="NINETY SECONDS. STILL NOTHING. BEAUTIFUL.";
      if(timerSeconds===105) r.textContent="THIS IS WHAT COMMITMENT LOOKS LIKE.";
      if(timerSeconds===120) r.textContent="TWO FULL MINUTES OF ABSOLUTELY NOTHING.";
      if(timerSeconds>120 && timerSeconds%30===0) r.textContent="DON'T STOP NOW.";
    },1000);
  };

  const daydreamVideoForReward = document.getElementById("daydreamVideo");
  const daydreamReward = document.getElementById("daydreamSongLink");

  if(daydreamVideoForReward && daydreamReward){
    daydreamVideoForReward.addEventListener("timeupdate", ()=>{
      if(daydreamVideoForReward.currentTime >= 30 && !daydreamRewardShown){
        daydreamRewardShown = true;
        daydreamReward.classList.add("show");
      }
    });
  }
})();
