import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Package, Clock, CheckCircle2, XCircle, Sparkles, RefreshCw, X, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CustomerOrdersModal({ isOpen, onClose }) {
  const { customer, isAuthenticated } = useCustomerAuth();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'custom_cakes'
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [acceptingQuoteId, setAcceptingQuoteId] = useState(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadData();
    }
  }, [isOpen, isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, customRes] = await Promise.all([
        api.getMyOrders(),
        api.getMyCustomRequests()
      ]);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
      if (customRes.success) setCustomRequests(customRes.requests || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingId) return;
    try {
      const res = await api.cancelOrder(cancellingId, cancelReason);
      if (res.success) {
        setShowCancelPrompt(false);
        setCancellingId(null);
        setCancelReason('');
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    }
  };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      addItem(
        {
          _id: item.productId,
          name: item.name,
          category: item.category,
          basePrice: item.unitPrice,
          image: item.image,
          variants: []
        },
        item.weight || '1 kg',
        item.cakeMessage || '',
        item.selectedVariant || null
      );
    });
    alert('Items added back to your cart!');
    onClose();
  };

  const handleAcceptQuote = async (requestId) => {
    setAcceptingQuoteId(requestId);
    try {
      const res = await api.acceptCustomQuote(requestId, { paymentMethod: 'COD' });
      if (res.success) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        alert('Custom cake order confirmed! Our bakers have accepted your order.');
        loadData();
        setActiveTab('orders');
      }
    } catch (err) {
      alert(err.message || 'Failed to confirm quote.');
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  if (!isOpen) return null;

  const statusColors = {
    new: 'bg-amber-100 text-amber-900 border-amber-300',
    accepted: 'bg-blue-100 text-blue-900 border-blue-300',
    in_preparation: 'bg-purple-100 text-purple-900 border-purple-300',
    ready_for_dispatch: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    out_for_delivery: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    completed: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    rejected: 'bg-rose-100 text-rose-900 border-rose-300',
    cancelled: 'bg-stone-200 text-stone-700 border-stone-300'
  };

  const statusLabels = {
    new: '1. New / In Review',
    accepted: '2. Accepted',
    in_preparation: '3. Baking & Decorating',
    ready_for_dispatch: '4. Packaged & Ready',
    out_for_delivery: 'Out for Delivery',
    completed: '5. Delivered',
    rejected: 'Rejected by Bakery',
    cancelled: 'Cancelled'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="max-w-3xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-100 relative max-h-[88vh] flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Package className="w-6 h-6 text-amber-600" />
            <div>
              <h2 className="font-display font-bold text-xl text-stone-900">
                My Orders & Tracking
              </h2>
              <p className="text-[11px] text-stone-500">
                Customer Mobile: <strong className="font-mono text-stone-900">+91 {customer?.mobile}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            Orders History ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('custom_cakes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom_cakes'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:text-stone-900'
            }`}
          >
            Custom Cake Quotes ({customRequests.length})
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="py-16 text-center text-xs text-stone-400">Loading your orders...</div>
          ) : activeTab === 'orders' ? (
            orders.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <div className="text-4xl">🎂</div>
                <h4 className="font-bold text-stone-800 text-sm">No orders placed yet</h4>
                <p className="text-xs text-stone-500">Your cake orders will appear here with live tracking.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id || order.id}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-stone-900">
                        #{order.orderNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[order.orderStatus] || 'bg-stone-100'}`}>
                        {statusLabels[order.orderStatus] || order.orderStatus}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-sm text-amber-700">₹{order.totalAmount}</span>
                      <span className="text-[10px] text-stone-400 ml-1">({order.paymentMethod})</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500">
                    Delivery: <strong>{order.deliveryDate} ({order.timeSlot})</strong> • Address: {order.deliveryAddress?.street}, Narsapur
                  </p>

                  {/* Items */}
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-stone-700">
                        <span>• {item.name} {item.weight ? `(${item.weight})` : ''} {item.selectedVariant ? `(${item.selectedVariant})` : ''} ×{item.quantity}</span>
                        <span className="font-semibold">₹{item.total}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex justify-end gap-2 border-t border-stone-200/60">
                    {order.orderStatus === 'new' && (
                      <button
                        onClick={() => {
                          setCancellingId(order._id || order.id);
                          setShowCancelPrompt(true);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
                      >
                        Cancel Order
                      </button>
                    )}
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                    >
                      Reorder Items
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            /* Custom requests */
            customRequests.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <div className="text-4xl">✨</div>
                <h4 className="font-bold text-stone-800 text-sm">No custom design requests</h4>
                <p className="text-xs text-stone-500">Submit a photo in "Have Your Own Cake Idea?" to get a custom quote.</p>
              </div>
            ) : (
              customRequests.map((req) => (
                <div
                  key={req._id || req.id}
                  className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-3"
                >
                  <div className="flex gap-4">
                    <img
                      src={req.referenceImage || '/images/products/fallback.jpg'}
                      alt={req.cakeName}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="flex-1 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-stone-900">{req.cakeName}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          {req.status === 'quoted'
                            ? `Quote: ₹${req.quotedPrice}`
                            : req.status === 'ordered'
                            ? 'Order Placed'
                            : req.status === 'rejected'
                            ? 'Rejected'
                            : 'Price awaiting owner confirmation'}
                        </span>
                      </div>
                      <p className="text-stone-600 line-clamp-2">{req.description}</p>
                      <p className="text-[11px] text-stone-400">
                        {req.flavour} • {req.weight} • Delivery: {req.deliveryDate} ({req.timeSlot})
                      </p>
                    </div>
                  </div>

                  {req.status === 'quoted' && (
                    <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-3">
                      <div className="text-xs">
                        <span className="text-emerald-700 font-bold">Owner Quoted: ₹{req.quotedPrice}</span>
                        {req.ownerNotes && <p className="text-[11px] text-stone-500 italic">"{req.ownerNotes}"</p>}
                      </div>
                      <button
                        onClick={() => handleAcceptQuote(req._id || req.id)}
                        disabled={acceptingQuoteId === (req._id || req.id)}
                        className="px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Quote & Confirm Order</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>

      </div>

      {/* Cancel Prompt Modal */}
      {showCancelPrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-3 shadow-xl">
            <h4 className="font-bold text-stone-900 text-sm">Cancel Order?</h4>
            <p className="text-xs text-stone-500">Only orders in new status can be cancelled before baking begins.</p>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelPrompt(false)}
                className="flex-1 py-2 text-xs bg-stone-100 rounded-xl"
              >
                No, Keep
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 py-2 text-xs bg-rose-600 text-white rounded-xl font-bold"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
