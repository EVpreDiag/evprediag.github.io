
-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own station" ON public.stations;
DROP POLICY IF EXISTS "Super admins can manage all stations" ON public.stations;
DROP POLICY IF EXISTS "Anyone can create registration requests" ON public.station_registration_requests;
DROP POLICY IF EXISTS "Super admins can view all registration requests" ON public.station_registration_requests;
DROP POLICY IF EXISTS "Super admins can update all registration requests" ON public.station_registration_requests;
DROP POLICY IF EXISTS "Super admins can manage invitations" ON public.station_invitations;
DROP POLICY IF EXISTS "Anyone can read their own verification" ON public.email_verifications;
DROP POLICY IF EXISTS "System can manage verifications" ON public.email_verifications;
DROP POLICY IF EXISTS "Station admins can view pending users for their station" ON public.pending_users;
DROP POLICY IF EXISTS "Station admins can approve/reject pending users" ON public.pending_users;
DROP POLICY IF EXISTS "Users can view own EV records" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "Users can create own EV records" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "Super admins can view all EV records" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "Users can view own PHEV records" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "Users can create own PHEV records" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "Super admins can view all PHEV records" ON public.phev_diagnostic_records;

-- Now create all the policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid());

CREATE POLICY "Super admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can assign roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own station" 
  ON public.stations 
  FOR SELECT 
  USING (
    id IN (
      SELECT station_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage all stations" 
  ON public.stations 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can create registration requests" 
  ON public.station_registration_requests 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Super admins can view all registration requests" 
  ON public.station_registration_requests 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all registration requests" 
  ON public.station_registration_requests 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage invitations"
  ON public.station_invitations
  FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can read their own verification"
  ON public.email_verifications
  FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "System can manage verifications"
  ON public.email_verifications
  FOR ALL
  USING (true);

CREATE POLICY "Station admins can view pending users for their station"
  ON public.pending_users
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    (public.has_role(auth.uid(), 'station_admin') AND 
     station_id = public.get_user_station(auth.uid()))
  );

CREATE POLICY "Station admins can approve/reject pending users"
  ON public.pending_users
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    (public.has_role(auth.uid(), 'station_admin') AND 
     station_id = public.get_user_station(auth.uid()))
  );

CREATE POLICY "Users can view own EV records" 
  ON public.ev_diagnostic_records 
  FOR SELECT 
  USING (technician_id = auth.uid());

CREATE POLICY "Users can create own EV records" 
  ON public.ev_diagnostic_records 
  FOR INSERT 
  WITH CHECK (technician_id = auth.uid());

CREATE POLICY "Super admins can view all EV records" 
  ON public.ev_diagnostic_records 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view own PHEV records" 
  ON public.phev_diagnostic_records 
  FOR SELECT 
  USING (technician_id = auth.uid());

CREATE POLICY "Users can create own PHEV records" 
  ON public.phev_diagnostic_records 
  FOR INSERT 
  WITH CHECK (technician_id = auth.uid());

CREATE POLICY "Super admins can view all PHEV records" 
  ON public.phev_diagnostic_records 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'super_admin'));
