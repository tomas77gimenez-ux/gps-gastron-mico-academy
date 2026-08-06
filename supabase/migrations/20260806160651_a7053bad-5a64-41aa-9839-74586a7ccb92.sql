ALTER TABLE public.course_materials
  ADD COLUMN IF NOT EXISTS has_file boolean GENERATED ALWAYS AS (coalesce(file_url, '') <> '') STORED;