// تصليح تلقائي لكل الأجهزة القديمة - يحل مشكلة مهند
try {
  let raw = localStorage.getItem("taswiya_users");
  if (raw) {
    let arr = JSON.parse(raw);
    let hasMudir = Array.isArray(arr) && arr.some(u => u.name === "المدير");
    if (!hasMudir) {
      localStorage.removeItem("taswiya_users");
      localStorage.removeItem("taswiya_users_ts");
      console.log("✅ Auto-fix: تم مسح اليوزرات القديمة المضروبة");
    }
  }
} catch(e) {}
