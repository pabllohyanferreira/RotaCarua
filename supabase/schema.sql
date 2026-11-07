create table if not exists public.perfis (
    id uuid primary key references auth.users(id) on delete cascade,
    nome text not null,
    tipo text not null,
    criado_em timestamptz default now()
);

create table if not exists public.estabelecimentos (
    id uuid primary key default gen_random_uuid(),
    nome text not null,
    categoria text not null,
    descricao text not null,
    endereco text not null,
    horario text not null,
    latitude numeric not null,
    longitude numeric not null,
    acessibilidade text,
    ativo boolean default true
);

create table if not exists public.beneficios (
    id uuid primary key default gen_random_uuid(),
    estabelecimento_id uuid references public.estabelecimentos(id) on delete cascade,
    titulo text not null,
    regras text not null,
    validade_ate date,
    ativo boolean default true
);

create table if not exists public.cupons (
    id uuid primary key default gen_random_uuid(),
    codigo text unique not null,
    usuario_id uuid references auth.users(id) on delete cascade,
    beneficio_id uuid references public.beneficios(id) on delete cascade,
    estabelecimento_id uuid references public.estabelecimentos(id) on delete cascade,
    status text default 'gerado',
    criado_em timestamptz default now(),
    validado_em timestamptz,
    validado_por uuid references auth.users(id)
);

-- quando cria usuario no auth, cria o perfil tambem
create or replace function public.ao_criar_usuario()
returns trigger as $$
begin
    insert into public.perfis (id, nome, tipo)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'nome', 'Usuario'),
        coalesce(new.raw_user_meta_data->>'tipo', 'visitante')
    );
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_ao_criar_usuario on auth.users;
create trigger trg_ao_criar_usuario
after insert on auth.users
for each row execute function public.ao_criar_usuario();

alter table public.perfis enable row level security;
alter table public.estabelecimentos enable row level security;
alter table public.beneficios enable row level security;
alter table public.cupons enable row level security;

create policy "ver proprio perfil" on public.perfis
for select using (auth.uid() = id);

create policy "ver locais" on public.estabelecimentos
for select using (ativo = true);

create policy "ver beneficios" on public.beneficios
for select using (ativo = true);

create policy "ver cupons" on public.cupons
for select using (true);

create policy "criar cupom" on public.cupons
for insert with check (auth.uid() = usuario_id);

create policy "atualizar cupom" on public.cupons
for update using (true);
