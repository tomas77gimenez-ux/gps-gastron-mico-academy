-- Real-time DRE: monthly cycles with weekly accumulating entries

CREATE TABLE public.dre_realtime_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dre_realtime_cycles_status_check CHECK (status IN ('open', 'closed'))
);

CREATE INDEX idx_dre_realtime_cycles_user ON public.dre_realtime_cycles(user_id, status);

ALTER TABLE public.dre_realtime_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycles"
  ON public.dre_realtime_cycles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cycles"
  ON public.dre_realtime_cycles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycles"
  ON public.dre_realtime_cycles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycles"
  ON public.dre_realtime_cycles FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_dre_realtime_cycles_updated_at
  BEFORE UPDATE ON public.dre_realtime_cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.dre_realtime_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES public.dre_realtime_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  week_number INT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dre_realtime_entries_week_check CHECK (week_number BETWEEN 1 AND 4),
  CONSTRAINT dre_realtime_entries_unique_week UNIQUE (cycle_id, week_number)
);

CREATE INDEX idx_dre_realtime_entries_cycle ON public.dre_realtime_entries(cycle_id);

ALTER TABLE public.dre_realtime_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON public.dre_realtime_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own entries"
  ON public.dre_realtime_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON public.dre_realtime_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON public.dre_realtime_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_dre_realtime_entries_updated_at
  BEFORE UPDATE ON public.dre_realtime_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();