drop policy if exists "criar proprio perfil" on public.perfis;
create policy "criar proprio perfil"
on public.perfis for insert
with check (auth.uid() = id);

drop policy if exists "atualizar proprio perfil" on public.perfis;
create policy "atualizar proprio perfil"
on public.perfis for update
using (auth.uid() = id);
