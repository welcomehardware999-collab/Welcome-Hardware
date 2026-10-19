import React from 'react';
import { ShoppingCart, Heart, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const inWishlist = isInWishlist(product.id);

  const isOutOfStock = product.availableStock <= 0;
  const isLowStock = product.availableStock > 0 && product.availableStock <= product.lowStockThreshold;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      id={`product-card-${product.id}`}
      className="group flex flex-col justify-between bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden relative"
    >
      {/* Top badges & Wishlist */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden flex items-center justify-center p-3">
        <img
          src={product.images[0] || '/welcome-hardware-logo.svg'}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Brand Badge */}
        <span className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
          {product.brand}
        </span>

        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute bottom-2.5 left-2.5 bg-amber-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
            {product.discount}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          id={`wishlist-btn-${product.id}`}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-xs transition ${
            inWishlist 
              ? 'bg-rose-50 text-rose-600 shadow-xs' 
              : 'bg-white/80 text-slate-400 hover:text-rose-600'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600' : ''}`} />
        </button>
      </div>

      {/* Details Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-medium truncate max-w-[120px]">{product.category}</span>
            <span className="font-mono text-[10px]">{product.sku}</span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-700 transition">
            {product.name}
          </h3>

          {/* Size / Thickness pills if applicable */}
          {(product.thickness || product.size) && (
            <div className="mt-1 flex flex-wrap gap-1">
              {product.thickness && (
                <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                  {product.thickness}
                </span>
              )}
              {product.size && (
                <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                  {product.size}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stock & Pricing */}
        <div className="pt-2 border-t border-slate-100">
          {/* Stock availability */}
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            {isOutOfStock ? (
              <span className="text-rose-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Out of stock
              </span>
            ) : isLowStock ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Only {product.availableStock} left
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> In stock ({product.availableStock} {product.unit}s)
              </span>
            )}

            <span className="text-[10px] text-slate-400">Store Pickup</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-slate-950">
              ₹{product.finalPrice.toLocaleString('en-IN')}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-slate-400 line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-[10px] text-slate-400 ml-auto">
              /{product.unit}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              id={`add-cart-${product.id}`}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              id={`buy-now-${product.id}`}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95 shadow-xs'
              }`}
            >
              <span>Pickup</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
