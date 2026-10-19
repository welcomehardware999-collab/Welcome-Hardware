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

const API_BASE = '/api';

// In-memory admin authentication session backed by sessionStorage for seamless navigation & refresh
let inMemoryAdminToken: string | null = null;
let inMemoryAdminUser: { role?: string; name?: string; id?: string } | null = null;

try {
  inMemoryAdminToken = sessionStorage.getItem('wh_admin_session_token');
  const storedUser = sessionStorage.getItem('wh_admin_session_user');
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
    } else {
      sessionStorage.removeItem('wh_admin_session_token');
    }
    if (user) {
      sessionStorage.setItem('wh_admin_session_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('wh_admin_session_user');
    }
  } catch {}
}

export function clearAdminSession() {
  inMemoryAdminToken = null;
  inMemoryAdminUser = null;
  try {
    sessionStorage.removeItem('wh_admin_session_token');
    sessionStorage.removeItem('wh_admin_session_user');
  } catch {}
}

// Backward-compatible exports
export const setInMemoryAdminSession = setAdminSession;
export const clearInMemoryAdminSession = clearAdminSession;

// Helper to attach admin authentication context to administrative API requests
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

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/store-info`);
  if (!res.ok) throw new Error('Failed to fetch store info');
  return res.json();
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<{ success: boolean; settings: StoreSettings }> {
  const res = await fetch(`${API_BASE}/store-info`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error('Failed to update store settings');
  return res.json();
}

export async function fetchProducts(params: Record<string, string> = {}): Promise<Product[]> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/products?${query}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductById(id: string): Promise<{ product: Product; related: Product[]; reviews: any[] }> {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product details');
  return res.json();
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(productData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create product');
  }
  return res.json();
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update product');
  }
  return res.json();
}

export async function updateProductPrice(
  id: string,
  payload: UpdatePricePayload
): Promise<{ success: boolean; product: Product; history: PriceHistoryEntry }> {
  const res = await fetch(`${API_BASE}/products/${id}/price`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update product price');
  }
  return res.json();
}

export async function bulkUpdateProductPrices(
  updates: { productId: string; price?: number; discount?: number; reason?: string }[]
): Promise<{ success: boolean; updatedCount: number; products: Product[]; history: PriceHistoryEntry[] }> {
  const res = await fetch(`${API_BASE}/products/bulk-prices`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ updates })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update bulk prices');
  }
  return res.json();
}

export async function fetchPriceHistory(productId?: string): Promise<PriceHistoryEntry[]> {
  const query = productId ? `?productId=${encodeURIComponent(productId)}` : '';
  const res = await fetch(`${API_BASE}/price-history${query}`);
  if (!res.ok) throw new Error('Failed to fetch price history');
  return res.json();
}

export async function validateCartPrices(
  items: { productId: string; expectedFinalPrice: number }[]
): Promise<CartPriceValidationResult> {
  const res = await fetch(`${API_BASE}/cart/validate-prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  if (!res.ok) throw new Error('Failed to validate cart prices');
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete product');
}

export async function deleteProductPermanently(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/products/${id}/permanent`, {
    method: 'DELETE',
    headers: getAdminHeaders()
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to permanently delete product');
  }
  return res.json();
}

export async function bulkDeleteProductsPermanently(productIds: string[]): Promise<{ success: boolean; count: number; message: string }> {
  const res = await fetch(`${API_BASE}/products/bulk-delete`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ productIds })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to permanently delete selected products');
  }
  return res.json();
}

export async function setProductStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}/status`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update product status');
  }
  const data = await res.json();
  return data.product;
}

export async function fetchAdminProducts(params: Record<string, string> = {}): Promise<Product[]> {
  const query = new URLSearchParams({ ...params, includeInactive: 'true' }).toString();
  const res = await fetch(`${API_BASE}/products?${query}`);
  if (!res.ok) throw new Error('Failed to fetch admin products');
  return res.json();
}

export async function loginAdmin(adminId: string, password: string): Promise<{
  success: boolean;
  token?: string;
  user?: any;
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ adminId, password })
  });
  const data = await res.json();
  if (data.success && data.token) {
    setAdminSession(data.token, data.user);
  }
  return data;
}

export async function fetchAdminSession(): Promise<{
  authenticated: boolean;
  user?: any;
  store?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/auth/session`, {
      headers: getAdminHeaders(),
      credentials: 'include'
    });
    if (!res.ok) {
      clearAdminSession();
      return { authenticated: false };
    }
    const data = await res.json();
    if (data.authenticated && data.user) {
      setAdminSession(inMemoryAdminToken, data.user);
    }
    return data;
  } catch {
    return { authenticated: false };
  }
}

// Backward-compatibility wrapper for any lingering callers
export async function verifyAdminPin(pin: string): Promise<any> {
  return loginAdmin('Jayesh.WH.4516', pin);
}

export async function fetchAdminStatus(): Promise<{ locked: boolean; attemptsRemaining: number }> {
  return { locked: false, attemptsRemaining: 3 };
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/admin-logout`, {
      method: 'POST',
      headers: getAdminHeaders(),
      credentials: 'include'
    });
  } catch {
    // ignore
  } finally {
    clearAdminSession();
  }
}

export async function createOrder(orderPayload: any): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create order');
  }
  return res.json();
}

export async function fetchOrders(params: Record<string, string> = {}): Promise<Order[]> {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE}/orders?${query}` : `${API_BASE}/orders`;
  const res = await fetch(url, {
    headers: getAdminHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch orders');
  }
  return res.json();
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    headers: getAdminHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch order');
  }
  return res.json();
}

export async function updateOrderStatus(orderId: string, status: string, note?: string, user?: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getAdminHeaders(),
    credentials: 'include',
    body: JSON.stringify({ status, note, user })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update order status');
  }
  return res.json();
}

export async function verifyPickup(query: { pin?: string; orderNumber?: string }): Promise<{ success: boolean; message: string; order?: Order }> {
  const res = await fetch(`${API_BASE}/pickup/verify`, {
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
  const res = await fetch(`${API_BASE}/pickup/collect`, {
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

export async function createQuote(quotePayload: any): Promise<Quote> {
  const res = await fetch(`${API_BASE}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quotePayload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit quote');
  }
  return res.json();
}

export async function fetchQuotes(params: Record<string, string> = {}): Promise<Quote[]> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/quotes?${query}`);
  if (!res.ok) throw new Error('Failed to fetch quotes');
  return res.json();
}

export async function fetchQuoteById(id: string): Promise<Quote> {
  const res = await fetch(`${API_BASE}/quotes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch quote');
  return res.json();
}

export async function updateQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
  const res = await fetch(`${API_BASE}/quotes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update quote');
  }
  return res.json();
}

export async function convertQuoteToOrder(id: string): Promise<{ success: boolean; order: Order }> {
  const res = await fetch(`${API_BASE}/quotes/${id}/convert-to-order`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to convert quote');
  }
  return res.json();
}

export async function fetchInventory(): Promise<{ products: Product[]; logs: any[]; summary: any }> {
  const res = await fetch(`${API_BASE}/inventory`);
  if (!res.ok) throw new Error('Failed to fetch inventory');
  return res.json();
}

export async function adjustInventory(productId: string, change: number, reason: string, staffName: string): Promise<any> {
  const res = await fetch(`${API_BASE}/inventory/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, change, reason, staffName })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to adjust inventory');
  }
  return res.json();
}

export async function fetchOffers(): Promise<Offer[]> {
  const res = await fetch(`${API_BASE}/offers`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchAdminNotifications(): Promise<AdminNotification[]> {
  const res = await fetch(`${API_BASE}/notifications`);
  if (!res.ok) return [];
  return res.json();
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
}

export async function fetchReports(): Promise<any> {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchStaff(): Promise<StaffMember[]> {
  const res = await fetch(`${API_BASE}/staff`);
  if (!res.ok) return [];
  return res.json();
}

export async function adjustProductStock(productId: string, change: number, reason: string = 'Stock adjustment', staffName: string = 'Admin'): Promise<Product> {
  const res = await fetch(`${API_BASE}/inventory/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, change, reason, staffName })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to adjust stock');
  }
  const data = await res.json();
  return data.product;
}

export async function updateProductStockQuantity(productId: string, stock: number, reason: string = 'Stock Maintaining update'): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${productId}/stock`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock, reason, staffName: 'Admin' })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update stock quantity');
  }
  const data = await res.json();
  return data.product;
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

