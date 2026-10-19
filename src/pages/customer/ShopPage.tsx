import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  SlidersHorizontal, 
  X, 
  Check, 
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { fetchProducts } from '../../lib/api';
import { Product } from '../../types';
import { ProductCard } from '../../components/common/ProductCard';
import { BRANDS } from '../../data/mockData';

interface ShopPageProps {
  navigate: (path: string) => void;
  initialCategory?: string;
  initialSearch?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ navigate, initialCategory, initialSearch }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedThickness, setSelectedThickness] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<'price_asc' | 'price_desc' | 'rating' | 'newest'>('newest');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedBrand, selectedThickness, selectedMaterial, inStockOnly, sort]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (selectedThickness) params.thickness = selectedThickness;
      if (selectedMaterial) params.material = selectedMaterial;
      if (inStockOnly) params.inStockOnly = 'true';
      if (search) params.search = search;
      if (sort) params.sort = sort;

      const data = await fetchProducts(params);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load shop products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedThickness('');
    setSelectedMaterial('');
    setInStockOnly(false);
    setSort('newest');
  };

  const categories = [
    'Plywood',
    'Wood',
    'Door Fittings',
    'Furniture Fittings',
    'Architectural Hardware',
    'Adhesives',
    'Tools'
  ];

  const thicknesses = ['6mm', '12mm', '18mm', '19mm', '25mm'];
  const materials = ['SS 304', 'Brass Antique', 'Zinc Alloy', 'BWP Gurjan', 'CP Teak Wood', 'Sal Wood'];

  const hasActiveFilters = !!(selectedCategory || selectedBrand || selectedThickness || selectedMaterial || inStockOnly || search);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Hardware & Timber Store Catalogue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical in-store inventory ready for counter reservation and pickup at Hospet
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, brand, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-semibold transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <div className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
              <Filter className="w-4 h-4 text-amber-600" />
              <span>Filter Catalogue</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* In-Stock Only Toggle */}
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-950 block">In-Stock Only</span>
              <span className="text-[10px] text-amber-800">Ready for instant pickup</span>
            </div>
            <input
              type="checkbox"
              id="inStockOnlyCheckbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Category</h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition ${
                  selectedCategory === '' ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex items-center justify-between ${
                    selectedCategory === cat ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-amber-700" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Brands</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {BRANDS.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                  className={`w-full text-left px-2.5 py-1 rounded text-xs transition flex items-center justify-between ${
                    selectedBrand === brand ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{brand}</span>
                  {selectedBrand === brand && <Check className="w-3.5 h-3.5 text-amber-700" />}
                </button>
              ))}
            </div>
          </div>

          {/* Thickness (For Plywood & Boards) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Plywood Thickness</h4>
            <div className="flex flex-wrap gap-1.5">
              {thicknesses.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedThickness(selectedThickness === t ? '' : t)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold border transition ${
                    selectedThickness === t
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Material */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Material / Grade</h4>
            <div className="space-y-1">
              {materials.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMaterial(selectedMaterial === m ? '' : m)}
                  className={`w-full text-left px-2.5 py-1 rounded text-xs transition flex items-center justify-between ${
                    selectedMaterial === m ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{m}</span>
                  {selectedMaterial === m && <Check className="w-3.5 h-3.5 text-amber-700" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PRODUCTS LISTING AREA */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Top Bar: Count, Sort, Mobile Filter Button */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <button
                onClick={() => setShowMobileFilter(true)}
                className="lg:hidden inline-flex items-center gap-1.5 bg-white border border-slate-300 px-3 py-1.5 rounded-lg font-bold text-slate-800 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                <span>Filters {hasActiveFilters && '•'}</span>
              </button>
              <span className="font-semibold text-slate-900">{products.length} Products Available</span>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              <span className="text-slate-500 hidden sm:inline">Sort by:</span>
              <select
                value={sort}
                onChange={(e: any) => setSort(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="newest">Featured & Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px]">Applied:</span>
              {selectedCategory && (
                <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('')}>✕</button>
                </span>
              )}
              {selectedBrand && (
                <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('')}>✕</button>
                </span>
              )}
              {selectedThickness && (
                <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                  {selectedThickness}
                  <button onClick={() => setSelectedThickness('')}>✕</button>
                </span>
              )}
              {selectedMaterial && (
                <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                  {selectedMaterial}
                  <button onClick={() => setSelectedMaterial('')}>✕</button>
                </span>
              )}
              {inStockOnly && (
                <span className="bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                  In-Stock Only
                  <button onClick={() => setInStockOnly(false)}>✕</button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-rose-600 underline font-semibold ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-64 bg-slate-100 rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No hardware products match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing some filters or search for generic terms like "Plywood", "Lock", or "Teak".
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} navigate={navigate} />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* MOBILE FILTER DRAWER MODAL */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full sm:max-w-md max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Filter Hardware Products</h3>
              <button onClick={() => setShowMobileFilter(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-5 flex-1 text-xs">
              {/* In stock */}
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 text-amber-950 font-bold">
                <span>In-Stock Physical Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
              </label>

              {/* Categories */}
              <div>
                <strong className="block mb-2 uppercase tracking-wider text-slate-700">Category</strong>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                      className={`p-2 rounded border text-left font-medium ${
                        selectedCategory === cat ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <strong className="block mb-2 uppercase tracking-wider text-slate-700">Brand</strong>
                <div className="flex flex-wrap gap-1.5">
                  {BRANDS.slice(0, 10).map(brand => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                      className={`px-2.5 py-1 rounded text-xs border ${
                        selectedBrand === brand ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="flex-2 py-2 text-xs font-bold text-white bg-amber-600 rounded-lg shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
