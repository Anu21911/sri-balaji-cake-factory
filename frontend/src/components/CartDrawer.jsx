import React from 'react';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Phone } from 'lucide-react';
import LocationPicker from './LocationPicker';

export default function CartDrawer({ onProceedToCheckout, onNavigate }) {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeItem,
    clearCart,
    cakeSubtotal,
    celebrationSubtotal,
    subtotal,
    selectedLocation,
    setSelectedLocation,
    deliveryDistanceKm,
    setDeliveryDistanceKm,
    deliveryFee,
    finalTotal
  } = useCart();

  const { customer, isAuthenticated } = useCustomerAuth();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-bakery-50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <h2 className="font-display font-bold text-xl text-stone-900">
                Your Celebration Cart
              </h2>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="text-5xl">🎂</div>
                <h3 className="font-display font-bold text-lg text-stone-800">
                  Your cart is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Browse our regular cake flavours or party celebration items to start building your order.
                </p>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onNavigate('menu');
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-600 text-white shadow-sm"
                >
                  Explore Cake Flavours
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.itemKey}
                  className="p-4 rounded-2xl border border-stone-100 bg-stone-50/60 flex items-start justify-between gap-3"
                >
                  <img
                    src={item.image || '/images/products/fallback.jpg'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-stone-900 truncate">
                      {item.name}
                    </h4>
                    
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                      {item.weight && <span className="font-semibold text-amber-700">{item.weight}</span>}
                      {item.selectedVariant && <span>• {item.selectedVariant}</span>}
                    </div>

                    {item.cakeMessage && (
                      <p className="text-[11px] text-stone-500 italic mt-1 bg-white px-2 py-0.5 rounded border border-stone-200 truncate">
                        "{item.cakeMessage}"
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 bg-white rounded-xl border border-stone-200 px-2 py-1 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                          className="p-1 text-stone-500 hover:text-stone-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                          className="p-1 text-stone-500 hover:text-stone-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-sm text-stone-900">
                          ₹{item.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.itemKey)}
                    className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Order Summary & Distance Estimation */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-100 bg-bakery-50/50 space-y-4">
              
              {/* Interactive Delivery Location Selector */}
              <LocationPicker
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                distanceKm={deliveryDistanceKm}
                onDistanceChange={setDeliveryDistanceKm}
                required={true}
              />

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600">
                {cakeSubtotal > 0 && (
                  <div className="flex justify-between">
                    <span>Cake Total:</span>
                    <span className="font-semibold text-stone-900">₹{cakeSubtotal}</span>
                  </div>
                )}
                {celebrationSubtotal > 0 && (
                  <div className="flex justify-between">
                    <span>Celebration Items Total:</span>
                    <span className="font-semibold text-stone-900">₹{celebrationSubtotal}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee ({deliveryDistanceKm} km × ₹4):</span>
                  <span className="font-semibold text-stone-900">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Payable Total:</span>
                  <span className="text-amber-700 text-lg">₹{finalTotal}</span>
                </div>
              </div>

              {/* Checkout / Login Warning */}
              <button
                onClick={() => {
                  if (!selectedLocation) {
                    alert('Please select your delivery location above before proceeding to checkout.');
                    return;
                  }
                  setIsDrawerOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg shadow-amber-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {isAuthenticated ? (
                <p className="text-[11px] text-center text-stone-500 flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3 text-amber-600" />
                  <span>Customer Mobile: <strong className="font-mono text-stone-800">+91 {customer?.mobile}</strong></span>
                </p>
              ) : (
                <p className="text-[11px] text-center text-stone-500">
                  * You will be prompted to login/signup before completing your order.
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
