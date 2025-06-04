import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { PHEVFormData } from '../types/phevDiagnosticForm';
import { getInitialPHEVFormData, savePHEVFormData } from '../utils/phevFormUtils';
import FormSection from './diagnostic/FormSection';
import PHEVGeneralInfoSection from './diagnostic/phev/PHEVGeneralInfoSection';
import PHEVFuelUsageSection from './diagnostic/phev/PHEVFuelUsageSection';
import PHEVYesNoQuestion from './diagnostic/phev/PHEVYesNoQuestion';
import FileUploadSection from './diagnostic/FileUploadSection';

const PHEVDiagnosticForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PHEVFormData>(getInitialPHEVFormData());
  const [expandedSections, setExpandedSections] = useState<string[]>(['general']);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, []);

  const handleInputChange = useCallback((field: keyof PHEVFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCheckboxChange = useCallback((field: keyof PHEVFormData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  }, []);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (files) {
      setFormData(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...Array.from(files)]
      }));
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const recordId = savePHEVFormData(formData);
    navigate(`/print-summary/${recordId}`);
  }, [formData, navigate]);

  const handleBackToDashboard = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">🔌 PHEV Diagnostic Pre-Check Form</h1>
              <p className="text-sm text-slate-400">Plug-in Hybrid Electric Vehicle Assessment</p>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* General Information */}
        <FormSection 
          title="🔹 General Information" 
          sectionKey="general"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <PHEVGeneralInfoSection 
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        </FormSection>

        {/* Fuel Type & Usage */}
        <FormSection 
          title="🔹 Fuel Type & Usage" 
          sectionKey="fuel"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <PHEVFuelUsageSection 
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        </FormSection>

        {/* Battery & Charging */}
        <FormSection 
          title="🔹 Battery & Charging" 
          sectionKey="battery"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <PHEVYesNoQuestion 
              label="Does the battery charge properly through plug-in and regenerative braking?" 
              field="batteryCharging" 
              detailsField="batteryChargingDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">What charger is used?</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="chargerType"
                    value="OEM"
                    checked={formData.chargerType === 'OEM'}
                    onChange={(e) => handleInputChange('chargerType', e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-slate-300">OEM</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="chargerType"
                    value="Aftermarket"
                    checked={formData.chargerType === 'Aftermarket'}
                    onChange={(e) => handleInputChange('chargerType', e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-slate-300">Aftermarket</span>
                </label>
              </div>
              {formData.chargerType === 'Aftermarket' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Brand, model, and installation type:</label>
                  <textarea
                    value={formData.aftermarketDetails}
                    onChange={(e) => handleInputChange('aftermarketDetails', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <PHEVYesNoQuestion 
              label="Is the EV-only range as expected?" 
              field="evRangeExpected" 
              detailsField="evRangeDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion 
              label="Have you noticed excessive ICE (engine) operation despite high battery charge?" 
              field="excessiveIceOperation" 
              detailsField="iceOperationDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Do you usually charge the high-voltage battery to:</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="usualChargeLevel"
                    value="80%"
                    checked={formData.usualChargeLevel === '80%'}
                    onChange={(e) => handleInputChange('usualChargeLevel', e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-slate-300">80%</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="usualChargeLevel"
                    value="100%"
                    checked={formData.usualChargeLevel === '100%'}
                    onChange={(e) => handleInputChange('usualChargeLevel', e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-slate-300">100%</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">How often do you use DC fast-charging?</label>
              <input
                type="text"
                value={formData.dcFastFrequency}
                onChange={(e) => handleInputChange('dcFastFrequency', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="e.g., Daily, Weekly, Monthly, Rarely"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">How long does a typical DC fast-charging session last?</label>
              <input
                type="text"
                value={formData.dcFastDuration}
                onChange={(e) => handleInputChange('dcFastDuration', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="e.g., 30 minutes, 1 hour"
              />
            </div>

            <PHEVYesNoQuestion 
              label="Does the charge rate drop unexpectedly above 50% state-of-charge?" 
              field="chargeRateDrop" 
              detailsField="chargeRateDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Continue with remaining sections... */}
        {/* I'll add the remaining sections to keep the file manageable */}
        {/* Hybrid Operation */}
        <FormSection
          title="🔹 Hybrid Operation"
          sectionKey="hybridOperation"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <PHEVYesNoQuestion
              label="Are there lags or jolts when switching from electric to petrol drive?"
              field="switchingLags"
              detailsField="switchingDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Does the engine start even when in EV mode?"
              field="engineStartEVMode"
              detailsField="engineStartDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Any abnormal vibrations or engine-startup roughness?"
              field="abnormalVibrations"
              detailsField="vibrationsDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Engine & Drivetrain */}
        <FormSection
          title="🔹 Engine & Drivetrain"
          sectionKey="engineDrivetrain"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <PHEVYesNoQuestion
              label="Any clunks, surges, or hesitations when accelerating?"
              field="accelerationIssues"
              detailsField="accelerationDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Does the engine sound louder or harsher than usual?"
              field="engineSound"
              detailsField="engineSoundDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Any burning smell or oil-leak concerns?"
              field="burningSmell"
              detailsField="burningSmellDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Any misfires, vibrations, or loss of power?"
              field="misfires"
              detailsField="misfiresDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* NVH & Ride Quality */}
        <FormSection
          title="🔹 NVH & Ride Quality"
          sectionKey="nvhRideQuality"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <PHEVYesNoQuestion
              label="Are there vibrations or road noise from the underbody?"
              field="underbodyNoise"
              detailsField="underbodyDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Does the car thump, rattle, or squeak under certain road conditions?"
              field="roadConditionNoises"
              detailsField="roadConditionDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Climate Control */}
        <FormSection
          title="🔹 Climate Control"
          sectionKey="climateControl"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <PHEVYesNoQuestion
              label="Is the cabin cooling/heating effectively in both electric and engine-assisted modes?"
              field="hvacEffectiveness"
              detailsField="hvacDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Do the fans or compressors sound abnormal?"
              field="fanSounds"
              detailsField="fanDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Are there temperature-regulation issues?"
              field="temperatureRegulation"
              detailsField="temperatureDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Efficiency */}
        <FormSection
          title="🔹 Efficiency"
          sectionKey="efficiency"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">How does the fuel consumption compare to expected values?</label>
              <textarea
                value={formData.fuelConsumptionDetails}
                onChange={(e) => handleInputChange('fuelConsumptionDetails', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                rows={3}
                placeholder="Describe fuel consumption..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">What is the average electric range under regular use?</label>
              <input
                type="text"
                value={formData.averageElectricRange}
                onChange={(e) => handleInputChange('averageElectricRange', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                placeholder="e.g., 25 miles, 40 km"
              />
            </div>
          </div>
        </FormSection>

        {/* Software & Instrument Cluster */}
        <FormSection
          title="🔹 Software & Instrument Cluster"
          sectionKey="softwareCluster"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <PHEVYesNoQuestion
              label="Any glitches in infotainment or cluster displays?"
              field="infotainmentGlitches"
              detailsField="infotainmentDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Have you received recent OTA software updates?</label>
              <div className="flex space-x-4">
                {['yes', 'no', 'unsure'].map(value => (
                  <label key={value} className="flex items-center">
                    <input
                      type="radio"
                      name="otaUpdates"
                      value={value}
                      checked={formData.otaUpdates === value}
                      onChange={(e) => handleInputChange('otaUpdates', e.target.value)}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-slate-300 capitalize">{value}</span>
                  </label>
                ))}
              </div>
            </div>

            <PHEVYesNoQuestion
              label="Have any features stopped working after a software update?"
              field="brokenFeatures"
              detailsField="brokenFeaturesDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Do any lights flicker or behave abnormally?"
              field="lightFlicker"
              detailsField="lightFlickerDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Regenerative Braking */}
        <FormSection
          title="🔹 Regenerative Braking"
          sectionKey="regenBraking"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <PHEVYesNoQuestion
              label="Is the regenerative braking smooth and predictable?"
              field="smoothRegen"
              detailsField="smoothRegenDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Does it feel stronger or weaker than usual?"
              field="regenStrength"
              detailsField="regenStrengthDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Any unexpected noises when slowing down?"
              field="decelerationNoises"
              detailsField="decelerationNoisesDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Driving Load & Towing */}
        <FormSection
          title="🔹 Driving Load & Towing"
          sectionKey="drivingLoadTowing"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <PHEVYesNoQuestion
              label="Have problems occurred while towing or driving uphill?"
              field="towingIssues"
              detailsField="towingDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Does the vehicle behave differently under heavy load?"
              field="heavyLoadBehavior"
              detailsField="heavyLoadDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Driving-Mode Behavior */}
        <FormSection
          title="🔹 Driving-Mode Behavior"
          sectionKey="drivingModeBehavior"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Which drive modes are regularly used?</label>
              <div className="grid grid-cols-2 gap-2">
                {['EV', 'HEV', 'Sport', 'Eco', 'Snow'].map(mode => (
                  <label key={mode} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.regularModes.includes(mode)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        handleCheckboxChange('regularModes', mode, checked);
                      }}
                      className="mr-2 text-blue-600"
                    />
                    <span className="text-slate-300">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            <PHEVYesNoQuestion
              label="Any inconsistent performance in a specific mode?"
              field="inconsistentPerformance"
              detailsField="inconsistentDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="In Sport mode, is power delivery sharp and linear, or delayed?"
              field="sportModePower"
              detailsField="sportModeDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="In Eco or EV mode, does the vehicle limit power appropriately or unexpectedly activate ICE?"
              field="ecoEvModeLimit"
              detailsField="ecoEvModeDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Do driving modes affect engine or motor noise noticeably?"
              field="modeNoise"
              detailsField="modeNoiseDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Do any warning lights or strange behaviours appear when switching modes?"
              field="modeWarnings"
              detailsField="modeWarningsDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Environmental & Climate Conditions */}
        <FormSection
          title="🌡️ Environmental & Climate Conditions"
          sectionKey="environmentalConditions"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">What was the outside temperature when the issue occurred?</label>
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Was the vehicle parked in a garage, open space, or shaded area?</label>
              <div className="flex space-x-4">
                {['Garage', 'Open space', 'Shaded area'].map(parking => (
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Were the problems noticed more during cold mornings or hot afternoons?</label>
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

            <PHEVYesNoQuestion
              label="Did the HVAC system perform differently in hot, humid, or cold/dry weather?"
              field="hvacWeatherDifference"
              detailsField="hvacWeatherDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Was the battery range or regen braking significantly affected by temperature?"
              field="rangeRegenTemp"
              detailsField="rangeRegenDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />

            <PHEVYesNoQuestion
              label="Any visible signs of moisture or condensation in the charging port?"
              field="moistureChargingPort"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* File Upload Section */}
        <FormSection
          title="Evidence Upload"
          sectionKey="upload"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <FileUploadSection
            formData={formData}
            onFileUpload={handleFileUpload}
          />
        </FormSection>
        
        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleBackToDashboard}
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

export default PHEVDiagnosticForm;
