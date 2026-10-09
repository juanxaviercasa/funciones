-- Run once in the Supabase SQL editor. Clients never receive a service-role key.
create table if not exists public.learning_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 1048576),
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.learning_progress enable row level security;
drop policy if exists "Read own progress" on public.learning_progress;
create policy "Read own progress" on public.learning_progress for select to authenticated using ((select auth.uid()) = user_id);
revoke select, insert, update, delete on public.learning_progress from anon;
revoke insert, update, delete on public.learning_progress from authenticated;
grant select on public.learning_progress to authenticated;
create or replace function public.save_learning_progress(expected_revision bigint, new_payload jsonb)
returns boolean language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if expected_revision = 0 then
    insert into public.learning_progress(user_id,payload) values(auth.uid(),new_payload) on conflict do nothing;
  else
    update public.learning_progress set payload=new_payload,revision=revision+1,updated_at=now()
      where user_id=auth.uid() and revision=expected_revision;
  end if;
  get diagnostics changed = row_count;
  return changed = 1;
end $$;
revoke all on function public.save_learning_progress(bigint,jsonb) from public, anon;
grant execute on function public.save_learning_progress(bigint,jsonb) to authenticated;
