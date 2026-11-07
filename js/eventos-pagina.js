function montarListaEventos() {
    var caixa = document.getElementById('lista-eventos');
    if (!caixa) return;

    caixa.innerHTML = '';

    for (var i = 0; i < EVENTOS_FIXOS.length; i++) {
        var ev = EVENTOS_FIXOS[i];
        var card = document.createElement('article');
        card.className = 'card-evento';
        card.innerHTML =
            '<h3>' + t(ev.nome) + '</h3>' +
            '<p><strong>' + t('eventos_periodo') + ':</strong> ' + t(ev.periodo) + '</p>' +
            '<p><strong>' + t('eventos_local') + ':</strong> ' + t(ev.local) + '</p>' +
            '<p>' + t(ev.texto) + '</p>';
        caixa.appendChild(card);
    }
}

window.onIdiomaTrocado = montarListaEventos;
montarListaEventos();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(function (reg) {
        reg.update();
    });
}
