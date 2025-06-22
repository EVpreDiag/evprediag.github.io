
-- Add new enum values (must be committed in separate transaction)
ALTER TYPE public.app_role ADD VALUE 'super_admin';
ALTER TYPE public.app_role ADD VALUE 'front_desk';
ALTER TYPE public.app_role ADD VALUE 'technician';

-- Create stations table for multi-tenant support
CREATE TABLE public.stations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  phone text,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on stations
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;

-- Add station_id columns to existing tables
ALTER TABLE public.profiles ADD COLUMN station_id uuid REFERENCES public.stations(id);
ALTER TABLE public.user_roles ADD COLUMN station_id uuid REFERENCES public.stations(id);
ALTER TABLE public.ev_diagnostic_records ADD COLUMN station_id uuid REFERENCES public.stations(id);
ALTER TABLE public.phev_diagnostic_records ADD COLUMN station_id uuid REFERENCES public.stations(id);
