// sw.js — Service Worker для MindSpace PWA

const CACHE_NAME = 'mindspace-v3';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Установка и кэширование файлов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Обработка запросов (кэш с fallback на сеть)
self.addEventListener('fetch', event => {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          return cachedResponse || fetch(event.request);
        })
    );
  }
});

// Push-уведомления (если включены)
self.addEventListener('push', event => {
  const options = {
    body: 'Пора в MindSpace! Зафиксируй свои мысли 🧠',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100]
  };
  event.waitUntil(
    self.registration.showNotification('MindSpace напоминает', options)
  );
});

// Клик по уведомлению — открывает приложение
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});