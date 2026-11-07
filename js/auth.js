var usuario = null;

async function fazerLogin(email, senha) {
    email = email.trim().toLowerCase();

    var resp = await db.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (resp.error) {
        alert('Login falhou: ' + resp.error.message);
        return false;
    }

    var perfil = await db.from('perfis').select('*').eq('id', resp.data.user.id).single();

    if (perfil.error || !perfil.data) {
        alert('Usuario sem perfil na tabela perfis');
        await db.auth.signOut();
        return false;
    }

    usuario = {
        id: resp.data.user.id,
        email: resp.data.user.email,
        nome: perfil.data.nome,
        tipo: perfil.data.tipo
    };

    return true;
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
    var perfil = await db.from('perfis').select('*').eq('id', u.id).single();

    if (perfil.error || !perfil.data) {
        return null;
    }

    usuario = {
        id: u.id,
        email: u.email,
        nome: perfil.data.nome,
        tipo: perfil.data.tipo
    };

    return usuario;
}
