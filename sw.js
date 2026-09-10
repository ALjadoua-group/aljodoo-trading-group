// ALJODOO PWA - Offline Cache v9
const CACHE = 'aljodoo-v9';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  './icon-72x72.png',
  './icon-96x96.png',
  './icon-128x128.png',
  './icon-144x144.png',
  './icon-192x192.png',
  './icon-384x384.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

// Network First for HTML, Cache First for assets
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // لا تكاش ملفات github api
  if(url.pathname.includes('/api/')) return;
  
  // للـ HTML : شبكة أولاً، ثم كاش
  if(e.request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/aljodoo-trading-group/')){
    e.respondWith(
      fetch(e.request).then(r=>{
        const clone=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request, clone));
        return r;
      }).catch(()=>caches.match(e.request).then(res=>res||caches.match('./index.html')))
    );
    return;
  }
  
  // للأيقونات والصور : كاش أولاً
  e.respondWith(
    caches.match(e.request).then(cached=>{
      return cached || fetch(e.request).then(r=>{
        caches.open(CACHE).then(c=>c.put(e.request, r.clone()));
        return r;
      });
    })
  );
});

// Background Sync - يزامن لما يرجع النت
self.addEventListener('sync', e => {
  if(e.tag === 'sync-taswiya'){
    e.waitUntil(
      // هنا البيانات محفوظة أصلاً بـ localStorage فما يحتاج مزامنة سيرفر
      // بس نبلغ الصفحات ان النت رجع
      self.clients.matchAll().then(clients=>{
        clients.forEach(c=>c.postMessage({type:'SYNC_ONLINE'}));
      })
    );
  }
});