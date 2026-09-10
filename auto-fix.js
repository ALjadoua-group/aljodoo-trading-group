// v5 - إخفاء بصري فقط لحساب المدير الافتراضي من واجهة إدارة المستخدمين
// (حُذف منطق مسح localStorage القديم لأنه كان يفرّغ قائمة المستخدمين مؤقتاً
//  عند أي تأخر بالشبكة، ويسبب ظهور "المستخدم غير موجود" لبعض الزملاء)

let css = document.createElement('style');
css.innerHTML = `
  .mt-6.pt-4.border-t{display:none !important;}
  p.text-\\[10px\\].text-gray-400{display:none !important;}
`;
document.head.appendChild(css);

function hideIt(){
  document.querySelectorAll('div, p').forEach(el=>{
    let t = (el.innerText || '');
    if (t.includes('المدير الافتراضي') && t.includes('PIN')) {
      el.style.setProperty('display', 'none', 'important');
      let parent = el.closest('.mt-6');
      if (parent) parent.style.setProperty('display', 'none', 'important');
    }
  });
}
setInterval(hideIt, 200);
new MutationObserver(hideIt).observe(document.documentElement, { childList: true, subtree: true });
