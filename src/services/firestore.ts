import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  onSnapshot,
  increment,
  type QueryDocumentSnapshot,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import type {
  Product,
  Category,
  Order,
  CartItem,
  Review,
  WishlistItem,
  Notification,
  Banner,
  FlashSale,
  Voucher,
  License,
  Subscription,
  SupportTicket,
  RefundRequest,
  Affiliate,
  SiteConfig,
  Announcement,
} from '@/types';

// ===== PRODUCT SERVICE =====
export const productService = {
  // Get all products with filters
  getProducts: async (filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: 'price_asc' | 'price_desc' | 'popular' | 'newest';
    limit?: number;
    lastDoc?: QueryDocumentSnapshot<DocumentData>;
  }) => {
    if (!db) throw new Error('Firestore not initialized');
    const constraints: QueryConstraint[] = [
      where('isDeleted', '==', false),
      where('status', '==', 'active'),
    ];

    if (filters?.category) {
      constraints.push(where('categoryId', '==', filters.category));
    }

    // Sort
    const sortField = filters?.sort === 'price_asc' ? 'price'
      : filters?.sort === 'price_desc' ? 'price'
      : filters?.sort === 'popular' ? 'soldCount'
      : 'createdAt';
    constraints.push(orderBy(sortField, filters?.sort === 'price_asc' ? 'asc' : 'desc'));

    constraints.push(limit(filters?.limit || 12));

    if (filters?.lastDoc) {
      constraints.push(startAfter(filters.lastDoc));
    }

    const q = query(collection(db, 'products'), ...constraints);
    const snapshot = await getDocs(q);
    let products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));

    // Client-side price filter
    if (filters?.minPrice !== undefined) {
      products = products.filter((p) => (p.discountPrice || p.price) >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      products = products.filter((p) => (p.discountPrice || p.price) <= filters.maxPrice!);
    }

    // Client-side search
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.tags.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    return { products, lastDoc: snapshot.docs[snapshot.docs.length - 1] || null };
  },

  // Get single product
  getProduct: async (id: string): Promise<Product | null> => {
    if (!db) return null;
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Product : null;
  },

  // Real-time product listener
  onProductChange: (id: string, callback: (product: Product | null) => void) => {
    if (!db) return () => {};
    return onSnapshot(doc(db, 'products', id), (doc) => {
      callback(doc.exists() ? { id: doc.id, ...doc.data() } as Product : null);
    });
  },

  // Get related products
  getRelatedProducts: async (categoryId: string, excludeId: string, maxResults: number = 4): Promise<Product[]> => {
    if (!db) return [];
    const q = query(
      collection(db, 'products'),
      where('categoryId', '==', categoryId),
      where('isDeleted', '==', false),
      where('status', '==', 'active'),
      orderBy('soldCount', 'desc'),
      limit(maxResults + 1)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .filter((d) => d.id !== excludeId)
      .slice(0, maxResults)
      .map((d) => ({ id: d.id, ...d.data() } as Product));
  },

  // Increment view count
  incrementViews: async (id: string) => {
    if (!db) return;
    await updateDoc(doc(db, 'products', id), {
      viewCount: increment(1),
    });
  },
};

// ===== CATEGORY SERVICE =====
export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    if (!db) return [];
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
  },

  onCategoriesChange: (callback: (categories: Category[]) => void) => {
    if (!db) return () => {};
    return onSnapshot(
      query(collection(db, 'categories'), orderBy('order', 'asc')),
      (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
      }
    );
  },
};

// ===== CART SERVICE =====
export const cartService = {
  // Get cart from Firestore (for logged in users)
  getCart: async (userId: string): Promise<CartItem[]> => {
    if (!db) return [];
    const q = query(collection(db, 'carts'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data().items as CartItem[]).flat();
  },

  // Save cart to Firestore
  saveCart: async (userId: string, items: CartItem[]) => {
    if (!db) return;
    await setDoc(doc(db, 'carts', userId), {
      userId,
      items,
      updatedAt: serverTimestamp(),
    });
  },

  // Clear cart
  clearCart: async (userId: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'carts', userId));
  },
};

// ===== ORDER SERVICE =====
export const orderService = {
  createOrder: async (order: Omit<Order, 'id'>): Promise<string> => {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  getOrder: async (id: string): Promise<Order | null> => {
    if (!db) return null;
    const docRef = doc(db, 'orders', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Order : null;
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    if (!db) return [];
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
  },

  // Real-time order listener
  onOrderChange: (orderId: string, callback: (order: Order | null) => void) => {
    if (!db) return () => {};
    return onSnapshot(doc(db, 'orders', orderId), (doc) => {
      callback(doc.exists() ? { id: doc.id, ...doc.data() } as Order : null);
    });
  },

  // Update order status
  updateOrderStatus: async (id: string, status: Order['status'], paymentStatus: Order['paymentStatus']) => {
    if (!db) return;
    await updateDoc(doc(db, 'orders', id), {
      status,
      paymentStatus,
      completedAt: status === 'selesai' ? serverTimestamp() : null,
    });
  },

  // Generate invoice number
  generateInvoice: (): string => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `INV-${date}-${random}`;
  },
};

// ===== REVIEW SERVICE =====
export const reviewService = {
  getProductReviews: async (productId: string): Promise<Review[]> => {
    if (!db) return [];
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
  },

  onProductReviewsChange: (productId: string, callback: (reviews: Review[]) => void) => {
    if (!db) return () => {};
    return onSnapshot(
      query(collection(db, 'reviews'), where('productId', '==', productId), orderBy('createdAt', 'desc')),
      (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
      }
    );
  },

  createReview: async (review: Omit<Review, 'id'>): Promise<string> => {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...review,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },
};

// ===== WISHLIST SERVICE =====
export const wishlistService = {
  getWishlist: async (userId: string): Promise<WishlistItem[]> => {
    if (!db) return [];
    const q = query(
      collection(db, 'wishlists'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WishlistItem));
  },

  addToWishlist: async (userId: string, productId: string, product: any) => {
    if (!db) return;
    await addDoc(collection(db, 'wishlists'), {
      userId,
      productId,
      product,
      createdAt: serverTimestamp(),
    });
  },

  removeFromWishlist: async (wishlistItemId: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'wishlists', wishlistItemId));
  },

  onWishlistChange: (userId: string, callback: (items: WishlistItem[]) => void) => {
    if (!db) return () => {};
    return onSnapshot(
      query(collection(db, 'wishlists'), where('userId', '==', userId)),
      (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WishlistItem)));
      }
    );
  },
};

// ===== NOTIFICATION SERVICE =====
export const notificationService = {
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    if (!db) return [];
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [userId, 'all']),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
  },

  onNotificationsChange: (userId: string, callback: (notifications: Notification[]) => void) => {
    if (!db) return () => {};
    return onSnapshot(
      query(
        collection(db, 'notifications'),
        where('userId', 'in', [userId, 'all']),
        orderBy('createdAt', 'desc'),
        limit(50)
      ),
      (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Notification)));
      }
    );
  },

  markAsRead: async (notificationId: string) => {
    if (!db) return;
    await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
  },
};

// ===== BANNER SERVICE =====
export const bannerService = {
  getActiveBanners: async (): Promise<Banner[]> => {
    if (!db) return [];
    const now = new Date().toISOString();
    const q = query(
      collection(db, 'banners'),
      where('isActive', '==', true),
      where('validFrom', '<=', now),
      where('validUntil', '>=', now),
      orderBy('position', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Banner));
  },

  onActiveBanners: (callback: (banners: Banner[]) => void) => {
    if (!db) return () => {};
    const now = new Date().toISOString();
    return onSnapshot(
      query(
        collection(db, 'banners'),
        where('isActive', '==', true),
        where('validFrom', '<=', now),
        where('validUntil', '>=', now),
        orderBy('position', 'asc')
      ),
      (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Banner)));
      }
    );
  },
};

// ===== FLASH SALE SERVICE =====
export const flashSaleService = {
  getActiveFlashSales: async (): Promise<FlashSale[]> => {
    if (!db) return [];
    const now = new Date().toISOString();
    const q = query(
      collection(db, 'flashSales'),
      where('isActive', '==', true),
      where('startTime', '<=', now),
      where('endTime', '>=', now),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FlashSale));
  },

  onActiveFlashSales: (callback: (sales: FlashSale[]) => void) => {
    if (!db) return () => {};
    const now = new Date().toISOString();
    return onSnapshot(
      query(
        collection(db, 'flashSales'),
        where('isActive', '==', true),
        where('startTime', '<=', now),
        where('endTime', '>=', now),
        limit(10)
      ),
      (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FlashSale)));
      }
    );
  },
};

// ===== VOUCHER SERVICE =====
export const voucherService = {
  validateVoucher: async (code: string, total: number): Promise<Voucher | null> => {
    if (!db) return null;
    const q = query(collection(db, 'vouchers'), where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const voucher = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Voucher;

    // Validate
    const now = new Date();
    if (!voucher.isActive) return null;
    if (voucher.validFrom > now) return null;
    if (voucher.validUntil < now) return null;
    if (voucher.usageCount >= voucher.usageLimit) return null;
    if (total < voucher.minOrder) return null;

    return voucher;
  },
};

// ===== LICENSE SERVICE =====
export const licenseService = {
  getUserLicenses: async (userId: string): Promise<License[]> => {
    if (!db) return [];
    const q = query(
      collection(db, 'licenses'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as License));
  },

  onUserLicensesChange: (userId: string, callback: (licenses: License[]) => void) => {
    if (!db) return () => {};
    return onSnapshot(
      query(collection(db, 'licenses'), where('userId', '==', userId), orderBy('createdAt', 'desc')),
      (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as License)));
      }
    );
  },
};

// ===== SUBSCRIPTION SERVICE =====
export const subscriptionService = {
  getUserSubscriptions: async (userId: string): Promise<Subscription[]> => {
    if (!db) return [];
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Subscription));
  },

  onUserSubscriptionsChange: (userId: string, callback: (subs: Subscription[]) => void) => {
    if (!db) return () => {};
    return onSnapshot(
      query(collection(db, 'subscriptions'), where('userId', '==', userId)),
      (snapshot) => {
        callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Subscription)));
      }
    );
  },
};

// ===== SUPPORT TICKET SERVICE =====
export const ticketService = {
  createTicket: async (ticket: Omit<SupportTicket, 'id'>): Promise<string> => {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, 'supportTickets'), {
      ...ticket,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  getUserTickets: async (userId: string): Promise<SupportTicket[]> => {
    if (!db) return [];
    const q = query(
      collection(db, 'supportTickets'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SupportTicket));
  },
};

// ===== REFUND SERVICE =====
export const refundService = {
  createRefundRequest: async (refund: Omit<RefundRequest, 'id'>): Promise<string> => {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, 'refundRequests'), {
      ...refund,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  getUserRefundRequests: async (userId: string): Promise<RefundRequest[]> => {
    if (!db) return [];
    const q = query(
      collection(db, 'refundRequests'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as RefundRequest));
  },
};

// ===== AFFILIATE SERVICE =====
export const affiliateService = {
  getAffiliate: async (userId: string): Promise<Affiliate | null> => {
    if (!db) return null;
    const q = query(collection(db, 'affiliates'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Affiliate;
  },

  createAffiliate: async (userId: string, userName: string, referralCode: string): Promise<string> => {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = await addDoc(collection(db, 'affiliates'), {
      userId,
      userName,
      referralCode,
      commissionRate: 0.1,
      totalClicks: 0,
      totalConversions: 0,
      pendingCommission: 0,
      paidCommission: 0,
      status: 'active',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },
};

// ===== ANNOUNCEMENT SERVICE =====
export const announcementService = {
  getActiveAnnouncements: async (): Promise<Announcement[]> => {
    if (!db) return [];
    const now = new Date().toISOString();
    const q = query(
      collection(db, 'announcements'),
      where('isActive', '==', true),
      where('validFrom', '<=', now),
      where('validUntil', '>=', now),
      limit(3)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement));
  },
};

// ===== SITE CONFIG SERVICE =====
export const siteConfigService = {
  getConfig: async (): Promise<SiteConfig | null> => {
    if (!db) return null;
    const docRef = doc(db, 'config', 'site');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as SiteConfig : null;
  },

  onConfigChange: (callback: (config: SiteConfig | null) => void) => {
    if (!db) return () => {};
    return onSnapshot(doc(db, 'config', 'site'), (doc) => {
      callback(doc.exists() ? doc.data() as SiteConfig : null);
    });
  },
};
