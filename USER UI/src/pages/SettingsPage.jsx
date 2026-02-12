import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/auth/hooks/useAuth";
import axios from "axios";
import {
  User,
  Shield,
  Trash2,
  AlertCircle,
  Save,
  Settings,
  Moon,
  Sun,
  Camera,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Bell,
  BellOff,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { getToken } from "firebase/messaging";
import { messaging } from "../lib/push/firebaseClient";

const SettingsPage = () => {
  const { user, logout } = useAuth();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    gender: user?.gender || "",
    phone: user?.phone || "",
    dob: user?.dob ? String(user.dob).slice(0, 10) : "",
    location: user?.location || "",
    country: user?.country || "",
  });

  // Loading
  const [updateLoading, setUpdateLoading] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  // Image
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(user?.profileImage || "");

  // Theme
  const [theme, setTheme] = useState("light");

  // Push
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState("default"); // granted | denied | default

  // Helper: Auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  // Init theme + permission
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }

    if ("Notification" in window) {
      setPushPermission(Notification.permission);
      setPushEnabled(Notification.permission === "granted");
    }
  }, []);

  // Cleanup preview blob url
  useEffect(() => {
    return () => {
      if (profilePreview && profilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  // Theme toggle
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");

    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
      toast.success("Light mode enabled");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
      toast.success("Dark mode enabled");
    }
  };

  // Image select
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large. Max 2MB allowed.");
      return;
    }

    setProfileImageFile(file);

    if (profilePreview && profilePreview.startsWith("blob:")) {
      URL.revokeObjectURL(profilePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
  };

  // Update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => fd.append(key, val || ""));

      if (profileImageFile) fd.append("profileImage", profileImageFile);

      const res = await axios.patch(`${BASE_URL}/api/user/settings`, fd, {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(res.data?.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdateLoading(false);
    }
  };

  // ✅ Enable Push Notifications
  const enablePushNotifications = async () => {
    try {
      setPushLoading(true);

      if (!("Notification" in window)) {
        toast.error("This browser does not support notifications.");
        return;
      }

      // request permission
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission !== "granted") {
        toast.error("Notification permission denied.");
        setPushEnabled(false);
        return;
      }

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        toast.error("Missing VITE_FIREBASE_VAPID_KEY in client .env");
        return;
      }

      const fcmToken = await getToken(messaging, { vapidKey });

      if (!fcmToken) {
        toast.error("Failed to generate FCM token");
        return;
      }

      // ✅ IMPORTANT: correct backend route
      const res = await axios.post(
        `${BASE_URL}/api/user/notifications/push-token`,
        { token: fcmToken, platform: "WEB" },
        { headers: getAuthHeader() }
      );

      if (res.data?.success) {
        toast.success("Push notifications enabled ✅");
        setPushEnabled(true);
      } else {
        toast.error(res.data?.message || "Failed to enable push");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to enable push");
    } finally {
      setPushLoading(false);
    }
  };

  const disablePushNotifications = async () => {
  try {
    setPushLoading(true);

    const token = localStorage.getItem("token");

    await axios.delete(`${BASE_URL}/api/user/notifications/push-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success("Push notifications disabled for this account ✅");
    setPushEnabled(false);
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to disable push");
  } finally {
    setPushLoading(false);
  }
};

  // Account action
  const handleAccountAction = async (actionType) => {
    const isPermanent = actionType === "permanent";

    const confirmMsg = isPermanent
      ? "WARNING: This will permanently delete your account and all data. This cannot be undone!"
      : "Are you sure you want to suspend your account? You can reactivate it later via email.";

    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.delete(`${BASE_URL}/api/user/account?type=${actionType}`, {
        headers: getAuthHeader(),
      });

      toast.success(isPermanent ? "Account deleted" : "Account suspended");
      logout();
    } catch (err) {
      toast.error("Action failed. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-6 mb-8 flex-wrap">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-600 p-3 rounded-2xl text-white shadow-lg shadow-primary-200/40">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Account Settings
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Update profile information and preferences.
            </p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>

      {/* Push Notifications */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Bell size={18} />
              Push Notifications
            </h2>

            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-bold">
              Receive alerts when admin broadcasts system/security notifications.
            </p>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 font-bold leading-relaxed">
              Permission: <span className="text-slate-600 dark:text-slate-300">{pushPermission}</span>
            </p>
          </div>

          <div className="flex gap-3">
            {pushEnabled ? (
              <button
                type="button"
                onClick={disablePushNotifications}
                disabled={pushLoading}
                className="px-5 py-3 rounded-2xl font-black border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-60 flex items-center gap-2"
              >
                {pushLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <BellOff size={18} />
                )}
                Disable
              </button>
            ) : (
              <button
                type="button"
                onClick={enablePushNotifications}
                disabled={pushLoading}
                className="px-5 py-3 rounded-2xl font-black bg-primary-600 hover:bg-primary-700 text-white transition disabled:opacity-60 flex items-center gap-2"
              >
                {pushLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Bell size={18} />
                )}
                Enable
              </button>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
            <p className="text-sm font-black text-slate-700 dark:text-slate-200">
              Status:{" "}
              <span className={pushEnabled ? "text-emerald-600" : "text-rose-600"}>
                {pushEnabled ? "ENABLED" : "DISABLED"}
              </span>
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2 leading-relaxed">
              For push notifications to work when browser is closed, you must setup Firebase service worker
              and deploy over HTTPS.
            </p>
          </div>
        </div>
      </section>

      {/* Profile Update */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400">
              <User size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Personal Information
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
              {profilePreview ? (
                <img src={profilePreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-black">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>

            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <Camera size={16} />
              <span className="text-sm">Change</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Phone size={16} /> Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91xxxxxxxxxx"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Calendar size={16} /> Date of Birth
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Gender Identity
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <MapPin size={16} /> Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Hyderabad, Telangana"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Globe size={16} /> Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="India"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Short Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows="4"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={updateLoading}
              className="flex items-center space-x-2 bg-primary-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100/40 active:scale-95 disabled:opacity-50"
            >
              {updateLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              ) : (
                <Save size={18} />
              )}
              <span>{updateLoading ? "Updating..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-50/30 dark:bg-red-500/10 rounded-3xl border border-red-100 dark:border-red-500/20 p-8">
        <div className="flex items-center space-x-3 mb-4 text-red-600 dark:text-red-300">
          <AlertCircle size={24} />
          <h2 className="text-xl font-bold">Danger Zone</h2>
        </div>

        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm max-w-2xl leading-relaxed">
          Be careful. These actions are permanent.
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => handleAccountAction("suspend")}
            className="px-6 py-4 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-300 font-bold rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center justify-center space-x-3 shadow-sm active:scale-95"
          >
            <Shield size={18} />
            <span>Suspend Account</span>
          </button>

          <button
            onClick={() => handleAccountAction("permanent")}
            className="px-6 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100/40 flex items-center justify-center space-x-3 active:scale-95"
          >
            <Trash2 size={18} />
            <span>Permanently Delete</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
