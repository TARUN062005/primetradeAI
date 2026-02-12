import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ADMIN_API } from "../../lib/admin/adminApi";
import {
  Search,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Loader2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

const ManageUsers = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");

  const [adminMe, setAdminMe] = useState(null);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // ---------------------------
  // FETCH ADMIN PROFILE
  // ---------------------------
  const fetchAdminMe = async () => {
    try {
      const res = await ADMIN_API.get("/api/admin/me");
      setAdminMe(res.data?.admin || null);
    } catch (err) {
      // Don't toast here. If this fails, admin interceptor will redirect anyway.
      setAdminMe(null);
    }
  };

  // ---------------------------
  // FETCH USERS
  // ---------------------------
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
    fetchAdminMe();
    fetchUsers();
  }, []);

  // ---------------------------
  // SEARCH FILTER
  // ---------------------------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.authProvider || "").toLowerCase().includes(q)
      );
    });
  }, [users, query]);

  // ---------------------------
  // HELPERS
  // ---------------------------
  const isSelf = (u) => adminMe?.id && u?.id === adminMe.id;
  const isAdmin = (u) => u?.role === "ADMIN";

  // ✅ Protected:
  // - any ADMIN account
  // - self account
  const isProtectedAccount = (u) => isAdmin(u) || isSelf(u);

  // ---------------------------
  // ACTIONS (Correct Routes)
  // ---------------------------
  const updateRole = async (userId, role) => {
    setActionLoading(userId + "_role");
    try {
      await ADMIN_API.patch(`/api/admin/users/${userId}/role`, { role });
      toast.success(`Role updated to ${role}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleActive = async (userId, makeActive) => {
    setActionLoading(userId + "_status");
    try {
      if (makeActive) {
        await ADMIN_API.patch(`/api/admin/users/${userId}/reactivate`);
        toast.success("User activated");
      } else {
        await ADMIN_API.patch(`/api/admin/users/${userId}/suspend`);
        toast.success("User suspended");
      }
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId) => {
    const ok = window.confirm("Permanently delete this user?");
    if (!ok) return;

    setActionLoading(userId + "_delete");
    try {
      await ADMIN_API.delete(`/api/admin/users/${userId}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Manage Users</h1>
          <p className="text-slate-500 font-bold mt-1">
            Control accounts, roles, and suspension.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name/email/provider..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <p className="font-black text-slate-900">Users</p>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            Total: {filtered.length}
          </p>
        </div>

        {loading ? (
          <div className="h-[40vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary-600" size={42} />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((u) => {
              const protectedAccount = isProtectedAccount(u);

              return (
                <div
                  key={u.id}
                  className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-2xl bg-primary-600 text-white font-black flex items-center justify-center shrink-0 overflow-hidden">
                      {u.profileImage ? (
                        <img
                          src={
                            u.profileImage.startsWith("http")
                              ? u.profileImage
                              : `${BASE_URL}${u.profileImage}`
                          }
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (u.name || "U").charAt(0)
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-black truncate text-slate-900">
                        {u.name || "Unnamed"}

                        {isSelf(u) && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <ShieldCheck size={14} />
                            YOU
                          </span>
                        )}

                        {u.role === "ADMIN" && (
                          <span className="inline-flex items-center gap-1 ml-2 text-xs font-black px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <Crown size={14} />
                            ADMIN
                          </span>
                        )}

                        {protectedAccount && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
                            <ShieldAlert size={14} />
                            Protected
                          </span>
                        )}
                      </p>

                      <p className="text-sm font-bold text-slate-500 truncate">
                        {u.email || "No email"} • {(u.authProvider || "LOCAL").toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT CONTROLS */}
                  <div className="flex flex-wrap gap-3">
                    {/* ROLE */}
                    <button
                      title={protectedAccount ? "Protected account" : ""}
                      disabled={protectedAccount || actionLoading === u.id + "_role"}
                      onClick={() => updateRole(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}
                      className={[
                        "px-4 py-2 rounded-2xl font-black text-sm transition flex items-center justify-center",
                        protectedAccount
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : u.role !== "ADMIN"
                          ? "bg-slate-900 text-white hover:opacity-95"
                          : "border border-slate-200 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {actionLoading === u.id + "_role"
                        ? "Updating..."
                        : u.role !== "ADMIN"
                        ? "Make Admin"
                        : "Make User"}
                    </button>

                    {/* STATUS */}
                    {u.isActive ? (
                      <button
                        title={protectedAccount ? "Protected account" : ""}
                        disabled={protectedAccount || actionLoading === u.id + "_status"}
                        onClick={() => toggleActive(u.id, false)}
                        className={[
                          "px-4 py-2 rounded-2xl font-black text-sm transition flex items-center gap-2",
                          protectedAccount
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "border border-red-200 text-red-600 hover:bg-red-50",
                        ].join(" ")}
                      >
                        <UserX size={16} />
                        {actionLoading === u.id + "_status" ? "..." : "Suspend"}
                      </button>
                    ) : (
                      <button
                        title={protectedAccount ? "Protected account" : ""}
                        disabled={protectedAccount || actionLoading === u.id + "_status"}
                        onClick={() => toggleActive(u.id, true)}
                        className={[
                          "px-4 py-2 rounded-2xl font-black text-sm transition flex items-center gap-2",
                          protectedAccount
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "border border-green-200 text-green-600 hover:bg-green-50",
                        ].join(" ")}
                      >
                        <UserCheck size={16} />
                        {actionLoading === u.id + "_status" ? "..." : "Activate"}
                      </button>
                    )}

                    {/* DELETE */}
                    <button
                      title={protectedAccount ? "Protected account" : ""}
                      disabled={protectedAccount || actionLoading === u.id + "_delete"}
                      onClick={() => deleteUser(u.id)}
                      className={[
                        "px-4 py-2 rounded-2xl font-black text-sm transition flex items-center gap-2",
                        protectedAccount
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700",
                      ].join(" ")}
                    >
                      <Trash2 size={16} />
                      {actionLoading === u.id + "_delete" ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-10 text-center text-slate-400 font-bold">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
