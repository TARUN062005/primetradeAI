import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ADMIN_API } from "../../lib/admin/adminApi";
import {
  Mail,
  Send,
  Loader2,
  ShieldAlert,
  Users,
  User,
  Bell,
  Search,
  Layout,
  Code,
  X,
  CheckCheck,
  Clock,
  Link2,
  Eye,
  Save,
  AlertTriangle,
} from "lucide-react";

const DRAFT_KEY = "ADMIN_BROADCAST_DRAFT_V1";

const TARGETS = [
  { value: "ALL", label: "All Users", icon: Users },
  { value: "SELECTED", label: "Selected Users", icon: Users },
  { value: "SINGLE", label: "Single User", icon: User },
];

const NOTIF_TYPES = [
  { value: "SYSTEM", label: "System" },
  { value: "SECURITY", label: "Security" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "MARKETING", label: "Marketing" },
];

const PRIORITIES = [
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

// ---------------- DEFAULTS ----------------
const DEFAULT_EMAIL_TEMPLATE = `<h1>Hello <%= name %>,</h1>
<p><%= message %></p>
<br/>
<p>Regards,<br/>Admin Team</p>`;

const DEFAULTS = {
  activeTab: "notification",
  target: "ALL",

  channels: { inApp: true, email: false, push: false },

  sendMode: "NOW",
  scheduledAt: "",
  expiryDays: 7,

  ctaLabel: "View Details",
  ctaUrl: `${window.location.origin}/dashboard`,

  notifTitle: "",
  notifMessage: "",
  notifType: "SYSTEM",
  priority: "NORMAL",
  bannerUrl: "",

  emailSubject: "",
  emailTemplate: DEFAULT_EMAIL_TEMPLATE,

  search: "",
  selectedUserIds: [],
};

const AdminBroadcast = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState(DEFAULTS.activeTab); // 'notification' | 'email'

  // Common State
  const [target, setTarget] = useState(DEFAULTS.target);
  const [loading, setLoading] = useState(false);

  // HARD multi-click prevention
  const isSubmittingRef = useRef(false);

  // Channels
  const [sendInApp, setSendInApp] = useState(DEFAULTS.channels.inApp);
  const [sendEmail, setSendEmail] = useState(DEFAULTS.channels.email);
  const [sendPush, setSendPush] = useState(DEFAULTS.channels.push);

  // Schedule
  const [sendMode, setSendMode] = useState(DEFAULTS.sendMode); // NOW | LATER
  const [scheduledAt, setScheduledAt] = useState(DEFAULTS.scheduledAt); // datetime-local

  // TTL Expiry
  const [expiryDays, setExpiryDays] = useState(DEFAULTS.expiryDays);

  // CTA
  const [ctaLabel, setCtaLabel] = useState(DEFAULTS.ctaLabel);
  const [ctaUrl, setCtaUrl] = useState(DEFAULTS.ctaUrl);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState(DEFAULTS.search);
  const [selectedUserIds, setSelectedUserIds] = useState(DEFAULTS.selectedUserIds);

  // Notification Specific
  const [notifTitle, setNotifTitle] = useState(DEFAULTS.notifTitle);
  const [notifMessage, setNotifMessage] = useState(DEFAULTS.notifMessage);
  const [notifType, setNotifType] = useState(DEFAULTS.notifType);
  const [priority, setPriority] = useState(DEFAULTS.priority);
  const [bannerUrl, setBannerUrl] = useState(DEFAULTS.bannerUrl);

  // Email Specific
  const [emailSubject, setEmailSubject] = useState(DEFAULTS.emailSubject);
  const [emailTemplate, setEmailTemplate] = useState(DEFAULTS.emailTemplate);

  // UI
  const [previewOpen, setPreviewOpen] = useState(false);

  const activeModeLabel = activeTab === "notification" ? "NOTIFICATIONS" : "EMAIL";
  const ActiveModeIcon = activeTab === "notification" ? Bell : Mail;

  // --- Fetch users for selection ---
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await ADMIN_API.get("/api/admin/users?limit=200");
      if (res.data?.success) {
        setUsers(res.data?.users || []);
      } else {
        toast.error("Failed to load users");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch only when required
  useEffect(() => {
    if (target === "SELECTED" || target === "SINGLE") fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // Clear selection when switching target
  useEffect(() => {
    if (target === "ALL") setSelectedUserIds([]);
  }, [target]);

  // SINGLE target enforce 1 user max
  useEffect(() => {
    if (target === "SINGLE" && selectedUserIds.length > 1) {
      setSelectedUserIds([selectedUserIds[0]]);
    }
  }, [target, selectedUserIds]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, search]);

  const selectedCount = selectedUserIds.length;

  const toggleUser = (id) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (target === "SINGLE") return [id];
      return [...prev, id];
    });
  };

  const clearSelection = () => setSelectedUserIds([]);

  const selectAllFiltered = () => {
    if (target === "SINGLE") {
      toast.error("Single target allows selecting only 1 user.");
      return;
    }
    setSelectedUserIds(filteredUsers.map((u) => u.id));
  };

  // ---------------- RESET HELPERS ----------------
  const resetNotificationFields = () => {
    setNotifTitle(DEFAULTS.notifTitle);
    setNotifMessage(DEFAULTS.notifMessage);
    setNotifType(DEFAULTS.notifType);
    setPriority(DEFAULTS.priority);
    setBannerUrl(DEFAULTS.bannerUrl);
  };

  const resetEmailFields = () => {
    setEmailSubject(DEFAULTS.emailSubject);
    setEmailTemplate(DEFAULTS.emailTemplate);
  };

  const resetAllFieldsToOriginal = () => {
    setActiveTab(DEFAULTS.activeTab);
    setTarget(DEFAULTS.target);

    setSendInApp(DEFAULTS.channels.inApp);
    setSendEmail(DEFAULTS.channels.email);
    setSendPush(DEFAULTS.channels.push);

    setSendMode(DEFAULTS.sendMode);
    setScheduledAt(DEFAULTS.scheduledAt);
    setExpiryDays(DEFAULTS.expiryDays);

    setCtaLabel(DEFAULTS.ctaLabel);
    setCtaUrl(DEFAULTS.ctaUrl);

    resetNotificationFields();
    resetEmailFields();

    setSelectedUserIds(DEFAULTS.selectedUserIds);
    setSearch(DEFAULTS.search);

    // remove stored data
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem("ADMIN_LAST_SENT_BROADCAST");
  };

  // --- Draft Save/Load ---
  const buildDraft = () => ({
    activeTab,
    target,
    selectedUserIds,
    sendInApp,
    sendEmail,
    sendPush,
    sendMode,
    scheduledAt,
    expiryDays,
    ctaLabel,
    ctaUrl,
    notifTitle,
    notifMessage,
    notifType,
    priority,
    bannerUrl,
    emailSubject,
    emailTemplate,
  });

  const saveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(buildDraft()));
    toast.success("Draft saved");
  };

  const loadDraft = () => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const d = JSON.parse(raw);

      setActiveTab(d.activeTab || DEFAULTS.activeTab);
      setTarget(d.target || DEFAULTS.target);
      setSelectedUserIds(d.selectedUserIds || []);

      setSendInApp(!!d.sendInApp);
      setSendEmail(!!d.sendEmail);
      setSendPush(!!d.sendPush);

      setSendMode(d.sendMode || DEFAULTS.sendMode);
      setScheduledAt(d.scheduledAt || DEFAULTS.scheduledAt);
      setExpiryDays(typeof d.expiryDays === "number" ? d.expiryDays : DEFAULTS.expiryDays);

      setCtaLabel(d.ctaLabel || DEFAULTS.ctaLabel);
      setCtaUrl(d.ctaUrl || DEFAULTS.ctaUrl);

      setNotifTitle(d.notifTitle || "");
      setNotifMessage(d.notifMessage || "");
      setNotifType(d.notifType || DEFAULTS.notifType);
      setPriority(d.priority || DEFAULTS.priority);
      setBannerUrl(d.bannerUrl || "");

      setEmailSubject(d.emailSubject || "");
      setEmailTemplate(d.emailTemplate || DEFAULTS.emailTemplate);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Validation ---
  const validate = () => {
    if (!sendInApp && !sendEmail && !sendPush) {
      toast.error("Select at least 1 channel (In-app / Email / Push)");
      return false;
    }

    if (target !== "ALL" && selectedUserIds.length === 0) {
      toast.error("Select user(s) for this target");
      return false;
    }

    if (target === "SINGLE" && selectedUserIds.length !== 1) {
      toast.error("Select exactly 1 user for SINGLE target");
      return false;
    }

    if (sendMode === "LATER") {
      if (!scheduledAt) {
        toast.error("Select schedule datetime for Send Later");
        return false;
      }
      const dt = new Date(scheduledAt);
      if (Number.isNaN(dt.getTime())) {
        toast.error("Invalid scheduled datetime");
        return false;
      }
      if (dt.getTime() < Date.now() + 60 * 1000) {
        toast.error("Scheduled time must be at least 1 minute in the future");
        return false;
      }
    }

    if (expiryDays < 0 || expiryDays > 365) {
      toast.error("Expiry (TTL) must be between 0 and 365 days");
      return false;
    }

    if (activeTab === "notification") {
      if (!notifTitle.trim()) {
        toast.error("Notification title is required");
        return false;
      }
      if (!notifMessage.trim()) {
        toast.error("Notification message is required");
        return false;
      }
    }

    if (activeTab === "email" && sendEmail) {
      if (!emailSubject.trim()) {
        toast.error("Email subject is required");
        return false;
      }
      if (!emailTemplate.trim()) {
        toast.error("Email template cannot be empty");
        return false;
      }
    }

    return true;
  };

  const detectDuplicate = () => {
    const raw = localStorage.getItem("ADMIN_LAST_SENT_BROADCAST");
    if (!raw) return false;
    try {
      const last = JSON.parse(raw);
      if (!last) return false;
      const now = Date.now();
      if (now - (last.timestamp || 0) > 24 * 60 * 60 * 1000) return false;

      const same =
        (last.notifTitle || "") === notifTitle &&
        (last.notifMessage || "") === notifMessage &&
        (last.activeTab || "") === activeTab;

      return same;
    } catch {
      return false;
    }
  };

  // --- Submit ---
  const handleBroadcast = async (e) => {
    e.preventDefault();

    // HARD BLOCK spam clicks
    if (loading || isSubmittingRef.current) return;

    if (!validate()) return;

    if (target === "ALL") {
      const ok = window.confirm("You are about to send to ALL USERS. Are you sure?");
      if (!ok) return;
    }

    if (detectDuplicate()) {
      const ok = window.confirm(
        "This looks like a duplicate message you already sent in the last 24 hours. Continue anyway?"
      );
      if (!ok) return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const payload = {
        target,
        userIds: target === "ALL" ? [] : selectedUserIds,

        channels: {
          inApp: sendInApp,
          email: sendEmail,
          push: sendPush,
        },

        sendMode,
        scheduledAt: sendMode === "LATER" ? scheduledAt : null,

        expiryDays,

        cta: {
          label: ctaLabel?.trim() || null,
          url: ctaUrl?.trim() || null,
        },

        mode: activeTab,

        ...(activeTab === "notification"
          ? {
              title: notifTitle,
              message: notifMessage,
              type: notifType,
              priority,
              bannerUrl: bannerUrl?.trim() || null,
            }
          : {
              subject: emailSubject,
              htmlTemplate: emailTemplate,
              message: notifMessage || "",
            }),
      };

      const res = await ADMIN_API.post("/api/admin/broadcast/send", payload);

      if (res.data?.success) {
        toast.success(
          sendMode === "LATER"
            ? "Broadcast scheduled!"
            : activeTab === "email"
            ? "Email campaign sent!"
            : "Notification sent!"
        );

        // Save last sent (optional), then REMOVE because you asked to remove send data
        localStorage.setItem(
          "ADMIN_LAST_SENT_BROADCAST",
          JSON.stringify({
            timestamp: Date.now(),
            activeTab,
            notifTitle,
            notifMessage,
          })
        );
        localStorage.removeItem("ADMIN_LAST_SENT_BROADCAST");

        // ✅ Email NOW = full reset
        if (activeTab === "email" && sendMode === "NOW") {
          resetAllFieldsToOriginal();
        } else {
          resetNotificationFields();
          resetEmailFields();

          setTarget(DEFAULTS.target);
          setSelectedUserIds([]);
          setSearch("");

          setSendMode(DEFAULTS.sendMode);
          setScheduledAt(DEFAULTS.scheduledAt);

          localStorage.removeItem(DRAFT_KEY);
        }
      } else {
        toast.error(res.data?.message || "Broadcast failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Broadcast failed");
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;

    setActiveTab(tab);

    toast.success(tab === "notification" ? "Notification mode enabled" : "Email mode enabled");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black italic">BROADCAST_HUB</h1>
          <p className="text-slate-500 font-bold">Manage system-wide communications.</p>
        </div>

        <div className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full text-xs font-black">
          <ShieldAlert size={16} /> ADMIN SECURE
        </div>
      </div>

      {/* Mode indicator */}
      <div className="flex items-center gap-2">
        <div
          className={[
            "inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black font-black text-xs",
            activeTab === "notification"
              ? "bg-sky-100 text-sky-900"
              : "bg-emerald-100 text-emerald-900",
          ].join(" ")}
        >
          <ActiveModeIcon size={16} />
          ACTIVE: {activeModeLabel}
        </div>

        <div className="text-xs font-bold text-slate-500">(Switch tabs to change broadcast type)</div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 border-2 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Tab Switcher */}
        <div className="flex border-b-2 border-black">
          <button
            type="button"
            onClick={() => handleTabChange("notification")}
            className={[
              "flex-1 p-4 font-black flex items-center justify-center gap-2 transition relative",
              activeTab === "notification"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-slate-100 dark:hover:bg-slate-800",
            ].join(" ")}
          >
            <Bell size={20} /> NOTIFICATIONS
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("email")}
            className={[
              "flex-1 p-4 font-black flex items-center justify-center gap-2 transition relative",
              activeTab === "email"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-slate-100 dark:hover:bg-slate-800",
            ].join(" ")}
          >
            <Mail size={20} /> EMAIL
          </button>
        </div>

        <form onSubmit={handleBroadcast} className="p-8 space-y-8">
          {/* disable whole form while loading */}
          <fieldset disabled={loading} className="space-y-8">
            {/* Controls Row */}
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={saveDraft}
                className="px-4 py-2 rounded-xl font-black border-2 border-black bg-white hover:bg-slate-50 flex items-center gap-2"
              >
                <Save size={16} />
                Save Draft
              </button>

              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="px-4 py-2 rounded-xl font-black border-2 border-black bg-white hover:bg-slate-50 flex items-center gap-2"
              >
                <Eye size={16} />
                Preview
              </button>

              {target === "ALL" && (
                <span className="px-4 py-2 rounded-xl font-black border-2 border-black bg-red-50 text-red-700 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  ALL USERS
                </span>
              )}
            </div>

            {/* Channels */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Bell size={16} /> Channels
              </h3>

              <div className="flex gap-3 flex-wrap">
                <label className="flex items-center gap-2 border-2 border-black rounded-xl px-4 py-2 font-black cursor-pointer bg-white">
                  <input
                    type="checkbox"
                    checked={sendInApp}
                    onChange={(e) => setSendInApp(e.target.checked)}
                  />
                  In-app
                </label>

                <label className="flex items-center gap-2 border-2 border-black rounded-xl px-4 py-2 font-black cursor-pointer bg-white">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                  />
                  Email
                </label>

                <label className="flex items-center gap-2 border-2 border-black rounded-xl px-4 py-2 font-black cursor-pointer bg-white">
                  <input
                    type="checkbox"
                    checked={sendPush}
                    onChange={(e) => setSendPush(e.target.checked)}
                  />
                  Push
                </label>
              </div>
            </section>

            {/* Audience */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Users size={16} /> Audience
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TARGETS.map((t) => {
                  const Icon = t.icon;
                  const active = target === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        setTarget(t.value);
                        setSelectedUserIds([]);
                      }}
                      className={[
                        "p-4 rounded-2xl border-2 border-black font-black flex flex-col items-center gap-2 transition",
                        active ? "bg-black text-white" : "bg-white text-black hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <Icon size={24} />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {(target === "SELECTED" || target === "SINGLE") && (
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 min-w-[240px]">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-black"
                        placeholder="Filter users..."
                      />
                    </div>

                    {target === "SELECTED" && (
                      <button
                        type="button"
                        onClick={selectAllFiltered}
                        className="px-4 py-2 rounded-xl font-black border-2 border-black bg-white hover:bg-slate-50 flex items-center gap-2"
                      >
                        <CheckCheck size={16} />
                        Select All
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={clearSelection}
                      className="px-4 py-2 rounded-xl font-black border-2 border-black bg-white hover:bg-slate-50 flex items-center gap-2"
                    >
                      <X size={16} />
                      Clear
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2">
                    {usersLoading ? (
                      <div className="flex items-center gap-2 font-bold text-slate-500">
                        <Loader2 className="animate-spin" size={18} />
                        Loading users...
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <p className="text-sm font-bold text-slate-500">No users found.</p>
                    ) : (
                      filteredUsers.map((u) => {
                        const checked = selectedUserIds.includes(u.id);
                        return (
                          <label
                            key={u.id}
                            className={[
                              "flex items-center justify-between gap-3 bg-white p-3 rounded-xl border-2 border-black cursor-pointer transition",
                              checked ? "ring-4 ring-primary-200" : "",
                            ].join(" ")}
                          >
                            <div className="min-w-0">
                              <p className="font-black text-sm truncate">{u.name || "Unnamed User"}</p>
                              <p className="text-xs font-bold text-slate-500 truncate">{u.email || "No email"}</p>
                            </div>

                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleUser(u.id)}
                            />
                          </label>
                        );
                      })
                    )}
                  </div>

                  <div className="text-xs font-black text-slate-700 dark:text-slate-200">
                    Selected: <span className="text-primary-600">{selectedCount}</span>
                    {target === "SINGLE" && <span className="ml-3 text-slate-500">(SINGLE allows 1)</span>}
                  </div>
                </div>
              )}
            </section>

            <hr className="border-black" />

            {/* Scheduling */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} /> Scheduling & TTL
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={sendMode}
                  onChange={(e) => setSendMode(e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-black font-bold outline-none"
                >
                  <option value="NOW">Send Now</option>
                  <option value="LATER">Send Later</option>
                </select>

                <input
                  type="datetime-local"
                  value={scheduledAt}
                  disabled={sendMode !== "LATER"}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full p-4 rounded-xl border-2 border-black font-bold outline-none disabled:opacity-50"
                />

                <input
                  type="number"
                  min={0}
                  max={365}
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  className="w-full p-4 rounded-xl border-2 border-black font-bold outline-none"
                  placeholder="Expiry days"
                />
              </div>

              <p className="text-xs font-bold text-slate-500">TTL: notification expires after these days (0 = never expires).</p>
            </section>

            <hr className="border-black" />

            {/* CTA */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Link2 size={16} /> Call-To-Action (CTA)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="CTA Label (View Details)"
                  className="w-full p-4 rounded-xl border-2 border-black font-bold outline-none"
                />

                <input
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="/billing or https://..."
                  className="w-full p-4 rounded-xl border-2 border-black font-bold outline-none"
                />
              </div>
            </section>

            <hr className="border-black" />

            {/* Notification or Email */}
            {activeTab === "notification" ? (
              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Layout size={16} /> Notification Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value)}
                    className="w-full p-4 rounded-xl border-2 border-black font-bold outline-none"
                  >
                    {NOTIF_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-4 rounded-xl border-2 border-black font-bold outline-none"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="Notification Heading (e.g. System Update)"
                  className="w-full p-4 rounded-xl border-2 border-black font-bold focus:ring-4 ring-primary-100 outline-none"
                />

                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  rows={4}
                  placeholder="The message content users will see..."
                  className="w-full p-4 rounded-xl border-2 border-black font-bold focus:ring-4 ring-primary-100 outline-none"
                />

                <input
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Banner image URL (optional)"
                  className="w-full p-4 rounded-xl border-2 border-black font-bold outline-none"
                />
              </section>
            ) : (
              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Code size={16} /> Email HTML (EJS Template)
                </h3>

                <input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email Subject Line"
                  className="w-full p-4 rounded-xl border-2 border-black font-bold outline-none"
                />

                <div className="relative">
                  <div className="absolute right-4 top-4 bg-black text-white text-[10px] px-2 py-1 rounded">
                    EJS SUPPORTED
                  </div>
                  <textarea
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    rows={10}
                    className="w-full p-4 rounded-xl border-2 border-black font-mono text-sm bg-slate-900 text-emerald-400 outline-none"
                  />
                </div>

                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  Variables: {"<%= name %>"}, {"<%= email %>"}, {"<%= message %>"}
                </p>
              </section>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={[
                "w-full py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition",
                "shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]",
                loading
                  ? "bg-slate-800 text-white cursor-not-allowed scale-[0.99] shadow-none"
                  : "bg-black text-white hover:bg-primary-700 active:translate-y-1 active:shadow-none",
              ].join(" ")}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  {sendMode === "LATER"
                    ? "SCHEDULING..."
                    : activeTab === "email"
                    ? "SENDING EMAIL..."
                    : "SENDING..."}
                </>
              ) : (
                <>
                  <Send />
                  {sendMode === "LATER"
                    ? "SCHEDULE BROADCAST"
                    : activeTab === "email"
                    ? "SEND EMAIL CAMPAIGN"
                    : "SEND NOTIFICATION"}
                </>
              )}
            </button>
          </fieldset>
        </form>

        {/* Preview Modal */}
        {previewOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-black text-xl flex items-center gap-2">
                  <ActiveModeIcon size={18} />
                  Preview ({activeModeLabel})
                </h2>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="px-3 py-2 rounded-xl border-2 border-black font-black"
                >
                  Close
                </button>
              </div>

              {activeTab === "notification" ? (
                <div className="border-2 border-black rounded-2xl p-4 space-y-2">
                  <div className="flex gap-2 flex-wrap text-xs font-black">
                    <span className="px-2 py-1 rounded bg-slate-200">Type: {notifType}</span>
                    <span className="px-2 py-1 rounded bg-slate-200">Priority: {priority}</span>
                    <span className="px-2 py-1 rounded bg-slate-200">TTL: {expiryDays}d</span>
                  </div>

                  <h3 className="text-lg font-black">{notifTitle || "(No title)"}</h3>
                  <p className="font-bold text-slate-700 whitespace-pre-wrap">{notifMessage || "(No message)"}</p>

                  {(ctaLabel || ctaUrl) && (
                    <div className="pt-3">
                      <button type="button" className="px-4 py-2 rounded-xl border-2 border-black font-black bg-white">
                        {ctaLabel || "Action"}
                      </button>
                      <p className="text-xs font-bold text-slate-500 mt-2">URL: {ctaUrl || "-"}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-black rounded-2xl p-4 space-y-3">
                  <div className="text-xs font-black text-slate-700">
                    Subject:
                    <span className="ml-2 px-2 py-1 rounded bg-slate-200">{emailSubject || "(No subject)"}</span>
                  </div>

                  <div className="text-xs font-black text-slate-700">HTML Template Preview:</div>

                  <div className="rounded-xl border-2 border-black p-4 bg-slate-50 font-mono text-xs whitespace-pre-wrap overflow-auto max-h-72">
                    {emailTemplate || "(No template)"}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBroadcast;
