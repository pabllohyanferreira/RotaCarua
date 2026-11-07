async function carregarPaginaCupons() {
    var logado = await pegarUsuarioSalvo();
    if (!logado) {
        window.location.href = 'login.html?next=' + encodeURIComponent('cupons.html');
        return;
    }

    var nome = document.getElementById('nome-usuario');
    var btnSair = document.getElementById('btn-sair');
    var btnEntrar = document.getElementById('btn-entrar-header');

    nome.hidden = false;
    nome.textContent = usuario.nome;
    btnSair.hidden = false;
    btnEntrar.hidden = true;

    if (usuario.tipo === 'comercio') {
        document.getElementById('bloco-validacao').hidden = false;
    }

    var caixa = document.getElementById('lista-cupons');
    var lista = await meusCupons();

    if (!lista.length) {
        caixa.innerHTML = '<p>Voce ainda nao gerou cupom. Va em Explorar, abra um parceiro e resgate.</p>';
    } else {
        caixa.innerHTML = '';
        for (var i = 0; i < lista.length; i++) {
            var c = lista[i];
            var div = document.createElement('div');
            div.className = 'card-cupom';
            div.innerHTML =
                '<p class="codigo">' + c.codigo + '</p>' +
                '<p>' + (c.beneficio || '') + '</p>' +
                '<p>' + (c.local_nome || '') + '</p>' +
                '<p>Status: ' + c.status + '</p>';
            caixa.appendChild(div);
        }
    }
}

document.getElementById('btn-sair').onclick = async function () {
    await fazerLogout();
    window.location.href = 'index.html';
};

document.getElementById('form-validacao').onsubmit = async function (e) {
    e.preventDefault();

    var resultado = await validarCupom(document.getElementById('campo-codigo').value);
    if (!resultado) return;

    var msg = document.getElementById('msg-validacao');
    msg.hidden = false;
    msg.className = 'msg-info ok';
    msg.textContent = 'Cupom validado e salvo no banco.';

    document.getElementById('resultado-validacao').innerHTML =
        '<div class="card-cupom"><p class="codigo">' + resultado.codigo + '</p><p>' +
        (resultado.beneficio || '') + '</p></div>';

    carregarPaginaCupons();
};

carregarPaginaCupons();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(function (reg) {
        reg.update();
    });
}
