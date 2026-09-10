// اخفاء نهائي - v4
try{let r=localStorage.getItem("taswiya_users");if(r){let a=JSON.parse(r);if(Array.isArray(a)&&!a.some(u=>u.name==="المدير")){localStorage.removeItem("taswiya_users");localStorage.removeItem("taswiya_users_ts");}}}catch(e){}

// حقن CSS يخفي الشريط الجوة مباشر
let css=document.createElement('style');
css.innerHTML=`
  .mt-6.pt-4.border-t{display:none !important;}
  p.text-\\[10px\\].text-gray-400{display:none !important;}
`;
document.head.appendChild(css);

function hideIt(){
  document.querySelectorAll('div, p').forEach(el=>{
    let t=(el.innerText||'');
    if(t.includes('المدير الافتراضي') && t.includes('PIN')){
      el.style.setProperty('display','none','important');
      let parent=el.closest('.mt-6');
      if(parent) parent.style.setProperty('display','none','important');
    }
  });
}
setInterval(hideIt,200);
new MutationObserver(hideIt).observe(document.documentElement,{childList:true,subtree:true});
