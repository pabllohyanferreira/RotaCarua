var PLACES_BASE = 'https://places.googleapis.com/v1';

var TIPOS_POR_CATEGORIA = {
    alimentacao: ['restaurant', 'cafe', 'bakery'],
    artesanato: ['gift_shop', 'store'],
    moda: ['clothing_store', 'shoe_store'],
    servicos: ['hair_care', 'laundry'],
    cultura: ['tourist_attraction', 'museum', 'art_gallery'],
    todos: ['restaurant', 'cafe', 'tourist_attraction', 'store', 'clothing_store']
};

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

async function buscarProximos(categoria) {
    var tipos = TIPOS_POR_CATEGORIA[categoria] || TIPOS_POR_CATEGORIA.todos;

    var body = {
        includedTypes: tipos,
        maxResultCount: 20,
        locationRestriction: {
            circle: {
                center: CENTRO_AREA,
                radius: RAIO_BUSCA_METROS
            }
        }
    };

    var resp = await fetch(PLACES_BASE + '/places:searchNearby', {
        method: 'POST',
        headers: headersPlaces('places.id,places.displayName,places.formattedAddress,places.rating,places.location'),
        body: JSON.stringify(body)
    });

    if (!resp.ok) {
        console.log('searchNearby', await resp.text());
        throw new Error('Nao deu pra buscar lugares perto');
    }

    var data = await resp.json();
    var lista = [];
    var places = data.places || [];

    for (var i = 0; i < places.length; i++) {
        lista.push(normalizarLugar(places[i], categoria));
    }

    return filtrarDentroDaArea(lista);
}

async function buscarPorTexto(texto) {
    var box = limitesDaArea();

    var body = {
        textQuery: texto,
        locationRestriction: {
            rectangle: {
                low: box.low,
                high: box.high
            }
        }
    };

    var resp = await fetch(PLACES_BASE + '/places:searchText', {
        method: 'POST',
        headers: headersPlaces('places.id,places.displayName,places.formattedAddress,places.rating,places.location'),
        body: JSON.stringify(body)
    });

    if (!resp.ok) {
        console.log('searchText', await resp.text());
        throw new Error('Nao deu pra buscar esse texto');
    }

    var data = await resp.json();
    var lista = [];
    var places = data.places || [];

    for (var i = 0; i < places.length; i++) {
        lista.push(normalizarLugar(places[i], 'todos'));
    }

    return filtrarDentroDaArea(lista);
}

async function detalhesDoLugar(placeId) {
    var id = placeId;
    if (id.indexOf('places/') === 0) {
        id = id.replace('places/', '');
    }

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
