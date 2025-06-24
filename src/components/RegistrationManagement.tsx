import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { approveStationRegistration, rejectStationRegistration } from '../utils/stationSetupUtils';
import { ArrowLeft, Building, Mail, Phone, MapPin, Check, X, Calendar, User } from 'lucide-react';

interface RegistrationRequest {
  id: string;
  company_name: string;
  contact_email: string;
  contact_person_name: string;
  contact_phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  business_type?: string;
  admin_user_id?: string;
  invitation_sent?: boolean;
  invitation_token?: string;
  website?: string;
}

const RegistrationManagement = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    console.log('RegistrationManagement - isSuperAdmin:', isSuperAdmin());
    console.log('RegistrationManagement - user:', user);
    
    if (!isSuperAdmin()) {
      navigate('/dashboard');
      return;
    }
    fetchRequests();
  }, [isSuperAdmin]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('station_registration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast the data to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      })) as RegistrationRequest[];

      console.log('Fetched registration requests:', typedData);
      setRequests(typedData);
    } catch (error) {
      console.error('Error fetching registration requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: RegistrationRequest) => {
    if (!user) {
      console.error('No user found for approval');
      return;
    }
    
    console.log('Attempting to approve request:', request.id);
    setProcessingId(request.id);
    
    try {
      const result = await approveStationRegistration(request.id, user.id);
      
      if (result.success) {
        // Show success message with temporary password
        alert(`Registration approved successfully!\n\nTemporary login credentials:\nEmail: ${request.contact_email}\nPassword: ${result.tempPassword}\n\nPlease share these credentials with the station admin. They will need to confirm their email and set a new password on first login.`);
        await fetchRequests();
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      alert(`Failed to approve registration: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim() || !user) return;

    setProcessingId(selectedRequest.id);
    try {
      await rejectStationRegistration(selectedRequest.id, user.id, rejectionReason);

      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      await fetchRequests();
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Failed to reject registration. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600/20 text-yellow-400';
      case 'approved': return 'bg-green-600/20 text-green-400';
      case 'rejected': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-4">Only super administrators can manage station registrations.</p>
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
        <div className="text-white">Loading registration requests...</div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-white">Station Registration Management</h1>
              <p className="text-sm text-slate-400">Review and manage station registration requests</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending Requests</p>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Requests</p>
                <p className="text-2xl font-bold text-white">
                  {requests.length}
                </p>
              </div>
              <Building className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Approved Requests</p>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Registration Requests</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No registration requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Building className="w-5 h-5 text-slate-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-white">{request.company_name}</div>
                            {request.website && (
                              <div className="text-sm text-slate-400">
                                <a href={`https://${request.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                                  {request.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-white flex items-center">
                            <User className="w-4 h-4 text-slate-400 mr-2" />
                            {request.contact_person_name}
                          </div>
                          <div className="text-sm text-slate-400 flex items-center">
                            <Mail className="w-4 h-4 text-slate-500 mr-2" />
                            <a href={`mailto:${request.contact_email}`} className="hover:text-blue-400 transition-colors">
                              {request.contact_email}
                            </a>
                          </div>
                          <div className="text-sm text-slate-400 flex items-center">
                            <Phone className="w-4 h-4 text-slate-500 mr-2" />
                            {request.contact_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                          <div>
                            <div>{request.address}</div>
                            <div>{`${request.city}, ${request.state} ${request.zip_code}`}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(request)}
                              disabled={processingId === request.id}
                              className="p-2 text-green-400 hover:text-green-300 disabled:opacity-50 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectModal(true);
                              }}
                              disabled={processingId === request.id}
                              className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Reject Registration Request</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-300 mb-4">
                Please provide a reason for rejecting this registration request:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Reason for rejection..."
              />
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processingId === selectedRequest.id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {processingId === selectedRequest.id ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationManagement;
