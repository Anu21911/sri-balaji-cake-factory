import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { api } from '../../services/api';
import { Truck, MapPin, Calendar, Clock, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import LocationPicker from '../../components/LocationPicker';

export default function CheckoutPage({ onNavigate }) {
  const {
    items,
    cakeSubtotal,
    celebrationSubtotal,
    subtotal,
    selectedLocation,
    setSelectedLocation,
    deliveryDistanceKm,
    setDeliveryDistanceKm,
    deliveryFee,
    finalTotal,
    clearCart
  } = useCart();

  const { customer, isAuthenticated, saveAddress } = useCustomerAuth();

  const [deliveryDate, setDeliveryDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 1:00 PM');
  const [addressStreet, setAddressStreet] = useState(customer?.addresses?.[0]?.street || '');
  const [landmark, setLandmark] = useState(customer?.addresses?.[0]?.landmark || '');
  const [city, setCity] = useState('Narsapur');
  const [contactNumber, setContactNumber] = useState(customer?.mobile || '');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'ONLINE'

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderComplete, setOrderComplete] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-amber-100 shadow-xl text-center space-y-4">
        <div className="text-4xl">🔒</div>
        <h2 className="font-display font-bold text-2xl text-stone-900">
          Customer Login Required
        </h2>
        <p className="text-xs text-stone-600">
          Please log in or create a customer account before checking out so we can track and coordinate your delivery.
        </p>
        <button
          onClick={() => onNavigate('customer-auth')}
          className="w-full py-3.5 rounded-xl font-bold text-xs bg-amber-600 text-white shadow-md hover:bg-amber-700"
        >
          Sign In to Proceed
        </button>
      </div>
    );
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-amber-100 shadow-xl text-center space-y-4">
        <div className="text-4xl">🎂</div>
        <h2 className="font-display font-bold text-2xl text-stone-900">
          Your Cart is Empty
        </h2>
        <p className="text-xs text-stone-500">
          Add regular cakes or celebration items to proceed to checkout.
        </p>
        <button
          onClick={() => onNavigate('menu')}
          className="px-6 py-3 rounded-xl font-bold text-xs bg-amber-600 text-white shadow-md"
        >
          Browse Cake Menu
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      setError('Please select your delivery location before placing your order.');
      return;
    }
    if (!addressStreet || !contactNumber) {
      setError('Please provide delivery address and contact number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderPayload = {
        items: items.map(i => ({
          productId: i.productId,
          weight: i.weight,
          selectedVariant: i.selectedVariant,
          cakeMessage: i.cakeMessage,
          quantity: i.quantity
        })),
        deliveryDistanceKm,
        deliveryAddress: {
          street: `${selectedLocation} - ${addressStreet.trim()}`,
          landmark,
          city,
          contactNumber
        },
        deliveryDate,
        timeSlot,
        instructions,
        paymentMethod
      };

      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        setOrderComplete(res.order);
        clearCart();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit order. Please check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 sm:p-10 bg-white rounded-3xl border border-amber-100 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Order Successfully Placed!
          </span>
          <h1 className="font-display font-extrabold text-3xl text-stone-900">
            Thank You! (+91 {customer?.mobile})
          </h1>
          <p className="text-xs text-stone-500">
            Order Number: <strong className="text-stone-900 font-mono text-sm">{orderComplete.orderNumber}</strong>
          </p>
        </div>

        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 text-left space-y-3 text-xs">
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500">Delivery Schedule:</span>
            <span className="font-bold text-stone-900">{orderComplete.deliveryDate} ({orderComplete.timeSlot})</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500">Delivery Address:</span>
            <span className="font-bold text-stone-900 truncate max-w-xs">{orderComplete.deliveryAddress?.street}, Narsapur</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-2">
            <span className="text-stone-500">Payment:</span>
            <span className="font-bold text-stone-900">{orderComplete.paymentMethod} (₹{orderComplete.totalAmount})</span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-extrabold text-amber-800">
            <span>Status:</span>
            <span>Awaiting Owner Review</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => onNavigate('my-orders')}
            className="flex-1 py-3.5 rounded-2xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md"
          >
            Track My Order in Real-Time
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-xs bg-stone-100 hover:bg-stone-200 text-stone-800"
          >
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => onNavigate('menu')}
          className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-md space-y-6">
            <h2 className="font-display font-bold text-2xl text-stone-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-amber-600" />
              <span>Delivery Details</span>
            </h2>

            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              
              {/* Mandatory Location Selection Before Confirmation */}
              <LocationPicker
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                distanceKm={deliveryDistanceKm}
                onDistanceChange={setDeliveryDistanceKm}
                required={true}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Customer Account Mobile
                  </label>
                  <input
                    type="text"
                    disabled
                    value={'+91 ' + (customer?.mobile || '')}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Contact Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Delivery Street Address (Narsapur) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  placeholder="House / Flat No., Apartment / Street, Colony"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near temple, school, shop..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={city}
                    disabled
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-600"
                  />
                </div>
              </div>

              {/* Delivery Schedule */}
              <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Preferred Delivery Slot *
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="10:00 AM - 1:00 PM">10:00 AM - 1:00 PM (Morning)</option>
                    <option value="2:00 PM - 5:00 PM">2:00 PM - 5:00 PM (Afternoon)</option>
                    <option value="6:00 PM - 9:00 PM">6:00 PM - 9:00 PM (Evening)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Additional Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Call before arrival, leave with security..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="pt-4 border-t border-stone-100">
                <label className="text-xs font-bold text-stone-700 block mb-2">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-amber-600 bg-amber-50/70 shadow-sm'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-stone-900">💵 Cash on Delivery</div>
                    <div className="text-[11px] text-stone-500 mt-1">Pay when cake is delivered at your door.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'ONLINE'
                        ? 'border-amber-600 bg-amber-50/70 shadow-sm'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-stone-900">📱 UPI / Online Card</div>
                    <div className="text-[11px] text-stone-500 mt-1">Direct instant digital payment.</div>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-md space-y-6">
            <h2 className="font-display font-bold text-xl text-stone-900">
              Order Summary ({items.length} items)
            </h2>

            {/* Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.itemKey} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex-1 truncate">
                    <span className="font-bold text-stone-900">{item.name}</span>
                    <span className="text-stone-400"> × {item.quantity}</span>
                    {item.weight && <span className="text-amber-700 block text-[11px]">({item.weight})</span>}
                    {item.selectedVariant && <span className="text-stone-500 block text-[11px]">({item.selectedVariant})</span>}
                  </div>
                  <span className="font-bold text-stone-900">₹{item.total}</span>
                </div>
              ))}
            </div>

            {/* Distance Slider */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" />
                  Distance from Narsapur Bakery:
                </span>
                <span className="text-amber-700">{deliveryDistanceKm} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={deliveryDistanceKm}
                onChange={(e) => setDeliveryDistanceKm(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>1 km</span>
                <span>Transparent: ₹4 per km</span>
                <span>30 km</span>
              </div>
            </div>

            {/* Price Breakdown (Section M) */}
            <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
              {cakeSubtotal > 0 && (
                <div className="flex justify-between">
                  <span>Cake Subtotal:</span>
                  <span className="font-semibold text-stone-900">₹{cakeSubtotal}</span>
                </div>
              )}
              {celebrationSubtotal > 0 && (
                <div className="flex justify-between">
                  <span>Celebration Subtotal:</span>
                  <span className="font-semibold text-stone-900">₹{celebrationSubtotal}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge ({deliveryDistanceKm} km × ₹4):</span>
                <span className="font-semibold text-stone-900">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-3 border-t border-stone-200">
                <span>Payable Amount:</span>
                <span className="text-amber-700 text-xl font-display">₹{finalTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-xl shadow-amber-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {submitting ? (
                <span>Submitting Order...</span>
              ) : (
                <span>Place Order (₹{finalTotal})</span>
              )}
            </button>

            <div className="text-[11px] text-center text-stone-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct order to Sri Balaji Cake Factory. Verified owner review.</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
