import React, { useState } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { User, Phone, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, X } from 'lucide-react';

export default function CustomerAuthModal({ isOpen, onClose, onSuccess, onOpenOwnerLogin }) {
  const { login, register } = useCustomerAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [otpStep, setOtpStep] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedDemoOtp, setGeneratedDemoOtp] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.mobile, formData.password);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check mobile and password.');
    } finally {
      setLoading(false);
    }
  };

  const initiateSignup = (e) => {
    e.preventDefault();
    setError('');

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedDemoOtp(mockOtp);
    setOtpStep(true);
  };

  const completeSignupWithOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (enteredOtp !== generatedDemoOtp && enteredOtp !== '123456') {
      setError('Invalid verification OTP code.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        password: formData.password
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setOtpStep(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-100 relative space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
            <User className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl text-stone-900">
            {mode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
          </h2>
          <p className="text-xs text-stone-500">
            {mode === 'login'
              ? 'Access your saved addresses and track live cake orders'
              : 'Sign up with your mobile number to place celebration orders'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setOtpStep(false); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setOtpStep(false); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  placeholder="10-digit mobile number"
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl font-bold text-xs bg-stone-900 hover:bg-black text-white shadow-md transition-all disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Sign In to Account'}
            </button>

            {/* Subtle discreet Bakery Partner / Owner link */}
            <div className="pt-2 text-center border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOwnerLogin?.();
                }}
                className="text-[11px] text-stone-400 hover:text-amber-600 transition-colors"
              >
                Bakery Partner? <span className="font-semibold underline">Owner Login →</span>
              </button>
            </div>
          </form>
        ) : (
          /* SIGNUP FORM */
          !otpStep ? (
            <form onSubmit={initiateSignup} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit mobile number"
                    className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>Verify Mobile & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* OTP VERIFICATION STEP */
            <form onSubmit={completeSignupWithOtp} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1.5">
                <ShieldCheck className="w-7 h-7 text-amber-600 mx-auto" />
                <h4 className="font-bold text-xs text-stone-900">
                  Verify Mobile: +91 {formData.mobile}
                </h4>
                {generatedDemoOtp && (
                  <div className="p-2 rounded-xl bg-white border border-amber-300 text-xs font-mono font-bold text-amber-800">
                    OTP Code: <span className="text-sm tracking-widest text-amber-600">{generatedDemoOtp}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full text-center text-lg font-mono tracking-widest py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
              >
                {loading ? 'Creating Account...' : 'Confirm & Register'}
              </button>

              <button
                type="button"
                onClick={() => setOtpStep(false)}
                className="w-full text-xs text-stone-500 hover:text-stone-800"
              >
                ← Back
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
}
