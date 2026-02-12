import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Zap, Globe, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/auth/hooks/useAuth';

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If auth check is finished and we have a user, redirect to dashboard
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // CRITICAL: do not render landing if session is being restored OR user exists
  // prevents flicker after closing all tabs then reopening
  if (loading || user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">
          Resuming your session...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6 border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center space-x-2 font-bold text-2xl text-primary-900">
          <Shield className="text-primary-600" /> <span>AuthSecure</span>
        </div>
        <div className="space-x-4 flex items-center">
          <Link
  to="/auth?mode=register"
  className="text-slate-600 font-semibold hover:text-primary-600 transition-colors"
>
  Sign Up
</Link>
          <Link
            to="/auth"
            className="bg-primary-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-10 py-24 text-center space-y-10 max-w-5xl mx-auto">
        <div className="space-y-6">
          <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
            The ultimate <span className="text-primary-600">reusable</span> <br />
            authentication engine.
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            A production-ready template featuring Google, GitHub, and Magic Links.
            Stop rebuilding auth and start building your product.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/auth"
            className="w-full sm:w-auto bg-primary-600 text-white px-10 py-4 rounded-2xl text-lg font-bold flex items-center justify-center shadow-xl shadow-primary-200 hover:scale-105 transition-transform"
          >
            Start Free <ArrowRight className="ml-2" />
          </Link>
          <button className="w-full sm:w-auto border border-slate-200 px-10 py-4 rounded-2xl text-lg font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            View Documentation
          </button>
        </div>
      </header>

      {/* Features Grid */}
      <section className="px-10 py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap size={24} />,
              title: 'Fast Integration',
              text: 'Set up in minutes with our clean React hooks.',
            },
            {
              icon: <Globe size={24} />,
              title: 'Social Auth',
              text: 'Pre-configured Google and GitHub OAuth providers.',
            },
            {
              icon: <Lock size={24} />,
              title: 'Secure by Design',
              text: 'JWT based sessions with secure timestamp tracking.',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-xl transition-all group"
            >
              <div className="bg-primary-50 text-primary-600 w-12 h-12 flex items-center justify-center rounded-2xl mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900">{f.title}</h3>
              <p className="text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
