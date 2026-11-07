var CHAVE_ROTEIRO = 'rota_carua_roteiro';

function lerRoteiro() {
    var txt = localStorage.getItem(CHAVE_ROTEIRO);
    if (!txt) return [];
    try {
        return JSON.parse(txt);
    } catch (e) {
        return [];
    }
}

function salvarRoteiro(lista) {
    localStorage.setItem(CHAVE_ROTEIRO, JSON.stringify(lista));
}

function chaveDoLocal(local) {
    if (!local) return '';
    return String(local.place_id || local.id || local.chave || local.nome || '');
}

function estaNoRoteiro(local) {
    var chave = chaveDoLocal(local);
    if (!chave) return false;

    var lista = lerRoteiro();
    for (var i = 0; i < lista.length; i++) {
        if (lista[i].chave === chave) {
            return true;
        }
    }
    return false;
}

function adicionarAoRoteiro(local) {
    if (!local || !local.nome) {
        return false;
    }

    var lista = lerRoteiro();
    var chave = chaveDoLocal(local);

    for (var i = 0; i < lista.length; i++) {
        if (lista[i].chave === chave) {
            return false;
        }
    }

    lista.push({
        chave: chave,
        nome: local.nome,
        endereco: local.endereco || '',
        lat: local.lat,
        lng: local.lng,
        categoria: local.categoria || ''
    });

    salvarRoteiro(lista);
    return true;
}

function removerDoRoteiro(chave) {
    var lista = lerRoteiro();
    var nova = [];

    for (var i = 0; i < lista.length; i++) {
        if (lista[i].chave !== chave) {
            nova.push(lista[i]);
        }
    }

    salvarRoteiro(nova);
}

function moverParada(chave, novaPosicao) {
    var lista = lerRoteiro();
    var atual = -1;
    var i;

    for (i = 0; i < lista.length; i++) {
        if (lista[i].chave === chave) {
            atual = i;
            break;
        }
    }

    if (atual < 0) return lista;

    var destino = Number(novaPosicao);
    if (isNaN(destino)) return lista;
    if (destino < 0) destino = 0;
    if (destino > lista.length - 1) destino = lista.length - 1;
    if (destino === atual) return lista;

    var item = lista.splice(atual, 1)[0];
    lista.splice(destino, 0, item);
    salvarRoteiro(lista);
    return lista;
}

function distanciaMetros(a, b) {
    if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) {
        return null;
    }

    var lat1 = Number(a.lat);
    var lng1 = Number(a.lng);
    var lat2 = Number(b.lat);
    var lng2 = Number(b.lng);

    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
        return null;
    }

    var r = 6371000;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLng = (lng2 - lng1) * Math.PI / 180;
    var x =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return Math.round(r * c);
}

function formatarDistancia(metros) {
    if (metros == null) return '';
    if (metros < 1000) return metros + ' m';
    return (metros / 1000).toFixed(1).replace('.', ',') + ' km';
}

function locaisProximos(origem, candidatos, limite) {
    var max = limite || 4;
    var chaveOrigem = chaveDoLocal(origem);
    var comDistancia = [];

    for (var i = 0; i < candidatos.length; i++) {
        var item = candidatos[i];
        if (chaveDoLocal(item) === chaveOrigem) continue;
        if (estaNoRoteiro(item)) continue;

        var d = distanciaMetros(origem, item);
        if (d == null) continue;

        comDistancia.push({
            local: item,
            metros: d
        });
    }

    comDistancia.sort(function (a, b) {
        return a.metros - b.metros;
    });

    return comDistancia.slice(0, max);
}

function abrirNoGoogleMaps(item) {
    var url = '';

    if (item.lat != null && item.lng != null && item.lat !== '' && item.lng !== '') {
        url = 'https://www.google.com/maps/dir/?api=1&destination=' + item.lat + ',' + item.lng;
    } else if (item.endereco) {
        url = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(item.endereco);
    } else if (item.nome) {
        url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(item.nome + ' Caruaru');
    }

    if (!url) {
        alert('Esse local nao tem coordenadas pra abrir no Maps');
        return;
    }

    window.open(url, '_blank');
}
