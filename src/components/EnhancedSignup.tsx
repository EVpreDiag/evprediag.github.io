
import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Building, User, Mail, Lock, CheckCircle, Hash } from 'lucide-react';

interface EnhancedSignupProps {
  onSignupSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const EnhancedSignup: React.FC<EnhancedSignupProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [validatingStation, setValidatingStation] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    stationName: '',
    stationId: ''
  });
  const [error, setError] = useState('');
  const [stationValidated, setStationValidated] = useState(false);
  const [step, setStep] = useState<'signup' | 'success'>('signup');

  const validateStationInfo = async () => {
    if (!formData.stationName || !formData.stationId) {
      setError('Please enter both station name and station ID');
      return;
    }

    setValidatingStation(true);
    setError('');

    try {
      const { data, error } = await supabase.functions.invoke('validate-station', {
        body: {
          station_name: formData.stationName,
          station_id: formData.stationId
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.valid) {
        setError(data?.error || 'Invalid station name and ID combination');
        setStationValidated(false);
        return;
      }

      setStationValidated(true);
      setError('');
    } catch (error: any) {
      console.error('Station validation error:', error);
      setError('Failed to validate station information. Please try again.');
      setStationValidated(false);
    } finally {
      setValidatingStation(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.fullName || !formData.stationName || !formData.stationId) {
      setError('Please fill in all required fields');
      return;
    }

    if (!stationValidated) {
      setError('Please validate station information first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            username: formData.email,
            station_id: formData.stationId,
            station_name: formData.stationName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        setStep('success');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
        <p className="text-slate-400 mb-6">
          We've sent a confirmation email to <strong>{formData.email}</strong>. 
          Please check your inbox and click the confirmation link to verify your account.
        </p>
        <p className="text-slate-400 mb-6">
          After verification, you'll be able to log in. Your station administrator will assign your role.
        </p>
        <button
          onClick={onSwitchToLogin}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Continue to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-800 rounded-lg border border-slate-700 p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-slate-400">Join an existing service station</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
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
          <p className="text-slate-500 text-xs mt-1">
            8+ characters recommended
          </p>
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

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Building className="w-4 h-4 inline mr-2" />
            Station Name
          </label>
          <input
            type="text"
            value={formData.stationName}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, stationName: e.target.value }));
              setStationValidated(false);
            }}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the exact station name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Hash className="w-4 h-4 inline mr-2" />
            Station ID
          </label>
          <input
            type="text"
            value={formData.stationId}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, stationId: e.target.value }));
              setStationValidated(false);
            }}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter the station ID"
            required
          />
          <p className="text-slate-500 text-xs mt-1">
            Get the Station ID from your station administrator
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={validateStationInfo}
            disabled={validatingStation || !formData.stationName || !formData.stationId}
            className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {validatingStation ? 'Validating...' : 'Validate Station'}
          </button>
        </div>

        {stationValidated && (
          <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-3">
            <p className="text-green-400 text-sm">
              ✓ Station information validated successfully!
            </p>
          </div>
        )}

        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-3">
          <p className="text-blue-400 text-sm">
            <strong>Note:</strong> After creating your account, you'll receive an email confirmation. 
            Your station administrator will assign your role after verification.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !stationValidated}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
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
};

export default EnhancedSignup;
