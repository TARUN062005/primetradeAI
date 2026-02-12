import React from 'react';
import { ShieldAlert, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RateLimitPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl border border-slate-100 text-center space-y-6">
        <div className="bg-amber-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-amber-500">
          <ShieldAlert size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Too many tries</h1>
          <p className="text-slate-500 leading-relaxed">
            For your security, we have temporarily blocked authentication attempts from your IP address.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center space-x-3 text-slate-600 font-bold">
          <Clock size={18} />
          <span>Try again after 15 minutes</span>
        </div>

        <Link 
          to="/" 
          className="flex items-center justify-center space-x-2 text-primary-600 font-bold hover:text-primary-700 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default RateLimitPage;