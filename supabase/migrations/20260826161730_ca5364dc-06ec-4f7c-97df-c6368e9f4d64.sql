-- Private bucket policies (no SELECT for anon/authenticated; service role bypasses RLS)
CREATE POLICY "Admins can upload paid content" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'paid-content' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update paid content" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'paid-content' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'paid-content' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete paid content" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'paid-content' AND public.has_role(auth.uid(), 'admin'));

-- storage_path columns (file_url intentionally left untouched as rollback value)
ALTER TABLE public.course_materials ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE public.gd_files ADD COLUMN IF NOT EXISTS storage_path text;

UPDATE public.course_materials
SET storage_path = split_part(file_url, '/object/public/course-content/', 2)
WHERE storage_path IS NULL
  AND file_url LIKE '%/object/public/course-content/%';

UPDATE public.gd_files
SET storage_path = split_part(file_url, '/object/public/course-content/', 2)
WHERE storage_path IS NULL
  AND file_url LIKE '%/object/public/course-content/%';