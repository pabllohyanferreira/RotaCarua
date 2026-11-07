var filtroAtual = 'todos';
var localAtual = null;

function esconderTudo() {
    document.getElementById('painel-mapa').hidden = true;
    document.getElementById('painel-ficha').hidden = true;
    document.getElementById('painel-cupons').hidden = true;
    document.getElementById('painel-validacao').hidden = true;
}

function irProMapa() {
    esconderTudo();
    document.getElementById('painel-mapa').hidden = false;
    montarMapa();
}

function mostrarApp() {
    document.getElementById('tela-login').hidden = true;
    document.getElementById('tela-app').hidden = false;
    document.getElementById('nome-usuario').textContent = usuario.nome;

    if (usuario.tipo === 'comercio') {
        document.getElementById('btn-validar-comercio').hidden = false;
    } else {
        document.getElementById('btn-validar-comercio').hidden = true;
    }

    irProMapa();
}

async function montarMapa() {
    var vazio = document.getElementById('mapa-vazio');
    var soAcessivel = document.getElementById('filtro-acessivel').checked;

    vazio.hidden = false;
    vazio.textContent = 'Carregando mapa...';

    try {
        await prepararMapa();
    } catch (erro) {
        vazio.textContent = erro.message;
        return;
    }

    var lista = await buscarLocais(filtroAtual, soAcessivel);

    if (lista.length === 0) {
        limparMarcadores();
        vazio.hidden = false;
        vazio.textContent = 'Nenhum local nessa categoria.';
        return;
    }

    vazio.hidden = true;
    colocarPins(lista);
}

function abrirFicha(local) {
    localAtual = local;
    esconderTudo();
    document.getElementById('painel-ficha').hidden = false;

    document.getElementById('ficha-categoria').textContent = nomeCategoria(local.categoria);
    document.getElementById('ficha-nome').textContent = local.nome;
    document.getElementById('ficha-descricao').textContent = local.descricao;
    document.getElementById('ficha-endereco').textContent = local.endereco;
    document.getElementById('ficha-horario').textContent = local.horario;

    if (local.acessibilidade) {
        document.getElementById('ficha-acessibilidade').textContent = local.acessibilidade;
    } else {
        document.getElementById('ficha-acessibilidade').textContent = 'Nao informado';
    }

    document.getElementById('btn-abrir-rota').href =
        'https://www.google.com/maps/dir/?api=1&destination=' + local.lat + ',' + local.lng;

    document.getElementById('msg-ficha').hidden = true;

    if (local.beneficio) {
        document.getElementById('bloco-beneficio').hidden = false;
        document.getElementById('beneficio-titulo').textContent = local.beneficio;
        document.getElementById('beneficio-regras').textContent = local.regras;
    } else {
        document.getElementById('bloco-beneficio').hidden = true;
    }
}

async function mostrarCupons() {
    esconderTudo();
    document.getElementById('painel-cupons').hidden = false;

    var caixa = document.getElementById('lista-cupons');
    caixa.innerHTML = 'Carregando...';

    var lista = await meusCupons();

    if (lista.length === 0) {
        caixa.innerHTML = '<p>Nenhum cupom ainda.</p>';
        return;
    }

    caixa.innerHTML = '';

    for (var i = 0; i < lista.length; i++) {
        var c = lista[i];
        var div = document.createElement('div');
        div.className = 'card-cupom status-' + c.status;
        div.innerHTML =
            '<p class="codigo">' + c.codigo + '</p>' +
            '<h3>' + c.beneficio + '</h3>' +
            '<p>' + c.local_nome + '</p>' +
            '<p class="texto-pequeno">Status: ' + c.status + '</p>' +
            '<p class="texto-pequeno">' + c.data + '</p>';
        caixa.appendChild(div);
    }
}

document.getElementById('form-login').onsubmit = async function (e) {
    e.preventDefault();

    var email = document.getElementById('campo-email').value;
    var senha = document.getElementById('campo-senha').value;
    var msg = document.getElementById('msg-login');

    msg.hidden = true;

    var ok = await fazerLogin(email, senha);

    if (!ok) {
        msg.hidden = false;
        msg.textContent = 'Email ou senha errados';
        return;
    }

    mostrarApp();
};

document.getElementById('btn-sair').onclick = async function () {
    await fazerLogout();
    document.getElementById('tela-app').hidden = true;
    document.getElementById('tela-login').hidden = false;
};

document.getElementById('filtros').onclick = function (e) {
    if (!e.target.classList.contains('filtro')) return;

    filtroAtual = e.target.getAttribute('data-categoria');

    var botoes = document.querySelectorAll('.filtro');
    for (var i = 0; i < botoes.length; i++) {
        botoes[i].classList.remove('ativo');
    }
    e.target.classList.add('ativo');

    montarMapa();
};

document.getElementById('filtro-acessivel').onchange = function () {
    montarMapa();
};

document.getElementById('btn-voltar-mapa').onclick = irProMapa;
document.getElementById('btn-voltar-mapa-2').onclick = irProMapa;
document.getElementById('btn-voltar-mapa-3').onclick = irProMapa;

document.getElementById('btn-meus-cupons').onclick = function () {
    mostrarCupons();
};

document.getElementById('btn-validar-comercio').onclick = function () {
    esconderTudo();
    document.getElementById('painel-validacao').hidden = false;
    document.getElementById('msg-validacao').hidden = true;
    document.getElementById('resultado-validacao').hidden = true;
    document.getElementById('campo-codigo').value = '';
};

document.getElementById('btn-gerar-cupom').onclick = async function () {
    var cupom = await criarCupom(localAtual);
    if (!cupom) return;

    var msg = document.getElementById('msg-ficha');
    msg.hidden = false;
    msg.className = 'msg-info ok';
    msg.innerHTML = 'Cupom: <strong>' + cupom.codigo + '</strong><br>Mostre no comercio pra validar.';
};

document.getElementById('form-validacao').onsubmit = async function (e) {
    e.preventDefault();

    var codigo = document.getElementById('campo-codigo').value;
    var resultado = await validarCupom(codigo);

    if (!resultado) return;

    var msg = document.getElementById('msg-validacao');
    msg.hidden = false;
    msg.className = 'msg-info ok';
    msg.textContent = 'Cupom validado e salvo no banco/local.';

    var caixa = document.getElementById('resultado-validacao');
    caixa.hidden = false;
    caixa.innerHTML =
        '<div class="card-cupom status-usado">' +
        '<p class="codigo">' + resultado.codigo + '</p>' +
        '<p>' + resultado.beneficio + '</p>' +
        '<p class="texto-pequeno">' + resultado.local_nome + '</p>' +
        '</div>';
};

// start
(async function () {
    var u = await pegarUsuarioSalvo();
    if (u) {
        mostrarApp();
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }
})();
