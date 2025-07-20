import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { ArrowLeft, Plus, Edit, Trash2, Building, Users, Shield, CreditCard } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  created_by?: string;
  subscription?: {
    id: string;
    plan_id: string;
    status: string;
    plan_name: string;
    trial_end?: string;
    current_period_end?: string;
    days_remaining?: number;
  };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price_cents: number;
  billing_interval: string;
  is_trial: boolean;
}

const StationManagement = () => {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const copyStationId = (stationId: string) => {
    navigator.clipboard.writeText(stationId);
    // You could add a toast notification here if desired
  };

  useEffect(() => {
    if (!isSuperAdmin()) {
      return;
    }
    fetchStations();
    fetchSubscriptionPlans();
  }, [isSuperAdmin]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stations')
        .select(`
          *,
          subscriptions!inner(
            id,
            plan_id,
            status,
            trial_end,
            current_period_end,
            subscription_plans!inner(
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to include subscription info
      const stationsWithSubscriptions = (data || []).map(station => {
        const subscription = station.subscriptions?.[0];
        if (subscription) {
          const now = new Date();
          const endDate = subscription.status === 'trial' ? 
            new Date(subscription.trial_end) : 
            new Date(subscription.current_period_end);
          const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            ...station,
            subscription: {
              id: subscription.id,
              plan_id: subscription.plan_id,
              status: subscription.status,
              plan_name: subscription.subscription_plans.name,
              trial_end: subscription.trial_end,
              current_period_end: subscription.current_period_end,
              days_remaining: Math.max(0, daysRemaining)
            }
          };
        }
        return station;
      });
      
      setStations(stationsWithSubscriptions);
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_cents', { ascending: true });

      if (error) throw error;
      setSubscriptionPlans(data || []);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const handleSaveStation = async () => {
    try {
      if (editingStation) {
        // Update existing station
        const { error } = await supabase
          .from('stations')
          .update({
            name: formData.name,
            address: formData.address || null,
            phone: formData.phone || null,
            email: formData.email || null
          })
          .eq('id', editingStation.id);

        if (error) throw error;
      } else {
        // Create new station
        const { error } = await supabase
          .from('stations')
          .insert({
            name: formData.name,
            address: formData.address || null,
            phone: formData.phone || null,
            email: formData.email || null
          });

        if (error) throw error;
      }

      setShowModal(false);
      setEditingStation(null);
      setFormData({ name: '', address: '', phone: '', email: '' });
      fetchStations();
    } catch (error) {
      console.error('Error saving station:', error);
    }
  };

  const handleEditStation = (station: Station) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      address: station.address || '',
      phone: station.phone || '',
      email: station.email || ''
    });
    setShowModal(true);
  };

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm('Are you sure you want to delete this station? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('stations')
        .delete()
        .eq('id', stationId);

      if (error) throw error;
      fetchStations();
    } catch (error) {
      console.error('Error deleting station:', error);
    }
  };

  const handleManageSubscription = (station: Station) => {
    setSelectedStation(station);
    setSelectedPlanId(station.subscription?.plan_id || '');
    setShowSubscriptionModal(true);
  };

  const handleUpdateSubscription = async () => {
    if (!selectedStation || !selectedPlanId) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan_id: selectedPlanId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('station_id', selectedStation.id);

      if (error) throw error;
      
      setShowSubscriptionModal(false);
      setSelectedStation(null);
      setSelectedPlanId('');
      fetchStations();
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  if (!isSuperAdmin()) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-4">Only super administrators can manage stations.</p>
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
        <div className="text-white">Loading stations...</div>
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
              <h1 className="text-xl font-bold text-white">Station Management</h1>
              <p className="text-sm text-slate-400">Manage service stations</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingStation(null);
              setFormData({ name: '', address: '', phone: '', email: '' });
              setShowModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Station</span>
          </button>
        </div>
      </header>

      <div className="p-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">
              Stations ({stations.length})
            </h2>
          </div>
          
          <div className="divide-y divide-slate-700">
            {stations.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Building className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p>No stations found. Create your first station to get started.</p>
              </div>
            ) : (
              stations.map((station) => (
                <div key={station.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-2">{station.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400 mb-4">
                        <div className="bg-slate-700 rounded px-3 py-2">
                          <span className="text-slate-500">Station ID:</span>{' '}
                          <code className="text-blue-300 font-mono text-xs">{station.id}</code>
                          <button
                            onClick={() => copyStationId(station.id)}
                            className="ml-2 text-slate-400 hover:text-white transition-colors"
                            title="Copy Station ID"
                          >
                            📋
                          </button>
                        </div>
                        {station.address && (
                          <div>
                            <span className="text-slate-500">Address:</span> {station.address}
                          </div>
                        )}
                        {station.phone && (
                          <div>
                            <span className="text-slate-500">Phone:</span> {station.phone}
                          </div>
                        )}
                        {station.email && (
                          <div>
                            <span className="text-slate-500">Email:</span> {station.email}
                          </div>
                        )}
                        {station.subscription && (
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-500">Subscription:</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              station.subscription.status === 'trial' 
                                ? 'bg-blue-900/50 text-blue-300' 
                                : station.subscription.status === 'active'
                                ? 'bg-green-900/50 text-green-300'
                                : 'bg-red-900/50 text-red-300'
                            }`}>
                              {station.subscription.plan_name}
                            </span>
                            <span className="text-slate-400">
                              ({station.subscription.days_remaining} days left)
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        Created: {new Date(station.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleManageSubscription(station)}
                        className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Manage Subscription"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditStation(station)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit Station"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStation(station.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Delete Station"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Station Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {editingStation ? 'Edit Station' : 'Add New Station'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Station Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter station name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingStation(null);
                  setFormData({ name: '', address: '', phone: '', email: '' });
                }}
                className="flex-1 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStation}
                disabled={!formData.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {editingStation ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Management Modal */}
      {showSubscriptionModal && selectedStation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                Manage Subscription for {selectedStation.name}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {selectedStation.subscription && (
                <div className="p-4 bg-slate-700 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Current Subscription</h4>
                  <div className="text-sm text-slate-300 space-y-1">
                    <div>Plan: {selectedStation.subscription.plan_name}</div>
                    <div>Status: <span className={`font-medium ${
                      selectedStation.subscription.status === 'trial' 
                        ? 'text-blue-300' 
                        : selectedStation.subscription.status === 'active'
                        ? 'text-green-300'
                        : 'text-red-300'
                    }`}>
                      {selectedStation.subscription.status}
                    </span></div>
                    <div>Days remaining: {selectedStation.subscription.days_remaining}</div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select New Plan
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a plan...</option>
                  {subscriptionPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ${(plan.price_cents / 100).toFixed(2)}/{plan.billing_interval}
                      {plan.is_trial && ' (Trial)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex space-x-3">
              <button
                onClick={() => {
                  setShowSubscriptionModal(false);
                  setSelectedStation(null);
                  setSelectedPlanId('');
                }}
                className="flex-1 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubscription}
                disabled={!selectedPlanId}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                Update Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationManagement;
