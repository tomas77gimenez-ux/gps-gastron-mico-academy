-- 1. Reset privileges on public.lessons
REVOKE ALL ON public.lessons FROM anon, authenticated;

-- 2. Column-level SELECT, excluding video identifiers
GRANT SELECT (
  id, course_id, title, description, content_type, duration, sort_order,
  is_free, created_at, updated_at, poster_url, cover_url, required_plan,
  title_en, title_pt, description_en, description_pt, announced_at
) ON public.lessons TO anon, authenticated;

-- 3. Write access only for authenticated (RLS restricts to admins)
GRANT INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;

-- 4. Admin-only secure reader for the full lesson rows (admin panel)
CREATE OR REPLACE FUNCTION public.admin_list_lessons(_course_id uuid)
RETURNS SETOF public.lessons
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
    SELECT l.* FROM public.lessons l
    WHERE l.course_id = _course_id
    ORDER BY l.sort_order ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_lessons(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_lessons(uuid) TO authenticated, service_role;