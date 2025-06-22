
-- Create station invitations table for tracking sent invites
CREATE TABLE public.station_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_registration_id UUID REFERENCES public.station_registration_requests(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create email verifications table for tracking verification status
CREATE TABLE public.email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  verification_token TEXT NOT NULL UNIQUE,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('station_registration', 'user_signup')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pending users table for users awaiting station admin approval
CREATE TABLE public.pending_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT
);

-- Add password hash and email verification to station registration requests
ALTER TABLE public.station_registration_requests 
ADD COLUMN password_hash TEXT,
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_token TEXT,
ADD COLUMN invitation_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN invitation_token TEXT;

-- Enable RLS on new tables
ALTER TABLE public.station_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for station_invitations
CREATE POLICY "Super admins can manage invitations"
  ON public.station_invitations
  FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Create RLS policies for email_verifications
CREATE POLICY "Anyone can read their own verification"
  ON public.email_verifications
  FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "System can manage verifications"
  ON public.email_verifications
  FOR ALL
  USING (true);

-- Create RLS policies for pending_users
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

-- Create function to generate secure tokens
CREATE OR REPLACE FUNCTION public.generate_token()
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT encode(gen_random_bytes(32), 'hex');
$$;

-- Create function to send station invitation
CREATE OR REPLACE FUNCTION public.create_station_invitation(
  _registration_id UUID,
  _email TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
