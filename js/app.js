var filtroAtual = 'todos';
var localAtual = null;
var parceirosDb = [];
var listaMapaAtual = [];

function atualizarHeader() {
    var nome = document.getElementById('nome-usuario');
    var btnSair = document.getElementById('btn-sair');
    var btnEntrar = document.getElementById('btn-entrar-header');
    var btnValidar = document.getElementById('btn-validar-comercio');

    if (usuario) {
        nome.hidden = false;
        nome.textContent = usuario.nome;
        btnSair.hidden = false;
        btnEntrar.hidden = true;
        btnValidar.hidden = usuario.tipo !== 'comercio';
    } else {
        nome.hidden = true;
        btnSair.hidden = true;
        btnEntrar.hidden = false;
        btnValidar.hidden = true;
    }
}

function irParaLogin(destino) {
    var next = destino || 'index.html';
    window.location.href = 'login.html?next=' + encodeURIComponent(next);
}

function precisaLogin(destino) {
    if (usuario) {
        return false;
    }
    irParaLogin(destino);
    return true;
}

async function carregarParceiros() {
    try {
        var todos = await buscarLocais('todos', false);
        parceirosDb = filtrarPorRaio(todos, RAIO_BUSCA_METROS + 500);
        if (!parceirosDb.length) {
            parceirosDb = todos;
        }
    } catch (e) {
        parceirosDb = [];
    }
}

function acharParceiro(place) {
    for (var i = 0; i < parceirosDb.length; i++) {
        var p = parceirosDb[i];

        if (p.nome && place.nome) {
            var trecho = place.nome.toLowerCase().split(' ')[0];
            if (p.nome.toLowerCase().indexOf(trecho) !== -1) {
                return p;
            }
        }

        if (p.lat && place.lat) {
            var dLat = Math.abs(Number(p.lat) - Number(place.lat));
            var dLng = Math.abs(Number(p.lng) - Number(place.lng));
            if (dLat < 0.0008 && dLng < 0.0008) {
                return p;
            }
        }
    }

    return null;
}

function atualizarBotaoRoteiro() {
    var btn = document.getElementById('btn-add-roteiro');
    if (!btn) return;

    if (localAtual && estaNoRoteiro(localAtual)) {
        btn.textContent = 'Ja esta no roteiro';
        btn.disabled = true;
    } else {
        btn.textContent = 'Adicionar ao roteiro';
        btn.disabled = false;
    }
}

function montarProximos(origem) {
    var bloco = document.getElementById('bloco-proximos');
    var caixa = document.getElementById('lista-proximos');
    if (!bloco || !caixa) return;

    if (!origem || !listaMapaAtual.length) {
        bloco.hidden = true;
        return;
    }

    var sugestoes = locaisProximos(origem, listaMapaAtual, 4);

    if (!sugestoes.length) {
        bloco.hidden = true;
        return;
    }

    bloco.hidden = false;
    caixa.innerHTML = '';

    for (var i = 0; i < sugestoes.length; i++) {
        var item = sugestoes[i];
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'card-local card-proximo';
        card.innerHTML =
            '<strong>' + item.local.nome + '</strong>' +
            '<span class="badge badge-distancia">' + formatarDistancia(item.metros) + '</span>' +
            '<span>' + (item.local.endereco || '') + '</span>';

        card.onclick = (function (l) {
            return function () {
                abrirFicha(l);
            };
        })(item.local);

        caixa.appendChild(card);
    }
}

function montarLista(lista) {
    var caixa = document.getElementById('establishments-list');
    caixa.innerHTML = '';

    if (!lista.length) {
        caixa.innerHTML = '<p>Nenhum estabelecimento nessa area.</p>';
        return;
    }

    var roteiro = [];
    try { roteiro = lerRoteiro(); } catch (e) { roteiro = []; }

    for (var i = 0; i < lista.length; i++) {
        var item = lista[i];
        var numParada = typeof numeroParadaDoLocal === 'function'
            ? numeroParadaDoLocal(item, roteiro)
            : null;
        var card = document.createElement('button');
        card.type = 'button';
        card.className = 'card-local' + (numParada ? ' no-roteiro' : '');
        card.innerHTML =
            '<strong>' + item.nome + '</strong>' +
            (numParada
                ? '<span class="badge badge-roteiro">Parada ' + numParada + '</span>'
                : '') +
            (item.parceiro ? '<span class="badge">Parceiro</span>' : '') +
            '<span>' + (item.endereco || '') + '</span>' +
            (item.rating ? '<span>Nota: ' + item.rating + '</span>' : '');

        card.onclick = (function (l) {
            return function () {
                abrirFicha(l);
            };
        })(item);

        caixa.appendChild(card);
    }
}

function listaBaseMapa() {
    var lista = [];
    var i;

    for (i = 0; i < parceirosDb.length; i++) {
        var p = parceirosDb[i];
        if (filtroAtual === 'todos' || p.categoria === filtroAtual) {
            p.origem = 'supabase';
            p.parceiro = true;
            lista.push(p);
        }
    }

    if (typeof locaisDestaquePorCategoria === 'function') {
        var destaques = locaisDestaquePorCategoria(filtroAtual);
        for (i = 0; i < destaques.length; i++) {
            lista.push(destaques[i]);
        }
    }

    return lista;
}

function juntarLocaisNoMapa(listaPlaces) {
    var listaFinal = listaBaseMapa();
    var chaves = {};
    var i;

    for (i = 0; i < listaFinal.length; i++) {
        chaves[chaveDoLocal(listaFinal[i])] = true;
    }

    for (i = 0; i < listaPlaces.length; i++) {
        var place = listaPlaces[i];
        var chave = chaveDoLocal(place);
        if (chaves[chave]) continue;

        var parceiro = acharParceiro(place);
        if (parceiro) {
            place.parceiro = true;
            place.beneficio_id = parceiro.beneficio_id;
            place.beneficio = parceiro.beneficio;
            place.regras = parceiro.regras;
            place.id = parceiro.id;
        }

        chaves[chave] = true;
        listaFinal.push(place);
    }

    return listaFinal;
}

async function montarMapa() {
    var vazio = document.getElementById('mapa-vazio');
    var pedidoFiltro = filtroAtual;

    vazio.hidden = false;
    vazio.textContent = 'Carregando mapa...';

    try {
        await prepararMapa();
    } catch (erro) {
        vazio.textContent = erro.message;
        return;
    }

    var base = listaBaseMapa();
    listaMapaAtual = base;
    if (base.length) {
        vazio.hidden = true;
        colocarPins(base);
        montarLista(base);
    } else {
        vazio.textContent = 'Buscando locais perto...';
        colocarPins([]);
        montarLista([]);
    }

    buscarProximos(pedidoFiltro).then(function (listaPlaces) {
        if (pedidoFiltro !== filtroAtual) return;

        var listaFinal = juntarLocaisNoMapa(listaPlaces || []);
        if (!listaFinal.length) {
            listaMapaAtual = [];
            vazio.hidden = false;
            vazio.textContent = 'Nenhum local nessa categoria dentro da area.';
            colocarPins([]);
            montarLista([]);
            return;
        }

        listaMapaAtual = listaFinal;
        vazio.hidden = true;
        colocarPins(listaFinal);
        montarLista(listaFinal);
    }).catch(function (erro) {
        console.log(erro);
        if (pedidoFiltro !== filtroAtual) return;
        if (!listaMapaAtual.length) {
            vazio.hidden = false;
            vazio.textContent = 'Nenhum local nessa categoria dentro da area.';
        }
    });
}

async function abrirFicha(local) {
    localAtual = local;

    document.getElementById('establishmentName').textContent = local.nome;
    document.getElementById('establishmentCategory').textContent = nomeCategoria(local.categoria || 'todos');
    document.getElementById('establishmentDescription').textContent = local.descricao || local.endereco || '';
    document.getElementById('establishmentAddress').textContent = local.endereco ? ('Endereco: ' + local.endereco) : '';
    document.getElementById('establishmentHours').textContent = local.horario ? ('Horario: ' + local.horario) : '';
    document.getElementById('establishmentRating').textContent = local.rating ? ('Nota: ' + local.rating) : '';
    document.getElementById('establishmentPhone').textContent = '';
    document.getElementById('establishmentSite').textContent = '';
    document.getElementById('msg-cupom').hidden = true;

    if (local.place_id) {
        try {
            var detalhe = await detalhesDoLugar(local.place_id);

            if (detalhe.horario) {
                document.getElementById('establishmentHours').textContent = 'Horario: ' + detalhe.horario;
            }
            if (detalhe.telefone) {
                document.getElementById('establishmentPhone').textContent = 'Telefone: ' + detalhe.telefone;
            }
            if (detalhe.site) {
                document.getElementById('establishmentSite').innerHTML =
                    'Site: <a href="' + detalhe.site + '" target="_blank" rel="noopener">' + detalhe.site + '</a>';
            }
            if (detalhe.rating) {
                var textoNota = 'Nota: ' + detalhe.rating;
                if (detalhe.avaliacoes) {
                    textoNota += ' (' + detalhe.avaliacoes + ' avaliacoes)';
                }
                document.getElementById('establishmentRating').textContent = textoNota;
            }
            if (detalhe.lat && detalhe.lng) {
                local.lat = detalhe.lat;
                local.lng = detalhe.lng;
            }
        } catch (e) {
            console.log(e);
        }
    }

    if (local.lat && local.lng) {
        document.getElementById('routeButton').href =
            'https://www.google.com/maps/dir/?api=1&destination=' + local.lat + ',' + local.lng;
    }

    var beneficioBox = document.getElementById('benefit-area');
    if (local.beneficio_id && local.beneficio) {
        beneficioBox.hidden = false;
        document.getElementById('establishmentBenefit').textContent = local.beneficio;
        document.getElementById('establishmentBenefitRules').textContent = local.regras || '';
    } else {
        beneficioBox.hidden = true;
    }

    atualizarBotaoRoteiro();
    montarProximos(local);
    document.getElementById('establishment-details').scrollIntoView({ behavior: 'smooth' });
}

document.querySelector('.filters').onclick = function (e) {
    var botao = e.target.closest('.filter-button');
    if (!botao) return;

    filtroAtual = botao.getAttribute('data-categoria');

    var botoes = document.querySelectorAll('.filter-button');
    for (var i = 0; i < botoes.length; i++) {
        botoes[i].classList.remove('active');
    }
    botao.classList.add('active');

    montarMapa();
};

document.getElementById('btn-buscar').onclick = async function () {
    var texto = document.getElementById('campo-busca').value.trim();
    if (!texto) {
        alert('Digite algo pra buscar');
        return;
    }

    var vazio = document.getElementById('mapa-vazio');
    vazio.hidden = false;
    vazio.textContent = 'Buscando...';

    try {
        await prepararMapa();
        var lista = await buscarPorTexto(texto);
        listaMapaAtual = lista;
        vazio.hidden = true;
        colocarPins(lista);
        montarLista(lista);
    } catch (erro) {
        vazio.textContent = erro.message;
    }
};

document.getElementById('nav-cupons').onclick = function (e) {
    e.preventDefault();
    if (precisaLogin('cupons.html')) return;
    window.location.href = 'cupons.html';
};

document.getElementById('nav-cupons-mobile').onclick = function (e) {
    e.preventDefault();
    if (precisaLogin('cupons.html')) return;
    window.location.href = 'cupons.html';
};

document.getElementById('nav-roteiro').onclick = function (e) {
    e.preventDefault();
    if (precisaLogin('roteiro.html')) return;
    window.location.href = 'roteiro.html';
};

document.getElementById('nav-roteiro-mobile').onclick = function (e) {
    e.preventDefault();
    if (precisaLogin('roteiro.html')) return;
    window.location.href = 'roteiro.html';
};

document.getElementById('btn-add-roteiro').onclick = function () {
    if (precisaLogin('roteiro.html')) return;

    if (!localAtual) {
        alert('Abra um estabelecimento antes');
        return;
    }

    var ok = adicionarAoRoteiro(localAtual);
    if (ok) {
        colocarPins(listaMapaAtual.length ? listaMapaAtual : []);
        if (listaMapaAtual.length) {
            montarLista(listaMapaAtual);
        }
        atualizarBotaoRoteiro();
        montarProximos(localAtual);
        alert('Parada adicionada no mapa com numero e linha do caminho.');
    } else {
        alert('Esse local ja esta no roteiro');
    }
};

document.getElementById('btn-sair').onclick = async function () {
    await fazerLogout();
    window.location.href = 'index.html';
};

document.getElementById('btn-validar-comercio').onclick = function () {
    if (precisaLogin('cupons.html')) return;
    window.location.href = 'cupons.html';
};

document.getElementById('btn-gerar-cupom').onclick = async function () {
    if (precisaLogin('index.html')) return;

    if (!localAtual || !localAtual.beneficio_id) {
        alert('Esse local nao tem beneficio de parceiro.');
        return;
    }

    var parceiro = acharParceiro(localAtual) || localAtual;

    var cupom = await criarCupom({
        id: parceiro.id || localAtual.id,
        nome: localAtual.nome,
        beneficio_id: localAtual.beneficio_id || parceiro.beneficio_id,
        beneficio: localAtual.beneficio || parceiro.beneficio
    });

    if (!cupom) return;

    var msg = document.getElementById('msg-cupom');
    msg.hidden = false;
    msg.className = 'msg-info ok';
    msg.innerHTML = 'Cupom: <strong>' + cupom.codigo + '</strong><br><a href="cupons.html">Ver meus cupons</a>';
};

(async function () {
    var mapaPromise = prepararMapa().catch(function (e) {
        console.log(e);
        return null;
    });

    await pegarUsuarioSalvo();
    atualizarHeader();

    await Promise.all([
        carregarParceiros(),
        mapaPromise
    ]);

    await montarMapa();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(function (reg) {
            reg.update();
        });
    }
})();
