
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';
import EnhancedSignup from './EnhancedSignup';

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, loading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');

    try {
      // Clean up auth state before signing in
      localStorage.clear();
      sessionStorage.clear();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        throw error;
      }

      // Force page reload for clean state
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignupSuccess = () => {
    setError('');
    setIsLogin(true);
    // Show success message
    setError('Account created! Please check your email to verify your account, then sign in.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">EV Diagnostic System</h1>
          <p className="text-slate-400">Professional diagnostic tools for EV service stations</p>
        </div>

        {isLogin ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className={`rounded-lg p-3 ${
                  error.includes('created') 
                    ? 'bg-green-900/20 border border-green-600/50' 
                    : 'bg-red-900/20 border border-red-600/50'
                }`}>
                  <p className={`text-sm ${
                    error.includes('created') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center space-x-2 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {authLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700 text-center">
              <p className="text-slate-400 text-sm mb-2">
                Don't have an account?
              </p>
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Create Account
              </button>
            </div>
          </div>
        ) : (
          <EnhancedSignup 
            onSignupSuccess={handleSignupSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm mb-2">
            Need to register a new service station?
          </p>
          <button
            onClick={() => navigate('/register')}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Station Registration →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
