
-- Add policy to allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (id = auth.uid());
