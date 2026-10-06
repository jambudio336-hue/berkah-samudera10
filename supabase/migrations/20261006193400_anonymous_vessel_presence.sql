-- Anonymous vessel directory and explicit live-location consent.
-- Each install uses its Supabase anonymous-auth UUID as the public device ID.
-- Precise GPS is visible only while the owner explicitly enables sharing.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS share_live_location boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles
  ALTER COLUMN share_live_location SET DEFAULT false;

ALTER TABLE public.live_positions
  ADD COLUMN IF NOT EXISTS vessel_name text NOT NULL DEFAULT 'Kapal';

-- Keep private profile fields (email/phone/bio) visible only to the profile owner.
DROP POLICY IF EXISTS "authenticated read profiles" ON public.profiles;
DROP POLICY IF EXISTS "users read own profile" ON public.profiles;
CREATE POLICY "users read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- RLS helper reads only the explicit location-sharing flag, not profile fields.
CREATE OR REPLACE FUNCTION public.can_view_shared_vessel_position(p_device_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id::text = p_device_id
      AND p.share_live_location IS TRUE
  );
$$;
REVOKE ALL ON FUNCTION public.can_view_shared_vessel_position(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_view_shared_vessel_position(text) TO authenticated;

-- Remove the old unauthenticated global location feed and writes.
DROP POLICY IF EXISTS "anonymous read live positions" ON public.live_positions;
DROP POLICY IF EXISTS "anonymous write live positions" ON public.live_positions;
DROP POLICY IF EXISTS "authenticated read shared live positions" ON public.live_positions;
DROP POLICY IF EXISTS "authenticated insert own live position" ON public.live_positions;
DROP POLICY IF EXISTS "authenticated update own live position" ON public.live_positions;
DROP POLICY IF EXISTS "authenticated delete own live position" ON public.live_positions;

CREATE POLICY "authenticated read shared live positions"
  ON public.live_positions FOR SELECT TO authenticated
  USING (
    public.can_view_shared_vessel_position(device_id)
    AND updated_at > now() - interval '5 minutes'
  );
CREATE POLICY "authenticated insert own live position"
  ON public.live_positions FOR INSERT TO authenticated
  WITH CHECK (
    device_id = auth.uid()::text
    AND vessel_id = auth.uid()::text
    AND public.can_view_shared_vessel_position(device_id)
  );
CREATE POLICY "authenticated update own live position"
  ON public.live_positions FOR UPDATE TO authenticated
  USING (device_id = auth.uid()::text AND vessel_id = auth.uid()::text)
  WITH CHECK (
    device_id = auth.uid()::text
    AND vessel_id = auth.uid()::text
    AND public.can_view_shared_vessel_position(device_id)
  );
CREATE POLICY "authenticated delete own live position"
  ON public.live_positions FOR DELETE TO authenticated
  USING (device_id = auth.uid()::text AND vessel_id = auth.uid()::text);
