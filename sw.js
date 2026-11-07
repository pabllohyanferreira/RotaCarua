var CACHE = 'rota-carua-v1';

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (c) {
            return c.addAll([
                './',
                './index.html',
                './css/style.css',
                './js/config.js',
                './js/auth.js',
                './js/estabelecimentos.js',
                './js/cupons.js',
                './js/mapa.js',
                './js/app.js',
                './manifest.json',
                './icons/icone-192.png',
                './icons/icone-512.png'
            ]);
        })
    );
});

self.addEventListener('fetch', function (e) {
    if (e.request.url.indexOf('supabase.co') !== -1) {
        return;
    }

    e.respondWith(
        caches.match(e.request).then(function (resp) {
            if (resp) return resp;
            return fetch(e.request);
        })
    );
});
