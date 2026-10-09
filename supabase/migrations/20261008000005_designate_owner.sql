-- The owner explicitly designated this verified email as the sole administrator.
create or replace function public.assign_verified_owner()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if lower(new.email) = 'cabellosalirrosas@gmail.com' and new.email_confirmed_at is not null then
    insert into public.app_admin(user_id) values(new.id)
    on conflict(singleton) do update set user_id = excluded.user_id;
  end if;
  return new;
end;
$$;
revoke all on function public.assign_verified_owner() from public, anon, authenticated;
drop trigger if exists assign_verified_owner on auth.users;
create trigger assign_verified_owner after insert or update of email_confirmed_at, email on auth.users
for each row execute function public.assign_verified_owner();
insert into public.app_admin(user_id)
select id from auth.users where lower(email) = 'cabellosalirrosas@gmail.com' and email_confirmed_at is not null
on conflict(singleton) do update set user_id = excluded.user_id;
