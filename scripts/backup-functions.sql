-- ==============================================
-- DATABASE FUNCTIONS BACKUP
-- ==============================================

-- Function: get_user_station_id
CREATE OR REPLACE FUNCTION public.get_user_station_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT station_id FROM public.profiles WHERE id = user_id;
$function$;

-- Function: is_station_admin_for_station
CREATE OR REPLACE FUNCTION public.is_station_admin_for_station(user_id uuid, station_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = is_station_admin_for_station.user_id
      AND ur.role = 'station_admin'
      AND p.station_id = is_station_admin_for_station.station_id
  );
$function$;

-- Function: is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_super_admin.user_id
      AND role = 'super_admin'
  );
$function$;

-- Function: get_user_station
CREATE OR REPLACE FUNCTION public.get_user_station(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT station_id
  FROM public.profiles
  WHERE id = _user_id
$function$;

-- Function: can_manage_station_roles
CREATE OR REPLACE FUNCTION public.can_manage_station_roles(_user_id uuid, _station_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT 
    public.has_role(_user_id, 'super_admin') OR
    (
      public.has_role(_user_id, 'admin') AND
      public.get_user_station(_user_id) = _station_id
    )
$function$;

-- Function: is_technician_for_station
CREATE OR REPLACE FUNCTION public.is_technician_for_station(user_id uuid, station_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = is_technician_for_station.user_id
      AND ur.role = 'technician'
      AND p.station_id = is_technician_for_station.station_id
  );
$function$;

-- Function: is_front_desk_for_station
CREATE OR REPLACE FUNCTION public.is_front_desk_for_station(user_id uuid, station_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.profiles p ON p.id = ur.user_id
    WHERE ur.user_id = is_front_desk_for_station.user_id
      AND ur.role = 'front_desk'
      AND p.station_id = is_front_desk_for_station.station_id
  );
$function$;

-- Function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
      AND role = 'admin'
  );
$function$;

-- Function: is_station_admin
CREATE OR REPLACE FUNCTION public.is_station_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = is_station_admin.user_id
      AND role = 'station_admin'
  );
$function$;

-- Function: generate_token
CREATE OR REPLACE FUNCTION public.generate_token()
RETURNS text
LANGUAGE sql
AS $function$
  SELECT encode(gen_random_bytes(32), 'hex');
$function$;

-- Function: create_station_invitation
CREATE OR REPLACE FUNCTION public.create_station_invitation(_registration_id uuid, _email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  _invitation_id UUID;
  _token TEXT;
BEGIN
  -- Generate secure token
  _token := public.generate_token();
  
  -- Create invitation record
  INSERT INTO public.station_invitations (
    station_registration_id,
    email,
    invitation_token,
    expires_at,
    created_by
  ) VALUES (
    _registration_id,
    _email,
    _token,
    now() + interval '7 days',
    auth.uid()
  ) RETURNING id INTO _invitation_id;
  
  -- Mark registration as invitation sent
  UPDATE public.station_registration_requests
  SET invitation_sent = TRUE,
      invitation_token = _token
  WHERE id = _registration_id;
  
  RETURN _invitation_id;
END;
$function$;

-- Function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  station_id_value TEXT;
BEGIN
  -- Get the station_id from raw_user_meta_data only
  station_id_value := NEW.raw_user_meta_data->>'station_id';
  
  INSERT INTO public.profiles (id, username, full_name, station_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN station_id_value IS NOT NULL AND station_id_value != '' 
      THEN station_id_value::uuid 
      ELSE NULL 
    END
  );
  RETURN NEW;
END;
$function$;

-- Function: get_user_roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS TABLE(role app_role)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
$function$;

-- ==============================================
-- TRIGGERS BACKUP
-- ==============================================

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();