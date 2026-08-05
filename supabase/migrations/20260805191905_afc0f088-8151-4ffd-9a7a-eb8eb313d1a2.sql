REVOKE EXECUTE ON FUNCTION public.has_tools_access(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_tools_access(uuid, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM anon;