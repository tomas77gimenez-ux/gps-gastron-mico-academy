
-- 1) Enum plan_tier
DO $$ BEGIN
  CREATE TYPE public.plan_tier AS ENUM ('basico', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Alterações em subscriptions (permitir concessão manual)
ALTER TABLE public.subscriptions
  ALTER COLUMN stripe_subscription_id DROP NOT NULL,
  ALTER COLUMN stripe_customer_id DROP NOT NULL,
  ALTER COLUMN product_id DROP NOT NULL,
  ALTER COLUMN price_id DROP NOT NULL;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS plan_tier public.plan_tier,
  ADD COLUMN IF NOT EXISTS granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notes text;

-- 3) required_plan em lessons e course_materials
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS required_plan public.plan_tier NOT NULL DEFAULT 'basico';

ALTER TABLE public.course_materials
  ADD COLUMN IF NOT EXISTS required_plan public.plan_tier NOT NULL DEFAULT 'basico';

-- 4) Função has_plan_access: retorna true se usuário tem plano >= required_plan ou é admin
CREATE OR REPLACE FUNCTION public.has_plan_access(_user_id uuid, _required public.plan_tier)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    -- admin sempre passa
    public.has_role(_user_id, 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.user_id = _user_id
        AND s.status IN ('active','trialing')
        AND (s.current_period_end IS NULL OR s.current_period_end > now())
        AND (
          _required = 'basico'::public.plan_tier
            AND s.plan_tier IN ('basico'::public.plan_tier, 'premium'::public.plan_tier)
          OR
          _required = 'premium'::public.plan_tier
            AND s.plan_tier = 'premium'::public.plan_tier
        )
    );
$$;

GRANT EXECUTE ON FUNCTION public.has_plan_access(uuid, public.plan_tier) TO anon, authenticated;

-- 5) Atualiza RPC private.get_lesson_video para respeitar required_plan
CREATE OR REPLACE FUNCTION private.get_lesson_video(_lesson_id uuid)
RETURNS TABLE(panda_video_id text, panda_library_id text, video_url text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_free boolean;
  _course_status text;
  _required public.plan_tier;
BEGIN
  SELECT l.is_free, c.status, l.required_plan
    INTO _is_free, _course_status, _required
  FROM public.lessons l
  JOIN public.courses c ON c.id = l.course_id
  WHERE l.id = _lesson_id;

  IF _course_status IS DISTINCT FROM 'published'
     AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN;
  END IF;

  IF COALESCE(_is_free, false)
     OR public.has_plan_access(auth.uid(), _required) THEN
    RETURN QUERY
      SELECT l.panda_video_id, l.panda_library_id, l.video_url
      FROM public.lessons l
      WHERE l.id = _lesson_id;
  END IF;
END;
$$;

-- 6) Atualiza policy de course_materials para respeitar required_plan
DROP POLICY IF EXISTS "Materials viewable by subscribers or admins" ON public.course_materials;
CREATE POLICY "Materials viewable by plan or admin"
  ON public.course_materials FOR SELECT TO authenticated
  USING (
    public.has_plan_access(auth.uid(), required_plan)
  );

-- 7) Function para conceder assinatura manual (admin-only)
CREATE OR REPLACE FUNCTION public.grant_subscription(
  _user_id uuid,
  _plan public.plan_tier,
  _duration_days integer,
  _notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_id uuid;
  _end timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  IF _duration_days IS NULL OR _duration_days <= 0 THEN
    _end := NULL; -- vitalício
  ELSE
    _end := now() + make_interval(days => _duration_days);
  END IF;

  -- Cancela assinaturas manuais ativas anteriores do mesmo usuário
  UPDATE public.subscriptions
     SET status = 'canceled', cancel_at_period_end = true, updated_at = now()
   WHERE user_id = _user_id
     AND environment = 'manual'
     AND status IN ('active','trialing');

  INSERT INTO public.subscriptions (
    user_id, plan_tier, status, environment, granted_by, notes,
    current_period_start, current_period_end, updated_at, created_at
  )
  VALUES (
    _user_id, _plan, 'active', 'manual', auth.uid(), _notes,
    now(), _end, now(), now()
  )
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_subscription(uuid, public.plan_tier, integer, text) TO authenticated;

-- 8) Function para revogar assinatura manual (admin-only)
CREATE OR REPLACE FUNCTION public.revoke_subscription(_subscription_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  UPDATE public.subscriptions
     SET status = 'canceled', current_period_end = now(), cancel_at_period_end = true, updated_at = now()
   WHERE id = _subscription_id
     AND environment = 'manual';

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.revoke_subscription(uuid) TO authenticated;

-- 9) Function para admin listar todos os usuários com plano ativo (usa auth.users)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  created_at timestamptz,
  plan_tier public.plan_tier,
  status text,
  current_period_end timestamptz,
  environment text,
  subscription_id uuid,
  is_admin boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  RETURN QUERY
    SELECT
      u.id AS user_id,
      u.email::text,
      u.created_at,
      s.plan_tier,
      s.status,
      s.current_period_end,
      s.environment,
      s.id AS subscription_id,
      public.has_role(u.id, 'admin'::public.app_role) AS is_admin
    FROM auth.users u
    LEFT JOIN LATERAL (
      SELECT *
      FROM public.subscriptions sub
      WHERE sub.user_id = u.id
        AND sub.status IN ('active','trialing')
        AND (sub.current_period_end IS NULL OR sub.current_period_end > now())
      ORDER BY sub.updated_at DESC
      LIMIT 1
    ) s ON true
    ORDER BY u.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
