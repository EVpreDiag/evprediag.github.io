-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  billing_interval TEXT NOT NULL DEFAULT 'month', -- month, year
  features JSONB,
  is_trial BOOLEAN NOT NULL DEFAULT false,
  trial_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial', -- trial, active, past_due, cancelled, expired
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  usage_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_plans
CREATE POLICY "Anyone can view subscription plans" 
ON public.subscription_plans 
FOR SELECT 
USING (true);

CREATE POLICY "Super admins can manage subscription plans" 
ON public.subscription_plans 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'));

-- Create RLS policies for subscriptions
CREATE POLICY "Stations can view their own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (
  has_role(auth.uid(), 'super_admin') OR 
  (station_id = get_user_station_id(auth.uid()))
);

CREATE POLICY "Super admins can manage all subscriptions" 
ON public.subscriptions 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Station admins can update their subscription" 
ON public.subscriptions 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'super_admin') OR 
  (has_role(auth.uid(), 'station_admin') AND station_id = get_user_station_id(auth.uid()))
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_cents, billing_interval, features, is_trial, trial_days) VALUES
('6-Month Trial', 'Free 6-month trial with full access', 0, 'month', '{"diagnostic_forms": true, "reports": true, "user_management": true}', true, 180),
('Basic Plan', 'Monthly subscription for continued access', 4999, 'month', '{"diagnostic_forms": true, "reports": true, "user_management": true, "support": "email"}', false, 0),
('Annual Plan', 'Annual subscription with 2 months free', 49999, 'year', '{"diagnostic_forms": true, "reports": true, "user_management": true, "support": "priority", "analytics": true}', false, 0);

-- Function to check if station has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(station_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE station_id = station_id_param 
    AND (
      (status = 'trial' AND trial_end > now()) OR
      (status = 'active' AND current_period_end > now())
    )
  );
$$;

-- Function to get subscription status
CREATE OR REPLACE FUNCTION public.get_subscription_status(station_id_param UUID)
RETURNS TABLE(
  subscription_id UUID,
  status TEXT,
  plan_name TEXT,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  days_remaining INTEGER
)
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT 
    s.id,
    s.status,
    sp.name,
    s.trial_end,
    s.current_period_end,
    CASE 
      WHEN s.status = 'trial' THEN EXTRACT(DAY FROM s.trial_end - now())::INTEGER
      WHEN s.status = 'active' THEN EXTRACT(DAY FROM s.current_period_end - now())::INTEGER
      ELSE 0
    END as days_remaining
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON s.plan_id = sp.id
  WHERE s.station_id = station_id_param
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;

-- Function to automatically create trial subscription when station is approved
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_plan_id UUID;
BEGIN
  -- Get the trial plan ID
  SELECT id INTO trial_plan_id 
  FROM public.subscription_plans 
  WHERE is_trial = true 
  LIMIT 1;

  -- Create trial subscription for the new station
  IF trial_plan_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (
      station_id,
      plan_id,
      status,
      trial_start,
      trial_end,
      usage_limit
    ) VALUES (
      NEW.id,
      trial_plan_id,
      'trial',
      now(),
      now() + interval '6 months',
      1000  -- Default usage limit
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to auto-create trial subscription when station is created
CREATE TRIGGER create_trial_subscription_trigger
  AFTER INSERT ON public.stations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_trial_subscription();

-- Update existing stations with trial subscriptions
DO $$
DECLARE
  station_record RECORD;
  trial_plan_id UUID;
BEGIN
  -- Get the trial plan ID
  SELECT id INTO trial_plan_id 
  FROM public.subscription_plans 
  WHERE is_trial = true 
  LIMIT 1;

  -- Create trial subscriptions for existing stations that don't have one
  FOR station_record IN 
    SELECT s.id 
    FROM public.stations s 
    LEFT JOIN public.subscriptions sub ON s.id = sub.station_id 
    WHERE sub.id IS NULL
  LOOP
    INSERT INTO public.subscriptions (
      station_id,
      plan_id,
      status,
      trial_start,
      trial_end,
      usage_limit
    ) VALUES (
      station_record.id,
      trial_plan_id,
      'trial',
      now(),
      now() + interval '6 months',
      1000
    );
  END LOOP;
END $$;