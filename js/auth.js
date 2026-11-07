var usuario = null;

function mensagemErroAuth(erro) {
    var msg = (erro && erro.message) ? erro.message : 'Erro desconhecido';
    var baixa = msg.toLowerCase();

    if (baixa.indexOf('email not confirmed') !== -1) {
        return 'Seu e-mail ainda nao foi confirmado. No Supabase, desative Confirm email em Authentication > Providers > Email.';
    }
    if (baixa.indexOf('invalid login') !== -1 || baixa.indexOf('invalid credentials') !== -1) {
        return 'E-mail ou senha incorretos.';
    }
    if (baixa.indexOf('user already registered') !== -1) {
        return 'Esse e-mail ja tem conta. Tente entrar.';
    }

    return msg;
}

async function garantirPerfil(user) {
    var busca = await db.from('perfis').select('*').eq('id', user.id).single();

    if (busca.data) {
        return busca.data;
    }

    var meta = user.user_metadata || {};
    var novo = {
        id: user.id,
        nome: meta.nome || (user.email ? user.email.split('@')[0] : 'Usuario'),
        tipo: meta.tipo || 'visitante'
    };

    var insert = await db.from('perfis').insert(novo).select().single();

    if (insert.error) {
        console.log('perfil', insert.error);
        return null;
    }

    return insert.data;
}

async function fazerLogin(email, senha) {
    email = email.trim().toLowerCase();

    var resp = await db.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (resp.error) {
        alert('Login falhou: ' + mensagemErroAuth(resp.error));
        return false;
    }

    var perfil = await garantirPerfil(resp.data.user);

    if (!perfil) {
        alert('Login ok, mas nao deu pra criar/ler o perfil. Confira a tabela perfis e as politicas RLS.');
        await db.auth.signOut();
        return false;
    }

    usuario = {
        id: resp.data.user.id,
        email: resp.data.user.email,
        nome: perfil.nome,
        tipo: perfil.tipo
    };

    return true;
}

async function fazerCadastro(nome, email, senha) {
    email = email.trim().toLowerCase();
    nome = (nome || '').trim();

    var resp = await db.auth.signUp({
        email: email,
        password: senha,
        options: {
            data: {
                nome: nome,
                tipo: 'visitante'
            }
        }
    });

    if (resp.error) {
        alert('Cadastro falhou: ' + mensagemErroAuth(resp.error));
        return false;
    }

    if (resp.data.user && resp.data.session) {
        await garantirPerfil(resp.data.user);
        return await fazerLogin(email, senha);
    }

    if (resp.data.user && !resp.data.session) {
        alert('Conta criada, mas o Supabase pediu confirmacao de e-mail. Desative Confirm email em Authentication > Providers > Email e tente entrar de novo.');
        return false;
    }

    alert('Conta criada. Agora faca login.');
    return false;
}

async function fazerLogout() {
    await db.auth.signOut();
    usuario = null;
}

async function pegarUsuarioSalvo() {
    var sessao = await db.auth.getSession();
    if (!sessao.data.session) {
        return null;
    }

    var u = sessao.data.session.user;
    var perfil = await garantirPerfil(u);

    if (!perfil) {
        return null;
    }

    usuario = {
        id: u.id,
        email: u.email,
        nome: perfil.nome,
        tipo: perfil.tipo
    };

    return usuario;
}
