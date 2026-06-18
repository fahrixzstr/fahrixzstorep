import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Gift,
  Wallet,
  Settings,
  Shield,
  BarChart3,
  MessageSquare,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import useStore from '@/stores/useStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Produk' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Pesanan' },
  { href: '/admin/users', icon: Users, label: 'Pengguna' },
  { href: '/admin/missions', icon: Gift, label: 'Misi' },
  { href: '/admin/finance', icon: Wallet, label: 'Keuangan' },
  { href: '/admin/payments', icon: CreditCard, label: 'Pembayaran' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/support', icon: MessageSquare, label: 'Support' },
  { href: '/admin/security', icon: Shield, label: 'Keamanan' },
  { href: '/admin/settings', icon: Settings, label: 'Pengaturan' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-card border-r border-border z-40 transition-all duration-300 hidden lg:flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="FahriXz Store"
              className="w-8 h-8 rounded object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-bold text-sm gradient-text">Admin</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          className={cn('w-full justify-start text-destructive', collapsed && 'justify-center')}
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Keluar</span>}
        </Button>
      </div>
    </aside>
  );
}
