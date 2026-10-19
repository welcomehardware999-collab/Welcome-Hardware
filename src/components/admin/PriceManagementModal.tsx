import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  History, 
  Percent, 
  AlertTriangle, 
  ShieldAlert, 
  Check, 
  X, 
  ArrowRight, 
  Clock, 
  User, 
  Filter, 
  Sparkles,
  TrendingUp,
  Layers
} from 'lucide-react';
import { Product, PriceHistoryEntry, Role } from '../../types';
import { updateProductPrice, bulkUpdateProductPrices, fetchPriceHistory } from '../../lib/api';
import { useAdmin } from '../../context/AdminContext';
import { CATEGORIES } from '../../data/mockData';

interface PriceManagementModalProps {
  product: Product | null;
  allProducts: Product[];
  initialTab?: 'edit' | 'history' | 'bulk';
  onClose: () => void;
  onProductUpdated: (updated: Product) => void;
  onBulkUpdated: (updatedList: Product[]) => void;
}

export const PriceManagementModal: React.FC<PriceManagementModalProps> = ({
  product,
  allProducts,
  initialTab = 'edit',
  onClose,
  onProductUpdated,
  onBulkUpdated
}) => {
  const { currentRole, user, canChangePrices } = useAdmin();
  const [activeTab, setActiveTab] = useState<'edit' | 'history' | 'bulk'>(product ? initialTab : 'bulk');

  // Single Product Edit State
  const [selectedProductId, setSelectedProductId] = useState<string>(product?.id || allProducts[0]?.id || '');
  const targetProduct = allProducts.find(p => p.id === selectedProductId) || product || allProducts[0];

  const [newPrice, setNewPrice] = useState<number>(targetProduct?.price || 0);
  const [discount, setDiscount] = useState<number>(targetProduct?.discount || 0);
  const [gstRate, setGstRate] = useState<number>(targetProduct?.gstRate || 18);
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Confirmation modal for single price change
  const [showConfirmSingle, setShowConfirmSingle] = useState(false);

  // History State
  const [historyList, setHistoryList] = useState<PriceHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFilterProduct, setHistoryFilterProduct] = useState<string>(product?.id || 'all');

  // Bulk Adjustment State
  const [bulkCategory, setBulkCategory] = useState<string>('All');
  const [bulkPercent, setBulkPercent] = useState<number>(5);
  const [bulkDirection, setBulkDirection] = useState<'increase' | 'decrease'>('increase');
  const [bulkReason, setBulkReason] = useState<string>('Periodic supplier catalog revision');
  const [showConfirmBulk, setShowConfirmBulk] = useState(false);

  // Sync state when selected product changes
  useEffect(() => {
    if (targetProduct) {
      setNewPrice(targetProduct.price);
      setDiscount(targetProduct.discount);
      setGstRate(targetProduct.gstRate || 18);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [selectedProductId, targetProduct?.price, targetProduct?.discount, targetProduct?.gstRate]);

  // Load Price History
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, historyFilterProduct]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const pid = historyFilterProduct === 'all' ? undefined : historyFilterProduct;
      const data = await fetchPriceHistory(pid);
      setHistoryList(data);
    } catch (err) {
      console.error('Failed to load price history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Calculations for Single Product
  const currentSellingPrice = targetProduct ? targetProduct.finalPrice : 0;
  const calculatedFinalPrice = Math.round(newPrice - (newPrice * discount) / 100);
  const priceDiff = targetProduct ? newPrice - targetProduct.price : 0;
  const finalPriceDiff = targetProduct ? calculatedFinalPrice - targetProduct.finalPrice : 0;

  // Single Save Handler
  const handleSingleSave = async () => {
    if (!canChangePrices) {
      setErrorMsg('Permission denied. Only Store Owner or Store Manager can update product prices.');
      return;
    }

    if (newPrice <= 0) {
      setErrorMsg('New price must be greater than zero.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await updateProductPrice(targetProduct.id, {
        price: newPrice,
        discount,
        gstRate,
        reason: reason.trim() || 'Direct price adjustment'
      });

      onProductUpdated(res.product);
      setSuccessMsg(`Price for ${res.product.name} successfully updated to ₹${res.product.finalPrice.toLocaleString('en-IN')}`);
      setShowConfirmSingle(false);
      setReason('');
      
      // Auto switch or refresh history
      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      console.error('Failed to update price:', err);
      setErrorMsg(err.message || 'Failed to update price');
      setShowConfirmSingle(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk preview items
  const bulkCandidateProducts = allProducts.filter(p => {
    if (bulkCategory === 'All') return true;
    return p.category === bulkCategory;
  });

  const previewBulkList = bulkCandidateProducts.map(p => {
    const factor = bulkDirection === 'increase' ? (1 + bulkPercent / 100) : (1 - bulkPercent / 100);
    const proposedRaw = Math.round(p.price * factor);
    const proposedFinal = Math.round(proposedRaw - (proposedRaw * p.discount) / 100);
    return {
      product: p,
      currentPrice: p.price,
      proposedPrice: proposedRaw,
      currentFinal: p.finalPrice,
      proposedFinal,
      diff: proposedRaw - p.price
    };
  });

  // Bulk Apply Handler
  const handleApplyBulk = async () => {
    if (!canChangePrices) {
      setErrorMsg('Permission denied. Only Store Owner or Store Manager can update product prices.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = previewBulkList.map(item => ({
        productId: item.product.id,
        price: item.proposedPrice,
        reason: `${bulkDirection === 'increase' ? '+' : '-'}${bulkPercent}% ${bulkCategory} batch revision: ${bulkReason}`
      }));

      const res = await bulkUpdateProductPrices(payload);
      onBulkUpdated(res.products);
      setSuccessMsg(`Successfully updated prices for ${res.updatedCount} products.`);
      setShowConfirmBulk(false);
    } catch (err: any) {
      console.error('Bulk price error:', err);
      setErrorMsg(err.message || 'Failed to apply bulk price update');
      setShowConfirmBulk(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight uppercase">
                Product Price Management
              </h2>
              <p className="text-xs text-slate-400">
                Live Price Control • Strict Role Access • Comprehensive Audit Log
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Banner if Staff */}
        {!canChangePrices && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center gap-3 text-xs text-rose-800">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Permission Denied:</strong> Logged in as <strong className="uppercase">{currentRole}</strong>. Only <strong>Store Owner</strong> or <strong>Store Manager</strong> can modify product prices. View-only access granted.
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-2">
          <button
            onClick={() => setActiveTab('edit')}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === 'edit'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Edit Individual Price</span>
          </button>

          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === 'bulk'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Bulk / Category Revision</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === 'history'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History & Logs</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: EDIT INDIVIDUAL PRICE */}
          {activeTab === 'edit' && targetProduct && (
            <div className="space-y-6">
              
              {/* Product Selector Dropdown if multiple products available */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Product to Reprice
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-medium focus:ring-2 focus:ring-amber-500"
                >
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku}) — ₹{p.finalPrice} / {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Card Overview */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={targetProduct.images[0] || '/welcome-hardware-logo.svg'}
                    alt={targetProduct.name}
                    className="w-14 h-14 rounded-lg object-contain bg-white border border-slate-200 p-1 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{targetProduct.name}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>SKU: <strong className="text-slate-700">{targetProduct.sku}</strong></span>
                      <span>•</span>
                      <span>Unit: <strong className="text-slate-700">{targetProduct.unit}</strong></span>
                      <span>•</span>
                      <span>Brand: <strong className="text-slate-700">{targetProduct.brand}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:text-right w-full sm:w-auto bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Selling Price</span>
                  <span className="text-lg font-black font-mono text-slate-900">
                    ₹{targetProduct.finalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    (Base: ₹{targetProduct.price} • Disc: {targetProduct.discount}%)
                  </span>
                </div>
              </div>

              {/* Edit Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Field: Base Price */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Base Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      disabled={!canChangePrices}
                      value={newPrice}
                      onChange={(e) => setNewPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono font-bold text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Catalog rate per {targetProduct.unit}
                  </span>
                </div>

                {/* Field: Discount % */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trade Discount (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="90"
                      step="1"
                      disabled={!canChangePrices}
                      value={discount}
                      onChange={(e) => setDiscount(Math.min(90, Math.max(0, Number(e.target.value))))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono font-bold text-sm focus:bg-white focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 text-xs font-bold">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Deducted from base price
                  </span>
                </div>

                {/* Field: GST % */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GST Rate
                  </label>
                  <select
                    disabled={!canChangePrices}
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-medium text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST (Standard)</option>
                    <option value={28}>28% GST</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Applicable tax bracket
                  </span>
                </div>

              </div>

              {/* Live Preview Calculation Box */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Calculated Final Selling Price:</span>
                  <div className="flex items-center gap-2">
                    {finalPriceDiff !== 0 && (
                      <span className="text-xs line-through text-slate-400 font-mono">
                        ₹{targetProduct.finalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="text-lg font-black font-mono text-amber-900">
                      ₹{calculatedFinalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500">/ {targetProduct.unit}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-amber-200/60 text-slate-600">
                  <span>Price Variance:</span>
                  <span className={`font-mono font-bold ${
                    finalPriceDiff > 0 ? 'text-emerald-700' : finalPriceDiff < 0 ? 'text-rose-700' : 'text-slate-500'
                  }`}>
                    {finalPriceDiff > 0 ? `+₹${finalPriceDiff}` : finalPriceDiff < 0 ? `-₹${Math.abs(finalPriceDiff)}` : 'No Change'} ({targetProduct.finalPrice > 0 ? ((finalPriceDiff / targetProduct.finalPrice) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>

              {/* Change Reason Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Price Revision (Audit Note)
                </label>
                <input
                  type="text"
                  disabled={!canChangePrices}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Raw material rate revision, Timber supplier rate hike, Festive promotion"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canChangePrices || submitting || (newPrice === targetProduct.price && discount === targetProduct.discount && gstRate === targetProduct.gstRate)}
                  onClick={() => setShowConfirmSingle(true)}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Review & Save Price</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: BULK / CATEGORY ADJUSTMENT */}
          {activeTab === 'bulk' && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wide text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>Category or Bulk Percentage Revision</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Quickly apply a percentage adjustment across an entire hardware category (e.g. plywood rate increases or seasonal hardware discounts).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Category</label>
                    <select
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-medium"
                    >
                      <option value="All">All Categories ({allProducts.length} Items)</option>
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Adjustment Type</label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-200 p-1 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setBulkDirection('increase')}
                        className={`py-1 rounded-lg transition ${bulkDirection === 'increase' ? 'bg-emerald-600 text-white' : 'text-slate-700'}`}
                      >
                        + Increase
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkDirection('decrease')}
                        className={`py-1 rounded-lg transition ${bulkDirection === 'decrease' ? 'bg-rose-600 text-white' : 'text-slate-700'}`}
                      >
                        - Discount
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Percentage (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={bulkPercent}
                        onChange={(e) => setBulkPercent(Math.max(1, Math.min(50, Number(e.target.value))))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-mono font-bold"
                      />
                      <span className="absolute right-3 top-2 text-slate-400 text-xs font-bold">%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Audit Log Reason</label>
                  <input
                    type="text"
                    value={bulkReason}
                    onChange={(e) => setBulkReason(e.target.value)}
                    placeholder="e.g. Timber market inflation, Steel raw material revision"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
              </div>

              {/* Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 uppercase">
                    Preview Affected Products ({previewBulkList.length} items)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Formula: Price {bulkDirection === 'increase' ? '+' : '-'} {bulkPercent}%
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Product / SKU</th>
                        <th className="py-2.5 px-3 text-right">Current Rate</th>
                        <th className="py-2.5 px-3 text-right">Proposed Rate</th>
                        <th className="py-2.5 px-3 text-right">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewBulkList.map(item => (
                        <tr key={item.product.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <strong className="block text-slate-900">{item.product.name}</strong>
                            <span className="text-[10px] font-mono text-slate-400">SKU: {item.product.sku}</span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-500">
                            ₹{item.currentPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            ₹{item.proposedPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            <span className={item.diff > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                              {item.diff > 0 ? `+₹${item.diff}` : `-₹${Math.abs(item.diff)}`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canChangePrices || submitting || previewBulkList.length === 0}
                  onClick={() => setShowConfirmBulk(true)}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2"
                >
                  <span>Apply Bulk Price Adjustment</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: PRICE AUDIT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              
              {/* History Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-700 uppercase">Filter Product Audit Log:</span>
                </div>

                <select
                  value={historyFilterProduct}
                  onChange={(e) => setHistoryFilterProduct(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs font-medium"
                >
                  <option value="all">All Products (Full Store Audit)</option>
                  {allProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              {/* History Table */}
              {loadingHistory ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading audit history...</div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No price revisions recorded yet for this selection.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Date & Time</th>
                          <th className="py-3 px-4">Product / SKU</th>
                          <th className="py-3 px-4 text-right">Old Price</th>
                          <th className="py-3 px-4 text-center">→</th>
                          <th className="py-3 px-4 text-left">New Price</th>
                          <th className="py-3 px-4">Changed By</th>
                          <th className="py-3 px-4">Reason / Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {historyList.map(entry => (
                          <tr key={entry.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                              {new Date(entry.timestamp).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <strong className="block text-slate-900">{entry.productName}</strong>
                              <span className="text-[10px] font-mono text-slate-400">SKU: {entry.sku}</span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-500">
                              ₹{entry.oldPrice.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-400">→</td>
                            <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">
                              ₹{entry.newPrice.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-bold text-slate-800 block">{entry.changedBy}</span>
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded uppercase font-bold">
                                {entry.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs">
                              {entry.reason || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* CONFIRMATION MODAL: SINGLE PRICE CHANGE */}
      {showConfirmSingle && targetProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900 uppercase">Confirm Price Revision</h4>
                <p className="text-xs text-slate-500">This change will immediately reflect across customer catalog and cart validation.</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Product:</span>
                <strong className="text-slate-900">{targetProduct.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SKU:</span>
                <strong className="font-mono text-slate-700">{targetProduct.sku}</strong>
              </div>
              <div className="flex justify-between items-center py-2 border-y border-slate-200">
                <span className="text-slate-600">Base Price:</span>
                <div className="flex items-center gap-2 font-mono font-bold">
                  <span className="text-slate-400 line-through">₹{targetProduct.price}</span>
                  <span>→</span>
                  <span className="text-slate-900 text-sm">₹{newPrice}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Final Selling Rate:</span>
                <div className="flex items-center gap-2 font-mono font-bold">
                  <span className="text-slate-400 line-through">₹{targetProduct.finalPrice}</span>
                  <span>→</span>
                  <span className="text-amber-800 text-base font-black">₹{calculatedFinalPrice}</span>
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>Authorized By:</span>
                <span className="font-bold text-slate-800">{user?.name || 'Authorized Admin'} ({currentRole})</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmSingle(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSingleSave}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs"
              >
                {submitting ? 'Saving...' : 'Yes, Confirm & Update Price'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: BULK PRICE CHANGE */}
      {showConfirmBulk && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-sm text-slate-900 uppercase">Confirm Bulk Revision</h4>
                <p className="text-xs text-slate-500">
                  Update {previewBulkList.length} items by {bulkDirection === 'increase' ? '+' : '-'}{bulkPercent}%?
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <strong className="text-slate-900">{bulkCategory}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Products:</span>
                <strong className="text-slate-900">{previewBulkList.length} items</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized Admin:</span>
                <strong className="text-slate-800">{user?.name || 'Authorized Admin'} ({currentRole})</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmBulk(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleApplyBulk}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs"
              >
                {submitting ? 'Applying...' : 'Confirm Bulk Update'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
