# Rota Caruá

App de descoberta do Centro de Caruaru (entorno da Estação Ferroviária e do Armazém / Pátio).

## Telas do MVP (regulamento)

1. **Login** (`login.html`) — autenticação  
2. **Explorar** (`index.html`) — mapa, filtros, lista e ficha  
3. **Cupons** (`cupons.html`) — listar cupons + validar (comércio)  
4. **Meu roteiro** (`roteiro.html`) — locais salvos + abrir no Maps

Layout mobile com menu inferior (Explorar / Roteiro / Cupons).

Cadastro: `cadastro.html`

## Area do mapa

Busca limitada ao polígono do Centro (Estação, ACIC, Pátio Luiz Gonzaga).  
O Places usa círculo na API e depois filtra os pontos dentro do polígono (`js/area.js`).

## Stack

- HTML / CSS / JS
- Supabase (login, parceiros, cupons)
- Google Maps + Places API (New) — chave em `js/config.js`

## Como rodar

1. Live Server  
2. Demo:
   - `usuario@gmail.com` / `123456` (visitante)
   - `adm@gmail.com` / `123456` (comercio)

## Piloto vs evolucao (doc de requisitos)

| ID | Status |
|----|--------|
| RF01 Login/cadastro | OK |
| RF02 Menu | Parcial (header) |
| RF03 Mapa + filtros | OK |
| RF04 Ficha | OK (foto depois) |
| RF05 Rota | OK |
| RF06 Resgate cupom | OK |
| RF07 Validar cupom | OK |
| RF08 Parceiros/beneficios | OK (seed) |
| RF09 Relatorio | Evolucao |
| RF10 Passaporte | Evolucao |

## Arquivos principais

`js/config.js` · `auth.js` · `area.js` · `places.js` · `mapa.js` · `estabelecimentos.js` · `cupons.js` · `app.js`
