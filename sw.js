/* كتابي: يحفظ واجهة التطبيق ومكتبة قراءة PDF للعمل دون إنترنت. الكتب والشروح والكتابة لا تمر من هنا؛ هي في تخزين الجهاز. */
const CACHE = 'kitabi-2026.11.01.28';
const SHELL = ['./', './index.html', './style.css', './app.css', './app.js', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png',
  './vendor/pdfjs/pdf.min.mjs', './vendor/pdfjs/pdf.worker.min.mjs'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('kitabi-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // the PDF library and its font tables never change within a version: serve them from the cache first
  const lib = url.pathname.includes('/vendor/');
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (lib) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
    }
    try {
      // the app's own files are checked with the server every time (GitHub Pages lets browsers keep them 10 minutes otherwise)
      const res = await Promise.race([
        lib ? fetch(req) : fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' })),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), lib ? 20000 : 5000))
      ]);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});
