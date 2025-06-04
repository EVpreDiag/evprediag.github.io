
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, FileText, Calendar, User, Trash2, Search, ChevronDown, ChevronRight } from 'lucide-react';

interface DiagnosticRecord {
  id: string;
  customerName: string;
  vin: string;
  roNumber: string;
  makeModel: string;
  mileage: string;
  createdAt: string;
  technician: string;
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

  useEffect(() => {
    // Load records from localStorage
    const savedRecords = JSON.parse(localStorage.getItem('evDiagnosticRecords') || '[]');
    setRecords(savedRecords);
    setFilteredRecords(savedRecords);
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
        record.roNumber.toLowerCase().includes(term) ||
        record.customerName.toLowerCase().includes(term) ||
        record.makeModel.toLowerCase().includes(term)
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
    setEditForm(record);
    setIsEditing(true);
    setExpandedSections(['general']); // Start with general section expanded
  };

  const handleSaveChanges = () => {
    if (!selectedRecord || !editForm) return;

    const updatedRecords = records.map(record => 
      record.id === selectedRecord.id 
        ? { ...record, ...editForm, updatedAt: new Date().toISOString() }
        : record
    );

    setRecords(updatedRecords);
    setFilteredRecords(updatedRecords);
    localStorage.setItem('evDiagnosticRecords', JSON.stringify(updatedRecords));
    
    setIsEditing(false);
    setSelectedRecord(null);
    setEditForm({});
  };

  const handleDeleteRecord = (recordId: string) => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      const updatedRecords = records.filter(record => record.id !== recordId);
      setRecords(updatedRecords);
      setFilteredRecords(updatedRecords);
      localStorage.setItem('evDiagnosticRecords', JSON.stringify(updatedRecords));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedRecord(null);
    setEditForm({});
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
                        <h3 className="text-lg font-semibold text-white">{record.customerName}</h3>
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                          {record.makeModel}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">VIN:</span>
                          <span className="text-slate-300 font-mono">{record.vin}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">RO:</span>
                          <span className="text-slate-300">{record.roNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300">{record.technician}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">{formatDate(record.createdAt)}</span>
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
              <p className="text-sm text-slate-400">Modify all diagnostic report details</p>
            </div>
            <div className="p-6 space-y-6">
              {/* General Information */}
              {renderSection("General Information", "general", (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={editForm.customerName || ''}
                      onChange={(e) => handleFieldChange('customerName', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">VIN</label>
                    <input
                      type="text"
                      value={editForm.vin || ''}
                      onChange={(e) => handleFieldChange('vin', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">RO Number</label>
                    <input
                      type="text"
                      value={editForm.roNumber || ''}
                      onChange={(e) => handleFieldChange('roNumber', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Make/Model</label>
                    <input
                      type="text"
                      value={editForm.makeModel || ''}
                      onChange={(e) => handleFieldChange('makeModel', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Mileage</label>
                    <input
                      type="text"
                      value={editForm.mileage || ''}
                      onChange={(e) => handleFieldChange('mileage', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}

              {/* Battery & Charging */}
              {renderSection("Battery & Charging", "battery", (
                <div className="space-y-6">
                  {renderYesNoQuestion("Charging issues at home?", "chargingIssuesHome", "chargingIssuesHomeDetails")}
                  {renderYesNoQuestion("Charging issues at public stations?", "chargingIssuesPublic", "chargingIssuesPublicDetails")}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Charger type</label>
                    <select
                      value={editForm.chargerType || ''}
                      onChange={(e) => handleFieldChange('chargerType', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select charger type</option>
                      <option value="Level 1 (120V)">Level 1 (120V)</option>
                      <option value="Level 2 (240V)">Level 2 (240V)</option>
                      <option value="DC Fast Charging">DC Fast Charging</option>
                    </select>
                  </div>
                  {renderYesNoQuestion("Aftermarket charger installed?", "aftermarketCharger", "aftermarketDetails")}
                  {renderYesNoQuestion("Failed charging sessions?", "failedCharges", "failedChargesDetails")}
                  {renderYesNoQuestion("Range drop issues?", "rangeDrop", "rangeDropDetails")}
                  {renderYesNoQuestion("Battery warnings/alerts?", "batteryWarnings", "batteryWarningsDetails")}
                  {renderYesNoQuestion("Power loss during acceleration?", "powerLoss", "powerLossDetails")}
                </div>
              ))}

              {/* Drivetrain & Performance */}
              {renderSection("Drivetrain & Performance", "drivetrain", (
                <div className="space-y-6">
                  {renderYesNoQuestion("Consistent acceleration?", "consistentAcceleration", "accelerationDetails")}
                  {renderYesNoQuestion("Whining or grinding noises?", "whiningNoises", "whiningDetails")}
                  {renderYesNoQuestion("Jerking or hesitation under acceleration?", "jerkingHesitation", "jerkingDetails")}
                </div>
              ))}

              {/* NVH */}
              {renderSection("NVH (Noise, Vibration, Harshness)", "nvh", (
                <div className="space-y-6">
                  {renderYesNoQuestion("Any vibrations?", "vibrations", "vibrationsDetails")}
                  {renderYesNoQuestion("Noises during specific actions?", "noisesActions", "noisesActionsDetails")}
                  {renderYesNoQuestion("Rattles or thumps on rough roads?", "rattlesRoads", "rattlesDetails")}
                </div>
              ))}

              {/* Climate Control */}
              {renderSection("Climate Control System", "climate", (
                <div className="space-y-6">
                  {renderYesNoQuestion("HVAC performance satisfactory?", "hvacPerformance", "hvacDetails")}
                  {renderYesNoQuestion("Any smells or noises from vents?", "smellsNoises", "smellsNoisesDetails")}
                  {renderYesNoQuestion("Defogger performance adequate?", "defoggerPerformance", "defoggerDetails")}
                </div>
              ))}

              {/* Electrical & Software */}
              {renderSection("Electrical & Software Systems", "electrical", (
                <div className="space-y-6">
                  {renderYesNoQuestion("Any infotainment glitches?", "infotainmentGlitches", "infotainmentDetails")}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Awareness of recent OTA updates</label>
                    <div className="flex space-x-4">
                      {['yes', 'no', 'unsure'].map(value => (
                        <label key={value} className="flex items-center">
                          <input
                            type="radio"
                            name="otaUpdates"
                            value={value}
                            checked={editForm.otaUpdates === value}
                            onChange={(e) => handleFieldChange('otaUpdates', e.target.value)}
                            className="mr-2 text-blue-600"
                          />
                          <span className="text-slate-300 capitalize">{value}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {renderYesNoQuestion("Features broken after update?", "brokenFeatures", "brokenFeaturesDetails")}
                  {renderYesNoQuestion("Light flicker or abnormal behavior?", "lightFlicker", "lightFlickerDetails")}
                </div>
              ))}

              {/* Regenerative Braking */}
              {renderSection("Regenerative Braking", "regen", (
                <div className="space-y-6">
                  {renderYesNoQuestion("Smooth regenerative braking?", "smoothRegen", "smoothRegenDetails")}
                  {renderYesNoQuestion("Does regen strength feel different?", "regenStrength", "regenStrengthDetails")}
                  {renderYesNoQuestion("Any noises during deceleration?", "decelerationNoises", "decelerationNoisesDetails")}
                </div>
              ))}

              {/* Environmental */}
              {renderSection("Environmental & Climate Conditions", "environmental", (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Temperature during issue</label>
                    <div className="flex space-x-4">
                      {['cold', 'normal', 'hot'].map(temp => (
                        <label key={temp} className="flex items-center">
                          <input
                            type="radio"
                            name="temperatureDuringIssue"
                            value={temp}
                            checked={editForm.temperatureDuringIssue === temp}
                            onChange={(e) => handleFieldChange('temperatureDuringIssue', e.target.value)}
                            className="mr-2 text-blue-600"
                          />
                          <span className="text-slate-300 capitalize">{temp}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {renderYesNoQuestion("HVAC difference in different weather?", "hvacWeatherDifference", "hvacWeatherDetails")}
                  {renderYesNoQuestion("Range or regen affected by temperature?", "rangeRegenTemp")}
                  {renderYesNoQuestion("Moisture/condensation in charging port?", "moistureChargingPort")}
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModifyReports;
