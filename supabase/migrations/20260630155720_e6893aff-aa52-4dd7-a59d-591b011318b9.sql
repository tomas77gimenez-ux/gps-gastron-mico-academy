
-- Drop the SECURITY DEFINER view (lint 0010)
DROP VIEW IF EXISTS public.lessons_public;

-- Revert lessons SELECT policy to allow public listing of published-course lessons
DROP POLICY IF EXISTS "Lessons visible to subscribers free or admin" ON public.lessons;
CREATE POLICY "Lessons of published courses are publicly viewable"
  ON public.lessons FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = lessons.course_id AND c.status = 'published'
    )
  );

-- Column-level: hide sensitive columns (video IDs, library, raw video_url) from anon and authenticated
REVOKE SELECT ON public.lessons FROM anon, authenticated;
GRANT SELECT (id, course_id, title, description, duration, content_type, sort_order, is_free, poster_url, created_at, updated_at)
  ON public.lessons TO anon, authenticated;
GRANT ALL ON public.lessons TO service_role;

-- Private schema for the subscription-gated DEFINER helper (not exposed by PostgREST)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO anon, authenticated;

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
BEGIN
  SELECT l.is_free, c.status
    INTO _is_free, _course_status
  FROM public.lessons l
  JOIN public.courses c ON c.id = l.course_id
  WHERE l.id = _lesson_id;

  IF _course_status IS DISTINCT FROM 'published' AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN;
  END IF;

  IF COALESCE(_is_free, false)
     OR public.has_active_subscription(auth.uid(), 'live')
     OR public.has_active_subscription(auth.uid(), 'sandbox')
     OR public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN QUERY
      SELECT l.panda_video_id, l.panda_library_id, l.video_url
      FROM public.lessons l
      WHERE l.id = _lesson_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION private.get_lesson_video(uuid) TO anon, authenticated;

-- Public INVOKER wrapper so PostgREST can expose it as RPC
CREATE OR REPLACE FUNCTION public.get_lesson_video(_lesson_id uuid)
RETURNS TABLE(panda_video_id text, panda_library_id text, video_url text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT panda_video_id, panda_library_id, video_url
  FROM private.get_lesson_video(_lesson_id);
$$;

GRANT EXECUTE ON FUNCTION public.get_lesson_video(uuid) TO anon, authenticated;

-- Silence DEFINER lint on legacy trigger helpers (only triggers need them; not callable as RPC)
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_admin_signup() FROM PUBLIC, anon, authenticated;
