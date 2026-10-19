import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { AdminLayout } from './components/admin/AdminLayout';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ShopPage } from './pages/customer/ShopPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { CalculatorsPage } from './pages/customer/CalculatorsPage';
import { DoorFittingPage } from './pages/customer/DoorFittingPage';
import { BuildYourDoorPage } from './pages/customer/BuildYourDoorPage';
import { ContractorPage } from './pages/customer/ContractorPage';
import { QuotesPage } from './pages/customer/QuotesPage';
import { CategoriesPage } from './pages/customer/CategoriesPage';
import { StoreInfoPage } from './pages/customer/StoreInfoPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { WishlistPage } from './pages/customer/WishlistPage';
import { StartupScreen } from './components/common/StartupScreen';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminPickupVerify } from './pages/admin/AdminPickupVerify';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminQuotes } from './pages/admin/AdminQuotes';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminDoorBuilder } from './pages/admin/AdminDoorBuilder';
import { AdminStockMaintaining } from './pages/admin/AdminStockMaintaining';

function getNormalizedPath(): string {
  if (window.location.hash) {
    const rawHash = window.location.hash.replace(/^#\/?/, '/');
    const [h] = rawHash.split('?');
    return h || '/';
  }

  const pathname = window.location.pathname || '/';
  if (window.location.hostname.endsWith('github.io')) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const inner = '/' + segments.slice(1).join('/');
      return inner || '/';
    }
  }

  return pathname;
}

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(getNormalizedPath());
  const [searchParams, setSearchParams] = useState<URLSearchParams>(new URLSearchParams(window.location.search));
  const { isAuthenticated, isCheckingAuth } = useAdmin();

  // Startup splash screen - shows on initial store load
  const [showStartup, setShowStartup] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('wh_startup_shown');
    } catch {
      return true;
    }
  });

  // Synchronize browser history (pushState & popstate & hashchange)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getNormalizedPath());
      setSearchParams(new URLSearchParams(window.location.search));
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (to: string) => {
    const [path, search] = to.split('?');
    if (window.location.hostname.endsWith('github.io')) {
      const segments = window.location.pathname.split('/').filter(Boolean);
      const repo = segments[0] ? `/${segments[0]}` : '';
      const targetUrl = `${repo}${path}${search ? `?${search}` : ''}`;
      window.history.pushState({}, '', targetUrl);
    } else {
      window.history.pushState({}, '', to);
    }
    setCurrentPath(path);
    setSearchParams(new URLSearchParams(search || ''));
    window.scrollTo(0, 0);
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  // --- STARTUP SPLASH SCREEN ---
  // Show clean startup screen before customer home page
  if (showStartup && !isAdminRoute) {
    return (
      <StartupScreen
        onComplete={() => {
          setShowStartup(false);
          try {
            sessionStorage.setItem('wh_startup_shown', 'true');
          } catch {}
        }}
      />
    );
  }

  // --- ADMIN ROUTING ---
  // Authenticated Session: Protects all admin pages while allowing valid sessions across refresh & navigation
  if (isAdminRoute) {
    if (isCheckingAuth) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 rounded-full bg-white p-1 border border-slate-800 shadow-2xl flex items-center justify-center animate-pulse">
            <img src="/welcome-hardware-logo.svg" alt="Welcome Hardware" className="w-14 h-14 object-contain rounded-full" />
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-400 tracking-wider uppercase">Verifying Admin Session...</p>
        </div>
      );
    }

    if (!isAuthenticated || currentPath === '/admin/login') {
      return <AdminLoginPage navigate={navigate} />;
    }

    let adminPage = <AdminDashboard navigate={navigate} />;
    if (currentPath === '/admin/products') {
      adminPage = <AdminProducts />;
    } else if (currentPath === '/admin/stock-maintaining') {
      adminPage = <AdminStockMaintaining />;
    } else if (currentPath === '/admin/verify') {
      adminPage = <AdminPickupVerify />;
    } else if (currentPath === '/admin/orders') {
      adminPage = <AdminOrders />;
    } else if (currentPath === '/admin/inventory') {
      adminPage = <AdminInventory />;
    } else if (currentPath === '/admin/quotes') {
      adminPage = <AdminQuotes />;
    } else if (currentPath === '/admin/door-builder') {
      adminPage = <AdminDoorBuilder navigate={navigate} />;
    } else if (currentPath === '/admin/settings') {
      adminPage = <AdminSettings />;
    }

    return (
      <AdminLayout activePath={currentPath} navigate={navigate}>
        {adminPage}
      </AdminLayout>
    );
  }

  // --- CUSTOMER ROUTING ---
  let customerPage = <HomePage navigate={navigate} />;

  // Match /products/:id
  const productMatch = currentPath.match(/^\/products\/([^/]+)/);
  // Match /orders/:id
  const orderMatch = currentPath.match(/^\/orders\/([^/]+)/);

  if (productMatch) {
    customerPage = <ProductDetailPage productId={productMatch[1]} navigate={navigate} />;
  } else if (orderMatch && currentPath !== '/orders') {
    customerPage = <OrderDetailPage orderId={orderMatch[1]} navigate={navigate} />;
  } else if (currentPath === '/shop') {
    customerPage = (
      <ShopPage
        navigate={navigate}
        initialCategory={searchParams.get('category') || undefined}
        initialSearch={searchParams.get('search') || undefined}
      />
    );
  } else if (currentPath === '/cart') {
    customerPage = <CartPage navigate={navigate} />;
  } else if (currentPath === '/checkout') {
    customerPage = <CheckoutPage navigate={navigate} />;
  } else if (currentPath === '/orders') {
    customerPage = <OrdersPage navigate={navigate} />;
  } else if (currentPath === '/calculators') {
    customerPage = <CalculatorsPage navigate={navigate} />;
  } else if (currentPath === '/build-your-door' || currentPath === '/door-fittings' || currentPath === '/door-fitting') {
    customerPage = <BuildYourDoorPage navigate={navigate} />;
  } else if (currentPath === '/contractor') {
    customerPage = <ContractorPage navigate={navigate} />;
  } else if (currentPath === '/quotes') {
    customerPage = (
      <QuotesPage
        navigate={navigate}
        initialNotes={searchParams.get('notes') || undefined}
      />
    );
  } else if (currentPath === '/categories') {
    customerPage = <CategoriesPage navigate={navigate} />;
  } else if (currentPath === '/store-info') {
    customerPage = <StoreInfoPage navigate={navigate} />;
  } else if (currentPath === '/profile') {
    customerPage = <ProfilePage navigate={navigate} />;
  } else if (currentPath === '/wishlist') {
    customerPage = <WishlistPage navigate={navigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white">
      <OfflineIndicator />
      <Header currentPath={currentPath} navigate={navigate} />
      
      <main className="flex-1">
        {customerPage}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </StoreProvider>
  );
}
