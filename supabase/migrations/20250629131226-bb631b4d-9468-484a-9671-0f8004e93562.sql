
-- Drop existing profile policies to recreate with stricter restrictions
DROP POLICY IF EXISTS "Profile access control" ON public.profiles;
DROP POLICY IF EXISTS "Profile update control" ON public.profiles;

-- Drop existing user roles policies to recreate with stricter restrictions  
DROP POLICY IF EXISTS "User roles access control" ON public.user_roles;
DROP POLICY IF EXISTS "User roles assign control" ON public.user_roles;
DROP POLICY IF EXISTS "User roles update control" ON public.user_roles;
DROP POLICY IF EXISTS "User roles delete control" ON public.user_roles;

-- Create stricter profile access policies
CREATE POLICY "Profile access control" ON public.profiles
  FOR SELECT USING (
    -- Users can view their own profile
    id = auth.uid() OR
    -- Super admins can view all profiles
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can ONLY view profiles from their station AND exclude super admins
    (public.has_role(auth.uid(), 'station_admin') AND 
     station_id = public.get_user_station_id(auth.uid()) AND
     NOT public.has_role(id, 'super_admin'))
  );

CREATE POLICY "Profile update control" ON public.profiles
  FOR UPDATE USING (
    -- Users can update their own profile
    id = auth.uid() OR
    -- Super admins can update all profiles
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can ONLY update profiles from their station AND exclude super admins
    (public.has_role(auth.uid(), 'station_admin') AND 
     station_id = public.get_user_station_id(auth.uid()) AND
     NOT public.has_role(id, 'super_admin'))
  );

-- Create stricter user roles access policies
CREATE POLICY "User roles access control" ON public.user_roles
  FOR SELECT USING (
    -- Users can view their own roles
    user_id = auth.uid() OR
    -- Super admins can view all roles
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can view roles for users in their station BUT NOT super admin roles
    (public.has_role(auth.uid(), 'station_admin') AND 
     station_id = public.get_user_station_id(auth.uid()) AND
     public.get_user_station_id(user_id) = public.get_user_station_id(auth.uid()) AND
     role != 'super_admin' AND
     NOT public.has_role(user_id, 'super_admin'))
  );

CREATE POLICY "User roles assign control" ON public.user_roles
  FOR INSERT WITH CHECK (
    -- Super admins can assign any role
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can ONLY assign technician and front_desk roles to users in their station (NOT super admin roles)
    (public.has_role(auth.uid(), 'station_admin') AND 
     role IN ('technician', 'front_desk') AND
     role != 'super_admin' AND
     station_id = public.get_user_station_id(auth.uid()) AND
     public.get_user_station_id(user_id) = public.get_user_station_id(auth.uid()) AND
     NOT public.has_role(user_id, 'super_admin'))
  );

CREATE POLICY "User roles update control" ON public.user_roles
  FOR UPDATE USING (
    -- Super admins can update any role
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can ONLY update technician and front_desk roles in their station (NOT super admin roles)
    (public.has_role(auth.uid(), 'station_admin') AND 
     role IN ('technician', 'front_desk') AND
     role != 'super_admin' AND
     station_id = public.get_user_station_id(auth.uid()) AND
     public.get_user_station_id(user_id) = public.get_user_station_id(auth.uid()) AND
     NOT public.has_role(user_id, 'super_admin'))
  );

CREATE POLICY "User roles delete control" ON public.user_roles
  FOR DELETE USING (
    -- Super admins can delete any role
    public.has_role(auth.uid(), 'super_admin') OR
    -- Station admins can ONLY delete technician and front_desk roles in their station (NOT super admin roles)
    (public.has_role(auth.uid(), 'station_admin') AND 
     role IN ('technician', 'front_desk') AND
     role != 'super_admin' AND
     station_id = public.get_user_station_id(auth.uid()) AND
     public.get_user_station_id(user_id) = public.get_user_station_id(auth.uid()) AND
     NOT public.has_role(user_id, 'super_admin'))
  );
