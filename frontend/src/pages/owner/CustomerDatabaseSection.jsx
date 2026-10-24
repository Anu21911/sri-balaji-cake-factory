import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Users, Search, Download, Eye, Phone, Mail, MapPin, Calendar, ShoppingBag, X } from 'lucide-react';

export default function CustomerDatabaseSection() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'pending'

  // Customer inspection modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [filter]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      let query = `?filter=${filter}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      const res = await api.getCustomerDatabase(query);
      if (res.success) {
        setCustomers(res.customers || []);
      }
    } catch (err) {
      console.error('Failed to load customer database:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  const openCustomerDetails = async (cust) => {
    setSelectedCustomer(cust);
    setLoadingOrders(true);
    try {
      const res = await api.getCustomerDetails(cust.id);
      if (res.success) {
        setCustomerOrders(res.orders || []);
      }
    } catch (err) {
      console.error('Failed to get customer details:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleExportCsv = () => {
    const exportUrl = api.getExportCustomerCsvUrl();
    window.open(exportUrl, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>11. Customer Database (Owner Only)</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Verified customer accounts, order frequency, saved addresses & secure CSV report export.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 transition-colors shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Export Customer CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-white bg-stone-800'
            }`}
          >
            All Registered ({customers.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'active'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-white bg-stone-800'
            }`}
          >
            Active Buyers
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === 'pending'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-white bg-stone-800'
            }`}
          >
            With Pending Orders
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200"
          >
            Search
          </button>
        </form>
      </div>

      {/* Customer Table */}
      {loading ? (
        <div className="text-stone-400 text-xs py-16 text-center">Loading customer database...</div>
      ) : customers.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
          <div className="text-3xl">👥</div>
          <h3 className="font-display font-bold text-lg text-white">
            No customers found
          </h3>
          <p className="text-xs text-stone-400">
            Customers will automatically appear here once they register or place orders.
          </p>
        </div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                <tr>
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">Registered On</th>
                  <th className="px-6 py-4 text-center">Total Orders</th>
                  <th className="px-6 py-4 text-center">Completed</th>
                  <th className="px-6 py-4 text-center">Pending</th>
                  <th className="px-6 py-4 text-right">Total Spent</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                      {cust.name}
                    </td>
                    <td className="px-6 py-4 font-mono whitespace-nowrap">
                      <a href={`tel:${cust.mobile}`} className="text-amber-400 hover:underline">
                        +91 {cust.mobile}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-stone-400 whitespace-nowrap">
                      {cust.registeredAt ? new Date(cust.registeredAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-6 py-4 text-center font-bold whitespace-nowrap">
                      {cust.totalOrders}
                    </td>
                    <td className="px-6 py-4 text-center text-emerald-400 font-bold whitespace-nowrap">
                      {cust.completedOrders}
                    </td>
                    <td className="px-6 py-4 text-center text-amber-400 font-bold whitespace-nowrap">
                      {cust.pendingOrders}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-white whitespace-nowrap">
                      ₹{cust.totalSpend}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => openCustomerDetails(cust)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Inspect Orders</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOMER DETAILS & ORDER HISTORY MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl text-white relative">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Overview */}
            <div className="border-b border-stone-800 pb-4">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest block">
                Customer Record (Owner Confidential)
              </span>
              <h2 className="font-display font-bold text-2xl text-white mt-1">
                {selectedCustomer.name}
              </h2>
              <div className="flex flex-wrap gap-4 text-xs text-stone-400 mt-2">
                <a href={`tel:${selectedCustomer.mobile}`} className="text-amber-400 hover:underline">
                  📱 +91 {selectedCustomer.mobile}
                </a>
                {selectedCustomer.email && (
                  <span>✉️ {selectedCustomer.email}</span>
                )}
                <span>
                  Registered: {selectedCustomer.registeredAt ? new Date(selectedCustomer.registeredAt).toLocaleDateString('en-IN') : '—'}
                </span>
              </div>
            </div>

            {/* Saved Addresses */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                Saved Delivery Addresses:
              </span>
              {selectedCustomer.savedAddresses?.length === 0 ? (
                <p className="text-xs text-stone-500 italic">No saved delivery addresses stored yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCustomer.savedAddresses.map((addr, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-stone-950 border border-stone-800 text-xs">
                      <span className="font-bold text-white block">{addr.label || 'Home'}</span>
                      <p className="text-stone-300">{addr.street}</p>
                      {addr.landmark && <p className="text-stone-500">Landmark: {addr.landmark}</p>}
                      <p className="text-stone-500">{addr.city}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Orders History */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                Associated Orders History ({customerOrders.length}):
              </span>

              {loadingOrders ? (
                <div className="text-xs text-stone-500 py-6 text-center">Loading orders...</div>
              ) : customerOrders.length === 0 ? (
                <p className="text-xs text-stone-500 italic">No past orders placed by this customer.</p>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map((order) => (
                    <div
                      key={order._id || order.id}
                      className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-400">
                          #{order.orderNumber}
                        </span>
                        <span className="font-extrabold text-white">
                          ₹{order.totalAmount} ({order.orderStatus})
                        </span>
                      </div>

                      <div className="text-stone-400">
                        Date: {order.deliveryDate} ({order.timeSlot})
                      </div>

                      <div className="text-stone-300">
                        {order.items.map((i, idx) => (
                          <span key={idx} className="mr-2">
                            • {i.name} {i.weight ? `(${i.weight})` : ''} ×{i.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
