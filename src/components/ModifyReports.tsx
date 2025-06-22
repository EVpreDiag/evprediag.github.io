
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { ArrowLeft, Edit, Trash2, Eye, Calendar, User, Car, AlertTriangle, Shield, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { secureLog, checkRecordOwnership } from '../utils/securityUtils';

interface DiagnosticRecord {
  id: string;
  vin: string;
  ro_number: string;
  customer_name: string;
  make_model?: string;
  vehicle_make?: string;
  model?: string;
  created_at: string;
  updated_at: string;
  technician_id: string;
  station_id?: string;
  station_name?: string;
  record_type: 'EV' | 'PHEV';
}

interface Station {
  id: string;
  name: string;
}

const ModifyReports = () => {
  const { user, hasRole, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<DiagnosticRecord[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Check if user has permission to modify reports
  const canModifyReports = hasRole('admin') || hasRole('technician') || isSuperAdmin();

  useEffect(() => {
    if (!canModifyReports) {
      return;
    }
    if (isSuperAdmin()) {
      fetchStations();
    }
    fetchRecords();
  }, [user, canModifyReports, selectedStationId]);

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setStations(data || []);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const fetchRecords = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch EV records
      let evQuery = supabase
        .from('ev_diagnostic_records')
        .select(`
          id, vin, ro_number, customer_name, make_model, created_at, updated_at, technician_id, station_id,
          stations!ev_diagnostic_records_station_id_fkey(name)
        `)
        .order('updated_at', { ascending: false });

      // Non-super-admins can only see their own records (enforced by RLS as well)
      if (!isSuperAdmin()) {
        evQuery = evQuery.eq('technician_id', user.id);
      } else if (selectedStationId) {
        evQuery = evQuery.eq('station_id', selectedStationId);
      }

      const { data: evData, error: evError } = await evQuery;

      if (evError) {
        secureLog('Error fetching EV records for modification', 'error', { error: evError.message });
        throw evError;
      }

      // Fetch PHEV records
      let phevQuery = supabase
        .from('phev_diagnostic_records')
        .select(`
          id, vin, ro_number, customer_name, vehicle_make, model, created_at, updated_at, technician_id, station_id,
          stations!phev_diagnostic_records_station_id_fkey(name)
        `)
        .order('updated_at', { ascending: false });

      if (!isSuperAdmin()) {
        phevQuery = phevQuery.eq('technician_id', user.id);
      } else if (selectedStationId) {
        phevQuery = phevQuery.eq('station_id', selectedStationId);
      }

      const { data: phevData, error: phevError } = await phevQuery;

      if (phevError) {
        secureLog('Error fetching PHEV records for modification', 'error', { error: phevError.message });
        throw phevError;
      }

      // Combine and format results
      const combinedRecords: DiagnosticRecord[] = [
        ...(evData || []).map(record => ({
          ...record,
          record_type: 'EV' as const,
          make_model: record.make_model || 'Unknown',
          station_name: record.stations?.name || 'Unknown Station'
        })),
        ...(phevData || []).map(record => ({
          ...record,
          record_type: 'PHEV' as const,
          make_model: `${record.vehicle_make || ''} ${record.model || ''}`.trim() || 'Unknown',
          station_name: record.stations?.name || 'Unknown Station'
        }))
      ];

      // Sort by updated date (most recently updated first)
      combinedRecords.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      setRecords(combinedRecords);
      secureLog(`Fetched ${combinedRecords.length} records for modification`);
    } catch (error: any) {
      setError('Failed to load records. Please try again.');
      secureLog('Error fetching records for modification', 'error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: DiagnosticRecord) => {
    const path = record.record_type === 'EV' ? '/diagnostic-form' : '/phev-diagnostic-form';
    navigate(`${path}?edit=${record.id}`);
  };

  const handleView = (record: DiagnosticRecord) => {
    const recordType = record.record_type.toLowerCase();
    navigate(`/print-summary/${recordType}/${record.id}`);
  };

  const handleDelete = async (record: DiagnosticRecord) => {
    if (!user) return;

    // Double-check ownership for non-super-admins
    if (!isSuperAdmin()) {
      const hasOwnership = await checkRecordOwnership(
        record.id, 
        record.record_type === 'EV' ? 'ev_diagnostic_records' : 'phev_diagnostic_records'
      );
      
      if (!hasOwnership) {
        setError('You can only delete your own records.');
        return;
      }
    }

    try {
      const tableName = record.record_type === 'EV' ? 'ev_diagnostic_records' : 'phev_diagnostic_records';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', record.id);

      if (error) {
        secureLog('Error deleting record', 'error', { error: error.message, recordId: record.id });
        throw error;
      }

      // Remove from local state
      setRecords(prev => prev.filter(r => r.id !== record.id));
      setDeleteConfirm(null);
      secureLog(`Record deleted successfully: ${record.id}`);
    } catch (error: any) {
      setError('Failed to delete record. Please try again.');
      secureLog('Delete error', 'error', error);
    }
  };

  // Permission check
  if (!canModifyReports) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-4">
            You need technician or administrator permissions to modify reports.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading records...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Modify Reports</h1>
            <p className="text-sm text-slate-400">
              {isSuperAdmin() ? 'Edit and manage all diagnostic reports' : 'Edit and manage your diagnostic reports'}
            </p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Station Filter for Super Admins */}
        {isSuperAdmin() && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
            <div className="flex items-center space-x-4">
              <Building className="w-5 h-5 text-slate-400" />
              <label className="text-sm font-medium text-slate-300">Filter by Station:</label>
              <select
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Stations</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {records.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
            <Edit className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No diagnostic reports found.</p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                Diagnostic Reports ({records.length})
                {selectedStationId && stations.find(s => s.id === selectedStationId) && (
                  <span className="text-sm text-slate-400 ml-2">
                    - {stations.find(s => s.id === selectedStationId)?.name}
                  </span>
                )}
              </h2>
            </div>
            
            <div className="divide-y divide-slate-700">
              {records.map((record) => (
                <div key={`${record.record_type}-${record.id}`} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.record_type === 'EV' 
                            ? 'bg-blue-600/20 text-blue-400' 
                            : 'bg-emerald-600/20 text-emerald-400'
                        }`}>
                          {record.record_type}
                        </span>
                        <h3 className="text-white font-medium">{record.customer_name}</h3>
                        {isSuperAdmin() && (
                          <span className="inline-flex items-center px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded-full">
                            <Building className="w-3 h-3 mr-1" />
                            {record.station_name}
                          </span>
                        )}
                        {!isSuperAdmin() && record.technician_id !== user?.id && (
                          <span className="text-xs text-orange-400">(Read Only)</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-slate-400">
                          <Car className="w-4 h-4" />
                          <span>VIN: {record.vin}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400">
                          <User className="w-4 h-4" />
                          <span>RO: {record.ro_number}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400">
                          <Car className="w-4 h-4" />
                          <span>{record.make_model}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>Updated: {new Date(record.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleView(record)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title="View Report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {(isSuperAdmin() || record.technician_id === user?.id) && (
                        <>
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit Report"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => setDeleteConfirm(record.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Confirm Deletion</h3>
              <p className="text-slate-400 mb-6">
                Are you sure you want to delete this diagnostic report? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const record = records.find(r => r.id === deleteConfirm);
                    if (record) handleDelete(record);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModifyReports;
