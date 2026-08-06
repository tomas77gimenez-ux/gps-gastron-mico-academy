CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON private.app_secrets FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_app_secret(_key text, _value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  INSERT INTO private.app_secrets(key, value)
  VALUES (_key, _value)
  ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.set_app_secret(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_app_secret(text, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.app_secret_exists(_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RETURN false;
  END IF;
  RETURN EXISTS (SELECT 1 FROM private.app_secrets WHERE key = _key AND coalesce(value, '') <> '');
END;
$$;

REVOKE ALL ON FUNCTION public.app_secret_exists(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.app_secret_exists(text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_app_secret(_key text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT value FROM private.app_secrets WHERE key = _key;
$$;

REVOKE ALL ON FUNCTION public.get_app_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_secret(text) TO service_role;