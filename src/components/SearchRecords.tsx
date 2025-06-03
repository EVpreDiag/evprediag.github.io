
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, FileText, Calendar, User } from 'lucide-react';

interface DiagnosticRecord {
  id: string;
  customerName: string;
  vin: string;
  roNumber: string;
  makeModel: string;
  createdAt: string;
  technician: string;
}

const SearchRecords = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [records, setRecords] = useState<DiagnosticRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DiagnosticRecord[]>([]);

  useEffect(() => {
    // Load records from localStorage
    const savedRecords = JSON.parse(localStorage.getItem('evDiagnosticRecords') || '[]');
    setRecords(savedRecords);
    setFilteredRecords(savedRecords);
  }, []);

  useEffect(() => {
    // Filter records based on search term and type
    if (!searchTerm) {
      setFilteredRecords(records);
      return;
    }

    const filtered = records.filter(record => {
      const term = searchTerm.toLowerCase();
      switch (searchType) {
        case 'vin':
          return record.vin.toLowerCase().includes(term);
        case 'ro':
          return record.roNumber.toLowerCase().includes(term);
        case 'customer':
          return record.customerName.toLowerCase().includes(term);
        default:
          return (
            record.vin.toLowerCase().includes(term) ||
            record.roNumber.toLowerCase().includes(term) ||
            record.customerName.toLowerCase().includes(term) ||
            record.makeModel.toLowerCase().includes(term)
          );
      }
    });
    setFilteredRecords(filtered);
  }, [searchTerm, searchType, records]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = (recordId: string) => {
    navigate(`/print-summary/${recordId}`);
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
              <h1 className="text-xl font-bold text-white">Search Diagnostic Records</h1>
              <p className="text-sm text-slate-400">Find saved diagnostics by VIN, RO, or customer name</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search Controls */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
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
            <div className="md:w-48">
              <label className="block text-sm font-medium text-slate-300 mb-2">Search Type</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Fields</option>
                <option value="vin">VIN Only</option>
                <option value="ro">RO Number Only</option>
                <option value="customer">Customer Name Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">
              Search Results ({filteredRecords.length} found)
            </h2>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">No records found</h3>
              <p className="text-slate-500">
                {searchTerm ? 'Try adjusting your search criteria' : 'No diagnostic records have been saved yet'}
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
                        onClick={() => handlePrint(record.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View/Print</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {records.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Records</p>
                  <p className="text-2xl font-bold text-white">{records.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Unique Customers</p>
                  <p className="text-2xl font-bold text-white">
                    {new Set(records.map(r => r.customerName)).size}
                  </p>
                </div>
                <User className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">This Month</p>
                  <p className="text-2xl font-bold text-white">
                    {records.filter(r => {
                      const recordDate = new Date(r.createdAt);
                      const now = new Date();
                      return recordDate.getMonth() === now.getMonth() && 
                             recordDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchRecords;
