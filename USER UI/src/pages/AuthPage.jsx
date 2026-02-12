import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, User, Github, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/auth/hooks/useAuth';
import authService from '../lib/auth/authService';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ✅ Normalize backend URL to prevent double slash issues
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register'
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Check for errors passed back from social redirects
  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'register' || m === 'login') {
      setMode(m);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ FIXED: Prevent /api/auth/google//callback problems
  const handleSocialLogin = (provider) => {
    if (!provider) return;

    // Always generate clean URL: http://localhost:5000/api/auth/google
    const url = `${BACKEND_URL}/api/auth/${provider}`;

    window.location.assign(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let data;

      if (mode === 'login') {
        data = await authService.login(formData.email, formData.password);
      } else if (mode === 'register') {
        data = await authService.register(formData.name, formData.email, formData.password);
      }

      // ⭐ NEW: Handle verification required after registration
      if (mode === 'register' && data?.requiresVerification) {
        toast.success('Registration successful! Please check your email to verify your account.');
        setMode('login'); // Switch back to login page
        setIsLoading(false);
        return;
      }

      // ⭐ NEW: Handle EMAIL_NOT_VERIFIED error
      if (data?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error(data.message || 'Please verify your email first. A new verification link has been sent.');
        setIsLoading(false);
        return;
      }

      // STRICT check
      if (!data?.success) {
        toast.error(data?.message || 'Authentication failed');
        setIsLoading(false);
        return;
      }

      if (data?.token) localStorage.setItem('token', data.token);
      localStorage.setItem('login_timestamp', Date.now().toString());

      setUser(data.user);
      toast.success(data.message || 'Authenticated successfully!');
      navigate('/dashboard');
    } catch (err) {
      // ⭐ NEW: Handle EMAIL_NOT_VERIFIED from error response
      if (err?.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error(err.response.data.message || 'Please verify your email first. A new verification link has been sent.');
        setIsLoading(false);
        return;
      }
      
      const message = err?.response?.data?.message || 'Authentication failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 animate-in fade-in duration-500">
      {/* --- Left Column: Visual/Branding --- */}
      <div className="hidden lg:flex w-1/2 bg-primary-900 justify-center items-center p-16 text-white relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-800 rounded-full blur-3xl opacity-40 animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-700 rounded-full blur-3xl opacity-40" />

        <div className="max-w-md space-y-8 relative z-10">
          <div className="inline-flex p-4 bg-white/10 rounded-3xl backdrop-blur-md ring-1 ring-white/20">
            <Shield size={48} className="text-primary-100" />
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-extrabold leading-tight tracking-tight">
              Simple. Secure. <br />
              <span className="text-primary-400">Seamless.</span>
            </h1>
            <p className="text-primary-100/80 text-xl leading-relaxed">
              Experience the next generation of authentication. One platform for all your identity needs.
            </p>
          </div>

          <div className="flex items-center space-x-4 pt-8 border-t border-white/10">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full border-2 border-primary-900 bg-primary-800 flex items-center justify-center text-xs font-bold"
                >
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-sm text-primary-200">Trusted by 10,000+ developers</p>
          </div>
        </div>
      </div>

      {/* --- Right Column: Auth Forms --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-24 py-12 bg-white lg:rounded-l-[40px] shadow-2xl z-20">
        <div className="max-w-sm w-full mx-auto space-y-10">
          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Get started'}
            </h2>
            <p className="text-slate-500 font-medium">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
                <div className="relative group">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors"
                    size={20}
                  />
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-medium"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors"
                  size={20}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-medium"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="text-xs font-bold text-primary-600 hover:text-primary-700"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors"
                  size={20}
                />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-600 outline-none transition-all font-medium"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-primary-200 flex items-center justify-center space-x-3 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  <span className="text-lg">
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
              Social Connect
            </span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Social Grid */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center py-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 shadow-sm space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center py-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-700 shadow-sm space-x-3"
            >
              <Github size={20} />
              <span>GitHub</span>
            </button>
          </div>

          {/* Switch Modes */}
          <div className="text-center pt-4">
            <p className="text-slate-500 font-medium">
              {mode === 'login' ? (
                <>
                  New around here?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-primary-600 font-bold hover:text-primary-700 transition-colors"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already a member?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-primary-600 font-bold hover:text-primary-700 transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;