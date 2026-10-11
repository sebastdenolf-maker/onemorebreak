
(function(){
  const swipeContent = [
    "PHOTO 01 — DOING NOTHING.",
    "PHOTO 02 — STILL DOING NOTHING.",
    "PHOTO 03 — ADVANCED INACTIVITY.",
    "PHOTO 04 — NO VISIBLE PROGRESS.",
    "PHOTO 05 — NOTHING CONTINUES.",
    "PHOTO 06 — PROFESSIONAL BREAK.",
    "PHOTO 07 — ZERO URGENCY.",
    "PHOTO 08 — PRODUCTIVITY NOT FOUND.",
    "PHOTO 09 — ALMOST IMPRESSIVE.",
    "PHOTO 10 — ENOUGH NOTHING."
  ];
  const reactions = {
    1:"THAT COUNTED AS A SWIPE.",
    2:"PRODUCTIVITY REMAINS LOW.",
    3:"GOOD. DON'T THINK ABOUT IT.",
    5:"FIVE SWIPES. NOTHING LEARNED.",
    7:"YOUR THUMB IS NOW MANAGEMENT.",
    9:"ONE MORE. OBVIOUSLY.",
    10:"REWARD UNLOCKED: SERIAL SWIPER.",
    12:"YOU MAY CONTINUE FOREVER. WE WON'T STOP YOU.",
    15:"FIFTEEN SWIPES. BEAUTIFUL COMMITMENT.",
    20:"TWENTY. YOU HAVE MASTERED POINTLESS MOTION."
  };

  let swipeCount = 0;
  let touchStartY = null;

  window.nextSwipe = function(){
    const card = document.getElementById("swipeCard");
    if(!card) return;
    card.classList.add("out");
    setTimeout(()=>{
      swipeCount++;
      const item = swipeContent[swipeCount % swipeContent.length];
      const visual = document.getElementById("swipeVisual");
      if(visual) visual.textContent = item;
      document.getElementById("swipeCounter").textContent =
        swipeCount + "/10";
      document.getElementById("swipeReaction").textContent =
        reactions[swipeCount] || (
          swipeCount > 10
            ? "KEEP GOING."
            : ""
        );
      if(swipeCount===10){
        document.getElementById("swipeReward").classList.add("show");
      }
      card.style.transition = "none";
      card.style.transform = "translateY(110%)";
      card.style.opacity = "0";
      card.classList.remove("out");
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        card.style.transition = "transform .22s ease, opacity .22s ease";
        card.style.transform = "translateY(0)";
        card.style.opacity = "1";
      }));
    },220);
  };

  document.addEventListener("DOMContentLoaded", ()=>{
    const shell = document.getElementById("swipeShell");
    if(!shell) return;

    shell.addEventListener("touchstart", e=>{
      touchStartY = e.touches[0].clientY;
    }, {passive:true});

    shell.addEventListener("touchend", e=>{
      if(touchStartY === null) return;
      const endY = e.changedTouches[0].clientY;
      if(touchStartY - endY > 45) nextSwipe();
      touchStartY = null;
    }, {passive:true});

    let mouseStartY = null;
    shell.addEventListener("mousedown", e=>{ mouseStartY = e.clientY; });
    shell.addEventListener("mouseup", e=>{
      if(mouseStartY !== null && mouseStartY - e.clientY > 45) nextSwipe();
      mouseStartY = null;
    });
  });
})();
