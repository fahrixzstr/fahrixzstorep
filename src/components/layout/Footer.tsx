import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Shield, CreditCard, Headphones, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      {/* Features Bar */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: 'Garansi 7 Hari', desc: 'Uang kembali jika tidak puas' },
              { icon: CreditCard, title: 'Pembayaran Aman', desc: 'Enkripsi SSL 256-bit' },
              { icon: Headphones, title: 'Support 24/7', desc: 'Tim siap membantu' },
              { icon: Lock, title: 'Produk Original', desc: '100% asli & berlisensi' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-bold">FahriXz Store</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Marketplace produk digital terpercaya. Temukan software, template, dan asset digital berkualitas.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>fahriandriansaputraa@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>085609949819</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Kab. Tanggamus, Lampung</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-3">Produk</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-purple-500 transition-colors">Semua Produk</Link></li>
              <li><Link to="/products?category=software" className="hover:text-purple-500 transition-colors">Software</Link></li>
              <li><Link to="/products?category=template" className="hover:text-purple-500 transition-colors">Template</Link></li>
              <li><Link to="/products?category=ebook" className="hover:text-purple-500 transition-colors">E-Book</Link></li>
              <li><Link to="/products?category=course" className="hover:text-purple-500 transition-colors">Kursus</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3">Bantuan</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-purple-500 transition-colors">FAQ</Link></li>
              <li><Link to="/support" className="hover:text-purple-500 transition-colors">Support</Link></li>
              <li><Link to="/contact" className="hover:text-purple-500 transition-colors">Kontak</Link></li>
              <li><Link to="/terms" className="hover:text-purple-500 transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link to="/privacy" className="hover:text-purple-500 transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3">Akun</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/login" className="hover:text-purple-500 transition-colors">Masuk</Link></li>
              <li><Link to="/register" className="hover:text-purple-500 transition-colors">Daftar</Link></li>
              <li><Link to="/dashboard" className="hover:text-purple-500 transition-colors">Dashboard</Link></li>
              <li><Link to="/orders" className="hover:text-purple-500 transition-colors">Pesanan Saya</Link></li>
              <li><Link to="/settings" className="hover:text-purple-500 transition-colors">Pengaturan</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FahriXz Store. NIB: 3105260037127. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>NIB: 3105260037127</span>
            <span>|</span>
            <span>KBLI: 63122</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
