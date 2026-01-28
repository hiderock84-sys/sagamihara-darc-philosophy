// Service Worker for PWA
const CACHE_NAME = 'sagamihara-darc-v1';
const OFFLINE_URL = '/offline.html';

// キャッシュするリソース
const urlsToCache = [
  '/',
  '/static/app.js',
  '/static/styles.css',
  '/offline.html',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js'
];

// インストール時
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// アクティベーション時
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// フェッチ時（ネットワーク優先、フォールバックにキャッシュ）
self.addEventListener('fetch', (event) => {
  // APIリクエストの場合はネットワークのみ
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'オフラインです。接続を確認してください。' }),
          { 
            headers: { 'Content-Type': 'application/json' },
            status: 503 
          }
        );
      })
    );
    return;
  }

  // 静的リソースの場合
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // レスポンスをクローンしてキャッシュに保存
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから返す
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // キャッシュにもない場合はオフラインページ
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-consultations') {
    event.waitUntil(syncConsultations());
  }
});

async function syncConsultations() {
  // IndexedDBから未送信データを取得して送信
  console.log('バックグラウンド同期を実行');
}

// プッシュ通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '新しい通知があります',
    icon: '/static/icon-192.png',
    badge: '/static/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('相模原ダルク', options)
  );
});

// 通知クリック時
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
