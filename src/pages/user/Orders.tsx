import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Download, Key, Clock, Search } from 'lucide-react';
import { orderService, licenseService } from '@/services/firestore';
import useStore from '@/stores/useStore';
import type { Order, License } from '@/types';

export default function Orders() {
  const { user, isLoggedIn } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const [ordersData, licensesData] = await Promise.all([
          orderService.getUserOrders(user.uid),
          licenseService.getUserLicenses(user.uid),
        ]);
        setOrders(ordersData);
        setLicenses(licensesData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredOrders = orders
    .filter((o) => {
      if (filter === 'all') return true;
      if (filter === 'paid') return o.status === 'paid' || o.status === 'selesai';
      if (filter === 'pending') return o.status === 'pending';
      return true;
    })
    .filter((o) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.invoiceNumber.toLowerCase().includes(q) ||
        o.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Login Diperlukan</h2>
          <p className="text-muted-foreground mb-4">Silakan login untuk melihat pesanan Anda</p>
          <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl">
            Masuk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pembelian Saya / Library</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Pesanan', value: orders.length, icon: Package },
          { label: 'Berhasil', value: orders.filter((o) => o.status === 'selesai').length, icon: Download },
          { label: 'License Keys', value: licenses.length, icon: Key },
          { label: 'Pending', value: orders.filter((o) => o.status === 'pending').length, icon: Clock },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <stat.icon className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pesanan..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'paid', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-card border border-border hover:bg-muted'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'paid' ? 'Berhasil' : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-shimmer h-24" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold">{order.invoiceNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'selesai' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      order.status === 'paid' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {order.status === 'selesai' ? 'Selesai' :
                       order.status === 'paid' ? 'Dibayar' :
                       order.status === 'pending' ? 'Menunggu' :
                       order.status === 'cancelled' ? 'Dibatalkan' : 'Refund'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <img
                          src={item.productImage || '/placeholder-product.png'}
                          alt={item.productName}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="text-sm">{item.productName}</span>
                        <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600 dark:text-purple-400">
                    Rp {order.total.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID') : '-'}
                  </p>
                  {(order.status === 'selesai' || order.status === 'paid') && (
                    <button className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 mt-1">
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  )}
                </div>
              </div>

              {/* License Keys */}
              {licenses.filter((l) => l.orderId === order.id).length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium mb-2">License Keys:</p>
                  {licenses
                    .filter((l) => l.orderId === order.id)
                    .map((license) => (
                      <div key={license.id} className="flex items-center justify-between bg-muted rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <Key className="w-3 h-3 text-purple-500" />
                          <code className="text-xs font-mono">{license.key}</code>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          license.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {license.status === 'active' ? 'Aktif' : 'Revoked'}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Belum ada pesanan</p>
          <Link to="/products" className="text-purple-600 hover:text-purple-700 text-sm mt-2 inline-block">
            Mulai Belanja
          </Link>
        </div>
      )}
    </div>
  );
}
