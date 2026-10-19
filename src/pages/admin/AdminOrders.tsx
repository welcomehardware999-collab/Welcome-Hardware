import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Printer, 
  CheckCircle2, 
  ArrowRight, 
  QrCode, 
  Eye, 
  AlertCircle,
  RotateCcw,
  X
} from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../../lib/api';
import { Order } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';
import { InvoiceModal } from '../../components/common/InvoiceModal';

export const AdminOrders: React.FC = () => {
  const { currentRole } = useAdmin();
  const { storeSettings } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected order for detailed view & invoice modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  // Real-time order synchronization via SSE
  useEffect(() => {
    if (window.location.hostname.endsWith('github.io')) {
      return;
    }
    const eventSource = new EventSource('/api/events');
    eventSource.onerror = () => {
      eventSource.close();
    };

    eventSource.addEventListener('new_order', (e) => {
      try {
        const newOrder: Order = JSON.parse(e.data);
        setOrders(prev => {
          if (prev.some(o => o.id === newOrder.id)) return prev;
          return [newOrder, ...prev];
        });
      } catch (err) {
        console.error('Error parsing SSE new_order:', err);
      }
    });

    eventSource.addEventListener('order_updated', (e) => {
      try {
        const updated: Order = JSON.parse(e.data);
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        setSelectedOrder(prev => (prev && prev.id === updated.id ? updated : prev));
      } catch (err) {
        console.error('Error parsing SSE order_updated:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      const data = await fetchOrders(params);
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load admin orders:', err);
      setError(err.message || 'Failed to connect to order database. Please check server or retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus, `Status transitioned to ${newStatus} by ${currentRole}`);
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      o.pickupPin.includes(q)
    );
  });

  const statuses = [
    'All',
    'Order Placed',
    'Confirmed',
    'Preparing',
    'Ready for Pickup',
    'Collected',
    'Cancelled'
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Store Pickup Orders Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage, verify, and complete in-store customer collections at Welcome Hardware, Hospet
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search Order #, Name, PIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
              statusFilter === st
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={() => loadOrders()}
            className="px-3 py-1 bg-rose-600 text-white rounded font-bold hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Loading orders list...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <p className="font-bold text-slate-800 text-sm">No orders found matching criteria</p>
            <p>Try switching filter tabs or clearing the search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer & Phone</th>
                  <th className="py-3 px-4">PIN & Slot</th>
                  <th className="py-3 px-4">Items / Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    
                    {/* Order # */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div>{order.orderNumber}</div>
                      <span className="text-[10px] text-slate-400 font-sans font-normal block">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{order.customer.name}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{order.customer.phone}</div>
                      <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded uppercase font-semibold inline-block mt-0.5">
                        {order.customer.customerType}
                      </span>
                    </td>

                    {/* PIN & Slot */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block text-xs">
                        PIN: {order.pickupPin}
                      </div>
                      <div className="text-slate-500 text-[10px] mt-0.5 font-medium">
                        {order.pickupSlot}
                      </div>
                    </td>

                    {/* Items & Total */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-black text-slate-950 text-sm">
                        ₹{order.grandTotal.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.items.length} items ({order.paymentMethod})
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e: any) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border focus:outline-none ${
                          order.status === 'Collected'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.status === 'Ready for Pickup'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : order.status === 'Preparing'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Collected">Collected</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition inline-block"
                        title="View Full Order Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowInvoiceModal(true);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition inline-block"
                        title="Print GST Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && !showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase">Order Details</span>
                <h3 className="text-lg font-black text-slate-900">{selectedOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PIN & QR highlight */}
            <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  Customer Pickup PIN
                </span>
                <span className="text-3xl font-mono font-black text-amber-400">
                  {selectedOrder.pickupPin}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Status: <strong className="text-white">{selectedOrder.status}</strong>
                </p>
              </div>

              {selectedOrder.qrCodeDataUrl && (
                <img
                  src={selectedOrder.qrCodeDataUrl}
                  alt="QR"
                  className="w-20 h-20 bg-white rounded-lg p-1"
                />
              )}
            </div>

            {/* Customer Details */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-900 block">Customer Information</span>
              <p className="text-slate-700"><strong>Name:</strong> {selectedOrder.customer.name}</p>
              <p className="text-slate-700"><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
              <p className="text-slate-700"><strong>Trade:</strong> {selectedOrder.customer.customerType}</p>
              {selectedOrder.customer.businessName && (
                <p className="text-slate-700"><strong>Firm:</strong> {selectedOrder.customer.businessName}</p>
              )}
              {selectedOrder.notes && (
                <p className="text-amber-900 bg-amber-50 p-2 rounded mt-1">
                  <strong>Notes:</strong> {selectedOrder.notes}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Reserved Inventory Items:</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center bg-white">
                    <div>
                      <p className="font-bold text-slate-900">{it.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{it.brand} • SKU: {it.sku}</p>
                    </div>
                    <div className="text-right font-mono font-bold">
                      <p>{it.quantity} {it.unit}s</p>
                      <p className="text-slate-500 text-[11px]">₹{it.total.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print GST Tax Invoice</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedOrder && (
        <InvoiceModal
          order={selectedOrder}
          storeSettings={storeSettings}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

    </div>
  );
};
