
-- Create a table for ICE diagnostic records
CREATE TABLE public.ice_diagnostic_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  technician_id UUID NOT NULL,
  station_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- General Information
  customer_name TEXT NOT NULL,
  vin TEXT NOT NULL,
  ro_number TEXT NOT NULL,
  vehicle_make TEXT,
  model TEXT,
  year TEXT,
  mileage TEXT,
  engine_size TEXT,
  fuel_type TEXT,
  
  -- Engine Performance
  engine_starting TEXT,
  engine_starting_details TEXT,
  idle_quality TEXT,
  idle_quality_details TEXT,
  acceleration_issues TEXT,
  acceleration_details TEXT,
  power_loss TEXT,
  power_loss_details TEXT,
  engine_stalling TEXT,
  engine_stalling_details TEXT,
  rough_running TEXT,
  rough_running_details TEXT,
  
  -- Engine Noises & Vibrations
  engine_knocking TEXT,
  engine_knocking_details TEXT,
  unusual_noises TEXT,
  unusual_noises_details TEXT,
  excessive_vibration TEXT,
  vibration_details TEXT,
  
  -- Fuel System
  fuel_consumption TEXT,
  fuel_consumption_details TEXT,
  fuel_quality_issues TEXT,
  fuel_quality_details TEXT,
  fuel_pump_issues TEXT,
  fuel_pump_details TEXT,
  
  -- Exhaust System
  exhaust_smoke TEXT,
  exhaust_smoke_details TEXT,
  exhaust_smell TEXT,
  exhaust_smell_details TEXT,
  catalytic_converter_issues TEXT,
  catalytic_converter_details TEXT,
  
  -- Cooling System
  overheating TEXT,
  overheating_details TEXT,
  coolant_leaks TEXT,
  coolant_leak_details TEXT,
  radiator_issues TEXT,
  radiator_details TEXT,
  
  -- Oil System
  oil_pressure_issues TEXT,
  oil_pressure_details TEXT,
  oil_leaks TEXT,
  oil_leak_details TEXT,
  oil_consumption TEXT,
  oil_consumption_details TEXT,
  
  -- Electrical System
  battery_issues TEXT,
  battery_details TEXT,
  alternator_issues TEXT,
  alternator_details TEXT,
  starter_issues TEXT,
  starter_details TEXT,
  check_engine_light TEXT,
  check_engine_details TEXT,
  
  -- Transmission
  transmission_issues TEXT,
  transmission_details TEXT,
  gear_shifting TEXT,
  gear_shifting_details TEXT,
  clutch_issues TEXT,
  clutch_details TEXT,
  
  -- Environmental Conditions
  temperature_during_issue TEXT,
  driving_conditions TEXT[],
  other_driving_conditions TEXT,
  maintenance_history TEXT,
  recent_repairs TEXT,
  
  FOREIGN KEY (station_id) REFERENCES public.stations(id)
);

-- Enable Row Level Security
ALTER TABLE public.ice_diagnostic_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ICE diagnostic records
CREATE POLICY "ICE records access control" 
  ON public.ice_diagnostic_records 
  FOR SELECT 
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    (
      station_id IS NOT NULL AND (
        (has_role(auth.uid(), 'station_admin'::app_role) AND station_id = get_user_station_id(auth.uid())) OR
        (has_role(auth.uid(), 'technician'::app_role) AND station_id = get_user_station_id(auth.uid())) OR
        (has_role(auth.uid(), 'front_desk'::app_role) AND technician_id = auth.uid() AND station_id = get_user_station_id(auth.uid()))
      )
    )
  );

CREATE POLICY "ICE records insert control" 
  ON public.ice_diagnostic_records 
  FOR INSERT 
  WITH CHECK (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    (
      station_id IS NOT NULL AND (
        (has_role(auth.uid(), 'station_admin'::app_role) AND station_id = get_user_station_id(auth.uid())) OR
        (has_role(auth.uid(), 'technician'::app_role) AND station_id = get_user_station_id(auth.uid())) OR
        (has_role(auth.uid(), 'front_desk'::app_role) AND technician_id = auth.uid() AND station_id = get_user_station_id(auth.uid()))
      )
    )
  );

CREATE POLICY "ICE records update control" 
  ON public.ice_diagnostic_records 
  FOR UPDATE 
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    (
      station_id IS NOT NULL AND (
        (has_role(auth.uid(), 'station_admin'::app_role) AND station_id = get_user_station_id(auth.uid())) OR
        (has_role(auth.uid(), 'technician'::app_role) AND station_id = get_user_station_id(auth.uid())) OR
        (has_role(auth.uid(), 'front_desk'::app_role) AND technician_id = auth.uid() AND station_id = get_user_station_id(auth.uid()))
      )
    )
  );

CREATE POLICY "ICE records delete control" 
  ON public.ice_diagnostic_records 
  FOR DELETE 
  USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    (
      station_id IS NOT NULL AND (
        (has_role(auth.uid(), 'station_admin'::app_role) AND station_id = get_user_station_id(auth.uid())) OR
        (has_role(auth.uid(), 'technician'::app_role) AND station_id = get_user_station_id(auth.uid())) OR
        (has_role(auth.uid(), 'front_desk'::app_role) AND technician_id = auth.uid() AND station_id = get_user_station_id(auth.uid()))
      )
    )
  );

CREATE POLICY "Users can create ICE records with own technician_id" 
  ON public.ice_diagnostic_records 
  FOR INSERT 
  WITH CHECK (technician_id = auth.uid());
