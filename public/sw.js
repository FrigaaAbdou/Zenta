self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.open('zenta-runtime-v1').then(async (cache) => {
      const cachedResponse = await cache.match(event.request)

      if (cachedResponse) {
        return cachedResponse
      }

      const networkResponse = await fetch(event.request)

      if (event.request.url.startsWith(self.location.origin)) {
        cache.put(event.request, networkResponse.clone())
      }

      return networkResponse
    }),
  )
})
