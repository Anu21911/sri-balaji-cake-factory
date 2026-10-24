import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Check, Sparkles, MessageSquare } from 'lucide-react';

export default function CakeCard({ product }) {
  const { addItem } = useCart();
  const [selectedWeight, setSelectedWeight] = useState('1 kg');
  const [cakeMessage, setCakeMessage] = useState('');
  const [showMsgInput, setShowMsgInput] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Immediate frontend weight-based price calculation matching backend rules:
  // 1 kg = original basePrice
  // 2 kg = original basePrice * 2
  // 3 kg = original basePrice * 3
  const currentPrice = (() => {
    if (selectedWeight === '2 kg') return product.basePrice * 2;
    if (selectedWeight === '3 kg') return product.basePrice * 3;
    return product.basePrice; // 1 kg
  })();

  const handleAddToCart = () => {
    addItem(product, selectedWeight, cakeMessage);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const imageSrc = imgError || !product.image
    ? '/images/products/fallback.jpg'
    : product.image;

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-amber-100/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group">
      
      {/* Cake Image with Badge */}
      <div className="relative h-56 sm:h-64 overflow-hidden bg-stone-100">
        <img
          src={imageSrc}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Regular Cake</span>
        </div>
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-stone-900 text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
          {product.flavour}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-xl text-stone-900 group-hover:text-amber-700 transition-colors">
              {product.name}
            </h3>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-amber-600 block">
                ₹{currentPrice}
              </span>
              <span className="text-[11px] text-stone-400 font-medium">for {selectedWeight}</span>
            </div>
          </div>

          <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Weight Selector (1 kg, 2 kg, 3 kg) */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
            Select Cake Weight:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['1 kg', '2 kg', '3 kg'].map((wt) => {
              const multiplier = wt === '2 kg' ? 2 : wt === '3 kg' ? 3 : 1;
              const wtPrice = product.basePrice * multiplier;
              const isSelected = selectedWeight === wt;

              return (
                <button
                  key={wt}
                  type="button"
                  onClick={() => setSelectedWeight(wt)}
                  className={`py-2 px-1.5 rounded-2xl text-center text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20 scale-[1.02]'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                  }`}
                >
                  <div className="font-extrabold">{wt}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-amber-100' : 'text-stone-500'}`}>
                    ₹{wtPrice}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Cake Message Toggle */}
        <div className="pt-1">
          {!showMsgInput ? (
            <button
              type="button"
              onClick={() => setShowMsgInput(true)}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold inline-flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>+ Add Name / Custom Message on Cake</span>
            </button>
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-stone-600">
                Message on Cake:
              </label>
              <input
                type="text"
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                placeholder="e.g., Happy Birthday Rahul!"
                maxLength={45}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.isAvailable}
          className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
            !product.isAvailable
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : added
              ? 'bg-green-600 text-white shadow-green-600/20'
              : 'bg-stone-900 hover:bg-black text-white hover:shadow-md'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 text-white animate-bounce" />
              <span>Added to Cart!</span>
            </>
          ) : !product.isAvailable ? (
            <span>Currently Sold Out</span>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Add to Cart (₹{currentPrice})</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
