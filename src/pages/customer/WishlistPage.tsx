import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { fetchProducts } from '../../lib/api';
import { Product } from '../../types';
import { ProductCard } from '../../components/common/ProductCard';

interface WishlistPageProps {
  navigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ navigate }) => {
  const { wishlist } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const all = await fetchProducts();
        setProducts(all.filter(p => wishlist.includes(p.id)));
      } catch (err) {
        console.error('Failed to load wishlist products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [wishlist]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
          Saved Items ({wishlist.length})
        </h1>
        <p className="text-xs text-slate-500">
          Hardware and timber products saved for later reservation
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-64 bg-slate-100 rounded-xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Your wishlist is currently empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our catalog and click the heart icon on any lock, plywood sheet, or fitting to save it here.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2 rounded-lg"
          >
            Explore Catalogue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map(p => (
            <ProductCard key={p.id} product={p} navigate={navigate} />
          ))}
        </div>
      )}

    </div>
  );
};
