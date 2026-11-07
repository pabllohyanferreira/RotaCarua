function codigoAleatorio() {
    return 'RC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function criarCupom(local) {
    if (!local.beneficio_id) {
        alert('Esse local nao tem beneficio agora.');
        return null;
    }

    var codigo = codigoAleatorio();

    var resp = await db.from('cupons').insert({
        codigo: codigo,
        usuario_id: usuario.id,
        beneficio_id: local.beneficio_id,
        estabelecimento_id: local.id,
        status: 'gerado'
    }).select().single();

    if (resp.error) {
        alert('Erro ao salvar cupom');
        return null;
    }

    return {
        codigo: resp.data.codigo,
        status: resp.data.status,
        local_nome: local.nome,
        beneficio: local.beneficio,
        data: resp.data.criado_em
    };
}

async function meusCupons() {
    var resp = await db
        .from('cupons')
        .select('*, estabelecimentos(nome), beneficios(titulo)')
        .eq('usuario_id', usuario.id);

    if (resp.error || !resp.data) {
        return [];
    }

    var saida = [];

    for (var i = 0; i < resp.data.length; i++) {
        var c = resp.data[i];
        saida.push({
            codigo: c.codigo,
            status: c.status,
            local_nome: c.estabelecimentos ? c.estabelecimentos.nome : '',
            beneficio: c.beneficios ? c.beneficios.titulo : '',
            data: c.criado_em
        });
    }

    return saida;
}

async function validarCupom(codigo) {
    codigo = codigo.trim().toUpperCase();

    var busca = await db
        .from('cupons')
        .select('*, estabelecimentos(nome), beneficios(titulo)')
        .eq('codigo', codigo)
        .single();

    if (busca.error || !busca.data) {
        alert('Cupom nao encontrado');
        return null;
    }

    if (busca.data.status === 'usado') {
        alert('Cupom ja foi usado');
        return null;
    }

    var upd = await db.from('cupons').update({
        status: 'usado',
        validado_em: new Date().toISOString(),
        validado_por: usuario.id
    }).eq('id', busca.data.id).select('*, estabelecimentos(nome), beneficios(titulo)').single();

    if (upd.error) {
        alert('Erro ao validar cupom');
        return null;
    }

    return {
        codigo: upd.data.codigo,
        status: upd.data.status,
        local_nome: upd.data.estabelecimentos ? upd.data.estabelecimentos.nome : '',
        beneficio: upd.data.beneficios ? upd.data.beneficios.titulo : '',
        validado_em: upd.data.validado_em
    };
}
