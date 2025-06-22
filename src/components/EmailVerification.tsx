
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../utils/emailUtils';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verify = async () => {
      const result = await verifyEmail(token, email);
      
      if (result.success) {
        setStatus('success');
        setMessage('Email verified successfully!');
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.error || 'Verification failed');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-white mb-4">Verifying Email...</h2>
            <p className="text-slate-400">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Email Verified!</h2>
            <p className="text-slate-400 mb-4">{message}</p>
            <p className="text-sm text-slate-500">Redirecting you to login page...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Verification Failed</h2>
            <p className="text-slate-400 mb-6">{message}</p>
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
