import { 
  Product, 
  Order, 
  Quote, 
  StoreSettings, 
  Offer, 
  AdminNotification, 
  StaffMember,
  PriceHistoryEntry,
  UpdatePricePayload,
  CartPriceValidationResult
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_STORE_SETTINGS, 
  INITIAL_OFFERS, 
  INITIAL_STAFF 
} from '../data/mockData';

// ---------------- BACKEND API CONFIGURATION & RESOLUTION ----------------
export function getCustomBackendUrl(): string {
  try {
    return localStorage.getItem('wh_backend_api_url') || '';
  } catch {
    return '';
  }
}

export function setCustomBackendUrl(url: string): void {
  try {
    if (url && url.trim()) {
      localStorage.setItem('wh_backend_api_url', url.trim());
    } else {
      localStorage.removeItem('wh_backend_api_url');
    }
  } catch {}
}

export function getApiBaseUrl(): string {
  let url = '';
  // 1. User or Admin configured custom endpoint in localStorage
  try {
    const custom = localStorage.getItem('wh_backend_api_url');
    if (custom && custom.trim()) {
      url = custom.trim();
    }
  } catch {}

  // 2. Build-time environment variable (e.g. set during GitHub Actions or .env)
  if (!url) {
    const envUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
      url = envUrl.trim();
    }
  }

  // 3. Normalize configured URL
  if (url) {
    url = url.replace(/\/+$/, '');
    if (!url.endsWith('/api')) {
      url += '/api';
    }
    return url;
  }

  // 4. Localhost or same-origin development/production server
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      if (window.location.port && window.location.port !== '3000') {
        return `${window.location.protocol}//${window.location.hostname}:3000/api`;
      }
      return '/api';
    }
  }

  return '/api';
}

export function isBackendConfigured(): boolean {
  if (typeof window === 'undefined') return true;
  const isGithubPages = window.location.hostname.endsWith('github.io');
  if (!isGithubPages) return true;

  const custom = getCustomBackendUrl();
  if (custom && custom.trim()) return true;

  const envUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) return true;

  return false;
}

export async function testBackendConnection(targetUrl?: string): Promise<{ success: boolean; message: string; details?: any }> {
  let baseUrl = targetUrl ? targetUrl.trim().replace(/\/+$/, '') : getApiBaseUrl();
  if (!baseUrl.endsWith('/api')) {
    baseUrl += '/api';
  }
  const endpoint = `${baseUrl}/health`;
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      return {
        success: false,
        message: `Backend responded with HTTP ${res.status}: ${res.statusText}`
      };
    }
    const data = await res.json().catch(() => ({}));
    if (data.status === 'ok') {
      return {
        success: true,
        message: `Connected to ${data.store || 'Welcome Hardware'} backend successfully!`,
        details: data
      };
    }
    return {
      success: false,
      message: `Unexpected response from server: ${JSON.stringify(data)}`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Could not connect to ${baseUrl}: ${err.message || 'Network error'}`
    };
  }
}

async function parseErrorResponse(res: Response, defaultMessage: string): Promise<string> {
  if (res.status === 405) {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'static host';
    return `Server returned 405 Method Not Allowed. The current host (${host}) does not support API POST requests. GitHub Pages is static hosting only. Please connect your live backend API URL in the Backend Settings below or set VITE_API_URL.`;
  }
  try {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return data.error || data.message || defaultMessage;
    }
    const text = await res.text();
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      return `Backend server returned an HTML error page (HTTP ${res.status}). Verify that the API server is deployed and running.`;
    }
    return text || defaultMessage;
  } catch {
    return defaultMessage;
  }
}

// ---------------- ADMIN AUTHENTICATION SESSION ----------------
let inMemoryAdminToken: string | null = null;
let inMemoryAdminUser: { role?: string; name?: string; id?: string } | null = null;

try {
  inMemoryAdminToken = sessionStorage.getItem('wh_admin_session_token') || localStorage.getItem('wh_admin_session_token');
  const storedUser = sessionStorage.getItem('wh_admin_session_user') || localStorage.getItem('wh_admin_session_user');
  if (storedUser) {
    inMemoryAdminUser = JSON.parse(storedUser);
  }
} catch {
  // Ignore storage access errors
}

export function setAdminSession(token: string | null, user: { role?: string; name?: string; id?: string } | null) {
  inMemoryAdminToken = token;
  inMemoryAdminUser = user;
  try {
    if (token) {
      sessionStorage.setItem('wh_admin_session_token', token);
      localStorage.setItem('wh_admin_session_token', token);
    } else {
      sessionStorage.removeItem('wh_admin_session_token');
      localStorage.removeItem('wh_admin_session_token');
    }
    if (user) {
      sessionStorage.setItem('wh_admin_session_user', JSON.stringify(user));
      localStorage.setItem('wh_admin_session_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('wh_admin_session_user');
      localStorage.removeItem('wh_admin_session_user');
    }
  } catch {}
}

export function clearAdminSession() {
  inMemoryAdminToken = null;
  inMemoryAdminUser = null;
  try {
    sessionStorage.removeItem('wh_admin_session_token');
    sessionStorage.removeItem('wh_admin_session_user');
    localStorage.removeItem('wh_admin_session_token');
    localStorage.removeItem('wh_admin_session_user');
  } catch {}
}

// Backward-compatible aliases
export const setInMemoryAdminSession = setAdminSession;
export const clearInMemoryAdminSession = clearAdminSession;

export function getAdminHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (inMemoryAdminToken) {
    headers['Authorization'] = `Bearer ${inMemoryAdminToken}`;
  }
  if (inMemoryAdminUser) {
    if (inMemoryAdminUser.role) headers['X-Admin-Role'] = inMemoryAdminUser.role;
    if (inMemoryAdminUser.name) headers['X-Admin-User'] = inMemoryAdminUser.name;
  }
  return headers;
}

// ---------------- STORE SETTINGS ----------------
export async function fetchStoreSettings(): Promise<StoreSettings> {
  const apiBase = getApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}/store-info`);
    if (!res.ok) throw new Error('Failed to fetch store info');
    return await res.json();
  } catch {
    return INITIAL_STORE_SETTINGS;
  }
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<{ success: boolean; settings: StoreSettings }> {
  const apiBase = getApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}/store-info`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      credentials: 'include',
      body: JSON.stringify(settings)
    });
    if (!res.ok) {
      const errMsg = await parseErrorResponse(res, 'Failed to update store settings');
      throw new Error(errMsg);
    }
    return await res.json();
  } catch (err: any) {
    if (err.message && !err.message.includes('Failed to fetch')) {
      throw err;
    }
    const merged = { ...INITIAL_STORE_SETTINGS, ...settings };
    return { success: true, settings: merged };
  }
}

// ---------------- PRODUCTS ----------------
export async function fetchProducts(params: Record<string, string> = {}): Promise<Product[]> {
  const apiBase = getApiBaseUrl();
  try {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${apiBase}/products?${query}` : `${apiBase}/products`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch {
    // If backend is unreachable, serve initial product catalog as graceful offline fallback
    let list: Product[] = [...INITIAL_PRODUCTS];
    if (params.category) {
      const c = params.category.toLowerCase();
      list = list.filter(p => p.category.toLowerCase() === c || p.subCategory?.toLowerCase() === c);
    }
    if (params.brand) {
      const b = params.brand.toLowerCase();
      list = list.filter(p => p.brand.toLowerCase() === b);
    }
    if (params.thickness) {
      const t = params.thickness.toLowerCase();
      list = list.filter(p => p.thickness && p.thickness.toLowerCase().includes(t));
    }
    if (params.material) {
      const m = params.material.toLowerCase();
      list = list.filter(p => p.material && p.material.toLowerCase().includes(m));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (params.inStockOnly === 'true') {
      list = list.filter(p => p.availableStock > 0);
    }
    if (params.sort === 'price_asc') {
      list.sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (params.sort === 'price_desc') {
      list.sort((a, b) => b.finalPrice - a.finalPrice);
    }
    return list;
  }
}

export async function fetchProductById(id: string): Promise<{ product: Product; related: Product[]; reviews: any[] }> {
  const apiBase = getApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product details');
    return await res.json();
  } catch {
    const product = INITIAL_PRODUCTS.find(p => p.id === id) || INITIAL_PRODUCTS[0];
    const related = INITIAL_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    return { product, related, reviews: [] };
  }
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/products`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(productData)
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to create product');
    throw new Error(errMsg);
  }
  return res.json();
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/products/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to update product');
    throw new Error(errMsg);
  }
  return res.json();
}

export async function updateProductPrice(
  id: string,
  payload: UpdatePricePayload
): Promise<{ success: boolean; product: Product; history: PriceHistoryEntry }> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/products/${id}/price`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to update product price');
    throw new Error(errMsg);
  }
  return res.json();
}

export async function bulkUpdateProductPrices(
  updates: { productId: string; price?: number; discount?: number; reason?: string }[]
): Promise<{ success: boolean; updatedCount: number; products: Product[]; history: PriceHistoryEntry[] }> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/products/bulk-prices`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ updates })
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to update bulk prices');
    throw new Error(errMsg);
  }
  return res.json();
}

export async function fetchPriceHistory(productId?: string): Promise<PriceHistoryEntry[]> {
  const apiBase = getApiBaseUrl();
  const query = productId ? `?productId=${encodeURIComponent(productId)}` : '';
  const res = await fetch(`${apiBase}/price-history${query}`);
  if (!res.ok) throw new Error('Failed to fetch price history');
  return res.json();
}

export async function validateCartPrices(
  items: { productId: string; expectedFinalPrice: number }[]
): Promise<CartPriceValidationResult> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/cart/validate-prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  if (!res.ok) throw new Error('Failed to validate cart prices');
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/products/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to delete product');
    throw new Error(errMsg);
  }
}

export async function deleteProductPermanently(id: string): Promise<{ success: boolean; message: string }> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/products/${id}/permanent`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to permanently delete product');
    throw new Error(errMsg);
  }
  return res.json();
}

export async function bulkDeleteProductsPermanently(productIds: string[]): Promise<{ success: boolean; count: number; message: string }> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/products/bulk-delete`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ productIds })
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to permanently delete selected products');
    throw new Error(errMsg);
  }
  return res.json();
}

export async function setProductStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Product> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/products/${id}/status`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to update product status');
    throw new Error(errMsg);
  }
  const data = await res.json();
  return data.product;
}

export async function fetchAdminProducts(params: Record<string, string> = {}): Promise<Product[]> {
  const apiBase = getApiBaseUrl();
  const query = new URLSearchParams({ ...params, includeInactive: 'true' }).toString();
  const res = await fetch(`${apiBase}/products?${query}`, {
    headers: getAdminHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch admin products');
  return res.json();
}

// ---------------- ADMIN AUTHENTICATION ----------------
export async function loginAdmin(adminId: string, password: string): Promise<{
  success: boolean;
  token?: string;
  user?: any;
  error?: string;
}> {
  const trimmedId = adminId?.trim();
  const trimmedPw = password?.trim();

  if (!trimmedId) {
    return { success: false, error: 'Please enter your Admin ID.' };
  }
  if (!trimmedPw) {
    return { success: false, error: 'Please enter your Admin password.' };
  }

  const apiBase = getApiBaseUrl();

  // If running on GitHub Pages without a configured backend
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io') && !isBackendConfigured()) {
    return {
      success: false,
      error: 'Backend server not configured. GitHub Pages serves static content only and cannot process server-side authentication. Please enter your live backend server URL in the Backend Connection Settings below.'
    };
  }

  try {
    const res = await fetch(`${apiBase}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ adminId: trimmedId, password: trimmedPw })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.token) {
        setAdminSession(data.token, data.user);
        return data;
      }
      return { success: false, error: data.error || 'Authentication failed' };
    }

    const errorMsg = await parseErrorResponse(res, 'Authentication failed. Please verify your credentials.');
    return { success: false, error: errorMsg };
  } catch (err: any) {
    const isConnErr = err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError');
    return {
      success: false,
      error: isConnErr
        ? `Cannot reach backend server at ${apiBase}. Ensure the backend is deployed, running, and accessible.`
        : (err.message || 'Authentication error occurred.')
    };
  }
}

export async function fetchAdminSession(): Promise<{
  authenticated: boolean;
  user?: any;
  store?: string;
}> {
  const apiBase = getApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}/auth/session`, {
      headers: getAdminHeaders(),
      credentials: 'include'
    });
    if (!res.ok) {
      clearAdminSession();
      return { authenticated: false };
    }
    const data = await res.json();
    if (data.authenticated && data.user) {
      const activeTok = data.token || inMemoryAdminToken;
      setAdminSession(activeTok, data.user);
    }
    return data;
  } catch {
    if (inMemoryAdminToken && inMemoryAdminUser) {
      return { authenticated: true, user: inMemoryAdminUser, store: 'Welcome Hardware' };
    }
    return { authenticated: false };
  }
}

export async function verifyAdminPin(pin: string): Promise<any> {
  return loginAdmin('Jayesh.WH.4516', pin);
}

export async function fetchAdminStatus(): Promise<{ locked: boolean; attemptsRemaining: number }> {
  return { locked: false, attemptsRemaining: 3 };
}

export async function adminLogout(): Promise<void> {
  const apiBase = getApiBaseUrl();
  try {
    await fetch(`${apiBase}/auth/admin-logout`, {
      method: 'POST',
      headers: getAdminHeaders(),
      credentials: 'include'
    });
  } catch {
    // Ignore network errors on logout
  } finally {
    clearAdminSession();
  }
}

// ---------------- ORDERS ----------------
export async function createOrder(orderPayload: any): Promise<Order> {
  const apiBase = getApiBaseUrl();

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io') && !isBackendConfigured()) {
    throw new Error('Backend server is not connected. GitHub Pages serves static files only and cannot persist customer orders or allocate store inventory. Please configure your live backend API URL.');
  }

  try {
    const res = await fetch(`${apiBase}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(orderPayload.idempotencyKey ? { 'X-Idempotency-Key': orderPayload.idempotencyKey } : {})
      },
      body: JSON.stringify(orderPayload)
    });

    if (res.ok) {
      return await res.json();
    }

    const errorMsg = await parseErrorResponse(res, 'Failed to create order');
    throw new Error(errorMsg);
  } catch (err: any) {
    if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      throw new Error(`Cannot reach backend server at ${apiBase}. Please verify that the backend server is running and accessible.`);
    }
    throw err;
  }
}

export async function fetchOrders(params: Record<string, string> = {}): Promise<Order[]> {
  const apiBase = getApiBaseUrl();
  const query = new URLSearchParams(params).toString();
  const url = query ? `${apiBase}/orders?${query}` : `${apiBase}/orders`;
  const res = await fetch(url, {
    headers: getAdminHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to fetch orders');
    throw new Error(errMsg);
  }
  return await res.json();
}

export async function fetchOrderById(id: string): Promise<Order> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/orders/${id}`, {
    headers: getAdminHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Order not found');
    throw new Error(errMsg);
  }
  return await res.json();
}

export async function updateOrderStatus(orderId: string, status: string, note?: string, user?: string): Promise<Order> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status, note, user })
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to update order status');
    throw new Error(errMsg);
  }
  return res.json();
}

export async function verifyPickup(query: { pin?: string; orderNumber?: string }): Promise<{ success: boolean; message: string; order?: Order }> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/pickup/verify`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify(query)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Verification failed');
  }
  return data;
}

export async function confirmOrderCollection(orderId: string, staffName: string): Promise<{ success: boolean; message: string; order: Order }> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/pickup/collect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, staffName })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Collection failed');
  }
  return data;
}

// ---------------- QUOTES ----------------
export async function createQuote(quotePayload: any): Promise<Quote> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quotePayload)
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to submit quote');
    throw new Error(errMsg);
  }
  return res.json();
}

export async function fetchQuotes(params: Record<string, string> = {}): Promise<Quote[]> {
  const apiBase = getApiBaseUrl();
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${apiBase}/quotes?${query}`);
  if (!res.ok) throw new Error('Failed to fetch quotes');
  return res.json();
}

export async function fetchQuoteById(id: string): Promise<Quote> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/quotes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch quote');
  return res.json();
}

export async function updateQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/quotes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to update quote');
    throw new Error(errMsg);
  }
  return res.json();
}

export async function convertQuoteToOrder(id: string): Promise<{ success: boolean; order: Order }> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/quotes/${id}/convert-to-order`, {
    method: 'POST'
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to convert quote');
    throw new Error(errMsg);
  }
  return res.json();
}

// ---------------- INVENTORY ----------------
export async function fetchInventory(): Promise<{ products: Product[]; logs: any[]; summary: any }> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}

export async function adjustInventory(productId: string, change: number, reason: string, staffName: string): Promise<any> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/inventory/adjust`, {
    method: 'POST',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ productId, change, reason, staffName })
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to adjust inventory');
    throw new Error(errMsg);
  }
  return res.json();
}

export async function adjustProductStock(productId: string, change: number, reason: string = 'Stock adjustment', staffName: string = 'Admin'): Promise<Product> {
  return adjustInventory(productId, change, reason, staffName);
}

export async function updateProductStockQuantity(productId: string, stock: number, reason: string = 'Stock Maintaining update'): Promise<Product> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/products/${productId}/stock`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ stock, reason, staffName: 'Admin' })
  });
  if (!res.ok) {
    const errMsg = await parseErrorResponse(res, 'Failed to update stock quantity');
    throw new Error(errMsg);
  }
  const data = await res.json();
  return data.product;
}

// ---------------- OFFERS, NOTIFICATIONS, REPORTS, STAFF ----------------
export async function fetchOffers(): Promise<Offer[]> {
  const apiBase = getApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}/offers`);
    if (!res.ok) return INITIAL_OFFERS;
    return res.json();
  } catch {
    return INITIAL_OFFERS;
  }
}

export async function fetchAdminNotifications(): Promise<AdminNotification[]> {
  const apiBase = getApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}/notifications`, {
      headers: getAdminHeaders(),
      credentials: 'include'
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const apiBase = getApiBaseUrl();
  await fetch(`${apiBase}/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include'
  }).catch(() => {});
}

export async function fetchReports(): Promise<any> {
  const apiBase = getApiBaseUrl();
  const res = await fetch(`${apiBase}/reports`, {
    headers: getAdminHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchStaff(): Promise<StaffMember[]> {
  const apiBase = getApiBaseUrl();
  try {
    const res = await fetch(`${apiBase}/staff`);
    if (!res.ok) return INITIAL_STAFF;
    return res.json();
  } catch {
    return INITIAL_STAFF;
  }
}

export async function createQuoteRequest(quotePayload: any): Promise<any> {
  return createQuote(quotePayload);
}

export async function updateQuoteStatus(id: string, status: string, notes?: string, quotedAmount?: number): Promise<any> {
  return updateQuote(id, {
    status: status as any,
    adminNotes: notes,
    grandTotal: quotedAmount || 0
  });
}
