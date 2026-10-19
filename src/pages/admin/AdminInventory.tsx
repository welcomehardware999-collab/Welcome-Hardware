import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  Plus, 
  Edit, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  IndianRupee, 
  X,
  ArrowUpDown
} from 'lucide-react';
import { fetchProducts, adjustProductStock, createProduct, updateProduct } from '../../lib/api';
import { Product } from '../../types';
import { useAdmin } from '../../context/AdminContext';
import { CATEGORIES, BRANDS } from '../../data/mockData';

export const AdminInventory: React.FC = () => {
  const { currentRole } = useAdmin();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick Stock Adjustment state
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(5);

  useEffect(() => {
    loadProducts();
  }, [categoryFilter, lowStockOnly]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (categoryFilter) params.category = categoryFilter;
      if (lowStockOnly) params.lowStockOnly = 'true';
      const data = await fetchProducts(params);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjust = async (productId: string, delta: number) => {
    try {
      const updated = await adjustProductStock(productId, delta, `Manual stock adjustment by ${currentRole}`);
      setProducts(products.map(p => p.id === productId ? updated : p));
      setAdjustingId(null);
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    }
  };

  const filteredProducts = products.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Physical Inventory & Stock Control
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Single Source of Truth: Total Stock • Reserved for Pickups • Available for Counter Sales
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hardware SKU</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search SKU, Product Name, Brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none w-full sm:w-auto"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 font-bold text-slate-700 whitespace-nowrap cursor-pointer px-2 py-1">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded"
          />
          <span>Show Low Stock Only</span>
        </label>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Loading physical stock records...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No products match the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-4">Brand / Category</th>
                  <th className="py-3 px-4">Pricing (Incl. GST)</th>
                  <th className="py-3 px-4 text-center">Physical Stock</th>
                  <th className="py-3 px-4 text-center">Reserved</th>
                  <th className="py-3 px-4 text-center">Available</th>
                  <th className="py-3 px-4 text-right">Stock Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(product => {
                  const isLow = product.availableStock <= product.lowStockThreshold;
                  const isZero = product.availableStock <= 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Item */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0] || '/welcome-hardware-logo.svg'}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-contain bg-slate-50 border p-0.5 shrink-0"
                          />
                          <div className="max-w-xs">
                            <h4 className="font-bold text-slate-900 line-clamp-1">{product.name}</h4>
                            <span className="font-mono text-[10px] text-slate-400 block">
                              SKU: {product.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Brand & Cat */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{product.brand}</span>
                        <span className="text-[10px] text-slate-500">{product.category}</span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-mono">
                        <span className="font-black text-slate-900 block">
                          ₹{product.finalPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {product.gstRate}% GST incl.
                        </span>
                      </td>

                      {/* Physical Stock */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        {product.stock} {product.unit}s
                      </td>

                      {/* Reserved */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-blue-700 bg-blue-50/50">
                        {product.reservedStock}
                      </td>

                      {/* Available */}
                      <td className="py-3 px-4 text-center font-mono">
                        <span className={`font-black px-2 py-0.5 rounded text-xs inline-block ${
                          isZero
                            ? 'bg-rose-100 text-rose-800 font-bold'
                            : isLow
                            ? 'bg-amber-100 text-amber-900 font-bold'
                            : 'bg-emerald-100 text-emerald-800 font-bold'
                        }`}>
                          {product.availableStock} {product.unit}s
                        </span>
                        {isLow && !isZero && (
                          <span className="text-[9px] text-amber-700 block mt-0.5 font-bold">Low stock</span>
                        )}
                      </td>

                      {/* Stock Adjust Controls */}
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleStockAdjust(product.id, 5)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-mono font-bold text-[11px]"
                          title="Restock +5 units"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleStockAdjust(product.id, 20)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-mono font-bold text-[11px]"
                          title="Restock +20 units"
                        >
                          +20
                        </button>
                        <button
                          onClick={() => handleStockAdjust(product.id, -1)}
                          disabled={product.stock <= product.reservedStock}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded font-mono font-bold text-[11px] disabled:opacity-40"
                          title="Manual deduction -1 unit"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100"
                          title="Edit Product Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD NEW PRODUCT MODAL */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onAdded={(newProd) => {
            setProducts([newProd, ...products]);
            setShowAddModal(false);
          }}
        />
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdated={(updated) => {
            setProducts(products.map(p => p.id === updated.id ? updated : p));
            setEditingProduct(null);
          }}
        />
      )}

    </div>
  );
};

// --- Subcomponent: Add Product Modal ---
interface AddProductModalProps {
  onClose: () => void;
  onAdded: (p: Product) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAdded }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Plywood');
  const [brand, setBrand] = useState('CenturyPly');
  const [price, setPrice] = useState(1500);
  const [discount, setDiscount] = useState(0);
  const [stock, setStock] = useState(25);
  const [unit, setUnit] = useState('Sheet');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;
    setSubmitting(true);
    try {
      const finalPrice = Math.round(price * (1 - discount / 100));
      const payload: Partial<Product> = {
        name,
        sku: sku.toUpperCase(),
        category,
        subCategory: 'General Hardware',
        brand,
        price,
        discount,
        finalPrice,
        gstRate: 18,
        stock,
        availableStock: stock,
        reservedStock: 0,
        lowStockThreshold,
        unit,
        description,
        images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=400&q=80'],
        active: true
      };

      const created = await createProduct(payload);
      onAdded(created);
    } catch (err) {
      console.error('Failed to create product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
            Add New Hardware Product
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              placeholder="e.g. Greenply Marine Grade 18mm BWP"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">SKU *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono uppercase"
                placeholder="PLY-18MM-GRN"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50"
              >
                <option value="Sheet">Sheet (8x4)</option>
                <option value="Piece">Piece</option>
                <option value="Pair">Pair</option>
                <option value="Set">Set</option>
                <option value="CFT">CFT (Cubic Feet)</option>
                <option value="Kg">Kg</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Discount %</label>
              <input
                type="number"
                min="0"
                max="90"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Stock</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Image URL (Optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-xs"
              placeholder="https://..."
            />
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-slate-600 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-sm"
            >
              {submitting ? 'Saving...' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Subcomponent: Edit Product Modal ---
interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onUpdated: (p: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onUpdated }) => {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [discount, setDiscount] = useState(product.discount);
  const [stock, setStock] = useState(product.stock);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const finalPrice = Math.round(price * (1 - discount / 100));
      const updated = await updateProduct(product.id, {
        name,
        price,
        discount,
        finalPrice,
        stock,
        availableStock: Math.max(0, stock - product.reservedStock)
      });
      onUpdated(updated);
    } catch (err) {
      console.error('Failed to update product:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <span className="text-[10px] font-mono text-slate-400">SKU: {product.sku}</span>
            <h3 className="text-base font-black text-slate-900">Edit Hardware Item</h3>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Product Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Discount %</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Physical Warehouse Stock ({product.unit}s)</label>
            <input
              type="number"
              min={product.reservedStock}
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              {product.reservedStock} units currently reserved for customer pickups. Minimum stock is {product.reservedStock}.
            </span>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-slate-600 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg"
            >
              {submitting ? 'Saving...' : 'Update Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
