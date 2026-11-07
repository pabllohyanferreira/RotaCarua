var mapaGoogle = null;
var marcadores = [];
var poligonoArea = null;
var linhaRoteiro = null;
var mapaPronto = false;
var marcadorUsuario = null;
var circuloUsuario = null;
var watchUsuarioId = null;
var posicaoUsuario = null;

function chaveMapsOk() {
    return GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY.indexOf('COLE_SUA') === -1;
}

function carregarScriptMaps() {
    return new Promise(function (resolve, reject) {
        if (!chaveMapsOk()) {
            reject(new Error('Falta a chave do Google Maps em js/config.js'));
            return;
        }

        if (window.google && window.google.maps && window.google.maps.Map) {
            resolve();
            return;
        }

        window.__rotaCaruaMapsOk = function () {
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
            reject(new Error('Nao carregou a API do Google Maps'));
        };
        document.head.appendChild(script);
    });
}

function desenharAreaNoMapa() {
    if (poligonoArea) {
        return;
    }

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
}

function iniciarMapaGoogle() {
    var caixa = document.getElementById('mapa-google');
    if (!caixa) {
        throw new Error('Div do mapa nao encontrada');
    }

    mapaGoogle = new google.maps.Map(caixa, {
        center: { lat: CENTRO_AREA.latitude, lng: CENTRO_AREA.longitude },
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });

    desenharAreaNoMapa();
    mapaPronto = true;
    setTimeout(iniciarLocalizacaoUsuario, 400);
}

function limparMarcadores() {
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
    if (categoria === 'cultura') return '#002048';
    return '#002048';
}

function mapaParadasRoteiro() {
    var mapa = {};
    var ordenadas = lerRoteiro();
    for (var i = 0; i < ordenadas.length; i++) {
        mapa[ordenadas[i].chave] = {
            numero: i + 1,
            item: ordenadas[i]
        };
    }
    return mapa;
}

function desenharLinhaRoteiro(paradas) {
    if (linhaRoteiro) {
        linhaRoteiro.setMap(null);
        linhaRoteiro = null;
    }

    if (!paradas || paradas.length < 2) {
        return;
    }

    var path = [];
    for (var i = 0; i < paradas.length; i++) {
        var lat = Number(paradas[i].lat);
        var lng = Number(paradas[i].lng);
        if (isNaN(lat) || isNaN(lng)) continue;
        path.push({ lat: lat, lng: lng });
    }

    if (path.length < 2) {
        return;
    }

    linhaRoteiro = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#F8A008',
        strokeOpacity: 0.95,
        strokeWeight: 4,
        map: mapaGoogle,
        zIndex: 50
    });
}

function iconeParadaNumerada() {
    return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: '#F8A008',
        fillOpacity: 1,
        strokeColor: '#002048',
        strokeWeight: 3
    };
}

function iconeLocalComum(item) {
    return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: corDoPin(item.categoria),
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
    };
}

function atualizarMarcadorUsuario(lat, lng, precisao) {
    if (!mapaGoogle) return;

    var pos = { lat: lat, lng: lng };
    posicaoUsuario = pos;

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
            clickable: false,
            zIndex: 10
        });
    } else {
        circuloUsuario.setCenter(pos);
        circuloUsuario.setRadius(precisao || 40);
    }

    var status = document.getElementById('status-localizacao');
    if (status) {
        status.textContent = 'Localizacao ativa no mapa';
    }
}

function iniciarLocalizacaoUsuario() {
    if (!navigator.geolocation) {
        var status = document.getElementById('status-localizacao');
        if (status) {
            status.textContent = 'Seu aparelho nao tem geolocalizacao';
        }
        return;
    }

    if (watchUsuarioId != null) {
        return;
    }

    var status = document.getElementById('status-localizacao');
    if (status) {
        status.textContent = 'Pedindo sua localizacao...';
    }

    watchUsuarioId = navigator.geolocation.watchPosition(
        function (pos) {
            atualizarMarcadorUsuario(
                pos.coords.latitude,
                pos.coords.longitude,
                pos.coords.accuracy
            );
        },
        function () {
            if (status) {
                status.textContent = 'Ative a localizacao do celular pra aparecer no mapa';
            }
        },
        {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 15000
        }
    );
}

function colocarPins(lista) {
    limparMarcadores();
    if (!mapaGoogle) return;

    var paradasMap = mapaParadasRoteiro();
    var paradasOrdenadas = lerRoteiro();

    desenharLinhaRoteiro(paradasOrdenadas);

    var bounds = new google.maps.LatLngBounds();
    var temPonto = false;
    var chavesJaMarcadas = {};

    for (var i = 0; i < lista.length; i++) {
        var item = lista[i];
        var pos = {
            lat: Number(item.lat),
            lng: Number(item.lng)
        };

        if (isNaN(pos.lat) || isNaN(pos.lng)) {
            continue;
        }

        var chave = chaveDoLocal(item);
        var parada = chave ? paradasMap[chave] : null;
        var opcoes = {
            position: pos,
            map: mapaGoogle,
            title: parada ? ('Parada ' + parada.numero + ': ' + item.nome) : item.nome,
            zIndex: parada ? 900 + parada.numero : 1
        };

        if (parada) {
            chavesJaMarcadas[chave] = true;
            opcoes.icon = iconeParadaNumerada();
            opcoes.label = {
                text: String(parada.numero),
                color: '#002048',
                fontWeight: '700',
                fontSize: '12px'
            };
        } else {
            opcoes.icon = iconeLocalComum(item);
        }

        var marker = new google.maps.Marker(opcoes);

        marker.addListener('click', (function (local) {
            return function () {
                abrirFicha(local);
            };
        })(item));

        marcadores.push(marker);
        bounds.extend(pos);
        temPonto = true;
    }

    for (var p = 0; p < paradasOrdenadas.length; p++) {
        var stop = paradasOrdenadas[p];
        if (chavesJaMarcadas[stop.chave]) continue;

        var posStop = {
            lat: Number(stop.lat),
            lng: Number(stop.lng)
        };
        if (isNaN(posStop.lat) || isNaN(posStop.lng)) continue;

        var markerStop = new google.maps.Marker({
            position: posStop,
            map: mapaGoogle,
            title: 'Parada ' + (p + 1) + ': ' + stop.nome,
            zIndex: 900 + (p + 1),
            icon: iconeParadaNumerada(),
            label: {
                text: String(p + 1),
                color: '#002048',
                fontWeight: '700',
                fontSize: '12px'
            }
        });

        marcadores.push(markerStop);
        bounds.extend(posStop);
        temPonto = true;
    }

    if (posicaoUsuario) {
        bounds.extend(posicaoUsuario);
        temPonto = true;
    }

    for (var v = 0; v < VERTICES_AREA.length; v++) {
        bounds.extend(VERTICES_AREA[v]);
        temPonto = true;
    }

    if (temPonto && !bounds.isEmpty()) {
        mapaGoogle.fitBounds(bounds);
    }
}

async function prepararMapa() {
    if (mapaPronto) {
        return true;
    }

    await carregarScriptMaps();
    iniciarMapaGoogle();
    return true;
}
