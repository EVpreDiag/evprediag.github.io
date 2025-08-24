-- Tighten read access for diagnostic tables by removing public SELECT policies
-- Keep existing role-based policies intact

-- Ensure RLS remains enabled
ALTER TABLE public.ev_diagnostic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phev_diagnostic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ice_diagnostic_records ENABLE ROW LEVEL SECURITY;

-- Drop overly-permissive public read policies if they exist
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ev_diagnostic_records' 
      AND policyname = 'Users can view EV diagnostic records'
  ) THEN
    DROP POLICY "Users can view EV diagnostic records" ON public.ev_diagnostic_records;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'phev_diagnostic_records' 
      AND policyname = 'Users can view PHEV diagnostic records'
  ) THEN
    DROP POLICY "Users can view PHEV diagnostic records" ON public.phev_diagnostic_records;
  END IF;

  -- In case an analogous public policy exists on ICE records
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'ice_diagnostic_records' 
      AND policyname = 'Users can view ICE diagnostic records'
  ) THEN
    DROP POLICY "Users can view ICE diagnostic records" ON public.ice_diagnostic_records;
  END IF;
END $$;