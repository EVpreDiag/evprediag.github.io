
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { ArrowLeft, Eye, Check, X, Building, User, Mail, Phone, MapPin, Globe, Calendar, FileText, Send } from 'lucide-react';
import { createStationUserAccount } from '../utils/stationSetupUtils';

interface RegistrationRequest {
  id: string;
  company_name: string;
  business_type: string | null;
  contact_person_name: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  website: string | null;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_user_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  invitation_sent: boolean;
  password_hash: string | null;
}

const RegistrationManagement = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, user } = useAuth();
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      // Type assertion to ensure status is properly typed
      setRequests((data || []).map(request => ({
        ...request,
        status: request.status as 'pending' | 'approved' | 'rejected',
        email_verified: request.email_verified || false,
        invitation_sent: request.invitation_sent || false
      })));
    } catch (error) {
      console.error('Error fetching registration requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: RegistrationRequest) => {
    try {
      setProcessing(request.id);

      // Create the station first
      const { data: stationData, error: stationError } = await supabase
        .from('stations')
        .insert({
          name: request.company_name,
          address: request.address,
          phone: request.contact_phone,
          email: request.contact_email,
          created_by: user?.id
        })
        .select()
        .single();

      if (stationError) throw stationError;

      // Create user account for the station admin
      const { success, error: userError } = await createStationUserAccount(
        {
          id: request.id,
          company_name: request.company_name,
          contact_person_name: request.contact_person_name,
          contact_email: request.contact_email,
          contact_phone: request.contact_phone,
          address: request.address,
          password_hash: request.password_hash
        },
        stationData.id,
        user?.id || ''
      );

      if (!success || userError) {
        console.error('Failed to create user account:', userError);
        throw new Error('Failed to create user account for station admin');
      }

      // Update the registration request status
      const { error: updateError } = await supabase
        .from('station_registration_requests')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          invitation_sent: true,
          email_verified: true
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      console.log('Station approval completed successfully');
      await fetchRequests();
    } catch (error) {
      console.error('Error approving registration:', error);
      setError('Failed to approve registration. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return;

    setProcessing(selectedRequest.id);
    try {
      const { error } = await supabase
        .from('station_registration_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      await fetchRequests();
    } catch (error) {
      console.error('Error rejecting registration:', error);
    } finally {
      setProcessing(null);
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

  const getRegistrationStatus = (request: RegistrationRequest) => {
    if (request.status === 'approved' && request.invitation_sent) {
      return { text: 'Invitation Sent', color: 'text-green-400' };
    }
    if (request.status === 'pending') {
      return { text: 'Ready for Review', color: 'text-blue-400' };
    }
    return { text: request.status.charAt(0).toUpperCase() + request.status.slice(1), color: 'text-slate-400' };
  };

  if (!isSuperAdmin()) {
    return null;
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
              <h1 className="text-xl font-bold text-white">Registration Management</h1>
              <p className="text-sm text-slate-400">Review and approve station registration requests</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
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
                <p className="text-slate-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <Check className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Invitations Sent</p>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => r.invitation_sent).length}
                </p>
              </div>
              <Send className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-white">
                  {requests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <X className="w-8 h-8 text-red-400" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No registration requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => {
                    const regStatus = getRegistrationStatus(request);
                    return (
                      <tr key={request.id} className="hover:bg-slate-700/30">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{request.company_name}</div>
                            <div className="text-sm text-slate-400">{request.business_type || 'Not specified'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-white">{request.contact_person_name}</div>
                            <div className="text-sm text-slate-400 flex items-center">
                              {request.contact_email}
                              {request.invitation_sent && (
                                <Check className="w-3 h-3 text-green-400 ml-1" />
                              )}
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
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedRequest(request)}
                              className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(request)}
                                  disabled={processing === request.id}
                                  className="p-2 text-green-400 hover:text-green-300 disabled:opacity-50 transition-colors"
                                  title="Approve & Send Invitation"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowRejectModal(true);
                                  }}
                                  disabled={processing === request.id}
                                  className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && !showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Registration Details</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Company Info */}
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Company Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Company Name:</span>
                    <p className="text-white">{selectedRequest.company_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Business Type:</span>
                    <p className="text-white">{selectedRequest.business_type || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Contact Person:</span>
                    <p className="text-white">{selectedRequest.contact_person_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <p className="text-white">{selectedRequest.contact_email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>
                    <p className="text-white">{selectedRequest.contact_phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Website:</span>
                    <p className="text-white">{selectedRequest.website || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div>
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </h4>
                <div className="text-sm">
                  <p className="text-white">
                    {[selectedRequest.address, selectedRequest.city, selectedRequest.state, selectedRequest.zip_code]
                      .filter(Boolean)
                      .join(', ') || 'Not provided'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedRequest.description && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Description
                  </h4>
                  <p className="text-slate-300 text-sm">{selectedRequest.description}</p>
                </div>
              )}

              {/* Status Info */}
              <div>
                <h4 className="text-white font-medium mb-3">Status Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Submitted:</span>
                    <p className="text-white">{formatDate(selectedRequest.created_at)}</p>
                  </div>
                  {selectedRequest.approved_at && (
                    <div>
                      <span className="text-slate-400">Processed:</span>
                      <p className="text-white">{formatDate(selectedRequest.approved_at)}</p>
                    </div>
                  )}
                  {selectedRequest.rejection_reason && (
                    <div className="col-span-2">
                      <span className="text-slate-400">Rejection Reason:</span>
                      <p className="text-white">{selectedRequest.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end space-x-4">
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={processing === selectedRequest.id}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    {processing === selectedRequest.id ? 'Approving...' : 'Approve & Send Invitation'}
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Reject Registration</h3>
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
                disabled={!rejectionReason.trim() || processing === selectedRequest.id}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {processing === selectedRequest.id ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationManagement;
