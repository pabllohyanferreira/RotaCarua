var CHAVE_IDIOMA = 'rota_carua_idioma';
var idiomaAtual = (function () {
    try {
        var salvo = localStorage.getItem('rota_carua_idioma');
        if (salvo === 'en' || salvo === 'es' || salvo === 'pt') return salvo;
    } catch (e) {}
    return 'pt';
})();

var TRADUCOES = {
    pt: {
        nav_explorar: 'Explorar',
        nav_eventos: 'Eventos',
        nav_roteiro: 'Meu roteiro',
        nav_roteiro_curto: 'Roteiro',
        nav_cupons: 'Cupons',
        btn_entrar: 'Entrar',
        btn_sair: 'Sair',
        btn_validar: 'Validar cupom',
        idioma: 'Idioma',
        hero_tag: 'DESCUBRA O CENTRO DE CARUARU',
        hero_titulo: 'Diversas lojas e promoções aguardando por você!',
        hero_texto: 'Explore os melhores estabelecimentos e descubra novas experiências pelo coração de Caruaru.',
        hero_cta: 'Começar a explorar',
        filtro_todos: 'Todos',
        filtro_alimentacao: 'Alimentação',
        filtro_artesanato: 'Artesanato',
        filtro_moda: 'Moda',
        filtro_servicos: 'Serviços',
        filtro_cultura: 'Cultura',
        busca_placeholder: 'Buscar lugar (ex: Faculdade Nova Roma Caruaru)',
        busca_botao: 'Buscar',
        mapa_carregando: 'Carregando mapa...',
        loc_aguardando: 'Localizacao: aguardando...',
        estabelecimentos: 'Estabelecimentos',
        estabelecimentos_vazio: 'Os estabelecimentos aparecerão aqui.',
        ficha_titulo: 'Detalhes do estabelecimento',
        ficha_dica: 'Selecione um estabelecimento para visualizar suas informações.',
        beneficio_titulo: 'Benefício disponível',
        beneficio_botao: 'Resgatar benefício',
        como_chegar: 'Como chegar',
        add_roteiro: 'Adicionar ao roteiro',
        proximos_titulo: 'Perto daqui',
        proximos_texto: 'Sugestoes por distancia pra continuar o passeio.',
        legenda_mapa: 'No mapa: circulo = local · pin laranja numerado = parada do roteiro · linha = caminho sugerido · ponto azul = voce',
        footer_texto: 'Explore, descubra e valorize tudo que Caruaru tem a oferecer.',
        footer_copy: '© 2026 ROTA CARUÁ. Todos os direitos reservados.',
        footer_feito: 'Feito para valorizar Caruaru.',
        eventos_tag: 'AGENDA DA CIDADE',
        eventos_titulo: 'Eventos fixos de Caruaru',
        eventos_intro: 'Datas tradicionais da cidade. Use o roteiro do Centro para aproveitar o comércio e a cultura na época de cada festa.',
        eventos_periodo: 'Quando',
        eventos_local: 'Onde',
        cupons_tag: 'SEUS BENEFICIOS',
        cupons_titulo: 'Meus cupons',
        cupons_intro: 'Cupons gerados no app. Mostre o codigo no comercio parceiro.',
        validar_tag: 'COMERCIO',
        validar_titulo: 'Validar cupom',
        validar_intro: 'Digite o codigo que o cliente apresentar.',
        validar_label: 'Codigo do cupom',
        validar_botao: 'Validar e registrar',
        roteiro_tag: 'SEU PASSEIO',
        roteiro_titulo: 'Meu roteiro',
        roteiro_intro: 'Escolha a ordem no seletor de cada local. Essa ordem aparece numerada no mapa de Explorar.',
        roteiro_vazio: 'Seu roteiro ainda esta vazio. Va em Explorar, abra um local e clique em Adicionar ao roteiro.',
        ver_mapa: 'Ver no mapa',
        login_tag: 'BEM-VINDO DE VOLTA',
        login_titulo: 'Entre na sua conta',
        login_intro: 'Acesse sua conta para montar roteiros e aproveitar benefícios.',
        cadastro_tag: 'FAÇA PARTE DO ROTA CARUÁ',
        cadastro_titulo: 'Crie sua conta',
        cadastro_intro: 'Cadastre-se para descobrir estabelecimentos, montar roteiros e aproveitar benefícios.',
        ev1_nome: 'São João de Caruaru',
        ev1_periodo: 'Final de maio e junho (festa junina)',
        ev1_local: 'Centro e áreas de festa da cidade',
        ev1_texto: 'A maior referência junina de Caruaru: forró, comidas típicas, fogueiras e movimento forte no comércio do Centro.',
        ev2_nome: 'Sucata',
        ev2_periodo: 'Período de Carnaval',
        ev2_local: 'Ruas e blocos tradicionais de Caruaru',
        ev2_texto: 'Festa popular carnavalesca da cidade, com blocos, música e muita gente nas ruas — boa época para circular pelo Centro.',
        ev3_nome: 'Dia das Crianças',
        ev3_periodo: 'Outubro (12 de outubro e entorno)',
        ev3_local: 'Praças, comércios e ações no Centro',
        ev3_texto: 'Programação voltada às famílias: brincadeiras, promoções e movimento no comércio, ideal para passear com crianças.',
        ev4_nome: 'Semana Santa',
        ev4_periodo: 'Março ou abril (calendário móvel)',
        ev4_local: 'Igrejas e Centro histórico',
        ev4_texto: 'Celebrações religiosas, procissões e turismo de fé. O Centro ganha visitação especial nesses dias.'
    },
    en: {
        nav_explorar: 'Explore',
        nav_eventos: 'Events',
        nav_roteiro: 'My itinerary',
        nav_roteiro_curto: 'Route',
        nav_cupons: 'Coupons',
        btn_entrar: 'Sign in',
        btn_sair: 'Sign out',
        btn_validar: 'Validate coupon',
        idioma: 'Language',
        hero_tag: 'DISCOVER DOWNTOWN CARUARU',
        hero_titulo: 'Shops and deals waiting for you!',
        hero_texto: 'Explore the best places and discover new experiences in the heart of Caruaru.',
        hero_cta: 'Start exploring',
        filtro_todos: 'All',
        filtro_alimentacao: 'Food',
        filtro_artesanato: 'Crafts',
        filtro_moda: 'Fashion',
        filtro_servicos: 'Services',
        filtro_cultura: 'Culture',
        busca_placeholder: 'Search a place (e.g. Faculdade Nova Roma Caruaru)',
        busca_botao: 'Search',
        mapa_carregando: 'Loading map...',
        loc_aguardando: 'Location: waiting...',
        estabelecimentos: 'Places',
        estabelecimentos_vazio: 'Places will appear here.',
        ficha_titulo: 'Place details',
        ficha_dica: 'Select a place to see its information.',
        beneficio_titulo: 'Available benefit',
        beneficio_botao: 'Redeem benefit',
        como_chegar: 'Get directions',
        add_roteiro: 'Add to itinerary',
        proximos_titulo: 'Nearby',
        proximos_texto: 'Suggestions by distance to continue your walk.',
        legenda_mapa: 'On the map: circle = place · numbered orange pin = stop · line = route · blue = you',
        footer_texto: 'Explore, discover and value everything Caruaru has to offer.',
        footer_copy: '© 2026 ROTA CARUÁ. All rights reserved.',
        footer_feito: 'Made to value Caruaru.',
        eventos_tag: 'CITY CALENDAR',
        eventos_titulo: 'Fixed events in Caruaru',
        eventos_intro: 'Traditional city dates. Use the downtown itinerary to enjoy shops and culture during each celebration.',
        eventos_periodo: 'When',
        eventos_local: 'Where',
        cupons_tag: 'YOUR BENEFITS',
        cupons_titulo: 'My coupons',
        cupons_intro: 'Coupons created in the app. Show the code at partner shops.',
        validar_tag: 'BUSINESS',
        validar_titulo: 'Validate coupon',
        validar_intro: 'Enter the code shown by the customer.',
        validar_label: 'Coupon code',
        validar_botao: 'Validate and save',
        roteiro_tag: 'YOUR WALK',
        roteiro_titulo: 'My itinerary',
        roteiro_intro: 'Choose the order with each place selector. That order appears numbered on the Explore map.',
        roteiro_vazio: 'Your itinerary is empty. Go to Explore, open a place and tap Add to itinerary.',
        ver_mapa: 'See on map',
        login_tag: 'WELCOME BACK',
        login_titulo: 'Sign in to your account',
        login_intro: 'Sign in to build itineraries and enjoy benefits.',
        cadastro_tag: 'JOIN ROTA CARUÁ',
        cadastro_titulo: 'Create your account',
        cadastro_intro: 'Sign up to discover places, build itineraries and enjoy benefits.',
        ev1_nome: 'São João in Caruaru',
        ev1_periodo: 'Late May and June (June festival)',
        ev1_local: 'Downtown and festival areas',
        ev1_texto: 'Caruaru’s biggest June celebration: forró, traditional food, bonfires and busy downtown shops.',
        ev2_nome: 'Sucata',
        ev2_periodo: 'Carnival season',
        ev2_local: 'Streets and traditional street parties',
        ev2_texto: 'A popular Carnival celebration with blocks, music and crowded streets — a great time to walk downtown.',
        ev3_nome: 'Children’s Day',
        ev3_periodo: 'October (around Oct 12)',
        ev3_local: 'Squares, shops and downtown activities',
        ev3_texto: 'Family-friendly program: play, promotions and busy shops — perfect for a walk with kids.',
        ev4_nome: 'Holy Week',
        ev4_periodo: 'March or April (movable date)',
        ev4_local: 'Churches and historic downtown',
        ev4_texto: 'Religious celebrations, processions and faith tourism. Downtown sees special visits these days.'
    },
    es: {
        nav_explorar: 'Explorar',
        nav_eventos: 'Eventos',
        nav_roteiro: 'Mi itinerario',
        nav_roteiro_curto: 'Ruta',
        nav_cupons: 'Cupones',
        btn_entrar: 'Entrar',
        btn_sair: 'Salir',
        btn_validar: 'Validar cupón',
        idioma: 'Idioma',
        hero_tag: 'DESCUBRE EL CENTRO DE CARUARU',
        hero_titulo: '¡Tiendas y promociones esperándote!',
        hero_texto: 'Explora los mejores lugares y descubre nuevas experiencias en el corazón de Caruaru.',
        hero_cta: 'Empezar a explorar',
        filtro_todos: 'Todos',
        filtro_alimentacao: 'Comida',
        filtro_artesanato: 'Artesanía',
        filtro_moda: 'Moda',
        filtro_servicos: 'Servicios',
        filtro_cultura: 'Cultura',
        busca_placeholder: 'Buscar lugar (ej: Faculdade Nova Roma Caruaru)',
        busca_botao: 'Buscar',
        mapa_carregando: 'Cargando mapa...',
        loc_aguardando: 'Ubicación: esperando...',
        estabelecimentos: 'Establecimientos',
        estabelecimentos_vazio: 'Los establecimientos aparecerán aquí.',
        ficha_titulo: 'Detalles del establecimiento',
        ficha_dica: 'Selecciona un lugar para ver su información.',
        beneficio_titulo: 'Beneficio disponible',
        beneficio_botao: 'Canjear beneficio',
        como_chegar: 'Cómo llegar',
        add_roteiro: 'Añadir al itinerario',
        proximos_titulo: 'Cerca de aquí',
        proximos_texto: 'Sugerencias por distancia para seguir el paseo.',
        legenda_mapa: 'En el mapa: círculo = lugar · pin naranja numerado = parada · línea = ruta · azul = tú',
        footer_texto: 'Explora, descubre y valora todo lo que Caruaru tiene para ofrecer.',
        footer_copy: '© 2026 ROTA CARUÁ. Todos los derechos reservados.',
        footer_feito: 'Hecho para valorar Caruaru.',
        eventos_tag: 'AGENDA DE LA CIUDAD',
        eventos_titulo: 'Eventos fijos de Caruaru',
        eventos_intro: 'Fechas tradicionales de la ciudad. Usa el itinerario del Centro para disfrutar del comercio y la cultura en cada fiesta.',
        eventos_periodo: 'Cuándo',
        eventos_local: 'Dónde',
        cupons_tag: 'TUS BENEFICIOS',
        cupons_titulo: 'Mis cupones',
        cupons_intro: 'Cupones generados en la app. Muestra el código en el comercio asociado.',
        validar_tag: 'COMERCIO',
        validar_titulo: 'Validar cupón',
        validar_intro: 'Escribe el código que presente el cliente.',
        validar_label: 'Código del cupón',
        validar_botao: 'Validar y registrar',
        roteiro_tag: 'TU PASEO',
        roteiro_titulo: 'Mi itinerario',
        roteiro_intro: 'Elige el orden en el selector de cada lugar. Ese orden aparece numerado en el mapa de Explorar.',
        roteiro_vazio: 'Tu itinerario está vacío. Ve a Explorar, abre un lugar y toca Añadir al itinerario.',
        ver_mapa: 'Ver en el mapa',
        login_tag: 'BIENVENIDO DE NUEVO',
        login_titulo: 'Entra en tu cuenta',
        login_intro: 'Accede para montar itinerarios y aprovechar beneficios.',
        cadastro_tag: 'FORMA PARTE DE ROTA CARUÁ',
        cadastro_titulo: 'Crea tu cuenta',
        cadastro_intro: 'Regístrate para descubrir lugares, montar itinerarios y aprovechar beneficios.',
        ev1_nome: 'São João de Caruaru',
        ev1_periodo: 'Final de mayo y junio (fiesta junina)',
        ev1_local: 'Centro y áreas de fiesta',
        ev1_texto: 'La mayor referencia junina de Caruaru: forró, comida típica, hogueras y mucho movimiento en el Centro.',
        ev2_nome: 'Sucata',
        ev2_periodo: 'Época de Carnaval',
        ev2_local: 'Calles y bloques tradicionales',
        ev2_texto: 'Fiesta popular de carnaval con bloques, música y mucha gente en las calles — buena época para recorrer el Centro.',
        ev3_nome: 'Día de los Niños',
        ev3_periodo: 'Octubre (alrededor del 12)',
        ev3_local: 'Plazas, comercios y acciones en el Centro',
        ev3_texto: 'Programación para familias: juegos, promociones y movimiento comercial, ideal para pasear con niños.',
        ev4_nome: 'Semana Santa',
        ev4_periodo: 'Marzo o abril (fecha móvil)',
        ev4_local: 'Iglesias y Centro histórico',
        ev4_texto: 'Celebraciones religiosas, procesiones y turismo de fe. El Centro recibe visitas especiales esos días.'
    }
};

var EVENTOS_FIXOS = [
    { id: 'sao-joao', nome: 'ev1_nome', periodo: 'ev1_periodo', local: 'ev1_local', texto: 'ev1_texto' },
    { id: 'sucata', nome: 'ev2_nome', periodo: 'ev2_periodo', local: 'ev2_local', texto: 'ev2_texto' },
    { id: 'dia-criancas', nome: 'ev3_nome', periodo: 'ev3_periodo', local: 'ev3_local', texto: 'ev3_texto' },
    { id: 'semana-santa', nome: 'ev4_nome', periodo: 'ev4_periodo', local: 'ev4_local', texto: 'ev4_texto' }
];

function t(chave) {
    var pacote = TRADUCOES[idiomaAtual] || TRADUCOES.pt;
    if (pacote[chave] != null) return pacote[chave];
    if (TRADUCOES.pt[chave] != null) return TRADUCOES.pt[chave];
    return chave;
}

function lerIdioma() {
    var salvo = localStorage.getItem(CHAVE_IDIOMA);
    if (salvo === 'en' || salvo === 'es' || salvo === 'pt') return salvo;
    return 'pt';
}

function salvarIdioma(codigo) {
    localStorage.setItem(CHAVE_IDIOMA, codigo);
}

function aplicarIdioma(codigo) {
    if (codigo !== 'pt' && codigo !== 'en' && codigo !== 'es') {
        codigo = 'pt';
    }

    idiomaAtual = codigo;
    salvarIdioma(codigo);
    document.documentElement.lang = codigo === 'pt' ? 'pt-BR' : codigo;

    var nos = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nos.length; i++) {
        nos[i].textContent = t(nos[i].getAttribute('data-i18n'));
    }

    var ph = document.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < ph.length; j++) {
        ph[j].setAttribute('placeholder', t(ph[j].getAttribute('data-i18n-placeholder')));
    }

    var aria = document.querySelectorAll('[data-i18n-aria]');
    for (var k = 0; k < aria.length; k++) {
        aria[k].setAttribute('aria-label', t(aria[k].getAttribute('data-i18n-aria')));
    }

    var botoes = document.querySelectorAll('.btn-lang');
    for (var b = 0; b < botoes.length; b++) {
        var ativo = botoes[b].getAttribute('data-lang') === codigo;
        botoes[b].classList.toggle('active', ativo);
        botoes[b].setAttribute('aria-pressed', ativo ? 'true' : 'false');
    }

    if (typeof window.onIdiomaTrocado === 'function') {
        window.onIdiomaTrocado();
    }
}

function montarSeletorIdioma() {
    var caixa = document.querySelector('.seletor-idioma');
    if (!caixa) return;

    caixa.onclick = function (e) {
        var botao = e.target.closest('.btn-lang');
        if (!botao) return;
        aplicarIdioma(botao.getAttribute('data-lang'));
    };
}

function iniciarI18n() {
    montarSeletorIdioma();
    aplicarIdioma(lerIdioma());
}

document.addEventListener('DOMContentLoaded', iniciarI18n);
