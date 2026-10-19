import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  QrCode, 
  Layers, 
  FileText, 
  Settings, 
  LogOut, 
  Bell, 
  Shield, 
  Menu, 
  X, 
  ExternalLink,
  Store,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Boxes
} from 'lucide-react';
import { ShoppingBag } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useStore } from '../../context/StoreContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePath: string;
  navigate: (path: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activePath, navigate }) => {
  const { 
    currentRole, 
    logout, 
    notifications, 
    clearNotifications, 
    unreadNotificationCount,
    latestOrderToast,
    dismissOrderToast,
    soundAlertEnabled,
    toggleSoundAlert,
    playOrderChimeSound
  } = useAdmin();
  const { storeSettings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Product Catalogue', path: '/admin/products', icon: ShoppingBag },
    { label: 'Stock Maintaining', path: '/admin/stock-maintaining', icon: Boxes },
    { label: 'Counter PIN Handover', path: '/admin/verify', icon: QrCode, highlight: true },
    { label: 'Store Orders', path: '/admin/orders', icon: Package },
    { label: 'Inventory & Stock', path: '/admin/inventory', icon: Layers },
    { label: 'Contractor Quotes', path: '/admin/quotes', icon: FileText },
    { label: 'Door Builder Rules', path: '/admin/door-builder', icon: Sparkles },
    { label: 'Store Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* Top Admin App Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => navigate('/admin')}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img
                src="/welcome-hardware-logo.svg"
                alt="Welcome Hardware"
                className="w-10 h-10 object-contain rounded-full bg-white p-0.5 shadow-xs shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight text-white uppercase">
                    Welcome Hardware
                  </span>
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                    Admin
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  Store Management System • Hosapete
                </span>
              </div>
            </div>
          </div>

          {/* Right: Notifications, Admin Identity, Store Link, Sign Out */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* View Customer Storefront link (preserves admin session) */}
            <button
              onClick={() => navigate('/')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition"
              title="Open Customer Storefront"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer Store</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition relative"
                title="Live Store Alerts"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {showNotificationDrawer && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                        Live Store Notifications
                      </span>
                      <button
                        onClick={toggleSoundAlert}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                          soundAlertEnabled ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                        }`}
                        title="Toggle Order Chime Sound"
                      >
                        {soundAlertEnabled ? 'Sound: ON' : 'Sound: OFF'}
                      </button>
                    </div>
                    <button
                      onClick={clearNotifications}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-2 space-y-2 text-xs divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <p className="text-slate-400 text-center py-4 text-[11px]">No recent store notifications</p>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div key={n.id} className="pt-2 first:pt-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-900">{n.title}</p>
                            {n.type === 'order' && (
                              <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded uppercase">
                                New Order
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-[11px] leading-tight">{n.message}</p>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(n.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated Admin Identity Badge */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
              <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="text-left">
                <span className="text-xs font-bold text-white block leading-none">
                  {useAdmin().user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block leading-tight mt-0.5">
                  {useAdmin().user?.id || 'Authorized ID'}
                </span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-rose-300 bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-800/50 rounded-xl transition"
              title="Sign Out of Admin Session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>
        </div>
      </header>

      {/* REAL-TIME NEW ORDER PROMINENT BANNER */}
      {latestOrderToast && (
        <div className="bg-amber-500 text-slate-950 px-4 py-3 shadow-lg border-b border-amber-600 animate-slide-down sticky top-16 z-30">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                <ShoppingBag className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wide">
                  New Customer Order Received • #{latestOrderToast.orderNumber}
                </h4>
                <p className="text-xs font-semibold text-slate-900">
                  {latestOrderToast.customerName} placed an order of ₹{latestOrderToast.total.toLocaleString('en-IN')} (Pickup PIN: <strong className="font-mono bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded">{latestOrderToast.pin}</strong>)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  dismissOrderToast();
                  navigate('/admin/orders');
                }}
                className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-xs"
              >
                View in Orders
              </button>
              <button
                onClick={dismissOrderToast}
                className="p-1 text-slate-900 hover:text-slate-950 rounded hover:bg-amber-400 transition"
                title="Dismiss banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Body: Sidebar + View Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activePath === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : item.highlight
                      ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-700' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="text-[9px] bg-amber-200 text-amber-950 font-black px-1.5 py-0.2 rounded uppercase">
                      Fast PIN
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Store Physical Meta Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
              <Store className="w-3.5 h-3.5" />
              <span>Active Physical Node</span>
            </div>
            <p className="font-bold text-slate-100 text-[11px] leading-tight">
              WELCOME HARDWARE
            </p>
            <p className="text-[10px] text-slate-400">
              {storeSettings.address}
            </p>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
              <span>Counter Phone:</span>
              <span className="text-white font-mono">{storeSettings.phone}</span>
            </div>
          </div>

        </aside>

        {/* MOBILE DRAWER NAVIGATION */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-64 max-w-xs bg-slate-900 text-white h-full p-4 flex flex-col justify-between z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-xs uppercase text-amber-400">Welcome Hardware Admin</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activePath === item.path;

                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold ${
                          isActive ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    logout();
                    navigate('/admin/login');
                  }}
                  className="w-full py-2 bg-slate-800 text-rose-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>

    </div>
  );
};
