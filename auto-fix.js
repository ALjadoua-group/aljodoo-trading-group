
// تصليح تلقائي + اخفاء ارقام المدير
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

// اخفاء جملة المدير الافتراضي
setInterval(()=>{
  document.querySelectorAll('*').forEach(el=>{
    if(el.textContent && el.textContent.includes('المدير الافتراضي') && el.children.length===0){
      el.style.display='none';
      if(el.parentElement) el.parentElement.style.borderTop='none';
    }
  });
}, 500);
