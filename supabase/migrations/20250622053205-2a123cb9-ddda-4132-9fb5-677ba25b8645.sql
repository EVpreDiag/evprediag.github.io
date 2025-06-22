
-- Create station registration requests table
CREATE TABLE public.station_registration_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL,
  business_type text,
  contact_person_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  address text,
  city text,
  state text,
  zip_code text,
  website text,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_user_id uuid, -- Will be set when the station admin user is created
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on station registration requests
ALTER TABLE public.station_registration_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for station registration requests
CREATE POLICY "Super admins can view all registration requests" 
  ON public.station_registration_requests 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update all registration requests" 
  ON public.station_registration_requests 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can create registration requests" 
  ON public.station_registration_requests 
  FOR INSERT 
  WITH CHECK (true);

-- Update user_roles policies to allow station admins to manage their station users
DROP POLICY IF EXISTS "Admins can assign roles in their station" ON public.user_roles;

CREATE POLICY "Station admins can assign roles in their station" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR
    (
      public.has_role(auth.uid(), 'station_admin') AND
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      ) AND
      role IN ('technician', 'front_desk')
    )
  );

CREATE POLICY "Station admins can remove roles in their station" 
  ON public.user_roles 
  FOR DELETE 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    (
      public.has_role(auth.uid(), 'station_admin') AND
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      ) AND
      role IN ('technician', 'front_desk')
    )
  );

-- Update diagnostic records policies for technician role
DROP POLICY IF EXISTS "Users can view records in their station" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "Users can view PHEV records in their station" ON public.phev_diagnostic_records;

CREATE POLICY "Users can view EV records based on role" 
  ON public.ev_diagnostic_records 
  FOR SELECT 
  USING (
    technician_id = auth.uid() OR
    public.has_role(auth.uid(), 'super_admin') OR
    (
      public.has_role(auth.uid(), 'technician') AND
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    ) OR
    (
      public.has_role(auth.uid(), 'station_admin') AND
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view PHEV records based on role" 
  ON public.phev_diagnostic_records 
  FOR SELECT 
  USING (
    technician_id = auth.uid() OR
    public.has_role(auth.uid(), 'super_admin') OR
    (
      public.has_role(auth.uid(), 'technician') AND
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    ) OR
    (
      public.has_role(auth.uid(), 'station_admin') AND
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Update policies for record editing based on roles
CREATE POLICY "Users can update EV records based on role" 
  ON public.ev_diagnostic_records 
  FOR UPDATE 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    (
      public.has_role(auth.uid(), 'technician') AND
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    ) OR
    (
      public.has_role(auth.uid(), 'station_admin') AND
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    ) OR
    (
      public.has_role(auth.uid(), 'front_desk') AND
      technician_id = auth.uid()
    )
  );

CREATE POLICY "Users can update PHEV records based on role" 
  ON public.phev_diagnostic_records 
  FOR UPDATE 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    (
      public.has_role(auth.uid(), 'technician') AND
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    ) OR
    (
      public.has_role(auth.uid(), 'station_admin') AND
      station_id IN (
        SELECT station_id 
        FROM public.profiles 
        WHERE id = auth.uid()
      )
    ) OR
    (
      public.has_role(auth.uid(), 'front_desk') AND
      technician_id = auth.uid()
    )
  );

-- Create function to check if user is station admin
CREATE OR REPLACE FUNCTION public.is_station_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_station_admin.user_id
      AND role = 'station_admin'
  );
$$;
