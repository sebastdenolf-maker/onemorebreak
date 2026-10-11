
let current=1, seconds=0, timerInterval=null, memberNo=null, yesAttempts=0;
const yesResponses=[
  {line:'NOT POSSIBLE.', sub:'Please review the question and provide a more appropriate answer.', btn:'TRY AGAIN'},
  {line:'THAT ANSWER HAS BEEN DECLINED.', sub:'Productivity is not currently supported by OneMoreBreak™.', btn:'RECONSIDER'},
  {line:'WE DON\'T THINK SO.', sub:'Maybe take a moment and think about what you just admitted.', btn:'TRY THAT AGAIN'},
  {line:'SYSTEM ERROR: TOO PRODUCTIVE.', sub:'Your answer conflicts with the purpose of this website.', btn:'CORRECT MY ANSWER'},
  {line:'STILL YES?', sub:'We can keep doing this for a while.', btn:'FINE. ASK ME AGAIN'},
  {line:'INCORRECT.', sub:'There is, unfortunately, only one acceptable answer.', btn:'RETURN TO QUESTION'},
  {line:'IMPRESSIVE COMMITMENT.', sub:'Also completely useless. Please try again.', btn:'ONE MORE TRY'}
];
function setProgress(n){document.getElementById('progressBar').style.width=Math.min(100,n*8)+'%'}
function go(n){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el=document.getElementById('s'+n); if(el) el.classList.add('active');
  current=n; setProgress(n); window.scrollTo(0,0);
}
function answerProductivity(yes){
  if(!yes){go(5);return;}
  const r=yesResponses[yesAttempts % yesResponses.length];
  yesAttempts++;
  document.getElementById('responseLine').textContent=r.line;
  document.getElementById('responseSub').textContent=r.sub;
  document.getElementById('retryBtn').innerHTML='<span class="heart">♥</span>'+r.btn;
  go(4);
}
function startBreak(){
  seconds=0; clearInterval(timerInterval);
  const timer=document.getElementById('timer'), status=document.getElementById('breakStatus');
  timer.textContent='00:00'; status.textContent='CONGRATULATIONS. YOU ARE CURRENTLY DOING ABSOLUTELY NOTHING.';
  timerInterval=setInterval(()=>{
    seconds++;
    timer.textContent='00:'+String(seconds).padStart(2,'0');
    if(seconds===10) status.textContent="YOU'RE DOING GREAT.";
    if(seconds===20) status.textContent='YOUR PRODUCTIVITY IS DECREASING.';
    if(seconds===30) status.textContent='PLEASE CONTINUE.';
    if(seconds>=35) finishBreak();
  },1000)
}
function finishBreak(){clearInterval(timerInterval);go(7)}
function miniBreak(name){
  const messages={
    'TYPING™':'OPEN THE DOCUMENT. TYPE NOTHING. PERFECT.',
    'SWIPING™':'ONE MORE SWIPE. AND MAYBE ONE MORE AFTER THAT.'
  };
  document.getElementById('choiceMsg').textContent=messages[name]||name+' SELECTED.';
}
function locked(){
  if(typeof window.openMembership === "function"){
    window.openMembership();
    return;
  }
  if(typeof go === "function"){
    // fallback to the original V15 membership/application flow
    go(9);
  }
}
function processApplication(){
  const name=document.getElementById('memberName').value.trim();
  memberNo=String(Math.floor(Math.random()*900000)+100000);
  if(name){document.getElementById('memberWelcome').textContent=name.toUpperCase()+' — OFFICIAL MEMBER';}
  document.getElementById('memberNumber').textContent=memberNo;
  go(11);
  const p=document.getElementById('processText');p.textContent='PROCESSING APPLICATION...';
  setTimeout(()=>p.textContent='CHECKING PRODUCTIVITY RECORD...',700);
  setTimeout(()=>p.textContent='IGNORING PRODUCTIVITY RECORD...',1450);
  setTimeout(()=>p.textContent='FINAL DECISION...',2200);
  setTimeout(()=>go(12),3000);
}
function finishMembership(){
  document.getElementById('finalMemberStatus').textContent='MEMBER #'+memberNo;
  document.getElementById('memberAction').style.display='none';
  if (typeof window.unlockMemberActivities === 'function') window.unlockMemberActivities();
  go(8);
}
setProgress(1)

  document.addEventListener("DOMContentLoaded", ()=>{
    const statusText = document.body.innerText || "";
    if(/MEMBER #\d+/.test(statusText) || localStorage.getItem("ombMemberNumber")){
      if (typeof window.unlockMemberActivities === "function") window.unlockMemberActivities();
    }
  });
