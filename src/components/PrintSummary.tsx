
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, Calendar, User, Car, Battery, Settings, Zap, Wind, Monitor, MapPin } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useTechnicianNames } from '../hooks/useTechnicianNames';

interface DiagnosticRecord {
  id: string;
  customer_name: string;
  vin: string;
  ro_number: string;
  make_model?: string;
  vehicle_make?: string;
  model?: string;
  mileage: string;
  created_at: string;
  technician_id: string;
  record_type: 'ev' | 'phev';
  [key: string]: any;
}

const PrintSummary = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<DiagnosticRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getTechnicianName } = useTechnicianNames();

  useEffect(() => {
    const fetchRecord = async () => {
      if (!recordId) {
        setError('No record ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to fetch from EV records first
        const { data: evRecord, error: evError } = await supabase
          .from('ev_diagnostic_records')
          .select('*')
          .eq('id', recordId)
          .maybeSingle();

        if (evError && evError.code !== 'PGRST116') {
          throw evError;
        }

        if (evRecord) {
          setRecord({
            ...evRecord,
            record_type: 'ev',
            make_model: evRecord.make_model || ''
          });
          setLoading(false);
          return;
        }

        // If not found in EV records, try PHEV records
        const { data: phevRecord, error: phevError } = await supabase
          .from('phev_diagnostic_records')
          .select('*')
          .eq('id', recordId)
          .maybeSingle();

        if (phevError && phevError.code !== 'PGRST116') {
          throw phevError;
        }

        if (phevRecord) {
          setRecord({
            ...phevRecord,
            record_type: 'phev',
            make_model: `${phevRecord.vehicle_make || ''} ${phevRecord.model || ''}`.trim()
          });
        } else {
          setError('Record not found');
        }

      } catch (err) {
        console.error('Error fetching record:', err);
        setError('Failed to load record');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [recordId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not specified';
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Not specified';
    }
    return String(value);
  };

  const renderYesNoField = (label: string, value: any, details?: any) => {
    const displayValue = getDisplayValue(value);
    const hasDetails = details && getDisplayValue(details) !== 'Not specified';
    
    return (
      <div className="mb-4 print:mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-300 print:text-slate-700 font-medium text-sm">{label}</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            displayValue === 'yes' ? 'bg-red-600/20 text-red-400 print:bg-red-100 print:text-red-700' :
            displayValue === 'no' ? 'bg-green-600/20 text-green-400 print:bg-green-100 print:text-green-700' :
            'bg-slate-600/20 text-slate-400 print:bg-slate-100 print:text-slate-700'
          }`}>
            {displayValue === 'yes' ? 'Yes' : displayValue === 'no' ? 'No' : displayValue}
          </span>
        </div>
        {hasDetails && (
          <div className="ml-4 p-2 bg-slate-700/50 print:bg-slate-50 rounded text-sm text-slate-300 print:text-slate-600 border-l-2 border-slate-600 print:border-slate-300">
            <strong>Details:</strong> {getDisplayValue(details)}
          </div>
        )}
      </div>
    );
  };

  const renderInfoField = (label: string, value: any) => (
    <div className="mb-3">
      <span className="text-slate-400 print:text-slate-600 text-sm">{label}:</span>
      <p className="text-white print:text-slate-900 font-medium">{getDisplayValue(value)}</p>
    </div>
  );

  const renderInfoCard = (title: string, icon: React.ReactNode, children: React.ReactNode) => (
    <div className="bg-slate-800 print:bg-white rounded-lg p-6 print:p-4 border border-slate-700 print:border-slate-300 mb-6 print:mb-4 print:shadow-sm">
      <h3 className="text-lg font-semibold text-white print:text-slate-900 mb-4 flex items-center print:border-b print:border-slate-200 print:pb-2">
        <span className="print:text-slate-600">{icon}</span>
        <span className="ml-2">{title}</span>
      </h3>
      {children}
    </div>
  );

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Loading Report</h2>
          <p className="text-slate-400">Fetching diagnostic report...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Report Not Found</h2>
          <p className="text-slate-400 mb-4">{error || 'The requested report could not be found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 print:bg-white">
      {/* Header - Hidden when printing */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/search-records')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Search</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Diagnostic Report Summary</h1>
              <p className="text-sm text-slate-400">Customer: {record.customer_name}</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Printer className="w-5 h-5" />
            <span>Print Report</span>
          </button>
        </div>
      </header>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block print:mb-6">
        <div className="text-center border-b-2 border-slate-300 pb-4">
          <h1 className="text-3xl font-bold text-slate-900">
            {record.record_type === 'ev' ? 'Electric Vehicle' : 'Plug-in Hybrid Electric Vehicle'} Diagnostic Report
          </h1>
          <p className="text-slate-600 mt-2">Generated on {formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      <div className="p-6 print:p-8 print:text-slate-900">
        {/* Vehicle Information */}
        {renderInfoCard("Vehicle Information", <Car className="w-5 h-5 text-blue-400 print:text-blue-600" />, (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInfoField("Customer Name", record.customer_name)}
            {renderInfoField("VIN", record.vin)}
            {renderInfoField("RO Number", record.ro_number)}
            {renderInfoField("Make/Model", record.make_model)}
            {renderInfoField("Mileage", record.mileage)}
            {renderInfoField("Vehicle Type", record.record_type === 'ev' ? 'Electric Vehicle (EV)' : 'Plug-in Hybrid Electric Vehicle (PHEV)')}
          </div>
        ))}

        {/* Report Information */}
        {renderInfoCard("Report Information", <FileText className="w-5 h-5 text-green-400 print:text-green-600" />, (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInfoField("Technician", getTechnicianName(record.technician_id))}
            {renderInfoField("Date Created", formatDate(record.created_at))}
            {record.updated_at && record.updated_at !== record.created_at && renderInfoField("Last Updated", formatDate(record.updated_at))}
          </div>
        ))}

        {/* Battery & Charging Issues */}
        {renderInfoCard("Battery & Charging", <Battery className="w-5 h-5 text-yellow-400 print:text-yellow-600" />, (
          <div className="space-y-3">
            {record.record_type === 'ev' ? (
              <>
                {renderYesNoField("Charging issues at home", record.charging_issues_home, record.charging_issues_home_details)}
                {renderYesNoField("Charging issues at public stations", record.charging_issues_public, record.charging_issues_public_details)}
                {renderYesNoField("Failed charging sessions", record.failed_charges, record.failed_charges_details)}
                {renderYesNoField("Range drop issues", record.range_drop, record.range_drop_details)}
                {renderYesNoField("Battery warnings/alerts", record.battery_warnings, record.battery_warnings_details)}
                {renderYesNoField("Power loss during acceleration", record.power_loss, record.power_loss_details)}
                {record.usual_charge_level && renderInfoField("Usual charge level", record.usual_charge_level)}
                {record.charge_rate_drop && renderInfoField("Charge rate drop", record.charge_rate_drop)}
                {record.aftermarket_charger && renderYesNoField("Aftermarket charger", record.aftermarket_charger, record.aftermarket_details)}
                {record.charger_type && renderInfoField("Charger type", record.charger_type)}
                {record.dc_fast_frequency && renderInfoField("DC fast charging frequency", record.dc_fast_frequency)}
              </>
            ) : (
              <>
                {renderYesNoField("Battery charging properly", record.battery_charging, record.battery_charging_details)}
                {renderYesNoField("EV range as expected", record.ev_range_expected, record.ev_range_details)}
                {renderYesNoField("Excessive ICE operation", record.excessive_ice_operation, record.ice_operation_details)}
                {renderYesNoField("Charge rate drop", record.charge_rate_drop, record.charge_rate_details)}
                {record.usual_charge_level && renderInfoField("Usual charge level", record.usual_charge_level)}
                {record.aftermarket_charger && renderYesNoField("Aftermarket charger", record.aftermarket_charger, record.aftermarket_details)}
                {record.charger_type && renderInfoField("Charger type", record.charger_type)}
                {record.dc_fast_frequency && renderInfoField("DC fast charging frequency", record.dc_fast_frequency)}
                {record.dc_fast_duration && renderInfoField("DC fast charging duration", record.dc_fast_duration)}
              </>
            )}
          </div>
        ))}

        {/* Performance & Drivetrain */}
        {renderInfoCard("Performance & Drivetrain", <Settings className="w-5 h-5 text-purple-400 print:text-purple-600" />, (
          <div className="space-y-3">
            {record.record_type === 'ev' ? (
              <>
                {renderYesNoField("Consistent acceleration", record.consistent_acceleration, record.acceleration_details)}
                {renderYesNoField("Whining noises", record.whining_noises, record.whining_details)}
                {renderYesNoField("Jerking/hesitation", record.jerking_hesitation, record.jerking_details)}
                {renderYesNoField("Vibrations", record.vibrations, record.vibrations_details)}
                {renderYesNoField("Smooth regeneration", record.smooth_regen, record.smooth_regen_details)}
                {record.regen_strength && renderInfoField("Regeneration strength", record.regen_strength)}
                {renderYesNoField("Deceleration noises", record.deceleration_noises, record.deceleration_noises_details)}
                {renderYesNoField("Noises during actions", record.noises_actions, record.noises_actions_details)}
                {renderYesNoField("Rattles on roads", record.rattles_roads, record.rattles_details)}
              </>
            ) : (
              <>
                {renderYesNoField("Acceleration issues", record.acceleration_issues, record.acceleration_details)}
                {renderYesNoField("Abnormal vibrations", record.abnormal_vibrations, record.vibrations_details)}
                {renderYesNoField("Engine sound normal", record.engine_sound, record.engine_sound_details)}
                {renderYesNoField("Any misfires", record.misfires, record.misfires_details)}
                {renderYesNoField("Smooth regeneration", record.smooth_regen, record.smooth_regen_details)}
                {record.regen_strength && renderInfoField("Regeneration strength", record.regen_strength)}
                {renderYesNoField("Deceleration noises", record.deceleration_noises, record.deceleration_noises_details)}
                {renderYesNoField("Underbody noise", record.underbody_noise, record.underbody_details)}
                {renderYesNoField("Road condition noises", record.road_condition_noises, record.road_condition_details)}
                {renderYesNoField("Burning smell", record.burning_smell, record.burning_smell_details)}
              </>
            )}
          </div>
        ))}

        {/* Climate & Comfort */}
        {renderInfoCard("Climate & Comfort", <Wind className="w-5 h-5 text-cyan-400 print:text-cyan-600" />, (
          <div className="space-y-3">
            {record.record_type === 'ev' ? (
              <>
                {renderYesNoField("HVAC performance good", record.hvac_performance, record.hvac_details)}
                {renderYesNoField("Any smells/noises", record.smells_noises, record.smells_noises_details)}
                {renderYesNoField("Defogger working", record.defogger_performance, record.defogger_details)}
              </>
            ) : (
              <>
                {renderYesNoField("HVAC effective", record.hvac_effectiveness, record.hvac_details)}
                {renderYesNoField("Fan sounds normal", record.fan_sounds, record.fan_details)}
                {renderYesNoField("Temperature regulation good", record.temperature_regulation, record.temperature_details)}
              </>
            )}
          </div>
        ))}

        {/* Electronics & Features */}
        {renderInfoCard("Electronics & Features", <Monitor className="w-5 h-5 text-indigo-400 print:text-indigo-600" />, (
          <div className="space-y-3">
            {renderYesNoField("Infotainment glitches", record.infotainment_glitches, record.infotainment_details)}
            {record.ota_updates && renderInfoField("OTA updates", record.ota_updates)}
            {renderYesNoField("Broken features", record.broken_features, record.broken_features_details)}
            {renderYesNoField("Light flicker issues", record.light_flicker, record.light_flicker_details)}
          </div>
        ))}

        {/* PHEV Specific Sections */}
        {record.record_type === 'phev' && (
          <>
            {/* Fuel Usage */}
            {renderInfoCard("Fuel Usage", <Zap className="w-5 h-5 text-orange-400 print:text-orange-600" />, (
              <div className="space-y-3">
                {record.fuel_type && renderInfoField("Fuel type", record.fuel_type)}
                {record.fuel_source && renderInfoField("Fuel source", record.fuel_source)}
                {record.petrol_vs_ev_usage && renderInfoField("Petrol vs EV usage", record.petrol_vs_ev_usage)}
                {renderYesNoField("Fuel economy change", record.fuel_economy_change, record.fuel_economy_details)}
                {record.fuel_consumption && renderInfoField("Fuel consumption", record.fuel_consumption)}
                {record.average_electric_range && renderInfoField("Average electric range", record.average_electric_range)}
              </div>
            ))}
            
            {/* Mode Performance */}
            {renderInfoCard("Mode Performance", <Settings className="w-5 h-5 text-pink-400 print:text-pink-600" />, (
              <div className="space-y-3">
                {renderYesNoField("Sport mode power good", record.sport_mode_power, record.sport_mode_details)}
                {renderYesNoField("Eco/EV mode limited", record.eco_ev_mode_limit, record.eco_ev_mode_details)}
                {renderYesNoField("Mode switching lags", record.switching_lags, record.switching_details)}
                {renderYesNoField("Engine starts in EV mode", record.engine_start_ev_mode, record.engine_start_details)}
                {renderYesNoField("Mode noise issues", record.mode_noise, record.mode_noise_details)}
                {renderYesNoField("Mode warnings", record.mode_warnings, record.mode_warnings_details)}
                {record.regular_modes && renderInfoField("Regular modes", record.regular_modes)}
                {renderYesNoField("Inconsistent performance", record.inconsistent_performance, record.inconsistent_details)}
              </div>
            ))}

            {/* Towing & Load */}
            {renderInfoCard("Towing & Load Performance", <Car className="w-5 h-5 text-emerald-400 print:text-emerald-600" />, (
              <div className="space-y-3">
                {renderYesNoField("Towing issues", record.towing_issues, record.towing_details)}
                {renderYesNoField("Heavy load behavior", record.heavy_load_behavior, record.heavy_load_details)}
              </div>
            ))}
          </>
        )}

        {/* EV Specific Sections */}
        {record.record_type === 'ev' && (
          <>
            {/* Driving Modes */}
            {(record.primary_mode || record.modes_differences || record.specific_mode_issues || record.mode_switching_lags) && renderInfoCard("Driving Modes", <Zap className="w-5 h-5 text-orange-400 print:text-orange-600" />, (
              <div className="space-y-3">
                {record.primary_mode && renderInfoField("Primary mode", record.primary_mode)}
                {renderYesNoField("Modes differences", record.modes_differences, record.modes_differences_details)}
                {renderYesNoField("Specific mode issues", record.specific_mode_issues, record.specific_mode_details)}
                {renderYesNoField("Mode switching lags", record.mode_switching_lags, record.mode_switching_details)}
              </div>
            ))}

            {/* Load Conditions */}
            {(record.towing_high_load || record.issue_conditions) && renderInfoCard("Load & Usage Conditions", <Car className="w-5 h-5 text-emerald-400 print:text-emerald-600" />, (
              <div className="space-y-3">
                {renderYesNoField("Towing/high load", record.towing_high_load)}
                {record.issue_conditions && renderInfoField("Issue conditions", record.issue_conditions)}
                {record.other_conditions && renderInfoField("Other conditions", record.other_conditions)}
              </div>
            ))}
          </>
        )}

        {/* Environmental Conditions */}
        {renderInfoCard("Environmental Conditions", <MapPin className="w-5 h-5 text-teal-400 print:text-teal-600" />, (
          <div className="space-y-3">
            {record.temperature_during_issue && renderInfoField("Temperature during issue", record.temperature_during_issue)}
            {record.time_of_day && renderInfoField("Time of day", record.time_of_day)}
            {record.vehicle_parked && renderInfoField("Vehicle parked where", record.vehicle_parked)}
            {renderYesNoField("HVAC/weather difference", record.hvac_weather_difference, record.hvac_weather_details)}
            {renderYesNoField("Range/regen affected by temp", record.range_regen_temp, record.range_regen_details)}
            {renderYesNoField("Moisture in charging port", record.moisture_charging_port)}
          </div>
        ))}

        {/* Print Footer - Only visible when printing */}
        <div className="hidden print:block print:mt-8 print:pt-4 print:border-t print:border-slate-300">
          <div className="text-center text-sm text-slate-600">
            <p>This report was generated electronically and contains diagnostic information as of {formatDate(record.created_at)}</p>
            <p className="mt-1">Report ID: {record.id}</p>
            <p className="mt-1">Technician: {getTechnicianName(record.technician_id)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintSummary;
