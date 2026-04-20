
-- Allow public read of published courses
DROP POLICY IF EXISTS "Published courses are viewable by authenticated users" ON public.courses;
CREATE POLICY "Published courses are publicly viewable"
ON public.courses
FOR SELECT
TO anon, authenticated
USING (status = 'published' OR has_role(auth.uid(), 'admin'::app_role));

-- Allow public read of lessons belonging to published courses
DROP POLICY IF EXISTS "Lessons viewable by authenticated users" ON public.lessons;
CREATE POLICY "Lessons of published courses are publicly viewable"
ON public.lessons
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = lessons.course_id
      AND (courses.status = 'published' OR has_role(auth.uid(), 'admin'::app_role))
  )
);
