-- RLS already hides all rows from anonymous clients. Remove table access too.
revoke select, insert, update, delete on public.learning_progress from anon;
