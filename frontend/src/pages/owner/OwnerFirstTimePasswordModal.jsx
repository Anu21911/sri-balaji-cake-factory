import React, { useState } from 'react';
import { useOwnerAuth } from '../../context/OwnerAuthContext';
import { ShieldAlert, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function OwnerFirstTimePasswordModal() {
  const { changePassword, logout } = useOwnerAuth();

  const [currentPassword, setCurrentPassword] = useState('R@khi1234');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword === 'R@khi1234') {
      setError('New password cannot be identical to the temporary initial password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="max-w-md w-full bg-stone-900 border border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6 text-white relative">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-2xl text-amber-400">
            Mandatory Password Change
          </h2>
          <p className="text-xs text-stone-400">
            Security Policy: As the owner of Sri Balaji Cake Factory, you must change your initial temporary password before accessing the dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Current Temporary Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Initial password (R@khi1234)"
              className="w-full text-xs px-3.5 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              New Personal Password *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your strong new password"
              className="w-full text-xs px-3.5 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full text-xs px-3.5 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {loading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Password & Unlock Portal</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-stone-400 hover:text-stone-200"
            >
              Cancel & Logout
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
