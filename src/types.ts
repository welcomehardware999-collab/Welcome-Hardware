export type Role = 'OWNER' | 'MANAGER' | 'STAFF';
export type AdminRole = 'Owner' | 'Manager' | 'Staff' | 'OWNER' | 'MANAGER' | 'STAFF';

export type CustomerType = 
  | 'Retail Customer' 
  | 'Carpenter' 
  | 'Contractor' 
  | 'Builder' 
  | 'Interior Designer' 
  | 'Business';

export type OrderStatus = 
  | 'Order Placed' 
  | 'Confirmed' 
  | 'Preparing' 
  | 'Ready for Pickup' 
  | 'Collected' 
  | 'Cancelled';

export type PaymentStatus = 
  | 'Pending' 
  | 'Paid at Store' 
  | 'Paid Online' 
  | 'Advance Paid';

export type PaymentMethod = 
  | 'Pay at Store' 
  | 'UPI/Online' 
  | 'Advance Payment';

export interface ProductSpecification {
  [key: string]: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  sku: string;
  description: string;
  price: number;
  gstRate: number; // percentage, e.g. 18
  discount: number; // percentage, e.g. 10
  finalPrice: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  unit: string; // e.g. 'Sheet', 'Sq. Ft', 'Piece', 'Pair', 'Box', 'Kg', 'Pack'
  size?: string;
  thickness?: string;
  material?: string;
  finish?: string;
  colour?: string;
  category: string; // 'Wood & Boards' | 'Plywood' | 'Door Fittings' | 'Furniture Fittings' | 'Architectural Hardware' | 'Adhesives & Consumables'
  subCategory: string;
  specifications: ProductSpecification;
  images: string[];
  ratingsAverage: number;
  ratingsCount: number;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  active: boolean;
  status?: 'ACTIVE' | 'INACTIVE';

  // Optional Compatibility Metadata (Build Your Door Recommendation Engine)
  compatibleDoorTypes?: string[];
  compatibleMaterials?: string[];
  compatibleThicknessRange?: { min: number; max: number };
  recommendedUsage?: string[];
  hardwareType?: string;
  finishType?: string;
  requiredQuantity?: number;
  compatibleLockTypes?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  subcategories: string[];
  image?: string;
  itemCount?: number;
  icon?: any;
}

export interface QuoteRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerType: string;
  businessName?: string;
  projectType: string;
  siteLocation?: string;
  itemsDescription: string;
  quotedAmount?: number;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedThickness?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  brand: string;
  unit: string;
  price: number;
  discount: number;
  finalPrice: number;
  quantity: number;
  total: number;
  image: string;
  size?: string;
  thickness?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. WH1025
  customer: {
    name: string;
    phone: string;
    email?: string;
    customerType: CustomerType;
    businessName?: string;
    gstNumber?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  gstTotal: number;
  grandTotal: number;
  status: OrderStatus;
  pickupPin: string; // 4-digit PIN
  qrCodeDataUrl: string;
  qrData: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  pickupSlot?: string;
  notes?: string;
  isPinUsed: boolean;
  createdAt: string;
  confirmedAt?: string;
  readyAt?: string;
  collectedAt?: string;
  cancelledAt?: string;
  timeline: OrderTimelineEvent[];
}

export interface QuoteItem {
  productId?: string;
  productName: string;
  category?: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  discount?: number;
  gstRate?: number;
  finalPrice?: number;
  notes?: string;
}

export type QuoteStatus = 'Pending' | 'Ready' | 'Accepted' | 'Order Created';

export interface Quote {
  id: string;
  quoteNumber: string; // e.g. QT501
  customer: {
    name: string;
    phone: string;
    email?: string;
    customerType: CustomerType;
    businessName?: string;
    gstNumber?: string;
  };
  items: QuoteItem[];
  notes?: string;
  adminNotes?: string;
  subtotal: number;
  discountTotal: number;
  gstTotal: number;
  grandTotal: number;
  status: QuoteStatus;
  createdAt: string;
  validUntil?: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  change: number; // positive or negative
  previousStock: number;
  newStock: number;
  type: 'order_reservation' | 'order_cancellation' | 'order_collection' | 'manual_adjustment' | 'restock';
  orderId?: string;
  reason: string;
  timestamp: string;
  byUser: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  reviewText: string;
  verifiedPurchase: boolean;
  date: string;
}

export interface Offer {
  id: string;
  title: string;
  code: string;
  discountPercent: number;
  description: string;
  category?: string;
  minOrderAmount: number;
  active: boolean;
  validUntil: string;
}

export interface StoreSettings {
  storeName: string;
  name?: string;
  address: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  openingHours: string;
  sundayHours: string;
  storeDescription: string;
  logoUrl: string;
  pickupInstructions: string;
  gstin: string;
  gstNumber?: string;
  lowStockThreshold?: number;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'quote' | 'low_stock' | 'pickup' | 'payment' | 'price_change';
  orderId?: string;
  quoteId?: string;
  productId?: string;
  timestamp: string;
  isRead: boolean;
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'quote' | 'offer' | 'system';
  orderId?: string;
  quoteId?: string;
  timestamp: string;
  isRead: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  active: boolean;
  lastActive?: string;
}

// ==========================================
// BUILD YOUR DOOR / DOOR HARDWARE BUILDER TYPES
// ==========================================

export type DoorType = 
  | 'Main Entrance Door' 
  | 'Wooden Interior Door' 
  | 'Bedroom Door' 
  | 'Bathroom/Toilet Door' 
  | 'Office Door' 
  | 'Sliding Door' 
  | 'Glass Door' 
  | 'Double Door' 
  | 'Other';

export type DoorMaterial = 
  | 'Solid Wood' 
  | 'Plywood/Flush Door' 
  | 'MDF/HDF' 
  | 'WPC' 
  | 'Glass' 
  | 'Metal' 
  | 'Not Sure';

export type HardwareCategory = 
  | 'Door Handle' 
  | 'Hinges' 
  | 'Mortise Lock' 
  | 'Cylindrical Lock' 
  | 'Door Closer' 
  | 'Door Stopper' 
  | 'Tower Bolt' 
  | 'Aldrop' 
  | 'Door Viewer' 
  | 'Door Chain' 
  | 'Sliding Door Hardware' 
  | 'Glass Door Hardware' 
  | 'Complete Hardware Set' 
  | 'Flush Bolt'
  | "I'm Not Sure";

export type DoorUsage = 
  | 'Home' 
  | 'Apartment' 
  | 'Office' 
  | 'Shop' 
  | 'Hotel' 
  | 'Commercial Building' 
  | 'Bathroom' 
  | 'Outdoor/Entrance' 
  | 'Other';

export interface DoorDimensions {
  width?: number; // in mm
  height?: number; // in mm
  thickness?: number; // in mm
  customWidthStr?: string;
  customHeightStr?: string;
  customThicknessStr?: string;
  isSkipped?: boolean;
}

export interface SingleDoorConfig {
  id: string;
  doorLabel: string; // e.g. "Door 1: Main Entrance"
  doorType: DoorType;
  material: DoorMaterial;
  dimensions: DoorDimensions;
  hardwareNeeded: HardwareCategory[];
  recommendEverything: boolean;
  usage: DoorUsage;
  notes?: string;
}

export type RecommendationTier = 'REQUIRED' | 'RECOMMENDED' | 'OPTIONAL';

export interface DoorRecommendationItem {
  id: string;
  hardwareCategory: HardwareCategory;
  roleName: string; // e.g. "Primary Lock", "Main Pull Handle", "Load-Bearing Hinges"
  tier: RecommendationTier;
  recommendedQuantity: number;
  reason: string;
  product: Product;
  inStock: boolean;
  alternativeProduct?: Product;
  selectedQuantity: number;
  isSelected: boolean;
}

export interface DoorRecommendationPlan {
  doorConfig: SingleDoorConfig;
  items: DoorRecommendationItem[];
  subtotal: number;
  gstTotal: number;
  grandTotal: number;
  allInStock: boolean;
}

export interface SavedDoorSetup {
  id: string;
  name: string; // e.g. "Main Door - Home", "Master Bedroom"
  savedAt: string;
  config: SingleDoorConfig;
  plan: DoorRecommendationPlan;
}

export interface DoorAnalyticsEvent {
  id: string;
  event: 
    | 'build_your_door_started' 
    | 'build_your_door_completed' 
    | 'product_recommendation_clicked' 
    | 'recommended_product_added' 
    | 'all_recommended_products_added' 
    | 'door_quote_requested';
  timestamp: string;
  doorType?: string;
  material?: string;
  itemsCount?: number;
  totalValue?: number;
  metadata?: Record<string, any>;
}

// ---------------- PRODUCT PRICE MANAGEMENT ----------------
export interface PriceHistoryEntry {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  previousPrice: number;
  newPrice: number;
  previousDiscount: number;
  newDiscount: number;
  previousFinalPrice: number;
  newFinalPrice: number;
  gstRate: number;
  changedBy: string; // e.g. "Store Owner", "Manager (Ramesh)"
  changedByRole: Role;
  reason?: string;
  date: string; // e.g. "15 Sep 2026"
  time: string; // e.g. "10:45 AM"
  timestamp: string; // ISO string
}

export interface UpdatePricePayload {
  price: number; // Base selling price
  discount?: number; // Discount percentage (0-99)
  gstRate?: number; // GST rate percentage (e.g. 18)
  reason?: string;
}

export interface CartPriceChange {
  productId: string;
  name: string;
  sku: string;
  oldPrice: number;
  currentPrice: number;
  diff: number;
  unit: string;
}

export interface CartPriceValidationResult {
  valid: boolean;
  priceChanges: CartPriceChange[];
}


