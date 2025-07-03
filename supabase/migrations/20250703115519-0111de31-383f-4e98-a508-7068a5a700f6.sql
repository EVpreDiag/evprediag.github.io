
-- Drop the existing restrictive policies that might be conflicting
DROP POLICY IF EXISTS "Profile access control" ON public.profiles;
DROP POLICY IF EXISTS "Profile update control" ON public.profiles;

-- Create simpler, more permissive policies for profile management
CREATE POLICY "Users can manage their own profile" 
  ON public.profiles 
  FOR ALL 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow super admins to manage all profiles
CREATE POLICY "Super admins can manage all profiles" 
  ON public.profiles 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Allow station admins to view profiles in their station (but not super admin profiles)
CREATE POLICY "Station admins can view station profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    public.has_role(auth.uid(), 'station_admin') AND 
    station_id IS NOT NULL AND 
    station_id = public.get_user_station_id(auth.uid()) AND
    NOT public.has_role(id, 'super_admin')
  );
