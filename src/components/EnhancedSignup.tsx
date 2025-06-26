
import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Building, User, Mail, Lock, CheckCircle, Hash, Check, AlertCircle } from 'lucide-react';

interface EnhancedSignupProps {
  onSignupSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const EnhancedSignup: React.FC<EnhancedSignupProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [validatingStation, setValidatingStation] = useState(false);
  const [stationValidated, setStationValidated] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    stationName: '',
    stationId: ''
  });
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [step, setStep] = useState<'signup' | 'success'>('signup');

  const validateField = (field: keyof typeof formData, value: string) => {
    let error = '';
    
    switch (field) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = 'Please enter a valid email address';
          }
        }
        break;
      
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters long';
        }
        break;
      
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (formData.password && value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      
      case 'fullName':
        if (!value.trim()) {
          error = 'Full name is required';
        } else if (value.trim().length < 2) {
          error = 'Full name must be at least 2 characters';
        }
        break;
      
      case 'stationName':
        if (!value.trim()) {
          error = 'Station name is required';
        } else if (value.length < 2 || value.length > 100) {
          error = 'Station name must be between 2 and 100 characters';
        }
        break;
      
      case 'stationId':
        if (!value.trim()) {
          error = 'Station ID is required';
        } else {
          // More flexible regex - allow letters, numbers, and hyphens
          const stationIdRegex = /^[A-Za-z0-9-]{3,20}$/;
          if (!stationIdRegex.test(value.trim())) {
            error = 'Station ID must be 3-20 characters, containing only letters, numbers, and hyphens';
          }
        }
        break;
    }
    
    return error;
  };

  const validateAllFields = () => {
    const errors: {[key: string]: string} = {};
    
    Object.keys(formData).forEach(key => {
      const field = key as keyof typeof formData;
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canValidateStation = () => {
    const stationNameError = validateField('stationName', formData.stationName);
    const stationIdError = validateField('stationId', formData.stationId);
    
    return formData.stationName.trim() && 
           formData.stationId.trim() && 
           !stationNameError && 
           !stationIdError;
  };

  const handleStationValidation = async () => {
    console.log('Starting station validation...');
    console.log('Station Name:', formData.stationName);
    console.log('Station ID:', formData.stationId);

    // Validate station fields first
    const stationNameError = validateField('stationName', formData.stationName);
    const stationIdError = validateField('stationId', formData.stationId);
    
    if (stationNameError || stationIdError) {
      setFieldErrors(prev => ({
        ...prev,
        stationName: stationNameError,
        stationId: stationIdError
      }));
      setValidationError('Please fix the station field errors before validating');
      return;
    }

    if (!canValidateStation()) {
      setValidationError('Please ensure station name and ID are properly filled');
      return;
    }

    setValidatingStation(true);
    setValidationError('');
    setStationValidated(false);

    try {
      console.log('Calling validate-station function...');
      
      const { data, error } = await supabase.functions.invoke('validate-station', {
        body: {
          station_name: formData.stationName.trim(),
          station_id: formData.stationId.trim()
        }
      });

      console.log('Validation response:', { data, error });

      if (error) {
        console.error('Station validation error:', error);
        setValidationError(`Validation failed: ${error.message || 'Unknown error'}`);
        setStationValidated(false);
        return;
      }

      if (!data) {
        console.error('No data returned from validation');
        setValidationError('No response from validation service');
        setStationValidated(false);
        return;
      }

      if (!data.valid) {
        console.error('Station validation failed:', data.error);
        setValidationError(data.error || 'Station validation failed - station not found or name/ID combination is invalid');
        setStationValidated(false);
        return;
      }

      console.log('Station validation successful');
      setStationValidated(true);
      setValidationError('');
      
    } catch (error) {
      console.error('Station validation exception:', error);
      setValidationError(`Validation error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      setStationValidated(false);
    } finally {
      setValidatingStation(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateAllFields()) {
      setError('Please fix all form errors before submitting');
      return;
    }

    if (!stationValidated) {
      setError('Please validate your station information first');
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

  // Reset station validation when station fields change
  const handleStationFieldChange = (field: 'stationName' | 'stationId', value: string) => {
    const processedValue = field === 'stationId' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    setStationValidated(false);
    setValidationError('');
    
    // Clear field-specific errors and validate in real-time
    const error = validateField(field, processedValue);
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors and validate in real-time
    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const isFormValid = () => {
    return validateAllFields() && stationValidated;
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
            onChange={(e) => handleFieldChange('email', e.target.value)}
            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.email ? 'border-red-500' : 'border-slate-600'
            }`}
            required
          />
          {fieldErrors.email && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Lock className="w-4 h-4 inline mr-2" />
            Password *
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.password ? 'border-red-500' : 'border-slate-600'
            }`}
            required
          />
          {fieldErrors.password ? (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {fieldErrors.password}
            </p>
          ) : (
            <p className="text-slate-500 text-xs mt-1">
              8+ characters recommended
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Lock className="w-4 h-4 inline mr-2" />
            Confirm Password *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-600'
            }`}
            required
          />
          {fieldErrors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name *
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleFieldChange('fullName', e.target.value)}
            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.fullName ? 'border-red-500' : 'border-slate-600'
            }`}
            required
          />
          {fieldErrors.fullName && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {fieldErrors.fullName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Building className="w-4 h-4 inline mr-2" />
            Station Name *
          </label>
          <input
            type="text"
            value={formData.stationName}
            onChange={(e) => handleStationFieldChange('stationName', e.target.value)}
            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.stationName ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Enter your station name"
            required
          />
          {fieldErrors.stationName ? (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {fieldErrors.stationName}
            </p>
          ) : (
            <p className="text-slate-500 text-xs mt-1">
              2-100 characters
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Hash className="w-4 h-4 inline mr-2" />
            Station ID *
          </label>
          <input
            type="text"
            value={formData.stationId}
            onChange={(e) => handleStationFieldChange('stationId', e.target.value)}
            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
              fieldErrors.stationId ? 'border-red-500' : 'border-slate-600'
            }`}
            placeholder="Enter your station ID"
            required
          />
          {fieldErrors.stationId ? (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {fieldErrors.stationId}
            </p>
          ) : (
            <p className="text-slate-500 text-xs mt-1">
              3-20 characters, letters, numbers, and hyphens only
            </p>
          )}
        </div>

        {/* Station Validation Section */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleStationValidation}
            disabled={validatingStation || !canValidateStation()}
            className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {validatingStation ? (
              'Validating Station...'
            ) : stationValidated ? (
              <>
                <Check className="w-4 h-4" />
                Station Validated
              </>
            ) : (
              'Validate Station'
            )}
          </button>

          {stationValidated && (
            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-2">
              <p className="text-green-400 text-sm text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Station information validated successfully
              </p>
            </div>
          )}

          {validationError && (
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {validationError}
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-3">
          <p className="text-blue-400 text-sm">
            <strong>Note:</strong> After creating your account and verifying your email, 
            a super administrator will review your request and assign appropriate roles to activate your account.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
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
