
import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Building, User, Mail, Lock, MapPin } from 'lucide-react';

interface EnhancedSignupProps {
  onSignupSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const EnhancedSignup: React.FC<EnhancedSignupProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'initial' | 'new_station' | 'existing_station'>('initial');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    stationName: '',
    stationId: '',
    isNewStation: true
  });
  const [error, setError] = useState('');

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields');
      return;
    }
    setStep('new_station');
  };

  const handleStationChoice = (isNew: boolean) => {
    setFormData(prev => ({ ...prev, isNewStation: isNew }));
    setStep(isNew ? 'new_station' : 'existing_station');
  };

  const checkStationExists = async (stationName: string) => {
    const { data, error } = await supabase
      .from('stations')
      .select('id')
      .ilike('name', stationName)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data?.id || null;
  };

  const createStationWithUser = async (stationName: string, userId: string, userEmail: string) => {
    // Create the station
    const { data: stationData, error: stationError } = await supabase
      .from('stations')
      .insert({
        name: stationName,
        email: userEmail,
        created_by: userId
      })
      .select()
      .single();

    if (stationError) throw stationError;

    // Update user profile with station
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ station_id: stationData.id })
      .eq('id', userId);

    if (profileError) throw profileError;

    // Create pending station admin role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'station_admin',
        station_id: stationData.id
      });

    if (roleError) throw roleError;

    return stationData.id;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if station exists when joining existing
      if (!formData.isNewStation) {
        const existingStationId = await checkStationExists(formData.stationName);
        
        if (!existingStationId) {
          setError('Station not found. Please check the station name or create a new station.');
          setLoading(false);
          return;
        }
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            username: formData.email,
            station_name: formData.stationName,
            is_new_station: formData.isNewStation
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        if (formData.isNewStation) {
          // Create new station with pending admin
          await createStationWithUser(formData.stationName, authData.user.id, formData.email);
        } else {
          // Link to existing station
          const existingStationId = await checkStationExists(formData.stationName);
          
          if (existingStationId) {
            await supabase
              .from('profiles')
              .update({ station_id: existingStationId })
              .eq('id', authData.user.id);
          }
        }

        onSignupSuccess?.();
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'initial') {
    return (
      <div className="max-w-md mx-auto bg-slate-800 rounded-lg border border-slate-700 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-400">Join the EV diagnostic network</p>
        </div>

        <form onSubmit={handleInitialSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Continue
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-800 rounded-lg border border-slate-700 p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Station Information</h2>
        <p className="text-slate-400">Choose your station setup</p>
      </div>

      {step === 'new_station' && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleStationChoice(true)}
              className={`p-4 border rounded-lg transition-colors ${
                formData.isNewStation 
                  ? 'border-blue-500 bg-blue-600/20 text-blue-300' 
                  : 'border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              <Building className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm font-medium">New Station</div>
              <div className="text-xs">Create new station</div>
            </button>
            <button
              onClick={() => handleStationChoice(false)}
              className={`p-4 border rounded-lg transition-colors ${
                !formData.isNewStation 
                  ? 'border-blue-500 bg-blue-600/20 text-blue-300' 
                  : 'border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <div className="text-sm font-medium">Join Existing</div>
              <div className="text-xs">Join existing station</div>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Building className="w-4 h-4 inline mr-2" />
            {formData.isNewStation ? 'Station Name' : 'Station Name'}
          </label>
          <input
            type="text"
            value={formData.stationName}
            onChange={(e) => setFormData(prev => ({ ...prev, stationName: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={formData.isNewStation ? 'Enter your station name' : 'Enter existing station name'}
            required
          />
        </div>

        {!formData.isNewStation && (
          <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              You're joining an existing station. Your account will need approval from the station administrator.
            </p>
          </div>
        )}

        {formData.isNewStation && (
          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              Creating a new station requires super admin approval. You'll be notified once approved.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setStep('initial')}
            className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedSignup;
