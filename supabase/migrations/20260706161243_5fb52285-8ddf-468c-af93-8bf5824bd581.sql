
-- Move admin functions into private schema; expose INVOKER wrappers in public.
-- Same pattern used for private.get_lesson_video.

-- grant_subscription
CREATE OR REPLACE FUNCTION private.grant_subscription(
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
    _end := NULL;
  ELSE
    _end := now() + make_interval(days => _duration_days);
  END IF;

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

DROP FUNCTION IF EXISTS public.grant_subscription(uuid, public.plan_tier, integer, text);
CREATE OR REPLACE FUNCTION public.grant_subscription(
  _user_id uuid,
  _plan public.plan_tier,
  _duration_days integer,
  _notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT private.grant_subscription(_user_id, _plan, _duration_days, _notes);
$$;
GRANT EXECUTE ON FUNCTION private.grant_subscription(uuid, public.plan_tier, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_subscription(uuid, public.plan_tier, integer, text) TO authenticated;

-- revoke_subscription
CREATE OR REPLACE FUNCTION private.revoke_subscription(_subscription_id uuid)
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

DROP FUNCTION IF EXISTS public.revoke_subscription(uuid);
CREATE OR REPLACE FUNCTION public.revoke_subscription(_subscription_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT private.revoke_subscription(_subscription_id);
$$;
GRANT EXECUTE ON FUNCTION private.revoke_subscription(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_subscription(uuid) TO authenticated;

-- admin_list_users
CREATE OR REPLACE FUNCTION private.admin_list_users()
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
      u.id, u.email::text, u.created_at,
      s.plan_tier, s.status, s.current_period_end, s.environment, s.id,
      public.has_role(u.id, 'admin'::public.app_role)
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

DROP FUNCTION IF EXISTS public.admin_list_users();
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
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT * FROM private.admin_list_users();
$$;
GRANT EXECUTE ON FUNCTION private.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
