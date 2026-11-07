var PLACES_BASE = 'https://places.googleapis.com/v1';
var OVERPASS_URLS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
];
var NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
var CACHE_OSM_MS = 30 * 60 * 1000;

var TIPOS_POR_CATEGORIA = {
    alimentacao: ['restaurant', 'cafe', 'bakery'],
    artesanato: ['gift_shop', 'store'],
    moda: ['clothing_store', 'shoe_store'],
    servicos: ['hair_care', 'laundry'],
    cultura: ['tourist_attraction', 'museum', 'art_gallery'],
    todos: ['restaurant', 'cafe', 'tourist_attraction', 'store', 'clothing_store']
};

var TAGS_OSM = {
    alimentacao: [
        'nwr["amenity"~"restaurant|cafe|bakery|fast_food|bar|ice_cream"]'
    ],
    artesanato: [
        'nwr["shop"~"gift|craft|art|souvenir"]'
    ],
    moda: [
        'nwr["shop"~"clothes|shoes|boutique|jewelry"]'
    ],
    servicos: [
        'nwr["shop"~"hairdresser|laundry|beauty|chemist"]',
        'nwr["amenity"~"bank|pharmacy|university|college|school"]'
    ],
    cultura: [
        'nwr["tourism"]',
        'nwr["amenity"~"theatre|arts_centre|library|place_of_worship"]',
        'nwr["historic"]'
    ],
    todos: [
        'nwr["amenity"~"restaurant|cafe|bakery|fast_food|bar|theatre|library|bank|pharmacy|university|college|school|place_of_worship"]',
        'nwr["shop"~"clothes|shoes|gift|craft|hairdresser|beauty|supermarket|convenience"]',
        'nwr["tourism"]'
    ]
};

var LOCAIS_DESTAQUE = [
    {
        origem: 'destaque',
        place_id: 'fix/faculdade-nova-roma',
        nome: 'Faculdade Nova Roma',
        categoria: 'servicos',
        descricao: 'Av. Adjar da Silva Casé, 800 - Indianópolis',
        endereco: 'Av. Adjar da Silva Casé, 800 - Indianópolis, Caruaru',
        horario: '',
        lat: -8.29478,
        lng: -35.951643,
        rating: null,
        telefone: '',
        site: '',
        beneficio_id: '',
        beneficio: '',
        regras: '',
        parceiro: false
    },
    {
        origem: 'destaque',
        place_id: 'fix/estacao-ferroviaria',
        nome: 'Estação Ferroviária de Caruaru',
        categoria: 'cultura',
        descricao: 'Marco histórico do Centro de Caruaru',
        endereco: 'Centro, Caruaru',
        horario: '',
        lat: -8.2830323,
        lng: -35.9694390,
        rating: null,
        telefone: '',
        site: '',
        beneficio_id: '',
        beneficio: '',
        regras: '',
        parceiro: false
    },
    {
        origem: 'destaque',
        place_id: 'fix/patio-luiz-gonzaga',
        nome: 'Pátio de Eventos Luiz Gonzaga',
        categoria: 'cultura',
        descricao: 'Espaço de eventos e cultura no Centro',
        endereco: 'Centro, Caruaru',
        horario: '',
        lat: -8.2821318,
        lng: -35.9655499,
        rating: null,
        telefone: '',
        site: '',
        beneficio_id: '',
        beneficio: '',
        regras: '',
        parceiro: false
    }
];

function headersPlaces(fieldMask) {
    return {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
        'X-Goog-FieldMask': fieldMask
    };
}

function normalizarLugar(place, categoria) {
    return {
        origem: 'places',
        place_id: place.id || '',
        nome: place.displayName ? place.displayName.text : 'Sem nome',
        categoria: categoria || 'todos',
        descricao: place.formattedAddress || '',
        endereco: place.formattedAddress || '',
        horario: '',
        lat: place.location ? place.location.latitude : null,
        lng: place.location ? place.location.longitude : null,
        rating: place.rating || null,
        telefone: place.nationalPhoneNumber || '',
        site: place.websiteUri || '',
        beneficio_id: '',
        beneficio: '',
        regras: '',
        parceiro: false
    };
}

function categoriaDoElemento(tags) {
    if (!tags) return 'todos';
    var amenity = tags.amenity || '';
    var shop = tags.shop || '';

    if (
        amenity === 'restaurant' || amenity === 'cafe' || amenity === 'bakery' ||
        amenity === 'fast_food' || amenity === 'bar' || amenity === 'ice_cream' || amenity === 'food_court'
    ) {
        return 'alimentacao';
    }
    if (shop === 'gift' || shop === 'craft' || shop === 'art' || shop === 'souvenir') return 'artesanato';
    if (shop === 'clothes' || shop === 'shoes' || shop === 'boutique' || shop === 'jewelry') return 'moda';
    if (
        shop === 'hairdresser' || shop === 'laundry' || shop === 'beauty' || shop === 'chemist' ||
        amenity === 'bank' || amenity === 'pharmacy' || amenity === 'university' ||
        amenity === 'college' || amenity === 'school'
    ) {
        return 'servicos';
    }
    if (
        tags.tourism || tags.historic ||
        amenity === 'theatre' || amenity === 'arts_centre' || amenity === 'library' ||
        amenity === 'place_of_worship' || tags.leisure === 'park' || tags.leisure === 'garden'
    ) {
        return 'cultura';
    }
    return 'todos';
}

function locaisDestaquePorCategoria(categoria) {
    var lista = [];
    for (var i = 0; i < LOCAIS_DESTAQUE.length; i++) {
        var item = LOCAIS_DESTAQUE[i];
        if (categoria === 'todos' || item.categoria === categoria) {
            lista.push(item);
        }
    }
    return lista;
}

function normalizarOsm(el, categoria) {
    var tags = el.tags || {};
    var lat = el.lat;
    var lng = el.lon;
    if (lat == null && el.center) {
        lat = el.center.lat;
        lng = el.center.lon;
    }

    var endereco = '';
    if (tags['addr:street']) {
        endereco = tags['addr:street'];
        if (tags['addr:housenumber']) endereco += ', ' + tags['addr:housenumber'];
    }

    return {
        origem: 'osm',
        place_id: String(el.type + '/' + el.id),
        nome: tags.name || tags.brand || 'Local sem nome',
        categoria: categoria || categoriaDoElemento(tags),
        descricao: endereco || (tags.amenity || tags.shop || tags.tourism || ''),
        endereco: endereco,
        horario: tags.opening_hours || '',
        lat: lat,
        lng: lng,
        rating: null,
        telefone: tags.phone || tags['contact:phone'] || '',
        site: tags.website || tags['contact:website'] || '',
        beneficio_id: '',
        beneficio: '',
        regras: '',
        parceiro: false
    };
}

function chaveCacheOsm(categoria) {
    return 'rota_osm_' + categoria + '_' + RAIO_BUSCA_METROS;
}

function lerCacheOsm(categoria) {
    try {
        var raw = sessionStorage.getItem(chaveCacheOsm(categoria));
        if (!raw) return null;
        var obj = JSON.parse(raw);
        if (!obj || !obj.t || !obj.lista) return null;
        if (Date.now() - obj.t > CACHE_OSM_MS) return null;
        return obj.lista;
    } catch (e) {
        return null;
    }
}

function salvarCacheOsm(categoria, lista) {
    try {
        sessionStorage.setItem(chaveCacheOsm(categoria), JSON.stringify({
            t: Date.now(),
            lista: lista
        }));
    } catch (e) {}
}

async function fetchOverpass(query) {
    var body = 'data=' + encodeURIComponent(query);
    var ultimoErro = null;

    for (var i = 0; i < OVERPASS_URLS.length; i++) {
        try {
            var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
            var timer = setTimeout(function () {
                if (ctrl) ctrl.abort();
            }, 12000);

            var resp = await fetch(OVERPASS_URLS[i], {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                body: body,
                signal: ctrl ? ctrl.signal : undefined
            });
            clearTimeout(timer);

            if (!resp.ok) {
                ultimoErro = new Error('Overpass HTTP ' + resp.status);
                continue;
            }
            return await resp.json();
        } catch (e) {
            ultimoErro = e;
        }
    }

    throw ultimoErro || new Error('Nao deu pra buscar lugares perto');
}

function montarListaOsm(elements, categoria) {
    var lista = [];
    var vistos = {};

    for (var j = 0; j < elements.length; j++) {
        var item = normalizarOsm(elements[j], categoria === 'todos' ? null : categoria);
        if (!item.nome || item.nome === 'Local sem nome') continue;
        if (item.lat == null || item.lng == null) continue;
        if (vistos[item.place_id]) continue;
        vistos[item.place_id] = true;
        lista.push(item);
    }

    lista = filtrarPorRaio(lista, RAIO_BUSCA_METROS);

    var destaques = locaisDestaquePorCategoria(categoria);
    for (var d = 0; d < destaques.length; d++) {
        if (!vistos[destaques[d].place_id]) {
            vistos[destaques[d].place_id] = true;
            lista.push(destaques[d]);
        }
    }

    return lista;
}

async function buscarProximosOsm(categoria) {
    var cache = lerCacheOsm(categoria);
    if (cache) return cache;

    var tags = TAGS_OSM[categoria] || TAGS_OSM.todos;
    var around =
        'around:' + RAIO_BUSCA_METROS + ',' +
        CENTRO_AREA.latitude + ',' +
        CENTRO_AREA.longitude;
    var partes = [];
    for (var i = 0; i < tags.length; i++) {
        partes.push(tags[i] + '(' + around + ');');
    }

    var query = '[out:json][timeout:15];(' + partes.join('') + ');out center 50;';
    var data = await fetchOverpass(query);
    var lista = montarListaOsm(data.elements || [], categoria);
    salvarCacheOsm(categoria, lista);
    return lista;
}

async function buscarProximosGoogle(categoria) {
    var tipos = TIPOS_POR_CATEGORIA[categoria] || TIPOS_POR_CATEGORIA.todos;
    var resp = await fetch(PLACES_BASE + '/places:searchNearby', {
        method: 'POST',
        headers: headersPlaces('places.id,places.displayName,places.formattedAddress,places.rating,places.location'),
        body: JSON.stringify({
            includedTypes: tipos,
            maxResultCount: 20,
            locationRestriction: {
                circle: { center: CENTRO_AREA, radius: RAIO_BUSCA_METROS }
            }
        })
    });

    if (!resp.ok) {
        console.log('searchNearby', await resp.text());
        throw new Error('Nao deu pra buscar lugares perto');
    }

    var data = await resp.json();
    var places = data.places || [];
    var lista = [];
    for (var i = 0; i < places.length; i++) {
        lista.push(normalizarLugar(places[i], categoria));
    }
    return filtrarPorRaio(lista, RAIO_BUSCA_METROS);
}

async function buscarProximos(categoria) {
    var preferirLivre = typeof USAR_MAPA_LIVRE === 'undefined' ? true : USAR_MAPA_LIVRE;

    if (!preferirLivre) {
        try {
            return await buscarProximosGoogle(categoria);
        } catch (e) {
            console.log('Places Google falhou, usando OpenStreetMap', e);
        }
    }

    return buscarProximosOsm(categoria);
}

async function buscarPorTextoOsm(texto) {
    var delta = 0.02;
    var viewbox =
        (CENTRO_AREA.longitude - delta) + ',' +
        (CENTRO_AREA.latitude + delta) + ',' +
        (CENTRO_AREA.longitude + delta) + ',' +
        (CENTRO_AREA.latitude - delta);

    var url =
        NOMINATIM_URL + '/search?format=json&limit=20&addressdetails=0' +
        '&q=' + encodeURIComponent(texto + ' Caruaru') +
        '&viewbox=' + encodeURIComponent(viewbox);

    var resp = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!resp.ok) {
        console.log('nominatim', await resp.text());
        throw new Error('Nao deu pra buscar esse texto');
    }

    var data = await resp.json();
    var lista = [];
    for (var i = 0; i < data.length; i++) {
        var row = data[i];
        lista.push({
            origem: 'osm',
            place_id: String(row.osm_type + '/' + row.osm_id),
            nome: row.display_name ? row.display_name.split(',')[0] : 'Sem nome',
            categoria: 'todos',
            descricao: row.display_name || '',
            endereco: row.display_name || '',
            horario: '',
            lat: Number(row.lat),
            lng: Number(row.lon),
            rating: null,
            telefone: '',
            site: '',
            beneficio_id: '',
            beneficio: '',
            regras: '',
            parceiro: false
        });
    }
    var destaques = locaisDestaquePorCategoria('todos');
    var textoBaixo = texto.toLowerCase();
    for (var d = 0; d < destaques.length; d++) {
        if (destaques[d].nome.toLowerCase().indexOf(textoBaixo) !== -1) {
            lista.push(destaques[d]);
        }
    }

    return filtrarPorRaio(lista, RAIO_BUSCA_METROS + 500);
}

async function buscarPorTextoGoogle(texto) {
    var box = limitesDaArea();
    var resp = await fetch(PLACES_BASE + '/places:searchText', {
        method: 'POST',
        headers: headersPlaces('places.id,places.displayName,places.formattedAddress,places.rating,places.location'),
        body: JSON.stringify({
            textQuery: texto,
            locationRestriction: {
                rectangle: { low: box.low, high: box.high }
            }
        })
    });

    if (!resp.ok) {
        console.log('searchText', await resp.text());
        throw new Error('Nao deu pra buscar esse texto');
    }

    var data = await resp.json();
    var places = data.places || [];
    var lista = [];
    for (var i = 0; i < places.length; i++) {
        lista.push(normalizarLugar(places[i], 'todos'));
    }
    return filtrarPorRaio(lista, RAIO_BUSCA_METROS);
}

async function buscarPorTexto(texto) {
    var preferirLivre = typeof USAR_MAPA_LIVRE === 'undefined' ? true : USAR_MAPA_LIVRE;

    if (!preferirLivre) {
        try {
            return await buscarPorTextoGoogle(texto);
        } catch (e) {
            console.log('searchText Google falhou, usando Nominatim', e);
        }
    }

    return buscarPorTextoOsm(texto);
}

async function detalhesDoLugar(placeId) {
    if (!placeId) {
        return { horario: '', telefone: '', site: '', rating: null, avaliacoes: null };
    }

    if (String(placeId).indexOf('/') !== -1 && String(placeId).indexOf('places/') !== 0) {
        var partes = String(placeId).split('/');
        var query = '[out:json];' + partes[0] + '(' + partes[1] + ');out tags center;';
        var respOsm = await fetch(OVERPASS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: 'data=' + encodeURIComponent(query)
        });
        if (!respOsm.ok) throw new Error('Nao deu pra abrir os detalhes');
        var dataOsm = await respOsm.json();
        var el = dataOsm.elements && dataOsm.elements[0] ? dataOsm.elements[0] : null;
        if (!el) {
            return { horario: '', telefone: '', site: '', rating: null, avaliacoes: null };
        }
        var itemOsm = normalizarOsm(el);
        itemOsm.avaliacoes = null;
        return itemOsm;
    }

    var id = placeId;
    if (id.indexOf('places/') === 0) id = id.replace('places/', '');

    var resp = await fetch(PLACES_BASE + '/places/' + id, {
        method: 'GET',
        headers: headersPlaces(
            'id,displayName,formattedAddress,rating,userRatingCount,nationalPhoneNumber,websiteUri,regularOpeningHours,location'
        )
    });

    if (!resp.ok) {
        console.log('details', await resp.text());
        throw new Error('Nao deu pra abrir os detalhes');
    }

    var place = await resp.json();
    var item = normalizarLugar(place, 'todos');

    if (place.regularOpeningHours && place.regularOpeningHours.weekdayDescriptions) {
        item.horario = place.regularOpeningHours.weekdayDescriptions.join(' | ');
    } else if (place.regularOpeningHours && place.regularOpeningHours.openNow === true) {
        item.horario = 'Aberto agora';
    } else if (place.regularOpeningHours && place.regularOpeningHours.openNow === false) {
        item.horario = 'Fechado agora';
    }

    item.telefone = place.nationalPhoneNumber || '';
    item.site = place.websiteUri || '';
    item.rating = place.rating || null;
    item.avaliacoes = place.userRatingCount || null;
    return item;
}
