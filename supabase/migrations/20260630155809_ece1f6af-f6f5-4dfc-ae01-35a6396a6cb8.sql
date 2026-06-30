
-- Authenticated users (incl. admins managing lessons) need column-level access; anon does NOT.
GRANT SELECT (panda_video_id, panda_library_id, video_url) ON public.lessons TO authenticated;
