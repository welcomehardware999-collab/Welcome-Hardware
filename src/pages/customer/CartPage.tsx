import React from 'react';
import { ShoppingCart, Trash2, ArrowRight, MapPin, ShieldCheck, Phone, AlertTriangle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface CartPageProps {
  navigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const { 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    cartSubtotal, 
    cartDiscount, 
    cartGst, 
    cartTotal,
    storeSettings 
  } = useStore();

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore our extensive hardware, plywood, wood, and fitting catalogue and reserve your materials online.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="mt-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-6 py-2.5 rounded-lg transition"
        >
          Browse Hardware Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Review Your Items
          </h1>
          <p className="text-xs text-slate-500">
            Physical store pickup order for Welcome Hardware, Hospet
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Physical Pickup Reminder Banner */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-center gap-3 text-xs">
            <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-amber-950 font-bold block">Physical Store Counter Pickup</strong>
              <p className="text-slate-600 text-[11px]">
                Items will be reserved from warehouse stock and staged at: <span className="font-semibold text-slate-900">{storeSettings.address}</span>. A 4-digit pickup PIN will be issued upon checkout.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
            {cart.map(item => {
              const maxStock = item.product.availableStock || item.product.stock;
              const hasLimitedStock = maxStock < 5;

              return (
                <div key={item.productId} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0] || '/welcome-hardware-logo.svg'}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1 shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <span>{item.product.brand}</span>
                      <span>•</span>
                      <span className="font-mono">{item.product.sku}</span>
                    </div>

                    <h3 
                      onClick={() => navigate(`/products/${item.productId}`)}
                      className="text-sm font-bold text-slate-900 hover:text-amber-700 cursor-pointer line-clamp-2"
                    >
                      {item.product.name}
                    </h3>

                    {(item.selectedThickness || item.selectedSize) && (
                      <p className="text-xs text-slate-500 font-medium">
                        {item.selectedThickness && <span>Thickness: {item.selectedThickness} </span>}
                        {item.selectedSize && <span>| Size: {item.selectedSize}</span>}
                      </p>
                    )}

                    {hasLimitedStock && (
                      <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Only {maxStock} available in store
                      </p>
                    )}
                  </div>

                  {/* Quantity & Pricing */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0">
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-xs">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= maxStock}
                        className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 font-bold text-xs disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-base font-black text-slate-950">
                        ₹{(item.product.finalPrice * item.quantity).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        ₹{item.product.finalPrice.toLocaleString('en-IN')} / {item.product.unit}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5"
          >
            <span>← Continue Shopping & Add More Hardware</span>
          </button>
        </div>

        {/* Order Summary (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight border-b border-slate-200 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Product Discounts:</span>
                  <span className="font-mono font-bold">-₹{cartDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Included GST (18% avg):</span>
                <span className="font-mono">₹{cartGst.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-amber-800 font-semibold pt-1">
                <span>Store Pickup Fee:</span>
                <span className="uppercase text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">FREE</span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline text-slate-950 font-black">
                <span className="text-sm">Total Payable:</span>
                <span className="text-2xl text-amber-700 font-mono">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              id="proceed-to-checkout-btn"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <span>Proceed to Store Pickup</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-[11px] text-slate-500 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Instant stock reservation upon checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Need assistance? Call: <strong>{storeSettings.phone}</strong></span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
