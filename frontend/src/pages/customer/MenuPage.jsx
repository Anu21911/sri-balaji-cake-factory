import React, { useState } from 'react';
import CakeCard from '../../components/CakeCard';
import CelebrationCard from '../../components/CelebrationCard';
import { Search, Sparkles, Filter } from 'lucide-react';

export default function MenuPage({ products }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'cakes', 'celebrations'
  const [selectedFlavour, setSelectedFlavour] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const flavours = ['Pineapple', 'Butterscotch', 'Chocolate', 'Vanilla', 'Rasmalai'];

  const filteredProducts = products.filter(p => {
    // Tab filter
    if (activeTab === 'cakes' && p.category !== 'cake') return false;
    if (activeTab === 'celebrations' && p.category !== 'celebration') return false;

    // Flavour filter
    if (selectedFlavour !== 'all' && p.flavour !== selectedFlavour) return false;

    // Search query
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(term);
      const matchFlavour = p.flavour && p.flavour.toLowerCase().includes(term);
      const matchDesc = p.description && p.description.toLowerCase().includes(term);
      if (!matchName && !matchFlavour && !matchDesc) return false;
    }

    return true;
  });

  const cakes = filteredProducts.filter(p => p.category === 'cake');
  const celebrations = filteredProducts.filter(p => p.category === 'celebration');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Sri Balaji Bakery Menu</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-stone-900">
          Our Handcrafted Cake & Celebration Menu
        </h1>
        <p className="text-sm text-stone-500">
          Every cake is regular, freshly baked to order with live weight-based pricing. Pair your cake with genuine celebration party accessories.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => { setActiveTab('all'); setSelectedFlavour('all'); }}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Items ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('cakes')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'cakes'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Cakes (5 Flavours)
            </button>
            <button
              onClick={() => { setActiveTab('celebrations'); setSelectedFlavour('all'); }}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'celebrations'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Party Celebrations
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cakes or items..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Flavour Pills Filter (When viewing all or cakes) */}
        {activeTab !== 'celebrations' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              Flavour:
            </span>
            <button
              onClick={() => setSelectedFlavour('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                selectedFlavour === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Flavours
            </button>
            {flavours.map(f => (
              <button
                key={f}
                onClick={() => setSelectedFlavour(f)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                  selectedFlavour === f
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cakes Section */}
      {cakes.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <h2 className="font-display font-bold text-2xl text-stone-900">
              Signature Regular Cakes
            </h2>
            <span className="text-xs text-stone-500 font-semibold">
              Select 1 kg, 2 kg, or 3 kg for live prices
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cakes.map((cake) => (
              <CakeCard key={cake._id || cake.id} product={cake} />
            ))}
          </div>
        </div>
      )}

      {/* Celebrations Section */}
      {celebrations.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <h2 className="font-display font-bold text-2xl text-stone-900">
              Celebration Products & Party Items
            </h2>
            <span className="text-xs text-stone-500 font-semibold">
              Sparkles, Snow Spray, Paper Shots, Shalvas & Gun Coils
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {celebrations.map((item) => (
              <CelebrationCard key={item._id || item.id} product={item} />
            ))}
          </div>
        </div>
      )}

      {/* Empty Search Result */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="font-display font-bold text-xl text-stone-800">
            No matching items found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search query or reset flavour filters to view all 5 signature cake flavours.
          </p>
          <button
            onClick={() => {
              setActiveTab('all');
              setSelectedFlavour('all');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-600 text-white"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
}
