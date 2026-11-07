# Rota Caruá

App de turismo inteligente para descobrir comércio, cultura e benefícios no Centro de Caruaru (entorno da Estação Ferroviária e do Armazém da Criatividade).

## Stack

- HTML, CSS, JavaScript
- Supabase (Auth + Postgres)
- PWA

## Estrutura

```
/
├── index.html
├── css/style.css
├── js/
│   ├── config.js
│   ├── auth.js
│   ├── estabelecimentos.js
│   ├── cupons.js
│   ├── mapa.js
│   └── app.js
├── supabase/
│   ├── schema.sql
│   └── seed.sql
├── icons/
├── manifest.json
└── sw.js
```

## Como rodar

1. Abra com Live Server (ou `npx serve .`)
2. Login de demo:

| Perfil    | E-mail             | Senha  |
|-----------|--------------------|--------|
| Visitante | usuario@gmail.com  | 123456 |
| Comércio  | adm@gmail.com      | 123456 |

## Fluxo da demo

1. Entrar como visitante
2. Filtrar **Comer**
3. Abrir um local e gerar cupom
4. Sair e entrar como comércio
5. Validar o código
6. Conferir em **Table Editor → cupons**

## Banco (Supabase)

1. Rodar `supabase/schema.sql`
2. Criar os usuários no Auth
3. Rodar `supabase/seed.sql`
4. Colocar URL + chave publishable/anon em `js/config.js`
5. Criar chave da **Maps JavaScript API** no Google Cloud e colar em `GOOGLE_MAPS_KEY` no `js/config.js`

Centro do mapa: Estação / Armazém da Criatividade (Caruaru). Os pins vêm dos `latitude`/`longitude` do Supabase.

## MVP

- Login
- Mapa com filtros
- Ficha do estabelecimento
- Cupom digital + validação no banco
- PWA

## Fora do escopo

Passaporte de visitas, AR, ranking, expansão para Feira / Alto do Moura / Polo.

## Eixo R.O.M.A.

Foco: **O — Oportunidades e comércio**

Romathon 2026
