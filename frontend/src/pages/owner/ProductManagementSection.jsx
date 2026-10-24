import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Cake, Sparkles, Upload, Edit, Check, AlertCircle, RefreshCw, X, ShieldAlert } from 'lucide-react';

export default function ProductManagementSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Product Modal
  const [editingProduct, setEditingProduct] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);
  const [editDescription, setEditDescription] = useState('');
  const [editSafety, setEditSafety] = useState('');
  const [saving, setSaving] = useState(false);

  // Upload Photo Modal
  const [uploadingFor, setUploadingFor] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts();
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setEditPrice(p.basePrice);
    setEditStock(p.stock);
    setEditAvailable(p.isAvailable);
    setEditDescription(p.description || '');
    setEditSafety(p.safeUseInstructions || '');
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    try {
      const res = await api.updateProduct(editingProduct._id || editingProduct.id, {
        basePrice: Number(editPrice),
        stock: Number(editStock),
        isAvailable: editAvailable,
        description: editDescription,
        safeUseInstructions: editSafety
      });
      if (res.success) {
        setEditingProduct(null);
        loadProducts();
      }
    } catch (err) {
      alert(err.message || 'Failed to update product.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!uploadingFor || !photoFile) return;
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', photoFile);

      const res = await api.uploadProductImage(uploadingFor._id || uploadingFor.id, formData);
      if (res.success) {
        setUploadingFor(null);
        setPhotoFile(null);
        setPreviewUrl(null);
        loadProducts();
      }
    } catch (err) {
      alert(err.message || 'Failed to upload photo.');
    } finally {
      setUploadLoading(false);
    }
  };

  const cakes = products.filter(p => p.category === 'cake');
  const celebrations = products.filter(p => p.category === 'celebration');

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Cake className="w-6 h-6 text-amber-400" />
            <span>10. Products & Menu Management</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Update base prices (automatically recalculates 1kg, 2kg, and 3kg tiers for regular cakes), replace photos, and manage inventory.
          </p>
        </div>

        <button
          onClick={loadProducts}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 border border-stone-800 text-stone-300 hover:text-white"
        >
          Refresh Products
        </button>
      </div>

      {loading ? (
        <div className="text-stone-400 text-xs py-16 text-center">Loading product catalog...</div>
      ) : (
        <>
          {/* Section 1: 5 Cake Flavours */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-xl text-amber-400 border-b border-stone-800 pb-2 flex items-center justify-between">
              <span>Signature Cake Flavours (5 Regular Cakes)</span>
              <span className="text-xs font-normal text-stone-400">Strictly no eggless cakes</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cakes.map((cake) => (
                <div
                  key={cake._id || cake.id}
                  className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-md space-y-4 p-5 flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    <img
                      src={cake.image || '/images/products/fallback.jpg'}
                      alt={cake.name}
                      className="w-24 h-24 rounded-2xl object-cover shrink-0 bg-stone-950 border border-stone-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                          {cake.flavour}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cake.isAvailable ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                          }`}
                        >
                          {cake.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base truncate mt-1">
                        {cake.name}
                      </h3>
                      <p className="text-xs text-amber-400 font-bold mt-1">
                        1 kg: ₹{cake.basePrice} • 2 kg: ₹{cake.basePrice * 2} • 3 kg: ₹{cake.basePrice * 3}
                      </p>
                    </div>
                  </div>

                  <div className="bg-stone-950/60 p-3 rounded-2xl border border-stone-800/80 text-xs text-stone-400 flex justify-between">
                    <span>Stock: <strong className="text-white">{cake.stock} units</strong></span>
                    <span>Category: <strong className="text-stone-300">Regular Cake</strong></span>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-stone-800">
                    <button
                      onClick={() => openEditModal(cake)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Price & Stock</span>
                    </button>
                    <button
                      onClick={() => {
                        setUploadingFor(cake);
                        setPhotoFile(null);
                        setPreviewUrl(null);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1"
                      title="Upload new photo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Celebration Products */}
          <div className="space-y-4 pt-6">
            <h2 className="font-display font-bold text-xl text-amber-400 border-b border-stone-800 pb-2">
              Celebration Products & Party Items
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {celebrations.map((item) => (
                <div
                  key={item._id || item.id}
                  className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-md space-y-4 p-5 flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.image || '/images/products/fallback.jpg'}
                      alt={item.name}
                      className="w-24 h-24 rounded-2xl object-cover shrink-0 bg-stone-950 border border-stone-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-stone-400 font-bold uppercase">
                          Celebration
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.isAvailable ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                          }`}
                        >
                          {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base truncate mt-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-amber-400 font-bold mt-1">
                        Base Price: ₹{item.basePrice}
                        {item.variants?.length > 0 && (
                          <span className="block text-[11px] text-stone-400 font-normal">
                            Variants: {item.variants.map(v => `${v.name} (₹${v.price})`).join(', ')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {item.safeUseInstructions && (
                    <div className="bg-amber-950/30 p-2.5 rounded-xl border border-amber-800/40 text-[11px] text-amber-300 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{item.safeUseInstructions}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1 border-t border-stone-800">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Price & Stock</span>
                    </button>
                    <button
                      onClick={() => {
                        setUploadingFor(item);
                        setPhotoFile(null);
                        setPreviewUrl(null);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1"
                      title="Upload new photo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-white">
            <h3 className="font-display font-bold text-xl text-white">
              Edit Product: {editingProduct.name}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Base Price (INR) *
                </label>
                <input
                  type="number"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full text-base font-bold px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-amber-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {editingProduct.category === 'cake' && (
                  <p className="text-[11px] text-stone-400 mt-1">
                    Auto-calculates: 1 kg: ₹{editPrice || 0} • 2 kg: ₹{(editPrice || 0) * 2} • 3 kg: ₹{(editPrice || 0) * 3}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Current Stock Available
                </label>
                <input
                  type="number"
                  required
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Availability Status
                </label>
                <select
                  value={editAvailable ? 'true' : 'false'}
                  onChange={(e) => setEditAvailable(e.target.value === 'true')}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="true">In Stock & Active for Sale</option>
                  <option value="false">Mark Unavailable / Sold Out</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {editingProduct.category === 'celebration' && (
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    Safe-Use Instructions
                  </label>
                  <input
                    type="text"
                    value={editSafety}
                    onChange={(e) => setEditSafety(e.target.value)}
                    placeholder="e.g. Keep away from flames..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-3 rounded-xl font-semibold text-xs bg-stone-800 text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO UPLOAD MODAL */}
      {uploadingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-white">
            <h3 className="font-display font-bold text-xl text-white">
              Replace Photo: {uploadingFor.name}
            </h3>

            <form onSubmit={handlePhotoUpload} className="space-y-4">
              <div className="border-2 border-dashed border-stone-700 rounded-2xl p-6 text-center cursor-pointer hover:border-amber-400 bg-stone-950">
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setPhotoFile(f);
                      setPreviewUrl(URL.createObjectURL(f));
                    }
                  }}
                  className="hidden"
                  id="prod-upload-input"
                />
                <label htmlFor="prod-upload-input" className="cursor-pointer block">
                  {previewUrl ? (
                    <div className="space-y-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-36 h-36 object-cover rounded-2xl mx-auto shadow-md"
                      />
                      <span className="text-xs text-amber-400 font-semibold block">Click to change</span>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <Upload className="w-8 h-8 text-amber-400 mx-auto" />
                      <p className="text-xs font-bold text-stone-300">Select new product photo</p>
                      <p className="text-[10px] text-stone-500">JPG, PNG, WEBP</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadingFor(null)}
                  className="flex-1 py-3 rounded-xl font-semibold text-xs bg-stone-800 text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading || !photoFile}
                  className="flex-1 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-stone-950 disabled:opacity-50"
                >
                  {uploadLoading ? 'Uploading...' : 'Save New Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
