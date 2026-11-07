var CACHE = 'rota-carua-v16';

self.addEventListener('install', function (e) {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE).then(function (c) {
            return c.addAll([
                './',
                './index.html',
                './login.html',
                './cadastro.html',
                './cupons.html',
                './roteiro.html',
                './manifest.json',
                './css/style.css',
                './js/config.js',
                './js/auth.js',
                './js/area.js',
                './js/estabelecimentos.js',
                './js/cupons.js',
                './js/cupons-pagina.js',
                './js/roteiro.js',
                './js/roteiro-pagina.js',
                './js/places.js',
                './js/mapa.js',
                './js/app.js',
                './img/logo-rota-carua.jpg',
                './icons/icone-192.png',
                './icons/icone-512.png'
            ]);
        })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (chaves) {
            return Promise.all(
                chaves.map(function (chave) {
                    if (chave !== CACHE) {
                        return caches.delete(chave);
                    }
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function (e) {
    var url = e.request.url;

    if (
        url.indexOf('supabase.co') !== -1 ||
        url.indexOf('googleapis.com') !== -1 ||
        url.indexOf('gstatic.com') !== -1 ||
        url.indexOf('openstreetmap.org') !== -1 ||
        url.indexOf('overpass-api.de') !== -1 ||
        url.indexOf('unpkg.com') !== -1
    ) {
        return;
    }

    if (e.request.method !== 'GET') {
        return;
    }

    e.respondWith(
        fetch(e.request).then(function (resp) {
            if (!resp || resp.status !== 200) {
                return resp;
            }

            var clone = resp.clone();
            caches.open(CACHE).then(function (c) {
                c.put(e.request, clone);
            });

            return resp;
        }).catch(function () {
            return caches.match(e.request);
        })
    );
});
