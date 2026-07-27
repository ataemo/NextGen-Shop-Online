// sw.js — Service Worker ຂອງ LAO SHOP
// ໜ້າທີ່ຫຼັກ: ເຮັດໃຫ້ browser ຮູ້ວ່າເວັບນີ້ "ຕິດຕັ້ງເປັນແອັບໄດ້" (installable)
// ແລະ cache ໄຟລ໌ພື້ນຖານໄວ້ໃຫ້ເປີດໄດ້ໄວຂຶ້ນ / ເປີດໄດ້ຊົ່ວຄາວເມື່ອເນັດອ່ອນ

const CACHE_NAME = 'lao-shop-cache-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(()=>{})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Network-first ສຳລັບ API (Google Apps Script) — ບໍ່ cache ຂໍ້ມູນສິນຄ້າ/ອໍເດີ
// Cache-first ສຳລັບໄຟລ໌ static (html, css, icon)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // ຢ່າ cache ການເອີ້ນ API (script.google.com)
  if (req.url.includes('script.google.com')) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
