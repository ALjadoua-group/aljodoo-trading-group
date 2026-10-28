/* sw.js - يسمح بفتح البرنامج بسرعة حتى مع انقطاع الإنترنت أو ضعفه.
   - صفحة البرنامج: من الشبكة إن ردّت خلال 3 ثوانٍ، وإلا من النسخة المحفوظة على الجهاز.
   - مكتبات Firebase و Excel: من النسخة المحفوظة أولاً (تُحمَّل مرة واحدة فقط).
   - طلبات Firestore والبيانات لا يتدخل فيها هذا الملف أبداً. */
var CACHE = 'jd-offline-v1';
var PAGE = './index.html';
var CORE = ['./index.html', './manifest.json', './icon-192x192.png'];
var LIBS = [
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];
var LIB_RE = /^https:\/\/(www\.gstatic\.com\/firebasejs\/|cdnjs\.cloudflare\.com\/ajax\/libs\/xlsx\/)/;

function prefetchLib(cache, url, seen) {
  if (seen[url]) return Promise.resolve();
  seen[url] = 1;
  return fetch(url, { mode: 'cors' }).then(function (r) {
    if (!r || !r.ok) return;
    return cache.put(url, r.clone()).then(function () {
      if (!/\.js(\?|$)/.test(url)) return;
      return r.text().then(function (t) {
        var re = /(?:from|import)\s*["'](\.{1,2}\/[^"']+)["']/g, m, subs = [];
        while ((m = re.exec(t))) subs.push(new URL(m[1], url).href);
        return Promise.all(subs.map(function (u) { return prefetchLib(cache, u, seen); }));
      });
    });
  }).catch(function () {});
}

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (cache) {
    var seen = {};
    var core = Promise.all(CORE.map(function (u) { return cache.add(u).catch(function () {}); }));
    var libs = Promise.all(LIBS.map(function (u) { return prefetchLib(cache, u, seen); }));
    return Promise.all([core, libs]);
  }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function clean(r) {
  if (!r.redirected) return Promise.resolve(r);
  return r.blob().then(function (b) { return new Response(b, { status: r.status, statusText: r.statusText, headers: r.headers }); });
}

function pageHandler(e) {
  var req = e.request;
  var net = fetch(req).then(function (r) {
    if (r && r.ok) {
      var copy = r.clone();
      caches.open(CACHE).then(function (c) { return clean(copy).then(function (cr) { return c.put(PAGE, cr); }); }).catch(function () {});
    }
    return r;
  });
  e.waitUntil(net.catch(function () {}));
  var timeout = new Promise(function (res) { setTimeout(function () { res(null); }, 3000); });
  return Promise.race([net, timeout]).then(function (r) {
    if (r) return clean(r);
    throw new Error('slow');
  }).catch(function () {
    return caches.open(CACHE).then(function (c) { return c.match(PAGE, { ignoreSearch: true, ignoreVary: true }); }).then(function (cached) {
      if (cached) return cached;
      return net.then(clean);
    });
  });
}

function libHandler(req) {
  return caches.open(CACHE).then(function (c) {
    return c.match(req.url, { ignoreVary: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (r) {
        if (r && r.ok) c.put(req.url, r.clone());
        return r;
      });
    });
  });
}

function assetHandler(req) {
  return caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreVary: true }).then(function (hit) {
      var net = fetch(req).then(function (r) {
        if (r && r.ok) c.put(req, r.clone());
        return r;
      });
      if (hit) { net.catch(function () {}); return hit; }
      return net;
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  if (LIB_RE.test(req.url)) { e.respondWith(libHandler(req)); return; }
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') { e.respondWith(pageHandler(e)); return; }
  if (/\.(png|jpg|jpeg|webp|svg|ico|json|woff2?)$/i.test(url.pathname)) { e.respondWith(assetHandler(req)); }
});
