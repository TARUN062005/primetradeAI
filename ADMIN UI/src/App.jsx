// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AdminLayout from "./layouts/AdminLayout";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import AdminBroadcast from "./pages/admin/AdminBroadcast";
import AdminSettings from "./pages/admin/AdminSettings";

import { adminAuth } from "./lib/admin/adminAuth";

const AdminProtected = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) {
          setOk(false);
          return;
        }

        // server verifies token + role
        await adminAuth.me();
        setOk(true);
      } catch (e) {
        localStorage.removeItem("admin_token");
        setOk(false);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  if (loading) return null;
  if (!ok) return <Navigate to="/admin/login" replace />;
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Public route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={
            <AdminProtected>
              <AdminLayout />
            </AdminProtected>
          }
        >
          {/* ✅ Default admin redirect */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Admin pages */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="broadcast" element={<AdminBroadcast />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
