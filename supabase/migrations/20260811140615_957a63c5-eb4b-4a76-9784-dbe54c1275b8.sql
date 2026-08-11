
REVOKE EXECUTE ON FUNCTION public.in_payment_grace(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.in_payment_grace(uuid) TO authenticated, service_role;
