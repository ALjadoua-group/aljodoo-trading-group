// تصليح + اخفاء نهائي
try {
  let raw = localStorage.getItem("taswiya_users");
  if (raw) {
    let arr = JSON.parse(raw);
    let hasMudir = Array.isArray(arr) && arr.some(u => u.name === "المدير");
    if (!hasMudir) {
      localStorage.removeItem("taswiya_users");
      localStorage.removeItem("taswiya_users_ts");
    }
  }
} catch(e) {}

function hidePinHint(){
  document.querySelectorAll('div, p, span, small').forEach(el=>{
    let t = (el.innerText||'').trim();
    if(t.includes('المدير الافتراضي') && t.includes('PIN')){
      el.style.display='none';
      el.style.visibility='hidden';
      el.style.height='0px';
    }
  });
}
setInterval(hidePinHint, 300);
document.addEventListener('DOMContentLoaded', hidePinHint);
window.addEventListener('load', hidePinHint);

// اضافة CSS احتياطي
let st = document.createElement('style');
st.innerHTML = `*{ -webkit-text-security: none !important; }`;
document.head.appendChild(st);
