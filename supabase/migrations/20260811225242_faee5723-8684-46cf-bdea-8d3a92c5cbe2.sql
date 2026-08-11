ALTER TYPE public.plan_tier ADD VALUE IF NOT EXISTS 'elite';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS elite_access boolean NOT NULL DEFAULT false;

-- ============ Gerentes Digitales catalog ============
CREATE TABLE IF NOT EXISTS public.gerentes_digitales (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL DEFAULT 6700,
  stripe_price_id text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gerentes_digitales TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gerentes_digitales TO authenticated;
GRANT ALL ON public.gerentes_digitales TO service_role;
ALTER TABLE public.gerentes_digitales ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.gd_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gd_id uuid NOT NULL REFERENCES public.gerentes_digitales(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'pdf',
  file_size bigint,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gd_files TO authenticated;
GRANT ALL ON public.gd_files TO service_role;
ALTER TABLE public.gd_files ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.gd_entitlements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gd_id uuid NOT NULL REFERENCES public.gerentes_digitales(id) ON DELETE CASCADE,
  user_id uuid,
  email text,
  granted_via text NOT NULL DEFAULT 'purchase',
  stripe_session_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gd_entitlements_granted_via_check CHECK (granted_via IN ('purchase','elite','admin')),
  CONSTRAINT gd_entitlements_owner_check CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS gd_entitlements_user_gd_key ON public.gd_entitlements (gd_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS gd_entitlements_email_gd_key ON public.gd_entitlements (gd_id, lower(email)) WHERE user_id IS NULL AND email IS NOT NULL;
GRANT SELECT ON public.gd_entitlements TO authenticated;
GRANT ALL ON public.gd_entitlements TO service_role;
ALTER TABLE public.gd_entitlements ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_gerentes_digitales_updated_at
  BEFORE UPDATE ON public.gerentes_digitales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Access functions ============
CREATE OR REPLACE FUNCTION public.has_elite_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    _user_id IS NOT NULL
    AND (
      public.has_role(_user_id, 'admin'::public.app_role)
      OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = _user_id AND p.elite_access)
      OR EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.user_id = _user_id
          AND s.environment IN ('live','manual')
          AND s.plan_tier::text = 'elite'
          AND (
            (s.status IN ('active','trialing')
              AND (s.current_period_end IS NULL OR s.current_period_end > now()))
            OR (s.status = 'past_due' AND s.updated_at > now() - interval '5 days')
            OR (s.status = 'canceled' AND s.current_period_end > now())
          )
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.has_pro_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    _user_id IS NOT NULL
    AND (
      public.has_elite_access(_user_id)
      OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = _user_id AND p.pro_access)
      OR EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.user_id = _user_id
          AND s.environment IN ('live','manual')
          AND s.plan_tier::text IN ('premium','elite')
          AND (
            (s.status IN ('active','trialing')
              AND (s.current_period_end IS NULL OR s.current_period_end > now()))
            OR (s.status = 'past_due' AND s.updated_at > now() - interval '5 days')
            OR (s.status = 'canceled' AND s.current_period_end > now())
          )
      )
    );
$$;

CREATE OR REPLACE FUNCTION public.has_plan_access(_user_id uuid, _required plan_tier)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    public.has_role(_user_id, 'admin'::public.app_role)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = _user_id AND p.tools_free_access)
    OR EXISTS (
      SELECT 1
      FROM public.subscriptions s
      WHERE s.user_id = _user_id
        AND s.environment IN ('live','manual')
        AND (
          (s.status IN ('active','trialing')
            AND (s.current_period_end IS NULL OR s.current_period_end > now()))
          OR (s.status = 'past_due' AND s.updated_at > now() - interval '5 days')
          OR (s.status = 'canceled' AND s.current_period_end > now())
        )
        AND (
          _required::text = 'basico'
            AND s.plan_tier::text IN ('basico','premium','elite')
          OR
          _required::text = 'premium'
            AND s.plan_tier::text IN ('premium','elite')
          OR
          _required::text = 'elite'
            AND s.plan_tier::text = 'elite'
        )
    );
$$;

CREATE OR REPLACE FUNCTION public.has_gd_access(_user_id uuid, _gd_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    _user_id IS NOT NULL
    AND (
      public.has_elite_access(_user_id)
      OR EXISTS (
        SELECT 1 FROM public.gd_entitlements e
        WHERE e.gd_id = _gd_id AND e.user_id = _user_id
      )
    );
$$;

-- ============ RLS policies ============
CREATE POLICY "Anyone can view active gerentes digitales"
  ON public.gerentes_digitales FOR SELECT TO anon, authenticated
  USING (active OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins manage gerentes digitales"
  ON public.gerentes_digitales FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Owners can view gd files"
  ON public.gd_files FOR SELECT TO authenticated
  USING (public.has_gd_access(auth.uid(), gd_id));
CREATE POLICY "Admins manage gd files"
  ON public.gd_files FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can view own gd entitlements"
  ON public.gd_entitlements FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- ============ Admin RPCs ============
CREATE OR REPLACE FUNCTION public.admin_set_elite_access(_user_id uuid, _enabled boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  UPDATE public.profiles SET elite_access = _enabled, updated_at = now() WHERE user_id = _user_id;
  RETURN true;
END;
$$;

DROP FUNCTION IF EXISTS public.admin_list_pro_access();
CREATE OR REPLACE FUNCTION public.admin_list_pro_access()
RETURNS TABLE(user_id uuid, pro_access boolean, elite_access boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY SELECT p.user_id, p.pro_access, p.elite_access FROM public.profiles p;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_grant_gd(_user_id uuid, _gd_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  INSERT INTO public.gd_entitlements (gd_id, user_id, granted_via)
  VALUES (_gd_id, _user_id, 'admin')
  ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_gd(_user_id uuid, _gd_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  DELETE FROM public.gd_entitlements WHERE gd_id = _gd_id AND user_id = _user_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_gd_entitlements()
RETURNS TABLE(gd_id uuid, user_id uuid, email text, granted_via text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY SELECT e.gd_id, e.user_id, e.email, e.granted_via, e.created_at FROM public.gd_entitlements e;
END;
$$;

-- ============ Claim email-matched entitlements on signup ============
CREATE OR REPLACE FUNCTION public.handle_admin_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email = 'tomas77gimenez@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT DO NOTHING;

  -- Claim any Gerente Digital purchases made with this email before signup.
  UPDATE public.gd_entitlements
  SET user_id = NEW.id
  WHERE user_id IS NULL
    AND lower(email) = lower(NEW.email)
    AND NOT EXISTS (
      SELECT 1 FROM public.gd_entitlements e2
      WHERE e2.gd_id = public.gd_entitlements.gd_id AND e2.user_id = NEW.id
    );

  RETURN NEW;
END;
$$;

-- ============ Seed the first two products ============
INSERT INTO public.gerentes_digitales (slug, name, description, price_cents, stripe_price_id, active, sort_order)
VALUES
  ('salon-atencion', 'Gerente Digital 1 — Salón y Atención',
   'Checklists de auditoría operativa para salón, atención y servicio, con calificación automática.',
   6700, 'gd_salon_atencion', true, 1),
  ('cocina-produccion', 'Gerente Digital 2 — Cocina y Producción',
   'Checklists de auditoría para cocina: mise en place, personal de producción e inventario de mercadería.',
   6700, 'gd_cocina_produccion', true, 2)
ON CONFLICT (slug) DO NOTHING;