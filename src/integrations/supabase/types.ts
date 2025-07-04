export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      email_verifications: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          verification_token: string
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          verification_token: string
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          verification_token?: string
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      ev_diagnostic_records: {
        Row: {
          acceleration_details: string | null
          aftermarket_charger: string | null
          aftermarket_details: string | null
          battery_warnings: string | null
          battery_warnings_details: string | null
          broken_features: string | null
          broken_features_details: string | null
          charge_rate_drop: string | null
          charger_type: string | null
          charging_issues_home: string | null
          charging_issues_home_details: string | null
          charging_issues_public: string | null
          charging_issues_public_details: string | null
          consistent_acceleration: string | null
          created_at: string
          customer_name: string
          dc_fast_frequency: string[] | null
          deceleration_noises: string | null
          deceleration_noises_details: string | null
          defogger_details: string | null
          defogger_performance: string | null
          failed_charges: string | null
          failed_charges_details: string | null
          hvac_details: string | null
          hvac_performance: string | null
          hvac_weather_details: string | null
          hvac_weather_difference: string | null
          id: string
          infotainment_details: string | null
          infotainment_glitches: string | null
          issue_conditions: string[] | null
          jerking_details: string | null
          jerking_hesitation: string | null
          light_flicker: string | null
          light_flicker_details: string | null
          make_model: string | null
          mileage: string | null
          mode_switching_details: string | null
          mode_switching_lags: string | null
          modes_differences: string | null
          modes_differences_details: string | null
          moisture_charging_port: string | null
          noises_actions: string | null
          noises_actions_details: string | null
          ota_updates: string | null
          other_conditions: string | null
          power_loss: string | null
          power_loss_details: string | null
          primary_mode: string | null
          range_drop: string | null
          range_drop_details: string | null
          range_regen_temp: string | null
          rattles_details: string | null
          rattles_roads: string | null
          regen_strength: string | null
          regen_strength_details: string | null
          ro_number: string
          smells_noises: string | null
          smells_noises_details: string | null
          smooth_regen: string | null
          smooth_regen_details: string | null
          specific_mode_details: string | null
          specific_mode_issues: string | null
          station_id: string | null
          technician_id: string
          temperature_during_issue: string | null
          time_of_day: string | null
          towing_high_load: string | null
          updated_at: string
          usual_charge_level: string | null
          vehicle_parked: string | null
          vibrations: string | null
          vibrations_details: string | null
          vin: string
          whining_details: string | null
          whining_noises: string | null
        }
        Insert: {
          acceleration_details?: string | null
          aftermarket_charger?: string | null
          aftermarket_details?: string | null
          battery_warnings?: string | null
          battery_warnings_details?: string | null
          broken_features?: string | null
          broken_features_details?: string | null
          charge_rate_drop?: string | null
          charger_type?: string | null
          charging_issues_home?: string | null
          charging_issues_home_details?: string | null
          charging_issues_public?: string | null
          charging_issues_public_details?: string | null
          consistent_acceleration?: string | null
          created_at?: string
          customer_name: string
          dc_fast_frequency?: string[] | null
          deceleration_noises?: string | null
          deceleration_noises_details?: string | null
          defogger_details?: string | null
          defogger_performance?: string | null
          failed_charges?: string | null
          failed_charges_details?: string | null
          hvac_details?: string | null
          hvac_performance?: string | null
          hvac_weather_details?: string | null
          hvac_weather_difference?: string | null
          id?: string
          infotainment_details?: string | null
          infotainment_glitches?: string | null
          issue_conditions?: string[] | null
          jerking_details?: string | null
          jerking_hesitation?: string | null
          light_flicker?: string | null
          light_flicker_details?: string | null
          make_model?: string | null
          mileage?: string | null
          mode_switching_details?: string | null
          mode_switching_lags?: string | null
          modes_differences?: string | null
          modes_differences_details?: string | null
          moisture_charging_port?: string | null
          noises_actions?: string | null
          noises_actions_details?: string | null
          ota_updates?: string | null
          other_conditions?: string | null
          power_loss?: string | null
          power_loss_details?: string | null
          primary_mode?: string | null
          range_drop?: string | null
          range_drop_details?: string | null
          range_regen_temp?: string | null
          rattles_details?: string | null
          rattles_roads?: string | null
          regen_strength?: string | null
          regen_strength_details?: string | null
          ro_number: string
          smells_noises?: string | null
          smells_noises_details?: string | null
          smooth_regen?: string | null
          smooth_regen_details?: string | null
          specific_mode_details?: string | null
          specific_mode_issues?: string | null
          station_id?: string | null
          technician_id: string
          temperature_during_issue?: string | null
          time_of_day?: string | null
          towing_high_load?: string | null
          updated_at?: string
          usual_charge_level?: string | null
          vehicle_parked?: string | null
          vibrations?: string | null
          vibrations_details?: string | null
          vin: string
          whining_details?: string | null
          whining_noises?: string | null
        }
        Update: {
          acceleration_details?: string | null
          aftermarket_charger?: string | null
          aftermarket_details?: string | null
          battery_warnings?: string | null
          battery_warnings_details?: string | null
          broken_features?: string | null
          broken_features_details?: string | null
          charge_rate_drop?: string | null
          charger_type?: string | null
          charging_issues_home?: string | null
          charging_issues_home_details?: string | null
          charging_issues_public?: string | null
          charging_issues_public_details?: string | null
          consistent_acceleration?: string | null
          created_at?: string
          customer_name?: string
          dc_fast_frequency?: string[] | null
          deceleration_noises?: string | null
          deceleration_noises_details?: string | null
          defogger_details?: string | null
          defogger_performance?: string | null
          failed_charges?: string | null
          failed_charges_details?: string | null
          hvac_details?: string | null
          hvac_performance?: string | null
          hvac_weather_details?: string | null
          hvac_weather_difference?: string | null
          id?: string
          infotainment_details?: string | null
          infotainment_glitches?: string | null
          issue_conditions?: string[] | null
          jerking_details?: string | null
          jerking_hesitation?: string | null
          light_flicker?: string | null
          light_flicker_details?: string | null
          make_model?: string | null
          mileage?: string | null
          mode_switching_details?: string | null
          mode_switching_lags?: string | null
          modes_differences?: string | null
          modes_differences_details?: string | null
          moisture_charging_port?: string | null
          noises_actions?: string | null
          noises_actions_details?: string | null
          ota_updates?: string | null
          other_conditions?: string | null
          power_loss?: string | null
          power_loss_details?: string | null
          primary_mode?: string | null
          range_drop?: string | null
          range_drop_details?: string | null
          range_regen_temp?: string | null
          rattles_details?: string | null
          rattles_roads?: string | null
          regen_strength?: string | null
          regen_strength_details?: string | null
          ro_number?: string
          smells_noises?: string | null
          smells_noises_details?: string | null
          smooth_regen?: string | null
          smooth_regen_details?: string | null
          specific_mode_details?: string | null
          specific_mode_issues?: string | null
          station_id?: string | null
          technician_id?: string
          temperature_during_issue?: string | null
          time_of_day?: string | null
          towing_high_load?: string | null
          updated_at?: string
          usual_charge_level?: string | null
          vehicle_parked?: string | null
          vibrations?: string | null
          vibrations_details?: string | null
          vin?: string
          whining_details?: string | null
          whining_noises?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ev_diagnostic_records_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_users: {
        Row: {
          email: string
          email_verified: boolean | null
          full_name: string
          id: string
          password_hash: string
          rejection_reason: string | null
          requested_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          station_id: string | null
          status: string
          verification_token: string | null
        }
        Insert: {
          email: string
          email_verified?: boolean | null
          full_name: string
          id?: string
          password_hash: string
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          station_id?: string | null
          status?: string
          verification_token?: string | null
        }
        Update: {
          email?: string
          email_verified?: boolean | null
          full_name?: string
          id?: string
          password_hash?: string
          rejection_reason?: string | null
          requested_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          station_id?: string | null
          status?: string
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_users_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      phev_diagnostic_records: {
        Row: {
          abnormal_vibrations: string | null
          acceleration_details: string | null
          acceleration_issues: string | null
          aftermarket_charger: string | null
          aftermarket_details: string | null
          average_electric_range: string | null
          battery_charging: string | null
          battery_charging_details: string | null
          broken_features: string | null
          broken_features_details: string | null
          burning_smell: string | null
          burning_smell_details: string | null
          charge_rate_details: string | null
          charge_rate_drop: string | null
          charger_type: string | null
          created_at: string
          customer_name: string
          dc_fast_duration: string | null
          dc_fast_frequency: string | null
          deceleration_noises: string | null
          deceleration_noises_details: string | null
          eco_ev_mode_details: string | null
          eco_ev_mode_limit: string | null
          engine_sound: string | null
          engine_sound_details: string | null
          engine_start_details: string | null
          engine_start_ev_mode: string | null
          ev_range_details: string | null
          ev_range_expected: string | null
          excessive_ice_operation: string | null
          fan_details: string | null
          fan_sounds: string | null
          fuel_consumption: string | null
          fuel_consumption_details: string | null
          fuel_economy_change: string | null
          fuel_economy_details: string | null
          fuel_source: string | null
          fuel_type: string | null
          heavy_load_behavior: string | null
          heavy_load_details: string | null
          hvac_details: string | null
          hvac_effectiveness: string | null
          hvac_weather_details: string | null
          hvac_weather_difference: string | null
          ice_operation_details: string | null
          id: string
          inconsistent_details: string | null
          inconsistent_performance: string | null
          infotainment_details: string | null
          infotainment_glitches: string | null
          light_flicker: string | null
          light_flicker_details: string | null
          mileage: string | null
          misfires: string | null
          misfires_details: string | null
          mode_noise: string | null
          mode_noise_details: string | null
          mode_warnings: string | null
          mode_warnings_details: string | null
          model: string | null
          moisture_charging_port: string | null
          ota_updates: string | null
          petrol_vs_ev_usage: string | null
          range_regen_details: string | null
          range_regen_temp: string | null
          regen_strength: string | null
          regen_strength_details: string | null
          regular_modes: string[] | null
          ro_number: string
          road_condition_details: string | null
          road_condition_noises: string | null
          smooth_regen: string | null
          smooth_regen_details: string | null
          sport_mode_details: string | null
          sport_mode_power: string | null
          station_id: string | null
          switching_details: string | null
          switching_lags: string | null
          technician_id: string
          temperature_details: string | null
          temperature_during_issue: string | null
          temperature_regulation: string | null
          time_of_day: string | null
          towing_details: string | null
          towing_issues: string | null
          underbody_details: string | null
          underbody_noise: string | null
          updated_at: string
          usual_charge_level: string | null
          vehicle_make: string | null
          vehicle_parked: string | null
          vibrations_details: string | null
          vin: string
        }
        Insert: {
          abnormal_vibrations?: string | null
          acceleration_details?: string | null
          acceleration_issues?: string | null
          aftermarket_charger?: string | null
          aftermarket_details?: string | null
          average_electric_range?: string | null
          battery_charging?: string | null
          battery_charging_details?: string | null
          broken_features?: string | null
          broken_features_details?: string | null
          burning_smell?: string | null
          burning_smell_details?: string | null
          charge_rate_details?: string | null
          charge_rate_drop?: string | null
          charger_type?: string | null
          created_at?: string
          customer_name: string
          dc_fast_duration?: string | null
          dc_fast_frequency?: string | null
          deceleration_noises?: string | null
          deceleration_noises_details?: string | null
          eco_ev_mode_details?: string | null
          eco_ev_mode_limit?: string | null
          engine_sound?: string | null
          engine_sound_details?: string | null
          engine_start_details?: string | null
          engine_start_ev_mode?: string | null
          ev_range_details?: string | null
          ev_range_expected?: string | null
          excessive_ice_operation?: string | null
          fan_details?: string | null
          fan_sounds?: string | null
          fuel_consumption?: string | null
          fuel_consumption_details?: string | null
          fuel_economy_change?: string | null
          fuel_economy_details?: string | null
          fuel_source?: string | null
          fuel_type?: string | null
          heavy_load_behavior?: string | null
          heavy_load_details?: string | null
          hvac_details?: string | null
          hvac_effectiveness?: string | null
          hvac_weather_details?: string | null
          hvac_weather_difference?: string | null
          ice_operation_details?: string | null
          id?: string
          inconsistent_details?: string | null
          inconsistent_performance?: string | null
          infotainment_details?: string | null
          infotainment_glitches?: string | null
          light_flicker?: string | null
          light_flicker_details?: string | null
          mileage?: string | null
          misfires?: string | null
          misfires_details?: string | null
          mode_noise?: string | null
          mode_noise_details?: string | null
          mode_warnings?: string | null
          mode_warnings_details?: string | null
          model?: string | null
          moisture_charging_port?: string | null
          ota_updates?: string | null
          petrol_vs_ev_usage?: string | null
          range_regen_details?: string | null
          range_regen_temp?: string | null
          regen_strength?: string | null
          regen_strength_details?: string | null
          regular_modes?: string[] | null
          ro_number: string
          road_condition_details?: string | null
          road_condition_noises?: string | null
          smooth_regen?: string | null
          smooth_regen_details?: string | null
          sport_mode_details?: string | null
          sport_mode_power?: string | null
          station_id?: string | null
          switching_details?: string | null
          switching_lags?: string | null
          technician_id: string
          temperature_details?: string | null
          temperature_during_issue?: string | null
          temperature_regulation?: string | null
          time_of_day?: string | null
          towing_details?: string | null
          towing_issues?: string | null
          underbody_details?: string | null
          underbody_noise?: string | null
          updated_at?: string
          usual_charge_level?: string | null
          vehicle_make?: string | null
          vehicle_parked?: string | null
          vibrations_details?: string | null
          vin: string
        }
        Update: {
          abnormal_vibrations?: string | null
          acceleration_details?: string | null
          acceleration_issues?: string | null
          aftermarket_charger?: string | null
          aftermarket_details?: string | null
          average_electric_range?: string | null
          battery_charging?: string | null
          battery_charging_details?: string | null
          broken_features?: string | null
          broken_features_details?: string | null
          burning_smell?: string | null
          burning_smell_details?: string | null
          charge_rate_details?: string | null
          charge_rate_drop?: string | null
          charger_type?: string | null
          created_at?: string
          customer_name?: string
          dc_fast_duration?: string | null
          dc_fast_frequency?: string | null
          deceleration_noises?: string | null
          deceleration_noises_details?: string | null
          eco_ev_mode_details?: string | null
          eco_ev_mode_limit?: string | null
          engine_sound?: string | null
          engine_sound_details?: string | null
          engine_start_details?: string | null
          engine_start_ev_mode?: string | null
          ev_range_details?: string | null
          ev_range_expected?: string | null
          excessive_ice_operation?: string | null
          fan_details?: string | null
          fan_sounds?: string | null
          fuel_consumption?: string | null
          fuel_consumption_details?: string | null
          fuel_economy_change?: string | null
          fuel_economy_details?: string | null
          fuel_source?: string | null
          fuel_type?: string | null
          heavy_load_behavior?: string | null
          heavy_load_details?: string | null
          hvac_details?: string | null
          hvac_effectiveness?: string | null
          hvac_weather_details?: string | null
          hvac_weather_difference?: string | null
          ice_operation_details?: string | null
          id?: string
          inconsistent_details?: string | null
          inconsistent_performance?: string | null
          infotainment_details?: string | null
          infotainment_glitches?: string | null
          light_flicker?: string | null
          light_flicker_details?: string | null
          mileage?: string | null
          misfires?: string | null
          misfires_details?: string | null
          mode_noise?: string | null
          mode_noise_details?: string | null
          mode_warnings?: string | null
          mode_warnings_details?: string | null
          model?: string | null
          moisture_charging_port?: string | null
          ota_updates?: string | null
          petrol_vs_ev_usage?: string | null
          range_regen_details?: string | null
          range_regen_temp?: string | null
          regen_strength?: string | null
          regen_strength_details?: string | null
          regular_modes?: string[] | null
          ro_number?: string
          road_condition_details?: string | null
          road_condition_noises?: string | null
          smooth_regen?: string | null
          smooth_regen_details?: string | null
          sport_mode_details?: string | null
          sport_mode_power?: string | null
          station_id?: string | null
          switching_details?: string | null
          switching_lags?: string | null
          technician_id?: string
          temperature_details?: string | null
          temperature_during_issue?: string | null
          temperature_regulation?: string | null
          time_of_day?: string | null
          towing_details?: string | null
          towing_issues?: string | null
          underbody_details?: string | null
          underbody_noise?: string | null
          updated_at?: string
          usual_charge_level?: string | null
          vehicle_make?: string | null
          vehicle_parked?: string | null
          vibrations_details?: string | null
          vin?: string
        }
        Relationships: [
          {
            foreignKeyName: "phev_diagnostic_records_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          station_id: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          station_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          station_id?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      station_invitations: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          invitation_token: string
          station_registration_id: string | null
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at: string
          id?: string
          invitation_token: string
          station_registration_id?: string | null
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          station_registration_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "station_invitations_station_registration_id_fkey"
            columns: ["station_registration_id"]
            isOneToOne: false
            referencedRelation: "station_registration_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      station_registration_requests: {
        Row: {
          address: string | null
          admin_user_id: string | null
          approved_at: string | null
          approved_by: string | null
          business_type: string | null
          city: string | null
          company_name: string
          contact_email: string
          contact_person_name: string
          contact_phone: string | null
          created_at: string
          description: string | null
          email_verified: boolean | null
          id: string
          invitation_sent: boolean | null
          invitation_token: string | null
          password_hash: string | null
          rejection_reason: string | null
          state: string | null
          status: string
          updated_at: string
          verification_token: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          admin_user_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_type?: string | null
          city?: string | null
          company_name: string
          contact_email: string
          contact_person_name: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          email_verified?: boolean | null
          id?: string
          invitation_sent?: boolean | null
          invitation_token?: string | null
          password_hash?: string | null
          rejection_reason?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          verification_token?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          admin_user_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          business_type?: string | null
          city?: string | null
          company_name?: string
          contact_email?: string
          contact_person_name?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          email_verified?: boolean | null
          id?: string
          invitation_sent?: boolean | null
          invitation_token?: string | null
          password_hash?: string | null
          rejection_reason?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          verification_token?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      stations: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          station_id: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          station_id?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          station_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_station_roles: {
        Args: { _user_id: string; _station_id: string }
        Returns: boolean
      }
      create_station_invitation: {
        Args: { _registration_id: string; _email: string }
        Returns: string
      }
      generate_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_user_station: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_station_id: {
        Args: { user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_front_desk_for_station: {
        Args: { user_id: string; station_id: string }
        Returns: boolean
      }
      is_station_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_station_admin_for_station: {
        Args: { user_id: string; station_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_technician_for_station: {
        Args: { user_id: string; station_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "tech"
        | "service_desk"
        | "super_admin"
        | "front_desk"
        | "technician"
        | "station_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "tech",
        "service_desk",
        "super_admin",
        "front_desk",
        "technician",
        "station_admin",
      ],
    },
  },
} as const
