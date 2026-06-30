// ============================================
// USER AND AUTH MODELS
// Sincronizado con UserDTO.java
// ============================================

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string; // LocalDate en backend
  role: string; // 'USER' | 'ADMIN' - viene como string del backend
  isActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// ============================================
// PRODUCT MODELS
// Sincronizado con ProductDTO.java
// ============================================

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number; // BigDecimal en backend
  hasDiscount: boolean;
  discountPercent: number; // BigDecimal en backend
  stock: number;
  category?: Category;
  brand?: Brand;
  status: PublicationStatus;
  hasVariants: boolean;
  variants?: ProductVariant[];
  images: ProductImage[];
  tags?: Tag[];
  createdAt: string; // Instant en backend
  updatedAt: string; // Instant en backend
}

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: number;
  sku: string;
  variantName: string;
  flavor?: string;
  size?: string;
  color?: string;
  weight?: string;
  material?: string;
  format?: string;
  priceAdjustment?: number; // BigDecimal en backend
  stock: number;
  active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  children?: Category[];
  displayOrder: number;
  active: boolean;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  active: boolean;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export enum PublicationStatus {
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
  DRAFT = 'DRAFT'
}

// ============================================
// BRANCH MODELS
// Sincronizado con BranchDTO.java
// ============================================

export interface Branch {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  openingHours?: string;
  description?: string;
  latitude?: number; // BigDecimal en backend
  longitude?: number; // BigDecimal en backend
  capacity?: number;
  areaSqm?: number;
  active: boolean;
  createdAt: string; // Instant en backend
  images?: BranchImage[];
  amenities?: BranchAmenity[];
  membershipPlans?: MembershipPlan[];
  averageRating?: number; // Double en backend
  totalReviews?: number; // Long en backend
}

export interface BranchImage {
  id: number;
  branchId: number;
  url: string;
  altText?: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface BranchAmenity {
  id: number;
  branchId: number;
  name: string;
  description?: string;
  iconName?: string;
  available: boolean;
}

export interface MembershipPlan {
  id: number;
  branchId?: number;
  name: string;
  description?: string;
  price: number; // BigDecimal en backend
  durationMonths: number;
  isPopular: boolean;
  active: boolean;
  displayOrder: number;
}

export interface BranchReview {
  id: number;
  branchId: number;
  userId: number;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string; // Instant en backend
}

// ============================================
// CART MODELS
// Sincronizado con CartDTO.java
// ============================================

export interface Cart {
  id: number;
  items: CartItem[];
  totalItems: number;
  subtotal: number; // BigDecimal en backend
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number; // BigDecimal en backend
  quantity: number;
  lineTotal: number; // BigDecimal en backend
}

// ============================================
// ORDER MODELS
// Sincronizado con OrderDTO.java
// ============================================

export interface Order {
  id: number;
  orderNumber: string;
  userEmail: string;
  status: OrderStatus;
  subtotal: number; // BigDecimal en backend
  discount: number; // BigDecimal en backend
  tax: number; // BigDecimal en backend
  shipping: number; // BigDecimal en backend
  total: number; // BigDecimal en backend
  couponCode?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  createdAt: string; // Instant en backend
  items: OrderItem[];
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number; // BigDecimal en backend
  lineTotal: number; // BigDecimal en backend
}

// Order Request Models (para crear órdenes)
export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
}

// ============================================
// ADDRESS MODELS
// Sincronizado con AddressDTO.java
// ============================================

export interface Address {
  id: number;
  type: AddressType;
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export enum AddressType {
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING',
  BOTH = 'BOTH'
}

// ============================================
// ORDER STATUS AND ENUMS
// ============================================

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

// ============================================
// COUPON MODELS
// Sincronizado con CouponDTO.java
// ============================================

export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountValue: number; // BigDecimal en backend
  discountType: CouponType;
  minPurchase?: number; // BigDecimal en backend
  maxUses?: number;
  currentUses: number;
  expiresAt: string; // Instant en backend
  isActive: boolean;
}

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}

// ============================================
// REFUND MODELS
// Sincronizado con RefundDTO.java
// ============================================

export interface Refund {
  id: number;
  orderId: number;
  amount: number; // BigDecimal en backend
  status: RefundStatus;
  reason: string;
  requestedAt: string; // Instant en backend
  processedAt?: string; // Instant en backend
}

export enum RefundStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

// ============================================
// PAGINATION
// Sincronizado con Spring Data Page
// ============================================

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================
// ERROR RESPONSE
// ============================================

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: { [key: string]: string };
  timestamp: string;
}
