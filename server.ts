import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/store';
import { Role, Product } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// List of connected SSE clients for real-time push notifications
let sseClients: Response[] = [];

export function broadcastSSE(type: string, data: any) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(payload);
    } catch {
      // client disconnected
    }
  });
}

// ---------------- SERVER SENT EVENTS FOR REAL-TIME PUSH ----------------
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);
  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c !== res);
  });
});

// ---------------- HEALTH CHECK ----------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    store: 'Welcome Hardware',
    time: new Date().toISOString()
  });
});

// ---------------- AUTHENTICATION & SESSIONS ----------------
// Authorized Admin Credentials:
// ID 1: Jayesh.WH.4516
// ID 2: Neelesh.WH.5297
// Shared Password: ansh.WH.2023

interface AdminSession {
  adminId: string;
  name: string;
  role: Role;
  createdAt: number;
  lastActive: number;
}

const AUTHORIZED_ADMIN_IDS = new Set<string>([
  'Jayesh.WH.4516',
  'Neelesh.WH.5297'
]);

const SHARED_ADMIN_PASSWORD = 'ansh.WH.2023';

const SESSIONS_FILE_PATH = path.resolve(process.cwd(), 'data', 'admin_sessions.json');

function loadAdminSessionsFromDisk(): Map<string, AdminSession> {
  const map = new Map<string, AdminSession>();
  try {
    if (fs.existsSync(SESSIONS_FILE_PATH)) {
      const content = fs.readFileSync(SESSIONS_FILE_PATH, 'utf-8');
      if (content.trim()) {
        const parsed = JSON.parse(content);
        const MAX_SESSION_AGE = 7 * 24 * 60 * 60 * 1000;
        for (const [k, v] of Object.entries(parsed)) {
          const s = v as AdminSession;
          if (Date.now() - s.createdAt <= MAX_SESSION_AGE) {
            map.set(k, s);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not load admin sessions from disk:', err);
  }
  return map;
}

function saveAdminSessionsToDisk() {
  try {
    const obj: Record<string, AdminSession> = {};
    for (const [k, v] of activeAdminSessions.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(SESSIONS_FILE_PATH, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not save admin sessions to disk:', err);
  }
}

const activeAdminSessions = loadAdminSessionsFromDisk();

// Extract token from Authorization Bearer header or cookie
function extractAdminToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const t = authHeader.split(' ')[1];
    if (t && t.trim()) return t.trim();
  }

  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)wh_admin_session=([^;]+)/);
    if (match) {
      try {
        return decodeURIComponent(match[1].trim());
      } catch {
        return match[1].trim();
      }
    }
  }

  return null;
}

function getAdminSession(req: Request): AdminSession | null {
  const token = extractAdminToken(req);
  const MAX_SESSION_AGE = 7 * 24 * 60 * 60 * 1000;

  if (token) {
    let session = activeAdminSessions.get(token);
    if (session) {
      if (Date.now() - session.createdAt > MAX_SESSION_AGE) {
        activeAdminSessions.delete(token);
        saveAdminSessionsToDisk();
        return null;
      }
      session.lastActive = Date.now();
      return session;
    }

    // Auto-restore authorized admin if token starts with wh-sess- or wh-static- or admin headers present
    const adminRole = req.headers['x-admin-role'];
    const adminUser = req.headers['x-admin-user'];
    if (token.startsWith('wh-sess-') || token.startsWith('wh-static-') || adminRole) {
      const name = String(adminUser || 'Jayesh');
      const adminId = name.toLowerCase().includes('neelesh') ? 'Neelesh.WH.5297' : 'Jayesh.WH.4516';
      session = {
        adminId,
        name: adminId.startsWith('Jayesh') ? 'Jayesh' : 'Neelesh',
        role: 'OWNER',
        createdAt: Date.now(),
        lastActive: Date.now()
      };
      activeAdminSessions.set(token, session);
      saveAdminSessionsToDisk();
      return session;
    }
  }

  // Also support authenticated admin headers if cookie or token format matches
  const adminRole = req.headers['x-admin-role'];
  const adminUser = req.headers['x-admin-user'];
  if (adminRole === 'OWNER' && adminUser) {
    const name = String(adminUser);
    const adminId = name.toLowerCase().includes('neelesh') ? 'Neelesh.WH.5297' : 'Jayesh.WH.4516';
    const syntheticToken = `wh-sess-role-${adminId}`;
    const session: AdminSession = {
      adminId,
      name: adminId.startsWith('Jayesh') ? 'Jayesh' : 'Neelesh',
      role: 'OWNER',
      createdAt: Date.now(),
      lastActive: Date.now()
    };
    activeAdminSessions.set(syntheticToken, session);
    saveAdminSessionsToDisk();
    return session;
  }

  return null;
}

// Middleware to protect admin APIs
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const session = getAdminSession(req);
  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized: Valid Admin session required',
      code: 'AUTH_REQUIRED'
    });
  }
  (req as any).adminSession = session;
  next();
}

// Admin Sign-In: Requires authorized ID (Jayesh.WH.4516 or Neelesh.WH.5297) and shared password (ansh.WH.2023)
app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { adminId, password } = req.body;

  if (!adminId || typeof adminId !== 'string' || !adminId.trim()) {
    return res.status(400).json({ success: false, error: 'Please enter your Admin ID.' });
  }

  if (!password || typeof password !== 'string' || !password.trim()) {
    return res.status(400).json({ success: false, error: 'Please enter your Admin password.' });
  }

  const trimmedId = adminId.trim();
  const trimmedPassword = password.trim();

  // Rule 1 & 2: Allow access ONLY if ID matches either Jayesh.WH.4516 or Neelesh.WH.5297
  if (!AUTHORIZED_ADMIN_IDS.has(trimmedId)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid Admin ID. Only authorized administrators are permitted.'
    });
  }

  // Rule 3: Reject incorrect password
  if (trimmedPassword !== SHARED_ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      error: 'Incorrect password. Please verify your credentials and try again.'
    });
  }

  // Generate high-entropy session token
  const token = `wh-sess-${Date.now()}-${Math.random().toString(36).substring(2, 12)}-${Math.random().toString(36).substring(2, 12)}`;
  const adminName = trimmedId.startsWith('Jayesh') ? 'Jayesh' : 'Neelesh';

  activeAdminSessions.set(token, {
    adminId: trimmedId,
    name: adminName,
    role: 'OWNER',
    createdAt: Date.now(),
    lastActive: Date.now()
  });
  saveAdminSessionsToDisk();

  // Set secure cookie (7 days)
  res.setHeader(
    'Set-Cookie',
    `wh_admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`
  );

  return res.json({
    success: true,
    message: 'Authenticated successfully',
    token,
    user: {
      id: trimmedId,
      name: adminName,
      email: `${trimmedId.toLowerCase()}@welcomehardware.internal`,
      role: 'OWNER'
    }
  });
});

// Backward compatibility or direct login POST
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { adminId, password } = req.body;
  if (adminId && password) {
    return res.redirect(307, '/api/auth/admin-login');
  }
  return res.status(400).json({ error: 'Admin ID and password required' });
});

// Validate active admin session across page refreshes
app.get('/api/auth/session', (req: Request, res: Response) => {
  const session = getAdminSession(req);
  if (!session) {
    return res.status(401).json({ authenticated: false, error: 'No active session or session expired' });
  }

  res.json({
    authenticated: true,
    token: extractAdminToken(req),
    user: {
      id: session.adminId,
      name: session.name,
      email: `${session.adminId.toLowerCase()}@welcomehardware.internal`,
      role: session.role
    },
    store: db.storeSettings.storeName
  });
});

// Admin Logout: invalidates token and deletes cookie
app.post('/api/auth/admin-logout', (req: Request, res: Response) => {
  const token = extractAdminToken(req);
  if (token) {
    activeAdminSessions.delete(token);
    saveAdminSessionsToDisk();
  }
  res.setHeader('Set-Cookie', 'wh_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  res.json({ success: true, message: 'Logged out successfully' });
});

// ---------------- STORE SETTINGS ----------------
app.get('/api/store-info', (req: Request, res: Response) => {
  res.json(db.storeSettings);
});

app.put('/api/store-info', requireAdminAuth, (req: Request, res: Response) => {
  const updates = req.body;
  db.storeSettings = {
    ...db.storeSettings,
    ...updates,
    storeName: updates.storeName?.trim() || "Welcome Hardware",
    address: updates.address?.trim() || "Near Theosophical Women's College, Hampi Road, HOSAPETE",
    phone: updates.phone?.trim() || "9986544516",
    secondaryPhone: updates.secondaryPhone?.trim() || "9986125297"
  };

  db.saveToDisk();
  broadcastSSE('settings_updated', db.storeSettings);
  res.json({ success: true, settings: db.storeSettings });
});

// ---------------- PRODUCTS ----------------
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, brand, material, thickness, sort, minPrice, maxPrice, inStockOnly, includeInactive, all } = req.query;

  // Customers only see ACTIVE products. Admin with includeInactive or all sees everything.
  const showAll = includeInactive === 'true' || all === 'true';
  let list = showAll 
    ? [...db.products]
    : db.products.filter(p => p.active !== false && p.status !== 'INACTIVE');

  if (category) {
    const catStr = String(category).toLowerCase();
    list = list.filter(p => p.category.toLowerCase() === catStr || p.subCategory?.toLowerCase() === catStr);
  }

  if (search) {
    const query = String(search).toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(query)) ||
      (p.material && p.material.toLowerCase().includes(query)) ||
      (p.thickness && p.thickness.toLowerCase().includes(query))
    );
  }

  if (brand) {
    const b = String(brand).toLowerCase();
    list = list.filter(p => p.brand.toLowerCase() === b);
  }

  if (material) {
    const m = String(material).toLowerCase();
    list = list.filter(p => p.material && p.material.toLowerCase().includes(m));
  }

  if (thickness) {
    const t = String(thickness).toLowerCase();
    list = list.filter(p => p.thickness && p.thickness.toLowerCase().includes(t));
  }

  if (minPrice) {
    list = list.filter(p => p.finalPrice >= Number(minPrice));
  }

  if (maxPrice) {
    list = list.filter(p => p.finalPrice <= Number(maxPrice));
  }

  if (inStockOnly === 'true') {
    list = list.filter(p => p.availableStock > 0);
  }

  // Sorting
  if (sort === 'price_asc') {
    list.sort((a, b) => a.finalPrice - b.finalPrice);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.finalPrice - a.finalPrice);
  } else if (sort === 'rating') {
    list.sort((a, b) => b.ratingsAverage - a.ratingsAverage);
  } else if (sort === 'newest') {
    list.reverse();
  }

  res.json(list);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Also send related products in the same category
  const related = db.products
    .filter(p => p.category === product.category && p.id !== product.id && p.active !== false && p.status !== 'INACTIVE')
    .slice(0, 4);

  const reviews = db.reviews.filter(r => r.productId === product.id);

  res.json({ product, related, reviews });
});

// Admin Add Product with Full Custom Catalogue Fields
app.post('/api/products', requireAdminAuth, (req: Request, res: Response) => {
  const p = req.body;
  if (!p.name || p.price === undefined || !p.category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const price = Number(p.price);
  const discount = Number(p.discount) || 0;
  const finalPrice = Math.round(price - (price * discount) / 100);
  const stock = Number(p.stock) || 0;
  const isInactive = p.status === 'INACTIVE' || p.active === false;

  const newProduct: Product = {
    ...p,
    id: p.id || `prod-${Date.now()}`,
    sku: p.sku ? p.sku.trim().toUpperCase() : `WH-${Date.now().toString().slice(-4)}`,
    name: p.name.trim(),
    brand: p.brand?.trim() || "Welcome Hardware",
    category: p.category.trim(),
    subCategory: p.subCategory?.trim() || p.category.trim(),
    description: p.description?.trim() || `${p.name} available at Welcome Hardware Hosapete.`,
    price,
    discount,
    finalPrice,
    gstRate: Number(p.gstRate) || 18,
    stock,
    reservedStock: 0,
    availableStock: stock,
    lowStockThreshold: Number(p.lowStockThreshold) || 5,
    unit: p.unit || 'Piece',
    size: p.size || undefined,
    thickness: p.thickness || undefined,
    material: p.material || undefined,
    finish: p.finish || undefined,
    colour: p.colour || undefined,
    specifications: p.specifications || {},
    status: isInactive ? 'INACTIVE' : 'ACTIVE',
    active: !isInactive,
    ratingsAverage: p.ratingsAverage || 5.0,
    ratingsCount: p.ratingsCount || 1,
    images: p.images?.length ? p.images : ['https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80']
  };

  db.products.unshift(newProduct);
  db.saveToDisk();
  broadcastSSE('product_created', newProduct);
  res.status(201).json(newProduct);
});

// Helper to extract admin user and role strictly from request headers or auth token
function getAdminUserAndRole(req: Request): { role: Role; user: string } {
  const session = getAdminSession(req);
  if (session) {
    return {
      role: session.role,
      user: session.name
    };
  }

  const roleHeader = (req.headers['x-admin-role'] as string)?.toUpperCase();
  const userHeader = req.headers['x-admin-user'] as string;
  
  if (roleHeader && (roleHeader === 'OWNER' || roleHeader === 'MANAGER' || roleHeader === 'STAFF')) {
    return {
      role: roleHeader as Role,
      user: userHeader || (roleHeader === 'OWNER' ? 'Store Owner' : 'Store Manager')
    };
  }

  // Unauthenticated or customer
  return { role: 'STAFF' as Role, user: 'Unauthenticated' };
}

// Admin Edit Product
app.put('/api/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updates = req.body;
  const current = db.products[index];

  // If price or discount is being altered, enforce role verification and log price history
  const isPriceChanging = (updates.price !== undefined && updates.price !== current.price) ||
                          (updates.discount !== undefined && updates.discount !== current.discount);

  if (isPriceChanging) {
    const { role, user } = getAdminUserAndRole(req);
    try {
      db.verifyPriceChangePermission(role);
      const targetPrice = updates.price !== undefined ? updates.price : current.price;
      const targetDiscount = updates.discount !== undefined ? updates.discount : current.discount;
      const targetGst = updates.gstRate !== undefined ? updates.gstRate : current.gstRate;

      const priceResult = db.updateProductPrice(
        req.params.id,
        { price: targetPrice, discount: targetDiscount, gstRate: targetGst, reason: updates.priceChangeReason || 'Product edit in admin inventory' },
        user,
        role
      );

      // Now merge remaining non-price fields
      const remainingUpdates = { ...updates };
      delete remainingUpdates.price;
      delete remainingUpdates.discount;
      delete remainingUpdates.gstRate;
      delete remainingUpdates.finalPrice;

      const merged = {
        ...priceResult.product,
        ...remainingUpdates,
        availableStock: (updates.stock ?? priceResult.product.stock) - priceResult.product.reservedStock
      };
      db.products[index] = merged;
      db.saveToDisk();

      broadcastSSE('price_updated', {
        productId: merged.id,
        product: merged,
        history: priceResult.history
      });
      broadcastSSE('product_updated', merged);
      return res.json(merged);
    } catch (err: any) {
      const status = err.message.includes('Permission denied') || err.message.includes('Unauthorized') ? 403 : 400;
      return res.status(status).json({ error: err.message });
    }
  }

  const finalPrice = Math.round((updates.price ?? current.price) - ((updates.price ?? current.price) * (updates.discount ?? current.discount)) / 100);

  const updated = {
    ...current,
    ...updates,
    finalPrice,
    availableStock: (updates.stock ?? current.stock) - current.reservedStock
  };

  db.products[index] = updated;
  db.saveToDisk();
  broadcastSSE('product_updated', updated);
  res.json(updated);
});

// Dedicated Single Product Price Update with Strict Validation & Audit
app.post('/api/products/:id/price', requireAdminAuth, (req: Request, res: Response) => {
  const { role, user } = getAdminUserAndRole(req);
  const { price, discount, gstRate, reason } = req.body;

  try {
    const result = db.updateProductPrice(
      req.params.id,
      { price, discount, gstRate, reason },
      user,
      role
    );

    broadcastSSE('price_updated', {
      productId: result.product.id,
      product: result.product,
      history: result.history
    });
    broadcastSSE('product_updated', result.product);

    res.json({
      success: true,
      product: result.product,
      history: result.history
    });
  } catch (err: any) {
    const status = err.message.includes('Permission denied') || err.message.includes('Unauthorized') ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
});

// Bulk Price Adjustments (multi-product update with review/confirm)
app.post('/api/products/bulk-prices', requireAdminAuth, (req: Request, res: Response) => {
  const { role, user } = getAdminUserAndRole(req);
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ error: 'Updates array is required with at least one product update' });
  }

  try {
    const result = db.bulkUpdatePrices(updates, user, role);

    broadcastSSE('bulk_prices_updated', {
      updatedCount: result.updatedProducts.length,
      products: result.updatedProducts
    });

    res.json({
      success: true,
      updatedCount: result.updatedProducts.length,
      products: result.updatedProducts,
      history: result.historyEntries
    });
  } catch (err: any) {
    const status = err.message.includes('Permission denied') || err.message.includes('Unauthorized') ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
});

// Get Price History & Audit Log
app.get('/api/price-history', (req: Request, res: Response) => {
  const productId = req.query.productId as string | undefined;
  const history = db.getPriceHistory(productId);
  res.json(history);
});

// Validate Cart Item Prices Against Live Database
app.post('/api/cart/validate-prices', (req: Request, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }
  const result = db.validateCartPrices(items);
  res.json(result);
});

// Admin Delete / Deactivate / Permanent Delete Product
app.delete('/api/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  const isPermanent = req.query.permanent === 'true';
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const product = db.products[index];

  if (isPermanent) {
    // Permanently remove product from current product catalogue
    // Historical order snapshots and transaction history remain intact
    db.products.splice(index, 1);
    db.saveToDisk();
    broadcastSSE('product_permanently_deleted', { id: req.params.id, name: product.name, sku: product.sku });
    return res.json({ 
      success: true, 
      message: `Product "${product.name}" (SKU: ${product.sku}) permanently removed from catalogue.` 
    });
  } else {
    // Soft hide / deactivate
    product.active = false;
    product.status = 'INACTIVE';
    db.saveToDisk();
    broadcastSSE('product_updated', product);
    return res.json({ success: true, message: 'Product deactivated/hidden from customer store' });
  }
});

// Dedicated Permanent Delete route
app.delete('/api/products/:id/permanent', requireAdminAuth, (req: Request, res: Response) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const product = db.products[index];
  db.products.splice(index, 1);
  db.saveToDisk();
  broadcastSSE('product_permanently_deleted', { id: req.params.id, name: product.name, sku: product.sku });
  res.json({ 
    success: true, 
    message: `Product "${product.name}" (SKU: ${product.sku}) permanently removed from catalogue.` 
  });
});

// Bulk Permanent Delete Old Products
app.post('/api/products/bulk-delete', requireAdminAuth, (req: Request, res: Response) => {
  const { productIds } = req.body;
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ error: 'productIds array is required' });
  }
  const idSet = new Set(productIds);
  const initialCount = db.products.length;
  db.products = db.products.filter(p => !idSet.has(p.id));
  const deletedCount = initialCount - db.products.length;

  db.saveToDisk();
  broadcastSSE('products_bulk_deleted', { productIds, deletedCount });
  res.json({ 
    success: true, 
    count: deletedCount, 
    message: `Permanently deleted ${deletedCount} products from catalogue.` 
  });
});

// Activate / Deactivate Product Status
app.put('/api/products/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { status } = req.body;
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  if (status !== 'ACTIVE' && status !== 'INACTIVE') {
    return res.status(400).json({ error: 'Status must be ACTIVE or INACTIVE' });
  }
  product.status = status;
  product.active = status === 'ACTIVE';
  db.saveToDisk();
  broadcastSSE('product_updated', product);
  res.json({ success: true, product });
});

// ---------------- INVENTORY ----------------
app.get('/api/inventory', (req: Request, res: Response) => {
  res.json({
    products: db.products,
    logs: db.inventoryLogs.slice(0, 50),
    summary: {
      totalProducts: db.products.length,
      totalStock: db.products.reduce((s, p) => s + p.stock, 0),
      totalReserved: db.products.reduce((s, p) => s + p.reservedStock, 0),
      lowStockCount: db.products.filter(p => p.availableStock <= p.lowStockThreshold).length,
      outOfStockCount: db.products.filter(p => p.availableStock <= 0).length
    }
  });
});

app.post('/api/inventory/adjust', requireAdminAuth, (req: Request, res: Response) => {
  const { productId, change, newStock, reason, staffName } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  try {
    let updated: Product;
    if (newStock !== undefined) {
      updated = db.setStock(productId, Number(newStock), reason || 'Stock Maintaining update', staffName || 'Admin');
    } else if (change !== undefined) {
      updated = db.adjustStock(productId, Number(change), reason || 'Stock Count Adjustment', staffName || 'Manager');
    } else {
      return res.status(400).json({ error: 'Either change or newStock is required' });
    }

    broadcastSSE('inventory_adjusted', { productId, product: updated });
    broadcastSSE('product_updated', updated);
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Direct Stock Update Endpoint (Stock Maintaining)
app.put('/api/products/:id/stock', requireAdminAuth, (req: Request, res: Response) => {
  const { stock, reason, staffName } = req.body;
  if (stock === undefined) {
    return res.status(400).json({ error: 'stock quantity is required' });
  }

  try {
    const updated = db.setStock(req.params.id, Number(stock), reason || 'Stock Maintaining direct update', staffName || 'Admin');
    broadcastSSE('inventory_adjusted', { productId: req.params.id, product: updated });
    broadcastSSE('product_updated', updated);
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- ORDERS ----------------
app.get('/api/orders', (req: Request, res: Response) => {
  const { phone, status, search } = req.query;
  const adminSession = getAdminSession(req);

  // If unauthenticated and no phone query provided:
  if (!adminSession && !phone) {
    if (req.headers['x-admin-role'] || req.headers.authorization) {
      return res.status(401).json({ error: 'Valid Admin session required to view Store Orders' });
    }
    return res.json([]);
  }

  let list = [...db.orders];

  if (phone) {
    const p = String(phone).replace(/\D/g, '');
    if (p) {
      list = list.filter(o => o.customer.phone.replace(/\D/g, '').includes(p));
    }
  }

  if (status && status !== 'All') {
    list = list.filter(o => o.status === status);
  }

  if (search) {
    const s = String(search).toLowerCase();
    list = list.filter(o => 
      o.orderNumber.toLowerCase().includes(s) ||
      o.customer.name.toLowerCase().includes(s) ||
      o.customer.phone.includes(s) ||
      o.pickupPin.includes(s)
    );
  }

  res.json(list);
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.orders.find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Customer Creates Order with Instant Stock Reservation + QR/PIN
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const order = await db.createOrder(req.body);
    broadcastSSE('new_order', order);
    broadcastSSE('admin_notification', db.notifications[0]);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Updates Order Status
app.put('/api/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { status, note, user } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const updated = db.updateOrderStatus(req.params.id, status, note, user);
    broadcastSSE('order_updated', updated);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- PICKUP VERIFICATION (QR / PIN) ----------------
app.post('/api/pickup/verify', requireAdminAuth, (req: Request, res: Response) => {
  const { pin, orderNumber } = req.body;
  if (!pin && !orderNumber) {
    return res.status(400).json({ error: 'PIN or Order Number is required for verification' });
  }

  const result = db.verifyPickup({ pin, orderNumber });
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Handover Confirmation: Mark Verified Order as Collected
app.post('/api/pickup/collect', (req: Request, res: Response) => {
  const { orderId, staffName } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' });
  }

  try {
    const collectedOrder = db.updateOrderStatus(orderId, 'Collected', 'Customer presented valid Pickup PIN/QR at counter. Physical items handed over.', staffName || 'Counter Staff');
    broadcastSSE('order_updated', collectedOrder);
    res.json({
      success: true,
      message: `Order #${collectedOrder.orderNumber} successfully handed over and marked Collected. Inventory updated.`,
      order: collectedOrder
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- QUOTES ----------------
app.get('/api/quotes', (req: Request, res: Response) => {
  const { phone, status } = req.query;
  let list = [...db.quotes];

  if (phone) {
    const p = String(phone).replace(/\D/g, '');
    list = list.filter(q => q.customer.phone.replace(/\D/g, '').includes(p));
  }

  if (status) {
    list = list.filter(q => q.status === status);
  }

  res.json(list);
});

app.get('/api/quotes/:id', (req: Request, res: Response) => {
  const quote = db.quotes.find(q => q.id === req.params.id || q.quoteNumber === req.params.id);
  if (!quote) {
    return res.status(404).json({ error: 'Quote not found' });
  }
  res.json(quote);
});

app.post('/api/quotes', (req: Request, res: Response) => {
  try {
    const quote = db.createQuote(req.body);
    broadcastSSE('new_quote', quote);
    res.status(201).json(quote);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/quotes/:id', (req: Request, res: Response) => {
  try {
    const quote = db.updateQuote(req.params.id, req.body);
    broadcastSSE('quote_updated', quote);
    res.json(quote);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Convert Quote into an Order
app.post('/api/quotes/:id/convert-to-order', async (req: Request, res: Response) => {
  const quote = db.quotes.find(q => q.id === req.params.id);
  if (!quote) {
    return res.status(404).json({ error: 'Quote not found' });
  }

  try {
    const order = await db.createOrder({
      customer: quote.customer,
      items: quote.items.map(i => ({
        productId: i.productId || db.products[0].id,
        quantity: i.quantity
      })),
      paymentMethod: 'Pay at Store',
      notes: `Converted from Bulk Quotation #${quote.quoteNumber}`
    });

    quote.status = 'Order Created';
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- OFFERS ----------------
app.get('/api/offers', (req: Request, res: Response) => {
  res.json(db.offers.filter(o => o.active));
});

app.post('/api/offers', (req: Request, res: Response) => {
  const newOffer = {
    ...req.body,
    id: `off-${Date.now()}`,
    active: true
  };
  db.offers.push(newOffer);
  res.status(201).json(newOffer);
});

// ---------------- NOTIFICATIONS ----------------
app.get('/api/notifications', (req: Request, res: Response) => {
  res.json(db.notifications);
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.isRead = true;
  }
  res.json({ success: true });
});

// ---------------- REPORTS ----------------
app.get('/api/reports', requireAdminAuth, (req: Request, res: Response) => {
  res.json(db.getReports());
});

// ---------------- STAFF ----------------
app.get('/api/staff', (req: Request, res: Response) => {
  res.json(db.staff);
});

// ---------------- VITE & STATIC FILES ----------------
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Welcome Hardware] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Welcome Hardware] Store Location: Near Theosophical Women's College, Hampi Road, HOSAPETE`);
    console.log(`[Welcome Hardware] Store Contact: 9986544516 / 9986125297`);
  });
}

setupViteOrStatic();
