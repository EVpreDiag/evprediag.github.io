
-- Update existing user_roles to use new role names
UPDATE public.user_roles SET role = 'technician' WHERE role = 'tech';
UPDATE public.user_roles SET role = 'front_desk' WHERE role = 'service_desk';

-- Update security functions to handle new roles and multi-tenancy
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_super_admin.user_id
      AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_station(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT station_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- Function to check if user can manage roles in a station
CREATE OR REPLACE FUNCTION public.can_manage_station_roles(_user_id uuid, _station_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    public.has_role(_user_id, 'super_admin') OR
    (
      public.has_role(_user_id, 'admin') AND
      public.get_user_station(_user_id) = _station_id
    )
$$;

-- Create RLS policies for stations
CREATE POLICY "Super admins can view all stations" 
  ON public.stations 
  FOR SELECT 
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

CREATE POLICY "Super admins can create stations" 
  ON public.stations 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all stations" 
  ON public.stations 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Update profiles RLS policies for multi-tenant
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view profiles in their station" 
  ON public.profiles 
  FOR SELECT 
  USING (
    id = auth.uid() OR
    (station_id IS NOT NULL AND station_id IN (
      SELECT station_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (id = auth.uid());

-- Update user_roles RLS policies for multi-tenant
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view roles in their station" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR
    public.has_role(auth.uid(), 'super_admin') OR
    (
      public.has_role(auth.uid(), 'admin') AND 
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Super admins can assign any role" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can assign roles in their station" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND
    station_id IN (
      SELECT station_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    ) AND
    role != 'super_admin' AND
    role != 'admin'
  );

-- Update diagnostic records RLS policies for multi-tenant
CREATE POLICY "Users can view records in their station" 
  ON public.ev_diagnostic_records 
  FOR SELECT 
  USING (
    technician_id = auth.uid() OR
    public.has_role(auth.uid(), 'super_admin') OR
    (
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create records in their station" 
  ON public.ev_diagnostic_records 
  FOR INSERT 
  WITH CHECK (
    technician_id = auth.uid() AND
    station_id IN (
      SELECT station_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view PHEV records in their station" 
  ON public.phev_diagnostic_records 
  FOR SELECT 
  USING (
    technician_id = auth.uid() OR
    public.has_role(auth.uid(), 'super_admin') OR
    (
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create PHEV records in their station" 
  ON public.phev_diagnostic_records 
  FOR INSERT 
  WITH CHECK (
    technician_id = auth.uid() AND
    station_id IN (
      SELECT station_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );
