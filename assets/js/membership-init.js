
document.addEventListener("DOMContentLoaded", function(){
  document.querySelectorAll(".member-locked").forEach(btn=>{
    btn.textContent = "???";
    btn.classList.remove("unlocked");
    btn.onclick = locked;
  });
});
