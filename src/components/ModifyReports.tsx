import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, FileText, Calendar, User, Trash2, Search, ChevronDown, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

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
  [key: string]: any; // For additional diagnostic data
}

const ModifyReports = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<DiagnosticRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DiagnosticRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DiagnosticRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editForm, setEditForm] = useState<Partial<DiagnosticRecord>>({});
  const [expandedSections, setExpandedSections] = useState<string[]>(['general']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch EV records
        const { data: evRecords, error: evError } = await supabase
          .from('ev_diagnostic_records')
          .select('*')
          .order('created_at', { ascending: false });

        if (evError) throw evError;

        // Fetch PHEV records
        const { data: phevRecords, error: phevError } = await supabase
          .from('phev_diagnostic_records')
          .select('*')
          .order('created_at', { ascending: false });

        if (phevError) throw phevError;

        // Combine and format records
        const combinedRecords: DiagnosticRecord[] = [
          ...(evRecords || []).map(record => ({
            ...record,
            make_model: record.make_model || '',
            technician_id: record.technician_id || 'Unknown',
            record_type: 'ev' as const
          })),
          ...(phevRecords || []).map(record => ({
            ...record,
            make_model: `${record.vehicle_make || ''} ${record.model || ''}`.trim(),
            technician_id: record.technician_id || 'Unknown',
            record_type: 'phev' as const
          }))
        ];

        // Sort by created_at descending
        combinedRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setRecords(combinedRecords);
        setFilteredRecords(combinedRecords);
      } catch (err) {
        console.error('Error fetching records:', err);
        setError('Failed to fetch records');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  useEffect(() => {
    // Filter records based on search term
    if (!searchTerm) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter(record => {
      const term = searchTerm.toLowerCase();
      return (
        record.vin.toLowerCase().includes(term) ||
        record.ro_number.toLowerCase().includes(term) ||
        record.customer_name.toLowerCase().includes(term) ||
        record.make_model?.toLowerCase().includes(term)
      );
    });
    setFilteredRecords(filtered);
  }, [searchTerm, records]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleEditRecord = (record: DiagnosticRecord) => {
    console.log('Editing record:', record);
    setSelectedRecord(record);
    setEditForm(record);
    setIsEditing(true);
    setExpandedSections(['general']); // Start with general section expanded
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedRecord || !editForm) return;

    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      console.log('Saving changes for record:', selectedRecord.id);

      const tableName = selectedRecord.record_type === 'ev' ? 'ev_diagnostic_records' : 'phev_diagnostic_records';
      
      // Prepare update data - exclude non-editable fields
      const { id, created_at, technician_id, record_type, ...updateData } = editForm;
      updateData.updated_at = new Date().toISOString();

      console.log('Update data prepared:', updateData);

      // Update the record in the database
      const { error: updateError, data: updatedData } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', selectedRecord.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Successfully updated record:', updatedData);

      // Update local state
      const updatedRecords = records.map(record => {
        if (record.id === selectedRecord.id) {
          const updatedRecord = {
            ...record,
            ...updateData,
            make_model: selectedRecord.record_type === 'ev' 
              ? updateData.make_model 
              : `${updateData.vehicle_make || ''} ${updateData.model || ''}`.trim()
          };
          return updatedRecord;
        }
        return record;
      });

      setRecords(updatedRecords);
      setFilteredRecords(updatedRecords);
      
      // Show success message
      setSaveSuccess(true);
      
      // Close the edit form after a short delay to show success message
      setTimeout(() => {
        setIsEditing(false);
        setSelectedRecord(null);
        setEditForm({});
        setSaveSuccess(false);
      }, 1500);

    } catch (err) {
      console.error('Error updating record:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to update record');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    const recordToDelete = records.find(r => r.id === recordId);
    if (!recordToDelete) return;

    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        setError(null);
        const tableName = recordToDelete.record_type === 'ev' ? 'ev_diagnostic_records' : 'phev_diagnostic_records';
        
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', recordId);

        if (deleteError) throw deleteError;

        const updatedRecords = records.filter(record => record.id !== recordId);
        setRecords(updatedRecords);
        setFilteredRecords(updatedRecords);
      } catch (err) {
        console.error('Error deleting record:', err);
        setError('Failed to delete record');
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedRecord(null);
    setEditForm({});
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleFieldChange = (field: string, value: string | string[]) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const renderYesNoQuestion = (label: string, field: string, detailsField?: string) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name={field}
            value="yes"
            checked={editForm[field] === 'yes'}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="mr-2 text-blue-600"
          />
          <span className="text-slate-300">Yes</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name={field}
            value="no"
            checked={editForm[field] === 'no'}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="mr-2 text-blue-600"
          />
          <span className="text-slate-300">No</span>
        </label>
      </div>
      {editForm[field] === 'yes' && detailsField && (
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Please provide details:</label>
          <textarea
            value={String(editForm[detailsField] || '')}
            onChange={(e) => handleFieldChange(detailsField, e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            rows={3}
          />
        </div>
      )}
    </div>
  );

  const renderTextInput = (label: string, field: string, type: string = 'text') => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <input
        type={type}
        value={editForm[field] || ''}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const renderSelectInput = (label: string, field: string, options: string[]) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <select
        value={editForm[field] || ''}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select an option</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  const renderCheckboxGroup = (label: string, field: string, options: string[]) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option} className="flex items-center">
            <input
              type="checkbox"
              checked={Array.isArray(editForm[field]) ? editForm[field].includes(option) : false}
              onChange={(e) => {
                const currentValues = Array.isArray(editForm[field]) ? editForm[field] : [];
                if (e.target.checked) {
                  handleFieldChange(field, [...currentValues, option]);
                } else {
                  handleFieldChange(field, currentValues.filter(v => v !== option));
                }
              }}
              className="mr-2 text-blue-600"
            />
            <span className="text-slate-300">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderSection = (title: string, sectionKey: string, children: React.ReactNode) => (
    <div className="border border-slate-600 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-left flex items-center justify-between transition-colors"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {expandedSections.includes(sectionKey) ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {expandedSections.includes(sectionKey) && (
        <div className="p-4 bg-slate-800 space-y-4">
          {children}
        </div>
      )}
    </div>
  );

  const renderEVDiagnosticSections = () => (
    <>
      {/* Battery & Charging Section */}
      {renderSection("Battery & Charging", "battery", (
        <div className="space-y-6">
          {renderYesNoQuestion("Charging Issues at Home", "charging_issues_home", "charging_issues_home_details")}
          {renderYesNoQuestion("Charging Issues at Public Stations", "charging_issues_public", "charging_issues_public_details")}
          {renderSelectInput("Charger Type", "charger_type", ["Level 1 (120V)", "Level 2 (240V)", "DC Fast Charging", "Tesla Supercharger", "Other"])}
          {renderYesNoQuestion("Aftermarket Charger", "aftermarket_charger", "aftermarket_details")}
          {renderYesNoQuestion("Failed/Incomplete Charges", "failed_charges", "failed_charges_details")}
          {renderYesNoQuestion("Range Drop", "range_drop", "range_drop_details")}
          {renderYesNoQuestion("Battery Warnings", "battery_warnings", "battery_warnings_details")}
          {renderYesNoQuestion("Power Loss/EV Power Limited", "power_loss", "power_loss_details")}
          {renderSelectInput("Usual Charge Level", "usual_charge_level", ["20-30%", "30-50%", "50-70%", "70-90%", "90-100%"])}
          {renderCheckboxGroup("DC Fast Charging Frequency", "dc_fast_frequency", ["Daily", "Weekly", "Monthly", "Rarely", "Never"])}
          {renderYesNoQuestion("Charge Rate Drop", "charge_rate_drop")}
        </div>
      ))}

      {/* Drivetrain & Performance Section */}
      {renderSection("Drivetrain & Performance", "drivetrain", (
        <div className="space-y-6">
          {renderYesNoQuestion("Consistent Acceleration", "consistent_acceleration", "acceleration_details")}
          {renderYesNoQuestion("Whining/Grinding Noises", "whining_noises", "whining_details")}
          {renderYesNoQuestion("Jerking/Hesitation", "jerking_hesitation", "jerking_details")}
        </div>
      ))}

      {/* NVH Section */}
      {renderSection("NVH (Noise, Vibration, Harshness)", "nvh", (
        <div className="space-y-6">
          {renderYesNoQuestion("Vibrations", "vibrations", "vibrations_details")}
          {renderYesNoQuestion("Noises During Actions", "noises_actions", "noises_actions_details")}
          {renderYesNoQuestion("Rattles/Thumps", "rattles_roads", "rattles_details")}
        </div>
      ))}

      {/* Climate Control Section */}
      {renderSection("Climate Control", "climate", (
        <div className="space-y-6">
          {renderYesNoQuestion("HVAC Performance", "hvac_performance", "hvac_details")}
          {renderYesNoQuestion("Smells/Noises from Vents", "smells_noises", "smells_noises_details")}
          {renderYesNoQuestion("Defogger Performance", "defogger_performance", "defogger_details")}
        </div>
      ))}

      {/* Electrical & Software Section */}
      {renderSection("Electrical & Software", "electrical", (
        <div className="space-y-6">
          {renderYesNoQuestion("Infotainment Glitches", "infotainment_glitches", "infotainment_details")}
          {renderSelectInput("OTA Updates", "ota_updates", ["Recent", "None", "Unknown"])}
          {renderYesNoQuestion("Features Broken After Update", "broken_features", "broken_features_details")}
          {renderYesNoQuestion("Light Flicker/Abnormal Behavior", "light_flicker", "light_flicker_details")}
        </div>
      ))}

      {/* Regenerative Braking Section */}
      {renderSection("Regenerative Braking", "regen", (
        <div className="space-y-6">
          {renderYesNoQuestion("Smooth Regenerative Braking", "smooth_regen", "smooth_regen_details")}
          {renderYesNoQuestion("Regen Strength Different", "regen_strength", "regen_strength_details")}
          {renderYesNoQuestion("Deceleration Noises", "deceleration_noises", "deceleration_noises_details")}
        </div>
      ))}

      {/* Driving Conditions Section */}
      {renderSection("Driving Conditions", "conditions", (
        <div className="space-y-6">
          {renderCheckboxGroup("Issue Conditions", "issue_conditions", ["City driving", "Highway driving", "Stop-and-go traffic", "Hills/mountains", "Extreme weather", "Towing", "Other"])}
          {renderTextInput("Other Conditions", "other_conditions")}
          {renderSelectInput("Towing/High Load", "towing_high_load", ["Yes", "No", "Sometimes"])}
        </div>
      ))}

      {/* Driving Mode Section */}
      {renderSection("Driving Mode", "mode", (
        <div className="space-y-6">
          {renderSelectInput("Primary Mode", "primary_mode", ["Normal", "Eco", "Sport", "Comfort", "Custom"])}
          {renderYesNoQuestion("Modes Differences", "modes_differences", "modes_differences_details")}
          {renderYesNoQuestion("Specific Mode Issues", "specific_mode_issues", "specific_mode_details")}
          {renderYesNoQuestion("Mode Switching Lags", "mode_switching_lags", "mode_switching_details")}
        </div>
      ))}

      {/* Environmental Section */}
      {renderSection("Environmental", "environmental", (
        <div className="space-y-6">
          {renderSelectInput("Temperature During Issue", "temperature_during_issue", ["Very Cold (<32°F)", "Cold (32-50°F)", "Mild (50-70°F)", "Warm (70-85°F)", "Hot (>85°F)"])}
          {renderSelectInput("Vehicle Parked", "vehicle_parked", ["Garage", "Covered parking", "Open parking", "Street"])}
          {renderSelectInput("Time of Day", "time_of_day", ["Morning", "Afternoon", "Evening", "Night"])}
          {renderYesNoQuestion("HVAC Weather Difference", "hvac_weather_difference", "hvac_weather_details")}
          {renderSelectInput("Range/Regen vs Temperature", "range_regen_temp", ["Better in cold", "Better in heat", "No difference", "Worse in both"])}
          {renderSelectInput("Moisture in Charging Port", "moisture_charging_port", ["Yes", "No", "Unknown"])}
        </div>
      ))}
    </>
  );

  const renderPHEVDiagnosticSections = () => (
    <>
      {/* Fuel Type & Usage Section */}
      {renderSection("Fuel Type & Usage", "fuel", (
        <div className="space-y-6">
          {renderSelectInput("Fuel Type", "fuel_type", ["Regular (87)", "Mid-grade (89)", "Premium (91-93)", "E85", "Diesel"])}
          {renderSelectInput("Fuel Source", "fuel_source", ["Brand station", "Independent station", "Costco/warehouse", "Various"])}
          {renderSelectInput("Petrol vs EV Usage", "petrol_vs_ev_usage", ["Mostly EV", "Mostly Petrol", "50/50", "Varies"])}
          {renderYesNoQuestion("Fuel Economy Change", "fuel_economy_change", "fuel_economy_details")}
        </div>
      ))}

      {/* Battery & Charging Section */}
      {renderSection("Battery & Charging", "battery", (
        <div className="space-y-6">
          {renderYesNoQuestion("Battery Charging", "battery_charging", "battery_charging_details")}
          {renderSelectInput("Charger Type", "charger_type", ["Level 1 (120V)", "Level 2 (240V)", "DC Fast Charging"])}
          {renderYesNoQuestion("Aftermarket Charger", "aftermarket_charger", "aftermarket_details")}
          {renderYesNoQuestion("EV Range as Expected", "ev_range_expected", "ev_range_details")}
          {renderYesNoQuestion("Excessive ICE Operation", "excessive_ice_operation", "ice_operation_details")}
          {renderSelectInput("Usual Charge Level", "usual_charge_level", ["20-30%", "30-50%", "50-70%", "70-90%", "90-100%"])}
          {renderSelectInput("DC Fast Frequency", "dc_fast_frequency", ["Daily", "Weekly", "Monthly", "Rarely", "Never"])}
          {renderSelectInput("DC Fast Duration", "dc_fast_duration", ["<15 min", "15-30 min", "30-60 min", ">60 min"])}
          {renderYesNoQuestion("Charge Rate Drop", "charge_rate_drop", "charge_rate_details")}
        </div>
      ))}

      {/* Hybrid Operation Section */}
      {renderSection("Hybrid Operation", "hybrid", (
        <div className="space-y-6">
          {renderYesNoQuestion("Switching Lags/Delays", "switching_lags", "switching_details")}
          {renderYesNoQuestion("Engine Start in EV Mode", "engine_start_ev_mode", "engine_start_details")}
          {renderYesNoQuestion("Abnormal Vibrations", "abnormal_vibrations", "vibrations_details")}
        </div>
      ))}

      {/* Engine & Drivetrain Section */}
      {renderSection("Engine & Drivetrain", "engine", (
        <div className="space-y-6">
          {renderYesNoQuestion("Acceleration Issues", "acceleration_issues", "acceleration_details")}
          {renderYesNoQuestion("Engine Sound Different", "engine_sound", "engine_sound_details")}
          {renderYesNoQuestion("Burning Smell", "burning_smell", "burning_smell_details")}
          {renderYesNoQuestion("Misfires/Rough Running", "misfires", "misfires_details")}
        </div>
      ))}

      {/* NVH & Ride Quality Section */}
      {renderSection("NVH & Ride Quality", "nvh", (
        <div className="space-y-6">
          {renderYesNoQuestion("Underbody Noise", "underbody_noise", "underbody_details")}
          {renderYesNoQuestion("Road Condition Noises", "road_condition_noises", "road_condition_details")}
        </div>
      ))}

      {/* Climate Control Section */}
      {renderSection("Climate Control", "climate", (
        <div className="space-y-6">
          {renderYesNoQuestion("HVAC Effectiveness", "hvac_effectiveness", "hvac_details")}
          {renderYesNoQuestion("Fan Sounds/Noises", "fan_sounds", "fan_details")}
          {renderYesNoQuestion("Temperature Regulation", "temperature_regulation", "temperature_details")}
        </div>
      ))}

      {/* Efficiency Section */}
      {renderSection("Efficiency", "efficiency", (
        <div className="space-y-6">
          {renderYesNoQuestion("Fuel Consumption", "fuel_consumption", "fuel_consumption_details")}
          {renderTextInput("Average Electric Range", "average_electric_range")}
        </div>
      ))}

      {/* Software & Instrument Cluster Section */}
      {renderSection("Software & Instrument Cluster", "software", (
        <div className="space-y-6">
          {renderYesNoQuestion("Infotainment Glitches", "infotainment_glitches", "infotainment_details")}
          {renderSelectInput("OTA Updates", "ota_updates", ["Recent", "None", "Unknown"])}
          {renderYesNoQuestion("Features Broken After Update", "broken_features", "broken_features_details")}
          {renderYesNoQuestion("Light Flicker/Abnormal Behavior", "light_flicker", "light_flicker_details")}
        </div>
      ))}

      {/* Regenerative Braking Section */}
      {renderSection("Regenerative Braking", "regen", (
        <div className="space-y-6">
          {renderYesNoQuestion("Smooth Regenerative Braking", "smooth_regen", "smooth_regen_details")}
          {renderYesNoQuestion("Regen Strength Different", "regen_strength", "regen_strength_details")}
          {renderYesNoQuestion("Deceleration Noises", "deceleration_noises", "deceleration_noises_details")}
        </div>
      ))}

      {/* Driving Load & Towing Section */}
      {renderSection("Driving Load & Towing", "towing", (
        <div className="space-y-6">
          {renderYesNoQuestion("Towing Issues", "towing_issues", "towing_details")}
          {renderYesNoQuestion("Heavy Load Behavior", "heavy_load_behavior", "heavy_load_details")}
        </div>
      ))}

      {/* Driving-Mode Behavior Section */}
      {renderSection("Driving-Mode Behavior", "drivingMode", (
        <div className="space-y-6">
          {renderCheckboxGroup("Regular Modes", "regular_modes", ["Normal", "Eco", "Sport", "EV Mode", "Hybrid Mode", "Custom"])}
          {renderYesNoQuestion("Inconsistent Performance", "inconsistent_performance", "inconsistent_details")}
          {renderYesNoQuestion("Sport Mode Power", "sport_mode_power", "sport_mode_details")}
          {renderYesNoQuestion("Eco/EV Mode Limit", "eco_ev_mode_limit", "eco_ev_mode_details")}
          {renderYesNoQuestion("Mode Noise", "mode_noise", "mode_noise_details")}
          {renderYesNoQuestion("Mode Warnings", "mode_warnings", "mode_warnings_details")}
        </div>
      ))}

      {/* Environmental & Climate Conditions Section */}
      {renderSection("Environmental & Climate Conditions", "environmental", (
        <div className="space-y-6">
          {renderSelectInput("Temperature During Issue", "temperature_during_issue", ["Very Cold (<32°F)", "Cold (32-50°F)", "Mild (50-70°F)", "Warm (70-85°F)", "Hot (>85°F)"])}
          {renderSelectInput("Vehicle Parked", "vehicle_parked", ["Garage", "Covered parking", "Open parking", "Street"])}
          {renderSelectInput("Time of Day", "time_of_day", ["Morning", "Afternoon", "Evening", "Night"])}
          {renderYesNoQuestion("HVAC Weather Difference", "hvac_weather_difference", "hvac_weather_details")}
          {renderYesNoQuestion("Range/Regen vs Temperature", "range_regen_temp", "range_regen_details")}
          {renderSelectInput("Moisture in Charging Port", "moisture_charging_port", ["Yes", "No", "Unknown"])}
        </div>
      ))}
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Modify Reports</h1>
                <p className="text-sm text-slate-400">Edit and update saved diagnostic reports</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Loading Reports</h2>
            <p className="text-slate-400">Fetching diagnostic reports from database...</p>
          </div>
        </div>
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
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Modify Reports</h1>
              <p className="text-sm text-slate-400">Edit and update saved diagnostic reports</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {error && (
          <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Search Controls */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Search Reports</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter VIN, RO Number, Customer Name, or Make/Model"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">
              Diagnostic Reports ({filteredRecords.length} found)
            </h2>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">No reports found</h3>
              <p className="text-slate-500">
                {searchTerm ? 'Try adjusting your search criteria' : 'No diagnostic reports have been saved yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {filteredRecords.map((record) => (
                <div key={record.id} className="p-6 hover:bg-slate-700/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{record.customer_name}</h3>
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                          {record.make_model}
                        </span>
                        <span className={`px-2 py-1 rounded text-sm ${
                          record.record_type === 'ev' 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-purple-600/20 text-purple-400'
                        }`}>
                          {record.record_type === 'ev' ? 'EV' : 'PHEV'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">VIN:</span>
                          <span className="text-slate-300 font-mono">{record.vin}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">RO:</span>
                          <span className="text-slate-300">{record.ro_number}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300">{record.technician_id}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">{formatDate(record.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Edit Diagnostic Report</h3>
              <p className="text-sm text-slate-400">Modify diagnostic report details (Technician ID cannot be changed)</p>
            </div>
            
            {/* Success/Error Messages */}
            {saveSuccess && (
              <div className="mx-6 mt-4 bg-green-600/20 border border-green-600/30 rounded-lg p-4 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-400">Record updated successfully! Closing editor...</p>
              </div>
            )}
            
            {saveError && (
              <div className="mx-6 mt-4 bg-red-600/20 border border-red-600/30 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400">{saveError}</p>
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* General Information */}
              {renderSection("General Information", "general", (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextInput("Customer Name", "customer_name")}
                  {renderTextInput("VIN", "vin")}
                  {renderTextInput("RO Number", "ro_number")}
                  {selectedRecord.record_type === 'ev' ? (
                    renderTextInput("Make/Model", "make_model")
                  ) : (
                    <>
                      {renderTextInput("Vehicle Make", "vehicle_make")}
                      {renderTextInput("Model", "model")}
                    </>
                  )}
                  {renderTextInput("Mileage", "mileage")}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Technician ID (Read-only)</label>
                    <input
                      type="text"
                      value={selectedRecord.technician_id}
                      disabled
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              ))}

              {/* Diagnostic Sections */}
              {selectedRecord.record_type === 'ev' ? renderEVDiagnosticSections() : renderPHEVDiagnosticSections()}
            </div>
            
            <div className="p-6 border-t border-slate-700 flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving || saveSuccess}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModifyReports;
