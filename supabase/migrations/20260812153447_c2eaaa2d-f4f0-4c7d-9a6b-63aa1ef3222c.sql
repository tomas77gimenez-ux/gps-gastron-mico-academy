DROP POLICY IF EXISTS "app_settings readable by authenticated" ON public.app_settings;
CREATE POLICY "app_settings readable by admins"
  ON public.app_settings FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

REVOKE EXECUTE ON FUNCTION public.admin_grant_gd(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_revoke_gd(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_access_flags() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_gd_entitlements() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_pro_access() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_elite_access(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_pro_access(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_elite_access(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_pro_access(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_gd_access(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_plan_access(uuid, public.plan_tier) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_tools_access(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.in_payment_grace(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.novedades_dispatch() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.admin_grant_gd(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revoke_gd(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_access_flags() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_gd_entitlements() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_pro_access() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_elite_access(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_pro_access(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_elite_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_pro_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_gd_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_plan_access(uuid, public.plan_tier) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_tools_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.in_payment_grace(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_app_secret(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.app_secret_exists(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_app_secret(text) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Service role can insert send log" ON public.email_send_log;
CREATE POLICY "Service role can insert send log" ON public.email_send_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can insert suppressed emails" ON public.suppressed_emails;
CREATE POLICY "Service role can insert suppressed emails" ON public.suppressed_emails
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can insert tokens" ON public.email_unsubscribe_tokens;
CREATE POLICY "Service role can insert tokens" ON public.email_unsubscribe_tokens
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

REVOKE ALL ON public.email_send_log FROM anon, authenticated;
REVOKE ALL ON public.email_send_state FROM anon, authenticated;
REVOKE ALL ON public.suppressed_emails FROM anon, authenticated;
REVOKE ALL ON public.email_unsubscribe_tokens FROM anon, authenticated;
GRANT ALL ON public.email_send_log TO service_role;
GRANT ALL ON public.email_send_state TO service_role;
GRANT ALL ON public.suppressed_emails TO service_role;
GRANT ALL ON public.email_unsubscribe_tokens TO service_role;