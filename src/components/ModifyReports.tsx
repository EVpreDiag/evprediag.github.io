
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Save, FileText, Calendar, User, Trash2, Search } from 'lucide-react';

interface DiagnosticRecord {
  id: string;
  customerName: string;
  vin: string;
  roNumber: string;
  makeModel: string;
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

  const handleEditRecord = (record: DiagnosticRecord) => {
    setSelectedRecord(record);
    setEditForm(record);
    setIsEditing(true);
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
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Edit Report</h3>
              <p className="text-sm text-slate-400">Modify the diagnostic report details</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={editForm.customerName || ''}
                    onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">VIN</label>
                  <input
                    type="text"
                    value={editForm.vin || ''}
                    onChange={(e) => setEditForm({ ...editForm, vin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">RO Number</label>
                  <input
                    type="text"
                    value={editForm.roNumber || ''}
                    onChange={(e) => setEditForm({ ...editForm, roNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Make/Model</label>
                  <input
                    type="text"
                    value={editForm.makeModel || ''}
                    onChange={(e) => setEditForm({ ...editForm, makeModel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
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
