CREATE OR REPLACE FUNCTION public.has_tools_access(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    public.has_role(_user_id, 'admin'::public.app_role)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = _user_id AND p.tools_free_access)
    OR EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = _user_id
        AND s.environment = 'live'
        AND s.status IN ('active','trialing')
        AND (s.current_period_end IS NULL OR s.current_period_end > now())
    )
$function$;

CREATE OR REPLACE FUNCTION public.has_plan_access(_user_id uuid, _required plan_tier)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT
    public.has_role(_user_id, 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.user_id = _user_id
        AND s.environment = 'live'
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
$function$;