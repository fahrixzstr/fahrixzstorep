import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Mail, ArrowLeft, Package } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const invoice = searchParams.get('invoice');

  useEffect(() => {
    // Send confirmation email via EmailJS
    const sendEmail = async () => {
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_vbwh3ip',
          import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID || 'template_u0j2bvh',
          {
            customer_name: 'Pelanggan',
            customer_email: '',
            order_id: invoice || orderId,
            product_name: 'Produk Digital',
            price: '',
            download_link: `${window.location.origin}/orders`,
            order_date: new Date().toLocaleString('id-ID'),
            website_name: 'FahriXz Store',
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'g8pXvoSYyGzCMg0vo'
        );
      } catch (error) {
        console.error('EmailJS error:', error);
      }
    };
    sendEmail();
  }, [orderId, invoice]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-500" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h1>
        <p className="text-muted-foreground mb-2">
          Terima kasih atas pembelian Anda. Pesanan sedang diproses.
        </p>
        {invoice && (
          <p className="text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg inline-block mb-6">
            Invoice: {invoice}
          </p>
        )}

        <div className="bg-card border border-border rounded-xl p-4 mb-6 text-left">
          <h3 className="font-medium mb-3">Apa yang terjadi selanjutnya?</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-purple-500 mt-0.5" />
              <span>Email konfirmasi dengan link download akan dikirim ke email Anda</span>
            </li>
            <li className="flex items-start gap-3">
              <Download className="w-4 h-4 text-purple-500 mt-0.5" />
              <span>Akses semua pembelian Anda di halaman Library</span>
            </li>
            <li className="flex items-start gap-3">
              <Package className="w-4 h-4 text-purple-500 mt-0.5" />
              <span>Link download aktif selama 7 hari</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-colors"
          >
            <Package className="w-4 h-4" />
            Lihat Pesanan Saya
          </Link>
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 border border-border hover:bg-muted py-3 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Lanjutkan Belanja
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
