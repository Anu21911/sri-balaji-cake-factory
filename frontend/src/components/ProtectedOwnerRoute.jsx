import React from 'react';
import { useOwnerAuth } from '../context/OwnerAuthContext';

export default function ProtectedOwnerRoute({ children, onNavigate }) {
  const { isAuthenticated, loading } = useOwnerAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 text-amber-400">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono tracking-wider">VERIFYING OWNER CREDENTIALS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4">
        <div className="max-w-md w-full bg-stone-900 border border-amber-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="text-4xl">🛡️</div>
          <h2 className="font-display font-bold text-2xl text-amber-400">
            Owner Portal Access Restricted
          </h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            Strict Security Enforcement: This portal is exclusively accessible to the authenticated owner of Sri Balaji Cake Factory.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('owner-login')}
              className="w-full py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md transition-colors"
            >
              Sign In to Owner Portal
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-stone-500 hover:text-stone-300"
            >
              Return to Public Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
