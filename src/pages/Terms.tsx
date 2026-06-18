import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold">Syarat & Ketentuan</h1>
        </div>

        <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
          <section>
            <h2 className="text-lg font-bold text-foreground">1. Ketentuan Umum</h2>
            <p>Dengan mengakses dan menggunakan FahriXz Store, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak menyetujui, harap tidak menggunakan layanan kami.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">2. Produk Digital</h2>
            <p>Semua produk yang dijual di FahriXz Store adalah produk digital. Tidak ada pengiriman fisik. Produk dikirim melalui email atau tersedia di halaman Library setelah pembayaran.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">3. Pembayaran</h2>
            <p>Pembayaran dilakukan melalui gateway Faspay. Semua transaksi aman dan terenkripsi. Harga yang tertera sudah termasuk pajak jika ada.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">4. Pengiriman & Akses</h2>
            <p>Produk akan tersedia setelah pembayaran berhasil diverifikasi. Link download aktif selama 7 hari dengan batas download sesuai ketentuan produk.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">5. Refund & Pembatalan</h2>
            <p>Pengajuan refund dapat dilakukan dalam 7 hari setelah pembelian dengan alasan yang valid. Refund akan diproses dalam 3-7 hari kerja.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">6. Lisensi</h2>
            <p>Setiap produk memiliki ketentuan lisensi masing-masing. Pengguna wajib mematuhi ketentuan lisensi yang berlaku.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">7. Privasi</h2>
            <p>Kami menghargai privasi Anda. Data pribadi dilindungi sesuai kebijakan privasi kami.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">8. Perubahan Ketentuan</h2>
            <p>Kami berhak mengubah syarat dan ketentuan sewaktu-waktu. Perubahan akan diinformasikan melalui website.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
