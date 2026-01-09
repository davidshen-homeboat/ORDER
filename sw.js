
// 基礎的 Service Worker，用於滿足 PWA 安裝條件
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // 這裡可以加入緩存邏輯，目前保持透傳
  event.respondWith(fetch(event.request));
});
