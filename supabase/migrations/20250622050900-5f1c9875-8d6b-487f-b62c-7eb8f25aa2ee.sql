
-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Super admins can view all stations" ON public.stations;
DROP POLICY IF EXISTS "Super admins can manage all stations" ON public.stations;
DROP POLICY IF EXISTS "Super admins can update all EV records" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "Super admins can delete all EV records" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "Super admins can update all PHEV records" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "Super admins can delete all PHEV records" ON public.phev_diagnostic_records;

-- Add RLS policies for stations table to allow super admins to view all stations
CREATE POLICY "Super admins can view all stations" 
  ON public.stations 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage all stations" 
  ON public.stations 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Add policies to allow super admins to update diagnostic records
CREATE POLICY "Super admins can update all EV records" 
  ON public.ev_diagnostic_records 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all EV records" 
  ON public.ev_diagnostic_records 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all PHEV records" 
  ON public.phev_diagnostic_records 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete all PHEV records" 
  ON public.phev_diagnostic_records 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'super_admin'));
