import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Check URL parameters for station setup
  const urlParams = new URLSearchParams(window.location.search);
  const isSetup = urlParams.get('setup') === 'true';
  const stationId = urlParams.get('station');
  const setupEmail = urlParams.get('email');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
    
    // Pre-fill email if coming from station setup
    if (isSetup && setupEmail) {
      setEmail(decodeURIComponent(setupEmail));
      setIsLogin(true); // Default to login for station setup
    }
  }, [user, navigate, isSetup, setupEmail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      setMessage('Signed in successfully!');
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await signUp(email, password, { username, full_name: fullName });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Signed up successfully! Please check your email to confirm your account.');
    }

    setLoading(false);
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg border border-slate-700 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isSetup ? 'Station Setup' : 'EV Diagnostic Platform'}
          </h1>
          <p className="text-slate-400">
            {isSetup 
              ? 'Complete your station account setup' 
              : isLogin 
                ? 'Sign in to your account' 
                : 'Create your account'
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-900/20 border border-red-600/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 bg-green-900/20 border border-green-600/50 rounded-lg p-3">
            <p className="text-green-400 text-sm">{message}</p>
          </div>
        )}

        {isSetup && (
          <div className="mb-6 bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              <strong>Station Setup Instructions:</strong>
              <br />
              1. First, confirm your email address by clicking the link in your email
              <br />
              2. Then login here with the temporary password provided by the administrator
              <br />
              3. You'll be prompted to set a new password after logging in
            </p>
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
              disabled={isSetup} // Disable email field during setup
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {isSetup ? 'Temporary Password' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isSetup ? "Enter the temporary password provided" : "Enter your password"}
              required
            />
            {isSetup && (
              <p className="text-slate-500 text-xs mt-1">
                Use the temporary password provided by the administrator
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {!isSetup && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        )}

        {!isSetup && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/register-station')}
              className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
            >
              Need to register a new station?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
