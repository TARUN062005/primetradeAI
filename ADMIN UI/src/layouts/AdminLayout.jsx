import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  LayoutDashboard,
  Users,
  Mail,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { adminAuth } from "../lib/admin/adminAuth";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const dropdownRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Close sidebar + dropdown on route change
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Close dropdown when click outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Disable body scroll when sidebar open (mobile)
  useEffect(() => {
    if (isSidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [isSidebarOpen]);

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/admin/users")) return "Manage Users";
    if (location.pathname.startsWith("/admin/broadcast")) return "Broadcast";
    if (location.pathname.startsWith("/admin/settings")) return "Settings";
    if (location.pathname.startsWith("/admin/profile")) return "Profile";
    return "Dashboard";
  }, [location.pathname]);

  const handleLogout = () => {
    adminAuth.logout();
    navigate("/admin/login");
  };

  // ✅ ALWAYS RENDER ALL ITEMS
  const menu = [
    {
      name: "Dashboard",
      to: "/admin/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Users",
      to: "/admin/users",
      icon: <Users size={18} />,
    },
    {
      name: "Broadcast",
      to: "/admin/broadcast",
      icon: <Mail size={18} />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Overlay only when sidebar open */}
      {isSidebarOpen && (
        <button
          aria-label="Close sidebar overlay"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed top-0 left-0 z-50 h-screen w-72",
          "bg-white border-r border-slate-200",
          "transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          "flex flex-col",
        ].join(" ")}
      >
        {/* Header */}
        <div className="p-6 flex items-center border-b border-slate-100 h-20">
          <button
            onClick={() => {
              navigate("/admin/dashboard");
              setIsSidebarOpen(false);
            }}
            className="flex items-center text-left"
          >
            <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-200/40 shrink-0">
              <Shield className="text-balck" size={24} />
            </div>
            <div className="ml-3 leading-tight">
              <p className="text-lg font-black tracking-tight text-slate-900">AuthSecure</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Admin Panel
              </p>
            </div>
          </button>

          <button
            aria-label="Close sidebar"
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-4">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest px-3 mb-3">
            Menu
          </div>

          <div className="space-y-2">
            {menu.map((item) => {
              const isActive = 
                location.pathname === item.to || 
                location.pathname.startsWith(item.to + "/");
              
              return (
                <button
                  key={item.to}
                  onClick={() => {
                    navigate(item.to);
                    setIsSidebarOpen(false);
                  }}
                  className={[
                    "flex items-center justify-between w-full px-4 py-3 rounded-2xl font-bold text-sm transition",
                    isActive
                      ? "bg-primary-50 text-primary-700 border border-primary-200" // Changed from white text on blue
                      : "text-slate-700 hover:bg-slate-50 hover:text-primary-600",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    {item.name}
                  </span>
                  <ChevronRight 
                    size={16} 
                    className={isActive ? "text-primary-600" : "opacity-40 text-slate-500"} 
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings fixed bottom */}
        <div className="p-4 border-t border-slate-100 mt-auto">
          <button
            onClick={() => {
              navigate("/admin/settings");
              setIsSidebarOpen(false);
            }}
            className={[
              "flex items-center space-x-3 w-full p-3 rounded-2xl transition-all duration-200 font-bold text-sm",
              location.pathname.startsWith("/admin/settings")
                ? "bg-primary-50 text-primary-700 border border-primary-200" // Changed to match
                : "text-slate-600 hover:bg-slate-50 hover:text-primary-600",
            ].join(" ")}
          >
            <Settings size={22} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main wrapper */}
      <div className="transition-all duration-300 lg:pl-72">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              aria-label="Toggle sidebar menu"
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition lg:hidden"
              onClick={() => setIsSidebarOpen((v) => !v)}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <span className="text-slate-400 font-bold">Admin</span>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-slate-900 font-black capitalize">{pageTitle}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen((v) => !v)}
                className="h-11 w-11 bg-primary-600 rounded-full flex items-center justify-center text-black font-black shadow-lg shadow-primary-200 hover:scale-105 transition-all ring-2 ring-white overflow-hidden"
              >
                A
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-[100] animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50 mb-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Admin
                    </p>
                    <p className="text-sm font-black text-slate-900 truncate">Administrator</p>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/admin/profile");
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-all mx-2 rounded-xl text-left"
                  >
                    <User size={18} />
                    <span className="font-bold text-sm">My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate("/admin/settings");
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition-all mx-2 rounded-xl text-left"
                  >
                    <Settings size={18} />
                    <span className="font-bold text-sm">Settings</span>
                  </button>

                  <div className="h-px bg-slate-100 my-2 mx-4" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full mx-2 px-4 py-3 text-red-500 hover:bg-red-50 transition-all rounded-xl text-left"
                  >
                    <LogOut size={18} />
                    <span className="font-black text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;