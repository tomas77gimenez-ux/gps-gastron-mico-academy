-- 1) Restrict app_settings reads to authenticated users
DROP POLICY IF EXISTS "app_settings readable by all" ON public.app_settings;
CREATE POLICY "app_settings readable by authenticated"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.app_settings FROM anon;

-- 3) Revoke execute from anon on privileged/admin functions
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_tools_access(uuid, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.grant_subscription(uuid, public.plan_tier, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.revoke_subscription(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_app_secret(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_app_secret(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_app_secret(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.app_secret_exists(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_tools_access(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_plan_access(uuid, public.plan_tier) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_lesson_video(uuid) FROM anon;
-- email queue helpers are only for server-side/cron use
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM anon;

-- 4) Pin search_path on functions that lack it
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;