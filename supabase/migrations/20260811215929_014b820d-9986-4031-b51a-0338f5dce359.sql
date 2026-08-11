ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_access boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.has_pro_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _user_id IS NOT NULL
    AND (
      public.has_role(_user_id, 'admin'::public.app_role)
      OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = _user_id AND p.pro_access)
      OR EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.user_id = _user_id
          AND s.environment IN ('live','manual')
          AND s.plan_tier = 'premium'::public.plan_tier
          AND (
            (s.status IN ('active','trialing')
              AND (s.current_period_end IS NULL OR s.current_period_end > now()))
            OR (s.status = 'past_due' AND s.updated_at > now() - interval '5 days')
            OR (s.status = 'canceled' AND s.current_period_end > now())
          )
      )
    );
$$;

-- Reunión semanal de implementación
CREATE TABLE public.pro_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL,
  meeting_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pro_sessions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pro_sessions TO authenticated;
GRANT ALL ON public.pro_sessions TO service_role;
ALTER TABLE public.pro_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pro members can view sessions" ON public.pro_sessions
  FOR SELECT TO authenticated USING (public.has_pro_access(auth.uid()));
CREATE POLICY "Admins manage sessions" ON public.pro_sessions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER update_pro_sessions_updated_at BEFORE UPDATE ON public.pro_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grabaciones anteriores
CREATE TABLE public.pro_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  session_date date NOT NULL,
  bunny_video_id text,
  notes text,
  attachment_url text,
  attachment_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pro_recordings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pro_recordings TO authenticated;
GRANT ALL ON public.pro_recordings TO service_role;
ALTER TABLE public.pro_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pro members can view recordings" ON public.pro_recordings
  FOR SELECT TO authenticated USING (public.has_pro_access(auth.uid()));
CREATE POLICY "Admins manage recordings" ON public.pro_recordings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER update_pro_recordings_updated_at BEFORE UPDATE ON public.pro_recordings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Caso Real del Mes
CREATE TABLE public.pro_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month integer NOT NULL,
  year integer NOT NULL,
  title text NOT NULL,
  description text,
  bunny_video_id text,
  attachment_url text,
  attachment_name text,
  metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pro_cases TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pro_cases TO authenticated;
GRANT ALL ON public.pro_cases TO service_role;
ALTER TABLE public.pro_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pro members can view cases" ON public.pro_cases
  FOR SELECT TO authenticated USING (public.has_pro_access(auth.uid()));
CREATE POLICY "Admins manage cases" ON public.pro_cases
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE TRIGGER update_pro_cases_updated_at BEFORE UPDATE ON public.pro_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin helpers para el flag Acceso Pro
CREATE OR REPLACE FUNCTION public.admin_set_pro_access(_user_id uuid, _enabled boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.profiles SET pro_access = _enabled, updated_at = now() WHERE user_id = _user_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_pro_access()
RETURNS TABLE(user_id uuid, pro_access boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY SELECT p.user_id, p.pro_access FROM public.profiles p;
END;
$$;