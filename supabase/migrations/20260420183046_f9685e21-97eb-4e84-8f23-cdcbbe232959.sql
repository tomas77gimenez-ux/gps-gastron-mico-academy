ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS poster_url text;

UPDATE public.lessons SET 
  video_url = 'https://xovgygwweabinsdmkasb.supabase.co/storage/v1/object/public/course-content/videos/1776709577107_VIDEO_INTRODUCCION_GPS.mp4',
  poster_url = 'https://xovgygwweabinsdmkasb.supabase.co/storage/v1/object/public/course-content/thumbnails/bienvenida_1776709821.jpeg'
WHERE id = '43de7e2e-cc56-4777-8844-444bb30c25a4';

DELETE FROM public.lessons WHERE id = '294bcbaf-5e0c-4f5d-b00f-8f030a6250ce';

UPDATE public.courses SET thumbnail_url = 'https://xovgygwweabinsdmkasb.supabase.co/storage/v1/object/public/course-content/thumbnails/bienvenida_1776709821.jpeg'
WHERE id = 'e7d15e85-7d0e-45e1-9a4e-cbbef3f0e1d3';