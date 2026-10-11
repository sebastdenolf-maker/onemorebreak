
(function(){
  const introScripts = {
    typingExperience: [
      "JUST FIVE LITTLE SENTENCES.",
      "THINK OF IT AS INVESTING IN ABSOLUTELY NOTHING."
    ],
    swipingExperience: [
      "ONE MORE SWIPE WON'T HURT.",
      "TEN OF THEM AND WE'LL MAKE IT WORTH YOUR WHILE."
    ],
    timerExperience: [
      "DON'T TOUCH ANYTHING.",
      "GIVE US TWENTY SECONDS OF ABSOLUTELY NOTHING."
    ],
    clickingExperience: [
      "SHOW ME YOU'RE THE FASTEST CLICKER IN THE WILD WEST."
    ]
  };

  window.launchActivity = function(id){
    const intro = document.getElementById("activityIntro");
    const line = document.getElementById("activityIntroLine");
    const script = introScripts[id] || ["BEGIN."];

    intro.classList.add("active");
    intro.setAttribute("aria-hidden","false");

    let i = 0;

    function showNext(){
      line.classList.remove("show");

      setTimeout(()=>{
        line.textContent = script[i];
        line.classList.add("show");

        setTimeout(()=>{
          line.classList.remove("show");

          setTimeout(()=>{
            i++;
            if(i < script.length){
              showNext();
            }else{
              intro.classList.remove("active");
              intro.setAttribute("aria-hidden","true");
              if(typeof window.openActivity === "function"){
                window.openActivity(id);
              }
            }
          },850);
        },2200);
      },400);
    }

    showNext();
  };
})();
