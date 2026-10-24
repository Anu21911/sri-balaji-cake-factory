import React, { useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { api } from '../../services/api';
import { Sparkles, Upload, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CustomIdeaPage({ onNavigate }) {
  const { customer, isAuthenticated } = useCustomerAuth();

  const [ideaForm, setIdeaForm] = useState({
    cakeName: '',
    description: '',
    flavour: 'Pineapple',
    weight: '1 kg',
    cakeMessage: '',
    deliveryDate: '',
    timeSlot: '10:00 AM - 1:00 PM',
    deliveryAddress: customer?.addresses?.[0]?.street || '',
    customerName: customer?.name || '',
    mobile: customer?.mobile || '',
    additionalInstructions: ''
  });
  const [referenceFile, setReferenceFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submittingIdea, setSubmittingIdea] = useState(false);
  const [ideaSuccess, setIdeaSuccess] = useState(false);
  const [ideaError, setIdeaError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setIdeaError('Image size exceeds 5MB limit. Please upload a smaller image.');
        return;
      }
      setReferenceFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIdeaError('');
    }
  };

  const handleCustomIdeaSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onNavigate('customer-auth');
      return;
    }

    if (!referenceFile) {
      setIdeaError('Please select a reference picture for your cake design.');
      return;
    }

    setSubmittingIdea(true);
    setIdeaError('');

    try {
      const formData = new FormData();
      formData.append('referenceImage', referenceFile);
      formData.append('cakeName', ideaForm.cakeName);
      formData.append('description', ideaForm.description);
      formData.append('flavour', ideaForm.flavour);
      formData.append('weight', ideaForm.weight);
      formData.append('cakeMessage', ideaForm.cakeMessage);
      formData.append('deliveryDate', ideaForm.deliveryDate);
      formData.append('timeSlot', ideaForm.timeSlot);
      formData.append('deliveryAddress', ideaForm.deliveryAddress);
      formData.append('customerName', ideaForm.customerName || customer.name);
      formData.append('mobile', ideaForm.mobile || customer.mobile);
      formData.append('additionalInstructions', ideaForm.additionalInstructions);

      const res = await api.submitCustomCake(formData);
      if (res.success) {
        setIdeaSuccess(true);
        confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      setIdeaError(err.message || 'Failed to submit custom cake idea. Please try again.');
    } finally {
      setSubmittingIdea(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('home')}
          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Custom Cake Workshop</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900">
          Have Your Own Cake Idea?
        </h1>
        <p className="text-base text-stone-600 italic">
          “Share your dream cake with us. Upload a reference picture, describe your idea, and let us help make your celebration special.”
        </p>
      </div>

      {ideaSuccess ? (
        <div className="bg-white rounded-3xl p-10 text-stone-900 text-center max-w-md mx-auto space-y-4 shadow-xl border border-amber-100">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="font-display font-bold text-2xl text-stone-900">
            Design Received by Owner!
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Your reference photo and cake requirements have been securely delivered to owner <strong>RAKESH</strong>.
          </p>
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
            Current Status: <span className="text-amber-700 font-bold">Price awaiting owner confirmation</span>
          </div>
          <div className="pt-2 space-y-2">
            <button
              onClick={() => onNavigate('my-orders')}
              className="w-full py-3 rounded-xl font-bold text-xs bg-amber-600 text-white shadow-md hover:bg-amber-700"
            >
              View in My Custom Requests
            </button>
            <button
              onClick={() => {
                setIdeaSuccess(false);
                setReferenceFile(null);
                setPreviewUrl(null);
              }}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-stone-500 hover:text-stone-800"
            >
              Submit Another Design
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCustomIdeaSubmit} className="bg-white rounded-3xl p-6 sm:p-10 text-stone-800 shadow-xl border border-amber-100 space-y-6">
          {ideaError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{ideaError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                Upload Reference Photo *
              </label>
              <div className="border-2 border-dashed border-amber-200 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-amber-50/30">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="page-reference-upload"
                />
                <label htmlFor="page-reference-upload" className="cursor-pointer block">
                  {previewUrl ? (
                    <div className="space-y-3">
                      <img
                        src={previewUrl}
                        alt="Reference Preview"
                        className="w-40 h-40 object-cover rounded-2xl mx-auto shadow-md"
                      />
                      <p className="text-xs font-semibold text-amber-700">
                        Click to change photo ({referenceFile?.name})
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-stone-800">
                        Upload Reference Image
                      </p>
                      <p className="text-xs text-stone-400">
                        JPG, PNG, or WEBP (Max 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Cake Theme / Occasion *
              </label>
              <input
                type="text"
                required
                value={ideaForm.cakeName}
                onChange={(e) => setIdeaForm({ ...ideaForm, cakeName: e.target.value })}
                placeholder="e.g. Cartoon Theme, 25th Silver Jubilee"
                className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Preferred Flavour *
              </label>
              <select
                value={ideaForm.flavour}
                onChange={(e) => setIdeaForm({ ...ideaForm, flavour: e.target.value })}
                className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="Pineapple">Pineapple</option>
                <option value="Butterscotch">Butterscotch</option>
                <option value="Chocolate">Chocolate</option>
                <option value="Vanilla">Vanilla</option>
                <option value="Rasmalai">Rasmalai</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Weight Required *
              </label>
              <select
                value={ideaForm.weight}
                onChange={(e) => setIdeaForm({ ...ideaForm, weight: e.target.value })}
                className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="1 kg">1 kg</option>
                <option value="2 kg">2 kg</option>
                <option value="3 kg">3 kg</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Delivery Date *
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={ideaForm.deliveryDate}
                onChange={(e) => setIdeaForm({ ...ideaForm, deliveryDate: e.target.value })}
                className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Time Slot *
              </label>
              <select
                value={ideaForm.timeSlot}
                onChange={(e) => setIdeaForm({ ...ideaForm, timeSlot: e.target.value })}
                className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="10:00 AM - 1:00 PM">10:00 AM - 1:00 PM (Morning)</option>
                <option value="2:00 PM - 5:00 PM">2:00 PM - 5:00 PM (Afternoon)</option>
                <option value="6:00 PM - 9:00 PM">6:00 PM - 9:00 PM (Evening)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Message on Cake
              </label>
              <input
                type="text"
                value={ideaForm.cakeMessage}
                onChange={(e) => setIdeaForm({ ...ideaForm, cakeMessage: e.target.value })}
                placeholder="e.g. Happy Birthday Aarav"
                className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={ideaForm.customerName || customer?.name || ''}
                onChange={(e) => setIdeaForm({ ...ideaForm, customerName: e.target.value })}
                placeholder="Your Name"
                className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Mobile Number (10 Digits) *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={ideaForm.mobile || customer?.mobile || ''}
                onChange={(e) => setIdeaForm({ ...ideaForm, mobile: e.target.value })}
                placeholder="9963390327"
                className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Delivery Address (Narsapur) *
              </label>
              <textarea
                required
                rows={2}
                value={ideaForm.deliveryAddress}
                onChange={(e) => setIdeaForm({ ...ideaForm, deliveryAddress: e.target.value })}
                placeholder="Complete address in Narsapur / SangaReddy Road"
                className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-stone-700 block mb-1.5">
                Design & Decoration Description *
              </label>
              <textarea
                required
                rows={3}
                value={ideaForm.description}
                onChange={(e) => setIdeaForm({ ...ideaForm, description: e.target.value })}
                placeholder="Describe tier requirements, color palette, special toppers, icing finish..."
                className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-stone-500">
              * Price is set by owner after inspecting reference photo.
            </span>
            <button
              type="submit"
              disabled={submittingIdea}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all"
            >
              {submittingIdea ? 'Submitting Idea...' : 'Submit Idea for Price Quote'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
