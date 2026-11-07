function montarOpcoesPosicao(total, atual) {
    var html = '';
    for (var i = 0; i < total; i++) {
        html +=
            '<option value="' + i + '"' + (i === atual ? ' selected' : '') + '>' +
            (i + 1) + 'ª parada' +
            '</option>';
    }
    return html;
}

function montarListaRoteiro() {
    var caixa = document.getElementById('lista-roteiro');
    var lista = lerRoteiro();
    var vazio = document.getElementById('roteiro-vazio');
    var acoes = document.getElementById('acoes-roteiro');

    if (!lista.length) {
        caixa.innerHTML = '';
        if (vazio) vazio.hidden = false;
        if (acoes) acoes.hidden = true;
        return;
    }

    if (vazio) vazio.hidden = true;
    if (acoes) acoes.hidden = false;
    caixa.innerHTML = '';

    for (var i = 0; i < lista.length; i++) {
        var item = lista[i];
        var distAnterior = i === 0 ? null : distanciaMetros(lista[i - 1], item);
        var textoPasso = i === 0
            ? 'Primeira parada do passeio'
            : (distAnterior != null ? ('Da anterior: ' + formatarDistancia(distAnterior)) : 'Proxima parada');

        var div = document.createElement('div');
        div.className = 'card-local card-roteiro';
        div.innerHTML =
            '<div class="roteiro-conteudo">' +
            '<div class="roteiro-topo">' +
            '<span class="badge badge-roteiro">Parada ' + (i + 1) + '</span>' +
            '<label class="campo-ordem">' +
            '<span>Ordem</span>' +
            '<select class="select-ordem" data-chave="' + item.chave + '" aria-label="Escolher ordem da parada">' +
            montarOpcoesPosicao(lista.length, i) +
            '</select>' +
            '</label>' +
            '</div>' +
            '<button type="button" class="card-roteiro-abrir">' +
            '<strong>' + item.nome + '</strong>' +
            '<span>' + (item.endereco || '') + '</span>' +
            '<span class="texto-pequeno">' + textoPasso + '</span>' +
            '</button>' +
            '<div class="roteiro-controles">' +
            '<button type="button" class="btn btn-secondary btn-remover-roteiro" data-chave="' + item.chave + '">Remover</button>' +
            '</div>' +
            '</div>';

        div.querySelector('.card-roteiro-abrir').onclick = (function (local) {
            return function () {
                abrirNoGoogleMaps(local);
            };
        })(item);

        div.querySelector('.select-ordem').onchange = function () {
            moverParada(this.getAttribute('data-chave'), this.value);
            montarListaRoteiro();
        };

        div.querySelector('.btn-remover-roteiro').onclick = function () {
            removerDoRoteiro(this.getAttribute('data-chave'));
            montarListaRoteiro();
        };

        caixa.appendChild(div);
    }
}

async function carregarPaginaRoteiro() {
    var logado = await pegarUsuarioSalvo();
    if (!logado) {
        window.location.href = 'login.html?next=' + encodeURIComponent('roteiro.html');
        return;
    }

    var nome = document.getElementById('nome-usuario');
    var btnSair = document.getElementById('btn-sair');
    var btnEntrar = document.getElementById('btn-entrar-header');

    nome.hidden = false;
    nome.textContent = usuario.nome;
    btnSair.hidden = false;
    btnEntrar.hidden = true;

    montarListaRoteiro();
}

document.getElementById('btn-sair').onclick = async function () {
    await fazerLogout();
    window.location.href = 'index.html';
};

carregarPaginaRoteiro();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(function (reg) {
        reg.update();
    });
}
