import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  CartItem, 
  Product, 
  StoreSettings, 
  Order, 
  CustomerType, 
  Quote, 
  CustomerNotification,
  CartPriceChange
} from '../types';
import { INITIAL_STORE_SETTINGS } from '../data/mockData';
import { fetchStoreSettings, fetchOrders, fetchQuotes, validateCartPrices, fetchProducts } from '../lib/api';

interface CustomerProfile {
  name: string;
  phone: string;
  email: string;
  customerType: CustomerType;
  businessName?: string;
  gstNumber?: string;
  address?: string;
}

interface StoreContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedThickness?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartGst: number;
  cartTotal: number;

  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  profile: CustomerProfile;
  updateProfile: (profile: Partial<CustomerProfile>) => void;

  orders: Order[];
  refreshOrders: () => Promise<void>;
  addPlacedOrder: (order: Order) => void;

  quotes: Quote[];
  refreshQuotes: () => Promise<void>;

  notifications: CustomerNotification[];
  markNotificationAsRead: (id: string) => void;
  unreadNotificationsCount: number;

  storeSettings: StoreSettings;
  refreshSettings: () => Promise<void>;

  liveEventNotice: string | null;
  dismissNotice: () => void;

  // Cart Price Validation
  pendingPriceChanges: CartPriceChange[];
  checkCartPrices: () => Promise<CartPriceChange[]>;
  acceptNewCartPrices: () => Promise<void>;
  dismissPriceChangeWarning: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);

  // Pending cart price updates
  const [pendingPriceChanges, setPendingPriceChanges] = useState<CartPriceChange[]>([]);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('wh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wh_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Customer Profile
  const [profile, setProfile] = useState<CustomerProfile>(() => {
    try {
      const saved = localStorage.getItem('wh_profile');
      return saved ? JSON.parse(saved) : {
        name: 'Ramesh Sharma',
        phone: '9845112233',
        email: 'ramesh.sharma@example.com',
        customerType: 'Contractor',
        businessName: 'Sharma Woodworks Hospet'
      };
    } catch {
      return {
        name: '',
        phone: '',
        email: '',
        customerType: 'Retail Customer'
      };
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  // Quotes
  const [quotes, setQuotes] = useState<Quote[]>([]);

  // Notifications
  const [notifications, setNotifications] = useState<CustomerNotification[]>([
    {
      id: 'c-notif-1',
      title: 'Store Pickup Service Active',
      message: 'Orders placed online can be picked up safely from our counter on Hampi Road, Hospet.',
      type: 'system',
      timestamp: new Date().toISOString(),
      isRead: false
    }
  ]);

  const [liveEventNotice, setLiveEventNotice] = useState<string | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('wh_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('wh_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync profile to localStorage
  useEffect(() => {
    localStorage.setItem('wh_profile', JSON.stringify(profile));
  }, [profile]);

  // Load initial settings and customer orders
  useEffect(() => {
    refreshSettings();
    refreshOrders();
    refreshQuotes();
  }, [profile.phone]);

  // Real-time Server-Sent Events listener
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('order_updated', (e) => {
      try {
        const updatedOrder: Order = JSON.parse(e.data);
        setOrders(prev => {
          const idx = prev.findIndex(o => o.id === updatedOrder.id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = updatedOrder;
            return next;
          }
          return [updatedOrder, ...prev];
        });

        // Trigger customer push notification if relevant to current user
        setLiveEventNotice(`Order #${updatedOrder.orderNumber} status updated to: ${updatedOrder.status}`);
        setNotifications(prev => [
          {
            id: `notif-${Date.now()}`,
            title: `Order Status: ${updatedOrder.status}`,
            message: `Order #${updatedOrder.orderNumber} is now ${updatedOrder.status}.`,
            type: 'order',
            orderId: updatedOrder.id,
            timestamp: new Date().toISOString(),
            isRead: false
          },
          ...prev
        ]);
      } catch (err) {
        console.error('SSE order error:', err);
      }
    });

    eventSource.addEventListener('settings_updated', (e) => {
      try {
        const updated = JSON.parse(e.data);
        setStoreSettings(updated);
      } catch (err) {
        console.error('SSE settings error:', err);
      }
    });

    eventSource.addEventListener('price_updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        const updatedProduct: Product = data.product;
        // Check if item is in current cart
        setCart(currentCart => {
          const cartItem = currentCart.find(it => it.productId === updatedProduct.id);
          if (cartItem && cartItem.product.finalPrice !== updatedProduct.finalPrice) {
            setPendingPriceChanges(prev => [
              ...prev.filter(c => c.productId !== updatedProduct.id),
              {
                productId: updatedProduct.id,
                name: updatedProduct.name,
                sku: updatedProduct.sku,
                oldPrice: cartItem.product.finalPrice,
                currentPrice: updatedProduct.finalPrice,
                diff: updatedProduct.finalPrice - cartItem.product.finalPrice,
                unit: updatedProduct.unit
              }
            ]);
            setLiveEventNotice(`Price updated for ${updatedProduct.name}: ₹${cartItem.product.finalPrice.toLocaleString('en-IN')} → ₹${updatedProduct.finalPrice.toLocaleString('en-IN')}`);
          }
          return currentCart;
        });
      } catch (err) {
        console.error('SSE price error:', err);
      }
    });

    eventSource.addEventListener('product_permanently_deleted', (e) => {
      try {
        const data = JSON.parse(e.data);
        const deletedId = data.id;
        setCart(prev => prev.filter(item => item.productId !== deletedId));
        setWishlist(prev => prev.filter(id => id !== deletedId));
        setPendingPriceChanges(prev => prev.filter(c => c.productId !== deletedId));
      } catch (err) {
        console.error('SSE product deleted error:', err);
      }
    });

    eventSource.addEventListener('products_bulk_deleted', (e) => {
      try {
        const data = JSON.parse(e.data);
        const deletedIds: string[] = data.productIds || [];
        const idSet = new Set(deletedIds);
        setCart(prev => prev.filter(item => !idSet.has(item.productId)));
        setWishlist(prev => prev.filter(id => !idSet.has(id)));
        setPendingPriceChanges(prev => prev.filter(c => !idSet.has(c.productId)));
      } catch (err) {
        console.error('SSE bulk products deleted error:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Validate cart prices against current backend prices
  const checkCartPrices = async (): Promise<CartPriceChange[]> => {
    if (cart.length === 0) {
      setPendingPriceChanges([]);
      return [];
    }
    try {
      const itemsPayload = cart.map(it => ({
        productId: it.productId,
        expectedFinalPrice: it.product.finalPrice
      }));
      const res = await validateCartPrices(itemsPayload);
      setPendingPriceChanges(res.priceChanges);
      return res.priceChanges;
    } catch (err) {
      console.error('Failed to validate cart prices against backend:', err);
      return [];
    }
  };

  // Customer accepts the new product price
  const acceptNewCartPrices = async (): Promise<void> => {
    try {
      const freshProducts = await fetchProducts();
      setCart(currentCart => currentCart.map(item => {
        const fresh = freshProducts.find(p => p.id === item.productId);
        if (fresh) {
          return {
            ...item,
            product: fresh
          };
        }
        return item;
      }));
      setPendingPriceChanges([]);
      setLiveEventNotice('Cart prices updated to current rates. You may now proceed.');
    } catch (err) {
      console.error('Failed to refresh cart products:', err);
    }
  };

  const dismissPriceChangeWarning = () => {
    setPendingPriceChanges([]);
  };

  // Verify cart prices on initial load and when cart length changes
  useEffect(() => {
    if (cart.length > 0) {
      checkCartPrices();
    } else {
      setPendingPriceChanges([]);
    }
  }, [cart.length]);

  const refreshSettings = async () => {
    try {
      const data = await fetchStoreSettings();
      setStoreSettings(data);
    } catch {
      // fallback to initial
    }
  };

  const refreshOrders = async () => {
    try {
      const allOrders = await fetchOrders(profile.phone ? { phone: profile.phone } : {});
      setOrders(allOrders);
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
    }
  };

  const refreshQuotes = async () => {
    try {
      const allQuotes = await fetchQuotes(profile.phone ? { phone: profile.phone } : {});
      setQuotes(allQuotes);
    } catch (err) {
      console.error('Failed to fetch customer quotes:', err);
    }
  };

  const addPlacedOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setLiveEventNotice(`Order #${newOrder.orderNumber} placed! Pickup PIN: ${newOrder.pickupPin}`);
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Order Placed #${newOrder.orderNumber}`,
        message: `Your pickup order is confirmed. Show PIN ${newOrder.pickupPin} at Hampi Road store.`,
        type: 'order',
        orderId: newOrder.id,
        timestamp: new Date().toISOString(),
        isRead: false
      },
      ...prev
    ]);
  };

  const addToCart = (product: Product, quantity = 1, selectedSize?: string, selectedThickness?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, product.availableStock || product.stock)
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          product,
          quantity: Math.min(quantity, product.availableStock || product.stock),
          selectedSize: selectedSize || product.size,
          selectedThickness: selectedThickness || product.thickness
        }
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const maxStock = item.product.availableStock || item.product.stock;
        return {
          ...item,
          quantity: Math.min(quantity, maxStock)
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const updateProfile = (updates: Partial<CustomerProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const dismissNotice = () => setLiveEventNotice(null);

  // Cart calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.finalPrice * item.quantity), 0);
  const cartDiscount = cart.reduce((sum, item) => sum + ((item.product.price - item.product.finalPrice) * item.quantity), 0);
  const cartGst = Math.round(cartSubtotal * 0.18);
  const cartTotal = cartSubtotal; // Consumer price inclusive

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartGst,
        cartTotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        profile,
        updateProfile,
        orders,
        refreshOrders,
        addPlacedOrder,
        quotes,
        refreshQuotes,
        notifications,
        markNotificationAsRead,
        unreadNotificationsCount,
        storeSettings,
        refreshSettings,
        liveEventNotice,
        dismissNotice,
        pendingPriceChanges,
        checkCartPrices,
        acceptNewCartPrices,
        dismissPriceChangeWarning
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
