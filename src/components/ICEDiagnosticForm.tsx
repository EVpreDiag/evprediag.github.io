import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Save, Car } from 'lucide-react';
import { ICEDiagnosticFormData, initialICEFormData } from '../types/iceDiagnosticForm';
import ICEGeneralInfoSection from './diagnostic/ice/ICEGeneralInfoSection';
import ICEEnginePerformanceSection from './diagnostic/ice/ICEEnginePerformanceSection';
import ICEEngineNoisesSection from './diagnostic/ice/ICEEngineNoisesSection';
import ICEFuelSystemSection from './diagnostic/ice/ICEFuelSystemSection';
import ICEExhaustSystemSection from './diagnostic/ice/ICEExhaustSystemSection';
import ICECoolingSystemSection from './diagnostic/ice/ICECoolingSystemSection';
import ICEOilSystemSection from './diagnostic/ice/ICEOilSystemSection';
import ICEElectricalSystemSection from './diagnostic/ice/ICEElectricalSystemSection';
import ICETransmissionSection from './diagnostic/ice/ICETransmissionSection';
import ICEEnvironmentalSection from './diagnostic/ice/ICEEnvironmentalSection';

const ICEDiagnosticForm: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState<ICEDiagnosticFormData>(initialICEFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ICEDiagnosticFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to submit a diagnostic form');
      return;
    }

    if (!formData.customerName || !formData.vin || !formData.roNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const dbData = {
        technician_id: user.id,
        station_id: profile?.station_id,
        customer_name: formData.customerName,
        vin: formData.vin,
        ro_number: formData.roNumber,
        vehicle_make: formData.vehicleMake,
        model: formData.model,
        year: formData.year,
        mileage: formData.mileage,
        engine_size: formData.engineSize,
        fuel_type: formData.fuelType,
        
        // Engine Performance
        engine_starting: formData.engineStarting,
        engine_starting_details: formData.engineStartingDetails,
        idle_quality: formData.idleQuality,
        idle_quality_details: formData.idleQualityDetails,
        acceleration_issues: formData.accelerationIssues,
        acceleration_details: formData.accelerationDetails,
        power_loss: formData.powerLoss,
        power_loss_details: formData.powerLossDetails,
        engine_stalling: formData.engineStalling,
        engine_stalling_details: formData.engineStallingDetails,
        rough_running: formData.roughRunning,
        rough_running_details: formData.roughRunningDetails,
        
        // Engine Noises & Vibrations
        engine_knocking: formData.engineKnocking,
        engine_knocking_details: formData.engineKnockingDetails,
        unusual_noises: formData.unusualNoises,
        unusual_noises_details: formData.unusualNoisesDetails,
        excessive_vibration: formData.excessiveVibration,
        vibration_details: formData.vibrationDetails,
        
        // Fuel System
        fuel_consumption: formData.fuelConsumption,
        fuel_consumption_details: formData.fuelConsumptionDetails,
        fuel_quality_issues: formData.fuelQualityIssues,
        fuel_quality_details: formData.fuelQualityDetails,
        fuel_pump_issues: formData.fuelPumpIssues,
        fuel_pump_details: formData.fuelPumpDetails,
        
        // Exhaust System
        exhaust_smoke: formData.exhaustSmoke,
        exhaust_smoke_details: formData.exhaustSmokeDetails,
        exhaust_smell: formData.exhaustSmell,
        exhaust_smell_details: formData.exhaustSmellDetails,
        catalytic_converter_issues: formData.catalyticConverterIssues,
        catalytic_converter_details: formData.catalyticConverterDetails,
        
        // Cooling System
        overheating: formData.overheating,
        overheating_details: formData.overheatingDetails,
        coolant_leaks: formData.coolantLeaks,
        coolant_leak_details: formData.coolantLeakDetails,
        radiator_issues: formData.radiatorIssues,
        radiator_details: formData.radiatorDetails,
        
        // Oil System
        oil_pressure_issues: formData.oilPressureIssues,
        oil_pressure_details: formData.oilPressureDetails,
        oil_leaks: formData.oilLeaks,
        oil_leak_details: formData.oilLeakDetails,
        oil_consumption: formData.oilConsumption,
        oil_consumption_details: formData.oilConsumptionDetails,
        
        // Electrical System
        battery_issues: formData.batteryIssues,
        battery_details: formData.batteryDetails,
        alternator_issues: formData.alternatorIssues,
        alternator_details: formData.alternatorDetails,
        starter_issues: formData.starterIssues,
        starter_details: formData.starterDetails,
        check_engine_light: formData.checkEngineLight,
        check_engine_details: formData.checkEngineDetails,
        
        // Transmission
        transmission_issues: formData.transmissionIssues,
        transmission_details: formData.transmissionDetails,
        gear_shifting: formData.gearShifting,
        gear_shifting_details: formData.gearShiftingDetails,
        clutch_issues: formData.clutchIssues,
        clutch_details: formData.clutchDetails,
        
        // Environmental Conditions
        temperature_during_issue: formData.temperatureDuringIssue,
        driving_conditions: formData.drivingConditions,
        other_driving_conditions: formData.otherDrivingConditions,
        maintenance_history: formData.maintenanceHistory,
        recent_repairs: formData.recentRepairs
      };

      const { error } = await supabase
        .from('ice_diagnostic_records')
        .insert([dbData]);

      if (error) {
        console.error('Database error:', error);
        toast.error('Failed to save diagnostic record: ' + error.message);
        return;
      }

      toast.success('ICE diagnostic record saved successfully!');
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error('An unexpected error occurred: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <Car className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-xl font-bold text-white">ICE Diagnostic Form</h1>
                <p className="text-sm text-slate-400">Internal Combustion Engine diagnostic assessment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <ICEGeneralInfoSection 
            data={formData} 
            onChange={handleInputChange} 
          />
          
          <ICEEnginePerformanceSection 
            data={formData} 
            onChange={handleInputChange} 
          />
          
          <ICEEngineNoisesSection 
            data={formData} 
            onChange={handleInputChange} 
          />
          
          <ICEFuelSystemSection 
            data={formData} 
            onChange={handleInputChange} 
          />
          
          <ICEExhaustSystemSection 
            data={formData} 
            onChange={handleInputChange} 
          />
          
          <ICECoolingSystemSection 
            data={formData} 
            onChange={handleInputChange} 
          />
          
          <ICEOilSystemSection 
            data={formData} 
            onChange={handleInputChange} 
          />
          
          <ICEElectricalSystemSection 
            data={formData} 
            onChange={handleInputChange} 
          />
          
          <ICETransmissionSection 
            data={formData} 
            onChange={handleInputChange} 
          />
          
          <ICEEnvironmentalSection 
            data={formData} 
            onChange={handleInputChange} 
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Diagnostic Record'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ICEDiagnosticForm;