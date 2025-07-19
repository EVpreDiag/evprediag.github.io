-- ==============================================
-- ROW LEVEL SECURITY POLICIES BACKUP
-- ==============================================

-- ==============================================
-- STATIONS TABLE POLICIES
-- ==============================================

CREATE POLICY "Stations access control" 
ON public.stations 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (id = get_user_station_id(auth.uid())));

CREATE POLICY "Stations management control" 
ON public.stations 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can create stations" 
ON public.stations 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage all stations" 
ON public.stations 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update all stations" 
ON public.stations 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can view all stations" 
ON public.stations 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view their own station" 
ON public.stations 
FOR SELECT 
USING (id IN (SELECT profiles.station_id FROM profiles WHERE profiles.id = auth.uid()));

-- ==============================================
-- PROFILES TABLE POLICIES
-- ==============================================

CREATE POLICY "Station admins can view station profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'station_admin'::app_role) AND (station_id IS NOT NULL) AND (station_id = get_user_station_id(auth.uid())) AND (NOT has_role(id, 'super_admin'::app_role)));

CREATE POLICY "Super admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role)) 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can manage their own profile" 
ON public.profiles 
FOR ALL 
USING (id = auth.uid()) 
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile or admins can update all" 
ON public.profiles 
FOR UPDATE 
USING ((id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Users can view own profile or admins can view all" 
ON public.profiles 
FOR SELECT 
USING ((id = auth.uid()) OR is_admin(auth.uid()));

-- ==============================================
-- USER_ROLES TABLE POLICIES
-- ==============================================

CREATE POLICY "Only admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can view user roles" 
ON public.user_roles 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "User roles access control" 
ON public.user_roles 
FOR SELECT 
USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role) OR (has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid())) AND (get_user_station_id(user_id) = get_user_station_id(auth.uid())) AND (role <> 'super_admin'::app_role) AND (NOT has_role(user_id, 'super_admin'::app_role))));

CREATE POLICY "User roles assign control" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR (has_role(auth.uid(), 'station_admin'::app_role) AND (role = ANY (ARRAY['technician'::app_role, 'front_desk'::app_role])) AND (role <> 'super_admin'::app_role) AND (station_id = get_user_station_id(auth.uid())) AND (get_user_station_id(user_id) = get_user_station_id(auth.uid())) AND (NOT has_role(user_id, 'super_admin'::app_role))));

CREATE POLICY "User roles delete control" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (has_role(auth.uid(), 'station_admin'::app_role) AND (role = ANY (ARRAY['technician'::app_role, 'front_desk'::app_role])) AND (role <> 'super_admin'::app_role) AND (station_id = get_user_station_id(auth.uid())) AND (get_user_station_id(user_id) = get_user_station_id(auth.uid())) AND (NOT has_role(user_id, 'super_admin'::app_role))));

CREATE POLICY "User roles update control" 
ON public.user_roles 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (has_role(auth.uid(), 'station_admin'::app_role) AND (role = ANY (ARRAY['technician'::app_role, 'front_desk'::app_role])) AND (role <> 'super_admin'::app_role) AND (station_id = get_user_station_id(auth.uid())) AND (get_user_station_id(user_id) = get_user_station_id(auth.uid())) AND (NOT has_role(user_id, 'super_admin'::app_role))));

-- ==============================================
-- STATION_REGISTRATION_REQUESTS TABLE POLICIES
-- ==============================================

CREATE POLICY "Anyone can create registration requests" 
ON public.station_registration_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Super admins can update all registration requests" 
ON public.station_registration_requests 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can view all registration requests" 
ON public.station_registration_requests 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- ==============================================
-- STATION_INVITATIONS TABLE POLICIES
-- ==============================================

CREATE POLICY "Super admins can manage invitations" 
ON public.station_invitations 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- ==============================================
-- EMAIL_VERIFICATIONS TABLE POLICIES
-- ==============================================

CREATE POLICY "Anyone can read their own verification" 
ON public.email_verifications 
FOR SELECT 
USING (email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text);

CREATE POLICY "System can manage verifications" 
ON public.email_verifications 
FOR ALL 
USING (true);

-- ==============================================
-- PENDING_USERS TABLE POLICIES
-- ==============================================

CREATE POLICY "Allow anonymous users to insert signup data" 
ON public.pending_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert pending data" 
ON public.pending_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Station admins can approve/reject pending users" 
ON public.pending_users 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station(auth.uid()))));

CREATE POLICY "Station admins can view pending users for their station" 
ON public.pending_users 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station(auth.uid()))));

-- ==============================================
-- EV_DIAGNOSTIC_RECORDS TABLE POLICIES
-- ==============================================

CREATE POLICY "Authenticated users can insert EV diagnostic records" 
ON public.ev_diagnostic_records 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "EV records access control" 
ON public.ev_diagnostic_records 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR ((station_id IS NOT NULL) AND ((has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid()) AND (station_id = get_user_station_id(auth.uid()))))));

CREATE POLICY "EV records delete control" 
ON public.ev_diagnostic_records 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR ((station_id IS NOT NULL) AND ((has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid()) AND (station_id = get_user_station_id(auth.uid()))))));

CREATE POLICY "EV records insert control" 
ON public.ev_diagnostic_records 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR ((station_id IS NOT NULL) AND ((has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid()) AND (station_id = get_user_station_id(auth.uid()))))));

CREATE POLICY "EV records update control" 
ON public.ev_diagnostic_records 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR ((station_id IS NOT NULL) AND ((has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid()) AND (station_id = get_user_station_id(auth.uid()))))));

CREATE POLICY "Users can create EV records with own technician_id" 
ON public.ev_diagnostic_records 
FOR INSERT 
WITH CHECK (technician_id = auth.uid());

CREATE POLICY "Users can create own records" 
ON public.ev_diagnostic_records 
FOR INSERT 
WITH CHECK (technician_id = auth.uid());

CREATE POLICY "Users can delete own EV records or admins can delete all" 
ON public.ev_diagnostic_records 
FOR DELETE 
USING ((technician_id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own EV diagnostic records" 
ON public.ev_diagnostic_records 
FOR DELETE 
USING (technician_id = auth.uid());

CREATE POLICY "Users can update EV records based on role" 
ON public.ev_diagnostic_records 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id IN (SELECT profiles.station_id FROM profiles WHERE profiles.id = auth.uid()))) OR (has_role(auth.uid(), 'station_admin'::app_role) AND (station_id IN (SELECT profiles.station_id FROM profiles WHERE profiles.id = auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid())));

CREATE POLICY "Users can update own EV records or admins can update all" 
ON public.ev_diagnostic_records 
FOR UPDATE 
USING ((technician_id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Users can update their own EV diagnostic records" 
ON public.ev_diagnostic_records 
FOR UPDATE 
USING (technician_id = auth.uid());

CREATE POLICY "Users can view EV diagnostic records" 
ON public.ev_diagnostic_records 
FOR SELECT 
USING (true);

CREATE POLICY "Users can view EV records based on role" 
ON public.ev_diagnostic_records 
FOR SELECT 
USING ((technician_id = auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id IN (SELECT profiles.station_id FROM profiles WHERE profiles.id = auth.uid()))) OR (has_role(auth.uid(), 'station_admin'::app_role) AND (station_id IN (SELECT profiles.station_id FROM profiles WHERE profiles.id = auth.uid()))));

CREATE POLICY "Users can view own EV records or admins can view all" 
ON public.ev_diagnostic_records 
FOR SELECT 
USING ((technician_id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Users can view own records" 
ON public.ev_diagnostic_records 
FOR SELECT 
USING (technician_id = auth.uid());

-- ==============================================
-- PHEV_DIAGNOSTIC_RECORDS TABLE POLICIES
-- ==============================================

CREATE POLICY "Authenticated users can insert PHEV diagnostic records" 
ON public.phev_diagnostic_records 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "PHEV records access control" 
ON public.phev_diagnostic_records 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR ((station_id IS NOT NULL) AND ((has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid()) AND (station_id = get_user_station_id(auth.uid()))))));

CREATE POLICY "PHEV records delete control" 
ON public.phev_diagnostic_records 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR ((station_id IS NOT NULL) AND ((has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid()) AND (station_id = get_user_station_id(auth.uid()))))));

CREATE POLICY "PHEV records insert control" 
ON public.phev_diagnostic_records 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR ((station_id IS NOT NULL) AND ((has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid()) AND (station_id = get_user_station_id(auth.uid()))))));

CREATE POLICY "PHEV records update control" 
ON public.phev_diagnostic_records 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR ((station_id IS NOT NULL) AND ((has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid()) AND (station_id = get_user_station_id(auth.uid()))))));

CREATE POLICY "Users can create PHEV records with own technician_id" 
ON public.phev_diagnostic_records 
FOR INSERT 
WITH CHECK (technician_id = auth.uid());

-- Additional PHEV policies continue in same pattern...

-- ==============================================
-- ICE_DIAGNOSTIC_RECORDS TABLE POLICIES
-- ==============================================

CREATE POLICY "ICE records access control" 
ON public.ice_diagnostic_records 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR ((station_id IS NOT NULL) AND ((has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid()) AND (station_id = get_user_station_id(auth.uid()))))));

CREATE POLICY "ICE records delete control" 
ON public.ice_diagnostic_records 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR ((station_id IS NOT NULL) AND ((has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid()) AND (station_id = get_user_station_id(auth.uid()))))));

CREATE POLICY "ICE records insert control" 
ON public.ice_diagnostic_records 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR ((station_id IS NOT NULL) AND ((has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid()) AND (station_id = get_user_station_id(auth.uid()))))));

CREATE POLICY "ICE records update control" 
ON public.ice_diagnostic_records 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR ((station_id IS NOT NULL) AND ((has_role(auth.uid(), 'station_admin'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'technician'::app_role) AND (station_id = get_user_station_id(auth.uid()))) OR (has_role(auth.uid(), 'front_desk'::app_role) AND (technician_id = auth.uid()) AND (station_id = get_user_station_id(auth.uid()))))));

CREATE POLICY "Users can create ICE records with own technician_id" 
ON public.ice_diagnostic_records 
FOR INSERT 
WITH CHECK (technician_id = auth.uid());