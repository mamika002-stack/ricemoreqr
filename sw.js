/* RiceMore Service Worker
   - Sayfaları ÖNBELLEĞE ALMAZ: GitHub'a yüklenen yeni sürüm her zaman hemen görünür.
   - Bildirime dokununca ilgili sayfayı (ör. mutfak paneli) açar veya öne getirir.
   - İleride gerçek "push" altyapısı eklenirse gelen bildirimi gösterebilir. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if (c.url.startsWith(self.registration.scope) && 'focus' in c) {
        try { if ('navigate' in c) await c.navigate(url); } catch (err) {}
        return c.focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || '🔔 Yeni Sipariş Alındı! - RiceMore', {
    body: d.body || 'Detaylar için tıklayın.',
    icon: 'icon-192.png', badge: 'icon-192.png', vibrate: [250, 120, 250], tag: d.tag || 'order', renotify: true,
    data: { url: d.url || (self.registration.scope + '#mutfak') }
  }));
});
