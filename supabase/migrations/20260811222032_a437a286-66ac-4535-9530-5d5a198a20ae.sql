alter table public.lessons add column if not exists announced_at timestamptz;
alter table public.course_materials add column if not exists announced_at timestamptz;
alter table public.pro_recordings add column if not exists announced_at timestamptz;
alter table public.pro_cases add column if not exists announced_at timestamptz;

update public.lessons set announced_at = now() where announced_at is null;
update public.course_materials set announced_at = now() where announced_at is null;
update public.pro_recordings set announced_at = now() where announced_at is null;
update public.pro_cases set announced_at = now() where announced_at is null;

alter table public.profiles add column if not exists email_novedades boolean not null default true;
alter table public.profiles add column if not exists novedades_dismissed_at timestamptz;

create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.novedades_dispatch()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
begin
  perform net.http_post(
    url := 'https://project--d9ff2e26-e28e-4b16-b196-265bf1484244.lovable.app/api/public/novedades',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Lovable-Context', 'cron',
      'Authorization', 'Bearer ' || (
        select decrypted_secret from vault.decrypted_secrets where name = 'email_queue_service_role_key'
      )
    ),
    body := jsonb_build_object('mode', 'cron')
  );
end;
$function$;

revoke execute on function public.novedades_dispatch() from anon, authenticated;

select cron.unschedule('novedades-daily') where exists (select 1 from cron.job where jobname = 'novedades-daily');
select cron.schedule('novedades-daily', '0 14 * * *', $$select public.novedades_dispatch()$$);