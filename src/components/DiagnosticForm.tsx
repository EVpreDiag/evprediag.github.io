
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, ChevronDown, ChevronUp } from 'lucide-react';

interface FormData {
  // General Information
  customerName: string;
  vin: string;
  roNumber: string;
  makeModel: string;
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
  
  // File uploads
  uploadedFiles: File[];
}

const DiagnosticForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
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

  const [expandedSections, setExpandedSections] = useState<string[]>(['general']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: keyof FormData, value: string, checked: boolean) => {
    const currentArray = formData[field] as string[];
    if (checked) {
      handleInputChange(field, [...currentArray, value]);
    } else {
      handleInputChange(field, currentArray.filter(item => item !== value));
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setFormData(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...Array.from(files)]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage (in real app, this would be sent to Supabase)
    const savedRecords = JSON.parse(localStorage.getItem('evDiagnosticRecords') || '[]');
    const newRecord = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      technician: JSON.parse(localStorage.getItem('evDiagUser') || '{}').username
    };
    
    savedRecords.push(newRecord);
    localStorage.setItem('evDiagnosticRecords', JSON.stringify(savedRecords));
    
    // Navigate to print summary
    navigate(`/print-summary/${newRecord.id}`);
  };

  const YesNoQuestion = ({ 
    label, 
    field, 
    detailsField, 
    detailsLabel = "Please provide details:" 
  }: {
    label: string;
    field: keyof FormData;
    detailsField?: keyof FormData;
    detailsLabel?: string;
  }) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name={String(field)}
            value="yes"
            checked={formData[field] === 'yes'}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="mr-2 text-blue-600"
          />
          <span className="text-slate-300">Yes</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name={String(field)}
            value="no"
            checked={formData[field] === 'no'}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="mr-2 text-blue-600"
          />
          <span className="text-slate-300">No</span>
        </label>
      </div>
      {formData[field] === 'yes' && detailsField && (
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">{detailsLabel}</label>
          <textarea
            value={String(formData[detailsField] || '')}
            onChange={(e) => handleInputChange(detailsField, e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            rows={3}
          />
        </div>
      )}
    </div>
  );

  const FormSection = ({ title, children, sectionKey }: { 
    title: string; 
    children: React.ReactNode;
    sectionKey: string;
  }) => (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-6 py-4 bg-slate-700/50 flex items-center justify-between text-left hover:bg-slate-700/70 transition-colors"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {expandedSections.includes(sectionKey) ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {expandedSections.includes(sectionKey) && (
        <div className="p-6 space-y-6">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">EV Diagnostic Pre-Check Form</h1>
              <p className="text-sm text-slate-400">Complete comprehensive vehicle assessment</p>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* General Information */}
        <FormSection title="General Information" sectionKey="general">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Customer Name</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">VIN</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">RO Number</label>
              <input
                type="text"
                value={formData.roNumber}
                onChange={(e) => handleInputChange('roNumber', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Make/Model</label>
              <input
                type="text"
                value={formData.makeModel}
                onChange={(e) => handleInputChange('makeModel', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mileage</label>
              <input
                type="text"
                value={formData.mileage}
                onChange={(e) => handleInputChange('mileage', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                required
              />
            </div>
          </div>
        </FormSection>

        {/* Battery & Charging */}
        <FormSection title="Battery & Charging" sectionKey="battery">
          <div className="space-y-6">
            <YesNoQuestion 
              label="Any charging issues at home?" 
              field="chargingIssuesHome" 
              detailsField="chargingIssuesHomeDetails"
            />
            <YesNoQuestion 
              label="Any charging issues at public stations?" 
              field="chargingIssuesPublic" 
              detailsField="chargingIssuesPublicDetails"
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Type of charger used</label>
              <select
                value={formData.chargerType}
                onChange={(e) => handleInputChange('chargerType', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="">Select charger type</option>
                <option value="level1">Level 1 (120V)</option>
                <option value="level2">Level 2 (240V)</option>
                <option value="dcfast">DC Fast Charging</option>
                <option value="tesla">Tesla Supercharger</option>
              </select>
            </div>

            <YesNoQuestion 
              label="Using aftermarket charger?" 
              field="aftermarketCharger" 
              detailsField="aftermarketDetails"
              detailsLabel="Please specify brand, model, kW rating, and certification:"
            />
            
            <YesNoQuestion 
              label="Recent incomplete or failed charges?" 
              field="failedCharges" 
              detailsField="failedChargesDetails"
            />
            
            <YesNoQuestion 
              label="Drop in driving range?" 
              field="rangeDrop" 
              detailsField="rangeDropDetails"
            />
            
            <YesNoQuestion 
              label="Battery dashboard warnings?" 
              field="batteryWarnings" 
              detailsField="batteryWarningsDetails"
            />
            
            <YesNoQuestion 
              label="Sudden power loss or 'EV Power Limited' messages?" 
              field="powerLoss" 
              detailsField="powerLossDetails"
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Usual charge level</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="usualChargeLevel"
                    value="80"
                    checked={formData.usualChargeLevel === '80'}
                    onChange={(e) => handleInputChange('usualChargeLevel', e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-slate-300">80%</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="usualChargeLevel"
                    value="100"
                    checked={formData.usualChargeLevel === '100'}
                    onChange={(e) => handleInputChange('usualChargeLevel', e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-slate-300">100%</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">DC fast charging frequency (select all that apply)</label>
              <div className="grid grid-cols-2 gap-2">
                {['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'].map(freq => (
                  <label key={freq} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dcFastFrequency.includes(freq)}
                      onChange={(e) => handleCheckboxChange('dcFastFrequency', freq, e.target.checked)}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-slate-300">{freq}</span>
                  </label>
                ))}
              </div>
            </div>

            <YesNoQuestion 
              label="Charge rate drop above/below 50% SOC?" 
              field="chargeRateDrop"
            />
          </div>
        </FormSection>

        {/* Drivetrain & Performance */}
        <FormSection title="Drivetrain & Performance" sectionKey="drivetrain">
          <div className="space-y-6">
            <YesNoQuestion 
              label="Consistent acceleration?" 
              field="consistentAcceleration" 
              detailsField="accelerationDetails"
            />
            <YesNoQuestion 
              label="Whining or grinding noises?" 
              field="whiningNoises" 
              detailsField="whiningDetails"
            />
            <YesNoQuestion 
              label="Jerking or hesitation under acceleration?" 
              field="jerkingHesitation" 
              detailsField="jerkingDetails"
            />
          </div>
        </FormSection>

        {/* NVH (Noise, Vibration, Harshness) */}
        <FormSection title="NVH (Noise, Vibration, Harshness)" sectionKey="nvh">
          <div className="space-y-6">
            <YesNoQuestion 
              label="Any vibrations?" 
              field="vibrations" 
              detailsField="vibrationsDetails"
            />
            <YesNoQuestion 
              label="Noises during specific actions (acceleration, regen, cornering)?" 
              field="noisesActions" 
              detailsField="noisesActionsDetails"
            />
            <YesNoQuestion 
              label="Rattles or thumps on rough roads?" 
              field="rattlesRoads" 
              detailsField="rattlesDetails"
            />
          </div>
        </FormSection>

        {/* Climate Control System */}
        <FormSection title="Climate Control System" sectionKey="climate">
          <div className="space-y-6">
            <YesNoQuestion 
              label="HVAC performance satisfactory?" 
              field="hvacPerformance" 
              detailsField="hvacDetails"
            />
            <YesNoQuestion 
              label="Any smells or noises from vents?" 
              field="smellsNoises" 
              detailsField="smellsNoisesDetails"
            />
            <YesNoQuestion 
              label="Defogger performance adequate?" 
              field="defoggerPerformance" 
              detailsField="defoggerDetails"
            />
          </div>
        </FormSection>

        {/* Electrical & Software Systems */}
        <FormSection title="Electrical & Software Systems" sectionKey="electrical">
          <div className="space-y-6">
            <YesNoQuestion 
              label="Any infotainment glitches?" 
              field="infotainmentGlitches" 
              detailsField="infotainmentDetails"
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Awareness of recent OTA updates</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="otaUpdates"
                    value="yes"
                    checked={formData.otaUpdates === 'yes'}
                    onChange={(e) => handleInputChange('otaUpdates', e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-slate-300">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="otaUpdates"
                    value="no"
                    checked={formData.otaUpdates === 'no'}
                    onChange={(e) => handleInputChange('otaUpdates', e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-slate-300">No</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="otaUpdates"
                    value="unsure"
                    checked={formData.otaUpdates === 'unsure'}
                    onChange={(e) => handleInputChange('otaUpdates', e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-slate-300">Unsure</span>
                </label>
              </div>
            </div>

            <YesNoQuestion 
              label="Features broken after update?" 
              field="brokenFeatures" 
              detailsField="brokenFeaturesDetails"
            />
            
            <YesNoQuestion 
              label="Light flicker or abnormal behavior?" 
              field="lightFlicker" 
              detailsField="lightFlickerDetails"
            />
          </div>
        </FormSection>

        {/* Regenerative Braking */}
        <FormSection title="Regenerative Braking" sectionKey="regen">
          <div className="space-y-6">
            <YesNoQuestion 
              label="Smooth regenerative braking?" 
              field="smoothRegen" 
              detailsField="smoothRegenDetails"
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Does regen strength feel different?</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="regenStrength"
                    value="yes"
                    checked={formData.regenStrength === 'yes'}
                    onChange={(e) => handleInputChange('regenStrength', e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-slate-300">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="regenStrength"
                    value="no"
                    checked={formData.regenStrength === 'no'}
                    onChange={(e) => handleInputChange('regenStrength', e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-slate-300">No</span>
                </label>
              </div>
              {formData.regenStrength === 'yes' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Please describe:</label>
                  <textarea
                    value={formData.regenStrengthDetails}
                    onChange={(e) => handleInputChange('regenStrengthDetails', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <YesNoQuestion 
              label="Any noises during deceleration?" 
              field="decelerationNoises" 
              detailsField="decelerationNoisesDetails"
            />
          </div>
        </FormSection>

        {/* Driving Conditions */}
        <FormSection title="Driving Conditions" sectionKey="driving">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">When do issues occur? (select all that apply)</label>
              <div className="grid grid-cols-2 gap-2">
                {['Cold weather', 'Hot weather', 'Highway driving', 'Uphill', 'Downhill', 'City driving', 'Other'].map(condition => (
                  <label key={condition} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.issueConditions.includes(condition)}
                      onChange={(e) => handleCheckboxChange('issueConditions', condition, e.target.checked)}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-slate-300">{condition}</span>
                  </label>
                ))}
              </div>
              {formData.issueConditions.includes('Other') && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={formData.otherConditions}
                    onChange={(e) => handleInputChange('otherConditions', e.target.value)}
                    placeholder="Please specify other conditions"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  />
                </div>
              )}
            </div>

            <YesNoQuestion 
              label="Any towing or high-load cases?" 
              field="towingHighLoad"
            />
          </div>
        </FormSection>

        {/* Driving Mode Awareness */}
        <FormSection title="Driving Mode Awareness" sectionKey="modes">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Primary driving mode</label>
              <select
                value={formData.primaryMode}
                onChange={(e) => handleInputChange('primaryMode', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
              >
                <option value="">Select primary mode</option>
                <option value="eco">Eco</option>
                <option value="normal">Normal</option>
                <option value="sport">Sport</option>
                <option value="snow">Snow</option>
                <option value="individual">Individual</option>
              </select>
            </div>

            <YesNoQuestion 
              label="Noticed differences between modes?" 
              field="modesDifferences" 
              detailsField="modesDifferencesDetails"
            />
            
            <YesNoQuestion 
              label="Issues only in specific mode?" 
              field="specificModeIssues" 
              detailsField="specificModeDetails"
            />
            
            <YesNoQuestion 
              label="Mode switching causes system lags/warnings?" 
              field="modeSwitchingLags" 
              detailsField="modeSwitchingDetails"
            />
          </div>
        </FormSection>

        {/* Environmental & Climate Conditions */}
        <FormSection title="Environmental & Climate Conditions" sectionKey="environmental">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Temperature during issue</label>
              <div className="flex space-x-4">
                {['Cold', 'Normal', 'Hot'].map(temp => (
                  <label key={temp} className="flex items-center">
                    <input
                      type="radio"
                      name="temperatureDuringIssue"
                      value={temp.toLowerCase()}
                      checked={formData.temperatureDuringIssue === temp.toLowerCase()}
                      onChange={(e) => handleInputChange('temperatureDuringIssue', e.target.value)}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-slate-300">{temp}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Vehicle typically parked</label>
              <div className="flex space-x-4">
                {['Garage', 'Open air', 'Shaded area'].map(parking => (
                  <label key={parking} className="flex items-center">
                    <input
                      type="radio"
                      name="vehicleParked"
                      value={parking.toLowerCase().replace(' ', '_')}
                      checked={formData.vehicleParked === parking.toLowerCase().replace(' ', '_')}
                      onChange={(e) => handleInputChange('vehicleParked', e.target.value)}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-slate-300">{parking}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Time of day issues occur</label>
              <div className="flex space-x-4">
                {['Cold mornings', 'Hot afternoons', 'Any time'].map(time => (
                  <label key={time} className="flex items-center">
                    <input
                      type="radio"
                      name="timeOfDay"
                      value={time.toLowerCase().replace(' ', '_')}
                      checked={formData.timeOfDay === time.toLowerCase().replace(' ', '_')}
                      onChange={(e) => handleInputChange('timeOfDay', e.target.value)}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-slate-300">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            <YesNoQuestion 
              label="HVAC difference in different weather (humid/cold/dry)?" 
              field="hvacWeatherDifference" 
              detailsField="hvacWeatherDetails"
            />
            
            <YesNoQuestion 
              label="Range or regen affected by temperature?" 
              field="rangeRegenTemp"
            />
            
            <YesNoQuestion 
              label="Moisture/condensation in charging port?" 
              field="moistureChargingPort"
            />
          </div>
        </FormSection>

        {/* File Upload Section */}
        <FormSection title="Evidence Upload" sectionKey="upload">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Upload photos, dash screenshots, or videos
              </label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">Click to upload or drag and drop files here</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer inline-block"
                >
                  Choose Files
                </label>
              </div>
              {formData.uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-slate-300 mb-2">Uploaded files:</p>
                  <ul className="space-y-1">
                    {formData.uploadedFiles.map((file, index) => (
                      <li key={index} className="text-sm text-slate-400">
                        {file.name} ({Math.round(file.size / 1024)}KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </FormSection>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save & Print</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiagnosticForm;
