CREATE OR REPLACE FUNCTION public.admin_list_access_flags()
RETURNS TABLE(user_id uuid, pro_access boolean, elite_access boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY SELECT p.user_id, p.pro_access, p.elite_access FROM public.profiles p;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_list_access_flags() TO authenticated;