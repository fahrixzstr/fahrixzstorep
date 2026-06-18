import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import UserLayout from '@/components/layout/UserLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import useStore from '@/stores/useStore';
import authService from '@/services/auth';
import { Toaster } from '@/components/ui/sonner';

// Lazy load pages
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const Products = lazy(() => import('@/pages/store/Products'));
const ProductDetail = lazy(() => import('@/pages/store/ProductDetail'));
const Cart = lazy(() => import('@/pages/store/Cart'));
const Checkout = lazy(() => import('@/pages/store/Checkout'));
const PaymentSuccess = lazy(() => import('@/pages/store/PaymentSuccess'));
const Dashboard = lazy(() => import('@/pages/user/Dashboard'));
const Orders = lazy(() => import('@/pages/user/Orders'));
const Settings = lazy(() => import('@/pages/user/Settings'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Terms = lazy(() => import('@/pages/Terms'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Support = lazy(() => import('@/pages/Support'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Auth route wrapper
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useStore();
  return isLoggedIn ? <Navigate to="/" replace /> : <>{children}</>;
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useStore();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}

// Admin route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  // Admin accessible via secret login (5 logo clicks)
  // For now, we allow access to admin panel
  return <>{children}</>;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = authService.onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthInitializer>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth Routes - No Layout */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <Register />
              </AuthRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthRoute>
                <ForgotPassword />
              </AuthRoute>
            }
          />

          {/* User Routes - With UserLayout */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/support" element={<Support />} />

            {/* Protected User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Admin Routes - With AdminLayout */}
          <Route
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/finance" element={<AdminDashboard />} />
            <Route path="/admin/vouchers" element={<AdminDashboard />} />
            <Route path="/admin/support" element={<AdminDashboard />} />
            <Route path="/admin/licenses" element={<AdminDashboard />} />
            <Route path="/admin/reviews" element={<AdminDashboard />} />
            <Route path="/admin/settings" element={<AdminDashboard />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" richColors />
    </AuthInitializer>
  );
}
