
-- Drop existing diagnostic record policies to recreate with stricter station restrictions
DROP POLICY IF EXISTS "EV records access control" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "EV records insert control" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "EV records update control" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "EV records delete control" ON public.ev_diagnostic_records;

DROP POLICY IF EXISTS "PHEV records access control" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "PHEV records insert control" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "PHEV records update control" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "PHEV records delete control" ON public.phev_diagnostic_records;

-- Create stricter EV diagnostic records policies with station-based restrictions
CREATE POLICY "EV records access control" ON public.ev_diagnostic_records
  FOR SELECT USING (
    -- Super admins can see all records
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins and technicians can ONLY see records from their assigned station
    (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
    (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
    -- Front desk can only see their own records from their station
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
  );

CREATE POLICY "EV records insert control" ON public.ev_diagnostic_records
  FOR INSERT WITH CHECK (
    -- Super admins can insert anywhere
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins and technicians can ONLY insert for their assigned station
    (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
    (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
    -- Front desk can insert for their station (technician_id must be themselves)
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
  );

CREATE POLICY "EV records update control" ON public.ev_diagnostic_records
  FOR UPDATE USING (
    -- Super admins can update all records
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins and technicians can ONLY update records from their assigned station
    (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
    (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
    -- Front desk can only update their own records from their station
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
  );

CREATE POLICY "EV records delete control" ON public.ev_diagnostic_records
  FOR DELETE USING (
    -- Super admins can delete all records
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can ONLY delete records from their assigned station
    (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
    -- Technicians can ONLY delete records from their assigned station
    (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
    -- Front desk can only delete their own records from their station
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
  );

-- Create stricter PHEV diagnostic records policies with station-based restrictions
CREATE POLICY "PHEV records access control" ON public.phev_diagnostic_records
  FOR SELECT USING (
    -- Super admins can see all records
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins and technicians can ONLY see records from their assigned station
    (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
    (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
    -- Front desk can only see their own records from their station
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
  );

CREATE POLICY "PHEV records insert control" ON public.phev_diagnostic_records
  FOR INSERT WITH CHECK (
    -- Super admins can insert anywhere
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins and technicians can ONLY insert for their assigned station
    (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
    (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
    -- Front desk can insert for their station (technician_id must be themselves)
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
  );

CREATE POLICY "PHEV records update control" ON public.phev_diagnostic_records
  FOR UPDATE USING (
    -- Super admins can update all records
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins and technicians can ONLY update records from their assigned station
    (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
    (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
    -- Front desk can only update their own records from their station
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
  );

CREATE POLICY "PHEV records delete control" ON public.phev_diagnostic_records
  FOR DELETE USING (
    -- Super admins can delete all records
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can ONLY delete records from their assigned station
    (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
    -- Technicians can ONLY delete records from their assigned station
    (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
    -- Front desk can only delete their own records from their station
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
  );
