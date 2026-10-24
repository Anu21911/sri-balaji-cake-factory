import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Bell, Check, Clock, CheckCheck, RefreshCw } from 'lucide-react';

export default function NotificationsSection({ onRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.getOwnerNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
      onRead?.();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationRead('all');
      loadNotifications();
      onRead?.();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            <span>12. Owner Real-Time Notifications</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time incoming orders, custom design requests, customer cancellations, and system alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All as Read</span>
          </button>

          <button
            onClick={loadNotifications}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-stone-400 text-xs py-16 text-center">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
          <div className="text-3xl">🔕</div>
          <h3 className="font-display font-bold text-lg text-white">
            No notifications in history
          </h3>
          <p className="text-xs text-stone-400">
            Real-time incoming alerts will persist here with timestamps.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id || n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.isRead
                  ? 'bg-stone-900/60 border-stone-800 text-stone-400'
                  : 'bg-stone-900 border-amber-500/40 text-stone-200 shadow-md ring-1 ring-amber-500/20'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {n.title}
                  </span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {n.message}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-stone-500 pt-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(n.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkAsRead(n._id || n.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
