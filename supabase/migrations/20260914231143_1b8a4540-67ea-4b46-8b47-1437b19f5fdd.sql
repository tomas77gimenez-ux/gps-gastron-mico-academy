CREATE TABLE public.dre_sheets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'DRE',
  currency text NOT NULL DEFAULT 'USD',
  period_months integer NOT NULL DEFAULT 1,
  period_start date NOT NULL DEFAULT date_trunc('month', now())::date,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  revenue_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  custom_lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  pinned boolean NOT NULL DEFAULT false,
  fx_note jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT dre_sheets_period_months_check CHECK (period_months IN (1,3,6,12))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dre_sheets TO authenticated;
GRANT ALL ON public.dre_sheets TO service_role;

ALTER TABLE public.dre_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dre sheets" ON public.dre_sheets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own dre sheets" ON public.dre_sheets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dre sheets" ON public.dre_sheets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dre sheets" ON public.dre_sheets FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX dre_sheets_user_updated_idx ON public.dre_sheets (user_id, updated_at DESC);

CREATE TRIGGER update_dre_sheets_updated_at BEFORE UPDATE ON public.dre_sheets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();