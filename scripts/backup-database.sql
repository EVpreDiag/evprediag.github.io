-- ==============================================
-- COMPLETE SUPABASE DATABASE BACKUP SCRIPT
-- Generated: $(date)
-- ==============================================

-- ==============================================
-- 1. CUSTOM TYPES BACKUP
-- ==============================================

-- Backup app_role enum
CREATE TYPE public.app_role AS ENUM (
    'super_admin',
    'station_admin', 
    'technician',
    'front_desk'
);

-- ==============================================
-- 2. TABLES SCHEMA BACKUP
-- ==============================================

-- Backup stations table
CREATE TABLE public.stations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    address text,
    phone text,
    email text,
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Backup profiles table
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username text,
    full_name text,
    avatar_url text,
    station_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Backup user_roles table
CREATE TABLE public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    station_id uuid,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- Backup station_registration_requests table
CREATE TABLE public.station_registration_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    company_name text NOT NULL,
    contact_person_name text NOT NULL,
    contact_email text NOT NULL,
    contact_phone text,
    address text,
    city text,
    state text,
    zip_code text,
    website text,
    business_type text,
    description text,
    status text NOT NULL DEFAULT 'pending'::text,
    rejection_reason text,
    password_hash text,
    verification_token text,
    email_verified boolean DEFAULT false,
    invitation_sent boolean DEFAULT false,
    invitation_token text,
    admin_user_id uuid,
    approved_by uuid,
    approved_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Backup station_invitations table
CREATE TABLE public.station_invitations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    station_registration_id uuid,
    email text NOT NULL,
    invitation_token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    used_at timestamp with time zone,
    PRIMARY KEY (id)
);

-- Backup email_verifications table
CREATE TABLE public.email_verifications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    verification_token text NOT NULL,
    verification_type text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Backup pending_users table
CREATE TABLE public.pending_users (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email text NOT NULL,
    full_name text NOT NULL,
    password_hash text NOT NULL,
    verification_token text,
    email_verified boolean DEFAULT false,
    station_id uuid,
    status text NOT NULL DEFAULT 'pending'::text,
    rejection_reason text,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    requested_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Backup ev_diagnostic_records table
CREATE TABLE public.ev_diagnostic_records (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    technician_id uuid NOT NULL,
    station_id uuid,
    customer_name text NOT NULL,
    vin text NOT NULL,
    ro_number text NOT NULL,
    make_model text,
    mileage text,
    primary_mode text,
    usual_charge_level text,
    dc_fast_frequency text[],
    charge_rate_drop text,
    charger_type text,
    aftermarket_charger text,
    aftermarket_details text,
    charging_issues_home text,
    charging_issues_home_details text,
    charging_issues_public text,
    charging_issues_public_details text,
    failed_charges text,
    failed_charges_details text,
    power_loss text,
    power_loss_details text,
    consistent_acceleration text,
    acceleration_details text,
    jerking_hesitation text,
    jerking_details text,
    whining_noises text,
    whining_details text,
    vibrations text,
    vibrations_details text,
    noises_actions text,
    noises_actions_details text,
    range_drop text,
    range_drop_details text,
    battery_warnings text,
    battery_warnings_details text,
    towing_high_load text,
    smooth_regen text,
    smooth_regen_details text,
    regen_strength text,
    regen_strength_details text,
    deceleration_noises text,
    deceleration_noises_details text,
    mode_switching_lags text,
    mode_switching_details text,
    specific_mode_issues text,
    specific_mode_details text,
    modes_differences text,
    modes_differences_details text,
    hvac_performance text,
    hvac_details text,
    smells_noises text,
    smells_noises_details text,
    defogger_performance text,
    defogger_details text,
    rattles_roads text,
    rattles_details text,
    infotainment_glitches text,
    infotainment_details text,
    ota_updates text,
    broken_features text,
    broken_features_details text,
    light_flicker text,
    light_flicker_details text,
    issue_conditions text[],
    other_conditions text,
    temperature_during_issue text,
    vehicle_parked text,
    time_of_day text,
    moisture_charging_port text,
    hvac_weather_difference text,
    hvac_weather_details text,
    range_regen_temp text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Backup phev_diagnostic_records table
CREATE TABLE public.phev_diagnostic_records (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    technician_id uuid NOT NULL,
    station_id uuid,
    customer_name text NOT NULL,
    vin text NOT NULL,
    ro_number text NOT NULL,
    vehicle_make text,
    model text,
    mileage text,
    fuel_type text,
    fuel_source text,
    petrol_vs_ev_usage text,
    fuel_economy_change text,
    fuel_economy_details text,
    battery_charging text,
    battery_charging_details text,
    charger_type text,
    aftermarket_charger text,
    aftermarket_details text,
    ev_range_expected text,
    ev_range_details text,
    excessive_ice_operation text,
    ice_operation_details text,
    usual_charge_level text,
    dc_fast_frequency text,
    dc_fast_duration text,
    charge_rate_drop text,
    charge_rate_details text,
    switching_lags text,
    switching_details text,
    engine_start_ev_mode text,
    engine_start_details text,
    abnormal_vibrations text,
    vibrations_details text,
    acceleration_issues text,
    acceleration_details text,
    engine_sound text,
    engine_sound_details text,
    burning_smell text,
    burning_smell_details text,
    misfires text,
    misfires_details text,
    underbody_noise text,
    underbody_details text,
    road_condition_noises text,
    road_condition_details text,
    hvac_effectiveness text,
    hvac_details text,
    fan_sounds text,
    fan_details text,
    temperature_regulation text,
    temperature_details text,
    fuel_consumption text,
    fuel_consumption_details text,
    average_electric_range text,
    infotainment_glitches text,
    infotainment_details text,
    ota_updates text,
    broken_features text,
    broken_features_details text,
    light_flicker text,
    light_flicker_details text,
    smooth_regen text,
    smooth_regen_details text,
    regen_strength text,
    regen_strength_details text,
    deceleration_noises text,
    deceleration_noises_details text,
    towing_issues text,
    towing_details text,
    heavy_load_behavior text,
    heavy_load_details text,
    regular_modes text[],
    inconsistent_performance text,
    inconsistent_details text,
    sport_mode_power text,
    sport_mode_details text,
    eco_ev_mode_limit text,
    eco_ev_mode_details text,
    mode_noise text,
    mode_noise_details text,
    mode_warnings text,
    mode_warnings_details text,
    temperature_during_issue text,
    vehicle_parked text,
    time_of_day text,
    hvac_weather_difference text,
    hvac_weather_details text,
    range_regen_temp text,
    range_regen_details text,
    moisture_charging_port text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Backup ice_diagnostic_records table
CREATE TABLE public.ice_diagnostic_records (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    technician_id uuid NOT NULL,
    station_id uuid,
    customer_name text NOT NULL,
    vin text NOT NULL,
    ro_number text NOT NULL,
    vehicle_make text,
    model text,
    year text,
    mileage text,
    engine_size text,
    fuel_type text,
    engine_starting text,
    engine_starting_details text,
    idle_quality text,
    idle_quality_details text,
    acceleration_issues text,
    acceleration_details text,
    power_loss text,
    power_loss_details text,
    engine_stalling text,
    engine_stalling_details text,
    rough_running text,
    rough_running_details text,
    engine_knocking text,
    engine_knocking_details text,
    unusual_noises text,
    unusual_noises_details text,
    excessive_vibration text,
    vibration_details text,
    fuel_consumption text,
    fuel_consumption_details text,
    fuel_quality_issues text,
    fuel_quality_details text,
    fuel_pump_issues text,
    fuel_pump_details text,
    exhaust_smoke text,
    exhaust_smoke_details text,
    exhaust_smell text,
    exhaust_smell_details text,
    catalytic_converter_issues text,
    catalytic_converter_details text,
    overheating text,
    overheating_details text,
    coolant_leaks text,
    coolant_leak_details text,
    radiator_issues text,
    radiator_details text,
    oil_pressure_issues text,
    oil_pressure_details text,
    oil_leaks text,
    oil_leak_details text,
    oil_consumption text,
    oil_consumption_details text,
    battery_issues text,
    battery_details text,
    alternator_issues text,
    alternator_details text,
    starter_issues text,
    starter_details text,
    check_engine_light text,
    check_engine_details text,
    transmission_issues text,
    transmission_details text,
    gear_shifting text,
    gear_shifting_details text,
    clutch_issues text,
    clutch_details text,
    driving_conditions text[],
    other_driving_conditions text,
    maintenance_history text,
    recent_repairs text,
    temperature_during_issue text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- ==============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ev_diagnostic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phev_diagnostic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ice_diagnostic_records ENABLE ROW LEVEL SECURITY;