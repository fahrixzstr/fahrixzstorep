import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Heart, CreditCard, Settings, LogOut, User, Download, Key } from 'lucide-react';
import { orderService, licenseService } from '@/services/firestore';
import useStore from '@/stores/useStore';
import authService from '@/services/auth';
import { toast } from 'sonner';
import type { Order, License } from '@/types';

export default function Dashboard() {
  const { user, logout } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;
      try {
        const [ordersData, licensesData] = await Promise.all([
          orderService.getUserOrders(user.uid),
          licenseService.getUserLicenses(user.uid),
        ]);
        setOrders(ordersData);
        setLicenses(licensesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success('Logout berhasil');
    } catch {
      toast.error('Logout gagal');
    }
  };

  const stats = [
    { label: 'Total Pesanan', value: orders.length, icon: Package, color: 'bg-blue-500' },
    { label: 'Selesai', value: orders.filter((o) => o.status === 'selesai').length, icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'License Keys', value: licenses.length, icon: Key, color: 'bg-purple-500' },
    { label: 'Wishlist', value: useStore.getState().wishlist.length, icon: Heart, color: 'bg-pink-500' },
  ];

  const menuItems = [
    { icon: Package, label: 'Pesanan Saya', desc: 'Lihat riwayat pembelian', path: '/orders' },
    { icon: Download, label: 'Library', desc: 'Download produk Anda', path: '/orders' },
    { icon: Key, label: 'License Keys', desc: 'Kelola lisensi produk', path: '/orders' },
    { icon: CreditCard, label: 'Pembayaran', desc: 'Metode pembayaran', path: '/settings' },
    { icon: User, label: 'Profil', desc: 'Edit informasi akun', path: '/settings' },
    { icon: Settings, label: 'Pengaturan', desc: 'Keamanan & privasi', path: '/settings' },
  ];

  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full" />
            ) : (
              user?.displayName?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user?.displayName || 'User'}</h1>
            <p className="text-sm text-muted-foreground">{user?.email || 'Guest'}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                {user?.role || 'Member'}
              </span>
              {user?.providers?.map((p, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full">
                  {p.replace('.com', '')}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className={`${stat.color} w-8 h-8 rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={item.path}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-purple-500/50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <item.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
