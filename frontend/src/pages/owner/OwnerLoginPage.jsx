import React, { useState } from 'react';
import { useOwnerAuth } from '../../context/OwnerAuthContext';
import { ShieldCheck, Lock, Phone, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function OwnerLoginPage({ onNavigate }) {
  const { login } = useOwnerAuth();

  const [mobile, setMobile] = useState('9963390327');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(mobile, password);
      onNavigate('owner-dashboard');
    } catch (err) {
      setError(err.message || 'Owner authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 px-4 py-16 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-amber-400 block">
            Dedicated Administrative Access
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Owner Portal Login
          </h1>
          <p className="text-xs text-stone-400">
            Sri Balaji Cake Factory • RAKESH (Owner)
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1.5">
              Owner Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="9963390327"
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-stone-800/80 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1.5">
              Owner Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (Initial: R@khi1234)"
                className="w-full text-xs pl-10 pr-10 py-3 rounded-xl bg-stone-800/80 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {loading ? (
              <span>Authenticating Owner...</span>
            ) : (
              <>
                <span>Sign In to Owner Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Info Card */}
        <div className="p-3.5 rounded-2xl bg-stone-800/50 border border-stone-800 text-[11px] text-stone-400 space-y-2">
          <div className="font-semibold text-stone-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Setup & Credentials</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobile('9963390327');
                setPassword('R@khi1234');
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] transition-colors"
            >
              Fill Setup Credentials
            </button>
          </div>
          <p>
            Owner account configured for <strong>RAKESH</strong> (9963390327). Initial password: <code className="text-amber-300 font-mono">R@khi1234</code>.
          </p>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-xs text-stone-500 hover:text-stone-300 font-medium"
          >
            ← Return to Customer Storefront
          </button>
        </div>

      </div>
    </div>
  );
}
