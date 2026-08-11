-- Public (anon) read access for catalog tables (policies already restrict to published)
GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.lessons TO anon;

-- Authenticated app tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_materials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;

-- Tools data (all policies scope to auth.uid())
GRANT SELECT, INSERT, UPDATE, DELETE ON public.breakeven_inputs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_movements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cmv_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cmv_weeks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dish_ingredients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dishes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dre_expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dre_months TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dre_realtime_cycles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dre_realtime_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingredients TO authenticated;

-- Backend/service-only tables
GRANT ALL ON public.app_settings TO service_role;
GRANT ALL ON public.breakeven_inputs TO service_role;
GRANT ALL ON public.cash_movements TO service_role;
GRANT ALL ON public.cash_sessions TO service_role;
GRANT ALL ON public.cmv_settings TO service_role;
GRANT ALL ON public.cmv_weeks TO service_role;
GRANT ALL ON public.course_materials TO service_role;
GRANT ALL ON public.courses TO service_role;
GRANT ALL ON public.dish_ingredients TO service_role;
GRANT ALL ON public.dishes TO service_role;
GRANT ALL ON public.dre_expenses TO service_role;
GRANT ALL ON public.dre_months TO service_role;
GRANT ALL ON public.dre_realtime_cycles TO service_role;
GRANT ALL ON public.dre_realtime_entries TO service_role;
GRANT ALL ON public.email_send_log TO service_role;
GRANT ALL ON public.email_send_state TO service_role;
GRANT ALL ON public.email_unsubscribe_tokens TO service_role;
GRANT ALL ON public.ingredients TO service_role;
GRANT ALL ON public.lesson_progress TO service_role;
GRANT ALL ON public.lessons TO service_role;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.subscriptions TO service_role;
GRANT ALL ON public.suppressed_emails TO service_role;
GRANT ALL ON public.user_roles TO service_role;