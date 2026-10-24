import React, { useState, useEffect } from 'react';
import { useOwnerAuth } from '../../context/OwnerAuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';
import OwnerFirstTimePasswordModal from './OwnerFirstTimePasswordModal';

// 13 Navigation Sections Icons
import {
  LayoutDashboard,
  BellRing,
  CheckCircle,
  ChefHat,
  Truck,
  Archive,
  XCircle,
  Ban,
  Sparkles,
  Cake,
  Users,
  Bell,
  Settings,
  Volume2,
  VolumeX,
  LogOut,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

// Sub-sections
import OverviewSection from './OverviewSection';
import OrderWorkflowSection from './OrderWorkflowSection';
import CustomCakeRequestsSection from './CustomCakeRequestsSection';
import ProductManagementSection from './ProductManagementSection';
import CustomerDatabaseSection from './CustomerDatabaseSection';
import NotificationsSection from './NotificationsSection';
import BusinessSettingsSection from './BusinessSettingsSection';

export default function OwnerDashboardLayout({ onNavigate }) {
  const { owner, mustChangePassword, logout } = useOwnerAuth();
  const { isConnected, soundEnabled, setSoundEnabled, playChime, latestAlert, clearLatestAlert } = useSocket();

  const [activeSection, setActiveSection] = useState(1); // 1 to 13
  const [stats, setStats] = useState(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [customRequestsCount, setCustomRequestsCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBadges = async () => {
    if (mustChangePassword) return;
    try {
      const [statsRes, notifsRes, customRes] = await Promise.all([
        api.getDashboardStats(),
        api.getOwnerNotifications(),
        api.getOwnerCustomRequests('?status=pending_review')
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (notifsRes.success) setUnreadNotifCount(notifsRes.unreadCount || 0);
      if (customRes.success) setCustomRequestsCount(customRes.requests?.length || 0);
    } catch (err) {
      console.warn('Dashboard badge update failed:', err);
    }
  };

  useEffect(() => {
    if (!mustChangePassword) {
      fetchBadges();
      const interval = setInterval(fetchBadges, 15000); // 15s refresh fallback
      return () => clearInterval(interval);
    }
  }, [mustChangePassword]);

  // Listen to socket alerts to refresh badges
  useEffect(() => {
    if (latestAlert) {
      fetchBadges();
    }
  }, [latestAlert]);

  const navItems = [
    { id: 1, label: '1. Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 2, label: '2. New / Incoming Orders', icon: <BellRing className="w-4 h-4 text-amber-400" />, badge: stats?.totalIncoming },
    { id: 3, label: '3. Accepted Orders', icon: <CheckCircle className="w-4 h-4 text-blue-400" />, count: stats?.totalAccepted },
    { id: 4, label: '4. Preparation / Before Delivery', icon: <ChefHat className="w-4 h-4 text-purple-400" />, count: stats?.totalInPreparation },
    { id: 5, label: '5. Ready for Delivery', icon: <Truck className="w-4 h-4 text-cyan-400" />, count: stats?.totalReadyForDispatch },
    { id: 6, label: '6. Completed Orders', icon: <Archive className="w-4 h-4 text-emerald-400" />, count: stats?.totalCompleted },
    { id: 7, label: '7. Rejected Orders', icon: <XCircle className="w-4 h-4 text-rose-400" />, count: stats?.totalRejected },
    { id: 8, label: '8. Cancelled Orders', icon: <Ban className="w-4 h-4 text-stone-400" />, count: stats?.totalCancelled },
    { id: 9, label: '9. Custom Cake Requests', icon: <Sparkles className="w-4 h-4 text-amber-400" />, badge: customRequestsCount },
    { id: 10, label: '10. Products & Menu Management', icon: <Cake className="w-4 h-4" /> },
    { id: 11, label: '11. Customer Database', icon: <Users className="w-4 h-4" /> },
    { id: 12, label: '12. Notifications', icon: <Bell className="w-4 h-4" />, badge: unreadNotifCount },
    { id: 13, label: '13. Business Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchBadges();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      
      {/* If first-time login security policy is triggered */}
      {mustChangePassword && <OwnerFirstTimePasswordModal />}

      {/* Top Banner Alert (Real-time Socket.IO Toast) */}
      {latestAlert && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 flex items-center justify-between text-xs font-semibold shadow-lg animate-slide-down">
          <div className="flex items-center gap-2">
            <span className="text-base">🔔</span>
            <span className="font-bold">{latestAlert.title}</span>
            <span>— {latestAlert.message}</span>
          </div>
          <button
            onClick={clearLatestAlert}
            className="px-2.5 py-1 rounded bg-black/20 hover:bg-black/30 text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Owner Top Header */}
      <header className="bg-stone-900 border-b border-stone-800 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-extrabold shadow-sm">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-white">
                Sri Balaji <span className="text-amber-400">Owner Portal</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                RAKESH (Owner)
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              SangaReddy Road, Narsapur • 9963390327
            </p>
          </div>
        </div>

        {/* Right header controls */}
        <div className="flex items-center gap-3">
          
          {/* Socket Connection Status */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono ${
              isConnected
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}
            title={isConnected ? 'Real-time WebSocket Live' : 'Reconnecting WebSocket'}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span>{isConnected ? 'Real-time Live' : 'Polling Sync'}</span>
          </div>

          {/* Sound Alert Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playChime();
            }}
            className={`p-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-stone-800 border-stone-700 text-amber-400'
                : 'bg-stone-800 border-stone-700 text-stone-500'
            }`}
            title={soundEnabled ? 'Order sound alert enabled' : 'Order sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={handleManualRefresh}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700"
            title="Refresh All Orders & Badges"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Read-only Storefront Preview / Switch back to Customer Portal */}
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs transition-colors"
            title="Inspect Customer Storefront without losing owner session"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-950" />
            <span>Switch to Storefront</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              onNavigate('owner-login');
            }}
            className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-colors"
            title="Logout of Owner Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Owner Portal Body: Left Sidebar + Right Content Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Navigation Sidebar (13 Sections) */}
        <aside className="w-full md:w-72 bg-stone-900/80 border-r border-stone-800 p-4 space-y-1 shrink-0 overflow-y-auto max-h-screen">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 px-3 py-2">
            Owner Navigation (13 Sections)
          </div>

          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>

                {/* Badge alert or count */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-stone-950 text-amber-400' : 'bg-amber-600 text-white animate-pulse'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-stone-950 text-white' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 p-4 sm:p-8 bg-stone-950 overflow-y-auto">
          {activeSection === 1 && (
            <OverviewSection onSelectSection={(id) => setActiveSection(id)} />
          )}

          {activeSection === 2 && (
            <OrderWorkflowSection statusFilter="new" title="2. New / Incoming Orders" onStatusChange={fetchBadges} />
          )}

          {activeSection === 3 && (
            <OrderWorkflowSection statusFilter="accepted" title="3. Accepted Orders" onStatusChange={fetchBadges} />
          )}

          {activeSection === 4 && (
            <OrderWorkflowSection statusFilter="in_preparation" title="4. Preparation / Before Delivery" onStatusChange={fetchBadges} />
          )}

          {activeSection === 5 && (
            <OrderWorkflowSection statusFilter="ready_for_dispatch" title="5. Ready for Delivery" onStatusChange={fetchBadges} />
          )}

          {activeSection === 6 && (
            <OrderWorkflowSection statusFilter="completed" title="6. Completed Orders" onStatusChange={fetchBadges} />
          )}

          {activeSection === 7 && (
            <OrderWorkflowSection statusFilter="rejected" title="7. Rejected Orders" onStatusChange={fetchBadges} />
          )}

          {activeSection === 8 && (
            <OrderWorkflowSection statusFilter="cancelled" title="8. Cancelled Orders" onStatusChange={fetchBadges} />
          )}

          {activeSection === 9 && (
            <CustomCakeRequestsSection onStatusChange={fetchBadges} />
          )}

          {activeSection === 10 && (
            <ProductManagementSection />
          )}

          {activeSection === 11 && (
            <CustomerDatabaseSection />
          )}

          {activeSection === 12 && (
            <NotificationsSection onRead={fetchBadges} />
          )}

          {activeSection === 13 && (
            <BusinessSettingsSection />
          )}
        </main>

      </div>
    </div>
  );
}
