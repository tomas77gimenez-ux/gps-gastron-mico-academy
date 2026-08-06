DROP FUNCTION IF EXISTS public.set_app_secret(text, text);
DROP FUNCTION IF EXISTS public.get_app_secret(text);
DROP FUNCTION IF EXISTS public.app_secret_exists(text);

CREATE FUNCTION public.set_app_secret(_key text, _value text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
  INSERT INTO private.app_secrets (key, value, updated_at)
  VALUES (_key, _value, now())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  RETURN true;
END;
$$;

CREATE FUNCTION public.get_app_secret(_key text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT value FROM private.app_secrets WHERE key = _key;
$$;

CREATE FUNCTION public.app_secret_exists(_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT EXISTS (SELECT 1 FROM private.app_secrets WHERE key = _key);
$$;

REVOKE ALL ON FUNCTION public.set_app_secret(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_app_secret(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.app_secret_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_app_secret(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_app_secret(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.app_secret_exists(text) TO service_role;