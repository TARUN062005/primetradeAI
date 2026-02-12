import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth/hooks/useAuth';
import axios from 'axios';
import {
  Activity,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get(`${BASE_URL}/api/user/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setActivities(res.data.logs || []);
      } catch (err) {
        console.error('Failed to fetch activity logs', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [BASE_URL]);

  const stats = [
    {
      label: 'Account Status',
      value: user?.isActive ? 'Active' : 'Suspended',
      icon: <ShieldCheck className="text-green-500" />,
      chip: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300',
    },
    {
      label: 'Verified',
      value: user?.emailVerified ? 'Yes' : 'No',
      icon: <CheckCircle className="text-blue-500" />,
      chip: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    },
    {
      label: 'Provider',
      value: (user?.authProvider || 'Local').toUpperCase(),
      icon: <Activity className="text-purple-500" />,
      chip: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
    },
  ];

  return (
    <div className="space-y-10">
      {/* ✅ Premium dark background */}
      <div className="rounded-[32px] p-8 border border-slate-200 bg-white shadow-sm
                      dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900 dark:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
              Your account security overview and recent activity.
            </p>
          </div>

          {user?.profileImage && (
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-16 h-16 rounded-2xl border border-slate-200 shadow-md
                         dark:border-slate-800 dark:shadow-none"
            />
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="
                rounded-3xl p-6 border border-slate-200 bg-white shadow-sm
                hover:shadow-md transition-all
                dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-none dark:hover:bg-slate-900
              "
            >
              <div className="flex items-center justify-between mb-5">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${stat.chip}`}>
                  {stat.label}
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100
                                dark:bg-slate-800/60 dark:border-slate-700">
                  {stat.icon}
                </div>
              </div>

              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {stat.value}
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Updated from your session profile.
              </p>
            </div>
          ))}
        </div>

        {/* Activity Feed */}
        <div className="mt-10 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm
                        dark:border-slate-800 dark:bg-slate-950/40 dark:shadow-none">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center
                          dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Recent Account Activity
            </h3>

            <span className="px-3 py-1 rounded-full text-xs font-bold
                             bg-primary-50 text-primary-700
                             dark:bg-primary-500/10 dark:text-primary-300">
              Live Updates
            </span>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-2xl bg-slate-100 animate-pulse
                               dark:bg-slate-800/60"
                  />
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-2">
                {activities.map((log) => (
                  <div
                    key={log.id || log._id || `${log.action}-${log.createdAt}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
                               rounded-2xl px-4 py-4
                               hover:bg-slate-50 transition
                               dark:hover:bg-slate-900/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-xl bg-slate-100 border border-slate-200
                                      dark:bg-slate-800/60 dark:border-slate-700">
                        <Clock size={16} className="text-slate-500 dark:text-slate-300" />
                      </div>

                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                          {log.action}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          IP: {log.ip || 'Unknown'} • {log.details || 'System log'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {log.createdAt
                        ? `${new Date(log.createdAt).toLocaleDateString()} at ${new Date(
                            log.createdAt
                          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : '—'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle
                  className="mx-auto text-slate-300 dark:text-slate-600 mb-3"
                  size={34}
                />
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  No activity recorded yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
