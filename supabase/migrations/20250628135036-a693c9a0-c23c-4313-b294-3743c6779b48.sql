
-- Add RLS policy to allow anonymous users to insert their signup data into pending_users table
CREATE POLICY "Allow anonymous users to insert signup data" 
ON public.pending_users 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Also allow authenticated users to insert (in case they're signed up but inserting pending data)
CREATE POLICY "Allow authenticated users to insert pending data" 
ON public.pending_users 
FOR INSERT 
TO authenticated
WITH CHECK (true);
