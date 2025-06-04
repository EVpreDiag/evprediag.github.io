
export interface PHEVFormData {
  // General Information
  customerName: string;
  vin: string;
  roNumber: string;
  vehicleMake: string;
  model: string;
  mileage: string;
  
  // Fuel Type & Usage
  fuelType: string;
  fuelSource: string;
  petrolVsEvUsage: string;
  fuelEconomyChange: string;
  fuelEconomyDetails: string;
  
  // Battery & Charging
  batteryCharging: string;
  batteryChargingDetails: string;
  chargerType: string;
  aftermarketCharger: string;
  aftermarketDetails: string;
  evRangeExpected: string;
  evRangeDetails: string;
  excessiveIceOperation: string;
  iceOperationDetails: string;
  usualChargeLevel: string;
  dcFastFrequency: string;
  dcFastDuration: string;
  chargeRateDrop: string;
  chargeRateDetails: string;
  
  // Hybrid Operation
  switchingLags: string;
  switchingDetails: string;
  engineStartEVMode: string;
  engineStartDetails: string;
  abnormalVibrations: string;
  vibrationsDetails: string;
  
  // Engine & Drivetrain
  accelerationIssues: string;
  accelerationDetails: string;
  engineSound: string;
  engineSoundDetails: string;
  burningSmell: string;
  burningSmellDetails: string;
  misfires: string;
  misfiresDetails: string;
  
  // NVH & Ride Quality
  underbodyNoise: string;
  underbodyDetails: string;
  roadConditionNoises: string;
  roadConditionDetails: string;
  
  // Climate Control
  hvacEffectiveness: string;
  hvacDetails: string;
  fanSounds: string;
  fanDetails: string;
  temperatureRegulation: string;
  temperatureDetails: string;
  
  // Efficiency
  fuelConsumption: string;
  fuelConsumptionDetails: string;
  averageElectricRange: string;
  
  // Software & Instrument Cluster
  infotainmentGlitches: string;
  infotainmentDetails: string;
  otaUpdates: string;
  brokenFeatures: string;
  brokenFeaturesDetails: string;
  lightFlicker: string;
  lightFlickerDetails: string;
  
  // Regenerative Braking
  smoothRegen: string;
  smoothRegenDetails: string;
  regenStrength: string;
  regenStrengthDetails: string;
  decelerationNoises: string;
  decelerationNoisesDetails: string;
  
  // Driving Load & Towing
  towingIssues: string;
  towingDetails: string;
  heavyLoadBehavior: string;
  heavyLoadDetails: string;
  
  // Driving-Mode Behavior
  regularModes: string[];
  inconsistentPerformance: string;
  inconsistentDetails: string;
  sportModePower: string;
  sportModeDetails: string;
  ecoEvModeLimit: string;
  ecoEvModeDetails: string;
  modeNoise: string;
  modeNoiseDetails: string;
  modeWarnings: string;
  modeWarningsDetails: string;
  
  // Environmental & Climate Conditions
  temperatureDuringIssue: string;
  vehicleParked: string;
  timeOfDay: string;
  hvacWeatherDifference: string;
  hvacWeatherDetails: string;
  rangeRegenTemp: string;
  rangeRegenDetails: string;
  moistureChargingPort: string;
  
  // File uploads
  uploadedFiles: File[];
}

export interface PHEVFormProps {
  formData: PHEVFormData;
  onInputChange: (field: keyof PHEVFormData, value: string | string[]) => void;
  onCheckboxChange: (field: keyof PHEVFormData, value: string, checked: boolean) => void;
}
