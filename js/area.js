var VERTICES_AREA = [
    { lat: -8.2796, lng: -35.9722 },
    { lat: -8.2792, lng: -35.9660 },
    { lat: -8.2810, lng: -35.9644 },
    { lat: -8.2835, lng: -35.9646 },
    { lat: -8.2852, lng: -35.9665 },
    { lat: -8.2855, lng: -35.9695 },
    { lat: -8.2848, lng: -35.9720 },
    { lat: -8.2818, lng: -35.9726 }
];

var CENTRO_AREA = {
    latitude: -8.2823,
    longitude: -35.9685
};

var RAIO_BUSCA_METROS = 700;

function pontoDentroDaArea(lat, lng) {
    var dentro = false;
    var j = VERTICES_AREA.length - 1;

    for (var i = 0; i < VERTICES_AREA.length; i++) {
        var yi = VERTICES_AREA[i].lat;
        var xi = VERTICES_AREA[i].lng;
        var yj = VERTICES_AREA[j].lat;
        var xj = VERTICES_AREA[j].lng;

        var cruza =
            ((yi > lat) !== (yj > lat)) &&
            (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi);

        if (cruza) {
            dentro = !dentro;
        }

        j = i;
    }

    return dentro;
}

function filtrarDentroDaArea(lista) {
    var saida = [];

    for (var i = 0; i < lista.length; i++) {
        var item = lista[i];
        if (item.lat == null || item.lng == null) {
            continue;
        }
        if (pontoDentroDaArea(Number(item.lat), Number(item.lng))) {
            saida.push(item);
        }
    }

    return saida;
}

function limitesDaArea() {
    var sul = VERTICES_AREA[0].lat;
    var norte = VERTICES_AREA[0].lat;
    var oeste = VERTICES_AREA[0].lng;
    var leste = VERTICES_AREA[0].lng;

    for (var i = 1; i < VERTICES_AREA.length; i++) {
        if (VERTICES_AREA[i].lat < sul) sul = VERTICES_AREA[i].lat;
        if (VERTICES_AREA[i].lat > norte) norte = VERTICES_AREA[i].lat;
        if (VERTICES_AREA[i].lng < oeste) oeste = VERTICES_AREA[i].lng;
        if (VERTICES_AREA[i].lng > leste) leste = VERTICES_AREA[i].lng;
    }

    return {
        low: { latitude: sul, longitude: oeste },
        high: { latitude: norte, longitude: leste }
    };
}
