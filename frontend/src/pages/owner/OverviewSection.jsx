import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  TrendingUp,
  ShoppingBag,
  BellRing,
  CheckCircle,
  ChefHat,
  Truck,
  Archive,
  XCircle,
  Ban,
  AlertTriangle,
  ArrowRight,
  IndianRupee
} from 'lucide-react';

export default function OverviewSection({ onSelectSection }) {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setLowStock(res.lowStockProducts || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-stone-400 text-xs py-12 text-center">Loading dashboard overview...</div>;
  }

  const statCards = [
    {
      title: "Today's Orders",
      value: stats?.todayCount || 0,
      sub: `Revenue: ₹${stats?.todayRevenue || 0}`,
      icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
      actionId: 2,
      border: 'border-amber-500/30'
    },
    {
      title: "1. Incoming / New Orders",
      value: stats?.totalIncoming || 0,
      sub: 'Awaiting Owner Decision',
      icon: <BellRing className="w-5 h-5 text-amber-400" />,
      actionId: 2,
      border: 'border-amber-500/50',
      highlight: stats?.totalIncoming > 0
    },
    {
      title: "2. Accepted Orders",
      value: stats?.totalAccepted || 0,
      sub: 'Approved by RAKESH',
      icon: <CheckCircle className="w-5 h-5 text-blue-400" />,
      actionId: 3,
      border: 'border-blue-500/30'
    },
    {
      title: "3. In Preparation",
      value: stats?.totalInPreparation || 0,
      sub: 'In Bakery Kitchen',
      icon: <ChefHat className="w-5 h-5 text-purple-400" />,
      actionId: 4,
      border: 'border-purple-500/30'
    },
    {
      title: "4. Ready / Dispatch",
      value: stats?.totalReadyForDispatch || 0,
      sub: 'Packaged / Out for Delivery',
      icon: <Truck className="w-5 h-5 text-cyan-400" />,
      actionId: 5,
      border: 'border-cyan-500/30'
    },
    {
      title: "5. Completed Orders",
      value: stats?.totalCompleted || 0,
      sub: `Lifetime Sales: ₹${stats?.totalRevenue || 0}`,
      icon: <Archive className="w-5 h-5 text-emerald-400" />,
      actionId: 6,
      border: 'border-emerald-500/30'
    },
    {
      title: "6. Rejected Orders",
      value: stats?.totalRejected || 0,
      sub: 'With Recorded Reason',
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
      actionId: 7,
      border: 'border-rose-500/30'
    },
    {
      title: "7. Cancelled Orders",
      value: stats?.totalCancelled || 0,
      sub: 'Cancelled by Customer',
      icon: <Ban className="w-5 h-5 text-stone-400" />,
      actionId: 8,
      border: 'border-stone-700'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            1. Dashboard Overview
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Real-time bakery performance, operational pipeline, sales summaries & inventory alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-stone-900 border border-stone-800 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs">
            <IndianRupee className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-stone-400 block text-[10px]">Total Revenue</span>
              <span className="font-bold text-emerald-400">₹{stats?.totalRevenue || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => onSelectSection(card.actionId)}
            className={`p-5 rounded-3xl bg-stone-900 border ${card.border} hover:border-amber-400/80 transition-all cursor-pointer shadow-md space-y-3 group ${
              card.highlight ? 'ring-2 ring-amber-500/50 bg-stone-900/90' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-400 truncate">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-stone-800 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="font-display font-extrabold text-3xl text-white">
                {card.value}
              </span>
              <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            <p className="text-[11px] text-stone-500 border-t border-stone-800 pt-2 truncate">
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Low Stock Product Alerts */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-xl text-white">
              Inventory & Stock Status
            </h2>
          </div>
          <button
            onClick={() => onSelectSection(10)}
            className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Manage Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {lowStock.length === 0 ? (
          <p className="text-xs text-stone-400 py-2">
            ✅ All cake ingredients and celebration products are well-stocked.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {lowStock.map((prod) => (
              <div
                key={prod._id || prod.id}
                className="p-3.5 rounded-2xl bg-stone-950 border border-amber-500/20 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{prod.name}</span>
                  <span className="text-[11px] text-stone-400">Current Stock:</span>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-amber-950 text-amber-400 font-bold border border-amber-800">
                  {prod.stock} units
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => onSelectSection(2)}
          className="p-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-between transition-colors shadow-md"
        >
          <span>Review Incoming Orders</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectSection(9)}
          className="p-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex items-center justify-between border border-stone-700 transition-colors"
        >
          <span>Review Custom Cake Ideas</span>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </button>

        <button
          onClick={() => onSelectSection(11)}
          className="p-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex items-center justify-between border border-stone-700 transition-colors"
        >
          <span>Inspect Customer Database</span>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </button>
      </div>

    </div>
  );
}
