import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { Package, Clock, CheckCircle2, XCircle, AlertCircle, Sparkles, MapPin, Phone, RefreshCw, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MyOrdersPage({ onNavigate }) {
  const { customer, isAuthenticated } = useCustomerAuth();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'custom_cakes', 'profile'
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const [acceptingQuoteId, setAcceptingQuoteId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

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
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingId) return;
    try {
      const res = await api.cancelOrder(cancellingId, cancelReason);
      if (res.success) {
        setShowCancelModal(false);
        setCancellingId(null);
        setCancelReason('');
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    }
  };

  const handleReorder = (order) => {
    // Add items back into cart
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
    onNavigate('menu');
  };

  const handleAcceptQuote = async (requestId) => {
    setAcceptingQuoteId(requestId);
    try {
      const res = await api.acceptCustomQuote(requestId, { paymentMethod: 'COD' });
      if (res.success) {
        confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
        alert('Custom cake order confirmed! Our bakers have accepted your order.');
        loadData();
        setActiveTab('orders');
      }
    } catch (err) {
      alert(err.message || 'Failed to confirm custom cake quote.');
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-amber-100 shadow-xl text-center space-y-4">
        <div className="text-4xl">👤</div>
        <h2 className="font-display font-bold text-2xl text-stone-900">
          Sign In to View Your Account
        </h2>
        <p className="text-xs text-stone-500">
          Sign in to inspect your order history, delivery tracking, and custom design requests.
        </p>
        <button
          onClick={() => onNavigate('customer-auth')}
          className="w-full py-3.5 rounded-xl font-bold text-xs bg-amber-600 text-white shadow-md hover:bg-amber-700"
        >
          Customer Sign In
        </button>
      </div>
    );
  }

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
    new: 'New / Awaiting Review',
    accepted: 'Accepted by Owner',
    in_preparation: 'Baking & In Preparation',
    ready_for_dispatch: 'Packaged & Ready',
    out_for_delivery: 'Out for Delivery',
    completed: 'Delivered',
    rejected: 'Rejected by Bakery',
    cancelled: 'Cancelled'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Top Profile Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-display font-bold text-2xl shadow-md">
            {customer.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-stone-900">
              Welcome, {customer.name}
            </h1>
            <p className="text-xs text-stone-500 flex items-center justify-center sm:justify-start gap-3 mt-1">
              <span>📱 +91 {customer.mobile}</span>
              {customer.email && <span>• ✉️ {customer.email}</span>}
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('custom_cakes')}
          className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'custom_cakes'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Custom Cake Requests ({customRequests.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center text-xs text-stone-500">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-amber-100 shadow-sm">
              <div className="text-4xl">🎂</div>
              <h3 className="font-display font-bold text-xl text-stone-900">
                You have not placed any orders yet
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explore our 5 signature cake flavours and celebration products to place your first celebration order.
              </p>
              <button
                onClick={() => onNavigate('menu')}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-amber-600 text-white shadow-sm hover:bg-amber-700"
              >
                Browse Cake Menu
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id || order.id}
                className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-sm text-stone-900">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                          statusColors[order.orderStatus] || 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {statusLabels[order.orderStatus] || order.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • Delivery on {order.deliveryDate} ({order.timeSlot})
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-stone-400 block">Total Amount</span>
                    <span className="text-xl font-extrabold text-amber-700 font-display">
                      ₹{order.totalAmount}
                    </span>
                    <span className="text-[11px] text-stone-500 block">({order.paymentMethod})</span>
                  </div>
                </div>

                {/* Visual Tracking Timeline */}
                <div className="py-2">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-3">
                    Order Tracking Timeline:
                  </div>

                  {['rejected', 'cancelled'].includes(order.orderStatus) ? (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Order {order.orderStatus === 'rejected' ? 'Rejected by Bakery' : 'Cancelled'}</span>
                      </div>
                      <p className="text-rose-700">
                        Reason: {order.rejectionReason || order.cancellationReason || 'No specific reason provided.'}
                      </p>
                      {order.paymentMethod === 'ONLINE' && (
                        <p className="text-xs text-stone-600 pt-1">
                          Payment Status: <strong className="text-emerald-700">Refund Processed</strong>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      {[
                        { key: 'new', label: '1. New' },
                        { key: 'accepted', label: '2. Accepted' },
                        { key: 'in_preparation', label: '3. Baking' },
                        { key: 'ready_for_dispatch', label: '4. Ready' },
                        { key: 'completed', label: '5. Delivered' }
                      ].map((step, idx) => {
                        const stepOrder = ['new', 'accepted', 'in_preparation', 'ready_for_dispatch', 'out_for_delivery', 'completed'];
                        const currentIdx = stepOrder.indexOf(order.orderStatus);
                        const thisIdx = stepOrder.indexOf(step.key);
                        const isDone = currentIdx >= thisIdx && currentIdx !== -1;
                        const isCurrent = order.orderStatus === step.key || (step.key === 'ready_for_dispatch' && order.orderStatus === 'out_for_delivery');

                        return (
                          <div
                            key={step.key}
                            className={`p-2.5 rounded-2xl border transition-all ${
                              isCurrent
                                ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-sm'
                                : isDone
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                                : 'bg-stone-50 text-stone-400 border-stone-200'
                            }`}
                          >
                            <div className="text-[11px]">{step.label}</div>
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 mx-auto mt-1" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Items in this order */}
                <div className="space-y-3 pt-2 border-t border-stone-100">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Ordered Items:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-stone-900">{item.name}</span>
                          <span className="text-stone-500"> × {item.quantity}</span>
                          {item.weight && <span className="text-amber-700 block text-[11px]">Weight: {item.weight}</span>}
                          {item.selectedVariant && <span className="text-stone-500 block text-[11px]">Variant: {item.selectedVariant}</span>}
                          {item.cakeMessage && (
                            <span className="text-stone-500 italic block text-[11px]">"{item.cakeMessage}"</span>
                          )}
                        </div>
                        <span className="font-extrabold text-stone-900">₹{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address & Actions */}
                <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="text-stone-600">
                    <span className="font-bold text-stone-800 block">Delivery Address:</span>
                    <span>{order.deliveryAddress?.street}, {order.deliveryAddress?.landmark ? `${order.deliveryAddress.landmark}, ` : ''}{order.deliveryAddress?.city}</span>
                    <span className="block text-stone-400 mt-0.5">Contact: {order.deliveryAddress?.contactNumber}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.orderStatus === 'new' && (
                      <button
                        onClick={() => {
                          setCancellingId(order._id || order.id);
                          setShowCancelModal(true);
                        }}
                        className="px-4 py-2 rounded-xl font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}

                    <button
                      onClick={() => handleReorder(order)}
                      className="px-4 py-2 rounded-xl font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: CUSTOM CAKE REQUESTS */}
      {activeTab === 'custom_cakes' && (
        <div className="space-y-6">
          {customRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-amber-100 shadow-sm">
              <div className="text-4xl">🎂</div>
              <h3 className="font-display font-bold text-xl text-stone-900">
                No custom cake requests submitted
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Have a dream birthday or wedding cake design? Upload a reference picture and describe your idea!
              </p>
              <button
                onClick={() => onNavigate('custom-idea')}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-amber-600 text-white shadow-sm hover:bg-amber-700"
              >
                Submit Cake Idea
              </button>
            </div>
          ) : (
            customRequests.map((req) => (
              <div
                key={req._id || req.id}
                className="bg-white rounded-3xl border border-stone-200 shadow-md p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Reference Image */}
                  <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 shadow-2xs">
                    <img
                      src={req.referenceImage || '/images/products/fallback.jpg'}
                      alt={req.cakeName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-xl text-stone-900">
                        {req.cakeName}
                      </h3>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border self-start ${
                          req.status === 'quoted'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : req.status === 'ordered'
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {req.status === 'quoted'
                          ? 'Quote Ready from Owner'
                          : req.status === 'ordered'
                          ? 'Order Confirmed'
                          : req.status === 'rejected'
                          ? 'Rejected'
                          : 'Price awaiting owner confirmation'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {req.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                      <div className="bg-stone-50 p-2 rounded-xl">
                        <span className="text-[10px] text-stone-400 block">Flavour:</span>
                        <strong className="text-stone-900">{req.flavour}</strong>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-xl">
                        <span className="text-[10px] text-stone-400 block">Weight:</span>
                        <strong className="text-stone-900">{req.weight}</strong>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-xl">
                        <span className="text-[10px] text-stone-400 block">Delivery:</span>
                        <strong className="text-stone-900">{req.deliveryDate}</strong>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-xl">
                        <span className="text-[10px] text-stone-400 block">Slot:</span>
                        <strong className="text-stone-900">{req.timeSlot}</strong>
                      </div>
                    </div>

                    {/* Owner Quote & Confirmation Action */}
                    {req.status === 'quoted' && (
                      <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <span className="text-xs text-emerald-800 font-semibold block">
                            Owner RAKESH has confirmed feasibility & price:
                          </span>
                          <span className="font-display font-extrabold text-2xl text-emerald-700">
                            ₹{req.quotedPrice}
                          </span>
                          {req.ownerNotes && (
                            <p className="text-[11px] text-emerald-800 mt-1 italic">
                              "{req.ownerNotes}"
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleAcceptQuote(req._id || req.id)}
                          disabled={acceptingQuoteId === (req._id || req.id)}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Quote & Confirm Order</span>
                        </button>
                      </div>
                    )}

                    {req.status === 'pending_review' && (
                      <div className="mt-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                        ⏳ Owner RAKESH is reviewing your reference picture and ingredients. A quote will appear here once confirmed.
                      </div>
                    )}

                    {req.status === 'rejected' && (
                      <div className="mt-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                        ❌ Request rejected. Reason: {req.rejectionReason || 'Bakery kitchen cannot accommodate this design at this date.'}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-100">
            <h3 className="font-display font-bold text-lg text-stone-900">
              Confirm Order Cancellation
            </h3>
            <p className="text-xs text-stone-600">
              Are you sure you want to cancel this order? Cancellations are only allowed before our bakery begins preparation.
            </p>
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Reason for Cancellation (Optional):
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Change of party date, ordered by mistake..."
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
