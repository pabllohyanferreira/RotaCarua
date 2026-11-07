async function buscarLocais(categoria, soAcessivel) {
    var resp = await db.from('estabelecimentos').select('*, beneficios(*)').eq('ativo', true);

    if (resp.error || !resp.data) {
        alert('Erro ao carregar locais');
        return [];
    }

    var lista = [];

    for (var i = 0; i < resp.data.length; i++) {
        var item = resp.data[i];
        var benef = null;

        if (item.beneficios && item.beneficios.length > 0) {
            benef = item.beneficios[0];
        }

        lista.push({
            id: item.id,
            nome: item.nome,
            categoria: item.categoria,
            descricao: item.descricao,
            endereco: item.endereco,
            horario: item.horario,
            lat: item.latitude,
            lng: item.longitude,
            acessibilidade: item.acessibilidade || '',
            beneficio_id: benef ? benef.id : '',
            beneficio: benef ? benef.titulo : '',
            regras: benef ? benef.regras : ''
        });
    }

    var filtrados = [];

    for (var j = 0; j < lista.length; j++) {
        var ok = true;

        if (categoria !== 'todos' && lista[j].categoria !== categoria) {
            ok = false;
        }

        if (soAcessivel && lista[j].acessibilidade === '') {
            ok = false;
        }

        if (ok) {
            filtrados.push(lista[j]);
        }
    }

    return filtrados;
}

function nomeCategoria(cat) {
    if (cat === 'alimentacao') return 'Alimentacao';
    if (cat === 'artesanato') return 'Artesanato';
    if (cat === 'moda') return 'Moda';
    if (cat === 'servicos') return 'Servicos';
    if (cat === 'cultura') return 'Cultura';
    return cat;
}
