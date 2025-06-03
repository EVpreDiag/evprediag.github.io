
import { FormData } from '../types/diagnosticForm';

export const getInitialFormData = (): FormData => ({
  customerName: '',
  vin: '',
  roNumber: '',
  makeModel: '',
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
  moistureChargingPort: '',
  uploadedFiles: []
});

export const saveFormData = (formData: FormData) => {
  const savedRecords = JSON.parse(localStorage.getItem('evDiagnosticRecords') || '[]');
  const newRecord = {
    id: Date.now().toString(),
    ...formData,
    createdAt: new Date().toISOString(),
    technician: JSON.parse(localStorage.getItem('evDiagUser') || '{}').username
  };
  
  savedRecords.push(newRecord);
  localStorage.setItem('evDiagnosticRecords', JSON.stringify(savedRecords));
  
  return newRecord.id;
};
