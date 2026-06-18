import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Moon, Sun, Trash2, Save } from 'lucide-react';
import useStore from '@/stores/useStore';
import authService from '@/services/auth';
import { toast } from 'sonner';

type Tab = 'profile' | 'security' | 'notifications' | 'appearance';

export default function Settings() {
  const { user, theme, toggleTheme } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      await authService.updateUserProfile({ displayName });
      toast.success('Profil diperbarui');
    } catch {
      toast.error('Gagal memperbarui profil');
    } finally { setSaving(false); }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    setSaving(true);
    try {
      await authService.updateUserPassword(newPassword);
      toast.success('Password diperbarui');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Gagal memperbarui password');
    } finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('PERINGATAN: Tindakan ini tidak dapat dibatalkan. Akun Anda akan dihapus permanen. Lanjutkan?')) return;
    try {
      await authService.deleteAccount();
      toast.success('Akun dihapus');
    } catch {
      toast.error('Gagal menghapus akun');
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Keamanan', icon: Lock },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'appearance', label: 'Tampilan', icon: Moon },
  ];

  return (
    <div className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pengaturan</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-card border border-border rounded-xl p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Profil</h2>
                <div>
                  <label className="text-sm font-medium mb-1 block">Nama</label>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <input type="email" value={user?.email || ''} readOnly
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground" />
                </div>
                <button onClick={handleUpdateProfile} disabled={saving}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                  <Save className="w-4 h-4" />
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold mb-4">Ubah Password</h2>
                  <div className="space-y-3">
                    <input type="password" placeholder="Password saat ini" value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                    <input type="password" placeholder="Password baru" value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                    <input type="password" placeholder="Konfirmasi password baru" value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                    <button onClick={handleUpdatePassword} disabled={saving}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                      <Lock className="w-4 h-4" />
                      {saving ? 'Memperbarui...' : 'Ubah Password'}
                    </button>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-bold text-red-500 mb-2">Zona Berbahaya</h3>
                  <p className="text-sm text-muted-foreground mb-3">Menghapus akun akan menghilangkan semua data Anda secara permanen.</p>
                  <button onClick={handleDeleteAccount}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Hapus Akun
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Notifikasi</h2>
                {['Notifikasi pesanan', 'Notifikasi promo', 'Notifikasi produk baru', 'Notifikasi email'].map((label, i) => (
                  <label key={i} className="flex items-center justify-between py-2">
                    <span className="text-sm">{label}</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-purple-500 text-purple-600" />
                  </label>
                ))}
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Tampilan</h2>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <div>
                      <p className="text-sm font-medium">Tema {theme === 'dark' ? 'Gelap' : 'Terang'}</p>
                      <p className="text-xs text-muted-foreground">Ubah tampilan website</p>
                    </div>
                  </div>
                  <button onClick={toggleTheme}
                    className="relative w-12 h-6 bg-purple-600 rounded-full transition-colors">
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
