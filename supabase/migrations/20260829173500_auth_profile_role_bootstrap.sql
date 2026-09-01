CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_role public.app_role;
BEGIN
  selected_role := CASE NEW.raw_user_meta_data->>'role'
    WHEN 'government_officer' THEN 'government_officer'::public.app_role
    WHEN 'evaluator' THEN 'evaluator'::public.app_role
    WHEN 'startup_owner' THEN 'startup_owner'::public.app_role
    ELSE 'startup_owner'::public.app_role
  END;

  INSERT INTO public.profiles (id, full_name, email, organization)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'VISTAAR user'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'organization', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    organization = EXCLUDED.organization;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, selected_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmation_token = '',
    updated_at = now()
  WHERE id = NEW.id
    AND email_confirmed_at IS NULL;

  RETURN NEW;
END;
$$;

UPDATE auth.users
SET
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  confirmation_token = '',
  updated_at = now()
WHERE email_confirmed_at IS NULL
  AND email IS NOT NULL;

INSERT INTO public.profiles (id, full_name, email, organization)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), split_part(COALESCE(u.email, ''), '@', 1), 'VISTAAR user'),
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'organization', '')
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT
  u.id,
  CASE u.raw_user_meta_data->>'role'
    WHEN 'government_officer' THEN 'government_officer'::public.app_role
    WHEN 'evaluator' THEN 'evaluator'::public.app_role
    WHEN 'startup_owner' THEN 'startup_owner'::public.app_role
  END AS role
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' IN ('government_officer', 'evaluator', 'startup_owner')
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_roles existing
    WHERE existing.user_id = u.id
  );

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
