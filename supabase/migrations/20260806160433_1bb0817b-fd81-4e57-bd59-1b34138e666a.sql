ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS bunny_video_id text,
  ADD COLUMN IF NOT EXISTS bunny_video_id_2 text,
  ADD COLUMN IF NOT EXISTS cover_url text;

ALTER TABLE public.course_materials ALTER COLUMN file_url SET DEFAULT '';

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_settings readable by all" ON public.app_settings;
CREATE POLICY "app_settings readable by all"
  ON public.app_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "app_settings admin write" ON public.app_settings;
CREATE POLICY "app_settings admin write"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.app_settings (key, value)
VALUES ('bunny_library_id', '')
ON CONFLICT (key) DO NOTHING;

DROP FUNCTION IF EXISTS public.get_lesson_video(uuid);
DROP FUNCTION IF EXISTS private.get_lesson_video(uuid);

CREATE OR REPLACE FUNCTION private.get_lesson_video(_lesson_id uuid)
RETURNS TABLE(panda_video_id text, panda_library_id text, video_url text, bunny_video_id text, bunny_video_id_2 text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
      SELECT l.panda_video_id, l.panda_library_id, l.video_url, l.bunny_video_id, l.bunny_video_id_2
      FROM public.lessons l
      WHERE l.id = _lesson_id;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_lesson_video(_lesson_id uuid)
RETURNS TABLE(panda_video_id text, panda_library_id text, video_url text, bunny_video_id text, bunny_video_id_2 text)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT * FROM private.get_lesson_video(_lesson_id);
$function$;

GRANT EXECUTE ON FUNCTION public.get_lesson_video(uuid) TO anon, authenticated;