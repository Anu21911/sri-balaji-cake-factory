import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Sparkles, CheckCircle, XCircle, Eye, Calendar, Clock, MapPin, Phone, X } from 'lucide-react';

export default function CustomCakeRequestsSection({ onStatusChange }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quote modal
  const [quotingRequest, setQuotingRequest] = useState(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');

  // Reject modal
  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Photo viewer modal
  const [viewPhoto, setViewPhoto] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getOwnerCustomRequests();
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      console.error('Failed to load custom cake requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async () => {
    if (!quotingRequest || !quotePrice) {
      alert('Please enter a valid quoted price.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.ownerReviewCustomCake(quotingRequest._id || quotingRequest.id, {
        status: 'quoted',
        quotedPrice: Number(quotePrice),
        ownerNotes: quoteNotes
      });
      if (res.success) {
        setQuotingRequest(null);
        setQuotePrice('');
        setQuoteNotes('');
        loadRequests();
        onStatusChange?.();
      }
    } catch (err) {
      alert(err.message || 'Failed to submit quote.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCustomRequest = async () => {
    if (!rejectingRequest || !rejectReason.trim()) {
      alert('Please state a reason for rejecting this custom cake design.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.ownerReviewCustomCake(rejectingRequest._id || rejectingRequest.id, {
        status: 'rejected',
        rejectionReason: rejectReason
      });
      if (res.success) {
        setRejectingRequest(null);
        setRejectReason('');
        loadRequests();
        onStatusChange?.();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>9. Custom Cake Design Requests</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Customer-Idea uploads: inspect reference photos, determine feasibility, and provide custom price quotes.
          </p>
        </div>
        <button
          onClick={loadRequests}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 border border-stone-800 text-stone-300 hover:text-white"
        >
          Refresh List
        </button>
      </div>

      {loading ? (
        <div className="text-stone-400 text-xs py-16 text-center">Loading custom cake requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
          <div className="text-3xl">🎂</div>
          <h3 className="font-display font-bold text-lg text-white">
            No custom cake requests pending
          </h3>
          <p className="text-xs text-stone-400">
            When a customer submits a design idea via the "Have Your Own Cake Idea?" form, it will appear here immediately.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id || req.id}
              className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-md hover:border-stone-700 transition-all flex flex-col md:flex-row gap-6"
            >
              {/* Reference Image Thumbnail */}
              <div
                onClick={() => setViewPhoto(req.referenceImage)}
                className="w-full md:w-44 h-44 rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shrink-0 cursor-pointer group relative"
              >
                <img
                  src={req.referenceImage || '/images/products/fallback.jpg'}
                  alt={req.cakeName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white">
                  Click to Enlarge
                </div>
              </div>

              {/* Request Info */}
              <div className="flex-1 space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-2">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">
                      {req.cakeName}
                    </h3>
                    <p className="text-stone-400 text-xs mt-0.5">
                      Customer: <strong className="text-stone-200">{req.customer.name}</strong> •{' '}
                      <a href={`tel:${req.customer.mobile}`} className="text-amber-400 hover:underline">
                        📱 {req.customer.mobile}
                      </a>
                    </p>
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                        req.status === 'quoted'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : req.status === 'ordered'
                          ? 'bg-blue-950 text-blue-400 border-blue-800'
                          : req.status === 'rejected'
                          ? 'bg-rose-950 text-rose-400 border-rose-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800 animate-pulse'
                      }`}
                    >
                      {req.status === 'quoted'
                        ? `Quoted: ₹${req.quotedPrice}`
                        : req.status === 'ordered'
                        ? 'Order Placed'
                        : req.status === 'rejected'
                        ? 'Rejected'
                        : 'Awaiting Your Quote'}
                    </span>
                  </div>
                </div>

                <p className="text-stone-300 leading-relaxed">
                  <strong>Description:</strong> {req.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-400">
                  <div className="bg-stone-950 p-2 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-500 block">Flavour:</span>
                    <strong className="text-white">{req.flavour}</strong>
                  </div>
                  <div className="bg-stone-950 p-2 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-500 block">Weight:</span>
                    <strong className="text-white">{req.weight}</strong>
                  </div>
                  <div className="bg-stone-950 p-2 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-500 block">Target Date:</span>
                    <strong className="text-white">{req.deliveryDate}</strong>
                  </div>
                  <div className="bg-stone-950 p-2 rounded-xl border border-stone-800">
                    <span className="text-[10px] text-stone-500 block">Slot:</span>
                    <strong className="text-white">{req.timeSlot}</strong>
                  </div>
                </div>

                {req.cakeMessage && (
                  <p className="text-stone-400 italic">
                    Cake Message: <strong className="text-white">"{req.cakeMessage}"</strong>
                  </p>
                )}

                <p className="text-stone-400">
                  Delivery Destination: <span className="text-stone-200">{req.deliveryAddress}</span>
                </p>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap gap-2 justify-end border-t border-stone-800">
                  {req.status === 'pending_review' && (
                    <>
                      <button
                        onClick={() => {
                          setRejectingRequest(req);
                          setRejectReason('');
                        }}
                        className="px-4 py-2 rounded-xl font-bold bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 transition-colors"
                      >
                        Reject Request
                      </button>

                      <button
                        onClick={() => {
                          setQuotingRequest(req);
                          setQuotePrice('');
                          setQuoteNotes('');
                        }}
                        className="px-5 py-2 rounded-xl font-bold bg-amber-500 text-stone-950 hover:bg-amber-600 transition-colors shadow-md"
                      >
                        Enter Price Quote
                      </button>
                    </>
                  )}

                  {req.status === 'quoted' && (
                    <div className="text-stone-400 text-xs">
                      Quoted ₹{req.quotedPrice}. Waiting for customer confirmation.
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* QUOTE MODAL */}
      {quotingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-white">
            <h3 className="font-display font-bold text-xl text-white">
              Provide Quote for "{quotingRequest.cakeName}"
            </h3>
            <p className="text-xs text-stone-400">
              Customer: {quotingRequest.customer.name} • {quotingRequest.flavour} ({quotingRequest.weight})
            </p>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">
                Quoted Price (INR) *
              </label>
              <input
                type="number"
                required
                min="100"
                value={quotePrice}
                onChange={(e) => setQuotePrice(e.target.value)}
                placeholder="e.g. 650, 1200, 1800"
                className="w-full text-base font-bold px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">
                Owner Note to Customer:
              </label>
              <textarea
                rows={2}
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                placeholder="e.g. Includes fondant toppers and chocolate drip as shown in photo."
                className="w-full text-xs p-3 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setQuotingRequest(null)}
                className="flex-1 py-3 rounded-xl font-semibold text-xs bg-stone-800 text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSendQuote}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md"
              >
                {actionLoading ? 'Sending...' : 'Send Quote to Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-white">
            <h3 className="font-display font-bold text-xl text-white">
              Reject Custom Cake Request
            </h3>
            <p className="text-xs text-stone-400">
              State a clear reason for the customer:
            </p>

            <div>
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Design requires special mold not currently in stock; delivery slot fully booked..."
                className="w-full text-xs p-3 rounded-xl bg-stone-800 border border-rose-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setRejectingRequest(null)}
                className="flex-1 py-3 rounded-xl font-semibold text-xs bg-stone-800 text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectCustomRequest}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-md"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO VIEWER MODAL */}
      {viewPhoto && (
        <div
          onClick={() => setViewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <div className="max-w-2xl max-h-[85vh] relative">
            <button
              onClick={() => setViewPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={viewPhoto}
              alt="Enlarged Reference"
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain border-2 border-stone-700"
            />
          </div>
        </div>
      )}

    </div>
  );
}
