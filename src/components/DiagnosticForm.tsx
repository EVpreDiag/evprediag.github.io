
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { FormData } from '../types/diagnosticForm';
import { getInitialFormData, saveFormData } from '../utils/formUtils';
import FormSection from './diagnostic/FormSection';
import GeneralInfoSection from './diagnostic/GeneralInfoSection';
import BatterySection from './diagnostic/BatterySection';
import DrivetrainSection from './diagnostic/DrivetrainSection';
import FileUploadSection from './diagnostic/FileUploadSection';
import YesNoQuestion from './diagnostic/YesNoQuestion';

const DiagnosticForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [expandedSections, setExpandedSections] = useState<string[]>(['general']);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  }, []);

  const handleInputChange = useCallback((field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCheckboxChange = useCallback((field: keyof FormData, value: string, checked: boolean) => {
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
    const recordId = saveFormData(formData);
    navigate(`/print-summary/${recordId}`);
  }, [formData, navigate]);

  const handleBackToDashboard = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
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
              <h1 className="text-xl font-bold text-white">EV Diagnostic Pre-Check Form</h1>
              <p className="text-sm text-slate-400">Complete comprehensive vehicle assessment</p>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* General Information */}
        <FormSection 
          title="General Information" 
          sectionKey="general"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <GeneralInfoSection 
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        </FormSection>

        {/* Battery & Charging */}
        <FormSection 
          title="Battery & Charging" 
          sectionKey="battery"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <BatterySection 
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        </FormSection>

        {/* Drivetrain & Performance */}
        <FormSection 
          title="Drivetrain & Performance" 
          sectionKey="drivetrain"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <DrivetrainSection 
            formData={formData}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        </FormSection>

        {/* NVH (Noise, Vibration, Harshness) */}
        <FormSection 
          title="NVH (Noise, Vibration, Harshness)" 
          sectionKey="nvh"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <YesNoQuestion 
              label="Any vibrations?" 
              field="vibrations" 
              detailsField="vibrationsDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
            <YesNoQuestion 
              label="Noises during specific actions (acceleration, regen, cornering)?" 
              field="noisesActions" 
              detailsField="noisesActionsDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
            <YesNoQuestion 
              label="Rattles or thumps on rough roads?" 
              field="rattlesRoads" 
              detailsField="rattlesDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Climate Control System */}
        <FormSection 
          title="Climate Control System" 
          sectionKey="climate"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <YesNoQuestion 
              label="HVAC performance satisfactory?" 
              field="hvacPerformance" 
              detailsField="hvacDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
            <YesNoQuestion 
              label="Any smells or noises from vents?" 
              field="smellsNoises" 
              detailsField="smellsNoisesDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
            <YesNoQuestion 
              label="Defogger performance adequate?" 
              field="defoggerPerformance" 
              detailsField="defoggerDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Electrical & Software Systems */}
        <FormSection 
          title="Electrical & Software Systems" 
          sectionKey="electrical"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <YesNoQuestion 
              label="Any infotainment glitches?" 
              field="infotainmentGlitches" 
              detailsField="infotainmentDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Awareness of recent OTA updates</label>
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

            <YesNoQuestion 
              label="Features broken after update?" 
              field="brokenFeatures" 
              detailsField="brokenFeaturesDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
            
            <YesNoQuestion 
              label="Light flicker or abnormal behavior?" 
              field="lightFlicker" 
              detailsField="lightFlickerDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Regenerative Braking */}
        <FormSection 
          title="Regenerative Braking" 
          sectionKey="regen"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
          <div className="space-y-6">
            <YesNoQuestion 
              label="Smooth regenerative braking?" 
              field="smoothRegen" 
              detailsField="smoothRegenDetails"
              formData={formData}
              onInputChange={handleInputChange}
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
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Driving Conditions */}
        <FormSection 
          title="Driving Conditions" 
          sectionKey="driving"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
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
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Driving Mode Awareness */}
        <FormSection 
          title="Driving Mode Awareness" 
          sectionKey="modes"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
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
              formData={formData}
              onInputChange={handleInputChange}
            />
            
            <YesNoQuestion 
              label="Issues only in specific mode?" 
              field="specificModeIssues" 
              detailsField="specificModeDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
            
            <YesNoQuestion 
              label="Mode switching causes system lags/warnings?" 
              field="modeSwitchingLags" 
              detailsField="modeSwitchingDetails"
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>
        </FormSection>

        {/* Environmental & Climate Conditions */}
        <FormSection 
          title="Environmental & Climate Conditions" 
          sectionKey="environmental"
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
        >
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
              formData={formData}
              onInputChange={handleInputChange}
            />
            
            <YesNoQuestion 
              label="Range or regen affected by temperature?" 
              field="rangeRegenTemp"
              formData={formData}
              onInputChange={handleInputChange}
            />
            
            <YesNoQuestion 
              label="Moisture/condensation in charging port?" 
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

export default DiagnosticForm;
