import React, { useState } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Phone, 
  Package, 
  Printer, 
  ArrowRight, 
  RotateCcw,
  Check,
  Truck,
  FileCheck
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';
import { Order } from '../../types';
import { InvoiceModal } from '../../components/common/InvoiceModal';

export const AdminPickupVerify: React.FC = () => {
  const { verifyPickupPin, currentRole } = useAdmin();
  const { storeSettings } = useStore();

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setPin('');
      setErrorMsg(null);
    } else if (val === 'DEL') {
      setPin(pin.slice(0, -1));
    } else if (pin.length < 4) {
      setPin(pin + val);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      setErrorMsg('Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await verifyPickupPin(pin);
      if (result.success && result.order) {
        setVerifiedOrder(result.order);
        setSuccessMsg(result.message);
        // Pre-check all items
        const initialCheck: Record<string, boolean> = {};
        result.order.items.forEach(it => {
          initialCheck[it.productId] = true;
        });
        setCheckedItems(initialCheck);
      } else {
        setErrorMsg(result.message);
        setVerifiedOrder(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
      setVerifiedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItemCheck = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleReset = () => {
    setPin('');
    setVerifiedOrder(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Counter Handover & PIN Terminal
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operator: <strong className="text-slate-800">{currentRole} Terminal</strong> • Welcome Hardware, Hospet
          </p>
        </div>

        {verifiedOrder && (
          <button
            onClick={handleReset}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Next Customer</span>
          </button>
        )}
      </div>

      {!verifiedOrder ? (
        /* PIN Entry Keypad Card */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 max-w-md mx-auto space-y-6">
          
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Enter Customer's 4-Digit Pickup PIN
            </span>
            <div className="h-16 flex items-center justify-center bg-slate-950 rounded-2xl border-2 border-amber-500 shadow-inner">
              <span className="text-4xl font-mono font-black tracking-widest text-amber-400">
                {pin ? pin.padEnd(4, '•') : '••••'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Obtained from customer's phone pass or invoice
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Touch-Screen Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map(k => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeypadPress(k)}
                className={`py-3.5 text-lg font-bold rounded-xl border transition active:scale-95 ${
                  k === 'C'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 font-mono text-sm'
                    : k === 'DEL'
                    ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 font-mono text-xs'
                    : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50 shadow-xs'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={loading || pin.length !== 4}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : 'Verify PIN & Load Order Details'}
          </button>

        </div>
      ) : (
        /* Order Verified & Handover Verification Checklist Card */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          
          {/* Status Header */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="block text-sm">PIN Verified Successfully!</span>
                <span className="text-[11px] text-emerald-700 font-normal">Physical stock has been deducted from warehouse inventory.</span>
              </div>
            </div>

            <button
              onClick={() => setShowInvoice(true)}
              className="bg-emerald-800 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tax Invoice</span>
            </button>
          </div>

          {/* Customer & Order Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Order Number</span>
              <span className="font-mono font-black text-base text-slate-950">{verifiedOrder.orderNumber}</span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Customer Info</span>
              <span className="font-bold text-slate-900 block">{verifiedOrder.customer.name}</span>
              <span className="text-slate-500 text-[11px]">{verifiedOrder.customer.phone} • {verifiedOrder.customer.customerType}</span>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Payment & Total</span>
              <span className="font-mono font-black text-slate-950 block">₹{verifiedOrder.grandTotal.toLocaleString('en-IN')}</span>
              <span className="text-emerald-700 font-bold text-[11px]">{verifiedOrder.paymentMethod} ({verifiedOrder.paymentStatus})</span>
            </div>
          </div>

          {/* Physical Items Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Physical Handover Checklist ({verifiedOrder.items.length} Items)
              </h3>
              <span className="text-[11px] text-slate-500">
                Check off items as they are loaded into vehicle
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-xs">
              {verifiedOrder.items.map(item => (
                <label
                  key={item.productId}
                  onClick={() => handleToggleItemCheck(item.productId)}
                  className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer transition ${
                    checkedItems[item.productId] ? 'bg-emerald-50/50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!checkedItems[item.productId]}
                      onChange={() => {}}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {item.brand} • SKU: {item.sku}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-sm text-slate-900">
                      {item.quantity} {item.unit}s
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Complete Dispatch Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>Vehicle loading complete at Hampi Road bay</span>
            </div>

            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md"
            >
              Finish & Clear Terminal
            </button>
          </div>

        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && verifiedOrder && (
        <InvoiceModal
          order={verifiedOrder}
          storeSettings={storeSettings}
          onClose={() => setShowInvoice(false)}
        />
      )}

    </div>
  );
};
