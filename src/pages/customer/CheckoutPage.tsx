import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  ArrowLeft,
  AlertCircle,
  Copy,
  Check,
  Printer,
  FileText,
  Package,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CustomerType, PaymentMethod, Order } from '../../types';
import { createOrder } from '../../lib/api';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { LOGO_URL } from '../../lib/assets';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const { 
    cart, 
    clearCart, 
    cartSubtotal, 
    cartDiscount, 
    cartGst, 
    cartTotal, 
    profile, 
    updateProfile, 
    addPlacedOrder, 
    storeSettings 
  } = useStore();

  // Form state
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [email, setEmail] = useState(profile.email || '');
  const [customerType, setCustomerType] = useState<CustomerType>(profile.customerType || 'Contractor');
  const [businessName, setBusinessName] = useState(profile.businessName || '');
  const [gstNumber, setGstNumber] = useState(profile.gstNumber || '');
  const [pickupSlot, setPickupSlot] = useState('Today (Ready in 2-4 Hours)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pay at Store');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirmed Order state to display immediate Order Confirmation screen with Pickup PIN & QR
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMessage(null);

    // Validate phone
    const cleanPhone = phone.replace(/\D/g, '');
    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for pickup SMS/notification');
      return;
    }

    setSubmitting(true);

    try {
      // Save profile updates to context/localStorage
      updateProfile({
        name,
        phone: cleanPhone,
        email,
        customerType,
        businessName,
        gstNumber
      });

      const idempotencyKey = `ord-chk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const orderPayload = {
        customer: {
          name: name.trim(),
          phone: cleanPhone,
          email: email.trim() || undefined,
          customerType,
          businessName: businessName.trim() || undefined,
          gstNumber: gstNumber.trim() || undefined
        },
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedThickness: item.selectedThickness
        })),
        paymentMethod,
        pickupSlot,
        notes: notes.trim() || undefined,
        idempotencyKey
      };

      const placedOrder = await createOrder(orderPayload);
      clearCart();
      addPlacedOrder(placedOrder);
      setConfirmedOrder(placedOrder);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  // --- ORDER CONFIRMATION SCREEN ---
  if (confirmedOrder) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Success Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded inline-block">
                ORDER CONFIRMED & STOCK RESERVED
              </span>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-0.5">
                Order #{confirmedOrder.orderNumber} Placed Successfully
              </h1>
              <p className="text-xs text-emerald-100">
                Your materials are reserved in our Hospet store inventory for counter pickup.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-lg text-xs transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Tax Invoice</span>
            </button>
            <button
              onClick={() => navigate(`/orders/${confirmedOrder.id}`)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-white text-emerald-950 font-bold px-3.5 py-2 rounded-lg text-xs hover:bg-emerald-50 transition shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Order Details</span>
            </button>
          </div>
        </div>

        {/* Hero Pickup PIN & QR Verification Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* PIN Section */}
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={LOGO_URL}
                  alt="Welcome Hardware"
                  className="w-12 h-12 object-contain rounded-full shadow-md bg-white p-0.5 shrink-0"
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                    In-Store Pickup Pass
                  </h2>
                  <p className="text-xs text-amber-300 font-semibold">
                    Show this PIN at Welcome Hardware Hospet Dispatch Counter
                  </p>
                </div>
              </div>

              {/* Giant 4-Digit PIN */}
              <div className="bg-slate-900/95 rounded-2xl p-5 border-2 border-amber-500/60 inline-block shadow-lg">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest block">
                  Your 4-Digit Pickup PIN:
                </span>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="text-5xl sm:text-6xl font-mono font-black tracking-widest text-amber-400 select-all">
                    {confirmedOrder.pickupPin}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(confirmedOrder.pickupPin);
                      setCopiedPin(true);
                      setTimeout(() => setCopiedPin(false), 2000);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                    title="Copy PIN"
                  >
                    {copiedPin ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 mt-2 font-medium">
                  {copiedPin ? '✓ Copied PIN to clipboard!' : 'Single-use PIN verified by staff at material handover.'}
                </p>
              </div>

              {/* Counter Location */}
              <div className="pt-2 text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-white">{storeSettings.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Pickup Slot: <strong className="text-amber-300">{confirmedOrder.pickupSlot}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Helpline: <strong className="text-white">{storeSettings.phone}</strong></span>
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
              {confirmedOrder.qrCodeDataUrl ? (
                <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-amber-400/50">
                  <div className="flex items-center justify-center gap-1.5 pb-2 mb-2 border-b border-slate-100">
                    <img
                      src={LOGO_URL}
                      alt="Welcome Hardware"
                      className="w-5 h-5 object-contain rounded-full"
                    />
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-900">
                      Welcome Hardware
                    </span>
                  </div>
                  <img
                    src={confirmedOrder.qrCodeDataUrl}
                    alt={`Pickup QR Code #${confirmedOrder.orderNumber}`}
                    className="w-40 h-40 object-contain mx-auto"
                  />
                  <p className="text-[10px] text-slate-900 font-bold font-mono mt-1.5 uppercase">
                    Scan for Counter Handover
                  </p>
                </div>
              ) : (
                <div className="w-40 h-40 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                  <QrCode className="w-16 h-16" />
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Order Details & Summary */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Reserved Items Summary ({confirmedOrder.items.length})
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Payment: <strong className="text-slate-900">{confirmedOrder.paymentMethod}</strong> ({confirmedOrder.paymentStatus})
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-slate-500 text-[11px] font-mono">
                    SKU: {item.sku} {item.thickness ? `• ${item.thickness}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-600 block">{item.quantity} {item.unit} × ₹{item.finalPrice.toLocaleString('en-IN')}</span>
                  <span className="font-mono font-bold text-slate-900">₹{item.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="text-sm font-black text-slate-900 uppercase">Grand Total (Inclusive of GST)</span>
            <span className="text-xl font-mono font-black text-amber-700">
              ₹{confirmedOrder.grandTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={() => navigate('/orders')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition"
          >
            <Package className="w-4 h-4" />
            <span>Go to My Orders History</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-lg text-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Tax Invoice</span>
            </button>

            <button
              onClick={() => navigate('/shop')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs transition"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Modal for Printing */}
        {showInvoiceModal && (
          <InvoiceModal
            order={confirmedOrder}
            storeSettings={storeSettings}
            onClose={() => setShowInvoiceModal(false)}
          />
        )}
      </div>
    );
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <button
          onClick={() => navigate('/cart')}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Checkout & In-Store Pickup Reservation
          </h1>
          <p className="text-xs text-slate-500">
            Secure stock reservation • 4-digit pickup PIN generated immediately
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Details & Slot & Payment (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Pickup Location Confirmation */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Step 1: In-Store Pickup Counter</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">Welcome Hardware Hospet Counter</h4>
              <p className="text-slate-700 font-medium">{storeSettings.address}</p>
              <p className="text-slate-500 text-[11px]">Direct vehicular loading bay for autos, tempo & pickup trucks.</p>
              <div className="pt-2 flex items-center justify-between text-[11px] text-amber-900 font-semibold border-t border-slate-200/60 mt-2">
                <span>Timings: {storeSettings.openingHours}</span>
                <span>Helpline: {storeSettings.phone}</span>
              </div>
            </div>

            {/* Pickup Slot Selection */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Select Expected Pickup Time Window:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  'Today (Ready in 2-4 Hours)',
                  'Today Evening (4 PM - 7 PM)',
                  'Tomorrow Morning (10 AM - 1 PM)'
                ].map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setPickupSlot(slot)}
                    className={`p-2.5 rounded-lg border text-left font-medium transition ${
                      pickupSlot === slot
                        ? 'bg-amber-50 border-amber-600 text-amber-900 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="line-clamp-2">{slot}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Customer Contact & Trade Details */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>Step 2: Customer & Trade Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mobile Phone (10 digits) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9845112233"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">PIN & QR code will be tied to this number</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Customer / Trade Category
                </label>
                <select
                  value={customerType}
                  onChange={(e: any) => setCustomerType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Contractor">Civil / Interior Contractor</option>
                  <option value="Carpenter">Carpenter / Craftsman</option>
                  <option value="Builder">Builder / Real Estate Developer</option>
                  <option value="Architect">Architect / Interior Designer</option>
                  <option value="Retail Customer">Homeowner / Retail Customer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Firm / Business Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharma Woodworks Hospet"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  GSTIN for Tax Invoice (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 29AAAAA0000A1Z5"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 text-xs">
                Pickup Notes & Vehicle Details (Optional):
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Coming in Tata Ace auto at 4:30 PM. Please keep plywood bundles strapped."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
              />
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2.5">
              <Banknote className="w-4 h-4 text-amber-600" />
              <span>Step 3: Payment Preference</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                onClick={() => setPaymentMethod('Pay at Store')}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  paymentMethod === 'Pay at Store'
                    ? 'bg-amber-50/80 border-amber-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'Pay at Store'}
                  onChange={() => setPaymentMethod('Pay at Store')}
                  className="mt-1 text-amber-600"
                />
                <div>
                  <strong className="block text-slate-900 font-bold">Pay at Store Counter</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Pay via Cash, Card, or UPI directly when inspecting and picking up goods at the counter.
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    Recommended for Contractors
                  </span>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('UPI/Online')}
                className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                  paymentMethod === 'UPI/Online'
                    ? 'bg-amber-50/80 border-amber-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'UPI/Online'}
                  onChange={() => setPaymentMethod('UPI/Online')}
                  className="mt-1 text-amber-600"
                />
                <div>
                  <strong className="block text-slate-900 font-bold">UPI / Online Advance</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Pre-pay using GPay, PhonePe, Paytm, or Net Banking for instant express counter release.
                  </p>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Summary Box (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-xs space-y-4 sticky top-24">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight border-b border-slate-200 pb-3">
              Items to be Reserved ({cart.length})
            </h3>

            {/* Mini item list */}
            <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100 text-xs">
              {cart.map(item => (
                <div key={item.productId} className="pt-2 first:pt-0 flex justify-between items-center gap-2">
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-[10px] text-slate-400">Qty: {item.quantity} {item.product.unit}s</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    ₹{(item.product.finalPrice * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Trade Discount:</span>
                  <span className="font-mono font-bold">-₹{cartDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>GST (18% included):</span>
                <span className="font-mono">₹{cartGst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-amber-800 font-semibold">
                <span>Store Pickup:</span>
                <span className="font-mono">FREE (Hospet Store)</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline text-slate-950 font-black">
                <span className="text-sm">Grand Total:</span>
                <span className="text-2xl text-amber-700 font-mono">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Final Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              id="confirm-pickup-order-btn"
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-900/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <span>Reserving Stock & Generating PIN...</span>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>Confirm Order & Generate Pickup PIN</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-500 space-y-1 pt-1">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Physical stock is immediately reserved in Hospet</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Show 4-digit PIN at counter to collect items</span>
              </p>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
