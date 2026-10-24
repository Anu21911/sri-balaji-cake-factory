import React from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useOwnerAuth } from '../context/OwnerAuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, ShieldCheck, Sparkles, Cake, Package, LogOut, Phone } from 'lucide-react';

export default function Navbar({
  activePortal, // 'customer' or 'owner'
  onSwitchPortal,
  onOpenCustomerAuth,
  onOpenMyOrders
}) {
  const { customer, isAuthenticated: isCustomerLoggedIn, logout: customerLogout } = useCustomerAuth();
  const { owner, isAuthenticated: isOwnerLoggedIn } = useOwnerAuth();
  const { totalItemCount, setIsDrawerOpen } = useCart();

  const scrollToSection = (id) => {
    if (activePortal !== 'customer') {
      onSwitchPortal('customer');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      
      {/* Top Portals Switcher Ribbon */}
      <div className="bg-stone-900 text-stone-300 px-4 py-1.5 text-xs border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
              Sri Balaji Cake Factory Portals:
            </span>
            <div className="inline-flex rounded-lg bg-stone-800 p-0.5 border border-stone-700">
              <button
                onClick={() => onSwitchPortal('customer')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  activePortal === 'customer'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                🎂 1. Customer Portal
              </button>
              <button
                onClick={() => onSwitchPortal('owner')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  activePortal === 'owner'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                👑 2. Owner Portal {isOwnerLoggedIn && '(Active)'}
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-stone-400">
            <span>📍 SangaReddy Road, Narsapur</span>
            <span>•</span>
            <a href="tel:9963390327" className="text-amber-400 hover:underline">📞 9963390327</a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <button
            onClick={() => {
              onSwitchPortal('customer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-bold text-xl sm:text-2xl text-stone-900 tracking-tight block">
                Sri Balaji <span className="text-amber-600">Cake Factory</span>
              </span>
              <span className="text-[10px] font-semibold text-stone-500 tracking-wide uppercase block -mt-1">
                SangaReddy Road, Narsapur
              </span>
            </div>
          </button>

          {/* Customer Quick Links */}
          {activePortal === 'customer' && (
            <nav className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => scrollToSection('cakes-menu-section')}
                className="text-xs font-bold text-stone-700 hover:text-amber-600 transition-colors"
              >
                🎂 5 Cake Flavours
              </button>
              <button
                onClick={() => scrollToSection('celebrations-section')}
                className="text-xs font-bold text-stone-700 hover:text-amber-600 transition-colors"
              >
                🎉 Celebration Items
              </button>
              <button
                onClick={() => scrollToSection('custom-idea-section')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Have Your Own Cake Idea?</span>
              </button>
            </nav>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            
            {/* View Cart Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2.5 rounded-xl text-stone-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Open Celebration Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* My Orders Button */}
            {isCustomerLoggedIn && (
              <button
                onClick={onOpenMyOrders}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <Package className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">My Orders</span>
              </button>
            )}

            {/* Customer Mobile Number Only */}
            {isCustomerLoggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenMyOrders}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
                  title="View My Orders"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-mono">+91 {customer.mobile}</span>
                </button>
                <button
                  onClick={customerLogout}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100"
                  title="Logout Customer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenCustomerAuth}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-all border border-stone-200"
              >
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Customer Login</span>
              </button>
            )}

            {/* Owner Portal Dedicated Button */}
            <button
              onClick={() => onSwitchPortal('owner')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                activePortal === 'owner'
                  ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400'
                  : 'bg-stone-900 text-amber-400 hover:bg-black border border-stone-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{isOwnerLoggedIn ? 'Owner Workstation' : 'Owner Portal'}</span>
              <span className="sm:hidden">Owner</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
