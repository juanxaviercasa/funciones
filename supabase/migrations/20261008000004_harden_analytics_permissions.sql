-- Reject anonymous calls before analytics functions execute.
revoke all on function public.is_current_user_admin() from anon;
revoke all on function public.record_plan_interest(text, boolean) from anon;
revoke all on function public.record_user_activity(text, text, text, integer) from anon;
revoke all on function public.get_admin_dashboard(integer) from anon;

grant execute on function public.is_current_user_admin() to authenticated;
grant execute on function public.record_plan_interest(text, boolean) to authenticated;
grant execute on function public.record_user_activity(text, text, text, integer) to authenticated;
grant execute on function public.get_admin_dashboard(integer) to authenticated;
