
import { FormData } from '../types/diagnosticForm';
import { supabase } from '../integrations/supabase/client';

export const getInitialFormData = (): FormData => ({
  customerName: '',
  vin: '',
  roNumber: '',
  vehicleMake: '',
  model: '',
  mileage: '',
  chargingIssuesHome: '',
  chargingIssuesHomeDetails: '',
  chargingIssuesPublic: '',
  chargingIssuesPublicDetails: '',
  chargerType: '',
  aftermarketCharger: '',
  aftermarketDetails: '',
  failedCharges: '',
  failedChargesDetails: '',
  rangeDrop: '',
  rangeDropDetails: '',
  batteryWarnings: '',
  batteryWarningsDetails: '',
  powerLoss: '',
  powerLossDetails: '',
  usualChargeLevel: '',
  dcFastFrequency: [],
  chargeRateDrop: '',
  consistentAcceleration: '',
  accelerationDetails: '',
  whiningNoises: '',
  whiningDetails: '',
  jerkingHesitation: '',
  jerkingDetails: '',
  vibrations: '',
  vibrationsDetails: '',
  noisesActions: '',
  noisesActionsDetails: '',
  rattlesRoads: '',
  rattlesDetails: '',
  hvacPerformance: '',
  hvacDetails: '',
  smellsNoises: '',
  smellsNoisesDetails: '',
  defoggerPerformance: '',
  defoggerDetails: '',
  infotainmentGlitches: '',
  infotainmentDetails: '',
  otaUpdates: '',
  brokenFeatures: '',
  brokenFeaturesDetails: '',
  lightFlicker: '',
  lightFlickerDetails: '',
  smoothRegen: '',
  smoothRegenDetails: '',
  regenStrength: '',
  regenStrengthDetails: '',
  decelerationNoises: '',
  decelerationNoisesDetails: '',
  issueConditions: [],
  otherConditions: '',
  towingHighLoad: '',
  primaryMode: '',
  modesDifferences: '',
  modesDifferencesDetails: '',
  specificModeIssues: '',
  specificModeDetails: '',
  modeSwitchingLags: '',
  modeSwitchingDetails: '',
  temperatureDuringIssue: '',
  vehicleParked: '',
  timeOfDay: '',
  hvacWeatherDifference: '',
  hvacWeatherDetails: '',
  rangeRegenTemp: '',
  moistureChargingPort: ''
});

export const saveFormData = async (formData: FormData): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to save diagnostic records');
  }

  // Get user's profile to fetch station_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('station_id')
    .eq('id', user.id)
    .single();

  const recordData = {
    customer_name: formData.customerName,
    vin: formData.vin,
    ro_number: formData.roNumber,
    make_model: `${formData.vehicleMake} ${formData.model}`.trim(),
    mileage: formData.mileage,
    charging_issues_home: formData.chargingIssuesHome,
    charging_issues_home_details: formData.chargingIssuesHomeDetails,
    charging_issues_public: formData.chargingIssuesPublic,
    charging_issues_public_details: formData.chargingIssuesPublicDetails,
    charger_type: formData.chargerType,
    aftermarket_charger: formData.aftermarketCharger,
    aftermarket_details: formData.aftermarketDetails,
    failed_charges: formData.failedCharges,
    failed_charges_details: formData.failedChargesDetails,
    range_drop: formData.rangeDrop,
    range_drop_details: formData.rangeDropDetails,
    battery_warnings: formData.batteryWarnings,
    battery_warnings_details: formData.batteryWarningsDetails,
    power_loss: formData.powerLoss,
    power_loss_details: formData.powerLossDetails,
    usual_charge_level: formData.usualChargeLevel,
    dc_fast_frequency: formData.dcFastFrequency,
    charge_rate_drop: formData.chargeRateDrop,
    consistent_acceleration: formData.consistentAcceleration,
    acceleration_details: formData.accelerationDetails,
    whining_noises: formData.whiningNoises,
    whining_details: formData.whiningDetails,
    jerking_hesitation: formData.jerkingHesitation,
    jerking_details: formData.jerkingDetails,
    vibrations: formData.vibrations,
    vibrations_details: formData.vibrationsDetails,
    noises_actions: formData.noisesActions,
    noises_actions_details: formData.noisesActionsDetails,
    rattles_roads: formData.rattlesRoads,
    rattles_details: formData.rattlesDetails,
    hvac_performance: formData.hvacPerformance,
    hvac_details: formData.hvacDetails,
    smells_noises: formData.smellsNoises,
    smells_noises_details: formData.smellsNoisesDetails,
    defogger_performance: formData.defoggerPerformance,
    defogger_details: formData.defoggerDetails,
    infotainment_glitches: formData.infotainmentGlitches,
    infotainment_details: formData.infotainmentDetails,
    ota_updates: formData.otaUpdates,
    broken_features: formData.brokenFeatures,
    broken_features_details: formData.brokenFeaturesDetails,
    light_flicker: formData.lightFlicker,
    light_flicker_details: formData.lightFlickerDetails,
    smooth_regen: formData.smoothRegen,
    smooth_regen_details: formData.smoothRegenDetails,
    regen_strength: formData.regenStrength,
    regen_strength_details: formData.regenStrengthDetails,
    deceleration_noises: formData.decelerationNoises,
    deceleration_noises_details: formData.decelerationNoisesDetails,
    issue_conditions: formData.issueConditions,
    other_conditions: formData.otherConditions,
    towing_high_load: formData.towingHighLoad,
    primary_mode: formData.primaryMode,
    modes_differences: formData.modesDifferences,
    modes_differences_details: formData.modesDifferencesDetails,
    specific_mode_issues: formData.specificModeIssues,
    specific_mode_details: formData.specificModeDetails,
    mode_switching_lags: formData.modeSwitchingLags,
    mode_switching_details: formData.modeSwitchingDetails,
    temperature_during_issue: formData.temperatureDuringIssue,
    vehicle_parked: formData.vehicleParked,
    time_of_day: formData.timeOfDay,
    hvac_weather_difference: formData.hvacWeatherDifference,
    hvac_weather_details: formData.hvacWeatherDetails,
    range_regen_temp: formData.rangeRegenTemp,
    moisture_charging_port: formData.moistureChargingPort,
    technician_id: user.id,
    station_id: profile?.station_id
  };

  const { data, error } = await supabase
    .from('ev_diagnostic_records')
    .insert(recordData)
    .select('id')
    .single();

  if (error) {
    console.error('Error saving EV diagnostic record:', error);
    throw new Error('Failed to save diagnostic record');
  }

  return data.id;
};
