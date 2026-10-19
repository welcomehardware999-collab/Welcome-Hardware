import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Package, 
  RefreshCw, 
  X, 
  Check, 
  AlertCircle,
  ShieldAlert,
  Layers,
  Sparkles
} from 'lucide-react';
import { Product } from '../../types';
import { 
  fetchAdminProducts, 
  deleteProductPermanently, 
  bulkDeleteProductsPermanently, 
  setProductStatus, 
  createProduct, 
  updateProduct 
} from '../../lib/api';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const initialFormState = {
    name: '',
    sku: '',
    category: 'Door Fittings',
    subCategory: 'Handles',
    brand: 'Welcome Hardware',
    description: '',
    price: 450,
    discount: 0,
    stock: 25,
    lowStockThreshold: 5,
    unit: 'Piece',
    size: '8 inch',
    thickness: '3.5 mm',
    material: 'Stainless Steel SS 304',
    finish: 'Satin Antique',
    colour: 'Antique Brass',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    images: ['https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80']
  };

  const [formData, setFormData] = useState(initialFormState);

  const categories = [
    'Door Fittings',
    'Locks & Security',
    'Modular Kitchen',
    'Glass Fittings',
    'Cabinet & Wardrobe',
    'Screws & Fasteners',
    'Curtain & Window',
    'Bathroom Accessories'
  ];

  const units = ['Piece', 'Set', 'Pair', 'Meter', 'Box', 'Kg', 'Pack'];

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const showToast = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Status toggle handler
  const handleToggleStatus = async (product: Product) => {
    const newStatus = (product.status === 'INACTIVE' || product.active === false) ? 'ACTIVE' : 'INACTIVE';
    try {
      const updated = await setProductStatus(product.id, newStatus);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus, active: newStatus === 'ACTIVE' } : p));
      showToast(`Product "${product.name}" is now ${newStatus === 'ACTIVE' ? 'Active in store' : 'Hidden from store'}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Single permanent delete
  const handleConfirmPermanentDelete = async () => {
    if (!productToDelete) return;
    setSubmitting(true);
    try {
      await deleteProductPermanently(productToDelete.id);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setSelectedIds(prev => prev.filter(id => id !== productToDelete.id));
      showToast(`Product "${productToDelete.name}" permanently deleted from catalogue.`);
      setProductToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete product permanently');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk permanent delete
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    try {
      const res = await bulkDeleteProductsPermanently(selectedIds);
      setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
      showToast(`Permanently deleted ${res.count} products from catalogue.`);
      setSelectedIds([]);
      setIsBulkDeleting(false);
    } catch (err: any) {
      alert(err.message || 'Failed to delete selected products');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Form for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    const randomSku = `WH-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({
      ...initialFormState,
      sku: randomSku
    });
    setShowFormModal(true);
  };

  // Open Form for Edit
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      subCategory: product.subCategory || product.category,
      brand: product.brand || 'Welcome Hardware',
      description: product.description || '',
      price: product.price,
      discount: product.discount || 0,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold || 5,
      unit: product.unit || 'Piece',
      size: product.size || '',
      thickness: product.thickness || '',
      material: product.material || '',
      finish: product.finish || '',
      colour: product.colour || '',
      status: (product.status === 'INACTIVE' || product.active === false) ? 'INACTIVE' : 'ACTIVE',
      images: product.images?.length ? product.images : ['https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80']
    });
    setShowFormModal(true);
  };

  // Save product (Create or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category,
        subCategory: formData.subCategory,
        brand: formData.brand,
        description: formData.description.trim() || `${formData.name} available at Welcome Hardware Hosapete.`,
        price: Number(formData.price),
        discount: Number(formData.discount) || 0,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold) || 5,
        unit: formData.unit,
        size: formData.size.trim() || undefined,
        thickness: formData.thickness.trim() || undefined,
        material: formData.material.trim() || undefined,
        finish: formData.finish.trim() || undefined,
        colour: formData.colour.trim() || undefined,
        status: formData.status,
        active: formData.status === 'ACTIVE',
        images: formData.images
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload, ...updated } : p));
        showToast(`Product "${payload.name}" updated successfully.`);
      } else {
        const created = await createProduct(payload);
        setProducts(prev => [created, ...prev]);
        showToast(`New product "${payload.name}" added to catalogue.`);
      }

      setShowFormModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle selection for bulk actions
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  // Filtered list
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

    const isInactive = p.status === 'INACTIVE' || p.active === false;
    const matchesStatus = 
      statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && !isInactive) || 
      (statusFilter === 'INACTIVE' && isInactive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Toast Feedback */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-emerald-100 px-4 py-3 rounded-xl shadow-xl border border-emerald-700 flex items-center gap-2 animate-slide-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Product Catalogue Management
            </h1>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {products.length} Products
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Add new products, control customer store visibility, and permanently remove retired catalogue items.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadProducts}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="Refresh catalogue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleting(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Permanently ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            id="admin-add-new-product-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wide bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-md transition transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ ADD NEW PRODUCT</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, brand, category..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="ALL">All Categories ({products.length})</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium"
          >
            <option value="ALL">All Visibility Status</option>
            <option value="ACTIVE">Active (In Customer Store)</option>
            <option value="INACTIVE">Inactive (Hidden)</option>
          </select>
        </div>
      </div>

      {/* Catalogue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading stored products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center px-4">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchQuery || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or filters to find products.'
                : 'No products currently stored in catalogue. Click "+ ADD NEW PRODUCT" to add your first product.'}
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Product</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                  </th>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">SKU / Brand</th>
                  <th className="py-3 px-4">Price / Rate</th>
                  <th className="py-3 px-4">Stock Status</th>
                  <th className="py-3 px-4">Store Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.map(product => {
                  const isInactive = product.status === 'INACTIVE' || product.active === false;
                  const isSelected = selectedIds.includes(product.id);

                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-amber-50/50' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(product.id)}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                      </td>

                      {/* Product Details (Image, Name, Category) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=150&q=80'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block line-clamp-1">
                              {product.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-500">
                                {product.category} {product.subCategory ? `• ${product.subCategory}` : ''}
                              </span>
                              {product.material && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                                  {product.material}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU / Brand */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {product.sku}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          {product.brand || 'Welcome Hardware'}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          ₹{product.finalPrice.toLocaleString('en-IN')}
                        </div>
                        {product.discount > 0 && (
                          <div className="text-[10px] text-slate-400">
                            <span className="line-through">₹{product.price}</span>{' '}
                            <span className="text-emerald-600 font-semibold">{product.discount}% off</span>
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 block">per {product.unit || 'Piece'}</span>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            product.availableStock <= 0 
                              ? 'bg-red-500' 
                              : product.availableStock <= product.lowStockThreshold 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                          }`} />
                          <span className="font-bold text-slate-800">
                            {product.availableStock} in stock
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Total: {product.stock} {product.unit || 'Piece'}
                        </span>
                      </td>

                      {/* Store Visibility Status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                            isInactive 
                              ? 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          }`}
                          title={isInactive ? 'Click to show in customer app' : 'Click to hide from customer app'}
                        >
                          {isInactive ? (
                            <>
                              <EyeOff className="w-3 h-3 text-slate-400" />
                              <span>Inactive (Hidden)</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Active (Visible)</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions: [Edit] [Delete Permanently] */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Edit product catalogue details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setProductToDelete(product)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-200 transition"
                            title="Delete this old product permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Permanently</span>
                          </button>
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

      {/* ======================================================== */}
      {/* 1. CONFIRMATION MODAL: DELETE OLD PRODUCT PERMANENTLY     */}
      {/* ======================================================== */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Delete this product permanently?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  For old products Welcome Hardware no longer sells.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Product</span>
                <span className="font-bold text-slate-900 text-sm">{productToDelete.name}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">SKU</span>
                  <span className="font-mono font-semibold text-slate-800">{productToDelete.sku}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-semibold text-slate-800">{productToDelete.category}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                This will permanently remove the product from the catalogue. Historical orders will not be broken.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition"
              >
                {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Permanent Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BULK DELETE CONFIRMATION MODAL                            */}
      {/* ======================================================== */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Permanently delete {selectedIds.length} products?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  These selected retired products will be completely removed from the current catalogue.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Historical orders and past customer order receipts will continue to preserve their order details.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleting(false)}
                disabled={submitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition"
              >
                {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete All {selectedIds.length} Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ADD / EDIT PRODUCT MODAL (FULL CATALOGUE MANAGEMENT)   */}
      {/* ======================================================== */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {editingProduct ? 'Edit Product Catalogue' : '+ Add New Product'}
                </h2>
                <p className="text-xs text-slate-500">
                  {editingProduct 
                    ? `Updating details for SKU: ${editingProduct.sku}` 
                    : 'Create and publish hardware product into Welcome Hardware catalogue'}
                </p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              {/* Product Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Godrej Nav-Tal 7 Levers Brass Padlock"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs"
                />
              </div>

              {/* SKU & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. WH-LOCK-01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Godrej, Dorset, Welcome Hardware"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs bg-white"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    placeholder="e.g. Mortise Handles, Aldrops, Padlocks"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Price (MRP ₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Stock Qty *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs bg-white"
                  >
                    {units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hardware Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="e.g. 8 inch"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Thickness</label>
                  <input
                    type="text"
                    value={formData.thickness}
                    onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                    placeholder="e.g. 3 mm"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Material</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="e.g. Brass, SS 304"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Finish</label>
                  <input
                    type="text"
                    value={formData.finish}
                    onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                    placeholder="e.g. Antique, Matte"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1 text-[11px]">Colour</label>
                  <input
                    type="text"
                    value={formData.colour}
                    onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                    placeholder="e.g. Silver, Gold"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed specifications, warranty, fitting instructions..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs"
                />
              </div>

              {/* Status Toggle (Active vs Inactive) */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block text-xs">
                    Product Store Visibility
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Control whether this item is visible to customers in the app catalogue.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status_radio"
                      checked={formData.status === 'ACTIVE'}
                      onChange={() => setFormData({ ...formData, status: 'ACTIVE' })}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-emerald-700">Active</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status_radio"
                      checked={formData.status === 'INACTIVE'}
                      onChange={() => setFormData({ ...formData, status: 'INACTIVE' })}
                      className="text-slate-600 focus:ring-slate-500"
                    />
                    <span className="text-xs font-semibold text-slate-600">Inactive</span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-black uppercase tracking-wide bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-md transition"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : '+ Add Product'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
