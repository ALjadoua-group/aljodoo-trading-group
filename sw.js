const CACHE_NAME='aljodoo-v7-force-visible';
const URLS=['./','./index.html'];
self.addEventListener('install',e=>{self.skipWaiting(); e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(URLS).catch(()=>c.add('./index.html'))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request; const url=new URL(req.url); if(url.origin!==location.origin) return; if(req.mode==='navigate' || req.headers.get('accept')?.includes('text/html')){e.respondWith(fetch(req).then(r=>{const cl=r.clone(); caches.open(CACHE_NAME).then(c=>c.put(req,cl)); return r;}).catch(()=>caches.match(req).then(c=>c||caches.match('./index.html')))); return;} e.respondWith(caches.match(req).then(c=>c||fetch(req).then(r=>{const cl=r.clone(); caches.open(CACHE_NAME).then(cc=>cc.put(req,cl)); return r;})));});
