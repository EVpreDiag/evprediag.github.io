
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Building, User, Mail, Phone, MapPin, Globe, FileText, ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { hashPassword, validatePassword } from '../utils/passwordUtils';
import { sendVerificationEmail } from '../utils/emailUtils';

const StationRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState('');
  const [formData, setFormData] = useState({
    company_name: '',
    business_type: '',
    contact_person_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    website: '',
    description: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }

    if (!formData.contact_person_name.trim()) {
      newErrors.contact_person_name = 'Contact person name is required';
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendVerificationFirst = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await sendVerificationEmail(formData.contact_email, 'station_registration');
      
      if (result.success) {
        setEmailSent(true);
        setVerificationUrl(result.verificationUrl || '');
      } else {
        setErrors({ submit: 'Failed to send verification email. Please try again.' });
      }
    } catch (error) {
      console.error('Error sending verification:', error);
      setErrors({ submit: 'Failed to send verification email. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Hash the password
      const passwordHash = await hashPassword(formData.password);

      // Submit registration with hashed password
      const { password, confirmPassword, ...registrationData } = formData;
      const { error } = await supabase
        .from('station_registration_requests')
        .insert([{
          ...registrationData,
          password_hash: passwordHash,
          email_verified: true // Assuming email was verified in previous step
        }]);

      if (error) throw error;

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting registration:', error);
      setErrors({ submit: 'Failed to submit registration. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Registration Submitted!</h2>
          <p className="text-slate-400 mb-6">
            Thank you for your interest in joining our EV diagnostic network. Your registration request has been submitted successfully.
          </p>
          <p className="text-slate-400 mb-6">
            Our team will review your application and contact you within 2-3 business days with an invitation to complete your account setup.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Verify Your Email</h2>
          <p className="text-slate-400 mb-6">
            We've sent a verification email to <strong>{formData.contact_email}</strong>. 
            Please check your inbox and click the verification link to continue.
          </p>
          
          {verificationUrl && (
            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-400 mb-2">For testing purposes, here's your verification link:</p>
              <a 
                href={verificationUrl}
                className="text-blue-400 hover:text-blue-300 text-sm break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {verificationUrl}
              </a>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => setEmailSent(false)}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Back to Form
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {loading ? 'Submitting...' : 'Complete Registration'}
            </button>
          </div>
        </div>
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
              onClick={() => navigate('/auth')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Login</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Station Registration</h1>
              <p className="text-sm text-slate-400">Join our EV diagnostic network</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Register Your Service Station</h2>
            <p className="text-slate-400">
              Fill out this form to apply for access to our EV diagnostic platform. All fields marked with * are required.
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendVerificationFirst(); }} className="space-y-6">
            {/* Account Security */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Account Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Create a secure password"
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                  <p className="text-slate-500 text-xs mt-1">
                    8+ characters with uppercase, lowercase, number, and special character
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.company_name ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Your company name"
                  />
                  {errors.company_name && (
                    <p className="text-red-400 text-sm mt-1">{errors.company_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Type
                  </label>
                  <select
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select business type</option>
                    <option value="Independent Repair Shop">Independent Repair Shop</option>
                    <option value="Franchise Dealer">Franchise Dealer</option>
                    <option value="Chain Service Center">Chain Service Center</option>
                    <option value="Fleet Maintenance">Fleet Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    name="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.contact_person_name ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Primary contact person"
                  />
                  {errors.contact_person_name && (
                    <p className="text-red-400 text-sm mt-1">{errors.contact_person_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.contact_email ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="contact@company.com"
                  />
                  {errors.contact_email && (
                    <p className="text-red-400 text-sm mt-1">{errors.contact_email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Additional Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tell us about your business
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your services, experience with EVs, team size, etc."
                />
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
                <p className="text-red-400">{errors.submit}</p>
              </div>
            )}

            <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
              <p className="text-blue-400 text-sm">
                <strong>Next Steps:</strong> After clicking "Send Verification Email", you'll receive an email to verify your address. 
                Once verified, you can complete your registration.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {loading ? 'Sending...' : 'Send Verification Email'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StationRegistration;
