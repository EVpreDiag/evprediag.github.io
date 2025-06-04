import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, FileText, Calendar, User, Trash2, Search, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
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
  const { getTechnicianName } = useTechnicianNames();

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
    setSelectedRecord(record);
    setEditForm({ ...record }); // Create a full copy to avoid reference issues
    setIsEditing(true);
    setExpandedSections(['general']); // Start with general section expanded
    setSaveSuccess(false);
    setError(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedRecord || !editForm) return;

    try {
      setSaving(true);
      setError(null);

      const tableName = selectedRecord.record_type === 'ev' ? 'ev_diagnostic_records' : 'phev_diagnostic_records';
      
      // Prepare the update data by removing computed fields and ensuring proper structure
      const updateData = { ...editForm };
      delete updateData.record_type; // Don't try to update this
      delete updateData.make_model; // This is computed for PHEV
      
      // Ensure we have the current timestamp for updated_at
      updateData.updated_at = new Date().toISOString();

      console.log('Updating record:', selectedRecord.id, 'with data:', updateData);
      
      // Update the record in the database
      const { data, error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', selectedRecord.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Update successful:', data);

      // Update local state with the returned data
      const updatedRecord = {
        ...data,
        record_type: selectedRecord.record_type,
        make_model: selectedRecord.record_type === 'phev' 
          ? `${data.vehicle_make || ''} ${data.model || ''}`.trim()
          : data.make_model
      };

      const updatedRecords = records.map(record => 
        record.id === selectedRecord.id ? updatedRecord : record
      );

      setRecords(updatedRecords);
      setFilteredRecords(updatedRecords.filter(record => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          record.vin.toLowerCase().includes(term) ||
          record.ro_number.toLowerCase().includes(term) ||
          record.customer_name.toLowerCase().includes(term) ||
          record.make_model?.toLowerCase().includes(term)
        );
      }));
      
      // Show success message
      setSaveSuccess(true);
      
      // Auto-close the form after 1.5 seconds
      setTimeout(() => {
        setIsEditing(false);
        setSelectedRecord(null);
        setEditForm({});
        setSaveSuccess(false);
      }, 1500);

    } catch (err) {
      console.error('Error updating record:', err);
      setError(`Failed to update record: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    setError(null);
  };

  const handleFieldChange = (field: string, value: string) => {
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

  const renderTextInput = (label: string, field: string) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <input
        type="text"
        value={editForm[field] || ''}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const renderTextarea = (label: string, field: string, rows = 3) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <textarea
        value={editForm[field] || ''}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={rows}
      />
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

        {saveSuccess && (
          <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400">Record updated successfully! Form will close automatically.</p>
            </div>
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
                          <span className="text-slate-300">{getTechnicianName(record.technician_id)}</span>
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
              <p className="text-sm text-slate-400">Modify comprehensive diagnostic report details</p>
            </div>
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
                  {renderTextInput("Technician ID", "technician_id")}
                </div>
              ))}

              {/* Battery & Charging */}
              {renderSection("Battery & Charging", "battery", (
                <div className="space-y-6">
                  {selectedRecord.record_type === 'ev' ? (
                    <>
                      {renderYesNoQuestion("Charging issues at home?", "charging_issues_home", "charging_issues_home_details")}
                      {renderYesNoQuestion("Charging issues at public stations?", "charging_issues_public", "charging_issues_public_details")}
                      {renderYesNoQuestion("Failed charging sessions?", "failed_charges", "failed_charges_details")}
                      {renderYesNoQuestion("Range drop issues?", "range_drop", "range_drop_details")}
                      {renderYesNoQuestion("Battery warnings/alerts?", "battery_warnings", "battery_warnings_details")}
                      {renderYesNoQuestion("Power loss during acceleration?", "power_loss", "power_loss_details")}
                      {renderTextInput("Usual charge level", "usual_charge_level")}
                      {renderTextInput("Charge rate drop", "charge_rate_drop")}
                      {renderYesNoQuestion("Aftermarket charger?", "aftermarket_charger", "aftermarket_details")}
                      {renderTextInput("Charger type", "charger_type")}
                      {renderTextInput("DC fast frequency", "dc_fast_frequency")}
                    </>
                  ) : (
                    <>
                      {renderYesNoQuestion("Battery charging properly?", "battery_charging", "battery_charging_details")}
                      {renderYesNoQuestion("EV range as expected?", "ev_range_expected", "ev_range_details")}
                      {renderYesNoQuestion("Excessive ICE operation?", "excessive_ice_operation", "ice_operation_details")}
                      {renderYesNoQuestion("Charge rate drop?", "charge_rate_drop", "charge_rate_details")}
                      {renderTextInput("Usual charge level", "usual_charge_level")}
                      {renderYesNoQuestion("Aftermarket charger?", "aftermarket_charger", "aftermarket_details")}
                      {renderTextInput("Charger type", "charger_type")}
                      {renderTextInput("DC fast frequency", "dc_fast_frequency")}
                      {renderTextInput("DC fast duration", "dc_fast_duration")}
                    </>
                  )}
                </div>
              ))}

              {/* Performance & Drivetrain */}
              {renderSection("Performance & Drivetrain", "performance", (
                <div className="space-y-6">
                  {selectedRecord.record_type === 'ev' ? (
                    <>
                      {renderYesNoQuestion("Consistent acceleration?", "consistent_acceleration", "acceleration_details")}
                      {renderYesNoQuestion("Whining noises?", "whining_noises", "whining_details")}
                      {renderYesNoQuestion("Jerking/hesitation?", "jerking_hesitation", "jerking_details")}
                      {renderYesNoQuestion("Vibrations?", "vibrations", "vibrations_details")}
                      {renderYesNoQuestion("Smooth regeneration?", "smooth_regen", "smooth_regen_details")}
                      {renderTextInput("Regeneration strength", "regen_strength")}
                      {renderYesNoQuestion("Deceleration noises?", "deceleration_noises", "deceleration_noises_details")}
                      {renderYesNoQuestion("Noises during actions?", "noises_actions", "noises_actions_details")}
                      {renderYesNoQuestion("Rattles on roads?", "rattles_roads", "rattles_details")}
                    </>
                  ) : (
                    <>
                      {renderYesNoQuestion("Acceleration issues?", "acceleration_issues", "acceleration_details")}
                      {renderYesNoQuestion("Abnormal vibrations?", "abnormal_vibrations", "vibrations_details")}
                      {renderYesNoQuestion("Engine sound normal?", "engine_sound", "engine_sound_details")}
                      {renderYesNoQuestion("Any misfires?", "misfires", "misfires_details")}
                      {renderYesNoQuestion("Smooth regeneration?", "smooth_regen", "smooth_regen_details")}
                      {renderTextInput("Regeneration strength", "regen_strength")}
                      {renderYesNoQuestion("Deceleration noises?", "deceleration_noises", "deceleration_noises_details")}
                      {renderYesNoQuestion("Underbody noise?", "underbody_noise", "underbody_details")}
                      {renderYesNoQuestion("Road condition noises?", "road_condition_noises", "road_condition_details")}
                      {renderYesNoQuestion("Burning smell?", "burning_smell", "burning_smell_details")}
                    </>
                  )}
                </div>
              ))}

              {/* Climate & Comfort */}
              {renderSection("Climate & Comfort", "climate", (
                <div className="space-y-6">
                  {selectedRecord.record_type === 'ev' ? (
                    <>
                      {renderYesNoQuestion("HVAC performance good?", "hvac_performance", "hvac_details")}
                      {renderYesNoQuestion("Any smells/noises?", "smells_noises", "smells_noises_details")}
                      {renderYesNoQuestion("Defogger working?", "defogger_performance", "defogger_details")}
                    </>
                  ) : (
                    <>
                      {renderYesNoQuestion("HVAC effective?", "hvac_effectiveness", "hvac_details")}
                      {renderYesNoQuestion("Fan sounds normal?", "fan_sounds", "fan_details")}
                      {renderYesNoQuestion("Temperature regulation good?", "temperature_regulation", "temperature_details")}
                    </>
                  )}
                </div>
              ))}

              {/* Electronics & Features */}
              {renderSection("Electronics & Features", "electronics", (
                <div className="space-y-6">
                  {renderYesNoQuestion("Infotainment glitches?", "infotainment_glitches", "infotainment_details")}
                  {renderTextInput("OTA updates", "ota_updates")}
                  {renderYesNoQuestion("Broken features?", "broken_features", "broken_features_details")}
                  {renderYesNoQuestion("Light flicker issues?", "light_flicker", "light_flicker_details")}
                </div>
              ))}

              {/* Additional sections for PHEV */}
              {selectedRecord.record_type === 'phev' && (
                <>
                  {renderSection("Fuel Usage", "fuel", (
                    <div className="space-y-6">
                      {renderTextInput("Fuel type", "fuel_type")}
                      {renderTextInput("Fuel source", "fuel_source")}
                      {renderTextInput("Petrol vs EV usage", "petrol_vs_ev_usage")}
                      {renderYesNoQuestion("Fuel economy change?", "fuel_economy_change", "fuel_economy_details")}
                      {renderTextInput("Fuel consumption", "fuel_consumption")}
                      {renderTextInput("Average electric range", "average_electric_range")}
                    </div>
                  ))}
                  
                  {renderSection("Mode Performance", "modes", (
                    <div className="space-y-6">
                      {renderYesNoQuestion("Sport mode power good?", "sport_mode_power", "sport_mode_details")}
                      {renderYesNoQuestion("Eco/EV mode limited?", "eco_ev_mode_limit", "eco_ev_mode_details")}
                      {renderYesNoQuestion("Mode switching lags?", "switching_lags", "switching_details")}
                      {renderYesNoQuestion("Engine starts in EV mode?", "engine_start_ev_mode", "engine_start_details")}
                      {renderYesNoQuestion("Mode noise issues?", "mode_noise", "mode_noise_details")}
                      {renderYesNoQuestion("Mode warnings?", "mode_warnings", "mode_warnings_details")}
                      {renderTextInput("Regular modes", "regular_modes")}
                      {renderYesNoQuestion("Inconsistent performance?", "inconsistent_performance", "inconsistent_details")}
                    </div>
                  ))}
                  
                  {renderSection("Towing & Load", "towing", (
                    <div className="space-y-6">
                      {renderYesNoQuestion("Towing issues?", "towing_issues", "towing_details")}
                      {renderYesNoQuestion("Heavy load behavior?", "heavy_load_behavior", "heavy_load_details")}
                    </div>
                  ))}
                </>
              )}

              {/* EV Specific Sections */}
              {selectedRecord.record_type === 'ev' && (
                <>
                  {renderSection("Driving Modes", "driving_modes", (
                    <div className="space-y-6">
                      {renderTextInput("Primary mode", "primary_mode")}
                      {renderYesNoQuestion("Modes differences?", "modes_differences", "modes_differences_details")}
                      {renderYesNoQuestion("Specific mode issues?", "specific_mode_issues", "specific_mode_details")}
                      {renderYesNoQuestion("Mode switching lags?", "mode_switching_lags", "mode_switching_details")}
                    </div>
                  ))}
                  
                  {renderSection("Load Conditions", "load_conditions", (
                    <div className="space-y-6">
                      {renderYesNoQuestion("Towing/high load?", "towing_high_load")}
                      {renderTextInput("Issue conditions", "issue_conditions")}
                      {renderTextInput("Other conditions", "other_conditions")}
                    </div>
                  ))}
                </>
              )}

              {/* Conditions & Environment */}
              {renderSection("Conditions & Environment", "conditions", (
                <div className="space-y-6">
                  {renderTextInput("Temperature during issue", "temperature_during_issue")}
                  {renderTextInput("Time of day", "time_of_day")}
                  {renderTextInput("Vehicle parked where", "vehicle_parked")}
                  {renderYesNoQuestion("HVAC/weather difference?", "hvac_weather_difference", "hvac_weather_details")}
                  {renderYesNoQuestion("Range/regen affected by temp?", "range_regen_temp", "range_regen_details")}
                  {renderYesNoQuestion("Moisture in charging port?", "moisture_charging_port")}
                </div>
              ))}
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
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
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
