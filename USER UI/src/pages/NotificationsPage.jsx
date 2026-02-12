import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Bell,
  Loader2,
  ShieldAlert,
  Megaphone,
  CheckCircle,
  X,
  AlertTriangle,
  Mail,
  ExternalLink,
  Clock,
  Link2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

const NotificationsPage = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // ✅ modal
  const [openNotif, setOpenNotif] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
  });

  // ✅ filters
  const [filters, setFilters] = useState({
    type: "all",
    priority: "all",
  });

  // ---------------------------
  // Helpers
  // ---------------------------
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "SECURITY":
        return <ShieldAlert className="text-rose-500" size={18} />;
      case "ANNOUNCEMENT":
        return <Megaphone className="text-indigo-500" size={18} />;
      case "MARKETING":
        return <Mail className="text-emerald-500" size={18} />;
      case "SYSTEM":
      default:
        return <Bell className="text-blue-500" size={18} />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "URGENT":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            URGENT
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            HIGH
          </span>
        );
      case "NORMAL":
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            NORMAL
          </span>
        );
    }
  };

  // ✅ Banner avatar (round thumbnail)
  const BannerAvatar = ({ bannerUrl, fallbackIcon }) => {
    const [broken, setBroken] = useState(false);

    // if banner exists and not broken => show image
    if (bannerUrl && !broken) {
      return (
        <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          <img
            src={bannerUrl}
            alt="Notification banner"
            className="w-full h-full object-cover"
            onError={() => setBroken(true)}
          />
        </div>
      );
    }

    // fallback => icon block
    return (
      <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center flex-shrink-0">
        {fallbackIcon || <ImageIcon size={18} className="text-slate-500" />}
      </div>
    );
  };

  // ---------------------------
  // API
  // ---------------------------
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.type !== "all") params.append("type", filters.type);
      if (filters.priority !== "all")
        params.append("priority", filters.priority);

      const url = `${BASE_URL}/api/user/notifications?${params.toString()}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        const list = res.data.notifications || [];
        setNotifications(list);

        setStats({
          total: res.data.total || list.length || 0,
          unread: list.filter((n) => !n.isRead).length,
          read: list.filter((n) => n.isRead).length,
        });
      } else {
        toast.error("Failed to load notifications");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/user/notifications?mode=unreadCount`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        setStats((prev) => ({
          ...prev,
          unread: res.data.unreadCount || 0,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const markAllRead = async () => {
    try {
      setMarkingRead(true);

      const res = await axios.patch(
        `${BASE_URL}/api/user/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        toast.success("All notifications marked as read");
        await fetchNotifications();
        await fetchUnreadCount();
      } else {
        toast.error("Failed to mark read");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to mark notifications read"
      );
    } finally {
      setMarkingRead(false);
    }
  };

  const markOneRead = async (userNotificationId) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/user/notifications/${userNotificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === userNotificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );

      setStats((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1,
      }));
    } catch (err) {
      console.error("markOneRead failed:", err?.response?.data || err.message);
    }
  };

  const trackCTAClick = async (notificationId, ctaUrl) => {
    try {
      await axios.post(
        `${BASE_URL}/api/user/notifications/${notificationId}/click`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (ctaUrl) window.open(ctaUrl, "_blank");
    } catch (err) {
      console.error("Failed to track click:", err);
      if (ctaUrl) window.open(ctaUrl, "_blank");
    }
  };

  // ---------------------------
  // Effects
  // ---------------------------
  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = notifications.filter((n) => {
    if (filters.type !== "all" && n.type !== filters.type) return false;
    if (filters.priority !== "all" && n.priority !== filters.priority)
      return false;
    return true;
  });

  const handleOpenNotification = async (n) => {
    setOpenNotif(n);

    if (!n.isRead) {
      // optimistic: mark read
      await markOneRead(n.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ✅ Modal */}
      {openNotif && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <button
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenNotif(null)}
            aria-label="Close notification modal"
          />

          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* ✅ In modal also show round avatar icon/banner - BUT NOT big banner section */}
                <BannerAvatar
                  bannerUrl={openNotif.bannerUrl}
                  fallbackIcon={getTypeIcon(openNotif.type)}
                />

                <div className="min-w-0">
                  <p className="font-black text-slate-900 dark:text-white truncate">
                    {openNotif.title}
                  </p>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                    {openNotif.sender?.name || "System"} •{" "}
                    {formatDate(openNotif.createdAt)}
                  </p>
                </div>
              </div>

              {/* ✅ Right side: read time at top-right */}
              <div className="flex items-start gap-3">
                {openNotif.isRead && (
                  <div className="hidden sm:flex flex-col items-end text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Read
                    </span>
                    <span>{formatDate(openNotif.readAt)}</span>
                  </div>
                )}

                <button
                  onClick={() => setOpenNotif(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ✅ IMPORTANT: Removed banner section completely */}

            {/* Content */}
            <div className="p-6 space-y-5">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {openNotif.message}
              </p>

              {/* ✅ CTA Button */}
              {openNotif.ctaLabel && openNotif.ctaUrl && (
                <div className="pt-2">
                  <button
                    onClick={() =>
                      trackCTAClick(
                        openNotif.notificationId,
                        openNotif.ctaUrl
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black border-2 border-black bg-black text-white hover:bg-slate-800 transition"
                  >
                    {openNotif.ctaLabel}
                    <ExternalLink size={16} />
                  </button>

                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
                    URL: {openNotif.ctaUrl}
                  </p>
                </div>
              )}

              {/* ✅ Type/Priority removed (you explicitly asked) */}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">
            Latest system updates, alerts, and announcements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            disabled={markingRead || unreadCount === 0}
            className="px-5 py-3 rounded-2xl font-black border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-60"
          >
            {markingRead ? "Marking..." : "Mark all as read"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Bell className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
              <CheckCircle
                className="text-green-600 dark:text-green-400"
                size={20}
              />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.read}
              </p>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Read
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
              <AlertCircle
                className="text-red-600 dark:text-red-400"
                size={20}
              />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.unread}
              </p>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Unread
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Filter by:
            </span>

            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm"
            >
              <option value="all">All Types</option>
              <option value="SYSTEM">System</option>
              <option value="SECURITY">Security</option>
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="MARKETING">Marketing</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priority: e.target.value }))
              }
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <button
            onClick={() => setFilters({ type: "all", priority: "all" })}
            className="px-3 py-2 rounded-xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <p className="text-lg font-black">Recent Notifications</p>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {filteredNotifications.length} notifications found
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 font-bold">
              <Loader2 className="animate-spin" size={18} />
              Loading notifications...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell
                className="mx-auto text-slate-300 dark:text-slate-700"
                size={48}
              />
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-4">
                No notifications found
              </p>
              {filters.type !== "all" || filters.priority !== "all" ? (
                <button
                  onClick={() => setFilters({ type: "all", priority: "all" })}
                  className="mt-2 px-4 py-2 rounded-xl font-bold text-primary-600 hover:text-primary-700"
                >
                  Clear filters to see all notifications
                </button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((n) => (
                <button
                  type="button"
                  key={n.id}
                  onClick={() => handleOpenNotification(n)}
                  className={[
                    "w-full text-left p-4 rounded-2xl border flex items-start gap-4 transition",
                    "hover:scale-[1.005] active:scale-[0.995]",
                    n.isRead
                      ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                      : "border-primary-300 dark:border-primary-500/30 bg-primary-50 dark:bg-primary-500/10",
                  ].join(" ")}
                >
                  {/* ✅ Left side: show banner in round OR icon */}
                  <BannerAvatar
                    bannerUrl={n.bannerUrl}
                    fallbackIcon={getTypeIcon(n.type)}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-slate-900 dark:text-white truncate">
                          {n.title}
                        </p>
                        {getPriorityBadge(n.priority)}
                      </div>

                      {!n.isRead && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white">
                          NEW
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {n.message}
                    </p>

                    {/* CTA Preview */}
                    {n.ctaLabel && (
                      <div className="flex items-center gap-2 mt-2">
                        <Link2 size={12} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          CTA: {n.ctaLabel}
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-3 mt-2">
                      <p className="text-xs font-bold text-slate-400">
                        {n.sender?.name || "System"} • {formatDate(n.createdAt)}
                      </p>
                      {n.isRead ? (
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">
                          Read
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
