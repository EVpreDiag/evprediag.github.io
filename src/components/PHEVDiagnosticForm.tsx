import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { PHEVFormData } from '../types/phevDiagnosticForm';
import { getInitialPHEVFormData, savePHEVFormData } from '../utils/phevFormUtils';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { checkRecordOwnership } from '../utils/securityUtils';
import FormSection from './diagnostic/FormSection';
import PHEVGeneralInfoSection from './diagnostic/phev/PHEVGeneralInfoSection';
import PHEVFuelUsageSection from './diagnostic/phev/PHEVFuelUsageSection';
import PHEVYesNoQuestion from './diagnostic/phev/PHEVYesNoQuestion';

const PHEVDiagnosticForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [formData, setFormData] = useState<PHEVFormData>(getInitialPHEVFormData());
  const [expandedSections, setExpandedSections] = useState<string[]>(['general']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditMode);
  
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

  // Load existing record data if editing
  useEffect(() => {
    if (isEditMode && editId && user) {
      loadExistingRecord(editId);
    }
  }, [isEditMode, editId, user]);

  const loadExistingRecord = async (recordId: string) => {
    try {
      setLoading(true);
      setSubmitError(null);

      if (!isAdmin()) {
        const hasOwnership = await checkRecordOwnership(recordId, 'phev_diagnostic_records');
        if (!hasOwnership) {
          setSubmitError('You can only edit your own records.');
          return;
        }
      }

      const { data, error } = await supabase
        .from('phev_diagnostic_records')
        .select('*')
        .eq('id', recordId)
        .single();

      if (error) {
        console.error('Error loading PHEV record for edit:', error);
        throw error;
      }

      if (data) {
        const loadedFormData: PHEVFormData = {
          ...getInitialPHEVFormData(),
          customerName: data.customer_name || '',
          vin: data.vin || '',
          roNumber: data.ro_number || '',
          vehicleMake: data.vehicle_make || '',
          model: data.model || '',
          mileage: data.mileage || '',
          fuelType: data.fuel_type || '',
          fuelSource: data.fuel_source || '',
          petrolVsEvUsage: data.petrol_vs_ev_usage || '',
          fuelEconomyChange: data.fuel_economy_change || '',
          fuelEconomyDetails: data.fuel_economy_details || '',
          batteryCharging: data.battery_charging || '',
          batteryChargingDetails: data.battery_charging_details || '',
          chargerType: data.charger_type || '',
          aftermarketCharger: data.aftermarket_charger || '',
          aftermarketDetails: data.aftermarket_details || '',
          evRangeExpected: data.ev_range_expected || '',
          evRangeDetails: data.ev_range_details || '',
          excessiveIceOperation: data.excessive_ice_operation || '',
          iceOperationDetails: data.ice_operation_details || '',
          usualChargeLevel: data.usual_charge_level || '',
          dcFastFrequency: data.dc_fast_frequency || '',
          dcFastDuration: data.dc_fast_duration || '',
          chargeRateDrop: data.charge_rate_drop || '',
          chargeRateDetails: data.charge_rate_details || '',
          switchingLags: data.switching_lags || '',
          switchingDetails: data.switching_details || '',
          engineStartEVMode: data.engine_start_ev_mode || '',
          engineStartDetails: data.engine_start_details || '',
          abnormalVibrations: data.abnormal_vibrations || '',
          vibrationsDetails: data.vibrations_details || '',
          accelerationIssues: data.acceleration_issues || '',
          accelerationDetails: data.acceleration_details || '',
          engineSound: data.engine_sound || '',
          engineSoundDetails: data.engine_sound_details || '',
          burningSmell: data.burning_smell || '',
          burningSmellDetails: data.burning_smell_details || '',
          misfires: data.misfires || '',
          misfiresDetails: data.misfires_details || '',
          underbodyNoise: data.underbody_noise || '',
          underbodyDetails: data.underbody_details || '',
          roadConditionNoises: data.road_condition_noises || '',
          roadConditionDetails: data.road_condition_details || '',
          hvacEffectiveness: data.hvac_effectiveness || '',
          hvacDetails: data.hvac_details || '',
          fanSounds: data.fan_sounds || '',
          fanDetails: data.fan_details || '',
          temperatureRegulation: data.temperature_regulation || '',
          temperatureDetails: data.temperature_details || '',
          fuelConsumption: data.fuel_consumption || '',
          fuelConsumptionDetails: data.fuel_consumption_details || '',
          averageElectricRange: data.average_electric_range || '',
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
          towingIssues: data.towing_issues || '',
          towingDetails: data.towing_details || '',
          heavyLoadBehavior: data.heavy_load_behavior || '',
          heavyLoadDetails: data.heavy_load_details || '',
          regularModes: data.regular_modes || [],
          inconsistentPerformance: data.inconsistent_performance || '',
          inconsistentDetails: data.inconsistent_details || '',
          sportModePower: data.sport_mode_power || '',
          sportModeDetails: data.sport_mode_details || '',
          ecoEvModeLimit: data.eco_ev_mode_limit || '',
          ecoEvModeDetails: data.eco_ev_mode_details || '',
          modeNoise: data.mode_noise || '',
          modeNoiseDetails: data.mode_noise_details || '',
          modeWarnings: data.mode_warnings || '',
          modeWarningsDetails: data.mode_warnings_details || '',
          temperatureDuringIssue: data.temperature_during_issue || '',
          vehicleParked: data.vehicle_parked || '',
          timeOfDay: data.time_of_day || '',
          hvacWeatherDifference: data.hvac_weather_difference || '',
          hvacWeatherDetails: data.hvac_weather_details || '',
          rangeRegenTemp: data.range_regen_temp || '',
          rangeRegenDetails: data.range_regen_details || '',
          moistureChargingPort: data.moisture_charging_port || ''
        };

        setFormData(loadedFormData);
      }
    } catch (error) {
      console.error('Error loading record for edit:', error);
      setSubmitError('Failed to load record for editing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let recordId;

      if (isEditMode && editId) {
        const { error } = await supabase
          .from('phev_diagnostic_records')
          .update({
            customer_name: formData.customerName,
            vin: formData.vin,
            ro_number: formData.roNumber,
            vehicle_make: formData.vehicleMake,
            model: formData.model,
            mileage: formData.mileage,
            fuel_type: formData.fuelType,
            fuel_source: formData.fuelSource,
            petrol_vs_ev_usage: formData.petrolVsEvUsage,
            fuel_economy_change: formData.fuelEconomyChange,
            fuel_economy_details: formData.fuelEconomyDetails,
            battery_charging: formData.batteryCharging,
            battery_charging_details: formData.batteryChargingDetails,
            charger_type: formData.chargerType,
            aftermarket_charger: formData.aftermarketCharger,
            aftermarket_details: formData.aftermarketDetails,
            ev_range_expected: formData.evRangeExpected,
            ev_range_details: formData.evRangeDetails,
            excessive_ice_operation: formData.excessiveIceOperation,
            ice_operation_details: formData.iceOperationDetails,
            usual_charge_level: formData.usualChargeLevel,
            dc_fast_frequency: formData.dcFastFrequency,
            dc_fast_duration: formData.dcFastDuration,
            charge_rate_drop: formData.chargeRateDrop,
            charge_rate_details: formData.chargeRateDetails,
            switching_lags: formData.switchingLags,
            switching_details: formData.switchingDetails,
            engine_start_ev_mode: formData.engineStartEVMode,
            engine_start_details: formData.engineStartDetails,
            abnormal_vibrations: formData.abnormalVibrations,
            vibrations_details: formData.vibrationsDetails,
            acceleration_issues: formData.accelerationIssues,
            acceleration_details: formData.accelerationDetails,
            engine_sound: formData.engineSound,
            engine_sound_details: formData.engineSoundDetails,
            burning_smell: formData.burningSmell,
            burning_smell_details: formData.burningSmellDetails,
            misfires: formData.misfires,
            misfires_details: formData.misfiresDetails,
            underbody_noise: formData.underbodyNoise,
            underbody_details: formData.underbodyDetails,
            road_condition_noises: formData.roadConditionNoises,
            road_condition_details: formData.roadConditionDetails,
            hvac_effectiveness: formData.hvacEffectiveness,
            hvac_details: formData.hvacDetails,
            fan_sounds: formData.fanSounds,
            fan_details: formData.fanDetails,
            temperature_regulation: formData.temperatureRegulation,
            temperature_details: formData.temperatureDetails,
            fuel_consumption: formData.fuelConsumption,
            fuel_consumption_details: formData.fuelConsumptionDetails,
            average_electric_range: formData.averageElectricRange,
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
            towing_issues: formData.towingIssues,
            towing_details: formData.towingDetails,
            heavy_load_behavior: formData.heavyLoadBehavior,
            heavy_load_details: formData.heavyLoadDetails,
            regular_modes: formData.regularModes,
            inconsistent_performance: formData.inconsistentPerformance,
            inconsistent_details: formData.inconsistentDetails,
            sport_mode_power: formData.sportModePower,
            sport_mode_details: formData.sportModeDetails,
            eco_ev_mode_limit: formData.ecoEvModeLimit,
            eco_ev_mode_details: formData.ecoEvModeDetails,
            mode_noise: formData.modeNoise,
            mode_noise_details: formData.modeNoiseDetails,
            mode_warnings: formData.modeWarnings,
            mode_warnings_details: formData.modeWarningsDetails,
            temperature_during_issue: formData.temperatureDuringIssue,
            vehicle_parked: formData.vehicleParked,
            time_of_day: formData.timeOfDay,
            hvac_weather_difference: formData.hvacWeatherDifference,
            hvac_weather_details: formData.hvacWeatherDetails,
            range_regen_temp: formData.rangeRegenTemp,
            range_regen_details: formData.rangeRegenDetails,
            moisture_charging_port: formData.moistureChargingPort,
            updated_at: new Date().toISOString()
          })
          .eq('id', editId);

        if (error) throw error;
        recordId = editId;
      } else {
        recordId = await savePHEVFormData(formData);
      }

      navigate(`/print-summary/phev/${recordId}`);
    } catch (error) {
      console.error('Error saving PHEV form:', error);
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
              label="Does the charge rate drop unexpectedly above or below 50% SoC?" 
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
              label="Are there any issues with cabin climate control functionality in electric or engine-assisted operation?"
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
              label="Does the regenerative braking feel jerky or unpredictable under certain conditions?"
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

export default PHEVDiagnosticForm;
