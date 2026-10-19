import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Role, AdminNotification, Order } from '../types';
import { 
  fetchAdminNotifications, 
  markNotificationAsRead, 
  loginAdmin,
  fetchAdminSession,
  adminLogout, 
  verifyPickup,
  setAdminSession,
  clearAdminSession
} from '../lib/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface NewOrderToast {
  orderNumber: string;
  customerName: string;
  total: number;
  pin: string;
  id: string;
}

interface AdminContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  loginWithCredentials: (adminId: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  loginWithPin: (pin: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  login: (email: string, role?: Role) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: Role) => void;
  verifyPickupPin: (pin: string) => Promise<{ success: boolean; message: string; order?: any }>;
  notifications: AdminNotification[];
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearNotifications: () => void;
  unreadCount: number;
  unreadNotificationCount: number;
  soundAlertEnabled: boolean;
  toggleSoundAlert: () => void;
  playOrderChimeSound: () => void;
  latestOrderToast: NewOrderToast | null;
  dismissOrderToast: () => void;

  // Permissions
  canManageSettings: boolean;
  canManageStaff: boolean;
  canManageProducts: boolean;
  canManageInventory: boolean;
  canVerifyPickup: boolean;
  canViewReports: boolean;
  canChangePrices: boolean;
  currentRole: Role;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// High quality order chime audio synthesizer (Ding-Dong-Ding cashier bell)
function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Chime Note 1: E5 (659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Chime Note 2: G#5 (830.61Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(830.61, now + 0.12);
    gain2.gain.setValueAtTime(0.4, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);

    // Chime Note 3: B5 (987.77Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(987.77, now + 0.28);
    gain3.gain.setValueAtTime(0.45, now + 0.28);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.28);
    osc3.stop(now + 0.85);
  } catch (err) {
    console.warn('Audio alert could not be played automatically:', err);
  }
}

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [soundAlertEnabled, setSoundAlertEnabled] = useState<boolean>(true);
  const [latestOrderToast, setLatestOrderToast] = useState<NewOrderToast | null>(null);

  // Set of order notification IDs that have already triggered sound to prevent repeat on refresh
  const playedOrderNotificationIdsRef = useRef<Set<string>>(new Set());
  const initialLoadCompletedRef = useRef<boolean>(false);

  // Restore authenticated session smoothly across navigation & refresh
  useEffect(() => {
    let isMounted = true;
    async function restoreSession() {
      try {
        const session = await fetchAdminSession();
        if (isMounted) {
          if (session.authenticated && session.user) {
            setUser({
              id: session.user.id,
              name: session.user.name,
              email: session.user.email || `${session.user.id.toLowerCase()}@welcomehardware.internal`,
              role: (session.user.role || 'OWNER') as Role
            });
          } else {
            setUser(null);
          }
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsCheckingAuth(false);
      }
    }
    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Unlock Web Audio context on user interaction if browser restricted it
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const testCtx = new AudioCtx();
          if (testCtx.state === 'suspended') {
            testCtx.resume();
          }
        }
      } catch {}
    };

    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Inactivity timeout tracking (15 minutes)
  useEffect(() => {
    if (!user) return;
    let timer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
      }, 15 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    resetInactivityTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
    };
  }, [user]);

  // Load initial notifications upon login without playing sound for historical orders
  useEffect(() => {
    if (user) {
      refreshNotifications(true);
    } else {
      setNotifications([]);
      initialLoadCompletedRef.current = false;
    }
  }, [user]);

  // Real-time SSE notification & new-order listener
  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('admin_notification', (e) => {
      try {
        const notif: AdminNotification = JSON.parse(e.data);
        
        setNotifications(prev => {
          if (prev.some(n => n.id === notif.id)) return prev;
          return [notif, ...prev];
        });

        // Trigger sound only for newly received customer orders that haven't been sounded yet
        if (notif.type === 'order' && notif.id && !playedOrderNotificationIdsRef.current.has(notif.id)) {
          playedOrderNotificationIdsRef.current.add(notif.id);
          if (soundAlertEnabled) {
            playOrderChime();
          }
        }
      } catch (err) {
        console.error('Notification SSE parse error:', err);
      }
    });

    eventSource.addEventListener('new_order', (e) => {
      try {
        const order: Order = JSON.parse(e.data);
        const orderKey = `order-${order.id || order.orderNumber}`;

        if (!playedOrderNotificationIdsRef.current.has(orderKey)) {
          playedOrderNotificationIdsRef.current.add(orderKey);

          // Play clear notification chime
          if (soundAlertEnabled) {
            playOrderChime();
          }

          // Show prominent real-time notification toast
          setLatestOrderToast({
            orderNumber: order.orderNumber,
            customerName: order.customer.name,
            total: order.grandTotal,
            pin: order.pickupPin,
            id: order.id
          });
        }
      } catch (err) {
        console.error('New order SSE parse error:', err);
      }
    });

    // Fallback polling every 8 seconds for notifications in case of network drops
    const pollInterval = setInterval(() => {
      refreshNotifications(false);
    }, 8000);

    return () => {
      eventSource.close();
      clearInterval(pollInterval);
    };
  }, [user, soundAlertEnabled]);

  const refreshNotifications = async (isInitialBoot: boolean = false) => {
    try {
      const list = await fetchAdminNotifications();
      
      // If initial boot, register all existing orders as already seen so sound doesn't play on refresh
      if (isInitialBoot || !initialLoadCompletedRef.current) {
        list.forEach(n => {
          if (n.id) playedOrderNotificationIdsRef.current.add(n.id);
          if (n.orderId) playedOrderNotificationIdsRef.current.add(`order-${n.orderId}`);
        });
        initialLoadCompletedRef.current = true;
      } else {
        // Check for any newly appeared unplayed order notification
        list.forEach(n => {
          if (n.type === 'order' && n.id && !playedOrderNotificationIdsRef.current.has(n.id)) {
            playedOrderNotificationIdsRef.current.add(n.id);
            if (soundAlertEnabled) {
              playOrderChime();
            }
          }
        });
      }

      setNotifications(list);
    } catch (err) {
      console.error('Failed to fetch admin notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const dismissOrderToast = () => {
    setLatestOrderToast(null);
  };

  // Admin Sign In with Authorized ID and shared password
  const loginWithCredentials = async (adminId: string, password: string) => {
    try {
      const res = await loginAdmin(adminId, password);
      if (res.success && res.user) {
        const adminUser: AdminUser = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email || `${res.user.id.toLowerCase()}@welcomehardware.internal`,
          role: (res.user.role || 'OWNER') as Role
        };
        setUser(adminUser);
        return { success: true };
      }
      return {
        success: false,
        error: res.error || 'Invalid Admin ID or Password.'
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Authentication error occurred.'
      };
    }
  };

  // Backward-compatible loginWithPin
  const loginWithPin = async (pin: string) => {
    return loginWithCredentials('Jayesh.WH.4516', pin);
  };

  const login = async (email: string, role: Role = 'OWNER') => {
    const adminUser: AdminUser = {
      id: 'Jayesh.WH.4516',
      name: 'Jayesh',
      email: email || 'jayesh.wh.4516@welcomehardware.internal',
      role
    };
    setUser(adminUser);
  };

  const logout = () => {
    setUser(null);
    clearAdminSession();
    adminLogout().catch(() => {});
  };

  const switchRole = (newRole: Role) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
  };

  const toggleSoundAlert = () => setSoundAlertEnabled(prev => !prev);

  const role = user?.role || 'STAFF';

  const canManageSettings = role === 'OWNER';
  const canManageStaff = role === 'OWNER';
  const canViewReports = role === 'OWNER' || role === 'MANAGER';
  const canManageProducts = role === 'OWNER' || role === 'MANAGER';
  const canManageInventory = role === 'OWNER' || role === 'MANAGER';
  const canVerifyPickup = true;
  const canChangePrices = role === 'OWNER' || role === 'MANAGER';

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AdminContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isCheckingAuth,
        loginWithCredentials,
        loginWithPin,
        login,
        logout,
        switchRole,
        verifyPickupPin: async (pin: string) => verifyPickup({ pin }),
        notifications,
        refreshNotifications: () => refreshNotifications(false),
        markAsRead,
        clearNotifications,
        unreadCount,
        unreadNotificationCount: unreadCount,
        soundAlertEnabled,
        toggleSoundAlert,
        playOrderChimeSound: playOrderChime,
        latestOrderToast,
        dismissOrderToast,
        canManageSettings,
        canManageStaff,
        canManageProducts,
        canManageInventory,
        canVerifyPickup,
        canViewReports,
        canChangePrices,
        currentRole: role
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
