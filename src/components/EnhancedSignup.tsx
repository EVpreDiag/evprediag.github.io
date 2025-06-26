
import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Building, User, Mail, Lock, CheckCircle, Hash } from 'lucide-react';

interface EnhancedSignupProps {
  onSignupSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const EnhancedSignup: React.FC<EnhancedSignupProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    stationName: '',
    stationId: ''
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState<'signup' | 'success'>('signup');

  const validateStationFields = () => {
    if (!formData.stationName.trim()) {
      setError('Station name is required');
      return false;
    }
    
    if (!formData.stationId.trim()) {
      setError('Station ID is required');
      return false;
    }

    // Station ID validation - alphanumeric with hyphens, 3-20 characters
    const stationIdRegex = /^[A-Z0-9-]{3,20}$/i;
    if (!stationIdRegex.test(formData.stationId)) {
      setError('Station ID must be 3-20 characters, containing only letters, numbers, and hyphens');
      return false;
    }

    // Station name validation - reasonable length and format
    if (formData.stationName.length < 2 || formData.stationName.length > 100) {
      setError('Station name must be between 2 and 100 characters');
      return false;
    }

    return true;
  };

  const checkStationExists = async () => {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('id, name')
        .or(`id.eq.${formData.stationId},name.ilike.${formData.stationName}`)
        .limit(1);

      if (error) {
        console.error('Error checking station:', error);
        setError('Failed to validate station information');
        return false;
      }

      if (data && data.length > 0) {
        const existingStation = data[0];
        if (existingStation.id.toLowerCase() === formData.stationId.toLowerCase()) {
          setError('A station with this ID already exists');
          return false;
        }
        if (existingStation.name.toLowerCase() === formData.stationName.toLowerCase()) {
          setError('A station with this name already exists');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Station validation error:', error);
      setError('Failed to validate station information');
      return false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateStationFields()) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if station already exists
      const isStationValid = await checkStationExists();
      if (!isStationValid) {
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName,
            station_id: formData.stationId,
            station_name: formData.stationName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        setStep('success');
        if (onSignupSuccess) {
          onSignupSuccess();
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message.includes('User already registered')) {
        setError('An account with this email already exists. Please use a different email or sign in.');
      } else {
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Account Created Successfully</h2>
        <p className="text-slate-400 mb-6">
          We've sent a confirmation email to <strong>{formData.email}</strong>. 
          Please check your inbox and click the confirmation link to verify your account.
        </p>
        <p className="text-slate-400 mb-6">
          After verification, your account will be pending approval. A super administrator will review your request and assign appropriate roles.
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
            Email Address *
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
            Password *
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
            <Lock className="w-4 h-4 inline mr-2" />
            Confirm Password *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name *
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
            Station Name *
          </label>
          <input
            type="text"
            value={formData.stationName}
            onChange={(e) => setFormData(prev => ({ ...prev, stationName: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your station name"
            required
          />
          <p className="text-slate-500 text-xs mt-1">
            2-100 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Hash className="w-4 h-4 inline mr-2" />
            Station ID *
          </label>
          <input
            type="text"
            value={formData.stationId}
            onChange={(e) => setFormData(prev => ({ ...prev, stationId: e.target.value.toUpperCase() }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter your station ID"
            required
          />
          <p className="text-slate-500 text-xs mt-1">
            3-20 characters, letters, numbers, and hyphens only
          </p>
        </div>

        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-3">
          <p className="text-blue-400 text-sm">
            <strong>Note:</strong> After creating your account and verifying your email, 
            a super administrator will review your request and assign appropriate roles to activate your account.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
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
