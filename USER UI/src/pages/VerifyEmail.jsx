import React, { useState, useEffect, useRef } from 'react'; // ⭐ Added useRef
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const hasRun = useRef(false); // ⭐ NEW: Prevent duplicate execution

  useEffect(() => {
    const verifyEmail = async () => {
      // ⭐ NEW: Prevent duplicate execution
      if (hasRun.current) return;
      hasRun.current = true;
      
      const token = searchParams.get('token');
      
      if (!token) {
        setError('No verification token found in URL');
        setLoading(false);
        return;
      }

      try {
        console.log('Verifying token:', token);
        const response = await axios.post(`${API_BASE_URL}/api/auth/verify-email`, {
          token
        });

        if (response.data.success) {
          setVerified(true);
          toast.success('Email verified successfully! You can now login.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
        } else {
          setError(response.data.message || 'Verification failed');
        }
      } catch (err) {
        console.error('Verification error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to verify email. Please try again.';
        setError(errorMessage);
        
        // If error is about already verified, treat as success
        if (errorMessage.toLowerCase().includes('already verified') || 
            errorMessage.toLowerCase().includes('already verified')) {
          setVerified(true);
          toast.success('Email is already verified. You can now login.');
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl">
        {loading ? (
          <div className="text-center space-y-6">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-primary-600 animate-spin mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
            <p className="text-gray-500">Please wait while we verify your email address.</p>
          </div>
        ) : verified ? (
          <div className="text-center space-y-6">
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-gray-600">
                Your email has been successfully verified. You can now log in to your account.
              </p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
              >
                Go to Login
              </button>
              <p className="text-sm text-gray-500">
                Redirecting to login page in 3 seconds...
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full border border-primary-600 text-primary-600 py-3 rounded-xl font-bold hover:bg-primary-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;