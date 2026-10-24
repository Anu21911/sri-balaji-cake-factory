import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Instagram, MapPin, Clock, Heart, Shield, FileText, Truck, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import PolicyModals from './PolicyModals';

export default function Footer({ onNavigate }) {
  const [settings, setSettings] = useState({
    businessName: 'Sri Balaji Cake Factory',
    address: 'SangaReddy Road, Narsapur',
    phone: '9963390327',
    whatsapp: '919963390327',
    instagram: '_rakhi_0206',
    googleMapsQuery: 'https://www.google.com/maps/search/?api=1&query=SangaReddy%20Road%2C%20Narsapur%2C%20Telangana%2C%20India',
    businessHours: {
      weekdays: '9:00 AM - 10:00 PM',
      weekends: '9:00 AM - 10:30 PM'
    }
  });

  const [activePolicy, setActivePolicy] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.getSettings();
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
      } catch (e) {
        // use fallback defaults
      }
    }
    loadSettings();
  }, []);

  return (
    <>
      <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t-4 border-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            
            {/* Column 1: Brand & Loving Philosophy */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎂</span>
                <span className="font-display font-bold text-2xl text-white tracking-tight">
                  Sri Balaji <span className="text-amber-400">Cake Factory</span>
                </span>
              </div>
              <p className="text-sm text-stone-400 leading-relaxed">
                Handcrafting genuine celebration cakes with premium ingredients. Every cake is baked with love and delivered with care across Narsapur.
              </p>
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-stone-800 text-amber-300 border border-amber-500/20">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  Only Regular Cakes • No Eggless Cakes
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-white text-lg tracking-wide border-b border-stone-800 pb-2">
                Quick Navigation
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => onNavigate('menu')} className="hover:text-amber-400 transition-colors">
                    🎂 5 Signature Flavours
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('celebrations')} className="hover:text-amber-400 transition-colors">
                    🎉 Celebration Items (Sparkles, Snow Spray, Paper Shots)
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('custom-idea')} className="hover:text-amber-400 transition-colors font-medium text-amber-300">
                    ✨ Have Your Own Cake Idea?
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('my-orders')} className="hover:text-amber-400 transition-colors">
                    📦 Track Orders & History
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('owner-login')} className="hover:text-amber-400 transition-colors text-xs text-stone-500">
                    🔒 Dedicated Owner Portal
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact & Real Verified Links */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-white text-lg tracking-wide border-b border-stone-800 pb-2">
                Connect With Us
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href={`tel:${settings.phone || '9963390327'}`}
                    className="flex items-center gap-3 text-stone-300 hover:text-amber-400 group transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-stone-900 transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 block">Click to Call</span>
                      <span className="font-bold">{settings.phone || '9963390327'}</span>
                    </div>
                  </a>
                </li>

                <li>
                  <a
                    href={`https://wa.me/${settings.whatsapp || '919963390327'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-stone-300 hover:text-green-400 group transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-stone-900 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 block">WhatsApp Chat</span>
                      <span className="font-bold">Chat with RAKESH</span>
                    </div>
                  </a>
                </li>

                <li>
                  <a
                    href={`https://www.instagram.com/${settings.instagram || '_rakhi_0206'}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-stone-300 hover:text-pink-400 group transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 block">Instagram</span>
                      <span className="font-bold">@{settings.instagram || '_rakhi_0206'}</span>
                    </div>
                  </a>
                </li>

                <li>
                  <a
                    href={settings.googleMapsQuery || 'https://www.google.com/maps/search/?api=1&query=SangaReddy%20Road%2C%20Narsapur%2C%20Telangana%2C%20India'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-stone-300 hover:text-amber-400 group transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-stone-900 transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 block">Google Maps Directions</span>
                      <span className="font-semibold text-xs leading-tight block">{settings.address || 'SangaReddy Road, Narsapur'}</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Hours & Delivery Policies */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-white text-lg tracking-wide border-b border-stone-800 pb-2">
                Bakery Hours & Rates
              </h3>
              <div className="space-y-2 text-xs text-stone-400">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Mon – Fri:</p>
                    <p>{settings.businessHours?.weekdays || '9:00 AM - 10:00 PM'}</p>
                    <p className="font-semibold text-white mt-1">Sat – Sun:</p>
                    <p>{settings.businessHours?.weekends || '9:00 AM - 10:30 PM'}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-800 flex items-start gap-2">
                  <Truck className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Transparent Delivery:</span>
                    <span>₹4 per km calculated from bakery in Narsapur.</span>
                  </div>
                </div>
              </div>

              {/* Policy Buttons */}
              <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                <button
                  onClick={() => setActivePolicy('privacy')}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => setActivePolicy('delivery')}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  Delivery Policy
                </button>
                <button
                  onClick={() => setActivePolicy('cancellation')}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  Cancellation & Refund
                </button>
                <button
                  onClick={() => setActivePolicy('terms')}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  Terms & Conditions
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Sri Balaji Cake Factory. All rights reserved.</p>
            <p className="italic text-stone-400">
              "Because your happiness matters to us more than anything."
            </p>
            <div className="flex items-center gap-3">
              <span className="text-stone-400">Owner: RAKESH</span>
              <span>•</span>
              <a href="tel:9963390327" className="text-amber-400 hover:underline">9963390327</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy Modals */}
      {activePolicy && (
        <PolicyModals policyType={activePolicy} onClose={() => setActivePolicy(null)} />
      )}
    </>
  );
}
