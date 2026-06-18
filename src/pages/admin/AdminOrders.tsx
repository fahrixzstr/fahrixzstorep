import { useEffect, useState } from 'react';
import { Search, Package, CheckCircle, XCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { toast } from 'sonner';
import type { Order } from '@/types';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchOrders = async () => {
    if (!db) return;
    try {
      setLoading(true);
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, status: Order['status']) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'orders', id), {
        status,
        updatedAt: serverTimestamp(),
        completedAt: status === 'selesai' ? serverTimestamp() : null,
      });
      toast.success(`Status pesanan diperbarui ke ${status}`);
      fetchOrders();
    } catch {
      toast.error('Gagal memperbarui status');
    }
  };

  const filteredOrders = orders
    .filter((o) => {
      if (statusFilter === 'all') return true;
      return o.status === statusFilter;
    })
    .filter((o) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.invoiceNumber.toLowerCase().includes(q) ||
        o.userEmail?.toLowerCase().includes(q) ||
        o.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pesanan</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
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
          {['all', 'pending', 'paid', 'selesai', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-card border border-border hover:bg-muted'
              }`}
            >
              {s === 'all' ? 'Semua' : s === 'paid' ? 'Dibayar' : s === 'selesai' ? 'Selesai' : s === 'pending' ? 'Pending' : 'Batal'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium">Invoice</th>
                  <th className="text-left p-3 font-medium">Customer</th>
                  <th className="text-left p-3 font-medium">Produk</th>
                  <th className="text-left p-3 font-medium">Total</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Tanggal</th>
                  <th className="text-right p-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{order.invoiceNumber}</td>
                    <td className="p-3">
                      <p className="text-xs">{order.userName || 'Guest'}</p>
                      <p className="text-xs text-muted-foreground">{order.userEmail || '-'}</p>
                    </td>
                    <td className="p-3">
                      {order.items.map((item, i) => (
                        <p key={i} className="text-xs">{item.productName} x{item.quantity}</p>
                      ))}
                    </td>
                    <td className="p-3 font-medium">Rp {order.total.toLocaleString('id-ID')}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'selesai' ? 'bg-green-100 text-green-700' :
                        order.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'paid')}
                              className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                              title="Tandai Dibayar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                              title="Batalkan"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {order.status === 'paid' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'selesai')}
                            className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                            title="Tandai Selesai"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Tidak ada pesanan</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
