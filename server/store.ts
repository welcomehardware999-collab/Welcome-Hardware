import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  Product, 
  Order, 
  OrderStatus, 
  Quote, 
  QuoteStatus, 
  AdminNotification, 
  StoreSettings, 
  Offer, 
  StaffMember, 
  InventoryLog, 
  Review,
  Role,
  PriceHistoryEntry,
  CartPriceChange
} from '../src/types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_STORE_SETTINGS, 
  INITIAL_OFFERS, 
  INITIAL_STAFF 
} from '../src/data/mockData';

const DB_FILE_PATH = path.resolve(process.cwd(), 'data', 'hardware_store_db.json');

// Ensure database storage directory exists
const DB_DIR = path.dirname(DB_FILE_PATH);
if (!fs.existsSync(DB_DIR)) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create data directory:', err);
  }
}

// Persistent data store with disk persistence and real-time state mutation methods
class HardwareStoreDB {
  products: Product[] = [];
  orders: Order[] = [];
  quotes: Quote[] = [];
  notifications: AdminNotification[] = [];
  storeSettings: StoreSettings = { ...INITIAL_STORE_SETTINGS };
  offers: Offer[] = [];
  staff: StaffMember[] = [];
  inventoryLogs: InventoryLog[] = [];
  reviews: Review[] = [];
  orderCounter: number = 1024;
  quoteCounter: number = 501;
  priceHistory: PriceHistoryEntry[] = [];
  allowManagerPriceEdit: boolean = true;

  constructor() {
    const loaded = this.loadFromDisk();
    if (!loaded) {
      // First boot only: initialize default dataset and immediately persist to disk
      this.resetToDefaults();
      this.saveToDisk();
    }
  }

  saveToDisk() {
    try {
      const data = {
        version: 1,
        savedAt: new Date().toISOString(),
        products: this.products,
        orders: this.orders,
        quotes: this.quotes,
        notifications: this.notifications,
        storeSettings: this.storeSettings,
        offers: this.offers,
        staff: this.staff,
        inventoryLogs: this.inventoryLogs,
        reviews: this.reviews,
        orderCounter: this.orderCounter,
        quoteCounter: this.quoteCounter,
        priceHistory: this.priceHistory,
        allowManagerPriceEdit: this.allowManagerPriceEdit
      };
      const tmpPath = `${DB_FILE_PATH}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, DB_FILE_PATH);
    } catch (err) {
      console.error('Failed to save HardwareStoreDB to disk:', err);
    }
  }

  loadFromDisk(): boolean {
    try {
      if (!fs.existsSync(DB_FILE_PATH)) {
        return false;
      }
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      if (!raw || !raw.trim()) {
        return false;
      }
      const parsed = JSON.parse(raw);
      let needsSave = false;
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        this.products = parsed.products;
      } else {
        this.products = [...INITIAL_PRODUCTS];
        needsSave = true;
      }
      if (Array.isArray(parsed.orders)) {
        this.orders = parsed.orders;
      }
      if (Array.isArray(parsed.quotes)) {
        this.quotes = parsed.quotes;
      }
      if (Array.isArray(parsed.notifications)) {
        this.notifications = parsed.notifications;
      }
      if (parsed.storeSettings && typeof parsed.storeSettings === 'object') {
        this.storeSettings = parsed.storeSettings;
      }
      if (Array.isArray(parsed.offers)) {
        this.offers = parsed.offers;
      }
      if (Array.isArray(parsed.staff)) {
        this.staff = parsed.staff;
      }
      if (Array.isArray(parsed.inventoryLogs)) {
        this.inventoryLogs = parsed.inventoryLogs;
      }
      if (Array.isArray(parsed.reviews)) {
        this.reviews = parsed.reviews;
      }
      if (typeof parsed.orderCounter === 'number') {
        this.orderCounter = parsed.orderCounter;
      }
      if (typeof parsed.quoteCounter === 'number') {
        this.quoteCounter = parsed.quoteCounter;
      }
      if (Array.isArray(parsed.priceHistory)) {
        this.priceHistory = parsed.priceHistory;
      }
      if (typeof parsed.allowManagerPriceEdit === 'boolean') {
        this.allowManagerPriceEdit = parsed.allowManagerPriceEdit;
      }

      // Safe persistent one-time assignment for any older order missing a valid pickup PIN
      for (const order of this.orders) {
        if (!order.pickupPin || typeof order.pickupPin !== 'string' || !order.pickupPin.trim()) {
          order.pickupPin = crypto.randomInt(1000, 10000).toString();
          needsSave = true;
        }
      }
      if (needsSave) {
        this.saveToDisk();
      }

      return true;
    } catch (err) {
      console.error('Error loading HardwareStoreDB from disk:', err);
      return false;
    }
  }

  resetToDefaults() {
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.storeSettings = JSON.parse(JSON.stringify(INITIAL_STORE_SETTINGS));
    this.offers = JSON.parse(JSON.stringify(INITIAL_OFFERS));
    this.staff = JSON.parse(JSON.stringify(INITIAL_STAFF));
    this.orders = [];
    this.quotes = [];
    this.notifications = [];
    this.inventoryLogs = [];
    this.reviews = [];
    this.priceHistory = [];
    this.seedInitialOrders();
    this.seedInitialPriceHistory();
  }

  // Pre-seed a few realistic initial orders so Admin and Customer panels have live sample data immediately
  async seedInitialOrders() {
    const p1 = this.products[0];
    const p2 = this.products[8]; // Teak
    const p3 = this.products[15]; // Europa lock
    const p4 = this.products[27]; // Fevicol SH

    // Order 1: Ready for Pickup
    const pin1 = "4291";
    const qrData1 = JSON.stringify({ orderNumber: "WH-1021", pin: pin1, phone: "9845112233" });
    const qrCode1 = await QRCode.toDataURL(qrData1, { width: 300, margin: 2, color: { dark: '#0F172A', light: '#FFFFFF' } });

    const order1: Order = {
      id: "ord-1021",
      orderNumber: "WH-1021",
      customer: {
        name: "Ramesh Sharma",
        phone: "9845112233",
        email: "ramesh.sharma@example.com",
        customerType: "Contractor",
        businessName: "Sharma Woodworks Hospet"
      },
      items: [
        {
          productId: p1.id,
          name: p1.name,
          sku: p1.sku,
          brand: p1.brand,
          unit: p1.unit,
          price: p1.price,
          discount: p1.discount,
          finalPrice: p1.finalPrice,
          quantity: 4,
          total: p1.finalPrice * 4,
          image: p1.images[0],
          size: p1.size,
          thickness: p1.thickness
        },
        {
          productId: p4.id,
          name: p4.name,
          sku: p4.sku,
          brand: p4.brand,
          unit: p4.unit,
          price: p4.price,
          discount: p4.discount,
          finalPrice: p4.finalPrice,
          quantity: 2,
          total: p4.finalPrice * 2,
          image: p4.images[0]
        }
      ],
      subtotal: p1.finalPrice * 4 + p4.finalPrice * 2,
      discountTotal: 850,
      gstTotal: 2740,
      grandTotal: (p1.finalPrice * 4 + p4.finalPrice * 2),
      status: "Ready for Pickup",
      pickupPin: pin1,
      qrCodeDataUrl: qrCode1,
      qrData: qrData1,
      paymentStatus: "Paid Online",
      paymentMethod: "UPI/Online",
      pickupSlot: "Today between 4:00 PM - 7:00 PM",
      notes: "Will come in Tata Ace vehicle for loading.",
      isPinUsed: false,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      confirmedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      readyAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      timeline: [
        { status: "Order Placed", timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), note: "Order placed online for store pickup" },
        { status: "Confirmed", timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), note: "Inventory allocated & accepted by store staff" },
        { status: "Preparing", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: "Sheets bundled in plywood warehouse" },
        { status: "Ready for Pickup", timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), note: "Items staged at Hospet dispatch bay" }
      ]
    };

    // Reserve stock for order 1
    p1.reservedStock += 4;
    p1.availableStock = p1.stock - p1.reservedStock;
    p4.reservedStock += 2;
    p4.availableStock = p4.stock - p4.reservedStock;

    // Order 2: New Order Placed
    const pin2 = "7814";
    const qrData2 = JSON.stringify({ orderNumber: "WH-1022", pin: pin2, phone: "9480223344" });
    const qrCode2 = await QRCode.toDataURL(qrData2, { width: 300, margin: 2, color: { dark: '#0F172A', light: '#FFFFFF' } });

    const order2: Order = {
      id: "ord-1022",
      orderNumber: "WH-1022",
      customer: {
        name: "Anand Kulkarni",
        phone: "9480223344",
        email: "anand.k@example.com",
        customerType: "Carpenter"
      },
      items: [
        {
          productId: p3.id,
          name: p3.name,
          sku: p3.sku,
          brand: p3.brand,
          unit: p3.unit,
          price: p3.price,
          discount: p3.discount,
          finalPrice: p3.finalPrice,
          quantity: 2,
          total: p3.finalPrice * 2,
          image: p3.images[0]
        }
      ],
      subtotal: p3.finalPrice * 2,
      discountTotal: 400,
      gstTotal: 1156,
      grandTotal: p3.finalPrice * 2,
      status: "Order Placed",
      pickupPin: pin2,
      qrCodeDataUrl: qrCode2,
      qrData: qrData2,
      paymentStatus: "Pending",
      paymentMethod: "Pay at Store",
      pickupSlot: "Tomorrow Morning (10:00 AM)",
      notes: "Please keep brass antique finish only.",
      isPinUsed: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      timeline: [
        { status: "Order Placed", timestamp: new Date(Date.now() - 1800000).toISOString(), note: "Awaiting store confirmation" }
      ]
    };

    p3.reservedStock += 2;
    p3.availableStock = p3.stock - p3.reservedStock;

    this.orders.push(order1, order2);

    // Initial Notifications
    this.notifications.push(
      {
        id: "notif-01",
        title: "NEW ORDER RECEIVED #WH-1022",
        message: "Anand Kulkarni placed an order of ₹" + order2.grandTotal.toLocaleString('en-IN') + " for 2 items. Method: Pay at Store.",
        type: "order",
        orderId: order2.id,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isRead: false
      },
      {
        id: "notif-02",
        title: "ORDER READY FOR PICKUP #WH-1021",
        message: "Order #WH-1021 is packed and staged at dispatch bay. PIN: 4291.",
        type: "pickup",
        orderId: order1.id,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: false
      },
      {
        id: "notif-03",
        title: "LOW STOCK ALERT: Yale Smart Lock",
        message: "Stock has dropped to 12 units (Threshold: 3).",
        type: "low_stock",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        isRead: true
      }
    );

    // Seed a sample Quote
    this.quotes.push({
      id: "qt-501",
      quoteNumber: "QT-501",
      customer: {
        name: "Vijay Interiors & Builders",
        phone: "9900112233",
        email: "vijay.builders@example.com",
        customerType: "Builder",
        businessName: "Vijay Projects Hampi"
      },
      items: [
        {
          productId: p1.id,
          productName: p1.name,
          category: p1.category,
          quantity: 40,
          unit: p1.unit,
          unitPrice: 3174,
          discount: 10,
          gstRate: 18,
          finalPrice: 2856,
          notes: "Need direct site batch lot delivery"
        },
        {
          productId: p2.id,
          productName: p2.name,
          category: p2.category,
          quantity: 15,
          unit: p2.unit,
          unitPrice: 4800,
          discount: 5,
          gstRate: 18,
          finalPrice: 4560
        }
      ],
      notes: "Requirements for luxury villa project near Tungabhadra Dam road.",
      adminNotes: "Offered 10% special project contractor discount.",
      subtotal: 182640,
      discountTotal: 15000,
      gstTotal: 30175,
      grandTotal: 197815,
      status: "Ready",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      validUntil: new Date(Date.now() + 86400000 * 14).toISOString()
    });
  }

  // --- Order Creation & Stock Reservation ---
  async createOrder(orderData: {
    customer: {
      name: string;
      phone: string;
      email?: string;
      customerType: any;
      businessName?: string;
      gstNumber?: string;
    };
    items: {
      productId: string;
      quantity: number;
      selectedSize?: string;
      selectedThickness?: string;
      expectedPrice?: number;
    }[];
    paymentMethod: any;
    pickupSlot?: string;
    notes?: string;
  }): Promise<Order> {
    this.orderCounter++;
    const orderNumber = `WH-${this.orderCounter}`;
    const orderId = `ord-${Date.now()}`;
    const pickupPin = crypto.randomInt(1000, 10000).toString();

    // Verify stock and prepare order items
    const orderItems: Order['items'] = [];
    let subtotal = 0;
    let discountTotal = 0;

    for (const item of orderData.items) {
      const product = this.products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.availableStock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.availableStock}, Requested: ${item.quantity}`);
      }

      // Check if client passed an expected price that differs from current database price
      if (item.expectedPrice !== undefined && Number(item.expectedPrice) !== product.finalPrice) {
        throw new Error(`PRICE_MISMATCH: Price for "${product.name}" has changed from ₹${item.expectedPrice} to ₹${product.finalPrice}. Please review and accept the updated price before placing the order.`);
      }

      // Reserve stock immediately
      product.reservedStock += item.quantity;
      product.availableStock = product.stock - product.reservedStock;

      // Log reservation
      this.inventoryLogs.push({
        id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        change: -item.quantity,
        previousStock: product.stock,
        newStock: product.stock, // physical stock unchanged until collected, reservation increased
        type: 'order_reservation',
        orderId,
        reason: `Reserved ${item.quantity} units for Order #${orderNumber}`,
        timestamp: new Date().toISOString(),
        byUser: 'Customer Online Order'
      });

      const itemTotal = product.finalPrice * item.quantity;
      subtotal += itemTotal;
      discountTotal += (product.price - product.finalPrice) * item.quantity;

      orderItems.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        brand: product.brand,
        unit: product.unit,
        price: product.price,
        discount: product.discount,
        finalPrice: product.finalPrice,
        quantity: item.quantity,
        total: itemTotal,
        image: product.images[0] || '/welcome-hardware-logo.svg',
        size: item.selectedSize || product.size,
        thickness: item.selectedThickness || product.thickness
      });
    }

    const gstTotal = Math.round(subtotal * 0.18);
    const grandTotal = subtotal; // finalPrice already includes consumer pricing

    // Generate real QR code containing order ID, PIN, and verification URL
    const qrData = JSON.stringify({
      orderNumber,
      pin: pickupPin,
      phone: orderData.customer.phone,
      total: grandTotal,
      store: "Welcome Hardware, Near Theosophical Women's College, Hampi Road, HOSAPETE"
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 320,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    });

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customer: orderData.customer,
      items: orderItems,
      subtotal,
      discountTotal,
      gstTotal,
      grandTotal,
      status: 'Order Placed',
      pickupPin,
      qrCodeDataUrl,
      qrData,
      paymentStatus: orderData.paymentMethod === 'Pay at Store' ? 'Pending' : 'Paid Online',
      paymentMethod: orderData.paymentMethod,
      pickupSlot: orderData.pickupSlot || 'Ready for pickup in 2-4 hours',
      notes: orderData.notes,
      isPinUsed: false,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: 'Order Placed',
          timestamp: new Date().toISOString(),
          note: 'Order created with store pickup reservation at Near Theosophical Women\'s College, Hampi Road, HOSAPETE.'
        }
      ]
    };

    this.orders.unshift(newOrder);

    // Create instant Admin notification
    const notification: AdminNotification = {
      id: `notif-${Date.now()}`,
      title: `NEW ORDER RECEIVED #${orderNumber}`,
      message: `${orderData.customer.name} ordered ${orderItems.length} items totaling ₹${grandTotal.toLocaleString('en-IN')}. Pickup PIN: ${pickupPin}`,
      type: 'order',
      orderId: newOrder.id,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    this.notifications.unshift(notification);

    // Persist immediately to disk
    this.saveToDisk();

    return newOrder;
  }

  // --- Update Order Status ---
  updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string, user: string = 'Staff'): Order {
    const order = this.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const prevStatus = order.status;
    order.status = newStatus;
    const now = new Date().toISOString();

    if (newStatus === 'Confirmed') {
      order.confirmedAt = now;
    } else if (newStatus === 'Ready for Pickup') {
      order.readyAt = now;
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `ORDER READY FOR PICKUP #${order.orderNumber}`,
        message: `Order #${order.orderNumber} for ${order.customer.name} is staged and ready for customer pickup.`,
        type: 'pickup',
        orderId: order.id,
        timestamp: now,
        isRead: false
      });
    } else if (newStatus === 'Collected') {
      order.collectedAt = now;
      order.isPinUsed = true;
      if (order.paymentStatus === 'Pending' && order.paymentMethod === 'Pay at Store') {
        order.paymentStatus = 'Paid at Store';
      }

      // Permanently reduce physical stock and release reservation
      for (const item of order.items) {
        const product = this.products.find(p => p.id === item.productId);
        if (product) {
          product.stock -= item.quantity;
          product.reservedStock = Math.max(0, product.reservedStock - item.quantity);
          product.availableStock = product.stock - product.reservedStock;

          this.inventoryLogs.push({
            id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            change: -item.quantity,
            previousStock: product.stock + item.quantity,
            newStock: product.stock,
            type: 'order_collection',
            orderId: order.id,
            reason: `Order #${order.orderNumber} collected by customer at counter`,
            timestamp: now,
            byUser: user
          });
        }
      }
    } else if (newStatus === 'Cancelled') {
      order.cancelledAt = now;

      // Release stock reservation
      if (prevStatus !== 'Collected') {
        for (const item of order.items) {
          const product = this.products.find(p => p.id === item.productId);
          if (product) {
            product.reservedStock = Math.max(0, product.reservedStock - item.quantity);
            product.availableStock = product.stock - product.reservedStock;

            this.inventoryLogs.push({
              id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              change: item.quantity,
              previousStock: product.stock,
              newStock: product.stock,
              type: 'order_cancellation',
              orderId: order.id,
              reason: `Released reservation due to cancellation of Order #${order.orderNumber}`,
              timestamp: now,
              byUser: user
            });
          }
        }
      }
    }

    order.timeline.push({
      status: newStatus,
      timestamp: now,
      note: note || `Order status updated to ${newStatus} by ${user}`
    });

    this.saveToDisk();

    return order;
  }

  // --- Pickup PIN / QR Verification ---
  verifyPickup(query: { pin?: string; orderNumber?: string }): { success: boolean; message: string; order?: Order } {
    let order: Order | undefined;

    if (query.pin) {
      order = this.orders.find(o => o.pickupPin === query.pin);
    } else if (query.orderNumber) {
      const cleanNum = query.orderNumber.toUpperCase().trim();
      order = this.orders.find(o => o.orderNumber === cleanNum || o.id === query.orderNumber);
    }

    if (!order) {
      return { success: false, message: "No matching order found with provided PIN or Order Number." };
    }

    if (order.status === 'Cancelled') {
      return { success: false, message: `Order #${order.orderNumber} was cancelled and cannot be collected.` };
    }

    if (order.isPinUsed || order.status === 'Collected') {
      return { 
        success: false, 
        message: `Pickup PIN ${order.pickupPin} has already been verified and used on ${new Date(order.collectedAt || '').toLocaleString('en-IN')}. Cannot reuse.` 
      };
    }

    const collectedTimestamp = new Date().toISOString();
    order.isPinUsed = true;
    order.status = 'Collected';
    order.collectedAt = collectedTimestamp;
    order.timeline.push({
      status: 'Collected',
      timestamp: collectedTimestamp,
      note: 'Verified customer pickup PIN at Hampi Road counter and collected goods.'
    });

    this.saveToDisk();

    return {
      success: true,
      message: `Order #${order.orderNumber} verified successfully! Ready for handover.`,
      order
    };
  }

  // --- Bulk Quotes ---
  createQuote(quoteData: {
    customer: {
      name: string;
      phone: string;
      email?: string;
      customerType: any;
      businessName?: string;
      gstNumber?: string;
    };
    items: {
      productId?: string;
      productName: string;
      quantity: number;
      unit: string;
      notes?: string;
    }[];
    notes?: string;
  }): Quote {
    this.quoteCounter++;
    const quoteNumber = `QT-${this.quoteCounter}`;
    const quoteId = `qt-${Date.now()}`;

    let subtotal = 0;
    const items: Quote['items'] = quoteData.items.map(item => {
      let unitPrice = 0;
      let finalPrice = 0;
      let category = '';

      if (item.productId) {
        const prod = this.products.find(p => p.id === item.productId);
        if (prod) {
          unitPrice = prod.price;
          finalPrice = prod.finalPrice;
          category = prod.category;
        }
      }

      const lineTotal = (finalPrice || unitPrice || 0) * item.quantity;
      subtotal += lineTotal;

      return {
        ...item,
        category,
        unitPrice,
        finalPrice,
        discount: 0,
        gstRate: 18
      };
    });

    const discountTotal = 0;
    const gstTotal = Math.round(subtotal * 0.18);
    const grandTotal = subtotal;

    const newQuote: Quote = {
      id: quoteId,
      quoteNumber,
      customer: quoteData.customer,
      items,
      notes: quoteData.notes,
      subtotal,
      discountTotal,
      gstTotal,
      grandTotal,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 86400000 * 15).toISOString()
    };

    this.quotes.unshift(newQuote);

    // Notify Admin
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `NEW BULK QUOTE REQUEST #${quoteNumber}`,
      message: `${quoteData.customer.name} (${quoteData.customer.customerType}) requested a bulk quote for ${items.length} items.`,
      type: 'quote',
      quoteId: newQuote.id,
      timestamp: new Date().toISOString(),
      isRead: false
    });

    this.saveToDisk();
    return newQuote;
  }

  // --- Update / Price Quote ---
  updateQuote(quoteId: string, updates: Partial<Quote>): Quote {
    const quote = this.quotes.find(q => q.id === quoteId || q.quoteNumber === quoteId);
    if (!quote) {
      throw new Error(`Quote ${quoteId} not found`);
    }

    Object.assign(quote, updates);
    this.saveToDisk();
    return quote;
  }

  // --- Quick Stock Adjustment ---
  adjustStock(productId: string, change: number, reason: string, staffName: string): Product {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const prevStock = product.stock;
    const newStock = Math.max(0, product.stock + change);
    product.stock = newStock;
    product.availableStock = Math.max(0, product.stock - product.reservedStock);

    this.inventoryLogs.unshift({
      id: `inv-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      change,
      previousStock: prevStock,
      newStock,
      type: change > 0 ? 'restock' : 'manual_adjustment',
      reason,
      timestamp: new Date().toISOString(),
      byUser: staffName
    });

    // Check low stock
    if (product.availableStock <= product.lowStockThreshold) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `LOW STOCK ALERT: ${product.name}`,
        message: `Available stock is now ${product.availableStock} ${product.unit}s (Threshold: ${product.lowStockThreshold}).`,
        type: 'low_stock',
        timestamp: new Date().toISOString(),
        isRead: false
      });
    }

    this.saveToDisk();
    return product;
  }

  // --- Direct Stock Setting (Stock Maintaining) ---
  setStock(productId: string, newStock: number, reason: string = 'Stock Maintaining count update', staffName: string = 'Admin'): Product {
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const prevStock = product.stock;
    const targetStock = Math.max(0, Math.floor(Number(newStock)));
    const change = targetStock - prevStock;
    product.stock = targetStock;
    product.availableStock = Math.max(0, product.stock - product.reservedStock);

    this.inventoryLogs.unshift({
      id: `inv-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      change,
      previousStock: prevStock,
      newStock: targetStock,
      type: change > 0 ? 'restock' : 'manual_adjustment',
      reason,
      timestamp: new Date().toISOString(),
      byUser: staffName
    });

    // Check low stock
    if (product.availableStock <= product.lowStockThreshold) {
      this.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `LOW STOCK ALERT: ${product.name}`,
        message: `Available stock is now ${product.availableStock} ${product.unit}s (Threshold: ${product.lowStockThreshold}).`,
        type: 'low_stock',
        timestamp: new Date().toISOString(),
        isRead: false
      });
    }

    this.saveToDisk();
    return product;
  }

  // --- Reports & Analytics ---
  getReports() {
    const totalSales = this.orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySales = this.orders
      .filter(o => o.status !== 'Cancelled' && new Date(o.createdAt) >= todayStart)
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const orderStatusCounts = {
      newOrders: this.orders.filter(o => o.status === 'Order Placed').length,
      confirmed: this.orders.filter(o => o.status === 'Confirmed').length,
      preparing: this.orders.filter(o => o.status === 'Preparing').length,
      readyForPickup: this.orders.filter(o => o.status === 'Ready for Pickup').length,
      collected: this.orders.filter(o => o.status === 'Collected').length,
      cancelled: this.orders.filter(o => o.status === 'Cancelled').length
    };

    const pendingQuotes = this.quotes.filter(q => q.status === 'Pending').length;
    const lowStockCount = this.products.filter(p => p.availableStock <= p.lowStockThreshold).length;

    // Sales by Category
    const categorySales: { [key: string]: number } = {};
    for (const order of this.orders) {
      if (order.status !== 'Cancelled') {
        for (const item of order.items) {
          const product = this.products.find(p => p.id === item.productId);
          const cat = product?.category || 'Hardware';
          categorySales[cat] = (categorySales[cat] || 0) + item.total;
        }
      }
    }

    return {
      totalSales,
      todaySales,
      orderStatusCounts,
      pendingQuotes,
      lowStockCount,
      categorySales,
      totalOrders: this.orders.length,
      totalProducts: this.products.length
    };
  }

  // Seed realistic historical price changes for audit trail
  seedInitialPriceHistory() {
    const p1 = this.products[0]; // 18mm BWP Plywood
    const p3 = this.products[15]; // Europa Lock
    const p4 = this.products[27]; // Fevicol SH

    this.priceHistory = [
      {
        id: "ph-init-1",
        productId: p1?.id || "prod-ply-1",
        productName: p1?.name || "18mm BWP Marine Grade Plywood (IS 710)",
        sku: p1?.sku || "PLY-BWP-18MM",
        unit: p1?.unit || "Sheet",
        previousPrice: 2350,
        newPrice: p1?.price || 2450,
        previousDiscount: 0,
        newDiscount: p1?.discount || 0,
        previousFinalPrice: 2350,
        newFinalPrice: p1?.finalPrice || 2450,
        gstRate: p1?.gstRate || 18,
        changedBy: "Store Owner",
        changedByRole: "OWNER",
        reason: "Timber raw material price revision by manufacturer",
        date: "10 Sep 2026",
        time: "11:30 AM",
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: "ph-init-2",
        productId: p3?.id || "prod-door-1",
        productName: p3?.name || "Europa Disc Padlock High Security 70mm",
        sku: p3?.sku || "LCK-EUR-70",
        unit: p3?.unit || "Piece",
        previousPrice: 2200,
        newPrice: p3?.price || 2450,
        previousDiscount: 5,
        newDiscount: p3?.discount || 10,
        previousFinalPrice: 2090,
        newFinalPrice: p3?.finalPrice || 2205,
        gstRate: p3?.gstRate || 18,
        changedBy: "Ramesh Sharma (Manager)",
        changedByRole: "MANAGER",
        reason: "Festive contractor promotional discount update",
        date: "12 Sep 2026",
        time: "02:15 PM",
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: "ph-init-3",
        productId: p4?.id || "prod-adh-1",
        productName: p4?.name || "Fevicol SH Synthetic Resin Adhesive 5kg",
        sku: p4?.sku || "ADH-FEV-5KG",
        unit: p4?.unit || "Pack",
        previousPrice: 1250,
        newPrice: p4?.price || 1350,
        previousDiscount: 5,
        newDiscount: p4?.discount || 5,
        previousFinalPrice: 1188,
        newFinalPrice: p4?.finalPrice || 1283,
        gstRate: p4?.gstRate || 18,
        changedBy: "Store Owner",
        changedByRole: "OWNER",
        reason: "Quarterly price revision by Pidilite Industries",
        date: "14 Sep 2026",
        time: "09:45 AM",
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ];
  }

  // Verify price change permission strictly on server
  verifyPriceChangePermission(role?: Role): boolean {
    if (!role) {
      throw new Error("Unauthorized: Price modification requires authenticated admin access.");
    }
    const cleanRole = (String(role).toUpperCase()) as Role;
    if (cleanRole === 'STAFF') {
      throw new Error("Permission denied: Staff members cannot change prices. Only Store Owner or authorized Manager can modify product pricing.");
    }
    if (cleanRole === 'MANAGER') {
      if (!this.allowManagerPriceEdit) {
        throw new Error("Permission denied: Price editing by Manager is currently disabled in Store Settings by Store Owner.");
      }
      return true;
    }
    if (cleanRole === 'OWNER') {
      return true;
    }
    throw new Error(`Unauthorized role '${role}': Price modification forbidden.`);
  }

  // Update individual product price with strict validation and audit recording
  updateProductPrice(
    productId: string,
    data: { price: number; discount?: number; gstRate?: number; reason?: string },
    changedBy: string,
    role: Role
  ): { product: Product; history: PriceHistoryEntry } {
    // 1. Permission check
    this.verifyPriceChangePermission(role);

    // 2. Strict price validation
    if (data.price === undefined || data.price === null || (data.price as any) === '') {
      throw new Error("Invalid price: Price cannot be empty.");
    }
    const numPrice = Number(data.price);
    if (isNaN(numPrice) || !isFinite(numPrice)) {
      throw new Error("Invalid price: Price must be a valid number.");
    }
    if (numPrice <= 0) {
      throw new Error("Invalid price: Price cannot be zero or negative.");
    }

    // 3. Discount validation
    let discount = data.discount !== undefined ? Number(data.discount) : undefined;
    if (discount !== undefined) {
      if (isNaN(discount) || discount < 0 || discount >= 100) {
        throw new Error("Invalid discount: Discount percentage must be between 0% and 99%.");
      }
    }

    // 4. GST validation
    let gstRate = data.gstRate !== undefined ? Number(data.gstRate) : undefined;
    if (gstRate !== undefined) {
      if (isNaN(gstRate) || gstRate < 0 || gstRate > 100) {
        throw new Error("Invalid GST: GST rate must be between 0% and 100%.");
      }
    }

    // 5. Find target product
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error(`Product with ID '${productId}' not found in database.`);
    }

    const previousPrice = product.price;
    const previousDiscount = product.discount || 0;
    const previousFinalPrice = product.finalPrice;

    const newBasePrice = Math.round(numPrice);
    const newDiscount = discount !== undefined ? Math.round(discount) : previousDiscount;
    const newGstRate = gstRate !== undefined ? Math.round(gstRate) : (product.gstRate || 18);
    const newFinalPrice = Math.round(newBasePrice - (newBasePrice * newDiscount) / 100);

    // Update real product in database
    product.price = newBasePrice;
    product.discount = newDiscount;
    product.gstRate = newGstRate;
    product.finalPrice = newFinalPrice;

    // Create audit record
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const historyEntry: PriceHistoryEntry = {
      id: `ph-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      unit: product.unit,
      previousPrice,
      newPrice: newBasePrice,
      previousDiscount,
      newDiscount,
      previousFinalPrice,
      newFinalPrice,
      gstRate: newGstRate,
      changedBy: changedBy || (role === 'OWNER' ? 'Store Owner' : 'Store Manager'),
      changedByRole: role,
      reason: data.reason || 'Price adjustment',
      date: dateStr,
      time: timeStr,
      timestamp: now.toISOString()
    };

    this.priceHistory.unshift(historyEntry);

    // Create admin notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Price Updated: ${product.name}`,
      message: `${product.name} (${product.sku}) changed from ₹${previousFinalPrice.toLocaleString('en-IN')} to ₹${newFinalPrice.toLocaleString('en-IN')} by ${historyEntry.changedBy}.`,
      type: 'price_change',
      productId: product.id,
      timestamp: now.toISOString(),
      isRead: false
    });

    this.saveToDisk();
    return { product, history: historyEntry };
  }

  // Bulk price updates
  bulkUpdatePrices(
    updates: { productId: string; price?: number; discount?: number; reason?: string }[],
    changedBy: string,
    role: Role
  ): { updatedProducts: Product[]; historyEntries: PriceHistoryEntry[] } {
    this.verifyPriceChangePermission(role);

    const updatedProducts: Product[] = [];
    const historyEntries: PriceHistoryEntry[] = [];

    for (const item of updates) {
      const product = this.products.find(p => p.id === item.productId);
      if (!product) continue;

      const targetPrice = item.price !== undefined ? item.price : product.price;
      const targetDiscount = item.discount !== undefined ? item.discount : product.discount;

      const res = this.updateProductPrice(
        item.productId,
        { price: targetPrice, discount: targetDiscount, reason: item.reason || 'Bulk price revision' },
        changedBy,
        role
      );
      updatedProducts.push(res.product);
      historyEntries.push(res.history);
    }

    return { updatedProducts, historyEntries };
  }

  // Validate cart item prices against current database prices
  validateCartPrices(items: { productId: string; expectedFinalPrice: number }[]): {
    valid: boolean;
    priceChanges: CartPriceChange[];
  } {
    const priceChanges: CartPriceChange[] = [];

    for (const item of items) {
      const product = this.products.find(p => p.id === item.productId);
      if (!product) continue;

      if (product.finalPrice !== item.expectedFinalPrice) {
        priceChanges.push({
          productId: product.id,
          name: product.name,
          sku: product.sku,
          oldPrice: item.expectedFinalPrice,
          currentPrice: product.finalPrice,
          diff: product.finalPrice - item.expectedFinalPrice,
          unit: product.unit
        });
      }
    }

    return {
      valid: priceChanges.length === 0,
      priceChanges
    };
  }

  // Retrieve price history (all or filtered by product)
  getPriceHistory(productId?: string): PriceHistoryEntry[] {
    if (productId) {
      return this.priceHistory.filter(h => h.productId === productId);
    }
    return this.priceHistory;
  }
}

export const db = new HardwareStoreDB();

