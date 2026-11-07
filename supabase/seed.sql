insert into public.estabelecimentos
(id, nome, categoria, descricao, endereco, horario, latitude, longitude, acessibilidade)
values
('11111111-1111-1111-1111-111111111101', 'Cafe da Estacao', 'alimentacao', 'Cafe e lanches perto da Estacao.', 'Perto da Estacao, Centro - Caruaru', 'Seg a Sab 8h-18h', -8.2845, -35.9698, 'Entrada sem degrau'),
('11111111-1111-1111-1111-111111111102', 'Atelie Barro e Cordel', 'artesanato', 'Artesanato perto do Armazem.', 'Perto do Armazem, Centro - Caruaru', 'Ter a Dom 9h-17h', -8.2839, -35.9704, 'Tem degrau na entrada'),
('11111111-1111-1111-1111-111111111103', 'Moda Rua Nova', 'moda', 'Roupas da producao local.', 'Rua do Comercio, Centro - Caruaru', 'Seg a Sab 9h-19h', -8.2851, -35.9712, null),
('11111111-1111-1111-1111-111111111104', 'Espaco Criativo do Armazem', 'cultura', 'Programacao cultural.', 'Armazem da Criatividade - Caruaru', 'Conforme programacao', -8.2832, -35.9692, 'Areas amplas'),
('11111111-1111-1111-1111-111111111105', 'Consertos Rapidos Centro', 'servicos', 'Consertos e chaveiro.', 'Travessa perto da Estacao - Caruaru', 'Seg a Sex 8h-17h', -8.2848, -35.9709, null),
('11111111-1111-1111-1111-111111111106', 'Tapiocaria do Patio', 'alimentacao', 'Tapiocas e sucos.', 'Patio da Estacao - Caruaru', 'Todos os dias 7h-15h', -8.2842, -35.9695, 'Mesas externas')
on conflict (id) do nothing;

insert into public.beneficios
(id, estabelecimento_id, titulo, regras, validade_ate, ativo)
values
('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', '10% no cafe da manha', 'Valido ate 11h. 1 por pessoa.', current_date + 60, true),
('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'Cordel de brinde acima de R$40', 'Sujeito a estoque.', current_date + 60, true),
('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', '5% off em pecas selecionadas', 'Nao vale com outras promocoes.', current_date + 45, true),
('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', 'Prioridade em oficina aberta', 'Depende da agenda.', current_date + 90, true),
('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111106', 'Suco gratis na compra de 2 tapiocas', '1 resgate por cupom.', current_date + 60, true)
on conflict (id) do nothing;
