-- User profiles plus privacy-conscious early demand signals for future plans.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  education_level text not null default '' check (
    education_level in ('', 'school', 'preuniversity', 'university', 'independent')
  ),
  learning_goal text not null default '' check (char_length(learning_goal) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Read own profile" on public.profiles;
drop policy if exists "Create own profile" on public.profiles;
drop policy if exists "Update own profile" on public.profiles;
create policy "Read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
revoke all on public.profiles from anon;
revoke delete on public.profiles from authenticated;
grant select, insert, update on public.profiles to authenticated;

create table if not exists public.subscription_plans (
  slug text primary key check (slug ~ '^[a-z][a-z0-9_-]{1,31}$'),
  name text not null,
  availability text not null check (availability in ('active', 'coming_soon', 'retired')),
  created_at timestamptz not null default now()
);

insert into public.subscription_plans(slug, name, availability) values
  ('free', 'Libre', 'active'),
  ('pro', 'Pro', 'coming_soon'),
  ('teacher', 'Docente', 'coming_soon')
on conflict (slug) do update
set name = excluded.name,
    availability = excluded.availability;

alter table public.subscription_plans enable row level security;
drop policy if exists "Read visible plans" on public.subscription_plans;
create policy "Read visible plans" on public.subscription_plans
  for select to anon, authenticated
  using (availability <> 'retired');
revoke all on public.subscription_plans from anon, authenticated;
grant select on public.subscription_plans to anon, authenticated;

create table if not exists public.product_interest_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  visitor_hash text not null check (char_length(visitor_hash) = 64),
  plan_slug text not null references public.subscription_plans(slug),
  event_type text not null check (event_type in ('click', 'waitlist')),
  event_day date not null default current_date,
  created_at timestamptz not null default now(),
  unique(visitor_hash, plan_slug, event_type, event_day)
);

create table if not exists public.waitlist_entries (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  plan_slug text not null references public.subscription_plans(slug),
  email text not null check (
    email = lower(email)
    and char_length(email) between 3 and 320
  ),
  consented_at timestamptz not null default now(),
  unique(plan_slug, email)
);

alter table public.product_interest_events enable row level security;
alter table public.waitlist_entries enable row level security;
revoke all on public.product_interest_events from anon, authenticated;
revoke all on public.waitlist_entries from anon, authenticated;

create or replace function public.record_plan_interest(
  p_plan_slug text,
  p_visitor_token text,
  p_email text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text;
  hashed_visitor text;
  click_count bigint;
  waitlist_count bigint;
begin
  if p_visitor_token !~ '^[A-Za-z0-9_-]{20,100}$' then
    raise exception 'Invalid visitor token';
  end if;

  if not exists (
    select 1 from public.subscription_plans
    where slug = p_plan_slug and availability = 'coming_soon'
  ) then
    raise exception 'Plan is not accepting interest';
  end if;

  hashed_visitor := encode(extensions.digest(p_visitor_token, 'sha256'), 'hex');

  insert into public.product_interest_events(
    user_id, visitor_hash, plan_slug, event_type
  ) values (
    auth.uid(), hashed_visitor, p_plan_slug, 'click'
  ) on conflict do nothing;

  if nullif(trim(p_email), '') is not null then
    normalized_email := lower(trim(p_email));
    if normalized_email !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
      raise exception 'Invalid email';
    end if;

    insert into public.waitlist_entries(user_id, plan_slug, email)
    values(auth.uid(), p_plan_slug, normalized_email)
    on conflict (plan_slug, email) do update
      set user_id = coalesce(excluded.user_id, public.waitlist_entries.user_id),
          consented_at = now();

    insert into public.product_interest_events(
      user_id, visitor_hash, plan_slug, event_type
    ) values (
      auth.uid(), hashed_visitor, p_plan_slug, 'waitlist'
    ) on conflict do nothing;
  end if;

  select count(*) into click_count
  from public.product_interest_events
  where plan_slug = p_plan_slug and event_type = 'click';

  select count(*) into waitlist_count
  from public.waitlist_entries
  where plan_slug = p_plan_slug;

  return jsonb_build_object(
    'plan_slug', p_plan_slug,
    'clicks', click_count,
    'waitlist', waitlist_count
  );
end
$$;

create or replace function public.get_plan_interest_counts()
returns table(plan_slug text, clicks bigint, waitlist bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    plans.slug,
    (
      select count(*)
      from public.product_interest_events events
      where events.plan_slug = plans.slug and events.event_type = 'click'
    ) as clicks,
    (
      select count(*)
      from public.waitlist_entries entries
      where entries.plan_slug = plans.slug
    ) as waitlist
  from public.subscription_plans plans
  where plans.availability <> 'retired'
  order by plans.slug;
$$;

revoke all on function public.record_plan_interest(text, text, text) from public;
revoke all on function public.get_plan_interest_counts() from public;
grant execute on function public.record_plan_interest(text, text, text) to anon, authenticated;
grant execute on function public.get_plan_interest_counts() to anon, authenticated;
