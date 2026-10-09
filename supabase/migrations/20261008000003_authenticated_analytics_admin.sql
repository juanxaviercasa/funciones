-- Replace anonymous demand signals with authenticated analytics and one admin.
drop function if exists public.record_plan_interest(text, text, text);
drop function if exists public.get_plan_interest_counts();
drop table if exists public.product_interest_events;
drop table if exists public.waitlist_entries;

create table if not exists public.app_admin (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admin enable row level security;
revoke all on public.app_admin from anon, authenticated;

create table if not exists public.plan_interest (
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_slug text not null references public.subscription_plans(slug),
  click_count integer not null default 1 check (click_count between 1 and 1000000),
  waitlisted boolean not null default false,
  first_clicked_at timestamptz not null default now(),
  last_clicked_at timestamptz not null default now(),
  consented_at timestamptz,
  primary key(user_id, plan_slug)
);

alter table public.plan_interest enable row level security;
revoke all on public.plan_interest from anon, authenticated;

create table if not exists public.user_activity (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (
    event_type in ('page_view', 'page_time', 'button_click')
  ),
  page text not null check (
    char_length(page) between 1 and 80
    and page ~ '^[a-z0-9_/-]+$'
  ),
  target text not null default '' check (
    char_length(target) <= 80
    and target ~ '^[a-z0-9_/-]*$'
  ),
  duration_seconds integer not null default 0 check (
    duration_seconds between 0 and 300
  ),
  event_bucket bigint not null,
  created_at timestamptz not null default now(),
  unique(user_id, event_type, page, target, event_bucket)
);

create index if not exists user_activity_created_at_idx
  on public.user_activity(created_at desc);
create index if not exists user_activity_user_created_idx
  on public.user_activity(user_id, created_at desc);

alter table public.user_activity enable row level security;
revoke all on public.user_activity from anon, authenticated;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.app_admin
    where user_id = auth.uid() and singleton = true
  );
$$;

create or replace function public.record_plan_interest(
  p_plan_slug text,
  p_join_waitlist boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  result public.plan_interest;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.subscription_plans
    where slug = p_plan_slug and availability = 'coming_soon'
  ) then
    raise exception 'Plan is not accepting interest';
  end if;

  insert into public.plan_interest(
    user_id, plan_slug, waitlisted, consented_at
  ) values (
    current_user_id,
    p_plan_slug,
    p_join_waitlist,
    case when p_join_waitlist then now() else null end
  )
  on conflict (user_id, plan_slug) do update
    set click_count = least(public.plan_interest.click_count + 1, 1000000),
        waitlisted = public.plan_interest.waitlisted or excluded.waitlisted,
        consented_at = case
          when excluded.waitlisted then coalesce(public.plan_interest.consented_at, now())
          else public.plan_interest.consented_at
        end,
        last_clicked_at = now()
  returning * into result;

  return jsonb_build_object(
    'plan_slug', result.plan_slug,
    'click_count', result.click_count,
    'waitlisted', result.waitlisted
  );
end
$$;

create or replace function public.record_user_activity(
  p_event_type text,
  p_page text,
  p_target text default '',
  p_duration_seconds integer default 0
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  bucket bigint := floor(extract(epoch from now()) / 300)::bigint;
  safe_duration integer := greatest(0, least(coalesce(p_duration_seconds, 0), 300));
begin
  if current_user_id is null then
    return false;
  end if;
  if p_event_type not in ('page_view', 'page_time', 'button_click') then
    raise exception 'Invalid event type';
  end if;
  if p_page !~ '^[a-z0-9_/-]{1,80}$' then
    raise exception 'Invalid page';
  end if;
  if coalesce(p_target, '') !~ '^[a-z0-9_/-]{0,80}$' then
    raise exception 'Invalid target';
  end if;

  insert into public.user_activity(
    user_id, event_type, page, target, duration_seconds, event_bucket
  ) values (
    current_user_id,
    p_event_type,
    p_page,
    coalesce(p_target, ''),
    safe_duration,
    bucket
  )
  on conflict (user_id, event_type, page, target, event_bucket) do update
    set duration_seconds = case
      when excluded.event_type = 'page_time'
        then least(public.user_activity.duration_seconds + excluded.duration_seconds, 300)
      else public.user_activity.duration_seconds
    end;

  return true;
end
$$;

create or replace function public.get_admin_dashboard(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  cutoff timestamptz := now() - make_interval(days => greatest(1, least(p_days, 365)));
  result jsonb;
begin
  if not public.is_current_user_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'registered_users', (select count(*) from auth.users),
    'active_users', (
      select count(distinct user_id) from public.user_activity
      where created_at >= cutoff
    ),
    'page_views', (
      select count(*) from public.user_activity
      where event_type = 'page_view' and created_at >= cutoff
    ),
    'study_minutes', (
      select coalesce(round(sum(duration_seconds) / 60.0), 0)
      from public.user_activity
      where event_type = 'page_time' and created_at >= cutoff
    ),
    'pages', coalesce((
      select jsonb_agg(row_data order by views desc)
      from (
        select
          page,
          count(*) filter (where event_type = 'page_view') as views,
          count(distinct user_id) as users,
          coalesce(round(sum(duration_seconds) filter (
            where event_type = 'page_time'
          ) / 60.0), 0) as minutes
        from public.user_activity
        where created_at >= cutoff
        group by page
      ) row_data
    ), '[]'::jsonb),
    'actions', coalesce((
      select jsonb_agg(row_data order by clicks desc)
      from (
        select page, target, count(*) as clicks
        from public.user_activity
        where event_type = 'button_click'
          and created_at >= cutoff
        group by page, target
        order by clicks desc
        limit 50
      ) row_data
    ), '[]'::jsonb),
    'plans', coalesce((
      select jsonb_agg(row_data order by plan_slug)
      from (
        select
          plan_slug,
          sum(click_count) as clicks,
          count(*) filter (where waitlisted) as waitlist
        from public.plan_interest
        group by plan_slug
      ) row_data
    ), '[]'::jsonb),
    'users', coalesce((
      select jsonb_agg(row_data order by created_at desc)
      from (
        select
          users.id,
          users.email,
          users.created_at,
          users.last_sign_in_at,
          profiles.display_name,
          profiles.education_level,
          progress.updated_at as progress_updated_at,
          case
            when jsonb_typeof(progress.payload -> 'completed') = 'array'
              then jsonb_array_length(progress.payload -> 'completed')
            else 0
          end as lessons_completed,
          case
            when coalesce(progress.payload ->> 'xp', '') ~ '^[0-9]+$'
              then (progress.payload ->> 'xp')::integer
            else 0
          end as xp
        from auth.users users
        left join public.profiles profiles on profiles.user_id = users.id
        left join public.learning_progress progress on progress.user_id = users.id
        order by users.created_at desc
        limit 200
      ) row_data
    ), '[]'::jsonb),
    'waitlist', coalesce((
      select jsonb_agg(row_data order by consented_at desc)
      from (
        select
          interest.plan_slug,
          users.email,
          interest.consented_at
        from public.plan_interest interest
        join auth.users users on users.id = interest.user_id
        where interest.waitlisted
        order by interest.consented_at desc
        limit 200
      ) row_data
    ), '[]'::jsonb)
  ) into result;

  return result;
end
$$;

revoke all on function public.is_current_user_admin() from public;
revoke all on function public.record_plan_interest(text, boolean) from public;
revoke all on function public.record_user_activity(text, text, text, integer) from public;
revoke all on function public.get_admin_dashboard(integer) from public;
grant execute on function public.is_current_user_admin() to authenticated;
grant execute on function public.record_plan_interest(text, boolean) to authenticated;
grant execute on function public.record_user_activity(text, text, text, integer) to authenticated;
grant execute on function public.get_admin_dashboard(integer) to authenticated;
