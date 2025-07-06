export interface ICEDiagnosticFormData {
  // General Information
  customerName: string;
  vin: string;
  roNumber: string;
  vehicleMake: string;
  model: string;
  year: string;
  mileage: string;
  engineSize: string;
  fuelType: string;
  
  // Engine Performance
  engineStarting: string;
  engineStartingDetails: string;
  idleQuality: string;
  idleQualityDetails: string;
  accelerationIssues: string;
  accelerationDetails: string;
  powerLoss: string;
  powerLossDetails: string;
  engineStalling: string;
  engineStallingDetails: string;
  roughRunning: string;
  roughRunningDetails: string;
  
  // Engine Noises & Vibrations
  engineKnocking: string;
  engineKnockingDetails: string;
  unusualNoises: string;
  unusualNoisesDetails: string;
  excessiveVibration: string;
  vibrationDetails: string;
  
  // Fuel System
  fuelConsumption: string;
  fuelConsumptionDetails: string;
  fuelQualityIssues: string;
  fuelQualityDetails: string;
  fuelPumpIssues: string;
  fuelPumpDetails: string;
  
  // Exhaust System
  exhaustSmoke: string;
  exhaustSmokeDetails: string;
  exhaustSmell: string;
  exhaustSmellDetails: string;
  catalyticConverterIssues: string;
  catalyticConverterDetails: string;
  
  // Cooling System
  overheating: string;
  overheatingDetails: string;
  coolantLeaks: string;
  coolantLeakDetails: string;
  radiatorIssues: string;
  radiatorDetails: string;
  
  // Oil System
  oilPressureIssues: string;
  oilPressureDetails: string;
  oilLeaks: string;
  oilLeakDetails: string;
  oilConsumption: string;
  oilConsumptionDetails: string;
  
  // Electrical System
  batteryIssues: string;
  batteryDetails: string;
  alternatorIssues: string;
  alternatorDetails: string;
  starterIssues: string;
  starterDetails: string;
  checkEngineLight: string;
  checkEngineDetails: string;
  
  // Transmission
  transmissionIssues: string;
  transmissionDetails: string;
  gearShifting: string;
  gearShiftingDetails: string;
  clutchIssues: string;
  clutchDetails: string;
  
  // Environmental Conditions
  temperatureDuringIssue: string;
  drivingConditions: string[];
  otherDrivingConditions: string;
  maintenanceHistory: string;
  recentRepairs: string;
}

export const initialICEFormData: ICEDiagnosticFormData = {
  // General Information
  customerName: '',
  vin: '',
  roNumber: '',
  vehicleMake: '',
  model: '',
  year: '',
  mileage: '',
  engineSize: '',
  fuelType: '',
  
  // Engine Performance
  engineStarting: '',
  engineStartingDetails: '',
  idleQuality: '',
  idleQualityDetails: '',
  accelerationIssues: '',
  accelerationDetails: '',
  powerLoss: '',
  powerLossDetails: '',
  engineStalling: '',
  engineStallingDetails: '',
  roughRunning: '',
  roughRunningDetails: '',
  
  // Engine Noises & Vibrations
  engineKnocking: '',
  engineKnockingDetails: '',
  unusualNoises: '',
  unusualNoisesDetails: '',
  excessiveVibration: '',
  vibrationDetails: '',
  
  // Fuel System
  fuelConsumption: '',
  fuelConsumptionDetails: '',
  fuelQualityIssues: '',
  fuelQualityDetails: '',
  fuelPumpIssues: '',
  fuelPumpDetails: '',
  
  // Exhaust System
  exhaustSmoke: '',
  exhaustSmokeDetails: '',
  exhaustSmell: '',
  exhaustSmellDetails: '',
  catalyticConverterIssues: '',
  catalyticConverterDetails: '',
  
  // Cooling System
  overheating: '',
  overheatingDetails: '',
  coolantLeaks: '',
  coolantLeakDetails: '',
  radiatorIssues: '',
  radiatorDetails: '',
  
  // Oil System
  oilPressureIssues: '',
  oilPressureDetails: '',
  oilLeaks: '',
  oilLeakDetails: '',
  oilConsumption: '',
  oilConsumptionDetails: '',
  
  // Electrical System
  batteryIssues: '',
  batteryDetails: '',
  alternatorIssues: '',
  alternatorDetails: '',
  starterIssues: '',
  starterDetails: '',
  checkEngineLight: '',
  checkEngineDetails: '',
  
  // Transmission
  transmissionIssues: '',
  transmissionDetails: '',
  gearShifting: '',
  gearShiftingDetails: '',
  clutchIssues: '',
  clutchDetails: '',
  
  // Environmental Conditions
  temperatureDuringIssue: '',
  drivingConditions: [],
  otherDrivingConditions: '',
  maintenanceHistory: '',
  recentRepairs: ''
};