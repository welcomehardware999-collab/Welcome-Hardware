import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Clock, 
  Printer, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  QrCode,
  Package,
  FileText
} from 'lucide-react';
import { fetchOrderById } from '../../lib/api';
import { Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import { InvoiceModal } from '../../components/common/InvoiceModal';

interface OrderDetailPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId, navigate }) => {
  const { storeSettings } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedPin, setCopiedPin] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
        <button
          onClick={() => navigate('/orders')}
          className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const handleCopyPin = () => {
    navigator.clipboard.writeText(order.pickupPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const getStatusStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'Order Placed': return 0;
      case 'Confirmed': return 1;
      case 'Preparing': return 2;
      case 'Ready for Pickup': return 3;
      case 'Collected': return 4;
      default: return 0;
    }
  };

  const steps = [
    { title: 'Order Placed', desc: 'Stock reserved in warehouse' },
    { title: 'Confirmed', desc: 'Accepted by Hospet staff' },
    { title: 'Preparing', desc: 'Packed & staged at bay' },
    { title: 'Ready for Pickup', desc: 'Awaiting your arrival' },
    { title: 'Collected', desc: 'Items handed over' }
  ];

  const currentStepIdx = getStatusStepIndex(order.status);
  const isCancelled = order.status === 'Cancelled';
  const isCollected = order.status === 'Collected';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Bar with Back & Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInvoiceModal(true)}
            id="view-invoice-btn"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Tax Invoice</span>
          </button>

          <a
            href={`tel:${storeSettings.phone}`}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition"
          >
            <Phone className="w-3.5 h-3.5 fill-slate-950" />
            <span>Call Store: {storeSettings.phone}</span>
          </a>
        </div>
      </div>

      {/* Hero Pickup Pass Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Order Info & PIN */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded">
                ORDER #{order.orderNumber}
              </span>
              <span className="text-xs text-slate-400">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <img
                src="/welcome-hardware-logo.svg"
                alt="Welcome Hardware"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-full shadow-md bg-white p-0.5 shrink-0"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                  In-Store Pickup Pass
                </h1>
                <p className="text-xs text-slate-300">
                  Welcome Hardware Counter • Hampi Road, Hospet
                </p>
              </div>
            </div>

            {/* Huge 4-Digit PIN */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-amber-500/40 inline-block">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Your 4-Digit Pickup PIN:
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-amber-400">
                  {order.pickupPin}
                </span>
                <button
                  onClick={handleCopyPin}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Copy PIN"
                >
                  {copiedPin ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {isCollected ? '✓ PIN Verified & Items Collected' : 'Valid for single counter handover'}
              </p>
            </div>

            {/* Store Location */}
            <div className="pt-2 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold text-white">{storeSettings.address}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Pickup Slot: <strong className="text-amber-300">{order.pickupSlot}</strong></span>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
            {order.qrCodeDataUrl ? (
              <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-amber-400/50">
                <div className="flex items-center justify-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
                  <img
                    src="/welcome-hardware-logo.svg"
                    alt="Welcome Hardware"
                    className="w-5 h-5 object-contain rounded-full"
                  />
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-900">
                    Welcome Hardware
                  </span>
                </div>
                <img
                  src={order.qrCodeDataUrl}
                  alt={`Pickup QR Code #${order.orderNumber}`}
                  className="w-40 h-40 object-contain mx-auto"
                />
                <p className="text-[10px] text-slate-900 font-bold font-mono mt-1.5 uppercase">
                  Scan at Counter
                </p>
              </div>
            ) : (
              <div className="w-44 h-44 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
                No QR Generated
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-2 max-w-[200px]">
              Counter staff will scan this to verify your reservation instantly.
            </p>
          </div>

        </div>
      </div>

      {/* Step Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
            Live Order & Staging Progress
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div
                  key={step.title}
                  className={`p-3 rounded-xl border transition ${
                    isCurrent
                      ? 'bg-amber-50 border-amber-500 shadow-xs'
                      : isPast
                      ? 'bg-slate-50 border-emerald-300'
                      : 'bg-white border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isPast
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-amber-600 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isPast ? '✓' : idx + 1}
                    </span>
                    <span className="font-bold text-xs text-slate-900">{step.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 pl-8">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Timeline notes */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block text-[11px] uppercase">Activity Log:</span>
              {order.timeline.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px]">
                  <span>• {t.note}</span>
                  <span className="text-slate-400">
                    {new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Items & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Items List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight border-b border-slate-100 pb-2.5">
            Reserved Items ({order.items.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || '/welcome-hardware-logo.svg'}
                    alt={item.name}
                    className="w-12 h-12 rounded object-contain bg-slate-50 border p-1"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                    <p className="text-[10px] text-slate-500">{item.brand} • SKU: {item.sku}</p>
                    <p className="text-[10px] text-slate-600">
                      Qty: <strong>{item.quantity} {item.unit}s</strong> @ ₹{item.finalPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-slate-950">
                    ₹{item.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financials & Payment Details (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight border-b border-slate-200 pb-2">
              Payment & Invoicing Summary
            </h3>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Discount:</span>
                  <span className="font-mono font-bold">-₹{order.discountTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Included GST (18%):</span>
                <span className="font-mono">₹{order.gstTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline text-slate-950 font-black">
                <span className="text-xs uppercase">Grand Total:</span>
                <span className="text-xl text-amber-700 font-mono">₹{order.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-bold text-slate-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className={`font-bold ${order.paymentStatus === 'Paid Online' || order.paymentStatus === 'Paid at Store' ? 'text-emerald-700' : 'text-amber-800'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowInvoiceModal(true)}
              className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download / Print GST Invoice</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
            <strong className="block font-bold">Physical Counter Information:</strong>
            <p className="text-[11px] text-slate-700">
              Welcome Hardware, Hampi Road, Hospet-Vijayanagar. Phone: <strong>{storeSettings.phone}</strong>.
            </p>
          </div>
        </div>

      </div>

      {/* Tax Invoice Modal */}
      {showInvoiceModal && (
        <InvoiceModal
          order={order}
          storeSettings={storeSettings}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

    </div>
  );
};
