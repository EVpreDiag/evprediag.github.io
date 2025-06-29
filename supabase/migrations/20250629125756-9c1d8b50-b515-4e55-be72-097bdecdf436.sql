
-- Drop existing policies to recreate them with proper role-based access
DROP POLICY IF EXISTS "Users can view own EV records" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "Users can create own EV records" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "Super admins can view all EV records" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "Super admins can update all EV records" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "Super admins can delete all EV records" ON public.ev_diagnostic_records;

DROP POLICY IF EXISTS "Users can view own PHEV records" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "Users can create own PHEV records" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "Super admins can view all PHEV records" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "Super admins can update all PHEV records" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "Super admins can delete all PHEV records" ON public.phev_diagnostic_records;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;

-- Create helper function to get user's station
CREATE OR REPLACE FUNCTION public.get_user_station_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT station_id FROM public.profiles WHERE id = user_id;
$$;

-- Create function to check if user has station admin role for a specific station
CREATE OR REPLACE FUNCTION public.is_station_admin_for_station(user_id uuid, station_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = is_station_admin_for_station.user_id
      AND ur.role = 'station_admin'
      AND p.station_id = is_station_admin_for_station.station_id
  );
$$;

-- Create function to check if user has technician role for a specific station
CREATE OR REPLACE FUNCTION public.is_technician_for_station(user_id uuid, station_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = is_technician_for_station.user_id
      AND ur.role = 'technician'
      AND p.station_id = is_technician_for_station.station_id
  );
$$;

-- Create function to check if user has front_desk role for a specific station
CREATE OR REPLACE FUNCTION public.is_front_desk_for_station(user_id uuid, station_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = is_front_desk_for_station.user_id
      AND ur.role = 'front_desk'
      AND p.station_id = is_front_desk_for_station.station_id
  );
$$;

-- EV Diagnostic Records Policies
CREATE POLICY "EV records access control" ON public.ev_diagnostic_records
  FOR SELECT USING (
    -- Super admins can see all records
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can see records from their station
    (public.has_role(auth.uid(), 'station_admin') AND public.is_station_admin_for_station(auth.uid(), station_id)) OR
    -- Technicians can see records from their station
    (public.has_role(auth.uid(), 'technician') AND public.is_technician_for_station(auth.uid(), station_id)) OR
    -- Front desk can only see their own records
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid())
  );

CREATE POLICY "EV records insert control" ON public.ev_diagnostic_records
  FOR INSERT WITH CHECK (
    -- Super admins can insert anywhere
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can insert for their station
    (public.has_role(auth.uid(), 'station_admin') AND public.is_station_admin_for_station(auth.uid(), station_id)) OR
    -- Technicians can insert for their station
    (public.has_role(auth.uid(), 'technician') AND public.is_technician_for_station(auth.uid(), station_id)) OR
    -- Front desk can insert for their station (technician_id must be themselves)
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND public.is_front_desk_for_station(auth.uid(), station_id))
  );

CREATE POLICY "EV records update control" ON public.ev_diagnostic_records
  FOR UPDATE USING (
    -- Super admins can update all records
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can update records from their station
    (public.has_role(auth.uid(), 'station_admin') AND public.is_station_admin_for_station(auth.uid(), station_id)) OR
    -- Technicians can update records from their station
    (public.has_role(auth.uid(), 'technician') AND public.is_technician_for_station(auth.uid(), station_id)) OR
    -- Front desk can only update their own records
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid())
  );

CREATE POLICY "EV records delete control" ON public.ev_diagnostic_records
  FOR DELETE USING (
    -- Super admins can delete all records
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can delete records from their station
    (public.has_role(auth.uid(), 'station_admin') AND public.is_station_admin_for_station(auth.uid(), station_id))
  );

-- PHEV Diagnostic Records Policies
CREATE POLICY "PHEV records access control" ON public.phev_diagnostic_records
  FOR SELECT USING (
    -- Super admins can see all records
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can see records from their station
    (public.has_role(auth.uid(), 'station_admin') AND public.is_station_admin_for_station(auth.uid(), station_id)) OR
    -- Technicians can see records from their station
    (public.has_role(auth.uid(), 'technician') AND public.is_technician_for_station(auth.uid(), station_id)) OR
    -- Front desk can only see their own records
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid())
  );

CREATE POLICY "PHEV records insert control" ON public.phev_diagnostic_records
  FOR INSERT WITH CHECK (
    -- Super admins can insert anywhere
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can insert for their station
    (public.has_role(auth.uid(), 'station_admin') AND public.is_station_admin_for_station(auth.uid(), station_id)) OR
    -- Technicians can insert for their station
    (public.has_role(auth.uid(), 'technician') AND public.is_technician_for_station(auth.uid(), station_id)) OR
    -- Front desk can insert for their station (technician_id must be themselves)
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid() AND public.is_front_desk_for_station(auth.uid(), station_id))
  );

CREATE POLICY "PHEV records update control" ON public.phev_diagnostic_records
  FOR UPDATE USING (
    -- Super admins can update all records
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can update records from their station
    (public.has_role(auth.uid(), 'station_admin') AND public.is_station_admin_for_station(auth.uid(), station_id)) OR
    -- Technicians can update records from their station
    (public.has_role(auth.uid(), 'technician') AND public.is_technician_for_station(auth.uid(), station_id)) OR
    -- Front desk can only update their own records
    (public.has_role(auth.uid(), 'front_desk') AND technician_id = auth.uid())
  );

CREATE POLICY "PHEV records delete control" ON public.phev_diagnostic_records
  FOR DELETE USING (
    -- Super admins can delete all records
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can delete records from their station
    (public.has_role(auth.uid(), 'station_admin') AND public.is_station_admin_for_station(auth.uid(), station_id))
  );

-- Profiles Policies
CREATE POLICY "Profile access control" ON public.profiles
  FOR SELECT USING (
    -- Users can view their own profile
    id = auth.uid() OR
    -- Super admins can view all profiles
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can view profiles from their station
    (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid()))
  );

CREATE POLICY "Profile update control" ON public.profiles
  FOR UPDATE USING (
    -- Users can update their own profile
    id = auth.uid() OR
    -- Super admins can update all profiles
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can update profiles from their station
    (public.has_role(auth.uid(), 'station_admin') AND station_id = public.get_user_station_id(auth.uid()))
  );

-- User Roles Policies
CREATE POLICY "User roles access control" ON public.user_roles
  FOR SELECT USING (
    -- Users can view their own roles
    user_id = auth.uid() OR
    -- Super admins can view all roles
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can view roles for users in their station
    (public.has_role(auth.uid(), 'station_admin') AND 
     station_id = public.get_user_station_id(auth.uid()) AND
     public.get_user_station_id(user_id) = public.get_user_station_id(auth.uid()))
  );

CREATE POLICY "User roles assign control" ON public.user_roles
  FOR INSERT WITH CHECK (
    -- Super admins can assign any role
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can assign technician and front_desk roles to users in their station
    (public.has_role(auth.uid(), 'station_admin') AND 
     role IN ('technician', 'front_desk') AND
     station_id = public.get_user_station_id(auth.uid()) AND
     public.get_user_station_id(user_id) = public.get_user_station_id(auth.uid()))
  );

CREATE POLICY "User roles update control" ON public.user_roles
  FOR UPDATE USING (
    -- Super admins can update any role
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can update technician and front_desk roles in their station
    (public.has_role(auth.uid(), 'station_admin') AND 
     role IN ('technician', 'front_desk') AND
     station_id = public.get_user_station_id(auth.uid()) AND
     public.get_user_station_id(user_id) = public.get_user_station_id(auth.uid()))
  );

CREATE POLICY "User roles delete control" ON public.user_roles
  FOR DELETE USING (
    -- Super admins can delete any role
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can delete technician and front_desk roles in their station
    (public.has_role(auth.uid(), 'station_admin') AND 
     role IN ('technician', 'front_desk') AND
     station_id = public.get_user_station_id(auth.uid()) AND
     public.get_user_station_id(user_id) = public.get_user_station_id(auth.uid()))
  );

-- Stations Policies
CREATE POLICY "Stations access control" ON public.stations
  FOR SELECT USING (
    -- Super admins can view all stations
    public.has_role(auth.uid(), 'super_admin') OR
    -- Users can view their assigned station
    id = public.get_user_station_id(auth.uid())
  );

CREATE POLICY "Stations management control" ON public.stations
  FOR ALL USING (
    -- Only super admins can manage stations
    public.has_role(auth.uid(), 'super_admin')
  );
