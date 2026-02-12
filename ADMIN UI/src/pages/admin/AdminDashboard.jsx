import React, { useEffect, useMemo, useState } from "react";
import { Users, ShieldCheck, Activity, Loader2, Crown, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { ADMIN_API } from "../../lib/admin/adminApi";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await ADMIN_API.get("/api/admin/users");
      setUsers(res.data?.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const verified = users.filter((u) => u.emailVerified).length;
    return { total, active, verified };
  }, [users]);

  return (
    <div className="space-y-10">
      {/* Premium Rounded Hero Card */}
      <div className="rounded-[32px] p-8 border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 font-black text-xs uppercase tracking-widest">
              <Sparkles size={14} />
              Admin Control Center
            </div>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 mt-4">
              Welcome back, Admin!
            </h1>

            <p className="text-slate-600 font-bold mt-2 text-lg max-w-2xl">
              Manage users, monitor security status, and broadcast system announcements.
            </p>
          </div>

          {/* Admin placeholder "image" */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-slate-900 font-black text-lg">Administrator</p>
              <p className="text-slate-500 font-bold text-sm">Role: SUPER ADMIN</p>
            </div>

            <div className="w-16 h-16 rounded-2xl border border-slate-200 shadow-md bg-slate-50 overflow-hidden">
              <div className="w-full h-full bg-primary-600 text-black font-black flex items-center justify-center text-2xl">
                A
              </div>
            </div>
          </div>
        </div>

        {/* Top actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
            <Crown size={18} className="text-amber-500" />
            System privileges enabled
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              to="/admin/users"
              className="bg-primary-600 hover:bg-primary-700 text-slate-900 font-black px-6 py-3 rounded-2xl shadow-lg shadow-primary-200/30 transition"
            >
              Manage Users
            </Link>

            <Link
              to="/admin/broadcast"
              className="bg-white hover:bg-slate-50 text-slate-900 font-black px-6 py-3 rounded-2xl border border-slate-200 shadow-sm transition"
            >
              Send Broadcast
            </Link>
          </div>
        </div>

        {/* Loader */}
        {loading ? (
          <div className="h-[35vh] flex items-center justify-center mt-10">
            <Loader2 className="animate-spin text-primary-600" size={46} />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <Users />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Total Users
                    </p>
                    <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-green-50 border border-green-100 text-green-600">
                    <Activity />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Active Accounts
                    </p>
                    <p className="text-2xl font-black text-slate-900">{stats.active}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
                    <ShieldCheck />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Email Verified
                    </p>
                    <p className="text-2xl font-black text-slate-900">{stats.verified}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent users */}
            <div className="mt-10 rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-black text-lg text-slate-900">Recently Registered</h2>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Showing latest 6
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {users.slice(0, 6).map((u) => (
                  <div
                    key={u.id}
                    className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700">
                        {(u.name || u.email || "U").charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-black text-slate-900">{u.name || "Unnamed"}</p>
                        <p className="text-slate-500 font-bold text-sm">
                          {u.email || "No email"} • {(u.authProvider || "LOCAL").toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={[
                        "text-xs font-black px-3 py-1 rounded-full w-fit",
                        u.isActive
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : "bg-red-50 text-red-700 border border-red-100",
                      ].join(" ")}
                    >
                      {u.isActive ? "ACTIVE" : "SUSPENDED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
