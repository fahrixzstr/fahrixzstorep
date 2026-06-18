import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, CartItem, SiteConfig, ChatMessage, Notification } from '@/types';

interface AppState {
  // Auth
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Language
  language: 'id' | 'en';
  setLanguage: (lang: 'id' | 'en') => void;

  // Cart - localStorage for guest
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  setCart: (items: CartItem[]) => void;

  // Guest checkout prompt
  showGuestPrompt: boolean;
  setShowGuestPrompt: (show: boolean) => void;
  pendingAction: string | null;
  setPendingAction: (action: string | null) => void;

  // Wishlist (in-memory, synced with Firestore)
  wishlist: string[]; // product IDs
  toggleWishlist: (productId: string) => void;
  setWishlist: (ids: string[]) => void;
  isInWishlist: (productId: string) => boolean;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  isChatOpen: boolean;
  toggleChat: () => void;

  // Admin
  adminClicks: number;
  lastAdminClick: number | null;
  incrementAdminClick: () => void;
  resetAdminClicks: () => void;

  // Site Config
  siteConfig: SiteConfig;
  setSiteConfig: (config: Partial<SiteConfig>) => void;

  // Recently Viewed
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;

  // Checkout
  checkoutData: {
    items: CartItem[];
    voucherCode: string | null;
    discount: number;
    isGift: boolean;
    giftEmail: string;
    giftMessage: string;
  } | null;
  setCheckoutData: (data: AppState['checkoutData']) => void;
  clearCheckoutData: () => void;
}

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      loading: true,
      setUser: (user) =>
        set({
          user,
          isLoggedIn: !!user,
          isAdmin: user?.role === 'admin',
        }),
      setLoading: (loading) => set({ loading }),
      logout: () =>
        set({
          user: null,
          isLoggedIn: false,
          isAdmin: false,
          cart: [],
          wishlist: [],
        }),

      // Theme
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),

      // Language
      language: 'id',
      setLanguage: (language) => set({ language }),

      // Cart
      cart: [],
      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        })),
      clearCart: () => set({ cart: [] }),
      setCart: (items) => set({ cart: items }),
      getCartTotal: () => {
        return get().cart.reduce(
          (total, item) => total + (item.product.discountPrice || item.product.price) * item.quantity,
          0
        );
      },
      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },

      // Guest prompt
      showGuestPrompt: false,
      setShowGuestPrompt: (show) => set({ showGuestPrompt: show }),
      pendingAction: null,
      setPendingAction: (action) => set({ pendingAction: action }),

      // Wishlist
      wishlist: [],
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),
      setWishlist: (ids) => set({ wishlist: ids }),
      isInWishlist: (productId) => get().wishlist.includes(productId),

      // Notifications
      notifications: [],
      unreadCount: 0,
      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),

      // Chat
      chatMessages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Halo! Saya asisten AI FahriXz Store. Ada yang bisa saya bantu?',
          timestamp: new Date(),
        },
      ],
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      clearChat: () =>
        set({
          chatMessages: [
            {
              id: 'welcome',
              role: 'assistant',
              content: 'Halo! Saya asisten AI FahriXz Store. Ada yang bisa saya bantu?',
              timestamp: new Date(),
            },
          ],
        }),
      isChatOpen: false,
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

      // Admin clicks (secret login)
      adminClicks: 0,
      lastAdminClick: null,
      incrementAdminClick: () =>
        set((state) => ({
          adminClicks: state.adminClicks + 1,
          lastAdminClick: Date.now(),
        })),
      resetAdminClicks: () =>
        set({ adminClicks: 0, lastAdminClick: null }),

      // Site Config
      siteConfig: {
        siteName: 'FahriXz Store',
        siteDescription: 'Marketplace Produk Digital Terbaru di Indonesia.',
        contactEmail: 'fahrixzstore@gmail.com',
        contactPhone: '085609949819',
        maintenanceMode: false,
        refundPolicyDays: 7,
        affiliateCommission: 10,
        downloadLimitDefault: 3,
        linkExpiryDays: 7,
        enableRegistration: true,
        enableSocialLogin: true,
        enableAffiliate: true,
        enableSubscription: true,
        enable2FA: true,
      },
      setSiteConfig: (config) =>
        set((state) => ({
          siteConfig: { ...state.siteConfig, ...config },
        })),

      // Recently Viewed
      recentlyViewed: [],
      addRecentlyViewed: (productId) =>
        set((state) => ({
          recentlyViewed: [productId, ...state.recentlyViewed.filter((id) => id !== productId)].slice(0, 10),
        })),

      // Checkout
      checkoutData: null,
      setCheckoutData: (data) => set({ checkoutData: data }),
      clearCheckoutData: () => set({ checkoutData: null }),
    }),
    {
      name: 'fahrixz-store-v2',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        cart: state.cart,
        wishlist: state.wishlist,
        notifications: state.notifications,
        chatMessages: state.chatMessages,
        siteConfig: state.siteConfig,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
);

export default useStore;
