
export interface FormData {
  // General Information
  customerName: string;
  vin: string;
  roNumber: string;
  vehicleMake: string;
  model: string;
  mileage: string;
  
  // Battery & Charging
  chargingIssuesHome: string;
  chargingIssuesHomeDetails: string;
  chargingIssuesPublic: string;
  chargingIssuesPublicDetails: string;
  chargerType: string;
  aftermarketCharger: string;
  aftermarketDetails: string;
  failedCharges: string;
  failedChargesDetails: string;
  rangeDrop: string;
  rangeDropDetails: string;
  batteryWarnings: string;
  batteryWarningsDetails: string;
  powerLoss: string;
  powerLossDetails: string;
  usualChargeLevel: string;
  dcFastFrequency: string[];
  chargeRateDrop: string;
  
  // Drivetrain & Performance
  consistentAcceleration: string;
  accelerationDetails: string;
  whiningNoises: string;
  whiningDetails: string;
  jerkingHesitation: string;
  jerkingDetails: string;
  
  // NVH
  vibrations: string;
  vibrationsDetails: string;
  noisesActions: string;
  noisesActionsDetails: string;
  rattlesRoads: string;
  rattlesDetails: string;
  
  // Climate Control
  hvacPerformance: string;
  hvacDetails: string;
  smellsNoises: string;
  smellsNoisesDetails: string;
  defoggerPerformance: string;
  defoggerDetails: string;
  
  // Electrical & Software
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
  
  // Driving Conditions
  issueConditions: string[];
  otherConditions: string;
  towingHighLoad: string;
  
  // Driving Mode
  primaryMode: string;
  modesDifferences: string;
  modesDifferencesDetails: string;
  specificModeIssues: string;
  specificModeDetails: string;
  modeSwitchingLags: string;
  modeSwitchingDetails: string;
  
  // Environmental
  temperatureDuringIssue: string;
  vehicleParked: string;
  timeOfDay: string;
  hvacWeatherDifference: string;
  hvacWeatherDetails: string;
  rangeRegenTemp: string;
  moistureChargingPort: string;
}

export interface FormProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string | string[]) => void;
  onCheckboxChange: (field: keyof FormData, value: string, checked: boolean) => void;
}
