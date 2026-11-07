// centro aproximado: Estacao / Armazem - Caruaru
var CENTRO_MAPA = { lat: -8.2845, lng: -35.9698 };
var mapaGoogle = null;
var marcadores = [];
var mapaPronto = false;

function chaveMapsOk() {
    return GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY.indexOf('COLE_SUA') === -1;
}

function carregarScriptMaps() {
    return new Promise(function (resolve, reject) {
        if (!chaveMapsOk()) {
            reject(new Error('Falta a chave do Google Maps em js/config.js'));
            return;
        }

        if (window.google && window.google.maps) {
            resolve();
            return;
        }

        var script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE_MAPS_KEY;
        script.async = true;
        script.onload = function () {
            resolve();
        };
        script.onerror = function () {
            reject(new Error('Nao carregou a API do Google Maps'));
        };
        document.head.appendChild(script);
    });
}

function iniciarMapaGoogle() {
    var caixa = document.getElementById('mapa-google');

    mapaGoogle = new google.maps.Map(caixa, {
        center: CENTRO_MAPA,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });

    mapaPronto = true;
}

function limparMarcadores() {
    for (var i = 0; i < marcadores.length; i++) {
        marcadores[i].setMap(null);
    }
    marcadores = [];
}

function corDoPin(categoria) {
    if (categoria === 'alimentacao') return '#F05A2A';
    if (categoria === 'artesanato') return '#C47A2C';
    if (categoria === 'moda') return '#2F6B5A';
    if (categoria === 'servicos') return '#3D5A80';
    if (categoria === 'cultura') return '#8B3A62';
    return '#19302A';
}

function colocarPins(lista) {
    limparMarcadores();

    if (!lista.length) {
        return;
    }

    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < lista.length; i++) {
        var item = lista[i];
        var pos = {
            lat: Number(item.lat),
            lng: Number(item.lng)
        };

        var marker = new google.maps.Marker({
            position: pos,
            map: mapaGoogle,
            title: item.nome,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: corDoPin(item.categoria),
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
            }
        });

        // fecha o item no clique
        marker.addListener('click', (function (local) {
            return function () {
                abrirFicha(local);
            };
        })(item));

        marcadores.push(marker);
        bounds.extend(pos);
    }

    if (lista.length === 1) {
        mapaGoogle.setCenter(bounds.getCenter());
        mapaGoogle.setZoom(17);
    } else {
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
