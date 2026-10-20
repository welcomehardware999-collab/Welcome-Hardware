import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Phone, 
  MapPin, 
  Clock, 
  Menu, 
  X, 
  Calculator, 
  FileText, 
  User, 
  ShieldCheck, 
  Sparkles,
  Layers,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PWAInstallButton } from './PWAInstallButton';
import { getAssetUrl, LOGO_URL } from '../../lib/assets';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate }) => {
  const { cartCount, wishlist, unreadNotificationsCount, storeSettings, liveEventNotice, dismissNotice } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Notification Banner if any active order update */}
      {liveEventNotice && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{liveEventNotice}</span>
          </div>
          <button onClick={dismissNotice} className="text-white/80 hover:text-white text-xs ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Top Utility Bar: Exact Address & Phone & Call Store */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Store Location & Hours */}
          <div className="flex items-center flex-wrap gap-4 text-slate-300">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-slate-100 font-semibold tracking-wide">{storeSettings.address}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{storeSettings.openingHours}</span>
            </div>
          </div>

          {/* Call Store & Admin Link */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Call Store Phone Button */}
            <a
              href={`tel:${storeSettings.phone}`}
              id="header-call-store-btn"
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 rounded text-xs transition"
              title="Call Welcome Hardware directly"
            >
              <Phone className="w-3 h-3 fill-slate-950" />
              <span>Call Store: {storeSettings.phone}</span>
            </a>

            {/* PWA Install Button */}
            <PWAInstallButton compact />

            {/* Admin Panel Direct Link */}
            <button
              onClick={() => navigate('/admin')}
              id="header-admin-portal-link"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-amber-400 px-2 py-0.5 rounded border border-slate-700 text-[11px] transition"
            >
              <ShieldCheck className="w-3 h-3 text-amber-500" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer select-none shrink-0"
            id="brand-header-logo"
          >
            <img 
              src={getAssetUrl(storeSettings.logoUrl) || LOGO_URL} 
              alt="Welcome Hardware" 
              className="w-11 h-11 sm:w-12 sm:h-12 object-contain shrink-0 rounded-full shadow-xs bg-white p-0.5 border border-slate-200/80"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 uppercase">Welcome</span>
                <span className="text-xl font-black tracking-tight text-amber-600 uppercase">Hardware</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                HOSAPETE • Plywood & Hardware
              </p>
            </div>
          </div>

          {/* Core Business Model Badge */}
          <div className="hidden xl:flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-bold text-amber-900 tracking-wide">
              ORDER ONLINE • PICK UP AT OUR STORE
            </span>
          </div>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex-1 max-w-md relative hidden md:block"
            id="header-search-form"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search 18mm plywood, mortise lock, teak wood, SS hinge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-20 py-2 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 rounded font-medium transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            <button
              onClick={() => navigate('/wishlist')}
              id="header-wishlist-btn"
              className="p-2 text-slate-700 hover:text-amber-600 relative rounded-lg hover:bg-slate-100 transition"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              id="header-cart-btn"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-xs transition"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 md:hidden hover:bg-slate-100 rounded-lg"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search plywood, locks, hinges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-16 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 bg-slate-900 text-white text-xs px-2.5 rounded font-medium"
            >
              Go
            </button>
          </div>
        </form>
      </div>

      {/* Desktop Secondary Navigation Bar */}
      <nav className="hidden md:block bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center space-x-1 py-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => navigate('/')}
              className={`px-3 py-1.5 rounded-md transition ${currentPath === '/' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-200'}`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/shop')}
              className={`px-3 py-1.5 rounded-md transition ${currentPath === '/shop' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-200'}`}
            >
              Shop All
            </button>
            <button
              onClick={() => navigate('/categories')}
              className={`px-3 py-1.5 rounded-md transition ${currentPath === '/categories' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-200'}`}
            >
              Categories
            </button>
            <button
              onClick={() => navigate('/calculators')}
              className={`px-3 py-1.5 rounded-md transition inline-flex items-center gap-1 ${currentPath === '/calculators' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-200'}`}
            >
              <Calculator className="w-3.5 h-3.5 text-amber-600" />
              <span>Calculators (Plywood & CFT)</span>
            </button>
            <button
              onClick={() => navigate('/build-your-door')}
              className={`px-3 py-1.5 rounded-md transition inline-flex items-center gap-1.5 ${
                currentPath === '/build-your-door' || currentPath === '/door-fitting' || currentPath === '/door-fittings' 
                  ? 'bg-amber-100 text-amber-900 font-bold ring-1 ring-amber-300' 
                  : 'hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Build Your Door</span>
              <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">New</span>
            </button>
            <button
              onClick={() => navigate('/contractor')}
              className={`px-3 py-1.5 rounded-md transition inline-flex items-center gap-1 ${currentPath === '/contractor' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-200'}`}
            >
              <Wrench className="w-3.5 h-3.5 text-amber-600" />
              <span>Contractor Zone</span>
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2 py-1.5">
            <button
              onClick={() => navigate('/orders')}
              className={`px-2.5 py-1 rounded text-xs transition ${currentPath.startsWith('/orders') ? 'text-amber-800 font-bold' : 'hover:text-amber-600'}`}
            >
              My Orders & PIN
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => navigate('/quotes')}
              className={`px-2.5 py-1 rounded text-xs transition ${currentPath.startsWith('/quotes') ? 'text-amber-800 font-bold' : 'hover:text-amber-600'}`}
            >
              My Quotes
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => navigate('/store-info')}
              className={`px-2.5 py-1 rounded text-xs transition ${currentPath === '/store-info' ? 'text-amber-800 font-bold' : 'hover:text-amber-600'}`}
            >
              Store Info & Map
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 shadow-lg animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <button
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => { navigate('/shop'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-800"
            >
              Browse Shop
            </button>
            <button
              onClick={() => { navigate('/categories'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-800"
            >
              Categories
            </button>
            <button
              onClick={() => { navigate('/calculators'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-xs font-semibold text-amber-900"
            >
              <Calculator className="w-4 h-4 text-amber-600" />
              Calculators
            </button>
            <button
              onClick={() => { navigate('/build-your-door'); setMobileMenuOpen(false); }}
              className="flex items-center justify-between p-2 rounded-lg bg-amber-50 text-xs font-semibold text-amber-900"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Build Your Door</span>
              </span>
              <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">New</span>
            </button>
            <button
              onClick={() => { navigate('/contractor'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-800"
            >
              <Wrench className="w-4 h-4 text-slate-600" />
              Contractor Zone
            </button>
          </div>

          <div className="py-2 space-y-1">
            <button
              onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded"
            >
              My Orders & Pickup PIN
            </button>
            <button
              onClick={() => { navigate('/quotes'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded"
            >
              Bulk Quotes
            </button>
            <button
              onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded"
            >
              My Profile & Trade Type
            </button>
            <button
              onClick={() => { navigate('/store-info'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded"
            >
              Store Info & Directions
            </button>
            <button
              onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50/70 rounded border border-amber-200"
            >
              Go to Admin Panel
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
