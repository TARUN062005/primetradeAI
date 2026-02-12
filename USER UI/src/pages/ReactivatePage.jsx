import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const ReactivatePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No reactivation token found.');
      return;
    }

    const confirmReactivation = async () => {
      try {
        const response = await axios.post('http://localhost:5000/api/user/reactivate', { token });
        setStatus('success');
        setMessage(response.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Reactivation failed or link expired.');
      }
    };

    confirmReactivation();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center animate-in fade-in zoom-in duration-300">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="text-primary-600 animate-spin mb-4" size={48} />
            <h2 className="text-2xl font-bold text-slate-900">Reactivating...</h2>
            <p className="text-slate-500 mt-2">Restoring your account access, please wait.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-full mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back!</h2>
            <p className="text-slate-500 mt-2 mb-8">{message}</p>
            <Link 
              to="/login" 
              className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
            >
              <span>Login to Dashboard</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="bg-red-100 p-4 rounded-full mb-6">
              <AlertCircle className="text-red-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Link Expired</h2>
            <p className="text-slate-500 mt-2 mb-8">{message}</p>
            <Link 
              to="/login" 
              className="text-primary-600 font-bold hover:underline"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactivatePage;