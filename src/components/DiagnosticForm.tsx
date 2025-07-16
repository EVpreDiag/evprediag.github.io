
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { FormData } from '../types/diagnosticForm';
import { getInitialFormData, saveFormData } from '../utils/formUtils';
import { supabase } from '../integrations/supabase/client';
import { secureLog } from '../utils/securityUtils';
import { useAuth } from '../contexts/AuthContext';
import FormSection from './diagnostic/FormSection';
import GeneralInfoSection from './diagnostic/GeneralInfoSection';
import BatterySection from './diagnostic/BatterySection';
import DrivetrainSection from './diagnostic/DrivetrainSection';
import YesNoQuestion from './diagnostic/YesNoQuestion';

const DiagnosticForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [expandedSections, setExpandedSections] = useState<string[]>(['general']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditMode);

  // Load existing record data if in edit mode
  useEffect(() => {
    if (isEditMode && editId && user) {
      loadExistingRecord(editId);
    }
  }, [isEditMode, editId, user]);

  const loadExistingRecord = async (recordId: string) => {
    try {
      setLoading(true);
      setSubmitError(null);

      // Fetch the record - RLS will automatically enforce station-based access control
      const { data, error } = await supabase
        .from('ev_diagnostic_records')
        .select('*')
        .eq('id', recordId)
        .single();

      if (error) {
        secureLog('Error loading EV record for edit', 'error', { error: error.message });
        if (error.code === 'PGRST116') {
          setSubmitError('Record not found or you do not have permission to edit this record.');
        } else {
          throw error;
        }
        return;
      }

      if (data) {
        // Convert database record to form data
        const loadedFormData: FormData = {
          ...getInitialFormData(),
          customerName: data.customer_name || '',
          vin: data.vin || '',
          roNumber: data.ro_number || '',
          vehicleMake: data.make_model ? data.make_model.split(/\s+/)[0] : '',
          model: data.make_model ? data.make_model.split(/\s+/).slice(1).join(' ') : '',
          mileage: data.mileage || '',
          chargerType: data.charger_type || '',
          aftermarketCharger: data.aftermarket_charger || '',
          aftermarketDetails: data.aftermarket_details || '',
          usualChargeLevel: data.usual_charge_level || '',
          dcFastFrequency: data.dc_fast_frequency || [],
          chargingIssuesHome: data.charging_issues_home || '',
          chargingIssuesHomeDetails: data.charging_issues_home_details || '',
          chargingIssuesPublic: data.charging_issues_public || '',
          chargingIssuesPublicDetails: data.charging_issues_public_details || '',
          failedCharges: data.failed_charges || '',
          failedChargesDetails: data.failed_charges_details || '',
          chargeRateDrop: data.charge_rate_drop || '',
          rangeDrop: data.range_drop || '',
          rangeDropDetails: data.range_drop_details || '',
          batteryWarnings: data.battery_warnings || '',
          batteryWarningsDetails: data.battery_warnings_details || '',
          powerLoss: data.power_loss || '',
          powerLossDetails: data.power_loss_details || '',
          consistentAcceleration: data.consistent_acceleration || '',
          accelerationDetails: data.acceleration_details || '',
          whiningNoises: data.whining_noises || '',
          whiningDetails: data.whining_details || '',
          jerkingHesitation: data.jerking_hesitation || '',
          jerkingDetails: data.jerking_details || '',
          vibrations: data.vibrations || '',
          vibrationsDetails: data.vibrations_details || '',
          noisesActions: data.noises_actions || '',
          noisesActionsDetails: data.noises_actions_details || '',
          rattlesRoads: data.rattles_roads || '',
          rattlesDetails: data.rattles_details || '',
          hvacPerformance: data.hvac_performance || '',
          hvacDetails: data.hvac_details || '',
          smellsNoises: data.smells_noises || '',
          smellsNoisesDetails: data.smells_noises_details || '',
          defoggerPerformance: data.defogger_performance || '',
          defoggerDetails: data.defogger_details || '',
          infotainmentGlitches: data.infotainment_glitches || '',
          infotainmentDetails: data.infotainment_details || '',
          otaUpdates: data.ota_updates || '',
          brokenFeatures: data.broken_features || '',
          brokenFeaturesDetails: data.broken_features_details || '',
          lightFlicker: data.light_flicker || '',
          lightFlickerDetails: data.light_flicker_details || '',
          smoothRegen: data.smooth_regen || '',
          smoothRegenDetails: data.smooth_regen_details || '',
          regenStrength: data.regen_strength || '',
          regenStrengthDetails: data.regen_strength_details || '',
          decelerationNoises: data.deceleration_noises || '',
          decelerationNoisesDetails: data.deceleration_noises_details || '',
          issueConditions: data.issue_conditions || [],
          otherConditions: data.other_conditions || '',
          towingHighLoad: data.towing_high_load || '',
          primaryMode: data.primary_mode || '',
          modesDifferences: data.modes_differences || '',
          modesDifferencesDetails: data.modes_differences_details || '',
          specificModeIssues: data.specific_mode_issues || '',
          specificModeDetails: data.specific_mode_details || '',
          modeSwitchingLags: data.mode_switching_lags || '',
          modeSwitchingDetails: data.mode_switching_details || '',
          temperatureDuringIssue: data.temperature_during_issue || '',
          vehicleParked: data.vehicle_parked || '',
          timeOfDay: data.time_of_day || '',
          hvacWeatherDifference: data.hvac_weather_difference || '',
          hvacWeatherDetails: data.hvac_weather_details || '',
          rangeRegenTemp: data.range_regen_temp || '',
          moistureChargingPort: data.moisture_charging_port || ''
        };

        setFormData(loadedFormData);
        secureLog('EV record loaded for editing', 'info');
      }
    } catch (error) {
      secureLog('Error loading record for edit', 'error', error);
      setSubmitError('Failed to load record for editing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let recordId;
      
      if (isEditMode && editId) {
        // Update existing record - RLS will automatically enforce station-based access control
        const { error } = await supabase
          .from('ev_diagnostic_records')
          .update({
            customer_name: formData.customerName,
            vin: formData.vin,
            ro_number: formData.roNumber,
            make_model: `${formData.vehicleMake} ${formData.model}`.trim(),
            mileage: formData.mileage,
            charger_type: formData.chargerType,
            aftermarket_charger: formData.aftermarketCharger,
            aftermarket_details: formData.aftermarketDetails,
            usual_charge_level: formData.usualChargeLevel,
            dc_fast_frequency: formData.dcFastFrequency,
            charging_issues_home: formData.chargingIssuesHome,
            charging_issues_home_details: formData.chargingIssuesHomeDetails,
            charging_issues_public: formData.chargingIssuesPublic,
            charging_issues_public_details: formData.chargingIssuesPublicDetails,
            failed_charges: formData.failedCharges,
            failed_charges_details: formData.failedChargesDetails,
            charge_rate_drop: formData.chargeRateDrop,
            range_drop: formData.rangeDrop,
            range_drop_details: formData.rangeDropDetails,
            battery_warnings: formData.batteryWarnings,
            battery_warnings_details: formData.batteryWarningsDetails,
            power_loss: formData.powerLoss,
            power_loss_details: formData.powerLossDetails,
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
            updated_at: new Date().toISOString()
          })
          .eq('id', editId);

        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error('You do not have permission to edit this record.');
          }
          throw error;
        }
        recordId = editId;
        secureLog('EV record updated successfully', 'info');
      } else {
        // Create new record
        recordId = await saveFormData(formData);
      }

      navigate(`/print-summary/ev/${recordId}`);
    } catch (error) {
      console.error('Error saving form:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to save diagnostic record');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, navigate, isEditMode, editId]);

  const handleBackToDashboard = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading record...</div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-white">
                {isEditMode ? 'Edit EV Diagnostic Record' : 'EV Diagnostic Pre-Check Form'}
              </h1>
              <p className="text-sm text-slate-400">
                {isEditMode ? 'Update existing vehicle assessment' : 'Complete comprehensive vehicle assessment'}
              </p>
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
              label="Any concerns with HVAC efficiency?" 
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
              label="Issue with smooth regenerative braking?" 
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

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          {submitError && (
            <div className="text-red-400 text-sm mr-4 self-center">
              {submitError}
            </div>
          )}
          <button
            type="button"
            onClick={handleBackToDashboard}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isEditMode ? 'Updating...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{isEditMode ? 'Update & Print' : 'Save & Print'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DiagnosticForm;
