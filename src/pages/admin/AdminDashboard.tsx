import React, { useState, useEffect } from 'react';
import { 
  Package, 
  QrCode, 
  IndianRupee, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Printer, 
  Layers, 
  Search, 
  ShieldCheck,
  TrendingUp,
  Boxes,
  Plus
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';
import { fetchOrders, fetchProducts, updateOrderStatus } from '../../lib/api';
import { Order, Product } from '../../types';
import { InvoiceModal } from '../../components/common/InvoiceModal';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { currentRole, verifyPickupPin } = useAdmin();
  const { storeSettings } = useStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fast PIN Verification Box state
  const [quickPin, setQuickPin] = useState('');
  const [verificationResult, setVerificationResult] = useState<{ success: boolean; message: string; order?: Order } | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Invoice Modal
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allOrders, allProducts] = await Promise.all([
        fetchOrders(),
        fetchProducts()
      ]);
      setOrders(allOrders);
      setProducts(allProducts);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPin.trim()) return;
    setVerifying(true);
    try {
      const result = await verifyPickupPin(quickPin.trim());
      setVerificationResult(result);
      if (result.success) {
        setQuickPin('');
        loadData(); // Refresh orders state
      }
    } catch (err: any) {
      setVerificationResult({ success: false, message: err.message || 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const handleQuickStatusAdvance = async (orderId: string, nextStatus: Order['status']) => {
    try {
      const updated = await updateOrderStatus(orderId, nextStatus, `Advanced to ${nextStatus} from Dashboard by ${currentRole}`);
      setOrders(orders.map(o => o.id === orderId ? updated : o));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // KPI Calculations
  const pendingOrders = orders.filter(o => o.status !== 'Collected' && o.status !== 'Cancelled');
  const readyOrders = orders.filter(o => o.status === 'Ready for Pickup');
  const collectedToday = orders.filter(o => o.status === 'Collected');
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const lowStockProducts = products.filter(p => p.availableStock <= p.lowStockThreshold);
  const totalReservedUnits = products.reduce((sum, p) => sum + p.reservedStock, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src="/welcome-hardware-logo.svg"
            alt="Welcome Hardware"
            className="w-14 h-14 object-contain rounded-full shadow-xs border border-slate-200 p-0.5 shrink-0 bg-white"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                Store Operations Dashboard
              </h1>
              <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {currentRole} Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Physical Store: {storeSettings.name}, {storeSettings.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/verify')}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <QrCode className="w-4 h-4" />
            <span>Counter PIN Scanner</span>
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs uppercase tracking-wide"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Product Catalogue</span>
          </button>
          <button
            onClick={() => navigate('/admin/inventory')}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <Boxes className="w-4 h-4" />
            <span>Manage Stock</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pending Pickups */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Pickups
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {pendingOrders.length}
            </span>
            <span className="text-[11px] text-amber-700 block font-semibold">
              {readyOrders.length} ready at counter
            </span>
          </div>
        </div>

        {/* Total In-Store Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Order Volume
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {orders.length} total store orders
            </span>
          </div>
        </div>

        {/* Reserved Stock Units */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Reserved in Warehouse
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {totalReservedUnits}
            </span>
            <span className="text-[11px] text-blue-700 block font-semibold">
              Allocated to pickups
            </span>
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Low Stock Alerts
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-rose-600">
              {lowStockProducts.length}
            </span>
            <span className="text-[11px] text-rose-700 block font-semibold">
              Below reorder threshold
            </span>
          </div>
        </div>

      </div>

      {/* FAST 4-DIGIT PIN VERIFICATION BOX */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-black uppercase tracking-tight text-white">
                Fast Counter 4-Digit Pickup PIN Verification
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Customer arrived at counter? Enter their 4-digit PIN to release items and deduct physical stock.
            </p>
          </div>

          <form onSubmit={handleQuickPinSubmit} className="flex gap-2 max-w-sm w-full">
            <input
              type="text"
              maxLength={4}
              placeholder="e.g. 8421"
              value={quickPin}
              onChange={(e) => setQuickPin(e.target.value.replace(/\D/g, ''))}
              className="w-32 text-center text-xl font-mono font-black tracking-widest bg-slate-950 border-2 border-amber-500 rounded-xl text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={verifying || quickPin.length !== 4}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {verifying ? 'Checking...' : 'Verify & Handover'}
            </button>
          </form>
        </div>

        {/* Instant Verification Feedback Banner */}
        {verificationResult && (
          <div className={`mt-4 p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            verificationResult.success
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500 text-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {verificationResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{verificationResult.message}</span>
            </div>

            {verificationResult.order && (
              <button
                onClick={() => setSelectedInvoiceOrder(verificationResult.order!)}
                className="bg-white text-slate-900 text-xs font-bold px-2.5 py-1 rounded transition hover:bg-slate-100"
              >
                Print Receipt
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid: Active Pickup Queue (7 Cols) + Low Stock Alert (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Active Store Orders Queue (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Active Store Orders Queue
              </h3>
            </div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 space-y-3">
            {pendingOrders.slice(0, 5).map(order => (
              <div key={order.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-950">{order.orderNumber}</span>
                    <span className="font-mono font-black text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      PIN: {order.pickupPin}
                    </span>
                    <span className="text-[10px] text-slate-400">{order.pickupSlot}</span>
                  </div>
                  <p className="font-bold text-slate-900">
                    {order.customer.name} <span className="text-[11px] font-normal text-slate-500">({order.customer.phone})</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {order.items.length} items • ₹{order.grandTotal.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Quick Advance Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {order.status === 'Order Placed' && (
                    <button
                      onClick={() => handleQuickStatusAdvance(order.id, 'Confirmed')}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold"
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.status === 'Confirmed' && (
                    <button
                      onClick={() => handleQuickStatusAdvance(order.id, 'Preparing')}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold"
                    >
                      Mark Staging
                    </button>
                  )}
                  {order.status === 'Preparing' && (
                    <button
                      onClick={() => handleQuickStatusAdvance(order.id, 'Ready for Pickup')}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold"
                    >
                      Ready at Counter
                    </button>
                  )}
                  {order.status === 'Ready for Pickup' && (
                    <button
                      onClick={() => handleQuickStatusAdvance(order.id, 'Collected')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold"
                    >
                      Handover Complete
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    title="Print Tax Invoice"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Warning Table (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Low Physical Stock Warning
              </h3>
            </div>
            <button
              onClick={() => navigate('/admin/inventory')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              Restock All
            </button>
          </div>

          <div className="divide-y divide-slate-100 space-y-2.5 text-xs">
            {lowStockProducts.length === 0 ? (
              <p className="text-slate-400 py-4 text-center text-xs">
                All physical warehouse stocks are healthy!
              </p>
            ) : (
              lowStockProducts.slice(0, 6).map(prod => (
                <div key={prod.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">SKU: {prod.sku} • {prod.brand}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-rose-600 font-mono block">
                      {prod.availableStock} {prod.unit}s left
                    </span>
                    <button
                      onClick={() => navigate('/admin/inventory')}
                      className="text-[10px] text-amber-700 font-bold hover:underline"
                    >
                      + Add Stock
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          storeSettings={storeSettings}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

    </div>
  );
};
