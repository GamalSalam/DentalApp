const CACHE_NAME = 'dental-clinic-pwa-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap'
];

// تثبيت الـ Service Worker وتخزين ملفات الواجهة الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// تنظيف أي كاش قديم عند التحديث
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// اعتراض الطلبات: تمرير طلبات Google Script مباشرة، واستخدام استراتيجية Network-First للواجهة
self.addEventListener('fetch', event => {
  const reqUrl = event.request.url;

  // عدم تخزين بيانات الحسابات المالية القادمة من Google Apps Script
  if (reqUrl.includes('script.google.com') || reqUrl.includes('script.googleusercontent.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
