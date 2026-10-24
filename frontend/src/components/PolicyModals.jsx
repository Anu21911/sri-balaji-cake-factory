import React from 'react';
import { X, ShieldCheck, Truck, RefreshCw, FileText } from 'lucide-react';

export default function PolicyModals({ policyType, onClose }) {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
      body: (
        <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
          <p>
            At <strong>Sri Balaji Cake Factory</strong> (located at SangaReddy Road, Narsapur), customer privacy and trust are paramount to us.
          </p>
          <h4 className="font-bold text-stone-800">Information We Collect</h4>
          <p>
            When you register an account or place an order, we collect your name, 10-digit mobile number, delivery address, and any specific cake messages or celebration preferences.
          </p>
          <h4 className="font-bold text-stone-800">How We Use Your Data</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>To prepare your handcrafted regular cake to your precise weight and flavour selections.</li>
            <li>To coordinate accurate, timely delivery across Narsapur.</li>
            <li>To send order status updates via SMS, WhatsApp, or phone call.</li>
          </ul>
          <p>
            We never sell, rent, or trade customer information with third parties. All authentication credentials are encrypted using industry-standard hashing algorithms.
          </p>
        </div>
      )
    },
    delivery: {
      title: 'Delivery Policy',
      icon: <Truck className="w-6 h-6 text-amber-600" />,
      body: (
        <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
          <p>
            We strive to make every celebration special by delivering freshly baked cakes right on schedule.
          </p>
          <h4 className="font-bold text-stone-800">Delivery Charges</h4>
          <p>
            Our delivery fee is calculated at a transparent rate of <strong>₹4 per kilometre</strong> from our bakery located at SangaReddy Road, Narsapur.
          </p>
          <h4 className="font-bold text-stone-800">Delivery Slots & Handling</h4>
          <p>
            You can select your preferred delivery time slot during checkout. Cakes are packed in sturdy, temperature-protected bakery boxes to preserve shape, decoration, and freshness during transit.
          </p>
        </div>
      )
    },
    cancellation: {
      title: 'Cancellation & Refund Policy',
      icon: <RefreshCw className="w-6 h-6 text-amber-600" />,
      body: (
        <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
          <p>
            We understand that celebration plans can change unexpectedly.
          </p>
          <h4 className="font-bold text-stone-800">Order Cancellation</h4>
          <p>
            Orders can be cancelled free of charge while in the <strong>"New"</strong> status. Once our bakers begin preparation (status: "Accepted" or "In Preparation"), cancellations cannot be processed because fresh custom ingredients and baking are already in progress.
          </p>
          <h4 className="font-bold text-stone-800">Refunds</h4>
          <p>
            If a prepaid order is rejected by the bakery or cancelled before preparation, a full refund is initiated to the original payment source within 3 to 5 business days through our verified payment gateway workflow.
          </p>
        </div>
      )
    },
    terms: {
      title: 'Terms & Conditions',
      icon: <FileText className="w-6 h-6 text-amber-600" />,
      body: (
        <div className="space-y-4 text-sm text-stone-600 leading-relaxed">
          <p>
            Welcome to Sri Balaji Cake Factory. By browsing our menu or placing an order, you agree to the following terms:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Regular Cakes Only:</strong> Sri Balaji Cake Factory specializes exclusively in freshly baked regular cakes. Eggless cakes are not offered.</li>
            <li><strong>Handcrafted Nature:</strong> All cakes are artisanal, freshly decorated by our pastry chefs. Slight visual variations in piping or fruit placement may occur.</li>
            <li><strong>Celebration Products:</strong> Aerosols (such as Snow Spray) and Paper Shots must be handled strictly according to printed safe-use guidelines and away from open candle flames.</li>
            <li><strong>Custom Cake Ideas:</strong> Final feasibility and pricing for custom cake uploads are confirmed by owner RAKESH prior to order confirmation.</li>
          </ul>
        </div>
      )
    }
  };

  const active = content[policyType] || content.terms;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-amber-100 max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-stone-100 pb-4">
          <div className="p-2.5 rounded-2xl bg-amber-50">
            {active.icon}
          </div>
          <h3 className="font-display font-bold text-xl text-stone-900">
            {active.title}
          </h3>
        </div>

        {active.body}

        <div className="mt-8 pt-4 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-stone-900 hover:bg-black text-white shadow-sm transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
