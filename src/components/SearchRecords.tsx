import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { ArrowLeft, Search, FileText, Calendar, User, Car, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { secureLog, sanitizeInput, validateVIN, validateRONumber } from '../utils/securityUtils';

interface SearchRecord {
  id: string;
  vin: string;
  ro_number: string;
  customer_name: string;
  make_model?: string;
  vehicle_make?: string;
  model?: string;
  created_at: string;
  technician_id: string;
  record_type: 'EV' | 'PHEV';
}

const SearchRecords = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'vin' | 'ro' | 'customer'>('vin');
  const [records, setRecords] = useState<SearchRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateSearchInput = (term: string, type: 'vin' | 'ro' | 'customer'): boolean => {
    if (!term.trim()) return false;
    
    switch (type) {
      case 'vin':
        return validateVIN(term);
      case 'ro':
        return validateRONumber(term);
      case 'customer':
        return term.length >= 2 && term.length <= 100;
      default:
        return false;
    }
  };

  const searchRecords = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    const sanitizedTerm = sanitizeInput(searchTerm);
    
    if (!validateSearchInput(sanitizedTerm, searchType)) {
      setError(`Invalid ${searchType} format`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search EV records
      let evQuery = supabase
        .from('ev_diagnostic_records')
        .select('id, vin, ro_number, customer_name, make_model, created_at, technician_id');

      // Apply RLS-compatible filtering
      if (!isAdmin()) {
        evQuery = evQuery.eq('technician_id', user.id);
      }

      switch (searchType) {
        case 'vin':
          evQuery = evQuery.ilike('vin', `%${sanitizedTerm}%`);
          break;
        case 'ro':
          evQuery = evQuery.ilike('ro_number', `%${sanitizedTerm}%`);
          break;
        case 'customer':
          evQuery = evQuery.ilike('customer_name', `%${sanitizedTerm}%`);
          break;
      }

      const { data: evData, error: evError } = await evQuery;

      if (evError) {
        secureLog('Error searching EV records', 'error', { error: evError.message });
        throw evError;
      }

      // Search PHEV records
      let phevQuery = supabase
        .from('phev_diagnostic_records')
        .select('id, vin, ro_number, customer_name, vehicle_make, model, created_at, technician_id');

      if (!isAdmin()) {
        phevQuery = phevQuery.eq('technician_id', user.id);
      }

      switch (searchType) {
        case 'vin':
          phevQuery = phevQuery.ilike('vin', `%${sanitizedTerm}%`);
          break;
        case 'ro':
          phevQuery = phevQuery.ilike('ro_number', `%${sanitizedTerm}%`);
          break;
        case 'customer':
          phevQuery = phevQuery.ilike('customer_name', `%${sanitizedTerm}%`);
          break;
      }

      const { data: phevData, error: phevError } = await phevQuery;

      if (phevError) {
        secureLog('Error searching PHEV records', 'error', { error: phevError.message });
        throw phevError;
      }

      // Combine and format results
      const combinedRecords: SearchRecord[] = [
        ...(evData || []).map(record => ({
          ...record,
          record_type: 'EV' as const,
          make_model: record.make_model || 'Unknown'
        })),
        ...(phevData || []).map(record => ({
          ...record,
          record_type: 'PHEV' as const,
          make_model: `${record.vehicle_make || ''} ${record.model || ''}`.trim() || 'Unknown'
        }))
      ];

      // Sort by creation date (newest first)
      combinedRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRecords(combinedRecords);
      secureLog(`Search completed: ${combinedRecords.length} records found`);
    } catch (error: any) {
      setError('Search failed. Please try again.');
      secureLog('Search error', 'error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = (record: SearchRecord) => {
    const recordType = record.record_type.toLowerCase();
    navigate(`/print-summary/${recordType}/${record.id}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchRecords();
    }
  };

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
            <h1 className="text-xl font-bold text-white">Search Diagnostic Records</h1>
            <p className="text-sm text-slate-400">
              {isAdmin() ? 'Search all diagnostic records' : 'Search your diagnostic records'}
            </p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">

        {/* Search Controls */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Search By
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'vin' | 'ro' | 'customer')}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="vin">VIN Number</option>
                <option value="ro">RO Number</option>
                <option value="customer">Customer Name</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Search Term
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Enter ${searchType === 'vin' ? 'VIN' : searchType === 'ro' ? 'RO number' : 'customer name'}`}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={searchType === 'vin' ? 17 : searchType === 'ro' ? 20 : 100}
              />
            </div>
            
            <div className="md:col-span-1 flex items-end">
              <button
                onClick={searchRecords}
                disabled={loading || !searchTerm.trim()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Searching...' : 'Search'}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-600/50 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}
        </div>

        {/* Search Results */}
        {records.length > 0 && (
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                Search Results ({records.length} found)
              </h2>
            </div>
            
            <div className="divide-y divide-slate-700">
              {records.map((record) => (
                <div
                  key={`${record.record_type}-${record.id}`}
                  className="p-4 hover:bg-slate-700/50 transition-colors cursor-pointer"
                  onClick={() => handleViewRecord(record)}
                >
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
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-slate-400">
                          <Car className="w-4 h-4" />
                          <span>VIN: {record.vin}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400">
                          <FileText className="w-4 h-4" />
                          <span>RO: {record.ro_number}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400">
                          <Car className="w-4 h-4" />
                          <span>{record.make_model}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(record.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && searchTerm && records.length === 0 && (
          <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No records found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchRecords;
