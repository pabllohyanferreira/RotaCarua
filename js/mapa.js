var mapaGoogle = null;
var mapaLeaflet = null;
var marcadores = [];
var camadaMarcadores = null;
var poligonoArea = null;
var linhaRoteiro = null;
var mapaPronto = false;
var motorMapa = null;
var marcadorUsuario = null;
var circuloUsuario = null;
var watchUsuarioId = null;
var posicaoUsuario = null;

function chaveMapsOk() {
    return typeof GOOGLE_MAPS_KEY === 'string' && GOOGLE_MAPS_KEY.indexOf('COLE_SUA') === -1;
}

function carregarLeaflet() {
    return new Promise(function (resolve, reject) {
        if (window.L) {
            resolve();
            return;
        }

        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);

        var script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = function () { resolve(); };
        script.onerror = function () { reject(new Error('Nao carregou o Leaflet')); };
        document.head.appendChild(script);
    });
}

function carregarScriptMaps() {
    return new Promise(function (resolve, reject) {
        if (!chaveMapsOk()) {
            reject(new Error('Sem chave Google'));
            return;
        }

        if (window.google && window.google.maps && window.google.maps.Map) {
            resolve();
            return;
        }

        var acabou = false;
        var timer = setTimeout(function () {
            if (acabou) return;
            acabou = true;
            reject(new Error('Google Maps demorou ou atingiu cota'));
        }, 8000);

        window.__rotaCaruaMapsOk = function () {
            if (acabou) return;
            acabou = true;
            clearTimeout(timer);
            resolve();
        };

        var script = document.createElement('script');
        script.src =
            'https://maps.googleapis.com/maps/api/js?key=' +
            GOOGLE_MAPS_KEY +
            '&callback=__rotaCaruaMapsOk';
        script.async = true;
        script.defer = true;
        script.onerror = function () {
            if (acabou) return;
            acabou = true;
            clearTimeout(timer);
            reject(new Error('Nao carregou a API do Google Maps'));
        };
        document.head.appendChild(script);
    });
}

function iniciarMapaLeaflet() {
    var caixa = document.getElementById('mapa-google');
    if (!caixa) throw new Error('Div do mapa nao encontrada');

    caixa.innerHTML = '';
    mapaLeaflet = L.map(caixa, { zoomControl: true }).setView(
        [CENTRO_AREA.latitude, CENTRO_AREA.longitude],
        16
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapaLeaflet);

    camadaMarcadores = L.layerGroup().addTo(mapaLeaflet);

    var pontos = [];
    for (var i = 0; i < VERTICES_AREA.length; i++) {
        pontos.push([VERTICES_AREA[i].lat, VERTICES_AREA[i].lng]);
    }

    poligonoArea = L.polygon(pontos, {
        color: '#002048',
        weight: 2,
        fillColor: '#F8A008',
        fillOpacity: 0.18,
        interactive: false
    }).addTo(mapaLeaflet);

    motorMapa = 'leaflet';
    mapaPronto = true;
    setTimeout(iniciarLocalizacaoUsuario, 300);
    setTimeout(function () { mapaLeaflet.invalidateSize(); }, 200);
}

function iniciarMapaGoogle() {
    var caixa = document.getElementById('mapa-google');
    if (!caixa) throw new Error('Div do mapa nao encontrada');

    mapaGoogle = new google.maps.Map(caixa, {
        center: { lat: CENTRO_AREA.latitude, lng: CENTRO_AREA.longitude },
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });

    poligonoArea = new google.maps.Polygon({
        paths: VERTICES_AREA,
        strokeColor: '#002048',
        strokeOpacity: 0.95,
        strokeWeight: 2,
        fillColor: '#F8A008',
        fillOpacity: 0.18,
        map: mapaGoogle,
        clickable: false
    });

    motorMapa = 'google';
    mapaPronto = true;
    setTimeout(iniciarLocalizacaoUsuario, 400);
}

function limparMarcadores() {
    if (motorMapa === 'leaflet') {
        if (camadaMarcadores) camadaMarcadores.clearLayers();
        if (linhaRoteiro) {
            mapaLeaflet.removeLayer(linhaRoteiro);
            linhaRoteiro = null;
        }
        return;
    }

    for (var i = 0; i < marcadores.length; i++) {
        marcadores[i].setMap(null);
    }
    marcadores = [];

    if (linhaRoteiro) {
        linhaRoteiro.setMap(null);
        linhaRoteiro = null;
    }
}

function corDoPin(categoria) {
    if (categoria === 'alimentacao') return '#F8A008';
    if (categoria === 'artesanato') return '#C47A2C';
    if (categoria === 'moda') return '#3D5A80';
    if (categoria === 'servicos') return '#5A6570';
    return '#002048';
}

function iconeLeafletComum(cor) {
    return L.divIcon({
        className: 'pin-leaflet',
        html: '<span class="pin-bola" style="background:' + cor + '"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });
}

function iconeLeafletParada(numero) {
    return L.divIcon({
        className: 'pin-leaflet pin-leaflet-parada',
        html: '<span class="pin-parada">' + numero + '</span>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -12]
    });
}

function numeroParadaDoLocal(local, roteiro) {
    if (!local || !roteiro || !roteiro.length) return null;

    var chave = chaveDoLocal(local);
    var i;

    for (i = 0; i < roteiro.length; i++) {
        if (chave && roteiro[i].chave === chave) {
            return i + 1;
        }
    }

    var lat = Number(local.lat);
    var lng = Number(local.lng);
    if (isNaN(lat) || isNaN(lng)) return null;

    for (i = 0; i < roteiro.length; i++) {
        var sla = Number(roteiro[i].lat);
        var sln = Number(roteiro[i].lng);
        if (isNaN(sla) || isNaN(sln)) continue;
        if (Math.abs(sla - lat) < 0.00025 && Math.abs(sln - lng) < 0.00025) {
            return i + 1;
        }
    }

    return null;
}

function atualizarMarcadorUsuario(lat, lng, precisao) {
    posicaoUsuario = { lat: lat, lng: lng };

    if (motorMapa === 'leaflet' && mapaLeaflet) {
        if (!marcadorUsuario) {
            marcadorUsuario = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'pin-leaflet',
                    html: '<span class="pin-eu"></span>',
                    iconSize: [18, 18],
                    iconAnchor: [9, 9]
                }),
                zIndexOffset: 2000,
                title: 'Voce esta aqui'
            }).addTo(mapaLeaflet);
        } else {
            marcadorUsuario.setLatLng([lat, lng]);
        }

        if (!circuloUsuario) {
            circuloUsuario = L.circle([lat, lng], {
                radius: precisao || 40,
                color: '#1A73E8',
                weight: 1,
                fillColor: '#1A73E8',
                fillOpacity: 0.15,
                interactive: false
            }).addTo(mapaLeaflet);
        } else {
            circuloUsuario.setLatLng([lat, lng]);
            circuloUsuario.setRadius(precisao || 40);
        }
    } else if (motorMapa === 'google' && mapaGoogle) {
        var pos = { lat: lat, lng: lng };
        if (!marcadorUsuario) {
            marcadorUsuario = new google.maps.Marker({
                position: pos,
                map: mapaGoogle,
                title: 'Voce esta aqui',
                zIndex: 2000,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 9,
                    fillColor: '#1A73E8',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3
                }
            });
        } else {
            marcadorUsuario.setPosition(pos);
        }

        if (!circuloUsuario) {
            circuloUsuario = new google.maps.Circle({
                map: mapaGoogle,
                center: pos,
                radius: precisao || 40,
                fillColor: '#1A73E8',
                fillOpacity: 0.15,
                strokeColor: '#1A73E8',
                strokeOpacity: 0.4,
                strokeWeight: 1,
                clickable: false
            });
        } else {
            circuloUsuario.setCenter(pos);
            circuloUsuario.setRadius(precisao || 40);
        }
    }

    var status = document.getElementById('status-localizacao');
    if (status) status.textContent = 'Localizacao ativa no mapa';
}

function iniciarLocalizacaoUsuario() {
    var status = document.getElementById('status-localizacao');
    if (!navigator.geolocation) {
        if (status) status.textContent = 'Sem geolocalizacao nesse aparelho';
        return;
    }
    if (watchUsuarioId != null) return;
    if (status) status.textContent = 'Pedindo sua localizacao...';

    watchUsuarioId = navigator.geolocation.watchPosition(
        function (pos) {
            atualizarMarcadorUsuario(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
        },
        function () {
            if (status) status.textContent = 'Ative a localizacao do celular pra aparecer no mapa';
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
}

function colocarPins(lista) {
    limparMarcadores();
    if (!mapaPronto) return;

    var roteiro = [];
    try { roteiro = lerRoteiro(); } catch (e) { roteiro = []; }

    var path = [];
    for (var t = 0; t < roteiro.length; t++) {
        var la = Number(roteiro[t].lat);
        var ln = Number(roteiro[t].lng);
        if (!isNaN(la) && !isNaN(ln)) {
            path.push(motorMapa === 'leaflet' ? [la, ln] : { lat: la, lng: ln });
        }
    }

    if (path.length >= 2) {
        if (motorMapa === 'leaflet') {
            linhaRoteiro = L.polyline(path, {
                color: '#F8A008',
                weight: 5,
                opacity: 0.95,
                dashArray: null
            }).addTo(mapaLeaflet);
            linhaRoteiro.bringToBack();
        } else {
            linhaRoteiro = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: '#F8A008',
                strokeOpacity: 0.95,
                strokeWeight: 5,
                map: mapaGoogle,
                zIndex: 50
            });
        }
    }

    var boundsLeaflet = [];
    var boundsGoogle = motorMapa === 'google' ? new google.maps.LatLngBounds() : null;
    var jaMarcou = {};
    var temPonto = false;
    var temRoteiro = path.length > 0;

    function addBounds(lat, lng) {
        if (motorMapa === 'leaflet') boundsLeaflet.push([lat, lng]);
        else boundsGoogle.extend({ lat: lat, lng: lng });
        temPonto = true;
    }

    function marcarParada(lat, lng, num, titulo, local) {
        if (motorMapa === 'leaflet') {
            var marker = L.marker([lat, lng], {
                icon: iconeLeafletParada(num),
                title: 'Parada ' + num + ': ' + titulo,
                zIndexOffset: 1000 + num,
                riseOnHover: true
            });
            if (local && typeof abrirFicha === 'function') {
                marker.on('click', (function (l) {
                    return function () { abrirFicha(l); };
                })(local));
            }
            camadaMarcadores.addLayer(marker);
        } else {
            var gMarker = new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map: mapaGoogle,
                title: 'Parada ' + num + ': ' + titulo,
                zIndex: 1000 + num,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 14,
                    fillColor: '#F8A008',
                    fillOpacity: 1,
                    strokeColor: '#002048',
                    strokeWeight: 3
                },
                label: {
                    text: String(num),
                    color: '#002048',
                    fontWeight: '700',
                    fontSize: '13px'
                }
            });
            if (local && typeof abrirFicha === 'function') {
                gMarker.addListener('click', (function (l) {
                    return function () { abrirFicha(l); };
                })(local));
            }
            marcadores.push(gMarker);
        }
        addBounds(lat, lng);
    }

    for (var i = 0; i < lista.length; i++) {
        var item = lista[i];
        var lat = Number(item.lat);
        var lng = Number(item.lng);
        if (isNaN(lat) || isNaN(lng)) continue;

        var chave = chaveDoLocal(item);
        var num = numeroParadaDoLocal(item, roteiro);

        if (num) {
            marcarParada(lat, lng, num, item.nome, item);
            if (chave) jaMarcou[chave] = true;
            jaMarcou['n' + num] = true;
            continue;
        }

        if (motorMapa === 'leaflet') {
            var markerComum = L.marker([lat, lng], {
                icon: iconeLeafletComum(corDoPin(item.categoria)),
                title: item.nome,
                zIndexOffset: 1
            });
            markerComum.on('click', (function (local) {
                return function () { abrirFicha(local); };
            })(item));
            camadaMarcadores.addLayer(markerComum);
        } else {
            var gComum = new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map: mapaGoogle,
                title: item.nome,
                zIndex: 1,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: corDoPin(item.categoria),
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                }
            });
            gComum.addListener('click', (function (local) {
                return function () { abrirFicha(local); };
            })(item));
            marcadores.push(gComum);
        }

        if (!temRoteiro) addBounds(lat, lng);
    }

    for (var p = 0; p < roteiro.length; p++) {
        var stop = roteiro[p];
        var numStop = p + 1;
        if (jaMarcou[stop.chave] || jaMarcou['n' + numStop]) continue;

        var sla = Number(stop.lat);
        var sln = Number(stop.lng);
        if (isNaN(sla) || isNaN(sln)) continue;

        marcarParada(sla, sln, numStop, stop.nome, null);
        if (stop.chave) jaMarcou[stop.chave] = true;
    }

    if (posicaoUsuario) addBounds(posicaoUsuario.lat, posicaoUsuario.lng);

    if (!temRoteiro) {
        for (var v = 0; v < VERTICES_AREA.length; v++) {
            addBounds(VERTICES_AREA[v].lat, VERTICES_AREA[v].lng);
        }
    }

    if (!temPonto) return;

    if (motorMapa === 'leaflet') {
        if (boundsLeaflet.length === 1) {
            mapaLeaflet.setView(boundsLeaflet[0], 16);
        } else {
            mapaLeaflet.fitBounds(boundsLeaflet, { padding: [36, 36], maxZoom: 17 });
        }
    } else if (!boundsGoogle.isEmpty()) {
        mapaGoogle.fitBounds(boundsGoogle, 40);
    }
}

async function prepararMapa() {
    if (mapaPronto) {
        if (motorMapa === 'leaflet' && mapaLeaflet) mapaLeaflet.invalidateSize();
        return true;
    }

    var preferirLivre = typeof USAR_MAPA_LIVRE === 'undefined' ? true : USAR_MAPA_LIVRE;

    if (!preferirLivre) {
        try {
            await carregarScriptMaps();
            iniciarMapaGoogle();
            return true;
        } catch (e) {
            console.log('Google Maps falhou, usando mapa livre', e);
        }
    }

    await carregarLeaflet();
    iniciarMapaLeaflet();
    return true;
}
