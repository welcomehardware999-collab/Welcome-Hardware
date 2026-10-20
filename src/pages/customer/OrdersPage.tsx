import React, { useState, useEffect } from 'react';
import { 
  Package, 
  QrCode, 
  Search, 
  ArrowRight, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Phone
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { fetchOrders } from '../../lib/api';
import { Order } from '../../types';

interface OrdersPageProps {
  navigate: (path: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ navigate }) => {
  const { profile, storeSettings, orders: contextOrders } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchPhone, setSearchPhone] = useState(profile.phone || '');
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserOrders();
  }, [profile.phone]);

  const loadUserOrders = async () => {
    setLoading(true);
    try {
      const targetPhone = searchPhone.trim() || profile.phone?.trim();
      const params: Record<string, string> = {};
      if (targetPhone) params.phone = targetPhone;
      if (searchOrderNumber.trim()) params.search = searchOrderNumber.trim();
      const data = await fetchOrders(params);
      if (data && data.length > 0) {
        setOrders(data);
      } else if (!targetPhone && contextOrders && contextOrders.length > 0) {
        setOrders(contextOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      if (contextOrders && contextOrders.length > 0) {
        setOrders(contextOrders);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUserOrders();
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Ready for Pickup':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded-full text-xs">Ready for Pickup</span>;
      case 'Collected':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-1 rounded-full text-xs">Collected</span>;
      case 'Preparing':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 font-bold px-2.5 py-1 rounded-full text-xs">Packing at Store</span>;
      case 'Confirmed':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 font-bold px-2.5 py-1 rounded-full text-xs">Order Confirmed</span>;
      case 'Cancelled':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2.5 py-1 rounded-full text-xs">Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-300 font-bold px-2.5 py-1 rounded-full text-xs">Order Placed</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title & Phone Lookup */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            My Store Pickup Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track order status and access your 4-digit pickup PIN for collection at Hampi Road
          </p>
        </div>

        {/* Lookup by Phone */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <input
              type="tel"
              placeholder="Search by 10-digit mobile..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-2 rounded-lg font-bold transition"
          >
            Find
          </button>
        </form>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map(n => (
            <div key={n} className="h-36 bg-slate-100 rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No orders found for this mobile number</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Place an order online to reserve hardware materials for pickup from Welcome Hardware in Hospet.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2 rounded-lg"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="bg-white rounded-xl border border-slate-200 hover:border-amber-400 p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-black text-sm text-slate-950">{order.orderNumber}</span>
                  {getStatusBadge(order.status)}
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Customer: <strong className="text-slate-900">{order.customer.name}</strong></span>
                  <span>•</span>
                  <span>{order.items.length} items</span>
                  <span>•</span>
                  <span>Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-amber-900 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Pickup: {order.pickupSlot}</span>
                </div>
              </div>

              {/* Right Box: PIN + Action */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">Pickup PIN</span>
                  <span className="font-mono font-black text-lg text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-300">
                    {order.pickupPin}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900 block font-mono">
                    ₹{order.grandTotal.toLocaleString('en-IN')}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800">
                    <span>View QR Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
