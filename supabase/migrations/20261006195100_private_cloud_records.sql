-- Anonymous-authenticated installs use the authenticated Postgres role.
-- Keep opt-in cloud records and notifications private to their owning device.
-- Remove legacy anon-wide policies without deleting any stored rows.

DROP POLICY IF EXISTS "anonymous read app records" ON public.app_records;
DROP POLICY IF EXISTS "anonymous write app records" ON public.app_records;
DROP POLICY IF EXISTS "authenticated own app records" ON public.app_records;

CREATE POLICY "authenticated own app records"
  ON public.app_records FOR ALL TO authenticated
  USING (
    device_id = auth.uid()::text
    AND vessel_id = auth.uid()::text
  )
  WITH CHECK (
    device_id = auth.uid()::text
    AND vessel_id = auth.uid()::text
  );

DROP POLICY IF EXISTS "anonymous read notifications" ON public.app_notifications;
DROP POLICY IF EXISTS "anonymous write notifications" ON public.app_notifications;
DROP POLICY IF EXISTS "authenticated own notifications" ON public.app_notifications;

CREATE POLICY "authenticated own notifications"
  ON public.app_notifications FOR ALL TO authenticated
  USING (
    device_id = auth.uid()::text
    AND vessel_id = auth.uid()::text
  )
  WITH CHECK (
    device_id = auth.uid()::text
    AND vessel_id = auth.uid()::text
  );
