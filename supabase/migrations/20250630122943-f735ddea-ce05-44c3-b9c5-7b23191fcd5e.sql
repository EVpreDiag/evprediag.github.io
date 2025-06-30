
-- Drop existing policies to recreate with stricter NULL station restrictions
DROP POLICY IF EXISTS "EV records access control" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "EV records insert control" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "EV records update control" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "EV records delete control" ON public.ev_diagnostic_records;

DROP POLICY IF EXISTS "PHEV records access control" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "PHEV records insert control" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "PHEV records update control" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "PHEV records delete control" ON public.phev_diagnostic_records;

DROP POLICY IF EXISTS "Profile access control" ON public.profiles;
DROP POLICY IF EXISTS "Profile update control" ON public.profiles;

-- Create stricter EV diagnostic records policies - EXCLUDE NULL station_id records for non-super admins
CREATE POLICY "EV records access control" ON public.ev_diagnostic_records
  FOR SELECT USING (
    -- Super admins can see all records (including NULL station_id)
    public.has_role(auth.uid(), 'super_admin') OR
    -- Non-super admins can ONLY see records with matching station_id (excludes NULL)
    (station_id IS NOT NULL AND (
      (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
    ))
  );

CREATE POLICY "EV records insert control" ON public.ev_diagnostic_records
  FOR INSERT WITH CHECK (
    -- Super admins can insert anywhere (including NULL station_id)
    public.has_role(auth.uid(), 'super_admin') OR
    -- Non-super admins can ONLY insert with valid station_id matching their own
    (station_id IS NOT NULL AND (
      (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
    ))
  );

CREATE POLICY "EV records update control" ON public.ev_diagnostic_records
  FOR UPDATE USING (
    -- Super admins can update all records (including NULL station_id)
    public.has_role(auth.uid(), 'super_admin') OR
    -- Non-super admins can ONLY update records with matching station_id (excludes NULL)
    (station_id IS NOT NULL AND (
      (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
    ))
  );

CREATE POLICY "EV records delete control" ON public.ev_diagnostic_records
  FOR DELETE USING (
    -- Super admins can delete all records (including NULL station_id)
    public.has_role(auth.uid(), 'super_admin') OR
    -- Non-super admins can ONLY delete records with matching station_id (excludes NULL)
    (station_id IS NOT NULL AND (
      (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
    ))
  );

-- Create stricter PHEV diagnostic records policies - EXCLUDE NULL station_id records for non-super admins
CREATE POLICY "PHEV records access control" ON public.phev_diagnostic_records
  FOR SELECT USING (
    -- Super admins can see all records (including NULL station_id)
    public.has_role(auth.uid(), 'super_admin') OR
    -- Non-super admins can ONLY see records with matching station_id (excludes NULL)
    (station_id IS NOT NULL AND (
      (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
    ))
  );

CREATE POLICY "PHEV records insert control" ON public.phev_diagnostic_records
  FOR INSERT WITH CHECK (
    -- Super admins can insert anywhere (including NULL station_id)
    public.has_role(auth.uid(), 'super_admin') OR
    -- Non-super admins can ONLY insert with valid station_id matching their own
    (station_id IS NOT NULL AND (
      (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
    ))
  );

CREATE POLICY "PHEV records update control" ON public.phev_diagnostic_records
  FOR UPDATE USING (
    -- Super admins can update all records (including NULL station_id)
    public.has_role(auth.uid(), 'super_admin') OR
    -- Non-super admins can ONLY update records with matching station_id (excludes NULL)
    (station_id IS NOT NULL AND (
      (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
    ))
  );

CREATE POLICY "PHEV records delete control" ON public.phev_diagnostic_records
  FOR DELETE USING (
    -- Super admins can delete all records (including NULL station_id)
    public.has_role(auth.uid(), 'super_admin') OR
    -- Non-super admins can ONLY delete records with matching station_id (excludes NULL)
    (station_id IS NOT NULL AND (
      (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'technician') AND station_id = public.get_user_station_id(auth.uid())) OR
      (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND station_id = public.get_user_station_id(auth.uid()))
    ))
  );

-- Create stricter profile access policies - EXCLUDE NULL station_id profiles for non-super admins
CREATE POLICY "Profile access control" ON public.profiles
  FOR SELECT USING (
    -- Users can view their own profile
    id = auth.uid() OR
    -- Super admins can view all profiles (including NULL station_id)
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can ONLY view profiles with matching station_id (excludes NULL station_id profiles)
    (public.has_role(auth.uid(), 'station_admin') AND 
     station_id IS NOT NULL AND 
     station_id = public.get_user_station_id(auth.uid()) AND
     NOT public.has_role(id, 'super_admin'))
  );

CREATE POLICY "Profile update control" ON public.profiles
  FOR UPDATE USING (
    -- Users can update their own profile
    id = auth.uid() OR
    -- Super admins can update all profiles (including NULL station_id)
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can ONLY update profiles with matching station_id (excludes NULL station_id profiles)
    (public.has_role(auth.uid(), 'station_admin') AND 
     station_id IS NOT NULL AND 
     station_id = public.get_user_station_id(auth.uid()) AND
     NOT public.has_role(id, 'super_admin'))
  );
