
(function(){
  const enter = document.getElementById("mainEnterBtn");
  if(!enter) return;

  let lastActivation = 0;

  function activateEnter(e){
    const now = Date.now();
    if(now - lastActivation < 500) return;
    lastActivation = now;

    if(e && e.cancelable) e.preventDefault();

    if(typeof window.go === "function"){
      window.go(2);
    }else if(typeof go === "function"){
      go(2);
    }
  }

  // Pointer Events cover modern iPhone/Android browsers.
  if(window.PointerEvent){
    enter.addEventListener("pointerup", activateEnter, {passive:false});
  }else{
    // Fallback for older mobile Safari.
    enter.addEventListener("touchend", activateEnter, {passive:false});
  }

  // Keyboard/desktop fallback.
  enter.addEventListener("click", function(e){
    if(e.detail === 0) activateEnter(e);
  });
})();
