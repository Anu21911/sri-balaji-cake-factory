import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Settings, Save, CheckCircle2, Phone, MessageCircle, Instagram, MapPin, Truck, Clock } from 'lucide-react';

export default function BusinessSettingsSection() {
  const [form, setForm] = useState({
    businessName: 'Sri Balaji Cake Factory',
    address: 'SangaReddy Road, Narsapur',
    phone: '9963390327',
    whatsapp: '919963393270',
    instagram: '_rakhi_0206',
    googleMapsQuery: 'https://www.google.com/maps/search/?api=1&query=SangaReddy%20Road%2C%20Narsapur%2C%20Telangana%2C%20India',
    deliveryFeePerKm: 4,
    businessHours: {
      weekdays: '9:00 AM - 10:00 PM',
      weekends: '9:00 AM - 10:30 PM'
    },
    policies: {
      privacy: '',
      delivery: '',
      cancellation: '',
      terms: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setForm(prev => ({
          ...prev,
          ...res.settings
        }));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await api.updateSettings(form);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update business settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-stone-400 text-xs py-16 text-center">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            <span>13. Business Settings & Verification Details</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage contact channels, delivery fee per km (₹4), operating hours, and customer policies.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 text-white shadow-xl">
        
        {/* Core Identity */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-amber-400 border-b border-stone-800 pb-2">
            Storefront Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-stone-400 block mb-1 font-semibold">
                Business Name
              </label>
              <input
                type="text"
                required
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1 font-semibold">
                Bakery Address
              </label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Channels (Section K) */}
        <div className="space-y-4 pt-4 border-t border-stone-800">
          <h3 className="font-bold text-sm text-amber-400 border-b border-stone-800 pb-2">
            Official Customer Contact Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-stone-400 block mb-1 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                Phone Number (Click-to-Call)
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9963390327"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1 font-semibold flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-green-400" />
                WhatsApp Number (wa.me link)
              </label>
              <input
                type="text"
                required
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="919963393270"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1 font-semibold flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                Instagram Username
              </label>
              <input
                type="text"
                required
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="_rakhi_0206"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Google Maps Search Link
              </label>
              <input
                type="text"
                required
                value={form.googleMapsQuery}
                onChange={(e) => setForm({ ...form, googleMapsQuery: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Delivery Rates & Operating Hours (Section M & K) */}
        <div className="space-y-4 pt-4 border-t border-stone-800">
          <h3 className="font-bold text-sm text-amber-400 border-b border-stone-800 pb-2">
            Delivery Calculation & Operating Hours
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-stone-400 block mb-1 font-semibold flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                Delivery Rate (₹ per KM)
              </label>
              <input
                type="number"
                required
                min="0"
                value={form.deliveryFeePerKm}
                onChange={(e) => setForm({ ...form, deliveryFeePerKm: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-amber-400 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Weekday Hours
              </label>
              <input
                type="text"
                value={form.businessHours?.weekdays || '9:00 AM - 10:00 PM'}
                onChange={(e) => setForm({
                  ...form,
                  businessHours: { ...form.businessHours, weekdays: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Weekend Hours
              </label>
              <input
                type="text"
                value={form.businessHours?.weekends || '9:00 AM - 10:30 PM'}
                onChange={(e) => setForm({
                  ...form,
                  businessHours: { ...form.businessHours, weekends: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-stone-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-2xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-stone-950 flex items-center gap-2 shadow-md transition-all disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
