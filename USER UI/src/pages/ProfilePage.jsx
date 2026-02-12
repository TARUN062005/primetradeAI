import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../lib/auth/hooks/useAuth';
import {
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Edit3,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react';

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, activityRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/user/profile`, { headers }),
          axios.get(`${BASE_URL}/api/user/activity`, { headers }),
        ]);

        setProfileData(profileRes.data.user);
        setActivities(activityRes.data.logs || []);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Could not load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchFullProfile();
  }, [BASE_URL]);

  const displayUser = profileData || authUser;

  // ✅ Age calculation from DOB
  const ageText = useMemo(() => {
    const dob = displayUser?.dob;
    if (!dob) return 'Not Set';

    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return 'Invalid DOB';

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    if (age < 0) return 'Invalid DOB';
    return `${age} years`;
  }, [displayUser?.dob]);

  // Loading
  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-primary-600 animate-spin" size={40} />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Loading your profile...
        </p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="text-red-500" size={48} />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {error}
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="text-primary-600 font-bold hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Account Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Your personal details, verification, and security history.
          </p>
        </div>

        <button
          onClick={() => (window.location.href = '/settings')}
          className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200/30 flex items-center justify-center space-x-2"
        >
          <Edit3 size={18} />
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="relative inline-block">
              <div className="h-28 w-28 sm:h-32 sm:w-32 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center text-primary-600 text-4xl font-bold shadow-inner overflow-hidden border-4 border-white dark:border-slate-900">
                {displayUser?.profileImage ? (
                  <img
                    src={displayUser.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayUser?.name?.charAt(0) || 'U'
                )}
              </div>

              <div
                className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${
                  displayUser?.isActive ? 'bg-green-500' : 'bg-slate-400'
                }`}
                title={displayUser?.isActive ? 'Account Active' : 'Inactive'}
              />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
              {displayUser?.name || 'Anonymous'}
            </h2>

            <p className="text-slate-500 dark:text-slate-400 font-medium uppercase text-xs tracking-widest mt-1">
              {displayUser?.role || 'User'} • {displayUser?.authProvider || 'Local'}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                Age: {ageText}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300">
                {displayUser?.emailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {activities.length}
                </p>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Activities
                </p>
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {displayUser?.isActive ? 'Active' : 'Offline'}
                </p>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Status
                </p>
              </div>
            </div>
          </div>

          {/* Verification Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white px-2">
              Verification & Security
            </h3>

            <div
              className={[
                'flex items-center p-3 rounded-2xl space-x-3 border',
                displayUser?.emailVerified
                  ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border-green-100 dark:border-green-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 border-slate-100 dark:border-slate-700',
              ].join(' ')}
            >
              <CheckCircle2 size={20} />
              <span className="text-sm font-semibold">
                {displayUser?.emailVerified ? 'Email Verified' : 'Email Unverified'}
              </span>
            </div>

            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-700 dark:text-blue-300 space-x-3 border border-blue-100 dark:border-blue-500/20">
              <Shield size={20} />
              <span className="text-sm font-semibold">Security Level: High</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* Info Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Personal Information
              </h3>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <Mail size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Email
                  </p>
                  <p className="text-slate-900 dark:text-white font-semibold truncate">
                    {displayUser?.email || '—'}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <Phone size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Phone
                  </p>
                  <p className="text-slate-900 dark:text-white font-semibold truncate">
                    {displayUser?.phone || 'Not Added'}
                  </p>
                </div>
              </div>

              {/* DOB */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Date of Birth
                  </p>
                  <p className="text-slate-900 dark:text-white font-semibold">
                    {displayUser?.dob
                      ? new Date(displayUser.dob).toLocaleDateString()
                      : 'Not Set'}
                  </p>
                </div>
              </div>

              {/* Age */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Age
                  </p>
                  <p className="text-slate-900 dark:text-white font-semibold">
                    {ageText}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Location
                  </p>
                  <p className="text-slate-900 dark:text-white font-semibold">
                    {displayUser?.location || 'Not Set'}
                  </p>
                </div>
              </div>

              {/* Country */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Country
                  </p>
                  <p className="text-slate-900 dark:text-white font-semibold">
                    {displayUser?.country || 'Not Set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="px-6 sm:px-8 pb-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Biography
              </p>
              <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl italic border border-slate-100 dark:border-slate-700">
                {displayUser?.bio || 'No biography provided yet.'}
              </p>
            </div>
          </div>

          {/* Security Log */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Security Log
              </h3>
              <Clock size={18} className="text-slate-400" />
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activities.length > 0 ? (
                activities.slice(0, 6).map((log, i) => (
                  <div
                    key={log.id || log._id || i}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          (log.action || '').includes('Success')
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        }`}
                      ></div>

                      <div>
                        <p className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary-600 transition-colors">
                          {log.action}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {log.details || 'System log'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block">
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '—'}
                      </span>
                      <span className="text-[10px] text-slate-300 dark:text-slate-500">
                        IP: {log.ip || '---'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                  No activity logs found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
