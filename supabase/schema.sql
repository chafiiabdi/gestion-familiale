-- Projet Supabase dédié à Gestion Familiale, PAS la base PMR / SIG
create table if not exists public.family_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.family_snapshots enable row level security;
create policy "Lire sa propre sauvegarde" on public.family_snapshots for select to authenticated using ((select auth.uid()) = user_id);
create policy "Créer sa propre sauvegarde" on public.family_snapshots for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Modifier sa propre sauvegarde" on public.family_snapshots for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update on public.family_snapshots to authenticated;
create or replace function public.update_family_snapshot_time()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger family_snapshot_update_time before update on public.family_snapshots
for each row execute function public.update_family_snapshot_time();
