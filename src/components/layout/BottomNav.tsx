import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import useStore from '@/stores/useStore';

export default function BottomNav() {
  const location = useLocation();
  const { getCartCount } = useStore();
  const cartCount = getCartCount();

  const navItems = [
    { icon: Home, label: 'Beranda', path: '/' },
    { icon: ShoppingBag, label: 'Produk', path: '/products' },
    { icon: ShoppingCart, label: 'Keranjang', path: '/cart' },
    { icon: User, label: 'Akun', path: '/dashboard' },
  ];

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-purple-600' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.path === '/cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-purple-500 text-white text-[9px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
