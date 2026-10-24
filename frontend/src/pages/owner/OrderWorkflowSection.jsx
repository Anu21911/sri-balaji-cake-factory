import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Search,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck,
  Archive,
  Eye,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  X
} from 'lucide-react';

export default function OrderWorkflowSection({ statusFilter, title, onStatusChange }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Modals
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(null); // order obj
  const [acceptNote, setAcceptNote] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(null); // order obj
  const [rejectReason, setRejectReason] = useState('');

  const [showStatusModal, setShowStatusModal] = useState(null); // { order, nextStatus }
  const [statusNote, setStatusNote] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let query = statusFilter ? `?status=${statusFilter}` : '';
      if (search) query += `${query ? '&' : '?'}search=${encodeURIComponent(search)}`;
      const res = await api.getOwnerOrders(query);
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  // 1. Confirm Accept
  const handleConfirmAccept = async () => {
    if (!showAcceptConfirm) return;
    setActionLoading(true);
    try {
      const res = await api.ownerAcceptOrder(showAcceptConfirm._id || showAcceptConfirm.id, acceptNote);
      if (res.success) {
        setShowAcceptConfirm(null);
        setAcceptNote('');
        loadOrders();
        onStatusChange?.();
      }
    } catch (err) {
      alert(err.message || 'Failed to accept order.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Confirm Reject (Reason is MANDATORY)
  const handleConfirmReject = async () => {
    if (!showRejectModal) return;
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason to notify the customer.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.ownerRejectOrder(showRejectModal._id || showRejectModal.id, rejectReason);
      if (res.success) {
        setShowRejectModal(null);
        setRejectReason('');
        loadOrders();
        onStatusChange?.();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject order.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Confirm Workflow Status Progression
  const handleConfirmWorkflowStatus = async () => {
    if (!showStatusModal) return;
    setActionLoading(true);
    try {
      const res = await api.ownerUpdateOrderStatus(
        showStatusModal.order._id || showStatusModal.order.id,
        showStatusModal.nextStatus,
        statusNote
      );
      if (res.success) {
        setShowStatusModal(null);
        setStatusNote('');
        loadOrders();
        onStatusChange?.();
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">
            {title}
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Showing {orders.length} orders in this workflow stage.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, customer, phone..."
              className="w-64 text-xs pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-600 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders Table / Cards */}
      {loading ? (
        <div className="text-stone-400 text-xs py-16 text-center">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
          <div className="text-3xl">📦</div>
          <h3 className="font-display font-bold text-lg text-white">
            No orders found in "{title}"
          </h3>
          <p className="text-xs text-stone-400">
            Incoming orders will appear here automatically in real time.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id || order.id}
              className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-md hover:border-stone-700 transition-all space-y-4"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-amber-400">
                    #{order.orderNumber}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {order.customer.name}
                  </span>
                  <a
                    href={`tel:${order.customer.mobile}`}
                    className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1 font-mono"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{order.customer.mobile}</span>
                  </a>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-stone-400">
                    <span className="text-stone-500">Delivery:</span>{' '}
                    <strong className="text-white">{order.deliveryDate} ({order.timeSlot})</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-extrabold text-base font-display">
                      ₹{order.totalAmount}
                    </span>
                    <span className="text-[10px] text-stone-500 block">
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items & Address Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Items */}
                <div className="space-y-1.5 bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Ordered Items:
                  </span>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-stone-300">
                      <div>
                        <strong className="text-white">{item.name}</strong>
                        {item.weight && <span className="text-amber-400 ml-1.5">({item.weight})</span>}
                        {item.selectedVariant && <span className="text-stone-400 ml-1.5">({item.selectedVariant})</span>}
                        {item.cakeMessage && (
                          <span className="block text-[11px] text-stone-400 italic">"{item.cakeMessage}"</span>
                        )}
                      </div>
                      <span className="font-mono">
                        {item.quantity} × ₹{item.unitPrice} = <strong>₹{item.total}</strong>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery Address & Instructions */}
                <div className="space-y-1.5 bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Delivery Address:
                  </span>
                  <p className="text-stone-300">
                    {order.deliveryAddress?.street}
                    {order.deliveryAddress?.landmark ? `, Near: ${order.deliveryAddress.landmark}` : ''}
                    , {order.deliveryAddress?.city}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Distance: {order.deliveryDistanceKm} km • Delivery Fee: ₹{order.deliveryFee}
                  </p>
                  {order.instructions && (
                    <p className="text-[11px] text-amber-300 italic pt-1 border-t border-stone-800">
                      Note: {order.instructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Reason if Rejected or Cancelled */}
              {order.orderStatus === 'rejected' && (
                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300">
                  <strong>Rejection Reason Recorded:</strong> {order.rejectionReason}
                </div>
              )}
              {order.orderStatus === 'cancelled' && (
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-xs text-stone-400">
                  <strong>Customer Cancellation Reason:</strong> {order.cancellationReason || 'Cancelled by customer'}
                </div>
              )}

              {/* Action Buttons Depending on Current Status */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-800">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full Order</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Status 1: New -> Accept or Reject */}
                  {order.orderStatus === 'new' && (
                    <>
                      <button
                        onClick={() => {
                          setShowRejectModal(order);
                          setRejectReason('');
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Order</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowAcceptConfirm(order);
                          setAcceptNote('');
                        }}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors flex items-center gap-1.5 shadow-md"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Accept Order</span>
                      </button>
                    </>
                  )}

                  {/* Status 2: Accepted -> Move to In Preparation */}
                  {order.orderStatus === 'accepted' && (
                    <button
                      onClick={() => setShowStatusModal({ order, nextStatus: 'in_preparation' })}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5"
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Start Baking / Preparation</span>
                    </button>
                  )}

                  {/* Status 3: In Preparation -> Move to Ready for Dispatch */}
                  {order.orderStatus === 'in_preparation' && (
                    <button
                      onClick={() => setShowStatusModal({ order, nextStatus: 'ready_for_dispatch' })}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Package & Mark Ready for Dispatch</span>
                    </button>
                  )}

                  {/* Status 4: Ready for Dispatch -> Out for delivery or Complete */}
                  {order.orderStatus === 'ready_for_dispatch' && (
                    <>
                      <button
                        onClick={() => setShowStatusModal({ order, nextStatus: 'out_for_delivery' })}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                      >
                        Out for Delivery
                      </button>
                      <button
                        onClick={() => setShowStatusModal({ order, nextStatus: 'completed' })}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Mark Completed / Delivered
                      </button>
                    </>
                  )}

                  {/* Status 5: Out for delivery -> Complete */}
                  {order.orderStatus === 'out_for_delivery' && (
                    <button
                      onClick={() => setShowStatusModal({ order, nextStatus: 'completed' })}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Mark Completed / Delivered
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CONFIRM ACCEPT MODAL */}
      {showAcceptConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-stone-950 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  Accept Order #{showAcceptConfirm.orderNumber}?
                </h3>
                <p className="text-xs text-stone-400">
                  Customer: {showAcceptConfirm.customer.name} (₹{showAcceptConfirm.totalAmount})
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Confirming will move this order into the <strong>Accepted Orders</strong> workflow. The customer will be immediately notified via portal & SMS.
            </p>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">
                Owner Note to Customer (Optional):
              </label>
              <input
                type="text"
                value={acceptNote}
                onChange={(e) => setAcceptNote(e.target.value)}
                placeholder="e.g. Baking fresh pineapple cake right away!"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAcceptConfirm(null)}
                className="flex-1 py-3 rounded-xl font-semibold text-xs bg-stone-800 hover:bg-stone-700 text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccept}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
              >
                {actionLoading ? 'Accepting...' : 'Yes, Accept Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL (MANDATORY REASON) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  Reject Order #{showRejectModal.orderNumber}
                </h3>
                <p className="text-xs text-stone-400">
                  Customer: {showRejectModal.customer.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300">
              A rejection reason is strictly required. This reason is permanently recorded in audit logs and communicated directly to the customer.
            </p>

            <div>
              <label className="text-xs font-bold text-rose-300 block mb-1">
                Rejection Reason * (Mandatory)
              </label>
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Fully booked for today's delivery slots; ingredients out of stock; address outside delivery radius..."
                className="w-full text-xs p-3 rounded-xl bg-stone-800 border border-rose-800 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(null)}
                className="flex-1 py-3 rounded-xl font-semibold text-xs bg-stone-800 hover:bg-stone-700 text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-md"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKFLOW STATUS PROGRESSION MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-white">
            <h3 className="font-display font-bold text-xl text-white">
              Update Order #{showStatusModal.order.orderNumber} Status
            </h3>
            <p className="text-xs text-stone-300">
              Advance status to: <strong className="text-amber-400 uppercase">{showStatusModal.nextStatus}</strong>
            </p>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-1">
                Timeline Note / Executive Details:
              </label>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="e.g. Cake is in oven; Handed to delivery driver..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowStatusModal(null)}
                className="flex-1 py-3 rounded-xl font-semibold text-xs bg-stone-800 text-stone-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWorkflowStatus}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-stone-950"
              >
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT FULL ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl text-white relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-stone-800 pb-4">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest block">
                Official Order Record
              </span>
              <h2 className="font-display font-bold text-2xl text-white mt-1">
                Order #{selectedOrder.orderNumber}
              </h2>
              <p className="text-xs text-stone-400">
                Created: {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
              </p>
            </div>

            {/* Customer & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-stone-400 block uppercase tracking-wider text-[10px]">
                  Customer Profile:
                </span>
                <p className="font-bold text-white text-sm">{selectedOrder.customer.name}</p>
                <p className="text-stone-300 font-mono">📱 {selectedOrder.customer.mobile}</p>
                {selectedOrder.customer.email && <p className="text-stone-400">✉️ {selectedOrder.customer.email}</p>}
              </div>

              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="font-bold text-stone-400 block uppercase tracking-wider text-[10px]">
                  Delivery Destination:
                </span>
                <p className="text-stone-300">{selectedOrder.deliveryAddress?.street}</p>
                {selectedOrder.deliveryAddress?.landmark && (
                  <p className="text-stone-400">Landmark: {selectedOrder.deliveryAddress.landmark}</p>
                )}
                <p className="text-stone-400">{selectedOrder.deliveryAddress?.city}</p>
                <p className="text-amber-400 font-semibold mt-1">
                  Requested Slot: {selectedOrder.deliveryDate} ({selectedOrder.timeSlot})
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="font-bold text-stone-400 block uppercase tracking-wider text-[10px]">
                Items Breakdown:
              </span>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-white text-sm">{item.name}</strong>
                      <div className="flex gap-2 text-stone-400 mt-0.5">
                        {item.weight && <span className="text-amber-400">Weight: {item.weight}</span>}
                        {item.selectedVariant && <span>Variant: {item.selectedVariant}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                      {item.cakeMessage && (
                        <p className="text-stone-400 italic mt-1">Message: "{item.cakeMessage}"</p>
                      )}
                    </div>
                    <span className="font-bold text-white text-sm">₹{item.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Calculation Breakdown */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Cake Subtotal:</span>
                <span className="text-white font-mono">₹{selectedOrder.cakeSubtotal}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Celebration Items Subtotal:</span>
                <span className="text-white font-mono">₹{selectedOrder.celebrationSubtotal}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Delivery Fee ({selectedOrder.deliveryDistanceKm} km × ₹4):</span>
                <span className="text-white font-mono">₹{selectedOrder.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-stone-800">
                <span>Total Amount:</span>
                <span className="text-amber-400 font-mono text-lg">₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Timeline history */}
            <div className="space-y-2">
              <span className="font-bold text-stone-400 block uppercase tracking-wider text-[10px]">
                Audit Timeline:
              </span>
              <div className="space-y-1.5 text-xs">
                {selectedOrder.historyTimeline?.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-stone-400">
                    <span className="text-stone-500 font-mono shrink-0">
                      {new Date(h.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}:
                    </span>
                    <span className="font-semibold text-white uppercase">{h.status}</span>
                    <span>— {h.note}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
