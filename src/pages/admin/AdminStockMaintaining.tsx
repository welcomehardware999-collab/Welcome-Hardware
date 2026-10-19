import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  Plus, 
  Minus, 
  Check, 
  RotateCcw, 
  Boxes, 
  Loader2, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Product } from '../../types';
import { fetchProducts, updateProductStockQuantity } from '../../lib/api';

type StockFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export const AdminStockMaintaining: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<StockFilter>('all');
  
  // Local edit state: { [productId]: editedStockValueString }
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  // Saving states: { [productId]: boolean }
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  // Feedback badge: { [productId]: string }
  const [savedFeedbackMap, setSavedFeedbackMap] = useState<Record<string, boolean>>({});

  // Load products from database
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts({ all: 'true' });
      setProducts(data);
      // Initialize edit values
      const initialEdits: Record<string, string> = {};
      data.forEach(p => {
        initialEdits[p.id] = String(p.stock);
      });
      setEditValues(initialEdits);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();

    // Listen to real-time events to keep stock in sync
    const eventSource = new EventSource('/api/events');
    eventSource.addEventListener('inventory_adjusted', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && payload.product) {
          setProducts(prev => prev.map(p => p.id === payload.product.id ? payload.product : p));
          setEditValues(prev => ({ ...prev, [payload.product.id]: String(payload.product.stock) }));
        }
      } catch (err) {
        console.error('SSE inventory error', err);
      }
    });

    eventSource.addEventListener('product_updated', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload && payload.id) {
          setProducts(prev => prev.map(p => p.id === payload.id ? payload : p));
          setEditValues(prev => ({ ...prev, [payload.id]: String(payload.stock) }));
        }
      } catch (err) {
        console.error('SSE product error', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Compute stock status helper
  const getStockStatus = (product: Product) => {
    const available = product.availableStock !== undefined ? product.availableStock : product.stock;
    const threshold = product.lowStockThreshold || 5;

    if (available <= 0 || product.stock <= 0) {
      return {
        key: 'out_of_stock' as const,
        label: 'Out of Stock',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500'
      };
    }
    if (available <= threshold) {
      return {
        key: 'low_stock' as const,
        label: 'Low Stock',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500'
      };
    }
    return {
      key: 'in_stock' as const,
      label: 'In Stock',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500'
    };
  };

  // Counts
  const counts = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach(p => {
      const status = getStockStatus(p);
      if (status.key === 'in_stock') inStock++;
      else if (status.key === 'low_stock') lowStock++;
      else if (status.key === 'out_of_stock') outOfStock++;
    });

    return {
      total: products.length,
      inStock,
      lowStock,
      outOfStock
    };
  }, [products]);

  // Filter and search
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search by product name
      const query = searchQuery.trim().toLowerCase();
      if (query && !product.name.toLowerCase().includes(query)) {
        return false;
      }

      // Filter by status
      if (activeFilter !== 'all') {
        const status = getStockStatus(product);
        if (status.key !== activeFilter) {
          return false;
        }
      }

      return true;
    });
  }, [products, searchQuery, activeFilter]);

  // Save specific stock quantity
  const handleSaveStock = async (product: Product, targetStock: number) => {
    if (targetStock < 0) return;
    
    setSavingMap(prev => ({ ...prev, [product.id]: true }));
    try {
      const updated = await updateProductStockQuantity(product.id, targetStock, 'Stock Maintaining direct update');
      
      // Update local state
      setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
      setEditValues(prev => ({ ...prev, [product.id]: String(updated.stock) }));
      
      // Flash saved indicator
      setSavedFeedbackMap(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setSavedFeedbackMap(prev => ({ ...prev, [product.id]: false }));
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setSavingMap(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Handle Stepper (+1 or -1)
  const handleStepStock = (product: Product, delta: number) => {
    const currentVal = Number(editValues[product.id] ?? product.stock);
    const newVal = Math.max(0, currentVal + delta);
    setEditValues(prev => ({ ...prev, [product.id]: String(newVal) }));
    handleSaveStock(product, newVal);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                Stock Maintaining
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quick, focused physical stock management and inventory counts.
              </p>
            </div>
          </div>

          <button
            onClick={loadProducts}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition disabled:opacity-50"
            title="Refresh Stock List"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2 pt-5 border-t border-slate-100 mt-5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All Products</span>
            <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[11px]">
              {counts.total}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('in_stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'in_stock'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>In Stock</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-700/20 text-[11px]">
              {counts.inStock}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('low_stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'low_stock'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Low Stock</span>
            <span className="px-1.5 py-0.2 rounded-md bg-amber-700/20 text-[11px]">
              {counts.lowStock}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'out_of_stock'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Out of Stock</span>
            <span className="px-1.5 py-0.2 rounded-md bg-rose-700/20 text-[11px]">
              {counts.outOfStock}
            </span>
          </button>
        </div>

        {/* Search Box */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product by name..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={loadProducts} className="underline font-bold ml-auto">
            Retry
          </button>
        </div>
      )}

      {/* Main Stock Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500" />
            <p className="text-xs font-semibold">Loading stock records...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Boxes className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No products found</p>
            <p className="text-xs text-slate-400">
              {searchQuery ? `No products matching "${searchQuery}"` : 'No items match the selected filter.'}
            </p>
            {(searchQuery || activeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="mt-3 inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Product Name</th>
                  <th className="py-3.5 px-4 sm:px-6 w-56 sm:w-64 text-right sm:text-left">Current Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  const isSaving = !!savingMap[product.id];
                  const isSaved = !!savedFeedbackMap[product.id];
                  const currentEditValue = editValues[product.id] ?? String(product.stock);
                  const isValueChanged = currentEditValue !== String(product.stock);

                  return (
                    <tr 
                      key={product.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Product Name Column */}
                      <td className="py-3.5 px-4 sm:px-6 align-middle">
                        <div className="space-y-1.5">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                            {product.name}
                          </div>
                          
                          {/* Stock Status Indicator */}
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${status.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                              <span>{status.label}</span>
                            </span>
                            
                            {isSaved && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 animate-fade-in">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Updated</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Current Stock Column */}
                      <td className="py-3.5 px-4 sm:px-6 align-middle text-right sm:text-left">
                        <div className="inline-flex flex-col sm:flex-row items-end sm:items-center gap-2">
                          
                          {/* Stepper + Input */}
                          <div className="inline-flex items-center border border-slate-300 rounded-xl bg-slate-50 p-0.5 shadow-2xs">
                            {/* Decrement Button */}
                            <button
                              type="button"
                              onClick={() => handleStepStock(product, -1)}
                              disabled={isSaving || product.stock <= 0}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 active:bg-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Decrease stock by 1"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            {/* Direct Number Input */}
                            <input
                              type="number"
                              min="0"
                              value={currentEditValue}
                              disabled={isSaving}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditValues(prev => ({ ...prev, [product.id]: val }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const num = parseInt(currentEditValue, 10);
                                  if (!isNaN(num) && num >= 0) {
                                    handleSaveStock(product, num);
                                  }
                                }
                              }}
                              className="w-16 sm:w-20 text-center font-bold text-slate-900 bg-transparent text-sm py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 rounded"
                            />

                            {/* Increment Button */}
                            <button
                              type="button"
                              onClick={() => handleStepStock(product, 1)}
                              disabled={isSaving}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 active:bg-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Increase stock by 1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Save / Update Button (shown if user typed a different value) */}
                          {isValueChanged && (
                            <button
                              type="button"
                              onClick={() => {
                                const num = parseInt(currentEditValue, 10);
                                if (!isNaN(num) && num >= 0) {
                                  handleSaveStock(product, num);
                                }
                              }}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-2xs disabled:opacity-50"
                              title="Save stock value"
                            >
                              {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Save</span>
                            </button>
                          )}

                          {isSaving && !isValueChanged && (
                            <span className="p-1 text-slate-400">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
