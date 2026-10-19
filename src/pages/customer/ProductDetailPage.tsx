import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  Check, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Share2, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  QrCode,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';
import { fetchProductById } from '../../lib/api';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/common/ProductCard';

interface ProductDetailPageProps {
  productId: string;
  navigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, navigate }) => {
  const { addToCart, toggleWishlist, isInWishlist, storeSettings } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchProductById(productId);
        setProduct(data.product);
        setRelated(data.related || []);
        setSelectedImage(data.product.images[0] || '/welcome-hardware-logo.svg');
        setQuantity(1);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-20 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
        <button
          onClick={() => navigate('/shop')}
          className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.availableStock <= 0;
  const isLowStock = product.availableStock > 0 && product.availableStock <= product.lowStockThreshold;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.name} - Welcome Hardware`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb / Back button */}
      <button
        onClick={() => navigate('/shop')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalogue</span>
      </button>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Image Gallery (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-4/3 sm:aspect-square bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center p-6 shadow-sm">
            <img
              src={selectedImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />

            <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs uppercase">
              {product.brand}
            </span>

            {product.discount > 0 && (
              <span className="absolute top-3 right-3 bg-amber-600 text-white text-xs font-black px-2 py-1 rounded shadow-xs">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-lg border-2 p-1 bg-white shrink-0 transition ${
                    selectedImage === img ? 'border-amber-600 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Direct Physical Location Callout */}
          <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Physical Shelf Location: Hospet Store</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Item is located at {storeSettings.address}. Instant counter inspection & vehicle loading available during open hours.
            </p>
          </div>
        </div>

        {/* Right Col: Pricing, Specs & Buy Box (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header & Meta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider text-amber-700">{product.category} • {product.subCategory}</span>
              <span className="font-mono text-xs">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Quick Specs chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {product.thickness && (
                <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded">
                  Thickness: {product.thickness}
                </span>
              )}
              {product.size && (
                <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded">
                  Size: {product.size}
                </span>
              )}
              {product.material && (
                <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded">
                  Material: {product.material}
                </span>
              )}
              {product.finish && (
                <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded">
                  Finish: {product.finish}
                </span>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-950">
                ₹{product.finalPrice.toLocaleString('en-IN')}
              </span>
              {product.discount > 0 && (
                <span className="text-base text-slate-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs font-semibold text-slate-600">
                / {product.unit} (Inclusive of {product.gstRate}% GST)
              </span>
            </div>

            {/* Physical Stock breakdown */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                {isOutOfStock ? (
                  <span className="text-rose-600 font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Currently Out of Stock at Hospet
                  </span>
                ) : isLowStock ? (
                  <span className="text-amber-800 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    Low Stock: {product.availableStock} {product.unit}s available
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> In Stock: {product.availableStock} {product.unit}s available
                  </span>
                )}
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ({product.reservedStock} reserved for pending pickups)
                </span>
              </div>

              <span className="bg-white border border-slate-300 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded">
                Store Pickup Ready in 2-4 Hours
              </span>
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-slate-700">Quantity ({product.unit}s):</label>
              <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 font-bold text-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.availableStock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.availableStock, Number(e.target.value) || 1)))}
                  className="w-16 text-center text-sm font-bold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.availableStock, quantity + 1))}
                  className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 font-bold text-sm"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-500">
                Total: <strong className="text-slate-900">₹{(product.finalPrice * quantity).toLocaleString('en-IN')}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                id="pdp-add-to-cart-btn"
                className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95 shadow-md'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                id="pdp-buy-now-btn"
                className={`py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-500 text-white active:scale-95 shadow-md shadow-amber-900/20'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Reserve for Store Pickup</span>
              </button>
            </div>

            {/* Wishlist & Share buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                  inWishlist
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600' : ''}`} />
                <span>{inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>

              <button
                onClick={() => navigate(`/quotes?product=${product.id}`)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition ml-auto"
              >
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Request Project Bulk Rate</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Product Overview
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Technical Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Technical Specifications
              </h3>
              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                <table className="w-full divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {Object.entries(product.specifications).map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3">{key}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Related Products in this Category */}
      {related.length > 0 && (
        <section className="pt-8 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
              Related {product.category} at Welcome Hardware
            </h2>
            <button
              onClick={() => navigate(`/shop?category=${encodeURIComponent(product.category)}`)}
              className="text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              View Category
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
