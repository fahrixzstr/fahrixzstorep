// ===== AUTH & USER =====
export interface User {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: 'user' | 'admin';
  emailVerified: boolean;
  isAnonymous: boolean;
  providers: string[];
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isBlocked: boolean;
  blockReason?: string;
}

export interface LoginHistory {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ip: string;
  method: string;
  timestamp: Date;
}

// ===== PRODUCT =====
export type ProductType = 'digital';
export type LicenseType = 'none' | 'personal' | 'commercial' | 'enterprise';
export type SubscriptionInterval = 'weekly' | 'monthly' | 'yearly';
export type ProductStatus = 'active' | 'draft';

export interface Product {
  id: string;
  type: ProductType;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  category: string;
  categoryId: string;
  tags: string[];
  coverImages: string[];
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  downloadLimit: number;
  licenseType: LicenseType;
  previewUrl: string | null;
  version: string;
  changelog: string;
  isSubscription: boolean;
  subscriptionInterval: SubscriptionInterval | null;
  subscriptionPrice: number | null;
  trialDays: number;
  bundleProducts: string[];
  status: ProductStatus;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  reviewCount: number;
  soldCount: number;
  badge?: 'flash_sale' | 'terlaris' | 'bestseller' | 'subscription' | 'new';
}

// ===== CATEGORY =====
export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  order: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ===== CART =====
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  isGift?: boolean;
  giftEmail?: string;
  giftMessage?: string;
  addedAt: Date;
}

// ===== ORDER =====
export type OrderStatus = 'pending' | 'paid' | 'selesai' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'expired';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  licenseKey?: string;
  downloadUrl?: string;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  voucherCode: string | null;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentUrl: string | null;
  transactionId: string | null;
  isGift: boolean;
  giftEmail: string | null;
  giftMessage: string | null;
  giftRedeemed: boolean;
  giftRedeemedAt: Date | null;
  giftRedeemedBy: string | null;
  fraudFlag: boolean;
  fraudReason: string | null;
  emailSent: boolean;
  createdAt: Date;
  paidAt: Date | null;
  completedAt: Date | null;
  downloadExpiry: Date | null;
}

// ===== VOUCHER =====
export interface Voucher {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  applicableProducts: string[] | 'all';
  usageLimit: number;
  usageCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
}

// ===== FLASH SALE =====
export interface FlashSale {
  id: string;
  productId: string;
  salePrice: number;
  originalPrice: number;
  startTime: Date;
  endTime: Date;
  quota: number;
  soldCount: number;
  isActive: boolean;
  createdAt: Date;
}

// ===== REVIEW =====
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto: string | null;
  rating: number;
  comment: string;
  orderId: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== WISHLIST =====
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: Date;
}

// ===== LICENSE =====
export interface License {
  id: string;
  key: string;
  productId: string;
  productName: string;
  userId: string;
  userEmail: string;
  orderId: string;
  type: LicenseType;
  status: 'active' | 'revoked';
  revokedAt: Date | null;
  revokedReason: string | null;
  createdAt: Date;
}

// ===== SUBSCRIPTION =====
export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  interval: SubscriptionInterval;
  price: number;
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  createdAt: Date;
}

// ===== AFFILIATE =====
export interface Affiliate {
  id: string;
  userId: string;
  userName: string;
  referralCode: string;
  commissionRate: number;
  totalClicks: number;
  totalConversions: number;
  pendingCommission: number;
  paidCommission: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface AffiliateClick {
  id: string;
  affiliateId: string;
  referralCode: string;
  ip: string;
  userAgent: string;
  converted: boolean;
  orderId: string | null;
  createdAt: Date;
}

// ===== SUPPORT TICKET =====
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'download' | 'license' | 'refund' | 'other';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  attachments: string[];
  replies: TicketReply[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
}

export interface TicketReply {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
  message: string;
  attachments: string[];
  createdAt: Date;
}

// ===== REFUND =====
export type RefundStatus = 'pending' | 'approved' | 'rejected';
export type RefundReason = 'not_as_described' | 'file_broken' | 'wrong_purchase' | 'cant_download' | 'other';

export interface RefundRequest {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  reason: RefundReason;
  description: string;
  status: RefundStatus;
  adminNote: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
}

// ===== NOTIFICATION =====
export interface Notification {
  id: string;
  userId: string | 'all';
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system' | 'product' | 'subscription';
  isRead: boolean;
  link: string | null;
  createdAt: Date;
}

// ===== BANNER =====
export interface Banner {
  id: string;
  imageUrl: string;
  link: string;
  position: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
}

// ===== ANNOUNCEMENT =====
export interface Announcement {
  id: string;
  text: string;
  color: string;
  link: string | null;
  isDismissable: boolean;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
}

// ===== EMAIL LOG =====
export interface EmailLog {
  id: string;
  orderId: string;
  to: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'retrying';
  sentAt: Date;
  retryCount: number;
}

// ===== ADMIN AUDIT LOG =====
export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ip: string;
  createdAt: Date;
}

// ===== ACTIVITY LOG =====
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  ip: string;
  device: string;
  browser: string;
  isSuspicious: boolean;
  createdAt: Date;
}

// ===== API KEY =====
export interface ApiKey {
  id: string;
  key: string;
  userId: string;
  productId: string;
  productName: string;
  type: 'live' | 'test';
  status: 'active' | 'revoked';
  usageCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
}

// ===== GIFT PURCHASE =====
export interface GiftPurchase {
  id: string;
  orderId: string;
  buyerId: string;
  buyerEmail: string;
  recipientEmail: string;
  recipientId: string | null;
  productId: string;
  productName: string;
  message: string | null;
  redeemed: boolean;
  redeemedAt: Date | null;
  createdAt: Date;
}

// ===== PRODUCT VERSION =====
export interface ProductVersion {
  id: string;
  productId: string;
  version: string;
  changelog: string;
  fileUrl: string;
  fileSize: number;
  createdAt: Date;
}

// ===== SITE CONFIG =====
export interface SiteConfig {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  maintenanceMode: boolean;
  refundPolicyDays: number;
  affiliateCommission: number;
  downloadLimitDefault: number;
  linkExpiryDays: number;
  enableRegistration: boolean;
  enableSocialLogin: boolean;
  enableAffiliate: boolean;
  enableSubscription: boolean;
  enable2FA: boolean;
}

// ===== CART =====
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  isGift?: boolean;
  giftEmail?: string;
  giftMessage?: string;
  addedAt: Date;
}

// ===== CHAT =====
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}


// ===== TRANSACTION =====
export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'purchase' | 'refund' | 'commission';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: Date;
}

// ===== USER MISSION =====
export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  reward: number;
  completedAt: Date | null;
  createdAt: Date;
}
