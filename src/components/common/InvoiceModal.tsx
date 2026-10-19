import React from 'react';
import { Printer, X, CheckCircle2, MapPin, Phone } from 'lucide-react';
import { Order, StoreSettings } from '../../types';

interface InvoiceModalProps {
  order: Order;
  storeSettings: StoreSettings;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, storeSettings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = `INV-${order.orderNumber.replace('WH-', '')}-${new Date(order.createdAt).getFullYear()}`;
  const cgst = Math.round(order.gstTotal / 2);
  const sgst = Math.round(order.gstTotal / 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:my-0 print:shadow-none print:border-none">
        
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span>Tax Invoice / Cash Memo</span>
            <span className="text-amber-400 font-mono">#{invoiceNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="print-invoice-action-btn"
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded text-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 text-slate-900 text-xs leading-normal" id="printable-invoice">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div className="space-y-1 max-w-sm">
              <div className="flex items-center gap-3">
                <img 
                  src={storeSettings.logoUrl || "/welcome-hardware-logo.svg"} 
                  alt="Welcome Hardware" 
                  className="w-14 h-14 object-contain rounded-full border border-slate-200 p-0.5 shadow-xs shrink-0 bg-white"
                />
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-950">
                    Welcome Hardware
                  </h1>
                  <p className="text-[10px] font-bold text-amber-700 tracking-wider uppercase">
                    Timber, Plywood & Architectural Fittings
                  </p>
                </div>
              </div>
              <div className="pt-2 text-[11px] text-slate-600 space-y-0.5">
                <p className="font-semibold text-slate-900">{storeSettings.address}</p>
                <p>Phone: <strong className="text-slate-900">{storeSettings.phone}</strong> | Email: {storeSettings.email}</p>
                <p>GSTIN: <span className="font-mono font-bold">29AAEFH9986F1ZM</span> | State: Karnataka (29)</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded uppercase">
                TAX INVOICE
              </span>
              <p className="text-[11px] pt-1"><span className="text-slate-500">Invoice No:</span> <strong className="font-mono">{invoiceNumber}</strong></p>
              <p className="text-[11px]"><span className="text-slate-500">Order No:</span> <strong className="font-mono">{order.orderNumber}</strong></p>
              <p className="text-[11px]"><span className="text-slate-500">Date:</span> {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p className="text-[11px]"><span className="text-slate-500">Pickup Slot:</span> <strong className="text-amber-800">{order.pickupSlot}</strong></p>
            </div>
          </div>

          {/* Billed To / Pickup Verification Section */}
          <div className="grid grid-cols-2 gap-6 py-4 border-b border-slate-200">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Customer Details</p>
              <p className="font-bold text-sm text-slate-900">{order.customer.name}</p>
              {order.customer.businessName && (
                <p className="text-[11px] font-semibold text-slate-700">{order.customer.businessName}</p>
              )}
              <p className="text-[11px] text-slate-600">Phone: {order.customer.phone}</p>
              {order.customer.email && <p className="text-[11px] text-slate-600">Email: {order.customer.email}</p>}
              <span className="inline-block mt-1 text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                Trade Type: {order.customer.customerType}
              </span>
            </div>

            {/* Store Pickup & Dispatch Instructions (No Pickup PIN or QR secret on printed invoice) */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200">
                  <p className="text-[10px] font-black uppercase text-slate-900 tracking-wider">Physical Store Pickup</p>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Pickup Only
                  </span>
                </div>
                <p className="text-[11px] text-slate-700">
                  <span className="font-semibold text-slate-900">Collection Bay:</span> Welcome Hardware Store Counter
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Near Theosophical Women's College, Hampi Road, Hosapete
                </p>
                <p className="text-[10px] text-slate-600 mt-1">
                  <span className="font-semibold text-slate-800">Scheduled Slot:</span> {order.pickupSlot || 'Ready for pickup in 2-4 hours'}
                </p>
              </div>
              <p className="text-[9px] text-slate-500 pt-1.5 mt-1 border-t border-slate-200/80">
                Please present this invoice copy or your order number at the dispatch counter for material loading.
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-4">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-700">
                  <th className="py-2 px-2 text-center w-8">#</th>
                  <th className="py-2 px-2">Item Description</th>
                  <th className="py-2 px-2">SKU / Specs</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Rate</th>
                  <th className="py-2 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-2">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.brand}</p>
                    </td>
                    <td className="py-2 px-2 text-slate-600">
                      <span className="font-mono text-[10px]">{item.sku}</span>
                      {item.thickness && <span className="block text-[10px]">{item.thickness}</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-bold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      ₹{item.finalPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-2 text-right font-bold font-mono">
                      ₹{item.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="mt-6 border-t-2 border-slate-900 pt-3 flex justify-between items-start">
            <div className="max-w-xs text-[10px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Terms & Conditions:</p>
              <p>1. Goods once sold can only be replaced for manufacturing defects within 7 days with original invoice.</p>
              <p>2. Subject to Hospet jurisdiction only.</p>
              <p className="pt-2 font-mono text-[9px] text-slate-400">Payment Method: {order.paymentMethod} | Status: {order.paymentStatus}</p>
            </div>

            <div className="w-64 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Discount:</span>
                  <span className="font-mono">-₹{order.discountTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>CGST (9%):</span>
                <span className="font-mono">₹{cgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST (9%):</span>
                <span className="font-mono">₹{sgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 border-t border-slate-300 pt-1.5">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-amber-700">₹{order.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Signature & Pickup Stamp */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end text-center">
            <div className="text-[10px] text-slate-400">
              <p>Computer Generated Tax Invoice</p>
              <p>Welcome Hardware Hospet Store</p>
            </div>
            <div>
              <p className="font-bold text-xs text-slate-800">For Welcome Hardware</p>
              <div className="h-10"></div>
              <p className="text-[10px] text-slate-500 border-t border-slate-300 pt-1 px-4">Authorized Counter Signatory</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
