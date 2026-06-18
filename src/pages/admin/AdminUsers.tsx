import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, UserX, Shield } from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection, getDocs, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { toast } from 'sonner';

interface UserData {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: string;
  isBlocked: boolean;
  providers: string[];
  createdAt: any;
  lastLoginAt: any;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    if (!db) return;
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserData)));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId: string, currentBlock: boolean) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        isBlocked: !currentBlock,
        updatedAt: serverTimestamp(),
      });
      toast.success(`User ${!currentBlock ? 'diblokir' : 'dibuka blokirnya'}`);
      fetchUsers();
    } catch {
      toast.error('Gagal memperbarui status user');
    }
  };

  const filteredUsers = users.filter((u) =>
    !searchQuery ||
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter((u) => !u.isBlocked).length,
    blocked: users.filter((u) => u.isBlocked).length,
    admin: users.filter((u) => u.role === 'admin').length,
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manajemen User</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total User', value: stats.total, icon: Users },
          { label: 'Aktif', value: stats.active, icon: Shield },
          { label: 'Diblokir', value: stats.blocked, icon: UserX },
          { label: 'Admin', value: stats.admin, icon: Shield },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <stat.icon className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari user..."
          className="w-full max-w-md pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm"
        />
      </div>

      {/* Users Table */}
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
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Provider</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-right p-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-sm font-bold text-purple-600 dark:text-purple-400">
                          {user.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <p className="font-medium">{user.displayName || 'Anonymous'}</p>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{user.email || '-'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {user.providers?.map((p: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full">
                            {p.replace('.com', '')}
                          </span>
                        )) || '-'}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {user.isBlocked ? 'Diblokir' : 'Aktif'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          user.isBlocked
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {user.isBlocked ? 'Buka Blokir' : 'Blokir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Tidak ada user</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
