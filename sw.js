// sw.js

// Кэширование основных файлов (для быстрой загрузки)
const CACHE_NAME = 'mindspace-v2';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Обработка push-уведомлений
self.addEventListener('push', event => {
  const options = {
    body: 'Пора зафиксировать мысли! Как прошёл твой день? 🧠',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: { url: '/' }
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