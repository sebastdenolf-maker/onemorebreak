
(function(){
  const daydreamMessages = [
    "NOTHING NEEDS YOU RIGHT NOW.",
    "STAY A LITTLE LONGER.",
    "YOU'RE GETTING VERY GOOD AT GOING NOWHERE.",
    "NO DESTINATION REQUIRED.",
    "THERE'S REALLY NO RUSH."
  ];

  const bobMessages = [
    "LET HIM HANDLE IT.",
    "YOU DON'T NEED TO DO A THING.",
    "STAY FOR ANOTHER HAPPY LITTLE MINUTE.",
    "PRODUCTIVITY CAN WAIT.",
    "LOOK AT THAT. STILL NOTHING REQUIRED FROM YOU."
  ];

  const states = new Map();

  function stopEncouragement(id){
    const state = states.get(id);
    if(!state) return;
    state.timeouts.forEach(clearTimeout);
    states.delete(id);
    const el = document.getElementById(id);
    if(el){
      el.classList.remove("show");
      el.textContent = "";
    }
  }

  function startEncouragement(id, messages){
    stopEncouragement(id);
    const el = document.getElementById(id);
    if(!el) return;

    const state = {timeouts:[]};
    states.set(id,state);

    let i = 0;

    function cycle(){
      if(states.get(id) !== state) return;

      el.textContent = messages[i % messages.length];
      el.classList.add("show");

      state.timeouts.push(setTimeout(()=>{
        if(states.get(id) !== state) return;
        el.classList.remove("show");

        state.timeouts.push(setTimeout(()=>{
          if(states.get(id) !== state) return;
          i++;
          cycle();
        },8000));
      },3000));
    }

    state.timeouts.push(setTimeout(cycle,6500));
  }

  window.startDaydreamEncouragement = function(){
    startEncouragement("daydreamEncouragement",daydreamMessages);
  };
  window.stopDaydreamEncouragement = function(){
    stopEncouragement("daydreamEncouragement");
  };

  window.startBobEncouragement = function(){
    startEncouragement("bobEncouragement",bobMessages);
  };
  window.stopBobEncouragement = function(){
    stopEncouragement("bobEncouragement");
  };
})();
