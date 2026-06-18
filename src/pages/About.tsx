import { motion } from 'framer-motion';
import { Shield, Zap, Headphones, Lock, Award, Globe } from 'lucide-react';

export default function About() {
  const features = [
    { icon: Shield, title: 'Aman & Terpercaya', desc: 'Semua transaksi dilindungi enkripsi SSL dan verifikasi keamanan.' },
    { icon: Zap, title: 'Pengiriman Instan', desc: 'Produk digital dikirim otomatis ke email dalam hitungan detik.' },
    { icon: Headphones, title: 'Support 24/7', desc: 'Tim support siap membantu kapan saja via chat dan email.' },
    { icon: Lock, title: 'Garansi 7 Hari', desc: 'Uang kembali 100% jika produk tidak sesuai deskripsi.' },
    { icon: Award, title: 'Produk Original', desc: 'Semua produk 100% asli Tanps Ada Kendala' },
    { icon: Globe, title: 'Akses Global', desc: 'Akses produk Anda dari mana saja di dunia.' },
  ];

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-4 text-center">Tentang FahriXz Store</h1>
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          FahriXz Store adalah marketplace produk digital terpercaya yang menyediakan software, template, e-book, dan berbagai produk digital berkualitas.
        </p>

        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-3">Informasi Usaha</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nama Pelaku Usaha</p>
              <p className="font-medium">Fahri Andrian Saputra</p>
            </div>
            <div>
              <p className="text-muted-foreground">NIB</p>
              <p className="font-medium">3105260037127</p>
            </div>
            <div>
              <p className="text-muted-foreground">KBLI</p>
              <p className="font-medium">63122 - Portal Web dan/atau Platform Digital dengan Tujuan Komersial</p>
            </div>
            <div>
              <p className="text-muted-foreground">Lokasi</p>
              <p className="font-medium">Kab. Tanggamus, Provinsi Lampung</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <feature.icon className="w-8 h-8 text-purple-500 mb-3" />
              <h3 className="font-medium mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
