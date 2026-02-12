import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Visual Indicator */}
        <div className="relative inline-block">
          <div className="bg-primary-100 p-8 rounded-[40px] text-primary-600 animate-bounce duration-[3000ms]">
            <Compass size={64} />
          </div>
          <div className="absolute -top-2 -right-2 bg-white p-2 rounded-full shadow-lg text-primary-600 border border-primary-50">
            <span className="text-xl font-bold">404</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Oops! You're lost.
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            The page you are looking for doesn't exist, has been moved, or is restricted.
          </p>
        </div>

        {/* Only Go Home */}
        <div className="flex items-center justify-center pt-4">
          <Link
            to="/"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all"
          >
            <Home size={20} />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
