import React, { useState } from 'react';
import { MapPin, Navigation, Check, AlertCircle } from 'lucide-react';

export const POPULAR_LOCATIONS = [
  { name: 'Narsapur Town / Market Area', km: 2, label: 'Central Narsapur' },
  { name: 'SangaReddy Road / Bypass Junction', km: 4, label: 'SangaReddy Road' },
  { name: 'Shivampet Road Area', km: 7, label: 'Shivampet Direction' },
  { name: 'Gummadidala Area', km: 10, label: 'Gummadidala' },
  { name: 'Hathnoora Region', km: 14, label: 'Hathnoora' },
  { name: 'Jinnaram Area', km: 18, label: 'Jinnaram' },
];

export default function LocationPicker({
  selectedLocation,
  onSelectLocation,
  distanceKm,
  onDistanceChange,
  required = true,
  showCustomSlider = true
}) {
  const [isCustom, setIsCustom] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const handlePickPreset = (loc) => {
    setIsCustom(false);
    onSelectLocation(loc.name);
    onDistanceChange(loc.km);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please select your locality below.');
      return;
    }

    setLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        // Narsapur approximate coordinates: 17.7408, 78.1633
        const narsapurLat = 17.7408;
        const narsapurLng = 78.1633;
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        // Haversine formula
        const R = 6371; // km
        const dLat = ((userLat - narsapurLat) * Math.PI) / 180;
        const dLon = ((userLng - narsapurLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((narsapurLat * Math.PI) / 180) *
            Math.cos((userLat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let km = Math.round(R * c);
        if (km < 1) km = 1;
        if (km > 30) km = 30;

        onSelectLocation(`GPS Detected Location (~${km} km from Bakery)`);
        onDistanceChange(km);
        setIsCustom(true);
      },
      (err) => {
        setLocating(false);
        setLocationError('Could not detect location. Please tap one of our delivery localities below.');
      },
      { timeout: 7000 }
    );
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-stone-900">
            Select Delivery Location {required && <span className="text-rose-600">*</span>}
          </span>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={locating}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs"
        >
          <Navigation className={`w-3 h-3 text-amber-600 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Detecting...' : 'Detect My Location'}</span>
        </button>
      </div>

      {locationError && (
        <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Preset locality buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {POPULAR_LOCATIONS.map((loc) => {
          const isSelected = selectedLocation === loc.name;
          const fee = loc.km * 4;

          return (
            <button
              key={loc.name}
              type="button"
              onClick={() => handlePickPreset(loc)}
              className={`p-2.5 rounded-xl text-left transition-all border text-xs flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-400'
                  : 'bg-white text-stone-800 border-amber-200/80 hover:bg-amber-100/50 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold leading-tight">{loc.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
              </div>
              <div className={`text-[10px] mt-1 ${isSelected ? 'text-amber-100' : 'text-stone-500'}`}>
                {loc.km} km • <strong>₹{fee} Delivery</strong>
              </div>
            </button>
          );
        })}
      </div>

      {/* Option for Custom Distance Slider */}
      {showCustomSlider && (
        <div className="pt-2 border-t border-amber-200/70">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <button
              type="button"
              onClick={() => {
                setIsCustom(true);
                onSelectLocation(`Custom Area (${distanceKm} km from bakery)`);
              }}
              className={`font-semibold text-xs ${
                isCustom ? 'text-amber-900 font-bold underline' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              📍 Other Location / Enter Distance:
            </button>
            <span className="font-mono font-bold text-amber-700 text-xs">
              {distanceKm} km (₹{distanceKm * 4})
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="30"
            value={distanceKm}
            onChange={(e) => {
              const val = Number(e.target.value);
              setIsCustom(true);
              onDistanceChange(val);
              onSelectLocation(`Custom Area (${val} km from bakery)`);
            }}
            className="w-full accent-amber-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
            <span>1 km (Local)</span>
            <span>Standard Rate: ₹4 per km</span>
            <span>30 km</span>
          </div>
        </div>
      )}

      {/* Status banner */}
      {selectedLocation ? (
        <div className="p-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">Selected: {selectedLocation}</span>
          </div>
          <span className="font-mono font-bold shrink-0 text-stone-900">
            +₹{distanceKm * 4} Delivery
          </span>
        </div>
      ) : (
        <div className="p-2 rounded-xl bg-amber-100/60 border border-amber-300 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Please tap your delivery location above before confirming your order.</span>
        </div>
      )}

    </div>
  );
}
