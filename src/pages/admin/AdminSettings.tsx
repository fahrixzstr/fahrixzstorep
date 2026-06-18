import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save } from 'lucide-react';
import useStore from '@/stores/useStore';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { siteConfig, setSiteConfig } = useStore();
  const [config, setConfig] = useState({ ...siteConfig });

  const handleSave = () => {
    setSiteConfig(config);
    toast.success('Pengaturan disimpan');
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Pengaturan
        </h1>
        <button onClick={handleSave}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm transition-colors">
          <Save className="w-4 h-4" />
          Simpan
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-bold mb-4">Informasi Toko</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nama Toko</label>
              <input type="text" value={config.siteName}
                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email Kontak</label>
              <input type="email" value={config.contactEmail}
                onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Telepon</label>
              <input type="text" value={config.contactPhone}
                onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Refund Policy (hari)</label>
              <input type="number" value={config.refundPolicyDays}
                onChange={(e) => setConfig({ ...config, refundPolicyDays: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-bold mb-4">Konfigurasi</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Komisi Affiliate (%)</label>
              <input type="number" value={config.affiliateCommission}
                onChange={(e) => setConfig({ ...config, affiliateCommission: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Download Limit Default</label>
              <input type="number" value={config.downloadLimitDefault}
                onChange={(e) => setConfig({ ...config, downloadLimitDefault: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Link Expiry (hari)</label>
              <input type="number" value={config.linkExpiryDays}
                onChange={(e) => setConfig({ ...config, linkExpiryDays: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <h2 className="font-bold mb-4">Fitur</h2>
          {[
            { key: 'enableRegistration', label: 'Registrasi' },
            { key: 'enableSocialLogin', label: 'Social Login' },
            { key: 'enableAffiliate', label: 'Affiliate' },
            { key: 'enableSubscription', label: 'Subscription' },
            { key: 'enable2FA', label: '2FA Admin' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between py-2">
              <span className="text-sm">{label}</span>
              <input
                type="checkbox"
                checked={config[key as keyof typeof config] as boolean}
                onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
                className="w-4 h-4 rounded border-purple-500 text-purple-600"
              />
            </label>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
