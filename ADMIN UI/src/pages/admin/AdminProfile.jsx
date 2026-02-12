import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
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
  Key,
  LogOut,
  Activity,
  Settings,
  Briefcase,
  Building,
  Camera,
  Upload,
  ShieldCheck,
  Crown,
  Save,
  X,
} from "lucide-react";
import { ADMIN_API } from "../../lib/admin/adminApi";
import { useNavigate } from "react-router-dom";

const AdminProfilePage = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Fetch admin profile data
  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, activityRes, sessionsRes] = await Promise.all([
        ADMIN_API.get("/api/admin/profile"),
        ADMIN_API.get("/api/admin/profile/activity"),
        ADMIN_API.get("/api/admin/profile/sessions"),
      ]);

      const profile = profileRes.data.profile;
      setProfileData(profile);
      setActivities(activityRes.data.activityLogs || []);
      setSessions(sessionsRes.data.sessions || []);
      
      // Initialize edit form with profile data
      setEditForm({
        name: profile?.name || "",
        phone: profile?.phone || "",
        bio: profile?.bio || "",
        location: profile?.location || "",
        country: profile?.country || "",
        title: profile?.adminProfile?.title || "",
        department: profile?.adminProfile?.department || "",
        officeLocation: profile?.adminProfile?.officeLocation || "",
        backupEmail: profile?.adminProfile?.backupEmail || "",
        emergencyContact: profile?.adminProfile?.emergencyContact || "",
        workPhone: profile?.adminProfile?.workPhone || "",
        dob: profile?.dob ? profile.dob.split('T')[0] : "", // Format for date input
        signature: profile?.adminProfile?.signature || "",
      });
    } catch (err) {
      console.error("Admin profile fetch error:", err);
      setError(err.response?.data?.message || "Could not load admin profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  // ✅ Age calculation from DOB
  const ageText = useMemo(() => {
    const dob = profileData?.dob;
    if (!dob) return "Not Set";

    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return "Invalid DOB";

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    if (age < 0) return "Invalid DOB";
    return `${age} years`;
  }, [profileData?.dob]);

  // Start editing
  const startEditing = () => {
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    // Reset form to original data
    setEditForm({
      name: profileData?.name || "",
      phone: profileData?.phone || "",
      bio: profileData?.bio || "",
      location: profileData?.location || "",
      country: profileData?.country || "",
      title: profileData?.adminProfile?.title || "",
      department: profileData?.adminProfile?.department || "",
      officeLocation: profileData?.adminProfile?.officeLocation || "",
      backupEmail: profileData?.adminProfile?.backupEmail || "",
      emergencyContact: profileData?.adminProfile?.emergencyContact || "",
      workPhone: profileData?.adminProfile?.workPhone || "",
      dob: profileData?.dob ? profileData.dob.split('T')[0] : "",
      signature: profileData?.adminProfile?.signature || "",
    });
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save all edits
  const saveAllEdits = async () => {
    try {
      const updateData = {
        name: editForm.name,
        phone: editForm.phone,
        bio: editForm.bio,
        location: editForm.location,
        country: editForm.country,
        dob: editForm.dob ? new Date(editForm.dob).toISOString() : null,
        adminProfile: {
          title: editForm.title,
          department: editForm.department,
          officeLocation: editForm.officeLocation,
          backupEmail: editForm.backupEmail,
          emergencyContact: editForm.emergencyContact,
          workPhone: editForm.workPhone,
          signature: editForm.signature,
        }
      };

      const response = await ADMIN_API.put("/api/admin/profile", updateData);
      
      if (response.data?.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        await fetchAdminProfile(); // Refresh data
      } else {
        toast.error(response.data?.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  };

  // Handle image upload
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploadingImage(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', selectedImage);
      
      // Upload using axios directly for FormData
      const token = localStorage.getItem("admin_token");
      const response = await axios.post(
        `${BASE_URL}/api/admin/profile/avatar`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.success) {
        toast.success("Profile image updated successfully");
        setSelectedImage(null);
        setImagePreview(null);
        await fetchAdminProfile(); // Refresh profile
      } else {
        toast.error(response.data?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    const currentPassword = prompt("Enter current password:");
    const newPassword = prompt("Enter new password:");
    const confirmPassword = prompt("Confirm new password:");

    if (!currentPassword || !newPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      const response = await ADMIN_API.put("/api/admin/profile/password", {
        currentPassword,
        newPassword,
      });
      
      if (response.data?.success) {
        toast.success("Password changed successfully");
      } else {
        toast.error(response.data?.message || "Password change failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  };

  // Revoke session
  const handleRevokeSession = async (sessionId) => {
    if (!confirm("Are you sure you want to revoke this session?")) return;

    try {
      const response = await ADMIN_API.delete(`/api/admin/profile/sessions/${sessionId}`);
      
      if (response.data?.success) {
        toast.success("Session revoked");
        fetchAdminProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke session");
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
    toast.success("Logged out successfully");
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-primary-600 animate-spin" size={40} />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Loading admin profile...
        </p>
      </div>
    );
  }

  // Error state
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

  const displayUser = profileData || {};

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-2xl text-white">
              <Crown size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Admin Profile
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Your administrative identity, permissions, and security settings.
          </p>
        </div>

        <div className="flex gap-3">
          {!isEditing ? (
            <button
              onClick={startEditing}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200/30 flex items-center justify-center space-x-2"
            >
              <Edit3 size={18} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={cancelEditing}
                className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center space-x-2"
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button
                onClick={saveAllEdits}
                className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200/30 flex items-center justify-center space-x-2"
              >
                <Save size={18} />
                <span>Save Changes</span>
              </button>
            </div>
          )}
          <button
            onClick={() => navigate("/admin/settings")}
            className="bg-white border border-slate-200 text-slate-900 px-6 py-2.5 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center space-x-2"
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200/30 flex items-center justify-center space-x-2"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="relative inline-block">
              <div className="h-28 w-28 sm:h-32 sm:w-32 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center text-primary-600 text-4xl font-bold shadow-inner overflow-hidden border-4 border-white dark:border-slate-900">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : displayUser?.profileImage ? (
                  <img
                    src={displayUser.profileImage.startsWith('http') ? displayUser.profileImage : `${BASE_URL}${displayUser.profileImage}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayUser?.name?.charAt(0) || "A"
                )}
              </div>

              <div
                className={`absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-white dark:border-slate-900 shadow-sm flex items-center justify-center ${
                  displayUser?.isActive ? "bg-green-500" : "bg-slate-400"
                }`}
                title={displayUser?.isActive ? "Account Active" : "Inactive"}
              >
                <Crown size={12} className="text-white" />
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="mt-4 space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition"
              >
                <Camera size={16} />
                Change Photo
              </button>
              
              {selectedImage && (
                <div className="space-y-2 animate-in fade-in">
                  <p className="text-xs text-slate-500 text-center">
                    Selected: {selectedImage.name}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={uploadImage}
                      disabled={uploadingImage}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Upload size={16} />
                      )}
                      {uploadingImage ? "Uploading..." : "Upload"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="text-center text-2xl font-bold bg-transparent border-b border-primary-300 focus:border-primary-600 focus:outline-none"
                />
              ) : (
                displayUser?.name || "Administrator"
              )}
            </h2>

            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 flex items-center gap-1">
                <ShieldCheck size={12} />
                {displayUser?.adminProfile?.title || "Administrator"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                {displayUser?.role || "ADMIN"}
              </span>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                Age: {ageText}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300">
                {displayUser?.emailVerified ? "Verified" : "Not Verified"}
              </span>
            </div>

            {/* Admin Stats */}
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {displayUser?.stats?.totalActions || 0}
                </p>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Total Actions
                </p>
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {sessions.length}
                </p>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Active Sessions
                </p>
              </div>
            </div>

            {/* Quick Action */}
            <div className="mt-6">
              <button
                onClick={handlePasswordChange}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
              >
                <Key size={16} />
                Change Password
              </button>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white px-2 flex items-center gap-2">
              <Shield size={18} />
              Security & Sessions
            </h3>

            <div className="space-y-3">
              {sessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-2xl border border-slate-100 dark:border-slate-700"
                >
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {session.userAgent?.substring(0, 30) || "Unknown Device"}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-slate-500">
                      {session.ipAddress || "Unknown IP"}
                    </p>
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-bold"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User size={20} />
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
                    {displayUser?.email || "—"}
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
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm mt-1"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-semibold truncate">
                      {displayUser?.phone || "Not Added"}
                    </p>
                  )}
                </div>
              </div>

              {/* DOB */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <Calendar size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Date of Birth
                  </p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm mt-1"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-semibold">
                      {displayUser?.dob
                        ? new Date(displayUser.dob).toLocaleDateString()
                        : "Not Set"}
                    </p>
                  )}
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
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Location
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm mt-1"
                      placeholder="Enter location"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-semibold truncate">
                      {displayUser?.location || "Not Set"}
                    </p>
                  )}
                </div>
              </div>

              {/* Country */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <Globe size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Country
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm mt-1"
                      placeholder="Enter country"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-semibold truncate">
                      {displayUser?.country || "Not Set"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="px-6 sm:px-8 pb-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Biography
              </p>
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm min-h-[120px]"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl italic border border-slate-100 dark:border-slate-700">
                  {displayUser?.bio || "No biography provided yet."}
                </p>
              )}
            </div>
          </div>

          {/* Administrative Information Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase size={20} />
                Administrative Information
              </h3>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Title */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-primary-50 dark:bg-primary-500/10 rounded-xl text-primary-600">
                  <Crown size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Title
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm mt-1"
                      placeholder="Enter title"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-semibold truncate">
                      {displayUser?.adminProfile?.title || "Administrator"}
                    </p>
                  )}
                </div>
              </div>

              {/* Department */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <Building size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Department
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.department}
                      onChange={(e) => handleInputChange("department", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm mt-1"
                      placeholder="Enter department"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-semibold truncate">
                      {displayUser?.adminProfile?.department || "Management"}
                    </p>
                  )}
                </div>
              </div>

              {/* Office Location */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <MapPin size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Office Location
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.officeLocation}
                      onChange={(e) => handleInputChange("officeLocation", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm mt-1"
                      placeholder="Enter office location"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-semibold truncate">
                      {displayUser?.adminProfile?.officeLocation || "Not set"}
                    </p>
                  )}
                </div>
              </div>

              {/* Backup Email */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <Mail size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Backup Email
                  </p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.backupEmail}
                      onChange={(e) => handleInputChange("backupEmail", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm mt-1"
                      placeholder="Enter backup email"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-semibold truncate">
                      {displayUser?.adminProfile?.backupEmail || "Not set"}
                    </p>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <Phone size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Emergency Contact
                  </p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm mt-1"
                      placeholder="Enter emergency contact"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-semibold truncate">
                      {displayUser?.adminProfile?.emergencyContact || "Not set"}
                    </p>
                  )}
                </div>
              </div>

              {/* Work Phone */}
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  <Phone size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Work Phone
                  </p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.workPhone}
                      onChange={(e) => handleInputChange("workPhone", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm mt-1"
                      placeholder="Enter work phone"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white font-semibold truncate">
                      {displayUser?.adminProfile?.workPhone || "Not set"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="px-6 sm:px-8 pb-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Signature
              </p>
              {isEditing ? (
                <textarea
                  value={editForm.signature}
                  onChange={(e) => handleInputChange("signature", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm min-h-[100px]"
                  placeholder="Enter your official signature..."
                />
              ) : (
                <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl italic border border-slate-100 dark:border-slate-700">
                  {displayUser?.adminProfile?.signature || "No signature set."}
                </p>
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={18} />
                Admin Activity Log
              </h3>
              <Clock size={18} className="text-slate-400" />
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activities.length > 0 ? (
                activities.slice(0, 6).map((log, i) => (
                  <div
                    key={log.id || i}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          (log.action || "").includes("Success")
                            ? "bg-green-500"
                            : (log.action || "").includes("ADMIN")
                            ? "bg-primary-500"
                            : "bg-blue-500"
                        }`}
                      ></div>

                      <div>
                        <p className="text-slate-900 dark:text-white font-bold text-sm group-hover:text-primary-600 transition-colors">
                          {log.action}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {log.details || "System log"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block">
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                      <span className="text-[10px] text-slate-300 dark:text-slate-500">
                        IP: {log.ip || "---"}
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

export default AdminProfilePage;