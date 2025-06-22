
-- First, drop all existing conflicting RLS policies to start fresh
DROP POLICY IF EXISTS "Users can view profiles in their station" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view roles in their station" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can assign any role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can assign roles in their station" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view station roles" ON public.user_roles;

-- Clean up diagnostic records policies that might be problematic
DROP POLICY IF EXISTS "Users can view records in their station" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "Users can create records in their station" ON public.ev_diagnostic_records;
DROP POLICY IF EXISTS "Users can view PHEV records in their station" ON public.phev_diagnostic_records;
DROP POLICY IF EXISTS "Users can create PHEV records in their station" ON public.phev_diagnostic_records;

-- Create simple, non-recursive RLS policies for profiles
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

-- Create simple, non-recursive RLS policies for user_roles
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

-- Simplified policies for diagnostic records
CREATE POLICY "Users can view own records" 
  ON public.ev_diagnostic_records 
  FOR SELECT 
  USING (technician_id = auth.uid());

CREATE POLICY "Users can create own records" 
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
