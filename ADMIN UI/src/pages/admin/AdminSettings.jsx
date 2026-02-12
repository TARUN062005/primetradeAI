import React from "react";
import { Settings } from "lucide-react";

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary-600 p-3 rounded-2xl text-black shadow-lg shadow-primary-200/30">
          <Settings size={26} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Admin Settings</h1>
          <p className="text-slate-500 font-bold mt-1">
            Configure admin preferences and system settings.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <p className="text-slate-600 font-semibold">
          (Coming soon) Add things like:
        </p>

        <ul className="mt-3 list-disc pl-6 text-slate-500 font-medium space-y-1">
          <li>Admin profile information</li>
          <li>Security audit logs</li>
          <li>Broadcast templates</li>
          <li>System maintenance actions</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSettings;
