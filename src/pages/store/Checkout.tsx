import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Gift, Tag, ArrowLeft, Shield } from 'lucide-react';
import useStore from '@/stores/useStore';
import { orderService, voucherService } from '@/services/firestore';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, user, clearCart } = useStore();
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isGift, setIsGift] = useState(false);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getCartTotal();
  const total = subtotal - discount;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Keranjang Kosong</h2>
          <p className="text-muted-foreground mb-4">Tambahkan produk terlebih dahulu</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl"
          >
            Belanja Sekarang
          </button>
        </div>
      </div>
    );
  }

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    try {
      const voucher = await voucherService.validateVoucher(voucherCode, subtotal);
      if (voucher) {
        const discountAmount = voucher.type === 'percentage'
          ? Math.min((subtotal * voucher.value) / 100, voucher.maxDiscount || Infinity)
          : voucher.value;
        setDiscount(discountAmount);
        toast.success(`Voucher berhasil! Diskon Rp ${discountAmount.toLocaleString('id-ID')}`);
      } else {
        toast.error('Voucher tidak valid atau sudah kadaluarsa');
        setDiscount(0);
      }
    } catch {
      toast.error('Gagal memvalidasi voucher');
    }
  };

  const handleCheckout = async () => {
    if (isGift && !giftEmail) {
      toast.error('Masukkan email penerima hadiah');
      return;
    }

    setIsProcessing(true);
    try {
      const invoiceNumber = orderService.generateInvoice();

      // Create order in Firestore
      const orderData = {
        invoiceNumber,
        userId: user?.uid || 'guest',
        userEmail: isGift ? giftEmail : (user?.email || ''),
        userName: user?.displayName || 'Guest',
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.coverImages[0] || '',
          price: item.product.discountPrice || item.product.price,
          quantity: item.quantity,
        })),
        subtotal,
        discount,
        voucherCode: voucherCode || null,
        total,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        paymentMethod: 'faspay',
        paymentUrl: null,
        transactionId: null,
        isGift,
        giftEmail: isGift ? giftEmail : null,
        giftMessage: isGift ? giftMessage : null,
        giftRedeemed: false,
        giftRedeemedAt: null,
        giftRedeemedBy: null,
        fraudFlag: false,
        fraudReason: null,
        emailSent: false,
        createdAt: new Date(),
        paidAt: null,
        completedAt: null,
        downloadExpiry: null,
      };

      const orderId = await orderService.createOrder(orderData);

      // Send order confirmation email via EmailJS
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_vbwh3ip',
          import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID || 'template_u0j2bvh',
          {
            customer_name: user?.displayName || 'Pelanggan',
            customer_email: isGift ? giftEmail : (user?.email || ''),
            order_id: invoiceNumber,
            product_name: cart.map((item) => item.product.name).join(', '),
            price: `Rp ${total.toLocaleString('id-ID')}`,
            download_link: `${window.location.origin}/orders`,
            order_date: new Date().toLocaleString('id-ID'),
            website_name: 'FahriXz Store',
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'g8pXvoSYyGzCMg0vo'
        );
      } catch (emailError) {
        console.error('EmailJS error:', emailError);
        // Continue even if email fails
      }

      // Redirect to Faspay payment
      // In production, this would redirect to Faspay payment page
      toast.success('Order berhasil dibuat! Mengalihkan ke pembayaran...');

      // For now, simulate payment success
      setTimeout(() => {
        clearCart();
        navigate(`/payment/success?order_id=${orderId}&invoice=${invoiceNumber}`);
      }, 2000);

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Gagal memproses checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Keranjang
      </button>

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Items */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-bold mb-4">Produk yang Dibeli</h2>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <img
                    src={item.product.coverImages[0] || '/placeholder-product.png'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.product.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity}x Rp {(item.product.discountPrice || item.product.price).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <p className="text-sm font-bold">
                    Rp {((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-bold mb-3">Email</h2>
            <input
              type="email"
              value={isGift ? giftEmail : (user?.email || '')}
              onChange={(e) => isGift ? setGiftEmail(e.target.value) : null}
              readOnly={!isGift}
              placeholder="Email untuk pengiriman produk"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {isGift
                ? 'Produk akan dikirim ke email penerima'
                : 'Produk akan dikirim ke email ini setelah pembayaran'}
            </p>
          </div>

          {/* Voucher */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-bold mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Kode Voucher
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Masukkan kode voucher"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm uppercase"
              />
              <button
                onClick={handleApplyVoucher}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
              >
                Terapkan
              </button>
            </div>
            {discount > 0 && (
              <p className="text-sm text-green-600 mt-2">
                Diskon: Rp {discount.toLocaleString('id-ID')}
              </p>
            )}
          </div>

          {/* Gift Option */}
          <div className="bg-card border border-border rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
                className="w-4 h-4 rounded border-purple-500 text-purple-600"
              />
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Beli sebagai Hadiah</span>
              </div>
            </label>
            {isGift && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 space-y-3"
              >
                <input
                  type="email"
                  value={giftEmail}
                  onChange={(e) => setGiftEmail(e.target.value)}
                  placeholder="Email penerima hadiah"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                />
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Pesan personal (opsional)"
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div>
          <div className="bg-card border border-border rounded-xl p-6 sticky top-4">
            <h2 className="font-bold mb-4">Ringkasan Pembayaran</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon</span>
                  <span>-Rp {discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Total Pembayaran</span>
                <span className="text-purple-600 dark:text-purple-400 text-lg">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Metode Pembayaran</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Pembayaran via Faspay Payment Gateway
              </p>
              <div className="flex gap-2 mt-2">
                {['Transfer Bank', 'E-Wallet', 'QRIS', 'Kartu Kredit'].map((method) => (
                  <span key={method} className="text-xs px-2 py-1 bg-white dark:bg-black rounded border border-border">
                    {method}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Bayar Sekarang
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              Pembayaran aman & terenkripsi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
