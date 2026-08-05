-- 1. Free tools access flag on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tools_free_access boolean NOT NULL DEFAULT false;

-- 2. Ingredients
CREATE TABLE public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  purchase_price numeric NOT NULL DEFAULT 0,
  yield_factor_pct numeric NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingredients TO authenticated;
GRANT ALL ON public.ingredients TO service_role;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ingredients" ON public.ingredients FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON public.ingredients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Dishes
CREATE TABLE public.dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  target_cmv_pct numeric NOT NULL DEFAULT 32,
  current_menu_price numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dishes TO authenticated;
GRANT ALL ON public.dishes TO service_role;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dishes" ON public.dishes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON public.dishes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.dish_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dish_id uuid NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dish_ingredients TO authenticated;
GRANT ALL ON public.dish_ingredients TO service_role;
ALTER TABLE public.dish_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dish_ingredients" ON public.dish_ingredients FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Monthly DRE
CREATE TABLE public.dre_months (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month text NOT NULL,
  sales numeric NOT NULL DEFAULT 0,
  cmv_purchases numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dre_months TO authenticated;
GRANT ALL ON public.dre_months TO service_role;
ALTER TABLE public.dre_months ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dre_months" ON public.dre_months FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_dre_months_updated_at BEFORE UPDATE ON public.dre_months FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.dre_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dre_month_id uuid NOT NULL REFERENCES public.dre_months(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dre_expenses TO authenticated;
GRANT ALL ON public.dre_expenses TO service_role;
ALTER TABLE public.dre_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dre_expenses" ON public.dre_expenses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Cash control
CREATE TABLE public.cash_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  responsible text NOT NULL DEFAULT '',
  opening_fund numeric NOT NULL DEFAULT 0,
  physical_count numeric,
  status text NOT NULL DEFAULT 'open',
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_sessions TO authenticated;
GRANT ALL ON public.cash_sessions TO service_role;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cash_sessions" ON public.cash_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_cash_sessions_updated_at BEFORE UPDATE ON public.cash_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.cash_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid NOT NULL REFERENCES public.cash_sessions(id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL,
  description text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_movements TO authenticated;
GRANT ALL ON public.cash_movements TO service_role;
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cash_movements" ON public.cash_movements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. CMV monitor
CREATE TABLE public.cmv_settings (
  user_id uuid PRIMARY KEY,
  target_pct numeric NOT NULL DEFAULT 32,
  tolerance_pts numeric NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cmv_settings TO authenticated;
GRANT ALL ON public.cmv_settings TO service_role;
ALTER TABLE public.cmv_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cmv_settings" ON public.cmv_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_cmv_settings_updated_at BEFORE UPDATE ON public.cmv_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.cmv_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month text NOT NULL,
  week integer NOT NULL,
  purchases numeric NOT NULL DEFAULT 0,
  sales numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, month, week)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cmv_weeks TO authenticated;
GRANT ALL ON public.cmv_weeks TO service_role;
ALTER TABLE public.cmv_weeks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cmv_weeks" ON public.cmv_weeks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_cmv_weeks_updated_at BEFORE UPDATE ON public.cmv_weeks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Break-even calculator saved inputs
CREATE TABLE public.breakeven_inputs (
  user_id uuid PRIMARY KEY,
  fixed_costs numeric NOT NULL DEFAULT 0,
  variable_cost_pct numeric NOT NULL DEFAULT 0,
  avg_ticket numeric NOT NULL DEFAULT 0,
  operating_days numeric NOT NULL DEFAULT 30,
  current_sales numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.breakeven_inputs TO authenticated;
GRANT ALL ON public.breakeven_inputs TO service_role;
ALTER TABLE public.breakeven_inputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own breakeven_inputs" ON public.breakeven_inputs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_breakeven_inputs_updated_at BEFORE UPDATE ON public.breakeven_inputs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Tools access check
CREATE OR REPLACE FUNCTION public.has_tools_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin'::public.app_role)
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = _user_id AND p.tools_free_access)
    OR EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = _user_id
        AND s.status IN ('active','trialing')
        AND (s.current_period_end IS NULL OR s.current_period_end > now())
    )
$$;

-- 9. Admin toggle for free tools access
CREATE OR REPLACE FUNCTION private.admin_set_tools_access(_user_id uuid, _enabled boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;
  INSERT INTO public.profiles (user_id, tools_free_access)
  VALUES (_user_id, _enabled)
  ON CONFLICT (user_id) DO UPDATE SET tools_free_access = _enabled;
  RETURN _enabled;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_tools_access(_user_id uuid, _enabled boolean)
RETURNS boolean
LANGUAGE sql
SET search_path = public
AS $$
  SELECT private.admin_set_tools_access(_user_id, _enabled);
$$;

-- 10. admin_list_users now exposes tools_free_access
DROP FUNCTION IF EXISTS public.admin_list_users();
DROP FUNCTION IF EXISTS private.admin_list_users();

CREATE FUNCTION private.admin_list_users()
RETURNS TABLE(user_id uuid, email text, created_at timestamptz, plan_tier plan_tier, status text, current_period_end timestamptz, environment text, subscription_id uuid, is_admin boolean, tools_free_access boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
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
      public.has_role(u.id, 'admin'::public.app_role),
      COALESCE(pr.tools_free_access, false)
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
    LEFT JOIN public.profiles pr ON pr.user_id = u.id
    ORDER BY u.created_at DESC;
END;
$$;

CREATE FUNCTION public.admin_list_users()
RETURNS TABLE(user_id uuid, email text, created_at timestamptz, plan_tier plan_tier, status text, current_period_end timestamptz, environment text, subscription_id uuid, is_admin boolean, tools_free_access boolean)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT * FROM private.admin_list_users();
$$;