import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Package, ShoppingCart, DollarSign,
  TrendingUp, Activity, BarChart3
} from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection, getDocs, query, where, orderBy, limit
} from 'firebase/firestore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  pendingOrders: number;
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, totalProducts: 0, totalOrders: 0,
    totalRevenue: 0, todayOrders: 0, pendingOrders: 0,
  });
  const [, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!db) return;
      try {
        setLoading(true);

        // Fetch counts
        const [usersSnap, productsSnap, ordersSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(query(collection(db, 'products'), where('isDeleted', '==', false))),
          getDocs(collection(db, 'orders')),
        ]);

        const orders = ordersSnap.docs.map((d) => d.data());
        const totalRevenue = orders
          .filter((o) => o.status === 'selesai' || o.status === 'paid')
          .reduce((sum, o) => sum + (o.total || 0), 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = orders.filter((o) => {
          const createdAt = o.createdAt?.toDate?.() || new Date(o.createdAt);
          return createdAt >= today;
        }).length;

        setStats({
          totalUsers: usersSnap.size,
          totalProducts: productsSnap.size,
          totalOrders: ordersSnap.size,
          totalRevenue,
          todayOrders,
          pendingOrders: orders.filter((o) => o.status === 'pending').length,
        });

        // Sales chart data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date;
        });
        const salesChartData = last7Days.map((date) => {
          const dateStr = date.toLocaleDateString('id-ID', { weekday: 'short' });
          const dayOrders = orders.filter((o) => {
            const createdAt = o.createdAt?.toDate?.() || new Date(o.createdAt);
            return (
              createdAt.getDate() === date.getDate() &&
              createdAt.getMonth() === date.getMonth()
            );
          });
          const dayRevenue = dayOrders
            .filter((o) => o.status === 'selesai' || o.status === 'paid')
            .reduce((sum, o) => sum + (o.total || 0), 0);
          return { name: dateStr, orders: dayOrders.length, revenue: dayRevenue };
        });
        setSalesData(salesChartData);

        // Category distribution
        const products = productsSnap.docs.map((d) => d.data());
        const categoryMap: Record<string, number> = {};
        products.forEach((p) => {
          categoryMap[p.category || 'Lainnya'] = (categoryMap[p.category || 'Lainnya'] || 0) + 1;
        });
        setCategoryData(
          Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
        );

        // Recent orders
        const recentOrdersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentSnap = await getDocs(recentOrdersQuery);
        setRecentOrders(
          recentSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total User', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Produk', value: stats.totalProducts, icon: Package, color: 'bg-purple-500' },
    { label: 'Total Pesanan', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'Pendapatan', value: `Rp ${(stats.totalRevenue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'bg-pink-500' },
    { label: 'Pesanan Hari Ini', value: stats.todayOrders, icon: TrendingUp, color: 'bg-orange-500' },
    { label: 'Menunggu', value: stats.pendingOrders, icon: Activity, color: 'bg-yellow-500' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((stat, i) => (
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
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Penjualan 7 Hari Terakhir
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pendapatan 7 Hari Terakhir
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Category Distribution */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-bold mb-4">Distribusi Kategori</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {categoryData.map((cat, i) => (
              <span key={i} className="text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {cat.name} ({cat.value})
              </span>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Pesanan Terbaru</h3>
            <Link to="/admin/orders" className="text-sm text-purple-600 hover:text-purple-700">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">{order.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.userEmail || 'Guest'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">Rp {(order.total || 0).toLocaleString('id-ID')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'selesai' ? 'bg-green-100 text-green-700' :
                    order.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
