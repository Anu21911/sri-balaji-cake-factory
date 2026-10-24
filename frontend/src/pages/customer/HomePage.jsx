import React, { useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { api } from '../../services/api';
import CakeCard from '../../components/CakeCard';
import CelebrationCard from '../../components/CelebrationCard';
import LocationPicker from '../../components/LocationPicker';
import { Heart, Sparkles, Upload, Clock, MapPin, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function HomePage({ products, onNavigate, onOpenAuth }) {
  const { customer, isAuthenticated } = useCustomerAuth();

  // Custom Idea Form State (Section F)
  const [selectedLocation, setSelectedLocation] = useState('Narsapur Town / Market Area');
  const [distanceKm, setDistanceKm] = useState(2);
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

  const cakes = products.filter(p => p.category === 'cake');
  const celebrations = products.filter(p => p.category === 'celebration');

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
      if (onOpenAuth) {
        onOpenAuth();
      } else {
        onNavigate('customer-auth');
      }
      return;
    }

    if (!referenceFile) {
      setIdeaError('Please select a reference picture for your cake idea.');
      return;
    }

    if (!selectedLocation) {
      setIdeaError('Please select your delivery locality/location before submitting your cake idea.');
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
      formData.append('deliveryAddress', `${selectedLocation} - ${ideaForm.deliveryAddress || ''}`);
      formData.append('customerName', `Customer ${customer?.mobile || ideaForm.mobile}`);
      formData.append('mobile', customer?.mobile || ideaForm.mobile);
      formData.append('additionalInstructions', ideaForm.additionalInstructions);

      const res = await api.submitCustomCake(formData);
      if (res.success) {
        setIdeaSuccess(true);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      setIdeaError(err.message || 'Failed to submit custom cake idea. Please try again.');
    } finally {
      setSubmittingIdea(false);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* HERO SECTION — SECTION L SPECIFICATION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/60 via-amber-50/40 to-bakery-50 pt-16 pb-24 border-b border-amber-100/80">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Brand Message & Quotes */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-amber-300/80 text-amber-800 text-xs font-bold tracking-wide shadow-sm">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                <span>Sri Balaji Cake Factory • SangaReddy Road, Narsapur</span>
              </div>

              {/* Exact Prominent Hero Quote (Section L) */}
              <div className="space-y-3">
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-stone-900 leading-tight">
                  “Made with <span className="text-amber-600 italic">Love</span>, <br className="hidden sm:inline" />
                  Delivered with <span className="text-amber-600">Care</span>.”
                </h1>
                <p className="font-display italic text-xl sm:text-2xl text-stone-600 font-medium">
                  “Because your happiness matters to us more than anything.”
                </p>
              </div>

              <p className="text-base text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Enjoy freshly baked regular celebration cakes across 5 authentic flavours with transparent weight-based pricing and fast local delivery across Narsapur.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('menu')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2.5 transition-all group"
                >
                  <span>Explore Cake Flavours</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#custom-idea-section"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-base bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Have Your Own Cake Idea?</span>
                </a>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-stone-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Regular Cakes Only</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>₹4/km Fast Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Fresh Handcrafted</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-amber-300 rounded-full filter blur-2xl opacity-40 animate-pulse" />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-rose-300 rounded-full filter blur-2xl opacity-40" />

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-100">
                  <img
                    src="/images/products/pineapple-cake.jpg"
                    alt="Sri Balaji Signature Cake"
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-amber-400 text-xs font-extrabold tracking-widest uppercase">
                      Signature Handcrafted Cake
                    </span>
                    <h3 className="font-display font-bold text-2xl">
                      Pineapple & Butterscotch Cakes
                    </h3>
                    <p className="text-xs text-stone-200 mt-1">
                      Starting at ₹280 for 1 kg • ₹560 for 2 kg • ₹840 for 3 kg
                    </p>
                  </div>
                </div>

                {/* Floating pill */}
                <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-amber-100 flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <span className="text-[11px] text-stone-400 font-semibold block">Narsapur Express</span>
                    <span className="text-xs font-bold text-stone-900">₹4 per Kilometre</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION C — EXACT 5 CAKE FLAVOURS MENU */}
      <section id="cakes-menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Exact Menu & Live Weight Pricing</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900">
            Our 5 Handcrafted Cake Flavours
          </h2>
          <p className="text-sm text-stone-500">
            Select your preferred weight (1 kg, 2 kg, or 3 kg) to see the exact price. Only regular fresh bakery cakes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cakes.map((cake) => (
            <CakeCard key={cake._id || cake.id} product={cake} />
          ))}
        </div>
      </section>

      {/* SECTION F — DEDICATED "HAVE YOUR OWN CAKE IDEA?" SECTION */}
      <section id="custom-idea-section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="relative z-10 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold tracking-wide uppercase">
                Custom Celebration Orders
              </span>
              
              {/* Exact Section F Heading & Message */}
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
                Have Your Own Cake Idea?
              </h2>
              <p className="text-amber-100 text-base sm:text-lg leading-relaxed">
                “Share your dream cake with us. Upload a reference picture, describe your idea, and let us help make your celebration special.”
              </p>
            </div>

            {ideaSuccess ? (
              <div className="bg-white rounded-3xl p-8 text-stone-900 text-center max-w-md mx-auto space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-display font-bold text-2xl text-stone-900">
                  Idea Submitted Successfully!
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Your reference photo has been sent to our shop owner <strong>RAKESH</strong>. You will receive a personalized price quote in your Customer Portal.
                </p>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
                  Current Status: <span className="text-amber-600 font-bold">Price awaiting owner confirmation</span>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => onNavigate('my-custom-requests')}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-stone-900 text-white hover:bg-black"
                  >
                    View My Custom Cake Requests
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
              <form onSubmit={handleCustomIdeaSubmit} className="bg-white rounded-3xl p-6 sm:p-10 text-stone-800 shadow-xl space-y-6">
                
                {ideaError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{ideaError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Photo Upload */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-2">
                      Upload Reference Picture *
                    </label>
                    <div className="border-2 border-dashed border-amber-200 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-amber-50/30">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        id="reference-upload"
                      />
                      <label htmlFor="reference-upload" className="cursor-pointer block">
                        {previewUrl ? (
                          <div className="space-y-3">
                            <img
                              src={previewUrl}
                              alt="Reference Preview"
                              className="w-36 h-36 object-cover rounded-2xl mx-auto shadow-md"
                            />
                            <p className="text-xs font-semibold text-amber-700">
                              Click to replace reference photo ({referenceFile?.name})
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 py-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                              <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-stone-800">
                              Click to upload your cake photo
                            </p>
                            <p className="text-xs text-stone-400">
                              Supports JPG, PNG, WEBP (Max 5MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Cake Theme */}
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">
                      Cake Name / Celebration Theme *
                    </label>
                    <input
                      type="text"
                      required
                      value={ideaForm.cakeName}
                      onChange={(e) => setIdeaForm({ ...ideaForm, cakeName: e.target.value })}
                      placeholder="e.g. 1st Birthday Prince Castle, Wedding Anniversary"
                      className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Flavour Choice (From the 5 available flavours) */}
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">
                      Preferred Flavour *
                    </label>
                    <select
                      value={ideaForm.flavour}
                      onChange={(e) => setIdeaForm({ ...ideaForm, flavour: e.target.value })}
                      className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option value="Pineapple">Pineapple (Regular Cake)</option>
                      <option value="Butterscotch">Butterscotch (Regular Cake)</option>
                      <option value="Chocolate">Chocolate (Regular Cake)</option>
                      <option value="Vanilla">Vanilla (Regular Cake)</option>
                      <option value="Rasmalai">Rasmalai (Regular Cake)</option>
                    </select>
                  </div>

                  {/* Weight (1 kg, 2 kg, 3 kg) */}
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

                  {/* Delivery Date */}
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

                  {/* Time Slot */}
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">
                      Preferred Time Slot *
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

                  {/* Cake Message */}
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">
                      Message on Cake
                    </label>
                    <input
                      type="text"
                      value={ideaForm.cakeMessage}
                      onChange={(e) => setIdeaForm({ ...ideaForm, cakeMessage: e.target.value })}
                      placeholder="e.g. Happy 1st Birthday Aarav"
                      className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Mandatory Delivery Location Picker */}
                  <div className="md:col-span-2">
                    <LocationPicker
                      selectedLocation={selectedLocation}
                      onSelectLocation={setSelectedLocation}
                      distanceKm={distanceKm}
                      onDistanceChange={setDistanceKm}
                      required={true}
                    />
                  </div>

                  {/* Customer Mobile Number Only */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">
                      Customer Mobile Number *
                    </label>
                    {isAuthenticated ? (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/50">
                        <Phone className="w-4 h-4 text-amber-600" />
                        <span className="font-mono font-bold text-stone-900 text-xs">+91 {customer?.mobile}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200 ml-auto">
                          Verified Customer Account
                        </span>
                      </div>
                    ) : (
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={ideaForm.mobile}
                        onChange={(e) => setIdeaForm({ ...ideaForm, mobile: e.target.value.replace(/\D/g, '') })}
                        placeholder="Enter 10-digit mobile number"
                        className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">
                      Delivery Address (Narsapur / SangaReddy Road) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={ideaForm.deliveryAddress}
                      onChange={(e) => setIdeaForm({ ...ideaForm, deliveryAddress: e.target.value })}
                      placeholder="House / Flat No., Street, Landmark, Narsapur"
                      className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">
                      Describe Your Idea & Design Details *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={ideaForm.description}
                      onChange={(e) => setIdeaForm({ ...ideaForm, description: e.target.value })}
                      placeholder="Tell us about color themes, piping style, toppings, tier shape, or specific celebration details..."
                      className="w-full text-xs px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100">
                  <div className="text-xs text-stone-500">
                    <span className="font-bold text-amber-700 block">Note on Pricing:</span>
                    Price awaiting owner confirmation. You will review and confirm the quote before any payment.
                  </div>

                  <button
                    type="submit"
                    disabled={submittingIdea}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {submittingIdea ? (
                      <span>Uploading Idea...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit Cake Idea for Owner Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </section>

      {/* SECTION D — CELEBRATION PRODUCTS */}
      <section id="celebrations-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Complete Party Add-ons</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900">
            Celebration Accessories & Party Items
          </h2>
          <p className="text-sm text-stone-500">
            Order these festive essentials alongside your cake or independently.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {celebrations.map((item) => (
            <CelebrationCard key={item._id || item.id} product={item} />
          ))}
        </div>
      </section>

      {/* WHY SRI BALAJI CAKE FACTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-amber-50/80 border border-amber-200/80 p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto sm:mx-0 shadow-md">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-stone-900">
                100% Regular Cakes
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                We bake genuine, premium regular cakes with fine bakery sponge and rich cream. No eggless shortcuts or substitutes.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto sm:mx-0 shadow-md">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-stone-900">
                Always Freshly Baked
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every cake is handcrafted on the day of delivery to ensure optimal fluffiness, aroma, and celebration joy.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto sm:mx-0 shadow-md">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-stone-900">
                ₹4/km Transparent Delivery
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Directly from our bakery on SangaReddy Road across Narsapur. Calculated accurately with no hidden markups.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
