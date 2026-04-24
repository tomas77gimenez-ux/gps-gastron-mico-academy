ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS panda_video_id text,
  ADD COLUMN IF NOT EXISTS panda_library_id text;