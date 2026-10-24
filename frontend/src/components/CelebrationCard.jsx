import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Check, ShieldAlert, Sparkles } from 'lucide-react';

export default function CelebrationCard({ product }) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.length > 0 ? product.variants[0].name : null
  );
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Price determination: if variant exists, pick variant price, else basePrice
  const currentPrice = (() => {
    if (selectedVariant && product.variants?.length) {
      const v = product.variants.find(item => item.name === selectedVariant);
      if (v) return v.price;
    }
    return product.basePrice;
  })();

  const handleAddToCart = () => {
    addItem(product, null, '', selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const imageSrc = imgError || !product.image
    ? '/images/products/fallback.jpg'
    : product.image;

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-amber-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      
      {/* Image & Price Tag */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-stone-100">
        <img
          src={imageSrc}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Party Essential</span>
        </div>
        <div className="absolute bottom-3 right-3 bg-amber-600 text-white font-extrabold text-sm px-3 py-1 rounded-xl shadow-lg">
          ₹{currentPrice}
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-display font-bold text-lg text-stone-900 group-hover:text-amber-700 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Variants selector (e.g. for Paper Shots ₹50 vs ₹80) */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                Choose Variant:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => setSelectedVariant(v.name)}
                      className={`py-2 px-2 rounded-xl text-left text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-amber-50 text-amber-900 border-amber-500 shadow-sm'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div className="truncate">{v.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Safe Use Instructions */}
          {product.safeUseInstructions && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 leading-tight">
                {product.safeUseInstructions}
              </p>
            </div>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!product.isAvailable}
          className={`w-full py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
            !product.isAvailable
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : added
              ? 'bg-green-600 text-white shadow-green-600/20'
              : 'bg-amber-600 hover:bg-amber-700 text-white hover:shadow-md'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 text-white animate-bounce" />
              <span>Added to Cart!</span>
            </>
          ) : !product.isAvailable ? (
            <span>Unavailable</span>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add (₹{currentPrice})</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
