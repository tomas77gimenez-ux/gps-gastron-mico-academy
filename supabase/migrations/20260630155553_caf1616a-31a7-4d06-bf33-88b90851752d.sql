
-- 1) Switch SECURITY DEFINER helpers to SECURITY INVOKER
ALTER FUNCTION public.has_role(uuid, public.app_role) SECURITY INVOKER;
ALTER FUNCTION public.has_active_subscription(uuid, text) SECURITY INVOKER;

-- 2) Drop broad SELECT policy on storage.objects (public bucket still serves files via /object/public/)
DROP POLICY IF EXISTS "Anyone can view course content" ON storage.objects;

-- 3) Public-safe lessons view (no panda_video_id / panda_library_id / video_url)
CREATE OR REPLACE VIEW public.lessons_public AS
  SELECT l.id, l.course_id, l.title, l.description, l.duration, l.content_type,
         l.sort_order, l.is_free, l.poster_url, l.created_at, l.updated_at
  FROM public.lessons l
  JOIN public.courses c ON c.id = l.course_id
  WHERE c.status = 'published';
GRANT SELECT ON public.lessons_public TO anon, authenticated;

-- 4) Restrict lessons table SELECT to subscribers / admins / free lessons of published courses
DROP POLICY IF EXISTS "Lessons of published courses are publicly viewable" ON public.lessons;
CREATE POLICY "Lessons visible to subscribers free or admin"
  ON public.lessons FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = lessons.course_id AND c.status = 'published'
    )
    AND (
      lessons.is_free
      OR public.has_active_subscription(auth.uid(), 'live')
      OR public.has_active_subscription(auth.uid(), 'sandbox')
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
    )
  );

-- 5) Restrict course_materials SELECT to subscribers / admins
DROP POLICY IF EXISTS "Materials viewable by authenticated users" ON public.course_materials;
CREATE POLICY "Materials viewable by subscribers or admins"
  ON public.course_materials FOR SELECT TO authenticated
  USING (
    public.has_active_subscription(auth.uid(), 'live')
    OR public.has_active_subscription(auth.uid(), 'sandbox')
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 6) Explicit admin-only management on user_roles (defense in depth against privilege escalation)
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
